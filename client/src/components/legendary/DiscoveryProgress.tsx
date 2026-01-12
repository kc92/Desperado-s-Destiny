/**
 * DiscoveryProgress Component
 * Clue and rumor progress tracker for a legendary animal
 */

import { Card, Button, ProgressBar } from '@/components/ui';
import {
  legendaryHuntService,
  type LegendaryAnimal,
  type LegendaryProgress,
} from '@/services/legendaryHunt.service';

interface DiscoveryProgressProps {
  legendary: LegendaryAnimal;
  progress: LegendaryProgress;
  onDiscoverClue: () => void;
  onHearRumor: () => void;
  isLoading?: boolean;
}

export function DiscoveryProgress({
  legendary,
  progress,
  onDiscoverClue,
  onHearRumor,
  isLoading,
}: DiscoveryProgressProps) {
  const discoveryPercent = legendaryHuntService.getDiscoveryProgressPercent(progress);
  const isDiscovered = legendaryHuntService.isDiscovered(progress);

  // Status progression
  const statusSteps = [
    { status: 'unknown', label: 'Unknown', icon: '❓' },
    { status: 'rumored', label: 'Rumored', icon: '💬' },
    { status: 'tracked', label: 'Tracked', icon: '👣' },
    { status: 'discovered', label: 'Discovered', icon: '🔍' },
    { status: 'defeated', label: 'Defeated', icon: '🏆' },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.status === progress.discoveryStatus);

  return (
    <Card className="p-4">
      <h3 className="font-bold text-gray-300 mb-4">Discovery Progress</h3>

      {/* Status Timeline */}
      <div className="flex justify-between mb-6">
        {statusSteps.map((step, idx) => {
          const isComplete = idx <= currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step.status}
              className="flex flex-col items-center flex-1"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  isComplete
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-700 text-gray-500'
                } ${isCurrent ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-gray-900' : ''}`}
              >
                {step.icon}
              </div>
              <span className={`text-xs mt-1 ${isComplete ? 'text-amber-400' : 'text-gray-600'}`}>
                {step.label}
              </span>
              {/* Connector Line */}
              {idx < statusSteps.length - 1 && (
                <div
                  className={`absolute h-1 w-[calc(100%/5)] ${
                    idx < currentStepIndex ? 'bg-amber-500' : 'bg-gray-700'
                  }`}
                  style={{ left: `calc(${(idx + 0.5) * 20}%)`, top: '20px' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Overall Progress</span>
          <span className="text-amber-400">{discoveryPercent}%</span>
        </div>
        <ProgressBar
          value={discoveryPercent}
          max={100}
          color="amber"
          className="h-3"
        />
      </div>

      {/* Clues & Rumors Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800/50 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Clues Found</span>
            <span className="text-amber-400 font-bold">{progress.cluesFound}</span>
          </div>
          {!isDiscovered && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={onDiscoverClue}
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search for Clues'}
            </Button>
          )}
        </div>
        <div className="bg-gray-800/50 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Rumors Heard</span>
            <span className="text-blue-400 font-bold">{progress.rumorsHeard}</span>
          </div>
          {!isDiscovered && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={onHearRumor}
              disabled={isLoading}
            >
              {isLoading ? 'Listening...' : 'Listen for Rumors'}
            </Button>
          )}
        </div>
      </div>

      {/* Discovery Hints */}
      {!isDiscovered && legendary.discoveryHints && legendary.discoveryHints.length > 0 && (
        <div className="border-t border-gray-700 pt-3">
          <h4 className="text-sm text-gray-400 mb-2">Hints</h4>
          <ul className="space-y-1 text-sm text-gray-500">
            {legendary.discoveryHints.slice(0, progress.cluesFound + 1).map((hint, idx) => (
              <li key={idx} className="flex gap-2">
                <span>💡</span>
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Discovered message */}
      {isDiscovered && (
        <div className="p-3 bg-green-900/30 rounded text-center text-green-400">
          This legendary has been discovered! You can now hunt it.
        </div>
      )}
    </Card>
  );
}

export default DiscoveryProgress;
