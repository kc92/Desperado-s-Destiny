/**
 * Password Strength Utility Tests
 */

import { describe, it, expect } from 'vitest';
import { calculatePasswordStrength } from '@/utils/passwordStrength';

describe('calculatePasswordStrength', () => {
  it('should return weak score for empty password', () => {
    const result = calculatePasswordStrength('');

    expect(result.score).toBe(0);
    expect(result.label).toBe('Too weak');
    expect(result.feedback).toContain('Password is required');
  });

  it('should return weak score for short password', () => {
    const result = calculatePasswordStrength('Test1');

    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.feedback).toContain('Use at least 8 characters');
  });

  it('should return weak score for password without complexity', () => {
    const result = calculatePasswordStrength('testtest');

    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.feedback.length).toBeGreaterThan(0);
  });

  it('should return good score for password with length and some complexity', () => {
    const result = calculatePasswordStrength('Test1234');

    expect(result.score).toBeGreaterThanOrEqual(1);
    expect(result.label).toMatch(/Weak|Good/);
  });

  it('should return strong score for password with all requirements', () => {
    const result = calculatePasswordStrength('Test1234!@#$5678');

    expect(result.score).toBeGreaterThanOrEqual(2);
    expect(result.label).toMatch(/Good|Strong/);
  });

  it('should give feedback for missing uppercase', () => {
    const result = calculatePasswordStrength('test12345');

    expect(result.feedback).toContain('Include uppercase letters');
  });

  it('should give feedback for missing lowercase', () => {
    const result = calculatePasswordStrength('TEST12345');

    expect(result.feedback).toContain('Include lowercase letters');
  });

  it('should give feedback for missing numbers', () => {
    const result = calculatePasswordStrength('TestTestTest');

    expect(result.feedback).toContain('Include numbers');
  });

  it('should return strong for very long complex password', () => {
    const result = calculatePasswordStrength('VeryLongPassword123!@#');

    expect(result.score).toBe(3);
    expect(result.label).toBe('Strong');
    expect(result.feedback.length).toBe(0);
  });

  it('should have correct color for each score', () => {
    expect(calculatePasswordStrength('').color).toBe('bg-blood-red');
    expect(calculatePasswordStrength('Test1').color).toBe('bg-blood-red');
    expect(calculatePasswordStrength('Test1234').color).toMatch(/bg-blood-red|bg-gold-medium/);
    expect(calculatePasswordStrength('Test1234!@#$5678').color).toMatch(/bg-gold-medium|bg-settler-blue/);
  });
});
