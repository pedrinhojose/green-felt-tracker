
import { DatabaseCore } from './core/DatabaseCore';
import { PlayerRepository } from './repositories/PlayerRepository';
import { SeasonRepository } from './repositories/SeasonRepository';
import { GameRepository } from './repositories/GameRepository';
import { RankingRepository } from './repositories/RankingRepository';
import { BackupService } from './services/BackupService';
import { Player, Season, Game, RankingEntry } from './models';

class PokerDatabase extends DatabaseCore {
  private static instance: PokerDatabase;
  
  private playerRepository: PlayerRepository;
  private seasonRepository: SeasonRepository;
  private gameRepository: GameRepository;
  private rankingRepository: RankingRepository;
  private backupService: BackupService;

  private constructor() {
    super();
    this.playerRepository = new PlayerRepository(this.db);
    this.seasonRepository = new SeasonRepository(this.db);
    this.gameRepository = new GameRepository(this.db);
    this.rankingRepository = new RankingRepository(this.db);
    this.backupService = new BackupService(this.db);
  }

  static getInstance(): PokerDatabase {
    if (!PokerDatabase.instance) {
      PokerDatabase.instance = new PokerDatabase();
    }
    return PokerDatabase.instance;
  }

  // Player methods
  async getPlayers(): Promise<Player[]> {
    return this.playerRepository.getPlayers();
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.playerRepository.getPlayer(id);
  }

  async savePlayer(player: Player): Promise<string> {
    return this.playerRepository.savePlayer(player);
  }

  async deletePlayer(id: string): Promise<void> {
    return this.playerRepository.deletePlayer(id);
  }

  // Season methods
  async getSeasons(): Promise<Season[]> {
    return this.seasonRepository.getSeasons();
  }
  
  async getActiveSeason(): Promise<Season | undefined> {
    return this.seasonRepository.getActiveSeason();
  }

  async getSeason(id: string): Promise<Season | undefined> {
    return this.seasonRepository.getSeason(id);
  }

  async saveSeason(season: Season): Promise<string> {
    return this.seasonRepository.saveSeason(season);
  }

  async deleteSeason(id: string): Promise<void> {
    return this.seasonRepository.deleteSeason(id);
  }

  // Game methods
  async getGames(seasonId: string): Promise<Game[]> {
    return this.gameRepository.getGames(seasonId);
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.gameRepository.getGame(id);
  }
  
  async getLastGame(): Promise<Game | undefined> {
    return this.gameRepository.getLastGame();
  }

  async saveGame(game: Game): Promise<string> {
    return this.gameRepository.saveGame(game);
  }

  async deleteGame(id: string): Promise<void> {
    return this.gameRepository.deleteGame(id);
  }

  // Ranking methods
  async getRankings(seasonId: string): Promise<RankingEntry[]> {
    return this.rankingRepository.getRankings(seasonId);
  }

  async saveRanking(ranking: RankingEntry): Promise<void> {
    return this.rankingRepository.saveRanking(ranking);
  }
  
  // Backup method
  async exportBackup(): Promise<string> {
    return this.backupService.exportBackup();
  }
}

export const pokerDB = PokerDatabase.getInstance();
