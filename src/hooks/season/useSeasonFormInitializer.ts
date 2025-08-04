
import { useEffect } from "react";
import { UseFormSetValue } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { Season, BlindLevel } from "@/lib/db/models";
import { SeasonFormValues, ScoreEntry, PrizeEntry } from "@/types/season";

export function useSeasonFormInitializer(
  activeSeason: Season | null,
  isCreating: boolean,
  setValue: UseFormSetValue<SeasonFormValues>,
  setScoreEntries: (entries: ScoreEntry[]) => void,
  setWeeklyPrizeEntries: (entries: PrizeEntry[]) => void,
  setSeasonPrizeEntries: (entries: PrizeEntry[]) => void,
  setBlindLevels: (levels: BlindLevel[]) => void,
  setHostSchedule?: (schedule: any[]) => void
) {
  // Initialize form when component loads
  useEffect(() => {
    if (activeSeason && !isCreating) {
      setValue('name', activeSeason.name);
      setValue('startDate', new Date(activeSeason.startDate).toISOString().split('T')[0]);
      setValue('gamesPerWeek', activeSeason.gamesPerWeek);
      setValue('buyIn', activeSeason.financialParams.buyIn);
      setValue('rebuy', activeSeason.financialParams.rebuy);
      setValue('addon', activeSeason.financialParams.addon);
      setValue('jackpotContribution', activeSeason.financialParams.jackpotContribution);
      setValue('houseRules', activeSeason.houseRules || '');
      
      setScoreEntries([...activeSeason.scoreSchema]);
      setWeeklyPrizeEntries([...activeSeason.weeklyPrizeSchema]);
      setSeasonPrizeEntries([...activeSeason.seasonPrizeSchema]);
      
      // Ensure each blind level has a valid ID
      const blindStructureWithIds = activeSeason.blindStructure.map(level => {
        if (!level.id) {
          return { ...level, id: uuidv4() };
        }
        return level;
      });
      
      setBlindLevels(blindStructureWithIds);
      setHostSchedule?.(activeSeason.hostSchedule || []);
    } else {
      // Default values for new season
      const today = new Date().toISOString().split('T')[0];
      setValue('startDate', today);
      setValue('gamesPerWeek', 1);
      setValue('buyIn', 15);
      setValue('rebuy', 15);
      setValue('addon', 15);
      setValue('jackpotContribution', 5);
      setValue('houseRules', '');
      
      // Updated default score schema matching the image (6 positions)
      setScoreEntries([
        { position: 1, points: 10 },
        { position: 2, points: 7 },
        { position: 3, points: 5 },
        { position: 4, points: 3 },
        { position: 5, points: 2 },
        { position: 6, points: 1 }
      ]);
      
      setWeeklyPrizeEntries([
        { position: 1, percentage: 50 },
        { position: 2, percentage: 30 },
        { position: 3, percentage: 20 }
      ]);
      
      setSeasonPrizeEntries([
        { position: 1, percentage: 50 },
        { position: 2, percentage: 30 },
        { position: 3, percentage: 20 }
      ]);
      
      // Default blind structure
      setBlindLevels([
        {
          id: uuidv4(),
          level: 1,
          smallBlind: 25,
          bigBlind: 50,
          ante: 0,
          duration: 20,
          isBreak: false
        },
        {
          id: uuidv4(),
          level: 2,
          smallBlind: 50,
          bigBlind: 100,
          ante: 0,
          duration: 20,
          isBreak: false
        }
      ]);
    }
  }, [activeSeason, isCreating, setValue, setScoreEntries, setWeeklyPrizeEntries, setSeasonPrizeEntries, setBlindLevels]);
}
