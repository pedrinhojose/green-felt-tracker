import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Plus, ExternalLink, Coins } from 'lucide-react';
import { useCashTables, NewCashTableInput, CashTable } from '@/hooks/cash/useCashTables';
import { useOrgMemberRole } from '@/hooks/useOrgMemberRole';
import CashTableCard from '@/components/cash/CashTableCard';
import NewCashTableDialog from '@/components/cash/NewCashTableDialog';

export default function CashGamePage() {
  const navigate = useNavigate();
  const { canEdit } = useOrgMemberRole();
  const { activeTables, closedTables, isLoading, isSaving, createTable, deleteTable } =
    useCashTables();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<CashTable | null>(null);

  const handleCreate = async (input: NewCashTableInput) => {
    const id = await createTable(input);
    if (id) setDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!tableToDelete) return;
    const ok = await deleteTable(tableToDelete.id);
    if (ok) setTableToDelete(null);
  };

  const renderList = (list: typeof activeTables, emptyText: string) => {
    if (isLoading) {
      return <p className="text-sm text-muted-foreground">Carregando mesas...</p>;
    }
    if (list.length === 0) {
      return (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground space-y-2">
            <Coins className="h-8 w-8 mx-auto opacity-50" />
            <p className="text-sm">{emptyText}</p>
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((table) => (
          <CashTableCard
            key={table.id}
            table={table}
            onClick={() => navigate(`/cash-game/mesa/${table.id}`)}
            onDelete={canEdit ? () => setTableToDelete(table) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Cash Game</h1>
          <p className="text-sm text-muted-foreground">
            Mesas de dinheiro vivo, independentes de temporadas e ranking.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.open('/cash-game', '_blank', 'noopener')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir em nova aba
          </Button>
          {canEdit && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Abrir nova mesa
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Mesas ativas ({activeTables.length})</TabsTrigger>
          <TabsTrigger value="closed">Histórico ({closedTables.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          {renderList(activeTables, 'Nenhuma mesa ativa no momento.')}
        </TabsContent>
        <TabsContent value="closed" className="mt-4">
          {renderList(closedTables, 'Nenhuma mesa encerrada ainda.')}
        </TabsContent>
      </Tabs>

      <NewCashTableDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleCreate}
        isSaving={isSaving}
      />

      <AlertDialog open={!!tableToDelete} onOpenChange={(o) => !o && setTableToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir mesa?</AlertDialogTitle>
            <AlertDialogDescription>
              A mesa "{tableToDelete?.name}" e todos os seus jogadores, buy-ins e cash-outs serão
              apagados permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isSaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
