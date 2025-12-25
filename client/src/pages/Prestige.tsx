/**
 * Prestige Page
 * View prestige rank, bonuses, and perform prestige reset
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, LoadingSpinner, Modal } from '@/components/ui';
import { useCharacterStore } from '@/store/useCharacterStore';
import { logger } from '@/services/logger.service';
import prestigeService, {
  type PrestigeInfoResponse,
  type PrestigeBonus,
  type PrestigeRank,
} from '@/services/prestige.service';

// Rank badge colors and icons
const RANK_STYLES: Record<number, { icon: string; color: string; bg: string; glow: string }> = {
  0: { icon: '🤠', color: 'text-desert-sand', bg: 'bg-wood-dark/30', glow: '' },
  1: { icon: '🔫', color: 'text-amber-400', bg: 'bg-amber-900/30', glow: 'shadow-amber-500/20' },
  2: { icon: '🎯', color: 'text-orange-400', bg: 'bg-orange-900/30', glow: 'shadow-orange-500/30' },
  3: { icon: '⚔️', color: 'text-red-400', bg: 'bg-red-900/30', glow: 'shadow-red-500/30' },
  4: { icon: '👑', color: 'text-yellow-300', bg: 'bg-yellow-900/30', glow: 'shadow-yellow-400/40' },
  5: { icon: '✨', color: 'text-purple-300', bg: 'bg-purple-900/40', glow: 'shadow-purple-400/50' },
};

export const Prestige: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const [prestigeInfo, setPrestigeInfo] = useState<PrestigeInfoResponse['data'] | null>(null);
  const [allRanks, setAllRanks] = useState<PrestigeRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPrestiging, setIsPrestiging] = useState(false);
  const [prestigeResult, setPrestigeResult] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!currentCharacter?._id) return;

    setIsLoading(true);
    setError(null);

    try {
      const [infoRes, ranksRes] = await Promise.all([
        prestigeService.getPrestigeInfo(currentCharacter._id),
        prestigeService.getPrestigeRanks(),
      ]);

      if (infoRes.success) {
        setPrestigeInfo(infoRes.data);
      }
      if (ranksRes.success) {
        setAllRanks(ranksRes.data.ranks);
      }
    } catch (err) {
      logger.error('Failed to fetch prestige data', err as Error, { context: 'Prestige.fetchData' });
      setError('Failed to load prestige information');
    } finally {
      setIsLoading(false);
    }
  }, [currentCharacter?._id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrestige = async () => {
    if (!currentCharacter?._id) return;

    setIsPrestiging(true);
    try {
      const result = await prestigeService.performPrestige(currentCharacter._id);
      if (result.success) {
        setPrestigeResult(result.message);
        await fetchData();
      } else {
        setError('Failed to prestige');
      }
    } catch (err) {
      logger.error('Failed to perform prestige', err as Error, { context: 'Prestige.handlePrestige' });
      setError('Failed to perform prestige');
    } finally {
      setIsPrestiging(false);
      setShowConfirmModal(false);
    }
  };

  const formatBonusValue = (bonus: PrestigeBonus): string => {
    if (bonus.type === 'xp_multiplier' || bonus.type === 'gold_multiplier') {
      return `+${Math.round((bonus.value - 1) * 100)}%`;
    }
    if (bonus.type === 'skill_cap_increase') {
      return `+${bonus.value}`;
    }
    return `${bonus.value}`;
  };

  const getBonusIcon = (type: string): string => {
    switch (type) {
      case 'xp_multiplier': return '📈';
      case 'gold_multiplier': return '💰';
      case 'skill_cap_increase': return '🎓';
      case 'starting_bonus': return '🎁';
      default: return '✨';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !prestigeInfo) {
    return (
      <Card variant="leather" className="p-6 text-center">
        <p className="text-desert-sand">{error || 'Failed to load prestige info'}</p>
        <Button onClick={fetchData} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  const currentRankStyle = RANK_STYLES[prestigeInfo.currentRank] || RANK_STYLES[0];
  const currentRankDef = allRanks.find(r => r.rank === prestigeInfo.currentRank);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Message */}
      {prestigeResult && (
        <Card variant="parchment" className="p-4 border-2 border-gold-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <h3 className="font-western text-lg text-gold-dark">{prestigeResult}</h3>
                <p className="text-sm text-wood-dark">Your journey continues with new power!</p>
              </div>
            </div>
            <Button size="sm" onClick={() => setPrestigeResult(null)}>
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      {/* Current Rank Header */}
      <Card variant="leather">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Rank Badge */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${currentRankStyle.bg} ${currentRankStyle.glow} shadow-lg border-2 border-gold-dark/50`}>
                {currentRankStyle.icon}
              </div>
              <div>
                <h1 className={`text-3xl font-western ${currentRankStyle.color}`}>
                  {currentRankDef?.name || 'Newcomer'}
                </h1>
                <p className="text-desert-sand font-serif mt-1">
                  Prestige Rank {prestigeInfo.currentRank}
                </p>
                <p className="text-sm text-desert-stone mt-1">
                  Total Prestiges: {prestigeInfo.totalPrestiges}
                </p>
              </div>
            </div>

            {/* Prestige Button */}
            <div className="text-right">
              {prestigeInfo.nextRank ? (
                <div>
                  {prestigeInfo.canPrestige ? (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setShowConfirmModal(true)}
                      className="bg-gradient-to-r from-gold-dark to-gold-light hover:from-gold-light hover:to-gold-dark"
                    >
                      Prestige Now
                    </Button>
                  ) : (
                    <div className="text-desert-stone text-sm">
                      Reach Level {prestigeInfo.nextRank.requiredLevel} to prestige
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-purple-300 font-western">
                  Max Rank Achieved!
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Active Bonuses */}
      {prestigeInfo.permanentBonuses.length > 0 && (
        <Card variant="parchment">
          <div className="p-4">
            <h3 className="text-lg font-western text-wood-dark mb-4">
              Active Permanent Bonuses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {prestigeInfo.permanentBonuses.map((bonus, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-wood-light/10 rounded-lg border border-wood-grain/20"
                >
                  <span className="text-2xl">{getBonusIcon(bonus.type)}</span>
                  <div className="flex-1">
                    <div className="text-gold-dark font-bold">{formatBonusValue(bonus)}</div>
                    <div className="text-sm text-wood-dark">{bonus.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Rank Ladder */}
      <Card variant="leather">
        <div className="p-6">
          <h3 className="text-xl font-western text-gold-light mb-4">Prestige Ranks</h3>
          <div className="space-y-4">
            {allRanks.map((rank) => {
              const rankStyle = RANK_STYLES[rank.rank] || RANK_STYLES[0];
              const isCurrentRank = rank.rank === prestigeInfo.currentRank;
              const isUnlocked = rank.rank <= prestigeInfo.currentRank;
              const isNext = rank.rank === prestigeInfo.currentRank + 1;

              return (
                <div
                  key={rank.rank}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCurrentRank
                      ? 'border-gold-light bg-gold-dark/20'
                      : isUnlocked
                      ? 'border-gold-dark/50 bg-wood-medium/20'
                      : isNext
                      ? 'border-desert-sand/30 bg-wood-dark/30'
                      : 'border-wood-grain/20 bg-wood-dark/10 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${rankStyle.bg}`}>
                      {rankStyle.icon}
                    </div>

                    {/* Rank Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-western text-lg ${rankStyle.color}`}>
                          {rank.name}
                        </span>
                        {isCurrentRank && (
                          <span className="text-xs bg-gold-dark text-gold-light px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                        {isNext && !prestigeInfo.canPrestige && (
                          <span className="text-xs bg-desert-sand/20 text-desert-sand px-2 py-0.5 rounded-full">
                            Next
                          </span>
                        )}
                        {isNext && prestigeInfo.canPrestige && (
                          <span className="text-xs bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded-full">
                            Ready!
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-desert-sand mt-1">{rank.description}</p>
                      <div className="text-xs text-desert-stone mt-1">
                        Requires Level {rank.requiredLevel}
                      </div>
                    </div>

                    {/* Bonuses Preview */}
                    <div className="text-right text-sm">
                      {rank.bonuses.slice(0, 2).map((bonus, idx) => (
                        <div key={idx} className={isUnlocked ? 'text-gold-light' : 'text-desert-stone'}>
                          {getBonusIcon(bonus.type)} {formatBonusValue(bonus)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Prestige History */}
      {prestigeInfo.prestigeHistory.length > 0 && (
        <Card variant="parchment">
          <div className="p-4">
            <h3 className="text-lg font-western text-wood-dark mb-4">Prestige History</h3>
            <div className="space-y-2">
              {prestigeInfo.prestigeHistory.map((entry, idx) => {
                const historyRank = allRanks.find(r => r.rank === entry.rank);
                const style = RANK_STYLES[entry.rank] || RANK_STYLES[0];
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-wood-light/10 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{style.icon}</span>
                      <span className={`font-bold ${style.color}`}>
                        {historyRank?.name || `Rank ${entry.rank}`}
                      </span>
                    </div>
                    <div className="text-sm text-wood-dark">
                      Level {entry.levelAtPrestige} on{' '}
                      {new Date(entry.prestigedAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Prestige"
      >
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-6xl">{RANK_STYLES[prestigeInfo.currentRank + 1]?.icon || '🌟'}</span>
          </div>

          <p className="text-desert-sand text-center">
            Are you ready to prestige to{' '}
            <span className="text-gold-light font-bold">
              {prestigeInfo.nextRank?.name}
            </span>
            ?
          </p>

          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2">You will LOSE:</h4>
            <ul className="text-sm text-red-300 space-y-1 list-disc list-inside">
              <li>Character Level (reset to 1)</li>
              <li>All Skills (reset to level 1)</li>
              <li>Talents (cleared)</li>
              <li>Most Gold (reset to starting bonus)</li>
              <li>Equipment (reset to starter gear)</li>
            </ul>
          </div>

          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
            <h4 className="text-emerald-400 font-bold mb-2">You will KEEP:</h4>
            <ul className="text-sm text-emerald-300 space-y-1 list-disc list-inside">
              <li>All permanent prestige bonuses</li>
              <li>Legacy tier and milestones</li>
              <li>Cosmetic unlocks</li>
              <li>Gang membership</li>
              <li>Achievement progress</li>
            </ul>
          </div>

          <div className="bg-gold-dark/20 border border-gold-light/30 rounded-lg p-4">
            <h4 className="text-gold-light font-bold mb-2">You will GAIN:</h4>
            <ul className="text-sm text-gold-light space-y-1">
              {prestigeInfo.nextRank?.bonuses.map((bonus, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span>{getBonusIcon(bonus.type)}</span>
                  <span>{bonus.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isPrestiging}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePrestige}
              disabled={isPrestiging}
              className="bg-gradient-to-r from-gold-dark to-gold-light"
            >
              {isPrestiging ? 'Prestiging...' : 'Confirm Prestige'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Prestige;
