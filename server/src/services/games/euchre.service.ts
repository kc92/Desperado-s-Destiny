/**
 * Euchre Game Service
 * Implementation of Euchre card game mechanics
 *
 * Rules:
 * - 4 players in 2 teams (partners sit across)
 * - 24-card deck (9-A of each suit)
 * - 5 cards dealt to each player, 4 to kitty
 * - Trump calling with up-card
 * - Right Bower (Jack of trump) is highest
 * - Left Bower (Jack of same color) is second highest
 * - "Going alone" option for maker
 * - First team to 10 points wins
 */

import {
  Suit,
  Rank,
  TeamCardGameType,
  TeamCardGamePhase,
  TeamCardGameSession,
  TeamCardPlayer,
  TrickCard,
  PlayedCard,
  EuchreTrumpCall,
  TeamCardRoundScore,
  RoundOutcome
} from '@desperados/shared';

import {
  TrickTakingService,
  dealEuchre,
  markBowers,
  getPlayableCards,
  determineTrickWinner,
  createTrickResult,
  sortHand,
  getTeamIndex
} from '../trickTaking.service';

// =============================================================================
// TYPES
// =============================================================================

export interface EuchreState {
  /** Which round of trump calling (1 = up-card offered, 2 = call any suit) */
  trumpCallRound: 1 | 2;
  /** Who is being asked about trump */
  currentBidder: number;
  /** The up-card from kitty */
  upCard: TrickCard;
  /** The full kitty (4 cards) */
  kitty: TrickCard[];
  /** Who called trump (maker) */
  maker?: number;
  /** The trump suit */
  trump?: Suit;
  /** Is maker going alone? */
  goingAlone: boolean;
  /** Is defender going alone? (rare defensive option) */
  defenderAlone: boolean;
  /** Dealer's discard when picking up */
  dealerDiscard?: TrickCard;
}

// =============================================================================
// DEALING
// =============================================================================

/**
 * Initialize a new Euchre round
 */
export function initializeEuchreRound(
  session: TeamCardGameSession,
  dealer: number
): TeamCardGameSession {
  const { hands, kitty, upCard } = dealEuchre();

  // Assign hands to players
  for (let i = 0; i < 4; i++) {
    session.players[i].hand = sortHand(hands[i]);
    session.players[i].tricksWonRound = 0;
  }

  // Set up Euchre-specific state
  session.dealer = dealer;
  session.currentPlayer = (dealer + 1) % 4; // Left of dealer goes first
  session.phase = TeamCardGamePhase.BIDDING;
  session.kitty = kitty;
  session.upCard = upCard;
  session.trump = undefined;
  session.maker = undefined;
  session.goingAlone = false;
  session.tricksWon = [0, 0];
  session.trickNumber = 0;
  session.currentTrick = [];
  session.trickHistory = [];

  return session;
}

// =============================================================================
// TRUMP CALLING (BIDDING PHASE)
// =============================================================================

/**
 * Get available trump call actions for current bidder
 */
export function getAvailableTrumpCalls(
  session: TeamCardGameSession,
  playerIndex: number
): string[] {
  const isDealer = playerIndex === session.dealer;
  const upCard = session.upCard;

  if (!upCard) {
    // Second round - can call any suit except up-card suit
    return ['call_clubs', 'call_diamonds', 'call_hearts', 'call_spades', 'pass']
      .filter(action => {
        if (action === 'pass' && isDealer) {
          // Dealer must call something in round 2 ("stick the dealer")
          return false;
        }
        return true;
      });
  }

  // First round - can order up the up-card or pass
  const actions = ['pass'];

  if (isDealer) {
    // Dealer picks up the card
    actions.push('pick_up');
    actions.push('pick_up_alone');
  } else {
    // Non-dealer orders it up
    actions.push('order_up');
    actions.push('order_up_alone');
  }

  return actions;
}

/**
 * Process a trump call action
 */
export function processTrumpCall(
  session: TeamCardGameSession,
  playerIndex: number,
  call: EuchreTrumpCall
): { session: TeamCardGameSession; success: boolean; message: string } {
  if (playerIndex !== session.currentPlayer) {
    return { session, success: false, message: 'Not your turn to call' };
  }

  if (session.phase !== TeamCardGamePhase.BIDDING) {
    return { session, success: false, message: 'Not in bidding phase' };
  }

  const isDealer = playerIndex === session.dealer;
  const upCard = session.upCard;

  // Handle pass
  if (call.action === 'pass') {
    // Move to next player
    const nextBidder = (playerIndex + 1) % 4;

    if (nextBidder === session.dealer && upCard) {
      // Everyone passed on up-card, dealer must decide
      session.currentPlayer = session.dealer;
      return {
        session,
        success: true,
        message: 'Passed. Dealer must pick up or turn down.'
      };
    }

    if (upCard && playerIndex === session.dealer) {
      // Dealer turned down up-card, start round 2
      session.upCard = undefined; // No longer offering up-card
      session.currentPlayer = (session.dealer + 1) % 4;
      return {
        session,
        success: true,
        message: `Dealer turned down ${upCard.suit}. Call any suit.`
      };
    }

    if (!upCard && playerIndex === session.dealer) {
      // "Stick the dealer" - dealer must call
      return { session, success: false, message: 'Dealer must call a suit (stick the dealer)' };
    }

    session.currentPlayer = nextBidder;
    return { session, success: true, message: 'Passed' };
  }

  // Handle order up / pick up (first round)
  if (call.action === 'order_up' || call.action === 'pick_up') {
    if (!upCard) {
      return { session, success: false, message: 'No up-card to order' };
    }

    session.trump = upCard.suit;
    session.maker = playerIndex;
    session.goingAlone = call.goingAlone;

    // Dealer picks up the up-card and discards
    const dealer = session.players[session.dealer];
    dealer.hand.push(upCard);

    // Mark bowers in all hands
    for (const player of session.players) {
      player.hand = markBowers(player.hand, session.trump);
    }

    // Move to discard phase for dealer
    if (isDealer) {
      session.phase = TeamCardGamePhase.TRUMP_SELECTION;
      session.currentPlayer = session.dealer;
      return {
        session,
        success: true,
        message: `You picked up ${formatCard(upCard)}. Discard one card.`
      };
    } else {
      // Non-dealer ordered it up - dealer still discards but we handle it
      session.phase = TeamCardGamePhase.TRUMP_SELECTION;
      session.currentPlayer = session.dealer;
      return {
        session,
        success: true,
        message: `${session.players[playerIndex].characterName} ordered up ${upCard.suit}${call.goingAlone ? ' and is going alone!' : ''}`
      };
    }
  }

  // Handle call (second round)
  if (call.action === 'call' && call.suit) {
    session.trump = call.suit;
    session.maker = playerIndex;
    session.goingAlone = call.goingAlone;

    // Mark bowers in all hands
    for (const player of session.players) {
      player.hand = markBowers(player.hand, session.trump);
    }

    // Start playing
    session.phase = TeamCardGamePhase.PLAYING;
    session.currentPlayer = (session.dealer + 1) % 4;

    // Skip partner if going alone
    if (session.goingAlone) {
      const partnerIndex = (session.maker + 2) % 4;
      if (session.currentPlayer === partnerIndex) {
        session.currentPlayer = (session.currentPlayer + 1) % 4;
      }
    }

    return {
      session,
      success: true,
      message: `${session.players[playerIndex].characterName} called ${call.suit}${call.goingAlone ? ' and is going alone!' : ''}`
    };
  }

  return { session, success: false, message: 'Invalid trump call action' };
}

/**
 * Process dealer's discard after picking up
 */
export function processDealerDiscard(
  session: TeamCardGameSession,
  cardIndex: number
): { session: TeamCardGameSession; success: boolean; message: string } {
  if (session.phase !== TeamCardGamePhase.TRUMP_SELECTION) {
    return { session, success: false, message: 'Not in discard phase' };
  }

  if (session.currentPlayer !== session.dealer) {
    return { session, success: false, message: 'Only dealer can discard' };
  }

  const dealer = session.players[session.dealer];

  if (cardIndex < 0 || cardIndex >= dealer.hand.length) {
    return { session, success: false, message: 'Invalid card index' };
  }

  // Remove discarded card
  const discarded = dealer.hand.splice(cardIndex, 1)[0];

  // Sort the hand
  dealer.hand = sortHand(dealer.hand, session.trump, TeamCardGameType.EUCHRE);

  // Start playing
  session.phase = TeamCardGamePhase.PLAYING;
  session.currentPlayer = (session.dealer + 1) % 4;

  // Skip partner if going alone
  if (session.goingAlone && session.maker !== undefined) {
    const partnerIndex = (session.maker + 2) % 4;
    if (session.currentPlayer === partnerIndex) {
      session.currentPlayer = (session.currentPlayer + 1) % 4;
    }
  }

  return {
    session,
    success: true,
    message: `Discarded ${formatCard(discarded)}. Playing begins.`
  };
}

// =============================================================================
// TRICK PLAY
// =============================================================================

/**
 * Get valid cards that can be played
 */
export function getPlayableCardIndices(
  session: TeamCardGameSession,
  playerIndex: number
): number[] {
  const player = session.players[playerIndex];
  const playable = getPlayableCards(
    player.hand,
    session.currentTrick,
    session.trump || null,
    TeamCardGameType.EUCHRE
  );

  return player.hand
    .map((card, index) => ({ card, index }))
    .filter(({ card }) =>
      playable.some(p => p.suit === card.suit && p.rank === card.rank)
    )
    .map(({ index }) => index);
}

/**
 * Play a card to the current trick
 */
export function playCard(
  session: TeamCardGameSession,
  playerIndex: number,
  cardIndex: number
): { session: TeamCardGameSession; success: boolean; message: string } {
  if (session.phase !== TeamCardGamePhase.PLAYING) {
    return { session, success: false, message: 'Not in playing phase' };
  }

  if (playerIndex !== session.currentPlayer) {
    return { session, success: false, message: 'Not your turn' };
  }

  const player = session.players[playerIndex];

  if (cardIndex < 0 || cardIndex >= player.hand.length) {
    return { session, success: false, message: 'Invalid card index' };
  }

  // Validate the play
  const validIndices = getPlayableCardIndices(session, playerIndex);
  if (!validIndices.includes(cardIndex)) {
    return { session, success: false, message: 'Must follow suit if possible' };
  }

  // Play the card
  const card = player.hand.splice(cardIndex, 1)[0];
  session.currentTrick.push({
    card,
    playerIndex,
    timestamp: Date.now()
  });

  // Determine next player
  let nextPlayer = (playerIndex + 1) % 4;

  // Skip partner if someone is going alone
  if (session.goingAlone && session.maker !== undefined) {
    const partnerIndex = (session.maker + 2) % 4;
    if (nextPlayer === partnerIndex) {
      nextPlayer = (nextPlayer + 1) % 4;
    }
  }

  // Check if trick is complete
  const playersInRound = session.goingAlone ? 3 : 4;
  if (session.currentTrick.length === playersInRound) {
    return resolveTrick(session);
  }

  session.currentPlayer = nextPlayer;
  return {
    session,
    success: true,
    message: `${player.characterName} played ${formatCard(card)}`
  };
}

/**
 * Resolve a completed trick
 */
function resolveTrick(
  session: TeamCardGameSession
): { session: TeamCardGameSession; success: boolean; message: string } {
  const winnerIndex = determineTrickWinner(
    session.currentTrick,
    session.trump || null,
    TeamCardGameType.EUCHRE
  );

  const winner = session.players[winnerIndex];
  const winningTeam = getTeamIndex(winnerIndex);

  // Update trick counts
  session.tricksWon[winningTeam]++;
  winner.tricksWonRound++;
  session.trickNumber++;

  // Record trick history
  const trickResult = createTrickResult(
    session.currentTrick,
    session.trickNumber,
    session.trump || null,
    TeamCardGameType.EUCHRE,
    session.players.map(p => ({
      characterName: p.characterName,
      teamIndex: p.teamIndex
    }))
  );
  session.trickHistory.push(trickResult);

  // Clear current trick
  session.currentTrick = [];

  // Check if round is complete (5 tricks in Euchre)
  if (session.trickNumber >= 5) {
    return resolveRound(session);
  }

  // Winner leads next trick
  session.currentPlayer = winnerIndex;

  return {
    session,
    success: true,
    message: `${winner.characterName} wins the trick! (${session.tricksWon[0]}-${session.tricksWon[1]})`
  };
}

// =============================================================================
// ROUND SCORING
// =============================================================================

/**
 * Resolve a completed round and calculate scores
 */
function resolveRound(
  session: TeamCardGameSession
): { session: TeamCardGameSession; success: boolean; message: string } {
  session.phase = TeamCardGamePhase.ROUND_SCORING;

  if (session.maker === undefined) {
    return { session, success: false, message: 'No maker set' };
  }

  const makerTeam = getTeamIndex(session.maker);
  const defenderTeam = makerTeam === 0 ? 1 : 0;
  const makerTricks = session.tricksWon[makerTeam];
  const defenderTricks = session.tricksWon[defenderTeam];

  let points = 0;
  let outcome: RoundOutcome = 'normal';
  let winningTeam: 0 | 1;
  let message = '';

  if (makerTricks >= 3) {
    // Makers succeeded
    winningTeam = makerTeam;

    if (makerTricks === 5) {
      // March (all 5 tricks)
      if (session.goingAlone) {
        points = 4;
        outcome = 'alone_march';
        message = `${session.players[session.maker].characterName} marched alone! 4 points!`;
      } else {
        points = 2;
        outcome = 'march';
        message = `March! Makers took all 5 tricks. 2 points!`;
      }
    } else {
      points = 1;
      outcome = 'made';
      message = `Makers made it with ${makerTricks} tricks. 1 point.`;
    }
  } else {
    // EUCHRE! Defenders stopped makers
    winningTeam = defenderTeam;
    points = 2;
    outcome = 'euchre';
    message = `EUCHRE! Defenders stopped the makers. 2 points to defenders!`;
  }

  // Update team score
  session.teamScores[winningTeam] += points;

  // Record round score
  const roundScore: TeamCardRoundScore = {
    roundNumber: session.currentRound,
    team0Score: winningTeam === 0 ? points : 0,
    team1Score: winningTeam === 1 ? points : 0,
    tricksWon: [...session.tricksWon] as [number, number],
    outcome
  };
  session.roundScores.push(roundScore);

  // Check for game over (first to 10)
  if (session.teamScores[0] >= 10 || session.teamScores[1] >= 10) {
    session.phase = TeamCardGamePhase.GAME_COMPLETE;
    const gameWinner = session.teamScores[0] >= 10 ? 0 : 1;
    message += ` Team ${gameWinner + 1} wins the game!`;
  } else {
    // Prepare for next round
    session.currentRound++;
    // Dealer rotates
    const nextDealer = (session.dealer + 1) % 4;
    // Re-initialize for next round
    initializeEuchreRound(session, nextDealer);
  }

  return { session, success: true, message };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format a card for display
 */
function formatCard(card: TrickCard): string {
  const rankNames: Record<number, string> = {
    [Rank.NINE]: '9',
    [Rank.TEN]: '10',
    [Rank.JACK]: 'J',
    [Rank.QUEEN]: 'Q',
    [Rank.KING]: 'K',
    [Rank.ACE]: 'A'
  };

  const suitSymbols: Record<string, string> = {
    [Suit.SPADES]: '\u2660',
    [Suit.HEARTS]: '\u2665',
    [Suit.DIAMONDS]: '\u2666',
    [Suit.CLUBS]: '\u2663'
  };

  const rank = rankNames[card.rank] || card.rank.toString();
  const suit = suitSymbols[card.suit] || card.suit;

  let display = `${rank}${suit}`;

  if (card.isBower) {
    display += card.bowerType === 'right' ? ' (Right)' : ' (Left)';
  }

  return display;
}

/**
 * Check if a player can go alone
 */
export function canGoAlone(
  hand: TrickCard[],
  trump: Suit
): { recommended: boolean; reason: string } {
  // Mark bowers to evaluate
  const markedHand = markBowers(hand, trump);

  // Count trump cards (including left bower)
  const trumpCount = markedHand.filter(c =>
    c.suit === trump || c.bowerType === 'left'
  ).length;

  // Check for right bower
  const hasRightBower = markedHand.some(c => c.bowerType === 'right');

  // Check for left bower
  const hasLeftBower = markedHand.some(c => c.bowerType === 'left');

  // Count aces in off-suits
  const offSuitAces = markedHand.filter(c =>
    c.rank === Rank.ACE && c.suit !== trump && c.bowerType !== 'left'
  ).length;

  // Strong alone hand: Both bowers + 1 trump, or Right bower + 3 trump + ace
  if (hasRightBower && hasLeftBower && trumpCount >= 3) {
    return { recommended: true, reason: 'Both bowers and strong trump' };
  }

  if (hasRightBower && trumpCount >= 4 && offSuitAces >= 1) {
    return { recommended: true, reason: 'Right bower, 4 trump, and off-suit ace' };
  }

  if (trumpCount >= 4 && hasRightBower) {
    return { recommended: true, reason: 'Very strong trump holding' };
  }

  return { recommended: false, reason: 'Hand not strong enough for alone' };
}

/**
 * Evaluate hand strength for trump calling
 */
export function evaluateHandForTrump(
  hand: TrickCard[],
  potentialTrump: Suit
): { strength: number; recommendation: 'call' | 'pass' | 'consider' } {
  const markedHand = markBowers(hand, potentialTrump);

  let strength = 0;

  // Right bower is worth 4
  if (markedHand.some(c => c.bowerType === 'right')) {
    strength += 4;
  }

  // Left bower is worth 3
  if (markedHand.some(c => c.bowerType === 'left')) {
    strength += 3;
  }

  // Other trump cards
  const otherTrump = markedHand.filter(c =>
    c.suit === potentialTrump && !c.isBower
  );

  for (const card of otherTrump) {
    if (card.rank === Rank.ACE) strength += 2;
    else if (card.rank === Rank.KING) strength += 1.5;
    else if (card.rank === Rank.QUEEN) strength += 1;
    else strength += 0.5;
  }

  // Off-suit aces
  const offSuitAces = markedHand.filter(c =>
    c.rank === Rank.ACE && c.suit !== potentialTrump && c.bowerType !== 'left'
  ).length;
  strength += offSuitAces * 1.5;

  // Recommendation thresholds
  if (strength >= 7) {
    return { strength, recommendation: 'call' };
  } else if (strength >= 5) {
    return { strength, recommendation: 'consider' };
  }

  return { strength, recommendation: 'pass' };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const EuchreService = {
  initializeEuchreRound,
  getAvailableTrumpCalls,
  processTrumpCall,
  processDealerDiscard,
  getPlayableCardIndices,
  playCard,
  canGoAlone,
  evaluateHandForTrump,
  formatCard
};
