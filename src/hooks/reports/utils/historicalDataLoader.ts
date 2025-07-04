
import { pokerDB } from "@/lib/db";

export interface HistoricalSeasonData {
  season: any;
  games: any[];
  rankings: any[];
}

export async function loadHistoricalSeasonData(
  seasonId: string, 
  currentActiveSeason: any
): Promise<HistoricalSeasonData | null> {
  if (!seasonId || seasonId === currentActiveSeason?.id) {
    return null; // Use current data
  }

  try {
    console.log("Loading data for historical season:", seasonId);
    
    // Buscar temporada específica
    const season = await pokerDB.getSeason(seasonId);
    if (!season) {
      console.log("Season not found:", seasonId);
      return null;
    }
    
    // Buscar jogos da temporada específica
    const games = await pokerDB.getGames(seasonId);
    console.log("Historical games loaded:", games.length);
    
    // Buscar rankings da temporada específica
    const rankings = await pokerDB.getRankings(seasonId);
    console.log("Historical rankings loaded:", rankings.length);
    
    return { season, games, rankings };
  } catch (error) {
    console.error("Error loading season data:", error);
    return null;
  }
}
