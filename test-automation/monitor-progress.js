/**
 * Progress Monitor
 * Real-time monitoring of the continuous development system
 */

const fs = require('fs').promises;
const path = require('path');

class ProgressMonitor {
  constructor() {
    this.lastUpdate = null;
    this.sessionFile = null;
  }

  async findLatestSession() {
    const reportsDir = path.join(__dirname, 'reports');
    const files = await fs.readdir(reportsDir);
    const sessionFiles = files.filter(f => f.startsWith('continuous-session-'));

    if (sessionFiles.length === 0) {
      return null;
    }

    // Sort by modification time
    const filesWithStats = await Promise.all(
      sessionFiles.map(async (file) => {
        const filePath = path.join(reportsDir, file);
        const stats = await fs.stat(filePath);
        return { file, mtime: stats.mtime };
      })
    );

    filesWithStats.sort((a, b) => b.mtime - a.mtime);
    return path.join(reportsDir, filesWithStats[0].file);
  }

  async displayProgress() {
    console.clear();
    console.log('🎯 DESPERADOS DESTINY - CONTINUOUS DEVELOPMENT MONITOR');
    console.log('=' .repeat(80));
    console.log(`Monitoring started: ${new Date().toISOString()}`);
    console.log('Press Ctrl+C to stop monitoring');
    console.log('=' .repeat(80));

    const sessionFile = await this.findLatestSession();

    if (!sessionFile) {
      console.log('\n⏳ Waiting for session to start...');
      return;
    }

    try {
      const data = await fs.readFile(sessionFile, 'utf8');
      const session = JSON.parse(data);

      if (session.length === 0) {
        console.log('\n⏳ Session started, waiting for first cycle...');
        return;
      }

      const latest = session[session.length - 1];

      // Display current cycle info
      if (latest.cycle) {
        console.log(`\n📊 CURRENT CYCLE: ${latest.cycle}`);
        console.log(`   Phase: ${latest.phase}`);
        console.log(`   Timestamp: ${latest.timestamp}`);
        console.log(`   Duration: ${latest.duration}`);

        if (latest.sessionStats) {
          console.log(`\n📈 SESSION STATISTICS:`);
          console.log(`   Total Cycles: ${latest.sessionStats.totalCycles}`);
          console.log(`   Total Bugs Found: ${latest.sessionStats.totalBugsFound}`);
          console.log(`   Total Bugs Fixed: ${latest.sessionStats.totalBugsFixed}`);
          console.log(`   Fix Rate: ${latest.sessionStats.totalBugsFound > 0 ? ((latest.sessionStats.totalBugsFixed / latest.sessionStats.totalBugsFound) * 100).toFixed(1) : 0}%`);
          console.log(`   Session Duration: ${latest.sessionStats.sessionDuration}`);
        }

        if (latest.bugsFound > 0) {
          console.log(`\n🐛 BUGS IN THIS CYCLE: ${latest.bugsFound}`);
          console.log(`   Fixed: ${latest.bugsFixed}`);
        }

        if (latest.agents && latest.agents.length > 0) {
          console.log(`\n🤖 AGENTS RUN THIS CYCLE:`);
          latest.agents.forEach(agent => {
            const status = agent.success ? '✅' : '❌';
            console.log(`   ${status} ${agent.agent}`);
            if (agent.report) {
              console.log(`      Bugs: ${agent.report.bugs || 0}, Errors: ${agent.report.errors || 0}`);
            }
          });
        }
      }

      // Show recent events
      const recentEvents = session.slice(-5).filter(e => e.type);
      if (recentEvents.length > 0) {
        console.log(`\n📝 RECENT EVENTS:`);
        recentEvents.forEach(event => {
          const icon = event.type === 'error' ? '❌' : '📝';
          console.log(`   ${icon} [${event.type}] ${event.title}`);
          if (event.description) {
            console.log(`      ${event.description.substring(0, 60)}...`);
          }
        });
      }

    } catch (error) {
      console.log(`\n⚠️  Error reading session file: ${error.message}`);
    }

    console.log('\n' + '=' .repeat(80));
    console.log('Refreshing every 5 seconds...');
  }

  async start() {
    // Update every 5 seconds
    setInterval(async () => {
      try {
        await this.displayProgress();
      } catch (error) {
        console.error('Monitor error:', error);
      }
    }, 5000);

    // Initial display
    await this.displayProgress();
  }
}

// Run
const monitor = new ProgressMonitor();
monitor.start().catch(console.error);
