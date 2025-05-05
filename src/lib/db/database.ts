import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Player, Season, Game, RankingEntry } from './models';

interface PokerDB extends DBSchema {
  players: {
    key: string;
    value: Player;
    indexes: { 'by-name': string };
  };
  seasons: {
    key: string;
    value: Season;
    indexes: { 'by-active': number }; // Changed to number (0/1) instead of boolean
  };
  games: {
    key: string;
    value: Game;
    indexes: { 'by-season': string; 'by-date': Date };
  };
  rankings: {
    key: string;
    value: RankingEntry;
    indexes: { 'by-season': string; 'by-points': number };
  };
}

class PokerDatabase {
  private db: Promise<IDBPDatabase<PokerDB>>;
  private static instance: PokerDatabase;

  private constructor() {
    this.db = this.initDB();
  }

  static getInstance(): PokerDatabase {
    if (!PokerDatabase.instance) {
      PokerDatabase.instance = new PokerDatabase();
    }
    return PokerDatabase.instance;
  }

  private async initDB() {
    return openDB<PokerDB>('apa-poker-db', 1, {
      upgrade(db) {
        // Players store
        if (!db.objectStoreNames.contains('players')) {
          const playerStore = db.createObjectStore('players', { keyPath: 'id' });
          playerStore.createIndex('by-name', 'name');
        }

        // Seasons store
        if (!db.objectStoreNames.contains('seasons')) {
          const seasonStore = db.createObjectStore('seasons', { keyPath: 'id' });
          seasonStore.createIndex('by-active', 'isActive');
        }

        // Games store
        if (!db.objectStoreNames.contains('games')) {
          const gameStore = db.createObjectStore('games', { keyPath: 'id' });
          gameStore.createIndex('by-season', 'seasonId');
          gameStore.createIndex('by-date', 'date');
        }

        // Rankings store
        if (!db.objectStoreNames.contains('rankings')) {
          const rankingStore = db.createObjectStore('rankings', { keyPath: 'id' });
          rankingStore.createIndex('by-season', 'seasonId');
          rankingStore.createIndex('by-points', 'totalPoints');
        }
      }
    });
  }

  // Player methods
  async getPlayers(): Promise<Player[]> {
    return (await this.db).getAll('players');
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return (await this.db).get('players', id);
  }

  async savePlayer(player: Player): Promise<string> {
    await (await this.db).put('players', player);
    return player.id;
  }

  async deletePlayer(id: string): Promise<void> {
    await (await this.db).delete('players', id);
  }

  // Season methods
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

  // Game methods
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

  // Ranking methods
  async getRankings(seasonId: string): Promise<RankingEntry[]> {
    try {
      const db = await this.db;
      // Adicione logs para depuração
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
  
  // Backup method
  async exportBackup(): Promise<string> {
    const players = await this.getPlayers();
    const seasons = await this.getSeasons();
    
    const games: Game[] = [];
    for (const season of seasons) {
      const seasonGames = await this.getGames(season.id);
      games.push(...seasonGames);
    }
    
    const rankings: RankingEntry[] = [];
    for (const season of seasons) {
      const seasonRankings = await this.getRankings(season.id);
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

export const pokerDB = PokerDatabase.getInstance();
