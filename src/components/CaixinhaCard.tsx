import { usePoker } from "@/contexts/PokerContext";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { Vault, TrendingUp } from "lucide-react";
import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const CaixinhaCard = memo(function CaixinhaCard() {
  const { activeSeason, games } = usePoker();
  const navigate = useNavigate();
  
  // Calculate total caixinha accumulated from all games in the active season
  const caixinhaTotal = useMemo(() => {
    if (!activeSeason || !games) return 0;
    
    const seasonGames = games.filter(game => game.seasonId === activeSeason.id);
    let total = 0;
    
    seasonGames.forEach(game => {
      if (game.players && Array.isArray(game.players)) {
        game.players.forEach(player => {
          if (player.participatesInClubFund && player.clubFundContribution) {
            total += player.clubFundContribution;
          }
        });
      }
    });
    
    return total;
  }, [activeSeason, games]);

  const formattedTotal = useMemo(() => {
    return formatCurrency(caixinhaTotal);
  }, [caixinhaTotal]);

  const handleClick = () => {
    navigate('/caixinha');
  };

  return (
    <div 
      className="card-dashboard relative cursor-pointer hover:scale-[1.02] transition-all duration-200 ease-out"
      onClick={handleClick}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="card-dashboard-header">Caixinha Total</h3>
        <TrendingUp className="w-5 h-5 text-emerald-400" />
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-[240px] h-[140px]">
          {/* Vault/Safe surface */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-2xl border-[6px] border-emerald-700 shadow-2xl"></div>
          
          {/* Vault lock mechanism */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {/* Outer lock ring */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full border-4 border-emerald-500 shadow-lg flex items-center justify-center">
                <Vault className="text-emerald-200 w-8 h-8" />
              </div>
              
              {/* Lock indicators */}
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  style={{ 
                    top: '50%', 
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-32px)`,
                  }}
                  className="absolute w-1 h-3 bg-emerald-400 rounded-full"
                />
              ))}
            </div>
            
            {/* Caixinha value */}
            <div className="mt-8 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent drop-shadow-md">
                {activeSeason ? (
                  formattedTotal
                ) : (
                  "Sem temporada ativa"
                )}
              </div>
              {activeSeason && (
                <div className="text-xs text-emerald-300 mt-1">
                  Clique para gerenciar
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CaixinhaCard;