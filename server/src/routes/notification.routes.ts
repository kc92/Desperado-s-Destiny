/**
 * Notification Routes
 */

import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notification.controller';
import { authenticate, requireCharacter } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

router.use(authenticate, requireCharacter);

router.get('/', asyncHandler(getNotifications));
router.get('/unread-count', asyncHandler(getUnreadCount));
router.patch('/mark-all-read', requireCsrfToken, asyncHandler(markAllAsRead));
router.patch('/:id/read', requireCsrfToken, asyncHandler(markAsRead));
router.delete('/:id', requireCsrfToken, asyncHandler(deleteNotification));

export default router;
