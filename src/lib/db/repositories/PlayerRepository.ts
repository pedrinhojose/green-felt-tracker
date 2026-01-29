
import { IDBPDatabase } from 'idb';
import { Player } from '../models';
import { PokerDB } from '../schema/PokerDBSchema';
import { supabase } from "@/integrations/supabase/client";
import { SupabaseCore } from '../core/SupabaseCore';
import { deleteImageFromStorage } from '@/lib/utils/storageUtils';

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
        const orgId = this.getCurrentOrganizationId();
        
        if (!orgId) {
          console.warn("No organization selected, returning empty players list");
          return [];
        }
        
        // Simple query - RLS policies will handle the filtering
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('organization_id', orgId);
          
        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }
        
        return data.map(player => ({
          id: player.id,
          name: player.name,
          photoUrl: player.photo_url,
          phone: player.phone,
          city: player.city,
          birthDate: player.birth_date ? new Date(player.birth_date) : undefined,
          userId: player.user_id,
          organizationId: player.organization_id,
          photoBase64: player.photo_base64,
          createdAt: new Date(player.created_at),
          isActive: player.is_active ?? true
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
        const orgId = this.getCurrentOrganizationId();
        
        if (!orgId) {
          console.warn("No organization selected, cannot get player");
          return undefined;
        }
        
        // Simple query - RLS policies will handle the filtering
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', id)
          .eq('organization_id', orgId)
          .maybeSingle();
        
        if (error) {
          if (error.code === 'PGRST116') {
            // No data found
            return undefined;
          }
          throw error;
        }
        
        if (!data) return undefined;
        
        return {
          id: data.id,
          name: data.name,
          photoUrl: data.photo_url,
          phone: data.phone,
          city: data.city,
          birthDate: data.birth_date ? new Date(data.birth_date) : undefined,
          userId: data.user_id,
          organizationId: data.organization_id,
          photoBase64: data.photo_base64,
          createdAt: new Date(data.created_at),
          isActive: data.is_active ?? true
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
        const orgId = this.getCurrentOrganizationId();
        
        if (!orgId) {
          throw new Error("No organization selected, cannot save player");
        }
        
        // If updating an existing player, check if we need to delete an old photo
        if (player.id) {
          const existingPlayer = await this.getPlayer(player.id);
          if (existingPlayer && existingPlayer.photoUrl && 
              existingPlayer.photoUrl !== player.photoUrl && 
              existingPlayer.photoUrl.includes('fotos')) {
            // Delete the old photo if it's from our storage and different from the new one
            await deleteImageFromStorage(existingPlayer.photoUrl);
            console.log("Deleted old player photo:", existingPlayer.photoUrl);
          }
        }
        
        const supabasePlayer = {
          id: player.id,
          name: player.name,
          photo_url: player.photoUrl,
          phone: player.phone,
          city: player.city,
          birth_date: player.birthDate ? player.birthDate.toISOString().split('T')[0] : null,
          created_at: player.createdAt.toISOString(),
          user_id: userId,
          organization_id: orgId
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

  async deactivatePlayer(id: string): Promise<void> {
    if (this.useSupabase) {
      try {
        const orgId = this.getCurrentOrganizationId();
        
        if (!orgId) {
          throw new Error("No organization selected, cannot deactivate player");
        }
        
        // Soft delete: set is_active = false instead of physically deleting
        const { error } = await supabase
          .from('players')
          .update({ is_active: false })
          .eq('id', id)
          .eq('organization_id', orgId);
          
        if (error) throw error;
        
        console.log("Player deactivated successfully (soft delete):", id);
        
      } catch (error) {
        console.error("Error deactivating player in Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      // For IndexedDB, we mark as inactive instead of deleting
      const player = await (await this.idbDb).get('players', id);
      if (player) {
        player.isActive = false;
        await (await this.idbDb).put('players', player);
      }
    }
  }

  async reactivatePlayer(id: string): Promise<void> {
    if (this.useSupabase) {
      try {
        const orgId = this.getCurrentOrganizationId();
        
        if (!orgId) {
          throw new Error("No organization selected, cannot reactivate player");
        }
        
        const { error } = await supabase
          .from('players')
          .update({ is_active: true })
          .eq('id', id)
          .eq('organization_id', orgId);
          
        if (error) throw error;
        
        console.log("Player reactivated successfully:", id);
        
      } catch (error) {
        console.error("Error reactivating player in Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      const player = await (await this.idbDb).get('players', id);
      if (player) {
        player.isActive = true;
        await (await this.idbDb).put('players', player);
      }
    }
  }
  
  // Method to migrate players from IndexedDB to Supabase
  async migratePlayersFromIndexedDB(): Promise<void> {
    if (!this.idbDb) return;
    
    try {
      console.log("Starting player migration from IndexedDB to Supabase");
      const { userId, orgId } = await this.getUserAndOrgIds();
      
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
        birth_date: player.birthDate ? player.birthDate.toISOString().split('T')[0] : null,
        created_at: player.createdAt.toISOString(),
        user_id: userId,
        organization_id: orgId
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
