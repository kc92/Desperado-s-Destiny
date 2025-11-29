/**
 * Combat System End-to-End Test
 *
 * Comprehensive test covering:
 * - NPC loading
 * - Combat initiation
 * - Turn-based combat flow
 * - Victory rewards (gold, XP, items)
 * - Defeat penalties
 * - Flee mechanics
 * - Combat stats tracking
 */

const puppeteer = require('puppeteer');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:5173';

// Test configuration
const TEST_USER = {
  email: `combat_test_${Date.now()}@test.com`,
  password: 'Test123!@#',
  username: `CombatTester${Date.now()}`
};

const TEST_CONFIG = {
  headless: false, // Set to true for CI/CD
  slowMo: 50, // Slow down actions for visibility
  timeout: 60000
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  bugs: [],
  tests: []
};

function recordTest(name, passed, details = '') {
  results.total++;
  if (passed) {
    results.passed++;
    logSuccess(`${name}: PASS`);
  } else {
    results.failed++;
    logError(`${name}: FAIL - ${details}`);
    results.bugs.push({ test: name, details });
  }
  results.tests.push({ name, passed, details });
}

async function registerAndLogin(page) {
  logSection('AUTHENTICATION');

  try {
    // Navigate to app
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);

    // Check if login page exists
    const loginExists = await page.$('input[type="email"]') !== null;

    if (!loginExists) {
      throw new Error('Login form not found');
    }

    // Register new user
    logInfo('Registering new user...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      email: TEST_USER.email,
      password: TEST_USER.password,
      username: TEST_USER.username
    });

    if (registerResponse.data.success) {
      logSuccess('User registered successfully');
    }

    // Login
    logInfo('Logging in...');
    await page.type('input[type="email"]', TEST_USER.email);
    await page.type('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // Verify login
    const token = await page.evaluate(() => localStorage.getItem('token'));

    if (token) {
      logSuccess('Login successful');
      return token;
    } else {
      throw new Error('No token found after login');
    }
  } catch (error) {
    logError(`Authentication failed: ${error.message}`);
    throw error;
  }
}

async function createCharacter(page) {
  logSection('CHARACTER CREATION');

  try {
    await page.waitForTimeout(1000);

    // Check if we're on character creation page
    const onCharCreation = await page.evaluate(() => {
      return window.location.pathname.includes('character');
    });

    if (onCharCreation) {
      logInfo('Creating character...');

      // Fill character form
      await page.type('input[name="name"]', 'TestWarrior');

      // Select faction (if exists)
      const factionSelector = await page.$('select[name="faction"]');
      if (factionSelector) {
        await page.select('select[name="faction"]', 'FRONTERA');
      }

      // Submit
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      logSuccess('Character created');
    } else {
      logInfo('Character already exists, skipping creation');
    }

    // Get character data from API
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const charResponse = await axios.get(`${API_URL}/characters`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const character = charResponse.data.data.characters[0];
    logInfo(`Character: ${character.name} (Level ${character.level})`);

    return character;
  } catch (error) {
    logError(`Character creation failed: ${error.message}`);
    throw error;
  }
}

async function testNPCList(token) {
  logSection('TEST 1: NPC LIST');

  try {
    const response = await axios.get(`${API_URL}/combat/npcs`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const npcs = response.data.data;

    logInfo(`Total NPCs: ${npcs.total}`);
    logInfo(`Outlaws: ${npcs.byType.OUTLAW.length}`);
    logInfo(`Wildlife: ${npcs.byType.WILDLIFE.length}`);
    logInfo(`Lawmen: ${npcs.byType.LAWMAN.length}`);

    recordTest('NPC List Loaded', npcs.total > 0, npcs.total === 0 ? 'No NPCs found' : '');
    recordTest('NPCs Have Required Fields',
      npcs.byType.OUTLAW.length > 0 && npcs.byType.OUTLAW[0].maxHP > 0,
      'NPCs missing maxHP or other required fields'
    );

    return npcs.byType.OUTLAW[0]; // Return first outlaw for testing
  } catch (error) {
    recordTest('NPC List Loaded', false, error.message);
    throw error;
  }
}

async function testCombatInitiation(token, npc) {
  logSection('TEST 2: COMBAT INITIATION');

  try {
    const response = await axios.post(`${API_URL}/combat/start`, {
      npcId: npc._id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const encounter = response.data.data.encounter;

    logInfo(`Combat started vs ${npc.name}`);
    logInfo(`Player HP: ${encounter.playerHP}/${encounter.playerMaxHP}`);
    logInfo(`NPC HP: ${encounter.npcHP}/${encounter.npcMaxHP}`);
    logInfo(`Status: ${encounter.status}`);

    recordTest('Combat Initiation', encounter.status === 'ACTIVE');
    recordTest('Player Has HP', encounter.playerHP > 0);
    recordTest('NPC Has HP', encounter.npcHP > 0);
    recordTest('Combat Round Initialized', encounter.roundNumber === 1);
    recordTest('Player Turn First', encounter.turn === 0,
      encounter.turn !== 0 ? 'NPC went first instead of player' : '');

    return encounter;
  } catch (error) {
    recordTest('Combat Initiation', false, error.message);

    // Check for specific errors
    if (error.response?.data?.error?.includes('energy')) {
      logWarning('Insufficient energy - this is expected behavior');
      results.warnings++;
    }

    throw error;
  }
}

async function testCombatTurn(token, encounterId) {
  logSection('TEST 3: COMBAT TURN');

  try {
    const response = await axios.post(`${API_URL}/combat/turn/${encounterId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = response.data.data;
    const playerRound = result.playerRound;
    const npcRound = result.npcRound;

    logInfo(`Player Hand: ${playerRound.playerHandRank}`);
    logInfo(`Player Damage: ${playerRound.playerDamage}`);
    logInfo(`NPC Hand: ${npcRound?.npcHandRank || 'N/A'}`);
    logInfo(`NPC Damage: ${npcRound?.npcDamage || 0}`);
    logInfo(`Player HP After: ${playerRound.playerHPAfter}`);
    logInfo(`NPC HP After: ${playerRound.npcHPAfter}`);

    recordTest('Turn Executed', result.encounter !== undefined);
    recordTest('Player Dealt Damage', playerRound.playerDamage > 0);
    recordTest('Player Hand Evaluated', playerRound.playerHandRank !== undefined);
    recordTest('NPC Turn Auto-Played', npcRound !== undefined && npcRound.npcDamage >= 0);
    recordTest('HP Updated',
      playerRound.npcHPAfter < result.encounter.npcMaxHP ||
      playerRound.playerHPAfter < result.encounter.playerMaxHP
    );

    // Check for bugs in damage calculation
    if (playerRound.playerDamage < 0) {
      recordTest('Damage Calculation Bug', false, 'Negative damage dealt');
      results.bugs.push({
        bug: 'NEGATIVE_DAMAGE',
        details: `Player dealt ${playerRound.playerDamage} damage`
      });
    }

    if (playerRound.npcHPAfter > result.encounter.npcMaxHP) {
      recordTest('HP Overflow Bug', false, 'NPC HP exceeded maximum');
      results.bugs.push({
        bug: 'HP_OVERFLOW',
        details: `NPC HP ${playerRound.npcHPAfter} > Max ${result.encounter.npcMaxHP}`
      });
    }

    return result;
  } catch (error) {
    recordTest('Turn Executed', false, error.message);
    throw error;
  }
}

async function testFullCombat(token, npc) {
  logSection('TEST 4: FULL COMBAT (TO VICTORY OR DEFEAT)');

  try {
    // Start combat
    let combatResponse = await axios.post(`${API_URL}/combat/start`, {
      npcId: npc._id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const encounterId = combatResponse.data.data.encounter._id;
    let combatEnded = false;
    let turnCount = 0;
    let maxTurns = 50; // Prevent infinite loop

    logInfo('Playing combat to completion...');

    while (!combatEnded && turnCount < maxTurns) {
      turnCount++;

      const turnResponse = await axios.post(
        `${API_URL}/combat/turn/${encounterId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const result = turnResponse.data.data;
      combatEnded = result.combatEnded;

      if (combatEnded) {
        logInfo(`Combat ended after ${turnCount} turns`);
        logInfo(`Status: ${result.encounter.status}`);

        if (result.lootAwarded) {
          logInfo(`Loot Awarded:`);
          logInfo(`  - Gold: ${result.lootAwarded.gold}`);
          logInfo(`  - XP: ${result.lootAwarded.xp}`);
          logInfo(`  - Items: ${result.lootAwarded.items.join(', ') || 'None'}`);

          recordTest('Victory Loot Awarded', result.lootAwarded.gold > 0 && result.lootAwarded.xp > 0);
          recordTest('Loot Within Range',
            result.lootAwarded.gold >= npc.lootTable.goldMin &&
            result.lootAwarded.gold <= npc.lootTable.goldMax
          );
        }

        if (result.deathPenalty) {
          logInfo(`Death Penalty:`);
          logInfo(`  - Gold Lost: ${result.deathPenalty.goldLost}`);
          logInfo(`  - Respawned: ${result.deathPenalty.respawned}`);

          recordTest('Death Penalty Applied', result.deathPenalty.goldLost >= 0);
          recordTest('Character Respawned', result.deathPenalty.respawned === true);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between turns
    }

    if (turnCount >= maxTurns) {
      logWarning(`Combat took more than ${maxTurns} turns - possible infinite loop`);
      results.warnings++;
    }

    recordTest('Combat Completion', combatEnded);
    recordTest('Combat Turns Reasonable', turnCount < maxTurns);

    return combatEnded;
  } catch (error) {
    recordTest('Full Combat', false, error.message);
    throw error;
  }
}

async function testFleeMechanic(token, npc) {
  logSection('TEST 5: FLEE MECHANIC');

  try {
    // Start new combat
    const startResponse = await axios.post(`${API_URL}/combat/start`, {
      npcId: npc._id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const encounterId = startResponse.data.data.encounter._id;

    // Try to flee immediately (should work - round 1)
    const fleeResponse = await axios.post(
      `${API_URL}/combat/flee/${encounterId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const encounter = fleeResponse.data.data.encounter;

    logInfo(`Flee Status: ${encounter.status}`);

    recordTest('Flee Succeeded', encounter.status === 'FLED');
    recordTest('No Loot on Flee', !encounter.lootAwarded);

    return true;
  } catch (error) {
    if (error.response?.data?.error?.includes('already in combat')) {
      // Try with a different NPC
      logWarning('Character already in combat, retrying...');
      return false;
    }

    recordTest('Flee Mechanic', false, error.message);
    return false;
  }
}

async function testFleeRestriction(token, npc) {
  logSection('TEST 6: FLEE RESTRICTION (After Round 3)');

  try {
    // Start new combat
    const startResponse = await axios.post(`${API_URL}/combat/start`, {
      npcId: npc._id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const encounterId = startResponse.data.data.encounter._id;

    // Play 3 turns
    for (let i = 0; i < 3; i++) {
      await axios.post(
        `${API_URL}/combat/turn/${encounterId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    // Try to flee after round 3 (should fail)
    try {
      await axios.post(
        `${API_URL}/combat/flee/${encounterId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      recordTest('Flee Blocked After Round 3', false, 'Flee should be blocked but succeeded');
    } catch (fleeError) {
      if (fleeError.response?.data?.error?.includes('Cannot flee')) {
        recordTest('Flee Blocked After Round 3', true);
        logSuccess('Flee correctly blocked after round 3');
      } else {
        recordTest('Flee Blocked After Round 3', false, fleeError.message);
      }
    }

    return true;
  } catch (error) {
    recordTest('Flee Restriction Test', false, error.message);
    return false;
  }
}

async function testCombatStats(token, character) {
  logSection('TEST 7: COMBAT STATS TRACKING');

  try {
    // Get updated character data
    const charResponse = await axios.get(`${API_URL}/characters`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const updatedChar = charResponse.data.data.characters[0];
    const stats = updatedChar.combatStats;

    if (stats) {
      logInfo(`Combat Stats:`);
      logInfo(`  - Wins: ${stats.wins}`);
      logInfo(`  - Losses: ${stats.losses}`);
      logInfo(`  - Total Damage: ${stats.totalDamage}`);
      logInfo(`  - Kills: ${stats.kills}`);

      recordTest('Combat Stats Exist', true);
      recordTest('Stats Have Values', stats.wins >= 0 && stats.losses >= 0);
    } else {
      recordTest('Combat Stats Exist', false, 'No combat stats found on character');
    }

    return stats;
  } catch (error) {
    recordTest('Combat Stats', false, error.message);
    return null;
  }
}

async function testCombatHistory(token) {
  logSection('TEST 8: COMBAT HISTORY');

  try {
    const historyResponse = await axios.get(`${API_URL}/combat/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const history = historyResponse.data.data;

    logInfo(`Total Encounters: ${history.total}`);
    logInfo(`Win Rate: ${history.stats.winRate?.toFixed(1) || 0}%`);
    logInfo(`Recent Encounters: ${history.encounters.length}`);

    recordTest('Combat History Retrieved', history.total >= 0);
    recordTest('History Has Encounters', history.encounters.length > 0);

    if (history.encounters.length > 0) {
      const lastEncounter = history.encounters[0];
      logInfo(`Last Encounter:`);
      logInfo(`  - NPC: ${lastEncounter.npcName}`);
      logInfo(`  - Status: ${lastEncounter.status}`);
      logInfo(`  - Rounds: ${lastEncounter.rounds}`);
      logInfo(`  - Gold: ${lastEncounter.goldEarned}`);
      logInfo(`  - XP: ${lastEncounter.xpEarned}`);
    }

    return history;
  } catch (error) {
    recordTest('Combat History', false, error.message);
    return null;
  }
}

async function analyzeCombatBalance(token, npc) {
  logSection('COMBAT BALANCE ANALYSIS');

  try {
    logInfo('Running 10 simulated combats for balance analysis...');

    const results = {
      victories: 0,
      defeats: 0,
      totalRounds: 0,
      totalGold: 0,
      totalXP: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0
    };

    for (let i = 0; i < 10; i++) {
      try {
        const startResponse = await axios.post(`${API_URL}/combat/start`, {
          npcId: npc._id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const encounterId = startResponse.data.data.encounter._id;
        let combatEnded = false;
        let roundCount = 0;

        while (!combatEnded && roundCount < 50) {
          roundCount++;

          const turnResponse = await axios.post(
            `${API_URL}/combat/turn/${encounterId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const result = turnResponse.data.data;
          combatEnded = result.combatEnded;

          if (combatEnded) {
            results.totalRounds += roundCount;

            if (result.encounter.status === 'PLAYER_VICTORY') {
              results.victories++;
              results.totalGold += result.lootAwarded?.gold || 0;
              results.totalXP += result.lootAwarded?.xp || 0;
            } else if (result.encounter.status === 'PLAYER_DEFEAT') {
              results.defeats++;
            }
          }
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        logWarning(`Combat ${i + 1} failed: ${error.message}`);
      }
    }

    logInfo('\nBalance Analysis Results:');
    logInfo(`  Win Rate: ${((results.victories / 10) * 100).toFixed(1)}%`);
    logInfo(`  Avg Rounds per Combat: ${(results.totalRounds / 10).toFixed(1)}`);
    logInfo(`  Avg Gold per Victory: ${results.victories > 0 ? (results.totalGold / results.victories).toFixed(1) : 0}`);
    logInfo(`  Avg XP per Victory: ${results.victories > 0 ? (results.totalXP / results.victories).toFixed(1) : 0}`);

    // Balance recommendations
    const winRate = (results.victories / 10) * 100;
    if (winRate < 40) {
      logWarning('⚠️  BALANCE: Combat is too difficult for new players');
      results.warnings++;
    } else if (winRate > 90) {
      logWarning('⚠️  BALANCE: Combat is too easy - lacks challenge');
      results.warnings++;
    } else {
      logSuccess('✅ BALANCE: Win rate is within acceptable range');
    }

    const avgRounds = results.totalRounds / 10;
    if (avgRounds > 30) {
      logWarning('⚠️  BALANCE: Combat takes too long');
      results.warnings++;
    } else if (avgRounds < 3) {
      logWarning('⚠️  BALANCE: Combat ends too quickly');
      results.warnings++;
    } else {
      logSuccess('✅ BALANCE: Combat duration is appropriate');
    }

    return results;
  } catch (error) {
    logError(`Balance analysis failed: ${error.message}`);
    return null;
  }
}

async function runAllTests() {
  let browser;
  let page;

  try {
    logSection('DESPERADOS DESTINY - COMBAT SYSTEM TEST');
    logInfo('Starting comprehensive combat system testing...');
    logInfo(`Test User: ${TEST_USER.email}`);

    // Launch browser
    browser = await puppeteer.launch({
      headless: TEST_CONFIG.headless,
      slowMo: TEST_CONFIG.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Enable console logging from page
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logError(`Browser: ${msg.text()}`);
      }
    });

    // Step 1: Authentication
    const token = await registerAndLogin(page);

    // Step 2: Character Creation
    const character = await createCharacter(page);

    // Step 3: Test NPC List
    const testNPC = await testNPCList(token);

    // Step 4: Test Combat Initiation
    const encounter = await testCombatInitiation(token, testNPC);

    // Step 5: Test Single Combat Turn
    await testCombatTurn(token, encounter._id);

    // Step 6: Test Full Combat
    await testFullCombat(token, testNPC);

    // Step 7: Test Flee Mechanic
    await testFleeMechanic(token, testNPC);

    // Step 8: Test Flee Restriction
    await testFleeRestriction(token, testNPC);

    // Step 9: Test Combat Stats
    await testCombatStats(token, character);

    // Step 10: Test Combat History
    await testCombatHistory(token);

    // Step 11: Combat Balance Analysis
    await analyzeCombatBalance(token, testNPC);

  } catch (error) {
    logError(`Fatal error: ${error.message}`);
    console.error(error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }

    // Print final report
    printFinalReport();
  }
}

function printFinalReport() {
  logSection('FINAL REPORT - COMBAT SYSTEM TESTING');

  console.log(`Total Tests: ${results.total}`);
  logSuccess(`Passed: ${results.passed}`);
  logError(`Failed: ${results.failed}`);
  logWarning(`Warnings: ${results.warnings}`);

  const completeness = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`\nCombat System Completeness: ${completeness}%`);

  if (results.bugs.length > 0) {
    logSection('BUGS FOUND');
    results.bugs.forEach((bug, index) => {
      console.log(`\n${index + 1}. ${bug.test || bug.bug}`);
      console.log(`   ${bug.details}`);
    });
  }

  logSection('RECOMMENDATIONS');

  if (results.failed === 0 && results.warnings === 0) {
    logSuccess('🎉 All tests passed! Combat system is production-ready.');
  } else if (results.failed === 0) {
    logSuccess('✅ Core functionality working, but has balance issues to address.');
  } else if (results.failed < 5) {
    logWarning('⚠️  Some critical bugs found - fix before production.');
  } else {
    logError('❌ Major issues found - significant work needed.');
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests();
