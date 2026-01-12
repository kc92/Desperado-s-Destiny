/**
 * Validation Utilities Tests
 *
 * Comprehensive tests for validation utilities used across the application
 */

import {
  validateCurrencyAmount,
  clampLimit,
  CURRENCY_LIMITS,
} from '../../src/utils/validation';

describe('Validation Utilities', () => {
  describe('validateCurrencyAmount', () => {
    describe('rejects invalid types', () => {
      it('should reject undefined', () => {
        const result = validateCurrencyAmount(undefined);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('amount is required');
      });

      it('should reject null', () => {
        const result = validateCurrencyAmount(null);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('amount is required');
      });

      it('should reject string values', () => {
        const result = validateCurrencyAmount('100');
        expect(result.success).toBe(false);
        expect(result.errors).toContain('amount must be a number');
      });

      it('should reject object values', () => {
        const result = validateCurrencyAmount({ value: 100 });
        expect(result.success).toBe(false);
        expect(result.errors).toContain('amount must be a number');
      });

      it('should reject array values', () => {
        const result = validateCurrencyAmount([100]);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('amount must be a number');
      });

      it('should reject boolean values', () => {
        const result = validateCurrencyAmount(true);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('amount must be a number');
      });
    });

    describe('rejects invalid numbers', () => {
      it('should reject NaN', () => {
        const result = validateCurrencyAmount(NaN);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('amount must be a valid number');
      });

      it('should reject Infinity', () => {
        const result = validateCurrencyAmount(Infinity);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('amount must be a valid number');
      });

      it('should reject -Infinity', () => {
        const result = validateCurrencyAmount(-Infinity);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('amount must be a valid number');
      });
    });

    describe('rejects non-integers', () => {
      it('should reject decimal values (1.5)', () => {
        const result = validateCurrencyAmount(1.5);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('amount must be a whole number');
      });

      it('should reject small decimals (0.99)', () => {
        const result = validateCurrencyAmount(0.99);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('amount must be a whole number');
      });

      it('should reject large decimals (100.001)', () => {
        const result = validateCurrencyAmount(100.001);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('amount must be a whole number');
      });
    });

    describe('rejects values below minimum', () => {
      it('should reject negative numbers', () => {
        const result = validateCurrencyAmount(-1);
        expect(result.success).toBe(false);
        expect(result.errors?.[0]).toContain('must be at least');
      });

      it('should reject zero by default', () => {
        const result = validateCurrencyAmount(0);
        expect(result.success).toBe(false);
        expect(result.errors?.[0]).toContain('must be at least 1');
      });

      it('should accept zero when allowZero option is true', () => {
        const result = validateCurrencyAmount(0, 'amount', { allowZero: true });
        expect(result.success).toBe(true);
        expect(result.data).toBe(0);
      });

      it('should respect custom minimum', () => {
        const result = validateCurrencyAmount(5, 'amount', { min: 10 });
        expect(result.success).toBe(false);
        expect(result.errors?.[0]).toContain('must be at least 10');
      });
    });

    describe('rejects values above maximum', () => {
      it('should reject amounts exceeding default max (1 billion)', () => {
        const result = validateCurrencyAmount(CURRENCY_LIMITS.MAX_AMOUNT + 1);
        expect(result.success).toBe(false);
        expect(result.errors?.[0]).toContain('cannot exceed');
      });

      it('should respect custom maximum', () => {
        const result = validateCurrencyAmount(101, 'amount', { max: 100 });
        expect(result.success).toBe(false);
        expect(result.errors?.[0]).toContain('cannot exceed 100');
      });
    });

    describe('accepts valid values', () => {
      it('should accept positive integer 1', () => {
        const result = validateCurrencyAmount(1);
        expect(result.success).toBe(true);
        expect(result.data).toBe(1);
      });

      it('should accept small positive integers', () => {
        const result = validateCurrencyAmount(100);
        expect(result.success).toBe(true);
        expect(result.data).toBe(100);
      });

      it('should accept large positive integers', () => {
        const result = validateCurrencyAmount(999999999);
        expect(result.success).toBe(true);
        expect(result.data).toBe(999999999);
      });

      it('should accept maximum allowed amount', () => {
        const result = validateCurrencyAmount(CURRENCY_LIMITS.MAX_AMOUNT);
        expect(result.success).toBe(true);
        expect(result.data).toBe(CURRENCY_LIMITS.MAX_AMOUNT);
      });
    });

    describe('custom field name', () => {
      it('should use custom field name in error messages', () => {
        const result = validateCurrencyAmount(undefined, 'transferAmount');
        expect(result.success).toBe(false);
        expect(result.errors).toContain('transferAmount is required');
      });

      it('should use custom field name for type errors', () => {
        const result = validateCurrencyAmount('abc', 'depositValue');
        expect(result.success).toBe(false);
        expect(result.errors).toContain('depositValue must be a number');
      });
    });
  });

  describe('clampLimit', () => {
    describe('returns default for invalid input', () => {
      it('should return default for undefined', () => {
        const result = clampLimit(undefined);
        expect(result).toBe(10); // default
      });

      it('should return default for null', () => {
        const result = clampLimit(null);
        expect(result).toBe(10);
      });

      it('should return default for empty string', () => {
        const result = clampLimit('');
        expect(result).toBe(10);
      });

      it('should return default for non-numeric string', () => {
        const result = clampLimit('abc');
        expect(result).toBe(10);
      });

      it('should return default for NaN', () => {
        const result = clampLimit(NaN);
        expect(result).toBe(10);
      });

      it('should return default for Infinity', () => {
        const result = clampLimit(Infinity);
        expect(result).toBe(10);
      });

      it('should return custom default when specified', () => {
        const result = clampLimit(undefined, { defaultLimit: 25 });
        expect(result).toBe(25);
      });
    });

    describe('returns default for values below minimum', () => {
      it('should return default for negative values', () => {
        const result = clampLimit(-1);
        expect(result).toBe(10);
      });

      it('should return default for zero', () => {
        const result = clampLimit(0);
        expect(result).toBe(10);
      });

      it('should return defaultLimit when value below minLimit', () => {
        // Implementation returns defaultLimit for invalid values (below minLimit)
        const result = clampLimit(3, { minLimit: 5, defaultLimit: 10 });
        expect(result).toBe(10);
      });
    });

    describe('clamps to maximum', () => {
      it('should clamp to default max (100) when exceeded', () => {
        const result = clampLimit(999);
        expect(result).toBe(100);
      });

      it('should clamp to custom max when exceeded', () => {
        const result = clampLimit(100, { maxLimit: 50 });
        expect(result).toBe(50);
      });

      it('should return exact max when at max', () => {
        const result = clampLimit(100, { maxLimit: 100 });
        expect(result).toBe(100);
      });
    });

    describe('parses string values', () => {
      it('should parse numeric string correctly', () => {
        const result = clampLimit('25');
        expect(result).toBe(25);
      });

      it('should parse numeric string and clamp to max', () => {
        const result = clampLimit('999', { maxLimit: 50 });
        expect(result).toBe(50);
      });

      it('should floor decimal strings', () => {
        const result = clampLimit('25.9');
        expect(result).toBe(25);
      });
    });

    describe('accepts valid values', () => {
      it('should return 1 for input 1', () => {
        const result = clampLimit(1);
        expect(result).toBe(1);
      });

      it('should return value when within range', () => {
        const result = clampLimit(50, { maxLimit: 100 });
        expect(result).toBe(50);
      });

      it('should floor decimal values', () => {
        const result = clampLimit(25.7);
        expect(result).toBe(25);
      });
    });

    describe('never throws', () => {
      it('should handle object input gracefully', () => {
        expect(() => clampLimit({ value: 100 } as any)).not.toThrow();
        const result = clampLimit({ value: 100 } as any);
        expect(result).toBe(10);
      });

      it('should handle array input gracefully', () => {
        expect(() => clampLimit([100] as any)).not.toThrow();
        // Note: Number([100]) === 100 in JavaScript (single-element array coercion)
        // So [100] becomes 100, which is clamped to maxLimit (100)
        const result = clampLimit([100] as any);
        expect(result).toBe(100);
      });

      it('should handle boolean input gracefully', () => {
        expect(() => clampLimit(true as any)).not.toThrow();
        // true coerces to 1 in Number()
        const result = clampLimit(true as any);
        expect(result).toBe(1);
      });

      it('should handle function input gracefully', () => {
        expect(() => clampLimit((() => 100) as any)).not.toThrow();
        const result = clampLimit((() => 100) as any);
        expect(result).toBe(10);
      });
    });
  });

  describe('CURRENCY_LIMITS constants', () => {
    it('should have MIN_AMOUNT of 1', () => {
      expect(CURRENCY_LIMITS.MIN_AMOUNT).toBe(1);
    });

    it('should have MAX_AMOUNT of 1 billion', () => {
      expect(CURRENCY_LIMITS.MAX_AMOUNT).toBe(1_000_000_000);
    });
  });
});
