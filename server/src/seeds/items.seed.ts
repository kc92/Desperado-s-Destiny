/**
 * Items Seed Data
 * Comprehensive item database + legendary quest items
 */

import { Item } from '../models/Item.model';
import { allItems } from '../data/items';

// Legendary and unique quest items with special mechanics
const legendaryQuestItems = [
  // ========================================
  // LEGENDARY WEAPONS
  // ========================================

  {
    itemId: 'grandfathers-tomahawk',
    name: 'Grandfather\'s Tomahawk',
    description: 'A Kaiowa war tomahawk passed down seven generations. The blade has never been sharpened - it doesn\'t need to be. Honors the old ways: devastatingly effective in melee, useless at range.',
    type: 'weapon',
    rarity: 'legendary',
    price: 20000,
    sellPrice: 10000,
    icon: '🪓',
    effects: [
      { type: 'stat', stat: 'combat', value: 30, description: '+30 Combat (Melee Only)' },
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit' },
      { type: 'special', value: -50, description: '-50% Ranged Damage' }
    ],
    levelRequired: 30,
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'last-word',
    name: 'The Last Word',
    description: 'A ornate rifle commissioned by a dying cattle baron to settle a 40-year feud. The engraving reads: "For my enemy - the last word is mine." Perfect for one shot. Useless for the second.',
    type: 'weapon',
    rarity: 'legendary',
    price: 28000,
    sellPrice: 14000,
    icon: '🔫',
    effects: [
      { type: 'stat', stat: 'combat', value: 40, description: '+40 Combat (First Shot)' },
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning' },
      { type: 'special', value: -30, description: '-30% Sustained Combat' }
    ],
    levelRequired: 38,
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'gamblers-derringer',
    name: 'The Gambler\'s Derringer',
    description: 'Doc Holliday\'s backup piece, hidden up his sleeve through a hundred card games. Tiny, easily concealed, and loaded with luck. But luck runs both ways, and the house always wins eventually.',
    type: 'weapon',
    rarity: 'legendary',
    price: 15000,
    sellPrice: 7500,
    icon: '🔫',
    effects: [
      { type: 'stat', stat: 'cunning', value: 20, description: '+20 Cunning' },
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat' },
      { type: 'special', value: 50, description: '+50% Critical Chance (Gambling)' }
    ],
    levelRequired: 30,
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  // ========================================
  // LEGENDARY ARMOR
  // ========================================

  {
    itemId: 'preachers-coat',
    name: 'The Preacher\'s Coat',
    description: 'Reverend Morrison wore this coat when he walked into the Crimson Saloon and talked down the Dalton brothers without drawing iron. Bullet holes from that night are still stitched shut. Protects the body but demands you talk before you shoot.',
    type: 'armor',
    rarity: 'legendary',
    price: 18000,
    sellPrice: 9000,
    icon: '🧥',
    effects: [
      { type: 'stat', stat: 'hp', value: 50, description: '+50 HP' },
      { type: 'stat', stat: 'spirit', value: 20, description: '+20 Spirit' },
      { type: 'special', value: -15, description: '-15% First Strike Damage' }
    ],
    levelRequired: 28,
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'la-lloronas-shawl',
    name: 'La Llorona\'s Shawl',
    description: 'A mourning shawl found near the river where children go missing. It whispers warnings of danger - but also cries constantly. The weeping never stops. Saves your life, costs your sanity.',
    type: 'armor',
    rarity: 'legendary',
    price: 19000,
    sellPrice: 9500,
    icon: '🧣',
    effects: [
      { type: 'stat', stat: 'spirit', value: 30, description: '+30 Spirit' },
      { type: 'special', value: 25, description: '+25% Ambush Detection' },
      { type: 'special', value: -5, description: '-5 Max Energy' }
    ],
    levelRequired: 25,
    equipSlot: 'head',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  // ========================================
  // LEGENDARY ACCESSORIES
  // ========================================

  {
    itemId: 'devils-eye',
    name: 'The Devil\'s Eye',
    description: 'A blood-red ruby supposedly cut from a larger stone in the court of Montezuma. Baron Von Steiger acquired it, then lost everything. It shows you what people truly want - but that knowledge comes at a cost.',
    type: 'armor',
    rarity: 'legendary',
    price: 30000,
    sellPrice: 15000,
    icon: '💎',
    effects: [
      { type: 'stat', stat: 'cunning', value: 25, description: '+25 Cunning' },
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit' },
      { type: 'special', value: -10, description: '-10 Max HP' }
    ],
    levelRequired: 35,
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'ironhides-badge',
    name: 'Ironhide\'s Badge',
    description: 'Marshal Samuel "Ironhide" Tanner\'s badge, worn through 47 gunfights. He never lost. He also never made a friend or showed mercy. The badge grants protection but demands the law be served - cold.',
    type: 'armor',
    rarity: 'legendary',
    price: 22000,
    sellPrice: 11000,
    icon: '⭐',
    effects: [
      { type: 'stat', stat: 'hp', value: 35, description: '+35 HP' },
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat' },
      { type: 'special', value: -25, description: '-25% Crime Rewards' }
    ],
    levelRequired: 32,
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'scorpion-medallion',
    name: 'The Scorpion Medallion',
    description: 'A gold medallion from the Sonoran desert, bearing the symbol of a scorpion. Grants poison resistance but attracts dangerous enemies. Previous owners all died violently.',
    type: 'armor',
    rarity: 'legendary',
    price: 16000,
    sellPrice: 8000,
    icon: '🦂',
    effects: [
      { type: 'stat', stat: 'cunning', value: 15, description: '+15 Cunning' },
      { type: 'special', value: 50, description: '+50% Poison Resistance' },
      { type: 'special', value: 15, description: '+15% Enemy Aggression' }
    ],
    levelRequired: 26,
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'pale-riders-ring',
    name: 'Pale Rider\'s Ring',
    description: 'A tarnished silver ring found on a skeleton in the desert. Engraved with: "Death rides a pale horse." Increases combat prowess but slowly drains vitality. Some prices are too high.',
    type: 'armor',
    rarity: 'legendary',
    price: 24000,
    sellPrice: 12000,
    icon: '💍',
    effects: [
      { type: 'stat', stat: 'combat', value: 20, description: '+20 Combat' },
      { type: 'stat', stat: 'spirit', value: 10, description: '+10 Spirit' },
      { type: 'special', value: -15, description: '-15% Max HP' }
    ],
    levelRequired: 33,
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'frontera-ring',
    name: 'Ring of La Frontera',
    description: 'The signet ring of the original founder of La Frontera. Grants respect among the diaspora and insight into their ways. But wearing it marks you as either heir or usurper.',
    type: 'armor',
    rarity: 'legendary',
    price: 12000,
    sellPrice: 6000,
    icon: '💍',
    effects: [
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit' },
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning' },
      { type: 'special', value: 20, description: '+20% Frontera Reputation' }
    ],
    levelRequired: 28,
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  // ========================================
  // LEGENDARY MOUNTS
  // ========================================

  {
    itemId: 'el-muerto',
    name: 'El Muerto',
    description: 'A pale stallion that appeared the night the Sangre River ran red. No one has ever seen it eat or drink. Faster than any living horse, but horses shy away from it, and dogs howl when it passes. Some say it\'s the Pale Rider\'s steed, waiting for its master.',
    type: 'mount',
    rarity: 'legendary',
    price: 50000,
    sellPrice: 25000,
    icon: '🐴',
    effects: [
      { type: 'special', value: -60, description: '-60% Travel Time' },
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning' },
      { type: 'special', value: -20, description: '-20% NPC Trust' }
    ],
    levelRequired: 40,
    equipSlot: 'mount',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  // ========================================
  // REGULAR MOUNTS
  // ========================================

  {
    itemId: 'mule',
    name: 'Old Mule',
    description: 'Slow but reliable',
    type: 'mount',
    rarity: 'common',
    price: 500,
    sellPrice: 250,
    icon: '🫏',
    effects: [
      { type: 'special', value: -10, description: '-10% Travel Time' }
    ],
    levelRequired: 1,
    equipSlot: 'mount',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: true
  },

  {
    itemId: 'mustang',
    name: 'Mustang',
    description: 'Wild horse of the plains',
    type: 'mount',
    rarity: 'uncommon',
    price: 2000,
    sellPrice: 1000,
    icon: '🐎',
    effects: [
      { type: 'special', value: -25, description: '-25% Travel Time' }
    ],
    levelRequired: 10,
    equipSlot: 'mount',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: true
  },

  {
    itemId: 'appaloosa',
    name: 'Appaloosa',
    description: 'Prized spotted horse',
    type: 'mount',
    rarity: 'rare',
    price: 5000,
    sellPrice: 2500,
    icon: '🐴',
    effects: [
      { type: 'special', value: -40, description: '-40% Travel Time' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' }
    ],
    levelRequired: 20,
    equipSlot: 'mount',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: true
  },

  // ========================================
  // QUEST ITEMS
  // ========================================

  {
    itemId: 'territorys-future',
    name: 'Territory\'s Future',
    description: 'A mysterious artifact that represents the destiny of the Sangre Territory. Its true power is unknown.',
    type: 'quest',
    rarity: 'legendary',
    price: 0,
    sellPrice: 0,
    icon: '🌟',
    effects: [
      { type: 'stat', stat: 'spirit', value: 25, description: '+25 Spirit' },
      { type: 'stat', stat: 'cunning', value: 25, description: '+25 Cunning' },
      { type: 'stat', stat: 'combat', value: 25, description: '+25 Combat' }
    ],
    levelRequired: 40,
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    inShop: false
  },

  {
    itemId: 'skinwalker-fang',
    name: 'Skinwalker Fang',
    description: 'A fang from a defeated skinwalker. Carries dark power that should not be trifled with.',
    type: 'material',
    rarity: 'epic',
    price: 7500,
    sellPrice: 3750,
    icon: '🦷',
    effects: [],
    levelRequired: 20,
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    inShop: false
  },

  // ========================================
  // SPECIAL CONSUMABLES
  // ========================================

  {
    itemId: 'dynamite',
    name: 'Dynamite',
    description: 'Handle with extreme care',
    type: 'consumable',
    rarity: 'rare',
    price: 500,
    sellPrice: 250,
    icon: '🧨',
    effects: [
      { type: 'special', value: 50, description: '+50% Crime Success' }
    ],
    levelRequired: 15,
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    inShop: true
  }
];

// Merge comprehensive database with legendary quest items
const allItemsToSeed = [
  ...allItems,
  ...legendaryQuestItems
];

/**
 * Seed items into database
 */
export async function seedItems(): Promise<void> {
  console.log('Seeding items...');

  let seededCount = 0;
  let updatedCount = 0;

  for (const item of allItemsToSeed) {
    const result = await Item.findOneAndUpdate(
      { itemId: item.itemId },
      item,
      { upsert: true, new: true }
    );

    if (result) {
      seededCount++;
    } else {
      updatedCount++;
    }
  }

  console.log(`✅ Seeded ${allItemsToSeed.length} items (${seededCount} new, ${updatedCount} updated)`);
  console.log(`📊 Item breakdown:`);
  console.log(`   - Comprehensive database: ${allItems.length} items`);
  console.log(`   - Legendary quest items: ${legendaryQuestItems.length} items`);
  console.log(`   - Total: ${allItemsToSeed.length} items`);
}

/**
 * Clear all items
 */
export async function clearItems(): Promise<void> {
  await Item.deleteMany({});
  console.log('Cleared all items');
}
