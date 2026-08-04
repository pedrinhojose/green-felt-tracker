import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

export type CashGameVariant = 'NLH' | 'PLO4' | 'PLO5' | 'PLO6' | 'OUTRO';

export interface CashTable {
  id: string;
  organization_id: string;
  name: string;
  game_variant: string;
  small_blind: number;
  big_blind: number;
  min_buyin: number;
  max_buyin: number;
  rake_percent: number;
  rake_cap: number;
  status: 'active' | 'closed';
  created_at: string;
  closed_at: string | null;
  notes?: string | null;
  sittingCount?: number;
  totalBuyins?: number;
  totalCashouts?: number;
  rake?: number;
  playersCount?: number;
}

export interface NewCashTableInput {
  name: string;
  game_variant: string;
  small_blind: number;
  big_blind: number;
  min_buyin: number;
  max_buyin: number;
  rake_percent: number;
  rake_cap: number;
}

export function useCashTables() {
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const [tables, setTables] = useState<CashTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchTables = useCallback(async () => {
    if (!currentOrganization?.id) {
      setTables([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cash_tables')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const list = (data || []) as unknown as CashTable[];

      const { data: sessions, error: sessionsError } = await supabase
        .from('cash_players_sessions')
        .select('cash_table_id, status, player_id, total_buyin, cashout_amount')
        .eq('organization_id', currentOrganization.id);

      if (sessionsError) throw sessionsError;

      type SessionRow = {
        cash_table_id: string;
        status: string;
        player_id: string;
        total_buyin: number | null;
        cashout_amount: number | null;
      };

      const sitting = new Map<string, number>();
      const buyins = new Map<string, number>();
      const cashouts = new Map<string, number>();
      const players = new Map<string, Set<string>>();

      ((sessions || []) as SessionRow[]).forEach((s) => {
        if (s.status === 'sitting') {
          sitting.set(s.cash_table_id, (sitting.get(s.cash_table_id) || 0) + 1);
        }
        buyins.set(s.cash_table_id, (buyins.get(s.cash_table_id) || 0) + Number(s.total_buyin || 0));
        cashouts.set(
          s.cash_table_id,
          (cashouts.get(s.cash_table_id) || 0) + Number(s.cashout_amount || 0)
        );
        if (!players.has(s.cash_table_id)) players.set(s.cash_table_id, new Set());
        players.get(s.cash_table_id)!.add(s.player_id);
      });

      setTables(
        list.map((t) => {
          const totalBuyins = buyins.get(t.id) || 0;
          const totalCashouts = cashouts.get(t.id) || 0;
          return {
            ...t,
            sittingCount: sitting.get(t.id) || 0,
            totalBuyins,
            totalCashouts,
            rake: totalBuyins - totalCashouts,
            playersCount: players.get(t.id)?.size || 0,
          };
        })
      );
    } catch (error) {
      console.error('useCashTables: erro ao carregar mesas', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as mesas de cash game.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization?.id, toast]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const createTable = useCallback(
    async (input: NewCashTableInput): Promise<string | null> => {
      if (!currentOrganization?.id) {
        toast({
          title: 'Erro',
          description: 'Nenhum clube selecionado.',
          variant: 'destructive',
        });
        return null;
      }

      setIsSaving(true);
      try {
        const { data: userData } = await supabase.auth.getUser();

        const { data, error } = await supabase
          .from('cash_tables')
          .insert({
            organization_id: currentOrganization.id,
            created_by: userData?.user?.id ?? null,
            name: input.name,
            game_variant: input.game_variant,
            small_blind: input.small_blind,
            big_blind: input.big_blind,
            min_buyin: input.min_buyin,
            max_buyin: input.max_buyin,
            rake_percent: input.rake_percent,
            rake_cap: input.rake_cap,
            status: 'active',
          })
          .select('id')
          .single();

        if (error) throw error;

        toast({
          title: 'Mesa aberta',
          description: `${input.name} foi criada com sucesso.`,
        });

        await fetchTables();
        return data.id;
      } catch (error) {
        console.error('useCashTables: erro ao criar mesa', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível abrir a mesa.',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [currentOrganization?.id, fetchTables, toast]
  );

  return {
    tables,
    activeTables: tables.filter((t) => t.status === 'active'),
    closedTables: tables.filter((t) => t.status === 'closed'),
    isLoading,
    isSaving,
    createTable,
    refresh: fetchTables,
  };
}
