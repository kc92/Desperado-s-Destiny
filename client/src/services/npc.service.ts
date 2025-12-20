/**
 * NPC Service
 * API client for NPC interaction operations
 */

import api from './api';
import type { LocationNPC } from '@desperados/shared';

// ===== Types =====

/**
 * Trust tier levels for NPCs
 */
export type TrustTier = 'stranger' | 'acquaintance' | 'friend' | 'trusted' | 'confidant';

/**
 * NPC with trust level information
 */
export interface NPCWithTrust extends LocationNPC {
  trustLevel: number;
  interactionCount: number;
  locationId: string;
  locationName: string;
}

/**
 * Trust information for an NPC
 */
export interface NPCTrust {
  _id: string;
  characterId: string;
  npcId: string;
  trustLevel: number;
  interactionCount: number;
  lastInteraction: string;
  unlockedSecrets: string[];
  createdAt: string;
  updatedAt: string;
  tier?: TrustTier;
}

/**
 * Secret content unlocked through trust
 */
export interface SecretContent {
  id: string;
  title: string;
  content: string;
  type: 'lore' | 'hint' | 'quest' | 'location' | 'item';
  requiredTrust: number;
}

/**
 * Gossip information shared by NPCs
 */
export interface Gossip {
  _id: string;
  type: string;
  content: string;
  sourceNPC?: string;
  targetCharacter?: string;
  timestamp: string;
}

/**
 * Quest definition from backend
 */
export interface QuestDefinition {
  _id: string;
  questId: string;
  name: string;
  description: string;
  type: string;
  difficulty: string;
  level: number;
  requirements?: {
    level?: number;
    faction?: string;
    reputation?: number;
    completedQuests?: string[];
    items?: string[];
  };
  rewards: {
    experience?: number;
    gold?: number;
    reputation?: number;
    items?: Array<{
      itemId: string;
      name: string;
      quantity: number;
    }>;
    skillPoints?: number;
    title?: string;
  };
  objectives: Array<{
    id: string;
    description: string;
    type: string;
    target?: string;
    current: number;
    required: number;
    completed: boolean;
  }>;
}

/**
 * NPC interaction result
 */
export interface NPCInteractionResult {
  npc: NPCWithTrust;
  dialogue: string[];
  availableQuests: QuestDefinition[];
  trustLevel: number;
  trustIncrease: number;
  unlockedSecrets?: SecretContent[];
  newTrustTier?: TrustTier;
  gossip?: Gossip[];
  crossReferences?: string[];
}

// ===== Request/Response Types =====

/**
 * Response for getting NPCs at a location
 */
export interface GetNPCsAtLocationResponse {
  npcs: NPCWithTrust[];
}

/**
 * Response for getting NPC details
 */
export interface GetNPCDetailsResponse {
  npc: NPCWithTrust & {
    secrets?: SecretContent[];
    relationships?: Array<{
      npcId: string;
      relationship: string;
    }>;
  };
}

/**
 * Response for interacting with an NPC
 */
export interface InteractWithNPCResponse {
  interaction: NPCInteractionResult;
  character: any; // Updated character object
}

/**
 * Response for getting quests from an NPC
 */
export interface GetQuestsFromNPCResponse {
  quests: QuestDefinition[];
}

/**
 * Response for getting NPC trust level
 */
export interface GetNPCTrustResponse {
  npcId: string;
  trustLevel: number;
  tier: TrustTier;
}

/**
 * Response for getting all character trusts
 */
export interface GetCharacterTrustsResponse {
  trusts: NPCTrust[];
}

// ===== NPC Service =====

export const npcService = {
  // ===== Authenticated Routes =====

  /**
   * Get all character's NPC trusts
   * GET /api/npcs/trusts
   */
  async getCharacterTrusts(): Promise<GetCharacterTrustsResponse> {
    const response = await api.get<{ data: GetCharacterTrustsResponse }>('/npcs/trusts');
    return response.data.data;
  },

  /**
   * Get NPCs at a specific location
   * GET /api/npcs/location/:locationId
   */
  async getNPCsAtLocation(locationId: string): Promise<GetNPCsAtLocationResponse> {
    const response = await api.get<{ data: GetNPCsAtLocationResponse }>(
      `/npcs/location/${locationId}`
    );
    return response.data.data;
  },

  /**
   * Get specific NPC details
   * GET /api/npcs/:npcId
   */
  async getNPCDetails(npcId: string): Promise<GetNPCDetailsResponse> {
    const response = await api.get<{ data: GetNPCDetailsResponse }>(`/npcs/${npcId}`);
    return response.data.data;
  },

  /**
   * Interact with an NPC
   * POST /api/npcs/:npcId/interact
   */
  async interactWithNPC(npcId: string): Promise<InteractWithNPCResponse> {
    const response = await api.post<{ data: InteractWithNPCResponse }>(
      `/npcs/${npcId}/interact`
    );
    return response.data.data;
  },

  /**
   * Get available quests from an NPC
   * GET /api/npcs/:npcId/quests
   */
  async getQuestsFromNPC(npcId: string): Promise<GetQuestsFromNPCResponse> {
    const response = await api.get<{ data: GetQuestsFromNPCResponse }>(`/npcs/${npcId}/quests`);
    return response.data.data;
  },

  /**
   * Get trust level with an NPC
   * GET /api/npcs/:npcId/trust
   */
  async getNPCTrust(npcId: string): Promise<GetNPCTrustResponse> {
    const response = await api.get<{ data: GetNPCTrustResponse }>(`/npcs/${npcId}/trust`);
    return response.data.data;
  },

  // ===== Helper Methods =====

  /**
   * Get trust tier from trust level value
   */
  getTrustTier(trustLevel: number): TrustTier {
    if (trustLevel >= 80) return 'confidant';
    if (trustLevel >= 60) return 'trusted';
    if (trustLevel >= 40) return 'friend';
    if (trustLevel >= 20) return 'acquaintance';
    return 'stranger';
  },

  /**
   * Get trust tier display name
   */
  getTrustTierName(tier: TrustTier): string {
    const names: Record<TrustTier, string> = {
      stranger: 'Stranger',
      acquaintance: 'Acquaintance',
      friend: 'Friend',
      trusted: 'Trusted',
      confidant: 'Confidant',
    };
    return names[tier];
  },

  /**
   * Get trust tier color for UI
   */
  getTrustTierColor(tier: TrustTier): string {
    const colors: Record<TrustTier, string> = {
      stranger: '#6b7280', // gray
      acquaintance: '#10b981', // green
      friend: '#3b82f6', // blue
      trusted: '#8b5cf6', // purple
      confidant: '#f59e0b', // amber
    };
    return colors[tier];
  },

  /**
   * Get minimum trust level required for a tier
   */
  getTierMinTrust(tier: TrustTier): number {
    const minimums: Record<TrustTier, number> = {
      stranger: 0,
      acquaintance: 20,
      friend: 40,
      trusted: 60,
      confidant: 80,
    };
    return minimums[tier];
  },

  /**
   * Get trust progress to next tier (0-100)
   */
  getTrustProgressToNextTier(trustLevel: number): {
    current: number;
    max: number;
    percentage: number;
    nextTier: TrustTier | null;
  } {
    const currentTier = npcService.getTrustTier(trustLevel);
    const currentMin = npcService.getTierMinTrust(currentTier);

    const tierOrder: TrustTier[] = ['stranger', 'acquaintance', 'friend', 'trusted', 'confidant'];
    const currentIndex = tierOrder.indexOf(currentTier);
    const nextTier = currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;

    if (!nextTier) {
      // Already at max tier
      return {
        current: 100,
        max: 100,
        percentage: 100,
        nextTier: null,
      };
    }

    const nextMin = npcService.getTierMinTrust(nextTier);
    const current = trustLevel - currentMin;
    const max = nextMin - currentMin;
    const percentage = Math.round((current / max) * 100);

    return {
      current,
      max,
      percentage,
      nextTier,
    };
  },

  /**
   * Filter NPCs by minimum trust level
   */
  filterByTrustLevel(npcs: NPCWithTrust[], minTrustLevel: number): NPCWithTrust[] {
    return npcs.filter((npc) => npc.trustLevel >= minTrustLevel);
  },

  /**
   * Filter NPCs by trust tier
   */
  filterByTrustTier(npcs: NPCWithTrust[], tier: TrustTier): NPCWithTrust[] {
    const minTrust = npcService.getTierMinTrust(tier);
    const tierOrder: TrustTier[] = ['stranger', 'acquaintance', 'friend', 'trusted', 'confidant'];
    const tierIndex = tierOrder.indexOf(tier);
    const maxTrust =
      tierIndex < tierOrder.length - 1 ? npcService.getTierMinTrust(tierOrder[tierIndex + 1]) : 101;

    return npcs.filter((npc) => npc.trustLevel >= minTrust && npc.trustLevel < maxTrust);
  },

  /**
   * Sort NPCs by trust level
   */
  sortByTrustLevel(npcs: NPCWithTrust[], ascending = false): NPCWithTrust[] {
    return [...npcs].sort((a, b) =>
      ascending ? a.trustLevel - b.trustLevel : b.trustLevel - a.trustLevel
    );
  },

  /**
   * Sort NPCs by interaction count
   */
  sortByInteractionCount(npcs: NPCWithTrust[], ascending = false): NPCWithTrust[] {
    return [...npcs].sort((a, b) =>
      ascending ? a.interactionCount - b.interactionCount : b.interactionCount - a.interactionCount
    );
  },

  /**
   * Get NPCs by role
   */
  filterByRole(npcs: NPCWithTrust[], role: string): NPCWithTrust[] {
    return npcs.filter((npc) => npc.role === role);
  },

  /**
   * Get quest giver NPCs
   */
  getQuestGivers(npcs: NPCWithTrust[]): NPCWithTrust[] {
    return npcs.filter((npc) => npc.role === 'quest_giver' || npc.offersQuests);
  },

  /**
   * Get merchant NPCs
   */
  getMerchants(npcs: NPCWithTrust[]): NPCWithTrust[] {
    return npcs.filter((npc) => npc.role === 'merchant' || npc.role === 'shopkeeper');
  },

  /**
   * Get trainer NPCs
   */
  getTrainers(npcs: NPCWithTrust[]): NPCWithTrust[] {
    return npcs.filter((npc) => npc.role === 'trainer' || npc.role === 'skill_trainer');
  },

  /**
   * Check if NPC has unlockable secrets at current trust level
   */
  hasUnlockableSecrets(npc: NPCWithTrust, secrets?: SecretContent[]): boolean {
    if (!secrets || secrets.length === 0) return false;
    return secrets.some((secret) => secret.requiredTrust <= npc.trustLevel);
  },

  /**
   * Get available secrets at current trust level
   */
  getAvailableSecrets(trustLevel: number, secrets: SecretContent[]): SecretContent[] {
    return secrets.filter((secret) => secret.requiredTrust <= trustLevel);
  },

  /**
   * Get locked secrets (not yet unlocked)
   */
  getLockedSecrets(trustLevel: number, secrets: SecretContent[]): SecretContent[] {
    return secrets.filter((secret) => secret.requiredTrust > trustLevel);
  },

  /**
   * Calculate trust increase estimate based on current tier
   */
  estimateTrustIncrease(currentTrustLevel: number): number {
    // Trust increases decrease as you get closer to 100
    if (currentTrustLevel >= 80) return 1; // Confidant tier
    if (currentTrustLevel >= 60) return 2; // Trusted tier
    if (currentTrustLevel >= 40) return 3; // Friend tier
    if (currentTrustLevel >= 20) return 4; // Acquaintance tier
    return 5; // Stranger tier
  },
};

export default npcService;
