/**
 * Location Jobs Component
 * Displays available jobs and handles the deck game job system
 */

import React from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { DeckGame } from '@/components/game/deckgames/DeckGame';
import { useLocationStore } from '@/store/useLocationStore';
import { useCharacterStore } from '@/store/useCharacterStore';

interface LocationJobsProps {
  onRefresh?: () => void;
}

export const LocationJobs: React.FC<LocationJobsProps> = ({ onRefresh: _onRefresh }) => {
  const { currentCharacter, refreshCharacter } = useCharacterStore();
  const {
    location,
    performingJob,
    jobResult,
    activeJobGame,
    activeJobInfo,
    handlePerformJob,
    handleJobGameComplete,
    handleJobForfeit,
    clearJobResult,
  } = useLocationStore();

  if (!location || location.jobs.length === 0) {
    return null;
  }

  const playerEnergy = currentCharacter?.energy || 0;

  const onJobComplete = (result: any) => {
    handleJobGameComplete(result);
    refreshCharacter();
  };

  return (
    <>
      <Card className="p-6">
        <h2 className="text-xl font-bold text-amber-400 mb-4">💼 Available Jobs</h2>

        {jobResult && (
          <div className={`mb-4 p-3 rounded ${jobResult.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p>{jobResult.message}</p>
                {jobResult.success && (
                  <p className="text-sm mt-1">
                    Earned: {jobResult.goldEarned} gold, {jobResult.xpEarned} XP
                  </p>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={clearJobResult}>
                Dismiss
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {location.jobs.map(job => (
            <div key={job.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="font-semibold text-amber-300">{job.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{job.description}</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-blue-400">⚡ {job.energyCost} energy</span>
                <span className="text-yellow-400">
                  💰 ${job.rewards.goldMin}-${job.rewards.goldMax}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {job.rewards.xp} XP • {job.cooldownMinutes}m cooldown
                </span>
                <Button
                  size="sm"
                  onClick={() => handlePerformJob(job.id)}
                  disabled={performingJob === job.id || playerEnergy < job.energyCost}
                >
                  {performingJob === job.id ? 'Working...' : 'Work'}
                </Button>
              </div>
              {job.requirements?.minLevel && job.requirements.minLevel > 1 && (
                <p className="text-xs text-orange-400 mt-1">
                  Requires level {job.requirements.minLevel}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Job Deck Game Modal */}
      {activeJobGame && activeJobInfo && (
        <Modal
          isOpen={true}
          onClose={handleJobForfeit}
          title={`Working: ${activeJobInfo.name}`}
          size="xl"
        >
          <div className="p-4">
            <DeckGame
              initialState={activeJobGame}
              actionInfo={{
                name: activeJobInfo.name,
                type: 'job',
                difficulty: 1,
                energyCost: activeJobInfo.energyCost,
                rewards: activeJobInfo.rewards,
              }}
              onComplete={onJobComplete}
              onForfeit={handleJobForfeit}
              context="job"
              jobId={activeJobInfo.id}
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export default LocationJobs;
