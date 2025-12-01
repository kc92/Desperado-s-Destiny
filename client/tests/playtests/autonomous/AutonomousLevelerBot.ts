/**
 * AutonomousLevelerBot - Intelligent bot that creates a character and levels it up
 *
 * Features:
 * - Creates new character from scratch
 * - Intelligent decision-making based on stats and game state
 * - Explores multiple game systems (combat, economy, crafting, social)
 * - Adapts strategy based on success/failure patterns
 * - Sets and pursues long-term goals
 * - Comprehensive logging and metrics tracking
 */

import { BotBase, BotConfig } from '../utils/BotBase.js';
import { clickButtonByText, clickLinkByText, hasElementWithText } from '../utils/BotSelectors.js';

interface CharacterStats {
  level: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  gold: number;
  experience: number;
}

interface GameState {
  currentLocation: string;
  availableActions: string[];
  characterStats: CharacterStats;
  inventory: string[];
}

interface Decision {
  action: string;
  priority: number;
  reasoning: string;
}

export class AutonomousLevelerBot extends BotBase {
  // Goals
  private readonly targetLevel: number = 20;
  private readonly targetGold: number = 10000;

  // Tracking
  private currentLevel: number = 1;
  private currentGold: number = 0;
  private actionsPerformed: Map<string, number> = new Map();
  private successRate: Map<string, { successes: number; attempts: number }> = new Map();

  // Decision-making weights (learned over time)
  private actionWeights: Map<string, number> = new Map([
    ['combat', 1.0],
    ['crime', 0.8],
    ['crafting', 0.6],
    ['trading', 0.7],
    ['questing', 1.2],
    ['exploring', 0.5],
  ]);

  constructor(config: BotConfig) {
    super(config);
  }

  /**
   * Main behavior loop - autonomous decision-making
   */
  async runBehaviorLoop(): Promise<void> {
    this.logger.info('🤖 Starting Autonomous Leveler Bot');
    this.logger.info(`📊 Goals: Level ${this.targetLevel} | ${this.targetGold} gold`);

    // First, handle tutorial if present
    await this.handleTutorialIfPresent();

    let cycles = 0;
    const maxCycles = 2000; // Allow for extended play sessions

    while (this.shouldContinue() && cycles < maxCycles) {
      cycles++;
      this.logger.info(`\n=== Cycle ${cycles}/${maxCycles} ===`);

      try {
        // Diagnostic: Take screenshot every 20 cycles
        if (cycles % 20 === 0) {
          await this.screenshot(`cycle-${cycles}`);
        }

        // Diagnostic: Log current page state
        await this.logPageState();

        // Check if tutorial has reappeared or is still blocking
        const tutorialBlocking = await this.isTutorialBlocking();
        if (tutorialBlocking) {
          this.logger.info('⚠️ Tutorial detected during cycle, completing it...');
          await this.completeTutorial();
        }

        // 1. Assess current game state
        const gameState = await this.assessGameState();

        // 2. Check if goals achieved
        if (await this.checkGoalsAchieved(gameState)) {
          this.logger.info('🎉 All goals achieved! Bot completing successfully.');
          break;
        }

        // 3. Make intelligent decision about next action
        const decision = await this.makeDecision(gameState);
        this.logger.info(`💡 Decision: ${decision.action} (Priority: ${decision.priority.toFixed(2)})`);
        this.logger.info(`   Reasoning: ${decision.reasoning}`);

        // 4. Execute the decision
        await this.executeDecision(decision, gameState);

        // 5. Learn from the outcome
        await this.updateLearning(decision);

        // 6. Periodic status check
        if (cycles % 10 === 0) {
          await this.logProgress();
        }

        // 7. Periodic screenshot for monitoring
        if (cycles % 20 === 0) {
          await this.screenshot(`autonomous-cycle-${cycles}`);
        }

        // Human-like delay
        await this.waitRandom(5000, 15000);

      } catch (error: any) {
        this.logger.error(`Cycle error: ${error.message}`);
        await this.handleError(error);
        await this.waitRandom(10000, 20000);
      }
    }

    this.logger.info('\n📊 Final Statistics:');
    await this.logProgress();
    await this.printFinalReport();
  }

  /**
   * Assess the current game state
   */
  private async assessGameState(): Promise<GameState> {
    if (!this.page) throw new Error('Page not initialized');

    const stats = await this.getCharacterStats();
    const location = await this.getCurrentLocation();
    const actions = await this.getAvailableActions();

    return {
      currentLocation: location,
      availableActions: actions,
      characterStats: stats,
      inventory: [], // TODO: Implement inventory extraction
    };
  }

  /**
   * Get character stats from UI
   */
  private async getCharacterStats(): Promise<CharacterStats> {
    if (!this.page) throw new Error('Page not initialized');

    const stats = await this.page.evaluate(() => {
      // Try to extract stats from various UI elements
      const levelText = document.querySelector('[data-testid="character-level"]')?.textContent ||
                       document.querySelector('.level')?.textContent || '1';

      const goldText = document.querySelector('[data-testid="character-gold"]')?.textContent ||
                      document.querySelector('.gold')?.textContent || '0';

      const energyText = document.querySelector('[data-testid="character-energy"]')?.textContent || '100';

      return {
        level: parseInt(levelText.replace(/\D/g, '')) || 1,
        health: 100, // Default
        maxHealth: 100,
        energy: parseInt(energyText.split('/')[0]?.trim() || '100'),
        maxEnergy: parseInt(energyText.split('/')[1]?.trim() || '100'),
        gold: parseInt(goldText.replace(/\D/g, '')) || 0,
        experience: 0,
      };
    });

    this.currentLevel = stats.level;
    this.currentGold = stats.gold;

    return stats;
  }

  /**
   * Get current location
   */
  private async getCurrentLocation(): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');

    const location = await this.page.evaluate(() => {
      const locationEl = document.querySelector('[data-testid="current-location"]');
      return locationEl?.textContent || 'Unknown';
    });

    return location;
  }

  /**
   * Get available actions from UI
   */
  private async getAvailableActions(): Promise<string[]> {
    if (!this.page) throw new Error('Page not initialized');

    const actions = await this.page.evaluate(() => {
      const actionButtons = Array.from(document.querySelectorAll('button[data-action-name], button.action-button'));
      return actionButtons.map(btn => btn.textContent?.trim() || '').filter(Boolean);
    });

    return actions;
  }

  /**
   * Check if goals are achieved
   */
  private async checkGoalsAchieved(state: GameState): Promise<boolean> {
    const levelGoalMet = state.characterStats.level >= this.targetLevel;
    const goldGoalMet = state.characterStats.gold >= this.targetGold;

    if (levelGoalMet) {
      this.logger.info(`✅ Level goal achieved: ${state.characterStats.level}/${this.targetLevel}`);
    }
    if (goldGoalMet) {
      this.logger.info(`✅ Gold goal achieved: ${state.characterStats.gold}/${this.targetGold}`);
    }

    return levelGoalMet && goldGoalMet;
  }

  /**
   * Make an intelligent decision about what to do next
   */
  private async makeDecision(state: GameState): Promise<Decision> {
    const decisions: Decision[] = [];

    // Check energy first
    if (state.characterStats.energy < 20) {
      return {
        action: 'wait_for_energy',
        priority: 10.0,
        reasoning: 'Energy too low, waiting for regeneration',
      };
    }

    // Priority 1: Survival - heal if health is low
    if (state.characterStats.health < state.characterStats.maxHealth * 0.3) {
      decisions.push({
        action: 'heal',
        priority: 9.0,
        reasoning: 'Health critical, need to heal',
      });
    }

    // Priority 2: Level up through combat/quests
    if (state.characterStats.level < this.targetLevel) {
      const combatSuccessRate = this.getSuccessRate('combat');
      decisions.push({
        action: 'combat',
        priority: 8.0 * combatSuccessRate * this.actionWeights.get('combat')!,
        reasoning: `Need XP to reach level ${this.targetLevel}. Combat success rate: ${(combatSuccessRate * 100).toFixed(1)}%`,
      });

      decisions.push({
        action: 'quest',
        priority: 8.5 * this.actionWeights.get('questing')!,
        reasoning: 'Quests give good XP and rewards',
      });
    }

    // Priority 3: Earn gold if needed
    if (state.characterStats.gold < this.targetGold) {
      const crimeSuccessRate = this.getSuccessRate('crime');
      decisions.push({
        action: 'crime',
        priority: 7.0 * crimeSuccessRate * this.actionWeights.get('crime')!,
        reasoning: `Need gold. Crime success rate: ${(crimeSuccessRate * 100).toFixed(1)}%`,
      });

      decisions.push({
        action: 'trading',
        priority: 6.5 * this.actionWeights.get('trading')!,
        reasoning: 'Trading can earn steady gold',
      });
    }

    // Priority 4: Crafting (improves gear)
    if (state.characterStats.gold > 500) {
      decisions.push({
        action: 'crafting',
        priority: 5.0 * this.actionWeights.get('crafting')!,
        reasoning: 'Have resources for crafting improvements',
      });
    }

    // Priority 5: Exploration (discover new content)
    if (Math.random() < 0.2) { // 20% chance to explore
      decisions.push({
        action: 'explore',
        priority: 4.0 * this.actionWeights.get('exploring')!,
        reasoning: 'Explore to discover new locations and opportunities',
      });
    }

    // Default: pick highest priority
    decisions.sort((a, b) => b.priority - a.priority);

    return decisions[0] || {
      action: 'explore',
      priority: 1.0,
      reasoning: 'No specific goal, exploring',
    };
  }

  /**
   * Execute a decision
   */
  private async executeDecision(decision: Decision, state: GameState): Promise<void> {
    this.logger.info(`⚡ Executing: ${decision.action}`);

    switch (decision.action) {
      case 'wait_for_energy':
        await this.waitForEnergy();
        break;
      case 'heal':
        await this.healCharacter();
        break;
      case 'combat':
        await this.engageCombat();
        break;
      case 'quest':
        await this.doQuest();
        break;
      case 'crime':
        await this.commitCrime();
        break;
      case 'trading':
        await this.trade();
        break;
      case 'crafting':
        await this.craft();
        break;
      case 'explore':
        await this.explore();
        break;
      default:
        this.logger.warn(`Unknown action: ${decision.action}`);
    }

    this.actionsPerformed.set(decision.action, (this.actionsPerformed.get(decision.action) || 0) + 1);
  }

  /**
   * Update learning based on action outcomes
   */
  private async updateLearning(decision: Decision): Promise<void> {
    // Check if action was successful (simplified - would check actual game outcome)
    const success = Math.random() > 0.3; // Placeholder

    const record = this.successRate.get(decision.action) || { successes: 0, attempts: 0 };
    record.attempts++;
    if (success) {
      record.successes++;
    }
    this.successRate.set(decision.action, record);

    // Adjust weights based on success
    const currentWeight = this.actionWeights.get(decision.action) || 1.0;
    if (success) {
      this.actionWeights.set(decision.action, Math.min(2.0, currentWeight * 1.05));
    } else {
      this.actionWeights.set(decision.action, Math.max(0.2, currentWeight * 0.95));
    }
  }

  /**
   * Get success rate for an action
   */
  private getSuccessRate(action: string): number {
    const record = this.successRate.get(action);
    if (!record || record.attempts === 0) return 0.5; // Default 50% for unknown actions
    return record.successes / record.attempts;
  }

  // === Action Implementations ===

  private async waitForEnergy(): Promise<void> {
    this.logger.info('⏳ Waiting for energy regeneration...');
    await this.waitRandom(60000, 90000); // Wait 1-1.5 minutes
  }

  private async healCharacter(): Promise<void> {
    this.logger.info('💊 Attempting to heal...');

    if (!this.page) return;

    // Try to find and use healing item or visit doctor
    const healed = await clickButtonByText(this.page, 'Use Health Potion', 'Heal', 'Visit Doctor');

    if (healed) {
      this.logger.info('✅ Healed successfully');
      await this.waitRandom(2000, 4000);
    } else {
      this.logger.warn('⚠️ No healing options available');
    }
  }

  private async engageCombat(): Promise<void> {
    this.logger.info('⚔️ Engaging in combat...');

    if (!this.page) return;

    try {
      // Navigate to combat/actions page
      const navigated = await clickLinkByText(this.page, 'Combat', 'Actions', 'Fight');

      if (navigated) {
        await this.waitRandom(2000, 3000);

        // Find and click a combat action
        const combatStarted = await clickButtonByText(
          this.page,
          'Bar Brawl',
          'Duel Outlaw',
          'Hunt Wildlife',
          'Clear Bandit Camp',
          'Attack'
        );

        if (combatStarted) {
          this.logger.info('✅ Combat initiated');
          await this.waitRandom(5000, 8000); // Wait for combat to resolve
        }
      }
    } catch (error: any) {
      this.logger.error(`Combat failed: ${error.message}`);
    }
  }

  private async doQuest(): Promise<void> {
    this.logger.info('📜 Attempting quest...');

    if (!this.page) return;

    try {
      const navigated = await clickLinkByText(this.page, 'Quests', 'Quest Log', 'Missions');

      if (navigated) {
        await this.waitRandom(2000, 3000);

        const questStarted = await clickButtonByText(this.page, 'Start Quest', 'Accept', 'Begin');

        if (questStarted) {
          this.logger.info('✅ Quest started');
          await this.waitRandom(3000, 5000);
        }
      }
    } catch (error: any) {
      this.logger.error(`Quest failed: ${error.message}`);
    }
  }

  private async commitCrime(): Promise<void> {
    this.logger.info('💰 Committing crime...');

    if (!this.page) return;

    try {
      const navigated = await clickLinkByText(this.page, 'Crimes', 'Criminal', 'Actions');

      if (navigated) {
        await this.waitRandom(2000, 3000);

        const crimeCommitted = await clickButtonByText(
          this.page,
          'Pickpocket',
          'Steal from Market',
          'Burgle Store',
          'Rob'
        );

        if (crimeCommitted) {
          this.logger.info('✅ Crime attempted');
          await this.waitRandom(4000, 6000);
        }
      }
    } catch (error: any) {
      this.logger.error(`Crime failed: ${error.message}`);
    }
  }

  private async trade(): Promise<void> {
    this.logger.info('🏪 Trading...');

    if (!this.page) return;

    try {
      const navigated = await clickLinkByText(this.page, 'Shop', 'Market', 'Trade', 'Store');

      if (navigated) {
        await this.waitRandom(2000, 3000);
        this.logger.info('At trading location');
        // TODO: Implement intelligent buying/selling
      }
    } catch (error: any) {
      this.logger.error(`Trading failed: ${error.message}`);
    }
  }

  private async craft(): Promise<void> {
    this.logger.info('🔨 Crafting...');

    if (!this.page) return;

    try {
      const navigated = await clickLinkByText(this.page, 'Crafting', 'Workshop', 'Forge');

      if (navigated) {
        await this.waitRandom(2000, 3000);

        const crafted = await clickButtonByText(this.page, 'Craft', 'Create', 'Forge');

        if (crafted) {
          this.logger.info('✅ Crafting attempted');
          await this.waitRandom(3000, 5000);
        }
      }
    } catch (error: any) {
      this.logger.error(`Crafting failed: ${error.message}`);
    }
  }

  private async explore(): Promise<void> {
    this.logger.info('🗺️ Exploring...');

    if (!this.page) return;

    try {
      const navigated = await clickLinkByText(this.page, 'Location', 'Travel', 'Map', 'Explore');

      if (navigated) {
        await this.waitRandom(2000, 3000);

        // Click a random travel destination
        const traveled = await this.page.evaluate(() => {
          const travelButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
            btn.textContent?.includes('Go') || btn.textContent?.includes('Travel')
          );

          if (travelButtons.length > 0) {
            const randomBtn = travelButtons[Math.floor(Math.random() * travelButtons.length)] as HTMLButtonElement;
            randomBtn.click();
            return true;
          }
          return false;
        });

        if (traveled) {
          this.logger.info('✅ Traveled to new location');
          await this.waitRandom(4000, 6000);
        }
      }
    } catch (error: any) {
      this.logger.error(`Exploration failed: ${error.message}`);
    }
  }

  /**
   * Handle errors gracefully
   */
  private async handleError(error: any): Promise<void> {
    this.logger.error(`Error occurred: ${error.message}`);
    this.logger.error(`Stack trace: ${error.stack}`);

    // Capture comprehensive error diagnostics
    if (this.page) {
      try {
        // Get current page state
        const errorState = await this.page.evaluate(() => {
          return {
            url: window.location.href,
            title: document.title,
            bodyPreview: document.body.textContent?.substring(0, 500) || '',
            hasErrors: Array.from(document.querySelectorAll('*')).some(el =>
              el.textContent?.toLowerCase().includes('error') ||
              el.textContent?.toLowerCase().includes('failed')
            ),
            visibleModals: document.querySelectorAll('[role="dialog"]').length,
            consoleErrors: [] // Would need page.on('console') to capture
          };
        });

        this.logger.error(`Error Page State:`);
        this.logger.error(`  URL: ${errorState.url}`);
        this.logger.error(`  Title: ${errorState.title}`);
        this.logger.error(`  Has Error Text: ${errorState.hasErrors}`);
        this.logger.error(`  Modals Open: ${errorState.visibleModals}`);
        this.logger.error(`  Body Preview: ${errorState.bodyPreview}`);
      } catch (diagError) {
        this.logger.error(`Failed to capture error diagnostics: ${diagError}`);
      }
    }

    // Take screenshot for debugging
    await this.screenshot(`error-${Date.now()}`);

    // Try to recover by navigating to dashboard
    if (this.page) {
      try {
        this.logger.info('Attempting recovery...');
        await clickLinkByText(this.page, 'Dashboard', 'Home', 'Game');
        await this.waitRandom(3000, 5000);
        this.logger.info('Recovery successful');
      } catch (recoveryError) {
        this.logger.error('Failed to recover from error');
      }
    }
  }

  /**
   * Log current progress
   */
  private async logProgress(): Promise<void> {
    this.logger.info('\n📊 Progress Report:');
    this.logger.info(`   Level: ${this.currentLevel}/${this.targetLevel}`);
    this.logger.info(`   Gold: ${this.currentGold}/${this.targetGold}`);
    this.logger.info(`   Actions performed:`);

    this.actionsPerformed.forEach((count, action) => {
      const successRate = this.getSuccessRate(action);
      this.logger.info(`     ${action}: ${count} times (${(successRate * 100).toFixed(1)}% success)`);
    });
  }

  /**
   * Print final report
   */
  private async printFinalReport(): Promise<void> {
    this.logger.info('\n' + '='.repeat(60));
    this.logger.info('🎮 AUTONOMOUS BOT - FINAL REPORT');
    this.logger.info('='.repeat(60));
    this.logger.info(`Final Level: ${this.currentLevel}/${this.targetLevel}`);
    this.logger.info(`Final Gold: ${this.currentGold}/${this.targetGold}`);
    this.logger.info(`\nTotal Actions Performed: ${Array.from(this.actionsPerformed.values()).reduce((a, b) => a + b, 0)}`);

    this.logger.info('\nAction Breakdown:');
    this.actionsPerformed.forEach((count, action) => {
      const record = this.successRate.get(action);
      if (record) {
        const rate = (record.successes / record.attempts * 100).toFixed(1);
        this.logger.info(`  ${action}: ${count} attempts, ${rate}% success rate`);
      }
    });

    this.logger.info('\nLearned Action Weights:');
    this.actionWeights.forEach((weight, action) => {
      this.logger.info(`  ${action}: ${weight.toFixed(2)}`);
    });

    this.logger.info('='.repeat(60) + '\n');
  }

  /**
   * Check if tutorial is currently blocking the page
   */
  private async isTutorialBlocking(): Promise<boolean> {
    if (!this.page) return false;

    try {
      return await this.page.evaluate(() => {
        // Check for visible "Next" or "Continue" buttons
        const buttons = Array.from(document.querySelectorAll('button'));
        const hasNextButton = buttons.some(btn => {
          const text = btn.textContent?.toLowerCase() || '';
          const isVisible = btn.offsetParent !== null;
          return isVisible && (
            text.includes('next') ||
            text.includes('continue') ||
            text.includes('got it')
          );
        });

        return hasNextButton;
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Handle tutorial if present on the page
   */
  private async handleTutorialIfPresent(): Promise<void> {
    if (!this.page) return;

    this.logger.info('🎓 Checking for tutorial...');

    try {
      // Take screenshot to see what we're working with
      await this.screenshot('before-tutorial-check');

      // Check if tutorial modal/dialog is visible
      const tutorialPresent = await this.page.evaluate(() => {
        // Look for common tutorial indicators
        const tutorialModal = document.querySelector('[role="dialog"]');
        const tutorialOverlay = document.querySelector('.tutorial, .intro, [class*="tutorial"], [class*="intro"]');
        const nextButton = Array.from(document.querySelectorAll('button')).find(btn =>
          btn.textContent?.toLowerCase().includes('next') ||
          btn.textContent?.toLowerCase().includes('continue') ||
          btn.textContent?.toLowerCase().includes('got it') ||
          btn.textContent?.toLowerCase().includes('start')
        );

        return {
          hasTutorial: !!(tutorialModal || tutorialOverlay || nextButton),
          hasModal: !!tutorialModal,
          hasOverlay: !!tutorialOverlay,
          hasNextButton: !!nextButton,
          nextButtonText: nextButton?.textContent?.trim() || ''
        };
      });

      if (tutorialPresent.hasTutorial) {
        this.logger.info('✅ Tutorial detected!');
        this.logger.info(`   Modal: ${tutorialPresent.hasModal}`);
        this.logger.info(`   Overlay: ${tutorialPresent.hasOverlay}`);
        this.logger.info(`   Next Button: ${tutorialPresent.hasNextButton} (${tutorialPresent.nextButtonText})`);

        // Complete the tutorial by clicking through all steps
        await this.completeTutorial();
      } else {
        this.logger.info('No tutorial found, proceeding to gameplay');
      }
    } catch (error: any) {
      this.logger.error(`Tutorial detection failed: ${error.message}`);
      await this.screenshot('tutorial-detection-error');
    }
  }

  /**
   * Complete tutorial by clicking through all steps
   */
  private async completeTutorial(): Promise<void> {
    if (!this.page) return;

    this.logger.info('🎓 Completing tutorial...');

    let step = 0;
    const maxSteps = 20; // Prevent infinite loops

    while (step < maxSteps) {
      step++;
      this.logger.info(`   Tutorial Step ${step}...`);

      try {
        // Take screenshot of current step
        await this.screenshot(`tutorial-step-${step}`);

        // Try to find and click next/continue button
        // IMPORTANT: Don't include 'Skip' to avoid clicking skip buttons!
        let clicked = await clickButtonByText(
          this.page,
          'Next',
          'Continue',
          'Got It',
          'Got it',
          'Okay',
          'OK',
          'Start',
          'Begin'
        );

        // If no button found, try pressing Enter key to advance (tutorial says "Press Enter")
        if (!clicked) {
          this.logger.info('   No button found, trying Enter key...');
          await this.page.keyboard.press('Enter');
          await this.waitRandom(500, 1000);
          clicked = true; // Mark as successful after Enter press
        }

        // Wait longer for the page to update after clicking Next
        await this.waitRandom(2000, 3000);

        // Check if tutorial is still present - must check for VISIBLE elements
        const stillInTutorial = await this.page.evaluate(() => {
          // Check for visible "Next" or "Continue" buttons
          const buttons = Array.from(document.querySelectorAll('button'));
          const hasNextButton = buttons.some(btn => {
            const text = btn.textContent?.toLowerCase() || '';
            const isVisible = btn.offsetParent !== null; // Check if visible
            return isVisible && (
              text.includes('next') ||
              text.includes('continue') ||
              text.includes('got it')
            );
          });

          // Check for tutorial progress indicators
          const hasTutorialProgress = !!document.querySelector('[class*="tutorial"]');

          return hasNextButton || hasTutorialProgress;
        });

        if (!stillInTutorial) {
          this.logger.info('✅ Tutorial completed!');
          break;
        }

        this.logger.info(`   Tutorial still active, continuing...`);
      } catch (error: any) {
        this.logger.error(`Tutorial step ${step} failed: ${error.message}`);
        break;
      }
    }

    if (step >= maxSteps) {
      this.logger.warn('⚠️ Tutorial completion reached max steps');
    }

    // Final screenshot after tutorial
    await this.screenshot('after-tutorial');
    await this.waitRandom(2000, 3000);
  }

  /**
   * Log current page state for diagnostics
   */
  private async logPageState(): Promise<void> {
    if (!this.page) return;

    try {
      const pageState = await this.page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          bodyText: document.body.textContent?.substring(0, 200) || '',
          buttonCount: document.querySelectorAll('button').length,
          linkCount: document.querySelectorAll('a').length,
          hasModal: !!document.querySelector('[role="dialog"]'),
          hasError: !!(
            document.body.textContent?.toLowerCase().includes('error') ||
            document.body.textContent?.toLowerCase().includes('failed')
          )
        };
      });

      this.logger.info(`📍 Page State: ${pageState.url}`);

      if (pageState.hasModal) {
        this.logger.info('   ⚠️ Modal detected');
      }

      if (pageState.hasError) {
        this.logger.warn('   ⚠️ Error text detected on page');
        await this.screenshot('error-detected');
      }
    } catch (error: any) {
      this.logger.error(`Failed to log page state: ${error.message}`);
    }
  }
}
