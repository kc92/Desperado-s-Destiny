/**
 * Tailoring Crafted Items Database
 * Phase 7.2 Crafting Expansion - Recipe outputs for Tailoring profession
 * Includes: clothing, hats, bags, costumes, supernatural garments
 */

import { IItem } from '../../../models/Item.model';

export const tailoringCrafted: Partial<IItem>[] = [
  // ========== BASIC CLOTHING (Level 1-25) ==========
  {
    itemId: 'simple_shirt',
    name: 'Simple Cotton Shirt',
    description: 'A basic cotton work shirt. Comfortable and practical.',
    type: 'armor',
    rarity: 'common',
    price: 20,
    sellPrice: 10,
    inShop: false,
    levelRequired: 1,
    icon: '👕',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'cotton_undershirt',
    name: 'Cotton Undershirt',
    description: 'A lightweight undershirt for layering.',
    type: 'armor',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
    inShop: false,
    levelRequired: 3,
    icon: '👕',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'linen_work_shirt',
    name: 'Linen Work Shirt',
    description: 'A breathable linen shirt for hard work.',
    type: 'armor',
    rarity: 'common',
    price: 30,
    sellPrice: 15,
    inShop: false,
    levelRequired: 8,
    icon: '👕',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'craft', value: 2, description: '+2 Craft' }
    ]
  },
  {
    itemId: 'work_pants',
    name: 'Work Pants',
    description: 'Durable canvas work pants.',
    type: 'armor',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: false,
    levelRequired: 5,
    icon: '👖',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'riding_pants',
    name: 'Riding Pants',
    description: 'Sturdy pants designed for horseback riding.',
    type: 'armor',
    rarity: 'uncommon',
    price: 55,
    sellPrice: 27,
    inShop: false,
    levelRequired: 20,
    icon: '👖',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 10, description: '+10% riding comfort' }
    ]
  },
  {
    itemId: 'work_clothes',
    name: 'Work Clothes Set',
    description: 'A complete set of practical work clothes.',
    type: 'armor',
    rarity: 'common',
    price: 65,
    sellPrice: 32,
    inShop: false,
    levelRequired: 12,
    icon: '👔',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'craft', value: 3, description: '+3 Craft' }
    ]
  },
  {
    itemId: 'simple_apron',
    name: 'Simple Apron',
    description: 'A canvas apron for craftsmen and cooks.',
    type: 'armor',
    rarity: 'common',
    price: 18,
    sellPrice: 9,
    inShop: false,
    levelRequired: 5,
    icon: '🦺',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'craft', value: 2, description: '+2 Craft' }
    ]
  },
  {
    itemId: 'wool_socks',
    name: 'Wool Socks',
    description: 'Warm wool socks for cold frontier nights.',
    type: 'armor',
    rarity: 'common',
    price: 12,
    sellPrice: 6,
    inShop: false,
    levelRequired: 5,
    icon: '🧦',
    isEquippable: true,
    equipSlot: 'feet',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 10, description: '+10% cold resistance' }
    ]
  },
  {
    itemId: 'suspenders',
    name: 'Suspenders',
    description: 'Sturdy suspenders to keep your pants up.',
    type: 'accessory',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
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

  // ========== HEADWEAR (Level 10-50) ==========
  {
    itemId: 'bandana',
    name: 'Bandana',
    description: 'A versatile cloth bandana. Dust protection and style.',
    type: 'armor',
    rarity: 'common',
    price: 12,
    sellPrice: 6,
    inShop: false,
    levelRequired: 5,
    icon: '🎭',
    isEquippable: true,
    equipSlot: 'head',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'red_bandana',
    name: 'Red Outlaw Bandana',
    description: 'The iconic red bandana worn by outlaws.',
    type: 'armor',
    rarity: 'uncommon',
    price: 45,
    sellPrice: 22,
    inShop: false,
    levelRequired: 25,
    icon: '🎭',
    isEquippable: true,
    equipSlot: 'head',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'cunning', value: 3, description: '+3 Cunning' }
    ]
  },
  {
    itemId: 'deadeye_bandana',
    name: 'Deadeye Bandana',
    description: 'A bandana worn by legendary sharpshooters.',
    type: 'armor',
    rarity: 'rare',
    price: 200,
    sellPrice: 100,
    inShop: false,
    levelRequired: 50,
    icon: '🎯',
    isEquippable: true,
    equipSlot: 'head',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat' },
      { type: 'special', value: 15, description: '+15% accuracy' }
    ]
  },
  {
    itemId: 'neckerchief',
    name: 'Neckerchief',
    description: 'A small cloth worn around the neck.',
    type: 'accessory',
    rarity: 'common',
    price: 10,
    sellPrice: 5,
    inShop: false,
    levelRequired: 5,
    icon: '🧣',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'cotton_bonnet',
    name: 'Cotton Bonnet',
    description: 'A simple bonnet for sun protection.',
    type: 'armor',
    rarity: 'common',
    price: 18,
    sellPrice: 9,
    inShop: false,
    levelRequired: 8,
    icon: '👒',
    isEquippable: true,
    equipSlot: 'head',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'flat_cap',
    name: 'Flat Cap',
    description: 'A simple flat cap worn by working men.',
    type: 'armor',
    rarity: 'common',
    price: 22,
    sellPrice: 11,
    inShop: false,
    levelRequired: 10,
    icon: '🧢',
    isEquippable: true,
    equipSlot: 'head',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'cowboy_hat',
    name: 'Cowboy Hat',
    description: 'The iconic wide-brimmed hat of the frontier.',
    type: 'armor',
    rarity: 'uncommon',
    price: 75,
    sellPrice: 37,
    inShop: false,
    levelRequired: 25,
    icon: '🤠',
    isEquippable: true,
    equipSlot: 'head',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' }
    ]
  },

  // ========== VESTS & JACKETS (Level 15-60) ==========
  {
    itemId: 'cotton_vest',
    name: 'Cotton Vest',
    description: 'A simple cotton vest for layering.',
    type: 'armor',
    rarity: 'common',
    price: 35,
    sellPrice: 17,
    inShop: false,
    levelRequired: 12,
    icon: '🦺',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'ranch_vest',
    name: 'Ranch Hand Vest',
    description: 'A practical vest worn by ranch workers.',
    type: 'armor',
    rarity: 'uncommon',
    price: 65,
    sellPrice: 32,
    inShop: false,
    levelRequired: 22,
    icon: '🦺',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'craft', value: 3, description: '+3 Craft' }
    ]
  },
  {
    itemId: 'fancy_vest',
    name: 'Fancy Vest',
    description: 'An elegant vest for formal occasions.',
    type: 'armor',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 35,
    icon: '🦺',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 4, description: '+4 Spirit' }
    ]
  },
  {
    itemId: 'sheriff_vest',
    name: 'Sheriff Vest',
    description: 'The official vest of frontier lawmen.',
    type: 'armor',
    rarity: 'rare',
    price: 200,
    sellPrice: 100,
    inShop: false,
    levelRequired: 45,
    icon: '⭐',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 6, description: '+6 Spirit' },
      { type: 'special', value: 15, description: '+15% intimidation' }
    ]
  },
  {
    itemId: 'outlaw_legend_vest',
    name: 'Outlaw Legend Vest',
    description: 'A vest worn by legendary outlaws.',
    type: 'armor',
    rarity: 'epic',
    price: 600,
    sellPrice: 300,
    inShop: false,
    levelRequired: 70,
    icon: '🎭',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat' },
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning' }
    ]
  },
  {
    itemId: 'bulletproof_vest',
    name: 'Bulletproof Vest',
    description: 'A vest reinforced with steel plates. Stops bullets.',
    type: 'armor',
    rarity: 'rare',
    price: 500,
    sellPrice: 250,
    inShop: false,
    levelRequired: 55,
    icon: '🛡️',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 10, description: '+10 Combat (defense)' }
    ]
  },

  // ========== COATS & DUSTERS (Level 25-75) ==========
  {
    itemId: 'duster_coat',
    name: 'Duster Coat',
    description: 'A long cloth coat for trail riding.',
    type: 'armor',
    rarity: 'uncommon',
    price: 95,
    sellPrice: 47,
    inShop: false,
    levelRequired: 28,
    icon: '🧥',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 3, description: '+3 Combat (defense)' }
    ]
  },
  {
    itemId: 'riding_cloak',
    name: 'Riding Cloak',
    description: 'A hooded cloak for riding in bad weather.',
    type: 'armor',
    rarity: 'uncommon',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 25,
    icon: '🧥',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 20, description: '+20% weather protection' }
    ]
  },
  {
    itemId: 'preacher_coat',
    name: 'Preacher Coat',
    description: 'A somber black coat worn by frontier preachers.',
    type: 'armor',
    rarity: 'uncommon',
    price: 110,
    sellPrice: 55,
    inShop: false,
    levelRequired: 32,
    icon: '🧥',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 6, description: '+6 Spirit' }
    ]
  },
  {
    itemId: 'gunslinger_duster',
    name: 'Gunslinger Duster',
    description: 'A dramatic duster favored by gunslingers.',
    type: 'armor',
    rarity: 'rare',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 50,
    icon: '🧥',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 6, description: '+6 Combat' },
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning' }
    ]
  },
  {
    itemId: 'armored_duster',
    name: 'Armored Duster',
    description: 'A duster with hidden armor plating.',
    type: 'armor',
    rarity: 'rare',
    price: 450,
    sellPrice: 225,
    inShop: false,
    levelRequired: 55,
    icon: '🧥',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 10, description: '+10 Combat (defense)' }
    ]
  },
  {
    itemId: 'desperado_coat',
    name: 'The Desperado',
    description: 'A legendary coat worn by the most feared outlaws.',
    type: 'armor',
    rarity: 'legendary',
    price: 2000,
    sellPrice: 1000,
    inShop: false,
    levelRequired: 85,
    icon: '🧥',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat' },
      { type: 'stat', stat: 'cunning', value: 12, description: '+12 Cunning' }
    ]
  },

  // ========== FORMAL & FANCY CLOTHES (Level 30-70) ==========
  {
    itemId: 'dress_shirt',
    name: 'Dress Shirt',
    description: 'A crisp white dress shirt for formal occasions.',
    type: 'armor',
    rarity: 'uncommon',
    price: 75,
    sellPrice: 37,
    inShop: false,
    levelRequired: 28,
    icon: '👔',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' }
    ]
  },
  {
    itemId: 'cavalry_shirt',
    name: 'Cavalry Shirt',
    description: 'The official shirt of US Cavalry soldiers.',
    type: 'armor',
    rarity: 'uncommon',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 30,
    icon: '👔',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 4, description: '+4 Combat' }
    ]
  },
  {
    itemId: 'gambler_suit',
    name: "Gambler's Suit",
    description: 'A slick suit favored by riverboat gamblers.',
    type: 'armor',
    rarity: 'rare',
    price: 400,
    sellPrice: 200,
    inShop: false,
    levelRequired: 50,
    icon: '🎰',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning' },
      { type: 'special', value: 20, description: '+20% gambling luck' }
    ]
  },
  {
    itemId: 'showman_jacket',
    name: 'Showman Jacket',
    description: 'A flashy jacket for performers and entertainers.',
    type: 'armor',
    rarity: 'rare',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 48,
    icon: '🎪',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 8, description: '+8 Spirit' }
    ]
  },
  {
    itemId: 'marshal_uniform',
    name: 'US Marshal Uniform',
    description: 'The official uniform of a United States Marshal.',
    type: 'armor',
    rarity: 'epic',
    price: 800,
    sellPrice: 400,
    inShop: false,
    levelRequired: 65,
    icon: '⭐',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat' },
      { type: 'stat', stat: 'spirit', value: 10, description: '+10 Spirit' }
    ]
  },
  {
    itemId: 'governor_attire',
    name: "Governor's Attire",
    description: 'The finest clothing befitting a territorial governor.',
    type: 'armor',
    rarity: 'epic',
    price: 1200,
    sellPrice: 600,
    inShop: false,
    levelRequired: 75,
    icon: '👔',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit' }
    ]
  },

  // ========== DRESSES & FORMAL WOMEN'S WEAR (Level 20-90) ==========
  {
    itemId: 'saloon_dress',
    name: 'Saloon Girl Dress',
    description: 'A colorful dress worn by saloon entertainers.',
    type: 'armor',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 28,
    icon: '👗',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' }
    ]
  },
  {
    itemId: 'dance_hall_skirt',
    name: 'Dance Hall Skirt',
    description: 'A flowing skirt for dancing the night away.',
    type: 'armor',
    rarity: 'uncommon',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 25,
    icon: '👗',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 4, description: '+4 Spirit' }
    ]
  },
  {
    itemId: 'fancy_corset',
    name: 'Fancy Corset',
    description: 'An elegant corset for formal occasions.',
    type: 'armor',
    rarity: 'uncommon',
    price: 95,
    sellPrice: 47,
    inShop: false,
    levelRequired: 30,
    icon: '👗',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' }
    ]
  },
  {
    itemId: 'ball_gown',
    name: 'Ball Gown',
    description: 'An exquisite gown for high society events.',
    type: 'armor',
    rarity: 'rare',
    price: 500,
    sellPrice: 250,
    inShop: false,
    levelRequired: 55,
    icon: '👗',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 10, description: '+10 Spirit' }
    ]
  },
  {
    itemId: 'mourning_dress',
    name: 'Mourning Dress',
    description: 'A somber black dress for funerals and mourning.',
    type: 'armor',
    rarity: 'uncommon',
    price: 100,
    sellPrice: 50,
    inShop: false,
    levelRequired: 32,
    icon: '👗',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' }
    ]
  },
  {
    itemId: 'wedding_dress',
    name: 'Frontier Wedding Dress',
    description: 'A beautiful white dress for the special day.',
    type: 'armor',
    rarity: 'rare',
    price: 600,
    sellPrice: 300,
    inShop: false,
    levelRequired: 50,
    icon: '👰',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 12, description: '+12 Spirit' }
    ]
  },

  // ========== CULTURAL CLOTHING (Level 20-50) ==========
  {
    itemId: 'poncho',
    name: 'Poncho',
    description: 'A traditional Mexican blanket poncho.',
    type: 'armor',
    rarity: 'uncommon',
    price: 65,
    sellPrice: 32,
    inShop: false,
    levelRequired: 20,
    icon: '🧥',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 15, description: '+15% weather protection' }
    ]
  },
  {
    itemId: 'serape',
    name: 'Traditional Serape',
    description: 'A colorful Mexican serape blanket worn as a garment.',
    type: 'armor',
    rarity: 'uncommon',
    price: 75,
    sellPrice: 37,
    inShop: false,
    levelRequired: 25,
    icon: '🧥',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 4, description: '+4 Spirit' }
    ]
  },

  // ========== PROFESSIONAL OUTFITS (Level 25-55) ==========
  {
    itemId: 'bartender_outfit',
    name: 'Bartender Outfit',
    description: 'The professional attire of a saloon bartender.',
    type: 'armor',
    rarity: 'uncommon',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 25,
    icon: '🍺',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' },
      { type: 'special', value: 15, description: '+15% drink mixing' }
    ]
  },
  {
    itemId: 'theater_costume',
    name: 'Theater Costume',
    description: 'An elaborate costume for theatrical performances.',
    type: 'armor',
    rarity: 'rare',
    price: 250,
    sellPrice: 125,
    inShop: false,
    levelRequired: 45,
    icon: '🎭',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 8, description: '+8 Spirit' },
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning' }
    ]
  },
  {
    itemId: 'disguise_kit',
    name: 'Disguise Kit',
    description: 'A complete kit for assuming different identities.',
    type: 'tool',
    rarity: 'rare',
    price: 300,
    sellPrice: 150,
    inShop: false,
    levelRequired: 50,
    icon: '🎭',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning' }
    ]
  },

  // ========== BAGS & ACCESSORIES (Level 10-50) ==========
  {
    itemId: 'cloth_bag',
    name: 'Cloth Bag',
    description: 'A simple cloth bag for carrying goods.',
    type: 'accessory',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
    inShop: false,
    levelRequired: 5,
    icon: '👜',
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
    itemId: 'large_satchel',
    name: 'Large Satchel',
    description: 'A large cloth satchel for carrying lots of items.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 28,
    icon: '👜',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 20, description: '+20 inventory slots' }
    ]
  },
  {
    itemId: 'travel_pack',
    name: 'Travel Pack',
    description: 'A sturdy pack for long journeys.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 100,
    sellPrice: 50,
    inShop: false,
    levelRequired: 32,
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
    itemId: 'bandolier',
    name: 'Bandolier',
    description: 'A cloth bandolier for carrying ammunition.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 75,
    sellPrice: 37,
    inShop: false,
    levelRequired: 25,
    icon: '🎖️',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 30, description: '+30 ammo capacity' }
    ]
  },
  {
    itemId: 'bottomless_bag',
    name: 'Bottomless Bag',
    description: 'A magical bag that holds far more than it should.',
    type: 'accessory',
    rarity: 'legendary',
    price: 2500,
    sellPrice: 1250,
    inShop: false,
    levelRequired: 85,
    icon: '✨',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 100, description: '+100 inventory slots' }
    ]
  },

  // ========== SUPERNATURAL & LEGENDARY (Level 70-100) ==========
  {
    itemId: 'shadow_cloak',
    name: 'Shadow Cloak',
    description: 'A cloak woven from shadows. Nearly invisible at night.',
    type: 'armor',
    rarity: 'epic',
    price: 1200,
    sellPrice: 600,
    inShop: false,
    levelRequired: 75,
    icon: '🌑',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'cunning', value: 15, description: '+15 Cunning' },
      { type: 'special', value: 50, description: '+50% stealth at night' }
    ]
  },
  {
    itemId: 'ghost_touched_cloak',
    name: 'Ghost-Touched Cloak',
    description: 'A cloak that exists partially in the spirit realm.',
    type: 'armor',
    rarity: 'epic',
    price: 1500,
    sellPrice: 750,
    inShop: false,
    levelRequired: 80,
    icon: '👻',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit' },
      { type: 'special', value: 25, description: '+25% ghost resistance' }
    ]
  },
  {
    itemId: 'spirit_woven_serape',
    name: 'Spirit-Woven Serape',
    description: 'A serape woven by spirits. Glows with ethereal light.',
    type: 'armor',
    rarity: 'epic',
    price: 1800,
    sellPrice: 900,
    inShop: false,
    levelRequired: 82,
    icon: '✨',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 18, description: '+18 Spirit' }
    ]
  },
  {
    itemId: 'blessed_vestments',
    name: 'Blessed Vestments',
    description: 'Holy robes blessed by the church. Protects against evil.',
    type: 'armor',
    rarity: 'epic',
    price: 2000,
    sellPrice: 1000,
    inShop: false,
    levelRequired: 85,
    icon: '✝️',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 20, description: '+20 Spirit' },
      { type: 'special', value: 50, description: '+50% evil resistance' }
    ]
  },
  {
    itemId: 'death_shroud',
    name: 'Death Shroud',
    description: 'A shroud worn by the Grim Reaper himself. Terrifying.',
    type: 'armor',
    rarity: 'legendary',
    price: 3500,
    sellPrice: 1750,
    inShop: false,
    levelRequired: 92,
    icon: '💀',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 20, description: '+20 Combat' },
      { type: 'special', value: 30, description: '+30% fear aura' }
    ]
  },
  {
    itemId: 'angel_dress',
    name: 'Dress of the Angel',
    description: 'A dress of pure white light. Radiates divine protection.',
    type: 'armor',
    rarity: 'legendary',
    price: 4000,
    sellPrice: 2000,
    inShop: false,
    levelRequired: 95,
    icon: '👼',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 25, description: '+25 Spirit' },
      { type: 'special', value: 50, description: '+50% holy damage' }
    ]
  },
  {
    itemId: 'infinity_cloak',
    name: 'Cloak of Infinity',
    description: 'A cloak that exists across all timelines. Ultimate power.',
    type: 'armor',
    rarity: 'legendary',
    price: 7500,
    sellPrice: 3750,
    inShop: false,
    levelRequired: 100,
    icon: '♾️',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 25, description: '+25 Combat' },
      { type: 'stat', stat: 'cunning', value: 25, description: '+25 Cunning' },
      { type: 'stat', stat: 'spirit', value: 25, description: '+25 Spirit' }
    ]
  },
  {
    itemId: 'frontier_legend_outfit',
    name: 'Frontier Legend Outfit',
    description: 'The complete outfit of a true frontier legend.',
    type: 'armor',
    rarity: 'legendary',
    price: 5000,
    sellPrice: 2500,
    inShop: false,
    levelRequired: 95,
    icon: '🤠',
    isEquippable: true,
    equipSlot: 'body',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 20, description: '+20 Combat' },
      { type: 'stat', stat: 'cunning', value: 15, description: '+15 Cunning' },
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit' }
    ]
  }
];
