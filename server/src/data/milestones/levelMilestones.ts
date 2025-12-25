/**
 * Level Milestones Data
 * Defines rewards, features, and bonuses unlocked at each milestone level
 *
 * Sprint 7: Mid-Game Content System
 */

export interface MilestoneModifier {
  type: 'wilderness_income' | 'property_discount' | 'social_success' | 'all_stats' | 'crime_success' | 'combat_bonus';
  value: number; // Percentage as decimal (0.10 = 10%)
}

export interface MilestoneItem {
  itemId: string;
  quantity: number;
}

export interface LevelMilestone {
  level: number;
  title: string;
  description: string;
  feature?: string;           // Feature unlocked at this level
  item?: MilestoneItem;       // Item awarded at this level
  modifier?: MilestoneModifier; // Permanent stat modifier
  goldBonus?: number;         // One-time gold bonus
  xpBonus?: number;           // Bonus XP award
}

/**
 * Level Milestones - Every 5 levels from 5-50
 * These are gameplay rewards distinct from cosmetic unlocks in unlockTrigger.service
 */
export const LEVEL_MILESTONES: Record<number, LevelMilestone> = {
  5: {
    level: 5,
    title: 'Frontier Survivor',
    description: 'You have learned to hunt and forage in the wilderness.',
    feature: 'hunting',
    modifier: { type: 'wilderness_income', value: 0.10 },
    xpBonus: 100,
  },
  10: {
    level: 10,
    title: 'Gang Founder',
    description: 'You can now create or lead a gang of outlaws.',
    feature: 'gang_creation',
    goldBonus: 500,
    xpBonus: 200,
  },
  15: {
    level: 15,
    title: 'Property Owner',
    description: 'Land ownership opportunities are now available to you.',
    feature: 'property',
    modifier: { type: 'property_discount', value: 0.20 },
    xpBonus: 300,
  },
  20: {
    level: 20,
    title: 'Bounty Hunter',
    description: 'The marshal has authorized you to hunt wanted criminals.',
    feature: 'bounty_hunting',
    item: { itemId: 'bounty-hunters-spyglass', quantity: 1 },
    goldBonus: 1000,
    xpBonus: 500,
  },
  25: {
    level: 25,
    title: 'Prospector',
    description: 'You can now stake mining claims in gold country.',
    feature: 'mining_claims',
    item: { itemId: 'mining-claim-deed', quantity: 1 },
    goldBonus: 2000,
    xpBonus: 750,
  },
  30: {
    level: 30,
    title: 'Trail Boss',
    description: 'Lead cattle drives across the frontier for big profits.',
    feature: 'cattle_drives',
    item: { itemId: 'ranchers-lasso', quantity: 1 },
    goldBonus: 3000,
    xpBonus: 1000,
  },
  35: {
    level: 35,
    title: 'The Fixer',
    description: 'Access to premium contracts for high-stakes jobs.',
    feature: 'contracts_board',
    item: { itemId: 'fixers-coat', quantity: 1 },
    modifier: { type: 'crime_success', value: 0.10 },
    goldBonus: 5000,
    xpBonus: 1500,
  },
  40: {
    level: 40,
    title: 'VIP',
    description: 'Elite access to exclusive establishments and opportunities.',
    feature: 'elite_access',
    item: { itemId: 'vip-saloon-key', quantity: 1 },
    modifier: { type: 'social_success', value: 0.15 },
    goldBonus: 7500,
    xpBonus: 2000,
  },
  45: {
    level: 45,
    title: 'Scar Walker',
    description: 'You are ready to venture into the corrupted Scar zones.',
    feature: 'scar_expedition',
    item: { itemId: 'scar-expedition-map', quantity: 1 },
    modifier: { type: 'combat_bonus', value: 0.05 },
    goldBonus: 10000,
    xpBonus: 3000,
  },
  50: {
    level: 50,
    title: 'Legend',
    description: 'You have reached the pinnacle. Prestige awaits.',
    feature: 'prestige_eligible',
    item: { itemId: 'legendary-duster', quantity: 1 },
    modifier: { type: 'all_stats', value: 0.05 },
    goldBonus: 25000,
    xpBonus: 5000,
  },
};

/**
 * Get milestone for a specific level
 */
export function getMilestone(level: number): LevelMilestone | undefined {
  return LEVEL_MILESTONES[level];
}

/**
 * Get all milestone levels
 */
export function getMilestoneLevels(): number[] {
  return Object.keys(LEVEL_MILESTONES).map(Number).sort((a, b) => a - b);
}

/**
 * Check if a level is a milestone level
 */
export function isMilestoneLevel(level: number): boolean {
  return level in LEVEL_MILESTONES;
}

/**
 * Get the next milestone level after the current level
 */
export function getNextMilestoneLevel(currentLevel: number): number | null {
  const levels = getMilestoneLevels();
  const nextMilestone = levels.find(l => l > currentLevel);
  return nextMilestone || null;
}
