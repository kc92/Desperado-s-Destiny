/**
 * Page Object Pattern Example
 *
 * Demonstrates the difference between using scattered selectors
 * versus the Page Object Pattern for cleaner, more maintainable code.
 */

import { Page } from 'puppeteer';
import {
  CombatPage,
  ShopPage,
  SkillsPage,
  GangPage,
  MailPage,
  QuestPage
} from '../utils/PageObjects.js';
import { clickButtonByText, hasElementWithText } from '../utils/BotSelectors.js';

/**
 * ❌ OLD WAY - Selectors scattered throughout methods
 */
class OldCombatBot {
  constructor(private page: Page) {}

  async engageInCombat(): Promise<void> {
    // Scattered selectors - hard to maintain
    const combatButtons = await this.page.$$('button');
    for (const button of combatButtons) {
      const text = await button.evaluate(el => el.textContent);
      if (text?.includes('Fight') || text?.includes('Attack')) {
        await button.click();
        break;
      }
    }

    // Execute combat with more scattered selectors
    let inCombat = true;
    while (inCombat) {
      // Attack logic with inline selectors
      const attackClicked = await clickButtonByText(this.page, 'Attack', 'Strike', 'Shoot');

      // Check victory with inline selectors
      const hasVictory = await hasElementWithText(this.page, 'Victory') ||
                        await hasElementWithText(this.page, 'Won');

      if (hasVictory) {
        inCombat = false;
      }
    }

    // Close combat with inline selectors
    await clickButtonByText(this.page, 'Continue', 'Close', 'Done');
  }
}

/**
 * ✅ NEW WAY - Using Page Object Pattern
 */
class NewCombatBot {
  private combatPage: CombatPage;

  constructor(private page: Page) {
    this.combatPage = new CombatPage(page);
  }

  async engageInCombat(): Promise<void> {
    // Clean, self-documenting code
    await this.combatPage.startCombat();

    // Execute combat with clear intent
    while (await this.combatPage.isCombatActive()) {
      await this.combatPage.attack();

      if (await this.combatPage.checkVictory()) {
        break;
      }

      if (await this.combatPage.checkDefeat()) {
        break;
      }
    }

    // Close combat
    await this.combatPage.closeCombat();
  }
}

/**
 * Complete Example - Multi-Page Bot using Page Objects
 */
export class ExamplePageObjectBot {
  // Initialize page objects once
  private combatPage: CombatPage;
  private shopPage: ShopPage;
  private skillsPage: SkillsPage;
  private gangPage: GangPage;
  private mailPage: MailPage;
  private questPage: QuestPage;

  constructor(private page: Page) {
    this.combatPage = new CombatPage(page);
    this.shopPage = new ShopPage(page);
    this.skillsPage = new SkillsPage(page);
    this.gangPage = new GangPage(page);
    this.mailPage = new MailPage(page);
    this.questPage = new QuestPage(page);
  }

  /**
   * Example 1: Combat Sequence
   */
  async doCombatSequence(): Promise<void> {
    console.log('Starting combat sequence...');

    // Start combat
    await this.combatPage.startCombat();

    // Fight until combat ends
    let turns = 0;
    while (await this.combatPage.isCombatActive() && turns < 20) {
      turns++;

      // 60% attack, 30% skill, 10% defend
      const roll = Math.random();
      if (roll < 0.6) {
        await this.combatPage.attack();
      } else if (roll < 0.9) {
        await this.combatPage.useSkill();
      } else {
        await this.combatPage.defend();
      }

      // Check results
      if (await this.combatPage.checkVictory()) {
        console.log('Victory!');
        break;
      }

      if (await this.combatPage.checkDefeat()) {
        console.log('Defeat!');
        break;
      }
    }

    // Close combat screen
    await this.combatPage.closeCombat();
  }

  /**
   * Example 2: Shopping Sequence
   */
  async doShoppingSequence(gold: number): Promise<void> {
    console.log('Starting shopping sequence...');

    // Check shop inventory
    const itemCount = await this.shopPage.getItemCount();
    console.log(`Shop has ${itemCount} items available`);

    // Buy specific item if affordable
    if (await this.shopPage.canAfford('Revolver', gold)) {
      await this.shopPage.buyItem('Revolver');
      console.log('Purchased Revolver!');
    } else {
      // Buy random cheap item
      await this.shopPage.buyRandomItem();
      console.log('Purchased random item');
    }
  }

  /**
   * Example 3: Skill Training Sequence
   */
  async doSkillTrainingSequence(): Promise<void> {
    console.log('Starting skill training...');

    // Check available skills
    const trainableCount = await this.skillsPage.getTrainableCount();
    console.log(`${trainableCount} skills available for training`);

    if (trainableCount > 0) {
      // Try to train specific skill
      const trained = await this.skillsPage.trainSkill('Combat Mastery');

      if (!trained) {
        // Fallback to random skill
        await this.skillsPage.trainRandomSkill();
      }

      console.log('Skill trained successfully');
    }
  }

  /**
   * Example 4: Gang Interaction Sequence
   */
  async doGangSequence(): Promise<void> {
    console.log('Starting gang interaction...');

    // Check if in a gang
    if (await this.gangPage.isInGang()) {
      // Contribute to gang
      await this.gangPage.contribute(100);
      console.log('Contributed 100 gold to gang');

      // Send gang chat message
      await this.gangPage.sendChatMessage('Ready for action!');
      console.log('Sent gang chat message');
    } else {
      // Join a gang
      await this.gangPage.joinGang();
      console.log('Joined a gang');
    }
  }

  /**
   * Example 5: Social Interaction Sequence
   */
  async doSocialSequence(): Promise<void> {
    console.log('Starting social interactions...');

    // Send mail to player
    await this.mailPage.sendMail(
      'PlayerName',
      'Greetings!',
      'Hello from the frontier!'
    );
    console.log('Sent mail');

    // Check for quests
    const questCount = await this.questPage.getAvailableQuestCount();
    console.log(`${questCount} quests available`);

    if (questCount > 0) {
      await this.questPage.acceptQuest();
      await this.questPage.startQuest();
      console.log('Started quest');
    }
  }

  /**
   * Example 6: Complete Bot Loop
   */
  async runCompleteLoop(): Promise<void> {
    console.log('=== Starting Complete Bot Loop ===');

    // 1. Do combat
    await this.doCombatSequence();
    await this.wait(2000, 3000);

    // 2. Train skills with rewards
    await this.doSkillTrainingSequence();
    await this.wait(1000, 2000);

    // 3. Shop for upgrades
    await this.doShoppingSequence(500);
    await this.wait(2000, 3000);

    // 4. Gang activities
    await this.doGangSequence();
    await this.wait(1500, 2500);

    // 5. Social interactions
    await this.doSocialSequence();
    await this.wait(2000, 4000);

    console.log('=== Bot Loop Complete ===');
  }

  /**
   * Helper: Random wait
   */
  private async wait(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Comparison Summary:
 *
 * OLD WAY (Scattered Selectors):
 * ❌ Selectors duplicated across methods
 * ❌ Hard to update when UI changes
 * ❌ Unclear what each selector does
 * ❌ No type safety for actions
 * ❌ Difficult to test
 *
 * NEW WAY (Page Objects):
 * ✅ Selectors centralized in page objects
 * ✅ Easy to update - change once, works everywhere
 * ✅ Self-documenting code
 * ✅ Type-safe methods
 * ✅ Easy to test and mock
 * ✅ Reusable across all bots
 */
