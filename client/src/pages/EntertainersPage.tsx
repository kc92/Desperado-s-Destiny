/**
 * Entertainers Page
 * View wandering entertainers, watch performances, and learn skills
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import {
  useEntertainers,
  WanderingEntertainer,
  PerformanceType,
} from '@/hooks/useEntertainers';
import { Card, Button, Modal, EmptyState } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { EntertainerCard, PerformanceList, SkillsList } from '@/components/entertainers';
import { useToast } from '@/store/useToastStore';

type ViewTab = 'at-location' | 'all' | 'by-type';

const performanceTypeIcons: Record<PerformanceType, string> = {
  [PerformanceType.PIANO]: '🎹',
  [PerformanceType.MAGIC]: '🎩',
  [PerformanceType.SINGING]: '🎤',
  [PerformanceType.STORYTELLING]: '📖',
  [PerformanceType.DANCING]: '💃',
  [PerformanceType.HARMONICA]: '🎵',
  [PerformanceType.WILD_WEST_SHOW]: '🤠',
  [PerformanceType.FORTUNE_TELLING]: '🔮',
  [PerformanceType.GOSPEL]: '⛪',
  [PerformanceType.COMEDY]: '😂',
};

const performanceTypeLabels: Record<PerformanceType, string> = {
  [PerformanceType.PIANO]: 'Piano',
  [PerformanceType.MAGIC]: 'Magic',
  [PerformanceType.SINGING]: 'Singing',
  [PerformanceType.STORYTELLING]: 'Storytelling',
  [PerformanceType.DANCING]: 'Dancing',
  [PerformanceType.HARMONICA]: 'Harmonica',
  [PerformanceType.WILD_WEST_SHOW]: 'Wild West Show',
  [PerformanceType.FORTUNE_TELLING]: 'Fortune Telling',
  [PerformanceType.GOSPEL]: 'Gospel',
  [PerformanceType.COMEDY]: 'Comedy',
};

export const EntertainersPage: React.FC = () => {
  const { currentCharacter, currentLocation } = useCharacterStore();
  const { success, error: showError } = useToast();
  const {
    entertainers,
    entertainersAtLocation,
    selectedEntertainer,
    availablePerformances,
    isLoading,
    error,
    fetchAllEntertainers,
    fetchEntertainersAtLocation,
    fetchEntertainerDetails,
    watchPerformance,
    learnSkill,
    getGossip,
    clearSelectedEntertainer,
  } = useEntertainers();

  const [activeTab, setActiveTab] = useState<ViewTab>('at-location');
  const [selectedType, setSelectedType] = useState<PerformanceType | 'all'>('all');
  const [showEntertainerDetail, setShowEntertainerDetail] = useState(false);
  const [detailTab, setDetailTab] = useState<'performances' | 'skills' | 'gossip'>('performances');
  const [gossipMessages, setGossipMessages] = useState<string[]>([]);

  // Get current game day (simplified - would use time system in real implementation)
  const currentDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % 7;

  // Load initial data
  useEffect(() => {
    fetchAllEntertainers();
    if (currentLocation) {
      fetchEntertainersAtLocation(currentLocation, currentDay);
    }
  }, [fetchAllEntertainers, fetchEntertainersAtLocation, currentLocation, currentDay]);

  const handleEntertainerClick = useCallback(
    async (entertainer: WanderingEntertainer) => {
      await fetchEntertainerDetails(entertainer.id);
      setShowEntertainerDetail(true);
      setDetailTab('performances');
      setGossipMessages([]);
    },
    [fetchEntertainerDetails]
  );

  const handleCloseEntertainerDetail = useCallback(() => {
    setShowEntertainerDetail(false);
    clearSelectedEntertainer();
    setGossipMessages([]);
  }, [clearSelectedEntertainer]);

  const handleWatchPerformance = useCallback(
    async (performanceId: string) => {
      if (!selectedEntertainer) return null;
      return await watchPerformance(selectedEntertainer.id, performanceId);
    },
    [selectedEntertainer, watchPerformance]
  );

  const handleLearnSkill = useCallback(
    async (skillId: string) => {
      if (!selectedEntertainer) return null;
      return await learnSkill(selectedEntertainer.id, skillId);
    },
    [selectedEntertainer, learnSkill]
  );

  const handleGetGossip = useCallback(async () => {
    if (!selectedEntertainer) return;
    const gossip = await getGossip(selectedEntertainer.id);
    setGossipMessages(gossip);
  }, [selectedEntertainer, getGossip]);

  // Get entertainers to display based on active tab and filters
  const getDisplayEntertainers = () => {
    let result: WanderingEntertainer[];

    switch (activeTab) {
      case 'at-location':
        result = entertainersAtLocation;
        break;
      case 'all':
      case 'by-type':
        result = entertainers;
        break;
      default:
        result = [];
    }

    if (selectedType !== 'all') {
      result = result.filter((e) => e.performanceType === selectedType);
    }

    return result;
  };

  const displayEntertainers = getDisplayEntertainers();

  // Get unique performance types for filter
  const performanceTypes = Object.values(PerformanceType);

  if (!currentCharacter) {
    return (
      <div className="text-center py-12 text-desert-sand">
        Loading character...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-western text-gold-light flex items-center gap-3">
            <span>🎭</span>
            Wandering Entertainers
          </h1>
          <p className="text-desert-stone mt-1">
            Watch performances, learn skills, and discover secrets
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 text-center">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-wood-grain/30 pb-2">
        <button
          onClick={() => setActiveTab('at-location')}
          className={`px-4 py-2 rounded-t-lg font-serif transition-colors ${
            activeTab === 'at-location'
              ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
              : 'text-desert-stone hover:text-desert-sand'
          }`}
        >
          Here Now ({entertainersAtLocation.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-t-lg font-serif transition-colors ${
            activeTab === 'all'
              ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
              : 'text-desert-stone hover:text-desert-sand'
          }`}
        >
          All Entertainers ({entertainers.length})
        </button>
        <button
          onClick={() => setActiveTab('by-type')}
          className={`px-4 py-2 rounded-t-lg font-serif transition-colors ${
            activeTab === 'by-type'
              ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
              : 'text-desert-stone hover:text-desert-sand'
          }`}
        >
          By Type
        </button>
      </div>

      {/* Type Filter (shown for 'all' and 'by-type' tabs) */}
      {(activeTab === 'all' || activeTab === 'by-type') && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedType === 'all'
                ? 'bg-gold-light text-wood-dark'
                : 'bg-wood-dark border border-wood-grain text-desert-sand hover:border-gold-light/50'
            }`}
          >
            All Types
          </button>
          {performanceTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                selectedType === type
                  ? 'bg-gold-light text-wood-dark'
                  : 'bg-wood-dark border border-wood-grain text-desert-sand hover:border-gold-light/50'
              }`}
            >
              <span>{performanceTypeIcons[type]}</span>
              <span>{performanceTypeLabels[type]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && !showEntertainerDetail && (
        <div aria-busy="true" aria-live="polite">
          <CardGridSkeleton count={6} columns={3} />
        </div>
      )}

      {/* Entertainers Grid */}
      {!isLoading && displayEntertainers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayEntertainers.map((entertainer) => (
            <EntertainerCard
              key={entertainer.id}
              entertainer={entertainer}
              onClick={() => handleEntertainerClick(entertainer)}
            />
          ))}
        </div>
      )}

      {/* Empty States */}
      {!isLoading && displayEntertainers.length === 0 && (
        <EmptyState
          icon={activeTab === 'at-location' ? '🎪' : '🎭'}
          title={
            activeTab === 'at-location'
              ? 'No Entertainers Nearby'
              : selectedType !== 'all'
              ? `No ${performanceTypeLabels[selectedType as PerformanceType]}s Found`
              : 'No Entertainers Yet'
          }
          description={
            activeTab === 'at-location'
              ? 'No traveling entertainers are performing at this location right now. Check back later or visit other locations.'
              : selectedType !== 'all'
              ? `There are no ${performanceTypeLabels[selectedType as PerformanceType].toLowerCase()}s currently known.`
              : 'Wandering entertainers have not been discovered yet.'
          }
          variant="default"
          size="lg"
          actionText={activeTab === 'at-location' ? 'View All Entertainers' : undefined}
          onAction={activeTab === 'at-location' ? () => setActiveTab('all') : undefined}
        />
      )}

      {/* Entertainer Detail Modal */}
      {showEntertainerDetail && selectedEntertainer && (
        <Modal
          isOpen={true}
          onClose={handleCloseEntertainerDetail}
          title={selectedEntertainer.name}
          size="xl"
        >
          <div className="space-y-6">
            {/* Entertainer Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-wood-grain/30">
              <div className="text-5xl">
                {performanceTypeIcons[selectedEntertainer.performanceType] || '🎭'}
              </div>
              <div className="flex-1">
                <p className="text-desert-stone">{selectedEntertainer.title}</p>
                <p className="text-sm text-desert-sand mt-1">{selectedEntertainer.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs px-2 py-0.5 bg-wood-dark/50 text-desert-sand rounded">
                    {performanceTypeLabels[selectedEntertainer.performanceType]}
                  </span>
                  <span className="text-xs text-desert-stone">
                    Trust: {selectedEntertainer.trustLevel}%
                  </span>
                </div>
              </div>
            </div>

            {/* Detail Tabs */}
            <div className="flex gap-2 border-b border-wood-grain/30 pb-2">
              <button
                onClick={() => setDetailTab('performances')}
                className={`px-3 py-1.5 rounded-t-lg font-serif text-sm transition-colors ${
                  detailTab === 'performances'
                    ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
                    : 'text-desert-stone hover:text-desert-sand'
                }`}
              >
                Performances
              </button>
              <button
                onClick={() => setDetailTab('skills')}
                className={`px-3 py-1.5 rounded-t-lg font-serif text-sm transition-colors ${
                  detailTab === 'skills'
                    ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
                    : 'text-desert-stone hover:text-desert-sand'
                }`}
              >
                Skills to Learn
              </button>
              <button
                onClick={() => {
                  setDetailTab('gossip');
                  if (gossipMessages.length === 0) {
                    handleGetGossip();
                  }
                }}
                className={`px-3 py-1.5 rounded-t-lg font-serif text-sm transition-colors ${
                  detailTab === 'gossip'
                    ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
                    : 'text-desert-stone hover:text-desert-sand'
                }`}
              >
                Gossip
              </button>
            </div>

            {/* Tab Content */}
            {detailTab === 'performances' && (
              <PerformanceList
                performances={selectedEntertainer.performances}
                onWatch={handleWatchPerformance}
                isLoading={isLoading}
              />
            )}

            {detailTab === 'skills' && (
              <SkillsList
                skills={selectedEntertainer.teachableSkills || []}
                playerTrustLevel={selectedEntertainer.trustLevel}
                onLearn={handleLearnSkill}
                isLoading={isLoading}
              />
            )}

            {detailTab === 'gossip' && (
              <div className="space-y-4">
                {/* Gossip Access Categories */}
                {selectedEntertainer.gossipAccess && selectedEntertainer.gossipAccess.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedEntertainer.gossipAccess.map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 text-xs bg-purple-900/30 text-purple-300 rounded capitalize"
                      >
                        {category.toLowerCase()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Gossip Messages */}
                {gossipMessages.length > 0 ? (
                  <div className="space-y-3">
                    {gossipMessages.map((message, index) => (
                      <Card key={index} variant="wood" padding="sm">
                        <p className="text-desert-sand font-serif italic">"{message}"</p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card variant="wood" padding="md">
                    <div className="text-center py-4">
                      <span className="text-3xl">💬</span>
                      <p className="text-desert-sand mt-2">
                        {selectedEntertainer.dialogue.sharingGossip[0]}
                      </p>
                      <Button
                        variant="secondary"
                        onClick={handleGetGossip}
                        className="mt-4"
                        disabled={isLoading}
                      >
                        Ask for Gossip
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Special Abilities */}
                {selectedEntertainer.specialAbilities && selectedEntertainer.specialAbilities.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm text-desert-stone mb-2">Special Abilities</h4>
                    <div className="space-y-2">
                      {selectedEntertainer.specialAbilities.map((ability, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-wood-dark/50 rounded"
                        >
                          <span className="text-gold-light">★</span>
                          <span className="text-sm text-desert-sand">{ability}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EntertainersPage;
