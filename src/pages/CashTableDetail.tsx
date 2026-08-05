import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Plus,
  Users,
  Coins,
  Clock,
  LogOut,
  RotateCcw,
  Lock,
  Undo2,
  Trash2,
  Unlock,
  Receipt,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePoker } from '@/contexts/PokerContext';
import { useOrgMemberRole } from '@/hooks/useOrgMemberRole';
import { formatCurrency } from '@/lib/utils/dateUtils';
import { useCashTableSession, CashSession } from '@/hooks/cash/useCashTableSession';
import AddCashPlayerDialog from '@/components/cash/AddCashPlayerDialog';
import CashAmountDialog from '@/components/cash/CashAmountDialog';
import CashRebuyDialog from '@/components/cash/CashRebuyDialog';
import CloseCashTableDialog from '@/components/cash/CloseCashTableDialog';
import CashSessionReceiptDialog from '@/components/cash/CashSessionReceiptDialog';


import { cn } from '@/lib/utils';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(fromIso: string, toIso: string | null, now: number) {
  const start = new Date(fromIso).getTime();
  const end = toIso ? new Date(toIso).getTime() : now;
  const totalMinutes = Math.max(0, Math.floor((end - start) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, '0')}min`;
}

export default function CashTableDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { players } = usePoker();
  const { canEdit } = useOrgMemberRole();
  const {
    table,
    sessions,
    sittingSessions,
    cashedOutSessions,
    rebuyCountBySession,
    totalBuyins,
    totalCashouts,
    uniquePlayersCount,
    isLoading,
    isSaving,
    addPlayer,
    addRebuy,
    cashOut,
    closeTable,
    reopenTable,
    undoLastRebuy,
    reopenSession,
    removeSession,
  } = useCashTableSession(id);


  const [now, setNow] = useState(Date.now());
  const [addOpen, setAddOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [rebuySession, setRebuySession] = useState<CashSession | null>(null);
  const [removeTarget, setRemoveTarget] = useState<CashSession | null>(null);
  const [amountDialog, setAmountDialog] = useState<{
    mode: 'rebuy' | 'cashout';
    session: CashSession;
  } | null>(null);


  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const playerNames = useMemo(() => {
    const map = new Map<string, string>();
    players.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [players]);

  const availablePlayers = useMemo(() => {
    const seated = new Set(sittingSessions.map((s) => s.player_id));
    return players
      .filter((p) => p.isActive !== false && !seated.has(p.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [players, sittingSessions]);

  const receiptRows = useMemo(
    () =>
      sessions.map((s) => ({
        name: playerNames.get(s.player_id) || 'Jogador',
        buyin: Number(s.total_buyin || 0),
        cashout: Number(s.cashout_amount || 0),
      })),
    [sessions, playerNames]
  );

  const isActive = table?.status === 'active';


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-sm text-muted-foreground">Carregando mesa...</p>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-4">
        <Button variant="ghost" onClick={() => navigate('/cash-game')} className="px-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Mesa não encontrada.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/cash-game')} className="px-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Cash Game
      </Button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{table.name}</h1>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Ativa' : 'Encerrada'}
            </Badge>
            <Badge variant="outline">{table.game_variant}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Blinds {formatCurrency(Number(table.small_blind))} /{' '}
            {formatCurrency(Number(table.big_blind))} · Buy-in{' '}
            {formatCurrency(Number(table.min_buyin))} – {formatCurrency(Number(table.max_buyin))} ·
            Rake {Number(table.rake_percent)}% (cap {formatCurrency(Number(table.rake_cap))})
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {sessions.length > 0 && (
            <Button variant="outline" onClick={() => setReceiptOpen(true)}>
              <Receipt className="h-4 w-4 mr-2" />
              Cupom / Resumo
            </Button>
          )}
          {canEdit &&
            (isActive ? (
              <>
                <Button onClick={() => setAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar jogador
                </Button>
                <Button variant="outline" onClick={() => setCloseOpen(true)}>
                  <Lock className="h-4 w-4 mr-2" />
                  Encerrar mesa
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setReopenOpen(true)} disabled={isSaving}>
                <Unlock className="h-4 w-4 mr-2" />
                Reabrir mesa
              </Button>
            ))}
        </div>
      </div>


      {/* Resumo */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Buy-ins arrecadados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalBuyins)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Jogadores sentados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sittingSessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duração da mesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatDuration(table.created_at, table.closed_at, now)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sitting">
        <TabsList>
          <TabsTrigger value="sitting">Na mesa ({sittingSessions.length})</TabsTrigger>
          <TabsTrigger value="out">Já saíram ({cashedOutSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="sitting" className="mt-4">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              {sittingSessions.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum jogador na mesa.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jogador</TableHead>
                      <TableHead>Entrada</TableHead>
                      <TableHead>Tempo</TableHead>
                      <TableHead className="text-right">Buy-ins</TableHead>
                      {canEdit && isActive && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sittingSessions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          {playerNames.get(s.player_id) || 'Jogador'}
                        </TableCell>
                        <TableCell>{formatTime(s.joined_at)}</TableCell>
                        <TableCell>{formatDuration(s.joined_at, null, now)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(s.total_buyin))}
                        </TableCell>
                        {canEdit && isActive && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setRebuySession(s)}
                              >
                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                Re-buy
                              </Button>
                              {(rebuyCountBySession.get(s.id) || 0) > 0 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={isSaving}
                                  onClick={() => undoLastRebuy(s)}
                                  title="Desfazer último re-buy"
                                >
                                  <Undo2 className="h-3.5 w-3.5 mr-1" />
                                  Desfazer re-buy
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() => setAmountDialog({ mode: 'cashout', session: s })}
                              >
                                <LogOut className="h-3.5 w-3.5 mr-1" />
                                Cash-out
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                disabled={isSaving}
                                onClick={() => setRemoveTarget(s)}
                                title="Remover lançamento do jogador"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        )}

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="out" className="mt-4">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              {cashedOutSessions.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Ninguém deu cash-out ainda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jogador</TableHead>
                      <TableHead>Entrada</TableHead>
                      <TableHead>Saída</TableHead>
                      <TableHead className="text-right">Compras</TableHead>
                      <TableHead className="text-right">Fichas finais</TableHead>
                      <TableHead className="text-right">Resultado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashedOutSessions.map((s) => {
                      const result = Number(s.cashout_amount) - Number(s.total_buyin);
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">
                            {playerNames.get(s.player_id) || 'Jogador'}
                          </TableCell>
                          <TableCell>{formatTime(s.joined_at)}</TableCell>
                          <TableCell>{s.left_at ? formatTime(s.left_at) : '—'}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(Number(s.total_buyin))}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(Number(s.cashout_amount))}
                          </TableCell>
                          <TableCell
                            className={cn(
                              'text-right font-semibold',
                              result >= 0 ? 'text-emerald-500' : 'text-destructive'
                            )}
                          >
                            {result >= 0 ? '+' : '-'}
                            {formatCurrency(Math.abs(result))}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddCashPlayerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        players={availablePlayers}
        minBuyin={Number(table.min_buyin)}
        maxBuyin={Number(table.max_buyin)}
        isSaving={isSaving}
        onConfirm={async (playerId, amount) => {
          const ok = await addPlayer(playerId, amount);
          if (ok) setAddOpen(false);
        }}
      />

      {amountDialog && (
        <CashAmountDialog
          open
          onOpenChange={(open) => !open && setAmountDialog(null)}
          mode={amountDialog.mode}
          playerName={playerNames.get(amountDialog.session.player_id) || 'Jogador'}
          totalBuyin={Number(amountDialog.session.total_buyin)}
          isSaving={isSaving}
          onConfirm={async (value) => {
            const ok =
              amountDialog.mode === 'rebuy'
                ? await addRebuy(amountDialog.session, value)
                : await cashOut(amountDialog.session, value);
            if (ok) setAmountDialog(null);
          }}
        />
      )}

      <CloseCashTableDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        totalBuyins={totalBuyins}
        totalCashouts={totalCashouts}
        duration={formatDuration(table.created_at, table.closed_at, now)}
        playersCount={uniquePlayersCount}
        sittingCount={sittingSessions.length}
        isSaving={isSaving}
        onConfirm={async (notes) => {
          const ok = await closeTable(notes);
          if (ok) {
            setCloseOpen(false);
            navigate('/cash-game');
          }
        }}
      />

    </div>
  );
}
