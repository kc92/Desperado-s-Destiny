/**
 * Mentor Service
 * Handles mentor system logic and mentorship relationships
 */

import mongoose from 'mongoose';
import { Mentorship, IMentorship } from '../models/Mentorship.model';
import { Character } from '../models/Character.model';
import { NPCTrust } from '../models/NPCTrust.model';
import { MENTORS, getMentorById } from '../data/mentors';
import {
  Mentor,
  MentorTrustLevel,
  MentorAbility,
  MentorshipRequestResponse,
  AbilityUseResponse,
  MentorProgressUpdate
} from '@desperados/shared';
import { AppError } from '../utils/errors';

export class MentorService {
  /**
   * Get all available mentors
   */
  static async getMentors(): Promise<Mentor[]> {
    return MENTORS;
  }

  /**
   * Get mentor details by ID
   */
  static async getMentorDetails(mentorId: string): Promise<Mentor> {
    const mentor = getMentorById(mentorId);
    if (!mentor) {
      throw new AppError('Mentor not found', 404);
    }
    return mentor;
  }

  /**
   * Check if character meets requirements to become a mentee
   */
  static async canBecomeMentee(
    characterId: string,
    mentorId: string
  ): Promise<{ canRequest: boolean; reasons: string[] }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const mentor = getMentorById(mentorId);
    if (!mentor) {
      throw new AppError('Mentor not found', 404);
    }

    const reasons: string[] = [];
    let canRequest = true;

    // Check if already has an active mentor
    const hasActiveMentor = await Mentorship.hasActiveMentor(characterId);
    if (hasActiveMentor) {
      reasons.push('You already have an active mentor');
      canRequest = false;
    }

    // Check level requirement
    if (character.level < mentor.requirements.minLevel) {
      reasons.push(`Requires level ${mentor.requirements.minLevel}`);
      canRequest = false;
    }

    // Check faction reputation
    if (mentor.requirements.minFactionRep) {
      const factionKey = mentor.faction.toLowerCase().replace(/\s+/g, '');
      const repKey = factionKey === 'settleralliance' ? 'settlerAlliance' :
                     factionKey === 'nahicoalition' ? 'nahiCoalition' :
                     factionKey === 'frontera' ? 'frontera' : null;

      if (repKey && character.factionReputation[repKey] < mentor.requirements.minFactionRep) {
        reasons.push(`Requires ${mentor.requirements.minFactionRep} reputation with ${mentor.faction}`);
        canRequest = false;
      }
    }

    // Check NPC trust
    const npcTrust = await NPCTrust.getTrustLevel(characterId, mentor.npcId);
    if (npcTrust < mentor.requirements.minNpcTrust) {
      reasons.push(`Requires ${mentor.requirements.minNpcTrust} trust with ${mentor.npcName}`);
      canRequest = false;
    }

    // Check no active bounty (for lawman)
    if (mentor.requirements.noActiveBounty && character.wantedLevel > 0) {
      reasons.push('Cannot have an active bounty');
      canRequest = false;
    }

    // Check criminal reputation (for outlaw)
    if (mentor.requirements.minCriminalRep && character.criminalReputation < mentor.requirements.minCriminalRep) {
      reasons.push(`Requires ${mentor.requirements.minCriminalRep} criminal reputation`);
      canRequest = false;
    }

    // Check skill requirements
    if (mentor.requirements.skills) {
      for (const [skillId, requiredLevel] of Object.entries(mentor.requirements.skills)) {
        const characterSkillLevel = character.getSkillLevel(skillId);
        if (characterSkillLevel < requiredLevel) {
          reasons.push(`Requires ${skillId} level ${requiredLevel}`);
          canRequest = false;
        }
      }
    }

    // Check conflicting mentors
    if (mentor.conflictsWith) {
      const history = await Mentorship.getMentorshipHistory(characterId);
      for (const pastMentorship of history) {
        const pastMentor = getMentorById(pastMentorship.mentorId);
        if (pastMentor && mentor.conflictsWith.includes(pastMentor.specialty)) {
          reasons.push(`Cannot study with ${mentor.npcName} after learning from ${pastMentor.npcName}`);
          canRequest = false;
        }
      }
    }

    return { canRequest, reasons };
  }

  /**
   * Request mentorship
   */
  static async requestMentorship(
    characterId: string,
    mentorId: string
  ): Promise<MentorshipRequestResponse> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Verify eligibility
      const { canRequest, reasons } = await this.canBecomeMentee(characterId, mentorId);
      if (!canRequest) {
        throw new AppError(`Cannot become mentee: ${reasons.join(', ')}`, 400);
      }

      const mentor = getMentorById(mentorId);
      if (!mentor) {
        throw new AppError('Mentor not found', 404);
      }

      // Create mentorship
      const mentorship = await Mentorship.create([{
        characterId: new mongoose.Types.ObjectId(characterId),
        mentorId,
        currentTrustLevel: MentorTrustLevel.ACQUAINTANCE,
        trustProgress: 0,
        unlockedAbilities: [],
        tasksCompleted: 0,
        storylineProgress: [],
        startedAt: new Date(),
        lastInteraction: new Date(),
        isActive: true
      }], { session });

      // Unlock first ability (Trust Level 1)
      const firstAbility = mentor.abilities.find(a => a.trustRequired === MentorTrustLevel.ACQUAINTANCE);
      if (firstAbility) {
        mentorship[0].unlockedAbilities.push(firstAbility.id);
        await mentorship[0].save({ session });
      }

      await session.commitTransaction();

      return {
        success: true,
        message: `You are now studying under ${mentor.npcName}!`,
        mentorship: mentorship[0].toObject() as any,
        mentor
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get current mentor for character
   */
  static async getCurrentMentor(characterId: string): Promise<{ mentorship: IMentorship; mentor: Mentor } | null> {
    const mentorship = await Mentorship.getActiveMentorship(characterId);
    if (!mentorship) {
      return null;
    }

    const mentor = getMentorById(mentorship.mentorId);
    if (!mentor) {
      return null;
    }

    return { mentorship, mentor };
  }

  /**
   * Get unlocked abilities for character's current mentor
   */
  static async getMentorAbilities(characterId: string): Promise<MentorAbility[]> {
    const current = await this.getCurrentMentor(characterId);
    if (!current) {
      return [];
    }

    const { mentorship, mentor } = current;

    return mentor.abilities.filter(ability =>
      mentorship.unlockedAbilities.includes(ability.id)
    );
  }

  /**
   * Advance mentorship to next trust level
   */
  static async advanceMentorship(
    characterId: string,
    tasksCompleted: number = 1
  ): Promise<MentorProgressUpdate | null> {
    const current = await this.getCurrentMentor(characterId);
    if (!current) {
      throw new AppError('No active mentorship', 404);
    }

    const { mentorship, mentor } = current;
    const previousTrustLevel = mentorship.currentTrustLevel;

    // Add progress
    mentorship.tasksCompleted += tasksCompleted;
    mentorship.trustProgress += tasksCompleted * 10; // Each task = 10% progress
    mentorship.lastInteraction = new Date();

    const newAbilitiesUnlocked: MentorAbility[] = [];

    // Check if ready to level up
    if (mentorship.trustProgress >= 100 && mentorship.currentTrustLevel < MentorTrustLevel.HEIR) {
      mentorship.currentTrustLevel += 1;
      mentorship.trustProgress = 0;

      // Unlock new abilities at this trust level
      const newAbilities = mentor.abilities.filter(
        a => a.trustRequired === mentorship.currentTrustLevel &&
             !mentorship.unlockedAbilities.includes(a.id)
      );

      for (const ability of newAbilities) {
        mentorship.unlockedAbilities.push(ability.id);
        newAbilitiesUnlocked.push(ability);
      }

      await mentorship.save();

      return {
        characterId,
        mentorId: mentor.mentorId,
        previousTrustLevel,
        newTrustLevel: mentorship.currentTrustLevel,
        newAbilitiesUnlocked,
        message: `Your bond with ${mentor.npcName} has grown stronger!`
      };
    }

    await mentorship.save();
    return null;
  }

  /**
   * Use a mentor ability
   */
  static async useAbility(
    characterId: string,
    abilityId: string
  ): Promise<AbilityUseResponse> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const current = await this.getCurrentMentor(characterId);
    if (!current) {
      throw new AppError('No active mentor', 404);
    }

    const { mentorship, mentor } = current;

    // Find the ability
    const ability = mentor.abilities.find(a => a.id === abilityId);
    if (!ability) {
      throw new AppError('Ability not found', 404);
    }

    // Check if unlocked
    if (!mentorship.unlockedAbilities.includes(abilityId)) {
      throw new AppError('Ability not unlocked', 403);
    }

    // Only check cooldown and energy for active abilities
    if (ability.type === 'active') {
      // Check cooldown
      const cooldowns = mentorship.activeAbilityCooldowns as Map<string, Date>;
      const cooldownEnd = cooldowns.get(abilityId);
      if (cooldownEnd && new Date() < cooldownEnd) {
        const remaining = Math.ceil((cooldownEnd.getTime() - Date.now()) / (60 * 1000));
        throw new AppError(`Ability on cooldown for ${remaining} minutes`, 400);
      }

      // Check energy cost
      if (ability.energyCost && !character.canAffordAction(ability.energyCost)) {
        throw new AppError(`Requires ${ability.energyCost} energy`, 400);
      }

      // Spend energy
      if (ability.energyCost) {
        character.spendEnergy(ability.energyCost);
        await character.save();
      }

      // Set cooldown
      if (ability.cooldown) {
        const cooldownUntil = new Date(Date.now() + ability.cooldown * 60 * 1000);
        cooldowns.set(abilityId, cooldownUntil);
        mentorship.activeAbilityCooldowns = cooldowns;
        await mentorship.save();

        return {
          success: true,
          message: `${ability.name} activated!`,
          ability,
          cooldownUntil,
          effects: ability.effects
        };
      }
    }

    // For passive and unlock abilities, just return success
    return {
      success: true,
      message: `${ability.name} is active`,
      ability,
      effects: ability.effects
    };
  }

  /**
   * Leave current mentor
   */
  static async leaveMentor(characterId: string): Promise<{ message: string }> {
    const mentorship = await Mentorship.getActiveMentorship(characterId);
    if (!mentorship) {
      throw new AppError('No active mentor', 404);
    }

    const mentor = getMentorById(mentorship.mentorId);
    const mentorName = mentor ? mentor.npcName : 'your mentor';

    // Deactivate mentorship
    mentorship.isActive = false;
    mentorship.leftAt = new Date();

    // Retain 50% of progress
    mentorship.retainedProgress = Math.floor(mentorship.trustProgress * 0.5);

    await mentorship.save();

    return {
      message: `You have parted ways with ${mentorName}. Some of your progress has been retained.`
    };
  }

  /**
   * Complete a mentor storyline quest
   */
  static async completeStorylineQuest(
    characterId: string,
    questId: string
  ): Promise<MentorProgressUpdate | null> {
    const current = await this.getCurrentMentor(characterId);
    if (!current) {
      throw new AppError('No active mentor', 404);
    }

    const { mentorship, mentor } = current;

    // Check if quest is part of mentor's storyline
    const storylineQuest = mentor.storyline.quests.find(q => q.questId === questId);
    if (!storylineQuest) {
      return null; // Not a mentor quest
    }

    // Add to completed quests
    if (!mentorship.storylineProgress.includes(questId)) {
      mentorship.storylineProgress.push(questId);
      await mentorship.save();

      // Storyline quests give significant progress
      return await this.advanceMentorship(characterId, 3);
    }

    return null;
  }

  /**
   * Get all mentors available to a character (meets requirements)
   */
  static async getAvailableMentors(characterId: string): Promise<Mentor[]> {
    const availableMentors: Mentor[] = [];

    for (const mentor of MENTORS) {
      const { canRequest } = await this.canBecomeMentee(characterId, mentor.mentorId);
      if (canRequest) {
        availableMentors.push(mentor);
      }
    }

    return availableMentors;
  }

  /**
   * Get mentorship statistics for a character
   */
  static async getMentorshipStats(characterId: string): Promise<{
    currentMentor: string | null;
    trustLevel: number;
    totalTasksCompleted: number;
    totalAbilitiesUnlocked: number;
    mentorshipHistory: number;
  }> {
    const current = await this.getCurrentMentor(characterId);
    const history = await Mentorship.getMentorshipHistory(characterId);

    const totalTasksCompleted = history.reduce((sum, m) => sum + m.tasksCompleted, 0);
    const totalAbilitiesUnlocked = history.reduce((sum, m) => sum + m.unlockedAbilities.length, 0);

    return {
      currentMentor: current ? current.mentor.npcName : null,
      trustLevel: current ? current.mentorship.currentTrustLevel : 0,
      totalTasksCompleted,
      totalAbilitiesUnlocked,
      mentorshipHistory: history.length
    };
  }
}
