/**
 * Gathering Service
 * API client for the resource gathering system
 * Phase 7, Wave 7.3 - AAA Crafting System
 */

import api from './api';

// ===== Types =====

export type GatheringType = 'mining' | 'herbalism' | 'woodcutting' | 'foraging' | 'hunting' | 'fishing';

export interface GatheringYield {
  itemId: string;
  name: string;
  minQuantity: number;
  maxQuantity: number;
  chance: number;
  rarity: string;
}

export interface GatheringNode {
  id: string;
  type: GatheringType;
  name: string;
  description: string;
  skillRequired: string;
  levelRequired: number;
  energyCost: number;
  cooldownSeconds: number;
  toolRequired?: string;
  toolBonus?: number;
  yields: Array<{
    name: string;
    rarity: string;
  }>;
}

export interface GatheringCooldown {
  nodeId: string;
  endsAt: string;
  remainingSeconds: number;
}

export interface GatheringLootItem {
  itemId: string;
  name: string;
  quantity: number;
  quality?: 'poor' | 'common' | 'good' | 'excellent';
  rarity?: string;
}

export interface GatheringResult {
  success: boolean;
  message: string;
  loot: GatheringLootItem[];
  xpGained: number;
  skillLevelUp?: {
    skillId: string;
    newLevel: number;
  };
  cooldownEndsAt: string;
  energySpent: number;
}

export interface GatheringRequirements {
  canGather: boolean;
  errors: string[];
  missingRequirements: {
    skillLevel?: { required: number; current: number };
    energy?: { required: number; current: number };
    tool?: string;
  };
  cooldownRemaining?: number;
}

// ===== Response Types =====

interface GetNodesResponse {
  success: boolean;
  data: {
    nodes: GatheringNode[];
    available: string[];
    cooldowns: GatheringCooldown[];
  };
}

interface GetNodeDetailsResponse {
  success: boolean;
  data: {
    node: GatheringNode & {
      locationIds: string[];
      yields: GatheringYield[];
    };
  };
}

interface CheckRequirementsResponse {
  success: boolean;
  data: GatheringRequirements;
}

interface GatherResponse {
  success: boolean;
  data: GatheringResult;
  error?: string;
}

interface GetCooldownsResponse {
  success: boolean;
  data: {
    cooldowns: GatheringCooldown[];
  };
}

// ===== Gathering Service =====

export const gatheringService = {
  /**
   * Get all gathering nodes at current or specified location
   */
  async getNodes(locationId?: string): Promise<{
    nodes: GatheringNode[];
    available: string[];
    cooldowns: GatheringCooldown[];
  }> {
    const url = locationId
      ? `/gathering/nodes?locationId=${encodeURIComponent(locationId)}`
      : '/gathering/nodes';
    const response = await api.get<GetNodesResponse>(url);
    return response.data.data;
  },

  /**
   * Get details for a specific node
   */
  async getNodeDetails(nodeId: string): Promise<GatheringNode & { locationIds: string[] }> {
    const response = await api.get<GetNodeDetailsResponse>(`/gathering/nodes/${nodeId}`);
    return response.data.data.node;
  },

  /**
   * Check if character can gather from a node
   */
  async checkRequirements(nodeId: string): Promise<GatheringRequirements> {
    const response = await api.get<CheckRequirementsResponse>(`/gathering/check/${nodeId}`);
    return response.data.data;
  },

  /**
   * Gather resources from a node
   */
  async gather(nodeId: string): Promise<GatheringResult> {
    const response = await api.post<GatherResponse>('/gathering/gather', { nodeId });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to gather');
    }
    return response.data.data;
  },

  /**
   * Get all active cooldowns
   */
  async getCooldowns(): Promise<GatheringCooldown[]> {
    const response = await api.get<GetCooldownsResponse>('/gathering/cooldowns');
    return response.data.data.cooldowns;
  },

  // ===== Helper Methods =====

  /**
   * Get gathering type display name
   */
  getTypeName(type: GatheringType): string {
    const names: Record<GatheringType, string> = {
      mining: 'Mining',
      herbalism: 'Herbalism',
      woodcutting: 'Woodcutting',
      foraging: 'Foraging',
      hunting: 'Hunting',
      fishing: 'Fishing',
    };
    return names[type] || type;
  },

  /**
   * Get gathering type icon
   */
  getTypeIcon(type: GatheringType): string {
    const icons: Record<GatheringType, string> = {
      mining: '⛏️',  // Pick
      herbalism: '🌿',  // Herb
      woodcutting: '🪓',  // Axe
      foraging: '🔍',  // Magnifying glass
      hunting: '🏹',  // Bow
      fishing: '🎣',  // Fishing pole
    };
    return icons[type] || '📦';
  },

  /**
   * Get skill display name
   */
  getSkillName(skillId: string): string {
    const names: Record<string, string> = {
      mining: 'Mining',
      prospecting: 'Prospecting',
      herbalism: 'Herbalism',
      carpentry: 'Carpentry',
      survival: 'Survival',
    };
    return names[skillId.toLowerCase()] || skillId.charAt(0).toUpperCase() + skillId.slice(1);
  },

  /**
   * Get rarity color class
   */
  getRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
      common: 'text-gray-300',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400',
    };
    return colors[rarity.toLowerCase()] || 'text-gray-300';
  },

  /**
   * Get quality color class
   */
  getQualityColor(quality: string): string {
    const colors: Record<string, string> = {
      poor: 'text-gray-500',
      common: 'text-gray-300',
      good: 'text-green-400',
      excellent: 'text-blue-400',
    };
    return colors[quality.toLowerCase()] || 'text-gray-300';
  },

  /**
   * Format cooldown time
   */
  formatCooldown(seconds: number): string {
    if (seconds <= 0) return 'Ready';

    if (seconds < 60) {
      return `${Math.ceil(seconds)}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const secs = Math.ceil(seconds % 60);

    if (minutes < 60) {
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  },

  /**
   * Check if a node is on cooldown
   */
  isOnCooldown(nodeId: string, cooldowns: GatheringCooldown[]): GatheringCooldown | null {
    return cooldowns.find(c => c.nodeId === nodeId && c.remainingSeconds > 0) || null;
  },

  /**
   * Sort nodes by level requirement
   */
  sortByLevel(nodes: GatheringNode[]): GatheringNode[] {
    return [...nodes].sort((a, b) => a.levelRequired - b.levelRequired);
  },

  /**
   * Filter nodes by type
   */
  filterByType(nodes: GatheringNode[], type: GatheringType): GatheringNode[] {
    return nodes.filter(n => n.type === type);
  },

  /**
   * Group nodes by type
   */
  groupByType(nodes: GatheringNode[]): Record<GatheringType, GatheringNode[]> {
    const groups: Record<GatheringType, GatheringNode[]> = {
      mining: [],
      herbalism: [],
      woodcutting: [],
      foraging: [],
      hunting: [],
      fishing: [],
    };

    for (const node of nodes) {
      if (groups[node.type]) {
        groups[node.type].push(node);
      }
    }

    return groups;
  },
};

export default gatheringService;
