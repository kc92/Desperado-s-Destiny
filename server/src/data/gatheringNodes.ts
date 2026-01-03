/**
 * Gathering Nodes Data
 * Defines all resource gathering nodes available in the game
 * Phase 7, Wave 7.3 - AAA Crafting System
 */

export enum GatheringType {
  MINING = 'mining',
  HERBALISM = 'alchemy',
  WOODCUTTING = 'woodcutting',
  FORAGING = 'foraging'
}

export interface GatheringYield {
  itemId: string;
  name: string;
  minQuantity: number;
  maxQuantity: number;
  chance: number;         // 0-100 percentage
  qualityAffected: boolean;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic';
}

export interface GatheringNode {
  id: string;
  type: GatheringType;
  name: string;
  description: string;
  locationIds: string[];           // Where this node appears
  skillRequired: string;           // mining, herbalism, carpentry, prospecting
  levelRequired: number;
  energyCost: number;
  cooldownSeconds: number;
  yields: GatheringYield[];
  toolRequired?: string;           // Optional tool requirement
  toolBonus?: number;              // Bonus % if using correct tool
}

/**
 * All gathering nodes in the game
 */
export const GATHERING_NODES: GatheringNode[] = [
  // ============================================================================
  // MINING NODES
  // ============================================================================
  {
    id: 'iron_vein',
    type: GatheringType.MINING,
    name: 'Iron Vein',
    description: 'A vein of iron ore exposed in the rock face. Common but essential.',
    locationIds: ['goldfingers-mine', 'red-gulch', 'whiskeyville'],
    skillRequired: 'mining',
    levelRequired: 1,
    energyCost: 15,
    cooldownSeconds: 180, // 3 minutes
    toolRequired: 'pickaxe',
    toolBonus: 25,
    yields: [
      { itemId: 'iron_ore', name: 'Iron Ore', minQuantity: 1, maxQuantity: 3, chance: 100, qualityAffected: true, rarity: 'common' },
      { itemId: 'coal', name: 'Coal', minQuantity: 1, maxQuantity: 2, chance: 40, qualityAffected: false, rarity: 'common' },
      { itemId: 'stone', name: 'Stone', minQuantity: 0, maxQuantity: 2, chance: 30, qualityAffected: false, rarity: 'common' },
    ]
  },
  {
    id: 'silver_vein',
    type: GatheringType.MINING,
    name: 'Silver Vein',
    description: 'A glinting vein of silver ore. Worth more than iron, but harder to find.',
    locationIds: ['goldfingers-mine', 'the-scar'],
    skillRequired: 'mining',
    levelRequired: 10,
    energyCost: 20,
    cooldownSeconds: 300, // 5 minutes
    toolRequired: 'pickaxe',
    toolBonus: 25,
    yields: [
      { itemId: 'silver_ore', name: 'Silver Ore', minQuantity: 1, maxQuantity: 2, chance: 100, qualityAffected: true, rarity: 'uncommon' },
      { itemId: 'iron_ore', name: 'Iron Ore', minQuantity: 0, maxQuantity: 1, chance: 30, qualityAffected: false, rarity: 'common' },
      { itemId: 'gemstone_rough', name: 'Rough Gemstone', minQuantity: 0, maxQuantity: 1, chance: 10, qualityAffected: true, rarity: 'rare' },
    ]
  },
  {
    id: 'gold_deposit',
    type: GatheringType.MINING,
    name: 'Gold Deposit',
    description: 'The legendary gold that brought prospectors west. A rich deposit awaits.',
    locationIds: ['goldfingers-mine'],
    skillRequired: 'mining',
    levelRequired: 20,
    energyCost: 30,
    cooldownSeconds: 600, // 10 minutes
    toolRequired: 'pickaxe',
    toolBonus: 30,
    yields: [
      { itemId: 'gold_nugget', name: 'Gold Nugget', minQuantity: 1, maxQuantity: 2, chance: 100, qualityAffected: true, rarity: 'rare' },
      { itemId: 'gold_ore', name: 'Gold Ore', minQuantity: 0, maxQuantity: 1, chance: 50, qualityAffected: true, rarity: 'rare' },
      { itemId: 'silver_ore', name: 'Silver Ore', minQuantity: 0, maxQuantity: 1, chance: 25, qualityAffected: false, rarity: 'uncommon' },
    ]
  },
  {
    id: 'coal_seam',
    type: GatheringType.MINING,
    name: 'Coal Seam',
    description: 'Dark coal embedded in the rock. Essential fuel for smelting.',
    locationIds: ['goldfingers-mine', 'red-gulch', 'the-wastes'],
    skillRequired: 'mining',
    levelRequired: 1,
    energyCost: 12,
    cooldownSeconds: 120, // 2 minutes
    toolRequired: 'pickaxe',
    toolBonus: 20,
    yields: [
      { itemId: 'coal', name: 'Coal', minQuantity: 2, maxQuantity: 5, chance: 100, qualityAffected: false, rarity: 'common' },
      { itemId: 'stone', name: 'Stone', minQuantity: 0, maxQuantity: 2, chance: 40, qualityAffected: false, rarity: 'common' },
    ]
  },

  // ============================================================================
  // HERBALISM NODES
  // ============================================================================
  {
    id: 'wild_herbs',
    type: GatheringType.HERBALISM,
    name: 'Wild Herbs',
    description: 'A patch of common herbs growing in the wild. Good for basic remedies.',
    locationIds: ['western-outpost', 'red-gulch', 'kaiowa-mesa', 'whiskeyville'],
    skillRequired: 'alchemy',
    levelRequired: 1,
    energyCost: 10,
    cooldownSeconds: 120, // 2 minutes
    yields: [
      { itemId: 'herbs', name: 'Herbs', minQuantity: 2, maxQuantity: 5, chance: 100, qualityAffected: true, rarity: 'common' },
      { itemId: 'medicinal_root', name: 'Medicinal Root', minQuantity: 0, maxQuantity: 1, chance: 20, qualityAffected: true, rarity: 'uncommon' },
    ]
  },
  {
    id: 'medicinal_plants',
    type: GatheringType.HERBALISM,
    name: 'Medicinal Plants',
    description: 'Rare plants with powerful healing properties. Prized by healers.',
    locationIds: ['kaiowa-mesa', 'hidden-chinatown'],
    skillRequired: 'alchemy',
    levelRequired: 10,
    energyCost: 15,
    cooldownSeconds: 240, // 4 minutes
    yields: [
      { itemId: 'medicinal_root', name: 'Medicinal Root', minQuantity: 1, maxQuantity: 3, chance: 100, qualityAffected: true, rarity: 'uncommon' },
      { itemId: 'herbs', name: 'Herbs', minQuantity: 1, maxQuantity: 2, chance: 50, qualityAffected: false, rarity: 'common' },
      { itemId: 'rare_flower', name: 'Rare Flower', minQuantity: 0, maxQuantity: 1, chance: 15, qualityAffected: true, rarity: 'rare' },
    ]
  },
  {
    id: 'poison_plants',
    type: GatheringType.HERBALISM,
    name: 'Poison Plants',
    description: 'Dangerous plants with toxic properties. Handle with care.',
    locationIds: ['the-scar', 'the-wastes'],
    skillRequired: 'alchemy',
    levelRequired: 15,
    energyCost: 20,
    cooldownSeconds: 300, // 5 minutes
    yields: [
      { itemId: 'snake_venom', name: 'Venom Extract', minQuantity: 1, maxQuantity: 2, chance: 100, qualityAffected: true, rarity: 'uncommon' },
      { itemId: 'poison_herb', name: 'Poison Herb', minQuantity: 1, maxQuantity: 2, chance: 70, qualityAffected: true, rarity: 'uncommon' },
      { itemId: 'herbs', name: 'Herbs', minQuantity: 0, maxQuantity: 1, chance: 30, qualityAffected: false, rarity: 'common' },
    ]
  },
  {
    id: 'tobacco_patch',
    type: GatheringType.HERBALISM,
    name: 'Tobacco Patch',
    description: 'Wild tobacco growing naturally. A frontier luxury.',
    locationIds: ['western-outpost', 'frontera'],
    skillRequired: 'alchemy',
    levelRequired: 5,
    energyCost: 12,
    cooldownSeconds: 180, // 3 minutes
    yields: [
      { itemId: 'tobacco', name: 'Tobacco', minQuantity: 2, maxQuantity: 4, chance: 100, qualityAffected: true, rarity: 'common' },
      { itemId: 'herbs', name: 'Herbs', minQuantity: 0, maxQuantity: 2, chance: 30, qualityAffected: false, rarity: 'common' },
    ]
  },

  // ============================================================================
  // WOODCUTTING NODES
  // ============================================================================
  {
    id: 'pine_tree',
    type: GatheringType.WOODCUTTING,
    name: 'Pine Tree',
    description: 'A tall pine tree. Common wood used for basic construction.',
    locationIds: ['western-outpost', 'whiskeyville', 'red-gulch'],
    skillRequired: 'carpentry',
    levelRequired: 1,
    energyCost: 15,
    cooldownSeconds: 180, // 3 minutes
    toolRequired: 'hatchet',
    toolBonus: 25,
    yields: [
      { itemId: 'wood', name: 'Wood', minQuantity: 2, maxQuantity: 4, chance: 100, qualityAffected: false, rarity: 'common' },
      { itemId: 'wood_handle', name: 'Wooden Handle', minQuantity: 0, maxQuantity: 1, chance: 25, qualityAffected: false, rarity: 'common' },
      { itemId: 'pine_resin', name: 'Pine Resin', minQuantity: 0, maxQuantity: 1, chance: 15, qualityAffected: false, rarity: 'uncommon' },
    ]
  },
  {
    id: 'oak_tree',
    type: GatheringType.WOODCUTTING,
    name: 'Oak Tree',
    description: 'A mighty oak. Harder wood, better for crafting quality items.',
    locationIds: ['kaiowa-mesa', 'frontera'],
    skillRequired: 'carpentry',
    levelRequired: 10,
    energyCost: 20,
    cooldownSeconds: 300, // 5 minutes
    toolRequired: 'hatchet',
    toolBonus: 25,
    yields: [
      { itemId: 'hardwood', name: 'Hardwood', minQuantity: 1, maxQuantity: 3, chance: 100, qualityAffected: true, rarity: 'uncommon' },
      { itemId: 'wood', name: 'Wood', minQuantity: 1, maxQuantity: 2, chance: 50, qualityAffected: false, rarity: 'common' },
      { itemId: 'wood_handle', name: 'Wooden Handle', minQuantity: 0, maxQuantity: 2, chance: 30, qualityAffected: false, rarity: 'common' },
    ]
  },
  {
    id: 'mesquite_tree',
    type: GatheringType.WOODCUTTING,
    name: 'Mesquite Tree',
    description: 'Desert mesquite. Dense wood that burns hot and long.',
    locationIds: ['the-wastes', 'the-scar'],
    skillRequired: 'carpentry',
    levelRequired: 15,
    energyCost: 25,
    cooldownSeconds: 360, // 6 minutes
    toolRequired: 'hatchet',
    toolBonus: 30,
    yields: [
      { itemId: 'mesquite_wood', name: 'Mesquite Wood', minQuantity: 1, maxQuantity: 2, chance: 100, qualityAffected: true, rarity: 'uncommon' },
      { itemId: 'charcoal', name: 'Charcoal', minQuantity: 1, maxQuantity: 3, chance: 40, qualityAffected: false, rarity: 'common' },
    ]
  },

  // ============================================================================
  // FORAGING NODES (General Scavenging)
  // ============================================================================
  {
    id: 'scrap_pile',
    type: GatheringType.FORAGING,
    name: 'Scrap Pile',
    description: 'A pile of discarded metal and materials. One man\'s trash...',
    locationIds: ['red-gulch', 'frontera', 'whiskeyville'],
    skillRequired: 'mining',
    levelRequired: 1,
    energyCost: 8,
    cooldownSeconds: 90, // 1.5 minutes
    yields: [
      { itemId: 'metal_scrap', name: 'Metal Scrap', minQuantity: 1, maxQuantity: 4, chance: 100, qualityAffected: false, rarity: 'common' },
      { itemId: 'cloth', name: 'Cloth', minQuantity: 0, maxQuantity: 2, chance: 50, qualityAffected: false, rarity: 'common' },
      { itemId: 'rope', name: 'Rope', minQuantity: 0, maxQuantity: 1, chance: 30, qualityAffected: false, rarity: 'common' },
      { itemId: 'broken_weapon', name: 'Broken Weapon', minQuantity: 0, maxQuantity: 1, chance: 10, qualityAffected: false, rarity: 'uncommon' },
    ]
  },
  {
    id: 'abandoned_camp',
    type: GatheringType.FORAGING,
    name: 'Abandoned Camp',
    description: 'A deserted campsite. Previous owners left in a hurry.',
    locationIds: ['western-outpost', 'the-wastes'],
    skillRequired: 'mining',
    levelRequired: 5,
    energyCost: 12,
    cooldownSeconds: 180, // 3 minutes
    yields: [
      { itemId: 'cloth', name: 'Cloth', minQuantity: 1, maxQuantity: 3, chance: 100, qualityAffected: false, rarity: 'common' },
      { itemId: 'rope', name: 'Rope', minQuantity: 1, maxQuantity: 2, chance: 70, qualityAffected: false, rarity: 'common' },
      { itemId: 'leather_strip', name: 'Leather Strip', minQuantity: 0, maxQuantity: 2, chance: 40, qualityAffected: false, rarity: 'common' },
      { itemId: 'coffee_beans', name: 'Coffee Beans', minQuantity: 0, maxQuantity: 3, chance: 25, qualityAffected: false, rarity: 'common' },
    ]
  },
  {
    id: 'animal_carcass',
    type: GatheringType.FORAGING,
    name: 'Animal Carcass',
    description: 'Remains of a dead animal. Salvageable materials within.',
    locationIds: ['western-outpost', 'kaiowa-mesa', 'the-wastes'],
    skillRequired: 'mining',
    levelRequired: 3,
    energyCost: 10,
    cooldownSeconds: 120, // 2 minutes
    yields: [
      { itemId: 'raw_hide', name: 'Raw Hide', minQuantity: 1, maxQuantity: 2, chance: 100, qualityAffected: true, rarity: 'common' },
      { itemId: 'animal_fat', name: 'Animal Fat', minQuantity: 1, maxQuantity: 2, chance: 80, qualityAffected: false, rarity: 'common' },
      { itemId: 'meat', name: 'Meat', minQuantity: 0, maxQuantity: 2, chance: 60, qualityAffected: true, rarity: 'common' },
      { itemId: 'bone', name: 'Bone', minQuantity: 0, maxQuantity: 2, chance: 50, qualityAffected: false, rarity: 'common' },
    ]
  },
  {
    id: 'water_source',
    type: GatheringType.FORAGING,
    name: 'Water Source',
    description: 'A natural spring or well. Clean water is precious out here.',
    locationIds: ['western-outpost', 'red-gulch', 'kaiowa-mesa', 'frontera'],
    skillRequired: 'mining',
    levelRequired: 1,
    energyCost: 5,
    cooldownSeconds: 60, // 1 minute
    yields: [
      { itemId: 'water', name: 'Water', minQuantity: 2, maxQuantity: 4, chance: 100, qualityAffected: false, rarity: 'common' },
      { itemId: 'salt', name: 'Salt', minQuantity: 0, maxQuantity: 1, chance: 15, qualityAffected: false, rarity: 'common' },
    ]
  },
  {
    id: 'hemp_plants',
    type: GatheringType.FORAGING,
    name: 'Hemp Plants',
    description: 'Wild hemp. Useful fibers for rope and cloth.',
    locationIds: ['western-outpost', 'frontera', 'kaiowa-mesa'],
    skillRequired: 'mining',
    levelRequired: 5,
    energyCost: 10,
    cooldownSeconds: 150, // 2.5 minutes
    yields: [
      { itemId: 'hemp', name: 'Hemp', minQuantity: 2, maxQuantity: 4, chance: 100, qualityAffected: false, rarity: 'common' },
      { itemId: 'cloth', name: 'Cloth', minQuantity: 0, maxQuantity: 1, chance: 30, qualityAffected: false, rarity: 'common' },
    ]
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all gathering nodes at a specific location
 */
export function getNodesAtLocation(locationId: string): GatheringNode[] {
  return GATHERING_NODES.filter(node => node.locationIds.includes(locationId));
}

/**
 * Get a gathering node by ID
 */
export function getNodeById(nodeId: string): GatheringNode | undefined {
  return GATHERING_NODES.find(node => node.id === nodeId);
}

/**
 * Get all nodes of a specific type
 */
export function getNodesByType(type: GatheringType): GatheringNode[] {
  return GATHERING_NODES.filter(node => node.type === type);
}

/**
 * Get nodes available to a character based on skill level
 */
export function getAvailableNodes(
  locationId: string,
  skillLevels: Record<string, number>
): GatheringNode[] {
  return getNodesAtLocation(locationId).filter(node => {
    const playerLevel = skillLevels[node.skillRequired] || 0;
    return playerLevel >= node.levelRequired;
  });
}

/**
 * Get total node count statistics
 */
export function getNodeStats(): { total: number; byType: Record<GatheringType, number> } {
  const byType = {
    [GatheringType.MINING]: 0,
    [GatheringType.HERBALISM]: 0,
    [GatheringType.WOODCUTTING]: 0,
    [GatheringType.FORAGING]: 0,
  };

  for (const node of GATHERING_NODES) {
    byType[node.type]++;
  }

  return {
    total: GATHERING_NODES.length,
    byType,
  };
}
