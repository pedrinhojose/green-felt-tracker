
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Game, GamePlayer } from "@/lib/db/models";

export function usePlayerStatsActions(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const { updateGame } = usePoker();
  const { toast } = useToast();
  const { activeSeason } = usePoker();
  
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
