
import { useToast } from "@/components/ui/use-toast";
import { pokerDB } from '../lib/db';
import { supabase } from '@/integrations/supabase/client';

// Interface para transferência de saldo da caixinha
interface PendingCaixinhaTransfer {
  fromSeasonId: string;
  fromSeasonName: string;
  amount: number;
  timestamp: string;
}

export function useSeasonFinalization(
  setSeasons: React.Dispatch<React.SetStateAction<any[]>>,
  setActiveSeason: React.Dispatch<React.SetStateAction<any | null>>
) {
  const { toast } = useToast();

  /**
   * Ends a season and distributes the jackpot
   * Saves caixinha balance for transfer to new season
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
    
    // Save caixinha balance for transfer to new season
    const caixinhaBalance = season.caixinhaBalance || 0;
    if (caixinhaBalance > 0) {
      const pendingTransfer: PendingCaixinhaTransfer = {
        fromSeasonId: season.id,
        fromSeasonName: season.name,
        amount: caixinhaBalance,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('pendingCaixinhaTransfer', JSON.stringify(pendingTransfer));
      console.log(`Saved caixinha balance of ${caixinhaBalance} for transfer to new season`);
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
    // Keep caixinha balance in the old season for record keeping
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
    
    const transferMessage = caixinhaBalance > 0 
      ? ` O saldo da caixinha (R$ ${caixinhaBalance.toFixed(2)}) será transferido para a próxima temporada.`
      : '';
    
    toast({
      title: "Temporada Encerrada",
      description: `A temporada foi encerrada e o jackpot foi distribuído.${transferMessage}`,
    });
  };

  return { endSeason };
}
