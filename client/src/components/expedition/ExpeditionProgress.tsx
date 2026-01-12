/**
 * ExpeditionProgress Component
 * Shows active expedition with progress bar
 */

import { useEffect } from 'react';
import { Card, Button, ProgressBar } from '@/components/ui';
import {
  expeditionService,
  ExpeditionType,
  IExpeditionDTO,
} from '@/services/expedition.service';

interface ExpeditionProgressProps {
  expedition: IExpeditionDTO;
  progressPercent: number;
  remainingTime: string;
  onCancel: () => void;
  onUpdateProgress: () => void;
  isCancelling: boolean;
}

export function ExpeditionProgress({
  expedition,
  progressPercent,
  remainingTime,
  onCancel,
  onUpdateProgress,
  isCancelling,
}: ExpeditionProgressProps) {
  const typeInfo = expeditionService.getTypeInfo(expedition.type as ExpeditionType);
  const durationInfo = expeditionService.getDurationInfo(expedition.durationTier);
  const isComplete = progressPercent >= 100;

  // Update progress every second
  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(onUpdateProgress, 1000);
    return () => clearInterval(interval);
  }, [isComplete, onUpdateProgress]);

  // Calculate refund estimate if cancelled now
  const getRefundEstimate = () => {
    if (progressPercent < 25) return '75%';
    if (progressPercent < 50) return '50%';
    return '25%';
  };

  return (
    <Card className="p-6 border-amber-500/50 bg-gradient-to-b from-amber-900/10 to-transparent">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl animate-pulse">{typeInfo.icon}</span>
          <div>
            <h2 className={`text-xl font-bold ${typeInfo.color}`}>
              {expedition.typeName || typeInfo.name}
            </h2>
            <p className="text-sm text-gray-400">
              {durationInfo.name} Expedition from {expedition.startLocationName || expedition.startLocationId}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${isComplete ? 'text-green-400' : 'text-amber-400'}`}>
            {isComplete ? 'Complete!' : remainingTime}
          </div>
          <div className="text-xs text-gray-500">
            {isComplete ? 'Claim your rewards' : 'remaining'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Progress</span>
          <span className={isComplete ? 'text-green-400' : 'text-amber-400'}>
            {Math.round(progressPercent)}%
          </span>
        </div>
        <ProgressBar
          value={progressPercent}
          max={100}
          color={isComplete ? 'green' : 'amber'}
          className="h-3"
        />
      </div>

      {/* Timing Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="bg-gray-800/50 rounded p-2">
          <span className="text-gray-500 block">Started</span>
          <span className="text-gray-300">
            {new Date(expedition.startedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        <div className="bg-gray-800/50 rounded p-2">
          <span className="text-gray-500 block">Est. Completion</span>
          <span className={isComplete ? 'text-green-400' : 'text-gray-300'}>
            {new Date(expedition.estimatedCompletionAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* Events Encountered */}
      {expedition.eventsEncountered > 0 && (
        <div className="mb-4 p-3 bg-gray-800/30 rounded">
          <span className="text-gray-400 text-sm">
            Events encountered: {expedition.eventsEncountered}
          </span>
          {expedition.currentEventDescription && (
            <p className="text-sm text-amber-400 mt-1 italic">
              "{expedition.currentEventDescription}"
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      {!isComplete && (
        <div className="border-t border-gray-700 pt-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Cancel for ~{getRefundEstimate()} refund
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={onCancel}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Expedition'}
            </Button>
          </div>
        </div>
      )}

      {/* Complete State */}
      {isComplete && (
        <div className="border-t border-green-700/50 pt-4 mt-4 text-center">
          <div className="text-green-400 text-lg font-bold mb-2">
            Your expedition has returned!
          </div>
          <p className="text-gray-400 text-sm">
            Check below for your rewards and expedition results.
          </p>
        </div>
      )}
    </Card>
  );
}

export default ExpeditionProgress;
