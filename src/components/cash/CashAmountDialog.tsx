import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils/dateUtils';
import { cn } from '@/lib/utils';

interface CashAmountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'rebuy' | 'cashout';
  playerName: string;
  totalBuyin: number;
  isSaving?: boolean;
  onConfirm: (amount: number) => void | Promise<void>;
}

export default function CashAmountDialog({
  open,
  onOpenChange,
  mode,
  playerName,
  totalBuyin,
  isSaving,
  onConfirm,
}: CashAmountDialogProps) {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (open) setAmount('');
  }, [open, mode, playerName]);

  const value = parseFloat(amount.replace(',', '.'));
  const isValid = Number.isFinite(value) && value >= 0 && (mode === 'cashout' || value > 0);
  const result = Number.isFinite(value) ? value - totalBuyin : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'rebuy' ? 'Re-buy' : 'Cash-out'} — {playerName}
          </DialogTitle>
          <DialogDescription>
            {mode === 'rebuy'
              ? `Buy-ins acumulados: ${formatCurrency(totalBuyin)}. Informe o valor adicional de fichas.`
              : `Buy-ins acumulados: ${formatCurrency(totalBuyin)}. Informe o valor de fichas finais do jogador.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="cash-amount">
              {mode === 'rebuy' ? 'Valor do re-buy (R$)' : 'Fichas finais (R$)'}
            </Label>
            <Input
              id="cash-amount"
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>

          {mode === 'cashout' && Number.isFinite(value) && (
            <div className="rounded-md border p-3 text-sm flex items-center justify-between">
              <span className="text-muted-foreground">Resultado do jogador</span>
              <span
                className={cn(
                  'font-semibold',
                  result >= 0 ? 'text-emerald-500' : 'text-destructive'
                )}
              >
                {result >= 0 ? '+' : '-'}
                {formatCurrency(Math.abs(result))}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={() => isValid && onConfirm(value)} disabled={!isValid || isSaving}>
            {isSaving ? 'Salvando...' : mode === 'rebuy' ? 'Registrar re-buy' : 'Confirmar saída'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
