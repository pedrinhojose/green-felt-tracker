import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Settings2, CalendarClock } from "lucide-react";
import { Season, StandaloneGameConfig } from "@/lib/db/models";
import StandaloneGameDialog from "@/components/game/StandaloneGameDialog";
import { standaloneConfigFromSeason } from "@/lib/utils/standaloneConfig";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSeason: Season | null;
  onConfirm: (config: StandaloneGameConfig) => void | Promise<void>;
  loading?: boolean;
  /** Configuração atual, quando editando uma partida já criada */
  initial?: StandaloneGameConfig;
  confirmLabel?: string;
}

export default function StandaloneGameSetupDialog({
  open,
  onOpenChange,
  activeSeason,
  onConfirm,
  loading,
  initial,
  confirmLabel,
}: Props) {
  const [manualOpen, setManualOpen] = useState(false);

  const handleUseSeason = async () => {
    if (!activeSeason) return;
    await onConfirm(standaloneConfigFromSeason(activeSeason));
  };

  const handleManualConfirm = async (config: StandaloneGameConfig) => {
    await onConfirm({ ...config, source: 'manual' });
    setManualOpen(false);
  };

  return (
    <>
      <Dialog open={open && !manualOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Partida sem configuração
            </DialogTitle>
            <DialogDescription>
              Uma partida avulsa precisa de buy-in, rebuy, add-on e premiação definidos antes de começar.
              Escolha como deseja configurar:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <button
              type="button"
              onClick={handleUseSeason}
              disabled={!activeSeason || loading}
              className="w-full text-left p-3 rounded-lg border border-poker-gold/40 bg-poker-gold/5 hover:border-poker-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2 font-semibold text-poker-gold">
                <CalendarClock className="h-4 w-4" />
                Usar valores da temporada atual
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeSeason
                  ? <>Copia buy-in, rebuy, add-on, premiação e blinds de <strong>{activeSeason.name}</strong>. Jackpot, caixinha e ranking são ignorados.</>
                  : "Nenhuma temporada ativa disponível."}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setManualOpen(true)}
              disabled={loading}
              className="w-full text-left p-3 rounded-lg border border-white/15 hover:border-white/40 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-2 font-semibold">
                <Settings2 className="h-4 w-4" />
                Configurar partida manualmente
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Defina os valores e a distribuição de prêmios só para esta partida.
              </p>
            </button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StandaloneGameDialog
        open={manualOpen}
        onOpenChange={(v) => {
          setManualOpen(v);
          if (!v && !open) onOpenChange(false);
        }}
        onConfirm={handleManualConfirm}
        initial={initial}
        loading={loading}
        confirmLabel={confirmLabel}
      />
    </>
  );
}
