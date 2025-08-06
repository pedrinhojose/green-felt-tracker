export interface Player {
  id: string;
  name: string;
  photoUrl?: string;
  phone?: string;
  city?: string;
  userId: string;
  organizationId?: string;
  photoBase64?: string;
  createdAt: Date;
  lastMembershipCharge?: Date; // Última cobrança de mensalidade
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
  clubMembershipValue: number;
  clubMembershipFrequency: 'semanal' | 'mensal' | 'trimestral';
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
  membershipCharges?: MembershipCharge[]; // Cobranças de mensalidade desta partida
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
  membershipCharged?: boolean; // Se foi cobrada mensalidade nesta partida
}

export interface MembershipCharge {
  playerId: string;
  amount: number;
  frequency: 'semanal' | 'mensal' | 'trimestral';
  chargedAt: Date;
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

export interface ClubFundTransaction {
  id: string;
  seasonId: string;
  amount: number;
  type: 'add' | 'remove' | 'membership'; // Adicionado 'membership' para cobranças automáticas
  description: string;
  date: Date;
  userId: string;
  userEmail?: string;
}