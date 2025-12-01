/**
 * Hunting Gear
 * Items for the Hunting profession
 */

import { IItem } from '../../models/Item.model';

export const huntingGear: Partial<IItem>[] = [
  // ========================================
  // HUNTING TOOLS
  // ========================================
  {
    itemId: 'masterwork-skinning-knife',
    name: 'Masterwork Skinning Knife',
    description: 'A perfectly balanced and razor-sharp knife designed for field dressing. Using it significantly increases the yield and quality of hides and pelts.',
    type: 'weapon',
    rarity: 'rare',
    price: 950,
    sellPrice: 475,
    inShop: false, // Crafting recipe reward
    levelRequired: 15,
    icon: '🔪',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat' },
      { type: 'stat', stat: 'craft', value: 15, description: '+15 Craft' },
      { type: 'special', value: 20, description: '+20% chance to harvest rare animal parts' }
    ]
  },

  // ========================================
  // HUNTING ARMOR
  // ========================================
  {
    itemId: 'ghillie-mantle',
    name: 'Ghillie Mantle',
    description: 'A heavy cloak made of canvas and covered in strips of cloth, leaves, and twigs. Offers poor protection but makes you nearly invisible in the wilderness.',
    type: 'armor',
    rarity: 'uncommon',
    price: 400,
    sellPrice: 200,
    inShop: true,
    levelRequired: 10,
    icon: '🌿',
    equipSlot: 'body',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'hp', value: 5, description: '+5 HP' },
      { type: 'special', value: 25, description: 'Reduces detection range by animals by 25%' }
    ]
  },

  // ========================================
  // HUNTING CONSUMABLES
  // ========================================
  {
    itemId: 'predator-scent-gland',
    name: 'Predator Scent Gland',
    description: 'A pungent gland harvested from a wolf or coyote. Applying it masks your human scent and attracts other predators to your location.',
    type: 'consumable',
    rarity: 'common',
    price: 50,
    sellPrice: 25,
    inShop: false, // Harvested from animals
    levelRequired: 5,
    icon: '🐾',
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 1, description: 'Attracts predator-type animals to your location for 10 minutes.' }
    ]
  },
  {
    itemId: 'prey-scent-gland',
    name: 'Prey Scent Gland',
    description: 'A gland harvested from a deer or rabbit. Applying it masks your human scent and makes prey animals curious, drawing them closer.',
    type: 'consumable',
    rarity: 'common',
    price: 30,
    sellPrice: 15,
    inShop: false, // Harvested from animals
    levelRequired: 5,
    icon: '🐾',
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 1, description: 'Attracts prey-type animals to your location for 10 minutes.' }
    ]
  }
];
