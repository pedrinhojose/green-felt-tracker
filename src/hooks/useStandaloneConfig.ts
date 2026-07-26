import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Game, StandaloneGameConfig } from "@/lib/db/models";

/**
 * Aplica (ou corrige) a configuração financeira de uma partida avulsa,
 * recalculando pote total, prêmios e saldos com os contadores já existentes.
 */
export function useStandaloneConfig(
  game: Game | null,
  setGame: React.Dispatch<React.SetStateAction<Game | null>>
) {
  const { updateGame } = usePoker();
  const { toast } = useToast();

  const applyConfig = async (config: StandaloneGameConfig) => {
    if (!game) return false;

    try {
      const { buyIn, rebuy, addon } = config;
      const schema = config.weeklyPrizeSchema ?? [];

      // Recalcular pote total (avulsa não desconta jackpot)
      let totalPrizePool = 0;
      for (const p of game.players) {
        if (p.buyIn) totalPrizePool += buyIn;
        totalPrizePool += rebuy * p.rebuys;
        totalPrizePool += addon * p.addons;
      }

      const dinnerParticipants = game.players.filter(p => p.joinedDinner).length;
      const allHavePosition = game.players.length > 0 && game.players.every(p => p.position !== null);

      const updatedPlayers = game.players.map(p => {
        // Só recalcula prêmio se todas as posições já estiverem definidas
        let prize = p.prize;
        if (allHavePosition) {
          const entry = schema.find(e => e.position === p.position);
          prize = entry ? (totalPrizePool * entry.percentage) / 100 : 0;
        }

        const dinnerShare = p.joinedDinner && game.dinnerCost && dinnerParticipants > 0
          ? game.dinnerCost / dinnerParticipants
          : 0;

        const cost = (p.buyIn ? buyIn : 0) + p.rebuys * rebuy + p.addons * addon + dinnerShare;

        return { ...p, prize, balance: prize - cost, clubFundContribution: 0 };
      });

      await updateGame({
        id: game.id,
        standaloneConfig: config,
        players: updatedPlayers,
        totalPrizePool,
      });

      setGame(prev => prev ? { ...prev, standaloneConfig: config, players: updatedPlayers, totalPrizePool } : null);

      toast({
        title: "Configuração aplicada",
        description: config.source === 'season'
          ? `Valores herdados de ${config.sourceSeasonName ?? 'temporada ativa'}. Pote e saldos recalculados.`
          : "Valores atualizados. Pote e saldos recalculados.",
      });
      return true;
    } catch (error) {
      console.error("Error applying standalone config:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aplicar a configuração da partida.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { applyConfig };
}
