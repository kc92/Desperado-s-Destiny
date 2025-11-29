/**
 * Agent 5: The Banker
 * Economy System Testing - Gold transactions, economy integrity, and anti-exploit verification
 *
 * Mission: Test the gold economy system comprehensively to ensure:
 * - Accurate gold transactions
 * - No negative gold exploits
 * - Proper transaction rollback on failures
 * - Database persistence
 * - Gang vault security
 * - Mail gold attachments
 * - Combat and crime rewards
 */

const TestRunner = require('../core/TestRunner');

class BankerAgent extends TestRunner {
  constructor() {
    super('Agent-5-Banker');
    this.economyReport = {
      initialGold: 0,
      finalGold: 0,
      transactions: [],
      bugs: [],
      exploits: [],
      warnings: [],
      testResults: {
        goldBalance: { passed: false, tests: [] },
        goldDeductions: { passed: false, tests: [] },
        goldRewards: { passed: false, tests: [] },
        mailTransfers: { passed: false, tests: [] },
        gangVault: { passed: false, tests: [] },
        negativeGold: { passed: false, tests: [] },
        transactionRollback: { passed: false, tests: [] },
        persistence: { passed: false, tests: [] }
      }
    };
    this.sessionToken = null;
    this.characterId = null;
    this.gangId = null;
  }

  async runMission() {
    console.log('\n💰 THE BANKER - Testing Economy System...');
    console.log('=' .repeat(60));

    try {
      await this.initialize();

      // Phase 1: Login and Character Selection
      await this.loginAndSelectCharacter();

      // Phase 2: Check Initial Gold Balance
      await this.testInitialGoldBalance();

      // Phase 3: Test Gold Deductions (Crimes, Actions)
      await this.testGoldDeductions();

      // Phase 4: Test Gold Rewards (Combat, Actions)
      await this.testGoldRewards();

      // Phase 5: Test Mail Gold Transfers
      await this.testMailGoldTransfers();

      // Phase 6: Test Gang Vault Operations
      await this.testGangVaultOperations();

      // Phase 7: Test Negative Gold Protection
      await this.testNegativeGoldProtection();

      // Phase 8: Test Transaction Rollback
      await this.testTransactionRollback();

      // Phase 9: Test Database Persistence
      await this.testDatabasePersistence();

      // Phase 10: Verify Gold History Accuracy
      await this.verifyGoldHistory();

      // Generate comprehensive economy report
      await this.generateEconomyReport();

    } catch (error) {
      console.error('❌ Banker mission failed:', error);
      await this.reportBug('P0', 'Banker Mission Critical Failure', error.message, error.stack);
    } finally {
      return await this.cleanup();
    }
  }

  /**
   * Phase 1: Login and select character
   */
  async loginAndSelectCharacter() {
    console.log('\n🔐 Phase 1: Login and Character Selection...');

    await this.goto('/login');
    await this.wait(2000);

    // Login with verified test account
    const loginSuccess = await this.loginAs('test@test.com', 'Test123!');

    if (!loginSuccess) {
      throw new Error('Login failed - cannot test economy');
    }

    console.log('   ✅ Login successful');
    await this.takeScreenshot('banker-logged-in');
    await this.wait(3000);

    // Get session token from localStorage
    this.sessionToken = await this.page.evaluate(() => {
      return localStorage.getItem('token');
    });

    if (!this.sessionToken) {
      console.log('   ⚠️ Attempting to retrieve token from cookies...');
      const cookies = await this.page.cookies();
      const tokenCookie = cookies.find(c => c.name === 'token' || c.name === 'authToken');
      if (tokenCookie) {
        this.sessionToken = tokenCookie.value;
      }
    }

    if (!this.sessionToken) {
      throw new Error('No session token found in localStorage or cookies');
    }

    console.log('   ✅ Session token retrieved');

    // Select first character
    const characterSelected = await this.evaluate(() => {
      const playButton = document.querySelector('[data-testid="character-play-button"]');
      if (playButton) {
        playButton.click();
        return true;
      }
      return false;
    });

    if (!characterSelected) {
      throw new Error('Character selection failed');
    }

    await this.wait(3000);
    await this.takeScreenshot('banker-character-selected');

    // Get character ID from API
    const characterData = await this.apiRequest('/characters', 'GET');
    if (characterData && characterData.data && characterData.data.length > 0) {
      this.characterId = characterData.data.find(c => c.isActive)?._id;
      console.log(`   ✅ Character ID: ${this.characterId}`);
    }

    console.log('   ✅ Character selected successfully');
  }

  /**
   * Phase 2: Check Initial Gold Balance
   */
  async testInitialGoldBalance() {
    console.log('\n💵 Phase 2: Testing Initial Gold Balance...');

    try {
      const balanceData = await this.apiRequest('/gold/balance', 'GET');

      if (balanceData && balanceData.success) {
        this.initialGold = balanceData.data.gold;
        this.economyReport.initialGold = this.initialGold;

        console.log(`   ✅ Initial Gold Balance: ${this.initialGold}`);

        this.economyReport.testResults.goldBalance.passed = true;
        this.economyReport.testResults.goldBalance.tests.push({
          test: 'Get Gold Balance API',
          result: 'PASS',
          value: this.initialGold
        });

        // Verify gold is non-negative
        if (this.initialGold < 0) {
          await this.reportBug('P0', 'Negative Gold Balance',
            `Character has negative gold: ${this.initialGold}`,
            'Initial balance check');
          this.economyReport.exploits.push({
            type: 'NEGATIVE_GOLD',
            severity: 'CRITICAL',
            value: this.initialGold
          });
        }
      } else {
        throw new Error('Failed to retrieve gold balance');
      }
    } catch (error) {
      console.error('   ❌ Gold balance check failed:', error.message);
      this.economyReport.testResults.goldBalance.passed = false;
      this.economyReport.testResults.goldBalance.tests.push({
        test: 'Get Gold Balance API',
        result: 'FAIL',
        error: error.message
      });
    }
  }

  /**
   * Phase 3: Test Gold Deductions
   */
  async testGoldDeductions() {
    console.log('\n💸 Phase 3: Testing Gold Deductions...');

    const tests = [];

    // Test 1: Laying low (costs gold)
    try {
      console.log('   Testing lay-low gold deduction...');

      const beforeGold = await this.getGoldBalance();
      const layLowResponse = await this.apiRequest('/crimes/lay-low', 'POST', {});

      if (layLowResponse && layLowResponse.success) {
        const afterGold = await this.getGoldBalance();
        const goldSpent = beforeGold - afterGold;

        if (goldSpent > 0) {
          console.log(`   ✅ Lay-low deducted ${goldSpent} gold correctly`);
          tests.push({
            test: 'Lay-low Gold Deduction',
            result: 'PASS',
            before: beforeGold,
            after: afterGold,
            deducted: goldSpent
          });

          this.economyReport.transactions.push({
            type: 'DEDUCTION',
            source: 'LAY_LOW',
            amount: -goldSpent,
            before: beforeGold,
            after: afterGold
          });
        } else {
          console.log(`   ⚠️ Lay-low did not deduct gold (before: ${beforeGold}, after: ${afterGold})`);
          tests.push({
            test: 'Lay-low Gold Deduction',
            result: 'WARNING',
            note: 'No gold deducted - may be free or character not wanted'
          });
        }
      } else {
        console.log('   ⚠️ Lay-low request failed - character may not be wanted');
        tests.push({
          test: 'Lay-low Gold Deduction',
          result: 'SKIP',
          reason: 'Character not wanted or insufficient funds'
        });
      }
    } catch (error) {
      console.log(`   ⚠️ Lay-low test failed: ${error.message}`);
      tests.push({
        test: 'Lay-low Gold Deduction',
        result: 'ERROR',
        error: error.message
      });
    }

    // Test 2: Gang creation (if not in a gang) - costs 2000 gold
    try {
      console.log('   Testing gang creation gold deduction...');

      const currentGold = await this.getGoldBalance();

      if (currentGold >= 2000) {
        // Try to create a gang
        const gangName = `TestGang_${Date.now()}`;
        const gangTag = `TG${Math.floor(Math.random() * 1000)}`;

        const beforeGold = currentGold;
        const gangResponse = await this.apiRequest('/gangs/create', 'POST', {
          name: gangName,
          tag: gangTag
        });

        if (gangResponse && gangResponse.success) {
          const afterGold = await this.getGoldBalance();
          const goldSpent = beforeGold - afterGold;

          if (goldSpent === 2000) {
            console.log(`   ✅ Gang creation deducted exactly 2000 gold`);
            this.gangId = gangResponse.data._id;
            tests.push({
              test: 'Gang Creation Gold Deduction',
              result: 'PASS',
              before: beforeGold,
              after: afterGold,
              deducted: goldSpent,
              expected: 2000
            });

            this.economyReport.transactions.push({
              type: 'DEDUCTION',
              source: 'GANG_CREATION',
              amount: -goldSpent,
              before: beforeGold,
              after: afterGold
            });
          } else {
            await this.reportBug('P1', 'Incorrect Gang Creation Cost',
              `Gang creation cost ${goldSpent} gold instead of 2000`,
              `Expected: 2000, Actual: ${goldSpent}`);
            tests.push({
              test: 'Gang Creation Gold Deduction',
              result: 'FAIL',
              expected: 2000,
              actual: goldSpent
            });
          }
        } else {
          console.log('   ⚠️ Gang creation failed - may already be in a gang');
          tests.push({
            test: 'Gang Creation Gold Deduction',
            result: 'SKIP',
            reason: 'Already in gang or creation failed'
          });
        }
      } else {
        console.log(`   ⚠️ Insufficient gold for gang creation (have ${currentGold}, need 2000)`);
        tests.push({
          test: 'Gang Creation Gold Deduction',
          result: 'SKIP',
          reason: 'Insufficient gold'
        });
      }
    } catch (error) {
      console.log(`   ⚠️ Gang creation test failed: ${error.message}`);
      tests.push({
        test: 'Gang Creation Gold Deduction',
        result: 'ERROR',
        error: error.message
      });
    }

    this.economyReport.testResults.goldDeductions.tests = tests;
    this.economyReport.testResults.goldDeductions.passed = tests.some(t => t.result === 'PASS');
  }

  /**
   * Phase 4: Test Gold Rewards
   */
  async testGoldRewards() {
    console.log('\n💎 Phase 4: Testing Gold Rewards...');

    const tests = [];

    // Test 1: Combat victory rewards
    try {
      console.log('   Testing combat victory gold rewards...');

      // Get available NPCs
      const npcsResponse = await this.apiRequest('/combat/npcs', 'GET');

      if (npcsResponse && npcsResponse.data && npcsResponse.data.length > 0) {
        const weakestNPC = npcsResponse.data.sort((a, b) => a.level - b.level)[0];
        console.log(`   Attempting combat with ${weakestNPC.name} (Level ${weakestNPC.level})`);

        const beforeGold = await this.getGoldBalance();

        // Start combat
        const combatResponse = await this.apiRequest('/combat/start', 'POST', {
          npcId: weakestNPC._id
        });

        if (combatResponse && combatResponse.data) {
          const encounterId = combatResponse.data._id;
          let combatActive = true;
          let turns = 0;
          const maxTurns = 20;

          // Fight until combat ends
          while (combatActive && turns < maxTurns) {
            turns++;
            const turnResponse = await this.apiRequest(`/combat/turn/${encounterId}`, 'POST', {});

            if (turnResponse && turnResponse.data) {
              if (turnResponse.data.status === 'victory') {
                combatActive = false;
                const afterGold = await this.getGoldBalance();
                const goldEarned = afterGold - beforeGold;

                if (goldEarned > 0) {
                  console.log(`   ✅ Combat victory earned ${goldEarned} gold`);
                  tests.push({
                    test: 'Combat Victory Gold Reward',
                    result: 'PASS',
                    before: beforeGold,
                    after: afterGold,
                    earned: goldEarned
                  });

                  this.economyReport.transactions.push({
                    type: 'REWARD',
                    source: 'COMBAT_VICTORY',
                    amount: goldEarned,
                    before: beforeGold,
                    after: afterGold
                  });
                } else {
                  await this.reportBug('P1', 'Combat Victory No Gold',
                    'Combat victory did not award gold',
                    `Before: ${beforeGold}, After: ${afterGold}`);
                  tests.push({
                    test: 'Combat Victory Gold Reward',
                    result: 'FAIL',
                    note: 'No gold earned from victory'
                  });
                }
              } else if (turnResponse.data.status === 'defeat') {
                combatActive = false;
                console.log('   ⚠️ Combat ended in defeat');
                tests.push({
                  test: 'Combat Victory Gold Reward',
                  result: 'SKIP',
                  reason: 'Combat defeat'
                });
              }
            }

            await this.wait(500);
          }

          if (turns >= maxTurns) {
            console.log('   ⚠️ Combat timed out after max turns');
            tests.push({
              test: 'Combat Victory Gold Reward',
              result: 'TIMEOUT',
              turns: maxTurns
            });
          }
        }
      } else {
        console.log('   ⚠️ No NPCs available for combat');
        tests.push({
          test: 'Combat Victory Gold Reward',
          result: 'SKIP',
          reason: 'No NPCs available'
        });
      }
    } catch (error) {
      console.log(`   ⚠️ Combat reward test failed: ${error.message}`);
      tests.push({
        test: 'Combat Victory Gold Reward',
        result: 'ERROR',
        error: error.message
      });
    }

    // Test 2: Action challenge rewards
    try {
      console.log('   Testing action challenge gold rewards...');

      const actionsResponse = await this.apiRequest('/actions', 'GET');

      if (actionsResponse && actionsResponse.data && actionsResponse.data.length > 0) {
        const action = actionsResponse.data.find(a => a.goldReward > 0);

        if (action) {
          const beforeGold = await this.getGoldBalance();

          const challengeResponse = await this.apiRequest('/actions/challenge', 'POST', {
            actionId: action._id
          });

          if (challengeResponse && challengeResponse.data) {
            await this.wait(1000);
            const afterGold = await this.getGoldBalance();
            const goldEarned = afterGold - beforeGold;

            if (challengeResponse.data.result === 'success' && goldEarned > 0) {
              console.log(`   ✅ Action success earned ${goldEarned} gold`);
              tests.push({
                test: 'Action Challenge Gold Reward',
                result: 'PASS',
                action: action.name,
                before: beforeGold,
                after: afterGold,
                earned: goldEarned
              });

              this.economyReport.transactions.push({
                type: 'REWARD',
                source: 'ACTION_SUCCESS',
                amount: goldEarned,
                before: beforeGold,
                after: afterGold
              });
            } else if (challengeResponse.data.result === 'failure') {
              console.log('   ⚠️ Action challenge failed');
              tests.push({
                test: 'Action Challenge Gold Reward',
                result: 'SKIP',
                reason: 'Challenge failed'
              });
            }
          }
        } else {
          console.log('   ⚠️ No actions with gold rewards found');
          tests.push({
            test: 'Action Challenge Gold Reward',
            result: 'SKIP',
            reason: 'No gold-rewarding actions'
          });
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Action reward test failed: ${error.message}`);
      tests.push({
        test: 'Action Challenge Gold Reward',
        result: 'ERROR',
        error: error.message
      });
    }

    this.economyReport.testResults.goldRewards.tests = tests;
    this.economyReport.testResults.goldRewards.passed = tests.some(t => t.result === 'PASS');
  }

  /**
   * Phase 5: Test Mail Gold Transfers
   */
  async testMailGoldTransfers() {
    console.log('\n📬 Phase 5: Testing Mail Gold Transfers...');

    const tests = [];

    try {
      // Create a second test character to send mail to
      console.log('   Checking for recipient character...');

      const charactersResponse = await this.apiRequest('/characters', 'GET');

      if (charactersResponse && charactersResponse.data) {
        const otherCharacter = charactersResponse.data.find(c => c._id !== this.characterId);

        if (otherCharacter) {
          const goldToSend = 100;
          const currentGold = await this.getGoldBalance();

          if (currentGold >= goldToSend) {
            const beforeGold = currentGold;

            console.log(`   Sending ${goldToSend} gold to ${otherCharacter.name}...`);

            const mailResponse = await this.apiRequest('/mail/send', 'POST', {
              recipientId: otherCharacter._id,
              subject: 'Economy Test Gold',
              body: 'This is a test of gold transfers via mail',
              goldAttachment: goldToSend
            });

            if (mailResponse && mailResponse.success) {
              await this.wait(1000);
              const afterGold = await this.getGoldBalance();
              const goldSpent = beforeGold - afterGold;

              if (goldSpent === goldToSend) {
                console.log(`   ✅ Mail gold transfer deducted exactly ${goldToSend} gold`);
                tests.push({
                  test: 'Mail Gold Transfer Deduction',
                  result: 'PASS',
                  before: beforeGold,
                  after: afterGold,
                  sent: goldToSend
                });

                this.economyReport.transactions.push({
                  type: 'TRANSFER',
                  source: 'MAIL_SENT',
                  amount: -goldSpent,
                  before: beforeGold,
                  after: afterGold,
                  recipient: otherCharacter.name
                });
              } else {
                await this.reportBug('P0', 'Mail Gold Transfer Mismatch',
                  `Gold deducted (${goldSpent}) does not match gold sent (${goldToSend})`,
                  `This could be a gold duplication exploit!`);
                tests.push({
                  test: 'Mail Gold Transfer Deduction',
                  result: 'FAIL',
                  expected: goldToSend,
                  actual: goldSpent
                });

                this.economyReport.exploits.push({
                  type: 'GOLD_DUPLICATION',
                  severity: 'CRITICAL',
                  details: `Mail transfer mismatch: sent ${goldToSend}, deducted ${goldSpent}`
                });
              }
            }
          } else {
            console.log(`   ⚠️ Insufficient gold for mail transfer (have ${currentGold}, need ${goldToSend})`);
            tests.push({
              test: 'Mail Gold Transfer',
              result: 'SKIP',
              reason: 'Insufficient gold'
            });
          }
        } else {
          console.log('   ⚠️ No other character found to test mail transfer');
          tests.push({
            test: 'Mail Gold Transfer',
            result: 'SKIP',
            reason: 'No recipient available'
          });
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Mail transfer test failed: ${error.message}`);
      tests.push({
        test: 'Mail Gold Transfer',
        result: 'ERROR',
        error: error.message
      });
    }

    this.economyReport.testResults.mailTransfers.tests = tests;
    this.economyReport.testResults.mailTransfers.passed = tests.some(t => t.result === 'PASS');
  }

  /**
   * Phase 6: Test Gang Vault Operations
   */
  async testGangVaultOperations() {
    console.log('\n🏦 Phase 6: Testing Gang Vault Operations...');

    const tests = [];

    if (!this.gangId) {
      console.log('   ⚠️ No gang available for vault testing');
      this.economyReport.testResults.gangVault.tests.push({
        test: 'Gang Vault Operations',
        result: 'SKIP',
        reason: 'No gang available'
      });
      return;
    }

    try {
      // Test deposit
      const depositAmount = 500;
      const currentGold = await this.getGoldBalance();

      if (currentGold >= depositAmount) {
        console.log(`   Testing vault deposit of ${depositAmount} gold...`);

        const beforeGold = currentGold;
        const depositResponse = await this.apiRequest(`/gangs/${this.gangId}/bank/deposit`, 'POST', {
          amount: depositAmount
        });

        if (depositResponse && depositResponse.success) {
          await this.wait(1000);
          const afterGold = await this.getGoldBalance();
          const goldSpent = beforeGold - afterGold;

          if (goldSpent === depositAmount) {
            console.log(`   ✅ Vault deposit deducted exactly ${depositAmount} gold`);
            tests.push({
              test: 'Gang Vault Deposit',
              result: 'PASS',
              before: beforeGold,
              after: afterGold,
              deposited: depositAmount
            });

            this.economyReport.transactions.push({
              type: 'TRANSFER',
              source: 'GANG_DEPOSIT',
              amount: -goldSpent,
              before: beforeGold,
              after: afterGold
            });

            // Test withdrawal
            console.log(`   Testing vault withdrawal of ${depositAmount} gold...`);
            const beforeWithdraw = await this.getGoldBalance();

            const withdrawResponse = await this.apiRequest(`/gangs/${this.gangId}/bank/withdraw`, 'POST', {
              amount: depositAmount
            });

            if (withdrawResponse && withdrawResponse.success) {
              await this.wait(1000);
              const afterWithdraw = await this.getGoldBalance();
              const goldReceived = afterWithdraw - beforeWithdraw;

              if (goldReceived === depositAmount) {
                console.log(`   ✅ Vault withdrawal added exactly ${depositAmount} gold`);
                tests.push({
                  test: 'Gang Vault Withdrawal',
                  result: 'PASS',
                  before: beforeWithdraw,
                  after: afterWithdraw,
                  withdrawn: depositAmount
                });

                this.economyReport.transactions.push({
                  type: 'TRANSFER',
                  source: 'GANG_WITHDRAWAL',
                  amount: goldReceived,
                  before: beforeWithdraw,
                  after: afterWithdraw
                });
              } else {
                await this.reportBug('P0', 'Vault Withdrawal Mismatch',
                  `Gold received (${goldReceived}) does not match withdrawal amount (${depositAmount})`,
                  'Potential gold duplication exploit!');
                tests.push({
                  test: 'Gang Vault Withdrawal',
                  result: 'FAIL',
                  expected: depositAmount,
                  actual: goldReceived
                });

                this.economyReport.exploits.push({
                  type: 'VAULT_DUPLICATION',
                  severity: 'CRITICAL',
                  details: `Withdrawal mismatch: requested ${depositAmount}, received ${goldReceived}`
                });
              }
            }
          } else {
            await this.reportBug('P0', 'Vault Deposit Mismatch',
              `Gold deducted (${goldSpent}) does not match deposit amount (${depositAmount})`,
              'Potential gold duplication exploit!');
            tests.push({
              test: 'Gang Vault Deposit',
              result: 'FAIL',
              expected: depositAmount,
              actual: goldSpent
            });
          }
        }
      } else {
        console.log(`   ⚠️ Insufficient gold for vault testing (have ${currentGold}, need ${depositAmount})`);
        tests.push({
          test: 'Gang Vault Operations',
          result: 'SKIP',
          reason: 'Insufficient gold'
        });
      }
    } catch (error) {
      console.log(`   ⚠️ Vault operations test failed: ${error.message}`);
      tests.push({
        test: 'Gang Vault Operations',
        result: 'ERROR',
        error: error.message
      });
    }

    this.economyReport.testResults.gangVault.tests = tests;
    this.economyReport.testResults.gangVault.passed = tests.some(t => t.result === 'PASS');
  }

  /**
   * Phase 7: Test Negative Gold Protection
   */
  async testNegativeGoldProtection() {
    console.log('\n🛡️ Phase 7: Testing Negative Gold Protection...');

    const tests = [];

    try {
      const currentGold = await this.getGoldBalance();

      // Try to spend more gold than we have
      console.log('   Attempting to spend more gold than available...');

      const overSpendAmount = currentGold + 1000;

      // Try to send mail with more gold than we have
      const charactersResponse = await this.apiRequest('/characters', 'GET');

      if (charactersResponse && charactersResponse.data) {
        const otherCharacter = charactersResponse.data.find(c => c._id !== this.characterId);

        if (otherCharacter) {
          const mailResponse = await this.apiRequest('/mail/send', 'POST', {
            recipientId: otherCharacter._id,
            subject: 'Overspend Test',
            body: 'This should fail',
            goldAttachment: overSpendAmount
          });

          if (mailResponse && mailResponse.success) {
            // This should NOT happen
            await this.reportBug('P0', 'CRITICAL: Negative Gold Exploit',
              `Successfully sent ${overSpendAmount} gold when only having ${currentGold}`,
              'IMMEDIATE FIX REQUIRED - Economy breaking exploit!');
            tests.push({
              test: 'Negative Gold Protection',
              result: 'FAIL',
              severity: 'CRITICAL',
              exploit: 'Can spend more gold than owned'
            });

            this.economyReport.exploits.push({
              type: 'NEGATIVE_GOLD_EXPLOIT',
              severity: 'CRITICAL',
              details: `Spent ${overSpendAmount} with only ${currentGold} available`
            });
          } else {
            // Transaction should be rejected
            console.log('   ✅ Negative gold protection working - transaction rejected');
            tests.push({
              test: 'Negative Gold Protection',
              result: 'PASS',
              attempted: overSpendAmount,
              available: currentGold,
              status: 'Correctly rejected'
            });
          }
        }
      }

      // Verify gold is still non-negative after all tests
      const finalGold = await this.getGoldBalance();
      if (finalGold < 0) {
        await this.reportBug('P0', 'CRITICAL: Negative Gold State',
          `Character has negative gold: ${finalGold}`,
          'Economy integrity compromised!');
        tests.push({
          test: 'Final Gold Non-Negative Check',
          result: 'FAIL',
          gold: finalGold
        });

        this.economyReport.exploits.push({
          type: 'NEGATIVE_GOLD_STATE',
          severity: 'CRITICAL',
          value: finalGold
        });
      } else {
        console.log(`   ✅ Gold remains non-negative: ${finalGold}`);
        tests.push({
          test: 'Final Gold Non-Negative Check',
          result: 'PASS',
          gold: finalGold
        });
      }
    } catch (error) {
      console.log(`   ⚠️ Negative gold protection test failed: ${error.message}`);
      tests.push({
        test: 'Negative Gold Protection',
        result: 'ERROR',
        error: error.message
      });
    }

    this.economyReport.testResults.negativeGold.tests = tests;
    this.economyReport.testResults.negativeGold.passed = tests.every(t => t.result === 'PASS');
  }

  /**
   * Phase 8: Test Transaction Rollback
   */
  async testTransactionRollback() {
    console.log('\n🔄 Phase 8: Testing Transaction Rollback...');

    const tests = [];

    try {
      // Get current gold
      const beforeGold = await this.getGoldBalance();
      console.log(`   Current gold before rollback test: ${beforeGold}`);

      // Try to send mail to invalid recipient (should rollback)
      const invalidRecipient = '000000000000000000000000'; // Invalid ObjectId

      const mailResponse = await this.apiRequest('/mail/send', 'POST', {
        recipientId: invalidRecipient,
        subject: 'Rollback Test',
        body: 'This should rollback',
        goldAttachment: 100
      });

      await this.wait(1000);
      const afterGold = await this.getGoldBalance();

      if (beforeGold === afterGold) {
        console.log('   ✅ Transaction rollback working - gold unchanged after failed transaction');
        tests.push({
          test: 'Transaction Rollback on Failure',
          result: 'PASS',
          before: beforeGold,
          after: afterGold,
          note: 'Gold correctly preserved on failed transaction'
        });
      } else {
        await this.reportBug('P0', 'Transaction Rollback Failure',
          `Gold changed from ${beforeGold} to ${afterGold} despite failed transaction`,
          'Gold was deducted but transaction failed - rollback did not work!');
        tests.push({
          test: 'Transaction Rollback on Failure',
          result: 'FAIL',
          before: beforeGold,
          after: afterGold,
          lost: beforeGold - afterGold
        });

        this.economyReport.bugs.push({
          type: 'ROLLBACK_FAILURE',
          severity: 'CRITICAL',
          goldLost: beforeGold - afterGold
        });
      }
    } catch (error) {
      console.log(`   ⚠️ Rollback test failed: ${error.message}`);
      tests.push({
        test: 'Transaction Rollback',
        result: 'ERROR',
        error: error.message
      });
    }

    this.economyReport.testResults.transactionRollback.tests = tests;
    this.economyReport.testResults.transactionRollback.passed = tests.some(t => t.result === 'PASS');
  }

  /**
   * Phase 9: Test Database Persistence
   */
  async testDatabasePersistence() {
    console.log('\n💾 Phase 9: Testing Database Persistence...');

    const tests = [];

    try {
      // Get gold before refresh
      const beforeRefresh = await this.getGoldBalance();
      console.log(`   Gold before page refresh: ${beforeRefresh}`);

      // Refresh the page
      await this.page.reload({ waitUntil: 'networkidle0' });
      await this.wait(3000);

      // Get gold after refresh
      const afterRefresh = await this.getGoldBalance();
      console.log(`   Gold after page refresh: ${afterRefresh}`);

      if (beforeRefresh === afterRefresh) {
        console.log('   ✅ Gold persisted correctly across page refresh');
        tests.push({
          test: 'Gold Persistence (Page Refresh)',
          result: 'PASS',
          before: beforeRefresh,
          after: afterRefresh
        });
      } else {
        await this.reportBug('P1', 'Gold Persistence Issue',
          `Gold changed from ${beforeRefresh} to ${afterRefresh} after page refresh`,
          'Gold not persisting correctly in database');
        tests.push({
          test: 'Gold Persistence (Page Refresh)',
          result: 'FAIL',
          before: beforeRefresh,
          after: afterRefresh,
          difference: afterRefresh - beforeRefresh
        });

        this.economyReport.bugs.push({
          type: 'PERSISTENCE_FAILURE',
          severity: 'HIGH',
          goldDifference: afterRefresh - beforeRefresh
        });
      }
    } catch (error) {
      console.log(`   ⚠️ Persistence test failed: ${error.message}`);
      tests.push({
        test: 'Database Persistence',
        result: 'ERROR',
        error: error.message
      });
    }

    this.economyReport.testResults.persistence.tests = tests;
    this.economyReport.testResults.persistence.passed = tests.some(t => t.result === 'PASS');
  }

  /**
   * Phase 10: Verify Gold History
   */
  async verifyGoldHistory() {
    console.log('\n📜 Verifying Gold Transaction History...');

    try {
      const historyResponse = await this.apiRequest('/gold/history?limit=100', 'GET');

      if (historyResponse && historyResponse.success) {
        const transactions = historyResponse.data.transactions;
        const stats = historyResponse.data.statistics;

        console.log(`   ✅ Retrieved ${transactions.length} transactions`);
        console.log(`   📊 Statistics:
          - Total Earned: ${stats.totalEarned}
          - Total Spent: ${stats.totalSpent}
          - Net Gold: ${stats.netGold}
          - Transaction Count: ${stats.transactionCount}`);

        // Verify transaction integrity
        let calculatedBalance = this.initialGold;
        let errors = 0;

        for (const tx of transactions) {
          if (tx.balanceBefore !== calculatedBalance) {
            errors++;
            console.log(`   ⚠️ Transaction integrity error: Expected balance ${calculatedBalance}, got ${tx.balanceBefore}`);
          }
          calculatedBalance = tx.balanceAfter;
        }

        if (errors === 0) {
          console.log('   ✅ All transactions maintain correct balance chain');
        } else {
          await this.reportBug('P1', 'Transaction History Integrity',
            `Found ${errors} transaction balance mismatches`,
            'Transaction history may be corrupted');
        }

        this.economyReport.finalGold = await this.getGoldBalance();
        this.economyReport.transactionCount = transactions.length;
        this.economyReport.statistics = stats;
      }
    } catch (error) {
      console.log(`   ⚠️ History verification failed: ${error.message}`);
    }
  }

  /**
   * Helper: Get current gold balance from API
   */
  async getGoldBalance() {
    try {
      const response = await this.apiRequest('/gold/balance', 'GET');
      if (response && response.success) {
        return response.data.gold;
      }
      return null;
    } catch (error) {
      console.error('Failed to get gold balance:', error.message);
      return null;
    }
  }

  /**
   * Helper: Make API request
   */
  async apiRequest(endpoint, method = 'GET', body = null) {
    try {
      const url = `${this.config.apiUrl}${endpoint}`;

      // Use page.evaluate to make the request in the browser context
      return await this.page.evaluate(async ({ url, method, body, token }) => {
        const options = {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Include cookies
        };

        // Add token if available
        if (token) {
          options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (body && method !== 'GET') {
          options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        return await response.json();
      }, { url, method, body, token: this.sessionToken });
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error.message);
      return null;
    }
  }

  /**
   * Generate comprehensive economy report
   */
  async generateEconomyReport() {
    console.log('\n📊 Generating Economy Report...');

    const reportPath = `test-automation/reports/agent-5-banker-${Date.now()}.json`;
    const report = {
      agent: this.agentName,
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      summary: {
        initialGold: this.economyReport.initialGold,
        finalGold: this.economyReport.finalGold,
        goldChange: this.economyReport.finalGold - this.economyReport.initialGold,
        transactionCount: this.economyReport.transactions.length,
        bugsFound: this.economyReport.bugs.length,
        exploitsFound: this.economyReport.exploits.length,
        warningsFound: this.economyReport.warnings.length
      },
      testResults: this.economyReport.testResults,
      transactions: this.economyReport.transactions,
      bugs: this.economyReport.bugs,
      exploits: this.economyReport.exploits,
      warnings: this.economyReport.warnings,
      statistics: this.economyReport.statistics,
      errors: this.errors
    };

    await this.saveReport(report, reportPath);

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('💰 ECONOMY TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Initial Gold: ${this.economyReport.initialGold}`);
    console.log(`Final Gold: ${this.economyReport.finalGold}`);
    console.log(`Net Change: ${this.economyReport.finalGold - this.economyReport.initialGold}`);
    console.log(`\nTransactions Tested: ${this.economyReport.transactions.length}`);
    console.log(`\nTest Results:`);

    Object.entries(this.economyReport.testResults).forEach(([category, result]) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const testCount = result.tests.length;
      console.log(`  ${status} ${category} (${testCount} tests)`);
    });

    console.log(`\n⚠️ Bugs Found: ${this.economyReport.bugs.length}`);
    console.log(`🚨 Exploits Found: ${this.economyReport.exploits.length}`);

    if (this.economyReport.exploits.length > 0) {
      console.log('\n🚨 CRITICAL EXPLOITS DETECTED:');
      this.economyReport.exploits.forEach((exploit, i) => {
        console.log(`  ${i + 1}. ${exploit.type} (${exploit.severity})`);
        console.log(`     ${exploit.details || exploit.value}`);
      });
    }

    console.log(`\n📁 Full report saved to: ${reportPath}`);
    console.log('='.repeat(60));

    return report;
  }

  /**
   * Save report to file
   */
  async saveReport(report, filename) {
    const fs = require('fs').promises;
    const path = require('path');

    const filepath = path.join(process.cwd(), filename);
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    console.log(`   ✅ Report saved to: ${filepath}`);
  }
}

// Run the mission if executed directly
if (require.main === module) {
  const agent = new BankerAgent();
  agent.runMission()
    .then(() => {
      console.log('\n✅ Banker mission completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Banker mission failed:', error);
      process.exit(1);
    });
}

module.exports = BankerAgent;
