/**
 * Notification Controller
 *
 * REST API endpoints for notification system
 */

import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { asyncHandler } from '../middleware/asyncHandler';

/**
 * Get notifications
 * GET /api/notifications
 */
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

  const { notifications, total, unreadCount } = await NotificationService.getNotifications(
    req.character._id,
    limit,
    offset
  );

  res.status(200).json({
    success: true,
    data: notifications,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + notifications.length < total
    },
    unreadCount
  });
});

/**
 * Get unread count
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const count = await NotificationService.getUnreadCount(req.character._id);

  res.status(200).json({
    success: true,
    data: {
      count
    }
  });
});

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  await NotificationService.markAsRead(id, req.character._id);

  res.status(200).json({
    success: true,
    message: 'Notification marked as read'
  });
});

/**
 * Mark all notifications as read
 * PATCH /api/notifications/mark-all-read
 */
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const count = await NotificationService.markAllAsRead(req.character._id);

  res.status(200).json({
    success: true,
    data: {
      count
    },
    message: `${count} notifications marked as read`
  });
});

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  await NotificationService.deleteNotification(id, req.character._id);

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});
