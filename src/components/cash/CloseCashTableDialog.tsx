import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Lock, Clock, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/dateUtils';
import { cn } from '@/lib/utils';

interface CloseCashTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalBuyins: number;
  totalCashouts: number;
  duration: string;
  playersCount: number;
  sittingCount: number;
  isSaving: boolean;
  onConfirm: (notes: string) => Promise<void> | void;
}

export default function CloseCashTableDialog({
  open,
  onOpenChange,
  totalBuyins,
  totalCashouts,
  duration,
  playersCount,
  sittingCount,
  isSaving,
  onConfirm,
}: CloseCashTableDialogProps) {
  const [notes, setNotes] = useState('');
  const result = totalBuyins - totalCashouts;
  const blocked = sittingCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Encerrar mesa</DialogTitle>
          <DialogDescription>
            {blocked
              ? `Ainda existem ${sittingCount} jogador(es) sentados. Realize o cash-out de todos antes de encerrar.`
              : 'Confira o balanço final da sessão antes de confirmar o fechamento.'}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Buy-ins / Re-buys arrecadados</span>
            <span className="font-semibold">{formatCurrency(totalBuyins)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Cash-outs pagos</span>
            <span className="font-semibold">{formatCurrency(totalCashouts)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-medium">Rake / Lucro do clube</span>
            <span
              className={cn(
                'text-lg font-bold',
                result >= 0 ? 'text-emerald-500' : 'text-destructive'
              )}
            >
              {result >= 0 ? '+' : '-'}
              {formatCurrency(Math.abs(result))}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duração da mesa
            </span>
            <span className="font-medium text-foreground">{duration}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Jogadores que participaram
            </span>
            <span className="font-medium text-foreground">{playersCount}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cash-close-notes">Observações da mesa (opcional)</Label>
          <Textarea
            id="cash-close-notes"
            placeholder="Ex: Mesa encerrada após 4h de jogo."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button disabled={blocked || isSaving} onClick={() => onConfirm(notes.trim())}>
            <Lock className="h-4 w-4 mr-2" />
            Confirmar fechamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
