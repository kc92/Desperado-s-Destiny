/**
 * Gold Service
 * API client for gold economy system operations
 */

import api from './api';

// ===== Types =====

export interface GoldBalance {
  gold: number;
  inVault?: number;
  total?: number;
}

export interface GoldTransaction {
  _id: string;
  characterId: string;
  type: 'earned' | 'spent' | 'transfer' | 'deposit' | 'withdrawal' | 'system';
  amount: number;
  balanceAfter: number;
  source: string;
  description?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  createdAt: string;
}

export interface GoldStatistics {
  totalEarned: number;
  totalSpent: number;
  netGold: number;
  currentBalance: number;
  vaultBalance?: number;
  largestTransaction: number;
  transactionCount: number;
  averageTransaction: number;
  topSources: Array<{
    source: string;
    amount: number;
    count: number;
  }>;
  topSpends: Array<{
    source: string;
    amount: number;
    count: number;
  }>;
}

// ===== Request/Response Types =====

export interface GetBalanceResponse {
  balance: GoldBalance;
}

export interface GetHistoryResponse {
  transactions: GoldTransaction[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface GetStatisticsResponse {
  statistics: GoldStatistics;
}

// ===== Gold Service =====

export const goldService = {
  /**
   * Get current gold balance
   * GET /api/gold/balance
   */
  async getBalance(): Promise<GoldBalance> {
    const response = await api.get<{ data: GetBalanceResponse }>('/gold/balance');
    return response.data.data.balance;
  },

  /**
   * Get transaction history (paginated)
   * GET /api/gold/history
   * @param limit - Number of transactions to retrieve (default 50)
   * @param offset - Offset for pagination (default 0)
   */
  async getHistory(limit: number = 50, offset: number = 0): Promise<GetHistoryResponse> {
    const response = await api.get<{ data: GetHistoryResponse }>('/gold/history', {
      params: { limit, offset },
    });
    return response.data.data;
  },

  /**
   * Get gold statistics
   * GET /api/gold/statistics
   */
  async getStatistics(): Promise<GoldStatistics> {
    const response = await api.get<{ data: GetStatisticsResponse }>('/gold/statistics');
    return response.data.data.statistics;
  },

  // ===== Convenience Methods =====

  /**
   * Get recent transaction history
   */
  async getRecentHistory(limit: number = 10): Promise<GoldTransaction[]> {
    const response = await this.getHistory(limit, 0);
    return response.transactions;
  },

  /**
   * Check if character has enough gold
   */
  hasEnoughGold(balance: GoldBalance, amount: number): boolean {
    return balance.gold >= amount;
  },

  /**
   * Calculate total wealth (inventory + vault)
   */
  calculateTotalWealth(balance: GoldBalance): number {
    return balance.gold + (balance.inVault || 0);
  },

  /**
   * Format dollar amount with commas
   */
  formatDollars(amount: number): string {
    return amount.toLocaleString('en-US');
  },

  /**
   * Get transaction type display name
   */
  getTransactionTypeDisplay(type: GoldTransaction['type']): string {
    const typeMap: Record<GoldTransaction['type'], string> = {
      earned: 'Earned',
      spent: 'Spent',
      transfer: 'Transfer',
      deposit: 'Deposit',
      withdrawal: 'Withdrawal',
      system: 'System',
    };
    return typeMap[type] || type;
  },

  /**
   * Group transactions by date
   */
  groupTransactionsByDate(transactions: GoldTransaction[]): Map<string, GoldTransaction[]> {
    const grouped = new Map<string, GoldTransaction[]>();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.timestamp).toLocaleDateString();
      const existing = grouped.get(date) || [];
      existing.push(transaction);
      grouped.set(date, existing);
    });

    return grouped;
  },
};

export default goldService;
