import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils/dateUtils';
import { Calendar, Users } from 'lucide-react';
import type { GameContribution } from '@/hooks/useCaixinhaUnifiedTransactions';

interface GameContributionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contribution: GameContribution;
}

export const GameContributionsDialog = ({
  open,
  onOpenChange,
  contribution
}: GameContributionsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{contribution.description}</span>
            <span className="text-muted-foreground text-sm font-normal">
              - Detalhes das Contribuições
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="font-medium">
                  {new Date(contribution.withdrawal_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Jogadores</p>
                <p className="font-medium">{contribution.players_count}</p>
              </div>
            </div>
          </div>

          {/* Players Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 font-medium text-sm flex justify-between">
              <span>Jogador</span>
              <span>Contribuição</span>
            </div>
            <div className="divide-y">
              {contribution.players.map((player) => (
                <div
                  key={player.id}
                  className="px-4 py-3 flex justify-between items-center hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium">{player.name}</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    {formatCurrency(player.contribution)}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-muted px-4 py-3 font-bold flex justify-between border-t-2">
              <span>Total</span>
              <span className="text-green-600 dark:text-green-400">
                {formatCurrency(contribution.amount)}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
