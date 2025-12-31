/**
 * World Event Banner Component
 * Displays active world events in a scrolling banner at the top of the game
 */

import React, { useEffect, useState, useCallback } from 'react';
import { worldService, type WorldEventData } from '@/services/world.service';
import { logger } from '@/services/logger.service';

// Event type icons
const EVENT_ICONS: Record<string, string> = {
  GOLD_RUSH: '💰',
  TRADE_CARAVAN: '🐴',
  MARKET_CRASH: '📉',
  SUPPLY_SHORTAGE: '📦',
  BANDIT_RAID: '🔫',
  MANHUNT: '🎯',
  GANG_WAR: '⚔️',
  LEGENDARY_BOUNTY: '👤',
  OUTLAW_SIGHTING: '🤠',
  DUST_STORM: '🌪️',
  HEAT_WAVE: '🔥',
  FLASH_FLOOD: '🌊',
  WILDFIRE: '🔥',
  TOWN_FESTIVAL: '🎪',
  ELECTION: '🗳️',
  FUNERAL: '⚰️',
  WEDDING: '💒',
  FACTION_RALLY: '🚩',
  TERRITORY_DISPUTE: '⚡',
  PEACE_TALKS: '🕊️',
  METEOR_SHOWER: '☄️',
  ECLIPSE: '🌑',
  BLOOD_MOON: '🌕',
  RIFT_OPENING: '🌀',
  PROPHET_ARRIVAL: '🔮',
};

// Event type colors for visual distinction
const EVENT_COLORS: Record<string, string> = {
  GOLD_RUSH: 'text-gold-light',
  TRADE_CARAVAN: 'text-emerald-400',
  MARKET_CRASH: 'text-red-400',
  SUPPLY_SHORTAGE: 'text-orange-400',
  BANDIT_RAID: 'text-red-500',
  MANHUNT: 'text-amber-400',
  GANG_WAR: 'text-red-600',
  LEGENDARY_BOUNTY: 'text-purple-400',
  OUTLAW_SIGHTING: 'text-amber-500',
  DUST_STORM: 'text-amber-300',
  HEAT_WAVE: 'text-orange-500',
  FLASH_FLOOD: 'text-blue-400',
  WILDFIRE: 'text-orange-600',
  TOWN_FESTIVAL: 'text-emerald-400',
  ELECTION: 'text-blue-300',
  FUNERAL: 'text-gray-400',
  WEDDING: 'text-pink-300',
  FACTION_RALLY: 'text-yellow-400',
  TERRITORY_DISPUTE: 'text-red-400',
  PEACE_TALKS: 'text-emerald-300',
  METEOR_SHOWER: 'text-purple-300',
  ECLIPSE: 'text-indigo-400',
  BLOOD_MOON: 'text-red-700',
  RIFT_OPENING: 'text-violet-500',
  PROPHET_ARRIVAL: 'text-cyan-400',
};

interface WorldEventBannerProps {
  className?: string;
}

export const WorldEventBanner: React.FC<WorldEventBannerProps> = ({ className = '' }) => {
  const [events, setEvents] = useState<WorldEventData[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<WorldEventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await worldService.getWorldEvents();
      setEvents(data.activeEvents);
      setUpcomingEvents(data.upcomingEvents);
    } catch (error) {
      logger.error('Failed to fetch world events', error as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch events on mount and every 60 seconds
  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 60000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  // Rotate through events every 5 seconds
  useEffect(() => {
    if (events.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length]);

  // Calculate time remaining
  const getTimeRemaining = (endTime: string): string => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return 'Ending soon';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  // Don't render if no events
  if (isLoading || events.length === 0) {
    return null;
  }

  const currentEvent = events[currentIndex];

  // Safety check for race condition where currentIndex might be out of bounds
  if (!currentEvent) return null;

  const icon = EVENT_ICONS[currentEvent.type] || '⚡';
  const colorClass = EVENT_COLORS[currentEvent.type] || 'text-gold-light';

  return (
    <div className={`relative ${className}`}>
      {/* Main Banner */}
      <div
        className="bg-gradient-to-r from-wood-dark via-wood-medium to-wood-dark border-b border-gold-dark/30 cursor-pointer overflow-hidden"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Event Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Event Count Badge */}
              {events.length > 1 && (
                <span className="flex-shrink-0 bg-gold-dark/50 text-gold-light text-xs px-2 py-0.5 rounded-full font-bold">
                  {currentIndex + 1}/{events.length}
                </span>
              )}

              {/* Icon */}
              <span className="text-xl flex-shrink-0" role="img" aria-label={currentEvent.type}>
                {icon}
              </span>

              {/* Event Name & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-bold font-western ${colorClass}`}>
                    {currentEvent.name}
                  </span>
                  {currentEvent.isGlobal && (
                    <span className="text-xs bg-blue-900/50 text-blue-200 px-1.5 py-0.5 rounded">
                      Global
                    </span>
                  )}
                  {currentEvent.region && !currentEvent.isGlobal && (
                    <span className="text-xs bg-amber-900/50 text-amber-200 px-1.5 py-0.5 rounded capitalize">
                      {currentEvent.region.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-desert-sand truncate">
                  {currentEvent.description}
                </p>
              </div>
            </div>

            {/* Time Remaining */}
            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              <span className="text-sm text-gold-light/80 hidden sm:inline">
                {getTimeRemaining(currentEvent.scheduledEnd)}
              </span>

              {/* Expand Button */}
              <button
                className="text-gold-light/60 hover:text-gold-light transition-colors"
                aria-label={isExpanded ? 'Collapse events' : 'Expand events'}
              >
                {isExpanded ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {/* Effects Preview */}
          {currentEvent.worldEffects.length > 0 && (
            <div className="flex gap-3 mt-1 flex-wrap">
              {currentEvent.worldEffects.slice(0, 3).map((effect, idx) => (
                <span
                  key={idx}
                  className={`text-xs ${effect.value > 1 ? 'text-red-300' : 'text-emerald-300'}`}
                >
                  {effect.description}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 z-50 bg-wood-dark/95 backdrop-blur-sm border-b border-gold-dark/30 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            {/* Active Events */}
            <h4 className="text-sm font-bold text-gold-light mb-2 font-western">Active Events</h4>
            <div className="grid gap-2 mb-4">
              {events.map((event, idx) => (
                <div
                  key={event._id}
                  className={`p-3 rounded border ${
                    idx === currentIndex
                      ? 'border-gold-light/50 bg-gold-dark/20'
                      : 'border-wood-light/20 bg-wood-medium/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{EVENT_ICONS[event.type] || '⚡'}</span>
                      <span className={`font-bold ${EVENT_COLORS[event.type] || 'text-gold-light'}`}>
                        {event.name}
                      </span>
                      {event.isGlobal ? (
                        <span className="text-xs bg-blue-900/50 text-blue-200 px-1.5 py-0.5 rounded">
                          Global
                        </span>
                      ) : event.region && (
                        <span className="text-xs bg-amber-900/50 text-amber-200 px-1.5 py-0.5 rounded capitalize">
                          {event.region.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-desert-sand">
                      {getTimeRemaining(event.scheduledEnd)}
                    </span>
                  </div>
                  <p className="text-sm text-desert-sand/80 mt-1">{event.description}</p>
                  {event.worldEffects.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {event.worldEffects.map((effect, effIdx) => (
                        <span
                          key={effIdx}
                          className={`text-xs px-2 py-0.5 rounded ${
                            effect.value > 1 ? 'bg-red-900/30 text-red-300' : 'bg-emerald-900/30 text-emerald-300'
                          }`}
                        >
                          {effect.description}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <>
                <h4 className="text-sm font-bold text-desert-sand mb-2 font-western">Coming Soon</h4>
                <div className="grid gap-2">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event._id}
                      className="p-2 rounded border border-wood-light/10 bg-wood-medium/20 opacity-70"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{EVENT_ICONS[event.type] || '⚡'}</span>
                        <span className="text-sm text-desert-sand">{event.name}</span>
                        <span className="text-xs text-desert-sand/60 ml-auto">
                          Starts in{' '}
                          {Math.ceil(
                            (new Date(event.scheduledStart).getTime() - Date.now()) / (1000 * 60)
                          )}
                          m
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldEventBanner;
