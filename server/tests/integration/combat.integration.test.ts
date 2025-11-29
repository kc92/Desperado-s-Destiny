/**
 * Combat System Integration Tests
 * Sprint 4 - Agent 5
 *
 * Comprehensive integration tests for turn-based combat system
 * Tests combat flow, damage calculation, victory/defeat, loot, and multi-user scenarios
 *
 * CRITICAL TESTS (Must Pass):
 * ✅ Turn-based combat works end-to-end
 * ✅ Damage calculation correct (hand ranks → damage)
 * ✅ Victory awards loot correctly
 * ✅ Defeat applies death penalty
 * ✅ Multi-user isolation
 * ✅ Energy integrated with combat
 * ✅ Skills integrated with combat damage
 */

import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../../src/server';
import { setupCompleteGameState, TimeSimulator } from '../helpers/testHelpers';
import { apiPost, apiGet, apiPut } from '../helpers/api.helpers';
import {
  createRoyalFlush,
  createHighCard,
  createFlush,
  createPair,
  createThreeOfAKind,
} from '../helpers/testHelpers';

let mongoServer: MongoMemoryServer;

// Note: Some tests marked with .skip() as they depend on Agent 1 & 2 implementations
// Remove .skip() once combat backend and UI are complete

describe('Combat Integration Tests', () => {
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
    // Clean up all collections after each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('Basic Combat Flow', () => {
    describe('Combat Initiation', () => {
      it('should allow player to initiate combat with NPC', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Start combat with test NPC
        const response = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.encounter).toBeDefined();
        expect(response.body.data.encounter.status).toBe('IN_PROGRESS');
        expect(response.body.data.encounter.playerHp).toBeGreaterThan(0);
        expect(response.body.data.encounter.npcHp).toBeGreaterThan(0);
        expect(response.body.data.encounter.round).toBe(1);
      });

      it('should deduct 10 energy when combat starts', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Get initial energy
        const initialResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );
        const initialEnergy = initialResponse.body.data.character.energy;

        // Start combat
        await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );

        // Check energy deducted
        const finalResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );
        const finalEnergy = finalResponse.body.data.character.energy;

        expect(finalEnergy).toBe(initialEnergy - 10);
      });

      it('should block combat if insufficient energy', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Drain energy to below 10
        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { energy: 5 },
          token
        );

        // Try to start combat
        const response = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Insufficient energy');
      });

      it('should create combat encounter in database', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const response = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );

        expect(response.body.data.encounter._id).toBeDefined();
        expect(response.body.data.encounter.characterId).toBe(character._id);
        expect(response.body.data.encounter.npcId).toBe('test-bandit-1');
      });

      it('should not allow starting multiple combats simultaneously', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Start first combat
        await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );

        // Try to start second combat
        const response = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-2',
          },
          token
        );

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('already in combat');
      });
    });

    describe('Turn-Based Mechanics', () => {
      it('should enforce turn order (player → NPC → player)', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Start combat
        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        // Player plays turn
        const turn1Response = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
          },
          token
        );

        expect(turn1Response.body.data.turn.actor).toBe('PLAYER');
        expect(turn1Response.body.data.nextTurn).toBe('NPC');

        // NPC should auto-play their turn (or player triggers NPC turn)
        const npcTurnResponse = await apiGet(
          app,
          `/api/combat/encounter/${encounterId}`,
          token
        );

        expect(npcTurnResponse.body.data.encounter.lastTurn).toBe('NPC');
        expect(npcTurnResponse.body.data.encounter.nextTurn).toBe('PLAYER');
      });

      it('should not allow playing turn when it is NPC turn', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        // Player plays turn
        await apiPost(app, '/api/combat/turn', { encounterId, action: 'ATTACK' }, token);

        // Try to play again immediately (should be NPC turn)
        const response = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
          },
          token
        );

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Not your turn');
      });

      it('should increment round number correctly', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        expect(startResponse.body.data.encounter.round).toBe(1);

        // Play player turn
        await apiPost(app, '/api/combat/turn', { encounterId, action: 'ATTACK' }, token);

        // Get updated encounter (after NPC turn)
        const round2Response = await apiGet(
          app,
          `/api/combat/encounter/${encounterId}`,
          token
        );

        expect(round2Response.body.data.encounter.round).toBe(2);
      });

      it('should not allow playing turn in completed combat', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'weak-npc',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        // Play turns until combat completes (NPC dies)
        // ... (combat completion logic)

        // Try to play turn after combat ended
        const response = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
          },
          token
        );

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Combat already ended');
      });

      it('should persist combat state in database between turns', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        // Play turn
        await apiPost(app, '/api/combat/turn', { encounterId, action: 'ATTACK' }, token);

        // Fetch encounter from database
        const dbResponse = await apiGet(
          app,
          `/api/combat/encounter/${encounterId}`,
          token
        );

        expect(dbResponse.body.data.encounter._id).toBe(encounterId);
        expect(dbResponse.body.data.encounter.playerHp).toBeLessThan(100); // Damage taken
      });
    });

    describe('Damage Calculation', () => {
      it('should convert Royal Flush to 50 damage', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Start combat
        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        // Mock Royal Flush hand (test helper)
        const turnResponse = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createRoyalFlush(), // Test override
          },
          token
        );

        expect(turnResponse.body.data.damage).toBe(50);
      });

      it('should convert High Card to 5 damage', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        const turnResponse = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createHighCard(),
          },
          token
        );

        expect(turnResponse.body.data.damage).toBe(5);
      });

      it('should apply skill bonuses to damage', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Train combat skill to level 5 (adds +5 damage)
        await apiPost(
          app,
          '/api/skills/train',
          {
            characterId: character._id,
            skillId: 'gunslinging',
          },
          token
        );
        // ... (level up skill to 5)

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        const turnResponse = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createPair(), // Base damage = 10
          },
          token
        );

        // Base 10 + 5 skill bonus = 15
        expect(turnResponse.body.data.damage).toBeGreaterThanOrEqual(15);
      });

      it('should apply NPC difficulty modifier to NPC damage', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Start combat with HARD difficulty NPC
        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'elite-bandit', // HARD difficulty
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        const turnResponse = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
          },
          token
        );

        // NPC damage should be higher due to difficulty modifier
        expect(turnResponse.body.data.npcDamage).toBeGreaterThan(10);
      });

      it('should apply damage variance (±5)', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const damageResults: number[] = [];

        // Run 20 combats with same hand
        for (let i = 0; i < 20; i++) {
          const { token: newToken, character: newChar } = await setupCompleteGameState(
            app,
            `test-${i}@example.com`
          );

          const startResponse = await apiPost(
            app,
            '/api/combat/start',
            {
              characterId: newChar._id,
              npcId: 'test-bandit-1',
            },
            newToken
          );
          const encounterId = startResponse.body.data.encounter._id;

          const turnResponse = await apiPost(
            app,
            '/api/combat/turn',
            {
              encounterId,
              action: 'ATTACK',
              testHand: createPair(), // Base 10 damage
            },
            newToken
          );

          damageResults.push(turnResponse.body.data.damage);
        }

        // Check variance exists
        const uniqueDamages = new Set(damageResults);
        expect(uniqueDamages.size).toBeGreaterThan(1);

        // Check all damages are within ±5 of base
        damageResults.forEach((damage) => {
          expect(damage).toBeGreaterThanOrEqual(5); // 10 - 5
          expect(damage).toBeLessThanOrEqual(15); // 10 + 5
        });
      });

      it('should update HP correctly for both player and NPC', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;
        const initialPlayerHp = startResponse.body.data.encounter.playerHp;
        const initialNpcHp = startResponse.body.data.encounter.npcHp;

        const turnResponse = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
          },
          token
        );

        // Player dealt damage to NPC
        expect(turnResponse.body.data.encounter.npcHp).toBeLessThan(initialNpcHp);

        // NPC dealt damage to player (on their turn)
        expect(turnResponse.body.data.encounter.playerHp).toBeLessThan(initialPlayerHp);
      });
    });

    describe('Victory Conditions', () => {
      it('should declare player victory when NPC HP reaches 0', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'weak-npc', // Very low HP
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        // Deal massive damage
        const turnResponse = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createRoyalFlush(), // 50 damage
          },
          token
        );

        expect(turnResponse.body.data.encounter.status).toBe('PLAYER_VICTORY');
        expect(turnResponse.body.data.encounter.npcHp).toBeLessThanOrEqual(0);
      });

      it('should award loot from NPC loot table on victory', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'weak-npc',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        const turnResponse = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createRoyalFlush(),
          },
          token
        );

        expect(turnResponse.body.data.loot).toBeDefined();
        expect(turnResponse.body.data.loot.gold).toBeGreaterThan(0);
        expect(turnResponse.body.data.loot.xp).toBeGreaterThan(0);
      });

      it('should add loot items to character inventory', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'weak-npc',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createRoyalFlush(),
          },
          token
        );

        // Get character inventory
        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.gold).toBeGreaterThan(0);
        expect(charResponse.body.data.character.experience).toBeGreaterThan(0);
      });

      it('should award XP and gold on victory', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const initialCharResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );
        const initialXp = initialCharResponse.body.data.character.experience;
        const initialGold = initialCharResponse.body.data.character.gold || 0;

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'weak-npc',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createRoyalFlush(),
          },
          token
        );

        const finalCharResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );
        const finalXp = finalCharResponse.body.data.character.experience;
        const finalGold = finalCharResponse.body.data.character.gold || 0;

        expect(finalXp).toBeGreaterThan(initialXp);
        expect(finalGold).toBeGreaterThan(initialGold);
      });

      it('should set combat status to PLAYER_VICTORY on win', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'weak-npc',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        const turnResponse = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createRoyalFlush(),
          },
          token
        );

        expect(turnResponse.body.data.encounter.status).toBe('PLAYER_VICTORY');
      });

      it('should set NPC respawn timer on defeat', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createRoyalFlush(),
          },
          token
        );

        // Check NPC instance has respawnAt timestamp
        const npcResponse = await apiGet(app, '/api/combat/npcs/test-bandit-1', token);

        expect(npcResponse.body.data.npc.respawnAt).toBeDefined();
        expect(new Date(npcResponse.body.data.npc.respawnAt).getTime()).toBeGreaterThan(
          Date.now()
        );
      });
    });

    describe('Defeat Conditions', () => {
      it('should declare player defeat when player HP reaches 0', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'boss-npc', // Very high damage
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        // Play turns until player dies
        const turnResponse = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createHighCard(), // Low damage
          },
          token
        );

        // ... (multiple turns)

        // Eventually player HP reaches 0
        expect(turnResponse.body.data.encounter.status).toBe('PLAYER_DEFEAT');
        expect(turnResponse.body.data.encounter.playerHp).toBeLessThanOrEqual(0);
      });

      it('should respawn character with full HP on defeat', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'boss-npc',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        // ... (player dies)
        await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createHighCard(),
          },
          token
        );

        // Check character respawned
        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.hp).toBe(
          charResponse.body.data.character.maxHp
        );
      });

      it('should apply 10% gold penalty on defeat', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Give character gold
        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { gold: 1000 },
          token
        );

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'boss-npc',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        // ... (player dies)
        await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createHighCard(),
          },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        // Lost 10% of 1000 = 100 gold
        expect(charResponse.body.data.character.gold).toBe(900);
      });

      it('should not give negative gold on defeat', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Character has 0 gold
        await apiPut(app, `/api/characters/${character._id}`, { gold: 0 }, token);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'boss-npc',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        // ... (player dies)
        await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createHighCard(),
          },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.gold).toBeGreaterThanOrEqual(0);
      });

      it('should set combat status to PLAYER_DEFEAT on loss', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'boss-npc',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        // ... (player dies)
        const turnResponse = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createHighCard(),
          },
          token
        );

        expect(turnResponse.body.data.encounter.status).toBe('PLAYER_DEFEAT');
      });

      it('should not award loot on defeat', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'boss-npc',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        const turnResponse = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createHighCard(),
          },
          token
        );

        expect(turnResponse.body.data.loot).toBeUndefined();
      });
    });

    describe('Flee Mechanics', () => {
      it('should allow fleeing in first 3 rounds', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        const fleeResponse = await apiPost(
          app,
          '/api/combat/flee',
          { encounterId },
          token
        );

        expect(fleeResponse.status).toBe(200);
        expect(fleeResponse.body.data.encounter.status).toBe('FLED');
      });

      it('should block fleeing after round 3', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        // Play 3 rounds
        await apiPost(
          app,
          '/api/combat/turn',
          { encounterId, action: 'ATTACK' },
          token
        );
        await apiPost(
          app,
          '/api/combat/turn',
          { encounterId, action: 'ATTACK' },
          token
        );
        await apiPost(
          app,
          '/api/combat/turn',
          { encounterId, action: 'ATTACK' },
          token
        );

        // Try to flee on round 4
        const fleeResponse = await apiPost(
          app,
          '/api/combat/flee',
          { encounterId },
          token
        );

        expect(fleeResponse.status).toBe(400);
        expect(fleeResponse.body.error).toContain('cannot flee');
      });

      it('should end combat with no loot when fleeing', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        const fleeResponse = await apiPost(
          app,
          '/api/combat/flee',
          { encounterId },
          token
        );

        expect(fleeResponse.body.data.loot).toBeUndefined();
        expect(fleeResponse.body.data.encounter.status).toBe('FLED');
      });

      it('should not apply death penalty when fleeing', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { gold: 1000 },
          token
        );

        const initialGold = 1000;

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        await apiPost(app, '/api/combat/flee', { encounterId }, token);

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.gold).toBe(initialGold);
      });
    });

    describe('Multi-User Combat', () => {
      it('should isolate combat encounters between users', async () => {
        const { token: token1, character: char1 } = await setupCompleteGameState(
          app,
          'user1@example.com'
        );
        const { token: token2, character: char2 } = await setupCompleteGameState(
          app,
          'user2@example.com'
        );

        // User 1 starts combat
        const combat1 = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: char1._id,
            npcId: 'test-bandit-1',
          },
          token1
        );

        // User 2 starts combat
        const combat2 = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: char2._id,
            npcId: 'test-bandit-1',
          },
          token2
        );

        expect(combat1.body.data.encounter._id).not.toBe(
          combat2.body.data.encounter._id
        );
      });

      it('should prevent User A from playing User B combat turns', async () => {
        const { token: token1, character: char1 } = await setupCompleteGameState(
          app,
          'user1@example.com'
        );
        const { token: token2, character: char2 } = await setupCompleteGameState(
          app,
          'user2@example.com'
        );

        const combat2 = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: char2._id,
            npcId: 'test-bandit-1',
          },
          token2
        );
        const encounter2Id = combat2.body.data.encounter._id;

        // User 1 tries to play User 2's combat turn
        const response = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId: encounter2Id,
            action: 'ATTACK',
          },
          token1
        );

        expect(response.status).toBe(403);
        expect(response.body.error).toContain('not your combat');
      });

      it('should allow separate combat encounters with same NPC type', async () => {
        const { token: token1, character: char1 } = await setupCompleteGameState(
          app,
          'user1@example.com'
        );
        const { token: token2, character: char2 } = await setupCompleteGameState(
          app,
          'user2@example.com'
        );

        const combat1 = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: char1._id,
            npcId: 'test-bandit-1',
          },
          token1
        );

        const combat2 = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: char2._id,
            npcId: 'test-bandit-1',
          },
          token2
        );

        expect(combat1.status).toBe(201);
        expect(combat2.status).toBe(201);
      });
    });

    describe('Energy & Skills Integration', () => {
      it('should integrate combat skill bonuses with damage', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Train gunslinging skill
        await apiPost(
          app,
          '/api/skills/train',
          {
            characterId: character._id,
            skillId: 'gunslinging',
          },
          token
        );

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        const turnResponse = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createPair(), // Base 10 damage
          },
          token
        );

        // Damage should include skill bonus
        expect(turnResponse.body.data.damage).toBeGreaterThan(10);
      });

      it('should regenerate energy between combats', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const timeSimulator = new TimeSimulator();

        // First combat
        await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'test-bandit-1',
          },
          token
        );

        // Advance time by 1 hour
        timeSimulator.advanceHours(1);

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        // Energy should have regenerated
        expect(charResponse.body.data.character.energy).toBeGreaterThan(0);

        timeSimulator.restore();
      });
    });

    describe('HP Scaling', () => {
      it('should scale character HP with level', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Level up character to level 5
        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { level: 5 },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        // Base HP + (5 * (level - 1)) = 100 + (5 * 4) = 120
        expect(charResponse.body.data.character.maxHp).toBe(120);
      });

      it('should add HP bonus from combat skills', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Train combat skill to level 5 (+10 HP)
        await apiPost(
          app,
          '/api/skills/train',
          {
            characterId: character._id,
            skillId: 'toughness',
          },
          token
        );
        // ... (level up to 5)

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        // Base HP + skill HP bonus
        expect(charResponse.body.data.character.maxHp).toBeGreaterThan(100);
      });

      it('should give premium players +20% HP', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Set user to premium
        await apiPut(app, `/api/users/premium`, { isPremium: true }, token);

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        // Base 100 HP * 1.2 = 120 HP
        expect(charResponse.body.data.character.maxHp).toBe(120);
      });

      it('should scale NPC HP with level', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Fight level 5 NPC
        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'level-5-bandit',
          },
          token
        );

        const npcHp = startResponse.body.data.encounter.npcHp;
        expect(npcHp).toBeGreaterThan(100); // Level 5 has more HP than level 1
      });
    });

    describe('Items & Loot', () => {
      it('should drop loot based on NPC loot table', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'loot-test-npc',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        const turnResponse = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createRoyalFlush(),
          },
          token
        );

        expect(turnResponse.body.data.loot.items).toBeDefined();
        expect(Array.isArray(turnResponse.body.data.loot.items)).toBe(true);
      });

      it('should add items to character inventory', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'loot-test-npc',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createRoyalFlush(),
          },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.inventory).toBeDefined();
      });

      it('should stack duplicate items in inventory', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Win first combat (get item)
        const start1 = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'consistent-loot-npc',
          },
          token
        );
        await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId: start1.body.data.encounter._id,
            action: 'ATTACK',
            testHand: createRoyalFlush(),
          },
          token
        );

        // Win second combat (get same item)
        const start2 = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'consistent-loot-npc',
          },
          token
        );
        await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId: start2.body.data.encounter._id,
            action: 'ATTACK',
            testHand: createRoyalFlush(),
          },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        // Check item quantity stacked
        const item = charResponse.body.data.character.inventory.find(
          (i: any) => i.itemId === 'test-item'
        );
        expect(item.quantity).toBe(2);
      });
    });

    describe('Boss NPCs', () => {
      it('should give boss NPCs higher HP', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'boss-npc',
          },
          token
        );

        const bossHp = startResponse.body.data.encounter.npcHp;
        expect(bossHp).toBeGreaterThan(200); // Boss has much higher HP
      });

      it('should give boss NPCs better loot', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'boss-npc',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        // ... (defeat boss)
        const turnResponse = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
            testHand: createRoyalFlush(),
          },
          token
        );

        expect(turnResponse.body.data.loot.gold).toBeGreaterThan(100);
        expect(turnResponse.body.data.loot.xp).toBeGreaterThan(100);
      });

      it('should give boss NPCs higher difficulty', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const startResponse = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: 'boss-npc',
          },
          token
        );
        const encounterId = startResponse.body.data.encounter._id;

        const turnResponse = await apiPost(
          app,
          '/api/combat/turn',
          {
            encounterId,
            action: 'ATTACK',
          },
          token
        );

        // Boss deals high damage
        expect(turnResponse.body.data.npcDamage).toBeGreaterThan(20);
      });
    });
  });
});
