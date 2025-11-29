# AdversarialBot Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      AdversarialBot System                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │         AdversarialBot Class            │
        │         (extends BotBase)               │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │      15 Test Suite Methods              │
        ├─────────────────────────────────────────┤
        │ • testRaceConditions()                  │
        │ • testNegativeValues()                  │
        │ • testBoundaryValues()                  │
        │ • testInputValidation()                 │
        │ • testStateManipulation()               │
        │ • testAuthenticationExploits()          │
        │ • testRateLimiting()                    │
        │ • testConcurrentSessions()              │
        │ • testEnergyExploits()                  │
        │ • testGoldExploits()                    │
        │ • testInventoryExploits()               │
        │ • testCombatExploits()                  │
        │ • testGangExploits()                    │
        │ • testAPIEndpointFuzzing()              │
        │ • testClientSideValidationBypass()      │
        └─────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
        ┌───────────┐  ┌──────────┐  ┌──────────────┐
        │  Exploit  │  │  Logger  │  │   Metrics    │
        │ Reporter  │  │  System  │  │   Tracker    │
        └───────────┘  └──────────┘  └──────────────┘
                │             │             │
                ▼             ▼             ▼
        ┌───────────┐  ┌──────────┐  ┌──────────────┐
        │   JSON    │  │   Log    │  │    JSON      │
        │  Reports  │  │  Files   │  │   Metrics    │
        └───────────┘  └──────────┘  └──────────────┘
```

---

## Class Hierarchy

```
┌─────────────────┐
│    BotBase      │  ← Base class from utils/BotBase.ts
│   (Abstract)    │
└────────┬────────┘
         │ extends
         ▼
┌─────────────────┐
│ AdversarialBot  │  ← Chaos Agent implementation
│   (Concrete)    │
└─────────────────┘
```

### Inherited from BotBase

```typescript
+ initialize()           // Browser setup
+ login()               // Authentication
+ selectCharacter()     // Character selection
+ navigateTo()          // Page navigation
+ getGold()             // Read gold amount
+ getEnergy()           // Read energy amount
+ screenshot()          // Capture screenshots
+ waitRandom()          // Human-like delays
+ cleanup()             // Resource cleanup
```

### AdversarialBot Specific

```typescript
+ runBehaviorLoop()                 // Main test execution
+ reportExploit()                   // Log exploit findings
+ generateExploitReport()           // Final report generation
+ 15x testXYZ() methods             // Individual test suites
```

---

## Data Flow

```
                Start
                  │
                  ▼
         ┌────────────────┐
         │  Initialize    │
         │  Browser &     │
         │  Page          │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │  Login &       │
         │  Select        │
         │  Character     │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │  Setup Request │
         │  Interception  │
         └────────┬───────┘
                  │
                  ▼
    ┌─────────────────────────┐
    │   Run Test Suites       │
    │   (Loop through all 15) │
    └─────────┬───────────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Execute Test       │
    │  • Try exploit      │
    │  • Observe result   │
    │  • Detect anomaly   │
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Exploit Found?     │
    └─────────┬───────────┘
              │
        ┌─────┴─────┐
        │           │
       Yes          No
        │           │
        ▼           ▼
    ┌────────┐  ┌────────┐
    │ Report │  │Continue│
    │Exploit │  │Testing │
    └───┬────┘  └────┬───┘
        │            │
        │            │
        └──────┬─────┘
               │
               ▼
    ┌──────────────────────┐
    │  More Tests?         │
    └──────────┬───────────┘
               │
         ┌─────┴─────┐
         │           │
        Yes          No
         │           │
         │           ▼
         │   ┌───────────────┐
         │   │  Generate     │
         │   │  Final Report │
         │   └───────┬───────┘
         │           │
         │           ▼
         │   ┌───────────────┐
         │   │  Cleanup &    │
         │   │  Exit         │
         │   └───────────────┘
         │
         └──► Back to Execute Test
```

---

## Exploit Detection Pipeline

```
┌──────────────────┐
│  Attempt Action  │  ← Click button, send request, etc.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Observe Result  │  ← Check gold, energy, state
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Compare to      │  ← Is it what we expected?
│  Expected        │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
Matches   Anomaly!
Expected   Detected
    │         │
    ▼         ▼
┌────────┐ ┌────────────────┐
│  OK    │ │  Exploit Found │
│Continue│ └───────┬────────┘
└────────┘         │
                   ▼
         ┌─────────────────┐
         │  Capture        │
         │  Evidence       │
         │  • Screenshot   │
         │  • Logs         │
         │  • Network data │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Create Exploit │
         │  Report with    │
         │  • Severity     │
         │  • Steps        │
         │  • Impact       │
         │  • Fix advice   │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Save to        │
         │  Reports List   │
         └─────────────────┘
```

---

## Request Interception System

```
┌─────────────────────────────────────────┐
│          Browser Page                   │
└──────────────┬──────────────────────────┘
               │
               │ HTTP Request
               ▼
┌─────────────────────────────────────────┐
│    Request Interceptor (Puppeteer)      │
├─────────────────────────────────────────┤
│  1. Log request details                 │
│     • URL                               │
│     • Method (GET/POST/etc)             │
│     • Headers                           │
│     • Body data                         │
│     • Timestamp                         │
│                                         │
│  2. Store in requestLog array           │
│                                         │
│  3. Allow request to continue           │
└──────────────┬──────────────────────────┘
               │
               │ Forwards request
               ▼
┌─────────────────────────────────────────┐
│          Server                         │
└──────────────┬──────────────────────────┘
               │
               │ HTTP Response
               ▼
┌─────────────────────────────────────────┐
│    Response Interceptor (Puppeteer)     │
├─────────────────────────────────────────┤
│  1. Check status code                   │
│     • 200-299: OK                       │
│     • 400-499: Client error             │
│     • 500-599: Server error (LOG!)      │
│                                         │
│  2. Log anomalies                       │
│     • Unexpected status codes           │
│     • Error responses                   │
│                                         │
│  3. Return to page                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          Browser Page                   │
│       (receives response)               │
└─────────────────────────────────────────┘
```

---

## File Structure

```
client/tests/playtests/advanced/
│
├── AdversarialBot.ts                 ← Main implementation (1,267 lines)
│   ├── Class definition
│   ├── 15 test suite methods
│   ├── Exploit reporting system
│   └── Report generation
│
├── runAdversarialBot.ts              ← Runner script (44 lines)
│   ├── Bot configuration
│   ├── Execution logic
│   └── Error handling
│
├── ExploitTesting.example.ts         ← Examples (236 lines)
│   ├── 4 usage examples
│   ├── Report analysis
│   └── Continuous testing
│
├── README.md                         ← Full documentation (328 lines)
│   ├── Feature overview
│   ├── Usage instructions
│   ├── Configuration guide
│   └── Troubleshooting
│
├── QUICK_START.md                    ← Quick reference (473 lines)
│   ├── 5-minute setup
│   ├── Common commands
│   └── Quick troubleshooting
│
└── ARCHITECTURE.md                   ← This file
    ├── System diagrams
    ├── Data flow
    └── Component details
```

---

## Output File Structure

```
tests/playtests/
│
├── reports/
│   └── adversarial-bot-report-TIMESTAMP.json
│       ├── metadata (botName, timestamp, counts)
│       ├── summary (severity breakdown)
│       └── exploits[] (detailed findings)
│
├── logs/
│   ├── ChaosAgent-TIMESTAMP.log          (All execution logs)
│   └── ChaosAgent-EXPLOITS-TIMESTAMP.log (Only exploits)
│
├── data/
│   ├── ChaosAgent-metrics-TIMESTAMP.json
│   └── ChaosAgent-metrics-TIMESTAMP-summary.json
│
└── screenshots/
    ├── ChaosAgent-exploit-EXPLOIT-ID.png
    └── ChaosAgent-adversarial-bot-final.png
```

---

## Test Suite Organization

```
runBehaviorLoop()
│
├── testRaceConditions()
│   ├── Rapid purchase clicks
│   ├── Duplicate action submissions
│   └── Check for gold duplication
│
├── testNegativeValues()
│   ├── Set input to -9999
│   ├── Submit negative values
│   └── Check if accepted
│
├── testBoundaryValues()
│   ├── MAX_INT (2,147,483,647)
│   ├── Very large numbers
│   ├── Zero values
│   └── String length limits
│
├── testInputValidation()
│   ├── XSS payloads
│   ├── SQL injection
│   ├── Path traversal
│   └── Template injection
│
├── testStateManipulation()
│   ├── LocalStorage tampering
│   ├── Disable button bypass
│   └── Client-side modification
│
├── testAuthenticationExploits()
│   ├── Token manipulation
│   ├── Cookie tampering
│   └── Unauthenticated API access
│
├── testRateLimiting()
│   ├── Send 100 rapid requests
│   ├── Measure success rate
│   └── Check for 429 responses
│
├── testConcurrentSessions()
│   ├── Open second browser tab
│   ├── Copy authentication
│   └── Execute simultaneous actions
│
├── testEnergyExploits()
│   ├── Deplete to zero
│   ├── Try actions at 0 energy
│   └── Check for negative energy
│
├── testGoldExploits()
│   ├── Integer overflow attempts
│   ├── Rapid sell duplication
│   └── Transaction manipulation
│
├── testInventoryExploits()
│   ├── Exceed inventory limits
│   ├── Duplicate items
│   └── Stack manipulation
│
├── testCombatExploits()
│   ├── Premature actions
│   ├── Simultaneous moves
│   └── Out-of-turn attacks
│
├── testGangExploits()
│   ├── Bank overdraft
│   ├── Multiple membership
│   └── Unauthorized withdrawals
│
├── testAPIEndpointFuzzing()
│   ├── Malformed JSON
│   ├── Invalid methods
│   ├── Null/undefined bodies
│   └── Deep nested objects
│
└── testClientSideValidationBypass()
    ├── Remove validation attributes
    ├── Submit invalid data
    └── Check server response
```

---

## Exploit Report Structure

```
ExploitReport
│
├── id: "EXPLOIT-timestamp-count"
│
├── severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
│
├── category: string
│   ├── "Race Condition"
│   ├── "Input Validation"
│   ├── "XSS"
│   ├── "Authentication"
│   └── etc.
│
├── title: string
│
├── description: string
│
├── reproductionSteps: string[]
│   ├── "Step 1: Navigate to X"
│   ├── "Step 2: Click Y"
│   └── "Step 3: Observe Z"
│
├── actualBehavior: string
│
├── expectedBehavior: string
│
├── impact: string
│
├── recommendation: string
│
├── timestamp: number
│
└── evidence
    ├── screenshots: string[]
    ├── logs: string[]
    └── networkRequests: any[]
```

---

## Integration Points

### With BotBase
```
AdversarialBot extends BotBase
│
├── Uses BotBase.initialize()
├── Uses BotBase.login()
├── Uses BotBase.selectCharacter()
├── Uses BotBase.navigateTo()
├── Uses BotBase.getGold()
├── Uses BotBase.getEnergy()
├── Uses BotBase.screenshot()
├── Uses BotBase.waitRandom()
└── Uses BotBase.cleanup()
```

### With BotLogger
```
AdversarialBot uses BotLogger
│
├── Regular logger (this.logger)
│   └── For execution flow
│
└── Exploit logger (this.exploitLogger)
    └── For exploit findings only
```

### With BotMetrics
```
AdversarialBot uses BotMetrics
│
├── recordAction() for each test
├── recordError() for failures
└── saveSummary() at end
```

---

## Execution Timeline

```
Time    Event
─────   ─────────────────────────────────────────
0:00    Bot starts
0:01    Browser launches
0:02    Navigate to game
0:03    Login
0:05    Character selection
0:06    Setup request interception
0:07    Start test suite 1 (Race Conditions)
0:09    Start test suite 2 (Negative Values)
0:11    Start test suite 3 (Boundary Values)
...
0:45    Start test suite 15 (Validation Bypass)
0:47    Generate final report
0:48    Save all outputs
0:49    Cleanup & close browser
0:50    Exit
```

---

## Memory Architecture

```
AdversarialBot Instance
│
├── exploitsFound: number
│   └── Counter of exploits detected
│
├── testsRun: number
│   └── Counter of test suites executed
│
├── exploitLogger: BotLogger
│   └── Separate logger for exploits
│
├── exploitReports: ExploitReport[]
│   └── Array of all exploit findings
│
└── requestLog: any[]
    └── Array of all HTTP requests
        ├── Limited to last 10 per report
        └── Used for evidence collection
```

---

## Performance Considerations

### Speed Optimization
- `slowMo: 0` - No artificial delays
- Rapid-fire testing
- Concurrent when possible

### Resource Management
- Browser cleanup after run
- Log file rotation
- Screenshot cleanup
- Memory-efficient request logging

### Scalability
- Can run multiple instances
- Headless mode for CI/CD
- Configurable test selection
- Isolated test environments

---

## Security Model

### Safe by Default
```
┌─────────────────────────────────────┐
│  AdversarialBot Safety Features     │
├─────────────────────────────────────┤
│ ✓ Read-only testing                 │
│ ✓ No destructive operations         │
│ ✓ Isolated test account             │
│ ✓ Sandboxed browser                 │
│ ✓ Controlled environment            │
│ ✓ No production access by default   │
└─────────────────────────────────────┘
```

### Attack Simulation
```
┌─────────────────────────────────────┐
│  What It Does                       │
├─────────────────────────────────────┤
│ ✓ Attempts exploits                 │
│ ✓ Tests vulnerabilities             │
│ ✓ Finds edge cases                  │
│ ✓ Documents issues                  │
│ ✓ Provides fixes                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  What It Doesn't Do                 │
├─────────────────────────────────────┤
│ ✗ Actual attacks                    │
│ ✗ Data destruction                  │
│ ✗ Unauthorized access               │
│ ✗ Production testing (by default)   │
│ ✗ Persistence exploitation          │
└─────────────────────────────────────┘
```

---

## Extension Points

### Adding New Tests

1. **Create test method**
```typescript
private async testMyNewExploit(): Promise<void> {
  // Implementation
}
```

2. **Add to test suite array**
```typescript
const testSuites = [
  // ... existing
  () => this.testMyNewExploit(),
];
```

3. **Follow pattern**
- Start with `this.logger.action()`
- Increment `this.testsRun`
- Try exploit
- Call `this.reportExploit()` if found
- Handle errors

### Custom Severity Levels
```typescript
// Could add custom severities
type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CUSTOM';
```

### Custom Categories
```typescript
// Categories are strings, add any
category: 'My Custom Category'
```

---

## Dependencies Graph

```
AdversarialBot
│
├── puppeteer
│   ├── Browser automation
│   ├── Page interaction
│   └── Request interception
│
├── BotBase (internal)
│   ├── Authentication
│   ├── Navigation
│   └── Resource management
│
├── BotLogger (internal)
│   ├── Console output
│   └── File logging
│
├── BotMetrics (internal)
│   ├── Action tracking
│   └── Performance data
│
├── fs (Node.js)
│   └── Report generation
│
└── path (Node.js)
    └── File path handling
```

---

This architecture enables comprehensive, systematic exploit testing while maintaining safety, extensibility, and clear reporting.
