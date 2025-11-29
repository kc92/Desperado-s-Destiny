/**
 * Train System Types
 *
 * Comprehensive railroad system with routes, schedules, tickets, and robbery mechanics
 */

import type { ObjectId } from 'mongoose';

/**
 * Train Type
 */
export enum TrainType {
  PASSENGER = 'PASSENGER',
  FREIGHT = 'FREIGHT',
  MILITARY = 'MILITARY',
  PRISON_TRANSPORT = 'PRISON_TRANSPORT',
  VIP_EXPRESS = 'VIP_EXPRESS',
  GOLD_TRAIN = 'GOLD_TRAIN',
  MAIL_EXPRESS = 'MAIL_EXPRESS',
  SUPPLY_RUN = 'SUPPLY_RUN',
}

/**
 * Train Status
 */
export enum TrainStatus {
  RUNNING = 'RUNNING',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED',
  ROBBED = 'ROBBED',
  MAINTENANCE = 'MAINTENANCE',
  LOADING = 'LOADING',
  DEPARTING = 'DEPARTING',
}

/**
 * Ticket Class (for passenger trains)
 */
export enum TicketClass {
  COACH = 'COACH',
  FIRST_CLASS = 'FIRST_CLASS',
  PRIVATE_CAR = 'PRIVATE_CAR',
}

/**
 * Ticket Status
 */
export enum TicketStatus {
  VALID = 'VALID',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

/**
 * Train Frequency
 */
export enum TrainFrequency {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  SPECIAL = 'SPECIAL',
}

/**
 * Robbery Approach
 */
export enum RobberyApproach {
  HORSEBACK_CHASE = 'HORSEBACK_CHASE',
  BRIDGE_BLOCK = 'BRIDGE_BLOCK',
  INSIDE_JOB = 'INSIDE_JOB',
  TUNNEL_AMBUSH = 'TUNNEL_AMBUSH',
  STATION_ASSAULT = 'STATION_ASSAULT',
  STEALTH_BOARDING = 'STEALTH_BOARDING',
}

/**
 * Robbery Phase
 */
export enum RobberyPhase {
  PLANNING = 'PLANNING',
  APPROACH = 'APPROACH',
  BOARDING = 'BOARDING',
  COMBAT = 'COMBAT',
  LOOTING = 'LOOTING',
  ESCAPE = 'ESCAPE',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED',
}

/**
 * Loot Type
 */
export enum LootType {
  PASSENGER_VALUABLES = 'PASSENGER_VALUABLES',
  CARGO = 'CARGO',
  STRONGBOX = 'STRONGBOX',
  MILITARY_PAYROLL = 'MILITARY_PAYROLL',
  MAIL_BAGS = 'MAIL_BAGS',
  WEAPONS_SHIPMENT = 'WEAPONS_SHIPMENT',
  GOLD_BARS = 'GOLD_BARS',
  SUPPLIES = 'SUPPLIES',
}

/**
 * Pursuit Level (after robbery)
 */
export enum PursuitLevel {
  NONE = 'NONE',
  LOCAL_SHERIFF = 'LOCAL_SHERIFF',
  FEDERAL_MARSHALS = 'FEDERAL_MARSHALS',
  PINKERTON_AGENTS = 'PINKERTON_AGENTS',
  MILITARY = 'MILITARY',
}

/**
 * Train Route Stop
 */
export interface TrainRouteStop {
  locationId: string;
  locationName: string;
  arrivalOffset: number; // Minutes from departure
  departureOffset: number; // Minutes from departure
  isTerminal: boolean;
  canBoard: boolean;
  canDisembark: boolean;
}

/**
 * Train Route Definition
 */
export interface TrainRoute {
  routeId: string;
  name: string;
  description: string;
  stops: TrainRouteStop[];
  totalDuration: number; // Total journey time in minutes
  isActive: boolean;
}

/**
 * Train Schedule Entry
 */
export interface TrainSchedule {
  trainId: string;
  trainName: string;
  trainType: TrainType;
  routeId: string;
  departureHour: number; // 0-23
  frequency: TrainFrequency;
  currentLocation?: string;
  currentStopIndex?: number;
  nextArrival?: Date;
  status: TrainStatus;
  guards: number; // Number of guards on train
  securityLevel: number; // 1-10
  cargoValue?: number; // Estimated value for robberies
  passengerCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Train Ticket
 */
export interface TrainTicket {
  _id?: string | ObjectId;
  id?: string;
  passengerId: string | ObjectId;
  passengerName?: string;
  trainId: string;
  routeId: string;
  ticketClass: TicketClass;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  price: number;
  status: TicketStatus;
  seatNumber?: string;
  perks?: string[]; // e.g., 'dining_car', 'sleeper_car', 'bar_access'
  purchasedAt: Date;
  usedAt?: Date;
  refundedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Cargo Shipment
 */
export interface CargoShipment {
  _id?: string | ObjectId;
  id?: string;
  shipperId: string | ObjectId;
  shipperName?: string;
  trainId: string;
  routeId: string;
  origin: string;
  destination: string;
  cargo: TrainCargoItem[];
  totalWeight: number; // in lbs
  totalValue: number; // in gold
  insured: boolean;
  insuranceCost?: number;
  shippingCost: number;
  departureTime: Date;
  arrivalTime: Date;
  status: 'pending' | 'in_transit' | 'delivered' | 'lost' | 'stolen';
  deliveredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Train Cargo Item
 */
export interface TrainCargoItem {
  itemId: string;
  itemName: string;
  quantity: number;
  weight: number; // per unit
  value: number; // per unit
}

/**
 * Train Robbery Plan
 */
export interface TrainRobberyPlan {
  _id?: string | ObjectId;
  id?: string;
  plannerId: string | ObjectId;
  plannerName?: string;
  targetTrainId: string;
  targetRouteName?: string;
  targetDepartureTime: Date;
  approach: RobberyApproach;
  targetLocation: string; // Where the robbery will occur
  gangMembers: RobberyGangMember[];
  equipment: RobberyEquipment[];
  intelligence: RobberyIntelligence;
  estimatedLoot: number;
  estimatedRisk: number; // 1-10
  phase: RobberyPhase;
  createdAt?: Date;
  executedAt?: Date;
  completedAt?: Date;
}

/**
 * Gang Member in Robbery
 */
export interface RobberyGangMember {
  characterId: string | ObjectId;
  characterName: string;
  role: 'leader' | 'explosives' | 'gunslinger' | 'lockpick' | 'lookout' | 'driver';
  cut: number; // Percentage of loot
  status: 'ready' | 'active' | 'injured' | 'captured' | 'escaped';
}

/**
 * Robbery Equipment
 */
export interface RobberyEquipment {
  itemId: string;
  itemName: string;
  quantity: number;
  purpose: string; // e.g., 'blow safe', 'stop train', 'tie up guards'
}

/**
 * Robbery Intelligence (scouting info)
 */
export interface RobberyIntelligence {
  scouted: boolean;
  scoutedAt?: Date;
  guardCount: number;
  securityLevel: number;
  cargoTypes: LootType[];
  estimatedValue: number;
  passengerCount?: number;
  wealthyPassengers?: number;
  safeLocation?: string;
  guardPatterns?: string[];
  vulnerabilities?: string[];
}

/**
 * Train Robbery Result
 */
export interface TrainRobberyResult {
  robberyId: string | ObjectId;
  success: boolean;
  phase: RobberyPhase;
  lootCollected: RobberyLoot[];
  totalValue: number;
  casualties: RobberyCasualty[];
  witnessCount: number;
  bountyIncrease: number;
  pursuitLevel: PursuitLevel;
  gangMembersFate: Array<{
    characterId: string;
    escaped: boolean;
    captured: boolean;
    injured: boolean;
    killed: boolean;
    lootShare?: number;
  }>;
  consequences: RobberyConsequence[];
  narrative: string[];
  completedAt: Date;
}

/**
 * Robbery Loot
 */
export interface RobberyLoot {
  type: LootType;
  items?: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    value: number;
  }>;
  gold?: number;
  description: string;
}

/**
 * Robbery Casualty
 */
export interface RobberyCasualty {
  type: 'guard' | 'passenger' | 'gang_member';
  name?: string;
  characterId?: string;
  status: 'injured' | 'killed' | 'unconscious';
}

/**
 * Robbery Consequence
 */
export interface RobberyConsequence {
  type: 'bounty' | 'reputation' | 'wanted_level' | 'faction_standing' | 'pursuit';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  description: string;
  value?: number;
  faction?: string;
}

/**
 * Pinkerton Pursuit
 */
export interface PinkertonPursuit {
  _id?: string | ObjectId;
  id?: string;
  targetCharacterId: string | ObjectId;
  targetName?: string;
  robberyId: string | ObjectId;
  pursuers: PinkertonAgent[];
  startedAt: Date;
  endsAt?: Date;
  status: 'active' | 'escaped' | 'captured' | 'abandoned';
  intensity: number; // 1-10, increases over time
  encounterChance: number; // Daily encounter chance
  lastEncounter?: Date;
  createdAt?: Date;
}

/**
 * Pinkerton Agent
 */
export interface PinkertonAgent {
  name: string;
  level: number;
  specialty: 'tracker' | 'gunfighter' | 'detective' | 'negotiator';
  stats: {
    combat: number;
    cunning: number;
    tracking: number;
  };
}

/**
 * Train Travel Request
 */
export interface TrainTravelRequest {
  characterId: string;
  origin: string;
  destination: string;
  ticketClass: TicketClass;
  departureTime?: Date; // If not specified, next available
}

/**
 * Train Travel Result
 */
export interface TrainTravelResult {
  ticket: TrainTicket;
  train: TrainSchedule;
  departureTime: Date;
  arrivalTime: Date;
  duration: number; // in minutes
  cost: number;
  perks: string[];
}

/**
 * Cargo Shipping Request
 */
export interface CargoShippingRequest {
  characterId: string;
  origin: string;
  destination: string;
  cargo: TrainCargoItem[];
  insured: boolean;
}

/**
 * Cargo Shipping Quote
 */
export interface CargoShippingQuote {
  shippingCost: number;
  insuranceCost: number;
  totalCost: number;
  totalWeight: number;
  totalValue: number;
  estimatedDeparture: Date;
  estimatedArrival: Date;
  duration: number;
  availableTrains: string[];
}

/**
 * Train Robbery Scout Request
 */
export interface TrainScoutRequest {
  characterId: string;
  trainId: string;
  departureTime: Date;
}

/**
 * Train Constants
 */
export const TRAIN_CONSTANTS = {
  // Ticket Prices (base)
  TICKET_PRICES: {
    COACH: 50,
    FIRST_CLASS: 150,
    PRIVATE_CAR: 500,
  },

  // Ticket Class Perks
  TICKET_PERKS: {
    COACH: [],
    FIRST_CLASS: ['dining_car', 'comfortable_seating'],
    PRIVATE_CAR: ['dining_car', 'sleeper_car', 'bar_access', 'private_service', 'luggage_storage'],
  },

  // Travel Time Reduction vs Stagecoach
  TIME_REDUCTION: 0.4, // 60% faster than stagecoach

  // Cargo Shipping Rates
  CARGO_RATE_PER_LB: 0.1, // Gold per pound
  INSURANCE_RATE: 0.05, // 5% of cargo value

  // Guard Counts by Train Type
  GUARD_COUNTS: {
    PASSENGER: 2,
    FREIGHT: 3,
    MILITARY: 8,
    PRISON_TRANSPORT: 6,
    VIP_EXPRESS: 5,
    GOLD_TRAIN: 12,
    MAIL_EXPRESS: 2,
    SUPPLY_RUN: 4,
  },

  // Security Levels by Train Type
  SECURITY_LEVELS: {
    PASSENGER: 3,
    FREIGHT: 4,
    MILITARY: 9,
    PRISON_TRANSPORT: 8,
    VIP_EXPRESS: 7,
    GOLD_TRAIN: 10,
    MAIL_EXPRESS: 3,
    SUPPLY_RUN: 5,
  },

  // Robbery Difficulty Modifiers
  ROBBERY_DIFFICULTY: {
    HORSEBACK_CHASE: 1.2,
    BRIDGE_BLOCK: 1.0,
    INSIDE_JOB: 0.8,
    TUNNEL_AMBUSH: 0.9,
    STATION_ASSAULT: 1.3,
    STEALTH_BOARDING: 1.1,
  },

  // Bounty Increases by Train Type
  BOUNTY_INCREASES: {
    PASSENGER: 200,
    FREIGHT: 300,
    MILITARY: 1000,
    PRISON_TRANSPORT: 800,
    VIP_EXPRESS: 600,
    GOLD_TRAIN: 1500,
    MAIL_EXPRESS: 250,
    SUPPLY_RUN: 350,
  },

  // Wanted Level Increases
  WANTED_INCREASES: {
    PASSENGER: 1,
    FREIGHT: 1,
    MILITARY: 3,
    PRISON_TRANSPORT: 2,
    VIP_EXPRESS: 2,
    GOLD_TRAIN: 3,
    MAIL_EXPRESS: 1,
    SUPPLY_RUN: 1,
  },

  // Pinkerton Pursuit Duration (days)
  PURSUIT_DURATION: {
    PASSENGER: 3,
    FREIGHT: 5,
    MILITARY: 14,
    PRISON_TRANSPORT: 10,
    VIP_EXPRESS: 7,
    GOLD_TRAIN: 21,
    MAIL_EXPRESS: 3,
    SUPPLY_RUN: 5,
  },

  // Scouting Requirements
  SCOUTING: {
    ENERGY_COST: 15,
    CUNNING_REQUIRED: 5,
    DURATION_HOURS: 2,
  },

  // Robbery Planning Requirements
  PLANNING: {
    MIN_GANG_SIZE: 3,
    MAX_GANG_SIZE: 8,
    PLANNING_TIME_HOURS: 4,
  },
};
