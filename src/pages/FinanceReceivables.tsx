import { Fragment, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader } from '@/components/navigation/PageHeader';
import { Receipt, TrendingUp, TrendingDown, CheckCircle2, Search, Undo2, ChevronDown, ChevronRight, Users, MessageCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/dateUtils';
import { useReceivables, RECEIVABLES_CUTOFF_DATE, type ReceivableRow, type SettlementStatus } from '@/hooks/useReceivables';
import { SettlePaymentDialog } from '@/components/finance/SettlePaymentDialog';
import { PlayerReceivableBreakdown } from '@/components/finance/PlayerReceivableBreakdown';
import { useOrgMemberRole } from '@/hooks/useOrgMemberRole';
import { useToast } from '@/hooks/use-toast';
import { usePoker } from '@/contexts/PokerContext';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';


type StatusFilter = 'todos' | 'pendentes' | 'a_receber' | 'quitados';

const statusMeta: Record<SettlementStatus, { label: string; className: string }> = {
  pendente: { label: 'Pendente', className: 'bg-red-500/15 text-red-500 border-red-500/30' },
  a_receber: { label: 'Prêmio a Pagar', className: 'bg-blue-500/15 text-blue-500 border-blue-500/30' },
  pago: { label: 'Quitado', className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  premiado_pago: { label: 'Prêmio Pago', className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
};

export default function FinanceReceivables() {
  const { rows, receivablesByPlayer, gamesList, isLoading, settlePayment, undoSettlement } = useReceivables();
  const { canEdit } = useOrgMemberRole();
  const { toast } = useToast();
  const { players } = usePoker();
  const phoneByPlayer = useMemo(() => {
    const m = new Map<string, string | undefined>();
    players.forEach(p => m.set(p.id, p.phone));
    return m;
  }, [players]);

  const sanitizePhone = (phone?: string) => {
    if (!phone) return '';
    let digits = phone.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 11) digits = '55' + digits;
    return digits;
  };

  const handleWhatsApp = (r: ReceivableRow) => {
    const phone = phoneByPlayer.get(r.playerId);
    const digits = sanitizePhone(phone);
    if (!digits) {
      toast({ title: 'Telefone não cadastrado', description: `Cadastre o telefone de ${r.playerName} no perfil do jogador.`, variant: 'destructive' });
      return;
    }
    const firstName = r.playerName.split(' ')[0];
    const valor = formatCurrency(Math.abs(r.amount));
    const dataPartida = formatDate(r.gameDate);
    let msg: string;
    if (r.amount < 0) {
      msg = `Olá, ${firstName}! 👋\n\nPassando para lembrar sobre o saldo pendente da partida #${r.gameNumber} (${dataPartida}) no valor de *${valor}*.\n\nAssim que puder, é só efetuar o pagamento. Qualquer dúvida, estou à disposição! 🃏`;
    } else {
      msg = `Olá, ${firstName}! 🎉\n\nInformo que foi realizado o pagamento do seu prêmio da partida #${r.gameNumber} (${dataPartida}) no valor de *${valor}*.\n\nParabéns e até a próxima! 🏆🃏`;
    }
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const [gameFilter, setGameFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [search, setSearch] = useState('');
  const [dialogRow, setDialogRow] = useState<ReceivableRow | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggleExpanded = (key: string) => setExpanded(prev => {
    const n = new Set(prev);
    n.has(key) ? n.delete(key) : n.add(key);
    return n;
  });

  const summary = useMemo(() => {
    let toReceive = 0, toPay = 0, quitado = 0;
    for (const r of rows) {
      if (r.status === 'pendente') toReceive += Math.abs(r.amount);
      else if (r.status === 'a_receber') toPay += r.amount;
      else quitado += Math.abs(r.amount);
    }
    return { toReceive, toPay, quitado };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (gameFilter !== 'all' && r.gameId !== gameFilter) return false;
      if (statusFilter === 'pendentes' && r.status !== 'pendente') return false;
      if (statusFilter === 'a_receber' && r.status !== 'a_receber') return false;
      if (statusFilter === 'quitados' && r.status !== 'pago' && r.status !== 'premiado_pago') return false;
      if (q && !r.playerName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, gameFilter, statusFilter, search]);

  const handleUndo = async (row: ReceivableRow) => {
    try {
      await undoSettlement(row);
      toast({ title: 'Baixa desfeita' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recebimentos"
        description={`Gestão de pagamentos das partidas (a partir de ${formatDate(new Date(RECEIVABLES_CUTOFF_DATE))})`}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="surface-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-500/10 text-red-500"><TrendingDown className="w-6 h-6" /></div>
            <div>
              <div className="text-sm text-muted-foreground">A Receber do Clube</div>
              <div className="text-2xl font-bold text-red-500">{formatCurrency(summary.toReceive)}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="surface-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <div className="text-sm text-muted-foreground">A Pagar (Prêmios)</div>
              <div className="text-2xl font-bold text-blue-500">{formatCurrency(summary.toPay)}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="surface-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="w-6 h-6" /></div>
            <div>
              <div className="text-sm text-muted-foreground">Total Quitado no Período</div>
              <div className="text-2xl font-bold text-emerald-500">{formatCurrency(summary.quitado)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="por-partida" className="space-y-4">
        <TabsList>
          <TabsTrigger value="por-partida"><Receipt className="w-4 h-4 mr-2" />Por Partida</TabsTrigger>
          <TabsTrigger value="por-jogador"><Users className="w-4 h-4 mr-2" />Por Jogador</TabsTrigger>
        </TabsList>

        <TabsContent value="por-partida" className="space-y-4">
          {/* Filters */}
          <Card className="surface-card">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger><SelectValue placeholder="Selecionar partida" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Partidas</SelectItem>
                  {gamesList.map(g => (
                    <SelectItem key={g.id} value={g.id}>Partida #{g.number} · {formatDate(g.date)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="pendentes">Pendentes</SelectItem>
                  <SelectItem value="a_receber">A Receber (Prêmios)</SelectItem>
                  <SelectItem value="quitados">Quitados</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar jogador..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>


      {/* Table */}
      <Card className="surface-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Jogador</TableHead>
                  <TableHead>Partida / Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center w-16">Msg</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Carregando...</TableCell></TableRow>
                )}
                {!isLoading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      Nenhum recebimento encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map(r => {
                  const isDebt = r.amount < 0;
                  const isQuit = r.status === 'pago' || r.status === 'premiado_pago';
                  const meta = statusMeta[r.status];
                  const isOpen = expanded.has(r.key);
                  return (
                    <Fragment key={r.key}>
                      <TableRow key={r.key} className="cursor-pointer" onClick={() => toggleExpanded(r.key)}>
                        <TableCell className="w-10">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={(e) => { e.stopPropagation(); toggleExpanded(r.key); }}
                            aria-label={isOpen ? 'Recolher detalhes' : 'Ver detalhes'}
                          >
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={r.playerPhoto} alt={r.playerName} />
                              <AvatarFallback>{r.playerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{r.playerName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">#{r.gameNumber}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(r.gameDate)}</div>
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${isDebt ? 'text-red-500' : 'text-emerald-500'}`}>
                          {isDebt ? '' : '+'}{formatCurrency(r.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          {canEdit && !isQuit && (
                            <Button size="sm" onClick={() => setDialogRow(r)}>
                              {isDebt ? 'Dar Baixa' : 'Pagar Prêmio'}
                            </Button>
                          )}
                          {canEdit && isQuit && (
                            <Button size="sm" variant="ghost" onClick={() => handleUndo(r)}>
                              <Undo2 className="w-4 h-4 mr-1" /> Desfazer
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow key={`${r.key}-details`} className="hover:bg-transparent">
                          <TableCell colSpan={6} className="bg-muted/20 p-4">
                            <PlayerReceivableBreakdown row={r} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}

              </TableBody>
            </Table>
          </div>
        </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="por-jogador" className="space-y-4">
          <Card className="surface-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jogador</TableHead>
                      <TableHead className="text-center">Partidas em aberto</TableHead>
                      <TableHead className="text-right">Total devendo</TableHead>
                      <TableHead className="text-right">Prêmios a receber</TableHead>
                      <TableHead className="text-right">Saldo líquido</TableHead>
                      <TableHead>Última partida</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivablesByPlayer.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          Nenhuma pendência em aberto.
                        </TableCell>
                      </TableRow>
                    )}
                    {receivablesByPlayer.map(p => (
                      <TableRow key={p.playerId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={p.playerPhoto} alt={p.playerName} />
                              <AvatarFallback>{p.playerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{p.playerName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{p.openCount}</TableCell>
                        <TableCell className="text-right text-red-500 font-semibold">
                          {p.totalOwed > 0 ? formatCurrency(p.totalOwed) : '—'}
                        </TableCell>
                        <TableCell className="text-right text-emerald-500 font-semibold">
                          {p.totalPrize > 0 ? `+${formatCurrency(p.totalPrize)}` : '—'}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${p.netBalance < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {p.netBalance >= 0 ? '+' : ''}{formatCurrency(p.netBalance)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.lastGameDate ? formatDate(p.lastGameDate) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SettlePaymentDialog
        row={dialogRow}
        open={!!dialogRow}
        onOpenChange={(o) => !o && setDialogRow(null)}
        onConfirm={settlePayment}
      />
    </div>

  );
}
