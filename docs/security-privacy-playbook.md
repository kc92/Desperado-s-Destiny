# DESPERADOS DESTINY - SECURITY & PRIVACY PLAYBOOK
## Complete Security, GDPR Compliance & Anti-Cheat Guide

**Version:** 1.0
**Last Updated:** November 15, 2025
**Status:** Phase 0.75 - Foundation Planning
**Compliance Target:** GDPR, CCPA, SOC 2 Type II

---

## OVERVIEW

This document provides comprehensive security and privacy specifications for Desperados Destiny, covering:

- **GDPR Compliance** (EU data protection regulation)
- **CCPA Compliance** (California privacy law)
- **Authentication & Authorization**
- **Data Encryption** (at rest, in transit, field-level)
- **Anti-Cheat Measures**
- **Input Validation & Injection Prevention**
- **Security Incident Response**
- **Backup Security & Disaster Recovery**

**Security Philosophy:**
- **Privacy by Design** - Security built into every feature from day one
- **Defense in Depth** - Multiple layers of security, no single point of failure
- **Least Privilege** - Users and processes only get minimum necessary permissions
- **Transparency** - Clear communication with users about data practices

---

## TABLE OF CONTENTS

1. [GDPR Compliance](#gdpr-compliance)
2. [Data Encryption](#data-encryption)
3. [Authentication System](#authentication-system)
4. [Authorization & Access Control](#authorization--access-control)
5. [Input Validation & Injection Prevention](#input-validation--injection-prevention)
6. [Anti-Cheat System](#anti-cheat-system)
7. [Rate Limiting & DDoS Protection](#rate-limiting--ddos-protection)
8. [Security Incident Response](#security-incident-response)
9. [Backup Security](#backup-security)
10. [Compliance Checklist](#compliance-checklist)
11. [Security Testing](#security-testing)

---

## GDPR COMPLIANCE

### GDPR Principles

**Must comply with all 7 principles:**

1. **Lawfulness, Fairness, Transparency** - Clear terms, honest data use
2. **Purpose Limitation** - Only collect data needed for gameplay
3. **Data Minimisation** - Don't collect excess data
4. **Accuracy** - Keep data up-to-date
5. **Storage Limitation** - Don't keep data forever
6. **Integrity & Confidentiality** - Secure data properly
7. **Accountability** - Prove compliance

### User Rights Under GDPR

| Right | Implementation |
|-------|----------------|
| **Right to Access** | API endpoint to download all user data (JSON export) |
| **Right to Rectification** | User can edit profile, email, settings |
| **Right to Erasure** | User can request account deletion (30-day grace period) |
| **Right to Restrict Processing** | User can disable marketing emails, analytics tracking |
| **Right to Data Portability** | JSON export of all character data |
| **Right to Object** | User can object to automated decision-making (none in our game) |
| **Right to Not Be Subject to Automated Decision-Making** | No automated bans (all bans are admin-reviewed) |

---

### Account Deletion Process (Right to Erasure)

**CRITICAL FIX:** Current "never delete" policy violates GDPR. New policy:

#### Step 1: User Requests Deletion

**API Endpoint:** `DELETE /users/:userId/account`

```javascript
// Request body
{
  "confirmPassword": "user_password",
  "confirmDeletion": true,
  "reason": "Optional reason for feedback"
}

// Response
{
  "success": true,
  "message": "Account deletion scheduled for December 15, 2025. You have 30 days to cancel.",
  "cancellationDeadline": "2025-12-15T10:30:00.000Z"
}
```

#### Step 2: 30-Day Grace Period

```javascript
// Database update
await db.collection('users').updateOne(
  { _id: userId },
  {
    $set: {
      accountStatus: 'pending_deletion',
      deletionRequested: true,
      deletionRequestDate: new Date(),
      dataRetentionUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // +30 days
    }
  }
)
```

**During grace period:**
- User can still log in
- UI shows prominent banner: "Your account will be deleted on [date]. [Cancel Deletion]"
- User can cancel deletion at any time
- No new purchases allowed

#### Step 3: Cancellation (Optional)

**API Endpoint:** `POST /users/:userId/cancel-deletion`

```javascript
{
  "success": true,
  "message": "Account deletion cancelled. Your account is safe."
}

// Database update
await db.collection('users').updateOne(
  { _id: userId },
  {
    $set: {
      accountStatus: 'active',
      deletionRequested: false,
      deletionRequestDate: null,
      dataRetentionUntil: null
    }
  }
)
```

#### Step 4: Hard Deletion (After 30 Days)

**Cron Job:** Runs daily at 2 AM

```javascript
cron.schedule('0 2 * * *', async () => {
  const now = new Date()

  // Find accounts ready for deletion
  const accountsToDelete = await db.collection('users').find({
    accountStatus: 'pending_deletion',
    dataRetentionUntil: { $lte: now }
  }).toArray()

  for (const user of accountsToDelete) {
    await hardDeleteUserAccount(user._id)
  }

  console.log(`[GDPR Deletion] Deleted ${accountsToDelete.length} accounts.`)
})
```

**Hard Deletion Function:**

```javascript
async function hardDeleteUserAccount(userId) {
  const session = await db.startSession()
  session.startTransaction()

  try {
    // 1. Delete user account
    await db.collection('users').deleteOne({ _id: userId }, { session })

    // 2. Delete character
    const character = await db.collection('characters').findOne({ userId }, { session })
    const characterId = character ? character._id : null

    if (characterId) {
      await db.collection('characters').deleteOne({ _id: characterId }, { session })

      // 3. Delete character-owned data
      await db.collection('skills').deleteMany({ characterId }, { session })
      await db.collection('items').deleteMany({ ownerId: characterId, ownerType: 'character' }, { session })
      await db.collection('quests').deleteMany({ characterId }, { session })

      // 4. Anonymize transactions (preserve for fraud detection)
      await db.collection('transactions').updateMany(
        { $or: [{ fromCharacterId: characterId }, { toCharacterId: characterId }] },
        { $set: {
          fromCharacterId: null,
          toCharacterId: null,
          _anonymized: true,
          _anonymizedAt: new Date()
        }},
        { session }
      )

      // 5. Anonymize combat logs (preserve for analytics)
      await db.collection('combat_logs').updateMany(
        { $or: [{ 'attacker.characterId': characterId }, { 'defender.characterId': characterId }] },
        { $set: {
          'attacker.characterId': null,
          'defender.characterId': null,
          _anonymized: true
        }},
        { session }
      )

      // 6. Delete chat messages
      await db.collection('chat_messages').deleteMany({ authorId: characterId }, { session })

      // 7. Remove from gang (if member)
      if (character.gangId) {
        await db.collection('gangs').updateOne(
          { _id: character.gangId },
          {
            $inc: { memberCount: -1 },
            $pull: { officers: characterId }
          },
          { session }
        )
      }
    }

    // 8. Delete sessions
    await db.collection('sessions').deleteMany({ userId }, { session })

    // 9. Log deletion for audit (retain 7 years for legal compliance)
    await db.collection('gdpr_deletions').insertOne({
      userId,
      characterId,
      deletedAt: new Date(),
      requestDate: user.deletionRequestDate,
      email: user.email,  // Encrypted, for legal record only
      retainUntil: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000)  // 7 years
    }, { session })

    await session.commitTransaction()

    console.log(`[GDPR Deletion] Deleted user ${userId} and character ${characterId}`)
  } catch (error) {
    await session.abortTransaction()
    console.error(`[GDPR Deletion] Failed to delete user ${userId}:`, error)
    throw error
  } finally {
    session.endSession()
  }
}
```

---

### Data Retention Policy

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| **Active user accounts** | Indefinite (until user deletes or 2 years inactive) | Ongoing service |
| **Deleted user records** | Anonymized immediately, audit log 7 years | GDPR + legal compliance |
| **Transaction logs** | Anonymized after deletion, 7 years | Fraud prevention, tax law |
| **Combat logs** | Anonymized after deletion, 90 days | Game analytics |
| **Chat messages** | 30 days | Moderation, then auto-delete |
| **Email verification tokens** | 24 hours | Security |
| **Password reset tokens** | 1 hour | Security |
| **Sessions** | 30 days max, deleted on logout | Security |
| **Admin logs** | 7 years | Audit trail |
| **Backups** | 30 days (daily), 90 days (weekly), 1 year (monthly) | Disaster recovery |

**Inactive Account Deletion:**

After **2 years of inactivity** (no login), send email:
> "Your Desperados Destiny account has been inactive for 2 years. Log in within 30 days to keep your account, or it will be deleted."

If no login after 30 days → automatic deletion (same process as user-requested deletion)

---

### Data Export (Right to Access)

**API Endpoint:** `GET /users/:userId/export-data`

**Response:** JSON file containing all user data

```json
{
  "exportDate": "2025-11-15T10:30:00.000Z",
  "user": {
    "email": "user@example.com",
    "accountStatus": "active",
    "premiumTier": "premium",
    "createdAt": "2025-10-15T12:00:00.000Z"
  },
  "character": {
    "name": "Wild Bill",
    "faction": "frontera",
    "level": 25,
    "experience": 50000,
    "goldDollars": 12450,
    "skills": [ /* all skills */ ],
    "inventory": [ /* all items */ ],
    "stats": { /* all stats */ }
  },
  "transactions": [ /* all transactions involving this character */ ],
  "combatHistory": [ /* all combat logs */ ],
  "chatHistory": [ /* user's chat messages (last 30 days) */ ],
  "gangMembership": { /* gang info if member */ },
  "questHistory": [ /* completed quests */ ]
}
```

**Email Delivery:**
- Generate export
- Encrypt ZIP file with user-chosen password
- Email download link (expires in 7 days)
- Log export request for audit

---

### Consent Management

**Consent Types:**

```javascript
{
  gdprConsent: Boolean,          // Required to create account
  gdprConsentDate: Date,
  marketingConsent: Boolean,     // Optional (email marketing)
  analyticsConsent: Boolean,     // Optional (analytics tracking)
  cookieConsent: Boolean         // Optional (non-essential cookies)
}
```

**Consent UI Requirements:**
- **Explicit opt-in** (no pre-checked boxes)
- **Granular** (separate consent for marketing, analytics, cookies)
- **Revocable** (user can withdraw consent anytime in settings)
- **Documented** (log consent timestamp and version of terms accepted)

**API Endpoint:** `PATCH /users/:userId/consent`

```javascript
{
  "marketingConsent": false,
  "analyticsConsent": true
}
```

---

### Cookie Policy

**Essential Cookies (No Consent Required):**
- Session authentication (JWT token)
- CSRF protection token
- Language preference

**Non-Essential Cookies (Consent Required):**
- Google Analytics (if analyticsConsent: true)
- Advertising cookies (future, if implemented)

**Cookie Banner:**
```
"We use cookies to provide essential game functionality and, with your consent, to analyze usage.
[Accept All] [Essential Only] [Customize]"
```

---

## DATA ENCRYPTION

### Encryption at Rest

**Database Encryption:**
- **MongoDB Encryption at Rest** - Enable on all production databases
- **Encryption Method:** AES-256
- **Key Management:** AWS KMS or DigitalOcean Encryption Keys (rotate every 90 days)

**Configuration:**

```yaml
# MongoDB encryption config
security:
  enableEncryption: true
  encryptionKeyFile: /etc/mongodb/encryption-key
```

**Encrypted Fields (Application-Level):**

```javascript
// Fields requiring extra encryption beyond database-level
const ENCRYPTED_FIELDS = [
  'users.twoFactorSecret',        // TOTP secret for 2FA
  'users.twoFactorBackupCodes',   // Backup codes
  'users.stripeCustomerId',       // PII
  'gdpr_deletions.email'          // Audit trail (legal retention)
]

// Encryption library: Node.js Crypto (AES-256-GCM)
const crypto = require('crypto')
const ENCRYPTION_KEY = process.env.FIELD_ENCRYPTION_KEY  // 32-byte key from env

function encryptField(plaintext) {
  const iv = crypto.randomBytes(16)  // Initialization vector
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv)

  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  }
}

function decryptField(encryptedData) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, Buffer.from(encryptedData.iv, 'hex'))
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'))

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
```

---

### Encryption in Transit

**TLS/SSL Configuration:**
- **TLS Version:** 1.2 minimum, 1.3 preferred
- **Certificate:** Let's Encrypt or commercial CA
- **HSTS Header:** Enforce HTTPS

**Nginx Configuration:**

```nginx
server {
  listen 443 ssl http2;
  server_name api.desperados-destiny.com;

  ssl_certificate /etc/letsencrypt/live/api.desperados-destiny.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.desperados-destiny.com/privkey.pem;

  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
  ssl_prefer_server_ciphers on;

  # HSTS (force HTTPS for 1 year)
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

  # Other security headers
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}

# Redirect HTTP to HTTPS
server {
  listen 80;
  server_name api.desperados-destiny.com;
  return 301 https://$host$request_uri;
}
```

**MongoDB TLS:**

```javascript
const mongoClient = new MongoClient(process.env.MONGO_URI, {
  tls: true,
  tlsCAFile: '/etc/ssl/mongodb-ca.pem',
  tlsCertificateKeyFile: '/etc/ssl/mongodb-client.pem'
})
```

---

### Password Security

**Password Hashing:**
- **Algorithm:** bcrypt
- **Cost Factor:** 12 rounds (2^12 iterations)
- **Never** store plaintext passwords

```javascript
const bcrypt = require('bcrypt')

// Hash password on registration
async function hashPassword(plaintext) {
  const salt = await bcrypt.genSalt(12)
  const hash = await bcrypt.hash(plaintext, salt)
  return hash
}

// Verify password on login
async function verifyPassword(plaintext, hash) {
  return await bcrypt.compare(plaintext, hash)
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- Not in common password list (check against `haveibeenpwned.com` API)

```javascript
function validatePassword(password) {
  const minLength = 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  if (password.length < minLength) {
    throw new Error('Password must be at least 8 characters')
  }
  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    throw new Error('Password must contain uppercase, lowercase, number, and special character')
  }

  // Check against breached password database (API call)
  const isPwned = await checkIfPasswordPwned(password)
  if (isPwned) {
    throw new Error('This password has been compromised in a data breach. Please choose another.')
  }
}
```

---

## AUTHENTICATION SYSTEM

### JWT Token Structure

**Access Token (Short-lived: 15 minutes):**

```javascript
{
  userId: "507f1f77bcf86cd799439011",
  characterId: "507f1f77bcf86cd799439012",
  premiumTier: "premium",
  role: "user",  // 'user' | 'admin' | 'moderator'
  iat: 1700000000,  // Issued at
  exp: 1700000900   // Expires at (+15 minutes)
}
```

**Refresh Token (Long-lived: 30 days):**

```javascript
{
  userId: "507f1f77bcf86cd799439011",
  type: "refresh",
  jti: "unique-token-id",  // For revocation
  iat: 1700000000,
  exp: 1702592000  // +30 days
}
```

**JWT Secret Management:**
- Store in environment variable (never commit to Git)
- Rotate every 90 days
- Use strong secret (64+ character random string)

```bash
# Generate strong secret
openssl rand -base64 64
```

---

### Authentication Flow

```
1. User Login (POST /auth/login)
   ↓
2. Validate credentials (bcrypt compare)
   ↓
3. Check 2FA (if enabled)
   ↓
4. Generate access token + refresh token
   ↓
5. Store refresh token in database (sessions collection)
   ↓
6. Return tokens to client
   ↓
7. Client stores access token in memory
   ↓
8. Client stores refresh token in httpOnly cookie (secure, sameSite)
   ↓
9. Client includes access token in Authorization header for all API requests
   ↓
10. When access token expires (15 min), client uses refresh token to get new access token
```

**Security Benefits:**
- **Short-lived access tokens** - Even if leaked, expire quickly
- **Refresh tokens in httpOnly cookies** - Not accessible to JavaScript (XSS protection)
- **Refresh token rotation** - Each use generates new refresh token (prevents replay attacks)
- **Revocable** - Can blacklist refresh tokens if compromised

---

### Two-Factor Authentication (2FA)

**Optional for users, enabled in account settings:**

```javascript
// Enable 2FA
POST /auth/2fa/enable

// Response: QR code + manual entry code
{
  "success": true,
  "qrCode": "data:image/png;base64,...",
  "secret": "JBSWY3DPEHPK3PXP",  // For manual entry
  "backupCodes": [
    "1234-5678",
    "8765-4321",
    "9876-5432"
  ]
}

// User scans QR with Google Authenticator / Authy
// User verifies with first TOTP code

POST /auth/2fa/verify-setup
{
  "code": "123456"
}

// If correct, 2FA is enabled
```

**Login with 2FA:**

```javascript
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd",
  "twoFactorCode": "123456"  // TOTP code from authenticator app
}
```

**2FA Library:** `speakeasy` (Node.js TOTP library)

```javascript
const speakeasy = require('speakeasy')

// Generate secret
const secret = speakeasy.generateSecret({ name: 'Desperados Destiny (user@example.com)' })

// Verify TOTP code
const verified = speakeasy.totp.verify({
  secret: user.twoFactorSecret,
  encoding: 'base32',
  token: req.body.twoFactorCode,
  window: 2  // Allow 2 time steps (60 seconds) tolerance for clock drift
})
```

---

## AUTHORIZATION & ACCESS CONTROL

### Role-Based Access Control (RBAC)

**Roles:**

```javascript
const ROLES = {
  USER: 'user',           // Standard player
  MODERATOR: 'moderator', // Can delete chat, warn users
  ADMIN: 'admin'          // Full access
}

const PERMISSIONS = {
  USER: [
    'character:read:own',
    'character:update:own',
    'combat:initiate',
    'chat:send',
    'gang:join',
    'shop:buy'
  ],
  MODERATOR: [
    ...PERMISSIONS.USER,
    'chat:delete',
    'chat:moderate',
    'user:warn',
    'user:view'
  ],
  ADMIN: [
    ...PERMISSIONS.MODERATOR,
    'user:ban',
    'user:suspend',
    'user:grant_premium',
    'gang:disband',
    'economy:adjust',
    'system:maintenance'
  ]
}
```

**Authorization Middleware:**

```javascript
function requirePermission(permission) {
  return (req, res, next) => {
    const user = req.user  // From JWT token

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const userPermissions = PERMISSIONS[user.role.toUpperCase()]
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' })
    }

    next()
  }
}

// Usage
app.delete('/chat/messages/:id', requirePermission('chat:delete'), async (req, res) => {
  // Delete chat message
})
```

---

## INPUT VALIDATION & INJECTION PREVENTION

### NoSQL Injection Prevention

**Vulnerable Code (DON'T DO THIS):**

```javascript
// VULNERABLE - User input directly in query
const user = await db.collection('users').findOne({ email: req.body.email })
```

**Attack:**
```javascript
// Attacker sends:
{ "email": { "$ne": null } }

// Query becomes:
{ email: { $ne: null } }  // Returns first user in database!
```

**Secure Code:**

```javascript
// Validate input first
const Joi = require('joi')

const schema = Joi.object({
  email: Joi.string().email().required()
})

const { error, value } = schema.validate(req.body)
if (error) {
  return res.status(400).json({ error: error.details[0].message })
}

// Now safe to use
const user = await db.collection('users').findOne({ email: value.email })
```

**Additional Protection:**

```javascript
// Sanitize all user inputs (remove MongoDB operators)
function sanitizeInput(obj) {
  if (obj === null || typeof obj !== 'object') return obj

  const sanitized = Array.isArray(obj) ? [] : {}

  for (const key in obj) {
    // Remove keys starting with $ (MongoDB operators)
    if (key.startsWith('$')) continue

    sanitized[key] = sanitizeInput(obj[key])
  }

  return sanitized
}

// Middleware
app.use((req, res, next) => {
  req.body = sanitizeInput(req.body)
  req.query = sanitizeInput(req.query)
  req.params = sanitizeInput(req.params)
  next()
})
```

---

### XSS Prevention

**Sanitize User-Generated Content:**

```javascript
const createDOMPurify = require('isomorphic-dompurify')
const DOMPurify = createDOMPurify()

function sanitizeHTML(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],  // No HTML tags allowed in chat/bio
    ALLOWED_ATTR: []
  })
}

// Sanitize chat messages
const cleanMessage = sanitizeHTML(req.body.message)
```

**Content Security Policy (CSP) Header:**

```javascript
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' wss://api.desperados-destiny.com"
  )
  next()
})
```

---

### CSRF Protection

**CSRF Token Middleware:**

```javascript
const csrf = require('csurf')

app.use(csrf({ cookie: true }))

// Send CSRF token to client
app.get('/auth/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

// Client includes token in all state-changing requests
// Header: X-CSRF-Token: <token>
```

---

## ANTI-CHEAT SYSTEM

### Bot Detection

**Indicators of Bot Behavior:**

```javascript
const BOT_INDICATORS = {
  // Superhuman speed
  TOO_FAST_ACTIONS: {
    threshold: 5,  // 5+ actions in 10 seconds
    timeWindow: 10000  // 10 seconds
  },

  // Perfect consistency (humans vary)
  CONSISTENT_TIMING: {
    threshold: 0.05,  // <5% variance in action timing
    sampleSize: 20
  },

  // Unusual patterns
  NO_MOUSE_MOVEMENT: true,  // Never moves mouse (headless browser)
  PERFECT_ACCURACY: true,   // Never misclicks
  NO_IDLE_TIME: true,       // Never pauses

  // Known bot user-agents
  SUSPICIOUS_USER_AGENTS: [
    'Selenium',
    'PhantomJS',
    'HeadlessChrome'
  ]
}
```

**Detection Logic:**

```javascript
async function detectBotBehavior(characterId) {
  const recentActions = await db.collection('action_log').find({
    characterId,
    timestamp: { $gte: new Date(Date.now() - 60000) }  // Last minute
  }).sort({ timestamp: 1 }).toArray()

  // Check action speed
  if (recentActions.length >= 10) {
    const timeSpan = recentActions[recentActions.length - 1].timestamp - recentActions[0].timestamp
    if (timeSpan < 10000) {  // 10+ actions in <10 seconds
      await flagCharacter(characterId, 'SUSPICIOUS_ACTION_SPEED', { actionsPerSecond: recentActions.length / (timeSpan / 1000) })
    }
  }

  // Check timing consistency (bots have very consistent timing)
  if (recentActions.length >= 20) {
    const intervals = []
    for (let i = 1; i < recentActions.length; i++) {
      intervals.push(recentActions[i].timestamp - recentActions[i-1].timestamp)
    }

    const avgInterval = intervals.reduce((a,b) => a+b, 0) / intervals.length
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = stdDev / avgInterval

    if (coefficientOfVariation < 0.05) {  // <5% variation (suspiciously consistent)
      await flagCharacter(characterId, 'CONSISTENT_TIMING_BOT', { cv: coefficientOfVariation })
    }
  }
}
```

**Mitigation:**

```javascript
// Require CAPTCHA on suspicious activity
if (character.botFlags > 3) {
  return res.status(403).json({
    error: 'CAPTCHA_REQUIRED',
    message: 'Please complete CAPTCHA to continue',
    captchaUrl: '/auth/captcha'
  })
}

// Admin review for persistent flags
if (character.botFlags > 10) {
  await db.collection('admin_review_queue').insertOne({
    characterId,
    reason: 'Suspected bot (multiple flags)',
    flags: character.botFlagHistory,
    priority: 'high'
  })
}
```

---

### Multi-Accounting Detection

**Fingerprinting Techniques:**

```javascript
// Track device fingerprints
const deviceFingerprint = {
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  screenResolution: req.body.screenResolution,  // From client JS
  timezone: req.body.timezone,
  language: req.headers['accept-language'],
  canvas: req.body.canvasFingerprint  // Canvas fingerprinting (unique browser rendering)
}

// Check for multiple accounts from same device
const accountsFromDevice = await db.collection('characters').find({
  'deviceFingerprint.canvas': deviceFingerprint.canvas,
  'deviceFingerprint.ipAddress': deviceFingerprint.ipAddress
}).toArray()

if (accountsFromDevice.length > 3) {
  await flagForReview('MULTI_ACCOUNTING', {
    deviceFingerprint,
    accounts: accountsFromDevice.map(c => c._id)
  })
}
```

**VPN/Proxy Detection:**

```javascript
// Use IP intelligence service (ipqs.com, ipinfo.io)
async function detectVPN(ipAddress) {
  const response = await fetch(`https://ipqualityscore.com/api/json/ip/${process.env.IPQS_KEY}/${ipAddress}`)
  const data = await response.json()

  return {
    isVPN: data.vpn,
    isProxy: data.proxy,
    isTor: data.tor,
    riskScore: data.fraud_score  // 0-100, higher = more suspicious
  }
}
```

---

### Economy Cheat Detection

**Impossible Wealth Gain:**

```javascript
async function detectEconomyCheats(characterId) {
  const character = await db.collection('characters').findOne({ _id: characterId })
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  // Check gold gain in last 24 hours
  const goldTransactions = await db.collection('transactions').aggregate([
    {
      $match: {
        toCharacterId: characterId,
        timestamp: { $gte: oneDayAgo }
      }
    },
    {
      $group: {
        _id: null,
        totalGold: { $sum: '$goldDollars' }
      }
    }
  ]).toArray()

  const goldGained = goldTransactions[0]?.totalGold || 0
  const MAX_LEGITIMATE_GOLD_PER_DAY = 50000  // Adjust based on game economy

  if (goldGained > MAX_LEGITIMATE_GOLD_PER_DAY) {
    await flagForReview('EXCESSIVE_GOLD_GAIN', {
      goldGained,
      period: '24 hours',
      characterId
    })
  }
}
```

---

## RATE LIMITING & DDOS PROTECTION

### Rate Limiting Configuration

```javascript
const rateLimit = require('express-rate-limit')
const RedisStore = require('rate-limit-redis')
const redis = require('redis')

const redisClient = redis.createClient({ url: process.env.REDIS_URL })

// General API rate limit
const generalLimiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 100,  // 100 requests per minute
  message: 'Too many requests, please slow down'
})

// Login rate limit (stricter)
const loginLimiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,  // Don't count successful logins
  message: 'Too many login attempts. Try again in 15 minutes.'
})

// Combat action limit
const combatLimiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 1 * 60 * 1000,
  max: 20,  // 20 combat actions per minute
  message: 'Combat cooldown active. Wait before attacking again.'
})

app.use('/api/', generalLimiter)
app.use('/auth/login', loginLimiter)
app.use('/combat/', combatLimiter)
```

---

### DDoS Protection

**Cloudflare Configuration:**
- Enable "Under Attack Mode" during DDoS
- Bot Fight Mode (free tier)
- Rate limiting rules
- IP reputation scoring

**Nginx DDoS Mitigation:**

```nginx
# Limit connections per IP
limit_conn_zone $binary_remote_addr zone=addr:10m;
limit_conn addr 10;

# Limit request rate
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
limit_req zone=one burst=20 nodelay;

# Timeout settings (prevent slow loris attacks)
client_body_timeout 10s;
client_header_timeout 10s;
keepalive_timeout 5s 5s;
send_timeout 10s;
```

---

## SECURITY INCIDENT RESPONSE

### Incident Response Plan

**Phases:**

1. **Detection** - Monitoring alerts, user reports
2. **Containment** - Isolate affected systems, block attackers
3. **Eradication** - Remove malware, patch vulnerabilities
4. **Recovery** - Restore services, verify integrity
5. **Post-Incident** - Document lessons learned, update security

**Incident Severity Levels:**

| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| **P0 - Critical** | Active data breach, server compromise | Immediate | All hands on deck |
| **P1 - High** | Attempted breach, vulnerability exploited | <1 hour | Lead engineer + security team |
| **P2 - Medium** | Suspicious activity, potential vulnerability | <4 hours | Security team |
| **P3 - Low** | Minor security issue, false positive | <24 hours | Standard process |

---

### Data Breach Response

**If user data is compromised:**

```javascript
// Step 1: Assess scope
const breachAssessment = {
  affectedUsers: 1250,
  dataTypes: ['email', 'hashedPasswords', 'characterNames'],
  sensitiveData: false,  // No SSN, credit cards, etc.
  breachDate: '2025-11-15',
  discoveryDate: '2025-11-16'
}

// Step 2: Contain breach
await containBreach()

// Step 3: Notify affected users (GDPR requires within 72 hours)
for (const userId of affectedUserIds) {
  await sendBreachNotification(userId, {
    date: breachAssessment.breachDate,
    dataCompromised: 'Email and encrypted password hash',
    actionRequired: 'Change your password immediately',
    supportContact: 'security@desperados-destiny.com'
  })
}

// Step 4: Notify authorities (GDPR requires reporting to supervisory authority)
await notifyGDPRAuthority(breachAssessment)

// Step 5: Post-mortem and fixes
await conductPostMortem()
```

**GDPR Breach Notification Template:**

```
Subject: Important Security Notice - Desperados Destiny

Dear [User Name],

We are writing to inform you of a security incident that may have affected your account.

WHAT HAPPENED:
On November 15, 2025, we discovered unauthorized access to our user database.

WHAT INFORMATION WAS INVOLVED:
Your email address and encrypted password hash may have been accessed. No financial information, social security numbers, or other sensitive data was compromised.

WHAT WE ARE DOING:
We have secured the vulnerability, reset all affected passwords, and are working with cybersecurity experts to prevent future incidents.

WHAT YOU SHOULD DO:
1. Change your password immediately
2. Enable two-factor authentication (2FA)
3. Be alert for phishing emails

We take your privacy seriously and apologize for this incident.

For questions: security@desperados-destiny.com

Sincerely,
Desperados Destiny Security Team
```

---

## BACKUP SECURITY

### Encrypted Backups

**Backup Encryption:**

```bash
# MongoDB dump with encryption
mongodump --uri="mongodb://..." --archive | \
  openssl enc -aes-256-cbc -salt -pbkdf2 -pass file:/etc/backup-password > \
  /backups/mongodb-backup-$(date +%Y%m%d).enc

# Upload to S3 (encrypted at rest + in transit)
aws s3 cp /backups/mongodb-backup-$(date +%Y%m%d).enc \
  s3://desperados-backups/mongodb/ \
  --sse AES256
```

**Backup Decryption (Disaster Recovery):**

```bash
# Download from S3
aws s3 cp s3://desperados-backups/mongodb/mongodb-backup-20251115.enc /tmp/backup.enc

# Decrypt
openssl enc -aes-256-cbc -d -pbkdf2 -pass file:/etc/backup-password < /tmp/backup.enc | \
  mongorestore --archive
```

---

### Backup Retention & Access Control

**Retention Policy:**
- **Daily backups:** Retained for 30 days
- **Weekly backups:** Retained for 90 days
- **Monthly backups:** Retained for 1 year
- **Yearly backups:** Retained for 7 years (GDPR compliance)

**Access Control:**
- Only DevOps lead + CTO have decryption keys
- Decryption keys stored in AWS Secrets Manager (not in Git)
- Backup access logged to audit trail

---

## COMPLIANCE CHECKLIST

### GDPR Compliance Checklist

- [ ] Privacy Policy published and accessible
- [ ] Terms of Service published and accessible
- [ ] Cookie consent banner implemented
- [ ] User can request data export (JSON download)
- [ ] User can request account deletion (30-day grace period)
- [ ] Account deletion process anonymizes data (transactions, combat logs)
- [ ] Audit log retained for 7 years (encrypted)
- [ ] Data encrypted at rest (MongoDB + field-level AES-256)
- [ ] Data encrypted in transit (TLS 1.2+)
- [ ] Data retention policy enforced (auto-delete inactive accounts after 2 years)
- [ ] Consent management implemented (granular, revocable)
- [ ] Data breach notification process documented
- [ ] DPO (Data Protection Officer) designated (or contact person for small org)

### Security Checklist

- [ ] All passwords hashed with bcrypt (12 rounds)
- [ ] JWT tokens use strong secrets (64+ chars, rotated every 90 days)
- [ ] 2FA optional for users (TOTP)
- [ ] Input validation on all endpoints (Joi schemas)
- [ ] NoSQL injection prevention (input sanitization)
- [ ] XSS prevention (DOMPurify, CSP headers)
- [ ] CSRF protection (csrf middleware)
- [ ] Rate limiting on all endpoints (Redis-backed)
- [ ] DDoS protection (Cloudflare + Nginx)
- [ ] TLS 1.2+ enforced (HSTS header)
- [ ] Security headers configured (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] Anti-cheat system implemented (bot detection, multi-account detection)
- [ ] Admin actions logged to audit trail
- [ ] Backups encrypted (AES-256)
- [ ] Incident response plan documented
- [ ] Security testing conducted (penetration testing, vulnerability scanning)

---

## SECURITY TESTING

### Pre-Launch Security Audit

**Phase 1: Automated Scanning**
- [ ] OWASP ZAP scan (web vulnerability scanner)
- [ ] Nmap scan (port scanning, service detection)
- [ ] Burp Suite scan (API testing)
- [ ] npm audit (dependency vulnerabilities)
- [ ] Snyk scan (code security analysis)

**Phase 2: Manual Penetration Testing**
- [ ] SQL/NoSQL injection attempts
- [ ] XSS injection attempts
- [ ] CSRF bypass attempts
- [ ] Authentication bypass attempts
- [ ] Authorization escalation attempts
- [ ] Session hijacking attempts
- [ ] Rate limit bypass attempts

**Phase 3: Code Review**
- [ ] Secrets in Git history (truffleHog scan)
- [ ] Hardcoded credentials
- [ ] Insecure cryptography
- [ ] Insecure deserialization
- [ ] Race conditions
- [ ] Logic flaws

**Phase 4: Compliance Audit**
- [ ] GDPR compliance review
- [ ] Privacy policy legal review
- [ ] Terms of service legal review
- [ ] Cookie policy review

**Phase 5: Bug Bounty Program (Post-Launch)**
- [ ] Set up HackerOne or Bugcrowd program
- [ ] Define scope and bounty rewards
- [ ] Establish disclosure policy

---

## CONCLUSION

This Security & Privacy Playbook provides **comprehensive, production-ready** security specifications that:

1. **Ensure GDPR compliance** - User data rights, encryption, retention, breach notification
2. **Protect user accounts** - Strong passwords, 2FA, JWT tokens, session security
3. **Prevent common attacks** - Injection, XSS, CSRF, DDoS, rate limiting
4. **Detect cheating** - Bot detection, multi-accounting, economy cheats
5. **Respond to incidents** - Breach notification, containment, recovery
6. **Secure backups** - Encrypted, access-controlled, retention policy

**No more 3/10 security score** - these specifications bring us to enterprise-grade security standards.

---

**Document Status:** ✅ Complete
**GDPR Compliance:** Full
**Security Level:** Production-Grade
**Next Phase:** QA Strategy Document

*— Ezra "Hawk" Hawthorne*
*Security Architect*
*November 15, 2025*
