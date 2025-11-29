# End-to-End Test Suite

Comprehensive E2E tests for critical user flows in Desperados Destiny using Puppeteer and Jest.

## Test Files

### TypeScript Test Files (New)

1. **onboarding.test.ts** (22 tests)
   - Landing page display
   - User registration with validation
   - Character creation flow
   - Tutorial and first game experience

2. **combat.test.ts** (25 tests)
   - Combat page navigation
   - NPC opponent selection
   - Destiny deck mechanics (card drawing and selection)
   - Combat resolution and outcomes
   - Reward distribution
   - Energy system management

3. **gang.test.ts** (32 tests)
   - Gang page navigation
   - Gang creation with validation
   - Member management
   - Gang bank operations (deposit/withdraw)
   - Gang stats and activities
   - Leaving and managing gangs

4. **economy.test.ts** (33 tests)
   - Gold balance display and tracking
   - Shop navigation and item browsing
   - Purchase flow with validation
   - Inventory management
   - Item equipping and usage
   - Transaction history

**Total: 112 comprehensive E2E tests**

### JavaScript Test Files (Existing)

Located in `specs/` subdirectories:
- `specs/onboarding/onboarding.spec.js`
- `specs/combat/combat.spec.js`
- `specs/gang/gang.spec.js`
- `specs/economy/economy.spec.js`
- Additional specs in other directories

## Test Helpers

### TypeScript Helpers

**helpers/e2e-helpers.ts** - Type-safe utilities including:
- Authentication helpers (login, logout, character selection)
- Navigation utilities
- Element interaction helpers
- Text and content verification
- Gold and energy extraction
- Screenshot capture
- Character stats retrieval

### JavaScript Helpers

- `helpers/auth.helper.js` - Authentication flows
- `helpers/navigation.helper.js` - Page navigation
- `helpers/screenshot.helper.js` - Screenshot capture
- `helpers/location.helper.js` - Location-based helpers

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install
```

### Run All E2E Tests

```bash
# Headless mode (default)
npm run test:e2e

# Headed mode (see browser)
npm run test:e2e:headed

# Watch mode
npm run test:e2e:watch
```

### Run Specific Test Files

```bash
# TypeScript tests
npx jest tests/e2e/onboarding.test.ts
npx jest tests/e2e/combat.test.ts
npx jest tests/e2e/gang.test.ts
npx jest tests/e2e/economy.test.ts

# JavaScript specs
npx jest tests/e2e/specs/onboarding/onboarding.spec.js
```

### Run Tests with Custom Settings

```bash
# Slow motion (see actions)
SLOW_MO=100 npm run test:e2e:headed

# Custom base URL
BASE_URL=http://localhost:3000 npm run test:e2e

# Show browser with slow motion
HEADLESS=false SLOW_MO=50 npm run test:e2e
```

## Configuration

### Jest Configuration

**jest.e2e.config.cjs** - Main E2E test configuration:
- Preset: `jest-puppeteer`
- Test match pattern: `tests/e2e/specs/**/*.spec.js`
- Timeout: 30000ms (30 seconds)
- HTML reports: `tests/e2e/reports/e2e-report.html`

### Puppeteer Configuration

**jest-puppeteer.config.cjs** - Puppeteer launch options:
- Headless mode: Controlled by `HEADLESS` env var
- Slow motion: Controlled by `SLOW_MO` env var
- Chrome flags: `--no-sandbox`, `--disable-setuid-sandbox`

## Test Fixtures

**fixtures/users.json** - Test user credentials:
```json
{
  "validUser": {
    "email": "test@test.com",
    "password": "Test123!"
  }
}
```

**fixtures/locations.json** - Test location data

## Writing New Tests

### TypeScript Test Template

```typescript
import { Page } from 'puppeteer';
import {
  loginAndSelectCharacter,
  delay,
  getBodyText,
  clickButtonByText,
  captureScreenshot,
  BASE_URL,
} from './helpers/e2e-helpers';

declare const page: Page;
declare const jestPuppeteer: any;

describe('My Feature Flow', () => {
  beforeEach(async () => {
    await loginAndSelectCharacter(page, 'test@test.com', 'Test123!');
  });

  it('should do something', async () => {
    await page.goto(`${BASE_URL}/my-page`);
    await delay(1000);

    const bodyText = await getBodyText(page);
    expect(bodyText).toContain('Expected Text');
  }, 30000);
});
```

## Best Practices

1. **Use TypeScript helpers** for type safety and code reuse
2. **Add delays** after actions to allow UI updates
3. **Capture screenshots** on test failures for debugging
4. **Use semantic selectors** (data-testid) when possible
5. **Set timeouts** appropriately (default 30000ms per test)
6. **Clean up** after tests in afterEach/afterAll hooks
7. **Test user perspective** rather than implementation details
8. **Handle race conditions** with Promise.race for navigation
9. **Validate multiple outcomes** (success OR error, not just success)
10. **Document test coverage** in test file headers

## Debugging Tests

### Screenshots

Failed tests automatically capture screenshots to:
```
tests/e2e/screenshots/
```

### Console Logs

Browser console errors are logged to terminal output.

### Manual Debugging

```bash
# Run in headed mode with slow motion
HEADLESS=false SLOW_MO=100 npx jest tests/e2e/onboarding.test.ts

# Run single test
npx jest tests/e2e/onboarding.test.ts -t "should load the landing page"
```

### Puppeteer DevTools

```typescript
// Add to test for debugging
await page.evaluate(() => { debugger; });
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run E2E Tests
  run: npm run test:e2e
  env:
    BASE_URL: http://localhost:3001
    HEADLESS: true
```

### Docker Example

```bash
docker-compose up -d
npm run test:e2e
docker-compose down
```

## Troubleshooting

### Tests Timing Out

- Increase timeout in test: `it('test', async () => {}, 60000)`
- Check if server is running
- Verify BASE_URL is correct

### Element Not Found

- Add delays: `await delay(1000)`
- Check selector: `await page.waitForSelector('selector', { timeout: 10000 })`
- Verify element exists in DOM

### Authentication Issues

- Check test user exists in database
- Verify credentials in fixtures/users.json
- Ensure session/cookies persist

### Puppeteer Errors

- Install Chrome: `npx puppeteer browsers install chrome`
- Check Chrome flags in jest-puppeteer.config.cjs
- Try headed mode to see what's happening

## Test Coverage

Current coverage areas:

✅ User registration and onboarding
✅ Character creation and customization
✅ Combat system with destiny deck
✅ Gang operations and banking
✅ Economy (shop, inventory, gold)
✅ Navigation and routing
✅ Form validation
✅ Error handling

Future test areas:

⏳ Mail and friends system
⏳ Territory control
⏳ Quests and achievements
⏳ Tournaments and duels
⏳ Chat and social features

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Puppeteer Documentation](https://pptr.dev/)
- [Jest-Puppeteer Documentation](https://github.com/smooth-code/jest-puppeteer)

## Support

For issues or questions:
1. Check test logs and screenshots
2. Review existing test patterns
3. Consult documentation above
4. Check browser console for errors
