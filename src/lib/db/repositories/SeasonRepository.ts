
import { IDBPDatabase } from 'idb';
import { Season } from '../models';
import { PokerDB } from '../schema/PokerDBSchema';

export class SeasonRepository {
  constructor(private db: Promise<IDBPDatabase<PokerDB>>) {}

  async getSeasons(): Promise<Season[]> {
    return (await this.db).getAll('seasons');
  }
  
  async getActiveSeason(): Promise<Season | undefined> {
    // Updated to use 1 instead of true for the active status
    return (await this.db).getFromIndex('seasons', 'by-active', 1);
  }

  async getSeason(id: string): Promise<Season | undefined> {
    return (await this.db).get('seasons', id);
  }

  async saveSeason(season: Season): Promise<string> {
    await (await this.db).put('seasons', season);
    return season.id;
  }

  async deleteSeason(id: string): Promise<void> {
    await (await this.db).delete('seasons', id);
  }
}
