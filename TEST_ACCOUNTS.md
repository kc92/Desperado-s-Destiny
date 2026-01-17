# Test Accounts for Desperados Destiny

## Active Test Account

| Field | Value |
|-------|-------|
| **Email** | `playtest.claude.2026@gmail.com` |
| **Password** | `ClaudePlaytest2026!` |
| **Username** | `PlaytestClaude2026` |
| **Character** | `ClaudePlaytest` |
| **Faction** | Settler Alliance |
| **Starting Location** | Red Gulch |
| **Created** | 2026-01-17 |
| **Status** | Active - Ready for playtesting |

## Account Setup Notes

- Account created via browser registration on production site
- Email verified manually via MongoDB
- Character created: ClaudePlaytest (Settler Alliance)

## Previous Test Accounts (Status Unknown)

| Email | Notes |
|-------|-------|
| `test.playtest.2026@gmail.com` | Password not documented - unusable |
| `claude.outlaw.test@gmail.com` | Password not documented - unusable |
| `autotest2026jan04_a@example.com` | Used for automated playtest Jan 4, 2026 |

## Standard Test Password Pattern

For future test accounts, use this pattern:
- Password: `ClaudePlaytest2026!`
- This meets all requirements: 8+ chars, uppercase, lowercase, number, special char

## Verification Instructions

To verify the email without access to the inbox:
1. Connect to MongoDB production database
2. Find user by email: `db.users.findOne({email: "playtest.claude.2026@gmail.com"})`
3. Update verification status: `db.users.updateOne({email: "playtest.claude.2026@gmail.com"}, {$set: {isVerified: true, verifiedAt: new Date()}})`

Or use Railway CLI:
```bash
railway run node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: 'playtest.claude.2026@gmail.com' },
    { \$set: { isVerified: true, verifiedAt: new Date() } }
  );
  console.log('Updated:', result.modifiedCount);
  process.exit(0);
});
"
```
