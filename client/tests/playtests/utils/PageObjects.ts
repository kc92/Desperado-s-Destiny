/**
 * Page Object Pattern Implementation
 *
 * Centralizes selectors and common actions for all major game pages.
 * Makes bot code more maintainable and reusable.
 *
 * Usage:
 *   const loginPage = new LoginPage(page);
 *   await loginPage.login('username', 'password');
 */

import { Page, ElementHandle } from 'puppeteer';
import {
  clickButtonByText,
  clickLinkByText,
  typeByPlaceholder,
  hasElementWithText,
  getElementCount,
  navigateByHref,
  getTextContent,
  waitAndClickButton,
  clickRandomElement,
  pressEnterOnInput
} from './BotSelectors.js';

/**
 * Base Page Object
 * Provides common functionality for all page objects
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Wait for a random amount of time (simulates human behavior)
   */
  protected async waitRandom(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Check if page is currently active by URL
   */
  async isActive(urlPath: string): Promise<boolean> {
    const url = this.page.url();
    return url.includes(urlPath);
  }

  /**
   * Take a screenshot of the current page
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
}

/**
 * Login Page Object
 * Handles login form interactions and registration navigation
 */
export class LoginPage extends BasePage {
  private selectors = {
    usernameInput: ['username', 'user', 'email'],
    passwordInput: ['password', 'pass'],
    loginButton: ['Login', 'Sign In', 'Submit', 'Log In'],
    registerLink: ['Register', 'Sign Up', 'Create Account'],
    forgotPasswordLink: ['Forgot Password', 'Reset Password']
  };

  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<boolean> {
    try {
      // Type username
      for (const placeholder of this.selectors.usernameInput) {
        const typed = await typeByPlaceholder(this.page, placeholder, username);
        if (typed) break;
      }

      await this.waitRandom(500, 1000);

      // Type password
      for (const placeholder of this.selectors.passwordInput) {
        const typed = await typeByPlaceholder(this.page, placeholder, password);
        if (typed) break;
      }

      await this.waitRandom(500, 1000);

      // Click login button
      const clicked = await clickButtonByText(this.page, ...this.selectors.loginButton);

      if (clicked) {
        await this.waitRandom(2000, 3000);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  /**
   * Navigate to registration page
   */
  async goToRegister(): Promise<boolean> {
    return await clickLinkByText(this.page, ...this.selectors.registerLink);
  }

  /**
   * Navigate to forgot password page
   */
  async goToForgotPassword(): Promise<boolean> {
    return await clickLinkByText(this.page, ...this.selectors.forgotPasswordLink);
  }

  /**
   * Check if login page is currently displayed
   */
  async isDisplayed(): Promise<boolean> {
    return await hasElementWithText(this.page, 'Login') ||
           await hasElementWithText(this.page, 'Sign In');
  }
}

/**
 * Character Selection Page Object
 * Handles character selection and creation
 */
export class CharacterSelectionPage extends BasePage {
  private selectors = {
    playButton: ['Play', 'Select', 'Choose', 'Continue'],
    createCharacterButton: ['Create', 'New Character', 'Create Character'],
    characterName: ['name', 'character name'],
    characterClass: ['class', 'archetype'],
    confirmButton: ['Confirm', 'Create', 'Submit', 'Start'],
    deleteButton: ['Delete', 'Remove']
  };

  /**
   * Select character and start playing
   */
  async selectCharacter(): Promise<boolean> {
    return await clickButtonByText(this.page, ...this.selectors.playButton);
  }

  /**
   * Create a new character
   */
  async createCharacter(name: string): Promise<boolean> {
    try {
      // Click create character button
      const clicked = await clickButtonByText(this.page, ...this.selectors.createCharacterButton);
      if (!clicked) return false;

      await this.waitRandom(1000, 2000);

      // Enter character name
      for (const placeholder of this.selectors.characterName) {
        const typed = await typeByPlaceholder(this.page, placeholder, name);
        if (typed) break;
      }

      await this.waitRandom(1000, 1500);

      // Confirm creation
      return await clickButtonByText(this.page, ...this.selectors.confirmButton);
    } catch (error) {
      console.error('Character creation error:', error);
      return false;
    }
  }

  /**
   * Get count of available characters
   */
  async getCharacterCount(): Promise<number> {
    return await getElementCount(this.page, '.character, .character-card, [class*="character"]');
  }

  /**
   * Check if character selection page is displayed
   */
  async isDisplayed(): Promise<boolean> {
    return await hasElementWithText(this.page, 'Select') ||
           await hasElementWithText(this.page, 'Character');
  }
}

/**
 * Game Dashboard Page Object
 * Handles main navigation and stats display
 */
export class GameDashboardPage extends BasePage {
  private selectors = {
    navigationLinks: {
      combat: ['Combat', 'Fight', 'Battle'],
      shop: ['Shop', 'Store', 'Market'],
      inventory: ['Inventory', 'Items', 'Bag'],
      gang: ['Gang', 'Crew', 'Faction'],
      mail: ['Mail', 'Messages', 'Inbox'],
      friends: ['Friends', 'Social', 'Players'],
      skills: ['Skills', 'Training', 'Abilities'],
      quests: ['Quests', 'Missions', 'Tasks'],
      location: ['Location', 'Travel', 'Map'],
      leaderboard: ['Leaderboard', 'Rankings', 'Top Players'],
      actions: ['Actions', 'Activities']
    },
    stats: {
      gold: '.gold, [class*="gold"]',
      energy: '.energy, [class*="energy"]',
      health: '.health, [class*="health"]',
      level: '.level, [class*="level"]'
    }
  };

  /**
   * Navigate to a specific page
   */
  async navigateTo(pageName: keyof typeof this.selectors.navigationLinks): Promise<boolean> {
    const links = this.selectors.navigationLinks[pageName];
    return await clickLinkByText(this.page, ...links);
  }

  /**
   * Get current gold amount
   */
  async getGold(): Promise<number> {
    const goldText = await getTextContent(this.page, this.selectors.stats.gold);
    if (!goldText) return 0;

    const match = goldText.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Get current energy amount
   */
  async getEnergy(): Promise<number> {
    const energyText = await getTextContent(this.page, this.selectors.stats.energy);
    if (!energyText) return 0;

    const match = energyText.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Check if dashboard is displayed
   */
  async isDisplayed(): Promise<boolean> {
    return await hasElementWithText(this.page, 'Dashboard') ||
           await hasElementWithText(this.page, 'Game') ||
           (await this.page.url()).includes('/game');
  }
}

/**
 * Combat Page Object
 * Handles combat encounters and battle actions
 */
export class CombatPage extends BasePage {
  private selectors = {
    attackButton: ['Fight', 'Attack', 'Strike', 'Shoot', 'Fire'],
    defendButton: ['Defend', 'Block', 'Guard', 'Evade'],
    skillButton: ['Skill', 'Special', 'Ability', 'Power'],
    fleeButton: ['Flee', 'Escape', 'Run'],
    startCombatButton: ['Start Combat', 'Begin', 'Engage', 'Battle'],
    victoryText: ['Victory', 'Won', 'Defeated Enemy', 'Success'],
    defeatText: ['Defeat', 'Lost', 'You Died', 'Failed'],
    continueButton: ['Continue', 'Close', 'Finish', 'Done', 'OK']
  };

  /**
   * Start a combat encounter
   */
  async startCombat(): Promise<boolean> {
    return await clickButtonByText(this.page, ...this.selectors.startCombatButton);
  }

  /**
   * Perform attack action
   */
  async attack(): Promise<boolean> {
    return await clickButtonByText(this.page, ...this.selectors.attackButton);
  }

  /**
   * Perform defend action
   */
  async defend(): Promise<boolean> {
    return await clickButtonByText(this.page, ...this.selectors.defendButton);
  }

  /**
   * Use skill/special ability
   */
  async useSkill(): Promise<boolean> {
    return await clickButtonByText(this.page, ...this.selectors.skillButton);
  }

  /**
   * Attempt to flee from combat
   */
  async flee(): Promise<boolean> {
    return await clickButtonByText(this.page, ...this.selectors.fleeButton);
  }

  /**
   * Check if combat resulted in victory
   */
  async checkVictory(): Promise<boolean> {
    for (const text of this.selectors.victoryText) {
      if (await hasElementWithText(this.page, text)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if combat resulted in defeat
   */
  async checkDefeat(): Promise<boolean> {
    for (const text of this.selectors.defeatText) {
      if (await hasElementWithText(this.page, text)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if combat is still active
   */
  async isCombatActive(): Promise<boolean> {
    return await hasElementWithText(this.page, 'Combat') ||
           await hasElementWithText(this.page, 'Fighting') ||
           await hasElementWithText(this.page, 'Battle');
  }

  /**
   * Close combat result screen
   */
  async closeCombat(): Promise<boolean> {
    return await clickButtonByText(this.page, ...this.selectors.continueButton);
  }

  /**
   * Get count of available combat encounters
   */
  async getCombatCount(): Promise<number> {
    return await getElementCount(this.page, 'button:has-text("Fight"), button:has-text("Attack")');
  }
}

/**
 * Shop Page Object
 * Handles item browsing and purchases
 */
export class ShopPage extends BasePage {
  private selectors = {
    buyButton: ['Buy', 'Purchase'],
    sellButton: ['Sell', 'Sell Item'],
    confirmButton: ['Confirm', 'Yes', 'Accept'],
    cancelButton: ['Cancel', 'No', 'Back'],
    itemSelector: '.item, .shop-item, .market-item, [class*="item"]',
    priceSelector: '.price, .cost, [class*="price"], [class*="cost"]'
  };

  /**
   * Buy a random item
   */
  async buyRandomItem(): Promise<boolean> {
    return await clickRandomElement(this.page, 'button:has-text("Buy")');
  }

  /**
   * Buy item by name
   */
  async buyItem(itemName: string): Promise<boolean> {
    try {
      const bought = await this.page.evaluate((name) => {
        const items = Array.from(document.querySelectorAll('.item, .shop-item, [class*="item"]'));
        const item = items.find(el => el.textContent?.includes(name));

        if (item) {
          const buyButton = item.querySelector('button');
          if (buyButton && (buyButton.textContent?.includes('Buy') || buyButton.textContent?.includes('Purchase'))) {
            buyButton.click();
            return true;
          }
        }
        return false;
      }, itemName);

      if (bought) {
        await this.waitRandom(1000, 2000);
        await clickButtonByText(this.page, ...this.selectors.confirmButton);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Buy item error:', error);
      return false;
    }
  }

  /**
   * Get count of items in shop
   */
  async getItemCount(): Promise<number> {
    return await getElementCount(this.page, this.selectors.itemSelector);
  }

  /**
   * Check if item is affordable
   */
  async canAfford(itemName: string, gold: number): Promise<boolean> {
    return await this.page.evaluate((name, availableGold) => {
      const items = Array.from(document.querySelectorAll('.item, .shop-item, [class*="item"]'));
      const item = items.find(el => el.textContent?.includes(name));

      if (item) {
        const priceText = item.textContent || '';
        const priceMatch = priceText.match(/(\d+)\s*(?:gold|g|\$)/i);
        if (priceMatch) {
          return parseInt(priceMatch[1]) <= availableGold;
        }
      }
      return false;
    }, itemName, gold);
  }
}

/**
 * Inventory Page Object
 * Handles inventory management and item actions
 */
export class InventoryPage extends BasePage {
  private selectors = {
    sellButton: ['Sell', 'Sell Item'],
    useButton: ['Use', 'Consume', 'Equip'],
    dropButton: ['Drop', 'Discard', 'Trash'],
    itemSelector: '.item, .inventory-item, [class*="item"]'
  };

  /**
   * Sell a random item
   */
  async sellRandomItem(): Promise<boolean> {
    return await clickRandomElement(this.page, 'button:has-text("Sell")');
  }

  /**
   * Use an item by name
   */
  async useItem(itemName: string): Promise<boolean> {
    try {
      return await this.page.evaluate((name) => {
        const items = Array.from(document.querySelectorAll('.item, .inventory-item, [class*="item"]'));
        const item = items.find(el => el.textContent?.includes(name));

        if (item) {
          const useButton = item.querySelector('button');
          if (useButton && useButton.textContent?.includes('Use')) {
            useButton.click();
            return true;
          }
        }
        return false;
      }, itemName);
    } catch (error) {
      console.error('Use item error:', error);
      return false;
    }
  }

  /**
   * Get count of items in inventory
   */
  async getItemCount(): Promise<number> {
    return await getElementCount(this.page, this.selectors.itemSelector);
  }

  /**
   * Check if inventory is full
   */
  async isFull(): Promise<boolean> {
    return await hasElementWithText(this.page, 'Full') ||
           await hasElementWithText(this.page, 'No Space');
  }
}

/**
 * Gang Page Object
 * Handles gang interactions and management
 */
export class GangPage extends BasePage {
  private selectors = {
    joinButton: ['Join', 'Apply', 'Request to Join'],
    createButton: ['Create Gang', 'Found Gang', 'New Gang'],
    leaveButton: ['Leave', 'Quit', 'Abandon'],
    contributeButton: ['Contribute', 'Donate', 'Deposit'],
    withdrawButton: ['Withdraw', 'Take'],
    inviteButton: ['Invite', 'Recruit'],
    chatInput: 'input[placeholder*="gang" i], [data-testid="gang-chat-input"]'
  };

  /**
   * Join a gang
   */
  async joinGang(): Promise<boolean> {
    return await clickButtonByText(this.page, ...this.selectors.joinButton);
  }

  /**
   * Create a new gang
   */
  async createGang(name: string): Promise<boolean> {
    try {
      const clicked = await clickButtonByText(this.page, ...this.selectors.createButton);
      if (!clicked) return false;

      await this.waitRandom(1000, 2000);

      const typed = await typeByPlaceholder(this.page, 'name', name);
      if (!typed) return false;

      await this.waitRandom(500, 1000);

      return await clickButtonByText(this.page, 'Confirm', 'Create', 'Submit');
    } catch (error) {
      console.error('Create gang error:', error);
      return false;
    }
  }

  /**
   * Contribute gold to gang
   */
  async contribute(amount: number): Promise<boolean> {
    try {
      const clicked = await clickButtonByText(this.page, ...this.selectors.contributeButton);
      if (!clicked) return false;

      await this.waitRandom(500, 1000);

      const typed = await typeByPlaceholder(this.page, 'amount', amount.toString());
      if (!typed) return false;

      await this.waitRandom(500, 1000);

      return await clickButtonByText(this.page, 'Confirm', 'Submit', 'Contribute');
    } catch (error) {
      console.error('Contribution error:', error);
      return false;
    }
  }

  /**
   * Send a gang chat message
   */
  async sendChatMessage(message: string): Promise<boolean> {
    try {
      const input = await this.page.$(this.selectors.chatInput);
      if (!input) return false;

      await input.type(message, { delay: 50 });
      await this.waitRandom(500, 1000);

      try {
        await input.press('Enter');
      } catch {
        await clickButtonByText(this.page, 'Send', 'Post');
      }

      return true;
    } catch (error) {
      console.error('Gang chat error:', error);
      return false;
    }
  }

  /**
   * Check if in a gang
   */
  async isInGang(): Promise<boolean> {
    return await hasElementWithText(this.page, 'Gang') &&
           await hasElementWithText(this.page, 'Members');
  }
}

/**
 * Mail Page Object
 * Handles mail composition and reading
 */
export class MailPage extends BasePage {
  private selectors = {
    composeButton: ['Compose', 'New Mail', 'New Message', 'Send Mail'],
    sendButton: ['Send', 'Submit', 'Send Mail'],
    deleteButton: ['Delete', 'Remove', 'Trash'],
    replyButton: ['Reply', 'Respond'],
    recipientInput: ['recipient', 'to', 'player'],
    subjectInput: ['subject', 'title'],
    messageInput: ['message', 'body', 'content']
  };

  /**
   * Compose and send mail
   */
  async sendMail(recipient: string, subject: string, message: string): Promise<boolean> {
    try {
      const clicked = await clickButtonByText(this.page, ...this.selectors.composeButton);
      if (!clicked) return false;

      await this.waitRandom(1000, 2000);

      // Fill in recipient
      for (const placeholder of this.selectors.recipientInput) {
        const typed = await typeByPlaceholder(this.page, placeholder, recipient);
        if (typed) break;
      }

      await this.waitRandom(500, 1000);

      // Fill in subject
      for (const placeholder of this.selectors.subjectInput) {
        const typed = await typeByPlaceholder(this.page, placeholder, subject);
        if (typed) break;
      }

      await this.waitRandom(500, 1000);

      // Fill in message
      for (const placeholder of this.selectors.messageInput) {
        const typed = await typeByPlaceholder(this.page, placeholder, message);
        if (typed) break;
      }

      await this.waitRandom(1000, 1500);

      return await clickButtonByText(this.page, ...this.selectors.sendButton);
    } catch (error) {
      console.error('Send mail error:', error);
      return false;
    }
  }

  /**
   * Get count of unread mail
   */
  async getUnreadCount(): Promise<number> {
    return await getElementCount(this.page, '.unread, [class*="unread"]');
  }

  /**
   * Delete a mail
   */
  async deleteMail(): Promise<boolean> {
    return await clickButtonByText(this.page, ...this.selectors.deleteButton);
  }
}

/**
 * Friends Page Object
 * Handles friend management and interactions
 */
export class FriendsPage extends BasePage {
  private selectors = {
    addButton: ['Add Friend', 'Send Request', 'Add', 'Request'],
    acceptButton: ['Accept', 'Approve', 'Confirm'],
    rejectButton: ['Reject', 'Decline', 'Deny'],
    removeButton: ['Remove', 'Unfriend', 'Delete'],
    usernameInput: ['username', 'player', 'name']
  };

  /**
   * Add a friend by username
   */
  async addFriend(username: string): Promise<boolean> {
    try {
      const clicked = await clickButtonByText(this.page, ...this.selectors.addButton);
      if (!clicked) return false;

      await this.waitRandom(500, 1000);

      for (const placeholder of this.selectors.usernameInput) {
        const typed = await typeByPlaceholder(this.page, placeholder, username);
        if (typed) break;
      }

      await this.waitRandom(500, 1000);

      return await clickButtonByText(this.page, 'Send', 'Submit', 'Add');
    } catch (error) {
      console.error('Add friend error:', error);
      return false;
    }
  }

  /**
   * Accept friend request
   */
  async acceptRequest(): Promise<boolean> {
    return await clickButtonByText(this.page, ...this.selectors.acceptButton);
  }

  /**
   * Get count of friend requests
   */
  async getRequestCount(): Promise<number> {
    return await getElementCount(this.page, '.request, .pending, [class*="request"]');
  }

  /**
   * Get count of friends
   */
  async getFriendCount(): Promise<number> {
    return await getElementCount(this.page, '.friend, .friend-item, [class*="friend"]');
  }
}

/**
 * Chat Page Object
 * Handles chat interactions
 */
export class ChatPage extends BasePage {
  private selectors = {
    chatInput: 'input[placeholder*="chat" i], input[placeholder*="message" i], textarea[placeholder*="chat" i], [data-testid="chat-input"]',
    sendButton: ['Send', 'Submit', 'Post'],
    channelSelector: '.channel, [class*="channel"]'
  };

  /**
   * Send a chat message
   */
  async sendMessage(message: string): Promise<boolean> {
    try {
      const input = await this.page.$(this.selectors.chatInput);
      if (!input) return false;

      await input.click();
      await this.waitRandom(300, 600);

      await input.type(message, { delay: 50 });
      await this.waitRandom(500, 1000);

      try {
        await input.press('Enter');
      } catch {
        await clickButtonByText(this.page, ...this.selectors.sendButton);
      }

      return true;
    } catch (error) {
      console.error('Send chat error:', error);
      return false;
    }
  }

  /**
   * Get count of chat messages
   */
  async getMessageCount(): Promise<number> {
    return await getElementCount(this.page, '.message, .chat-message, [class*="message"]');
  }

  /**
   * Switch chat channel
   */
  async switchChannel(channelName: string): Promise<boolean> {
    return await clickButtonByText(this.page, channelName);
  }
}

/**
 * Skills Page Object
 * Handles skill training and progression
 */
export class SkillsPage extends BasePage {
  private selectors = {
    trainButton: ['Train', 'Upgrade', 'Learn', 'Improve'],
    resetButton: ['Reset', 'Respec'],
    skillSelector: '.skill, .skill-item, [class*="skill"]'
  };

  /**
   * Train a skill by name
   */
  async trainSkill(skillName: string): Promise<boolean> {
    try {
      return await this.page.evaluate((name) => {
        const skills = Array.from(document.querySelectorAll('.skill, .skill-item, [class*="skill"]'));
        const skill = skills.find(el => el.textContent?.includes(name));

        if (skill) {
          const trainButton = skill.querySelector('button');
          if (trainButton && trainButton.textContent?.match(/Train|Upgrade|Learn/i)) {
            trainButton.click();
            return true;
          }
        }
        return false;
      }, skillName);
    } catch (error) {
      console.error('Train skill error:', error);
      return false;
    }
  }

  /**
   * Train a random skill
   */
  async trainRandomSkill(): Promise<boolean> {
    return await clickRandomElement(this.page, 'button:has-text("Train")');
  }

  /**
   * Get count of available skills
   */
  async getSkillCount(): Promise<number> {
    return await getElementCount(this.page, this.selectors.skillSelector);
  }

  /**
   * Get count of trainable skills
   */
  async getTrainableCount(): Promise<number> {
    return await getElementCount(this.page, 'button:has-text("Train")');
  }
}

/**
 * Quest Page Object
 * Handles quest browsing and acceptance
 */
export class QuestPage extends BasePage {
  private selectors = {
    acceptButton: ['Accept', 'Accept Quest', 'Take Quest'],
    startButton: ['Start', 'Begin', 'Start Quest'],
    completeButton: ['Complete', 'Turn In', 'Finish'],
    abandonButton: ['Abandon', 'Cancel', 'Drop'],
    questSelector: '.quest, .quest-item, [class*="quest"]'
  };

  /**
   * Accept a quest
   */
  async acceptQuest(): Promise<boolean> {
    return await clickButtonByText(this.page, ...this.selectors.acceptButton);
  }

  /**
   * Start a quest
   */
  async startQuest(): Promise<boolean> {
    return await clickButtonByText(this.page, ...this.selectors.startButton);
  }

  /**
   * Complete a quest
   */
  async completeQuest(): Promise<boolean> {
    return await clickButtonByText(this.page, ...this.selectors.completeButton);
  }

  /**
   * Get count of available quests
   */
  async getAvailableQuestCount(): Promise<number> {
    return await getElementCount(this.page, 'button:has-text("Accept"), button:has-text("Start")');
  }

  /**
   * Get count of active quests
   */
  async getActiveQuestCount(): Promise<number> {
    return await getElementCount(this.page, '.active, [class*="active"]');
  }

  /**
   * Check if quest is available
   */
  async hasQuest(questName: string): Promise<boolean> {
    return await hasElementWithText(this.page, questName);
  }
}

/**
 * Location Page Object
 * Handles location navigation and travel
 */
export class LocationPage extends BasePage {
  private selectors = {
    travelButton: ['Travel', 'Go', 'Visit', 'Enter'],
    exploreButton: ['Explore', 'Search', 'Investigate'],
    locationSelector: '.location, .place, [class*="location"]'
  };

  /**
   * Travel to a location by name
   */
  async travelTo(locationName: string): Promise<boolean> {
    try {
      return await this.page.evaluate((name) => {
        const locations = Array.from(document.querySelectorAll('.location, .place, button'));
        const location = locations.find(el => el.textContent?.includes(name));

        if (location && location instanceof HTMLElement) {
          location.click();
          return true;
        }
        return false;
      }, locationName);
    } catch (error) {
      console.error('Travel error:', error);
      return false;
    }
  }

  /**
   * Travel to a random location
   */
  async travelRandom(): Promise<boolean> {
    return await clickRandomElement(this.page, 'button:has-text("Travel"), button:has-text("Visit")');
  }

  /**
   * Explore current location
   */
  async explore(): Promise<boolean> {
    return await clickButtonByText(this.page, ...this.selectors.exploreButton);
  }

  /**
   * Get count of available locations
   */
  async getLocationCount(): Promise<number> {
    return await getElementCount(this.page, this.selectors.locationSelector);
  }

  /**
   * Check if at location
   */
  async isAtLocation(locationName: string): Promise<boolean> {
    return await hasElementWithText(this.page, locationName);
  }
}

/**
 * Leaderboard Page Object
 * Handles leaderboard viewing and filtering
 */
export class LeaderboardPage extends BasePage {
  private selectors = {
    filterButtons: ['Level', 'Gold', 'Combat', 'Reputation'],
    playerSelector: '.player, .rank, [class*="player"]'
  };

  /**
   * Filter leaderboard by category
   */
  async filterBy(category: string): Promise<boolean> {
    return await clickButtonByText(this.page, category);
  }

  /**
   * Get player rank
   */
  async getPlayerRank(username: string): Promise<number> {
    try {
      return await this.page.evaluate((name) => {
        const players = Array.from(document.querySelectorAll('.player, .rank, [class*="player"]'));
        const playerIndex = players.findIndex(el => el.textContent?.includes(name));
        return playerIndex >= 0 ? playerIndex + 1 : -1;
      }, username);
    } catch (error) {
      console.error('Get rank error:', error);
      return -1;
    }
  }

  /**
   * Get count of players on leaderboard
   */
  async getPlayerCount(): Promise<number> {
    return await getElementCount(this.page, this.selectors.playerSelector);
  }
}

/**
 * Actions Page Object
 * Handles action/activity selection
 */
export class ActionsPage extends BasePage {
  private selectors = {
    actionButton: ['Start', 'Begin', 'Do', 'Perform'],
    actionSelector: '.action, .activity, [class*="action"]'
  };

  /**
   * Perform an action by name
   */
  async performAction(actionName: string): Promise<boolean> {
    try {
      return await this.page.evaluate((name) => {
        const actions = Array.from(document.querySelectorAll('.action, .activity, button'));
        const action = actions.find(el => el.textContent?.includes(name));

        if (action && action instanceof HTMLElement) {
          action.click();
          return true;
        }
        return false;
      }, actionName);
    } catch (error) {
      console.error('Perform action error:', error);
      return false;
    }
  }

  /**
   * Get count of available actions
   */
  async getActionCount(): Promise<number> {
    return await getElementCount(this.page, this.selectors.actionSelector);
  }

  /**
   * Check if action is available
   */
  async isActionAvailable(actionName: string): Promise<boolean> {
    return await hasElementWithText(this.page, actionName);
  }
}
