/**
 * LegendaryEncyclopedia Component
 * Grid view of all legendary animals
 */

import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { LegendaryAnimalCard } from './LegendaryAnimalCard';
import {
  legendaryHuntService,
  type LegendaryAnimal,
  type LegendaryProgress,
  type LegendaryCategory,
  type DiscoveryStatus,
} from '@/services/legendaryHunt.service';

interface LegendaryWithProgress {
  legendary: LegendaryAnimal;
  progress: LegendaryProgress;
}

interface LegendaryEncyclopediaProps {
  legendaries: LegendaryWithProgress[];
  isLoading?: boolean;
  onSelectLegendary: (legendary: LegendaryWithProgress) => void;
  onInitiateHunt: (legendaryId: string) => void;
}

type CategoryFilter = 'all' | LegendaryCategory;
type StatusFilter = 'all' | DiscoveryStatus;

export function LegendaryEncyclopedia({
  legendaries,
  isLoading,
  onSelectLegendary,
  onInitiateHunt,
}: LegendaryEncyclopediaProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Calculate statistics
  const totalDiscovered = legendaries.filter(l =>
    legendaryHuntService.isDiscovered(l.progress)
  ).length;
  const totalDefeated = legendaries.filter(l =>
    legendaryHuntService.isDefeated(l.progress)
  ).length;
  const trophiesCollected = legendaries.filter(l => l.progress.hasTrophy).length;

  // Filter legendaries
  let filtered = [...legendaries];

  if (categoryFilter !== 'all') {
    filtered = filtered.filter(l => l.legendary.category === categoryFilter);
  }

  if (statusFilter !== 'all') {
    filtered = filtered.filter(l => l.progress.discoveryStatus === statusFilter);
  }

  // Sort by discovery progress (discovered first, then by name)
  filtered.sort((a, b) => {
    const aProgress = legendaryHuntService.getDiscoveryProgressPercent(a.progress);
    const bProgress = legendaryHuntService.getDiscoveryProgressPercent(b.progress);
    if (aProgress !== bProgress) return bProgress - aProgress;
    return a.legendary.name.localeCompare(b.legendary.name);
  });

  const categories: { id: CategoryFilter; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '🌟' },
    { id: 'predator', label: 'Predators', icon: '🦁' },
    { id: 'prey', label: 'Prey', icon: '🦌' },
    { id: 'mythical', label: 'Mythical', icon: '🐉' },
    { id: 'extinct', label: 'Extinct', icon: '🦴' },
  ];

  const statuses: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'unknown', label: 'Unknown' },
    { id: 'rumored', label: 'Rumored' },
    { id: 'tracked', label: 'Tracked' },
    { id: 'discovered', label: 'Discovered' },
    { id: 'defeated', label: 'Defeated' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="p-4 bg-gradient-to-r from-amber-900/20 to-transparent">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-300">{legendaries.length}</div>
            <div className="text-xs text-gray-500">Total Legendaries</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{totalDiscovered}</div>
            <div className="text-xs text-gray-500">Discovered</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{totalDefeated}</div>
            <div className="text-xs text-gray-500">Defeated</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">{trophiesCollected}</div>
            <div className="text-xs text-gray-500">Trophies</div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="space-y-3">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={categoryFilter === cat.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setCategoryFilter(cat.id)}
            >
              {cat.icon} {cat.label}
            </Button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {statuses.map(status => (
            <Button
              key={status.id}
              variant={statusFilter === status.id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(status.id)}
            >
              {status.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {filtered.length} of {legendaries.length} legendaries
      </div>

      {/* Legendary Grid */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-2">🔍</div>
          <h3 className="text-lg font-bold text-gray-400">No Legendaries Found</h3>
          <p className="text-sm text-gray-500">
            Try adjusting your filters or explore more to discover legendaries.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(item => (
            <LegendaryAnimalCard
              key={item.legendary._id}
              legendary={item.legendary}
              progress={item.progress}
              onSelect={() => onSelectLegendary(item)}
              onInitiateHunt={
                legendaryHuntService.isDiscovered(item.progress)
                  ? () => onInitiateHunt(item.legendary._id)
                  : undefined
              }
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default LegendaryEncyclopedia;
