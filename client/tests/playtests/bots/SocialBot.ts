/**
 * SocialBot - Automated playtest bot focused on social interactions and roleplay
 *
 * Behavior Profile:
 * - Engages with chat and social features
 * - Sends and receives friend requests
 * - Participates in gang activities
 * - Sends mail to other players
 * - Explores social hubs (saloons, etc.)
 * - Interacts with NPCs
 * - Completes quests with social/story focus
 * - Reads and engages with in-game lore
 */

import { BotBase, BotConfig } from '../utils/BotBase.js';
import { clickButtonByText, navigateByHref, typeByPlaceholder, getElementCount, hasElementWithText, pressEnterOnInput } from '../utils/BotSelectors.js';
import { findButtonsByText } from '../utils/PuppeteerHelpers.js';

export class SocialBot extends BotBase {
  private friendsAdded: number = 0;
  private mailsSent: number = 0;
  private chatMessagesSent: number = 0;
  private npcInteractions: number = 0;
  private questsStarted: number = 0;

  private chatMessages = [
    "Howdy partner!",
    "Anyone up for a quest?",
    "This town is mighty fine",
    "Just passing through",
    "Looking for a gang to join",
    "Any bounties available?",
    "Fine weather we're having",
    "Heard there's trouble brewing in the canyon",
    "Anyone seen the sheriff?",
    "Looking to make some allies",
    "Greetings from the frontier!",
    "What brings you to these parts?",
    "Anyone trading goods?",
    "Looking for adventure",
    "This saloon serves the best whiskey!",
  ];

  constructor(config: BotConfig) {
    super(config);
  }

  async runBehaviorLoop(): Promise<void> {
    this.logger.info('Starting Social-Oriented behavior loop');

    let cycles = 0;
    const maxCycles = 1000; // Run for approximately 3-4 hours

    while (this.shouldContinue() && cycles < maxCycles) {
      cycles++;
      this.logger.info(`=== Social Cycle ${cycles}/${maxCycles} ===`);

      try {
        // Rotate through social activities
        const activity = cycles % 10;

        switch (activity) {
          case 0:
            await this.exploreSocialHub();
            break;
          case 1:
            await this.sendChatMessages();
            break;
          case 2:
            await this.interactWithNPCs();
            break;
          case 3:
            await this.manageFriends();
            break;
          case 4:
            await this.sendMail();
            break;
          case 5:
            await this.participateInGang();
            break;
          case 6:
            await this.exploreQuests();
            break;
          case 7:
            await this.readLore();
            break;
          case 8:
            await this.visitSocialLocations();
            break;
          case 9:
            await this.checkNotifications();
            break;
        }

        // Longer delays for social activities to simulate reading/thinking
        await this.waitRandom(15000, 45000);

        if (cycles % 10 === 0) {
          await this.checkSocialStatus();
        }

        if (cycles % 25 === 0) {
          await this.screenshot(`social-cycle-${cycles}`);
        }

      } catch (error) {
        this.logger.error(`Error in social cycle: ${error}`);
        this.metrics.recordError();
        await this.waitRandom(5000, 10000);
      }
    }

    this.logger.success(`Social bot completed ${cycles} cycles`);
  }

  /**
   * Explore social hubs like saloons and gathering places
   */
  private async exploreSocialHub(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Exploring social hub');

    try {
      // Navigate to location
      const navigated = await navigateByHref(this.page, '/game/location');
      if (!navigated) {
        this.logger.warn('Could not navigate to location page');
        return;
      }
      await this.waitRandom(2000, 3000);

      // Look for social locations
      const socialButtons = await findButtonsByText(this.page, 'Saloon', 'Tavern', 'Hotel', 'Plaza', 'Square', 'Town Hall');

      if (socialButtons.length > 0) {
        const location = socialButtons[Math.floor(Math.random() * socialButtons.length)];
        await location.click();
        await this.waitRandom(3000, 5000); // Take time to "look around"

        this.metrics.recordAction('social_hub_visit');
        this.logger.info('Visited social hub');

        // Read location description (simulate reading)
        await this.waitRandom(3000, 6000);
      } else {
        this.logger.info('No social locations found');
      }

    } catch (error) {
      this.logger.error(`Social hub exploration error: ${error}`);
    }
  }

  /**
   * Send messages in global or local chat
   */
  private async sendChatMessages(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Sending chat messages');

    try {
      // Look for chat input - try multiple selector approaches
      let chatInput = await this.page.$('input[placeholder*="chat" i]');
      if (!chatInput) {
        chatInput = await this.page.$('input[placeholder*="message" i]');
      }
      if (!chatInput) {
        chatInput = await this.page.$('textarea[placeholder*="chat" i]');
      }
      if (!chatInput) {
        chatInput = await this.page.$('textarea[placeholder*="message" i]');
      }
      if (!chatInput) {
        chatInput = await this.page.$('[data-testid="chat-input"]');
      }

      if (chatInput) {
        // Send 1-3 messages
        const messageCount = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < messageCount; i++) {
          const message = this.chatMessages[Math.floor(Math.random() * this.chatMessages.length)];

          await chatInput.click();
          await this.waitRandom(500, 1000);
          await chatInput.type(message, { delay: 50 });
          await this.waitRandom(1000, 2000);

          // Press enter or click send button
          try {
            await chatInput.press('Enter');
            await this.waitRandom(500, 1000);
          } catch {
            // If Enter doesn't work, try clicking send button
            const sent = await clickButtonByText(this.page, 'Send', 'Submit', 'Post');
            if (sent) {
              await this.waitRandom(500, 1000);
            }
          }

          this.chatMessagesSent++;
          this.metrics.recordAction('chat_message', { message });
          this.logger.info(`Sent chat: "${message}"`);

          await this.waitRandom(2000, 4000);
        }
      } else {
        this.logger.info('Chat input not found');
      }

    } catch (error) {
      this.logger.error(`Chat error: ${error}`);
    }
  }

  /**
   * Interact with NPCs
   */
  private async interactWithNPCs(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Interacting with NPCs');

    try {
      // Look for NPC elements
      const npcButtons = await findButtonsByText(this.page, 'Talk', 'Speak', 'Greet', 'Approach', 'Interact');

      if (npcButtons.length > 0) {
        const npc = npcButtons[Math.floor(Math.random() * npcButtons.length)];
        await npc.click();
        await this.waitRandom(2000, 3000);

        // Read dialogue (simulate reading)
        await this.waitRandom(3000, 6000);

        // Look for dialogue options
        const dialogueButtons = await findButtonsByText(this.page, 'Tell me', 'Ask about', 'Continue', 'Next');

        if (dialogueButtons.length > 0) {
          const option = dialogueButtons[Math.floor(Math.random() * dialogueButtons.length)];
          await option.click();
          await this.waitRandom(2000, 4000);

          // Read response
          await this.waitRandom(3000, 5000);
        }

        this.npcInteractions++;
        this.metrics.recordAction('npc_interaction', { interactionNumber: this.npcInteractions });
        this.logger.success(`NPC interaction #${this.npcInteractions} completed`);

        // Close dialogue
        const closed = await clickButtonByText(this.page, 'Close', 'Goodbye', 'Leave', 'Exit');
        if (closed) {
          await this.waitRandom(500, 1000);
        }
      } else {
        this.logger.info('No NPCs available to interact with');
      }

    } catch (error) {
      this.logger.error(`NPC interaction error: ${error}`);
    }
  }

  /**
   * Manage friend list
   */
  private async manageFriends(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Managing friends');

    try {
      // Navigate to friends page
      const navigated = await navigateByHref(this.page, '/game/friends');
      if (!navigated) {
        this.logger.warn('Could not navigate to friends page');
        return;
      }
      await this.waitRandom(2000, 3000);

      // Look for potential friends to add
      const addButtons = await findButtonsByText(this.page, 'Add Friend', 'Send Request', 'Add', 'Request');

      if (addButtons.length > 0 && this.friendsAdded < 10) {
        const addBtn = addButtons[Math.floor(Math.random() * Math.min(3, addButtons.length))];
        await addBtn.click();
        await this.waitRandom(1500, 2500);

        this.friendsAdded++;
        this.metrics.recordAction('friend_request', { friendNumber: this.friendsAdded });
        this.logger.info(`Sent friend request #${this.friendsAdded}`);
      }

      // Accept pending friend requests
      const acceptButtons = await findButtonsByText(this.page, 'Accept', 'Approve');
      if (acceptButtons.length > 0) {
        for (let i = 0; i < Math.min(3, acceptButtons.length); i++) {
          await acceptButtons[i].click();
          await this.waitRandom(1000, 1500);

          this.metrics.recordAction('friend_accept');
          this.logger.info('Accepted friend request');
        }
      }

    } catch (error) {
      this.logger.error(`Friend management error: ${error}`);
    }
  }

  /**
   * Send mail to other players
   */
  private async sendMail(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Sending mail');

    try {
      // Navigate to mail page
      const navigated = await navigateByHref(this.page, '/game/mail');
      if (!navigated) {
        this.logger.warn('Could not navigate to mail page');
        return;
      }
      await this.waitRandom(2000, 3000);

      // Look for compose/send button
      const composed = await clickButtonByText(this.page, 'Compose', 'New Mail', 'New Message', 'Send Mail');

      if (composed && this.mailsSent < 5) {
        await this.waitRandom(1500, 2500);

        // Fill in mail form (if visible)
        const subjectTyped = await typeByPlaceholder(this.page, 'subject', 'Greetings from the frontier');
        const messageTyped = await typeByPlaceholder(this.page, 'message', 'Hello! Just wanted to introduce myself. Looking forward to adventuring together!');

        if (subjectTyped || messageTyped) {
          // Try to type subject if placeholder approach didn't work
          if (!subjectTyped) {
            const subjectInput = await this.page.$('input[name="subject"]');
            if (subjectInput) {
              await subjectInput.type('Greetings from the frontier', { delay: 50 });
              await this.waitRandom(500, 1000);
            }
          } else {
            await this.waitRandom(500, 1000);
          }

          // Try to type message if placeholder approach didn't work
          if (!messageTyped) {
            const messageInput = await this.page.$('textarea[name="message"]');
            if (messageInput) {
              await messageInput.type('Hello! Just wanted to introduce myself. Looking forward to adventuring together!', { delay: 50 });
              await this.waitRandom(1500, 2500);
            }
          } else {
            await this.waitRandom(1500, 2500);
          }

          const sent = await clickButtonByText(this.page, 'Send', 'Submit', 'Send Mail');
          if (sent) {
            await this.waitRandom(1000, 2000);

            this.mailsSent++;
            this.metrics.recordAction('mail_sent', { mailNumber: this.mailsSent });
            this.logger.info(`Sent mail #${this.mailsSent}`);
          } else {
            this.logger.warn('Could not send mail');
          }
        } else {
          this.logger.warn('Could not fill mail form');
        }
      } else {
        this.logger.info('Mail compose not available or limit reached');
      }

    } catch (error) {
      this.logger.error(`Mail sending error: ${error}`);
    }
  }

  /**
   * Participate in gang activities
   */
  private async participateInGang(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Participating in gang');

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
                     await hasElementWithText(this.page, 'Members') ||
                     await hasElementWithText(this.page, 'Rank');

      if (!inGang) {
        // Look for gangs to join
        const joinButtons = await findButtonsByText(this.page, 'Join', 'Apply', 'Request to Join');

        if (joinButtons.length > 0) {
          const joinBtn = joinButtons[Math.floor(Math.random() * joinButtons.length)];
          await joinBtn.click();
          await this.waitRandom(2000, 3000);

          this.metrics.recordAction('gang_join_attempt');
          this.logger.info('Applied to join gang');
        } else {
          this.logger.info('No gangs available to join');
        }
      } else {
        // Read gang chat or activities
        await this.waitRandom(3000, 6000);

        // Look for gang chat
        let gangChat = await this.page.$('input[placeholder*="gang" i]');
        if (!gangChat) {
          gangChat = await this.page.$('[data-testid="gang-chat-input"]');
        }

        if (gangChat && Math.random() > 0.5) {
          const gangMessage = "Ready for the next gang war!";
          await gangChat.type(gangMessage, { delay: 50 });
          await this.waitRandom(1000, 2000);

          // Press Enter or click send
          try {
            await gangChat.press('Enter');
          } catch {
            await clickButtonByText(this.page, 'Send', 'Post');
          }

          this.metrics.recordAction('gang_chat_message');
          this.logger.info('Sent gang chat message');
        }
      }

    } catch (error) {
      this.logger.error(`Gang participation error: ${error}`);
    }
  }

  /**
   * Explore and start quests
   */
  private async exploreQuests(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Exploring quests');

    try {
      // Navigate to quests page
      let navigated = await navigateByHref(this.page, '/game/quests');
      if (!navigated) {
        // Try alternative navigation
        const clicked = await clickButtonByText(this.page, 'Quest', 'Quests', 'Missions');
        if (!clicked) {
          this.logger.warn('Could not navigate to quests page');
          return;
        }
      }
      await this.waitRandom(2000, 3000);

      // Look for available quests
      const questButtons = await findButtonsByText(this.page, 'Start', 'Accept Quest', 'Begin', 'Take Quest');

      if (questButtons.length > 0) {
        const questBtn = questButtons[Math.floor(Math.random() * Math.min(2, questButtons.length))];
        await questBtn.click();
        await this.waitRandom(2000, 3000);

        // Read quest description
        await this.waitRandom(4000, 8000);

        const confirmed = await clickButtonByText(this.page, 'Accept', 'Confirm', 'Start Quest', 'Begin');
        if (confirmed) {
          await this.waitRandom(1500, 2500);

          this.questsStarted++;
          this.metrics.recordAction('quest_start', { questNumber: this.questsStarted });
          this.logger.success(`Started quest #${this.questsStarted}`);
        }
      } else {
        this.logger.info('No quests available');
      }

    } catch (error) {
      this.logger.error(`Quest exploration error: ${error}`);
    }
  }

  /**
   * Read lore and world information
   */
  private async readLore(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Reading lore');

    try {
      // Look for lore/help pages
      let navigated = await navigateByHref(this.page, '/game/help');
      if (!navigated) {
        navigated = await navigateByHref(this.page, '/game/lore');
      }
      if (!navigated) {
        const clicked = await clickButtonByText(this.page, 'Lore', 'Help', 'Guide', 'Info');
        if (!clicked) {
          this.logger.info('No lore page found');
          return;
        }
      }
      await this.waitRandom(2000, 3000);

      // Simulate reading for extended period
      await this.waitRandom(10000, 20000);

      this.metrics.recordAction('lore_reading');
      this.logger.info('Read lore content');

    } catch (error) {
      this.logger.error(`Lore reading error: ${error}`);
    }
  }

  /**
   * Visit various social locations
   */
  private async visitSocialLocations(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Visiting social locations');

    try {
      const locations = ['Saloon', 'Hotel', 'Church', 'Plaza', 'Town', 'Square'];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];

      // Navigate and explore
      const visited = await clickButtonByText(this.page, randomLocation);
      if (visited) {
        await this.waitRandom(3000, 6000);

        this.metrics.recordAction('location_visit', { location: randomLocation });
        this.logger.info(`Visited ${randomLocation}`);
      } else {
        this.logger.info(`Could not find location: ${randomLocation}`);
      }

    } catch (error) {
      this.logger.error(`Location visit error: ${error}`);
    }
  }

  /**
   * Check notifications and messages
   */
  private async checkNotifications(): Promise<void> {
    if (!this.page) return;

    this.logger.action('Checking notifications');

    try {
      // Navigate to notifications
      const navigated = await navigateByHref(this.page, '/game/notifications');
      if (!navigated) {
        this.logger.info('No notifications page found');
        return;
      }
      await this.waitRandom(2000, 3000);

      // Read notifications
      const notificationCount = await getElementCount(this.page, '.notification, .alert, [class*="notification"]');
      this.logger.info(`Found ${notificationCount} notifications`);

      // Simulate reading each one
      if (notificationCount > 0) {
        await this.waitRandom(2000 * notificationCount, 3000 * notificationCount);
      }

      this.metrics.recordAction('notifications_check', { count: notificationCount });

    } catch (error) {
      this.logger.error(`Notification check error: ${error}`);
    }
  }

  /**
   * Check social statistics
   */
  private async checkSocialStatus(): Promise<void> {
    if (!this.page) return;

    try {
      this.logger.info(`=== Social Status ===`);
      this.logger.info(`Friends Added: ${this.friendsAdded}`);
      this.logger.info(`Mail Sent: ${this.mailsSent}`);
      this.logger.info(`Chat Messages: ${this.chatMessagesSent}`);
      this.logger.info(`NPC Interactions: ${this.npcInteractions}`);
      this.logger.info(`Quests Started: ${this.questsStarted}`);
      this.logger.info(`===================`);

    } catch (error) {
      this.logger.error(`Status check error: ${error}`);
    }
  }
}
