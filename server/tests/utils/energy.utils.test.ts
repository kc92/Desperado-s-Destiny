/**
 * Energy Utilities Tests
 *
 * Comprehensive tests for energy calculation and validation utilities
 */

import {
  calculateCurrentEnergy,
  getTimeUntilEnergy,
  getTimeUntilFullEnergy,
  formatTimeRemaining,
  validateEnergySpend,
  getEnergyRegenRate,
  getMaxEnergy,
  calculateEnergyDeficit,
} from '../../src/utils/energy.utils';
import { ICharacter } from '../../src/models/Character.model';
import { ENERGY } from '@desperados/shared';

describe('Energy Utilities', () => {
  // Mock character for testing
  const createMockCharacter = (energy: number, lastUpdate: Date): Partial<ICharacter> => ({
    energy,
    maxEnergy: ENERGY.FREE_MAX,
    lastEnergyUpdate: lastUpdate,
  });

  describe('calculateCurrentEnergy', () => {
    it('should return current energy when no time has passed', () => {
      const character = createMockCharacter(100, new Date());
      const current = calculateCurrentEnergy(character as ICharacter, false);

      expect(current).toBe(100);
    });

    it('should calculate regenerated energy after 1 hour (free)', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const character = createMockCharacter(50, oneHourAgo);
      const current = calculateCurrentEnergy(character as ICharacter, false);

      // Free regen: 30 per hour, so 50 + 30 = 80
      expect(current).toBeGreaterThanOrEqual(79);
      expect(current).toBeLessThanOrEqual(80);
    });

    it('should calculate regenerated energy after 1 hour (premium)', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const character = createMockCharacter(50, oneHourAgo);
      const current = calculateCurrentEnergy(character as ICharacter, true);

      // Premium regen: 31.25 per hour, so 50 + 31.25 = 81.25 (floored to 81)
      expect(current).toBeGreaterThanOrEqual(81);
      expect(current).toBeLessThanOrEqual(82);
    });

    it('should cap energy at free max (150)', () => {
      const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
      const character = createMockCharacter(100, tenHoursAgo);
      const current = calculateCurrentEnergy(character as ICharacter, false);

      expect(current).toBe(ENERGY.FREE_MAX);
    });

    it('should cap energy at premium max (250)', () => {
      const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
      const character = createMockCharacter(100, tenHoursAgo);
      const current = calculateCurrentEnergy(character as ICharacter, true);

      expect(current).toBe(ENERGY.PREMIUM_MAX);
    });

    it('should handle partial hour regeneration', () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const character = createMockCharacter(50, thirtyMinutesAgo);
      const current = calculateCurrentEnergy(character as ICharacter, false);

      // Free regen: 30 per hour, so 15 per 30 minutes = 65
      expect(current).toBeGreaterThanOrEqual(64);
      expect(current).toBeLessThanOrEqual(65);
    });

    it('should return floored integer values', () => {
      const character = createMockCharacter(100.7, new Date());
      const current = calculateCurrentEnergy(character as ICharacter, false);

      expect(Number.isInteger(current)).toBe(true);
    });

    it('should handle character at zero energy', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const character = createMockCharacter(0, oneHourAgo);
      const current = calculateCurrentEnergy(character as ICharacter, false);

      expect(current).toBeGreaterThanOrEqual(29);
      expect(current).toBeLessThanOrEqual(30);
    });
  });

  describe('getTimeUntilEnergy', () => {
    it('should return 0 when already at target energy', () => {
      const character = createMockCharacter(100, new Date());
      const time = getTimeUntilEnergy(character as ICharacter, 50, false);

      expect(time).toBe(0);
    });

    it('should return 0 when above target energy', () => {
      const character = createMockCharacter(100, new Date());
      const time = getTimeUntilEnergy(character as ICharacter, 100, false);

      expect(time).toBe(0);
    });

    it('should calculate time to reach target energy (free)', () => {
      const character = createMockCharacter(50, new Date());
      const time = getTimeUntilEnergy(character as ICharacter, 80, false);

      // Need 30 energy, free regen is 30 per hour
      const oneHourMs = 60 * 60 * 1000;
      expect(time).toBeGreaterThanOrEqual(oneHourMs - 1000);
      expect(time).toBeLessThanOrEqual(oneHourMs + 1000);
    });

    it('should calculate time to reach target energy (premium)', () => {
      const character = createMockCharacter(50, new Date());
      const time = getTimeUntilEnergy(character as ICharacter, 100, true);

      // Need 50 energy, premium regen is 31.25 per hour
      const expectedHours = 50 / 31.25; // ~1.6 hours
      const expectedMs = expectedHours * 60 * 60 * 1000;

      expect(time).toBeGreaterThanOrEqual(expectedMs - 1000);
      expect(time).toBeLessThanOrEqual(expectedMs + 1000);
    });

    it('should account for regeneration already occurred', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const character = createMockCharacter(50, oneHourAgo);
      const time = getTimeUntilEnergy(character as ICharacter, 100, false);

      // Character has regenerated to ~80, needs 20 more
      // At 30 per hour, that's 40 minutes
      const expectedMs = (20 / 30) * 60 * 60 * 1000;

      expect(time).toBeGreaterThanOrEqual(expectedMs - 1000);
      expect(time).toBeLessThanOrEqual(expectedMs + 1000);
    });
  });

  describe('getTimeUntilFullEnergy', () => {
    it('should return 0 when at max energy', () => {
      const character = createMockCharacter(ENERGY.FREE_MAX, new Date());
      const time = getTimeUntilFullEnergy(character as ICharacter, false);

      expect(time).toBe(0);
    });

    it('should calculate time to full energy (free)', () => {
      const character = createMockCharacter(0, new Date());
      const time = getTimeUntilFullEnergy(character as ICharacter, false);

      // Need 150 energy at 30 per hour = 5 hours
      const fiveHoursMs = 5 * 60 * 60 * 1000;

      expect(time).toBeGreaterThanOrEqual(fiveHoursMs - 1000);
      expect(time).toBeLessThanOrEqual(fiveHoursMs + 1000);
    });

    it('should calculate time to full energy (premium)', () => {
      const character = createMockCharacter(0, new Date());
      const time = getTimeUntilFullEnergy(character as ICharacter, true);

      // Need 250 energy at 31.25 per hour = 8 hours
      const eightHoursMs = 8 * 60 * 60 * 1000;

      expect(time).toBeGreaterThanOrEqual(eightHoursMs - 1000);
      expect(time).toBeLessThanOrEqual(eightHoursMs + 1000);
    });
  });

  describe('formatTimeRemaining', () => {
    it('should format zero time as "Ready now"', () => {
      expect(formatTimeRemaining(0)).toBe('Ready now');
    });

    it('should format negative time as "Ready now"', () => {
      expect(formatTimeRemaining(-5000)).toBe('Ready now');
    });

    it('should format seconds only', () => {
      expect(formatTimeRemaining(30 * 1000)).toBe('30s');
    });

    it('should format minutes only', () => {
      expect(formatTimeRemaining(5 * 60 * 1000)).toBe('5m');
    });

    it('should format minutes and seconds for < 5 minutes', () => {
      expect(formatTimeRemaining(2 * 60 * 1000 + 30 * 1000)).toBe('2m 30s');
    });

    it('should format hours only', () => {
      expect(formatTimeRemaining(3 * 60 * 60 * 1000)).toBe('3h');
    });

    it('should format hours and minutes', () => {
      expect(formatTimeRemaining(2 * 60 * 60 * 1000 + 15 * 60 * 1000)).toBe('2h 15m');
    });

    it('should format days only', () => {
      expect(formatTimeRemaining(2 * 24 * 60 * 60 * 1000)).toBe('2d');
    });

    it('should format days and hours', () => {
      expect(formatTimeRemaining(1 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000)).toBe('1d 3h');
    });

    it('should not show seconds for > 5 minutes', () => {
      const result = formatTimeRemaining(10 * 60 * 1000 + 30 * 1000);
      expect(result).toBe('10m');
      expect(result).not.toContain('s');
    });
  });

  describe('validateEnergySpend', () => {
    it('should return true when character has sufficient energy', () => {
      const character = createMockCharacter(100, new Date());
      const isValid = validateEnergySpend(character as ICharacter, 50, false);

      expect(isValid).toBe(true);
    });

    it('should return true when energy exactly equals cost', () => {
      const character = createMockCharacter(50, new Date());
      const isValid = validateEnergySpend(character as ICharacter, 50, false);

      expect(isValid).toBe(true);
    });

    it('should return false when character has insufficient energy', () => {
      const character = createMockCharacter(30, new Date());
      const isValid = validateEnergySpend(character as ICharacter, 50, false);

      expect(isValid).toBe(false);
    });

    it('should account for regeneration', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const character = createMockCharacter(50, oneHourAgo);
      const isValid = validateEnergySpend(character as ICharacter, 75, false);

      // After 1 hour, should have ~80 energy, so 75 should be valid
      expect(isValid).toBe(true);
    });
  });

  describe('getEnergyRegenRate', () => {
    it('should return free regen rate', () => {
      expect(getEnergyRegenRate(false)).toBe(ENERGY.FREE_REGEN_PER_HOUR);
      expect(getEnergyRegenRate(false)).toBe(30);
    });

    it('should return premium regen rate', () => {
      expect(getEnergyRegenRate(true)).toBe(ENERGY.PREMIUM_REGEN_PER_HOUR);
      expect(getEnergyRegenRate(true)).toBe(31.25);
    });
  });

  describe('getMaxEnergy', () => {
    it('should return free max energy', () => {
      expect(getMaxEnergy(false)).toBe(ENERGY.FREE_MAX);
      expect(getMaxEnergy(false)).toBe(150);
    });

    it('should return premium max energy', () => {
      expect(getMaxEnergy(true)).toBe(ENERGY.PREMIUM_MAX);
      expect(getMaxEnergy(true)).toBe(250);
    });
  });

  describe('calculateEnergyDeficit', () => {
    it('should calculate deficit correctly', () => {
      const character = createMockCharacter(30, new Date());
      const result = calculateEnergyDeficit(character as ICharacter, 50, false);

      expect(result.current).toBe(30);
      expect(result.required).toBe(50);
      expect(result.deficit).toBe(20);
    });

    it('should return zero deficit when sufficient energy', () => {
      const character = createMockCharacter(100, new Date());
      const result = calculateEnergyDeficit(character as ICharacter, 50, false);

      expect(result.current).toBe(100);
      expect(result.required).toBe(50);
      expect(result.deficit).toBe(0);
    });

    it('should account for regeneration in current', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const character = createMockCharacter(50, oneHourAgo);
      const result = calculateEnergyDeficit(character as ICharacter, 100, false);

      // Should have regenerated to ~80
      expect(result.current).toBeGreaterThanOrEqual(79);
      expect(result.current).toBeLessThanOrEqual(80);
      expect(result.required).toBe(100);
      expect(result.deficit).toBeGreaterThanOrEqual(20);
      expect(result.deficit).toBeLessThanOrEqual(21);
    });
  });
});
