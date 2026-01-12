/**
 * Expeditions Page
 * Main page for offline expedition progression system
 * Phase 3: Missing Frontend Pages
 */

import { useEffect, useState, useCallback } from 'react';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import {
  ExpeditionCard,
  ExpeditionTypeSelector,
  ExpeditionProgress,
  ExpeditionResults,
  ExpeditionHistory,
} from '@/components/expedition';
import { useExpeditionStore } from '@/store/useExpeditionStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';
import {
  ExpeditionType,
  ExpeditionStatus,
  IExpeditionDTO,
} from '@/services/expedition.service';
import type { ExpeditionTypesResponse } from '@/services/expedition.service';

type ViewState = 'list' | 'configure' | 'active' | 'results';

export function Expeditions() {
  // Store state
  const {
    expeditionTypes,
    availability,
    activeExpedition,
    history,
    isLoading,
    isSubmitting,
    error,
    selectedType,
    selectedDuration,
    progressPercent,
    remainingTime,
    fetchAll,
    startExpedition,
    cancelExpedition,
    setSelectedType,
    setSelectedDuration,
    updateProgress,
    clearError,
    fetchActive,
    fetchHistory,
  } = useExpeditionStore();

  const { currentCharacter } = useCharacterStore();
  const toast = useToast();

  // Local UI state
  const [viewState, setViewState] = useState<ViewState>('list');
  const [showResults, setShowResults] = useState<IExpeditionDTO | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<ExpeditionTypesResponse | null>(null);

  // Load data on mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Determine view based on active expedition
  useEffect(() => {
    if (activeExpedition) {
      // Check if expedition is complete (results available)
      if (activeExpedition.result && activeExpedition.status === ExpeditionStatus.COMPLETED) {
        setShowResults(activeExpedition);
        setViewState('results');
      } else if (activeExpedition.status === ExpeditionStatus.IN_PROGRESS) {
        setViewState('active');
      }
    } else if (viewState === 'active' || viewState === 'results') {
      // Reset to list if no active expedition
      setViewState('list');
    }
  }, [activeExpedition, viewState]);

  // Get availability for a specific type
  const getAvailability = useCallback((type: string) => {
    return availability.find(a => a.type === type);
  }, [availability]);

  // Handle expedition type selection
  const handleSelectType = (type: ExpeditionType) => {
    const config = expeditionTypes.find(t => t.type === type);
    if (config) {
      setSelectedType(type);
      setSelectedConfig(config);
      setViewState('configure');
    }
  };

  // Handle starting expedition
  const handleStartExpedition = async () => {
    if (!selectedType) return;

    const success = await startExpedition(selectedType, selectedDuration);
    if (success) {
      toast.success('Expedition Started', 'Your expedition is now underway!');
      setViewState('active');
    } else if (error) {
      toast.error('Failed to Start', error);
    }
  };

  // Handle cancelling expedition
  const handleCancelExpedition = async () => {
    const success = await cancelExpedition();
    if (success) {
      toast.info('Expedition Cancelled', 'Partial refund has been applied.');
      setViewState('list');
    } else if (error) {
      toast.error('Failed to Cancel', error);
    }
  };

  // Handle dismissing results
  const handleDismissResults = () => {
    setShowResults(null);
    setViewState('list');
    // Refresh data to clear old expedition
    fetchActive();
    fetchHistory();
  };

  // Handle back from configure
  const handleBackToList = () => {
    setSelectedType(null);
    setSelectedConfig(null);
    setViewState('list');
  };

  // Get character resources for requirements check
  const characterEnergy = currentCharacter?.energy || 0;
  const characterGold = currentCharacter?.dollars || 0;

  // Loading state
  if (isLoading && expeditionTypes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-amber-400 mb-2">Expeditions</h1>
        <p className="text-gray-400">
          Send your character on expeditions to gather resources, earn gold, and discover new locations.
          Expeditions continue while you're away - perfect for offline progression!
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-500 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-red-400">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Active Expedition Progress */}
      {viewState === 'active' && activeExpedition && (
        <div className="mb-6">
          <ExpeditionProgress
            expedition={activeExpedition}
            progressPercent={progressPercent}
            remainingTime={remainingTime}
            onCancel={handleCancelExpedition}
            onUpdateProgress={updateProgress}
            isCancelling={isSubmitting}
          />
        </div>
      )}

      {/* Results View */}
      {viewState === 'results' && showResults && (
        <div className="mb-6">
          <ExpeditionResults
            expedition={showResults}
            onDismiss={handleDismissResults}
          />
        </div>
      )}

      {/* Configuration View */}
      {viewState === 'configure' && selectedConfig && (
        <ExpeditionTypeSelector
          config={selectedConfig}
          selectedDuration={selectedDuration}
          onDurationChange={setSelectedDuration}
          onStart={handleStartExpedition}
          onBack={handleBackToList}
          isSubmitting={isSubmitting}
          hasEnoughEnergy={characterEnergy >= selectedConfig.energyCost}
          hasEnoughGold={characterGold >= (selectedConfig.goldCost || 0)}
        />
      )}

      {/* Expedition List View */}
      {viewState === 'list' && (
        <>
          {/* Current Location Info */}
          <Card className="p-4 mb-6 bg-gradient-to-r from-amber-900/20 to-transparent border-amber-700/30">
            <div className="flex items-center gap-2">
              <span className="text-xl">📍</span>
              <span className="text-amber-300">
                Available expeditions from your current location
              </span>
            </div>
          </Card>

          {/* Resource Display */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Energy</span>
                <span className="text-yellow-400 text-xl font-bold">{characterEnergy}</span>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Gold</span>
                <span className="text-amber-400 text-xl font-bold">${characterGold}</span>
              </div>
            </Card>
          </div>

          {/* Expedition Types Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-300 mb-4">Choose an Expedition</h2>
            {expeditionTypes.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-gray-400">No expeditions available at this location.</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {expeditionTypes.map(config => {
                  const type = config.type as ExpeditionType;
                  const avail = getAvailability(type);
                  const hasActiveExpedition = activeExpedition !== null;

                  return (
                    <ExpeditionCard
                      key={type}
                      config={config}
                      availability={avail}
                      isSelected={selectedType === type}
                      onSelect={() => handleSelectType(type)}
                      disabled={hasActiveExpedition}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* History Section */}
          <ExpeditionHistory
            expeditions={history}
            isLoading={isLoading}
            onRefresh={() => fetchHistory()}
            onSelectExpedition={(exp) => {
              if (exp.result) {
                setShowResults(exp);
                setViewState('results');
              }
            }}
          />
        </>
      )}

      {/* Info Section */}
      {viewState === 'list' && (
        <Card className="mt-8 p-6 bg-gray-800/30">
          <h3 className="font-bold text-gray-300 mb-4">About Expeditions</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <h4 className="text-amber-400 mb-2">Duration Tiers</h4>
              <ul className="space-y-1">
                <li><span className="text-green-400">Quick:</span> 1-2 hours, 95% success, 1x rewards</li>
                <li><span className="text-amber-400">Standard:</span> 4-8 hours, 85% success, 2x rewards</li>
                <li><span className="text-red-400">Extended:</span> 12-24 hours, 70% success, 4x rewards</li>
              </ul>
            </div>
            <div>
              <h4 className="text-amber-400 mb-2">Tips</h4>
              <ul className="space-y-1">
                <li>• Longer expeditions have higher rewards but lower success rates</li>
                <li>• Cancelling early gives partial refunds based on progress</li>
                <li>• Expeditions continue even when you're offline</li>
                <li>• Some locations unlock unique expedition types</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default Expeditions;
