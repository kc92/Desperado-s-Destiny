/**
 * Spades Game Service
 *
 * Implementation of Spades rules for team card games
 * - 52-card deck
 * - Spades always trump
 * - Team bidding (predict tricks)
 * - Nil and Blind Nil bids
 * - Bag penalties (10 overtricks = -100)
 * - First to 500 wins, or highest after agreed rounds
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
  getCardValue,
  getTeamIndex
} from '../trickTaking.service';
import { ITeamCardGameSession, ITeamCardPlayer } from '../../models/TeamCardGameSession.model';

// =============================================================================
// TYPES
// =============================================================================

export interface SpadesBid {
  tricks: number;
  nil: boolean;
  blindNil?: boolean;
}

export interface SpadesRoundResult {
  team0Bid: number;
  team1Bid: number;
  team0Made: number;
  team1Made: number;
  team0Score: number;
  team1Score: number;
  team0Bags: number;
  team1Bags: number;
  team0BagPenalty: boolean;
  team1BagPenalty: boolean;
  nilResults: {
    characterId: string;
    made: boolean;
    bonus: number;
  }[];
}

// =============================================================================
// GAME INITIALIZATION
// =============================================================================

/**
 * Initialize a Spades round
 */
export function initializeSpadesRound(session: ITeamCardGameSession): ITeamCardGameSession {
  // Create and shuffle deck
  let deck = createStandardDeck();
  deck = shuffleDeck(deck);

  // Deal 13 cards to each player
  const cardsPerPlayer = 13;
  for (let i = 0; i < 4; i++) {
    const startIndex = i * cardsPerPlayer;
    session.players[i].hand = deck.slice(startIndex, startIndex + cardsPerPlayer);
    session.players[i].tricksWonRound = 0;
    session.players[i].bid = undefined;
  }

  // Reset round state
  session.currentTrick = [];
  session.trickNumber = 0;
  session.tricksWon = [0, 0];

  // Move dealer
  session.dealer = (session.dealer + 1) % 4;

  // First bidder is left of dealer
  session.currentPlayer = (session.dealer + 1) % 4;

  return session;
}

// =============================================================================
// BIDDING
// =============================================================================

/**
 * Process a Spades bid
 */
export function processBid(
  session: ITeamCardGameSession,
  playerIndex: number,
  bid: SpadesBid
): ITeamCardGameSession {
  const player = session.players[playerIndex];

  // Validate bid
  if (bid.nil && bid.tricks !== 0) {
    throw new Error('Nil bid must have 0 tricks');
  }

  if (!bid.nil && (bid.tricks < 0 || bid.tricks > 13)) {
    throw new Error('Bid must be between 0 and 13');
  }

  // Blind nil can only be bid before looking at cards
  // (In practice, this would be checked before dealing in UI)

  // Store bid
  player.bid = bid;

  // Move to next bidder
  session.currentPlayer = (session.currentPlayer + 1) % 4;

  // Check if all players have bid
  const allBid = session.players.every(p => p.bid !== undefined);

  if (allBid) {
    // Calculate team bids
    const team0Bid = session.players
      .filter(p => p.teamIndex === 0)
      .reduce((sum, p) => sum + (p.bid?.nil ? 0 : p.bid?.tricks || 0), 0);

    const team1Bid = session.players
      .filter(p => p.teamIndex === 1)
      .reduce((sum, p) => sum + (p.bid?.nil ? 0 : p.bid?.tricks || 0), 0);

    // Store team bids in contract
    session.contract = {
      team0Bid,
      team1Bid
    };

    // First to play is left of dealer
    session.currentPlayer = (session.dealer + 1) % 4;
  }

  return session;
}

/**
 * Get recommended bid based on hand strength
 */
export function getRecommendedBid(hand: TrickCard[]): number {
  let estimatedTricks = 0;

  // Count spades
  const spades = hand.filter(c => c.suit === CardSuit.SPADES);
  spades.forEach(card => {
    const value = getCardValue(card, TeamCardGameType.SPADES, CardSuit.SPADES);
    if (value >= 12) estimatedTricks += 1; // A, K
    else if (value >= 10) estimatedTricks += 0.75; // Q
    else if (value >= 9) estimatedTricks += 0.5; // J
    else if (spades.length >= 4) estimatedTricks += 0.25; // Length bonus
  });

  // Count off-suit aces
  const offSuitAces = hand.filter(c =>
    c.rank === CardRank.ACE && c.suit !== CardSuit.SPADES
  );
  estimatedTricks += offSuitAces.length * 0.8;

  // Count protected kings (King with at least one other card in suit)
  const suits = [CardSuit.HEARTS, CardSuit.DIAMONDS, CardSuit.CLUBS];
  suits.forEach(suit => {
    const suitCards = hand.filter(c => c.suit === suit);
    const hasKing = suitCards.some(c => c.rank === CardRank.KING);
    if (hasKing && suitCards.length >= 2) {
      estimatedTricks += 0.5;
    }
  });

  // Count voids (can trump)
  suits.forEach(suit => {
    const suitCards = hand.filter(c => c.suit === suit);
    if (suitCards.length === 0 && spades.length >= 2) {
      estimatedTricks += 0.5;
    }
  });

  return Math.max(1, Math.round(estimatedTricks));
}

/**
 * Check if nil bid is advisable
 */
export function shouldBidNil(hand: TrickCard[]): boolean {
  // Count high cards
  let highCardCount = 0;
  hand.forEach(card => {
    const value = getCardValue(card, TeamCardGameType.SPADES, CardSuit.SPADES);
    if (value >= 10) highCardCount++;
  });

  // Count spades
  const spadeCount = hand.filter(c => c.suit === CardSuit.SPADES).length;

  // Nil is risky - need very weak hand
  return highCardCount <= 2 && spadeCount <= 2;
}

// =============================================================================
// CARD PLAY
// =============================================================================

/**
 * Get playable cards for Spades
 * - Must follow suit if possible
 * - Can't lead spades until broken (unless only spades left)
 */
export function getPlayableCardsSpades(
  hand: TrickCard[],
  currentTrick: PlayedCard[],
  spadesBroken: boolean
): TrickCard[] {
  if (currentTrick.length === 0) {
    // Leading
    if (!spadesBroken) {
      // Can't lead spades unless only spades in hand
      const nonSpades = hand.filter(c => c.suit !== CardSuit.SPADES);
      if (nonSpades.length > 0) {
        return nonSpades;
      }
    }
    return hand;
  }

  // Following - use standard trick-taking rules
  return getPlayableCards(hand, currentTrick, CardSuit.SPADES, TeamCardGameType.SPADES);
}

/**
 * Play a card in Spades
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
  spadesBroken?: boolean;
} {
  const player = session.players[playerIndex];
  const card = player.hand[cardIndex];

  if (!card) {
    throw new Error('Invalid card index');
  }

  // Validate play
  const playable = getPlayableCardsSpades(
    player.hand,
    session.currentTrick,
    session.heartsBroken || false // Using heartsBroken field for spadesBroken
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

  // Check if spades broken
  let spadesBroken = false;
  if (card.suit === CardSuit.SPADES && !session.heartsBroken) {
    session.heartsBroken = true; // Reusing field for spades broken
    spadesBroken = true;
  }

  // Check if trick complete
  if (session.currentTrick.length === 4) {
    const winnerIndex = determineTrickWinner(
      session.currentTrick,
      CardSuit.SPADES,
      TeamCardGameType.SPADES
    );

    // Award trick
    const winner = session.players[winnerIndex];
    winner.tricksWonRound++;
    session.tricksWon[winner.teamIndex]++;

    // Record trick result
    session.trickHistory.push({
      trickNumber: session.trickNumber,
      cards: [...session.currentTrick],
      winnerIndex,
      winnerId: winner.characterId,
      winnerTeam: winner.teamIndex,
      points: 1 // Each trick worth 1 point toward bid
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
      spadesBroken
    };
  }

  // Move to next player
  session.currentPlayer = (session.currentPlayer + 1) % 4;

  return {
    session,
    playedCard: card,
    trickComplete: false,
    spadesBroken
  };
}

// =============================================================================
// SCORING
// =============================================================================

/**
 * Calculate round score for Spades
 */
export function calculateRoundScore(session: ITeamCardGameSession): SpadesRoundResult {
  const team0Players = session.players.filter(p => p.teamIndex === 0);
  const team1Players = session.players.filter(p => p.teamIndex === 1);

  // Get bids and tricks
  const team0Bid = session.contract?.team0Bid || 0;
  const team1Bid = session.contract?.team1Bid || 0;
  const team0Made = session.tricksWon[0];
  const team1Made = session.tricksWon[1];

  // Process nil bids first
  const nilResults: SpadesRoundResult['nilResults'] = [];

  session.players.forEach(player => {
    if (player.bid?.nil) {
      const madeNil = player.tricksWonRound === 0;
      const bonus = player.bid.blindNil
        ? (madeNil ? 200 : -200)
        : (madeNil ? 100 : -100);

      nilResults.push({
        characterId: player.characterId,
        made: madeNil,
        bonus
      });
    }
  });

  // Calculate team scores (excluding nil bidders from team bid calculation)
  const team0NilBonus = nilResults
    .filter(n => team0Players.some(p => p.characterId === n.characterId))
    .reduce((sum, n) => sum + n.bonus, 0);

  const team1NilBonus = nilResults
    .filter(n => team1Players.some(p => p.characterId === n.characterId))
    .reduce((sum, n) => sum + n.bonus, 0);

  let team0Score = 0;
  let team1Score = 0;
  let team0Bags = 0;
  let team1Bags = 0;
  let team0BagPenalty = false;
  let team1BagPenalty = false;

  // Team 0 scoring
  if (team0Bid > 0) {
    if (team0Made >= team0Bid) {
      // Made bid
      team0Score = team0Bid * 10;
      team0Bags = team0Made - team0Bid;
      team0Score += team0Bags; // 1 point per bag
    } else {
      // Set (didn't make bid)
      team0Score = -team0Bid * 10;
    }
  }

  // Team 1 scoring
  if (team1Bid > 0) {
    if (team1Made >= team1Bid) {
      // Made bid
      team1Score = team1Bid * 10;
      team1Bags = team1Made - team1Bid;
      team1Score += team1Bags;
    } else {
      // Set
      team1Score = -team1Bid * 10;
    }
  }

  // Add nil bonuses
  team0Score += team0NilBonus;
  team1Score += team1NilBonus;

  // Check bag penalties (cumulative bags tracked in session.bags)
  const currentBags = session.bags || [0, 0];

  const newTeam0Bags = currentBags[0] + team0Bags;
  const newTeam1Bags = currentBags[1] + team1Bags;

  if (newTeam0Bags >= 10) {
    team0Score -= 100;
    team0BagPenalty = true;
    session.bags = [newTeam0Bags - 10, newTeam1Bags];
  } else {
    session.bags = [newTeam0Bags, newTeam1Bags];
  }

  if (session.bags && session.bags[1] >= 10) {
    team1Score -= 100;
    team1BagPenalty = true;
    session.bags[1] -= 10;
  }

  return {
    team0Bid,
    team1Bid,
    team0Made,
    team1Made,
    team0Score,
    team1Score,
    team0Bags,
    team1Bags,
    team0BagPenalty,
    team1BagPenalty,
    nilResults
  };
}

/**
 * Apply round score to session
 */
export function applyRoundScore(
  session: ITeamCardGameSession,
  result: SpadesRoundResult
): ITeamCardGameSession {
  // Update team scores
  session.teamScores[0] += result.team0Score;
  session.teamScores[1] += result.team1Score;

  // Record round score
  const roundScore: TeamCardRoundScore = {
    roundNumber: session.currentRound,
    team0Score: result.team0Score,
    team1Score: result.team1Score,
    tricksWon: [...session.tricksWon] as [number, number],
    team0RoundWins: result.team0Made,
    team1RoundWins: result.team1Made,
    details: {
      bids: { team0: result.team0Bid, team1: result.team1Bid },
      bags: { team0: result.team0Bags, team1: result.team1Bags },
      bagPenalties: { team0: result.team0BagPenalty, team1: result.team1BagPenalty },
      nilResults: result.nilResults
    }
  };

  session.roundScores.push(roundScore);

  return session;
}

/**
 * Check if game is complete
 */
export function isGameComplete(session: ITeamCardGameSession): {
  complete: boolean;
  winningTeam?: 0 | 1;
  reason?: string;
} {
  // Win by reaching 500 points
  if (session.teamScores[0] >= 500 && session.teamScores[0] > session.teamScores[1]) {
    return { complete: true, winningTeam: 0, reason: 'Reached 500 points' };
  }

  if (session.teamScores[1] >= 500 && session.teamScores[1] > session.teamScores[0]) {
    return { complete: true, winningTeam: 1, reason: 'Reached 500 points' };
  }

  // Both teams over 500 - higher score wins
  if (session.teamScores[0] >= 500 && session.teamScores[1] >= 500) {
    const winningTeam = session.teamScores[0] > session.teamScores[1] ? 0 : 1;
    return { complete: true, winningTeam, reason: 'Both teams over 500 - higher score wins' };
  }

  // Lose by going below -200
  if (session.teamScores[0] <= -200) {
    return { complete: true, winningTeam: 1, reason: 'Opponent reached -200 points' };
  }

  if (session.teamScores[1] <= -200) {
    return { complete: true, winningTeam: 0, reason: 'Opponent reached -200 points' };
  }

  // Check max rounds
  if (session.currentRound >= session.maxRounds) {
    const winningTeam = session.teamScores[0] > session.teamScores[1] ? 0 : 1;
    return { complete: true, winningTeam, reason: 'Max rounds reached' };
  }

  return { complete: false };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const SpadesService = {
  initializeSpadesRound,
  processBid,
  getRecommendedBid,
  shouldBidNil,
  getPlayableCardsSpades,
  playCard,
  calculateRoundScore,
  applyRoundScore,
  isGameComplete
};
