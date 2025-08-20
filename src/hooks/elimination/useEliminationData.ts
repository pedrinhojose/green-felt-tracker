import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EliminationRecord {
  id: string;
  game_id: string;
  eliminated_player_id: string;
  eliminator_player_id: string | null;
  elimination_time: string;
  position: number;
  organization_id: string;
  eliminated_player_name?: string;
  eliminator_player_name?: string;
}

export interface EliminationStats {
  topEliminators: { playerId: string; playerName: string; eliminations: number }[];
  mostEliminated: { playerId: string; playerName: string; eliminations: number }[];
  totalEliminations: number;
}

export function useEliminationData(seasonId?: string) {
  const [eliminations, setEliminations] = useState<EliminationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEliminations = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('eliminations')
          .select(`
            *,
            games!inner(season_id)
          `);

        if (seasonId) {
          query = query.eq('games.season_id', seasonId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching eliminations:', error);
          return;
        }

        setEliminations(data || []);
      } catch (error) {
        console.error('Error in useEliminationData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEliminations();
  }, [seasonId]);

  const saveElimination = async (elimination: Omit<EliminationRecord, 'id' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const orgId = localStorage.getItem('currentOrganizationId');
      
      if (!user || !orgId) return;

      const { error } = await supabase
        .from('eliminations')
        .insert({
          ...elimination,
          organization_id: orgId,
          user_id: user.id
        });

      if (error) {
        console.error('Error saving elimination:', error);
        return;
      }

      // Refresh data
      const { data } = await supabase
        .from('eliminations')
        .select('*')
        .eq('game_id', elimination.game_id);
      
      if (data) {
        setEliminations(prev => [...prev.filter(e => e.game_id !== elimination.game_id), ...data]);
      }
    } catch (error) {
      console.error('Error in saveElimination:', error);
    }
  };

  return {
    eliminations,
    loading,
    saveElimination
  };
}