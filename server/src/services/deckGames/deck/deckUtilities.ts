/**
 * Deck Utilities
 * Core functions for deck creation, shuffling, and card drawing
 */

import { Card, Rank, Suit as CardSuit } from '@desperados/shared';
import { SecureRNG } from '../../base/SecureRNG';
import { GameState } from '../types';

/**
 * Create a standard 52-card deck
 * Uses SecureRNG for cryptographically secure shuffling
 */
export function createDeck(): Card[] {
  const suits: CardSuit[] = [CardSuit.SPADES, CardSuit.HEARTS, CardSuit.CLUBS, CardSuit.DIAMONDS];
  const ranks: Rank[] = [
    Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN,
    Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
  ];

  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  // Shuffle using Fisher-Yates with cryptographically secure RNG
  return SecureRNG.shuffle(deck);
}

/**
 * Draw cards from deck
 */
export function drawCards(state: GameState, count: number): Card[] {
  const drawn: Card[] = [];
  for (let i = 0; i < count && state.deck.length > 0; i++) {
    drawn.push(state.deck.pop()!);
  }
  return drawn;
}

/**
 * Shuffle a deck in place
 * Uses SecureRNG for cryptographically secure shuffling
 */
export function shuffleDeck(deck: Card[]): void {
  const shuffled = SecureRNG.shuffle(deck);
  deck.splice(0, deck.length, ...shuffled);
}
