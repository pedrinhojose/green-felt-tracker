import { SupabaseCore } from '../core/SupabaseCore';
import { SeasonJackpotDistribution } from '../models';
import { supabase } from '@/integrations/supabase/client';

export class JackpotDistributionRepository extends SupabaseCore {
  private useSupabase = true;

  constructor() {
    super();
  }

  /**
   * Save multiple jackpot distributions at once
   */
  async saveDistributions(distributions: Partial<SeasonJackpotDistribution>[]): Promise<void> {
    if (this.useSupabase) {
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

      if (error) {
        console.error('Error saving jackpot distributions:', error);
        throw error;
      }
    }
  }

  /**
   * Get distributions for a specific season
   */
  async getDistributionsBySeasonId(seasonId: string): Promise<SeasonJackpotDistribution[]> {
    const { data, error } = await supabase
      .from('season_jackpot_distributions')
      .select('*')
      .eq('season_id', seasonId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching jackpot distributions:', error);
      throw error;
    }

    return (data || []).map(d => this.mapFromSupabase(d));
  }

  /**
   * Get distributions for a specific player
   */
  async getDistributionsByPlayerId(playerId: string): Promise<SeasonJackpotDistribution[]> {
    const { data, error } = await supabase
      .from('season_jackpot_distributions')
      .select('*')
      .eq('player_id', playerId)
      .order('distributed_at', { ascending: false });

    if (error) {
      console.error('Error fetching player jackpot distributions:', error);
      throw error;
    }

    return (data || []).map(d => this.mapFromSupabase(d));
  }

  /**
   * Map Supabase data to our model
   */
  private mapFromSupabase(data: any): SeasonJackpotDistribution {
    return {
      id: data.id,
      seasonId: data.season_id,
      playerId: data.player_id,
      playerName: data.player_name,
      position: data.position,
      percentage: parseFloat(data.percentage),
      prizeAmount: parseFloat(data.prize_amount),
      totalJackpot: parseFloat(data.total_jackpot),
      distributedAt: new Date(data.distributed_at),
      createdAt: new Date(data.created_at),
      organizationId: data.organization_id,
      userId: data.user_id,
    };
  }
}
