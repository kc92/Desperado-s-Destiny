/**
 * TransactionHistory Component
 * Purchase and sale history for marketplace
 */

import React, { useState, useMemo } from 'react';
import { Card, EmptyState } from '@/components/ui';
import { Transaction, ItemRarity } from '@/hooks/useMarketplace';
import { formatGold, formatTimeAgo } from '@/utils/format';

interface TransactionHistoryProps {
  transactions: Transaction[];
  currentCharacterId?: string;
  isLoading?: boolean;
}

// Rarity color mappings
const rarityColors: Record<ItemRarity, string> = {
  common: 'text-gray-300',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-orange-400',
};

// Transaction type filter options
type TransactionFilter = 'all' | 'purchase' | 'sale';

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  currentCharacterId,
  isLoading = false,
}) => {
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply type filter
    if (filter !== 'all') {
      result = result.filter((t) => t.type === filter);
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [transactions, filter, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const purchases = transactions.filter((t) => t.type === 'purchase');
    const sales = transactions.filter((t) => t.type === 'sale');

    const totalSpent = purchases.reduce((sum, t) => sum + t.price, 0);
    const totalEarned = sales.reduce((sum, t) => sum + (t.price - t.fee), 0);
    const totalFees = sales.reduce((sum, t) => sum + t.fee, 0);

    return {
      totalTransactions: transactions.length,
      purchaseCount: purchases.length,
      saleCount: sales.length,
      totalSpent,
      totalEarned,
      totalFees,
      netProfit: totalEarned - totalSpent,
    };
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="📜"
        title="No Transaction History"
        description="Your marketplace transactions will appear here once you buy or sell items."
        variant="default"
        size="lg"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="wood" padding="sm" className="text-center">
          <p className="text-xs text-desert-stone mb-1">Total Spent</p>
          <p className="text-lg font-bold text-blood-red">-{formatGold(stats.totalSpent)}</p>
        </Card>
        <Card variant="wood" padding="sm" className="text-center">
          <p className="text-xs text-desert-stone mb-1">Total Earned</p>
          <p className="text-lg font-bold text-emerald-400">+{formatGold(stats.totalEarned)}</p>
        </Card>
        <Card variant="wood" padding="sm" className="text-center">
          <p className="text-xs text-desert-stone mb-1">Fees Paid</p>
          <p className="text-lg font-bold text-desert-stone">-{formatGold(stats.totalFees)}</p>
        </Card>
        <Card variant="wood" padding="sm" className="text-center">
          <p className="text-xs text-desert-stone mb-1">Net Profit</p>
          <p
            className={`text-lg font-bold ${
              stats.netProfit >= 0 ? 'text-emerald-400' : 'text-blood-red'
            }`}
          >
            {stats.netProfit >= 0 ? '+' : ''}
            {formatGold(stats.netProfit)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Type Filter */}
        <div className="flex gap-2">
          {(['all', 'purchase', 'sale'] as TransactionFilter[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`
                py-2 px-4 rounded-lg border text-sm font-semibold transition-all capitalize
                ${filter === type
                  ? 'border-gold-light bg-gold-dark/20 text-gold-light'
                  : 'border-wood-grain/30 hover:border-gold-light/50 text-desert-sand'
                }
              `}
            >
              {type === 'all' ? 'All' : type === 'purchase' ? 'Purchases' : 'Sales'}
              <span className="ml-2 text-xs text-desert-stone">
                ({type === 'all'
                  ? stats.totalTransactions
                  : type === 'purchase'
                    ? stats.purchaseCount
                    : stats.saleCount})
              </span>
            </button>
          ))}
        </div>

        {/* Sort Order */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-desert-stone">Sort:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="input-western py-1 px-2 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <p className="text-center text-desert-stone py-8">
            No {filter === 'all' ? 'transactions' : filter === 'purchase' ? 'purchases' : 'sales'} found.
          </p>
        ) : (
          filteredTransactions.map((transaction) => {
            const isPurchase = transaction.type === 'purchase';
            const isBuyer = transaction.buyerId === currentCharacterId;

            return (
              <Card
                key={transaction._id}
                variant="wood"
                padding="none"
                className={`
                  overflow-hidden border-l-4
                  ${isPurchase ? 'border-l-blood-red' : 'border-l-emerald-500'}
                `}
              >
                <div className="flex items-center p-4 gap-4">
                  {/* Transaction Type Icon */}
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isPurchase ? 'bg-blood-red/20' : 'bg-emerald-600/20'}
                    `}
                  >
                    <span className="text-xl">
                      {isPurchase ? '📥' : '📤'}
                    </span>
                  </div>

                  {/* Item Icon */}
                  <div className="w-12 h-12 bg-wood-darker rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{transaction.item.icon}</span>
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold truncate ${rarityColors[transaction.item.rarity]}`}>
                        {transaction.item.name}
                      </h4>
                      <span
                        className={`
                          px-2 py-0.5 text-xs font-semibold rounded uppercase
                          ${isPurchase ? 'bg-blood-red/20 text-blood-red' : 'bg-emerald-600/20 text-emerald-400'}
                        `}
                      >
                        {isPurchase ? 'Bought' : 'Sold'}
                      </span>
                    </div>
                    <p className="text-sm text-desert-stone">
                      {isPurchase ? (
                        <>From: <span className="text-desert-sand">{transaction.sellerName}</span></>
                      ) : (
                        <>To: <span className="text-desert-sand">{transaction.buyerName}</span></>
                      )}
                    </p>
                    <p className="text-xs text-desert-stone">
                      {formatTimeAgo(new Date(transaction.timestamp))}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        isPurchase ? 'text-blood-red' : 'text-emerald-400'
                      }`}
                    >
                      {isPurchase ? '-' : '+'}
                      {formatGold(isPurchase ? transaction.price : transaction.price - transaction.fee)}
                    </p>
                    {!isPurchase && transaction.fee > 0 && (
                      <p className="text-xs text-desert-stone">
                        Fee: -{formatGold(transaction.fee)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Load More (placeholder for pagination) */}
      {filteredTransactions.length >= 20 && (
        <div className="text-center">
          <p className="text-sm text-desert-stone">
            Showing {filteredTransactions.length} transactions
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
