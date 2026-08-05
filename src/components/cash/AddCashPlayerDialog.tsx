import { useMemo, useState } from 'react';
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
import { formatCurrency } from '@/lib/utils/dateUtils';
import { Player } from '@/lib/db/models';
import { usePoker } from '@/contexts/PokerContext';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

interface AddCashPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  minBuyin: number;
  maxBuyin: number;
  isSaving?: boolean;
  onConfirm: (playerId: string, amount: number) => void | Promise<void>;
}

export default function AddCashPlayerDialog({
  open,
  onOpenChange,
  players,
  minBuyin,
  maxBuyin,
  isSaving,
  onConfirm,
}: AddCashPlayerDialogProps) {
  const { savePlayer } = usePoker();
  const { toast } = useToast();
  const [playerId, setPlayerId] = useState('');
  const [amount, setAmount] = useState(String(minBuyin || 0));
  const [search, setSearch] = useState('');
  const [showNewPlayer, setShowNewPlayer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const value = parseFloat(amount.replace(',', '.'));
  const amountValid =
    Number.isFinite(value) && value >= minBuyin && (maxBuyin <= 0 || value <= maxBuyin);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = term ? players.filter((p) => p.name.toLowerCase().includes(term)) : players;
    return list.slice(0, 100);
  }, [players, search]);

  const reset = () => {
    setPlayerId('');
    setSearch('');
    setAmount(String(minBuyin || 0));
    setShowNewPlayer(false);
    setNewName('');
    setNewPhone('');
  };

  const handleSubmit = async () => {
    if (!playerId || !amountValid) return;
    await onConfirm(playerId, value);
    reset();
  };

  const handleCreateAndSeat = async () => {
    const name = newName.trim();
    if (!name || !amountValid) return;
    setIsCreating(true);
    try {
      const id = await savePlayer({ name, phone: newPhone.trim() || undefined });
      if (!id) throw new Error('Falha ao cadastrar jogador');
      await onConfirm(id, value);
      reset();
    } catch (error) {
      console.error('AddCashPlayerDialog: erro ao cadastrar jogador', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível cadastrar o jogador.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar jogador</DialogTitle>
          <DialogDescription>
            Buy-in permitido: {formatCurrency(minBuyin)}
            {maxBuyin > 0 ? ` – ${formatCurrency(maxBuyin)}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cash-player-search">Buscar jogador</Label>
            <Input
              id="cash-player-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Digite o nome"
              maxLength={80}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Jogador</Label>
            <Select value={playerId} onValueChange={setPlayerId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o jogador" />
              </SelectTrigger>
              <SelectContent>
                {filtered.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cash-buyin">Buy-in inicial (R$)</Label>
            <Input
              id="cash-buyin"
              type="number"
              min={minBuyin}
              max={maxBuyin > 0 ? maxBuyin : undefined}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {!amountValid && amount !== '' && (
              <p className="text-xs text-destructive">
                Valor precisa estar entre {formatCurrency(minBuyin)} e{' '}
                {formatCurrency(maxBuyin)}.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!playerId || !amountValid || isSaving}>
            {isSaving ? 'Salvando...' : 'Colocar na mesa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
