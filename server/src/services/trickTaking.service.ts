/**
 * Trick-Taking Engine Service
 * Core mechanics for team-based trick-taking card games
 *
 * Supports: Euchre, Spades, Hearts, Bridge, Pinochle
 */

import {
  Card,
  Suit,
  Rank,
  TeamCardGameType,
  TrickCard,
  PlayedCard,
  TrickResult
} from '@desperados/shared';
import { SecureRNG } from './base/SecureRNG';

// =============================================================================
// DECK CREATION
// =============================================================================

/**
 * Create a standard 52-card deck
 */
export function createStandardDeck(): TrickCard[] {
  const deck: TrickCard[] = [];
  const suits: Suit[] = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
  const ranks: Rank[] = [
    Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX,
    Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN,
    Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
  ];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  return deck;
}

/**
 * Create a Euchre deck (24 cards: 9-A of each suit)
 */
export function createEuchreDeck(): TrickCard[] {
  const deck: TrickCard[] = [];
  const suits: Suit[] = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
  const ranks: Rank[] = [
    Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
  ];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  return deck;
}

/**
 * Create a Pinochle deck (48 cards: 9-A of each suit, doubled)
 */
export function createPinochleDeck(): TrickCard[] {
  const deck: TrickCard[] = [];
  const suits: Suit[] = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
  const ranks: Rank[] = [
    Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
  ];

  // Double deck
  for (let copy = 0; copy < 2; copy++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }
  }

  return deck;
}

/**
 * Create deck for specific game type
 */
export function createDeckForGame(gameType: TeamCardGameType): TrickCard[] {
  switch (gameType) {
    case TeamCardGameType.EUCHRE:
      return createEuchreDeck();
    case TeamCardGameType.PINOCHLE:
      return createPinochleDeck();
    default:
      return createStandardDeck();
  }
}

/**
 * Shuffle deck using secure RNG
 */
export function shuffleDeck(deck: TrickCard[]): TrickCard[] {
  return SecureRNG.shuffle([...deck]);
}

// =============================================================================
// SUIT UTILITIES
// =============================================================================

/**
 * Get the color of a suit
 */
export function getSuitColor(suit: Suit): 'red' | 'black' {
  return (suit === Suit.HEARTS || suit === Suit.DIAMONDS) ? 'red' : 'black';
}

/**
 * Check if two suits are the same color
 */
export function isSameColor(suit1: Suit, suit2: Suit): boolean {
  return getSuitColor(suit1) === getSuitColor(suit2);
}

/**
 * Get the "other" suit of the same color (for Euchre Left Bower)
 */
export function getSameColorSuit(suit: Suit): Suit {
  switch (suit) {
    case Suit.SPADES: return Suit.CLUBS;
    case Suit.CLUBS: return Suit.SPADES;
    case Suit.HEARTS: return Suit.DIAMONDS;
    case Suit.DIAMONDS: return Suit.HEARTS;
  }
}

// =============================================================================
// CARD VALUATION
// =============================================================================

/**
 * Get base card value for trick-taking
 */
export function getCardValue(
  card: TrickCard,
  gameType: TeamCardGameType,
  trump?: Suit
): number {
  let value = card.rank;

  // Euchre: Bower system
  if (gameType === TeamCardGameType.EUCHRE && trump) {
    // Right Bower: Jack of trump is highest (value 17)
    if (card.rank === Rank.JACK && card.suit === trump) {
      return 17;
    }
    // Left Bower: Jack of same color is second highest (value 16)
    if (card.rank === Rank.JACK && card.suit === getSameColorSuit(trump)) {
      return 16;
    }
  }

  // Pinochle: 10 is higher than King
  if (gameType === TeamCardGameType.PINOCHLE) {
    if (card.rank === Rank.TEN) {
      return 12; // Between Queen (12) and King (13) becomes TEN at 12
    }
    // Pinochle rank order: 9, J, Q, K, 10, A
    const pinochlOrder: Record<number, number> = {
      [Rank.NINE]: 9,
      [Rank.JACK]: 10,
      [Rank.QUEEN]: 11,
      [Rank.KING]: 12,
      [Rank.TEN]: 13,
      [Rank.ACE]: 14
    };
    return pinochlOrder[card.rank] || card.rank;
  }

  return value;
}

/**
 * Mark bowers in a hand (Euchre only)
 */
export function markBowers(hand: TrickCard[], trump: Suit): TrickCard[] {
  return hand.map(card => {
    if (card.rank === Rank.JACK) {
      if (card.suit === trump) {
        return { ...card, isBower: true, bowerType: 'right' };
      }
      if (card.suit === getSameColorSuit(trump)) {
        return { ...card, isBower: true, bowerType: 'left' };
      }
    }
    return { ...card, isBower: false, bowerType: undefined };
  });
}

/**
 * Get effective suit of a card (handles Left Bower in Euchre)
 */
export function getEffectiveSuit(
  card: TrickCard,
  trump: Suit | undefined,
  gameType: TeamCardGameType
): Suit {
  // In Euchre, the Left Bower (Jack of same color) counts as trump suit
  if (gameType === TeamCardGameType.EUCHRE && trump) {
    if (card.rank === Rank.JACK && card.suit === getSameColorSuit(trump)) {
      return trump;
    }
  }
  return card.suit;
}

// =============================================================================
// PLAYABLE CARDS DETERMINATION
// =============================================================================

/**
 * Get cards that can be legally played
 */
export function getPlayableCards(
  hand: TrickCard[],
  currentTrick: PlayedCard[],
  trump: Suit | null,
  gameType: TeamCardGameType,
  heartsBroken?: boolean
): TrickCard[] {
  // If leading the trick
  if (currentTrick.length === 0) {
    return getLeadableCards(hand, gameType, heartsBroken);
  }

  // Must follow suit if possible
  const leadCard = currentTrick[0].card;
  const leadSuit = getEffectiveSuit(leadCard, trump || undefined, gameType);

  // Find cards that match the led suit
  const followCards = hand.filter(card =>
    getEffectiveSuit(card, trump || undefined, gameType) === leadSuit
  );

  if (followCards.length > 0) {
    return followCards;
  }

  // Can't follow suit - game-specific rules
  return getCantFollowOptions(hand, trump, gameType);
}

/**
 * Get cards that can lead a trick
 */
export function getLeadableCards(
  hand: TrickCard[],
  gameType: TeamCardGameType,
  heartsBroken?: boolean
): TrickCard[] {
  // Hearts: Can't lead hearts until broken (unless only hearts left)
  if (gameType === TeamCardGameType.HEARTS && !heartsBroken) {
    const nonHearts = hand.filter(c => c.suit !== Suit.HEARTS);
    if (nonHearts.length > 0) {
      return nonHearts;
    }
    // Only hearts left, must lead heart
  }

  // Spades: Can't lead spades until broken (variant rule, not always used)
  // We'll implement without this restriction for simplicity

  return hand;
}

/**
 * Get options when player can't follow suit
 */
export function getCantFollowOptions(
  hand: TrickCard[],
  trump: Suit | null,
  gameType: TeamCardGameType
): TrickCard[] {
  // Hearts: Must dump Queen of Spades if possible? No, can play anything
  // All games: Can play any card when void in led suit
  return hand;
}

/**
 * Check if a specific card play is valid
 */
export function isValidPlay(
  card: TrickCard,
  hand: TrickCard[],
  currentTrick: PlayedCard[],
  trump: Suit | null,
  gameType: TeamCardGameType,
  heartsBroken?: boolean
): boolean {
  const playable = getPlayableCards(hand, currentTrick, trump, gameType, heartsBroken);
  return playable.some(c => c.suit === card.suit && c.rank === card.rank);
}

// =============================================================================
// TRICK RESOLUTION
// =============================================================================

/**
 * Determine the winner of a completed trick
 */
export function determineTrickWinner(
  trick: PlayedCard[],
  trump: Suit | null,
  gameType: TeamCardGameType
): number {
  if (trick.length === 0) {
    throw new Error('Cannot determine winner of empty trick');
  }

  const leadCard = trick[0].card;
  const leadSuit = getEffectiveSuit(leadCard, trump || undefined, gameType);

  // Find highest trump card (if any trump was played)
  if (trump) {
    const trumpCards = trick.filter(played => {
      const effectiveSuit = getEffectiveSuit(played.card, trump, gameType);
      return effectiveSuit === trump;
    });

    if (trumpCards.length > 0) {
      // Highest trump wins
      return trumpCards.reduce((winner, current) => {
        const winnerValue = getCardValue(winner.card, gameType, trump);
        const currentValue = getCardValue(current.card, gameType, trump);
        return currentValue > winnerValue ? current : winner;
      }).playerIndex;
    }
  }

  // No trump played - highest card of led suit wins
  const followCards = trick.filter(played => {
    const effectiveSuit = getEffectiveSuit(played.card, trump || undefined, gameType);
    return effectiveSuit === leadSuit;
  });

  return followCards.reduce((winner, current) => {
    const winnerValue = getCardValue(winner.card, gameType, trump || undefined);
    const currentValue = getCardValue(current.card, gameType, trump || undefined);
    return currentValue > winnerValue ? current : winner;
  }).playerIndex;
}

/**
 * Calculate points in a trick (for Hearts)
 */
export function calculateTrickPoints(
  trick: PlayedCard[],
  gameType: TeamCardGameType
): number {
  if (gameType !== TeamCardGameType.HEARTS) {
    return 0; // Other games don't track trick points this way
  }

  let points = 0;
  for (const played of trick) {
    if (played.card.suit === Suit.HEARTS) {
      points += 1;
    }
    if (played.card.suit === Suit.SPADES && played.card.rank === Rank.QUEEN) {
      points += 13;
    }
  }
  return points;
}

/**
 * Create a TrickResult from a completed trick
 */
export function createTrickResult(
  trick: PlayedCard[],
  trickNumber: number,
  trump: Suit | null,
  gameType: TeamCardGameType,
  players: Array<{ characterName: string; teamIndex: 0 | 1 }>
): TrickResult {
  const winnerIndex = determineTrickWinner(trick, trump, gameType);
  const winningCard = trick.find(p => p.playerIndex === winnerIndex)!.card;

  return {
    trickNumber,
    cards: trick,
    winnerIndex,
    winnerName: players[winnerIndex].characterName,
    winningCard,
    winningTeam: players[winnerIndex].teamIndex,
    pointsWorth: calculateTrickPoints(trick, gameType)
  };
}

// =============================================================================
// DEALING
// =============================================================================

/**
 * Deal cards to players
 */
export function dealCards(
  deck: TrickCard[],
  numPlayers: number,
  cardsPerPlayer: number
): { hands: TrickCard[][]; remaining: TrickCard[] } {
  const shuffled = shuffleDeck(deck);
  const hands: TrickCard[][] = [];

  for (let i = 0; i < numPlayers; i++) {
    const start = i * cardsPerPlayer;
    const end = start + cardsPerPlayer;
    hands.push(shuffled.slice(start, end));
  }

  const remaining = shuffled.slice(numPlayers * cardsPerPlayer);

  return { hands, remaining };
}

/**
 * Deal for Euchre (5 cards each, 4 to kitty)
 */
export function dealEuchre(): {
  hands: TrickCard[][];
  kitty: TrickCard[];
  upCard: TrickCard;
} {
  const deck = createEuchreDeck();
  const { hands, remaining } = dealCards(deck, 4, 5);

  return {
    hands,
    kitty: remaining,
    upCard: remaining[0]
  };
}

/**
 * Deal for standard 4-player games (13 cards each)
 */
export function dealStandard(): { hands: TrickCard[][] } {
  const deck = createStandardDeck();
  const { hands } = dealCards(deck, 4, 13);
  return { hands };
}

/**
 * Deal for Pinochle (12 cards each)
 */
export function dealPinochle(): { hands: TrickCard[][] } {
  const deck = createPinochleDeck();
  const { hands } = dealCards(deck, 4, 12);
  return { hands };
}

// =============================================================================
// HAND SORTING
// =============================================================================

/**
 * Sort hand by suit then rank
 */
export function sortHand(
  hand: TrickCard[],
  trump?: Suit,
  gameType?: TeamCardGameType
): TrickCard[] {
  // Suit priority: Trump first, then Spades, Hearts, Diamonds, Clubs
  const suitPriority = (suit: Suit): number => {
    if (trump && suit === trump) return 0;
    switch (suit) {
      case Suit.SPADES: return 1;
      case Suit.HEARTS: return 2;
      case Suit.DIAMONDS: return 3;
      case Suit.CLUBS: return 4;
    }
  };

  return [...hand].sort((a, b) => {
    const aSuit = suitPriority(a.suit);
    const bSuit = suitPriority(b.suit);

    if (aSuit !== bSuit) {
      return aSuit - bSuit;
    }

    // Same suit - sort by value descending
    const aValue = getCardValue(a, gameType || TeamCardGameType.SPADES, trump);
    const bValue = getCardValue(b, gameType || TeamCardGameType.SPADES, trump);
    return bValue - aValue;
  });
}

// =============================================================================
// BIDDING HELPERS
// =============================================================================

/**
 * Calculate minimum tricks needed to make bid (Spades)
 */
export function calculateSpadesBidRequirement(
  teamBid: number,
  tricksWon: number
): { needed: number; canMake: boolean; bags: number } {
  const needed = teamBid - tricksWon;
  const canMake = needed <= 0;
  const bags = canMake ? Math.abs(needed) : 0;

  return { needed: Math.max(0, needed), canMake, bags };
}

/**
 * Calculate Bridge contract points
 */
export function calculateBridgeContractPoints(
  level: number,
  strain: Suit | 'NT',
  tricksWon: number,
  tricksNeeded: number,
  isDoubled: boolean,
  isRedoubled: boolean
): number {
  const tricksMade = tricksWon - 6; // First 6 tricks don't count

  if (tricksMade < level) {
    // Failed contract - undertrick penalties
    const undertricks = level - tricksMade;
    let penalty = undertricks * 50;
    if (isDoubled) penalty *= 2;
    if (isRedoubled) penalty *= 4;
    return -penalty;
  }

  // Made contract
  let points = 0;

  // Trick points
  const trickValue = (strain === 'NT' || strain === Suit.SPADES || strain === Suit.HEARTS)
    ? 30 // Major suits and NT
    : 20; // Minor suits

  points = level * trickValue;
  if (strain === 'NT') points += 10; // NT bonus for first trick

  // Overtricks
  const overtricks = tricksMade - level;
  points += overtricks * trickValue;

  // Double/redouble bonuses
  if (isDoubled) points *= 2;
  if (isRedoubled) points *= 4;

  // Game bonus (100+ points)
  if (points >= 100) points += 300;

  // Slam bonuses
  if (level === 6) points += 500; // Small slam
  if (level === 7) points += 1000; // Grand slam

  return points;
}

// =============================================================================
// HEARTS SPECIFIC
// =============================================================================

/**
 * Check if a player has "shot the moon" (took all hearts + QS)
 */
export function checkShootTheMoon(pointsTaken: [number, number, number, number]): {
  shotMoon: boolean;
  playerIndex: number;
} {
  const total = pointsTaken.reduce((a, b) => a + b, 0);

  // If total is 26, someone took all points
  if (total === 26) {
    const moonShooter = pointsTaken.findIndex(p => p === 26);
    if (moonShooter !== -1) {
      return { shotMoon: true, playerIndex: moonShooter };
    }
  }

  return { shotMoon: false, playerIndex: -1 };
}

/**
 * Calculate Hearts round scores (with shoot the moon handling)
 */
export function calculateHeartsRoundScores(
  pointsTaken: [number, number, number, number]
): [number, number, number, number] {
  const moonCheck = checkShootTheMoon(pointsTaken);

  if (moonCheck.shotMoon) {
    // Moon shooter gets 0, everyone else gets 26
    return pointsTaken.map((_, i) =>
      i === moonCheck.playerIndex ? 0 : 26
    ) as [number, number, number, number];
  }

  // Normal scoring - points taken are points scored
  return pointsTaken;
}

// =============================================================================
// TEAM UTILITIES
// =============================================================================

/**
 * Get partner index (seats 0&2 are partners, 1&3 are partners)
 */
export function getPartnerIndex(playerIndex: number): number {
  return (playerIndex + 2) % 4;
}

/**
 * Get opponent indices
 */
export function getOpponentIndices(playerIndex: number): [number, number] {
  return [(playerIndex + 1) % 4, (playerIndex + 3) % 4];
}

/**
 * Get team index for a player
 */
export function getTeamIndex(playerIndex: number): 0 | 1 {
  return (playerIndex % 2) as 0 | 1;
}

/**
 * Check if two players are on the same team
 */
export function areTeammates(player1: number, player2: number): boolean {
  return getTeamIndex(player1) === getTeamIndex(player2);
}

// =============================================================================
// EUCHRE BOWER UTILITIES
// =============================================================================

/**
 * Get the left bower suit for Euchre (same color as trump)
 */
export function getLeftBowerSuit(trump: Suit): Suit {
  return getSameColorSuit(trump);
}

/**
 * Check if a card is the right bower (Jack of trump)
 */
export function isRightBower(card: TrickCard, trump: Suit): boolean {
  return card.rank === Rank.JACK && card.suit === trump;
}

/**
 * Check if a card is the left bower (Jack of same color as trump)
 */
export function isLeftBower(card: TrickCard, trump: Suit): boolean {
  const leftBowerSuit = getLeftBowerSuit(trump);
  return card.rank === Rank.JACK && card.suit === leftBowerSuit;
}

// =============================================================================
// CARD COMPARISON UTILITIES
// =============================================================================

/**
 * Check if a card would win the current trick
 */
export function wouldWinTrick(
  card: TrickCard,
  currentTrick: PlayedCard[],
  trump: Suit | null,
  gameType: TeamCardGameType
): boolean {
  if (currentTrick.length === 0) return true;

  // Simulate playing the card
  const simulatedTrick: PlayedCard[] = [
    ...currentTrick,
    { card, playerIndex: -1, timestamp: Date.now() }
  ];

  const winnerIndex = determineTrickWinner(simulatedTrick, trump, gameType);

  // Winner is the last card (our simulated play)
  return winnerIndex === simulatedTrick.length - 1;
}

/**
 * Find the minimum card that would win the trick
 */
export function findMinimumWinningCard(
  playableCards: TrickCard[],
  currentTrick: PlayedCard[],
  trump: Suit | null,
  gameType: TeamCardGameType
): TrickCard | null {
  const winningCards = playableCards.filter(card =>
    wouldWinTrick(card, currentTrick, trump, gameType)
  );

  if (winningCards.length === 0) return null;

  // Sort by value ascending and return lowest
  return winningCards.sort((a, b) => {
    const aValue = getCardValue(a, gameType, trump || undefined);
    const bValue = getCardValue(b, gameType, trump || undefined);
    return aValue - bValue;
  })[0];
}

/**
 * Get the lowest card from a list
 */
export function getLowestCard(
  cards: TrickCard[],
  gameType: TeamCardGameType = TeamCardGameType.SPADES,
  trump?: Suit
): TrickCard {
  return cards.reduce((lowest, current) => {
    const lowestValue = getCardValue(lowest, gameType, trump);
    const currentValue = getCardValue(current, gameType, trump);
    return currentValue < lowestValue ? current : lowest;
  });
}

/**
 * Get the highest card from a list
 */
export function getHighestCard(
  cards: TrickCard[],
  gameType: TeamCardGameType = TeamCardGameType.SPADES,
  trump?: Suit
): TrickCard {
  return cards.reduce((highest, current) => {
    const highestValue = getCardValue(highest, gameType, trump);
    const currentValue = getCardValue(current, gameType, trump);
    return currentValue > highestValue ? current : highest;
  });
}

// =============================================================================
// EXPORTS SUMMARY
// =============================================================================

export const TrickTakingService = {
  // Deck creation
  createStandardDeck,
  createEuchreDeck,
  createPinochleDeck,
  createDeckForGame,
  shuffleDeck,

  // Suit utilities
  getSuitColor,
  isSameColor,
  getSameColorSuit,

  // Card valuation
  getCardValue,
  markBowers,
  getEffectiveSuit,

  // Playable cards
  getPlayableCards,
  getLeadableCards,
  getCantFollowOptions,
  isValidPlay,

  // Trick resolution
  determineTrickWinner,
  calculateTrickPoints,
  createTrickResult,

  // Dealing
  dealCards,
  dealEuchre,
  dealStandard,
  dealPinochle,

  // Sorting
  sortHand,

  // Bidding helpers
  calculateSpadesBidRequirement,
  calculateBridgeContractPoints,

  // Hearts
  checkShootTheMoon,
  calculateHeartsRoundScores,

  // Team utilities
  getPartnerIndex,
  getOpponentIndices,
  getTeamIndex,
  areTeammates,

  // Euchre bower utilities
  getLeftBowerSuit,
  isRightBower,
  isLeftBower,

  // Card comparison
  wouldWinTrick,
  findMinimumWinningCard,
  getLowestCard,
  getHighestCard
};
