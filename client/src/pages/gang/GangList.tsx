/**
 * Gang List Page
 * Directory of all gangs with filtering, sorting, and search
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGangStore } from '@/store/useGangStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { Button, Card, Input } from '@/components/ui';
import { Gang, GangSearchFilters } from '@desperados/shared';

export function GangList() {
  const navigate = useNavigate();
  const { currentCharacter } = useCharacterStore();
  const { gangs, gangsPagination, fetchGangs, isLoading, currentGang } = useGangStore();

  const [sortBy, setSortBy] = useState<'level' | 'members' | 'territories'>('level');
  const [search, setSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const filters: GangSearchFilters = {
      sortBy,
      sortOrder: 'desc',
      limit: 50,
      offset: 0,
    };

    if (search) {
      filters.search = search;
    }

    fetchGangs(filters);
  }, [sortBy, search, fetchGangs]);

  const handleSearchChange = (value: string) => {
    setSearch(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      const filters: GangSearchFilters = {
        sortBy,
        sortOrder: 'desc',
        search: value,
        limit: 50,
        offset: 0,
      };
      fetchGangs(filters);
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleGangClick = (gang: Gang) => {
    navigate(`/game/gang/${gang._id}`);
  };

  const canCreateGang = currentCharacter && !currentGang;

  return (
    <div className="min-h-screen bg-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-western text-amber-900">Gangs of Sangre Territory</h1>
            <p className="text-amber-700 mt-2">Join or create your outlaw gang</p>
          </div>
          {canCreateGang && (
            <Button
              onClick={() => navigate('/game/gang/create')}
              className="bg-amber-700 hover:bg-amber-800 text-white font-semibold"
            >
              Create Gang
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search gangs by name..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'level' | 'members' | 'territories')}
              className="px-4 py-2 border border-amber-900 rounded bg-white"
            >
              <option value="level">By Level</option>
              <option value="members">By Members</option>
              <option value="territories">By Territories</option>
            </select>
          </div>
        </div>

        {isLoading && gangs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-amber-700">Loading gangs...</div>
          </div>
        ) : gangs.length === 0 ? (
          <Card className="bg-amber-100 border-2 border-amber-900 p-12 text-center">
            <div className="text-4xl mb-4">🤠</div>
            <h2 className="text-2xl font-western text-amber-900 mb-4">No Gangs Yet</h2>
            <p className="text-amber-700 mb-6">Be the first to create a gang in Sangre Territory!</p>
            {canCreateGang && (
              <Button
                onClick={() => navigate('/game/gang/create')}
                className="bg-amber-700 hover:bg-amber-800 text-white font-semibold"
              >
                Create Gang
              </Button>
            )}
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gangs.map((gang) => (
                <Card
                  key={gang._id}
                  className="bg-amber-100 border-2 border-amber-900 hover:border-amber-700 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleGangClick(gang)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-western text-amber-900">{gang.name}</h3>
                        <div className="inline-block bg-amber-900 text-amber-50 px-2 py-1 rounded text-sm font-semibold mt-1">
                          [{gang.tag}]
                        </div>
                      </div>
                      <div className="bg-amber-700 text-white px-3 py-1 rounded font-semibold text-lg">
                        Lv {gang.level}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-amber-800">
                      <div className="flex justify-between">
                        <span>Members:</span>
                        <span className="font-semibold">
                          {gang.members.length}/{gang.maxMembers}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Territories:</span>
                        <span className="font-semibold">{gang.territories.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>W/L Record:</span>
                        <span className="font-semibold">
                          {gang.stats.warsWon}/{gang.stats.warsLost}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-amber-300">
                      <div className="text-xs text-amber-700">
                        Led by {gang.members.find((m) => m.role === 'leader')?.characterName || 'Unknown'}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {gangsPagination.hasMore && (
              <div className="mt-8 text-center">
                <Button
                  onClick={() => {
                    const filters: GangSearchFilters = {
                      sortBy,
                      sortOrder: 'desc',
                      limit: 50,
                      offset: gangs.length,
                      search: search || undefined,
                    };
                    fetchGangs(filters);
                  }}
                  disabled={isLoading}
                  variant="secondary"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
