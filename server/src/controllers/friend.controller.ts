/**
 * Friend Controller
 *
 * REST API endpoints for friend system
 */

import { Request, Response } from 'express';
import { FriendService } from '../services/friend.service';
import { asyncHandler } from '../middleware/asyncHandler';

/**
 * Send friend request
 * POST /api/friends/request
 */
export const sendFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  const { recipientId } = req.body;

  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  if (!recipientId) {
    res.status(400).json({
      success: false,
      message: 'Missing required field: recipientId'
    });
    return;
  }

  const friendRequest = await FriendService.sendFriendRequest(
    req.character._id,
    recipientId
  );

  res.status(201).json({
    success: true,
    data: friendRequest
  });
});

/**
 * Get friend requests (pending)
 * GET /api/friends/requests
 */
export const getFriendRequests = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const requests = await FriendService.getFriendRequests(req.character._id);

  res.status(200).json({
    success: true,
    data: requests
  });
});

/**
 * Get friends
 * GET /api/friends
 */
export const getFriends = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const friends = await FriendService.getFriends(req.character._id);

  res.status(200).json({
    success: true,
    data: friends
  });
});

/**
 * Accept friend request
 * POST /api/friends/:id/accept
 */
export const acceptFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  const friendship = await FriendService.acceptFriendRequest(id, req.character._id);

  res.status(200).json({
    success: true,
    data: friendship
  });
});

/**
 * Reject friend request
 * POST /api/friends/:id/reject
 */
export const rejectFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  await FriendService.rejectFriendRequest(id, req.character._id);

  res.status(200).json({
    success: true,
    message: 'Friend request rejected'
  });
});

/**
 * Remove friend
 * DELETE /api/friends/:id
 */
export const removeFriend = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  await FriendService.removeFriend(id, req.character._id);

  res.status(200).json({
    success: true,
    message: 'Friend removed successfully'
  });
});

/**
 * Block user
 * POST /api/friends/block/:userId
 */
export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { userId } = req.params;

  await FriendService.blockUser(req.character._id, userId);

  res.status(200).json({
    success: true,
    message: 'User blocked successfully'
  });
});
