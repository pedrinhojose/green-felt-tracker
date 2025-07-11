
import { IDBPDatabase } from 'idb';
import { RankingEntry } from '../models';
import { PokerDB } from '../schema/PokerDBSchema';
import { supabase } from "@/integrations/supabase/client";
import { SupabaseCore } from '../core/SupabaseCore';

export class RankingRepository extends SupabaseCore {
  private idbDb: Promise<IDBPDatabase<PokerDB>> | null = null;
  private useSupabase = true;

  constructor(idbDb?: Promise<IDBPDatabase<PokerDB>>) {
    super();
    this.idbDb = idbDb || null;
    
    if (idbDb) {
      this.useSupabase = false;
    }
  }

  async getRankings(seasonId: string): Promise<RankingEntry[]> {
    if (this.useSupabase) {
      try {
        const orgId = this.getCurrentOrganizationId();
        
        if (!orgId) {
          console.warn("No organization selected, returning empty rankings list");
          return [];
        }
        
        console.log("RankingRepository: Buscando rankings para seasonId:", seasonId, "orgId:", orgId);
        
        // First, try simple query without JOIN to debug
        const { data, error } = await supabase
          .from('rankings')
          .select('*')
          .eq('season_id', seasonId)
          .eq('organization_id', orgId);
          
        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }
        
        console.log("Rankings raw data from Supabase:", data);
        console.log("Number of rankings found:", data?.length || 0);
        
        if (!data || data.length === 0) {
          console.warn("No rankings found for seasonId:", seasonId, "orgId:", orgId);
          return [];
        }
        
        // Verify that players still exist by getting current players
        const { data: players, error: playersError } = await supabase
          .from('players')
          .select('id, name')
          .eq('organization_id', orgId);
          
        if (playersError) {
          console.error("Error fetching players:", playersError);
        }
        
        console.log("Current players:", players?.length || 0);
        
        // Filter rankings to only include existing players
        const validRankings = data.filter(ranking => {
          const playerExists = players?.some(player => player.id === ranking.player_id);
          if (!playerExists) {
            console.warn("Player not found for ranking:", ranking.player_id, ranking.player_name);
          }
          return playerExists;
        });
        
        console.log("Valid rankings after player filter:", validRankings.length);
        
        const mappedRankings = validRankings.map(ranking => ({
          id: ranking.id,
          playerId: ranking.player_id,
          playerName: ranking.player_name,
          photoUrl: ranking.photo_url,
          totalPoints: Number(ranking.total_points),
          gamesPlayed: ranking.games_played,
          bestPosition: ranking.best_position,
          seasonId: ranking.season_id
        })).sort((a, b) => b.totalPoints - a.totalPoints);
        
        console.log("Final mapped and sorted rankings:", mappedRankings.map(r => ({
          name: r.playerName,
          points: r.totalPoints,
          games: r.gamesPlayed
        })));
        
        return mappedRankings;
      } catch (error) {
        console.error("Error fetching rankings from Supabase:", error);
        return [];
      }
    } else if (this.idbDb) {
      try {
        const db = await this.idbDb;
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
    
    return [];
  }

  async saveRanking(ranking: RankingEntry): Promise<void> {
    if (this.useSupabase) {
      try {
        if (!ranking.seasonId) {
          console.error("Erro: Tentativa de salvar ranking sem seasonId", ranking);
          throw new Error("seasonId é obrigatório para salvar um ranking");
        }
        
        const userId = await this.getUserId();
        const orgId = this.getCurrentOrganizationId();
        
        if (!orgId) {
          throw new Error("No organization selected, cannot save ranking");
        }
        
        const supabaseRanking = {
          id: ranking.id,
          player_id: ranking.playerId,
          player_name: ranking.playerName,
          photo_url: ranking.photoUrl,
          total_points: ranking.totalPoints,
          games_played: ranking.gamesPlayed,
          best_position: ranking.bestPosition,
          season_id: ranking.seasonId,
          user_id: userId,
          organization_id: orgId
        };
        
        const { error } = await supabase
          .from('rankings')
          .upsert(supabaseRanking, { 
            onConflict: 'id'
          });
          
        if (error) throw error;
        
        console.log("Ranking salvo com sucesso:", ranking.id);
      } catch (error) {
        console.error("Erro ao salvar ranking:", error);
        throw error;
      }
    } else if (this.idbDb) {
      try {
        if (!ranking.seasonId) {
          console.error("Erro: Tentativa de salvar ranking sem seasonId", ranking);
          throw new Error("seasonId é obrigatório para salvar um ranking");
        }
        await (await this.idbDb).put('rankings', ranking);
        console.log("Ranking salvo com sucesso:", ranking.id);
      } catch (error) {
        console.error("Erro ao salvar ranking:", error);
        throw error;
      }
    }
  }
  
  // Method to migrate rankings from IndexedDB to Supabase
  async migrateRankingsFromIndexedDB(): Promise<void> {
    if (!this.idbDb) return;
    
    try {
      console.log("Starting ranking migration from IndexedDB to Supabase");
      const userId = await this.getUserId();
      const orgId = this.getCurrentOrganizationId();
      
      if (!orgId) {
        console.error("No organization selected for migration");
        return;
      }
      
      // Get all rankings from IndexedDB
      const idbRankings = await (await this.idbDb).getAll('rankings');
      
      if (idbRankings.length === 0) {
        console.log("No rankings to migrate");
        return;
      }
      
      console.log(`Found ${idbRankings.length} rankings to migrate`);
      
      // Prepare the rankings for Supabase format
      const supabaseRankings = idbRankings.map(ranking => ({
        id: ranking.id,
        player_id: ranking.playerId,
        player_name: ranking.playerName,
        photo_url: ranking.photoUrl,
        total_points: ranking.totalPoints,
        games_played: ranking.gamesPlayed,
        best_position: ranking.bestPosition,
        season_id: ranking.seasonId,
        user_id: userId,
        organization_id: orgId
      }));
      
      // Upsert all rankings to Supabase
      const { error } = await supabase
        .from('rankings')
        .upsert(supabaseRankings, { onConflict: 'id' });
        
      if (error) throw error;
      
      console.log(`Successfully migrated ${supabaseRankings.length} rankings to Supabase`);
    } catch (error) {
      console.error("Error migrating rankings to Supabase:", error);
      throw error;
    }
  }
}
