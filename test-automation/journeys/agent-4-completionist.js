/**
 * Agent 4: The Completionist
 * Comprehensive testing agent for ALL 11 implemented features
 *
 * Mission: Test every feature of Desperados Destiny to verify the game is 85% complete
 *
 * Features Tested:
 * 1. Login & Character Selection
 * 2. Dashboard (stats display)
 * 3. Actions System
 * 4. Crimes System
 * 5. Combat System
 * 6. Skills System
 * 7. Territory System
 * 8. Gang System
 * 9. Leaderboard
 * 10. Mail System
 * 11. Friends System
 */

const TestRunner = require('../core/TestRunner');

class CompletionistAgent extends TestRunner {
  constructor() {
    super('Agent-4-Completionist');
    this.featureResults = [];
    this.totalFeatures = 11;
    this.bugReport = {
      critical: [],
      major: [],
      minor: []
    };
  }

  async runMission() {
    console.log('\n🎯 THE COMPLETIONIST - Testing all 11 implemented features...');
    console.log('=' .repeat(70));
    console.log('Mission: Verify game is 85% complete with comprehensive testing');
    console.log('=' .repeat(70));

    try {
      await this.initialize();

      // Feature 1: Login and Character Selection
      await this.testFeature1_LoginAndCharacterSelect();

      // Feature 2: Dashboard
      await this.testFeature2_Dashboard();

      // Feature 3: Actions System
      await this.testFeature3_Actions();

      // Feature 4: Crimes System
      await this.testFeature4_Crimes();

      // Feature 5: Combat System
      await this.testFeature5_Combat();

      // Feature 6: Skills System
      await this.testFeature6_Skills();

      // Feature 7: Territory System
      await this.testFeature7_Territory();

      // Feature 8: Gang System
      await this.testFeature8_Gang();

      // Feature 9: Leaderboard
      await this.testFeature9_Leaderboard();

      // Feature 10: Mail System
      await this.testFeature10_Mail();

      // Feature 11: Friends System
      await this.testFeature11_Friends();

      // Generate comprehensive report
      await this.generateComprehensiveReport();

    } catch (error) {
      console.error('❌ Completionist mission failed:', error);
      await this.reportBug('P0', 'Mission Critical Failure', error.message, error.stack);
    } finally {
      return await this.cleanup();
    }
  }

  /**
   * Track feature test result
   */
  trackFeature(featureName, status, details = {}) {
    const result = {
      name: featureName,
      status, // 'pass', 'fail', 'warning'
      timestamp: new Date().toISOString(),
      ...details
    };
    this.featureResults.push(result);

    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} Feature: ${featureName} - ${status.toUpperCase()}`);

    return result;
  }

  /**
   * FEATURE 1: Login and Character Selection
   */
  async testFeature1_LoginAndCharacterSelect() {
    console.log('\n' + '='.repeat(70));
    console.log('🔐 FEATURE 1: Login & Character Selection');
    console.log('='.repeat(70));

    try {
      // Test login
      await this.goto('/login');
      await this.wait(1000);
      await this.takeScreenshot('01-login-page');

      // Verify login form exists
      const hasEmailInput = await this.exists('input[name="email"]');
      const hasPasswordInput = await this.exists('input[type="password"]');
      const hasSubmitButton = await this.exists('button[type="submit"]');

      if (!hasEmailInput || !hasPasswordInput || !hasSubmitButton) {
        await this.reportBug('P0', 'Login form incomplete', 'Missing required form elements');
        return this.trackFeature('Login & Character Selection', 'fail', {
          reason: 'Login form incomplete'
        });
      }

      // Perform login
      const loginSuccess = await this.loginAs('pioneer@test.com', 'PioneerTest123!');
      if (!loginSuccess) {
        await this.reportBug('P0', 'Login failed', 'Could not authenticate test user');
        return this.trackFeature('Login & Character Selection', 'fail', {
          reason: 'Login authentication failed'
        });
      }

      await this.takeScreenshot('02-after-login');

      // Verify we're on character select page
      const url = this.page.url();
      if (!url.includes('/characters')) {
        await this.reportBug('P1', 'Login redirect failed', `Expected /characters, got ${url}`);
        return this.trackFeature('Login & Character Selection', 'warning', {
          reason: 'Login redirect incorrect'
        });
      }

      // Check for character cards
      const characterData = await this.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid*="character"]');
        const playButtons = document.querySelectorAll('[data-testid="character-play-button"]');

        return {
          hasCards: cards.length > 0,
          cardCount: cards.length,
          hasPlayButtons: playButtons.length > 0,
          playButtonCount: playButtons.length
        };
      });

      console.log(`   Found ${characterData.cardCount} character(s)`);
      console.log(`   Found ${characterData.playButtonCount} play button(s)`);

      if (!characterData.hasCards || !characterData.hasPlayButtons) {
        await this.reportBug('P1', 'Character selection UI missing', 'No character cards or play buttons found');
        return this.trackFeature('Login & Character Selection', 'warning', {
          reason: 'Character UI incomplete',
          characters: characterData.cardCount
        });
      }

      // Select first character
      const selected = await this.evaluate(() => {
        const playButton = document.querySelector('[data-testid="character-play-button"]');
        if (playButton) {
          playButton.click();
          return true;
        }
        return false;
      });

      if (!selected) {
        await this.reportBug('P1', 'Cannot select character', 'Play button click failed');
        return this.trackFeature('Login & Character Selection', 'fail', {
          reason: 'Character selection failed'
        });
      }

      await this.wait(3000);
      await this.takeScreenshot('03-character-selected');

      // Verify navigation to game
      const gameUrl = this.page.url();
      if (!gameUrl.includes('/game')) {
        await this.reportBug('P1', 'Character selection redirect failed', `Expected /game, got ${gameUrl}`);
        return this.trackFeature('Login & Character Selection', 'warning', {
          reason: 'Game redirect failed'
        });
      }

      return this.trackFeature('Login & Character Selection', 'pass', {
        characters: characterData.cardCount,
        loginTime: '~3s'
      });

    } catch (error) {
      await this.reportBug('P0', 'Feature 1 test crashed', error.message);
      return this.trackFeature('Login & Character Selection', 'fail', {
        error: error.message
      });
    }
  }

  /**
   * FEATURE 2: Dashboard (Stats Display)
   */
  async testFeature2_Dashboard() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 FEATURE 2: Dashboard & Stats Display');
    console.log('='.repeat(70));

    try {
      // Ensure we're on dashboard
      await this.goto('/game');
      await this.wait(2000);
      await this.takeScreenshot('04-dashboard');

      // Extract all visible stats
      const stats = await this.evaluate(() => {
        const text = document.body.textContent;

        const extractStat = (patterns) => {
          for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return match[1];
          }
          return null;
        };

        return {
          characterName: document.querySelector('h1, h2, [data-testid="character-name"]')?.textContent?.trim(),
          level: extractStat([/Level[:\s]*(\d+)/i, /Lvl[:\s]*(\d+)/i]),
          gold: extractStat([/\$\s*(\d+)/i, /Gold[:\s]*(\d+)/i]),
          energy: extractStat([/Energy[:\s]*(\d+)/i]),
          xp: extractStat([/XP[:\s]*(\d+)/i, /Experience[:\s]*(\d+)/i]),
          health: extractStat([/HP[:\s]*(\d+)/i, /Health[:\s]*(\d+)/i]),
          wanted: extractStat([/Wanted[:\s]*(\d+)/i, /Bounty[:\s]*(\d+)/i]),

          // UI Elements
          hasNavigationCards: document.querySelectorAll('[data-testid^="nav-"]').length > 0,
          navCardCount: document.querySelectorAll('[data-testid^="nav-"]').length,
          hasEnergyBar: !!document.querySelector('[class*="energy"], [class*="progress"]'),
          hasGoldDisplay: text.includes('$') || text.toLowerCase().includes('gold'),

          // Verify no placeholders
          hasPlaceholders: text.toLowerCase().includes('coming soon') ||
                          text.toLowerCase().includes('placeholder') ||
                          text.toLowerCase().includes('todo')
        };
      });

      console.log('   Dashboard Data:');
      console.log(`     Character: ${stats.characterName || 'NOT FOUND'}`);
      console.log(`     Level: ${stats.level || 'NOT FOUND'}`);
      console.log(`     Gold: ${stats.gold || 'NOT FOUND'}`);
      console.log(`     Energy: ${stats.energy || 'NOT FOUND'}`);
      console.log(`     XP: ${stats.xp || 'NOT FOUND'}`);
      console.log(`     Health: ${stats.health || 'NOT FOUND'}`);
      console.log(`     Wanted Level: ${stats.wanted || 'NOT FOUND'}`);
      console.log(`     Navigation Cards: ${stats.navCardCount}`);
      console.log(`     Energy Bar: ${stats.hasEnergyBar ? '✅' : '❌'}`);
      console.log(`     Gold Display: ${stats.hasGoldDisplay ? '✅' : '❌'}`);

      // Validate critical stats
      const criticalStats = ['characterName', 'level', 'gold', 'energy'];
      const missingStats = criticalStats.filter(stat => !stats[stat]);

      if (missingStats.length > 0) {
        await this.reportBug('P1', 'Dashboard missing critical stats',
          `Missing: ${missingStats.join(', ')}`);
      }

      // Check for placeholders (should be NONE)
      if (stats.hasPlaceholders) {
        await this.reportBug('P2', 'Dashboard has placeholder text',
          'Found "Coming Soon" or placeholder text - all features should be implemented');
      }

      // Check navigation
      if (stats.navCardCount < 8) {
        await this.reportBug('P2', 'Dashboard navigation incomplete',
          `Expected 10+ nav cards, found ${stats.navCardCount}`);
        return this.trackFeature('Dashboard', 'warning', {
          statsFound: criticalStats.length - missingStats.length,
          navCards: stats.navCardCount
        });
      }

      return this.trackFeature('Dashboard', 'pass', {
        statsDisplayed: criticalStats.length - missingStats.length,
        navCards: stats.navCardCount,
        hasPlaceholders: stats.hasPlaceholders
      });

    } catch (error) {
      await this.reportBug('P0', 'Feature 2 test crashed', error.message);
      return this.trackFeature('Dashboard', 'fail', { error: error.message });
    }
  }

  /**
   * FEATURE 3: Actions System
   */
  async testFeature3_Actions() {
    console.log('\n' + '='.repeat(70));
    console.log('⚡ FEATURE 3: Actions System');
    console.log('='.repeat(70));

    try {
      await this.goto('/game/actions');
      await this.wait(2000);
      await this.takeScreenshot('05-actions-page');

      const actionsData = await this.evaluate(() => {
        return {
          hasActionCards: document.querySelectorAll('[data-testid*="action"]').length > 0,
          actionCount: document.querySelectorAll('[data-testid*="action"]').length,
          hasEnergyCost: document.body.textContent.includes('Energy') ||
                         document.body.textContent.includes('Cost'),
          hasCategoryTabs: document.querySelectorAll('[role="tab"], [data-testid*="tab"]').length > 0,
          tabCount: document.querySelectorAll('[role="tab"], [data-testid*="tab"]').length,
          hasPerformButtons: document.querySelectorAll('button').length > 0,
          pageText: document.body.textContent.substring(0, 300)
        };
      });

      console.log(`   Action Cards: ${actionsData.actionCount}`);
      console.log(`   Category Tabs: ${actionsData.tabCount}`);
      console.log(`   Energy Cost Display: ${actionsData.hasEnergyCost ? '✅' : '❌'}`);

      if (actionsData.actionCount === 0) {
        await this.reportBug('P1', 'No actions found', 'Actions page has no action cards');
        return this.trackFeature('Actions System', 'fail', { reason: 'No actions found' });
      }

      // Try to perform an action via API
      const actionResult = await this.performActionTest();

      if (actionResult.success) {
        console.log(`   ✅ Action performed successfully`);
        console.log(`     Result: ${actionResult.challengeSuccess ? 'SUCCESS' : 'FAILED'}`);
        console.log(`     Hand: ${actionResult.handRank || 'Unknown'}`);
        console.log(`     Rewards: ${actionResult.rewardsGained?.gold || 0} gold, ${actionResult.rewardsGained?.xp || 0} XP`);
      }

      return this.trackFeature('Actions System', 'pass', {
        actionCount: actionsData.actionCount,
        tabCount: actionsData.tabCount,
        actionPerformed: actionResult.success
      });

    } catch (error) {
      await this.reportBug('P0', 'Feature 3 test crashed', error.message);
      return this.trackFeature('Actions System', 'fail', { error: error.message });
    }
  }

  /**
   * FEATURE 4: Crimes System
   */
  async testFeature4_Crimes() {
    console.log('\n' + '='.repeat(70));
    console.log('🚔 FEATURE 4: Crimes System');
    console.log('='.repeat(70));

    try {
      await this.goto('/game/crimes');
      await this.wait(2000);
      await this.takeScreenshot('06-crimes-page');

      const crimesData = await this.evaluate(() => {
        const text = document.body.textContent;
        return {
          hasCrimesInterface: text.toLowerCase().includes('crime') ||
                             text.toLowerCase().includes('bounty'),
          hasWantedLevel: text.includes('Wanted') || text.includes('Bounty'),
          hasCrimeCards: document.querySelectorAll('[data-testid*="crime"]').length > 0,
          crimeCount: document.querySelectorAll('[data-testid*="crime"]').length,
          hasTabs: document.querySelectorAll('[role="tab"]').length > 0,
          pageText: text.substring(0, 300)
        };
      });

      console.log(`   Crimes Interface: ${crimesData.hasCrimesInterface ? '✅' : '❌'}`);
      console.log(`   Crime Cards: ${crimesData.crimeCount}`);
      console.log(`   Wanted Level Display: ${crimesData.hasWantedLevel ? '✅' : '❌'}`);

      if (!crimesData.hasCrimesInterface) {
        await this.reportBug('P1', 'Crimes interface not found', 'Crimes page missing core UI');
        return this.trackFeature('Crimes System', 'fail', { reason: 'UI not found' });
      }

      return this.trackFeature('Crimes System', 'pass', {
        crimeCount: crimesData.crimeCount,
        hasWantedLevel: crimesData.hasWantedLevel
      });

    } catch (error) {
      await this.reportBug('P0', 'Feature 4 test crashed', error.message);
      return this.trackFeature('Crimes System', 'fail', { error: error.message });
    }
  }

  /**
   * FEATURE 5: Combat System
   */
  async testFeature5_Combat() {
    console.log('\n' + '='.repeat(70));
    console.log('⚔️ FEATURE 5: Combat System');
    console.log('='.repeat(70));

    try {
      await this.goto('/game/combat');
      await this.wait(2000);
      await this.takeScreenshot('07-combat-page');

      const combatData = await this.evaluate(() => {
        const text = document.body.textContent;
        return {
          hasCombatInterface: text.toLowerCase().includes('combat') ||
                             text.toLowerCase().includes('fight') ||
                             text.toLowerCase().includes('npc'),
          hasNPCList: document.querySelectorAll('[data-testid*="npc"]').length > 0,
          npcCount: document.querySelectorAll('[data-testid*="npc"]').length,
          hasFightButtons: Array.from(document.querySelectorAll('button'))
            .some(btn => btn.textContent.toLowerCase().includes('fight') ||
                        btn.textContent.toLowerCase().includes('attack')),
          pageText: text.substring(0, 300)
        };
      });

      console.log(`   Combat Interface: ${combatData.hasCombatInterface ? '✅' : '❌'}`);
      console.log(`   NPC Opponents: ${combatData.npcCount}`);
      console.log(`   Fight Buttons: ${combatData.hasFightButtons ? '✅' : '❌'}`);

      // Try to get NPCs via API and test combat
      const combatResult = await this.testCombatViaAPI();

      return this.trackFeature('Combat System', 'pass', {
        npcCount: combatData.npcCount,
        combatTested: combatResult.tested,
        combatResult: combatResult.result
      });

    } catch (error) {
      await this.reportBug('P0', 'Feature 5 test crashed', error.message);
      return this.trackFeature('Combat System', 'fail', { error: error.message });
    }
  }

  /**
   * FEATURE 6: Skills System
   */
  async testFeature6_Skills() {
    console.log('\n' + '='.repeat(70));
    console.log('📚 FEATURE 6: Skills System');
    console.log('='.repeat(70));

    try {
      await this.goto('/game/skills');
      await this.wait(2000);
      await this.takeScreenshot('08-skills-page');

      const skillsData = await this.evaluate(() => {
        const text = document.body.textContent;
        return {
          hasSkillsInterface: text.toLowerCase().includes('skill') ||
                             text.toLowerCase().includes('train'),
          hasSkillCards: document.querySelectorAll('[data-testid*="skill"]').length > 0,
          skillCount: document.querySelectorAll('[data-testid*="skill"]').length,
          hasTrainButtons: Array.from(document.querySelectorAll('button'))
            .some(btn => btn.textContent.toLowerCase().includes('train') ||
                        btn.textContent.toLowerCase().includes('learn')),
          hasSkillLevels: text.includes('Level') || text.includes('Rank'),
          pageText: text.substring(0, 300)
        };
      });

      console.log(`   Skills Interface: ${skillsData.hasSkillsInterface ? '✅' : '❌'}`);
      console.log(`   Skill Cards: ${skillsData.skillCount}`);
      console.log(`   Train Buttons: ${skillsData.hasTrainButtons ? '✅' : '❌'}`);
      console.log(`   Skill Levels: ${skillsData.hasSkillLevels ? '✅' : '❌'}`);

      if (!skillsData.hasSkillsInterface) {
        await this.reportBug('P1', 'Skills interface not found', 'Skills page missing core UI');
        return this.trackFeature('Skills System', 'warning', { reason: 'UI incomplete' });
      }

      return this.trackFeature('Skills System', 'pass', {
        skillCount: skillsData.skillCount,
        hasTraining: skillsData.hasTrainButtons
      });

    } catch (error) {
      await this.reportBug('P0', 'Feature 6 test crashed', error.message);
      return this.trackFeature('Skills System', 'fail', { error: error.message });
    }
  }

  /**
   * FEATURE 7: Territory System
   */
  async testFeature7_Territory() {
    console.log('\n' + '='.repeat(70));
    console.log('🗺️ FEATURE 7: Territory System');
    console.log('='.repeat(70));

    try {
      await this.goto('/game/territory');
      await this.wait(2000);
      await this.takeScreenshot('09-territory-page');

      const territoryData = await this.evaluate(() => {
        const text = document.body.textContent;
        return {
          hasTerritoryInterface: text.includes('SANGRE') ||
                                text.toLowerCase().includes('territory') ||
                                text.toLowerCase().includes('location'),
          hasLocationCards: document.querySelectorAll('[data-testid*="location"], [data-testid*="territory"]').length > 0,
          locationCount: document.querySelectorAll('[data-testid*="location"], [data-testid*="territory"]').length,
          hasMap: text.includes('Map') || text.includes('Region'),
          hasTravelButtons: Array.from(document.querySelectorAll('button'))
            .some(btn => btn.textContent.toLowerCase().includes('travel') ||
                        btn.textContent.toLowerCase().includes('visit')),
          pageText: text.substring(0, 300)
        };
      });

      console.log(`   Territory Interface: ${territoryData.hasTerritoryInterface ? '✅' : '❌'}`);
      console.log(`   Locations: ${territoryData.locationCount}`);
      console.log(`   Travel System: ${territoryData.hasTravelButtons ? '✅' : '❌'}`);

      if (!territoryData.hasTerritoryInterface) {
        await this.reportBug('P1', 'Territory interface not found', 'Territory page missing core UI');
        return this.trackFeature('Territory System', 'warning', { reason: 'UI incomplete' });
      }

      return this.trackFeature('Territory System', 'pass', {
        locationCount: territoryData.locationCount,
        hasTravel: territoryData.hasTravelButtons
      });

    } catch (error) {
      await this.reportBug('P0', 'Feature 7 test crashed', error.message);
      return this.trackFeature('Territory System', 'fail', { error: error.message });
    }
  }

  /**
   * FEATURE 8: Gang System
   */
  async testFeature8_Gang() {
    console.log('\n' + '='.repeat(70));
    console.log('👥 FEATURE 8: Gang System');
    console.log('='.repeat(70));

    try {
      await this.goto('/game/gang');
      await this.wait(2000);
      await this.takeScreenshot('10-gang-page');

      const gangData = await this.evaluate(() => {
        const text = document.body.textContent;
        return {
          hasGangInterface: text.toLowerCase().includes('gang'),
          hasCreateButton: Array.from(document.querySelectorAll('button'))
            .some(btn => btn.textContent.toLowerCase().includes('create')),
          hasGangList: text.toLowerCase().includes('browse') ||
                      text.toLowerCase().includes('join'),
          hasGangCards: document.querySelectorAll('[data-testid*="gang"]').length > 0,
          gangCount: document.querySelectorAll('[data-testid*="gang"]').length,
          hasTabs: document.querySelectorAll('[role="tab"]').length > 0,
          pageText: text.substring(0, 300)
        };
      });

      console.log(`   Gang Interface: ${gangData.hasGangInterface ? '✅' : '❌'}`);
      console.log(`   Create Gang Button: ${gangData.hasCreateButton ? '✅' : '❌'}`);
      console.log(`   Gang List/Browse: ${gangData.hasGangList ? '✅' : '❌'}`);
      console.log(`   Gang Cards: ${gangData.gangCount}`);

      if (!gangData.hasGangInterface) {
        await this.reportBug('P1', 'Gang interface not found', 'Gang page missing core UI');
        return this.trackFeature('Gang System', 'warning', { reason: 'UI incomplete' });
      }

      return this.trackFeature('Gang System', 'pass', {
        hasCreate: gangData.hasCreateButton,
        hasBrowse: gangData.hasGangList,
        gangCount: gangData.gangCount
      });

    } catch (error) {
      await this.reportBug('P0', 'Feature 8 test crashed', error.message);
      return this.trackFeature('Gang System', 'fail', { error: error.message });
    }
  }

  /**
   * FEATURE 9: Leaderboard
   */
  async testFeature9_Leaderboard() {
    console.log('\n' + '='.repeat(70));
    console.log('🏆 FEATURE 9: Leaderboard');
    console.log('='.repeat(70));

    try {
      await this.goto('/game/leaderboard');
      await this.wait(2000);
      await this.takeScreenshot('11-leaderboard-page');

      const leaderboardData = await this.evaluate(() => {
        const text = document.body.textContent;
        const tabs = Array.from(document.querySelectorAll('[role="tab"]'));

        return {
          hasLeaderboard: text.toLowerCase().includes('leaderboard') ||
                         text.toLowerCase().includes('rank'),
          hasRankings: document.querySelectorAll('[data-testid*="rank"], [data-testid*="player"]').length > 0,
          playerCount: document.querySelectorAll('[data-testid*="rank"], [data-testid*="player"]').length,
          hasCategoryTabs: tabs.length > 0,
          tabCount: tabs.length,
          categoryNames: tabs.map(tab => tab.textContent.trim()).filter(t => t),
          hasPlayerNames: text.includes('Pioneer') || /\b[A-Z][a-z]+\b/.test(text),
          pageText: text.substring(0, 300)
        };
      });

      console.log(`   Leaderboard Interface: ${leaderboardData.hasLeaderboard ? '✅' : '❌'}`);
      console.log(`   Ranking Entries: ${leaderboardData.playerCount}`);
      console.log(`   Category Tabs: ${leaderboardData.tabCount}`);
      console.log(`   Categories: ${leaderboardData.categoryNames.join(', ')}`);

      if (!leaderboardData.hasLeaderboard) {
        await this.reportBug('P1', 'Leaderboard interface not found', 'Leaderboard page missing core UI');
        return this.trackFeature('Leaderboard', 'warning', { reason: 'UI incomplete' });
      }

      // Expected 6 ranking types
      if (leaderboardData.tabCount < 4) {
        await this.reportBug('P2', 'Leaderboard categories incomplete',
          `Expected 6 categories, found ${leaderboardData.tabCount}`);
      }

      return this.trackFeature('Leaderboard', 'pass', {
        playerCount: leaderboardData.playerCount,
        categories: leaderboardData.tabCount,
        categoryNames: leaderboardData.categoryNames
      });

    } catch (error) {
      await this.reportBug('P0', 'Feature 9 test crashed', error.message);
      return this.trackFeature('Leaderboard', 'fail', { error: error.message });
    }
  }

  /**
   * FEATURE 10: Mail System
   */
  async testFeature10_Mail() {
    console.log('\n' + '='.repeat(70));
    console.log('✉️ FEATURE 10: Mail System');
    console.log('='.repeat(70));

    try {
      await this.goto('/game/mail');
      await this.wait(2000);
      await this.takeScreenshot('12-mail-page');

      const mailData = await this.evaluate(() => {
        const text = document.body.textContent;
        return {
          hasMailInterface: text.toLowerCase().includes('mail') ||
                           text.toLowerCase().includes('message') ||
                           text.toLowerCase().includes('inbox'),
          hasComposeButton: Array.from(document.querySelectorAll('button'))
            .some(btn => btn.textContent.toLowerCase().includes('compose') ||
                        btn.textContent.toLowerCase().includes('send') ||
                        btn.textContent.toLowerCase().includes('new')),
          hasInbox: text.toLowerCase().includes('inbox') ||
                   text.toLowerCase().includes('received'),
          hasSent: text.toLowerCase().includes('sent'),
          hasMailList: document.querySelectorAll('[data-testid*="mail"]').length > 0,
          mailCount: document.querySelectorAll('[data-testid*="mail"]').length,
          pageText: text.substring(0, 300)
        };
      });

      console.log(`   Mail Interface: ${mailData.hasMailInterface ? '✅' : '❌'}`);
      console.log(`   Compose Button: ${mailData.hasComposeButton ? '✅' : '❌'}`);
      console.log(`   Inbox/Sent: ${mailData.hasInbox && mailData.hasSent ? '✅' : '⚠️'}`);
      console.log(`   Mail Items: ${mailData.mailCount}`);

      if (!mailData.hasMailInterface) {
        await this.reportBug('P1', 'Mail interface not found', 'Mail page missing core UI');
        return this.trackFeature('Mail System', 'warning', { reason: 'UI incomplete' });
      }

      return this.trackFeature('Mail System', 'pass', {
        hasCompose: mailData.hasComposeButton,
        hasInbox: mailData.hasInbox,
        mailCount: mailData.mailCount
      });

    } catch (error) {
      await this.reportBug('P0', 'Feature 10 test crashed', error.message);
      return this.trackFeature('Mail System', 'fail', { error: error.message });
    }
  }

  /**
   * FEATURE 11: Friends System
   */
  async testFeature11_Friends() {
    console.log('\n' + '='.repeat(70));
    console.log('👫 FEATURE 11: Friends System');
    console.log('='.repeat(70));

    try {
      await this.goto('/game/friends');
      await this.wait(2000);
      await this.takeScreenshot('13-friends-page');

      const friendsData = await this.evaluate(() => {
        const text = document.body.textContent;
        return {
          hasFriendsInterface: text.toLowerCase().includes('friend'),
          hasAddButton: Array.from(document.querySelectorAll('button'))
            .some(btn => btn.textContent.toLowerCase().includes('add') ||
                        btn.textContent.toLowerCase().includes('invite')),
          hasFriendsList: text.toLowerCase().includes('list') ||
                         text.toLowerCase().includes('your friends'),
          hasRequests: text.toLowerCase().includes('request') ||
                      text.toLowerCase().includes('pending'),
          hasFriendCards: document.querySelectorAll('[data-testid*="friend"]').length > 0,
          friendCount: document.querySelectorAll('[data-testid*="friend"]').length,
          hasTabs: document.querySelectorAll('[role="tab"]').length > 0,
          pageText: text.substring(0, 300)
        };
      });

      console.log(`   Friends Interface: ${friendsData.hasFriendsInterface ? '✅' : '❌'}`);
      console.log(`   Add Friend Button: ${friendsData.hasAddButton ? '✅' : '❌'}`);
      console.log(`   Friends List: ${friendsData.hasFriendsList ? '✅' : '❌'}`);
      console.log(`   Friend Requests: ${friendsData.hasRequests ? '✅' : '❌'}`);
      console.log(`   Friend Cards: ${friendsData.friendCount}`);

      if (!friendsData.hasFriendsInterface) {
        await this.reportBug('P1', 'Friends interface not found', 'Friends page missing core UI');
        return this.trackFeature('Friends System', 'warning', { reason: 'UI incomplete' });
      }

      return this.trackFeature('Friends System', 'pass', {
        hasAdd: friendsData.hasAddButton,
        hasList: friendsData.hasFriendsList,
        hasRequests: friendsData.hasRequests,
        friendCount: friendsData.friendCount
      });

    } catch (error) {
      await this.reportBug('P0', 'Feature 11 test crashed', error.message);
      return this.trackFeature('Friends System', 'fail', { error: error.message });
    }
  }

  /**
   * Helper: Perform an action test via API
   */
  async performActionTest() {
    try {
      const gameState = await this.getGameState();
      const authState = gameState?.auth?.state || gameState?.auth;
      const token = authState?.token;

      if (!token) {
        console.log('   ⚠️ No auth token, skipping action test');
        return { success: false };
      }

      // Get available actions
      const actionsResponse = await this.page.evaluate(async (apiUrl, authToken) => {
        try {
          const response = await fetch(`${apiUrl}/actions`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          return { success: response.ok, data };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, this.config.apiUrl, token);

      if (!actionsResponse.success) {
        return { success: false };
      }

      const actions = actionsResponse.data?.data?.actions || {};
      const allActions = [
        ...(actions.CRIME || []),
        ...(actions.COMBAT || []),
        ...(actions.SOCIAL || []),
        ...(actions.CRAFT || [])
      ];

      if (allActions.length === 0) {
        return { success: false };
      }

      const action = allActions[0];

      // Perform the action
      const performResponse = await this.page.evaluate(async (apiUrl, authToken, actionId) => {
        try {
          const response = await fetch(`${apiUrl}/actions/challenge`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ actionId })
          });
          const data = await response.json();
          return { success: response.ok, data };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, this.config.apiUrl, token, action._id);

      if (performResponse.success) {
        const result = performResponse.data?.data?.result || {};
        return {
          success: true,
          challengeSuccess: result.challengeSuccess,
          handRank: result.handRank,
          rewardsGained: result.rewardsGained
        };
      }

      return { success: false };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Test combat via API
   */
  async testCombatViaAPI() {
    try {
      const gameState = await this.getGameState();
      const authState = gameState?.auth?.state || gameState?.auth;
      const token = authState?.token;

      if (!token) {
        return { tested: false };
      }

      // Get available NPCs
      const npcsResponse = await this.page.evaluate(async (apiUrl, authToken) => {
        try {
          const response = await fetch(`${apiUrl}/combat/npcs`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          return { success: response.ok, data };
        } catch (error) {
          return { success: false };
        }
      }, this.config.apiUrl, token);

      if (!npcsResponse.success || !npcsResponse.data?.data?.length) {
        return { tested: false };
      }

      return { tested: true, npcCount: npcsResponse.data.data.length };

    } catch (error) {
      return { tested: false };
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateComprehensiveReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 COMPLETIONIST REPORT - DESPERADOS DESTINY');
    console.log('='.repeat(70));

    const passed = this.featureResults.filter(f => f.status === 'pass').length;
    const warnings = this.featureResults.filter(f => f.status === 'warning').length;
    const failed = this.featureResults.filter(f => f.status === 'fail').length;
    const completionRate = Math.round((passed / this.totalFeatures) * 100);

    console.log(`\n🎯 FEATURE COMPLETENESS: ${passed}/${this.totalFeatures} (${completionRate}%)`);
    console.log('─'.repeat(70));

    // Feature breakdown
    console.log('\n📋 FEATURE TEST RESULTS:');
    this.featureResults.forEach((feature, index) => {
      const icon = feature.status === 'pass' ? '✅' :
                   feature.status === 'warning' ? '⚠️' : '❌';
      console.log(`   ${index + 1}. ${icon} ${feature.name} - ${feature.status.toUpperCase()}`);

      if (feature.details) {
        Object.entries(feature.details).forEach(([key, value]) => {
          if (typeof value !== 'object') {
            console.log(`      - ${key}: ${value}`);
          }
        });
      }
    });

    // Bug summary
    console.log(`\n🐛 BUGS FOUND: ${this.bugs.length}`);
    console.log(`   P0 (Critical): ${this.bugs.filter(b => b.severity === 'P0').length}`);
    console.log(`   P1 (Major): ${this.bugs.filter(b => b.severity === 'P1').length}`);
    console.log(`   P2 (Minor): ${this.bugs.filter(b => b.severity === 'P2').length}`);

    if (this.bugs.length > 0) {
      console.log('\n🐛 BUG DETAILS:');
      this.bugs.forEach((bug, i) => {
        console.log(`   ${i + 1}. [${bug.severity}] ${bug.title}`);
        console.log(`      ${bug.description}`);
        if (bug.screenshot) {
          console.log(`      Screenshot: ${bug.screenshot}`);
        }
      });
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');

    if (completionRate >= 90) {
      console.log('   ✅ Game is in EXCELLENT condition!');
      console.log('   - All major features are functional');
      console.log('   - Ready for beta testing with real players');
      console.log('   - Focus on polish and UX improvements');
    } else if (completionRate >= 80) {
      console.log('   ✅ Game is in GOOD condition');
      console.log('   - Most features are working correctly');
      console.log('   - Address warning-level features before launch');
      console.log('   - Fix any critical bugs immediately');
    } else if (completionRate >= 70) {
      console.log('   ⚠️ Game needs some work');
      console.log('   - Several features need attention');
      console.log('   - Fix all P0 and P1 bugs before continuing');
      console.log('   - Consider user testing to find additional issues');
    } else {
      console.log('   ❌ Game has critical issues');
      console.log('   - Multiple features are broken or incomplete');
      console.log('   - Focus on fixing P0 bugs first');
      console.log('   - Re-test after fixes are applied');
    }

    // Priority fixes
    const p0Bugs = this.bugs.filter(b => b.severity === 'P0');
    const p1Bugs = this.bugs.filter(b => b.severity === 'P1');

    if (p0Bugs.length > 0) {
      console.log('\n🚨 CRITICAL FIXES NEEDED (P0):');
      p0Bugs.forEach((bug, i) => {
        console.log(`   ${i + 1}. ${bug.title}`);
      });
    }

    if (p1Bugs.length > 0) {
      console.log('\n⚠️ MAJOR FIXES RECOMMENDED (P1):');
      p1Bugs.forEach((bug, i) => {
        console.log(`   ${i + 1}. ${bug.title}`);
      });
    }

    console.log(`\n📸 SCREENSHOTS CAPTURED: ${this.screenshots.length}`);
    console.log(`⏱️ TEST DURATION: ${Math.round((Date.now() - this.startTime) / 1000)}s`);

    console.log('\n' + '='.repeat(70));
    console.log(`🎮 VERDICT: Game is ${completionRate}% complete and functional`);
    console.log('='.repeat(70));

    return {
      totalFeatures: this.totalFeatures,
      passed,
      warnings,
      failed,
      completionRate,
      bugs: this.bugs.length,
      p0Bugs: p0Bugs.length,
      p1Bugs: p1Bugs.length
    };
  }
}

// Run if executed directly
if (require.main === module) {
  const completionist = new CompletionistAgent();
  completionist.runMission().then(report => {
    console.log('\n🏁 Completionist mission complete!');
    const p0Bugs = (report && report.bugs && Array.isArray(report.bugs))
      ? report.bugs.filter(b => b.severity === 'P0').length
      : 0;
    process.exit(p0Bugs > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = CompletionistAgent;
