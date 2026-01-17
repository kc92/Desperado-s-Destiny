/**
 * War Event Scheduler Job
 *
 * Automatically schedules and manages faction war events
 * Phase 11, Wave 11.2 - Faction War Events System
 */

import mongoose from 'mongoose';
import {
  TerritoryFactionId,
  WarEventType,
  WarEventStatus,
  WAR_EVENT_CONFIG,
  WarEventTemplate,
} from '@desperados/shared';
import { FactionWarEvent, IFactionWarEvent } from '../models/FactionWarEvent.model';
import { Territory, ITerritory, TerritoryFaction } from '../models/Territory.model';
import { FactionWarService } from '../services/factionWar.service';
import {
  getTemplatesByType,
  getRandomTemplate,
} from '../data/warEventTemplates';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * Event spawn tracking
 */
interface SpawnTracking {
  lastSkirmish: Date | null;
  lastBattle: Date | null;
  lastCampaign: Date | null;
  lastWar: Date | null;
}

const spawnTracking: SpawnTracking = {
  lastSkirmish: null,
  lastBattle: null,
  lastCampaign: null,
  lastWar: null,
};

/**
 * Main scheduler function - call this hourly
 */
export async function scheduleWarEvents(): Promise<void> {
  const lockKey = 'job:war-event-scheduler';

  try {
    await withLock(lockKey, async () => {
      const session = await mongoose.startSession();
      await session.startTransaction();

      try {
        logger.info('[WarEventScheduler] Starting war event scheduling cycle...');

        // Update existing event phases
        const phasesUpdated = await FactionWarService.updateEventPhases();
        logger.info(`[WarEventScheduler] Updated ${phasesUpdated} event phases`);

        // Check for new event spawns
        await trySpawnSkirmish(session);
        await trySpawnBattle(session);
        await trySpawnCampaign(session);
        await trySpawnWar(session);

        await session.commitTransaction();
        logger.info('[WarEventScheduler] Scheduling cycle completed successfully');
      } catch (error) {
        await session.abortTransaction();
        logger.error('[WarEventScheduler] Error during scheduling cycle:', error);
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
      logger.debug('[WarEventScheduler] War event scheduler already running on another instance, skipping');
      return;
    }
    throw error;
  }
}

/**
 * Try to spawn a skirmish event (daily frequency)
 */
async function trySpawnSkirmish(session: mongoose.ClientSession): Promise<void> {
  const now = new Date();
  const config = WAR_EVENT_CONFIG.SKIRMISH;

  // Check cooldown (daily = 24 hours)
  if (spawnTracking.lastSkirmish) {
    const hoursSinceLast = (now.getTime() - spawnTracking.lastSkirmish.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLast < 24) {
      return; // Still in cooldown
    }
  }

  // Check active skirmishes
  const activeSkirmishes = await FactionWarEvent.countDocuments({
    eventType: WarEventType.SKIRMISH,
    status: { $in: [WarEventStatus.SCHEDULED, WarEventStatus.ACTIVE] },
  }).session(session);

  if (activeSkirmishes >= 3) {
    logger.info('[WarEventScheduler] Max active skirmishes reached');
    return;
  }

  // Random chance
  if (!SecureRNG.chance(0.7)) {
    logger.info('[WarEventScheduler] Skirmish spawn chance failed');
    return;
  }

  // Select random template
  const template = getRandomTemplate(WarEventType.SKIRMISH);
  if (!template) {
    logger.error('[WarEventScheduler] No skirmish templates available');
    return;
  }

  // Select factions and territory
  const { attacker, defender, territory } = await selectEventLocation(session, 'border');
  if (!territory) {
    logger.info('[WarEventScheduler] No suitable territory for skirmish');
    return;
  }

  // Create event
  try {
    const event = await FactionWarService.createWarEvent(
      template.id,
      attacker,
      defender,
      territory.id
    );

    spawnTracking.lastSkirmish = now;
    logger.info(
      `[WarEventScheduler] Created skirmish: ${event.name} at ${territory.name} (${attacker} vs ${defender})`
    );
  } catch (error) {
    logger.error('[WarEventScheduler] Error creating skirmish:', error);
  }
}

/**
 * Try to spawn a battle event (2-3 per week)
 */
async function trySpawnBattle(session: mongoose.ClientSession): Promise<void> {
  const now = new Date();
  const config = WAR_EVENT_CONFIG.BATTLE;

  // Check cooldown (48 hours)
  if (spawnTracking.lastBattle) {
    const hoursSinceLast = (now.getTime() - spawnTracking.lastBattle.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLast < 48) {
      return;
    }
  }

  // Check active battles
  const activeBattles = await FactionWarEvent.countDocuments({
    eventType: WarEventType.BATTLE,
    status: { $in: [WarEventStatus.SCHEDULED, WarEventStatus.ACTIVE] },
  }).session(session);

  if (activeBattles >= 2) {
    logger.info('[WarEventScheduler] Max active battles reached');
    return;
  }

  // Random chance (40%)
  if (!SecureRNG.chance(0.4)) {
    logger.info('[WarEventScheduler] Battle spawn chance failed');
    return;
  }

  // Select random template
  const template = getRandomTemplate(WarEventType.BATTLE);
  if (!template) {
    logger.error('[WarEventScheduler] No battle templates available');
    return;
  }

  // Select factions and territory
  const { attacker, defender, territory } = await selectEventLocation(session, 'strategic');
  if (!territory) {
    logger.info('[WarEventScheduler] No suitable territory for battle');
    return;
  }

  // Create event
  try {
    const event = await FactionWarService.createWarEvent(
      template.id,
      attacker,
      defender,
      territory.id
    );

    spawnTracking.lastBattle = now;
    logger.info(
      `[WarEventScheduler] Created battle: ${event.name} at ${territory.name} (${attacker} vs ${defender})`
    );
  } catch (error) {
    logger.error('[WarEventScheduler] Error creating battle:', error);
  }
}

/**
 * Try to spawn a campaign event (1-2 per month)
 */
async function trySpawnCampaign(session: mongoose.ClientSession): Promise<void> {
  const now = new Date();
  const config = WAR_EVENT_CONFIG.CAMPAIGN;

  // Check cooldown (2 weeks = 336 hours)
  if (spawnTracking.lastCampaign) {
    const hoursSinceLast = (now.getTime() - spawnTracking.lastCampaign.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLast < 336) {
      return;
    }
  }

  // Check active campaigns
  const activeCampaigns = await FactionWarEvent.countDocuments({
    eventType: WarEventType.CAMPAIGN,
    status: { $in: [WarEventStatus.SCHEDULED, WarEventStatus.ACTIVE] },
  }).session(session);

  if (activeCampaigns >= 1) {
    logger.info('[WarEventScheduler] Max active campaigns reached');
    return;
  }

  // Random chance (25%)
  if (!SecureRNG.chance(0.25)) {
    logger.info('[WarEventScheduler] Campaign spawn chance failed');
    return;
  }

  // Select random template
  const template = getRandomTemplate(WarEventType.CAMPAIGN);
  if (!template) {
    logger.error('[WarEventScheduler] No campaign templates available');
    return;
  }

  // Select factions and territory
  const { attacker, defender, territory } = await selectEventLocation(session, 'major');
  if (!territory) {
    logger.info('[WarEventScheduler] No suitable territory for campaign');
    return;
  }

  // Create event
  try {
    const event = await FactionWarService.createWarEvent(
      template.id,
      attacker,
      defender,
      territory.id
    );

    spawnTracking.lastCampaign = now;
    logger.info(
      `[WarEventScheduler] Created campaign: ${event.name} at ${territory.name} (${attacker} vs ${defender})`
    );
  } catch (error) {
    logger.error('[WarEventScheduler] Error creating campaign:', error);
  }
}

/**
 * Try to spawn a war event (quarterly)
 */
async function trySpawnWar(session: mongoose.ClientSession): Promise<void> {
  const now = new Date();
  const config = WAR_EVENT_CONFIG.WAR;

  // Check cooldown (90 days = 2160 hours)
  if (spawnTracking.lastWar) {
    const hoursSinceLast = (now.getTime() - spawnTracking.lastWar.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLast < 2160) {
      return;
    }
  }

  // Check active wars
  const activeWars = await FactionWarEvent.countDocuments({
    eventType: WarEventType.WAR,
    status: { $in: [WarEventStatus.SCHEDULED, WarEventStatus.ACTIVE] },
  }).session(session);

  if (activeWars >= 1) {
    logger.info('[WarEventScheduler] Max active wars reached');
    return;
  }

  // Random chance (5%)
  if (!SecureRNG.chance(0.05)) {
    logger.info('[WarEventScheduler] War spawn chance failed');
    return;
  }

  // Select random template
  const template = getRandomTemplate(WarEventType.WAR);
  if (!template) {
    logger.error('[WarEventScheduler] No war templates available');
    return;
  }

  // Select factions and territory
  const { attacker, defender, territory } = await selectEventLocation(session, 'capital');
  if (!territory) {
    logger.info('[WarEventScheduler] No suitable territory for war');
    return;
  }

  // Create event
  try {
    const event = await FactionWarService.createWarEvent(
      template.id,
      attacker,
      defender,
      territory.id
    );

    spawnTracking.lastWar = now;
    logger.info(
      `[WarEventScheduler] Created WAR: ${event.name} at ${territory.name} (${attacker} vs ${defender})`
    );
  } catch (error) {
    logger.error('[WarEventScheduler] Error creating war:', error);
  }
}

/**
 * Select event location and factions
 */
async function selectEventLocation(
  session: mongoose.ClientSession,
  type: 'border' | 'strategic' | 'major' | 'capital'
): Promise<{
  attacker: TerritoryFactionId;
  defender: TerritoryFactionId;
  territory: ITerritory | null;
}> {
  // Get all territories
  const territories = await Territory.find().session(session);

  if (territories.length === 0) {
    return { attacker: TerritoryFactionId.SETTLER_ALLIANCE, defender: TerritoryFactionId.FRONTERA_CARTEL, territory: null };
  }

  // Filter by type preference
  let candidates = territories;
  if (type === 'border') {
    // Prefer wilderness or neutral territories
    candidates = territories.filter(
      t => t.faction === TerritoryFaction.NEUTRAL || t.difficulty <= 4
    );
  } else if (type === 'strategic') {
    // Prefer controlled territories of medium difficulty
    candidates = territories.filter(t => t.controllingGangId && t.difficulty >= 4 && t.difficulty <= 7);
  } else if (type === 'major') {
    // Prefer high-value territories
    candidates = territories.filter(t => t.difficulty >= 6);
  } else if (type === 'capital') {
    // Only highest value territories
    candidates = territories.filter(t => t.difficulty >= 8);
  }

  // Fallback to all territories if no candidates
  if (candidates.length === 0) {
    candidates = territories;
  }

  // Select random territory
  const territory = SecureRNG.select(candidates);

  // Select factions based on territory
  let attacker: TerritoryFactionId;
  let defender: TerritoryFactionId;

  // Map territory faction to TerritoryFactionId
  const territoryFactionMap: Record<TerritoryFaction, TerritoryFactionId> = {
    [TerritoryFaction.SETTLER]: TerritoryFactionId.SETTLER_ALLIANCE,
    [TerritoryFaction.NAHI]: TerritoryFactionId.NAHI_COALITION,
    [TerritoryFaction.FRONTERA]: TerritoryFactionId.FRONTERA_CARTEL,
    [TerritoryFaction.NEUTRAL]: TerritoryFactionId.INDEPENDENT_OUTLAWS,
  };

  defender = territoryFactionMap[territory.faction];

  // Select random attacker (different from defender)
  const possibleAttackers = [
    TerritoryFactionId.SETTLER_ALLIANCE,
    TerritoryFactionId.NAHI_COALITION,
    TerritoryFactionId.FRONTERA_CARTEL,
    TerritoryFactionId.US_MILITARY,
    TerritoryFactionId.RAILROAD_BARONS,
    TerritoryFactionId.INDEPENDENT_OUTLAWS,
  ].filter(f => f !== defender);

  attacker = SecureRNG.select(possibleAttackers);

  return { attacker, defender, territory };
}

/**
 * Force spawn an event (admin/testing)
 */
export async function forceSpawnWarEvent(
  eventType: WarEventType,
  templateId?: string,
  territoryId?: string
): Promise<IFactionWarEvent> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get template
    const template = templateId
      ? getTemplatesByType(eventType).find(t => t.id === templateId)
      : getRandomTemplate(eventType);

    if (!template) {
      throw new Error(`No template found for event type: ${eventType}`);
    }

    // Get territory
    let territory: ITerritory | null = null;
    if (territoryId) {
      territory = await Territory.findBySlug(territoryId);
    } else {
      const territories = await Territory.find().session(session);
      territory = SecureRNG.select(territories);
    }

    if (!territory) {
      throw new Error('No territory available');
    }

    // Select factions
    const { attacker, defender } = await selectEventLocation(session, 'strategic');

    // Create event
    const event = await FactionWarService.createWarEvent(
      template.id,
      attacker,
      defender,
      territory.id
    );

    await session.commitTransaction();

    logger.info(`[WarEventScheduler] Force spawned ${eventType}: ${event.name}`);

    return event;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): {
  lastSpawns: SpawnTracking;
  nextEligible: {
    skirmish: Date | null;
    battle: Date | null;
    campaign: Date | null;
    war: Date | null;
  };
} {
  const now = new Date();

  return {
    lastSpawns: spawnTracking,
    nextEligible: {
      skirmish: spawnTracking.lastSkirmish
        ? new Date(spawnTracking.lastSkirmish.getTime() + 24 * 60 * 60 * 1000)
        : now,
      battle: spawnTracking.lastBattle
        ? new Date(spawnTracking.lastBattle.getTime() + 48 * 60 * 60 * 1000)
        : now,
      campaign: spawnTracking.lastCampaign
        ? new Date(spawnTracking.lastCampaign.getTime() + 336 * 60 * 60 * 1000)
        : now,
      war: spawnTracking.lastWar
        ? new Date(spawnTracking.lastWar.getTime() + 2160 * 60 * 60 * 1000)
        : now,
    },
  };
}

export default {
  scheduleWarEvents,
  forceSpawnWarEvent,
  getSchedulerStatus,
};
