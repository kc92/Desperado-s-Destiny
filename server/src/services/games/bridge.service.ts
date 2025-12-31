/**
 * Bridge Game Service
 *
 * Implementation of Contract Bridge rules for team card games
 * - 52-card deck
 * - Complex bidding system (simplified for game)
 * - Declarer/Dummy play
 * - Contract scoring
 * - Rubber scoring variant
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

export interface BridgeBid {
  level: number; // 1-7
  suit: CardSuit | 'NT'; // Suit or No Trump
  pass?: boolean;
  double?: boolean;
  redouble?: boolean;
  doubled?: boolean;     // Whether this bid has been doubled
  redoubled?: boolean;   // Whether this bid has been redoubled
}

export interface BridgeContract {
  level: number;
  suit: CardSuit | 'NT';
  doubled: boolean;
  redoubled: boolean;
  declarer: number;
  dummy: number;
}

export interface BridgeRoundResult {
  contract: BridgeContract;
  tricksMade: number;
  tricksNeeded: number;
  overtricks: number;
  undertricks: number;
  points: number;
  declarerTeam: 0 | 1;
  madeContract: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Suit ranking for bidding (Clubs < Diamonds < Hearts < Spades < NT)
const SUIT_RANK: Record<string, number> = {
  [CardSuit.CLUBS]: 1,
  [CardSuit.DIAMONDS]: 2,
  [CardSuit.HEARTS]: 3,
  [CardSuit.SPADES]: 4,
  'NT': 5
};

// Base trick values
const MINOR_SUIT_TRICK = 20; // Clubs, Diamonds
const MAJOR_SUIT_TRICK = 30; // Hearts, Spades
const NT_FIRST_TRICK = 40;
const NT_SUBSEQUENT_TRICK = 30;

// Bonus points
const GAME_BONUS_NONVUL = 300;
const GAME_BONUS_VUL = 500;
const SLAM_BONUS_SMALL_NONVUL = 500;
const SLAM_BONUS_SMALL_VUL = 750;
const SLAM_BONUS_GRAND_NONVUL = 1000;
const SLAM_BONUS_GRAND_VUL = 1500;
const PART_SCORE_BONUS = 50;

// =============================================================================
// GAME INITIALIZATION
// =============================================================================

/**
 * Initialize a Bridge deal
 */
export function initializeBridgeDeal(session: ITeamCardGameSession): ITeamCardGameSession {
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

  // Reset state
  session.currentTrick = [];
  session.trickNumber = 0;
  session.tricksWon = [0, 0];
  session.contract = undefined;
  session.declarer = undefined;
  session.dummy = undefined;
  session.trump = undefined;

  // Dealer starts bidding
  session.currentPlayer = session.dealer;

  return session;
}

// =============================================================================
// BIDDING
// =============================================================================

/**
 * Check if a bid is valid (higher than previous)
 */
export function isValidBid(
  bid: BridgeBid,
  previousBids: BridgeBid[],
  lastNonPassBid?: BridgeBid
): boolean {
  if (bid.pass) {
    return true;
  }

  if (bid.double) {
    // Can only double opponent's bid
    return lastNonPassBid !== undefined && !lastNonPassBid.doubled;
  }

  if (bid.redouble) {
    // Can only redouble own team's doubled bid
    return lastNonPassBid !== undefined && lastNonPassBid.doubled;
  }

  // Regular bid - must be higher
  if (!lastNonPassBid) {
    return bid.level >= 1 && bid.level <= 7;
  }

  if (bid.level > lastNonPassBid.level) {
    return true;
  }

  if (bid.level === lastNonPassBid.level) {
    return SUIT_RANK[bid.suit] > SUIT_RANK[lastNonPassBid.suit];
  }

  return false;
}

/**
 * Process a bridge bid
 */
export function processBid(
  session: ITeamCardGameSession,
  playerIndex: number,
  bid: BridgeBid
): {
  session: ITeamCardGameSession;
  biddingComplete: boolean;
  contract?: BridgeContract;
} {
  const player = session.players[playerIndex];

  // Get previous bids
  const allBids = session.players
    .map(p => p.bid as BridgeBid | undefined)
    .filter(b => b !== undefined);

  const lastNonPassBid = [...allBids]
    .reverse()
    .find(b => !b.pass);

  // Validate bid
  if (!isValidBid(bid, allBids, lastNonPassBid)) {
    throw new Error('Invalid bid');
  }

  // Store bid
  player.bid = bid;

  // Move to next bidder
  session.currentPlayer = (session.currentPlayer + 1) % 4;

  // Check if bidding complete (3 passes after a bid, or 4 passes)
  const recentBids = session.players
    .map(p => p.bid as BridgeBid | undefined)
    .filter(b => b !== undefined);

  const passCount = recentBids.filter(b => b.pass).length;

  if (recentBids.length >= 4) {
    // Check last 3 bids for passes
    const lastThree = recentBids.slice(-3);
    const allPasses = lastThree.every(b => b.pass);

    if (allPasses && recentBids.length > 3) {
      // Find the winning bid
      const nonPassBids = recentBids.filter(b => !b.pass && !b.double && !b.redouble);
      if (nonPassBids.length === 0) {
        // All passes - redeal
        throw new Error('All passes - must redeal');
      }

      const winningBid = nonPassBids[nonPassBids.length - 1];
      const winningBidderIndex = session.players.findIndex(
        p => p.bid === winningBid
      );

      // Determine if doubled/redoubled
      const doubled = recentBids.some(b => b.double);
      const redoubled = recentBids.some(b => b.redouble);

      // Find declarer (first to bid the winning suit on winning team)
      const declarerTeamIndex = session.players[winningBidderIndex].teamIndex;
      let declarerIndex = winningBidderIndex;

      for (const p of session.players) {
        if (p.teamIndex === declarerTeamIndex && p.bid) {
          const pBid = p.bid as BridgeBid;
          if (!pBid.pass && pBid.suit === winningBid.suit) {
            declarerIndex = session.players.indexOf(p);
            break;
          }
        }
      }

      const contract: BridgeContract = {
        level: winningBid.level,
        suit: winningBid.suit,
        doubled,
        redoubled,
        declarer: declarerIndex,
        dummy: (declarerIndex + 2) % 4
      };

      session.contract = contract;
      session.declarer = contract.declarer;
      session.dummy = contract.dummy;
      session.trump = contract.suit === 'NT' ? undefined : contract.suit as CardSuit;

      // Declarer leads first
      session.currentPlayer = (session.declarer + 1) % 4;

      return { session, biddingComplete: true, contract };
    }
  }

  return { session, biddingComplete: false };
}

/**
 * Calculate High Card Points for a hand
 */
export function calculateHCP(hand: TrickCard[]): number {
  let hcp = 0;

  for (const card of hand) {
    switch (card.rank) {
      case CardRank.ACE: hcp += 4; break;
      case CardRank.KING: hcp += 3; break;
      case CardRank.QUEEN: hcp += 2; break;
      case CardRank.JACK: hcp += 1; break;
    }
  }

  return hcp;
}

/**
 * Get suit distribution
 */
export function getSuitDistribution(hand: TrickCard[]): Record<string, number> {
  const distribution: Record<string, number> = {
    [CardSuit.SPADES]: 0,
    [CardSuit.HEARTS]: 0,
    [CardSuit.DIAMONDS]: 0,
    [CardSuit.CLUBS]: 0
  };

  for (const card of hand) {
    distribution[card.suit]++;
  }

  return distribution;
}

/**
 * Get recommended opening bid
 */
export function getRecommendedOpeningBid(hand: TrickCard[]): BridgeBid | null {
  const hcp = calculateHCP(hand);
  const distribution = getSuitDistribution(hand);

  // Find longest suit
  let longestSuit = CardSuit.CLUBS;
  let longestLength = 0;
  for (const [suit, count] of Object.entries(distribution)) {
    if (count > longestLength) {
      longestLength = count;
      longestSuit = suit as CardSuit;
    }
  }

  // Not enough to open
  if (hcp < 12) {
    return { level: 0, suit: 'NT', pass: true };
  }

  // Balanced hand with 15-17 HCP - 1NT
  const isBalanced = Object.values(distribution).every(c => c >= 2 && c <= 5);
  if (isBalanced && hcp >= 15 && hcp <= 17) {
    return { level: 1, suit: 'NT' };
  }

  // 5+ card major
  if (distribution[CardSuit.SPADES] >= 5) {
    return { level: 1, suit: CardSuit.SPADES };
  }
  if (distribution[CardSuit.HEARTS] >= 5) {
    return { level: 1, suit: CardSuit.HEARTS };
  }

  // 4+ card minor
  if (distribution[CardSuit.DIAMONDS] >= distribution[CardSuit.CLUBS]) {
    return { level: 1, suit: CardSuit.DIAMONDS };
  }
  return { level: 1, suit: CardSuit.CLUBS };
}

// =============================================================================
// CARD PLAY
// =============================================================================

/**
 * Get playable cards for Bridge
 * In Bridge, dummy's hand is visible and played by declarer
 */
export function getPlayableCardsBridge(
  hand: TrickCard[],
  currentTrick: PlayedCard[],
  trump: CardSuit | undefined
): TrickCard[] {
  return getPlayableCards(hand, currentTrick, trump, TeamCardGameType.BRIDGE);
}

/**
 * Play a card in Bridge
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
} {
  const player = session.players[playerIndex];
  const card = player.hand[cardIndex];

  if (!card) {
    throw new Error('Invalid card index');
  }

  const trump = session.trump as CardSuit | undefined;

  // Validate play
  const playable = getPlayableCardsBridge(player.hand, session.currentTrick, trump);
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
      TeamCardGameType.BRIDGE
    );

    // Award trick
    const winner = session.players[winnerIndex];
    winner.tricksWonRound++;
    session.tricksWon[winner.teamIndex]++;

    // Record trick
    session.trickHistory.push({
      trickNumber: session.trickNumber,
      cards: [...session.currentTrick],
      winnerIndex,
      winnerId: winner.characterId,
      winnerTeam: winner.teamIndex,
      points: 1
    });

    // Reset for next trick
    session.currentTrick = [];
    session.trickNumber++;
    session.currentPlayer = winnerIndex;

    return {
      session,
      playedCard: card,
      trickComplete: true,
      trickWinner: winnerIndex
    };
  }

  // Move to next player (skip dummy - declarer plays for dummy)
  let nextPlayer = (session.currentPlayer + 1) % 4;
  if (nextPlayer === session.dummy) {
    // Dummy's turn - still show as dummy but declarer decides
    // In our implementation, we handle this in the client
  }

  session.currentPlayer = nextPlayer;

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
 * Calculate trick value based on suit
 */
function getTrickValue(suit: CardSuit | 'NT', trickIndex: number): number {
  if (suit === 'NT') {
    return trickIndex === 0 ? NT_FIRST_TRICK : NT_SUBSEQUENT_TRICK;
  }

  if (suit === CardSuit.CLUBS || suit === CardSuit.DIAMONDS) {
    return MINOR_SUIT_TRICK;
  }

  return MAJOR_SUIT_TRICK;
}

/**
 * Calculate contract points
 */
function calculateContractPoints(
  contract: BridgeContract,
  tricksWon: number,
  vulnerable: boolean,
  declarerTeam: 0 | 1
): BridgeRoundResult {
  const tricksNeeded = 6 + contract.level;
  const tricksMade = tricksWon;
  const madeContract = tricksMade >= tricksNeeded;
  const overtricks = Math.max(0, tricksMade - tricksNeeded);
  const undertricks = Math.max(0, tricksNeeded - tricksMade);

  let points = 0;

  if (madeContract) {
    // Calculate base contract value
    let contractValue = 0;
    for (let i = 0; i < contract.level; i++) {
      contractValue += getTrickValue(contract.suit, i);
    }

    // Double/Redouble multipliers
    if (contract.doubled) contractValue *= 2;
    if (contract.redoubled) contractValue *= 4;

    points = contractValue;

    // Game bonus (100+ contract value)
    if (contractValue >= 100) {
      points += vulnerable ? GAME_BONUS_VUL : GAME_BONUS_NONVUL;
    } else {
      points += PART_SCORE_BONUS;
    }

    // Slam bonus
    if (contract.level === 6) {
      points += vulnerable ? SLAM_BONUS_SMALL_VUL : SLAM_BONUS_SMALL_NONVUL;
    } else if (contract.level === 7) {
      points += vulnerable ? SLAM_BONUS_GRAND_VUL : SLAM_BONUS_GRAND_NONVUL;
    }

    // Overtrick points
    if (contract.doubled) {
      points += overtricks * (vulnerable ? 200 : 100);
    } else if (contract.redoubled) {
      points += overtricks * (vulnerable ? 400 : 200);
    } else {
      const overtrickValue = getTrickValue(contract.suit, 0);
      points += overtricks * overtrickValue;
    }

    // Making doubled/redoubled contract bonus
    if (contract.doubled) points += 50;
    if (contract.redoubled) points += 100;

  } else {
    // Undertrick penalties
    if (contract.doubled) {
      if (vulnerable) {
        points = -(200 * undertricks + (undertricks > 1 ? 100 * (undertricks - 1) : 0));
      } else {
        points = -(100 + (undertricks > 1 ? 200 * (undertricks - 1) : 0) +
                  (undertricks > 3 ? 100 * (undertricks - 3) : 0));
      }
      if (contract.redoubled) points *= 2;
    } else {
      points = -(undertricks * (vulnerable ? 100 : 50));
    }
  }

  return {
    contract,
    tricksMade,
    tricksNeeded,
    overtricks,
    undertricks,
    points,
    declarerTeam,
    madeContract
  };
}

/**
 * Calculate round score for Bridge
 */
export function calculateRoundScore(
  session: ITeamCardGameSession,
  vulnerable: [boolean, boolean] = [false, false]
): BridgeRoundResult {
  const contract = session.contract as BridgeContract;
  if (!contract) {
    throw new Error('No contract set');
  }

  const declarerTeam = session.players[contract.declarer].teamIndex as 0 | 1;
  const tricksWon = session.tricksWon[declarerTeam];

  return calculateContractPoints(contract, tricksWon, vulnerable[declarerTeam], declarerTeam);
}

/**
 * Apply round score to session
 */
export function applyRoundScore(
  session: ITeamCardGameSession,
  result: BridgeRoundResult
): ITeamCardGameSession {
  // Points go to appropriate team
  if (result.madeContract) {
    session.teamScores[result.declarerTeam] += result.points;
  } else {
    // Defenders get the penalty points
    const defenderTeam = result.declarerTeam === 0 ? 1 : 0;
    session.teamScores[defenderTeam] += Math.abs(result.points);
  }

  // Record round score
  const roundScore: TeamCardRoundScore = {
    roundNumber: session.currentRound,
    team0Score: result.declarerTeam === 0 ? result.points : (result.madeContract ? 0 : Math.abs(result.points)),
    team1Score: result.declarerTeam === 1 ? result.points : (result.madeContract ? 0 : Math.abs(result.points)),
    tricksWon: [...session.tricksWon] as [number, number],
    team0RoundWins: session.tricksWon[0],
    team1RoundWins: session.tricksWon[1],
    details: {
      contract: result.contract,
      tricksMade: result.tricksMade,
      tricksNeeded: result.tricksNeeded,
      madeContract: result.madeContract
    }
  };

  session.roundScores.push(roundScore);

  return session;
}

/**
 * Check if rubber is complete
 * (Simplified: first to 2 game wins)
 */
export function isGameComplete(session: ITeamCardGameSession): {
  complete: boolean;
  winningTeam?: 0 | 1;
  reason?: string;
} {
  // Simple version: first to reach target score
  const TARGET_SCORE = 3000;

  if (session.teamScores[0] >= TARGET_SCORE && session.teamScores[0] > session.teamScores[1]) {
    return { complete: true, winningTeam: 0, reason: 'Reached target score' };
  }

  if (session.teamScores[1] >= TARGET_SCORE && session.teamScores[1] > session.teamScores[0]) {
    return { complete: true, winningTeam: 1, reason: 'Reached target score' };
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

export const BridgeService = {
  initializeBridgeDeal,
  isValidBid,
  processBid,
  calculateHCP,
  getSuitDistribution,
  getRecommendedOpeningBid,
  getPlayableCardsBridge,
  playCard,
  calculateRoundScore,
  applyRoundScore,
  isGameComplete
};
