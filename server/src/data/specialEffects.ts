/**
 * Special Effects Data
 * All special effects available for masterwork and exceptional items
 */

import { SpecialEffect, SpecialEffectCategory } from '@desperados/shared';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * Weapon special effects
 */
export const WEAPON_EFFECTS: SpecialEffect[] = [
  {
    effectId: 'keen',
    name: 'Keen',
    description: 'This weapon finds weak points with deadly accuracy',
    category: SpecialEffectCategory.WEAPON,
    criticalChanceBonus: 10
  },
  {
    effectId: 'vicious',
    name: 'Vicious',
    description: 'This weapon deals devastating damage to wounded foes',
    category: SpecialEffectCategory.WEAPON,
    damageBonus: 15 // Only applies vs wounded enemies (handled in combat logic)
  },
  {
    effectId: 'swift',
    name: 'Swift',
    description: 'This weapon strikes faster than the eye can follow',
    category: SpecialEffectCategory.WEAPON,
    attackSpeedBonus: 10
  },
  {
    effectId: 'draining',
    name: 'Draining',
    description: 'This weapon siphons life from struck foes',
    category: SpecialEffectCategory.WEAPON,
    healingOnHit: 5
  },
  {
    effectId: 'thundering',
    name: 'Thundering',
    description: 'This weapon strikes with the force of a lightning bolt',
    category: SpecialEffectCategory.WEAPON,
    stunChance: 10
  },
  {
    effectId: 'brutal',
    name: 'Brutal',
    description: 'This weapon deals overwhelming damage',
    category: SpecialEffectCategory.WEAPON,
    damageBonus: 12
  },
  {
    effectId: 'precise',
    name: 'Precise',
    description: 'This weapon never misses its mark',
    category: SpecialEffectCategory.WEAPON,
    statBonus: {
      stat: 'combat',
      value: 5,
      type: 'flat'
    }
  },
  {
    effectId: 'deadly',
    name: 'Deadly',
    description: 'This weapon turns glancing blows into mortal wounds',
    category: SpecialEffectCategory.WEAPON,
    criticalChanceBonus: 7,
    damageBonus: 8
  },
  {
    effectId: 'relentless',
    name: 'Relentless',
    description: 'This weapon strikes again and again without mercy',
    category: SpecialEffectCategory.WEAPON,
    attackSpeedBonus: 15
  },
  {
    effectId: 'balanced',
    name: 'Balanced',
    description: 'This weapon is perfectly balanced for combat',
    category: SpecialEffectCategory.WEAPON,
    statBonus: {
      stat: 'combat',
      value: 10,
      type: 'percentage'
    }
  }
];

/**
 * Armor special effects
 */
export const ARMOR_EFFECTS: SpecialEffect[] = [
  {
    effectId: 'resilient',
    name: 'Resilient',
    description: 'This armor refuses to break under punishment',
    category: SpecialEffectCategory.ARMOR,
    durabilityBonus: 15
  },
  {
    effectId: 'fortified',
    name: 'Fortified',
    description: 'This armor turns aside even the mightiest blows',
    category: SpecialEffectCategory.ARMOR,
    damageReduction: 10
  },
  {
    effectId: 'evasive',
    name: 'Evasive',
    description: 'This armor enhances your ability to dodge attacks',
    category: SpecialEffectCategory.ARMOR,
    dodgeBonus: 10
  },
  {
    effectId: 'regenerating',
    name: 'Regenerating',
    description: 'This armor slowly heals your wounds',
    category: SpecialEffectCategory.ARMOR,
    regeneration: 1
  },
  {
    effectId: 'fire_resistant',
    name: 'Fire Resistant',
    description: 'This armor protects against flames and heat',
    category: SpecialEffectCategory.ARMOR,
    resistanceType: 'fire',
    resistanceBonus: 25
  },
  {
    effectId: 'bullet_resistant',
    name: 'Bullet Resistant',
    description: 'This armor is reinforced against gunfire',
    category: SpecialEffectCategory.ARMOR,
    resistanceType: 'bullet',
    resistanceBonus: 25
  },
  {
    effectId: 'blade_resistant',
    name: 'Blade Resistant',
    description: 'This armor turns aside knife and sword',
    category: SpecialEffectCategory.ARMOR,
    resistanceType: 'blade',
    resistanceBonus: 25
  },
  {
    effectId: 'nimble',
    name: 'Nimble',
    description: 'This armor is lighter than it appears',
    category: SpecialEffectCategory.ARMOR,
    dodgeBonus: 15,
    statBonus: {
      stat: 'cunning',
      value: 5,
      type: 'flat'
    }
  },
  {
    effectId: 'guardian',
    name: 'Guardian',
    description: 'This armor watches over you in battle',
    category: SpecialEffectCategory.ARMOR,
    damageReduction: 8,
    regeneration: 1
  },
  {
    effectId: 'ironhide',
    name: 'Ironhide',
    description: 'This armor is as tough as iron plating',
    category: SpecialEffectCategory.ARMOR,
    damageReduction: 12,
    durabilityBonus: 10
  }
];

/**
 * Tool special effects
 */
export const TOOL_EFFECTS: SpecialEffect[] = [
  {
    effectId: 'efficient',
    name: 'Efficient',
    description: 'This tool uses materials more efficiently',
    category: SpecialEffectCategory.TOOL,
    materialCostReduction: 20
  },
  {
    effectId: 'masterful',
    name: 'Masterful',
    description: 'This tool helps create higher quality items',
    category: SpecialEffectCategory.TOOL,
    qualityChanceBonus: 10
  },
  {
    effectId: 'durable',
    name: 'Durable',
    description: 'This tool resists wear and tear',
    category: SpecialEffectCategory.TOOL,
    durabilityLossReduction: 50
  },
  {
    effectId: 'speedy',
    name: 'Speedy',
    description: 'This tool speeds up crafting work',
    category: SpecialEffectCategory.TOOL,
    craftingSpeedBonus: 25
  },
  {
    effectId: 'yielding',
    name: 'Yielding',
    description: 'This tool extracts more resources',
    category: SpecialEffectCategory.TOOL,
    gatheringYieldBonus: 20
  },
  {
    effectId: 'precise_tool',
    name: 'Precise',
    description: 'This tool allows for exacting work',
    category: SpecialEffectCategory.TOOL,
    qualityChanceBonus: 15,
    statBonus: {
      stat: 'craft',
      value: 5,
      type: 'flat'
    }
  },
  {
    effectId: 'blessed',
    name: 'Blessed',
    description: 'This tool seems guided by fortune itself',
    category: SpecialEffectCategory.TOOL,
    qualityChanceBonus: 20
  },
  {
    effectId: 'tireless',
    name: 'Tireless',
    description: 'This tool never seems to dull or slow',
    category: SpecialEffectCategory.TOOL,
    craftingSpeedBonus: 20,
    durabilityLossReduction: 30
  },
  {
    effectId: 'frugal',
    name: 'Frugal',
    description: 'This tool stretches materials to their limit',
    category: SpecialEffectCategory.TOOL,
    materialCostReduction: 25,
    gatheringYieldBonus: 10
  },
  {
    effectId: 'artisan',
    name: 'Artisan',
    description: 'This tool transforms work into art',
    category: SpecialEffectCategory.TOOL,
    qualityChanceBonus: 12,
    statBonus: {
      stat: 'craft',
      value: 15,
      type: 'percentage'
    }
  }
];

/**
 * All special effects combined
 */
export const ALL_SPECIAL_EFFECTS: SpecialEffect[] = [
  ...WEAPON_EFFECTS,
  ...ARMOR_EFFECTS,
  ...TOOL_EFFECTS
];

/**
 * Get special effects by category
 */
export function getEffectsByCategory(category: SpecialEffectCategory): SpecialEffect[] {
  return ALL_SPECIAL_EFFECTS.filter(effect => effect.category === category);
}

/**
 * Get random special effect for category
 */
export function getRandomEffect(category: SpecialEffectCategory): SpecialEffect {
  const effects = getEffectsByCategory(category);
  return SecureRNG.select(effects);
}

/**
 * Get multiple random unique effects
 */
export function getRandomEffects(
  category: SpecialEffectCategory,
  count: number
): SpecialEffect[] {
  const effects = getEffectsByCategory(category);
  const shuffled = SecureRNG.shuffle([...effects]);
  return shuffled.slice(0, Math.min(count, effects.length));
}

/**
 * Get effect by ID
 */
export function getEffectById(effectId: string): SpecialEffect | undefined {
  return ALL_SPECIAL_EFFECTS.find(effect => effect.effectId === effectId);
}
