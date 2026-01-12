/**
 * Gambling Leaderboard Page
 * Shows top gamblers and high rollers
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, EmptyState } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { getGameName, getGameIcon } from '@/components/gambling';
import { useGamblingStore } from '@/store/useGamblingStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { formatDollars } from '@/utils/format';
import type { GameType } from '@/services/gambling.service';

type FilterType = 'all' | GameType;

export const GamblingLeaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentCharacter } = useCharacterStore();
  const { leaderboard, isLoading, loadLeaderboard } = useGamblingStore();
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const filteredLeaderboard = filter === 'all'
    ? leaderboard
    : leaderboard.filter((entry) => entry.gameType === filter);

  const games: GameType[] = ['blackjack', 'roulette', 'craps', 'faro', 'three_card_monte', 'wheel_of_fortune'];

  if (!currentCharacter) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card variant="leather">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-western text-gold-light mb-4">No Character Selected</h2>
            <p className="text-desert-sand">Please select a character to view leaderboard.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="leather">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-western text-gold-light">High Rollers</h1>
              <p className="text-desert-sand font-serif mt-1">The territory's most notorious gamblers</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/gambling')}>
              Back to Games
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm font-serif transition-all ${
                filter === 'all'
                  ? 'bg-gold-light text-wood-dark'
                  : 'bg-wood-dark/50 text-desert-sand hover:bg-wood-dark/70'
              }`}
            >
              All Games
            </button>
            {games.map((game) => (
              <button
                key={game}
                onClick={() => setFilter(game)}
                className={`px-3 py-1 rounded text-sm font-serif transition-all flex items-center gap-1 ${
                  filter === game
                    ? 'bg-gold-light text-wood-dark'
                    : 'bg-wood-dark/50 text-desert-sand hover:bg-wood-dark/70'
                }`}
              >
                <span>{getGameIcon(game)}</span>
                <span>{getGameName(game)}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card variant="parchment">
          <div className="p-6">
            <CardGridSkeleton count={10} columns={1} />
          </div>
        </Card>
      )}

      {/* Leaderboard */}
      {!isLoading && (
        <Card variant="parchment">
          <div className="p-6">
            {filteredLeaderboard.length === 0 ? (
              <EmptyState
                icon="🏆"
                title="No High Rollers Yet"
                description={filter === 'all'
                  ? 'Be the first to make the leaderboard!'
                  : `No leaders for ${getGameName(filter as GameType)} yet. Be the first!`
                }
                variant="default"
                size="md"
                action={{
                  label: 'Play Now',
                  onClick: () => navigate('/gambling'),
                }}
              />
            ) : (
              <div className="space-y-2">
                {filteredLeaderboard.map((entry, index) => (
                  <div
                    key={`${entry.characterId}-${entry.gameType}-${index}`}
                    className={`
                      p-4 rounded-lg transition-all
                      ${entry.rank <= 3 ? 'bg-gold-light/10 border border-gold-light/30' : 'bg-wood-grain/5'}
                      hover:bg-wood-grain/10
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Rank */}
                        <div className="text-2xl font-bold text-wood-dark w-12 text-center">
                          {entry.rank === 1 && '🥇'}
                          {entry.rank === 2 && '🥈'}
                          {entry.rank === 3 && '🥉'}
                          {entry.rank > 3 && <span className="text-lg">#{entry.rank}</span>}
                        </div>

                        {/* Game Icon */}
                        <span className="text-3xl">{getGameIcon(entry.gameType)}</span>

                        {/* Player Info */}
                        <div>
                          <div className="font-western text-lg text-wood-dark">
                            {entry.characterName}
                          </div>
                          <div className="text-sm text-wood-grain flex items-center gap-2">
                            <span>{getGameName(entry.gameType)}</span>
                            <span className="text-wood-grain/50">|</span>
                            <span>{Math.round(entry.winRate * 100)}% wins</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="font-western text-lg text-gold-dark">
                          Biggest Win: {formatDollars(entry.biggestWin)}
                        </div>
                        <div className="text-sm text-wood-grain flex items-center gap-3 justify-end">
                          <span>Total: {formatDollars(entry.totalWon)}</span>
                          <span className={entry.winRate >= 50 ? 'text-green-500' : 'text-red-400'}>
                            {(entry.winRate * 100).toFixed(1)}% win rate
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Highlight for current player */}
                    {entry.characterId === currentCharacter._id && (
                      <div className="mt-2 text-center text-sm text-gold-dark font-serif">
                        This is you!
                      </div>
                    )}
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

export default GamblingLeaderboard;
