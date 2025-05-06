
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
   * Creates a new season and sets it as active
   */
  const createSeason = async (seasonData: Partial<Season>) => {
    // Set any existing active season to inactive
    if (activeSeason) {
      const updatedActiveSeason = { ...activeSeason, isActive: false };
      await pokerDB.saveSeason(updatedActiveSeason);
    }
    
    // Create the new season with defaults for missing values
    const newSeason = buildNewSeason(seasonData, seasons.length);
    
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
