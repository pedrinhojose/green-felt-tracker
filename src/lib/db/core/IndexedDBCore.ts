import { DatabaseCore } from './DatabaseCore';
import { DatabaseInterface } from './DatabaseInterface';
import { Player, Season, Game, RankingEntry } from '../models';
import { v4 as uuidv4 } from 'uuid';

export class IndexedDBCore extends DatabaseCore implements DatabaseInterface {
  // Players
  async getPlayers(): Promise<Player[]> {
    const db = await this.getDatabase();
    return db.getAll('players');
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const db = await this.getDatabase();
    return db.get('players', id);
  }

  async savePlayer(player: Partial<Player>): Promise<string> {
    const db = await this.getDatabase();
    const id = player.id || uuidv4();
    const playerData: Player = {
      ...player,
      id,
      createdAt: player.createdAt || new Date(),
    } as Player;
    
    await db.put('players', playerData);
    return id;
  }

  async deletePlayer(id: string): Promise<void> {
    const db = await this.getDatabase();
    await db.delete('players', id);
  }

  // Seasons
  async getSeasons(): Promise<Season[]> {
    const db = await this.getDatabase();
    return db.getAll('seasons');
  }

  async getSeason(id: string): Promise<Season | undefined> {
    const db = await this.getDatabase();
    return db.get('seasons', id);
  }

  async saveSeason(season: Partial<Season>): Promise<string> {
    const db = await this.getDatabase();
    const id = season.id || uuidv4();
    const seasonData: Season = {
      ...season,
      id,
      createdAt: season.createdAt || new Date(),
    } as Season;
    
    await db.put('seasons', seasonData);
    return id;
  }

  async deleteSeason(id: string): Promise<void> {
    const db = await this.getDatabase();
    await db.delete('seasons', id);
  }

  async getActiveSeason(): Promise<Season | null> {
    const seasons = await this.getSeasons();
    return seasons.find(season => season.isActive) || null;
  }

  // Games
  async getGames(): Promise<Game[]> {
    const db = await this.getDatabase();
    return db.getAll('games');
  }

  async getGame(id: string): Promise<Game | undefined> {
    const db = await this.getDatabase();
    return db.get('games', id);
  }

  async saveGame(game: Partial<Game>): Promise<string> {
    const db = await this.getDatabase();
    const id = game.id || uuidv4();
    const gameData: Game = {
      ...game,
      id,
      createdAt: game.createdAt || new Date(),
    } as Game;
    
    await db.put('games', gameData);
    return id;
  }

  async deleteGame(id: string): Promise<void> {
    const db = await this.getDatabase();
    await db.delete('games', id);
  }

  async getGamesBySeasonId(seasonId: string): Promise<Game[]> {
    const db = await this.getDatabase();
    return db.getAllFromIndex('games', 'by-season', seasonId);
  }

  // Rankings
  async getRankings(): Promise<RankingEntry[]> {
    const db = await this.getDatabase();
    return db.getAll('rankings');
  }

  async getRanking(id: string): Promise<RankingEntry | undefined> {
    const db = await this.getDatabase();
    return db.get('rankings', id);
  }

  async saveRanking(ranking: Partial<RankingEntry>): Promise<string> {
    const db = await this.getDatabase();
    const id = ranking.id || uuidv4();
    const rankingData: RankingEntry = {
      ...ranking,
      id,
    } as RankingEntry;
    
    await db.put('rankings', rankingData);
    return id;
  }

  async deleteRanking(id: string): Promise<void> {
    const db = await this.getDatabase();
    await db.delete('rankings', id);
  }

  async getRankingsBySeasonId(seasonId: string): Promise<RankingEntry[]> {
    const db = await this.getDatabase();
    return db.getAllFromIndex('rankings', 'by-season', seasonId);
  }


  // Utilities
  async exportBackup(): Promise<string> {
    const players = await this.getPlayers();
    const seasons = await this.getSeasons();
    const games = await this.getGames();
    const rankings = await this.getRankings();

    return JSON.stringify({
      players,
      seasons,
      games,
      rankings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    });
  }

  async importBackup(backupJson: string): Promise<void> {
    const data = JSON.parse(backupJson);
    const db = await this.getDatabase();

    // Clear existing data
    await db.clear('players');
    await db.clear('seasons');
    await db.clear('games');
    await db.clear('rankings');

    // Import data
    if (data.players) {
      for (const player of data.players) {
        await db.put('players', player);
      }
    }

    if (data.seasons) {
      for (const season of data.seasons) {
        await db.put('seasons', season);
      }
    }

    if (data.games) {
      for (const game of data.games) {
        await db.put('games', game);
      }
    }

    if (data.rankings) {
      for (const ranking of data.rankings) {
        await db.put('rankings', ranking);
      }
    }
  }
}