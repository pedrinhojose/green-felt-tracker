
import { useMemo } from 'react';
import { PlayerPerformanceStats } from './reports/types';

export interface PlayerRating {
  playerId: string;
  stars: number;
  rating: number;
  metrics: {
    winRate: number;
    roi: number;
    itmRate: number;
    consistency: number;
    activity: number;
  };
}

export function usePlayerRating(playerStats: PlayerPerformanceStats[]): PlayerRating[] {
  return useMemo(() => {
    if (!playerStats.length) return [];

    // Calcular métricas normalizadas para cada jogador
    const ratingsData = playerStats.map(player => {
      // Métrica 1: Taxa de vitórias (0-100)
      const winRate = player.winRate || 0;
      
      // Métrica 2: ROI (Return on Investment) - normalizar entre -100 e +100
      const roi = Math.max(-100, Math.min(100, player.roi || 0));
      
      // Métrica 3: Taxa ITM (In The Money)
      const itmRate = player.itmRate || 0;
      
      // Métrica 4: Consistência (baseada na posição média - quanto menor, melhor)
      const avgPos = player.averagePosition || 10;
      const consistency = Math.max(0, 100 - (avgPos - 1) * 10);
      
      // Métrica 5: Atividade (baseada no número de jogos)
      const maxGames = Math.max(...playerStats.map(p => p.gamesPlayed));
      const activity = maxGames > 0 ? (player.gamesPlayed / maxGames) * 100 : 0;
      
      return {
        playerId: player.playerId,
        playerName: player.playerName,
        metrics: {
          winRate,
          roi,
          itmRate,
          consistency,
          activity
        }
      };
    });

    // Calcular rating geral para cada jogador
    const playersWithRating = ratingsData.map(data => {
      const { winRate, roi, itmRate, consistency, activity } = data.metrics;
      
      // Pesos para cada métrica
      const weights = {
        winRate: 0.25,     // 25% - Taxa de vitórias
        roi: 0.30,         // 30% - ROI (mais importante)
        itmRate: 0.20,     // 20% - Taxa ITM
        consistency: 0.15, // 15% - Consistência
        activity: 0.10     // 10% - Atividade
      };
      
      // Normalizar ROI para escala 0-100
      const normalizedRoi = ((roi + 100) / 200) * 100;
      
      // Calcular rating ponderado (0-100)
      const rating = (
        winRate * weights.winRate +
        normalizedRoi * weights.roi +
        itmRate * weights.itmRate +
        consistency * weights.consistency +
        activity * weights.activity
      );
      
      // Converter rating para estrelas (1-5)
      let stars: number;
      if (rating >= 80) stars = 5;
      else if (rating >= 65) stars = 4;
      else if (rating >= 50) stars = 3;
      else if (rating >= 35) stars = 2;
      else stars = 1;
      
      return {
        playerId: data.playerId,
        stars,
        rating: Math.round(rating),
        metrics: data.metrics
      };
    });

    // Ordenar por rating decrescente
    return playersWithRating.sort((a, b) => b.rating - a.rating);
  }, [playerStats]);
}
