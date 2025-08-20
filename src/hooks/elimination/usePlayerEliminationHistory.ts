import { useMemo } from 'react';
import { useEliminationData } from './useEliminationData';
import { usePoker } from '@/contexts/PokerContext';

export interface PlayerEliminationData {
  asEliminator: {
    count: number;
    victims: { playerId: string; playerName: string; eliminations: number }[];
  };
  asEliminated: {
    count: number;
    eliminators: { playerId: string; playerName: string; eliminations: number }[];
  };
  recentEliminations: {
    type: 'eliminated' | 'eliminator';
    gameId: string;
    gameNumber?: number;
    otherPlayer: string;
    position?: number;
    date: string;
  }[];
}

export function usePlayerEliminationHistory(playerId: string, seasonId?: string) {
  const { eliminations, loading } = useEliminationData(seasonId);
  const { players, games } = usePoker();

  const playerEliminationData = useMemo((): PlayerEliminationData => {
    if (!eliminations.length || !players.length) {
      return {
        asEliminator: { count: 0, victims: [] },
        asEliminated: { count: 0, eliminators: [] },
        recentEliminations: []
      };
    }

    // Filter eliminations for this player
    const playerAsEliminator = eliminations.filter(e => e.eliminator_player_id === playerId);
    const playerAsEliminated = eliminations.filter(e => e.eliminated_player_id === playerId);

    // Count victims
    const victimCounts: Record<string, number> = {};
    playerAsEliminator.forEach(elimination => {
      victimCounts[elimination.eliminated_player_id] = 
        (victimCounts[elimination.eliminated_player_id] || 0) + 1;
    });

    const victims = Object.entries(victimCounts)
      .map(([victimId, count]) => {
        const player = players.find(p => p.id === victimId);
        return {
          playerId: victimId,
          playerName: player?.name || 'Jogador Desconhecido',
          eliminations: count
        };
      })
      .sort((a, b) => b.eliminations - a.eliminations);

    // Count eliminators
    const eliminatorCounts: Record<string, number> = {};
    playerAsEliminated.forEach(elimination => {
      if (elimination.eliminator_player_id) {
        eliminatorCounts[elimination.eliminator_player_id] = 
          (eliminatorCounts[elimination.eliminator_player_id] || 0) + 1;
      }
    });

    const eliminators = Object.entries(eliminatorCounts)
      .map(([eliminatorId, count]) => {
        const player = players.find(p => p.id === eliminatorId);
        return {
          playerId: eliminatorId,
          playerName: player?.name || 'Jogador Desconhecido',
          eliminations: count
        };
      })
      .sort((a, b) => b.eliminations - a.eliminations);

    // Recent eliminations
    const recentEliminations = [
      ...playerAsEliminator.map(e => ({
        type: 'eliminator' as const,
        gameId: e.game_id,
        gameNumber: games.find(g => g.id === e.game_id)?.number,
        otherPlayer: players.find(p => p.id === e.eliminated_player_id)?.name || 'Jogador Desconhecido',
        date: e.elimination_time
      })),
      ...playerAsEliminated.map(e => ({
        type: 'eliminated' as const,
        gameId: e.game_id,
        gameNumber: games.find(g => g.id === e.game_id)?.number,
        otherPlayer: e.eliminator_player_id ? 
          (players.find(p => p.id === e.eliminator_player_id)?.name || 'Jogador Desconhecido') : 
          'Auto-eliminação',
        position: e.position,
        date: e.elimination_time
      }))
    ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

    return {
      asEliminator: {
        count: playerAsEliminator.length,
        victims
      },
      asEliminated: {
        count: playerAsEliminated.length,
        eliminators
      },
      recentEliminations
    };
  }, [eliminations, players, games, playerId]);

  return {
    ...playerEliminationData,
    loading
  };
}