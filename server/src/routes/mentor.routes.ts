/**
 * Mentor Routes
 * Routes for mentor system and mentorship management
 */

import { Router } from 'express';
import {
  getAllMentors,
  getAvailableMentors,
  getMentorDetails,
  getCurrentMentor,
  requestMentorship,
  leaveMentor,
  getMentorAbilities,
  useAbility,
  getMentorshipStats
} from '../controllers/mentor.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

// Public routes - get all mentors
router.get('/', asyncHandler(getAllMentors));

// Protected routes - require auth and character
router.use(requireAuth);
router.use(requireCharacter);

// Get mentors available to current character
router.get('/available', asyncHandler(getAvailableMentors));

// Get current mentor
router.get('/current', asyncHandler(getCurrentMentor));

// Get unlocked abilities
router.get('/abilities', asyncHandler(getMentorAbilities));

// Get mentorship statistics
router.get('/stats', asyncHandler(getMentorshipStats));

// Leave current mentor
router.post('/leave', requireCsrfToken, asyncHandler(leaveMentor));

// Use a mentor ability
router.post('/abilities/:abilityId/use', requireCsrfToken, asyncHandler(useAbility));

// Get specific mentor details (can check eligibility if authenticated)
router.get('/:mentorId', asyncHandler(getMentorDetails));

// Request mentorship with a mentor
router.post('/:mentorId/request', requireCsrfToken, asyncHandler(requestMentorship));

export default router;
