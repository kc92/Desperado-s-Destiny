# Bot Metrics Dashboard & Analytics System

## Overview

Comprehensive real-time monitoring and analytics dashboard for playtest bots, providing actionable insights into bot performance, human-likeness, security vulnerabilities, and system health.

## Components Created

### 1. MetricsDashboard.ts (966 lines)
**Real-time bot monitoring and metrics aggregation**

**Key Features:**
- Bot status tracking (running, paused, stopped, error)
- Performance metrics (actions/min, success rates, timing)
- Economic metrics (gold earned, spent, efficiency)
- Social metrics (friendships, messages, engagement)
- Exploit detection alerts
- Time series data collection
- Automated snapshot saving
- CSV and JSON export

**Key Metrics Tracked:**
- Actions per minute (overall and per bot)
- Success rate by action type
- Gold earned/spent/balance
- Energy consumption and efficiency
- Social engagement score (0-100)
- Human-likeness score (0-100)
- Error rates and counts
- Break frequency and duration

**Usage Example:**
```typescript
import MetricsDashboard from './analytics/MetricsDashboard';

// Initialize dashboard
const dashboard = new MetricsDashboard('./dashboard-data');

// Register a bot
dashboard.registerBot('bot-1', 'CombatBot Alpha', 'combat');

// Record actions
dashboard.recordAction(
  'bot-1',
  'combat',
  true, // success
  2500, // duration ms
  { goldEarned: 50, energyConsumed: 10 }
);

// Record social interaction
dashboard.recordSocialInteraction('bot-1', 'message', 'bot-2');

// Record exploit found
dashboard.recordExploit(
  'bot-adversarial',
  'CRITICAL',
  'Race Condition',
  'Gold Duplication via Rapid Purchase',
  { /* details */ }
);

// Get snapshot
const snapshot = dashboard.getSnapshot();
console.log(snapshot.aggregatedMetrics);

// Start real-time monitoring
dashboard.startMonitoring(5000); // Update every 5s

// Export data
dashboard.saveSnapshot();
dashboard.exportToCSV();
```

---

### 2. HumanLikenessScoring.ts (726 lines)
**Calculates how human-like bot behavior appears (0-100 score)**

**Scoring Components:**
1. **Timing Variance (30%)** - Analyzes action timing consistency
   - Too consistent (< 0.5s variance) = robotic
   - Moderate variance (0.5s - 5s) = human-like
   - Too erratic (> 5s) = suspicious

2. **Error Rate (25%)** - Evaluates mistake frequency
   - Zero errors = suspicious (too perfect)
   - 2-5% errors = ideal (human-like)
   - > 15% errors = incompetent

3. **Break Patterns (20%)** - Checks rest behavior
   - No breaks = robotic endurance
   - Breaks every 20-100 actions = human
   - Break duration 30s - 10min = realistic

4. **Social Engagement (15%)** - Measures social interaction
   - No social = suspicious
   - 10-25% social actions = human-like
   - Friendship formation = bonus points

5. **Action Variety (10%)** - Detects grinding patterns
   - < 40% unique actions = grinding bot
   - 40-70% variety = human exploration
   - > 70% = very human

**Classifications:**
- **Very Human (80-100):** Indistinguishable from real players
- **Human-like (60-79):** Believable with minor tells
- **Suspicious (40-59):** Detectable patterns, needs improvement
- **Robotic (0-39):** Obvious bot, likely to be flagged

**Usage Example:**
```typescript
import HumanLikenessScorer, { BehaviorData } from './analytics/HumanLikenessScoring';

const scorer = new HumanLikenessScorer();

const behaviorData: BehaviorData = {
  actionTimings: [3200, 2800, 3500, 2900, 3100], // ms between actions
  avgActionDuration: 3000,
  timingStdDev: 800, // Good variance
  totalActions: 150,
  totalErrors: 7, // ~4.7% error rate
  errorRate: 0.047,
  breaksTaken: 3,
  avgBreakDuration: 180000, // 3 minutes
  timeSinceLastBreak: 45, // actions
  messagesSent: 15,
  friendshipsFormed: 2,
  socialInteractions: 20,
  uniqueActions: 12,
  totalActionTypes: 18,
  repetitionRate: 0.35
};

const score = scorer.calculateScore(behaviorData);

console.log(score);
// {
//   overall: 78,
//   breakdown: {
//     timingVariance: 85,
//     errorRate: 90,
//     breakPatterns: 75,
//     socialEngagement: 65,
//     actionVariety: 70
//   },
//   flags: ['Breaks slightly infrequent'],
//   recommendations: ['Take breaks more often'],
//   classification: 'human-like'
// }

// Print detailed report
console.log(scorer.formatReport(score));
```

**Key Insights:**
- Bots scoring < 60 need immediate improvement
- Perfect scores (100) are actually suspicious
- Aim for 70-85 range for best results
- Monitor trends - scores should vary over time

---

### 3. PerformanceMonitor.ts (817 lines)
**Real-time performance tracking and health monitoring**

**Features:**
- **Performance Snapshots:** Memory, CPU, response times, error rates
- **Health Checks:** Automated checks with 0-100 health scores
- **Trend Analysis:** Improving, stable, degrading, critical
- **Auto-Recovery:** Restart, throttle, pause, or kill on issues
- **Alerting:** Performance degradation notifications
- **Percentile Tracking:** P95 and P99 response times

**Performance Thresholds:**
```typescript
Memory:
  Warning: 200 MB
  Critical: 500 MB

CPU:
  Warning: 70%
  Critical: 90%

Error Rate:
  Warning: 10%
  Critical: 25%

Consecutive Errors:
  Warning: 3
  Critical: 5

Response Time:
  Warning: 5000 ms
  Critical: 10000 ms
```

**Usage Example:**
```typescript
import PerformanceMonitor from './analytics/PerformanceMonitor';

const monitor = new PerformanceMonitor('./performance-data');

// Record action timing
monitor.recordActionTiming('bot-1', 2500, true); // duration, success

// Record resource usage
monitor.recordResourceUsage('bot-1', 150, 45); // memory MB, CPU %

// Perform health check
const health = monitor.performHealthCheck('bot-1');
console.log(health);
// {
//   botId: 'bot-1',
//   healthy: true,
//   checks: {
//     responsive: true,
//     lowErrorRate: true,
//     normalMemory: true,
//     normalCpu: true
//   },
//   issues: [],
//   score: 95
// }

// Get performance summary
const summary = monitor.getPerformanceSummary('bot-1');
console.log(summary.trends);
// [
//   {
//     metric: 'avgResponseTime',
//     trend: 'improving',
//     changePercent: -12.5,
//     dataPoints: [...]
//   }
// ]

// Start automated monitoring
monitor.startMonitoring(10000); // Check every 10s

// Generate report
console.log(monitor.generateReport('bot-1'));
```

**Health Score Breakdown:**
- **95-100:** Excellent performance
- **80-94:** Good, minor issues
- **60-79:** Degraded, needs attention
- **< 60:** Critical, immediate action required

---

### 4. ExploitTracker.ts (890 lines)
**Comprehensive security exploit tracking and management**

**Features:**
- **Exploit Recording:** Full details with reproduction steps
- **CVSS Scoring:** Automated vulnerability scoring (0-10)
- **Status Tracking:** new → acknowledged → in-progress → fixed
- **Categorization:** By severity, category, affected components
- **Duplicate Detection:** Link related exploits
- **Reproduction Scripts:** Auto-generate test scripts
- **Export Formats:** JSON, CSV, HTML reports
- **Statistics:** Fix rates, time to fix, severity distribution

**Exploit Severity Levels:**
- **CRITICAL (CVSS 9.0+):** Immediate threat, requires urgent fix
- **HIGH (CVSS 7.0-8.9):** Serious vulnerability, fix ASAP
- **MEDIUM (CVSS 5.0-6.9):** Moderate risk, schedule fix
- **LOW (CVSS 3.0-4.9):** Minor issue, fix when possible

**Usage Example:**
```typescript
import ExploitTracker from './analytics/ExploitTracker';

const tracker = new ExploitTracker('./exploits');

// Record an exploit
const exploit = tracker.recordExploit({
  title: 'Gold Duplication via Race Condition',
  description: 'Rapidly clicking purchase button allows gold duplication',
  severity: 'CRITICAL',
  category: 'Race Condition',
  exploitability: 'easy',
  discoveredBy: 'bot-adversarial',
  affectedEndpoints: ['/api/shop/purchase'],
  affectedComponents: ['Shop Controller', 'Gold Service'],
  reproductionSteps: [
    'Navigate to shop',
    'Find any purchasable item',
    'Click buy button 10 times rapidly',
    'Observe gold balance increases instead of decreasing'
  ],
  actualBehavior: 'Gold increased from 1000 to 1500',
  expectedBehavior: 'Gold should decrease by item cost',
  impact: 'Players can duplicate gold infinitely, breaking economy',
  recommendation: 'Implement server-side transaction locking',
  prerequisites: ['Logged in', 'Access to shop'],
  evidence: {
    screenshots: ['exploit-screenshot-1.png'],
    logs: ['duplicate-transaction-logs.txt']
  },
  tags: ['economy', 'urgent']
});

// Update status
tracker.updateExploitStatus(exploit.id, 'in-progress', {
  fixedBy: 'developer-1'
});

// Filter exploits
const critical = tracker.filterExploits({
  severity: ['CRITICAL'],
  status: ['new', 'acknowledged']
});

// Get statistics
const stats = tracker.getStatistics();
console.log(stats);
// {
//   total: 45,
//   byStatus: { new: 12, acknowledged: 8, 'in-progress': 5, fixed: 18, ... },
//   bySeverity: { CRITICAL: 3, HIGH: 12, MEDIUM: 20, LOW: 10 },
//   avgTimeToFix: 7200000, // 2 hours
//   fixRate: 40 // 40% fixed
// }

// Generate reports
tracker.exportToHTML();
tracker.exportToCSV();
tracker.printSummary();
```

---

### 5. DashboardUI.html (1,095 lines)
**Interactive browser-based visualization dashboard**

**Features:**
- **Real-time Stats:** Total bots, actions/min, success rate, gold, exploits
- **Bot Monitoring:** Status, health, uptime, memory, errors
- **Performance Charts:** Actions/min, success rate trends, human-likeness
- **Exploit List:** Filterable by severity, searchable
- **Alert System:** Categorized warnings and critical alerts
- **Tab Navigation:** Bots, Performance, Exploits, Alerts
- **Filters & Search:** Multiple filter options per section
- **Data Export:** JSON and CSV export functionality
- **Auto-refresh:** Updates every 5 seconds
- **Dark Theme:** Professional dark mode interface

**How to Use:**
1. Open `DashboardUI.html` in a web browser
2. Dashboard loads with sample data automatically
3. Use filters to focus on specific bot types or statuses
4. Click tabs to view different sections
5. Export data using the header buttons
6. Load real data by clicking "Load Snapshot" and selecting a JSON file

**Tab Sections:**
1. **Bots Tab:**
   - View all active bots
   - Filter by type (combat, economy, social, adversarial)
   - Filter by status (running, paused, stopped, error)
   - Health indicators (green/yellow/red dots)
   - Uptime, error count, memory usage

2. **Performance Tab:**
   - Actions per minute chart (last hour)
   - Success rate trend
   - Human-likeness scores by bot
   - Visual bar charts with hover effects

3. **Exploits Tab:**
   - All exploits with severity badges
   - Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)
   - Search by keyword
   - Category and discovery info

4. **Alerts Tab:**
   - Recent alerts by severity
   - Color-coded (critical, error, warning, info)
   - Clear all functionality

**Integration with Backend:**
```typescript
// In your bot orchestrator, save snapshots periodically
import MetricsDashboard from './analytics/MetricsDashboard';

const dashboard = new MetricsDashboard();

// Save snapshot every 5 seconds
setInterval(() => {
  const snapshot = dashboard.getSnapshot();

  // Write to file for dashboard to load
  fs.writeFileSync(
    './dashboard-data/current-snapshot.json',
    JSON.stringify(snapshot, null, 2)
  );
}, 5000);

// Dashboard UI can then load this file via "Load Snapshot"
```

---

## Metrics Tracked

### Bot-Level Metrics
- Total actions performed
- Actions by type (combat, crime, social, etc.)
- Actions per minute
- Success rate (overall and per action type)
- Gold earned, spent, balance, efficiency
- Energy consumed and efficiency
- Friendships formed
- Messages sent/received
- Social engagement score
- Average action duration
- Timing variance
- Error rate and consecutive errors
- Breaks taken and average duration
- Human-likeness score
- Memory usage
- CPU usage

### Aggregated Metrics
- Total bots (all/active)
- Total actions across all bots
- Overall actions per minute
- Average success rate
- Total gold earned/spent
- Total energy consumed
- Total social interactions
- Exploits found (total/by severity)
- Average human-likeness score

### Time Series Metrics
- Actions per minute (historical)
- Success rate over time
- Gold balance trends
- Active bot count
- Error rate trends
- Human-likeness trends
- Social engagement over time
- Exploit discovery rate

---

## Example Insights Dashboard Can Reveal

### 1. Performance Issues
**Insight:** Bot-3 has degrading performance (response time increasing)
```
Trend Analysis:
  Bot-3 avgResponseTime: ↓ +45% (degrading)
  Recommendation: Check for memory leaks or resource contention
```

### 2. Human-Likeness Problems
**Insight:** Bot-5 has robotic behavior (score 35/100)
```
Human-Likeness Report:
  Overall: 35/100 [ROBOTIC]
  Breakdown:
    Timing Variance: 20/100 (too consistent)
    Error Rate: 30/100 (zero errors - too perfect)
    Break Patterns: 25/100 (no breaks taken)

  Flags:
    - Timing too consistent (robotic)
    - Zero error rate (too perfect)
    - No breaks taken (robotic endurance)

  Recommendations:
    CRITICAL: Increase timing variance
    CRITICAL: Add mistakes - zero errors is suspicious
    IMPORTANT: Implement realistic break patterns
```

### 3. Economic Exploits
**Insight:** AdversarialBot found 3 critical gold duplication bugs
```
Exploit Summary:
  CRITICAL: 3 active exploits
    - Gold Duplication via Rapid Purchase (Race Condition)
    - Negative Gold Bypass (Input Validation)
    - Item Sell Overflow (Boundary Values)

  Impact: Economy can be completely broken
  Action Required: Immediate fix needed
```

### 4. Bot Health Issues
**Insight:** Bot-7 is in critical health state
```
Health Check:
  Score: 25/100 (CRITICAL)
  Issues:
    - High memory usage: 520 MB (critical threshold: 500 MB)
    - High error rate: 28% (critical threshold: 25%)
    - 12 consecutive errors
    - Slow response time: 11,500 ms

  Auto-Recovery: Attempting restart
```

### 5. Social Engagement Patterns
**Insight:** Social bots are underperforming
```
Social Metrics:
  SocialBot-1: 45 messages, 2 friendships (good)
  SocialBot-2: 12 messages, 0 friendships (low engagement)
  SocialBot-3: 3 messages, 0 friendships (critical low)

  Recommendation: Review social decision-making algorithms
```

### 6. Action Distribution
**Insight:** Bots are grinding the same action repetitively
```
Action Variety Analysis:
  Bot-4:
    Combat: 85% of actions
    Social: 5%
    Economy: 10%
    Variety Score: 35/100 (highly repetitive)

  Flag: Grinding pattern detected
  Recommendation: Increase action variety to appear more human
```

### 7. Success Rate Anomalies
**Insight:** Success rate suddenly dropped
```
Success Rate Trend:
  1 hour ago: 87%
  30 min ago: 85%
  Now: 62%
  Trend: ↓ -25% (CRITICAL)

  Possible causes:
    - Server-side changes
    - Increased difficulty
    - Bot logic issues
    - Network problems
```

### 8. Break Pattern Analysis
**Insight:** Bots need better break patterns
```
Break Analysis:
  Bot-1: No breaks in 150 actions (robotic)
  Bot-2: Breaks every 12 actions (too frequent)
  Bot-3: Breaks every 65 actions, 3 min duration (ideal)

  Recommendation:
    - Bot-1: Implement break system
    - Bot-2: Increase time between breaks
    - Bot-3: Maintain current pattern (human-like)
```

---

## Integration Example

```typescript
/**
 * Complete integration example showing all components working together
 */
import MetricsDashboard from './analytics/MetricsDashboard';
import HumanLikenessScorer from './analytics/HumanLikenessScoring';
import PerformanceMonitor from './analytics/PerformanceMonitor';
import ExploitTracker from './analytics/ExploitTracker';

// Initialize all systems
const dashboard = new MetricsDashboard('./dashboard-data');
const scorer = new HumanLikenessScorer();
const monitor = new PerformanceMonitor('./performance-data');
const exploits = new ExploitTracker('./exploits');

// Register bots
const botIds = ['combat-1', 'economy-1', 'social-1', 'adversarial-1'];
botIds.forEach(id => {
  const type = id.split('-')[0] as any;
  dashboard.registerBot(id, `${type.toUpperCase()} Bot`, type);
});

// Start monitoring
dashboard.startMonitoring(5000);
monitor.startMonitoring(10000);

// Bot performs action
function recordBotAction(botId: string, actionType: string, success: boolean) {
  const startTime = Date.now();

  // ... bot performs action ...

  const duration = Date.now() - startTime;

  // Record in all systems
  dashboard.recordAction(botId, actionType, success, duration, {
    goldEarned: success ? 50 : 0,
    energyConsumed: 10
  });

  monitor.recordActionTiming(botId, duration, success);

  // Calculate human-likeness every 50 actions
  const metrics = dashboard.getBotMetrics(botId);
  if (metrics && metrics.totalActions % 50 === 0) {
    const behaviorData = {
      actionTimings: [], // populate from metrics
      avgActionDuration: metrics.avgActionDuration,
      timingStdDev: metrics.timingVariance,
      totalActions: metrics.totalActions,
      totalErrors: metrics.errorRate * metrics.totalActions,
      errorRate: metrics.errorRate,
      breaksTaken: metrics.breaksTaken,
      avgBreakDuration: metrics.avgBreakDuration,
      timeSinceLastBreak: 0, // track separately
      messagesSent: metrics.messagesSent,
      friendshipsFormed: metrics.friendshipsFormed,
      socialInteractions: metrics.messagesSent + metrics.friendshipsFormed,
      uniqueActions: Object.keys(metrics.actionsByType).length,
      totalActionTypes: 15, // your game's total
      repetitionRate: 0.4 // calculate from action distribution
    };

    const score = scorer.calculateScore(behaviorData);
    dashboard.updateHumanLikenessScore(botId, score.overall);

    if (score.overall < 60) {
      console.log(`[WARNING] ${botId} human-likeness too low!`);
      console.log(scorer.formatReport(score));
    }
  }
}

// Adversarial bot finds exploit
function recordExploit(botId: string, exploitData: any) {
  const exploit = exploits.recordExploit(exploitData);

  dashboard.recordExploit(
    botId,
    exploit.severity,
    exploit.category,
    exploit.title,
    exploitData
  );

  if (exploit.severity === 'CRITICAL') {
    console.error(`[CRITICAL EXPLOIT] ${exploit.title}`);
    console.log(exploits.generateDetailedReport(exploit.id));
  }
}

// Periodic reporting
setInterval(() => {
  // Save dashboard snapshot
  dashboard.saveSnapshot();

  // Print summary
  dashboard.printSummary();

  // Check for critical exploits
  const critical = exploits.getCriticalExploits();
  if (critical.length > 0) {
    console.error(`\n⚠️  ${critical.length} CRITICAL EXPLOITS NEED ATTENTION!`);
    exploits.printSummary();
  }

  // Export reports
  dashboard.exportToCSV();
  exploits.exportToHTML();
}, 60000); // Every minute
```

---

## File Structure

```
client/tests/playtests/analytics/
├── MetricsDashboard.ts          (966 lines)
├── HumanLikenessScoring.ts      (726 lines)
├── PerformanceMonitor.ts        (817 lines)
├── ExploitTracker.ts            (890 lines)
├── DashboardUI.html             (1,095 lines)
└── README.md                     (this file)

Total: 4,494 lines of production code
```

---

## How to Launch Dashboard

### Option 1: Static File (Simplest)
1. Open `DashboardUI.html` directly in your browser
2. Uses sample data automatically
3. Click "Load Snapshot" to load real data from JSON files

### Option 2: File Watching (Recommended)
1. Have your bots save snapshots periodically:
   ```typescript
   setInterval(() => {
     dashboard.saveSnapshot(); // Saves to dashboard-data/
   }, 5000);
   ```

2. Modify `DashboardUI.html` to watch the snapshot file:
   ```javascript
   async function loadLatestSnapshot() {
     const response = await fetch('./dashboard-data/current-snapshot.json');
     dashboardData = await response.json();
     updateDashboard();
   }

   setInterval(loadLatestSnapshot, 5000);
   ```

3. Serve with a local HTTP server:
   ```bash
   cd client/tests/playtests/analytics
   npx http-server -p 8080
   ```

4. Open http://localhost:8080/DashboardUI.html

### Option 3: WebSocket (Advanced)
For true real-time updates, implement a WebSocket server that pushes updates to the dashboard as they occur.

---

## Key Insights Dashboard Provides

1. **Bot Performance:** Which bots are performing best/worst
2. **Human Detection Risk:** Bots that appear too robotic
3. **Security Vulnerabilities:** Critical exploits requiring fixes
4. **Resource Issues:** Memory leaks, CPU spikes, crashes
5. **Economic Balance:** Gold flow, resource consumption
6. **Social Dynamics:** Friendship formation, message patterns
7. **Success Optimization:** Which actions succeed most
8. **Break Patterns:** Whether bots rest realistically
9. **Error Analysis:** What types of errors occur most
10. **Trend Detection:** Performance improving or degrading over time

---

## Next Steps

### For Development:
1. Integrate analytics into your bot orchestrator
2. Configure alerting thresholds for your game
3. Set up automated reporting (daily summaries)
4. Implement auto-recovery actions
5. Create custom visualizations for game-specific metrics

### For Testing:
1. Run bots with analytics enabled
2. Monitor human-likeness scores
3. Review exploit reports daily
4. Tune bot behavior based on insights
5. Verify fixes don't break existing bots

### For Production:
1. Set up monitoring alerts (Slack, email, etc.)
2. Create automated health checks
3. Implement dashboards for different roles (QA, dev, management)
4. Archive historical data for trend analysis
5. Use insights to continuously improve bot intelligence

---

## Support & Documentation

For detailed API documentation, see the TypeScript interfaces and JSDoc comments in each file. All functions include usage examples and clear parameter descriptions.

For questions or issues, refer to the inline code comments or consult the integration example above.

---

**Created by Agent 15: Metrics Dashboard Specialist**
*Part of the Desperados Destiny Playtest Bot System*
