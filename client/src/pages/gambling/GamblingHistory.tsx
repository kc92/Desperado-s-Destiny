/**
 * Gambling History Page
 * Shows past gambling sessions
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, EmptyState } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { getGameName, getGameIcon } from '@/components/gambling';
import { useGamblingStore } from '@/store/useGamblingStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { formatDollars, formatTimeAgo } from '@/utils/format';

export const GamblingHistory: React.FC = () => {
  const navigate = useNavigate();
  const { currentCharacter } = useCharacterStore();
  const { sessionHistory, isLoading, loadHistory } = useGamblingStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  if (!currentCharacter) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card variant="leather">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-western text-gold-light mb-4">No Character Selected</h2>
            <p className="text-desert-sand">Please select a character to view history.</p>
          </div>
        </Card>
      </div>
    );
  }

  // Calculate summary stats
  const totalSessions = sessionHistory.length;
  const totalWagered = sessionHistory.reduce((sum, s) => sum + s.totalWagered, 0);
  const totalWon = sessionHistory.reduce((sum, s) => sum + (s.totalWagered + s.netResult), 0);
  const netResult = sessionHistory.reduce((sum, s) => sum + s.netResult, 0);
  const winningSessions = sessionHistory.filter((s) => s.netResult > 0).length;
  const winRate = totalSessions > 0 ? (winningSessions / totalSessions) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="leather">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-western text-gold-light">Gambling History</h1>
              <p className="text-desert-sand font-serif mt-1">Your past sessions and results</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/gambling')}>
              Back to Games
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      {sessionHistory.length > 0 && (
        <Card variant="wood">
          <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-xs text-desert-stone">Sessions</p>
              <p className="text-xl font-western text-desert-sand">{totalSessions}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-desert-stone">Total Wagered</p>
              <p className="text-xl font-western text-desert-sand">{formatDollars(totalWagered)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-desert-stone">Total Won</p>
              <p className="text-xl font-western text-green-400">{formatDollars(totalWon)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-desert-stone">Net Result</p>
              <p className={`text-xl font-western ${netResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {netResult >= 0 ? '+' : ''}{formatDollars(netResult)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-desert-stone">Win Rate</p>
              <p className="text-xl font-western text-desert-sand">{winRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card variant="parchment">
          <div className="p-6">
            <CardGridSkeleton count={5} columns={1} />
          </div>
        </Card>
      )}

      {/* History List */}
      {!isLoading && (
        <Card variant="parchment">
          <div className="p-6">
            {sessionHistory.length === 0 ? (
              <EmptyState
                icon="📜"
                title="No Gambling History"
                description="Start playing to build your history!"
                variant="default"
                size="md"
                action={{
                  label: 'Play Now',
                  onClick: () => navigate('/gambling'),
                }}
              />
            ) : (
              <div className="space-y-3">
                {sessionHistory.map((session) => (
                  <div
                    key={session._id}
                    className="bg-wood-grain/10 p-4 rounded-lg flex justify-between items-center hover:bg-wood-grain/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getGameIcon(session.gameType)}</span>
                      <div>
                        <p className="font-bold text-wood-dark">{getGameName(session.gameType)}</p>
                        <p className="text-sm text-wood-grain">
                          {session.locationName || 'Unknown Location'} - {session.handsPlayed} hands
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${session.netResult >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {session.netResult >= 0 ? '+' : ''}{formatDollars(session.netResult)}
                      </p>
                      <p className="text-xs text-wood-grain">
                        {formatTimeAgo(new Date(session.endTime))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default GamblingHistory;
