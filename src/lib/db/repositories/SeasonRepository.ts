
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
    // Obtém uma transação para garantir operações atômicas
    const db = await this.db;
    const tx = db.transaction('seasons', 'readwrite');
    
    try {
      // Obter a temporada atual
      const season = await tx.store.get(seasonId);
      if (!season) {
        throw new Error('Temporada não encontrada');
      }
      
      // Calcular novo valor do jackpot (garantindo que não seja negativo)
      const newJackpot = Math.max(0, (season.jackpot || 0) + amount);
      
      // Atualizar temporada
      season.jackpot = newJackpot;
      
      // Salvar temporada atualizada
      await tx.store.put(season);
      
      // Confirmar transação
      await tx.done;
      
    } catch (error) {
      // Qualquer erro cancela a transação automaticamente
      console.error('Erro na transação:', error);
      throw error;
    }
  }
}
