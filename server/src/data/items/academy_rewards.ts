/**
 * Skill Academy Reward Items
 * 26 unique items awarded for completing skill tutorial quests
 *
 * Each item provides a small but permanent bonus related to the skill learned.
 * These are soulbound tutorial rewards that cannot be traded.
 */

import { IItem } from '../../models/Item.model';

// =============================================================================
// COMBAT SKILL REWARDS (5 items) - From Iron Jack
// =============================================================================

export const combatAcademyRewards: Partial<IItem>[] = [
  // Melee Combat
  {
    itemId: 'academy-brass-knuckles',
    name: 'Academy Brass Knuckles',
    description:
      'Heavy brass knuckles engraved with the Academy crest. Jack says they teach "proper form."',
    type: 'weapon',
    rarity: 'uncommon',
    price: 100,
    sellPrice: 25,
    inShop: false,
    levelRequired: 1,
    icon: '👊',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"Every punch should mean something." - Iron Jack Thornwood',
    stats: {
      combat: 2,
    },
    effects: [
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat' },
      { type: 'special', value: 5, description: '+5% Melee damage' },
    ],
  },

  // Ranged Combat
  {
    itemId: 'academy-practice-revolver',
    name: 'Academy Practice Revolver',
    description:
      "A well-balanced six-shooter from Jack's personal collection. Modified for training accuracy.",
    type: 'weapon',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 40,
    inShop: false,
    levelRequired: 1,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"A gun is only as good as the hand that holds it." - Iron Jack Thornwood',
    stats: {
      combat: 3,
    },
    effects: [
      { type: 'stat', stat: 'combat', value: 3, description: '+3 Combat' },
      { type: 'special', value: 3, description: '+3% Ranged accuracy' },
    ],
  },

  // Defensive Tactics
  {
    itemId: 'academy-padded-vest',
    name: 'Academy Padded Vest',
    description:
      'A reinforced leather vest worn by all Academy trainees. Shows signs of many sparring sessions.',
    type: 'armor',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 30,
    inShop: false,
    levelRequired: 1,
    icon: '🦺',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"The best defense is knowing when to move." - Iron Jack Thornwood',
    stats: {
      combat: 1,
    },
    effects: [
      { type: 'stat', stat: 'combat', value: 1, description: '+1 Combat' },
      { type: 'special', value: 5, description: '+5 Max HP' },
      { type: 'special', value: 3, description: '+3% Dodge chance' },
    ],
  },

  // Mounted Combat
  {
    itemId: 'academy-cavalry-spurs',
    name: 'Academy Cavalry Spurs',
    description:
      "Silver-plated spurs from Jack's old cavalry regiment. They've seen real battle.",
    type: 'armor',
    rarity: 'uncommon',
    price: 100,
    sellPrice: 25,
    inShop: false,
    levelRequired: 1,
    icon: '🐴',
    equipSlot: 'feet',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"A cavalryman and his horse must move as one." - Iron Jack Thornwood',
    stats: {
      combat: 2,
    },
    effects: [
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat' },
      { type: 'special', value: 5, description: '+5% Mounted combat damage' },
      { type: 'special', value: 3, description: '+3% Horse speed' },
    ],
  },

  // Explosives
  {
    itemId: 'academy-demolition-kit',
    name: 'Academy Demolition Kit',
    description:
      'A compact kit containing fuse wire, blasting caps, and a safety manual. Handle with care.',
    type: 'tool',
    rarity: 'uncommon',
    price: 200,
    sellPrice: 50,
    inShop: false,
    levelRequired: 10,
    icon: '💣',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"Controlled destruction is an art form." - Iron Jack Thornwood',
    stats: {
      combat: 3,
      craft: 2,
    },
    effects: [
      { type: 'stat', stat: 'combat', value: 3, description: '+3 Combat' },
      { type: 'stat', stat: 'craft', value: 2, description: '+2 Craft' },
      { type: 'special', value: 5, description: '+5% Explosive blast radius' },
    ],
  },
];

// =============================================================================
// CUNNING SKILL REWARDS (8 items) - From Silk Viola
// =============================================================================

export const cunningAcademyRewards: Partial<IItem>[] = [
  // Lockpicking
  {
    itemId: 'academy-lockpick-set',
    name: 'Academy Lockpick Set',
    description:
      'A velvet-lined case containing precision picks. Viola insists on proper tool care.',
    type: 'tool',
    rarity: 'uncommon',
    price: 100,
    sellPrice: 25,
    inShop: false,
    levelRequired: 1,
    icon: '🔐',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"Every lock is a conversation. Learn to listen." - Silk Viola Marchetti',
    stats: {
      cunning: 3,
    },
    effects: [
      { type: 'stat', stat: 'cunning', value: 3, description: '+3 Cunning' },
      { type: 'special', value: 5, description: '+5% Lockpicking speed' },
    ],
  },

  // Stealth
  {
    itemId: 'academy-soft-boots',
    name: 'Academy Soft Boots',
    description:
      'Specially designed boots with padded soles. Silent as a whisper on any surface.',
    type: 'armor',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 30,
    inShop: false,
    levelRequired: 1,
    icon: '🥾',
    equipSlot: 'feet',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"A shadow that makes noise is a shadow that dies." - Silk Viola Marchetti',
    stats: {
      cunning: 2,
    },
    effects: [
      { type: 'stat', stat: 'cunning', value: 2, description: '+2 Cunning' },
      { type: 'special', value: 5, description: '+5% Stealth effectiveness' },
    ],
  },

  // Pickpocket
  {
    itemId: 'academy-fingerless-gloves',
    name: 'Academy Fingerless Gloves',
    description:
      'Supple leather gloves that leave the fingertips free. Perfect for delicate work.',
    type: 'armor',
    rarity: 'uncommon',
    price: 90,
    sellPrice: 22,
    inShop: false,
    levelRequired: 1,
    icon: '🧤',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"The hand is quicker than the eye - if properly trained." - Silk Viola Marchetti',
    stats: {
      cunning: 3,
    },
    effects: [
      { type: 'stat', stat: 'cunning', value: 3, description: '+3 Cunning' },
      { type: 'special', value: 5, description: '+5% Pickpocket success' },
    ],
  },

  // Tracking
  {
    itemId: 'academy-tracking-compass',
    name: 'Academy Tracking Compass',
    description:
      'A brass compass modified with Viola\'s own "enhancements." Points to more than just north.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 100,
    sellPrice: 25,
    inShop: false,
    levelRequired: 1,
    icon: '🧭',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"Every step tells a story to those who know how to read." - Silk Viola Marchetti',
    stats: {
      cunning: 2,
      spirit: 1,
    },
    effects: [
      { type: 'stat', stat: 'cunning', value: 2, description: '+2 Cunning' },
      { type: 'stat', stat: 'spirit', value: 1, description: '+1 Spirit' },
      { type: 'special', value: 10, description: '+10% Tracking range' },
    ],
  },

  // Deception
  {
    itemId: 'academy-disguise-kit',
    name: 'Academy Disguise Kit',
    description:
      'A compact case of theatrical makeup, wigs, and prosthetics. Viola assembled it personally.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 130,
    sellPrice: 32,
    inShop: false,
    levelRequired: 1,
    icon: '🎭',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"The truth, properly framed, is far more devastating than any lie." - Silk Viola Marchetti',
    stats: {
      cunning: 3,
    },
    effects: [
      { type: 'stat', stat: 'cunning', value: 3, description: '+3 Cunning' },
      { type: 'special', value: 5, description: '+5% Deception success' },
    ],
  },

  // Gambling
  {
    itemId: 'academy-lucky-dice',
    name: 'Academy Lucky Dice',
    description:
      "A pair of bone dice that seem to favor their owner. Viola swears they're not loaded.",
    type: 'accessory',
    rarity: 'uncommon',
    price: 80,
    sellPrice: 20,
    inShop: false,
    levelRequired: 1,
    icon: '🎲',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"Luck is preparation meeting opportunity." - Silk Viola Marchetti',
    stats: {
      cunning: 2,
    },
    effects: [
      { type: 'stat', stat: 'cunning', value: 2, description: '+2 Cunning' },
      { type: 'special', value: 5, description: '+5% Gambling luck' },
    ],
  },

  // Duel Instinct
  {
    itemId: 'academy-dark-glasses',
    name: 'Academy Dark Glasses',
    description:
      'Tinted spectacles that hide your eyes. Makes reading your tells nearly impossible.',
    type: 'armor',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 40,
    inShop: false,
    levelRequired: 5,
    icon: '🕶️',
    equipSlot: 'head',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"In a standoff, the eyes tell everything. Hide yours." - Silk Viola Marchetti',
    stats: {
      cunning: 3,
      combat: 1,
    },
    effects: [
      { type: 'stat', stat: 'cunning', value: 3, description: '+3 Cunning' },
      { type: 'stat', stat: 'combat', value: 1, description: '+1 Combat' },
      { type: 'special', value: 5, description: '+5% Duel opponent reading' },
    ],
  },

  // Sleight of Hand
  {
    itemId: 'academy-marked-deck',
    name: 'Academy Marked Deck',
    description:
      "A deck of cards with subtle markings only trained eyes can see. Viola's personal design.",
    type: 'accessory',
    rarity: 'uncommon',
    price: 70,
    sellPrice: 18,
    inShop: false,
    levelRequired: 1,
    icon: '🃏',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"The hand that deals the cards controls the game." - Silk Viola Marchetti',
    stats: {
      cunning: 2,
    },
    effects: [
      { type: 'stat', stat: 'cunning', value: 2, description: '+2 Cunning' },
      { type: 'special', value: 5, description: '+5% Sleight of hand success' },
    ],
  },
];

// =============================================================================
// SPIRIT SKILL REWARDS (6 items) - From Walking Moon
// =============================================================================

export const spiritAcademyRewards: Partial<IItem>[] = [
  // Medicine
  {
    itemId: 'academy-medicine-pouch',
    name: 'Academy Medicine Pouch',
    description:
      'A leather pouch decorated with beadwork, containing dried herbs and healing supplies.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 100,
    sellPrice: 25,
    inShop: false,
    levelRequired: 1,
    icon: '🌿',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"Healing begins when you learn to listen to the body." - Walking Moon',
    stats: {
      spirit: 3,
    },
    effects: [
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' },
      { type: 'special', value: 5, description: '+5% Healing effectiveness' },
    ],
  },

  // Persuasion
  {
    itemId: 'academy-peace-pipe',
    name: 'Academy Peace Pipe',
    description:
      "A ceremonial pipe carved from red stone. Walking Moon blessed it personally.",
    type: 'accessory',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 30,
    inShop: false,
    levelRequired: 1,
    icon: '🪈',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"Words are medicine when spoken with truth." - Walking Moon',
    stats: {
      spirit: 3,
    },
    effects: [
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' },
      { type: 'special', value: 5, description: '+5% Persuasion success' },
    ],
  },

  // Animal Handling
  {
    itemId: 'academy-beast-token',
    name: 'Academy Beast Token',
    description:
      'A carved wooden medallion depicting a wolf, bear, and eagle intertwined.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 100,
    sellPrice: 25,
    inShop: false,
    levelRequired: 1,
    icon: '🐺',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"Animals know your heart before you speak." - Walking Moon',
    stats: {
      spirit: 3,
    },
    effects: [
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' },
      { type: 'special', value: 10, description: '+10% Animal taming success' },
    ],
  },

  // Leadership
  {
    itemId: 'academy-chiefs-medallion',
    name: "Academy Chief's Medallion",
    description:
      'A bronze medallion bearing the symbol of united peoples. Inspires those who see it.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 130,
    sellPrice: 32,
    inShop: false,
    levelRequired: 1,
    icon: '🏅',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"A true leader carries their people in their heart." - Walking Moon',
    stats: {
      spirit: 2,
      combat: 1,
    },
    effects: [
      { type: 'stat', stat: 'spirit', value: 2, description: '+2 Spirit' },
      { type: 'stat', stat: 'combat', value: 1, description: '+1 Combat' },
      { type: 'special', value: 5, description: '+5% Group morale' },
    ],
  },

  // Ritual Knowledge
  {
    itemId: 'academy-spirit-drum',
    name: 'Academy Spirit Drum',
    description:
      'A small hand drum painted with sacred symbols. Its beat echoes in both worlds.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 180,
    sellPrice: 45,
    inShop: false,
    levelRequired: 10,
    icon: '🥁',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"The drum speaks to the spirits when words cannot." - Walking Moon',
    stats: {
      spirit: 4,
    },
    effects: [
      { type: 'stat', stat: 'spirit', value: 4, description: '+4 Spirit' },
      { type: 'special', value: 10, description: '+10% Ritual power' },
    ],
  },

  // Performance
  {
    itemId: 'academy-storyteller-blanket',
    name: "Academy Storyteller's Blanket",
    description:
      'A woven blanket depicting scenes from ancient tales. Wrapping yourself in it brings inspiration.',
    type: 'armor',
    rarity: 'uncommon',
    price: 90,
    sellPrice: 22,
    inShop: false,
    levelRequired: 1,
    icon: '🧣',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"Every story carries the soul of those who came before." - Walking Moon',
    stats: {
      spirit: 2,
    },
    effects: [
      { type: 'stat', stat: 'spirit', value: 2, description: '+2 Spirit' },
      { type: 'special', value: 10, description: '+10% Performance tips' },
    ],
  },
];

// =============================================================================
// CRAFT SKILL REWARDS (8 items) - From Augustus Hornsby
// =============================================================================

export const craftAcademyRewards: Partial<IItem>[] = [
  // Blacksmithing
  {
    itemId: 'academy-smithing-hammer',
    name: 'Academy Smithing Hammer',
    description:
      "A perfectly balanced hammer from Gus's own forge. The head is inscribed with his maker's mark.",
    type: 'tool',
    rarity: 'uncommon',
    price: 100,
    sellPrice: 25,
    inShop: false,
    levelRequired: 1,
    icon: '🔨',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"Every strike should have purpose." - Augustus Hornsby',
    stats: {
      craft: 3,
    },
    effects: [
      { type: 'stat', stat: 'craft', value: 3, description: '+3 Craft' },
      { type: 'special', value: 5, description: '+5% Forge speed' },
    ],
  },

  // Leatherworking
  {
    itemId: 'academy-leather-toolkit',
    name: 'Academy Leather Toolkit',
    description:
      'A roll of leather containing awls, needles, and cutting blades. Everything a tanner needs.',
    type: 'tool',
    rarity: 'uncommon',
    price: 90,
    sellPrice: 22,
    inShop: false,
    levelRequired: 1,
    icon: '🧰',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"Leather remembers every cut. Make them count." - Augustus Hornsby',
    stats: {
      craft: 3,
    },
    effects: [
      { type: 'stat', stat: 'craft', value: 3, description: '+3 Craft' },
      { type: 'special', value: 5, description: '+5% Leather quality' },
    ],
  },

  // Cooking
  {
    itemId: 'academy-cast-iron-skillet',
    name: 'Academy Cast-Iron Skillet',
    description:
      "A well-seasoned skillet that's seen thousands of meals. Gus says it was his mother's.",
    type: 'tool',
    rarity: 'uncommon',
    price: 80,
    sellPrice: 20,
    inShop: false,
    levelRequired: 1,
    icon: '🍳',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"Good food builds strong bodies and stronger spirits." - Augustus Hornsby',
    stats: {
      craft: 2,
      spirit: 1,
    },
    effects: [
      { type: 'stat', stat: 'craft', value: 2, description: '+2 Craft' },
      { type: 'stat', stat: 'spirit', value: 1, description: '+1 Spirit' },
      { type: 'special', value: 5, description: '+5% Food quality' },
    ],
  },

  // Alchemy
  {
    itemId: 'academy-alchemy-set',
    name: 'Academy Alchemy Set',
    description:
      'A portable alchemy kit with mortar, pestle, and small glass vials. Handle with care.',
    type: 'tool',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 30,
    inShop: false,
    levelRequired: 1,
    icon: '⚗️',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"Chemistry is just cooking with more explosions." - Augustus Hornsby',
    stats: {
      craft: 3,
    },
    effects: [
      { type: 'stat', stat: 'craft', value: 3, description: '+3 Craft' },
      { type: 'special', value: 5, description: '+5% Potion potency' },
    ],
  },

  // Engineering
  {
    itemId: 'academy-engineering-tools',
    name: 'Academy Engineering Tools',
    description:
      "A brass case containing precision instruments, gears, and Gus's personal blueprints.",
    type: 'tool',
    rarity: 'uncommon',
    price: 160,
    sellPrice: 40,
    inShop: false,
    levelRequired: 5,
    icon: '⚙️',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"Every machine is a puzzle waiting to be solved." - Augustus Hornsby',
    stats: {
      craft: 4,
    },
    effects: [
      { type: 'stat', stat: 'craft', value: 4, description: '+4 Craft' },
      { type: 'special', value: 5, description: '+5% Device quality' },
    ],
  },

  // Mining
  {
    itemId: 'academy-mining-pick',
    name: 'Academy Mining Pick',
    description:
      'A reinforced pick with a comfortable grip. Gus designed it for long shifts underground.',
    type: 'tool',
    rarity: 'uncommon',
    price: 100,
    sellPrice: 25,
    inShop: false,
    levelRequired: 1,
    icon: '⛏️',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"The earth gives up its treasures to those who work for them." - Augustus Hornsby',
    stats: {
      craft: 2,
      combat: 1,
    },
    effects: [
      { type: 'stat', stat: 'craft', value: 2, description: '+2 Craft' },
      { type: 'stat', stat: 'combat', value: 1, description: '+1 Combat' },
      { type: 'special', value: 5, description: '+5% Ore yield' },
    ],
  },

  // Carpentry
  {
    itemId: 'academy-saw-set',
    name: 'Academy Saw Set',
    description:
      'A collection of hand saws in various sizes, each kept razor-sharp by Gus himself.',
    type: 'tool',
    rarity: 'uncommon',
    price: 90,
    sellPrice: 22,
    inShop: false,
    levelRequired: 1,
    icon: '🪚',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"Measure twice, cut once. Measure once, curse forever." - Augustus Hornsby',
    stats: {
      craft: 3,
    },
    effects: [
      { type: 'stat', stat: 'craft', value: 3, description: '+3 Craft' },
      { type: 'special', value: 5, description: '+5% Build speed' },
    ],
  },

  // Gunsmithing
  {
    itemId: 'academy-gunsmith-toolkit',
    name: 'Academy Gunsmith Toolkit',
    description:
      'A velvet-lined case of precision tools for firearm maintenance and modification.',
    type: 'tool',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 38,
    inShop: false,
    levelRequired: 5,
    icon: '🔧',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText:
      '"A well-maintained gun is a life-saving friend." - Augustus Hornsby',
    stats: {
      craft: 3,
      combat: 1,
    },
    effects: [
      { type: 'stat', stat: 'craft', value: 3, description: '+3 Craft' },
      { type: 'stat', stat: 'combat', value: 1, description: '+1 Combat' },
      { type: 'special', value: 5, description: '+5% Weapon mod quality' },
    ],
  },
];

// =============================================================================
// COMBINED EXPORTS
// =============================================================================

/**
 * All 26 Academy Reward Items
 */
export const academyRewards: Partial<IItem>[] = [
  ...combatAcademyRewards,
  ...cunningAcademyRewards,
  ...spiritAcademyRewards,
  ...craftAcademyRewards,
];

/**
 * Get academy reward item by skill ID
 */
export function getAcademyRewardForSkill(
  skillId: string
): Partial<IItem> | undefined {
  const skillToItemMap: Record<string, string> = {
    // Combat
    melee_combat: 'academy-brass-knuckles',
    ranged_combat: 'academy-practice-revolver',
    defensive_tactics: 'academy-padded-vest',
    mounted_combat: 'academy-cavalry-spurs',
    explosives: 'academy-demolition-kit',
    // Cunning
    lockpicking: 'academy-lockpick-set',
    stealth: 'academy-soft-boots',
    pickpocket: 'academy-fingerless-gloves',
    tracking: 'academy-tracking-compass',
    deception: 'academy-disguise-kit',
    gambling: 'academy-lucky-dice',
    duel_instinct: 'academy-dark-glasses',
    sleight_of_hand: 'academy-marked-deck',
    // Spirit
    medicine: 'academy-medicine-pouch',
    persuasion: 'academy-peace-pipe',
    animal_handling: 'academy-beast-token',
    leadership: 'academy-chiefs-medallion',
    ritual_knowledge: 'academy-spirit-drum',
    performance: 'academy-storyteller-blanket',
    // Craft
    blacksmithing: 'academy-smithing-hammer',
    leatherworking: 'academy-leather-toolkit',
    cooking: 'academy-cast-iron-skillet',
    alchemy: 'academy-alchemy-set',
    engineering: 'academy-engineering-tools',
    mining: 'academy-mining-pick',
    carpentry: 'academy-saw-set',
    gunsmithing: 'academy-gunsmith-toolkit',
  };

  const itemId = skillToItemMap[skillId];
  return itemId ? academyRewards.find((item) => item.itemId === itemId) : undefined;
}

/**
 * Verify all 26 items are present
 */
export const ACADEMY_REWARD_COUNT = {
  combat: combatAcademyRewards.length, // 5
  cunning: cunningAcademyRewards.length, // 8
  spirit: spiritAcademyRewards.length, // 6
  craft: craftAcademyRewards.length, // 8
  total: academyRewards.length, // 27 - Should be 26
};
