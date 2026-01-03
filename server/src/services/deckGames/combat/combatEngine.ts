/**
 * Combat Engine
 * Core combat damage and defense calculations
 */

import { Card } from '@desperados/shared';
import { getCardCombatValue } from './cardValues';
import { evaluatePokerHand } from '../deck/pokerHand';
import { HAND_BONUS_DAMAGE } from '../constants';

/**
 * Get bonus damage based on poker hand rank
 */
export function getHandBonusDamage(handRank: string): number {
  return HAND_BONUS_DAMAGE[handRank] || 0;
}

/**
 * Calculate combat damage from selected cards
 * Sum of card values + weapon bonus + skill modifier
 */
export function calculateCombatDamage(
  cards: Card[],
  weaponBonus: number = 0,
  skillModifier: number = 0
): number {
  if (cards.length === 0) return 0;

  const baseValue = cards.reduce((sum, card) => sum + getCardCombatValue(card), 0);

  // Evaluate poker hand for bonus damage
  const handResult = evaluatePokerHand(cards);
  const handBonus = getHandBonusDamage(handResult.handName);

  return Math.max(1, baseValue + weaponBonus + skillModifier + handBonus);
}

/**
 * Calculate defense reduction from cards
 * Sum of card values + armor bonus + skill modifier
 */
export function calculateCombatDefense(
  cards: Card[],
  armorBonus: number = 0,
  skillModifier: number = 0
): number {
  if (cards.length === 0) return 0;

  const baseValue = cards.reduce((sum, card) => sum + getCardCombatValue(card), 0);

  // Pairs and better give bonus defense
  const handResult = evaluatePokerHand(cards);
  const handBonus = Math.floor(getHandBonusDamage(handResult.handName) * 0.5);

  return Math.max(0, baseValue + armorBonus + skillModifier + handBonus);
}
