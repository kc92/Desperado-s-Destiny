/**
 * World Event Service
 *
 * Manages dynamic world events, weather, and world state
 */

import mongoose from 'mongoose';
import { WorldEvent, IWorldEvent, WorldEventType, EventStatus } from '../models/WorldEvent.model';
import { WorldState, IWorldState, WeatherType, TimeOfDay, WEATHER_EFFECTS } from '../models/WorldState.model';
import { Character } from '../models/Character.model';
import { WeatherService } from './weather.service';
import { SecureRNG } from './base/SecureRNG';
import logger from '../utils/logger';
import { GoldService, TransactionSource } from './gold.service';

// Event templates for random generation
const EVENT_TEMPLATES: Partial<Record<WorldEventType, any>> = {
  [WorldEventType.BANDIT_RAID]: {
    name: 'Bandit Raid',
    description: 'A band of outlaws is attacking travelers on the roads!',
    duration: 60, // minutes
    effects: [
      { type: 'danger_modifier', target: 'all', value: 1.5, description: 'Increased danger on roads' },
    ],
    rewards: [
      { type: 'gold', amount: 50 },
      { type: 'xp', amount: 100 },
    ],
    newsHeadline: 'BANDITS TERRORIZE LOCAL ROADS',
    gossip: ['I heard bandits ambushed a wagon near the canyon...', 'Stay off the roads if you value your gold!'],
  },
  [WorldEventType.GOLD_RUSH]: {
    name: 'Gold Rush',
    description: 'A new gold vein has been discovered! Prospectors are flooding the area.',
    duration: 120,
    effects: [
      { type: 'price_modifier', target: 'tools', value: 1.5, description: 'Mining tools cost more' },
      { type: 'price_modifier', target: 'gold_ore', value: 0.8, description: 'Gold ore sells for less' },
    ],
    rewards: [
      { type: 'gold', amount: 100 },
      { type: 'xp', amount: 50 },
    ],
    newsHeadline: 'GOLD DISCOVERED! RUSH TO STAKE YOUR CLAIM',
    gossip: ['They say the new vein is the richest in decades!', 'Every fool and his brother is heading to the mines.'],
  },
  [WorldEventType.DUST_STORM]: {
    name: 'Dust Storm',
    description: 'A massive dust storm is sweeping through the region.',
    duration: 45,
    effects: [
      { type: 'travel_time', target: 'all', value: 1.5, description: 'Travel takes 50% longer' },
      { type: 'energy_cost', target: 'all', value: 1.3, description: 'Actions cost 30% more energy' },
    ],
    rewards: [],
    newsHeadline: 'DUST STORM WARNING - SEEK SHELTER',
    gossip: ['This storm came out of nowhere...', 'I can barely see my hand in front of my face!'],
  },
  [WorldEventType.TOWN_FESTIVAL]: {
    name: 'Town Festival',
    description: 'The town is celebrating! Enjoy special activities and discounts.',
    duration: 180,
    effects: [
      { type: 'price_modifier', target: 'drinks', value: 0.5, description: 'Drinks are half price' },
      { type: 'reputation_modifier', target: 'all', value: 1.2, description: 'Reputation gains increased' },
    ],
    rewards: [
      { type: 'xp', amount: 25 },
    ],
    newsHeadline: 'ANNUAL FESTIVAL BEGINS - CELEBRATE!',
    gossip: ['The festival food is amazing this year!', 'I heard they\'re having a shooting contest.'],
  },
  [WorldEventType.MANHUNT]: {
    name: 'Manhunt',
    description: 'A dangerous outlaw is on the loose. Help bring them to justice!',
    duration: 90,
    effects: [
      { type: 'danger_modifier', target: 'wilderness', value: 1.3, description: 'Wilderness more dangerous' },
    ],
    rewards: [
      { type: 'gold', amount: 200 },
      { type: 'xp', amount: 150 },
      { type: 'reputation', amount: 10, faction: 'settler' },
    ],
    newsHeadline: 'WANTED: DEAD OR ALIVE - $200 REWARD',
    gossip: ['That outlaw killed three deputies...', 'I saw someone matching the description heading north.'],
  },
  [WorldEventType.TRADE_CARAVAN]: {
    name: 'Trade Caravan',
    description: 'Merchants have arrived with rare goods from distant lands.',
    duration: 120,
    effects: [
      { type: 'price_modifier', target: 'rare_items', value: 0.8, description: 'Rare items discounted' },
    ],
    rewards: [
      { type: 'xp', amount: 30 },
    ],
    newsHeadline: 'TRADE CARAVAN ARRIVES WITH EXOTIC GOODS',
    gossip: ['The merchants have things I\'ve never seen before!', 'Get there early before they sell out.'],
  },
};

export class WorldEventService {
  /**
   * Initialize or get world state
   */
  static async getWorldState(): Promise<IWorldState> {
    let state = await WorldState.findOne();

    if (!state) {
      state = await WorldState.create({
        currentWeather: WeatherType.CLEAR,
        weatherEffects: WEATHER_EFFECTS[WeatherType.CLEAR],
        gameHour: 12,
        gameDay: 1,
        gameMonth: 6,
        gameYear: 1885,
        timeOfDay: TimeOfDay.NOON,
        factionPower: [
          { faction: 'settler', power: 33, trend: 'stable', controlledTerritories: 4 },
          { faction: 'nahi', power: 33, trend: 'stable', controlledTerritories: 4 },
          { faction: 'frontera', power: 34, trend: 'stable', controlledTerritories: 4 },
        ],
        currentHeadlines: ['Welcome to Desperados Destiny!'],
      });
    }

    return state;
  }

  /**
   * Update game time (call periodically)
   */
  static async updateGameTime(): Promise<IWorldState> {
    const state = await this.getWorldState();
    const now = new Date();
    const elapsed = now.getTime() - state.lastTimeUpdate.getTime();

    // 1 real minute = 15 game minutes
    const gameMinutesPassed = Math.floor(elapsed / (60 * 1000)) * 15;

    if (gameMinutesPassed > 0) {
      let newHour = state.gameHour + Math.floor(gameMinutesPassed / 60);
      let newDay = state.gameDay;
      let newMonth = state.gameMonth;
      let newYear = state.gameYear;

      // Roll over hours to days
      while (newHour >= 24) {
        newHour -= 24;
        newDay++;
      }

      // Roll over days to months (simplified 30-day months)
      while (newDay > 30) {
        newDay -= 30;
        newMonth++;
      }

      // Roll over months to years
      while (newMonth > 12) {
        newMonth -= 12;
        newYear++;
      }

      // Calculate time of day
      let timeOfDay: TimeOfDay;
      if (newHour >= 5 && newHour < 7) timeOfDay = TimeOfDay.DAWN;
      else if (newHour >= 7 && newHour < 12) timeOfDay = TimeOfDay.MORNING;
      else if (newHour >= 12 && newHour < 14) timeOfDay = TimeOfDay.NOON;
      else if (newHour >= 14 && newHour < 18) timeOfDay = TimeOfDay.AFTERNOON;
      else if (newHour >= 18 && newHour < 20) timeOfDay = TimeOfDay.DUSK;
      else if (newHour >= 20 && newHour < 22) timeOfDay = TimeOfDay.EVENING;
      else timeOfDay = TimeOfDay.NIGHT;

      state.gameHour = newHour;
      state.gameDay = newDay;
      state.gameMonth = newMonth;
      state.gameYear = newYear;
      state.timeOfDay = timeOfDay;
      state.lastTimeUpdate = now;

      await state.save();
    }

    return state;
  }

  /**
   * Update weather (call periodically)
   * Now uses regional weather system via WeatherService
   */
  static async updateWeather(): Promise<IWorldState> {
    const state = await WeatherService.updateWorldWeather();
    logger.info('Regional weather updated via WeatherService');
    return state;
  }

  /**
   * Create a random world event
   */
  static async createRandomEvent(locationId?: string): Promise<IWorldEvent> {
    const eventTypes = Object.keys(EVENT_TEMPLATES) as WorldEventType[];
    const randomType = SecureRNG.select(eventTypes);
    const template = EVENT_TEMPLATES[randomType];

    if (!template) {
      throw new Error(`No template for event type: ${randomType}`);
    }

    const now = new Date();
    const startTime = new Date(now.getTime() + SecureRNG.float(0, 1) * 30 * 60 * 1000); // Start within 30 min
    const endTime = new Date(startTime.getTime() + template.duration * 60 * 1000);

    const event = await WorldEvent.create({
      name: template.name,
      description: template.description,
      type: randomType,
      status: EventStatus.SCHEDULED,
      locationId: locationId ? new mongoose.Types.ObjectId(locationId) : undefined,
      isGlobal: !locationId,
      scheduledStart: startTime,
      scheduledEnd: endTime,
      worldEffects: template.effects,
      participationRewards: template.rewards,
      newsHeadline: template.newsHeadline,
      gossipRumors: template.gossip,
      priority: SecureRNG.range(1, 5),
    });

    logger.info(`Created world event: ${event.name} starting at ${startTime}`);

    return event;
  }

  /**
   * Start scheduled events that are due
   */
  static async startDueEvents(): Promise<IWorldEvent[]> {
    const now = new Date();

    const dueEvents = await WorldEvent.find({
      status: EventStatus.SCHEDULED,
      scheduledStart: { $lte: now },
    });

    const startedEvents: IWorldEvent[] = [];

    for (const event of dueEvents) {
      event.status = EventStatus.ACTIVE;
      event.actualStart = now;
      await event.save();

      // Add to world state headlines
      if (event.newsHeadline) {
        const state = await this.getWorldState();
        state.currentHeadlines.unshift(event.newsHeadline);
        state.currentHeadlines = state.currentHeadlines.slice(0, 10); // Keep last 10

        // Add gossip
        if (event.gossipRumors) {
          for (const rumor of event.gossipRumors) {
            state.recentGossip.unshift({ text: rumor, age: 0 });
          }
          state.recentGossip = state.recentGossip.slice(0, 20); // Keep last 20
        }

        await state.save();
      }

      startedEvents.push(event);
      logger.info(`Started world event: ${event.name}`);
    }

    return startedEvents;
  }

  /**
   * End expired events
   */
  static async endExpiredEvents(): Promise<IWorldEvent[]> {
    const now = new Date();

    const expiredEvents = await WorldEvent.find({
      status: EventStatus.ACTIVE,
      scheduledEnd: { $lte: now },
    });

    const endedEvents: IWorldEvent[] = [];

    for (const event of expiredEvents) {
      event.status = EventStatus.COMPLETED;
      event.actualEnd = now;

      // Reward participants
      for (const participant of event.participants) {
        if (!participant.rewarded && event.participationRewards.length > 0) {
          await this.rewardParticipant(participant.characterId.toString(), event);
          participant.rewarded = true;
        }
      }

      await event.save();
      endedEvents.push(event);
      logger.info(`Ended world event: ${event.name}`);
    }

    return endedEvents;
  }

  /**
   * Join an event as participant
   */
  static async joinEvent(characterId: string, eventId: string): Promise<{ success: boolean; message: string }> {
    const event = await WorldEvent.findById(eventId);

    if (!event) {
      return { success: false, message: 'Event not found' };
    }

    if (event.status !== EventStatus.ACTIVE) {
      return { success: false, message: 'Event is not active' };
    }

    if (event.maxParticipants && event.participantCount >= event.maxParticipants) {
      return { success: false, message: 'Event is full' };
    }

    const alreadyJoined = event.participants.some(
      (p) => p.characterId.toString() === characterId
    );

    if (alreadyJoined) {
      return { success: false, message: 'Already participating in this event' };
    }

    event.participants.push({
      characterId: new mongoose.Types.ObjectId(characterId),
      joinedAt: new Date(),
      contribution: 0,
      rewarded: false,
    });
    event.participantCount++;

    await event.save();

    return { success: true, message: `Joined event: ${event.name}` };
  }

  /**
   * Reward a participant
   */
  static async rewardParticipant(characterId: string, event: IWorldEvent): Promise<void> {
    const character = await Character.findById(characterId);
    if (!character) return;

    for (const reward of event.participationRewards) {
      switch (reward.type) {
        case 'dollars':
          await GoldService.addGold(
            characterId,
            reward.amount,
            TransactionSource.QUEST_REWARD,
            { eventId: event._id.toString(), eventName: event.name, eventType: event.type }
          );
          break;
        case 'xp':
          await character.addExperience(reward.amount);
          break;
        // Add more reward types as needed
      }
    }

    logger.info(`Rewarded character ${characterId} for event ${event.name}`);
  }

  /**
   * Get active events for display
   */
  static async getActiveEvents(): Promise<IWorldEvent[]> {
    return WorldEvent.find({ status: EventStatus.ACTIVE }).sort({ priority: -1 });
  }

  /**
   * Get upcoming events
   */
  static async getUpcomingEvents(hours: number = 24): Promise<IWorldEvent[]> {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return WorldEvent.find({
      status: EventStatus.SCHEDULED,
      scheduledStart: { $gte: now, $lte: future },
    }).sort({ scheduledStart: 1 });
  }

  /**
   * Add news headline
   */
  static async addNewsHeadline(headline: string): Promise<void> {
    const state = await this.getWorldState();
    state.currentHeadlines.unshift(headline);
    state.currentHeadlines = state.currentHeadlines.slice(0, 10);
    await state.save();
  }

  /**
   * Add gossip rumor
   */
  static async addGossip(text: string, location?: string): Promise<void> {
    const state = await this.getWorldState();
    state.recentGossip.unshift({ text, location, age: 0 });
    state.recentGossip = state.recentGossip.slice(0, 20);
    await state.save();
  }

  /**
   * Age gossip (call periodically)
   */
  static async ageGossip(): Promise<void> {
    const state = await this.getWorldState();

    state.recentGossip = state.recentGossip
      .map((g) => ({ ...g, age: g.age + 1 }))
      .filter((g) => g.age < 10); // Remove gossip older than 10 cycles

    await state.save();
  }
}

export default WorldEventService;
