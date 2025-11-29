# Advanced Playtest Bots

This directory contains advanced, specialized bots for comprehensive testing.

## AdversarialBot - Chaos Agent

The **AdversarialBot** is a specialized testing agent that deliberately attempts to exploit, break, and find edge cases in the game. It's designed to think like an attacker and test the robustness of the system.

### Features

#### 1. Race Condition Testing
- Rapid-fire duplicate purchases
- Simultaneous action submissions
- Concurrent gold transactions
- Multiple tab race conditions

#### 2. Negative Value Testing
- Negative gold inputs
- Negative inventory quantities
- Selling more items than owned
- Negative energy attempts

#### 3. Boundary Value Testing
- Integer overflow (MAX_INT, 2^31-1)
- Very large numbers
- Zero values
- Minimum values
- String length overflows

#### 4. Input Validation & Injection
- XSS attempts (multiple variants)
- SQL injection payloads
- Path traversal attacks
- Template injection
- Null byte injection
- PHP/code injection
- HTML/script tag injection

#### 5. State Manipulation
- LocalStorage tampering
- Client-side state modification
- Disabled button bypasses
- Energy requirement circumvention
- Gold manipulation attempts

#### 6. Authentication Exploits
- Token manipulation
- Cookie tampering
- Session hijacking attempts
- Unauthenticated API access
- Invalid token testing

#### 7. Rate Limiting Tests
- Burst request testing (100+ rapid requests)
- API endpoint flooding
- DoS resistance testing

#### 8. Concurrent Session Testing
- Multiple browser tabs
- Same account, different sessions
- Simultaneous action execution
- Session state conflicts

#### 9. Energy System Exploits
- Negative energy attempts
- Energy requirement bypasses
- Action execution without energy
- Energy regeneration exploits

#### 10. Gold Economy Exploits
- Gold duplication attempts
- Integer overflow testing
- Rapid sell/buy exploits
- Transaction rollback attempts

#### 11. Inventory Exploits
- Inventory overflow
- Item duplication
- Stack size manipulation
- Equip/unequip race conditions

#### 12. Combat Exploits
- Premature combat actions
- Simultaneous attack/defend
- Out-of-turn actions
- Health manipulation

#### 13. Gang Exploits
- Bank overdraft attempts
- Multiple gang membership
- Unauthorized withdrawals
- Permission bypasses

#### 14. API Fuzzing
- Malformed JSON payloads
- Invalid HTTP methods
- Unexpected data types
- Deep nested objects
- Empty/null payloads

#### 15. Client-Side Validation Bypass
- Removing required attributes
- Bypassing min/max constraints
- Pattern validation removal
- Disabled field manipulation

### Exploit Reporting

When the AdversarialBot finds an exploit, it generates a detailed report with:

- **Severity Level**: CRITICAL, HIGH, MEDIUM, or LOW
- **Category**: Type of vulnerability
- **Title**: Brief description
- **Detailed Description**: Full explanation
- **Reproduction Steps**: Exact steps to reproduce
- **Actual vs Expected Behavior**
- **Impact Assessment**: Real-world consequences
- **Recommendation**: How to fix it
- **Evidence**: Screenshots and logs

### Running the Bot

```bash
# Install dependencies
npm install

# Run with default settings
npm run test:adversarial

# Run headless
HEADLESS=true npm run test:adversarial

# Run against specific environment
BASE_URL=http://staging.example.com npm run test:adversarial
```

### Configuration

Edit `runAdversarialBot.ts` to customize:

```typescript
const bot = new AdversarialBot({
  name: 'ChaosAgent',
  username: 'your_test_user',
  email: 'test@example.com',
  password: 'YourPassword123!',
  characterName: 'TestCharacter',
  baseUrl: 'http://localhost:3002',
  headless: false,
  slowMo: 0, // No delays for rapid testing
});
```

### Output Files

The bot generates several outputs:

1. **Exploit Reports** (JSON)
   - Location: `tests/playtests/reports/adversarial-bot-report-*.json`
   - Contains all exploits found with full details

2. **Logs**
   - Location: `tests/playtests/logs/ChaosAgent-*.log`
   - Contains detailed execution logs

3. **Exploit Logs**
   - Location: `tests/playtests/logs/ChaosAgent-EXPLOITS-*.log`
   - Contains only exploit findings

4. **Screenshots**
   - Location: `screenshots/ChaosAgent-exploit-*.png`
   - Visual evidence of exploits

5. **Metrics**
   - Location: `tests/playtests/data/ChaosAgent-metrics-*.json`
   - Performance and test statistics

### Example Exploit Report

```json
{
  "id": "EXPLOIT-1234567890-0",
  "severity": "CRITICAL",
  "category": "Race Condition",
  "title": "Gold Duplication via Rapid Purchase",
  "description": "Rapidly clicking purchase button resulted in negative gold spent",
  "reproductionSteps": [
    "Navigate to shop",
    "Click buy button on any item 10 times rapidly",
    "Observe gold balance"
  ],
  "actualBehavior": "Gold increased from 100 to 150",
  "expectedBehavior": "Gold should decrease or stay the same",
  "impact": "Players can duplicate gold infinitely",
  "recommendation": "Implement server-side transaction locking and request deduplication",
  "timestamp": 1234567890,
  "evidence": {
    "screenshots": ["exploit-EXPLOIT-1234567890-0.png"],
    "networkRequests": [...]
  }
}
```

### Interpreting Results

#### Severity Levels

- **CRITICAL**: Immediate security risk or game-breaking exploit
  - Examples: Gold duplication, XSS, SQL injection, authentication bypass
  - Action: Fix immediately before any release

- **HIGH**: Significant vulnerability or major exploit
  - Examples: Negative energy, unauthenticated API access, state manipulation
  - Action: Fix before production release

- **MEDIUM**: Notable issue that could be exploited
  - Examples: No rate limiting, poor error handling, client-side validation only
  - Action: Fix in next release cycle

- **LOW**: Minor issue or informational finding
  - Examples: Verbose error messages, missing input constraints
  - Action: Track and fix when convenient

### Best Practices

1. **Run Regularly**: Execute before major releases
2. **Clean Database**: Use a test database, not production
3. **Review All Findings**: Even "expected" failures should be verified
4. **Track Fixes**: Keep a log of resolved exploits
5. **Regression Testing**: Re-run after fixes to verify
6. **Share Results**: Send reports to security team

### Safety Warnings

⚠️ **IMPORTANT**: This bot is designed to break things!

- **DO NOT** run against production servers
- **DO NOT** run against shared development environments without warning
- **DO** use isolated test databases
- **DO** run in a controlled environment
- **DO** have backups ready

### Common False Positives

Some "exploits" may be expected behavior:

- **Client-side validation bypass**: If server validates properly, this is OK
- **Disabled button manipulation**: If server checks permissions, this is OK
- **LocalStorage changes**: If server is authoritative, this is OK

Always verify server-side before reporting as critical.

### Adding New Tests

To add custom exploit tests:

1. Add a new test method to `AdversarialBot.ts`:

```typescript
private async testCustomExploit(): Promise<void> {
  this.logger.action('Testing custom exploit');
  this.testsRun++;

  try {
    // Your test logic here

    // If exploit found:
    await this.reportExploit({
      severity: 'HIGH',
      category: 'Custom',
      title: 'Custom Exploit Found',
      description: 'Detailed description',
      reproductionSteps: ['Step 1', 'Step 2'],
      actualBehavior: 'What happened',
      expectedBehavior: 'What should happen',
      impact: 'Security/gameplay impact',
      recommendation: 'How to fix',
    });
  } catch (error) {
    this.logger.error(`Custom test error: ${error}`);
  }
}
```

2. Add to test suite in `runBehaviorLoop()`:

```typescript
const testSuites = [
  // ... existing tests
  () => this.testCustomExploit(),
];
```

### Troubleshooting

**Bot crashes immediately**
- Check that BASE_URL is correct
- Verify test user exists
- Ensure browser can launch (for non-headless mode)

**No exploits found**
- This is good! It means the system is secure
- Verify tests are actually running (check logs)
- Try adding console.log statements in test methods

**Too many false positives**
- Review server-side validation
- Check if client-side bypass is properly handled
- Adjust severity levels in reports

### Contributing

When adding new exploit tests:
1. Document the attack vector
2. Include clear reproduction steps
3. Suggest mitigation strategies
4. Test against known vulnerabilities
5. Keep tests independent and isolated

### References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Web Security Academy: https://portswigger.net/web-security
- SANS Security Testing: https://www.sans.org/security-resources/

---

**Remember**: The goal is to find vulnerabilities before attackers do!
