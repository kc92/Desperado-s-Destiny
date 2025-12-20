/**
 * Friend Routes
 */

import { Router } from 'express';
import {
  sendFriendRequest,
  getFriendRequests,
  getFriends,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  blockUser
} from '../controllers/friend.controller';
import { authenticate, requireCharacter } from '../middleware/auth.middleware';
import { friendRateLimitMiddleware } from '../middleware/friendRateLimiter';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

router.use(authenticate, requireCharacter);

// Apply rate limiter to friend request endpoint (10 requests/hour)
router.post('/request', requireCsrfToken, friendRateLimitMiddleware, asyncHandler(sendFriendRequest));
router.get('/requests', asyncHandler(getFriendRequests));
router.get('/', asyncHandler(getFriends));
router.post('/:id/accept', requireCsrfToken, asyncHandler(acceptFriendRequest));
router.post('/:id/reject', requireCsrfToken, asyncHandler(rejectFriendRequest));
router.delete('/:id', requireCsrfToken, asyncHandler(removeFriend));
router.post('/block/:userId', requireCsrfToken, asyncHandler(blockUser));

export default router;
