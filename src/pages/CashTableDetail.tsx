import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils/dateUtils';
import { CashTable } from '@/hooks/cash/useCashTables';

export default function CashTableDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [table, setTable] = useState<CashTable | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      const { data } = await supabase.from('cash_tables').select('*').eq('id', id).maybeSingle();
      if (!cancelled) {
        setTable((data as unknown as CashTable) ?? null);
        setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/cash-game')} className="px-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Cash Game
      </Button>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando mesa...</p>
      ) : !table ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Mesa não encontrada.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>{table.name}</CardTitle>
              <Badge variant={table.status === 'active' ? 'default' : 'secondary'}>
                {table.status === 'active' ? 'Ativa' : 'Encerrada'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <span className="text-muted-foreground">Modalidade: </span>
              {table.game_variant}
            </div>
            <div>
              <span className="text-muted-foreground">Blinds: </span>
              {formatCurrency(Number(table.small_blind))} /{' '}
              {formatCurrency(Number(table.big_blind))}
            </div>
            <div>
              <span className="text-muted-foreground">Buy-in: </span>
              {formatCurrency(Number(table.min_buyin))} –{' '}
              {formatCurrency(Number(table.max_buyin))}
            </div>
            <div>
              <span className="text-muted-foreground">Rake: </span>
              {Number(table.rake_percent)}% (cap {formatCurrency(Number(table.rake_cap))})
            </div>
            <div className="sm:col-span-2 pt-2 text-muted-foreground">
              Gestão de jogadores, buy-ins e cashout será implementada na próxima etapa.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
