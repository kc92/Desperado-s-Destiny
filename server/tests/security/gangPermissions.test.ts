/**
 * Gang Permission Security Tests
 *
 * Tests to ensure gang role-based permissions are properly enforced
 */

import request from 'supertest';
import app from '../testApp';
import { User } from '../../src/models/User.model';
import { Character } from '../../src/models/Character.model';
import { Gang } from '../../src/models/Gang.model';
import { clearDatabase } from '../helpers/db.helpers';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch, expectSuccess, expectError } from '../helpers/api.helpers';
import { createTestToken } from '../helpers/auth.helpers';
import { setupCompleteGameState } from '../helpers/testHelpers';
import { GangRole } from '@desperados/shared';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

describe('Gang Permission Security Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  /**
   * Helper to create a gang with multiple members
   */
  async function createGangWithMembers() {
    // Create leader
    const leader = await setupCompleteGameState(app, 'leader@example.com');

    // Create gang
    const gang = new Gang({
      name: 'Test Gang',
      tag: 'TEST',
      leaderId: leader.character._id,
      members: [
        {
          characterId: leader.character._id,
          role: GangRole.LEADER,
          joinedAt: new Date(),
          contribution: 0
        }
      ],
      bank: 1000,
      level: 1,
      territories: [],
      isActive: true
    });
    await gang.save();

    // Update character with gangId
    leader.character.gangId = gang._id;
    await leader.character.save();

    // Create officer
    const officer = await setupCompleteGameState(app, 'officer@example.com');
    gang.members.push({
      characterId: officer.character._id,
      role: GangRole.OFFICER,
      joinedAt: new Date(),
      contribution: 0
    });
    officer.character.gangId = gang._id;
    await officer.character.save();

    // Create regular member
    const member = await setupCompleteGameState(app, 'member@example.com');
    gang.members.push({
      characterId: member.character._id,
      role: GangRole.MEMBER,
      joinedAt: new Date(),
      contribution: 0
    });
    member.character.gangId = gang._id;
    await member.character.save();

    await gang.save();

    return { gang, leader, officer, member };
  }

  describe('Member Kick Permissions', () => {
    it('should prevent members from kicking other members', async () => {
      const { gang, member } = await createGangWithMembers();
      const targetMember = await setupCompleteGameState(app, 'target@example.com');

      gang.members.push({
        characterId: targetMember.character._id,
        role: GangRole.MEMBER,
        joinedAt: new Date(),
        contribution: 0
      });
      await gang.save();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/kick`,
        { characterId: targetMember.character._id.toString() },
        member.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
      expect(response.body.error).toMatch(/officer|permission/i);
    });

    it('should allow officers to kick regular members', async () => {
      const { gang, officer } = await createGangWithMembers();
      const targetMember = await setupCompleteGameState(app, 'target@example.com');

      gang.members.push({
        characterId: targetMember.character._id,
        role: GangRole.MEMBER,
        joinedAt: new Date(),
        contribution: 0
      });
      await gang.save();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/kick`,
        { characterId: targetMember.character._id.toString() },
        officer.token
      );

      // Should succeed or return specific error
      expect([200, 400]).toContain(response.status);
      if (response.status === 403) {
        fail('Officer should be able to kick members');
      }
    });

    it('should prevent officers from kicking other officers', async () => {
      const { gang, officer } = await createGangWithMembers();
      const otherOfficer = await setupCompleteGameState(app, 'officer2@example.com');

      gang.members.push({
        characterId: otherOfficer.character._id,
        role: GangRole.OFFICER,
        joinedAt: new Date(),
        contribution: 0
      });
      await gang.save();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/kick`,
        { characterId: otherOfficer.character._id.toString() },
        officer.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow leaders to kick anyone including officers', async () => {
      const { gang, leader, officer } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/kick`,
        { characterId: officer.character._id.toString() },
        leader.token
      );

      // Should succeed or return specific error (not permission error)
      expect([200, 400]).toContain(response.status);
      if (response.status === 403) {
        fail('Leader should be able to kick officers');
      }
    });
  });

  describe('Promotion Permissions', () => {
    it('should prevent members from promoting others', async () => {
      const { gang, member } = await createGangWithMembers();
      const targetMember = await setupCompleteGameState(app, 'target@example.com');

      gang.members.push({
        characterId: targetMember.character._id,
        role: GangRole.MEMBER,
        joinedAt: new Date(),
        contribution: 0
      });
      await gang.save();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/promote`,
        {
          characterId: targetMember.character._id.toString(),
          newRole: GangRole.OFFICER
        },
        member.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should prevent officers from promoting members', async () => {
      const { gang, officer, member } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/promote`,
        {
          characterId: member.character._id.toString(),
          newRole: GangRole.OFFICER
        },
        officer.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow leaders to promote members to officers', async () => {
      const { gang, leader, member } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/promote`,
        {
          characterId: member.character._id.toString(),
          newRole: GangRole.OFFICER
        },
        leader.token
      );

      // Should succeed
      expect([200, 400]).toContain(response.status);
      if (response.status === 403) {
        fail('Leader should be able to promote members');
      }
    });

    it('should allow leaders to demote officers to members', async () => {
      const { gang, leader, officer } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/promote`,
        {
          characterId: officer.character._id.toString(),
          newRole: GangRole.MEMBER
        },
        leader.token
      );

      // Should succeed
      expect([200, 400]).toContain(response.status);
      if (response.status === 403) {
        fail('Leader should be able to demote officers');
      }
    });
  });

  describe('Gang Bank Permissions', () => {
    it('should allow all members to deposit to gang bank', async () => {
      const { gang, member } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/bank/deposit`,
        { amount: 50 },
        member.token
      );

      // Should succeed or fail for insufficient funds (not permission)
      expect([200, 400]).toContain(response.status);
      if (response.status === 403) {
        fail('All members should be able to deposit');
      }
    });

    it('should prevent members from withdrawing from gang bank', async () => {
      const { gang, member } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/bank/withdraw`,
        { amount: 50 },
        member.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow officers to withdraw from gang bank', async () => {
      const { gang, officer } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/bank/withdraw`,
        { amount: 50 },
        officer.token
      );

      // Should succeed or fail for other reasons (not permission)
      expect([200, 400]).toContain(response.status);
      if (response.status === 403) {
        fail('Officers should be able to withdraw');
      }
    });

    it('should allow leaders to withdraw from gang bank', async () => {
      const { gang, leader } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/bank/withdraw`,
        { amount: 50 },
        leader.token
      );

      // Should succeed or fail for other reasons (not permission)
      expect([200, 400]).toContain(response.status);
      if (response.status === 403) {
        fail('Leaders should be able to withdraw');
      }
    });

    it('should prevent non-members from accessing gang bank', async () => {
      const { gang } = await createGangWithMembers();
      const outsider = await setupCompleteGameState(app, 'outsider@example.com');

      const response = await apiGet(
        app,
        `/api/gangs/${gang._id}/bank`,
        outsider.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });
  });

  describe('Gang Invitation Permissions', () => {
    it('should prevent members from inviting others', async () => {
      const { gang, member } = await createGangWithMembers();
      const invitee = await setupCompleteGameState(app, 'invitee@example.com');

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/invite`,
        { characterId: invitee.character._id.toString() },
        member.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow officers to invite new members', async () => {
      const { gang, officer } = await createGangWithMembers();
      const invitee = await setupCompleteGameState(app, 'invitee@example.com');

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/invite`,
        { characterId: invitee.character._id.toString() },
        officer.token
      );

      // Should succeed
      expect([200, 400]).toContain(response.status);
      if (response.status === 403) {
        fail('Officers should be able to invite members');
      }
    });

    it('should allow leaders to invite new members', async () => {
      const { gang, leader } = await createGangWithMembers();
      const invitee = await setupCompleteGameState(app, 'invitee@example.com');

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/invite`,
        { characterId: invitee.character._id.toString() },
        leader.token
      );

      // Should succeed
      expect([200, 400]).toContain(response.status);
      if (response.status === 403) {
        fail('Leaders should be able to invite members');
      }
    });
  });

  describe('Territory War Permissions', () => {
    it('should prevent members from declaring territory wars', async () => {
      const { gang, member } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/wars/declare`,
        { territoryId: 'test-territory' },
        member.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should prevent officers from declaring territory wars', async () => {
      const { gang, officer } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/wars/declare`,
        { territoryId: 'test-territory' },
        officer.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow only leaders to declare territory wars', async () => {
      const { gang, leader } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/wars/declare`,
        { territoryId: 'test-territory' },
        leader.token
      );

      // Should succeed or fail for other reasons (not permission)
      expect([200, 400, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('Leaders should be able to declare wars');
      }
    });
  });

  describe('Gang Upgrade Permissions', () => {
    it('should prevent members from purchasing upgrades', async () => {
      const { gang, member } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/upgrades/purchase`,
        { upgradeType: 'VAULT_SIZE' },
        member.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should prevent officers from purchasing upgrades', async () => {
      const { gang, officer } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/upgrades/purchase`,
        { upgradeType: 'VAULT_SIZE' },
        officer.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow only leaders to purchase upgrades', async () => {
      const { gang, leader } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/upgrades/purchase`,
        { upgradeType: 'VAULT_SIZE' },
        leader.token
      );

      // Should succeed or fail for other reasons (not permission)
      expect([200, 400]).toContain(response.status);
      if (response.status === 403) {
        fail('Leaders should be able to purchase upgrades');
      }
    });
  });

  describe('Gang Disbanding Permissions', () => {
    it('should prevent members from disbanding gang', async () => {
      const { gang, member } = await createGangWithMembers();

      const response = await apiDelete(
        app,
        `/api/gangs/${gang._id}`,
        member.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should prevent officers from disbanding gang', async () => {
      const { gang, officer } = await createGangWithMembers();

      const response = await apiDelete(
        app,
        `/api/gangs/${gang._id}`,
        officer.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow only leaders to disband gang', async () => {
      const { gang, leader } = await createGangWithMembers();

      const response = await apiDelete(
        app,
        `/api/gangs/${gang._id}`,
        leader.token
      );

      // Should succeed
      expect([200, 400]).toContain(response.status);
      if (response.status === 403) {
        fail('Leaders should be able to disband gang');
      }
    });
  });

  describe('Bank Withdrawal Limits by Role', () => {
    it('should enforce withdrawal limits for officers', async () => {
      const { gang, officer } = await createGangWithMembers();

      // Try to withdraw more than allowed limit
      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/bank/withdraw`,
        { amount: 10000 }, // Large amount
        officer.token
      );

      // Should fail with appropriate error (not permission, but limit)
      expect([400]).toContain(response.status);
    });

    it('should allow leaders unlimited withdrawals', async () => {
      const { gang, leader } = await createGangWithMembers();

      // Leaders should be able to withdraw any amount (up to bank balance)
      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/bank/withdraw`,
        { amount: gang.bank },
        leader.token
      );

      // Should succeed or fail for insufficient funds (not limit)
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('View Gang Details Permissions', () => {
    it('should allow all members to view gang details', async () => {
      const { gang, member } = await createGangWithMembers();

      const response = await apiGet(
        app,
        `/api/gangs/${gang._id}`,
        member.token
      );

      expect(response.status).toBe(200);
      expectSuccess(response);
    });

    it('should allow officers to view gang details', async () => {
      const { gang, officer } = await createGangWithMembers();

      const response = await apiGet(
        app,
        `/api/gangs/${gang._id}`,
        officer.token
      );

      expect(response.status).toBe(200);
      expectSuccess(response);
    });

    it('should allow leaders to view gang details', async () => {
      const { gang, leader } = await createGangWithMembers();

      const response = await apiGet(
        app,
        `/api/gangs/${gang._id}`,
        leader.token
      );

      expect(response.status).toBe(200);
      expectSuccess(response);
    });

    it('should prevent non-members from viewing private gang details', async () => {
      const { gang } = await createGangWithMembers();
      const outsider = await setupCompleteGameState(app, 'outsider@example.com');

      const response = await apiGet(
        app,
        `/api/gangs/${gang._id}/members`,
        outsider.token
      );

      // Basic gang info might be public, but member details should be restricted
      expect([403, 404]).toContain(response.status);
    });
  });

  describe('Gang Edit Permissions', () => {
    it('should prevent members from editing gang settings', async () => {
      const { gang, member } = await createGangWithMembers();

      const response = await apiPatch(
        app,
        `/api/gangs/${gang._id}`,
        { description: 'New description' },
        member.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should prevent officers from editing gang settings', async () => {
      const { gang, officer } = await createGangWithMembers();

      const response = await apiPatch(
        app,
        `/api/gangs/${gang._id}`,
        { description: 'New description' },
        officer.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow only leaders to edit gang settings', async () => {
      const { gang, leader } = await createGangWithMembers();

      const response = await apiPatch(
        app,
        `/api/gangs/${gang._id}`,
        { description: 'New description' },
        leader.token
      );

      // Should succeed or fail for other reasons (not permission)
      expect([200, 400]).toContain(response.status);
      if (response.status === 403) {
        fail('Leaders should be able to edit gang settings');
      }
    });
  });

  describe('Leadership Transfer Security', () => {
    it('should prevent non-leaders from transferring leadership', async () => {
      const { gang, officer, member } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/transfer-leadership`,
        { newLeaderId: member.character._id.toString() },
        officer.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should allow leaders to transfer leadership', async () => {
      const { gang, leader, officer } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/transfer-leadership`,
        { newLeaderId: officer.character._id.toString() },
        leader.token
      );

      // Should succeed or fail for other reasons (not permission)
      expect([200, 400]).toContain(response.status);
      if (response.status === 403) {
        fail('Leaders should be able to transfer leadership');
      }
    });

    it('should prevent transferring leadership to non-member', async () => {
      const { gang, leader } = await createGangWithMembers();
      const outsider = await setupCompleteGameState(app, 'outsider@example.com');

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/transfer-leadership`,
        { newLeaderId: outsider.character._id.toString() },
        leader.token
      );

      expect(response.status).toBe(400);
      expectError(response, 400);
    });
  });

  describe('Gang War Participation Security', () => {
    it('should allow all gang members to participate in wars', async () => {
      const { gang, member } = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/wars/participate`,
        { warId: 'test-war' },
        member.token
      );

      // Should succeed or fail for other reasons (not permission)
      expect([200, 400, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('All members should be able to participate in wars');
      }
    });

    it('should prevent non-members from participating in gang wars', async () => {
      const { gang } = await createGangWithMembers();
      const outsider = await setupCompleteGameState(app, 'outsider@example.com');

      const response = await apiPost(
        app,
        `/api/gangs/${gang._id}/wars/participate`,
        { warId: 'test-war' },
        outsider.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });
  });

  describe('Gang Transaction History Access', () => {
    it('should allow all members to view transaction history', async () => {
      const { gang, member } = await createGangWithMembers();

      const response = await apiGet(
        app,
        `/api/gangs/${gang._id}/transactions`,
        member.token
      );

      // Should succeed or fail for other reasons (not permission)
      expect([200, 404]).toContain(response.status);
      if (response.status === 403) {
        fail('All members should be able to view transaction history');
      }
    });

    it('should prevent non-members from viewing transaction history', async () => {
      const { gang } = await createGangWithMembers();
      const outsider = await setupCompleteGameState(app, 'outsider@example.com');

      const response = await apiGet(
        app,
        `/api/gangs/${gang._id}/transactions`,
        outsider.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });
  });

  describe('Cross-Gang Permission Validation', () => {
    it('should prevent members of Gang A from accessing Gang B resources', async () => {
      const gangA = await createGangWithMembers();
      const gangB = await createGangWithMembers();

      // Gang A leader tries to access Gang B's bank
      const response = await apiGet(
        app,
        `/api/gangs/${gangB.gang._id}/bank`,
        gangA.leader.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });

    it('should prevent Gang A officers from kicking Gang B members', async () => {
      const gangA = await createGangWithMembers();
      const gangB = await createGangWithMembers();

      const response = await apiPost(
        app,
        `/api/gangs/${gangB.gang._id}/kick`,
        { characterId: gangB.member.character._id.toString() },
        gangA.officer.token
      );

      expect(response.status).toBe(403);
      expectError(response, 403);
    });
  });
});
