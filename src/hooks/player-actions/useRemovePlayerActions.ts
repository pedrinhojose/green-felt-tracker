
import { useToast } from "@/components/ui/use-toast";
import { usePoker } from "@/contexts/PokerContext";
import { Game, GamePlayer } from "@/lib/db/models";

export function useRemovePlayerActions(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const { toast } = useToast();
  const { updateGame } = usePoker();

  const removePlayer = async (playerId: string) => {
    if (!game) return false;

    try {
      console.log("Removendo jogador:", playerId);
      
      const playerToRemove = game.players.find(p => p.playerId === playerId);
      if (!playerToRemove) {
        toast({
          title: "Erro",
          description: "Jogador não encontrado na partida.",
          variant: "destructive",
        });
        return false;
      }

      // Verificar se o jogador já tem prêmios distribuídos
      if (playerToRemove.prize > 0) {
        toast({
          title: "Não é possível remover",
          description: "Este jogador já tem prêmios distribuídos. Use 'Eliminar' em vez de remover.",
          variant: "destructive",
        });
        return false;
      }

      // Calcular quanto o jogador contribuiu para o prize pool
      const buyInValue = game.totalPrizePool / game.players.filter(p => p.buyIn).length || 0;
      const rebuyValue = buyInValue; // Assumindo que rebuy tem o mesmo valor do buy-in
      const addonValue = buyInValue * 0.5; // Assumindo que addon vale metade do buy-in

      let contributionToRemove = 0;
      if (playerToRemove.buyIn) contributionToRemove += buyInValue;
      contributionToRemove += playerToRemove.rebuys * rebuyValue;
      contributionToRemove += playerToRemove.addons * addonValue;

      // Remover o jogador da lista
      const updatedPlayers = game.players.filter(p => p.playerId !== playerId);
      
      // Atualizar o prize pool
      const newTotalPrizePool = Math.max(0, game.totalPrizePool - contributionToRemove);

      const updatedGame: Game = {
        ...game,
        players: updatedPlayers,
        totalPrizePool: newTotalPrizePool
      };

      // Atualizar no banco de dados
      await updateGame(updatedGame);
      
      // Atualizar estado local
      setGame(updatedGame);

      toast({
        title: "Jogador removido",
        description: "O jogador foi removido da partida com sucesso.",
      });

      return true;
    } catch (error) {
      console.error("Erro ao remover jogador:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o jogador da partida.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    removePlayer
  };
}
