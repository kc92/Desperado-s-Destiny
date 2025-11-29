/**
 * Creature Weakness and Immunity System - Phase 10, Wave 10.2
 *
 * Defines the damage type effectiveness system for Weird West creatures
 */

import { DamageType, CreatureCategory } from '@desperados/shared';

/**
 * Damage effectiveness multipliers
 */
export enum DamageEffectiveness {
  IMMUNE = 0,           // No damage
  RESISTANT = 0.5,      // Half damage
  NORMAL = 1.0,         // Full damage
  WEAK = 1.5,           // 50% extra damage
  CRITICAL = 2.0        // Double damage
}

/**
 * Item requirements for special damage types
 */
export interface DamageTypeRequirement {
  damageType: DamageType;
  requiredItems: string[];
  description: string;
}

/**
 * Items that grant special damage types
 */
export const DAMAGE_TYPE_ITEMS: DamageTypeRequirement[] = [
  {
    damageType: DamageType.SILVER,
    requiredItems: ['silver-bullets', 'silver-knife', 'silver-sword', 'silver-ammunition'],
    description: 'Silver weapons are effective against undead and supernatural creatures'
  },
  {
    damageType: DamageType.HOLY,
    requiredItems: [
      'holy-water',
      'blessed-ammunition',
      'blessed-weapon',
      'holy-symbol',
      'holy-medal',
      'blessed-salt',
      'blessed-seal',
      'sacred-bundle'
    ],
    description: 'Holy items blessed by priests or shamans can harm evil spirits'
  },
  {
    damageType: DamageType.FIRE,
    requiredItems: ['fire-ammunition', 'flaming-arrows', 'torch', 'fire-bottle'],
    description: 'Fire is effective against many creatures'
  }
];

/**
 * General weakness patterns by creature category
 */
export const CATEGORY_WEAKNESSES: Record<CreatureCategory, DamageType[]> = {
  [CreatureCategory.CRYPTID]: [DamageType.FIRE, DamageType.SILVER],
  [CreatureCategory.UNDEAD]: [DamageType.HOLY, DamageType.SILVER, DamageType.FIRE],
  [CreatureCategory.LOVECRAFTIAN]: [DamageType.FIRE, DamageType.HOLY],
  [CreatureCategory.SPIRIT]: [DamageType.HOLY, DamageType.SILVER],
  [CreatureCategory.BOSS]: []
};

/**
 * General immunity patterns by creature category
 */
export const CATEGORY_IMMUNITIES: Record<CreatureCategory, DamageType[]> = {
  [CreatureCategory.CRYPTID]: [DamageType.POISON],
  [CreatureCategory.UNDEAD]: [DamageType.PHYSICAL, DamageType.POISON, DamageType.COLD],
  [CreatureCategory.LOVECRAFTIAN]: [DamageType.POISON],
  [CreatureCategory.SPIRIT]: [DamageType.PHYSICAL, DamageType.POISON],
  [CreatureCategory.BOSS]: []
};

/**
 * Banishment methods for undead and spirits
 */
export interface BanishmentMethod {
  methodType: 'holy_water' | 'silver' | 'ritual' | 'prayer' | 'salt_circle';
  name: string;
  description: string;
  requiredItems: string[];
  baseSuccessChance: number;
  applicableCategories: CreatureCategory[];
  energyCost: number;
  sanityCheck: boolean;
  effectOnSuccess: string;
  effectOnFailure: string;
  effectOnBackfire: string;
}

/**
 * Available banishment methods
 */
export const BANISHMENT_METHODS: BanishmentMethod[] = [
  {
    methodType: 'holy_water',
    name: 'Holy Water Blessing',
    description: 'Splash holy water on the spirit while reciting prayers',
    requiredItems: ['holy-water'],
    baseSuccessChance: 0.6,
    applicableCategories: [CreatureCategory.UNDEAD, CreatureCategory.SPIRIT],
    energyCost: 10,
    sanityCheck: false,
    effectOnSuccess: 'The spirit screams and dissolves into mist, banished back to the spirit world',
    effectOnFailure: 'The holy water burns the spirit but doesn\'t banish it. It becomes enraged.',
    effectOnBackfire: 'The spirit corrupts the holy water, splashing it back on you. You take holy damage.'
  },
  {
    methodType: 'silver',
    name: 'Silver Sealing',
    description: 'Use silver implements to seal the spirit away',
    requiredItems: ['silver-knife', 'silver-chain'],
    baseSuccessChance: 0.5,
    applicableCategories: [CreatureCategory.UNDEAD, CreatureCategory.SPIRIT, CreatureCategory.CRYPTID],
    energyCost: 15,
    sanityCheck: true,
    effectOnSuccess: 'You bind the creature with silver chains. It howls but cannot escape the binding.',
    effectOnFailure: 'The silver wounds it but doesn\'t bind it. The creature is now desperate and dangerous.',
    effectOnBackfire: 'The silver reacts violently with the creature\'s essence, exploding and wounding you.'
  },
  {
    methodType: 'ritual',
    name: 'Ritual Banishment',
    description: 'Perform a complex ritual to banish the entity',
    requiredItems: ['ritual-components', 'candles', 'salt'],
    baseSuccessChance: 0.7,
    applicableCategories: [CreatureCategory.UNDEAD, CreatureCategory.SPIRIT, CreatureCategory.LOVECRAFTIAN],
    energyCost: 25,
    sanityCheck: true,
    effectOnSuccess: 'The ritual completes perfectly. Reality itself rejects the creature, casting it back to where it came from.',
    effectOnFailure: 'The ritual falters. The creature is weakened but not banished. You lose sanity from the failed invocation.',
    effectOnBackfire: 'The ritual backfires catastrophically. A portal opens, and more creatures emerge. Run.'
  },
  {
    methodType: 'prayer',
    name: 'Prayer of Protection',
    description: 'Pray for divine intervention to drive away evil',
    requiredItems: ['holy-symbol'],
    baseSuccessChance: 0.4,
    applicableCategories: [CreatureCategory.UNDEAD, CreatureCategory.SPIRIT],
    energyCost: 5,
    sanityCheck: false,
    effectOnSuccess: 'Your faith is rewarded. Divine light surrounds you, forcing the spirit to flee.',
    effectOnFailure: 'Your prayers go unanswered. The creature is unaffected.',
    effectOnBackfire: 'Your lack of faith offends the creature. It mocks you and attacks with renewed fury.'
  },
  {
    methodType: 'salt_circle',
    name: 'Salt Circle Ward',
    description: 'Create a protective circle of salt that spirits cannot cross',
    requiredItems: ['blessed-salt'],
    baseSuccessChance: 0.8,
    applicableCategories: [CreatureCategory.UNDEAD, CreatureCategory.SPIRIT],
    energyCost: 10,
    sanityCheck: false,
    effectOnSuccess: 'The salt circle holds. The spirit cannot cross it and eventually dissipates, frustrated.',
    effectOnFailure: 'The circle has a gap. The spirit finds it and breaks through.',
    effectOnBackfire: 'You drew the circle wrong. It actually attracts more spirits instead of repelling them.'
  }
];

/**
 * Weapon effectiveness against creature types
 */
export interface WeaponEffectiveness {
  weaponType: string;
  effectiveAgainst: CreatureCategory[];
  ineffectiveAgainst: CreatureCategory[];
  specialProperties?: string;
}

/**
 * Weapon type effectiveness chart
 */
export const WEAPON_EFFECTIVENESS: WeaponEffectiveness[] = [
  {
    weaponType: 'standard-pistol',
    effectiveAgainst: [CreatureCategory.CRYPTID],
    ineffectiveAgainst: [CreatureCategory.UNDEAD, CreatureCategory.SPIRIT, CreatureCategory.LOVECRAFTIAN],
    specialProperties: 'Normal weapons have limited effect on supernatural entities'
  },
  {
    weaponType: 'standard-rifle',
    effectiveAgainst: [CreatureCategory.CRYPTID],
    ineffectiveAgainst: [CreatureCategory.UNDEAD, CreatureCategory.SPIRIT, CreatureCategory.LOVECRAFTIAN],
    specialProperties: 'Higher caliber, but still mundane'
  },
  {
    weaponType: 'silver-weapon',
    effectiveAgainst: [CreatureCategory.UNDEAD, CreatureCategory.SPIRIT, CreatureCategory.CRYPTID],
    ineffectiveAgainst: [],
    specialProperties: 'Silver weapons harm supernatural flesh'
  },
  {
    weaponType: 'blessed-weapon',
    effectiveAgainst: [CreatureCategory.UNDEAD, CreatureCategory.SPIRIT, CreatureCategory.LOVECRAFTIAN],
    ineffectiveAgainst: [],
    specialProperties: 'Holy blessings make weapons effective against evil'
  },
  {
    weaponType: 'fire-weapon',
    effectiveAgainst: [CreatureCategory.CRYPTID, CreatureCategory.UNDEAD, CreatureCategory.LOVECRAFTIAN],
    ineffectiveAgainst: [],
    specialProperties: 'Fire purifies and destroys unnatural flesh'
  },
  {
    weaponType: 'ancient-weapon',
    effectiveAgainst: [CreatureCategory.SPIRIT, CreatureCategory.BOSS],
    ineffectiveAgainst: [],
    specialProperties: 'Weapons from the old times, forged with forgotten rituals'
  }
];

/**
 * Determine damage multiplier based on weapon and creature
 */
export function calculateDamageMultiplier(
  weaponType: string,
  damageType: DamageType,
  creatureCategory: CreatureCategory,
  creatureWeaknesses: DamageType[],
  creatureImmunities: DamageType[]
): number {
  // Check immunity first
  if (creatureImmunities.includes(damageType)) {
    return DamageEffectiveness.IMMUNE;
  }

  // Check specific weakness
  if (creatureWeaknesses.includes(damageType)) {
    return DamageEffectiveness.CRITICAL;
  }

  // Check weapon effectiveness
  const weaponData = WEAPON_EFFECTIVENESS.find(w => w.weaponType === weaponType);
  if (weaponData) {
    if (weaponData.ineffectiveAgainst.includes(creatureCategory)) {
      return DamageEffectiveness.RESISTANT;
    }
    if (weaponData.effectiveAgainst.includes(creatureCategory)) {
      return DamageEffectiveness.WEAK;
    }
  }

  return DamageEffectiveness.NORMAL;
}

/**
 * Check if player has required items for damage type
 */
export function hasRequiredItemsForDamageType(
  playerInventory: string[],
  damageType: DamageType
): boolean {
  const requirement = DAMAGE_TYPE_ITEMS.find(d => d.damageType === damageType);
  if (!requirement) {
    return true; // No requirement needed
  }

  // Check if player has any of the required items
  return requirement.requiredItems.some(item => playerInventory.includes(item));
}

/**
 * Get available banishment methods for player
 */
export function getAvailableBanishmentMethods(
  playerInventory: string[],
  creatureCategory: CreatureCategory
): BanishmentMethod[] {
  return BANISHMENT_METHODS.filter(method => {
    // Check if applicable to this creature type
    if (!method.applicableCategories.includes(creatureCategory)) {
      return false;
    }

    // Check if player has required items
    return method.requiredItems.every(item => playerInventory.includes(item));
  });
}

/**
 * Combat tips based on creature weaknesses
 */
export interface CombatTip {
  creatureCategory: CreatureCategory;
  tips: string[];
}

/**
 * Tactical advice for fighting each creature type
 */
export const COMBAT_TIPS: CombatTip[] = [
  {
    creatureCategory: CreatureCategory.CRYPTID,
    tips: [
      'Cryptids are physical creatures. Aim for vital organs.',
      'Fire is often effective against their unnatural flesh.',
      'Silver weapons can pierce their supernatural resilience.',
      'Study their behavior patterns to predict attacks.',
      'Some cryptids can be trapped or outwitted.'
    ]
  },
  {
    creatureCategory: CreatureCategory.UNDEAD,
    tips: [
      'Physical weapons are largely ineffective. Use silver or holy items.',
      'Holy water can banish weaker spirits instantly.',
      'Salt circles provide temporary protection.',
      'Undead often have unfinished business. Resolving it may end the haunting.',
      'Fire can destroy undead that have physical forms.',
      'Prayer and faith are powerful weapons if you believe.'
    ]
  },
  {
    creatureCategory: CreatureCategory.LOVECRAFTIAN,
    tips: [
      'Protect your sanity first. Madness is their greatest weapon.',
      'Fire purges otherworldly flesh effectively.',
      'Do not try to comprehend them. Ignorance is protection.',
      'Holy items blessed by Nahi shamans are most effective.',
      'They are drawn to sanity and fear. Control both.',
      'Sealed areas from The Scar can trap them temporarily.'
    ]
  },
  {
    creatureCategory: CreatureCategory.SPIRIT,
    tips: [
      'Spirits are bound by ancient rules. Learn them.',
      'Respect and proper rituals can end encounters peacefully.',
      'Silver and holy items are your best weapons.',
      'Some spirits test character rather than fighting prowess.',
      'The Nahi know spirit lore. Seek their guidance.',
      'Banishment is often preferable to destruction.'
    ]
  },
  {
    creatureCategory: CreatureCategory.BOSS,
    tips: [
      'Come prepared with the best equipment available.',
      'Study the creature thoroughly before engaging.',
      'Bring allies if possible. Solo attempts are near-suicide.',
      'Have multiple escape plans.',
      'Ancient sealing magic is often key to victory.',
      'Sometimes sealing is the only option—destruction may be impossible.',
      'Ensure high sanity before engagement.',
      'Expect the unexpected. Boss creatures break patterns.'
    ]
  }
];

/**
 * Get combat tips for a creature category
 */
export function getCombatTips(category: CreatureCategory): string[] {
  const tip = COMBAT_TIPS.find(t => t.creatureCategory === category);
  return tip ? tip.tips : [];
}

/**
 * Crafting recipes for anti-creature items
 */
export interface AntiCreatureRecipe {
  itemId: string;
  name: string;
  description: string;
  effectiveAgainst: CreatureCategory[];
  ingredients: Array<{ itemId: string; quantity: number }>;
  craftingLocation: string;
  skillRequired?: { skillId: string; level: number };
  goldCost: number;
}

/**
 * Recipes for creating anti-creature items
 */
export const ANTI_CREATURE_RECIPES: AntiCreatureRecipe[] = [
  {
    itemId: 'silver-bullets',
    name: 'Silver Bullets (Box of 12)',
    description: 'Ammunition forged from silver. Effective against supernatural creatures.',
    effectiveAgainst: [CreatureCategory.UNDEAD, CreatureCategory.CRYPTID, CreatureCategory.SPIRIT],
    ingredients: [
      { itemId: 'silver-ingot', quantity: 1 },
      { itemId: 'gunpowder', quantity: 1 },
      { itemId: 'bullet-casings', quantity: 12 }
    ],
    craftingLocation: 'Blacksmith',
    skillRequired: { skillId: 'gunsmithing', level: 3 },
    goldCost: 50
  },
  {
    itemId: 'holy-water',
    name: 'Holy Water (3 vials)',
    description: 'Water blessed by a priest or shaman. Burns evil spirits.',
    effectiveAgainst: [CreatureCategory.UNDEAD, CreatureCategory.SPIRIT],
    ingredients: [
      { itemId: 'glass-vial', quantity: 3 },
      { itemId: 'pure-water', quantity: 1 },
      { itemId: 'blessing-fee', quantity: 1 }
    ],
    craftingLocation: 'Church or Medicine Lodge',
    goldCost: 30
  },
  {
    itemId: 'blessed-salt',
    name: 'Blessed Salt',
    description: 'Salt consecrated with holy rites. Creates protective barriers against spirits.',
    effectiveAgainst: [CreatureCategory.UNDEAD, CreatureCategory.SPIRIT],
    ingredients: [
      { itemId: 'rock-salt', quantity: 3 },
      { itemId: 'blessing-fee', quantity: 1 }
    ],
    craftingLocation: 'Church or Medicine Lodge',
    goldCost: 20
  },
  {
    itemId: 'fire-bottle',
    name: 'Fire Bottle',
    description: 'Glass bottle filled with flammable liquid. Explodes in flames on impact.',
    effectiveAgainst: [CreatureCategory.CRYPTID, CreatureCategory.UNDEAD, CreatureCategory.LOVECRAFTIAN],
    ingredients: [
      { itemId: 'glass-bottle', quantity: 1 },
      { itemId: 'whiskey', quantity: 1 },
      { itemId: 'cloth-rag', quantity: 1 }
    ],
    craftingLocation: 'Any Safe Location',
    skillRequired: { skillId: 'alchemy', level: 1 },
    goldCost: 15
  },
  {
    itemId: 'sacred-bundle',
    name: 'Sacred Medicine Bundle',
    description: 'Traditional Nahi protective bundle. Wards off evil spirits.',
    effectiveAgainst: [CreatureCategory.SPIRIT, CreatureCategory.UNDEAD],
    ingredients: [
      { itemId: 'sage', quantity: 3 },
      { itemId: 'sacred-herbs', quantity: 2 },
      { itemId: 'leather-cord', quantity: 1 },
      { itemId: 'blessing-fee', quantity: 1 }
    ],
    craftingLocation: 'Medicine Lodge',
    goldCost: 40
  },
  {
    itemId: 'protection-charm',
    name: 'Protection Charm',
    description: 'Amulet inscribed with protective symbols. Reduces sanity damage.',
    effectiveAgainst: [CreatureCategory.LOVECRAFTIAN, CreatureCategory.BOSS],
    ingredients: [
      { itemId: 'silver-disc', quantity: 1 },
      { itemId: 'inscribing-tools', quantity: 1 },
      { itemId: 'mystic-ink', quantity: 1 }
    ],
    craftingLocation: 'Medicine Lodge or Mysterious Figure',
    skillRequired: { skillId: 'occultism', level: 2 },
    goldCost: 60
  }
];

/**
 * Get recipes available at a location
 */
export function getRecipesAtLocation(location: string): AntiCreatureRecipe[] {
  return ANTI_CREATURE_RECIPES.filter(recipe =>
    recipe.craftingLocation.toLowerCase().includes(location.toLowerCase())
  );
}

/**
 * Check if player can craft a recipe
 */
export function canCraftRecipe(
  recipe: AntiCreatureRecipe,
  playerInventory: string[],
  playerSkills: Array<{ skillId: string; level: number }>,
  playerGold: number
): { canCraft: boolean; missingItems: string[]; reason?: string } {
  // Check gold
  if (playerGold < recipe.goldCost) {
    return {
      canCraft: false,
      missingItems: [],
      reason: `Insufficient gold. Need ${recipe.goldCost} gold.`
    };
  }

  // Check skill requirement
  if (recipe.skillRequired) {
    const playerSkill = playerSkills.find(s => s.skillId === recipe.skillRequired!.skillId);
    if (!playerSkill || playerSkill.level < recipe.skillRequired.level) {
      return {
        canCraft: false,
        missingItems: [],
        reason: `Requires ${recipe.skillRequired.skillId} level ${recipe.skillRequired.level}`
      };
    }
  }

  // Check ingredients
  const missingItems: string[] = [];
  for (const ingredient of recipe.ingredients) {
    if (!playerInventory.includes(ingredient.itemId)) {
      missingItems.push(`${ingredient.itemId} (x${ingredient.quantity})`);
    }
  }

  if (missingItems.length > 0) {
    return {
      canCraft: false,
      missingItems,
      reason: 'Missing required ingredients'
    };
  }

  return { canCraft: true, missingItems: [] };
}
