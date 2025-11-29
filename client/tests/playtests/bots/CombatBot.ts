/**
 * CombatBot - Automated playtest bot focused on combat and PvE activities
 *
 * Behavior Profile:
 * - Aggressive combat-seeking behavior
 * - Prioritizes leveling up through combat
 * - Engages in duels and PvP when available
 * - Completes combat-focused quests
 * - Upgrades combat gear when possible
 * - Hunts NPCs and completes bounties
 */

import { BotBase, BotConfig } from '../utils/BotBase.js';
import { clickButtonByText, clickLinkByText, hasElementWithText, getButtonsByText } from '../utils/BotSelectors.js';
import { findButtonByText, findButtonsByText } from '../utils/PuppeteerHelpers.js';

export class CombatBot extends BotBase {
  private combatCount: number = 0;
  private duelCount: number = 0;
  private questsCompleted: number = 0;

  constructor(config: BotConfig) {
    super(config);
  }

  async runBehaviorLoop(): Promise<void> {
    this.logger.info('Starting Combat-Oriented behavior loop');

    let cycles = 0;
    const maxCycles = 1000; // Run for approximately 3-4 hours with delays

    while (this.shouldContinue() && cycles < maxCycles) {
      cycles++;
      this.logger.info(`=== Combat Cycle ${cycles}/${maxCycles} ===`);

      try {
        // Check energy before proceeding
        const energy = await this.getEnergy();
        this.logger.info(`Current energy: ${energy}`);

        if (energy < 10) {
          this.logger.warn('Low energy, waiting for regeneration...');
          await this.waitRandom(60000, 120000); // Wait 1-2 minutes
          continue;
        }

        // Rotate through combat activities
        const activity = cycles % 5;

        switch (activity) {
          case 0:
            await this.engageInCombat();
            break;
          case 1:
            await this.checkAndUpgradeGear();
            break;
          case 2:
            await this.lookForDuels();
            break;
          case 3:
            await this.huntBounties();
            break;
          case 4:
            await this.exploreForCombat();
            break;
        }

        // Random delays to simulate human behavior
        await this.waitRandom(10000, 30000);

        // Occasionally check character status
        if (cycles % 10 === 0) {
          await this.checkCharacterStatus();
        }

        // Periodic screenshot for monitoring
        if (cycles % 25 === 0) {
          await this.screenshot(`combat-cycle-${cycles}`);
        }

      } catch (error) {
        this.logger.error(`Error in combat cycle: ${error}`);
        this.metrics.recordError();
        await this.waitRandom(5000, 10000);
      }
    }

    this.logger.success(`Combat bot completed ${cycles} cycles`);
  }

  /**
   * Engage in PvE combat encounters
   */
  private async engageInCombat(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Engaging in combat');

    try {
      // Navigate to combat page using navigateTo helper
      await this.navigateTo('Combat');
      await this.waitRandom(2000, 3000);

      // Look for available combat encounters using helper
      const combatButtonCount = await getButtonsByText(this.page, 'Fight', 'Attack', 'Engage', 'Battle', 'Start Combat');

      if (combatButtonCount > 0) {
        this.logger.info(`Found ${combatButtonCount} combat encounter(s)`);

        // Click one of the combat buttons
        const clicked = await clickButtonByText(this.page, 'Fight', 'Attack', 'Engage', 'Battle', 'Start Combat');

        if (clicked) {
          await this.waitRandom(1500, 2500);

          // Execute combat actions
          await this.executeCombatTurn();

          this.combatCount++;
          this.metrics.recordAction('combat_encounter', { combatNumber: this.combatCount });
          this.logger.success(`Combat encounter #${this.combatCount} completed`);
        } else {
          this.logger.warn('Failed to click combat button');
        }
      } else {
        this.logger.warn('No combat encounters available');
      }

    } catch (error) {
      this.logger.error(`Combat error: ${error}`);
    }
  }

  /**
   * Execute combat turn decisions
   */
  private async executeCombatTurn(): Promise<void> {
    if (!this.page) return;

    let combatActive = true;
    let turns = 0;
    const maxTurns = 20;

    while (combatActive && turns < maxTurns) {
      turns++;

      try {
        // Check if combat is still active
        const stillInCombat = await hasElementWithText(this.page, 'Combat') ||
                              await hasElementWithText(this.page, 'Fighting') ||
                              await hasElementWithText(this.page, 'Battle');

        if (!stillInCombat) {
          this.logger.debug('Combat no longer active');
          break;
        }

        // Make combat decision (60% attack, 30% skill, 10% defend)
        const roll = Math.random();

        if (roll < 0.6) {
          // 60% chance to attack
          const attackClicked = await clickButtonByText(this.page, 'Attack', 'Strike', 'Shoot', 'Fire');
          if (attackClicked) {
            this.logger.debug('Combat action: Attack');
            this.metrics.recordAction('combat_attack');
          }
        } else if (roll < 0.9) {
          // 30% chance to use skill
          const skillClicked = await clickButtonByText(this.page, 'Skill', 'Special', 'Ability', 'Power');
          if (skillClicked) {
            this.logger.debug('Combat action: Skill');
            this.metrics.recordAction('combat_skill');
          }
        } else {
          // 10% chance to defend
          const defendClicked = await clickButtonByText(this.page, 'Defend', 'Block', 'Guard', 'Evade');
          if (defendClicked) {
            this.logger.debug('Combat action: Defend');
            this.metrics.recordAction('combat_defend');
          }
        }

        await this.waitRandom(1500, 2500);

        // Check for combat end conditions
        const hasVictory = await hasElementWithText(this.page, 'Victory') ||
                          await hasElementWithText(this.page, 'Won') ||
                          await hasElementWithText(this.page, 'Defeated Enemy');

        const hasDefeat = await hasElementWithText(this.page, 'Defeat') ||
                         await hasElementWithText(this.page, 'Lost') ||
                         await hasElementWithText(this.page, 'You Died');

        if (hasVictory) {
          this.logger.success('Combat victory!');
          combatActive = false;
        } else if (hasDefeat) {
          this.logger.warn('Combat defeat');
          combatActive = false;
        }

      } catch (error) {
        this.logger.error(`Combat turn error: ${error}`);
        break;
      }
    }

    // Click continue/close button
    await this.waitRandom(1000, 2000);
    await clickButtonByText(this.page, 'Continue', 'Close', 'Finish', 'Done', 'OK');
  }

  /**
   * Check for and upgrade combat gear
   */
  private async checkAndUpgradeGear(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Checking for gear upgrades');

    try {
      // Navigate to shop using navigateTo helper
      await this.navigateTo('Shop');
      await this.waitRandom(2000, 3000);

      const gold = await this.getGold();
      this.logger.info(`Current gold: ${gold}`);

      if (gold > 100) {
        // Look for weapon upgrades using evaluate to find items with both text and buy button
        const weaponPurchased = await this.page.evaluate((availableGold) => {
          // Find all buy buttons
          const buyButtons = Array.from(document.querySelectorAll('button'));
          const filteredButtons = buyButtons.filter(btn => {
            const text = btn.textContent || '';
            return text.includes('Buy') || text.includes('Purchase');
          });

          // Find weapon items
          const weaponButtons = filteredButtons.filter(btn => {
            const parent = btn.closest('.item, .card, .shop-item, [class*="product"]') || btn.parentElement;
            const itemText = parent?.textContent || '';
            return itemText.match(/Weapon|Gun|Sword|Rifle|Pistol|Blade|Axe/i);
          });

          // Find affordable weapons
          const affordableWeapons = weaponButtons.filter(btn => {
            const parent = btn.closest('.item, .card, .shop-item, [class*="product"]') || btn.parentElement;
            const priceText = parent?.textContent || '';
            const priceMatch = priceText.match(/(\d+)\s*(?:gold|g|\$)/i);
            return priceMatch && parseInt(priceMatch[1]) <= availableGold;
          });

          if (affordableWeapons.length > 0) {
            // Click random affordable weapon
            const randomIndex = Math.floor(Math.random() * affordableWeapons.length);
            affordableWeapons[randomIndex].click();
            return true;
          }

          return false;
        }, gold);

        if (weaponPurchased) {
          await this.waitRandom(1000, 2000);
          this.metrics.recordAction('purchase_weapon');
          this.logger.success('Purchased weapon upgrade');
        } else {
          this.logger.info('No affordable weapons found');
        }
      } else {
        this.logger.info('Not enough gold for upgrades');
      }

    } catch (error) {
      this.logger.error(`Gear upgrade error: ${error}`);
    }
  }

  /**
   * Look for and engage in player duels
   */
  private async lookForDuels(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Looking for duels');

    try {
      // Navigate to duels/PvP page - try multiple navigation options
      const navSuccess = await clickLinkByText(this.page, 'Duel', 'PvP', 'Arena', 'Challenge');

      if (!navSuccess) {
        // Fallback to navigateTo helper
        await this.navigateTo('Duel');
      }

      await this.waitRandom(2000, 3000);

      // Look for duel challenges using helper
      const duelButtons = await findButtonsByText(this.page, 'Challenge', 'Duel', 'Fight', 'Accept');

      if (duelButtons.length > 0) {
        this.logger.info(`Found ${duelButtons.length} duel option(s)`);

        // Click random duel button
        const randomIndex = Math.floor(Math.random() * duelButtons.length);
        await duelButtons[randomIndex].click();
        await this.waitRandom(1500, 2500);

        // Execute duel combat
        await this.executeCombatTurn();

        this.duelCount++;
        this.metrics.recordAction('player_duel', { duelNumber: this.duelCount });
        this.logger.success(`Duel #${this.duelCount} completed`);
      } else {
        this.logger.info('No duels available');
      }

    } catch (error) {
      this.logger.error(`Duel error: ${error}`);
    }
  }

  /**
   * Hunt for bounties and wanted NPCs
   */
  private async huntBounties(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Hunting bounties');

    try {
      // Navigate to bounties page
      const navSuccess = await clickLinkByText(this.page, 'Bounty', 'Bounties', 'Wanted', 'Hunt');

      if (!navSuccess) {
        await this.navigateTo('Bounty');
      }

      await this.waitRandom(2000, 3000);

      // Look for active bounties
      const bountyClicked = await clickButtonByText(this.page, 'Hunt', 'Track', 'Accept', 'Pursue', 'Claim');

      if (bountyClicked) {
        await this.waitRandom(2000, 3000);
        this.metrics.recordAction('bounty_hunt');
        this.logger.info('Started bounty hunt');

        // Check if bounty led to combat
        const inCombat = await hasElementWithText(this.page, 'Combat') ||
                        await hasElementWithText(this.page, 'Fight') ||
                        await hasElementWithText(this.page, 'Battle');

        if (inCombat) {
          await this.executeCombatTurn();
        }
      } else {
        this.logger.info('No bounties available');
      }

    } catch (error) {
      this.logger.error(`Bounty hunt error: ${error}`);
    }
  }

  /**
   * Explore locations looking for combat opportunities
   */
  private async exploreForCombat(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Exploring for combat');

    try {
      // Navigate to location/explore page
      const navSuccess = await clickLinkByText(this.page, 'Location', 'Explore', 'Travel', 'Map');

      if (!navSuccess) {
        await this.navigateTo('Location');
      }

      await this.waitRandom(2000, 3000);

      // Look for dangerous locations using evaluate
      const dangerousLocationClicked = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const dangerousButtons = buttons.filter(btn => {
          const text = btn.textContent || '';
          return text.match(/Dangerous|Outlaw|Bandit|Wild|Hostile|Lawless|Frontier/i);
        });

        if (dangerousButtons.length > 0) {
          const randomIndex = Math.floor(Math.random() * dangerousButtons.length);
          dangerousButtons[randomIndex].click();
          return true;
        }

        return false;
      });

      if (dangerousLocationClicked) {
        this.logger.info('Traveled to dangerous location');
        await this.waitRandom(2000, 3000);

        // Look for combat encounters in this location
        await this.engageInCombat();
      } else {
        this.logger.info('No dangerous locations found');
      }

    } catch (error) {
      this.logger.error(`Exploration error: ${error}`);
    }
  }

  /**
   * Train combat skills when available
   */
  private async trainSkills(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Training combat skills');

    try {
      // Navigate to skills page
      const navSuccess = await clickLinkByText(this.page, 'Skills', 'Training', 'Abilities');

      if (!navSuccess) {
        await this.navigateTo('Skills');
      }

      await this.waitRandom(2000, 3000);

      // Look for combat-related skills to train
      const skillTrained = await this.page.evaluate(() => {
        const trainButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
          const text = btn.textContent || '';
          return text.includes('Train') || text.includes('Upgrade') || text.includes('Learn');
        });

        // Filter for combat skills
        const combatSkills = trainButtons.filter(btn => {
          const parent = btn.closest('.skill, .card, [class*="skill"]') || btn.parentElement;
          const skillText = parent?.textContent || '';
          return skillText.match(/Attack|Defense|Strength|Combat|Fighting|Weapon|Marksmanship|Tactics/i);
        });

        if (combatSkills.length > 0) {
          const randomIndex = Math.floor(Math.random() * combatSkills.length);
          combatSkills[randomIndex].click();
          return true;
        }

        return false;
      });

      if (skillTrained) {
        await this.waitRandom(1000, 2000);
        this.metrics.recordAction('skill_training');
        this.logger.success('Trained combat skill');
      } else {
        this.logger.info('No combat skills available for training');
      }

    } catch (error) {
      this.logger.error(`Skill training error: ${error}`);
    }
  }

  /**
   * Check character stats and progress
   */
  private async checkCharacterStatus(): Promise<void> {
    if (!this.page) return;

    try {
      const gold = await this.getGold();
      const energy = await this.getEnergy();

      this.logger.info(`=== Status Check ===`);
      this.logger.info(`Gold: ${gold}`);
      this.logger.info(`Energy: ${energy}`);
      this.logger.info(`Combats: ${this.combatCount}`);
      this.logger.info(`Duels: ${this.duelCount}`);
      this.logger.info(`==================`);

    } catch (error) {
      this.logger.error(`Status check error: ${error}`);
    }
  }
}
