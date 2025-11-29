/**
 * Friend Types
 *
 * Shared types for friend system
 */

export enum FriendStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED'
}

export interface Friend {
  _id: string;
  requesterId: string;
  requesterName: string;
  recipientId: string;
  recipientName: string;

  status: FriendStatus;

  requestedAt: string;
  respondedAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface FriendWithOnlineStatus extends Friend {
  online: boolean;
  friendId: string;
  friendName: string;
}

export interface SendFriendRequestRequest {
  recipientId: string;
}

export interface SendFriendRequestResponse {
  success: boolean;
  data: Friend;
}

export interface GetFriendRequestsResponse {
  success: boolean;
  data: Friend[];
}

export interface GetFriendsResponse {
  success: boolean;
  data: FriendWithOnlineStatus[];
}

export interface AcceptFriendRequestResponse {
  success: boolean;
  data: Friend;
}
