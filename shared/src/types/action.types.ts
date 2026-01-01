/**
 * Action Types - Challenge System for Desperados Destiny
 *
 * Actions are challenges that players attempt using the Destiny Deck
 * Each action has a difficulty, energy cost, and potential rewards
 */

import type { Card, HandEvaluation, Suit } from './destinyDeck.types';
import type { SkillCategory } from './skill.types';

/**
 * The type of action being performed
 */
export enum ActionType {
  /** Criminal activities (theft, fraud, smuggling) */
  CRIME = 'CRIME',
  /** Physical combat and fighting */
  COMBAT = 'COMBAT',
  /** Crafting and building items */
  CRAFT = 'CRAFT',
  /** Social interactions and persuasion */
  SOCIAL = 'SOCIAL',
}

/**
 * Suit bonuses for specific actions
 * Actions may have affinities with certain suits
 */
export interface SuitBonus {
  /** The suit that provides the bonus */
  suit: Suit;
  /** Bonus modifier applied (percentage or flat value) */
  bonus: number;
}

/**
 * Rewards granted on successful action completion
 */
export interface ActionReward {
  /** Experience points gained */
  xp: number;
  /** Gold earned */
  gold?: number;
  /** Items obtained */
  items?: string[];
  /** Reputation changes */
  reputation?: Record<string, number>;
}

/**
 * Action requirement
 */
export interface ActionRequirement {
  type: string;
  value: number | string;
  label?: string;
}

/**
 * An action that can be attempted by a character
 */
export interface Action {
  /** Unique action identifier */
  _id: string;
  /** Action ID alias for frontend */
  id?: string;
  /** Display name */
  name: string;
  /** Detailed description */
  description: string;
  /** Type of action */
  type: ActionType;
  /** Energy cost to attempt */
  energyCost: number;
  /** Energy required (alias) */
  energyRequired?: number;
  /** Difficulty level (1-10) */
  difficulty: number;
  /** Target score needed for success */
  targetScore: number;
  /** Suit bonuses (if applicable) */
  suitBonuses?: SuitBonus[];
  /** Rewards for success */
  rewards: ActionReward;
  /** Base reward display value */
  baseReward?: number;
  /** Location where action is available */
  locationId: string;
  /** Minimum level requirement */
  minLevel?: number;
  /** Whether action is repeatable */
  isRepeatable: boolean;
  /** Cooldown in minutes (if not repeatable) */
  cooldownMinutes?: number;
  /** Cooldown time alias */
  cooldown?: number;
  /** Stat used for this action */
  statUsed?: string;
  /** Additional requirements */
  requirements?: ActionRequirement[];
  /** Required skill category to unlock this action */
  requiredSkillCategory?: SkillCategory;
  /** Required skill level to unlock this action */
  requiredSkillLevel?: number;
  /** Required criminal skill type (for CRIME actions) */
  requiredCriminalSkill?: string;
  /** Required criminal skill level (for CRIME actions) */
  requiredCriminalSkillLevel?: number;
}

/**
 * Result of attempting an action with the Destiny Deck
 */
export interface ActionResult {
  /** Unique result identifier */
  _id?: string;
  /** The action that was attempted */
  action: Action;
  /** Character who attempted the action */
  characterId: string;
  /** Cards drawn from the Destiny Deck */
  hand: Card[];
  /** Evaluation of the poker hand */
  handEvaluation: HandEvaluation;
  /** Suit bonuses applied to the score */
  suitBonuses: Array<{ suit: Suit; bonus: number }>;
  /** Total score after bonuses */
  totalScore: number;
  /** Whether the action succeeded */
  success: boolean;
  /** Margin of success/failure (total score - target score) */
  margin: number;
  /** Rewards received (if successful) */
  rewards?: ActionReward;
  /** Energy spent */
  energySpent: number;
  /** Timestamp of the attempt */
  timestamp: Date;
  /** Crime resolution details (for crime actions) */
  crimeResolution?: {
    success: boolean;
    caught: boolean;
    jailed: boolean;
    jailTime?: number;
    wantedLevelChange?: number;
  };
}

/**
 * Action attempt request
 */
export interface ActionAttemptRequest {
  /** ID of the action to attempt */
  actionId: string;
  /** ID of the character attempting */
  characterId: string;
}

/**
 * Action history query filters
 */
export interface ActionHistoryFilters {
  /** Filter by character ID */
  characterId?: string;
  /** Filter by action type */
  actionType?: ActionType;
  /** Filter by success/failure */
  success?: boolean;
  /** Limit number of results */
  limit?: number;
  /** Skip results (pagination) */
  skip?: number;
}
