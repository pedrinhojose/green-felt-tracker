import { formatCurrency } from '@/lib/utils/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Vault, TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react';

interface CaixinhaTransaction {
  id: string;
  amount: number;
  description: string;
  withdrawal_date: string;
  created_by: string;
  type: 'deposit' | 'withdrawal';
}

interface CaixinhaReportContainerProps {
  seasonName: string;
  organizationName: string;
  totalAccumulated: number;
  totalDeposits: number;
  totalWithdrawals: number;
  availableBalance: number;
  participatingPlayersCount: number;
  transactions: CaixinhaTransaction[];
}

export const CaixinhaReportContainer = ({
  seasonName,
  organizationName,
  totalAccumulated,
  totalDeposits,
  totalWithdrawals,
  availableBalance,
  participatingPlayersCount,
  transactions,
}: CaixinhaReportContainerProps) => {
  return (
    <div 
      id="caixinha-report-container"
      className="bg-background text-foreground p-6 max-w-4xl mx-auto"
      style={{ fontFamily: 'Inter, Arial, sans-serif' }}
    >
      {/* Header */}
      <div className="text-center mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-bold mb-2">Relatório da Caixinha</h1>
        <p className="text-lg text-muted-foreground">{organizationName}</p>
        <p className="text-sm text-muted-foreground">Temporada: {seasonName}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Gerado em: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dos Jogos</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-600">
              {formatCurrency(totalAccumulated)}
            </div>
            <p className="text-xs text-muted-foreground">
              Acumulado automaticamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Depósitos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(totalDeposits)}
            </div>
            <p className="text-xs text-muted-foreground">
              Depósitos manuais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saques</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">
              {formatCurrency(totalWithdrawals)}
            </div>
            <p className="text-xs text-muted-foreground">
              Saques realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
            <Vault className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(availableBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponível para saque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jogadores</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">
              {participatingPlayersCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Contribuíram
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma transação registrada.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Data</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Valor</TableHead>
                  <TableHead className="font-semibold">Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {new Date(transaction.withdrawal_date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'deposit' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className={transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.description || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center mt-8 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Gerado pelo APA Poker Club
        </p>
      </div>
    </div>
  );
};