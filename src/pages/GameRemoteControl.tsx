import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, Skull, ChevronDown, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useGameManagement } from "@/hooks/useGameManagement";
import { usePlayerActions } from "@/hooks/usePlayerActions";
import { useOrgMemberRole } from "@/hooks/useOrgMemberRole";
import { PlayerEliminationDialog } from "@/components/game/PlayerEliminationDialog";
import { GamePlayer } from "@/lib/db/models";
import { setRebuyAnnounceMuted } from "@/lib/audio/announceRebuy";
import { toast } from "@/hooks/use-toast";

const money = (v: number) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function GameRemoteControl() {
  const navigate = useNavigate();
  const { isViewer } = useOrgMemberRole();
  const { game, setGame, isLoading, players } = useGameManagement();
  const { updatePlayerStats, eliminatePlayer } = usePlayerActions(game, setGame);
  const [query, setQuery] = useState("");
  const [toEliminate, setToEliminate] = useState<GamePlayer | null>(null);
  const [undo, setUndo] = useState<{ playerId: string; name: string } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout>>();

  // O som toca no computador/telão, não no celular que faz o rebuy.
  useEffect(() => {
    setRebuyAnnounceMuted(true);
    return () => setRebuyAnnounceMuted(false);
  }, []);

  const nameOf = (id: string) => players.find(p => p.id === id)?.name ?? "Jogador";

  const { active, eliminated } = useMemo(() => {
    const list = game?.players ?? [];
    const q = query.trim().toLowerCase();
    const match = (p: GamePlayer) => !q || nameOf(p.playerId).toLowerCase().includes(q);
    const byName = (a: GamePlayer, b: GamePlayer) => nameOf(a.playerId).localeCompare(nameOf(b.playerId));
    return {
      active: list.filter(p => !p.isEliminated && match(p)).sort(byName),
      eliminated: list.filter(p => p.isEliminated).sort((a, b) => (a.position ?? 99) - (b.position ?? 99)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, players, query]);

  if (isLoading || !game) {
    return <div className="p-6 text-center text-muted-foreground">Carregando partida...</div>;
  }

  if (isViewer || game.isFinished) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-muted-foreground">
          {game.isFinished ? "Esta partida já foi encerrada." : "Acesso apenas para administradores."}
        </p>
        <Button onClick={() => navigate(`/games/${game.id}`)}>Voltar para a partida</Button>
      </div>
    );
  }

  const remaining = game.players.filter(p => !p.isEliminated).length;

  const doRebuy = async (p: GamePlayer) => {
    await updatePlayerStats(p.playerId, "rebuys", p.rebuys + 1);
    const name = nameOf(p.playerId);
    toast({ title: `Rebuy: ${name}` });
    setUndo({ playerId: p.playerId, name });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 5000);
  };

  const doUndo = async () => {
    if (!undo) return;
    const p = game.players.find(x => x.playerId === undo.playerId);
    if (p && p.rebuys > 0) await updatePlayerStats(p.playerId, "rebuys", p.rebuys - 1);
    setUndo(null);
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-3 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/games/${game.id}`)} aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight">Partida #{game.number}</h1>
            <p className="text-xs text-muted-foreground">Gerência de Partida</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-card border border-border py-2">
            <div className="text-2xl font-bold">{remaining}</div>
            <div className="text-[11px] text-muted-foreground">na mesa</div>
          </div>
          <div className="rounded-lg bg-card border border-border py-2">
            <div className="text-lg font-bold text-primary">{money(game.totalPrizePool)}</div>
            <div className="text-[11px] text-muted-foreground">prêmio total</div>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar jogador" className="pl-9 h-11" />
        </div>
      </header>

      <ul className="divide-y divide-border">
        {active.map(p => (
          <li key={p.playerId} className="flex items-center gap-2 px-3 py-3">
            <div className="flex-1 min-w-0">
              <div className="text-base font-semibold truncate">{nameOf(p.playerId)}</div>
              <div className="text-xs text-muted-foreground">{p.rebuys} rebuy{p.rebuys === 1 ? "" : "s"}</div>
            </div>
            <Button className="h-12 px-4 gap-1 font-bold" onClick={() => doRebuy(p)}>
              <Plus className="h-4 w-4" /> Rebuy
            </Button>
            <Button variant="destructive" className="h-12 px-3 gap-1 font-bold" onClick={() => setToEliminate(p)}>
              <Skull className="h-4 w-4" /> Eliminar
            </Button>
          </li>
        ))}
        {active.length === 0 && (
          <li className="p-6 text-center text-muted-foreground">Nenhum jogador ativo encontrado.</li>
        )}
      </ul>

      {eliminated.length > 0 && (
        <Collapsible className="px-3 mt-4">
          <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-sm font-semibold text-muted-foreground">
            Eliminados ({eliminated.length}) <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="divide-y divide-border">
              {eliminated.map(p => (
                <li key={p.playerId} className="flex justify-between py-2 text-sm">
                  <span>{nameOf(p.playerId)}</span>
                  <span className="text-muted-foreground">{p.position ? `${p.position}º` : ""}</span>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      {undo && (
        <div className="fixed bottom-4 inset-x-3 z-30 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
          <span className="text-sm">Rebuy de <b>{undo.name}</b></span>
          <Button variant="outline" size="sm" className="gap-1" onClick={doUndo}>
            <Undo2 className="h-4 w-4" /> Desfazer
          </Button>
        </div>
      )}

      <PlayerEliminationDialog
        open={!!toEliminate}
        onOpenChange={o => !o && setToEliminate(null)}
        playerToEliminate={toEliminate}
        players={game.players}
        allPlayers={players}
        onConfirm={(id, by) => { eliminatePlayer(id, by); setToEliminate(null); }}
      />
    </div>
  );
}
