/**
 * TrainingStatus Component
 * Shows current skill training progress with real-time updates
 */

import React, { useState, useEffect } from 'react';
import { TrainingStatus as TrainingStatusType, Skill } from '@desperados/shared';
import { SkillProgressBar } from './SkillProgressBar';
import { Button } from '@/components/ui/Button';

interface TrainingStatusProps {
  training: TrainingStatusType;
  skill: Skill;
  onCancel: () => void;
  onComplete: () => void;
}

/**
 * Format time remaining from seconds to readable string
 */
function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Ready!';

  if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  }
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }
  return `${seconds}s`;
}

/**
 * Training status panel with real-time countdown
 */
export const TrainingStatus: React.FC<TrainingStatusProps> = ({
  training,
  skill,
  onCancel,
  onComplete,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // Calculate initial time remaining
  useEffect(() => {
    const completesAt = new Date(training.completesAt).getTime();
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((completesAt - now) / 1000));
    setTimeRemaining(remaining);
    setIsComplete(remaining <= 0);
  }, [training]);

  // Update time remaining every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newValue = Math.max(0, prev - 1);
        if (newValue === 0 && !isComplete) {
          setIsComplete(true);
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isComplete]);

  // Calculate total training duration
  const startedAt = new Date(training.startedAt).getTime();
  const completesAt = new Date(training.completesAt).getTime();
  const totalDuration = Math.floor((completesAt - startedAt) / 1000);
  const elapsed = totalDuration - timeRemaining;

  // Determine if near completion (last 10%)
  const percentComplete = (elapsed / totalDuration) * 100;
  const isNearCompletion = percentComplete >= 90;

  return (
    <div
      className={`
        wood-panel p-6 rounded-lg border-4 border-gold-medium mb-6
        ${isComplete ? 'ring-4 ring-gold-light animate-pulse' : ''}
        ${isNearCompletion && !isComplete ? 'animate-pulse-gold' : ''}
      `}
      role="status"
      aria-live="polite"
      aria-label="Skill training status"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label={skill.name}>
            {skill.icon}
          </span>
          <div>
            <h3 className="text-lg font-western text-gold-light">
              Currently Training
            </h3>
            <p className="text-xl font-bold text-desert-sand">
              {skill.name}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`
            px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide
            ${isComplete ? 'bg-green-500 text-white' : 'bg-gold-dark text-wood-dark'}
          `}
        >
          {isComplete ? '✓ Complete' : '⏳ Training'}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <SkillProgressBar
          current={elapsed}
          max={totalDuration}
          label="Training Progress"
          color="blue"
          showPercentage={true}
          animated={true}
        />
      </div>

      {/* Time Remaining Display */}
      <div className="mb-6 text-center">
        <div className="text-sm text-desert-sand mb-1">Time Remaining</div>
        <div
          className={`
            text-3xl font-western font-bold
            ${isComplete ? 'text-green-400' : 'text-gold-light'}
          `}
        >
          {formatTimeRemaining(timeRemaining)}
        </div>
        {isComplete && (
          <div className="text-sm text-green-400 mt-2 animate-pulse">
            Training complete! Click below to claim your rewards.
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isComplete}
          onClick={onComplete}
          className={isComplete ? 'animate-pulse bg-green-600 hover:bg-green-500' : ''}
        >
          {isComplete ? '🎉 Complete Training' : 'Complete Training'}
        </Button>

        <Button
          variant="danger"
          size="lg"
          onClick={onCancel}
          disabled={isComplete}
        >
          Cancel
        </Button>
      </div>

      {/* Warning about canceling */}
      {!isComplete && (
        <p className="text-xs text-desert-sand/70 mt-3 text-center">
          Canceling training will forfeit all progress. No XP will be gained.
        </p>
      )}
    </div>
  );
};

export default TrainingStatus;
