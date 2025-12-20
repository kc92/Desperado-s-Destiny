/**
 * Two-Factor Authentication Integration Tests
 *
 * Tests the complete 2FA flow including:
 * - Setup initiation and QR code generation
 * - TOTP verification and enabling
 * - Login with 2FA
 * - Backup code usage
 * - 2FA disabling
 */

import request from 'supertest';
import speakeasy from 'speakeasy';
import { createTestApp } from '../testApp';
import { connectTestDB, disconnectTestDB, clearDatabase } from '../helpers/db.helpers';
import { hashPassword } from '../helpers/auth.helpers';
import {
  createAuthenticatedContext,
  enable2FAForUser,
  generateTOTPCode,
  cleanupContext,
  assert2FARequired,
  AuthenticatedContext,
} from '../helpers/integration.helpers';
import { User } from '../../src/models/User.model';

const app = createTestApp();

describe('Two-Factor Authentication Integration', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('2FA Status', () => {
    let context: AuthenticatedContext;

    beforeEach(async () => {
      context = await createAuthenticatedContext(app);
    });

    afterEach(async () => {
      await cleanupContext(context);
    });

    it('should return 2FA status as disabled for new users', async () => {
      const response = await context.agent
        .get('/api/auth/2fa/status')
        .set('Cookie', context.cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.enabled).toBe(false);
      expect(response.body.data.pendingSetup).toBe(false);
    });

    it('should return 2FA status as enabled after setup', async () => {
      await enable2FAForUser(context.user);

      const response = await context.agent
        .get('/api/auth/2fa/status')
        .set('Cookie', context.cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.enabled).toBe(true);
    });
  });

  describe('2FA Setup Flow', () => {
    let context: AuthenticatedContext;

    beforeEach(async () => {
      context = await createAuthenticatedContext(app);
    });

    afterEach(async () => {
      await cleanupContext(context);
    });

    it('should initiate 2FA setup and return QR code', async () => {
      const response = await context.agent
        .post('/api/auth/2fa/setup')
        .set('Cookie', context.cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.secret).toBeDefined();
      expect(response.body.data.qrCode).toBeDefined();
      expect(response.body.data.qrCode).toMatch(/^data:image\/png;base64,/);
      expect(response.body.data.backupCodes).toBeDefined();
      expect(response.body.data.backupCodes).toHaveLength(10);

      // Verify pending setup is marked
      const user = await User.findById(context.user._id);
      expect(user?.twoFactorPendingSetup).toBe(true);
    });

    it('should verify setup with valid TOTP code', async () => {
      // Initiate setup
      const setupResponse = await context.agent
        .post('/api/auth/2fa/setup')
        .set('Cookie', context.cookies);

      const { secret } = setupResponse.body.data;

      // Generate valid TOTP code
      const validCode = generateTOTPCode(secret);

      // Verify setup
      const verifyResponse = await context.agent
        .post('/api/auth/2fa/verify-setup')
        .set('Cookie', context.cookies)
        .send({ token: validCode });

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.success).toBe(true);

      // Verify 2FA is now enabled
      const user = await User.findById(context.user._id);
      expect(user?.twoFactorEnabled).toBe(true);
      expect(user?.twoFactorPendingSetup).toBe(false);
    });

    it('should reject setup verification with invalid code', async () => {
      // Initiate setup
      await context.agent
        .post('/api/auth/2fa/setup')
        .set('Cookie', context.cookies);

      // Try to verify with invalid code
      const verifyResponse = await context.agent
        .post('/api/auth/2fa/verify-setup')
        .set('Cookie', context.cookies)
        .send({ token: '000000' });

      expect(verifyResponse.status).toBe(400);
      expect(verifyResponse.body.success).toBe(false);

      // Verify 2FA is still not enabled
      const user = await User.findById(context.user._id);
      expect(user?.twoFactorEnabled).toBe(false);
    });

    it('should allow canceling pending setup', async () => {
      // Initiate setup
      await context.agent
        .post('/api/auth/2fa/setup')
        .set('Cookie', context.cookies);

      // Cancel setup
      const cancelResponse = await context.agent
        .post('/api/auth/2fa/cancel-setup')
        .set('Cookie', context.cookies);

      expect(cancelResponse.status).toBe(200);
      expect(cancelResponse.body.success).toBe(true);

      // Verify setup is canceled
      const user = await User.findById(context.user._id);
      expect(user?.twoFactorPendingSetup).toBe(false);
      expect(user?.twoFactorSecret).toBeUndefined();
    });
  });

  describe('Login with 2FA', () => {
    let email: string;
    let password: string;
    let secret: string;

    beforeEach(async () => {
      email = `test2fa${Date.now()}@example.com`;
      password = 'TestPassword123!';

      // Create user with 2FA enabled
      const passwordHash = await hashPassword(password);
      const user = await User.create({
        email,
        passwordHash,
        emailVerified: true,
        role: 'user',
      });

      secret = await enable2FAForUser(user);
    });

    it('should require 2FA for users with 2FA enabled', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.requires2FA).toBe(true);

      // Should have 2fa_pending cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const hasPendingCookie = cookies.some((c: string) => c.includes('2fa_pending'));
      expect(hasPendingCookie).toBe(true);
    });

    it('should complete login with valid 2FA code', async () => {
      // First, login to get 2FA pending state
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email, password });

      const cookies = loginResponse.headers['set-cookie'];

      // Generate valid TOTP
      const validCode = generateTOTPCode(secret);

      // Complete 2FA login
      const complete2FAResponse = await request(app)
        .post('/api/auth/2fa/complete-login')
        .set('Cookie', cookies)
        .send({ token: validCode });

      expect(complete2FAResponse.status).toBe(200);
      expect(complete2FAResponse.body.success).toBe(true);
      expect(complete2FAResponse.body.user).toBeDefined();

      // Should have auth token cookie
      const authCookies = complete2FAResponse.headers['set-cookie'];
      const hasTokenCookie = authCookies.some((c: string) => c.includes('token'));
      expect(hasTokenCookie).toBe(true);
    });

    it('should reject 2FA login with invalid code', async () => {
      // First, login to get 2FA pending state
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email, password });

      const cookies = loginResponse.headers['set-cookie'];

      // Try to complete with invalid code
      const complete2FAResponse = await request(app)
        .post('/api/auth/2fa/complete-login')
        .set('Cookie', cookies)
        .send({ token: '000000' });

      expect(complete2FAResponse.status).toBe(401);
      expect(complete2FAResponse.body.success).toBe(false);
    });
  });

  describe('Backup Codes', () => {
    let email: string;
    let password: string;
    let secret: string;
    let context: AuthenticatedContext;

    beforeEach(async () => {
      context = await createAuthenticatedContext(app);
      email = context.user.email;
      password = 'TestPassword123!';

      // Enable 2FA for the user
      secret = await enable2FAForUser(context.user);
    });

    afterEach(async () => {
      await cleanupContext(context);
    });

    it('should regenerate backup codes', async () => {
      const response = await context.agent
        .post('/api/auth/2fa/backup-codes')
        .set('Cookie', context.cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.backupCodes).toBeDefined();
      expect(response.body.data.backupCodes).toHaveLength(10);
    });
  });

  describe('Disable 2FA', () => {
    let context: AuthenticatedContext;
    const password = 'TestPassword123!';

    beforeEach(async () => {
      context = await createAuthenticatedContext(app, { password });
      await enable2FAForUser(context.user);
    });

    afterEach(async () => {
      await cleanupContext(context);
    });

    it('should disable 2FA with correct password', async () => {
      const response = await context.agent
        .post('/api/auth/2fa/disable')
        .set('Cookie', context.cookies)
        .send({ password });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify 2FA is disabled
      const user = await User.findById(context.user._id);
      expect(user?.twoFactorEnabled).toBe(false);
      expect(user?.twoFactorSecret).toBeUndefined();
    });

    it('should reject disable with incorrect password', async () => {
      const response = await context.agent
        .post('/api/auth/2fa/disable')
        .set('Cookie', context.cookies)
        .send({ password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);

      // Verify 2FA is still enabled
      const user = await User.findById(context.user._id).select('+twoFactorEnabled');
      expect(user?.twoFactorEnabled).toBe(true);
    });
  });

  describe('Security Edge Cases', () => {
    it('should not allow 2FA setup without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/2fa/setup');

      expect(response.status).toBe(401);
    });

    it('should not allow 2FA status check without authentication', async () => {
      const response = await request(app)
        .get('/api/auth/2fa/status');

      expect(response.status).toBe(401);
    });

    it('should not allow re-setup if 2FA is already enabled', async () => {
      const context = await createAuthenticatedContext(app);
      await enable2FAForUser(context.user);

      const response = await context.agent
        .post('/api/auth/2fa/setup')
        .set('Cookie', context.cookies);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already enabled');

      await cleanupContext(context);
    });
  });
});
