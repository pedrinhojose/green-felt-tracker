
import { usePoker } from "@/contexts/PokerContext";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { DollarSign } from "lucide-react";
import { memo } from "react";
import { AddJackpotDialog } from "./jackpot/AddJackpotDialog";

// Using memo to prevent unnecessary re-renders
const JackpotCard = memo(function JackpotCard() {
  const { activeSeason } = usePoker();
  
  // Get jackpot amount from active season
  const jackpotAmount = activeSeason?.jackpot || 0;

  return (
    <div className="card-dashboard animate-card-float relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="card-dashboard-header">Jackpot Atual</h3>
        {activeSeason && (
          <div className="flex">
            <AddJackpotDialog />
          </div>
        )}
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
                  formatCurrency(jackpotAmount)
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
});

export default JackpotCard;
