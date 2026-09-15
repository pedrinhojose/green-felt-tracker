import { useMemo } from 'react';
import { useEliminationData } from './useEliminationData';
import { usePoker } from '@/contexts/PokerContext';
import { EliminationRewardConfig } from '@/lib/db/models';

export interface PlayerEliminationRewardSummary {
  playerId: string;
  eliminations: number;
  /** Recompensas devidas pela regra acumulada da temporada */
  rewardsEarned: number;
  /** Valor total das recompensas (pontos ou dinheiro) */
  rewardValue: number;
  /** Pontos por eliminação efetivamente creditados nas partidas */
  pointsCredited: number;
  /** Quantas eliminações faltam para a próxima recompensa */
  toNextReward: number;
}

export interface EliminationRewardsSummary {
  config?: EliminationRewardConfig;
  enabled: boolean;
  frequency: number;
  rewardValue: number;
  rewardType: 'points' | 'money';
  byPlayer: Record<string, PlayerEliminationRewardSummary>;
  ruleLabel: string;
  loading: boolean;
}

export function useEliminationRewardsSummary(seasonId?: string): EliminationRewardsSummary {
  const { eliminations, loading } = useEliminationData(seasonId);
  const { seasons, activeSeason, games } = usePoker();

  const season = useMemo(
    () => (seasonId ? seasons.find((s) => s.id === seasonId) ?? null : activeSeason),
    [seasonId, seasons, activeSeason]
  );

  return useMemo(() => {
    const config = season?.eliminationRewardConfig;
    const enabled = !!config?.enabled;
    const frequency = Math.max(1, config?.frequency ?? 1);
    const rewardValue = config?.rewardValue ?? 0;
    const rewardType = config?.rewardType ?? 'points';

    // Eliminações por jogador (feitas pelo jogador)
    const counts: Record<string, number> = {};
    eliminations.forEach((e) => {
      if (e.eliminator_player_id) {
        counts[e.eliminator_player_id] = (counts[e.eliminator_player_id] || 0) + 1;
      }
    });

    // Pontos por eliminação já creditados nas partidas finalizadas da temporada
    const credited: Record<string, number> = {};
    games
      .filter((g) => g.isFinished && !g.isStandalone && (!season?.id || g.seasonId === season.id))
      .forEach((g) => {
        g.players.forEach((gp) => {
          const value = gp.pointsFromEliminations ?? 0;
          if (value) credited[gp.playerId] = (credited[gp.playerId] || 0) + value;
        });
      });

    const playerIds = new Set([...Object.keys(counts), ...Object.keys(credited)]);
    const byPlayer: Record<string, PlayerEliminationRewardSummary> = {};

    playerIds.forEach((playerId) => {
      const total = counts[playerId] || 0;
      const rewardsEarned = enabled ? Math.floor(total / frequency) : 0;
      const remainder = total % frequency;

      byPlayer[playerId] = {
        playerId,
        eliminations: total,
        rewardsEarned,
        rewardValue: rewardsEarned * rewardValue,
        pointsCredited: credited[playerId] || 0,
        toNextReward: enabled ? frequency - remainder : 0,
      };
    });

    const ruleLabel = enabled
      ? rewardType === 'points'
        ? `${rewardValue} ${rewardValue === 1 ? 'ponto' : 'pontos'} a cada ${frequency} eliminações (acumulado na temporada)`
        : `R$ ${rewardValue.toFixed(2)} a cada ${frequency} eliminações (acumulado na temporada)`
      : 'Recompensa por eliminação desativada nesta temporada';

    return {
      config,
      enabled,
      frequency,
      rewardValue,
      rewardType,
      byPlayer,
      ruleLabel,
      loading,
    };
  }, [eliminations, games, season, loading]);
}
