import { useState, useEffect, useMemo } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Vault, Plus, TrendingDown, TrendingUp, History, Users, DollarSign, FileText, Image } from "lucide-react";
import { PageHeader } from "@/components/navigation/PageHeader";
import { useCaixinhaReportExport } from "@/hooks/useCaixinhaReportExport";
import { CaixinhaReportContainer } from "@/components/reports/CaixinhaReportContainer";

interface CaixinhaTransaction {
  id: string;
  amount: number;
  description: string;
  withdrawal_date: string;
  created_by: string;
  type: 'deposit' | 'withdrawal';
}

export default function CaixinhaManagement() {
  const { activeSeason, games } = usePoker();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const { isExportingPdf, isExportingImage, exportCaixinhaReportAsPdf, exportCaixinhaReportAsImage } = useCaixinhaReportExport();
  
  const [transactions, setTransactions] = useState<CaixinhaTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalDescription, setWithdrawalDescription] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDescription, setDepositDescription] = useState("");

  // Calculate total accumulated from games
  const totalAccumulated = useMemo(() => {
    if (!activeSeason || !games) return 0;
    
    const seasonGames = games.filter(game => game.seasonId === activeSeason.id);
    let total = 0;
    
    seasonGames.forEach(game => {
      if (game.players && Array.isArray(game.players)) {
        game.players.forEach(player => {
          if (player.participatesInClubFund && player.clubFundContribution) {
            total += player.clubFundContribution;
          }
        });
      }
    });
    
    return total;
  }, [activeSeason, games]);

  // Calculate total deposits and withdrawals
  const totalDeposits = useMemo(() => {
    return transactions
      .filter(transaction => transaction.type === 'deposit')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  const totalWithdrawals = useMemo(() => {
    return transactions
      .filter(transaction => transaction.type === 'withdrawal')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  // Calculate available balance (accumulated from games + manual deposits - withdrawals)
  const availableBalance = useMemo(() => {
    return totalAccumulated + totalDeposits - totalWithdrawals;
  }, [totalAccumulated, totalDeposits, totalWithdrawals]);

  // Count participating players
  const participatingPlayersCount = useMemo(() => {
    if (!activeSeason || !games) return 0;
    
    const seasonGames = games.filter(game => game.seasonId === activeSeason.id);
    const playerIds = new Set<string>();
    
    seasonGames.forEach(game => {
      if (game.players && Array.isArray(game.players)) {
        game.players.forEach(player => {
          if (player.participatesInClubFund) {
            playerIds.add(player.playerId);
          }
        });
      }
    });
    
    return playerIds.size;
  }, [activeSeason, games]);

  // Load transactions
  useEffect(() => {
    if (activeSeason && currentOrganization) {
      loadTransactions();
    }
  }, [activeSeason, currentOrganization]);

  const loadTransactions = async () => {
    if (!activeSeason || !currentOrganization) return;
    
    try {
      const { data, error } = await supabase
        .from('caixinha_transactions')
        .select('*')
        .eq('season_id', activeSeason.id)
        .eq('organization_id', currentOrganization.id)
        .order('withdrawal_date', { ascending: false });

      if (error) throw error;
      setTransactions((data || []) as CaixinhaTransaction[]);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "Erro ao carregar transações",
        description: "Não foi possível carregar o histórico de transações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!activeSeason || !currentOrganization) return;
    
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido para o saque.",
        variant: "destructive",
      });
      return;
    }

    if (amount > availableBalance) {
      toast({
        title: "Saldo insuficiente",
        description: "O valor do saque não pode ser maior que o saldo disponível.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('caixinha_transactions')
        .insert({
          season_id: activeSeason.id,
          organization_id: currentOrganization.id,
          amount,
          description: withdrawalDescription,
          type: 'withdrawal',
          created_by: userData.user.id,
          user_id: userData.user.id,
        });

      if (error) throw error;

      toast({
        title: "Saque registrado",
        description: `Saque de ${formatCurrency(amount)} registrado com sucesso.`,
      });

      setShowWithdrawalDialog(false);
      setWithdrawalAmount("");
      setWithdrawalDescription("");
      loadTransactions();
    } catch (error) {
      console.error('Error recording withdrawal:', error);
      toast({
        title: "Erro ao registrar saque",
        description: "Não foi possível registrar o saque.",
        variant: "destructive",
      });
    }
  };

  const handleDeposit = async () => {
    if (!activeSeason || !currentOrganization) return;
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido para o depósito.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('caixinha_transactions')
        .insert({
          season_id: activeSeason.id,
          organization_id: currentOrganization.id,
          amount,
          description: depositDescription,
          type: 'deposit',
          created_by: userData.user.id,
          user_id: userData.user.id,
        });

      if (error) throw error;

      toast({
        title: "Depósito registrado",
        description: `Depósito de ${formatCurrency(amount)} registrado com sucesso.`,
      });

      setShowDepositDialog(false);
      setDepositAmount("");
      setDepositDescription("");
      loadTransactions();
    } catch (error) {
      console.error('Error recording deposit:', error);
      toast({
        title: "Erro ao registrar depósito",
        description: "Não foi possível registrar o depósito.",
        variant: "destructive",
      });
    }
  };

  const handleExportPdf = async () => {
    if (!activeSeason || !currentOrganization) return;
    
    try {
      const reportData = {
        seasonName: activeSeason.name,
        organizationName: currentOrganization.name,
        totalAccumulated,
        totalDeposits,
        totalWithdrawals,
        availableBalance,
        participatingPlayersCount,
        transactions,
      };
      
      const filename = `relatorio-caixinha-${activeSeason.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`;
      await exportCaixinhaReportAsPdf(reportData, filename);
      
      toast({
        title: "Relatório exportado",
        description: "O relatório PDF foi gerado com sucesso.",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o relatório PDF.",
        variant: "destructive",
      });
    }
  };

  const handleExportImage = async () => {
    if (!activeSeason || !currentOrganization) return;
    
    try {
      const filename = `relatorio-caixinha-${activeSeason.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`;
      await exportCaixinhaReportAsImage('caixinha-report-container', filename);
      
      toast({
        title: "Relatório exportado",
        description: "O relatório em imagem foi gerado com sucesso.",
      });
    } catch (error) {
      console.error('Error exporting image:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o relatório em imagem.",
        variant: "destructive",
      });
    }
  };

  if (!activeSeason) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader 
          title="Gestão da Caixinha"
          description="Gerencie os recursos da caixinha da temporada"
        />
        <Card>
          <CardContent className="p-8 text-center">
            <Vault className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma temporada ativa. Crie uma nova temporada para começar a gerenciar a caixinha.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <PageHeader 
        title="Gestão da Caixinha"
        description={`Gerencie os recursos da caixinha da temporada ${activeSeason.name}`}
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dos Jogos</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
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
            <div className="text-2xl font-bold text-green-600">
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
            <div className="text-2xl font-bold text-red-600">
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
            <div className="text-2xl font-bold text-blue-600">
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
            <div className="text-2xl font-bold text-purple-600">
              {participatingPlayersCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Contribuíram
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <TrendingUp className="w-4 h-4 mr-2" />
              Depositar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Depósito na Caixinha</DialogTitle>
              <DialogDescription>
                Registre um depósito manual nos recursos da caixinha.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Valor do Depósito</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit-description">Descrição</Label>
                <Textarea
                  id="deposit-description"
                  placeholder="Descreva a origem do depósito..."
                  value={depositDescription}
                  onChange={(e) => setDepositDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDepositDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleDeposit} className="bg-green-600 hover:bg-green-700">
                Registrar Depósito
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
          <DialogTrigger asChild>
            <Button>
              <TrendingDown className="w-4 h-4 mr-2" />
              Registrar Saque
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Saque da Caixinha</DialogTitle>
              <DialogDescription>
                Registre um saque dos recursos da caixinha. Saldo disponível: {formatCurrency(availableBalance)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor do Saque</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o motivo do saque..."
                  value={withdrawalDescription}
                  onChange={(e) => setWithdrawalDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWithdrawalDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleWithdrawal}>
                Registrar Saque
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Buttons */}
        <Button 
          variant="outline" 
          onClick={handleExportPdf} 
          disabled={isExportingPdf}
          className="ml-auto"
        >
          <FileText className="w-4 h-4 mr-2" />
          {isExportingPdf ? 'Gerando PDF...' : 'Exportar PDF'}
        </Button>

        <Button 
          variant="outline" 
          onClick={handleExportImage} 
          disabled={isExportingImage}
        >
          <Image className="w-4 h-4 mr-2" />
          {isExportingImage ? 'Gerando Imagem...' : 'Exportar Imagem'}
        </Button>
      </div>

      {/* Transactions History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Transações
          </CardTitle>
          <CardDescription>
            Histórico completo das transações realizadas na temporada atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando histórico...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma transação registrada ainda.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.withdrawal_date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'deposit' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'deposit' ? (
                          <>
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Depósito
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3 mr-1" />
                            Saque
                          </>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className={`font-medium ${
                      transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Hidden Report Container for Image Export */}
      <div className="hidden">
        <CaixinhaReportContainer
          seasonName={activeSeason.name}
          organizationName={currentOrganization?.name || ''}
          totalAccumulated={totalAccumulated}
          totalDeposits={totalDeposits}
          totalWithdrawals={totalWithdrawals}
          availableBalance={availableBalance}
          participatingPlayersCount={participatingPlayersCount}
          transactions={transactions}
        />
      </div>
    </div>
  );
}