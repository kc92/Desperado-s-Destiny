/**
 * Relationship Types
 *
 * Types for NPC relationships, gossip system, and cross-references
 * Part of Phase 3, Wave 3.1 - NPC Cross-references System
 */

/**
 * Types of relationships between NPCs
 */
export enum RelationshipType {
  FAMILY = 'family',                       // Blood relations (siblings, parents, children)
  SPOUSE = 'spouse',                       // Married partners
  FRIEND = 'friend',                       // Friends and allies
  RIVAL = 'rival',                         // Competition, not hostile
  ENEMY = 'enemy',                         // Hostile, violent conflict
  EMPLOYER = 'employer',                   // Boss/employee relationship
  EMPLOYEE = 'employee',                   // Employee of another NPC
  MENTOR = 'mentor',                       // Teacher/guide relationship
  STUDENT = 'student',                     // Learning from another NPC
  LOVER = 'lover',                         // Romantic relationship (not married)
  FORMER_LOVER = 'former_lover',           // Past romantic relationship
  BUSINESS_PARTNER = 'business_partner',   // Equal business relationship
  CRIMINAL_ASSOCIATE = 'criminal_associate', // Partners in crime
  DEBTOR = 'debtor',                       // Owes money/favor
  CREDITOR = 'creditor',                   // Owed money/favor
  PROTECTOR = 'protector',                 // Protects another NPC
  PROTECTED_BY = 'protected_by',           // Protected by another NPC
  INFORMANT = 'informant',                 // Provides information to
  BLACKMAILER = 'blackmailer',             // Blackmails another NPC
  VICTIM = 'victim',                       // Victim of another NPC
}

/**
 * Family relation subtypes for more specific relationships
 */
export enum FamilyRelation {
  PARENT = 'parent',
  CHILD = 'child',
  SIBLING = 'sibling',
  SPOUSE = 'spouse',
  GRANDPARENT = 'grandparent',
  GRANDCHILD = 'grandchild',
  UNCLE_AUNT = 'uncle_aunt',
  NEPHEW_NIECE = 'nephew_niece',
  COUSIN = 'cousin',
  STEPPARENT = 'stepparent',
  STEPCHILD = 'stepchild',
  HALF_SIBLING = 'half_sibling',
  IN_LAW = 'in_law',
}

/**
 * NPC-to-NPC relationship
 */
export interface NPCRelationship {
  id: string;
  npcId: string;                           // Primary NPC
  relatedNpcId: string;                    // Related NPC
  relationshipType: RelationshipType;
  familyRelation?: FamilyRelation;         // If FAMILY type, specify which
  strength: number;                        // 1-10 (how close/intense)
  sentiment: number;                       // -10 to 10 (negative to positive)

  // Story and history
  history?: string;                        // Brief backstory of relationship
  sharedSecrets?: string[];                // Things they both know about
  ongoingConflict?: string;                // Current tension/issue

  // Gossip control
  canGossipAbout: boolean;                 // Will this NPC talk about the other?
  gossipTrustRequired?: number;            // Trust level needed to hear gossip (0-100)

  // Visibility
  isPublic: boolean;                       // Is this relationship known?
  isSecret: boolean;                       // Should be hidden unless discovered
  revealCondition?: {                      // How to discover secret relationship
    npcTrustLevel?: number;
    questComplete?: string;
    itemRequired?: string;
    eventTriggered?: string;
  };

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Gossip truthfulness levels
 */
export enum GossipTruthfulness {
  COMPLETE_LIE = 0,      // 0% true
  MOSTLY_FALSE = 25,     // 25% true
  HALF_TRUTH = 50,       // 50% true
  MOSTLY_TRUE = 75,      // 75% true
  COMPLETELY_TRUE = 100, // 100% true
}

/**
 * Gossip categories for filtering
 */
export enum GossipCategory {
  PERSONAL = 'personal',           // Personal affairs, relationships
  BUSINESS = 'business',           // Business dealings, money
  CRIMINAL = 'criminal',           // Crimes, illegal activity
  POLITICAL = 'political',         // Faction politics, power
  SUPERNATURAL = 'supernatural',   // Spirits, curses, magic
  ROMANCE = 'romance',             // Love affairs, marriages
  CONFLICT = 'conflict',           // Feuds, fights, rivalries
  RUMOR = 'rumor',                 // Unverified information
  NEWS = 'news',                   // Recent events, facts
  SECRET = 'secret',               // Hidden information
}

/**
 * Relationship gossip item - a piece of information NPCs can share
 */
export interface RelationshipGossipItem {
  id: string;
  subject: string;                  // NPC being talked about
  category: GossipCategory;
  content: string;                  // The gossip text template
  contentGenerated?: string;        // Filled template with actual values

  // Truthfulness and verification
  truthfulness: GossipTruthfulness; // How accurate this gossip is
  verifiable: boolean;              // Can players verify this?
  verificationMethod?: string;      // How to verify (quest, witness, etc.)

  // Spreading mechanics
  spreadFactor: number;             // 1-10: How fast it spreads
  originNpc: string;                // Who started this gossip
  knownBy: string[];                // NPC IDs who know this gossip
  spreadTo?: string[];              // NPC IDs it can spread to

  // Conditions and expiry
  startDate: Date;                  // When gossip started
  expiresAt?: Date;                 // When gossip becomes old news
  isStale: boolean;                 // Old news, less interesting

  // Event triggers
  eventTriggered?: string;          // What event caused this gossip
  eventData?: any;                  // Additional event context

  // Player interaction
  playerInvolved?: boolean;         // Does this gossip mention the player?
  playerReputationEffect?: number;  // How this affects player reputation

  // Requirements to hear
  trustRequired?: number;           // Trust level needed (0-100)
  factionRequired?: string;         // Must be member of faction
  locationRequired?: string;        // Only heard at specific location

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * NPC opinion about another NPC
 */
export interface RelationshipNPCOpinion {
  npcId: string;                    // Who has this opinion
  subjectNpcId: string;             // About whom
  sentiment: number;                // -10 to 10 (hate to love)
  respect: number;                  // 0-10 (no respect to high respect)
  trust: number;                    // 0-10 (distrust to complete trust)
  fear: number;                     // 0-10 (fearless to terrified)

  // Opinion text
  shortOpinion: string;             // One-liner opinion
  detailedOpinion?: string;         // Longer explanation (higher trust)
  privateOpinion?: string;          // What they really think (confidant)

  // Conditions
  trustRequired?: number;           // Trust to hear detailed opinion

  // Changes over time
  canChange: boolean;               // Can this opinion shift?
  changeEvents?: string[];          // Events that could change opinion
}

/**
 * Cross-reference in dialogue
 * Used to dynamically insert references to other NPCs
 */
export interface DialogueCrossReference {
  id: string;
  npcId: string;                    // NPC who says this
  referencedNpcId: string;          // NPC being mentioned
  referenceType: 'mention' | 'gossip' | 'opinion' | 'warning' | 'recommendation';
  dialogueTemplate: string;         // Template with {placeholders}
  trustRequired?: number;           // Trust level needed to trigger

  // Conditions
  condition?: {
    relationshipExists?: boolean;   // Only if relationship exists
    relationshipType?: RelationshipType;
    playerMetReferenced?: boolean;  // Player must have met referenced NPC
    timeOfDay?: number[];           // Only at certain hours
    location?: string;              // Only at certain location
  };

  // Priority
  priority: number;                 // 1-10, higher = more likely to appear
  frequency: number;                // How often this appears (1-10)
}

/**
 * Gossip template for generating gossip
 */
export interface RelationshipGossipTemplate {
  id: string;
  category: GossipCategory;
  templates: string[];              // Array of template strings
  variables: string[];              // Variables needed: {subject}, {action}, etc.
  eventTypes?: string[];            // Event types that trigger this template
  relationshipTypes?: RelationshipType[]; // Relationship types this applies to
}

/**
 * Network of relationships (graph structure)
 */
export interface RelationshipNetwork {
  npcs: string[];                   // All NPC IDs in network
  relationships: NPCRelationship[];
  clusters: RelationshipCluster[];  // Groups of connected NPCs
}

/**
 * Cluster of related NPCs (family, gang, etc.)
 */
export interface RelationshipCluster {
  id: string;
  name: string;                     // "Martinez Family", "Red Gulch Gang", etc.
  type: 'family' | 'business' | 'criminal' | 'social' | 'political';
  npcIds: string[];
  centralNpcId?: string;            // Leader/patriarch/central figure
  description?: string;
  isSecret?: boolean;
}

/**
 * Gossip spread event
 * Tracks how gossip propagates through the network
 */
export interface GossipSpreadEvent {
  gossipId: string;
  fromNpcId: string;
  toNpcId: string;
  timestamp: Date;
  playerWitnessed?: boolean;        // Did player see this exchange?
  spreadChance: number;             // Probability this spread (0-1)
}

/**
 * API Response types
 */
export interface GetGossipResponse {
  gossip: RelationshipGossipItem[];
  newGossipCount: number;
}

export interface GetRelationshipsResponse {
  relationships: NPCRelationship[];
  clusters: RelationshipCluster[];
}

export interface GetNPCOpinionResponse {
  opinion: RelationshipNPCOpinion;
  canShare: boolean;
  trustRequired: number;
}

export interface SpreadGossipResponse {
  gossipId: string;
  spreadToNpcs: string[];
  newlyInformed: number;
}
