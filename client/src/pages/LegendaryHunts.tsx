/**
 * LegendaryHunts Page
 * Main page for legendary animal hunting system
 * Phase 3: Missing Frontend Pages
 */

import { useEffect, useState, useCallback } from 'react';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import {
  LegendaryEncyclopedia,
  DiscoveryProgress,
  TrophyCase,
  LegendaryLeaderboard,
  LegendaryBattle,
} from '@/components/legendary';
import {
  useLegendaryHunt,
  type LegendaryWithProgress,
  type LegendaryAnimal,
} from '@/hooks/useLegendaryHunt';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';

type TabView = 'encyclopedia' | 'trophies';
type DetailView = 'none' | 'legendary' | 'leaderboard' | 'combat';

interface LeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  bestTime: number;
  wins: number;
  trophiesCollected: number;
  achievedAt: string;
}

export function LegendaryHunts() {
  const {
    legendaries,
    trophies,
    currentSession,
    isLoading,
    error,
    fetchLegendaries,
    fetchTrophies,
    discoverClue,
    hearRumor,
    initiateHunt,
    executeHuntTurn,
    abandonHunt,
    claimRewards,
    getLeaderboard,
    clearError,
  } = useLegendaryHunt();

  const { currentCharacter } = useCharacterStore();
  const toast = useToast();

  // UI State
  const [activeTab, setActiveTab] = useState<TabView>('encyclopedia');
  const [detailView, setDetailView] = useState<DetailView>('none');
  const [selectedLegendary, setSelectedLegendary] = useState<LegendaryWithProgress | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [combatLegendary, setCombatLegendary] = useState<LegendaryAnimal | null>(null);

  // Load data on mount
  useEffect(() => {
    fetchLegendaries();
    fetchTrophies();
  }, [fetchLegendaries, fetchTrophies]);

  // Transform useLegendaryHunt data to match component expectations
  const transformedLegendaries = legendaries.map(item => ({
    legendary: {
      _id: item.legendary.id,
      name: item.legendary.name,
      description: item.legendary.description,
      category: (item.legendary.category?.toLowerCase() || 'predator') as any,
      location: item.legendary.locations?.[0] || 'Unknown',
      level: item.legendary.levelRequirement || 1,
      health: item.legendary.baseStats?.health || 100,
      maxHealth: item.legendary.baseStats?.health || 100,
      abilities: item.legendary.abilities?.map(a => ({
        name: a.name,
        description: a.description,
        damage: a.damage,
        cooldown: a.cooldown,
        effect: a.effect,
      })) || [],
      resistances: {},
      weaknesses: [],
      behaviorPattern: '',
      discoveryHints: [],
      lore: item.legendary.lore || '',
      rewards: {
        experience: 0,
        gold: 0,
        items: [],
        trophy: { name: '', description: '', bonuses: [] },
      },
    },
    progress: item.record ? {
      legendaryId: item.record.legendaryId,
      discoveryStatus: (item.record.discoveryStatus?.toLowerCase() || 'unknown') as any,
      cluesFound: item.record.cluesFound || 0,
      rumorsHeard: item.record.rumorsHeard || 0,
      encountersAttempted: item.record.encountersAttempted || 0,
      encountersWon: item.record.wins || 0,
      encountersLost: item.record.losses || 0,
      bestTime: item.record.bestTime,
      hasTrophy: (item.record.trophiesCollected?.length || 0) > 0,
      lastEncounterDate: item.record.lastEncounterAt,
    } : {
      legendaryId: item.legendary.id,
      discoveryStatus: 'unknown' as const,
      cluesFound: 0,
      rumorsHeard: 0,
      encountersAttempted: 0,
      encountersWon: 0,
      encountersLost: 0,
      hasTrophy: false,
    },
  }));

  // Transform trophies
  const transformedTrophies = trophies.map(t => ({
    _id: t.id,
    legendaryId: t.id,
    legendaryName: t.name,
    category: 'predator' as const,
    defeatedAt: t.obtainedAt,
    completionTime: t.displayValue || 0,
    bonuses: [],
    equipped: false,
  }));

  // Handle selecting a legendary
  const handleSelectLegendary = useCallback((item: any) => {
    const original = legendaries.find(l => l.legendary.id === item.legendary._id);
    setSelectedLegendary(original || null);
    setDetailView('legendary');
  }, [legendaries]);

  // Handle initiating hunt
  const handleInitiateHunt = useCallback(async (legendaryId: string) => {
    const legendary = legendaries.find(l => l.legendary.id === legendaryId);
    if (!legendary) return;

    const location = legendary.legendary.locations?.[0] || 'unknown';
    const result = await initiateHunt(legendaryId, location);

    if (result.success && result.legendary) {
      toast.success('Hunt Started!', `Prepare to face ${legendary.legendary.name}!`);
      setCombatLegendary(result.legendary);
      setDetailView('combat');
    } else {
      toast.error('Hunt Failed', result.message);
    }
  }, [legendaries, initiateHunt, toast]);

  // Handle resuming active hunt
  const handleResumeHunt = useCallback(() => {
    if (!currentSession) return;

    // Find the legendary for this session
    const legendary = legendaries.find(l => l.legendary.id === currentSession.legendaryId);
    if (legendary) {
      setCombatLegendary(legendary.legendary);
      setDetailView('combat');
    }
  }, [currentSession, legendaries]);

  // Handle closing combat
  const handleCloseCombat = useCallback(() => {
    setDetailView('none');
    setCombatLegendary(null);
    fetchLegendaries(); // Refresh data after combat
  }, [fetchLegendaries]);

  // Handle discover clue
  const handleDiscoverClue = useCallback(async () => {
    if (!selectedLegendary) return;

    const location = selectedLegendary.legendary.locations?.[0] || 'unknown';
    const result = await discoverClue(selectedLegendary.legendary.id, location);

    if (result.success) {
      toast.success('Clue Found!', result.clueText || result.message);
    } else {
      toast.info('No Clue Found', result.message);
    }
  }, [selectedLegendary, discoverClue, toast]);

  // Handle hear rumor
  const handleHearRumor = useCallback(async () => {
    if (!selectedLegendary) return;

    const result = await hearRumor(selectedLegendary.legendary.id, 'tavern_npc');

    if (result.success) {
      toast.info('Rumor Heard', result.rumorText || result.message);
    } else {
      toast.info('No Rumors', result.message);
    }
  }, [selectedLegendary, hearRumor, toast]);

  // Handle view leaderboard
  const handleViewLeaderboard = useCallback(async (legendaryId: string) => {
    const data = await getLeaderboard(legendaryId);
    setLeaderboardData(data as unknown as LeaderboardEntry[]);
    setDetailView('leaderboard');
  }, [getLeaderboard]);

  // Close detail view
  const handleCloseDetail = () => {
    setDetailView('none');
    setSelectedLegendary(null);
    setLeaderboardData([]);
  };

  // Loading state
  if (isLoading && legendaries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-amber-400 mb-2">Legendary Hunts</h1>
        <p className="text-gray-400">
          Track and hunt legendary animals across the frontier. Discover clues, gather rumors,
          and claim the ultimate trophies!
        </p>
      </div>

      {/* Active Hunt Warning */}
      {currentSession && detailView !== 'combat' && (
        <Card className="p-4 mb-6 border-red-500 bg-red-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚔️</span>
              <div>
                <h3 className="font-bold text-red-400">Active Hunt in Progress!</h3>
                <p className="text-gray-400 text-sm">
                  You have an ongoing legendary hunt. Complete or abandon it to start a new one.
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={handleResumeHunt}>
              Resume Hunt
            </Button>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-500 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-red-400">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'encyclopedia' ? 'primary' : 'ghost'}
          onClick={() => { setActiveTab('encyclopedia'); handleCloseDetail(); }}
        >
          Encyclopedia
        </Button>
        <Button
          variant={activeTab === 'trophies' ? 'primary' : 'ghost'}
          onClick={() => { setActiveTab('trophies'); handleCloseDetail(); }}
        >
          Trophy Case ({transformedTrophies.length})
        </Button>
      </div>

      {/* Combat View */}
      {detailView === 'combat' && currentSession && combatLegendary && (
        <div className="mb-6">
          <Button variant="ghost" onClick={handleCloseCombat} className="mb-4">
            &larr; Abandon &amp; Return
          </Button>
          <LegendaryBattle
            session={currentSession}
            legendary={combatLegendary}
            onExecuteTurn={executeHuntTurn}
            onAbandonHunt={abandonHunt}
            onClaimRewards={claimRewards}
            onClose={handleCloseCombat}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Detail Overlay */}
      {detailView === 'legendary' && selectedLegendary && (
        <div className="mb-6">
          <Button variant="ghost" onClick={handleCloseDetail} className="mb-4">
            &larr; Back to Encyclopedia
          </Button>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Legendary Info */}
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">
                  {selectedLegendary.record?.discoveryStatus === 'DEFEATED' ? '🏆' : '🦁'}
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-amber-400">
                    {selectedLegendary.legendary.name}
                  </h2>
                  <p className="text-gray-400">{selectedLegendary.legendary.description}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-800/50 rounded p-3 text-center">
                  <div className="text-xl font-bold text-red-400">
                    {selectedLegendary.legendary.baseStats?.health || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">Health</div>
                </div>
                <div className="bg-gray-800/50 rounded p-3 text-center">
                  <div className="text-xl font-bold text-amber-400">
                    {selectedLegendary.legendary.baseStats?.damage || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">Damage</div>
                </div>
                <div className="bg-gray-800/50 rounded p-3 text-center">
                  <div className="text-xl font-bold text-blue-400">
                    {selectedLegendary.legendary.levelRequirement}
                  </div>
                  <div className="text-xs text-gray-500">Level Req</div>
                </div>
              </div>

              {/* Lore */}
              {selectedLegendary.legendary.lore && (
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="font-bold text-gray-300 mb-2">Lore</h3>
                  <p className="text-sm text-gray-400 italic">
                    "{selectedLegendary.legendary.lore}"
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleInitiateHunt(selectedLegendary.legendary.id)}
                  disabled={isLoading || !selectedLegendary.canSpawn}
                >
                  {isLoading ? 'Loading...' : 'Start Hunt'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleViewLeaderboard(selectedLegendary.legendary.id)}
                >
                  Leaderboard
                </Button>
              </div>
            </Card>

            {/* Discovery Progress */}
            <DiscoveryProgress
              legendary={{
                _id: selectedLegendary.legendary.id,
                name: selectedLegendary.legendary.name,
                description: selectedLegendary.legendary.description,
                category: 'predator',
                location: selectedLegendary.legendary.locations?.[0] || 'Unknown',
                level: selectedLegendary.legendary.levelRequirement,
                health: selectedLegendary.legendary.baseStats?.health || 100,
                maxHealth: selectedLegendary.legendary.baseStats?.health || 100,
                abilities: [],
                resistances: {},
                weaknesses: [],
                behaviorPattern: '',
                discoveryHints: [],
                lore: selectedLegendary.legendary.lore || '',
                rewards: { experience: 0, gold: 0, items: [], trophy: { name: '', description: '', bonuses: [] } },
              }}
              progress={{
                legendaryId: selectedLegendary.legendary.id,
                discoveryStatus: (selectedLegendary.record?.discoveryStatus?.toLowerCase() || 'unknown') as any,
                cluesFound: selectedLegendary.record?.cluesFound || 0,
                rumorsHeard: selectedLegendary.record?.rumorsHeard || 0,
                encountersAttempted: selectedLegendary.record?.encountersAttempted || 0,
                encountersWon: selectedLegendary.record?.wins || 0,
                encountersLost: selectedLegendary.record?.losses || 0,
                hasTrophy: (selectedLegendary.record?.trophiesCollected?.length || 0) > 0,
              }}
              onDiscoverClue={handleDiscoverClue}
              onHearRumor={handleHearRumor}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Leaderboard View */}
      {detailView === 'leaderboard' && selectedLegendary && (
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setDetailView('legendary')} className="mb-4">
            &larr; Back to Legendary
          </Button>
          <LegendaryLeaderboard
            legendaryName={selectedLegendary.legendary.name}
            entries={leaderboardData.map(e => ({
              rank: e.rank,
              characterId: e.characterId,
              characterName: e.characterName,
              completionTime: e.bestTime || 0,
              defeatedAt: e.achievedAt,
              turnsUsed: e.wins || 0,
            }))}
            isLoading={isLoading}
            currentCharacterId={currentCharacter?._id}
          />
        </div>
      )}

      {/* Main Content */}
      {detailView === 'none' && (
        <>
          {activeTab === 'encyclopedia' && (
            <LegendaryEncyclopedia
              legendaries={transformedLegendaries}
              isLoading={isLoading}
              onSelectLegendary={handleSelectLegendary}
              onInitiateHunt={handleInitiateHunt}
            />
          )}

          {activeTab === 'trophies' && (
            <TrophyCase
              trophies={transformedTrophies}
              isLoading={isLoading}
            />
          )}
        </>
      )}

      {/* Info Section - hidden during combat */}
      {detailView !== 'combat' && (
      <Card className="mt-8 p-6 bg-gray-800/30">
        <h3 className="font-bold text-gray-300 mb-4">About Legendary Hunts</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <h4 className="text-amber-400 mb-2">Discovery Process</h4>
            <ul className="space-y-1">
              <li>• Listen for rumors at taverns and from NPCs</li>
              <li>• Search locations for clues about legendaries</li>
              <li>• Progress from Unknown → Rumored → Tracked → Discovered</li>
              <li>• Only discovered legendaries can be hunted</li>
            </ul>
          </div>
          <div>
            <h4 className="text-amber-400 mb-2">Combat Tips</h4>
            <ul className="space-y-1">
              <li>• Each legendary has unique abilities and phases</li>
              <li>• Learn their attack patterns and weaknesses</li>
              <li>• Bring appropriate items and gear</li>
              <li>• Defeating a legendary earns you their trophy</li>
            </ul>
          </div>
        </div>
      </Card>
      )}
    </div>
  );
}

export default LegendaryHunts;
