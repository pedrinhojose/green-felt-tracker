
import { useToast } from "@/hooks/use-toast";
import { pokerDB } from '../lib/db';
import { useState } from "react";

export function useJackpotManagement(
  setSeasons: React.Dispatch<React.SetStateAction<any[]>>, 
  activeSeason: any | null, 
  setActiveSeason: React.Dispatch<React.SetStateAction<any | null>>
) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Updates the jackpot amount for a season
   */
  const updateJackpot = async (seasonId: string, amount: number): Promise<void> => {
    // If already processing an update, don't allow another one
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      // Perform the database update
      await pokerDB.updateJackpot(seasonId, amount);
      
      // Wait a small amount of time to ensure DB operation completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the updated season directly from the database
      const updatedSeason = await pokerDB.getSeason(seasonId);
      
      if (!updatedSeason) {
        throw new Error('Temporada não encontrada após atualização');
      }
      
      // Update states in a controlled, non-cascading manner
      // Use functional updates to ensure we're working with the latest state
      setSeasons(prevSeasons => 
        prevSeasons.map(season => 
          season.id === seasonId ? updatedSeason : season
        )
      );
      
      // Only update active season if needed and do it separately
      if (activeSeason?.id === seasonId) {
        setActiveSeason(updatedSeason);
      }
    } catch (error) {
      console.error('Erro ao atualizar jackpot:', error);
      throw error;
    } finally {
      // Delay clearing the update flag to prevent UI jank
      setTimeout(() => {
        setIsUpdating(false);
      }, 200);
    }
  };

  return { updateJackpot, isUpdating };
}
