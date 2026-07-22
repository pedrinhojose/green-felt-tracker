
import { useToast } from "@/components/ui/use-toast";
import { pokerDB } from '../lib/db';
import { supabase } from '@/integrations/supabase/client';

export function useSeasonFinalization(
  setSeasons: React.Dispatch<React.SetStateAction<any[]>>,
  setActiveSeason: React.Dispatch<React.SetStateAction<any | null>>
) {
  const { toast } = useToast();

  /**
   * Ends a season and distributes the jackpot.
   * NOTE: The caixinha balance is organization-wide and continuous across seasons —
   * ending a season NEVER resets or transfers it. Balance is computed live from
   * all transactions/contributions of the organization.
   */
  const endSeason = async (seasonId: string) => {
    const season = await pokerDB.getSeason(seasonId);
    if (!season) {
      throw new Error('Season not found');
    }

    // Clear any legacy pending transfer left over from older versions.
    try { localStorage.removeItem('pendingCaixinhaTransfer'); } catch {}

    // Get ranking to distribute jackpot
    const rankings = await pokerDB.getRankings(seasonId);
    const sortedRankings = rankings.sort((a, b) => b.totalPoints - a.totalPoints);

    // Get user ID and organization ID for the distributions
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    const userId = session.user.id;

    const organizationId = season.organizationId;
    if (!organizationId) {
      throw new Error('Organization ID not found in season');
    }

    // Prepare jackpot distributions
    const distributions = [];

    for (let i = 0; i < Math.min(season.seasonPrizeSchema.length, sortedRankings.length); i++) {
      const prizeConfig = season.seasonPrizeSchema[i];
      const percentage = prizeConfig.percentage;
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

    if (distributions.length > 0) {
      await pokerDB.saveJackpotDistributions(distributions);
      console.log(`Saved ${distributions.length} jackpot distributions to database`);
    }

    // Update season as inactive and set end date.
    // Caixinha balance is intentionally NOT touched — it lives at the organization level.
    const updatedSeason = {
      ...season,
      isActive: false,
      endDate: new Date(),
      jackpot: 0 // Reset jackpot after distribution
    };

    await pokerDB.saveSeason(updatedSeason);

    setSeasons(prev => {
      const index = prev.findIndex(s => s.id === updatedSeason.id);
      return [...prev.slice(0, index), updatedSeason, ...prev.slice(index + 1)];
    });

    setActiveSeason(null);

    toast({
      title: "Temporada Encerrada",
      description: "A temporada foi encerrada e o jackpot foi distribuído. O saldo da caixinha do clube permanece inalterado.",
    });
  };

  return { endSeason };
}

