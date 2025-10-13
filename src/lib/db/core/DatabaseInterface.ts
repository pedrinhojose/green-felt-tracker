import { Player, Season, Game, RankingEntry, SeasonJackpotDistribution } from '../models';

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

  // Jackpot Distributions
  saveJackpotDistributions(distributions: Partial<SeasonJackpotDistribution>[]): Promise<void>;
  getJackpotDistributionsBySeasonId(seasonId: string): Promise<SeasonJackpotDistribution[]>;
  getJackpotDistributionsByPlayerId(playerId: string): Promise<SeasonJackpotDistribution[]>;

  // Utilities
  exportBackup(): Promise<string>;
  importBackup(backupJson: string): Promise<void>;
}