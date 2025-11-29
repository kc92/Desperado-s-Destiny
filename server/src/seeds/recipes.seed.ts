/**
 * Recipes Seed Data
 * Western-themed crafting recipes for Desperados Destiny
 */

import { Recipe } from '../models/Recipe.model';
import logger from '../utils/logger';

const recipes = [
  // ========================================
  // WEAPONS (10)
  // ========================================
  {
    recipeId: 'basic-knife',
    name: 'Basic Knife',
    description: 'A simple blade for survival and close combat',
    category: 'weapon',
    ingredients: [
      { itemId: 'metal-scrap', quantity: 2 },
      { itemId: 'leather-strip', quantity: 1 }
    ],
    output: { itemId: 'basic-knife', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 1 },
    craftTime: 5,
    xpReward: 10,
    isUnlocked: true
  },
  {
    recipeId: 'hunting-knife',
    name: 'Hunting Knife',
    description: 'A quality blade with a sharp edge, perfect for skinning game',
    category: 'weapon',
    ingredients: [
      { itemId: 'metal-ingot', quantity: 1 },
      { itemId: 'tanned-hide', quantity: 1 },
      { itemId: 'gun-oil', quantity: 1 }
    ],
    output: { itemId: 'hunting-knife', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 5 },
    craftTime: 10,
    xpReward: 25,
    isUnlocked: true
  },
  {
    recipeId: 'bowie-knife',
    name: 'Bowie Knife',
    description: 'A legendary fighting blade with devastating power',
    category: 'weapon',
    ingredients: [
      { itemId: 'metal-ingot', quantity: 3 },
      { itemId: 'tanned-hide', quantity: 2 },
      { itemId: 'gun-oil', quantity: 2 }
    ],
    output: { itemId: 'bowie-knife', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 15 },
    craftTime: 20,
    xpReward: 75,
    isUnlocked: true
  },
  {
    recipeId: 'basic-revolver',
    name: 'Basic Revolver',
    description: 'A crude six-shooter, functional but unreliable',
    category: 'weapon',
    ingredients: [
      { itemId: 'metal-ingot', quantity: 3 },
      { itemId: 'metal-scrap', quantity: 5 },
      { itemId: 'gun-oil', quantity: 2 }
    ],
    output: { itemId: 'basic-revolver', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 10 },
    craftTime: 30,
    xpReward: 50,
    isUnlocked: true
  },
  {
    recipeId: 'improved-revolver',
    name: 'Improved Revolver',
    description: 'A well-crafted six-shooter with superior accuracy',
    category: 'weapon',
    ingredients: [
      { itemId: 'metal-ingot', quantity: 5 },
      { itemId: 'gun-oil', quantity: 3 },
      { itemId: 'blackpowder', quantity: 2 }
    ],
    output: { itemId: 'improved-revolver', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 20 },
    craftTime: 45,
    xpReward: 100,
    isUnlocked: true
  },
  {
    recipeId: 'shotgun',
    name: 'Shotgun',
    description: 'A powerful double-barrel scattergun',
    category: 'weapon',
    ingredients: [
      { itemId: 'metal-ingot', quantity: 6 },
      { itemId: 'tanned-hide', quantity: 2 },
      { itemId: 'gun-oil', quantity: 4 }
    ],
    output: { itemId: 'shotgun', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 18 },
    craftTime: 40,
    xpReward: 90,
    isUnlocked: true
  },
  {
    recipeId: 'rifle',
    name: 'Rifle',
    description: 'A long-range firearm for precision shooting',
    category: 'weapon',
    ingredients: [
      { itemId: 'metal-ingot', quantity: 7 },
      { itemId: 'tanned-hide', quantity: 3 },
      { itemId: 'gun-oil', quantity: 5 }
    ],
    output: { itemId: 'rifle', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 22 },
    craftTime: 50,
    xpReward: 120,
    isUnlocked: true
  },
  {
    recipeId: 'dynamite',
    name: 'Dynamite',
    description: 'Explosive sticks for demolition and mayhem',
    category: 'weapon',
    ingredients: [
      { itemId: 'blackpowder', quantity: 5 },
      { itemId: 'rope', quantity: 2 },
      { itemId: 'metal-scrap', quantity: 1 }
    ],
    output: { itemId: 'dynamite', quantity: 3 },
    skillRequired: { skillId: 'craft', level: 12 },
    craftTime: 15,
    xpReward: 60,
    isUnlocked: true
  },
  {
    recipeId: 'improved-dynamite',
    name: 'Improved Dynamite',
    description: 'Enhanced explosives with greater destructive power',
    category: 'weapon',
    ingredients: [
      { itemId: 'blackpowder', quantity: 8 },
      { itemId: 'rope', quantity: 3 },
      { itemId: 'metal-ingot', quantity: 2 }
    ],
    output: { itemId: 'improved-dynamite', quantity: 3 },
    skillRequired: { skillId: 'craft', level: 25 },
    craftTime: 25,
    xpReward: 150,
    isUnlocked: true
  },
  {
    recipeId: 'tomahawk',
    name: 'Tomahawk',
    description: 'A deadly throwing axe favored by frontier warriors',
    category: 'weapon',
    ingredients: [
      { itemId: 'metal-ingot', quantity: 2 },
      { itemId: 'leather-strip', quantity: 2 },
      { itemId: 'feathers', quantity: 3 }
    ],
    output: { itemId: 'tomahawk', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 8 },
    craftTime: 12,
    xpReward: 40,
    isUnlocked: true
  },

  // ========================================
  // CONSUMABLES (15)
  // ========================================
  {
    recipeId: 'minor-health-tonic',
    name: 'Minor Health Tonic',
    description: 'A basic remedy that restores some health',
    category: 'consumable',
    ingredients: [
      { itemId: 'herbs', quantity: 3 },
      { itemId: 'water', quantity: 1 }
    ],
    output: { itemId: 'minor-health-tonic', quantity: 2 },
    skillRequired: { skillId: 'spirit', level: 1 },
    craftTime: 5,
    xpReward: 8,
    isUnlocked: true
  },
  {
    recipeId: 'major-health-tonic',
    name: 'Major Health Tonic',
    description: 'A powerful remedy that greatly restores health',
    category: 'consumable',
    ingredients: [
      { itemId: 'herbs', quantity: 8 },
      { itemId: 'water', quantity: 2 },
      { itemId: 'alcohol', quantity: 1 }
    ],
    output: { itemId: 'major-health-tonic', quantity: 2 },
    skillRequired: { skillId: 'spirit', level: 10 },
    craftTime: 12,
    xpReward: 40,
    isUnlocked: true
  },
  {
    recipeId: 'minor-energy-elixir',
    name: 'Minor Energy Elixir',
    description: 'A stimulating brew that restores energy',
    category: 'consumable',
    ingredients: [
      { itemId: 'coffee-beans', quantity: 5 },
      { itemId: 'herbs', quantity: 2 },
      { itemId: 'water', quantity: 1 }
    ],
    output: { itemId: 'minor-energy-elixir', quantity: 2 },
    skillRequired: { skillId: 'spirit', level: 3 },
    craftTime: 8,
    xpReward: 15,
    isUnlocked: true
  },
  {
    recipeId: 'major-energy-elixir',
    name: 'Major Energy Elixir',
    description: 'A potent stimulant that greatly restores energy',
    category: 'consumable',
    ingredients: [
      { itemId: 'coffee-beans', quantity: 10 },
      { itemId: 'herbs', quantity: 5 },
      { itemId: 'alcohol', quantity: 2 }
    ],
    output: { itemId: 'major-energy-elixir', quantity: 2 },
    skillRequired: { skillId: 'spirit', level: 12 },
    craftTime: 15,
    xpReward: 50,
    isUnlocked: true
  },
  {
    recipeId: 'antivenom',
    name: 'Antivenom',
    description: 'Neutralizes poison and venom effects',
    category: 'consumable',
    ingredients: [
      { itemId: 'herbs', quantity: 10 },
      { itemId: 'snake-venom', quantity: 1 },
      { itemId: 'water', quantity: 2 }
    ],
    output: { itemId: 'antivenom', quantity: 1 },
    skillRequired: { skillId: 'spirit', level: 15 },
    craftTime: 20,
    xpReward: 80,
    isUnlocked: true
  },
  {
    recipeId: 'painkillers',
    name: 'Painkillers',
    description: 'Numbs pain and increases pain tolerance',
    category: 'consumable',
    ingredients: [
      { itemId: 'herbs', quantity: 6 },
      { itemId: 'alcohol', quantity: 2 }
    ],
    output: { itemId: 'painkillers', quantity: 3 },
    skillRequired: { skillId: 'spirit', level: 6 },
    craftTime: 10,
    xpReward: 25,
    isUnlocked: true
  },
  {
    recipeId: 'stimulant',
    name: 'Stimulant',
    description: 'Temporarily boosts reflexes and awareness',
    category: 'consumable',
    ingredients: [
      { itemId: 'coffee-beans', quantity: 8 },
      { itemId: 'herbs', quantity: 4 },
      { itemId: 'tobacco', quantity: 2 }
    ],
    output: { itemId: 'stimulant', quantity: 2 },
    skillRequired: { skillId: 'spirit', level: 8 },
    craftTime: 12,
    xpReward: 35,
    isUnlocked: true
  },
  {
    recipeId: 'poison',
    name: 'Poison',
    description: 'A deadly toxin that can be applied to weapons',
    category: 'consumable',
    ingredients: [
      { itemId: 'snake-venom', quantity: 2 },
      { itemId: 'herbs', quantity: 5 },
      { itemId: 'alcohol', quantity: 1 }
    ],
    output: { itemId: 'poison', quantity: 3 },
    skillRequired: { skillId: 'cunning', level: 12 },
    craftTime: 18,
    xpReward: 70,
    isUnlocked: true
  },
  {
    recipeId: 'smelling-salts',
    name: 'Smelling Salts',
    description: 'Revives unconscious allies',
    category: 'consumable',
    ingredients: [
      { itemId: 'herbs', quantity: 4 },
      { itemId: 'alcohol', quantity: 3 }
    ],
    output: { itemId: 'smelling-salts', quantity: 2 },
    skillRequired: { skillId: 'spirit', level: 7 },
    craftTime: 10,
    xpReward: 30,
    isUnlocked: true
  },
  {
    recipeId: 'herbal-remedy',
    name: 'Herbal Remedy',
    description: 'A versatile medicine that cures minor ailments',
    category: 'consumable',
    ingredients: [
      { itemId: 'herbs', quantity: 5 },
      { itemId: 'water', quantity: 2 }
    ],
    output: { itemId: 'herbal-remedy', quantity: 3 },
    skillRequired: { skillId: 'spirit', level: 4 },
    craftTime: 8,
    xpReward: 20,
    isUnlocked: true
  },
  {
    recipeId: 'war-paint',
    name: 'War Paint',
    description: 'Intimidating face paint that boosts morale in combat',
    category: 'consumable',
    ingredients: [
      { itemId: 'herbs', quantity: 3 },
      { itemId: 'animal-fat', quantity: 2 },
      { itemId: 'charcoal', quantity: 1 }
    ],
    output: { itemId: 'war-paint', quantity: 1 },
    skillRequired: { skillId: 'spirit', level: 5 },
    craftTime: 10,
    xpReward: 25,
    isUnlocked: true
  },
  {
    recipeId: 'liquid-courage',
    name: 'Liquid Courage',
    description: 'Strong whiskey that temporarily boosts bravery',
    category: 'consumable',
    ingredients: [
      { itemId: 'alcohol', quantity: 5 },
      { itemId: 'herbs', quantity: 2 }
    ],
    output: { itemId: 'liquid-courage', quantity: 2 },
    skillRequired: { skillId: 'spirit', level: 6 },
    craftTime: 10,
    xpReward: 28,
    isUnlocked: true
  },
  {
    recipeId: 'snake-oil',
    name: 'Snake Oil',
    description: 'Dubious tonic that might help... or might not',
    category: 'consumable',
    ingredients: [
      { itemId: 'snake-venom', quantity: 1 },
      { itemId: 'alcohol', quantity: 3 },
      { itemId: 'herbs', quantity: 3 }
    ],
    output: { itemId: 'snake-oil', quantity: 4 },
    skillRequired: { skillId: 'cunning', level: 8 },
    craftTime: 12,
    xpReward: 35,
    isUnlocked: true
  },
  {
    recipeId: 'campfire-stew',
    name: 'Campfire Stew',
    description: 'Hearty meal that restores health and energy',
    category: 'consumable',
    ingredients: [
      { itemId: 'meat', quantity: 3 },
      { itemId: 'herbs', quantity: 2 },
      { itemId: 'water', quantity: 1 }
    ],
    output: { itemId: 'campfire-stew', quantity: 2 },
    skillRequired: { skillId: 'craft', level: 3 },
    craftTime: 15,
    xpReward: 18,
    isUnlocked: true
  },
  {
    recipeId: 'tobacco-pouch',
    name: 'Tobacco Pouch',
    description: 'Fine smoking tobacco for relaxation',
    category: 'consumable',
    ingredients: [
      { itemId: 'tobacco', quantity: 5 },
      { itemId: 'leather-strip', quantity: 1 }
    ],
    output: { itemId: 'tobacco-pouch', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 2 },
    craftTime: 5,
    xpReward: 12,
    isUnlocked: true
  },

  // ========================================
  // MATERIALS (10)
  // ========================================
  {
    recipeId: 'leather-strip',
    name: 'Leather Strip',
    description: 'Basic leather strips cut from hide',
    category: 'material',
    ingredients: [
      { itemId: 'raw-hide', quantity: 2 }
    ],
    output: { itemId: 'leather-strip', quantity: 5 },
    skillRequired: { skillId: 'craft', level: 1 },
    craftTime: 3,
    xpReward: 5,
    isUnlocked: true
  },
  {
    recipeId: 'tanned-hide',
    name: 'Tanned Hide',
    description: 'Quality leather prepared for crafting',
    category: 'material',
    ingredients: [
      { itemId: 'raw-hide', quantity: 3 },
      { itemId: 'water', quantity: 2 },
      { itemId: 'salt', quantity: 1 }
    ],
    output: { itemId: 'tanned-hide', quantity: 2 },
    skillRequired: { skillId: 'craft', level: 5 },
    craftTime: 20,
    xpReward: 25,
    isUnlocked: true
  },
  {
    recipeId: 'gun-oil',
    name: 'Gun Oil',
    description: 'Protective oil for maintaining firearms',
    category: 'material',
    ingredients: [
      { itemId: 'animal-fat', quantity: 3 },
      { itemId: 'herbs', quantity: 1 }
    ],
    output: { itemId: 'gun-oil', quantity: 3 },
    skillRequired: { skillId: 'craft', level: 3 },
    craftTime: 10,
    xpReward: 15,
    isUnlocked: true
  },
  {
    recipeId: 'blackpowder',
    name: 'Blackpowder',
    description: 'Explosive powder for ammunition',
    category: 'material',
    ingredients: [
      { itemId: 'sulfur', quantity: 5 },
      { itemId: 'charcoal', quantity: 3 },
      { itemId: 'saltpeter', quantity: 2 }
    ],
    output: { itemId: 'blackpowder', quantity: 10 },
    skillRequired: { skillId: 'craft', level: 8 },
    craftTime: 15,
    xpReward: 40,
    isUnlocked: true
  },
  {
    recipeId: 'metal-ingot',
    name: 'Metal Ingot',
    description: 'Refined metal ready for forging',
    category: 'material',
    ingredients: [
      { itemId: 'iron-ore', quantity: 5 },
      { itemId: 'coal', quantity: 3 }
    ],
    output: { itemId: 'metal-ingot', quantity: 2 },
    skillRequired: { skillId: 'craft', level: 10 },
    craftTime: 30,
    xpReward: 50,
    isUnlocked: true
  },
  {
    recipeId: 'gold-ingot',
    name: 'Gold Ingot',
    description: 'Refined gold for valuable crafting',
    category: 'material',
    ingredients: [
      { itemId: 'gold-ore', quantity: 10 },
      { itemId: 'coal', quantity: 5 }
    ],
    output: { itemId: 'gold-ingot', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 20 },
    craftTime: 45,
    xpReward: 120,
    isUnlocked: true
  },
  {
    recipeId: 'rope',
    name: 'Rope',
    description: 'Strong rope woven from fiber',
    category: 'material',
    ingredients: [
      { itemId: 'hemp', quantity: 5 }
    ],
    output: { itemId: 'rope', quantity: 3 },
    skillRequired: { skillId: 'craft', level: 2 },
    craftTime: 10,
    xpReward: 10,
    isUnlocked: true
  },
  {
    recipeId: 'bandages',
    name: 'Bandages',
    description: 'Clean cloth strips for treating wounds',
    category: 'material',
    ingredients: [
      { itemId: 'cloth', quantity: 3 },
      { itemId: 'water', quantity: 1 }
    ],
    output: { itemId: 'bandages', quantity: 5 },
    skillRequired: { skillId: 'craft', level: 1 },
    craftTime: 5,
    xpReward: 8,
    isUnlocked: true
  },
  {
    recipeId: 'feathers',
    name: 'Feather Bundle',
    description: 'Cleaned feathers for fletching',
    category: 'material',
    ingredients: [
      { itemId: 'raw-feathers', quantity: 10 }
    ],
    output: { itemId: 'feathers', quantity: 5 },
    skillRequired: { skillId: 'craft', level: 2 },
    craftTime: 8,
    xpReward: 10,
    isUnlocked: true
  },
  {
    recipeId: 'metal-scrap',
    name: 'Metal Scrap',
    description: 'Salvaged metal pieces for basic crafting',
    category: 'material',
    ingredients: [
      { itemId: 'broken-weapon', quantity: 1 }
    ],
    output: { itemId: 'metal-scrap', quantity: 8 },
    skillRequired: { skillId: 'craft', level: 1 },
    craftTime: 5,
    xpReward: 5,
    isUnlocked: true
  },

  // ========================================
  // ARMOR (5)
  // ========================================
  {
    recipeId: 'leather-vest',
    name: 'Leather Vest',
    description: 'Basic protective vest made from tanned leather',
    category: 'armor',
    ingredients: [
      { itemId: 'tanned-hide', quantity: 4 },
      { itemId: 'leather-strip', quantity: 6 },
      { itemId: 'metal-scrap', quantity: 2 }
    ],
    output: { itemId: 'leather-vest', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 8 },
    craftTime: 25,
    xpReward: 40,
    isUnlocked: true
  },
  {
    recipeId: 'reinforced-boots',
    name: 'Reinforced Boots',
    description: 'Sturdy boots with metal reinforcement',
    category: 'armor',
    ingredients: [
      { itemId: 'tanned-hide', quantity: 3 },
      { itemId: 'metal-ingot', quantity: 1 },
      { itemId: 'rope', quantity: 2 }
    ],
    output: { itemId: 'reinforced-boots', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 10 },
    craftTime: 20,
    xpReward: 45,
    isUnlocked: true
  },
  {
    recipeId: 'gun-belt',
    name: 'Gun Belt',
    description: 'Quality gun belt with multiple holsters',
    category: 'armor',
    ingredients: [
      { itemId: 'tanned-hide', quantity: 2 },
      { itemId: 'leather-strip', quantity: 4 },
      { itemId: 'metal-scrap', quantity: 3 }
    ],
    output: { itemId: 'gun-belt', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 6 },
    craftTime: 15,
    xpReward: 30,
    isUnlocked: true
  },
  {
    recipeId: 'protective-duster',
    name: 'Protective Duster',
    description: 'Heavy coat with hidden armor plating',
    category: 'armor',
    ingredients: [
      { itemId: 'tanned-hide', quantity: 6 },
      { itemId: 'cloth', quantity: 8 },
      { itemId: 'metal-ingot', quantity: 3 }
    ],
    output: { itemId: 'protective-duster', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 18 },
    craftTime: 40,
    xpReward: 90,
    isUnlocked: true
  },
  {
    recipeId: 'war-shield',
    name: 'War Shield',
    description: 'Reinforced shield for blocking attacks',
    category: 'armor',
    ingredients: [
      { itemId: 'tanned-hide', quantity: 5 },
      { itemId: 'metal-ingot', quantity: 4 },
      { itemId: 'rope', quantity: 3 }
    ],
    output: { itemId: 'war-shield', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 15 },
    craftTime: 35,
    xpReward: 70,
    isUnlocked: true
  },

  // ========================================
  // AMMO (5)
  // ========================================
  {
    recipeId: 'revolver-rounds',
    name: 'Revolver Rounds',
    description: 'Standard ammunition for revolvers',
    category: 'ammo',
    ingredients: [
      { itemId: 'blackpowder', quantity: 2 },
      { itemId: 'metal-scrap', quantity: 3 },
      { itemId: 'lead', quantity: 2 }
    ],
    output: { itemId: 'revolver-rounds', quantity: 20 },
    skillRequired: { skillId: 'craft', level: 5 },
    craftTime: 10,
    xpReward: 20,
    isUnlocked: true
  },
  {
    recipeId: 'rifle-rounds',
    name: 'Rifle Rounds',
    description: 'Long-range ammunition for rifles',
    category: 'ammo',
    ingredients: [
      { itemId: 'blackpowder', quantity: 3 },
      { itemId: 'metal-ingot', quantity: 1 },
      { itemId: 'lead', quantity: 3 }
    ],
    output: { itemId: 'rifle-rounds', quantity: 15 },
    skillRequired: { skillId: 'craft', level: 8 },
    craftTime: 15,
    xpReward: 30,
    isUnlocked: true
  },
  {
    recipeId: 'shotgun-shells',
    name: 'Shotgun Shells',
    description: 'Buckshot shells for shotguns',
    category: 'ammo',
    ingredients: [
      { itemId: 'blackpowder', quantity: 4 },
      { itemId: 'metal-scrap', quantity: 5 },
      { itemId: 'lead', quantity: 4 }
    ],
    output: { itemId: 'shotgun-shells', quantity: 12 },
    skillRequired: { skillId: 'craft', level: 10 },
    craftTime: 15,
    xpReward: 35,
    isUnlocked: true
  },
  {
    recipeId: 'arrows',
    name: 'Arrows',
    description: 'Fletched arrows for bows',
    category: 'ammo',
    ingredients: [
      { itemId: 'feathers', quantity: 3 },
      { itemId: 'metal-scrap', quantity: 2 },
      { itemId: 'rope', quantity: 1 }
    ],
    output: { itemId: 'arrows', quantity: 25 },
    skillRequired: { skillId: 'craft', level: 4 },
    craftTime: 12,
    xpReward: 18,
    isUnlocked: true
  },
  {
    recipeId: 'throwing-knives',
    name: 'Throwing Knives',
    description: 'Balanced knives designed for throwing',
    category: 'ammo',
    ingredients: [
      { itemId: 'metal-ingot', quantity: 1 },
      { itemId: 'leather-strip', quantity: 2 }
    ],
    output: { itemId: 'throwing-knives', quantity: 5 },
    skillRequired: { skillId: 'craft', level: 7 },
    craftTime: 10,
    xpReward: 25,
    isUnlocked: true
  }
];

/**
 * Seed the database with recipes
 */
export async function seedRecipes(): Promise<void> {
  try {
    // Clear existing recipes
    await Recipe.deleteMany({});
    logger.info('Cleared existing recipes');

    // Insert new recipes
    await Recipe.insertMany(recipes);
    logger.info(`Seeded ${recipes.length} recipes`);

    // Log summary by category
    const categoryCounts = recipes.reduce((acc, recipe) => {
      acc[recipe.category] = (acc[recipe.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    logger.info('Recipe summary by category:', categoryCounts);
  } catch (error) {
    logger.error('Error seeding recipes:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  const mongoose = require('mongoose');
  const config = require('../config');

  mongoose
    .connect(config.MONGODB_URI)
    .then(async () => {
      logger.info('Connected to MongoDB');
      await seedRecipes();
      await mongoose.disconnect();
      logger.info('Disconnected from MongoDB');
      process.exit(0);
    })
    .catch((error: Error) => {
      logger.error('MongoDB connection error:', error);
      process.exit(1);
    });
}
