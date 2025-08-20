
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Game } from "@/lib/db/models";
import { useEliminationData } from "@/hooks/elimination/useEliminationData";

export function useEliminationActions(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const { updateGame } = usePoker();
  const { toast } = useToast();
  const { saveElimination } = useEliminationData();
  
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

  // Player reactivation function
  const reactivatePlayer = async (playerId: string) => {
    if (!game) return;
    
    try {
      // Update player to remove elimination status and position
      const updatedPlayers = game.players.map(player => {
        if (player.playerId === playerId) {
          return { ...player, position: null, isEliminated: false };
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
        title: "Jogador reativado",
        description: "O jogador foi reintegrado à partida.",
      });
    } catch (error) {
      console.error("Error reactivating player:", error);
      toast({
        title: "Erro",
        description: "Não foi possível reativar o jogador.",
        variant: "destructive",
      });
    }
  };

  // Multiple player elimination function
  const eliminateMultiplePlayers = async (playerIds: string[], eliminatorId?: string) => {
    if (!game || playerIds.length === 0) return;
    
    try {
      // Count already eliminated players to determine current positions
      const eliminatedPlayersCount = game.players.filter(p => p.isEliminated).length;
      const totalPlayers = game.players.length;
      
      // Update players in batch
      const updatedPlayers = game.players.map(player => {
        if (playerIds.includes(player.playerId)) {
          // Calculate position for this elimination
          const currentEliminatedIndex = playerIds.indexOf(player.playerId);
          const position = totalPlayers - eliminatedPlayersCount - currentEliminatedIndex;
          return { ...player, position, isEliminated: true };
        }
        return player;
      });
      
      // Update game
      await updateGame({
        id: game.id,
        players: updatedPlayers,
      });
      
      // Save elimination records to Supabase
      const orgId = localStorage.getItem('currentOrganizationId');
      if (orgId) {
        for (const playerId of playerIds) {
          const playerData = updatedPlayers.find(p => p.playerId === playerId);
          if (playerData) {
            await saveElimination({
              game_id: game.id,
              eliminated_player_id: playerId,
              eliminator_player_id: eliminatorId || null,
              position: playerData.position || 0,
              elimination_time: new Date().toISOString(),
              organization_id: orgId
            });
          }
        }
      }
      
      // Update local game state
      setGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: updatedPlayers,
        };
      });
      
      toast({
        title: "Jogadores eliminados",
        description: `${playerIds.length} jogador(es) eliminado(s)`,
      });
      
      // Check if only one player remains (not eliminated)
      const remainingPlayers = updatedPlayers.filter(p => !p.isEliminated);
      
      if (remainingPlayers.length === 1) {
        // Auto-set the last player as winner (position 1)
        const winner = remainingPlayers[0];
        
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
      console.error("Error eliminating multiple players:", error);
      toast({
        title: "Erro",
        description: "Não foi possível eliminar os jogadores.",
        variant: "destructive",
      });
    }
  };

  return { eliminatePlayer, reactivatePlayer, eliminateMultiplePlayers };
}
