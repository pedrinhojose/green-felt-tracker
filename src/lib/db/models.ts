
export interface Player {
  id: string;
  name: string;
  photoUrl?: string;
  createdAt: Date;
}

export interface Season {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  gamesPerWeek: number;
  isActive: boolean;
  scoreSchema: ScoreEntry[];
  weeklyPrizeSchema: PrizeEntry[];
  seasonPrizeSchema: PrizeEntry[];
  financialParams: FinancialParams;
  jackpot: number;
  createdAt: Date;
}

export interface ScoreEntry {
  position: number;
  points: number;
}

export interface PrizeEntry {
  position: number;
  percentage: number;
}

export interface FinancialParams {
  buyIn: number;
  rebuy: number;
  addon: number;
  ante: number;
  jackpotContribution: number;
}

export interface Game {
  id: string;
  number: number;
  seasonId: string;
  date: Date;
  players: GamePlayer[];
  totalPrizePool: number;
  dinnerCost?: number;
  isFinished: boolean;
  createdAt: Date;
}

export interface GamePlayer {
  id: string;
  playerId: string;
  position: number | null;
  buyIn: boolean;
  rebuys: number;
  addons: number;
  joinedDinner: boolean;
  isEliminated: boolean;
  prize: number;
  points: number;
  balance: number;
}

export interface RankingEntry {
  id: string;
  playerId: string;
  playerName: string;
  photoUrl?: string;
  totalPoints: number;
  gamesPlayed: number;
  bestPosition: number;
}
