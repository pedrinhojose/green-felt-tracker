
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Game } from "@/lib/db/models";

export function usePrizeDistribution(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const { updateGame } = usePoker();
  const { toast } = useToast();

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
      if (player.joinedDinner) {
        // Add dinner cost to their balance calculation
        return { ...player };
      }
      return player;
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
      const { activeSeason } = usePoker();
      
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
      const totalPrize = game.totalPrizePool;
      
      // Apply prize schema
      for (const player of updatedPlayers) {
        if (player.position === null) continue;
        
        // Find matching prize entry
        const prizeEntry = prizeSchema.find(entry => entry.position === player.position);
        if (prizeEntry) {
          // Calculate prize
          player.prize = (totalPrize * prizeEntry.percentage) / 100;
        } else {
          // No prize for positions outside schema
          player.prize = 0;
        }
      }
      
      // Calculate points based on score schema
      for (const player of updatedPlayers) {
        if (player.position === null) continue;
        
        // Find matching score entry
        const scoreEntry = activeSeason.scoreSchema.find(entry => entry.position === player.position);
        if (scoreEntry) {
          player.points = scoreEntry.points;
        } else {
          player.points = 0;
        }
      }
      
      // Calculate balances
      for (const player of updatedPlayers) {
        const buyInCost = player.buyIn ? activeSeason.financialParams.buyIn : 0;
        const rebuysCost = player.rebuys * activeSeason.financialParams.rebuy;
        const addonsCost = player.addons * activeSeason.financialParams.addon;
        const dinnerCostShare = player.joinedDinner && game.dinnerCost ? 
          game.dinnerCost / game.players.filter(p => p.joinedDinner).length : 0;
        
        // Calculate balance (prize - costs)
        player.balance = player.prize - (buyInCost + rebuysCost + addonsCost + dinnerCostShare);
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
