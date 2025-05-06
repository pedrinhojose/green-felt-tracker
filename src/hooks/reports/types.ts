
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
  totalRebuys: number; // Adicionado campo para total de rebuys
}

export interface SeasonSummary {
  totalGames: number;
  totalPlayers: number;
  totalPrizePool: number;
  totalBuyIns: number;
  totalRebuys: number;
  totalAddons: number;
}

// Helper function to get player name from player ID
export const getPlayerName = (playerId: string, playersList: Player[]): string => {
  const player = playersList.find(p => p.id === playerId);
  return player?.name || 'Jogador Desconhecido';
};
