import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/dateUtils';
import type { UnifiedTransaction } from '@/hooks/useCaixinhaUnifiedTransactions';
import { Badge } from '@/components/ui/badge';

interface UnifiedTransactionRowProps {
  transaction: UnifiedTransaction;
  isAdmin: boolean;
  onEdit?: (transaction: any) => void;
  onDelete?: (transaction: any) => void;
  onViewDetails?: (transaction: any) => void;
}

export const UnifiedTransactionRow = ({
  transaction,
  isAdmin,
  onEdit,
  onDelete,
  onViewDetails
}: UnifiedTransactionRowProps) => {
  const isGameContribution = 'game_id' in transaction;
  
  const getTypeLabel = () => {
    if (isGameContribution) {
      return <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">Jogo</Badge>;
    }
    
    if (transaction.type === 'deposit') {
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">Depósito</Badge>;
    }
    
    if (transaction.type === 'withdrawal') {
      return <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">Saque</Badge>;
    }
    
    return null;
  };

  return (
    <TableRow className={isGameContribution ? "bg-green-500/5" : ""}>
      <TableCell>
        {new Date(transaction.withdrawal_date).toLocaleDateString('pt-BR')}
      </TableCell>
      <TableCell>{getTypeLabel()}</TableCell>
      <TableCell className="font-semibold text-green-600 dark:text-green-400">
        {formatCurrency(transaction.amount)}
      </TableCell>
      <TableCell>
        {isGameContribution ? (
          <div className="flex items-center gap-2">
            <span>{transaction.description}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails?.(transaction)}
              className="h-7 text-xs"
            >
              <Users className="h-3 w-3 mr-1" />
              {(transaction as any).players_count} jogador
              {(transaction as any).players_count !== 1 ? 'es' : ''}
            </Button>
          </div>
        ) : (
          transaction.description
        )}
      </TableCell>
      <TableCell className="text-right">
        {!isGameContribution && isAdmin && (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(transaction)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(transaction)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};
