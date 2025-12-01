/**
 * ALL LOCATIONS E2E TEST
 * Physically tests every location through the UI
 */

import { BotBase, BotConfig } from '../utils/BotBase.js';
import { BotLogger } from '../utils/BotLogger.js';
import { Page } from 'puppeteer';

interface LocationTestResult {
  name: string;
  type: string;
  accessible: boolean;
  error?: string;
  travelTime?: number;
}

export class AllLocationsE2EBot extends BotBase {
  private results: LocationTestResult[] = [];
  private testLogger: BotLogger;

  constructor(config: BotConfig) {
    super(config);
    this.testLogger = new BotLogger('LocationE2E');
  }

  /**
   * Run comprehensive location tests
   */
  async runTests(): Promise<void> {
    try {
      await this.initialize();
      await this.login();
      await this.selectCharacter();

      this.testLogger.info('\n═══════════════════════════════════════════════════════════');
      this.testLogger.info('🗺️ COMPREHENSIVE LOCATION E2E TEST');
      this.testLogger.info('═══════════════════════════════════════════════════════════\n');

      // Get all locations from the UI
      const locations = await this.getAllLocations();
      this.testLogger.info(`Found ${locations.length} locations to test\n`);

      // Test each location
      for (const location of locations) {
        await this.testLocation(location);
        await this.waitRandom(500, 1000);
      }

      // Generate report
      this.generateReport();

    } catch (error) {
      this.testLogger.error(`Test failed: ${error}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Get all available locations from the game UI
   */
  private async getAllLocations(): Promise<Array<{ name: string; type: string }>> {
    if (!this.page) throw new Error('Page not initialized');

    this.testLogger.info('Fetching locations from UI...');

    // Navigate to locations/map page
    try {
      await this.navigateToLocations();

      // Wait for page to load with explicit element wait
      this.testLogger.info('Waiting for page content to load...');
      try {
        await this.page.waitForSelector('h1, h2, h3', { timeout: 10000 });
        await this.waitRandom(2000, 3000); // Additional wait for React hydration
      } catch (waitError) {
        this.testLogger.warn('Timeout waiting for content, proceeding anyway');
      }

      // DEBUG: Take screenshot
      const screenshotPath = `./test-screenshots/location-page-${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.testLogger.info(`Screenshot saved: ${screenshotPath}`);

      // DEBUG: Log page info
      const pageUrl = this.page.url();
      const pageTitle = await this.page.title();
      this.testLogger.info(`Current URL: ${pageUrl}`);
      this.testLogger.info(`Page Title: ${pageTitle}`);

      // DEBUG: Count elements
      const elementCounts = await this.page.evaluate(() => {
        return {
          h1: document.querySelectorAll('h1').length,
          h2: document.querySelectorAll('h2').length,
          h3: document.querySelectorAll('h3').length,
          buttons: document.querySelectorAll('button').length,
          dataTestIds: document.querySelectorAll('[data-testid]').length,
          dataBuildingNames: document.querySelectorAll('[data-building-name]').length,
          dataLocationNames: document.querySelectorAll('[data-location-name]').length,
        };
      });
      this.testLogger.info(`Element counts: ${JSON.stringify(elementCounts)}`);

      // Extract location data from the page - updated to match actual UI structure
      const locations = await this.page.evaluate(() => {
        const locs: Array<{ name: string; type: string }> = [];

        // Strategy 1: Try data attributes FIRST (most reliable)
        const dataElements = document.querySelectorAll('[data-building-name], [data-location-name]');
        dataElements.forEach((el) => {
          const name = el.getAttribute('data-building-name') || el.getAttribute('data-location-name');
          const type = el.getAttribute('data-building-type') || el.getAttribute('data-location-type') || 'unknown';
          if (name && name !== '') {
            locs.push({ name, type });
          }
        });

        // Strategy 2: Extract buildings from buttons with h3
        if (locs.length === 0) {
          const buildingButtons = document.querySelectorAll('button');
          buildingButtons.forEach((btn) => {
            const nameEl = btn.querySelector('h3');
            if (nameEl && nameEl.textContent) {
              const name = nameEl.textContent.trim();
              // Filter out non-building buttons
              if (name && name !== '' && !name.includes('Travel') && !name.includes('Go') && !name.includes('Exit')) {
                locs.push({
                  name,
                  type: 'building'
                });
              }
            }
          });
        }

        // Strategy 3: Look for travel destinations - any div with h3 and a button containing "Go"
        const allDivs = document.querySelectorAll('div');
        allDivs.forEach((div) => {
          const nameEl = div.querySelector('h3');
          const goBtn = div.querySelector('button');
          if (nameEl && goBtn && goBtn.textContent?.includes('Go')) {
            const name = nameEl.textContent?.trim();
            if (name && name !== '' && !locs.find(loc => loc.name === name)) {
              locs.push({
                name,
                type: 'location'
              });
            }
          }
        });

        return locs;
      });

      this.testLogger.info(`Extracted ${locations.length} locations using page scraping`);

      if (locations.length === 0) {
        // DEBUG: Log page HTML snippet
        const htmlSnippet = await this.page.evaluate(() => {
          return document.body.innerHTML.substring(0, 500);
        });
        this.testLogger.warn(`Page HTML snippet: ${htmlSnippet}`);

        this.testLogger.warn('No locations found in UI, using fallback list');
        return this.getFallbackLocations();
      }

      this.testLogger.info(`Found ${locations.length} locations/buildings in current view`);
      return locations;
    } catch (error) {
      this.testLogger.error(`Failed to fetch locations: ${error}`);
      // Take error screenshot
      try {
        await this.page.screenshot({ path: `./test-screenshots/location-error-${Date.now()}.png`, fullPage: true });
      } catch (screenshotError) {
        // Ignore screenshot errors
      }
      return this.getFallbackLocations();
    }
  }

  /**
   * Navigate to the locations/travel page
   */
  private async navigateToLocations(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    this.testLogger.info('Navigating to location page...');

    // After character selection, we should be at /game or /game/location
    const currentUrl = this.page.url();
    this.testLogger.info(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('/game/location')) {
      this.testLogger.info('Already on location page');
      await this.waitRandom(1000, 2000);
      return;
    }

    if (currentUrl.includes('/game')) {
      this.testLogger.info('Already on game page (which may default to location)');
      await this.waitRandom(1000, 2000);
      return;
    }

    // If not on game page, use click-based navigation (preserves auth)
    this.testLogger.info('Clicking location nav link...');

    const clicked = await this.page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const navLink = links.find(a => {
        const href = a.getAttribute('href') || '';
        return href === '/game/location' || href.includes('/location');
      });

      if (navLink) {
        navLink.click();
        return true;
      }
      return false;
    });

    if (!clicked) {
      this.testLogger.error('Could not find location nav link');
      throw new Error('Navigation link not found');
    }

    // Wait for client-side navigation (React Router)
    await this.waitRandom(2000, 3000);

    const finalUrl = this.page.url();
    this.testLogger.info(`Navigation complete: ${finalUrl}`);

    if (finalUrl.includes('/login')) {
      throw new Error('Navigation failed - redirected to login (auth lost)');
    }

    if (!finalUrl.includes('/game')) {
      throw new Error(`Navigation failed - unexpected URL: ${finalUrl}`);
    }
  }

  /**
   * Test a specific location
   */
  private async testLocation(location: { name: string; type: string }): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    const startTime = Date.now();
    const result: LocationTestResult = {
      name: location.name,
      type: location.type,
      accessible: false,
    };

    try {
      this.testLogger.info(`Testing: ${location.name} (${location.type})...`);

      // Try to travel to this location
      const success = await this.travelToLocation(location.name);

      if (success) {
        result.accessible = true;
        result.travelTime = Date.now() - startTime;
        this.testLogger.info(`  ✅ ${location.name} - Accessible (${result.travelTime}ms)`);
      } else {
        result.error = 'Failed to travel';
        this.testLogger.warn(`  ⚠️  ${location.name} - Not accessible or too far`);
      }

    } catch (error: any) {
      result.error = error.message;
      this.testLogger.error(`  ❌ ${location.name} - Error: ${error.message}`);
    }

    this.results.push(result);
  }

  /**
   * Attempt to travel to a location
   */
  private async travelToLocation(locationName: string): Promise<boolean> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      // Strategy 1: Find and click location button/link
      const clicked = await this.page.evaluate((locName) => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const locationElement = buttons.find(el => el.textContent?.includes(locName));
        if (locationElement) {
          (locationElement as HTMLElement).click();
          return true;
        }
        return false;
      }, locationName);

      if (clicked) {
        await this.waitRandom(1000, 2000);

        // Check if travel was successful
        const currentLocation = await this.page.evaluate(() => {
          const el = document.querySelector('[data-current-location], .current-location');
          return el?.textContent?.trim();
        });

        return currentLocation?.includes(locationName) || false;
      }

      // Strategy 2: Use dropdown/select
      const selectExists = await this.page.$('select[name="location"], select#location');
      if (selectExists) {
        await this.page.select('select[name="location"], select#location', locationName);
        await this.waitRandom(500, 1000);

        // Click travel button
        const travelButton = await this.page.$('button:contains("Travel"), button[type="submit"]');
        if (travelButton) {
          await travelButton.click();
          await this.waitRandom(1000, 2000);
          return true;
        }
      }

      // Strategy 3: Check if already at location
      const currentLocation = await this.page.evaluate(() => {
        const el = document.querySelector('[data-current-location], .current-location');
        return el?.textContent?.trim();
      });

      if (currentLocation?.includes(locationName)) {
        return true;
      }

      return false;

    } catch (error) {
      return false;
    }
  }

  /**
   * Fallback location list based on database
   */
  private getFallbackLocations(): Array<{ name: string; type: string }> {
    return [
      { name: 'Red Gulch', type: 'settlement' },
      { name: 'The Frontera', type: 'settlement' },
      { name: 'Fort Ashford', type: 'fort' },
      { name: 'Kaiowa Mesa', type: 'mesa' },
      { name: 'Sangre Canyon', type: 'canyon' },
      { name: "Goldfinger's Mine", type: 'mine' },
      { name: "Thunderbird's Perch", type: 'sacred_site' },
      { name: 'The Scar', type: 'canyon' },
      { name: 'Dusty Trail', type: 'wilderness' },
      { name: 'Longhorn Ranch', type: 'ranch' },
      { name: 'Spirit Springs', type: 'springs' },
      { name: 'Whiskey Bend', type: 'settlement' },
      { name: 'The Wastes', type: 'wasteland' },
      { name: 'The Golden Spur Saloon', type: 'saloon' },
      { name: "Sheriff's Office", type: 'sheriff_office' },
      { name: "Miner's Supply Co", type: 'general_store' },
      { name: 'Red Gulch Bank', type: 'bank' },
      { name: "Iron Jake's Forge", type: 'blacksmith' },
      { name: 'Gulch Assay Office', type: 'assay_office' },
      { name: "Doc Morrison's", type: 'doctors_office' },
      { name: 'Dusty Trails Hotel', type: 'hotel' },
      { name: "Governor's Mansion", type: 'government' },
      { name: 'Ashford Mining Company HQ', type: 'business' },
      { name: 'The Gilded Peacock', type: 'entertainment' },
      { name: 'The Labor Exchange', type: 'labor' },
      { name: 'The Slop House', type: 'saloon' },
      { name: 'Tent City', type: 'camp' },
      { name: "Mei Ling's Laundry", type: 'service' },
      { name: "Chen's Apothecary", type: 'apothecary' },
      { name: 'Dragon Gate Tea House', type: 'tea_house' },
    ];
  }

  /**
   * Select character after login
   */
  private async selectCharacter(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    this.testLogger.info('Selecting character...');

    try {
      // Wait for character selection screen - try multiple selectors
      await this.page.waitForSelector('.character-card, button[data-testid="play-button"], button[type="submit"]', {
        timeout: 10000,
      });

      await this.waitRandom(1000, 2000);

      // Try to find and click "Play" button using evaluate
      const clicked = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const playButton = buttons.find(btn =>
          btn.textContent?.includes('Play') ||
          btn.textContent?.includes('Select') ||
          btn.textContent?.includes('Continue')
        );
        if (playButton) {
          playButton.click();
          return true;
        }
        return false;
      });

      if (clicked) {
        this.testLogger.info('Character selected, waiting for navigation...');
        await this.waitRandom(3000, 5000);

        const finalUrl = this.page.url();
        this.testLogger.info(`Character selection complete, at: ${finalUrl}`);

        if (finalUrl.includes('/login')) {
          throw new Error('Character selection failed - redirected to login');
        }

        if (!finalUrl.includes('/game') && !finalUrl.includes('/characters')) {
          this.testLogger.warn(`Unexpected URL after character selection: ${finalUrl}`);
        }
      } else {
        // Fallback: click first submit button
        const submitButton = await this.page.$('button[type="submit"]');
        if (submitButton) {
          await submitButton.click();
          this.testLogger.info('Character selected via submit button, waiting for navigation...');
          await this.waitRandom(3000, 5000);

          const finalUrl = this.page.url();
          this.testLogger.info(`Character selection complete, at: ${finalUrl}`);

          if (finalUrl.includes('/login')) {
            throw new Error('Character selection failed - redirected to login');
          }

          if (!finalUrl.includes('/game') && !finalUrl.includes('/characters')) {
            this.testLogger.warn(`Unexpected URL after character selection: ${finalUrl}`);
          }
        } else {
          throw new Error('Character selection button not found');
        }
      }

    } catch (error) {
      this.testLogger.error(`Character selection failed: ${error}`);
      throw error;
    }
  }

  /**
   * Generate test report
   */
  private generateReport(): void {
    const total = this.results.length;
    const accessible = this.results.filter(r => r.accessible).length;
    const failed = this.results.filter(r => !r.accessible).length;
    const errors = this.results.filter(r => r.error).length;

    this.testLogger.info('\n═══════════════════════════════════════════════════════════');
    this.testLogger.info('📊 LOCATION E2E TEST REPORT');
    this.testLogger.info('═══════════════════════════════════════════════════════════\n');

    this.testLogger.info(`Total Locations Tested: ${total}`);
    this.testLogger.info(`Accessible: ${accessible} (${((accessible / total) * 100).toFixed(1)}%)`);
    this.testLogger.info(`Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)`);
    this.testLogger.info(`Errors: ${errors}\n`);

    // Group by type
    const byType = new Map<string, LocationTestResult[]>();
    this.results.forEach(r => {
      if (!byType.has(r.type)) byType.set(r.type, []);
      byType.get(r.type)!.push(r);
    });

    this.testLogger.info('Results by Building Type:');
    byType.forEach((locs, type) => {
      const accessible = locs.filter(l => l.accessible).length;
      this.testLogger.info(`  ${type}: ${accessible}/${locs.length} accessible`);
    });

    if (errors > 0) {
      this.testLogger.info('\n❌ Failed Locations:');
      this.results.filter(r => r.error).forEach(r => {
        this.testLogger.info(`  - ${r.name}: ${r.error}`);
      });
    }

    // Average travel time
    const travelTimes = this.results.filter(r => r.travelTime).map(r => r.travelTime!);
    if (travelTimes.length > 0) {
      const avgTime = travelTimes.reduce((a, b) => a + b, 0) / travelTimes.length;
      this.testLogger.info(`\nAverage Travel Time: ${avgTime.toFixed(0)}ms`);
    }

    this.testLogger.info('\n═══════════════════════════════════════════════════════════\n');
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Random wait
   */
  private async waitRandom(min: number, max: number): Promise<void> {
    const wait = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, wait));
  }
}
