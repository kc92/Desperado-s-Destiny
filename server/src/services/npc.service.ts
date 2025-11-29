/**
 * NPC Service
 * Handles player-NPC interactions, quest discovery, and trust building
 */

import mongoose from 'mongoose';
import { Location, ILocation } from '../models/Location.model';
import { NPCTrust, INPCTrust } from '../models/NPCTrust.model';
import { Character, ICharacter } from '../models/Character.model';
import { QuestDefinition, IQuestDefinition } from '../models/Quest.model';
import { NPCRelationship } from '../models/NPCRelationship.model';
import { Gossip, IGossip } from '../models/Gossip.model';
import { QuestService } from './quest.service';
import { GossipService } from './gossip.service';
import { AppError } from '../utils/errors';
import { LocationNPC, SecretContent } from '@desperados/shared';
import { CROSS_REFERENCE_TEMPLATES } from '../data/gossipTemplates';

/**
 * NPC with trust level included
 */
export interface NPCWithTrust extends LocationNPC {
  trustLevel: number;
  interactionCount: number;
  locationId: string;
  locationName: string;
}

/**
 * Result of NPC interaction
 */
export interface NPCInteractionResult {
  npc: NPCWithTrust;
  dialogue: string[];
  availableQuests: IQuestDefinition[];
  trustLevel: number;
  trustIncrease: number;
  unlockedSecrets?: SecretContent[];
  newTrustTier?: string;
  gossip?: IGossip[];
  crossReferences?: string[];
}

/**
 * Trust tiers for dialogue and content gating
 */
export enum TrustTier {
  STRANGER = 'stranger', // 0-19
  ACQUAINTANCE = 'acquaintance', // 20-39
  FRIEND = 'friend', // 40-59
  TRUSTED = 'trusted', // 60-79
  CONFIDANT = 'confidant' // 80-100
}

export class NPCService {
  /**
   * Get trust tier from trust level
   */
  static getTrustTier(trustLevel: number): TrustTier {
    if (trustLevel >= 80) return TrustTier.CONFIDANT;
    if (trustLevel >= 60) return TrustTier.TRUSTED;
    if (trustLevel >= 40) return TrustTier.FRIEND;
    if (trustLevel >= 20) return TrustTier.ACQUAINTANCE;
    return TrustTier.STRANGER;
  }

  /**
   * Get all NPCs at a location (including buildings)
   */
  static async getNPCsAtLocation(
    locationId: string,
    characterId?: string
  ): Promise<NPCWithTrust[]> {
    // Get the location
    const location = await Location.findById(locationId);
    if (!location) {
      throw new AppError('Location not found', 404);
    }

    const allNPCs: NPCWithTrust[] = [];

    // Get NPCs from main location
    for (const npc of location.npcs) {
      const trust = characterId
        ? await NPCTrust.findOne({ characterId, npcId: npc.id })
        : null;

      allNPCs.push({
        ...(npc as any).toObject ? (npc as any).toObject() : npc,
        trustLevel: trust?.trustLevel || 0,
        interactionCount: trust?.interactionCount || 0,
        locationId: location._id.toString(),
        locationName: location.name
      });
    }

    // Get NPCs from buildings in this location
    const buildings = await Location.find({ parentId: location._id });
    for (const building of buildings) {
      for (const npc of building.npcs) {
        const trust = characterId
          ? await NPCTrust.findOne({ characterId, npcId: npc.id })
          : null;

        allNPCs.push({
          ...(npc as any).toObject ? (npc as any).toObject() : npc,
          trustLevel: trust?.trustLevel || 0,
          interactionCount: trust?.interactionCount || 0,
          locationId: building._id.toString(),
          locationName: `${location.name} - ${building.name}`
        });
      }
    }

    return allNPCs;
  }

  /**
   * Get a specific NPC by ID
   */
  static async getNPCById(npcId: string): Promise<LocationNPC | null> {
    // Search all locations for this NPC
    const location = await Location.findOne({ 'npcs.id': npcId });
    if (location) {
      const npc = location.npcs.find(n => n.id === npcId);
      return npc || null;
    }
    return null;
  }

  /**
   * Find location containing NPC
   */
  static async findLocationWithNPC(npcId: string): Promise<ILocation | null> {
    return Location.findOne({ 'npcs.id': npcId });
  }

  /**
   * Interact with an NPC
   * Triggers quests, returns dialogue, increases trust
   */
  static async interactWithNPC(
    characterId: string,
    locationId: string,
    npcId: string
  ): Promise<NPCInteractionResult> {
    // Get character
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Get location
    const location = await Location.findById(locationId);
    if (!location) {
      throw new AppError('Location not found', 404);
    }

    // Find NPC in location
    const npc = location.npcs.find(n => n.id === npcId);
    if (!npc) {
      throw new AppError('NPC not found at this location', 404);
    }

    // Get current trust
    const oldTrustLevel = await NPCTrust.getTrustLevel(characterId, npcId);
    const oldTier = this.getTrustTier(oldTrustLevel);

    // Calculate trust increase
    // Base: +2, +1 for low trust (<20), +faction bonus
    let trustIncrease = 2;
    if (oldTrustLevel < 20) trustIncrease += 1;

    // Faction bonus: +2 if NPC and character share faction
    if (npc.faction && character.faction === npc.faction) {
      trustIncrease += 2;
    }

    // Update trust
    const trust = await NPCTrust.incrementTrust(characterId, npcId, trustIncrease);
    const newTier = this.getTrustTier(trust.trustLevel);

    // Trigger NPC interaction for quest system
    await QuestService.onNPCInteraction(characterId, npcId);

    // Get available quests from this NPC
    const availableQuests = await this.getQuestsFromNPC(npcId, characterId);

    // Get dialogue based on trust tier
    const dialogue = this.getDialogueForTier(npc, newTier, character);

    // Check for unlocked secrets
    const unlockedSecrets = await this.checkSecretUnlocks(
      characterId,
      npcId,
      location,
      trust.trustLevel,
      oldTrustLevel
    );

    // Get cross-references and gossip
    const crossReferences = await this.getCrossReferences(npcId, trust.trustLevel);
    const gossip = await GossipService.getGossip(npcId, characterId);

    // Build result
    const result: NPCInteractionResult = {
      npc: {
        ...((npc as any).toObject ? (npc as any).toObject() : npc),
        trustLevel: trust.trustLevel,
        interactionCount: trust.interactionCount,
        locationId: location._id.toString(),
        locationName: location.name
      },
      dialogue,
      availableQuests,
      trustLevel: trust.trustLevel,
      trustIncrease,
      unlockedSecrets: unlockedSecrets.length > 0 ? unlockedSecrets : undefined,
      newTrustTier: oldTier !== newTier ? newTier : undefined,
      gossip: gossip.gossip.length > 0 ? gossip.gossip : undefined,
      crossReferences: crossReferences.length > 0 ? crossReferences : undefined
    };

    return result;
  }

  /**
   * Get dialogue for NPC based on trust tier
   */
  private static getDialogueForTier(
    npc: LocationNPC,
    tier: TrustTier,
    character: ICharacter
  ): string[] {
    const allDialogue = npc.dialogue || [];
    if (allDialogue.length === 0) {
      return ['...'];
    }

    // Filter dialogue based on trust tier
    // Higher tier = more dialogue lines available
    let availableCount = 1;
    switch (tier) {
      case TrustTier.STRANGER:
        availableCount = Math.ceil(allDialogue.length * 0.3);
        break;
      case TrustTier.ACQUAINTANCE:
        availableCount = Math.ceil(allDialogue.length * 0.5);
        break;
      case TrustTier.FRIEND:
        availableCount = Math.ceil(allDialogue.length * 0.7);
        break;
      case TrustTier.TRUSTED:
        availableCount = Math.ceil(allDialogue.length * 0.9);
        break;
      case TrustTier.CONFIDANT:
        availableCount = allDialogue.length;
        break;
    }

    // Return random selection from available dialogue
    const available = allDialogue.slice(0, availableCount);
    const selectedCount = Math.min(3, available.length);
    const shuffled = available.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, selectedCount);
  }

  /**
   * Check if trust level unlocked any secrets
   */
  private static async checkSecretUnlocks(
    characterId: string,
    npcId: string,
    location: ILocation,
    newTrustLevel: number,
    oldTrustLevel: number
  ): Promise<SecretContent[]> {
    if (!location.secrets || location.secrets.length === 0) {
      return [];
    }

    const unlockedSecrets: SecretContent[] = [];
    const alreadyUnlocked = await NPCTrust.getUnlockedSecrets(characterId, npcId);

    for (const secret of location.secrets) {
      // Skip if already unlocked
      if (alreadyUnlocked.includes(secret.id)) {
        continue;
      }

      // Check if this secret requires NPC trust
      if (
        secret.unlockCondition?.npcTrust &&
        secret.unlockCondition.npcTrust.npcId === npcId
      ) {
        const requiredTrust = secret.unlockCondition.npcTrust.level || 0;

        // Check if we just crossed the threshold
        if (newTrustLevel >= requiredTrust && oldTrustLevel < requiredTrust) {
          unlockedSecrets.push(secret);
          // Record that we unlocked this secret
          await NPCTrust.addUnlockedSecret(characterId, npcId, secret.id);
        }
      }
    }

    return unlockedSecrets;
  }

  /**
   * Get quests available from an NPC for this character
   */
  static async getQuestsFromNPC(
    npcId: string,
    characterId: string
  ): Promise<IQuestDefinition[]> {
    // Get character
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Get all available quests for character
    const availableQuests = await QuestService.getAvailableQuests(characterId);

    // Filter to quests offered by this NPC
    // Quest IDs should follow pattern: npc:{npcId}:questName
    // Or quests can have npcId in their metadata
    const npcQuests = availableQuests.filter(quest => {
      // Check if quest ID contains NPC ID
      if (quest.questId.includes(`npc:${npcId}`)) {
        return true;
      }
      // Could also check quest metadata if we add npcId field
      return false;
    });

    return npcQuests;
  }

  /**
   * Modify NPC trust level for a character
   */
  static async modifyTrust(
    characterId: string,
    npcId: string,
    amount: number
  ): Promise<INPCTrust> {
    return NPCTrust.incrementTrust(characterId, npcId, amount);
  }

  /**
   * Get character's trust level with an NPC
   */
  static async getTrustLevel(characterId: string, npcId: string): Promise<number> {
    return NPCTrust.getTrustLevel(characterId, npcId);
  }

  /**
   * Get all NPC trusts for a character
   */
  static async getCharacterTrusts(characterId: string): Promise<INPCTrust[]> {
    return NPCTrust.getCharacterTrusts(characterId);
  }

  /**
   * Get NPC trust info including location
   */
  static async getNPCTrustWithDetails(
    characterId: string,
    npcId: string
  ): Promise<NPCWithTrust | null> {
    const location = await this.findLocationWithNPC(npcId);
    if (!location) {
      return null;
    }

    const npc = location.npcs.find(n => n.id === npcId);
    if (!npc) {
      return null;
    }

    const trust = await NPCTrust.findOne({ characterId, npcId });

    return {
      ...((npc as any).toObject ? (npc as any).toObject() : npc),
      trustLevel: trust?.trustLevel || 0,
      interactionCount: trust?.interactionCount || 0,
      locationId: location._id.toString(),
      locationName: location.name
    };
  }

  /**
   * Get cross-references (NPC mentions of other NPCs)
   */
  private static async getCrossReferences(
    npcId: string,
    trustLevel: number
  ): Promise<string[]> {
    const crossReferences: string[] = [];

    // Get relationships for this NPC
    const relationships = await NPCRelationship.findPublicRelationships(npcId);

    // Filter by gossipable and trust level
    const gossipableRelationships = relationships.filter(
      rel => rel.canGossipAbout && (rel.gossipTrustRequired || 0) <= trustLevel
    );

    // Generate cross-reference dialogue for up to 3 relationships
    const selectedRelationships = gossipableRelationships
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    for (const rel of selectedRelationships) {
      const reference = this.generateCrossReference(rel, npcId);
      if (reference) {
        crossReferences.push(reference);
      }
    }

    return crossReferences;
  }

  /**
   * Generate cross-reference dialogue from relationship
   */
  private static generateCrossReference(
    relationship: any,
    speakingNpcId: string
  ): string | null {
    const isSubject = relationship.npcId === speakingNpcId;
    const subjectNpcId = isSubject ? relationship.relatedNpcId : relationship.npcId;

    // Get opinion-based template
    const sentiment = relationship.sentiment;
    let template: string;

    if (sentiment > 5) {
      // Positive
      const templates = CROSS_REFERENCE_TEMPLATES.recommendation;
      template = templates[Math.floor(Math.random() * templates.length)];
    } else if (sentiment < -5) {
      // Negative
      const templates = CROSS_REFERENCE_TEMPLATES.warning;
      template = templates[Math.floor(Math.random() * templates.length)];
    } else if (relationship.canGossipAbout) {
      // Neutral gossip
      const templates = CROSS_REFERENCE_TEMPLATES.mention;
      template = templates[Math.floor(Math.random() * templates.length)];
    } else {
      return null;
    }

    // Fill template
    const relationshipName = this.getRelationshipName(relationship.relationshipType);
    const detail = relationship.history || 'They\'re good people.';

    return template
      .replace('{subject}', subjectNpcId)
      .replace('{relationship}', relationshipName)
      .replace('{detail}', detail)
      .replace('{location}', 'their usual spot');
  }

  /**
   * Get readable relationship name
   */
  private static getRelationshipName(relationshipType: string): string {
    const names: Record<string, string> = {
      family: 'family member',
      friend: 'friend',
      enemy: 'enemy',
      rival: 'rival',
      employer: 'employee',
      employee: 'boss',
      mentor: 'student',
      student: 'mentor',
      lover: 'partner',
      business_partner: 'business partner',
      criminal_associate: 'associate'
    };

    return names[relationshipType] || 'acquaintance';
  }
}
