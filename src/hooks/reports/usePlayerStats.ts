
import { useEffect, useState } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { PlayerPerformanceStats } from "./types";
import { calculatePlayerStats } from "./utils/playerStatsCalculations";
import { loadHistoricalSeasonData } from "./utils/historicalDataLoader";

export function usePlayerStats(seasonId?: string) {
  const { games, activeSeason, players, rankings } = usePoker();
  const [playerStats, setPlayerStats] = useState<PlayerPerformanceStats[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const calculateStats = async () => {
      console.log("=== usePlayerStats DEBUG ===");
      setLoading(true);
      
      try {
        // Usar seasonId fornecido ou temporada ativa
        const targetSeasonId = seasonId || activeSeason?.id;
        
        if (!targetSeasonId) {
          console.log("No target season ID");
          setPlayerStats([]);
          return;
        }

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
          return;
        }
        
        const playerStatsArray = calculatePlayerStats({
          targetGames,
          targetPlayers,
          targetRankings,
          targetSeason
        });
        
        setPlayerStats(playerStatsArray);
      } catch (error) {
        console.error("Error calculating player stats:", error);
        setPlayerStats([]);
      } finally {
        setLoading(false);
      }
    };

    calculateStats();
  }, [games, activeSeason, players, rankings, seasonId]);

  return { playerStats, loading };
}
