/**
 * Encounter Service
 * API client for random encounter operations during travel
 */

import api from './api';

// ===== Types =====

export type EncounterType = 'combat' | 'loot' | 'npc' | 'event' | 'ambush' | 'treasure' | 'mystery' | 'danger';

export type EncounterOutcome = 'success' | 'failure' | 'escaped' | 'skipped' | 'neutral';

export interface Encounter {
  _id: string;
  characterId: string;
  type: EncounterType;
  title: string;
  description: string;
  imageUrl?: string;
  choices: EncounterChoice[];
  status: 'active' | 'resolved' | 'expired';
  locationId?: string;
  locationName?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
}

export interface EncounterChoice {
  id: string;
  text: string;
  description?: string;
  requirements?: EncounterRequirements;
  consequences?: EncounterConsequences;
  difficulty?: number;
  icon?: string;
}

export interface EncounterRequirements {
  level?: number;
  gold?: number;
  energy?: number;
  items?: Array<{
    itemId: string;
    quantity: number;
  }>;
  skills?: Record<string, number>;
  faction?: string;
  reputation?: number;
}

export interface EncounterConsequences {
  goldChange?: number;
  energyChange?: number;
  healthChange?: number;
  experienceGain?: number;
  itemsGained?: Array<{
    itemId: string;
    name: string;
    quantity: number;
  }>;
  itemsLost?: Array<{
    itemId: string;
    quantity: number;
  }>;
  reputationChange?: number;
  combatId?: string;
  nextLocation?: string;
}

export interface EncounterResult {
  outcome: EncounterOutcome;
  title: string;
  message: string;
  consequences: EncounterConsequences;
  rewards?: EncounterRewards;
  combatId?: string;
  nextEncounterId?: string;
}

export interface EncounterRewards {
  experience: number;
  gold?: number;
  items?: Array<{
    itemId: string;
    name: string;
    quantity: number;
    rarity: string;
  }>;
  reputation?: number;
  skillProgress?: Record<string, number>;
}

export interface FleeResult {
  success: boolean;
  message: string;
  consequences?: {
    energyLost?: number;
    goldLost?: number;
    reputationLost?: number;
  };
}

// ===== Request/Response Types =====

export interface GetActiveEncounterResponse {
  encounter: Encounter | null;
}

export interface ResolveEncounterRequest {
  choice: string;
}

export interface ResolveEncounterResponse {
  result: EncounterResult;
  character: {
    gold: number;
    energy: number;
    health: number;
    experience: number;
  };
}

export interface FleeEncounterResponse {
  result: FleeResult;
  character: {
    energy: number;
    gold: number;
  };
}

// ===== Encounter Service =====

export const encounterService = {
  /**
   * Get active encounter
   * GET /api/encounters/active
   */
  async getActiveEncounter(): Promise<Encounter | null> {
    const response = await api.get<{ data: GetActiveEncounterResponse }>('/encounters/active');
    return response.data.data.encounter;
  },

  /**
   * Resolve encounter with a choice
   * POST /api/encounters/resolve
   */
  async resolveEncounter(choice: string): Promise<ResolveEncounterResponse> {
    const response = await api.post<{ data: ResolveEncounterResponse }>('/encounters/resolve', { choice });
    return response.data.data;
  },

  /**
   * Attempt to flee from combat encounter
   * POST /api/encounters/flee
   */
  async fleeEncounter(): Promise<FleeEncounterResponse> {
    const response = await api.post<{ data: FleeEncounterResponse }>('/encounters/flee');
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Check if character has an active encounter
   */
  async hasActiveEncounter(): Promise<boolean> {
    const encounter = await this.getActiveEncounter();
    return encounter !== null && encounter.status === 'active';
  },

  /**
   * Check if a choice meets requirements
   */
  meetsRequirements(
    choice: EncounterChoice,
    character: {
      level: number;
      gold: number;
      energy: number;
      skills?: Record<string, number>;
    }
  ): boolean {
    if (!choice.requirements) return true;

    const reqs = choice.requirements;

    // Level check
    if (reqs.level && character.level < reqs.level) return false;

    // Resource checks
    if (reqs.gold && character.gold < reqs.gold) return false;
    if (reqs.energy && character.energy < reqs.energy) return false;

    // Skill checks
    if (reqs.skills && character.skills) {
      for (const [skill, required] of Object.entries(reqs.skills)) {
        if (!character.skills[skill] || character.skills[skill] < required) {
          return false;
        }
      }
    }

    return true;
  },

  /**
   * Get encounter type display name
   */
  getEncounterTypeDisplay(type: EncounterType): string {
    const typeMap: Record<EncounterType, string> = {
      combat: 'Combat',
      loot: 'Treasure',
      npc: 'NPC',
      event: 'Event',
      ambush: 'Ambush',
      treasure: 'Treasure',
      mystery: 'Mystery',
      danger: 'Danger',
    };
    return typeMap[type] || type;
  },

  /**
   * Get encounter type icon
   */
  getEncounterTypeIcon(type: EncounterType): string {
    const iconMap: Record<EncounterType, string> = {
      combat: '⚔️',
      loot: '💰',
      npc: '👤',
      event: '📜',
      ambush: '🗡️',
      treasure: '🏆',
      mystery: '❓',
      danger: '⚠️',
    };
    return iconMap[type] || '🎲';
  },

  /**
   * Get encounter type color
   */
  getEncounterTypeColor(type: EncounterType): string {
    const colorMap: Record<EncounterType, string> = {
      combat: 'red',
      loot: 'gold',
      npc: 'blue',
      event: 'purple',
      ambush: 'darkred',
      treasure: 'yellow',
      mystery: 'gray',
      danger: 'orange',
    };
    return colorMap[type] || 'gray';
  },

  /**
   * Get outcome display
   */
  getOutcomeDisplay(outcome: EncounterOutcome): string {
    const outcomeMap: Record<EncounterOutcome, string> = {
      success: 'Success',
      failure: 'Failure',
      escaped: 'Escaped',
      skipped: 'Skipped',
      neutral: 'Neutral',
    };
    return outcomeMap[outcome] || outcome;
  },

  /**
   * Get outcome color
   */
  getOutcomeColor(outcome: EncounterOutcome): 'green' | 'red' | 'yellow' | 'gray' {
    const colorMap: Record<EncounterOutcome, 'green' | 'red' | 'yellow' | 'gray'> = {
      success: 'green',
      failure: 'red',
      escaped: 'yellow',
      skipped: 'gray',
      neutral: 'yellow',
    };
    return colorMap[outcome] || 'gray';
  },

  /**
   * Calculate total reward value
   */
  calculateRewardValue(rewards: EncounterRewards): number {
    let total = rewards.gold || 0;
    total += rewards.experience * 0.1; // Rough conversion
    return Math.round(total);
  },

  /**
   * Format consequences summary
   */
  formatConsequencesSummary(consequences: EncounterConsequences): string[] {
    const summary: string[] = [];

    if (consequences.goldChange) {
      const sign = consequences.goldChange > 0 ? '+' : '';
      summary.push(`${sign}${consequences.goldChange} Gold`);
    }

    if (consequences.energyChange) {
      const sign = consequences.energyChange > 0 ? '+' : '';
      summary.push(`${sign}${consequences.energyChange} Energy`);
    }

    if (consequences.healthChange) {
      const sign = consequences.healthChange > 0 ? '+' : '';
      summary.push(`${sign}${consequences.healthChange} Health`);
    }

    if (consequences.experienceGain) {
      summary.push(`+${consequences.experienceGain} XP`);
    }

    if (consequences.itemsGained) {
      consequences.itemsGained.forEach((item) => {
        summary.push(`+${item.quantity}x ${item.name}`);
      });
    }

    if (consequences.reputationChange) {
      const sign = consequences.reputationChange > 0 ? '+' : '';
      summary.push(`${sign}${consequences.reputationChange} Reputation`);
    }

    return summary;
  },

  /**
   * Check if encounter is expired
   */
  isExpired(encounter: Encounter): boolean {
    if (!encounter.expiresAt) return false;
    return new Date(encounter.expiresAt) < new Date();
  },

  /**
   * Get time remaining until expiry
   */
  getTimeRemaining(encounter: Encounter): number | null {
    if (!encounter.expiresAt) return null;
    const expiry = new Date(encounter.expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, expiry - now);
  },

  /**
   * Format time remaining
   */
  formatTimeRemaining(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  },
};

export default encounterService;
