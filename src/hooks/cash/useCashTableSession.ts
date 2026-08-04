import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { CashTable } from './useCashTables';

export interface CashSession {
  id: string;
  organization_id: string;
  cash_table_id: string;
  player_id: string;
  total_buyin: number;
  cashout_amount: number;
  status: 'sitting' | 'cashed_out';
  joined_at: string;
  left_at: string | null;
}

export interface CashTransaction {
  id: string;
  session_id: string;
  cash_table_id: string;
  transaction_type: 'buyin' | 'rebuy' | 'cashout';
  amount: number;
  created_at: string;
}

export function useCashTableSession(tableId?: string) {
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const [table, setTable] = useState<CashTable | null>(null);
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!tableId) return;
    try {
      const [tableRes, sessionsRes, txRes] = await Promise.all([
        supabase.from('cash_tables').select('*').eq('id', tableId).maybeSingle(),
        supabase
          .from('cash_players_sessions')
          .select('*')
          .eq('cash_table_id', tableId)
          .order('joined_at', { ascending: true }),
        supabase
          .from('cash_transactions')
          .select('*')
          .eq('cash_table_id', tableId)
          .order('created_at', { ascending: true }),
      ]);

      if (tableRes.error) throw tableRes.error;
      if (sessionsRes.error) throw sessionsRes.error;
      if (txRes.error) throw txRes.error;

      setTable((tableRes.data as unknown as CashTable) ?? null);
      setSessions((sessionsRes.data || []) as unknown as CashSession[]);
      setTransactions((txRes.data || []) as unknown as CashTransaction[]);
    } catch (error) {
      console.error('useCashTableSession: erro ao carregar dados da mesa', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados da mesa.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [tableId, toast]);

  useEffect(() => {
    setIsLoading(true);
    fetchAll();
  }, [fetchAll]);

  // Realtime: mantém a tela sincronizada entre operadores/janelas
  useEffect(() => {
    if (!tableId) return;

    const channel = supabase
      .channel(`cash-table-${tableId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cash_players_sessions', filter: `cash_table_id=eq.${tableId}` },
        () => fetchAll()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cash_transactions', filter: `cash_table_id=eq.${tableId}` },
        () => fetchAll()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cash_tables', filter: `id=eq.${tableId}` },
        () => fetchAll()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableId, fetchAll]);

  const sittingSessions = useMemo(
    () => sessions.filter((s) => s.status === 'sitting'),
    [sessions]
  );
  const cashedOutSessions = useMemo(
    () => sessions.filter((s) => s.status === 'cashed_out'),
    [sessions]
  );

  const totalBuyins = useMemo(
    () => sessions.reduce((sum, s) => sum + Number(s.total_buyin || 0), 0),
    [sessions]
  );

  const totalCashouts = useMemo(
    () => sessions.reduce((sum, s) => sum + Number(s.cashout_amount || 0), 0),
    [sessions]
  );

  const uniquePlayersCount = useMemo(
    () => new Set(sessions.map((s) => s.player_id)).size,
    [sessions]
  );


  const addPlayer = useCallback(
    async (playerId: string, amount: number) => {
      if (!tableId || !currentOrganization?.id) return false;

      setIsSaving(true);
      try {
        const { data: userData } = await supabase.auth.getUser();

        const { data: session, error: sessionError } = await supabase
          .from('cash_players_sessions')
          .insert({
            organization_id: currentOrganization.id,
            cash_table_id: tableId,
            player_id: playerId,
            total_buyin: amount,
            status: 'sitting',
          })
          .select('id')
          .single();

        if (sessionError) throw sessionError;

        const { error: txError } = await supabase.from('cash_transactions').insert({
          organization_id: currentOrganization.id,
          session_id: session.id,
          cash_table_id: tableId,
          transaction_type: 'buyin',
          amount,
          created_by: userData?.user?.id ?? null,
        });

        if (txError) throw txError;

        toast({ title: 'Jogador na mesa', description: 'Buy-in registrado com sucesso.' });
        await fetchAll();
        return true;
      } catch (error) {
        console.error('useCashTableSession: erro ao adicionar jogador', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível adicionar o jogador.',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [tableId, currentOrganization?.id, fetchAll, toast]
  );

  const addRebuy = useCallback(
    async (session: CashSession, amount: number) => {
      if (!tableId || !currentOrganization?.id) return false;

      setIsSaving(true);
      try {
        const { data: userData } = await supabase.auth.getUser();

        const { error: txError } = await supabase.from('cash_transactions').insert({
          organization_id: currentOrganization.id,
          session_id: session.id,
          cash_table_id: tableId,
          transaction_type: 'rebuy',
          amount,
          created_by: userData?.user?.id ?? null,
        });
        if (txError) throw txError;

        const { error: updateError } = await supabase
          .from('cash_players_sessions')
          .update({ total_buyin: Number(session.total_buyin || 0) + amount })
          .eq('id', session.id);
        if (updateError) throw updateError;

        toast({ title: 'Re-buy registrado' });
        await fetchAll();
        return true;
      } catch (error) {
        console.error('useCashTableSession: erro no re-buy', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível registrar o re-buy.',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [tableId, currentOrganization?.id, fetchAll, toast]
  );

  const cashOut = useCallback(
    async (session: CashSession, finalChips: number) => {
      if (!tableId || !currentOrganization?.id) return false;

      setIsSaving(true);
      try {
        const { data: userData } = await supabase.auth.getUser();

        const { error: txError } = await supabase.from('cash_transactions').insert({
          organization_id: currentOrganization.id,
          session_id: session.id,
          cash_table_id: tableId,
          transaction_type: 'cashout',
          amount: finalChips,
          created_by: userData?.user?.id ?? null,
        });
        if (txError) throw txError;

        const { error: updateError } = await supabase
          .from('cash_players_sessions')
          .update({
            cashout_amount: finalChips,
            status: 'cashed_out',
            left_at: new Date().toISOString(),
          })
          .eq('id', session.id);
        if (updateError) throw updateError;

        toast({ title: 'Cash-out realizado' });
        await fetchAll();
        return true;
      } catch (error) {
        console.error('useCashTableSession: erro no cash-out', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível registrar o cash-out.',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [tableId, currentOrganization?.id, fetchAll, toast]
  );

  const closeTable = useCallback(async (notes?: string) => {
    if (!tableId) return false;
    if (sittingSessions.length > 0) {
      toast({
        title: 'Existem jogadores na mesa',
        description: 'Realize o cash-out de todos os jogadores antes de encerrar a mesa.',
        variant: 'destructive',
      });
      return false;
    }

    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        status: 'closed',
        closed_at: new Date().toISOString(),
      };
      if (notes) payload.notes = notes;

      const { error } = await supabase
        .from('cash_tables')
        .update(payload)
        .eq('id', tableId);
      if (error) throw error;

      toast({ title: 'Mesa encerrada' });
      await fetchAll();
      return true;
    } catch (error) {
      console.error('useCashTableSession: erro ao encerrar mesa', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível encerrar a mesa.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [tableId, sittingSessions.length, fetchAll, toast]);

  return {
    table,
    sessions,
    sittingSessions,
    cashedOutSessions,
    transactions,
    totalBuyins,
    totalCashouts,
    uniquePlayersCount,
    isLoading,
    isSaving,
    addPlayer,
    addRebuy,
    cashOut,
    closeTable,
    refresh: fetchAll,
  };
}

