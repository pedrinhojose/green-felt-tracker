export interface Player {
  id: string;
  name: string;
  photoUrl?: string;
  phone?: string;
  city?: string;
  birthDate?: Date;
  userId: string;
  organizationId?: string;
  photoBase64?: string;
  createdAt: Date;
}

export interface Season {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  gameFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  gamesPerPeriod: number;
  isActive: boolean;
  scoreSchema: ScoreEntry[];
  weeklyPrizeSchema: PrizeEntry[];
  seasonPrizeSchema: PrizeEntry[];
  financialParams: FinancialParams;
  blindStructure: BlindLevel[];
  jackpot: number;
  clubFund: number;
  houseRules: string;
  hostSchedule: HostScheduleEntry[];
  createdAt: Date;
}

export interface BlindLevel {
  id: string;
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  duration: number; // in minutes
  isBreak: boolean;
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
  jackpotContribution: number;
  clubFundContribution: number;
  pixKey?: string;
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
  participatesInClubFund: boolean;
  isEliminated: boolean;
  prize: number;
  points: number;
  balance: number;
  clubFundContribution: number;
}

export interface RankingEntry {
  id: string;
  playerId: string;
  playerName: string;
  photoUrl?: string;
  totalPoints: number;
  gamesPlayed: number;
  bestPosition: number;
  seasonId: string; // Adicionando o campo seasonId obrigatório
}

export interface HostScheduleEntry {
  id: string;
  playerId: string;
  playerName: string;
  scheduledDate: Date;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  gameId?: string;
  notes?: string;
}

export interface HostScheduleConfig {
  startDate: Date;
  endDate: Date;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
}

export interface SeasonJackpotDistribution {
  id: string;
  seasonId: string;
  playerId: string;
  playerName: string;
  position: number;
  percentage: number;
  prizeAmount: number;
  totalJackpot: number;
  distributedAt: Date;
  createdAt: Date;
  organizationId?: string;
  userId: string;
}
