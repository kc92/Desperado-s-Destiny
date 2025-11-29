/**
 * Stagecoach System Types
 *
 * Types for the stagecoach transportation and ambush system
 */

/**
 * Stagecoach types
 */
export type StagecoachType =
  | 'passenger'      // Regular passenger transport
  | 'mail'          // Mail and parcel delivery
  | 'treasure'      // Armored transport for valuables
  | 'private';      // Private charter

/**
 * Terrain types for routes
 */
export type TerrainType =
  | 'plains'
  | 'desert'
  | 'mountains'
  | 'canyon'
  | 'forest'
  | 'badlands'
  | 'river_crossing';

/**
 * Stagecoach status
 */
export type StagecoachStatus =
  | 'loading'        // Boarding passengers
  | 'traveling'      // En route
  | 'arrived'        // Reached destination
  | 'ambushed'       // Under attack
  | 'broken_down'    // Mechanical failure
  | 'delayed';       // Weather/event delay

/**
 * Ambush location types
 */
export type AmbushLocationType =
  | 'canyon_pass'
  | 'river_crossing'
  | 'hill_road'
  | 'bridge'
  | 'way_station'
  | 'forest_path'
  | 'narrow_trail';

/**
 * NPC Driver
 */
export interface NPCDriver {
  name: string;
  skill: number;           // 1-10, affects escape/defense
  experience: number;      // Years driving
  personality: string;
  combatAbility: number;   // 1-10
}

/**
 * NPC Guard
 */
export interface NPCGuard {
  name: string;
  level: number;
  weapon: string;
  accuracy: number;        // 1-10
  alertness: number;       // 1-10, affects ambush detection
}

/**
 * Passenger information
 */
export interface PassengerInfo {
  id: string;
  characterId?: string;    // If player
  name: string;
  isPlayer: boolean;
  luggage: number;         // Weight in lbs
  hasWeapon: boolean;
  combatAbility?: number;  // For NPCs
}

/**
 * Cargo item
 */
export interface StagecoachCargoItem {
  type: 'mail' | 'parcel' | 'strongbox' | 'luggage';
  description: string;
  value: number;           // Gold value
  weight: number;          // In lbs
  owner?: string;          // Character or NPC name
  protected: boolean;      // Wells Fargo protection
}

/**
 * Cargo manifest
 */
export interface StagecoachCargoManifest {
  items: StagecoachCargoItem[];
  totalValue: number;
  totalWeight: number;
  hasStrongbox: boolean;
  strongboxValue?: number;
}

/**
 * Route stop
 */
export interface StagecoachRouteStop {
  locationId: string;
  locationName: string;
  stopOrder: number;       // 1, 2, 3...
  stopDuration: number;    // Minutes
  canBoard: boolean;
  canDisembark: boolean;
}

/**
 * Stagecoach route
 */
export interface StagecoachRoute {
  id: string;
  name: string;
  description: string;
  stops: StagecoachRouteStop[];
  totalDistance: number;   // In miles
  baseDuration: number;    // In hours
  dangerLevel: number;     // 1-10
  terrain: TerrainType[];
  weatherAffected: boolean;
  fare: {
    base: number;          // Base fare
    perMile: number;       // Per mile rate
  };
  frequency: string;       // e.g., "Every 6 hours"
  schedule: number[];      // Departure hours (0-23)
  isActive: boolean;
}

/**
 * Route position
 */
export interface RoutePosition {
  currentStopIndex: number;
  nextStopIndex: number;
  distanceToNext: number;  // Miles
  progressPercent: number; // 0-100
}

/**
 * Stagecoach instance
 */
export interface Stagecoach {
  id: string;
  type: StagecoachType;
  capacity: number;
  currentRoute: StagecoachRoute;
  driver: NPCDriver;
  guards: NPCGuard[];
  passengers: PassengerInfo[];
  cargo: StagecoachCargoManifest;
  condition: number;       // 1-100, affects speed/safety
  currentPosition: RoutePosition;
  departureTime: Date;
  estimatedArrival: Date;
  status: StagecoachStatus;
  events: StagecoachEvent[];
}

/**
 * Stagecoach event (during journey)
 */
export interface StagecoachEvent {
  type: 'ambush' | 'breakdown' | 'weather' | 'wildlife' | 'stop';
  timestamp: Date;
  location: string;
  description: string;
  resolved: boolean;
}

/**
 * Ticket information
 */
export interface StagecoachTicket {
  id: string;
  characterId: string;
  routeId: string;
  stagecoachId: string;
  departureLocation: string;
  destinationLocation: string;
  departureTime: Date;
  estimatedArrival: Date;
  fare: number;
  seatNumber: number;
  luggageWeight: number;
  weaponDeclared: boolean;
  status: 'booked' | 'boarding' | 'traveling' | 'completed' | 'cancelled';
  purchaseTime: Date;
}

/**
 * Way station
 */
export interface WayStation {
  id: string;
  name: string;
  description: string;
  locationId: string;
  region: string;
  facilities: {
    hasStables: boolean;
    hasRooms: boolean;
    hasSaloon: boolean;
    hasBlacksmith: boolean;
  };
  services: {
    changeHorses: boolean;
    repairs: boolean;
    food: boolean;
    lodging: boolean;
  };
  prices: {
    meal: number;
    room: number;
    horseChange: number;
  };
  npcs: string[];          // NPC IDs present
  dangerLevel: number;     // 1-10
  reputation: number;      // 1-100, affects quality
}

/**
 * Ambush spot
 */
export interface AmbushSpot {
  id: string;
  name: string;
  routeId: string;
  locationType: AmbushLocationType;
  position: number;        // 0-100 percent along route
  coverQuality: number;    // 1-10, affects success
  visibilityRange: number; // Yards, affects detection
  escapeRoutes: number;    // Number of escape paths
  description: string;
  terrainAdvantages: string[];
}

/**
 * Ambush plan
 */
export interface AmbushPlan {
  characterId: string;
  routeId: string;
  ambushSpotId: string;
  scheduledTime: Date;
  setupTime: number;       // Minutes needed
  gangMembers?: string[];  // Gang member IDs
  strategy: 'roadblock' | 'canyon_trap' | 'bridge_sabotage' | 'surprise_attack';
  objectives: ('cargo' | 'passengers' | 'mail' | 'strongbox')[];
  escapeRoute: string;
  status: 'planning' | 'setup' | 'ready' | 'executed' | 'failed';
}

/**
 * Ambush result (as attacker)
 */
export interface AmbushResult {
  success: boolean;
  lootGained: StagecoachCargoItem[];
  goldGained: number;
  casualties: {
    guards: number;
    passengers: number;
    attackers: number;
  };
  witnesses: number;
  bountyIncrease: number;
  heatLevel: number;       // 1-10, law response intensity
  escapedClean: boolean;
  consequences: string[];
}

/**
 * Defense result (as passenger/guard)
 */
export interface DefenseResult {
  success: boolean;
  ambushersDefeated: number;
  damageToStagecoach: number;
  cargoLost: StagecoachCargoItem[];
  goldReward: number;      // For defending
  xpReward: number;
  reputationGain: number;
  injuredPassengers: number;
}

/**
 * Random encounter on stagecoach
 */
export interface StagecoachEncounter {
  type: 'ambush' | 'breakdown' | 'weather_delay' | 'wildlife' | 'bandit_sighting' | 'lawmen' | 'traveler';
  severity: number;        // 1-10
  description: string;
  choices: EncounterChoice[];
  resolved: boolean;
}

/**
 * Encounter choice
 */
export interface EncounterChoice {
  id: string;
  text: string;
  skillCheck?: {
    skill: string;
    difficulty: number;
  };
  consequences: {
    success: string;
    failure: string;
  };
  rewards?: {
    gold?: number;
    xp?: number;
    reputation?: number;
  };
}

/**
 * Booking request
 */
export interface BookingRequest {
  characterId: string;
  routeId: string;
  departureLocationId: string;
  destinationLocationId: string;
  departureTime?: Date;    // Specific departure or next available
  luggageWeight: number;
  weaponDeclared: boolean;
}

/**
 * Booking response
 */
export interface BookingResponse {
  success: boolean;
  ticket?: StagecoachTicket;
  stagecoach?: Stagecoach;
  message: string;
  fare: number;
  departureTime: Date;
  estimatedArrival: Date;
}

/**
 * Charter request (private stagecoach)
 */
export interface CharterRequest {
  characterId: string;
  customRoute: {
    start: string;
    end: string;
    waypoints?: string[];
  };
  passengers: string[];    // Character IDs
  departureTime: Date;
  specialRequests?: string[];
}

/**
 * Charter quote
 */
export interface CharterQuote {
  baseCost: number;
  distanceCost: number;
  guardCost: number;
  luxuryCost: number;
  totalCost: number;
  estimatedDuration: number;
  availableGuards: number;
}

/**
 * Travel progress update
 */
export interface TravelProgress {
  stagecoachId: string;
  currentPosition: RoutePosition;
  estimatedArrival: Date;
  status: StagecoachStatus;
  events: StagecoachEvent[];
  currentSpeed: number;    // MPH
  delayMinutes: number;
}

/**
 * Stagecoach company
 */
export interface StagecoachCompany {
  id: string;
  name: string;
  reputation: number;      // 1-100
  routes: string[];        // Route IDs
  fleet: number;           // Number of stagecoaches
  safety: number;          // 1-100, affects incidents
  punctuality: number;     // 1-100, affects delays
  comfort: number;         // 1-100, affects experience
  prices: 'cheap' | 'standard' | 'premium';
}

/**
 * Loot distribution (for gang ambushes)
 */
export interface LootDistribution {
  totalValue: number;
  shares: {
    characterId: string;
    characterName: string;
    sharePercent: number;
    goldAmount: number;
    items: StagecoachCargoItem[];
  }[];
  leaderBonus: number;
}

/**
 * API Response Types
 */

export interface GetRoutesResponse {
  routes: StagecoachRoute[];
  wayStations: WayStation[];
}

export interface GetScheduleResponse {
  routeId: string;
  upcomingDepartures: {
    time: Date;
    seatsAvailable: number;
    fare: number;
  }[];
}

export interface BookTicketResponse extends BookingResponse {}

export interface GetTicketResponse {
  ticket: StagecoachTicket;
  stagecoach: Stagecoach;
  currentProgress?: TravelProgress;
}

export interface CancelTicketResponse {
  success: boolean;
  refundAmount: number;
  message: string;
}

export interface GetAmbushSpotsResponse {
  routeId: string;
  spots: AmbushSpot[];
}

export interface SetupAmbushResponse {
  success: boolean;
  plan: AmbushPlan;
  estimatedSetupTime: number;
  message: string;
}

export interface ExecuteAmbushResponse {
  result: AmbushResult;
  combatLog: string[];
}

export interface DefendStagecoachResponse {
  result: DefenseResult;
  combatLog: string[];
}

export interface CharterStagecoachResponse {
  success: boolean;
  quote: CharterQuote;
  bookingId?: string;
  message: string;
}
