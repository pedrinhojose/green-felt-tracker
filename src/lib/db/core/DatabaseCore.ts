
import { openDB, IDBPDatabase } from 'idb';
import { PokerDB } from '../schema/PokerDBSchema';

export class DatabaseCore {
  protected db: Promise<IDBPDatabase<PokerDB>>;

  constructor() {
    this.db = this.initDB();
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

        // Club Fund Transactions store
        if (!db.objectStoreNames.contains('clubFundTransactions')) {
          const transactionStore = db.createObjectStore('clubFundTransactions', { keyPath: 'id' });
          transactionStore.createIndex('by-season', 'seasonId');
          transactionStore.createIndex('by-date', 'date');
          transactionStore.createIndex('by-type', 'type');
        }
      }
    });
  }
  
  // Method to access the database instance
  getDatabase(): Promise<IDBPDatabase<PokerDB>> {
    return this.db;
  }
}
