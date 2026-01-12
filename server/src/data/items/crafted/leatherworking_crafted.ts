/**
 * Leatherworking Crafted Items Database
 * Phase 7.2 Crafting Expansion - Recipe outputs for Leatherworking profession
 * Includes: holsters, belts, boots, saddles, armor, accessories
 */

import { IItem } from '../../../models/Item.model';

export const leatherworkingCrafted: Partial<IItem>[] = [
  // ========== BASIC LEATHER GOODS (Level 1-20) ==========
  {
    itemId: 'basic_strap',
    name: 'Basic Leather Strap',
    description: 'A simple leather strap for various uses.',
    type: 'misc',
    rarity: 'common',
    price: 10,
    sellPrice: 5,
    inShop: false,
    levelRequired: 1,
    icon: '🪢',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'leather_pouch',
    name: 'Leather Pouch',
    description: 'A small pouch for carrying coins and small items.',
    type: 'accessory',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: false,
    levelRequired: 5,
    icon: '👝',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 5, description: '+5 inventory slots' }
    ]
  },
  {
    itemId: 'coin_pouch',
    name: 'Coin Pouch',
    description: 'A secure pouch specifically designed for coins.',
    type: 'accessory',
    rarity: 'common',
    price: 30,
    sellPrice: 15,
    inShop: false,
    levelRequired: 8,
    icon: '💰',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 10, description: '+10% gold capacity' }
    ]
  },
  {
    itemId: 'tobacco_pouch',
    name: 'Tobacco Pouch',
    description: 'A lined pouch that keeps tobacco fresh.',
    type: 'accessory',
    rarity: 'common',
    price: 20,
    sellPrice: 10,
    inShop: false,
    levelRequired: 5,
    icon: '🧳',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: []
  },
  {
    itemId: 'knife_sheath',
    name: 'Knife Sheath',
    description: 'A leather sheath for carrying a knife safely.',
    type: 'accessory',
    rarity: 'common',
    price: 35,
    sellPrice: 17,
    inShop: false,
    levelRequired: 10,
    icon: '🗡️',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 10, description: '+10% knife draw speed' }
    ]
  },
  {
    itemId: 'water_canteen',
    name: 'Water Canteen',
    description: 'A leather-wrapped canteen for carrying water on the trail.',
    type: 'tool',
    rarity: 'common',
    price: 40,
    sellPrice: 20,
    inShop: false,
    levelRequired: 12,
    icon: '🫗',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 20, description: '+20% hydration duration' }
    ]
  },

  // ========== BELTS (Level 10-40) ==========
  {
    itemId: 'simple_belt',
    name: 'Simple Leather Belt',
    description: 'A basic leather belt. Keeps your pants up.',
    type: 'armor',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: false,
    levelRequired: 8,
    icon: '🪢',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'studded_belt',
    name: 'Studded Leather Belt',
    description: 'A tough belt with metal studs. Stylish and practical.',
    type: 'armor',
    rarity: 'uncommon',
    price: 65,
    sellPrice: 32,
    inShop: false,
    levelRequired: 20,
    icon: '🪢',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat (defense)' }
    ]
  },
  {
    itemId: 'cartridge_belt',
    name: 'Cartridge Belt',
    description: 'A belt with loops for carrying ammunition.',
    type: 'armor',
    rarity: 'uncommon',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 25,
    icon: '🪢',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 20, description: '+20 ammo capacity' }
    ]
  },
  {
    itemId: 'ammunition_belt',
    name: 'Ammunition Belt',
    description: 'A heavy-duty belt designed to carry lots of ammunition.',
    type: 'armor',
    rarity: 'rare',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 40,
    icon: '🪢',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 50, description: '+50 ammo capacity' }
    ]
  },

  // ========== HOLSTERS (Level 15-60) ==========
  {
    itemId: 'hip_holster',
    name: 'Hip Holster',
    description: 'A basic holster worn at the hip.',
    type: 'armor',
    rarity: 'common',
    price: 45,
    sellPrice: 22,
    inShop: false,
    levelRequired: 15,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 10, description: '+10% draw speed' }
    ]
  },
  {
    itemId: 'gun_holster',
    name: 'Gun Holster',
    description: 'A quality leather holster for revolvers.',
    type: 'armor',
    rarity: 'uncommon',
    price: 75,
    sellPrice: 37,
    inShop: false,
    levelRequired: 22,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 15, description: '+15% draw speed' }
    ]
  },
  {
    itemId: 'concealed_holster',
    name: 'Concealed Holster',
    description: 'A hidden holster worn under clothing.',
    type: 'armor',
    rarity: 'uncommon',
    price: 95,
    sellPrice: 47,
    inShop: false,
    levelRequired: 28,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning' }
    ]
  },
  {
    itemId: 'quickdraw_holster',
    name: 'Quickdraw Holster',
    description: 'A specially designed holster for fast draws.',
    type: 'armor',
    rarity: 'rare',
    price: 200,
    sellPrice: 100,
    inShop: false,
    levelRequired: 40,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 30, description: '+30% draw speed' }
    ]
  },
  {
    itemId: 'saddle_holster',
    name: 'Saddle Holster',
    description: 'A holster that attaches to your saddle for rifles.',
    type: 'misc',
    rarity: 'uncommon',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 25,
    icon: '🔫',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'rattlesnake_holster',
    name: 'Rattlesnake Holster',
    description: 'A holster made from genuine rattlesnake skin. Intimidating.',
    type: 'armor',
    rarity: 'rare',
    price: 300,
    sellPrice: 150,
    inShop: false,
    levelRequired: 50,
    icon: '🐍',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 25, description: '+25% draw speed' },
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning' }
    ]
  },
  {
    itemId: 'gunfighter_rig',
    name: 'Gunfighter Rig',
    description: 'A complete dual-holster rig for serious gunfighters.',
    type: 'armor',
    rarity: 'rare',
    price: 400,
    sellPrice: 200,
    inShop: false,
    levelRequired: 55,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat' },
      { type: 'special', value: 35, description: '+35% draw speed' }
    ]
  },
  {
    itemId: 'masterwork_holster_set',
    name: 'Masterwork Holster Set',
    description: 'The finest holster set money can buy. Perfect in every way.',
    type: 'armor',
    rarity: 'epic',
    price: 750,
    sellPrice: 375,
    inShop: false,
    levelRequired: 70,
    icon: '🔫',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat' },
      { type: 'special', value: 50, description: '+50% draw speed' }
    ]
  },

  // ========== BOOTS (Level 10-80) ==========
  {
    itemId: 'simple_boots',
    name: 'Simple Leather Boots',
    description: 'Basic leather boots for everyday wear.',
    type: 'armor',
    rarity: 'common',
    price: 45,
    sellPrice: 22,
    inShop: false,
    levelRequired: 10,
    icon: '👢',
    isEquippable: true,
    equipSlot: 'feet',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'riding_boots',
    name: 'Riding Boots',
    description: 'Tall boots designed for horseback riding.',
    type: 'armor',
    rarity: 'uncommon',
    price: 95,
    sellPrice: 47,
    inShop: false,
    levelRequired: 25,
    icon: '👢',
    isEquippable: true,
    equipSlot: 'feet',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 15, description: '+15% riding skill' }
    ]
  },
  {
    itemId: 'snakeskin_boots',
    name: 'Snakeskin Boots',
    description: 'Exotic boots made from genuine snakeskin.',
    type: 'armor',
    rarity: 'rare',
    price: 250,
    sellPrice: 125,
    inShop: false,
    levelRequired: 45,
    icon: '🐍',
    isEquippable: true,
    equipSlot: 'feet',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning' }
    ]
  },
  {
    itemId: 'exotic_boots',
    name: 'Exotic Leather Boots',
    description: 'Boots made from rare exotic leathers.',
    type: 'armor',
    rarity: 'rare',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 55,
    icon: '👢',
    isEquippable: true,
    equipSlot: 'feet',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'cunning', value: 6, description: '+6 Cunning' },
      { type: 'special', value: 10, description: '+10% movement speed' }
    ]
  },
  {
    itemId: 'legendary_boots',
    name: 'Legendary Cowboy Boots',
    description: 'The finest cowboy boots ever crafted. A true masterpiece.',
    type: 'armor',
    rarity: 'legendary',
    price: 1500,
    sellPrice: 750,
    inShop: false,
    levelRequired: 85,
    icon: '👢',
    isEquippable: true,
    equipSlot: 'feet',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat' },
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning' },
      { type: 'special', value: 20, description: '+20% movement speed' }
    ]
  },

  // ========== GLOVES (Level 15-50) ==========
  {
    itemId: 'leather_gloves',
    name: 'Leather Gloves',
    description: 'Basic leather work gloves.',
    type: 'armor',
    rarity: 'common',
    price: 35,
    sellPrice: 17,
    inShop: false,
    levelRequired: 12,
    icon: '🧤',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'craft', value: 2, description: '+2 Craft' }
    ]
  },
  {
    itemId: 'deerskin_gloves',
    name: 'Deerskin Gloves',
    description: 'Soft deerskin gloves for fine work.',
    type: 'armor',
    rarity: 'uncommon',
    price: 75,
    sellPrice: 37,
    inShop: false,
    levelRequired: 28,
    icon: '🧤',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'craft', value: 5, description: '+5 Craft' },
      { type: 'stat', stat: 'cunning', value: 3, description: '+3 Cunning' }
    ]
  },
  {
    itemId: 'wrist_guard',
    name: 'Leather Wrist Guard',
    description: 'Protective leather guards for the wrists.',
    type: 'armor',
    rarity: 'uncommon',
    price: 55,
    sellPrice: 27,
    inShop: false,
    levelRequired: 22,
    icon: '🦾',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat (defense)' }
    ]
  },

  // ========== CHAPS & VESTS (Level 20-60) ==========
  {
    itemId: 'cowboy_chaps',
    name: 'Cowboy Chaps',
    description: 'Protective leather chaps for riding through brush.',
    type: 'armor',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 25,
    icon: '👖',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 20, description: '+20% brush protection' }
    ]
  },
  {
    itemId: 'reinforced_chaps',
    name: 'Reinforced Chaps',
    description: 'Heavy-duty chaps with extra protection.',
    type: 'armor',
    rarity: 'rare',
    price: 250,
    sellPrice: 125,
    inShop: false,
    levelRequired: 45,
    icon: '👖',
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
    itemId: 'leather_vest',
    name: 'Leather Vest',
    description: 'A classic leather vest for any occasion.',
    type: 'armor',
    rarity: 'common',
    price: 65,
    sellPrice: 32,
    inShop: false,
    levelRequired: 18,
    icon: '🦺',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat (defense)' }
    ]
  },
  {
    itemId: 'elk_hide_vest',
    name: 'Elk Hide Vest',
    description: 'A warm vest made from elk hide.',
    type: 'armor',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 32,
    icon: '🦺',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 4, description: '+4 Combat (defense)' },
      { type: 'special', value: 15, description: '+15% cold resistance' }
    ]
  },
  {
    itemId: 'armored_vest',
    name: 'Armored Leather Vest',
    description: 'A leather vest reinforced with metal plates.',
    type: 'armor',
    rarity: 'rare',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 50,
    icon: '🦺',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat (defense)' }
    ]
  },
  {
    itemId: 'reinforced_vest',
    name: 'Reinforced Leather Vest',
    description: 'Extra-thick leather with reinforced stitching.',
    type: 'armor',
    rarity: 'rare',
    price: 280,
    sellPrice: 140,
    inShop: false,
    levelRequired: 45,
    icon: '🦺',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 6, description: '+6 Combat (defense)' }
    ]
  },

  // ========== COATS & DUSTERS (Level 30-85) ==========
  {
    itemId: 'leather_duster',
    name: 'Leather Duster',
    description: 'A long leather coat that protects from dust and weather.',
    type: 'armor',
    rarity: 'uncommon',
    price: 180,
    sellPrice: 90,
    inShop: false,
    levelRequired: 35,
    icon: '🧥',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 4, description: '+4 Combat (defense)' }
    ]
  },
  {
    itemId: 'frontier_jacket',
    name: 'Frontier Jacket',
    description: 'A rugged leather jacket built for the frontier.',
    type: 'armor',
    rarity: 'uncommon',
    price: 200,
    sellPrice: 100,
    inShop: false,
    levelRequired: 38,
    icon: '🧥',
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
    itemId: 'buffalo_hide_duster',
    name: 'Buffalo Hide Duster',
    description: 'A massive duster made from buffalo hide. Incredibly warm.',
    type: 'armor',
    rarity: 'rare',
    price: 400,
    sellPrice: 200,
    inShop: false,
    levelRequired: 50,
    icon: '🧥',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 7, description: '+7 Combat (defense)' },
      { type: 'special', value: 30, description: '+30% cold resistance' }
    ]
  },
  {
    itemId: 'bearskin_coat',
    name: 'Bearskin Coat',
    description: 'A fearsome coat made from grizzly bear hide.',
    type: 'armor',
    rarity: 'rare',
    price: 500,
    sellPrice: 250,
    inShop: false,
    levelRequired: 55,
    icon: '🐻',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat (defense)' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' }
    ]
  },
  {
    itemId: 'wolf_pelt_cloak',
    name: 'Wolf Pelt Cloak',
    description: 'A cloak made from wolf pelts. Strikes fear into enemies.',
    type: 'armor',
    rarity: 'rare',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 48,
    icon: '🐺',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 6, description: '+6 Combat' },
      { type: 'special', value: 15, description: '+15% intimidation' }
    ]
  },
  {
    itemId: 'desperado_duster',
    name: 'Desperado Duster',
    description: 'The iconic duster worn by notorious outlaws.',
    type: 'armor',
    rarity: 'epic',
    price: 800,
    sellPrice: 400,
    inShop: false,
    levelRequired: 70,
    icon: '🧥',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 10, description: '+10 Combat' },
      { type: 'stat', stat: 'cunning', value: 8, description: '+8 Cunning' }
    ]
  },
  {
    itemId: 'mountain_man_armor',
    name: 'Mountain Man Armor',
    description: 'Heavy leather armor worn by frontier trappers.',
    type: 'armor',
    rarity: 'epic',
    price: 900,
    sellPrice: 450,
    inShop: false,
    levelRequired: 75,
    icon: '🏔️',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 12, description: '+12 Combat (defense)' },
      { type: 'special', value: 40, description: '+40% cold resistance' }
    ]
  },
  {
    itemId: 'outlaws_skin',
    name: "The Outlaw's Skin",
    description: 'Legendary leather armor that makes the wearer nearly untouchable.',
    type: 'armor',
    rarity: 'legendary',
    price: 2000,
    sellPrice: 1000,
    inShop: false,
    levelRequired: 90,
    icon: '🎭',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat' },
      { type: 'stat', stat: 'cunning', value: 15, description: '+15 Cunning' },
      { type: 'special', value: 25, description: '+25% evasion' }
    ]
  },
  {
    itemId: 'timeless_duster',
    name: 'Timeless Duster',
    description: 'A duster that exists outside of time. Never ages, never wears.',
    type: 'armor',
    rarity: 'legendary',
    price: 3000,
    sellPrice: 1500,
    inShop: false,
    levelRequired: 95,
    icon: '⏳',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 18, description: '+18 Combat' },
      { type: 'stat', stat: 'spirit', value: 12, description: '+12 Spirit' }
    ]
  },

  // ========== SADDLES & HORSE GEAR (Level 20-90) ==========
  {
    itemId: 'saddle_blanket',
    name: 'Saddle Blanket',
    description: 'A padded blanket to go under the saddle.',
    type: 'misc',
    rarity: 'common',
    price: 35,
    sellPrice: 17,
    inShop: false,
    levelRequired: 15,
    icon: '🧣',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: []
  },
  {
    itemId: 'trail_saddle',
    name: 'Trail Saddle',
    description: 'A comfortable saddle for long trail rides.',
    type: 'misc',
    rarity: 'uncommon',
    price: 250,
    sellPrice: 125,
    inShop: false,
    levelRequired: 30,
    icon: '🐴',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 20, description: '+20% horse stamina' }
    ]
  },
  {
    itemId: 'war_saddle',
    name: 'War Saddle',
    description: 'A heavy saddle designed for cavalry combat.',
    type: 'misc',
    rarity: 'rare',
    price: 500,
    sellPrice: 250,
    inShop: false,
    levelRequired: 50,
    icon: '🐴',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat while mounted' },
      { type: 'special', value: 30, description: '+30% horse stamina' }
    ]
  },
  {
    itemId: 'legendary_saddle',
    name: 'Legendary Saddle',
    description: 'The finest saddle ever crafted. Works of art.',
    type: 'misc',
    rarity: 'legendary',
    price: 2500,
    sellPrice: 1250,
    inShop: false,
    levelRequired: 85,
    icon: '🐴',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 10, description: '+10 Combat while mounted' },
      { type: 'special', value: 50, description: '+50% horse stamina' }
    ]
  },
  {
    itemId: 'phoenix_saddle',
    name: 'Phoenix Saddle',
    description: 'A saddle that glows with inner fire. The horse never tires.',
    type: 'misc',
    rarity: 'legendary',
    price: 3500,
    sellPrice: 1750,
    inShop: false,
    levelRequired: 92,
    icon: '🔥',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 100, description: 'Horse never tires' }
    ]
  },
  {
    itemId: 'thunderbird_saddle',
    name: 'Thunderbird Saddle',
    description: 'A saddle blessed by the spirit of the thunderbird.',
    type: 'misc',
    rarity: 'legendary',
    price: 4000,
    sellPrice: 2000,
    inShop: false,
    levelRequired: 95,
    icon: '⚡',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 50, description: '+50% horse speed' },
      { type: 'special', value: 100, description: 'Horse never tires' }
    ]
  },
  {
    itemId: 'saddlebags',
    name: 'Saddlebags',
    description: 'Leather bags that attach to your saddle.',
    type: 'misc',
    rarity: 'uncommon',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 25,
    icon: '🎒',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 20, description: '+20 inventory slots' }
    ]
  },
  {
    itemId: 'pommel_bag',
    name: 'Pommel Bag',
    description: 'A small bag that attaches to the saddle pommel.',
    type: 'misc',
    rarity: 'common',
    price: 45,
    sellPrice: 22,
    inShop: false,
    levelRequired: 18,
    icon: '👝',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 10, description: '+10 inventory slots' }
    ]
  },

  // ========== PACKS & SATCHELS (Level 15-55) ==========
  {
    itemId: 'scout_satchel',
    name: 'Scout Satchel',
    description: 'A lightweight satchel for scouts and travelers.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 95,
    sellPrice: 47,
    inShop: false,
    levelRequired: 25,
    icon: '🎒',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 15, description: '+15 inventory slots' }
    ]
  },
  {
    itemId: 'traveling_pack',
    name: 'Traveling Pack',
    description: 'A sturdy pack for long journeys.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 30,
    icon: '🎒',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 25, description: '+25 inventory slots' }
    ]
  },
  {
    itemId: 'outrider_gear',
    name: 'Outrider Gear Set',
    description: 'Complete gear set for frontier outriders.',
    type: 'armor',
    rarity: 'epic',
    price: 1200,
    sellPrice: 600,
    inShop: false,
    levelRequired: 75,
    icon: '🤠',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 10, description: '+10 Combat' },
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning' },
      { type: 'special', value: 30, description: '+30% riding speed' }
    ]
  },

  // ========== WHIPS (Level 25-50) ==========
  {
    itemId: 'bullwhip',
    name: 'Bullwhip',
    description: 'A long leather whip for cattle driving and self-defense.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 30,
    icon: '🪢',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat' },
      { type: 'special', value: 20, description: '+20% cattle handling' }
    ]
  },

  // ========== SUPERNATURAL LEATHER (Level 70-100) ==========
  {
    itemId: 'shadow_armor',
    name: 'Shadow Leather Armor',
    description: 'Armor made from shadow-touched leather. Nearly invisible at night.',
    type: 'armor',
    rarity: 'epic',
    price: 1500,
    sellPrice: 750,
    inShop: false,
    levelRequired: 75,
    icon: '🌑',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 10, description: '+10 Combat' },
      { type: 'stat', stat: 'cunning', value: 15, description: '+15 Cunning' },
      { type: 'special', value: 50, description: '+50% stealth at night' }
    ]
  },
  {
    itemId: 'spirit_touched_armor',
    name: 'Spirit-Touched Armor',
    description: 'Leather blessed by spirits. Protects against supernatural harm.',
    type: 'armor',
    rarity: 'epic',
    price: 1800,
    sellPrice: 900,
    inShop: false,
    levelRequired: 80,
    icon: '👻',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 12, description: '+12 Combat (defense)' },
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit' }
    ]
  },
  {
    itemId: 'wendigo_hide_cloak',
    name: 'Wendigo Hide Cloak',
    description: 'A cloak made from wendigo hide. Radiates hunger and cold.',
    type: 'armor',
    rarity: 'legendary',
    price: 2500,
    sellPrice: 1250,
    inShop: false,
    levelRequired: 90,
    icon: '❄️',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 18, description: '+18 Combat' },
      { type: 'special', value: 100, description: 'Immune to cold' }
    ]
  },
  {
    itemId: 'skinwalker_garb',
    name: 'Skinwalker Garb',
    description: 'Armor that allows the wearer to shift forms. Deeply cursed.',
    type: 'armor',
    rarity: 'legendary',
    price: 4000,
    sellPrice: 2000,
    inShop: false,
    levelRequired: 95,
    icon: '🐺',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 20, description: '+20 Combat' },
      { type: 'stat', stat: 'cunning', value: 15, description: '+15 Cunning' },
      { type: 'special', value: 1, description: 'Can transform into animals' }
    ]
  }
];
