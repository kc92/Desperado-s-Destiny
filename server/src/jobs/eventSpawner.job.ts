/**
 * Event Spawner Job
 *
 * Periodically spawns and manages world events based on game state
 * Runs hourly to create dynamic events that affect gameplay
 */

import mongoose from 'mongoose';
import WorldEvent, { WorldEventType, EventStatus, IWorldEvent } from '../models/WorldEvent.model';
import WorldState, { IWorldState, TimeOfDay } from '../models/WorldState.model';
import Location, { ILocation } from '../models/Location.model';
import { broadcastEvent } from '../config/socket';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * Event configuration for spawning
 */
interface EventConfig {
  type: WorldEventType;
  name: string;
  description: string;
  durationHours: number;
  rarity: number; // 0-100, lower = more rare
  timeRestrictions?: TimeOfDay[];
  regionRestrictions?: string[];
  isGlobal: boolean;
  effects: Array<{
    type: 'price_modifier' | 'danger_modifier' | 'reputation_modifier' | 'spawn_rate' | 'travel_time' | 'energy_cost';
    target: string;
    value: number;
    description: string;
  }>;
  participationRewards: Array<{
    type: 'dollars' | 'xp' | 'item' | 'reputation' | 'achievement';
    amount: number;
  }>;
  newsHeadline?: string;
  gossipRumors?: string[];
}

/**
 * Event configurations database
 */
const EVENT_CONFIGS: EventConfig[] = [
  // Economic Events
  {
    type: WorldEventType.GOLD_RUSH,
    name: 'Gold Rush',
    description: 'A new vein of gold has been discovered! Prospectors rush to stake their claims.',
    durationHours: 4,
    rarity: 30,
    isGlobal: false,
    regionRestrictions: ['sangre_mountains', 'devils_canyon'],
    effects: [
      { type: 'price_modifier', target: 'gold_earned', value: 1.2, description: '+20% gold from all sources' },
    ],
    participationRewards: [
      { type: 'dollars', amount: 50 },
      { type: 'xp', amount: 25 },
    ],
    newsHeadline: 'Gold Strike! Fortune Seekers Flood the Mountains',
    gossipRumors: [
      'I heard someone found a nugget the size of their fist!',
      'The mountains are crawling with prospectors now.',
    ],
  },
  {
    type: WorldEventType.TRADE_CARAVAN,
    name: 'Trade Caravan Arrival',
    description: 'A wealthy trade caravan has arrived, bringing exotic goods and competitive prices.',
    durationHours: 3,
    rarity: 40,
    isGlobal: false,
    effects: [
      { type: 'price_modifier', target: 'shop_items', value: 0.85, description: '-15% shop prices' },
    ],
    participationRewards: [
      { type: 'dollars', amount: 25 },
    ],
    newsHeadline: 'Trade Caravan Brings Prosperity to Town',
  },
  {
    type: WorldEventType.MARKET_CRASH,
    name: 'Market Crash',
    description: 'Economic turmoil strikes! Prices plummet and desperation sets in.',
    durationHours: 6,
    rarity: 15,
    isGlobal: true,
    effects: [
      { type: 'price_modifier', target: 'shop_items', value: 0.7, description: '-30% shop prices' },
      { type: 'danger_modifier', target: 'all', value: 1.2, description: '+20% danger from desperation' },
    ],
    participationRewards: [],
    newsHeadline: 'Economic Disaster! Markets in Chaos',
    gossipRumors: [
      'Folks are getting desperate out there.',
      'The bank is running low on gold...',
    ],
  },
  {
    type: WorldEventType.SUPPLY_SHORTAGE,
    name: 'Supply Shortage',
    description: 'Supply lines have been disrupted, causing shortages across the frontier.',
    durationHours: 8,
    rarity: 25,
    isGlobal: true,
    effects: [
      { type: 'price_modifier', target: 'shop_items', value: 1.5, description: '+50% shop prices' },
    ],
    participationRewards: [],
    newsHeadline: 'Supply Crisis Grips Frontier',
  },

  // Combat/Danger Events
  {
    type: WorldEventType.BANDIT_RAID,
    name: 'Bandit Raid',
    description: 'A notorious bandit gang is terrorizing the area! High danger, but valuable loot.',
    durationHours: 2,
    rarity: 35,
    timeRestrictions: [TimeOfDay.DUSK, TimeOfDay.EVENING, TimeOfDay.NIGHT],
    isGlobal: false,
    effects: [
      { type: 'danger_modifier', target: 'all', value: 1.5, description: '+50% danger level' },
      { type: 'spawn_rate', target: 'loot', value: 1.5, description: '+50% loot quality' },
    ],
    participationRewards: [
      { type: 'dollars', amount: 75 },
      { type: 'xp', amount: 50 },
    ],
    newsHeadline: 'Bandits Strike! Town Under Siege',
    gossipRumors: [
      'Stay indoors tonight, bandits are on the loose!',
      'I heard they\'re after the bank\'s gold.',
    ],
  },
  {
    type: WorldEventType.MANHUNT,
    name: 'Manhunt',
    description: 'The law is hunting a dangerous outlaw. Lawmen patrol heavily.',
    durationHours: 3,
    rarity: 30,
    isGlobal: false,
    effects: [
      { type: 'danger_modifier', target: 'all', value: 0.7, description: '-30% danger level' },
      { type: 'spawn_rate', target: 'lawmen', value: 2.0, description: '+100% lawmen presence' },
    ],
    participationRewards: [
      { type: 'dollars', amount: 100 },
      { type: 'reputation', amount: 50 },
    ],
    newsHeadline: 'Manhunt Underway! Outlaw at Large',
    gossipRumors: [
      'The sheriff\'s deputized half the town.',
      'I saw a dozen lawmen ride out this morning.',
    ],
  },
  {
    type: WorldEventType.GANG_WAR,
    name: 'Gang War',
    description: 'Rival gangs are fighting for control! The streets aren\'t safe.',
    durationHours: 4,
    rarity: 20,
    timeRestrictions: [TimeOfDay.EVENING, TimeOfDay.NIGHT],
    isGlobal: false,
    effects: [
      { type: 'danger_modifier', target: 'all', value: 2.0, description: '+100% danger level' },
    ],
    participationRewards: [
      { type: 'dollars', amount: 150 },
      { type: 'xp', amount: 100 },
    ],
    newsHeadline: 'Gang War Erupts! Violence in the Streets',
    gossipRumors: [
      'I heard gunshots all night long.',
      'Two gangs are shooting it out near the saloon.',
    ],
  },
  {
    type: WorldEventType.LEGENDARY_BOUNTY,
    name: 'Legendary Bounty',
    description: 'A legendary outlaw has been spotted! Extreme danger, legendary rewards.',
    durationHours: 6,
    rarity: 5,
    isGlobal: false,
    effects: [
      { type: 'danger_modifier', target: 'all', value: 2.5, description: '+150% danger level' },
      { type: 'spawn_rate', target: 'legendary_npc', value: 1.0, description: 'Legendary NPC spawned' },
    ],
    participationRewards: [
      { type: 'dollars', amount: 500 },
      { type: 'xp', amount: 250 },
      { type: 'reputation', amount: 100 },
    ],
    newsHeadline: 'WANTED: Legendary Outlaw Spotted!',
    gossipRumors: [
      'They say he\'s never been caught alive.',
      'The bounty on his head could set you up for life.',
    ],
  },

  // Weather Events
  {
    type: WorldEventType.DUST_STORM,
    name: 'Dust Storm',
    description: 'A massive dust storm blankets the frontier, making travel treacherous.',
    durationHours: 3,
    rarity: 35,
    isGlobal: true,
    effects: [
      { type: 'travel_time', target: 'all', value: 1.5, description: '+50% travel time' },
      { type: 'energy_cost', target: 'travel', value: 1.5, description: '+50% travel energy cost' },
    ],
    participationRewards: [],
    newsHeadline: 'Dust Storm Warning! Travel Not Advised',
    gossipRumors: [
      'Can\'t see more than ten feet ahead.',
      'Best stay indoors till this blows over.',
    ],
  },
  {
    type: WorldEventType.HEAT_WAVE,
    name: 'Heat Wave',
    description: 'Scorching temperatures make outdoor activities exhausting.',
    durationHours: 8,
    rarity: 40,
    timeRestrictions: [TimeOfDay.NOON, TimeOfDay.AFTERNOON],
    isGlobal: true,
    effects: [
      { type: 'energy_cost', target: 'all_actions', value: 1.2, description: '+20% energy cost for all actions' },
    ],
    participationRewards: [],
    newsHeadline: 'Heat Wave Grips Frontier',
    gossipRumors: [
      'It\'s hot enough to fry an egg on a rock.',
      'Doc says to stay hydrated.',
    ],
  },
  {
    type: WorldEventType.FLASH_FLOOD,
    name: 'Flash Flood',
    description: 'Sudden rains cause dangerous flooding in low-lying areas.',
    durationHours: 2,
    rarity: 20,
    regionRestrictions: ['devils_canyon', 'border_territories'],
    isGlobal: false,
    effects: [
      { type: 'travel_time', target: 'all', value: 2.0, description: '+100% travel time' },
      { type: 'danger_modifier', target: 'all', value: 1.3, description: '+30% danger' },
    ],
    participationRewards: [],
    newsHeadline: 'Flash Flood Warning! Roads Impassable',
  },
  {
    type: WorldEventType.WILDFIRE,
    name: 'Wildfire',
    description: 'A raging wildfire threatens settlements and blocks travel routes.',
    durationHours: 6,
    rarity: 15,
    regionRestrictions: ['frontier', 'sacred_lands'],
    isGlobal: false,
    effects: [
      { type: 'danger_modifier', target: 'all', value: 1.8, description: '+80% danger' },
      { type: 'travel_time', target: 'affected_routes', value: 3.0, description: '+200% travel time on affected routes' },
    ],
    participationRewards: [],
    newsHeadline: 'WILDFIRE EMERGENCY! Evacuations Underway',
    gossipRumors: [
      'The whole hillside is ablaze!',
      'They\'re evacuating the settlements.',
    ],
  },

  // Social Events
  {
    type: WorldEventType.TOWN_FESTIVAL,
    name: 'Town Festival',
    description: 'The town is celebrating! Music, games, and good cheer all around.',
    durationHours: 6,
    rarity: 25,
    timeRestrictions: [TimeOfDay.AFTERNOON, TimeOfDay.EVENING],
    isGlobal: false,
    effects: [
      { type: 'price_modifier', target: 'shop_items', value: 0.9, description: '-10% shop prices' },
      { type: 'reputation_modifier', target: 'all', value: 1.1, description: '+10% XP gain' },
    ],
    participationRewards: [
      { type: 'dollars', amount: 30 },
      { type: 'xp', amount: 40 },
    ],
    newsHeadline: 'Town Festival Brings Joy to Frontier',
    gossipRumors: [
      'The dancing goes on till midnight!',
      'Best food I\'ve had in months.',
    ],
  },
  {
    type: WorldEventType.ELECTION,
    name: 'Town Election',
    description: 'Election day! The town gathers to choose new leadership.',
    durationHours: 4,
    rarity: 10,
    timeRestrictions: [TimeOfDay.MORNING, TimeOfDay.NOON, TimeOfDay.AFTERNOON],
    isGlobal: false,
    effects: [
      { type: 'reputation_modifier', target: 'political', value: 1.5, description: '+50% reputation gains' },
    ],
    participationRewards: [
      { type: 'reputation', amount: 50 },
    ],
    newsHeadline: 'Election Day! Vote for Your Future',
  },

  // Faction Events
  {
    type: WorldEventType.FACTION_RALLY,
    name: 'Faction Rally',
    description: 'A faction is gathering support and recruiting new members.',
    durationHours: 4,
    rarity: 30,
    isGlobal: false,
    effects: [
      { type: 'reputation_modifier', target: 'faction', value: 1.25, description: '+25% faction reputation' },
    ],
    participationRewards: [
      { type: 'reputation', amount: 75 },
    ],
    newsHeadline: 'Faction Rally Draws Crowds',
  },
  {
    type: WorldEventType.TERRITORY_DISPUTE,
    name: 'Territory Dispute',
    description: 'Factions are fighting over control of key territory.',
    durationHours: 8,
    rarity: 25,
    isGlobal: false,
    effects: [
      { type: 'danger_modifier', target: 'disputed_territory', value: 1.5, description: '+50% danger in disputed areas' },
    ],
    participationRewards: [
      { type: 'dollars', amount: 100 },
      { type: 'reputation', amount: 100 },
    ],
    newsHeadline: 'Territory Dispute Escalates!',
  },

  // Special Events
  {
    type: WorldEventType.METEOR_SHOWER,
    name: 'Meteor Shower',
    description: 'A spectacular celestial display lights up the night sky.',
    durationHours: 2,
    rarity: 8,
    timeRestrictions: [TimeOfDay.NIGHT],
    isGlobal: true,
    effects: [],
    participationRewards: [
      { type: 'xp', amount: 50 },
    ],
    newsHeadline: 'Meteor Shower Dazzles Frontier',
    gossipRumors: [
      'I\'ve never seen anything so beautiful.',
      'Some say it\'s a sign from the spirits.',
    ],
  },
  {
    type: WorldEventType.ECLIPSE,
    name: 'Solar Eclipse',
    description: 'The sun is blocked by the moon - an ominous and rare occurrence.',
    durationHours: 1,
    rarity: 3,
    timeRestrictions: [TimeOfDay.NOON, TimeOfDay.AFTERNOON],
    isGlobal: true,
    effects: [
      { type: 'danger_modifier', target: 'all', value: 1.2, description: '+20% danger (superstition)' },
    ],
    participationRewards: [
      { type: 'xp', amount: 100 },
    ],
    newsHeadline: 'ECLIPSE! The Sun Goes Dark',
    gossipRumors: [
      'It\'s a bad omen, I tell you.',
      'The spirits are restless today.',
    ],
  },
];

/**
 * Configuration constants
 */
const MAX_CONCURRENT_EVENTS = 5;
const MIN_CONCURRENT_EVENTS = 1;
const EVENT_SPAWN_CHANCE = 0.6; // 60% chance to spawn event per cycle

/**
 * Main event spawner function
 * Call this on an hourly schedule
 */
export async function spawnEvents(): Promise<void> {
  const lockKey = 'job:event-spawner';

  try {
    await withLock(lockKey, async () => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        logger.info('[EventSpawner] Starting event spawn cycle...');

    // Get world state
    const worldState = await WorldState.findOne().session(session);
    if (!worldState) {
      logger.warn('[EventSpawner] No world state found, skipping spawn cycle');
      await session.abortTransaction();
      return;
    }

    // Expire old events
    const expiredCount = await expireOldEvents(session);
    logger.info(`[EventSpawner] Expired ${expiredCount} old events`);

    // Get active events count
    const activeEvents = await WorldEvent.find({
      status: EventStatus.ACTIVE,
    }).session(session);

    logger.info(`[EventSpawner] Current active events: ${activeEvents.length}`);

    // Check if we should spawn new events
    if (activeEvents.length >= MAX_CONCURRENT_EVENTS) {
      logger.info('[EventSpawner] Max concurrent events reached, skipping spawn');
      await session.commitTransaction();
      return;
    }

    // Determine how many events to spawn
    const availableSlots = MAX_CONCURRENT_EVENTS - activeEvents.length;
    const shouldSpawn = SecureRNG.chance(EVENT_SPAWN_CHANCE);

    if (!shouldSpawn && activeEvents.length >= MIN_CONCURRENT_EVENTS) {
      logger.debug('[EventSpawner] Random chance failed, no new events spawned');
      await session.commitTransaction();
      return;
    }

    // Spawn 1-2 events based on available slots
    const eventsToSpawn = Math.min(SecureRNG.range(1, 2), availableSlots);
    logger.info(`[EventSpawner] Attempting to spawn ${eventsToSpawn} event(s)`);

    for (let i = 0; i < eventsToSpawn; i++) {
      const event = await selectAndCreateEvent(worldState, session);
      if (event) {
        logger.info(`[EventSpawner] Created event: ${event.name} (${event.type})`);

        // Emit socket event for new event
        try {
          broadcastEvent('world_event:started', {
            eventId: event._id,
            name: event.name,
            type: event.type,
            description: event.description,
            isGlobal: event.isGlobal,
            locationId: event.locationId,
            region: event.region,
            scheduledEnd: event.scheduledEnd,
            worldEffects: event.worldEffects,
            newsHeadline: event.newsHeadline,
          });
        } catch (socketError) {
          logger.debug('[EventSpawner] Socket broadcast failed (this is normal if no clients connected)');
        }
      }
    }

        await session.commitTransaction();
        logger.info('[EventSpawner] Event spawn cycle completed successfully');
      } catch (error) {
        await session.abortTransaction();
        logger.error('[EventSpawner] Error during event spawn cycle', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      } finally {
        session.endSession();
      }
    }, {
      ttl: 3600, // 60 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('[EventSpawner] Event spawner already running on another instance, skipping');
      return;
    }
    throw error;
  }
}

/**
 * Expire old events that have passed their end time
 */
async function expireOldEvents(session: mongoose.ClientSession): Promise<number> {
  const now = new Date();

  // Find active events that should be expired
  const expiredEvents = await WorldEvent.find({
    status: EventStatus.ACTIVE,
    scheduledEnd: { $lt: now },
  }).session(session);

  for (const event of expiredEvents) {
    event.status = EventStatus.COMPLETED;
    event.actualEnd = now;
    await event.save({ session });

    logger.info(`[EventSpawner] Expired event: ${event.name}`);

    // Emit socket event for expired event
    try {
      broadcastEvent('world_event:ended', {
        eventId: event._id,
        name: event.name,
        type: event.type,
      });
    } catch (socketError) {
      logger.debug('[EventSpawner] Socket broadcast failed (this is normal if no clients connected)');
    }
  }

  return expiredEvents.length;
}

/**
 * Select and create a new event based on world state
 */
async function selectAndCreateEvent(
  worldState: IWorldState,
  session: mongoose.ClientSession
): Promise<IWorldEvent | null> {
  // Filter event configs based on world state
  const eligibleConfigs = EVENT_CONFIGS.filter((config) => {
    // Check time restrictions
    if (config.timeRestrictions && !config.timeRestrictions.includes(worldState.timeOfDay)) {
      return false;
    }

    return true;
  });

  if (eligibleConfigs.length === 0) {
    logger.debug('[EventSpawner] No eligible events for current world state');
    return null;
  }

  // Weight selection by rarity (lower rarity = less likely)
  const totalWeight = eligibleConfigs.reduce((sum, config) => sum + config.rarity, 0);
  let random = SecureRNG.range(1, totalWeight);

  let selectedConfig: EventConfig | null = null;
  for (const config of eligibleConfigs) {
    random -= config.rarity;
    if (random <= 0) {
      selectedConfig = config;
      break;
    }
  }

  if (!selectedConfig) {
    selectedConfig = eligibleConfigs[eligibleConfigs.length - 1];
  }

  // Determine location for non-global events
  let locationId: mongoose.Types.ObjectId | undefined;
  let region: string | undefined;

  if (!selectedConfig.isGlobal) {
    const location = await selectRandomLocation(selectedConfig.regionRestrictions, session);
    if (location) {
      locationId = location._id;
      region = location.region;
    } else {
      region = selectedConfig.regionRestrictions?.[0] || 'frontier';
    }
  }

  // Create the event
  const now = new Date();
  const endTime = new Date(now.getTime() + selectedConfig.durationHours * 60 * 60 * 1000);

  const newEvent = new WorldEvent({
    name: selectedConfig.name,
    description: selectedConfig.description,
    type: selectedConfig.type,
    status: EventStatus.ACTIVE,
    isGlobal: selectedConfig.isGlobal,
    locationId,
    region,
    scheduledStart: now,
    scheduledEnd: endTime,
    actualStart: now,
    worldEffects: selectedConfig.effects,
    participationRewards: selectedConfig.participationRewards,
    completionRewards: [],
    participants: [],
    participantCount: 0,
    isRecurring: false,
    priority: selectedConfig.rarity < 10 ? 5 : selectedConfig.rarity < 20 ? 3 : 1,
    newsHeadline: selectedConfig.newsHeadline,
    gossipRumors: selectedConfig.gossipRumors,
  });

  await newEvent.save({ session });

  return newEvent;
}

/**
 * Select a random location for event placement
 */
async function selectRandomLocation(
  regionRestrictions: string[] | undefined,
  session: mongoose.ClientSession
): Promise<ILocation | null> {
  try {
    const query: any = { isHidden: false };

    if (regionRestrictions && regionRestrictions.length > 0) {
      query.region = { $in: regionRestrictions };
    }

    const locations = await Location.find(query).session(session).limit(50);

    if (locations.length === 0) {
      return null;
    }

    return SecureRNG.select(locations);
  } catch (error) {
    logger.error('[EventSpawner] Error selecting random location', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
}

/**
 * Manually trigger event expiration (can be called on-demand)
 */
export async function manualExpireEvents(): Promise<number> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const count = await expireOldEvents(session);
    await session.commitTransaction();
    return count;
  } catch (error) {
    await session.abortTransaction();
    logger.error('[EventSpawner] Error during manual event expiration', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Get current event spawner status
 */
export async function getEventSpawnerStatus(): Promise<{
  activeEvents: number;
  scheduledEvents: number;
  completedEvents: number;
  canSpawnMore: boolean;
}> {
  const activeEvents = await WorldEvent.countDocuments({ status: EventStatus.ACTIVE });
  const scheduledEvents = await WorldEvent.countDocuments({ status: EventStatus.SCHEDULED });
  const completedEvents = await WorldEvent.countDocuments({ status: EventStatus.COMPLETED });

  return {
    activeEvents,
    scheduledEvents,
    completedEvents,
    canSpawnMore: activeEvents < MAX_CONCURRENT_EVENTS,
  };
}

/**
 * Force spawn a specific event type (admin/testing use)
 */
export async function forceSpawnEvent(
  eventType: WorldEventType,
  locationId?: string
): Promise<IWorldEvent | null> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const config = EVENT_CONFIGS.find((c) => c.type === eventType);
    if (!config) {
      logger.error('[EventSpawner] Unknown event type', { eventType });
      return null;
    }

    const worldState = await WorldState.findOne().session(session);
    if (!worldState) {
      logger.error('[EventSpawner] No world state found');
      await session.abortTransaction();
      return null;
    }

    let location: ILocation | null = null;
    if (locationId) {
      location = await Location.findById(locationId).session(session);
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + config.durationHours * 60 * 60 * 1000);

    const newEvent = new WorldEvent({
      name: config.name,
      description: config.description,
      type: config.type,
      status: EventStatus.ACTIVE,
      isGlobal: config.isGlobal,
      locationId: location?._id,
      region: location?.region,
      scheduledStart: now,
      scheduledEnd: endTime,
      actualStart: now,
      worldEffects: config.effects,
      participationRewards: config.participationRewards,
      completionRewards: [],
      participants: [],
      participantCount: 0,
      isRecurring: false,
      priority: 5,
      newsHeadline: config.newsHeadline,
      gossipRumors: config.gossipRumors,
    });

    await newEvent.save({ session });
    await session.commitTransaction();

    logger.info(`[EventSpawner] Force spawned event: ${newEvent.name}`);

    // Emit socket event
    try {
      broadcastEvent('world_event:started', {
        eventId: newEvent._id,
        name: newEvent.name,
        type: newEvent.type,
        description: newEvent.description,
        isGlobal: newEvent.isGlobal,
        locationId: newEvent.locationId,
        region: newEvent.region,
        scheduledEnd: newEvent.scheduledEnd,
        worldEffects: newEvent.worldEffects,
        newsHeadline: newEvent.newsHeadline,
      });
    } catch (socketError) {
      logger.debug('[EventSpawner] Socket broadcast failed (this is normal if no clients connected)');
    }

    return newEvent;
  } catch (error) {
    await session.abortTransaction();
    logger.error('[EventSpawner] Error force spawning event', {
      eventType,
      locationId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  } finally {
    session.endSession();
  }
}

export default {
  spawnEvents,
  manualExpireEvents,
  getEventSpawnerStatus,
  forceSpawnEvent,
};
