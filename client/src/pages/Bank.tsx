/**
 * Bank Page
 * Red Gulch Bank vault management
 */

import React, { useEffect, useState } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { Card, Button, Modal, EmptyState } from '@/components/ui';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/store/useToastStore';
import { formatDollars } from '@/utils/format';
import { logger } from '@/services/logger.service';
import bankService, {
  type Vault,
  type VaultTier,
  type VaultTransaction,
} from '@/services/bank.service';

type TabType = 'vault' | 'transactions' | 'upgrade';

export const Bank: React.FC = () => {
  const { currentCharacter, updateCharacter } = useCharacterStore();
  const { success, error: showError } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('vault');
  const [vault, setVault] = useState<Vault | null>(null);
  const [tiers, setTiers] = useState<VaultTier[]>([]);
  const [nextTier, setNextTier] = useState<VaultTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [vaultInfo, allTiers] = await Promise.all([
        bankService.getVaultInfo(),
        bankService.getVaultTiers(),
      ]);

      setVault(vaultInfo.vault);
      setTiers(allTiers);
      // Find full tier info from tiers array using the nextTier string
      const nextTierStr = vaultInfo.vault.nextTier;
      const nextTierInfo = nextTierStr
        ? allTiers.find((t) => t.tier === nextTierStr) || null
        : null;
      setNextTier(nextTierInfo);
    } catch (err: unknown) {
      logger.error('Failed to load bank data', err as Error, { context: 'Bank.loadData' });
      setError('Failed to load bank data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!currentCharacter || !vault || depositAmount <= 0) return;

    if (depositAmount > currentCharacter.gold) {
      showError('Insufficient Gold', 'You do not have enough gold to deposit.');
      return;
    }

    // Check capacity (skip for unlimited vaults)
    if (vault.capacity !== -1) {
      const availableSpace = vault.capacity - vault.balance;
      if (depositAmount > availableSpace) {
        showError('Vault Full', `Your vault can only hold ${formatDollars(availableSpace)} more gold.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const result = await bankService.deposit(depositAmount);
      setVault((prev) =>
        prev ? { ...prev, balance: result.vaultBalance } : prev
      );
      updateCharacter({ gold: result.walletBalance });
      success('Deposit Successful', `Deposited ${formatDollars(depositAmount)} into your vault.`);
      setDepositAmount(0);
      loadData(); // Refresh to get updated transaction history
    } catch (err: unknown) {
      logger.error('Deposit failed', err as Error, { context: 'Bank.handleDeposit' });
      showError('Deposit Failed', 'Unable to complete deposit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!currentCharacter || !vault || withdrawAmount <= 0) return;

    if (withdrawAmount > vault.balance) {
      showError('Insufficient Funds', 'You do not have enough gold in your vault.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await bankService.withdraw(withdrawAmount);
      setVault((prev) =>
        prev ? { ...prev, balance: result.vaultBalance } : prev
      );
      updateCharacter({ gold: result.walletBalance });
      success('Withdrawal Successful', `Withdrew ${formatDollars(withdrawAmount)} from your vault.`);
      setWithdrawAmount(0);
      loadData(); // Refresh to get updated transaction history
    } catch (err: unknown) {
      logger.error('Withdrawal failed', err as Error, { context: 'Bank.handleWithdraw' });
      showError('Withdrawal Failed', 'Unable to complete withdrawal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpgrade = async () => {
    if (!currentCharacter || !nextTier) return;

    if (currentCharacter.gold < nextTier.upgradeCost) {
      showError('Insufficient Gold', `You need ${formatDollars(nextTier.upgradeCost)} to upgrade.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await bankService.upgradeVault();
      success('Vault Upgraded!', result.message);
      setShowUpgradeModal(false);
      loadData(); // Refresh vault info and character gold
    } catch (err: unknown) {
      logger.error('Upgrade failed', err as Error, { context: 'Bank.handleUpgrade' });
      showError('Upgrade Failed', 'Unable to upgrade vault. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDepositAll = () => {
    if (!currentCharacter || !vault) return;
    // For unlimited vaults, allow depositing all gold
    const availableSpace = vault.capacity === -1
      ? currentCharacter.gold
      : vault.capacity - vault.balance;
    setDepositAmount(Math.min(currentCharacter.gold, availableSpace));
  };

  const handleWithdrawAll = () => {
    if (!vault) return;
    setWithdrawAmount(vault.balance);
  };

  if (!currentCharacter) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card variant="leather">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-western text-gold-light mb-4">No Character Selected</h2>
            <p className="text-desert-sand">Please select a character to access the Bank.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="leather">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-western text-gold-light">Red Gulch Bank</h1>
              <p className="text-desert-sand font-serif mt-1">
                Secure your gold in the frontier's most trusted vault
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-desert-stone">Your Dollars</p>
              <p className="text-2xl font-western text-gold-light">
                {formatDollars(currentCharacter.gold)}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <TabNavigation
            tabs={[
              { id: 'vault', label: 'Vault', icon: '🏦' },
              { id: 'transactions', label: 'History', icon: '📜' },
              { id: 'upgrade', label: 'Upgrade', icon: '⬆️' }
            ]}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as TabType)}
          />
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-blood-red/20 border-2 border-blood-red rounded-lg p-4">
          <p className="text-blood-red">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="mt-2">
            Dismiss
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card variant="parchment">
          <div className="p-6">
            <CardGridSkeleton count={3} columns={3} />
          </div>
        </Card>
      )}

      {/* Vault Tab */}
      {!isLoading && activeTab === 'vault' && vault && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Vault Status */}
          <Card variant="parchment">
            <div className="p-6">
              <h2 className="text-xl font-western text-wood-dark mb-4">Your Vault</h2>

              <div className="bg-wood-grain/10 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-wood-grain">Tier</span>
                  <span className="font-bold text-gold-dark">{vault.tierName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-wood-grain">Balance</span>
                  <span className="font-bold text-gold-dark">{formatDollars(vault.balance)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-wood-grain">Capacity</span>
                  <span className="text-wood-dark">
                    {vault.capacity === -1 ? 'Unlimited' : formatDollars(vault.capacity)}
                  </span>
                </div>
                {vault.interestAccrued !== undefined && vault.interestAccrued > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-wood-grain">Interest Accrued</span>
                    <span className="text-green-600">{formatDollars(vault.interestAccrued)}</span>
                  </div>
                )}
              </div>

              {/* Capacity Bar - only show for non-unlimited vaults with valid capacity */}
              {vault.capacity !== -1 && vault.capacity > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-wood-grain mb-1">
                    <span>Vault Usage</span>
                    <span>
                      {Math.round(((vault.balance || 0) / vault.capacity) * 100)}%
                    </span>
                  </div>
                  <div className="h-3 bg-wood-grain/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-light rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, ((vault.balance || 0) / vault.capacity) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Tier Description */}
              <div className="text-sm text-wood-grain">
                <p className="font-bold mb-1">About Your Vault:</p>
                <p>Your {vault.tierName} provides secure storage for your gold.</p>
              </div>
            </div>
          </Card>

          {/* Deposit/Withdraw */}
          <Card variant="parchment">
            <div className="p-6">
              <h2 className="text-xl font-western text-wood-dark mb-4">Transactions</h2>

              {/* Deposit Section */}
              <div className="mb-6">
                <label className="block text-sm text-wood-grain mb-2">Deposit Gold</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 px-3 py-2 bg-wood-grain/10 border border-wood-grain/30 rounded"
                    placeholder="Amount"
                    min={0}
                    max={vault.capacity === -1
                      ? currentCharacter.gold
                      : Math.min(currentCharacter.gold, vault.capacity - vault.balance)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDepositAll}
                  >
                    Max
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  fullWidth
                  className="mt-2"
                  onClick={handleDeposit}
                  disabled={depositAmount <= 0 || isSubmitting}
                  isLoading={isSubmitting}
                >
                  Deposit {depositAmount > 0 && formatDollars(depositAmount)}
                </Button>
              </div>

              {/* Withdraw Section */}
              <div>
                <label className="block text-sm text-wood-grain mb-2">Withdraw Gold</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 px-3 py-2 bg-wood-grain/10 border border-wood-grain/30 rounded"
                    placeholder="Amount"
                    min={0}
                    max={vault.balance}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleWithdrawAll}
                  >
                    Max
                  </Button>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  className="mt-2"
                  onClick={handleWithdraw}
                  disabled={withdrawAmount <= 0 || isSubmitting}
                  isLoading={isSubmitting}
                >
                  Withdraw {withdrawAmount > 0 && formatDollars(withdrawAmount)}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Transactions Tab */}
      {!isLoading && activeTab === 'transactions' && vault && (
        <Card variant="parchment">
          <div className="p-6">
            <h2 className="text-xl font-western text-wood-dark mb-4">Transaction History</h2>

            {(!vault.depositHistory?.length && !vault.withdrawHistory?.length) ? (
              <EmptyState
                icon="📜"
                title="No Transactions"
                description="Your transaction history will appear here."
                variant="default"
                size="md"
              />
            ) : (
              <div className="space-y-2">
                {[...(vault.depositHistory || []), ...(vault.withdrawHistory || [])]
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 20)
                  .map((tx: VaultTransaction) => (
                    <div
                      key={tx._id}
                      className="flex justify-between items-center p-3 bg-wood-grain/10 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {tx.type === 'deposit' ? '📥' : tx.type === 'withdrawal' ? '📤' : '💰'}
                        </span>
                        <div>
                          <p className="font-bold text-wood-dark capitalize">{tx.type}</p>
                          <p className="text-xs text-wood-grain">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            tx.type === 'deposit' || tx.type === 'interest'
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {tx.type === 'withdrawal' ? '-' : '+'}
                          {formatDollars(tx.amount)}
                        </p>
                        <p className="text-xs text-wood-grain">
                          Balance: {formatDollars(tx.balanceAfter)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Upgrade Tab */}
      {!isLoading && activeTab === 'upgrade' && (
        <Card variant="parchment">
          <div className="p-6">
            <h2 className="text-xl font-western text-wood-dark mb-4">Vault Tiers</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiers.map((tier) => {
                const isCurrentTier = vault?.tier === tier.tier;
                const canUpgradeTo = nextTier?.tier === tier.tier;
                const tierOrder = ['none', 'bronze', 'silver', 'gold'];
                const isPastTier = vault && tierOrder.indexOf(tier.tier) < tierOrder.indexOf(vault.tier);
                const canAfford = currentCharacter.gold >= tier.upgradeCost;

                return (
                  <div
                    key={tier.tier}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${isCurrentTier
                        ? 'border-gold-light bg-gold-light/10'
                        : canUpgradeTo
                        ? 'border-green-500/50 bg-green-500/5'
                        : isPastTier
                        ? 'border-wood-grain/20 bg-wood-grain/5 opacity-60'
                        : 'border-wood-grain/30'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-western text-lg text-wood-dark">{tier.name}</h3>
                      {isCurrentTier && (
                        <span className="text-xs bg-gold-light text-wood-dark px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-wood-grain mb-3">{tier.description}</p>

                    <div className="space-y-1 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-wood-grain">Capacity</span>
                        <span className="text-wood-dark">
                          {tier.capacity === 'Unlimited' ? 'Unlimited' : formatDollars(Number(tier.capacity))}
                        </span>
                      </div>
                      {!isCurrentTier && !isPastTier && (
                        <div className="flex justify-between">
                          <span className="text-wood-grain">Cost</span>
                          <span className={canAfford ? 'text-gold-dark' : 'text-red-500'}>
                            {formatDollars(tier.upgradeCost)}
                          </span>
                        </div>
                      )}
                    </div>

                    {tier.features && tier.features.length > 0 && (
                      <ul className="text-xs text-wood-grain mb-3 space-y-1">
                        {tier.features.map((feature, i) => (
                          <li key={i}>• {feature}</li>
                        ))}
                      </ul>
                    )}

                    {canUpgradeTo && (
                      <Button
                        variant="secondary"
                        fullWidth
                        size="sm"
                        onClick={() => setShowUpgradeModal(true)}
                        disabled={!canAfford}
                      >
                        {canAfford ? 'Upgrade' : 'Not Enough Gold'}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Upgrade Confirmation Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade Vault"
        size="sm"
      >
        {nextTier && (
          <div className="space-y-4">
            <p className="text-wood-grain">
              Upgrade your vault to <span className="font-bold text-gold-dark">{nextTier.name}</span>?
            </p>

            <div className="bg-wood-grain/10 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Upgrade Cost</span>
                <span className="font-bold text-gold-dark">{formatDollars(nextTier.upgradeCost)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>New Capacity</span>
                <span>
                  {nextTier.capacity === 'Unlimited' ? 'Unlimited' : formatDollars(Number(nextTier.capacity))}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setShowUpgradeModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={handleUpgrade}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Confirm Upgrade
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Bank;
