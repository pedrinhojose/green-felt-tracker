
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { usePoker } from "@/contexts/PokerContext";
import { formatCurrency } from "@/lib/utils/dateUtils";

export default function JackpotCard() {
  const { activeSeason } = usePoker();
  
  return (
    <div className="card-dashboard animate-card-float">
      <h3 className="card-dashboard-header">Jackpot Atual</h3>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-4xl font-bold text-poker-gold">
          {activeSeason ? (
            formatCurrency(activeSeason.jackpot)
          ) : (
            "Sem temporada ativa"
          )}
        </div>
      </div>
    </div>
  );
}
