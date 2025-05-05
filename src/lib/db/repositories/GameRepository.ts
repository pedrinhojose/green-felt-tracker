
import { IDBPDatabase } from 'idb';
import { Game } from '../models';
import { PokerDB } from '../schema/PokerDBSchema';

export class GameRepository {
  constructor(private db: Promise<IDBPDatabase<PokerDB>>) {}

  async getGames(seasonId: string): Promise<Game[]> {
    return (await this.db).getAllFromIndex('games', 'by-season', seasonId);
  }

  async getGame(id: string): Promise<Game | undefined> {
    return (await this.db).get('games', id);
  }
  
  async getLastGame(): Promise<Game | undefined> {
    const db = await this.db;
    const games = await db.getAll('games');
    // Sort games by date in descending order
    const sortedGames = games.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sortedGames[0];
  }

  async saveGame(game: Game): Promise<string> {
    await (await this.db).put('games', game);
    return game.id;
  }

  async deleteGame(id: string): Promise<void> {
    await (await this.db).delete('games', id);
  }
}
