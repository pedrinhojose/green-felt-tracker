import { DatabaseCore } from './core/DatabaseCore';
import { IndexedDBCore } from './core/IndexedDBCore';
import { SupabaseRepository } from './core/SupabaseRepository';
import { PlayerRepository } from './repositories/PlayerRepository';
import { SeasonRepository } from './repositories/SeasonRepository';
import { GameRepository } from './repositories/GameRepository';
import { RankingRepository } from './repositories/RankingRepository';
import { BackupService } from './services/BackupService';
import { Player, Season, Game, RankingEntry, SeasonJackpotDistribution } from './models';
import { JackpotDistributionRepository } from './repositories/JackpotDistributionRepository';
import { supabase } from '@/integrations/supabase/client';

class PokerDatabase {
  private static instance: PokerDatabase;
  
  private playerRepository: PlayerRepository;
  private seasonRepository: SeasonRepository;
  private gameRepository: GameRepository;
  private rankingRepository: RankingRepository;
  private jackpotDistributionRepository: JackpotDistributionRepository;
  private backupService: BackupService;
  private dbCore: DatabaseCore;
  private useSupabase = true;

  private constructor() {
    this.dbCore = new DatabaseCore();
    const db = this.dbCore.getDatabase();
    
    // Use IndexedDB repositories as fallback when user is not authenticated
    this.playerRepository = new PlayerRepository(db);
    this.seasonRepository = new SeasonRepository(db);
    this.gameRepository = new GameRepository(db);
    this.rankingRepository = new RankingRepository(db);
    this.jackpotDistributionRepository = new JackpotDistributionRepository();
    this.backupService = new BackupService(db);
    
    // Initialize Supabase repositories
    this.checkAuthAndSetupRepositories();
    
    // Listen for auth changes
    this.setupAuthListener();
  }

  static getInstance(): PokerDatabase {
    if (!PokerDatabase.instance) {
      PokerDatabase.instance = new PokerDatabase();
    }
    return PokerDatabase.instance;
  }
  
  private async checkAuthAndSetupRepositories(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If user is authenticated, use Supabase repositories
      if (session && session.user) {
        console.log("PokerDatabase: User is authenticated, using Supabase repositories");
        this.setupSupabaseRepositories();
      } else {
        console.log("PokerDatabase: User is not authenticated, using IndexedDB repositories");
        this.useSupabase = false;
      }
    } catch (error) {
      console.error("PokerDatabase: Error checking auth status:", error);
      this.useSupabase = false;
    }
  }
  
  private setupSupabaseRepositories(): void {
    console.log("PokerDatabase: Setting up Supabase repositories");
    this.playerRepository = new PlayerRepository();
    this.seasonRepository = new SeasonRepository();
    this.gameRepository = new GameRepository();
    this.rankingRepository = new RankingRepository();
    this.jackpotDistributionRepository = new JackpotDistributionRepository();
    this.useSupabase = true;
    console.log("PokerDatabase: Supabase repositories initialized");
  }
  
  private setupAuthListener(): void {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log("PokerDatabase: Auth state change:", event);
      
      if (event === 'SIGNED_IN') {
        // Use setTimeout to prevent deadlocks
        setTimeout(() => {
          this.setupSupabaseRepositories();
          
          // REMOVED automatic migration from IndexedDB to Supabase
          // Now we prioritize Supabase data and don't migrate local data
          console.log("PokerDatabase: User signed in - using Supabase repositories without data migration");
          
          // Clear IndexedDB data to prevent future accidental migrations
          this.clearLocalData().catch(error => 
            console.error("PokerDatabase: Error during local data clearing:", error)
          );
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        // Switch back to IndexedDB
        const db = this.dbCore.getDatabase();
        this.playerRepository = new PlayerRepository(db);
        this.seasonRepository = new SeasonRepository(db);
        this.gameRepository = new GameRepository(db);
        this.rankingRepository = new RankingRepository(db);
        this.jackpotDistributionRepository = new JackpotDistributionRepository();
        this.useSupabase = false;
        console.log("PokerDatabase: Using IndexedDB repositories after sign out");
      }
    });
  }
  
  // New method to clear local IndexedDB data when user logs in
  private async clearLocalData(): Promise<void> {
    try {
      console.log("PokerDatabase: Clearing local IndexedDB data");
      const db = await this.dbCore.getDatabase();
      
      // Clear all stores in IndexedDB
      await db.clear('players');
      await db.clear('seasons');
      await db.clear('games');
      await db.clear('rankings');
      
      console.log("PokerDatabase: Local data cleared successfully");
    } catch (error) {
      console.error("PokerDatabase: Failed to clear local IndexedDB data:", error);
      throw error;
    }
  }

  // Player methods
  async getPlayers(): Promise<Player[]> {
    console.log("PokerDatabase.getPlayers: Iniciando busca de players");
    const result = await this.playerRepository.getPlayers();
    console.log("PokerDatabase.getPlayers: Resultado:", result.length, "players encontrados");
    return result;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.playerRepository.getPlayer(id);
  }

  async savePlayer(player: Player): Promise<string> {
    return this.playerRepository.savePlayer(player);
  }

  async deletePlayer(id: string): Promise<void> {
    return this.playerRepository.deletePlayer(id);
  }

  // Season methods
  async getSeasons(): Promise<Season[]> {
    console.log("PokerDatabase.getSeasons: Iniciando busca de seasons");
    const result = await this.seasonRepository.getSeasons();
    console.log("PokerDatabase.getSeasons: Resultado:", result.length, "seasons encontradas");
    return result;
  }
  
  async getActiveSeason(): Promise<Season | undefined> {
    console.log("PokerDatabase.getActiveSeason: Buscando season ativa");
    const result = await this.seasonRepository.getActiveSeason();
    console.log("PokerDatabase.getActiveSeason: Resultado:", result ? `Season ${result.name}` : 'nenhuma');
    return result;
  }

  async getSeason(id: string): Promise<Season | undefined> {
    return this.seasonRepository.getSeason(id);
  }

  async saveSeason(season: Season): Promise<string> {
    return this.seasonRepository.saveSeason(season);
  }

  async deleteSeason(id: string): Promise<void> {
    return this.seasonRepository.deleteSeason(id);
  }

  async updateJackpot(seasonId: string, amount: number): Promise<void> {
    return this.seasonRepository.updateJackpot(seasonId, amount);
  }

  // Game methods
  async getGameNumbers(seasonId: string): Promise<number[]> {
    console.log("PokerDatabase.getGameNumbers: Buscando números de games para season:", seasonId);
    const result = await this.gameRepository.getGameNumbers(seasonId);
    console.log("PokerDatabase.getGameNumbers: Resultado:", result.length, "números encontrados");
    return result;
  }

  async getGames(seasonId: string): Promise<Game[]> {
    console.log("PokerDatabase.getGames: Iniciando busca de games para season:", seasonId);
    const result = await this.gameRepository.getGames(seasonId);
    console.log("PokerDatabase.getGames: Resultado:", result.length, "games encontrados");
    return result;
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.gameRepository.getGame(id);
  }
  
  async getLastGame(): Promise<Game | undefined> {
    console.log("PokerDatabase.getLastGame: Buscando último game");
    const result = await this.gameRepository.getLastGame();
    console.log("PokerDatabase.getLastGame: Resultado:", result ? `Game ${result.number}` : 'nenhum');
    return result;
  }

  async saveGame(game: Game): Promise<string> {
    return this.gameRepository.saveGame(game);
  }

  async deleteGame(id: string): Promise<void> {
    return this.gameRepository.deleteGame(id);
  }

  // Ranking methods
  async getRankings(seasonId: string): Promise<RankingEntry[]> {
    console.log("PokerDatabase.getRankings: Iniciando busca de rankings para season:", seasonId);
    const result = await this.rankingRepository.getRankings(seasonId);
    console.log("PokerDatabase.getRankings: Resultado:", result.length, "rankings encontrados");
    return result;
  }

  async saveRanking(ranking: RankingEntry): Promise<void> {
    return this.rankingRepository.saveRanking(ranking);
  }

  async deleteRankingsBySeason(seasonId: string): Promise<void> {
    return this.rankingRepository.deleteRankingsBySeason(seasonId);
  }

  async saveRankingsBulk(rankings: RankingEntry[]): Promise<void> {
    return this.rankingRepository.saveRankingsBulk(rankings);
  }

  // Jackpot Distribution methods
  async saveJackpotDistributions(distributions: Partial<SeasonJackpotDistribution>[]): Promise<void> {
    return this.jackpotDistributionRepository.saveDistributions(distributions);
  }

  async getJackpotDistributionsBySeasonId(seasonId: string): Promise<SeasonJackpotDistribution[]> {
    return this.jackpotDistributionRepository.getDistributionsBySeasonId(seasonId);
  }

  async getJackpotDistributionsByPlayerId(playerId: string): Promise<SeasonJackpotDistribution[]> {
    return this.jackpotDistributionRepository.getDistributionsByPlayerId(playerId);
  }

  // Backup method
  async exportBackup(): Promise<string> {
    return this.backupService.exportBackup();
  }

  async importBackup(backupJson: string): Promise<void> {
    return this.backupService.importBackup(backupJson);
  }
}

export const pokerDB = PokerDatabase.getInstance();
