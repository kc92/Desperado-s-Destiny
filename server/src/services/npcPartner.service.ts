/**
 * NPC Partner Service
 * AI decision-making for NPC partners in team-based card games
 *
 * Provides intelligent card play, bidding, and strategy based on:
 * - Difficulty level (easy, medium, hard, expert)
 * - Game theory principles
 * - Partner coordination
 * - Boss mechanic awareness
 */

import {
  TrickCard,
  TeamCardGameType,
  TeamCardGamePhase,
  NPCDifficulty,
  PlayedCard,
  CardSuit,
  CardRank
} from '@desperados/shared';
import {
  getPlayableCards,
  determineTrickWinner,
  getCardValue,
  getPartnerIndex,
  areTeammates,
  getLeftBowerSuit,
  isLeftBower,
  isRightBower
} from './trickTaking.service';
import { SecureRNG } from './base/SecureRNG';
import { ITeamCardPlayer, ITeamCardGameSession } from '../models/TeamCardGameSession.model';

// =============================================================================
// TYPES
// =============================================================================

interface NPCDecisionContext {
  session: ITeamCardGameSession;
  npcPlayer: ITeamCardPlayer;
  npcIndex: number;
}

interface CardEvaluation {
  card: TrickCard;
  index: number;
  score: number;
  reasoning: string;
}

interface BidEvaluation {
  bid: any;
  confidence: number;
  reasoning: string;
}

// =============================================================================
// NPC CREATION
// =============================================================================

/**
 * Create an NPC partner with skills based on difficulty and player context
 */
export function createNPCPartner(
  playerSkill: number,
  difficulty: NPCDifficulty,
  teamIndex: 0 | 1,
  seatIndex: 0 | 1 | 2 | 3
): Partial<ITeamCardPlayer> {
  // Calculate NPC skill based on difficulty and requesting player's skill
  const baseSkill = getBaseSkillForDifficulty(difficulty);
  const skillVariance = Math.floor(playerSkill * 0.1); // ±10% of player skill
  const adjustedSkill = baseSkill + SecureRNG.range(-skillVariance, skillVariance);

  const npcNames = getNPCNames(difficulty);
  const name = SecureRNG.select(npcNames);

  return {
    characterId: `npc_${Date.now()}_${SecureRNG.hex(5)}`,
    characterName: name,
    isNPC: true,
    npcDifficulty: difficulty,
    teamIndex,
    seatIndex,
    hand: [],
    tricksWonRound: 0,
    tricksWonTotal: 0,
    isConnected: true,
    lastActionAt: Date.now(),
    isReady: true,
    gamblingSkill: Math.max(1, Math.min(100, adjustedSkill)),
    perceptionSkill: Math.max(1, Math.min(100, adjustedSkill - 5)),
    deceptionSkill: Math.max(1, Math.min(100, adjustedSkill - 10)),
    sleightOfHandSkill: Math.max(1, Math.min(100, adjustedSkill - 8)),
    contributionScore: 0,
    mechanicsCountered: 0,
    perfectTricks: 0,
    clutchPlays: 0
  };
}

function getBaseSkillForDifficulty(difficulty: NPCDifficulty): number {
  switch (difficulty) {
    case NPCDifficulty.EASY: return 15;
    case NPCDifficulty.MEDIUM: return 30;
    case NPCDifficulty.HARD: return 50;
    case NPCDifficulty.EXPERT: return 75;
    default: return 25;
  }
}

function getNPCNames(difficulty: NPCDifficulty): string[] {
  switch (difficulty) {
    case NPCDifficulty.EASY:
      return [
        'Dusty Dan', 'Greenhorn Gary', 'Lucky Lou', 'Nervous Ned',
        'Rookie Riley', 'Shaky Sam', 'Timid Tom', 'Wobbly Will'
      ];
    case NPCDifficulty.MEDIUM:
      return [
        'Steady Steve', 'Cool Cal', 'Fair Fiona', 'Balanced Bill',
        'Reliable Ruth', 'Moderate Mike', 'Average Andy', 'Standard Sue'
      ];
    case NPCDifficulty.HARD:
      return [
        'Sharp-Eye Shane', 'Quick-Draw Quinn', 'Clever Clara', 'Cunning Carl',
        'Shrewd Sally', 'Wily Wayne', 'Keen Kate', 'Artful Arthur'
      ];
    case NPCDifficulty.EXPERT:
      return [
        'Dead-Eye Duke', 'The Professor', 'Iron Hand Irene', 'Silent Sam',
        'The Mathematician', 'Oracle Olivia', 'Mastermind Max', 'The Shark'
      ];
    default:
      return ['Partner Pete'];
  }
}

// =============================================================================
// DECISION ACCURACY
// =============================================================================

/**
 * Get chance of making optimal decision based on difficulty
 */
function getOptimalDecisionChance(difficulty: NPCDifficulty): number {
  switch (difficulty) {
    case NPCDifficulty.EASY: return 0.60;
    case NPCDifficulty.MEDIUM: return 0.75;
    case NPCDifficulty.HARD: return 0.90;
    case NPCDifficulty.EXPERT: return 0.98;
    default: return 0.70;
  }
}

/**
 * Determine if NPC should make optimal play or suboptimal
 */
function shouldMakeOptimalPlay(difficulty: NPCDifficulty): boolean {
  return SecureRNG.chance(getOptimalDecisionChance(difficulty));
}

// =============================================================================
// CARD PLAY DECISIONS
// =============================================================================

/**
 * Choose the best card to play
 */
export function chooseCard(context: NPCDecisionContext): number {
  const { session, npcPlayer, npcIndex } = context;
  const playable = getPlayableCards(
    npcPlayer.hand,
    session.currentTrick,
    session.trump as CardSuit | undefined,
    session.gameType
  );

  if (playable.length === 0) {
    console.error('NPC has no playable cards!');
    return 0;
  }

  if (playable.length === 1) {
    // Only one legal play
    return npcPlayer.hand.findIndex(c =>
      c.suit === playable[0].suit && c.rank === playable[0].rank
    );
  }

  // Evaluate each playable card
  const evaluations = playable.map((card, i) =>
    evaluateCardPlay(card, context, npcPlayer.hand.findIndex(c =>
      c.suit === card.suit && c.rank === card.rank
    ))
  );

  // Sort by score descending
  evaluations.sort((a, b) => b.score - a.score);

  // Determine if we make optimal or suboptimal play
  if (shouldMakeOptimalPlay(npcPlayer.npcDifficulty || NPCDifficulty.MEDIUM)) {
    return evaluations[0].index;
  } else {
    // Make a suboptimal but not terrible play (pick from top 50%)
    const cutoff = Math.max(1, Math.ceil(evaluations.length / 2));
    const suboptimalIndex = SecureRNG.range(0, cutoff - 1);
    return evaluations[suboptimalIndex].index;
  }
}

function evaluateCardPlay(
  card: TrickCard,
  context: NPCDecisionContext,
  handIndex: number
): CardEvaluation {
  const { session, npcPlayer, npcIndex } = context;
  let score = 50; // Base score
  let reasoning = '';

  const trick = session.currentTrick;
  const trump = session.trump as CardSuit | undefined;
  const isLeading = trick.length === 0;
  const partnerIndex = getPartnerIndex(npcIndex);

  // Calculate card strength
  const cardValue = getCardValue(card, session.gameType, trump);

  if (isLeading) {
    score = evaluateLeadCard(card, context, cardValue);
    reasoning = 'Leading card evaluation';
  } else {
    score = evaluateFollowCard(card, context, cardValue, handIndex);
    reasoning = 'Follow card evaluation';
  }

  // Game-specific adjustments
  switch (session.gameType) {
    case TeamCardGameType.HEARTS:
      score = adjustForHearts(card, score, context);
      break;
    case TeamCardGameType.SPADES:
      score = adjustForSpades(card, score, context);
      break;
    case TeamCardGameType.EUCHRE:
      score = adjustForEuchre(card, score, context);
      break;
    case TeamCardGameType.BRIDGE:
      score = adjustForBridge(card, score, context);
      break;
    case TeamCardGameType.PINOCHLE:
      score = adjustForPinochle(card, score, context);
      break;
  }

  return { card, index: handIndex, score, reasoning };
}

function evaluateLeadCard(
  card: TrickCard,
  context: NPCDecisionContext,
  cardValue: number
): number {
  const { session, npcPlayer, npcIndex } = context;
  const trump = session.trump as CardSuit | undefined;
  let score = 50;

  // Prefer leading with strong off-suit cards
  if (trump && card.suit !== trump) {
    if (cardValue >= 12) {
      // Strong off-suit card - good lead
      score += 20;
    } else if (cardValue <= 5) {
      // Weak card - trying to lose the lead
      score += 5;
    }
  }

  // Leading trump - usually only when team is behind or trying to draw out trump
  if (trump && card.suit === trump) {
    const teamTricksWon = session.tricksWon[npcPlayer.teamIndex];
    const opponentTricksWon = session.tricksWon[1 - npcPlayer.teamIndex];

    if (teamTricksWon < opponentTricksWon) {
      // Behind - might need to lead trump to gain control
      score += 10;
    } else {
      // Ahead - preserve trump
      score -= 15;
    }
  }

  // Aces are generally good leads in no-trump games
  if (!trump && card.rank === CardRank.ACE) {
    score += 25;
  }

  return score;
}

function evaluateFollowCard(
  card: TrickCard,
  context: NPCDecisionContext,
  cardValue: number,
  handIndex: number
): number {
  const { session, npcPlayer, npcIndex } = context;
  const trick = session.currentTrick;
  const trump = session.trump as CardSuit | undefined;
  const partnerIndex = getPartnerIndex(npcIndex);

  let score = 50;

  // Who's currently winning?
  const currentWinner = determineTrickWinner(trick, trump, session.gameType);
  const partnerIsWinning = currentWinner === partnerIndex;
  const teamIsWinning = areTeammates(currentWinner, npcIndex);

  // Simulate if this card would win
  const simulatedTrick = [...trick, { card, playerIndex: npcIndex, timestamp: Date.now() }];
  const wouldWin = determineTrickWinner(simulatedTrick, trump, session.gameType) === npcIndex;

  if (teamIsWinning) {
    // Partner is winning - play low to let them take it
    score = 100 - cardValue * 2; // Lower cards score higher
  } else {
    // Opponents winning - try to beat them
    if (wouldWin) {
      // We can win - prefer winning with lowest possible card
      score = 80 - cardValue; // Win with minimum investment
    } else {
      // Can't win - throw away low card
      score = 100 - cardValue * 2;
    }
  }

  // Last to play - we know exactly what happens
  if (trick.length === 3) {
    if (teamIsWinning && !wouldWin) {
      // Partner has it locked - throw lowest
      score = 100 - cardValue * 3;
    } else if (!teamIsWinning && wouldWin) {
      // Must win to save trick
      score = 90;
    }
  }

  return score;
}

// =============================================================================
// GAME-SPECIFIC ADJUSTMENTS
// =============================================================================

function adjustForHearts(card: TrickCard, score: number, context: NPCDecisionContext): number {
  const { session } = context;

  // Avoid taking hearts
  if (card.suit === CardSuit.HEARTS) {
    score -= 20;
  }

  // Really avoid Queen of Spades
  if (card.suit === CardSuit.SPADES && card.rank === CardRank.QUEEN) {
    score -= 50;
  }

  // If hearts not broken, can't lead hearts
  if (!session.heartsBroken && card.suit === CardSuit.HEARTS && session.currentTrick.length === 0) {
    score -= 100; // Should be filtered by playable, but just in case
  }

  return score;
}

function adjustForSpades(card: TrickCard, score: number, context: NPCDecisionContext): number {
  const { session, npcPlayer, npcIndex } = context;

  // Trump (spades) preservation
  if (card.suit === CardSuit.SPADES) {
    // Check if we've made our bid yet
    const tricksNeeded = npcPlayer.bid?.tricks || 0;
    const tricksWon = session.tricksWon[npcPlayer.teamIndex];

    if (tricksWon >= tricksNeeded) {
      // Already made bid - avoid overtricks (bags)
      score -= 15;
    }
  }

  return score;
}

function adjustForEuchre(card: TrickCard, score: number, context: NPCDecisionContext): number {
  const { session, npcPlayer, npcIndex } = context;
  const trump = session.trump as CardSuit | undefined;

  if (!trump) return score;

  // Right bower is extremely valuable
  if (isRightBower(card, trump)) {
    // Only play if necessary
    const trick = session.currentTrick;
    if (trick.length < 3) {
      // Not last to play - preserve it
      score -= 30;
    }
  }

  // Left bower is also valuable
  if (isLeftBower(card, trump)) {
    if (session.currentTrick.length < 3) {
      score -= 20;
    }
  }

  // If going alone, partner doesn't play
  if (session.goingAlone && getPartnerIndex(session.maker!) === npcIndex) {
    score = 0; // Partner sits out
  }

  return score;
}

function adjustForBridge(card: TrickCard, score: number, context: NPCDecisionContext): number {
  const { session, npcPlayer, npcIndex } = context;

  // If dummy, cards are played by declarer
  if (session.dummy === npcIndex) {
    return score; // Dummy doesn't make decisions
  }

  // Contract awareness - need to make contract
  const contract = session.contract;
  if (contract) {
    const tricksNeeded = 6 + contract.level;
    const tricksWon = session.tricksWon[npcPlayer.teamIndex];
    const tricksRemaining = session.tricksPerRound - session.trickNumber;

    if (tricksWon + tricksRemaining === tricksNeeded) {
      // Must win all remaining - play aggressively
      score += 10;
    }
  }

  return score;
}

function adjustForPinochle(card: TrickCard, score: number, context: NPCDecisionContext): number {
  // In Pinochle, counters (A, 10, K) are worth points
  const isCounter = [CardRank.ACE, CardRank.TEN, CardRank.KING].includes(card.rank);

  if (isCounter) {
    // Prefer not giving counters to opponents
    const { session, npcIndex } = context;
    const currentWinner = determineTrickWinner(session.currentTrick, session.trump as CardSuit, TeamCardGameType.PINOCHLE);

    if (currentWinner !== -1 && !areTeammates(currentWinner, npcIndex)) {
      // Opponent winning - don't throw counters
      score -= 15;
    }
  }

  return score;
}

// =============================================================================
// BIDDING DECISIONS
// =============================================================================

/**
 * Choose a bid based on hand strength and game type
 */
export function chooseBid(context: NPCDecisionContext): any {
  const { session, npcPlayer } = context;

  switch (session.gameType) {
    case TeamCardGameType.SPADES:
      return chooseSpadesBid(context);
    case TeamCardGameType.BRIDGE:
      return chooseBridgeBid(context);
    case TeamCardGameType.PINOCHLE:
      return choosePinochleBid(context);
    default:
      return null;
  }
}

function chooseSpadesBid(context: NPCDecisionContext): { tricks: number; nil: boolean } {
  const { npcPlayer } = context;
  const hand = npcPlayer.hand;

  // Count likely tricks
  let trickEstimate = 0;

  // Count spades (trump)
  const spades = hand.filter(c => c.suit === CardSuit.SPADES);
  spades.forEach(card => {
    const value = getCardValue(card, TeamCardGameType.SPADES, CardSuit.SPADES);
    if (value >= 12) trickEstimate += 1;
    else if (value >= 9) trickEstimate += 0.5;
  });

  // Count off-suit aces
  const offSuitAces = hand.filter(c =>
    c.rank === CardRank.ACE && c.suit !== CardSuit.SPADES
  );
  trickEstimate += offSuitAces.length * 0.8;

  // Count off-suit kings with length
  const suitCounts: Record<string, number> = {};
  hand.forEach(c => {
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
  });

  hand.filter(c => c.rank === CardRank.KING && c.suit !== CardSuit.SPADES).forEach(card => {
    if (suitCounts[card.suit] >= 3) {
      trickEstimate += 0.5;
    }
  });

  // Consider nil bid for very weak hands
  if (trickEstimate < 1 && spades.length <= 2) {
    if (shouldMakeOptimalPlay(npcPlayer.npcDifficulty || NPCDifficulty.MEDIUM)) {
      return { tricks: 0, nil: true };
    }
  }

  // Add some variance based on difficulty
  const variance = shouldMakeOptimalPlay(npcPlayer.npcDifficulty || NPCDifficulty.MEDIUM)
    ? 0
    : SecureRNG.float(-1, 1, 1); // ±1 trick variance for suboptimal

  const finalBid = Math.max(1, Math.min(13, Math.round(trickEstimate + variance)));

  return { tricks: finalBid, nil: false };
}

function chooseBridgeBid(context: NPCDecisionContext): { level: number; suit: string; pass: boolean } {
  const { session, npcPlayer } = context;
  const hand = npcPlayer.hand;

  // Calculate High Card Points (HCP)
  let hcp = 0;
  hand.forEach(card => {
    switch (card.rank) {
      case CardRank.ACE: hcp += 4; break;
      case CardRank.KING: hcp += 3; break;
      case CardRank.QUEEN: hcp += 2; break;
      case CardRank.JACK: hcp += 1; break;
    }
  });

  // Count suit lengths
  const suitLengths: Record<string, number> = {
    [CardSuit.SPADES]: 0,
    [CardSuit.HEARTS]: 0,
    [CardSuit.DIAMONDS]: 0,
    [CardSuit.CLUBS]: 0
  };
  hand.forEach(c => suitLengths[c.suit]++);

  // Find longest suit
  let longestSuit = CardSuit.CLUBS;
  let longestLength = 0;
  Object.entries(suitLengths).forEach(([suit, length]) => {
    if (length > longestLength) {
      longestLength = length;
      longestSuit = suit as CardSuit;
    }
  });

  // Simple bidding logic
  if (hcp < 12) {
    return { level: 0, suit: '', pass: true };
  }

  // Determine bid level based on HCP
  let level = 1;
  if (hcp >= 20) level = 3;
  else if (hcp >= 16) level = 2;

  // Check for NT (no trump) with balanced hand
  const isBalanced = Object.values(suitLengths).every(l => l >= 2 && l <= 5);
  if (isBalanced && hcp >= 15) {
    return { level, suit: 'NT', pass: false };
  }

  // Bid longest suit if 5+ cards
  if (longestLength >= 5) {
    return { level, suit: longestSuit, pass: false };
  }

  // Default to minor suit or NT
  return { level: 1, suit: suitLengths[CardSuit.CLUBS] >= suitLengths[CardSuit.DIAMONDS] ? CardSuit.CLUBS : CardSuit.DIAMONDS, pass: false };
}

function choosePinochleBid(context: NPCDecisionContext): { points: number; pass: boolean } {
  const { npcPlayer, session } = context;
  const hand = npcPlayer.hand;

  // Evaluate meld potential
  let meldEstimate = 0;

  // Check for marriages (K-Q same suit)
  const suits = [CardSuit.SPADES, CardSuit.HEARTS, CardSuit.DIAMONDS, CardSuit.CLUBS];
  suits.forEach(suit => {
    const hasKing = hand.some(c => c.suit === suit && c.rank === CardRank.KING);
    const hasQueen = hand.some(c => c.suit === suit && c.rank === CardRank.QUEEN);
    if (hasKing && hasQueen) {
      meldEstimate += 20; // Marriage
    }
  });

  // Check for pinochle (Jack of Diamonds + Queen of Spades)
  const hasJackDiamonds = hand.some(c => c.suit === CardSuit.DIAMONDS && c.rank === CardRank.JACK);
  const hasQueenSpades = hand.some(c => c.suit === CardSuit.SPADES && c.rank === CardRank.QUEEN);
  if (hasJackDiamonds && hasQueenSpades) {
    meldEstimate += 40;
  }

  // Count aces for "aces around"
  const aceCount = hand.filter(c => c.rank === CardRank.ACE).length;
  if (aceCount >= 4) {
    meldEstimate += 100;
  }

  // Estimate playing strength
  let playingStrength = 0;
  hand.forEach(card => {
    if (card.rank === CardRank.ACE) playingStrength += 3;
    else if (card.rank === CardRank.TEN) playingStrength += 2;
    else if (card.rank === CardRank.KING) playingStrength += 1;
  });

  const totalEstimate = meldEstimate + playingStrength;

  // Minimum bid is typically 250 in Pinochle
  if (totalEstimate < 200) {
    return { points: 0, pass: true };
  }

  // Add variance for suboptimal play
  const variance = shouldMakeOptimalPlay(npcPlayer.npcDifficulty || NPCDifficulty.MEDIUM)
    ? 0
    : SecureRNG.float(-25, 25, 0);

  return {
    points: Math.max(250, Math.round(totalEstimate + variance)),
    pass: false
  };
}

// =============================================================================
// EUCHRE-SPECIFIC DECISIONS
// =============================================================================

/**
 * Choose whether to order up, pass, or call trump in Euchre
 */
export function chooseEuchreTrumpCall(context: NPCDecisionContext): {
  action: 'order_up' | 'pass' | 'call' | 'pick_up';
  suit?: CardSuit;
  alone?: boolean;
} {
  const { session, npcPlayer, npcIndex } = context;
  const hand = npcPlayer.hand;
  const upCard = session.upCard;
  const dealerIndex = session.dealer;
  const isDealer = npcIndex === dealerIndex;
  const isPartnerDealer = getPartnerIndex(npcIndex) === dealerIndex;

  // First round - deciding on up card suit
  // TRUMP_SELECTION phase means we're in the first round of trump calling
  if (session.phase === TeamCardGamePhase.TRUMP_SELECTION) {

    if (!upCard) {
      return { action: 'pass' };
    }

    const upCardSuit = upCard.suit;
    const trumpStrength = evaluateTrumpStrength(hand, upCardSuit);

    // Consider if dealer would pick up
    if (isDealer) {
      // Dealer must decide - pick up if decent hand
      if (trumpStrength >= 3) {
        return {
          action: 'pick_up',
          alone: trumpStrength >= 6 && shouldMakeOptimalPlay(npcPlayer.npcDifficulty || NPCDifficulty.MEDIUM)
        };
      }
      // Forced to pick up or pass to next round
      return { action: 'pass' };
    }

    // Non-dealer deciding
    if (trumpStrength >= 4) {
      // Order it up
      return {
        action: 'order_up',
        alone: trumpStrength >= 6 && shouldMakeOptimalPlay(npcPlayer.npcDifficulty || NPCDifficulty.MEDIUM)
      };
    }

    // Help partner if they're dealer
    if (isPartnerDealer && trumpStrength >= 3) {
      return { action: 'order_up' };
    }

    return { action: 'pass' };
  }

  // Second round - can call any suit except turned down
  const turnedDownSuit = upCard?.suit;
  const suits = [CardSuit.SPADES, CardSuit.HEARTS, CardSuit.DIAMONDS, CardSuit.CLUBS]
    .filter(s => s !== turnedDownSuit);

  // Evaluate each potential trump
  let bestSuit: CardSuit | null = null;
  let bestStrength = 0;

  suits.forEach(suit => {
    const strength = evaluateTrumpStrength(hand, suit);
    if (strength > bestStrength) {
      bestStrength = strength;
      bestSuit = suit;
    }
  });

  // Dealer is "stuck" in second round (must call something)
  if (isDealer) {
    return {
      action: 'call',
      suit: bestSuit || suits[0],
      alone: bestStrength >= 6
    };
  }

  if (bestStrength >= 4 && bestSuit) {
    return {
      action: 'call',
      suit: bestSuit,
      alone: bestStrength >= 6
    };
  }

  return { action: 'pass' };
}

/**
 * Evaluate hand strength for a potential trump suit in Euchre
 */
function evaluateTrumpStrength(hand: TrickCard[], trumpSuit: CardSuit): number {
  let strength = 0;
  const leftBowerSuit = getLeftBowerSuit(trumpSuit);

  hand.forEach(card => {
    // Right bower
    if (card.suit === trumpSuit && card.rank === CardRank.JACK) {
      strength += 3;
    }
    // Left bower
    else if (card.suit === leftBowerSuit && card.rank === CardRank.JACK) {
      strength += 2.5;
    }
    // Other trump
    else if (card.suit === trumpSuit) {
      if (card.rank === CardRank.ACE) strength += 2;
      else if (card.rank === CardRank.KING) strength += 1.5;
      else if (card.rank === CardRank.QUEEN) strength += 1;
      else strength += 0.5;
    }
    // Off-suit aces
    else if (card.rank === CardRank.ACE) {
      strength += 1;
    }
  });

  // Count trump (including left bower)
  const trumpCount = hand.filter(c =>
    c.suit === trumpSuit || (c.suit === leftBowerSuit && c.rank === CardRank.JACK)
  ).length;

  // Bonus for trump length
  if (trumpCount >= 3) strength += 1;
  if (trumpCount >= 4) strength += 1;

  return strength;
}

/**
 * Choose which card to discard after picking up in Euchre
 */
export function chooseDiscard(context: NPCDecisionContext): number {
  const { session, npcPlayer } = context;
  const hand = npcPlayer.hand;
  const trump = session.trump as CardSuit;

  if (!trump || hand.length !== 6) {
    return 0; // Shouldn't happen, but fallback
  }

  // Find the weakest card (not trump, not a bower)
  let worstIndex = 0;
  let worstValue = Infinity;

  hand.forEach((card, index) => {
    // Never discard trump
    if (card.suit === trump) return;

    // Never discard left bower
    if (isLeftBower(card, trump)) return;

    const value = getCardValue(card, TeamCardGameType.EUCHRE, trump);

    // Prefer discarding low off-suit cards
    // Especially from short suits
    const suitCount = hand.filter(c => c.suit === card.suit).length;
    const adjustedValue = value + (suitCount * 2); // Penalize keeping from long suits

    if (adjustedValue < worstValue) {
      worstValue = adjustedValue;
      worstIndex = index;
    }
  });

  return worstIndex;
}

// =============================================================================
// BOSS MECHANIC RESPONSES
// =============================================================================

/**
 * Determine if NPC can help counter a boss mechanic
 */
export function canCounterBossMechanic(
  mechanic: any,
  npcPlayer: ITeamCardPlayer
): { canCounter: boolean; skill: string; value: number } {
  const { perceptionSkill, sleightOfHandSkill, gamblingSkill, deceptionSkill } = npcPlayer;

  switch (mechanic.type) {
    case 'marked_deck':
    case 'reveal_hand':
      if (perceptionSkill >= (mechanic.counterThreshold?.perception || 40)) {
        return { canCounter: true, skill: 'perception', value: perceptionSkill };
      }
      break;

    case 'cold_deck':
    case 'card_swap':
    case 'hand_corruption':
      if (sleightOfHandSkill >= (mechanic.counterThreshold?.sleightOfHand || 45)) {
        return { canCounter: true, skill: 'sleightOfHand', value: sleightOfHandSkill };
      }
      break;

    case 'bid_interference':
    case 'meld_corruption':
      if (deceptionSkill >= (mechanic.counterThreshold?.deception || 35)) {
        return { canCounter: true, skill: 'deception', value: deceptionSkill };
      }
      break;

    case 'time_pressure':
      // Can't really counter time pressure with skills
      break;

    default:
      // Generic counter with gambling skill
      if (gamblingSkill >= (mechanic.counterThreshold?.gambling || 50)) {
        return { canCounter: true, skill: 'gambling', value: gamblingSkill };
      }
  }

  return { canCounter: false, skill: '', value: 0 };
}

// =============================================================================
// EXPORTS (NAMESPACE)
// =============================================================================

export const NPCPartnerService = {
  createNPCPartner,
  chooseCard,
  chooseBid,
  chooseEuchreTrumpCall,
  chooseDiscard,
  canCounterBossMechanic
};
