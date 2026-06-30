
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
  setHostSchedule?: (schedule: any[]) => void,
  previousSeason?: Season | null,
  inheritFromPrevious: boolean = true
) {
  // Initialize form when component loads
  useEffect(() => {
    if (activeSeason && !isCreating) {
      setValue('name', activeSeason.name);
      setValue('startDate', new Date(activeSeason.startDate).toISOString().split('T')[0]);
      setValue('expectedEndDate', activeSeason.expectedEndDate ? new Date(activeSeason.expectedEndDate).toISOString().split('T')[0] : '');
      setValue('gameFrequency', activeSeason.gameFrequency || 'weekly');
      setValue('gamesPerPeriod', activeSeason.gamesPerPeriod || 1);
      setValue('buyIn', activeSeason.financialParams.buyIn);
      setValue('rebuy', activeSeason.financialParams.rebuy);
      setValue('addon', activeSeason.financialParams.addon);
      setValue('jackpotContribution', activeSeason.financialParams.jackpotContribution);
      setValue('clubFundContribution', activeSeason.financialParams.clubFundContribution);
      setValue('pixKey', activeSeason.financialParams.pixKey || '');
      setValue('houseRules', activeSeason.houseRules || '');
      
      // Elimination reward config
      const elimConfig = activeSeason.eliminationRewardConfig;
      setValue('eliminationRewardEnabled', elimConfig?.enabled ?? false);
      setValue('eliminationRewardType', elimConfig?.rewardType ?? 'points');
      setValue('eliminationRewardValue', elimConfig?.rewardValue ?? 1);
      setValue('eliminationRewardFrequency', elimConfig?.frequency ?? 1);
      setValue('eliminationRewardMaxPerGame', elimConfig?.maxRewardsPerGame ?? 0);
      
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
      const today = new Date().toISOString().split('T')[0];
      const inherit = inheritFromPrevious && previousSeason ? previousSeason : null;

      // Name and dates always start blank/today for a new season
      setValue('name', '');
      setValue('startDate', today);
      setValue('expectedEndDate', '');

      if (inherit) {
        // Inherit configurations from the previous season
        setValue('gameFrequency', inherit.gameFrequency || 'weekly');
        setValue('gamesPerPeriod', inherit.gamesPerPeriod || 1);
        setValue('buyIn', inherit.financialParams.buyIn);
        setValue('rebuy', inherit.financialParams.rebuy);
        setValue('addon', inherit.financialParams.addon);
        setValue('jackpotContribution', inherit.financialParams.jackpotContribution);
        setValue('clubFundContribution', inherit.financialParams.clubFundContribution);
        setValue('pixKey', inherit.financialParams.pixKey || '');
        setValue('houseRules', inherit.houseRules || '');

        const elim = inherit.eliminationRewardConfig;
        setValue('eliminationRewardEnabled', elim?.enabled ?? false);
        setValue('eliminationRewardType', elim?.rewardType ?? 'points');
        setValue('eliminationRewardValue', elim?.rewardValue ?? 1);
        setValue('eliminationRewardFrequency', elim?.frequency ?? 1);
        setValue('eliminationRewardMaxPerGame', elim?.maxRewardsPerGame ?? 0);

        setScoreEntries(inherit.scoreSchema.map(e => ({ ...e })));
        setWeeklyPrizeEntries(inherit.weeklyPrizeSchema.map(e => ({ ...e })));
        setSeasonPrizeEntries(inherit.seasonPrizeSchema.map(e => ({ ...e })));
        setBlindLevels(inherit.blindStructure.map(l => ({ ...l, id: uuidv4() })));
        setHostSchedule?.([]);
        return;
      }

      // Default values for new season (no previous season available)
      setValue('gameFrequency', 'weekly');
      setValue('gamesPerPeriod', 1);
      setValue('buyIn', 15);
      setValue('rebuy', 15);
      setValue('addon', 15);
      setValue('jackpotContribution', 5);
      setValue('clubFundContribution', 2);
      setValue('pixKey', '');
      setValue('houseRules', '');
      
      // Default elimination reward config (disabled)
      setValue('eliminationRewardEnabled', false);
      setValue('eliminationRewardType', 'points');
      setValue('eliminationRewardValue', 1);
      setValue('eliminationRewardFrequency', 1);
      setValue('eliminationRewardMaxPerGame', 0);
      
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
      setHostSchedule?.([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSeason, isCreating, previousSeason?.id, inheritFromPrevious]);
}
