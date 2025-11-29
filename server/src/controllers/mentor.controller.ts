/**
 * Mentor Controller
 * Handles mentor API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { MentorService } from '../services/mentor.service';
import { asyncHandler } from '../middleware/asyncHandler';

/**
 * Get all mentors
 * GET /api/mentors
 */
export const getAllMentors = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const mentors = await MentorService.getMentors();

    res.status(200).json({
      success: true,
      data: { mentors }
    });
  }
);

/**
 * Get available mentors for current character
 * GET /api/mentors/available
 */
export const getAvailableMentors = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const mentors = await MentorService.getAvailableMentors(characterId);

    res.status(200).json({
      success: true,
      data: { mentors }
    });
  }
);

/**
 * Get mentor details
 * GET /api/mentors/:mentorId
 */
export const getMentorDetails = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { mentorId } = req.params;
    const mentor = await MentorService.getMentorDetails(mentorId);

    // If character is authenticated, check if they can become a mentee
    let eligibility = null;
    if (req.character) {
      const characterId = req.character._id.toString();
      eligibility = await MentorService.canBecomeMentee(characterId, mentorId);
    }

    res.status(200).json({
      success: true,
      data: {
        mentor,
        eligibility
      }
    });
  }
);

/**
 * Get current mentor
 * GET /api/mentors/current
 */
export const getCurrentMentor = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const current = await MentorService.getCurrentMentor(characterId);

    if (!current) {
      return res.status(200).json({
        success: true,
        data: {
          mentor: null,
          mentorship: null,
          message: 'No active mentor'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        mentor: current.mentor,
        mentorship: current.mentorship
      }
    });
  }
);

/**
 * Request mentorship
 * POST /api/mentors/:mentorId/request
 */
export const requestMentorship = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { mentorId } = req.params;

    const result = await MentorService.requestMentorship(characterId, mentorId);

    res.status(200).json({
      success: true,
      data: result
    });
  }
);

/**
 * Leave current mentor
 * POST /api/mentors/leave
 */
export const leaveMentor = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const result = await MentorService.leaveMentor(characterId);

    res.status(200).json({
      success: true,
      data: result
    });
  }
);

/**
 * Get unlocked abilities
 * GET /api/mentors/abilities
 */
export const getMentorAbilities = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const abilities = await MentorService.getMentorAbilities(characterId);

    res.status(200).json({
      success: true,
      data: { abilities }
    });
  }
);

/**
 * Use a mentor ability
 * POST /api/mentors/abilities/:abilityId/use
 */
export const useAbility = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { abilityId } = req.params;

    const result = await MentorService.useAbility(characterId, abilityId);

    res.status(200).json({
      success: true,
      data: result
    });
  }
);

/**
 * Get mentorship statistics
 * GET /api/mentors/stats
 */
export const getMentorshipStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const stats = await MentorService.getMentorshipStats(characterId);

    res.status(200).json({
      success: true,
      data: stats
    });
  }
);
