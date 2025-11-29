# Death/Jail System Quick Reference

## For Developers

### Quick Integration Examples

#### 1. Apply Death Penalty (Any Death Type)
```typescript
import { DeathService } from '../services/death.service';
import { DeathType } from '@desperados/shared';

// In your service/controller
const penalty = await DeathService.handleDeath(
  characterId,
  DeathType.COMBAT,  // or ENVIRONMENTAL, EXECUTION, DUEL, PVP
  session  // optional MongoDB session
);

console.log(`Player lost ${penalty.goldLost} gold, ${penalty.xpLost} XP`);
```

#### 2. Send Player to Jail
```typescript
import { JailService } from '../services/jail.service';

await JailService.jailPlayer(
  characterId,
  30,  // 30 minutes
  'bounty_collection',  // reason
  500,  // bail amount (optional)
  true,  // can bail (optional)
  session  // MongoDB session (optional)
);
```

#### 3. Check if Death Should Result in Jail
```typescript
import { DeathService } from '../services/death.service';

const shouldJail = await DeathService.shouldSendToJail(
  character,
  'lawful_npc'  // or 'lawful_player' or 'outlaw'
);

if (shouldJail) {
  const minutes = DeathService.calculateJailSentence(character.wantedLevel);
  await JailService.jailPlayer(characterId, minutes, 'bounty_collection');
}
```

#### 4. Block Jailed Players from Routes
```typescript
// In your route file
import { blockJailedPlayers } from '../middleware/jail.middleware';

router.post('/some-action',
  requireAuth,
  blockJailedPlayers,  // Add this
  asyncHandler(YourController.action)
);
```

#### 5. Turn In Wanted Player
```typescript
import { JailService } from '../services/jail.service';

const result = await JailService.turnInPlayer(
  hunterId,
  targetId
);

// Hunter receives bountyReward gold
// Target goes to jail for jailSentence minutes
```

---

## API Usage Examples

### Check Jail Status
```bash
GET /api/jail/status
Authorization: Bearer <token>
```

### Attempt Escape
```bash
POST /api/jail/escape
Authorization: Bearer <token>
```

### Bribe Guard
```bash
POST /api/jail/bribe
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 300
}
```

### Pay Bail
```bash
POST /api/jail/bail
Authorization: Bearer <token>
Content-Type: application/json

{
  "characterId": "optional-id-to-bail-out-someone-else"
}
```

### Do Prison Labor
```bash
POST /api/jail/activity
Authorization: Bearer <token>
Content-Type: application/json

{
  "activity": "prison_labor"
}
```

### Turn In Wanted Player
```bash
POST /api/jail/turn-in/TARGET_CHARACTER_ID
Authorization: Bearer <token>
```

---

## Death Penalty Reference

| Death Type | Gold | XP | Items | Respawn Delay |
|------------|------|----|----|---------------|
| COMBAT | 10% | 2% | 5% | 5s |
| ENVIRONMENTAL | 5% | 1% | 2% | 3s |
| EXECUTION | 25% | 5% | 10% | 10s |
| DUEL | 15% | 3% | 8% | 5s |
| PVP | 12% | 3% | 7% | 5s |

---

## Jail Activity Reference

| Activity | Gold | XP | Success Rate | Penalty on Fail | Cooldown |
|----------|------|-----|--------------|-----------------|----------|
| Prison Labor | 5-15 | 10-25 | 100% | - | 30 min |
| Escape | - | - | 15-75% | +30 min | 60 min |
| Bribe | Varies | - | 30-90% | -50% gold | 45 min |
| Socialize | - | - | 100% | - | None |
| Wait | - | - | 100% | - | None |

---

## Configuration Quick Access

```typescript
// From @desperados/shared
import {
  JAIL_SENTENCES,
  DEATH_PENALTIES,
  RESPAWN_DELAYS,
  JAIL_ACTIVITIES,
  WANTED_ARREST_THRESHOLD,  // 3
  BOUNTY_TURN_IN_MULTIPLIER  // 1.5x
} from '@desperados/shared';
```

---

## Character Model Methods

```typescript
// Jail status
character.isCurrentlyJailed()  // boolean
character.getRemainingJailTime()  // minutes
character.releaseFromJail()
character.sendToJail(minutes, bailCost)

// Arrest tracking
character.canArrestTarget(targetId)  // boolean
character.recordArrest(targetId)

// Wanted level
character.increaseWantedLevel(amount)
character.decreaseWantedLevel(amount)
character.calculateBounty()  // wantedLevel * 100
character.canBeArrested()  // wantedLevel >= 3
```

---

## Common Patterns

### Pattern 1: Combat Death with Jail Check
```typescript
if (player.hp <= 0) {
  const npc = getNPC();
  const shouldJail = npc.type === 'LAWMAN' &&
    await DeathService.shouldSendToJail(character, 'lawful_npc');

  if (shouldJail) {
    const minutes = DeathService.calculateJailSentence(character.wantedLevel);
    await JailService.jailPlayer(character._id, minutes, 'bounty_collection');
  } else {
    await DeathService.handleDeath(character._id, DeathType.COMBAT);
  }
}
```

### Pattern 2: Protected Route
```typescript
router.post('/steal',
  requireAuth,
  blockJailedPlayers,  // Block if jailed
  asyncHandler(async (req, res) => {
    // Your action logic
  })
);
```

### Pattern 3: Bounty Hunter Gameplay
```typescript
// 1. Defeat wanted player in combat
const combatResult = await CombatService.fight(hunter, target);

// 2. If hunter wins and target is wanted
if (combatResult.winner === hunter && target.wantedLevel >= 3) {
  // 3. Turn in for bounty
  const result = await JailService.turnInPlayer(hunter._id, target._id);
  // Hunter gets result.bountyReward gold
  // Target goes to jail
}
```

### Pattern 4: Gang Bail Out
```typescript
// Gang member paying bail for jailed gang member
const gangMember = await Character.findById(req.character._id);
const jailedMember = await Character.findById(jailedMemberId);

if (gangMember.gangId === jailedMember.gangId) {
  await JailService.payBail(jailedMemberId, gangMember._id);
}
```

---

## Middleware Options

### Option 1: Block All Jailed Players
```typescript
router.use(blockJailedPlayers);  // Blocks all routes in this router
```

### Option 2: Smart Block (Allow Some Routes)
```typescript
router.use(smartJailBlock);  // Allows jail/mail/friends/chat routes
```

### Option 3: Auto-Release Check
```typescript
router.use(autoReleaseCheck);  // Auto-releases expired sentences
```

### Option 4: Per-Route Blocking
```typescript
router.post('/action', requireAuth, blockJailedPlayers, handler);
```

---

## Transaction Sources

Death/Jail related transaction sources:
- `TransactionSource.COMBAT_DEATH` - Gold lost on death
- `TransactionSource.BAIL_PAYMENT` - Bail payment
- `TransactionSource.BRIBE` - Guard bribe
- `TransactionSource.BOUNTY_REWARD` - Turning in criminals
- `TransactionSource.JOB_INCOME` - Prison labor

---

## Testing Checklist

- [ ] Death with 10% gold loss
- [ ] Death with item drops
- [ ] Death by lawman → jail (wanted 3+)
- [ ] Death by outlaw → death penalty
- [ ] Escape attempt success
- [ ] Escape attempt failure (+30 min)
- [ ] Bribe accepted
- [ ] Bribe rejected (lose 50%)
- [ ] Bail payment (self)
- [ ] Bail payment (other)
- [ ] Prison labor rewards
- [ ] Turn-in bounty reward
- [ ] Auto-release on expiration
- [ ] Blocked actions while jailed
- [ ] Allowed actions while jailed

---

## Error Handling

Common errors and solutions:

```typescript
// "Character not found"
// - Verify characterId is valid ObjectId
// - Ensure character exists in database

// "Character is not in jail"
// - Check character.isJailed before jail actions
// - Use character.isCurrentlyJailed() for time-based check

// "Insufficient gold"
// - Check character.gold >= amount before deductions
// - Use GoldService.canAfford()

// "Cannot perform this action while in jail"
// - Blocked by jail middleware
// - Use allowed routes or wait for release

// "Must wait before attempting again"
// - Cooldown not expired
// - Track last attempt times
```

---

## Performance Tips

1. **Use sessions** for atomic operations
2. **Cache jail status** on character object (already loaded)
3. **Batch operations** when processing multiple players
4. **Index queries** on jailedUntil, wantedLevel fields
5. **Lazy load** jail statistics only when needed

---

## Security Checklist

- [x] Ownership validation on all endpoints
- [x] Transaction integrity (MongoDB sessions)
- [x] Cooldown enforcement
- [x] Bail amount validation
- [x] Turn-in cooldown (1 hour per target)
- [ ] Admin authentication for release endpoint
- [ ] Rate limiting on escape attempts
- [ ] Audit logging for jail operations
