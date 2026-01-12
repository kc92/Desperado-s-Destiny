/**
 * Native Crafts Crafted Items Database
 * Phase 7.2 Crafting Expansion - Output items from Native Crafts recipes
 * Includes: bows, arrows, traditional weapons, ceremonial items, totems
 */

import { IItem } from '../../../models/Item.model';

export const nativeCraftsCrafted: Partial<IItem>[] = [
  // ========== BOWS ==========
  {
    itemId: 'simple-bow',
    name: 'Simple Bow',
    description: 'A basic hunting bow crafted from flexible wood. Reliable for hunting small game.',
    type: 'weapon',
    rarity: 'common',
    price: 45,
    sellPrice: 22,
    inShop: false,
    levelRequired: 1,
    icon: '🏹',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 4, description: '+4 Combat' },
      { type: 'special', value: 10, description: '+10% Hunting Success' }
    ]
  },
  {
    itemId: 'recurve-bow',
    name: 'Recurve Bow',
    description: 'An improved bow design with curved tips that store more energy. Greater range and power.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 10,
    icon: '🏹',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat' },
      { type: 'special', value: 15, description: '+15% Hunting Success' },
      { type: 'special', value: 10, description: '+10% Range' }
    ]
  },
  {
    itemId: 'composite-bow',
    name: 'Composite Bow',
    description: 'An advanced layered bow combining wood, horn, and sinew. Powerful and compact.',
    type: 'weapon',
    rarity: 'rare',
    price: 400,
    sellPrice: 200,
    inShop: false,
    levelRequired: 25,
    icon: '🏹',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 14, description: '+14 Combat' },
      { type: 'special', value: 20, description: '+20% Hunting Success' },
      { type: 'special', value: 15, description: '+15% Critical Chance' }
    ]
  },
  {
    itemId: 'spirit-bow',
    name: 'Spirit Bow',
    description: 'A sacred bow enchanted with spirit energy. The arrows seem to find their mark on their own.',
    type: 'weapon',
    rarity: 'rare',
    price: 800,
    sellPrice: 400,
    inShop: false,
    levelRequired: 40,
    icon: '🏹',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 18, description: '+18 Combat' },
      { type: 'stat', stat: 'spirit', value: 6, description: '+6 Spirit' },
      { type: 'special', value: 25, description: '+25% Accuracy' },
      { type: 'special', value: 20, description: '+20% Critical Damage' }
    ]
  },
  {
    itemId: 'thunderbow',
    name: 'Thunderbow',
    description: 'A legendary bow blessed by the Thunderbird. Its arrows crack like thunder and strike like lightning.',
    type: 'weapon',
    rarity: 'legendary',
    price: 3500,
    sellPrice: 1750,
    inShop: false,
    levelRequired: 80,
    icon: '🏹',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 30, description: '+30 Combat' },
      { type: 'stat', stat: 'spirit', value: 12, description: '+12 Spirit' },
      { type: 'special', value: 30, description: '+30% Lightning Damage' },
      { type: 'special', value: 25, description: '+25% Critical Chance' },
      { type: 'special', value: 35, description: '+35% Hunting Success' }
    ]
  },

  // ========== ARROWS ==========
  {
    itemId: 'hunting-arrows',
    name: 'Hunting Arrows',
    description: 'Flint-tipped arrows designed for hunting. A bundle of 20 arrows.',
    type: 'consumable',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: false,
    levelRequired: 1,
    icon: '🎯',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'special', value: 10, description: '+10% Hunting Damage' }
    ]
  },
  {
    itemId: 'war-arrows',
    name: 'War Arrows',
    description: 'Obsidian-tipped arrows crafted for combat. Deadly accurate and armor-piercing.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 60,
    sellPrice: 30,
    inShop: false,
    levelRequired: 15,
    icon: '🎯',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'special', value: 20, description: '+20% Combat Damage with Bows' },
      { type: 'special', value: 10, description: '+10% Armor Penetration' }
    ]
  },

  // ========== TRADITIONAL WEAPONS ==========
  {
    itemId: 'bone-knife',
    name: 'Bone Knife',
    description: 'A sharp knife crafted from animal bone. Lightweight and effective for skinning game.',
    type: 'weapon',
    rarity: 'common',
    price: 30,
    sellPrice: 15,
    inShop: false,
    levelRequired: 1,
    icon: '🔪',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 3, description: '+3 Combat' },
      { type: 'stat', stat: 'cunning', value: 2, description: '+2 Cunning' },
      { type: 'special', value: 15, description: '+15% Skinning Quality' }
    ]
  },
  {
    itemId: 'stone-tomahawk',
    name: 'Stone Tomahawk',
    description: 'A traditional stone-headed axe. Can be thrown or used in close combat.',
    type: 'weapon',
    rarity: 'common',
    price: 55,
    sellPrice: 27,
    inShop: false,
    levelRequired: 5,
    icon: '🪓',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 6, description: '+6 Combat' },
      { type: 'special', value: 15, description: '+15% Throwing Damage' }
    ]
  },
  {
    itemId: 'war-club',
    name: 'War Club',
    description: 'A heavy wooden club with a stone head. Devastating in close combat.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 12,
    icon: '🏏',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 10, description: '+10 Combat' },
      { type: 'special', value: 20, description: '+20% Stun Chance' },
      { type: 'special', value: 15, description: '+15% Melee Damage' }
    ]
  },
  {
    itemId: 'war-lance',
    name: 'War Lance',
    description: 'A long ceremonial lance decorated with feathers and paint. A symbol of warrior status.',
    type: 'weapon',
    rarity: 'rare',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 20,
    icon: '🔱',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat' },
      { type: 'stat', stat: 'spirit', value: 4, description: '+4 Spirit' },
      { type: 'special', value: 25, description: '+25% Mounted Combat Bonus' },
      { type: 'special', value: 10, description: '+10% Intimidation' }
    ]
  },

  // ========== ARMOR / CEREMONIAL CLOTHING ==========
  {
    itemId: 'spirit-shield',
    name: 'Spirit Shield',
    description: 'A buffalo hide shield painted with protective spirit symbols. Offers both physical and spiritual defense.',
    type: 'armor',
    rarity: 'rare',
    price: 450,
    sellPrice: 225,
    inShop: false,
    levelRequired: 25,
    icon: '🛡️',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 25, description: '+25 HP' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' },
      { type: 'special', value: 15, description: '+15% Physical Resistance' },
      { type: 'special', value: 20, description: '+20% Spiritual Resistance' }
    ]
  },
  {
    itemId: 'simple-headdress',
    name: 'Simple Headdress',
    description: 'A basic feathered headdress. A mark of achievement and connection to the spirits.',
    type: 'armor',
    rarity: 'common',
    price: 65,
    sellPrice: 32,
    inShop: false,
    levelRequired: 5,
    icon: '👒',
    equipSlot: 'head',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' },
      { type: 'special', value: 5, description: '+5% Spirit Power' }
    ]
  },
  {
    itemId: 'eagle-bonnet',
    name: 'Eagle Bonnet',
    description: 'A full war bonnet made with sacred eagle feathers. Each feather represents a deed of valor.',
    type: 'armor',
    rarity: 'rare',
    price: 650,
    sellPrice: 325,
    inShop: false,
    levelRequired: 35,
    icon: '👑',
    equipSlot: 'head',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 10, description: '+10 Spirit' },
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat' },
      { type: 'special', value: 20, description: '+20% Reputation Gain' },
      { type: 'special', value: 15, description: '+15% Leadership Bonus' }
    ]
  },
  {
    itemId: 'war-shirt',
    name: 'War Shirt',
    description: 'A decorated buckskin shirt adorned with beadwork, quillwork, and hair locks. Worn by proven warriors.',
    type: 'armor',
    rarity: 'uncommon',
    price: 200,
    sellPrice: 100,
    inShop: false,
    levelRequired: 15,
    icon: '👕',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 15, description: '+15 HP' },
      { type: 'stat', stat: 'combat', value: 4, description: '+4 Combat' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' }
    ]
  },
  {
    itemId: 'ghost-shirt',
    name: 'Ghost Shirt',
    description: 'A legendary ceremonial shirt blessed with powerful protective magic. Said to turn away bullets.',
    type: 'armor',
    rarity: 'legendary',
    price: 2500,
    sellPrice: 1250,
    inShop: false,
    levelRequired: 60,
    icon: '👘',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 40, description: '+40 HP' },
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit' },
      { type: 'special', value: 25, description: '+25% Dodge Chance' },
      { type: 'special', value: 30, description: '+30% Bullet Resistance' },
      { type: 'special', value: 20, description: '+20% Spiritual Protection' }
    ]
  },
  {
    itemId: 'sun-dance-regalia',
    name: 'Sun Dance Regalia',
    description: 'Complete ceremonial outfit worn during the sacred Sun Dance. Embodies the connection between earth and sky.',
    type: 'armor',
    rarity: 'legendary',
    price: 4000,
    sellPrice: 2000,
    inShop: false,
    levelRequired: 75,
    icon: '🌅',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 50, description: '+50 HP' },
      { type: 'stat', stat: 'spirit', value: 20, description: '+20 Spirit' },
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat' },
      { type: 'special', value: 30, description: '+30% All Resistances' },
      { type: 'special', value: 25, description: '+25% Energy Regeneration' }
    ]
  },

  // ========== POUCHES AND BAGS ==========
  {
    itemId: 'leather-pouch',
    name: 'Leather Pouch',
    description: 'A small leather pouch for storing personal items. Handy for carrying herbs and small valuables.',
    type: 'misc',
    rarity: 'common',
    price: 20,
    sellPrice: 10,
    inShop: false,
    levelRequired: 1,
    icon: '👝',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'inventory_slots', value: 2, description: '+2 Inventory Slots' }
    ]
  },
  {
    itemId: 'small-medicine-pouch',
    name: 'Small Medicine Pouch',
    description: 'A sacred pouch containing personal medicine items. Provides spiritual protection.',
    type: 'tool',
    rarity: 'uncommon',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 10,
    icon: '👝',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' },
      { type: 'special', value: 10, description: '+10% Healing Effectiveness' }
    ]
  },
  {
    itemId: 'medicine-bag',
    name: 'Medicine Bag',
    description: 'A full medicine bag containing sacred herbs, stones, and personal power objects. A healer\'s essential tool.',
    type: 'tool',
    rarity: 'rare',
    price: 280,
    sellPrice: 140,
    inShop: false,
    levelRequired: 30,
    icon: '🎒',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 7, description: '+7 Spirit' },
      { type: 'special', value: 25, description: '+25% Healing Effectiveness' },
      { type: 'special', value: 15, description: '+15% Herb Gathering' }
    ]
  },

  // ========== DECORATIVE / SPIRITUAL ITEMS ==========
  {
    itemId: 'dream-catcher',
    name: 'Dream Catcher',
    description: 'A woven hoop with a web pattern and hanging feathers. Filters dreams and provides restful sleep.',
    type: 'misc',
    rarity: 'uncommon',
    price: 75,
    sellPrice: 37,
    inShop: false,
    levelRequired: 8,
    icon: '🕸️',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'energy_regen', value: 10, description: '+10% Energy Regeneration' },
      { type: 'stat', stat: 'spirit', value: 2, description: '+2 Spirit' }
    ]
  },
  {
    itemId: 'beaded-bracelet',
    name: 'Beaded Bracelet',
    description: 'A colorful bracelet made with intricate beadwork. Beautiful and meaningful.',
    type: 'misc',
    rarity: 'common',
    price: 35,
    sellPrice: 17,
    inShop: false,
    levelRequired: 3,
    icon: '📿',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'stat', stat: 'spirit', value: 1, description: '+1 Spirit' },
      { type: 'social_success', value: 5, description: '+5% Social Success' }
    ]
  },
  {
    itemId: 'quill-ornament',
    name: 'Quill Ornament',
    description: 'A decorative ornament made from dyed porcupine quills. Traditional art at its finest.',
    type: 'misc',
    rarity: 'uncommon',
    price: 55,
    sellPrice: 27,
    inShop: false,
    levelRequired: 12,
    icon: '🎀',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'stat', stat: 'spirit', value: 2, description: '+2 Spirit' },
      { type: 'social_success', value: 8, description: '+8% Social Success' }
    ]
  },

  // ========== CEREMONIAL TOOLS ==========
  {
    itemId: 'ceremonial-pipe',
    name: 'Ceremonial Pipe',
    description: 'A sacred pipe carved from pipestone. Used in prayer, negotiation, and spiritual ceremonies.',
    type: 'tool',
    rarity: 'rare',
    price: 320,
    sellPrice: 160,
    inShop: false,
    levelRequired: 35,
    icon: '🚬',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 8, description: '+8 Spirit' },
      { type: 'social_success', value: 20, description: '+20% Negotiation Success' },
      { type: 'special', value: 15, description: '+15% Reputation Gain' }
    ]
  },
  {
    itemId: 'simple-drum',
    name: 'Simple Drum',
    description: 'A basic hand drum made with stretched hide. Used for songs and ceremonies.',
    type: 'tool',
    rarity: 'common',
    price: 45,
    sellPrice: 22,
    inShop: false,
    levelRequired: 5,
    icon: '🥁',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 2, description: '+2 Spirit' },
      { type: 'special', value: 5, description: '+5% Ceremony Effectiveness' }
    ]
  },
  {
    itemId: 'ceremonial-drum',
    name: 'Ceremonial Drum',
    description: 'A large ritual drum decorated with sacred symbols. Its beat can be heard for miles.',
    type: 'tool',
    rarity: 'rare',
    price: 380,
    sellPrice: 190,
    inShop: false,
    levelRequired: 40,
    icon: '🥁',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 8, description: '+8 Spirit' },
      { type: 'special', value: 20, description: '+20% Ceremony Effectiveness' },
      { type: 'special', value: 15, description: '+15% Group Morale' }
    ]
  },

  // ========== TOTEMS ==========
  {
    itemId: 'buffalo-totem',
    name: 'Buffalo Totem',
    description: 'A carved totem imbued with the spirit of the buffalo. Grants endurance and plenty.',
    type: 'misc',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 20,
    icon: '🦬',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 20, description: '+20 HP' },
      { type: 'stat', stat: 'spirit', value: 4, description: '+4 Spirit' },
      { type: 'special', value: 15, description: '+15% Endurance' }
    ]
  },
  {
    itemId: 'coyote-totem',
    name: 'Coyote Totem',
    description: 'A carved totem imbued with the spirit of the trickster coyote. Grants cunning and luck.',
    type: 'misc',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 20,
    icon: '🐺',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'cunning', value: 6, description: '+6 Cunning' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' },
      { type: 'special', value: 10, description: '+10% Luck' }
    ]
  },
  {
    itemId: 'thunderbird-totem',
    name: 'Thunderbird Totem',
    description: 'A carved totem imbued with the spirit of the thunderbird. Crackles with storm energy.',
    type: 'misc',
    rarity: 'rare',
    price: 500,
    sellPrice: 250,
    inShop: false,
    levelRequired: 50,
    icon: '🦅',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 10, description: '+10 Spirit' },
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat' },
      { type: 'special', value: 20, description: '+20% Lightning Resistance' },
      { type: 'special', value: 15, description: '+15% Critical Chance' }
    ]
  },
  {
    itemId: 'worldbridge-totem',
    name: 'Worldbridge Totem',
    description: 'A legendary totem carved from consecrated spirit stone. Bridges the gap between worlds.',
    type: 'misc',
    rarity: 'legendary',
    price: 2000,
    sellPrice: 1000,
    inShop: false,
    levelRequired: 70,
    icon: '🌌',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 18, description: '+18 Spirit' },
      { type: 'stat', stat: 'hp', value: 30, description: '+30 HP' },
      { type: 'special', value: 30, description: '+30% Spirit Vision' },
      { type: 'special', value: 25, description: '+25% All Spiritual Effects' }
    ]
  },

  // ========== SPIRIT TOOLS ==========
  {
    itemId: 'vision-staff',
    name: 'Vision Staff',
    description: 'A sacred staff topped with crystals and feathers. Enhances spiritual sight and connection to the spirit world.',
    type: 'tool',
    rarity: 'rare',
    price: 600,
    sellPrice: 300,
    inShop: false,
    levelRequired: 45,
    icon: '🪄',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 12, description: '+12 Spirit' },
      { type: 'special', value: 30, description: '+30% Vision Quest Success' },
      { type: 'special', value: 20, description: '+20% Spirit Communication' },
      { type: 'special', value: 15, description: '+15% Prophecy Accuracy' }
    ]
  }
];

export default nativeCraftsCrafted;
