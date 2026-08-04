import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Coins, Percent, CalendarClock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/dateUtils';
import { CashTable } from '@/hooks/cash/useCashTables';
import { cn } from '@/lib/utils';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface CashTableCardProps {
  table: CashTable;
  onClick?: () => void;
}

export default function CashTableCard({ table, onClick }: CashTableCardProps) {
  const isActive = table.status === 'active';

  return (
    <Card
      onClick={onClick}
      className={cn(
        'transition-all',
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base truncate">{table.name}</CardTitle>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Ativa' : 'Encerrada'}
          </Badge>
        </div>
        <Badge variant="outline" className="w-fit">
          {table.game_variant}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Coins className="h-4 w-4 shrink-0" />
          <span>
            Blinds: {formatCurrency(Number(table.small_blind))} /{' '}
            {formatCurrency(Number(table.big_blind))}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Coins className="h-4 w-4 shrink-0 opacity-0" />
          <span>
            Buy-in: {formatCurrency(Number(table.min_buyin))} –{' '}
            {formatCurrency(Number(table.max_buyin))}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Percent className="h-4 w-4 shrink-0" />
          <span>
            Rake: {Number(table.rake_percent)}% (cap {formatCurrency(Number(table.rake_cap))})
          </span>
        </div>
        {isActive ? (
          <div className="flex items-center gap-2 font-medium">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              {table.sittingCount ?? 0} jogador{(table.sittingCount ?? 0) === 1 ? '' : 'es'} na mesa
            </span>
          </div>
        ) : (
          <div className="mt-3 space-y-2 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5 shrink-0" />
              <span>
                {formatDateTime(table.closed_at || table.created_at)}
                {' · '}
                {table.playersCount ?? 0} jogador{(table.playersCount ?? 0) === 1 ? '' : 'es'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Buy-ins</span>
              <span className="font-medium">{formatCurrency(Number(table.totalBuyins || 0))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cash-outs</span>
              <span className="font-medium">{formatCurrency(Number(table.totalCashouts || 0))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Rake / Lucro</span>
              <span
                className={cn(
                  'font-bold',
                  Number(table.rake || 0) >= 0 ? 'text-emerald-500' : 'text-destructive'
                )}
              >
                {Number(table.rake || 0) >= 0 ? '+' : '-'}
                {formatCurrency(Math.abs(Number(table.rake || 0)))}
              </span>
            </div>
            {table.notes && (
              <p className="text-xs text-muted-foreground italic pt-1 border-t">{table.notes}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
