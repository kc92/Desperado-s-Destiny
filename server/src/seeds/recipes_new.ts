/**
 * New Crafting Recipes
 */

import { Recipe } from '../models/Recipe.model';
import logger from '../utils/logger';

const toolRecipeGenerator = () => {
    const tools = [
        { id: 'blacksmith', name: 'Blacksmith\'s Hammer', skill: 'craft' },
        { id: 'leatherworker', name: 'Tanner\'s Knife', skill: 'craft' },
        { id: 'alchemist', name: 'Alchemist\'s Stirrer', skill: 'spirit' },
        { id: 'cook', name: 'Chef\'s Knife', skill: 'craft' },
        { id: 'tailor', name: 'Sewing Kit', skill: 'craft' },
        { id: 'gunsmith', name: 'Gunsmith\'s Tools', skill: 'craft' },
    ];
    const qualities = [
        { name: 'Good', level: 20, ingredients: [{ itemId: 'steel-ingot', quantity: 2 }], xp: 50 },
        { name: 'Fine', level: 40, ingredients: [{ itemId: 'steel-ingot', quantity: 5 }, { itemId: 'treated-leather', quantity: 2 }], xp: 100 },
        { name: 'Masterwork', level: 60, ingredients: [{ itemId: 'starmetal-ingot', quantity: 1 }, { itemId: 'exotic-leather', quantity: 2 }], xp: 200 },
        { name: 'Legendary', level: 80, ingredients: [{ itemId: 'starmetal-ingot', quantity: 5 }, { itemId: 'exotic-leather', quantity: 5 }], xp: 500 },
    ];

    let recipes = [];
    for (const tool of tools) {
        for (const quality of qualities) {
            const prevQuality = quality.name === 'Good' ? 'basic' : qualities[qualities.indexOf(quality) - 1].name.toLowerCase();
            recipes.push({
                recipeId: `recipe-tool-${tool.id}-${quality.name.toLowerCase()}`,
                name: `${quality.name} ${tool.name}`,
                description: `Craft a ${quality.name} ${tool.name}.`,
                category: 'weapon',
                ingredients: [{ itemId: `tool-${tool.id}-${prevQuality}`, quantity: 1 }, ...quality.ingredients],
                output: { itemId: `tool-${tool.id}-${quality.name.toLowerCase()}`, quantity: 1 },
                skillRequired: { skillId: tool.skill, level: quality.level },
                craftTime: quality.level * 1.5,
                xpReward: quality.xp,
                isUnlocked: true,
            });
        }
    }
    return recipes;
};

const newRecipes = [
  // ========================================
  // REFINED MATERIALS
  // ========================================
  {
    recipeId: 'recipe-silver-ingot',
    name: 'Silver Ingot',
    description: 'Refine silver ore into a pure ingot.',
    category: 'material',
    ingredients: [{ itemId: 'silver-ore', quantity: 2 }],
    output: { itemId: 'silver-ingot', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 10 },
    craftTime: 10,
    xpReward: 15,
    isUnlocked: true
  },
  {
    recipeId: 'recipe-gold-ingot',
    name: 'Gold Ingot',
    description: 'Refine gold nuggets into a pure ingot.',
    category: 'material',
    ingredients: [{ itemId: 'gold-nugget', quantity: 2 }],
    output: { itemId: 'gold-ingot', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 20 },
    craftTime: 15,
    xpReward: 30,
    isUnlocked: true
  },
  {
    recipeId: 'recipe-glass-pane',
    name: 'Glass Pane',
    description: 'Smelt sand into a clear glass pane.',
    category: 'material',
    ingredients: [{ itemId: 'sand', quantity: 5 }],
    output: { itemId: 'glass-pane', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 5 },
    craftTime: 8,
    xpReward: 10,
    isUnlocked: true
  },
  {
    recipeId: 'recipe-cured-leather',
    name: 'Cured Leather',
    description: 'Process poor hides into usable leather.',
    category: 'material',
    ingredients: [{ itemId: 'hide-poor', quantity: 2 }],
    output: { itemId: 'cured-leather', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 5 },
    craftTime: 5,
    xpReward: 8,
    isUnlocked: true
  },
  {
    recipeId: 'recipe-treated-leather',
    name: 'Treated Leather',
    description: 'Tan good hides into durable treated leather.',
    category: 'material',
    ingredients: [{ itemId: 'hide-good', quantity: 2 }],
    output: { itemId: 'treated-leather', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 15 },
    craftTime: 12,
    xpReward: 20,
    isUnlocked: true
  },
  {
    recipeId: 'recipe-exotic-leather',
    name: 'Exotic Leather',
    description: 'Carefully treat the skin of a rare creature.',
    category: 'material',
    ingredients: [{ itemId: 'rattlesnake-skin', quantity: 1 }],
    output: { itemId: 'exotic-leather', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 25 },
    craftTime: 20,
    xpReward: 50,
    isUnlocked: true
  },
  {
    recipeId: 'recipe-linen-cloth',
    name: 'Linen Cloth',
    description: 'Weave raw flax into a bolt of linen cloth.',
    category: 'material',
    ingredients: [{ itemId: 'raw-flax', quantity: 3 }],
    output: { itemId: 'linen-cloth', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 5 },
    craftTime: 6,
    xpReward: 9,
    isUnlocked: true
  },
  {
    recipeId: 'recipe-wool-bolt',
    name: 'Wool Bolt',
    description: 'Spin raw wool into a bolt of warm fabric.',
    category: 'material',
    ingredients: [{ itemId: 'raw-wool', quantity: 3 }],
    output: { itemId: 'wool-bolt', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 6 },
    craftTime: 7,
    xpReward: 10,
    isUnlocked: true
  },
  // ========================================
  // COMPONENTS
  // ========================================
  {
    recipeId: 'recipe-blade-blank',
    name: 'Blade Blank',
    description: 'Forge an ingot into a rough blade.',
    category: 'material',
    ingredients: [{ itemId: 'iron-ingot', quantity: 2 }],
    output: { itemId: 'blade-blank', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 12 },
    craftTime: 10,
    xpReward: 15,
    isUnlocked: true
  },
  {
    recipeId: 'recipe-axe-head',
    name: 'Axe Head',
    description: 'Forge an ingot into a heavy axe head.',
    category: 'material',
    ingredients: [{ itemId: 'iron-ingot', quantity: 3 }],
    output: { itemId: 'axe-head', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 14 },
    craftTime: 12,
    xpReward: 18,
    isUnlocked: true
  },
  {
    recipeId: 'recipe-rifle-barrel',
    name: 'Rifle Barrel',
    description: 'Forge a steel ingot into a rifle barrel.',
    category: 'material',
    ingredients: [{ itemId: 'steel-ingot', quantity: 2 }],
    output: { itemId: 'rifle-barrel', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 22 },
    craftTime: 25,
    xpReward: 40,
    isUnlocked: true
  },
  {
    recipeId: 'recipe-gun-stock',
    name: 'Gun Stock',
    description: 'Carve a sturdy stock from wood planks.',
    category: 'material',
    ingredients: [{ itemId: 'wood-plank', quantity: 4 }],
    output: { itemId: 'gun-stock', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 8 },
    craftTime: 10,
    xpReward: 12,
    isUnlocked: true
  },
  {
    recipeId: 'recipe-boot-sole',
    name: 'Boot Sole',
    description: 'Cut and treat leather into a tough sole.',
    category: 'material',
    ingredients: [{ itemId: 'cured-leather', quantity: 2 }],
    output: { itemId: 'boot-sole', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 7 },
    craftTime: 5,
    xpReward: 9,
    isUnlocked: true
  },
  {
    recipeId: 'recipe-buckle',
    name: 'Iron Buckle',
    description: 'Forge a simple buckle from iron.',
    category: 'material',
    ingredients: [{ itemId: 'iron-ingot', quantity: 1 }],
    output: { itemId: 'buckle', quantity: 1 },
    skillRequired: { skillId: 'craft', level: 9 },
    craftTime: 6,
    xpReward: 11,
    isUnlocked: true
  },
  {
    recipeId: 'recipe-empty-vial',
    name: 'Empty Vial',
    description: 'Blow a glass pane into a small vial.',
    category: 'material',
    ingredients: [{ itemId: 'glass-pane', quantity: 1 }],
    output: { itemId: 'empty-vial', quantity: 2 },
    skillRequired: { skillId: 'craft', level: 11 },
    craftTime: 8,
    xpReward: 14,
    isUnlocked: true
  },
  // ========================================
  // GRIT OF THE FRONTIER
  // ========================================
  {
      recipeId: 'recipe-geologists-loupe',
      name: 'Geologist\'s Loupe',
      description: 'Assemble a high-quality magnifying glass.',
      category: 'armor',
      ingredients: [{ itemId: 'lens', quantity: 1 }, { itemId: 'iron-fittings', quantity: 1 }, { itemId: 'cured-leather', quantity: 1 }],
      output: { itemId: 'geologists-loupe', quantity: 1 },
      skillRequired: { skillId: 'craft', level: 15 },
      craftTime: 20,
      xpReward: 30,
      isUnlocked: true
  },
  {
      recipeId: 'recipe-reinforced-mining-helmet',
      name: 'Reinforced Mining Helmet',
      description: 'Reinforce a standard helmet with steel plating.',
      category: 'armor',
      ingredients: [{ itemId: 'leather-vest', quantity: 1 }, { itemId: 'steel-ingot', quantity: 2 }],
      output: { itemId: 'reinforced-mining-helmet', quantity: 1 },
      skillRequired: { skillId: 'craft', level: 18 },
      craftTime: 25,
      xpReward: 40,
      isUnlocked: true
  },
  // ========================================
  // NATIVE TRIBES
  // ========================================
  {
      recipeId: 'recipe-spirit-guides-headdress',
      name: 'Spirit Guide\'s Headdress',
      description: 'Assemble a sacred headdress.',
      category: 'armor',
      ingredients: [{ itemId: 'feathers', quantity: 10 }, { itemId: 'treated-leather', quantity: 2 }, { itemId: 'silver-ingot', quantity: 1 }],
      output: { itemId: 'spirit-guides-headdress', quantity: 1 },
      skillRequired: { skillId: 'spirit', level: 25 },
      craftTime: 45,
      xpReward: 80,
      isUnlocked: true
  },
    // ========================================
    // CONTESTED LANDS
    // ========================================
    { recipeId: 'recipe-warlords-helm', name: 'Warlord\'s Helm', description: 'Forge a helm of starmetal and exotic leather.', category: 'armor', ingredients: [{ itemId: 'starmetal-ingot', quantity: 5 }, { itemId: 'exotic-leather', quantity: 2 }], output: { itemId: 'warlords-helm', quantity: 1 }, skillRequired: { skillId: 'craft', level: 80 }, craftTime: 120, xpReward: 1000, isUnlocked: false },
    // ========================================
    // DEFENDER
    // ========================================
    { recipeId: 'recipe-bulwarks-shield', name: 'Bulwark\'s Shield', description: 'Construct a massive defensive shield.', category: 'weapon', ingredients: [{ itemId: 'wood-plank', quantity: 10 }, { itemId: 'steel-ingot', quantity: 5 }], output: { itemId: 'bulwarks-shield', quantity: 1 }, skillRequired: { skillId: 'craft', level: 50 }, craftTime: 60, xpReward: 300, isUnlocked: true },
    // ========================================
    // SUPPORT
    // ========================================
    { recipeId: 'recipe-doctors-bag', name: 'Doctor\'s Bag', description: 'Craft a bag for a field surgeon.', category: 'armor', ingredients: [{ itemId: 'treated-leather', quantity: 5 }, { itemId: 'linen-cloth', quantity: 5 }, { itemId: 'silver-ingot', quantity: 1 }], output: { itemId: 'doctors-bag', quantity: 1 }, skillRequired: { skillId: 'craft', level: 30 }, craftTime: 40, xpReward: 150, isUnlocked: true },
    // ========================================
    // DEBUFFER
    // ========================================
    { recipeId: 'recipe-vipers-kiss-darts', name: 'Viper\'s Kiss Darts', description: 'Coat darts with a potent neurotoxin.', category: 'consumable', ingredients: [{ itemId: 'snake-venom', quantity: 5 }, { itemId: 'iron-fittings', quantity: 1 }], output: { itemId: 'vipers-kiss-darts', quantity: 5 }, skillRequired: { skillId: 'cunning', level: 40 }, craftTime: 30, xpReward: 200, isUnlocked: false },
    // ========================================
    // TIERED GEAR
    // ======================================== 
    { recipeId: 'recipe-rough-iron-helmet', name: 'Rough Iron Helmet', ingredients: [{ itemId: 'iron-ingot', quantity: 3 }, { itemId: 'cured-leather', quantity: 1 }], output: { itemId: 'rough-iron-helmet', quantity: 1 }, skillRequired: { skillId: 'craft', level: 5 }, craftTime: 15, xpReward: 20, isUnlocked: true },
    { recipeId: 'recipe-rough-iron-cuirass', name: 'Rough Iron Cuirass', ingredients: [{ itemId: 'iron-ingot', quantity: 5 }, { itemId: 'cured-leather', quantity: 2 }], output: { itemId: 'rough-iron-cuirass', quantity: 1 }, skillRequired: { skillId: 'craft', level: 7 }, craftTime: 25, xpReward: 35, isUnlocked: true },
    { recipeId: 'recipe-hardened-steel-helmet', name: 'Hardened Steel Helmet', ingredients: [{ itemId: 'steel-ingot', quantity: 3 }, { itemId: 'treated-leather', quantity: 1 }], output: { itemId: 'hardened-steel-helmet', quantity: 1 }, skillRequired: { skillId: 'craft', level: 15 }, craftTime: 30, xpReward: 60, isUnlocked: true },
];

newRecipes.push(...toolRecipeGenerator());

/**
 * Seed the database with new recipes
 */
export async function seedNewRecipes(): Promise<void> {
  try {
    const recipeCount = await Recipe.countDocuments();
    if (recipeCount > 150) { // Increased threshold
        logger.info('Recipes already seeded. Skipping.');
        return;
    }

    await Recipe.insertMany(newRecipes, { ordered: false });
    logger.info(`Seeded ${newRecipes.length} new recipes`);

  } catch (error) {
    if (error.code === 11000) {
        logger.warn('Some new recipes already existed, skipping duplicate entries.');
    } else {
        logger.error('Error seeding new recipes:', error);
        throw error;
    }
  }
}