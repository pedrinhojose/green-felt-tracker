
import { useState } from 'react';
import { Season } from '../lib/db/models';
import { pokerDB } from '../lib/db';
import { useToast } from "@/components/ui/use-toast";
import { buildNewSeason } from '../utils/seasonUtils';

export function useSeasonCrud() {
  const { toast } = useToast();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);

  /**
   * Creates a new season and sets it as active.
   * NOTE: Caixinha is organization-wide and continuous — we no longer transfer any
   * balance into the new season. The dashboard/finance pages compute it live from
   * all org transactions and game contributions.
   */
  const createSeason = async (seasonData: Partial<Season>) => {
    // Multiple active seasons are allowed — do not deactivate the current one.

    // Clean up any legacy pending transfer left over from older versions.
    try { localStorage.removeItem('pendingCaixinhaTransfer'); } catch {}

    const caixinhaBalance = seasonData.caixinhaBalance || 0;

    // Create the new season with defaults for missing values
    const newSeason = buildNewSeason({ ...seasonData, caixinhaBalance }, seasons.length);

    
    // Save to database
    const id = await pokerDB.saveSeason(newSeason);
    
    // Update state
    setSeasons(prev => [...prev, newSeason]);
    setActiveSeason(newSeason);
    
    return id;
  };

  /**
   * Updates an existing season
   */
  const updateSeason = async (seasonData: Partial<Season>) => {
    if (!seasonData.id) {
      throw new Error('Season ID is required');
    }
    
    const existingSeason = await pokerDB.getSeason(seasonData.id);
    if (!existingSeason) {
      throw new Error('Season not found');
    }
    
    const updatedSeason = { ...existingSeason, ...seasonData };
    await pokerDB.saveSeason(updatedSeason);
    
    // Update local state
    setSeasons(prev => {
      const index = prev.findIndex(s => s.id === updatedSeason.id);
      if (index >= 0) {
        return [...prev.slice(0, index), updatedSeason, ...prev.slice(index + 1)];
      }
      return prev;
    });
    
    if (updatedSeason.isActive) {
      setActiveSeason(updatedSeason);
    } else if (activeSeason?.id === updatedSeason.id) {
      setActiveSeason(null);
    }
  };

  return {
    seasons,
    setSeasons,
    activeSeason,
    setActiveSeason,
    createSeason,
    updateSeason
  };
}
