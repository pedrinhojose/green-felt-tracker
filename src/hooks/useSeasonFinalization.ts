
import { useToast } from "@/components/ui/use-toast";
import { pokerDB } from '../lib/db';

export function useSeasonFinalization(
  setSeasons: React.Dispatch<React.SetStateAction<any[]>>,
  setActiveSeason: React.Dispatch<React.SetStateAction<any | null>>
) {
  const { toast } = useToast();

  /**
   * Ends a season and distributes the jackpot
   */
  const endSeason = async (seasonId: string) => {
    const season = await pokerDB.getSeason(seasonId);
    if (!season) {
      throw new Error('Season not found');
    }
    
    // Get ranking to distribute jackpot
    const rankings = await pokerDB.getRankings(seasonId);
    const sortedRankings = rankings.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Distribute jackpot according to season prize schema
    for (let i = 0; i < Math.min(season.seasonPrizeSchema.length, sortedRankings.length); i++) {
      const position = season.seasonPrizeSchema[i].position;
      const percentage = season.seasonPrizeSchema[i].percentage;
      const rankEntry = sortedRankings.find(r => r.bestPosition === position);
      
      if (rankEntry) {
        // Calculate prize
        const prize = (season.jackpot * percentage) / 100;
        console.log(`Player ${rankEntry.playerName} wins ${prize} (${percentage}% of jackpot)`);
        // Could implement a transaction log here
      }
    }
    
    // Update season as inactive and set end date
    const updatedSeason = {
      ...season,
      isActive: false,
      endDate: new Date(),
      jackpot: 0 // Reset jackpot after distribution
    };
    
    await pokerDB.saveSeason(updatedSeason);
    
    // Update state
    setSeasons(prev => {
      const index = prev.findIndex(s => s.id === updatedSeason.id);
      return [...prev.slice(0, index), updatedSeason, ...prev.slice(index + 1)];
    });
    
    setActiveSeason(null);
    
    toast({
      title: "Temporada Encerrada",
      description: "A temporada foi encerrada e o jackpot foi distribuído.",
    });
  };

  return { endSeason };
}
