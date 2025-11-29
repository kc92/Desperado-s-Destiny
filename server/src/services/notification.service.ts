/**
 * Notification Service
 *
 * Handles all notification operations with Socket.io integration
 */

import mongoose from 'mongoose';
import { Notification, NotificationType, INotification } from '../models/Notification.model';
import { getSocketIO } from '../config/socket';
import logger from '../utils/logger';

export class NotificationService {
  /**
   * Create a notification and emit Socket.io event
   *
   * @param characterId - Character receiving notification
   * @param type - Notification type
   * @param title - Notification title
   * @param message - Notification message
   * @param link - Link to navigate to
   * @returns Created notification
   */
  static async createNotification(
    characterId: string | mongoose.Types.ObjectId,
    type: NotificationType,
    title: string,
    message: string,
    link: string
  ): Promise<INotification> {
    const notification = await Notification.create({
      characterId,
      type,
      title,
      message,
      link,
      isRead: false,
      createdAt: new Date()
    });

    const io = getSocketIO();
    if (io) {
      io.to(`character:${characterId.toString()}`).emit('notification:new', {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        createdAt: notification.createdAt
      });
    }

    logger.info(`Notification created for character ${characterId}: ${type}`);

    return notification;
  }

  /**
   * Send a notification with simplified parameters
   * Wrapper around createNotification for common use cases
   *
   * @param characterId - Character receiving notification
   * @param type - Notification type
   * @param message - Notification message
   * @param metadata - Optional metadata/data object
   * @returns Created notification
   */
  static async sendNotification(
    characterId: string | mongoose.Types.ObjectId,
    type: NotificationType | string,
    message: string,
    metadata?: any
  ): Promise<INotification> {
    // Generate a title from the type
    const title = type.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Generate a link if not provided in metadata
    const link = metadata?.link || '/notifications';

    // Cast type to NotificationType (handles string literals)
    const notificationType = type as NotificationType;

    return this.createNotification(
      characterId,
      notificationType,
      title,
      message,
      link
    );
  }

  /**
   * Get notifications (paginated)
   *
   * @param characterId - Character whose notifications to fetch
   * @param limit - Maximum notifications to return
   * @param offset - Number of notifications to skip
   * @returns Notifications, total count, and unread count
   */
  static async getNotifications(
    characterId: string | mongoose.Types.ObjectId,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    notifications: INotification[];
    total: number;
    unreadCount: number;
  }> {
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ characterId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean() as unknown as INotification[],
      Notification.countDocuments({ characterId }),
      Notification.countDocuments({ characterId, isRead: false })
    ]);

    return {
      notifications,
      total,
      unreadCount
    };
  }

  /**
   * Get unread notification count
   *
   * @param characterId - Character to check
   * @returns Number of unread notifications
   */
  static async getUnreadCount(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<number> {
    return Notification.countDocuments({ characterId, isRead: false });
  }

  /**
   * Mark notification as read
   *
   * @param notificationId - Notification to mark as read
   * @param characterId - Character marking as read (for ownership verification)
   */
  static async markAsRead(
    notificationId: string,
    characterId: string | mongoose.Types.ObjectId
  ): Promise<void> {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    const charIdStr = typeof characterId === 'string' ? characterId : characterId.toString();
    if (notification.characterId.toString() !== charIdStr) {
      throw new Error('You do not have permission to mark this notification as read');
    }

    await notification.markAsRead();
  }

  /**
   * Mark all notifications as read
   *
   * @param characterId - Character whose notifications to mark as read
   * @returns Number of notifications marked as read
   */
  static async markAllAsRead(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<number> {
    const result = await Notification.updateMany(
      { characterId, isRead: false },
      { $set: { isRead: true } }
    );

    return result.modifiedCount;
  }

  /**
   * Delete notification
   *
   * @param notificationId - Notification to delete
   * @param characterId - Character deleting notification (for ownership verification)
   */
  static async deleteNotification(
    notificationId: string,
    characterId: string | mongoose.Types.ObjectId
  ): Promise<void> {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    const charIdStr = typeof characterId === 'string' ? characterId : characterId.toString();
    if (notification.characterId.toString() !== charIdStr) {
      throw new Error('You do not have permission to delete this notification');
    }

    await Notification.findByIdAndDelete(notificationId);
  }
}
