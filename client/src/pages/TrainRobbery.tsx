/**
 * Train Robbery Page
 * Plan and execute train heists
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
  trainService,
  RobberyApproach,
  RobberyPhase,
  TRAIN_CONSTANTS,
  type TrainSchedule,
  type TrainRobberyPlan,
  type RobberyIntelligence,
} from '@/services/train.service';

type TabType = 'scout' | 'plan' | 'execute' | 'pursuit';

export const TrainRobbery: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const {
    trainSchedules,
    robberyPlans,
    activePursuit,
    error: storeError,
    loadTrainData,
    loadRobberyPlans,
    loadActivePursuit,
    scoutTrain,
    planRobbery,
    executeRobbery,
    clearError,
  } = useTransportStore();
  const { success, error: showError, warning } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('scout');
  const [isLoading, setIsLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  // Scout state
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);
  const [scoutingResult, setScoutingResult] = useState<RobberyIntelligence | null>(null);
  const [isScouting, setIsScouting] = useState(false);

  // Plan state
  const [selectedApproach, setSelectedApproach] = useState<RobberyApproach | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);

  // Execute state
  const [, setSelectedPlan] = useState<TrainRobberyPlan | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [robberyResult, setRobberyResult] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (storeError) {
      setLocalError(storeError);
    }
  }, [storeError]);

  const loadData = async () => {
    setIsLoading(true);
    setLocalError(null);
    try {
      await Promise.all([
        loadTrainData(),
        loadRobberyPlans(),
        loadActivePursuit(),
      ]);
    } catch (err: unknown) {
      logger.error('Failed to load robbery data', err as Error, { context: 'TrainRobbery.loadData' });
      setLocalError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoutTrain = async () => {
    if (!selectedTrain) return;

    const train = trainSchedules.find(t => t.trainId === selectedTrain);
    if (!train) return;

    // Check cunning requirement
    const cunningSkill = currentCharacter?.skills?.find(s => s.skillId === 'cunning');
    const cunning = cunningSkill?.level || 0;
    if (cunning < TRAIN_CONSTANTS.SCOUTING.CUNNING_REQUIRED) {
      showError('Insufficient Cunning', `You need at least ${TRAIN_CONSTANTS.SCOUTING.CUNNING_REQUIRED} Cunning to scout trains.`);
      return;
    }

    // Check energy
    const energy = currentCharacter?.energy || 0;
    if (energy < TRAIN_CONSTANTS.SCOUTING.ENERGY_COST) {
      showError('Insufficient Energy', `Scouting costs ${TRAIN_CONSTANTS.SCOUTING.ENERGY_COST} energy.`);
      return;
    }

    setIsScouting(true);
    try {
      const result = await scoutTrain(selectedTrain);
      if (result && result.intelligence) {
        setScoutingResult(result.intelligence);
        success('Scouting Complete', 'You have gathered intelligence on the train.');
      } else {
        showError('Scouting Failed', 'Unable to gather intelligence.');
      }
    } catch (err: unknown) {
      logger.error('Scouting failed', err as Error, { context: 'TrainRobbery.handleScoutTrain' });
      showError('Scouting Failed', 'Unable to gather intelligence.');
    } finally {
      setIsScouting(false);
    }
  };

  const handlePlanRobbery = async () => {
    if (!selectedTrain || !selectedApproach || !scoutingResult) return;

    const train = trainSchedules.find(t => t.trainId === selectedTrain);
    if (!train) return;

    // Check gang size (solo for now - gang integration later)
    if (TRAIN_CONSTANTS.PLANNING.MIN_GANG_SIZE > 1) {
      warning('Gang Required', 'Train robbery requires a gang. Solo robbery available for testing.');
    }

    setIsPlanning(true);
    try {
      const plan = await planRobbery(
        selectedTrain,
        new Date(),
        selectedApproach,
        'Route Midpoint', // Target location
        [currentCharacter?._id?.toString() || ''], // Gang members (solo for now)
        [] // Equipment
      );

      if (plan) {
        success('Plan Created', 'Your robbery plan is ready for execution.');
        setActiveTab('execute');
        setSelectedPlan(plan);
      } else {
        showError('Planning Failed', 'Unable to create robbery plan.');
      }
    } catch (err: unknown) {
      logger.error('Planning failed', err as Error, { context: 'TrainRobbery.handlePlanRobbery' });
      showError('Planning Failed', 'Unable to create robbery plan.');
    } finally {
      setIsPlanning(false);
    }
  };

  const handleExecuteRobbery = async (planId: string) => {
    setIsExecuting(true);
    try {
      const result = await executeRobbery(planId);
      if (result) {
        setRobberyResult(result);
        setShowResultModal(true);
        if (result.success) {
          success('Robbery Successful!', `You escaped with ${formatDollars(result.result?.totalValue || 0)}!`);
        } else {
          showError('Robbery Failed', 'The robbery did not go as planned.');
        }
        await loadRobberyPlans();
        await loadActivePursuit();
      }
    } catch (err: unknown) {
      logger.error('Execution failed', err as Error, { context: 'TrainRobbery.handleExecuteRobbery' });
      showError('Execution Failed', 'Unable to execute robbery.');
    } finally {
      setIsExecuting(false);
    }
  };

  const getTrainDangerClass = (train: TrainSchedule): string => {
    const security = train.securityLevel;
    if (security <= 3) return 'text-green-400';
    if (security <= 5) return 'text-yellow-400';
    if (security <= 7) return 'text-orange-400';
    return 'text-blood-red';
  };

  const getApproachInfo = (approach: RobberyApproach): { name: string; difficulty: number; description: string } => {
    const approaches: Record<RobberyApproach, { name: string; difficulty: number; description: string }> = {
      [RobberyApproach.HORSEBACK_CHASE]: {
        name: 'Horseback Chase',
        difficulty: 1.2,
        description: 'Chase down the train on horseback. Requires good riding skills.',
      },
      [RobberyApproach.BRIDGE_BLOCK]: {
        name: 'Bridge Blockade',
        difficulty: 1.0,
        description: 'Block a bridge to force the train to stop. Standard approach.',
      },
      [RobberyApproach.INSIDE_JOB]: {
        name: 'Inside Job',
        difficulty: 0.8,
        description: 'Board as a passenger and attack from within. Easiest but risky.',
      },
      [RobberyApproach.TUNNEL_AMBUSH]: {
        name: 'Tunnel Ambush',
        difficulty: 0.9,
        description: 'Ambush the train in a tunnel. Good cover but limited escape.',
      },
      [RobberyApproach.STATION_ASSAULT]: {
        name: 'Station Assault',
        difficulty: 1.3,
        description: 'Attack at a station. Most guards but highest potential loot.',
      },
      [RobberyApproach.STEALTH_BOARDING]: {
        name: 'Stealth Boarding',
        difficulty: 1.1,
        description: 'Sneak aboard the moving train. Requires agility.',
      },
    };
    return approaches[approach];
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card variant="parchment" className="p-6">
          <h1 className="text-2xl font-western text-blood-red mb-2">Train Robbery</h1>
          <p className="text-gray-400">Loading robbery intelligence...</p>
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
          <h1 className="text-2xl font-western text-blood-red mb-2">Train Robbery</h1>
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

  const activePlans = robberyPlans.filter(p => p.phase === RobberyPhase.PLANNING);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="parchment" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-western text-blood-red mb-1">Train Robbery</h1>
            <p className="text-gray-400 text-sm">
              Scout, plan, and execute daring train heists
            </p>
          </div>
          <Link to="/game/train">
            <Button variant="ghost">← Back to Station</Button>
          </Link>
        </div>

        {/* Pursuit Warning */}
        {activePursuit && (
          <div className="mt-4 p-4 bg-blood-red/30 border border-blood-red rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔍</span>
              <span className="text-blood-red font-western text-lg">Pinkerton Pursuit Active!</span>
            </div>
            <p className="text-red-300 text-sm">
              {activePursuit.pursuers?.length || 0} agents are tracking you.
              Intensity: {activePursuit.intensity}/10
            </p>
            <p className="text-red-300/80 text-xs mt-1">
              Daily encounter chance: {activePursuit.encounterChance}%
            </p>
          </div>
        )}
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-blood-red/30 pb-2">
        {(['scout', 'plan', 'execute', 'pursuit'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg font-western transition-colors ${
              activeTab === tab
                ? 'bg-blood-red/30 text-blood-red border border-b-0 border-blood-red/50'
                : 'text-gray-400 hover:text-blood-red hover:bg-blood-red/10'
            }`}
          >
            {tab === 'scout' && '🔭 Scout'}
            {tab === 'plan' && '📋 Plan'}
            {tab === 'execute' && `⚔️ Execute ${activePlans.length > 0 ? `(${activePlans.length})` : ''}`}
            {tab === 'pursuit' && `🏃 Pursuit ${activePursuit ? '!' : ''}`}
          </button>
        ))}
      </div>

      {/* Scout Tab */}
      {activeTab === 'scout' && (
        <div className="space-y-4">
          <h2 className="text-xl font-western text-blood-red">Scout Trains</h2>
          <p className="text-gray-400 text-sm">
            Select a train to scout. Costs {TRAIN_CONSTANTS.SCOUTING.ENERGY_COST} energy.
            Requires {TRAIN_CONSTANTS.SCOUTING.CUNNING_REQUIRED}+ Cunning.
          </p>

          <div className="grid gap-3">
            {trainSchedules.map((train) => (
              <Card
                key={train.trainId}
                variant="wood"
                className={`p-4 cursor-pointer transition-all ${
                  selectedTrain === train.trainId
                    ? 'ring-2 ring-blood-red'
                    : 'hover:ring-1 hover:ring-blood-red/50'
                }`}
                onClick={() => setSelectedTrain(train.trainId)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-western text-amber-400">{train.trainName}</h3>
                    <p className="text-sm text-gray-400">
                      {trainService.getTrainTypeName(train.trainType)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getTrainDangerClass(train)}`}>
                      Security: {train.securityLevel}/10
                    </p>
                    <p className="text-sm text-gray-400">
                      Guards: {train.guards}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button
            variant="danger"
            className="w-full"
            onClick={handleScoutTrain}
            disabled={!selectedTrain || isScouting}
          >
            {isScouting ? 'Scouting...' : `Scout Train (${TRAIN_CONSTANTS.SCOUTING.ENERGY_COST} Energy)`}
          </Button>

          {/* Scouting Results */}
          {scoutingResult && (
            <Card variant="leather" className="p-4">
              <h3 className="font-western text-amber-400 mb-3">Intelligence Report</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Guards:</span>{' '}
                  <span className="text-white">{scoutingResult.guardCount}</span>
                </div>
                <div>
                  <span className="text-gray-400">Security:</span>{' '}
                  <span className="text-white">{scoutingResult.securityLevel}/10</span>
                </div>
                <div>
                  <span className="text-gray-400">Est. Value:</span>{' '}
                  <span className="text-gold-light">{formatDollars(scoutingResult.estimatedValue)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Passengers:</span>{' '}
                  <span className="text-white">{scoutingResult.passengerCount || 'Unknown'}</span>
                </div>
              </div>
              {scoutingResult.cargoTypes && scoutingResult.cargoTypes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-amber-900/30">
                  <span className="text-gray-400 text-sm">Cargo Types:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {scoutingResult.cargoTypes.map((type, idx) => (
                      <span key={idx} className="text-xs bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {scoutingResult.vulnerabilities && scoutingResult.vulnerabilities.length > 0 && (
                <div className="mt-3 pt-3 border-t border-amber-900/30">
                  <span className="text-green-400 text-sm">Vulnerabilities Found:</span>
                  <ul className="mt-1 text-xs text-green-300">
                    {scoutingResult.vulnerabilities.map((vuln, idx) => (
                      <li key={idx}>• {vuln}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Button
                variant="secondary"
                className="w-full mt-4"
                onClick={() => setActiveTab('plan')}
              >
                Proceed to Planning →
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Plan Tab */}
      {activeTab === 'plan' && (
        <div className="space-y-4">
          <h2 className="text-xl font-western text-blood-red">Plan Robbery</h2>

          {!scoutingResult ? (
            <EmptyState
              icon="document"
              title="No Intelligence"
              description="Scout a train first to gather intelligence."
              action={{
                label: 'Scout Train',
                onClick: () => setActiveTab('scout'),
              }}
            />
          ) : (
            <>
              <p className="text-gray-400 text-sm">
                Select your approach. Different approaches have different difficulty modifiers.
              </p>

              <div className="grid md:grid-cols-2 gap-3">
                {Object.values(RobberyApproach).map((approach) => {
                  const info = getApproachInfo(approach);
                  const difficulty = info.difficulty;
                  const difficultyColor =
                    difficulty <= 0.9 ? 'text-green-400' :
                    difficulty <= 1.0 ? 'text-yellow-400' :
                    difficulty <= 1.2 ? 'text-orange-400' : 'text-blood-red';

                  return (
                    <Card
                      key={approach}
                      variant="wood"
                      className={`p-4 cursor-pointer transition-all ${
                        selectedApproach === approach
                          ? 'ring-2 ring-blood-red'
                          : 'hover:ring-1 hover:ring-blood-red/50'
                      }`}
                      onClick={() => setSelectedApproach(approach)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-western text-amber-400">{info.name}</h3>
                        <span className={`text-sm font-bold ${difficultyColor}`}>
                          {difficulty}x
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{info.description}</p>
                    </Card>
                  );
                })}
              </div>

              <Button
                variant="danger"
                className="w-full"
                onClick={handlePlanRobbery}
                disabled={!selectedApproach || isPlanning}
              >
                {isPlanning ? 'Planning...' : 'Create Robbery Plan'}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Execute Tab */}
      {activeTab === 'execute' && (
        <div className="space-y-4">
          <h2 className="text-xl font-western text-blood-red">Execute Robbery</h2>

          {activePlans.length === 0 ? (
            <EmptyState
              icon="target"
              title="No Active Plans"
              description="Create a robbery plan first."
              action={{
                label: 'Create Plan',
                onClick: () => setActiveTab('plan'),
              }}
            />
          ) : (
            <div className="grid gap-4">
              {activePlans.map((plan) => (
                <Card key={plan._id?.toString() || plan.id} variant="leather" className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-western text-amber-400">
                        {trainService.getRobberyApproachName(plan.approach)}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Target: {plan.targetRouteName || plan.targetTrainId}
                      </p>
                    </div>
                    <span className={`text-sm px-2 py-0.5 rounded ${
                      plan.phase === RobberyPhase.PLANNING ? 'bg-blue-900/50 text-blue-400' :
                      plan.phase === RobberyPhase.COMPLETE ? 'bg-green-900/50 text-green-400' :
                      'bg-gray-900/50 text-gray-400'
                    }`}>
                      {trainService.getRobberyPhaseName(plan.phase)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <span className="text-gray-400">Est. Loot:</span>{' '}
                      <span className="text-gold-light">{formatDollars(plan.estimatedLoot)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Risk Level:</span>{' '}
                      <span className={plan.estimatedRisk <= 5 ? 'text-yellow-400' : 'text-blood-red'}>
                        {plan.estimatedRisk}/10
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Gang Size:</span>{' '}
                      <span className="text-white">{plan.gangMembers?.length || 1}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Location:</span>{' '}
                      <span className="text-white">{plan.targetLocation}</span>
                    </div>
                  </div>

                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => handleExecuteRobbery(plan._id?.toString() || plan.id || '')}
                    disabled={isExecuting}
                  >
                    {isExecuting ? 'Executing...' : '⚔️ Execute Robbery'}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pursuit Tab */}
      {activeTab === 'pursuit' && (
        <div className="space-y-4">
          <h2 className="text-xl font-western text-blood-red">Pinkerton Pursuit</h2>

          {!activePursuit ? (
            <EmptyState
              icon="check"
              title="No Active Pursuit"
              description="You are not currently being pursued. Keep it that way!"
            />
          ) : (
            <Card variant="leather" className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🔍</span>
                <div>
                  <h3 className="font-western text-blood-red text-lg">
                    Pinkerton Agents on Your Trail!
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Started: {new Date(activePursuit.startedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-wood-darker p-3 rounded">
                  <p className="text-gray-400 text-sm">Intensity</p>
                  <p className="text-2xl font-bold text-blood-red">{activePursuit.intensity}/10</p>
                </div>
                <div className="bg-wood-darker p-3 rounded">
                  <p className="text-gray-400 text-sm">Daily Encounter</p>
                  <p className="text-2xl font-bold text-yellow-400">{activePursuit.encounterChance}%</p>
                </div>
              </div>

              {activePursuit.pursuers && activePursuit.pursuers.length > 0 && (
                <div>
                  <h4 className="font-western text-amber-400 mb-2">Active Agents</h4>
                  <div className="grid gap-2">
                    {activePursuit.pursuers.map((agent, idx) => (
                      <div key={idx} className="bg-wood-darker p-2 rounded flex justify-between items-center">
                        <div>
                          <p className="text-white">{agent.name}</p>
                          <p className="text-xs text-gray-400">
                            {agent.specialty} - Level {agent.level}
                          </p>
                        </div>
                        <div className="text-right text-xs">
                          <p className="text-gray-400">Combat: {agent.stats.combat}</p>
                          <p className="text-gray-400">Tracking: {agent.stats.tracking}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-400 mt-4">
                Lay low or leave town to reduce pursuit intensity. Getting caught means jail time!
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Robbery Result Modal */}
      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title={robberyResult?.success ? '🎉 Robbery Successful!' : '💀 Robbery Failed'}
        size="md"
      >
        {robberyResult && (
          <div className="space-y-4">
            {robberyResult.success ? (
              <>
                <div className="text-center py-4">
                  <p className="text-4xl mb-2">💰</p>
                  <p className="text-2xl font-western text-gold-light">
                    {formatDollars(robberyResult.result?.totalValue || 0)}
                  </p>
                  <p className="text-gray-400">Total Loot</p>
                </div>

                {robberyResult.result?.consequences && (
                  <div className="bg-blood-red/20 p-3 rounded">
                    <p className="text-blood-red font-bold mb-1">Consequences:</p>
                    <ul className="text-sm text-red-300">
                      {robberyResult.result.consequences.map((c: any, i: number) => (
                        <li key={i}>• {c.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-4xl mb-2">💀</p>
                <p className="text-xl text-blood-red">The robbery did not go as planned.</p>
                <p className="text-gray-400 text-sm mt-2">
                  Better luck next time, outlaw.
                </p>
              </div>
            )}

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowResultModal(false)}
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TrainRobbery;
