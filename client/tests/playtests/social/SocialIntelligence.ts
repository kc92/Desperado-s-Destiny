/**
 * SocialIntelligence.ts
 *
 * Advanced social intelligence system for bot players that enables realistic
 * relationship formation, friend request decision-making, gang interactions,
 * and evolving social networks.
 *
 * Features:
 * - Relationship tracking with progressive stages
 * - Affinity calculation based on multiple factors
 * - Friend request decision logic
 * - Gang compatibility assessment
 * - Interaction frequency management
 * - Relationship decay over time
 * - Context-aware social action selection
 * - Memory of past interactions
 * - Personality-driven social behavior
 */

import { PersonalityTraits, PersonalityProfile } from '../intelligence/PersonalitySystem';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Relationship stages from stranger to close friend
 */
export enum RelationshipStage {
  STRANGER = 'stranger',
  ACQUAINTANCE = 'acquaintance',
  FRIEND = 'friend',
  CLOSE_FRIEND = 'close_friend',
  BLOCKED = 'blocked'
}

/**
 * Types of social interactions
 */
export enum InteractionType {
  GREETING = 'greeting',
  CHAT = 'chat',
  MAIL = 'mail',
  TRADE = 'trade',
  QUEST_TOGETHER = 'quest_together',
  COMBAT_TOGETHER = 'combat_together',
  GANG_ACTIVITY = 'gang_activity',
  GIFT = 'gift',
  HELP = 'help',
  CONFLICT = 'conflict'
}

/**
 * Represents a relationship between two characters
 */
export interface Relationship {
  /** Target character ID */
  characterId: string;

  /** Target character name */
  characterName: string;

  /** Target character faction */
  faction?: string;

  /** Current relationship stage */
  stage: RelationshipStage;

  /** Affinity score (-100 to 100) */
  affinity: number;

  /** When relationship was first established */
  firstMetAt: Date;

  /** Last interaction time */
  lastInteractionAt: Date;

  /** Total number of interactions */
  interactionCount: number;

  /** History of recent interactions */
  recentInteractions: SocialInteraction[];

  /** Whether friend request is pending */
  friendRequestPending: boolean;

  /** Whether they are in the same gang */
  sameGang: boolean;

  /** Shared interests/activities */
  sharedInterests: string[];

  /** Trust level (0-1) */
  trust: number;

  /** Compatibility score (0-1) based on personality */
  compatibility: number;

  /** Notes about this relationship */
  notes: string[];
}

/**
 * Record of a single social interaction
 */
export interface SocialInteraction {
  /** When interaction occurred */
  timestamp: Date;

  /** Type of interaction */
  type: InteractionType;

  /** Affinity change from this interaction */
  affinityDelta: number;

  /** Whether interaction was positive */
  positive: boolean;

  /** Optional context/notes */
  context?: string;
}

/**
 * Gang affiliation information
 */
export interface GangInfo {
  gangId: string;
  gangName: string;
  gangTag: string;
  memberCount: number;
  level: number;
  faction?: string;
  reputation: number; // 0-1
}

/**
 * Character social profile for decision-making
 */
export interface CharacterSocialProfile {
  characterId: string;
  characterName: string;
  faction: string;
  level: number;
  gangId?: string;
  gangName?: string;
  personality?: string; // archetype
  isOnline?: boolean;
  reputationScore?: number;
  mutualFriends?: number;
}

/**
 * Social action options available in current context
 */
export interface SocialActionContext {
  /** Available characters to interact with */
  nearbyCharacters: CharacterSocialProfile[];

  /** Current character state */
  currentCharacter: {
    characterId: string;
    faction: string;
    level: number;
    gangId?: string;
    energy: number;
    gold: number;
  };

  /** Available gangs to join */
  availableGangs?: GangInfo[];

  /** Current location */
  location?: string;

  /** Time since last social interaction */
  timeSinceLastSocial?: number;
}

// ============================================================================
// SOCIAL INTELLIGENCE ENGINE
// ============================================================================

/**
 * Main social intelligence system for bots
 */
export class SocialIntelligence {
  private relationships: Map<string, Relationship> = new Map();
  private personality: PersonalityProfile;
  private characterId: string;
  private faction: string;
  private gangId?: string;

  // Configuration
  private readonly AFFINITY_THRESHOLDS = {
    ACQUAINTANCE: 20,
    FRIEND: 50,
    CLOSE_FRIEND: 80
  };

  private readonly DECAY_RATE_PER_DAY = 2; // Affinity decay per day without interaction
  private readonly MIN_AFFINITY_FOR_FRIEND_REQUEST = 30;
  private readonly MAX_RELATIONSHIPS_TO_TRACK = 100;

  constructor(
    characterId: string,
    faction: string,
    personality: PersonalityProfile,
    gangId?: string
  ) {
    this.characterId = characterId;
    this.faction = faction;
    this.personality = personality;
    this.gangId = gangId;
  }

  // ============================================================================
  // RELATIONSHIP MANAGEMENT
  // ============================================================================

  /**
   * Get or create relationship with a character
   */
  getRelationship(characterId: string, characterName: string, faction?: string): Relationship {
    if (!this.relationships.has(characterId)) {
      this.relationships.set(characterId, {
        characterId,
        characterName,
        faction,
        stage: RelationshipStage.STRANGER,
        affinity: 0,
        firstMetAt: new Date(),
        lastInteractionAt: new Date(),
        interactionCount: 0,
        recentInteractions: [],
        friendRequestPending: false,
        sameGang: false,
        sharedInterests: [],
        trust: 0,
        compatibility: 0,
        notes: []
      });
    }

    return this.relationships.get(characterId)!;
  }

  /**
   * Record a social interaction
   */
  recordInteraction(
    characterId: string,
    characterName: string,
    type: InteractionType,
    positive: boolean = true,
    context?: string
  ): void {
    const relationship = this.getRelationship(characterId, characterName);

    // Calculate affinity delta based on interaction type and personality
    const affinityDelta = this.calculateAffinityDelta(type, positive, relationship);

    // Create interaction record
    const interaction: SocialInteraction = {
      timestamp: new Date(),
      type,
      affinityDelta,
      positive,
      context
    };

    // Update relationship
    relationship.affinity = Math.max(-100, Math.min(100, relationship.affinity + affinityDelta));
    relationship.lastInteractionAt = new Date();
    relationship.interactionCount++;
    relationship.recentInteractions.push(interaction);

    // Keep only last 20 interactions
    if (relationship.recentInteractions.length > 20) {
      relationship.recentInteractions.shift();
    }

    // Update relationship stage
    this.updateRelationshipStage(relationship);

    // Update trust based on positive interactions
    if (positive) {
      relationship.trust = Math.min(1, relationship.trust + 0.02);
    } else {
      relationship.trust = Math.max(0, relationship.trust - 0.05);
    }
  }

  /**
   * Calculate affinity change from an interaction
   */
  private calculateAffinityDelta(
    type: InteractionType,
    positive: boolean,
    relationship: Relationship
  ): number {
    let baseDelta = 0;

    // Base affinity changes by interaction type
    switch (type) {
      case InteractionType.GREETING:
        baseDelta = 2;
        break;
      case InteractionType.CHAT:
        baseDelta = 3;
        break;
      case InteractionType.MAIL:
        baseDelta = 5;
        break;
      case InteractionType.TRADE:
        baseDelta = 4;
        break;
      case InteractionType.QUEST_TOGETHER:
        baseDelta = 8;
        break;
      case InteractionType.COMBAT_TOGETHER:
        baseDelta = 10;
        break;
      case InteractionType.GANG_ACTIVITY:
        baseDelta = 7;
        break;
      case InteractionType.GIFT:
        baseDelta = 12;
        break;
      case InteractionType.HELP:
        baseDelta = 6;
        break;
      case InteractionType.CONFLICT:
        baseDelta = -15;
        break;
    }

    // Negative interactions reduce affinity
    if (!positive) {
      baseDelta = -Math.abs(baseDelta);
    }

    // Personality modifiers
    // Social personalities gain more from interactions
    baseDelta *= (0.7 + this.personality.traits.sociability * 0.6);

    // Diminishing returns for repeated interactions
    if (relationship.interactionCount > 10) {
      baseDelta *= 0.8;
    }
    if (relationship.interactionCount > 50) {
      baseDelta *= 0.6;
    }

    return Math.round(baseDelta);
  }

  /**
   * Update relationship stage based on affinity
   */
  private updateRelationshipStage(relationship: Relationship): void {
    const oldStage = relationship.stage;

    if (relationship.affinity >= this.AFFINITY_THRESHOLDS.CLOSE_FRIEND) {
      relationship.stage = RelationshipStage.CLOSE_FRIEND;
    } else if (relationship.affinity >= this.AFFINITY_THRESHOLDS.FRIEND) {
      relationship.stage = RelationshipStage.FRIEND;
    } else if (relationship.affinity >= this.AFFINITY_THRESHOLDS.ACQUAINTANCE) {
      relationship.stage = RelationshipStage.ACQUAINTANCE;
    } else if (relationship.affinity < -50) {
      relationship.stage = RelationshipStage.BLOCKED;
    } else {
      relationship.stage = RelationshipStage.STRANGER;
    }

    // Log stage changes
    if (oldStage !== relationship.stage) {
      relationship.notes.push(
        `Stage changed from ${oldStage} to ${relationship.stage} at ${new Date().toISOString()}`
      );
    }
  }

  /**
   * Decay affinity over time for inactive relationships
   */
  decayRelationships(): void {
    const now = new Date();

    for (const relationship of this.relationships.values()) {
      const daysSinceInteraction =
        (now.getTime() - relationship.lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceInteraction > 1) {
        // Decay affinity
        const decayAmount = Math.floor(daysSinceInteraction * this.DECAY_RATE_PER_DAY);
        relationship.affinity = Math.max(-100, relationship.affinity - decayAmount);

        // Update stage
        this.updateRelationshipStage(relationship);

        // Decay trust slightly
        relationship.trust = Math.max(0, relationship.trust - 0.01 * daysSinceInteraction);
      }
    }

    // Prune old stranger relationships if we have too many
    if (this.relationships.size > this.MAX_RELATIONSHIPS_TO_TRACK) {
      this.pruneOldRelationships();
    }
  }

  /**
   * Remove old, low-value relationships
   */
  private pruneOldRelationships(): void {
    const relationships = Array.from(this.relationships.values());

    // Keep only meaningful relationships
    const toKeep = relationships
      .filter(r =>
        r.stage !== RelationshipStage.STRANGER ||
        r.interactionCount > 5 ||
        r.friendRequestPending
      )
      .sort((a, b) => b.affinity - a.affinity)
      .slice(0, this.MAX_RELATIONSHIPS_TO_TRACK);

    // Rebuild map
    this.relationships.clear();
    toKeep.forEach(r => this.relationships.set(r.characterId, r));
  }

  // ============================================================================
  // AFFINITY CALCULATION
  // ============================================================================

  /**
   * Calculate initial affinity with a character based on compatibility
   */
  calculateInitialAffinity(profile: CharacterSocialProfile): number {
    let affinity = 0;

    // Same faction bonus
    if (profile.faction === this.faction) {
      affinity += 20;
    } else {
      affinity -= 10; // Different faction penalty
    }

    // Same gang bonus
    if (this.gangId && profile.gangId === this.gangId) {
      affinity += 30;
    }

    // Level proximity (prefer similar levels)
    const relationship = this.getRelationship(profile.characterId, profile.characterName, profile.faction);
    const levelDiff = Math.abs(profile.level - relationship.interactionCount); // Using interactionCount as proxy
    if (levelDiff <= 5) {
      affinity += 10;
    } else if (levelDiff > 20) {
      affinity -= 5;
    }

    // Mutual friends bonus
    if (profile.mutualFriends && profile.mutualFriends > 0) {
      affinity += Math.min(15, profile.mutualFriends * 3);
    }

    // Personality compatibility
    const compatibility = this.calculatePersonalityCompatibility(profile.personality);
    relationship.compatibility = compatibility;
    affinity += Math.round(compatibility * 20);

    // Random variance (±5)
    affinity += Math.floor(Math.random() * 11) - 5;

    return Math.max(-20, Math.min(40, affinity));
  }

  /**
   * Calculate personality compatibility (0-1)
   */
  private calculatePersonalityCompatibility(targetArchetype?: string): number {
    if (!targetArchetype) return 0.5; // Neutral if unknown

    const myTraits = this.personality.traits;

    // Define compatibility rules
    const compatibilityMatrix: Record<string, Record<string, number>> = {
      social: {
        social: 0.9,
        roleplayer: 0.8,
        explorer: 0.7,
        grinder: 0.3,
        economist: 0.4,
        combat: 0.5,
        criminal: 0.4,
        chaos: 0.6
      },
      roleplayer: {
        social: 0.8,
        roleplayer: 0.9,
        explorer: 0.7,
        grinder: 0.3,
        economist: 0.4,
        combat: 0.5,
        criminal: 0.3,
        chaos: 0.4
      },
      explorer: {
        social: 0.7,
        roleplayer: 0.7,
        explorer: 0.8,
        grinder: 0.4,
        economist: 0.5,
        combat: 0.6,
        criminal: 0.6,
        chaos: 0.9
      },
      combat: {
        social: 0.5,
        roleplayer: 0.5,
        explorer: 0.6,
        grinder: 0.6,
        economist: 0.4,
        combat: 0.9,
        criminal: 0.7,
        chaos: 0.7
      },
      economist: {
        social: 0.4,
        roleplayer: 0.4,
        explorer: 0.5,
        grinder: 0.8,
        economist: 0.9,
        combat: 0.4,
        criminal: 0.5,
        chaos: 0.3
      },
      grinder: {
        social: 0.3,
        roleplayer: 0.3,
        explorer: 0.4,
        grinder: 0.9,
        economist: 0.8,
        combat: 0.6,
        criminal: 0.5,
        chaos: 0.2
      },
      criminal: {
        social: 0.4,
        roleplayer: 0.3,
        explorer: 0.6,
        grinder: 0.5,
        economist: 0.5,
        combat: 0.7,
        criminal: 0.8,
        chaos: 0.8
      },
      chaos: {
        social: 0.6,
        roleplayer: 0.4,
        explorer: 0.9,
        grinder: 0.2,
        economist: 0.3,
        combat: 0.7,
        criminal: 0.8,
        chaos: 0.7
      }
    };

    const myArchetype = this.personality.archetype;
    const baseCompatibility = compatibilityMatrix[myArchetype]?.[targetArchetype] || 0.5;

    // Add some random variance (±0.1)
    const variance = (Math.random() - 0.5) * 0.2;
    return Math.max(0, Math.min(1, baseCompatibility + variance));
  }

  // ============================================================================
  // FRIEND REQUEST LOGIC
  // ============================================================================

  /**
   * Decide whether to send a friend request to a character
   */
  shouldSendFriendRequest(profile: CharacterSocialProfile): boolean {
    const relationship = this.getRelationship(profile.characterId, profile.characterName, profile.faction);

    // Already friends or blocked
    if (relationship.stage === RelationshipStage.FRIEND ||
        relationship.stage === RelationshipStage.CLOSE_FRIEND ||
        relationship.stage === RelationshipStage.BLOCKED) {
      return false;
    }

    // Already sent request
    if (relationship.friendRequestPending) {
      return false;
    }

    // Need minimum affinity
    if (relationship.affinity < this.MIN_AFFINITY_FOR_FRIEND_REQUEST) {
      return false;
    }

    // Need minimum interactions (not too eager)
    if (relationship.interactionCount < 3) {
      return false;
    }

    // Personality-based probability
    const baseProbability = this.personality.traits.sociability;

    // Boost probability if high compatibility
    const compatibilityBoost = relationship.compatibility * 0.3;

    // Boost if same gang
    const gangBoost = relationship.sameGang ? 0.2 : 0;

    // Calculate final probability
    const probability = baseProbability + compatibilityBoost + gangBoost;

    // Random decision
    return Math.random() < probability;
  }

  /**
   * Decide whether to accept a friend request
   */
  shouldAcceptFriendRequest(profile: CharacterSocialProfile): boolean {
    const relationship = this.getRelationship(profile.characterId, profile.characterName, profile.faction);

    // Blocked or negative affinity
    if (relationship.stage === RelationshipStage.BLOCKED || relationship.affinity < 0) {
      return false;
    }

    // Calculate acceptance probability
    let acceptProbability = 0.3; // Base 30% chance

    // Affinity boosts acceptance
    if (relationship.affinity >= 40) {
      acceptProbability = 0.9;
    } else if (relationship.affinity >= 20) {
      acceptProbability = 0.7;
    } else if (relationship.affinity >= 10) {
      acceptProbability = 0.5;
    }

    // Sociability increases acceptance
    acceptProbability *= (0.7 + this.personality.traits.sociability * 0.6);

    // Same faction/gang increases acceptance
    if (profile.faction === this.faction) {
      acceptProbability *= 1.2;
    }
    if (profile.gangId === this.gangId) {
      acceptProbability *= 1.3;
    }

    // Compatibility increases acceptance
    acceptProbability *= (0.8 + relationship.compatibility * 0.4);

    return Math.random() < Math.min(0.95, acceptProbability);
  }

  // ============================================================================
  // GANG DECISION LOGIC
  // ============================================================================

  /**
   * Decide whether to join a gang
   */
  shouldJoinGang(gang: GangInfo): boolean {
    // Already in a gang
    if (this.gangId) {
      return false;
    }

    // Calculate join probability based on multiple factors
    let joinProbability = 0;

    // Base probability from loyalty and sociability traits
    joinProbability += this.personality.traits.loyalty * 0.4;
    joinProbability += this.personality.traits.sociability * 0.3;

    // Gang reputation matters
    joinProbability += gang.reputation * 0.2;

    // Faction alignment
    if (gang.faction === this.faction) {
      joinProbability += 0.3;
    } else {
      joinProbability -= 0.2;
    }

    // Gang size (prefer active gangs, but not too large)
    if (gang.memberCount >= 5 && gang.memberCount <= 20) {
      joinProbability += 0.15;
    } else if (gang.memberCount > 30) {
      joinProbability -= 0.1; // Too impersonal
    }

    // Gang level
    if (gang.level >= 3) {
      joinProbability += 0.1;
    }

    // Personality archetypes
    switch (this.personality.archetype) {
      case 'social':
        joinProbability += 0.3; // Very likely to join
        break;
      case 'combat':
        joinProbability += 0.2; // Likes gangs for PvP
        break;
      case 'explorer':
        joinProbability -= 0.1; // Independent
        break;
      case 'grinder':
        joinProbability -= 0.05; // Sees as time waste
        break;
      case 'criminal':
        joinProbability += 0.15; // Likes organized crime
        break;
    }

    // Random variance
    joinProbability += (Math.random() - 0.5) * 0.2;

    return Math.random() < Math.max(0, Math.min(1, joinProbability));
  }

  /**
   * Decide whether to leave current gang
   */
  shouldLeaveGang(gangSatisfaction: number): boolean {
    // gangSatisfaction is 0-1, where 1 = very satisfied
    if (!this.gangId) return false;

    // Low loyalty players leave easier
    const loyaltyFactor = this.personality.traits.loyalty;

    // Calculate leave probability (inverse of satisfaction)
    const leaveProbability = (1 - gangSatisfaction) * (1 - loyaltyFactor);

    return Math.random() < leaveProbability;
  }

  // ============================================================================
  // INTERACTION FREQUENCY
  // ============================================================================

  /**
   * Get interaction frequency multiplier for a relationship
   * Returns how often to interact (1.0 = normal, 2.0 = twice as often)
   */
  getInteractionFrequency(characterId: string): number {
    const relationship = this.relationships.get(characterId);
    if (!relationship) return 0.1; // Rare for strangers

    let frequency = 0.5; // Base frequency

    // Relationship stage affects frequency
    switch (relationship.stage) {
      case RelationshipStage.STRANGER:
        frequency = 0.2;
        break;
      case RelationshipStage.ACQUAINTANCE:
        frequency = 0.5;
        break;
      case RelationshipStage.FRIEND:
        frequency = 1.5;
        break;
      case RelationshipStage.CLOSE_FRIEND:
        frequency = 3.0;
        break;
      case RelationshipStage.BLOCKED:
        frequency = 0;
        break;
    }

    // Sociability affects frequency
    frequency *= (0.5 + this.personality.traits.sociability);

    // Same gang increases frequency
    if (relationship.sameGang) {
      frequency *= 1.5;
    }

    // Recent interactions reduce frequency (avoid spam)
    const recentCount = relationship.recentInteractions.filter(i => {
      const hoursSince = (Date.now() - i.timestamp.getTime()) / (1000 * 60 * 60);
      return hoursSince < 1;
    }).length;

    if (recentCount > 3) {
      frequency *= 0.3; // Significantly reduce if just interacted
    } else if (recentCount > 1) {
      frequency *= 0.6;
    }

    return frequency;
  }

  /**
   * Get recommended time until next interaction (in minutes)
   */
  getNextInteractionDelay(characterId: string): number {
    const frequency = this.getInteractionFrequency(characterId);

    if (frequency === 0) return Infinity;

    // Base delay is 60 minutes
    const baseDelay = 60;

    // Calculate actual delay inversely proportional to frequency
    const delay = baseDelay / frequency;

    // Add random variance (±30%)
    const variance = delay * 0.3;
    return delay + (Math.random() - 0.5) * 2 * variance;
  }

  // ============================================================================
  // SOCIAL ACTION SELECTION
  // ============================================================================

  /**
   * Select best social action based on context
   */
  selectSocialAction(context: SocialActionContext): SocialAction | null {
    const actions: ScoredAction[] = [];

    // Evaluate each nearby character as potential interaction
    for (const character of context.nearbyCharacters) {
      const relationship = this.getRelationship(
        character.characterId,
        character.characterName,
        character.faction
      );

      // Skip blocked
      if (relationship.stage === RelationshipStage.BLOCKED) {
        continue;
      }

      // Check interaction frequency
      const frequency = this.getInteractionFrequency(character.characterId);
      if (frequency === 0) continue;

      // Score different interaction types
      actions.push(...this.scoreInteractionOptions(character, relationship, context));
    }

    // Evaluate gang actions
    if (context.availableGangs && !this.gangId) {
      for (const gang of context.availableGangs) {
        if (this.shouldJoinGang(gang)) {
          actions.push({
            action: {
              type: 'join_gang',
              targetId: gang.gangId,
              targetName: gang.gangName,
              priority: 'high'
            },
            score: 80 + gang.reputation * 20
          });
        }
      }
    }

    // Sort by score
    actions.sort((a, b) => b.score - a.score);

    // Return highest scored action
    return actions.length > 0 ? actions[0].action : null;
  }

  /**
   * Score different interaction options with a character
   */
  private scoreInteractionOptions(
    character: CharacterSocialProfile,
    relationship: Relationship,
    context: SocialActionContext
  ): ScoredAction[] {
    const actions: ScoredAction[] = [];

    // Send friend request
    if (this.shouldSendFriendRequest(character)) {
      actions.push({
        action: {
          type: 'send_friend_request',
          targetId: character.characterId,
          targetName: character.characterName,
          priority: 'medium'
        },
        score: 60 + relationship.affinity
      });
    }

    // Send chat message
    const chatScore = this.personality.traits.sociability * 50 +
                      relationship.affinity * 0.5 +
                      (relationship.sameGang ? 20 : 0);
    actions.push({
      action: {
        type: 'send_chat',
        targetId: character.characterId,
        targetName: character.characterName,
        priority: 'low'
      },
      score: chatScore
    });

    // Send mail (for closer relationships)
    if (relationship.stage === RelationshipStage.FRIEND ||
        relationship.stage === RelationshipStage.CLOSE_FRIEND) {
      actions.push({
        action: {
          type: 'send_mail',
          targetId: character.characterId,
          targetName: character.characterName,
          priority: 'medium'
        },
        score: 50 + relationship.affinity * 0.8
      });
    }

    // Invite to quest
    if (relationship.stage === RelationshipStage.FRIEND ||
        relationship.stage === RelationshipStage.CLOSE_FRIEND) {
      actions.push({
        action: {
          type: 'invite_quest',
          targetId: character.characterId,
          targetName: character.characterName,
          priority: 'high'
        },
        score: 70 + relationship.affinity
      });
    }

    return actions;
  }

  // ============================================================================
  // STATISTICS AND REPORTING
  // ============================================================================

  /**
   * Get social statistics
   */
  getSocialStats(): SocialStats {
    const relationships = Array.from(this.relationships.values());

    return {
      totalRelationships: relationships.length,
      strangers: relationships.filter(r => r.stage === RelationshipStage.STRANGER).length,
      acquaintances: relationships.filter(r => r.stage === RelationshipStage.ACQUAINTANCE).length,
      friends: relationships.filter(r => r.stage === RelationshipStage.FRIEND).length,
      closeFriends: relationships.filter(r => r.stage === RelationshipStage.CLOSE_FRIEND).length,
      blocked: relationships.filter(r => r.stage === RelationshipStage.BLOCKED).length,
      averageAffinity: relationships.reduce((sum, r) => sum + r.affinity, 0) / Math.max(1, relationships.length),
      totalInteractions: relationships.reduce((sum, r) => sum + r.interactionCount, 0),
      mostInteracted: this.getMostInteractedCharacters(5),
      strongestBonds: this.getStrongestBonds(5)
    };
  }

  /**
   * Get characters with most interactions
   */
  private getMostInteractedCharacters(limit: number): Array<{name: string, count: number}> {
    return Array.from(this.relationships.values())
      .sort((a, b) => b.interactionCount - a.interactionCount)
      .slice(0, limit)
      .map(r => ({
        name: r.characterName,
        count: r.interactionCount
      }));
  }

  /**
   * Get strongest relationship bonds
   */
  private getStrongestBonds(limit: number): Array<{name: string, affinity: number, stage: string}> {
    return Array.from(this.relationships.values())
      .sort((a, b) => b.affinity - a.affinity)
      .slice(0, limit)
      .map(r => ({
        name: r.characterName,
        affinity: r.affinity,
        stage: r.stage
      }));
  }

  /**
   * Get social network report
   */
  getSocialNetworkReport(): string {
    const stats = this.getSocialStats();

    let report = `=== SOCIAL NETWORK REPORT ===\n\n`;
    report += `PERSONALITY: ${this.personality.name} (${this.personality.archetype})\n`;
    report += `FACTION: ${this.faction}\n`;
    report += `GANG: ${this.gangId || 'None'}\n\n`;

    report += `RELATIONSHIPS:\n`;
    report += `- Total: ${stats.totalRelationships}\n`;
    report += `- Strangers: ${stats.strangers}\n`;
    report += `- Acquaintances: ${stats.acquaintances}\n`;
    report += `- Friends: ${stats.friends}\n`;
    report += `- Close Friends: ${stats.closeFriends}\n`;
    report += `- Blocked: ${stats.blocked}\n\n`;

    report += `METRICS:\n`;
    report += `- Average Affinity: ${stats.averageAffinity.toFixed(1)}\n`;
    report += `- Total Interactions: ${stats.totalInteractions}\n\n`;

    report += `MOST INTERACTED:\n`;
    stats.mostInteracted.forEach((char, i) => {
      report += `${i + 1}. ${char.name} (${char.count} interactions)\n`;
    });
    report += `\n`;

    report += `STRONGEST BONDS:\n`;
    stats.strongestBonds.forEach((char, i) => {
      report += `${i + 1}. ${char.name} - ${char.affinity} affinity (${char.stage})\n`;
    });

    return report;
  }

  /**
   * Export social data for persistence
   */
  exportSocialData(): string {
    return JSON.stringify({
      characterId: this.characterId,
      faction: this.faction,
      gangId: this.gangId,
      personality: this.personality.archetype,
      relationships: Array.from(this.relationships.values()),
      stats: this.getSocialStats()
    }, null, 2);
  }
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

interface ScoredAction {
  action: SocialAction;
  score: number;
}

interface SocialAction {
  type: 'send_friend_request' | 'send_chat' | 'send_mail' | 'invite_quest' | 'join_gang' | 'leave_gang';
  targetId: string;
  targetName: string;
  priority: 'low' | 'medium' | 'high';
  context?: string;
}

interface SocialStats {
  totalRelationships: number;
  strangers: number;
  acquaintances: number;
  friends: number;
  closeFriends: number;
  blocked: number;
  averageAffinity: number;
  totalInteractions: number;
  mostInteracted: Array<{name: string, count: number}>;
  strongestBonds: Array<{name: string, affinity: number, stage: string}>;
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * EXAMPLE USAGE:
 *
 * ```typescript
 * import { PersonalitySystem } from '../intelligence/PersonalitySystem';
 * import { SocialIntelligence, InteractionType } from './SocialIntelligence';
 *
 * // Create personality and social intelligence
 * const personality = PersonalitySystem.createPersonality('social');
 * const social = new SocialIntelligence('char-123', 'settler', personality);
 *
 * // Record an interaction
 * social.recordInteraction(
 *   'char-456',
 *   'Dusty Pete',
 *   InteractionType.CHAT,
 *   true,
 *   'Met in saloon'
 * );
 *
 * // Check if should send friend request
 * const shouldRequest = social.shouldSendFriendRequest({
 *   characterId: 'char-456',
 *   characterName: 'Dusty Pete',
 *   faction: 'settler',
 *   level: 5
 * });
 *
 * if (shouldRequest) {
 *   console.log('Sending friend request to Dusty Pete');
 * }
 *
 * // Evaluate gang membership
 * const shouldJoin = social.shouldJoinGang({
 *   gangId: 'gang-789',
 *   gangName: 'Desert Riders',
 *   gangTag: 'DSRT',
 *   memberCount: 12,
 *   level: 5,
 *   faction: 'settler',
 *   reputation: 0.7
 * });
 *
 * if (shouldJoin) {
 *   console.log('Joining gang: Desert Riders');
 * }
 *
 * // Select best social action
 * const action = social.selectSocialAction({
 *   nearbyCharacters: [
 *     {
 *       characterId: 'char-456',
 *       characterName: 'Dusty Pete',
 *       faction: 'settler',
 *       level: 5
 *     },
 *     {
 *       characterId: 'char-789',
 *       characterName: 'Black Jack',
 *       faction: 'outlaw',
 *       level: 8
 *     }
 *   ],
 *   currentCharacter: {
 *     characterId: 'char-123',
 *     faction: 'settler',
 *     level: 6,
 *     energy: 80,
 *     gold: 500
 *   }
 * });
 *
 * if (action) {
 *   console.log(`Recommended action: ${action.type} with ${action.targetName}`);
 * }
 *
 * // Decay relationships over time
 * setInterval(() => {
 *   social.decayRelationships();
 * }, 1000 * 60 * 60 * 24); // Daily
 *
 * // Get social statistics
 * const stats = social.getSocialStats();
 * console.log(`Friends: ${stats.friends}, Close Friends: ${stats.closeFriends}`);
 *
 * // Get full report
 * console.log(social.getSocialNetworkReport());
 * ```
 *
 * REALISTIC BEHAVIOR EXAMPLES:
 *
 * 1. Gradual Friendship Formation:
 *    - First meeting: Stranger stage, low affinity
 *    - Chat interaction: +3 affinity
 *    - Help with quest: +8 affinity
 *    - Trade items: +4 affinity
 *    - After ~5 positive interactions: Reaches Acquaintance (20+ affinity)
 *    - After ~12 interactions: Friend request sent (30+ affinity)
 *    - Friend stage reached: 50+ affinity
 *    - Close friend after many shared activities: 80+ affinity
 *
 * 2. Faction-Based Behavior:
 *    - Same faction: +20 initial affinity, faster friendship
 *    - Different faction: -10 initial affinity, slower trust building
 *    - Can still become friends across factions with enough positive interactions
 *
 * 3. Personality-Driven Decisions:
 *    - Social personality: Sends friend requests eagerly, accepts most
 *    - Grinder personality: Rarely sends requests, sees as time waste
 *    - Combat personality: Forms friendships through combat together
 *    - Explorer personality: Independent, fewer close bonds
 *
 * 4. Gang Dynamics:
 *    - Social + Loyal personality: Joins gangs readily
 *    - Same gang members: +30 affinity bonus, frequent interactions
 *    - Gang satisfaction affects whether to stay/leave
 *
 * 5. Relationship Decay:
 *    - No interaction for days: Affinity slowly decreases (-2/day)
 *    - Can drop from Friend back to Acquaintance if neglected
 *    - Trust decays slower than affinity
 *    - Old stranger relationships pruned to maintain memory limits
 *
 * 6. Interaction Frequency:
 *    - Strangers: Interact rarely (0.2x normal)
 *    - Acquaintances: Normal frequency (0.5x)
 *    - Friends: Interact more (1.5x)
 *    - Close Friends: Very frequent (3.0x)
 *    - Same gang: 1.5x frequency multiplier
 *    - Recent spam: Reduced frequency to avoid annoyance
 *
 * 7. Context-Aware Actions:
 *    - Evaluates all nearby characters
 *    - Scores different interaction types
 *    - Prioritizes friend requests when affinity is right
 *    - Suggests mail for existing friends
 *    - Recommends quests for close friends
 *    - Avoids blocked characters completely
 * ```
 */
