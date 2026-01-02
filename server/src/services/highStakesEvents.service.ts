/**
 * High Stakes Events Service
 * Phase 13, Wave 13.1 - High Stakes Gambling Events
 *
 * Manages special gambling events, entry, prizes, and scheduling
 */

import { Character } from '../models/Character.model';
import { GamblingSession } from '../models/GamblingSession.model';
import { GamblingHistory } from '../models/GamblingHistory.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import {
  HighStakesEvent,
  EventRequirement,
  GamblingPrize
} from '@desperados/shared';
import {
  HIGH_STAKES_EVENTS,
  getHighStakesEventById,
  getActiveEvents,
  isEventActive,
  getNextEventTime
} from '../data/highStakesEvents';
import { AchievementService } from './achievement.service';
import { InventoryService } from './inventory.service';
import { getRedisClient, isRedisConnected } from '../config/redis';
import logger from '../utils/logger';

// Track event participants - Redis-backed for horizontal scaling
interface EventParticipation {
  eventId: string;
  characterId: string;
  joinedAt: string; // ISO string for Redis serialization
  position: number;
  score: number;
}

const EVENT_PARTICIPANTS_KEY_PREFIX = 'high-stakes:event:';
const EVENT_PARTICIPANTS_TTL = 86400; // 24 hours

/**
 * Get event participants from Redis
 */
async function getEventParticipants(eventId: string): Promise<EventParticipation[]> {
  if (!isRedisConnected()) {
    return [];
  }
  try {
    const client = getRedisClient();
    const data = await client.get(`${EVENT_PARTICIPANTS_KEY_PREFIX}${eventId}`);
    if (!data) return [];
    return JSON.parse(data) as EventParticipation[];
  } catch (error) {
    logger.warn('[HighStakesEvents] Failed to get participants from Redis:', error);
    return [];
  }
}

/**
 * Set event participants in Redis
 */
async function setEventParticipants(eventId: string, participants: EventParticipation[]): Promise<void> {
  if (!isRedisConnected()) {
    return;
  }
  try {
    const client = getRedisClient();
    await client.setEx(
      `${EVENT_PARTICIPANTS_KEY_PREFIX}${eventId}`,
      EVENT_PARTICIPANTS_TTL,
      JSON.stringify(participants)
    );
  } catch (error) {
    logger.warn('[HighStakesEvents] Failed to set participants in Redis:', error);
  }
}

/**
 * Delete event participants from Redis
 */
async function deleteEventParticipants(eventId: string): Promise<void> {
  if (!isRedisConnected()) {
    return;
  }
  try {
    const client = getRedisClient();
    await client.del(`${EVENT_PARTICIPANTS_KEY_PREFIX}${eventId}`);
  } catch (error) {
    logger.warn('[HighStakesEvents] Failed to delete participants from Redis:', error);
  }
}

/**
 * Get all available events
 */
export async function getAvailableEvents(currentDate: Date = new Date()): Promise<any[]> {
  const allEvents = Object.values(HIGH_STAKES_EVENTS);

  // Fetch all participant counts in parallel
  const participantCounts = await Promise.all(
    allEvents.map(async event => {
      const participants = await getEventParticipants(event.id);
      return participants.length;
    })
  );

  return allEvents.map((event, index) => ({
    id: event.id,
    name: event.name,
    description: event.description,
    entryFee: event.entryFee,
    prizePool: event.prizePool,
    isActive: isEventActive(event, currentDate),
    nextOccurrence: getNextEventTime(event, currentDate),
    currentParticipants: participantCounts[index],
    maxParticipants: event.maxParticipants,
    entryRequirements: event.entryRequirements
  }));
}

/**
 * Check if character meets event requirements
 */
export async function checkEventRequirements(
  characterId: string,
  eventId: string
): Promise<{ meets: boolean; failures: string[] }> {
  const event = getHighStakesEventById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  const character = await Character.findById(characterId);
  if (!character) {
    throw new Error('Character not found');
  }

  const history = await GamblingHistory.findByCharacter(characterId);
  const failures: string[] = [];
  // Use Total Level / 10 for backward compat with level requirements
  const effectiveLevel = Math.floor((character.totalLevel || 30) / 10);

  for (const req of event.entryRequirements) {
    switch (req.type) {
      case 'LEVEL':
        if (effectiveLevel < req.value) {
          failures.push(`Total Level ${req.value * 10} required (you are at ${character.totalLevel || 30})`);
        }
        break;

      case 'REPUTATION':
        if (!history || history.gamblerReputation < req.value) {
          failures.push(`Gambler reputation ${req.value} required (you have ${history?.gamblerReputation || 0})`);
        }
        break;

      case 'CRIMINAL_REP':
        if (character.criminalReputation < req.value) {
          failures.push(`Criminal reputation ${req.value} required (you have ${character.criminalReputation})`);
        }
        break;

      case 'FACTION':
        if (character.faction !== req.value) {
          failures.push(`Must be ${req.value} faction`);
        }
        break;

      case 'ITEM':
        // TODO: Check if character has required item
        const hasItem = character.inventory.some(item => item.itemId === req.value);
        if (!hasItem) {
          failures.push(`Required item: ${req.value}`);
        }
        break;

      case 'ACHIEVEMENT':
        const hasAchievement = await AchievementService.hasAchievement(characterId, req.value as string);
        if (!hasAchievement) {
          failures.push(`Required achievement: ${req.value}`);
        }
        break;
    }
  }

  return {
    meets: failures.length === 0,
    failures
  };
}

/**
 * Join a high stakes event
 */
export async function joinEvent(
  eventId: string,
  characterId: string
): Promise<{
  success: boolean;
  event: HighStakesEvent;
  position: number;
  message: string;
}> {
  const event = getHighStakesEventById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  const character = await Character.findById(characterId);
  if (!character) {
    throw new Error('Character not found');
  }

  // Check if event is active
  if (!isEventActive(event, new Date())) {
    const nextTime = getNextEventTime(event, new Date());
    throw new Error(`Event is not currently active. Next occurrence: ${nextTime.toLocaleString()}`);
  }

  // Check requirements
  const { meets, failures } = await checkEventRequirements(characterId, eventId);
  if (!meets) {
    throw new Error(`Requirements not met: ${failures.join(', ')}`);
  }

  // Check if already joined
  const participants = await getEventParticipants(eventId);
  if (participants.some(p => p.characterId === characterId)) {
    throw new Error('You have already joined this event');
  }

  // Check capacity
  if (participants.length >= event.maxParticipants) {
    throw new Error('Event is full');
  }

  // Check dollars for entry fee
  if (!character.hasDollars(event.entryFee)) {
    throw new Error(`Insufficient dollars. Entry fee: ${event.entryFee} dollars`);
  }

  // Charge entry fee
  await character.deductDollars(event.entryFee, TransactionSource.GAMBLING_ENTRY_FEE);
  await character.save();

  // Add to participants
  const participation: EventParticipation = {
    eventId,
    characterId,
    joinedAt: new Date().toISOString(),
    position: participants.length + 1,
    score: 0
  };

  participants.push(participation);
  await setEventParticipants(eventId, participants);

  logger.info(`Character ${character.name} joined event ${event.name}`);

  return {
    success: true,
    event,
    position: participation.position,
    message: `Successfully joined ${event.name}! You are participant #${participation.position}.`
  };
}

/**
 * Update participant score
 */
export async function updateParticipantScore(
  eventId: string,
  characterId: string,
  scoreChange: number
): Promise<void> {
  const participants = await getEventParticipants(eventId);
  const participant = participants.find(p => p.characterId === characterId);

  if (participant) {
    participant.score += scoreChange;
    await setEventParticipants(eventId, participants);
  }
}

/**
 * Get event leaderboard
 */
export async function getEventLeaderboard(
  eventId: string
): Promise<any[]> {
  const participants = await getEventParticipants(eventId);

  // Sort by score descending
  const sorted = [...participants].sort((a, b) => b.score - a.score);

  // Fetch character names
  const leaderboard = await Promise.all(
    sorted.map(async (p, index) => {
      const character = await Character.findById(p.characterId);
      return {
        rank: index + 1,
        characterName: character?.name || 'Unknown',
        characterId: p.characterId,
        score: p.score
      };
    })
  );

  return leaderboard;
}

/**
 * End event and distribute prizes
 */
export async function endEvent(eventId: string): Promise<{
  winners: any[];
  prizesDistributed: number;
}> {
  const event = getHighStakesEventById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  const participants = await getEventParticipants(eventId);
  if (participants.length === 0) {
    logger.warn(`Event ${event.name} ended with no participants`);
    return { winners: [], prizesDistributed: 0 };
  }

  // Get final leaderboard
  const leaderboard = await getEventLeaderboard(eventId);

  // Distribute guaranteed prizes to all
  let prizesDistributed = 0;
  for (const participant of participants) {
    const character = await Character.findById(participant.characterId);
    if (!character) continue;

    for (const prize of event.guaranteedPrizes) {
      await awardPrize(character._id.toString(), prize);
      prizesDistributed += 1;
    }
  }

  // Distribute leaderboard prizes
  const winners: any[] = [];
  for (let i = 0; i < Math.min(event.leaderboardPrizes.length, leaderboard.length); i++) {
    const winner = leaderboard[i];
    const prize = event.leaderboardPrizes[i];

    await awardPrize(winner.characterId, prize);
    prizesDistributed += 1;

    winners.push({
      rank: winner.rank,
      characterName: winner.characterName,
      prize
    });

    // Update gambling history
    const history = await GamblingHistory.findByCharacter(winner.characterId);
    if (history) {
      (history as any).recordEventParticipation(i === 0, [prize]);
      await history.save();
    }
  }

  // Clear participants from Redis
  await deleteEventParticipants(eventId);

  logger.info(`Event ${event.name} ended. ${winners.length} winners, ${prizesDistributed} prizes distributed`);

  return {
    winners,
    prizesDistributed
  };
}

/**
 * Award a prize to a character
 */
async function awardPrize(characterId: string, prize: GamblingPrize): Promise<void> {
  const character = await Character.findById(characterId);
  if (!character) return;

  switch (prize.type) {
    case 'GOLD':
      await character.addDollars(prize.amount!, TransactionSource.GAMBLING_EVENT_PRIZE);
      await character.save();
      logger.info(`Awarded ${prize.amount} dollars to ${character.name}`);
      break;

    case 'ITEM':
      if (prize.itemId) {
        await InventoryService.addItems(
          characterId,
          [{ itemId: prize.itemId, quantity: prize.amount || 1 }],
          { type: 'other', id: 'high_stakes_prize', name: 'High Stakes Event Prize' }
        );
        logger.info(`Awarded item ${prize.itemId} to ${character.name}`);
      }
      break;

    case 'UNIQUE_ITEM':
      if (prize.itemId) {
        await InventoryService.addItems(
          characterId,
          [{ itemId: prize.itemId, quantity: 1 }],
          { type: 'other', id: 'high_stakes_unique_prize', name: 'Unique High Stakes Event Prize' }
        );
        logger.info(`Awarded unique item ${prize.itemId} to ${character.name}`);
      }
      break;

    case 'TITLE':
      if (prize.title) {
        // Add title to character's earned titles
        if (!character.earnedTitles) {
          character.earnedTitles = [];
        }
        if (!character.earnedTitles.includes(prize.title)) {
          character.earnedTitles.push(prize.title);
          await character.save();
        }
        logger.info(`Awarded title "${prize.title}" to ${character.name}`);
      }
      break;

    case 'REPUTATION':
      const history = await GamblingHistory.findByCharacter(characterId);
      if (history) {
        history.gamblerReputation = Math.min(100, history.gamblerReputation + (prize.amount || 0));
        await history.save();
      }
      logger.info(`Awarded ${prize.amount} reputation to ${character.name}`);
      break;
  }
}

/**
 * Get event details with current status
 */
export async function getEventDetails(eventId: string): Promise<any> {
  const event = getHighStakesEventById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  const participants = await getEventParticipants(eventId);
  const currentDate = new Date();

  return {
    ...event,
    isActive: isEventActive(event, currentDate),
    nextOccurrence: getNextEventTime(event, currentDate),
    currentParticipants: participants.length,
    spotsRemaining: event.maxParticipants - participants.length,
    leaderboard: participants.length > 0 ? await getEventLeaderboard(eventId) : []
  };
}

/**
 * Schedule event checks (called by cron job)
 */
export async function checkEventSchedules(): Promise<void> {
  const currentDate = new Date();
  const activeEvents = getActiveEvents(currentDate);

  for (const event of activeEvents) {
    const participants = await getEventParticipants(event.id);

    // Check if event should end
    const eventStart = getNextEventTime(event, new Date(currentDate.getTime() - event.duration * 60 * 1000));
    const eventEnd = new Date(eventStart.getTime() + event.duration * 60 * 1000);

    if (currentDate > eventEnd && participants.length > 0) {
      logger.info(`Auto-ending event: ${event.name}`);
      await endEvent(event.id);
    }
  }
}

export const HighStakesEventsService = {
  getAvailableEvents,
  checkEventRequirements,
  joinEvent,
  updateParticipantScore,
  getEventLeaderboard,
  endEvent,
  getEventDetails,
  checkEventSchedules
};
