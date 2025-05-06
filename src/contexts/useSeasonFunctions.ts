
import { useSeasonCrud } from '../hooks/useSeasonCrud';
import { useSeasonFinalization } from '../hooks/useSeasonFinalization';

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

  return {
    seasons,
    setSeasons,
    activeSeason,
    setActiveSeason,
    createSeason,
    updateSeason,
    endSeason
  };
}
