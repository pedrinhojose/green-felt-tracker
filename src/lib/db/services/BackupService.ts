
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

  async importBackup(backupJson: string): Promise<void> {
    try {
      const backupData = JSON.parse(backupJson);
      
      // Validate backup structure
      if (!backupData.players || !backupData.seasons || !backupData.games || !backupData.rankings) {
        throw new Error('Arquivo de backup inválido: estrutura incorreta');
      }

      const db = await this.db;
      const tx = db.transaction(['players', 'seasons', 'games', 'rankings'], 'readwrite');

      // Clear existing data
      await tx.objectStore('players').clear();
      await tx.objectStore('seasons').clear();
      await tx.objectStore('games').clear();
      await tx.objectStore('rankings').clear();

      // Import players
      for (const player of backupData.players) {
        await tx.objectStore('players').put(player);
      }

      // Import seasons
      for (const season of backupData.seasons) {
        await tx.objectStore('seasons').put(season);
      }

      // Import games
      for (const game of backupData.games) {
        await tx.objectStore('games').put(game);
      }

      // Import rankings
      for (const ranking of backupData.rankings) {
        await tx.objectStore('rankings').put(ranking);
      }

      await tx.done;
    } catch (error) {
      throw new Error(`Erro ao importar backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}
