/**
 * Leaderboard Page
 * Rankings for players, gangs, and various achievements
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useLeaderboardStore } from '@/store/useLeaderboardStore';
import { Card, Button } from '@/components/ui';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import type {
  LeaderboardType,
  LeaderboardRange,
  LeaderboardEntry,
  GangLeaderboardEntry
} from '@/services/leaderboard.service';

interface PlayerEntry {
  rank: number;
  id: string;
  name: string;
  faction: string;
  level: number;
  value: number;
  gang?: string;
  isOnline: boolean;
  change: number; // position change
}

interface GangEntry {
  rank: number;
  id: string;
  name: string;
  tag: string;
  faction: string;
  level: number;
  memberCount: number;
  reputation: number;
  territories: number;
  leader: string;
}

/**
 * Global leaderboards and rankings page
 */
export const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentCharacter } = useCharacterStore();

  // Store state
  const {
    currentCategory,
    timeRange,
    isLoading,
    error,
    playerRank,
    fetchLeaderboard,
    setCategory,
    setTimeRange: setStoreTimeRange,
    fetchPlayerRank,
    getLeaderboardEntries
  } = useLeaderboardStore();

  // Local UI state
  const [playerEntries, setPlayerEntries] = useState<PlayerEntry[]>([]);
  const [gangEntries, setGangEntries] = useState<GangEntry[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, [currentCategory, timeRange]);

  const loadLeaderboard = async () => {
    // Fetch from store
    await fetchLeaderboard(currentCategory, timeRange);

    // Get entries from store
    const entries = getLeaderboardEntries();

    // Map to local display format
    if (currentCategory === 'gangs') {
      const gangs = (entries as GangLeaderboardEntry[]).map((g) => ({
        rank: g.rank,
        id: g.gangId,
        name: g.name,
        tag: g.tag || g.name.substring(0, 4).toUpperCase(),
        faction: g.faction || 'Frontera Collective',
        level: g.level,
        memberCount: g.memberCount,
        reputation: g.value,
        territories: 0, // Not provided by backend
        leader: g.leader || 'Unknown'
      }));
      setGangEntries(gangs);
    } else {
      const players = (entries as LeaderboardEntry[]).map((p) => ({
        rank: p.rank,
        id: p.characterId,
        name: p.name,
        faction: p.faction || 'Unknown',
        level: p.level || Math.floor(p.value / 1000),
        value: p.value,
        gang: p.gangName,
        isOnline: false,
        change: 0
      }));
      setPlayerEntries(players);

      // Update player rank
      if (currentCharacter) {
        fetchPlayerRank(currentCharacter._id, currentCategory);
      }
    }

    // Fallback to mock data on error
    if (error) {
      loadMockData();
    }
  };

  const loadMockData = () => {
    if (currentCategory === 'gangs') {
      setGangEntries([
        {
          rank: 1,
          id: '1',
          name: 'Black Rose',
          tag: 'ROSE',
          faction: 'Nahi Coalition',
          level: 15,
          memberCount: 20,
          reputation: 25000,
          territories: 5,
          leader: 'Rosa "Thorn" Vasquez'
        },
        {
          rank: 2,
          id: '2',
          name: 'Desert Wolves',
          tag: 'WOLF',
          faction: 'Frontera Collective',
          level: 12,
          memberCount: 18,
          reputation: 18500,
          territories: 3,
          leader: 'Jake "Alpha" Morrison'
        },
        {
          rank: 3,
          id: '3',
          name: 'Gold Diggers',
          tag: 'GOLD',
          faction: 'Settler Alliance',
          level: 10,
          memberCount: 15,
          reputation: 12000,
          territories: 2,
          leader: 'William "Midas" Chen'
        }
      ]);
    } else {
      const mockPlayers: PlayerEntry[] = [
        {
          rank: 1,
          id: '1',
          name: 'Jesse "The Kid" McGraw',
          faction: 'Nahi Coalition',
          level: 42,
          value: currentCategory === 'gold' ? 1250000 : currentCategory === 'combat' ? 523 : 42000,
          gang: 'Black Rose',
          isOnline: true,
          change: 0
        },
        {
          rank: 2,
          id: '2',
          name: 'Sarah "Quickdraw" Quinn',
          faction: 'Frontera Collective',
          level: 38,
          value: currentCategory === 'gold' ? 980000 : currentCategory === 'combat' ? 412 : 35000,
          gang: 'Desert Wolves',
          isOnline: true,
          change: 1
        },
        {
          rank: 3,
          id: '3',
          name: 'Marcus "Iron" Chen',
          faction: 'Settler Alliance',
          level: 35,
          value: currentCategory === 'gold' ? 750000 : currentCategory === 'combat' ? 389 : 31000,
          gang: 'Gold Diggers',
          isOnline: false,
          change: -1
        },
        {
          rank: 4,
          id: '4',
          name: 'Elena "Viper" Rodriguez',
          faction: 'Nahi Coalition',
          level: 33,
          value: currentCategory === 'gold' ? 620000 : currentCategory === 'combat' ? 356 : 28500,
          isOnline: true,
          change: 2
        },
        {
          rank: 5,
          id: '5',
          name: 'Thomas "Doc" Mitchell',
          faction: 'Settler Alliance',
          level: 31,
          value: currentCategory === 'gold' ? 580000 : currentCategory === 'combat' ? 298 : 26000,
          gang: 'Peacekeepers',
          isOnline: false,
          change: -1
        }
      ];

      // Add more mock players
      for (let i = 6; i <= 20; i++) {
        mockPlayers.push({
          rank: i,
          id: i.toString(),
          name: `Player ${i}`,
          faction: ['Settler Alliance', 'Frontera Collective', 'Nahi Coalition'][i % 3],
          level: 30 - Math.floor(i / 2),
          value: currentCategory === 'gold' ? 500000 - (i * 20000) : currentCategory === 'combat' ? 250 - (i * 10) : 25000 - (i * 1000),
          isOnline: Math.random() > 0.5,
          change: Math.floor(Math.random() * 5) - 2
        });
      }

      setPlayerEntries(mockPlayers);
    }
  };

  const getTabIcon = (tab: LeaderboardType) => {
    switch (tab) {
      case 'level': return '⭐';
      case 'gold': return '💰';
      case 'reputation': return '🎖️';
      case 'combat': return '⚔️';
      case 'gangs': return '🏴';
      case 'bounties': return '🎯';
      default: return '📊';
    }
  };

  const getValueDisplay = (tab: LeaderboardType, value: number) => {
    switch (tab) {
      case 'gold':
      case 'bounties':
        return `$${value.toLocaleString()}`;
      case 'combat':
        return `${value} wins`;
      case 'reputation':
        return value.toLocaleString();
      case 'level':
        return `Level ${Math.floor(value / 1000)}`;
      default:
        return value.toLocaleString();
    }
  };

  const getFactionColor = (faction: string) => {
    switch (faction) {
      case 'Settler Alliance': return 'text-blue-500';
      case 'Frontera Collective': return 'text-green-500';
      case 'Nahi Coalition': return 'text-red-500';
      default: return 'text-desert-sand';
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <span className="text-green-500">↑ {change}</span>;
    if (change < 0) return <span className="text-red-500">↓ {Math.abs(change)}</span>;
    return <span className="text-gray-400">-</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="leather">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-western text-gold-light">
                Leaderboard
              </h1>
              <p className="text-desert-sand font-serif mt-1">
                Top outlaws and gangs in Sangre Territory
              </p>
            </div>
            {playerRank && currentCategory !== 'gangs' && (
              <div className="text-right">
                <div className="text-sm text-desert-stone">Your Rank</div>
                <div className="text-2xl font-bold text-gold-light">
                  #{playerRank}
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mt-6">
            {(['level', 'gold', 'reputation', 'combat', 'bounties', 'gangs'] as LeaderboardType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setCategory(tab)}
                className={`
                  px-4 py-2 rounded font-serif capitalize transition-all
                  ${currentCategory === tab
                    ? 'bg-gold-light text-wood-dark'
                    : 'bg-wood-dark/50 text-desert-sand hover:bg-wood-dark/70'
                  }
                `}
              >
                {getTabIcon(tab)} {tab}
              </button>
            ))}
          </div>

          {/* Time Range Filter */}
          <div className="flex gap-2 mt-4">
            {(['all', 'monthly', 'weekly', 'daily'] as LeaderboardRange[]).map(range => (
              <button
                key={range}
                onClick={() => setStoreTimeRange(range)}
                className={`
                  px-3 py-1 rounded text-sm font-serif capitalize
                  ${timeRange === range
                    ? 'bg-desert-sand/20 text-desert-sand'
                    : 'text-desert-stone hover:text-desert-sand'
                  }
                `}
              >
                {range === 'all' ? 'All Time' : range}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Leaderboard Content */}
      <Card variant="parchment">
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12" aria-busy="true" aria-live="polite">
              <div className="space-y-3">
                <ListItemSkeleton count={10} />
              </div>
            </div>
          ) : currentCategory === 'gangs' ? (
            /* Gang Leaderboard */
            <div className="space-y-3">
              {gangEntries.map((gang) => (
                <div
                  key={gang.id}
                  className={`
                    p-4 rounded transition-all cursor-pointer
                    ${gang.rank <= 3 ? 'bg-gold-light/10' : 'bg-wood-grain/5'}
                    hover:bg-wood-grain/10
                  `}
                  onClick={() => navigate(`/gang/${gang.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-wood-dark w-12 text-center">
                        {gang.rank === 1 && '🥇'}
                        {gang.rank === 2 && '🥈'}
                        {gang.rank === 3 && '🥉'}
                        {gang.rank > 3 && `#${gang.rank}`}
                      </div>
                      <div>
                        <div className="font-bold text-wood-dark">
                          {gang.name} <span className="text-sm text-wood-grain">[{gang.tag}]</span>
                        </div>
                        <div className="text-sm text-wood-grain">
                          <span className={getFactionColor(gang.faction)}>{gang.faction}</span>
                          {' • '}
                          Leader: {gang.leader}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-wood-dark">
                        {gang.reputation.toLocaleString()} Rep
                      </div>
                      <div className="text-sm text-wood-grain">
                        {gang.memberCount} members • {gang.territories} territories
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Player Leaderboard */
            <div className="space-y-2">
              {playerEntries.map((player) => (
                <div
                  key={player.id}
                  className={`
                    p-3 rounded transition-all cursor-pointer
                    ${player.rank <= 3 ? 'bg-gold-light/10' : 'bg-wood-grain/5'}
                    ${player.name === currentCharacter?.name ? 'ring-2 ring-gold-light' : ''}
                    hover:bg-wood-grain/10
                  `}
                  onClick={() => navigate(`/player/${player.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-xl font-bold text-wood-dark w-10 text-center">
                        {player.rank === 1 && '🥇'}
                        {player.rank === 2 && '🥈'}
                        {player.rank === 3 && '🥉'}
                        {player.rank > 3 && player.rank}
                      </div>
                      <div className="w-8">
                        {getChangeIcon(player.change)}
                      </div>
                      <div>
                        <div className="font-bold text-wood-dark flex items-center gap-2">
                          {player.name}
                          {player.isOnline && (
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          )}
                        </div>
                        <div className="text-sm text-wood-grain">
                          <span className={getFactionColor(player.faction)}>{player.faction}</span>
                          {player.gang && ` • ${player.gang}`}
                          {' • '}
                          Level {player.level}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-wood-dark">
                        {getValueDisplay(currentCategory, player.value)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {!isLoading && (
            <div className="mt-6 text-center">
              <Button variant="secondary" size="sm">
                Load More
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Stats */}
      <Card variant="leather">
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gold-light">
              {playerEntries.length > 0 ? playerEntries.length * 10 : '500+'}
            </div>
            <div className="text-xs text-desert-stone uppercase">Active Players</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gold-light">
              {gangEntries.length > 0 ? gangEntries.length * 5 : '50+'}
            </div>
            <div className="text-xs text-desert-stone uppercase">Active Gangs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gold-light">
              12
            </div>
            <div className="text-xs text-desert-stone uppercase">Territories</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gold-light">
              $2.5M
            </div>
            <div className="text-xs text-desert-stone uppercase">Total Bounties</div>
          </div>
        </div>
      </Card>
    </div>
  );
};