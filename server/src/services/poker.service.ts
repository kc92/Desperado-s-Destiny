/**
 * Poker Service
 * Core poker game logic and table management
 */

import type {
  PokerCard,
  PokerTable,
  TablePlayer,
  PokerAction,
  PokerVariant,
  PokerRound
} from '@desperados/shared';
import { HandEvaluatorService } from './handEvaluator.service';

/**
 * Initialize a new poker table
 */
export function createTable(
  tableId: string,
  tableName: string,
  maxSeats: number
): PokerTable {
  return {
    tableId,
    tableName,
    maxSeats,
    players: [],
    dealerPosition: 0,
    smallBlindPosition: 0,
    bigBlindPosition: 0,
    currentPlayerPosition: 0,
    pot: 0,
    sidePots: [],
    communityCards: [],
    deck: [],
    currentRound: 'preflop',
    isActive: true
  };
}

/**
 * Seat a player at the table
 */
export function seatPlayer(
  table: PokerTable,
  characterId: string,
  characterName: string,
  chips: number,
  seatNumber?: number
): PokerTable {
  // Find available seat
  const availableSeats = getAvailableSeats(table);

  if (availableSeats.length === 0) {
    throw new Error('Table is full');
  }

  const seat = seatNumber !== undefined && availableSeats.includes(seatNumber)
    ? seatNumber
    : availableSeats[0];

  const player: TablePlayer = {
    characterId,
    characterName,
    seatNumber: seat,
    chips,
    holeCards: [],
    currentBet: 0,
    folded: false,
    allIn: false,
    isActive: true
  };

  table.players.push(player);
  table.players.sort((a, b) => a.seatNumber - b.seatNumber);

  return table;
}

/**
 * Get available seat numbers
 */
export function getAvailableSeats(table: PokerTable): number[] {
  const occupied = new Set(table.players.map(p => p.seatNumber));
  const available: number[] = [];

  for (let i = 0; i < table.maxSeats; i++) {
    if (!occupied.has(i)) {
      available.push(i);
    }
  }

  return available;
}

/**
 * Start a new hand
 */
export function startNewHand(
  table: PokerTable,
  smallBlind: number,
  bigBlind: number,
  ante?: number,
  variant: PokerVariant = 'texas_holdem'
): PokerTable {
  const activePlayers = table.players.filter(p => !p.folded && p.chips > 0);

  if (activePlayers.length < 2) {
    throw new Error('Need at least 2 players to start a hand');
  }

  // Reset hand state
  table.pot = 0;
  table.sidePots = [];
  table.communityCards = [];
  table.currentRound = 'preflop';

  // Reset players
  for (const player of table.players) {
    player.holeCards = [];
    player.currentBet = 0;
    player.folded = false;
    player.allIn = false;
    player.lastAction = undefined;
  }

  // Move dealer button
  table.dealerPosition = getNextActivePosition(table, table.dealerPosition);
  table.smallBlindPosition = getNextActivePosition(table, table.dealerPosition);
  table.bigBlindPosition = getNextActivePosition(table, table.smallBlindPosition);

  // Create and shuffle deck
  table.deck = HandEvaluatorService.shuffleDeck(HandEvaluatorService.createDeck());

  // Deal hole cards
  table = dealHoleCards(table, variant);

  // Post blinds and antes
  table = postBlinds(table, smallBlind, bigBlind, ante);

  // Set first to act (after big blind in preflop)
  table.currentPlayerPosition = getNextActivePosition(table, table.bigBlindPosition);

  return table;
}

/**
 * Deal hole cards based on variant
 */
function dealHoleCards(table: PokerTable, variant: PokerVariant): PokerTable {
  const cardsPerPlayer = variant === 'seven_card_stud' ? 7 : 2;

  for (const player of table.players) {
    if (player.chips > 0) {
      const { dealt, remaining } = HandEvaluatorService.dealCards(table.deck, cardsPerPlayer);
      player.holeCards = dealt;
      table.deck = remaining;
    }
  }

  return table;
}

/**
 * Post blinds and antes
 */
function postBlinds(
  table: PokerTable,
  smallBlind: number,
  bigBlind: number,
  ante?: number
): PokerTable {
  // Ante for all players
  if (ante) {
    for (const player of table.players) {
      if (player.chips > 0 && !player.folded) {
        const anteAmount = Math.min(ante, player.chips);
        player.chips -= anteAmount;
        table.pot += anteAmount;

        if (player.chips === 0) {
          player.allIn = true;
        }
      }
    }
  }

  // Small blind
  const sbPlayer = table.players.find(p => p.seatNumber === table.smallBlindPosition);
  if (sbPlayer && sbPlayer.chips > 0) {
    const sbAmount = Math.min(smallBlind, sbPlayer.chips);
    sbPlayer.chips -= sbAmount;
    sbPlayer.currentBet = sbAmount;
    table.pot += sbAmount;

    if (sbPlayer.chips === 0) {
      sbPlayer.allIn = true;
    }
  }

  // Big blind
  const bbPlayer = table.players.find(p => p.seatNumber === table.bigBlindPosition);
  if (bbPlayer && bbPlayer.chips > 0) {
    const bbAmount = Math.min(bigBlind, bbPlayer.chips);
    bbPlayer.chips -= bbAmount;
    bbPlayer.currentBet = bbAmount;
    table.pot += bbAmount;

    if (bbPlayer.chips === 0) {
      bbPlayer.allIn = true;
    }
  }

  return table;
}

/**
 * Get next active player position
 */
function getNextActivePosition(table: PokerTable, currentPosition: number): number {
  const sortedPlayers = [...table.players].sort((a, b) => a.seatNumber - b.seatNumber);
  const currentIndex = sortedPlayers.findIndex(p => p.seatNumber === currentPosition);

  for (let i = 1; i <= sortedPlayers.length; i++) {
    const nextIndex = (currentIndex + i) % sortedPlayers.length;
    const player = sortedPlayers[nextIndex];

    if (!player.folded && !player.allIn && player.chips > 0) {
      return player.seatNumber;
    }
  }

  return currentPosition;
}

/**
 * Process a player action
 */
export function processAction(
  table: PokerTable,
  playerId: string,
  action: PokerAction,
  amount?: number
): PokerTable {
  const player = table.players.find(p => p.characterId === playerId);

  if (!player) {
    throw new Error('Player not found at table');
  }

  if (player.seatNumber !== table.currentPlayerPosition) {
    throw new Error('Not your turn');
  }

  if (player.folded || player.allIn) {
    throw new Error('Cannot act - already folded or all in');
  }

  // Get current bet to call
  const maxBet = Math.max(...table.players.map(p => p.currentBet));
  const callAmount = maxBet - player.currentBet;

  switch (action) {
    case 'fold':
      player.folded = true;
      player.lastAction = 'fold';
      break;

    case 'check':
      if (callAmount > 0) {
        throw new Error('Cannot check - there is a bet to call');
      }
      player.lastAction = 'check';
      break;

    case 'call':
      if (callAmount === 0) {
        throw new Error('Nothing to call - use check instead');
      }
      const actualCall = Math.min(callAmount, player.chips);
      player.chips -= actualCall;
      player.currentBet += actualCall;
      table.pot += actualCall;

      if (player.chips === 0) {
        player.allIn = true;
        player.lastAction = 'all_in';
      } else {
        player.lastAction = 'call';
      }
      break;

    case 'bet':
    case 'raise':
      if (!amount || amount <= 0) {
        throw new Error('Bet/raise amount required');
      }

      const totalBet = amount;
      const additionalChips = totalBet - player.currentBet;

      if (additionalChips > player.chips) {
        throw new Error('Insufficient chips');
      }

      player.chips -= additionalChips;
      player.currentBet = totalBet;
      table.pot += additionalChips;

      if (player.chips === 0) {
        player.allIn = true;
        player.lastAction = 'all_in';
      } else {
        player.lastAction = action;
      }
      break;

    case 'all_in':
      const allInAmount = player.chips;
      player.chips = 0;
      player.currentBet += allInAmount;
      table.pot += allInAmount;
      player.allIn = true;
      player.lastAction = 'all_in';
      break;

    default:
      throw new Error('Invalid action');
  }

  // Move to next player
  table.currentPlayerPosition = getNextActivePosition(table, player.seatNumber);

  // Check if betting round is complete
  if (isBettingRoundComplete(table)) {
    table = advanceRound(table);
  }

  return table;
}

/**
 * Check if betting round is complete
 */
function isBettingRoundComplete(table: PokerTable): boolean {
  const activePlayers = table.players.filter(p => !p.folded && !p.allIn);

  if (activePlayers.length <= 1) {
    return true;
  }

  const maxBet = Math.max(...table.players.map(p => p.currentBet));
  const allMatched = activePlayers.every(p => p.currentBet === maxBet);
  const allActed = activePlayers.every(p => p.lastAction !== undefined);

  return allMatched && allActed;
}

/**
 * Advance to next round
 */
function advanceRound(table: PokerTable): PokerTable {
  // Reset current bets
  for (const player of table.players) {
    player.currentBet = 0;
    player.lastAction = undefined;
  }

  // Deal community cards
  switch (table.currentRound) {
    case 'preflop':
      // Burn one, deal flop (3 cards)
      table.deck = table.deck.slice(1);
      const { dealt: flopCards, remaining: afterFlop } = HandEvaluatorService.dealCards(
        table.deck,
        3
      );
      table.communityCards = flopCards;
      table.deck = afterFlop;
      table.currentRound = 'flop';
      break;

    case 'flop':
      // Burn one, deal turn (1 card)
      table.deck = table.deck.slice(1);
      const { dealt: turnCard, remaining: afterTurn } = HandEvaluatorService.dealCards(
        table.deck,
        1
      );
      table.communityCards.push(turnCard[0]);
      table.deck = afterTurn;
      table.currentRound = 'turn';
      break;

    case 'turn':
      // Burn one, deal river (1 card)
      table.deck = table.deck.slice(1);
      const { dealt: riverCard, remaining: afterRiver } = HandEvaluatorService.dealCards(
        table.deck,
        1
      );
      table.communityCards.push(riverCard[0]);
      table.deck = afterRiver;
      table.currentRound = 'river';
      break;

    case 'river':
      // Go to showdown
      table.currentRound = 'showdown';
      break;
  }

  // Set first to act (player after dealer)
  table.currentPlayerPosition = getNextActivePosition(table, table.dealerPosition);

  return table;
}

/**
 * Resolve showdown and determine winner
 */
export function resolveShowdown(table: PokerTable): {
  table: PokerTable;
  winners: string[];
  winningHand: string;
} {
  const activePlayers = table.players.filter(p => !p.folded);

  if (activePlayers.length === 1) {
    // One player left, they win
    const winner = activePlayers[0];
    winner.chips += table.pot;
    table.pot = 0;

    return {
      table,
      winners: [winner.characterId],
      winningHand: 'Uncontested'
    };
  }

  // Evaluate hands
  const hands = activePlayers.map(p => ({
    playerId: p.characterId,
    cards: [...p.holeCards, ...table.communityCards]
  }));

  const { winners, winningHand } = HandEvaluatorService.determineWinners(hands);

  // Distribute pot
  const winAmount = Math.floor(table.pot / winners.length);
  for (const winnerId of winners) {
    const player = table.players.find(p => p.characterId === winnerId);
    if (player) {
      player.chips += winAmount;
    }
  }

  table.pot = 0;

  return {
    table,
    winners,
    winningHand: winningHand.description
  };
}

/**
 * Check if hand is complete
 */
export function isHandComplete(table: PokerTable): boolean {
  const activePlayers = table.players.filter(p => !p.folded);
  return activePlayers.length <= 1 || table.currentRound === 'showdown';
}

/**
 * Get eligible players for action
 */
export function getEligiblePlayers(table: PokerTable): TablePlayer[] {
  return table.players.filter(p => !p.folded && !p.allIn && p.chips > 0);
}

/**
 * Calculate minimum raise amount
 */
export function getMinRaise(table: PokerTable, bigBlind: number): number {
  const maxBet = Math.max(...table.players.map(p => p.currentBet), 0);
  const lastRaiseAmount = maxBet || bigBlind;
  return maxBet + lastRaiseAmount;
}

export const PokerService = {
  createTable,
  seatPlayer,
  getAvailableSeats,
  startNewHand,
  processAction,
  resolveShowdown,
  isHandComplete,
  getEligiblePlayers,
  getMinRaise
};
