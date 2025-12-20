/**
 * PvP Duel Types - Real-Time Duel System
 *
 * Shared types for Socket.io-based real-time PvP duels
 * Used by both frontend and backend
 */

import { Card, HandRank } from './destinyDeck.types';

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Duel status progression
 */
export enum DuelStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

/**
 * Duel type variants
 */
export enum DuelType {
  CASUAL = 'casual',
  RANKED = 'ranked',
  WAGER = 'wager'
}

/**
 * Phase of a duel round
 */
export enum DuelPhase {
  WAITING = 'waiting',         // Waiting for opponent
  READY_CHECK = 'ready_check', // Both players confirm ready
  DEALING = 'dealing',         // Cards being dealt (animation)
  SELECTION = 'selection',     // Players selecting cards to hold
  REVEAL = 'reveal',           // Cards being revealed
  BETTING = 'betting',         // Betting round
  SHOWDOWN = 'showdown',       // Comparing hands
  ROUND_END = 'round_end',     // Round results
  DUEL_END = 'duel_end'        // Final results
}

// =============================================================================
// PLAYER TYPES
// =============================================================================

/**
 * Player info visible to both players
 */
export interface DuelPlayer {
  characterId: string;
  name: string;
  level: number;
  faction?: string;
  zodiacSign?: string;
  avatarUrl?: string;
}

/**
 * Player state during a duel
 */
export interface DuelPlayerState {
  characterId: string;
  name: string;
  isReady: boolean;
  isConnected: boolean;
  hand: Card[];                    // Own cards (hidden from opponent)
  heldIndices: number[];           // Indices of cards being held
  hasSubmittedAction: boolean;
  currentBet: number;
  totalPotContribution: number;
  roundsWon: number;
  hasFolded: boolean;
  lastAction?: BettingAction;
}

/**
 * What one player can see about their opponent
 */
export interface OpponentVisibleState {
  characterId: string;
  name: string;
  level: number;
  isReady: boolean;
  isConnected: boolean;
  hasSubmittedAction: boolean;
  currentBet: number;
  totalPotContribution: number;
  roundsWon: number;
  hasFolded: boolean;
  cardCount: number;               // Number of cards (not the actual cards)
  revealedCards?: Card[];          // Cards revealed during showdown
  lastAction?: BettingAction;
  // Perception-based hints
  perceptionHints?: PerceptionHint[];
}

// =============================================================================
// PERCEPTION SYSTEM
// =============================================================================

/**
 * Types of perception hints
 */
export enum PerceptionHintType {
  CONFIDENCE = 'confidence',       // nervous/calm/confident
  HAND_STRENGTH = 'hand_strength', // weak/moderate/strong
  HAND_RANGE = 'hand_range',       // weak/moderate/strong (alias)
  TELL = 'tell',                   // "They're bluffing"
  BEHAVIOR_TELL = 'behavior_tell', // Behavior-based tells
  PARTIAL_REVEAL = 'partial_reveal', // See 1-2 cards
  PREDICTION = 'prediction',       // Predict opponent action
  ACTION_PREDICT = 'action_predict', // Predict specific action
  FALSE_TELL = 'false_tell'        // Deceptive hint (enemy ability)
}

/**
 * Player ability state during duel
 * (DuelAbility enum defined in ABILITY TYPES section below)
 */
export interface AbilityState {
  available: string[];               // Available ability IDs
  cooldowns: Record<string, number>; // ability -> rounds remaining
  energy: number;
  maxEnergy: number;
  pokerFaceActive: boolean;
  pokerFaceRoundsLeft: number;
}

/**
 * A single perception hint
 */
export interface PerceptionHint {
  type: PerceptionHintType;
  message: string;
  confidence: number;              // 0-100 accuracy
  revealedCard?: Card;             // For partial reveals
  predictedAction?: string;        // For predictions
}

/**
 * Perception check result
 */
export interface PerceptionCheckResult {
  success: boolean;
  hints: PerceptionHint[];
  energyCost: number;
  wasBlocked: boolean;             // Blocked by opponent's Poker Face
}

// =============================================================================
// BETTING TYPES
// =============================================================================

/**
 * Available betting actions
 */
export enum BettingAction {
  CHECK = 'check',
  BET = 'bet',
  CALL = 'call',
  RAISE = 'raise',
  FOLD = 'fold',
  ALL_IN = 'all_in'
}

/**
 * A betting action submission
 */
export interface BetSubmission {
  action: BettingAction;
  amount?: number;                 // For bet/raise
}

// =============================================================================
// ROUND STATE
// =============================================================================

/**
 * State of a single duel round
 */
export interface DuelRoundState {
  roundNumber: number;
  phase: DuelPhase;
  pot: number;
  currentBet: number;              // Current bet to match
  turnPlayerId: string;            // Whose turn for betting
  turnTimeLimit: number;           // Seconds for current turn
  turnStartedAt: number;           // Timestamp
  dealerPosition: 'challenger' | 'challenged';
}

/**
 * Results of a completed round
 */
export interface RoundResult {
  roundNumber: number;
  winnerId: string;
  winnerName: string;
  winnerHand: Card[];
  winnerHandRank: HandRank;
  winnerHandName: string;
  loserHand: Card[];
  loserHandRank: HandRank;
  loserHandName: string;
  potWon: number;
  isTie: boolean;
  margin: number;                  // Score difference
}

// =============================================================================
// DUEL STATE
// =============================================================================

/**
 * Complete duel state (server-side, full info)
 */
export interface DuelState {
  duelId: string;
  status: DuelStatus;
  type: DuelType;
  wagerAmount: number;

  challenger: DuelPlayerState;
  challenged: DuelPlayerState;

  round: DuelRoundState;
  roundResults: RoundResult[];

  totalRounds: number;             // Best of X (default: 3)
  startedAt: number;
  lastActivityAt: number;
}

/**
 * Duel state visible to a specific player
 */
export interface DuelClientState {
  duelId: string;
  status: DuelStatus;
  type: DuelType;
  wagerAmount: number;

  player: DuelPlayerState;         // Full state of self
  opponent: OpponentVisibleState;  // Limited state of opponent

  round: DuelRoundState;
  roundResults: RoundResult[];

  totalRounds: number;
  isMyTurn: boolean;

  availableActions: string[];      // What actions player can take
}

// =============================================================================
// SOCKET EVENTS - CLIENT TO SERVER
// =============================================================================

/**
 * Events the client sends to the server
 */
export interface DuelClientEvents {
  'duel:join_room': { duelId: string };
  'duel:leave_room': { duelId: string };
  'duel:ready': { duelId: string };
  'duel:hold_cards': { duelId: string; cardIndices: number[] };
  'duel:draw': { duelId: string };
  'duel:bet': { duelId: string; action: BettingAction; amount?: number };
  'duel:use_ability': { duelId: string; ability: string; targetIndex?: number };
  'duel:forfeit': { duelId: string };
  'duel:request_rematch': { duelId: string };
  'duel:emote': { duelId: string; emote: string };
}

/**
 * Event payloads for client events
 */
export interface JoinRoomPayload {
  duelId: string;
}

export interface ReadyPayload {
  duelId: string;
}

export interface HoldCardsPayload {
  duelId: string;
  cardIndices: number[];
}

export interface DrawPayload {
  duelId: string;
}

export interface BetPayload {
  duelId: string;
  action: BettingAction;
  amount?: number;
}

export interface UseAbilityPayload {
  duelId: string;
  ability: string;
  targetIndex?: number;
}

export interface EmotePayload {
  duelId: string;
  emote: string;
}

// =============================================================================
// SOCKET EVENTS - SERVER TO CLIENT
// =============================================================================

/**
 * Events the server sends to clients
 */
export interface DuelServerEvents {
  'duel:state_update': DuelClientState;
  'duel:challenge_received': ChallengeNotification;
  'duel:opponent_joined': { name: string };
  'duel:opponent_left': { name: string };
  'duel:opponent_reconnected': { name: string };
  'duel:game_start': DuelClientState;
  'duel:cards_dealt': DealtCardsEvent;
  'duel:opponent_action': OpponentActionEvent;
  'duel:reveal_phase': RevealPhaseEvent;
  'duel:round_result': RoundResult;
  'duel:game_complete': GameCompleteEvent;
  'duel:turn_start': TurnStartEvent;
  'duel:time_warning': { secondsRemaining: number };
  'duel:perception_result': PerceptionCheckResult;
  'duel:ability_result': AbilityResultEvent;
  'duel:cheat_detected': CheatDetectedEvent;
  'duel:emote': { playerId: string; emote: string };
  'duel:error': { message: string; code: string };
}

/**
 * Challenge notification for targeted player
 */
export interface ChallengeNotification {
  duelId: string;
  challenger: DuelPlayer;
  type: DuelType;
  wagerAmount: number;
  expiresAt: number;
}

/**
 * Event when cards are dealt
 */
export interface DealtCardsEvent {
  cards: Card[];
  roundNumber: number;
}

/**
 * Event when opponent takes an action (limited info)
 */
export interface OpponentActionEvent {
  actionType: string;
  timestamp: number;
}

/**
 * Event for reveal phase
 */
export interface RevealPhaseEvent {
  playerHand: Card[];
  opponentHand: Card[];
  playerHandRank: HandRank;
  playerHandName: string;
  opponentHandRank: HandRank;
  opponentHandName: string;
}

/**
 * Event when game completes
 */
export interface GameCompleteEvent {
  winnerId: string;
  winnerName: string;
  finalScore: { challenger: number; challenged: number };
  rewards: DuelRewards;
  ratingChange?: number;
  isForfeit: boolean;
}

/**
 * Event when turn starts
 */
export interface TurnStartEvent {
  playerId: string;
  phase: DuelPhase;
  timeLimit: number;
  availableActions: string[];
}

/**
 * Event when an ability is used
 */
export interface AbilityResultEvent {
  ability: string;
  success: boolean;
  message: string;
  effect?: {
    hints?: PerceptionHint[];
    revealedCards?: Card[];
    blockedRounds?: number;
  };
  energyCost: number;
  newCooldown: number;
}

/**
 * Event when cheating is detected
 */
export interface CheatDetectedEvent {
  accuserId: string;
  accuserCorrect: boolean;
  penalty?: {
    goldLost: number;
    reputationLost: number;
    jailTime?: number;
  };
  message: string;
}

// =============================================================================
// REWARDS
// =============================================================================

/**
 * Rewards from completing a duel
 */
export interface DuelRewards {
  gold: number;
  experience: number;
  wagerWon?: number;
  streakBonus?: number;
  items?: Array<{
    itemId: string;
    name: string;
    quantity: number;
  }>;
}

// =============================================================================
// ABILITY TYPES
// =============================================================================

/**
 * Active abilities that can be used during a duel
 */
export enum DuelAbility {
  // Perception abilities
  READ_OPPONENT = 'read_opponent',  // Contest vs Deception
  COLD_READ = 'cold_read',          // Reveal exact hand strength

  // Defense abilities
  POKER_FACE = 'poker_face',        // Block reads for 2 rounds
  FALSE_TELL = 'false_tell',        // Give wrong info

  // Card abilities
  PEEK = 'peek',                    // See next draw
  REROLL = 'reroll',                // Redraw specific card

  // Cheating abilities (risky!)
  MARK_CARDS = 'mark_cards',        // Track high cards
  PALM_CARD = 'palm_card'           // Swap a card (high risk)
}

/**
 * Ability use request
 */
export interface AbilityUseRequest {
  ability: DuelAbility;
  targetIndex?: number;             // For card-specific abilities
}

/**
 * Ability use result
 */
export interface AbilityUseResult {
  success: boolean;
  ability: DuelAbility;
  effect?: string;
  detected?: boolean;               // For cheating - were you caught?
  consequence?: string;             // Penalty if caught
}

// =============================================================================
// MATCHMAKING (for future ranked system)
// =============================================================================

/**
 * Matchmaking queue entry
 */
export interface QueueEntry {
  characterId: string;
  name: string;
  rating: number;
  queuedAt: number;
  preferences: {
    duelType: DuelType;
    maxWagerAmount?: number;
    ratingRange?: number;           // How far from own rating
  };
}

/**
 * Match proposal
 */
export interface MatchProposal {
  matchId: string;
  player1: DuelPlayer;
  player2: DuelPlayer;
  duelType: DuelType;
  wagerAmount: number;
  expiresAt: number;
}

// =============================================================================
// SPECTATOR (for future spectator mode)
// =============================================================================

/**
 * Spectator state
 */
export interface SpectatorState {
  duelId: string;
  spectatorCount: number;
  delaySeconds: number;             // Stream delay for competitive integrity
  canSeeHands: boolean;             // Whether spectator can see cards
}
