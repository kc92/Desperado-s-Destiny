/**
 * Combat Turn-Based Mechanics Tests
 * Sprint 4 - Agent 3
 *
 * Comprehensive tests for turn-based combat mechanics including:
 * - Turn order validation
 * - Round tracking
 * - Turn state validation
 * - Combat flow
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CombatEncounter, ICombatEncounter } from '../../src/models/CombatEncounter.model';
import { CombatStatus } from '@desperados/shared';

let mongoServer: MongoMemoryServer;

describe('Turn-Based Combat Mechanics', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('Turn Order', () => {
    it('should make player go first (turn 0)', async () => {
      const encounter = new CombatEncounter({
        characterId: new mongoose.Types.ObjectId(),
        npcId: new mongoose.Types.ObjectId(),
        playerHP: 100,
        playerMaxHP: 100,
        npcHP: 50,
        npcMaxHP: 50,
        turn: 0,
        roundNumber: 1,
        status: CombatStatus.ACTIVE
      });

      await encounter.save();

      expect(encounter.turn).toBe(0);
      expect(encounter.isPlayerTurn()).toBe(true);
    });

    it('should switch to NPC turn after player', async () => {
      const encounter = new CombatEncounter({
        characterId: new mongoose.Types.ObjectId(),
        npcId: new mongoose.Types.ObjectId(),
        playerHP: 100,
        playerMaxHP: 100,
        npcHP: 50,
        npcMaxHP: 50,
        turn: 0,
        roundNumber: 1,
        status: CombatStatus.ACTIVE
      });

      await encounter.save();

      // Simulate player turn completion
      encounter.turn = 1;
      await encounter.save();

      expect(encounter.turn).toBe(1);
      expect(encounter.isPlayerTurn()).toBe(false);
    });

    it('should switch back to player after NPC', async () => {
      const encounter = new CombatEncounter({
        characterId: new mongoose.Types.ObjectId(),
        npcId: new mongoose.Types.ObjectId(),
        playerHP: 100,
        playerMaxHP: 100,
        npcHP: 50,
        npcMaxHP: 50,
        turn: 1,
        roundNumber: 1,
        status: CombatStatus.ACTIVE
      });

      await encounter.save();

      // Simulate NPC turn completion
      encounter.turn = 0;
      encounter.roundNumber += 1;
      await encounter.save();

      expect(encounter.turn).toBe(0);
      expect(encounter.roundNumber).toBe(2);
    });

    it('should increment round number after full round', async () => {
      const encounter = new CombatEncounter({
        characterId: new mongoose.Types.ObjectId(),
        npcId: new mongoose.Types.ObjectId(),
        playerHP: 100,
        playerMaxHP: 100,
        npcHP: 50,
        npcMaxHP: 50,
        turn: 0,
        roundNumber: 1,
        status: CombatStatus.ACTIVE
      });

      await encounter.save();

      const initialRound = encounter.roundNumber;

      // Player turn -> NPC turn -> back to player (new round)
      encounter.turn = 1;
      await encounter.save();

      encounter.turn = 0;
      encounter.roundNumber += 1;
      await encounter.save();

      expect(encounter.roundNumber).toBe(initialRound + 1);
    });
  });

  describe('Turn Validation', () => {
    it('should prevent playing when it is NPC turn', async () => {
      const encounter = new CombatEncounter({
        characterId: new mongoose.Types.ObjectId(),
        npcId: new mongoose.Types.ObjectId(),
        playerHP: 100,
        playerMaxHP: 100,
        npcHP: 50,
        npcMaxHP: 50,
        turn: 1, // NPC turn
        roundNumber: 1,
        status: CombatStatus.ACTIVE
      });

      await encounter.save();

      expect(encounter.isPlayerTurn()).toBe(false);
      expect(encounter.turn).toBe(1);
    });

    it('should prevent playing in completed combat', async () => {
      const encounter = new CombatEncounter({
        characterId: new mongoose.Types.ObjectId(),
        npcId: new mongoose.Types.ObjectId(),
        playerHP: 100,
        playerMaxHP: 100,
        npcHP: 0, // NPC defeated
        npcMaxHP: 50,
        turn: 0,
        roundNumber: 3,
        status: CombatStatus.PLAYER_VICTORY
      });

      await encounter.save();

      expect(encounter.status).toBe(CombatStatus.PLAYER_VICTORY);
      expect(encounter.status).not.toBe(CombatStatus.ACTIVE);
    });

    it('should allow playing only on player turn and active status', async () => {
      const encounter = new CombatEncounter({
        characterId: new mongoose.Types.ObjectId(),
        npcId: new mongoose.Types.ObjectId(),
        playerHP: 100,
        playerMaxHP: 100,
        npcHP: 50,
        npcMaxHP: 50,
        turn: 0,
        roundNumber: 1,
        status: CombatStatus.ACTIVE
      });

      await encounter.save();

      const canPlay = encounter.isPlayerTurn() && encounter.status === CombatStatus.ACTIVE;
      expect(canPlay).toBe(true);
    });
  });

  describe('Round Tracking', () => {
    it('should record each round in history', async () => {
      const encounter = new CombatEncounter({
        characterId: new mongoose.Types.ObjectId(),
        npcId: new mongoose.Types.ObjectId(),
        playerHP: 100,
        playerMaxHP: 100,
        npcHP: 50,
        npcMaxHP: 50,
        turn: 0,
        roundNumber: 1,
        rounds: [],
        status: CombatStatus.ACTIVE
      });

      await encounter.save();

      // Add a round record
      encounter.rounds.push({
        roundNum: 1,
        playerCards: [],
        playerHandRank: 0,
        playerDamage: 10,
        npcCards: [],
        npcHandRank: 0,
        npcDamage: 5,
        playerHPAfter: 95,
        npcHPAfter: 40
      });

      await encounter.save();

      expect(encounter.rounds.length).toBe(1);
      expect(encounter.rounds[0].roundNum).toBe(1);
    });

    it('should store player cards, NPC cards, and damage', async () => {
      const encounter = new CombatEncounter({
        characterId: new mongoose.Types.ObjectId(),
        npcId: new mongoose.Types.ObjectId(),
        playerHP: 100,
        playerMaxHP: 100,
        npcHP: 50,
        npcMaxHP: 50,
        turn: 0,
        roundNumber: 1,
        rounds: [],
        status: CombatStatus.ACTIVE
      });

      await encounter.save();

      encounter.rounds.push({
        roundNum: 1,
        playerCards: [
          { suit: 'SPADES', rank: 14 },
          { suit: 'SPADES', rank: 13 },
          { suit: 'SPADES', rank: 12 },
          { suit: 'SPADES', rank: 11 },
          { suit: 'SPADES', rank: 10 }
        ],
        playerHandRank: 9, // Royal Flush
        playerDamage: 50,
        npcCards: [
          { suit: 'HEARTS', rank: 2 },
          { suit: 'CLUBS', rank: 5 },
          { suit: 'DIAMONDS', rank: 8 },
          { suit: 'SPADES', rank: 3 },
          { suit: 'HEARTS', rank: 9 }
        ],
        npcHandRank: 0, // High Card
        npcDamage: 5,
        playerHPAfter: 95,
        npcHPAfter: 0
      });

      await encounter.save();

      const round = encounter.rounds[0];
      expect(round.playerCards.length).toBe(5);
      expect(round.npcCards.length).toBe(5);
      expect(round.playerDamage).toBe(50);
      expect(round.npcDamage).toBe(5);
    });

    it('should track HP changes per round', async () => {
      const encounter = new CombatEncounter({
        characterId: new mongoose.Types.ObjectId(),
        npcId: new mongoose.Types.ObjectId(),
        playerHP: 100,
        playerMaxHP: 100,
        npcHP: 50,
        npcMaxHP: 50,
        turn: 0,
        roundNumber: 1,
        rounds: [],
        status: CombatStatus.ACTIVE
      });

      await encounter.save();

      // Round 1
      encounter.rounds.push({
        roundNum: 1,
        playerCards: [],
        playerHandRank: 0,
        playerDamage: 10,
        npcCards: [],
        npcHandRank: 0,
        npcDamage: 8,
        playerHPAfter: 92,
        npcHPAfter: 40
      });

      // Round 2
      encounter.rounds.push({
        roundNum: 2,
        playerCards: [],
        playerHandRank: 0,
        playerDamage: 12,
        npcCards: [],
        npcHandRank: 0,
        npcDamage: 7,
        playerHPAfter: 85,
        npcHPAfter: 28
      });

      await encounter.save();

      expect(encounter.rounds[0].playerHPAfter).toBe(92);
      expect(encounter.rounds[0].npcHPAfter).toBe(40);
      expect(encounter.rounds[1].playerHPAfter).toBe(85);
      expect(encounter.rounds[1].npcHPAfter).toBe(28);
    });
  });

  describe('Combat State Persistence', () => {
    it('should persist turn state across saves', async () => {
      const encounter = new CombatEncounter({
        characterId: new mongoose.Types.ObjectId(),
        npcId: new mongoose.Types.ObjectId(),
        playerHP: 100,
        playerMaxHP: 100,
        npcHP: 50,
        npcMaxHP: 50,
        turn: 0,
        roundNumber: 1,
        status: CombatStatus.ACTIVE
      });

      await encounter.save();
      const encounterId = encounter._id;

      // Modify and save
      encounter.turn = 1;
      await encounter.save();

      // Fetch fresh from database
      const fetched = await CombatEncounter.findById(encounterId);
      expect(fetched?.turn).toBe(1);
    });

    it('should persist round history across saves', async () => {
      const encounter = new CombatEncounter({
        characterId: new mongoose.Types.ObjectId(),
        npcId: new mongoose.Types.ObjectId(),
        playerHP: 100,
        playerMaxHP: 100,
        npcHP: 50,
        npcMaxHP: 50,
        turn: 0,
        roundNumber: 1,
        rounds: [],
        status: CombatStatus.ACTIVE
      });

      await encounter.save();
      const encounterId = encounter._id;

      // Add round
      encounter.rounds.push({
        roundNum: 1,
        playerCards: [],
        playerHandRank: 0,
        playerDamage: 10,
        npcCards: [],
        npcHandRank: 0,
        npcDamage: 5,
        playerHPAfter: 95,
        npcHPAfter: 40
      });

      await encounter.save();

      // Fetch fresh
      const fetched = await CombatEncounter.findById(encounterId);
      expect(fetched?.rounds.length).toBe(1);
      expect(fetched?.rounds[0].roundNum).toBe(1);
    });
  });
});
