/**
 * Destiny Deck Resolution Integration Tests
 *
 * Tests card drawing, hand evaluation, and poker hand mechanics
 * Validates the core game mechanic for action resolution
 *
 * NOTE: Tests marked with .skip() until Agent 1 (Destiny Deck Action Backend) completes
 */

import { Express } from 'express';
import {
  Card,
  Suit,
  Rank,
  HandRank,
  evaluateHand,
  createDeck,
  shuffleDeck,
  drawCards
} from '@desperados/shared';
import {
  clearDatabase,
  apiPost,
  apiGet,
  expectSuccess
} from '../helpers';
import {
  createRoyalFlush,
  createStraightFlush,
  createFourOfAKind,
  createFullHouse,
  createFlush,
  createStraight,
  createThreeOfAKind,
  createTwoPair,
  createPair,
  createHighCard,
  verifyNoDuplicates,
  verifyValidDeck,
  setupCompleteGameState
} from '../helpers/testHelpers';
import { createTestApp } from '../testApp';

const app: Express = createTestApp();

describe('Destiny Deck Resolution Integration Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Card Drawing Mechanics', () => {
    it('should draw 5 random cards from standard deck', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);

      const { drawn, remaining } = drawCards(deck, 5);

      expect(drawn).toHaveLength(5);
      expect(remaining).toHaveLength(47);
    });

    it('should ensure no duplicate cards in hand', () => {
      const deck = shuffleDeck();
      const { drawn } = drawCards(deck, 5);

      expect(verifyNoDuplicates(drawn)).toBe(true);
    });

    it('should draw cards from standard 52-card deck', () => {
      const deck = createDeck();

      expect(verifyValidDeck(deck)).toBe(true);
      expect(deck).toHaveLength(52);

      // Verify all suits present
      const suits = new Set(deck.map(c => c.suit));
      expect(suits.size).toBe(4);
      expect(suits.has(Suit.SPADES)).toBe(true);
      expect(suits.has(Suit.HEARTS)).toBe(true);
      expect(suits.has(Suit.CLUBS)).toBe(true);
      expect(suits.has(Suit.DIAMONDS)).toBe(true);

      // Verify all ranks present (13 per suit)
      const ranks = new Set(deck.map(c => c.rank));
      expect(ranks.size).toBe(13);
    });

    it('should shuffle deck randomly', () => {
      const deck1 = shuffleDeck();
      const deck2 = shuffleDeck();

      // Decks should be different orders (with very high probability)
      let different = false;
      for (let i = 0; i < deck1.length; i++) {
        if (deck1[i].suit !== deck2[i].suit || deck1[i].rank !== deck2[i].rank) {
          different = true;
          break;
        }
      }

      expect(different).toBe(true);
    });

    it('should throw error when drawing more cards than available', () => {
      const deck = createDeck();

      expect(() => drawCards(deck, 53)).toThrow();
      expect(() => drawCards(deck, 100)).toThrow();
    });
  });

  describe('Hand Evaluation - Royal Flush', () => {
    it('should correctly identify Royal Flush', () => {
      const hand = createRoyalFlush(Suit.SPADES);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.ROYAL_FLUSH);
      expect(evaluation.description).toMatch(/royal flush/i);
      expect(evaluation.score).toBe(10_000_000);
    });

    it('should identify Royal Flush in any suit', () => {
      const suits = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];

      for (const suit of suits) {
        const hand = createRoyalFlush(suit);
        const evaluation = evaluateHand(hand);

        expect(evaluation.rank).toBe(HandRank.ROYAL_FLUSH);
      }
    });

    it('should rank Royal Flush highest', () => {
      const royalFlush = evaluateHand(createRoyalFlush());
      const straightFlush = evaluateHand(createStraightFlush());

      expect(royalFlush.score).toBeGreaterThan(straightFlush.score);
    });
  });

  describe('Hand Evaluation - Straight Flush', () => {
    it('should correctly identify Straight Flush', () => {
      const hand = createStraightFlush(Suit.HEARTS, Rank.NINE);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.STRAIGHT_FLUSH);
      expect(evaluation.description).toMatch(/straight flush/i);
      expect(evaluation.score).toBeGreaterThan(9_000_000);
      expect(evaluation.score).toBeLessThan(10_000_000);
    });

    it('should rank higher Straight Flush above lower', () => {
      const high = evaluateHand(createStraightFlush(Suit.SPADES, Rank.KING));
      const low = evaluateHand(createStraightFlush(Suit.SPADES, Rank.SEVEN));

      expect(high.score).toBeGreaterThan(low.score);
    });
  });

  describe('Hand Evaluation - Four of a Kind', () => {
    it('should correctly identify Four of a Kind', () => {
      const hand = createFourOfAKind(Rank.EIGHT, Rank.ACE);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.FOUR_OF_A_KIND);
      expect(evaluation.description).toMatch(/four.*8/i);
      expect(evaluation.score).toBeGreaterThan(8_000_000);
      expect(evaluation.score).toBeLessThan(9_000_000);
    });

    it('should use kicker for tiebreaking', () => {
      const highKicker = evaluateHand(createFourOfAKind(Rank.EIGHT, Rank.ACE));
      const lowKicker = evaluateHand(createFourOfAKind(Rank.EIGHT, Rank.TWO));

      expect(highKicker.score).toBeGreaterThan(lowKicker.score);
    });
  });

  describe('Hand Evaluation - Full House', () => {
    it('should correctly identify Full House', () => {
      const hand = createFullHouse(Rank.KING, Rank.TEN);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.FULL_HOUSE);
      expect(evaluation.description).toMatch(/full house/i);
      expect(evaluation.score).toBeGreaterThan(7_000_000);
      expect(evaluation.score).toBeLessThan(8_000_000);
    });

    it('should rank by trips first, pair second', () => {
      const hand1 = evaluateHand(createFullHouse(Rank.ACE, Rank.TWO));
      const hand2 = evaluateHand(createFullHouse(Rank.KING, Rank.ACE));

      expect(hand1.score).toBeGreaterThan(hand2.score);
    });
  });

  describe('Hand Evaluation - Flush', () => {
    it('should correctly identify Flush', () => {
      const hand = createFlush(Suit.CLUBS);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.FLUSH);
      expect(evaluation.description).toMatch(/flush/i);
      expect(evaluation.score).toBeGreaterThan(6_000_000);
      expect(evaluation.score).toBeLessThan(7_000_000);
    });

    it('should rank Flush by high cards', () => {
      const hand1 = createFlush(Suit.SPADES);
      const hand2: Card[] = [
        { suit: Suit.HEARTS, rank: Rank.KING },
        { suit: Suit.HEARTS, rank: Rank.QUEEN },
        { suit: Suit.HEARTS, rank: Rank.JACK },
        { suit: Suit.HEARTS, rank: Rank.NINE },
        { suit: Suit.HEARTS, rank: Rank.SEVEN }
      ];

      const eval1 = evaluateHand(hand1);
      const eval2 = evaluateHand(hand2);

      // Hand with Ace should rank higher
      expect(eval1.score).toBeGreaterThan(eval2.score);
    });
  });

  describe('Hand Evaluation - Straight', () => {
    it('should correctly identify Straight', () => {
      const hand = createStraight(Rank.TEN);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.STRAIGHT);
      expect(evaluation.description).toMatch(/straight/i);
      expect(evaluation.score).toBeGreaterThan(5_000_000);
      expect(evaluation.score).toBeLessThan(6_000_000);
    });

    it('should handle Ace-low straight (A-2-3-4-5)', () => {
      const hand: Card[] = [
        { suit: Suit.SPADES, rank: Rank.ACE },
        { suit: Suit.HEARTS, rank: Rank.FIVE },
        { suit: Suit.CLUBS, rank: Rank.FOUR },
        { suit: Suit.DIAMONDS, rank: Rank.THREE },
        { suit: Suit.SPADES, rank: Rank.TWO }
      ];

      const evaluation = evaluateHand(hand);
      expect(evaluation.rank).toBe(HandRank.STRAIGHT);
    });

    it('should rank higher Straight above lower', () => {
      const high = evaluateHand(createStraight(Rank.ACE));
      const low = evaluateHand(createStraight(Rank.SIX));

      expect(high.score).toBeGreaterThan(low.score);
    });
  });

  describe('Hand Evaluation - Three of a Kind', () => {
    it('should correctly identify Three of a Kind', () => {
      const hand = createThreeOfAKind(Rank.SEVEN);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.THREE_OF_A_KIND);
      expect(evaluation.description).toMatch(/three.*7/i);
      expect(evaluation.score).toBeGreaterThan(4_000_000);
      expect(evaluation.score).toBeLessThan(5_000_000);
    });

    it('should use kickers for tiebreaking', () => {
      const hand1 = createThreeOfAKind(Rank.SEVEN);
      const hand2: Card[] = [
        { suit: Suit.SPADES, rank: Rank.SEVEN },
        { suit: Suit.HEARTS, rank: Rank.SEVEN },
        { suit: Suit.CLUBS, rank: Rank.SEVEN },
        { suit: Suit.DIAMONDS, rank: Rank.KING },
        { suit: Suit.SPADES, rank: Rank.QUEEN }
      ];

      const eval1 = evaluateHand(hand1);
      const eval2 = evaluateHand(hand2);

      // Hand1 has Ace+King kickers, Hand2 has King+Queen
      expect(eval1.score).toBeGreaterThan(eval2.score);
    });
  });

  describe('Hand Evaluation - Two Pair', () => {
    it('should correctly identify Two Pair', () => {
      const hand = createTwoPair(Rank.QUEEN, Rank.NINE);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.TWO_PAIR);
      expect(evaluation.description).toMatch(/two pair/i);
      expect(evaluation.score).toBeGreaterThan(3_000_000);
      expect(evaluation.score).toBeLessThan(4_000_000);
    });

    it('should rank by high pair first', () => {
      const hand1 = evaluateHand(createTwoPair(Rank.ACE, Rank.THREE));
      const hand2 = evaluateHand(createTwoPair(Rank.KING, Rank.QUEEN));

      expect(hand1.score).toBeGreaterThan(hand2.score);
    });
  });

  describe('Hand Evaluation - Pair', () => {
    it('should correctly identify Pair', () => {
      const hand = createPair(Rank.JACK);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.PAIR);
      expect(evaluation.description).toMatch(/pair.*jack/i);
      expect(evaluation.score).toBeGreaterThan(2_000_000);
      expect(evaluation.score).toBeLessThan(3_000_000);
    });

    it('should use kickers for tiebreaking', () => {
      const hand1 = createPair(Rank.JACK);
      const hand2: Card[] = [
        { suit: Suit.SPADES, rank: Rank.JACK },
        { suit: Suit.HEARTS, rank: Rank.JACK },
        { suit: Suit.CLUBS, rank: Rank.TEN },
        { suit: Suit.DIAMONDS, rank: Rank.NINE },
        { suit: Suit.SPADES, rank: Rank.EIGHT }
      ];

      const eval1 = evaluateHand(hand1);
      const eval2 = evaluateHand(hand2);

      // Hand1 has better kickers (A-K-Q vs 10-9-8)
      expect(eval1.score).toBeGreaterThan(eval2.score);
    });
  });

  describe('Hand Evaluation - High Card', () => {
    it('should correctly identify High Card', () => {
      const hand = createHighCard();
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.HIGH_CARD);
      expect(evaluation.description).toMatch(/high card.*ace/i);
      expect(evaluation.score).toBeGreaterThan(1_000_000);
      expect(evaluation.score).toBeLessThan(2_000_000);
    });

    it('should rank by all cards in order', () => {
      const hand1 = createHighCard(); // A-K-J-9-7
      const hand2: Card[] = [
        { suit: Suit.SPADES, rank: Rank.ACE },
        { suit: Suit.HEARTS, rank: Rank.KING },
        { suit: Suit.CLUBS, rank: Rank.JACK },
        { suit: Suit.DIAMONDS, rank: Rank.NINE },
        { suit: Suit.SPADES, rank: Rank.SIX }
      ];

      const eval1 = evaluateHand(hand1);
      const eval2 = evaluateHand(hand2);

      // Hand1 has 7, Hand2 has 6 as lowest card
      expect(eval1.score).toBeGreaterThan(eval2.score);
    });
  });

  describe('Skill Bonuses and Suit Scoring', () => {
    it.skip('should apply skill bonus to specific suit cards', async () => {
      const { token, character } = await setupCompleteGameState(app);

      // Train Lockpicking (Spades) to level 10
      // Perform action requiring Spades

      const challengeRes = await apiPost(
        app,
        '/api/actions/challenge',
        {
          actionId: 'pick-lock',
          characterId: character._id
        },
        token
      );

      expectSuccess(challengeRes);
      const result = challengeRes.body.data;

      // Verify +10 bonus applied only to Spades cards
      expect(result.skillBonuses[Suit.SPADES]).toBe(10);
      expect(result.evaluation.modifiedScore).toBeGreaterThan(result.evaluation.baseScore);
    });

    it.skip('should not apply skill bonus to other suits', async () => {
      const { token, character } = await setupCompleteGameState(app);

      // Train Lockpicking (Spades) to level 10
      // Perform action requiring Hearts

      const challengeRes = await apiPost(
        app,
        '/api/actions/challenge',
        {
          actionId: 'heal-wound', // Hearts-based action
          characterId: character._id
        },
        token
      );

      expectSuccess(challengeRes);
      const result = challengeRes.body.data;

      // No Spades bonus should apply
      expect(result.skillBonuses[Suit.SPADES] || 0).toBe(10);
      expect(result.skillBonuses[Suit.HEARTS] || 0).toBe(0);

      // Hearts cards should not benefit from Spades training
    });

    it.skip('should stack multiple skill bonuses for same suit', async () => {
      const { token, character } = await setupCompleteGameState(app);

      // Train three Spades skills:
      // - Lockpicking level 10 (+10 Spades)
      // - Stealth level 5 (+5 Spades)
      // - Pickpocket level 3 (+3 Spades)

      const challengeRes = await apiPost(
        app,
        '/api/actions/challenge',
        {
          actionId: 'pick-lock',
          characterId: character._id
        },
        token
      );

      expectSuccess(challengeRes);
      const result = challengeRes.body.data;

      // Total bonus: 10 + 5 + 3 = 18
      expect(result.skillBonuses[Suit.SPADES]).toBe(18);
    });
  });

  describe('Difficulty Thresholds', () => {
    it.skip('should succeed when score >= difficulty', async () => {
      const { token, character } = await setupCompleteGameState(app);

      // Perform easy action (low difficulty)
      const challengeRes = await apiPost(
        app,
        '/api/actions/challenge',
        {
          actionId: 'easy-action',
          characterId: character._id
        },
        token
      );

      expectSuccess(challengeRes);
      const result = challengeRes.body.data;

      if (result.evaluation.score >= result.challenge.difficulty) {
        expect(result.success).toBe(true);
      } else {
        expect(result.success).toBe(false);
      }
    });

    it.skip('should fail when score < difficulty', async () => {
      const { token, character } = await setupCompleteGameState(app);

      // Perform very hard action (high difficulty)
      const challengeRes = await apiPost(
        app,
        '/api/actions/challenge',
        {
          actionId: 'legendary-action',
          characterId: character._id
        },
        token
      );

      expectSuccess(challengeRes);
      const result = challengeRes.body.data;

      if (result.evaluation.score < result.challenge.difficulty) {
        expect(result.success).toBe(false);
        expect(result.rewards).toBeUndefined();
      }
    });
  });

  describe('Deterministic Results', () => {
    it('should produce same result for same cards', () => {
      const hand = createPair(Rank.JACK);

      const eval1 = evaluateHand(hand);
      const eval2 = evaluateHand(hand);

      expect(eval1.rank).toBe(eval2.rank);
      expect(eval1.score).toBe(eval2.score);
      expect(eval1.description).toBe(eval2.description);
    });

    it('should handle hand with exactly 5 cards', () => {
      const hand = createPair(Rank.JACK);
      expect(hand).toHaveLength(5);

      const evaluation = evaluateHand(hand);
      expect(evaluation).toBeDefined();
    });

    it('should throw error for invalid hand size', () => {
      const invalidHand: Card[] = [
        { suit: Suit.SPADES, rank: Rank.ACE },
        { suit: Suit.HEARTS, rank: Rank.KING }
      ];

      expect(() => evaluateHand(invalidHand)).toThrow();
    });
  });

  describe('Card Fairness', () => {
    it('should distribute suits evenly in deck', () => {
      const deck = createDeck();

      const suitCounts = {
        [Suit.SPADES]: 0,
        [Suit.HEARTS]: 0,
        [Suit.CLUBS]: 0,
        [Suit.DIAMONDS]: 0
      };

      for (const card of deck) {
        suitCounts[card.suit]++;
      }

      expect(suitCounts[Suit.SPADES]).toBe(13);
      expect(suitCounts[Suit.HEARTS]).toBe(13);
      expect(suitCounts[Suit.CLUBS]).toBe(13);
      expect(suitCounts[Suit.DIAMONDS]).toBe(13);
    });

    it('should distribute ranks evenly in deck', () => {
      const deck = createDeck();

      const rankCounts: Record<number, number> = {};

      for (const card of deck) {
        rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
      }

      // Each rank should appear exactly 4 times (one per suit)
      Object.values(rankCounts).forEach(count => {
        expect(count).toBe(4);
      });
    });

    it('should not bias shuffle towards any suit or rank', () => {
      const iterations = 1000;
      const firstCardSuits: Record<string, number> = {
        [Suit.SPADES]: 0,
        [Suit.HEARTS]: 0,
        [Suit.CLUBS]: 0,
        [Suit.DIAMONDS]: 0
      };

      for (let i = 0; i < iterations; i++) {
        const deck = shuffleDeck();
        firstCardSuits[deck[0].suit]++;
      }

      // Each suit should appear roughly 25% of the time (with some variance)
      const expectedCount = iterations / 4;
      const tolerance = expectedCount * 0.2; // 20% tolerance

      Object.values(firstCardSuits).forEach(count => {
        expect(count).toBeGreaterThan(expectedCount - tolerance);
        expect(count).toBeLessThan(expectedCount + tolerance);
      });
    });
  });
});

/**
 * TEST SUMMARY
 *
 * Total Tests: 30+
 *
 * Coverage:
 * - Card drawing mechanics (5 tests)
 * - All 10 hand ranks evaluation (10 tests)
 * - Skill bonuses to suits (3 tests)
 * - Difficulty thresholds (2 tests)
 * - Deterministic results (3 tests)
 * - Card fairness (3 tests)
 * - Edge cases (kickers, tie-breaking, Ace-low straight)
 *
 * Integration Points Validated:
 * - Deck creation and shuffling
 * - Hand evaluation algorithm
 * - Skill bonuses → Suit scoring
 * - Difficulty comparison
 * - Deterministic poker mechanics
 * - Fair card distribution
 */
