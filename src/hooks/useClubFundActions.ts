import { useState } from 'react';
import { ClubFundTransaction } from '@/lib/db/models';
import { pokerDB } from '@/lib/db/PokerDatabase';
import { usePoker } from '@/contexts/PokerContext';
import { useToast } from '@/hooks/use-toast';

export const useClubFundActions = () => {
  const { activeSeason, updateSeason } = usePoker();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const addFunds = async (amount: number, description: string): Promise<void> => {
    if (!activeSeason) {
      throw new Error('Nenhuma temporada ativa encontrada');
    }

    setLoading(true);
    try {
      // Create transaction record
      const transaction: Partial<ClubFundTransaction> = {
        seasonId: activeSeason.id,
        amount,
        type: 'add',
        description,
        date: new Date(),
        // userId will be set by repository
      };

      await pokerDB.saveClubFundTransaction(transaction);

      // Update season club fund
      const newClubFund = activeSeason.clubFund + amount;
      await updateSeason({
        ...activeSeason,
        clubFund: newClubFund,
      });

      toast({
        title: 'Fundos adicionados',
        description: `R$ ${amount.toFixed(2)} adicionados ao caixa do clube`,
      });
    } catch (error) {
      console.error('Error adding funds:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar fundos ao caixa',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFunds = async (amount: number, description: string): Promise<void> => {
    if (!activeSeason) {
      throw new Error('Nenhuma temporada ativa encontrada');
    }

    if (activeSeason.clubFund < amount) {
      throw new Error('Saldo insuficiente no caixa do clube');
    }

    setLoading(true);
    try {
      // Create transaction record
      const transaction: Partial<ClubFundTransaction> = {
        seasonId: activeSeason.id,
        amount,
        type: 'remove',
        description,
        date: new Date(),
        // userId will be set by repository
      };

      await pokerDB.saveClubFundTransaction(transaction);

      // Update season club fund
      const newClubFund = activeSeason.clubFund - amount;
      await updateSeason({
        ...activeSeason,
        clubFund: newClubFund,
      });

      toast({
        title: 'Fundos removidos',
        description: `R$ ${amount.toFixed(2)} removidos do caixa do clube`,
      });
    } catch (error) {
      console.error('Error removing funds:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover fundos do caixa',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordMembershipCharge = async (
    playerId: string,
    playerName: string,
    amount: number,
    frequency: 'semanal' | 'mensal' | 'trimestral'
  ): Promise<void> => {
    if (!activeSeason) {
      throw new Error('Nenhuma temporada ativa encontrada');
    }

    setLoading(true);
    try {
      // Create transaction record
      const transaction: Partial<ClubFundTransaction> = {
        seasonId: activeSeason.id,
        amount,
        type: 'membership',
        description: `Mensalidade ${frequency} - ${playerName}`,
        date: new Date(),
        // userId will be set by repository
      };

      await pokerDB.saveClubFundTransaction(transaction);

      // Update season club fund
      const newClubFund = activeSeason.clubFund + amount;
      await updateSeason({
        ...activeSeason,
        clubFund: newClubFund,
      });

      console.log(`Membership charge recorded: ${playerName} - R$ ${amount.toFixed(2)}`);
    } catch (error) {
      console.error('Error recording membership charge:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createInitialTransaction = async (): Promise<void> => {
    if (!activeSeason) {
      throw new Error('Nenhuma temporada ativa encontrada');
    }

    if (activeSeason.clubFund <= 0) {
      return; // No initial balance to record
    }

    setLoading(true);
    try {
      // Check if initial transaction already exists
      const existingTransactions = await pokerDB.getClubFundTransactions({ 
        seasonId: activeSeason.id 
      });
      
      const hasInitialTransaction = existingTransactions.some(
        t => t.description.includes('Saldo inicial')
      );

      if (hasInitialTransaction) {
        return; // Initial transaction already exists
      }

      // Create initial balance transaction
      const transaction: Partial<ClubFundTransaction> = {
        seasonId: activeSeason.id,
        amount: activeSeason.clubFund,
        type: 'add',
        description: 'Saldo inicial da temporada',
        date: activeSeason.startDate,
        // userId will be set by repository
      };

      await pokerDB.saveClubFundTransaction(transaction);

      toast({
        title: 'Saldo inicial registrado',
        description: `R$ ${activeSeason.clubFund.toFixed(2)} registrado como saldo inicial`,
      });
    } catch (error) {
      console.error('Error creating initial transaction:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao registrar saldo inicial',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    addFunds,
    removeFunds,
    recordMembershipCharge,
    createInitialTransaction,
    loading,
  };
};