/**
 * BuildingInterior Component
 * Immersive building interior view with tabbed interface
 */

import React, { useEffect, useRef } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { BuildingNPC, BuildingJob, BuildingShop } from '../../services/building.service';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface BuildingInteriorProps {
  onExit: () => void;
  onSelectAction?: (actionId: string) => void;
  characterGold: number;
  characterEnergy: number;
}

// Building ambient sounds (placeholder URLs)
const AMBIENT_SOUNDS: Record<string, string> = {
  saloon: '/audio/saloon-ambience.mp3',
  blacksmith: '/audio/forge-ambience.mp3',
  church: '/audio/church-ambience.mp3',
  // Add more as needed
};

export const BuildingInterior: React.FC<BuildingInteriorProps> = ({
  onExit,
  onSelectAction,
  characterGold,
  characterEnergy,
}) => {
  const {
    currentBuilding,
    activeTab,
    setActiveTab,
    selectNPC,
    exitBuilding,
    activityFeed,
  } = useBuildingStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play ambient sound on mount
  useEffect(() => {
    if (currentBuilding && AMBIENT_SOUNDS[currentBuilding.type]) {
      const audio = new Audio(AMBIENT_SOUNDS[currentBuilding.type]);
      audio.loop = true;
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore autoplay errors
      audioRef.current = audio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentBuilding]);

  if (!currentBuilding) {
    return null;
  }

  const handleExit = async () => {
    await exitBuilding();
    onExit();
  };

  const buildingActivities = activityFeed.filter(
    (a) => a.buildingId === currentBuilding._id
  ).slice(0, 10);

  return (
    <div className="min-h-screen relative">
      {/* Background with gradient overlay */}
      <div
        className={`
          absolute inset-0
          ${getBuildingBackground(currentBuilding.type)}
        `}
      >
        {/* Ambient particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header with exit button */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-western text-desert-sand text-shadow-dark">
              {currentBuilding.name}
            </h1>
            {currentBuilding.dominantFaction && currentBuilding.dominantFaction !== 'neutral' && (
              <span className="text-sm text-gold-medium uppercase">
                {currentBuilding.dominantFaction} Territory
              </span>
            )}
          </div>
          <Button variant="ghost" onClick={handleExit}>
            ← Exit Building
          </Button>
        </div>

        {/* Immersive description */}
        <Card variant="parchment" className="mb-6">
          <div className="prose prose-wood max-w-none">
            <p className="text-lg text-wood-dark leading-relaxed italic">
              {currentBuilding.atmosphere || currentBuilding.description}
            </p>
          </div>

          {/* Danger indicator */}
          {currentBuilding.dangerLevel > 3 && (
            <div className="mt-4 flex items-center gap-2 text-blood-red">
              <span>⚠️</span>
              <span className="text-sm font-semibold">
                Danger Level: {currentBuilding.dangerLevel}/10
              </span>
            </div>
          )}
        </Card>

        {/* Activity Feed (collapsible) */}
        {buildingActivities.length > 0 && (
          <Card variant="leather" padding="sm" className="mb-6">
            <details>
              <summary className="cursor-pointer text-desert-sand font-semibold">
                Recent Activity ({buildingActivities.length})
              </summary>
              <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                {buildingActivities.map((activity) => (
                  <div key={activity.id} className="text-sm text-desert-clay flex items-center gap-2">
                    <span>{getActivityIcon(activity.type)}</span>
                    <span>{activity.playerName} {activity.message}</span>
                    <span className="text-xs ml-auto">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </Card>
        )}

        {/* Tabbed interface */}
        <div className="space-y-4">
          {/* Tab buttons */}
          <div className="flex gap-2 border-b-2 border-wood-dark pb-2">
            {(['actions', 'shops', 'jobs', 'npcs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-6 py-3 font-western text-lg transition-all duration-200
                  ${activeTab === tab
                    ? 'bg-gold-medium text-wood-dark rounded-t-lg -mb-[2px] border-b-2 border-gold-medium'
                    : 'text-desert-sand hover:bg-wood-light/20 rounded-t-lg'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'npcs' && currentBuilding.npcs.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-wood-dark text-desert-sand text-xs rounded-full">
                    {currentBuilding.npcs.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <Card variant="wood" className="min-h-[300px]">
            {activeTab === 'actions' && (
              <ActionsTab
                actions={currentBuilding.availableActions}
                crimes={currentBuilding.availableCrimes}
                onSelectAction={onSelectAction}
              />
            )}
            {activeTab === 'shops' && (
              <ShopsTab
                shops={currentBuilding.shops}
                characterGold={characterGold}
              />
            )}
            {activeTab === 'jobs' && (
              <JobsTab
                jobs={currentBuilding.jobs}
                characterEnergy={characterEnergy}
              />
            )}
            {activeTab === 'npcs' && (
              <NPCsTab
                npcs={currentBuilding.npcs}
                onSelectNPC={selectNPC}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

// Actions Tab
const ActionsTab: React.FC<{
  actions: string[];
  crimes: string[];
  onSelectAction?: (actionId: string) => void;
}> = ({ actions, crimes, onSelectAction }) => {
  if (actions.length === 0 && crimes.length === 0) {
    return (
      <div className="text-center py-8 text-desert-clay">
        <p>No actions available at this location.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actions.length > 0 && (
        <div>
          <h3 className="text-lg font-western text-gold-medium mb-3">Available Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((actionId) => (
              <Button
                key={actionId}
                variant="secondary"
                size="sm"
                onClick={() => onSelectAction?.(actionId)}
              >
                {actionId.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </div>
      )}

      {crimes.length > 0 && (
        <div>
          <h3 className="text-lg font-western text-blood-red mb-3">⚠️ Criminal Activities</h3>
          <div className="grid grid-cols-2 gap-3">
            {crimes.map((crimeId) => (
              <Button
                key={crimeId}
                variant="danger"
                size="sm"
                onClick={() => onSelectAction?.(crimeId)}
              >
                {crimeId.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Shops Tab
const ShopsTab: React.FC<{
  shops: BuildingShop[];
  characterGold: number;
}> = ({ shops, characterGold }) => {
  if (shops.length === 0) {
    return (
      <div className="text-center py-8 text-desert-clay">
        <p>No shops at this location.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {shops.map((shop) => (
        <div key={shop.id} className="border-b border-wood-light pb-4 last:border-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-western text-gold-medium">{shop.name}</h3>
            <span className="text-xs text-desert-clay uppercase">{shop.shopType}</span>
          </div>
          <p className="text-sm text-desert-clay mb-3">{shop.description}</p>

          {/* Shop items */}
          <div className="space-y-2">
            {shop.items.map((item) => (
              <div
                key={item.itemId}
                className="flex items-center justify-between p-2 bg-wood-light/20 rounded"
              >
                <div>
                  <p className="font-semibold text-desert-sand">{item.name}</p>
                  <p className="text-xs text-desert-clay">{item.description}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${characterGold >= item.price ? 'text-gold-medium' : 'text-blood-red'}`}>
                    {item.price} gold
                  </p>
                  {item.quantity !== undefined && (
                    <p className="text-xs text-desert-clay">Stock: {item.quantity}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Jobs Tab
const JobsTab: React.FC<{
  jobs: BuildingJob[];
  characterEnergy: number;
}> = ({ jobs, characterEnergy }) => {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-desert-clay">
        <p>No jobs available at this location.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => {
        const canAfford = characterEnergy >= job.energyCost;

        return (
          <div
            key={job.id}
            className={`p-4 rounded-lg border-2 ${canAfford ? 'border-gold-medium' : 'border-wood-dark'}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-western text-lg text-desert-sand">{job.name}</h3>
                <p className="text-sm text-desert-clay">{job.description}</p>
              </div>
              <div className={`px-3 py-1 rounded font-bold ${canAfford ? 'bg-gold-medium text-wood-dark' : 'bg-blood-red text-white'}`}>
                {job.energyCost} ⚡
              </div>
            </div>

            {/* Rewards */}
            <div className="flex items-center gap-4 mt-3">
              <span className="text-sm text-gold-medium">
                💰 {job.rewards.goldMin}-{job.rewards.goldMax} gold
              </span>
              <span className="text-sm text-purple-400">
                ✨ {job.rewards.xp} XP
              </span>
              <span className="text-xs text-desert-clay">
                ⏱️ {job.cooldownMinutes}min cooldown
              </span>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="mt-2 text-xs text-desert-clay">
                {job.requirements.minLevel && <span>Level {job.requirements.minLevel}+ • </span>}
                {job.requirements.requiredSkill && (
                  <span>{job.requirements.requiredSkill} Lv{job.requirements.skillLevel}</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// NPCs Tab
const NPCsTab: React.FC<{
  npcs: BuildingNPC[];
  onSelectNPC: (npc: BuildingNPC) => void;
}> = ({ npcs, onSelectNPC }) => {
  if (npcs.length === 0) {
    return (
      <div className="text-center py-8 text-desert-clay">
        <p>No one here right now.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {npcs.map((npc) => (
        <div
          key={npc.id}
          onClick={() => onSelectNPC(npc)}
          className="p-4 rounded-lg border-2 border-wood-light hover:border-gold-medium cursor-pointer transition-colors"
        >
          {/* NPC portrait placeholder */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-wood-dark flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <h3 className="font-western text-lg text-desert-sand">{npc.name}</h3>
              {npc.title && (
                <p className="text-sm text-gold-medium">{npc.title}</p>
              )}
              {npc.faction && (
                <p className="text-xs text-desert-clay uppercase">{npc.faction}</p>
              )}
            </div>
          </div>

          <p className="mt-3 text-sm text-desert-clay line-clamp-2">
            {npc.description}
          </p>

          {/* Indicators */}
          <div className="flex gap-2 mt-3">
            {npc.isVendor && (
              <span className="px-2 py-0.5 bg-gold-medium/20 text-gold-medium text-xs rounded">
                Vendor
              </span>
            )}
            {npc.quests && npc.quests.length > 0 && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                {npc.quests.length} Quest{npc.quests.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper functions
function getBuildingBackground(type: string): string {
  const backgrounds: Record<string, string> = {
    saloon: 'bg-gradient-to-b from-amber-900/90 to-yellow-900/80',
    sheriff_office: 'bg-gradient-to-b from-blue-900/90 to-slate-800/80',
    bank: 'bg-gradient-to-b from-yellow-800/90 to-amber-700/80',
    blacksmith: 'bg-gradient-to-b from-orange-900/90 to-red-800/80',
    church: 'bg-gradient-to-b from-gray-100/90 to-yellow-50/80',
    // Nahi
    spirit_lodge: 'bg-gradient-to-b from-teal-900/90 to-cyan-800/80',
    council_fire: 'bg-gradient-to-b from-orange-700/90 to-red-600/80',
    medicine_lodge: 'bg-gradient-to-b from-green-800/90 to-teal-700/80',
    // Frontera
    cantina: 'bg-gradient-to-b from-red-900/90 to-orange-900/80',
    fighting_pit: 'bg-gradient-to-b from-gray-900/90 to-red-950/80',
    smugglers_den: 'bg-gradient-to-b from-gray-950/90 to-purple-950/80',
    shrine: 'bg-gradient-to-b from-purple-950/90 to-black/80',
    default: 'bg-gradient-to-b from-wood-dark/90 to-wood-darker/80',
  };

  return backgrounds[type] || backgrounds.default;
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    enter: '🚪',
    exit: '👋',
    purchase: '💰',
    job: '⚒️',
    crime: '🔫',
    arrest: '⭐',
    fight: '⚔️',
  };
  return icons[type] || '•';
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default BuildingInterior;
