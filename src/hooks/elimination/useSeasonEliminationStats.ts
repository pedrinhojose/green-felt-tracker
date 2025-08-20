import { useMemo } from 'react';
import { useEliminationData } from './useEliminationData';
import { usePoker } from '@/contexts/PokerContext';

export interface SeasonEliminationHighlights {
  deadliestPlayer: { playerId: string; playerName: string; eliminations: number } | null;
  mostTargetedPlayer: { playerId: string; playerName: string; eliminations: number } | null;
  biggestRival: { 
    player1: string; 
    player2: string; 
    eliminations: number;
    player1Name: string;
    player2Name: string;
  } | null;
  totalEliminations: number;
  eliminationRate: number; // eliminações por jogo
}

export function useSeasonEliminationStats(seasonId?: string) {
  const { eliminations, loading } = useEliminationData(seasonId);
  const { players, games } = usePoker();

  const highlights = useMemo((): SeasonEliminationHighlights => {
    if (!eliminations.length || !players.length) {
      return {
        deadliestPlayer: null,
        mostTargetedPlayer: null,
        biggestRival: null,
        totalEliminations: 0,
        eliminationRate: 0
      };
    }

    // Filter games for the season
    const seasonGames = seasonId ? games.filter(g => g.seasonId === seasonId) : games;
    const gameCount = seasonGames.length || 1;

    // Count eliminations by eliminator
    const eliminatorCounts: Record<string, number> = {};
    const eliminatedCounts: Record<string, number> = {};
    const rivalCounts: Record<string, number> = {};

    eliminations.forEach(elimination => {
      // Eliminator stats
      if (elimination.eliminator_player_id) {
        eliminatorCounts[elimination.eliminator_player_id] = 
          (eliminatorCounts[elimination.eliminator_player_id] || 0) + 1;
      }
      
      // Eliminated stats
      eliminatedCounts[elimination.eliminated_player_id] = 
        (eliminatedCounts[elimination.eliminated_player_id] || 0) + 1;

      // Rival stats (who eliminates whom most)
      if (elimination.eliminator_player_id) {
        const key = [elimination.eliminator_player_id, elimination.eliminated_player_id]
          .sort()
          .join('-');
        rivalCounts[key] = (rivalCounts[key] || 0) + 1;
      }
    });

    // Find deadliest player
    const deadliestPlayer = Object.entries(eliminatorCounts)
      .map(([playerId, count]) => {
        const player = players.find(p => p.id === playerId);
        return {
          playerId,
          playerName: player?.name || 'Jogador Desconhecido',
          eliminations: count
        };
      })
      .sort((a, b) => b.eliminations - a.eliminations)[0] || null;

    // Find most targeted player
    const mostTargetedPlayer = Object.entries(eliminatedCounts)
      .map(([playerId, count]) => {
        const player = players.find(p => p.id === playerId);
        return {
          playerId,
          playerName: player?.name || 'Jogador Desconhecido',
          eliminations: count
        };
      })
      .sort((a, b) => b.eliminations - a.eliminations)[0] || null;

    // Find biggest rivalry
    const biggestRival = Object.entries(rivalCounts)
      .map(([key, count]) => {
        const [player1Id, player2Id] = key.split('-');
        const player1 = players.find(p => p.id === player1Id);
        const player2 = players.find(p => p.id === player2Id);
        return {
          player1: player1Id,
          player2: player2Id,
          player1Name: player1?.name || 'Jogador Desconhecido',
          player2Name: player2?.name || 'Jogador Desconhecido',
          eliminations: count
        };
      })
      .sort((a, b) => b.eliminations - a.eliminations)[0] || null;

    const eliminationRate = eliminations.length / gameCount;

    return {
      deadliestPlayer,
      mostTargetedPlayer,
      biggestRival: biggestRival && biggestRival.eliminations >= 2 ? biggestRival : null,
      totalEliminations: eliminations.length,
      eliminationRate
    };
  }, [eliminations, players, games, seasonId]);

  return {
    ...highlights,
    loading
  };
}