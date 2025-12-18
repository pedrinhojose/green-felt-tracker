
import { useSeasonCrud } from '../hooks/useSeasonCrud';
import { useSeasonFinalization } from '../hooks/useSeasonFinalization';
import { useJackpotRecalculation } from '../hooks/useJackpotRecalculation';
import { pokerDB } from '../lib/db';
import { useToast } from "@/components/ui/use-toast";

export function useSeasonFunctions() {
  const { toast } = useToast();
  const { 
    seasons, 
    setSeasons, 
    activeSeason, 
    setActiveSeason, 
    createSeason, 
    updateSeason 
  } = useSeasonCrud();
  
  const { endSeason } = useSeasonFinalization(
    setSeasons, 
    setActiveSeason
  );
  
  const { recalculateSeasonJackpot, fixSeasonJackpot } = useJackpotRecalculation();

  /**
   * Activates a season and deactivates all others
   */
  const activateSeason = async (seasonId: string) => {
    const season = await pokerDB.getSeason(seasonId);
    if (!season) {
      throw new Error('Season not found');
    }

    // Deactivate all other seasons first
    const allSeasons = await pokerDB.getSeasons();
    for (const s of allSeasons) {
      if (s.isActive && s.id !== seasonId) {
        await pokerDB.saveSeason({ ...s, isActive: false });
      }
    }

    // Activate the target season
    const updatedSeason = { ...season, isActive: true };
    await pokerDB.saveSeason(updatedSeason);

    // Update local state
    setSeasons(prev => prev.map(s => ({
      ...s,
      isActive: s.id === seasonId
    })));
    setActiveSeason(updatedSeason);
  };

  /**
   * Deactivates a season
   */
  const deactivateSeason = async (seasonId: string) => {
    const season = await pokerDB.getSeason(seasonId);
    if (!season) {
      throw new Error('Season not found');
    }

    const updatedSeason = { ...season, isActive: false };
    await pokerDB.saveSeason(updatedSeason);

    // Update local state
    setSeasons(prev => prev.map(s => 
      s.id === seasonId ? { ...s, isActive: false } : s
    ));
    
    if (activeSeason?.id === seasonId) {
      setActiveSeason(null);
    }
  };

  /**
   * Transfers caixinha balance from one season to another
   */
  const transferCaixinhaBalance = async (fromSeasonId: string, toSeasonId: string) => {
    // Get source season to calculate balance
    const fromSeason = await pokerDB.getSeason(fromSeasonId);
    if (!fromSeason) {
      throw new Error('Source season not found');
    }

    // Calculate total caixinha balance from games + transactions
    const games = await pokerDB.getGames(fromSeasonId);
    const totalPlayers = games.reduce((sum, game) => sum + (game.players?.length || 0), 0);
    const clubFundContribution = fromSeason.financialParams?.clubFundContribution || 0;
    const fromGames = totalPlayers * clubFundContribution;

    // Get caixinha balance from season (includes transaction adjustments)
    const manualBalance = fromSeason.caixinhaBalance || 0;
    const totalBalance = fromGames + manualBalance;

    console.log(`Caixinha transfer: ${fromGames} (games) + ${manualBalance} (manual) = ${totalBalance}`);

    // Get target season
    const toSeason = await pokerDB.getSeason(toSeasonId);
    if (!toSeason) {
      throw new Error('Target season not found');
    }

    // Update target season with the balance
    const updatedToSeason = { 
      ...toSeason, 
      caixinhaBalance: (toSeason.caixinhaBalance || 0) + totalBalance 
    };
    await pokerDB.saveSeason(updatedToSeason);

    // Update local state
    if (activeSeason?.id === toSeasonId) {
      setActiveSeason(updatedToSeason);
    }
    setSeasons(prev => prev.map(s => 
      s.id === toSeasonId ? updatedToSeason : s
    ));

    toast({
      title: "Saldo Transferido",
      description: `R$ ${totalBalance.toFixed(2)} transferido da temporada "${fromSeason.name}" para "${toSeason.name}".`,
    });

    return totalBalance;
  };

  /**
   * Sets caixinha balance for a season directly
   */
  const setCaixinhaBalance = async (seasonId: string, balance: number) => {
    const season = await pokerDB.getSeason(seasonId);
    if (!season) {
      throw new Error('Season not found');
    }

    const updatedSeason = { ...season, caixinhaBalance: balance };
    await pokerDB.saveSeason(updatedSeason);

    // Update local state
    if (activeSeason?.id === seasonId) {
      setActiveSeason(updatedSeason);
    }
    setSeasons(prev => prev.map(s => 
      s.id === seasonId ? updatedSeason : s
    ));

    toast({
      title: "Saldo Atualizado",
      description: `Saldo da caixinha definido para R$ ${balance.toFixed(2)}.`,
    });
  };

  return {
    seasons,
    setSeasons,
    activeSeason,
    setActiveSeason,
    createSeason,
    updateSeason,
    endSeason,
    activateSeason,
    deactivateSeason,
    recalculateSeasonJackpot,
    fixSeasonJackpot,
    transferCaixinhaBalance,
    setCaixinhaBalance
  };
}
