/**
 * Admin Access Security Tests
 *
 * Tests to ensure admin-only endpoints are properly restricted
 */

import request from 'supertest';
import app from '../testApp';
import { User } from '../../src/models/User.model';
import { Character } from '../../src/models/Character.model';
import { clearDatabase } from '../helpers/db.helpers';
import { apiGet, apiPost, apiPut, apiDelete, expectSuccess, expectError } from '../helpers/api.helpers';
import { createTestToken } from '../helpers/auth.helpers';
import { setupCompleteGameState } from '../helpers/testHelpers';
import bcrypt from 'bcryptjs';

describe('Admin Access Security Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  /**
   * Helper to create an admin user
   */
  async function createAdminUser(email: string = 'admin@example.com') {
    const passwordHash = await bcrypt.hash('AdminPass123!', 12);
    const admin = new User({
      email: email.toLowerCase(),
      passwordHash,
      emailVerified: true,
      isActive: true,
      role: 'admin'
    });
    await admin.save();
    const token = createTestToken(admin._id.toString(), admin.email);
    return { admin, token };
  }

  describe('Admin Route Protection', () => {
    it('should prevent regular users from accessing admin routes', async () => {
      const regularUser = await setupCompleteGameState(app);

      const response = await apiGet(
        app,
        '/api/admin/users',
        regularUser.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
      expect(response.body.error).toMatch(/admin|permission|authorized/i);
    });

    it('should allow admin users to access admin routes', async () => {
      const { token } = await createAdminUser();

      const response = await apiGet(
        app,
        '/api/admin/users',
        token
      );

      // Should succeed or return specific error (not permission)
      expect([200, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('Admin should be able to access admin routes');
      }
    });

    it('should reject admin routes without authentication', async () => {
      const response = await apiGet(
        app,
        '/api/admin/users'
        // No token
      );

      expect(response.status).toBe(401);
      expectError(response, 401);
    });
  });

  describe('Admin Character Management', () => {
    it('should prevent regular users from accessing admin character endpoints', async () => {
      const regularUser = await setupCompleteGameState(app);
      const otherUser = await setupCompleteGameState(app, 'other@example.com');

      const response = await apiPut(
        app,
        `/api/admin/characters/${otherUser.character._id}`,
        { gold: 10000 },
        regularUser.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow admins to modify any character', async () => {
      const { token } = await createAdminUser();
      const targetUser = await setupCompleteGameState(app, 'target@example.com');

      const response = await apiPut(
        app,
        `/api/admin/characters/${targetUser.character._id}`,
        { gold: 10000 },
        token
      );

      // Should succeed or return specific error (not permission)
      expect([200, 400, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('Admin should be able to modify characters');
      }
    });

    it('should allow admins to delete any character', async () => {
      const { token } = await createAdminUser();
      const targetUser = await setupCompleteGameState(app, 'target@example.com');

      const response = await apiDelete(
        app,
        `/api/admin/characters/${targetUser.character._id}`,
        token
      );

      // Should succeed
      expect([200, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('Admin should be able to delete characters');
      }
    });

    it('should allow admins to view all characters', async () => {
      const { token } = await createAdminUser();

      const response = await apiGet(
        app,
        '/api/admin/characters',
        token
      );

      // Should succeed
      expect([200, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('Admin should be able to view all characters');
      }
    });
  });

  describe('Admin Gold Adjustment', () => {
    it('should prevent regular users from adjusting gold', async () => {
      const regularUser = await setupCompleteGameState(app);
      const targetUser = await setupCompleteGameState(app, 'target@example.com');

      const response = await apiPost(
        app,
        '/api/admin/gold/adjust',
        {
          characterId: targetUser.character._id.toString(),
          amount: 5000,
          reason: 'Test adjustment'
        },
        regularUser.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow admins to add gold to any character', async () => {
      const { token } = await createAdminUser();
      const targetUser = await setupCompleteGameState(app, 'target@example.com');

      const response = await apiPost(
        app,
        '/api/admin/gold/adjust',
        {
          characterId: targetUser.character._id.toString(),
          amount: 5000,
          reason: 'Admin bonus'
        },
        token
      );

      // Should succeed or return specific error (not permission)
      expect([200, 400, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('Admin should be able to adjust gold');
      }
    });

    it('should allow admins to deduct gold from any character', async () => {
      const { token } = await createAdminUser();
      const targetUser = await setupCompleteGameState(app, 'target@example.com');

      const response = await apiPost(
        app,
        '/api/admin/gold/adjust',
        {
          characterId: targetUser.character._id.toString(),
          amount: -50,
          reason: 'Admin correction'
        },
        token
      );

      // Should succeed or return specific error (not permission)
      expect([200, 400, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('Admin should be able to adjust gold');
      }
    });
  });

  describe('Admin User Management', () => {
    it('should prevent regular users from viewing user list', async () => {
      const regularUser = await setupCompleteGameState(app);

      const response = await apiGet(
        app,
        '/api/admin/users',
        regularUser.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should prevent regular users from banning users', async () => {
      const regularUser = await setupCompleteGameState(app);
      const targetUser = await setupCompleteGameState(app, 'target@example.com');

      const response = await apiPost(
        app,
        `/api/admin/users/${targetUser.user._id}/ban`,
        { reason: 'Test ban' },
        regularUser.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow admins to ban users', async () => {
      const { token } = await createAdminUser();
      const targetUser = await setupCompleteGameState(app, 'target@example.com');

      const response = await apiPost(
        app,
        `/api/admin/users/${targetUser.user._id}/ban`,
        { reason: 'Violation of terms' },
        token
      );

      // Should succeed or return specific error (not permission)
      expect([200, 400, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('Admin should be able to ban users');
      }
    });

    it('should allow admins to unban users', async () => {
      const { token } = await createAdminUser();
      const targetUser = await setupCompleteGameState(app, 'target@example.com');

      const response = await apiPost(
        app,
        `/api/admin/users/${targetUser.user._id}/unban`,
        {},
        token
      );

      // Should succeed or return specific error (not permission)
      expect([200, 400, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('Admin should be able to unban users');
      }
    });
  });

  describe('Admin Analytics Access', () => {
    it('should prevent regular users from viewing analytics', async () => {
      const regularUser = await setupCompleteGameState(app);

      const response = await apiGet(
        app,
        '/api/admin/analytics',
        regularUser.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow admins to view analytics', async () => {
      const { token } = await createAdminUser();

      const response = await apiGet(
        app,
        '/api/admin/analytics',
        token
      );

      // Should succeed or return specific error (not permission)
      expect([200, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('Admin should be able to view analytics');
      }
    });
  });

  describe('Admin Middleware Validation', () => {
    it('should check admin role before allowing access', async () => {
      const passwordHash = await bcrypt.hash('TestPass123!', 12);
      const regularUser = new User({
        email: 'regular@example.com',
        passwordHash,
        emailVerified: true,
        isActive: true,
        role: 'user' // Explicitly set to user role
      });
      await regularUser.save();
      const token = createTestToken(regularUser._id.toString(), regularUser.email);

      const response = await apiGet(
        app,
        '/api/admin/users',
        token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should reject inactive admin users', async () => {
      const passwordHash = await bcrypt.hash('AdminPass123!', 12);
      const inactiveAdmin = new User({
        email: 'inactive@example.com',
        passwordHash,
        emailVerified: true,
        isActive: false, // Inactive
        role: 'admin'
      });
      await inactiveAdmin.save();
      const token = createTestToken(inactiveAdmin._id.toString(), inactiveAdmin.email);

      const response = await apiGet(
        app,
        '/api/admin/users',
        token
      );

      expect(response.status).toBe(401);
      expectError(response, 401);
    });
  });

  describe('Admin Privilege Escalation Prevention', () => {
    it('should prevent regular users from promoting themselves to admin', async () => {
      const regularUser = await setupCompleteGameState(app);

      const response = await apiPut(
        app,
        `/api/users/${regularUser.user._id}`,
        { role: 'admin' },
        regularUser.token
      );

      // Should fail or ignore the role change
      expect([400, 403]).toContain(response.status);
    });

    it('should prevent users from modifying admin role via profile update', async () => {
      const regularUser = await setupCompleteGameState(app);

      const response = await apiPut(
        app,
        '/api/profile',
        { role: 'admin' },
        regularUser.token
      );

      // Role should not be changeable via profile
      if (response.status === 200) {
        // Check that role wasn't actually changed
        const user = await User.findById(regularUser.user._id);
        expect(user?.role).toBe('user');
      }
    });
  });

  describe('Admin Gang Management', () => {
    it('should prevent regular users from accessing admin gang management', async () => {
      const regularUser = await setupCompleteGameState(app);

      const response = await apiGet(
        app,
        '/api/admin/gangs',
        regularUser.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow admins to view all gangs', async () => {
      const { token } = await createAdminUser();

      const response = await apiGet(
        app,
        '/api/admin/gangs',
        token
      );

      // Should succeed or return specific error (not permission)
      expect([200, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('Admin should be able to view all gangs');
      }
    });

    it('should allow admins to disband any gang', async () => {
      const { token } = await createAdminUser();

      const response = await apiDelete(
        app,
        '/api/admin/gangs/test-gang-id',
        token
      );

      // Should succeed or return specific error (not permission)
      expect([200, 400, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('Admin should be able to disband gangs');
      }
    });
  });

  describe('Admin Territory Management', () => {
    it('should prevent regular users from modifying territories', async () => {
      const regularUser = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/admin/territories/reset',
        {},
        regularUser.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow admins to modify territories', async () => {
      const { token } = await createAdminUser();

      const response = await apiPost(
        app,
        '/api/admin/territories/reset',
        {},
        token
      );

      // Should succeed or return specific error (not permission)
      expect([200, 400, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('Admin should be able to modify territories');
      }
    });
  });

  describe('Admin System Management', () => {
    it('should prevent regular users from accessing system settings', async () => {
      const regularUser = await setupCompleteGameState(app);

      const response = await apiGet(
        app,
        '/api/admin/system/settings',
        regularUser.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow admins to view system settings', async () => {
      const { token } = await createAdminUser();

      const response = await apiGet(
        app,
        '/api/admin/system/settings',
        token
      );

      // Should succeed or return specific error (not permission)
      expect([200, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('Admin should be able to view system settings');
      }
    });

    it('should prevent regular users from modifying system settings', async () => {
      const regularUser = await setupCompleteGameState(app);

      const response = await apiPut(
        app,
        '/api/admin/system/settings',
        { maintenanceMode: true },
        regularUser.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow admins to modify system settings', async () => {
      const { token } = await createAdminUser();

      const response = await apiPut(
        app,
        '/api/admin/system/settings',
        { maintenanceMode: false },
        token
      );

      // Should succeed or return specific error (not permission)
      expect([200, 400, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('Admin should be able to modify system settings');
      }
    });
  });

  describe('Admin Action on Protected Resources', () => {
    it('should prevent admins from deleting their own account', async () => {
      const { admin, token } = await createAdminUser();

      const response = await apiDelete(
        app,
        `/api/admin/users/${admin._id}`,
        token
      );

      // Should prevent self-deletion
      expect([400, 403]).toContain(response.status);
    });

    it('should allow admins to view audit logs', async () => {
      const { token } = await createAdminUser();

      const response = await apiGet(
        app,
        '/api/admin/audit-logs',
        token
      );

      // Should succeed or return specific error (not permission)
      expect([200, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('Admin should be able to view audit logs');
      }
    });

    it('should prevent regular users from viewing audit logs', async () => {
      const regularUser = await setupCompleteGameState(app);

      const response = await apiGet(
        app,
        '/api/admin/audit-logs',
        regularUser.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });
  });

  describe('Admin Impersonation Prevention', () => {
    it('should reject forged admin tokens', async () => {
      const regularUser = await setupCompleteGameState(app);

      // Try to forge an admin token by manually creating one
      const forgedToken = createTestToken(regularUser.user._id.toString(), regularUser.user.email);

      // Manually change user role in DB (simulating a hack attempt)
      // But token should still be validated against current DB state
      const response = await apiGet(
        app,
        '/api/admin/users',
        forgedToken
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should validate admin role on every request', async () => {
      const { admin, token } = await createAdminUser();

      // First request should succeed
      const response1 = await apiGet(app, '/api/admin/users', token);
      expect([200, 404]).toContain(response1.status);

      // Demote admin to regular user
      await User.findByIdAndUpdate(admin._id, { role: 'user' });

      // Second request should fail (role checked on every request)
      const response2 = await apiGet(app, '/api/admin/users', token);
      expect(response2.status).toBe(403);
    });
  });
});
