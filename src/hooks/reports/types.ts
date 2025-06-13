
import { Player } from "@/lib/db/models";

export interface PlayerPerformanceStats {
  playerId: string;
  playerName: string;
  gamesPlayed: number;
  victories: number;
  averagePosition: number;
  totalWinnings: number;
  totalInvestment: number;
  balance: number;
  totalPoints: number; 
  totalRebuys: number;
  photoUrl?: string;
  // Novas métricas
  roi: number; // Return on Investment em porcentagem
  winRate: number; // Taxa de vitórias em porcentagem
  itmRate: number; // Taxa de In The Money em porcentagem
  biggestPrize: number; // Maior prêmio individual recebido
}

export interface SeasonSummary {
  totalGames: number;
  totalPlayers: number;
  totalPrizePool: number;
  totalBuyIns: number;
  totalRebuys: number;
  totalAddons: number;
  totalDinnerCost: number;
}

// Helper function to get player name from player ID
export const getPlayerName = (playerId: string, playersList: Player[]): string => {
  const player = playersList.find(p => p.id === playerId);
  return player?.name || 'Jogador Desconhecido';
};
