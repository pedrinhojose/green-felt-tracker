
import { BlindLevel } from "@/lib/db/models";

export interface ScoreEntry {
  position: number;
  points: number;
}

export interface PrizeEntry {
  position: number;
  percentage: number;
}

export interface EliminationRewardFormValues {
  enabled: boolean;
  rewardType: 'points' | 'money';
  rewardValue: number;
  frequency: number;
  maxRewardsPerGame: number;
}

export interface SeasonFormValues {
  name: string;
  startDate: string;
  gameFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  gamesPerPeriod: number;
  buyIn: number;
  rebuy: number;
  addon: number;
  jackpotContribution: number;
  clubFundContribution: number;
  pixKey?: string;
  houseRules: string;
  // Elimination reward config
  eliminationRewardEnabled: boolean;
  eliminationRewardType: 'points' | 'money';
  eliminationRewardValue: number;
  eliminationRewardFrequency: number;
  eliminationRewardMaxPerGame: number;
}

export interface SeasonFormProps {
  isCreating: boolean;
  activeSeason: any | null;
  createSeason: (data: any) => Promise<string>;
  updateSeason: (data: any) => Promise<void>;
  endSeason?: (id: string) => Promise<void>;
}
