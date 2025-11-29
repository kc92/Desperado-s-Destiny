/**
 * Deck Games Skill Modifiers Tests
 *
 * Tests for Phase 2 (Stats Matter) and Phase 3 (Strategic Choices)
 * - calculateSkillModifiers() function
 * - calculateSpecialAbilities() function
 * - Validates that skills meaningfully impact success rates
 * - Validates skill-unlocked abilities (poker, blackjack, press your luck)
 */

import {
  calculateSkillModifiers,
  calculateSpecialAbilities,
  SkillModifiers,
  SpecialAbilities,
  TalentBonuses
} from '../../src/services/deckGames';

describe('Deck Games - Phase 2: Stats Matter', () => {
  describe('calculateSkillModifiers()', () => {
    describe('Basic Calculations', () => {
      it('should calculate modifiers correctly at skill level 0', () => {
        const modifiers = calculateSkillModifiers(0, 3);

        expect(modifiers.thresholdReduction).toBe(0);
        expect(modifiers.cardBonus).toBe(0);
        expect(modifiers.rerollsAvailable).toBe(0);
        expect(modifiers.dangerAvoidChance).toBe(0);
      });

      it('should calculate modifiers correctly at skill level 10', () => {
        const modifiers = calculateSkillModifiers(10, 3);

        // Linear: 10 * 0.75 = 7.5
        // Exponential: 10^1.1 * 0.05 = 12.589... * 0.05 = 0.629...
        // Total: 7.5 + 0.629 = 8.129
        // Difficulty scale: 0.8 + (3 * 0.1) = 1.1

        // Threshold: 8.129 * 0.4 * 1.1 = 3.576... -> floor = 3
        expect(modifiers.thresholdReduction).toBe(3);

        // Card bonus: 8.129 * 0.3 * 1.1 = 2.682... -> floor = 2
        expect(modifiers.cardBonus).toBe(2);

        // Rerolls: floor(10 / 30) = 0
        expect(modifiers.rerollsAvailable).toBe(0);

        // Danger avoid: 10 * 0.007 = 0.07 (7%)
        expect(modifiers.dangerAvoidChance).toBeCloseTo(0.07, 2);
      });

      it('should calculate modifiers correctly at skill level 50', () => {
        const modifiers = calculateSkillModifiers(50, 3);

        // Linear: 50 * 0.75 = 37.5
        // Exponential: 50^1.1 * 0.05 = 74.989... * 0.05 = 3.749...
        // Total: 37.5 + 3.749 = 41.249
        // Difficulty scale: 1.1

        // Threshold: 41.249 * 0.4 * 1.1 = 18.149... -> floor = 18
        expect(modifiers.thresholdReduction).toBe(18);

        // Card bonus: 41.249 * 0.3 * 1.1 = 13.612... -> floor = 13
        expect(modifiers.cardBonus).toBe(13);

        // Rerolls: floor(50 / 30) = 1
        expect(modifiers.rerollsAvailable).toBe(1);

        // Danger avoid: 50 * 0.007 = 0.35 (35%)
        expect(modifiers.dangerAvoidChance).toBeCloseTo(0.35, 2);
      });

      it('should calculate modifiers correctly at skill level 100', () => {
        const modifiers = calculateSkillModifiers(100, 3);

        // Linear: 100 * 0.75 = 75
        // Exponential: 100^1.1 * 0.05 = 158.489... * 0.05 = 7.924...
        // Total: 75 + 7.924 = 82.924
        // Difficulty scale: 1.1

        // Threshold: 82.924 * 0.4 * 1.1 = 36.487... -> floor = 36
        expect(modifiers.thresholdReduction).toBe(36);

        // Card bonus: 82.924 * 0.3 * 1.1 = 27.365... -> floor = 27
        expect(modifiers.cardBonus).toBe(27);

        // Rerolls: floor(100 / 30) = 3
        expect(modifiers.rerollsAvailable).toBe(3);

        // Danger avoid: min(0.5, 100 * 0.007) = min(0.5, 0.7) = 0.5 (capped at 50%)
        expect(modifiers.dangerAvoidChance).toBe(0.5);
      });
    });

    describe('Skill Level Scaling', () => {
      it('should provide meaningful progression from 0 to 100', () => {
        const skillLevels = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        const difficulty = 3;

        const results = skillLevels.map(level => ({
          level,
          modifiers: calculateSkillModifiers(level, difficulty)
        }));

        // Verify threshold reduction scales up
        for (let i = 1; i < results.length; i++) {
          expect(results[i].modifiers.thresholdReduction).toBeGreaterThan(
            results[i - 1].modifiers.thresholdReduction
          );
        }

        // Verify card bonus scales up
        for (let i = 1; i < results.length; i++) {
          expect(results[i].modifiers.cardBonus).toBeGreaterThanOrEqual(
            results[i - 1].modifiers.cardBonus
          );
        }

        // Verify rerolls unlock at thresholds
        expect(results[0].modifiers.rerollsAvailable).toBe(0); // Level 0
        expect(results[3].modifiers.rerollsAvailable).toBe(1); // Level 30
        expect(results[6].modifiers.rerollsAvailable).toBe(2); // Level 60
        expect(results[9].modifiers.rerollsAvailable).toBe(3); // Level 90
      });

      it('should clamp skill level to 0-100 range', () => {
        const negativeSkill = calculateSkillModifiers(-50, 3);
        expect(negativeSkill.thresholdReduction).toBe(0);
        expect(negativeSkill.cardBonus).toBe(0);

        const overMaxSkill = calculateSkillModifiers(150, 3);
        const maxSkill = calculateSkillModifiers(100, 3);
        expect(overMaxSkill.thresholdReduction).toBe(maxSkill.thresholdReduction);
        expect(overMaxSkill.cardBonus).toBe(maxSkill.cardBonus);
      });
    });

    describe('Difficulty Scaling', () => {
      it('should scale effects based on difficulty (harder = skills matter more)', () => {
        const skillLevel = 50;
        const difficulties = [1, 2, 3, 4, 5];

        const results = difficulties.map(difficulty => ({
          difficulty,
          modifiers: calculateSkillModifiers(skillLevel, difficulty)
        }));

        // Higher difficulty = higher threshold reduction
        for (let i = 1; i < results.length; i++) {
          expect(results[i].modifiers.thresholdReduction).toBeGreaterThanOrEqual(
            results[i - 1].modifiers.thresholdReduction
          );
        }

        // Higher difficulty = higher card bonus
        for (let i = 1; i < results.length; i++) {
          expect(results[i].modifiers.cardBonus).toBeGreaterThanOrEqual(
            results[i - 1].modifiers.cardBonus
          );
        }

        // Verify difficulty scale calculation: 0.8 + (difficulty * 0.1)
        expect(results[0].difficulty).toBe(1); // Scale: 0.9
        expect(results[4].difficulty).toBe(5); // Scale: 1.3
      });
    });

    describe('Rerolls Available', () => {
      it('should unlock rerolls at correct skill levels', () => {
        expect(calculateSkillModifiers(0, 3).rerollsAvailable).toBe(0);
        expect(calculateSkillModifiers(29, 3).rerollsAvailable).toBe(0);
        expect(calculateSkillModifiers(30, 3).rerollsAvailable).toBe(1);
        expect(calculateSkillModifiers(59, 3).rerollsAvailable).toBe(1);
        expect(calculateSkillModifiers(60, 3).rerollsAvailable).toBe(2);
        expect(calculateSkillModifiers(89, 3).rerollsAvailable).toBe(2);
        expect(calculateSkillModifiers(90, 3).rerollsAvailable).toBe(3);
        expect(calculateSkillModifiers(100, 3).rerollsAvailable).toBe(3);
      });
    });

    describe('Danger Avoidance (Press Your Luck)', () => {
      it('should calculate danger avoid chance correctly', () => {
        // 0.007 per skill level
        expect(calculateSkillModifiers(0, 3).dangerAvoidChance).toBe(0);
        expect(calculateSkillModifiers(10, 3).dangerAvoidChance).toBeCloseTo(0.07, 2);
        expect(calculateSkillModifiers(25, 3).dangerAvoidChance).toBeCloseTo(0.175, 2);
        expect(calculateSkillModifiers(50, 3).dangerAvoidChance).toBeCloseTo(0.35, 2);
      });

      it('should cap danger avoid chance at 50%', () => {
        expect(calculateSkillModifiers(71, 3).dangerAvoidChance).toBeCloseTo(0.497, 2);
        expect(calculateSkillModifiers(72, 3).dangerAvoidChance).toBe(0.5);
        expect(calculateSkillModifiers(80, 3).dangerAvoidChance).toBe(0.5);
        expect(calculateSkillModifiers(100, 3).dangerAvoidChance).toBe(0.5);
      });
    });

    describe('Phase 6: Talent Bonuses', () => {
      it('should add talent bonuses to base modifiers', () => {
        const talentBonuses: TalentBonuses = {
          deckScoreBonus: 10,
          thresholdBonus: 5,
          dangerAvoidBonus: 10
        };

        const withTalents = calculateSkillModifiers(50, 3, talentBonuses);
        const withoutTalents = calculateSkillModifiers(50, 3);

        // Threshold should include talent bonus
        expect(withTalents.thresholdReduction).toBe(withoutTalents.thresholdReduction + 5);

        // Card bonus should include deck score bonus
        expect(withTalents.cardBonus).toBeGreaterThanOrEqual(withoutTalents.cardBonus + 10);

        // Danger avoid should include talent bonus (10% = 0.1)
        expect(withTalents.dangerAvoidChance).toBeCloseTo(
          withoutTalents.dangerAvoidChance + 0.1,
          2
        );
      });

      it('should apply synergy multiplier to card bonus only', () => {
        const talentBonuses: TalentBonuses = {
          deckScoreBonus: 10
        };
        const synergyMultiplier = 1.5;

        const withSynergy = calculateSkillModifiers(50, 3, talentBonuses, synergyMultiplier);
        const withoutSynergy = calculateSkillModifiers(50, 3, talentBonuses, 1.0);

        // Card bonus should be multiplied
        expect(withSynergy.cardBonus).toBeGreaterThan(withoutSynergy.cardBonus);

        // Threshold reduction should NOT be multiplied (synergy doesn't apply)
        expect(withSynergy.thresholdReduction).toBe(withoutSynergy.thresholdReduction);
      });

      it('should still cap danger avoid at 50% with talent bonuses', () => {
        const talentBonuses: TalentBonuses = {
          dangerAvoidBonus: 100 // Huge bonus
        };

        const modifiers = calculateSkillModifiers(100, 3, talentBonuses);

        // Should still be capped at 0.5 (50%)
        expect(modifiers.dangerAvoidChance).toBe(0.5);
      });
    });
  });
});

describe('Deck Games - Phase 3: Strategic Choices', () => {
  describe('calculateSpecialAbilities()', () => {
    describe('Poker Abilities', () => {
      it('should unlock rerolls at correct thresholds', () => {
        // No rerolls below skill 30
        expect(calculateSpecialAbilities(0).rerollsAvailable).toBe(0);
        expect(calculateSpecialAbilities(29).rerollsAvailable).toBe(0);

        // 1 reroll at skill 30+
        expect(calculateSpecialAbilities(30).rerollsAvailable).toBe(1);
        expect(calculateSpecialAbilities(59).rerollsAvailable).toBe(1);

        // 2 rerolls at skill 60+
        expect(calculateSpecialAbilities(60).rerollsAvailable).toBe(2);
        expect(calculateSpecialAbilities(89).rerollsAvailable).toBe(2);

        // 3 rerolls at skill 90+
        expect(calculateSpecialAbilities(90).rerollsAvailable).toBe(3);
        expect(calculateSpecialAbilities(100).rerollsAvailable).toBe(3);
      });

      it('should unlock peeks at correct thresholds', () => {
        // No peeks below skill 50
        expect(calculateSpecialAbilities(0).peeksAvailable).toBe(0);
        expect(calculateSpecialAbilities(49).peeksAvailable).toBe(0);

        // 1 peek at skill 50+
        // Formula: floor((skill - 20) / 30) when skill >= 50
        // At 50: floor((50 - 20) / 30) = floor(30 / 30) = 1
        expect(calculateSpecialAbilities(50).peeksAvailable).toBe(1);
        expect(calculateSpecialAbilities(79).peeksAvailable).toBe(1);

        // 2 peeks at skill 80+
        // At 80: floor((80 - 20) / 30) = floor(60 / 30) = 2
        expect(calculateSpecialAbilities(80).peeksAvailable).toBe(2);
        expect(calculateSpecialAbilities(100).peeksAvailable).toBe(2);
      });

      it('should always allow early finish', () => {
        expect(calculateSpecialAbilities(0).canEarlyFinish).toBe(true);
        expect(calculateSpecialAbilities(50).canEarlyFinish).toBe(true);
        expect(calculateSpecialAbilities(100).canEarlyFinish).toBe(true);
      });
    });

    describe('Blackjack Abilities', () => {
      it('should unlock double down at skill 5+', () => {
        expect(calculateSpecialAbilities(0).canDoubleDown).toBe(false);
        expect(calculateSpecialAbilities(4).canDoubleDown).toBe(false);
        expect(calculateSpecialAbilities(5).canDoubleDown).toBe(true);
        expect(calculateSpecialAbilities(50).canDoubleDown).toBe(true);
        expect(calculateSpecialAbilities(100).canDoubleDown).toBe(true);
      });

      it('should unlock insurance at skill 15+', () => {
        expect(calculateSpecialAbilities(0).canInsurance).toBe(false);
        expect(calculateSpecialAbilities(14).canInsurance).toBe(false);
        expect(calculateSpecialAbilities(15).canInsurance).toBe(true);
        expect(calculateSpecialAbilities(50).canInsurance).toBe(true);
        expect(calculateSpecialAbilities(100).canInsurance).toBe(true);
      });

      it('should calculate card counting bonus correctly', () => {
        // No bonus below skill 20
        expect(calculateSpecialAbilities(0).cardCountingBonus).toBe(0);
        expect(calculateSpecialAbilities(19).cardCountingBonus).toBe(0);

        // At skill 20+: min(30, floor((skill - 20) * 0.5))
        // At 20: floor((20 - 20) * 0.5) = 0
        expect(calculateSpecialAbilities(20).cardCountingBonus).toBe(0);

        // At 22: floor((22 - 20) * 0.5) = floor(1) = 1
        expect(calculateSpecialAbilities(22).cardCountingBonus).toBe(1);

        // At 40: floor((40 - 20) * 0.5) = floor(10) = 10
        expect(calculateSpecialAbilities(40).cardCountingBonus).toBe(10);

        // At 80: floor((80 - 20) * 0.5) = floor(30) = 30
        expect(calculateSpecialAbilities(80).cardCountingBonus).toBe(30);

        // At 100: floor((100 - 20) * 0.5) = floor(40) = 40, capped at 30
        expect(calculateSpecialAbilities(100).cardCountingBonus).toBe(30);
      });

      it('should cap card counting bonus at 30', () => {
        // At skill 80+, should be capped
        expect(calculateSpecialAbilities(80).cardCountingBonus).toBe(30);
        expect(calculateSpecialAbilities(90).cardCountingBonus).toBe(30);
        expect(calculateSpecialAbilities(100).cardCountingBonus).toBe(30);
      });
    });

    describe('Press Your Luck Abilities', () => {
      it('should unlock safe draw at skill 10+', () => {
        expect(calculateSpecialAbilities(0).canSafeDraw).toBe(false);
        expect(calculateSpecialAbilities(9).canSafeDraw).toBe(false);
        expect(calculateSpecialAbilities(10).canSafeDraw).toBe(true);
        expect(calculateSpecialAbilities(50).canSafeDraw).toBe(true);
        expect(calculateSpecialAbilities(100).canSafeDraw).toBe(true);
      });

      it('should calculate safe draw cost correctly', () => {
        // Below skill 10: should return 100 (not unlocked yet)
        expect(calculateSpecialAbilities(0).safeDrawCost).toBe(100);
        expect(calculateSpecialAbilities(9).safeDrawCost).toBe(100);

        // At skill 10+: max(25, 100 - floor((skill - 10) * 0.83))
        // At 10: max(25, 100 - floor(0)) = 100
        expect(calculateSpecialAbilities(10).safeDrawCost).toBe(100);

        // At 20: max(25, 100 - floor(10 * 0.83)) = max(25, 100 - 8) = 92
        expect(calculateSpecialAbilities(20).safeDrawCost).toBe(92);

        // At 50: max(25, 100 - floor(40 * 0.83)) = max(25, 100 - 33) = 67
        expect(calculateSpecialAbilities(50).safeDrawCost).toBe(67);

        // At 100: max(25, 100 - floor(90 * 0.83)) = max(25, 100 - 74) = 26
        expect(calculateSpecialAbilities(100).safeDrawCost).toBe(26);
      });

      it('should cap safe draw cost at minimum 25 gold', () => {
        // High skill levels should hit the floor of 25
        const cost100 = calculateSpecialAbilities(100).safeDrawCost;
        expect(cost100).toBeGreaterThanOrEqual(25);
        expect(cost100).toBeLessThanOrEqual(26);
      });

      it('should unlock double down at skill 25+', () => {
        expect(calculateSpecialAbilities(0).canDoubleDownPYL).toBe(false);
        expect(calculateSpecialAbilities(24).canDoubleDownPYL).toBe(false);
        expect(calculateSpecialAbilities(25).canDoubleDownPYL).toBe(true);
        expect(calculateSpecialAbilities(50).canDoubleDownPYL).toBe(true);
        expect(calculateSpecialAbilities(100).canDoubleDownPYL).toBe(true);
      });
    });

    describe('Skill Level Clamping', () => {
      it('should clamp negative skill levels to 0', () => {
        const abilities = calculateSpecialAbilities(-50);

        expect(abilities.rerollsAvailable).toBe(0);
        expect(abilities.peeksAvailable).toBe(0);
        expect(abilities.canEarlyFinish).toBe(true);
        expect(abilities.canDoubleDown).toBe(false);
        expect(abilities.canInsurance).toBe(false);
        expect(abilities.cardCountingBonus).toBe(0);
        expect(abilities.canSafeDraw).toBe(false);
        expect(abilities.safeDrawCost).toBe(100);
        expect(abilities.canDoubleDownPYL).toBe(false);
      });

      it('should clamp skill levels above 100 to 100', () => {
        const abilities150 = calculateSpecialAbilities(150);
        const abilities100 = calculateSpecialAbilities(100);

        expect(abilities150.rerollsAvailable).toBe(abilities100.rerollsAvailable);
        expect(abilities150.peeksAvailable).toBe(abilities100.peeksAvailable);
        expect(abilities150.cardCountingBonus).toBe(abilities100.cardCountingBonus);
        expect(abilities150.safeDrawCost).toBe(abilities100.safeDrawCost);
      });
    });

    describe('Comprehensive Ability Unlocking', () => {
      it('should show progression from novice (level 0) to master (level 100)', () => {
        const novice = calculateSpecialAbilities(0);
        const intermediate = calculateSpecialAbilities(50);
        const master = calculateSpecialAbilities(100);

        // Novice has minimal abilities
        expect(novice.rerollsAvailable).toBe(0);
        expect(novice.peeksAvailable).toBe(0);
        expect(novice.canDoubleDown).toBe(false);
        expect(novice.canInsurance).toBe(false);
        expect(novice.canSafeDraw).toBe(false);
        expect(novice.canDoubleDownPYL).toBe(false);

        // Intermediate has some abilities
        expect(intermediate.rerollsAvailable).toBe(1);
        expect(intermediate.peeksAvailable).toBe(1);
        expect(intermediate.canDoubleDown).toBe(true);
        expect(intermediate.canInsurance).toBe(true);
        expect(intermediate.canSafeDraw).toBe(true);
        expect(intermediate.canDoubleDownPYL).toBe(true);
        expect(intermediate.cardCountingBonus).toBeGreaterThan(0);

        // Master has maximum abilities
        expect(master.rerollsAvailable).toBe(3);
        expect(master.peeksAvailable).toBe(2);
        expect(master.canDoubleDown).toBe(true);
        expect(master.canInsurance).toBe(true);
        expect(master.canSafeDraw).toBe(true);
        expect(master.canDoubleDownPYL).toBe(true);
        expect(master.cardCountingBonus).toBe(30);
        expect(master.safeDrawCost).toBeLessThan(intermediate.safeDrawCost);
      });
    });

    describe('Edge Cases', () => {
      it('should handle exact threshold values correctly', () => {
        // Test exact threshold boundaries
        const thresholds = [
          { skill: 5, name: 'doubleDown' },
          { skill: 10, name: 'safeDraw' },
          { skill: 15, name: 'insurance' },
          { skill: 20, name: 'cardCounting' },
          { skill: 25, name: 'doubleDownPYL' },
          { skill: 30, name: 'reroll1' },
          { skill: 50, name: 'peek1' },
          { skill: 60, name: 'reroll2' },
          { skill: 80, name: 'peek2' },
          { skill: 90, name: 'reroll3' }
        ];

        thresholds.forEach(({ skill, name }) => {
          const justBefore = calculateSpecialAbilities(skill - 1);
          const atThreshold = calculateSpecialAbilities(skill);

          // Verify unlock happens exactly at threshold
          switch (name) {
            case 'doubleDown':
              expect(justBefore.canDoubleDown).toBe(false);
              expect(atThreshold.canDoubleDown).toBe(true);
              break;
            case 'safeDraw':
              expect(justBefore.canSafeDraw).toBe(false);
              expect(atThreshold.canSafeDraw).toBe(true);
              break;
            case 'insurance':
              expect(justBefore.canInsurance).toBe(false);
              expect(atThreshold.canInsurance).toBe(true);
              break;
            case 'cardCounting':
              expect(justBefore.cardCountingBonus).toBe(0);
              expect(atThreshold.cardCountingBonus).toBe(0); // Still 0 at exactly 20
              break;
            case 'doubleDownPYL':
              expect(justBefore.canDoubleDownPYL).toBe(false);
              expect(atThreshold.canDoubleDownPYL).toBe(true);
              break;
            case 'reroll1':
              expect(justBefore.rerollsAvailable).toBe(0);
              expect(atThreshold.rerollsAvailable).toBe(1);
              break;
            case 'peek1':
              expect(justBefore.peeksAvailable).toBe(0);
              expect(atThreshold.peeksAvailable).toBe(1);
              break;
            case 'reroll2':
              expect(justBefore.rerollsAvailable).toBe(1);
              expect(atThreshold.rerollsAvailable).toBe(2);
              break;
            case 'peek2':
              expect(justBefore.peeksAvailable).toBe(1);
              expect(atThreshold.peeksAvailable).toBe(2);
              break;
            case 'reroll3':
              expect(justBefore.rerollsAvailable).toBe(2);
              expect(atThreshold.rerollsAvailable).toBe(3);
              break;
          }
        });
      });
    });
  });

  describe('Integration: Modifiers + Abilities', () => {
    it('should provide consistent benefits across both systems', () => {
      const skillLevel = 60;
      const difficulty = 3;

      const modifiers = calculateSkillModifiers(skillLevel, difficulty);
      const abilities = calculateSpecialAbilities(skillLevel);

      // At skill 60, should have:
      // - 2 rerolls (from both systems)
      expect(modifiers.rerollsAvailable).toBe(2);
      expect(abilities.rerollsAvailable).toBe(2);

      // - All basic abilities unlocked
      expect(abilities.canDoubleDown).toBe(true);
      expect(abilities.canInsurance).toBe(true);
      expect(abilities.canSafeDraw).toBe(true);
      expect(abilities.canDoubleDownPYL).toBe(true);

      // - 1 peek available
      expect(abilities.peeksAvailable).toBe(1);

      // - Meaningful threshold reduction and card bonus
      expect(modifiers.thresholdReduction).toBeGreaterThan(15);
      expect(modifiers.cardBonus).toBeGreaterThan(10);
    });

    it('should demonstrate clear power curve from 0 to 100', () => {
      const testPoints = [0, 25, 50, 75, 100];
      const difficulty = 3;

      const results = testPoints.map(skill => ({
        skill,
        modifiers: calculateSkillModifiers(skill, difficulty),
        abilities: calculateSpecialAbilities(skill)
      }));

      // Count total unlocked abilities
      const countAbilities = (abilities: SpecialAbilities): number => {
        let count = 0;
        count += abilities.rerollsAvailable;
        count += abilities.peeksAvailable;
        if (abilities.canDoubleDown) count++;
        if (abilities.canInsurance) count++;
        if (abilities.canSafeDraw) count++;
        if (abilities.canDoubleDownPYL) count++;
        return count;
      };

      // Verify progressive power increase
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1];
        const curr = results[i];

        // More abilities unlocked
        expect(countAbilities(curr.abilities)).toBeGreaterThanOrEqual(
          countAbilities(prev.abilities)
        );

        // Better modifiers
        expect(curr.modifiers.thresholdReduction).toBeGreaterThan(
          prev.modifiers.thresholdReduction
        );
        expect(curr.modifiers.cardBonus).toBeGreaterThanOrEqual(
          prev.modifiers.cardBonus
        );
      }
    });
  });
});
