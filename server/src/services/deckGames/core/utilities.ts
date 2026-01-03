/**
 * Game Utilities
 * Utility functions for game type mapping
 */

import { ActionType } from '../../../models/Action.model';
import { GameType } from '../types';
import { GAME_TYPE_NAMES } from '../constants';

/**
 * Get game type based on action type
 */
export function getGameTypeForAction(actionType: string): GameType {
  switch (actionType) {
    case ActionType.COMBAT:
      return 'pokerHoldDraw';
    case ActionType.CRIME:
      return 'pressYourLuck';
    case ActionType.SOCIAL:
      return 'blackjack';
    case ActionType.CRAFT:
      return 'deckbuilder';
    default:
      return 'pokerHoldDraw';
  }
}

/**
 * Get game type based on job category
 * Maps location job categories to appropriate deck game types:
 * - labor: Standard work tasks -> Poker (build the best hand)
 * - skilled: Precision crafting -> Deckbuilder (collect combos)
 * - dangerous: Risk/reward tasks -> Press Your Luck (know when to stop)
 * - social: Social interactions -> Blackjack (read the situation)
 */
export function getGameTypeForJobCategory(category: string): GameType {
  switch (category) {
    case 'labor':
      return 'pokerHoldDraw';
    case 'skilled':
      return 'deckbuilder';
    case 'dangerous':
      return 'pressYourLuck';
    case 'social':
      return 'blackjack';
    default:
      return 'pokerHoldDraw';
  }
}

/**
 * Get human-readable game type name
 */
export function getGameTypeName(gameType: GameType): string {
  return GAME_TYPE_NAMES[gameType] || gameType;
}
