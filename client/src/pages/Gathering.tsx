/**
 * Gathering Page
 * Gather resources from nodes at the current location
 * Phase 7, Wave 7.3 - AAA Crafting System
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Card, LoadingSpinner, ProgressBar } from '@/components/ui';
import {
  gatheringService,
  GatheringNode,
  GatheringCooldown,
  GatheringType,
  GatheringResult,
} from '@/services/gathering.service';
import { logger } from '@/services/logger.service';
import { useToast } from '@/store/useToastStore';
import { api } from '@/services/api';
import { useEnergyStore } from '@/store/useEnergyStore';
import type { LocationGatheringNode } from '@desperados/shared';

const GATHERING_TYPES: GatheringType[] = ['mining', 'herbalism', 'woodcutting', 'foraging', 'hunting', 'fishing'];

export function Gathering() {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<GatheringNode[]>([]);
  const [availableNodeIds, setAvailableNodeIds] = useState<string[]>([]);
  const [cooldowns, setCooldowns] = useState<GatheringCooldown[]>([]);

  // Location-aware nodes
  const [locationName, setLocationName] = useState<string>('');
  const [locationNodes, setLocationNodes] = useState<LocationGatheringNode[]>([]);

  // Filter state
  const [selectedType, setSelectedType] = useState<GatheringType | 'all'>('all');

  // Gathering state
  const [selectedNode, setSelectedNode] = useState<GatheringNode | null>(null);
  const [isGathering, setIsGathering] = useState(false);
  const [gatherProgress, setGatherProgress] = useState(0);
  const [gatherResult, setGatherResult] = useState<GatheringResult | null>(null);

  // Cooldown timer ref
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Toast notifications
  const toast = useToast();

  // Energy store for syncing after gathering
  const { applyOptimisticDeduct } = useEnergyStore();

  // ===== Data Loading =====
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [nodesData, locationResponse] = await Promise.all([
        gatheringService.getNodes(),
        api.get('/locations/current').catch(() => null),
      ]);

      setNodes(nodesData.nodes);
      setAvailableNodeIds(nodesData.available);
      setCooldowns(nodesData.cooldowns);

      // Set location nodes if available
      if (locationResponse?.data?.data?.location) {
        const loc = locationResponse.data.data.location;
        setLocationName(loc.name || '');
        setLocationNodes(loc.gatheringNodes || []);
      }
    } catch (err) {
      logger.error('Failed to load gathering data', err instanceof Error ? err : undefined);
      setError('Failed to load gathering nodes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cooldown tick effect
  useEffect(() => {
    if (cooldowns.length === 0) {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
      return;
    }

    cooldownIntervalRef.current = setInterval(() => {
      setCooldowns(prev =>
        prev
          .map(cd => ({
            ...cd,
            remainingSeconds: Math.max(0, cd.remainingSeconds - 1),
          }))
          .filter(cd => cd.remainingSeconds > 0)
      );
    }, 1000);

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [cooldowns.length]);

  // ===== Filtering =====
  const filteredNodes = selectedType === 'all'
    ? nodes
    : nodes.filter(n => n.type === selectedType);

  const sortedNodes = gatheringService.sortByLevel(filteredNodes);

  // ===== Actions =====
  const handleSelectNode = (node: GatheringNode) => {
    setSelectedNode(node);
    setGatherResult(null);
    setGatherProgress(0);
  };

  const handleGather = async () => {
    if (!selectedNode) return;

    setIsGathering(true);
    setGatherProgress(0);
    setGatherResult(null);
    setError(null);

    // Apply optimistic energy deduction for immediate UI feedback
    if (selectedNode.energyCost > 0) {
      applyOptimisticDeduct(selectedNode.energyCost);
    }

    // Simulate gathering progress (visual only)
    const totalTime = 1500; // 1.5 seconds for animation
    const intervalTime = 50;
    const progressIncrement = 100 / (totalTime / intervalTime);

    const progressInterval = setInterval(() => {
      setGatherProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(100, prev + progressIncrement);
      });
    }, intervalTime);

    try {
      const result = await gatheringService.gather(selectedNode.id);

      clearInterval(progressInterval);
      setGatherProgress(100);
      setGatherResult(result);

      // Show success toast with loot summary
      if (result.success && result.loot.length > 0) {
        const lootSummary = result.loot.map(l => `${l.quantity}x ${l.name}`).join(', ');
        toast.reward('Resources Gathered!', lootSummary);

        // Show level up toast if applicable
        if (result.skillLevelUp) {
          toast.success(
            'Skill Level Up!',
            `${gatheringService.getSkillName(result.skillLevelUp.skillId)} is now level ${result.skillLevelUp.newLevel}!`
          );
        }
      }

      // Add cooldown to local state
      if (result.cooldownEndsAt) {
        const endsAt = new Date(result.cooldownEndsAt);
        const remainingSeconds = Math.max(0, (endsAt.getTime() - Date.now()) / 1000);
        setCooldowns(prev => [
          ...prev.filter(cd => cd.nodeId !== selectedNode.id),
          { nodeId: selectedNode.id, endsAt: result.cooldownEndsAt, remainingSeconds },
        ]);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setGatherProgress(0);
      logger.error('Gathering failed', err instanceof Error ? err : undefined);
      const errorMsg = err.message || 'Gathering failed. Please try again.';
      setError(errorMsg);
      toast.error('Gathering Failed', errorMsg);
    } finally {
      setIsGathering(false);
    }
  };

  const handleBackToNodes = () => {
    setSelectedNode(null);
    setGatherResult(null);
    setGatherProgress(0);
  };

  // ===== Helpers =====
  const isNodeAvailable = (nodeId: string) => availableNodeIds.includes(nodeId);
  const getNodeCooldown = (nodeId: string) => gatheringService.isOnCooldown(nodeId, cooldowns);

  // ===== Render Helpers =====
  const renderTypeTabs = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        variant={selectedType === 'all' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setSelectedType('all')}
      >
        All
      </Button>
      {GATHERING_TYPES.map(type => {
        const typeNodes = nodes.filter(n => n.type === type);
        return (
          <Button
            key={type}
            variant={selectedType === type ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedType(type)}
            disabled={typeNodes.length === 0}
          >
            {gatheringService.getTypeIcon(type)} {gatheringService.getTypeName(type)}
            {typeNodes.length > 0 && (
              <span className="ml-1 text-xs text-gray-400">({typeNodes.length})</span>
            )}
          </Button>
        );
      })}
    </div>
  );

  const renderNodeList = () => (
    <div className="space-y-4">
      {renderTypeTabs()}

      {sortedNodes.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-400">
            {selectedType === 'all'
              ? 'No gathering nodes available at this location.'
              : `No ${gatheringService.getTypeName(selectedType)} nodes at this location.`}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sortedNodes.map(node => {
            const isAvailable = isNodeAvailable(node.id);
            const cooldown = getNodeCooldown(node.id);

            return (
              <Card
                key={node.id}
                className={`p-4 cursor-pointer transition-colors ${
                  cooldown
                    ? 'opacity-60 border-gray-700'
                    : isAvailable
                    ? 'hover:border-amber-500'
                    : 'opacity-50 border-red-900/50'
                }`}
                onClick={() => handleSelectNode(node)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-bold ${!isAvailable && !cooldown ? 'text-gray-500' : ''}`}>
                    {node.name}
                  </h3>
                  <span className="text-xl">{gatheringService.getTypeIcon(node.type)}</span>
                </div>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{node.description}</p>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Skill:</span>
                    <span className={isAvailable ? 'text-blue-400' : 'text-red-400'}>
                      {gatheringService.getSkillName(node.skillRequired)} Lv.{node.levelRequired}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Energy:</span>
                    <span className="text-yellow-400">{node.energyCost}</span>
                  </div>
                  {node.toolRequired && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tool:</span>
                      <span className="text-amber-400">{node.toolRequired}</span>
                    </div>
                  )}
                </div>

                {/* Possible Yields */}
                <div className="mt-3 pt-2 border-t border-gray-700">
                  <span className="text-xs text-gray-500">Yields: </span>
                  <span className="text-xs">
                    {node.yields.map((y, i) => (
                      <span key={i}>
                        <span className={gatheringService.getRarityColor(y.rarity)}>{y.name}</span>
                        {i < node.yields.length - 1 && ', '}
                      </span>
                    ))}
                  </span>
                </div>

                {/* Cooldown Overlay */}
                {cooldown && (
                  <div className="mt-2 p-2 bg-gray-800/80 rounded text-center">
                    <span className="text-amber-400 text-sm">
                      {gatheringService.formatCooldown(cooldown.remainingSeconds)}
                    </span>
                  </div>
                )}

                {/* Locked Overlay */}
                {!isAvailable && !cooldown && (
                  <div className="mt-2 p-2 bg-red-900/30 rounded text-center">
                    <span className="text-red-400 text-xs">Level Too Low</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderGatheringView = () => {
    if (!selectedNode) return null;

    const isAvailable = isNodeAvailable(selectedNode.id);
    const cooldown = getNodeCooldown(selectedNode.id);

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBackToNodes} className="mb-4">
          &larr; Back to Nodes
        </Button>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-amber-400">{selectedNode.name}</h2>
              <p className="text-gray-400">{selectedNode.description}</p>
            </div>
            <span className="text-4xl">{gatheringService.getTypeIcon(selectedNode.type)}</span>
          </div>

          {/* Requirements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded p-3">
              <span className="text-gray-500 text-sm">Skill Required</span>
              <div className={isAvailable ? 'text-blue-400' : 'text-red-400'}>
                {gatheringService.getSkillName(selectedNode.skillRequired)} Lv.{selectedNode.levelRequired}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded p-3">
              <span className="text-gray-500 text-sm">Energy Cost</span>
              <div className="text-yellow-400">{selectedNode.energyCost}</div>
            </div>
            <div className="bg-gray-800/50 rounded p-3">
              <span className="text-gray-500 text-sm">Cooldown</span>
              <div>{gatheringService.formatCooldown(selectedNode.cooldownSeconds)}</div>
            </div>
            {selectedNode.toolRequired && (
              <div className="bg-gray-800/50 rounded p-3">
                <span className="text-gray-500 text-sm">Tool Bonus</span>
                <div className="text-amber-400">
                  {selectedNode.toolRequired} (+{selectedNode.toolBonus || 0}%)
                </div>
              </div>
            )}
          </div>

          {/* Possible Yields */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-300 mb-2">Possible Resources</h3>
            <div className="grid gap-2">
              {selectedNode.yields.map((yield_, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-gray-800/50 rounded p-2"
                >
                  <span className={gatheringService.getRarityColor(yield_.rarity)}>
                    {yield_.name}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{yield_.rarity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gathering Progress */}
          {isGathering && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Gathering...</span>
                <span className="text-amber-400">{Math.round(gatherProgress)}%</span>
              </div>
              <ProgressBar value={gatherProgress} max={100} color="amber" />
            </div>
          )}

          {/* Result */}
          {gatherResult && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                gatherResult.success
                  ? 'bg-green-900/30 border border-green-500'
                  : 'bg-red-900/30 border border-red-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{gatherResult.success ? '\u2713' : '\u2717'}</span>
                <span
                  className={`font-bold ${
                    gatherResult.success ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {gatherResult.success ? 'Success!' : 'Failed'}
                </span>
              </div>
              <p className={gatherResult.success ? 'text-green-300' : 'text-red-300'}>
                {gatherResult.message}
              </p>

              {gatherResult.loot && gatherResult.loot.length > 0 && (
                <div className="mt-3 space-y-1">
                  <span className="text-sm text-gray-400">Gathered:</span>
                  {gatherResult.loot.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className={gatheringService.getRarityColor(item.rarity || 'common')}>
                        {item.name}
                        {item.quality && item.quality !== 'common' && (
                          <span
                            className={`ml-2 text-sm ${gatheringService.getQualityColor(
                              item.quality
                            )}`}
                          >
                            ({item.quality})
                          </span>
                        )}
                      </span>
                      <span className="text-green-400">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              {gatherResult.xpGained > 0 && (
                <div className="mt-2 text-purple-400">+{gatherResult.xpGained} XP</div>
              )}

              {gatherResult.skillLevelUp && (
                <div className="mt-2 p-2 bg-purple-900/30 rounded">
                  <span className="text-purple-400 font-bold">
                    LEVEL UP! {gatheringService.getSkillName(gatherResult.skillLevelUp.skillId)}{' '}
                    is now level {gatherResult.skillLevelUp.newLevel}!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Cooldown Warning */}
          {cooldown && !gatherResult && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg text-center">
              <span className="text-gray-400">On cooldown: </span>
              <span className="text-amber-400 font-bold">
                {gatheringService.formatCooldown(cooldown.remainingSeconds)}
              </span>
            </div>
          )}

          {/* Not Available Warning */}
          {!isAvailable && !cooldown && !gatherResult && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
              <p className="text-red-400">
                You don't meet the requirements to gather from this node. Need{' '}
                {gatheringService.getSkillName(selectedNode.skillRequired)} level{' '}
                {selectedNode.levelRequired}.
              </p>
            </div>
          )}

          {/* Gather Button */}
          <div className="flex gap-3">
            {!gatherResult ? (
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleGather}
                disabled={isGathering || !isAvailable || !!cooldown}
              >
                {isGathering
                  ? 'Gathering...'
                  : cooldown
                  ? `Cooldown (${gatheringService.formatCooldown(cooldown.remainingSeconds)})`
                  : !isAvailable
                  ? 'Requirements Not Met'
                  : `Gather from ${selectedNode.name}`}
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    setGatherResult(null);
                    setGatherProgress(0);
                  }}
                  disabled={!!getNodeCooldown(selectedNode.id)}
                >
                  {getNodeCooldown(selectedNode.id)
                    ? `Cooldown (${gatheringService.formatCooldown(
                        getNodeCooldown(selectedNode.id)!.remainingSeconds
                      )})`
                    : 'Gather Again'}
                </Button>
                <Button variant="ghost" onClick={handleBackToNodes}>
                  Different Node
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // ===== Main Render =====
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Get abundance color
  const getAbundanceColor = (abundance: string) => {
    switch (abundance) {
      case 'abundant': return 'text-green-400';
      case 'common': return 'text-amber-400';
      case 'scarce': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-amber-400 mb-2">Gathering</h1>
        <p className="text-gray-400">
          Gather resources from the wilderness. Higher skill levels unlock better nodes and improve
          yields.
        </p>
      </div>

      {/* Location Nodes Banner */}
      {locationName && (
        <div className="mb-4 p-3 bg-gradient-to-r from-green-900/30 to-gray-800/30 rounded-lg border border-green-700/30">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span className="text-green-200 font-medium">{locationName}</span>
            </div>
            {locationNodes.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400">Available here:</span>
                <div className="flex gap-1 flex-wrap">
                  {locationNodes.map((node, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 bg-green-800/40 rounded text-xs ${getAbundanceColor(node.abundance)}`}
                      title={`${node.abundance} abundance${node.isHidden ? ' (Hidden)' : ''}`}
                    >
                      {node.nodeId.replace(/_/g, ' ')}
                      {node.isHidden && ' 🔍'}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray-500">
                No location-specific resources (see all available nodes below)
              </span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-400">{error}</p>
          <Button variant="ghost" size="sm" onClick={loadData} className="mt-2">
            Try Again
          </Button>
        </div>
      )}

      {!error && !selectedNode && renderNodeList()}
      {!error && selectedNode && renderGatheringView()}
    </div>
  );
}

export default Gathering;
