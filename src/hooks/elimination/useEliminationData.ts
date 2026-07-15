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

        const orgId = localStorage.getItem('currentOrganizationId');
        if (!orgId) {
          setEliminations([]);
          return;
        }

        if (seasonId) {
          // First get all games from the season (scoped to org)
          const { data: games, error: gamesError } = await supabase
            .from('games')
            .select('id')
            .eq('season_id', seasonId)
            .eq('organization_id', orgId);

          if (gamesError) {
            console.error('Error fetching games:', gamesError);
            return;
          }

          if (!games || games.length === 0) {
            setEliminations([]);
            return;
          }

          const gameIds = games.map(game => game.id);

          // Then get eliminations from those games (scoped to org)
          const { data, error } = await supabase
            .from('eliminations')
            .select('*')
            .eq('organization_id', orgId)
            .in('game_id', gameIds);

          if (error) {
            console.error('Error fetching eliminations:', error);
            return;
          }

          setEliminations(data || []);
        } else {
          // Fetch all eliminations for the current organization
          const { data, error } = await supabase
            .from('eliminations')
            .select('*')
            .eq('organization_id', orgId);

          if (error) {
            console.error('Error fetching eliminations:', error);
            return;
          }

          setEliminations(data || []);
        }
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

      // Refresh data (scoped to org)
      const { data } = await supabase
        .from('eliminations')
        .select('*')
        .eq('organization_id', orgId)
        .eq('game_id', elimination.game_id);
      
      if (data) {
        setEliminations(prev => [...prev.filter(e => e.game_id !== elimination.game_id), ...data]);
      }
    } catch (error) {
      console.error('Error in saveElimination:', error);
    }
  };

  const deleteEliminationsByGameId = async (gameId: string) => {
    try {
      const orgId = localStorage.getItem('currentOrganizationId');
      if (!orgId) throw new Error('No organization selected');

      const { error } = await supabase
        .from('eliminations')
        .delete()
        .eq('organization_id', orgId)
        .eq('game_id', gameId);

      if (error) {
        console.error('Error deleting eliminations:', error);
        throw error;
      }

      // Update local state
      setEliminations(prev => prev.filter(e => e.game_id !== gameId));
    } catch (error) {
      console.error('Error in deleteEliminationsByGameId:', error);
      throw error;
    }
  };


  return {
    eliminations,
    loading,
    saveElimination,
    deleteEliminationsByGameId
  };
}