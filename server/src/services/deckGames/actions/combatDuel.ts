/**
 * Combat Duel Actions
 * Process combat duel game actions
 */

import { GameState, PlayerAction } from '../types';
import { drawCards, shuffleDeck } from '../deck';
import { processCombatTurn, simulateOpponentCombat } from '../combat';

/**
 * Process combat duel actions
 * Player selects which cards to use for attack vs defense
 */
export function processCombatDuelAction(state: GameState, action: PlayerAction): GameState {
  // Handle flee action (only in first 3 rounds)
  if (action.type === 'flee') {
    if (state.canFlee && (state.combatRound || 1) <= 3) {
      state.status = 'resolved';
      state.opponentHP = state.opponentMaxHP; // Didn't beat opponent
      return state;
    }
    // Can't flee after round 3
    return state;
  }

  // Handle card selection for attack
  if (action.type === 'select_attack') {
    if (action.cardIndices && action.cardIndices.length > 0) {
      state.attackCards = action.cardIndices;
      // Remove from defense if already there
      state.defenseCards = (state.defenseCards || []).filter(
        i => !action.cardIndices!.includes(i)
      );
    }
    return state;
  }

  // Handle card selection for defense
  if (action.type === 'select_defense') {
    if (action.cardIndices && action.cardIndices.length > 0) {
      state.defenseCards = action.cardIndices;
      // Remove from attack if already there
      state.attackCards = (state.attackCards || []).filter(
        i => !action.cardIndices!.includes(i)
      );
    }
    return state;
  }

  // Handle execute turn (commit attack/defense choices)
  if (action.type === 'execute_turn') {
    // Validate: all 5 cards must be assigned
    const totalAssigned = (state.attackCards?.length || 0) + (state.defenseCards?.length || 0);
    if (totalAssigned !== 5) {
      // Auto-assign remaining cards to attack
      const allIndices = [0, 1, 2, 3, 4];
      const assigned = [...(state.attackCards || []), ...(state.defenseCards || [])];
      const unassigned = allIndices.filter(i => !assigned.includes(i));
      state.attackCards = [...(state.attackCards || []), ...unassigned];
    }

    // Process the combat turn
    const result = processCombatTurn(state);

    // Check for end conditions
    if (result.opponentDefeated) {
      state.status = 'resolved';
      return state;
    }

    if (result.playerDefeated) {
      state.status = 'busted'; // Player lost
      return state;
    }

    // Continue to next round
    state.combatRound = (state.combatRound || 1) + 1;
    state.turnNumber = state.combatRound;

    // Can only flee in first 3 rounds
    if (state.combatRound > 3) {
      state.canFlee = false;
    }

    // Check for max rounds
    if (state.combatRound > state.maxTurns) {
      // Timeout - determine winner by remaining HP percentage
      const playerHPPercent = (state.playerHP || 0) / (state.playerMaxHP || 1);
      const opponentHPPercent = (state.opponentHP || 0) / (state.opponentMaxHP || 1);
      if (playerHPPercent >= opponentHPPercent) {
        state.status = 'resolved'; // Player wins by HP
      } else {
        state.status = 'busted'; // Opponent wins
      }
      return state;
    }

    // Draw fresh hand for next round
    // Discard current hand
    state.discarded.push(...state.hand);
    state.hand = [];

    // Shuffle discard back if deck is low
    if (state.deck.length < 5) {
      state.deck.push(...state.discarded);
      state.discarded = [];
      shuffleDeck(state.deck);
    }

    // Draw new hand
    state.hand = drawCards(state, 5);

    // Reset attack/defense selections
    state.attackCards = [];
    state.defenseCards = [];

    // Simulate next opponent attack (shown to player for strategy)
    const tempCards = drawCards(state, 5);
    const { attack: oppAttack, defense: oppDefense } = simulateOpponentCombat(
      tempCards,
      state.opponentDifficulty || state.difficulty
    );
    state.opponentAttackDamage = oppAttack;
    state.opponentDefenseReduction = oppDefense;

    // Put opponent's cards back
    state.deck.push(...tempCards);
    shuffleDeck(state.deck);

    return state;
  }

  return state;
}
