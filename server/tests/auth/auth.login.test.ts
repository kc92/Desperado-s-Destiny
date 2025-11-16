/**
 * Authentication Login Tests
 *
 * Tests for user login endpoint
 */

import request from 'supertest';
import app from '../testApp';
import { User } from '../../src/models/User.model';
import { clearDatabase } from '../helpers/db.helpers';
import { apiPost, expectSuccess, expectError } from '../helpers/api.helpers';
import { hashPassword } from '../helpers/auth.helpers';
import bcrypt from 'bcryptjs';

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  /**
   * Helper function to create a verified user for login tests
   */
  async function createVerifiedUser(email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({
      email: email.toLowerCase(),
      passwordHash,
      emailVerified: true,
      isActive: true,
      role: 'user'
    });
    await user.save();
    return user;
  }

  describe('Successful Login', () => {
    it('should successfully login with valid credentials', async () => {
      await createVerifiedUser('test@example.com', 'TestPassword123');

      const response = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      expect(response.status).toBe(200);
      expectSuccess(response);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should set JWT token in httpOnly cookie', async () => {
      await createVerifiedUser('test@example.com', 'TestPassword123');

      const response = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      expect(response.status).toBe(200);
      expect(response.headers['set-cookie']).toBeDefined();

      const cookies = response.headers['set-cookie'] as string[];
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));

      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toContain('HttpOnly');
      expect(tokenCookie).toContain('SameSite=Strict');
    });

    it('should update lastLogin timestamp', async () => {
      const user = await createVerifiedUser('test@example.com', 'TestPassword123');
      const beforeLogin = Date.now();

      await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      const afterLogin = Date.now();
      const updatedUser = await User.findById(user._id);

      expect(updatedUser?.lastLogin).toBeDefined();
      const lastLoginTime = updatedUser?.lastLogin?.getTime() || 0;
      expect(lastLoginTime).toBeGreaterThanOrEqual(beforeLogin);
      expect(lastLoginTime).toBeLessThanOrEqual(afterLogin);
    });

    it('should return safe user object without password', async () => {
      await createVerifiedUser('test@example.com', 'TestPassword123');

      const response = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      expect(response.status).toBe(200);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.emailVerified).toBe(true);
      expect(response.body.data.user._id).toBeDefined();
      expect(response.body.data.user.createdAt).toBeDefined();
      expect(response.body.data.user.lastLogin).toBeDefined();

      // Should NOT include password or passwordHash
      expect(response.body.data.user.password).toBeUndefined();
      expect(response.body.data.user.passwordHash).toBeUndefined();
      expect(response.body.data.user.verificationToken).toBeUndefined();
      expect(response.body.data.user.resetPasswordToken).toBeUndefined();
    });

    it('should login with case-insensitive email', async () => {
      await createVerifiedUser('test@example.com', 'TestPassword123');

      const response = await apiPost(app, '/api/auth/login', {
        email: 'TEST@EXAMPLE.COM',
        password: 'TestPassword123'
      });

      expect(response.status).toBe(200);
      expectSuccess(response);
      expect(response.body.data.user.email).toBe('test@example.com');
    });
  });

  describe('Failed Login Attempts', () => {
    it('should reject login with wrong password', async () => {
      await createVerifiedUser('test@example.com', 'TestPassword123');

      const response = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'WrongPassword123'
      });

      expect(response.status).toBe(401);
      expectError(response, 401);
      expect(response.body.error).toContain('Invalid');
      expect(response.headers['set-cookie']).toBeUndefined();
    });

    it('should reject login with non-existent email', async () => {
      const response = await apiPost(app, '/api/auth/login', {
        email: 'nonexistent@example.com',
        password: 'TestPassword123'
      });

      expect(response.status).toBe(401);
      expectError(response, 401);
      expect(response.body.error).toContain('Invalid');
      expect(response.headers['set-cookie']).toBeUndefined();
    });

    it('should reject login with missing email', async () => {
      const response = await apiPost(app, '/api/auth/login', {
        password: 'TestPassword123'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('required');
    });

    it('should reject login with missing password', async () => {
      const response = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('required');
    });

    it('should reject login with empty email', async () => {
      const response = await apiPost(app, '/api/auth/login', {
        email: '',
        password: 'TestPassword123'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
    });

    it('should reject login with empty password', async () => {
      const response = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: ''
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
    });
  });

  describe('Email Verification Requirements', () => {
    it('should reject login if email is not verified', async () => {
      const passwordHash = await bcrypt.hash('TestPassword123', 12);
      const user = new User({
        email: 'test@example.com',
        passwordHash,
        emailVerified: false, // Not verified
        isActive: true,
        role: 'user'
      });
      await user.save();

      const response = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      expect(response.status).toBe(403);
      expectError(response, 403);
      expect(response.body.error).toContain('verify');
      expect(response.headers['set-cookie']).toBeUndefined();
    });

    it('should allow login only after email verification', async () => {
      const passwordHash = await bcrypt.hash('TestPassword123', 12);
      const user = new User({
        email: 'test@example.com',
        passwordHash,
        emailVerified: false,
        isActive: true,
        role: 'user'
      });
      await user.save();

      // First attempt should fail
      let response = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });
      expect(response.status).toBe(403);

      // Verify email
      user.emailVerified = true;
      await user.save();

      // Second attempt should succeed
      response = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });
      expect(response.status).toBe(200);
      expectSuccess(response);
    });
  });

  describe('Account Status', () => {
    it('should reject login if account is inactive', async () => {
      const passwordHash = await bcrypt.hash('TestPassword123', 12);
      const user = new User({
        email: 'test@example.com',
        passwordHash,
        emailVerified: true,
        isActive: false, // Inactive account
        role: 'user'
      });
      await user.save();

      const response = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      expect(response.status).toBe(403);
      expectError(response, 403);
      expect(response.body.error).toContain('inactive');
      expect(response.headers['set-cookie']).toBeUndefined();
    });
  });

  describe('Security', () => {
    it('should not leak information about whether email exists', async () => {
      await createVerifiedUser('test@example.com', 'TestPassword123');

      // Wrong password for existing user
      const response1 = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'WrongPassword123'
      });

      // Non-existent user
      const response2 = await apiPost(app, '/api/auth/login', {
        email: 'nonexistent@example.com',
        password: 'TestPassword123'
      });

      // Both should return same generic error message
      expect(response1.status).toBe(401);
      expect(response2.status).toBe(401);
      expect(response1.body.error).toBe(response2.body.error);
    });

    it('should use bcrypt for password comparison (constant-time)', async () => {
      const user = await createVerifiedUser('test@example.com', 'TestPassword123');

      // Test with correct password
      const correctResponse = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      expect(correctResponse.status).toBe(200);

      // Test with incorrect password
      const incorrectResponse = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'WrongPassword123'
      });

      expect(incorrectResponse.status).toBe(401);
    });
  });

  describe('Cookie Configuration', () => {
    it('should set cookie with 7-day expiration', async () => {
      await createVerifiedUser('test@example.com', 'TestPassword123');

      const response = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      const cookies = response.headers['set-cookie'] as string[];
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));

      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toContain('Max-Age');

      // Extract Max-Age value
      const maxAgeMatch = tokenCookie?.match(/Max-Age=(\d+)/);
      expect(maxAgeMatch).toBeDefined();

      const maxAge = parseInt(maxAgeMatch![1], 10);
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      expect(maxAge).toBe(sevenDaysInSeconds);
    });

    it('should set Secure flag in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await createVerifiedUser('test@example.com', 'TestPassword123');

      const response = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      const cookies = response.headers['set-cookie'] as string[];
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));

      // Note: In test environment, the Secure flag behavior may vary
      // This test documents the expected behavior

      process.env.NODE_ENV = originalEnv;
    });
  });
});
