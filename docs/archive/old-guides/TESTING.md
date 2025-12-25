# Testing Guide for Desperados Destiny

Complete guide for testing the Desperados Destiny MMORPG backend and frontend.

## Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Integration Tests](#integration-tests)
5. [Test Data and Helpers](#test-data-and-helpers)
6. [Writing New Tests](#writing-new-tests)
7. [CI/CD Integration](#cicd-integration)
8. [Test Coverage Requirements](#test-coverage-requirements)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The Desperados Destiny project uses a comprehensive testing strategy covering:

- **Unit Tests**: Individual functions and utilities
- **Integration Tests**: Complete API flows and user journeys
- **E2E Tests** (planned): Full browser-based user workflows
- **Contract Tests**: API response structure validation

### Testing Stack

**Backend:**
- Jest - Test framework
- Supertest - HTTP request testing
- MongoDB Memory Server - In-memory database for testing
- ts-jest - TypeScript support

**Frontend:**
- Vitest - Fast unit test runner
- React Testing Library - Component testing
- Playwright (planned) - E2E browser testing

---

## Test Structure

### Backend Tests (`server/tests/`)

```
server/tests/
├── setup.ts                          # Global test configuration
├── helpers/                          # Reusable test utilities
│   ├── api.helpers.ts               # API request helpers
│   ├── auth.helpers.ts              # Authentication utilities
│   ├── db.helpers.ts                # Database utilities
│   └── index.ts                     # Centralized exports
├── middleware/                       # Middleware unit tests
│   ├── errorHandler.test.ts
│   └── asyncHandler.test.ts
├── integration/                      # Integration test suites
│   ├── authCharacterFlow.test.ts    # Complete user journey
│   ├── multiUser.test.ts            # Multi-user isolation
│   ├── characterLimits.test.ts      # Character creation limits
│   ├── energySystem.test.ts         # Energy regeneration
│   └── apiContracts.test.ts         # API response contracts
└── server.test.ts                    # Server initialization tests
```

### Frontend Tests (`client/tests/`)

```
client/tests/
├── setup.ts                          # Test environment setup
├── helpers/                          # Test utilities
│   ├── render.helpers.tsx           # React component rendering
│   └── mock.helpers.ts              # Mock data generators
└── components/                       # Component tests
    └── Button.test.tsx              # Example component test
```

---

## Running Tests

### Backend Tests

```bash
# Navigate to server directory
cd server

# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test -- authCharacterFlow

# Run only integration tests
npm test -- integration/

# Run with verbose output
npm test -- --verbose
```

### Frontend Tests

```bash
# Navigate to client directory
cd client

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with UI (Vitest)
npm run test:ui

# Run E2E tests (when implemented)
npm run test:e2e
```

### Run All Tests (from root)

```bash
# Install dependencies first
npm install

# Run all backend and frontend tests
npm run test:all
```

---

## Integration Tests

### Sprint 2 Integration Test Suites

#### 1. Auth + Character Flow (`authCharacterFlow.test.ts`)

Tests the complete user lifecycle:
- User registration with email verification
- User login with JWT authentication
- Character creation with faction selection
- Character listing and management
- Character selection for gameplay
- Character deletion (soft delete)
- User logout and session invalidation

**Key Validations:**
- Faction-specific starting locations
- Energy system initialization
- Protected route authorization
- No password hash exposure

**Total Assertions:** 40+
**API Calls:** 16 endpoint interactions

#### 2. Multi-User Isolation (`multiUser.test.ts`)

Tests security boundaries between users:
- Users cannot view other users' character details
- Users cannot modify other users' characters
- Users cannot delete other users' characters
- Character lists are properly isolated
- JWT validation prevents cross-user access
- Character limits enforced per user independently

**Security Impact:** HIGH
**Total Test Cases:** 9 security scenarios

#### 3. Character Limits (`characterLimits.test.ts`)

Tests the 3-character-per-account limit:
- Creating up to 3 characters successfully
- 4th character creation rejection
- Character deletion frees a slot
- Soft delete behavior
- Race condition prevention

**Business Rule:** `MAX_CHARACTERS_PER_ACCOUNT = 3`
**Total Test Cases:** 10 scenarios

#### 4. Energy System (`energySystem.test.ts`)

Tests energy mechanics:
- Energy regeneration at correct rates (30/hour free, 31.25/hour premium)
- Maximum energy caps (150 free, 250 premium)
- Energy spending validation
- Race condition prevention (critical for preventing exploits)
- Premium vs free energy differences

**Game Balance Impact:** HIGH
**Total Test Cases:** 14 scenarios

#### 5. API Contracts (`apiContracts.test.ts`)

Tests API response structures:
- Authentication endpoints return SafeUser type
- Character endpoints return SafeCharacter type
- Error responses have consistent structure
- Validation error codes match expectations
- No sensitive data in responses

**Frontend Impact:** HIGH
**Total Test Cases:** 15+ contract validations

---

## Test Data and Helpers

### API Request Helpers

```typescript
import { apiGet, apiPost, apiPatch, apiDelete, expectSuccess } from '../helpers';

// Make authenticated GET request
const res = await apiGet(app, '/api/characters', authToken);

// Make POST request
const res = await apiPost(app, '/api/auth/register', { email, password });

// Expect successful response (2xx)
expectSuccess(res);

// Extract cookie from response
const token = extractCookie(res, 'token');
```

### Database Helpers

```typescript
import { clearDatabase, clearCollection } from '../helpers';

beforeEach(async () => {
  await clearDatabase(); // Clear all collections
});

// Or clear specific collection
await clearCollection('users');
```

### Authentication Helpers

```typescript
import { createTestToken, createTestUserWithPassword } from '../helpers';

// Create JWT token for testing
const token = createTestToken(userId, email);

// Create user with hashed password
const user = await createTestUserWithPassword('user@test.com', 'Pass123');
```

---

## Writing New Tests

### Integration Test Template

```typescript
import { Express } from 'express';
import { clearDatabase, apiGet, apiPost, expectSuccess } from '../helpers';

let app: Express;

describe('My Feature Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it('should do something important', async () => {
    // Arrange
    const testData = { /* ... */ };

    // Act
    const res = await apiPost(app, '/api/endpoint', testData);

    // Assert
    expectSuccess(res);
    expect(res.body.data.result).toBe('expected');
  });
});
```

### Best Practices

1. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('should reject 4th character creation with clear error message', ...)

   // Bad
   it('test character limit', ...)
   ```

2. **Follow AAA Pattern**
   - **Arrange:** Set up test data
   - **Act:** Execute the code under test
   - **Assert:** Verify the results

3. **Test One Thing Per Test**
   ```typescript
   // Good - focused test
   it('should return 401 when not authenticated', ...)

   // Bad - testing multiple things
   it('should handle authentication and authorization', ...)
   ```

4. **Use Helpers for Repetitive Setup**
   ```typescript
   // Extract common setup to beforeEach or helper functions
   beforeEach(async () => {
     user = await createTestUser();
     token = await loginUser(user);
   });
   ```

5. **Test Error Cases**
   ```typescript
   it('should return 400 when email is invalid', async () => {
     const res = await apiPost(app, '/api/auth/register', {
       email: 'invalid-email',
       password: 'Pass123'
     });

     expect(res.status).toBe(400);
     expect(res.body.code).toBe('VALIDATION_ERROR');
   });
   ```

---

## CI/CD Integration

### GitHub Actions (Planned)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: cd server && npm install
      - name: Run tests
        run: cd server && npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: ./server/coverage

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: cd client && npm install
      - name: Run tests
        run: cd client && npm test
```

### Pre-Commit Hooks (Optional)

Using Husky for pre-commit test execution:

```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test"
```

---

## Test Coverage Requirements

### Coverage Targets

- **Overall Coverage:** 80%+
- **Critical Paths:** 95%+ (auth, character creation, energy system)
- **Utility Functions:** 90%+
- **UI Components:** 70%+

### Viewing Coverage Reports

```bash
# Generate coverage report
npm test -- --coverage

# View HTML report
open coverage/lcov-report/index.html  # macOS
start coverage/lcov-report/index.html # Windows
xdg-open coverage/lcov-report/index.html # Linux
```

### Coverage Report Structure

```
Coverage summary
  Statements   : 85.2% ( 1245/1461 )
  Branches     : 78.4% ( 342/436 )
  Functions    : 82.1% ( 156/190 )
  Lines        : 84.8% ( 1187/1400 )
```

---

## Troubleshooting

### Common Issues

#### Tests Hang or Timeout

```bash
# Increase Jest timeout (in jest.config.js or test file)
jest.setTimeout(30000); // 30 seconds
```

#### MongoDB Connection Issues

```bash
# Ensure MongoDB Memory Server is properly configured in setup.ts
# Check that connections are closed in afterAll hook
```

#### Port Already in Use

```bash
# Kill process using port
# macOS/Linux
lsof -ti:5001 | xargs kill

# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

#### Type Errors in Tests

```bash
# Ensure @types/* packages are installed
npm install --save-dev @types/jest @types/supertest

# Check tsconfig.json includes test files
```

#### Flaky Tests

```typescript
// Use deterministic test data
// Avoid relying on timing or order
// Mock external dependencies
// Clear database before each test
beforeEach(async () => {
  await clearDatabase();
});
```

---

## Test Maintenance

### When to Update Tests

- When API contracts change
- When adding new features
- When fixing bugs (add regression test)
- When refactoring (ensure tests still pass)

### Skipping Tests During Development

```typescript
// Skip individual test temporarily
it.skip('should do something', () => { /* ... */ });

// Run only specific test
it.only('should do something', () => { /* ... */ });

// Skip entire describe block
describe.skip('Feature Tests', () => { /* ... */ });
```

### Test Organization

- Group related tests in `describe` blocks
- Use nested `describe` for sub-features
- Keep test files under 500 lines
- Extract complex setup to helper functions

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright E2E Testing](https://playwright.dev/)

---

## Quick Reference

### Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm test -- --coverage` | Run with coverage |
| `npm test -- <pattern>` | Run tests matching pattern |
| `npm test -- --verbose` | Detailed output |

### Helper Functions

| Function | Purpose |
|----------|---------|
| `apiGet(app, path, token?)` | Make GET request |
| `apiPost(app, path, data, token?)` | Make POST request |
| `apiPatch(app, path, data, token?)` | Make PATCH request |
| `apiDelete(app, path, token?)` | Make DELETE request |
| `expectSuccess(response)` | Assert 2xx response |
| `extractCookie(response, name)` | Get cookie value |
| `clearDatabase()` | Clear all collections |
| `createTestToken(userId, email)` | Generate JWT |

---

**Last Updated:** November 2025
**Version:** Sprint 2 - Integration Tests
