
import { v4 as uuidv4 } from 'uuid';
import { Season, FinancialParams, BlindLevel } from '../lib/db/models';

/**
 * Creates default financial parameters for a new season
 */
export const createDefaultFinancialParams = (): FinancialParams => {
  return {
    buyIn: 15,
    rebuy: 15,
    addon: 15,
    jackpotContribution: 5,
  };
};

/**
 * Creates default blind structure for a new season
 */
export const createDefaultBlindStructure = (): BlindLevel[] => {
  return [
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
  ];
};

/**
 * Creates a default score schema for a new season
 */
export const createDefaultScoreSchema = () => {
  return [
    { position: 1, points: 10 },
    { position: 2, points: 7 },
    { position: 3, points: 5 },
    { position: 4, points: 3 },
    { position: 5, points: 2 },
    { position: 6, points: 1 }
  ];
};

/**
 * Creates default prize distribution schema (both weekly and season)
 */
export const createDefaultPrizeSchema = () => {
  return [
    { position: 1, percentage: 50 },
    { position: 2, percentage: 30 },
    { position: 3, percentage: 20 }
  ];
};

/**
 * Builds a new season object with provided data and defaults for missing values
 */
export const buildNewSeason = (seasonData: Partial<Season>, seasonsCount: number): Season => {
  const now = new Date();
  
  // Use provided values or defaults
  const financialParams = seasonData.financialParams || createDefaultFinancialParams();
  const blindStructure = seasonData.blindStructure || createDefaultBlindStructure();
  
  return {
    id: uuidv4(),
    name: seasonData.name || `Temporada ${seasonsCount + 1}`,
    startDate: seasonData.startDate || now,
    gamesPerWeek: seasonData.gamesPerWeek || 1,
    isActive: true,
    scoreSchema: seasonData.scoreSchema || createDefaultScoreSchema(),
    weeklyPrizeSchema: seasonData.weeklyPrizeSchema || createDefaultPrizeSchema(),
    seasonPrizeSchema: seasonData.seasonPrizeSchema || createDefaultPrizeSchema(),
    financialParams: financialParams,
    blindStructure: blindStructure,
    jackpot: 0,
    clubFund: 0,
    houseRules: seasonData.houseRules || '',
    hostSchedule: seasonData.hostSchedule || [],
    createdAt: now,
  };
};
