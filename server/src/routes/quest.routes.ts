/**
 * Quest Routes
 * Routes for quest management
 */

import { Router } from 'express';
import {
  getAvailableQuests,
  getActiveQuests,
  getCompletedQuests,
  acceptQuest,
  abandonQuest,
  getQuestDetails,
  completeQuest
} from '../controllers/quest.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { detectSuspiciousEarning } from '../middleware/antiExploit.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { validate, QuestSchemas } from '../validation';

const router = Router();

// All quest routes require auth and character
router.use(requireAuth);
router.use(requireCharacter);

router.get('/available', asyncHandler(getAvailableQuests));
router.get('/active', asyncHandler(getActiveQuests));
router.get('/completed', asyncHandler(getCompletedQuests));
router.post('/accept', requireCsrfToken, validate(QuestSchemas.accept), detectSuspiciousEarning(), asyncHandler(acceptQuest));
router.post('/abandon', requireCsrfToken, validate(QuestSchemas.abandon), asyncHandler(abandonQuest));
router.post('/complete', requireCsrfToken, validate(QuestSchemas.complete), detectSuspiciousEarning(), asyncHandler(completeQuest));
router.get('/:questId', asyncHandler(getQuestDetails));

export default router;
