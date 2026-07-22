import { usePoker } from "@/contexts/PokerContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { DollarSign, Vault } from "lucide-react";
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

const FinancialSummaryCard = memo(function FinancialSummaryCard() {
  const { activeSeason, games } = usePoker();
  const { currentOrganization } = useOrganization();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<CaixinhaTransaction[]>([]);

  // Caixinha is organization-wide and continuous across seasons.
  useEffect(() => {
    const loadTransactions = async () => {
      if (!currentOrganization) return;

      try {
        const { data, error } = await supabase
          .from('caixinha_transactions')
          .select('*')
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
  }, [currentOrganization]);

  // Total from ALL games of the organization (any season, incl. standalone)
  const totalAccumulated = useMemo(() => {
    if (!games) return 0;
    let total = 0;
    games.forEach(game => {
      if (game.players && Array.isArray(game.players)) {
        game.players.forEach(player => {
          if (player.participatesInClubFund && player.clubFundContribution) {
            total += player.clubFundContribution;
          }
        });
      }
    });
    return total;
  }, [games]);


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

  const caixinhaTotal = useMemo(() => {
    return totalAccumulated + totalDeposits - totalWithdrawals;
  }, [totalAccumulated, totalDeposits, totalWithdrawals]);

  const formattedJackpot = useMemo(() => {
    return formatCurrency(activeSeason?.jackpot || 0);
  }, [activeSeason]);

  const formattedCaixinha = useMemo(() => {
    return formatCurrency(caixinhaTotal);
  }, [caixinhaTotal]);

  return (
    <div className="card-dashboard h-full min-h-[260px] hover:scale-[1.02] transition-all duration-200 ease-out">
      <div className="text-lg md:text-xl font-medium text-poker-gold mb-2 md:mb-3 pb-2 border-b border-white/10">
        Financeiro
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Jackpot (depends on active season) */}
        <div
          className="flex-1 flex items-center gap-4 px-2 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => navigate('/seasons')}
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-poker-green/40 border border-poker-green flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6 md:w-7 md:h-7 text-poker-gold" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm text-muted-foreground">Jackpot Atual</span>
            <span className="text-xl md:text-2xl font-bold text-poker-gold truncate">
              {activeSeason ? formattedJackpot : "Sem temporada ativa"}
            </span>
          </div>
        </div>

        {/* Caixinha (organization-wide, continuous across seasons) */}
        <div
          className="flex-1 flex items-center gap-4 px-2 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => navigate('/finance/caixinha')}
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-emerald-800/40 border border-emerald-600 flex items-center justify-center shrink-0">
            <Vault className="w-6 h-6 md:w-7 md:h-7 text-emerald-300" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm text-muted-foreground">Saldo da Caixinha</span>
            <span className="text-xl md:text-2xl font-bold text-emerald-400 truncate">
              {formattedCaixinha}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
});

export default FinancialSummaryCard;
