
import { useEffect, useState, useCallback } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { PlayerPerformanceStats } from "./types";
import { calculatePlayerStats } from "./utils/playerStatsCalculations";
import { loadHistoricalSeasonData } from "./utils/historicalDataLoader";

export function usePlayerStats(seasonId?: string) {
  const { games, activeSeason, players, rankings } = usePoker();
  const [playerStats, setPlayerStats] = useState<PlayerPerformanceStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastCalculatedSeasonId, setLastCalculatedSeasonId] = useState<string | null>(null);

  // Memoizar função de cálculo para evitar recálculos desnecessários
  const memoizedCalculateStats = useCallback(async () => {
    console.log("=== usePlayerStats DEBUG ===");
    
    // Usar seasonId fornecido ou temporada ativa
    const targetSeasonId = seasonId || activeSeason?.id;
    
    if (!targetSeasonId) {
      console.log("No target season ID");
      setPlayerStats([]);
      setLastCalculatedSeasonId(null);
      return;
    }

    // Evitar recálculos desnecessários
    if (targetSeasonId === lastCalculatedSeasonId && playerStats.length > 0) {
      console.log("Stats already calculated for this season, skipping");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Target season ID:", targetSeasonId);
      
      // Se o seasonId é diferente da temporada ativa, buscar dados específicos
      let targetSeason = activeSeason;
      let targetGames = games;
      let targetRankings = rankings;
      let targetPlayers = players;
      
      const historicalData = await loadHistoricalSeasonData(seasonId, activeSeason);
      
      if (historicalData) {
        targetSeason = historicalData.season;
        targetGames = historicalData.games;
        targetRankings = historicalData.rankings;
        // Para temporadas históricas, usar os jogadores atuais (não mudam entre temporadas)
        targetPlayers = players;
      }
      
      if (!targetSeason) {
        console.log("Season not found");
        setPlayerStats([]);
        setLastCalculatedSeasonId(null);
        return;
      }
      
      const playerStatsArray = calculatePlayerStats({
        targetGames,
        targetPlayers,
        targetRankings,
        targetSeason
      });
      
      setPlayerStats(playerStatsArray);
      setLastCalculatedSeasonId(targetSeasonId);
    } catch (error) {
      console.error("Error calculating player stats:", error);
      setPlayerStats([]);
      setLastCalculatedSeasonId(null);
    } finally {
      setLoading(false);
    }
  }, [games, activeSeason, players, rankings, seasonId, lastCalculatedSeasonId, playerStats.length]);

  useEffect(() => {
    // Debounce o cálculo para evitar execuções excessivas
    const timeoutId = setTimeout(() => {
      memoizedCalculateStats();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [memoizedCalculateStats]);

  return { playerStats, loading };
}
