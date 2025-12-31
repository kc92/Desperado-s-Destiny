/**
 * Hearts Game Service
 *
 * Implementation of Hearts rules for team card games
 * - 52-card deck, no trump
 * - Point avoidance game
 * - Hearts = 1 point each, Queen of Spades = 13 points
 * - Can't lead hearts until broken
 * - Shoot the moon = 0 points for you, 26 for everyone else
 * - First to 100 loses
 *
 * Note: Hearts is typically an individual game, but in team mode
 * we sum team members' points together.
 */

import {
  TrickCard,
  CardSuit,
  CardRank,
  TeamCardGameType,
  PlayedCard,
  TeamCardRoundScore
} from '@desperados/shared';
import {
  createStandardDeck,
  shuffleDeck,
  getPlayableCards,
  determineTrickWinner,
  getCardValue
} from '../trickTaking.service';
import { ITeamCardGameSession, ITeamCardPlayer } from '../../models/TeamCardGameSession.model';

// =============================================================================
// TYPES
// =============================================================================

export interface HeartsRoundResult {
  playerPoints: number[]; // Points taken by each player this round
  teamPoints: [number, number];
  shootTheMoon?: {
    playerId: string;
    playerIndex: number;
  };
}

// =============================================================================
// CONSTANTS
// =============================================================================

const QUEEN_OF_SPADES_POINTS = 13;
const HEART_POINTS = 1;
const SHOOT_MOON_POINTS = 26;
const LOSING_SCORE = 100;

// =============================================================================
// GAME INITIALIZATION
// =============================================================================

/**
 * Initialize a Hearts round
 */
export function initializeHeartsRound(session: ITeamCardGameSession): ITeamCardGameSession {
  // Create and shuffle deck
  let deck = createStandardDeck();
  deck = shuffleDeck(deck);

  // Deal 13 cards to each player
  const cardsPerPlayer = 13;
  for (let i = 0; i < 4; i++) {
    const startIndex = i * cardsPerPlayer;
    session.players[i].hand = deck.slice(startIndex, startIndex + cardsPerPlayer);
    session.players[i].tricksWonRound = 0;
  }

  // Reset round state
  session.currentTrick = [];
  session.trickNumber = 0;
  session.tricksWon = [0, 0];
  session.heartsBroken = false;
  session.pointsTaken = [0, 0, 0, 0];

  // Player with 2 of clubs leads first
  const twoOfClubsIndex = findTwoOfClubsHolder(session.players);
  session.currentPlayer = twoOfClubsIndex;

  return session;
}

/**
 * Find which player has the 2 of clubs
 */
function findTwoOfClubsHolder(players: ITeamCardPlayer[]): number {
  for (let i = 0; i < players.length; i++) {
    const hasTwoOfClubs = players[i].hand.some(
      c => c.suit === CardSuit.CLUBS && c.rank === CardRank.TWO
    );
    if (hasTwoOfClubs) {
      return i;
    }
  }
  return 0; // Fallback
}

// =============================================================================
// CARD PASSING (Optional variant)
// =============================================================================

/**
 * Get pass direction based on round number
 * Round 1: Pass left
 * Round 2: Pass right
 * Round 3: Pass across
 * Round 4: No pass
 * Then repeat
 */
export function getPassDirection(roundNumber: number): 'left' | 'right' | 'across' | 'none' {
  const cycle = (roundNumber - 1) % 4;
  switch (cycle) {
    case 0: return 'left';
    case 1: return 'right';
    case 2: return 'across';
    case 3: return 'none';
    default: return 'none';
  }
}

/**
 * Get the target player index for passing
 */
export function getPassTarget(
  playerIndex: number,
  direction: 'left' | 'right' | 'across'
): number {
  switch (direction) {
    case 'left': return (playerIndex + 1) % 4;
    case 'right': return (playerIndex + 3) % 4;
    case 'across': return (playerIndex + 2) % 4;
  }
}

// =============================================================================
// CARD PLAY
// =============================================================================

/**
 * Get playable cards for Hearts
 * - Must follow suit if possible
 * - Can't lead hearts until broken
 * - First trick: can't play hearts or Queen of Spades
 */
export function getPlayableCardsHearts(
  hand: TrickCard[],
  currentTrick: PlayedCard[],
  heartsBroken: boolean,
  isFirstTrick: boolean
): TrickCard[] {
  if (currentTrick.length === 0) {
    // Leading
    if (isFirstTrick) {
      // Must lead 2 of clubs on first trick
      const twoOfClubs = hand.find(
        c => c.suit === CardSuit.CLUBS && c.rank === CardRank.TWO
      );
      if (twoOfClubs) {
        return [twoOfClubs];
      }
    }

    if (!heartsBroken) {
      // Can't lead hearts unless only hearts left
      const nonHearts = hand.filter(c => c.suit !== CardSuit.HEARTS);
      if (nonHearts.length > 0) {
        return nonHearts;
      }
    }

    return hand;
  }

  // Following
  const leadSuit = currentTrick[0].card.suit;
  const sameSuit = hand.filter(c => c.suit === leadSuit);

  if (sameSuit.length > 0) {
    return sameSuit;
  }

  // Can't follow suit
  if (isFirstTrick) {
    // Can't play hearts or Queen of Spades on first trick
    const safe = hand.filter(c =>
      c.suit !== CardSuit.HEARTS &&
      !(c.suit === CardSuit.SPADES && c.rank === CardRank.QUEEN)
    );
    if (safe.length > 0) {
      return safe;
    }
  }

  // Any card is playable
  return hand;
}

/**
 * Check if a card is a point card
 */
export function isPointCard(card: TrickCard): boolean {
  return card.suit === CardSuit.HEARTS ||
    (card.suit === CardSuit.SPADES && card.rank === CardRank.QUEEN);
}

/**
 * Calculate points in a trick
 */
export function calculateTrickPoints(trick: PlayedCard[]): number {
  let points = 0;

  for (const played of trick) {
    if (played.card.suit === CardSuit.HEARTS) {
      points += HEART_POINTS;
    } else if (
      played.card.suit === CardSuit.SPADES &&
      played.card.rank === CardRank.QUEEN
    ) {
      points += QUEEN_OF_SPADES_POINTS;
    }
  }

  return points;
}

/**
 * Play a card in Hearts
 */
export function playCard(
  session: ITeamCardGameSession,
  playerIndex: number,
  cardIndex: number
): {
  session: ITeamCardGameSession;
  playedCard: TrickCard;
  trickComplete: boolean;
  trickWinner?: number;
  trickPoints?: number;
  heartsBroken?: boolean;
} {
  const player = session.players[playerIndex];
  const card = player.hand[cardIndex];

  if (!card) {
    throw new Error('Invalid card index');
  }

  // Validate play
  const isFirstTrick = session.trickNumber === 0 && session.currentTrick.length === 0;
  const playable = getPlayableCardsHearts(
    player.hand,
    session.currentTrick,
    session.heartsBroken || false,
    isFirstTrick
  );

  const isPlayable = playable.some(c => c.suit === card.suit && c.rank === card.rank);
  if (!isPlayable) {
    throw new Error('Card is not playable');
  }

  // Remove card from hand
  player.hand.splice(cardIndex, 1);

  // Add to current trick
  session.currentTrick.push({
    card,
    playerIndex,
    timestamp: Date.now()
  });

  // Check if hearts broken
  let heartsBroken = false;
  if (card.suit === CardSuit.HEARTS && !session.heartsBroken) {
    session.heartsBroken = true;
    heartsBroken = true;
  }

  // Check if trick complete
  if (session.currentTrick.length === 4) {
    // No trump in Hearts
    const winnerIndex = determineTrickWinner(
      session.currentTrick,
      undefined,
      TeamCardGameType.HEARTS
    );

    // Calculate points in trick
    const trickPoints = calculateTrickPoints(session.currentTrick);

    // Award trick and points
    const winner = session.players[winnerIndex];
    winner.tricksWonRound++;
    session.tricksWon[winner.teamIndex]++;

    // Track individual points
    const currentPoints = session.pointsTaken || [0, 0, 0, 0];
    currentPoints[winnerIndex] += trickPoints;
    session.pointsTaken = currentPoints;

    // Record trick result
    session.trickHistory.push({
      trickNumber: session.trickNumber,
      cards: [...session.currentTrick],
      winnerIndex,
      winnerId: winner.characterId,
      winnerTeam: winner.teamIndex,
      points: trickPoints
    });

    // Reset for next trick
    session.currentTrick = [];
    session.trickNumber++;
    session.currentPlayer = winnerIndex;

    return {
      session,
      playedCard: card,
      trickComplete: true,
      trickWinner: winnerIndex,
      trickPoints,
      heartsBroken
    };
  }

  // Move to next player
  session.currentPlayer = (session.currentPlayer + 1) % 4;

  return {
    session,
    playedCard: card,
    trickComplete: false,
    heartsBroken
  };
}

// =============================================================================
// SCORING
// =============================================================================

/**
 * Check for shoot the moon
 */
export function checkShootTheMoon(pointsTaken: number[]): {
  shot: boolean;
  playerIndex?: number;
} {
  for (let i = 0; i < pointsTaken.length; i++) {
    if (pointsTaken[i] === SHOOT_MOON_POINTS) {
      return { shot: true, playerIndex: i };
    }
  }
  return { shot: false };
}

/**
 * Calculate round score for Hearts
 */
export function calculateRoundScore(session: ITeamCardGameSession): HeartsRoundResult {
  const pointsTaken = session.pointsTaken || [0, 0, 0, 0];

  // Check for shoot the moon
  const moonCheck = checkShootTheMoon(pointsTaken);

  let finalPoints: number[];

  if (moonCheck.shot && moonCheck.playerIndex !== undefined) {
    // Shooter gets 0, everyone else gets 26
    finalPoints = pointsTaken.map((_, i) =>
      i === moonCheck.playerIndex ? 0 : SHOOT_MOON_POINTS
    );
  } else {
    finalPoints = [...pointsTaken];
  }

  // Calculate team points
  const team0Points = session.players
    .filter(p => p.teamIndex === 0)
    .reduce((sum, p) => {
      const idx = session.players.indexOf(p);
      return sum + finalPoints[idx];
    }, 0);

  const team1Points = session.players
    .filter(p => p.teamIndex === 1)
    .reduce((sum, p) => {
      const idx = session.players.indexOf(p);
      return sum + finalPoints[idx];
    }, 0);

  return {
    playerPoints: finalPoints,
    teamPoints: [team0Points, team1Points],
    shootTheMoon: moonCheck.shot
      ? {
          playerId: session.players[moonCheck.playerIndex!].characterId,
          playerIndex: moonCheck.playerIndex!
        }
      : undefined
  };
}

/**
 * Apply round score to session
 * Note: In Hearts, lower is better, so we track points as penalty
 */
export function applyRoundScore(
  session: ITeamCardGameSession,
  result: HeartsRoundResult
): ITeamCardGameSession {
  // Add points (penalty) to team scores
  session.teamScores[0] += result.teamPoints[0];
  session.teamScores[1] += result.teamPoints[1];

  // Record round score
  const roundScore: TeamCardRoundScore = {
    roundNumber: session.currentRound,
    team0Score: result.teamPoints[0],
    team1Score: result.teamPoints[1],
    tricksWon: [...session.tricksWon] as [number, number],
    team0RoundWins: 0, // Not applicable for Hearts
    team1RoundWins: 0,
    details: {
      playerPoints: result.playerPoints,
      shootTheMoon: result.shootTheMoon
    }
  };

  session.roundScores.push(roundScore);

  return session;
}

/**
 * Check if game is complete
 * In Hearts, first team to 100 loses
 */
export function isGameComplete(session: ITeamCardGameSession): {
  complete: boolean;
  losingTeam?: 0 | 1;
  winningTeam?: 0 | 1;
  reason?: string;
} {
  // Team reaching 100 points loses
  if (session.teamScores[0] >= LOSING_SCORE && session.teamScores[1] >= LOSING_SCORE) {
    // Both over - lower score wins
    const losingTeam = session.teamScores[0] > session.teamScores[1] ? 0 : 1;
    return {
      complete: true,
      losingTeam,
      winningTeam: losingTeam === 0 ? 1 : 0,
      reason: 'Both teams over 100 - lower score wins'
    };
  }

  if (session.teamScores[0] >= LOSING_SCORE) {
    return {
      complete: true,
      losingTeam: 0,
      winningTeam: 1,
      reason: 'Team 0 reached 100 points'
    };
  }

  if (session.teamScores[1] >= LOSING_SCORE) {
    return {
      complete: true,
      losingTeam: 1,
      winningTeam: 0,
      reason: 'Team 1 reached 100 points'
    };
  }

  // Check max rounds
  if (session.currentRound >= session.maxRounds) {
    const losingTeam = session.teamScores[0] > session.teamScores[1] ? 0 : 1;
    return {
      complete: true,
      losingTeam,
      winningTeam: losingTeam === 0 ? 1 : 0,
      reason: 'Max rounds reached - lower score wins'
    };
  }

  return { complete: false };
}

// =============================================================================
// AI HELPERS
// =============================================================================

/**
 * Evaluate danger of a card (for AI decisions)
 */
export function evaluateCardDanger(
  card: TrickCard,
  hand: TrickCard[]
): number {
  let danger = 0;

  // Queen of Spades is very dangerous
  if (card.suit === CardSuit.SPADES && card.rank === CardRank.QUEEN) {
    danger += 50;
  }

  // High spades are dangerous (might catch the Queen)
  if (card.suit === CardSuit.SPADES) {
    const value = getCardValue(card, TeamCardGameType.HEARTS, undefined);
    if (value >= 12) danger += 20; // A, K
    else if (value >= 10) danger += 10; // Q (handled above), J
  }

  // High hearts are somewhat dangerous
  if (card.suit === CardSuit.HEARTS) {
    const value = getCardValue(card, TeamCardGameType.HEARTS, undefined);
    danger += 5 + (value - 8); // More danger for higher hearts
  }

  // Aces in any suit can win tricks with points
  if (card.rank === CardRank.ACE) {
    danger += 15;
  }

  return danger;
}

/**
 * Get safest cards to pass
 */
export function getSafePassCards(hand: TrickCard[]): TrickCard[] {
  // Sort by danger descending
  const ranked = hand.map(card => ({
    card,
    danger: evaluateCardDanger(card, hand)
  }));

  ranked.sort((a, b) => b.danger - a.danger);

  // Return top 3 most dangerous
  return ranked.slice(0, 3).map(r => r.card);
}

// =============================================================================
// EXPORTS
// =============================================================================

export const HeartsService = {
  initializeHeartsRound,
  getPassDirection,
  getPassTarget,
  getPlayableCardsHearts,
  isPointCard,
  calculateTrickPoints,
  playCard,
  checkShootTheMoon,
  calculateRoundScore,
  applyRoundScore,
  isGameComplete,
  evaluateCardDanger,
  getSafePassCards
};
