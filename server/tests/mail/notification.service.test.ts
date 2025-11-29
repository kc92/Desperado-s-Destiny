/**
 * Notification Service Tests
 *
 * Tests for notification system
 */

import { NotificationService } from '../../src/services/notification.service';
import { Notification, NotificationType } from '../../src/models/Notification.model';
import { Character } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { clearDatabase } from '../helpers/db.helpers';
import { Faction } from '@desperados/shared';

describe('NotificationService', () => {
  let character: any;

  beforeEach(async () => {
    await clearDatabase();

    const user = await User.create({
      email: 'user@test.com',
      passwordHash: 'hash',
      emailVerified: true
    });

    character = await Character.create({
      userId: user._id,
      name: 'TestChar',
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 0,
        hairStyle: 0,
        hairColor: 0
      },
      currentLocation: 'frontera-town',
      gold: 100
    });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('createNotification', () => {
    it('should create notification', async () => {
      const notification = await NotificationService.createNotification(
        character._id,
        NotificationType.MAIL_RECEIVED,
        'New Mail',
        'You received a new mail',
        '/mail/123'
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe(NotificationType.MAIL_RECEIVED);
      expect(notification.title).toBe('New Mail');
      expect(notification.message).toBe('You received a new mail');
      expect(notification.link).toBe('/mail/123');
      expect(notification.isRead).toBe(false);
    });

    it('should create different notification types', async () => {
      const types = [
        NotificationType.FRIEND_REQUEST,
        NotificationType.FRIEND_ACCEPTED,
        NotificationType.COMBAT_DEFEAT
      ];

      for (const type of types) {
        await NotificationService.createNotification(
          character._id,
          type,
          'Test',
          'Test message',
          '/test'
        );
      }

      const notifications = await Notification.find({ characterId: character._id });
      expect(notifications.length).toBe(3);
    });
  });

  describe('getNotifications', () => {
    beforeEach(async () => {
      await Notification.create([
        {
          characterId: character._id,
          type: NotificationType.MAIL_RECEIVED,
          title: 'Notification 1',
          message: 'Message 1',
          link: '/link1',
          isRead: false
        },
        {
          characterId: character._id,
          type: NotificationType.FRIEND_REQUEST,
          title: 'Notification 2',
          message: 'Message 2',
          link: '/link2',
          isRead: false
        },
        {
          characterId: character._id,
          type: NotificationType.FRIEND_ACCEPTED,
          title: 'Notification 3',
          message: 'Message 3',
          link: '/link3',
          isRead: true
        }
      ]);
    });

    it('should fetch notifications with pagination', async () => {
      const { notifications, total, unreadCount } = await NotificationService.getNotifications(
        character._id,
        10,
        0
      );

      expect(notifications.length).toBe(3);
      expect(total).toBe(3);
      expect(unreadCount).toBe(2);
    });

    it('should respect limit and offset', async () => {
      const { notifications } = await NotificationService.getNotifications(
        character._id,
        1,
        1
      );

      expect(notifications.length).toBe(1);
    });
  });

  describe('getUnreadCount', () => {
    it('should return correct unread count', async () => {
      await Notification.create([
        {
          characterId: character._id,
          type: NotificationType.MAIL_RECEIVED,
          title: 'Unread 1',
          message: 'Message',
          link: '/link',
          isRead: false
        },
        {
          characterId: character._id,
          type: NotificationType.MAIL_RECEIVED,
          title: 'Unread 2',
          message: 'Message',
          link: '/link',
          isRead: false
        },
        {
          characterId: character._id,
          type: NotificationType.MAIL_RECEIVED,
          title: 'Read',
          message: 'Message',
          link: '/link',
          isRead: true
        }
      ]);

      const count = await NotificationService.getUnreadCount(character._id);
      expect(count).toBe(2);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = await Notification.create({
        characterId: character._id,
        type: NotificationType.MAIL_RECEIVED,
        title: 'Test',
        message: 'Message',
        link: '/link',
        isRead: false
      });

      await NotificationService.markAsRead(
        notification._id.toString(),
        character._id
      );

      const updated = await Notification.findById(notification._id);
      expect(updated?.isRead).toBe(true);
    });

    it('should fail if notification not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(
        NotificationService.markAsRead(fakeId, character._id)
      ).rejects.toThrow('Notification not found');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      await Notification.create([
        {
          characterId: character._id,
          type: NotificationType.MAIL_RECEIVED,
          title: 'Unread 1',
          message: 'Message',
          link: '/link',
          isRead: false
        },
        {
          characterId: character._id,
          type: NotificationType.MAIL_RECEIVED,
          title: 'Unread 2',
          message: 'Message',
          link: '/link',
          isRead: false
        }
      ]);

      const count = await NotificationService.markAllAsRead(character._id);
      expect(count).toBe(2);

      const unreadCount = await NotificationService.getUnreadCount(character._id);
      expect(unreadCount).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      const notification = await Notification.create({
        characterId: character._id,
        type: NotificationType.MAIL_RECEIVED,
        title: 'Test',
        message: 'Message',
        link: '/link'
      });

      await NotificationService.deleteNotification(
        notification._id.toString(),
        character._id
      );

      const deleted = await Notification.findById(notification._id);
      expect(deleted).toBeNull();
    });
  });
});
