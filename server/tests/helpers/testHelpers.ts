/**
 * Comprehensive Test Helpers for Sprint 3 Integration Tests
 *
 * Helper functions for testing game loop, Destiny Deck, skills, energy, and actions
 */

import mongoose from 'mongoose';
import { Card, Suit, Rank, HandRank } from '@desperados/shared';
import { Express } from 'express';
import { apiPost, apiGet } from './api.helpers';

/**
 * Creates a valid MongoDB ObjectId for testing
 * Use this instead of hardcoded strings like "test-character-id"
 */
export const createTestId = (): string => new mongoose.Types.ObjectId().toString();

/**
 * Time simulation helpers
 */
export class TimeSimulator {
  private originalDateNow: () => number;
  private mockTime: number | null = null;

  constructor() {
    this.originalDateNow = Date.now;
  }

  /**
   * Advances time by specified milliseconds
   */
  advanceTime(ms: number): void {
    if (this.mockTime === null) {
      this.mockTime = Date.now();
    }
    this.mockTime += ms;
    global.Date.now = () => this.mockTime!;
  }

  /**
   * Sets absolute time
   */
  setTime(timestamp: number): void {
    this.mockTime = timestamp;
    global.Date.now = () => this.mockTime!;
  }

  /**
   * Restores real time
   */
  restore(): void {
    global.Date.now = this.originalDateNow;
    this.mockTime = null;
  }

  /**
   * Advances time by hours
   */
  advanceHours(hours: number): void {
    this.advanceTime(hours * 60 * 60 * 1000);
  }

  /**
   * Advances time by minutes
   */
  advanceMinutes(minutes: number): void {
    this.advanceTime(minutes * 60 * 1000);
  }

  /**
   * Advances time by days
   */
  advanceDays(days: number): void {
    this.advanceTime(days * 24 * 60 * 60 * 1000);
  }
}

/**
 * Creates a predictable deck for testing
 * Allows creating specific hands for deterministic testing
 */
export function createTestDeck(specificCards?: Card[]): Card[] {
  const deck: Card[] = [];
  const suits = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
  const ranks = [
    Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN,
    Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
  ];

  if (specificCards) {
    // Add specific cards first (will be drawn first)
    deck.push(...specificCards);
  }

  // Add remaining cards
  for (const suit of suits) {
    for (const rank of ranks) {
      const card = { suit, rank };
      // Skip if already in specific cards
      if (!specificCards || !specificCards.some(c => c.suit === suit && c.rank === rank)) {
        deck.push(card);
      }
    }
  }

  return deck;
}

/**
 * Creates a Royal Flush hand (for testing)
 */
export function createRoyalFlush(suit: Suit = Suit.SPADES): Card[] {
  return [
    { suit, rank: Rank.ACE },
    { suit, rank: Rank.KING },
    { suit, rank: Rank.QUEEN },
    { suit, rank: Rank.JACK },
    { suit, rank: Rank.TEN }
  ];
}

/**
 * Creates a Straight Flush hand (for testing)
 */
export function createStraightFlush(suit: Suit = Suit.HEARTS, highCard: Rank = Rank.NINE): Card[] {
  return [
    { suit, rank: highCard },
    { suit, rank: (highCard - 1) as Rank },
    { suit, rank: (highCard - 2) as Rank },
    { suit, rank: (highCard - 3) as Rank },
    { suit, rank: (highCard - 4) as Rank }
  ];
}

/**
 * Creates a Four of a Kind hand (for testing)
 */
export function createFourOfAKind(rank: Rank = Rank.EIGHT, kicker: Rank = Rank.ACE): Card[] {
  return [
    { suit: Suit.SPADES, rank },
    { suit: Suit.HEARTS, rank },
    { suit: Suit.CLUBS, rank },
    { suit: Suit.DIAMONDS, rank },
    { suit: Suit.SPADES, rank: kicker }
  ];
}

/**
 * Creates a Full House hand (for testing)
 */
export function createFullHouse(tripRank: Rank = Rank.KING, pairRank: Rank = Rank.TEN): Card[] {
  return [
    { suit: Suit.SPADES, rank: tripRank },
    { suit: Suit.HEARTS, rank: tripRank },
    { suit: Suit.CLUBS, rank: tripRank },
    { suit: Suit.DIAMONDS, rank: pairRank },
    { suit: Suit.SPADES, rank: pairRank }
  ];
}

/**
 * Creates a Flush hand (for testing)
 */
export function createFlush(suit: Suit = Suit.CLUBS): Card[] {
  return [
    { suit, rank: Rank.ACE },
    { suit, rank: Rank.JACK },
    { suit, rank: Rank.NINE },
    { suit, rank: Rank.SEVEN },
    { suit, rank: Rank.FOUR }
  ];
}

/**
 * Creates a Straight hand (for testing)
 */
export function createStraight(highCard: Rank = Rank.TEN): Card[] {
  return [
    { suit: Suit.SPADES, rank: highCard },
    { suit: Suit.HEARTS, rank: (highCard - 1) as Rank },
    { suit: Suit.CLUBS, rank: (highCard - 2) as Rank },
    { suit: Suit.DIAMONDS, rank: (highCard - 3) as Rank },
    { suit: Suit.SPADES, rank: (highCard - 4) as Rank }
  ];
}

/**
 * Creates a Three of a Kind hand (for testing)
 */
export function createThreeOfAKind(rank: Rank = Rank.SEVEN): Card[] {
  return [
    { suit: Suit.SPADES, rank },
    { suit: Suit.HEARTS, rank },
    { suit: Suit.CLUBS, rank },
    { suit: Suit.DIAMONDS, rank: Rank.ACE },
    { suit: Suit.SPADES, rank: Rank.KING }
  ];
}

/**
 * Creates a Two Pair hand (for testing)
 */
export function createTwoPair(highPair: Rank = Rank.QUEEN, lowPair: Rank = Rank.NINE): Card[] {
  return [
    { suit: Suit.SPADES, rank: highPair },
    { suit: Suit.HEARTS, rank: highPair },
    { suit: Suit.CLUBS, rank: lowPair },
    { suit: Suit.DIAMONDS, rank: lowPair },
    { suit: Suit.SPADES, rank: Rank.ACE }
  ];
}

/**
 * Creates a Pair hand (for testing)
 */
export function createPair(rank: Rank = Rank.JACK): Card[] {
  return [
    { suit: Suit.SPADES, rank },
    { suit: Suit.HEARTS, rank },
    { suit: Suit.CLUBS, rank: Rank.ACE },
    { suit: Suit.DIAMONDS, rank: Rank.KING },
    { suit: Suit.SPADES, rank: Rank.QUEEN }
  ];
}

/**
 * Creates a High Card hand (for testing)
 */
export function createHighCard(): Card[] {
  return [
    { suit: Suit.SPADES, rank: Rank.ACE },
    { suit: Suit.HEARTS, rank: Rank.KING },
    { suit: Suit.CLUBS, rank: Rank.JACK },
    { suit: Suit.DIAMONDS, rank: Rank.NINE },
    { suit: Suit.SPADES, rank: Rank.SEVEN }
  ];
}

/**
 * Creates test action data
 */
export interface TestActionOptions {
  id?: string;
  name?: string;
  description?: string;
  energyCost?: number;
  requiredSuit?: Suit;
  difficulty?: number;
  minimumHandRank?: HandRank;
  xpReward?: number;
  goldReward?: number;
}

export function createTestAction(options: TestActionOptions = {}) {
  return {
    id: options.id || 'test-action-1',
    name: options.name || 'Test Action',
    description: options.description || 'A test action for integration testing',
    energyCost: options.energyCost ?? 10,
    requiredSuit: options.requiredSuit,
    difficulty: options.difficulty ?? 5,
    minimumHandRank: options.minimumHandRank ?? HandRank.HIGH_CARD,
    xpReward: options.xpReward ?? 50,
    goldReward: options.goldReward ?? 10
  };
}

/**
 * Creates test skill data
 */
export interface TestSkillOptions {
  id?: string;
  name?: string;
  description?: string;
  associatedSuit?: Suit;
  baseTrainingTime?: number;
  maxLevel?: number;
}

export function createTestSkill(options: TestSkillOptions = {}) {
  return {
    id: options.id || 'test-skill-1',
    name: options.name || 'Test Skill',
    description: options.description || 'A test skill for integration testing',
    associatedSuit: options.associatedSuit || Suit.SPADES,
    baseTrainingTime: options.baseTrainingTime ?? 3600000, // 1 hour in ms
    maxLevel: options.maxLevel ?? 10
  };
}

/**
 * Assertion helper for action results
 */
export function assertActionSuccess(result: any): void {
  expect(result).toBeDefined();
  expect(result.success).toBe(true);
  expect(result.hand).toBeDefined();
  expect(result.hand).toHaveLength(5);
  expect(result.evaluation).toBeDefined();
  expect(result.evaluation.rank).toBeDefined();
  expect(result.evaluation.score).toBeGreaterThan(0);
}

/**
 * Assertion helper for action failure
 */
export function assertActionFailure(result: any): void {
  expect(result).toBeDefined();
  expect(result.success).toBe(false);
  expect(result.hand).toBeDefined();
  expect(result.hand).toHaveLength(5);
  expect(result.evaluation).toBeDefined();
}

/**
 * Assertion helper for energy deduction
 */
export function assertEnergyDeducted(
  initialEnergy: number,
  currentEnergy: number,
  expectedCost: number
): void {
  expect(currentEnergy).toBe(initialEnergy - expectedCost);
}

/**
 * Assertion helper for skill level up
 */
export function assertSkillLevelUp(
  initialLevel: number,
  currentLevel: number,
  expectedGain: number = 1
): void {
  expect(currentLevel).toBe(initialLevel + expectedGain);
}

/**
 * Complete game loop test helper
 * Registers, creates character, and returns auth token + character
 *
 * IMPORTANT: Returns actual Mongoose document for character (not plain JSON)
 * so that tests can call Mongoose instance methods like .save() and .reload()
 */
export async function setupCompleteGameState(
  app: any,
  email: string = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`,
  password: string = 'Password123!'
) {
  // Register
  const registerRes = await apiPost(app, '/api/auth/register', { email, password });
  if (registerRes.status !== 201) {
    console.error('Registration failed:', JSON.stringify(registerRes.body, null, 2));
  }
  expect(registerRes.status).toBe(201);

  // Verify email (required for login to succeed)
  // Fallback: directly mark user as verified in database
  const { User } = await import('../../src/models/User.model');
  await User.findOneAndUpdate({ email: email.toLowerCase() }, { emailVerified: true });

  // Login
  const loginRes = await apiPost(app, '/api/auth/login', { email, password });
  if (loginRes.status !== 200) {
    console.error('Login failed:', JSON.stringify(loginRes.body, null, 2));
  }
  expect(loginRes.status).toBe(200);
  const token = loginRes.body.data.token || extractTokenFromCookie(loginRes);

  // Create character
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 100);
  const characterData = {
    name: `Hero${timestamp}${random}`,
    faction: 'SETTLER_ALLIANCE',
    appearance: {
      bodyType: 'male',
      skinTone: 5,
      facePreset: 1,
      hairStyle: 3,
      hairColor: 2
    }
  };

  const characterRes = await apiPost(app, '/api/characters', characterData, token);
  if (characterRes.status !== 201) {
    console.error('Character creation failed:', JSON.stringify(characterRes.body, null, 2));
  }
  expect(characterRes.status).toBe(201);

  // CRITICAL: Fetch actual Mongoose document from database
  // This ensures tests can call instance methods like .save(), .reload()
  const { Character } = await import('../../src/models/Character.model');
  const characterId = characterRes.body.data.character._id;
  const character = await Character.findById(characterId);

  if (!character) {
    throw new Error(`Failed to fetch character from database: ${characterId}`);
  }

  return {
    user: loginRes.body.data.user,
    character,  // Now a proper Mongoose document
    token,
    email,
    password
  };
}

/**
 * Extract token from cookie (helper)
 */
function extractTokenFromCookie(response: any): string {
  const cookies = response.headers['set-cookie'];
  if (!cookies) return '';

  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
  for (const cookie of cookieArray) {
    const match = cookie.match(/token=([^;]+)/);
    if (match) return match[1];
  }

  return '';
}

/**
 * Wait for async operation (polling helper)
 */
export async function waitFor(
  conditionFn: () => Promise<boolean> | boolean,
  timeoutMs: number = 5000,
  intervalMs: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const result = await conditionFn();
    if (result) return;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(`waitFor timeout after ${timeoutMs}ms`);
}

/**
 * Calculate expected energy after regeneration
 */
export function calculateExpectedEnergy(
  currentEnergy: number,
  maxEnergy: number,
  timePassedMs: number,
  regenPerHour: number
): number {
  const hoursElapsed = timePassedMs / (60 * 60 * 1000);
  const energyGained = Math.floor(hoursElapsed * regenPerHour);
  return Math.min(currentEnergy + energyGained, maxEnergy);
}

/**
 * Generate random cards (for fuzzing tests)
 */
export function generateRandomCards(count: number): Card[] {
  const suits = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
  const ranks = [
    Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN,
    Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
  ];

  const cards: Card[] = [];
  for (let i = 0; i < count; i++) {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const rank = ranks[Math.floor(Math.random() * ranks.length)];
    cards.push({ suit, rank });
  }

  return cards;
}

/**
 * Verify no duplicate cards in hand
 */
export function verifyNoDuplicates(cards: Card[]): boolean {
  const seen = new Set<string>();
  for (const card of cards) {
    const key = `${card.suit}-${card.rank}`;
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
}

/**
 * Verify cards are from standard 52-card deck
 */
export function verifyValidDeck(cards: Card[]): boolean {
  const validSuits = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
  const validRanks = [
    Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN,
    Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
  ];

  for (const card of cards) {
    if (!validSuits.includes(card.suit)) return false;
    if (!validRanks.includes(card.rank)) return false;
  }

  return true;
}

/**
 * Creates a test character with all required fields
 * Use this helper to avoid character validation errors in tests
 *
 * @param overrides - Optional fields to override defaults
 * @returns Mongoose Character document
 */
export async function createTestCharacter(overrides: Record<string, any> = {}) {
  const { Character } = await import('../../src/models/Character.model');
  const { seedMinimalLocations, TEST_LOCATION_IDS } = await import('./seedHelpers');

  // Seed locations to ensure valid currentLocation reference
  await seedMinimalLocations();

  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);

  return Character.create({
    userId: overrides.userId || new mongoose.Types.ObjectId(),
    name: overrides.name || `TestChar${timestamp}${random}`,
    faction: overrides.faction || 'SETTLER_ALLIANCE',
    currentLocation: overrides.currentLocation || TEST_LOCATION_IDS.RED_GULCH,
    locationId: overrides.locationId || TEST_LOCATION_IDS.RED_GULCH.toString(),
    appearance: overrides.appearance || {
      bodyType: 'male',
      skinTone: 5,
      facePreset: 1,
      hairStyle: 3,
      hairColor: 2
    },
    gold: overrides.gold ?? 1000,
    dollars: overrides.dollars ?? 1000,
    energy: overrides.energy ?? 100,
    maxEnergy: overrides.maxEnergy ?? 150,
    level: overrides.level ?? 1,
    totalLevel: overrides.totalLevel ?? 30,
    experience: overrides.experience ?? 0,
    experienceToNextLevel: overrides.experienceToNextLevel ?? 100,
    stats: overrides.stats || { cunning: 10, spirit: 10, combat: 10, craft: 10 },
    skills: overrides.skills || [],
    inventory: overrides.inventory || [],
    activeEffects: overrides.activeEffects || [],
    combatStats: overrides.combatStats || { wins: 0, losses: 0, totalDamage: 0, kills: 0 },
    isJailed: overrides.isJailed ?? false,
    jailedUntil: overrides.jailedUntil || null,
    wantedLevel: overrides.wantedLevel ?? 0,
    bountyAmount: overrides.bountyAmount ?? 0,
    lastActive: overrides.lastActive || new Date(),
    isActive: overrides.isActive ?? true,
    ...overrides
  });
}
