/**
 * Unlock Trigger Definitions
 * Automatic unlock granting based on game events
 */

import { UnlockRequirementType } from '@desperados/shared';

/**
 * Trigger configuration for automatic unlock grants
 */
export interface UnlockTrigger {
  event: string;
  unlockIds: string[];
  condition?: (eventData: any) => boolean;
}

/**
 * Achievement-based triggers
 * Automatically grant unlocks when specific achievements are earned
 */
export const achievementTriggers: UnlockTrigger[] = [
  {
    event: 'achievement:first_kill',
    unlockIds: ['portrait_frame_bronze']
  },
  {
    event: 'achievement:lawman_legend',
    unlockIds: ['portrait_frame_sheriff']
  },
  {
    event: 'achievement:shadow_master',
    unlockIds: ['nameplate_midnight_black']
  },
  {
    event: 'achievement:complete_all_achievements',
    unlockIds: ['nameplate_rainbow']
  },
  {
    event: 'achievement:die_100_times',
    unlockIds: ['death_ghost']
  },
  {
    event: 'achievement:desert_master',
    unlockIds: ['death_tumblesweed']
  },
  {
    event: 'achievement:explore_ghost_town',
    unlockIds: ['start_ghost_town']
  },
  {
    event: 'achievement:native_alliance',
    unlockIds: ['start_native_village']
  },
  {
    event: 'achievement:military_rank',
    unlockIds: ['start_fort']
  },
  {
    event: 'achievement:strength_master',
    unlockIds: ['start_bonus_strength']
  },
  {
    event: 'achievement:speed_master',
    unlockIds: ['start_bonus_speed']
  },
  {
    event: 'achievement:cunning_master',
    unlockIds: ['start_bonus_cunning']
  },
  {
    event: 'achievement:charisma_master',
    unlockIds: ['start_bonus_charisma']
  },
  {
    event: 'achievement:destiny_master',
    unlockIds: ['ability_lucky_draw']
  },
  {
    event: 'achievement:escape_artist',
    unlockIds: ['ability_quick_recovery']
  },
  {
    event: 'achievement:master_trader',
    unlockIds: ['ability_silver_tongue']
  },
  {
    event: 'achievement:treasure_hunter',
    unlockIds: ['ability_eagle_eye']
  },
  {
    event: 'achievement:horse_tamer',
    unlockIds: ['horse_mustang']
  },
  {
    event: 'achievement:native_trust',
    unlockIds: ['horse_appaloosa']
  },
  {
    event: 'achievement:legendary_rider',
    unlockIds: ['horse_midnight']
  },
  {
    event: 'achievement:beast_whisperer',
    unlockIds: ['companion_coyote']
  },
  {
    event: 'achievement:sky_watcher',
    unlockIds: ['companion_hawk']
  },
  {
    event: 'achievement:spiritual_awakening',
    unlockIds: ['companion_spirit_animal']
  },
  {
    event: 'achievement:visit_all_saloons',
    unlockIds: ['fast_travel_saloon']
  },
  {
    event: 'achievement:rail_baron',
    unlockIds: ['fast_travel_train']
  },
  {
    event: 'achievement:social_butterfly',
    unlockIds: ['mail_attach_2']
  },
  {
    event: 'achievement:master_of_shadows',
    unlockIds: ['faction_shadow_council']
  },
  {
    event: 'achievement:legendary_lawman',
    unlockIds: ['faction_iron_marshals']
  },
  {
    event: 'achievement:political_influence',
    unlockIds: ['vip_governors_mansion']
  },
  {
    event: 'achievement:underworld_connections',
    unlockIds: ['vip_secret_speakeasy']
  },
  {
    event: 'achievement:spiritual_journey',
    unlockIds: ['vip_ghost_canyon']
  },
  {
    event: 'achievement:native_honor',
    unlockIds: ['npc_native_elders']
  },
  {
    event: 'achievement:see_beyond_veil',
    unlockIds: ['npc_ghost_npcs']
  },
  {
    event: 'achievement:lawman_badge',
    unlockIds: ['bg_wanted_office']
  },
  {
    event: 'achievement:early_adopter_criminal',
    unlockIds: ['title_founding_outlaw']
  },
  {
    event: 'achievement:rank_1_duelist',
    unlockIds: ['title_apex_predator']
  }
];

/**
 * Legacy tier-based triggers
 * Grant unlocks when reaching specific legacy tiers
 */
export const legacyTierTriggers: UnlockTrigger[] = [
  {
    event: 'legacy:tier_2',
    unlockIds: ['character_slot_3']
  },
  {
    event: 'legacy:tier_3',
    unlockIds: ['death_dramatic']
  },
  {
    event: 'legacy:tier_4',
    unlockIds: ['mail_attach_3']
  },
  {
    event: 'legacy:tier_5',
    unlockIds: ['character_slot_4', 'auto_loot', 'hall_of_fame_bronze']
  },
  {
    event: 'legacy:tier_6',
    unlockIds: ['inventory_expand_3']
  },
  {
    event: 'legacy:tier_7',
    unlockIds: ['companion_wolf']
  },
  {
    event: 'legacy:tier_8',
    unlockIds: ['ability_iron_will']
  },
  {
    event: 'legacy:tier_10',
    unlockIds: ['character_slot_5', 'portrait_frame_legendary', 'inventory_expand_4', 'hall_of_fame_silver']
  },
  {
    event: 'legacy:tier_12',
    unlockIds: ['fast_travel_anywhere']
  },
  {
    event: 'legacy:tier_15',
    unlockIds: ['title_immortal', 'hall_of_fame_gold']
  },
  {
    event: 'legacy:tier_20',
    unlockIds: ['title_eternal_legend']
  }
];

/**
 * Event-based triggers
 * Limited-time or special event unlocks
 */
export const eventTriggers: UnlockTrigger[] = [
  {
    event: 'event:founding_period',
    unlockIds: ['badge_founder']
  },
  {
    event: 'event:launch_week',
    unlockIds: ['title_first_pioneer']
  }
];

/**
 * Milestone-based triggers
 * Grant unlocks when reaching specific milestones
 */
export const milestoneTriggers: UnlockTrigger[] = [
  {
    event: 'milestone:level_5',
    unlockIds: ['portrait_frame_bronze', 'mail_attach_1']
  },
  {
    event: 'milestone:level_10',
    unlockIds: ['bg_desert_sunset', 'inventory_expand_1']
  },
  {
    event: 'milestone:level_15',
    unlockIds: ['portrait_frame_silver']
  },
  {
    event: 'milestone:level_25',
    unlockIds: ['inventory_expand_2']
  },
  {
    event: 'milestone:level_30',
    unlockIds: ['portrait_frame_gold']
  },
  {
    event: 'milestone:level_50',
    unlockIds: ['title_legend']
  },
  {
    event: 'milestone:duels_10',
    unlockIds: ['title_gunslinger']
  },
  {
    event: 'milestone:duels_25',
    unlockIds: ['nameplate_blood_red']
  },
  {
    event: 'milestone:duels_100',
    unlockIds: ['badge_duelist']
  },
  {
    event: 'milestone:duels_250',
    unlockIds: ['npc_legendary_gunslinger']
  },
  {
    event: 'milestone:crimes_50',
    unlockIds: ['title_outlaw']
  },
  {
    event: 'milestone:crimes_100',
    unlockIds: ['portrait_frame_wanted']
  },
  {
    event: 'milestone:crimes_200',
    unlockIds: ['bg_hideout']
  },
  {
    event: 'milestone:crimes_500',
    unlockIds: ['start_mountain_hideout']
  },
  {
    event: 'milestone:gold_5000',
    unlockIds: ['nameplate_cactus_green']
  },
  {
    event: 'milestone:gold_10000',
    unlockIds: ['bg_saloon', 'bank_expand_1']
  },
  {
    event: 'milestone:gold_25000',
    unlockIds: ['start_bonus_gold_small']
  },
  {
    event: 'milestone:gold_50000',
    unlockIds: ['nameplate_gold_rush', 'fast_travel_bank', 'bank_expand_2']
  },
  {
    event: 'milestone:gold_100000',
    unlockIds: ['start_bonus_gold_medium', 'vip_high_stakes_room']
  },
  {
    event: 'milestone:gold_250000',
    unlockIds: ['horse_arabian', 'bank_expand_3']
  },
  {
    event: 'milestone:gold_500000',
    unlockIds: ['start_bonus_gold_large']
  },
  {
    event: 'milestone:gold_1000000',
    unlockIds: ['faction_golden_circle']
  },
  {
    event: 'milestone:gold_10000000',
    unlockIds: ['title_gold_emperor']
  },
  {
    event: 'milestone:time_1day',
    unlockIds: ['nameplate_desert_orange']
  },
  {
    event: 'milestone:time_30days',
    unlockIds: ['badge_veteran']
  },
  {
    event: 'milestone:gang_leader',
    unlockIds: ['badge_gang_leader']
  },
  {
    event: 'milestone:gang_rank_3',
    unlockIds: ['fast_travel_hideout']
  }
];

/**
 * Premium purchase triggers (for future monetization)
 */
export const purchaseTriggers: UnlockTrigger[] = [
  // Reserved for premium content
  // Example:
  // {
  //   event: 'purchase:premium_pack_1',
  //   unlockIds: ['premium_cosmetic_1', 'premium_cosmetic_2']
  // }
];

/**
 * All triggers combined
 */
export const allTriggers: UnlockTrigger[] = [
  ...achievementTriggers,
  ...legacyTierTriggers,
  ...eventTriggers,
  ...milestoneTriggers,
  ...purchaseTriggers
];

/**
 * Get triggers for a specific event
 */
export function getTriggersForEvent(event: string): UnlockTrigger[] {
  return allTriggers.filter(trigger => trigger.event === event);
}

/**
 * Get all unlocks that should be granted for an event
 */
export function getUnlocksForEvent(event: string, eventData?: any): string[] {
  const triggers = getTriggersForEvent(event);
  const unlockIds: string[] = [];

  for (const trigger of triggers) {
    if (!trigger.condition || trigger.condition(eventData)) {
      unlockIds.push(...trigger.unlockIds);
    }
  }

  return unlockIds;
}
