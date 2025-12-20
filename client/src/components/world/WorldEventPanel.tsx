/**
 * World Event Panel Component
 * Displays active and upcoming world events
 */

import React, { useState } from 'react';
import { useWorldStore, type GlobalEvent } from '../../store/useWorldStore';

// Event type configurations
const EVENT_CONFIG: Record<string, { icon: string; color: string; category: string }> = {
  // Combat/Danger
  BANDIT_RAID: { icon: '🏴‍☠️', color: 'text-red-500', category: 'Danger' },
  MANHUNT: { icon: '🔫', color: 'text-red-600', category: 'Danger' },
  GANG_WAR: { icon: '⚔️', color: 'text-red-700', category: 'Danger' },
  OUTLAW_SIGHTING: { icon: '👤', color: 'text-red-400', category: 'Danger' },

  // Economic
  GOLD_RUSH: { icon: '💰', color: 'text-yellow-500', category: 'Economic' },
  TRADE_CARAVAN: { icon: '🐴', color: 'text-amber-500', category: 'Economic' },
  MARKET_CRASH: { icon: '📉', color: 'text-orange-600', category: 'Economic' },
  SUPPLY_SHORTAGE: { icon: '📦', color: 'text-orange-500', category: 'Economic' },

  // Weather
  DUST_STORM: { icon: '🌪️', color: 'text-amber-600', category: 'Weather' },
  HEAT_WAVE: { icon: '🔥', color: 'text-orange-500', category: 'Weather' },
  FLASH_FLOOD: { icon: '🌊', color: 'text-blue-500', category: 'Weather' },
  WILDFIRE: { icon: '🔥', color: 'text-red-500', category: 'Weather' },

  // Social
  TOWN_FESTIVAL: { icon: '🎪', color: 'text-purple-500', category: 'Social' },
  ELECTION: { icon: '🗳️', color: 'text-blue-400', category: 'Social' },
  FUNERAL: { icon: '⚰️', color: 'text-gray-500', category: 'Social' },
  WEDDING: { icon: '💒', color: 'text-pink-400', category: 'Social' },

  // Faction
  FACTION_RALLY: { icon: '🚩', color: 'text-green-500', category: 'Faction' },
  TERRITORY_DISPUTE: { icon: '🗺️', color: 'text-yellow-600', category: 'Faction' },
  PEACE_TALKS: { icon: '🤝', color: 'text-green-400', category: 'Faction' },

  // Special
  METEOR_SHOWER: { icon: '☄️', color: 'text-cyan-400', category: 'Special' },
  ECLIPSE: { icon: '🌑', color: 'text-indigo-500', category: 'Special' },
  LEGENDARY_BOUNTY: { icon: '🎯', color: 'text-yellow-400', category: 'Special' },
};

interface WorldEventPanelProps {
  maxEvents?: number;
  showUpcoming?: boolean;
}

export const WorldEventPanel: React.FC<WorldEventPanelProps> = ({
  maxEvents = 5,
  showUpcoming = true,
}) => {
  const { getActiveEvents, isLoading } = useWorldStore();
  const [joiningEvent, setJoiningEvent] = useState<string | null>(null);
  const [tab, setTab] = useState<'active' | 'upcoming'>('active');

  // Get events from the store
  const activeEvents = getActiveEvents();
  const upcomingEvents: GlobalEvent[] = []; // Backend doesn't support upcoming events yet

  const handleJoinEvent = async (eventId: string) => {
    setJoiningEvent(eventId);
    // joinEvent not implemented in backend yet
    setJoiningEvent(null);
  };

  const displayEvents = tab === 'active'
    ? activeEvents.slice(0, maxEvents)
    : upcomingEvents.slice(0, maxEvents);

  return (
    <div className="bg-stone-800 rounded-lg overflow-hidden">
      {/* Header with tabs */}
      <div className="flex border-b border-stone-700">
        <button
          onClick={() => setTab('active')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === 'active'
              ? 'bg-stone-700 text-amber-400'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Active Events
          {activeEvents.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-600 text-white rounded-full">
              {activeEvents.length}
            </span>
          )}
        </button>
        {showUpcoming && (
          <button
            onClick={() => setTab('upcoming')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
              tab === 'upcoming'
                ? 'bg-stone-700 text-amber-400'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Upcoming
            {upcomingEvents.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-stone-600 text-stone-300 rounded-full">
                {upcomingEvents.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Events list */}
      <div className="divide-y divide-stone-700">
        {isLoading ? (
          <div className="p-4 text-center text-stone-500">
            Loading events...
          </div>
        ) : displayEvents.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-3xl mb-2 block">🌵</span>
            <p className="text-stone-500 text-sm">
              {tab === 'active' ? 'No active events' : 'No upcoming events'}
            </p>
          </div>
        ) : (
          displayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isActive={tab === 'active'}
              onJoin={() => handleJoinEvent(event.id)}
              isJoining={joiningEvent === event.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Individual event card
const EventCard: React.FC<{
  event: GlobalEvent;
  isActive: boolean;
  onJoin: () => void;
  isJoining: boolean;
}> = ({ event, isActive, onJoin, isJoining }) => {
  const config = EVENT_CONFIG[event.type.toUpperCase()] || { icon: '📋', color: 'text-stone-400', category: 'Event' };

  const timeRemaining = isActive && event.endsAt
    ? new Date(event.endsAt).getTime() - Date.now()
    : new Date(event.startedAt).getTime() - Date.now();

  const formatTime = (ms: number) => {
    if (ms < 0) return '0m';
    const minutes = Math.floor(ms / (60 * 1000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  // Get effects as array for display
  const effectsList = Object.entries(event.effects || {}).map(([key, value]) => ({
    key,
    value,
    description: `${key}: ${value > 0 ? '+' : ''}${value}%`
  }));

  return (
    <div className="p-4 hover:bg-stone-700/50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`text-2xl ${config.color}`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-stone-100 truncate">
              {event.name}
            </h4>
            {event.affectedRegions.length === 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-purple-600/50 text-purple-300 rounded">
                Global
              </span>
            )}
          </div>

          <p className="text-sm text-stone-400 mb-2 line-clamp-2">
            {event.description}
          </p>

          {/* Effects preview */}
          {effectsList.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {effectsList.slice(0, 2).map((effect, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-xs bg-stone-600/50 text-stone-300 rounded"
                >
                  {effect.description}
                </span>
              ))}
              {effectsList.length > 2 && (
                <span className="px-2 py-0.5 text-xs bg-stone-600/50 text-stone-400 rounded">
                  +{effectsList.length - 2} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-stone-500">
              <span>
                {isActive ? '⏳' : '📅'} {isActive ? 'Ends in' : 'Starts in'} {formatTime(timeRemaining)}
              </span>
              {event.affectedRegions.length > 0 && (
                <span>
                  📍 {event.affectedRegions.length} region{event.affectedRegions.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {isActive && (
              <button
                onClick={onJoin}
                disabled={isJoining}
                className="px-3 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-500
                         text-white rounded transition-colors disabled:opacity-50"
              >
                {isJoining ? 'Joining...' : 'Join'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldEventPanel;
