import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface CaixinhaTransaction {
  id: string;
  amount: number;
  description: string;
  withdrawal_date: string;
  created_by: string;
  type: 'deposit' | 'withdrawal';
  created_at?: string;
  organization_id?: string;
  season_id?: string;
  user_id?: string;
}

export interface GameContribution {
  id: string;
  amount: number;
  description: string;
  withdrawal_date: string;
  type: 'game_contribution';
  game_id: string;
  game_number: number;
  players_count: number;
  players: Array<{
    id: string;
    name: string;
    contribution: number;
  }>;
}

export type UnifiedTransaction = CaixinhaTransaction | GameContribution;

export const useCaixinhaUnifiedTransactions = (seasonId: string | undefined) => {
  const { currentOrganization } = useOrganization();
  const [manualTransactions, setManualTransactions] = useState<CaixinhaTransaction[]>([]);
  const [gameContributions, setGameContributions] = useState<GameContribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!seasonId || !currentOrganization?.id) {
      setIsLoading(false);
      return;
    }

    loadTransactions();
  }, [seasonId, currentOrganization?.id]);

  const loadTransactions = async () => {
    if (!seasonId || !currentOrganization?.id) return;

    try {
      setIsLoading(true);

      // Load manual transactions
      const { data: manualData, error: manualError } = await supabase
        .from('caixinha_transactions')
        .select('*')
        .eq('season_id', seasonId)
        .eq('organization_id', currentOrganization.id)
        .order('withdrawal_date', { ascending: false });

      if (manualError) throw manualError;

      // Load game contributions
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('id, number, date, players')
        .eq('season_id', seasonId)
        .eq('organization_id', currentOrganization.id)
        .eq('is_finished', true)
        .order('date', { ascending: false });

      if (gamesError) throw gamesError;

      // Process game contributions
      const contributions: GameContribution[] = (gamesData || [])
        .map(game => {
          const players = (game.players as any[]) || [];
          
          const contributingPlayers = players
            .filter(p => p.participatesInClubFund && p.clubFundContribution > 0)
            .map(p => ({
              id: p.playerId,
              name: p.playerName || 'Jogador',
              contribution: p.clubFundContribution || 0
            }));

          const totalContribution = contributingPlayers.reduce(
            (sum, p) => sum + p.contribution,
            0
          );

          if (totalContribution === 0) return null;

          return {
            id: `game-${game.id}`,
            amount: totalContribution,
            description: `Partida #${game.number}`,
            withdrawal_date: game.date,
            type: 'game_contribution' as const,
            game_id: game.id,
            game_number: game.number,
            players_count: contributingPlayers.length,
            players: contributingPlayers
          };
        })
        .filter(Boolean) as GameContribution[];

      setManualTransactions((manualData || []) as CaixinhaTransaction[]);
      setGameContributions(contributions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const unifiedTransactions = useMemo(() => {
    const combined = [
      ...manualTransactions,
      ...gameContributions
    ] as UnifiedTransaction[];

    return combined.sort((a, b) => 
      new Date(b.withdrawal_date).getTime() - new Date(a.withdrawal_date).getTime()
    );
  }, [manualTransactions, gameContributions]);

  return {
    unifiedTransactions,
    manualTransactions,
    gameContributions,
    isLoading,
    reload: loadTransactions
  };
};
