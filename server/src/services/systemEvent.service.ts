/**
 * System Event Service
 * Central event dispatcher for cross-system integrations
 */

import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import {
  SystemEvent,
  SystemEventType,
  SystemName,
  SystemEventData,
  EventPriority,
  EventSubscription,
  EventDispatchResult,
  EventRouterConfig
} from '@desperados/shared';

/**
 * System Event Service - Coordinates cross-system events
 */
export class SystemEventService {
  private static subscriptions: Map<SystemName, EventSubscription[]> = new Map();
  private static eventQueue: SystemEvent[] = [];
  private static processing = false;

  /**
   * Default event routing configuration
   * Maps event types to target systems
   */
  private static readonly routerConfig: EventRouterConfig = {
    routes: {
      // Character Events
      [SystemEventType.CHARACTER_CREATED]: [
        SystemName.LEGACY,
        SystemName.QUEST,
        SystemName.ACHIEVEMENT,
        SystemName.NOTIFICATION
      ],
      [SystemEventType.CHARACTER_DELETED]: [
        SystemName.LEGACY,
        SystemName.GANG,
        SystemName.FRIEND
      ],
      [SystemEventType.CHARACTER_LEVEL_UP]: [
        SystemName.LEGACY,
        SystemName.QUEST,
        SystemName.ACHIEVEMENT,
        SystemName.NOTIFICATION
      ],
      [SystemEventType.CHARACTER_DIED]: [
        SystemName.LEGACY,
        SystemName.DEATH,
        SystemName.NOTIFICATION
      ],

      // Combat Events
      [SystemEventType.COMBAT_VICTORY]: [
        SystemName.LEGACY,
        SystemName.QUEST,
        SystemName.ACHIEVEMENT,
        SystemName.REPUTATION
      ],
      [SystemEventType.BOSS_DEFEATED]: [
        SystemName.LEGACY,
        SystemName.QUEST,
        SystemName.ACHIEVEMENT,
        SystemName.REPUTATION,
        SystemName.NEWSPAPER
      ],
      [SystemEventType.DUEL_WON]: [
        SystemName.LEGACY,
        SystemName.ACHIEVEMENT,
        SystemName.REPUTATION
      ],

      // Gold Events
      [SystemEventType.GOLD_EARNED]: [
        SystemName.LEGACY,
        SystemName.QUEST,
        SystemName.ACHIEVEMENT
      ],
      [SystemEventType.GOLD_SPENT]: [
        SystemName.LEGACY
      ],

      // Quest Events
      [SystemEventType.QUEST_COMPLETED]: [
        SystemName.LEGACY,
        SystemName.ACHIEVEMENT,
        SystemName.REPUTATION,
        SystemName.NOTIFICATION
      ],

      // Achievement Events
      [SystemEventType.ACHIEVEMENT_UNLOCKED]: [
        SystemName.LEGACY,
        SystemName.NOTIFICATION
      ],

      // Skill Events
      [SystemEventType.SKILL_LEVEL_UP]: [
        SystemName.LEGACY,
        SystemName.QUEST,
        SystemName.ACHIEVEMENT
      ],
      [SystemEventType.SKILL_MAXED]: [
        SystemName.LEGACY,
        SystemName.ACHIEVEMENT,
        SystemName.NOTIFICATION
      ],

      // Gang Events
      [SystemEventType.GANG_JOINED]: [
        SystemName.LEGACY,
        SystemName.ACHIEVEMENT,
        SystemName.NOTIFICATION
      ],
      [SystemEventType.GANG_RANK_CHANGED]: [
        SystemName.LEGACY,
        SystemName.NOTIFICATION
      ],

      // Territory Events
      [SystemEventType.TERRITORY_CAPTURED]: [
        SystemName.LEGACY,
        SystemName.ACHIEVEMENT,
        SystemName.GANG,
        SystemName.NEWSPAPER,
        SystemName.NOTIFICATION
      ],

      // Social Events
      [SystemEventType.FRIEND_ADDED]: [
        SystemName.LEGACY,
        SystemName.NOTIFICATION
      ],
      [SystemEventType.MAIL_SENT]: [
        SystemName.LEGACY,
        SystemName.NOTIFICATION
      ],

      // Reputation Events
      [SystemEventType.REPUTATION_GAINED]: [
        SystemName.LEGACY,
        SystemName.QUEST,
        SystemName.GOSSIP
      ],

      // Crime Events
      [SystemEventType.CRIME_COMMITTED]: [
        SystemName.QUEST,
        SystemName.REPUTATION,
        SystemName.GOSSIP
      ],
      [SystemEventType.JAILED]: [
        SystemName.NOTIFICATION,
        SystemName.GANG
      ],

      // Shop Events
      [SystemEventType.ITEM_PURCHASED]: [
        SystemName.LEGACY,
        SystemName.QUEST
      ],
      [SystemEventType.ITEM_SOLD]: [
        SystemName.LEGACY
      ],

      // Crafting Events
      [SystemEventType.ITEM_CRAFTED]: [
        SystemName.LEGACY,
        SystemName.QUEST,
        SystemName.ACHIEVEMENT
      ],

      // Property Events
      [SystemEventType.PROPERTY_PURCHASED]: [
        SystemName.LEGACY,
        SystemName.ACHIEVEMENT
      ],
      [SystemEventType.PROPERTY_INCOME]: [
        SystemName.GOLD,
        SystemName.LEGACY
      ],

      // Legacy Events
      [SystemEventType.MILESTONE_COMPLETED]: [
        SystemName.NOTIFICATION
      ],
      [SystemEventType.TIER_INCREASED]: [
        SystemName.NOTIFICATION,
        SystemName.ACHIEVEMENT
      ]
    } as Record<SystemEventType, SystemName[]>,
    defaultTargets: [SystemName.NOTIFICATION],
    processingTimeoutMs: 5000,
    retryAttempts: 3,
    retryDelayMs: 1000
  };

  /**
   * Dispatch an event to all interested systems
   */
  static async dispatch(
    source: SystemName,
    eventType: SystemEventType,
    data: SystemEventData,
    priority: EventPriority = EventPriority.NORMAL
  ): Promise<EventDispatchResult> {
    const startTime = Date.now();

    // Create event
    const event: SystemEvent = {
      id: uuidv4(),
      source,
      eventType,
      data: {
        ...data,
        timestamp: data.timestamp || new Date()
      },
      targets: this.routerConfig.routes[eventType] || this.routerConfig.defaultTargets,
      priority,
      timestamp: new Date(),
      processed: false,
      processedBy: []
    };

    logger.info(
      `[SystemEvent] Dispatching ${eventType} from ${source} to [${event.targets.join(', ')}]`,
      { eventId: event.id, data: event.data }
    );

    // Add to queue
    this.eventQueue.push(event);
    this.eventQueue.sort((a, b) => a.priority - b.priority);

    // Process queue
    if (!this.processing) {
      await this.processQueue();
    }

    // Build result
    const processingTime = Date.now() - startTime;
    const result: EventDispatchResult = {
      event,
      success: !event.errors || event.errors.length === 0,
      processedCount: event.processedBy.length,
      failedCount: event.errors?.length || 0,
      errors: event.errors?.map(e => ({ system: e.system, error: e.error })) || [],
      processingTimeMs: processingTime
    };

    return result;
  }

  /**
   * Process event queue
   */
  private static async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        if (!event) continue;

        await this.processEvent(event);
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process a single event
   */
  private static async processEvent(event: SystemEvent): Promise<void> {
    const errors: Array<{ system: SystemName; error: string; timestamp: Date }> = [];

    // Process for each target system
    for (const targetSystem of event.targets) {
      try {
        const subscriptions = this.subscriptions.get(targetSystem) || [];
        const relevantSubs = subscriptions.filter(sub =>
          sub.eventTypes.includes(event.eventType)
        );

        for (const subscription of relevantSubs) {
          try {
            await Promise.race([
              subscription.handler(event),
              this.timeout(this.routerConfig.processingTimeoutMs)
            ]);

            event.processedBy.push(targetSystem);
            logger.debug(
              `[SystemEvent] ${targetSystem} processed ${event.eventType}`,
              { eventId: event.id }
            );
          } catch (handlerError: any) {
            logger.error(
              `[SystemEvent] Handler error for ${targetSystem}:`,
              handlerError
            );
            errors.push({
              system: targetSystem,
              error: handlerError.message || 'Unknown error',
              timestamp: new Date()
            });
          }
        }
      } catch (error: any) {
        logger.error(
          `[SystemEvent] System error for ${targetSystem}:`,
          error
        );
        errors.push({
          system: targetSystem,
          error: error.message || 'Unknown error',
          timestamp: new Date()
        });
      }
    }

    event.processed = true;
    if (errors.length > 0) {
      event.errors = errors;
    }
  }

  /**
   * Subscribe a system to events
   */
  static subscribe(subscription: EventSubscription): void {
    const existing = this.subscriptions.get(subscription.system) || [];
    existing.push(subscription);
    this.subscriptions.set(subscription.system, existing);

    logger.info(
      `[SystemEvent] ${subscription.system} subscribed to ${subscription.eventTypes.length} event types`
    );
  }

  /**
   * Unsubscribe a system
   */
  static unsubscribe(system: SystemName): void {
    this.subscriptions.delete(system);
    logger.info(`[SystemEvent] ${system} unsubscribed`);
  }

  /**
   * Timeout helper
   */
  private static timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Event processing timeout')), ms)
    );
  }

  /**
   * Get event statistics
   */
  static getStats(): {
    queueLength: number;
    totalSubscriptions: number;
    subscriptionsBySystem: Record<string, number>;
  } {
    const subscriptionsBySystem: Record<string, number> = {};
    for (const [system, subs] of this.subscriptions.entries()) {
      subscriptionsBySystem[system] = subs.length;
    }

    return {
      queueLength: this.eventQueue.length,
      totalSubscriptions: Array.from(this.subscriptions.values()).reduce(
        (sum, subs) => sum + subs.length,
        0
      ),
      subscriptionsBySystem
    };
  }

  /**
   * Clear all subscriptions (for testing)
   */
  static clearSubscriptions(): void {
    this.subscriptions.clear();
    this.eventQueue = [];
  }

  /**
   * Emit convenience methods for common events
   */

  static async emitCharacterCreated(
    userId: string,
    characterId: string,
    metadata?: Record<string, any>
  ): Promise<EventDispatchResult> {
    return this.dispatch(
      SystemName.CHARACTER,
      SystemEventType.CHARACTER_CREATED,
      { userId, characterId, metadata },
      EventPriority.CRITICAL
    );
  }

  static async emitCombatVictory(
    characterId: string,
    data: {
      npcId?: string;
      goldEarned: number;
      xpEarned: number;
      itemsLooted?: string[];
      isBoss?: boolean;
    }
  ): Promise<EventDispatchResult> {
    return this.dispatch(
      SystemName.COMBAT,
      data.isBoss ? SystemEventType.BOSS_DEFEATED : SystemEventType.COMBAT_VICTORY,
      { characterId, ...data },
      data.isBoss ? EventPriority.HIGH : EventPriority.NORMAL
    );
  }

  static async emitGoldEarned(
    characterId: string,
    amount: number,
    source: string,
    metadata?: Record<string, any>
  ): Promise<EventDispatchResult> {
    return this.dispatch(
      SystemName.GOLD,
      SystemEventType.GOLD_EARNED,
      { characterId, amount, source, metadata },
      EventPriority.NORMAL
    );
  }

  static async emitQuestCompleted(
    characterId: string,
    questId: string,
    rewards: {
      gold?: number;
      xp?: number;
      items?: string[];
      reputation?: number;
    }
  ): Promise<EventDispatchResult> {
    return this.dispatch(
      SystemName.QUEST,
      SystemEventType.QUEST_COMPLETED,
      { characterId, questId, metadata: rewards },
      EventPriority.HIGH
    );
  }

  static async emitAchievementUnlocked(
    characterId: string,
    achievementId: string,
    metadata?: Record<string, any>
  ): Promise<EventDispatchResult> {
    return this.dispatch(
      SystemName.ACHIEVEMENT,
      SystemEventType.ACHIEVEMENT_UNLOCKED,
      { characterId, achievementId, metadata },
      EventPriority.HIGH
    );
  }

  static async emitSkillLevelUp(
    characterId: string,
    skillId: string,
    newLevel: number
  ): Promise<EventDispatchResult> {
    return this.dispatch(
      SystemName.SKILL,
      SystemEventType.SKILL_LEVEL_UP,
      { characterId, skillId, amount: newLevel },
      EventPriority.NORMAL
    );
  }

  static async emitCharacterLevelUp(
    characterId: string,
    newLevel: number,
    metadata?: Record<string, any>
  ): Promise<EventDispatchResult> {
    return this.dispatch(
      SystemName.CHARACTER,
      SystemEventType.CHARACTER_LEVEL_UP,
      { characterId, amount: newLevel, metadata },
      EventPriority.HIGH
    );
  }
}
