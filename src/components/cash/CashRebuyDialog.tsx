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

interface CashRebuyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerName: string;
  totalBuyin: number;
  minBuyin: number;
  maxBuyin: number;
  isSaving?: boolean;
  onConfirm: (amount: number) => void | Promise<void>;
}

export default function CashRebuyDialog({
  open,
  onOpenChange,
  playerName,
  totalBuyin,
  minBuyin,
  maxBuyin,
  isSaving,
  onConfirm,
}: CashRebuyDialogProps) {
  const [mode, setMode] = useState<'quick' | 'custom'>('quick');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (open) {
      setMode('quick');
      setAmount('');
    }
  }, [open, playerName]);

  const value = parseFloat(amount.replace(',', '.'));
  const inRange = (v: number) =>
    Number.isFinite(v) && v >= minBuyin && (maxBuyin <= 0 || v <= maxBuyin);
  const customValid = inRange(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Re-buy — {playerName}</DialogTitle>
          <DialogDescription>
            Buy-ins acumulados: {formatCurrency(totalBuyin)}. Valor permitido:{' '}
            {formatCurrency(minBuyin)}
            {maxBuyin > 0 ? ` – ${formatCurrency(maxBuyin)}` : ''}.
          </DialogDescription>
        </DialogHeader>

        {mode === 'quick' ? (
          <div className="grid gap-2">
            <Button
              variant="outline"
              className="h-auto py-3 flex-col items-start"
              disabled={isSaving}
              onClick={() => onConfirm(minBuyin)}
            >
              <span className="text-xs text-muted-foreground">Valor mínimo</span>
              <span className="text-lg font-bold">{formatCurrency(minBuyin)}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col items-start"
              disabled={isSaving || maxBuyin <= 0}
              onClick={() => onConfirm(maxBuyin)}
            >
              <span className="text-xs text-muted-foreground">Valor máximo</span>
              <span className="text-lg font-bold">{formatCurrency(maxBuyin)}</span>
            </Button>
            <Button variant="secondary" disabled={isSaving} onClick={() => setMode('custom')}>
              Outro valor
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="cash-rebuy-amount">Valor do re-buy (R$)</Label>
            <Input
              id="cash-rebuy-amount"
              type="number"
              min={minBuyin}
              max={maxBuyin > 0 ? maxBuyin : undefined}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
            {amount !== '' && !customValid && (
              <p className="text-xs text-destructive">
                O valor precisa estar entre {formatCurrency(minBuyin)} e{' '}
                {formatCurrency(maxBuyin)}.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {mode === 'custom' ? (
            <>
              <Button variant="outline" onClick={() => setMode('quick')} disabled={isSaving}>
                Voltar
              </Button>
              <Button
                onClick={() => customValid && onConfirm(value)}
                disabled={!customValid || isSaving}
              >
                {isSaving ? 'Salvando...' : 'Registrar re-buy'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancelar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
