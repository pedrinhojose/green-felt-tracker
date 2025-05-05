
import { usePoker } from "@/contexts/PokerContext";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { useEffect, useState } from "react";
import { pokerDB } from "@/lib/db";

export default function JackpotCard() {
  const { activeSeason } = usePoker();
  const [jackpotValue, setJackpotValue] = useState<number | null>(null);
  
  useEffect(() => {
    // Atualiza o valor do jackpot diretamente do banco de dados
    // para garantir que temos o valor mais recente
    if (activeSeason) {
      const updateJackpot = async () => {
        const freshSeason = await pokerDB.getSeason(activeSeason.id);
        if (freshSeason) {
          setJackpotValue(freshSeason.jackpot);
        }
      };
      
      updateJackpot();
    }
  }, [activeSeason]);
  
  return (
    <div className="card-dashboard animate-card-float">
      <h3 className="card-dashboard-header">Jackpot Atual</h3>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-4xl font-bold bg-gradient-to-r from-poker-gold to-amber-300 bg-clip-text text-transparent">
          {activeSeason ? (
            formatCurrency(jackpotValue !== null ? jackpotValue : activeSeason.jackpot)
          ) : (
            "Sem temporada ativa"
          )}
        </div>
      </div>
    </div>
  );
}
