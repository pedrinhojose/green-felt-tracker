
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Game } from "@/lib/db/models";
import { supabase } from "@/integrations/supabase/client";
import { calculateEliminationRewards } from "@/hooks/useEliminationRewards";

export function usePrizeDistribution(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const { updateGame } = usePoker();
  const { toast } = useToast();
  const { activeSeason } = usePoker(); // Move this hook call to the top level

  // Calcular saldo do jogador (função duplicada de usePlayerStatsActions para manter a consistência)
  const calculatePlayerBalance = (player, dinnerCost, dinnerParticipants) => {
    if (!activeSeason) return 0;
    
    const buyInCost = player.buyIn ? activeSeason.financialParams.buyIn : 0;
    const rebuysCost = player.rebuys * activeSeason.financialParams.rebuy;
    const addonsCost = player.addons * activeSeason.financialParams.addon;
    
    // Calcular custo da janta
    const dinnerCostShare = player.joinedDinner && dinnerCost && dinnerParticipants > 0 ? 
      dinnerCost / dinnerParticipants : 0;
    
    // Calcular contribuição da caixinha (apenas para quem participa)
    const clubFundCost = player.participatesInClubFund && activeSeason.financialParams.clubFundContribution > 0 ? 
      activeSeason.financialParams.clubFundContribution : 0;
    
    // Calcular saldo (prêmio - custos - caixinha)
    return player.prize - (buyInCost + rebuysCost + addonsCost + dinnerCostShare + clubFundCost);
  };

  // Dinner cost calculation
  const calculateDinnerCosts = async (dinnerCostValue: number) => {
    if (!game) return;
    
    // Count players who joined dinner
    const dinnerParticipants = game.players.filter(player => player.joinedDinner);
    
    if (dinnerParticipants.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhum jogador participou da janta.",
      });
      return;
    }
    
    // Update players with dinner cost in their balance
    const updatedPlayers = game.players.map(player => {
      // Calcular contribuição da caixinha para cada jogador (apenas quem participa)
      const clubFundContribution = player.participatesInClubFund && activeSeason?.financialParams.clubFundContribution > 0 ? 
        activeSeason.financialParams.clubFundContribution : 0;
      
      // Atualizar o saldo com o novo custo da janta
      const balance = calculatePlayerBalance(
        player, 
        dinnerCostValue, 
        dinnerParticipants.length
      );
      
      return { ...player, balance, clubFundContribution };
    });
    
    // Update game
    await updateGame({
      id: game.id,
      players: updatedPlayers,
      dinnerCost: dinnerCostValue,
    });
    
    // Update local game state
    setGame(prev => {
      if (!prev) return null;
      return {
        ...prev,
        players: updatedPlayers,
        dinnerCost: dinnerCostValue,
      };
    });
    
    toast({
      title: "Custo da janta atualizado",
      description: `R$ ${dinnerCostValue.toFixed(2)} dividido entre ${dinnerParticipants.length} jogadores.`,
    });
  };
  
  // Prize distribution
  const distributeWinningsByPrize = async () => {
    if (!game) return;
    
    try {
      if (!activeSeason) {
        toast({
          title: "Erro",
          description: "Temporada ativa não encontrada.",
          variant: "destructive",
        });
        return;
      }
      
      // Get player positions
      const playersWithPositions = game.players.filter(player => 
        player.isEliminated && player.position !== null
      ).sort((a, b) => (a.position || 999) - (b.position || 999));
      
      // Find players without positions
      const playersWithoutPositions = game.players.filter(player => 
        player.position === null
      );
      
      if (playersWithoutPositions.length > 0) {
        toast({
          title: "Aviso",
          description: "Alguns jogadores ainda não têm posição definida.",
          variant: "destructive",
        });
        return;
      }
      
      // Get prize schema from active season
      const prizeSchema = activeSeason.weeklyPrizeSchema;
      
      // Calculate prizes
      const updatedPlayers = [...game.players];
      
      // Não precisamos deduzir novamente a contribuição do jackpot, pois isso já foi feito
      // no cálculo inicial do totalPrizePool em usePlayerStatsActions.ts
      const distributablePrize = game.totalPrizePool;
      
      // Apply prize schema
      for (const player of updatedPlayers) {
        if (player.position === null) continue;
        
        // Find matching prize entry
        const prizeEntry = prizeSchema.find(entry => entry.position === player.position);
        if (prizeEntry) {
          // Calculate prize using the distributablePrize
          player.prize = (distributablePrize * prizeEntry.percentage) / 100;
        } else {
          // No prize for positions outside schema
          player.prize = 0;
        }
      }
      
      // Count eliminations per player for this game (for elimination-reward points)
      const eliminationsByPlayer: Record<string, number> = {};
      try {
        const { data: elimRows } = await supabase
          .from('eliminations')
          .select('eliminator_player_id')
          .eq('game_id', game.id);
        (elimRows || []).forEach((row) => {
          const eid = row.eliminator_player_id;
          if (!eid) return;
          eliminationsByPlayer[eid] = (eliminationsByPlayer[eid] || 0) + 1;
        });
      } catch (err) {
        console.error('Error loading eliminations for points calculation:', err);
      }

      const elimConfig = activeSeason.eliminationRewardConfig;

      // Calculate points based on score schema + elimination rewards
      for (const player of updatedPlayers) {
        if (player.position === null) {
          player.pointsFromPosition = 0;
          player.pointsFromEliminations = 0;
          player.points = 0;
          continue;
        }

        // Points from position
        const scoreEntry = activeSeason.scoreSchema.find(entry => entry.position === player.position);
        const positionPoints = scoreEntry ? scoreEntry.points : 0;

        // Points from eliminations (only when reward is enabled and type === 'points')
        const playerElims = eliminationsByPlayer[player.playerId] || 0;
        const elimResult = calculateEliminationRewards(playerElims, elimConfig);
        const elimPoints = elimResult.type === 'points' ? elimResult.value : 0;

        player.pointsFromPosition = positionPoints;
        player.pointsFromEliminations = elimPoints;
        player.points = positionPoints + elimPoints;
      }
      
      // Contar participantes da janta para calcular o custo por pessoa
      const dinnerParticipants = updatedPlayers.filter(p => p.joinedDinner).length;
      
      // Calculate balances
      for (const player of updatedPlayers) {
        // Calcular contribuição da caixinha para cada jogador (apenas quem participa)
        player.clubFundContribution = player.participatesInClubFund && activeSeason?.financialParams.clubFundContribution > 0 ? 
          activeSeason.financialParams.clubFundContribution : 0;
        
        player.balance = calculatePlayerBalance(
          player,
          game.dinnerCost,
          dinnerParticipants
        );
      }
      
      // Update game
      await updateGame({
        id: game.id,
        players: updatedPlayers,
      });
      
      // Update local game state
      setGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: updatedPlayers,
        };
      });
      
      toast({
        title: "Premiação distribuída",
        description: "Prêmios e pontuação calculados para todos os jogadores.",
      });
    } catch (error) {
      console.error("Error distributing prizes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível distribuir os prêmios.",
        variant: "destructive",
      });
    }
  };

  return {
    calculateDinnerCosts,
    distributeWinningsByPrize
  };
}
