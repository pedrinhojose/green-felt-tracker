
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Game, GamePlayer } from "@/lib/db/models";
import { useEffectiveSeason } from "@/hooks/useEffectiveSeason";

export function useStartGame(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const { updateGame, players } = usePoker();
  const { toast } = useToast();
  const effectiveSeason = useEffectiveSeason(game);

  const handleStartGame = async (selectedPlayers: Set<string>) => {
    if (!game || selectedPlayers.size === 0) return;

    try {
      if (!effectiveSeason) {
        toast({
          title: "Erro",
          description: game?.isStandalone
            ? "Configuração da partida avulsa ausente."
            : "Não há temporada ativa. Configure uma temporada antes de iniciar uma partida.",
          variant: "destructive",
        });
        return false;
      }

      const selectedArray = Array.from(selectedPlayers);
      const uniqueIds = new Set(selectedArray);

      if (uniqueIds.size !== selectedArray.length) {
        toast({
          title: "Erro",
          description: "Há jogadores duplicados na seleção. Selecione cada jogador apenas uma vez.",
          variant: "destructive",
        });
        return false;
      }

      const gamePlayers: GamePlayer[] = Array.from(selectedPlayers).map(playerId => ({
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
      }));

      const buyInAmount = effectiveSeason.financialParams.buyIn || 0;
      const jackpotContribution = effectiveSeason.financialParams.jackpotContribution || 0;
      const initialPrizePool = (buyInAmount - jackpotContribution) * gamePlayers.length;

      await updateGame({
        id: game.id,
        players: gamePlayers,
        totalPrizePool: initialPrizePool,
      });

      setGame(prev => prev ? { ...prev, players: gamePlayers, totalPrizePool: initialPrizePool } : null);

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

  return { handleStartGame };
}
