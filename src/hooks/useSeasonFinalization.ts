
import { useToast } from "@/components/ui/use-toast";
import { pokerDB } from '../lib/db';
import { supabase } from '@/integrations/supabase/client';

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
    
    // Get user ID and organization ID for the distributions
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    const userId = session.user.id;
    
    // Validate organizationId
    const organizationId = season.organizationId;
    if (!organizationId) {
      throw new Error('Organization ID not found in season');
    }
    
    // Prepare jackpot distributions
    const distributions = [];
    
    for (let i = 0; i < Math.min(season.seasonPrizeSchema.length, sortedRankings.length); i++) {
      const prizeConfig = season.seasonPrizeSchema[i];
      const percentage = prizeConfig.percentage;
      
      // Get player at position (i+1)
      const rankEntry = sortedRankings[i];
      
      if (rankEntry) {
        const prizeAmount = (season.jackpot * percentage) / 100;
        
        distributions.push({
          seasonId: season.id,
          playerId: rankEntry.playerId,
          playerName: rankEntry.playerName,
          position: i + 1,
          percentage: percentage,
          prizeAmount: prizeAmount,
          totalJackpot: season.jackpot,
          organizationId: organizationId,
          userId: userId
        });
        
        console.log(`Player ${rankEntry.playerName} wins ${prizeAmount} (${percentage}% of jackpot ${season.jackpot})`);
      }
    }
    
    // Save all distributions to database
    if (distributions.length > 0) {
      await pokerDB.saveJackpotDistributions(distributions);
      console.log(`Saved ${distributions.length} jackpot distributions to database`);
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
