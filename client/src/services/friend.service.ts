/**
 * Friend Service
 * API client for friend system operations
 */

import api from './api';
import {
  Friend,
  FriendStatus,
  FriendWithOnlineStatus,
  SendFriendRequestRequest,
  SendFriendRequestResponse,
  GetFriendRequestsResponse,
  GetFriendsResponse,
  AcceptFriendRequestResponse,
} from '@shared/types/friend.types';

// ===== Additional Response Types =====

export interface RejectFriendRequestResponse {
  success: boolean;
  message: string;
}

export interface RemoveFriendResponse {
  success: boolean;
  message: string;
}

export interface BlockUserResponse {
  success: boolean;
  message: string;
}

// ===== Friend Service =====

export const friendService = {
  /**
   * Send a friend request to another character
   */
  async sendFriendRequest(recipientId: string): Promise<Friend> {
    const response = await api.post<SendFriendRequestResponse>(
      '/friends/request',
      { recipientId } as SendFriendRequestRequest
    );
    return response.data.data;
  },

  /**
   * Get pending friend requests (both sent and received)
   */
  async getFriendRequests(): Promise<Friend[]> {
    const response = await api.get<GetFriendRequestsResponse>('/friends/requests');
    return response.data.data;
  },

  /**
   * Get list of friends with their online status
   */
  async getFriends(): Promise<FriendWithOnlineStatus[]> {
    const response = await api.get<GetFriendsResponse>('/friends');
    return response.data.data;
  },

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(requestId: string): Promise<Friend> {
    const response = await api.post<AcceptFriendRequestResponse>(`/friends/${requestId}/accept`);
    return response.data.data;
  },

  /**
   * Reject a friend request
   */
  async rejectFriendRequest(requestId: string): Promise<void> {
    await api.post<RejectFriendRequestResponse>(`/friends/${requestId}/reject`);
  },

  /**
   * Remove a friend
   */
  async removeFriend(friendId: string): Promise<void> {
    await api.delete<RemoveFriendResponse>(`/friends/${friendId}`);
  },

  /**
   * Block a user
   */
  async blockUser(userId: string): Promise<void> {
    await api.post<BlockUserResponse>(`/friends/block/${userId}`);
  },

  // ===== Convenience Methods =====

  /**
   * Get only incoming friend requests (requests received)
   */
  async getIncomingRequests(characterId: string): Promise<Friend[]> {
    const requests = await this.getFriendRequests();
    return requests.filter(
      request => request.recipientId === characterId && request.status === FriendStatus.PENDING
    );
  },

  /**
   * Get only outgoing friend requests (requests sent)
   */
  async getOutgoingRequests(characterId: string): Promise<Friend[]> {
    const requests = await this.getFriendRequests();
    return requests.filter(
      request => request.requesterId === characterId && request.status === FriendStatus.PENDING
    );
  },

  /**
   * Get only online friends
   */
  async getOnlineFriends(): Promise<FriendWithOnlineStatus[]> {
    const friends = await this.getFriends();
    return friends.filter(friend => friend.online);
  },

  /**
   * Check if a character is a friend
   */
  async isFriend(characterId: string): Promise<boolean> {
    const friends = await this.getFriends();
    return friends.some(friend => friend.friendId === characterId);
  },

  /**
   * Get friend count
   */
  async getFriendCount(): Promise<number> {
    const friends = await this.getFriends();
    return friends.length;
  },

  /**
   * Get pending request count
   */
  async getPendingRequestCount(characterId: string): Promise<number> {
    const incoming = await this.getIncomingRequests(characterId);
    return incoming.length;
  },
};

export default friendService;
