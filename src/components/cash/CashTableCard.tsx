import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Coins, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/dateUtils';
import { CashTable } from '@/hooks/cash/useCashTables';
import { cn } from '@/lib/utils';

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
        <div className="flex items-center gap-2 font-medium">
          <Users className="h-4 w-4 shrink-0" />
          <span>
            {table.sittingCount ?? 0} jogador{(table.sittingCount ?? 0) === 1 ? '' : 'es'} na mesa
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
