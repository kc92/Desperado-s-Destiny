/**
 * Mail Routes
 */

import { Router } from 'express';
import {
  sendMail,
  getInbox,
  getSentMail,
  getMail,
  claimAttachment,
  deleteMail,
  getUnreadCount,
  reportMail
} from '../controllers/mail.controller';
import { authenticate, requireCharacter } from '../middleware/auth.middleware';
import { mailRateLimitMiddleware } from '../middleware/mailRateLimiter';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

router.use(authenticate, requireCharacter);

// Apply rate limiter to mail send endpoint (20 mails/hour)
router.post('/send', requireCsrfToken, mailRateLimitMiddleware, asyncHandler(sendMail));
router.get('/inbox', asyncHandler(getInbox));
router.get('/sent', asyncHandler(getSentMail));
router.get('/unread-count', asyncHandler(getUnreadCount));
router.get('/:id', asyncHandler(getMail));
router.post('/:id/claim', requireCsrfToken, asyncHandler(claimAttachment));
router.delete('/:id', requireCsrfToken, asyncHandler(deleteMail));
router.post('/:id/report', requireCsrfToken, asyncHandler(reportMail));

export default router;
