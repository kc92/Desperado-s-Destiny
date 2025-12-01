/**
 * Economy Monitor Component
 * Economy tracking and gold management
 */

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Card } from '@/components/ui';

export const EconomyMonitor: React.FC = () => {
  const { analytics, characters, fetchAnalytics, fetchCharacters, adjustGold, isLoading } = useAdminStore();
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [goldAmount, setGoldAmount] = useState(0);
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAnalytics().catch(console.error);
    fetchCharacters({ limit: 100 }).catch(console.error);
  }, []);

  const handleAdjustGold = async () => {
    if (!selectedCharacterId) {
      alert('Please select a character');
      return;
    }

    if (goldAmount === 0) {
      alert('Gold amount cannot be zero');
      return;
    }

    if (!reason.trim()) {
      alert('Please provide a reason');
      return;
    }

    try {
      await adjustGold(selectedCharacterId, goldAmount, reason);
      alert('Gold adjusted successfully');
      setSelectedCharacterId('');
      setGoldAmount(0);
      setReason('');
      fetchCharacters({ limit: 100 }).catch(console.error);
    } catch (error: any) {
      alert(`Failed to adjust gold: ${error.message}`);
    }
  };

  const filteredCharacters = characters.filter(char =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Economy Overview */}
      {analytics && (
        <Card className="p-6">
          <h2 className="text-2xl font-western text-frontier-gold mb-4">Economy Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Gold in Circulation"
              value={analytics.economy.totalGoldInCirculation.toLocaleString()}
              className="col-span-2"
            />
            <StatCard
              label="Average Gold per Character"
              value={analytics.economy.averageGoldPerCharacter.toLocaleString()}
            />
            <StatCard
              label="Total Transactions"
              value={analytics.economy.totalTransactions.toLocaleString()}
            />
            <StatCard
              label="Transaction Volume (24h)"
              value={analytics.economy.transactionVolume24h.toLocaleString()}
              color="blue"
            />
            <StatCard
              label="Total Characters"
              value={analytics.characters.total}
            />
          </div>
        </Card>
      )}

      {/* Gold Adjustment Tool */}
      <Card className="p-6">
        <h2 className="text-2xl font-western text-frontier-gold mb-4">Gold Adjustment</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-frontier-silver mb-2">
                Character Search
              </label>
              <input
                type="text"
                placeholder="Search character..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-frontier-dark border border-frontier-wood rounded-lg text-frontier-silver mb-2"
              />
              <select
                value={selectedCharacterId}
                onChange={(e) => setSelectedCharacterId(e.target.value)}
                className="w-full px-4 py-2 bg-frontier-dark border border-frontier-wood rounded-lg text-frontier-silver"
              >
                <option value="">Select Character</option>
                {filteredCharacters.map((char) => (
                  <option key={char._id} value={char._id}>
                    {char.name} - Level {char.level} - {char.gold.toLocaleString()} gold
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-frontier-silver mb-2">
                Amount (use negative for deduction)
              </label>
              <input
                type="number"
                value={goldAmount}
                onChange={(e) => setGoldAmount(parseInt(e.target.value) || 0)}
                placeholder="e.g., 1000 or -500"
                className="w-full px-4 py-2 bg-frontier-dark border border-frontier-wood rounded-lg text-frontier-silver"
              />
            </div>

            <div>
              <label className="block text-sm text-frontier-silver mb-2">
                Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Admin adjustment reason..."
                rows={3}
                className="w-full px-4 py-2 bg-frontier-dark border border-frontier-wood rounded-lg text-frontier-silver"
              />
            </div>

            <button
              onClick={handleAdjustGold}
              disabled={isLoading || !selectedCharacterId}
              className="w-full px-6 py-3 bg-frontier-gold text-frontier-dark rounded-lg hover:bg-frontier-gold-dark transition-colors font-western disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adjusting...' : 'Adjust Gold'}
            </button>
          </div>

          {/* Preview */}
          <div className="bg-frontier-wood p-6 rounded-lg">
            <h3 className="text-lg font-western text-frontier-silver mb-4">Preview</h3>
            {selectedCharacterId ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-frontier-silver-dark">Character</div>
                  <div className="text-frontier-silver">
                    {characters.find(c => c._id === selectedCharacterId)?.name || 'Unknown'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-frontier-silver-dark">Current Gold</div>
                  <div className="text-frontier-silver">
                    {(characters.find(c => c._id === selectedCharacterId)?.gold || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-frontier-silver-dark">Adjustment</div>
                  <div className={`font-semibold ${goldAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {goldAmount >= 0 ? '+' : ''}{goldAmount.toLocaleString()}
                  </div>
                </div>
                <div className="border-t border-frontier-silver-dark pt-3">
                  <div className="text-xs text-frontier-silver-dark">New Balance</div>
                  <div className="text-xl font-western text-frontier-gold">
                    {Math.max(0, (characters.find(c => c._id === selectedCharacterId)?.gold || 0) + goldAmount).toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-frontier-silver-dark text-center py-8">
                Select a character to preview
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Top Characters by Gold */}
      <Card className="p-6">
        <h2 className="text-2xl font-western text-frontier-gold mb-4">Top Characters by Gold</h2>

        <div className="space-y-2">
          {characters
            .sort((a, b) => b.gold - a.gold)
            .slice(0, 10)
            .map((char, index) => (
              <div
                key={char._id}
                className="flex items-center justify-between p-4 bg-frontier-wood rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-western font-semibold
                    ${index === 0 ? 'bg-yellow-500 text-frontier-dark' :
                      index === 1 ? 'bg-gray-400 text-frontier-dark' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-frontier-silver-dark text-frontier-dark'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-frontier-silver font-semibold">{char.name}</div>
                    <div className="text-sm text-frontier-silver-dark">
                      Level {char.level} • {char.faction}
                    </div>
                  </div>
                </div>
                <div className="text-frontier-gold font-western text-xl">
                  {char.gold.toLocaleString()}
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};

/**
 * Stat Card Component
 */
const StatCard: React.FC<{
  label: string;
  value: string | number;
  color?: 'default' | 'green' | 'red' | 'blue';
  className?: string;
}> = ({ label, value, color = 'default', className = '' }) => {
  const colors = {
    default: 'text-frontier-silver',
    green: 'text-green-400',
    red: 'text-red-400',
    blue: 'text-blue-400'
  };

  return (
    <div className={`bg-frontier-wood p-6 rounded-lg ${className}`}>
      <div className="text-sm text-frontier-silver mb-2">{label}</div>
      <div className={`text-3xl font-western ${colors[color]}`}>{value}</div>
    </div>
  );
};

export default EconomyMonitor;
