/**
 * Calendar Event Service
 * Phase 3 - Production Polish
 *
 * Handles calendar-triggered events: holidays, moon phases, flavor events
 * Implements the 7 TODO calendar events from calendarTick.job.ts
 */

import mongoose from 'mongoose';
import { WorldEvent } from '../models/WorldEvent.model';
import { NPC } from '../models/NPC.model';
import { Location } from '../models/Location.model';
import { Character } from '../models/Character.model';
import socketService from '../config/socket';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

// Event effect types
interface EventEffect {
  type: string;
  modifier?: number;
  enabled?: boolean;
  duration?: number;
}

// World event creation options
interface WorldEventOptions {
  type: string;
  subtype?: string;
  title: string;
  description: string;
  effects: Record<string, unknown>;
  durationHours: number;
  broadcastMessage?: string;
  broadcastType?: string;
}

export class CalendarEventService {
  /**
   * FIX #1: Store and broadcast flavor event
   * Implements TODO at calendarTick.job.ts:91
   */
  static async handleFlavorEvent(
    eventText: string,
    month: number,
    day: number
  ): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      // Store in world events
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      await WorldEvent.create(
        [
          {
            type: 'flavor',
            title: 'Daily Happening',
            description: eventText,
            startDate: now,
            endDate: expiresAt,
            isActive: true,
            effects: {
              month,
              day,
              eventType: 'flavor',
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // Broadcast to online players via WebSocket
      socketService.broadcastEvent('world:flavor-event', {
        message: eventText,
        month,
        day,
        timestamp: now.toISOString(),
      });

      logger.info(`[CalendarEvent] Flavor event broadcast: ${eventText.substring(0, 50)}...`);
    } catch (error) {
      await session.abortTransaction();
      logger.error('[CalendarEvent] Failed to handle flavor event:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * FIX #2: Full Moon - Spawn supernatural encounters
   * Implements TODO at calendarTick.job.ts:123
   */
  static async handleFullMoon(): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      logger.info('[CalendarEvent] 🌕 Full Moon event triggered');

      // Create full moon world event
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      await WorldEvent.create(
        [
          {
            type: 'moon_phase',
            subtype: 'full_moon',
            title: 'Full Moon Rising',
            description: 'The full moon bathes the frontier in silver light. Strange howls echo across the land...',
            startDate: now,
            endDate: expiresAt,
            isActive: true,
            effects: {
              supernaturalEncounterChance: 0.5,
              ghostSpawnRate: 2.0,
              werewolfActive: true,
              illumination: 1.0,
            },
          },
        ],
        { session }
      );

      // Increase ghost spawn rate at haunted locations
      await Location.updateMany(
        { type: { $in: ['cemetery', 'abandoned', 'haunted', 'ruins'] } },
        {
          $set: {
            'temporaryModifiers.ghostChance': 0.5,
            'temporaryModifiers.expiresAt': expiresAt,
          },
        },
        { session }
      );

      // Spawn werewolf NPCs at wilderness locations (limit to 5)
      const wildernessLocations = await Location.find({
        type: { $in: ['forest', 'wilderness', 'mountain', 'canyon'] },
      })
        .limit(10)
        .session(session);

      const spawnLocations = SecureRNG.shuffle([...wildernessLocations]).slice(0, 5);

      for (const location of spawnLocations) {
        await NPC.create(
          [
            {
              name: 'Mysterious Howler',
              type: 'creature',
              subtype: 'werewolf',
              locationId: location._id,
              isTemporary: true,
              expiresAt,
              stats: {
                level: SecureRNG.range(12, 18),
                health: SecureRNG.range(180, 250),
                damage: SecureRNG.range(25, 40),
              },
              loot: [
                { item: 'werewolf_pelt', chance: 0.3 },
                { item: 'moon_silver', chance: 0.1 },
              ],
              hostile: true,
              respawnable: false,
            },
          ],
          { session }
        );
      }

      await session.commitTransaction();

      // Broadcast to players
      socketService.broadcastEvent('world:event', {
        type: 'full_moon',
        message: '🌕 The full moon rises... Strange howls echo across the frontier.',
        effects: ['increased_supernatural', 'werewolf_spawns', 'ghost_sightings'],
        duration: 24 * 60 * 60 * 1000,
      });

      logger.info(`[CalendarEvent] Full moon: Spawned ${spawnLocations.length} werewolves`);
    } catch (error) {
      await session.abortTransaction();
      logger.error('[CalendarEvent] Failed to handle full moon:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * FIX #3: New Moon - Boost criminal activity
   * Implements TODO at calendarTick.job.ts:129
   */
  static async handleNewMoon(): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      logger.info('[CalendarEvent] 🌑 New Moon event triggered');

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Create new moon world event
      await WorldEvent.create(
        [
          {
            type: 'moon_phase',
            subtype: 'new_moon',
            title: 'Darkness Falls',
            description: 'The new moon cloaks the land in darkness. Perfect cover for those who work in shadows...',
            startDate: now,
            endDate: expiresAt,
            isActive: true,
            effects: {
              crimeDifficultyModifier: -0.2, // 20% easier crimes
              crimeRewardModifier: 1.15, // 15% better rewards
              banditSpawnRate: 1.5, // 50% more bandits
              detectionChanceModifier: -0.25, // Harder to detect
              illumination: 0.0,
            },
          },
        ],
        { session }
      );

      // Spawn additional bandit NPCs
      const roadLocations = await Location.find({
        type: { $in: ['road', 'trail', 'pass', 'crossing'] },
      })
        .limit(8)
        .session(session);

      const spawnLocations = SecureRNG.shuffle([...roadLocations]).slice(0, 4);

      for (const location of spawnLocations) {
        await NPC.create(
          [
            {
              name: SecureRNG.select(['Shadow Rider', 'Night Bandit', 'Moonless Marauder', 'Dark Trail Robber']),
              type: 'enemy',
              subtype: 'bandit',
              locationId: location._id,
              isTemporary: true,
              expiresAt,
              stats: {
                level: SecureRNG.range(8, 14),
                health: SecureRNG.range(80, 120),
                damage: SecureRNG.range(15, 25),
              },
              loot: [
                { item: 'gold', amount: SecureRNG.range(20, 50), chance: 0.8 },
                { item: 'stolen_goods', chance: 0.4 },
              ],
              hostile: true,
              respawnable: false,
            },
          ],
          { session }
        );
      }

      await session.commitTransaction();

      // Broadcast
      socketService.broadcastEvent('world:event', {
        type: 'new_moon',
        message: '🌑 The darkness of the new moon favors those who work in shadows...',
        effects: ['easier_crimes', 'more_bandits', 'reduced_detection'],
        duration: 24 * 60 * 60 * 1000,
      });

      logger.info(`[CalendarEvent] New moon: Crime difficulty reduced, spawned ${spawnLocations.length} bandits`);
    } catch (error) {
      await session.abortTransaction();
      logger.error('[CalendarEvent] Failed to handle new moon:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * FIX #4: Halloween - Supernatural celebration
   * Implements TODO at calendarTick.job.ts:143
   */
  static async handleHalloween(): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      logger.info('[CalendarEvent] 🎃 Halloween event triggered');

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours

      // Create Halloween world event
      await WorldEvent.create(
        [
          {
            type: 'holiday',
            subtype: 'halloween',
            title: "All Hallows' Eve",
            description: 'Spirits walk the earth tonight. The veil between worlds grows thin...',
            startDate: now,
            endDate: expiresAt,
            isActive: true,
            effects: {
              supernaturalEncounterChance: 0.5,
              ghostSpawnRate: 3.0,
              specialLootTable: 'halloween_seasonal',
              costumeShopEnabled: true,
              candyDropRate: 0.3,
              jackOLanternQuests: true,
            },
          },
        ],
        { session }
      );

      // Spawn ghost NPCs at all cemeteries and abandoned locations
      const hauntedLocations = await Location.find({
        type: { $in: ['cemetery', 'abandoned', 'haunted', 'church'] },
      }).session(session);

      for (const location of hauntedLocations) {
        await NPC.create(
          [
            {
              name: SecureRNG.select(['Restless Spirit', 'Wandering Shade', 'Haunted Soul', 'Spectral Wanderer']),
              type: 'creature',
              subtype: 'ghost',
              locationId: location._id,
              isTemporary: true,
              expiresAt,
              dialogue: [
                'Beware the witching hour...',
                'The veil is thin tonight...',
                'Can you help me find peace?',
                'Something stirs in the darkness...',
              ],
              stats: {
                level: SecureRNG.range(10, 20),
                health: SecureRNG.range(100, 200),
              },
              hostile: false, // Some are friendly quest givers
              canGiveQuest: SecureRNG.chance(0.3),
              loot: [
                { item: 'ectoplasm', chance: 0.4 },
                { item: 'spirit_essence', chance: 0.2 },
                { item: 'halloween_candy', chance: 0.5 },
              ],
            },
          ],
          { session }
        );
      }

      await session.commitTransaction();

      // Broadcast
      socketService.broadcastEvent('world:holiday', {
        type: 'halloween',
        message: '🎃 Happy Halloween! The spirits are restless tonight... Trick or treat?',
        effects: ['ghost_spawns', 'supernatural_quests', 'costume_shop', 'candy_drops'],
        duration: 48 * 60 * 60 * 1000,
      });

      logger.info(`[CalendarEvent] Halloween: Spawned ${hauntedLocations.length} ghosts`);
    } catch (error) {
      await session.abortTransaction();
      logger.error('[CalendarEvent] Failed to handle Halloween:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * FIX #5: Independence Day - Patriotic celebration
   * Implements TODO at calendarTick.job.ts:148
   */
  static async handleIndependenceDay(): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      logger.info('[CalendarEvent] 🎆 Independence Day event triggered');

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Create Independence Day world event
      await WorldEvent.create(
        [
          {
            type: 'holiday',
            subtype: 'independence_day',
            title: 'Independence Day Celebration',
            description: 'Towns across the frontier celebrate with contests, fireworks, and festivities!',
            startDate: now,
            endDate: expiresAt,
            isActive: true,
            effects: {
              shootingContestBonus: 1.5, // 50% better shooting contest rewards
              townActivityBoost: 2.0, // Double town activity
              fireworksEnabled: true,
              patrioticQuestsAvailable: true,
              shopDiscounts: 0.1, // 10% shop discounts
              paradeDutyQuests: true,
            },
          },
        ],
        { session }
      );

      // Spawn celebration NPCs in towns
      const townLocations = await Location.find({
        type: { $in: ['town', 'city', 'settlement'] },
      }).session(session);

      for (const town of townLocations) {
        // Spawn contest organizer
        await NPC.create(
          [
            {
              name: 'Shooting Contest Organizer',
              type: 'npc',
              subtype: 'event_npc',
              locationId: town._id,
              isTemporary: true,
              expiresAt,
              dialogue: [
                "Step right up! Today's the day to show your shootin' skills!",
                'Special Independence Day contest - double the prizes!',
                "The finest marksman in the territory will be crowned today!",
              ],
              canGiveQuest: true,
              questType: 'shooting_contest_special',
              hostile: false,
            },
          ],
          { session }
        );
      }

      await session.commitTransaction();

      // Broadcast
      socketService.broadcastEvent('world:holiday', {
        type: 'independence_day',
        message: '🎆 Happy Independence Day! Special shooting contests available in all towns!',
        effects: ['shooting_contests', 'fireworks', 'town_celebrations', 'shop_discounts'],
        duration: 24 * 60 * 60 * 1000,
      });

      logger.info(`[CalendarEvent] Independence Day: Set up contests in ${townLocations.length} towns`);
    } catch (error) {
      await session.abortTransaction();
      logger.error('[CalendarEvent] Failed to handle Independence Day:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * FIX #6: Christmas - Peace and gift-giving
   * Implements TODO at calendarTick.job.ts:153
   */
  static async handleChristmas(): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      logger.info('[CalendarEvent] 🎄 Christmas event triggered');

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours

      // Create Christmas world event
      await WorldEvent.create(
        [
          {
            type: 'holiday',
            subtype: 'christmas',
            title: 'Frontier Christmas',
            description: 'Even outlaws observe a truce for the holidays. A spirit of peace settles over the land.',
            startDate: now,
            endDate: expiresAt,
            isActive: true,
            effects: {
              gangCombatModifier: 0.3, // 70% reduction in gang violence
              giftExchangeEnabled: true,
              charityEventsEnabled: true,
              shopDiscounts: 0.2, // 20% discounts
              holidayQuestsAvailable: true,
              snowEffects: true,
              reputationGainBonus: 1.25, // 25% more reputation gains
            },
          },
        ],
        { session }
      );

      // Spawn Santa/gift-giver NPCs
      const townLocations = await Location.find({
        type: { $in: ['town', 'city', 'settlement'] },
      })
        .limit(5)
        .session(session);

      for (const town of townLocations) {
        await NPC.create(
          [
            {
              name: 'Holiday Gift Giver',
              type: 'npc',
              subtype: 'event_npc',
              locationId: town._id,
              isTemporary: true,
              expiresAt,
              dialogue: [
                'Merry Christmas, partner! Here, have a gift!',
                "The spirit of giving is strong this year!",
                'Even the toughest outlaws deserve a little Christmas cheer!',
              ],
              canGiveQuest: true,
              questType: 'christmas_charity',
              hostile: false,
              givesGift: true,
              giftCooldown: 24 * 60 * 60 * 1000, // Once per day per player
            },
          ],
          { session }
        );
      }

      await session.commitTransaction();

      // Broadcast
      socketService.broadcastEvent('world:holiday', {
        type: 'christmas',
        message: '🎄 Merry Christmas! A spirit of peace settles over the frontier... Gang truces in effect!',
        effects: ['gang_truce', 'gift_exchange', 'charity_events', 'shop_discounts'],
        duration: 72 * 60 * 60 * 1000,
      });

      logger.info(`[CalendarEvent] Christmas: Gang combat reduced, gift givers spawned`);
    } catch (error) {
      await session.abortTransaction();
      logger.error('[CalendarEvent] Failed to handle Christmas:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * FIX #7: Día de los Muertos - Spirit realm connection
   * Implements TODO at calendarTick.job.ts:158
   */
  static async handleDiaDeMuertos(): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      logger.info('[CalendarEvent] 💀 Día de los Muertos event triggered');

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      // Create Día de los Muertos world event
      await WorldEvent.create(
        [
          {
            type: 'holiday',
            subtype: 'dia_de_muertos',
            title: 'Día de los Muertos',
            description: 'The boundary between worlds grows thin. Honor the ancestors and they may share their wisdom.',
            startDate: now,
            endDate: expiresAt,
            isActive: true,
            effects: {
              spiritCommunicationEnabled: true,
              altarBuildingEnabled: true,
              ancestorQuestsAvailable: true,
              fronteraCoalitionBonus: 1.5, // 50% bonus for Frontera faction
              ofrendaRewards: true,
              marigoldDrops: true,
              sugarSkullCrafting: true,
            },
          },
        ],
        { session }
      );

      // Spawn ancestor spirit NPCs
      const cemeteryLocations = await Location.find({
        type: { $in: ['cemetery', 'memorial', 'shrine'] },
      }).session(session);

      for (const cemetery of cemeteryLocations) {
        await NPC.create(
          [
            {
              name: SecureRNG.select([
                'Ancestral Spirit',
                'Honored Ancestor',
                'Spirit of the Old Ways',
                'Departed Gunslinger',
              ]),
              type: 'spirit',
              subtype: 'ancestor',
              locationId: cemetery._id,
              isTemporary: true,
              expiresAt,
              dialogue: [
                'The living remember, and so we return...',
                'Build an altar, and I shall share my wisdom.',
                'The old ways must not be forgotten.',
                'Your ancestors watch over you, mijo...',
              ],
              canGiveQuest: true,
              questType: 'ancestor_wisdom',
              hostile: false,
              requiresOffering: true, // Need to build altar/give offering first
              factionAffinity: 'frontera', // Special bonuses for Frontera Coalition
            },
          ],
          { session }
        );
      }

      // Spawn special Coalition quest giver in Frontera territories
      const fronteraLocations = await Location.find({
        faction: 'frontera',
        type: { $in: ['town', 'settlement'] },
      })
        .limit(3)
        .session(session);

      for (const location of fronteraLocations) {
        await NPC.create(
          [
            {
              name: 'Curandera',
              type: 'npc',
              subtype: 'event_npc',
              locationId: location._id,
              isTemporary: true,
              expiresAt,
              dialogue: [
                'The spirits speak to those who listen...',
                'Today, the veil is thin. Come, let us honor the dead.',
                'The Coalition remembers its fallen heroes.',
              ],
              canGiveQuest: true,
              questType: 'dia_de_muertos_coalition',
              hostile: false,
              specialRewards: ['ancestor_blessing', 'spirit_token'],
            },
          ],
          { session }
        );
      }

      await session.commitTransaction();

      // Broadcast
      socketService.broadcastEvent('world:holiday', {
        type: 'dia_de_muertos',
        message: '💀 ¡Día de los Muertos! Build altars to communicate with ancestral spirits...',
        effects: ['spirit_communication', 'altar_building', 'ancestor_quests', 'coalition_bonus'],
        duration: 48 * 60 * 60 * 1000,
      });

      logger.info(`[CalendarEvent] Día de los Muertos: ${cemeteryLocations.length} ancestor spirits, ${fronteraLocations.length} curanderas`);
    } catch (error) {
      await session.abortTransaction();
      logger.error('[CalendarEvent] Failed to handle Día de los Muertos:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Cleanup expired event NPCs and effects
   */
  static async cleanupExpiredEvents(): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const now = new Date();

      // Remove expired temporary NPCs
      const deletedNPCs = await NPC.deleteMany(
        {
          isTemporary: true,
          expiresAt: { $lte: now },
        },
        { session }
      );

      // Deactivate expired world events
      const deactivatedEvents = await WorldEvent.updateMany(
        {
          isActive: true,
          endDate: { $lte: now },
        },
        { $set: { isActive: false } },
        { session }
      );

      // Clear expired location modifiers
      await Location.updateMany(
        {
          'temporaryModifiers.expiresAt': { $lte: now },
        },
        { $unset: { temporaryModifiers: '' } },
        { session }
      );

      await session.commitTransaction();

      if (deletedNPCs.deletedCount > 0 || deactivatedEvents.modifiedCount > 0) {
        logger.info(
          `[CalendarEvent] Cleanup: ${deletedNPCs.deletedCount} NPCs removed, ${deactivatedEvents.modifiedCount} events deactivated`
        );
      }
    } catch (error) {
      await session.abortTransaction();
      logger.error('[CalendarEvent] Failed to cleanup expired events:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get currently active calendar events
   */
  static async getActiveEvents(): Promise<unknown[]> {
    return WorldEvent.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).sort({ startDate: -1 });
  }
}

export default CalendarEventService;
