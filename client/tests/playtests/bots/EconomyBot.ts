/**
 * EconomyBot - Automated playtest bot focused on crafting, trading, and economy
 *
 * Behavior Profile:
 * - Focuses on earning and managing gold
 * - Completes jobs and work opportunities
 * - Engages in crafting and resource gathering
 * - Trades items on market
 * - Manages gang economy if in a gang
 * - Invests in property and businesses
 * - Min-maxes economic efficiency
 */

import { BotBase, BotConfig } from '../utils/BotBase.js';
import { clickButtonByText, navigateByHref, typeByPlaceholder, getElementCount, hasElementWithText } from '../utils/BotSelectors.js';
import { findButtonsByText } from '../utils/PuppeteerHelpers.js';

export class EconomyBot extends BotBase {
  private goldEarned: number = 0;
  private jobsCompleted: number = 0;
  private itemsCrafted: number = 0;
  private tradesMade: number = 0;
  private initialGold: number = 0;

  constructor(config: BotConfig) {
    super(config);
  }

  async runBehaviorLoop(): Promise<void> {
    this.logger.info('Starting Economy-Oriented behavior loop');

    // Record initial gold
    this.initialGold = await this.getGold();
    this.logger.info(`Starting gold: ${this.initialGold}`);

    let cycles = 0;
    const maxCycles = 1000; // Run for approximately 3-4 hours

    while (this.shouldContinue() && cycles < maxCycles) {
      cycles++;
      this.logger.info(`=== Economy Cycle ${cycles}/${maxCycles} ===`);

      try {
        const energy = await this.getEnergy();
        this.logger.info(`Current energy: ${energy}`);

        if (energy < 5) {
          this.logger.warn('Low energy, waiting for regeneration...');
          await this.waitRandom(60000, 120000);
          continue;
        }

        // Rotate through economy activities
        const activity = cycles % 8;

        switch (activity) {
          case 0:
            await this.completeJobs();
            break;
          case 1:
            await this.gatherResources();
            break;
          case 2:
            await this.craftItems();
            break;
          case 3:
            await this.sellItems();
            break;
          case 4:
            await this.checkMarketPrices();
            break;
          case 5:
            await this.manageGangEconomy();
            break;
          case 6:
            await this.investInBusiness();
            break;
          case 7:
            await this.optimizeInventory();
            break;
        }

        await this.waitRandom(10000, 30000);

        // Track economic progress
        if (cycles % 10 === 0) {
          await this.checkEconomicStatus();
        }

        if (cycles % 25 === 0) {
          await this.screenshot(`economy-cycle-${cycles}`);
        }

      } catch (error) {
        this.logger.error(`Error in economy cycle: ${error}`);
        this.metrics.recordError();
        await this.waitRandom(5000, 10000);
      }
    }

    this.logger.success(`Economy bot completed ${cycles} cycles`);
  }

  /**
   * Complete available jobs for gold
   */
  private async completeJobs(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Completing jobs');

    try {
      // Navigate to location with jobs
      const navigated = await navigateByHref(this.page, '/game/location');
      if (!navigated) {
        this.logger.warn('Could not navigate to location page');
        return;
      }
      await this.waitRandom(2000, 3000);

      // Look for job opportunities
      const jobButtons = await findButtonsByText(this.page, 'Work', 'Job', 'Start Work', 'Start Job');

      if (jobButtons.length > 0) {
        // Sort by reward (if visible) and pick best job
        const job = jobButtons[Math.floor(Math.random() * jobButtons.length)];
        await job.click();
        await this.waitRandom(2000, 3000);

        // Confirm job completion
        const confirmed = await clickButtonByText(this.page, 'Confirm', 'Complete', 'Start', 'Accept');
        if (confirmed) {
          await this.waitRandom(1500, 2500);

          this.jobsCompleted++;
          this.metrics.recordAction('job_complete', { jobNumber: this.jobsCompleted });
          this.logger.success(`Job #${this.jobsCompleted} completed`);
        } else {
          this.logger.warn('Could not confirm job');
        }
      } else {
        this.logger.warn('No jobs available');
      }

    } catch (error) {
      this.logger.error(`Job completion error: ${error}`);
    }
  }

  /**
   * Gather resources from locations
   */
  private async gatherResources(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Gathering resources');

    try {
      // Look for gathering actions
      const gatherButtons = await findButtonsByText(this.page, 'Gather', 'Mine', 'Harvest', 'Collect', 'Forage');

      if (gatherButtons.length > 0) {
        const gather = gatherButtons[Math.floor(Math.random() * gatherButtons.length)];
        await gather.click();
        await this.waitRandom(2000, 4000);

        this.metrics.recordAction('resource_gather');
        this.logger.info('Gathered resources');
      } else {
        this.logger.info('No gathering options available');
      }

    } catch (error) {
      this.logger.error(`Resource gathering error: ${error}`);
    }
  }

  /**
   * Craft items from resources
   */
  private async craftItems(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Crafting items');

    try {
      // Navigate to crafting page
      const navigated = await navigateByHref(this.page, '/game/crafting');
      if (!navigated) {
        // Try alternative navigation
        const crafted = await clickButtonByText(this.page, 'Craft', 'Crafting', 'Workshop');
        if (!crafted) {
          this.logger.warn('Could not navigate to crafting page');
          return;
        }
      }
      await this.waitRandom(2000, 3000);

      // Look for craftable items
      const craftButtons = await findButtonsByText(this.page, 'Craft', 'Create', 'Make');

      if (craftButtons.length > 0) {
        const craft = craftButtons[Math.floor(Math.random() * Math.min(3, craftButtons.length))];
        await craft.click();
        await this.waitRandom(2000, 3000);

        this.itemsCrafted++;
        this.metrics.recordAction('item_craft', { itemNumber: this.itemsCrafted });
        this.logger.success(`Crafted item #${this.itemsCrafted}`);
      } else {
        this.logger.info('No items available to craft');
      }

    } catch (error) {
      this.logger.error(`Crafting error: ${error}`);
    }
  }

  /**
   * Sell items at shop/market
   */
  private async sellItems(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Selling items');

    try {
      // Navigate to inventory
      const navigated = await navigateByHref(this.page, '/game/inventory');
      if (!navigated) {
        this.logger.warn('Could not navigate to inventory');
        return;
      }
      await this.waitRandom(2000, 3000);

      // Look for sellable items
      const sellButtons = await findButtonsByText(this.page, 'Sell', 'Sell Item');

      if (sellButtons.length > 0) {
        // Sell a few random items
        const sellCount = Math.min(3, sellButtons.length);
        for (let i = 0; i < sellCount; i++) {
          await sellButtons[i].click();
          await this.waitRandom(1000, 1500);

          this.metrics.recordAction('item_sell');
        }

        this.logger.success(`Sold ${sellCount} items`);
      } else {
        this.logger.info('No items to sell');
      }

    } catch (error) {
      this.logger.error(`Selling error: ${error}`);
    }
  }

  /**
   * Check market prices for trading opportunities
   */
  private async checkMarketPrices(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Checking market prices');

    try {
      // Navigate to market/shop
      const navigated = await navigateByHref(this.page, '/game/shop');
      if (!navigated) {
        this.logger.warn('Could not navigate to shop');
        return;
      }
      await this.waitRandom(2000, 3000);

      // Scan prices (simulated analysis)
      const itemCount = await getElementCount(this.page, '.item, .shop-item, .market-item, [class*="item"]');
      this.logger.info(`Scanned ${itemCount} items on market`);

      // Look for underpriced items to buy
      const gold = await this.getGold();
      if (gold > 50) {
        const buyButtons = await findButtonsByText(this.page, 'Buy', 'Purchase');

        if (buyButtons.length > 0 && Math.random() > 0.5) {
          const buyBtn = buyButtons[Math.floor(Math.random() * Math.min(3, buyButtons.length))];
          await buyBtn.click();
          await this.waitRandom(1000, 2000);

          // Confirm purchase if needed
          await clickButtonByText(this.page, 'Confirm', 'Yes', 'Buy');
          await this.waitRandom(1000, 2000);

          this.tradesMade++;
          this.metrics.recordAction('market_trade', { tradeNumber: this.tradesMade });
          this.logger.info('Purchased item from market');
        }
      } else {
        this.logger.info('Insufficient gold for purchases');
      }

    } catch (error) {
      this.logger.error(`Market check error: ${error}`);
    }
  }

  /**
   * Manage gang economy and contributions
   */
  private async manageGangEconomy(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Managing gang economy');

    try {
      // Navigate to gang page
      const navigated = await navigateByHref(this.page, '/game/gang');
      if (!navigated) {
        this.logger.warn('Could not navigate to gang page');
        return;
      }
      await this.waitRandom(2000, 3000);

      // Check if in a gang
      const inGang = await hasElementWithText(this.page, 'Gang') ||
                     await hasElementWithText(this.page, 'Bank') ||
                     await hasElementWithText(this.page, 'Treasury');

      if (inGang) {
        // Look for contribution options
        const contributed = await clickButtonByText(this.page, 'Contribute', 'Donate', 'Deposit');

        if (contributed) {
          const gold = await this.getGold();

          // Contribute 10% of gold if have over 100
          if (gold > 100) {
            const contribution = Math.floor(gold * 0.1);
            await this.waitRandom(1000, 2000);

            // Enter contribution amount if there's an input
            const typed = await typeByPlaceholder(this.page, 'amount', contribution.toString());
            if (typed) {
              await this.waitRandom(500, 1000);

              const confirmed = await clickButtonByText(this.page, 'Confirm', 'Submit', 'Contribute');
              if (confirmed) {
                await this.waitRandom(1000, 2000);

                this.metrics.recordAction('gang_contribution', { amount: contribution });
                this.logger.info(`Contributed ${contribution} gold to gang`);
              }
            } else {
              // Try direct contribution without amount input
              const confirmed = await clickButtonByText(this.page, 'Confirm', 'Submit', 'Yes');
              if (confirmed) {
                await this.waitRandom(1000, 2000);
                this.metrics.recordAction('gang_contribution');
                this.logger.info('Contributed to gang');
              }
            }
          } else {
            this.logger.info('Insufficient gold for gang contribution');
          }
        } else {
          this.logger.info('No contribution options available');
        }
      } else {
        this.logger.info('Not in a gang');
      }

    } catch (error) {
      this.logger.error(`Gang economy error: ${error}`);
    }
  }

  /**
   * Invest in businesses or property
   */
  private async investInBusiness(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Looking for investment opportunities');

    try {
      const gold = await this.getGold();

      // Only invest if have substantial gold
      if (gold > 500) {
        // Look for property/business options
        const investButtons = await findButtonsByText(this.page, 'Invest', 'Purchase Property', 'Buy Property', 'Purchase');

        if (investButtons.length > 0) {
          const invest = investButtons[0];
          await invest.click();
          await this.waitRandom(2000, 3000);

          // Confirm investment
          const confirmed = await clickButtonByText(this.page, 'Confirm', 'Yes', 'Purchase', 'Buy');
          if (confirmed) {
            await this.waitRandom(1000, 2000);
            this.metrics.recordAction('business_investment');
            this.logger.success('Made business investment');
          }
        } else {
          this.logger.info('No investment opportunities available');
        }
      } else {
        this.logger.info('Insufficient gold for investment');
      }

    } catch (error) {
      this.logger.error(`Investment error: ${error}`);
    }
  }

  /**
   * Optimize inventory and manage items
   */
  private async optimizeInventory(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Optimizing inventory');

    try {
      // Navigate to inventory
      const navigated = await navigateByHref(this.page, '/game/inventory');
      if (!navigated) {
        this.logger.warn('Could not navigate to inventory');
        return;
      }
      await this.waitRandom(2000, 3000);

      // Count items
      const itemCount = await getElementCount(this.page, '.item, .inventory-item, [class*="item"]');
      this.logger.info(`Inventory contains ${itemCount} items`);

      // Sell duplicates or low-value items
      const sellButtons = await findButtonsByText(this.page, 'Sell', 'Sell Item');
      if (sellButtons.length > 10) {
        // Sell excess items
        for (let i = 0; i < 3; i++) {
          await sellButtons[i].click();
          await this.waitRandom(800, 1200);
        }

        this.metrics.recordAction('inventory_optimization');
        this.logger.info('Optimized inventory by selling excess items');
      } else {
        this.logger.info('Inventory does not need optimization');
      }

    } catch (error) {
      this.logger.error(`Inventory optimization error: ${error}`);
    }
  }

  /**
   * Check economic progress
   */
  private async checkEconomicStatus(): Promise<void> {
    if (!this.page) return;

    try {
      const currentGold = await this.getGold();
      const netGain = currentGold - this.initialGold;
      const goldPerJob = this.jobsCompleted > 0 ? Math.floor(netGain / this.jobsCompleted) : 0;

      this.logger.info(`=== Economic Status ===`);
      this.logger.info(`Current Gold: ${currentGold}`);
      this.logger.info(`Net Gain: ${netGain > 0 ? '+' : ''}${netGain}`);
      this.logger.info(`Jobs Completed: ${this.jobsCompleted}`);
      this.logger.info(`Items Crafted: ${this.itemsCrafted}`);
      this.logger.info(`Trades Made: ${this.tradesMade}`);
      this.logger.info(`Avg Gold/Job: ${goldPerJob}`);
      this.logger.info(`=====================`);

    } catch (error) {
      this.logger.error(`Status check error: ${error}`);
    }
  }
}
