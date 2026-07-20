import { usePoker } from "@/contexts/PokerContext";
import { PlayCircle, Zap } from "lucide-react";
import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const QuickGameCard = memo(function QuickGameCard() {
  const { activeSeason, createGame, createStandaloneGame } = usePoker();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

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
      setIsCreating(true);
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
      setIsCreating(false);
    }
  };

  const handleOpenStandaloneGame = async () => {
    if (isCreating) return;
    try {
      setIsCreating(true);
      const gameId = await createStandaloneGame();
      navigate(`/games/${gameId}`);
    } catch (error) {
      console.error("Error creating standalone game:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar uma partida avulsa.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const seasonDisabled = isCreating || !activeSeason;

  return (
    <div className="card-dashboard h-full min-h-[260px] hover:scale-[1.02] transition-all duration-200 ease-out">
      <div className="text-lg md:text-xl font-medium text-poker-gold mb-2 md:mb-3 pb-2 border-b border-white/10">
        Partidas
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Partida da temporada */}
        <button
          type="button"
          onClick={handleOpenSeasonGame}
          disabled={seasonDisabled}
          className="flex-1 flex items-center gap-4 px-2 border-b border-white/10 text-left hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-poker-green/40 border border-poker-green flex items-center justify-center shrink-0">
            <PlayCircle className="w-6 h-6 md:w-7 md:h-7 text-poker-gold" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm text-muted-foreground">
              {isCreating ? "Criando..." : "Abrir partida da temporada"}
            </span>
            <span className="text-base md:text-lg font-bold text-poker-gold truncate">
              {activeSeason ? activeSeason.name : "Sem temporada ativa"}
            </span>
          </div>
        </button>

        {/* Partida avulsa */}
        <button
          type="button"
          onClick={handleOpenStandaloneGame}
          disabled={isCreating}
          className="flex-1 flex items-center gap-4 px-2 text-left hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-900/40 border border-blue-500 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 md:w-7 md:h-7 text-blue-300" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm text-muted-foreground">
              {isCreating ? "Criando..." : "Abrir partida avulsa"}
            </span>
            <span className="text-base md:text-lg font-bold text-blue-300 truncate">
              Sem vínculo com temporada
            </span>
          </div>
        </button>
      </div>
    </div>
  );
});

export default QuickGameCard;
