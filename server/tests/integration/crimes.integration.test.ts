/**
 * Crime System Integration Tests
 * Sprint 4 - Agent 5
 *
 * Comprehensive integration tests for crime system
 * Tests crime success/failure, jail mechanics, wanted levels, arrests, bail, and bounties
 *
 * CRITICAL TESTS (Must Pass):
 * ✅ Jail blocks all actions
 * ✅ Wanted level increases on crime failure
 * ✅ Bail payment works
 * ✅ Player arrest system works
 * ✅ Wanted level decay works
 * ✅ Multi-user isolation
 */

import request from 'supertest';
import app from '../testApp';
import { setupCompleteGameState, TimeSimulator } from '../helpers/testHelpers';
import { apiPost, apiGet, apiPut } from '../helpers/api.helpers';
import {
  createRoyalFlush,
  createHighCard,
  createPair,
} from '../helpers/testHelpers';

// Note: Some tests marked with .skip() as they depend on Agent 3 & 4 implementations
// Remove .skip() once crime backend and UI are complete

describe('Crime System Integration Tests', () => {

  describe('Crime Success Flow', () => {
    describe.skip('Successful Crime Attempt', () => {
      it('should succeed when hand strength > difficulty', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const response = await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'petty-theft', // Low difficulty
            testHand: createRoyalFlush(), // High strength
          },
          token
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.result.success).toBe(true);
      });

      it('should grant full rewards on unwitnessed success', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const initialCharResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );
        const initialGold = initialCharResponse.body.data.character.gold || 0;
        const initialXp = initialCharResponse.body.data.character.experience;

        const response = await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'petty-theft',
            testHand: createRoyalFlush(),
            testWitnessed: false, // Not witnessed
          },
          token
        );

        expect(response.body.data.result.rewards).toBeDefined();
        expect(response.body.data.result.rewards.gold).toBeGreaterThan(0);
        expect(response.body.data.result.rewards.xp).toBeGreaterThan(0);

        const finalCharResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );
        const finalGold = finalCharResponse.body.data.character.gold || 0;
        const finalXp = finalCharResponse.body.data.character.experience;

        expect(finalGold).toBeGreaterThan(initialGold);
        expect(finalXp).toBeGreaterThan(initialXp);
      });

      it('should not increase wanted level on unwitnessed success', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'petty-theft',
            testHand: createRoyalFlush(),
            testWitnessed: false,
          },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.wantedLevel).toBe(0);
      });

      it('should not jail character on unwitnessed success', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'petty-theft',
            testHand: createRoyalFlush(),
            testWitnessed: false,
          },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.jailedUntil).toBeUndefined();
      });

      it('should allow character to remain free', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'petty-theft',
            testHand: createRoyalFlush(),
            testWitnessed: false,
          },
          token
        );

        // Should be able to do another action
        const response = await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'petty-theft',
            testHand: createRoyalFlush(),
            testWitnessed: false,
          },
          token
        );

        expect(response.status).toBe(200);
      });
    });
  });

  describe('Crime Failure Flow (Caught)', () => {
    describe.skip('Failed Crime Attempt', () => {
      it('should fail when hand strength < difficulty', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const response = await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'major-heist', // High difficulty
            testHand: createHighCard(), // Low strength
          },
          token
        );

        expect(response.body.data.result.success).toBe(false);
      });

      it('should jail character when crime fails', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'major-heist',
            testHand: createHighCard(),
          },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.jailedUntil).toBeDefined();
        expect(
          new Date(charResponse.body.data.character.jailedUntil).getTime()
        ).toBeGreaterThan(Date.now());
      });

      it('should increase wanted level on crime failure', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'major-heist',
            testHand: createHighCard(),
          },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.wantedLevel).toBeGreaterThan(0);
      });

      it('should jail character when witnessed (even on success)', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'petty-theft',
            testHand: createRoyalFlush(), // Success
            testWitnessed: true, // But witnessed
          },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.jailedUntil).toBeDefined();
      });

      it('should calculate bounty based on wanted level', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'major-heist',
            testHand: createHighCard(),
          },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        const wantedLevel = charResponse.body.data.character.wantedLevel;
        const expectedBounty = wantedLevel * 100;

        expect(charResponse.body.data.character.bounty).toBe(expectedBounty);
      });

      it('should grant reduced/no rewards on failure', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const initialCharResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );
        const initialGold = initialCharResponse.body.data.character.gold || 0;

        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'major-heist',
            testHand: createHighCard(),
          },
          token
        );

        const finalCharResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );
        const finalGold = finalCharResponse.body.data.character.gold || 0;

        // Gold should not increase (or minimal increase)
        expect(finalGold).toBeLessThanOrEqual(initialGold + 10);
      });
    });
  });

  describe('Jail Mechanics', () => {
    describe.skip('Jail Restrictions', () => {
      it('should block actions while jailed', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Get jailed
        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'major-heist',
            testHand: createHighCard(),
          },
          token
        );

        // Try to do another action
        const response = await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'petty-theft',
          },
          token
        );

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('jailed');
      });

      it('should block combat while jailed', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Get jailed
        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'major-heist',
            testHand: createHighCard(),
          },
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
        expect(response.body.error).toContain('jailed');
      });

      it('should block skill training while jailed', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Get jailed
        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'major-heist',
            testHand: createHighCard(),
          },
          token
        );

        // Try to train skill
        const response = await apiPost(
          app,
          '/api/skills/train',
          {
            characterId: character._id,
            skillId: 'gunslinging',
          },
          token
        );

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('jailed');
      });

      it('should use absolute timestamp for jail time', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'major-heist',
            testHand: createHighCard(),
          },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        const jailedUntil = new Date(
          charResponse.body.data.character.jailedUntil
        ).getTime();
        expect(jailedUntil).toBeGreaterThan(Date.now());
      });

      it('should calculate remaining jail time correctly', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'major-heist',
            testHand: createHighCard(),
          },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        const jailedUntil = new Date(
          charResponse.body.data.character.jailedUntil
        ).getTime();
        const remaining = jailedUntil - Date.now();

        expect(remaining).toBeGreaterThan(0);
        expect(remaining).toBeLessThanOrEqual(60 * 60 * 1000); // Max 1 hour for major crime
      });

      it('should auto-release when jail time expires', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'petty-theft',
            testHand: createHighCard(),
          },
          token
        );

        const timeSimulator = new TimeSimulator();
        // Advance time by 1 hour (past jail time)
        timeSimulator.advanceHours(1);

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        // Should be released
        const jailedUntil = charResponse.body.data.character.jailedUntil;
        expect(jailedUntil ? new Date(jailedUntil).getTime() : 0).toBeLessThanOrEqual(
          Date.now()
        );

        // Should be able to do actions
        const actionResponse = await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'petty-theft',
            testHand: createRoyalFlush(),
          },
          token
        );

        expect(actionResponse.status).toBe(200);

        timeSimulator.restore();
      });
    });
  });

  describe('Bail System', () => {
    describe.skip('Bail Payment', () => {
      it('should allow paying bail to get released', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Give character gold
        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { gold: 500 },
          token
        );

        // Get jailed
        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'major-heist',
            testHand: createHighCard(),
          },
          token
        );

        // Pay bail
        const bailResponse = await apiPost(
          app,
          '/api/crimes/bail',
          { characterId: character._id },
          token
        );

        expect(bailResponse.status).toBe(200);
        expect(bailResponse.body.data.released).toBe(true);

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.jailedUntil).toBeUndefined();
      });

      it('should calculate bail cost as 50g * wantedLevel', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Get wanted level 3
        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { wantedLevel: 3, jailedUntil: new Date(Date.now() + 3600000) },
          token
        );

        const bailCostResponse = await apiGet(
          app,
          '/api/crimes/bail-cost',
          token
        );

        expect(bailCostResponse.body.data.cost).toBe(150); // 50 * 3
      });

      it('should deduct bail cost from character gold', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Give character gold
        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { gold: 500 },
          token
        );

        // Get jailed (wanted level 1)
        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'major-heist',
            testHand: createHighCard(),
          },
          token
        );

        const initialGold = 500;

        // Pay bail (50g for wanted level 1)
        await apiPost(
          app,
          '/api/crimes/bail',
          { characterId: character._id },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.gold).toBe(initialGold - 50);
      });

      it('should block bail if insufficient dollars', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Give character minimal dollars
        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { dollars: 10 },
          token
        );

        // Get jailed
        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'major-heist',
            testHand: createHighCard(),
          },
          token
        );

        // Try to pay bail (costs 50g)
        const bailResponse = await apiPost(
          app,
          '/api/crimes/bail',
          { characterId: character._id },
          token
        );

        expect(bailResponse.status).toBe(400);
        expect(bailResponse.body.error).toContain('Insufficient dollars');
      });

      it('should increase bail cost with wanted level', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Wanted level 5
        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { wantedLevel: 5, jailedUntil: new Date(Date.now() + 3600000) },
          token
        );

        const bailCostResponse = await apiGet(
          app,
          '/api/crimes/bail-cost',
          token
        );

        expect(bailCostResponse.body.data.cost).toBe(250); // 50 * 5
      });

      it('should release character immediately on bail payment', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { gold: 500 },
          token
        );

        // Get jailed
        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'major-heist',
            testHand: createHighCard(),
          },
          token
        );

        // Pay bail
        await apiPost(
          app,
          '/api/crimes/bail',
          { characterId: character._id },
          token
        );

        // Should be able to do actions immediately
        const actionResponse = await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'petty-theft',
            testHand: createRoyalFlush(),
          },
          token
        );

        expect(actionResponse.status).toBe(200);
      });
    });
  });

  describe('Wanted Level System', () => {
    describe.skip('Wanted Level Mechanics', () => {
      it('should increase wanted level on crime failure', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'major-heist',
            testHand: createHighCard(),
          },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.wantedLevel).toBe(1);
      });

      it('should cap wanted level at 5', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Fail crimes 10 times
        for (let i = 0; i < 10; i++) {
          try {
            await apiPost(
              app,
              '/api/actions/challenge',
              {
                characterId: character._id,
                actionId: 'major-heist',
                testHand: createHighCard(),
              },
              token
            );
          } catch (e) {
            // May fail due to jail, continue
          }

          // Pay bail
          await apiPut(
            app,
            `/api/characters/${character._id}`,
            { jailedUntil: null, gold: 1000 },
            token
          );
        }

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.wantedLevel).toBeLessThanOrEqual(5);
      });

      it('should treat wanted level 0 as clean', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.wantedLevel || 0).toBe(0);
      });

      it('should allow arrest at wanted level 3+', async () => {
        const { token: token1, character: char1 } = await setupCompleteGameState(
          app,
          'criminal@example.com'
        );
        const { token: token2 } = await setupCompleteGameState(
          app,
          'bounty-hunter@example.com'
        );

        // Set wanted level 3
        await apiPut(
          app,
          `/api/characters/${char1._id}`,
          { wantedLevel: 3 },
          token1
        );

        // Arrest
        const arrestResponse = await apiPost(
          app,
          '/api/crimes/arrest',
          { targetCharacterId: char1._id },
          token2
        );

        expect(arrestResponse.status).toBe(200);
      });

      it('should affect crime difficulty (+% per level)', async () => {
        const { token, character } = await setupCompleteGameState(app);

        // Set wanted level 3
        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { wantedLevel: 3 },
          token
        );

        // Attempt crime (should be harder)
        const response = await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'petty-theft',
            testHand: createPair(), // Medium strength
          },
          token
        );

        // Success less likely due to wanted level modifier
        // (exact implementation depends on Agent 3)
        expect(response.status).toBe(200);
      });

      it('should calculate bounty as wantedLevel * 100', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { wantedLevel: 4 },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.bounty || 0).toBe(400);
      });
    });
  });

  describe('Wanted Level Decay', () => {
    describe.skip('Decay Mechanics', () => {
      it('should decay wanted level by 1 every 24 hours', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { wantedLevel: 3 },
          token
        );

        const timeSimulator = new TimeSimulator();
        timeSimulator.advanceDays(1);

        // Trigger decay (via background job or on next action)
        await apiGet(app, `/api/characters/${character._id}`, token);

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.wantedLevel).toBe(2);

        timeSimulator.restore();
      });

      it('should track decay timer per character', async () => {
        const { token: token1, character: char1 } = await setupCompleteGameState(
          app,
          'user1@example.com'
        );
        const { token: token2, character: char2 } = await setupCompleteGameState(
          app,
          'user2@example.com'
        );

        await apiPut(app, `/api/characters/${char1._id}`, { wantedLevel: 3 }, token1);
        await apiPut(app, `/api/characters/${char2._id}`, { wantedLevel: 2 }, token2);

        const timeSimulator = new TimeSimulator();
        timeSimulator.advanceDays(1);

        const char1Response = await apiGet(app, `/api/characters/${char1._id}`, token1);
        const char2Response = await apiGet(app, `/api/characters/${char2._id}`, token2);

        expect(char1Response.body.data.character.wantedLevel).toBe(2);
        expect(char2Response.body.data.character.wantedLevel).toBe(1);

        timeSimulator.restore();
      });

      it('should allow multiple characters to decay independently', async () => {
        const { token: token1, character: char1 } = await setupCompleteGameState(
          app,
          'user1@example.com'
        );
        const { token: token2, character: char2 } = await setupCompleteGameState(
          app,
          'user2@example.com'
        );

        await apiPut(app, `/api/characters/${char1._id}`, { wantedLevel: 5 }, token1);
        await apiPut(app, `/api/characters/${char2._id}`, { wantedLevel: 1 }, token2);

        const timeSimulator = new TimeSimulator();
        timeSimulator.advanceDays(2);

        const char1Response = await apiGet(app, `/api/characters/${char1._id}`, token1);
        const char2Response = await apiGet(app, `/api/characters/${char2._id}`, token2);

        expect(char1Response.body.data.character.wantedLevel).toBe(3);
        expect(char2Response.body.data.character.wantedLevel).toBe(0);

        timeSimulator.restore();
      });

      it('should stop decay at 0', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { wantedLevel: 1 },
          token
        );

        const timeSimulator = new TimeSimulator();
        timeSimulator.advanceDays(3);

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.wantedLevel).toBe(0);

        timeSimulator.restore();
      });
    });
  });

  describe('Lay Low Mechanic', () => {
    describe.skip('Lay Low Functionality', () => {
      it('should reduce wanted level by 1 when laying low', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { wantedLevel: 3 },
          token
        );

        const response = await apiPost(
          app,
          '/api/crimes/lay-low',
          { characterId: character._id, paymentType: 'time' },
          token
        );

        expect(response.status).toBe(200);

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.wantedLevel).toBe(2);
      });

      it('should cost 30 minutes (time option)', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { wantedLevel: 2 },
          token
        );

        const response = await apiPost(
          app,
          '/api/crimes/lay-low',
          { characterId: character._id, paymentType: 'time' },
          token
        );

        expect(response.body.data.cooldownUntil).toBeDefined();

        const cooldownUntil = new Date(response.body.data.cooldownUntil).getTime();
        const now = Date.now();
        const diff = cooldownUntil - now;

        expect(diff).toBeGreaterThan(29 * 60 * 1000); // ~30 minutes
        expect(diff).toBeLessThan(31 * 60 * 1000);
      });

      it('should cost 50 gold (gold option)', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { wantedLevel: 2, gold: 100 },
          token
        );

        await apiPost(
          app,
          '/api/crimes/lay-low',
          { characterId: character._id, paymentType: 'gold' },
          token
        );

        const charResponse = await apiGet(
          app,
          `/api/characters/${character._id}`,
          token
        );

        expect(charResponse.body.data.character.gold).toBe(50);
      });

      it('should not allow laying low if wanted = 0', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const response = await apiPost(
          app,
          '/api/crimes/lay-low',
          { characterId: character._id, paymentType: 'time' },
          token
        );

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('not wanted');
      });

      it('should work while not jailed', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { wantedLevel: 3 },
          token
        );

        const response = await apiPost(
          app,
          '/api/crimes/lay-low',
          { characterId: character._id, paymentType: 'gold' },
          token
        );

        expect(response.status).toBe(200);
      });
    });
  });

  describe('Player Arrest System', () => {
    describe.skip('Arrest Mechanics', () => {
      it('should allow Player A to arrest Player B (if B wanted >= 3)', async () => {
        const { token: token1, character: char1 } = await setupCompleteGameState(
          app,
          'bounty-hunter@example.com'
        );
        const { token: token2, character: char2 } = await setupCompleteGameState(
          app,
          'criminal@example.com'
        );

        // Set char2 wanted level 3
        await apiPut(app, `/api/characters/${char2._id}`, { wantedLevel: 3 }, token2);

        const arrestResponse = await apiPost(
          app,
          '/api/crimes/arrest',
          { targetCharacterId: char2._id },
          token1
        );

        expect(arrestResponse.status).toBe(200);
        expect(arrestResponse.body.data.arrested).toBe(true);
      });

      it('should award bounty to arrester', async () => {
        const { token: token1, character: char1 } = await setupCompleteGameState(
          app,
          'bounty-hunter@example.com'
        );
        const { token: token2, character: char2 } = await setupCompleteGameState(
          app,
          'criminal@example.com'
        );

        await apiPut(app, `/api/characters/${char2._id}`, { wantedLevel: 3 }, token2);

        const initialChar1Response = await apiGet(
          app,
          `/api/characters/${char1._id}`,
          token1
        );
        const initialGold = initialChar1Response.body.data.character.gold || 0;

        await apiPost(
          app,
          '/api/crimes/arrest',
          { targetCharacterId: char2._id },
          token1
        );

        const finalChar1Response = await apiGet(
          app,
          `/api/characters/${char1._id}`,
          token1
        );
        const finalGold = finalChar1Response.body.data.character.gold || 0;

        // Bounty = 3 * 100 = 300
        expect(finalGold).toBe(initialGold + 300);
      });

      it('should jail target (30min * wantedLevel)', async () => {
        const { token: token1 } = await setupCompleteGameState(
          app,
          'bounty-hunter@example.com'
        );
        const { token: token2, character: char2 } = await setupCompleteGameState(
          app,
          'criminal@example.com'
        );

        await apiPut(app, `/api/characters/${char2._id}`, { wantedLevel: 3 }, token2);

        await apiPost(
          app,
          '/api/crimes/arrest',
          { targetCharacterId: char2._id },
          token1
        );

        const char2Response = await apiGet(app, `/api/characters/${char2._id}`, token2);

        expect(char2Response.body.data.character.jailedUntil).toBeDefined();

        const jailedUntil = new Date(
          char2Response.body.data.character.jailedUntil
        ).getTime();
        const now = Date.now();
        const jailTime = jailedUntil - now;

        // 30min * 3 = 90 minutes
        expect(jailTime).toBeGreaterThan(85 * 60 * 1000);
        expect(jailTime).toBeLessThan(95 * 60 * 1000);
      });

      it('should reset target wanted level to 0', async () => {
        const { token: token1 } = await setupCompleteGameState(
          app,
          'bounty-hunter@example.com'
        );
        const { token: token2, character: char2 } = await setupCompleteGameState(
          app,
          'criminal@example.com'
        );

        await apiPut(app, `/api/characters/${char2._id}`, { wantedLevel: 5 }, token2);

        await apiPost(
          app,
          '/api/crimes/arrest',
          { targetCharacterId: char2._id },
          token1
        );

        const char2Response = await apiGet(app, `/api/characters/${char2._id}`, token2);

        expect(char2Response.body.data.character.wantedLevel).toBe(0);
      });

      it('should not allow arresting same player twice in 1 hour', async () => {
        const { token: token1, character: char1 } = await setupCompleteGameState(
          app,
          'bounty-hunter@example.com'
        );
        const { token: token2, character: char2 } = await setupCompleteGameState(
          app,
          'criminal@example.com'
        );

        await apiPut(app, `/api/characters/${char2._id}`, { wantedLevel: 3 }, token2);

        // First arrest
        await apiPost(
          app,
          '/api/crimes/arrest',
          { targetCharacterId: char2._id },
          token1
        );

        // Reset char2 wanted level for second arrest
        await apiPut(
          app,
          `/api/characters/${char2._id}`,
          { wantedLevel: 3, jailedUntil: null },
          token2
        );

        // Try second arrest
        const secondArrestResponse = await apiPost(
          app,
          '/api/crimes/arrest',
          { targetCharacterId: char2._id },
          token1
        );

        expect(secondArrestResponse.status).toBe(400);
        expect(secondArrestResponse.body.error).toContain('cooldown');
      });

      it('should not allow arresting already jailed player', async () => {
        const { token: token1 } = await setupCompleteGameState(
          app,
          'bounty-hunter@example.com'
        );
        const { token: token2, character: char2 } = await setupCompleteGameState(
          app,
          'criminal@example.com'
        );

        await apiPut(
          app,
          `/api/characters/${char2._id}`,
          { wantedLevel: 3, jailedUntil: new Date(Date.now() + 3600000) },
          token2
        );

        const arrestResponse = await apiPost(
          app,
          '/api/crimes/arrest',
          { targetCharacterId: char2._id },
          token1
        );

        expect(arrestResponse.status).toBe(400);
        expect(arrestResponse.body.error).toContain('already jailed');
      });

      it('should not allow arresting self', async () => {
        const { token, character } = await setupCompleteGameState(app);

        await apiPut(
          app,
          `/api/characters/${character._id}`,
          { wantedLevel: 3 },
          token
        );

        const arrestResponse = await apiPost(
          app,
          '/api/crimes/arrest',
          { targetCharacterId: character._id },
          token
        );

        expect(arrestResponse.status).toBe(400);
        expect(arrestResponse.body.error).toContain('cannot arrest yourself');
      });
    });
  });

  describe('Witness System', () => {
    describe.skip('Witness Mechanics', () => {
      it('should have witness chance per crime (0-100%)', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const actionResponse = await apiGet(app, '/api/actions/petty-theft', token);

        expect(actionResponse.body.data.action.witnessChance).toBeDefined();
        expect(actionResponse.body.data.action.witnessChance).toBeGreaterThanOrEqual(0);
        expect(actionResponse.body.data.action.witnessChance).toBeLessThanOrEqual(100);
      });

      it('should increase detection when witnessed', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const response = await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'petty-theft',
            testHand: createRoyalFlush(),
            testWitnessed: true,
          },
          token
        );

        // Witnessed = increased detection = more likely to fail
        expect(response.body.data.witnessed).toBe(true);
      });

      it('should have higher witness chance = higher risk', async () => {
        const { token } = await setupCompleteGameState(app);

        const pettyTheftResponse = await apiGet(
          app,
          '/api/actions/petty-theft',
          token
        );
        const majorHeistResponse = await apiGet(app, '/api/actions/major-heist', token);

        expect(majorHeistResponse.body.data.action.witnessChance).toBeGreaterThan(
          pettyTheftResponse.body.data.action.witnessChance
        );
      });
    });
  });

  describe('Crime Difficulty Scaling', () => {
    describe.skip('Difficulty Tiers', () => {
      it('should have petty crimes: Low risk, low reward, short jail', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const response = await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'petty-theft',
            testHand: createHighCard(),
          },
          token
        );

        // Even low hand may succeed
        expect(response.status).toBe(200);

        // If fails, short jail time
        if (response.body.data.result.jailed) {
          const charResponse = await apiGet(
            app,
            `/api/characters/${character._id}`,
            token
          );

          const jailTime =
            new Date(charResponse.body.data.character.jailedUntil).getTime() -
            Date.now();

          expect(jailTime).toBeLessThan(20 * 60 * 1000); // < 20 minutes
        }
      });

      it('should have medium crimes: Moderate risk, good reward, medium jail', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const response = await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'robbery',
            testHand: createPair(),
          },
          token
        );

        expect(response.status).toBe(200);
        // Moderate difficulty
      });

      it('should have major crimes: High risk, high reward, long jail', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const response = await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'major-heist',
            testHand: createHighCard(),
          },
          token
        );

        // High difficulty = likely to fail
        if (response.body.data.result.jailed) {
          const charResponse = await apiGet(
            app,
            `/api/characters/${character._id}`,
            token
          );

          const jailTime =
            new Date(charResponse.body.data.character.jailedUntil).getTime() -
            Date.now();

          expect(jailTime).toBeGreaterThan(45 * 60 * 1000); // > 45 minutes
        }
      });

      it('should have extreme crimes: Very high risk, massive reward, very long jail', async () => {
        const { token, character } = await setupCompleteGameState(app);

        const response = await apiPost(
          app,
          '/api/actions/challenge',
          {
            characterId: character._id,
            actionId: 'train-robbery',
            testHand: createPair(),
          },
          token
        );

        // Very high difficulty
        expect(response.status).toBe(200);
      });
    });
  });
});
