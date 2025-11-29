/**
 * Property Upgrades Data
 *
 * Definitions for all property upgrades by type
 * Phase 8, Wave 8.1 - Property Ownership System
 */

import type {
  UpgradeDefinition,
  PropertyType,
  UpgradeCategory,
  RanchUpgrade,
  ShopUpgrade,
  WorkshopUpgrade,
  HomesteadUpgrade,
  MineUpgrade,
  SaloonUpgrade,
  StableUpgrade,
} from '@desperados/shared';

/**
 * Ranch Upgrades
 */
export const RANCH_UPGRADES: Record<string, UpgradeDefinition> = {
  livestock_pen: {
    id: 'livestock_pen',
    name: 'Livestock Pen',
    description: 'Enclosed area for raising cattle, sheep, or pigs',
    category: 'capacity' as UpgradeCategory,
    propertyType: 'ranch' as PropertyType,
    cost: 300,
    minTier: 1,
    maxLevel: 5,
    benefits: ['+10 livestock capacity per level', '+5% livestock growth rate'],
  },
  crop_field: {
    id: 'crop_field',
    name: 'Crop Field',
    description: 'Cultivated field for growing crops',
    category: 'capacity' as UpgradeCategory,
    propertyType: 'ranch' as PropertyType,
    cost: 250,
    minTier: 1,
    maxLevel: 5,
    benefits: ['+20 crop capacity per level', '+10% crop yield'],
  },
  well: {
    id: 'well',
    name: 'Water Well',
    description: 'Deep well for irrigation and livestock',
    category: 'efficiency' as UpgradeCategory,
    propertyType: 'ranch' as PropertyType,
    cost: 500,
    minTier: 2,
    maxLevel: 3,
    benefits: ['+15% production speed', 'Drought resistance'],
  },
  barn: {
    id: 'barn',
    name: 'Barn',
    description: 'Large barn for storage and shelter',
    category: 'capacity' as UpgradeCategory,
    propertyType: 'ranch' as PropertyType,
    cost: 800,
    minTier: 2,
    maxLevel: 4,
    benefits: ['+50 storage capacity per level', 'Weather protection'],
  },
  windmill: {
    id: 'windmill',
    name: 'Windmill',
    description: 'Wind-powered pump for irrigation',
    category: 'efficiency' as UpgradeCategory,
    propertyType: 'ranch' as PropertyType,
    cost: 1200,
    minTier: 3,
    maxLevel: 3,
    benefits: ['+25% water efficiency', '+10% all production'],
    requirements: {
      requiresUpgrade: 'well',
    },
  },
};

/**
 * Shop Upgrades
 */
export const SHOP_UPGRADES: Record<string, UpgradeDefinition> = {
  display_cases: {
    id: 'display_cases',
    name: 'Display Cases',
    description: 'Glass cases for showcasing premium goods',
    category: 'efficiency' as UpgradeCategory,
    propertyType: 'shop' as PropertyType,
    cost: 400,
    minTier: 1,
    maxLevel: 5,
    benefits: ['+10% sales price', '+5% customer traffic per level'],
  },
  back_room: {
    id: 'back_room',
    name: 'Back Room',
    description: 'Storage and workshop area',
    category: 'capacity' as UpgradeCategory,
    propertyType: 'shop' as PropertyType,
    cost: 600,
    minTier: 1,
    maxLevel: 4,
    benefits: ['+100 storage capacity per level', 'Basic crafting'],
  },
  sign: {
    id: 'sign',
    name: 'Shop Sign',
    description: 'Eye-catching sign to attract customers',
    category: 'efficiency' as UpgradeCategory,
    propertyType: 'shop' as PropertyType,
    cost: 200,
    minTier: 1,
    maxLevel: 3,
    benefits: ['+15% customer traffic per level', 'Better reputation'],
  },
  security: {
    id: 'security',
    name: 'Security System',
    description: 'Locks, bars, and alarm bells',
    category: 'defense' as UpgradeCategory,
    propertyType: 'shop' as PropertyType,
    cost: 700,
    minTier: 2,
    maxLevel: 4,
    benefits: ['-20% theft chance per level', 'Crime deterrent'],
  },
  expanded_inventory: {
    id: 'expanded_inventory',
    name: 'Expanded Inventory',
    description: 'Shelving and organization for more goods',
    category: 'capacity' as UpgradeCategory,
    propertyType: 'shop' as PropertyType,
    cost: 1000,
    minTier: 3,
    maxLevel: 5,
    benefits: ['+50 item types available', '+20% sales volume'],
  },
};

/**
 * Workshop Upgrades
 */
export const WORKSHOP_UPGRADES: Record<string, UpgradeDefinition> = {
  forge: {
    id: 'forge',
    name: 'Forge',
    description: 'Blacksmith forge for metalworking',
    category: 'specialty' as UpgradeCategory,
    propertyType: 'workshop' as PropertyType,
    cost: 800,
    minTier: 1,
    maxLevel: 5,
    benefits: ['Metal crafting unlocked', '+10% quality per level', 'Weapon repairs'],
  },
  workbench: {
    id: 'workbench',
    name: 'Master Workbench',
    description: 'Professional-grade workbench with tools',
    category: 'efficiency' as UpgradeCategory,
    propertyType: 'workshop' as PropertyType,
    cost: 500,
    minTier: 1,
    maxLevel: 5,
    benefits: ['+15% crafting speed per level', '+5% quality'],
  },
  tool_rack: {
    id: 'tool_rack',
    name: 'Tool Rack',
    description: 'Organization for specialized tools',
    category: 'capacity' as UpgradeCategory,
    propertyType: 'workshop' as PropertyType,
    cost: 300,
    minTier: 1,
    maxLevel: 4,
    benefits: ['+2 crafting slots per level', 'Parallel production'],
  },
  quality_tools: {
    id: 'quality_tools',
    name: 'Quality Tools',
    description: 'Premium tools for precision work',
    category: 'efficiency' as UpgradeCategory,
    propertyType: 'workshop' as PropertyType,
    cost: 1500,
    minTier: 3,
    maxLevel: 4,
    benefits: ['+20% quality per level', 'Masterwork chance +5%'],
  },
  ventilation: {
    id: 'ventilation',
    name: 'Ventilation System',
    description: 'Chimney and vents for forge safety',
    category: 'efficiency' as UpgradeCategory,
    propertyType: 'workshop' as PropertyType,
    cost: 600,
    minTier: 2,
    maxLevel: 3,
    benefits: ['+10% worker efficiency', 'Accident prevention'],
    requirements: {
      requiresUpgrade: 'forge',
    },
  },
};

/**
 * Homestead Upgrades
 */
export const HOMESTEAD_UPGRADES: Record<string, UpgradeDefinition> = {
  bedroom: {
    id: 'bedroom',
    name: 'Additional Bedroom',
    description: 'Extra bedroom for guests or storage',
    category: 'comfort' as UpgradeCategory,
    propertyType: 'homestead' as PropertyType,
    cost: 400,
    minTier: 1,
    maxLevel: 4,
    benefits: ['+5% energy regen rate', 'Guest housing'],
  },
  kitchen: {
    id: 'kitchen',
    name: 'Kitchen',
    description: 'Cooking area with stove and supplies',
    category: 'comfort' as UpgradeCategory,
    propertyType: 'homestead' as PropertyType,
    cost: 500,
    minTier: 1,
    maxLevel: 3,
    benefits: ['Food crafting unlocked', '+10% food quality', 'Meal bonuses'],
  },
  cellar: {
    id: 'cellar',
    name: 'Root Cellar',
    description: 'Underground storage for food and valuables',
    category: 'capacity' as UpgradeCategory,
    propertyType: 'homestead' as PropertyType,
    cost: 600,
    minTier: 2,
    maxLevel: 5,
    benefits: ['+100 storage per level', 'Temperature control', 'Food preservation'],
  },
  garden: {
    id: 'garden',
    name: 'Garden',
    description: 'Vegetable and herb garden',
    category: 'efficiency' as UpgradeCategory,
    propertyType: 'homestead' as PropertyType,
    cost: 300,
    minTier: 1,
    maxLevel: 4,
    benefits: ['Passive food generation', '+5 herbs per day per level'],
  },
  security_system: {
    id: 'security_system',
    name: 'Security System',
    description: 'Locks, shutters, and alarm system',
    category: 'defense' as UpgradeCategory,
    propertyType: 'homestead' as PropertyType,
    cost: 800,
    minTier: 2,
    maxLevel: 4,
    benefits: ['-25% burglary chance per level', 'Safe respawn point'],
  },
};

/**
 * Mine Upgrades
 */
export const MINE_UPGRADES: Record<string, UpgradeDefinition> = {
  support_beams: {
    id: 'support_beams',
    name: 'Support Beams',
    description: 'Wooden supports to prevent cave-ins',
    category: 'defense' as UpgradeCategory,
    propertyType: 'mine' as PropertyType,
    cost: 500,
    minTier: 1,
    maxLevel: 5,
    benefits: ['-20% accident chance per level', '+10% worker confidence'],
  },
  rail_system: {
    id: 'rail_system',
    name: 'Mine Cart Rails',
    description: 'Rail system for ore transport',
    category: 'efficiency' as UpgradeCategory,
    propertyType: 'mine' as PropertyType,
    cost: 1000,
    minTier: 2,
    maxLevel: 4,
    benefits: ['+25% extraction speed per level', 'Deeper mining'],
  },
  ventilation_shaft: {
    id: 'ventilation_shaft',
    name: 'Ventilation Shaft',
    description: 'Air shaft for fresh air circulation',
    category: 'efficiency' as UpgradeCategory,
    propertyType: 'mine' as PropertyType,
    cost: 800,
    minTier: 2,
    maxLevel: 3,
    benefits: ['+15% worker efficiency', '+20% safety'],
  },
  explosives_storage: {
    id: 'explosives_storage',
    name: 'Explosives Storage',
    description: 'Secure bunker for dynamite and blasting powder',
    category: 'specialty' as UpgradeCategory,
    propertyType: 'mine' as PropertyType,
    cost: 1200,
    minTier: 3,
    maxLevel: 3,
    benefits: ['Blasting unlocked', '+50% ore per blast', 'Rare ore access'],
  },
  water_pump: {
    id: 'water_pump',
    name: 'Water Pump',
    description: 'Pump to remove groundwater',
    category: 'efficiency' as UpgradeCategory,
    propertyType: 'mine' as PropertyType,
    cost: 900,
    minTier: 2,
    maxLevel: 4,
    benefits: ['Deeper levels accessible', '+10% ore quality per level'],
  },
};

/**
 * Saloon Upgrades
 */
export const SALOON_UPGRADES: Record<string, UpgradeDefinition> = {
  bar_expansion: {
    id: 'bar_expansion',
    name: 'Bar Expansion',
    description: 'Longer bar with more serving space',
    category: 'capacity' as UpgradeCategory,
    propertyType: 'saloon' as PropertyType,
    cost: 700,
    minTier: 1,
    maxLevel: 5,
    benefits: ['+10 customer capacity per level', '+15% drink sales'],
  },
  stage: {
    id: 'stage',
    name: 'Performance Stage',
    description: 'Stage for musicians and entertainers',
    category: 'specialty' as UpgradeCategory,
    propertyType: 'saloon' as PropertyType,
    cost: 1000,
    minTier: 2,
    maxLevel: 4,
    benefits: ['+25% customer traffic', 'Entertainment events', '+20% tips'],
  },
  rooms: {
    id: 'rooms',
    name: 'Rental Rooms',
    description: 'Upstairs rooms for rent',
    category: 'capacity' as UpgradeCategory,
    propertyType: 'saloon' as PropertyType,
    cost: 1500,
    minTier: 3,
    maxLevel: 5,
    benefits: ['+2 rooms per level', 'Passive income +50g/week', 'Player housing'],
  },
  gaming_tables: {
    id: 'gaming_tables',
    name: 'Gaming Tables',
    description: 'Poker, faro, and roulette tables',
    category: 'specialty' as UpgradeCategory,
    propertyType: 'saloon' as PropertyType,
    cost: 800,
    minTier: 2,
    maxLevel: 5,
    benefits: ['Gambling unlocked', '+100g/week per level', 'House edge income'],
  },
  bouncer: {
    id: 'bouncer',
    name: 'Bouncer',
    description: 'Hired muscle to keep the peace',
    category: 'defense' as UpgradeCategory,
    propertyType: 'saloon' as PropertyType,
    cost: 600,
    minTier: 2,
    maxLevel: 4,
    benefits: ['-30% brawl damage per level', 'Troublemaker removal', 'Property protection'],
  },
};

/**
 * Stable Upgrades
 */
export const STABLE_UPGRADES: Record<string, UpgradeDefinition> = {
  horse_stalls: {
    id: 'horse_stalls',
    name: 'Additional Stalls',
    description: 'More stalls for horses and mounts',
    category: 'capacity' as UpgradeCategory,
    propertyType: 'stable' as PropertyType,
    cost: 500,
    minTier: 1,
    maxLevel: 5,
    benefits: ['+5 mount capacity per level', 'Boarding income'],
  },
  training_ring: {
    id: 'training_ring',
    name: 'Training Ring',
    description: 'Enclosed area for training horses',
    category: 'specialty' as UpgradeCategory,
    propertyType: 'stable' as PropertyType,
    cost: 800,
    minTier: 2,
    maxLevel: 5,
    benefits: ['Mount training unlocked', '+10% mount stats per level', 'Breaking wild horses'],
  },
  tack_room: {
    id: 'tack_room',
    name: 'Tack Room',
    description: 'Storage for saddles and equipment',
    category: 'capacity' as UpgradeCategory,
    propertyType: 'stable' as PropertyType,
    cost: 400,
    minTier: 1,
    maxLevel: 4,
    benefits: ['+50 equipment storage per level', 'Saddle crafting'],
  },
  feed_storage: {
    id: 'feed_storage',
    name: 'Feed Storage',
    description: 'Hay loft and grain bins',
    category: 'efficiency' as UpgradeCategory,
    propertyType: 'stable' as PropertyType,
    cost: 600,
    minTier: 2,
    maxLevel: 4,
    benefits: ['-20% feed costs per level', '+10% mount health'],
  },
  breeding_pen: {
    id: 'breeding_pen',
    name: 'Breeding Pen',
    description: 'Specialized area for breeding horses',
    category: 'specialty' as UpgradeCategory,
    propertyType: 'stable' as PropertyType,
    cost: 1500,
    minTier: 3,
    maxLevel: 5,
    benefits: ['Horse breeding unlocked', '+1 foal slot per level', 'Premium bloodlines'],
  },
};

/**
 * All upgrades combined
 */
export const ALL_PROPERTY_UPGRADES: Record<string, UpgradeDefinition> = {
  ...RANCH_UPGRADES,
  ...SHOP_UPGRADES,
  ...WORKSHOP_UPGRADES,
  ...HOMESTEAD_UPGRADES,
  ...MINE_UPGRADES,
  ...SALOON_UPGRADES,
  ...STABLE_UPGRADES,
};

/**
 * Get upgrades by property type
 */
export function getUpgradesByPropertyType(propertyType: PropertyType): UpgradeDefinition[] {
  return Object.values(ALL_PROPERTY_UPGRADES).filter((upgrade) => upgrade.propertyType === propertyType);
}

/**
 * Get upgrade by ID
 */
export function getUpgradeById(upgradeId: string): UpgradeDefinition | undefined {
  return ALL_PROPERTY_UPGRADES[upgradeId];
}

/**
 * Validate upgrade availability for property
 */
export function canInstallUpgrade(
  upgradeId: string,
  propertyTier: number,
  installedUpgrades: string[]
): { canInstall: boolean; reason?: string } {
  const upgrade = getUpgradeById(upgradeId);

  if (!upgrade) {
    return { canInstall: false, reason: 'Upgrade not found' };
  }

  if (propertyTier < upgrade.minTier) {
    return { canInstall: false, reason: `Requires property tier ${upgrade.minTier}` };
  }

  if (upgrade.requirements?.requiresUpgrade) {
    if (!installedUpgrades.includes(upgrade.requirements.requiresUpgrade)) {
      const requiredUpgrade = getUpgradeById(upgrade.requirements.requiresUpgrade);
      return {
        canInstall: false,
        reason: `Requires ${requiredUpgrade?.name || 'another upgrade'}`,
      };
    }
  }

  return { canInstall: true };
}
