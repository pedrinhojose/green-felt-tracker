
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
  
  async updateJackpot(seasonId: string, amount: number): Promise<void> {
    const season = await this.getSeason(seasonId);
    if (!season) {
      throw new Error('Temporada não encontrada');
    }
    
    // Adiciona o valor ao jackpot atual
    season.jackpot += amount;
    
    // Garante que o jackpot não seja negativo
    if (season.jackpot < 0) {
      season.jackpot = 0;
    }
    
    // Salva a temporada atualizada
    await this.saveSeason(season);
  }
}
