/**
 * World Service
 * API client for world state, time, weather, and global events
 */

import api from './api';
import type { TimeState } from '@shared/types/time.types';
import type { WeatherType } from '@shared/types/weather.types';
import type { Season, MoonPhase } from '@shared/types/calendar.types';

// ===== Types =====

export interface FactionInfluence {
  factionId: string;
  factionName: string;
  influence: number;
  territory: string[];
  isHostile: boolean;
}

export interface WorldNews {
  id: string;
  headline: string;
  content: string;
  category: 'war' | 'economy' | 'crime' | 'politics' | 'weather' | 'supernatural';
  importance: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  expiresAt?: Date;
}

export interface GlobalEvent {
  id: string;
  name: string;
  type: 'battle' | 'festival' | 'disaster' | 'economic' | 'supernatural';
  description: string;
  isActive: boolean;
  startedAt: Date;
  endsAt?: Date;
  affectedRegions: string[];
  effects: Record<string, number>;
}

export interface WeatherEffects {
  travelTimeModifier: number;
  combatModifier: number;
  energyCostModifier: number;
  visibilityModifier: number;
  encounterModifier: number;
}

export interface FactionPower {
  faction: string;
  power: number;
  trend: 'rising' | 'falling' | 'stable';
}

export interface Gossip {
  text: string;
  source: string;
  location?: string;
  age?: string;
}

export interface WeatherForecast {
  weather: string;
  time: string;
}

export interface WorldState {
  // Time information
  currentTime: TimeState;
  gameDate: {
    year: number;
    month: number;
    day: number;
    season: Season;
    moonPhase: MoonPhase;
  };

  // Weather information
  globalWeather: {
    dominantPattern: WeatherType;
    regionalVariations: Array<{
      region: string;
      weather: WeatherType;
      intensity: number;
    }>;
  };

  // Faction control
  factionInfluence: FactionInfluence[];
  dominantFaction: string;

  // World events
  activeEvents: GlobalEvent[];
  recentNews: WorldNews[];

  // Economy
  economicState: {
    goldInflation: number;
    marketTrend: 'bull' | 'bear' | 'stable';
    scarcityIndex: number;
  };

  // Population
  worldPopulation: {
    totalPlayers: number;
    activePlayers: number;
    topGangs: Array<{
      gangId: string;
      gangName: string;
      memberCount: number;
      influence: number;
    }>;
  };

  // Metadata
  serverUptime: number;
  lastUpdated: Date;

  // ===== Convenience properties (derived from above) =====
  // Used by UI components for simplified access

  // Weather convenience (derived from globalWeather)
  currentWeather?: string;
  weatherEffects?: WeatherEffects;
  weatherForecast?: WeatherForecast[];

  // Time convenience (derived from currentTime and gameDate)
  timeOfDay?: string;
  gameHour?: number;
  gameDay?: number;
  gameMonth?: number;
  gameYear?: number;

  // Faction convenience (derived from factionInfluence)
  factionPower?: FactionPower[];

  // News convenience (derived from recentNews)
  currentHeadlines?: string[];
  recentGossip?: Gossip[];
}

export interface WorldStateResponse {
  success: boolean;
  data: WorldState;
}

export interface GameTimeResponse {
  success: boolean;
  data: {
    currentTime: TimeState;
    gameDate: {
      year: number;
      month: number;
      day: number;
      season: Season;
      moonPhase: MoonPhase;
    };
    realTimeRatio: number;
  };
}

export interface WorldWeatherResponse {
  success: boolean;
  data: {
    globalWeather: {
      dominantPattern: WeatherType;
      regionalVariations: Array<{
        region: string;
        weather: WeatherType;
        intensity: number;
      }>;
    };
    forecast: Array<{
      region: string;
      upcomingWeather: WeatherType;
      changesIn: number; // hours
    }>;
  };
}

// ===== World Events Types =====

export interface WorldEventEffect {
  type: 'price_modifier' | 'danger_modifier' | 'reputation_modifier' | 'spawn_rate' | 'travel_time' | 'energy_cost';
  target: string;
  value: number;
  description: string;
}

export interface WorldEventReward {
  type: 'dollars' | 'xp' | 'item' | 'reputation' | 'achievement';
  amount: number;
}

export interface WorldEventData {
  _id: string;
  name: string;
  description: string;
  type: string;
  isGlobal: boolean;
  locationId?: string;
  region?: string;
  scheduledStart: string;
  scheduledEnd: string;
  worldEffects: WorldEventEffect[];
  participationRewards: WorldEventReward[];
  newsHeadline?: string;
  participantCount: number;
}

export interface WorldEventsResponse {
  success: boolean;
  data: {
    activeEvents: WorldEventData[];
    upcomingEvents: WorldEventData[];
    activeCount: number;
    upcomingCount: number;
  };
}

// ===== World Service =====

export const worldService = {
  // ===== Public Routes =====

  /**
   * Get current world state (time, weather, factions, news)
   */
  async getWorldState(): Promise<WorldState> {
    const response = await api.get<WorldStateResponse>('/world/state');
    return response.data.data;
  },

  /**
   * Get current game time
   */
  async getGameTime(): Promise<{
    currentTime: TimeState;
    gameDate: {
      year: number;
      month: number;
      day: number;
      season: Season;
      moonPhase: MoonPhase;
    };
    realTimeRatio: number;
  }> {
    const response = await api.get<GameTimeResponse>('/world/time');
    return response.data.data;
  },

  /**
   * Get current weather conditions
   */
  async getWeather(): Promise<{
    globalWeather: {
      dominantPattern: WeatherType;
      regionalVariations: Array<{
        region: string;
        weather: WeatherType;
        intensity: number;
      }>;
    };
    forecast: Array<{
      region: string;
      upcomingWeather: WeatherType;
      changesIn: number;
    }>;
  }> {
    const response = await api.get<WorldWeatherResponse>('/world/weather');
    return response.data.data;
  },

  /**
   * Get active and upcoming world events
   */
  async getWorldEvents(): Promise<{
    activeEvents: WorldEventData[];
    upcomingEvents: WorldEventData[];
    activeCount: number;
    upcomingCount: number;
  }> {
    const response = await api.get<WorldEventsResponse>('/world/events');
    return response.data.data;
  },

  /**
   * Join an active world event
   */
  async joinEvent(eventId: string, characterId: string): Promise<{
    eventId: string;
    eventName: string;
    participantCount: number;
  }> {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: {
        eventId: string;
        eventName: string;
        participantCount: number;
      };
    }>(`/world/events/${eventId}/join`, { characterId });
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Get faction with highest influence
   */
  getDominantFaction(worldState: WorldState): FactionInfluence | null {
    if (!worldState.factionInfluence || worldState.factionInfluence.length === 0) {
      return null;
    }

    return worldState.factionInfluence.reduce((prev, current) =>
      current.influence > prev.influence ? current : prev
    );
  },

  /**
   * Get active critical news
   */
  getCriticalNews(worldState: WorldState): WorldNews[] {
    return worldState.recentNews?.filter(news => news.importance === 'critical') || [];
  },

  /**
   * Get news by category
   */
  getNewsByCategory(worldState: WorldState, category: WorldNews['category']): WorldNews[] {
    return worldState.recentNews?.filter(news => news.category === category) || [];
  },

  /**
   * Check if region is affected by event
   */
  isRegionAffected(region: string, event: GlobalEvent): boolean {
    return event.affectedRegions.includes(region);
  },

  /**
   * Get events affecting region
   */
  getRegionEvents(worldState: WorldState, region: string): GlobalEvent[] {
    return worldState.activeEvents?.filter(event =>
      this.isRegionAffected(region, event)
    ) || [];
  },

  /**
   * Get faction controlling region
   */
  getFactionForRegion(worldState: WorldState, region: string): FactionInfluence | null {
    return worldState.factionInfluence?.find(faction =>
      faction.territory.includes(region)
    ) || null;
  },

  /**
   * Check if faction is hostile
   */
  isFactionHostile(worldState: WorldState, factionId: string): boolean {
    const faction = worldState.factionInfluence?.find(f => f.factionId === factionId);
    return faction?.isHostile || false;
  },

  /**
   * Get economic trend description
   */
  getEconomicTrendDescription(worldState: WorldState): string {
    const trend = worldState.economicState?.marketTrend || 'stable';
    const descriptions = {
      bull: 'Market prices rising, good time to sell',
      bear: 'Market prices falling, good time to buy',
      stable: 'Market steady, normal trading',
    };
    return descriptions[trend];
  },

  /**
   * Get scarcity level
   */
  getScarcityLevel(scarcityIndex: number): 'abundant' | 'normal' | 'scarce' | 'critical' {
    if (scarcityIndex < 0.3) return 'abundant';
    if (scarcityIndex < 0.7) return 'normal';
    if (scarcityIndex < 0.9) return 'scarce';
    return 'critical';
  },

  /**
   * Get weather for specific region
   */
  getRegionWeather(worldState: WorldState, region: string): {
    weather: WeatherType;
    intensity: number;
  } | null {
    const variation = worldState.globalWeather?.regionalVariations.find(
      v => v.region === region
    );

    if (variation) {
      return {
        weather: variation.weather,
        intensity: variation.intensity,
      };
    }

    return null;
  },

  /**
   * Get dominant weather pattern
   */
  getDominantWeather(worldState: WorldState): WeatherType {
    return worldState.globalWeather?.dominantPattern || ('CLEAR' as WeatherType);
  },

  /**
   * Format server uptime
   */
  formatUptime(uptimeSeconds: number): string {
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },

  /**
   * Get active event count
   */
  getActiveEventCount(worldState: WorldState): number {
    return worldState.activeEvents?.length || 0;
  },

  /**
   * Get events by type
   */
  getEventsByType(worldState: WorldState, type: GlobalEvent['type']): GlobalEvent[] {
    return worldState.activeEvents?.filter(event => event.type === type) || [];
  },

  /**
   * Check if there's an active supernatural event
   */
  hasSupernaturalEvent(worldState: WorldState): boolean {
    return this.getEventsByType(worldState, 'supernatural').length > 0;
  },

  /**
   * Get top gang by influence
   */
  getTopGang(worldState: WorldState): {
    gangId: string;
    gangName: string;
    memberCount: number;
    influence: number;
  } | null {
    const gangs = worldState.worldPopulation?.topGangs || [];
    if (gangs.length === 0) return null;

    return gangs.reduce((prev, current) =>
      current.influence > prev.influence ? current : prev
    );
  },

  /**
   * Get player activity level
   */
  getPlayerActivityLevel(worldState: WorldState): 'low' | 'medium' | 'high' {
    const total = worldState.worldPopulation?.totalPlayers || 0;
    const active = worldState.worldPopulation?.activePlayers || 0;

    if (total === 0) return 'low';

    const ratio = active / total;

    if (ratio > 0.7) return 'high';
    if (ratio > 0.4) return 'medium';
    return 'low';
  },

  /**
   * Get formatted game date
   */
  formatGameDate(gameDate: WorldState['gameDate']): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthName = monthNames[gameDate.month - 1] || 'Unknown';
    return `${monthName} ${gameDate.day}, ${gameDate.year}`;
  },

  /**
   * Check if world is in dangerous state
   */
  isWorldDangerous(worldState: WorldState): boolean {
    const hasWar = this.getEventsByType(worldState, 'battle').length > 0;
    const hasDisaster = this.getEventsByType(worldState, 'disaster').length > 0;
    const highScarcity = (worldState.economicState?.scarcityIndex || 0) > 0.8;

    return hasWar || hasDisaster || highScarcity;
  },

  /**
   * Get world danger level
   */
  getWorldDangerLevel(worldState: WorldState): 'safe' | 'moderate' | 'dangerous' | 'critical' {
    const battleEvents = this.getEventsByType(worldState, 'battle').length;
    const disasterEvents = this.getEventsByType(worldState, 'disaster').length;
    const supernaturalEvents = this.getEventsByType(worldState, 'supernatural').length;
    const criticalNews = this.getCriticalNews(worldState).length;

    const dangerScore = battleEvents * 2 + disasterEvents * 2 + supernaturalEvents * 3 + criticalNews;

    if (dangerScore >= 10) return 'critical';
    if (dangerScore >= 6) return 'dangerous';
    if (dangerScore >= 3) return 'moderate';
    return 'safe';
  },
};

export default worldService;
