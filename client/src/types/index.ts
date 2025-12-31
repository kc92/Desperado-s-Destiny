// Core game types for Desperados Destiny
// Re-export shared types for consistency with backend

// Import shared types
import {
  Faction,
  type SafeUser,
  type SafeCharacter,
  type CharacterStats as SharedCharacterStats,
  type CharacterSkill,
  type CharacterCreation,
  type CharacterListItem,
} from '@desperados/shared';

// Re-export shared types
export type {
  SafeUser,
  SafeCharacter,
  CharacterSkill,
  CharacterCreation,
  CharacterListItem,
};
export { Faction };

/**
 * User type - uses SafeUser from shared
 * Adds id alias for compatibility with components using user.id
 */
export interface User extends SafeUser {
  /** Alias for _id for backwards compatibility */
  id?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * FactionType - lowercase alias for Faction enum for display purposes
 * Maps to: SETTLER_ALLIANCE -> 'settler', NAHI_COALITION -> 'nahi', FRONTERA -> 'frontera'
 */
export type FactionType = 'settler' | 'nahi' | 'frontera';

/** Convert Faction enum to display string */
export const factionToDisplay = (faction: Faction): FactionType => {
  switch (faction) {
    case Faction.SETTLER_ALLIANCE: return 'settler';
    case Faction.NAHI_COALITION: return 'nahi';
    case Faction.FRONTERA: return 'frontera';
    default: return 'settler';
  }
};

/** Convert display string to Faction enum */
export const displayToFaction = (display: FactionType): Faction => {
  switch (display) {
    case 'settler': return Faction.SETTLER_ALLIANCE;
    case 'nahi': return Faction.NAHI_COALITION;
    case 'frontera': return Faction.FRONTERA;
    default: return Faction.SETTLER_ALLIANCE;
  }
};

/**
 * Character type - extends SafeCharacter with client-side helpers
 * Note: Backend returns flat energy/maxEnergy, not nested object
 */
export interface Character extends SafeCharacter {
  /** Alias for _id for backwards compatibility */
  id?: string;
  /** Current location (alias for currentLocation) */
  location?: string;
}

/**
 * CharacterStats - re-export from shared
 * Has: cunning, spirit, combat, craft
 */
export type CharacterStats = SharedCharacterStats;

/**
 * Legacy CharacterStats mapping for old components
 * @deprecated Use CharacterStats from shared instead
 */
export interface LegacyCharacterStats {
  grit: number;
  cunning: number;
  spirit: number;
  steel: number;
}

/** Convert shared stats to legacy format */
export const statsToLegacy = (stats: CharacterStats): LegacyCharacterStats => ({
  grit: 0, // No direct mapping
  cunning: stats.cunning,
  spirit: stats.spirit,
  steel: stats.combat, // combat -> steel mapping
});

/**
 * CharacterSkills - flexible skill map for UI display
 */
export interface CharacterSkills {
  [key: string]: number;
}

/**
 * Destiny Deck types (Poker-based resolution)
 */
export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface PlayingCard {
  suit: CardSuit;
  rank: CardRank;
  value: number;
}

export interface DestinyDraw {
  cards: PlayingCard[];
  handRank: PokerHandRank;
  difficulty: number;
  success: boolean;
  modifiers: number[];
}

export type PokerHandRank =
  | 'high_card'
  | 'pair'
  | 'two_pair'
  | 'three_of_a_kind'
  | 'straight'
  | 'flush'
  | 'full_house'
  | 'four_of_a_kind'
  | 'straight_flush'
  | 'royal_flush';

/**
 * Game state types
 */
export interface GameState {
  character: Character | null;
  isLoading: boolean;
  error: string | null;
  currentLocation: string | null;
  lastAction: string | null;
}

/**
 * UI types
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  timestamp: string;
}

export interface ModalState {
  isOpen: boolean;
  title: string;
  content: React.ReactNode | null;
  onClose?: () => void;
}

/**
 * API response types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  error?: string;  // Some controllers return 'error' field instead of 'message'
}

/**
 * Component prop types
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Route types
 */
export interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// Zodiac types
export * from './zodiac.types';
