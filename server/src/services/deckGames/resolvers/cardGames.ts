/**
 * Card Games Resolvers
 * Resolve expanded card games (Faro, Monte, Texas, Rummy, etc.)
 */

import { Rank, Suit as CardSuit } from '@desperados/shared';
import { SecureRNG } from '../../base/SecureRNG';
import { GameState, GameResult } from '../types';
import { evaluatePokerHand } from '../deck';
import { calculateSkillModifiers } from '../skills';

/**
 * Faro - Simple betting on card order
 */
export function resolveFaroGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  const cardValues = state.hand.map(card => {
    if (card.rank === Rank.ACE) return 14;
    if (card.rank === Rank.KING) return 13;
    if (card.rank === Rank.QUEEN) return 12;
    if (card.rank === Rank.JACK) return 11;
    return card.rank as number;
  });

  const baseScore = cardValues.reduce((sum, val) => sum + val, 0);
  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);

  const baseThreshold = 35 + (state.difficulty * 15);
  const adjustedThreshold = Math.max(30, baseThreshold - modifiers.thresholdReduction);
  const adjustedScore = baseScore + modifiers.cardBonus;
  const success = adjustedScore >= adjustedThreshold;

  const highCard = cardValues.length > 0 ? Math.max(...cardValues) : 0;
  const highCardName = highCard === 14 ? 'Ace' : highCard === 13 ? 'King' :
                       highCard === 12 ? 'Queen' : highCard === 11 ? 'Jack' : `${highCard}`;

  const handName = `Faro (${state.hand.length} cards, High: ${highCardName})`;

  const feedbackParts: string[] = [];
  if (modifiers.cardBonus > 0) feedbackParts.push(`Skill +${modifiers.cardBonus}`);
  if (suitMatches > 0) feedbackParts.push(`${suitMatches} suit match${suitMatches > 1 ? 'es' : ''}`);
  const feedbackStr = feedbackParts.length > 0 ? ` (${feedbackParts.join(', ')})` : '';

  return {
    success,
    score: adjustedScore,
    handName: handName + feedbackStr,
    suitMatches,
    suitBonus,
    mitigation: success ? undefined : { damageReduction: Math.min(0.4, suitMatches * 0.1) }
  };
}

/**
 * Three-Card Monte - Track the card
 */
export function resolveThreeCardMonteGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  const cardValues = state.hand.map(card => {
    if (card.rank === Rank.ACE) return 14;
    if (card.rank === Rank.KING) return 13;
    if (card.rank === Rank.QUEEN) return 12;
    if (card.rank === Rank.JACK) return 11;
    return card.rank as number;
  });

  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);
  const targetValue = Math.max(...cardValues);

  const baseSuccessChance = 0.33 + (modifiers.cardBonus / 100);
  const difficultyPenalty = state.difficulty * 0.08;
  const successChance = Math.min(0.95, Math.max(0.15, baseSuccessChance - difficultyPenalty));
  const trackedCorrectly = SecureRNG.chance(successChance);

  let score = 0;
  let handName = '';

  if (trackedCorrectly) {
    score = 150 + modifiers.cardBonus;
    const targetName = targetValue === 14 ? 'Ace' : targetValue === 13 ? 'King' :
                       targetValue === 12 ? 'Queen' : targetValue === 11 ? 'Jack' : `${targetValue}`;
    handName = `Found the ${targetName}!`;
  } else {
    score = 25;
    handName = 'Lost the trail...';
  }

  const finalScore = Math.floor(score * suitBonus.multiplier);
  const threshold = 50 + (state.difficulty * 20);
  const success = finalScore >= threshold;

  return {
    success,
    score: finalScore,
    handName,
    suitMatches,
    suitBonus: { ...suitBonus, specialEffect: trackedCorrectly ? 'Sharp Eyes!' : 'Sleight of Hand!' },
    mitigation: success ? undefined : { damageReduction: Math.min(0.3, suitMatches * 0.1) }
  };
}

/**
 * War of Attrition - Endurance contest
 */
export function resolveWarOfAttritionGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  const cardValues = state.hand.map(card => {
    if (card.rank === Rank.ACE) return 14;
    if (card.rank === Rank.KING) return 13;
    if (card.rank === Rank.QUEEN) return 12;
    if (card.rank === Rank.JACK) return 11;
    return card.rank as number;
  });

  const totalStrength = cardValues.reduce((sum, val) => sum + val, 0);
  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);

  const rankCounts: Record<number, number> = {};
  cardValues.forEach(val => { rankCounts[val] = (rankCounts[val] || 0) + 1; });
  const pairs = Object.values(rankCounts).filter(c => c >= 2).length;
  const pairBonus = pairs * 15;

  const opponentBase = 30 + (state.difficulty * 8);
  const opponentStrength = opponentBase + SecureRNG.range(0, 15);

  const playerScore = totalStrength + modifiers.cardBonus + pairBonus;
  const adjustedScore = Math.floor(playerScore * suitBonus.multiplier);
  const success = adjustedScore > opponentStrength;

  let handName = `Strength: ${totalStrength}`;
  if (pairs > 0) handName += ` (${pairs} pair${pairs > 1 ? 's' : ''})`;

  let specialEffect = suitBonus.specialEffect;
  if (success && adjustedScore > opponentStrength * 1.5) specialEffect = 'Overwhelming Victory!';
  else if (!success && opponentStrength > adjustedScore * 1.5) specialEffect = 'Crushed!';

  return {
    success,
    score: adjustedScore,
    handName,
    suitMatches,
    suitBonus: { ...suitBonus, specialEffect },
    mitigation: success ? undefined : { damageReduction: Math.min(0.35, suitMatches * 0.1 + 0.05) }
  };
}

/**
 * Solitaire Race - Time-based puzzle
 */
export function resolveSolitaireRaceGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  const cardValues = state.hand.map(card => {
    if (card.rank === Rank.ACE) return 1;
    if (card.rank === Rank.KING) return 13;
    if (card.rank === Rank.QUEEN) return 12;
    if (card.rank === Rank.JACK) return 11;
    return card.rank as number;
  }).sort((a, b) => a - b);

  let currentSeq = 1;
  let longestSeq = 1;
  for (let i = 1; i < cardValues.length; i++) {
    if (cardValues[i] === cardValues[i - 1] + 1) {
      currentSeq++;
      longestSeq = Math.max(longestSeq, currentSeq);
    } else if (cardValues[i] !== cardValues[i - 1]) {
      currentSeq = 1;
    }
  }

  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);
  let baseScore = longestSeq * 40;
  const speedBonus = Math.max(0, (10 - state.hand.length) * 10);
  const totalScore = baseScore + speedBonus + modifiers.cardBonus;
  const finalScore = Math.floor(totalScore * suitBonus.multiplier);

  const threshold = 60 + (state.difficulty * 25);
  const success = finalScore >= threshold;

  let handName = `Sequence: ${longestSeq}`;
  if (speedBonus > 0) handName += ` (+${speedBonus} speed)`;

  let specialEffect = suitBonus.specialEffect;
  if (longestSeq >= 5) specialEffect = 'Perfect Run!';
  else if (longestSeq >= 4) specialEffect = 'Strong Sequence';

  return {
    success,
    score: finalScore,
    handName,
    suitMatches,
    suitBonus: { ...suitBonus, specialEffect },
    mitigation: success ? undefined : { damageReduction: Math.min(0.3, suitMatches * 0.1) }
  };
}

/**
 * Texas Hold'em - Strategic poker with community cards
 */
export function resolveTexasHoldemGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  const { handName: pokerHand, score: pokerScore } = evaluatePokerHand(state.hand);
  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);

  const strategicBonus = Math.floor(modifiers.cardBonus * 1.2);
  const adjustedScore = pokerScore + modifiers.cardBonus + strategicBonus;

  const threshold = 150 + (state.difficulty * 75);
  const success = adjustedScore >= threshold;

  const feedbackParts: string[] = [];
  if (strategicBonus > 0) feedbackParts.push(`Strategy +${strategicBonus}`);
  if (modifiers.cardBonus > 0) feedbackParts.push(`Skill +${modifiers.cardBonus}`);
  const feedbackStr = feedbackParts.length > 0 ? ` (${feedbackParts.join(', ')})` : '';

  const finalScore = Math.floor(adjustedScore * suitBonus.multiplier);

  return {
    success,
    score: finalScore,
    handName: pokerHand + feedbackStr,
    suitMatches,
    suitBonus: { ...suitBonus, specialEffect: pokerScore >= 600 ? 'Monster Hand!' : suitBonus.specialEffect },
    mitigation: success ? undefined : { damageReduction: Math.min(0.4, suitMatches * 0.1) }
  };
}

/**
 * Rummy - Set collection
 */
export function resolveRummyGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  const rankCounts: Record<string, number> = {};
  const suitCards: Record<string, number[]> = {
    [CardSuit.SPADES]: [], [CardSuit.HEARTS]: [], [CardSuit.CLUBS]: [], [CardSuit.DIAMONDS]: []
  };

  state.hand.forEach(card => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    const value = card.rank === Rank.ACE ? 1 : card.rank === Rank.KING ? 13 :
                  card.rank === Rank.QUEEN ? 12 : card.rank === Rank.JACK ? 11 : card.rank as number;
    suitCards[card.suit].push(value);
  });

  let setScore = 0;
  let setCount = 0;
  Object.values(rankCounts).forEach(count => {
    if (count >= 4) { setScore += 120; setCount++; }
    else if (count >= 3) { setScore += 60; setCount++; }
  });

  let runScore = 0;
  let longestRun = 0;
  Object.values(suitCards).forEach(values => {
    if (values.length < 3) return;
    values.sort((a, b) => a - b);
    let currentRun = 1;
    for (let i = 1; i < values.length; i++) {
      if (values[i] === values[i - 1] + 1) currentRun++;
      else {
        if (currentRun >= 3) { runScore += currentRun * 25; longestRun = Math.max(longestRun, currentRun); }
        currentRun = 1;
      }
    }
    if (currentRun >= 3) { runScore += currentRun * 25; longestRun = Math.max(longestRun, currentRun); }
  });

  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);
  const baseScore = setScore + runScore + modifiers.cardBonus;
  const finalScore = Math.floor(baseScore * suitBonus.multiplier);

  const threshold = 50 + (state.difficulty * 30);
  const success = finalScore >= threshold;

  const parts: string[] = [];
  if (setCount > 0) parts.push(`${setCount} set${setCount > 1 ? 's' : ''}`);
  if (longestRun >= 3) parts.push(`run of ${longestRun}`);
  const handName = parts.length > 0 ? parts.join(', ') : 'No melds';

  let specialEffect = suitBonus.specialEffect;
  if (setCount >= 2 && longestRun >= 4) specialEffect = 'Perfect Collection!';
  else if (setCount >= 2 || longestRun >= 5) specialEffect = 'Strong Melds';

  return {
    success,
    score: finalScore,
    handName,
    suitMatches,
    suitBonus: { ...suitBonus, specialEffect },
    mitigation: success ? undefined : { damageReduction: Math.min(0.35, suitMatches * 0.1) }
  };
}

/**
 * Euchre - Team partnership game
 */
export function resolveEuchreGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  const trumpSuit = state.relevantSuit?.toLowerCase() || 'spades';
  let trickPotential = 0;
  let trumpCount = 0;

  state.hand.forEach(card => {
    const baseValue = card.rank === Rank.ACE ? 14 : card.rank === Rank.KING ? 13 :
                      card.rank === Rank.QUEEN ? 12 : card.rank === Rank.JACK ? 11 : card.rank as number;

    if (card.suit.toLowerCase() === trumpSuit) {
      if (card.rank === Rank.JACK) trickPotential += baseValue * 3;
      else trickPotential += baseValue * 2;
      trumpCount++;
    } else if (card.rank === Rank.JACK) {
      trickPotential += baseValue * 1.5;
    } else {
      trickPotential += baseValue;
    }
  });

  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);
  const coordinationBonus = Math.floor(modifiers.cardBonus * 0.8);
  const baseScore = trickPotential + coordinationBonus + modifiers.cardBonus;
  const finalScore = Math.floor(baseScore * suitBonus.multiplier);

  const threshold = 45 + (state.difficulty * 18);
  const success = finalScore >= threshold;

  let handName = `Trick Power: ${Math.floor(trickPotential)}`;
  if (trumpCount > 0) handName += ` (${trumpCount} trump)`;

  let specialEffect = suitBonus.specialEffect;
  if (trumpCount >= 4) specialEffect = 'Trump Domination!';
  else if (trumpCount >= 2 && trickPotential > 60) specialEffect = 'Strong Partnership';

  return {
    success,
    score: finalScore,
    handName,
    suitMatches,
    suitBonus: { ...suitBonus, specialEffect },
    mitigation: success ? undefined : { damageReduction: Math.min(0.4, suitMatches * 0.12) }
  };
}

/**
 * Cribbage - Counting and math game
 */
export function resolveCribbageGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  const cardData = state.hand.map(card => ({
    value: card.rank === Rank.ACE ? 1 : [Rank.KING, Rank.QUEEN, Rank.JACK].includes(card.rank) ? 10 :
           Math.min(10, card.rank as number),
    rank: card.rank === Rank.ACE ? 1 : card.rank === Rank.KING ? 13 :
          card.rank === Rank.QUEEN ? 12 : card.rank === Rank.JACK ? 11 : card.rank as number,
    suit: card.suit
  }));

  let cribbageScore = 0;
  const scoringDetails: string[] = [];

  // Count pairs
  const rankCounts: Record<number, number> = {};
  cardData.forEach(c => { rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1; });

  Object.values(rankCounts).forEach(count => {
    if (count === 2) { cribbageScore += 2; scoringDetails.push('Pair'); }
    else if (count === 3) { cribbageScore += 6; scoringDetails.push('Three of a Kind'); }
    else if (count === 4) { cribbageScore += 12; scoringDetails.push('Four of a Kind'); }
  });

  // Find 15s
  const values = cardData.map(c => c.value);
  let fifteenCount = 0;
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      if (values[i] + values[j] === 15) fifteenCount++;
      for (let k = j + 1; k < values.length; k++) {
        if (values[i] + values[j] + values[k] === 15) fifteenCount++;
        for (let l = k + 1; l < values.length; l++) {
          if (values[i] + values[j] + values[k] + values[l] === 15) fifteenCount++;
          for (let m = l + 1; m < values.length; m++) {
            if (values[i] + values[j] + values[k] + values[l] + values[m] === 15) fifteenCount++;
          }
        }
      }
    }
  }
  if (fifteenCount > 0) {
    cribbageScore += fifteenCount * 2;
    scoringDetails.push(`${fifteenCount} Fifteen${fifteenCount > 1 ? 's' : ''}`);
  }

  // Check for runs
  const ranks = cardData.map(c => c.rank).sort((a, b) => a - b);
  const uniqueRanks = [...new Set(ranks)];

  for (let len = uniqueRanks.length; len >= 3; len--) {
    for (let i = 0; i <= uniqueRanks.length - len; i++) {
      const slice = uniqueRanks.slice(i, i + len);
      let isRun = true;
      for (let j = 1; j < slice.length; j++) {
        if (slice[j] !== slice[j - 1] + 1) { isRun = false; break; }
      }
      if (isRun) {
        const multiplier = slice.reduce((mult, rank) => mult * (rankCounts[rank] || 1), 1);
        cribbageScore += len * multiplier;
        scoringDetails.push(multiplier > 1 ? `Double Run of ${len}` : `Run of ${len}`);
        break;
      }
    }
  }

  // Check for flush
  const suitCounts: Record<string, number> = {};
  cardData.forEach(c => { suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1; });
  const flushSuit = Object.entries(suitCounts).find(([, count]) => count >= 4);
  if (flushSuit) {
    cribbageScore += flushSuit[1];
    scoringDetails.push(`Flush ${flushSuit[1]}`);
  }

  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);
  const countingBonus = Math.floor(modifiers.cardBonus * 0.5);
  const baseScore = cribbageScore * 8 + countingBonus + modifiers.cardBonus;
  const finalScore = Math.floor(baseScore * suitBonus.multiplier);

  const threshold = 50 + (state.difficulty * 25);
  const success = finalScore >= threshold;

  const handName = scoringDetails.length > 0
    ? `${cribbageScore} pts: ${scoringDetails.slice(0, 3).join(', ')}`
    : 'No scoring combos';

  let specialEffect = suitBonus.specialEffect;
  if (cribbageScore >= 20) specialEffect = 'Perfect Hand!';
  else if (cribbageScore >= 12) specialEffect = 'Strong Count';

  return {
    success,
    score: finalScore,
    handName,
    suitMatches,
    suitBonus: { ...suitBonus, specialEffect },
    mitigation: success ? undefined : { damageReduction: Math.min(0.35, suitMatches * 0.1) }
  };
}
