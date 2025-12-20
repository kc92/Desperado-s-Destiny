/**
 * Train Service
 * API client for the railroad transportation and robbery system
 */

import api from './api';

// ===== Re-export Types from Shared =====
export {
  TrainType,
  TrainStatus,
  TicketClass,
  TicketStatus,
  TrainFrequency,
  RobberyApproach,
  RobberyPhase,
  LootType,
  PursuitLevel,
  TRAIN_CONSTANTS,
} from '@shared/types/train.types';

export type {
  TrainRoute,
  TrainRouteStop,
  TrainSchedule,
  TrainTicket,
  CargoShipment,
  TrainCargoItem,
  TrainRobberyPlan,
  RobberyGangMember,
  RobberyEquipment,
  RobberyIntelligence,
  TrainRobberyResult,
  RobberyLoot,
  RobberyCasualty,
  RobberyConsequence,
  PinkertonPursuit,
  PinkertonAgent,
  TrainTravelResult,
  CargoShippingQuote,
} from '@shared/types/train.types';

// ===== Request/Response Types =====

export interface SearchTrainsParams {
  origin: string;
  destination: string;
  afterTime?: Date | string;
}

export interface PurchaseTicketRequest {
  origin: string;
  destination: string;
  ticketClass: 'COACH' | 'FIRST_CLASS' | 'PRIVATE_CAR';
  departureTime?: Date | string;
}

export interface PurchaseTicketResponse {
  success: boolean;
  ticket: import('@shared/types/train.types').TrainTicket;
  train: import('@shared/types/train.types').TrainSchedule;
  departureTime: Date;
  arrivalTime: Date;
  duration: number;
  cost: number;
  perks: string[];
  message: string;
}

export interface CargoQuoteRequest {
  origin: string;
  destination: string;
  cargo: import('@shared/types/train.types').TrainCargoItem[];
  insured?: boolean;
}

export interface CargoQuoteResponse {
  success: boolean;
  quote: import('@shared/types/train.types').CargoShippingQuote;
}

export interface ShipCargoResponse {
  success: boolean;
  shipment: import('@shared/types/train.types').CargoShipment;
  message: string;
}

export interface ScoutTrainRequest {
  trainId: string;
  departureTime?: Date | string;
}

export interface ScoutTrainResponse {
  success: boolean;
  intelligence: import('@shared/types/train.types').RobberyIntelligence;
  energyCost: number;
  message: string;
}

export interface PlanRobberyRequest {
  trainId: string;
  departureTime: Date | string;
  approach: import('@shared/types/train.types').RobberyApproach;
  targetLocation: string;
  gangMemberIds: string[];
  equipment: import('@shared/types/train.types').RobberyEquipment[];
}

export interface PlanRobberyResponse {
  success: boolean;
  plan: import('@shared/types/train.types').TrainRobberyPlan;
  estimatedRisk: number;
  estimatedLoot: number;
  message: string;
}

export interface ExecuteRobberyResponse {
  success: boolean;
  result: import('@shared/types/train.types').TrainRobberyResult;
  message: string;
}

export interface TrainDeparture {
  trainId: string;
  trainName: string;
  trainType: import('@shared/types/train.types').TrainType;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  status: import('@shared/types/train.types').TrainStatus;
  seatsAvailable: number;
}

export interface StationInfo {
  hasStation: boolean;
  stationName?: string;
  locationId: string;
  availableRoutes?: string[];
}

// ===== Train Service =====

export const trainService = {
  // ===== Route & Schedule Methods =====

  /**
   * Get all available train routes
   */
  async getRoutes(): Promise<import('@shared/types/train.types').TrainRoute[]> {
    const response = await api.get<{ data: { routes: import('@shared/types/train.types').TrainRoute[] } }>('/trains/routes');
    return response.data.data?.routes || [];
  },

  /**
   * Get all train schedules
   */
  async getSchedules(): Promise<import('@shared/types/train.types').TrainSchedule[]> {
    const response = await api.get<{ data: { schedules: import('@shared/types/train.types').TrainSchedule[] } }>('/trains/schedules');
    return response.data.data?.schedules || [];
  },

  /**
   * Search for trains between two locations
   */
  async searchTrains(params: SearchTrainsParams): Promise<import('@shared/types/train.types').TrainSchedule[]> {
    const response = await api.get<{ data: { trains: import('@shared/types/train.types').TrainSchedule[] } }>('/trains/search', {
      params: {
        origin: params.origin,
        destination: params.destination,
        afterTime: params.afterTime,
      },
    });
    return response.data.data?.trains || [];
  },

  /**
   * Get routes between two locations
   */
  async getRoutesBetween(origin: string, destination: string): Promise<import('@shared/types/train.types').TrainRoute[]> {
    const response = await api.get<{ data: { routes: import('@shared/types/train.types').TrainRoute[] } }>('/trains/routes/between', {
      params: { origin, destination },
    });
    return response.data.data?.routes || [];
  },

  /**
   * Get upcoming departures from a location
   */
  async getDepartures(locationId: string, afterTime?: Date | string): Promise<TrainDeparture[]> {
    const response = await api.get<{ data: { departures: TrainDeparture[] } }>(`/trains/location/${locationId}/departures`, {
      params: afterTime ? { afterTime } : undefined,
    });
    return response.data.data?.departures || [];
  },

  /**
   * Check if a location has a train station
   */
  async checkStation(locationId: string): Promise<StationInfo> {
    const response = await api.get<{ data: StationInfo }>(`/trains/station/${locationId}`);
    return response.data.data;
  },

  /**
   * Get information about a specific train
   */
  async getTrainInfo(trainId: string): Promise<import('@shared/types/train.types').TrainSchedule | null> {
    const response = await api.get<{ data: { train: import('@shared/types/train.types').TrainSchedule } }>(`/trains/${trainId}`);
    return response.data.data?.train || null;
  },

  // ===== Ticket Methods =====

  /**
   * Get character's train tickets
   */
  async getMyTickets(includeUsed: boolean = false): Promise<import('@shared/types/train.types').TrainTicket[]> {
    const response = await api.get<{ data: { tickets: import('@shared/types/train.types').TrainTicket[] } }>('/trains/tickets', {
      params: { includeUsed },
    });
    return response.data.data?.tickets || [];
  },

  /**
   * Purchase a train ticket
   */
  async purchaseTicket(request: PurchaseTicketRequest): Promise<PurchaseTicketResponse> {
    const response = await api.post<{ data: PurchaseTicketResponse }>('/trains/tickets/purchase', request);
    return response.data.data;
  },

  /**
   * Board a train using a ticket
   */
  async boardTrain(ticketId: string): Promise<{ success: boolean; message: string; arrivalTime?: Date }> {
    const response = await api.post<{ data: { success: boolean; message: string; arrivalTime?: Date } }>(`/trains/tickets/${ticketId}/board`);
    return response.data.data;
  },

  /**
   * Refund a ticket (80% refund if 2+ hours before departure)
   */
  async refundTicket(ticketId: string): Promise<{ success: boolean; refundAmount: number; message: string }> {
    const response = await api.post<{ data: { success: boolean; refundAmount: number; message: string } }>(`/trains/tickets/${ticketId}/refund`);
    return response.data.data;
  },

  // ===== Cargo Methods =====

  /**
   * Get a quote for shipping cargo
   */
  async getCargoQuote(request: CargoQuoteRequest): Promise<CargoQuoteResponse> {
    const response = await api.post<{ data: CargoQuoteResponse }>('/trains/cargo/quote', request);
    return response.data.data;
  },

  /**
   * Ship cargo via train
   */
  async shipCargo(request: CargoQuoteRequest): Promise<ShipCargoResponse> {
    const response = await api.post<{ data: ShipCargoResponse }>('/trains/cargo/ship', request);
    return response.data.data;
  },

  // ===== Robbery Methods =====

  /**
   * Get all robbery plans for the character
   */
  async getRobberyPlans(): Promise<import('@shared/types/train.types').TrainRobberyPlan[]> {
    const response = await api.get<{ data: { plans: import('@shared/types/train.types').TrainRobberyPlan[] } }>('/trains/robbery/plans');
    return response.data.data?.plans || [];
  },

  /**
   * Get a specific robbery plan
   */
  async getRobberyPlan(robberyId: string): Promise<import('@shared/types/train.types').TrainRobberyPlan | null> {
    const response = await api.get<{ data: { plan: import('@shared/types/train.types').TrainRobberyPlan } }>(`/trains/robbery/${robberyId}`);
    return response.data.data?.plan || null;
  },

  /**
   * Get active Pinkerton pursuit
   */
  async getActivePursuit(): Promise<import('@shared/types/train.types').PinkertonPursuit | null> {
    const response = await api.get<{ data: { pursuit: import('@shared/types/train.types').PinkertonPursuit | null } }>('/trains/robbery/pursuit');
    return response.data.data?.pursuit || null;
  },

  /**
   * Scout a train for robbery intelligence
   */
  async scoutTrain(request: ScoutTrainRequest): Promise<ScoutTrainResponse> {
    const response = await api.post<{ data: ScoutTrainResponse }>('/trains/robbery/scout', request);
    return response.data.data;
  },

  /**
   * Plan a train robbery
   */
  async planRobbery(request: PlanRobberyRequest): Promise<PlanRobberyResponse> {
    const response = await api.post<{ data: PlanRobberyResponse }>('/trains/robbery/plan', request);
    return response.data.data;
  },

  /**
   * Execute a planned robbery
   */
  async executeRobbery(robberyId: string): Promise<ExecuteRobberyResponse> {
    const response = await api.post<{ data: ExecuteRobberyResponse }>(`/trains/robbery/${robberyId}/execute`);
    return response.data.data;
  },

  // ===== Helper Methods =====

  /**
   * Get display name for train type
   */
  getTrainTypeName(type: import('@shared/types/train.types').TrainType): string {
    const names: Record<string, string> = {
      PASSENGER: 'Passenger',
      FREIGHT: 'Freight',
      MILITARY: 'Military',
      PRISON_TRANSPORT: 'Prison Transport',
      VIP_EXPRESS: 'VIP Express',
      GOLD_TRAIN: 'Gold Train',
      MAIL_EXPRESS: 'Mail Express',
      SUPPLY_RUN: 'Supply Run',
    };
    return names[type] || type;
  },

  /**
   * Get display name for ticket class
   */
  getTicketClassName(ticketClass: import('@shared/types/train.types').TicketClass): string {
    const names: Record<string, string> = {
      COACH: 'Coach Class',
      FIRST_CLASS: 'First Class',
      PRIVATE_CAR: 'Private Car',
    };
    return names[ticketClass] || ticketClass;
  },

  /**
   * Get ticket class price multiplier
   */
  getTicketPriceMultiplier(ticketClass: import('@shared/types/train.types').TicketClass): number {
    const multipliers: Record<string, number> = {
      COACH: 1,
      FIRST_CLASS: 3,
      PRIVATE_CAR: 10,
    };
    return multipliers[ticketClass] || 1;
  },

  /**
   * Get display name for robbery approach
   */
  getRobberyApproachName(approach: import('@shared/types/train.types').RobberyApproach): string {
    const names: Record<string, string> = {
      HORSEBACK_CHASE: 'Horseback Chase',
      BRIDGE_BLOCK: 'Bridge Blockade',
      INSIDE_JOB: 'Inside Job',
      TUNNEL_AMBUSH: 'Tunnel Ambush',
      STATION_ASSAULT: 'Station Assault',
      STEALTH_BOARDING: 'Stealth Boarding',
    };
    return names[approach] || approach;
  },

  /**
   * Get difficulty modifier for robbery approach
   */
  getRobberyDifficulty(approach: import('@shared/types/train.types').RobberyApproach): number {
    const difficulties: Record<string, number> = {
      HORSEBACK_CHASE: 1.2,
      BRIDGE_BLOCK: 1.0,
      INSIDE_JOB: 0.8,
      TUNNEL_AMBUSH: 0.9,
      STATION_ASSAULT: 1.3,
      STEALTH_BOARDING: 1.1,
    };
    return difficulties[approach] || 1.0;
  },

  /**
   * Get display name for robbery phase
   */
  getRobberyPhaseName(phase: import('@shared/types/train.types').RobberyPhase): string {
    const names: Record<string, string> = {
      PLANNING: 'Planning',
      APPROACH: 'Approaching',
      BOARDING: 'Boarding',
      COMBAT: 'Combat',
      LOOTING: 'Looting',
      ESCAPE: 'Escaping',
      COMPLETE: 'Complete',
      FAILED: 'Failed',
    };
    return names[phase] || phase;
  },

  /**
   * Get train status color
   */
  getStatusColor(status: import('@shared/types/train.types').TrainStatus): string {
    const colors: Record<string, string> = {
      RUNNING: 'text-green-400',
      DELAYED: 'text-yellow-400',
      CANCELLED: 'text-red-400',
      ROBBED: 'text-blood-red',
      MAINTENANCE: 'text-gray-400',
      LOADING: 'text-blue-400',
      DEPARTING: 'text-amber-400',
    };
    return colors[status] || 'text-white';
  },

  /**
   * Get pursuit level severity
   */
  getPursuitSeverity(level: import('@shared/types/train.types').PursuitLevel): { name: string; color: string } {
    const severities: Record<string, { name: string; color: string }> = {
      NONE: { name: 'None', color: 'text-gray-400' },
      LOCAL_SHERIFF: { name: 'Local Sheriff', color: 'text-yellow-400' },
      FEDERAL_MARSHALS: { name: 'Federal Marshals', color: 'text-orange-400' },
      PINKERTON_AGENTS: { name: 'Pinkerton Agents', color: 'text-red-400' },
      MILITARY: { name: 'Military', color: 'text-blood-red' },
    };
    return severities[level] || { name: level, color: 'text-white' };
  },

  /**
   * Format duration in minutes to readable string
   */
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  },

  /**
   * Calculate estimated price for a ticket
   */
  calculateTicketPrice(durationMinutes: number, ticketClass: import('@shared/types/train.types').TicketClass): number {
    const baseRate = 50; // $50 per hour for coach
    const hours = durationMinutes / 60;
    const multiplier = this.getTicketPriceMultiplier(ticketClass);
    return Math.ceil(baseRate * hours * multiplier);
  },
};

export default trainService;
