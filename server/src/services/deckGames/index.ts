/**
 * DeckGames Module
 * Modular deck games system
 *
 * Refactored from deckGames.ts (3,143 lines) into focused modules:
 * - types.ts: Type definitions
 * - constants.ts: Configuration constants
 * - deck/: Deck utilities and poker hand evaluation
 * - skills/: Skill calculations and special abilities
 * - combat/: Card combat calculations and AI
 * - effectiveness/: V2 effectiveness system
 * - wagering/: Wager and bail-out system
 * - momentum/: Streak tracking and reward modifiers
 * - actions/: Game action processors
 * - resolvers/: Game resolution functions
 * - core/: Main orchestrators
 */

// Re-export types
export type {
  Suit,
  GameType,
  PlayerAction,
  SpecialAbilities,
  SkillModifiers,
  TalentBonuses,
  GameState,
  GameResult,
  WagerConfig,
  InitGameOptions
} from './types';

// Re-export constants
export {
  WAGER_TIERS,
  HAND_BONUS_DAMAGE,
  POKER_THRESHOLDS,
  BLACKJACK_TARGETS,
  MAX_TURNS,
  GAME_TYPE_NAMES
} from './constants';

// Re-export deck utilities
export {
  createDeck,
  drawCards,
  shuffleDeck,
  checkStraight,
  evaluatePokerHand,
  countSuitMatches,
  calculateSuitBonus
} from './deck';

// Re-export skill functions
export {
  calculateSpecialAbilities,
  calculateSkillModifiers
} from './skills';

// Re-export combat functions
export {
  getCardCombatValue,
  calculateBlackjackValue,
  getCardValue,
  getCribbageValue,
  getHandBonusDamage,
  calculateCombatDamage,
  calculateCombatDefense,
  simulateOpponentCombat,
  processCombatTurn
} from './combat';

// Re-export effectiveness functions
export {
  calculateEffectivenessV2,
  effectivenessToDamage,
  effectivenessToGoldMultiplier,
  calculateHybridRewards,
  getEffectivenessSpecialEffect
} from './effectiveness';

// Re-export wagering functions
export {
  getWagerConfig,
  calculateWager,
  calculateBailOutValue
} from './wagering';

// Re-export momentum functions
export {
  calculateStreakBonus,
  calculateUnderdogBonus,
  checkHotHand,
  updateStreakTracking,
  applyRewardModifiers
} from './momentum';

// Re-export action functions
export {
  processPokerAction,
  processPressYourLuckAction,
  processBlackjackAction,
  processDeckbuilderAction,
  processCombatDuelAction,
  getAvailableActions
} from './actions';

// Re-export resolver functions
export {
  resolvePokerGame,
  resolvePressYourLuckGame,
  resolveBlackjackGame,
  resolveDeckbuilderGame,
  resolveCombatDuelGame,
  resolveFaroGame,
  resolveThreeCardMonteGame,
  resolveWarOfAttritionGame,
  resolveSolitaireRaceGame,
  resolveTexasHoldemGame,
  resolveRummyGame,
  resolveEuchreGame,
  resolveCribbageGame
} from './resolvers';

// Re-export core functions (main API)
export {
  initGame,
  processAction,
  resolveGame,
  getGameTypeForAction,
  getGameTypeForJobCategory,
  getGameTypeName
} from './core';

// Default export for backwards compatibility
export default {
  initGame: require('./core').initGame,
  processAction: require('./core').processAction,
  resolveGame: require('./core').resolveGame,
  getGameTypeForAction: require('./core').getGameTypeForAction,
  getGameTypeName: require('./core').getGameTypeName,
  getAvailableActions: require('./actions').getAvailableActions
};
