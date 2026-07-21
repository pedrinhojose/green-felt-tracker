import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { usePoker } from '@/contexts/PokerContext';

export const RECEIVABLES_CUTOFF_DATE = '2026-07-20';

export type SettlementStatus = 'pendente' | 'a_receber' | 'pago' | 'premiado_pago';

export interface Settlement {
  id: string;
  game_id: string;
  player_id: string;
  amount: number;
  status: SettlementStatus;
  payment_method: string | null;
  settled_at: string | null;
  notes: string | null;
}

export interface ReceivableRow {
  key: string; // game_id + player_id
  gameId: string;
  gameNumber: number;
  gameDate: Date;
  seasonId: string | null;
  playerId: string;
  playerName: string;
  playerPhoto?: string;
  amount: number; // negative = owes, positive = prize
  status: SettlementStatus;
  paymentMethod: string | null;
  settledAt: string | null;
  settlementId: string | null;
  gamePlayer: any; // raw snapshot for breakdown
  dinnerCost: number;
  dinnerParticipants: number;
}

interface GameRow {
  id: string;
  number: number;
  date: string;
  season_id: string | null;
  players: any;
  dinner_cost: number | null;
  is_finished: boolean;
}


export function useReceivables() {
  const { currentOrganization } = useOrganization();
  const { players } = usePoker();
  const [games, setGames] = useState<GameRow[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const orgId = currentOrganization?.id;

  const loadGames = useCallback(async () => {
    if (!orgId) return;
    const { data, error } = await supabase
      .from('games')
      .select('id, number, date, players, is_finished')
      .eq('organization_id', orgId)
      .eq('is_finished', true)
      .gte('date', RECEIVABLES_CUTOFF_DATE)
      .order('date', { ascending: false });
    if (!error && data) setGames(data as GameRow[]);
  }, [orgId]);

  const loadSettlements = useCallback(async () => {
    if (!orgId) return;
    const { data, error } = await supabase
      .from('game_player_settlements')
      .select('*')
      .eq('organization_id', orgId);
    if (!error && data) setSettlements(data as Settlement[]);
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    setIsLoading(true);
    Promise.all([loadGames(), loadSettlements()]).finally(() => setIsLoading(false));
  }, [orgId, loadGames, loadSettlements]);

  // Realtime on settlements
  useEffect(() => {
    if (!orgId) return;
    const channel = supabase
      .channel('settlements_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_player_settlements', filter: `organization_id=eq.${orgId}` },
        () => { loadSettlements(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orgId, loadSettlements]);

  const playerMap = useMemo(() => {
    const m = new Map<string, { name: string; photoUrl?: string }>();
    players.forEach(p => m.set(p.id, { name: p.name, photoUrl: p.photoUrl }));
    return m;
  }, [players]);

  const settlementMap = useMemo(() => {
    const m = new Map<string, Settlement>();
    settlements.forEach(s => m.set(`${s.game_id}:${s.player_id}`, s));
    return m;
  }, [settlements]);

  const rows: ReceivableRow[] = useMemo(() => {
    const out: ReceivableRow[] = [];
    for (const g of games) {
      const gp: any[] = Array.isArray(g.players) ? g.players : [];
      for (const p of gp) {
        const balance = Number(p?.balance ?? 0);
        if (!balance) continue;
        const playerId = p.playerId || p.player_id;
        if (!playerId) continue;
        const key = `${g.id}:${playerId}`;
        const s = settlementMap.get(key);
        const info = playerMap.get(playerId);
        const defaultStatus: SettlementStatus = balance < 0 ? 'pendente' : 'a_receber';
        out.push({
          key,
          gameId: g.id,
          gameNumber: g.number,
          gameDate: new Date(g.date),
          playerId,
          playerName: info?.name ?? 'Jogador',
          playerPhoto: info?.photoUrl,
          amount: balance,
          status: s ? s.status : defaultStatus,
          paymentMethod: s?.payment_method ?? null,
          settledAt: s?.settled_at ?? null,
          settlementId: s?.id ?? null,
        });
      }
    }
    return out;
  }, [games, settlementMap, playerMap]);

  const gamesList = useMemo(() =>
    games.map(g => ({ id: g.id, number: g.number, date: new Date(g.date) })),
    [games]
  );

  const settlePayment = useCallback(async (
    row: ReceivableRow,
    paymentMethod: string,
    notes?: string
  ) => {
    if (!orgId) return;
    const newStatus: SettlementStatus = row.amount < 0 ? 'pago' : 'premiado_pago';
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('game_player_settlements')
      .upsert({
        organization_id: orgId,
        game_id: row.gameId,
        player_id: row.playerId,
        amount: row.amount,
        status: newStatus,
        payment_method: paymentMethod,
        settled_at: new Date().toISOString(),
        settled_by: userRes.user?.id ?? null,
        notes: notes ?? null,
      }, { onConflict: 'game_id,player_id' });
    if (error) throw error;
  }, [orgId]);

  const undoSettlement = useCallback(async (row: ReceivableRow) => {
    if (!row.settlementId) return;
    const { error } = await supabase
      .from('game_player_settlements')
      .delete()
      .eq('id', row.settlementId);
    if (error) throw error;
  }, []);

  return { rows, gamesList, isLoading, settlePayment, undoSettlement, reload: () => { loadGames(); loadSettlements(); } };
}
