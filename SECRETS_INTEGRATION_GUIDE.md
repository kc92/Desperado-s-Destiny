# Secrets System - Integration Guide

## Step 1: Add Routes to Main Router

Edit `server/src/routes/index.ts`:

### 1. Add import at top of file (line 29):
```typescript
import secretsRoutes from './secrets.routes';
```

### 2. Add route registration (after line 125):
```typescript
// Secrets routes (with API rate limiting)
router.use('/secrets', apiRateLimiter, secretsRoutes);
```

**Complete Integration:**
```typescript
import { Router } from 'express';
// ... existing imports ...
import worldRoutes from './world.routes';
import secretsRoutes from './secrets.routes';  // ADD THIS
import { apiRateLimiter } from '../middleware';

const router = Router();

// ... existing routes ...

// World routes (with API rate limiting)
router.use('/world', apiRateLimiter, worldRoutes);

// Secrets routes (with API rate limiting)  // ADD THIS
router.use('/secrets', apiRateLimiter, secretsRoutes);  // ADD THIS

export default router;
```

## Step 2: Initialize Starter Secrets

Create a seed script or add to existing seed script:

### Option A: Standalone Seed Script
Create `server/src/seeds/secrets.seed.ts`:

```typescript
import mongoose from 'mongoose';
import { SecretDefinition, STARTER_SECRETS } from '../models/Secret.model';
import config from '../config';

async function seedSecrets() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Check if secrets already exist
    const count = await SecretDefinition.countDocuments();

    if (count === 0) {
      await SecretDefinition.insertMany(STARTER_SECRETS);
      console.log(`Seeded ${STARTER_SECRETS.length} starter secrets`);
    } else {
      console.log(`${count} secrets already exist. Skipping seed.`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding secrets:', error);
    process.exit(1);
  }
}

seedSecrets();
```

Run: `npm run seed:secrets`

### Option B: Add to Server Startup
In `server/src/server.ts`, add initialization:

```typescript
import { SecretDefinition, STARTER_SECRETS } from './models/Secret.model';

// After database connection
async function initializeSecrets() {
  const count = await SecretDefinition.countDocuments();
  if (count === 0) {
    await SecretDefinition.insertMany(STARTER_SECRETS);
    console.log(`Initialized ${STARTER_SECRETS.length} starter secrets`);
  }
}

// Call after successful DB connection
await initializeSecrets();
```

## Step 3: Test the Implementation

### 1. Test Secret Listing
```bash
curl -X GET http://localhost:5000/api/secrets/types \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-character-id: YOUR_CHARACTER_ID"
```

### 2. Test Secret Discovery
```bash
curl -X GET http://localhost:5000/api/secrets/discovered \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-character-id: YOUR_CHARACTER_ID"
```

### 3. Test Location Secrets
```bash
curl -X GET http://localhost:5000/api/secrets/location/dusty_saloon \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-character-id: YOUR_CHARACTER_ID"
```

### 4. Test Secret Unlock Check
```bash
curl -X GET http://localhost:5000/api/secrets/check/saloon_backroom \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-character-id: YOUR_CHARACTER_ID"
```

### 5. Test Unlocking a Secret
```bash
curl -X POST http://localhost:5000/api/secrets/unlock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-character-id: YOUR_CHARACTER_ID" \
  -H "Content-Type: application/json" \
  -d '{"secretId": "saloon_backroom"}'
```

## Step 4: Frontend Integration

### Example React/TypeScript Component

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Secret {
  secretId: string;
  name: string;
  description: string;
  type: string;
  rewards: any[];
}

interface LocationSecretsData {
  discovered: Secret[];
  hidden: number;
  hints: Array<{ secretId: string; hint: string }>;
}

function LocationSecrets({ locationId }: { locationId: string }) {
  const [secrets, setSecrets] = useState<LocationSecretsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecrets();
  }, [locationId]);

  async function loadSecrets() {
    try {
      const response = await axios.get(
        `/api/secrets/location/${locationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-character-id': characterId
          }
        }
      );
      setSecrets(response.data.data);
    } catch (error) {
      console.error('Failed to load secrets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function unlockSecret(secretId: string) {
    try {
      const response = await axios.post(
        '/api/secrets/unlock',
        { secretId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-character-id': characterId
          }
        }
      );

      if (response.data.success) {
        alert(response.data.data.message);
        loadSecrets(); // Reload
      }
    } catch (error) {
      console.error('Failed to unlock secret:', error);
    }
  }

  if (loading) return <div>Loading secrets...</div>;
  if (!secrets) return null;

  return (
    <div className="location-secrets">
      <h3>Secrets at this Location</h3>

      {secrets.discovered.length > 0 && (
        <div className="discovered-secrets">
          <h4>Discovered ({secrets.discovered.length})</h4>
          {secrets.discovered.map(secret => (
            <div key={secret.secretId} className="secret-card discovered">
              <h5>{secret.name}</h5>
              <p>{secret.description}</p>
              <span className="badge">{secret.type}</span>
            </div>
          ))}
        </div>
      )}

      {secrets.hidden > 0 && (
        <div className="hidden-secrets">
          <p>{secrets.hidden} secret{secrets.hidden > 1 ? 's' : ''} remaining...</p>
        </div>
      )}

      {secrets.hints.length > 0 && (
        <div className="secret-hints">
          <h4>Mysterious Hints</h4>
          {secrets.hints.map(hint => (
            <div key={hint.secretId} className="hint">
              <p>{hint.hint}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Step 5: Add Notification System

Create a service to check for newly qualified secrets after major actions:

```typescript
// In your character service or game loop
async function checkNewSecrets(characterId: string) {
  try {
    const response = await axios.get('/api/secrets/progress', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-character-id': characterId
      }
    });

    if (response.data.data.count > 0) {
      // Show notification to player
      showNotification({
        type: 'secret',
        message: response.data.data.message,
        secrets: response.data.data.secrets
      });
    }
  } catch (error) {
    console.error('Failed to check secret progress:', error);
  }
}

// Call after:
// - Level ups
// - Quest completions
// - Item acquisitions
// - Faction reputation changes
```

## Step 6: Database Indexes (Already Created)

The following indexes are automatically created when the models are loaded:

- `CharacterSecret.characterId + secretId` (unique)
- `CharacterSecret.characterId + discoveredAt`
- `SecretDefinition.locationId + isActive`
- `SecretDefinition.npcId + isActive`
- `SecretDefinition.type + isActive`
- `SecretDefinition.secretId` (unique)

No manual index creation needed!

## Step 7: Future Enhancements

### NPC Trust System (Required)
The secrets service currently returns `true` for NPC trust checks. Implement:

```typescript
// In Character model, add:
npcTrust: Map<string, number>

// Methods:
getTrustLevel(npcId: string): number
increaseTrust(npcId: string, amount: number): void
decreaseTrust(npcId: string, amount: number): void
```

### Location Visit Tracking (Required)
Track location visits for secrets:

```typescript
// In Character model, add:
locationVisits: Map<string, number>

// Methods:
recordLocationVisit(locationId: string): void
getVisitCount(locationId: string): number
```

### Achievement Service Integration
Already prepared in the code:

```typescript
// The service dynamically imports achievement service
const { AchievementService } = await import('./achievement.service');
await AchievementService.checkAndGrantAchievement(
  characterId,
  achievementType
);
```

Create `AchievementService.checkAndGrantAchievement()` method.

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/secrets/types` | GET | Get all secret types |
| `/api/secrets/stats` | GET | Character's statistics |
| `/api/secrets/progress` | GET | Check newly qualified |
| `/api/secrets/discovered` | GET | All discovered secrets |
| `/api/secrets/type/:type` | GET | Secrets by type |
| `/api/secrets/location/:locationId` | GET | Location secrets |
| `/api/secrets/npc/:npcId` | GET | NPC secrets |
| `/api/secrets/check/:secretId` | GET | Check unlock eligibility |
| `/api/secrets/:secretId` | GET | Secret details |
| `/api/secrets/unlock` | POST | Unlock a secret |

## Testing Checklist

- [ ] Routes properly registered in main router
- [ ] Starter secrets seeded in database
- [ ] Can retrieve secret types
- [ ] Can check unlock requirements
- [ ] Can unlock secrets and receive rewards
- [ ] Gold properly tracked with transaction
- [ ] XP properly added to character
- [ ] Items properly added to inventory
- [ ] Repeatable secrets respect cooldowns
- [ ] Time-based secrets work correctly
- [ ] Faction requirements validated
- [ ] Level requirements validated
- [ ] Quest completion requirements work
- [ ] Secret chains work (prerequisite secrets)
- [ ] Statistics endpoint returns correct data

## Common Issues & Solutions

### Issue: "Secret not found"
**Solution**: Ensure starter secrets are seeded in database

### Issue: "Cannot unlock secret" even when qualified
**Solution**: Check requirement implementation, especially NPC trust and location visits

### Issue: Rewards not granted
**Solution**: Check character model has all necessary methods (addGold, addExperience)

### Issue: Routes return 404
**Solution**: Ensure routes are registered in `server/src/routes/index.ts`

---

**Ready to integrate!** Follow these steps in order for smooth integration.
