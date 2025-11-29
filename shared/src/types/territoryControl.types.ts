/**
 * Territory Control Types
 *
 * Shared types for gang territory control system
 */

/**
 * Zone type enum
 */
export enum ZoneType {
  TOWN_DISTRICT = 'town_district',
  WILDERNESS = 'wilderness',
  STRATEGIC_POINT = 'strategic_point',
}

/**
 * Zone benefit type enum
 */
export enum ZoneBenefitType {
  INCOME = 'income',
  COMBAT = 'combat',
  TACTICAL = 'tactical',
  ECONOMIC = 'economic',
}

/**
 * Zone benefit
 */
export interface ZoneBenefit {
  type: ZoneBenefitType;
  description: string;
  value: number;
}

/**
 * Gang influence in zone
 */
export interface GangInfluence {
  gangId: string;
  gangName: string;
  influence: number;
  isNpcGang: boolean;
  lastActivity: string;
}

/**
 * Territory Zone
 */
export interface TerritoryZone {
  _id: string;
  id: string;
  name: string;
  type: ZoneType;
  parentLocation: string;

  controlledBy: string | null;
  controllingGangName: string | null;
  influence: GangInfluence[];
  contestedBy: string[];

  benefits: ZoneBenefit[];
  defenseRating: number;
  dailyIncome: number;

  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Territory control overview for a gang
 */
export interface TerritoryControl {
  gangId: string;
  gangName: string;
  zones: ControlledZone[];
  totalIncome: number;
  totalInfluence: number;
  contestedZones: number;
  empireRating: EmpireRating;
}

/**
 * Controlled zone summary
 */
export interface ControlledZone {
  zoneId: string;
  zoneName: string;
  zoneType: ZoneType;
  influence: number;
  isContested: boolean;
  dailyIncome: number;
  benefits: ZoneBenefit[];
}

/**
 * Empire rating based on territory control
 */
export enum EmpireRating {
  SMALL = 'small',
  GROWING = 'growing',
  MAJOR = 'major',
  DOMINANT = 'dominant',
}

/**
 * Influence activity type
 */
export enum InfluenceActivityType {
  CRIME = 'crime',
  FIGHT = 'fight',
  BRIBE = 'bribe',
  BUSINESS = 'business',
  PASSIVE = 'passive',
}

/**
 * Influence gain result
 */
export interface InfluenceGainResult {
  zoneId: string;
  zoneName: string;
  gangId: string;
  activityType: InfluenceActivityType;
  influenceGained: number;
  newInfluence: number;
  controlChanged: boolean;
  nowControlled: boolean;
  nowContested: boolean;
}

/**
 * Zone contestation request
 */
export interface ContestZoneRequest {
  zoneId: string;
  gangId: string;
}

/**
 * Zone contestation result
 */
export interface ContestZoneResult {
  success: boolean;
  zoneId: string;
  zoneName: string;
  message: string;
  contestedBy: string[];
}

/**
 * Territory map data
 */
export interface TerritoryMapData {
  zones: TerritoryZoneMapInfo[];
  gangLegend: GangLegendEntry[];
}

/**
 * Territory zone map info
 */
export interface TerritoryZoneMapInfo {
  id: string;
  name: string;
  type: ZoneType;
  parentLocation: string;
  controlledBy: string | null;
  controllingGangName: string | null;
  controllingGangColor: string | null;
  isContested: boolean;
  topInfluences: Array<{
    gangId: string;
    gangName: string;
    influence: number;
  }>;
}

/**
 * Gang legend entry for map
 */
export interface GangLegendEntry {
  gangId: string;
  gangName: string;
  gangTag: string;
  color: string;
  zonesControlled: number;
  totalInfluence: number;
}

/**
 * Negotiation request
 */
export interface NegotiationRequest {
  initiatingGangId: string;
  targetGangId: string;
  zoneId: string;
  offerType: 'share' | 'withdraw' | 'truce';
  offerDetails?: {
    goldOffer?: number;
    influenceShare?: number;
    duration?: number; // days
  };
}

/**
 * Negotiation result
 */
export interface NegotiationResult {
  success: boolean;
  message: string;
  agreement?: {
    zoneId: string;
    type: string;
    terms: Record<string, unknown>;
    expiresAt: string;
  };
}

/**
 * Zone statistics
 */
export interface ZoneStatistics {
  totalZones: number;
  controlledZones: number;
  contestedZones: number;
  uncontrolledZones: number;
  byType: {
    town_district: number;
    wilderness: number;
    strategic_point: number;
  };
  byGang: Array<{
    gangId: string;
    gangName: string;
    zonesControlled: number;
  }>;
}

/**
 * NPC Gang territory
 */
export interface NpcGangTerritory {
  gangId: string;
  gangName: string;
  description: string;
  zones: string[];
  attitude: 'hostile' | 'neutral' | 'friendly';
  canAlly: boolean;
  allianceCost?: number;
  tributeCost?: number;
}

/**
 * Influence gain rates
 */
export const INFLUENCE_GAIN = {
  CRIME_MIN: 5,
  CRIME_MAX: 20,
  FIGHT_MIN: 10,
  FIGHT_MAX: 30,
  BRIBE_MIN: 15,
  BRIBE_MAX: 25,
  BUSINESS_MIN: 20,
  BUSINESS_MAX: 40,
  PASSIVE_PER_HOUR: 1,
} as const;

/**
 * Influence loss rates
 */
export const INFLUENCE_LOSS = {
  RIVAL_ACTIVITY_MIN: 10,
  RIVAL_ACTIVITY_MAX: 30,
  LAW_ENFORCEMENT_MIN: 20,
  LAW_ENFORCEMENT_MAX: 50,
  MEMBER_ARREST: 15,
  INACTIVITY_PER_DAY: 5,
} as const;

/**
 * Control thresholds
 */
export const CONTROL_THRESHOLDS = {
  MIN_CONTROL: 50,
  LEAD_REQUIRED: 20,
  CONTEST_THRESHOLD: 30,
} as const;

/**
 * Empire rating thresholds
 */
export const EMPIRE_RATING_THRESHOLDS = {
  SMALL: 0,
  GROWING: 3,
  MAJOR: 8,
  DOMINANT: 15,
} as const;
