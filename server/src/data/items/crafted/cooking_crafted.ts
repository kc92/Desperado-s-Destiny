/**
 * Cooking Crafted Items
 * Food, drinks, and meals crafted by cooks and chuck wagon chefs
 * Desperados Destiny - Phase 7
 */

import { IItem } from '../../../models/Item.model';

export const cookingCraftedItems: Partial<IItem>[] = [
  // ============================================================================
  // NOVICE TIER (Level 1-15) - Basic campfire cooking
  // ============================================================================
  {
    itemId: 'cooked_meat',
    name: 'Cooked Meat',
    description: 'Simple flame-cooked meat. Better than raw, at least.',
    type: 'consumable',
    rarity: 'common',
    price: 10,
    sellPrice: 5,
    inShop: false,
    levelRequired: 1,
    icon: '🍖',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 15, description: 'Restores 15 health' }
    ]
  },
  {
    itemId: 'bone_broth',
    name: 'Bone Broth',
    description: 'Nutritious broth made from boiled bones. Warms the soul.',
    type: 'consumable',
    rarity: 'common',
    price: 8,
    sellPrice: 4,
    inShop: false,
    levelRequired: 2,
    icon: '🍲',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 10, description: 'Restores 10 health and removes cold' }
    ]
  },
  {
    itemId: 'hand_rolled_cigars',
    name: 'Hand-Rolled Cigars',
    description: 'Rough frontier cigars. Not pretty, but they smoke.',
    type: 'consumable',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
    inShop: false,
    levelRequired: 3,
    icon: '🚬',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    effects: [
      { type: 'stat', stat: 'cunning', value: 2, description: '+2 Cunning for 10 minutes' }
    ]
  },
  {
    itemId: 'seasoned_meat',
    name: 'Seasoned Meat',
    description: 'Meat rubbed with herbs and spices before cooking.',
    type: 'consumable',
    rarity: 'common',
    price: 18,
    sellPrice: 9,
    inShop: false,
    levelRequired: 5,
    icon: '🥩',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 20, description: 'Restores 20 health' }
    ]
  },
  {
    itemId: 'wood_chips',
    name: 'Wood Chips',
    description: 'Aromatic wood chips for smoking meats. Essential for BBQ.',
    type: 'material',
    rarity: 'common',
    price: 5,
    sellPrice: 2,
    inShop: false,
    levelRequired: 4,
    icon: '🪵',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'campfire_beans',
    name: 'Campfire Beans',
    description: 'Slow-cooked beans with bacon. A trail staple.',
    type: 'consumable',
    rarity: 'common',
    price: 12,
    sellPrice: 6,
    inShop: false,
    levelRequired: 4,
    icon: '🫘',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 18, description: 'Restores 18 health' },
      { type: 'stat', stat: 'combat', value: 1, description: '+1 Combat for 15 minutes' }
    ]
  },
  {
    itemId: 'beef_jerky',
    name: 'Beef Jerky',
    description: 'Dried and salted beef that keeps for weeks. Trail essential.',
    type: 'consumable',
    rarity: 'common',
    price: 20,
    sellPrice: 10,
    inShop: false,
    levelRequired: 6,
    icon: '🥓',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 12, description: 'Restores 12 health' },
      { type: 'special', value: 1, description: 'Does not spoil' }
    ]
  },
  {
    itemId: 'strong_coffee',
    name: 'Strong Coffee',
    description: 'Potent brew that can wake the dead. Well, almost.',
    type: 'consumable',
    rarity: 'common',
    price: 8,
    sellPrice: 4,
    inShop: false,
    levelRequired: 3,
    icon: '☕',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'stat', stat: 'cunning', value: 2, description: '+2 Cunning for 20 minutes' }
    ]
  },
  {
    itemId: 'hardtack',
    name: 'Hardtack',
    description: 'Rock-hard biscuit that never spoils. Bring something to dunk it in.',
    type: 'consumable',
    rarity: 'common',
    price: 5,
    sellPrice: 2,
    inShop: false,
    levelRequired: 2,
    icon: '🍪',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'special', value: 8, description: 'Restores 8 health' }
    ]
  },
  {
    itemId: 'fried_bacon',
    name: 'Fried Bacon',
    description: 'Crispy strips of pork belly. The smell alone is worth it.',
    type: 'consumable',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
    inShop: false,
    levelRequired: 5,
    icon: '🥓',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 15, description: 'Restores 15 health' }
    ]
  },
  {
    itemId: 'trail_rations',
    name: 'Trail Rations',
    description: 'Compact food supplies for long journeys. Keeps you going.',
    type: 'consumable',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: false,
    levelRequired: 8,
    icon: '🎒',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    effects: [
      { type: 'special', value: 25, description: 'Restores 25 health' },
      { type: 'special', value: 1, description: 'Removes hunger debuff' }
    ]
  },
  {
    itemId: 'venison_jerky',
    name: 'Venison Jerky',
    description: 'Dried deer meat with a gamey flavor. Hunter favorite.',
    type: 'consumable',
    rarity: 'common',
    price: 22,
    sellPrice: 11,
    inShop: false,
    levelRequired: 10,
    icon: '🦌',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 15, description: 'Restores 15 health' }
    ]
  },
  {
    itemId: 'pan_fried_fish',
    name: 'Pan-Fried Fish',
    description: 'Fresh fish cooked in butter. Simple but satisfying.',
    type: 'consumable',
    rarity: 'common',
    price: 18,
    sellPrice: 9,
    inShop: false,
    levelRequired: 8,
    icon: '🐟',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    effects: [
      { type: 'special', value: 20, description: 'Restores 20 health' }
    ]
  },
  {
    itemId: 'potato_hash',
    name: 'Potato Hash',
    description: 'Diced potatoes fried with onions and meat scraps.',
    type: 'consumable',
    rarity: 'common',
    price: 14,
    sellPrice: 7,
    inShop: false,
    levelRequired: 6,
    icon: '🥔',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 18, description: 'Restores 18 health' }
    ]
  },
  {
    itemId: 'cowboy_coffee',
    name: 'Cowboy Coffee',
    description: 'Boiled coffee grounds, strained through a bandana. Strong stuff.',
    type: 'consumable',
    rarity: 'common',
    price: 10,
    sellPrice: 5,
    inShop: false,
    levelRequired: 5,
    icon: '☕',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'stat', stat: 'cunning', value: 3, description: '+3 Cunning for 15 minutes' }
    ]
  },

  // ============================================================================
  // APPRENTICE TIER (Level 16-30) - Proper cooking skills
  // ============================================================================
  {
    itemId: 'hearty_stew',
    name: 'Hearty Stew',
    description: 'Thick stew with meat and vegetables. Fills the belly proper.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 35,
    sellPrice: 17,
    inShop: false,
    levelRequired: 16,
    icon: '🍲',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    effects: [
      { type: 'special', value: 35, description: 'Restores 35 health' },
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat for 20 minutes' }
    ]
  },
  {
    itemId: 'cornbread',
    name: 'Cornbread',
    description: 'Golden cornmeal bread, slightly sweet. Perfect with beans.',
    type: 'consumable',
    rarity: 'common',
    price: 12,
    sellPrice: 6,
    inShop: false,
    levelRequired: 12,
    icon: '🍞',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 15, description: 'Restores 15 health' }
    ]
  },
  {
    itemId: 'frontier_whiskey',
    name: 'Frontier Whiskey',
    description: 'Rough whiskey distilled on the frontier. Burns going down.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 40,
    sellPrice: 20,
    inShop: false,
    levelRequired: 18,
    icon: '🥃',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'stat', stat: 'combat', value: 3, description: '+3 Combat for 10 minutes' },
      { type: 'stat', stat: 'cunning', value: -1, description: '-1 Cunning while drunk' }
    ]
  },
  {
    itemId: 'roasted_chicken',
    name: 'Roasted Chicken',
    description: 'Whole chicken roasted over fire. Crispy skin, juicy meat.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 45,
    sellPrice: 22,
    inShop: false,
    levelRequired: 20,
    icon: '🍗',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 40, description: 'Restores 40 health' }
    ]
  },
  {
    itemId: 'apple_pie',
    name: 'Apple Pie',
    description: 'Classic American dessert. Just like mama used to make.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 50,
    sellPrice: 25,
    inShop: false,
    levelRequired: 22,
    icon: '🥧',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 30, description: 'Restores 30 health' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit for 15 minutes' }
    ]
  },
  {
    itemId: 'buffalo_jerky',
    name: 'Buffalo Jerky',
    description: 'Dried buffalo meat, rich and filling. Frontier protein.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 35,
    sellPrice: 17,
    inShop: false,
    levelRequired: 18,
    icon: '🦬',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 40,
    effects: [
      { type: 'special', value: 25, description: 'Restores 25 health' },
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat for 15 minutes' }
    ]
  },
  {
    itemId: 'rabbit_stew',
    name: 'Rabbit Stew',
    description: 'Light stew made from fresh rabbit. Delicate flavor.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 38,
    sellPrice: 19,
    inShop: false,
    levelRequired: 20,
    icon: '🐰',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    effects: [
      { type: 'special', value: 35, description: 'Restores 35 health' },
      { type: 'stat', stat: 'cunning', value: 2, description: '+2 Cunning for 20 minutes' }
    ]
  },
  {
    itemId: 'buttermilk_biscuits',
    name: 'Buttermilk Biscuits',
    description: 'Fluffy biscuits made with real buttermilk. Best served warm.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 25,
    sellPrice: 12,
    inShop: false,
    levelRequired: 16,
    icon: '🧈',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 40,
    effects: [
      { type: 'special', value: 20, description: 'Restores 20 health' }
    ]
  },
  {
    itemId: 'chuck_wagon_beans',
    name: 'Chuck Wagon Beans',
    description: 'Hearty beans cooked the trail drive way. Legendary recipe.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 30,
    sellPrice: 15,
    inShop: false,
    levelRequired: 22,
    icon: '🫘',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    effects: [
      { type: 'special', value: 30, description: 'Restores 30 health' },
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat for 20 minutes' }
    ]
  },
  {
    itemId: 'venison_stew',
    name: 'Venison Stew',
    description: 'Rich deer meat stew with root vegetables.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 45,
    sellPrice: 22,
    inShop: false,
    levelRequired: 25,
    icon: '🦌',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 25,
    effects: [
      { type: 'special', value: 40, description: 'Restores 40 health' },
      { type: 'stat', stat: 'cunning', value: 3, description: '+3 Cunning for 20 minutes' }
    ]
  },
  {
    itemId: 'frontier_hotcakes',
    name: 'Frontier Hotcakes',
    description: 'Stack of fluffy pancakes with maple syrup. Breakfast of champions.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 28,
    sellPrice: 14,
    inShop: false,
    levelRequired: 18,
    icon: '🥞',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    effects: [
      { type: 'special', value: 25, description: 'Restores 25 health' },
      { type: 'special', value: 10, description: '+10 energy' }
    ]
  },
  {
    itemId: 'smoked_trout',
    name: 'Smoked Trout',
    description: 'Whole trout smoked over hickory. Delicate smoky flavor.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 42,
    sellPrice: 21,
    inShop: false,
    levelRequired: 24,
    icon: '🐟',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 25,
    effects: [
      { type: 'special', value: 35, description: 'Restores 35 health' },
      { type: 'stat', stat: 'spirit', value: 2, description: '+2 Spirit for 15 minutes' }
    ]
  },
  {
    itemId: 'pemmican',
    name: 'Pemmican',
    description: 'Native dried meat and fat mixture. Lasts for months.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 40,
    sellPrice: 20,
    inShop: false,
    levelRequired: 26,
    icon: '🥩',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 30, description: 'Restores 30 health' },
      { type: 'special', value: 1, description: 'Never spoils' }
    ]
  },
  {
    itemId: 'salted_ham',
    name: 'Salted Ham',
    description: 'Cured ham leg, preserved with salt. Keeps for weeks.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 55,
    sellPrice: 27,
    inShop: false,
    levelRequired: 28,
    icon: '🍖',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 40, description: 'Restores 40 health' }
    ]
  },
  {
    itemId: 'smoked_bacon',
    name: 'Smoked Bacon',
    description: 'Thick-cut bacon smoked to perfection. Irresistible.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 35,
    sellPrice: 17,
    inShop: false,
    levelRequired: 22,
    icon: '🥓',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 40,
    effects: [
      { type: 'special', value: 25, description: 'Restores 25 health' },
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat for 10 minutes' }
    ]
  },

  // ============================================================================
  // JOURNEYMAN TIER (Level 31-50) - Professional cooking
  // ============================================================================
  {
    itemId: 'bbq_brisket',
    name: 'BBQ Brisket',
    description: 'Slow-smoked beef brisket, Texas style. Melt in your mouth.',
    type: 'consumable',
    rarity: 'rare',
    price: 85,
    sellPrice: 42,
    inShop: false,
    levelRequired: 32,
    icon: '🥩',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 60, description: 'Restores 60 health' },
      { type: 'stat', stat: 'combat', value: 4, description: '+4 Combat for 30 minutes' }
    ]
  },
  {
    itemId: 'sourdough_bread',
    name: 'Sourdough Bread',
    description: 'Tangy bread made with wild yeast starter. San Francisco specialty.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 30,
    sellPrice: 15,
    inShop: false,
    levelRequired: 28,
    icon: '🍞',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    effects: [
      { type: 'special', value: 25, description: 'Restores 25 health' }
    ]
  },
  {
    itemId: 'premium_bourbon',
    name: 'Premium Bourbon',
    description: 'Quality Kentucky bourbon, aged in oak barrels.',
    type: 'consumable',
    rarity: 'rare',
    price: 100,
    sellPrice: 50,
    inShop: false,
    levelRequired: 35,
    icon: '🥃',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 15,
    effects: [
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat for 15 minutes' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit for 15 minutes' }
    ]
  },
  {
    itemId: 'venison_steak',
    name: 'Venison Steak',
    description: 'Thick-cut deer steak, seared to perfection.',
    type: 'consumable',
    rarity: 'rare',
    price: 75,
    sellPrice: 37,
    inShop: false,
    levelRequired: 34,
    icon: '🦌',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 55, description: 'Restores 55 health' },
      { type: 'stat', stat: 'cunning', value: 4, description: '+4 Cunning for 25 minutes' }
    ]
  },
  {
    itemId: 'chili_con_carne',
    name: 'Chili Con Carne',
    description: 'Spicy beef and bean stew. The hotter, the better.',
    type: 'consumable',
    rarity: 'rare',
    price: 65,
    sellPrice: 32,
    inShop: false,
    levelRequired: 38,
    icon: '🌶️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 25,
    effects: [
      { type: 'special', value: 50, description: 'Restores 50 health' },
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat for 20 minutes' }
    ]
  },
  {
    itemId: 'cattle_drive_feast',
    name: 'Cattle Drive Feast',
    description: 'Full trail meal for hungry cowboys. Everything they need.',
    type: 'consumable',
    rarity: 'rare',
    price: 90,
    sellPrice: 45,
    inShop: false,
    levelRequired: 40,
    icon: '🍽️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 15,
    effects: [
      { type: 'special', value: 70, description: 'Restores 70 health' },
      { type: 'stat', stat: 'combat', value: 3, description: '+3 Combat for 30 minutes' },
      { type: 'stat', stat: 'cunning', value: 3, description: '+3 Cunning for 30 minutes' }
    ]
  },
  {
    itemId: 'hospitality_spread',
    name: 'Hospitality Spread',
    description: 'Impressive meal spread for entertaining guests. Shows class.',
    type: 'consumable',
    rarity: 'rare',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 45,
    icon: '🎄',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 60, description: 'Restores 60 health' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit for 30 minutes' }
    ]
  },
  {
    itemId: 'miners_lunch_pail',
    name: "Miner's Lunch Pail",
    description: 'Complete packed meal for a hard day in the mines.',
    type: 'consumable',
    rarity: 'rare',
    price: 55,
    sellPrice: 27,
    inShop: false,
    levelRequired: 36,
    icon: '🪣',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 50, description: 'Restores 50 health' },
      { type: 'stat', stat: 'craft', value: 3, description: '+3 Craft for 30 minutes' }
    ]
  },
  {
    itemId: 'sharpshooter_stew',
    name: 'Sharpshooter Stew',
    description: 'Stew recipe said to steady the hand. Favorite of marksmen.',
    type: 'consumable',
    rarity: 'rare',
    price: 80,
    sellPrice: 40,
    inShop: false,
    levelRequired: 42,
    icon: '🎯',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 45, description: 'Restores 45 health' },
      { type: 'stat', stat: 'cunning', value: 6, description: '+6 Cunning for 25 minutes' }
    ]
  },
  {
    itemId: 'outlaws_courage',
    name: "Outlaw's Courage",
    description: 'Strong drink that emboldens even the most wanted men.',
    type: 'consumable',
    rarity: 'rare',
    price: 70,
    sellPrice: 35,
    inShop: false,
    levelRequired: 38,
    icon: '🍺',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'stat', stat: 'combat', value: 6, description: '+6 Combat for 15 minutes' },
      { type: 'stat', stat: 'spirit', value: 4, description: '+4 Spirit for 15 minutes' }
    ]
  },
  {
    itemId: 'trail_boss_special',
    name: 'Trail Boss Special',
    description: 'Premium meal reserved for the trail boss. Best of everything.',
    type: 'consumable',
    rarity: 'rare',
    price: 110,
    sellPrice: 55,
    inShop: false,
    levelRequired: 48,
    icon: '🤠',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 15,
    effects: [
      { type: 'special', value: 80, description: 'Restores 80 health' },
      { type: 'stat', stat: 'combat', value: 4, description: '+4 Combat for 30 minutes' },
      { type: 'stat', stat: 'spirit', value: 4, description: '+4 Spirit for 30 minutes' }
    ]
  },
  {
    itemId: 'iron_gut_tonic',
    name: 'Iron Gut Tonic',
    description: 'Herbal drink that settles the stomach and hardens resolve.',
    type: 'consumable',
    rarity: 'rare',
    price: 60,
    sellPrice: 30,
    inShop: false,
    levelRequired: 44,
    icon: '🧉',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 1, description: 'Immune to poison for 30 minutes' },
      { type: 'stat', stat: 'combat', value: 3, description: '+3 Combat for 30 minutes' }
    ]
  },

  // ============================================================================
  // EXPERT TIER (Level 51-70) - Master chef creations
  // ============================================================================
  {
    itemId: 'fancy_dinner',
    name: 'Fancy Dinner',
    description: 'Multi-course meal fit for a cattle baron. Refined and delicious.',
    type: 'consumable',
    rarity: 'epic',
    price: 200,
    sellPrice: 100,
    inShop: false,
    levelRequired: 52,
    icon: '🍽️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 100, description: 'Restores 100 health' },
      { type: 'stat', stat: 'spirit', value: 8, description: '+8 Spirit for 1 hour' }
    ]
  },
  {
    itemId: 'aged_whiskey',
    name: 'Aged Whiskey',
    description: 'Fine whiskey aged 12 years. Smooth as silk.',
    type: 'consumable',
    rarity: 'rare',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 50,
    icon: '🥃',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'stat', stat: 'combat', value: 6, description: '+6 Combat for 20 minutes' },
      { type: 'stat', stat: 'spirit', value: 6, description: '+6 Spirit for 20 minutes' }
    ]
  },
  {
    itemId: 'buffalo_ribeye',
    name: 'Buffalo Ribeye',
    description: 'Massive buffalo steak, perfectly marbled. King of meats.',
    type: 'consumable',
    rarity: 'epic',
    price: 180,
    sellPrice: 90,
    inShop: false,
    levelRequired: 55,
    icon: '🦬',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 90, description: 'Restores 90 health' },
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat for 30 minutes' }
    ]
  },
  {
    itemId: 'fiesta_feast',
    name: 'Fiesta Feast',
    description: 'Full Mexican celebration spread. Tacos, tamales, and more.',
    type: 'consumable',
    rarity: 'epic',
    price: 220,
    sellPrice: 110,
    inShop: false,
    levelRequired: 58,
    icon: '🎉',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 85, description: 'Restores 85 health' },
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat for 45 minutes' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit for 45 minutes' }
    ]
  },
  {
    itemId: 'dragons_breath_chili',
    name: "Dragon's Breath Chili",
    description: 'Impossibly hot chili that could kill lesser men. Legendary heat.',
    type: 'consumable',
    rarity: 'epic',
    price: 160,
    sellPrice: 80,
    inShop: false,
    levelRequired: 60,
    icon: '🔥',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 50, description: 'Restores 50 health' },
      { type: 'stat', stat: 'combat', value: 10, description: '+10 Combat for 20 minutes' },
      { type: 'special', value: 1, description: 'Fire resistance for 20 minutes' }
    ]
  },
  {
    itemId: 'governors_roast',
    name: "Governor's Roast",
    description: 'Elegant roast prepared for dignitaries. Political power food.',
    type: 'consumable',
    rarity: 'epic',
    price: 250,
    sellPrice: 125,
    inShop: false,
    levelRequired: 55,
    icon: '🏛️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 100, description: 'Restores 100 health' },
      { type: 'stat', stat: 'spirit', value: 10, description: '+10 Spirit for 1 hour' }
    ]
  },
  {
    itemId: 'desperados_delight',
    name: "Desperado's Delight",
    description: 'Bold meal for bold outlaws. Fuel for the lawless.',
    type: 'consumable',
    rarity: 'epic',
    price: 175,
    sellPrice: 87,
    inShop: false,
    levelRequired: 62,
    icon: '💀',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 80, description: 'Restores 80 health' },
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat for 30 minutes' },
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning for 30 minutes' }
    ]
  },
  {
    itemId: 'endurance_jerky',
    name: 'Endurance Jerky',
    description: 'Special jerky that keeps you going far beyond normal limits.',
    type: 'consumable',
    rarity: 'rare',
    price: 90,
    sellPrice: 45,
    inShop: false,
    levelRequired: 52,
    icon: '🏃',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 25,
    effects: [
      { type: 'special', value: 40, description: 'Restores 40 health' },
      { type: 'special', value: 30, description: '+30 max stamina for 1 hour' }
    ]
  },
  {
    itemId: 'texas_pit_master',
    name: 'Texas Pit Master',
    description: 'Ultimate BBQ platter with all the fixings. Legendary pitmaster recipe.',
    type: 'consumable',
    rarity: 'epic',
    price: 280,
    sellPrice: 140,
    inShop: false,
    levelRequired: 65,
    icon: '🔥',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 120, description: 'Restores 120 health' },
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat for 45 minutes' },
      { type: 'stat', stat: 'craft', value: 5, description: '+5 Craft for 45 minutes' }
    ]
  },
  {
    itemId: 'new_orleans_gumbo',
    name: 'New Orleans Gumbo',
    description: 'Authentic Creole stew with secrets passed down generations.',
    type: 'consumable',
    rarity: 'epic',
    price: 190,
    sellPrice: 95,
    inShop: false,
    levelRequired: 58,
    icon: '🍲',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 85, description: 'Restores 85 health' },
      { type: 'stat', stat: 'spirit', value: 8, description: '+8 Spirit for 30 minutes' },
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning for 30 minutes' }
    ]
  },
  {
    itemId: 'prospectors_gold',
    name: "Prospector's Gold",
    description: 'Lucky meal said to bring fortune to miners. Golden fried everything.',
    type: 'consumable',
    rarity: 'epic',
    price: 200,
    sellPrice: 100,
    inShop: false,
    levelRequired: 60,
    icon: '⛏️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 75, description: 'Restores 75 health' },
      { type: 'stat', stat: 'craft', value: 8, description: '+8 Craft for 30 minutes' },
      { type: 'special', value: 10, description: '+10% gold find for 30 minutes' }
    ]
  },
  {
    itemId: 'gunslingers_focus',
    name: "Gunslinger's Focus",
    description: 'Precise meal that sharpens the senses and steadies the hand.',
    type: 'consumable',
    rarity: 'epic',
    price: 210,
    sellPrice: 105,
    inShop: false,
    levelRequired: 65,
    icon: '🔫',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 70, description: 'Restores 70 health' },
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning for 30 minutes' },
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat for 30 minutes' }
    ]
  },

  // ============================================================================
  // MASTER TIER (Level 71-85) - Supernatural cooking
  // ============================================================================
  {
    itemId: 'spirit_offering',
    name: 'Spirit Offering',
    description: 'Sacred meal prepared for ancestor spirits. Bridges worlds.',
    type: 'consumable',
    rarity: 'epic',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 72,
    icon: '👻',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 80, description: 'Restores 80 health' },
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit for 1 hour' },
      { type: 'special', value: 1, description: 'Can communicate with spirits' }
    ]
  },
  {
    itemId: 'ghost_rider_provisions',
    name: 'Ghost Rider Provisions',
    description: 'Ethereal food that sustains supernatural riders. Burns cold.',
    type: 'consumable',
    rarity: 'epic',
    price: 400,
    sellPrice: 200,
    inShop: false,
    levelRequired: 78,
    icon: '🔥',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 100, description: 'Restores 100 health' },
      { type: 'stat', stat: 'combat', value: 12, description: '+12 Combat for 30 minutes' },
      { type: 'special', value: 1, description: 'Immune to fear effects' }
    ]
  },
  {
    itemId: 'cursed_provisions',
    name: 'Cursed Provisions',
    description: 'Dark food prepared with forbidden methods. Power at a price.',
    type: 'consumable',
    rarity: 'epic',
    price: 320,
    sellPrice: 160,
    inShop: false,
    levelRequired: 75,
    icon: '🖤',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat for 20 minutes' },
      { type: 'stat', stat: 'cunning', value: 10, description: '+10 Cunning for 20 minutes' },
      { type: 'stat', stat: 'spirit', value: -5, description: '-5 Spirit while active' }
    ]
  },
  {
    itemId: 'wendigo_feast',
    name: 'Wendigo Feast',
    description: 'Terrifying meal that awakens primal hunger. Not for the weak.',
    type: 'consumable',
    rarity: 'epic',
    price: 450,
    sellPrice: 225,
    inShop: false,
    levelRequired: 80,
    icon: '🦴',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 3,
    effects: [
      { type: 'stat', stat: 'combat', value: 20, description: '+20 Combat for 15 minutes' },
      { type: 'special', value: 1, description: 'Attacks heal you for 10% damage' },
      { type: 'stat', stat: 'spirit', value: -10, description: '-10 Spirit while active' }
    ]
  },
  {
    itemId: 'heavenly_manna',
    name: 'Heavenly Manna',
    description: 'Blessed food that nourishes body and soul. Divine recipe.',
    type: 'consumable',
    rarity: 'epic',
    price: 500,
    sellPrice: 250,
    inShop: false,
    levelRequired: 82,
    icon: '✨',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 3,
    effects: [
      { type: 'special', value: 150, description: 'Restores 150 health' },
      { type: 'stat', stat: 'spirit', value: 20, description: '+20 Spirit for 1 hour' },
      { type: 'special', value: 1, description: 'Cures all negative effects' }
    ]
  },

  // ============================================================================
  // GRANDMASTER TIER (Level 86-100) - Legendary culinary creations
  // ============================================================================
  {
    itemId: 'ambrosia',
    name: 'Ambrosia',
    description: 'Food of the gods. Grants temporary divinity to mortals.',
    type: 'consumable',
    rarity: 'legendary',
    price: 1000,
    sellPrice: 500,
    inShop: false,
    levelRequired: 86,
    icon: '🌟',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 1,
    effects: [
      { type: 'special', value: 200, description: 'Restores 200 health' },
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat for 1 hour' },
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit for 1 hour' }
    ]
  },
  {
    itemId: 'legendary_moonshine',
    name: 'Legendary Moonshine',
    description: 'Moonshine so pure it glows. Otherworldly potency.',
    type: 'consumable',
    rarity: 'legendary',
    price: 800,
    sellPrice: 400,
    inShop: false,
    levelRequired: 88,
    icon: '🌙',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 3,
    effects: [
      { type: 'stat', stat: 'combat', value: 20, description: '+20 Combat for 30 minutes' },
      { type: 'stat', stat: 'cunning', value: 15, description: '+15 Cunning for 30 minutes' },
      { type: 'special', value: 1, description: 'Immune to all debuffs' }
    ]
  },
  {
    itemId: 'the_last_supper',
    name: 'The Last Supper',
    description: 'Sacred meal of ultimate significance. Eaten before the final battle.',
    type: 'consumable',
    rarity: 'legendary',
    price: 2000,
    sellPrice: 1000,
    inShop: false,
    levelRequired: 92,
    icon: '🍷',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 1,
    effects: [
      { type: 'special', value: 999, description: 'Restores all health' },
      { type: 'stat', stat: 'combat', value: 25, description: '+25 Combat for 2 hours' },
      { type: 'stat', stat: 'spirit', value: 25, description: '+25 Spirit for 2 hours' },
      { type: 'special', value: 1, description: 'Cannot die for 60 seconds' }
    ]
  },
  {
    itemId: 'elixir_of_life',
    name: 'Elixir of Life',
    description: 'Legendary drink that extends life itself. Alchemist and cook collaboration.',
    type: 'consumable',
    rarity: 'legendary',
    price: 5000,
    sellPrice: 2500,
    inShop: false,
    levelRequired: 95,
    icon: '💎',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 1,
    effects: [
      { type: 'special', value: 1, description: 'Permanently increases max health by 50' },
      { type: 'special', value: 999, description: 'Full heal on consumption' }
    ]
  },
  {
    itemId: 'the_perfect_meal',
    name: 'The Perfect Meal',
    description: 'The culmination of culinary mastery. Perfection on a plate.',
    type: 'consumable',
    rarity: 'legendary',
    price: 10000,
    sellPrice: 5000,
    inShop: false,
    levelRequired: 100,
    icon: '👑',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 1,
    effects: [
      { type: 'special', value: 999, description: 'Fully restores health' },
      { type: 'stat', stat: 'combat', value: 30, description: '+30 Combat for 2 hours' },
      { type: 'stat', stat: 'cunning', value: 30, description: '+30 Cunning for 2 hours' },
      { type: 'stat', stat: 'spirit', value: 30, description: '+30 Spirit for 2 hours' },
      { type: 'stat', stat: 'craft', value: 30, description: '+30 Craft for 2 hours' }
    ]
  },
  {
    itemId: 'immortal_banquet',
    name: 'Immortal Banquet',
    description: 'Feast that grants temporary immortality. The ultimate celebration.',
    type: 'consumable',
    rarity: 'legendary',
    price: 8000,
    sellPrice: 4000,
    inShop: false,
    levelRequired: 98,
    icon: '🏆',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 1,
    effects: [
      { type: 'special', value: 1, description: 'Cannot die for 5 minutes' },
      { type: 'special', value: 200, description: '+200 max health for 1 hour' },
      { type: 'stat', stat: 'combat', value: 20, description: '+20 to all stats for 1 hour' }
    ]
  }
];
