/**
 * Reputation Service Tests
 */

import mongoose from 'mongoose';
import { ReputationService, Faction, Standing } from '../../src/services/reputation.service';
import { Character } from '../../src/models/Character.model';
import { ReputationHistory } from '../../src/models/ReputationHistory.model';
import { connectTestDB, closeTestDB, clearTestDB } from '../setup';

describe('ReputationService', () => {
  let testCharacterId: string;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Create test character
    const character = await Character.create({
      userId: new mongoose.Types.ObjectId(),
      name: 'TestOutlaw',
      faction: 'SETTLER_ALLIANCE',
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 1,
        hairStyle: 3,
        hairColor: 2
      },
      currentLocation: 'test_location',
      factionReputation: {
        settlerAlliance: 0,
        nahiCoalition: 0,
        frontera: 0
      }
    });

    testCharacterId = character._id.toString();
  });

  describe('getStanding', () => {
    it('should return correct standing for reputation values', () => {
      expect(ReputationService.getStanding(-100)).toBe('hostile');
      expect(ReputationService.getStanding(-75)).toBe('hostile');
      expect(ReputationService.getStanding(-50)).toBe('unfriendly');
      expect(ReputationService.getStanding(-25)).toBe('unfriendly');
      expect(ReputationService.getStanding(0)).toBe('neutral');
      expect(ReputationService.getStanding(15)).toBe('neutral');
      expect(ReputationService.getStanding(25)).toBe('friendly');
      expect(ReputationService.getStanding(50)).toBe('friendly');
      expect(ReputationService.getStanding(75)).toBe('honored');
      expect(ReputationService.getStanding(100)).toBe('honored');
    });
  });

  describe('getPriceModifier', () => {
    it('should return correct price modifiers', () => {
      expect(ReputationService.getPriceModifier('hostile')).toBe(1.3);
      expect(ReputationService.getPriceModifier('unfriendly')).toBe(1.15);
      expect(ReputationService.getPriceModifier('neutral')).toBe(1.0);
      expect(ReputationService.getPriceModifier('friendly')).toBe(0.9);
      expect(ReputationService.getPriceModifier('honored')).toBe(0.8);
    });
  });

  describe('modifyReputation', () => {
    it('should increase reputation', async () => {
      const result = await ReputationService.modifyReputation(
        testCharacterId,
        'settlerAlliance',
        10,
        'Test increase'
      );

      expect(result.newRep).toBe(10);
      expect(result.standing).toBe('neutral');
      expect(result.changed).toBe(true);

      // Check character was updated
      const character = await Character.findById(testCharacterId);
      expect(character?.factionReputation.settlerAlliance).toBe(10);

      // Check history was created
      const history = await ReputationHistory.findOne({ characterId: testCharacterId });
      expect(history).toBeTruthy();
      expect(history?.change).toBe(10);
      expect(history?.reason).toBe('Test increase');
    });

    it('should decrease reputation', async () => {
      const result = await ReputationService.modifyReputation(
        testCharacterId,
        'settlerAlliance',
        -30,
        'Test decrease'
      );

      expect(result.newRep).toBe(-30);
      expect(result.standing).toBe('unfriendly');
      expect(result.changed).toBe(true);

      const character = await Character.findById(testCharacterId);
      expect(character?.factionReputation.settlerAlliance).toBe(-30);
    });

    it('should cap reputation at -100', async () => {
      await ReputationService.modifyReputation(testCharacterId, 'settlerAlliance', -50, 'Test');
      const result = await ReputationService.modifyReputation(
        testCharacterId,
        'settlerAlliance',
        -100,
        'Test'
      );

      expect(result.newRep).toBe(-100);
    });

    it('should cap reputation at 100', async () => {
      await ReputationService.modifyReputation(testCharacterId, 'settlerAlliance', 50, 'Test');
      const result = await ReputationService.modifyReputation(
        testCharacterId,
        'settlerAlliance',
        100,
        'Test'
      );

      expect(result.newRep).toBe(100);
    });

    it('should detect standing changes', async () => {
      // Start at 0 (neutral)
      const result1 = await ReputationService.modifyReputation(
        testCharacterId,
        'settlerAlliance',
        30,
        'Boost to friendly'
      );

      expect(result1.standingChanged).toBe(true);
      expect(result1.previousStanding).toBe('neutral');
      expect(result1.standing).toBe('friendly');
    });

    it('should work with all factions', async () => {
      await ReputationService.modifyReputation(testCharacterId, 'settlerAlliance', 20, 'Test');
      await ReputationService.modifyReputation(testCharacterId, 'nahiCoalition', -10, 'Test');
      await ReputationService.modifyReputation(testCharacterId, 'frontera', 50, 'Test');

      const character = await Character.findById(testCharacterId);
      expect(character?.factionReputation.settlerAlliance).toBe(20);
      expect(character?.factionReputation.nahiCoalition).toBe(-10);
      expect(character?.factionReputation.frontera).toBe(50);
    });
  });

  describe('getAllStandings', () => {
    it('should return all faction standings', async () => {
      await ReputationService.modifyReputation(testCharacterId, 'settlerAlliance', 30, 'Test');
      await ReputationService.modifyReputation(testCharacterId, 'nahiCoalition', -20, 'Test');
      await ReputationService.modifyReputation(testCharacterId, 'frontera', 80, 'Test');

      const standings = await ReputationService.getAllStandings(testCharacterId);

      expect(standings.settlerAlliance.rep).toBe(30);
      expect(standings.settlerAlliance.standing).toBe('friendly');

      expect(standings.nahiCoalition.rep).toBe(-20);
      expect(standings.nahiCoalition.standing).toBe('unfriendly');

      expect(standings.frontera.rep).toBe(80);
      expect(standings.frontera.standing).toBe('honored');
    });
  });

  describe('meetsRequirement', () => {
    beforeEach(async () => {
      await ReputationService.modifyReputation(testCharacterId, 'settlerAlliance', 40, 'Test');
    });

    it('should return true when requirement is met', async () => {
      const meets = await ReputationService.meetsRequirement(
        testCharacterId,
        'settlerAlliance',
        'neutral'
      );
      expect(meets).toBe(true);
    });

    it('should return false when requirement is not met', async () => {
      const meets = await ReputationService.meetsRequirement(
        testCharacterId,
        'settlerAlliance',
        'honored'
      );
      expect(meets).toBe(false);
    });
  });

  describe('getReputationChange', () => {
    it('should return correct values for quest completion', () => {
      expect(ReputationService.getReputationChange('quest_complete', 'settlerAlliance', 'minor')).toBe(10);
      expect(ReputationService.getReputationChange('quest_complete', 'settlerAlliance', 'major')).toBe(20);
    });

    it('should return correct values for crimes', () => {
      expect(ReputationService.getReputationChange('crime', 'settlerAlliance', 'minor')).toBe(-5);
      expect(ReputationService.getReputationChange('crime', 'settlerAlliance', 'major')).toBe(-10);
    });

    it('should return correct values for betrayal', () => {
      expect(ReputationService.getReputationChange('betray_faction', 'settlerAlliance', 'minor')).toBe(-25);
      expect(ReputationService.getReputationChange('betray_faction', 'settlerAlliance', 'major')).toBe(-50);
    });
  });

  describe('getReputationHistory', () => {
    beforeEach(async () => {
      await ReputationService.modifyReputation(testCharacterId, 'settlerAlliance', 10, 'Quest 1');
      await ReputationService.modifyReputation(testCharacterId, 'settlerAlliance', 5, 'Quest 2');
      await ReputationService.modifyReputation(testCharacterId, 'nahiCoalition', 15, 'Quest 3');
      await ReputationService.modifyReputation(testCharacterId, 'frontera', -10, 'Crime');
    });

    it('should return all history', async () => {
      const history = await ReputationService.getReputationHistory(testCharacterId);
      expect(history).toHaveLength(4);
    });

    it('should filter by faction', async () => {
      const history = await ReputationService.getReputationHistory(
        testCharacterId,
        'settlerAlliance'
      );
      expect(history).toHaveLength(2);
      expect(history.every(h => h.faction === 'settlerAlliance')).toBe(true);
    });

    it('should respect limit', async () => {
      const history = await ReputationService.getReputationHistory(testCharacterId, undefined, 2);
      expect(history).toHaveLength(2);
    });

    it('should return most recent first', async () => {
      const history = await ReputationService.getReputationHistory(testCharacterId);
      // Most recent should be the crime (-10 to frontera)
      expect(history[0].faction).toBe('frontera');
      expect(history[0].change).toBe(-10);
    });
  });

  describe('applyRivalPenalties', () => {
    it('should penalize Frontera when helping Settler Alliance', async () => {
      await ReputationService.modifyReputation(testCharacterId, 'settlerAlliance', 30, 'Help');
      await ReputationService.applyRivalPenalties(testCharacterId, 'settlerAlliance', 30, 'Help');

      const standings = await ReputationService.getAllStandings(testCharacterId);
      expect(standings.frontera.rep).toBe(-9); // 30% of 30 = 9
    });

    it('should penalize Settler Alliance when helping Frontera', async () => {
      await ReputationService.modifyReputation(testCharacterId, 'frontera', 20, 'Smuggle');
      await ReputationService.applyRivalPenalties(testCharacterId, 'frontera', 20, 'Smuggle');

      const standings = await ReputationService.getAllStandings(testCharacterId);
      expect(standings.settlerAlliance.rep).toBe(-6); // 30% of 20 = 6
    });

    it('should not penalize when helping Nahi Coalition', async () => {
      await ReputationService.modifyReputation(testCharacterId, 'nahiCoalition', 40, 'Quest');
      await ReputationService.applyRivalPenalties(testCharacterId, 'nahiCoalition', 40, 'Quest');

      const standings = await ReputationService.getAllStandings(testCharacterId);
      expect(standings.settlerAlliance.rep).toBe(0);
      expect(standings.frontera.rep).toBe(0);
    });

    it('should not apply penalties for negative changes', async () => {
      await ReputationService.applyRivalPenalties(testCharacterId, 'settlerAlliance', -20, 'Crime');

      const standings = await ReputationService.getAllStandings(testCharacterId);
      expect(standings.frontera.rep).toBe(0);
    });
  });

  describe('getFactionBenefits', () => {
    it('should return different benefits per standing', () => {
      const hostileBenefits = ReputationService.getFactionBenefits('settlerAlliance', 'hostile');
      const honoredBenefits = ReputationService.getFactionBenefits('settlerAlliance', 'honored');

      expect(hostileBenefits).toContain('30% price increase');
      expect(honoredBenefits).toContain('20% price discount');
      expect(honoredBenefits.length).toBeGreaterThan(hostileBenefits.length);
    });

    it('should return faction-specific benefits at high standings', () => {
      const settlerBenefits = ReputationService.getFactionBenefits('settlerAlliance', 'honored');
      const nahiBenefits = ReputationService.getFactionBenefits('nahiCoalition', 'honored');
      const fronteraBenefits = ReputationService.getFactionBenefits('frontera', 'honored');

      expect(settlerBenefits).toContain('Railroad fast travel');
      expect(nahiBenefits).toContain('Spirit guide assistance');
      expect(fronteraBenefits).toContain('Black market access');
    });
  });
});
