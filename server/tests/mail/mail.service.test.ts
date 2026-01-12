/**
 * Mail Service Tests
 *
 * Tests for mail service with transaction-safe gold escrow
 */

import mongoose from 'mongoose';
import { MailService } from '../../src/services/mail.service';
import { Mail } from '../../src/models/Mail.model';
import { Character } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { GoldTransaction, TransactionSource } from '../../src/models/GoldTransaction.model';
import { Notification, NotificationType } from '../../src/models/Notification.model';
import { clearDatabase } from '../helpers/db.helpers';
import { Faction } from '@desperados/shared';

describe('MailService', () => {
  let sender: any;
  let recipient: any;

  beforeEach(async () => {
    await clearDatabase();

    const user1 = await User.create({
      email: 'sender@test.com',
      passwordHash: 'hash1',
      emailVerified: true
    });

    const user2 = await User.create({
      email: 'recipient@test.com',
      passwordHash: 'hash2',
      emailVerified: true
    });

    sender = await Character.create({
      userId: user1._id,
      name: 'Sender',
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 0,
        hairStyle: 0,
        hairColor: 0
      },
      currentLocation: 'frontera-town',
      dollars: 1000
    });

    recipient = await Character.create({
      userId: user2._id,
      name: 'Recipient',
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'female',
        skinTone: 3,
        facePreset: 1,
        hairStyle: 1,
        hairColor: 1
      },
      currentLocation: 'frontera-town',
      dollars: 500
    });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('sendMail', () => {
    it('should send mail without gold attachment', async () => {
      const mail = await MailService.sendMail(
        sender._id,
        recipient._id,
        'Test Subject',
        'Test Body'
      );

      expect(mail).toBeDefined();
      expect(mail.senderName).toBe('Sender');
      expect(mail.recipientName).toBe('Recipient');
      expect(mail.subject).toBe('Test Subject');
      expect(mail.body).toBe('Test Body');
      expect(mail.goldAttachment).toBe(0);
      expect(mail.goldClaimed).toBe(false);
      expect(mail.isRead).toBe(false);

      const notification = await Notification.findOne({ characterId: recipient._id });
      expect(notification).toBeDefined();
      expect(notification?.type).toBe(NotificationType.MAIL_RECEIVED);
    });

    it('should send mail with gold attachment (transaction-safe)', async () => {
      const mail = await MailService.sendMail(
        sender._id,
        recipient._id,
        'Gold Mail',
        'Here is some gold',
        100
      );

      expect(mail).toBeDefined();
      expect(mail.goldAttachment).toBe(100);
      expect(mail.goldClaimed).toBe(false);

      const updatedSender = await Character.findById(sender._id);
      expect(updatedSender?.dollars).toBe(900);

      const goldTx = await GoldTransaction.findOne({
        characterId: sender._id,
        source: TransactionSource.MAIL_SENT
      });
      expect(goldTx).toBeDefined();
      expect(goldTx?.amount).toBe(-100);
    });

    it('should fail if sender has insufficient dollars', async () => {
      await expect(
        MailService.sendMail(sender._id, recipient._id, 'Subject', 'Body', 2000)
      ).rejects.toThrow('Insufficient dollars');

      const mailCount = await Mail.countDocuments();
      expect(mailCount).toBe(0);

      const senderGold = (await Character.findById(sender._id))?.dollars;
      expect(senderGold).toBe(1000);
    });

    it('should fail if subject is too long', async () => {
      const longSubject = 'a'.repeat(101);
      await expect(
        MailService.sendMail(sender._id, recipient._id, longSubject, 'Body')
      ).rejects.toThrow();
    });

    it('should fail if body is too long', async () => {
      const longBody = 'a'.repeat(2001);
      await expect(
        MailService.sendMail(sender._id, recipient._id, 'Subject', longBody)
      ).rejects.toThrow();
    });

    it('should fail if recipient not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        MailService.sendMail(sender._id, fakeId, 'Subject', 'Body')
      ).rejects.toThrow('Recipient not found');
    });

    it('should fail if sending mail to self', async () => {
      await expect(
        MailService.sendMail(sender._id, sender._id, 'Subject', 'Body')
      ).rejects.toThrow('Cannot send mail to yourself');
    });
  });

  describe('getInbox', () => {
    beforeEach(async () => {
      await Mail.create({
        senderId: sender._id,
        senderName: sender.name,
        recipientId: recipient._id,
        recipientName: recipient.name,
        subject: 'Mail 1',
        body: 'Body 1',
        goldAttachment: 0,
        isRead: false
      });

      await Mail.create({
        senderId: sender._id,
        senderName: sender.name,
        recipientId: recipient._id,
        recipientName: recipient.name,
        subject: 'Mail 2',
        body: 'Body 2',
        goldAttachment: 50,
        isRead: true
      });
    });

    it('should fetch inbox with pagination', async () => {
      const { mails, total, unreadCount } = await MailService.getInbox(
        recipient._id,
        false,
        10,
        0
      );

      expect(mails.length).toBe(2);
      expect(total).toBe(2);
      expect(unreadCount).toBe(1);
    });

    it('should fetch only unread mail', async () => {
      const { mails, total, unreadCount } = await MailService.getInbox(
        recipient._id,
        true,
        10,
        0
      );

      expect(mails.length).toBe(1);
      expect(mails[0].subject).toBe('Mail 1');
      expect(unreadCount).toBe(1);
    });

    it('should not include deleted mail', async () => {
      const mail = await Mail.findOne({ subject: 'Mail 1' });
      mail!.deletedByRecipient = true;
      await mail!.save();

      const { mails, total } = await MailService.getInbox(recipient._id);
      expect(mails.length).toBe(1);
      expect(total).toBe(1);
    });
  });

  describe('claimAttachment', () => {
    it('should claim gold attachment (transaction-safe)', async () => {
      const mail = await Mail.create({
        senderId: sender._id,
        senderName: sender.name,
        recipientId: recipient._id,
        recipientName: recipient.name,
        subject: 'Gold Mail',
        body: 'Claim this',
        goldAttachment: 200,
        goldClaimed: false
      });

      const goldClaimed = await MailService.claimAttachment(
        mail._id.toString(),
        recipient._id
      );

      expect(goldClaimed).toBe(200);

      const updatedMail = await Mail.findById(mail._id);
      expect(updatedMail?.goldClaimed).toBe(true);

      const updatedRecipient = await Character.findById(recipient._id);
      expect(updatedRecipient?.dollars).toBe(700);

      const goldTx = await GoldTransaction.findOne({
        characterId: recipient._id,
        source: TransactionSource.MAIL_ATTACHMENT_CLAIMED
      });
      expect(goldTx).toBeDefined();
      expect(goldTx?.amount).toBe(200);
    });

    it('should prevent double-claim (race condition protection)', async () => {
      const mail = await Mail.create({
        senderId: sender._id,
        senderName: sender.name,
        recipientId: recipient._id,
        recipientName: recipient.name,
        subject: 'Gold Mail',
        body: 'Claim this',
        goldAttachment: 100,
        goldClaimed: false
      });

      await MailService.claimAttachment(mail._id.toString(), recipient._id);

      await expect(
        MailService.claimAttachment(mail._id.toString(), recipient._id)
      ).rejects.toThrow('already claimed');

      const updatedRecipient = await Character.findById(recipient._id);
      expect(updatedRecipient?.dollars).toBe(600);
    });

    it('should fail if non-recipient tries to claim', async () => {
      const mail = await Mail.create({
        senderId: sender._id,
        senderName: sender.name,
        recipientId: recipient._id,
        recipientName: recipient.name,
        subject: 'Gold Mail',
        body: 'Claim this',
        goldAttachment: 100,
        goldClaimed: false
      });

      await expect(
        MailService.claimAttachment(mail._id.toString(), sender._id)
      ).rejects.toThrow('Only the recipient can claim');
    });
  });

  describe('deleteMail', () => {
    it('should soft delete mail by sender', async () => {
      const mail = await Mail.create({
        senderId: sender._id,
        senderName: sender.name,
        recipientId: recipient._id,
        recipientName: recipient.name,
        subject: 'Test',
        body: 'Body'
      });

      await MailService.deleteMail(mail._id.toString(), sender._id);

      const updatedMail = await Mail.findById(mail._id);
      expect(updatedMail?.deletedBySender).toBe(true);
      expect(updatedMail?.deletedByRecipient).toBe(false);
    });

    it('should permanently delete when both delete', async () => {
      const mail = await Mail.create({
        senderId: sender._id,
        senderName: sender.name,
        recipientId: recipient._id,
        recipientName: recipient.name,
        subject: 'Test',
        body: 'Body'
      });

      await MailService.deleteMail(mail._id.toString(), sender._id);
      await MailService.deleteMail(mail._id.toString(), recipient._id);

      const deletedMail = await Mail.findById(mail._id);
      expect(deletedMail).toBeNull();
    });
  });

  describe('getUnreadCount', () => {
    it('should return correct unread count', async () => {
      await Mail.create([
        {
          senderId: sender._id,
          senderName: sender.name,
          recipientId: recipient._id,
          recipientName: recipient.name,
          subject: 'Unread 1',
          body: 'Body',
          isRead: false
        },
        {
          senderId: sender._id,
          senderName: sender.name,
          recipientId: recipient._id,
          recipientName: recipient.name,
          subject: 'Unread 2',
          body: 'Body',
          isRead: false
        },
        {
          senderId: sender._id,
          senderName: sender.name,
          recipientId: recipient._id,
          recipientName: recipient.name,
          subject: 'Read',
          body: 'Body',
          isRead: true
        }
      ]);

      const count = await MailService.getUnreadCount(recipient._id);
      expect(count).toBe(2);
    });
  });
});
