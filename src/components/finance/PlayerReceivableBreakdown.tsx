import { usePoker } from '@/contexts/PokerContext';
import { formatCurrency } from '@/lib/utils/dateUtils';
import type { ReceivableRow } from '@/hooks/useReceivables';

interface Props {
  row: ReceivableRow;
}

export function PlayerReceivableBreakdown({ row }: Props) {
  const { seasons } = usePoker();
  const season = seasons.find(s => s.id === row.seasonId);
  const fp = season?.financialParams;

  const gp = row.gamePlayer || {};
  const rebuys = Number(gp.rebuys ?? 0);
  const addons = Number(gp.addons ?? 0);
  const prize = Number(gp.prize ?? 0);
  const clubFund = Number(gp.clubFundContribution ?? 0);
  const joinedDinner = !!gp.joinedDinner;
  const buyIn = gp.buyIn ? Number(fp?.buyIn ?? 0) : 0;
  const rebuyUnit = Number(fp?.rebuy ?? 0);
  const addonUnit = Number(fp?.addon ?? 0);
  const rebuyTotal = rebuys * rebuyUnit;
  const addonTotal = addons * addonUnit;
  const dinnerShare = joinedDinner && row.dinnerParticipants > 0
    ? row.dinnerCost / row.dinnerParticipants
    : 0;

  const totalGasto = buyIn + rebuyTotal + addonTotal + dinnerShare + clubFund;
  const liquido = prize - totalGasto;

  const Line = ({ label, value, muted, negative }: { label: string; value: string; muted?: boolean; negative?: boolean }) => (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className={muted ? 'text-muted-foreground' : ''}>{label}</span>
      <span className={`font-medium tabular-nums ${negative ? 'text-red-500' : ''}`}>{value}</span>
    </div>
  );

  return (
    <div className="rounded-lg bg-muted/40 border border-border/50 p-4 space-y-1">
      {!fp && row.seasonId && (
        <div className="text-xs text-amber-500 mb-2">
          Temporada não carregada — buy-in/rebuy/add-on podem estar zerados.
        </div>
      )}
      {!row.seasonId && (
        <div className="text-xs text-muted-foreground mb-2">Partida avulsa</div>
      )}
      <Line label="Buy-in" value={formatCurrency(buyIn)} />
      <Line label={`Rebuys (${rebuys}x)`} value={formatCurrency(rebuyTotal)} />
      <Line label={`Add-ons (${addons}x)`} value={formatCurrency(addonTotal)} />
      {joinedDinner && <Line label="Janta" value={formatCurrency(dinnerShare)} />}
      {clubFund > 0 && <Line label="Caixinha" value={formatCurrency(clubFund)} />}
      <div className="border-t border-border/60 my-2" />
      <Line label="Total gasto" value={formatCurrency(totalGasto)} negative />
      <Line label="Prêmio" value={formatCurrency(prize)} />
      <div className="border-t border-border/60 my-2" />
      <div className="flex items-center justify-between pt-1">
        <span className="font-semibold">Resultado líquido</span>
        <span className={`font-bold tabular-nums text-lg ${liquido >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {liquido >= 0 ? '+' : ''}{formatCurrency(liquido)}
        </span>
      </div>
    </div>
  );
}
