
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { Season } from "@/lib/db/models";
import { memo, useMemo, useState } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { RefreshCw } from "lucide-react";

interface JackpotCardProps {
  activeSeason: Season;
}

// Usando memo com uma função de comparação explícita para prevenir re-renderizações desnecessárias
export const JackpotCard = memo(function JackpotCard({ activeSeason }: JackpotCardProps) {
  const { fixSeasonJackpot } = usePoker();
  const [isRecalculating, setIsRecalculating] = useState(false);
  
  // Usa useMemo para evitar recálculos do valor formatado a cada renderização
  const formattedJackpot = useMemo(() => {
    return formatCurrency(activeSeason?.jackpot || 0);
  }, [activeSeason?.jackpot]);

  const handleRecalculateJackpot = async () => {
    if (!activeSeason) return;
    
    setIsRecalculating(true);
    try {
      await fixSeasonJackpot(activeSeason.id);
    } catch (error) {
      console.error("Erro ao recalcular jackpot:", error);
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Jackpot Final</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRecalculateJackpot}
          disabled={isRecalculating || !activeSeason}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
          {isRecalculating ? 'Recalculando...' : 'Recalcular'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-3xl font-bold text-poker-gold mb-2">
            {formattedJackpot}
          </div>
          <p className="text-muted-foreground">
            O jackpot será distribuído ao encerrar a temporada conforme a configuração de premiação final.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Comparação personalizada: só re-renderiza se o valor do jackpot realmente mudar
  return prevProps.activeSeason?.jackpot === nextProps.activeSeason?.jackpot;
});
