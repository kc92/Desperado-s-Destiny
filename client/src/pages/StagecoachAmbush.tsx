/**
 * Stagecoach Ambush Page
 * Plan and execute stagecoach ambushes
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useTransportStore } from '@/store/useTransportStore';
import { Card, Button, Modal, EmptyState } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/store/useToastStore';
import { formatDollars } from '@/utils/format';
import { logger } from '@/services/logger.service';
import {
  stagecoachService,
  type StagecoachRoute,
  type AmbushSpot,
  type AmbushResult,
} from '@/services/stagecoach.service';

type TabType = 'select' | 'plan' | 'execute';

type AmbushStrategy = 'roadblock' | 'canyon_trap' | 'bridge_sabotage' | 'surprise_attack';

export const StagecoachAmbush: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const {
    stagecoachRoutes,
    ambushSpots,
    ambushPlan,
    error: storeError,
    loadStagecoachData,
    loadAmbushSpots,
    loadActivePlan,
    setupAmbush,
    executeAmbush,
    cancelAmbush,
    clearError,
  } = useTransportStore();
  const { success, error: showError } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('select');
  const [isLoading, setIsLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  // Selection state
  const [selectedRoute, setSelectedRoute] = useState<StagecoachRoute | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<AmbushSpot | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<AmbushStrategy>('surprise_attack');

  // Execution state
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [ambushResult, setAmbushResult] = useState<AmbushResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (storeError) {
      setLocalError(storeError);
    }
  }, [storeError]);

  useEffect(() => {
    if (selectedRoute) {
      loadAmbushSpots(selectedRoute.id);
    }
  }, [selectedRoute]);

  const loadData = async () => {
    setIsLoading(true);
    setLocalError(null);
    try {
      await Promise.all([
        loadStagecoachData(),
        loadActivePlan(),
      ]);
    } catch (err: unknown) {
      logger.error('Failed to load ambush data', err as Error, { context: 'StagecoachAmbush.loadData' });
      setLocalError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupAmbush = async () => {
    if (!selectedRoute || !selectedSpot) return;

    // Check if character is jailed
    if (currentCharacter?.isJailed) {
      showError('Jailed', 'You cannot plan an ambush while in jail.');
      return;
    }

    setIsSettingUp(true);
    try {
      const scheduledTime = new Date(Date.now() + stagecoachService.getStrategySetupTime(selectedStrategy) * 60 * 1000);

      const plan = await setupAmbush(
        selectedRoute.id,
        selectedSpot.id,
        scheduledTime,
        [currentCharacter?._id?.toString() || ''], // Solo for now
        selectedStrategy
      );

      if (plan) {
        success('Ambush Planned!', `Setup time: ${stagecoachService.getStrategySetupTime(selectedStrategy)} minutes`);
        setActiveTab('execute');
      } else {
        showError('Planning Failed', 'Unable to setup ambush.');
      }
    } catch (err: unknown) {
      logger.error('Setup failed', err as Error, { context: 'StagecoachAmbush.handleSetupAmbush' });
      showError('Setup Failed', 'Unable to setup ambush.');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleExecuteAmbush = async () => {
    if (!ambushPlan) return;

    // Note: In a real implementation, we'd need a stagecoach ID
    // For now, using a placeholder
    setIsExecuting(true);
    try {
      const result = await executeAmbush('stagecoach_target');
      if (result && result.result) {
        setAmbushResult(result.result);
        setShowResultModal(true);
        if (result.success) {
          success('Ambush Successful!', `Loot: ${formatDollars(result.result.goldGained)}`);
        } else {
          showError('Ambush Failed', 'The ambush did not go as planned.');
        }
        await loadActivePlan();
      }
    } catch (err: unknown) {
      logger.error('Execution failed', err as Error, { context: 'StagecoachAmbush.handleExecuteAmbush' });
      showError('Execution Failed', 'Unable to execute ambush.');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCancelAmbush = async () => {
    try {
      const cancelled = await cancelAmbush();
      if (cancelled) {
        success('Ambush Cancelled', 'Your ambush plan has been abandoned.');
        setActiveTab('select');
      } else {
        showError('Cancel Failed', 'Unable to cancel ambush.');
      }
    } catch (err: unknown) {
      logger.error('Cancel failed', err as Error, { context: 'StagecoachAmbush.handleCancelAmbush' });
      showError('Cancel Failed', 'Unable to cancel ambush.');
    }
  };

  const getStrategyInfo = (strategy: AmbushStrategy): { name: string; setupTime: number; description: string } => {
    const strategies: Record<AmbushStrategy, { name: string; setupTime: number; description: string }> = {
      roadblock: {
        name: 'Road Block',
        setupTime: 30,
        description: 'Block the road with debris or a wagon. Forces the stagecoach to stop.',
      },
      canyon_trap: {
        name: 'Canyon Trap',
        setupTime: 45,
        description: 'Use the canyon walls to trap the stagecoach. Excellent cover but risky.',
      },
      bridge_sabotage: {
        name: 'Bridge Sabotage',
        setupTime: 60,
        description: 'Weaken or block a bridge. High risk but stops them completely.',
      },
      surprise_attack: {
        name: 'Surprise Attack',
        setupTime: 20,
        description: 'Quick ambush with minimal preparation. Relies on speed and surprise.',
      },
    };
    return strategies[strategy];
  };

  const estimateSuccessChance = (): number => {
    if (!selectedSpot) return 0;

    // Simplified estimation
    const characterLevel = currentCharacter?.level || 1;
    return stagecoachService.estimateSuccessChance(
      selectedSpot.coverQuality,
      [characterLevel],
      selectedRoute?.dangerLevel || 5,
      selectedSpot.locationType
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card variant="parchment" className="p-6">
          <h1 className="text-2xl font-western text-blood-red mb-2">Stagecoach Ambush</h1>
          <p className="text-gray-400">Loading ambush data...</p>
        </Card>
        <CardGridSkeleton count={2} columns={1} />
      </div>
    );
  }

  // Error state
  if (localError) {
    return (
      <div className="space-y-6">
        <Card variant="parchment" className="p-6">
          <h1 className="text-2xl font-western text-blood-red mb-2">Stagecoach Ambush</h1>
        </Card>
        <EmptyState
          icon="alert"
          title="Error Loading Data"
          description={localError}
          action={{
            label: 'Try Again',
            onClick: () => {
              clearError();
              loadData();
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="parchment" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-western text-blood-red mb-1">Stagecoach Ambush</h1>
            <p className="text-gray-400 text-sm">
              Plan and execute daring stagecoach robberies
            </p>
          </div>
          <Link to="/game/stagecoach">
            <Button variant="ghost">← Back to Depot</Button>
          </Link>
        </div>

        {/* Active Plan Alert */}
        {ambushPlan && (
          <div className="mt-4 p-3 bg-blood-red/30 border border-blood-red rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-blood-red">⚔️</span>
              <span className="text-blood-red font-bold">Ambush in Progress!</span>
            </div>
            <p className="text-sm text-red-300 mt-1">
              Strategy: {stagecoachService.getStrategyName(ambushPlan.strategy)} |
              Status: {ambushPlan.status}
            </p>
          </div>
        )}
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-blood-red/30 pb-2">
        {(['select', 'plan', 'execute'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg font-western transition-colors ${
              activeTab === tab
                ? 'bg-blood-red/30 text-blood-red border border-b-0 border-blood-red/50'
                : 'text-gray-400 hover:text-blood-red hover:bg-blood-red/10'
            }`}
          >
            {tab === 'select' && '🗺️ Select Target'}
            {tab === 'plan' && '📋 Plan Ambush'}
            {tab === 'execute' && `⚔️ Execute ${ambushPlan ? '!' : ''}`}
          </button>
        ))}
      </div>

      {/* Select Tab */}
      {activeTab === 'select' && (
        <div className="space-y-4">
          <h2 className="text-xl font-western text-blood-red">Select Target Route</h2>

          <div className="grid gap-4">
            {stagecoachRoutes.filter(r => r.isActive).map((route) => (
              <Card
                key={route.id}
                variant="wood"
                className={`p-4 cursor-pointer transition-all ${
                  selectedRoute?.id === route.id
                    ? 'ring-2 ring-blood-red'
                    : 'hover:ring-1 hover:ring-blood-red/50'
                }`}
                onClick={() => {
                  setSelectedRoute(route);
                  setSelectedSpot(null);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-western text-amber-400">{route.name}</h3>
                    <p className="text-sm text-gray-400">{route.description}</p>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="text-gray-400">
                        Distance: {stagecoachService.formatDistance(route.totalDistance)}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-400">
                        Duration: {stagecoachService.formatDuration(route.baseDuration)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${stagecoachService.getDangerColor(route.dangerLevel)}`}>
                      Danger: {route.dangerLevel}/10
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {stagecoachService.getDangerName(route.dangerLevel)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Ambush Spots for Selected Route */}
          {selectedRoute && (
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-western text-amber-400">Ambush Locations on {selectedRoute.name}</h3>

              {ambushSpots.length === 0 ? (
                <EmptyState
                  icon="map"
                  title="Loading Ambush Spots"
                  description="Searching for suitable ambush locations..."
                />
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {ambushSpots.map((spot) => (
                    <Card
                      key={spot.id}
                      variant="leather"
                      className={`p-4 cursor-pointer transition-all ${
                        selectedSpot?.id === spot.id
                          ? 'ring-2 ring-blood-red'
                          : 'hover:ring-1 hover:ring-blood-red/50'
                      }`}
                      onClick={() => setSelectedSpot(spot)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-2xl">{stagecoachService.getLocationTypeIcon(spot.locationType)}</span>
                        <div className="flex-1">
                          <h4 className="font-western text-amber-400">{spot.name}</h4>
                          <p className="text-xs text-gray-400">{spot.description}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                            <div>
                              <span className="text-gray-400">Cover:</span>{' '}
                              <span className={spot.coverQuality >= 7 ? 'text-green-400' : spot.coverQuality >= 4 ? 'text-yellow-400' : 'text-red-400'}>
                                {stagecoachService.getCoverQualityDescription(spot.coverQuality)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Escapes:</span>{' '}
                              <span className="text-white">{spot.escapeRoutes}</span>
                            </div>
                          </div>
                          {spot.terrainAdvantages && spot.terrainAdvantages.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {spot.terrainAdvantages.map((adv, idx) => (
                                <span key={idx} className="text-xs bg-green-900/30 text-green-400 px-1 rounded">
                                  +{adv}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {selectedSpot && (
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => setActiveTab('plan')}
                >
                  Plan Ambush at {selectedSpot.name} →
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Plan Tab */}
      {activeTab === 'plan' && (
        <div className="space-y-4">
          <h2 className="text-xl font-western text-blood-red">Plan Ambush</h2>

          {!selectedRoute || !selectedSpot ? (
            <EmptyState
              icon="target"
              title="No Location Selected"
              description="Select a route and ambush spot first."
              action={{
                label: 'Select Target',
                onClick: () => setActiveTab('select'),
              }}
            />
          ) : (
            <>
              {/* Selected Location Summary */}
              <Card variant="wood" className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{stagecoachService.getLocationTypeIcon(selectedSpot.locationType)}</span>
                  <div>
                    <h3 className="font-western text-amber-400">{selectedSpot.name}</h3>
                    <p className="text-sm text-gray-400">on {selectedRoute.name}</p>
                  </div>
                </div>
              </Card>

              {/* Strategy Selection */}
              <div>
                <h3 className="text-lg font-western text-amber-400 mb-3">Choose Strategy</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {(['roadblock', 'canyon_trap', 'bridge_sabotage', 'surprise_attack'] as AmbushStrategy[]).map((strategy) => {
                    const info = getStrategyInfo(strategy);
                    return (
                      <Card
                        key={strategy}
                        variant="leather"
                        className={`p-4 cursor-pointer transition-all ${
                          selectedStrategy === strategy
                            ? 'ring-2 ring-blood-red'
                            : 'hover:ring-1 hover:ring-blood-red/50'
                        }`}
                        onClick={() => setSelectedStrategy(strategy)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-western text-amber-400">{info.name}</h4>
                          <span className="text-xs text-gray-400">{info.setupTime} min setup</span>
                        </div>
                        <p className="text-xs text-gray-400">{info.description}</p>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Success Estimate */}
              <Card variant="leather" className="p-4">
                <h3 className="font-western text-amber-400 mb-3">Estimated Success</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="w-full bg-wood-darker rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all ${
                          estimateSuccessChance() >= 70 ? 'bg-green-500' :
                          estimateSuccessChance() >= 50 ? 'bg-yellow-500' :
                          estimateSuccessChance() >= 30 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${estimateSuccessChance()}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-xl font-bold ${
                    estimateSuccessChance() >= 70 ? 'text-green-400' :
                    estimateSuccessChance() >= 50 ? 'text-yellow-400' :
                    estimateSuccessChance() >= 30 ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {estimateSuccessChance()}%
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Based on cover quality, terrain advantages, and route danger level
                </p>
              </Card>

              {/* Setup Button */}
              <Button
                variant="danger"
                className="w-full"
                onClick={handleSetupAmbush}
                disabled={isSettingUp}
              >
                {isSettingUp ? 'Setting Up...' : `Setup Ambush (${stagecoachService.getStrategySetupTime(selectedStrategy)} min)`}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Execute Tab */}
      {activeTab === 'execute' && (
        <div className="space-y-4">
          <h2 className="text-xl font-western text-blood-red">Execute Ambush</h2>

          {!ambushPlan ? (
            <EmptyState
              icon="target"
              title="No Active Ambush"
              description="Plan an ambush first."
              action={{
                label: 'Plan Ambush',
                onClick: () => setActiveTab('select'),
              }}
            />
          ) : (
            <Card variant="leather" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">⚔️</span>
                <div>
                  <h3 className="font-western text-blood-red text-lg">
                    {stagecoachService.getStrategyName(ambushPlan.strategy)}
                  </h3>
                  <span className={`text-sm px-2 py-0.5 rounded ${
                    ambushPlan.status === 'ready' ? 'bg-green-900/50 text-green-400' :
                    ambushPlan.status === 'setup' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-gray-900/50 text-gray-400'
                  }`}>
                    {ambushPlan.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-wood-darker p-3 rounded">
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white">{ambushPlan.ambushSpotId}</p>
                </div>
                <div className="bg-wood-darker p-3 rounded">
                  <p className="text-gray-400 text-sm">Gang Size</p>
                  <p className="text-white">{ambushPlan.gangMembers?.length || 1}</p>
                </div>
              </div>

              {ambushPlan.status === 'ready' ? (
                <div className="space-y-4">
                  <div className="bg-green-900/30 p-3 rounded border border-green-700">
                    <p className="text-green-400 font-bold">Ready to Strike!</p>
                    <p className="text-sm text-green-300">
                      Your ambush is set up. Wait for a stagecoach to pass...
                    </p>
                  </div>

                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={handleExecuteAmbush}
                    disabled={isExecuting}
                  >
                    {isExecuting ? 'Executing...' : '⚔️ Execute Ambush!'}
                  </Button>
                </div>
              ) : ambushPlan.status === 'setup' ? (
                <div className="bg-yellow-900/30 p-3 rounded border border-yellow-700">
                  <p className="text-yellow-400 font-bold">Setting Up...</p>
                  <p className="text-sm text-yellow-300">
                    Your ambush is being prepared. Wait for setup to complete.
                  </p>
                </div>
              ) : (
                <div className="bg-gray-900/30 p-3 rounded border border-gray-700">
                  <p className="text-gray-400 font-bold">Status: {ambushPlan.status}</p>
                </div>
              )}

              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={handleCancelAmbush}
              >
                Cancel Ambush
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Result Modal */}
      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title={ambushResult?.success ? '🎉 Ambush Successful!' : '💀 Ambush Failed'}
        size="md"
      >
        {ambushResult && (
          <div className="space-y-4">
            {ambushResult.success ? (
              <>
                <div className="text-center py-4">
                  <p className="text-4xl mb-2">💰</p>
                  <p className="text-2xl font-western text-gold-light">
                    {formatDollars(ambushResult.goldGained)}
                  </p>
                  <p className="text-gray-400">Gold Looted</p>
                </div>

                {ambushResult.lootGained && ambushResult.lootGained.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Items Looted:</p>
                    <div className="grid gap-1">
                      {ambushResult.lootGained.map((item, idx) => (
                        <div key={idx} className="bg-wood-darker p-2 rounded text-sm flex justify-between">
                          <span className="text-white">{item.description}</span>
                          <span className="text-gold-light">{formatDollars(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blood-red/20 p-3 rounded">
                  <p className="text-blood-red font-bold mb-1">Consequences:</p>
                  <div className="text-sm text-red-300 space-y-1">
                    <p>Bounty Increase: +{formatDollars(ambushResult.bountyIncrease)}</p>
                    <p>Heat Level: {ambushResult.heatLevel}/10</p>
                    <p>Witnesses: {ambushResult.witnesses}</p>
                    {!ambushResult.escapedClean && (
                      <p className="text-yellow-400">⚠️ You were spotted during escape!</p>
                    )}
                  </div>
                </div>

                {/* Casualties */}
                {(ambushResult.casualties.guards > 0 || ambushResult.casualties.passengers > 0 || ambushResult.casualties.attackers > 0) && (
                  <div className="bg-gray-900/50 p-3 rounded">
                    <p className="text-gray-400 text-sm mb-1">Casualties:</p>
                    <div className="flex gap-4 text-sm">
                      {ambushResult.casualties.guards > 0 && (
                        <span className="text-red-400">Guards: {ambushResult.casualties.guards}</span>
                      )}
                      {ambushResult.casualties.passengers > 0 && (
                        <span className="text-orange-400">Passengers: {ambushResult.casualties.passengers}</span>
                      )}
                      {ambushResult.casualties.attackers > 0 && (
                        <span className="text-yellow-400">Your Gang: {ambushResult.casualties.attackers}</span>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-4xl mb-2">💀</p>
                <p className="text-xl text-blood-red">The ambush failed!</p>
                <p className="text-gray-400 text-sm mt-2">
                  Better luck next time, outlaw.
                </p>
              </div>
            )}

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setShowResultModal(false);
                setActiveTab('select');
              }}
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StagecoachAmbush;
