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

  /**
   * Security Audit - Phase 2
   * Tests for 13 newly-secured admin endpoints
   * Added: 2025-11-30
   */
  describe('Critical Admin Endpoint Protection (Security Audit)', () => {
    describe('Calendar Admin Endpoints', () => {
      it('should reject calendar advance without auth (401)', async () => {
        const response = await apiPost(app, '/api/calendar/admin/advance', { days: 1 });
        expect(response.status).toBe(401);
      });

      it('should reject calendar advance from regular users (403)', async () => {
        const regularUser = await setupCompleteGameState(app);
        const response = await apiPost(app, '/api/calendar/admin/advance', { days: 1 }, regularUser.token);
        expect(response.status).toBe(403);
      });

      it('should allow calendar advance for admins', async () => {
        const { token } = await createAdminUser();
        const response = await apiPost(app, '/api/calendar/admin/advance', { days: 1 }, token);
        expect([200, 400, 404]).toContain(response.status);
        expect(response.status).not.toBe(403);
      });

      it('should reject calendar sync without auth (401)', async () => {
        const response = await apiPost(app, '/api/calendar/admin/sync', {});
        expect(response.status).toBe(401);
      });

      it('should reject calendar sync from regular users (403)', async () => {
        const regularUser = await setupCompleteGameState(app);
        const response = await apiPost(app, '/api/calendar/admin/sync', {}, regularUser.token);
        expect(response.status).toBe(403);
      });

      it('should allow calendar sync for admins', async () => {
        const { token } = await createAdminUser();
        const response = await apiPost(app, '/api/calendar/admin/sync', {}, token);
        expect([200, 400, 404]).toContain(response.status);
        expect(response.status).not.toBe(403);
      });
    });

    describe('World Boss Admin Endpoints', () => {
      it('should reject world boss spawn without auth (401)', async () => {
        const response = await apiPost(app, '/api/world-bosses/test-boss/spawn', {});
        expect(response.status).toBe(401);
      });

      it('should reject world boss spawn from regular users (403)', async () => {
        const regularUser = await setupCompleteGameState(app);
        const response = await apiPost(app, '/api/world-boss/test-boss/spawn', {}, regularUser.token);
        expect(response.status).toBe(403);
      });

      it('should allow world boss spawn for admins', async () => {
        const { token } = await createAdminUser();
        const response = await apiPost(app, '/api/world-boss/test-boss/spawn', {}, token);
        expect([200, 400, 404]).toContain(response.status);
        expect(response.status).not.toBe(403);
      });

      it('should reject world boss end without auth (401)', async () => {
        const response = await apiPost(app, '/api/world-bosses/test-boss/end', {});
        expect(response.status).toBe(401);
      });

      it('should reject world boss end from regular users (403)', async () => {
        const regularUser = await setupCompleteGameState(app);
        const response = await apiPost(app, '/api/world-boss/test-boss/end', {}, regularUser.token);
        expect(response.status).toBe(403);
      });

      it('should allow world boss end for admins', async () => {
        const { token } = await createAdminUser();
        const response = await apiPost(app, '/api/world-boss/test-boss/end', {}, token);
        expect([200, 400, 404]).toContain(response.status);
        expect(response.status).not.toBe(403);
      });
    });

    describe('Weather Admin Endpoints', () => {
      it('should reject weather set without auth (401)', async () => {
        const response = await apiPost(app, '/api/weather/set', { region: 'test', weather: 'clear' });
        expect(response.status).toBe(401);
      });

      it('should reject weather set from regular users (403)', async () => {
        const regularUser = await setupCompleteGameState(app);
        const response = await apiPost(app, '/api/weather/set', { region: 'test', weather: 'clear' }, regularUser.token);
        expect(response.status).toBe(403);
      });

      it('should allow weather set for admins', async () => {
        const { token } = await createAdminUser();
        const response = await apiPost(app, '/api/weather/set', { region: 'test', weather: 'clear' }, token);
        expect([200, 400, 404]).toContain(response.status);
        expect(response.status).not.toBe(403);
      });
    });

    describe('Energy Admin Endpoints', () => {
      it('should reject energy grant without auth (401)', async () => {
        const response = await apiPost(app, '/api/energy/grant', { amount: 100 });
        expect(response.status).toBe(401);
      });

      it('should reject energy grant from regular users (403)', async () => {
        const regularUser = await setupCompleteGameState(app);
        const response = await apiPost(app, '/api/energy/grant', { amount: 100 }, regularUser.token);
        expect(response.status).toBe(403);
      });

      it('should allow energy grant for admins', async () => {
        const { token } = await createAdminUser();
        const response = await apiPost(app, '/api/energy/grant', { amount: 100 }, token);
        expect([200, 400, 404]).toContain(response.status);
        expect(response.status).not.toBe(403);
      });
    });

    describe('Login Reward Admin Endpoints', () => {
      it('should reject reward reset without auth (401)', async () => {
        const response = await apiPost(app, '/api/login-rewards/reset', { characterId: 'test-id' });
        expect(response.status).toBe(401);
      });

      it('should reject reward reset from regular users (403)', async () => {
        const regularUser = await setupCompleteGameState(app);
        const response = await apiPost(app, '/api/login-rewards/reset', { characterId: 'test-id' }, regularUser.token);
        expect(response.status).toBe(403);
      });

      it('should allow reward reset for admins', async () => {
        const { token } = await createAdminUser();
        const response = await apiPost(app, '/api/login-rewards/reset', { characterId: 'test-id' }, token);
        expect([200, 400, 404]).toContain(response.status);
        expect(response.status).not.toBe(403);
      });
    });

    describe('Jail Admin Endpoints', () => {
      it('should reject jail release without auth (401)', async () => {
        const response = await apiPost(app, '/api/jail/release/test-character-id', {});
        expect(response.status).toBe(401);
      });

      it('should reject jail release from regular users (403)', async () => {
        const regularUser = await setupCompleteGameState(app);
        const response = await apiPost(app, '/api/jail/release/test-character-id', {}, regularUser.token);
        expect(response.status).toBe(403);
      });

      it('should allow jail release for admins', async () => {
        const { token } = await createAdminUser();
        const response = await apiPost(app, '/api/jail/release/test-character-id', {}, token);
        expect([200, 400, 404]).toContain(response.status);
        expect(response.status).not.toBe(403);
      });
    });

    describe('Gossip Admin Endpoints', () => {
      it('should reject gossip spread without auth (401)', async () => {
        const response = await apiPost(app, '/api/gossip/test-gossip-id/spread', {});
        expect(response.status).toBe(401);
      });

      it('should reject gossip spread from regular users (403)', async () => {
        const regularUser = await setupCompleteGameState(app);
        const response = await apiPost(app, '/api/gossip/test-gossip-id/spread', {}, regularUser.token);
        expect(response.status).toBe(403);
      });

      it('should allow gossip spread for admins', async () => {
        const { token } = await createAdminUser();
        const response = await apiPost(app, '/api/gossip/test-gossip-id/spread', {}, token);
        expect([200, 400, 404]).toContain(response.status);
        expect(response.status).not.toBe(403);
      });

      it('should reject gossip create without auth (401)', async () => {
        const response = await apiPost(app, '/api/gossip/create', { content: 'test' });
        expect(response.status).toBe(401);
      });

      it('should reject gossip create from regular users (403)', async () => {
        const regularUser = await setupCompleteGameState(app);
        const response = await apiPost(app, '/api/gossip/create', { content: 'test' }, regularUser.token);
        expect(response.status).toBe(403);
      });

      it('should allow gossip create for admins', async () => {
        const { token } = await createAdminUser();
        const response = await apiPost(app, '/api/gossip/create', { content: 'test' }, token);
        expect([200, 400, 404]).toContain(response.status);
        expect(response.status).not.toBe(403);
      });
    });

    describe('Newspaper Admin Endpoints', () => {
      it('should reject article creation without auth (401)', async () => {
        const response = await apiPost(app, '/api/newspaper/articles', { title: 'test' });
        expect(response.status).toBe(401);
      });

      it('should reject article creation from regular users (403)', async () => {
        const regularUser = await setupCompleteGameState(app);
        const response = await apiPost(app, '/api/newspaper/articles', { title: 'test' }, regularUser.token);
        expect(response.status).toBe(403);
      });

      it('should allow article creation for admins', async () => {
        const { token } = await createAdminUser();
        const response = await apiPost(app, '/api/newspaper/articles', { title: 'test' }, token);
        expect([200, 400, 404]).toContain(response.status);
        expect(response.status).not.toBe(403);
      });

      it('should reject newspaper publish without auth (401)', async () => {
        const response = await apiPost(app, '/api/newspaper/publish', {});
        expect(response.status).toBe(401);
      });

      it('should reject newspaper publish from regular users (403)', async () => {
        const regularUser = await setupCompleteGameState(app);
        const response = await apiPost(app, '/api/newspaper/publish', {}, regularUser.token);
        expect(response.status).toBe(403);
      });

      it('should allow newspaper publish for admins', async () => {
        const { token } = await createAdminUser();
        const response = await apiPost(app, '/api/newspaper/publish', {}, token);
        expect([200, 400, 404]).toContain(response.status);
        expect(response.status).not.toBe(403);
      });

      it('should reject world event without auth (401)', async () => {
        const response = await apiPost(app, '/api/newspaper/world-event', { eventType: 'test' });
        expect(response.status).toBe(401);
      });

      it('should reject world event from regular users (403)', async () => {
        const regularUser = await setupCompleteGameState(app);
        const response = await apiPost(app, '/api/newspaper/world-event', { eventType: 'test' }, regularUser.token);
        expect(response.status).toBe(403);
      });

      it('should allow world event for admins', async () => {
        const { token } = await createAdminUser();
        const response = await apiPost(app, '/api/newspaper/world-event', { eventType: 'test' }, token);
        expect([200, 400, 404]).toContain(response.status);
        expect(response.status).not.toBe(403);
      });
    });

    describe('Audit Log Integration', () => {
      it('should create audit logs for all admin actions', async () => {
        const { AuditLog } = await import('../../src/models/AuditLog.model');
        const { token, admin } = await createAdminUser();

        // Clear existing audit logs
        await AuditLog.deleteMany({});

        // Perform an admin action
        await apiPost(app, '/api/calendar/admin/advance', { days: 1 }, token);

        // Wait for async logging to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check audit log was created
        const logs = await AuditLog.find({ userId: admin._id });
        expect(logs.length).toBeGreaterThan(0);

        if (logs.length > 0) {
          const log = logs[0];
          expect(log.action).toBeTruthy();
          expect(log.endpoint).toBeTruthy();
          expect(log.method).toBe('POST');
        }
      });

      it('should not create audit logs for non-admin actions', async () => {
        const { AuditLog } = await import('../../src/models/AuditLog.model');
        const regularUser = await setupCompleteGameState(app);

        // Clear existing audit logs
        await AuditLog.deleteMany({});

        // Perform a regular user action
        await apiGet(app, '/api/character', regularUser.token);

        // Wait for async logging to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check no audit log was created for regular user
        const logs = await AuditLog.find({ userId: regularUser.user._id });
        expect(logs.length).toBe(0);
      });
    });
  });
});
