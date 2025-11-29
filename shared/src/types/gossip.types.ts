import { ObjectId } from 'mongodb';

/**
 * GOSSIP SYSTEM TYPES
 * Types for NPC news reactions, gossip spreading, and knowledge tracking
 */

// ============================================================================
// GOSSIP TOPICS & CONTENT
// ============================================================================

export type GossipTopic =
  | 'combat'
  | 'crime'
  | 'heroism'
  | 'romance'
  | 'business'
  | 'supernatural'
  | 'faction'
  | 'territory'
  | 'scandal'
  | 'death'
  | 'treasure'
  | 'law'
  | 'gang'
  | 'duel'
  | 'general';

export type GossipSource = 'witness' | 'newspaper' | 'gossip' | 'rumor';

export interface GossipVariation {
  versionNumber: number;
  content: string;
  truthfulness: number; // 0-100%
  addedDetails: string[]; // What was exaggerated/invented
  spreadBy: ObjectId; // NPC who created this version
  createdAt: Date;
}

export interface GossipItem {
  _id?: ObjectId;

  // Origin
  originalEventId?: ObjectId; // Optional - can be pure rumor
  originNPC?: ObjectId; // Who started it
  source: GossipSource;

  // Subject
  subjectType: 'player' | 'npc' | 'gang' | 'faction' | 'location' | 'general';
  subjectId?: ObjectId | string; // Optional for general gossip
  topic: GossipTopic;

  // Content
  headline: string; // Short summary
  content: string; // Current version
  baseContent: string; // Original truth
  currentVersion: number; // How many times distorted
  truthfulness: number; // 0-100%

  // Impact
  sentiment: 'positive' | 'negative' | 'neutral' | 'shocking';
  notorietyImpact: number; // How much this affects reputation

  // Spread tracking
  knownBy: ObjectId[]; // NPC IDs who know this
  spreadPattern: 'local' | 'regional' | 'territory' | 'global';
  currentReach: number; // How many NPCs know

  // Temporal
  originDate: Date;
  lastSpread: Date;
  expiresAt: Date;
  peakInterest: Date; // When it was most talked about

  // Variations
  variations: GossipVariation[];

  // Tags
  tags: string[]; // For searching/filtering

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// NPC KNOWLEDGE & MEMORY
// ============================================================================

export type KnowledgeType = 'article' | 'gossip' | 'witnessed' | 'rumor';

export interface KnowledgeItem {
  id: ObjectId;
  type: KnowledgeType;
  content: string;
  learnedAt: Date;
  believability: number; // How much NPC believes this
  importance: number; // How much NPC cares
  expiresAt: Date;
}

export interface NPCOpinion {
  characterId: ObjectId;

  // Feelings
  respect: number; // -100 to 100
  fear: number; // 0 to 100
  trust: number; // -100 to 100
  curiosity: number; // 0 to 100

  // Reasons
  basedOn: ObjectId[]; // GossipItem IDs that formed opinion
  personalExperience: boolean; // Met the player

  // Behavior
  willingToServe: boolean;
  priceModifier: number; // Percentage adjustment
  dialogueSet: 'friendly' | 'neutral' | 'hostile' | 'fearful' | 'admiring';

  lastUpdated: Date;
}

export interface NPCKnowledge {
  _id?: ObjectId;
  npcId: ObjectId;

  // What they know
  readArticles: ObjectId[]; // NewspaperArticle IDs
  heardGossip: ObjectId[]; // GossipItem IDs
  witnessedEvents: ObjectId[]; // Event IDs
  knownRumors: KnowledgeItem[];

  // About players/characters
  playerOpinions: Map<string, NPCOpinion>; // CharacterId -> Opinion

  // Gossip behavior
  gossipiness: number; // 0-100, how likely to spread gossip
  credibility: number; // 0-100, how much others believe them
  embellishmentFactor: number; // 0-100, how much they exaggerate

  // Memory
  memoryDuration: number; // Days before forgetting
  lastUpdated: Date;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// NPC REACTIONS
// ============================================================================

export type ReactionType =
  | 'fear'
  | 'respect'
  | 'hostility'
  | 'curiosity'
  | 'nervousness'
  | 'admiration'
  | 'disgust'
  | 'amusement'
  | 'indifference';

export interface NPCReaction {
  reactionType: ReactionType;
  intensity: number; // 0-100
  triggeredBy: ObjectId; // GossipItem or Event ID

  // Behavioral changes
  behaviorsTriggered: ReactionBehavior[];

  // Duration
  startedAt: Date;
  duration: number; // Minutes
  expiresAt: Date;
}

export interface ReactionBehavior {
  type: 'flee' | 'refuse_service' | 'call_law' | 'discount' | 'tip' | 'attack' | 'gather' | 'gossip' | 'question' | 'price_increase' | 'limit_service';

  params?: {
    priceModifier?: number;
    dialogueSet?: string;
    itemsRefused?: string[];
    tipContent?: string;
  };
}

export interface ReactionPattern {
  id: string;
  name: string;
  description: string;

  // Triggers
  triggers: ReactionTrigger[];

  // Response
  reactionType: ReactionType;
  intensityFormula: string; // e.g., "notoriety * 0.5"
  behaviors: ReactionBehavior[];

  // Conditions
  npcTypes: string[]; // Which NPC types can have this reaction
  minNotoriety?: number;
  maxNotoriety?: number;
  requiredFaction?: string;
  excludedFaction?: string;
}

export interface ReactionTrigger {
  triggerType: 'gossip_heard' | 'player_nearby' | 'event_witnessed' | 'article_read' | 'reputation_change';

  conditions: {
    topic?: GossipTopic[];
    sentiment?: ('positive' | 'negative' | 'neutral' | 'shocking')[];
    minTruthfulness?: number;
    minNotorietyImpact?: number;
    subjectType?: string;
  };
}

// ============================================================================
// GOSSIP SPREADING
// ============================================================================

export interface GossipSpreadConfig {
  baseSpreadChance: number; // 0-1, base chance NPC shares gossip
  proximityBonus: number; // Bonus for NPCs in same location
  relationshipBonus: number; // Bonus for friendly NPCs

  // Truth degradation
  baseDegradation: number; // How much truth lost per spread
  embellishmentChance: number; // Chance to add false details

  // Timing
  spreadInterval: number; // Hours between spread attempts
  maxAge: number; // Days before gossip expires

  // Reach
  localRadius: number; // Miles for local gossip
  regionalRadius: number; // Miles for regional gossip
}

export interface SpreadAttempt {
  gossipId: ObjectId;
  fromNPC: ObjectId;
  toNPC: ObjectId;

  success: boolean;
  newVersion: number; // If distorted
  distortions: string[]; // What changed

  timestamp: Date;
}

// ============================================================================
// DIALOGUE INTEGRATION
// ============================================================================

export interface NewsDialogue {
  id: string;

  // Context
  triggeredBy: GossipTopic[];
  requiredSentiment?: ('positive' | 'negative' | 'neutral' | 'shocking')[];
  minNotoriety?: number;

  // Dialogue
  greeting?: string; // Modified greeting
  comments: string[]; // Random comments about news
  questions: NewsQuestion[];

  // Conditions
  npcTypes: string[];
  playerReputationMin?: number;
  playerReputationMax?: number;
}

export interface NewsQuestion {
  question: string;
  topic: GossipTopic;

  // Player responses
  responses: {
    text: string;
    effect: 'confirm' | 'deny' | 'embellish' | 'deflect';
    reputationChange?: number;
    trustChange?: number;
  }[];
}

// ============================================================================
// WITNESS SYSTEM
// ============================================================================

export interface WitnessAccount {
  _id?: ObjectId;
  npcId: ObjectId;
  eventId: ObjectId;

  // What they saw
  eventType: string;
  eventDescription: string;
  participants: ObjectId[]; // Character IDs involved
  location: ObjectId;

  // Details
  accuracy: number; // 0-100, based on NPC perception
  details: string[];
  misidentifications: string[]; // What they got wrong

  // Sharing
  hasShared: boolean;
  sharedWith: ObjectId[]; // NPC IDs
  timesShared: number;

  // Temporal
  witnessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// REPUTATION TRACKING
// ============================================================================

export interface ReputationNewsItem {
  characterId: ObjectId;

  // News item
  headline: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';

  // Impact
  fameChange: number;
  infamyChange: number;
  affectedFactions: string[];

  // Spread
  publishedAt: Date;
  reach: 'local' | 'regional' | 'territory' | 'global';

  // Generated from
  sourceEvent?: ObjectId;
  sourceGossip?: ObjectId;
}

// ============================================================================
// GOSSIP TEMPLATES
// ============================================================================

export interface GossipTemplate {
  id: string;
  topic: GossipTopic;

  // Base template
  baseTemplate: string; // e.g., "{subject} {action} {object} at {location}"

  // Variations by version
  versionTemplates: {
    [version: number]: {
      template: string;
      embellishments: string[]; // Possible additions
      exaggerations: string[]; // Possible exaggerations
    };
  };

  // Truth degradation
  degradationRate: number; // How fast truth degrades
  maxVersions: number; // Before it becomes unrecognizable
}

// ============================================================================
// EXPORTS
// ============================================================================

export interface GossipSystemConfig {
  spreadConfig: GossipSpreadConfig;
  reactionPatterns: ReactionPattern[];
  dialogueTemplates: NewsDialogue[];
  gossipTemplates: GossipTemplate[];
}
