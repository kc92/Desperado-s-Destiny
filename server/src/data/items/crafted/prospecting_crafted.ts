/**
 * Prospecting Crafted Items Database
 * Phase 7.2 Crafting Expansion - Recipe outputs for Prospecting profession
 * Includes: mining tools, explosives, specialized equipment, refined materials
 */

import { IItem } from '../../../models/Item.model';

export const prospectingCrafted: Partial<IItem>[] = [
  // ========== MINING TOOLS (Level 5-75) ==========
  {
    itemId: 'miners-pick',
    name: "Miner's Pick",
    description: 'A sturdy iron pick for breaking rock and extracting ore. Essential for any prospector.',
    type: 'tool',
    rarity: 'common',
    price: 75,
    sellPrice: 37,
    inShop: false,
    levelRequired: 5,
    icon: '⛏️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 10, description: '+10% ore yield when mining' }
    ]
  },
  {
    itemId: 'reinforced-pick',
    name: 'Reinforced Pick',
    description: 'A steel-reinforced pick with hardened tip. Cuts through rock with ease.',
    type: 'tool',
    rarity: 'uncommon',
    price: 250,
    sellPrice: 125,
    inShop: false,
    levelRequired: 25,
    icon: '⛏️',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 25, description: '+25% ore yield when mining' },
      { type: 'special', value: 15, description: '+15% chance to find rare ores' }
    ]
  },
  {
    itemId: 'master-drill',
    name: 'Master Drill',
    description: 'An advanced mechanical drilling apparatus with tungsten-carbide bits. Penetrates the hardest stone.',
    type: 'tool',
    rarity: 'rare',
    price: 800,
    sellPrice: 400,
    inShop: false,
    levelRequired: 60,
    icon: '🔩',
    isEquippable: true,
    equipSlot: 'weapon',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 50, description: '+50% ore yield when mining' },
      { type: 'special', value: 30, description: '+30% chance to find rare ores' },
      { type: 'special', value: 20, description: '+20% mining speed' }
    ]
  },
  {
    itemId: 'miners-lamp',
    name: "Miner's Lamp",
    description: 'A reliable oil lamp designed for underground work. Illuminates dark mine shafts safely.',
    type: 'tool',
    rarity: 'common',
    price: 45,
    sellPrice: 22,
    inShop: false,
    levelRequired: 10,
    icon: '🔦',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 10, description: '+10% visibility in mines' },
      { type: 'special', value: 5, description: '+5% chance to spot hidden veins' }
    ]
  },
  {
    itemId: 'prospectors-kit',
    name: "Prospector's Kit",
    description: 'A complete set of prospecting tools including pan, picks, sample bags, and basic assay equipment.',
    type: 'tool',
    rarity: 'uncommon',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 30,
    icon: '🧰',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 20, description: '+20% ore identification accuracy' },
      { type: 'special', value: 15, description: '+15% gold panning efficiency' },
      { type: 'special', value: 10, description: '+10% sample quality' }
    ]
  },
  {
    itemId: 'master-assay-kit',
    name: 'Master Assay Kit',
    description: 'Professional-grade assay equipment with precision scales, acid reagents, and analytical tools for accurate ore valuation.',
    type: 'tool',
    rarity: 'rare',
    price: 650,
    sellPrice: 325,
    inShop: false,
    levelRequired: 55,
    icon: '🔬',
    isEquippable: true,
    equipSlot: 'accessory',
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 40, description: '+40% ore identification accuracy' },
      { type: 'special', value: 25, description: '+25% precious metal detection' },
      { type: 'special', value: 20, description: '+20% assay report accuracy' }
    ]
  },

  // ========== DOCUMENTATION (Level 20) ==========
  {
    itemId: 'assay-report',
    name: 'Assay Report',
    description: 'A detailed geological analysis document certifying the mineral content of a claim. Required for official mining claims.',
    type: 'quest',
    rarity: 'common',
    price: 50,
    sellPrice: 25,
    inShop: false,
    levelRequired: 20,
    icon: '📋',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 25,
    effects: []
  },

  // ========== MINING EQUIPMENT (Level 35-70) ==========
  {
    itemId: 'mine-ventilator',
    name: 'Mine Ventilator',
    description: 'A mechanical air circulation device for deep mine shafts. Keeps the air breathable and removes dangerous gases.',
    type: 'tool',
    rarity: 'uncommon',
    price: 400,
    sellPrice: 200,
    inShop: false,
    levelRequired: 40,
    icon: '💨',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 30, description: '+30% deep mining safety' },
      { type: 'special', value: 20, description: '+20% mine shaft depth capacity' }
    ]
  },
  {
    itemId: 'reinforced-mine-cart',
    name: 'Reinforced Mine Cart',
    description: 'A heavy-duty ore cart with reinforced steel frame and larger capacity. Built to haul massive loads.',
    type: 'tool',
    rarity: 'uncommon',
    price: 500,
    sellPrice: 250,
    inShop: false,
    levelRequired: 45,
    icon: '🛒',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 50, description: '+50% ore transport capacity' },
      { type: 'special', value: 25, description: '+25% mining efficiency' }
    ]
  },

  // ========== EXPLOSIVES (Level 30-95) ==========
  {
    itemId: 'demolition-charge',
    name: 'Demolition Charge',
    description: 'A standard mining explosive packed with dynamite. Clears rock formations efficiently.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 30,
    icon: '💥',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 25,
    effects: [
      { type: 'special', value: 100, description: 'Clears medium rock formations' },
      { type: 'special', value: 20, description: '+20% chance to reveal ore vein' }
    ]
  },
  {
    itemId: 'shaped-charge',
    name: 'Shaped Charge',
    description: 'A precisely engineered explosive with directed blast pattern. Minimizes waste and maximizes penetration.',
    type: 'consumable',
    rarity: 'rare',
    price: 280,
    sellPrice: 140,
    inShop: false,
    levelRequired: 50,
    icon: '💣',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 15,
    effects: [
      { type: 'special', value: 200, description: 'Clears large rock formations' },
      { type: 'special', value: 40, description: '+40% chance to reveal ore vein' },
      { type: 'special', value: 25, description: '+25% ore preservation on blast' }
    ]
  },
  {
    itemId: 'thermite-charge',
    name: 'Thermite Charge',
    description: 'A high-temperature incendiary explosive using iron oxide and aluminum. Melts through solid rock.',
    type: 'consumable',
    rarity: 'rare',
    price: 450,
    sellPrice: 225,
    inShop: false,
    levelRequired: 70,
    icon: '🔥',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 350, description: 'Melts through hardened rock' },
      { type: 'special', value: 60, description: '+60% chance to reveal rare ore' },
      { type: 'special', value: 30, description: '+30% ore preservation on blast' }
    ]
  },
  {
    itemId: 'worldbreaker-charge',
    name: 'Worldbreaker Charge',
    description: 'The most powerful mining explosive ever devised. A combination of nuclear materials and exotic compounds capable of opening entire cavern systems.',
    type: 'consumable',
    rarity: 'legendary',
    price: 2500,
    sellPrice: 1250,
    inShop: false,
    levelRequired: 95,
    icon: '☢️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 1000, description: 'Opens massive cavern systems' },
      { type: 'special', value: 80, description: '+80% chance to reveal legendary ore' },
      { type: 'special', value: 50, description: '+50% ore preservation on blast' },
      { type: 'special', value: 100, description: 'Guaranteed rare mineral discovery' }
    ]
  },

  // ========== HIGH-TIER MATERIALS (Level 70-100) ==========
  {
    itemId: 'tungsten-carbide',
    name: 'Tungsten Carbide',
    description: 'An extremely hard ceramic-metallic compound. Nearly as hard as diamond and used for cutting tools and armor-piercing applications.',
    type: 'material',
    rarity: 'rare',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 70,
    icon: '🔷',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 50,
    effects: []
  },
  {
    itemId: 'perfect-gemstone',
    name: 'Perfect Gemstone',
    description: 'A flawlessly cut gemstone of exceptional clarity and brilliance. The pinnacle of the lapidary art.',
    type: 'material',
    rarity: 'rare',
    price: 600,
    sellPrice: 300,
    inShop: false,
    levelRequired: 80,
    icon: '💎',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 25,
    effects: []
  },
  {
    itemId: 'godsforge-metal-ingot',
    name: 'Godsforge Metal Ingot',
    description: 'A bar of divine metal forged from the rarest ores under extreme conditions. Said to be imbued with otherworldly properties.',
    type: 'material',
    rarity: 'legendary',
    price: 1500,
    sellPrice: 750,
    inShop: false,
    levelRequired: 100,
    icon: '✨',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: []
  }
];

export default prospectingCrafted;
