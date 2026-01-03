/**
 * Game Resolver
 * Resolve completed deck games
 */

import { GameState, GameResult } from '../types';
import { countSuitMatches, calculateSuitBonus } from '../deck';
import {
  resolvePokerGame,
  resolvePressYourLuckGame,
  resolveBlackjackGame,
  resolveDeckbuilderGame,
  resolveCombatDuelGame,
  resolveFaroGame,
  resolveThreeCardMonteGame,
  resolveSolitaireRaceGame,
  resolveTexasHoldemGame,
  resolveRummyGame,
  resolveWarOfAttritionGame,
  resolveEuchreGame,
  resolveCribbageGame
} from '../resolvers';

/**
 * Resolve the game and calculate results
 */
export function resolveGame(state: GameState): GameResult {
  const suitMatches = countSuitMatches(state.hand, state.relevantSuit);
  const suitBonus = calculateSuitBonus(suitMatches);

  switch (state.gameType) {
    // Original 5 games
    case 'pokerHoldDraw':
      return resolvePokerGame(state, suitMatches, suitBonus);
    case 'pressYourLuck':
      return resolvePressYourLuckGame(state, suitMatches, suitBonus);
    case 'blackjack':
      return resolveBlackjackGame(state, suitMatches, suitBonus);
    case 'deckbuilder':
      return resolveDeckbuilderGame(state, suitMatches, suitBonus);
    case 'combatDuel':
      return resolveCombatDuelGame(state, suitMatches, suitBonus);

    // New card game expansion
    case 'faro':
      return resolveFaroGame(state, suitMatches, suitBonus);
    case 'threeCardMonte':
      return resolveThreeCardMonteGame(state, suitMatches, suitBonus);
    case 'solitaireRace':
      return resolveSolitaireRaceGame(state, suitMatches, suitBonus);
    case 'texasHoldem':
      return resolveTexasHoldemGame(state, suitMatches, suitBonus);
    case 'rummy':
      return resolveRummyGame(state, suitMatches, suitBonus);
    case 'warOfAttrition':
      return resolveWarOfAttritionGame(state, suitMatches, suitBonus);
    case 'euchre':
      return resolveEuchreGame(state, suitMatches, suitBonus);
    case 'cribbage':
      return resolveCribbageGame(state, suitMatches, suitBonus);

    default:
      return {
        success: false,
        score: 0,
        suitMatches,
        suitBonus
      };
  }
}
