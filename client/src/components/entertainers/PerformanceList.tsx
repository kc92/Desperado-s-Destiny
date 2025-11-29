/**
 * PerformanceList Component
 * Displays available performances with watch functionality
 */

import React, { useState } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import type { Performance, PerformanceResult, PerformanceType } from '@/hooks/useEntertainers';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';

interface PerformanceListProps {
  performances: Performance[];
  onWatch?: (performanceId: string) => Promise<PerformanceResult | null>;
  isLoading?: boolean;
}

const performanceTypeIcons: Record<PerformanceType, string> = {
  piano: '🎹',
  magic: '🎩',
  singing: '🎤',
  storytelling: '📖',
  dancing: '💃',
  harmonica: '🎵',
  wild_west_show: '🤠',
  fortune_telling: '🔮',
  gospel: '⛪',
  comedy: '😂',
};

const moodEffectColors: Record<string, string> = {
  excited: 'text-orange-400',
  happy: 'text-yellow-400',
  inspired: 'text-purple-400',
  contemplative: 'text-blue-400',
  thrilled: 'text-red-400',
  mesmerized: 'text-pink-400',
  amazed: 'text-cyan-400',
  intrigued: 'text-green-400',
  uneasy: 'text-gray-400',
  melancholic: 'text-blue-300',
  peaceful: 'text-green-300',
  blessed: 'text-gold-light',
  amused: 'text-yellow-300',
};

export const PerformanceList: React.FC<PerformanceListProps> = ({
  performances,
  onWatch,
  isLoading = false,
}) => {
  const { currentCharacter } = useCharacterStore();
  const { success, error: showError } = useToast();
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [result, setResult] = useState<PerformanceResult | null>(null);

  const playerEnergy = currentCharacter?.energy || 0;

  const canAfford = (performance: Performance) => playerEnergy >= performance.energyCost;

  const handleWatch = async () => {
    if (!selectedPerformance || !onWatch || isWatching) return;

    setIsWatching(true);
    const watchResult = await onWatch(selectedPerformance.id);

    if (watchResult) {
      if (watchResult.success) {
        setResult(watchResult);
        success('Performance Enjoyed!', watchResult.message);
      } else {
        showError('Cannot Watch', watchResult.message);
        setSelectedPerformance(null);
      }
    }

    setIsWatching(false);
  };

  const handleClose = () => {
    setSelectedPerformance(null);
    setResult(null);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (performances.length === 0) {
    return (
      <Card variant="wood" padding="md">
        <div className="text-center py-4">
          <span className="text-3xl">🎭</span>
          <p className="text-desert-sand mt-2">No performances available</p>
          <p className="text-sm text-desert-stone">Check back later for shows</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Energy Display */}
      <div className="flex justify-between items-center p-3 bg-wood-dark/50 rounded-lg">
        <span className="text-desert-stone">Your Energy</span>
        <span className="text-xl font-western text-blue-400">{playerEnergy} / 100</span>
      </div>

      {/* Performances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {performances.map((performance) => {
          const affordable = canAfford(performance);
          const icon = performanceTypeIcons[performance.performanceType] || '🎭';
          const moodColor = moodEffectColors[performance.moodEffect.mood] || 'text-desert-sand';

          return (
            <div
              key={performance.id}
              onClick={() => setSelectedPerformance(performance)}
              className={`p-4 rounded-lg bg-wood-dark/50 border border-wood-grain/30 cursor-pointer
                transition-all hover:border-gold-light/50 hover:bg-wood-dark
                ${!affordable ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-3xl">{icon}</span>
                <div className="text-right">
                  <span className={`text-sm ${affordable ? 'text-blue-400' : 'text-red-500'}`}>
                    {performance.energyCost} energy
                  </span>
                </div>
              </div>

              <h4 className="font-western text-gold-light">{performance.name}</h4>
              <p className="text-xs text-desert-stone line-clamp-2 mt-1">
                {performance.description}
              </p>

              <div className="flex items-center gap-3 mt-3 text-xs">
                <span className="text-desert-stone">
                  {formatDuration(performance.duration)}
                </span>
                <span className={`${moodColor} capitalize`}>
                  +{performance.moodEffect.mood}
                </span>
              </div>

              {/* Rewards Preview */}
              {performance.rewards && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {performance.rewards.experience && (
                    <span className="text-xs px-1.5 py-0.5 bg-purple-900/30 text-purple-300 rounded">
                      +{performance.rewards.experience} XP
                    </span>
                  )}
                  {performance.rewards.gold && (
                    <span className="text-xs px-1.5 py-0.5 bg-yellow-900/30 text-gold-light rounded">
                      +{performance.rewards.gold}g
                    </span>
                  )}
                  {performance.rewards.buff && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-900/30 text-blue-300 rounded">
                      +{performance.rewards.buff.stat}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Performance Detail Modal */}
      {selectedPerformance && (
        <Modal
          isOpen={true}
          onClose={handleClose}
          title={result ? 'Performance Complete!' : selectedPerformance.name}
          size="md"
        >
          {result ? (
            // Result View
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-6xl">
                  {performanceTypeIcons[selectedPerformance.performanceType] || '🎭'}
                </span>
                <p className="text-lg text-gold-light mt-2">
                  You enjoyed the performance!
                </p>
              </div>

              <p className="text-desert-sand text-center">{result.message}</p>

              {/* Rewards Earned */}
              <Card variant="wood" padding="sm">
                <h4 className="text-sm text-desert-stone mb-2">Rewards Earned</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-desert-sand">Experience</span>
                    <span className="text-purple-400">+{result.experienceGained} XP</span>
                  </div>
                  {result.goldEarned && (
                    <div className="flex justify-between">
                      <span className="text-desert-sand">Gold</span>
                      <span className="text-gold-light">+{result.goldEarned}g</span>
                    </div>
                  )}
                  {result.itemReceived && (
                    <div className="flex justify-between">
                      <span className="text-desert-sand">Item</span>
                      <span className="text-green-400">{result.itemReceived}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-desert-sand">Trust</span>
                    <span className="text-blue-400">+{result.trustGained}</span>
                  </div>
                </div>
              </Card>

              {/* Mood Effect */}
              <Card variant="wood" padding="sm">
                <h4 className="text-sm text-desert-stone mb-2">Mood Effect</h4>
                <div className="flex items-center gap-2">
                  <span className={`text-lg capitalize ${moodEffectColors[result.moodChange.mood]}`}>
                    {result.moodChange.mood}
                  </span>
                  <span className="text-desert-stone">
                    for {result.moodChange.duration} minutes
                  </span>
                </div>
              </Card>

              {/* Buffs Applied */}
              {result.buffsApplied && result.buffsApplied.length > 0 && (
                <Card variant="wood" padding="sm">
                  <h4 className="text-sm text-desert-stone mb-2">Buffs Applied</h4>
                  <div className="space-y-1">
                    {result.buffsApplied.map((buff, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-desert-sand capitalize">{buff.stat}</span>
                        <span className="text-green-400">+{buff.modifier} for {buff.duration}m</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Button fullWidth onClick={handleClose}>
                Done
              </Button>
            </div>
          ) : (
            // Pre-watch View
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-6xl">
                  {performanceTypeIcons[selectedPerformance.performanceType] || '🎭'}
                </span>
                <p className="text-desert-stone mt-2 capitalize">
                  {selectedPerformance.performanceType.replace('_', ' ')}
                </p>
              </div>

              <p className="text-desert-sand text-center font-serif italic">
                "{selectedPerformance.description}"
              </p>

              {/* Performance Details */}
              <Card variant="wood" padding="sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-desert-stone">Duration</p>
                    <p className="text-desert-sand">{formatDuration(selectedPerformance.duration)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-desert-stone">Energy Cost</p>
                    <p className={canAfford(selectedPerformance) ? 'text-blue-400' : 'text-red-500'}>
                      {selectedPerformance.energyCost} energy
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-desert-stone">Mood Effect</p>
                    <p className={`capitalize ${moodEffectColors[selectedPerformance.moodEffect.mood]}`}>
                      {selectedPerformance.moodEffect.mood}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-desert-stone">Intensity</p>
                    <p className="text-desert-sand">
                      {'★'.repeat(selectedPerformance.moodEffect.intensity)}
                      {'☆'.repeat(5 - selectedPerformance.moodEffect.intensity)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Rewards */}
              {selectedPerformance.rewards && (
                <Card variant="wood" padding="sm">
                  <h4 className="text-sm text-desert-stone mb-2">Potential Rewards</h4>
                  <div className="space-y-1">
                    {selectedPerformance.rewards.experience && (
                      <div className="flex justify-between text-sm">
                        <span className="text-desert-sand">Experience</span>
                        <span className="text-purple-400">+{selectedPerformance.rewards.experience} XP</span>
                      </div>
                    )}
                    {selectedPerformance.rewards.gold && (
                      <div className="flex justify-between text-sm">
                        <span className="text-desert-sand">Gold</span>
                        <span className="text-gold-light">+{selectedPerformance.rewards.gold}g</span>
                      </div>
                    )}
                    {selectedPerformance.rewards.buff && (
                      <div className="flex justify-between text-sm">
                        <span className="text-desert-sand capitalize">{selectedPerformance.rewards.buff.stat} Buff</span>
                        <span className="text-green-400">
                          +{selectedPerformance.rewards.buff.modifier} ({selectedPerformance.rewards.buff.duration}m)
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              <div className="flex gap-3">
                <Button variant="ghost" fullWidth onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  fullWidth
                  onClick={handleWatch}
                  disabled={!canAfford(selectedPerformance) || isWatching}
                  isLoading={isWatching}
                  loadingText="Watching..."
                >
                  Watch Performance
                </Button>
              </div>

              {!canAfford(selectedPerformance) && (
                <p className="text-center text-sm text-red-400">
                  You need {selectedPerformance.energyCost - playerEnergy} more energy
                </p>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default PerformanceList;
