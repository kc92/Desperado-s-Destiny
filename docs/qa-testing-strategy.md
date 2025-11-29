# DESPERADOS DESTINY - QA & TESTING STRATEGY
## Comprehensive Quality Assurance Plan

**Version:** 1.0
**Last Updated:** November 15, 2025
**Status:** Phase 0.75 - Foundation Planning

---

## OVERVIEW

This document defines the complete Quality Assurance and Testing strategy for Desperados Destiny, ensuring production-ready code, minimal bugs, and excellent player experience.

**Quality Goals:**
- **Zero critical bugs at launch**
- **95%+ uptime** in production
- **<500ms API response time** (p95)
- **Zero data loss** incidents
- **Secure by default** (all security tests pass)

**Testing Philosophy:**
- **Shift Left** - Test early, test often
- **Automate Everything** - Reduce manual testing overhead
- **Test in Production** - Canary deployments, feature flags
- **Quality is Everyone's Job** - Developers write tests, QA validates

---

## TABLE OF CONTENTS

1. [Test Pyramid](#test-pyramid)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [End-to-End (E2E) Testing](#end-to-end-e2e-testing)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)
7. [Manual QA Testing](#manual-qa-testing)
8. [Test Data Management](#test-data-management)
9. [Bug Tracking & Triage](#bug-tracking--triage)
10. [Code Coverage Requirements](#code-coverage-requirements)
11. [CI/CD Integration](#cicd-integration)
12. [Pre-Release Checklist](#pre-release-checklist)

---

## TEST PYRAMID

### The Ideal Distribution

```
                 /\
                /  \  E2E Tests (5%)
               /    \  - Slow, expensive, brittle
              /------\  - Critical user journeys only
             /        \
            / Integration \ (15%)
           /    Tests      \ - API endpoints, DB interactions
          /                 \ - External service mocks
         /-------------------\
        /                     \
       /      Unit Tests       \ (80%)
      /        (Fast)           \ - Pure functions, logic
     /                           \ - Individual components
    /-----------------------------\
```

**Rationale:**
- **Unit tests (80%)** - Fast, isolated, easy to maintain
- **Integration tests (15%)** - Verify components work together
- **E2E tests (5%)** - Validate critical user flows end-to-end

**Target Test Counts (MVP):**
- ~500 unit tests
- ~100 integration tests
- ~30 E2E tests

---

## UNIT TESTING

### Framework: Jest (JavaScript/TypeScript)

**Installation:**
```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev @testing-library/react @testing-library/jest-dom  # For React components
```

**Configuration:** `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/index.ts'
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ]
}
```

### What to Unit Test

**Backend:**
- [ ] **Destiny Deck Algorithm** - Hand ranking, score calculation, suit bonuses
- [ ] **Energy System** - Regeneration, fatigue, cost calculations
- [ ] **Skill Bonus Formulas** - Level-to-bonus conversion
- [ ] **Combat Logic** - Damage calculations, winner determination
- [ ] **Economy Functions** - Transaction validation, balance updates
- [ ] **Validation Schemas** - Input validation (Joi schemas)
- [ ] **Utility Functions** - Date formatters, string sanitizers, etc.

**Frontend:**
- [ ] **React Components** - Render tests, user interactions
- [ ] **State Management** - Zustand store actions, selectors
- [ ] **Hooks** - Custom React hooks
- [ ] **Formatters** - Number formatting, date formatting
- [ ] **Validators** - Client-side form validation

### Example Unit Tests

**Destiny Deck Algorithm Test:**

```typescript
import { identifyHandRank, calculateBaseScore } from '../destinyDeck'

describe('Destiny Deck Algorithm', () => {
  describe('identifyHandRank', () => {
    it('should identify a Royal Flush', () => {
      const hand = [
        { rank: 'A', suit: '♠' },
        { rank: 'K', suit: '♠' },
        { rank: 'Q', suit: '♠' },
        { rank: 'J', suit: '♠' },
        { rank: '10', suit: '♠' }
      ]
      expect(identifyHandRank(hand)).toBe('royal_flush')
    })

    it('should identify a Pair', () => {
      const hand = [
        { rank: '7', suit: '♠' },
        { rank: '7', suit: '♥' },
        { rank: 'A', suit: '♦' },
        { rank: 'K', suit: '♣' },
        { rank: '3', suit: '♠' }
      ]
      expect(identifyHandRank(hand)).toBe('pair')
    })

    it('should identify High Card', () => {
      const hand = [
        { rank: 'A', suit: '♠' },
        { rank: 'K', suit: '♦' },
        { rank: '9', suit: '♣' },
        { rank: '7', suit: '♥' },
        { rank: '2', suit: '♠' }
      ]
      expect(identifyHandRank(hand)).toBe('high_card')
    })
  })

  describe('calculateBaseScore', () => {
    it('should calculate base score for Royal Flush', () => {
      const score = calculateBaseScore('royal_flush', [])
      expect(score).toBe(500)
    })

    it('should calculate base score for Pair with kicker', () => {
      const hand = [
        { rank: 'K', suit: '♠' },
        { rank: 'K', suit: '♦' },
        { rank: 'A', suit: '♣' },
        { rank: '7', suit: '♥' },
        { rank: '3', suit: '♠' }
      ]
      const score = calculateBaseScore('pair', hand)
      expect(score).toBe(44)  // 30 (pair) + 14 (Ace kicker)
    })
  })
})
```

**Energy System Test:**

```typescript
import { regenerateEnergy, calculateFatigueMultiplier } from '../energySystem'

describe('Energy System', () => {
  describe('regenerateEnergy', () => {
    it('should regenerate 1 energy per tick for free tier', () => {
      const character = {
        energy: {
          current: 100,
          max: 150,
          baseRegen: 5,
          lastRegen: new Date(Date.now() - 12 * 60 * 1000),  // 12 minutes ago
          _regenRemainder: 0
        },
        premiumTier: 'free'
      }

      const result = regenerateEnergy(character)

      expect(result.regenerated).toBe(1)
      expect(result.newCurrent).toBe(101)
    })

    it('should cap energy at maximum', () => {
      const character = {
        energy: {
          current: 149,
          max: 150,
          baseRegen: 5,
          lastRegen: new Date(Date.now() - 24 * 60 * 1000),  // 24 minutes ago (2 ticks)
          _regenRemainder: 0
        },
        premiumTier: 'free'
      }

      const result = regenerateEnergy(character)

      expect(result.newCurrent).toBe(150)  // Capped at max, not 151
    })
  })

  describe('calculateFatigueMultiplier', () => {
    it('should return 1.0 for zero fatigue', () => {
      expect(calculateFatigueMultiplier(0)).toBe(1.0)
    })

    it('should return 0.5 for max fatigue', () => {
      expect(calculateFatigueMultiplier(100)).toBe(0.5)
    })

    it('should return 0.75 for 50% fatigue', () => {
      expect(calculateFatigueMultiplier(50)).toBe(0.75)
    })
  })
})
```

### Code Coverage Requirements

**Minimum Coverage:**
- **Overall:** 80% coverage (lines, branches, functions, statements)
- **Critical Code:** 100% coverage (Destiny Deck, Energy System, Authentication, Payments)
- **Utilities:** 90% coverage
- **UI Components:** 70% coverage (some UI is hard to test)

**Coverage Report:**
```bash
npm run test:coverage
```

**Fail CI if coverage drops below thresholds.**

---

## INTEGRATION TESTING

### Framework: Jest + Supertest (API testing)

**Installation:**
```bash
npm install --save-dev supertest @types/supertest
```

### What to Integration Test

- [ ] **API Endpoints** - Request/response validation
- [ ] **Database Operations** - CRUD operations, transactions
- [ ] **Authentication Flow** - Login, token refresh, logout
- [ ] **Real-time Events** - Socket.io event emission/handling
- [ ] **External Services** - Stripe payments, email sending (mocked)
- [ ] **File Uploads** - Avatar uploads, data exports

### Example Integration Tests

**API Endpoint Test:**

```typescript
import request from 'supertest'
import app from '../app'
import { setupTestDatabase, teardownTestDatabase } from '../testUtils'

describe('POST /auth/register', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  it('should create a new user account', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecureP@ssw0rd',
        gdprConsent: true
      })
      .expect(201)

    expect(response.body.success).toBe(true)
    expect(response.body.data.email).toBe('test@example.com')
    expect(response.body.data.emailVerified).toBe(false)
  })

  it('should reject duplicate email', async () => {
    // First registration
    await request(app).post('/auth/register').send({
      email: 'duplicate@example.com',
      password: 'SecureP@ssw0rd',
      gdprConsent: true
    })

    // Second registration (should fail)
    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'AnotherP@ssw0rd',
        gdprConsent: true
      })
      .expect(409)

    expect(response.body.success).toBe(false)
    expect(response.body.error.code).toBe('EMAIL_TAKEN')
  })

  it('should reject weak password', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'weak@example.com',
        password: '12345',
        gdprConsent: true
      })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.error.message).toContain('Password must')
  })
})
```

**Database Transaction Test:**

```typescript
import { performDuel } from '../combat'
import { getCharacter } from '../database'
import { setupTestDatabase, createTestCharacter } from '../testUtils'

describe('Combat System - Duel', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  it('should deduct energy and update character stats atomically', async () => {
    const attacker = await createTestCharacter('Attacker', { energy: 100 })
    const defender = await createTestCharacter('Defender', { energy: 100 })

    const result = await performDuel(attacker._id, defender._id)

    // Verify attacker energy deducted
    const updatedAttacker = await getCharacter(attacker._id)
    expect(updatedAttacker.energy.current).toBe(75)  // 100 - 25 (duel cost)

    // Verify combat stats updated
    if (result.winner === attacker._id) {
      expect(updatedAttacker.stats.duelsWon).toBe(1)
    } else {
      expect(updatedAttacker.stats.duelsLost).toBe(1)
    }
  })
})
```

---

## END-TO-END (E2E) TESTING

### Framework: Playwright (cross-browser E2E testing)

**Installation:**
```bash
npm install --save-dev @playwright/test
npx playwright install  # Install browsers
```

**Configuration:** `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 2,  // Retry flaky tests
  workers: 4,  // Parallel test execution
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' }
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' }
    }
  ]
})
```

### Critical E2E Test Scenarios

**Must-Pass User Journeys:**

1. **Account Creation & Login**
   - Register new account
   - Verify email
   - Create character
   - Log in
   - Log out

2. **Combat Flow**
   - Navigate to duel page
   - Challenge opponent
   - View Destiny Deck result
   - See updated stats/gold

3. **Gang Management**
   - Create gang
   - Invite member
   - Deposit to vault
   - Leave gang

4. **Premium Purchase**
   - Navigate to premium page
   - Complete Stripe payment (test mode)
   - Verify premium status updated
   - Verify increased energy pool

5. **Chat System**
   - Send message in global chat
   - Send message in gang chat
   - Report message
   - See moderator delete message

### Example E2E Tests

**Complete User Registration Flow:**

```typescript
import { test, expect } from '@playwright/test'

test.describe('User Registration Flow', () => {
  test('should register, verify email, and create character', async ({ page }) => {
    // Step 1: Navigate to registration page
    await page.goto('/register')

    // Step 2: Fill out registration form
    await page.fill('input[name="email"]', 'newuser@example.com')
    await page.fill('input[name="password"]', 'SecureP@ssw0rd')
    await page.check('input[name="gdprConsent"]')
    await page.click('button[type="submit"]')

    // Step 3: Verify success message
    await expect(page.locator('text=Check your email')).toBeVisible()

    // Step 4: Simulate email verification (in test, directly verify token)
    const verificationToken = await getVerificationTokenFromDB('newuser@example.com')
    await page.goto(`/verify-email?token=${verificationToken}`)

    // Step 5: Verify email confirmed
    await expect(page.locator('text=Email verified')).toBeVisible()

    // Step 6: Create character
    await page.goto('/create-character')
    await page.fill('input[name="characterName"]', 'Test Desperado')
    await page.selectOption('select[name="faction"]', 'frontera')
    await page.click('button[text="Create Character"]')

    // Step 7: Verify character created and redirected to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Welcome, Test Desperado')).toBeVisible()
  })
})
```

**Duel Flow E2E Test:**

```typescript
test.describe('Combat - Duel Flow', () => {
  test('should complete a duel and show result', async ({ page, context }) => {
    // Setup: Create two test accounts
    const attacker = await createTestAccount('attacker@test.com')
    const defender = await createTestAccount('defender@test.com')

    // Login as attacker
    await page.goto('/login')
    await page.fill('input[name="email"]', attacker.email)
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    // Navigate to duel page
    await page.goto('/combat/duel')

    // Search for defender
    await page.fill('input[name="search"]', 'defender')
    await page.click('button:has-text("Search")')

    // Challenge defender
    await page.click(`button[data-character-id="${defender.characterId}"]:has-text("Duel")`)

    // Wait for Destiny Deck animation
    await expect(page.locator('.destiny-deck-animation')).toBeVisible()
    await page.waitForTimeout(2000)  // Allow animation to complete

    // Verify result displayed
    const resultText = await page.locator('.duel-result').textContent()
    expect(resultText).toMatch(/(Victory|Defeat)/)

    // Verify energy deducted
    const energyElement = page.locator('.energy-display')
    const energyText = await energyElement.textContent()
    expect(energyText).toMatch(/\d+\/\d+/)  // Format: "75/150"
  })
})
```

---

## PERFORMANCE TESTING

### Framework: Artillery (load testing)

**Installation:**
```bash
npm install --save-dev artillery
```

**Configuration:** `artillery.yml`

```yaml
config:
  target: 'https://api.desperados-destiny.com'
  phases:
    - duration: 60
      arrivalRate: 10  # 10 users per second
      name: "Warm up"
    - duration: 120
      arrivalRate: 50  # 50 users per second
      name: "Ramp up"
    - duration: 300
      arrivalRate: 100  # 100 users per second
      name: "Sustained load"

scenarios:
  - name: "User Login and Duel"
    flow:
      - post:
          url: "/auth/login"
          json:
            email: "testuser{{ $randomNumber() }}@example.com"
            password: "TestPassword123!"
          capture:
            - json: "$.data.accessToken"
              as: "token"
      - get:
          url: "/characters/{{ characterId }}"
          headers:
            Authorization: "Bearer {{ token }}"
      - post:
          url: "/combat/duel"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            targetCharacterId: "{{ randomCharacterId }}"
```

**Run Performance Tests:**
```bash
artillery run artillery.yml
```

### Performance Benchmarks

**API Response Times (p95):**
- Simple GET requests: <100ms
- Complex queries (leaderboards): <300ms
- Combat actions: <500ms
- Premium payments: <2000ms

**Database Performance:**
- Character lookup (indexed): <10ms
- Complex aggregations: <100ms
- Transactions (duel): <50ms

**Real-Time Performance:**
- Socket.io message delivery: <50ms
- Chat message broadcast: <100ms to all recipients

**Throughput:**
- API requests: 1000 req/sec (single server)
- Concurrent users: 10,000+ (with load balancing)
- WebSocket connections: 50,000+ per server

### Load Test Scenarios

1. **Normal Load (baseline)**
   - 100 concurrent users
   - Mix of API calls (read-heavy)
   - Target: <200ms p95 response time

2. **Peak Load (high traffic)**
   - 1000 concurrent users
   - Mix of API calls
   - Target: <500ms p95 response time

3. **Stress Test (breaking point)**
   - Gradually increase load until failures
   - Identify bottlenecks
   - Target: Graceful degradation, no crashes

4. **Endurance Test (stability)**
   - 200 concurrent users
   - Run for 24 hours
   - Target: No memory leaks, no performance degradation

---

## SECURITY TESTING

### Automated Security Scanning

**Tools:**
- [ ] **npm audit** - Dependency vulnerability scanning
- [ ] **Snyk** - Code security analysis
- [ ] **OWASP ZAP** - Web vulnerability scanner
- [ ] **Burp Suite** - API security testing
- [ ] **truffleHog** - Secret scanning in Git history

**Run in CI/CD:**
```bash
# Dependency vulnerabilities
npm audit --audit-level=moderate

# Snyk scan
snyk test

# OWASP ZAP scan (Docker)
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://api.desperados-destiny.com \
  -r zap-report.html
```

### Manual Penetration Testing

**Pre-Launch Checklist:**
- [ ] SQL/NoSQL injection testing on all endpoints
- [ ] XSS injection in user inputs (chat, bio, character name)
- [ ] CSRF bypass attempts
- [ ] Authentication bypass attempts (JWT manipulation)
- [ ] Authorization escalation (access admin endpoints as user)
- [ ] Session hijacking attempts
- [ ] Rate limit bypass attempts (distributed IPs)
- [ ] File upload exploits (malicious avatars)

**Hire External Pentester:**
- Budget: $5,000-10,000
- Timeline: 1-2 weeks before launch
- Scope: Full application (API + frontend)

---

## MANUAL QA TESTING

### QA Team Structure

**MVP Phase:**
- 1 QA Lead (part-time contractor)
- 2 QA Testers (freelancers during testing weeks)

**Responsibilities:**
- Execute manual test cases
- Exploratory testing (creative edge cases)
- Regression testing before releases
- Bug reporting and verification
- User acceptance testing (UAT)

### Manual Test Cases

**Must-Test Features (Each Release):**

1. **Character Creation**
   - [ ] Create character with valid name
   - [ ] Create character with profanity (should block)
   - [ ] Create character with duplicate name (should block)
   - [ ] Create character for each faction

2. **Combat**
   - [ ] Duel another player
   - [ ] Duel while in hospital (should block)
   - [ ] Duel with insufficient energy (should block)
   - [ ] Gang war (5v5)
   - [ ] Territory attack

3. **Economy**
   - [ ] Buy item from shop
   - [ ] Sell item to shop
   - [ ] Trade item with player (future)
   - [ ] Gang vault deposit
   - [ ] Gang vault withdrawal (as officer)

4. **Chat**
   - [ ] Send message in global chat
   - [ ] Send message with profanity (should filter or warn)
   - [ ] Report message
   - [ ] Admin delete message

5. **Premium**
   - [ ] Purchase premium subscription (Stripe test mode)
   - [ ] Verify energy pool increased
   - [ ] Cancel subscription
   - [ ] Downgrade to free tier

### Exploratory Testing Sessions

**Weekly 2-hour sessions:**
- No script, just explore
- Try to break the game
- Find unexpected behaviors
- Document creative edge cases

**Example Exploratory Tests:**
- What happens if I spam the duel button 100 times?
- Can I inject HTML in character bio?
- What if I delete my account mid-duel?
- Can I exploit Destiny Deck by refreshing?

---

## TEST DATA MANAGEMENT

### Test Database

**Separate Test DB:**
- Use dedicated `desperados_destiny_test` database
- Reset before each test run
- Seed with predictable data

**Seed Data:**
```typescript
export async function seedTestData() {
  await db.collection('characters').insertMany([
    {
      _id: new ObjectId('507f1f77bcf86cd799439012'),
      name: 'Test Character 1',
      faction: 'frontera',
      level: 25,
      energy: { current: 100, max: 150 }
    },
    {
      _id: new ObjectId('507f1f77bcf86cd799439013'),
      name: 'Test Character 2',
      faction: 'settler',
      level: 30,
      energy: { current: 50, max: 150 }
    }
  ])

  // Seed gangs, items, etc.
}
```

**Teardown:**
```typescript
export async function teardownTestDatabase() {
  await db.collection('characters').deleteMany({})
  await db.collection('users').deleteMany({})
  await db.collection('combat_logs').deleteMany({})
  // ...
}
```

### Test Fixtures

**Create reusable test data:**

```typescript
export const testCharacters = {
  attacker: {
    name: 'Attacker Character',
    faction: 'frontera',
    skills: [
      { skillId: 'gun_fighting', level: 50 }
    ]
  },
  defender: {
    name: 'Defender Character',
    faction: 'settler',
    skills: [
      { skillId: 'gun_fighting', level: 40 }
    ]
  }
}
```

---

## BUG TRACKING & TRIAGE

### Bug Tracking Tool: GitHub Issues

**Labels:**
- `bug` - Confirmed bug
- `critical` - Blocks core functionality, immediate fix required
- `high` - Major issue, fix before next release
- `medium` - Noticeable issue, fix soon
- `low` - Minor cosmetic issue, fix when convenient
- `security` - Security vulnerability
- `performance` - Performance degradation
- `documentation` - Documentation issue

**Bug Template:**

```markdown
## Bug Description
A clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- Browser: Chrome 120
- OS: Windows 11
- Account type: Premium

## Screenshots
If applicable.

## Severity
- [ ] Critical (blocks core functionality)
- [ ] High (major issue)
- [ ] Medium (noticeable issue)
- [ ] Low (minor cosmetic)
```

### Triage Process

**Daily Triage (QA Lead):**
1. Review new bugs
2. Assign severity labels
3. Assign to developer
4. Add to sprint if critical/high

**Weekly Bug Review:**
- Review all open bugs
- Close fixed bugs
- Re-prioritize if needed

---

## CODE COVERAGE REQUIREMENTS

### Coverage Targets

```javascript
// jest.config.js
coverageThresholds: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  // Stricter requirements for critical code
  './src/core/destinyDeck.ts': {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100
  },
  './src/core/energySystem.ts': {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100
  },
  './src/auth/*': {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95
  }
}
```

**Fail Build if Coverage Drops:**
```json
// package.json
{
  "scripts": {
    "test": "jest --coverage --coverageThreshold='{\"global\":{\"branches\":80,\"functions\":80,\"lines\":80,\"statements\":80}}'"
  }
}
```

---

## CI/CD INTEGRATION

### GitHub Actions Workflow

**`.github/workflows/test.yml`:**

```yaml
name: Test Suite

on:
  pull_request:
    branches: [master, develop]
  push:
    branches: [master, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - run: npm run test:coverage-check

  integration-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-screenshots
          path: tests/e2e/screenshots

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit --audit-level=moderate
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

## PRE-RELEASE CHECKLIST

### MVP Launch Checklist

**Code Quality:**
- [ ] All unit tests pass (500+ tests)
- [ ] All integration tests pass (100+ tests)
- [ ] All E2E tests pass (30+ critical paths)
- [ ] Code coverage ≥80% overall, 100% for critical code
- [ ] Zero critical bugs open
- [ ] <5 high-priority bugs open

**Performance:**
- [ ] Load test passed (1000 concurrent users, <500ms p95)
- [ ] No memory leaks (24-hour endurance test)
- [ ] Database queries optimized (all <100ms)

**Security:**
- [ ] npm audit clean (no high/critical vulnerabilities)
- [ ] Snyk scan passed
- [ ] OWASP ZAP scan passed
- [ ] External penetration test completed and issues fixed
- [ ] GDPR compliance verified

**Functional:**
- [ ] All MVP features implemented and tested
- [ ] Character creation works
- [ ] Destiny Deck system works
- [ ] Combat (duels) works
- [ ] Energy system works
- [ ] Gang system works
- [ ] Chat works
- [ ] Premium subscription works (Stripe test mode verified)

**Documentation:**
- [ ] API documentation up-to-date
- [ ] User guide published
- [ ] Admin guide published
- [ ] Deployment runbook complete

**Infrastructure:**
- [ ] Production environment provisioned
- [ ] Database backups automated (tested restore)
- [ ] Monitoring configured (Grafana + Prometheus)
- [ ] Alerting configured (PagerDuty)
- [ ] Rate limiting enabled
- [ ] DDoS protection active (Cloudflare)

**Legal:**
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Cookie consent banner live
- [ ] GDPR compliance verified

---

## REGRESSION TESTING

### Automated Regression Suite

**Run before every release:**
```bash
npm run test:regression
```

**Regression Suite includes:**
- All unit tests
- All integration tests
- Critical E2E paths
- Smoke tests (basic functionality)

**Smoke Test Checklist:**
- [ ] Homepage loads
- [ ] User can register
- [ ] User can login
- [ ] User can create character
- [ ] User can duel
- [ ] User can send chat message
- [ ] Premium purchase flow works (test mode)

---

## CONCLUSION

This QA & Testing Strategy provides **production-ready quality assurance** that:

1. **Ensures code quality** with 80%+ test coverage
2. **Validates functionality** with comprehensive unit, integration, and E2E tests
3. **Verifies performance** with load testing (1000+ concurrent users)
4. **Secures the application** with automated security scans and pentesting
5. **Prevents regressions** with automated test suites in CI/CD
6. **Delivers quality** with manual QA and exploratory testing

**No more 2/10 QA score** - this strategy brings us to industry-leading quality standards.

---

**Document Status:** ✅ Complete
**Test Coverage Target:** 80% overall, 100% critical code
**CI/CD Ready:** Yes
**Next Phase:** CI/CD Pipeline Specifications

*— Ezra "Hawk" Hawthorne*
*Quality Assurance Architect*
*November 15, 2025*
