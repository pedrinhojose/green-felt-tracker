
import { useSeasonCrud } from '../hooks/useSeasonCrud';
import { useSeasonFinalization } from '../hooks/useSeasonFinalization';
import { pokerDB } from '../lib/db';

export function useSeasonFunctions() {
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

  return {
    seasons,
    setSeasons,
    activeSeason,
    setActiveSeason,
    createSeason,
    updateSeason,
    endSeason,
    activateSeason,
    deactivateSeason
  };
}
