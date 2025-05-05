
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Game, GamePlayer } from "@/lib/db/models";

export function usePlayerActions(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const { updateGame } = usePoker();
  const { toast } = useToast();
  const { activeSeason } = usePoker(); // Movido para o nível superior do hook

  // Player selection handlers
  const handleStartGame = async (selectedPlayers: Set<string>) => {
    if (!game || selectedPlayers.size === 0) return;
    
    try {
      // Usamos o activeSeason que já foi obtido no nível superior
      if (!activeSeason) {
        toast({
          title: "Erro",
          description: "Não há temporada ativa. Configure uma temporada antes de iniciar uma partida.",
          variant: "destructive",
        });
        return false;
      }
      
      // Create game players array from selected player IDs
      const gamePlayers: GamePlayer[] = Array.from(selectedPlayers).map(playerId => ({
        id: `${playerId}-${Date.now()}`,
        playerId,
        position: null,
        buyIn: true,
        rebuys: 0,
        addons: 0,
        joinedDinner: false,
        isEliminated: false,
        prize: 0,
        points: 0,
        balance: 0,
      }));
      
      // Calculate initial prize pool (buy-ins)
      const buyInAmount = activeSeason?.financialParams.buyIn || 0;
      const initialPrizePool = buyInAmount * gamePlayers.length;
      
      // Update game with players and prize pool
      await updateGame({
        id: game.id,
        players: gamePlayers,
        totalPrizePool: initialPrizePool,
      });
      
      // Update local game state
      setGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: gamePlayers,
          totalPrizePool: initialPrizePool,
        };
      });
      
      toast({
        title: "Partida iniciada",
        description: `${gamePlayers.length} jogadores selecionados`,
      });

      return true;
    } catch (error) {
      console.error("Error starting game:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a partida.",
        variant: "destructive",
      });
      return false;
    }
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
      const { activeSeason } = usePoker();
      
      if (activeSeason) {
        const { buyIn, rebuy, addon } = activeSeason.financialParams;
        
        // Add up all buy-ins, rebuys, and add-ons
        for (const player of updatedPlayers) {
          if (player.buyIn) {
            totalPrizePool += buyIn;
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

  return {
    handleStartGame,
    updatePlayerStats,
    eliminatePlayer
  };
}
