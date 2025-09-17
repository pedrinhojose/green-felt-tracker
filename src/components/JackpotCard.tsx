
import { usePoker } from "@/contexts/PokerContext";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { DollarSign } from "lucide-react";
import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Usando memo com uma função de comparação personalizada
const JackpotCard = memo(function JackpotCard() {
  const { activeSeason } = usePoker();
  const navigate = useNavigate();
  
  // Usa useMemo para evitar recálculos do valor formatado a cada renderização
  const jackpotAmount = activeSeason?.jackpot || 0;
  const formattedJackpot = useMemo(() => {
    return formatCurrency(jackpotAmount);
  }, [jackpotAmount]);

  const handleClick = () => {
    navigate('/seasons');
  };

  return (
    <div 
      className="card-dashboard relative cursor-pointer hover:scale-[1.02] transition-all duration-200 ease-out"
      onClick={handleClick}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="card-dashboard-header">Jackpot Atual</h3>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-[240px] h-[140px]">
          {/* Poker table surface */}
          <div className="absolute inset-0 bg-poker-green rounded-full border-[6px] border-poker-dark-green shadow-lg"></div>
          
          {/* Money bills stack */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {/* Stacked bills with slight offset */}
            <div className="relative">
              {/* Multiple bills stacked */}
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  style={{ top: `-${i * 2}px`, transform: `rotate(${i * 3 - 6}deg)` }}
                  className="absolute w-[90px] h-[40px] bg-gradient-to-r from-poker-gold to-amber-300 rounded-md border border-amber-600 shadow-md flex items-center justify-center"
                >
                  {i === 0 && (
                    <DollarSign className="text-green-800 w-5 h-5 opacity-70" />
                  )}
                </div>
              ))}
              
              {/* Top bill with visible dollar sign */}
              <div className="relative w-[90px] h-[40px] bg-gradient-to-r from-poker-gold to-amber-300 rounded-md border border-amber-600 shadow-md flex items-center justify-center">
                <DollarSign className="text-green-800 w-5 h-5" />
              </div>
            </div>
            
            {/* Jackpot value */}
            <div className="mt-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-poker-gold to-amber-300 bg-clip-text text-transparent drop-shadow-md">
                {activeSeason ? (
                  formattedJackpot
                ) : (
                  "Sem temporada ativa"
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Como isso é um componente sem props, sempre retornamos true quando não há mudanças no contexto
  return true;
});

export default JackpotCard;
