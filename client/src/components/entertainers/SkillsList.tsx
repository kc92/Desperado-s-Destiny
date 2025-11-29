/**
 * SkillsList Component
 * Displays teachable skills from an entertainer
 */

import React, { useState } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import type { TeachableSkill, SkillLearningResult } from '@/hooks/useEntertainers';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';

interface SkillsListProps {
  skills: TeachableSkill[];
  playerTrustLevel: number;
  onLearn?: (skillId: string) => Promise<SkillLearningResult | null>;
  isLoading?: boolean;
}

const statIcons: Record<string, string> = {
  performance_bonus: '🎭',
  gossip_access: '💬',
  sleight_of_hand: '🤏',
  pickpocket_success: '💰',
  misdirection: '👁️',
  stealth: '🥷',
  message_decoding: '📝',
  lore_knowledge: '📚',
  charisma: '✨',
  dodge_chance: '🌀',
  supernatural_detection: '👻',
  supernatural_sense: '🔮',
  fear_resistance: '💪',
  accuracy: '🎯',
  mounted_combat: '🐎',
  prophecy_access: '⭐',
  luck: '🍀',
  damage_resistance: '🛡️',
  health_regen_rate: '❤️',
  group_influence: '👥',
  emotional_resilience: '🧘',
};

export const SkillsList: React.FC<SkillsListProps> = ({
  skills,
  playerTrustLevel,
  onLearn,
  isLoading = false,
}) => {
  const { currentCharacter } = useCharacterStore();
  const { success, error: showError } = useToast();
  const [selectedSkill, setSelectedSkill] = useState<TeachableSkill | null>(null);
  const [isLearning, setIsLearning] = useState(false);
  const [learnResult, setLearnResult] = useState<SkillLearningResult | null>(null);

  const playerGold = currentCharacter?.gold || 0;
  const playerEnergy = currentCharacter?.energy || 0;

  const canAfford = (skill: TeachableSkill) =>
    playerGold >= skill.goldCost && playerEnergy >= skill.energyCost;

  const meetsRequirements = (skill: TeachableSkill) =>
    playerTrustLevel >= skill.trustRequired;

  const handleLearn = async () => {
    if (!selectedSkill || !onLearn || isLearning) return;

    setIsLearning(true);
    const result = await onLearn(selectedSkill.skillId);

    if (result) {
      if (result.success) {
        setLearnResult(result);
        success('Skill Learned!', result.message);
      } else {
        showError('Cannot Learn', result.message);
        setSelectedSkill(null);
      }
    }

    setIsLearning(false);
  };

  const handleClose = () => {
    setSelectedSkill(null);
    setLearnResult(null);
  };

  // Separate available and locked skills
  const availableSkills = skills.filter((skill) => meetsRequirements(skill));
  const lockedSkills = skills.filter((skill) => !meetsRequirements(skill));

  if (skills.length === 0) {
    return (
      <Card variant="wood" padding="md">
        <div className="text-center py-4">
          <span className="text-3xl">📖</span>
          <p className="text-desert-sand mt-2">No skills to teach</p>
          <p className="text-sm text-desert-stone">This entertainer has no teachable skills</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resources Display */}
      <div className="flex justify-between items-center p-3 bg-wood-dark/50 rounded-lg">
        <div className="flex gap-4">
          <div>
            <span className="text-xs text-desert-stone">Gold</span>
            <p className="font-western text-gold-light">{playerGold}</p>
          </div>
          <div>
            <span className="text-xs text-desert-stone">Energy</span>
            <p className="font-western text-blue-400">{playerEnergy}</p>
          </div>
        </div>
        <div>
          <span className="text-xs text-desert-stone">Trust Level</span>
          <p className="font-western text-green-400">{playerTrustLevel}%</p>
        </div>
      </div>

      {/* Available Skills */}
      {availableSkills.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm text-desert-stone">Available to Learn</h4>
          <div className="grid gap-3">
            {availableSkills.map((skill) => {
              const affordable = canAfford(skill);
              const icon = statIcons[skill.effect.stat] || '✨';

              return (
                <div
                  key={skill.skillId}
                  onClick={() => setSelectedSkill(skill)}
                  className={`p-4 rounded-lg bg-wood-dark/50 border border-wood-grain/30
                    cursor-pointer transition-all hover:border-gold-light/50 hover:bg-wood-dark
                    ${!affordable ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{icon}</span>
                    <div className="flex-1">
                      <h4 className="font-western text-gold-light">{skill.skillName}</h4>
                      <p className="text-xs text-desert-stone line-clamp-2 mt-1">
                        {skill.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className={playerGold >= skill.goldCost ? 'text-gold-light' : 'text-red-500'}>
                          {skill.goldCost}g
                        </span>
                        <span className={playerEnergy >= skill.energyCost ? 'text-blue-400' : 'text-red-500'}>
                          {skill.energyCost} energy
                        </span>
                        <span className="text-green-400">
                          +{skill.effect.modifier} {skill.effect.stat.replace('_', ' ')}
                        </span>
                        {skill.effect.permanent && (
                          <span className="px-1.5 py-0.5 bg-purple-900/30 text-purple-300 rounded">
                            Permanent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Skills */}
      {lockedSkills.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm text-desert-stone flex items-center gap-2">
            <span>🔒</span>
            Locked Skills (Need More Trust)
          </h4>
          <div className="grid gap-2">
            {lockedSkills.map((skill) => {
              const icon = statIcons[skill.effect.stat] || '✨';

              return (
                <div
                  key={skill.skillId}
                  className="p-3 rounded-lg bg-wood-dark/30 border border-wood-grain/20 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔒</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-western text-desert-sand truncate">{skill.skillName}</h4>
                      <p className="text-xs text-yellow-600">
                        Requires Trust {skill.trustRequired}%
                      </p>
                    </div>
                    <span className="text-xl">{icon}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <Modal
          isOpen={true}
          onClose={handleClose}
          title={learnResult ? 'Skill Learned!' : `Learn: ${selectedSkill.skillName}`}
          size="md"
        >
          {learnResult ? (
            // Result View
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-6xl">{statIcons[selectedSkill.effect.stat] || '✨'}</span>
                <p className="text-lg text-gold-light mt-2">
                  {selectedSkill.skillName}
                </p>
                <p className="text-desert-stone">Successfully learned!</p>
              </div>

              <p className="text-desert-sand text-center">{learnResult.message}</p>

              <Card variant="wood" padding="sm">
                <h4 className="text-sm text-desert-stone mb-2">Effect Applied</h4>
                {learnResult.effectApplied && (
                  <div className="flex justify-between items-center">
                    <span className="text-desert-sand capitalize">
                      {learnResult.effectApplied.stat.replace('_', ' ')}
                    </span>
                    <span className="text-green-400">
                      +{learnResult.effectApplied.modifier}
                      {learnResult.effectApplied.permanent && ' (Permanent)'}
                    </span>
                  </div>
                )}
              </Card>

              <Card variant="wood" padding="sm">
                <h4 className="text-sm text-desert-stone mb-2">Cost</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-desert-sand">Gold Spent</span>
                    <span className="text-red-400">-{learnResult.goldCost}g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-desert-sand">Energy Used</span>
                    <span className="text-red-400">-{learnResult.energyCost}</span>
                  </div>
                </div>
              </Card>

              <Button fullWidth onClick={handleClose}>
                Done
              </Button>
            </div>
          ) : (
            // Pre-learn View
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-6xl">{statIcons[selectedSkill.effect.stat] || '✨'}</span>
              </div>

              <p className="text-desert-sand text-center font-serif italic">
                "{selectedSkill.description}"
              </p>

              {/* Skill Details */}
              <Card variant="wood" padding="sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-desert-stone">Effect</p>
                    <p className="text-desert-sand capitalize">
                      +{selectedSkill.effect.modifier} {selectedSkill.effect.stat.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-desert-stone">Duration</p>
                    <p className={selectedSkill.effect.permanent ? 'text-purple-400' : 'text-desert-sand'}>
                      {selectedSkill.effect.permanent ? 'Permanent' : 'Temporary'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-desert-stone">Gold Cost</p>
                    <p className={playerGold >= selectedSkill.goldCost ? 'text-gold-light' : 'text-red-500'}>
                      {selectedSkill.goldCost}g
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-desert-stone">Energy Cost</p>
                    <p className={playerEnergy >= selectedSkill.energyCost ? 'text-blue-400' : 'text-red-500'}>
                      {selectedSkill.energyCost} energy
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button variant="ghost" fullWidth onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  fullWidth
                  onClick={handleLearn}
                  disabled={!canAfford(selectedSkill) || isLearning}
                  isLoading={isLearning}
                  loadingText="Learning..."
                >
                  Learn Skill
                </Button>
              </div>

              {!canAfford(selectedSkill) && (
                <p className="text-center text-sm text-red-400">
                  {playerGold < selectedSkill.goldCost && (
                    <>Need {selectedSkill.goldCost - playerGold} more gold. </>
                  )}
                  {playerEnergy < selectedSkill.energyCost && (
                    <>Need {selectedSkill.energyCost - playerEnergy} more energy.</>
                  )}
                </p>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default SkillsList;
