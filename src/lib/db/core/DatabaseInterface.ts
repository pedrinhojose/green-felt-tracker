import { Player, Season, Game, RankingEntry, ClubFundTransaction } from '../models';
import { ClubFundTransactionFilters } from '../repositories/ClubFundRepository';

export interface DatabaseInterface {
  // Players
  getPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | undefined>;
  savePlayer(player: Partial<Player>): Promise<string>;
  deletePlayer(id: string): Promise<void>;

  // Seasons
  getSeasons(): Promise<Season[]>;
  getSeason(id: string): Promise<Season | undefined>;
  saveSeason(season: Partial<Season>): Promise<string>;
  deleteSeason(id: string): Promise<void>;
  getActiveSeason(): Promise<Season | null>;

  // Games
  getGames(): Promise<Game[]>;
  getGame(id: string): Promise<Game | undefined>;
  saveGame(game: Partial<Game>): Promise<string>;
  deleteGame(id: string): Promise<void>;
  getGamesBySeasonId(seasonId: string): Promise<Game[]>;

  // Rankings
  getRankings(): Promise<RankingEntry[]>;
  getRanking(id: string): Promise<RankingEntry | undefined>;
  saveRanking(ranking: Partial<RankingEntry>): Promise<string>;
  deleteRanking(id: string): Promise<void>;
  getRankingsBySeasonId(seasonId: string): Promise<RankingEntry[]>;

  // Club Fund Transactions
  getClubFundTransactions(
    filters?: ClubFundTransactionFilters,
    page?: number,
    limit?: number
  ): Promise<ClubFundTransaction[]>;
  getClubFundTransaction(id: string): Promise<ClubFundTransaction | undefined>;
  saveClubFundTransaction(transaction: Partial<ClubFundTransaction>): Promise<string>;
  deleteClubFundTransaction(id: string): Promise<void>;

  // Utilities
  exportBackup(): Promise<string>;
  importBackup(backupJson: string): Promise<void>;
}