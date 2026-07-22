
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Game, GamePlayer } from "@/lib/db/models";
import { useEffectiveSeason } from "@/hooks/useEffectiveSeason";

export function useLatePlayerActions(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const { updateGame } = usePoker();
  const { toast } = useToast();
  const effectiveSeason = useEffectiveSeason(game);

  const addLatePlayer = async (playerId: string) => {
    if (!game || !effectiveSeason) return false;

    try {
      const isAlreadyInGame = game.players.some(player => player.playerId === playerId);
      if (isAlreadyInGame) {
        toast({
          title: "Jogador já está na partida",
          description: "Este jogador já foi adicionado à partida atual.",
          variant: "destructive",
        });
        return false;
      }

      const buyInAmount = effectiveSeason.financialParams.buyIn || 0;
      const jackpotContribution = effectiveSeason.financialParams.jackpotContribution || 0;
      const prizeContribution = buyInAmount - jackpotContribution;

      const newGamePlayer: GamePlayer = {
        id: `${playerId}-${Date.now()}`,
        playerId,
        position: null,
        buyIn: true,
        rebuys: 0,
        addons: 0,
        joinedDinner: false,
        participatesInClubFund: false,
        isEliminated: false,
        prize: 0,
        points: 0,
        balance: 0,
        clubFundContribution: 0,
      };

      const updatedPlayers = [...game.players, newGamePlayer];
      const updatedPrizePool = game.totalPrizePool + prizeContribution;

      await updateGame({
        id: game.id,
        players: updatedPlayers,
        totalPrizePool: updatedPrizePool,
      });

      setGame(prev => prev ? { ...prev, players: updatedPlayers, totalPrizePool: updatedPrizePool } : null);

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
