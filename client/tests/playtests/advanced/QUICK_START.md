# AdversarialBot Quick Start Guide

**Get up and running with exploit testing in 5 minutes!**

---

## Prerequisites

✅ Node.js installed
✅ Game server running (default: `http://localhost:3002`)
✅ Test user account created

---

## Installation

```bash
# Navigate to client directory
cd client

# Install dependencies (if not already done)
npm install
```

---

## Basic Usage

### 1. Run Basic Exploit Test

```bash
npm run test:adversarial
```

**What it does**:
- Opens a browser window
- Logs in as test user
- Runs all 15 exploit test suites
- Generates reports in `tests/playtests/reports/`
- Takes screenshots of any exploits found

**Expected runtime**: 10-20 minutes

---

### 2. Run Headless (Background)

```bash
npm run test:adversarial:headless
```

**What it does**:
- Same as above, but without visible browser
- Faster execution
- Good for CI/CD pipelines

---

### 3. View Exploit Reports

After running, check:

```bash
# View latest report
ls -la tests/playtests/reports/

# Read report
cat tests/playtests/reports/adversarial-bot-report-*.json
```

Or run the analyzer:

```bash
npm run example:exploits 4
```

---

## Configuration

### Change Test User

Edit `client/tests/playtests/advanced/runAdversarialBot.ts`:

```typescript
const bot = new AdversarialBot({
  name: 'ChaosAgent',
  username: 'YOUR_USERNAME',      // ← Change this
  email: 'YOUR_EMAIL@test.com',   // ← Change this
  password: 'YOUR_PASSWORD',      // ← Change this
  characterName: 'TestCharacter',
  baseUrl: 'http://localhost:3002',
  headless: false,
  slowMo: 0,
});
```

### Change Target Server

```bash
# Test against staging
BASE_URL=http://staging.example.com npm run test:adversarial

# Test against production (⚠️ NOT RECOMMENDED)
BASE_URL=http://production.example.com npm run test:adversarial
```

---

## Understanding Results

### Exit Code

- **0**: Tests completed successfully
- **1**: Error occurred during testing

### Report Files

**Main Report**: `adversarial-bot-report-TIMESTAMP.json`
```json
{
  "summary": {
    "critical": 0,  // ← Fix these immediately!
    "high": 1,      // ← Fix before production
    "medium": 2,    // ← Fix in next release
    "low": 0        // ← Track and fix when convenient
  }
}
```

### Severity Levels

| Severity | Meaning | Action Required |
|----------|---------|-----------------|
| 🔴 CRITICAL | Game-breaking exploit or security vulnerability | Fix immediately |
| 🟠 HIGH | Significant vulnerability | Fix before production |
| 🟡 MEDIUM | Notable issue that could be exploited | Fix in next cycle |
| 🟢 LOW | Minor issue or informational | Track and fix later |

---

## Common Exploits Found

### Example 1: Gold Duplication
```
Severity: CRITICAL
Category: Race Condition

Reproduction:
1. Navigate to shop
2. Rapidly click buy button 10 times
3. Gold increases instead of decreases

Fix: Add server-side transaction locking
```

### Example 2: Negative Energy
```
Severity: HIGH
Category: Input Validation

Reproduction:
1. Open browser console
2. Run: localStorage.setItem('energy', '-100')
3. Reload page
4. Energy is negative

Fix: Never trust client-side values
```

### Example 3: XSS Injection
```
Severity: CRITICAL
Category: XSS

Reproduction:
1. Enter: <script>alert('XSS')</script>
2. Submit form
3. Script executes

Fix: Sanitize all user inputs
```

---

## Quick Troubleshooting

### Bot crashes immediately

**Problem**: Can't connect to server
**Solution**:
```bash
# Check server is running
curl http://localhost:3002

# Check BASE_URL is correct
echo $BASE_URL
```

### No exploits found

**Problem**: Either game is secure OR tests aren't running
**Solution**:
```bash
# Check logs
cat tests/playtests/logs/ChaosAgent-*.log

# Should see "Running test suite 1/15..."
```

### Browser won't close

**Problem**: Bot crashed mid-execution
**Solution**:
```bash
# Kill all Chrome processes
pkill -9 chrome
# or on Windows:
taskkill /F /IM chrome.exe
```

### Permission denied on reports

**Problem**: Can't write to reports directory
**Solution**:
```bash
# Create directory manually
mkdir -p tests/playtests/reports
chmod 755 tests/playtests/reports
```

---

## Examples

### Example 1: Basic Run
```bash
npm run test:adversarial
```

### Example 2: Run All Examples
```bash
npm run example:exploits all
```

### Example 3: Compare Reports
```bash
npm run example:exploits 4
```

---

## Daily Workflow

### For Security Team

```bash
# Morning: Run overnight test
npm run test:adversarial:headless

# Review results
npm run example:exploits 4

# Check for critical findings
grep -r "CRITICAL" tests/playtests/logs/ChaosAgent-EXPLOITS-*.log

# Create tickets for fixes
```

### For Developers

```bash
# Before commit: Quick check
npm run test:adversarial:headless

# After fix: Verify
npm run test:adversarial

# Compare: Is it better?
npm run example:exploits 4
```

---

## Advanced Usage

### Create Custom Test

1. Open `client/tests/playtests/advanced/AdversarialBot.ts`

2. Add new test method:
```typescript
private async testMyCustomExploit(): Promise<void> {
  this.logger.action('Testing my custom exploit');
  this.testsRun++;

  try {
    // Your test logic

    // If exploit found:
    await this.reportExploit({
      severity: 'HIGH',
      category: 'Custom',
      title: 'My Custom Exploit',
      description: 'What I found',
      reproductionSteps: ['Step 1', 'Step 2'],
      actualBehavior: 'What happened',
      expectedBehavior: 'What should happen',
      impact: 'Why it matters',
      recommendation: 'How to fix',
    });
  } catch (error) {
    this.logger.error(`Test error: ${error}`);
  }
}
```

3. Add to test suite:
```typescript
const testSuites = [
  // ... existing tests
  () => this.testMyCustomExploit(),
];
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/security.yml
name: Security Testing
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd client && npm install
      - run: npm run test:adversarial:headless
      - uses: actions/upload-artifact@v2
        with:
          name: exploit-reports
          path: client/tests/playtests/reports/
```

---

## Tips & Tricks

### Speed Up Testing
```bash
# Skip slow tests (edit runBehaviorLoop to comment out)
# Focus on specific systems only
```

### Get More Details
```bash
# Check full logs
tail -f tests/playtests/logs/ChaosAgent-*.log

# Watch in real-time
npm run test:adversarial  # In headed mode
```

### Test Specific Feature
```typescript
// Edit runBehaviorLoop() to run only specific tests:
const testSuites = [
  () => this.testGoldExploits(),  // Only test gold
];
```

---

## Output Locations

```
tests/playtests/
├── reports/          ← Exploit reports (JSON)
├── logs/             ← Execution logs
├── data/             ← Metrics data
└── screenshots/      ← Evidence screenshots
```

---

## Getting Help

1. **Check Documentation**
   - Read `README.md` in this directory
   - Review examples in `ExploitTesting.example.ts`

2. **Check Logs**
   - Look at latest log file
   - Search for ERROR messages

3. **Check Screenshots**
   - Visual evidence of what went wrong
   - Shows exact page state

4. **Run Examples**
   - `npm run example:exploits 1` through `4`
   - See how it should work

---

## Success Indicators

✅ **Good Signs**:
- "No exploits found" message
- All tests complete
- Zero CRITICAL findings
- Reports generated successfully

⚠️ **Warning Signs**:
- CRITICAL exploits found
- HIGH exploits found
- Tests crash repeatedly
- Browser won't close

---

## Next Steps

After running AdversarialBot:

1. **Review Reports** - Check all findings
2. **Prioritize Fixes** - Start with CRITICAL
3. **Create Tickets** - Track in issue tracker
4. **Implement Fixes** - Server-side validation
5. **Re-test** - Verify fixes work
6. **Compare Results** - Ensure improvement

---

## Remember

🎯 **Goal**: Find vulnerabilities before attackers do
🔒 **Security**: Always test in safe environment
📊 **Track**: Keep history of all findings
🔄 **Iterate**: Run regularly, not just once
🛠️ **Fix**: Take action on findings

---

## One-Minute Summary

```bash
# 1. Run the bot
npm run test:adversarial

# 2. Wait 10-20 minutes

# 3. Check results
npm run example:exploits 4

# 4. Fix any CRITICAL/HIGH findings

# 5. Re-run to verify
npm run test:adversarial

# Done! 🎉
```

---

**Questions?** Check the full `README.md` in this directory.
**Issues?** Review the troubleshooting section above.
**Ready?** Run `npm run test:adversarial` now!
