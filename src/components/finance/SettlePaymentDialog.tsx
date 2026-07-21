import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency, formatDate } from '@/lib/utils/dateUtils';
import type { ReceivableRow } from '@/hooks/useReceivables';
import { useToast } from '@/hooks/use-toast';

interface Props {
  row: ReceivableRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (row: ReceivableRow, method: string, notes?: string) => Promise<void>;
}

export function SettlePaymentDialog({ row, open, onOpenChange, onConfirm }: Props) {
  const [method, setMethod] = useState('Pix');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!row) return null;
  const isDebt = row.amount < 0;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(row, method, notes || undefined);
      toast({ title: isDebt ? 'Baixa registrada' : 'Prêmio pago', description: 'Atualização concluída.' });
      onOpenChange(false);
      setNotes('');
      setMethod('Pix');
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message ?? 'Falha ao registrar', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isDebt ? 'Dar baixa no recebimento' : 'Pagar prêmio'}</DialogTitle>
          <DialogDescription>
            {row.playerName} · Partida #{row.gameNumber} · {formatDate(row.gameDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-md border p-3">
            <div className="text-sm text-muted-foreground">Valor</div>
            <div className={`text-2xl font-bold ${isDebt ? 'text-red-500' : 'text-emerald-500'}`}>
              {isDebt ? '' : '+'}{formatCurrency(row.amount)}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Forma de pagamento</Label>
            <RadioGroup value={method} onValueChange={setMethod} className="flex gap-4">
              {['Pix', 'Dinheiro', 'Outro'].map(opt => (
                <div key={opt} className="flex items-center gap-2">
                  <RadioGroupItem value={opt} id={`pm-${opt}`} />
                  <Label htmlFor={`pm-${opt}`} className="cursor-pointer">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Observações (opcional)</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? 'Salvando...' : isDebt ? 'Confirmar baixa' : 'Confirmar pagamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
