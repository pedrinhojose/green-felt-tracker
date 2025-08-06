import { useState, useEffect, useMemo } from 'react';
import { ClubFundTransaction } from '@/lib/db/models';
import { ClubFundTransactionFilters } from '@/lib/db/repositories/ClubFundRepository';
import { pokerDB } from '@/lib/db/PokerDatabase';
import { usePoker } from '@/contexts/PokerContext';

export interface UseClubFundTransactionsOptions {
  seasonId?: string;
  autoLoad?: boolean;
  pageSize?: number;
}

export const useClubFundTransactions = (options: UseClubFundTransactionsOptions = {}) => {
  const { seasonId, autoLoad = true, pageSize = 20 } = options;
  const { activeSeason } = usePoker();
  
  const [transactions, setTransactions] = useState<ClubFundTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<ClubFundTransactionFilters>({});

  const targetSeasonId = seasonId || activeSeason?.id;

  const loadTransactions = async (reset = false) => {
    if (!targetSeasonId) return;

    setLoading(true);
    setError(null);

    try {
      const currentPage = reset ? 1 : page;
      const transactionFilters = {
        ...filters,
        seasonId: targetSeasonId,
      };

      const newTransactions = await pokerDB.getClubFundTransactions(
        transactionFilters,
        currentPage,
        pageSize
      );

      if (reset) {
        setTransactions(newTransactions);
        setPage(1);
      } else {
        setTransactions(prev => [...prev, ...newTransactions]);
      }

      setHasMore(newTransactions.length === pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações');
      console.error('Error loading club fund transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshTransactions = () => {
    setPage(1);
    loadTransactions(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const updateFilters = (newFilters: Partial<ClubFundTransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  // Summary calculations
  const summary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'add' || t.type === 'membership')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'remove')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;
    const transactionCount = transactions.length;

    return {
      totalIncome: income,
      totalExpenses: expenses,
      currentBalance: balance,
      transactionCount,
    };
  }, [transactions]);

  // Load transactions when dependencies change
  useEffect(() => {
    if (autoLoad && targetSeasonId) {
      loadTransactions(true);
    }
  }, [targetSeasonId, filters, autoLoad]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      loadTransactions(false);
    }
  }, [page]);

  return {
    transactions,
    loading,
    error,
    hasMore,
    filters,
    summary,
    loadTransactions: refreshTransactions,
    loadMore,
    updateFilters,
    clearFilters,
    refresh: refreshTransactions,
  };
};