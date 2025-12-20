/**
 * Login Rewards Data
 * Phase B - Competitor Parity Plan
 *
 * Defines all 28 days of login rewards across 4 weeks
 * Each week follows the same pattern but with increasing value multipliers:
 * - Week 1: Base values (1x)
 * - Week 2: +50% value (1.5x)
 * - Week 3: +100% value (2x)
 * - Week 4: +150% value (2.5x) + monthly bonus on day 28
 */

import { RewardItem, RewardType } from '../models/LoginReward.model';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * Week multipliers for reward scaling
 */
export const WEEK_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  2: 1.5,
  3: 2.0,
  4: 2.5
};

/**
 * Base reward definitions for each day of the week
 * Day 1: Gold
 * Day 2: Random common item
 * Day 3: Gold (higher)
 * Day 4: Energy refill
 * Day 5: Rare crafting material
 * Day 6: Gold (highest)
 * Day 7: Premium reward (random from pool)
 */
export interface DayRewardDefinition {
  day: number; // 1-7
  type: RewardType;
  baseAmount?: number;
  description: string;
  icon: string;
}

export const BASE_DAILY_REWARDS: DayRewardDefinition[] = [
  {
    day: 1,
    type: 'dollars',
    baseAmount: 50,
    description: 'Daily dollar bonus',
    icon: 'dollars'
  },
  {
    day: 2,
    type: 'item',
    description: 'Random common item',
    icon: 'item'
  },
  {
    day: 3,
    type: 'dollars',
    baseAmount: 100,
    description: 'Generous dollar bonus',
    icon: 'dollars'
  },
  {
    day: 4,
    type: 'energy',
    baseAmount: 100,
    description: 'Full energy refill',
    icon: 'energy'
  },
  {
    day: 5,
    type: 'material',
    description: 'Rare crafting material',
    icon: 'material'
  },
  {
    day: 6,
    type: 'dollars',
    baseAmount: 200,
    description: 'Substantial dollar bonus',
    icon: 'dollars'
  },
  {
    day: 7,
    type: 'premium',
    description: 'Premium weekly reward',
    icon: 'premium'
  }
];

/**
 * Common items pool for Day 2 rewards
 */
export interface CommonItemReward {
  itemId: string;
  itemName: string;
  rarity: 'common';
  weight: number; // Probability weight
}

export const COMMON_ITEMS_POOL: CommonItemReward[] = [
  { itemId: 'bandage', itemName: 'Bandage', rarity: 'common', weight: 20 },
  { itemId: 'whiskey-bottle', itemName: 'Whiskey Bottle', rarity: 'common', weight: 20 },
  { itemId: 'tobacco-pouch', itemName: 'Tobacco Pouch', rarity: 'common', weight: 15 },
  { itemId: 'rusty-knife', itemName: 'Rusty Knife', rarity: 'common', weight: 10 },
  { itemId: 'worn-boots', itemName: 'Worn Boots', rarity: 'common', weight: 10 },
  { itemId: 'oil-lamp', itemName: 'Oil Lamp', rarity: 'common', weight: 10 },
  { itemId: 'rope-bundle', itemName: 'Rope Bundle', rarity: 'common', weight: 8 },
  { itemId: 'canteen', itemName: 'Canteen', rarity: 'common', weight: 7 }
];

/**
 * Crafting materials pool for Day 5 rewards (scales with week)
 */
export interface MaterialReward {
  itemId: string;
  itemName: string;
  rarity: 'uncommon' | 'rare' | 'epic';
  weekMin: number; // Minimum week to appear
  weight: number;
}

export const MATERIALS_POOL: MaterialReward[] = [
  // Week 1+ materials
  { itemId: 'iron-ore', itemName: 'Iron Ore', rarity: 'uncommon', weekMin: 1, weight: 25 },
  { itemId: 'leather-strip', itemName: 'Leather Strip', rarity: 'uncommon', weekMin: 1, weight: 25 },
  { itemId: 'gunpowder-pouch', itemName: 'Gunpowder Pouch', rarity: 'uncommon', weekMin: 1, weight: 20 },
  { itemId: 'silver-nugget', itemName: 'Silver Nugget', rarity: 'uncommon', weekMin: 1, weight: 15 },

  // Week 2+ materials
  { itemId: 'refined-steel', itemName: 'Refined Steel', rarity: 'rare', weekMin: 2, weight: 20 },
  { itemId: 'pristine-leather', itemName: 'Pristine Leather', rarity: 'rare', weekMin: 2, weight: 18 },
  { itemId: 'gold-dust', itemName: 'Gold Dust', rarity: 'rare', weekMin: 2, weight: 15 },

  // Week 3+ materials
  { itemId: 'damascus-steel', itemName: 'Damascus Steel', rarity: 'rare', weekMin: 3, weight: 12 },
  { itemId: 'ancient-bone', itemName: 'Ancient Bone', rarity: 'rare', weekMin: 3, weight: 10 },
  { itemId: 'mystic-essence', itemName: 'Mystic Essence', rarity: 'epic', weekMin: 3, weight: 8 },

  // Week 4 only materials
  { itemId: 'stardust', itemName: 'Stardust', rarity: 'epic', weekMin: 4, weight: 10 },
  { itemId: 'phoenix-feather', itemName: 'Phoenix Feather', rarity: 'epic', weekMin: 4, weight: 5 }
];

/**
 * Premium rewards pool for Day 7 (with probability weights)
 */
export interface PremiumReward {
  itemId: string;
  itemName: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  type: 'horse' | 'weapon' | 'cosmetic' | 'recipe' | 'currency' | 'legendary';
  weight: number; // Base probability weight
  weekMin?: number; // Minimum week to appear (default 1)
  description: string;
}

export const PREMIUM_REWARDS_POOL: PremiumReward[] = [
  // Common Horse (25% base chance)
  {
    itemId: 'standard-mustang',
    itemName: 'Standard Mustang',
    rarity: 'common',
    type: 'horse',
    weight: 25,
    description: 'A reliable frontier horse'
  },

  // Uncommon Weapons (25% base chance, split among options)
  {
    itemId: 'iron-revolver',
    itemName: 'Iron Revolver',
    rarity: 'uncommon',
    type: 'weapon',
    weight: 8,
    description: 'A dependable sidearm'
  },
  {
    itemId: 'hunting-rifle',
    itemName: 'Hunting Rifle',
    rarity: 'uncommon',
    type: 'weapon',
    weight: 9,
    description: 'Accurate at long range'
  },
  {
    itemId: 'double-barrel',
    itemName: 'Double-Barrel Shotgun',
    rarity: 'uncommon',
    type: 'weapon',
    weight: 8,
    description: 'Devastating at close range'
  },

  // Rare Hat/Cosmetics (20% base chance)
  {
    itemId: 'wide-brim-hat',
    itemName: 'Wide-Brim Hat',
    rarity: 'rare',
    type: 'cosmetic',
    weight: 7,
    description: 'A stylish frontier hat'
  },
  {
    itemId: 'bandana-collection',
    itemName: 'Bandana Collection',
    rarity: 'rare',
    type: 'cosmetic',
    weight: 7,
    description: 'Various bandana styles'
  },
  {
    itemId: 'fancy-boots',
    itemName: 'Fancy Boots',
    rarity: 'rare',
    type: 'cosmetic',
    weight: 6,
    description: 'Ornate leather boots'
  },

  // Crafting Recipes (15% base chance)
  {
    itemId: 'gunsmith-recipe-basic',
    itemName: 'Gunsmith Recipe: Basic',
    rarity: 'rare',
    type: 'recipe',
    weight: 5,
    description: 'Learn to craft basic weapons'
  },
  {
    itemId: 'blacksmith-recipe-basic',
    itemName: 'Blacksmith Recipe: Basic',
    rarity: 'rare',
    type: 'recipe',
    weight: 5,
    description: 'Learn to craft basic tools'
  },
  {
    itemId: 'tailor-recipe-basic',
    itemName: 'Tailor Recipe: Basic',
    rarity: 'rare',
    type: 'recipe',
    weight: 5,
    description: 'Learn to craft basic clothing'
  },

  // Premium Currency (10% base chance)
  {
    itemId: 'premium-tokens-10',
    itemName: 'Premium Tokens x10',
    rarity: 'epic',
    type: 'currency',
    weight: 10,
    description: '10 premium tokens for special purchases'
  },

  // Legendary Items (5% base chance, week 3+ only)
  {
    itemId: 'legendary-stallion',
    itemName: 'Legendary Stallion',
    rarity: 'legendary',
    type: 'legendary',
    weight: 2,
    weekMin: 3,
    description: 'A magnificent legendary horse'
  },
  {
    itemId: 'golden-revolver',
    itemName: 'Golden Revolver',
    rarity: 'legendary',
    type: 'legendary',
    weight: 2,
    weekMin: 3,
    description: 'A beautifully crafted golden weapon'
  },
  {
    itemId: 'legendary-duster',
    itemName: 'Legendary Duster Coat',
    rarity: 'legendary',
    type: 'legendary',
    weight: 1,
    weekMin: 4,
    description: 'An iconic frontier coat'
  }
];

/**
 * Monthly bonus reward for completing all 28 days
 */
export interface MonthlyBonusReward {
  gold: number;
  premiumTokens: number;
  specialItem: {
    itemId: string;
    itemName: string;
    rarity: 'epic' | 'legendary';
    description: string;
  };
}

export const MONTHLY_BONUS: MonthlyBonusReward = {
  gold: 1000,
  premiumTokens: 25,
  specialItem: {
    itemId: 'monthly-champion-badge',
    itemName: 'Monthly Champion Badge',
    rarity: 'epic',
    description: 'A badge commemorating your dedication'
  }
};

/**
 * Generate the full 28-day reward calendar
 */
export interface CalendarDay {
  absoluteDay: number; // 1-28
  dayOfWeek: number; // 1-7
  week: number; // 1-4
  baseReward: DayRewardDefinition;
  multiplier: number;
  description: string;
}

export function generateRewardCalendar(): CalendarDay[] {
  const calendar: CalendarDay[] = [];

  for (let week = 1; week <= 4; week++) {
    const multiplier = WEEK_MULTIPLIERS[week];

    for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
      const absoluteDay = (week - 1) * 7 + dayOfWeek;
      const baseReward = BASE_DAILY_REWARDS[dayOfWeek - 1];

      let description = baseReward.description;
      if (baseReward.baseAmount) {
        const scaledAmount = Math.floor(baseReward.baseAmount * multiplier);
        description = `${scaledAmount} gold`;
      }

      calendar.push({
        absoluteDay,
        dayOfWeek,
        week,
        baseReward,
        multiplier,
        description
      });
    }
  }

  return calendar;
}

/**
 * Get the reward definition for a specific day
 */
export function getRewardForDay(absoluteDay: number): CalendarDay | null {
  if (absoluteDay < 1 || absoluteDay > 28) {
    return null;
  }

  const week = Math.ceil(absoluteDay / 7);
  const dayOfWeek = ((absoluteDay - 1) % 7) + 1;
  const multiplier = WEEK_MULTIPLIERS[week];
  const baseReward = BASE_DAILY_REWARDS[dayOfWeek - 1];

  let description = baseReward.description;
  if (baseReward.baseAmount) {
    const scaledAmount = Math.floor(baseReward.baseAmount * multiplier);
    description = `${scaledAmount} gold`;
  }

  return {
    absoluteDay,
    dayOfWeek,
    week,
    baseReward,
    multiplier,
    description
  };
}

/**
 * Randomly select from weighted pool
 */
export function selectWeightedRandom<T extends { weight: number }>(pool: T[]): T {
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
  let random = SecureRNG.range(1, totalWeight);

  for (const item of pool) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }

  // Fallback to last item
  return pool[pool.length - 1];
}

/**
 * Generate a concrete reward item for a specific day
 */
export function generateRewardItem(absoluteDay: number): RewardItem | null {
  const dayInfo = getRewardForDay(absoluteDay);
  if (!dayInfo) return null;

  const { baseReward, multiplier, week } = dayInfo;

  switch (baseReward.type) {
    case 'dollars': {
      const amount = Math.floor((baseReward.baseAmount || 50) * multiplier);
      return {
        type: 'dollars',
        amount,
        description: `$${amount}`
      };
    }

    case 'item': {
      const item = selectWeightedRandom(COMMON_ITEMS_POOL);
      return {
        type: 'item',
        itemId: item.itemId,
        itemName: item.itemName,
        rarity: item.rarity,
        description: `Common item: ${item.itemName}`
      };
    }

    case 'energy': {
      // Energy scales with multiplier but caps reasonably
      const baseEnergy = baseReward.baseAmount || 100;
      const amount = Math.min(Math.floor(baseEnergy * multiplier), 250);
      return {
        type: 'energy',
        amount,
        description: `${amount} energy restored`
      };
    }

    case 'material': {
      // Filter materials by week requirement
      const availableMaterials = MATERIALS_POOL.filter(m => m.weekMin <= week);
      const material = selectWeightedRandom(availableMaterials);
      return {
        type: 'material',
        itemId: material.itemId,
        itemName: material.itemName,
        rarity: material.rarity,
        description: `Crafting material: ${material.itemName}`
      };
    }

    case 'premium': {
      // Filter premium rewards by week requirement
      const availablePremium = PREMIUM_REWARDS_POOL.filter(p => (p.weekMin || 1) <= week);
      const premium = selectWeightedRandom(availablePremium);
      return {
        type: 'premium',
        itemId: premium.itemId,
        itemName: premium.itemName,
        rarity: premium.rarity,
        description: premium.description
      };
    }

    default:
      return null;
  }
}

/**
 * Get all premium reward possibilities for display
 */
export function getPremiumRewardPossibilities(week: number): PremiumReward[] {
  return PREMIUM_REWARDS_POOL.filter(p => (p.weekMin || 1) <= week);
}

/**
 * Calculate the probability of each premium reward
 */
export function getPremiumRewardProbabilities(week: number): { reward: PremiumReward; probability: number }[] {
  const available = getPremiumRewardPossibilities(week);
  const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);

  return available.map(reward => ({
    reward,
    probability: (reward.weight / totalWeight) * 100
  }));
}

/**
 * Full 28-day reward calendar (pre-generated for quick access)
 */
export const REWARD_CALENDAR = generateRewardCalendar();

/**
 * Get week name for display
 */
export function getWeekName(week: number): string {
  const names: Record<number, string> = {
    1: 'First Week',
    2: 'Second Week',
    3: 'Third Week',
    4: 'Fourth Week (Final)'
  };
  return names[week] || `Week ${week}`;
}

/**
 * Get reward type display name
 */
export function getRewardTypeName(type: RewardType): string {
  const names: Record<RewardType, string> = {
    dollars: 'Dollars',
    item: 'Item',
    energy: 'Energy',
    material: 'Material',
    premium: 'Premium Reward'
  };
  return names[type] || type;
}
