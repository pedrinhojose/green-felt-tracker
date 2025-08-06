import { DatabaseCore } from '../core/DatabaseCore';
import { ClubFundTransaction } from '../models';

export interface ClubFundTransactionFilters {
  seasonId?: string;
  organizationId?: string;
  type?: 'add' | 'remove' | 'membership';
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export class ClubFundRepository {
  constructor(private db: DatabaseCore) {}

  async getTransactions(
    filters: ClubFundTransactionFilters = {},
    page?: number,
    limit?: number
  ): Promise<ClubFundTransaction[]> {
    return this.db.getClubFundTransactions(filters, page, limit);
  }

  async getTransaction(id: string): Promise<ClubFundTransaction | undefined> {
    return this.db.getClubFundTransaction(id);
  }

  async saveTransaction(transaction: Partial<ClubFundTransaction>): Promise<string> {
    return this.db.saveClubFundTransaction(transaction);
  }

  async deleteTransaction(id: string): Promise<void> {
    return this.db.deleteClubFundTransaction(id);
  }

  async getTransactionsBySeasonId(seasonId: string): Promise<ClubFundTransaction[]> {
    return this.getTransactions({ seasonId });
  }

  async getTotalByType(
    seasonId: string,
    type: 'add' | 'remove' | 'membership'
  ): Promise<number> {
    const transactions = await this.getTransactions({ seasonId, type });
    return transactions.reduce((total, transaction) => total + transaction.amount, 0);
  }

  async getTransactionCount(seasonId: string): Promise<number> {
    const transactions = await this.getTransactions({ seasonId });
    return transactions.length;
  }

  async getSeasonBalance(seasonId: string): Promise<number> {
    const addTransactions = await this.getTotalByType(seasonId, 'add');
    const removeTransactions = await this.getTotalByType(seasonId, 'remove');
    const membershipTransactions = await this.getTotalByType(seasonId, 'membership');
    
    return addTransactions + membershipTransactions - removeTransactions;
  }
}