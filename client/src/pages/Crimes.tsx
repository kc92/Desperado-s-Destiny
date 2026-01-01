/**
 * Crimes Page
 * Main interface for criminal activities, bounty hunting, and crime history
 * Features: Tabbed interface, JailScreen overlay, WantedLevelDisplay
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useActionStore } from '@/store/useActionStore';
import { useEnergyStore } from '@/store/useEnergyStore';
import { useCrimeStore } from '@/store/useCrimeStore';
import { WantedLevelDisplay } from '@/components/game/WantedLevelDisplay';
import { WantedPosterModal } from '@/components/game/WantedPosterModal';
import { CrimesList } from '@/components/game/CrimesList';
import { BountyBoard, type Bounty } from '@/components/game/BountyBoard';
import { ArrestModal } from '@/components/game/ArrestModal';
import { JailScreen } from '@/components/game/JailScreen';
import { DeckGame, GameState, DeckGameResult, ActionResult } from '@/components/game/deckgames';
import { api } from '@/services/api';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { crimeService } from '@/services/crime.service';
import { logger } from '@/services/logger.service';

type TabType = 'crimes' | 'bounties' | 'history';

/**
 * Main crimes interface page
 */
export const Crimes: React.FC = () => {
  const { currentCharacter, refreshCharacter } = useCharacterStore();
  const { actions, fetchActions, isLoading: isActionLoading } = useActionStore();
  const { energy } = useEnergyStore();
  const { crime, loadCrimeStatus, payBail, layLow, isLoading: isCrimeLoading } = useCrimeStore();
  const { playSound } = useSoundEffects();

  const isLoading = isActionLoading || isCrimeLoading;

  const [activeTab, setActiveTab] = useState<TabType>('crimes');
  const [showWantedPoster, setShowWantedPoster] = useState(false);
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [_isLoadingBounties, setIsLoadingBounties] = useState(false);
  const [isPerforming, setIsPerforming] = useState(false);
  // selectedAction tracks currently performing action for game state
  const [_selectedAction, setSelectedAction] = useState<any>(null);

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

  // Extract criminal skills from character.skills array
  const criminalSkills = useMemo(() => {
    const skills: Record<string, number> = {
      pickpocketing: 1,
      burglary: 1,
      robbery: 1,
      heisting: 1,
      assassination: 1
    };

    if (currentCharacter?.skills) {
      for (const skill of currentCharacter.skills) {
        const id = (skill.skillId || '').toLowerCase();
        if (id && id in skills) {
          skills[id] = skill.level || 1;
        }
      }
    }

    return skills;
  }, [currentCharacter?.skills]);

  // Load data on mount
  useEffect(() => {
    if (currentCharacter) {
      fetchActions(currentCharacter.currentLocation);
      loadCrimeStatus?.(currentCharacter._id);
      loadBounties();
    }
  }, [currentCharacter, fetchActions, loadCrimeStatus]);

  // Load bounties
  const loadBounties = async () => {
    setIsLoadingBounties(true);
    try {
      const data = await crimeService.getBounties();
      setBounties(data);
    } catch (error) {
      logger.error('Failed to load bounties', error as Error, { context: 'Crimes.loadBounties' });
    } finally {
      setIsLoadingBounties(false);
    }
  };

  // Handle crime attempt - starts DeckGame modal
  const handleAttemptCrime = async (action: any) => {
    if (!currentCharacter || isPerforming) return;

    // Check energy requirement
    const energyCost = action.energyRequired ?? action.energyCost ?? 0;
    if (energy && Math.floor(energy.currentEnergy) < energyCost) {
      logger.warn('Not enough energy for crime', { required: energyCost, current: energy.currentEnergy });
      return;
    }

    // Check if jailed
    if (crime?.isJailed) {
      logger.warn('Cannot commit crimes while jailed');
      return;
    }

    setIsPerforming(true);
    setSelectedAction(action);

    try {
      // Start the deck game via API
      const response = await api.post('/actions/start', {
        actionId: action.id || action._id
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
      logger.error('Failed to start crime action', error as Error, {
        context: 'Crimes.handleAttemptCrime',
        actionId: action._id || action.id,
        characterId: currentCharacter._id
      });
    } finally {
      setIsPerforming(false);
    }
  };

  // Handle deck game completion
  const handleGameComplete = (result: { gameResult: DeckGameResult; actionResult?: ActionResult }) => {
    setShowGameModal(false);
    setActiveGame(null);

    // Play appropriate sound
    if (result.gameResult.success) {
      playSound('success');
      if (result.actionResult?.rewardsGained.gold) {
        setTimeout(() => playSound('gold_gained'), 300);
      }
    } else {
      playSound('failure');
    }

    // Refresh character data and crime status
    if (currentCharacter) {
      refreshCharacter();
      fetchActions(currentCharacter.currentLocation);
      loadCrimeStatus?.(currentCharacter._id);
    }
  };

  // Handle game forfeit
  const handleGameForfeit = () => {
    setShowGameModal(false);
    setActiveGame(null);
  };

  // Handle bounty arrest
  const handleArrest = (bounty: Bounty) => {
    setSelectedBounty(bounty);
  };

  const handleConfirmArrest = async (targetId: string): Promise<boolean> => {
    if (!currentCharacter) return false;
    try {
      const result = await crimeService.arrestPlayer(currentCharacter._id, targetId);
      await loadBounties(); // Reload bounties after arrest
      return result.success;
    } catch (error) {
      logger.error('Failed to arrest player', error as Error, { context: 'Crimes.handleConfirmArrest', targetId, characterId: currentCharacter._id });
      return false;
    }
  };

  // Handle bail payment
  const handlePayBail = async () => {
    if (!currentCharacter) return;
    try {
      await payBail?.(currentCharacter._id);
      await loadCrimeStatus?.(currentCharacter._id);
    } catch (error) {
      logger.error('Failed to pay bail', error as Error, { context: 'Crimes.handlePayBail', characterId: currentCharacter._id });
    }
  };

  // Handle jail expiration
  const handleJailExpired = () => {
    if (!currentCharacter) return;
    loadCrimeStatus?.(currentCharacter._id);
  };

  // Handle lay low
  const handleLayLow = async (useGold: boolean) => {
    if (!currentCharacter) return;
    try {
      await layLow?.(currentCharacter._id, useGold);
      await loadCrimeStatus?.(currentCharacter._id);
      setShowWantedPoster(false);
    } catch (error) {
      logger.error('Failed to lay low', error as Error, { context: 'Crimes.handleLayLow', useGold, characterId: currentCharacter._id });
    }
  };

  if (!currentCharacter) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-western text-wood-dark mb-4">No Character Selected</h2>
          <p className="text-wood-medium">Please select a character to view crimes.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Jail Screen Overlay */}
      <JailScreen
        isJailed={crime?.isJailed || false}
        jailedUntil={crime?.jailedUntil ? new Date(crime.jailedUntil) : null}
        bailCost={crime?.bailCost || 0}
        currentGold={currentCharacter.gold || 0}
        offense={crime?.offense || 'Unknown'}
        onPayBail={handlePayBail}
        onJailExpired={handleJailExpired}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-5xl font-western text-blood-red mb-2">Criminal Activities</h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-wood-medium">Character:</span>
                <span className="text-xl font-bold text-wood-dark">{currentCharacter.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-wood-medium">Energy:</span>
                <span className="text-xl font-bold text-gold-medium">
                  {currentCharacter.energy} / {currentCharacter.maxEnergy} ⚡
                </span>
              </div>
            </div>
          </div>

          {/* Wanted Level Display */}
          {crime && crime.wantedLevel > 0 && (
            <WantedLevelDisplay
              wantedLevel={crime.wantedLevel}
              bountyAmount={crime.bountyAmount}
              onClick={() => setShowWantedPoster(true)}
            />
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b-2 border-wood-medium">
          <button
            onClick={() => setActiveTab('crimes')}
            className={`px-6 py-3 font-western text-lg transition-all ${
              activeTab === 'crimes'
                ? 'text-blood-red border-b-4 border-blood-red'
                : 'text-wood-medium hover:text-wood-dark'
            }`}
          >
            Available Crimes
          </button>
          <button
            onClick={() => setActiveTab('bounties')}
            className={`px-6 py-3 font-western text-lg transition-all ${
              activeTab === 'bounties'
                ? 'text-blood-red border-b-4 border-blood-red'
                : 'text-wood-medium hover:text-wood-dark'
            }`}
          >
            Bounty Board
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-western text-lg transition-all ${
              activeTab === 'history'
                ? 'text-blood-red border-b-4 border-blood-red'
                : 'text-wood-medium hover:text-wood-dark'
            }`}
          >
            Crime History
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'crimes' && (
          <CrimesList
            actions={actions}
            currentEnergy={currentCharacter.energy}
            wantedLevel={crime?.wantedLevel || 0}
            crimeMetadata={{} as any}
            onAttempt={handleAttemptCrime}
            isLoading={isLoading}
            criminalSkills={criminalSkills as any}
          />
        )}

        {activeTab === 'bounties' && (
          <BountyBoard
            bounties={bounties}
            onArrest={handleArrest}
            isLoading={false}
          />
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-western text-wood-dark mb-4">Your Criminal Record</h2>

            {(!crime?.recentCrimes || crime.recentCrimes.length === 0) ? (
              <div className="text-center py-12 parchment p-8 rounded-lg border-2 border-wood-medium">
                <div className="text-4xl mb-4">🤠</div>
                <p className="text-wood-medium text-lg">
                  Clean record... for now
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {crime.recentCrimes.map((record, index) => (
                  <div
                    key={index}
                    className="parchment p-4 rounded-lg border-2 border-wood-medium"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🔫</span>
                          <div>
                            <div className="font-western text-lg text-wood-dark">
                              {record.name}
                            </div>
                            <div className="text-sm text-wood-grain">
                              {new Date(record.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wanted Poster Modal */}
      <WantedPosterModal
        isOpen={showWantedPoster}
        onClose={() => setShowWantedPoster(false)}
        characterName={currentCharacter.name}
        wantedLevel={crime?.wantedLevel || 0}
        bountyAmount={crime?.bountyAmount || 0}
        timeUntilDecay={1000 * 60 * 60 * 18} // 18 hours
        recentCrimes={crime?.recentCrimes || []}
        currentGold={currentCharacter.gold || 0}
        onLayLow={handleLayLow}
      />

      {/* Arrest Modal */}
      {selectedBounty && (
        <ArrestModal
          isOpen={!!selectedBounty}
          onClose={() => setSelectedBounty(null)}
          target={selectedBounty ? {
            characterId: selectedBounty.characterId,
            characterName: selectedBounty.characterName,
            wantedLevel: selectedBounty.wantedLevel,
            bountyAmount: selectedBounty.bountyAmount,
            recentCrimes: selectedBounty.recentCrimes,
          } : null}
          onConfirm={handleConfirmArrest}
        />
      )}

      {/* Deck Game Modal - Shows Destiny Deck card game */}
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
    </>
  );
};

export default Crimes;
