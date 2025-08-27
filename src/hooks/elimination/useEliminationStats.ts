import { useMemo } from 'react';
import { useEliminationData } from './useEliminationData';
import { usePoker } from '@/contexts/PokerContext';

export function useEliminationStats(seasonId?: string) {
  const { eliminations, loading } = useEliminationData(seasonId);
  const { players } = usePoker();

  const stats = useMemo(() => {
    if (!eliminations.length || !players.length) {
      return {
        topEliminators: [],
        totalEliminations: 0
      };
    }

    // Count eliminations by eliminator
    const eliminatorCounts: Record<string, number> = {};

    eliminations.forEach(elimination => {
      if (elimination.eliminator_player_id) {
        eliminatorCounts[elimination.eliminator_player_id] = 
          (eliminatorCounts[elimination.eliminator_player_id] || 0) + 1;
      }
    });

    // Top eliminators
    const topEliminators = Object.entries(eliminatorCounts)
      .map(([playerId, count]) => {
        const player = players.find(p => p.id === playerId);
        return {
          playerId,
          playerName: player?.name || 'Jogador Desconhecido',
          eliminations: count
        };
      })
      .sort((a, b) => b.eliminations - a.eliminations)
      .slice(0, 5);

    return {
      topEliminators,
      totalEliminations: eliminations.length
    };
  }, [eliminations, players]);

  return {
    ...stats,
    loading
  };
}