/**
 * Location Training Component
 * Displays training activities for the Skill Academy
 */

import React from 'react';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import { useLocationStore } from '@/store/useLocationStore';
import { useCharacterStore } from '@/store/useCharacterStore';

interface LocationTrainingProps {
  onRefresh?: () => void;
}

export const LocationTraining: React.FC<LocationTrainingProps> = ({ onRefresh }) => {
  const { refreshCharacter } = useCharacterStore();
  const {
    location,
    trainingData,
    trainingLoading,
    performingTraining,
    trainingResult,
    handlePerformTraining,
    clearTrainingResult,
  } = useLocationStore();

  // Only show for skill_academy locations
  if (!location || location.type !== 'skill_academy') {
    return null;
  }

  const onPerformTraining = async (activityId: string) => {
    await handlePerformTraining(activityId);
    refreshCharacter();
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-green-400 mb-4">🎓 Training Activities</h2>
      <p className="text-sm text-gray-400 mb-4">
        Practice your skills at the Academy. Each activity costs energy and awards XP.
      </p>

      {/* Training Result */}
      {trainingResult && (
        <div className={`mb-4 p-4 rounded-lg border ${
          trainingResult.success
            ? 'bg-green-900/30 border-green-700'
            : 'bg-red-900/30 border-red-700'
        }`}>
          <p className={trainingResult.success ? 'text-green-300' : 'text-red-300'}>
            {trainingResult.message}
          </p>
          {trainingResult.success && (
            <div className="mt-2 flex gap-4 text-sm">
              <span className="text-purple-400">+{trainingResult.skillXpGained} Skill XP</span>
              <span className="text-blue-400">+{trainingResult.characterXpGained} Character XP</span>
              {trainingResult.goldGained > 0 && (
                <span className="text-yellow-400">+{trainingResult.goldGained} Gold</span>
              )}
            </div>
          )}
          {trainingResult.skillLevelUp && (
            <p className="mt-2 text-green-400 font-semibold">
              Level Up! {trainingResult.skillName}: {trainingResult.skillLevelUp.oldLevel} → {trainingResult.skillLevelUp.newLevel}
            </p>
          )}
          <Button
            size="sm"
            variant="secondary"
            className="mt-2"
            onClick={clearTrainingResult}
          >
            Dismiss
          </Button>
        </div>
      )}

      {trainingLoading ? (
        <div className="text-center py-4">
          <LoadingSpinner size="sm" />
        </div>
      ) : trainingData?.available && trainingData.available.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {trainingData.available.map(activity => {
            const cooldown = trainingData.cooldowns.find(c => c.activityId === activity.id);
            const isOnCooldown = cooldown && cooldown.remainingSeconds > 0;
            const isPerforming = performingTraining === activity.id;

            return (
              <div
                key={activity.id}
                className={`p-4 rounded-lg border ${
                  isOnCooldown
                    ? 'bg-gray-800/30 border-gray-700 opacity-60'
                    : 'bg-gradient-to-br from-green-900/30 to-gray-800/50 border-green-700/50 hover:border-green-500'
                } transition-colors`}
              >
                <h3 className="font-semibold text-green-200">{activity.name}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{activity.description}</p>

                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-yellow-400">⚡ {activity.energyCost}</span>
                  <span className="text-purple-400">+{activity.baseSkillXP} XP</span>
                  <span className={`px-1 rounded ${
                    activity.riskLevel === 'safe' ? 'bg-green-800/50 text-green-300' :
                    activity.riskLevel === 'low' ? 'bg-blue-800/50 text-blue-300' :
                    activity.riskLevel === 'medium' ? 'bg-yellow-800/50 text-yellow-300' :
                    'bg-red-800/50 text-red-300'
                  }`}>
                    {activity.riskLevel}
                  </span>
                </div>

                <div className="mt-3">
                  {isOnCooldown ? (
                    <span className="text-xs text-gray-500">
                      Cooldown: {Math.ceil(cooldown.remainingSeconds / 60)}m
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-green-900/50 hover:bg-green-800/50 border-green-700"
                      onClick={() => onPerformTraining(activity.id)}
                      disabled={isPerforming}
                    >
                      {isPerforming ? 'Training...' : 'Practice'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          No training activities available at your level.
        </p>
      )}
    </Card>
  );
};

export default LocationTraining;
