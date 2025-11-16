/**
 * Example Tests
 *
 * Example test suite showing how to write backend tests
 */

import { isDatabaseConnected } from './helpers/db.helpers';
import { createTestToken, verifyToken } from './helpers/auth.helpers';
import { mockUser } from '@desperados/shared';

describe('Example Test Suite', () => {
  describe('Database Connection', () => {
    it('should be connected to test database', () => {
      expect(isDatabaseConnected()).toBe(true);
    });
  });

  describe('Test Helpers', () => {
    it('should create and verify JWT tokens', () => {
      const user = mockUser();
      const token = createTestToken(user._id, user.email);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(user._id);
      expect(decoded.email).toBe(user.email);
    });

    it('should create mock users', () => {
      const user = mockUser();

      expect(user).toBeDefined();
      expect(user._id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.emailVerified).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.lastLogin).toBeInstanceOf(Date);
    });
  });

  describe('Environment Variables', () => {
    it('should have test environment configured', () => {
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.JWT_SECRET).toBe('test-jwt-secret');
      expect(process.env.MONGODB_URI).toBeDefined();
    });
  });
});
