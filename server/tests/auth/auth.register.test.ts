/**
 * Authentication Registration Tests
 *
 * Tests for user registration endpoint
 */

import request from 'supertest';
import app from '../testApp';
import { User } from '../../src/models/User.model';
import { clearDatabase } from '../helpers/db.helpers';
import { apiPost, expectSuccess, expectError } from '../helpers/api.helpers';

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Successful Registration', () => {
    it('should successfully register a new user with valid credentials', async () => {
      const response = await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      expect(response.status).toBe(201);
      expectSuccess(response);
      expect(response.body.message).toContain('verification');

      // Verify user was created in database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
      expect(user?.emailVerified).toBe(false);
      expect(user?.verificationToken).toBeDefined();
      expect(user?.verificationTokenExpiry).toBeDefined();
    });

    it('should create user with lowercase email', async () => {
      const response = await apiPost(app, '/api/auth/register', {
        email: 'TEST@EXAMPLE.COM',
        password: 'TestPassword123'
      });

      expect(response.status).toBe(201);

      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should hash the password', async () => {
      await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      const user = await User.findOne({ email: 'test@example.com' }).select('+passwordHash');
      expect(user).toBeDefined();
      expect(user?.passwordHash).toBeDefined();
      expect(user?.passwordHash).not.toBe('TestPassword123');
      expect(user?.passwordHash.length).toBeGreaterThan(50); // bcrypt hash is longer
    });

    it('should generate verification token', async () => {
      const response = await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      const user = await User.findOne({ email: 'test@example.com' });
      expect(user?.verificationToken).toBeDefined();
      expect(user?.verificationToken?.length).toBe(64); // 32 bytes hex = 64 chars
      expect(user?.verificationTokenExpiry).toBeDefined();

      // Verify expiry is approximately 24 hours from now
      const expiryTime = user?.verificationTokenExpiry?.getTime() || 0;
      const expectedExpiry = Date.now() + (24 * 60 * 60 * 1000);
      expect(expiryTime).toBeGreaterThan(Date.now());
      expect(expiryTime).toBeLessThan(expectedExpiry + 60000); // Within 1 minute tolerance
    });

    it('should return verification token in development mode', async () => {
      process.env.NODE_ENV = 'development';

      const response = await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      expect(response.status).toBe(201);
      expect(response.body.data.verificationToken).toBeDefined();
    });

    it('should not auto-login user after registration', async () => {
      const response = await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      expect(response.status).toBe(201);
      expect(response.headers['set-cookie']).toBeUndefined();
      expect(response.body.user).toBeUndefined();
    });
  });

  describe('Validation Errors', () => {
    it('should reject registration with duplicate email', async () => {
      // Create first user
      await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      // Try to register with same email
      const response = await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'AnotherPassword123'
      });

      expect(response.status).toBe(409);
      expectError(response, 409);
      expect(response.body.error).toContain('already registered');
    });

    it('should reject registration with duplicate email (case insensitive)', async () => {
      await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      const response = await apiPost(app, '/api/auth/register', {
        email: 'TEST@EXAMPLE.COM',
        password: 'AnotherPassword123'
      });

      expect(response.status).toBe(409);
      expectError(response, 409);
    });

    it('should reject invalid email format', async () => {
      const response = await apiPost(app, '/api/auth/register', {
        email: 'invalid-email',
        password: 'TestPassword123'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('Email');
    });

    it('should reject email that is too short', async () => {
      const response = await apiPost(app, '/api/auth/register', {
        email: 'a@b.c',
        password: 'TestPassword123'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
    });

    it('should reject missing email', async () => {
      const response = await apiPost(app, '/api/auth/register', {
        password: 'TestPassword123'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
    });

    it('should reject empty email', async () => {
      const response = await apiPost(app, '/api/auth/register', {
        email: '',
        password: 'TestPassword123'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
    });
  });

  describe('Password Validation', () => {
    it('should reject password that is too short', async () => {
      const response = await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'Test1'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('at least 8 characters');
    });

    it('should reject password without uppercase letter', async () => {
      const response = await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'testpassword123'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('uppercase');
    });

    it('should reject password without lowercase letter', async () => {
      const response = await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'TESTPASSWORD123'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('lowercase');
    });

    it('should reject password without number', async () => {
      const response = await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'TestPassword'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('number');
    });

    it('should reject missing password', async () => {
      const response = await apiPost(app, '/api/auth/register', {
        email: 'test@example.com'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
    });

    it('should reject empty password', async () => {
      const response = await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: ''
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
    });

    it('should accept password that meets all requirements', async () => {
      const response = await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      expect(response.status).toBe(201);
      expectSuccess(response);
    });
  });

  describe('User Properties', () => {
    it('should create user with default role of "user"', async () => {
      await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      const user = await User.findOne({ email: 'test@example.com' });
      expect(user?.role).toBe('user');
    });

    it('should create user with isActive set to true', async () => {
      await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      const user = await User.findOne({ email: 'test@example.com' });
      expect(user?.isActive).toBe(true);
    });

    it('should create user with createdAt timestamp', async () => {
      const beforeTime = Date.now();

      await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      const afterTime = Date.now();
      const user = await User.findOne({ email: 'test@example.com' });

      expect(user?.createdAt).toBeDefined();
      const createdTime = user?.createdAt.getTime() || 0;
      expect(createdTime).toBeGreaterThanOrEqual(beforeTime);
      expect(createdTime).toBeLessThanOrEqual(afterTime);
    });
  });
});
