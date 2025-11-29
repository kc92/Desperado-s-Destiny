/**
 * Gossip Service
 *
 * Handles gossip generation, spreading, and NPC cross-references
 * Part of Phase 3, Wave 3.1 - NPC Cross-references System
 */

import { Gossip, IGossip } from '../models/Gossip.model';
import { NPCRelationship, INPCRelationship } from '../models/NPCRelationship.model';
import { NPCTrust } from '../models/NPCTrust.model';
import {
  GossipCategory,
  GossipTruthfulness,
  RelationshipType,
  NPCOpinion
} from '@desperados/shared';
import { AppError } from '../utils/errors';

/**
 * Gossip generation options
 */
interface GossipGenerationOptions {
  subject: string;
  category: GossipCategory;
  eventType?: string;
  eventData?: any;
  truthfulness?: GossipTruthfulness;
  spreadFactor?: number;
  trustRequired?: number;
  expiresInDays?: number;
  playerInvolved?: boolean;
}

/**
 * Gossip Service
 */
export class GossipService {
  /**
   * Get gossip that an NPC can share with a player
   */
  static async getGossip(
    npcId: string,
    characterId: string
  ): Promise<{ gossip: IGossip[]; newGossipCount: number }> {
    // Get player's trust level with this NPC
    const trustLevel = await NPCTrust.getTrustLevel(characterId, npcId);

    // Get character to determine faction
    // For now, we'll skip faction filtering - can be added later
    const gossipList = await Gossip.getGossipForPlayer(npcId, trustLevel);

    // Count new gossip (gossip from last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newGossipCount = gossipList.filter(g => g.startDate > yesterday).length;

    return {
      gossip: gossipList,
      newGossipCount
    };
  }

  /**
   * Create new gossip
   */
  static async createGossip(
    originNpc: string,
    options: GossipGenerationOptions
  ): Promise<IGossip> {
    const {
      subject,
      category,
      eventType,
      eventData,
      truthfulness = GossipTruthfulness.COMPLETELY_TRUE,
      spreadFactor = 5,
      trustRequired = 0,
      expiresInDays,
      playerInvolved = false
    } = options;

    // Generate content based on template
    const content = await this.generateGossipContent(category, subject, eventType, eventData);

    // Calculate expiry date
    let expiresAt: Date | undefined;
    if (expiresInDays) {
      expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    }

    // Create gossip
    const gossip = new Gossip({
      subject,
      category,
      content,
      contentGenerated: content,
      truthfulness,
      verifiable: false,
      spreadFactor,
      originNpc,
      knownBy: [originNpc],
      startDate: new Date(),
      expiresAt,
      isStale: false,
      eventTriggered: eventType,
      eventData,
      playerInvolved,
      trustRequired
    });

    await gossip.save();
    return gossip;
  }

  /**
   * Generate gossip content based on category and templates
   */
  private static async generateGossipContent(
    category: GossipCategory,
    subject: string,
    eventType?: string,
    eventData?: any
  ): Promise<string> {
    // This will use templates from gossipTemplates.ts
    // For now, return a basic template
    switch (category) {
      case GossipCategory.PERSONAL:
        return `Did you hear about ${subject}? Word is they've been acting strange lately.`;
      case GossipCategory.CRIMINAL:
        return `They say ${subject} has been up to no good. Keep your distance.`;
      case GossipCategory.ROMANCE:
        return `I heard ${subject} has been seen with someone new. Romance in the air!`;
      case GossipCategory.BUSINESS:
        return `${subject}'s business dealings are the talk of the town.`;
      case GossipCategory.CONFLICT:
        return `There's bad blood between ${subject} and some folks around here.`;
      case GossipCategory.RUMOR:
        return `People are talking about ${subject}. Not sure what to believe.`;
      case GossipCategory.NEWS:
        return `Big news about ${subject}. Everyone's heard by now.`;
      case GossipCategory.POLITICAL:
        return `${subject}'s been making waves in local politics.`;
      case GossipCategory.SUPERNATURAL:
        return `Strange things happen around ${subject}. Some say they're cursed.`;
      case GossipCategory.SECRET:
        return `I shouldn't tell you this, but ${subject}... well, you didn't hear it from me.`;
      default:
        return `I heard something about ${subject}.`;
    }
  }

  /**
   * Spread gossip through the NPC network
   */
  static async spreadGossip(gossipId: string): Promise<{
    gossipId: string;
    spreadToNpcs: string[];
    newlyInformed: number;
  }> {
    const gossip = await Gossip.findById(gossipId);
    if (!gossip) {
      throw new AppError('Gossip not found', 404);
    }

    const spreadToNpcs: string[] = [];

    // For each NPC who knows the gossip, try to spread to their connections
    for (const npcId of gossip.knownBy) {
      // Get relationships for this NPC
      const relationships = await NPCRelationship.findGossipableRelationships(npcId);

      for (const rel of relationships) {
        const targetNpcId = rel.relatedNpcId;

        // Try to spread
        const success = await Gossip.spreadGossip(gossipId, npcId, targetNpcId);
        if (success) {
          spreadToNpcs.push(targetNpcId);
        }
      }
    }

    return {
      gossipId,
      spreadToNpcs,
      newlyInformed: spreadToNpcs.length
    };
  }

  /**
   * Get NPC's opinion about another NPC
   */
  static async getNPCOpinion(
    askerNpcId: string,
    subjectNpcId: string
  ): Promise<NPCOpinion | null> {
    // Find relationship
    const relationship = await NPCRelationship.findRelationship(askerNpcId, subjectNpcId);
    if (!relationship) {
      return null;
    }

    // Build opinion based on relationship
    const opinion: any = {
      npcId: askerNpcId,
      subjectNpcId,
      sentiment: relationship.sentiment,
      respect: Math.max(0, Math.floor(relationship.strength / 2)),
      trust: relationship.sentiment > 0 ? Math.floor(relationship.strength / 2) : 0,
      fear: relationship.sentiment < -5 ? Math.abs(relationship.sentiment) : 0,
      shortOpinion: this.generateShortOpinion(relationship),
      detailedOpinion: relationship.history,
      canChange: !relationship.isSecret
    };

    return opinion;
  }

  /**
   * Generate short opinion text based on relationship
   */
  private static generateShortOpinion(relationship: INPCRelationship): string {
    const { relationshipType, sentiment, strength } = relationship;

    // Relationship type based opinions
    switch (relationshipType) {
      case RelationshipType.FAMILY:
        return sentiment > 5
          ? 'Family is everything. They mean the world to me.'
          : sentiment < -5
          ? 'Blood doesn\'t mean we get along.'
          : 'Family is complicated.';

      case RelationshipType.FRIEND:
        return strength > 7
          ? 'One of the best people I know.'
          : 'Good person. I like them.';

      case RelationshipType.ENEMY:
        return sentiment < -7
          ? 'I despise them. Stay clear.'
          : 'We have our differences.';

      case RelationshipType.RIVAL:
        return 'They keep me on my toes. Healthy competition.';

      case RelationshipType.LOVER:
        return 'What we have is special. That\'s all I\'ll say.';

      case RelationshipType.EMPLOYER:
        return 'I run a tight ship. They work for me.';

      case RelationshipType.EMPLOYEE:
        return 'I work for them. Fair enough boss.';

      case RelationshipType.MENTOR:
        return 'I\'ve taught them what I know. Good student.';

      case RelationshipType.BUSINESS_PARTNER:
        return 'We do business together. It\'s profitable.';

      case RelationshipType.CRIMINAL_ASSOCIATE:
        return 'We\'ve done some jobs together. Reliable.';

      default:
        return sentiment > 0
          ? 'I like them well enough.'
          : sentiment < 0
          ? 'I don\'t trust them.'
          : 'They\'re alright, I suppose.';
    }
  }

  /**
   * Get all relationships for an NPC
   */
  static async getRelationships(npcId: string): Promise<INPCRelationship[]> {
    return NPCRelationship.findRelationships(npcId);
  }

  /**
   * Get public relationships for an NPC
   */
  static async getPublicRelationships(npcId: string): Promise<INPCRelationship[]> {
    return NPCRelationship.findPublicRelationships(npcId);
  }

  /**
   * Find connection path between two NPCs
   */
  static async findConnection(
    npcId1: string,
    npcId2: string
  ): Promise<string[]> {
    return NPCRelationship.findConnectionPath(npcId1, npcId2);
  }

  /**
   * Get gossip about a specific NPC
   */
  static async getGossipAboutNPC(
    subjectNpcId: string,
    trustLevel: number = 0
  ): Promise<IGossip[]> {
    const allGossip = await Gossip.findGossipBySubject(subjectNpcId);

    // Filter by trust level
    return allGossip.filter(g => (g.trustRequired || 0) <= trustLevel);
  }

  /**
   * Create event-triggered gossip
   * Called when events happen in the game
   */
  static async onGameEvent(
    eventType: string,
    eventData: any
  ): Promise<IGossip[]> {
    const createdGossip: IGossip[] = [];

    switch (eventType) {
      case 'crime_committed':
        if (eventData.characterName && eventData.crimeType) {
          // Create gossip about the crime
          const gossip = await this.createGossip(eventData.witnessNpc || 'town-crier', {
            subject: eventData.characterName,
            category: GossipCategory.CRIMINAL,
            eventType,
            eventData,
            spreadFactor: 8,
            playerInvolved: true,
            expiresInDays: 7
          });
          createdGossip.push(gossip);
        }
        break;

      case 'player_arrested':
        if (eventData.characterName) {
          const gossip = await this.createGossip(eventData.arrestingOfficer || 'sheriff', {
            subject: eventData.characterName,
            category: GossipCategory.NEWS,
            eventType,
            eventData,
            spreadFactor: 9,
            playerInvolved: true,
            expiresInDays: 3
          });
          createdGossip.push(gossip);
        }
        break;

      case 'gang_joined':
        if (eventData.characterName && eventData.gangName) {
          const gossip = await this.createGossip(eventData.gangLeader || 'town-gossip', {
            subject: eventData.characterName,
            category: GossipCategory.NEWS,
            eventType,
            eventData,
            spreadFactor: 6,
            playerInvolved: true,
            expiresInDays: 14
          });
          createdGossip.push(gossip);
        }
        break;

      case 'combat_won':
        if (eventData.characterName && eventData.enemyName) {
          const gossip = await this.createGossip(eventData.witnessNpc || 'bartender', {
            subject: eventData.characterName,
            category: GossipCategory.NEWS,
            eventType,
            eventData,
            spreadFactor: 7,
            playerInvolved: true,
            expiresInDays: 5
          });
          createdGossip.push(gossip);
        }
        break;

      case 'high_reputation':
        if (eventData.characterName) {
          const gossip = await this.createGossip('town-crier', {
            subject: eventData.characterName,
            category: GossipCategory.NEWS,
            eventType,
            eventData,
            spreadFactor: 6,
            playerInvolved: true,
            expiresInDays: 30
          });
          createdGossip.push(gossip);
        }
        break;
    }

    return createdGossip;
  }

  /**
   * Clean up old gossip
   */
  static async cleanupOldGossip(): Promise<number> {
    return Gossip.cleanupExpiredGossip();
  }

  /**
   * Get gossip by category
   */
  static async getGossipByCategory(
    category: GossipCategory
  ): Promise<IGossip[]> {
    return Gossip.findGossipByCategory(category);
  }

  /**
   * Check if NPC knows specific gossip
   */
  static async checkIfNPCKnows(
    gossipId: string,
    npcId: string
  ): Promise<boolean> {
    return Gossip.checkIfNPCKnows(gossipId, npcId);
  }

  /**
   * Get active gossip
   */
  static async getActiveGossip(): Promise<IGossip[]> {
    return Gossip.findActiveGossip();
  }

  /**
   * Mark gossip as stale
   */
  static async markGossipStale(gossipId: string): Promise<void> {
    await Gossip.markStale(gossipId);
  }
}
