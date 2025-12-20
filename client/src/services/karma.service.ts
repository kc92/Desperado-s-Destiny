/**
 * Karma Service
 * API client for the karma and deity system
 *
 * DEITY SYSTEM - Phase 4
 */

import api from './api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Karma dimension values (-100 to +100 each)
 */
export interface KarmaDimensions {
  mercy: number;
  cruelty: number;
  greed: number;
  charity: number;
  justice: number;
  chaos: number;
  honor: number;
  deception: number;
  survival: number;
  loyalty: number;
}

/**
 * Deity types in the game
 */
export type DeityName = 'GAMBLER' | 'OUTLAW_KING';

/**
 * Manifestation types
 */
export type ManifestationType =
  | 'BLESSING'
  | 'CURSE'
  | 'WARNING'
  | 'OMEN'
  | 'DREAM'
  | 'STRANGER'
  | 'VISION'
  | 'WHISPER';

/**
 * Deity relationship info
 */
export interface DeityRelationship {
  affinity: number;        // -100 to +100
  relationship: string;    // "Blessed", "Favored", "Neutral", "Disfavored", "Cursed"
}

/**
 * Active blessing
 */
export interface Blessing {
  source: DeityName;
  type: string;
  power: number;
  description: string;
  expiresAt: string | null;
  grantedAt: string;
}

/**
 * Active curse
 */
export interface Curse {
  source: DeityName;
  type: string;
  severity: number;
  description: string;
  removalCondition: string;
  expiresAt: string | null;
  inflictedAt: string;
}

/**
 * Divine message from deity
 */
export interface DivineManifestation {
  id: string;
  deityName: DeityName;
  type: ManifestationType;
  disguise?: string;
  location?: string;
  message: string;
  effect?: Record<string, unknown>;
  urgency: number;  // 1-5
  delivered: boolean;
  deliveredAt?: string;
  acknowledged: boolean;
  playerResponse?: string;
  responseAt?: string;
  createdAt: string;
}

/**
 * Dominant trait info
 */
export interface DominantTrait {
  trait: string;
  value: number;
  isPositive: boolean;
}

/**
 * Recent karma action
 */
export interface RecentKarmaAction {
  actionType: string;
  dimension: string;
  delta: number;
  timestamp: string;
  context?: string;
}

/**
 * Full karma summary response from API
 */
export interface KarmaSummary {
  characterId: string;
  karma: KarmaDimensions;
  totalActions: number;
  deityRelationships: {
    gambler: DeityRelationship;
    outlawKing: DeityRelationship;
  };
  dominantTrait: DominantTrait | null;
  moralConflict: string | null;
  activeBlessings: Blessing[];
  activeCurses: Curse[];
  recentActions: RecentKarmaAction[];
}

/**
 * Active effects (gameplay modifiers)
 */
export interface KarmaEffects {
  effects: Record<string, number>;
  blessingCount: number;
  curseCount: number;
}

/**
 * Manifestations query parameters
 */
export interface GetManifestationsParams {
  undelivered?: boolean;
  unacknowledged?: boolean;
  deity?: DeityName;
  type?: ManifestationType;
  limit?: number;
  skip?: number;
}

/**
 * Manifestations response
 */
export interface ManifestationsResponse {
  characterId: string;
  manifestations: DivineManifestation[];
  count: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

interface KarmaApiResponse {
  success: boolean;
  data: KarmaSummary;
}

interface ManifestationsApiResponse {
  success: boolean;
  data: ManifestationsResponse;
}

interface EffectsApiResponse {
  success: boolean;
  data: {
    characterId: string;
    effects: Record<string, number>;
    blessingCount: number;
    curseCount: number;
  };
}

interface AcknowledgeApiResponse {
  success: boolean;
  message: string;
  data: {
    manifestationId: string;
    response: string | null;
    acknowledgedAt: string;
  };
}

interface DeliverApiResponse {
  success: boolean;
  message: string;
  data: {
    manifestationId: string;
    deliveredAt: string;
  };
}

// ============================================================================
// SERVICE
// ============================================================================

export const karmaService = {
  /**
   * Get karma summary for a character
   * @param characterId - Character to get karma for
   */
  async getKarma(characterId: string): Promise<KarmaSummary> {
    const response = await api.get<KarmaApiResponse>(`/karma/${characterId}`);
    return response.data.data;
  },

  /**
   * Get divine manifestations/messages for a character
   * @param characterId - Character to get manifestations for
   * @param params - Query parameters for filtering
   */
  async getManifestations(
    characterId: string,
    params?: GetManifestationsParams
  ): Promise<ManifestationsResponse> {
    const response = await api.get<ManifestationsApiResponse>(
      `/karma/${characterId}/manifestations`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get active karma effects (gameplay modifiers) for a character
   * @param characterId - Character to get effects for
   */
  async getActiveEffects(characterId: string): Promise<KarmaEffects> {
    const response = await api.get<EffectsApiResponse>(`/karma/${characterId}/effects`);
    return response.data.data;
  },

  /**
   * Acknowledge a divine manifestation
   * @param manifestationId - Manifestation to acknowledge
   * @param playerResponse - Optional response to the deity
   */
  async acknowledgeManifestation(
    manifestationId: string,
    playerResponse?: string
  ): Promise<void> {
    await api.post<AcknowledgeApiResponse>(
      `/karma/manifestations/${manifestationId}/acknowledge`,
      { response: playerResponse }
    );
  },

  /**
   * Mark a manifestation as delivered (shown to player)
   * @param manifestationId - Manifestation to mark as delivered
   */
  async markDelivered(manifestationId: string): Promise<void> {
    await api.post<DeliverApiResponse>(
      `/karma/manifestations/${manifestationId}/deliver`
    );
  },

  // =========================================================================
  // HELPER FUNCTIONS
  // =========================================================================

  /**
   * Get a descriptive string for an affinity value
   * @param affinity - Affinity value (-100 to +100)
   */
  getAffinityDescription(affinity: number): string {
    if (affinity >= 75) return 'Blessed';
    if (affinity >= 50) return 'Highly Favored';
    if (affinity >= 25) return 'Favored';
    if (affinity >= 10) return 'Noticed';
    if (affinity >= -10) return 'Neutral';
    if (affinity >= -25) return 'Watched';
    if (affinity >= -50) return 'Disfavored';
    if (affinity >= -75) return 'Scorned';
    return 'Cursed';
  },

  /**
   * Get deity display name
   * @param deity - Deity identifier
   */
  getDeityDisplayName(deity: DeityName): string {
    return deity === 'GAMBLER' ? 'The Gambler' : 'The Outlaw King';
  },

  /**
   * Get deity icon/symbol
   * @param deity - Deity identifier
   */
  getDeityIcon(deity: DeityName): string {
    // Using text symbols for Western theme
    return deity === 'GAMBLER' ? '♠' : '★';
  },

  /**
   * Check if an effect expires soon (within 1 hour)
   * @param expiresAt - Expiration timestamp
   */
  isExpiringSoon(expiresAt: string | null): boolean {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt).getTime();
    const oneHour = 60 * 60 * 1000;
    return expiry - Date.now() < oneHour && expiry > Date.now();
  },

  /**
   * Get time remaining until expiration as formatted string
   * @param expiresAt - Expiration timestamp
   */
  getTimeRemaining(expiresAt: string | null): string {
    if (!expiresAt) return 'Permanent';

    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) return 'Expired';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },

  /**
   * Get karma dimension category (virtue, vice, or neutral)
   * @param dimension - Karma dimension name
   */
  getDimensionCategory(dimension: string): 'virtue' | 'vice' | 'neutral' {
    const virtues = ['mercy', 'charity', 'justice', 'honor', 'loyalty'];
    const vices = ['cruelty', 'greed', 'chaos', 'deception'];

    if (virtues.includes(dimension.toLowerCase())) return 'virtue';
    if (vices.includes(dimension.toLowerCase())) return 'vice';
    return 'neutral';
  },

  /**
   * Get color for karma dimension based on value and category
   * @param dimension - Karma dimension name
   * @param value - Current value
   */
  getDimensionColor(dimension: string, value: number): string {
    const category = this.getDimensionCategory(dimension);

    if (category === 'virtue') {
      return value >= 0 ? 'text-green-400' : 'text-red-400';
    }
    if (category === 'vice') {
      return value >= 0 ? 'text-red-400' : 'text-green-400';
    }
    return 'text-amber-400';
  },

  /**
   * Get blessing icon based on type
   * @param type - Blessing type
   */
  getBlessingIcon(type: string): string {
    const icons: Record<string, string> = {
      'FORTUNE_FAVOR': '♣',
      'RIGHTEOUS_HAND': '⚔',
      'GENTLE_TOUCH': '♥',
      'GAMBLERS_LUCK': '♦',
      'WILD_SPIRIT': '★',
      'UNKILLABLE': '☠',
      'SILVER_TONGUE': '☽',
      'OUTLAWS_FREEDOM': '⚡',
    };
    return icons[type] || '✦';
  },

  /**
   * Get curse icon based on type
   * @param type - Curse type
   */
  getCurseIcon(type: string): string {
    const icons: Record<string, string> = {
      'FATES_DISFAVOR': '☹',
      'MARKED_LIAR': '⊗',
      'UNLUCKY_STREAK': '☠',
      'CHAINS_OF_ORDER': '⛓',
      'FOOLS_MARK': '✗',
      'BRANDED_COWARD': '⚑',
    };
    return icons[type] || '✖';
  },

  /**
   * Get manifestation type display name
   * @param type - Manifestation type
   */
  getManifestationTypeDisplay(type: ManifestationType): string {
    const displays: Record<ManifestationType, string> = {
      'BLESSING': 'Divine Blessing',
      'CURSE': 'Divine Curse',
      'WARNING': 'Ominous Warning',
      'OMEN': 'Fateful Omen',
      'DREAM': 'Prophetic Dream',
      'STRANGER': 'Mysterious Stranger',
      'VISION': 'Divine Vision',
      'WHISPER': 'Whispered Secret',
    };
    return displays[type] || type;
  },
};

export default karmaService;
