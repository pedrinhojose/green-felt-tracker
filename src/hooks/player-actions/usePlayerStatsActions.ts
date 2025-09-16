
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Game, GamePlayer } from "@/lib/db/models";

export function usePlayerStatsActions(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const { updateGame } = usePoker();
  const { toast } = useToast();
  const { activeSeason } = usePoker();
  
  // Calcular saldo do jogador
  const calculatePlayerBalance = (player: GamePlayer, dinnerCost: number | undefined, dinnerParticipants: number): number => {
    if (!activeSeason) return 0;
    
    const buyInCost = player.buyIn ? activeSeason.financialParams.buyIn : 0;
    const rebuysCost = player.rebuys * activeSeason.financialParams.rebuy;
    const addonsCost = player.addons * activeSeason.financialParams.addon;
    
    // Calcular custo da janta
    const dinnerCostShare = player.joinedDinner && dinnerCost && dinnerParticipants > 0 ? 
      dinnerCost / dinnerParticipants : 0;
    
    // Calcular contribuição da caixinha (apenas se valor > 0)
    const clubFundCost = activeSeason.financialParams.clubFundContribution > 0 ? 
      activeSeason.financialParams.clubFundContribution : 0;
    
    // Calcular saldo (prêmio - custos - caixinha)
    return player.prize - (buyInCost + rebuysCost + addonsCost + dinnerCostShare + clubFundCost);
  };
  
  // Update player stats
  const updatePlayerStats = async (playerId: string, field: keyof GamePlayer, value: any) => {
    if (!game) return;
    
    try {
      const updatedPlayers = game.players.map(player => {
        if (player.playerId === playerId) {
          return { ...player, [field]: value };
        }
        return player;
      });
      
      // Calculate new prize pool
      let totalPrizePool = 0;
      
      if (activeSeason) {
        const { buyIn, rebuy, addon, jackpotContribution } = activeSeason.financialParams;
        
        // Add up all buy-ins, rebuys, and add-ons
        for (const player of updatedPlayers) {
          if (player.buyIn) {
            totalPrizePool += (buyIn - jackpotContribution); // Desconta a contribuição do jackpot
          }
          totalPrizePool += rebuy * player.rebuys;
          totalPrizePool += addon * player.addons;
        }
      }
      
      // Calcular os saldos atualizados
      const dinnerParticipants = updatedPlayers.filter(p => p.joinedDinner).length;
      for (const player of updatedPlayers) {
        // Calcular contribuição da caixinha para cada jogador
        player.clubFundContribution = activeSeason?.financialParams.clubFundContribution > 0 ? 
          activeSeason.financialParams.clubFundContribution : 0;
        
        // Apenas atualizar o saldo, mantendo o prêmio e pontos inalterados
        player.balance = calculatePlayerBalance(player, game.dinnerCost, dinnerParticipants);
      }
      
      // Update game
      await updateGame({
        id: game.id,
        players: updatedPlayers,
        totalPrizePool,
      });
      
      // Update local game state
      setGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: updatedPlayers,
          totalPrizePool,
        };
      });
    } catch (error) {
      console.error("Error updating player stats:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados do jogador.",
        variant: "destructive",
      });
    }
  };

  return { updatePlayerStats };
}
