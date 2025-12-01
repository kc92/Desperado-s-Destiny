/**
 * Crafting Tools
 * Tools for all crafting professions at various quality levels.
 */

import { IItem } from '../../models/Item.model';

const toolQualities = [
  { name: 'Basic', rarity: 'common', price: 50, icon: '🔨' },
  { name: 'Good', rarity: 'uncommon', price: 250, icon: '🔨' },
  { name: 'Fine', rarity: 'rare', price: 1250, icon: '🔨' },
  { name: 'Masterwork', rarity: 'epic', price: 6250, icon: '🔨' },
  { name: 'Legendary', rarity: 'legendary', price: 31250, icon: '🔨' }
];

const professions = [
  { id: 'blacksmith', name: 'Blacksmith\'s Hammer', desc: 'A heavy hammer for shaping metal.' },
  { id: 'leatherworker', name: 'Tanner\'s Knife', desc: 'A sharp knife for cutting and treating hides.' },
  { id: 'alchemist', name: 'Alchemist\'s Stirrer', desc: 'A glass rod for mixing volatile concoctions.' },
  { id: 'cook', name: 'Chef\'s Knife', desc: 'A well-balanced knife for chopping and dicing.' },
  { id: 'tailor', name: 'Sewing Kit', desc: 'A kit containing needles, thread, and other tailoring essentials.' },
  { id: 'gunsmith', name: 'Gunsmith\'s Tools', desc: 'A set of precise tools for firearm maintenance and creation.' }
];

export const craftingTools: Partial<IItem>[] = professions.flatMap(prof =>
  toolQualities.map(qual => ({
    itemId: `tool-${prof.id}-${qual.name.toLowerCase()}`,
    name: `${qual.name} ${prof.name}`,
    description: `${prof.desc} This one is of ${qual.name.toLowerCase()} quality.`,
    type: 'weapon', // Using weapon as a proxy for 'tool'
    rarity: qual.rarity as any, // Type assertion for rarity
    price: qual.price,
    sellPrice: qual.price / 2,
    inShop: qual.rarity === 'common' || qual.rarity === 'uncommon',
    levelRequired: 1,
    icon: qual.icon,
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'special', value: 1, description: `Acts as a ${qual.name} quality tool for ${prof.id === 'blacksmith' ? 'Blacksmithing' : prof.id.charAt(0).toUpperCase() + prof.id.slice(1)}.` }
    ]
  }))
);
