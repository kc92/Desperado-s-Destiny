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
  getQuestDetails
} from '../controllers/quest.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';

const router = Router();

// All quest routes require auth and character
router.use(requireAuth);
router.use(requireCharacter);

router.get('/available', getAvailableQuests);
router.get('/active', getActiveQuests);
router.get('/completed', getCompletedQuests);
router.post('/accept', acceptQuest);
router.post('/abandon', abandonQuest);
router.get('/:questId', getQuestDetails);

export default router;
