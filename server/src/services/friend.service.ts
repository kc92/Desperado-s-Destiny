/**
 * Friend Service
 *
 * Handles all friend operations with online status integration
 */

import mongoose from 'mongoose';
import { Friend, FriendStatus, IFriend } from '../models/Friend.model';
import { Character } from '../models/Character.model';
import { NotificationType } from '../models/Notification.model';
import { getRedisClient } from '../config/redis';
import { getSocketIO } from '../config/socket';
import logger from '../utils/logger';

interface FriendWithOnlineStatus {
  _id: string;
  requesterId: string;
  requesterName: string;
  recipientId: string;
  recipientName: string;
  status: FriendStatus;
  requestedAt: Date;
  respondedAt: Date | null;
  online: boolean;
  friendId: string;
  friendName: string;
}

export class FriendService {
  /**
   * Send friend request
   *
   * @param requesterId - Character sending request
   * @param recipientId - Character receiving request
   * @returns Created friend request
   */
  static async sendFriendRequest(
    requesterId: string | mongoose.Types.ObjectId,
    recipientId: string | mongoose.Types.ObjectId
  ): Promise<IFriend> {
    const [requester, recipient] = await Promise.all([
      Character.findById(requesterId),
      Character.findById(recipientId)
    ]);

    if (!requester) {
      throw new Error('Requester not found');
    }

    if (!recipient) {
      throw new Error('Recipient not found');
    }

    if (requester._id.toString() === recipient._id.toString()) {
      throw new Error('Cannot send friend request to yourself');
    }

    const existingRelationship = await Friend.findExistingRelationship(
      requester._id as mongoose.Types.ObjectId,
      recipient._id as mongoose.Types.ObjectId
    );

    if (existingRelationship) {
      if (existingRelationship.status === FriendStatus.PENDING) {
        throw new Error('Friend request already pending');
      } else if (existingRelationship.status === FriendStatus.ACCEPTED) {
        throw new Error('Already friends');
      } else if (existingRelationship.status === FriendStatus.BLOCKED) {
        throw new Error('Cannot send friend request to this user');
      }
    }

    const friendRequest = await Friend.create({
      requesterId: requester._id,
      requesterName: requester.name,
      recipientId: recipient._id,
      recipientName: recipient.name,
      status: FriendStatus.PENDING,
      requestedAt: new Date(),
      respondedAt: null
    });

    const { NotificationService } = await import('./notification.service');
    await NotificationService.createNotification(
      recipient._id as mongoose.Types.ObjectId,
      NotificationType.FRIEND_REQUEST,
      `Friend Request from ${requester.name}`,
      `${requester.name} wants to be your friend`,
      `/friends?tab=requests`
    );

    const io = getSocketIO();
    if (io) {
      io.to(`character:${recipient._id.toString()}`).emit('friend:request_received', {
        id: friendRequest._id.toString(),
        requesterName: requester.name,
        requestedAt: friendRequest.requestedAt
      });
    }

    logger.info(`Friend request sent: ${requester.name} -> ${recipient.name}`);

    return friendRequest;
  }

  /**
   * Accept friend request
   *
   * @param requestId - Friend request to accept
   * @param accepterId - Character accepting request
   * @returns Accepted friend relationship
   */
  static async acceptFriendRequest(
    requestId: string,
    accepterId: string | mongoose.Types.ObjectId
  ): Promise<IFriend> {
    const friendRequest = await Friend.findById(requestId);

    if (!friendRequest) {
      throw new Error('Friend request not found');
    }

    const accepterObjectId = typeof accepterId === 'string'
      ? new mongoose.Types.ObjectId(accepterId)
      : accepterId;

    if (friendRequest.recipientId.toString() !== accepterObjectId.toString()) {
      throw new Error('You do not have permission to accept this friend request');
    }

    if (friendRequest.status !== FriendStatus.PENDING) {
      throw new Error('Friend request is not pending');
    }

    await friendRequest.accept();

    const { NotificationService } = await import('./notification.service');
    await NotificationService.createNotification(
      friendRequest.requesterId,
      NotificationType.FRIEND_ACCEPTED,
      `${friendRequest.recipientName} accepted your friend request`,
      `You are now friends with ${friendRequest.recipientName}`,
      `/friends`
    );

    const io = getSocketIO();
    if (io) {
      io.to(`character:${friendRequest.requesterId.toString()}`).emit('friend:accepted', {
        friendName: friendRequest.recipientName
      });
    }

    logger.info(
      `Friend request accepted: ${friendRequest.requesterName} <-> ${friendRequest.recipientName}`
    );

    return friendRequest;
  }

  /**
   * Reject friend request
   *
   * @param requestId - Friend request to reject
   * @param rejecterId - Character rejecting request
   */
  static async rejectFriendRequest(
    requestId: string,
    rejecterId: string | mongoose.Types.ObjectId
  ): Promise<void> {
    const friendRequest = await Friend.findById(requestId);

    if (!friendRequest) {
      throw new Error('Friend request not found');
    }

    const rejecterObjectId = typeof rejecterId === 'string'
      ? new mongoose.Types.ObjectId(rejecterId)
      : rejecterId;

    if (friendRequest.recipientId.toString() !== rejecterObjectId.toString()) {
      throw new Error('You do not have permission to reject this friend request');
    }

    if (friendRequest.status !== FriendStatus.PENDING) {
      throw new Error('Friend request is not pending');
    }

    await friendRequest.reject();

    logger.info(
      `Friend request rejected: ${friendRequest.requesterName} -> ${friendRequest.recipientName}`
    );
  }

  /**
   * Remove friend
   *
   * @param friendId - Friend relationship to remove
   * @param userId - Character removing friend
   */
  static async removeFriend(
    friendId: string,
    userId: string | mongoose.Types.ObjectId
  ): Promise<void> {
    const friendship = await Friend.findById(friendId);

    if (!friendship) {
      throw new Error('Friend relationship not found');
    }

    const userObjectId = typeof userId === 'string'
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    if (
      friendship.requesterId.toString() !== userObjectId.toString() &&
      friendship.recipientId.toString() !== userObjectId.toString()
    ) {
      throw new Error('You do not have permission to remove this friend');
    }

    if (friendship.status !== FriendStatus.ACCEPTED) {
      throw new Error('Not an active friendship');
    }

    await Friend.findByIdAndDelete(friendId);

    logger.info(
      `Friendship removed: ${friendship.requesterName} <-> ${friendship.recipientName}`
    );
  }

  /**
   * Block user
   *
   * @param requesterId - Character blocking
   * @param blockeeId - Character being blocked
   */
  static async blockUser(
    requesterId: string | mongoose.Types.ObjectId,
    blockeeId: string | mongoose.Types.ObjectId
  ): Promise<void> {
    const [requester, blockee] = await Promise.all([
      Character.findById(requesterId),
      Character.findById(blockeeId)
    ]);

    if (!requester) {
      throw new Error('Requester not found');
    }

    if (!blockee) {
      throw new Error('User to block not found');
    }

    if (requester._id.toString() === blockee._id.toString()) {
      throw new Error('Cannot block yourself');
    }

    const existingRelationship = await Friend.findExistingRelationship(
      requester._id as mongoose.Types.ObjectId,
      blockee._id as mongoose.Types.ObjectId
    );

    if (existingRelationship) {
      if (existingRelationship.status === FriendStatus.BLOCKED) {
        throw new Error('User already blocked');
      }

      existingRelationship.status = FriendStatus.BLOCKED;
      existingRelationship.respondedAt = new Date();
      await existingRelationship.save();
    } else {
      await Friend.create({
        requesterId: requester._id,
        requesterName: requester.name,
        recipientId: blockee._id,
        recipientName: blockee.name,
        status: FriendStatus.BLOCKED,
        requestedAt: new Date(),
        respondedAt: new Date()
      });
    }

    logger.info(`User blocked: ${requester.name} blocked ${blockee.name}`);
  }

  /**
   * Get friend requests (pending)
   *
   * @param characterId - Character whose requests to fetch
   * @returns Array of pending friend requests
   */
  static async getFriendRequests(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<IFriend[]> {
    return Friend.find({
      recipientId: characterId,
      status: FriendStatus.PENDING
    })
      .sort({ requestedAt: -1 })
      .lean() as unknown as IFriend[];
  }

  /**
   * Get friends with online status
   *
   * @param characterId - Character whose friends to fetch
   * @returns Array of friends with online status
   */
  static async getFriends(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<FriendWithOnlineStatus[]> {
    const charObjectId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const friendships = await Friend.find({
      $or: [
        { requesterId: charObjectId },
        { recipientId: charObjectId }
      ],
      status: FriendStatus.ACCEPTED
    }).lean();

    const friendsWithStatus = await Promise.all(
      friendships.map(async (friendship) => {
        const isSender = friendship.requesterId.toString() === charObjectId.toString();
        const friendId = isSender ? friendship.recipientId : friendship.requesterId;
        const friendName = isSender ? friendship.recipientName : friendship.requesterName;

        const online = await this.isOnline(friendId.toString());

        return {
          _id: friendship._id.toString(),
          requesterId: friendship.requesterId.toString(),
          requesterName: friendship.requesterName,
          recipientId: friendship.recipientId.toString(),
          recipientName: friendship.recipientName,
          status: friendship.status,
          requestedAt: friendship.requestedAt,
          respondedAt: friendship.respondedAt,
          online,
          friendId: friendId.toString(),
          friendName
        };
      })
    );

    friendsWithStatus.sort((a, b) => {
      if (a.online === b.online) {
        return a.friendName.localeCompare(b.friendName);
      }
      return a.online ? -1 : 1;
    });

    return friendsWithStatus;
  }

  /**
   * Check if user is blocked
   *
   * @param userId - Character to check
   * @param targetId - Target character
   * @returns True if blocked (either direction)
   */
  static async isBlocked(
    userId: string | mongoose.Types.ObjectId,
    targetId: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    const userObjectId = typeof userId === 'string'
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const targetObjectId = typeof targetId === 'string'
      ? new mongoose.Types.ObjectId(targetId)
      : targetId;

    const blockRelationship = await Friend.findOne({
      $or: [
        { requesterId: userObjectId, recipientId: targetObjectId },
        { requesterId: targetObjectId, recipientId: userObjectId }
      ],
      status: FriendStatus.BLOCKED
    });

    return !!blockRelationship;
  }

  /**
   * Check if character is online (via Redis)
   *
   * @param characterId - Character to check
   * @returns True if online
   */
  private static async isOnline(characterId: string): Promise<boolean> {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        return false;
      }

      const sessionKey = `session:character:${characterId}`;
      const exists = await redisClient.exists(sessionKey);
      return exists === 1;
    } catch (error) {
      logger.error('Error checking online status:', error);
      return false;
    }
  }
}
