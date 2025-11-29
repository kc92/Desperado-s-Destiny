/**
 * Agent 4: The Outlaw
 * Tests combat system and crime mechanics
 *
 * Mission: Perform actions/crimes and verify the combat and reward systems work correctly
 */

const TestRunner = require('../core/TestRunner');

class OutlawAgent extends TestRunner {
  constructor() {
    super('Agent-4-Outlaw');
    this.actionsPerformed = [];
    this.combatEncounters = [];
    this.rewardsEarned = {
      totalGold: 0,
      totalXP: 0,
      actions: 0
    };
    this.initialState = null;
  }

  async runMission() {
    console.log('\n💀 THE OUTLAW - Testing combat and crime systems...');
    console.log('=' .repeat(60));

    try {
      await this.initialize();

      // Login and navigate to game
      await this.loginAndSelectCharacter();

      // Capture initial state
      await this.captureInitialState();

      // Test getting available actions
      await this.testGetActions();

      // Test performing actions/crimes
      await this.testPerformActions();

      // Test combat if available
      await this.testCombatSystem();

      // Verify rewards and state changes
      await this.verifyStateChanges();

      // Generate comprehensive report
      await this.generateCombatReport();

    } catch (error) {
      console.error('❌ Outlaw mission failed:', error);
      await this.reportBug('P0', 'Outlaw Mission Failure', error.message, error.stack);
    } finally {
      return await this.cleanup();
    }
  }

  async loginAndSelectCharacter() {
    console.log('\n🔍 Logging in and selecting character...');

    await this.goto('/login');
    const loginSuccess = await this.loginAs('pioneer@test.com', 'PioneerTest123!');

    if (!loginSuccess) {
      throw new Error('Failed to login');
    }

    await this.takeScreenshot('after-login');

    // Click first character's play button
    console.log('   Selecting first character...');
    const clicked = await this.evaluate(() => {
      const playButton = document.querySelector('[data-testid="character-play-button"]');
      if (playButton) {
        playButton.click();
        return true;
      }
      return false;
    });

    if (!clicked) {
      await this.reportBug('P1', 'Cannot select character', 'No select/play button found');
      throw new Error('Cannot select character');
    }

    await this.wait(3000);
    await this.takeScreenshot('character-selected');

    if (!this.page.url().includes('/game')) {
      await this.reportBug('P1', 'Not navigated to game', `Current URL: ${this.page.url()}`);
      throw new Error('Not navigated to game');
    }
  }

  async captureInitialState() {
    console.log('\n📊 Capturing initial character state...');

    this.initialState = await this.evaluate(() => {
      const state = {
        bodyText: document.body.textContent,
        hasLevel: false,
        hasGold: false,
        hasEnergy: false,
        hasXP: false,
        level: null,
        gold: null,
        energy: null,
        xp: null
      };

      // Try to extract stats from the page
      const text = state.bodyText;

      // Level
      const levelMatch = text.match(/Level[:\s]*(\d+)/i);
      if (levelMatch) {
        state.hasLevel = true;
        state.level = parseInt(levelMatch[1]);
      }

      // Gold (looking for $ or gold)
      const goldMatch = text.match(/(?:\$|Gold)[:\s]*(\d+)/i);
      if (goldMatch) {
        state.hasGold = true;
        state.gold = parseInt(goldMatch[1]);
      }

      // Energy
      const energyMatch = text.match(/Energy[:\s]*(\d+)/i);
      if (energyMatch) {
        state.hasEnergy = true;
        state.energy = parseInt(energyMatch[1]);
      }

      // XP
      const xpMatch = text.match(/XP[:\s]*(\d+)/i);
      if (xpMatch) {
        state.hasXP = true;
        state.xp = parseInt(xpMatch[1]);
      }

      return state;
    });

    console.log('   Initial State:', {
      level: this.initialState.level,
      gold: this.initialState.gold,
      energy: this.initialState.energy,
      xp: this.initialState.xp
    });

    await this.takeScreenshot('initial-state');
  }

  async testGetActions() {
    console.log('\n🔍 Testing actions/crimes navigation...');

    // Try to navigate to actions section
    const sectionsToTry = ['nav-actions', 'nav-crimes', 'nav-combat'];
    let navigatedToActions = false;

    for (const testId of sectionsToTry) {
      const clicked = await this.evaluate((id) => {
        const element = document.querySelector(`[data-testid="${id}"]`);
        if (element) {
          element.click();
          return true;
        }
        return false;
      }, testId);

      if (clicked) {
        console.log(`   ✅ Clicked ${testId}`);
        await this.wait(2000);
        navigatedToActions = true;
        await this.takeScreenshot(`navigated-to-${testId}`);
        break;
      }
    }

    if (!navigatedToActions) {
      await this.reportBug('P1', 'Cannot navigate to actions', 'None of the action navigation elements found');
      return;
    }

    // Check if actions are displayed
    const actionsInfo = await this.evaluate(() => {
      const info = {
        hasActionCards: false,
        hasActionButtons: false,
        actionCount: 0,
        actionTexts: []
      };

      // Look for action cards or buttons
      const cards = document.querySelectorAll('[data-testid*="action"], .action-card, .crime-card');
      info.actionCount = cards.length;
      info.hasActionCards = cards.length > 0;

      // Look for perform/execute buttons
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        const text = btn.textContent.toLowerCase();
        if (text.includes('perform') || text.includes('execute') || text.includes('attempt') || text.includes('do')) {
          info.hasActionButtons = true;
          info.actionTexts.push(btn.textContent.trim());
        }
      }

      return info;
    });

    console.log('   Actions found:', actionsInfo);

    if (!actionsInfo.hasActionCards && !actionsInfo.hasActionButtons) {
      await this.reportBug('P1', 'No actions available', 'No action cards or buttons found on the page');
    }
  }

  async testPerformActions() {
    console.log('\n🎯 Testing action performance...');

    // Try to perform an action via UI
    const actionPerformed = await this.performActionViaUI();

    if (!actionPerformed) {
      console.log('   UI action failed, trying API approach...');
      await this.performActionViaAPI();
    }
  }

  async performActionViaUI() {
    console.log('   Attempting to perform action via UI...');

    // Look for action buttons
    const actionButtonClicked = await this.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        const text = btn.textContent.toLowerCase();
        if (text.includes('perform') || text.includes('execute') || text.includes('attempt') || text.includes('pickpocket') || text.includes('steal')) {
          btn.click();
          return { success: true, buttonText: btn.textContent.trim() };
        }
      }
      return { success: false };
    });

    if (actionButtonClicked.success) {
      console.log(`   ✅ Clicked action button: ${actionButtonClicked.buttonText}`);
      await this.wait(3000);
      await this.takeScreenshot('after-action-ui');

      // Check for success/failure message
      const result = await this.evaluate(() => {
        const text = document.body.textContent;
        return {
          hasSuccess: /success|earned|gained|won/i.test(text),
          hasFailure: /failed|lost|caught|jailed/i.test(text),
          hasReward: /gold|xp|experience/i.test(text),
          text: text.substring(0, 500)
        };
      });

      console.log('   Action result:', result);

      if (result.hasSuccess || result.hasFailure) {
        this.actionsPerformed.push({
          method: 'UI',
          timestamp: new Date().toISOString(),
          success: result.hasSuccess,
          hasReward: result.hasReward
        });
        return true;
      }
    }

    return false;
  }

  async performActionViaAPI() {
    console.log('   Attempting to perform action via API...');

    try {
      // First, get the auth token and character ID
      const gameState = await this.getGameState();

      if (!gameState || !gameState.auth) {
        await this.reportBug('P1', 'No auth state found', 'Cannot access game state from localStorage');
        return false;
      }

      // Extract token and character ID
      const authState = gameState.auth.state || gameState.auth;
      const token = authState.token;
      const characterId = authState.user?.characters?.[0]?._id || authState.activeCharacter?.id;

      if (!token) {
        await this.reportBug('P1', 'No auth token', 'Cannot perform API action without token');
        return false;
      }

      if (!characterId) {
        await this.reportBug('P1', 'No character ID', 'Cannot perform API action without character ID');
        return false;
      }

      console.log(`   Using character ID: ${characterId}`);

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
          return { success: response.ok, data, status: response.status };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, this.config.apiUrl, token);

      console.log('   Actions API response:', actionsResponse.success ? 'OK' : 'FAILED');

      if (!actionsResponse.success) {
        await this.reportBug('P1', 'Failed to fetch actions', `API returned status ${actionsResponse.status}`);
        return false;
      }

      // Find a crime or action to perform
      const actions = actionsResponse.data?.data?.actions || {};
      const allActions = [
        ...(actions.CRIME || []),
        ...(actions.COMBAT || []),
        ...(actions.SOCIAL || []),
        ...(actions.CRAFT || [])
      ];

      if (allActions.length === 0) {
        await this.reportBug('P2', 'No actions available in API', 'Actions endpoint returned empty array');
        return false;
      }

      console.log(`   Found ${allActions.length} available actions`);

      // Pick the first action
      const action = allActions[0];
      console.log(`   Attempting action: ${action.name} (${action.type})`);

      // Perform the action
      const performResponse = await this.page.evaluate(async (apiUrl, authToken, actionId, charId) => {
        try {
          const response = await fetch(`${apiUrl}/actions/challenge`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              actionId: actionId,
              characterId: charId
            })
          });
          const data = await response.json();
          return { success: response.ok, data, status: response.status };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, this.config.apiUrl, token, action._id, characterId);

      console.log('   Perform action API response:', performResponse.success ? 'OK' : 'FAILED');

      if (performResponse.success) {
        const result = performResponse.data?.data?.result || {};
        console.log('   Action result:', {
          success: result.challengeSuccess,
          handRank: result.handRank,
          handDescription: result.handDescription,
          totalScore: result.totalScore,
          rewardsGained: result.rewardsGained
        });

        this.actionsPerformed.push({
          method: 'API',
          timestamp: new Date().toISOString(),
          actionName: action.name,
          actionType: action.type,
          success: result.challengeSuccess,
          handRank: result.handRank,
          score: result.totalScore,
          rewards: result.rewardsGained
        });

        if (result.rewardsGained) {
          this.rewardsEarned.totalGold += result.rewardsGained.gold || 0;
          this.rewardsEarned.totalXP += result.rewardsGained.xp || 0;
          this.rewardsEarned.actions++;
        }

        // Check if combat was triggered
        if (result.crimeResolution) {
          console.log('   Crime resolution:', result.crimeResolution);
        }

        await this.takeScreenshot('after-action-api');
        return true;
      } else {
        await this.reportBug('P1', 'Action API failed', `Status: ${performResponse.status}, Data: ${JSON.stringify(performResponse.data)}`);
        return false;
      }

    } catch (error) {
      await this.reportBug('P1', 'Error performing action via API', error.message);
      return false;
    }
  }

  async testCombatSystem() {
    console.log('\n⚔️ Testing combat system...');

    try {
      const gameState = await this.getGameState();
      const authState = gameState.auth.state || gameState.auth;
      const token = authState.token;

      if (!token) {
        console.log('   ⚠️ No auth token, skipping combat test');
        return;
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
          return { success: response.ok, data, status: response.status };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, this.config.apiUrl, token);

      if (!npcsResponse.success || !npcsResponse.data?.data?.length) {
        console.log('   ⚠️ No NPCs available for combat');
        return;
      }

      console.log(`   Found ${npcsResponse.data.data.length} NPCs available`);

      // Start combat with the first NPC
      const npc = npcsResponse.data.data[0];
      console.log(`   Starting combat with: ${npc.name} (Level ${npc.level})`);

      const startCombatResponse = await this.page.evaluate(async (apiUrl, authToken, npcId) => {
        try {
          const response = await fetch(`${apiUrl}/combat/start`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ npcId })
          });
          const data = await response.json();
          return { success: response.ok, data, status: response.status };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, this.config.apiUrl, token, npc._id);

      if (!startCombatResponse.success) {
        await this.reportBug('P2', 'Failed to start combat', `Status: ${startCombatResponse.status}`);
        return;
      }

      console.log('   ✅ Combat started successfully');
      const encounter = startCombatResponse.data?.data?.encounter;

      this.combatEncounters.push({
        npcName: npc.name,
        npcLevel: npc.level,
        encounterId: encounter._id,
        status: 'started'
      });

      // Play combat turns
      await this.playCombatTurns(encounter._id, token);

    } catch (error) {
      await this.reportBug('P2', 'Error testing combat system', error.message);
    }
  }

  async playCombatTurns(encounterId, token) {
    console.log('   Playing combat turns...');

    let turnCount = 0;
    let combatEnded = false;
    const maxTurns = 10; // Safety limit

    while (!combatEnded && turnCount < maxTurns) {
      turnCount++;
      console.log(`   Turn ${turnCount}...`);

      const turnResponse = await this.page.evaluate(async (apiUrl, authToken, encId) => {
        try {
          const response = await fetch(`${apiUrl}/combat/turn/${encId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          return { success: response.ok, data, status: response.status };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, this.config.apiUrl, token, encounterId);

      if (!turnResponse.success) {
        await this.reportBug('P2', 'Combat turn failed', `Turn ${turnCount} failed with status ${turnResponse.status}`);
        break;
      }

      const result = turnResponse.data?.data;
      console.log(`      Player HP: ${result.encounter?.playerHP}, NPC HP: ${result.encounter?.npcHP}`);

      if (result.combatEnded) {
        combatEnded = true;
        console.log('   ✅ Combat ended');

        if (result.lootAwarded) {
          console.log(`      Victory! Earned ${result.lootAwarded.gold} gold, ${result.lootAwarded.xp} XP`);
          this.rewardsEarned.totalGold += result.lootAwarded.gold;
          this.rewardsEarned.totalXP += result.lootAwarded.xp;
        } else if (result.deathPenalty) {
          console.log(`      Defeat! Lost ${result.deathPenalty.goldLost} gold`);
        }

        // Update encounter status
        const lastEncounter = this.combatEncounters[this.combatEncounters.length - 1];
        if (lastEncounter) {
          lastEncounter.status = result.lootAwarded ? 'won' : 'lost';
          lastEncounter.turns = turnCount;
          lastEncounter.rewards = result.lootAwarded;
        }
      }

      await this.wait(1000);
    }

    if (!combatEnded && turnCount >= maxTurns) {
      await this.reportBug('P2', 'Combat did not end', `Combat exceeded ${maxTurns} turns without ending`);
    }

    await this.takeScreenshot('after-combat');
  }

  async verifyStateChanges() {
    console.log('\n🔍 Verifying state changes...');

    // Navigate back to dashboard to check stats
    await this.goto('/game');
    await this.wait(2000);

    const finalState = await this.evaluate(() => {
      const state = {
        bodyText: document.body.textContent,
        level: null,
        gold: null,
        energy: null,
        xp: null
      };

      const text = state.bodyText;

      // Extract stats
      const levelMatch = text.match(/Level[:\s]*(\d+)/i);
      if (levelMatch) state.level = parseInt(levelMatch[1]);

      const goldMatch = text.match(/(?:\$|Gold)[:\s]*(\d+)/i);
      if (goldMatch) state.gold = parseInt(goldMatch[1]);

      const energyMatch = text.match(/Energy[:\s]*(\d+)/i);
      if (energyMatch) state.energy = parseInt(energyMatch[1]);

      const xpMatch = text.match(/XP[:\s]*(\d+)/i);
      if (xpMatch) state.xp = parseInt(xpMatch[1]);

      return state;
    });

    console.log('   Final State:', finalState);
    console.log('   Initial State:', {
      level: this.initialState.level,
      gold: this.initialState.gold,
      energy: this.initialState.energy,
      xp: this.initialState.xp
    });

    // Verify changes
    const changes = {
      goldChange: finalState.gold !== null && this.initialState.gold !== null
        ? finalState.gold - this.initialState.gold
        : 'unknown',
      xpChange: finalState.xp !== null && this.initialState.xp !== null
        ? finalState.xp - this.initialState.xp
        : 'unknown',
      levelChange: finalState.level !== null && this.initialState.level !== null
        ? finalState.level - this.initialState.level
        : 'unknown',
      energyChange: finalState.energy !== null && this.initialState.energy !== null
        ? finalState.energy - this.initialState.energy
        : 'unknown'
    };

    console.log('   Changes detected:', changes);

    // Verify rewards were applied
    if (this.rewardsEarned.actions > 0) {
      if (changes.goldChange === 'unknown' || changes.xpChange === 'unknown') {
        await this.reportBug('P1', 'Cannot verify rewards', 'Unable to extract stats from UI');
      } else if (changes.goldChange <= 0 && this.rewardsEarned.totalGold > 0) {
        await this.reportBug('P1', 'Gold not awarded', `Expected +${this.rewardsEarned.totalGold} gold but got ${changes.goldChange}`);
      } else if (changes.xpChange <= 0 && this.rewardsEarned.totalXP > 0) {
        await this.reportBug('P1', 'XP not awarded', `Expected +${this.rewardsEarned.totalXP} XP but got ${changes.xpChange}`);
      } else {
        console.log('   ✅ Rewards verified successfully');
      }
    }

    await this.takeScreenshot('final-state');
  }

  async generateCombatReport() {
    console.log('\n📊 OUTLAW COMBAT SYSTEM REPORT');
    console.log('=' .repeat(60));

    console.log(`\n📋 Actions Performed: ${this.actionsPerformed.length}`);
    this.actionsPerformed.forEach((action, i) => {
      console.log(`   ${i + 1}. ${action.actionName || 'Unknown'} (${action.method}) - ${action.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      if (action.rewards) {
        console.log(`      Rewards: ${action.rewards.gold} gold, ${action.rewards.xp} XP`);
      }
    });

    console.log(`\n⚔️ Combat Encounters: ${this.combatEncounters.length}`);
    this.combatEncounters.forEach((encounter, i) => {
      console.log(`   ${i + 1}. ${encounter.npcName} (Level ${encounter.npcLevel}) - ${encounter.status.toUpperCase()}`);
      if (encounter.turns) {
        console.log(`      Turns: ${encounter.turns}`);
      }
      if (encounter.rewards) {
        console.log(`      Rewards: ${encounter.rewards.gold} gold, ${encounter.rewards.xp} XP`);
      }
    });

    console.log(`\n💰 Total Rewards Earned:`);
    console.log(`   Gold: ${this.rewardsEarned.totalGold}`);
    console.log(`   XP: ${this.rewardsEarned.totalXP}`);
    console.log(`   Successful Actions: ${this.rewardsEarned.actions}`);

    console.log(`\n🐛 Bugs Found: ${this.bugs.length}`);
    console.log(`   P0: ${this.bugs.filter(b => b.severity === 'P0').length}`);
    console.log(`   P1: ${this.bugs.filter(b => b.severity === 'P1').length}`);
    console.log(`   P2: ${this.bugs.filter(b => b.severity === 'P2').length}`);

    if (this.bugs.length > 0) {
      console.log('\n🐛 Bug Details:');
      this.bugs.forEach(bug => {
        console.log(`   [${bug.severity}] ${bug.title}`);
        console.log(`       ${bug.description}`);
      });
    }

    console.log(`\n📸 Screenshots: ${this.screenshots.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);

    return {
      actionsTested: this.actionsPerformed.length,
      combatEncounters: this.combatEncounters.length,
      rewardsEarned: this.rewardsEarned,
      bugsFound: this.bugs.length,
      screenshotsTaken: this.screenshots.length
    };
  }
}

// Run if executed directly
if (require.main === module) {
  const outlaw = new OutlawAgent();
  outlaw.runMission().then(report => {
    console.log('\n🏁 Outlaw mission complete!');
    const p0Bugs = report.bugs ? report.bugs.filter(b => b.severity === 'P0').length : 0;
    process.exit(p0Bugs > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = OutlawAgent;
