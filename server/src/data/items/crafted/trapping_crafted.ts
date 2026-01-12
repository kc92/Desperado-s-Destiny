/**
 * Trapping Crafted Items
 * Phase 7.2 Crafting Expansion - Crafted outputs from Trapping recipes
 * Includes: traps, baits, lures, fur garments, and taxidermy mounts
 */

import { IItem } from '../../../models/Item.model';

export const trappingCrafted: Partial<IItem>[] = [
  // ========================================
  // TRAPS (Level 5-80)
  // ========================================
  {
    itemId: 'simple-snare',
    name: 'Simple Snare',
    description: 'A basic wire loop trap designed to catch small game like rabbits and squirrels. Easy to set but requires proper placement.',
    type: 'tool',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: false,
    levelRequired: 5,
    icon: '🪤',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 10, description: '+10% small game catch rate when trapping' }
    ]
  },
  {
    itemId: 'leghold-trap',
    name: 'Leghold Trap',
    description: 'A spring-loaded foot trap with padded jaws. Effective for medium-sized animals like foxes and coyotes.',
    type: 'tool',
    rarity: 'common',
    price: 75,
    sellPrice: 37,
    inShop: false,
    levelRequired: 15,
    icon: '🪤',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 15,
    effects: [
      { type: 'special', value: 15, description: '+15% medium game catch rate when trapping' }
    ]
  },
  {
    itemId: 'box-trap',
    name: 'Box Trap',
    description: 'A wooden cage trap with a trigger mechanism. Captures animals alive for relocation or study.',
    type: 'tool',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 20,
    icon: '📦',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 20, description: '+20% live capture success rate' },
      { type: 'special', value: 10, description: '+10% chance to capture rare specimens' }
    ]
  },
  {
    itemId: 'bear-snare',
    name: 'Bear Snare',
    description: 'A heavy-duty cable snare reinforced with steel. Designed to restrain large predators like bears and mountain lions.',
    type: 'tool',
    rarity: 'uncommon',
    price: 200,
    sellPrice: 100,
    inShop: false,
    levelRequired: 35,
    icon: '🪤',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 25, description: '+25% large predator catch rate' }
    ]
  },
  {
    itemId: 'conibear-trap',
    name: 'Conibear Trap',
    description: 'A powerful body-gripping trap that delivers a quick, humane kill. Preferred by professional trappers for its efficiency.',
    type: 'tool',
    rarity: 'rare',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 45,
    icon: '🪤',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 30, description: '+30% trap efficiency' },
      { type: 'special', value: 15, description: '+15% pelt quality preservation' }
    ]
  },
  {
    itemId: 'net-trap',
    name: 'Net Trap',
    description: 'A weighted net triggered by a trip wire. Excellent for capturing birds and small mammals without harm.',
    type: 'tool',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 25,
    icon: '🕸️',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 25, description: '+25% bird capture rate' },
      { type: 'special', value: 20, description: '+20% live capture success rate' }
    ]
  },
  {
    itemId: 'pit-trap-kit',
    name: 'Pit Trap Kit',
    description: 'A complete kit for constructing concealed pit traps. Includes sharpened stakes, camouflage materials, and trigger mechanisms.',
    type: 'tool',
    rarity: 'rare',
    price: 400,
    sellPrice: 200,
    inShop: false,
    levelRequired: 50,
    icon: '🕳️',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 35, description: '+35% large game catch rate' },
      { type: 'special', value: 20, description: '+20% chance to capture legendary beasts' }
    ]
  },
  {
    itemId: 'explosive-trap',
    name: 'Explosive Trap',
    description: 'A dangerous trap rigged with black powder charges. Effective but destroys pelts. Use only for the most dangerous game.',
    type: 'tool',
    rarity: 'rare',
    price: 500,
    sellPrice: 250,
    inShop: false,
    levelRequired: 60,
    icon: '💥',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 50, description: '+50% catch rate for dangerous predators' },
      { type: 'special', value: -50, description: '-50% pelt preservation (destroyed by explosion)' }
    ]
  },
  {
    itemId: 'godtrap',
    name: 'Godtrap',
    description: 'A legendary trap forged from silver and blessed by shamans. The only trap capable of binding divine beasts and supernatural creatures.',
    type: 'tool',
    rarity: 'legendary',
    price: 2500,
    sellPrice: 1250,
    inShop: false,
    levelRequired: 80,
    icon: '✨',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 3,
    effects: [
      { type: 'special', value: 50, description: 'Can capture legendary and supernatural creatures' },
      { type: 'special', value: 25, description: '+25% legendary beast catch rate' },
      { type: 'special', value: 100, description: '100% pelt quality preservation' }
    ]
  },

  // ========================================
  // BAITS & LURES (Level 5-75)
  // ========================================
  {
    itemId: 'basic-bait',
    name: 'Basic Bait',
    description: 'Simple bait mixture made from meat scraps and grain. Attracts small game to your trap locations.',
    type: 'consumable',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
    inShop: false,
    levelRequired: 5,
    icon: '🥩',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 15, description: '+15% small game attraction for 30 minutes' }
    ]
  },
  {
    itemId: 'fish-lure',
    name: 'Fish Lure',
    description: 'A handcrafted lure made from feathers and shiny metal. Irresistible to fish and useful for aquatic trapping.',
    type: 'consumable',
    rarity: 'common',
    price: 20,
    sellPrice: 10,
    inShop: false,
    levelRequired: 10,
    icon: '🎣',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 20, description: '+20% fishing success rate' },
      { type: 'special', value: 10, description: '+10% chance to catch rare fish' }
    ]
  },
  {
    itemId: 'deer-call',
    name: 'Deer Call',
    description: 'A wooden caller that mimics the sounds of a doe. Draws curious bucks into the open.',
    type: 'tool',
    rarity: 'uncommon',
    price: 80,
    sellPrice: 40,
    inShop: false,
    levelRequired: 20,
    icon: '🦌',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 25, description: '+25% deer encounter rate when hunting' },
      { type: 'special', value: 15, description: '+15% chance to attract trophy bucks' }
    ]
  },
  {
    itemId: 'elk-bugle',
    name: 'Elk Bugle',
    description: 'A horn-shaped caller that produces the distinctive bugle of a bull elk. Triggers territorial responses from other bulls.',
    type: 'tool',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 30,
    icon: '📯',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 30, description: '+30% elk encounter rate when hunting' },
      { type: 'special', value: 20, description: '+20% chance to attract trophy elk' }
    ]
  },
  {
    itemId: 'scent-blocker',
    name: 'Scent Blocker',
    description: 'A specially prepared mixture of herbs and animal scents that masks human odor. Essential for stalking wary game.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 50,
    sellPrice: 25,
    inShop: false,
    levelRequired: 25,
    icon: '🌿',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    effects: [
      { type: 'special', value: 30, description: 'Eliminates human scent for 1 hour' },
      { type: 'special', value: 20, description: '+20% stealth bonus when hunting' }
    ]
  },
  {
    itemId: 'skinwalker-lure',
    name: 'Skinwalker Lure',
    description: 'A disturbing mixture of sacred herbs, blood, and whispered curses. Only the bravest trappers dare use it to draw out supernatural beings.',
    type: 'consumable',
    rarity: 'rare',
    price: 400,
    sellPrice: 200,
    inShop: false,
    levelRequired: 60,
    icon: '🌑',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 40, description: '+40% supernatural creature encounter rate' },
      { type: 'special', value: 25, description: '+25% chance to attract skinwalkers' }
    ]
  },
  {
    itemId: 'thunderbird-lure',
    name: 'Thunderbird Lure',
    description: 'A sacred offering of turquoise, lightning-struck wood, and storm water. Said to call down the legendary thunderbirds from the clouds.',
    type: 'consumable',
    rarity: 'legendary',
    price: 800,
    sellPrice: 400,
    inShop: false,
    levelRequired: 75,
    icon: '⚡',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 50, description: '+50% legendary bird encounter rate' },
      { type: 'special', value: 30, description: '+30% chance to attract thunderbirds' }
    ]
  },

  // ========================================
  // FUR GARMENTS (Level 15-90)
  // ========================================
  {
    itemId: 'fur-coat',
    name: 'Fur Coat',
    description: 'A practical coat stitched from rabbit and fox pelts. Provides warmth without sacrificing mobility.',
    type: 'armor',
    rarity: 'common',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 15,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 10, description: '+10 HP' },
      { type: 'special', value: 15, description: '+15% cold weather resistance' }
    ]
  },
  {
    itemId: 'luxury-fur-cloak',
    name: 'Luxury Fur Cloak',
    description: 'An elegant cloak crafted from premium wolf and beaver pelts. Favored by wealthy frontiersmen and successful trappers.',
    type: 'armor',
    rarity: 'uncommon',
    price: 400,
    sellPrice: 200,
    inShop: false,
    levelRequired: 35,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 20, description: '+20 HP' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' },
      { type: 'special', value: 25, description: '+25% cold weather resistance' }
    ]
  },
  {
    itemId: 'royal-fur-mantle',
    name: 'Royal Fur Mantle',
    description: 'A magnificent mantle crafted from the finest bear and cougar pelts, trimmed with ermine. Fit for frontier royalty.',
    type: 'armor',
    rarity: 'rare',
    price: 900,
    sellPrice: 450,
    inShop: false,
    levelRequired: 55,
    icon: '👑',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 35, description: '+35 HP' },
      { type: 'stat', stat: 'spirit', value: 10, description: '+10 Spirit' },
      { type: 'special', value: 40, description: '+40% cold weather resistance' },
      { type: 'special', value: 10, description: '+10% social influence' }
    ]
  },
  {
    itemId: 'cosmic-fur-mantle',
    name: 'Cosmic Fur Mantle',
    description: 'A legendary mantle woven from the pelts of creatures that walked between worlds. The fur shimmers with starlight.',
    type: 'armor',
    rarity: 'legendary',
    price: 2000,
    sellPrice: 1000,
    inShop: false,
    levelRequired: 75,
    icon: '🌌',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 50, description: '+50 HP' },
      { type: 'stat', stat: 'spirit', value: 20, description: '+20 Spirit' },
      { type: 'special', value: 60, description: '+60% cold weather resistance' },
      { type: 'special', value: 15, description: '+15% supernatural damage resistance' }
    ]
  },
  {
    itemId: 'emperors-fur-cloak',
    name: 'Emperor\'s Fur Cloak',
    description: 'The ultimate expression of the trapper\'s art. Crafted from divine beast pelts and blessed by the spirits, this cloak grants its wearer legendary status.',
    type: 'armor',
    rarity: 'legendary',
    price: 5000,
    sellPrice: 2500,
    inShop: false,
    levelRequired: 90,
    icon: '👑',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 75, description: '+75 HP' },
      { type: 'stat', stat: 'spirit', value: 30, description: '+30 Spirit' },
      { type: 'stat', stat: 'cunning', value: 15, description: '+15 Cunning' },
      { type: 'special', value: 100, description: 'Complete cold weather immunity' },
      { type: 'special', value: 25, description: '+25% supernatural damage resistance' },
      { type: 'special', value: 20, description: '+20% all trapping success rates' }
    ]
  },

  // ========================================
  // TAXIDERMY MOUNTS (Level 25-95)
  // ========================================
  {
    itemId: 'rabbit-mount',
    name: 'Rabbit Mount',
    description: 'A small taxidermy mount of a rabbit in a natural pose. A modest decoration for any frontier home.',
    type: 'misc',
    rarity: 'common',
    price: 50,
    sellPrice: 25,
    inShop: false,
    levelRequired: 25,
    icon: '🐇',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: []
  },
  {
    itemId: 'deer-head-mount',
    name: 'Deer Head Mount',
    description: 'A classic trophy mount featuring a buck\'s head with an impressive rack of antlers. A symbol of hunting prowess.',
    type: 'misc',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 35,
    icon: '🦌',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 5,
    effects: []
  },
  {
    itemId: 'wolf-full-mount',
    name: 'Wolf Full Mount',
    description: 'A full-body taxidermy wolf frozen in a stalking pose. The glass eyes seem to follow you across the room.',
    type: 'misc',
    rarity: 'uncommon',
    price: 300,
    sellPrice: 150,
    inShop: false,
    levelRequired: 45,
    icon: '🐺',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 3,
    effects: []
  },
  {
    itemId: 'bear-full-mount',
    name: 'Bear Full Mount',
    description: 'A magnificent black bear mounted in a standing, aggressive pose. A conversation piece that commands respect.',
    type: 'misc',
    rarity: 'rare',
    price: 600,
    sellPrice: 300,
    inShop: false,
    levelRequired: 55,
    icon: '🐻',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 2,
    effects: []
  },
  {
    itemId: 'grizzly-mount',
    name: 'Grizzly Bear Mount',
    description: 'An enormous grizzly bear taxidermy display with massive paws and fearsome teeth bared. Only the greatest hunters possess such trophies.',
    type: 'misc',
    rarity: 'rare',
    price: 1000,
    sellPrice: 500,
    inShop: false,
    levelRequired: 65,
    icon: '🐻',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 2,
    effects: []
  },
  {
    itemId: 'buffalo-mount',
    name: 'Buffalo Mount',
    description: 'A massive buffalo head mount with a thick, shaggy mane and curved horns. A tribute to the spirit of the frontier.',
    type: 'misc',
    rarity: 'rare',
    price: 800,
    sellPrice: 400,
    inShop: false,
    levelRequired: 60,
    icon: '🦬',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 2,
    effects: []
  },
  {
    itemId: 'thunderbird-mount',
    name: 'Thunderbird Mount',
    description: 'A legendary taxidermy display of a thunderbird with wings spread wide. Lightning crackles between its feathers even in death.',
    type: 'misc',
    rarity: 'legendary',
    price: 3000,
    sellPrice: 1500,
    inShop: false,
    levelRequired: 85,
    icon: '⚡',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 1,
    effects: []
  },
  {
    itemId: 'divine-beast-mount',
    name: 'Divine Beast Mount',
    description: 'An awe-inspiring taxidermy display of a creature touched by the gods. Its presence fills any room with an otherworldly glow.',
    type: 'misc',
    rarity: 'legendary',
    price: 5000,
    sellPrice: 2500,
    inShop: false,
    levelRequired: 95,
    icon: '🌟',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 1,
    effects: []
  }
];

export default trappingCrafted;
