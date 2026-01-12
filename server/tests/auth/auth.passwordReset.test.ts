/**
 * Authentication Password Reset Tests
 *
 * Tests for password reset functionality
 */

import request from 'supertest';
import app from '../testApp';
import { User } from '../../src/models/User.model';
import { clearDatabase } from '../helpers/db.helpers';
import { apiPost, expectSuccess, expectError } from '../helpers/api.helpers';
import bcrypt from 'bcryptjs';

describe('Password Reset', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  /**
   * Helper function to create a verified user
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

  describe('POST /api/auth/forgot-password', () => {
    it('should generate reset token for existing user', async () => {
      await createVerifiedUser('test@example.com', 'OldPassword123');

      const response = await apiPost(app, '/api/auth/forgot-password', {
        email: 'test@example.com'
      });

      expect(response.status).toBe(200);
      expectSuccess(response);
      expect(response.body.message).toContain('reset link');

      // Verify reset token was generated
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user?.resetPasswordToken).toBeDefined();
      expect(user?.resetPasswordToken?.length).toBe(64); // 32 bytes hex = 64 chars
      expect(user?.resetPasswordExpiry).toBeDefined();
    });

    it('should set reset token expiry to 1 hour', async () => {
      await createVerifiedUser('test@example.com', 'OldPassword123');

      await apiPost(app, '/api/auth/forgot-password', {
        email: 'test@example.com'
      });

      const user = await User.findOne({ email: 'test@example.com' });
      const expiryTime = user?.resetPasswordExpiry?.getTime() || 0;
      const expectedExpiry = Date.now() + (60 * 60 * 1000); // 1 hour

      expect(expiryTime).toBeGreaterThan(Date.now());
      expect(expiryTime).toBeLessThan(expectedExpiry + 60000); // Within 1 minute tolerance
    });

    it('should return reset token in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      try {
        await createVerifiedUser('test@example.com', 'OldPassword123');

        const response = await apiPost(app, '/api/auth/forgot-password', {
          email: 'test@example.com'
        });

        expect(response.status).toBe(200);
        expect(response.body.data.resetToken).toBeDefined();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should always return success even for non-existent email', async () => {
      const response = await apiPost(app, '/api/auth/forgot-password', {
        email: 'nonexistent@example.com'
      });

      expect(response.status).toBe(200);
      expectSuccess(response);
      expect(response.body.message).toContain('reset link');
    });

    it('should not leak whether email exists', async () => {
      await createVerifiedUser('test@example.com', 'OldPassword123');

      const existingEmailResponse = await apiPost(app, '/api/auth/forgot-password', {
        email: 'test@example.com'
      });

      const nonExistentEmailResponse = await apiPost(app, '/api/auth/forgot-password', {
        email: 'nonexistent@example.com'
      });

      // Both should return same status and message
      expect(existingEmailResponse.status).toBe(nonExistentEmailResponse.status);
      expect(existingEmailResponse.body.message).toBe(nonExistentEmailResponse.body.message);
    });

    it('should reject request with missing email', async () => {
      const response = await apiPost(app, '/api/auth/forgot-password', {});

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('required');
    });

    it('should reject request with empty email', async () => {
      const response = await apiPost(app, '/api/auth/forgot-password', {
        email: ''
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
    });

    it('should handle case-insensitive email', async () => {
      await createVerifiedUser('test@example.com', 'OldPassword123');

      const response = await apiPost(app, '/api/auth/forgot-password', {
        email: 'TEST@EXAMPLE.COM'
      });

      expect(response.status).toBe(200);

      const user = await User.findOne({ email: 'test@example.com' });
      expect(user?.resetPasswordToken).toBeDefined();
    });

    it('should overwrite previous reset token', async () => {
      const user = await createVerifiedUser('test@example.com', 'OldPassword123');

      // First reset request
      await apiPost(app, '/api/auth/forgot-password', {
        email: 'test@example.com'
      });

      const firstUser = await User.findOne({ email: 'test@example.com' });
      const firstToken = firstUser?.resetPasswordToken;

      // Second reset request
      await apiPost(app, '/api/auth/forgot-password', {
        email: 'test@example.com'
      });

      const secondUser = await User.findOne({ email: 'test@example.com' });
      const secondToken = secondUser?.resetPasswordToken;

      expect(firstToken).toBeDefined();
      expect(secondToken).toBeDefined();
      expect(firstToken).not.toBe(secondToken);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const user = await createVerifiedUser('test@example.com', 'OldPassword123');

      // Generate reset token
      const resetToken = user.generateResetToken();
      await user.save();

      // Reset password
      const response = await apiPost(app, '/api/auth/reset-password', {
        token: resetToken,
        newPassword: 'NewPassword456'
      });

      expect(response.status).toBe(200);
      expectSuccess(response);
      expect(response.body.message).toContain('reset successfully');

      // Verify password was changed
      const updatedUser = await User.findById(user._id).select('+passwordHash');
      const isMatch = await bcrypt.compare('NewPassword456', updatedUser!.passwordHash);
      expect(isMatch).toBe(true);

      // Verify old password no longer works
      const oldPasswordMatch = await bcrypt.compare('OldPassword123', updatedUser!.passwordHash);
      expect(oldPasswordMatch).toBe(false);
    });

    it('should clear reset token after successful reset', async () => {
      const user = await createVerifiedUser('test@example.com', 'OldPassword123');
      const resetToken = user.generateResetToken();
      await user.save();

      await apiPost(app, '/api/auth/reset-password', {
        token: resetToken,
        newPassword: 'NewPassword456'
      });

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.resetPasswordToken).toBeUndefined();
      expect(updatedUser?.resetPasswordExpiry).toBeUndefined();
    });

    it('should hash the new password', async () => {
      const user = await createVerifiedUser('test@example.com', 'OldPassword123');
      const resetToken = user.generateResetToken();
      await user.save();

      await apiPost(app, '/api/auth/reset-password', {
        token: resetToken,
        newPassword: 'NewPassword456'
      });

      const updatedUser = await User.findById(user._id).select('+passwordHash');
      expect(updatedUser?.passwordHash).not.toBe('NewPassword456');
      expect(updatedUser?.passwordHash.length).toBeGreaterThan(50);
    });

    it('should allow login with new password after reset', async () => {
      const user = await createVerifiedUser('test@example.com', 'OldPassword123');
      const resetToken = user.generateResetToken();
      await user.save();

      // Reset password
      await apiPost(app, '/api/auth/reset-password', {
        token: resetToken,
        newPassword: 'NewPassword456'
      });

      // Try to login with new password
      const loginResponse = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'NewPassword456'
      });

      expect(loginResponse.status).toBe(200);
      expectSuccess(loginResponse);
    });

    it('should reject login with old password after reset', async () => {
      const user = await createVerifiedUser('test@example.com', 'OldPassword123');
      const resetToken = user.generateResetToken();
      await user.save();

      // Reset password
      await apiPost(app, '/api/auth/reset-password', {
        token: resetToken,
        newPassword: 'NewPassword456'
      });

      // Try to login with old password
      const loginResponse = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'OldPassword123'
      });

      expect(loginResponse.status).toBe(401);
      expectError(loginResponse, 401);
    });

    it('should reject invalid reset token', async () => {
      await createVerifiedUser('test@example.com', 'OldPassword123');

      const response = await apiPost(app, '/api/auth/reset-password', {
        token: 'invalid-token-123',
        newPassword: 'NewPassword456'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('Invalid');
    });

    it('should reject expired reset token', async () => {
      const user = await createVerifiedUser('test@example.com', 'OldPassword123');
      const resetToken = user.generateResetToken();

      // Set expiry to past
      user.resetPasswordExpiry = new Date(Date.now() - 60000);
      await user.save();

      const response = await apiPost(app, '/api/auth/reset-password', {
        token: resetToken,
        newPassword: 'NewPassword456'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('expired');
    });

    it('should reject reset with missing token', async () => {
      const response = await apiPost(app, '/api/auth/reset-password', {
        newPassword: 'NewPassword456'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('required');
    });

    it('should reject reset with missing password', async () => {
      const user = await createVerifiedUser('test@example.com', 'OldPassword123');
      const resetToken = user.generateResetToken();
      await user.save();

      const response = await apiPost(app, '/api/auth/reset-password', {
        token: resetToken
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('required');
    });

    it('should validate new password strength', async () => {
      const user = await createVerifiedUser('test@example.com', 'OldPassword123');
      const resetToken = user.generateResetToken();
      await user.save();

      const response = await apiPost(app, '/api/auth/reset-password', {
        token: resetToken,
        newPassword: 'weak'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('at least 8 characters');
    });

    it('should require uppercase in new password', async () => {
      const user = await createVerifiedUser('test@example.com', 'OldPassword123');
      const resetToken = user.generateResetToken();
      await user.save();

      const response = await apiPost(app, '/api/auth/reset-password', {
        token: resetToken,
        newPassword: 'newpassword123'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('uppercase');
    });

    it('should require lowercase in new password', async () => {
      const user = await createVerifiedUser('test@example.com', 'OldPassword123');
      const resetToken = user.generateResetToken();
      await user.save();

      const response = await apiPost(app, '/api/auth/reset-password', {
        token: resetToken,
        newPassword: 'NEWPASSWORD123'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('lowercase');
    });

    it('should require number in new password', async () => {
      const user = await createVerifiedUser('test@example.com', 'OldPassword123');
      const resetToken = user.generateResetToken();
      await user.save();

      const response = await apiPost(app, '/api/auth/reset-password', {
        token: resetToken,
        newPassword: 'NewPassword'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('number');
    });

    it('should not allow reuse of reset token', async () => {
      const user = await createVerifiedUser('test@example.com', 'OldPassword123');
      const resetToken = user.generateResetToken();
      await user.save();

      // First reset
      await apiPost(app, '/api/auth/reset-password', {
        token: resetToken,
        newPassword: 'NewPassword456'
      });

      // Try to use same token again
      const response = await apiPost(app, '/api/auth/reset-password', {
        token: resetToken,
        newPassword: 'AnotherPassword789'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
    });
  });

  describe('Email Verification', () => {
    it('should verify email with valid token', async () => {
      // Register user
      const registerResponse = await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      const verificationToken = registerResponse.body.verificationToken;

      // Verify email
      const response = await apiPost(app, '/api/auth/verify-email', {
        token: verificationToken
      });

      expect(response.status).toBe(200);
      expectSuccess(response);
      expect(response.body.message).toContain('verified successfully');

      // Check user is verified
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user?.emailVerified).toBe(true);
      expect(user?.verificationToken).toBeUndefined();
      expect(user?.verificationTokenExpiry).toBeUndefined();
    });

    it('should reject invalid verification token', async () => {
      const response = await apiPost(app, '/api/auth/verify-email', {
        token: 'invalid-token'
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('Invalid');
    });

    it('should reject expired verification token', async () => {
      const passwordHash = await bcrypt.hash('TestPassword123', 12);
      const user = new User({
        email: 'test@example.com',
        passwordHash,
        emailVerified: false,
        isActive: true,
        role: 'user'
      });

      const verificationToken = user.generateVerificationToken();
      user.verificationTokenExpiry = new Date(Date.now() - 60000); // Expired
      await user.save();

      const response = await apiPost(app, '/api/auth/verify-email', {
        token: verificationToken
      });

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('expired');
    });

    it('should reject missing verification token', async () => {
      const response = await apiPost(app, '/api/auth/verify-email', {});

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toContain('required');
    });

    it('should allow login after email verification', async () => {
      // Register user
      const registerResponse = await apiPost(app, '/api/auth/register', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      const verificationToken = registerResponse.body.verificationToken;

      // Verify email
      await apiPost(app, '/api/auth/verify-email', {
        token: verificationToken
      });

      // Try to login
      const loginResponse = await apiPost(app, '/api/auth/login', {
        email: 'test@example.com',
        password: 'TestPassword123'
      });

      expect(loginResponse.status).toBe(200);
      expectSuccess(loginResponse);
    });
  });

  describe('Logout', () => {
    it('should clear authentication cookie', async () => {
      const response = await apiPost(app, '/api/auth/logout', {});

      expect(response.status).toBe(200);
      expectSuccess(response);
      expect(response.body.message).toContain('Logged out');

      // Check cookie is cleared
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        const tokenCookie = Array.isArray(cookies)
          ? cookies.find(c => c.startsWith('token='))
          : cookies;

        if (tokenCookie) {
          // Cookie should be expired or empty
          expect(
            tokenCookie.includes('Max-Age=0') ||
            tokenCookie.includes('Expires=') ||
            tokenCookie.startsWith('token=;')
          ).toBe(true);
        }
      }
    });
  });
});
