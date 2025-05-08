
import { IDBPDatabase } from 'idb';
import { Player } from '../models';
import { PokerDB } from '../schema/PokerDBSchema';
import { supabase } from "@/integrations/supabase/client";
import { SupabaseCore } from '../core/SupabaseCore';

export class PlayerRepository extends SupabaseCore {
  private idbDb: Promise<IDBPDatabase<PokerDB>> | null = null;
  private useSupabase = true;

  constructor(idbDb?: Promise<IDBPDatabase<PokerDB>>) {
    super();
    this.idbDb = idbDb || null;
    
    // If idbDb is provided, we'll use it for offline/fallback functionality
    if (idbDb) {
      this.useSupabase = false;
    }
  }

  async getPlayers(): Promise<Player[]> {
    if (this.useSupabase) {
      try {
        const userId = await this.getUserId();
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', userId);
          
        if (error) throw error;
        
        return data.map(player => ({
          ...player,
          createdAt: new Date(player.created_at)
        })) as Player[];
      } catch (error) {
        console.error("Error fetching players from Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      return (await this.idbDb).getAll('players');
    }
    
    return [];
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    if (this.useSupabase) {
      try {
        const userId = await this.getUserId();
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            // No data found
            return undefined;
          }
          throw error;
        }
        
        return {
          ...data,
          createdAt: new Date(data.created_at)
        } as Player;
      } catch (error) {
        console.error("Error fetching player from Supabase:", error);
        if (String(error).includes('No row found')) return undefined;
        throw error;
      }
    } else if (this.idbDb) {
      return (await this.idbDb).get('players', id);
    }
    
    return undefined;
  }

  async savePlayer(player: Player): Promise<string> {
    if (this.useSupabase) {
      try {
        const userId = await this.getUserId();
        
        const supabasePlayer = {
          id: player.id,
          name: player.name,
          photo_url: player.photoUrl,
          phone: player.phone,
          city: player.city,
          created_at: player.createdAt.toISOString(),
          user_id: userId
        };
        
        const { data, error } = await supabase
          .from('players')
          .upsert(supabasePlayer, { 
            onConflict: 'id'
          })
          .select();
          
        if (error) throw error;
        
        return player.id;
      } catch (error) {
        console.error("Error saving player to Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      await (await this.idbDb).put('players', player);
      return player.id;
    }
    
    throw new Error("No database available");
  }

  async deletePlayer(id: string): Promise<void> {
    if (this.useSupabase) {
      try {
        const userId = await this.getUserId();
        
        const { error } = await supabase
          .from('players')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
          
        if (error) throw error;
        
      } catch (error) {
        console.error("Error deleting player from Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      await (await this.idbDb).delete('players', id);
    }
  }
  
  // Method to migrate players from IndexedDB to Supabase
  async migratePlayersFromIndexedDB(): Promise<void> {
    if (!this.idbDb) return;
    
    try {
      console.log("Starting player migration from IndexedDB to Supabase");
      const userId = await this.getUserId();
      
      // Get all players from IndexedDB
      const idbPlayers = await (await this.idbDb).getAll('players');
      
      if (idbPlayers.length === 0) {
        console.log("No players to migrate");
        return;
      }
      
      console.log(`Found ${idbPlayers.length} players to migrate`);
      
      // Prepare the players for Supabase format
      const supabasePlayers = idbPlayers.map(player => ({
        id: player.id,
        name: player.name,
        photo_url: player.photoUrl,
        phone: player.phone,
        city: player.city,
        created_at: player.createdAt.toISOString(),
        user_id: userId
      }));
      
      // Upsert all players to Supabase
      const { error } = await supabase
        .from('players')
        .upsert(supabasePlayers, { onConflict: 'id' });
        
      if (error) throw error;
      
      console.log(`Successfully migrated ${supabasePlayers.length} players to Supabase`);
    } catch (error) {
      console.error("Error migrating players to Supabase:", error);
      throw error;
    }
  }
}
