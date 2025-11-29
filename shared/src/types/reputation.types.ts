/**
 * Reputation Types
 *
 * Types for the reputation spreading system where NPCs share information
 * about player actions through their social networks
 * Part of Phase 3, Wave 3.2 - Reputation Spreading System
 */

/**
 * Types of reputation-generating events
 */
export enum ReputationEventType {
  CRIME_COMMITTED = 'crime_committed',
  CRIME_WITNESSED = 'crime_witnessed',
  QUEST_COMPLETED = 'quest_completed',
  NPC_HELPED = 'npc_helped',
  NPC_HARMED = 'npc_harmed',
  TRADE_COMPLETED = 'trade_completed',
  BOUNTY_COLLECTED = 'bounty_collected',
  DUEL_WON = 'duel_won',
  DUEL_LOST = 'duel_lost',
  GANG_JOINED = 'gang_joined',
  ACHIEVEMENT_EARNED = 'achievement_earned',
  GIFT_GIVEN = 'gift_given',
  SERVICE_PURCHASED = 'service_purchased',
  BRIBE_GIVEN = 'bribe_given',
  THREAT_MADE = 'threat_made',
}

/**
 * Source of knowledge - how NPC learned about event
 */
export enum KnowledgeSource {
  WITNESSED = 'witnessed',         // Saw it firsthand
  HEARD = 'heard',                 // Heard from trusted source (1-2 hops)
  RUMOR = 'rumor',                 // Heard as gossip (3+ hops)
}

/**
 * Reputation event that spreads through NPC networks
 */
export interface ReputationEvent {
  id: string;
  characterId: string;             // Player who triggered event
  eventType: ReputationEventType;
  magnitude: number;               // 1-100 impact strength
  sentiment: number;               // -100 to +100 (negative to positive)
  faction?: string;                // Which faction cares most
  locationId: string;              // Where it happened
  originNpcId?: string;            // Who witnessed/experienced it
  spreadRadius: number;            // How far it spreads (NPC hops)
  decayRate: number;               // 0.0-1.0: Percentage impact decreases per hop
  timestamp: Date;
  expiresAt?: Date;                // When event becomes forgotten
  description?: string;            // Brief description of what happened

  // Spreading metadata
  spreadCount?: number;            // How many NPCs know about it
  lastSpreadTime?: Date;           // Last time it spread

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * What an NPC knows about a specific event
 */
export interface KnownEvent {
  eventId: string;
  eventType: ReputationEventType;
  perceivedMagnitude: number;      // Degraded from original
  perceivedSentiment: number;      // May differ from original
  source: KnowledgeSource;
  heardFrom?: string;              // Which NPC told them
  hopDistance: number;             // How many hops from origin (0 = witnessed)
  learnedAt: Date;                 // When they learned about it
  credibility: number;             // 0-100: How much they believe it
}

/**
 * An NPC's knowledge about a player character (reputation-based)
 */
export interface ReputationNPCKnowledge {
  id: string;
  npcId: string;                   // The NPC
  characterId: string;             // The player they know about
  events: KnownEvent[];            // All events they know about
  overallOpinion: number;          // -100 to +100 computed from events
  lastUpdated: Date;

  // Opinion breakdown
  positiveEvents: number;          // Count of positive events
  negativeEvents: number;          // Count of negative events
  neutralEvents: number;           // Count of neutral events

  // Trust and relationship
  trustLevel: number;              // 0-100: How much NPC trusts player
  fearLevel: number;               // 0-100: How much NPC fears player
  respectLevel: number;            // 0-100: How much NPC respects player

  // First/last interaction
  firstKnowledgeDate?: Date;       // When first learned about player
  lastInteractionDate?: Date;      // Last time player interacted with NPC

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Spreading configuration for event types
 */
export interface EventSpreadConfig {
  eventType: ReputationEventType;
  defaultMagnitude: number;        // 1-100
  defaultSentiment: number;        // -100 to +100
  defaultSpreadRadius: number;     // NPC hops
  defaultDecayRate: number;        // 0.0-1.0
  expirationHours: number;         // Hours until forgotten
  factionMultiplier: {             // Faction-specific modifiers
    [faction: string]: number;     // Multiplier for spread speed
  };
}

/**
 * Result of spreading reputation through network
 */
export interface SpreadResult {
  eventId: string;
  npcsInformed: number;
  hopDistribution: {
    hop0: number;                  // Origin (witnessed)
    hop1: number;                  // Direct connections
    hop2: number;                  // Second degree
    hop3: number;                  // Third degree
  };
  averageMagnitude: number;
  spreadTime: number;              // Milliseconds to spread
}

/**
 * NPC opinion modifier based on knowledge
 */
export interface ReputationModifier {
  npcId: string;
  characterId: string;
  opinionScore: number;            // -100 to +100
  priceModifier: number;           // 0.5 to 2.0 (multiplier)
  dialogueAccessLevel: number;     // 0-10 (higher = more options)
  willHelp: boolean;               // Will help player with quests
  willHarm: boolean;               // Will actively oppose player
  willReport: boolean;             // Will report crimes to authorities
  willTrade: boolean;              // Will engage in trade
  qualityOfService: number;        // 0-100 (affects quest rewards, etc.)
}

/**
 * Reputation summary for a character in a location
 */
export interface LocationReputation {
  characterId: string;
  locationId: string;
  overallReputation: number;       // -100 to +100
  npcsWhoKnow: number;             // Count of NPCs with knowledge
  dominantSentiment: 'positive' | 'negative' | 'neutral';
  mostInfluentialEvent?: any;      // IReputationEvent from server
  recentEvents: any[];             // IReputationEvent[] from server
  factionStanding: {               // Reputation per faction
    [faction: string]: number;     // -100 to +100
  };
}

/**
 * API Response types
 */
export interface GetReputationResponse {
  characterId: string;
  overallReputation: number;
  locationReputations: LocationReputation[];
  recentEvents: ReputationEvent[];
  totalNPCsWithKnowledge: number;
}

export interface GetNPCKnowledgeResponse {
  npcKnowledge: ReputationNPCKnowledge;
  modifier: ReputationModifier;
  canInteract: boolean;
  interactionQuality: 'excellent' | 'good' | 'neutral' | 'poor' | 'hostile';
}

export interface CreateReputationEventRequest {
  characterId: string;
  eventType: ReputationEventType;
  magnitude: number;
  sentiment: number;
  locationId: string;
  originNpcId?: string;
  description?: string;
}

export interface CreateReputationEventResponse {
  event: ReputationEvent;
  spreadResult: SpreadResult;
  message: string;
}

/**
 * Event type configurations with defaults
 */
export const EVENT_SPREAD_CONFIGS: Record<ReputationEventType, Partial<EventSpreadConfig>> = {
  [ReputationEventType.CRIME_COMMITTED]: {
    defaultMagnitude: 70,
    defaultSentiment: -60,
    defaultSpreadRadius: 3,
    defaultDecayRate: 0.2,
    expirationHours: 168, // 1 week
  },
  [ReputationEventType.CRIME_WITNESSED]: {
    defaultMagnitude: 80,
    defaultSentiment: -70,
    defaultSpreadRadius: 4,
    defaultDecayRate: 0.15,
    expirationHours: 240, // 10 days
  },
  [ReputationEventType.QUEST_COMPLETED]: {
    defaultMagnitude: 50,
    defaultSentiment: 50,
    defaultSpreadRadius: 2,
    defaultDecayRate: 0.25,
    expirationHours: 120, // 5 days
  },
  [ReputationEventType.NPC_HELPED]: {
    defaultMagnitude: 60,
    defaultSentiment: 70,
    defaultSpreadRadius: 3,
    defaultDecayRate: 0.2,
    expirationHours: 144, // 6 days
  },
  [ReputationEventType.NPC_HARMED]: {
    defaultMagnitude: 85,
    defaultSentiment: -85,
    defaultSpreadRadius: 4,
    defaultDecayRate: 0.1,
    expirationHours: 336, // 2 weeks
  },
  [ReputationEventType.TRADE_COMPLETED]: {
    defaultMagnitude: 30,
    defaultSentiment: 40,
    defaultSpreadRadius: 1,
    defaultDecayRate: 0.3,
    expirationHours: 72, // 3 days
  },
  [ReputationEventType.BOUNTY_COLLECTED]: {
    defaultMagnitude: 75,
    defaultSentiment: 60,
    defaultSpreadRadius: 3,
    defaultDecayRate: 0.15,
    expirationHours: 168, // 1 week
  },
  [ReputationEventType.DUEL_WON]: {
    defaultMagnitude: 65,
    defaultSentiment: 50,
    defaultSpreadRadius: 3,
    defaultDecayRate: 0.2,
    expirationHours: 120, // 5 days
  },
  [ReputationEventType.DUEL_LOST]: {
    defaultMagnitude: 40,
    defaultSentiment: -30,
    defaultSpreadRadius: 2,
    defaultDecayRate: 0.25,
    expirationHours: 96, // 4 days
  },
  [ReputationEventType.GANG_JOINED]: {
    defaultMagnitude: 70,
    defaultSentiment: 0,
    defaultSpreadRadius: 4,
    defaultDecayRate: 0.1,
    expirationHours: 720, // 30 days
  },
  [ReputationEventType.ACHIEVEMENT_EARNED]: {
    defaultMagnitude: 55,
    defaultSentiment: 55,
    defaultSpreadRadius: 2,
    defaultDecayRate: 0.2,
    expirationHours: 168, // 1 week
  },
  [ReputationEventType.GIFT_GIVEN]: {
    defaultMagnitude: 45,
    defaultSentiment: 60,
    defaultSpreadRadius: 2,
    defaultDecayRate: 0.25,
    expirationHours: 96, // 4 days
  },
  [ReputationEventType.SERVICE_PURCHASED]: {
    defaultMagnitude: 25,
    defaultSentiment: 30,
    defaultSpreadRadius: 1,
    defaultDecayRate: 0.3,
    expirationHours: 48, // 2 days
  },
  [ReputationEventType.BRIBE_GIVEN]: {
    defaultMagnitude: 50,
    defaultSentiment: -40,
    defaultSpreadRadius: 2,
    defaultDecayRate: 0.3,
    expirationHours: 120, // 5 days
  },
  [ReputationEventType.THREAT_MADE]: {
    defaultMagnitude: 70,
    defaultSentiment: -75,
    defaultSpreadRadius: 3,
    defaultDecayRate: 0.15,
    expirationHours: 144, // 6 days
  },
};
