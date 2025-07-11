import { IDBPDatabase } from 'idb';
import { Game, GamePlayer } from '../models';
import { PokerDB } from '../schema/PokerDBSchema';
import { supabase } from "@/integrations/supabase/client";
import { SupabaseCore } from '../core/SupabaseCore';
import { Json } from '@/integrations/supabase/types';

export class GameRepository extends SupabaseCore {
  private idbDb: Promise<IDBPDatabase<PokerDB>> | null = null;
  private useSupabase = true;

  constructor(idbDb?: Promise<IDBPDatabase<PokerDB>>) {
    super();
    this.idbDb = idbDb || null;
    
    if (idbDb) {
      this.useSupabase = false;
    }
  }

  async getGameNumbers(seasonId: string): Promise<number[]> {
    if (this.useSupabase) {
      try {
        const orgId = this.getCurrentOrganizationId();
        
        if (!orgId) {
          console.warn("GameRepository.getGameNumbers: No organization selected, returning empty list");
          return [];
        }
        
        // Query only the number field for performance
        const { data, error } = await supabase
          .from('games')
          .select('number')
          .eq('season_id', seasonId)
          .eq('organization_id', orgId)
          .order('number', { ascending: true });
          
        if (error) {
          console.error("GameRepository.getGameNumbers: Supabase error:", error);
          throw error;
        }
        
        return data?.map(game => game.number) || [];
      } catch (error) {
        console.error("GameRepository.getGameNumbers: Error fetching game numbers from Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      const games = await (await this.idbDb).getAllFromIndex('games', 'by-season', seasonId);
      return games.map(game => game.number).sort((a, b) => a - b);
    }
    
    return [];
  }

  async getGames(seasonId: string): Promise<Game[]> {
    if (this.useSupabase) {
      try {
        const orgId = this.getCurrentOrganizationId();
        
        console.log("GameRepository.getGames: Buscando games", {
          seasonId,
          orgId,
          useSupabase: this.useSupabase
        });
        
        if (!orgId) {
          console.warn("GameRepository.getGames: No organization selected, returning empty games list");
          return [];
        }
        
        // Simple query - RLS policies will handle the filtering
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('season_id', seasonId)
          .eq('organization_id', orgId);
          
        if (error) {
          console.error("GameRepository.getGames: Supabase error:", error);
          throw error;
        }
        
        console.log("GameRepository.getGames: Dados recebidos do Supabase:", data?.length || 0);
        
        return data.map(game => ({
          id: game.id,
          number: game.number,
          seasonId: game.season_id,
          date: new Date(game.date),
          players: game.players as unknown as GamePlayer[],
          totalPrizePool: Number(game.total_prize_pool),
          dinnerCost: game.dinner_cost ? Number(game.dinner_cost) : undefined,
          isFinished: game.is_finished,
          createdAt: new Date(game.created_at)
        })) as Game[];
      } catch (error) {
        console.error("GameRepository.getGames: Error fetching games from Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      return (await this.idbDb).getAllFromIndex('games', 'by-season', seasonId);
    }
    
    return [];
  }

  async getGame(id: string): Promise<Game | undefined> {
    if (this.useSupabase) {
      try {
        const orgId = this.getCurrentOrganizationId();
        
        console.log("GameRepository.getGame: Buscando game", {
          gameId: id,
          orgId,
          useSupabase: this.useSupabase
        });
        
        if (!orgId) {
          console.warn("GameRepository.getGame: No organization selected, cannot get game");
          return undefined;
        }
        
        // Simple query - RLS policies will handle the filtering
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('id', id)
          .eq('organization_id', orgId)
          .maybeSingle();
          
        if (error) {
          console.error("GameRepository.getGame: Supabase error:", error);
          throw error;
        }
        
        console.log("GameRepository.getGame: Game encontrado:", !!data);
        
        if (!data) return undefined;
        
        return {
          id: data.id,
          number: data.number,
          seasonId: data.season_id,
          date: new Date(data.date),
          players: data.players as unknown as GamePlayer[],
          totalPrizePool: Number(data.total_prize_pool),
          dinnerCost: data.dinner_cost ? Number(data.dinner_cost) : undefined,
          isFinished: data.is_finished,
          createdAt: new Date(data.created_at)
        } as Game;
      } catch (error) {
        console.error("GameRepository.getGame: Error fetching game from Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      return (await this.idbDb).get('games', id);
    }
    
    return undefined;
  }
  
  async getLastGame(): Promise<Game | undefined> {
    if (this.useSupabase) {
      try {
        const orgId = this.getCurrentOrganizationId();
        
        console.log("GameRepository.getLastGame: Buscando último game", {
          orgId,
          useSupabase: this.useSupabase
        });
        
        if (!orgId) {
          console.warn("GameRepository.getLastGame: No organization selected, cannot get last game");
          return undefined;
        }
        
        // Simple query - RLS policies will handle the filtering
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('organization_id', orgId)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (error) {
          console.error("GameRepository.getLastGame: Supabase error:", error);
          throw error;
        }
        
        console.log("GameRepository.getLastGame: Último game encontrado:", !!data);
        
        if (!data) return undefined;
        
        return {
          id: data.id,
          number: data.number,
          seasonId: data.season_id,
          date: new Date(data.date),
          players: data.players as unknown as GamePlayer[],
          totalPrizePool: Number(data.total_prize_pool),
          dinnerCost: data.dinner_cost ? Number(data.dinner_cost) : undefined,
          isFinished: data.is_finished,
          createdAt: new Date(data.created_at)
        } as Game;
      } catch (error) {
        console.error("GameRepository.getLastGame: Error fetching last game from Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      const db = await this.idbDb;
      const games = await db.getAll('games');
      // Sort games by date in descending order
      const sortedGames = games.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return sortedGames[0];
    }
    
    return undefined;
  }

  async saveGame(game: Game): Promise<string> {
    if (this.useSupabase) {
      try {
        const { userId, orgId } = await this.getUserAndOrgIds();
        
        const supabaseGame = {
          id: game.id,
          number: game.number,
          season_id: game.seasonId,
          date: game.date.toISOString(),
          players: game.players as unknown as Json,
          total_prize_pool: game.totalPrizePool,
          dinner_cost: game.dinnerCost,
          is_finished: game.isFinished,
          created_at: game.createdAt.toISOString(),
          user_id: userId,
          organization_id: orgId
        };
        
        const { error } = await supabase
          .from('games')
          .upsert(supabaseGame, { onConflict: 'id' });
          
        if (error) throw error;
        
        return game.id;
      } catch (error) {
        console.error("Error saving game to Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      await (await this.idbDb).put('games', game);
      return game.id;
    }
    
    throw new Error("No database available");
  }

  async deleteGame(id: string): Promise<void> {
    if (this.useSupabase) {
      try {
        const orgId = this.getCurrentOrganizationId();
        
        if (!orgId) {
          throw new Error("No organization selected, cannot delete game");
        }
        
        // RLS policies will handle access control
        const { error } = await supabase
          .from('games')
          .delete()
          .eq('id', id)
          .eq('organization_id', orgId);
          
        if (error) throw error;
      } catch (error) {
        console.error("Error deleting game from Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      await (await this.idbDb).delete('games', id);
    }
  }
  
  // Method to migrate games from IndexedDB to Supabase
  async migrateGamesFromIndexedDB(): Promise<void> {
    if (!this.idbDb) return;
    
    try {
      console.log("Starting game migration from IndexedDB to Supabase");
      const userId = await this.getUserId();
      const orgId = this.getCurrentOrganizationId();
      
      if (!orgId) {
        console.error("No organization selected for migration");
        return;
      }
      
      // Get all games from IndexedDB
      const idbGames = await (await this.idbDb).getAll('games');
      
      if (idbGames.length === 0) {
        console.log("No games to migrate");
        return;
      }
      
      console.log(`Found ${idbGames.length} games to migrate`);
      
      // Prepare the games for Supabase format
      const supabaseGames = idbGames.map(game => ({
        id: game.id,
        number: game.number,
        season_id: game.seasonId,
        date: game.date.toISOString(),
        players: game.players as unknown as Json,
        total_prize_pool: game.totalPrizePool,
        dinner_cost: game.dinnerCost,
        is_finished: game.isFinished,
        created_at: game.createdAt.toISOString(),
        user_id: userId,
        organization_id: orgId
      }));
      
      // Upsert all games to Supabase
      const { error } = await supabase
        .from('games')
        .upsert(supabaseGames, { onConflict: 'id' });
        
      if (error) throw error;
      
      console.log(`Successfully migrated ${supabaseGames.length} games to Supabase`);
    } catch (error) {
      console.error("Error migrating games to Supabase:", error);
      throw error;
    }
  }
}
