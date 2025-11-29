/**
 * Master Orchestrator - The Posse Leader
 * Runs all testing agents sequentially and generates comprehensive report
 */

const fs = require('fs').promises;
const path = require('path');

// Import all agents
const ScoutAgent = require('./journeys/agent-1-scout');
const PioneerAgent = require('./journeys/agent-2-pioneer');

class TestPosse {
  constructor() {
    this.agents = [
      { name: 'Scout', class: ScoutAgent, critical: true },
      { name: 'Pioneer', class: PioneerAgent, critical: false }
      // More agents will be added here as they're created:
      // { name: 'Gunslinger', class: GunslingerAgent, critical: false },
      // { name: 'Outlaw', class: OutlawAgent, critical: false },
      // { name: 'Marshal', class: MarshalAgent, critical: false },
      // { name: 'Sheriff', class: SheriffAgent, critical: false },
      // { name: 'Doctor', class: DoctorAgent, critical: false }
    ];

    this.results = [];
    this.startTime = null;
    this.endTime = null;
    this.continueOnFailure = true;
  }

  /**
   * Run all agents in sequence
   */
  async runAllAgents() {
    console.log('\n' + '='.repeat(80));
    console.log('🤠 DESPERADOS DESTINY - AUTONOMOUS TESTING POSSE');
    console.log('='.repeat(80));
    console.log(`Starting automated testing at ${new Date().toLocaleString()}`);
    console.log(`Agents to deploy: ${this.agents.map(a => a.name).join(', ')}`);
    console.log('='.repeat(80) + '\n');

    this.startTime = Date.now();

    for (const agentConfig of this.agents) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`DEPLOYING AGENT: ${agentConfig.name.toUpperCase()}`);
      console.log('='.repeat(80));

      try {
        const agent = new agentConfig.class();
        const report = await agent.runMission();

        this.results.push({
          agent: agentConfig.name,
          success: true,
          report,
          critical: agentConfig.critical
        });

        // Check for critical failures
        const reportBugs = (report && report.details && report.details.bugs) ? report.details.bugs : [];
        const p0Bugs = reportBugs.filter(b => b.severity === 'P0').length;

        if (p0Bugs > 0 && agentConfig.critical) {
          console.log(`\n❌ CRITICAL: ${agentConfig.name} found ${p0Bugs} P0 bugs!`);

          if (!this.continueOnFailure) {
            console.log('Stopping test suite due to critical failure.');
            break;
          } else {
            console.log('Continuing despite critical failure (continueOnFailure = true)');
          }
        } else if (p0Bugs > 0) {
          console.log(`\n⚠️ WARNING: ${agentConfig.name} found ${p0Bugs} P0 bugs`);
        } else {
          console.log(`\n✅ SUCCESS: ${agentConfig.name} completed successfully`);
        }

      } catch (error) {
        console.error(`\n❌ FATAL: ${agentConfig.name} agent crashed!`);
        console.error(error);

        this.results.push({
          agent: agentConfig.name,
          success: false,
          error: error.message,
          critical: agentConfig.critical
        });

        if (agentConfig.critical && !this.continueOnFailure) {
          console.log('Stopping test suite due to critical agent failure.');
          break;
        }
      }

      // Longer pause between agents to avoid rate limiting
      await this.wait(30000);
    }

    this.endTime = Date.now();
    await this.generateFinalReport();
  }

  /**
   * Generate comprehensive final report
   */
  async generateFinalReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL TEST POSSE REPORT');
    console.log('='.repeat(80));

    const duration = Math.round((this.endTime - this.startTime) / 1000);
    const successfulAgents = this.results.filter(r => r.success).length;
    const failedAgents = this.results.filter(r => !r.success).length;

    // Aggregate all bugs
    const allBugs = [];
    const allErrors = [];
    const allScreenshots = [];

    this.results.forEach(result => {
      if (result.success && result.report) {
        if (result.report.details?.bugs && Array.isArray(result.report.details.bugs)) {
          allBugs.push(...result.report.details.bugs);
        }
        if (result.report.details?.errors && Array.isArray(result.report.details.errors)) {
          allErrors.push(...result.report.details.errors);
        }
        if (result.report.details?.screenshots && Array.isArray(result.report.details.screenshots)) {
          allScreenshots.push(...result.report.details.screenshots);
        }
      }
    });

    // Count bugs by severity
    const bugsBySeverity = {
      P0: allBugs.filter(b => b.severity === 'P0').length,
      P1: allBugs.filter(b => b.severity === 'P1').length,
      P2: allBugs.filter(b => b.severity === 'P2').length,
      P3: allBugs.filter(b => b.severity === 'P3').length
    };

    // Print summary
    console.log('\n📈 EXECUTION SUMMARY:');
    console.log(`  Total Duration: ${duration} seconds`);
    console.log(`  Agents Run: ${this.results.length}/${this.agents.length}`);
    console.log(`  Successful: ${successfulAgents}`);
    console.log(`  Failed: ${failedAgents}`);

    console.log('\n🐛 BUGS DISCOVERED:');
    console.log(`  P0 (Blocker): ${bugsBySeverity.P0}`);
    console.log(`  P1 (Critical): ${bugsBySeverity.P1}`);
    console.log(`  P2 (Important): ${bugsBySeverity.P2}`);
    console.log(`  P3 (Minor): ${bugsBySeverity.P3}`);
    console.log(`  Total: ${allBugs.length}`);

    console.log('\n❌ ERRORS LOGGED: ' + allErrors.length);
    console.log('📸 SCREENSHOTS TAKEN: ' + allScreenshots.length);

    // Agent-by-agent breakdown
    console.log('\n📋 AGENT REPORTS:');
    this.results.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      const bugCount = result.report?.bugs?.length || 0;
      const errorCount = result.report?.errors || 0;

      console.log(`  ${icon} ${result.agent}:`);
      if (result.success) {
        console.log(`     Bugs: ${bugCount}, Errors: ${errorCount}`);
      } else {
        console.log(`     Failed: ${result.error}`);
      }
    });

    // Critical bugs detail
    const criticalBugs = allBugs.filter(b => b.severity === 'P0' || b.severity === 'P1');
    if (criticalBugs.length > 0) {
      console.log('\n🚨 CRITICAL BUGS REQUIRING IMMEDIATE ATTENTION:');
      criticalBugs.forEach((bug, i) => {
        console.log(`\n  ${i + 1}. [${bug.severity}] ${bug.title}`);
        console.log(`     ${bug.description}`);
        if (bug.reproduction) {
          console.log(`     Reproduction: ${bug.reproduction}`);
        }
        console.log(`     Found by: ${bug.agent}`);
        console.log(`     URL: ${bug.url}`);
      });
    }

    // Save comprehensive report
    const finalReport = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      summary: {
        agentsRun: this.results.length,
        successful: successfulAgents,
        failed: failedAgents,
        totalBugs: allBugs.length,
        totalErrors: allErrors.length,
        totalScreenshots: allScreenshots.length
      },
      bugsBySeverity,
      agentResults: this.results.map(r => ({
        agent: r.agent,
        success: r.success,
        bugs: r.report?.bugs || 0,
        errors: r.report?.errors || 0,
        critical: r.critical,
        error: r.error
      })),
      criticalBugs,
      allBugs,
      recommendations: this.generateRecommendations(allBugs)
    };

    // Save to file
    const reportPath = path.join(
      __dirname,
      'reports',
      `POSSE-REPORT-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );

    try {
      await fs.writeFile(reportPath, JSON.stringify(finalReport, null, 2));
      console.log(`\n📁 Full report saved to: ${reportPath}`);
    } catch (error) {
      console.error('Failed to save report:', error.message);
    }

    // Final verdict
    console.log('\n' + '='.repeat(80));
    if (bugsBySeverity.P0 > 0) {
      console.log('🚫 VERDICT: GAME IS NOT READY - P0 BLOCKERS FOUND');
    } else if (bugsBySeverity.P1 > 5) {
      console.log('⚠️ VERDICT: MAJOR ISSUES - TOO MANY CRITICAL BUGS');
    } else if (allBugs.length > 20) {
      console.log('⚠️ VERDICT: NEEDS POLISH - HIGH BUG COUNT');
    } else {
      console.log('✅ VERDICT: GAME IS STABLE - READY FOR TESTING');
    }
    console.log('='.repeat(80) + '\n');

    return finalReport;
  }

  /**
   * Generate recommendations based on findings
   */
  generateRecommendations(bugs) {
    const recommendations = [];

    const p0Count = bugs.filter(b => b.severity === 'P0').length;
    const p1Count = bugs.filter(b => b.severity === 'P1').length;

    if (p0Count > 0) {
      recommendations.push({
        priority: 'IMMEDIATE',
        action: 'Fix all P0 blockers before any other work',
        details: `Found ${p0Count} game-breaking bugs that prevent basic functionality`
      });
    }

    if (p1Count > 3) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Address critical bugs in next sprint',
        details: `${p1Count} critical bugs affecting major features`
      });
    }

    // Check for patterns
    const authBugs = bugs.filter(b =>
      b.title.toLowerCase().includes('auth') ||
      b.title.toLowerCase().includes('login')
    );

    if (authBugs.length > 2) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Review authentication system',
        details: 'Multiple auth-related issues detected'
      });
    }

    const uiBugs = bugs.filter(b =>
      b.title.toLowerCase().includes('ui') ||
      b.title.toLowerCase().includes('button') ||
      b.title.toLowerCase().includes('form')
    );

    if (uiBugs.length > 3) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'UI/UX review and fixes needed',
        details: 'Multiple interface issues affecting user experience'
      });
    }

    if (recommendations.length === 0 && bugs.length < 5) {
      recommendations.push({
        priority: 'LOW',
        action: 'Continue regular development',
        details: 'System is relatively stable with only minor issues'
      });
    }

    return recommendations;
  }

  /**
   * Helper: Wait for specified milliseconds
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the posse if executed directly
if (require.main === module) {
  const posse = new TestPosse();

  // Parse command line arguments
  const args = process.argv.slice(2);
  if (args.includes('--stop-on-failure')) {
    posse.continueOnFailure = false;
  }

  posse.runAllAgents().then(report => {
    const exitCode = (report && report.bugsBySeverity && report.bugsBySeverity.P0 > 0) ? 1 : 0;
    process.exit(exitCode);
  }).catch(error => {
    console.error('Fatal error running test posse:', error);
    process.exit(1);
  });
}

module.exports = TestPosse;