
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRankingSync } from "@/hooks/useRankingSync";
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";

export default function RankingRecalculateButton() {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const { activeSeason } = usePoker();
  const { recalculateRankings, validateRankingConsistency } = useRankingSync();
  const { toast } = useToast();

  const handleRecalculate = async () => {
    if (!activeSeason) {
      toast({
        title: "Erro",
        description: "Nenhuma temporada ativa encontrada.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRecalculating(true);
      
      // Primeiro validar se há inconsistências
      console.log("Validando consistência dos rankings...");
      await validateRankingConsistency(activeSeason.id);
      
      // Recalcular rankings
      console.log("Recalculando rankings...");
      const newRankings = await recalculateRankings(activeSeason.id);
      
      toast({
        title: "Rankings atualizados",
        description: `Rankings recalculados com sucesso para ${newRankings.length} jogadores.`,
      });
      
      // Recarregar a página para mostrar os dados atualizados
      window.location.reload();
    } catch (error) {
      console.error("Erro ao recalcular rankings:", error);
      toast({
        title: "Erro",
        description: "Não foi possível recalcular os rankings.",
        variant: "destructive",
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <Button
      onClick={handleRecalculate}
      disabled={isRecalculating || !activeSeason}
      variant="outline"
      size="sm"
      className="bg-transparent border border-white/20 hover:bg-white/5"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isRecalculating ? 'animate-spin' : ''}`} />
      {isRecalculating ? 'Recalculando...' : 'Recalcular Rankings'}
    </Button>
  );
}
