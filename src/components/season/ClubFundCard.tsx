import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { Season } from "@/lib/db/models";
import { memo, useMemo, useState } from "react";
import { Plus, Minus, History, TrendingUp, Wallet, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ClubFundCardProps {
  activeSeason: Season;
  onUpdateClubFund: (amount: number, type: 'add' | 'remove', description: string) => Promise<void>;
}

export const ClubFundCard = memo(function ClubFundCard({ 
  activeSeason, 
  onUpdateClubFund
}: ClubFundCardProps) {
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formattedClubFund = useMemo(() => {
    return formatCurrency(activeSeason?.clubFund || 0);
  }, [activeSeason?.clubFund]);

  const handleTransaction = async (type: 'add' | 'remove') => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Por favor, insira um valor válido');
      return;
    }

    if (!description.trim()) {
      toast.error('Por favor, adicione uma descrição');
      return;
    }

    if (type === 'remove' && parseFloat(amount) > (activeSeason?.clubFund || 0)) {
      toast.error('Valor maior que o saldo disponível');
      return;
    }

    setIsLoading(true);
    try {
      await onUpdateClubFund(parseFloat(amount), type, description.trim());
      setAmount('');
      setDescription('');
      setIsAddDialogOpen(false);
      setIsRemoveDialogOpen(false);
      toast.success(
        type === 'add' 
          ? `R$ ${amount} adicionado ao caixa do clube` 
          : `R$ ${amount} retirado do caixa do clube`
      );
    } catch (error) {
      toast.error('Erro ao processar transação');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFrequency = (frequency: string) => {
    const frequencies: Record<string, string> = {
      'semanal': 'por semana',
      'mensal': 'por mês',
      'trimestral': 'por trimestre'
    };
    return frequencies[frequency] || frequency;
  };

  const sortedTransactions: any[] = [];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-white/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Caixa do Clube
        </CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {formattedClubFund}
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar ao Caixa</DialogTitle>
                  <DialogDescription>
                    Adicione valores ao caixa do clube
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="add-amount">Valor</Label>
                    <Input
                      id="add-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-description">Descrição</Label>
                    <Textarea
                      id="add-description"
                      placeholder="Descreva a origem do valor..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => handleTransaction('add')}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processando...' : 'Adicionar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Minus className="h-3 w-3 mr-1" />
                  Retirar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Retirar do Caixa</DialogTitle>
                  <DialogDescription>
                    Retire valores do caixa do clube. Saldo disponível: {formattedClubFund}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="remove-amount">Valor</Label>
                    <Input
                      id="remove-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="remove-description">Descrição</Label>
                    <Textarea
                      id="remove-description"
                      placeholder="Descreva o uso do valor..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => handleTransaction('remove')}
                    disabled={isLoading}
                    variant="destructive"
                  >
                    {isLoading ? 'Processando...' : 'Retirar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <History className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Histórico do Caixa</DialogTitle>
                  <DialogDescription>
                    Últimas movimentações do caixa do clube
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sortedTransactions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhuma movimentação encontrada
                    </p>
                  ) : (
                    sortedTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {transaction.type === 'add' ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <Minus className="h-4 w-4 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className={`font-medium ${
                          transaction.type === 'add' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {transaction.type === 'add' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/reports/club-fund')}
                    className="w-full flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver Relatório Completo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  return prevProps.activeSeason?.clubFund === nextProps.activeSeason?.clubFund;
});