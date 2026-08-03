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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NewCashTableInput } from '@/hooks/cash/useCashTables';

interface NewCashTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (input: NewCashTableInput) => void | Promise<void>;
  isSaving?: boolean;
}

const VARIANTS = ['NLH', 'PLO4', 'PLO5', 'PLO6', 'OUTRO'];

export default function NewCashTableDialog({
  open,
  onOpenChange,
  onConfirm,
  isSaving,
}: NewCashTableDialogProps) {
  const [name, setName] = useState('Mesa 1');
  const [variant, setVariant] = useState('NLH');
  const [smallBlind, setSmallBlind] = useState('1');
  const [bigBlind, setBigBlind] = useState('2');
  const [minBuyin, setMinBuyin] = useState('50');
  const [maxBuyin, setMaxBuyin] = useState('200');
  const [rakePercent, setRakePercent] = useState('5');
  const [rakeCap, setRakeCap] = useState('10');

  const num = (v: string) => {
    const parsed = parseFloat(v.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const isValid = name.trim().length > 0 && num(bigBlind) > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    await onConfirm({
      name: name.trim(),
      game_variant: variant,
      small_blind: num(smallBlind),
      big_blind: num(bigBlind),
      min_buyin: num(minBuyin),
      max_buyin: num(maxBuyin),
      rake_percent: num(rakePercent),
      rake_cap: num(rakeCap),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Abrir nova mesa</DialogTitle>
          <DialogDescription>
            Defina a modalidade, os blinds, os limites de buy-in e o rake da mesa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cash-name">Nome da mesa</Label>
              <Input
                id="cash-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mesa 1"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Modalidade</Label>
              <Select value={variant} onValueChange={setVariant}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VARIANTS.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cash-sb">Small blind (R$)</Label>
              <Input
                id="cash-sb"
                type="number"
                min="0"
                step="0.5"
                value={smallBlind}
                onChange={(e) => setSmallBlind(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cash-bb">Big blind (R$)</Label>
              <Input
                id="cash-bb"
                type="number"
                min="0"
                step="0.5"
                value={bigBlind}
                onChange={(e) => setBigBlind(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cash-min">Buy-in mínimo (R$)</Label>
              <Input
                id="cash-min"
                type="number"
                min="0"
                value={minBuyin}
                onChange={(e) => setMinBuyin(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cash-max">Buy-in máximo (R$)</Label>
              <Input
                id="cash-max"
                type="number"
                min="0"
                value={maxBuyin}
                onChange={(e) => setMaxBuyin(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cash-rake">Rake (%)</Label>
              <Input
                id="cash-rake"
                type="number"
                min="0"
                step="0.5"
                value={rakePercent}
                onChange={(e) => setRakePercent(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cash-cap">Rake cap (R$)</Label>
              <Input
                id="cash-cap"
                type="number"
                min="0"
                value={rakeCap}
                onChange={(e) => setRakeCap(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSaving}>
            {isSaving ? 'Criando...' : 'Criar mesa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
