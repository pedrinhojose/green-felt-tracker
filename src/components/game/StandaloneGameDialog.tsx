import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StandaloneGameConfig, PrizeEntry } from "@/lib/db/models";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (config: StandaloneGameConfig) => void | Promise<void>;
  initial?: StandaloneGameConfig;
  loading?: boolean;
}

const STORAGE_KEY = "apapoker.standaloneConfig.default";

const DEFAULT_SCHEMA: PrizeEntry[] = [
  { position: 1, percentage: 50 },
  { position: 2, percentage: 30 },
  { position: 3, percentage: 20 },
];

function loadDefault(): StandaloneGameConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return { buyIn: 50, rebuy: 50, addon: 50, weeklyPrizeSchema: DEFAULT_SCHEMA };
}

export default function StandaloneGameDialog({ open, onOpenChange, onConfirm, initial, loading }: Props) {
  const [config, setConfig] = useState<StandaloneGameConfig>(initial ?? loadDefault());

  useEffect(() => {
    if (open) setConfig(initial ?? loadDefault());
  }, [open, initial]);

  const totalPct = config.weeklyPrizeSchema.reduce((s, p) => s + Number(p.percentage || 0), 0);
  const pctOk = Math.round(totalPct) === 100;

  const updatePct = (idx: number, val: number) => {
    setConfig(c => ({
      ...c,
      weeklyPrizeSchema: c.weeklyPrizeSchema.map((p, i) => i === idx ? { ...p, percentage: val } : p),
    }));
  };

  const addPos = () => {
    setConfig(c => ({
      ...c,
      weeklyPrizeSchema: [...c.weeklyPrizeSchema, { position: c.weeklyPrizeSchema.length + 1, percentage: 0 }],
    }));
  };

  const removePos = () => {
    setConfig(c => ({
      ...c,
      weeklyPrizeSchema: c.weeklyPrizeSchema.slice(0, -1),
    }));
  };

  const handleConfirm = async () => {
    if (!pctOk) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch { /* noop */ }
    await onConfirm(config);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar partida avulsa</DialogTitle>
          <DialogDescription>
            Defina buy-in, rebuy, add-on e a distribuição de prêmios desta partida. Nada será somado à temporada, jackpot ou caixinha.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 py-2">
          <div>
            <Label>Buy-in (R$)</Label>
            <Input type="number" min={0} step="any" value={config.buyIn}
              onChange={(e) => setConfig(c => ({ ...c, buyIn: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Rebuy (R$)</Label>
            <Input type="number" min={0} step="any" value={config.rebuy}
              onChange={(e) => setConfig(c => ({ ...c, rebuy: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Add-on (R$)</Label>
            <Input type="number" min={0} step="any" value={config.addon}
              onChange={(e) => setConfig(c => ({ ...c, addon: Number(e.target.value) }))} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Distribuição de prêmios (%)</Label>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={removePos} disabled={config.weeklyPrizeSchema.length <= 1}>-</Button>
              <Button type="button" size="sm" variant="outline" onClick={addPos}>+</Button>
            </div>
          </div>
          <div className="space-y-2 max-h-56 overflow-auto pr-1">
            {config.weeklyPrizeSchema.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-12 text-sm text-muted-foreground">{p.position}º</span>
                <Input type="number" min={0} step="any" value={p.percentage}
                  onChange={(e) => updatePct(idx, Number(e.target.value))} />
                <span className="text-sm">%</span>
              </div>
            ))}
          </div>
          <p className={`text-xs ${pctOk ? "text-muted-foreground" : "text-destructive"}`}>
            Total: {totalPct}% {pctOk ? "" : "(precisa somar 100%)"}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!pctOk || loading}>
            {loading ? "Criando..." : "Iniciar partida"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
