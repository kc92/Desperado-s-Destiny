/**
 * Actions Page
 * Available actions, tasks, and challenges for the player
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useActionStore } from '@/store/useActionStore';
import { useEnergyStore } from '@/store/useEnergyStore';
import { useCrimeStore } from '@/store/useCrimeStore';
import { useSkillStore } from '@/store/useSkillStore';
import { Card, Button } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
// import { formatDistanceToNow } from 'date-fns';
import { ActionType, SkillCategory } from '@desperados/shared';
import type { Action } from '@desperados/shared';
import { DeckGame, GameState, DeckGameResult, ActionResult } from '@/components/game/deckgames';
import { api } from '@/services/api';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { logger } from '@/services/logger.service';
import { dispatchJobCompleted } from '@/utils/tutorialEvents';
import { tutorialService } from '@/services/tutorial.service';

interface ActionCategory {
  type: ActionType;
  name: string;
  icon: string;
  description: string;
  color: string;
}

/**
 * Actions and tasks page
 */
export const Actions: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentCharacter,
    refreshCharacter
  } = useCharacterStore();
  const {
    actions,
    fetchActions,
    attemptAction: _attemptAction,
    isChallengingAction: _isChallengingAction,
    isLoading: isActionLoading
  } = useActionStore();
  const {
    energy
  } = useEnergyStore();
  const {
    crime
  } = useCrimeStore();
  const {
    skills,
    skillData,
    fetchSkills,
    isLoading: isSkillLoading
  } = useSkillStore();
  const { playSound } = useSoundEffects();

  const isLoading = isActionLoading || isSkillLoading;

  // Helper to get character's skill level for a category
  const getSkillLevelForCategory = (category: SkillCategory): number => {
    // Find the skill that matches this category
    const skill = skills.find(s => s.category === category);
    if (!skill) return 1;

    // Find the character's data for this skill
    const data = skillData.find(sd => sd.skillId === skill.id);
    return data?.level || 1;
  };

  // Check if an action is unlocked based on skill requirements
  const isActionUnlocked = (action: Action): boolean => {
    // If no skill requirement, action is unlocked
    if (!action.requiredSkillCategory || !action.requiredSkillLevel) {
      return true;
    }

    const playerLevel = getSkillLevelForCategory(action.requiredSkillCategory as SkillCategory);
    return playerLevel >= action.requiredSkillLevel;
  };

  const [selectedCategory, setSelectedCategory] = useState<ActionType | 'all'>('all');
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [actionResult, setActionResult] = useState<any>(null);
  const [isPerforming, setIsPerforming] = useState(false);

  // Deck game state
  const [activeGame, setActiveGame] = useState<{
    gameState: GameState;
    actionInfo: {
      name: string;
      type: string;
      difficulty: number;
      energyCost: number;
      rewards: any;
    };
  } | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);

  const categories: ActionCategory[] = [
    {
      type: ActionType.CRAFT,
      name: 'Crafting',
      icon: '⚒️',
      description: 'Create items and tools',
      color: 'bg-blue-500'
    },
    {
      type: ActionType.CRIME,
      name: 'Criminal',
      icon: '🔫',
      description: 'Illegal activities with risk',
      color: 'bg-red-500'
    },
    {
      type: ActionType.SOCIAL,
      name: 'Social',
      icon: '🤝',
      description: 'Interact with others',
      color: 'bg-green-500'
    },
    {
      type: ActionType.COMBAT,
      name: 'Combat',
      icon: '⚔️',
      description: 'Physical confrontations',
      color: 'bg-purple-500'
    }
  ];

  useEffect(() => {
    if (currentCharacter) {
      fetchActions(currentCharacter.currentLocation);
      fetchSkills(); // Fetch skills for gating checks
    }
  }, [currentCharacter, fetchActions, fetchSkills]);

  const handleAttemptAction = async (action: Action) => {
    if (!currentCharacter || isPerforming) return;

    // Check energy requirement
    if (energy && Math.floor(energy.currentEnergy) < (action.energyRequired ?? 0)) {
      setActionResult({
        success: false,
        message: `Not enough energy! Need ${action.energyRequired ?? 0}, have ${Math.floor(energy.currentEnergy || 0)}`
      });
      return;
    }

    // Check if jailed for crime actions
    if (crime?.isJailed && action.type === ActionType.CRIME) {
      setActionResult({
        success: false,
        message: "Can't commit crimes while in jail!"
      });
      return;
    }

    setIsPerforming(true);
    setSelectedAction(action);

    try {
      // Start the deck game
      const response = await api.post('/actions/start', {
        actionId: action.id
      });

      const { data } = response.data;

      // Set up the game state
      setActiveGame({
        gameState: {
          gameId: data.gameId,
          gameType: data.gameType,
          status: 'waiting_action',
          hand: data.hand,
          turnNumber: data.turnNumber,
          maxTurns: data.maxTurns,
          timeLimit: data.timeLimit,
          relevantSuit: data.relevantSuit,
          difficulty: data.difficulty,
          availableActions: data.availableActions
        },
        actionInfo: data.action
      });

      // Show the game modal
      setShowGameModal(true);
    } catch (error: any) {
      logger.error('Failed to start action from UI', error, { actionId: action._id });
      setActionResult({
        success: false,
        message: error.response?.data?.error || 'Failed to start action. Please try again.'
      });
    } finally {
      setIsPerforming(false);
    }
  };

  // Handle deck game completion
  const handleGameComplete = (result: { gameResult: DeckGameResult; actionResult?: ActionResult }) => {
    setShowGameModal(false);
    setActiveGame(null);

    // Dispatch tutorial event for action completion
    if (result.gameResult.success && selectedAction?.id) {
      dispatchJobCompleted(selectedAction.id);

      // Notify server to advance tutorial (if in tutorial)
      if (currentCharacter?._id) {
        tutorialService.advanceStep(currentCharacter._id, `complete-job-${selectedAction.id}`)
          .then((res) => {
            if (res.success) {
              logger.info('[Actions] Tutorial advanced after job completion', { jobId: selectedAction.id });
            }
          })
          .catch((err) => {
            logger.warn('[Actions] Failed to advance tutorial', { error: err });
          });
      }
    }

    // Play appropriate sound
    if (result.gameResult.success) {
      playSound('success');
      // Play gold sound if gold was earned
      if (result.actionResult?.rewardsGained.gold) {
        setTimeout(() => playSound('gold_gained'), 300);
      }
      // Play XP sound if XP was earned
      if (result.actionResult?.rewardsGained.xp) {
        setTimeout(() => playSound('xp_gained'), 600);
      }
    } else {
      playSound('failure');
    }

    // Show the action result
    if (result.actionResult) {
      setActionResult({
        success: result.gameResult.success,
        message: result.gameResult.success
          ? `Success! ${result.gameResult.handName || 'Good hand'} with ${result.gameResult.suitBonus.multiplier.toFixed(1)}x bonus!`
          : 'Failed! Better luck next time, partner.',
        rewards: {
          gold: result.actionResult.rewardsGained.gold,
          experience: result.actionResult.rewardsGained.xp,
          items: result.actionResult.rewardsGained.items
        }
      });
    }

    // Refresh character data (gold, energy) and actions
    if (currentCharacter) {
      refreshCharacter();
      fetchActions(currentCharacter.currentLocation);
    }
  };

  // Handle game forfeit
  const handleGameForfeit = () => {
    setShowGameModal(false);
    setActiveGame(null);
    setActionResult({
      success: false,
      message: 'Action forfeited. No energy spent.'
    });
  };

  const getFilteredActions = () => {
    if (!actions) return [];
    if (selectedCategory === 'all') return actions;
    return actions.filter(a => a.type === selectedCategory);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-500';
    if (difficulty <= 4) return 'text-yellow-500';
    if (difficulty <= 6) return 'text-orange-500';
    if (difficulty <= 8) return 'text-red-500';
    return 'text-red-700';
  };

  const getSuccessRate = (action: Action) => {
    if (!currentCharacter) return 0;

    // Simple calculation based on character stats vs difficulty
    const relevantStat = currentCharacter.stats[action.statUsed as keyof typeof currentCharacter.stats] || 10;
    const baseRate = Math.min(95, Math.max(5, 100 - (action.difficulty * 10) + relevantStat));
    return Math.round(baseRate);
  };

  if (!currentCharacter) {
    return (
      <div className="text-center py-12">
        <p className="text-desert-sand">No character selected</p>
        <Button onClick={() => navigate('/character-select')} className="mt-4">
          Select Character
        </Button>
      </div>
    );
  }

  const isJailed = crime?.isJailed || false;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="leather">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-western text-gold-light">
                Available Actions
              </h1>
              <p className="text-desert-sand font-serif mt-1">
                Current Location: <span className="text-gold-light font-bold">
                  {currentCharacter.currentLocation || 'Unknown'}
                </span>
              </p>
              {isJailed && (
                <p className="text-red-600 font-bold mt-2 animate-pulse">
                  🔒 Limited actions while jailed
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-desert-stone">Energy</div>
              <div className="text-2xl font-bold text-gold-light">
                ⚡ {Math.floor(energy?.currentEnergy || 0)} / {energy?.maxEnergy || 100}
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`
                px-4 py-2 rounded font-serif transition-all
                ${selectedCategory === 'all'
                  ? 'bg-gold-light text-wood-dark'
                  : 'bg-wood-dark/50 text-desert-sand hover:bg-wood-dark/70'
                }
              `}
            >
              All Actions
            </button>
            {categories.map(cat => (
              <button
                key={cat.type}
                onClick={() => setSelectedCategory(cat.type)}
                disabled={isJailed && cat.type === ActionType.CRIME}
                className={`
                  px-4 py-2 rounded font-serif transition-all flex items-center gap-2
                  ${selectedCategory === cat.type
                    ? 'bg-gold-light text-wood-dark'
                    : 'bg-wood-dark/50 text-desert-sand hover:bg-wood-dark/70'
                  }
                  ${isJailed && cat.type === ActionType.CRIME ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions List */}
        <div className="lg:col-span-2">
          <Card variant="parchment">
            <div className="p-6">
              <h2 className="text-xl font-western text-wood-dark mb-4">
                {selectedCategory === 'all' ? 'All Available Actions' : categories.find(c => c.type === selectedCategory)?.name}
              </h2>

              {isLoading ? (
                <div aria-busy="true" aria-live="polite">
                  <CardGridSkeleton count={6} columns={2} />
                </div>
              ) : getFilteredActions().length > 0 ? (
                <div className="space-y-3">
                  {getFilteredActions().map((action) => {
                    const unlocked = isActionUnlocked(action);
                    return (
                      <div
                        key={action.id}
                        className={`
                          p-4 bg-wood-grain/10 rounded hover:bg-wood-grain/20 transition-all cursor-pointer
                          ${selectedAction?.id === action.id ? 'ring-2 ring-gold-light' : ''}
                          ${!unlocked || (isJailed && action.type === ActionType.CRIME) || (energy && Math.floor(energy.currentEnergy) < (action.energyRequired ?? 0))
                            ? 'opacity-50'
                            : ''
                          }
                        `}
                        onClick={() => setSelectedAction(action)}
                        data-testid={`action-${action.id}`}
                        data-action-name={action.name}
                        data-action-category={action.type}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">
                                {!unlocked ? '🔒' : categories.find(c => c.type === action.type)?.icon}
                              </span>
                              <h3 className="font-bold text-wood-dark">
                                {action.name}
                              </h3>
                              <span className={`text-sm ${getDifficultyColor(action.difficulty)}`}>
                                {'★'.repeat(Math.ceil(action.difficulty / 2))}
                              </span>
                            </div>
                            <p className="text-sm text-wood-grain mb-2">
                              {action.description}
                            </p>
                            {!unlocked && action.requiredSkillCategory && action.requiredSkillLevel && (
                              <div className="mb-2 text-xs text-red-500 font-semibold">
                                Requires {action.requiredSkillCategory} Level {action.requiredSkillLevel}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs">
                              <span>⚡ {(action.energyRequired ?? action.energyCost) || 0} energy</span>
                              <span>💰 {action.baseReward || action.rewards?.gold || 0} gold</span>
                              {action.statUsed && <span>📊 {action.statUsed.toUpperCase()}</span>}
                              <span>🎯 {getSuccessRate(action)}% success</span>
                              {(action.cooldown ?? 0) > 0 && (
                                <span>⏱️ {Math.ceil((action.cooldown ?? 0) / 60)}min cooldown</span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={unlocked ? 'primary' : 'ghost'}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAttemptAction(action);
                            }}
                            disabled={
                              !unlocked ||
                              isPerforming ||
                              !!(isJailed && action.type === ActionType.CRIME) ||
                              !!(energy && Math.floor(energy.currentEnergy) < (action.energyRequired ?? 0))
                            }
                            data-testid={`action-attempt-${action.id}`}
                          >
                            {!unlocked
                              ? 'Locked'
                              : isPerforming && selectedAction?.id === action.id
                                ? 'Performing...'
                                : 'Attempt'
                            }
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon="🎯"
                  title="No Actions Available"
                  description="No actions found in this category. Try exploring different locations or check back later!"
                  size="sm"
                  variant="default"
                />
              )}
            </div>
          </Card>
        </div>

        {/* Action Details & Results */}
        <div className="space-y-4">
          {/* Selected Action Details */}
          {selectedAction && (
            <Card variant="wood">
              <div className="p-6">
                <h3 className="text-lg font-western text-desert-sand mb-3">
                  Action Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-bold text-gold-light">
                      {selectedAction.name}
                    </h4>
                    <p className="text-sm text-desert-stone mt-1">
                      {selectedAction.description}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Type:</span>
                      <span className="text-desert-sand capitalize">
                        {selectedAction.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Difficulty:</span>
                      <span className={getDifficultyColor(selectedAction.difficulty)}>
                        {selectedAction.difficulty}/10
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Energy Cost:</span>
                      <span className="text-desert-sand">
                        {selectedAction.energyRequired}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Base Reward:</span>
                      <span className="text-gold-light">
                        ${selectedAction.baseReward}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Stat Used:</span>
                      <span className="text-desert-sand uppercase">
                        {selectedAction.statUsed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Success Rate:</span>
                      <span className="text-desert-sand">
                        {getSuccessRate(selectedAction)}%
                      </span>
                    </div>
                  </div>

                  {/* Skill Requirements */}
                  {selectedAction.requiredSkillCategory && selectedAction.requiredSkillLevel && (
                    <div className="p-3 bg-wood-dark/30 rounded border border-wood-light">
                      <h4 className="text-sm font-bold text-desert-sand mb-2">
                        Skill Requirement
                      </h4>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-desert-stone">
                          {selectedAction.requiredSkillCategory} Level:
                        </span>
                        <span className={
                          isActionUnlocked(selectedAction)
                            ? 'text-green-500 font-bold'
                            : 'text-red-500 font-bold'
                        }>
                          {getSkillLevelForCategory(selectedAction.requiredSkillCategory as SkillCategory)}
                          {' / '}
                          {selectedAction.requiredSkillLevel}
                          {isActionUnlocked(selectedAction) ? ' ✓' : ' ✗'}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedAction.requirements && (
                    <div>
                      <h4 className="text-sm font-bold text-desert-sand mb-1">
                        Requirements:
                      </h4>
                      <ul className="text-xs text-desert-stone space-y-1">
                        {selectedAction.requirements.map((req, i) => (
                          <li key={i}>• {String(req)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    variant={isActionUnlocked(selectedAction) ? 'primary' : 'ghost'}
                    className="w-full"
                    onClick={() => handleAttemptAction(selectedAction)}
                    disabled={
                      !isActionUnlocked(selectedAction) ||
                      isPerforming ||
                      !!(isJailed && selectedAction.type === ActionType.CRIME) ||
                      !!(energy && Math.floor(energy.currentEnergy) < (selectedAction.energyRequired || 0))
                    }
                  >
                    {!isActionUnlocked(selectedAction)
                      ? `Locked (Need ${selectedAction.requiredSkillCategory} Lvl ${selectedAction.requiredSkillLevel})`
                      : isPerforming
                        ? 'Performing...'
                        : `Attempt (${selectedAction.energyRequired} ⚡)`
                    }
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Action Result */}
          {actionResult && (
            <Card variant={actionResult.success ? 'leather' : 'wood'}>
              <div className="p-6">
                <h3 className={`text-lg font-western mb-3 ${
                  actionResult.success ? 'text-gold-light' : 'text-red-600'
                }`}>
                  {actionResult.success ? '✓ Success!' : '✗ Failed'}
                </h3>
                <p className="text-desert-sand text-sm mb-3">
                  {actionResult.message}
                </p>
                {actionResult.rewards && (
                  <div className="space-y-2 text-sm">
                    {actionResult.rewards.gold && (
                      <div className="flex justify-between">
                        <span>Gold Earned:</span>
                        <span className="text-gold-light">
                          +${actionResult.rewards.gold}
                        </span>
                      </div>
                    )}
                    {actionResult.rewards.experience && (
                      <div className="flex justify-between">
                        <span>Experience:</span>
                        <span className="text-green-500">
                          +{actionResult.rewards.experience} XP
                        </span>
                      </div>
                    )}
                    {actionResult.rewards.items && actionResult.rewards.items.length > 0 && (
                      <div>
                        <span>Items Found:</span>
                        <ul className="mt-1">
                          {actionResult.rewards.items.map((item: any, i: number) => (
                            <li key={i} className="text-gold-light">
                              • {item.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => setActionResult(null)}
                >
                  Continue
                </Button>
              </div>
            </Card>
          )}

          {/* Action Type Breakdown */}
          <Card variant="leather">
            <div className="p-6">
              <h3 className="text-lg font-western text-desert-sand mb-3">
                Actions by Type
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-wood-grain/30 pb-2 mb-2">
                  <span className="text-desert-stone font-semibold">Total Available:</span>
                  <span className="text-gold-light font-bold">
                    {actions?.length || 0}
                  </span>
                </div>
                {categories.map((cat) => {
                  const count = actions?.filter(a => a.type === cat.type).length || 0;
                  const unlockedCount = actions?.filter(a => a.type === cat.type && isActionUnlocked(a)).length || 0;
                  return (
                    <div key={cat.type} className="flex justify-between items-center">
                      <span className="text-desert-stone flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}:</span>
                      </span>
                      <span className="text-desert-sand">
                        {unlockedCount}/{count}
                        {unlockedCount < count && (
                          <span className="text-desert-stone ml-1 text-xs">
                            ({count - unlockedCount} locked)
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Deck Game Modal */}
      {showGameModal && activeGame && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <DeckGame
              initialState={activeGame.gameState}
              actionInfo={activeGame.actionInfo}
              onComplete={handleGameComplete}
              onForfeit={handleGameForfeit}
              context="action"
            />
          </div>
        </div>
      )}
    </div>
  );
};