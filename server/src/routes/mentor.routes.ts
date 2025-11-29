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
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';

const router = Router();

// Public routes - get all mentors
router.get('/', getAllMentors);

// Protected routes - require auth and character
router.use(requireAuth);
router.use(requireCharacter);

// Get mentors available to current character
router.get('/available', getAvailableMentors);

// Get current mentor
router.get('/current', getCurrentMentor);

// Get unlocked abilities
router.get('/abilities', getMentorAbilities);

// Get mentorship statistics
router.get('/stats', getMentorshipStats);

// Leave current mentor
router.post('/leave', leaveMentor);

// Use a mentor ability
router.post('/abilities/:abilityId/use', useAbility);

// Get specific mentor details (can check eligibility if authenticated)
router.get('/:mentorId', getMentorDetails);

// Request mentorship with a mentor
router.post('/:mentorId/request', requestMentorship);

export default router;
