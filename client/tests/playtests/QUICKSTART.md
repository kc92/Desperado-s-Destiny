# Playtest Bots - Quick Start Guide

## Setup (First Time Only)

1. **Start the game server and client**:
   ```bash
   # Terminal 1 - Start server
   cd server
   npm run dev

   # Terminal 2 - Start client
   cd client
   npm run dev
   ```

2. **Create test accounts** (if they don't exist):
   ```bash
   # In server directory
   node createTestUser.js
   ```
   Or manually register at http://localhost:3002/register with these accounts:
   - combat.bot@playtest.local / TestBot123!
   - economy.bot@playtest.local / TestBot123!
   - social.bot@playtest.local / TestBot123!

## Running Bots

### Run All 3 Bots (Recommended)
```bash
cd client
npm run playtest
```

This will open 3 browser windows, one for each bot type.

### Run Individual Bots

```bash
# Combat-focused bot
npm run playtest:combat

# Economy-focused bot
npm run playtest:economy

# Social-focused bot
npm run playtest:social
```

## What to Expect

- **3 browser windows** will open (one per bot if running all)
- **Visible browsers** (not headless) so you can watch
- **Slow motion** actions (50ms delay) for visual tracking
- **Colored logs** in the terminal showing bot activity
- **3-4 hour runtime** per bot (1000 cycles each)

### Bot Behaviors

**Combat Bot**:
- Fights NPCs and players
- Buys weapons
- Hunts bounties
- Participates in duels

**Economy Bot**:
- Completes jobs
- Crafts items
- Trades on market
- Manages gold

**Social Bot**:
- Chats with players
- Adds friends
- Sends mail
- Talks to NPCs
- Joins gangs

## Monitoring Progress

### Watch Terminal Logs
```
[2024-01-15T10:30:45.123Z] [CombatBot-Gunslinger] [INFO] Starting behavior loop...
[2024-01-15T10:30:47.456Z] [CombatBot-Gunslinger] [SUCCESS] Combat encounter #1 completed
```

### Check Generated Data

Logs:
```bash
cat tests/playtests/logs/CombatBot-*.log
```

Metrics:
```bash
cat tests/playtests/data/CombatBot-*-summary.json
```

Screenshots:
```bash
ls screenshots/CombatBot-*.png
```

## Stopping Bots

Press `Ctrl+C` in the terminal running the bots.

The bots will:
- Save all metrics
- Generate summary reports
- Close browser windows
- Exit gracefully

## Troubleshooting

### Bots won't start
- Verify server is running on port 5000
- Verify client is running on port 3002
- Check test accounts exist in database

### Bots crash immediately
- Check browser console for errors
- Review log files in `tests/playtests/logs/`
- Ensure sufficient system resources (3 browsers = ~3GB RAM)

### Rate limiting errors
- Check that development mode rate limiters are disabled
- Verify `.env` has `NODE_ENV=development`

### Can't login
- Verify test accounts exist
- Check credentials in `runPlaytests.ts`
- Manually test login at http://localhost:3002/login

## Customization

Edit `client/tests/playtests/runPlaytests.ts` to change:

```typescript
const botConfig = {
  headless: false,  // Change to true for headless mode
  slowMo: 50,       // Increase for slower, decrease for faster
};
```

## Data Analysis

After running for a few hours, analyze the data:

```bash
# View combat statistics
jq '.topActions' tests/playtests/data/CombatBot-*-summary.json

# View economy performance
jq '.actionsPerMinute' tests/playtests/data/EconomyBot-*-summary.json

# View social interactions
jq '.topActions' tests/playtests/data/SocialBot-*-summary.json
```

## Tips for Best Results

1. **Run overnight** - Let bots run for 3-4 hours unattended
2. **Monitor initially** - Watch first 10-15 minutes to verify correct behavior
3. **Clean database** - Start with fresh test accounts for clean data
4. **Disable rate limits** - Ensure `NODE_ENV=development` in `.env`
5. **System resources** - Close other applications to free RAM/CPU
6. **Separate test server** - Don't run on production database

## Next Steps

After collecting data:

1. Review generated metrics in `tests/playtests/data/`
2. Analyze screenshots for UI issues
3. Check server logs for errors
4. Review performance metrics
5. Identify bottlenecks and bugs
6. Repeat with fixes applied

## Advanced Usage

### Run for longer duration
Edit bot files and change:
```typescript
const maxCycles = 2000; // Was 1000 = ~4 hours, now 2000 = ~8 hours
```

### Run more bots simultaneously
Create additional bot instances in `runPlaytests.ts`

### Customize bot behavior
Edit individual bot files in `tests/playtests/bots/`

### Add new bot types
1. Create new class extending `BotBase`
2. Implement `runBehaviorLoop()`
3. Add to `runPlaytests.ts`
