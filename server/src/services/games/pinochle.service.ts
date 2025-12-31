/**
 * Pinochle Game Service
 *
 * Implementation of Pinochle rules for team card games
 * - 48-card deck (two copies of 9-A in each suit)
 * - Bidding phase
 * - Melding phase (declare card combinations for points)
 * - Trick-taking phase
 * - Counters (A, 10, K) worth points
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
  createPinochleDeck,
  shuffleDeck,
  getPlayableCards,
  determineTrickWinner
} from '../trickTaking.service';
import { ITeamCardGameSession, ITeamCardPlayer } from '../../models/TeamCardGameSession.model';

// =============================================================================
// TYPES
// =============================================================================

export interface PinochleBid {
  points: number;
  pass?: boolean;
}

export interface PinochleMeld {
  type: MeldType;
  cards: TrickCard[];
  points: number;
}

export enum MeldType {
  // Class I - Runs & Marriages
  RUN = 'run', // A-10-K-Q-J of trump (150 pts)
  ROYAL_MARRIAGE = 'royal_marriage', // K-Q of trump (40 pts)
  MARRIAGE = 'marriage', // K-Q of any suit (20 pts)
  DIX = 'dix', // 9 of trump (10 pts)

  // Class II - Pinochles
  DOUBLE_PINOCHLE = 'double_pinochle', // Both Jd and Qs (300 pts)
  PINOCHLE = 'pinochle', // Jd + Qs (40 pts)

  // Class III - Arounds
  DOUBLE_ACES_AROUND = 'double_aces_around', // 2 of each ace (1000 pts)
  ACES_AROUND = 'aces_around', // 1 of each ace (100 pts)
  DOUBLE_KINGS_AROUND = 'double_kings_around', // 2 of each king (800 pts)
  KINGS_AROUND = 'kings_around', // 1 of each king (80 pts)
  DOUBLE_QUEENS_AROUND = 'double_queens_around', // 2 of each queen (600 pts)
  QUEENS_AROUND = 'queens_around', // 1 of each queen (60 pts)
  DOUBLE_JACKS_AROUND = 'double_jacks_around', // 2 of each jack (400 pts)
  JACKS_AROUND = 'jacks_around' // 1 of each jack (40 pts)
}

export interface PinochleRoundResult {
  bidWinnerIndex: number;
  bidAmount: number;
  team0Meld: number;
  team1Meld: number;
  team0Counters: number;
  team1Counters: number;
  team0Total: number;
  team1Total: number;
  bidMade: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MELD_VALUES: Record<MeldType, number> = {
  [MeldType.RUN]: 150,
  [MeldType.ROYAL_MARRIAGE]: 40,
  [MeldType.MARRIAGE]: 20,
  [MeldType.DIX]: 10,
  [MeldType.DOUBLE_PINOCHLE]: 300,
  [MeldType.PINOCHLE]: 40,
  [MeldType.DOUBLE_ACES_AROUND]: 1000,
  [MeldType.ACES_AROUND]: 100,
  [MeldType.DOUBLE_KINGS_AROUND]: 800,
  [MeldType.KINGS_AROUND]: 80,
  [MeldType.DOUBLE_QUEENS_AROUND]: 600,
  [MeldType.QUEENS_AROUND]: 60,
  [MeldType.DOUBLE_JACKS_AROUND]: 400,
  [MeldType.JACKS_AROUND]: 40
};

// Counter values in tricks
const COUNTER_VALUES: Record<string, number> = {
  [CardRank.ACE]: 11,
  [CardRank.TEN]: 10,
  [CardRank.KING]: 4,
  [CardRank.QUEEN]: 3,
  [CardRank.JACK]: 2,
  [CardRank.NINE]: 0
};

// =============================================================================
// GAME INITIALIZATION
// =============================================================================

/**
 * Initialize a Pinochle round
 */
export function initializePinochleRound(session: ITeamCardGameSession): ITeamCardGameSession {
  // Create and shuffle Pinochle deck
  let deck = createPinochleDeck();
  deck = shuffleDeck(deck);

  // Deal 12 cards to each player (48 / 4 = 12)
  const cardsPerPlayer = 12;
  for (let i = 0; i < 4; i++) {
    const startIndex = i * cardsPerPlayer;
    session.players[i].hand = deck.slice(startIndex, startIndex + cardsPerPlayer);
    session.players[i].tricksWonRound = 0;
    session.players[i].bid = undefined;
    session.players[i].melds = [];
  }

  // Reset state
  session.currentTrick = [];
  session.trickNumber = 0;
  session.tricksWon = [0, 0];
  session.trump = undefined;
  session.contract = undefined;

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
 * Get minimum opening bid
 */
export function getMinimumBid(): number {
  return 250; // Standard minimum bid
}

/**
 * Process a Pinochle bid
 */
export function processBid(
  session: ITeamCardGameSession,
  playerIndex: number,
  bid: PinochleBid
): {
  session: ITeamCardGameSession;
  biddingComplete: boolean;
  bidWinner?: number;
} {
  const player = session.players[playerIndex];

  // Get current high bid
  const currentHighBid = session.players
    .map(p => p.bid as PinochleBid | undefined)
    .filter(b => b && !b.pass)
    .reduce((max, b) => Math.max(max, b?.points || 0), 0);

  // Validate bid
  if (!bid.pass) {
    const minBid = currentHighBid > 0 ? currentHighBid + 10 : getMinimumBid();
    if (bid.points < minBid) {
      throw new Error(`Bid must be at least ${minBid}`);
    }
  }

  // Store bid
  player.bid = bid;

  // Count passes
  const allBids = session.players.map(p => p.bid as PinochleBid | undefined);
  const nonPassBids = allBids.filter(b => b && !b.pass);
  const passCount = allBids.filter(b => b?.pass).length;

  // Bidding complete when 3 players pass after a bid
  if (nonPassBids.length > 0 && passCount >= 3) {
    // Find high bidder
    let highBidder = 0;
    let highBid = 0;
    session.players.forEach((p, i) => {
      const pBid = p.bid as PinochleBid | undefined;
      if (pBid && !pBid.pass && pBid.points > highBid) {
        highBid = pBid.points;
        highBidder = i;
      }
    });

    session.contract = {
      bidder: highBidder,
      amount: highBid
    };

    // High bidder declares trump
    session.currentPlayer = highBidder;

    return { session, biddingComplete: true, bidWinner: highBidder };
  }

  // Move to next bidder (skip those who passed)
  let nextPlayer = (session.currentPlayer + 1) % 4;
  while (session.players[nextPlayer].bid?.pass && nextPlayer !== playerIndex) {
    nextPlayer = (nextPlayer + 1) % 4;
  }
  session.currentPlayer = nextPlayer;

  return { session, biddingComplete: false };
}

/**
 * Declare trump suit
 */
export function declareTrump(
  session: ITeamCardGameSession,
  playerIndex: number,
  trump: CardSuit
): ITeamCardGameSession {
  if (session.contract?.bidder !== playerIndex) {
    throw new Error('Only bid winner can declare trump');
  }

  session.trump = trump;
  return session;
}

// =============================================================================
// MELDING
// =============================================================================

/**
 * Find all possible melds in a hand
 */
export function findMelds(hand: TrickCard[], trump: CardSuit): PinochleMeld[] {
  const melds: PinochleMeld[] = [];

  // Count cards by suit and rank
  const cardCounts: Record<string, TrickCard[]> = {};
  const suitCounts: Record<string, Record<string, TrickCard[]>> = {};

  for (const suit of Object.values(CardSuit)) {
    suitCounts[suit] = {};
    for (const rank of [CardRank.NINE, CardRank.JACK, CardRank.QUEEN, CardRank.KING, CardRank.TEN, CardRank.ACE]) {
      const key = `${suit}_${rank}`;
      cardCounts[key] = hand.filter(c => c.suit === suit && c.rank === rank);
      suitCounts[suit][rank] = cardCounts[key];
    }
  }

  // Check for Run (A-10-K-Q-J of trump)
  const trumpCards = suitCounts[trump];
  if (trumpCards[CardRank.ACE].length > 0 &&
      trumpCards[CardRank.TEN].length > 0 &&
      trumpCards[CardRank.KING].length > 0 &&
      trumpCards[CardRank.QUEEN].length > 0 &&
      trumpCards[CardRank.JACK].length > 0) {
    melds.push({
      type: MeldType.RUN,
      cards: [
        trumpCards[CardRank.ACE][0],
        trumpCards[CardRank.TEN][0],
        trumpCards[CardRank.KING][0],
        trumpCards[CardRank.QUEEN][0],
        trumpCards[CardRank.JACK][0]
      ],
      points: MELD_VALUES[MeldType.RUN]
    });
  }

  // Check for Royal Marriage (K-Q of trump)
  if (trumpCards[CardRank.KING].length > 0 && trumpCards[CardRank.QUEEN].length > 0) {
    // Only count if not part of run
    const hasRun = melds.some(m => m.type === MeldType.RUN);
    if (!hasRun) {
      melds.push({
        type: MeldType.ROYAL_MARRIAGE,
        cards: [trumpCards[CardRank.KING][0], trumpCards[CardRank.QUEEN][0]],
        points: MELD_VALUES[MeldType.ROYAL_MARRIAGE]
      });
    }
  }

  // Check for regular Marriages (K-Q of any suit)
  for (const suit of Object.values(CardSuit)) {
    if (suit === trump) continue; // Skip trump (handled above)
    const cards = suitCounts[suit];
    if (cards[CardRank.KING].length > 0 && cards[CardRank.QUEEN].length > 0) {
      melds.push({
        type: MeldType.MARRIAGE,
        cards: [cards[CardRank.KING][0], cards[CardRank.QUEEN][0]],
        points: MELD_VALUES[MeldType.MARRIAGE]
      });
    }
  }

  // Check for Pinochle (Jack of Diamonds + Queen of Spades)
  const jacksOfDiamonds = suitCounts[CardSuit.DIAMONDS][CardRank.JACK];
  const queensOfSpades = suitCounts[CardSuit.SPADES][CardRank.QUEEN];

  if (jacksOfDiamonds.length >= 2 && queensOfSpades.length >= 2) {
    melds.push({
      type: MeldType.DOUBLE_PINOCHLE,
      cards: [...jacksOfDiamonds, ...queensOfSpades],
      points: MELD_VALUES[MeldType.DOUBLE_PINOCHLE]
    });
  } else if (jacksOfDiamonds.length >= 1 && queensOfSpades.length >= 1) {
    melds.push({
      type: MeldType.PINOCHLE,
      cards: [jacksOfDiamonds[0], queensOfSpades[0]],
      points: MELD_VALUES[MeldType.PINOCHLE]
    });
  }

  // Check for Arounds
  const checkAround = (rank: CardRank, singleType: MeldType, doubleType: MeldType) => {
    const counts = Object.values(CardSuit).map(suit => suitCounts[suit][rank].length);
    const minCount = Math.min(...counts);

    if (minCount >= 2) {
      const cards: TrickCard[] = [];
      Object.values(CardSuit).forEach(suit => {
        cards.push(...suitCounts[suit][rank].slice(0, 2));
      });
      melds.push({ type: doubleType, cards, points: MELD_VALUES[doubleType] });
    } else if (minCount >= 1) {
      const cards: TrickCard[] = [];
      Object.values(CardSuit).forEach(suit => {
        cards.push(suitCounts[suit][rank][0]);
      });
      melds.push({ type: singleType, cards, points: MELD_VALUES[singleType] });
    }
  };

  checkAround(CardRank.ACE, MeldType.ACES_AROUND, MeldType.DOUBLE_ACES_AROUND);
  checkAround(CardRank.KING, MeldType.KINGS_AROUND, MeldType.DOUBLE_KINGS_AROUND);
  checkAround(CardRank.QUEEN, MeldType.QUEENS_AROUND, MeldType.DOUBLE_QUEENS_AROUND);
  checkAround(CardRank.JACK, MeldType.JACKS_AROUND, MeldType.DOUBLE_JACKS_AROUND);

  // Check for Dix (9 of trump)
  if (trumpCards[CardRank.NINE].length > 0) {
    melds.push({
      type: MeldType.DIX,
      cards: [trumpCards[CardRank.NINE][0]],
      points: MELD_VALUES[MeldType.DIX]
    });
  }

  return melds;
}

/**
 * Calculate total meld points for a hand
 */
export function calculateMeldPoints(melds: PinochleMeld[]): number {
  return melds.reduce((sum, meld) => sum + meld.points, 0);
}

/**
 * Process meld declarations
 */
export function processMelds(
  session: ITeamCardGameSession,
  playerIndex: number,
  selectedMelds: PinochleMeld[]
): ITeamCardGameSession {
  const player = session.players[playerIndex];
  const trump = session.trump as CardSuit;

  // Validate melds
  const possibleMelds = findMelds(player.hand, trump);

  for (const selectedMeld of selectedMelds) {
    const isValid = possibleMelds.some(m =>
      m.type === selectedMeld.type &&
      m.points === selectedMeld.points
    );
    if (!isValid) {
      throw new Error(`Invalid meld: ${selectedMeld.type}`);
    }
  }

  player.melds = selectedMelds;
  return session;
}

// =============================================================================
// CARD PLAY
// =============================================================================

/**
 * Get playable cards for Pinochle
 * Must follow suit, must head the trick if possible
 */
export function getPlayableCardsPinochle(
  hand: TrickCard[],
  currentTrick: PlayedCard[],
  trump: CardSuit
): TrickCard[] {
  if (currentTrick.length === 0) {
    // Leading - can play any card
    return hand;
  }

  const leadSuit = currentTrick[0].card.suit;
  const sameSuit = hand.filter(c => c.suit === leadSuit);

  if (sameSuit.length > 0) {
    // Must follow suit
    // Must head the trick if possible
    const currentWinningCard = getCurrentWinningCard(currentTrick, trump);

    if (currentWinningCard.card.suit === leadSuit) {
      // Winning card is same suit - must beat it if possible
      const higherCards = sameSuit.filter(c =>
        getCardValuePinochle(c) > getCardValuePinochle(currentWinningCard.card)
      );

      if (higherCards.length > 0) {
        return higherCards;
      }
    }

    return sameSuit;
  }

  // Can't follow suit
  const trumpCards = hand.filter(c => c.suit === trump);

  if (trumpCards.length > 0) {
    // Must trump if possible
    const currentWinningCard = getCurrentWinningCard(currentTrick, trump);

    if (currentWinningCard.card.suit === trump) {
      // Trick already trumped - must overtrump if possible
      const higherTrump = trumpCards.filter(c =>
        getCardValuePinochle(c) > getCardValuePinochle(currentWinningCard.card)
      );

      if (higherTrump.length > 0) {
        return higherTrump;
      }
    }

    return trumpCards;
  }

  // No trump, can play any card
  return hand;
}

/**
 * Get current winning card in trick
 */
function getCurrentWinningCard(
  trick: PlayedCard[],
  trump: CardSuit
): PlayedCard {
  const leadSuit = trick[0].card.suit;
  let winner = trick[0];

  for (let i = 1; i < trick.length; i++) {
    const card = trick[i];

    if (card.card.suit === trump && winner.card.suit !== trump) {
      winner = card;
    } else if (card.card.suit === winner.card.suit) {
      if (getCardValuePinochle(card.card) > getCardValuePinochle(winner.card)) {
        winner = card;
      }
    }
  }

  return winner;
}

/**
 * Get card value for Pinochle (rank order: 9-J-Q-K-10-A)
 */
function getCardValuePinochle(card: TrickCard): number {
  const rankOrder: Record<string, number> = {
    [CardRank.NINE]: 0,
    [CardRank.JACK]: 1,
    [CardRank.QUEEN]: 2,
    [CardRank.KING]: 3,
    [CardRank.TEN]: 4,
    [CardRank.ACE]: 5
  };
  return rankOrder[card.rank] || 0;
}

/**
 * Play a card in Pinochle
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
  counterPoints?: number;
} {
  const player = session.players[playerIndex];
  const card = player.hand[cardIndex];
  const trump = session.trump as CardSuit;

  if (!card) {
    throw new Error('Invalid card index');
  }

  // Validate play
  const playable = getPlayableCardsPinochle(player.hand, session.currentTrick, trump);
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

  // Check if trick complete
  if (session.currentTrick.length === 4) {
    const winnerIndex = determineTrickWinner(
      session.currentTrick,
      trump,
      TeamCardGameType.PINOCHLE
    );

    // Calculate counter points in trick
    const counterPoints = session.currentTrick.reduce((sum, played) =>
      sum + COUNTER_VALUES[played.card.rank], 0
    );

    // Award trick
    const winner = session.players[winnerIndex];
    winner.tricksWonRound++;
    session.tricksWon[winner.teamIndex]++;

    // Track counter points
    // Store in pointsTaken field
    const currentPoints = session.pointsTaken || [0, 0, 0, 0];
    currentPoints[winnerIndex] += counterPoints;
    session.pointsTaken = currentPoints;

    // Record trick
    session.trickHistory.push({
      trickNumber: session.trickNumber,
      cards: [...session.currentTrick],
      winnerIndex,
      winnerId: winner.characterId,
      winnerTeam: winner.teamIndex,
      points: counterPoints
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
      counterPoints
    };
  }

  // Move to next player
  session.currentPlayer = (session.currentPlayer + 1) % 4;

  return {
    session,
    playedCard: card,
    trickComplete: false
  };
}

// =============================================================================
// SCORING
// =============================================================================

/**
 * Calculate total counter points for a team
 */
function calculateTeamCounters(session: ITeamCardGameSession, teamIndex: 0 | 1): number {
  const pointsTaken = session.pointsTaken || [0, 0, 0, 0];
  return session.players
    .filter(p => p.teamIndex === teamIndex)
    .reduce((sum, p) => {
      const idx = session.players.indexOf(p);
      return sum + pointsTaken[idx];
    }, 0);
}

/**
 * Calculate total meld points for a team
 */
function calculateTeamMelds(session: ITeamCardGameSession, teamIndex: 0 | 1): number {
  return session.players
    .filter(p => p.teamIndex === teamIndex)
    .reduce((sum, p) => {
      const melds = p.melds as PinochleMeld[] || [];
      return sum + calculateMeldPoints(melds);
    }, 0);
}

/**
 * Calculate round score for Pinochle
 */
export function calculateRoundScore(session: ITeamCardGameSession): PinochleRoundResult {
  const contract = session.contract;
  const bidWinnerIndex = contract?.bidder || 0;
  const bidAmount = contract?.amount || 0;

  const team0Meld = calculateTeamMelds(session, 0);
  const team1Meld = calculateTeamMelds(session, 1);

  const team0Counters = calculateTeamCounters(session, 0);
  const team1Counters = calculateTeamCounters(session, 1);

  // Last trick bonus (10 points to team winning last trick)
  const lastTrickWinner = session.trickHistory[session.trickHistory.length - 1]?.winnerTeam;
  const team0LastTrick = lastTrickWinner === 0 ? 10 : 0;
  const team1LastTrick = lastTrickWinner === 1 ? 10 : 0;

  const team0Total = team0Meld + team0Counters + team0LastTrick;
  const team1Total = team1Meld + team1Counters + team1LastTrick;

  // Check if bid was made
  const bidderTeam = session.players[bidWinnerIndex].teamIndex;
  const bidderTeamTotal = bidderTeam === 0 ? team0Total : team1Total;
  const bidMade = bidderTeamTotal >= bidAmount;

  return {
    bidWinnerIndex,
    bidAmount,
    team0Meld,
    team1Meld,
    team0Counters: team0Counters + team0LastTrick,
    team1Counters: team1Counters + team1LastTrick,
    team0Total,
    team1Total,
    bidMade
  };
}

/**
 * Apply round score to session
 */
export function applyRoundScore(
  session: ITeamCardGameSession,
  result: PinochleRoundResult
): ITeamCardGameSession {
  const bidderTeam = session.players[result.bidWinnerIndex].teamIndex;

  if (result.bidMade) {
    // Both teams get their points
    session.teamScores[0] += result.team0Total;
    session.teamScores[1] += result.team1Total;
  } else {
    // Bidding team loses their bid, opponents get their points
    if (bidderTeam === 0) {
      session.teamScores[0] -= result.bidAmount;
      session.teamScores[1] += result.team1Total;
    } else {
      session.teamScores[0] += result.team0Total;
      session.teamScores[1] -= result.bidAmount;
    }
  }

  // Record round score
  const roundScore: TeamCardRoundScore = {
    roundNumber: session.currentRound,
    team0Score: bidderTeam === 0 ? (result.bidMade ? result.team0Total : -result.bidAmount) : result.team0Total,
    team1Score: bidderTeam === 1 ? (result.bidMade ? result.team1Total : -result.bidAmount) : result.team1Total,
    tricksWon: [...session.tricksWon] as [number, number],
    team0RoundWins: session.tricksWon[0],
    team1RoundWins: session.tricksWon[1],
    details: {
      bidAmount: result.bidAmount,
      bidMade: result.bidMade,
      melds: { team0: result.team0Meld, team1: result.team1Meld },
      counters: { team0: result.team0Counters, team1: result.team1Counters }
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
  const TARGET_SCORE = 1500;

  if (session.teamScores[0] >= TARGET_SCORE && session.teamScores[0] > session.teamScores[1]) {
    return { complete: true, winningTeam: 0, reason: 'Reached 1500 points' };
  }

  if (session.teamScores[1] >= TARGET_SCORE && session.teamScores[1] > session.teamScores[0]) {
    return { complete: true, winningTeam: 1, reason: 'Reached 1500 points' };
  }

  if (session.currentRound >= session.maxRounds) {
    const winningTeam = session.teamScores[0] > session.teamScores[1] ? 0 : 1;
    return { complete: true, winningTeam, reason: 'Max rounds reached' };
  }

  return { complete: false };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const PinochleService = {
  initializePinochleRound,
  getMinimumBid,
  processBid,
  declareTrump,
  findMelds,
  calculateMeldPoints,
  processMelds,
  getPlayableCardsPinochle,
  playCard,
  calculateRoundScore,
  applyRoundScore,
  isGameComplete
};
