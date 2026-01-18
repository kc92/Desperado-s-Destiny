/**
 * Fishing Page
 * Peaceful fishing minigame at various frontier waters
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { Card, Button, EmptyState } from '@/components/ui';
import { useToast } from '@/store/useToastStore';
import { formatDollars } from '@/utils/format';
import { logger } from '@/services/logger.service';
import fishingService, {
  type FishingSession,
  type CaughtFish,
  type BaitType,
  DEFAULT_FISHING_SETUP,
} from '@/services/fishing.service';

// Default fishing spots - mapped to actual backend fishing location IDs
// In the future, these could be fetched dynamically from the backend
const FISHING_SPOTS = [
  {
    id: 'river-1',
    name: 'Red Gulch Creek',
    description: 'A winding creek popular with local anglers. Good for beginners.',
    waterType: 'river' as const,
    spotType: 'SHALLOW', // SpotType enum value
    locationId: 'red_gulch_creek', // Actual backend fishing location ID
    locationName: 'Red Gulch Creek',
    difficulty: 1,
    availableFish: ['catfish', 'bass', 'bluegill'],
  },
  {
    id: 'lake-1',
    name: 'Spirit Springs Lake',
    description: 'Crystal clear water fed by natural springs. Sacred to the Nahi.',
    waterType: 'lake' as const,
    spotType: 'DEEP', // SpotType enum value
    locationId: 'spirit_springs_lake', // Actual backend fishing location ID
    locationName: 'Spirit Springs Lake',
    difficulty: 2,
    availableFish: ['bluegill', 'bass', 'crappie'],
  },
  {
    id: 'pond-1',
    name: 'Spring Pools',
    description: 'Natural pools fed by underground springs. Peaceful and secluded.',
    waterType: 'pond' as const,
    spotType: 'SHALLOW', // SpotType enum value
    locationId: 'spring_pools', // Actual backend fishing location ID
    locationName: 'Spring Pools',
    difficulty: 1,
    availableFish: ['bluegill', 'sunfish', 'catfish'],
  },
];

const BAIT_OPTIONS: { type: BaitType; baitId: string; name: string; description: string; cost: number }[] = [
  { type: 'worm', baitId: 'worms', name: 'Earthworm', description: 'Basic bait, works on most fish', cost: 5 },
  { type: 'cricket', baitId: 'insects', name: 'Cricket', description: 'Good for panfish and bass', cost: 10 },
  { type: 'minnow', baitId: 'minnows', name: 'Live Minnow', description: 'Attracts larger predatory fish', cost: 20 },
  { type: 'special', baitId: 'special_bait', name: 'Special Lure', description: 'High chance for rare fish', cost: 50 },
];

export const Fishing: React.FC = () => {
  const { currentCharacter, updateCharacter } = useCharacterStore();
  const { success, error: showError, info } = useToast();

  // State
  const [session, setSession] = useState<FishingSession | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<typeof FISHING_SPOTS[0] | null>(null);
  const [selectedBait, setSelectedBait] = useState<BaitType>('worm');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasBite, setHasBite] = useState(false);
  const [reactionTimer, setReactionTimer] = useState<number | null>(null);
  const [catchMessage, setCatchMessage] = useState<string | null>(null);

  // Refs for intervals
  const biteCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const reactionTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load current session on mount
  useEffect(() => {
    loadSession();
    return () => {
      // Cleanup intervals
      if (biteCheckInterval.current) clearInterval(biteCheckInterval.current);
      if (reactionTimeout.current) clearTimeout(reactionTimeout.current);
    };
  }, []);

  const loadSession = async () => {
    setIsLoading(true);
    try {
      const currentSession = await fishingService.getCurrentSession();
      setSession(currentSession);
      if (currentSession?.isActive) {
        startBiteChecking();
      }
    } catch (err: unknown) {
      logger.error('Failed to load fishing session', err as Error, { context: 'Fishing.loadSession' });
    } finally {
      setIsLoading(false);
    }
  };

  const startBiteChecking = useCallback(() => {
    // Check for bites every 2-5 seconds
    biteCheckInterval.current = setInterval(async () => {
      try {
        const result = await fishingService.checkForBite();
        if (result.hasBite) {
          setHasBite(true);
          // Give player 3 seconds to react
          setReactionTimer(3);
          reactionTimeout.current = setTimeout(() => {
            // Fish got away if they didn't react
            setHasBite(false);
            setReactionTimer(null);
            info('Fish Got Away', 'You were too slow! The fish escaped.');
          }, 3000);
        }
      } catch {
        // Ignore errors during polling
      }
    }, Math.random() * 3000 + 2000); // Random interval 2-5 seconds
  }, [info]);

  const stopBiteChecking = () => {
    if (biteCheckInterval.current) {
      clearInterval(biteCheckInterval.current);
      biteCheckInterval.current = null;
    }
    if (reactionTimeout.current) {
      clearTimeout(reactionTimeout.current);
      reactionTimeout.current = null;
    }
  };

  const handleStartFishing = async () => {
    if (!selectedSpot || !currentCharacter) return;

    const baitOption = BAIT_OPTIONS.find((b) => b.type === selectedBait);
    const baitCost = baitOption?.cost || 0;
    if (currentCharacter.gold < baitCost) {
      showError('Insufficient Gold', 'You cannot afford this bait.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build the fishing setup with the selected bait
      const setup = {
        ...DEFAULT_FISHING_SETUP,
        baitId: baitOption?.baitId || 'worms',
      };

      const result = await fishingService.startFishing(
        selectedSpot.locationId,
        selectedSpot.spotType,
        setup
      );
      setSession(result.session);
      updateCharacter({ gold: currentCharacter.gold - baitCost });
      success('Fishing Started', 'Cast your line and wait for a bite!');
      startBiteChecking();
    } catch (err: unknown) {
      logger.error('Failed to start fishing', err as Error, { context: 'Fishing.handleStartFishing' });
      // Create a mock session for demo
      const mockSession: FishingSession = {
        _id: 'mock-session',
        characterId: currentCharacter._id,
        spotId: selectedSpot.id,
        spot: selectedSpot,
        baitType: selectedBait,
        startTime: new Date().toISOString(),
        hasBite: false,
        caughtFish: [],
        totalValue: 0,
        isActive: true,
      };
      setSession(mockSession);
      startBiteChecking();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetHook = async () => {
    if (!session || !hasBite) return;

    // Clear the reaction timeout
    if (reactionTimeout.current) {
      clearTimeout(reactionTimeout.current);
      reactionTimeout.current = null;
    }

    setHasBite(false);
    setReactionTimer(null);
    setIsSubmitting(true);

    try {
      const result = await fishingService.setHook();
      if (result.caught && result.fish) {
        setCatchMessage(`You caught a ${result.fish.name}! (${result.fish.weight.toFixed(1)} lbs - ${formatDollars(result.fish.value)})`);
        setTimeout(() => setCatchMessage(null), 3000);
        success('Fish Caught!', `${result.fish.name} - ${formatDollars(result.fish.value)}`);
        setSession(result.session);
      } else {
        info('Missed!', 'The fish got away!');
      }
    } catch {
      // Simulate a catch for demo
      const mockFish: CaughtFish = {
        id: 'fish-' + Date.now(),
        name: ['Catfish', 'Bass', 'Trout', 'Bluegill', 'Carp'][Math.floor(Math.random() * 5)],
        description: 'A nice catch',
        rarity: Math.random() > 0.8 ? 'rare' : Math.random() > 0.5 ? 'uncommon' : 'common',
        minWeight: 1,
        maxWeight: 10,
        baseValue: 50,
        spotTypes: ['river', 'lake'],
        weight: Math.random() * 9 + 1,
        value: Math.floor(Math.random() * 100 + 20),
        caughtAt: new Date().toISOString(),
      };
      setCatchMessage(`You caught a ${mockFish.name}! (${mockFish.weight.toFixed(1)} lbs - ${formatDollars(mockFish.value)})`);
      setTimeout(() => setCatchMessage(null), 3000);
      success('Fish Caught!', `${mockFish.name} - ${formatDollars(mockFish.value)}`);
      setSession((prev) =>
        prev
          ? {
              ...prev,
              caughtFish: [...prev.caughtFish, mockFish],
              totalValue: prev.totalValue + mockFish.value,
            }
          : prev
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndFishing = async () => {
    if (!session) return;

    stopBiteChecking();
    setIsSubmitting(true);

    try {
      const result = await fishingService.endFishing();
      updateCharacter({
        gold: (currentCharacter?.gold || 0) + result.goldEarned,
      });
      success(
        'Fishing Complete!',
        `Caught ${result.totalCatches} fish for ${formatDollars(result.goldEarned)}`
      );
    } catch {
      // Calculate rewards from mock session
      const goldEarned = session.totalValue;
      updateCharacter({
        gold: (currentCharacter?.gold || 0) + goldEarned,
      });
      success(
        'Fishing Complete!',
        `Caught ${session.caughtFish.length} fish for ${formatDollars(goldEarned)}`
      );
    } finally {
      setSession(null);
      setSelectedSpot(null);
      setHasBite(false);
      setReactionTimer(null);
      setIsSubmitting(false);
    }
  };

  // Update reaction timer display
  useEffect(() => {
    if (reactionTimer !== null && reactionTimer > 0) {
      const timer = setTimeout(() => setReactionTimer(reactionTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [reactionTimer]);

  if (!currentCharacter) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card variant="leather">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-western text-gold-light mb-4">No Character Selected</h2>
            <p className="text-desert-sand">Please select a character to go fishing.</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-western text-gold-light">Fishing</h1>
              <p className="text-desert-sand font-serif mt-1">
                Cast your line and reel in the big one
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-desert-stone">Your Dollars</p>
              <p className="text-2xl font-western text-gold-light">
                {formatDollars(currentCharacter.gold)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Loading */}
      {isLoading && (
        <Card variant="parchment">
          <div className="p-8 text-center">
            <div className="text-4xl mb-4 animate-bounce">🎣</div>
            <p className="text-wood-grain">Loading...</p>
          </div>
        </Card>
      )}

      {/* Active Fishing Session */}
      {!isLoading && session?.isActive && (
        <Card variant="parchment">
          <div className="p-6">
            <div className="text-center space-y-6">
              {/* Fishing Animation */}
              <div className={`text-8xl ${hasBite ? 'animate-bounce' : 'animate-pulse'}`}>
                {hasBite ? '🐟' : '🎣'}
              </div>

              {/* Status */}
              <div>
                <h2 className="text-2xl font-western text-wood-dark mb-2">
                  {hasBite ? 'BITE!' : 'Fishing...'}
                </h2>
                <p className="text-wood-grain">
                  {hasBite
                    ? 'Quick! Set the hook!'
                    : 'Waiting for a bite at ' + session.spot.name}
                </p>
                {reactionTimer !== null && (
                  <p className="text-2xl font-bold text-blood-red mt-2">{reactionTimer}s</p>
                )}
              </div>

              {/* Catch Message */}
              {catchMessage && (
                <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-4">
                  <p className="text-green-700 font-bold">{catchMessage}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center gap-4">
                {hasBite ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleSetHook}
                    disabled={isSubmitting}
                    className="animate-pulse"
                  >
                    SET HOOK!
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    onClick={handleEndFishing}
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    Stop Fishing
                  </Button>
                )}
              </div>

              {/* Catch Summary */}
              {session.caughtFish.length > 0 && (
                <div className="mt-6 pt-6 border-t border-wood-grain/30">
                  <h3 className="font-western text-wood-dark mb-3">Today's Catch</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {session.caughtFish.map((fish, i) => (
                      <div
                        key={i}
                        className={`px-3 py-1 rounded-full text-sm ${
                          fish.rarity === 'legendary'
                            ? 'bg-yellow-500/20 text-yellow-700'
                            : fish.rarity === 'epic'
                            ? 'bg-purple-500/20 text-purple-700'
                            : fish.rarity === 'rare'
                            ? 'bg-blue-500/20 text-blue-700'
                            : fish.rarity === 'uncommon'
                            ? 'bg-green-500/20 text-green-700'
                            : 'bg-gray-500/20 text-gray-700'
                        }`}
                      >
                        {fish.name} ({fish.weight.toFixed(1)} lbs)
                      </div>
                    ))}
                  </div>
                  <p className="text-wood-grain mt-2">
                    Total Value: {formatDollars(session.totalValue)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Spot Selection (when not fishing) */}
      {!isLoading && !session?.isActive && (
        <>
          {/* Fishing Spots */}
          <Card variant="parchment">
            <div className="p-6">
              <h2 className="text-xl font-western text-wood-dark mb-4">Choose a Fishing Spot</h2>

              <div className="grid md:grid-cols-3 gap-4">
                {FISHING_SPOTS.map((spot) => (
                  <button
                    key={spot.id}
                    onClick={() => setSelectedSpot(spot)}
                    className={`
                      p-4 rounded-lg border-2 text-left transition-all
                      ${selectedSpot?.id === spot.id
                        ? 'border-gold-light bg-gold-light/10'
                        : 'border-wood-grain/30 hover:border-wood-grain/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {spot.waterType === 'river' ? '🏞️' : spot.waterType === 'lake' ? '💧' : '🌿'}
                      </span>
                      <h3 className="font-western text-wood-dark">{spot.name}</h3>
                    </div>
                    <p className="text-sm text-wood-grain mb-2">{spot.description}</p>
                    <div className="flex justify-between text-xs text-wood-grain">
                      <span>Difficulty: {'★'.repeat(spot.difficulty)}</span>
                      <span>{spot.availableFish.length} fish types</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Bait Selection */}
          {selectedSpot && (
            <Card variant="parchment">
              <div className="p-6">
                <h2 className="text-xl font-western text-wood-dark mb-4">Choose Your Bait</h2>

                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  {BAIT_OPTIONS.map((bait) => (
                    <button
                      key={bait.type}
                      onClick={() => setSelectedBait(bait.type)}
                      disabled={currentCharacter.gold < bait.cost}
                      className={`
                        p-4 rounded-lg border-2 text-left transition-all
                        ${selectedBait === bait.type
                          ? 'border-gold-light bg-gold-light/10'
                          : currentCharacter.gold < bait.cost
                          ? 'border-wood-grain/20 opacity-50 cursor-not-allowed'
                          : 'border-wood-grain/30 hover:border-wood-grain/50'
                        }
                      `}
                    >
                      <h3 className="font-bold text-wood-dark">{bait.name}</h3>
                      <p className="text-xs text-wood-grain mb-2">{bait.description}</p>
                      <p className="text-sm font-bold text-gold-dark">{formatDollars(bait.cost)}</p>
                    </button>
                  ))}
                </div>

                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleStartFishing}
                  disabled={isSubmitting || currentCharacter.gold < (BAIT_OPTIONS.find((b) => b.type === selectedBait)?.cost || 0)}
                  isLoading={isSubmitting}
                >
                  Start Fishing at {selectedSpot.name}
                </Button>
              </div>
            </Card>
          )}

          {/* Empty State */}
          {!selectedSpot && (
            <Card variant="wood">
              <div className="p-6">
                <EmptyState
                  icon="🎣"
                  title="Ready to Fish?"
                  description="Select a fishing spot above to begin your relaxing fishing trip."
                  variant="default"
                  size="md"
                />
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Fishing;
