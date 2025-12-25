/**
 * Heart of the Territory Gear - Phase 19.4
 * Items for L26-35 territory control content pack
 *
 * Item Categories:
 * - Weapons (8): Boss drops and quest rewards
 * - Armor (8): Body, head, and accessory slots
 * - Accessories (8): Territory control and gang leadership focus
 * - Consumables (6): Territory and gang war support
 */

import { IItem } from '../../models/Item.model';

export const heartOfTerritoryGear: Partial<IItem>[] = [
  // ========================================
  // WEAPONS (8)
  // ========================================

  // Boss Drop - Claim Jumper Gang (L28)
  {
    itemId: 'dutchs-dual-pistols',
    name: "Dutch's Dual Pistols",
    description: 'The claim jumper king\'s matched revolvers. One for mining disputes, one for everything else. The grips are worn smooth from years of use.',
    type: 'weapon',
    rarity: 'epic',
    price: 2200,
    sellPrice: 1100,
    inShop: false,
    levelRequired: 28,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 16, description: '+16 Combat' },
      { type: 'stat', stat: 'cunning', value: 6, description: '+6 Cunning' },
      { type: 'special', value: 25, description: '+25% damage when defending territory' }
    ]
  },

  // Boss Drop - Silver Baron (L30)
  {
    itemId: 'silver-barons-cane',
    name: "Silver Baron's Cane-Sword",
    description: 'Whitmore\'s gentleman\'s weapon. The blade is pure Silverado silver - a statement of wealth and violence. The handle conceals a single-shot derringer.',
    type: 'weapon',
    rarity: 'epic',
    price: 2800,
    sellPrice: 1400,
    inShop: false,
    levelRequired: 30,
    icon: '🗡️',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 18, description: '+18 Combat' },
      { type: 'stat', stat: 'cunning', value: 8, description: '+8 Cunning' },
      { type: 'special', value: 15, description: '+15% gold from all sources' },
      { type: 'special', value: 20, description: '+20% intimidation effectiveness' }
    ]
  },

  // Boss Drop - War Chief Iron Wolf (L32)
  {
    itemId: 'spirit-tomahawk',
    name: 'Spirit Tomahawk',
    description: 'Iron Wolf\'s sacred weapon. The blade seems to glow faintly in moonlight, and whispers of ancestors can be heard when it strikes.',
    type: 'weapon',
    rarity: 'epic',
    price: 3200,
    sellPrice: 1600,
    inShop: false,
    levelRequired: 32,
    icon: '🪓',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 20, description: '+20 Combat' },
      { type: 'stat', stat: 'spirit', value: 10, description: '+10 Spirit' },
      { type: 'special', value: 30, description: '+30% damage in wilderness zones' },
      { type: 'special', value: 15, description: 'Can be thrown as ranged attack' }
    ]
  },

  // Boss Drop - Claim King (L35)
  {
    itemId: 'claim-kings-revolver',
    name: "Claim King's Revolver",
    description: 'The weapon of whoever ruled Silverado. It carries the weight of an empire. The cylinder is engraved with the names of fallen rivals.',
    type: 'weapon',
    rarity: 'legendary',
    price: 5000,
    sellPrice: 2500,
    inShop: false,
    levelRequired: 35,
    icon: '👑',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 25, description: '+25 Combat' },
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' },
      { type: 'special', value: 25, description: '+25% gang war damage' },
      { type: 'special', value: 15, description: '+15% territory influence gain' }
    ]
  },

  // Quest Reward - Silverado Strike (L26)
  {
    itemId: 'prospectors-pickaxe',
    name: "Prospector's Pickaxe",
    description: 'A well-balanced pickaxe that works equally well on ore and enemies. The head is forged from Silverado steel.',
    type: 'weapon',
    rarity: 'rare',
    price: 1600,
    sellPrice: 800,
    inShop: true,
    levelRequired: 26,
    icon: '⛏️',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 12, description: '+12 Combat' },
      { type: 'stat', stat: 'craft', value: 8, description: '+8 Craft' },
      { type: 'special', value: 30, description: '+30% mining yield in controlled zones' }
    ]
  },

  // Quest Reward (L27)
  {
    itemId: 'claim-defenders-rifle',
    name: "Claim Defender's Rifle",
    description: 'A long rifle modified for defending mining claims. The scope is optimized for picking off claim jumpers at range.',
    type: 'weapon',
    rarity: 'rare',
    price: 1800,
    sellPrice: 900,
    inShop: true,
    levelRequired: 27,
    icon: '🎯',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 14, description: '+14 Combat' },
      { type: 'special', value: 20, description: '+20% damage when defending claims' },
      { type: 'special', value: 15, description: '+15% critical hit chance' }
    ]
  },

  // Quest Reward (L29)
  {
    itemId: 'gang-leaders-shotgun',
    name: "Gang Leader's Shotgun",
    description: 'The weapon of choice for gang officers. Clears rooms quickly and makes a statement. Double-barreled devastation.',
    type: 'weapon',
    rarity: 'rare',
    price: 2000,
    sellPrice: 1000,
    inShop: true,
    levelRequired: 29,
    icon: '💥',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit (intimidating presence)' },
      { type: 'special', value: 25, description: '+25% damage vs multiple enemies' },
      { type: 'special', value: 10, description: '+10% gang member morale' }
    ]
  },

  // Quest Reward (L31)
  {
    itemId: 'territorial-enforcer',
    name: 'Territorial Enforcer',
    description: 'A heavy revolver inscribed with territorial boundaries. "This is MY land" is etched along the barrel.',
    type: 'weapon',
    rarity: 'rare',
    price: 2200,
    sellPrice: 1100,
    inShop: true,
    levelRequired: 31,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 17, description: '+17 Combat' },
      { type: 'special', value: 20, description: '+20% damage in controlled territory' },
      { type: 'special', value: 10, description: '+10% influence gain from combat' }
    ]
  },

  // ========================================
  // ARMOR - HEAD (4)
  // ========================================

  // Boss Drop - War Chief Iron Wolf (L32)
  {
    itemId: 'iron-wolfs-war-bonnet',
    name: "Iron Wolf's War Bonnet",
    description: 'The sacred headdress of the Apache War Chief. Each feather represents a battle won. It carries the blessing of the ancestors.',
    type: 'armor',
    rarity: 'epic',
    price: 3000,
    sellPrice: 1500,
    inShop: false,
    levelRequired: 32,
    icon: '🪶',
    equipSlot: 'head',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit' },
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat' },
      { type: 'special', value: 25, description: '+25% leadership effectiveness' },
      { type: 'special', value: 20, description: '+20% ally damage in group combat' }
    ]
  },

  // Boss Drop - Silver Baron (L30)
  {
    itemId: 'barons-top-hat',
    name: "Baron's Top Hat",
    description: 'Whitmore\'s signature top hat. Somehow survived the fight completely unscathed. A symbol of gilded age excess.',
    type: 'armor',
    rarity: 'epic',
    price: 2500,
    sellPrice: 1250,
    inShop: false,
    levelRequired: 30,
    icon: '🎩',
    equipSlot: 'head',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'cunning', value: 12, description: '+12 Cunning' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' },
      { type: 'special', value: 20, description: '+20% shop prices when selling' },
      { type: 'special', value: 15, description: '+15% negotiation success' }
    ]
  },

  // Boss Drop - Claim King (L35)
  {
    itemId: 'crown-of-silverado',
    name: 'Crown of Silverado',
    description: 'A crown forged from pure Silverado silver. Symbol of territorial dominance. He who wears it rules the valley.',
    type: 'armor',
    rarity: 'legendary',
    price: 8000,
    sellPrice: 4000,
    inShop: false,
    levelRequired: 35,
    icon: '👑',
    equipSlot: 'head',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'spirit', value: 12, description: '+12 Spirit' },
      { type: 'stat', stat: 'cunning', value: 12, description: '+12 Cunning' },
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat' },
      { type: 'special', value: 25, description: '+25% territory income' },
      { type: 'special', value: 15, description: '+15% gang loyalty' }
    ]
  },

  // Quest Reward (L27)
  {
    itemId: 'silverado-miners-helmet',
    name: "Silverado Miner's Helmet",
    description: 'A reinforced helmet from the Silverado mines. The lamp still works, casting an eerie glow in the dark tunnels.',
    type: 'armor',
    rarity: 'uncommon',
    price: 1000,
    sellPrice: 500,
    inShop: true,
    levelRequired: 27,
    icon: '⛑️',
    equipSlot: 'head',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'craft', value: 8, description: '+8 Craft' },
      { type: 'special', value: 20, description: '+20% mining speed in Silverado zones' },
      { type: 'special', value: 10, description: '+10% rare ore chance' }
    ]
  },

  // ========================================
  // ARMOR - BODY (4)
  // ========================================

  // Quest Reward (L26)
  {
    itemId: 'miners-reinforced-jacket',
    name: "Miner's Reinforced Jacket",
    description: 'A jacket reinforced with metal plates. Protection for dangerous claims. Scorch marks from mine explosions tell its story.',
    type: 'armor',
    rarity: 'uncommon',
    price: 1200,
    sellPrice: 600,
    inShop: true,
    levelRequired: 26,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 6, description: '+6 Combat' },
      { type: 'stat', stat: 'craft', value: 5, description: '+5 Craft' },
      { type: 'special', value: 15, description: '+15% damage resistance' }
    ]
  },

  // Quest Reward (L29)
  {
    itemId: 'territory-controllers-coat',
    name: "Territory Controller's Coat",
    description: 'A long coat with gang insignia. Marks you as someone who controls land. The pockets are deep enough for deed papers.',
    type: 'armor',
    rarity: 'rare',
    price: 2000,
    sellPrice: 1000,
    inShop: true,
    levelRequired: 29,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat' },
      { type: 'stat', stat: 'spirit', value: 6, description: '+6 Spirit' },
      { type: 'special', value: 15, description: '+15% influence gain in all zones' }
    ]
  },

  // Quest Reward (L31)
  {
    itemId: 'gang-war-armor',
    name: 'Gang War Armor',
    description: 'Heavy leather armor designed for gang warfare. Protects vital organs. Bloodstains from previous owners add character.',
    type: 'armor',
    rarity: 'rare',
    price: 2400,
    sellPrice: 1200,
    inShop: true,
    levelRequired: 31,
    icon: '🛡️',
    equipSlot: 'body',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 10, description: '+10 Combat' },
      { type: 'special', value: 25, description: '+25% damage resistance in gang wars' },
      { type: 'special', value: 10, description: '+10% war mission success' }
    ]
  },

  // Quest Reward (L34)
  {
    itemId: 'claim-kings-vest',
    name: "Claim King's Vest",
    description: 'The vest worn by Silverado\'s ruler. Lined with silver thread that glimmers in the light. Symbol of ultimate territorial power.',
    type: 'armor',
    rarity: 'epic',
    price: 3500,
    sellPrice: 1750,
    inShop: false,
    levelRequired: 34,
    icon: '🦺',
    equipSlot: 'body',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 12, description: '+12 Combat' },
      { type: 'stat', stat: 'spirit', value: 8, description: '+8 Spirit' },
      { type: 'special', value: 20, description: '+20% territory defense rating' },
      { type: 'special', value: 15, description: '+15% passive income from zones' }
    ]
  },

  // ========================================
  // ACCESSORIES (8)
  // ========================================

  // Boss Drop - Claim King (L35)
  {
    itemId: 'territory-deed-bundle',
    name: 'Territory Deed Bundle',
    description: 'Ownership deeds for prime Silverado territory. Real power in paper form. Each deed is signed in blood.',
    type: 'armor',
    rarity: 'legendary',
    price: 10000,
    sellPrice: 5000,
    inShop: false,
    levelRequired: 35,
    icon: '📜',
    equipSlot: 'accessory',
    isEquippable: true,
    effects: [
      { type: 'special', value: 50, description: '+50% territory income' },
      { type: 'special', value: 25, description: '+25% influence gain' },
      { type: 'special', value: 10, description: '+10 influence/day passive' }
    ]
  },

  // Boss Drop - War Chief Iron Wolf (L32)
  {
    itemId: 'war-chiefs-medicine-bag',
    name: "War Chief's Medicine Bag",
    description: 'Iron Wolf\'s sacred medicine bag. Contains powerful spiritual objects that protect the wearer in battle.',
    type: 'armor',
    rarity: 'epic',
    price: 2800,
    sellPrice: 1400,
    inShop: false,
    levelRequired: 32,
    icon: '👝',
    equipSlot: 'accessory',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'spirit', value: 12, description: '+12 Spirit' },
      { type: 'special', value: 20, description: '+20% damage reduction when outnumbered' },
      { type: 'special', value: 30, description: '+30% ally healing effectiveness' }
    ]
  },

  // Boss Drop - Silver Baron (L30)
  {
    itemId: 'bribery-ledger',
    name: 'Bribery Ledger',
    description: 'Whitmore\'s record of corruption. Every politician, judge, and lawman he owned. Knowledge is power.',
    type: 'armor',
    rarity: 'epic',
    price: 2400,
    sellPrice: 1200,
    inShop: false,
    levelRequired: 30,
    icon: '📒',
    equipSlot: 'accessory',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning' },
      { type: 'special', value: 25, description: '+25% bribery success' },
      { type: 'special', value: 15, description: '+15% jail time reduction' }
    ]
  },

  // Quest Reward (L26)
  {
    itemId: 'prospectors-claim-deed',
    name: "Prospector's Claim Deed",
    description: 'Your first legitimate mining claim in Silverado. The paper is already stained with dirt and hope.',
    type: 'armor',
    rarity: 'rare',
    price: 1500,
    sellPrice: 750,
    inShop: false,
    levelRequired: 26,
    icon: '📃',
    equipSlot: 'accessory',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'craft', value: 5, description: '+5 Craft' },
      { type: 'special', value: 25, description: '+25% silver ore value' },
      { type: 'special', value: 10, description: '+10% mining zone influence' }
    ]
  },

  // Quest Reward (L28)
  {
    itemId: 'gang-officers-badge',
    name: "Gang Officer's Badge",
    description: 'A badge marking you as a gang officer. Carries authority among outlaws and respect from rivals.',
    type: 'armor',
    rarity: 'rare',
    price: 1800,
    sellPrice: 900,
    inShop: false,
    levelRequired: 28,
    icon: '🏅',
    equipSlot: 'accessory',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'spirit', value: 6, description: '+6 Spirit' },
      { type: 'stat', stat: 'cunning', value: 4, description: '+4 Cunning' },
      { type: 'special', value: 15, description: '+15% gang member contribution' },
      { type: 'special', value: 10, description: '+10% territory defense' }
    ]
  },

  // Quest Reward (L29)
  {
    itemId: 'territorial-map-case',
    name: 'Territorial Map Case',
    description: 'A leather case containing detailed territorial maps and intelligence. Every zone, every claim, every secret passage.',
    type: 'armor',
    rarity: 'rare',
    price: 2000,
    sellPrice: 1000,
    inShop: true,
    levelRequired: 29,
    icon: '🗺️',
    equipSlot: 'accessory',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'cunning', value: 8, description: '+8 Cunning' },
      { type: 'special', value: 20, description: '+20% tracking speed' },
      { type: 'special', value: 15, description: '+15% territory bonus effectiveness' }
    ]
  },

  // Quest Reward (L31)
  {
    itemId: 'gang-war-medal',
    name: 'Gang War Medal',
    description: 'A medal earned through gang warfare. Symbol of veteran status. Each notch represents a war won.',
    type: 'armor',
    rarity: 'epic',
    price: 2600,
    sellPrice: 1300,
    inShop: false,
    levelRequired: 31,
    icon: '🎖️',
    equipSlot: 'accessory',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' },
      { type: 'special', value: 20, description: '+20% gang war score contribution' },
      { type: 'special', value: 15, description: '+15% war mission rewards' }
    ]
  },

  // Quest Reward (L33)
  {
    itemId: 'empire-builders-compass',
    name: "Empire Builder's Compass",
    description: 'A compass that always points toward opportunity. Perfect for territory expansion. The needle is made of silver.',
    type: 'armor',
    rarity: 'epic',
    price: 3000,
    sellPrice: 1500,
    inShop: false,
    levelRequired: 33,
    icon: '🧭',
    equipSlot: 'accessory',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'cunning', value: 8, description: '+8 Cunning' },
      { type: 'stat', stat: 'spirit', value: 4, description: '+4 Spirit' },
      { type: 'special', value: 25, description: '+25% territory discovery rewards' },
      { type: 'special', value: 15, description: '+15% all territory bonuses' }
    ]
  },

  // ========================================
  // CONSUMABLES (6)
  // ========================================

  {
    itemId: 'territory-claim-stake',
    name: 'Territory Claim Stake',
    description: 'A wooden stake with your gang\'s insignia. Plant it to begin claiming territory. Each one is carved from Silverado oak.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 200,
    sellPrice: 100,
    inShop: true,
    levelRequired: 26,
    icon: '🪵',
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 10, description: '+10 immediate influence in current zone' }
    ]
  },

  {
    itemId: 'gang-war-rations',
    name: 'Gang War Rations',
    description: 'Combat rations for extended gang warfare. Keep your strength up during long battles. Tastes like victory.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: true,
    levelRequired: 27,
    icon: '🥩',
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'health', value: 100, description: 'Restore 100 HP' },
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat for 1 hour' }
    ]
  },

  {
    itemId: 'influence-bribe-pouch',
    name: 'Influence Bribe Pouch',
    description: 'Gold for bribing locals. Quickly boosts territorial influence. The coins are marked with your gang symbol.',
    type: 'consumable',
    rarity: 'rare',
    price: 500,
    sellPrice: 250,
    inShop: true,
    levelRequired: 28,
    icon: '💰',
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 20, description: '+20 immediate influence in current zone' },
      { type: 'special', value: 10, description: '+10% influence gain for 1 hour' }
    ]
  },

  {
    itemId: 'war-chest-contribution',
    name: 'War Chest Contribution',
    description: 'A bag of gold specifically for gang war efforts. Your contribution helps fund the war machine.',
    type: 'consumable',
    rarity: 'rare',
    price: 1000,
    sellPrice: 500,
    inShop: true,
    levelRequired: 29,
    icon: '💎',
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 1000, description: '+1000 gold to gang war chest' },
      { type: 'special', value: 50, description: '+50 gang war score' }
    ]
  },

  {
    itemId: 'territorial-siege-bomb',
    name: 'Territorial Siege Bomb',
    description: 'A powerful explosive for breaking enemy territory defenses. Handle with extreme care. Made with Silverado dynamite.',
    type: 'consumable',
    rarity: 'epic',
    price: 800,
    sellPrice: 400,
    inShop: true,
    levelRequired: 31,
    icon: '💣',
    isConsumable: true,
    isStackable: true,
    maxStack: 3,
    effects: [
      { type: 'combat_score', value: 300, description: 'Deal 300 AoE damage' },
      { type: 'special', value: 20, description: '-20 enemy zone defense rating for 1 hour' }
    ]
  },

  {
    itemId: 'empire-expansion-tonic',
    name: 'Empire Expansion Tonic',
    description: 'A powerful stimulant that enhances all territorial activities. Brewed by Silverado\'s finest alchemists.',
    type: 'consumable',
    rarity: 'epic',
    price: 600,
    sellPrice: 300,
    inShop: true,
    levelRequired: 33,
    icon: '🧪',
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 50, description: '+50% influence gain for 30 minutes' },
      { type: 'special', value: 25, description: '+25% territory bonus effectiveness for 30 minutes' }
    ]
  }
];

/**
 * Get Heart of Territory item by ID
 */
export function getHeartOfTerritoryItem(itemId: string): Partial<IItem> | undefined {
  return heartOfTerritoryGear.find(item => item.itemId === itemId);
}

/**
 * Get items by rarity
 */
export function getHeartOfTerritoryItemsByRarity(rarity: string): Partial<IItem>[] {
  return heartOfTerritoryGear.filter(item => item.rarity === rarity);
}

/**
 * Get items by type
 */
export function getHeartOfTerritoryItemsByType(type: string): Partial<IItem>[] {
  return heartOfTerritoryGear.filter(item => item.type === type);
}

/**
 * Get all boss drop items
 */
export function getHeartOfTerritoryBossDrops(): Partial<IItem>[] {
  return heartOfTerritoryGear.filter(item => item.inShop === false && item.rarity !== 'uncommon');
}
