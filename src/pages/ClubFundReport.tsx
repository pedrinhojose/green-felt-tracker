import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/navigation/PageHeader";
import { formatCurrency, formatDateTime } from "@/lib/utils/dateUtils";
import { ClubFundTransaction } from "@/lib/db/models";
import { usePoker } from "@/contexts/PokerContext";
import { Calendar, Download, FileText, TrendingUp, TrendingDown, Wallet, Filter, X } from "lucide-react";
import { toast } from "sonner";

export default function ClubFundReport() {
  const { activeSeason } = usePoker();
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [typeFilter, setTypeFilter] = useState<'all' | 'add' | 'remove'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // TODO: Get real transactions from database
  const mockTransactions: ClubFundTransaction[] = [
    {
      id: '1',
      seasonId: activeSeason?.id || '',
      type: 'add',
      amount: 50.00,
      description: 'Mensalidade - Janeiro',
      date: new Date('2024-01-15'),
      userId: 'user1'
    },
    {
      id: '2',
      seasonId: activeSeason?.id || '',
      type: 'remove',
      amount: 25.00,
      description: 'Compra de fichas',
      date: new Date('2024-01-20'),
      userId: 'user1'
    },
    {
      id: '3',
      seasonId: activeSeason?.id || '',
      type: 'add',
      amount: 100.00,
      description: 'Multa por atraso',
      date: new Date('2024-01-25'),
      userId: 'user1'
    }
  ];

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(transaction => {
      // Date filter
      if (dateFilter.start && new Date(transaction.date) < new Date(dateFilter.start)) {
        return false;
      }
      if (dateFilter.end && new Date(transaction.date) > new Date(dateFilter.end)) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && transaction.type !== typeFilter) {
        return false;
      }

      // Search filter
      if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [mockTransactions, dateFilter, typeFilter, searchTerm]);

  const summary = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'add')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'remove')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: filteredTransactions.length
    };
  }, [filteredTransactions]);

  const clearFilters = () => {
    setDateFilter({ start: '', end: '' });
    setTypeFilter('all');
    setSearchTerm('');
  };

  const exportToPDF = () => {
    toast.success('Exportação em PDF será implementada em breve');
  };

  const exportToExcel = () => {
    toast.success('Exportação em Excel será implementada em breve');
  };

  return (
    <>
      <PageHeader 
        title="Relatório do Caixa do Clube"
        description="Histórico completo de movimentações do caixa"
      />

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="start-date">Data Inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Data Final</Label>
              <Input
                id="end-date"
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="type-filter">Tipo</Label>
              <Select value={typeFilter} onValueChange={(value: 'all' | 'add' | 'remove') => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="add">Entradas</SelectItem>
                  <SelectItem value="remove">Saídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Buscar na descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpar Filtros
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entradas</p>
                <p className="text-lg font-semibold text-green-500">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saídas</p>
                <p className="text-lg font-semibold text-red-500">
                  {formatCurrency(summary.totalExpenses)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Atual</p>
                <p className="text-lg font-semibold text-primary">
                  {formatCurrency(activeSeason?.clubFund || 0)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transações</p>
                <p className="text-lg font-semibold">
                  {summary.transactionCount}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma transação encontrada com os filtros aplicados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {transaction.type === 'add' ? (
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                            <TrendingDown className="h-5 w-5 text-red-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={transaction.type === 'add' ? 'default' : 'destructive'}
                        className="mb-1"
                      >
                        {transaction.type === 'add' ? 'Entrada' : 'Saída'}
                      </Badge>
                      <p className={`font-semibold ${
                        transaction.type === 'add' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.type === 'add' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}