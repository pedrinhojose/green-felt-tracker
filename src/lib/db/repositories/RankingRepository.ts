
import { IDBPDatabase } from 'idb';
import { RankingEntry } from '../models';
import { PokerDB } from '../schema/PokerDBSchema';
import { supabase } from "@/integrations/supabase/client";
import { SupabaseCore } from '../core/SupabaseCore';
import { SupabaseQueryInterceptor } from '../../utils/supabaseQueryInterceptor';
import { sanitizeUUID, debugUUID } from '../../utils/uuidUtils';
import { v5 as uuidv5 } from 'uuid';

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
        
        // Sanitizar e validar parâmetros
        const sanitizedSeasonId = sanitizeUUID(seasonId);
        const sanitizedOrgId = sanitizeUUID(orgId);
        
        if (!sanitizedSeasonId || !sanitizedOrgId) {
          console.error("Invalid UUID parameters:", { 
            seasonId: { original: seasonId, sanitized: sanitizedSeasonId },
            orgId: { original: orgId, sanitized: sanitizedOrgId }
          });
          return [];
        }
        
        debugUUID(seasonId, 'getRankingsBySeasonAndOrganization - seasonId');
        debugUUID(orgId, 'getRankingsBySeasonAndOrganization - orgId');
        
        console.log("RankingRepository: Buscando rankings para seasonId:", sanitizedSeasonId, "orgId:", sanitizedOrgId);
        
        // Interceptar e sanitizar query
        const queryParams = { season_id: sanitizedSeasonId, organization_id: sanitizedOrgId };
        const sanitizedParams = SupabaseQueryInterceptor.sanitizeQueryParams('rankings', 'select', queryParams);
        
        // First, try simple query without JOIN to debug
        const { data, error } = await supabase
          .from('rankings')
          .select('*')
          .eq('season_id', sanitizedParams.season_id)
          .eq('organization_id', sanitizedParams.organization_id);
          
        if (error) {
          console.error("Supabase query error:", error);
          SupabaseQueryInterceptor.validateResponse('rankings', 'select', { error });
          throw error;
        }
        
        // Validar resposta
        SupabaseQueryInterceptor.validateResponse('rankings', 'select', { data, error });
        
        console.log("Rankings raw data from Supabase:", data);
        console.log("Number of rankings found:", data?.length || 0);
        
        if (!data || data.length === 0) {
          console.warn("No rankings found for seasonId:", sanitizedSeasonId, "orgId:", sanitizedOrgId);
          return [];
        }
        
        // Verify that players still exist by getting current players
        const { data: players, error: playersError } = await supabase
          .from('players')
          .select('id, name')
          .eq('organization_id', sanitizedOrgId);
          
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
        
        const safeId = (ranking.id && sanitizeUUID(ranking.id)) || uuidv5(`${ranking.playerId}-${ranking.seasonId}`, uuidv5.URL);
        const supabaseRanking = {
          id: safeId,
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
            onConflict: 'user_id,season_id,player_id'
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

  async deleteRankingsBySeason(seasonId: string): Promise<void> {
    if (this.useSupabase) {
      try {
        const orgId = this.getCurrentOrganizationId();
        if (!orgId) throw new Error('No organization selected, cannot delete rankings');
        const { error } = await supabase
          .from('rankings')
          .delete()
          .eq('season_id', seasonId)
          .eq('organization_id', orgId);
        if (error) throw error;
        console.log(`Rankings da temporada ${seasonId} removidos com sucesso`);
      } catch (error) {
        console.error('Erro ao remover rankings por temporada:', error);
        throw error;
      }
    } else if (this.idbDb) {
      try {
        const db = await this.idbDb;
        const all = await db.getAll('rankings');
        const toDelete = all.filter(r => r.seasonId === seasonId);
        await Promise.all(toDelete.map(r => db.delete('rankings', r.id)));
        console.log(`Removidos ${toDelete.length} rankings locais da temporada ${seasonId}`);
      } catch (error) {
        console.error('Erro ao remover rankings locais por temporada:', error);
        throw error;
      }
    }
  }

  async saveRankingsBulk(rankings: RankingEntry[]): Promise<void> {
    if (rankings.length === 0) return;
    if (this.useSupabase) {
      try {
        const userId = await this.getUserId();
        const orgId = this.getCurrentOrganizationId();
        if (!orgId) throw new Error('No organization selected, cannot save rankings');
        const payload = rankings.map(r => ({
          id: (r.id && sanitizeUUID(r.id)) || uuidv5(`${r.playerId}-${r.seasonId}`, uuidv5.URL),
          player_id: r.playerId,
          player_name: r.playerName,
          photo_url: r.photoUrl,
          total_points: r.totalPoints,
          games_played: r.gamesPlayed,
          best_position: r.bestPosition,
          season_id: r.seasonId,
          user_id: userId,
          organization_id: orgId
        }));
        const { error } = await supabase
          .from('rankings')
          .upsert(payload, { onConflict: 'user_id,season_id,player_id' });
        if (error) throw error;
        console.log(`Bulk upsert de ${payload.length} rankings concluído`);
      } catch (error) {
        console.error('Erro no bulk upsert de rankings:', error);
        throw error;
      }
    } else if (this.idbDb) {
      try {
        const db = await this.idbDb;
        await Promise.all(rankings.map(r => db.put('rankings', r)));
        console.log(`Bulk salvo localmente ${rankings.length} rankings`);
      } catch (error) {
        console.error('Erro ao salvar rankings localmente em bulk:', error);
        throw error;
      }
    }
  }
}
