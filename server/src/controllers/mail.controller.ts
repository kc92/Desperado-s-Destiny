/**
 * Mail Controller
 *
 * REST API endpoints for mail system
 */

import { Request, Response } from 'express';
import { MailService } from '../services/mail.service';
import { asyncHandler } from '../middleware/asyncHandler';

/**
 * Send mail
 * POST /api/mail/send
 */
export const sendMail = asyncHandler(async (req: Request, res: Response) => {
  const { recipientId, subject, body, goldAttachment } = req.body;

  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  if (!recipientId || !subject || !body) {
    res.status(400).json({
      success: false,
      message: 'Missing required fields: recipientId, subject, body'
    });
    return;
  }

  const mail = await MailService.sendMail(
    req.character._id,
    recipientId,
    subject,
    body,
    goldAttachment || 0
  );

  res.status(201).json({
    success: true,
    data: mail
  });
});

/**
 * Get inbox
 * GET /api/mail/inbox
 */
export const getInbox = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const unreadOnly = req.query.unread_only === 'true';
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

  const { mails, total, unreadCount } = await MailService.getInbox(
    req.character._id,
    unreadOnly,
    limit,
    offset
  );

  res.status(200).json({
    success: true,
    data: mails,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + mails.length < total
    },
    unreadCount
  });
});

/**
 * Get sent mail
 * GET /api/mail/sent
 */
export const getSentMail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

  const { mails, total } = await MailService.getSentMail(
    req.character._id,
    limit,
    offset
  );

  res.status(200).json({
    success: true,
    data: mails,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + mails.length < total
    }
  });
});

/**
 * Get single mail
 * GET /api/mail/:id
 */
export const getMail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  const mail = await MailService.getMail(id, req.character._id);

  res.status(200).json({
    success: true,
    data: mail
  });
});

/**
 * Claim gold attachment
 * POST /api/mail/:id/claim
 */
export const claimAttachment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  const goldClaimed = await MailService.claimAttachment(id, req.character._id);

  res.status(200).json({
    success: true,
    data: {
      goldClaimed
    }
  });
});

/**
 * Delete mail
 * DELETE /api/mail/:id
 */
export const deleteMail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  await MailService.deleteMail(id, req.character._id);

  res.status(200).json({
    success: true,
    message: 'Mail deleted successfully'
  });
});

/**
 * Get unread count
 * GET /api/mail/unread-count
 */
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const count = await MailService.getUnreadCount(req.character._id);

  res.status(200).json({
    success: true,
    data: {
      count
    }
  });
});

/**
 * Report mail
 * POST /api/mail/:id/report
 */
export const reportMail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.character) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  await MailService.reportMail(id, req.character._id);

  res.status(200).json({
    success: true,
    message: 'Mail reported successfully'
  });
});
