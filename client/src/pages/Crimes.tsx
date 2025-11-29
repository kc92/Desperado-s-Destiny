/**
 * Crimes Page
 * Main interface for criminal activities, bounty hunting, and crime history
 * Features: Tabbed interface, JailScreen overlay, WantedLevelDisplay
 */

import React, { useEffect, useState } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useActionStore } from '@/store/useActionStore';
import { useCrimeStore } from '@/store/useCrimeStore';
import { WantedLevelDisplay } from '@/components/game/WantedLevelDisplay';
import { WantedPosterModal } from '@/components/game/WantedPosterModal';
import { CrimesList } from '@/components/game/CrimesList';
import { BountyBoard, type Bounty } from '@/components/game/BountyBoard';
import { ArrestModal } from '@/components/game/ArrestModal';
import { JailScreen } from '@/components/game/JailScreen';
// import { LoadingSpinner } from '@/components/ui';
// import { ActionType } from '@desperados/shared';
import { crimeService } from '@/services/crime.service';

type TabType = 'crimes' | 'bounties' | 'history';

/**
 * Main crimes interface page
 */
export const Crimes: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const { actions, fetchActions, attemptAction, isLoading: isActionLoading } = useActionStore();
  const { crime, loadCrimeStatus, payBail, layLow, isLoading: isCrimeLoading } = useCrimeStore();

  const isLoading = isActionLoading || isCrimeLoading;

  const [activeTab, setActiveTab] = useState<TabType>('crimes');
  const [showWantedPoster, setShowWantedPoster] = useState(false);
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [_isLoadingBounties, setIsLoadingBounties] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (currentCharacter) {
      fetchActions(currentCharacter.currentLocation);
      loadCrimeStatus?.();
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
      console.error('Failed to load bounties:', error);
    } finally {
      setIsLoadingBounties(false);
    }
  };

  // Handle crime attempt
  const handleAttemptCrime = async (action: any) => {
    if (!currentCharacter) return;
    try {
      await attemptAction(action._id);
      // Reload crime status after action
      await loadCrimeStatus?.();
    } catch (error) {
      console.error('Failed to attempt crime:', error);
    }
  };

  // Handle bounty arrest
  const handleArrest = (bounty: Bounty) => {
    setSelectedBounty(bounty);
  };

  const handleConfirmArrest = async (targetId: string): Promise<boolean> => {
    try {
      const result = await crimeService.arrestPlayer(targetId);
      await loadBounties(); // Reload bounties after arrest
      return result.success;
    } catch (error) {
      console.error('Failed to arrest player:', error);
      return false;
    }
  };

  // Handle bail payment
  const handlePayBail = async () => {
    try {
      await payBail?.();
      await loadCrimeStatus?.();
    } catch (error) {
      console.error('Failed to pay bail:', error);
    }
  };

  // Handle jail expiration
  const handleJailExpired = () => {
    loadCrimeStatus?.();
  };

  // Handle lay low
  const handleLayLow = async (useGold: boolean) => {
    try {
      await layLow?.(useGold);
      await loadCrimeStatus?.();
      setShowWantedPoster(false);
    } catch (error) {
      console.error('Failed to lay low:', error);
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
        jailedUntil={crime?.jailedUntil || null}
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
    </>
  );
};

export default Crimes;
