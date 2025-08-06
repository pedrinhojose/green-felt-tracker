
import { BlindLevel } from "@/lib/db/models";

export interface ScoreEntry {
  position: number;
  points: number;
}

export interface PrizeEntry {
  position: number;
  percentage: number;
}

export interface SeasonFormValues {
  name: string;
  startDate: string;
  gamesPerWeek: number;
  buyIn: number;
  rebuy: number;
  addon: number;
  jackpotContribution: number;
  clubMembershipValue: number;
  clubMembershipFrequency: 'semanal' | 'mensal' | 'trimestral';
  houseRules: string;
}

export interface SeasonFormProps {
  isCreating: boolean;
  activeSeason: any | null;
  createSeason: (data: any) => Promise<string>;
  updateSeason: (data: any) => Promise<void>;
  endSeason?: (id: string) => Promise<void>;
}
