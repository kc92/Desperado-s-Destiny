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

const router = Router();

router.use(authenticate, requireCharacter);

router.post('/request', sendFriendRequest);
router.get('/requests', getFriendRequests);
router.get('/', getFriends);
router.post('/:id/accept', acceptFriendRequest);
router.post('/:id/reject', rejectFriendRequest);
router.delete('/:id', removeFriend);
router.post('/block/:userId', blockUser);

export default router;
