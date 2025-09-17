import { usePoker } from "@/contexts/PokerContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { Vault, PiggyBank } from "lucide-react";
import { memo, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CaixinhaTransaction {
  id: string;
  amount: number;
  description: string;
  withdrawal_date: string;
  created_by: string;
  type: 'deposit' | 'withdrawal';
}

const CaixinhaCard = memo(function CaixinhaCard() {
  const { activeSeason, games } = usePoker();
  const { currentOrganization } = useOrganization();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<CaixinhaTransaction[]>([]);

  // Load transactions from Supabase
  useEffect(() => {
    const loadTransactions = async () => {
      if (!activeSeason || !currentOrganization) return;

      try {
        const { data, error } = await supabase
          .from('caixinha_transactions')
          .select('*')
          .eq('season_id', activeSeason.id)
          .eq('organization_id', currentOrganization.id)
          .order('withdrawal_date', { ascending: false });

        if (error) {
          console.error('Error loading caixinha transactions:', error);
          return;
        }

        setTransactions((data || []).map(item => ({
          id: item.id,
          amount: item.amount,
          description: item.description,
          withdrawal_date: item.withdrawal_date,
          created_by: item.created_by,
          type: item.type as 'deposit' | 'withdrawal'
        })));
      } catch (error) {
        console.error('Error loading caixinha transactions:', error);
      }
    };

    loadTransactions();
  }, [activeSeason, currentOrganization]);
  
  // Calculate total accumulated from games (same logic as CaixinhaManagement)
  const totalAccumulated = useMemo(() => {
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

  // Calculate deposits and withdrawals
  const totalDeposits = useMemo(() => {
    return transactions
      .filter(transaction => transaction.type === 'deposit')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  const totalWithdrawals = useMemo(() => {
    return transactions
      .filter(transaction => transaction.type === 'withdrawal')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  // Calculate total available balance (games + deposits - withdrawals)
  const caixinhaTotal = useMemo(() => {
    return totalAccumulated + totalDeposits - totalWithdrawals;
  }, [totalAccumulated, totalDeposits, totalWithdrawals]);

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
        <h3 className="card-dashboard-header">Saldo da Caixinha</h3>
        <PiggyBank className="w-5 h-5 text-emerald-400" />
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