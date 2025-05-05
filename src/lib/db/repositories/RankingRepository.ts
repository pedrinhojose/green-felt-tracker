
import { IDBPDatabase } from 'idb';
import { RankingEntry } from '../models';
import { PokerDB } from '../schema/PokerDBSchema';

export class RankingRepository {
  constructor(private db: Promise<IDBPDatabase<PokerDB>>) {}

  async getRankings(seasonId: string): Promise<RankingEntry[]> {
    try {
      const db = await this.db;
      console.log("Buscando rankings para seasonId:", seasonId);
      
      // Obtenha todos os rankings
      const allRankings = await db.getAll('rankings');
      console.log("Total de rankings encontrados:", allRankings.length);
      
      // Filtre manualmente por seasonId
      const seasonRankings = allRankings.filter(r => r.seasonId === seasonId);
      console.log("Rankings filtrados para esta temporada:", seasonRankings.length);
      
      // Ordene por pontos em ordem decrescente
      return seasonRankings.sort((a, b) => b.totalPoints - a.totalPoints);
    } catch (error) {
      console.error("Erro ao buscar rankings:", error);
      return [];
    }
  }

  async saveRanking(ranking: RankingEntry): Promise<void> {
    try {
      if (!ranking.seasonId) {
        console.error("Erro: Tentativa de salvar ranking sem seasonId", ranking);
        throw new Error("seasonId é obrigatório para salvar um ranking");
      }
      await (await this.db).put('rankings', ranking);
      console.log("Ranking salvo com sucesso:", ranking.id);
    } catch (error) {
      console.error("Erro ao salvar ranking:", error);
      throw error;
    }
  }
}
