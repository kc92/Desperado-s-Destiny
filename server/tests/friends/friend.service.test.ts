/**
 * Friend Service Tests
 *
 * Tests for friend system with online status integration
 */

import mongoose from 'mongoose';
import { FriendService } from '../../src/services/friend.service';
import { Friend, FriendStatus } from '../../src/models/Friend.model';
import { Character } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { Notification, NotificationType } from '../../src/models/Notification.model';
import { clearDatabase } from '../helpers/db.helpers';
import { Faction } from '@desperados/shared';

describe('FriendService', () => {
  let char1: any;
  let char2: any;
  let char3: any;

  beforeEach(async () => {
    await clearDatabase();

    const user1 = await User.create({
      email: 'user1@test.com',
      passwordHash: 'hash1',
      emailVerified: true
    });

    const user2 = await User.create({
      email: 'user2@test.com',
      passwordHash: 'hash2',
      emailVerified: true
    });

    const user3 = await User.create({
      email: 'user3@test.com',
      passwordHash: 'hash3',
      emailVerified: true
    });

    char1 = await Character.create({
      userId: user1._id,
      name: 'Alice',
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'female',
        skinTone: 5,
        facePreset: 0,
        hairStyle: 0,
        hairColor: 0
      },
      currentLocation: 'frontera-town',
      gold: 100
    });

    char2 = await Character.create({
      userId: user2._id,
      name: 'Bob',
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'male',
        skinTone: 3,
        facePreset: 1,
        hairStyle: 1,
        hairColor: 1
      },
      currentLocation: 'frontera-town',
      gold: 100
    });

    char3 = await Character.create({
      userId: user3._id,
      name: 'Charlie',
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'male',
        skinTone: 4,
        facePreset: 2,
        hairStyle: 2,
        hairColor: 2
      },
      currentLocation: 'frontera-town',
      gold: 100
    });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('sendFriendRequest', () => {
    it('should send friend request', async () => {
      const friendRequest = await FriendService.sendFriendRequest(
        char1._id,
        char2._id
      );

      expect(friendRequest).toBeDefined();
      expect(friendRequest.requesterName).toBe('Alice');
      expect(friendRequest.recipientName).toBe('Bob');
      expect(friendRequest.status).toBe(FriendStatus.PENDING);

      const notification = await Notification.findOne({ characterId: char2._id });
      expect(notification).toBeDefined();
      expect(notification?.type).toBe(NotificationType.FRIEND_REQUEST);
    });

    it('should fail when sending request to self', async () => {
      await expect(
        FriendService.sendFriendRequest(char1._id, char1._id)
      ).rejects.toThrow('Cannot send friend request to yourself');
    });

    it('should fail when request already pending', async () => {
      await FriendService.sendFriendRequest(char1._id, char2._id);

      await expect(
        FriendService.sendFriendRequest(char1._id, char2._id)
      ).rejects.toThrow('Friend request already pending');
    });

    it('should fail when already friends', async () => {
      const request = await FriendService.sendFriendRequest(char1._id, char2._id);
      await FriendService.acceptFriendRequest(request._id.toString(), char2._id);

      await expect(
        FriendService.sendFriendRequest(char1._id, char2._id)
      ).rejects.toThrow('Already friends');
    });

    it('should fail when blocked', async () => {
      await FriendService.blockUser(char2._id, char1._id);

      await expect(
        FriendService.sendFriendRequest(char1._id, char2._id)
      ).rejects.toThrow('Cannot send friend request to this user');
    });

    it('should fail if recipient not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        FriendService.sendFriendRequest(char1._id, fakeId)
      ).rejects.toThrow('Recipient not found');
    });
  });

  describe('acceptFriendRequest', () => {
    it('should accept friend request', async () => {
      const request = await FriendService.sendFriendRequest(char1._id, char2._id);

      const friendship = await FriendService.acceptFriendRequest(
        request._id.toString(),
        char2._id
      );

      expect(friendship.status).toBe(FriendStatus.ACCEPTED);
      expect(friendship.respondedAt).toBeDefined();

      const notification = await Notification.findOne({
        characterId: char1._id,
        type: NotificationType.FRIEND_ACCEPTED
      });
      expect(notification).toBeDefined();
    });

    it('should fail if request not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(
        FriendService.acceptFriendRequest(fakeId, char2._id)
      ).rejects.toThrow('Friend request not found');
    });

    it('should fail if not the recipient', async () => {
      const request = await FriendService.sendFriendRequest(char1._id, char2._id);

      await expect(
        FriendService.acceptFriendRequest(request._id.toString(), char3._id)
      ).rejects.toThrow('You do not have permission');
    });

    it('should fail if request not pending', async () => {
      const request = await FriendService.sendFriendRequest(char1._id, char2._id);
      await FriendService.acceptFriendRequest(request._id.toString(), char2._id);

      await expect(
        FriendService.acceptFriendRequest(request._id.toString(), char2._id)
      ).rejects.toThrow('not pending');
    });
  });

  describe('rejectFriendRequest', () => {
    it('should reject friend request', async () => {
      const request = await FriendService.sendFriendRequest(char1._id, char2._id);

      await FriendService.rejectFriendRequest(request._id.toString(), char2._id);

      const updatedRequest = await Friend.findById(request._id);
      expect(updatedRequest?.status).toBe(FriendStatus.REJECTED);
      expect(updatedRequest?.respondedAt).toBeDefined();
    });

    it('should fail if not the recipient', async () => {
      const request = await FriendService.sendFriendRequest(char1._id, char2._id);

      await expect(
        FriendService.rejectFriendRequest(request._id.toString(), char3._id)
      ).rejects.toThrow('You do not have permission');
    });
  });

  describe('removeFriend', () => {
    it('should remove friendship', async () => {
      const request = await FriendService.sendFriendRequest(char1._id, char2._id);
      await FriendService.acceptFriendRequest(request._id.toString(), char2._id);

      await FriendService.removeFriend(request._id.toString(), char1._id);

      const friendship = await Friend.findById(request._id);
      expect(friendship).toBeNull();
    });

    it('should fail if not part of friendship', async () => {
      const request = await FriendService.sendFriendRequest(char1._id, char2._id);
      await FriendService.acceptFriendRequest(request._id.toString(), char2._id);

      await expect(
        FriendService.removeFriend(request._id.toString(), char3._id)
      ).rejects.toThrow('You do not have permission');
    });

    it('should fail if not an active friendship', async () => {
      const request = await FriendService.sendFriendRequest(char1._id, char2._id);

      await expect(
        FriendService.removeFriend(request._id.toString(), char1._id)
      ).rejects.toThrow('Not an active friendship');
    });
  });

  describe('blockUser', () => {
    it('should block user', async () => {
      await FriendService.blockUser(char1._id, char2._id);

      const blocked = await FriendService.isBlocked(char1._id, char2._id);
      expect(blocked).toBe(true);
    });

    it('should fail when blocking self', async () => {
      await expect(
        FriendService.blockUser(char1._id, char1._id)
      ).rejects.toThrow('Cannot block yourself');
    });

    it('should update existing relationship to blocked', async () => {
      const request = await FriendService.sendFriendRequest(char1._id, char2._id);

      await FriendService.blockUser(char2._id, char1._id);

      const relationship = await Friend.findById(request._id);
      expect(relationship?.status).toBe(FriendStatus.BLOCKED);
    });
  });

  describe('getFriendRequests', () => {
    it('should fetch pending friend requests', async () => {
      await FriendService.sendFriendRequest(char1._id, char2._id);
      await FriendService.sendFriendRequest(char3._id, char2._id);

      const requests = await FriendService.getFriendRequests(char2._id);

      expect(requests.length).toBe(2);
      expect(requests[0].requesterName).toBe('Charlie');
      expect(requests[1].requesterName).toBe('Alice');
    });

    it('should not include accepted requests', async () => {
      const request = await FriendService.sendFriendRequest(char1._id, char2._id);
      await FriendService.acceptFriendRequest(request._id.toString(), char2._id);

      const requests = await FriendService.getFriendRequests(char2._id);
      expect(requests.length).toBe(0);
    });
  });

  describe('getFriends', () => {
    it('should fetch accepted friends', async () => {
      const request1 = await FriendService.sendFriendRequest(char1._id, char2._id);
      await FriendService.acceptFriendRequest(request1._id.toString(), char2._id);

      const request2 = await FriendService.sendFriendRequest(char2._id, char3._id);
      await FriendService.acceptFriendRequest(request2._id.toString(), char3._id);

      const friends = await FriendService.getFriends(char2._id);

      expect(friends.length).toBe(2);
      expect(friends.map(f => f.friendName).sort()).toEqual(['Alice', 'Charlie']);
    });

    it('should include online status (offline by default)', async () => {
      const request = await FriendService.sendFriendRequest(char1._id, char2._id);
      await FriendService.acceptFriendRequest(request._id.toString(), char2._id);

      const friends = await FriendService.getFriends(char2._id);

      expect(friends.length).toBe(1);
      expect(friends[0].online).toBe(false);
    });

    it('should not include pending or rejected requests', async () => {
      await FriendService.sendFriendRequest(char1._id, char2._id);

      const friends = await FriendService.getFriends(char2._id);
      expect(friends.length).toBe(0);
    });
  });

  describe('isBlocked', () => {
    it('should return true if blocked (either direction)', async () => {
      await FriendService.blockUser(char1._id, char2._id);

      const blocked1 = await FriendService.isBlocked(char1._id, char2._id);
      const blocked2 = await FriendService.isBlocked(char2._id, char1._id);

      expect(blocked1).toBe(true);
      expect(blocked2).toBe(true);
    });

    it('should return false if not blocked', async () => {
      const blocked = await FriendService.isBlocked(char1._id, char2._id);
      expect(blocked).toBe(false);
    });
  });
});
