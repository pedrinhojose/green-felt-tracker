
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { Season } from "@/lib/db/models";
import { AddJackpotDialog } from "@/components/jackpot/AddJackpotDialog";
import { memo, useMemo } from "react";

interface JackpotCardProps {
  activeSeason: Season;
}

// Usando memo com uma função de comparação explícita para prevenir re-renderizações desnecessárias
export const JackpotCard = memo(function JackpotCard({ activeSeason }: JackpotCardProps) {
  // Usa useMemo para evitar recálculos do valor formatado a cada renderização
  const formattedJackpot = useMemo(() => {
    return formatCurrency(activeSeason?.jackpot || 0);
  }, [activeSeason?.jackpot]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Jackpot Final</CardTitle>
        <AddJackpotDialog />
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
