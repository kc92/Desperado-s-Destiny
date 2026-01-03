/**
 * Gang Upgrade Utilities
 *
 * Cost calculations and benefits for gang upgrade system
 */

import { GangUpgradeType, GANG_UPGRADE_MAX_LEVELS, GANG_CONSTRAINTS } from '@desperados/shared';

/**
 * Calculate cost for upgrading a specific gang upgrade type
 *
 * Formulas (level² scaling):
 * - Vault Size: 1000 × level² gold
 * - Member Slots: 2000 × level² gold
 * - War Chest: 1500 × level² gold
 * - Perk Booster: 5000 × level² gold
 *
 * @param upgradeType - Type of upgrade
 * @param currentLevel - Current upgrade level (0-based, next level will be currentLevel + 1)
 * @returns Cost in gold for the next level
 */
export function calculateUpgradeCost(
  upgradeType: GangUpgradeType,
  currentLevel: number
): number {
  const nextLevel = currentLevel + 1;

  const costMultipliers: Record<GangUpgradeType, number> = {
    [GangUpgradeType.VAULT_SIZE]: 1000,
    [GangUpgradeType.MEMBER_SLOTS]: 2000,
    [GangUpgradeType.WAR_CHEST]: 1500,
    [GangUpgradeType.PERK_BOOSTER]: 5000,
    [GangUpgradeType.TRAINING_GROUNDS]: 3000, // 3K, 12K, 27K for levels 1-3
  };

  const multiplier = costMultipliers[upgradeType];
  return multiplier * (nextLevel * nextLevel);
}

/**
 * Get the benefit value for a specific upgrade type at a given level
 *
 * Benefits:
 * - Vault Size: 10,000 × level capacity
 * - Member Slots: 15 + (5 × level) members
 * - War Chest: 5,000 × level war funding
 * - Perk Booster: 1 + (0.1 × level) multiplier
 *
 * @param upgradeType - Type of upgrade
 * @param level - Current upgrade level
 * @returns Benefit value
 */
export function getUpgradeBenefit(upgradeType: GangUpgradeType, level: number): number {
  switch (upgradeType) {
    case GangUpgradeType.VAULT_SIZE:
      return 10000 * level;
    case GangUpgradeType.MEMBER_SLOTS:
      return GANG_CONSTRAINTS.BASE_MEMBER_SLOTS + 5 * level;
    case GangUpgradeType.WAR_CHEST:
      return 5000 * level;
    case GangUpgradeType.PERK_BOOSTER:
      return 1 + 0.1 * level;
    case GangUpgradeType.TRAINING_GROUNDS:
      // 5% per level: L1=5%, L2=10%, L3=15% training time reduction
      return 0.05 * level;
    default:
      return 0;
  }
}

/**
 * Get maximum level for a specific upgrade type
 *
 * @param upgradeType - Type of upgrade
 * @returns Maximum level
 */
export function getMaxLevel(upgradeType: GangUpgradeType): number {
  return GANG_UPGRADE_MAX_LEVELS[upgradeType];
}

/**
 * Check if an upgrade can be leveled up
 *
 * @param upgradeType - Type of upgrade
 * @param currentLevel - Current level
 * @returns True if can be upgraded
 */
export function canUpgrade(upgradeType: GangUpgradeType, currentLevel: number): boolean {
  return currentLevel < getMaxLevel(upgradeType);
}

/**
 * Calculate all upgrade costs from level 1 to max for reference
 *
 * @param upgradeType - Type of upgrade
 * @returns Array of costs for each level
 */
export function getAllUpgradeCosts(upgradeType: GangUpgradeType): number[] {
  const maxLevel = getMaxLevel(upgradeType);
  const costs: number[] = [];

  for (let level = 0; level < maxLevel; level++) {
    costs.push(calculateUpgradeCost(upgradeType, level));
  }

  return costs;
}

/**
 * Calculate total cost to upgrade from current level to target level
 *
 * @param upgradeType - Type of upgrade
 * @param currentLevel - Current level
 * @param targetLevel - Target level
 * @returns Total cost
 */
export function calculateTotalUpgradeCost(
  upgradeType: GangUpgradeType,
  currentLevel: number,
  targetLevel: number
): number {
  if (targetLevel <= currentLevel) {
    return 0;
  }

  const maxLevel = getMaxLevel(upgradeType);
  if (targetLevel > maxLevel) {
    throw new Error(`Target level ${targetLevel} exceeds max level ${maxLevel}`);
  }

  let totalCost = 0;
  for (let level = currentLevel; level < targetLevel; level++) {
    totalCost += calculateUpgradeCost(upgradeType, level);
  }

  return totalCost;
}

/**
 * Get upgrade description for display purposes
 *
 * @param upgradeType - Type of upgrade
 * @returns Human-readable description
 */
export function getUpgradeDescription(upgradeType: GangUpgradeType): string {
  const descriptions: Record<GangUpgradeType, string> = {
    [GangUpgradeType.VAULT_SIZE]:
      'Increases gang bank capacity by 10,000 gold per level',
    [GangUpgradeType.MEMBER_SLOTS]:
      'Increases maximum gang members by 5 per level',
    [GangUpgradeType.WAR_CHEST]:
      'Increases war funding capacity by 5,000 gold per level',
    [GangUpgradeType.PERK_BOOSTER]:
      'Multiplies all gang perks by 10% per level',
    [GangUpgradeType.TRAINING_GROUNDS]:
      'Reduces skill training time for all members by 5% per level (max 15%)',
  };

  return descriptions[upgradeType];
}

/**
 * Validate upgrade type
 *
 * @param upgradeType - Type to validate
 * @returns True if valid
 */
export function isValidUpgradeType(upgradeType: string): upgradeType is GangUpgradeType {
  return Object.values(GangUpgradeType).includes(upgradeType as GangUpgradeType);
}
