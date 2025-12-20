/**
 * Companion Service
 * API client for the animal companion system
 */

import api from './api';

// ===== Types =====

export enum CompanionCategory {
  DOG = 'DOG',
  BIRD = 'BIRD',
  EXOTIC = 'EXOTIC',
  SUPERNATURAL = 'SUPERNATURAL'
}

export enum CompanionSpecies {
  // Dogs
  AUSTRALIAN_SHEPHERD = 'AUSTRALIAN_SHEPHERD',
  CATAHOULA_LEOPARD_DOG = 'CATAHOULA_LEOPARD_DOG',
  BLOODHOUND = 'BLOODHOUND',
  GERMAN_SHEPHERD = 'GERMAN_SHEPHERD',
  COLLIE = 'COLLIE',
  PITBULL = 'PITBULL',
  COYDOG = 'COYDOG',
  WOLF_HYBRID = 'WOLF_HYBRID',
  // Birds
  RED_TAILED_HAWK = 'RED_TAILED_HAWK',
  GOLDEN_EAGLE = 'GOLDEN_EAGLE',
  RAVEN = 'RAVEN',
  // Exotic
  RACCOON = 'RACCOON',
  FERRET = 'FERRET',
  MOUNTAIN_LION = 'MOUNTAIN_LION',
  WOLF = 'WOLF',
  BEAR_CUB = 'BEAR_CUB',
  COYOTE = 'COYOTE',
  // Supernatural
  GHOST_HOUND = 'GHOST_HOUND',
  SKINWALKER_GIFT = 'SKINWALKER_GIFT',
  THUNDERBIRD_FLEDGLING = 'THUNDERBIRD_FLEDGLING',
  CHUPACABRA = 'CHUPACABRA'
}

export enum TrustLevel {
  WILD = 'WILD',
  WARY = 'WARY',
  FAMILIAR = 'FAMILIAR',
  TRUSTED = 'TRUSTED',
  DEVOTED = 'DEVOTED'
}

export enum CompanionCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  CRITICAL = 'CRITICAL'
}

export enum CombatRole {
  ATTACKER = 'ATTACKER',
  DEFENDER = 'DEFENDER',
  SUPPORT = 'SUPPORT',
  SCOUT = 'SCOUT'
}

export enum AcquisitionMethod {
  PURCHASE = 'PURCHASE',
  TAMED = 'TAMED',
  GIFT = 'GIFT',
  QUEST = 'QUEST',
  BRED = 'BRED',
  RESCUED = 'RESCUED',
  SUPERNATURAL = 'SUPERNATURAL'
}

export interface CompanionAbility {
  id: string;
  name: string;
  description: string;
  power: number;
  cooldown?: number;
  energyCost?: number;
  learnLevel: number;
}

export interface Companion {
  _id: string;
  characterId: string;
  species: CompanionSpecies;
  category: CompanionCategory;
  name: string;
  nickname?: string;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  happiness: number;
  hunger: number;
  trust: number;
  trustLevel: TrustLevel;
  condition: CompanionCondition;
  abilities: CompanionAbility[];
  combatRole: CombatRole;
  combatStats: {
    attackPower: number;
    defensePower: number;
  };
  utilityStats: {
    trackingBonus: number;
    huntingBonus: number;
    guardBonus: number;
    socialBonus: number;
  };
  isActive: boolean;
  acquisitionMethod: AcquisitionMethod;
  acquiredAt: string;
  lastFed?: string;
  lastHealed?: string;
  isInTraining?: boolean;
  trainingEndsAt?: string;
}

export interface ShopCompanion {
  species: CompanionSpecies;
  category: CompanionCategory;
  name: string;
  description: string;
  flavorText: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  price: number;
  levelRequired: number;
  combatRole: CombatRole;
  baseStats: {
    health: number;
    attackPower: number;
    defensePower: number;
  };
  abilities: string[];
}

export interface WildEncounter {
  species: CompanionSpecies;
  location: string;
  tameable: boolean;
  hostility: number;
  difficulty: number;
  description: string;
}

export interface TamingProgress {
  species: CompanionSpecies;
  attempts: number;
  maxAttempts: number;
  currentProgress: number;
  lastAttemptAt?: string;
  bonusApplied?: number;
}

export interface CareTask {
  type: 'feed' | 'heal' | 'play' | 'groom';
  companionId: string;
  companionName: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

// ===== Request/Response Types =====

export interface GetCompanionsResponse {
  success: boolean;
  companions: Companion[];
  activeCompanion?: Companion;
}

export interface GetShopResponse {
  success: boolean;
  companions: ShopCompanion[];
}

export interface PurchaseCompanionRequest {
  species: CompanionSpecies;
  nickname?: string;
}

export interface PurchaseCompanionResponse {
  success: boolean;
  companion?: Companion;
  message: string;
  goldSpent?: number;
}

export interface ActivateCompanionResponse {
  success: boolean;
  companion?: Companion;
  previousActive?: Companion;
  message: string;
}

export interface RenameCompanionRequest {
  nickname: string;
}

export interface RenameCompanionResponse {
  success: boolean;
  message: string;
}

export interface FeedCompanionResponse {
  success: boolean;
  hungerRestored?: number;
  happinessGained?: number;
  goldSpent?: number;
  message: string;
}

export interface HealCompanionResponse {
  success: boolean;
  healthRestored?: number;
  goldSpent?: number;
  message: string;
}

export interface StartTrainingRequest {
  abilityId: string;
}

export interface StartTrainingResponse {
  success: boolean;
  trainingEndsAt?: string;
  message: string;
}

export interface CompleteTrainingResponse {
  success: boolean;
  abilityLearned?: CompanionAbility;
  message: string;
}

export interface AttemptTamingRequest {
  species: CompanionSpecies;
  location: string;
  useItem?: string;
}

export interface AttemptTamingResponse {
  success: boolean;
  tamed: boolean;
  companion?: Companion;
  progress?: TamingProgress;
  fled?: boolean;
  message: string;
}

export interface GetCombatStatsResponse {
  success: boolean;
  companion?: Companion;
  combatBonus: {
    attackBonus: number;
    defenseBonus: number;
    specialAbility?: string;
  };
}

export interface UseAbilityRequest {
  abilityId: string;
  targetId?: string;
}

export interface UseAbilityResponse {
  success: boolean;
  effect?: {
    type: string;
    value: number;
    target?: string;
  };
  cooldownEndsAt?: string;
  message: string;
}

// ===== Companion Service =====

export const companionService = {
  /**
   * Get all companions for the character
   */
  async getCompanions(): Promise<GetCompanionsResponse> {
    const response = await api.get<{ data: GetCompanionsResponse }>('/companions');
    return response.data.data;
  },

  /**
   * Get companion shop listings
   */
  async getShop(): Promise<ShopCompanion[]> {
    const response = await api.get<{ data: { companions: ShopCompanion[] } }>('/companions/shop');
    return response.data.data?.companions || [];
  },

  /**
   * Purchase a companion from the shop
   */
  async purchaseCompanion(species: CompanionSpecies, nickname?: string): Promise<PurchaseCompanionResponse> {
    const response = await api.post<{ data: PurchaseCompanionResponse }>('/companions/purchase', {
      species,
      nickname,
    });
    return response.data.data;
  },

  /**
   * Activate a companion (set as active)
   */
  async activateCompanion(companionId: string): Promise<ActivateCompanionResponse> {
    const response = await api.post<{ data: ActivateCompanionResponse }>(`/companions/${companionId}/activate`);
    return response.data.data;
  },

  /**
   * Rename a companion
   */
  async renameCompanion(companionId: string, nickname: string): Promise<RenameCompanionResponse> {
    const response = await api.patch<{ data: RenameCompanionResponse }>(`/companions/${companionId}/rename`, {
      nickname,
    });
    return response.data.data;
  },

  /**
   * Release a companion
   */
  async releaseCompanion(companionId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ data: { success: boolean; message: string } }>(`/companions/${companionId}`);
    return response.data.data;
  },

  /**
   * Feed a companion
   */
  async feedCompanion(companionId: string): Promise<FeedCompanionResponse> {
    const response = await api.post<{ data: FeedCompanionResponse }>(`/companions/${companionId}/feed`);
    return response.data.data;
  },

  /**
   * Heal a companion
   */
  async healCompanion(companionId: string): Promise<HealCompanionResponse> {
    const response = await api.post<{ data: HealCompanionResponse }>(`/companions/${companionId}/heal`);
    return response.data.data;
  },

  /**
   * Get care tasks for companions
   */
  async getCareTasks(): Promise<CareTask[]> {
    const response = await api.get<{ data: { tasks: CareTask[] } }>('/companions/care-tasks');
    return response.data.data?.tasks || [];
  },

  /**
   * Start training a companion for a new ability
   */
  async startTraining(companionId: string, abilityId: string): Promise<StartTrainingResponse> {
    const response = await api.post<{ data: StartTrainingResponse }>(`/companions/${companionId}/train`, {
      abilityId,
    });
    return response.data.data;
  },

  /**
   * Complete training for a companion
   */
  async completeTraining(companionId: string): Promise<CompleteTrainingResponse> {
    const response = await api.post<{ data: CompleteTrainingResponse }>(`/companions/${companionId}/complete-training`);
    return response.data.data;
  },

  /**
   * Get wild encounters at current location
   */
  async getWildEncounters(): Promise<WildEncounter[]> {
    const response = await api.get<{ data: { encounters: WildEncounter[] } }>('/companions/wild-encounters');
    return response.data.data?.encounters || [];
  },

  /**
   * Attempt to tame a wild animal
   */
  async attemptTaming(species: CompanionSpecies, location: string, useItem?: string): Promise<AttemptTamingResponse> {
    const response = await api.post<{ data: AttemptTamingResponse }>('/companions/tame', {
      species,
      location,
      useItem,
    });
    return response.data.data;
  },

  /**
   * Get taming progress for a species
   */
  async getTamingProgress(species: CompanionSpecies): Promise<TamingProgress | null> {
    try {
      const response = await api.get<{ data: { progress: TamingProgress | null } }>(`/companions/taming-progress/${species}`);
      return response.data.data?.progress || null;
    } catch {
      return null;
    }
  },

  /**
   * Abandon taming attempt
   */
  async abandonTaming(): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ data: { success: boolean; message: string } }>('/companions/abandon-taming');
    return response.data.data;
  },

  /**
   * Get active companion's combat stats
   */
  async getActiveCompanionCombatStats(): Promise<GetCombatStatsResponse> {
    const response = await api.get<{ data: GetCombatStatsResponse }>('/companions/active/combat-stats');
    return response.data.data;
  },

  /**
   * Use a companion's ability in combat
   */
  async useCompanionAbility(companionId: string, abilityId: string, targetId?: string): Promise<UseAbilityResponse> {
    const response = await api.post<{ data: UseAbilityResponse }>(`/companions/${companionId}/use-ability`, {
      abilityId,
      targetId,
    });
    return response.data.data;
  },

  // ===== Helper Methods =====

  /**
   * Get species display name
   */
  getSpeciesName(species: CompanionSpecies): string {
    return species
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  },

  /**
   * Get category display name
   */
  getCategoryName(category: CompanionCategory): string {
    const names: Record<CompanionCategory, string> = {
      [CompanionCategory.DOG]: 'Dogs',
      [CompanionCategory.BIRD]: 'Birds',
      [CompanionCategory.EXOTIC]: 'Exotic',
      [CompanionCategory.SUPERNATURAL]: 'Supernatural',
    };
    return names[category] || category;
  },

  /**
   * Get category icon
   */
  getCategoryIcon(category: CompanionCategory): string {
    const icons: Record<CompanionCategory, string> = {
      [CompanionCategory.DOG]: '🐕',
      [CompanionCategory.BIRD]: '🦅',
      [CompanionCategory.EXOTIC]: '🦊',
      [CompanionCategory.SUPERNATURAL]: '👻',
    };
    return icons[category] || '🐾';
  },

  /**
   * Get trust level display info
   */
  getTrustLevelInfo(level: TrustLevel): { name: string; color: string } {
    const info: Record<TrustLevel, { name: string; color: string }> = {
      [TrustLevel.WILD]: { name: 'Wild', color: 'text-red-400' },
      [TrustLevel.WARY]: { name: 'Wary', color: 'text-orange-400' },
      [TrustLevel.FAMILIAR]: { name: 'Familiar', color: 'text-yellow-400' },
      [TrustLevel.TRUSTED]: { name: 'Trusted', color: 'text-green-400' },
      [TrustLevel.DEVOTED]: { name: 'Devoted', color: 'text-purple-400' },
    };
    return info[level] || { name: level, color: 'text-white' };
  },

  /**
   * Get condition display info
   */
  getConditionInfo(condition: CompanionCondition): { name: string; color: string } {
    const info: Record<CompanionCondition, { name: string; color: string }> = {
      [CompanionCondition.EXCELLENT]: { name: 'Excellent', color: 'text-green-400' },
      [CompanionCondition.GOOD]: { name: 'Good', color: 'text-blue-400' },
      [CompanionCondition.FAIR]: { name: 'Fair', color: 'text-yellow-400' },
      [CompanionCondition.POOR]: { name: 'Poor', color: 'text-orange-400' },
      [CompanionCondition.CRITICAL]: { name: 'Critical', color: 'text-red-400' },
    };
    return info[condition] || { name: condition, color: 'text-white' };
  },

  /**
   * Get combat role display info
   */
  getCombatRoleInfo(role: CombatRole): { name: string; icon: string } {
    const info: Record<CombatRole, { name: string; icon: string }> = {
      [CombatRole.ATTACKER]: { name: 'Attacker', icon: '⚔️' },
      [CombatRole.DEFENDER]: { name: 'Defender', icon: '🛡️' },
      [CombatRole.SUPPORT]: { name: 'Support', icon: '💫' },
      [CombatRole.SCOUT]: { name: 'Scout', icon: '👁️' },
    };
    return info[role] || { name: role, icon: '🐾' };
  },

  /**
   * Get rarity display info
   */
  getRarityInfo(rarity: string): { name: string; color: string } {
    const info: Record<string, { name: string; color: string }> = {
      common: { name: 'Common', color: 'text-gray-400' },
      uncommon: { name: 'Uncommon', color: 'text-green-400' },
      rare: { name: 'Rare', color: 'text-blue-400' },
      epic: { name: 'Epic', color: 'text-purple-400' },
      legendary: { name: 'Legendary', color: 'text-yellow-400' },
    };
    return info[rarity] || { name: rarity, color: 'text-white' };
  },

  /**
   * Check if companion needs care
   */
  needsCare(companion: Companion): boolean {
    return companion.hunger > 50 || companion.health < companion.maxHealth * 0.7 || companion.happiness < 50;
  },

  /**
   * Get urgency level for companion care
   */
  getCareUrgency(companion: Companion): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    if (companion.health < companion.maxHealth * 0.3 || companion.hunger > 90) return 'critical';
    if (companion.health < companion.maxHealth * 0.5 || companion.hunger > 70) return 'high';
    if (companion.health < companion.maxHealth * 0.7 || companion.hunger > 50) return 'medium';
    if (companion.happiness < 50) return 'low';
    return 'none';
  },
};

export default companionService;
