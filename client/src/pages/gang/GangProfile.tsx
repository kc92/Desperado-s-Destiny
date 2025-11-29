/**
 * Gang Profile Page
 * Complete gang management interface with 5 tabs
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGangStore } from '@/store/useGangStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { Button, Card, Input } from '@/components/ui';
import { Gang, GangRole, GangUpgradeType, GangMember } from '@desperados/shared';

type TabType = 'members' | 'bank' | 'perks' | 'upgrades' | 'territories';

export function GangProfile() {
  const { gangId } = useParams();
  const navigate = useNavigate();
  const { currentCharacter } = useCharacterStore();
  const {
    currentGang,
    selectedGang,
    fetchCurrentGang,
    fetchGang,
    leaveGang,
    kickMember,
    promoteMember,
    depositToBank,
    withdrawFromBank,
    purchaseUpgrade,
    disbandGang,
    fetchBankTransactions,
    bankTransactions,
    isLoading,
    isDepositing,
    isWithdrawing,
    isUpgrading,
  } = useGangStore();

  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDisbandModal, setShowDisbandModal] = useState(false);

  const gang = gangId ? selectedGang : currentGang;
  const isOwnGang = !gangId || gangId === currentGang?._id;
  const currentMember = gang?.members.find((m) => m.characterId === currentCharacter?._id);
  const isLeader = currentMember?.role === 'leader';
  const isOfficer = currentMember?.role === 'officer' || isLeader;

  useEffect(() => {
    if (gangId) {
      fetchGang(gangId);
    } else {
      fetchCurrentGang();
    }
  }, [gangId, fetchGang, fetchCurrentGang]);

  useEffect(() => {
    if (gang && activeTab === 'bank') {
      fetchBankTransactions(gang._id);
    }
  }, [gang, activeTab, fetchBankTransactions]);

  if (!gang) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-amber-700 text-xl">Loading gang...</div>
      </div>
    );
  }

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount, 10);
    if (isNaN(amount) || amount <= 0 || amount > (currentCharacter?.gold || 0)) {
      return;
    }

    try {
      await depositToBank(gang._id, amount);
      setDepositAmount('');
    } catch (error) {
      console.error('Failed to deposit:', error);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount, 10);
    if (isNaN(amount) || amount <= 0 || amount > gang.bank) {
      return;
    }

    try {
      await withdrawFromBank(gang._id, amount);
      setWithdrawAmount('');
    } catch (error) {
      console.error('Failed to withdraw:', error);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveGang();
      navigate('/game/gang');
    } catch (error) {
      console.error('Failed to leave gang:', error);
    }
  };

  const handleDisband = async () => {
    try {
      await disbandGang(gang._id);
      navigate('/game/gang');
    } catch (error) {
      console.error('Failed to disband gang:', error);
    }
  };

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'members', label: 'Members' },
    { id: 'bank', label: 'Bank' },
    { id: 'perks', label: 'Perks' },
    { id: 'upgrades', label: 'Upgrades' },
    { id: 'territories', label: 'Territories' },
  ];

  return (
    <div className="min-h-screen bg-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-amber-100 border-4 border-amber-900 shadow-xl mb-6">
          <div className="bg-amber-900 text-amber-50 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-western flex items-center gap-3">
                  {gang.name}
                  <span className="text-xl bg-amber-700 px-3 py-1 rounded">[{gang.tag}]</span>
                </h1>
                <div className="flex gap-4 mt-3 text-amber-200">
                  <span>Level {gang.level}</span>
                  <span>|</span>
                  <span>
                    {gang.members.length}/{gang.maxMembers} Members
                  </span>
                  <span>|</span>
                  <span>{gang.territories.length} Territories</span>
                  <span>|</span>
                  <span>
                    {gang.stats.warsWon}W / {gang.stats.warsLost}L
                  </span>
                </div>
              </div>
              {isOwnGang && currentMember && (
                <div className="flex gap-2">
                  {!isLeader && (
                    <Button onClick={() => setShowLeaveModal(true)} variant="secondary">
                      Leave Gang
                    </Button>
                  )}
                  {isLeader && (
                    <Button onClick={() => setShowDisbandModal(true)} variant="danger">
                      Disband Gang
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-b border-amber-300">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-amber-200 text-amber-900 border-b-4 border-amber-700'
                      : 'text-amber-700 hover:bg-amber-150'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'members' && (
              <MembersTab
                gang={gang}
                currentMember={currentMember}
                isOfficer={isOfficer}
                isLeader={isLeader}
                onKick={(characterId) => kickMember(gang._id, characterId)}
                onPromote={(characterId, newRole) => promoteMember(gang._id, characterId, newRole)}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'bank' && (
              <BankTab
                gang={gang}
                transactions={bankTransactions}
                isOfficer={isOfficer}
                depositAmount={depositAmount}
                setDepositAmount={setDepositAmount}
                withdrawAmount={withdrawAmount}
                setWithdrawAmount={setWithdrawAmount}
                onDeposit={handleDeposit}
                onWithdraw={handleWithdraw}
                isDepositing={isDepositing}
                isWithdrawing={isWithdrawing}
                characterGold={currentCharacter?.gold || 0}
              />
            )}

            {activeTab === 'perks' && <PerksTab gang={gang} />}

            {activeTab === 'upgrades' && (
              <UpgradesTab
                gang={gang}
                isLeader={isLeader}
                onPurchase={(upgradeType) => purchaseUpgrade(gang._id, upgradeType)}
                isUpgrading={isUpgrading}
              />
            )}

            {activeTab === 'territories' && <TerritoriesTab gang={gang} />}
          </div>
        </Card>
      </div>

      {showLeaveModal && (
        <ConfirmModal
          title="Leave Gang"
          message={`Are you sure you want to leave ${gang.name}?`}
          onConfirm={handleLeave}
          onCancel={() => setShowLeaveModal(false)}
          confirmText="Leave"
          cancelText="Cancel"
        />
      )}

      {showDisbandModal && (
        <ConfirmModal
          title="Disband Gang"
          message={`Are you sure you want to disband ${gang.name}? This action cannot be undone. Bank funds will be distributed to all members.`}
          onConfirm={handleDisband}
          onCancel={() => setShowDisbandModal(false)}
          confirmText="Disband"
          cancelText="Cancel"
          isDestructive
        />
      )}
    </div>
  );
}

function MembersTab({
  gang,
  currentMember,
  isOfficer,
  isLeader,
  onKick,
  onPromote,
  isLoading: _isLoading,
}: {
  gang: Gang;
  currentMember?: GangMember;
  isOfficer: boolean;
  isLeader: boolean;
  onKick: (characterId: string) => void;
  onPromote: (characterId: string, newRole: GangRole) => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-amber-300">
              <th className="text-left py-3 px-4 text-amber-900">Name</th>
              <th className="text-left py-3 px-4 text-amber-900">Level</th>
              <th className="text-left py-3 px-4 text-amber-900">Role</th>
              <th className="text-left py-3 px-4 text-amber-900">Contribution</th>
              <th className="text-left py-3 px-4 text-amber-900">Status</th>
              {isOfficer && <th className="text-left py-3 px-4 text-amber-900">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {gang.members.map((member) => {
              const canKick =
                isOfficer && member.role === 'member' && member.characterId !== currentMember?.characterId;
              const canPromote = isLeader && member.role !== 'leader';

              return (
                <tr key={member.characterId} className="border-b border-amber-200 hover:bg-amber-150">
                  <td className="py-3 px-4">{member.characterName}</td>
                  <td className="py-3 px-4">{member.level}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-sm font-semibold ${
                        member.role === 'leader'
                          ? 'bg-yellow-500 text-white'
                          : member.role === 'officer'
                          ? 'bg-gray-400 text-white'
                          : 'bg-amber-300 text-amber-900'
                      }`}
                    >
                      {member.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">{member.contribution.toLocaleString()} gold</td>
                  <td className="py-3 px-4">
                    {member.isOnline ? (
                      <span className="text-green-600">● Online</span>
                    ) : (
                      <span className="text-gray-500">○ Offline</span>
                    )}
                  </td>
                  {isOfficer && (
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {canKick && (
                          <Button onClick={() => onKick(member.characterId)} variant="danger" size="sm">
                            Kick
                          </Button>
                        )}
                        {canPromote && (
                          <select
                            onChange={(e) => onPromote(member.characterId, e.target.value as GangRole)}
                            className="px-2 py-1 border border-amber-900 rounded text-sm"
                            defaultValue={member.role}
                          >
                            <option value={member.role}>Promote</option>
                            {member.role === 'member' && <option value="officer">To Officer</option>}
                            {member.role === 'officer' && <option value="member">To Member</option>}
                          </select>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BankTab({
  gang,
  transactions,
  isOfficer,
  depositAmount,
  setDepositAmount,
  withdrawAmount,
  setWithdrawAmount,
  onDeposit,
  onWithdraw,
  isDepositing,
  isWithdrawing,
  characterGold,
}: {
  gang: Gang;
  transactions: any[];
  isOfficer: boolean;
  depositAmount: string;
  setDepositAmount: (value: string) => void;
  withdrawAmount: string;
  setWithdrawAmount: (value: string) => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  isDepositing: boolean;
  isWithdrawing: boolean;
  characterGold: number;
}) {
  const bankUsagePercent = (gang.bank / gang.upgrades.vaultSize) * 100;

  return (
    <div className="space-y-6">
      <Card className="bg-amber-200 p-6">
        <h3 className="text-2xl font-western text-amber-900 mb-4">Bank Balance</h3>
        <div className="text-4xl font-bold text-amber-900 mb-2">{gang.bank.toLocaleString()} gold</div>
        <div className="text-sm text-amber-700 mb-2">
          Capacity: {gang.bank.toLocaleString()} / {gang.upgrades.vaultSize.toLocaleString()}
        </div>
        <div className="w-full bg-amber-300 rounded-full h-4 overflow-hidden">
          <div
            className="bg-amber-700 h-full transition-all"
            style={{ width: `${Math.min(bankUsagePercent, 100)}%` }}
          />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white p-6">
          <h4 className="text-xl font-semibold text-amber-900 mb-4">Deposit</h4>
          <div className="space-y-3">
            <Input
              type="number"
              placeholder="Amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              max={characterGold}
              min={1}
            />
            <p className="text-sm text-amber-700">Your balance: {characterGold.toLocaleString()} gold</p>
            <Button
              onClick={onDeposit}
              disabled={
                isDepositing ||
                !depositAmount ||
                parseInt(depositAmount, 10) <= 0 ||
                parseInt(depositAmount, 10) > characterGold
              }
              className="w-full"
            >
              {isDepositing ? 'Depositing...' : 'Deposit'}
            </Button>
          </div>
        </Card>

        {isOfficer && (
          <Card className="bg-white p-6">
            <h4 className="text-xl font-semibold text-amber-900 mb-4">Withdraw (Officers Only)</h4>
            <div className="space-y-3">
              <Input
                type="number"
                placeholder="Amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                max={gang.bank}
                min={1}
              />
              <p className="text-sm text-amber-700">Bank balance: {gang.bank.toLocaleString()} gold</p>
              <Button
                onClick={onWithdraw}
                disabled={
                  isWithdrawing ||
                  !withdrawAmount ||
                  parseInt(withdrawAmount, 10) <= 0 ||
                  parseInt(withdrawAmount, 10) > gang.bank
                }
                className="w-full"
              >
                {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
              </Button>
            </div>
          </Card>
        )}
      </div>

      <Card className="bg-white p-6">
        <h4 className="text-xl font-semibold text-amber-900 mb-4">Transaction History</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-amber-300">
                <th className="text-left py-2 px-3 text-amber-900">Type</th>
                <th className="text-left py-2 px-3 text-amber-900">Amount</th>
                <th className="text-left py-2 px-3 text-amber-900">Member</th>
                <th className="text-left py-2 px-3 text-amber-900">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-amber-700">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-amber-200">
                    <td className="py-2 px-3">{tx.type}</td>
                    <td
                      className={`py-2 px-3 font-semibold ${
                        tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' ? '+' : '-'}
                      {tx.amount.toLocaleString()}
                    </td>
                    <td className="py-2 px-3">{tx.characterName}</td>
                    <td className="py-2 px-3">{new Date(tx.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function PerksTab({ gang }: { gang: Gang }) {
  const xpBonus = gang.perks.xpBonus;
  const goldBonus = gang.perks.goldBonus;
  const energyBonus = gang.perks.energyBonus;

  return (
    <div className="space-y-6">
      <Card className="bg-amber-200 p-6">
        <h3 className="text-2xl font-western text-amber-900 mb-4">Active Perks</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold text-amber-900">{xpBonus}%</div>
            <div className="text-amber-700">XP Bonus</div>
            <div className="text-sm text-amber-600 mt-2">
              5% base + {gang.level}% from level + {gang.upgrades.perkBooster * 10}% from booster
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-900">{goldBonus}%</div>
            <div className="text-amber-700">Gold Bonus</div>
            <div className="text-sm text-amber-600 mt-2">
              {gang.level * 2}% from level + {gang.upgrades.perkBooster * 10}% from booster
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-900">+{energyBonus}</div>
            <div className="text-amber-700">Max Energy</div>
            <div className="text-sm text-amber-600 mt-2">
              {Math.floor(gang.level / 5)} from level progression
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function UpgradesTab({
  gang,
  isLeader,
  onPurchase,
  isUpgrading,
}: {
  gang: Gang;
  isLeader: boolean;
  onPurchase: (type: GangUpgradeType) => void;
  isUpgrading: boolean;
}) {
  const upgrades = [
    {
      type: 'vaultSize' as GangUpgradeType,
      name: 'Vault Size',
      current: gang.upgrades.vaultSize,
      max: 10,
      benefit: `${gang.upgrades.vaultSize.toLocaleString()} gold capacity`,
      nextBenefit: `+10,000 capacity`,
      cost: 5000 * (gang.upgrades.vaultSize + 1),
    },
    {
      type: 'memberSlots' as GangUpgradeType,
      name: 'Member Slots',
      current: gang.upgrades.memberSlots,
      max: 5,
      benefit: `${gang.maxMembers} member slots`,
      nextBenefit: `+5 slots`,
      cost: 10000 * (gang.upgrades.memberSlots + 1),
    },
    {
      type: 'warChest' as GangUpgradeType,
      name: 'War Chest',
      current: gang.upgrades.warChest,
      max: 10,
      benefit: `${gang.upgrades.warChest * 5000} war funding`,
      nextBenefit: `+5,000 funding`,
      cost: 8000 * (gang.upgrades.warChest + 1),
    },
    {
      type: 'perkBooster' as GangUpgradeType,
      name: 'Perk Booster',
      current: gang.upgrades.perkBooster,
      max: 5,
      benefit: `${gang.upgrades.perkBooster * 10}% bonus multiplier`,
      nextBenefit: `+10% to all perks`,
      cost: 15000 * (gang.upgrades.perkBooster + 1),
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {upgrades.map((upgrade) => {
        const isMaxed = upgrade.current >= upgrade.max;
        const canAfford = gang.bank >= upgrade.cost;

        return (
          <Card key={upgrade.type} className="bg-white p-6">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xl font-semibold text-amber-900">{upgrade.name}</h4>
              <div className="text-amber-700">
                Level {upgrade.current}/{upgrade.max}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-sm">
                <span className="text-amber-700">Current:</span> {upgrade.benefit}
              </div>
              {!isMaxed && (
                <div className="text-sm">
                  <span className="text-amber-700">Next Level:</span> {upgrade.nextBenefit}
                </div>
              )}
            </div>

            {!isMaxed && (
              <div className="space-y-3">
                <div className="text-lg font-semibold text-amber-900">Cost: {upgrade.cost.toLocaleString()} gold</div>
                <Button
                  onClick={() => onPurchase(upgrade.type)}
                  disabled={!isLeader || isUpgrading || !canAfford}
                  className="w-full"
                >
                  {!isLeader
                    ? 'Leader Only'
                    : !canAfford
                    ? 'Insufficient Funds'
                    : isUpgrading
                    ? 'Upgrading...'
                    : 'Upgrade'}
                </Button>
              </div>
            )}

            {isMaxed && (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded text-center font-semibold">
                MAX LEVEL
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function TerritoriesTab({ gang }: { gang: Gang }) {
  return (
    <div className="space-y-4">
      {gang.territories.length === 0 ? (
        <Card className="bg-amber-200 p-12 text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-xl font-western text-amber-900 mb-2">No Territories Controlled</h3>
          <p className="text-amber-700">Declare war to conquer territories and gain bonuses!</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {gang.territories.map((territoryId) => (
            <Card key={territoryId} className="bg-white p-4">
              <h4 className="font-semibold text-amber-900">Territory {territoryId}</h4>
              <p className="text-sm text-amber-700 mt-2">Controlled</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  isDestructive,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText: string;
  cancelText: string;
  isDestructive?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-amber-100 border-4 border-amber-900 p-8 max-w-md">
        <h2 className="text-2xl font-western text-amber-900 mb-4">{title}</h2>
        <p className="text-amber-800 mb-6">{message}</p>
        <div className="flex gap-4">
          <Button onClick={onCancel} variant="secondary" className="flex-1">
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant={isDestructive ? 'danger' : 'secondary'}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
}
