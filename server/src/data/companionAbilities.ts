/**
 * Companion Abilities Data - Phase 9, Wave 9.2
 *
 * Defines all abilities that animal companions can learn and use
 */

import {
  CompanionAbility,
  CompanionAbilityId,
  AbilityEffectType,
  CompanionCategory
} from '@desperados/shared';

/**
 * All companion abilities
 */
export const COMPANION_ABILITIES: Record<CompanionAbilityId, CompanionAbility> = {
  // ===========================================
  // DOG ABILITIES
  // ===========================================

  [CompanionAbilityId.TRACK]: {
    id: CompanionAbilityId.TRACK,
    name: 'Track',
    description: 'Follow scent trails to find hidden items, track wanted criminals, or discover secrets. Adds tracking bonus to crime and exploration actions.',
    effectType: AbilityEffectType.TRACKING_BONUS,
    power: 15,
    energyCost: 5,
    cooldown: 60,
    minLoyalty: 20,
    minBond: 10,
    learnLevel: 1,
    categories: [CompanionCategory.DOG]
  },

  [CompanionAbilityId.GUARD]: {
    id: CompanionAbilityId.GUARD,
    name: 'Guard',
    description: 'Alert to danger and incoming threats. Provides warning before ambushes and increases chance to detect hostile NPCs.',
    effectType: AbilityEffectType.DETECTION,
    power: 20,
    minLoyalty: 30,
    minBond: 20,
    learnLevel: 1,
    categories: [CompanionCategory.DOG]
  },

  [CompanionAbilityId.HERD]: {
    id: CompanionAbilityId.HERD,
    name: 'Herd',
    description: 'Control and manage livestock. Useful for ranching activities and cattle rustling. Increases success rate of animal-related crimes.',
    effectType: AbilityEffectType.UTILITY,
    power: 12,
    energyCost: 8,
    cooldown: 120,
    minLoyalty: 40,
    minBond: 30,
    learnLevel: 3,
    categories: [CompanionCategory.DOG]
  },

  [CompanionAbilityId.ATTACK]: {
    id: CompanionAbilityId.ATTACK,
    name: 'Attack',
    description: 'Aggressive combat support. Deals additional damage during combat encounters.',
    effectType: AbilityEffectType.COMBAT_DAMAGE,
    power: 18,
    minLoyalty: 50,
    minBond: 40,
    learnLevel: 2,
    categories: [CompanionCategory.DOG]
  },

  [CompanionAbilityId.FETCH]: {
    id: CompanionAbilityId.FETCH,
    name: 'Fetch',
    description: 'Retrieve items from dangerous or hard-to-reach places. Chance to find bonus loot after combat.',
    effectType: AbilityEffectType.RESOURCE_GAIN,
    power: 10,
    energyCost: 5,
    cooldown: 30,
    minLoyalty: 25,
    minBond: 15,
    learnLevel: 1,
    categories: [CompanionCategory.DOG]
  },

  [CompanionAbilityId.INTIMIDATE]: {
    id: CompanionAbilityId.INTIMIDATE,
    name: 'Intimidate',
    description: 'Scare NPCs and enemies. Reduces enemy morale and can cause weaker foes to flee.',
    effectType: AbilityEffectType.INTIMIDATION,
    power: 15,
    energyCost: 10,
    cooldown: 45,
    minLoyalty: 35,
    minBond: 25,
    learnLevel: 2,
    categories: [CompanionCategory.DOG]
  },

  [CompanionAbilityId.SENSE_DANGER]: {
    id: CompanionAbilityId.SENSE_DANGER,
    name: 'Sense Danger',
    description: 'Supernatural awareness of threats. Increases chance to avoid negative random events.',
    effectType: AbilityEffectType.DETECTION,
    power: 25,
    minLoyalty: 60,
    minBond: 50,
    learnLevel: 5,
    categories: [CompanionCategory.DOG]
  },

  [CompanionAbilityId.LOYAL_DEFENSE]: {
    id: CompanionAbilityId.LOYAL_DEFENSE,
    name: 'Loyal Defense',
    description: 'Protect owner at all costs. Takes damage for the player in combat, reducing incoming damage.',
    effectType: AbilityEffectType.COMBAT_DEFENSE,
    power: 22,
    minLoyalty: 80,
    minBond: 70,
    learnLevel: 6,
    categories: [CompanionCategory.DOG]
  },

  // ===========================================
  // BIRD ABILITIES
  // ===========================================

  [CompanionAbilityId.SCOUT]: {
    id: CompanionAbilityId.SCOUT,
    name: 'Scout',
    description: 'Fly ahead to reveal the area. Shows nearby NPCs, locations, and potential threats.',
    effectType: AbilityEffectType.INFORMATION,
    power: 20,
    energyCost: 8,
    cooldown: 90,
    minLoyalty: 30,
    minBond: 20,
    learnLevel: 1,
    categories: [CompanionCategory.BIRD]
  },

  [CompanionAbilityId.HUNT]: {
    id: CompanionAbilityId.HUNT,
    name: 'Hunt',
    description: 'Catch small game and gather food. Provides resources and reduces hunger.',
    effectType: AbilityEffectType.RESOURCE_GAIN,
    power: 15,
    energyCost: 10,
    cooldown: 120,
    minLoyalty: 25,
    minBond: 15,
    learnLevel: 1,
    categories: [CompanionCategory.BIRD]
  },

  [CompanionAbilityId.MESSAGE]: {
    id: CompanionAbilityId.MESSAGE,
    name: 'Message',
    description: 'Carry messages to other players or NPCs. Enables special communication options.',
    effectType: AbilityEffectType.UTILITY,
    power: 12,
    energyCost: 5,
    cooldown: 60,
    minLoyalty: 40,
    minBond: 30,
    learnLevel: 3,
    categories: [CompanionCategory.BIRD]
  },

  [CompanionAbilityId.DISTRACT]: {
    id: CompanionAbilityId.DISTRACT,
    name: 'Distract',
    description: 'Draw attention away from the player. Increases stealth and escape chance.',
    effectType: AbilityEffectType.STEALTH_BONUS,
    power: 18,
    energyCost: 8,
    cooldown: 45,
    minLoyalty: 35,
    minBond: 25,
    learnLevel: 2,
    categories: [CompanionCategory.BIRD]
  },

  [CompanionAbilityId.OMEN]: {
    id: CompanionAbilityId.OMEN,
    name: 'Omen',
    description: 'Reveal hidden secrets and future events. Grants insight into quest objectives and hidden opportunities.',
    effectType: AbilityEffectType.INFORMATION,
    power: 25,
    energyCost: 15,
    cooldown: 180,
    minLoyalty: 60,
    minBond: 50,
    learnLevel: 5,
    categories: [CompanionCategory.BIRD]
  },

  [CompanionAbilityId.AERIAL_ASSAULT]: {
    id: CompanionAbilityId.AERIAL_ASSAULT,
    name: 'Aerial Assault',
    description: 'Dive-bomb enemies from above. Deals damage and can stun targets.',
    effectType: AbilityEffectType.COMBAT_DAMAGE,
    power: 20,
    energyCost: 12,
    minLoyalty: 50,
    minBond: 40,
    learnLevel: 4,
    categories: [CompanionCategory.BIRD]
  },

  [CompanionAbilityId.KEEN_SIGHT]: {
    id: CompanionAbilityId.KEEN_SIGHT,
    name: 'Keen Sight',
    description: 'Exceptional vision spots details others miss. Improves tracking and discovery rates.',
    effectType: AbilityEffectType.TRACKING_BONUS,
    power: 20,
    minLoyalty: 45,
    minBond: 35,
    learnLevel: 3,
    categories: [CompanionCategory.BIRD]
  },

  // ===========================================
  // EXOTIC ABILITIES
  // ===========================================

  [CompanionAbilityId.STEALTH]: {
    id: CompanionAbilityId.STEALTH,
    name: 'Stealth',
    description: 'Move silently without detection. Greatly increases stealth for crimes and infiltration.',
    effectType: AbilityEffectType.STEALTH_BONUS,
    power: 25,
    energyCost: 10,
    minLoyalty: 40,
    minBond: 30,
    learnLevel: 2,
    categories: [CompanionCategory.EXOTIC]
  },

  [CompanionAbilityId.NIGHT_VISION]: {
    id: CompanionAbilityId.NIGHT_VISION,
    name: 'Night Vision',
    description: 'See perfectly in darkness. Removes penalties for nighttime activities.',
    effectType: AbilityEffectType.UTILITY,
    power: 18,
    minLoyalty: 30,
    minBond: 20,
    learnLevel: 1,
    categories: [CompanionCategory.EXOTIC]
  },

  [CompanionAbilityId.PACK_TACTICS]: {
    id: CompanionAbilityId.PACK_TACTICS,
    name: 'Pack Tactics',
    description: 'Work together with gang members for bonuses. Increases effectiveness in group activities.',
    effectType: AbilityEffectType.SUPPORT_BUFF,
    power: 22,
    minLoyalty: 55,
    minBond: 45,
    learnLevel: 4,
    categories: [CompanionCategory.EXOTIC]
  },

  [CompanionAbilityId.INTIMIDATE_PREY]: {
    id: CompanionAbilityId.INTIMIDATE_PREY,
    name: 'Intimidate Prey',
    description: 'Terrify weaker opponents. Reduces enemy combat effectiveness.',
    effectType: AbilityEffectType.INTIMIDATION,
    power: 20,
    energyCost: 12,
    minLoyalty: 45,
    minBond: 35,
    learnLevel: 3,
    categories: [CompanionCategory.EXOTIC]
  },

  [CompanionAbilityId.FERAL_RAGE]: {
    id: CompanionAbilityId.FERAL_RAGE,
    name: 'Feral Rage',
    description: 'Enter a berserker state. Massively increases damage but reduces control.',
    effectType: AbilityEffectType.COMBAT_DAMAGE,
    power: 35,
    energyCost: 20,
    cooldown: 240,
    minLoyalty: 70,
    minBond: 60,
    learnLevel: 6,
    categories: [CompanionCategory.EXOTIC]
  },

  [CompanionAbilityId.SCAVENGE]: {
    id: CompanionAbilityId.SCAVENGE,
    name: 'Scavenge',
    description: 'Find useful items in unlikely places. Increases item discovery rate.',
    effectType: AbilityEffectType.RESOURCE_GAIN,
    power: 15,
    energyCost: 8,
    cooldown: 90,
    minLoyalty: 25,
    minBond: 15,
    learnLevel: 1,
    categories: [CompanionCategory.EXOTIC]
  },

  [CompanionAbilityId.BURROW_FLUSH]: {
    id: CompanionAbilityId.BURROW_FLUSH,
    name: 'Burrow Flush',
    description: 'Flush out creatures from burrows and holes. Excellent for hunting rabbits and finding hidden caches.',
    effectType: AbilityEffectType.HUNTING_BONUS,
    power: 18,
    energyCost: 10,
    cooldown: 60,
    minLoyalty: 30,
    minBond: 20,
    learnLevel: 2,
    categories: [CompanionCategory.EXOTIC]
  },

  [CompanionAbilityId.CLIMB]: {
    id: CompanionAbilityId.CLIMB,
    name: 'Climb',
    description: 'Scale walls and trees to reach inaccessible areas. Opens new exploration options.',
    effectType: AbilityEffectType.UTILITY,
    power: 15,
    energyCost: 10,
    cooldown: 30,
    minLoyalty: 35,
    minBond: 25,
    learnLevel: 2,
    categories: [CompanionCategory.EXOTIC]
  },

  [CompanionAbilityId.POUNCE]: {
    id: CompanionAbilityId.POUNCE,
    name: 'Pounce',
    description: 'Leap onto enemies with devastating force. High burst damage attack.',
    effectType: AbilityEffectType.COMBAT_DAMAGE,
    power: 28,
    energyCost: 15,
    cooldown: 90,
    minLoyalty: 50,
    minBond: 40,
    learnLevel: 4,
    categories: [CompanionCategory.EXOTIC]
  },

  [CompanionAbilityId.MAUL]: {
    id: CompanionAbilityId.MAUL,
    name: 'Maul',
    description: 'Savage attack that wounds enemies. Deals damage over time.',
    effectType: AbilityEffectType.COMBAT_DAMAGE,
    power: 32,
    energyCost: 18,
    cooldown: 120,
    minLoyalty: 65,
    minBond: 55,
    learnLevel: 5,
    categories: [CompanionCategory.EXOTIC]
  },

  // ===========================================
  // SUPERNATURAL ABILITIES
  // ===========================================

  [CompanionAbilityId.GHOST_WALK]: {
    id: CompanionAbilityId.GHOST_WALK,
    name: 'Ghost Walk',
    description: 'Phase through walls and obstacles. Perfect stealth, cannot be detected.',
    effectType: AbilityEffectType.STEALTH_BONUS,
    power: 40,
    energyCost: 25,
    cooldown: 180,
    minLoyalty: 70,
    minBond: 60,
    learnLevel: 5,
    categories: [CompanionCategory.SUPERNATURAL]
  },

  [CompanionAbilityId.SPIRIT_HOWL]: {
    id: CompanionAbilityId.SPIRIT_HOWL,
    name: 'Spirit Howl',
    description: 'Terrifying supernatural howl. Causes fear in all enemies, may cause them to flee.',
    effectType: AbilityEffectType.INTIMIDATION,
    power: 35,
    energyCost: 20,
    cooldown: 240,
    minLoyalty: 65,
    minBond: 55,
    learnLevel: 4,
    categories: [CompanionCategory.SUPERNATURAL]
  },

  [CompanionAbilityId.SHAPE_SHIFT]: {
    id: CompanionAbilityId.SHAPE_SHIFT,
    name: 'Shape Shift',
    description: 'Transform into different animal forms. Each form has unique abilities.',
    effectType: AbilityEffectType.UTILITY,
    power: 50,
    energyCost: 30,
    cooldown: 300,
    minLoyalty: 85,
    minBond: 75,
    learnLevel: 7,
    categories: [CompanionCategory.SUPERNATURAL]
  },

  [CompanionAbilityId.THUNDER_STRIKE]: {
    id: CompanionAbilityId.THUNDER_STRIKE,
    name: 'Thunder Strike',
    description: 'Call down lightning on enemies. Massive damage to a single target.',
    effectType: AbilityEffectType.COMBAT_DAMAGE,
    power: 45,
    energyCost: 35,
    cooldown: 360,
    minLoyalty: 80,
    minBond: 70,
    learnLevel: 6,
    categories: [CompanionCategory.SUPERNATURAL]
  },

  [CompanionAbilityId.BLOOD_DRAIN]: {
    id: CompanionAbilityId.BLOOD_DRAIN,
    name: 'Blood Drain',
    description: 'Drain life force from enemies. Deals damage and heals the companion.',
    effectType: AbilityEffectType.COMBAT_DAMAGE,
    power: 30,
    energyCost: 25,
    cooldown: 180,
    minLoyalty: 75,
    minBond: 65,
    learnLevel: 5,
    categories: [CompanionCategory.SUPERNATURAL]
  },

  [CompanionAbilityId.CURSE_BITE]: {
    id: CompanionAbilityId.CURSE_BITE,
    name: 'Curse Bite',
    description: 'Inflict a supernatural curse. Reduces enemy stats and effectiveness.',
    effectType: AbilityEffectType.COMBAT_DAMAGE,
    power: 25,
    energyCost: 20,
    cooldown: 240,
    minLoyalty: 70,
    minBond: 60,
    learnLevel: 5,
    categories: [CompanionCategory.SUPERNATURAL]
  },

  [CompanionAbilityId.PHASE_SHIFT]: {
    id: CompanionAbilityId.PHASE_SHIFT,
    name: 'Phase Shift',
    description: 'Briefly become incorporeal. Avoids all damage for a short time.',
    effectType: AbilityEffectType.COMBAT_DEFENSE,
    power: 40,
    energyCost: 30,
    cooldown: 300,
    minLoyalty: 80,
    minBond: 70,
    learnLevel: 6,
    categories: [CompanionCategory.SUPERNATURAL]
  },

  [CompanionAbilityId.SOUL_SENSE]: {
    id: CompanionAbilityId.SOUL_SENSE,
    name: 'Soul Sense',
    description: 'Perceive the spirits of the dead and hidden truths. Reveals secret quests and hidden treasures.',
    effectType: AbilityEffectType.INFORMATION,
    power: 35,
    energyCost: 25,
    cooldown: 240,
    minLoyalty: 75,
    minBond: 65,
    learnLevel: 5,
    categories: [CompanionCategory.SUPERNATURAL]
  }
};

/**
 * Get abilities by category
 */
export function getAbilitiesByCategory(category: CompanionCategory): CompanionAbility[] {
  return Object.values(COMPANION_ABILITIES).filter(ability =>
    ability.categories.includes(category)
  );
}

/**
 * Get ability by ID
 */
export function getAbilityById(abilityId: CompanionAbilityId): CompanionAbility | undefined {
  return COMPANION_ABILITIES[abilityId];
}

/**
 * Check if companion meets ability requirements
 */
export function canLearnAbility(
  ability: CompanionAbility,
  loyalty: number,
  bondLevel: number
): boolean {
  if (ability.minLoyalty && loyalty < ability.minLoyalty) {
    return false;
  }
  if (ability.minBond && bondLevel < ability.minBond) {
    return false;
  }
  return true;
}
