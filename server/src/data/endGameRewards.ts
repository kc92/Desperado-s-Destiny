/**
 * End-Game Rewards Definitions
 *
 * Defines equipment, consumables, cosmetics, and other rewards
 * available from end-game content in The Scar
 */

import {
  EndGameEquipment,
  CorruptionAbility,
  CorruptionAbilityType,
  DailyChallenge,
  WeeklyChallenge,
  DailyChallengeType,
  WeeklyChallengeType,
  ScarZone,
} from '@desperados/shared';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * VOID-TOUCHED WEAPONS
 */
export const VOID_TOUCHED_WEAPONS: EndGameEquipment[] = [
  {
    id: 'void_touched_revolver',
    name: 'Void-Touched Revolver',
    type: 'weapon',
    description: 'A revolver that fires bullets wreathed in void energy. Reality ripples with each shot.',
    lore: 'Crafted from void metal and Herald essence. Its bullets don\'t just kill—they erase.',
    levelRequirement: 35,
    corruptionMasteryRequirement: 25,
    stats: {
      damage: 180,
      criticalChance: 30,
      voidDamage: 50,
    },
    voidDamageBonus: 50,
    obtainedFrom: ['void_walker', 'corruption_elemental', 'craft_void_weapons'],
    rarity: 'epic',
  },
  {
    id: 'reality_shredder_rifle',
    name: 'Reality Shredder Rifle',
    type: 'weapon',
    description: 'A rifle that tears through reality itself. Targets feel the damage across all timelines.',
    lore: 'Forged from dimensional blade fragments. Each shot creates a micro-tear in reality.',
    levelRequirement: 37,
    corruptionMasteryRequirement: 40,
    stats: {
      damage: 220,
      range: 100,
      realityDamage: 75,
    },
    voidDamageBonus: 60,
    obtainedFrom: ['reality_shredder', 'the_mirror', 'craft_reality_weapons'],
    rarity: 'legendary',
  },
  {
    id: 'herald_blade',
    name: 'Herald\'s Blade',
    type: 'weapon',
    description: 'A melee weapon of impossible sharpness. It cuts through armor, flesh, and soul.',
    lore: 'A fragment of The Herald\'s own essence, shaped into blade form. Whispers constantly.',
    levelRequirement: 40,
    corruptionMasteryRequirement: 75,
    stats: {
      damage: 280,
      criticalChance: 40,
      criticalDamage: 200,
      voidDamage: 100,
    },
    voidDamageBonus: 100,
    obtainedFrom: ['the_herald'],
    rarity: 'mythic',
  },
];

/**
 * REALITY ARMOR
 */
export const REALITY_ARMOR: EndGameEquipment[] = [
  {
    id: 'void_resistant_duster',
    name: 'Void-Resistant Duster',
    type: 'armor',
    description: 'A duster woven with reality shards. Void energy slides off it like water.',
    lore: 'Each thread is reinforced with stable reality. Wearing it feels like being anchored to existence.',
    levelRequirement: 32,
    stats: {
      defense: 120,
      corruptionResistance: 30,
      sanityProtection: 20,
    },
    corruptionResistance: 30,
    sanityProtection: 20,
    obtainedFrom: ['the_maw', 'craft_reality_armor'],
    rarity: 'epic',
  },
  {
    id: 'star_touched_armor',
    name: 'Star-Touched Armor',
    type: 'armor',
    description: 'Armor crafted from the hide of the Star-Touched Buffalo. Constellations move on its surface.',
    lore: 'Blessed by cosmic void, this armor exists partially outside reality, making the wearer hard to hit.',
    levelRequirement: 36,
    stats: {
      defense: 160,
      evasion: 25,
      voidResistance: 40,
    },
    corruptionResistance: 40,
    realityAnchor: 35,
    obtainedFrom: ['star_touched_buffalo'],
    rarity: 'legendary',
  },
  {
    id: 'avatar_plate',
    name: 'Avatar\'sPlate',
    type: 'armor',
    description: 'Armor forged from Herald essence and void crystal. Wearing it means accepting the void.',
    lore: 'This armor grants power, but at a cost. Those who wear it too long begin to change.',
    levelRequirement: 40,
    corruptionMasteryRequirement: 50,
    stats: {
      defense: 220,
      voidResistance: 60,
      corruptionResistance: 50,
      sanityProtection: 30,
    },
    corruptionResistance: 50,
    sanityProtection: 30,
    realityAnchor: 50,
    obtainedFrom: ['the_herald'],
    rarity: 'mythic',
  },
];

/**
 * ELDRITCH ACCESSORIES
 */
export const ELDRITCH_ACCESSORIES: EndGameEquipment[] = [
  {
    id: 'void_sight_monocle',
    name: 'Void Sight Monocle',
    type: 'accessory',
    description: 'Allows the wearer to see partially into the void. Reveals hidden threats and weaknesses.',
    lore: 'Crafted from The Collector\'s own eye. See too much, and madness follows.',
    levelRequirement: 35,
    stats: {
      perception: 40,
      criticalChance: 15,
    },
    obtainedFrom: ['the_collector'],
    rarity: 'legendary',
  },
  {
    id: 'reality_anchor_ring',
    name: 'Reality Anchor Ring',
    type: 'accessory',
    description: 'Keeps the wearer anchored to reality. Essential for deep Scar exploration.',
    lore: 'Made from pure reality shards. Without it, The Abyss will unmake you.',
    levelRequirement: 38,
    stats: {
      realityAnchor: 50,
      corruptionResistance: 25,
    },
    realityAnchor: 50,
    corruptionResistance: 25,
    obtainedFrom: ['craft_reality_items', 'the_deep_scar_caches'],
    rarity: 'epic',
  },
  {
    id: 'mind_shield_charm',
    name: 'Mind Shield Charm',
    type: 'accessory',
    description: 'Protects the mind from psychic attacks and sanity drain.',
    lore: 'Forged from memory fragments and psychic residue. Your thoughts remain your own.',
    levelRequirement: 34,
    stats: {
      sanityProtection: 40,
      psychicResistance: 35,
    },
    sanityProtection: 40,
    obtainedFrom: ['mind_flayer', 'dream_stalker'],
    rarity: 'epic',
  },
];

/**
 * CORRUPTION ABILITIES
 */
export const CORRUPTION_ABILITIES: CorruptionAbility[] = [
  {
    id: CorruptionAbilityType.VOID_STRIKE,
    name: 'Void Strike',
    description: 'Channel void energy into a devastating melee attack',
    requiredMastery: 10,
    corruptionCost: 10,
    energyCost: 15,
    damage: 250,
    damageType: 'void',
    effects: [
      {
        type: 'armor_break',
        duration: 5,
        power: 20,
      },
    ],
    backfireChance: 0.05,
    backfireEffect: 'Take 100 void damage',
    cooldown: 8,
  },
  {
    id: CorruptionAbilityType.REALITY_TEAR,
    name: 'Reality Tear',
    description: 'Tear a hole in reality, damaging all nearby enemies',
    requiredMastery: 25,
    corruptionCost: 15,
    energyCost: 20,
    sanityCost: 10,
    damage: 200,
    damageType: 'reality',
    effects: [
      {
        type: 'area_damage',
        duration: 3,
        power: 50,
      },
      {
        type: 'reality_distortion',
        duration: 5,
        power: 30,
      },
    ],
    backfireChance: 0.1,
    backfireEffect: 'Reality tear damages you instead, lose 20 sanity',
    cooldown: 15,
  },
  {
    id: CorruptionAbilityType.MADNESS_WAVE,
    name: 'Madness Wave',
    description: 'Project your madness onto enemies, confusing and damaging them',
    requiredMastery: 40,
    corruptionCost: 20,
    energyCost: 25,
    sanityCost: 15,
    damage: 180,
    damageType: 'psychic',
    effects: [
      {
        type: 'confusion',
        duration: 8,
        power: 40,
      },
      {
        type: 'fear',
        duration: 6,
        power: 35,
      },
    ],
    backfireChance: 0.15,
    backfireEffect: 'You become confused instead, lose 25 sanity',
    cooldown: 20,
  },
  {
    id: CorruptionAbilityType.CORRUPTION_BURST,
    name: 'Corruption Burst',
    description: 'Release stored corruption as explosive energy',
    requiredMastery: 55,
    corruptionCost: 25,
    energyCost: 30,
    damage: 300,
    damageType: 'corruption',
    effects: [
      {
        type: 'corruption_spread',
        duration: 10,
        power: 50,
      },
    ],
    backfireChance: 0.2,
    backfireEffect: 'Corruption explodes internally, take 200 damage and gain 15 corruption',
    cooldown: 25,
  },
  {
    id: CorruptionAbilityType.PHASE_SHIFT,
    name: 'Phase Shift',
    description: 'Shift partially into the void, becoming untargetable briefly',
    requiredMastery: 70,
    corruptionCost: 30,
    energyCost: 35,
    sanityCost: 20,
    damageType: 'void',
    effects: [
      {
        type: 'phase',
        duration: 4,
        power: 100,
      },
    ],
    backfireChance: 0.25,
    backfireEffect: 'Phase shift fails, stunned for 3 seconds, lose 30 sanity',
    cooldown: 30,
  },
  {
    id: CorruptionAbilityType.MIND_REND,
    name: 'Mind Rend',
    description: 'Tear into an enemy\'s mind, dealing massive psychic damage',
    requiredMastery: 85,
    corruptionCost: 40,
    energyCost: 40,
    sanityCost: 25,
    damage: 400,
    damageType: 'psychic',
    effects: [
      {
        type: 'mind_break',
        duration: 12,
        power: 60,
      },
    ],
    backfireChance: 0.3,
    backfireEffect: 'Your own mind tears, take 250 psychic damage and lose 40 sanity',
    cooldown: 45,
  },
];

/**
 * DAILY CHALLENGES
 */
export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'scar_patrol_outer_waste',
    type: DailyChallengeType.SCAR_PATROL,
    name: 'Outer Waste Patrol',
    description: 'Defeat 25 corrupted creatures in the Outer Waste',
    zone: ScarZone.OUTER_WASTE,
    objective: {
      type: 'kill',
      target: 'corrupted_creature',
      quantity: 25,
    },
    rewards: {
      gold: 200,
      experience: 1000,
      scarReputation: 25,
      items: [
        {
          itemId: 'void_touched_herb',
          name: 'Void-Touched Herb',
          rarity: 'uncommon',
          dropChance: 1.0,
          minQuantity: 3,
          maxQuantity: 5,
        },
      ],
    },
    resetTime: 0,
  },
  {
    id: 'artifact_fragment_twisted',
    type: DailyChallengeType.ARTIFACT_FRAGMENT,
    name: 'Fragment Hunt: Twisted Lands',
    description: 'Find the hidden artifact fragment in the Twisted Lands',
    zone: ScarZone.TWISTED_LANDS,
    objective: {
      type: 'find',
      target: 'artifact_fragment',
      quantity: 1,
      location: 'Spiral Grove',
    },
    rewards: {
      gold: 300,
      experience: 1500,
      scarReputation: 30,
      items: [
        {
          itemId: 'artifact_fragment',
          name: 'Artifact Fragment',
          rarity: 'rare',
          dropChance: 1.0,
          minQuantity: 1,
          maxQuantity: 1,
        },
      ],
    },
    timeLimit: 60,
    resetTime: 0,
  },
  {
    id: 'corruption_cleanse_deep_scar',
    type: DailyChallengeType.CORRUPTION_CLEANSE,
    name: 'Cleanse the Deep Scar',
    description: 'Purify 5 corrupted zones in the Deep Scar',
    zone: ScarZone.DEEP_SCAR,
    objective: {
      type: 'cleanse',
      target: 'corrupted_zone',
      quantity: 5,
    },
    rewards: {
      gold: 400,
      experience: 2000,
      scarReputation: 40,
      items: [
        {
          itemId: 'reality_shard',
          name: 'Reality Shard',
          rarity: 'epic',
          dropChance: 0.8,
          minQuantity: 1,
          maxQuantity: 2,
        },
      ],
    },
    resetTime: 0,
  },
  {
    id: 'survivor_rescue_abyss',
    type: DailyChallengeType.SURVIVOR_RESCUE,
    name: 'Rescue from the Abyss',
    description: 'Rescue 3 lost surveyors from the Abyss',
    zone: ScarZone.THE_ABYSS,
    objective: {
      type: 'rescue',
      target: 'lost_surveyor',
      quantity: 3,
    },
    rewards: {
      gold: 500,
      experience: 2500,
      scarReputation: 50,
      items: [
        {
          itemId: 'void_crystal',
          name: 'Void Crystal',
          rarity: 'legendary',
          dropChance: 0.6,
          minQuantity: 1,
          maxQuantity: 1,
        },
      ],
    },
    timeLimit: 90,
    resetTime: 0,
  },
];

/**
 * WEEKLY CHALLENGES
 */
export const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'elite_hunt_void_bear',
    type: WeeklyChallengeType.ELITE_HUNT,
    name: 'Hunt: The Void Bear',
    description: 'Track down and defeat The Void Bear',
    zone: ScarZone.OUTER_WASTE,
    objective: {
      type: 'hunt',
      target: 'void_bear',
      difficulty: 6,
    },
    rewards: {
      gold: 1000,
      experience: 5000,
      scarReputation: 100,
      guaranteedItems: [
        {
          itemId: 'void_bear_pelt',
          name: 'Void Bear Pelt',
          rarity: 'legendary',
          dropChance: 1.0,
          minQuantity: 1,
          maxQuantity: 1,
        },
      ],
      bonusItems: [
        {
          itemId: 'corrupted_bear_claw',
          name: 'Corrupted Bear Claw',
          rarity: 'epic',
          dropChance: 0.5,
          minQuantity: 2,
          maxQuantity: 4,
        },
      ],
    },
    resetDay: 1,
  },
  {
    id: 'deep_expedition_abyss',
    type: WeeklyChallengeType.DEEP_EXPEDITION,
    name: 'Deep Expedition: Race to the Abyss',
    description: 'Complete a timed run through all four Scar zones',
    zone: ScarZone.THE_ABYSS,
    objective: {
      type: 'expedition',
      difficulty: 9,
      requirements: ['Complete all zones', 'Under 45 minutes', 'No deaths'],
    },
    rewards: {
      gold: 2000,
      experience: 8000,
      scarReputation: 150,
      guaranteedItems: [
        {
          itemId: 'expedition_trophy',
          name: 'Expedition Trophy',
          rarity: 'legendary',
          dropChance: 1.0,
          minQuantity: 1,
          maxQuantity: 1,
        },
      ],
      bonusItems: [
        {
          itemId: 'void_crystal',
          name: 'Void Crystal',
          rarity: 'legendary',
          dropChance: 0.7,
          minQuantity: 2,
          maxQuantity: 3,
        },
      ],
    },
    timeLimit: 45,
    resetDay: 1,
  },
  {
    id: 'ritual_disruption_cultists',
    type: WeeklyChallengeType.RITUAL_DISRUPTION,
    name: 'Disrupt the Cultist Ritual',
    description: 'Stop the cultists from completing their summoning ritual',
    zone: ScarZone.TWISTED_LANDS,
    objective: {
      type: 'disruption',
      difficulty: 7,
      requirements: ['Defeat ritual leaders', 'Destroy ritual circles', 'Prevent summoning'],
    },
    rewards: {
      gold: 1500,
      experience: 6000,
      scarReputation: 120,
      guaranteedItems: [
        {
          itemId: 'disrupted_ritual_token',
          name: 'Disrupted Ritual Token',
          rarity: 'epic',
          dropChance: 1.0,
          minQuantity: 1,
          maxQuantity: 1,
        },
      ],
      bonusItems: [
        {
          itemId: 'ancient_glyph',
          name: 'Ancient Glyph',
          rarity: 'legendary',
          dropChance: 0.4,
          minQuantity: 1,
          maxQuantity: 2,
        },
      ],
    },
    resetDay: 1,
  },
  {
    id: 'relic_recovery_temple',
    type: WeeklyChallengeType.RELIC_RECOVERY,
    name: 'Relic Recovery: Suspended Temple',
    description: 'Clear the Suspended Temple and recover ancient relics',
    zone: ScarZone.DEEP_SCAR,
    objective: {
      type: 'recovery',
      difficulty: 8,
      requirements: ['Clear all enemies', 'Find hidden relic', 'Escape before collapse'],
    },
    rewards: {
      gold: 1800,
      experience: 7000,
      scarReputation: 140,
      guaranteedItems: [
        {
          itemId: 'ancient_relic',
          name: 'Ancient Relic',
          rarity: 'legendary',
          dropChance: 1.0,
          minQuantity: 1,
          maxQuantity: 1,
        },
      ],
      bonusItems: [
        {
          itemId: 'primordial_fragment',
          name: 'Primordial Fragment',
          rarity: 'mythic',
          dropChance: 0.25,
          minQuantity: 1,
          maxQuantity: 1,
        },
      ],
    },
    timeLimit: 60,
    resetDay: 1,
  },
];

/**
 * Get equipment by rarity
 */
export function getEquipmentByRarity(
  rarity: 'epic' | 'legendary' | 'mythic'
): EndGameEquipment[] {
  const allEquipment = [
    ...VOID_TOUCHED_WEAPONS,
    ...REALITY_ARMOR,
    ...ELDRITCH_ACCESSORIES,
  ];
  return allEquipment.filter(item => item.rarity === rarity);
}

/**
 * Get abilities by mastery requirement
 */
export function getAvailableAbilities(corruptionMastery: number): CorruptionAbility[] {
  return CORRUPTION_ABILITIES.filter(
    ability => ability.requiredMastery <= corruptionMastery
  );
}

/**
 * Get daily challenges by zone
 */
export function getDailyChallengesByZone(zone: ScarZone): DailyChallenge[] {
  return DAILY_CHALLENGES.filter(challenge => challenge.zone === zone);
}

/**
 * Get random daily challenge
 */
export function getRandomDailyChallenge(): DailyChallenge {
  return SecureRNG.select(DAILY_CHALLENGES);
}

/**
 * Get random weekly challenge
 */
export function getRandomWeeklyChallenge(): WeeklyChallenge {
  return SecureRNG.select(WEEKLY_CHALLENGES);
}
