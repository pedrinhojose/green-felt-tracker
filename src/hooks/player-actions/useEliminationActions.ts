
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Game } from "@/lib/db/models";

export function useEliminationActions(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const { updateGame } = usePoker();
  const { toast } = useToast();
  
  // Player elimination function
  const eliminatePlayer = async (playerId: string) => {
    if (!game) return;
    
    try {
      // Count already eliminated players to determine current position
      const eliminatedPlayersCount = game.players.filter(p => p.isEliminated).length;
      const totalPlayers = game.players.length;
      
      // Calculate position automatically (totalPlayers - eliminatedPlayersCount)
      // Example: in a game with 7 players, first eliminated gets 7th place
      const position = totalPlayers - eliminatedPlayersCount;
      
      // Update player position and elimination status
      const updatedPlayers = game.players.map(player => {
        if (player.playerId === playerId) {
          return { ...player, position, isEliminated: true };
        }
        return player;
      });
      
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
        title: "Jogador eliminado",
        description: `Posição final: ${position}º lugar`,
      });
      
      // Check if only one player remains (not eliminated)
      const remainingPlayers = updatedPlayers.filter(p => !p.isEliminated);
      
      // If exactly two players remain and one is being eliminated,
      // automatically set the last player as winner (1st place)
      if (remainingPlayers.length === 1) {
        // Auto-set the last player as winner (position 1)
        const winner = remainingPlayers[0];
        
        // Create a new player list with the winner set as 1st place
        const finalPlayers = updatedPlayers.map(player => {
          if (player.playerId === winner.playerId) {
            return { ...player, position: 1, isEliminated: true };
          }
          return player;
        });
        
        // Update game with defined winner
        await updateGame({
          id: game.id,
          players: finalPlayers,
        });
        
        // Update local state
        setGame(prev => {
          if (!prev) return null;
          return {
            ...prev,
            players: finalPlayers,
          };
        });
        
        toast({
          title: "Partida finalizada!",
          description: "Um vencedor foi determinado. Você pode encerrar a partida.",
        });
      }
    } catch (error) {
      console.error("Error eliminating player:", error);
      toast({
        title: "Erro",
        description: "Não foi possível eliminar o jogador.",
        variant: "destructive",
      });
    }
  };

  return { eliminatePlayer };
}
