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

const router = Router();

router.use(authenticate, requireCharacter);

router.post('/send', sendMail);
router.get('/inbox', getInbox);
router.get('/sent', getSentMail);
router.get('/unread-count', getUnreadCount);
router.get('/:id', getMail);
router.post('/:id/claim', claimAttachment);
router.delete('/:id', deleteMail);
router.post('/:id/report', reportMail);

export default router;
