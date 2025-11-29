/**
 * Profanity Filter Tests
 * Sprint 5 - Agent 1
 *
 * Tests for profanity filtering utility
 */

import {
  filterProfanity,
  containsProfanity,
  detectProfanity,
  calculateProfanitySeverity
} from '../../src/utils/profanityFilter';

describe('ProfanityFilter', () => {
  describe('filterProfanity()', () => {
    it('should replace profane words with asterisks', () => {
      const filtered = filterProfanity('This is a damn test');
      expect(filtered).toBe('This is a **** test');
    });

    it('should replace multiple profane words', () => {
      const filtered = filterProfanity('This shit is damn bad');
      expect(filtered).toContain('****');
    });

    it('should be case insensitive', () => {
      const filtered = filterProfanity('This is DAMN bad');
      expect(filtered).toBe('This is **** bad');
    });

    it('should handle clean messages', () => {
      const filtered = filterProfanity('This is a clean message');
      expect(filtered).toBe('This is a clean message');
    });

    it('should handle empty strings', () => {
      const filtered = filterProfanity('');
      expect(filtered).toBe('');
    });

    it('should preserve asterisk length matching original word', () => {
      const filtered = filterProfanity('This is shit');
      const asterisks = filtered.match(/\*+/);
      expect(asterisks).not.toBeNull();
      expect(asterisks![0].length).toBe(4); // "shit" has 4 characters
    });
  });

  describe('containsProfanity()', () => {
    it('should detect profanity', () => {
      expect(containsProfanity('This is damn bad')).toBe(true);
    });

    it('should return false for clean messages', () => {
      expect(containsProfanity('This is a clean message')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(containsProfanity('This is DAMN bad')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(containsProfanity('')).toBe(false);
    });
  });

  describe('detectProfanity()', () => {
    it('should return list of detected profane words', () => {
      const detected = detectProfanity('This damn shit is bad');
      expect(detected.length).toBeGreaterThan(0);
      expect(detected).toContain('damn');
      expect(detected).toContain('shit');
    });

    it('should return empty array for clean messages', () => {
      const detected = detectProfanity('This is a clean message');
      expect(detected).toHaveLength(0);
    });

    it('should return unique words only', () => {
      const detected = detectProfanity('damn damn damn');
      expect(detected).toHaveLength(1);
      expect(detected[0]).toBe('damn');
    });
  });

  describe('calculateProfanitySeverity()', () => {
    it('should return 0 for clean messages', () => {
      const severity = calculateProfanitySeverity('This is clean');
      expect(severity).toBe(0);
    });

    it('should calculate severity for mild profanity', () => {
      const severity = calculateProfanitySeverity('This is damn bad');
      expect(severity).toBeGreaterThan(0);
    });

    it('should calculate higher severity for multiple profane words', () => {
      const single = calculateProfanitySeverity('This is damn');
      const multiple = calculateProfanitySeverity('This damn shit is bad');
      expect(multiple).toBeGreaterThan(single);
    });
  });
});
