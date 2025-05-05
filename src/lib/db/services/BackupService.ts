
import { IDBPDatabase } from 'idb';
import { PokerDB } from '../schema/PokerDBSchema';
import { PlayerRepository } from '../repositories/PlayerRepository';
import { SeasonRepository } from '../repositories/SeasonRepository';
import { GameRepository } from '../repositories/GameRepository';
import { RankingRepository } from '../repositories/RankingRepository';

export class BackupService {
  private playerRepository: PlayerRepository;
  private seasonRepository: SeasonRepository;
  private gameRepository: GameRepository;
  private rankingRepository: RankingRepository;

  constructor(private db: Promise<IDBPDatabase<PokerDB>>) {
    this.playerRepository = new PlayerRepository(db);
    this.seasonRepository = new SeasonRepository(db);
    this.gameRepository = new GameRepository(db);
    this.rankingRepository = new RankingRepository(db);
  }

  async exportBackup(): Promise<string> {
    const players = await this.playerRepository.getPlayers();
    const seasons = await this.seasonRepository.getSeasons();
    
    const games = [];
    for (const season of seasons) {
      const seasonGames = await this.gameRepository.getGames(season.id);
      games.push(...seasonGames);
    }
    
    const rankings = [];
    for (const season of seasons) {
      const seasonRankings = await this.rankingRepository.getRankings(season.id);
      rankings.push(...seasonRankings);
    }
    
    const backupData = {
      players,
      seasons,
      games,
      rankings,
      exportDate: new Date(),
    };
    
    return JSON.stringify(backupData, null, 2);
  }
}
