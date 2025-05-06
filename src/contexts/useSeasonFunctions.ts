
import { useSeasonCrud } from '../hooks/useSeasonCrud';
import { useJackpotManagement } from '../hooks/useJackpotManagement';
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
  
  const { updateJackpot } = useJackpotManagement(
    setSeasons, 
    activeSeason, 
    setActiveSeason
  );
  
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
    endSeason,
    updateJackpot
  };
}
