
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Game, GamePlayer } from "@/lib/db/models";

export function useLatePlayerActions(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const { updateGame } = usePoker();
  const { toast } = useToast();
  const { activeSeason } = usePoker();
  
  // Adicionar jogador tardio à partida
  const addLatePlayer = async (playerId: string) => {
    if (!game || !activeSeason) return false;
    
    try {
      // Verificar se o jogador já está na partida
      const isAlreadyInGame = game.players.some(player => player.playerId === playerId);
      
      if (isAlreadyInGame) {
        toast({
          title: "Jogador já está na partida",
          description: "Este jogador já foi adicionado à partida atual.",
          variant: "destructive",
        });
        return false;
      }
      
      const buyInAmount = activeSeason?.financialParams.buyIn || 0;
      const jackpotContribution = activeSeason?.financialParams.jackpotContribution || 0;
      // Desconta a contribuição do jackpot do prêmio adicionado
      const prizeContribution = buyInAmount - jackpotContribution;
      
      // Criar novo jogador
      const newGamePlayer: GamePlayer = {
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
      };
      
      // Adicionar jogador à lista e atualizar prize pool
      const updatedPlayers = [...game.players, newGamePlayer];
      const updatedPrizePool = game.totalPrizePool + prizeContribution;
      
      // Atualizar jogo no banco de dados
      await updateGame({
        id: game.id,
        players: updatedPlayers,
        totalPrizePool: updatedPrizePool,
      });
      
      // Atualizar estado local
      setGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: updatedPlayers,
          totalPrizePool: updatedPrizePool,
        };
      });
      
      toast({
        title: "Jogador adicionado",
        description: "Jogador adicionado com sucesso à partida",
      });
      
      return true;
    } catch (error) {
      console.error("Error adding late player:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o jogador à partida.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { addLatePlayer };
}
