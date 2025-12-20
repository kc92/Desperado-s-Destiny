/**
 * Stagecoach Service
 * API client for the stagecoach transportation and ambush system
 */

import api from './api';

// ===== Re-export Types from Shared =====
export type {
  StagecoachType,
  TerrainType,
  StagecoachStatus,
  AmbushLocationType,
  NPCDriver,
  NPCGuard,
  PassengerInfo,
  StagecoachCargoItem,
  StagecoachCargoManifest,
  StagecoachRouteStop,
  StagecoachRoute,
  RoutePosition,
  Stagecoach,
  StagecoachEvent,
  StagecoachTicket,
  WayStation,
  AmbushSpot,
  AmbushPlan,
  AmbushResult,
  DefenseResult,
  StagecoachEncounter,
  EncounterChoice,
  BookingRequest,
  BookingResponse,
  TravelProgress,
  LootDistribution,
} from '@shared/types/stagecoach.types';

// ===== Request/Response Types =====

export interface BookTicketRequest {
  routeId: string;
  departureLocationId: string;
  destinationLocationId: string;
  departureTime?: Date | string;
  luggageWeight?: number;
  weaponDeclared?: boolean;
}

export interface BookTicketResponse {
  success: boolean;
  ticket?: import('@shared/types/stagecoach.types').StagecoachTicket;
  stagecoach?: import('@shared/types/stagecoach.types').Stagecoach;
  message: string;
  fare: number;
  departureTime: Date;
  estimatedArrival: Date;
}

export interface CancelTicketResponse {
  success: boolean;
  refundAmount: number;
  message: string;
}

export interface TravelProgressResponse {
  stagecoachId: string;
  currentPosition: import('@shared/types/stagecoach.types').RoutePosition;
  estimatedArrival: Date;
  status: import('@shared/types/stagecoach.types').StagecoachStatus;
  events: import('@shared/types/stagecoach.types').StagecoachEvent[];
  currentSpeed: number;
  delayMinutes: number;
}

export interface RouteDeparture {
  time: Date;
  seatsAvailable: number;
  fare: number;
}

export interface SetupAmbushRequest {
  routeId: string;
  ambushSpotId: string;
  scheduledTime: Date | string;
  gangMemberIds?: string[];
  strategy?: 'roadblock' | 'canyon_trap' | 'bridge_sabotage' | 'surprise_attack';
}

export interface SetupAmbushResponse {
  success: boolean;
  plan?: import('@shared/types/stagecoach.types').AmbushPlan;
  estimatedSetupTime: number;
  message: string;
}

export interface ExecuteAmbushResponse {
  success: boolean;
  result: import('@shared/types/stagecoach.types').AmbushResult;
  combatLog: string[];
  message: string;
}

export interface DefendStagecoachResponse {
  success: boolean;
  result: import('@shared/types/stagecoach.types').DefenseResult;
  combatLog: string[];
  message: string;
}

export interface DistributeLootRequest {
  totalValue: number;
  loot: import('@shared/types/stagecoach.types').StagecoachCargoItem[];
  gangMemberIds?: string[];
}

export interface DistributeLootResponse {
  success: boolean;
  distribution: import('@shared/types/stagecoach.types').LootDistribution;
  message: string;
}

// ===== Stagecoach Service =====

export const stagecoachService = {
  // ===== Route Methods =====

  /**
   * Get all available stagecoach routes
   */
  async getRoutes(): Promise<import('@shared/types/stagecoach.types').StagecoachRoute[]> {
    const response = await api.get<{ data: { routes: import('@shared/types/stagecoach.types').StagecoachRoute[] } }>('/stagecoach/routes');
    return response.data.data?.routes || [];
  },

  /**
   * Get a specific route by ID
   */
  async getRoute(routeId: string): Promise<import('@shared/types/stagecoach.types').StagecoachRoute | null> {
    const response = await api.get<{ data: { route: import('@shared/types/stagecoach.types').StagecoachRoute } }>(`/stagecoach/routes/${routeId}`);
    return response.data.data?.route || null;
  },

  /**
   * Get upcoming departures for a route
   */
  async getDepartures(routeId: string): Promise<RouteDeparture[]> {
    const response = await api.get<{ data: { departures: RouteDeparture[] } }>(`/stagecoach/routes/${routeId}/departures`);
    return response.data.data?.departures || [];
  },

  /**
   * Get all way stations
   */
  async getWayStations(): Promise<import('@shared/types/stagecoach.types').WayStation[]> {
    const response = await api.get<{ data: { wayStations: import('@shared/types/stagecoach.types').WayStation[] } }>('/stagecoach/way-stations');
    return response.data.data?.wayStations || [];
  },

  // ===== Ticket Methods =====

  /**
   * Get active ticket for the current character
   */
  async getActiveTicket(): Promise<import('@shared/types/stagecoach.types').StagecoachTicket | null> {
    const response = await api.get<{ data: { ticket: import('@shared/types/stagecoach.types').StagecoachTicket | null } }>('/stagecoach/tickets/active');
    return response.data.data?.ticket || null;
  },

  /**
   * Get travel history
   */
  async getTravelHistory(): Promise<import('@shared/types/stagecoach.types').StagecoachTicket[]> {
    const response = await api.get<{ data: { tickets: import('@shared/types/stagecoach.types').StagecoachTicket[] } }>('/stagecoach/tickets/history');
    return response.data.data?.tickets || [];
  },

  /**
   * Book a stagecoach ticket
   */
  async bookTicket(request: BookTicketRequest): Promise<BookTicketResponse> {
    const response = await api.post<{ data: BookTicketResponse }>('/stagecoach/tickets/book', request);
    return response.data.data;
  },

  /**
   * Cancel a ticket (80% refund if 1+ hour before departure)
   */
  async cancelTicket(ticketId: string): Promise<CancelTicketResponse> {
    const response = await api.post<{ data: CancelTicketResponse }>(`/stagecoach/tickets/${ticketId}/cancel`);
    return response.data.data;
  },

  /**
   * Get journey progress for an active ticket
   */
  async getProgress(ticketId: string): Promise<TravelProgressResponse> {
    const response = await api.get<{ data: TravelProgressResponse }>(`/stagecoach/tickets/${ticketId}/progress`);
    return response.data.data;
  },

  /**
   * Complete a journey (marks arrival)
   */
  async completeJourney(ticketId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ data: { success: boolean; message: string } }>(`/stagecoach/tickets/${ticketId}/complete`);
    return response.data.data;
  },

  // ===== Ambush Methods =====

  /**
   * Get ambush spots for a route
   */
  async getAmbushSpots(routeId: string): Promise<import('@shared/types/stagecoach.types').AmbushSpot[]> {
    const response = await api.get<{ data: { spots: import('@shared/types/stagecoach.types').AmbushSpot[] } }>(`/stagecoach/ambush/spots/${routeId}`);
    return response.data.data?.spots || [];
  },

  /**
   * Get a specific ambush spot
   */
  async getAmbushSpot(routeId: string, spotId: string): Promise<import('@shared/types/stagecoach.types').AmbushSpot | null> {
    const response = await api.get<{ data: { spot: import('@shared/types/stagecoach.types').AmbushSpot } }>(`/stagecoach/ambush/spots/${routeId}/${spotId}`);
    return response.data.data?.spot || null;
  },

  /**
   * Get active ambush plan for the character
   */
  async getActivePlan(): Promise<import('@shared/types/stagecoach.types').AmbushPlan | null> {
    const response = await api.get<{ data: { plan: import('@shared/types/stagecoach.types').AmbushPlan | null } }>('/stagecoach/ambush/plan');
    return response.data.data?.plan || null;
  },

  /**
   * Setup an ambush
   */
  async setupAmbush(request: SetupAmbushRequest): Promise<SetupAmbushResponse> {
    const response = await api.post<{ data: SetupAmbushResponse }>('/stagecoach/ambush/setup', request);
    return response.data.data;
  },

  /**
   * Execute an active ambush
   */
  async executeAmbush(stagecoachId: string): Promise<ExecuteAmbushResponse> {
    const response = await api.post<{ data: ExecuteAmbushResponse }>('/stagecoach/ambush/execute', { stagecoachId });
    return response.data.data;
  },

  /**
   * Cancel an active ambush plan
   */
  async cancelAmbush(): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ data: { success: boolean; message: string } }>('/stagecoach/ambush/cancel');
    return response.data.data;
  },

  /**
   * Defend a stagecoach when ambushed (as passenger)
   */
  async defendStagecoach(stagecoachId: string): Promise<DefendStagecoachResponse> {
    const response = await api.post<{ data: DefendStagecoachResponse }>('/stagecoach/ambush/defend', { stagecoachId });
    return response.data.data;
  },

  /**
   * Distribute loot from an ambush
   */
  async distributeLoot(request: DistributeLootRequest): Promise<DistributeLootResponse> {
    const response = await api.post<{ data: DistributeLootResponse }>('/stagecoach/ambush/loot/distribute', request);
    return response.data.data;
  },

  // ===== Helper Methods =====

  /**
   * Get display name for stagecoach type
   */
  getTypeName(type: import('@shared/types/stagecoach.types').StagecoachType): string {
    const names: Record<string, string> = {
      passenger: 'Passenger',
      mail: 'Mail Coach',
      treasure: 'Treasure Transport',
      private: 'Private Charter',
    };
    return names[type] || type;
  },

  /**
   * Get display name for stagecoach status
   */
  getStatusName(status: import('@shared/types/stagecoach.types').StagecoachStatus): string {
    const names: Record<string, string> = {
      loading: 'Boarding',
      traveling: 'En Route',
      arrived: 'Arrived',
      ambushed: 'Under Attack',
      broken_down: 'Broken Down',
      delayed: 'Delayed',
    };
    return names[status] || status;
  },

  /**
   * Get status color
   */
  getStatusColor(status: import('@shared/types/stagecoach.types').StagecoachStatus): string {
    const colors: Record<string, string> = {
      loading: 'text-blue-400',
      traveling: 'text-green-400',
      arrived: 'text-gold-light',
      ambushed: 'text-blood-red',
      broken_down: 'text-orange-400',
      delayed: 'text-yellow-400',
    };
    return colors[status] || 'text-white';
  },

  /**
   * Get display name for terrain type
   */
  getTerrainName(terrain: import('@shared/types/stagecoach.types').TerrainType): string {
    const names: Record<string, string> = {
      plains: 'Plains',
      desert: 'Desert',
      mountains: 'Mountains',
      canyon: 'Canyon',
      forest: 'Forest',
      badlands: 'Badlands',
      river_crossing: 'River Crossing',
    };
    return names[terrain] || terrain;
  },

  /**
   * Get display name for ambush strategy
   */
  getStrategyName(strategy: string): string {
    const names: Record<string, string> = {
      roadblock: 'Road Block',
      canyon_trap: 'Canyon Trap',
      bridge_sabotage: 'Bridge Sabotage',
      surprise_attack: 'Surprise Attack',
    };
    return names[strategy] || strategy;
  },

  /**
   * Get setup time for ambush strategy (in minutes)
   */
  getStrategySetupTime(strategy: string): number {
    const times: Record<string, number> = {
      roadblock: 30,
      canyon_trap: 45,
      bridge_sabotage: 60,
      surprise_attack: 20,
    };
    return times[strategy] || 30;
  },

  /**
   * Get strategy description
   */
  getStrategyDescription(strategy: string): string {
    const descriptions: Record<string, string> = {
      roadblock: 'Block the road to force the stagecoach to stop. Requires setup but provides cover.',
      canyon_trap: 'Use the canyon walls to trap the stagecoach. Difficult to escape for both sides.',
      bridge_sabotage: 'Damage the bridge to stop the stagecoach. High risk but high reward.',
      surprise_attack: 'Quick attack with minimal setup. Relies on speed and surprise.',
    };
    return descriptions[strategy] || '';
  },

  /**
   * Get danger level color
   */
  getDangerColor(level: number): string {
    if (level <= 3) return 'text-green-400';
    if (level <= 5) return 'text-yellow-400';
    if (level <= 7) return 'text-orange-400';
    return 'text-blood-red';
  },

  /**
   * Get danger level name
   */
  getDangerName(level: number): string {
    if (level <= 2) return 'Safe';
    if (level <= 4) return 'Low Risk';
    if (level <= 6) return 'Moderate';
    if (level <= 8) return 'Dangerous';
    return 'Extremely Dangerous';
  },

  /**
   * Format duration in hours to readable string
   */
  formatDuration(hours: number): string {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    }
    const wholeHours = Math.floor(hours);
    const mins = Math.round((hours - wholeHours) * 60);
    return mins > 0 ? `${wholeHours}h ${mins}m` : `${wholeHours}h`;
  },

  /**
   * Format distance in miles
   */
  formatDistance(miles: number): string {
    return `${miles} mi`;
  },

  /**
   * Calculate fare for a journey
   */
  calculateFare(route: import('@shared/types/stagecoach.types').StagecoachRoute, distance: number): number {
    return Math.ceil(route.fare.base + (distance * route.fare.perMile));
  },

  /**
   * Get location type icon
   */
  getLocationTypeIcon(type: import('@shared/types/stagecoach.types').AmbushLocationType): string {
    const icons: Record<string, string> = {
      canyon_pass: '🏜️',
      river_crossing: '🌊',
      hill_road: '⛰️',
      bridge: '🌉',
      way_station: '🏠',
      forest_path: '🌲',
      narrow_trail: '🛤️',
    };
    return icons[type] || '📍';
  },

  /**
   * Get cover quality description
   */
  getCoverQualityDescription(quality: number): string {
    if (quality <= 2) return 'Minimal Cover';
    if (quality <= 4) return 'Light Cover';
    if (quality <= 6) return 'Moderate Cover';
    if (quality <= 8) return 'Good Cover';
    return 'Excellent Cover';
  },

  /**
   * Calculate ambush success chance estimate
   */
  estimateSuccessChance(
    coverQuality: number,
    attackerLevels: number[],
    routeDangerLevel: number,
    locationType: import('@shared/types/stagecoach.types').AmbushLocationType
  ): number {
    // Base chance from cover quality (10-100)
    let baseChance = coverQuality * 10;

    // Add 2% per attacker level
    const totalLevels = attackerLevels.reduce((a, b) => a + b, 0);
    baseChance += totalLevels * 2;

    // Add numerical advantage bonus (10% per extra attacker over 2)
    if (attackerLevels.length > 2) {
      baseChance += (attackerLevels.length - 2) * 10;
    }

    // Subtract for route danger level
    baseChance -= routeDangerLevel * 3;

    // Location type bonuses
    const locationBonuses: Record<string, number> = {
      bridge: 20,
      narrow_trail: 18,
      canyon_pass: 15,
      forest_path: 12,
      river_crossing: 10,
      hill_road: 8,
      way_station: 5,
    };
    baseChance += locationBonuses[locationType] || 0;

    // Clamp between 10-95
    return Math.min(95, Math.max(10, baseChance));
  },

  /**
   * Get ticket status badge color
   */
  getTicketStatusColor(status: string): string {
    const colors: Record<string, string> = {
      booked: 'bg-blue-900/50 text-blue-400',
      boarding: 'bg-amber-900/50 text-amber-400',
      traveling: 'bg-green-900/50 text-green-400',
      completed: 'bg-gray-900/50 text-gray-400',
      cancelled: 'bg-red-900/50 text-red-400',
    };
    return colors[status] || 'bg-gray-900/50 text-gray-400';
  },
};

export default stagecoachService;
