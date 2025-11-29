/**
 * Chat Routes
 *
 * HTTP endpoints for chat operations
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import * as chatController from '../controllers/chat.controller';

const router = Router();

/**
 * All chat routes require authentication
 */
router.use(requireAuth);

/**
 * GET /api/chat/messages
 * Fetch message history for a room
 */
router.get(
  '/messages',
  asyncHandler(chatController.getMessages)
);

/**
 * GET /api/chat/online-users
 * Get online users for a room
 */
router.get(
  '/online-users',
  asyncHandler(chatController.getOnlineUsers)
);

/**
 * GET /api/chat/mute-status
 * Check if current user is muted
 */
router.get(
  '/mute-status',
  asyncHandler(chatController.getMuteStatus)
);

/**
 * POST /api/chat/report
 * Report a message
 */
router.post(
  '/report',
  asyncHandler(chatController.reportMessage)
);

/**
 * GET /api/chat/stats
 * Get chat statistics (admin only)
 */
router.get(
  '/stats',
  asyncHandler(chatController.getChatStats)
);

export default router;
