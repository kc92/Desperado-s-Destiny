/**
 * Combat Module
 * Card combat calculations and AI decisions
 */

export { getCardCombatValue, calculateBlackjackValue, getCardValue, getCribbageValue } from './cardValues';
export { getHandBonusDamage, calculateCombatDamage, calculateCombatDefense } from './combatEngine';
export { simulateOpponentCombat, processCombatTurn } from './aiDecisions';
