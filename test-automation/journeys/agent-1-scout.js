/**
 * Agent 1: The Scout
 * Initial reconnaissance and system health check
 *
 * Mission: Map the current game state and identify testing targets
 */

const TestRunner = require('../core/TestRunner');

class ScoutAgent extends TestRunner {
  constructor() {
    super('Agent-1-Scout');
    this.healthReport = {
      frontend: false,
      backend: false,
      database: false,
      authentication: false,
      gameLoad: false
    };
  }

  /**
   * Main reconnaissance mission
   */
  async runMission() {
    console.log('\n🤠 THE SCOUT - Beginning reconnaissance mission...');
    console.log('=' .repeat(60));

    try {
      await this.initialize();

      // Phase 1: Check system health
      await this.checkSystemHealth();

      // Phase 2: Check frontend responsiveness
      await this.checkFrontend();

      // Phase 3: Test authentication endpoints
      await this.checkAuthentication();

      // Phase 4: Verify game systems
      await this.checkGameSystems();

      // Phase 5: Document initial state
      await this.documentState();

      // Generate reconnaissance report
      await this.generateReconReport();

    } catch (error) {
      console.error('❌ Scout mission failed:', error);
      await this.reportBug('P0', 'Scout Mission Failure', error.message, error.stack);
    } finally {
      return await this.cleanup();
    }
  }

  /**
   * Check overall system health
   */
  async checkSystemHealth() {
    console.log('\n🔍 Phase 1: Checking system health...');

    // Navigate to the site first so we can call the API
    await this.goto('/');
    await this.wait(1000);

    // Check backend health endpoint
    try {
      const healthCheck = await this.evaluate(async () => {
        const response = await fetch('/api/health');
        const data = await response.json();
        return {
          status: response.status,
          data
        };
      });

      if (healthCheck && healthCheck.status === 200) {
        this.healthReport.backend = true;
        this.healthReport.database = healthCheck.data?.data?.services?.database?.status === 'connected';
        console.log('✅ Backend: Online');
        console.log(`✅ Database: ${this.healthReport.database ? 'Connected' : 'Disconnected'}`);
      } else {
        await this.reportBug('P0', 'Backend Offline', 'Health check failed');
      }
    } catch (error) {
      await this.reportBug('P0', 'Backend Unreachable', error.message);
    }
  }

  /**
   * Check frontend responsiveness
   */
  async checkFrontend() {
    console.log('\n🔍 Phase 2: Checking frontend...');

    // Try to load the landing page
    const loaded = await this.goto('/');
    if (!loaded) {
      await this.reportBug('P0', 'Frontend Not Loading', 'Cannot access landing page');
      return;
    }

    // Check for React app
    const hasReact = await this.evaluate(() => {
      return !!(window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
    });

    if (hasReact) {
      this.healthReport.frontend = true;
      console.log('✅ Frontend: React app loaded');
    } else {
      console.log('⚠️ Frontend: React not detected');
    }

    // Check for critical UI elements
    const hasTitle = await this.exists('h1');
    const hasButtons = await this.exists('button');

    if (!hasTitle || !hasButtons) {
      await this.reportBug('P1', 'UI Elements Missing', 'Critical UI elements not found on landing page');
    }

    // Take baseline screenshot
    await this.takeScreenshot('landing-page-baseline');
  }

  /**
   * Test authentication system
   */
  async checkAuthentication() {
    console.log('\n🔍 Phase 3: Checking authentication...');

    // Navigate to login
    await this.goto('/login');
    await this.wait(1000);

    // Check login form exists
    const hasEmailInput = await this.exists('input[name="email"]');
    const hasPasswordInput = await this.exists('input[name="password"]');
    const hasLoginButton = await this.exists('button[type="submit"]');

    if (!hasEmailInput || !hasPasswordInput || !hasLoginButton) {
      await this.reportBug('P0', 'Login Form Broken', 'Login form elements missing');
      return;
    }

    // Try test login with Scout's dedicated account
    const loginSuccess = await this.loginAs('scout@test.com', 'ScoutTest123!');

    if (loginSuccess) {
      this.healthReport.authentication = true;
      console.log('✅ Authentication: Working');

      // Check if we reached characters page
      if (this.page.url().includes('/characters')) {
        this.healthReport.gameLoad = true;
        console.log('✅ Character Page: Accessible');
      }
    } else {
      await this.reportBug('P0', 'Authentication Broken', 'Cannot login with test credentials');
    }

    await this.takeScreenshot('post-login-state');
  }

  /**
   * Check game systems availability
   */
  async checkGameSystems() {
    console.log('\n🔍 Phase 4: Checking game systems...');

    // If we're not authenticated, skip this
    if (!this.healthReport.authentication) {
      console.log('⚠️ Skipping game systems check (not authenticated)');
      return;
    }

    // First, check character data to know if character-dependent APIs can be tested
    const characterData = await this.evaluate(async () => {
      try {
        const response = await fetch('/api/characters', {
          credentials: 'include'
        });
        const data = await response.json();
        return {
          success: data.success,
          count: data.data?.characters?.length || 0,
          status: response.status
        };
      } catch {
        return { success: false, count: 0, status: 0 };
      }
    });

    const hasCharacters = characterData.count > 0;

    // Define endpoints - some require a character to exist
    const endpoints = [
      { path: '/api/characters', name: 'Characters', requiresCharacter: false },
      { path: '/api/skills', name: 'Skills', requiresCharacter: true },
      { path: '/api/actions', name: 'Actions', requiresCharacter: false },
      { path: '/api/territories', name: 'Territories', requiresCharacter: false }
    ];

    const apiResults = await this.evaluate(async (endpoints, hasChars) => {
      const results = {};

      for (const endpoint of endpoints) {
        // Skip character-dependent endpoints if no characters exist
        if (endpoint.requiresCharacter && !hasChars) {
          results[endpoint.name] = {
            status: 'N/A',
            ok: true, // Not a failure, just not testable
            skipped: true,
            reason: 'No characters - endpoint requires character'
          };
          continue;
        }

        try {
          const response = await fetch(endpoint.path, {
            credentials: 'include'
          });
          results[endpoint.name] = {
            status: response.status,
            ok: response.ok
          };
        } catch (error) {
          results[endpoint.name] = {
            status: 0,
            error: error.message
          };
        }
      }

      return results;
    }, endpoints, hasCharacters);

    console.log('\n📊 API Endpoint Status:');
    for (const [name, result] of Object.entries(apiResults)) {
      if (result.skipped) {
        console.log(`  ⏭️ ${name}: Skipped (${result.reason})`);
      } else {
        const status = result.ok ? '✅' : '❌';
        console.log(`  ${status} ${name}: ${result.status || 'Failed'}`);

        if (!result.ok && result.status !== 401) {
          await this.reportBug('P1', `${name} API Broken`, `Endpoint returned ${result.status}`);
        }
      }
    }

    console.log(`\n📊 Character Data: ${characterData.count} characters found`);
    if (!hasCharacters) {
      console.log('  ℹ️ Some API tests skipped - create a character to test all endpoints');
    }
  }

  /**
   * Document current state
   */
  async documentState() {
    console.log('\n🔍 Phase 5: Documenting current state...');

    const state = await this.getGameState();

    const stateReport = {
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      authenticated: !!state.auth?.state?.isAuthenticated,
      user: state.auth?.state?.user?.email || null,
      hasCharacters: state.game?.state?.characters?.length > 0,
      localStorage: {
        hasAuth: !!state.auth,
        hasGame: !!state.game
      },
      cookies: state.cookies ? state.cookies.split(';').length : 0
    };

    console.log('\n📋 Current State:');
    console.log(`  URL: ${stateReport.url}`);
    console.log(`  Authenticated: ${stateReport.authenticated ? 'Yes' : 'No'}`);
    console.log(`  User: ${stateReport.user || 'None'}`);
    console.log(`  Cookies: ${stateReport.cookies}`);

    return stateReport;
  }

  /**
   * Generate reconnaissance report
   */
  async generateReconReport() {
    console.log('\n📊 RECONNAISSANCE REPORT');
    console.log('=' .repeat(60));

    const criticalSystems = [
      { name: 'Frontend', status: this.healthReport.frontend },
      { name: 'Backend', status: this.healthReport.backend },
      { name: 'Database', status: this.healthReport.database },
      { name: 'Authentication', status: this.healthReport.authentication },
      { name: 'Game Load', status: this.healthReport.gameLoad }
    ];

    console.log('\n🏥 System Health:');
    criticalSystems.forEach(system => {
      const icon = system.status ? '✅' : '❌';
      console.log(`  ${icon} ${system.name}: ${system.status ? 'Operational' : 'Failed'}`);
    });

    const allSystemsGo = criticalSystems.every(s => s.status);

    if (allSystemsGo) {
      console.log('\n✅ ALL SYSTEMS OPERATIONAL - Ready for full testing');
    } else {
      console.log('\n⚠️ CRITICAL SYSTEMS FAILING - Limited testing possible');

      const failures = criticalSystems.filter(s => !s.status).map(s => s.name);
      await this.reportBug(
        'P0',
        'Critical Systems Offline',
        `The following systems are not operational: ${failures.join(', ')}`,
        'Restart services and check logs'
      );
    }

    console.log('\n📊 Testing Recommendations:');
    if (this.healthReport.authentication && this.healthReport.gameLoad) {
      console.log('  ✅ Full game testing can proceed');
      console.log('  ✅ Character creation and gameplay testing available');
    } else if (this.healthReport.frontend && this.healthReport.backend) {
      console.log('  ⚠️ Limited testing - authentication issues');
      console.log('  ⚠️ Focus on fixing auth before gameplay tests');
    } else {
      console.log('  ❌ Critical failures - fix infrastructure first');
    }

    return {
      healthReport: this.healthReport,
      canProceed: allSystemsGo,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate testing recommendations based on findings
   */
  generateRecommendations() {
    const recommendations = [];

    if (!this.healthReport.backend) {
      recommendations.push({
        priority: 'P0',
        action: 'Start backend server',
        command: 'cd server && npm run dev'
      });
    }

    if (!this.healthReport.database) {
      recommendations.push({
        priority: 'P0',
        action: 'Start MongoDB and Redis',
        command: 'docker-compose -f docker-compose.dev.simple.yml up -d'
      });
    }

    if (!this.healthReport.frontend) {
      recommendations.push({
        priority: 'P0',
        action: 'Start frontend development server',
        command: 'cd client && npm run dev'
      });
    }

    if (!this.healthReport.authentication) {
      recommendations.push({
        priority: 'P1',
        action: 'Fix authentication middleware',
        details: 'Check cookie handling and JWT verification'
      });
    }

    if (this.errors.length > 5) {
      recommendations.push({
        priority: 'P1',
        action: 'Address console errors',
        details: `Found ${this.errors.length} errors that need investigation`
      });
    }

    return recommendations;
  }
}

// Run the scout if executed directly
if (require.main === module) {
  const scout = new ScoutAgent();
  scout.runMission().then(report => {
    console.log('\n🏁 Scout mission complete!');
    const p0Bugs = report.bugsByPriority?.P0 || 0;
    process.exit(p0Bugs > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ScoutAgent;