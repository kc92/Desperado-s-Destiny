/**
 * Mail Service
 *
 * Handles all mail operations with transaction-safe gold escrow
 */

import mongoose from 'mongoose';
import DOMPurify from 'isomorphic-dompurify';
import { Mail, IMail } from '../models/Mail.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import { NotificationType } from '../models/Notification.model';
import { getSocketIO } from '../config/socket';
import { filterProfanity } from '../utils/profanityFilter';
import { acquireLockWithRetry, releaseLock } from '../utils/distributedLock';
import logger from '../utils/logger';

export class MailService {
  /**
   * Send mail with optional gold attachment (transaction-safe)
   *
   * @param senderId - Character sending mail
   * @param recipientId - Character receiving mail
   * @param subject - Mail subject
   * @param body - Mail body
   * @param goldAttachment - Gold to attach (optional)
   * @returns Created mail
   */
  static async sendMail(
    senderId: string | mongoose.Types.ObjectId,
    recipientId: string | mongoose.Types.ObjectId,
    subject: string,
    body: string,
    goldAttachment: number = 0
  ): Promise<IMail> {
    if (subject.length < 1 || subject.length > 100) {
      throw new Error('Subject must be between 1 and 100 characters');
    }

    if (body.length < 1 || body.length > 2000) {
      throw new Error('Body must be between 1 and 2000 characters');
    }

    if (goldAttachment < 0) {
      throw new Error('Gold attachment must be non-negative');
    }

    // SECURITY FIX: Sanitize HTML to prevent XSS attacks
    // Strip ALL HTML tags - mail should be plain text only
    const sanitizedSubject = DOMPurify.sanitize(subject, { ALLOWED_TAGS: [] });
    const sanitizedBody = DOMPurify.sanitize(body, { ALLOWED_TAGS: [] });

    // Filter profanity from subject and body
    const filteredSubject = filterProfanity(sanitizedSubject);
    const filteredBody = filterProfanity(sanitizedBody);

    const [sender, recipient] = await Promise.all([
      Character.findById(senderId),
      Character.findById(recipientId)
    ]);

    if (!sender) {
      throw new Error('Sender not found');
    }

    if (!recipient) {
      throw new Error('Recipient not found');
    }

    if (sender._id.toString() === recipient._id.toString()) {
      throw new Error('Cannot send mail to yourself');
    }

    let mail: IMail;

    if (goldAttachment > 0) {
      const session = await mongoose.startSession();

      try {
        await session.startTransaction();

        if (sender.dollars < goldAttachment) {
          throw new Error(`Insufficient dollars. Have $${sender.dollars}, need $${goldAttachment}`);
        }

        const { DollarService } = await import('./dollar.service');
        const { CurrencyType } = await import('../models/GoldTransaction.model');
        await DollarService.deductDollars(
          sender._id as mongoose.Types.ObjectId,
          goldAttachment,
          TransactionSource.MAIL_SENT,
          { recipientId: recipient._id, recipientName: recipient.name, currencyType: CurrencyType.DOLLAR },
          session
        );

        mail = (await Mail.create([{
          senderId: sender._id,
          senderName: sender.name,
          recipientId: recipient._id,
          recipientName: recipient.name,
          subject: filteredSubject,
          body: filteredBody,
          goldAttachment,
          goldClaimed: false,
          isRead: false,
          readAt: null,
          sentAt: new Date(),
          deletedBySender: false,
          deletedByRecipient: false
        }], { session }))[0];

        await session.commitTransaction();

        logger.info(
          `Mail sent with dollars: ${sender.name} -> ${recipient.name}, ` +
          `$${goldAttachment} attached`
        );
      } catch (error) {
        await session.abortTransaction();
        logger.error('Error sending mail with gold:', error);
        throw error;
      } finally {
        session.endSession();
      }
    } else {
      mail = await Mail.create({
        senderId: sender._id,
        senderName: sender.name,
        recipientId: recipient._id,
        recipientName: recipient.name,
        subject: filteredSubject,
        body: filteredBody,
        goldAttachment: 0,
        goldClaimed: false,
        isRead: false,
        readAt: null,
        sentAt: new Date(),
        deletedBySender: false,
        deletedByRecipient: false
      });

      logger.info(`Mail sent: ${sender.name} -> ${recipient.name}`);
    }

    const { NotificationService } = await import('./notification.service');
    await NotificationService.createNotification(
      recipient._id as mongoose.Types.ObjectId,
      NotificationType.MAIL_RECEIVED,
      `New Mail from ${sender.name}`,
      goldAttachment > 0
        ? `You received mail with $${goldAttachment} attached`
        : `You received mail: ${filteredSubject}`,
      `/mail/${mail._id}`
    );

    const io = getSocketIO();
    if (io) {
      io.to(`character:${recipient._id.toString()}`).emit('mail:received', {
        id: mail._id.toString(),
        senderName: sender.name,
        subject: mail.subject,
        goldAttachment: mail.goldAttachment,
        sentAt: mail.sentAt
      });
    }

    return mail;
  }

  /**
   * Get inbox (paginated)
   *
   * @param characterId - Character whose inbox to fetch
   * @param unreadOnly - Only fetch unread mail
   * @param limit - Maximum mails to return
   * @param offset - Number of mails to skip
   * @returns Mails, total count, and unread count
   */
  static async getInbox(
    characterId: string | mongoose.Types.ObjectId,
    unreadOnly: boolean = false,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    mails: IMail[];
    total: number;
    unreadCount: number;
  }> {
    const filter: Record<string, unknown> = {
      recipientId: characterId,
      deletedByRecipient: false
    };

    if (unreadOnly) {
      filter.isRead = false;
    }

    const [mails, total, unreadCount] = await Promise.all([
      Mail.find(filter)
        .sort({ sentAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean() as unknown as IMail[],
      Mail.countDocuments(filter),
      Mail.countDocuments({
        recipientId: characterId,
        deletedByRecipient: false,
        isRead: false
      })
    ]);

    return {
      mails,
      total,
      unreadCount
    };
  }

  /**
   * Get sent mail (paginated)
   *
   * @param characterId - Character whose sent mail to fetch
   * @param limit - Maximum mails to return
   * @param offset - Number of mails to skip
   * @returns Mails and total count
   */
  static async getSentMail(
    characterId: string | mongoose.Types.ObjectId,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    mails: IMail[];
    total: number;
  }> {
    const filter = {
      senderId: characterId,
      deletedBySender: false
    };

    const [mails, total] = await Promise.all([
      Mail.find(filter)
        .sort({ sentAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean() as unknown as IMail[],
      Mail.countDocuments(filter)
    ]);

    return {
      mails,
      total
    };
  }

  /**
   * Get a specific mail
   *
   * @param mailId - Mail to fetch
   * @param characterId - Character fetching mail (for permission check)
   * @returns Mail
   */
  static async getMail(
    mailId: string,
    characterId: string | mongoose.Types.ObjectId
  ): Promise<IMail> {
    const mail = await Mail.findById(mailId);

    if (!mail) {
      throw new Error('Mail not found');
    }

    const charObjectId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    if (mail.senderId.toString() !== charObjectId.toString() && mail.recipientId.toString() !== charObjectId.toString()) {
      throw new Error('You do not have permission to view this mail');
    }

    if (mail.recipientId.toString() === charObjectId.toString() && !mail.isRead) {
      await mail.markAsRead();
    }

    return mail;
  }

  /**
   * Claim gold attachment (transaction-safe with distributed locking)
   *
   * SECURITY FIX: Uses distributed lock + transaction to prevent race conditions
   * where two concurrent requests could both claim the same gold attachment.
   *
   * @param mailId - Mail with gold attachment
   * @param characterId - Character claiming gold
   * @returns Amount of gold claimed
   */
  static async claimAttachment(
    mailId: string,
    characterId: string | mongoose.Types.ObjectId
  ): Promise<number> {
    const charObjectId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    // SECURITY FIX: Acquire distributed lock to prevent race condition
    const lockKey = `lock:mail-claim:${mailId}`;
    const lockToken = await acquireLockWithRetry(lockKey, 10000, 10);

    if (!lockToken) {
      throw new Error('Unable to process claim - please try again');
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      // SECURITY FIX: Re-fetch mail INSIDE transaction to get latest state
      const mail = await Mail.findById(mailId).session(session);

      if (!mail) {
        throw new Error('Mail not found');
      }

      if (mail.recipientId.toString() !== charObjectId.toString()) {
        throw new Error('Only the recipient can claim the gold attachment');
      }

      if (mail.goldAttachment <= 0) {
        throw new Error('No dollar attachment to claim');
      }

      // SECURITY FIX: Check goldClaimed INSIDE transaction
      if (mail.goldClaimed) {
        throw new Error('Dollar attachment already claimed');
      }

      // Mark as claimed atomically within transaction
      mail.goldClaimed = true;
      mail.claimedAt = new Date();
      await mail.save({ session });

      const dollarsAmount = mail.goldAttachment;

      const { DollarService } = await import('./dollar.service');
      const { CurrencyType } = await import('../models/GoldTransaction.model');
      await DollarService.addDollars(
        charObjectId,
        dollarsAmount,
        TransactionSource.MAIL_ATTACHMENT_CLAIMED,
        { mailId: mail._id, senderName: mail.senderName, currencyType: CurrencyType.DOLLAR },
        session
      );

      await session.commitTransaction();

      logger.info(
        `Dollar attachment claimed: ${mail.recipientName} claimed $${dollarsAmount} ` +
        `from mail sent by ${mail.senderName}`
      );

      return dollarsAmount;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error claiming gold attachment:', error);
      throw error;
    } finally {
      session.endSession();
      // Always release the lock
      await releaseLock(lockKey, lockToken);
    }
  }

  /**
   * Delete mail (soft delete)
   *
   * @param mailId - Mail to delete
   * @param characterId - Character deleting mail
   */
  static async deleteMail(
    mailId: string,
    characterId: string | mongoose.Types.ObjectId
  ): Promise<void> {
    const mail = await Mail.findById(mailId);

    if (!mail) {
      throw new Error('Mail not found');
    }

    const charObjectId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    let role: 'sender' | 'recipient';

    if (mail.senderId.toString() === charObjectId.toString()) {
      role = 'sender';
    } else if (mail.recipientId.toString() === charObjectId.toString()) {
      role = 'recipient';
    } else {
      throw new Error('You do not have permission to delete this mail');
    }

    mail.softDelete(charObjectId, role);
    await mail.save();

    if (mail.deletedBySender && mail.deletedByRecipient) {
      await Mail.findByIdAndDelete(mailId);
      logger.info(`Mail permanently deleted: ${mailId}`);
    } else {
      logger.info(`Mail soft deleted by ${role}: ${mailId}`);
    }
  }

  /**
   * Get unread mail count
   *
   * @param characterId - Character to check
   * @returns Number of unread mails
   */
  static async getUnreadCount(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<number> {
    return Mail.countDocuments({
      recipientId: characterId,
      deletedByRecipient: false,
      isRead: false
    });
  }

  /**
   * Report mail (for admin review)
   *
   * @param mailId - Mail to report
   * @param reporterId - Character reporting the mail
   */
  static async reportMail(
    mailId: string,
    reporterId: string | mongoose.Types.ObjectId
  ): Promise<void> {
    const mail = await Mail.findById(mailId);

    if (!mail) {
      throw new Error('Mail not found');
    }

    logger.warn(
      `Mail reported: ${mailId} reported by character ${reporterId}. ` +
      `Sender: ${mail.senderName}, Recipient: ${mail.recipientName}, ` +
      `Subject: ${mail.subject}`
    );
  }
}
