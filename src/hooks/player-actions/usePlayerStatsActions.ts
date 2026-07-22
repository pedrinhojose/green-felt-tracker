
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Game, GamePlayer } from "@/lib/db/models";
import { useEffectiveSeason } from "@/hooks/useEffectiveSeason";

export function usePlayerStatsActions(game: Game | null, setGame: React.Dispatch<React.SetStateAction<Game | null>>) {
  const { updateGame } = usePoker();
  const { toast } = useToast();
  const effectiveSeason = useEffectiveSeason(game);

  const calculatePlayerBalance = (player: GamePlayer, dinnerCost: number | undefined, dinnerParticipants: number): number => {
    if (!effectiveSeason) return 0;

    const buyInCost = player.buyIn ? effectiveSeason.financialParams.buyIn : 0;
    const rebuysCost = player.rebuys * effectiveSeason.financialParams.rebuy;
    const addonsCost = player.addons * effectiveSeason.financialParams.addon;

    const dinnerCostShare = player.joinedDinner && dinnerCost && dinnerParticipants > 0
      ? dinnerCost / dinnerParticipants : 0;

    const clubFundCost = player.participatesInClubFund && effectiveSeason.financialParams.clubFundContribution > 0
      ? effectiveSeason.financialParams.clubFundContribution : 0;

    return player.prize - (buyInCost + rebuysCost + addonsCost + dinnerCostShare + clubFundCost);
  };

  const updatePlayerStats = async (playerId: string, field: keyof GamePlayer, value: any) => {
    if (!game) return;

    try {
      const updatedPlayers = game.players.map(player => {
        if (player.playerId === playerId) return { ...player, [field]: value };
        return player;
      });

      let totalPrizePool = 0;
      if (effectiveSeason) {
        const { buyIn, rebuy, addon, jackpotContribution } = effectiveSeason.financialParams;
        for (const player of updatedPlayers) {
          if (player.buyIn) totalPrizePool += (buyIn - jackpotContribution);
          totalPrizePool += rebuy * player.rebuys;
          totalPrizePool += addon * player.addons;
        }
      }

      const dinnerParticipants = updatedPlayers.filter(p => p.joinedDinner).length;
      for (const player of updatedPlayers) {
        player.clubFundContribution = player.participatesInClubFund && effectiveSeason?.financialParams.clubFundContribution > 0
          ? effectiveSeason.financialParams.clubFundContribution : 0;
        player.balance = calculatePlayerBalance(player, game.dinnerCost, dinnerParticipants);
      }

      await updateGame({
        id: game.id,
        players: updatedPlayers,
        totalPrizePool,
      });

      setGame(prev => prev ? { ...prev, players: updatedPlayers, totalPrizePool } : null);
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
