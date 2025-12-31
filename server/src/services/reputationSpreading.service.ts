/**
 * Reputation Spreading Service
 *
 * Handles reputation events spreading through NPC social networks
 * Part of Phase 3, Wave 3.2 - Reputation Spreading System
 */

import mongoose from 'mongoose';
import {
  ReputationEvent as ReputationEventModel,
  IReputationEvent
} from '../models/ReputationEvent.model';
import {
  NPCKnowledge as NPCKnowledgeModel,
  INPCKnowledge,
  IKnownEvent
} from '../models/NPCKnowledge.model';
import { NPC } from '../models/NPC.model';
import { Location } from '../models/Location.model';
import {
  ReputationEventType,
  KnowledgeSource,
  EVENT_SPREAD_CONFIGS,
  SpreadResult,
  ReputationModifier,
  LocationReputation
} from '@desperados/shared';
import { SecureRNG } from './base/SecureRNG';
import logger from '../utils/logger';

/**
 * NPC network graph for spreading
 */
interface NPCConnection {
  npcId: string;
  relatedNpcId: string;
  strength: number;
  isSameFaction: boolean;
  isFamily: boolean;
}

export class ReputationSpreadingService {
  /**
   * Create a new reputation event and spread it through the network
   */
  static async createReputationEvent(
    characterId: string,
    eventType: ReputationEventType,
    locationId: string,
    options: {
      magnitude?: number;
      sentiment?: number;
      faction?: string;
      originNpcId?: string;
      spreadRadius?: number;
      decayRate?: number;
      description?: string;
    } = {}
  ): Promise<{ event: IReputationEvent; spreadResult: SpreadResult }> {
    const startTime = Date.now();

    // Get default config for event type
    const config = EVENT_SPREAD_CONFIGS[eventType] || {};

    // Calculate expiration
    const expirationHours = config.expirationHours || 168; // Default 1 week
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

    // Create event
    const event = new ReputationEventModel({
      characterId: new mongoose.Types.ObjectId(characterId),
      eventType,
      magnitude: options.magnitude ?? config.defaultMagnitude ?? 50,
      sentiment: options.sentiment ?? config.defaultSentiment ?? 0,
      faction: options.faction,
      locationId,
      originNpcId: options.originNpcId,
      spreadRadius: options.spreadRadius ?? config.defaultSpreadRadius ?? 3,
      decayRate: options.decayRate ?? config.defaultDecayRate ?? 0.2,
      timestamp: new Date(),
      expiresAt,
      description: options.description,
      spreadCount: 0,
      lastSpreadTime: new Date()
    });

    await event.save();

    // Spread the event through the network
    const spreadResult = await this.spreadReputation(event._id.toString());

    const totalTime = Date.now() - startTime;

    logger.info(
      `Created reputation event ${event._id} for character ${characterId}: ` +
      `${eventType} (mag: ${event.magnitude}, sent: ${event.sentiment}) ` +
      `spread to ${spreadResult.npcsInformed} NPCs in ${totalTime}ms`
    );

    return { event, spreadResult };
  }

  /**
   * Spread reputation event through NPC network
   */
  static async spreadReputation(eventId: string): Promise<SpreadResult> {
    const event = await ReputationEventModel.findById(eventId);

    if (!event) {
      throw new Error(`Reputation event ${eventId} not found`);
    }

    const hopDistribution = {
      hop0: 0,
      hop1: 0,
      hop2: 0,
      hop3: 0
    };

    let totalMagnitude = 0;
    let npcsInformed = 0;

    // Get NPC network connections
    const connections = await this.getNPCConnections(event.locationId);

    // Track which NPCs we've informed at each hop level
    const informedNPCs = new Map<string, number>(); // npcId -> hop distance

    // HOP 0: Origin NPC (if specified) witnesses the event
    if (event.originNpcId) {
      await this.informNPC(event, event.originNpcId, 0, KnowledgeSource.WITNESSED);
      informedNPCs.set(event.originNpcId, 0);
      hopDistribution.hop0++;
      totalMagnitude += event.magnitude;
      npcsInformed++;
    }

    // Get faction multiplier if applicable
    const factionMultiplier = event.faction ? this.getFactionSpreadMultiplier(event.faction) : 1;

    // Spread through hops
    for (let hop = 1; hop <= event.spreadRadius && hop <= 3; hop++) {
      const previousHopNPCs = Array.from(informedNPCs.entries())
        .filter(([_, hopDist]) => hopDist === hop - 1)
        .map(([npcId, _]) => npcId);

      if (previousHopNPCs.length === 0) break;

      // Find NPCs connected to previous hop
      const nextHopNPCs = this.getConnectedNPCs(
        previousHopNPCs,
        connections,
        informedNPCs
      );

      // Calculate magnitude degradation
      let degradedMagnitude = event.magnitude * Math.pow(1 - event.decayRate, hop);

      // Apply faction bonus (same faction spreads faster with less decay)
      degradedMagnitude *= factionMultiplier;

      // Determine knowledge source
      let source: KnowledgeSource;
      if (hop === 1) {
        source = KnowledgeSource.HEARD;
      } else if (hop === 2) {
        source = KnowledgeSource.HEARD;
      } else {
        source = KnowledgeSource.RUMOR;
      }

      // Inform NPCs at this hop
      for (const npcId of nextHopNPCs) {
        // Find who told them (one of the previous hop NPCs they're connected to)
        const heardFrom = this.findInformer(npcId, previousHopNPCs, connections);

        await this.informNPC(
          event,
          npcId,
          hop,
          source,
          Math.round(degradedMagnitude),
          heardFrom
        );

        informedNPCs.set(npcId, hop);
        totalMagnitude += degradedMagnitude;
        npcsInformed++;

        // Update hop distribution
        if (hop === 1) hopDistribution.hop1++;
        else if (hop === 2) hopDistribution.hop2++;
        else if (hop === 3) hopDistribution.hop3++;
      }
    }

    // Update event spread metadata
    event.spreadCount = npcsInformed;
    event.lastSpreadTime = new Date();
    await event.save();

    const averageMagnitude = npcsInformed > 0 ? Math.round(totalMagnitude / npcsInformed) : 0;

    return {
      eventId: event._id.toString(),
      npcsInformed,
      hopDistribution,
      averageMagnitude,
      spreadTime: 0 // Will be calculated by caller
    };
  }

  /**
   * Inform a specific NPC about an event
   */
  private static async informNPC(
    event: IReputationEvent,
    npcId: string,
    hopDistance: number,
    source: KnowledgeSource,
    perceivedMagnitude?: number,
    heardFrom?: string
  ): Promise<void> {
    // Calculate perceived magnitude (degraded from original)
    const magnitude = perceivedMagnitude ?? event.magnitude;

    // Calculate perceived sentiment (may differ slightly for rumors)
    let sentiment = event.sentiment;
    if (source === KnowledgeSource.RUMOR) {
      // Rumors may exaggerate sentiment slightly
      const exaggeration = SecureRNG.range(-10, 10);
      sentiment = Math.max(-100, Math.min(100, sentiment + exaggeration));
    }

    // Calculate credibility (decreases with hop distance)
    const credibility = Math.max(30, 100 - (hopDistance * 20));

    const knownEvent: IKnownEvent = {
      eventId: event._id.toString(),
      eventType: event.eventType,
      perceivedMagnitude: Math.round(magnitude),
      perceivedSentiment: Math.round(sentiment),
      source,
      heardFrom,
      hopDistance,
      learnedAt: new Date(),
      credibility
    };

    // Create or update NPC knowledge
    await NPCKnowledgeModel.createOrUpdate(
      npcId,
      event.characterId.toString(),
      knownEvent
    );
  }

  /**
   * Get NPC connections for a location (from relationship system)
   */
  private static async getNPCConnections(locationId: string): Promise<NPCConnection[]> {
    try {
      // Import relationship data
      const { ALL_NPC_RELATIONSHIPS } = await import('../data/npcRelationships');
      const { RelationshipType } = await import('@desperados/shared');

      // Convert relationships to connections
      const connections: NPCConnection[] = [];

      for (const rel of ALL_NPC_RELATIONSHIPS) {
        if (!rel.npcId || !rel.relatedNpcId) continue;

        const strength = rel.strength || 5;
        const isFamily = rel.relationshipType === RelationshipType.FAMILY ||
                        rel.relationshipType === RelationshipType.SPOUSE;

        // For now, assume same faction if positive sentiment
        const isSameFaction = (rel.sentiment || 0) > 0;

        connections.push({
          npcId: rel.npcId,
          relatedNpcId: rel.relatedNpcId,
          strength,
          isSameFaction,
          isFamily
        });

        // Add reverse connection (relationships are bidirectional)
        connections.push({
          npcId: rel.relatedNpcId,
          relatedNpcId: rel.npcId,
          strength,
          isSameFaction,
          isFamily
        });
      }

      return connections;
    } catch (error) {
      logger.error('Error loading NPC connections:', error);
      return [];
    }
  }

  /**
   * Get NPCs connected to a set of NPCs
   */
  private static getConnectedNPCs(
    sourceNPCs: string[],
    connections: NPCConnection[],
    alreadyInformed: Map<string, number>
  ): string[] {
    const connected = new Set<string>();

    for (const sourceNPC of sourceNPCs) {
      const relatedConnections = connections.filter(c => c.npcId === sourceNPC);

      for (const conn of relatedConnections) {
        // Only add if not already informed
        if (!alreadyInformed.has(conn.relatedNpcId)) {
          // Family and close friends (strength > 7) always share
          // Others share based on strength
          const shareChance = conn.isFamily ? 1.0 : (conn.strength / 10);

          if (SecureRNG.chance(shareChance)) {
            connected.add(conn.relatedNpcId);
          }
        }
      }
    }

    return Array.from(connected);
  }

  /**
   * Find which NPC informed this NPC (for heardFrom tracking)
   */
  private static findInformer(
    targetNPC: string,
    sourceNPCs: string[],
    connections: NPCConnection[]
  ): string | undefined {
    // Find strongest connection to source NPCs
    let strongestConnection: NPCConnection | undefined;
    let maxStrength = 0;

    for (const sourceNPC of sourceNPCs) {
      const conn = connections.find(
        c => c.npcId === sourceNPC && c.relatedNpcId === targetNPC
      );

      if (conn && conn.strength > maxStrength) {
        strongestConnection = conn;
        maxStrength = conn.strength;
      }
    }

    return strongestConnection?.npcId;
  }

  /**
   * Get faction spread multiplier
   */
  private static getFactionSpreadMultiplier(faction: string): number {
    // Same-faction NPCs spread 20% faster (less decay)
    return 1.2;
  }

  /**
   * Get NPC's knowledge about a character
   */
  static async getNPCKnowledge(
    npcId: string,
    characterId: string
  ): Promise<INPCKnowledge | null> {
    return await NPCKnowledgeModel.findKnowledge(npcId, characterId);
  }

  /**
   * Get player reputation in a location
   */
  static async getPlayerReputation(
    characterId: string,
    locationId: string
  ): Promise<LocationReputation> {
    // Get all events in this location
    const events = await ReputationEventModel.find({
      characterId: new mongoose.Types.ObjectId(characterId),
      locationId,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    }).sort({ timestamp: -1 });

    // Get all NPCs who know about this character
    const knowledgeRecords = await NPCKnowledgeModel.findByCharacter(characterId);

    // Calculate overall reputation
    let totalOpinion = 0;
    let count = 0;

    for (const knowledge of knowledgeRecords) {
      totalOpinion += knowledge.overallOpinion;
      count++;
    }

    const overallReputation = count > 0 ? Math.round(totalOpinion / count) : 0;

    // Determine dominant sentiment
    const positiveCount = knowledgeRecords.filter(k => k.overallOpinion > 20).length;
    const negativeCount = knowledgeRecords.filter(k => k.overallOpinion < -20).length;

    let dominantSentiment: 'positive' | 'negative' | 'neutral';
    if (positiveCount > negativeCount) {
      dominantSentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      dominantSentiment = 'negative';
    } else {
      dominantSentiment = 'neutral';
    }

    // Find most influential event (highest magnitude)
    const mostInfluentialEvent = events.length > 0
      ? events.reduce((max, current) => current.magnitude > max.magnitude ? current : max)
      : undefined;

    // Get recent events (last 5)
    const recentEvents = events.slice(0, 5);

    // Calculate per-faction standing
    const factionStanding: { [faction: string]: number } = {};
    const factionCounts: { [faction: string]: number } = {};

    for (const knowledge of knowledgeRecords) {
      try {
        // Get NPC's location
        const npc = await NPC.findOne({ name: knowledge.npcId }).lean();
        if (!npc || !npc.location) continue;

        // Get location's faction influence
        const location = await Location.findOne({ slug: npc.location }).lean();
        if (!location || !location.factionInfluence) continue;

        // Determine dominant faction from influence
        const { settlerAlliance = 0, nahiCoalition = 0, frontera = 0 } = location.factionInfluence;
        let dominantFaction = 'neutral';
        const maxInfluence = Math.max(settlerAlliance, nahiCoalition, frontera);

        if (maxInfluence > 0) {
          if (settlerAlliance === maxInfluence) dominantFaction = 'settlerAlliance';
          else if (nahiCoalition === maxInfluence) dominantFaction = 'nahiCoalition';
          else if (frontera === maxInfluence) dominantFaction = 'frontera';
        }

        // Aggregate opinion for this faction
        if (!factionStanding[dominantFaction]) {
          factionStanding[dominantFaction] = 0;
          factionCounts[dominantFaction] = 0;
        }
        factionStanding[dominantFaction] += knowledge.overallOpinion;
        factionCounts[dominantFaction]++;
      } catch (err) {
        // Skip if NPC/location lookup fails
        continue;
      }
    }

    // Calculate averages for each faction
    for (const faction of Object.keys(factionStanding)) {
      if (factionCounts[faction] > 0) {
        factionStanding[faction] = Math.round(factionStanding[faction] / factionCounts[faction]);
      }
    }

    return {
      characterId,
      locationId,
      overallReputation,
      npcsWhoKnow: count,
      dominantSentiment,
      mostInfluentialEvent,
      recentEvents,
      factionStanding
    };
  }

  /**
   * Calculate reputation modifier for NPC interactions
   */
  static async getReputationModifier(
    npcId: string,
    characterId: string
  ): Promise<ReputationModifier> {
    const knowledge = await this.getNPCKnowledge(npcId, characterId);

    if (!knowledge) {
      // No knowledge = neutral
      return {
        npcId,
        characterId,
        opinionScore: 0,
        priceModifier: 1.0,
        dialogueAccessLevel: 5,
        willHelp: true,
        willHarm: false,
        willReport: false,
        willTrade: true,
        qualityOfService: 50
      };
    }

    const opinion = knowledge.overallOpinion;
    const trust = knowledge.trustLevel;
    const fear = knowledge.fearLevel;

    // Price modifier: -100 to +100 opinion maps to 0.5x to 2.0x price
    const priceModifier = 1.0 + (opinion / -200); // Positive opinion = lower prices

    // Dialogue access: 0-10 based on trust
    const dialogueAccessLevel = Math.round(trust / 10);

    // Will help if opinion > 30 and trust > 40
    const willHelp = opinion > 30 && trust > 40;

    // Will harm if opinion < -50 or fear > 70
    const willHarm = opinion < -50 || fear > 70;

    // Will report crimes if opinion < -30 and trust < 30
    const willReport = opinion < -30 && trust < 30;

    // Will trade if opinion > -40
    const willTrade = opinion > -40;

    // Quality of service: 0-100 based on opinion and trust
    const qualityOfService = Math.round(Math.max(0, Math.min(100, 50 + opinion / 2 + trust / 4)));

    return {
      npcId,
      characterId,
      opinionScore: opinion,
      priceModifier: Math.max(0.5, Math.min(2.0, priceModifier)),
      dialogueAccessLevel: Math.max(0, Math.min(10, dialogueAccessLevel)),
      willHelp,
      willHarm,
      willReport,
      willTrade,
      qualityOfService
    };
  }

  /**
   * Calculate overall opinion of a character by an NPC
   */
  static async calculateOverallOpinion(
    npcId: string,
    characterId: string
  ): Promise<number> {
    const knowledge = await this.getNPCKnowledge(npcId, characterId);
    return knowledge?.overallOpinion ?? 0;
  }

  /**
   * Cleanup expired events (background job)
   * H8 FIX: Use batch processing instead of loading all documents at once
   */
  static async cleanupExpiredEvents(): Promise<number> {
    try {
      // Delete expired events
      const deletedCount = await ReputationEventModel.cleanupExpiredEvents();

      // H8 FIX: Process knowledge records in batches to prevent memory exhaustion
      const BATCH_SIZE = 100;
      let processedCount = 0;
      let hasMore = true;
      let lastId: any = null;

      while (hasMore) {
        // Use cursor-based pagination for consistent ordering
        const query = lastId
          ? { _id: { $gt: lastId } }
          : {};

        const batch = await NPCKnowledgeModel.find(query)
          .sort({ _id: 1 })
          .limit(BATCH_SIZE);

        if (batch.length === 0) {
          hasMore = false;
          break;
        }

        lastId = batch[batch.length - 1]._id;

        for (const knowledge of batch) {
          let modified = false;

          // Remove events that no longer exist
          for (const event of knowledge.events) {
            const exists = await ReputationEventModel.findById(event.eventId);
            if (!exists) {
              knowledge.removeEvent(event.eventId);
              modified = true;
            }
          }

          if (modified) {
            await knowledge.save();
          }
          processedCount++;
        }

        // Check if we've processed fewer than batch size (end of collection)
        if (batch.length < BATCH_SIZE) {
          hasMore = false;
        }
      }

      logger.info(`Cleaned up ${deletedCount} expired reputation events, processed ${processedCount} knowledge records`);
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up expired events:', error);
      throw error;
    }
  }

  /**
   * Decay old events (reduce impact over time)
   * H8 FIX: Use batch processing instead of loading all documents at once
   */
  static async decayOldEvents(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // H8 FIX: Process knowledge records in batches to prevent memory exhaustion
      const BATCH_SIZE = 100;
      let decayedCount = 0;
      let hasMore = true;
      let lastId: any = null;

      while (hasMore) {
        // Use cursor-based pagination for consistent ordering
        const query = lastId
          ? { _id: { $gt: lastId } }
          : {};

        const batch = await NPCKnowledgeModel.find(query)
          .sort({ _id: 1 })
          .limit(BATCH_SIZE);

        if (batch.length === 0) {
          hasMore = false;
          break;
        }

        lastId = batch[batch.length - 1]._id;

        for (const knowledge of batch) {
          let modified = false;

          for (const event of knowledge.events) {
            if (event.learnedAt < thirtyDaysAgo) {
              // Reduce magnitude by 10%
              const newMagnitude = Math.round(event.perceivedMagnitude * 0.9);

              if (newMagnitude < 10) {
                // Forget events with magnitude < 10
                knowledge.removeEvent(event.eventId);
                modified = true;
                decayedCount++;
              } else {
                event.perceivedMagnitude = newMagnitude;
                modified = true;
                decayedCount++;
              }
            }
          }

          if (modified) {
            knowledge.recalculateOpinion();
            await knowledge.save();
          }
        }

        // Check if we've processed fewer than batch size (end of collection)
        if (batch.length < BATCH_SIZE) {
          hasMore = false;
        }
      }

      logger.info(`Decayed ${decayedCount} old reputation events`);
      return decayedCount;
    } catch (error) {
      logger.error('Error decaying old events:', error);
      throw error;
    }
  }
}
