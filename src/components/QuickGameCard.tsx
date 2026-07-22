import { usePoker } from "@/contexts/PokerContext";
import { PlayCircle, Zap, Play, Loader2 } from "lucide-react";
import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import StandaloneGameDialog from "@/components/game/StandaloneGameDialog";
import { StandaloneGameConfig } from "@/lib/db/models";

const QuickGameCard = memo(function QuickGameCard() {
  const { activeSeason, createGame, createStandaloneGame } = usePoker();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [creatingType, setCreatingType] = useState<null | "season" | "standalone">(null);
  const [standaloneDialogOpen, setStandaloneDialogOpen] = useState(false);
  const isCreating = creatingType !== null;

  const handleOpenSeasonGame = async () => {
    if (isCreating) return;
    if (!activeSeason) {
      toast({
        title: "Erro",
        description: "Não há temporada ativa. Crie ou selecione uma temporada antes de iniciar uma partida.",
        variant: "destructive",
      });
      return;
    }
    try {
      setCreatingType("season");
      const gameId = await createGame(activeSeason.id);
      navigate(`/games/${gameId}`);
    } catch (error) {
      console.error("Error creating game:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar uma nova partida.",
        variant: "destructive",
      });
    } finally {
      setCreatingType(null);
    }
  };

  const handleConfirmStandalone = async (config: StandaloneGameConfig) => {
    if (isCreating) return;
    try {
      setCreatingType("standalone");
      const gameId = await createStandaloneGame(config);
      setStandaloneDialogOpen(false);
      navigate(`/games/${gameId}`);
    } catch (error) {
      console.error("Error creating standalone game:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar uma partida avulsa.",
        variant: "destructive",
      });
    } finally {
      setCreatingType(null);
    }
  };

  const seasonDisabled = isCreating || !activeSeason;
  const seasonLoading = creatingType === "season";
  const standaloneLoading = creatingType === "standalone";

  return (
    <div className="card-dashboard h-full min-h-[260px] transition-all duration-200 ease-out">
      <div className="text-lg md:text-xl font-medium text-poker-gold mb-2 md:mb-3 pb-2 border-b border-white/10">
        Partidas
      </div>

      <div className="flex-1 flex flex-col min-h-0 gap-3">
        {/* Partida da temporada */}
        <div className="flex-1 flex flex-col justify-between gap-2 p-3 rounded-lg bg-poker-green/10 border border-poker-green/40 hover:border-poker-green transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-poker-green/40 border border-poker-green flex items-center justify-center shrink-0">
              <PlayCircle className="w-5 h-5 text-poker-gold" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Partida da Temporada
              </span>
              <span className="text-sm md:text-base font-bold text-poker-gold truncate">
                {activeSeason ? activeSeason.name : "Sem temporada ativa"}
              </span>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleOpenSeasonGame}
            disabled={seasonDisabled}
            className="w-full bg-poker-gold hover:bg-poker-gold/90 text-poker-black font-semibold shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
            title={!activeSeason ? "Nenhuma temporada ativa" : undefined}
          >
            {seasonLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2 fill-current" />
                Iniciar partida
              </>
            )}
          </Button>
        </div>

        {/* Partida avulsa */}
        <div className="flex-1 flex flex-col justify-between gap-2 p-3 rounded-lg bg-blue-900/10 border border-blue-500/40 hover:border-blue-500 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-blue-900/40 border border-blue-500 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-blue-300" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Partida Avulsa
              </span>
              <span className="text-sm md:text-base font-bold text-blue-300 truncate">
                Sem vínculo com temporada
              </span>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setStandaloneDialogOpen(true)}
            disabled={isCreating}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
          >
            {standaloneLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2 fill-current" />
                Iniciar partida avulsa
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

export default QuickGameCard;
