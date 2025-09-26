
import { IDBPDatabase } from 'idb';
import { Season, ScoreEntry, PrizeEntry, BlindLevel, FinancialParams } from '../models';
import { PokerDB } from '../schema/PokerDBSchema';
import { supabase } from "@/integrations/supabase/client";
import { SupabaseCore } from '../core/SupabaseCore';
import { Json } from '@/integrations/supabase/types';

export class SeasonRepository extends SupabaseCore {
  private idbDb: Promise<IDBPDatabase<PokerDB>> | null = null;
  private useSupabase = true;

  constructor(idbDb?: Promise<IDBPDatabase<PokerDB>>) {
    super();
    this.idbDb = idbDb || null;
    
    if (idbDb) {
      this.useSupabase = false;
    }
  }

  async getSeasons(): Promise<Season[]> {
    if (this.useSupabase) {
      try {
        const orgId = this.getCurrentOrganizationId();
        
        if (!orgId) {
          console.warn("No organization selected, returning empty seasons list");
          return [];
        }
        
        // Simple query - RLS policies will handle the filtering
        const { data, error } = await supabase
          .from('seasons')
          .select('*')
          .eq('organization_id', orgId);
          
        if (error) throw error;
        
        return data.map(season => ({
          id: season.id,
          name: season.name,
          startDate: new Date(season.start_date),
          endDate: season.end_date ? new Date(season.end_date) : undefined,
          gameFrequency: season.game_frequency as 'daily' | 'weekly' | 'biweekly' | 'monthly' || 'weekly',
          gamesPerPeriod: season.games_per_period || 1,
          isActive: season.is_active,
          scoreSchema: season.score_schema as unknown as ScoreEntry[],
          weeklyPrizeSchema: season.weekly_prize_schema as unknown as PrizeEntry[],
          seasonPrizeSchema: season.season_prize_schema as unknown as PrizeEntry[],
          financialParams: season.financial_params as unknown as FinancialParams,
          blindStructure: season.blind_structure as unknown as BlindLevel[],
          jackpot: Number(season.jackpot),
          houseRules: season.house_rules || '',
          createdAt: new Date(season.created_at)
        })) as Season[];
      } catch (error) {
        console.error("Error fetching seasons from Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      return (await this.idbDb).getAll('seasons');
    }
    
    return [];
  }
  
  async getActiveSeason(): Promise<Season | undefined> {
    if (this.useSupabase) {
      try {
        const orgId = this.getCurrentOrganizationId();
        
        if (!orgId) {
          console.warn("No organization selected, cannot get active season");
          return undefined;
        }
        
        // Simple query - RLS policies will handle the filtering
        const { data, error } = await supabase
          .from('seasons')
          .select('*')
          .eq('organization_id', orgId)
          .eq('is_active', true)
          .maybeSingle();
          
        if (error) throw error;
        
        if (!data) return undefined;
        
        return {
          id: data.id,
          name: data.name,
          startDate: new Date(data.start_date),
          endDate: data.end_date ? new Date(data.end_date) : undefined,
          gameFrequency: data.game_frequency as 'daily' | 'weekly' | 'biweekly' | 'monthly' || 'weekly',
          gamesPerPeriod: data.games_per_period || 1,
          isActive: data.is_active,
          scoreSchema: data.score_schema as unknown as ScoreEntry[],
          weeklyPrizeSchema: data.weekly_prize_schema as unknown as PrizeEntry[],
          seasonPrizeSchema: data.season_prize_schema as unknown as PrizeEntry[],
          financialParams: data.financial_params as unknown as FinancialParams,
          blindStructure: data.blind_structure as unknown as BlindLevel[],
          jackpot: Number(data.jackpot),
          houseRules: data.house_rules || '',
          createdAt: new Date(data.created_at)
        } as Season;
      } catch (error) {
        console.error("Error fetching active season from Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      return (await this.idbDb).getFromIndex('seasons', 'by-active', 1);
    }
    
    return undefined;
  }

  async getSeason(id: string): Promise<Season | undefined> {
    if (this.useSupabase) {
      try {
        const orgId = this.getCurrentOrganizationId();
        
        if (!orgId) {
          console.warn("No organization selected, cannot get season");
          return undefined;
        }
        
        // Simple query - RLS policies will handle the filtering
        const { data, error } = await supabase
          .from('seasons')
          .select('*')
          .eq('id', id)
          .eq('organization_id', orgId)
          .maybeSingle();
          
        if (error) throw error;
        
        if (!data) return undefined;
        
        return {
          id: data.id,
          name: data.name,
          startDate: new Date(data.start_date),
          endDate: data.end_date ? new Date(data.end_date) : undefined,
          gameFrequency: data.game_frequency as 'daily' | 'weekly' | 'biweekly' | 'monthly' || 'weekly',
          gamesPerPeriod: data.games_per_period || 1,
          isActive: data.is_active,
          scoreSchema: data.score_schema as unknown as ScoreEntry[],
          weeklyPrizeSchema: data.weekly_prize_schema as unknown as PrizeEntry[],
          seasonPrizeSchema: data.season_prize_schema as unknown as PrizeEntry[],
          financialParams: data.financial_params as unknown as FinancialParams,
          blindStructure: data.blind_structure as unknown as BlindLevel[],
          jackpot: Number(data.jackpot),
          houseRules: data.house_rules || '',
          createdAt: new Date(data.created_at)
        } as Season;
      } catch (error) {
        console.error("Error fetching season from Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      return (await this.idbDb).get('seasons', id);
    }
    
    return undefined;
  }

  async saveSeason(season: Season): Promise<string> {
    if (this.useSupabase) {
      try {
        const { userId, orgId } = await this.getUserAndOrgIds();
        
        const supabaseSeason = {
          id: season.id,
          name: season.name,
          start_date: season.startDate.toISOString(),
          end_date: season.endDate ? season.endDate.toISOString() : null,
          game_frequency: season.gameFrequency,
          games_per_period: season.gamesPerPeriod,
          is_active: season.isActive,
          score_schema: season.scoreSchema as unknown as Json,
          weekly_prize_schema: season.weeklyPrizeSchema as unknown as Json,
          season_prize_schema: season.seasonPrizeSchema as unknown as Json,
          financial_params: season.financialParams as unknown as Json,
          blind_structure: season.blindStructure as unknown as Json,
          jackpot: season.jackpot,
          house_rules: season.houseRules || '',
          created_at: season.createdAt.toISOString(),
          user_id: userId,
          organization_id: orgId
        };
        
        // If this is set as the active season, deactivate all others first
        if (season.isActive) {
          await this.deactivateAllSeasons();
        }
        
        const { error } = await supabase
          .from('seasons')
          .upsert(supabaseSeason, { onConflict: 'id' });
          
        if (error) throw error;
        
        return season.id;
      } catch (error) {
        console.error("Error saving season to Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      await (await this.idbDb).put('seasons', season);
      return season.id;
    }
    
    throw new Error("No database available");
  }
  
  // Helper method to deactivate all seasons
  private async deactivateAllSeasons(): Promise<void> {
    if (!this.useSupabase) return;
    
    try {
      const orgId = this.getCurrentOrganizationId();
      
      if (!orgId) {
        throw new Error("No organization selected, cannot deactivate seasons");
      }
      
      // RLS policies will handle access control
      const { error } = await supabase
        .from('seasons')
        .update({ is_active: false })
        .eq('organization_id', orgId)
        .eq('is_active', true);
        
      if (error) throw error;
    } catch (error) {
      console.error("Error deactivating seasons:", error);
      throw error;
    }
  }

  async deleteSeason(id: string): Promise<void> {
    if (this.useSupabase) {
      try {
        const orgId = this.getCurrentOrganizationId();
        
        if (!orgId) {
          throw new Error("No organization selected, cannot delete season");
        }
        
        // RLS policies will handle access control
        const { error } = await supabase
          .from('seasons')
          .delete()
          .eq('id', id)
          .eq('organization_id', orgId);
          
        if (error) throw error;
      } catch (error) {
        console.error("Error deleting season from Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      await (await this.idbDb).delete('seasons', id);
    }
  }
  
  async updateJackpot(seasonId: string, amount: number): Promise<void> {
    if (this.useSupabase) {
      try {
        const orgId = this.getCurrentOrganizationId();
        
        if (!orgId) {
          throw new Error("No organization selected, cannot update jackpot");
        }
        
        // Get the current season to access the current jackpot amount
        const { data: season, error: fetchError } = await supabase
          .from('seasons')
          .select('jackpot')
          .eq('id', seasonId)
          .eq('organization_id', orgId)
          .single();
          
        if (fetchError) throw fetchError;
        
        // Calculate the new jackpot amount
        const currentJackpot = Number(season.jackpot);
        const newJackpot = Math.max(0, currentJackpot + amount);
        
        // Update the jackpot - RLS policies will handle access control
        const { error: updateError } = await supabase
          .from('seasons')
          .update({ jackpot: newJackpot })
          .eq('id', seasonId)
          .eq('organization_id', orgId);
          
        if (updateError) throw updateError;
      } catch (error) {
        console.error("Error updating jackpot in Supabase:", error);
        throw error;
      }
    } else if (this.idbDb) {
      // Obtém uma transação para garantir operações atômicas
      const db = await this.idbDb;
      const tx = db.transaction('seasons', 'readwrite');
      
      try {
        const season = await tx.store.get(seasonId);
        if (!season) {
          throw new Error('Temporada não encontrada');
        }
        
        const newJackpot = Math.max(0, (season.jackpot || 0) + amount);
        season.jackpot = newJackpot;
        await tx.store.put(season);
        await tx.done;
        
      } catch (error) {
        console.error('Erro na transação:', error);
        throw error;
      }
    }
  }
  
  // Method to migrate seasons from IndexedDB to Supabase
  async migrateSeasonsFromIndexedDB(): Promise<void> {
    if (!this.idbDb) return;
    
    try {
      console.log("Starting season migration from IndexedDB to Supabase");
      const userId = await this.getUserId();
      const orgId = this.getCurrentOrganizationId();
      
      if (!orgId) {
        console.error("No organization selected for migration");
        return;
      }
      
      // Get all seasons from IndexedDB
      const idbSeasons = await (await this.idbDb).getAll('seasons');
      
      if (idbSeasons.length === 0) {
        console.log("No seasons to migrate");
        return;
      }
      
      console.log(`Found ${idbSeasons.length} seasons to migrate`);
      
      // Prepare the seasons for Supabase format
      const supabaseSeasons = idbSeasons.map(season => ({
        id: season.id,
        name: season.name,
        start_date: season.startDate.toISOString(),
        end_date: season.endDate ? season.endDate.toISOString() : null,
        game_frequency: (season as any).gameFrequency || 'weekly',
        games_per_period: (season as any).gamesPerPeriod || (season as any).gamesPerWeek || 1,
        is_active: season.isActive,
        score_schema: season.scoreSchema as unknown as Json,
        weekly_prize_schema: season.weeklyPrizeSchema as unknown as Json,
        season_prize_schema: season.seasonPrizeSchema as unknown as Json,
        financial_params: season.financialParams as unknown as Json,
        blind_structure: season.blindStructure as unknown as Json,
        jackpot: season.jackpot,
        created_at: season.createdAt.toISOString(),
        user_id: userId,
        organization_id: orgId
      }));
      
      // Upsert all seasons to Supabase
      const { error } = await supabase
        .from('seasons')
        .upsert(supabaseSeasons, { onConflict: 'id' });
        
      if (error) throw error;
      
      console.log(`Successfully migrated ${supabaseSeasons.length} seasons to Supabase`);
    } catch (error) {
      console.error("Error migrating seasons to Supabase:", error);
      throw error;
    }
  }
}
