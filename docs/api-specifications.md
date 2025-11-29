# DESPERADOS DESTINY - API SPECIFICATIONS
## REST API & Socket.io Event Catalog

**Version:** 1.0
**Last Updated:** November 15, 2025
**Status:** Phase 0.75 - Foundation Planning
**Base URL:** `https://api.desperados-destiny.com/v1`

---

## TABLE OF CONTENTS

1. [API Architecture](#api-architecture)
2. [Authentication](#authentication)
3. [REST API Endpoints](#rest-api-endpoints)
   - [Auth Endpoints](#auth-endpoints)
   - [Character Endpoints](#character-endpoints)
   - [Skills Endpoints](#skills-endpoints)
   - [Combat Endpoints](#combat-endpoints)
   - [Gang Endpoints](#gang-endpoints)
   - [Territory Endpoints](#territory-endpoints)
   - [Economy Endpoints](#economy-endpoints)
   - [Social Endpoints](#social-endpoints)
   - [Quest Endpoints](#quest-endpoints)
   - [Admin Endpoints](#admin-endpoints)
4. [Socket.io Events](#socketio-events)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Versioning Strategy](#versioning-strategy)

---

## API ARCHITECTURE

### Technology Stack
- **Framework:** Express.js 4.x
- **Real-time:** Socket.io 4.x
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Joi or Zod
- **Documentation:** OpenAPI/Swagger 3.0
- **Rate Limiting:** express-rate-limit + Redis

### Design Principles
- **RESTful:** Resources represented as nouns, HTTP verbs for actions
- **Stateless:** JWT-based authentication (no server-side session state)
- **Idempotent:** GET, PUT, DELETE operations are idempotent
- **Versioned:** `/v1/` prefix allows future API evolution
- **Consistent:** Standard response formats across all endpoints

### Standard Response Format

#### Success Response
```json
{
  "success": true,
  "data": { /* response payload */ },
  "message": "Operation completed successfully",
  "timestamp": "2025-11-15T10:30:00.000Z"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_ENERGY",
    "message": "You don't have enough energy for this action",
    "details": {
      "required": 25,
      "available": 10
    }
  },
  "timestamp": "2025-11-15T10:30:00.000Z"
}
```

### HTTP Status Codes
- `200 OK` - Successful GET/PUT/DELETE
- `201 Created` - Successful POST (resource created)
- `204 No Content` - Successful DELETE (no response body)
- `400 Bad Request` - Invalid input/validation error
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource conflict (e.g., duplicate name)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Maintenance mode

---

## AUTHENTICATION

### JWT Token Structure

#### Access Token (Short-lived: 15 minutes)
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "characterId": "507f1f77bcf86cd799439012",
  "premiumTier": "premium",
  "iat": 1700000000,
  "exp": 1700000900
}
```

#### Refresh Token (Long-lived: 30 days)
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "type": "refresh",
  "iat": 1700000000,
  "exp": 1702592000
}
```

### Authentication Flow

1. **Login:** POST `/auth/login` → Returns access token + refresh token
2. **Protected Requests:** Include `Authorization: Bearer <access_token>` header
3. **Token Refresh:** POST `/auth/refresh` with refresh token → New access token
4. **Logout:** POST `/auth/logout` → Invalidate tokens

### Authorization Levels

- **Public:** No authentication required
- **Authenticated:** Valid JWT required
- **Premium:** Valid JWT + `premiumTier: 'premium'`
- **Gang Member:** Valid JWT + member of specified gang
- **Gang Officer:** Valid JWT + officer/leader rank in gang
- **Admin:** Valid JWT + admin role

---

## REST API ENDPOINTS

---

## AUTH ENDPOINTS

### POST `/auth/register`
**Description:** Create new user account
**Authorization:** Public
**Rate Limit:** 5 requests/hour per IP

**Request Body:**
```json
{
  "email": "outlaw@example.com",
  "password": "SecureP@ssw0rd",
  "gdprConsent": true,
  "marketingConsent": false
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "outlaw@example.com",
    "emailVerified": false
  },
  "message": "Account created. Check your email for verification link."
}
```

**Errors:**
- `400` - Invalid email format, weak password, missing GDPR consent
- `409` - Email already registered

---

### POST `/auth/verify-email`
**Description:** Verify email address
**Authorization:** Public

**Request Body:**
```json
{
  "token": "abc123xyz789verificationtoken"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Email verified successfully. You can now create a character."
}
```

**Errors:**
- `400` - Invalid or expired token
- `404` - Token not found

---

### POST `/auth/login`
**Description:** Authenticate user
**Authorization:** Public
**Rate Limit:** 10 requests/15 minutes per IP

**Request Body:**
```json
{
  "email": "outlaw@example.com",
  "password": "SecureP@ssw0rd",
  "twoFactorCode": "123456"  // Optional, if 2FA enabled
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "507f1f77bcf86cd799439011",
      "email": "outlaw@example.com",
      "premiumTier": "free",
      "characterId": "507f1f77bcf86cd799439012"
    }
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `403` - Account suspended/banned, email not verified
- `429` - Too many failed login attempts (account locked 15 minutes)

---

### POST `/auth/refresh`
**Description:** Refresh access token
**Authorization:** Refresh token in body

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST `/auth/logout`
**Description:** Invalidate current session
**Authorization:** Authenticated

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST `/auth/request-password-reset`
**Description:** Request password reset email
**Authorization:** Public
**Rate Limit:** 3 requests/hour per IP

**Request Body:**
```json
{
  "email": "outlaw@example.com"
}
```

**Response:** `200 OK` (always, to prevent email enumeration)
```json
{
  "success": true,
  "message": "If that email exists, a reset link has been sent."
}
```

---

### POST `/auth/reset-password`
**Description:** Reset password with token
**Authorization:** Public

**Request Body:**
```json
{
  "token": "resettoken123",
  "newPassword": "NewSecureP@ssw0rd"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successfully. Please log in."
}
```

---

## CHARACTER ENDPOINTS

### POST `/characters`
**Description:** Create new character
**Authorization:** Authenticated (email verified, no existing character)
**Rate Limit:** 1 request/day per user

**Request Body:**
```json
{
  "name": "Wild Bill",
  "faction": "frontera",
  "avatar": "avatar_01"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "characterId": "507f1f77bcf86cd799439012",
    "name": "Wild Bill",
    "faction": "frontera",
    "level": 1,
    "energy": {
      "current": 150,
      "max": 150
    }
  }
}
```

**Errors:**
- `400` - Invalid faction, name too short/long, profanity detected
- `409` - Character name already taken, user already has character

---

### GET `/characters/:characterId`
**Description:** Get character profile
**Authorization:** Public (basic info) | Authenticated (full info if own character)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "characterId": "507f1f77bcf86cd799439012",
    "name": "Wild Bill",
    "faction": "frontera",
    "level": 25,
    "avatar": "avatar_01",
    "title": "The Quick Draw",
    "bio": "Fastest gun in the Sangre Territory",
    "gang": {
      "gangId": "507f1f77bcf86cd799439015",
      "name": "The Desperados",
      "tag": "[DESP]",
      "rank": "member"
    },
    "stats": {
      "duelsWon": 47,
      "duelsLost": 12,
      "crimesSucceeded": 156,
      "territoriesHeld": 3
    },
    "reputation": {
      "settler": -250,
      "nahi": 50,
      "frontera": 800
    },
    "createdAt": "2025-10-15T12:00:00.000Z",
    "lastActive": "2025-11-15T10:25:00.000Z"
  }
}
```

**Private Fields (only if requesting own character):**
```json
{
  "energy": {
    "current": 125,
    "max": 150,
    "regenRate": 5,
    "nextRegen": "2025-11-15T11:00:00.000Z"
  },
  "health": {
    "current": 85,
    "max": 100
  },
  "goldDollars": 12450,
  "inHospital": false,
  "inJail": false
}
```

---

### PATCH `/characters/:characterId`
**Description:** Update character (bio, avatar, etc.)
**Authorization:** Authenticated (must own character)

**Request Body:**
```json
{
  "bio": "New bio text",
  "avatar": "avatar_05"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "characterId": "507f1f77bcf86cd799439012",
    "bio": "New bio text",
    "avatar": "avatar_05"
  }
}
```

**Errors:**
- `400` - Bio too long (>1000 chars), invalid avatar ID
- `403` - Not your character

---

### DELETE `/characters/:characterId`
**Description:** Delete character (GDPR compliance)
**Authorization:** Authenticated (must own character)

**Request Body:**
```json
{
  "confirmPassword": "SecureP@ssw0rd",
  "confirmDeletion": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Character deletion scheduled. You have 30 days to cancel."
}
```

---

## SKILLS ENDPOINTS

### GET `/characters/:characterId/skills`
**Description:** Get all character skills
**Authorization:** Public (basic) | Authenticated (detailed if own character)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "skills": [
      {
        "skillId": "gun_fighting",
        "skillName": "Gun Fighting",
        "skillCategory": "combat",
        "level": 45,
        "experience": 12500,
        "nextLevelAt": 13000,
        "suitBonus": {
          "clubs": 28.75
        }
      },
      {
        "skillId": "lockpicking",
        "skillName": "Lockpicking",
        "skillCategory": "criminal",
        "level": 32,
        "experience": 8200,
        "suitBonus": {
          "spades": 19.5
        }
      }
      // ... more skills
    ],
    "activeTraining": {
      "skillId": "gun_fighting",
      "startedAt": "2025-11-15T08:00:00.000Z",
      "completesAt": "2025-11-16T02:00:00.000Z",
      "targetLevel": 46,
      "progress": 0.35  // 35% complete
    }
  }
}
```

---

### POST `/characters/:characterId/skills/train`
**Description:** Start training a skill
**Authorization:** Authenticated (must own character)

**Request Body:**
```json
{
  "skillId": "horse_riding",
  "targetLevel": 25
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "skillId": "horse_riding",
    "currentLevel": 24,
    "targetLevel": 25,
    "startedAt": "2025-11-15T10:30:00.000Z",
    "completesAt": "2025-11-15T18:30:00.000Z",
    "durationSeconds": 28800
  }
}
```

**Errors:**
- `400` - Invalid skill ID, target level lower than current, already max level
- `409` - Already training another skill

---

### POST `/characters/:characterId/skills/cancel-training`
**Description:** Cancel active skill training
**Authorization:** Authenticated (must own character)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Skill training cancelled. No progress was saved."
}
```

---

### POST `/characters/:characterId/skills/complete-training`
**Description:** Claim completed skill level (cron also auto-completes)
**Authorization:** Authenticated (must own character)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "skillId": "gun_fighting",
    "oldLevel": 45,
    "newLevel": 46,
    "newSuitBonus": {
      "clubs": 29.5
    }
  },
  "message": "Congratulations! Your Gun Fighting skill is now level 46."
}
```

**Errors:**
- `400` - Training not yet complete
- `404` - No active training

---

### POST `/characters/:characterId/skills/respec`
**Description:** Reset all skills (costs gold or premium tokens)
**Authorization:** Authenticated (must own character)

**Request Body:**
```json
{
  "confirmRespec": true,
  "paymentMethod": "free_respec"  // or "gold" or "premium_token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "skillsReset": 23,
    "refundedGold": 50000,
    "freeRespecsRemaining": 0,
    "totalCost": 0
  },
  "message": "All skills reset to level 1. Refunded gold deposited."
}
```

**Errors:**
- `400` - No free respecs remaining, insufficient gold
- `403` - Training in progress (must cancel first)

---

## COMBAT ENDPOINTS

### POST `/combat/duel`
**Description:** Challenge player to duel
**Authorization:** Authenticated
**Energy Cost:** 25

**Request Body:**
```json
{
  "targetCharacterId": "507f1f77bcf86cd799439013"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "combatId": "507f1f77bcf86cd799439020",
    "combatType": "duel",
    "attacker": {
      "characterId": "507f1f77bcf86cd799439012",
      "name": "Wild Bill",
      "level": 25
    },
    "defender": {
      "characterId": "507f1f77bcf86cd799439013",
      "name": "Doc Holliday",
      "level": 28
    },
    "destinyDeck": {
      "attackerHand": ["A♠", "K♠", "Q♠", "J♠", "10♠"],
      "defenderHand": ["7♣", "7♥", "3♦", "2♣", "K♦"],
      "attackerHandRank": "royal_flush",
      "defenderHandRank": "pair",
      "attackerSuitBonuses": {
        "clubs": 28.75,
        "spades": 22.5,
        "hearts": 15.0,
        "diamonds": 10.0
      },
      "defenderSuitBonuses": {
        "clubs": 35.0,
        "spades": 18.0,
        "hearts": 25.0,
        "diamonds": 12.0
      },
      "attackerTotalScore": 485.5,
      "defenderTotalScore": 120.0
    },
    "winner": "507f1f77bcf86cd799439012",
    "loser": "507f1f77bcf86cd799439013",
    "damage": 55,
    "experienceGained": {
      "winner": 250,
      "loser": 50
    },
    "loot": {
      "goldDollars": 150
    },
    "consequences": {
      "loserToHospital": true,
      "hospitalDuration": 30
    }
  },
  "message": "Victory! Doc Holliday is in the hospital for 30 minutes."
}
```

**Errors:**
- `400` - Cannot duel yourself, target in hospital/jail, invalid target
- `403` - Insufficient energy, attacker in hospital/jail
- `404` - Target character not found

---

### POST `/combat/crime`
**Description:** Attempt a crime (NPC target)
**Authorization:** Authenticated
**Energy Cost:** Varies by crime type

**Request Body:**
```json
{
  "crimeType": "rob_bank",
  "location": "red_gulch"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "crimeType": "rob_bank",
    "succeeded": true,
    "destinyDeck": {
      "hand": ["K♠", "Q♠", "J♠", "10♠", "9♠"],
      "handRank": "straight_flush",
      "suitBonuses": {
        "spades": 28.75
      },
      "totalScore": 310.5,
      "requiredScore": 200
    },
    "rewards": {
      "goldDollars": 5000,
      "experience": 500,
      "reputationChange": {
        "frontera": 25,
        "settler": -50
      }
    },
    "energyCost": 50
  },
  "message": "You successfully robbed the Red Gulch Bank! $5,000 stolen."
}
```

**Failed Crime Response:**
```json
{
  "success": true,
  "data": {
    "crimeType": "rob_bank",
    "succeeded": false,
    "destinyDeck": {
      "hand": ["7♣", "5♥", "3♦", "2♣", "K♦"],
      "handRank": "high_card",
      "totalScore": 45.0,
      "requiredScore": 200
    },
    "consequences": {
      "arrested": true,
      "jailTime": 60,
      "fine": 500
    },
    "energyCost": 50
  },
  "message": "You failed to rob the bank and were arrested! 60 minutes in jail."
}
```

**Errors:**
- `400` - Invalid crime type or location
- `403` - Insufficient energy, in hospital/jail

---

### GET `/combat/history`
**Description:** Get combat history
**Authorization:** Authenticated

**Query Parameters:**
- `characterId` (optional) - Filter by specific character
- `combatType` (optional) - Filter by type
- `limit` (default: 20, max: 100)
- `offset` (default: 0)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "combats": [
      {
        "combatId": "507f1f77bcf86cd799439020",
        "combatType": "duel",
        "timestamp": "2025-11-15T10:30:00.000Z",
        "attacker": {
          "characterId": "507f1f77bcf86cd799439012",
          "name": "Wild Bill"
        },
        "defender": {
          "characterId": "507f1f77bcf86cd799439013",
          "name": "Doc Holliday"
        },
        "winner": "507f1f77bcf86cd799439012",
        "damage": 55
      }
      // ... more combats
    ],
    "pagination": {
      "total": 156,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

## GANG ENDPOINTS

### POST `/gangs`
**Description:** Create new gang
**Authorization:** Authenticated (not already in gang)
**Cost:** 5000 gold dollars

**Request Body:**
```json
{
  "name": "The Desperados",
  "tag": "DESP",
  "faction": "frontera",
  "description": "We ride together, we die together",
  "recruitmentOpen": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "gangId": "507f1f77bcf86cd799439015",
    "name": "The Desperados",
    "tag": "[DESP]",
    "faction": "frontera",
    "leaderId": "507f1f77bcf86cd799439012",
    "memberCount": 1,
    "createdAt": "2025-11-15T10:30:00.000Z"
  },
  "message": "Gang created! You are now the leader."
}
```

**Errors:**
- `400` - Invalid name/tag, profanity detected
- `403` - Insufficient gold, already in gang
- `409` - Gang name or tag already taken

---

### GET `/gangs/:gangId`
**Description:** Get gang details
**Authorization:** Public

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "gangId": "507f1f77bcf86cd799439015",
    "name": "The Desperados",
    "tag": "[DESP]",
    "faction": "frontera",
    "description": "We ride together, we die together",
    "banner": "banner_05",
    "recruitmentOpen": true,
    "leaderId": "507f1f77bcf86cd799439012",
    "leaderName": "Wild Bill",
    "officers": [
      {
        "characterId": "507f1f77bcf86cd799439016",
        "name": "Annie Oakley"
      }
    ],
    "memberCount": 18,
    "memberLimit": 25,
    "controlledTerritories": ["silver_mine_01", "trading_post_02"],
    "stats": {
      "totalWars": 5,
      "warsWon": 3,
      "warsLost": 2,
      "territoriesConquered": 7,
      "totalWealth": 125000
    },
    "createdAt": "2025-10-01T12:00:00.000Z"
  }
}
```

---

### GET `/gangs/:gangId/members`
**Description:** Get gang member list
**Authorization:** Public

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "characterId": "507f1f77bcf86cd799439012",
        "name": "Wild Bill",
        "level": 25,
        "rank": "leader",
        "joinedAt": "2025-10-01T12:00:00.000Z",
        "contributedGold": 15000,
        "lastActive": "2025-11-15T10:25:00.000Z"
      },
      {
        "characterId": "507f1f77bcf86cd799439016",
        "name": "Annie Oakley",
        "level": 32,
        "rank": "officer",
        "joinedAt": "2025-10-02T08:15:00.000Z",
        "contributedGold": 22000,
        "lastActive": "2025-11-15T09:50:00.000Z"
      }
      // ... more members
    ],
    "memberCount": 18
  }
}
```

---

### POST `/gangs/:gangId/join`
**Description:** Request to join gang
**Authorization:** Authenticated (not in gang)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Join request sent to The Desperados leadership."
}
```

**Auto-Accept (if recruitmentOpen: true):**
```json
{
  "success": true,
  "data": {
    "gangId": "507f1f77bcf86cd799439015",
    "rank": "member",
    "joinedAt": "2025-11-15T10:30:00.000Z"
  },
  "message": "Welcome to The Desperados!"
}
```

**Errors:**
- `403` - Already in gang, gang full, faction mismatch
- `404` - Gang not found

---

### POST `/gangs/:gangId/leave`
**Description:** Leave gang
**Authorization:** Authenticated (must be member)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "You left The Desperados."
}
```

**Errors:**
- `400` - Cannot leave as leader (must transfer leadership or disband)
- `403` - Not a member

---

### POST `/gangs/:gangId/kick`
**Description:** Kick member (officers/leader only)
**Authorization:** Authenticated (must be officer/leader)

**Request Body:**
```json
{
  "targetCharacterId": "507f1f77bcf86cd799439017",
  "reason": "Inactive for 30 days"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Player kicked from gang."
}
```

**Errors:**
- `403` - Not authorized, cannot kick leader/officer (unless you're leader)
- `404` - Target not in gang

---

### POST `/gangs/:gangId/vault/deposit`
**Description:** Deposit gold to gang vault
**Authorization:** Authenticated (must be member)

**Request Body:**
```json
{
  "goldDollars": 5000
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "deposited": 5000,
    "newVaultTotal": 45000,
    "yourContribution": 20000
  }
}
```

**Errors:**
- `400` - Amount must be positive, insufficient gold
- `403` - Not a member

---

### POST `/gangs/:gangId/vault/withdraw`
**Description:** Withdraw gold from vault (leader/officers only)
**Authorization:** Authenticated (must be officer/leader)

**Request Body:**
```json
{
  "goldDollars": 3000,
  "reason": "Purchasing territory defense upgrades"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "withdrawn": 3000,
    "newVaultTotal": 42000
  }
}
```

**Errors:**
- `400` - Amount exceeds vault balance
- `403` - Not authorized

---

### DELETE `/gangs/:gangId`
**Description:** Disband gang (leader only)
**Authorization:** Authenticated (must be leader)

**Request Body:**
```json
{
  "confirmDisbandment": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "The Desperados has been disbanded. Vault funds distributed to members."
}
```

---

## TERRITORY ENDPOINTS

### GET `/territories`
**Description:** Get all territories with control status
**Authorization:** Public

**Query Parameters:**
- `location` (optional) - Filter by region
- `controlledBy` (optional) - Filter by gang ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "territories": [
      {
        "territoryId": "silver_mine_01",
        "name": "Silver Creek Mine",
        "location": "sangre_canyon",
        "territoryType": "mine",
        "controlledBy": {
          "gangId": "507f1f77bcf86cd799439015",
          "gangName": "The Desperados",
          "gangTag": "[DESP]"
        },
        "controlStrength": 75,
        "resources": {
          "goldPerDay": 500
        },
        "strategicValue": 7,
        "capturedAt": "2025-11-10T14:00:00.000Z"
      }
      // ... more territories
    ]
  }
}
```

---

### GET `/territories/:territoryId`
**Description:** Get territory details
**Authorization:** Public

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "territoryId": "silver_mine_01",
    "name": "Silver Creek Mine",
    "location": "sangre_canyon",
    "territoryType": "mine",
    "controlledBy": {
      "gangId": "507f1f77bcf86cd799439015",
      "gangName": "The Desperados"
    },
    "controlStrength": 75,
    "resources": {
      "goldPerDay": 500,
      "itemDrops": [
        {
          "itemType": "silver_ore",
          "dropChance": 0.25
        }
      ]
    },
    "strategicValue": 7,
    "defenseBonus": 15,
    "adjacentTerritories": ["trading_post_02", "outlaw_camp_01"],
    "recentBattles": [
      {
        "attackerId": "507f1f77bcf86cd799439018",
        "attackerName": "The Lawmen",
        "defenderId": "507f1f77bcf86cd799439015",
        "defenderName": "The Desperados",
        "timestamp": "2025-11-12T16:30:00.000Z",
        "winner": "507f1f77bcf86cd799439015"
      }
    ]
  }
}
```

---

### POST `/territories/:territoryId/attack`
**Description:** Attack territory (gang action)
**Authorization:** Authenticated (must be gang member)
**Energy Cost:** 100 per participant

**Request Body:**
```json
{
  "participantIds": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439016",
    "507f1f77bcf86cd799439017"
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "battleId": "507f1f77bcf86cd799439025",
    "territoryId": "silver_mine_01",
    "attacker": {
      "gangId": "507f1f77bcf86cd799439019",
      "gangName": "The Outlaws",
      "participantCount": 3,
      "combinedScore": 1250
    },
    "defender": {
      "gangId": "507f1f77bcf86cd799439015",
      "gangName": "The Desperados",
      "participantCount": 2,
      "combinedScore": 980,
      "defenseBonus": 15
    },
    "winner": "507f1f77bcf86cd799439019",
    "territoryTransferred": true,
    "newOwner": {
      "gangId": "507f1f77bcf86cd799439019",
      "gangName": "The Outlaws"
    },
    "casualties": [
      {
        "characterId": "507f1f77bcf86cd799439012",
        "toHospital": true,
        "hospitalDuration": 45
      }
    ]
  },
  "message": "Victory! Your gang captured Silver Creek Mine."
}
```

**Errors:**
- `400` - Not enough participants, participants not all gang members
- `403` - Insufficient energy for all participants, territory owned by your gang
- `404` - Territory not found

---

## ECONOMY ENDPOINTS

### GET `/shop/items`
**Description:** Get NPC shop inventory
**Authorization:** Public

**Query Parameters:**
- `category` (optional) - 'weapons' | 'armor' | 'consumables' | 'materials' | 'horses'
- `location` (optional) - Filter by shop location

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "itemTemplateId": "colt_45",
        "itemName": "Colt .45 Peacemaker",
        "itemType": "weapon",
        "itemRarity": "common",
        "price": 250,
        "stats": {
          "damage": 15,
          "clubsBonus": 5
        },
        "stock": "unlimited",
        "requiredLevel": 5
      }
      // ... more items
    ]
  }
}
```

---

### POST `/shop/buy`
**Description:** Purchase item from NPC shop
**Authorization:** Authenticated

**Request Body:**
```json
{
  "itemTemplateId": "colt_45",
  "quantity": 1
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "itemId": "507f1f77bcf86cd799439030",
    "itemName": "Colt .45 Peacemaker",
    "quantityPurchased": 1,
    "totalCost": 250,
    "newGoldBalance": 12200
  },
  "message": "Purchased Colt .45 Peacemaker for $250."
}
```

**Errors:**
- `400` - Invalid quantity, item not in shop
- `403` - Insufficient gold, level too low, inventory full

---

### POST `/shop/sell`
**Description:** Sell item to NPC shop
**Authorization:** Authenticated

**Request Body:**
```json
{
  "itemId": "507f1f77bcf86cd799439030"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "itemName": "Colt .45 Peacemaker",
    "sellValue": 125,
    "newGoldBalance": 12325
  },
  "message": "Sold Colt .45 Peacemaker for $125."
}
```

**Errors:**
- `400` - Item not sellable (quest item, bound item)
- `403` - Item currently equipped
- `404` - Item not found or not owned

---

### GET `/economy/leaderboard`
**Description:** Wealth leaderboard
**Authorization:** Public

**Query Parameters:**
- `type` - 'characters' | 'gangs'
- `limit` (default: 10, max: 100)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "characterId": "507f1f77bcf86cd799439040",
        "name": "Richest Bill",
        "goldDollars": 250000,
        "gangName": "The Tycoons"
      }
      // ... more entries
    ]
  }
}
```

---

## SOCIAL ENDPOINTS

### GET `/chat/messages`
**Description:** Get chat history
**Authorization:** Authenticated

**Query Parameters:**
- `channel` - 'global' | 'faction_settler' | 'faction_nahi' | 'faction_frontera' | 'gang_{gangId}' | 'location_{location}'
- `limit` (default: 50, max: 200)
- `before` (optional) - Timestamp for pagination

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "messageId": "507f1f77bcf86cd799439050",
        "channel": "global",
        "authorId": "507f1f77bcf86cd799439012",
        "authorName": "Wild Bill",
        "authorGangTag": "[DESP]",
        "message": "Anyone up for a duel?",
        "messageType": "normal",
        "timestamp": "2025-11-15T10:28:00.000Z"
      }
      // ... more messages
    ],
    "hasMore": true
  }
}
```

---

### POST `/chat/send`
**Description:** Send chat message (REST endpoint for fallback, Socket.io primary)
**Authorization:** Authenticated
**Rate Limit:** 10 messages/minute

**Request Body:**
```json
{
  "channel": "global",
  "message": "Howdy, partners!"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "messageId": "507f1f77bcf86cd799439051",
    "channel": "global",
    "timestamp": "2025-11-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `400` - Message too long (>500 chars), empty message, invalid channel
- `403` - Not authorized for channel (e.g., wrong faction, not gang member)
- `429` - Rate limit exceeded

---

### POST `/chat/report`
**Description:** Report message for moderation
**Authorization:** Authenticated

**Request Body:**
```json
{
  "messageId": "507f1f77bcf86cd799439052",
  "reason": "harassment"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Message reported to moderators."
}
```

---

### GET `/players/search`
**Description:** Search for players
**Authorization:** Authenticated

**Query Parameters:**
- `query` - Name search string
- `faction` (optional)
- `gangId` (optional)
- `limit` (default: 10, max: 50)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "players": [
      {
        "characterId": "507f1f77bcf86cd799439012",
        "name": "Wild Bill",
        "level": 25,
        "faction": "frontera",
        "gangName": "The Desperados",
        "lastActive": "2025-11-15T10:25:00.000Z"
      }
      // ... more results
    ]
  }
}
```

---

## QUEST ENDPOINTS

### GET `/quests`
**Description:** Get character's quests
**Authorization:** Authenticated

**Query Parameters:**
- `status` (optional) - 'active' | 'completed' | 'failed'
- `questType` (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "quests": [
      {
        "questId": "507f1f77bcf86cd799439060",
        "questTemplateId": "tutorial_first_duel",
        "questName": "Your First Duel",
        "questGiver": "Marshal Cooper",
        "questType": "tutorial",
        "status": "active",
        "objectives": [
          {
            "description": "Win a duel",
            "required": 1,
            "current": 0,
            "completed": false
          }
        ],
        "rewards": {
          "goldDollars": 100,
          "experience": 50
        },
        "startedAt": "2025-11-15T09:00:00.000Z"
      }
      // ... more quests
    ]
  }
}
```

---

### POST `/quests/:questId/complete`
**Description:** Claim quest rewards (if objectives complete)
**Authorization:** Authenticated

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "questName": "Your First Duel",
    "rewards": {
      "goldDollars": 100,
      "experience": 50,
      "items": ["leather_vest"],
      "reputationChanges": {
        "settler": 10
      }
    },
    "newGoldBalance": 12550,
    "newExperience": 5050
  },
  "message": "Quest completed! Rewards claimed."
}
```

**Errors:**
- `400` - Quest not complete, rewards already claimed
- `404` - Quest not found

---

### POST `/quests/:questId/abandon`
**Description:** Abandon active quest
**Authorization:** Authenticated

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Quest abandoned."
}
```

**Errors:**
- `400` - Cannot abandon main story quests
- `404` - Quest not found or not active

---

## ADMIN ENDPOINTS

### GET `/admin/users`
**Description:** Get user list (admin only)
**Authorization:** Admin

**Query Parameters:**
- `accountStatus` (optional)
- `premiumTier` (optional)
- `limit` (default: 50, max: 500)
- `offset` (default: 0)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "email": "user@example.com",
        "accountStatus": "active",
        "premiumTier": "premium",
        "characterName": "Wild Bill",
        "createdAt": "2025-10-15T12:00:00.000Z",
        "lastLogin": "2025-11-15T10:00:00.000Z"
      }
      // ... more users
    ],
    "pagination": {
      "total": 5420,
      "limit": 50,
      "offset": 0
    }
  }
}
```

---

### PATCH `/admin/users/:userId/suspend`
**Description:** Suspend user account (admin only)
**Authorization:** Admin

**Request Body:**
```json
{
  "reason": "Harassment and toxic behavior",
  "durationDays": 7
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "accountStatus": "suspended",
    "suspensionExpires": "2025-11-22T10:30:00.000Z"
  },
  "message": "User suspended for 7 days."
}
```

---

### PATCH `/admin/users/:userId/ban`
**Description:** Permanently ban user (admin only)
**Authorization:** Admin

**Request Body:**
```json
{
  "reason": "Cheating, multi-accounting, previous warnings ignored"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User permanently banned."
}
```

---

### DELETE `/admin/chat/messages/:messageId`
**Description:** Delete chat message (admin/mod only)
**Authorization:** Admin or Moderator

**Request Body:**
```json
{
  "reason": "Hate speech"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Message deleted."
}
```

---

### GET `/admin/logs`
**Description:** Get admin action logs
**Authorization:** Admin

**Query Parameters:**
- `adminId` (optional)
- `action` (optional)
- `limit` (default: 100, max: 500)
- `offset` (default: 0)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "logId": "507f1f77bcf86cd799439070",
        "adminId": "507f1f77bcf86cd799439099",
        "action": "ban_user",
        "targetType": "user",
        "targetId": "507f1f77bcf86cd799439011",
        "reason": "Cheating",
        "timestamp": "2025-11-15T09:30:00.000Z"
      }
      // ... more logs
    ]
  }
}
```

---

## SOCKET.IO EVENTS

### Connection & Authentication

**Client → Server: `authenticate`**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Server → Client: `authenticated`**
```json
{
  "success": true,
  "characterId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Server → Client: `authentication_error`**
```json
{
  "error": "Invalid token"
}
```

---

### Real-Time Chat

**Client → Server: `chat:send`**
```json
{
  "channel": "global",
  "message": "Howdy, partners!"
}
```

**Server → All Clients in Channel: `chat:message`**
```json
{
  "messageId": "507f1f77bcf86cd799439051",
  "channel": "global",
  "authorId": "507f1f77bcf86cd799439012",
  "authorName": "Wild Bill",
  "authorGangTag": "[DESP]",
  "message": "Howdy, partners!",
  "timestamp": "2025-11-15T10:30:00.000Z"
}
```

**Server → Client: `chat:error`**
```json
{
  "error": "Rate limit exceeded. Wait 30 seconds."
}
```

---

### Energy Regeneration

**Server → Client: `energy:update`**
```json
{
  "energy": {
    "current": 130,
    "max": 150,
    "nextRegen": "2025-11-15T11:00:00.000Z"
  }
}
```

---

### Combat Notifications

**Server → Both Combatants: `combat:duel_result`**
```json
{
  "combatId": "507f1f77bcf86cd799439020",
  "winnerId": "507f1f77bcf86cd799439012",
  "loserId": "507f1f77bcf86cd799439013",
  "damage": 55,
  "loot": {
    "goldDollars": 150
  }
}
```

**Server → All Online: `combat:announcement`**
```json
{
  "message": "Wild Bill defeated Doc Holliday in a duel!",
  "combatType": "duel",
  "timestamp": "2025-11-15T10:30:00.000Z"
}
```

---

### Gang Events

**Server → Gang Members: `gang:member_joined`**
```json
{
  "gangId": "507f1f77bcf86cd799439015",
  "characterId": "507f1f77bcf86cd799439020",
  "characterName": "Jesse James",
  "timestamp": "2025-11-15T10:30:00.000Z"
}
```

**Server → Gang Members: `gang:member_left`**
```json
{
  "gangId": "507f1f77bcf86cd799439015",
  "characterId": "507f1f77bcf86cd799439021",
  "characterName": "Billy the Kid",
  "reason": "left",
  "timestamp": "2025-11-15T10:35:00.000Z"
}
```

**Server → Gang Members: `gang:vault_update`**
```json
{
  "gangId": "507f1f77bcf86cd799439015",
  "newBalance": 48000,
  "transactionType": "deposit",
  "amount": 3000,
  "characterName": "Wild Bill"
}
```

---

### Territory Events

**Server → All Online: `territory:captured`**
```json
{
  "territoryId": "silver_mine_01",
  "territoryName": "Silver Creek Mine",
  "newOwner": {
    "gangId": "507f1f77bcf86cd799439015",
    "gangName": "The Desperados"
  },
  "previousOwner": {
    "gangId": "507f1f77bcf86cd799439018",
    "gangName": "The Lawmen"
  },
  "timestamp": "2025-11-15T10:30:00.000Z"
}
```

---

### Training Events

**Server → Client: `training:complete`**
```json
{
  "skillId": "gun_fighting",
  "skillName": "Gun Fighting",
  "newLevel": 46,
  "timestamp": "2025-11-16T02:00:00.000Z"
}
```

---

### System Events

**Server → Client: `system:maintenance_warning`**
```json
{
  "message": "Server maintenance in 15 minutes. Please finish your activities.",
  "maintenanceStart": "2025-11-15T12:00:00.000Z",
  "estimatedDuration": 30
}
```

**Server → All: `system:announcement`**
```json
{
  "message": "New feature unlocked: Spirit Quests now available in Kaiowa Mesa!",
  "timestamp": "2025-11-15T10:00:00.000Z"
}
```

---

## ERROR HANDLING

### Error Code Catalog

```javascript
{
  // Authentication Errors (1000-1099)
  "INVALID_CREDENTIALS": { code: 1001, status: 401 },
  "TOKEN_EXPIRED": { code: 1002, status: 401 },
  "EMAIL_NOT_VERIFIED": { code: 1003, status: 403 },
  "ACCOUNT_SUSPENDED": { code: 1004, status: 403 },
  "ACCOUNT_BANNED": { code: 1005, status: 403 },

  // Validation Errors (1100-1199)
  "INVALID_INPUT": { code: 1101, status: 400 },
  "MISSING_REQUIRED_FIELD": { code: 1102, status: 400 },
  "NAME_TAKEN": { code: 1103, status: 409 },
  "EMAIL_TAKEN": { code: 1104, status: 409 },

  // Resource Errors (1200-1299)
  "CHARACTER_NOT_FOUND": { code: 1201, status: 404 },
  "GANG_NOT_FOUND": { code: 1202, status: 404 },
  "TERRITORY_NOT_FOUND": { code: 1203, status: 404 },
  "ITEM_NOT_FOUND": { code: 1204, status: 404 },

  // Game Logic Errors (1300-1399)
  "INSUFFICIENT_ENERGY": { code: 1301, status: 403 },
  "INSUFFICIENT_GOLD": { code: 1302, status: 403 },
  "IN_HOSPITAL": { code: 1303, status: 403 },
  "IN_JAIL": { code: 1304, status: 403 },
  "ALREADY_TRAINING": { code: 1305, status: 409 },
  "ALREADY_IN_GANG": { code: 1306, status: 409 },
  "GANG_FULL": { code: 1307, status: 403 },
  "INVENTORY_FULL": { code: 1308, status: 403 },
  "LEVEL_TOO_LOW": { code: 1309, status: 403 },

  // Rate Limiting (1400-1499)
  "RATE_LIMIT_EXCEEDED": { code: 1401, status: 429 },
  "TOO_MANY_LOGIN_ATTEMPTS": { code: 1402, status: 429 },

  // Server Errors (1500-1599)
  "INTERNAL_ERROR": { code: 1500, status: 500 },
  "DATABASE_ERROR": { code: 1501, status: 500 },
  "EXTERNAL_SERVICE_ERROR": { code: 1502, status: 503 }
}
```

---

## RATE LIMITING

### Rate Limit Tiers

**IP-Based (Public Endpoints)**
- Registration: 5 requests/hour
- Login: 10 requests/15 minutes
- Password Reset: 3 requests/hour

**User-Based (Authenticated Endpoints)**
- General API: 100 requests/minute
- Chat: 10 messages/minute
- Combat Actions: 20 requests/minute
- Shop Transactions: 30 requests/minute

**Premium Bonus**
- Premium users: +50% rate limits

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1700001600
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please wait before trying again.",
    "retryAfter": 42
  }
}
```

---

## VERSIONING STRATEGY

### API Versioning
- **URL-based:** `/v1/`, `/v2/` prefixes
- **Deprecation:** Minimum 90 days notice before sunset
- **Support:** Current version + 1 previous version maintained

### Deprecation Header
```
Deprecation: Sun, 15 Feb 2026 00:00:00 GMT
Sunset: Sun, 15 May 2026 00:00:00 GMT
Link: <https://docs.desperados-destiny.com/api/migration-v2>; rel="deprecation"
```

### Breaking vs Non-Breaking Changes

**Non-Breaking (Patch/Minor):**
- Adding new endpoints
- Adding optional fields
- Adding new values to enums
- Performance improvements

**Breaking (Major):**
- Removing endpoints
- Removing fields
- Changing field types
- Changing authentication method
- Changing URL structure

---

## TESTING & DOCUMENTATION

### OpenAPI/Swagger
- Full OpenAPI 3.0 spec generated from code
- Interactive documentation at `/api/docs`
- Swagger UI for testing endpoints

### Postman Collection
- Exported collection with all endpoints
- Environment variables for testing
- Pre-configured authentication

### Rate Limit Testing
- Staging environment with relaxed limits
- Test accounts with unlimited rate limits

---

## SECURITY CONSIDERATIONS

### Input Validation
- All inputs validated with Joi/Zod schemas
- SQL/NoSQL injection prevention
- XSS prevention (sanitize all user content)
- CSRF tokens for state-changing operations

### Authentication
- JWT secret rotation every 90 days
- Refresh token rotation on use
- Session invalidation on password change
- IP whitelisting for admin endpoints

### HTTPS Only
- All API traffic over TLS 1.2+
- HSTS headers enforced
- Certificate pinning recommended for mobile apps

### CORS Policy
```javascript
{
  origin: ['https://desperados-destiny.com', 'https://app.desperados-destiny.com'],
  credentials: true,
  maxAge: 86400
}
```

---

## MONITORING & LOGGING

### Metrics to Track
- Request count by endpoint
- Response time percentiles (p50, p95, p99)
- Error rate by error code
- Active WebSocket connections
- Database query performance

### Logging Standards
- **Info:** Successful operations, user actions
- **Warn:** Suspicious behavior, failed validation
- **Error:** Server errors, external service failures
- **Critical:** Database failures, security breaches

### Log Format (JSON)
```json
{
  "timestamp": "2025-11-15T10:30:00.000Z",
  "level": "info",
  "endpoint": "/combat/duel",
  "method": "POST",
  "userId": "507f1f77bcf86cd799439011",
  "characterId": "507f1f77bcf86cd799439012",
  "duration": 245,
  "status": 200,
  "ip": "192.168.1.1"
}
```

---

## NEXT STEPS

- [ ] Implement all REST endpoints with Express.js
- [ ] Set up Socket.io server with authentication
- [ ] Create request validation middleware (Joi/Zod)
- [ ] Implement JWT authentication system
- [ ] Set up rate limiting with Redis
- [ ] Generate OpenAPI/Swagger documentation
- [ ] Create Postman collection
- [ ] Implement error handling middleware
- [ ] Set up API versioning structure
- [ ] Configure CORS and security headers
- [ ] Implement logging and monitoring
- [ ] Write integration tests for all endpoints

---

**Document Status:** ✅ Complete
**Endpoints Defined:** 60+ REST endpoints, 15+ Socket.io events
**Ready for Implementation:** Yes
**Next Phase:** Destiny Deck Algorithm Specification

*— Ezra "Hawk" Hawthorne*
*API Architect*
*November 15, 2025*
