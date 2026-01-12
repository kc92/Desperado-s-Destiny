/**
 * Blacksmithing Crafted Items Database
 * Phase 7.2 Crafting Expansion - Recipe outputs for Blacksmithing profession
 * Includes: blades, tools, armor, metalwork, legendary weapons
 */

import { IItem } from '../../../models/Item.model';

export const blacksmithingCrafted: Partial<IItem>[] = [
  // ========== BASIC TOOLS & HARDWARE (Level 1-25) ==========
  {
    itemId: 'basic_knife',
    name: 'Basic Knife',
    description: 'A simple but sturdy iron knife. Every frontiersman needs one.',
    type: 'weapon',
    rarity: 'common',
    price: 35,
    sellPrice: 17,
    inShop: false,
    levelRequired: 1,
    icon: '🔪',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 3, description: '+3 Combat' }
    ]
  },
  {
    itemId: 'iron_nails',
    name: 'Iron Nails',
    description: 'A box of sturdy iron nails. Essential for construction.',
    type: 'misc',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
    inShop: false,
    levelRequired: 3,
    icon: '📍',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'simple_hatchet',
    name: 'Simple Hatchet',
    description: 'A basic hatchet for chopping wood and light work.',
    type: 'tool',
    rarity: 'common',
    price: 45,
    sellPrice: 22,
    inShop: false,
    levelRequired: 5,
    icon: '🪓',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 4, description: '+4 Combat' },
      { type: 'special', value: 10, description: '+10% wood gathering' }
    ]
  },
  {
    itemId: 'iron_horseshoe',
    name: 'Iron Horseshoe',
    description: 'A well-crafted horseshoe. Some say they bring luck.',
    type: 'misc',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: false,
    levelRequired: 8,
    icon: '🧲',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 50,
    effects: []
  },
  {
    itemId: 'branding_iron',
    name: 'Branding Iron',
    description: 'A custom branding iron for marking cattle. Every ranch needs one.',
    type: 'tool',
    rarity: 'common',
    price: 55,
    sellPrice: 27,
    inShop: false,
    levelRequired: 10,
    icon: '🔥',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'lantern_frame',
    name: 'Lantern Frame',
    description: 'A sturdy iron frame for oil lanterns.',
    type: 'misc',
    rarity: 'common',
    price: 35,
    sellPrice: 17,
    inShop: false,
    levelRequired: 12,
    icon: '🏮',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 25,
    effects: []
  },
  {
    itemId: 'camp_cooking_pot',
    name: 'Camp Cooking Pot',
    description: 'A durable cast iron pot for trail cooking.',
    type: 'tool',
    rarity: 'common',
    price: 65,
    sellPrice: 32,
    inShop: false,
    levelRequired: 15,
    icon: '🍲',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 10, description: '+10% cooking quality' }
    ]
  },
  {
    itemId: 'railroad_spikes',
    name: 'Railroad Spikes',
    description: 'Heavy iron spikes used in railroad construction.',
    type: 'misc',
    rarity: 'common',
    price: 20,
    sellPrice: 10,
    inShop: false,
    levelRequired: 15,
    icon: '🔩',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'iron_repair_kit',
    name: 'Iron Repair Kit',
    description: 'Basic tools and materials for repairing iron equipment.',
    type: 'tool',
    rarity: 'common',
    price: 75,
    sellPrice: 37,
    inShop: false,
    levelRequired: 18,
    icon: '🔧',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 25, description: 'Repairs equipment durability by 25%' }
    ]
  },
  {
    itemId: 'bear_trap',
    name: 'Bear Trap',
    description: 'A powerful iron trap for catching large game or unwary trespassers.',
    type: 'tool',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 20,
    icon: '🪤',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'stat', stat: 'combat', value: 15, description: 'Deals 15 damage when triggered' }
    ]
  },

  // ========== BLADES & WEAPONS (Level 15-60) ==========
  {
    itemId: 'bowie_knife',
    name: 'Bowie Knife',
    description: 'The legendary fighting knife of the frontier. Named after Jim Bowie himself.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 20,
    icon: '🗡️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat' }
    ]
  },
  {
    itemId: 'throwing_knives',
    name: 'Throwing Knives',
    description: 'A set of balanced throwing knives for silent takedowns.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 180,
    sellPrice: 90,
    inShop: false,
    levelRequired: 25,
    icon: '🗡️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 6, description: '+6 Combat' },
      { type: 'stat', stat: 'cunning', value: 3, description: '+3 Cunning' }
    ]
  },
  {
    itemId: 'steel_blade',
    name: 'Steel Blade',
    description: 'A fine steel blade ready for hilting. Sharp and durable.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 200,
    sellPrice: 100,
    inShop: false,
    levelRequired: 28,
    icon: '⚔️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 10, description: '+10 Combat' }
    ]
  },
  {
    itemId: 'frontier_machete',
    name: 'Frontier Machete',
    description: 'A heavy blade for clearing brush and fighting. Versatile and deadly.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 175,
    sellPrice: 87,
    inShop: false,
    levelRequired: 30,
    icon: '🔪',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 9, description: '+9 Combat' }
    ]
  },
  {
    itemId: 'steel_tomahawk',
    name: 'Steel Tomahawk',
    description: 'A steel-headed throwing axe. Deadly at any range.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 185,
    sellPrice: 92,
    inShop: false,
    levelRequired: 30,
    icon: '🪓',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 9, description: '+9 Combat' }
    ]
  },
  {
    itemId: 'frontier_war_axe',
    name: 'Frontier War Axe',
    description: 'A fearsome battle axe forged for frontier warfare.',
    type: 'weapon',
    rarity: 'rare',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 40,
    icon: '🪓',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 14, description: '+14 Combat' }
    ]
  },
  {
    itemId: 'cavalry_saber',
    name: 'Cavalry Saber',
    description: 'Standard issue cavalry sword. Curved blade for mounted combat.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 280,
    sellPrice: 140,
    inShop: false,
    levelRequired: 35,
    icon: '⚔️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 12, description: '+12 Combat' }
    ]
  },
  {
    itemId: 'army_officer_saber',
    name: 'Army Officer Saber',
    description: 'An ornate saber carried by cavalry officers. Symbol of rank and authority.',
    type: 'weapon',
    rarity: 'rare',
    price: 450,
    sellPrice: 225,
    inShop: false,
    levelRequired: 45,
    icon: '⚔️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' }
    ]
  },
  {
    itemId: 'damascus_knife',
    name: 'Damascus Steel Knife',
    description: 'A masterwork knife forged from legendary Damascus steel. Holds an edge forever.',
    type: 'weapon',
    rarity: 'rare',
    price: 500,
    sellPrice: 250,
    inShop: false,
    levelRequired: 50,
    icon: '🗡️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 16, description: '+16 Combat' },
      { type: 'stat', stat: 'cunning', value: 4, description: '+4 Cunning' }
    ]
  },
  {
    itemId: 'gentleman_dueling_sword',
    name: 'Gentleman Dueling Sword',
    description: 'An elegant rapier for settling matters of honor. Light and precise.',
    type: 'weapon',
    rarity: 'rare',
    price: 550,
    sellPrice: 275,
    inShop: false,
    levelRequired: 50,
    icon: '🤺',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 14, description: '+14 Combat' },
      { type: 'stat', stat: 'cunning', value: 6, description: '+6 Cunning' }
    ]
  },
  {
    itemId: 'ceremonial_sword',
    name: 'Ceremonial Sword',
    description: 'An ornate blade for ceremonies and display. Still deadly sharp.',
    type: 'weapon',
    rarity: 'rare',
    price: 400,
    sellPrice: 200,
    inShop: false,
    levelRequired: 45,
    icon: '⚔️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 12, description: '+12 Combat' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' }
    ]
  },
  {
    itemId: 'rifle_bayonet',
    name: 'Rifle Bayonet',
    description: 'A blade that attaches to rifle barrels. For when bullets run out.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 30,
    icon: '🔪',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat when attached to rifle' }
    ]
  },
  {
    itemId: 'executioner_blade',
    name: 'Executioner Blade',
    description: 'A massive, heavy blade designed for one purpose. Justice is swift.',
    type: 'weapon',
    rarity: 'rare',
    price: 600,
    sellPrice: 300,
    inShop: false,
    levelRequired: 55,
    icon: '⚔️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 20, description: '+20 Combat' }
    ]
  },

  // ========== ARMOR & PROTECTION (Level 25-70) ==========
  {
    itemId: 'chainmail_vest',
    name: 'Chainmail Vest',
    description: 'Interlocking iron rings provide protection against blades.',
    type: 'armor',
    rarity: 'uncommon',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 30,
    icon: '🛡️',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat (defense)' }
    ]
  },
  {
    itemId: 'steel_armor_plates',
    name: 'Steel Armor Plates',
    description: 'Heavy steel plates for maximum protection. Slows movement but stops bullets.',
    type: 'armor',
    rarity: 'rare',
    price: 650,
    sellPrice: 325,
    inShop: false,
    levelRequired: 50,
    icon: '🛡️',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 12, description: '+12 Combat (defense)' }
    ]
  },
  {
    itemId: 'reinforced_chest_plate',
    name: 'Reinforced Chest Plate',
    description: 'A steel chest plate reinforced with extra plating at vital points.',
    type: 'armor',
    rarity: 'rare',
    price: 750,
    sellPrice: 375,
    inShop: false,
    levelRequired: 55,
    icon: '🛡️',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat (defense)' }
    ]
  },
  {
    itemId: 'titanium_armor_set',
    name: 'Titanium Armor Set',
    description: 'Incredibly rare titanium alloy armor. Light as leather, strong as steel.',
    type: 'armor',
    rarity: 'legendary',
    price: 2500,
    sellPrice: 1250,
    inShop: false,
    levelRequired: 90,
    icon: '🛡️',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 25, description: '+25 Combat (defense)' },
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning' }
    ]
  },

  // ========== MINING & PROSPECTING TOOLS (Level 15-60) ==========
  {
    itemId: 'mining_pickaxe',
    name: 'Mining Pickaxe',
    description: 'A sturdy pickaxe for breaking rock and extracting ore.',
    type: 'tool',
    rarity: 'common',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 15,
    icon: '⛏️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 15, description: '+15% ore yield' }
    ]
  },
  {
    itemId: 'quality_mining_pick',
    name: 'Quality Mining Pick',
    description: 'A well-balanced pick with a hardened steel head.',
    type: 'tool',
    rarity: 'uncommon',
    price: 200,
    sellPrice: 100,
    inShop: false,
    levelRequired: 35,
    icon: '⛏️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 30, description: '+30% ore yield' }
    ]
  },
  {
    itemId: 'master_mining_pick',
    name: 'Master Mining Pick',
    description: 'The finest mining pick money can buy. Cuts through any rock.',
    type: 'tool',
    rarity: 'rare',
    price: 550,
    sellPrice: 275,
    inShop: false,
    levelRequired: 55,
    icon: '⛏️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 50, description: '+50% ore yield' },
      { type: 'special', value: 25, description: '+25% rare ore chance' }
    ]
  },
  {
    itemId: 'prospector_pan',
    name: 'Prospector Pan',
    description: 'A wide, shallow pan for separating gold from river sediment.',
    type: 'tool',
    rarity: 'common',
    price: 45,
    sellPrice: 22,
    inShop: false,
    levelRequired: 10,
    icon: '🥘',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 20, description: '+20% gold panning success' }
    ]
  },
  {
    itemId: 'gemstone_polished',
    name: 'Polished Gemstone',
    description: 'A raw gemstone cut and polished to perfection. Valuable and beautiful.',
    type: 'misc',
    rarity: 'rare',
    price: 300,
    sellPrice: 150,
    inShop: false,
    levelRequired: 45,
    icon: '💎',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 25,
    effects: []
  },
  {
    itemId: 'stone_block',
    name: 'Stone Block',
    description: 'A precisely cut block of building stone. Foundation of civilization.',
    type: 'misc',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: false,
    levelRequired: 12,
    icon: '🧱',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },

  // ========== HORSESHOES & EQUESTRIAN (Level 20-50) ==========
  {
    itemId: 'steel_horseshoes',
    name: 'Steel Horseshoes',
    description: 'Premium steel horseshoes for better grip and durability.',
    type: 'misc',
    rarity: 'uncommon',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 25,
    icon: '🧲',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 25,
    effects: [
      { type: 'special', value: 10, description: '+10% horse speed' }
    ]
  },
  {
    itemId: 'steel_spurs',
    name: 'Steel Spurs',
    description: 'Sharp riding spurs for better horse control.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 95,
    sellPrice: 47,
    inShop: false,
    levelRequired: 28,
    icon: '⚙️',
    isEquippable: true,
    equipSlot: 'feet',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 15, description: '+15% horse handling' }
    ]
  },
  {
    itemId: 'silver_horseshoes',
    name: 'Silver-Inlaid Horseshoes',
    description: 'Premium horseshoes with silver inlay. For the finest horses.',
    type: 'misc',
    rarity: 'rare',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 50,
    icon: '🧲',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 25, description: '+25% horse speed' },
      { type: 'special', value: 15, description: '+15% horse stamina' }
    ]
  },

  // ========== SHERIFF & LAWMAN ITEMS (Level 30-55) ==========
  {
    itemId: 'sheriff_badge',
    name: "Sheriff's Badge",
    description: 'A polished tin star. Symbol of law and order in the frontier.',
    type: 'accessory',
    rarity: 'rare',
    price: 200,
    sellPrice: 100,
    inShop: false,
    levelRequired: 35,
    icon: '⭐',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 8, description: '+8 Spirit' },
      { type: 'special', value: 20, description: '+20% intimidation' }
    ]
  },
  {
    itemId: 'bounty_hunter_shackles',
    name: 'Bounty Hunter Shackles',
    description: 'Heavy iron shackles for securing dangerous criminals.',
    type: 'tool',
    rarity: 'uncommon',
    price: 125,
    sellPrice: 62,
    inShop: false,
    levelRequired: 30,
    icon: '⛓️',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: []
  },

  // ========== STORAGE & SECURITY (Level 25-50) ==========
  {
    itemId: 'reinforced_lockbox',
    name: 'Reinforced Lockbox',
    description: 'A sturdy iron lockbox for securing valuables.',
    type: 'misc',
    rarity: 'uncommon',
    price: 175,
    sellPrice: 87,
    inShop: false,
    levelRequired: 30,
    icon: '🔐',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'reinforced_strongbox',
    name: 'Reinforced Strongbox',
    description: 'A heavy iron strongbox that would challenge any safecracker.',
    type: 'misc',
    rarity: 'rare',
    price: 450,
    sellPrice: 225,
    inShop: false,
    levelRequired: 45,
    icon: '🔐',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },

  // ========== REPAIR KITS (Level 25-55) ==========
  {
    itemId: 'steel_repair_kit',
    name: 'Steel Repair Kit',
    description: 'Advanced tools for repairing steel equipment and weapons.',
    type: 'tool',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 35,
    icon: '🔧',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 50, description: 'Repairs equipment durability by 50%' }
    ]
  },

  // ========== GUNSMITHING SUPPORT (Level 40-65) ==========
  {
    itemId: 'silver_bullet_mold',
    name: 'Silver Bullet Mold',
    description: 'A mold for casting silver bullets. Essential for hunting supernatural creatures.',
    type: 'tool',
    rarity: 'rare',
    price: 400,
    sellPrice: 200,
    inShop: false,
    levelRequired: 50,
    icon: '🔘',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'masterwork_revolver_frame',
    name: 'Masterwork Revolver Frame',
    description: 'A precision-crafted steel frame for building high-quality revolvers.',
    type: 'misc',
    rarity: 'rare',
    price: 500,
    sellPrice: 250,
    inShop: false,
    levelRequired: 55,
    icon: '🔫',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'hardwood_handle',
    name: 'Hardwood Handle',
    description: 'A finely crafted hardwood handle for tools and weapons.',
    type: 'misc',
    rarity: 'uncommon',
    price: 45,
    sellPrice: 22,
    inShop: false,
    levelRequired: 25,
    icon: '🪵',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 50,
    effects: []
  },
  {
    itemId: 'wood_handle',
    name: 'Wooden Handle',
    description: 'A simple wooden handle for basic tools.',
    type: 'misc',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
    inShop: false,
    levelRequired: 10,
    icon: '🪵',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },

  // ========== SUPERNATURAL & LEGENDARY WEAPONS (Level 70-100) ==========
  {
    itemId: 'cursed_iron_blade',
    name: 'Cursed Iron Blade',
    description: 'A blade forged under a dark moon. Whispers of blood and vengeance.',
    type: 'weapon',
    rarity: 'epic',
    price: 1200,
    sellPrice: 600,
    inShop: false,
    levelRequired: 70,
    icon: '⚔️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 22, description: '+22 Combat' },
      { type: 'special', value: 10, description: '+10% lifesteal' }
    ]
  },
  {
    itemId: 'meteorite_blade',
    name: 'Meteorite Blade',
    description: 'Forged from fallen star-metal. Harder than any earthly steel.',
    type: 'weapon',
    rarity: 'epic',
    price: 1500,
    sellPrice: 750,
    inShop: false,
    levelRequired: 75,
    icon: '☄️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 25, description: '+25 Combat' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' }
    ]
  },
  {
    itemId: 'spirit_forged_blade',
    name: 'Spirit-Forged Blade',
    description: 'A blade quenched in spirit water. Cuts both flesh and soul.',
    type: 'weapon',
    rarity: 'epic',
    price: 1800,
    sellPrice: 900,
    inShop: false,
    levelRequired: 80,
    icon: '👻',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 24, description: '+24 Combat' },
      { type: 'stat', stat: 'spirit', value: 10, description: '+10 Spirit' },
      { type: 'special', value: 100, description: 'Damages incorporeal beings' }
    ]
  },
  {
    itemId: 'hellfire_brand',
    name: 'Hellfire Brand',
    description: 'A blade eternally burning with hellfire. The metal itself screams.',
    type: 'weapon',
    rarity: 'legendary',
    price: 2500,
    sellPrice: 1250,
    inShop: false,
    levelRequired: 85,
    icon: '🔥',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 30, description: '+30 Combat' },
      { type: 'special', value: 15, description: '+15 fire damage' }
    ]
  },
  {
    itemId: 'legendary_bowie_knife',
    name: 'Legendary Bowie Knife',
    description: "Jim Bowie's actual knife, recovered from the Alamo. A piece of history.",
    type: 'weapon',
    rarity: 'legendary',
    price: 3000,
    sellPrice: 1500,
    inShop: false,
    levelRequired: 88,
    icon: '🗡️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 28, description: '+28 Combat' },
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' }
    ]
  },
  {
    itemId: 'the_peacemaker',
    name: 'The Peacemaker',
    description: 'A legendary blade that has ended countless feuds. Its very presence calms anger.',
    type: 'weapon',
    rarity: 'legendary',
    price: 3500,
    sellPrice: 1750,
    inShop: false,
    levelRequired: 90,
    icon: '⚔️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 26, description: '+26 Combat' },
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit' },
      { type: 'special', value: 30, description: '+30% negotiation success' }
    ]
  },
  {
    itemId: 'archangel_blade',
    name: 'Archangel Blade',
    description: 'A holy blade blessed by celestial beings. Burns evil with divine fire.',
    type: 'weapon',
    rarity: 'legendary',
    price: 5000,
    sellPrice: 2500,
    inShop: false,
    levelRequired: 95,
    icon: '👼',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 35, description: '+35 Combat' },
      { type: 'stat', stat: 'spirit', value: 20, description: '+20 Spirit' },
      { type: 'special', value: 50, description: '+50% damage to evil creatures' }
    ]
  },
  {
    itemId: 'divine_armor',
    name: 'Divine Armor',
    description: 'Armor blessed by the heavens themselves. Practically invulnerable.',
    type: 'armor',
    rarity: 'legendary',
    price: 5500,
    sellPrice: 2750,
    inShop: false,
    levelRequired: 95,
    icon: '🛡️',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 30, description: '+30 Combat (defense)' },
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit' },
      { type: 'special', value: 25, description: '+25% damage resistance' }
    ]
  },
  {
    itemId: 'world_splitter',
    name: 'World Splitter',
    description: 'A blade of cosmic power, said to have sundered mountains. The ultimate weapon.',
    type: 'weapon',
    rarity: 'legendary',
    price: 10000,
    sellPrice: 5000,
    inShop: false,
    levelRequired: 100,
    icon: '🌍',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 50, description: '+50 Combat' },
      { type: 'stat', stat: 'spirit', value: 25, description: '+25 Spirit' },
      { type: 'special', value: 100, description: 'Devastating critical hits' }
    ]
  },
  {
    itemId: 'legendary_anvil',
    name: 'Legendary Anvil',
    description: 'An ancient anvil of legendary quality. Items forged upon it are imbued with greatness.',
    type: 'tool',
    rarity: 'legendary',
    price: 4000,
    sellPrice: 2000,
    inShop: false,
    levelRequired: 90,
    icon: '🔨',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'craft', value: 25, description: '+25 Craft' },
      { type: 'special', value: 50, description: '+50% quality when forging' }
    ]
  }
];
