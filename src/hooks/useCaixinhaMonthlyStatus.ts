import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Game } from '@/lib/db/models';

/**
 * Retorna o conjunto de jogadores que JÁ pagaram o caixinha no mês da partida de referência.
 * Regra: caixinha é cobrado 1x por mês por jogador. Partidas avulsas não contam.
 */
export function useCaixinhaMonthlyStatus(game: Game | null) {
  const { currentOrganization } = useOrganization();
  const [paidPlayerIds, setPaidPlayerIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const referenceDate = game?.date ? new Date(game.date) : new Date();
  const monthKey = `${referenceDate.getFullYear()}-${referenceDate.getMonth()}`;
  const orgId = currentOrganization?.id;
  const currentGameId = game?.id;

  const load = useCallback(async () => {
    if (!orgId) {
      setPaidPlayerIds(new Set());
      return;
    }

    try {
      setIsLoading(true);

      // Limites locais do mês de referência (evita deslocamento de fuso)
      const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1, 0, 0, 0, 0);

      const { data, error } = await supabase
        .from('games')
        .select('id, players, is_standalone, date')
        .eq('organization_id', orgId)
        .gte('date', start.toISOString())
        .lt('date', end.toISOString());

      if (error) throw error;

      const paid = new Set<string>();
      (data || []).forEach((row: any) => {
        if (row.is_standalone) return;
        if (currentGameId && row.id === currentGameId) return;
        const players = (row.players as any[]) || [];
        players.forEach(p => {
          if (p?.participatesInClubFund && (p?.clubFundContribution || 0) > 0 && p?.playerId) {
            paid.add(p.playerId);
          }
        });
      });

      setPaidPlayerIds(paid);
    } catch (err) {
      console.error('Erro ao carregar status do caixinha do mês:', err);
      setPaidPlayerIds(new Set());
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, monthKey, currentGameId]);

  useEffect(() => {
    load();
  }, [load]);

  const hasPaidThisMonth = useCallback(
    (playerId: string) => paidPlayerIds.has(playerId),
    [paidPlayerIds]
  );

  return { paidPlayerIds, hasPaidThisMonth, isLoading, reload: load };
}
