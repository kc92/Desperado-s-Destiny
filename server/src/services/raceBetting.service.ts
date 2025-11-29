/**
 * Race Betting Service
 * Phase 13, Wave 13.2
 *
 * Service for managing horse race betting and payouts
 */

import { ObjectId } from 'mongodb';
import { Schema } from 'mongoose';
import { HorseRace, HorseRaceDocument } from '../models/HorseRace.model';
import { RaceBet, RaceBetDocument } from '../models/RaceBet.model';
import {
  RaceBetType,
  RaceResult,
  RACING_CONSTANTS
} from '@desperados/shared';

// ============================================================================
// PLACE BET
// ============================================================================

/**
 * Place a bet on a horse race
 */
export async function placeBet(params: {
  characterId: ObjectId;
  raceId: ObjectId;
  betType: RaceBetType;
  amount: number;
  selections: ObjectId[];
}): Promise<RaceBetDocument> {
  // Validate bet amount
  if (params.amount < RACING_CONSTANTS.MIN_BET) {
    throw new Error(`Minimum bet is ${RACING_CONSTANTS.MIN_BET} gold`);
  }

  if (params.amount > RACING_CONSTANTS.MAX_BET) {
    throw new Error(`Maximum bet is ${RACING_CONSTANTS.MAX_BET} gold`);
  }

  // Get race
  const race = await HorseRace.findById(params.raceId);
  if (!race) {
    throw new Error('Race not found');
  }

  // Check if betting is still open
  const now = new Date();
  if (now >= race.postTime) {
    throw new Error('Betting is closed for this race');
  }

  // Validate selections
  validateBetSelections(params.betType, params.selections, race);

  // Calculate odds and potential payout
  const odds = calculateBetOdds(params.betType, params.selections, race);
  const potentialPayout = calculatePotentialPayout(params.amount, odds, params.betType);

  // Create bet
  const bet = new RaceBet({
    characterId: params.characterId,
    raceId: params.raceId,
    betType: params.betType,
    amount: params.amount,
    selections: params.selections,
    odds,
    potentialPayout,
    status: 'PENDING'
  });

  await bet.save();

  // Add to betting pool
  for (const horseId of params.selections) {
    race.addToBettingPool(
      new Schema.Types.ObjectId(horseId.toString()),
      params.betType,
      params.amount
    );
  }

  await race.save();

  // TODO: Deduct gold from character

  return bet;
}

/**
 * Validate bet selections
 */
function validateBetSelections(
  betType: RaceBetType,
  selections: ObjectId[],
  race: HorseRaceDocument
): void {
  // Check required number of selections
  const requiredSelections: Record<RaceBetType, number> = {
    [RaceBetType.WIN]: 1,
    [RaceBetType.PLACE]: 1,
    [RaceBetType.SHOW]: 1,
    [RaceBetType.EXACTA]: 2,
    [RaceBetType.TRIFECTA]: 3,
    [RaceBetType.SUPERFECTA]: 4,
    [RaceBetType.QUINELLA]: 2,
    [RaceBetType.DAILY_DOUBLE]: 2,
    [RaceBetType.PICK_THREE]: 3,
    [RaceBetType.ACROSS_THE_BOARD]: 1
  };

  if (selections.length !== requiredSelections[betType]) {
    throw new Error(`${betType} requires ${requiredSelections[betType]} selection(s)`);
  }

  // Verify all selections are in the race
  for (const horseId of selections) {
    const inRace = race.registeredHorses.some(
      e => e.horseId.toString() === horseId.toString() && !e.scratched
    );

    if (!inRace) {
      throw new Error('Invalid horse selection');
    }
  }
}

/**
 * Calculate bet odds
 */
function calculateBetOdds(
  betType: RaceBetType,
  selections: ObjectId[],
  race: HorseRaceDocument
): number {
  if (betType === RaceBetType.WIN) {
    // Get current odds for the horse
    const entry = race.registeredHorses.find(
      e => e.horseId.toString() === selections[0].toString()
    );
    return entry?.currentOdds || 10;
  }

  if (betType === RaceBetType.PLACE) {
    // Place pays less than win
    const entry = race.registeredHorses.find(
      e => e.horseId.toString() === selections[0].toString()
    );
    const winOdds = entry?.currentOdds || 10;
    return winOdds * RACING_CONSTANTS.PLACE_PAYOUT_PERCENTAGE;
  }

  if (betType === RaceBetType.SHOW) {
    // Show pays even less
    const entry = race.registeredHorses.find(
      e => e.horseId.toString() === selections[0].toString()
    );
    const winOdds = entry?.currentOdds || 10;
    return winOdds * RACING_CONSTANTS.SHOW_PAYOUT_PERCENTAGE;
  }

  if (betType === RaceBetType.EXACTA) {
    // Multiply odds of first two horses
    const odds1 = race.registeredHorses.find(
      e => e.horseId.toString() === selections[0].toString()
    )?.currentOdds || 10;

    const odds2 = race.registeredHorses.find(
      e => e.horseId.toString() === selections[1].toString()
    )?.currentOdds || 10;

    return odds1 * odds2 * 0.5; // Half because it's harder
  }

  if (betType === RaceBetType.TRIFECTA) {
    // Multiply odds of first three horses
    let totalOdds = 1;
    for (const horseId of selections) {
      const entry = race.registeredHorses.find(
        e => e.horseId.toString() === horseId.toString()
      );
      totalOdds *= entry?.currentOdds || 10;
    }
    return totalOdds * 0.3; // Even harder
  }

  if (betType === RaceBetType.QUINELLA) {
    // Similar to exacta but any order
    const odds1 = race.registeredHorses.find(
      e => e.horseId.toString() === selections[0].toString()
    )?.currentOdds || 10;

    const odds2 = race.registeredHorses.find(
      e => e.horseId.toString() === selections[1].toString()
    )?.currentOdds || 10;

    return (odds1 * odds2 * 0.5) * 0.7; // Easier than exacta
  }

  // Default
  return 10;
}

/**
 * Calculate potential payout
 */
function calculatePotentialPayout(
  amount: number,
  odds: number,
  betType: RaceBetType
): number {
  if (betType === RaceBetType.ACROSS_THE_BOARD) {
    // This bet is actually 3 bets (win, place, show)
    // So payout is sum of all three
    const winPayout = amount * odds;
    const placePayout = amount * odds * RACING_CONSTANTS.PLACE_PAYOUT_PERCENTAGE;
    const showPayout = amount * odds * RACING_CONSTANTS.SHOW_PAYOUT_PERCENTAGE;
    return winPayout + placePayout + showPayout;
  }

  return amount * odds;
}

// ============================================================================
// SETTLE BETS
// ============================================================================

/**
 * Settle all bets for a completed race
 */
export async function settleBets(raceId: ObjectId, results: RaceResult[]): Promise<void> {
  // Get all bets for this race
  const bets = await RaceBet.find({ raceId, status: 'PENDING' });

  for (const bet of bets) {
    const won = checkBetWin(bet, results);

    if (won) {
      // Calculate actual payout based on betting pool
      const actualPayout = calculateActualPayout(bet, raceId, results);
      (bet as any).settleAsWon(actualPayout);

      // TODO: Credit character's gold
    } else {
      (bet as any).settleAsLost();
    }

    await bet.save();
  }
}

/**
 * Check if a bet won
 */
function checkBetWin(bet: RaceBetDocument, results: RaceResult[]): boolean {
  if (bet.betType === RaceBetType.WIN) {
    // Horse must finish first
    return results[0].horseId.toString() === bet.selections[0].toString();
  }

  if (bet.betType === RaceBetType.PLACE) {
    // Horse must finish first or second
    return results.slice(0, 2).some(
      r => r.horseId.toString() === bet.selections[0].toString()
    );
  }

  if (bet.betType === RaceBetType.SHOW) {
    // Horse must finish in top 3
    return results.slice(0, 3).some(
      r => r.horseId.toString() === bet.selections[0].toString()
    );
  }

  if (bet.betType === RaceBetType.EXACTA) {
    // First two horses in exact order
    return (
      results[0].horseId.toString() === bet.selections[0].toString() &&
      results[1].horseId.toString() === bet.selections[1].toString()
    );
  }

  if (bet.betType === RaceBetType.TRIFECTA) {
    // First three horses in exact order
    return (
      results[0].horseId.toString() === bet.selections[0].toString() &&
      results[1].horseId.toString() === bet.selections[1].toString() &&
      results[2].horseId.toString() === bet.selections[2].toString()
    );
  }

  if (bet.betType === RaceBetType.SUPERFECTA) {
    // First four horses in exact order
    return (
      results[0].horseId.toString() === bet.selections[0].toString() &&
      results[1].horseId.toString() === bet.selections[1].toString() &&
      results[2].horseId.toString() === bet.selections[2].toString() &&
      results[3].horseId.toString() === bet.selections[3].toString()
    );
  }

  if (bet.betType === RaceBetType.QUINELLA) {
    // First two horses in any order
    const first = results[0].horseId.toString();
    const second = results[1].horseId.toString();
    const sel1 = bet.selections[0].toString();
    const sel2 = bet.selections[1].toString();

    return (
      (first === sel1 && second === sel2) ||
      (first === sel2 && second === sel1)
    );
  }

  if (bet.betType === RaceBetType.ACROSS_THE_BOARD) {
    // At least show (top 3)
    return results.slice(0, 3).some(
      r => r.horseId.toString() === bet.selections[0].toString()
    );
  }

  return false;
}

/**
 * Calculate actual payout using pari-mutuel system
 */
async function calculateActualPayout(
  bet: RaceBetDocument,
  raceId: ObjectId,
  results: RaceResult[]
): Promise<number> {
  const race = await HorseRace.findById(raceId);
  if (!race) return bet.potentialPayout;

  // Get betting pool
  const pool = race.bettingPool;
  const trackTake = race.trackTakePercentage;

  // Calculate net pool (after track take)
  const netPool = race.totalWagered * (1 - trackTake);

  if (bet.betType === RaceBetType.WIN) {
    const winningHorseId = results[0].horseId.toString();
    const totalWinBets = pool.winPool.get(winningHorseId) || 1;

    // Payout is proportional share of net pool
    const payout = (bet.amount / totalWinBets) * netPool;
    return Math.max(bet.amount, payout); // At least break even
  }

  if (bet.betType === RaceBetType.PLACE) {
    // Split between top 2
    const top2 = results.slice(0, 2).map(r => r.horseId.toString());
    let totalPlaceBets = 0;

    for (const horseId of top2) {
      totalPlaceBets += pool.placePool.get(horseId) || 0;
    }

    if (totalPlaceBets === 0) return bet.amount;

    const payout = (bet.amount / totalPlaceBets) * (netPool * 0.5);
    return Math.max(bet.amount * 0.8, payout);
  }

  if (bet.betType === RaceBetType.SHOW) {
    // Split between top 3
    const top3 = results.slice(0, 3).map(r => r.horseId.toString());
    let totalShowBets = 0;

    for (const horseId of top3) {
      totalShowBets += pool.showPool.get(horseId) || 0;
    }

    if (totalShowBets === 0) return bet.amount;

    const payout = (bet.amount / totalShowBets) * (netPool * 0.3);
    return Math.max(bet.amount * 0.6, payout);
  }

  // For exotic bets (exacta, trifecta, etc.), use the exotic pool
  if (bet.betType === RaceBetType.EXACTA) {
    // Count winning exacta bets
    const allExactaBets = await RaceBet.countDocuments({
      raceId,
      betType: RaceBetType.EXACTA,
      'selections.0': results[0].horseId,
      'selections.1': results[1].horseId
    });

    if (allExactaBets === 0) return bet.amount;

    const payout = (bet.amount / (pool.exactaPool || 1)) * (netPool * 0.8);
    return Math.max(bet.amount * 2, payout);
  }

  // Default to potential payout
  return bet.potentialPayout;
}

// ============================================================================
// BET QUERIES
// ============================================================================

/**
 * Get pending bets for a character
 */
export async function getCharacterPendingBets(
  characterId: ObjectId
): Promise<RaceBetDocument[]> {
  return RaceBet.find({
    characterId,
    status: 'PENDING'
  })
    .populate('raceId')
    .sort({ placedAt: -1 });
}

/**
 * Get betting history for a character
 */
export async function getCharacterBettingHistory(
  characterId: ObjectId,
  limit: number = 50
): Promise<RaceBetDocument[]> {
  return RaceBet.find({ characterId })
    .populate('raceId')
    .sort({ placedAt: -1 })
    .limit(limit);
}

/**
 * Get betting statistics for a character
 */
export async function getCharacterBettingStats(characterId: ObjectId) {
  const stats = await (RaceBet as any).getCharacterBettingStats(characterId);
  return stats;
}

/**
 * Get total wagered on a race
 */
export async function getRaceBettingInfo(raceId: ObjectId) {
  const race = await HorseRace.findById(raceId);
  if (!race) return null;

  const breakdown = await (RaceBet as any).getBettingBreakdown(raceId);

  return {
    totalWagered: race.totalWagered,
    bettingPool: race.bettingPool,
    breakdown,
    trackTake: race.trackTakePercentage
  };
}

/**
 * Cancel bet (before race starts)
 */
export async function cancelBet(
  betId: ObjectId,
  characterId: ObjectId
): Promise<void> {
  const bet = await RaceBet.findById(betId);
  if (!bet) {
    throw new Error('Bet not found');
  }

  if (bet.characterId.toString() !== characterId.toString()) {
    throw new Error('Not your bet');
  }

  if (bet.status !== 'PENDING') {
    throw new Error('Bet already settled');
  }

  // Check if race hasn't started
  const race = await HorseRace.findById(bet.raceId);
  if (!race) {
    throw new Error('Race not found');
  }

  if (new Date() >= race.postTime) {
    throw new Error('Race has started, cannot cancel bet');
  }

  // Refund bet
  (bet as any).refund();
  await bet.save();

  // TODO: Refund character's gold
}

// ============================================================================
// ODDS CALCULATION
// ============================================================================

/**
 * Calculate and update odds for all horses in a race
 */
export async function updateRaceOdds(raceId: ObjectId): Promise<void> {
  const race = await HorseRace.findById(raceId);
  if (!race) return;

  // Pari-mutuel odds calculation
  const totalWagered = race.totalWagered;

  if (totalWagered === 0) {
    // No bets yet, use morning line odds
    return;
  }

  // Update odds for each horse
  for (const entry of race.registeredHorses) {
    if (entry.scratched) continue;

    const horseIdStr = entry.horseId.toString();
    const horseBets = race.bettingPool.winPool.get(horseIdStr) || 0;

    if (horseBets > 0) {
      // Calculate new odds
      const winProbability = horseBets / totalWagered;
      const fairOdds = 1 / winProbability;

      // Apply track take
      const adjustedOdds = fairOdds * (1 - race.trackTakePercentage);

      // Update odds
      const newOdds = Math.max(
        RACING_CONSTANTS.MIN_ODDS,
        Math.min(RACING_CONSTANTS.MAX_ODDS, adjustedOdds)
      );

      (race as any).updateOdds(
        new Schema.Types.ObjectId(horseIdStr),
        parseFloat(newOdds.toFixed(1))
      );
    }
  }

  await race.save();
}

/**
 * Get betting trends for a race
 */
export async function getBettingTrends(raceId: ObjectId) {
  const race = await HorseRace.findById(raceId);
  if (!race) return null;

  const trends = race.registeredHorses
    .filter(e => !e.scratched)
    .map(entry => {
      const horseIdStr = entry.horseId.toString();
      const winBets = race.bettingPool.winPool.get(horseIdStr) || 0;
      const percentage = race.totalWagered > 0 ?
        (winBets / race.totalWagered) * 100 : 0;

      return {
        horseId: entry.horseId,
        postPosition: entry.postPosition,
        morningLineOdds: entry.morningLineOdds,
        currentOdds: entry.currentOdds,
        amountWagered: winBets,
        percentageOfPool: parseFloat(percentage.toFixed(1)),
        favoriteStatus: entry.favoriteStatus,
        oddsMovement: entry.currentOdds - entry.morningLineOdds
      };
    })
    .sort((a, b) => b.amountWagered - a.amountWagered);

  return {
    totalPool: race.totalWagered,
    trends,
    favorite: trends[0],
    longshot: trends[trends.length - 1]
  };
}
