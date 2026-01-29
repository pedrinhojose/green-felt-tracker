import { SupabaseCore } from './SupabaseCore';
import { DatabaseInterface } from './DatabaseInterface';
import { Player, Season, Game, RankingEntry, SeasonJackpotDistribution } from '../models';
import { supabase } from "@/integrations/supabase/client";

export class SupabaseRepository extends SupabaseCore implements DatabaseInterface {
  // Players
  async getPlayers(): Promise<Player[]> {
    const { userId, orgId } = await this.getUserAndOrgIds();
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('organization_id', orgId);

    if (error) throw error;
    
    return data.map(this.mapPlayerFromSupabase);
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    
    return data ? this.mapPlayerFromSupabase(data) : undefined;
  }

  async savePlayer(player: Partial<Player>): Promise<string> {
    const { userId, orgId } = await this.getUserAndOrgIds();
    
    const playerData = {
      name: player.name!,
      phone: player.phone,
      city: player.city,
      photo_url: player.photoUrl,
      photo_base64: player.photoBase64,
      user_id: userId,
      organization_id: orgId,
    };

    if (player.id) {
      const { error } = await supabase
        .from('players')
        .update(playerData)
        .eq('id', player.id);
      
      if (error) throw error;
      return player.id;
    } else {
      const { data, error } = await supabase
        .from('players')
        .insert({ id: player.id, ...playerData })
        .select('id')
        .single();
      
      if (error) throw error;
      return data.id;
    }
  }

  async deletePlayer(id: string): Promise<void> {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Seasons
  async getSeasons(): Promise<Season[]> {
    const { userId, orgId } = await this.getUserAndOrgIds();
    
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(this.mapSeasonFromSupabase);
  }

  async getSeason(id: string): Promise<Season | undefined> {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    
    return data ? this.mapSeasonFromSupabase(data) : undefined;
  }

  async saveSeason(season: Partial<Season>): Promise<string> {
    const { userId, orgId } = await this.getUserAndOrgIds();
    
    const seasonData = {
      name: season.name!,
      start_date: season.startDate!.toISOString(),
      end_date: season.endDate?.toISOString(),
      game_frequency: season.gameFrequency!,
      games_per_period: season.gamesPerPeriod!,
      is_active: season.isActive!,
      score_schema: JSON.stringify(season.scoreSchema || []) as any,
      weekly_prize_schema: JSON.stringify(season.weeklyPrizeSchema || []) as any,
      season_prize_schema: JSON.stringify(season.seasonPrizeSchema || []) as any,
      financial_params: JSON.stringify(season.financialParams || {}) as any,
      blind_structure: JSON.stringify(season.blindStructure || []) as any,
      jackpot: season.jackpot || 0,
      house_rules: season.houseRules || '',
      host_schedule: JSON.stringify(season.hostSchedule || []) as any,
      user_id: userId,
      organization_id: orgId,
    };

    if (season.id) {
      const { error } = await supabase
        .from('seasons')
        .update(seasonData)
        .eq('id', season.id);
      
      if (error) throw error;
      return season.id;
    } else {
      const { data, error } = await supabase
        .from('seasons')
        .insert({ id: season.id, ...seasonData })
        .select('id')
        .single();
      
      if (error) throw error;
      return data.id;
    }
  }

  async deleteSeason(id: string): Promise<void> {
    const { error } = await supabase
      .from('seasons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getActiveSeason(): Promise<Season | null> {
    const { userId, orgId } = await this.getUserAndOrgIds();
    
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('organization_id', orgId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    
    return data ? this.mapSeasonFromSupabase(data) : null;
  }

  // Games
  async getGames(): Promise<Game[]> {
    const { userId, orgId } = await this.getUserAndOrgIds();
    
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('organization_id', orgId)
      .order('date', { ascending: false });

    if (error) throw error;
    
    return data.map(this.mapGameFromSupabase);
  }

  async getGame(id: string): Promise<Game | undefined> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    
    return data ? this.mapGameFromSupabase(data) : undefined;
  }

  async saveGame(game: Partial<Game>): Promise<string> {
    const { userId, orgId } = await this.getUserAndOrgIds();
    
    const gameData = {
      number: game.number!,
      season_id: game.seasonId!,
      date: game.date!.toISOString(),
      players: JSON.stringify(game.players || []) as any,
      total_prize_pool: game.totalPrizePool || 0,
      dinner_cost: game.dinnerCost,
      is_finished: game.isFinished || false,
      user_id: userId,
      organization_id: orgId,
    };

    if (game.id) {
      const { error } = await supabase
        .from('games')
        .update(gameData)
        .eq('id', game.id);
      
      if (error) throw error;
      return game.id;
    } else {
      const { data, error } = await supabase
        .from('games')
        .insert({ id: game.id, ...gameData })
        .select('id')
        .single();
      
      if (error) throw error;
      return data.id;
    }
  }

  async deleteGame(id: string): Promise<void> {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getGamesBySeasonId(seasonId: string): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('season_id', seasonId)
      .order('date', { ascending: false });

    if (error) throw error;
    
    return data.map(this.mapGameFromSupabase);
  }

  // Rankings
  async getRankings(): Promise<RankingEntry[]> {
    const { userId, orgId } = await this.getUserAndOrgIds();
    
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('organization_id', orgId)
      .order('total_points', { ascending: false });

    if (error) throw error;
    
    return data.map(this.mapRankingFromSupabase);
  }

  async getRanking(id: string): Promise<RankingEntry | undefined> {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    
    return data ? this.mapRankingFromSupabase(data) : undefined;
  }

  async saveRanking(ranking: Partial<RankingEntry>): Promise<string> {
    const { userId, orgId } = await this.getUserAndOrgIds();
    
    const rankingData = {
      player_id: ranking.playerId!,
      player_name: ranking.playerName!,
      photo_url: ranking.photoUrl,
      total_points: ranking.totalPoints!,
      games_played: ranking.gamesPlayed!,
      best_position: ranking.bestPosition!,
      season_id: ranking.seasonId!,
      user_id: userId,
      organization_id: orgId,
    };

    if (ranking.id) {
      const { error } = await supabase
        .from('rankings')
        .update(rankingData)
        .eq('id', ranking.id);
      
      if (error) throw error;
      return ranking.id;
    } else {
      const { data, error } = await supabase
        .from('rankings')
        .insert({ id: ranking.id, ...rankingData })
        .select('id')
        .single();
      
      if (error) throw error;
      return data.id;
    }
  }

  async deleteRanking(id: string): Promise<void> {
    const { error } = await supabase
      .from('rankings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getRankingsBySeasonId(seasonId: string): Promise<RankingEntry[]> {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('season_id', seasonId)
      .order('total_points', { ascending: false });

    if (error) throw error;
    
    return data.map(this.mapRankingFromSupabase);
  }

  // Utilities
  async exportBackup(): Promise<string> {
    const players = await this.getPlayers();
    const seasons = await this.getSeasons();
    const games = await this.getGames();
    const rankings = await this.getRankings();

    return JSON.stringify({
      players,
      seasons,
      games,
      rankings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    });
  }

  async importBackup(backupJson: string): Promise<void> {
    throw new Error('Import backup not implemented for Supabase yet');
  }

  // Jackpot Distributions
  async saveJackpotDistributions(distributions: Partial<SeasonJackpotDistribution>[]): Promise<void> {
    const { error } = await supabase
      .from('season_jackpot_distributions')
      .insert(
        distributions.map(d => ({
          season_id: d.seasonId,
          player_id: d.playerId,
          player_name: d.playerName,
          position: d.position,
          percentage: d.percentage,
          prize_amount: d.prizeAmount,
          total_jackpot: d.totalJackpot,
          organization_id: d.organizationId,
          user_id: d.userId,
          distributed_at: d.distributedAt ? d.distributedAt.toISOString() : new Date().toISOString(),
        }))
      );

    if (error) throw error;
  }

  async getJackpotDistributionsBySeasonId(seasonId: string): Promise<SeasonJackpotDistribution[]> {
    const { data, error } = await supabase
      .from('season_jackpot_distributions')
      .select('*')
      .eq('season_id', seasonId)
      .order('position', { ascending: true });

    if (error) throw error;

    return (data || []).map(d => ({
      id: d.id,
      seasonId: d.season_id,
      playerId: d.player_id,
      playerName: d.player_name,
      position: d.position,
      percentage: parseFloat(d.percentage.toString()),
      prizeAmount: parseFloat(d.prize_amount.toString()),
      totalJackpot: parseFloat(d.total_jackpot.toString()),
      distributedAt: new Date(d.distributed_at),
      createdAt: new Date(d.created_at),
      organizationId: d.organization_id,
      userId: d.user_id,
    }));
  }

  async getJackpotDistributionsByPlayerId(playerId: string): Promise<SeasonJackpotDistribution[]> {
    const { data, error } = await supabase
      .from('season_jackpot_distributions')
      .select('*')
      .eq('player_id', playerId)
      .order('distributed_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(d => ({
      id: d.id,
      seasonId: d.season_id,
      playerId: d.player_id,
      playerName: d.player_name,
      position: d.position,
      percentage: parseFloat(String(d.percentage)),
      prizeAmount: parseFloat(String(d.prize_amount)),
      totalJackpot: parseFloat(String(d.total_jackpot)),
      distributedAt: new Date(d.distributed_at),
      createdAt: new Date(d.created_at),
      organizationId: d.organization_id,
      userId: d.user_id,
    }));
  }

  // Mapping functions
  private mapPlayerFromSupabase(data: any): Player {
    return {
      id: data.id,
      name: data.name,
      photoUrl: data.photo_url,
      phone: data.phone,
      city: data.city,
      userId: data.user_id,
      organizationId: data.organization_id,
      photoBase64: data.photo_base64,
      createdAt: new Date(data.created_at),
      isActive: data.is_active ?? true,
    };
  }

  private mapSeasonFromSupabase(data: any): Season {
    return {
      id: data.id,
      name: data.name,
      startDate: new Date(data.start_date),
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      gameFrequency: data.game_frequency as 'daily' | 'weekly' | 'biweekly' | 'monthly' || 'weekly',
      gamesPerPeriod: data.games_per_period || 1,
      isActive: data.is_active,
      scoreSchema: data.score_schema || [],
      weeklyPrizeSchema: data.weekly_prize_schema || [],
      seasonPrizeSchema: data.season_prize_schema || [],
      financialParams: data.financial_params || {},
      blindStructure: data.blind_structure || [],
      jackpot: Number(data.jackpot),
      clubFund: Number(data.club_fund || 0),
      houseRules: data.house_rules || '',
      hostSchedule: data.host_schedule || [],
      createdAt: new Date(data.created_at),
    };
  }

  private mapGameFromSupabase(data: any): Game {
    return {
      id: data.id,
      number: data.number,
      seasonId: data.season_id,
      date: new Date(data.date),
      players: data.players || [],
      totalPrizePool: Number(data.total_prize_pool),
      dinnerCost: data.dinner_cost ? Number(data.dinner_cost) : undefined,
      isFinished: data.is_finished,
      createdAt: new Date(data.created_at),
      
    };
  }

  private mapRankingFromSupabase(data: any): RankingEntry {
    return {
      id: data.id,
      playerId: data.player_id,
      playerName: data.player_name,
      photoUrl: data.photo_url,
      totalPoints: Number(data.total_points),
      gamesPlayed: Number(data.games_played),
      bestPosition: Number(data.best_position),
      seasonId: data.season_id,
    };
  }

}