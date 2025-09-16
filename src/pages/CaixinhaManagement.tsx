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
import { Vault, Plus, TrendingDown, History, Users, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/navigation/PageHeader";

interface CaixinhaWithdrawal {
  id: string;
  amount: number;
  description: string;
  withdrawal_date: string;
  created_by: string;
}

export default function CaixinhaManagement() {
  const { activeSeason, games } = usePoker();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  
  const [withdrawals, setWithdrawals] = useState<CaixinhaWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalDescription, setWithdrawalDescription] = useState("");

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

  // Calculate total withdrawals
  const totalWithdrawals = useMemo(() => {
    return withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
  }, [withdrawals]);

  // Calculate available balance
  const availableBalance = totalAccumulated - totalWithdrawals;

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

  // Load withdrawals
  useEffect(() => {
    if (activeSeason && currentOrganization) {
      loadWithdrawals();
    }
  }, [activeSeason, currentOrganization]);

  const loadWithdrawals = async () => {
    if (!activeSeason || !currentOrganization) return;
    
    try {
      const { data, error } = await supabase
        .from('caixinha_withdrawals')
        .select('*')
        .eq('season_id', activeSeason.id)
        .eq('organization_id', currentOrganization.id)
        .order('withdrawal_date', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error loading withdrawals:', error);
      toast({
        title: "Erro ao carregar saques",
        description: "Não foi possível carregar o histórico de saques.",
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
        .from('caixinha_withdrawals')
        .insert({
          season_id: activeSeason.id,
          organization_id: currentOrganization.id,
          amount,
          description: withdrawalDescription,
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
      loadWithdrawals();
    } catch (error) {
      console.error('Error recording withdrawal:', error);
      toast({
        title: "Erro ao registrar saque",
        description: "Não foi possível registrar o saque.",
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Acumulado</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalAccumulated)}
            </div>
            <p className="text-xs text-muted-foreground">
              De {games?.filter(g => g.seasonId === activeSeason.id).length || 0} jogos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saques Realizados</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalWithdrawals)}
            </div>
            <p className="text-xs text-muted-foreground">
              {withdrawals.length} saques registrados
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
            <CardTitle className="text-sm font-medium">Jogadores Participantes</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {participatingPlayersCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Contribuíram para a caixinha
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
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
      </div>

      {/* Withdrawals History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Saques
          </CardTitle>
          <CardDescription>
            Histórico completo dos saques realizados na temporada atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando histórico...</p>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <TrendingDown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum saque registrado ainda.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      {new Date(withdrawal.withdrawal_date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium text-red-600">
                      {formatCurrency(withdrawal.amount)}
                    </TableCell>
                    <TableCell>{withdrawal.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}