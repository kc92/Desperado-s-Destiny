# DESPERADOS DESTINY - OPERATIONS PLAYBOOK
## *Comprehensive Design Decisions & Implementation Guide*

**Document Purpose:** Consolidate all critical design decisions, operational procedures, and implementation specifications made during Phase 0-0.5 planning.

**Author:** Ezra "Hawk" Hawthorne
**Last Updated:** November 15, 2025
**Status:** Phase 0.5 Complete

---

## TABLE OF CONTENTS

1. [Core Design Decisions](#core-design-decisions)
2. [Authentication & Security](#authentication--security)
3. [Character & Progression Systems](#character--progression-systems)
4. [Combat & Death Mechanics](#combat--death-mechanics)
5. [Economy & Monetization](#economy--monetization)
6. [Social & Communication Systems](#social--communication-systems)
7. [Territory & Gang Warfare](#territory--gang-warfare)
8. [Tutorial & Onboarding](#tutorial--onboarding)
9. [Moderation & Safety](#moderation--safety)
10. [Technical Infrastructure](#technical-infrastructure)
11. [Launch Strategy](#launch-strategy)
12. [Analytics & Metrics](#analytics--metrics)
13. [Legal & Compliance](#legal--compliance)
14. [Balance & Economy Monitoring](#balance--economy-monitoring)
15. [Incident Response](#incident-response)

---

## CORE DESIGN DECISIONS

### Summary of Critical Choices

This section documents the 24 major design decisions made during comprehensive planning sessions that define the game's implementation.

| # | Category | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Authentication | Email verification required | Security and account recovery |
| 2 | Authentication | Optional 2FA (authenticator apps) | Extra security for competitive players |
| 3 | Death Mechanics | Hospital time penalty (Torn-style) | Meaningful consequence without frustration |
| 4 | Currency | Single currency (Gold Dollars) | Simple to understand and balance |
| 5 | Gang Size | Medium (15-25 members) | Balance organization and manageability |
| 6 | Skill Training | One skill at a time | Strategic choices, meaningful progression |
| 7 | Skill Respec | One free, then premium cost | Forgive mistakes, prevent meta-gaming |
| 8 | Tutorial | NPC mentor system with quests | Engaging story-driven onboarding |
| 9 | Inactive Accounts | Mark inactive, never delete | Players can always return |
| 10 | Territory Warfare | 24/7 attacks, instant resolution | Favors active gangs, dynamic gameplay |
| 11 | Moderation | Full suite (reporting, filters, dashboard, mute) | Comprehensive community safety |
| 12 | Mobile | Responsive web, native apps later | MVP focus, future expansion |
| 13 | Premium Features | Hospital time, vault space, properties | Convenience without power |
| 14 | Backup Strategy | Daily backups, 30-day retention | Balance safety and cost |
| 15 | Anti-Cheat | Server validation + anomaly detection | Comprehensive security |
| 16 | API Rate Limiting | 60 requests/minute per user | Prevent bots, allow normal play |
| 17 | Incident Response | Rollback + hotfix + bounty + compensation | Full incident toolkit |
| 18 | Chat Channels | Global, Faction, Gang, Location | Comprehensive communication |
| 19 | Notifications | Combat, gang, skills, energy | Keep players engaged |
| 20 | Email Alerts | Critical + optional opt-in | Minimal noise, player choice |
| 21 | Character Names | Globally unique (WoW-style) | Simple, clear identity |
| 22 | Launch Strategy | Soft launch with small marketing | Controlled growth, fix issues |
| 23 | Key Metrics | Retention (D1/7/30) + DAU/MAU | Core engagement tracking |
| 24 | Legal | All compliance (ToS, Privacy, GDPR, Age) | Full legal protection |

---

## AUTHENTICATION & SECURITY

### Email Verification
- **Requirement:** REQUIRED for all new accounts
- **Flow:**
  1. User registers with email + password
  2. System sends verification email
  3. User clicks link to verify
  4. Account activated
- **Benefits:**
  - Prevents spam accounts
  - Enables password reset
  - Validates real email for communication
- **Implementation:**
  - Use SendGrid or Mailgun for transactional emails
  - Verification tokens expire after 24 hours
  - Allow resending verification email

### Two-Factor Authentication (2FA)
- **Type:** OPTIONAL via authenticator apps (Google Authenticator, Authy)
- **Availability:** All players (free and premium)
- **Use Cases:**
  - Recommended for competitive players
  - Recommended for premium subscribers
  - Required for admin/moderator accounts
- **Implementation:**
  - TOTP (Time-based One-Time Password) standard
  - Backup codes for account recovery
  - Can disable 2FA with email verification

### Password Requirements
- **Minimum Length:** 8 characters
- **Complexity:** No specific requirements (length is sufficient)
- **Hashing:** bcrypt with 12 rounds
- **Password Reset:**
  - Email-based reset flow
  - Reset tokens expire after 1 hour
  - Rate limit: 3 reset attempts per hour

### Session Management
- **JWT Tokens:** Expire after 7 days
- **Refresh Tokens:** Stored in Redis, revokable
- **Logout:** Blacklist tokens in Redis
- **Remember Me:** Optional 30-day token

---

## CHARACTER & PROGRESSION SYSTEMS

### Character Naming
- **System:** Globally unique names (WoW-style)
- **Rules:**
  - 3-20 characters
  - Letters, numbers, hyphens, underscores only
  - No profanity or offensive names
  - Case-insensitive uniqueness check
- **Enforcement:**
  - Automatic profanity filter on creation
  - Manual review for reported names
  - Forced rename for violations

### Skill Training Queue
- **Rule:** ONE SKILL AT A TIME
- **Rationale:**
  - Forces strategic prioritization
  - Creates meaningful progression choices
  - Prevents passive skill maxing
- **Details:**
  - Cannot queue multiple skills in advance
  - Must wait for current training to complete
  - Can cancel early (lose progress and gold)
- **Training Costs:**
  - Gold cost = Current Level × $10
  - Example: Training to Level 50 costs $500

### Skill Respec Policy
- **First Respec:** FREE (one-time)
  - Intended for new players who made mistakes
  - Available anytime after character creation
- **Subsequent Respecs:** Premium currency
  - 2nd respec: 50 tokens (~$5)
  - 3rd respec: 100 tokens (~$10)
  - 4th+ respecs: 150 tokens (~$15)
- **Process:**
  - All skills reset to 0
  - Time invested converted to skill points
  - Player redistributes immediately
  - Cannot save points for later

### Inactive Account Policy
- **Status:** Mark as inactive after 180 days
- **Data Retention:** NEVER DELETE
  - All character data preserved
  - All progress saved
  - Players can return anytime
- **Display:**
  - Profile shows "Inactive since [date]"
  - Gang membership may be removed by gang leaders
  - Territory control votes don't count
- **Premium Protection:** Not needed (all accounts protected)

---

## COMBAT & DEATH MECHANICS

### Hospital System (Torn-Style)

**When Knocked Out (0 HP):**
1. Instantly transported to nearest hospital
2. Cannot take ANY actions while hospitalized
3. Hospital time based on defeat severity:
   - Minor defeat: 15-30 minutes
   - Moderate defeat: 30-60 minutes
   - Severe defeat: 60-120 minutes

**Early Release Options:**
- **Pay Gold:** $1 per minute remaining
  - Example: 45 min remaining = $45 to leave now
- **Premium Discount:** 50% off early release (premium subscribers)
- **Premium Currency:** 10 tokens = 30 minutes off

**While Hospitalized:**
- ✅ Energy continues to regenerate
- ✅ Skill training continues
- ✅ Can view character, gang, map
- ❌ Cannot attack, do crimes, travel, trade
- ❌ Cannot participate in gang wars
- ❌ Cannot use items or equipment

**Death Penalties:**
- Lose 10-30% of carried cash (not banked)
- 5% chance to lose one random inventory item
- Bounty increased by 10-20% if wanted
- Small faction reputation loss
- Temporary debuff: -10% all skills for 30 min after release

**Strategic Implications:**
- Bank cash before risky activities
- Hospital time creates consequence
- Healing items prevent hospital (valuable market)
- Premium "reduced hospital time" is QoL, not P2W

---

## ECONOMY & MONETIZATION

### Currency System

**Single In-Game Currency: Gold Dollars ($)**
- **Earned:**
  - Crimes, heists, robberies
  - Territory control (passive income)
  - Prospecting and mining
  - Bounty hunting
  - Crafting and trading
  - Duels and gang wars
- **Spent:**
  - Equipment and consumables
  - Services (healing, training)
  - Gang expenses
  - Property (post-MVP)
  - Bribes and fees

**Banking:**
- Banked gold is safe (cannot be lost)
- Carried cash at risk (10-30% lost on death)
- No transaction fees
- Can access bank from any town

**No Secondary Currencies:**
- No premium tokens (subscription model instead)
- No faction currencies
- No spirit essence (post-MVP maybe)
- Simplicity and ease of balance

### Premium Subscription

**Price:** $5-10/month via Stripe

**Benefits:**
- Increased energy: 250 (vs 150 free)
- Faster regen: 8/hour (vs 5/hour free)
- Reduced hospital time: 50% discount on early release
- Increased vault/inventory space: +50% storage
- Exclusive properties: Certain buildings require premium
- Cosmetic options: Profile themes, titles, badges
- Priority customer support

**NOT Included (NOT Pay-to-Win):**
- Cannot buy gold dollars
- Cannot buy skill levels
- Cannot buy power or advantage
- Philosophy: Convenience, not dominance

---

## SOCIAL & COMMUNICATION SYSTEMS

### Chat System

**Four Channels:**

1. **Global Chat**
   - Entire server can see
   - High activity, can get chaotic
   - Moderated for spam and abuse
   - Rate limit: 1 message per 3 seconds

2. **Faction Chat**
   - Only your faction members
   - Strategy and coordination
   - Private from other factions

3. **Gang Chat**
   - Only your gang/posse members
   - Tactical communication
   - Most private channel

4. **Location Chat**
   - Only players in same map location
   - Proximity-based
   - Realistic and immersive
   - Reduces global spam

**Chat Features:**
- Real-time via Socket.io
- Message history (last 100 messages)
- Mute/block individual players
- Profanity filter (automatic)
- Moderator commands (/mute, /kick, /ban)

### Notification System

**In-Game Notifications:**
- ✅ Combat alerts ("You've been attacked!")
- ✅ Gang/territory updates ("Your territory is under attack!")
- ✅ Skill training complete
- ✅ Energy fully regenerated
- Toast notifications in top-right corner
- Notification center shows history

**Email Notifications:**

**Critical Events (always sent):**
- Account security (password changes, 2FA)
- Major game updates
- Terms of Service changes

**Optional Alerts (player can enable):**
- Attack notifications
- Gang war declarations
- Territory captures
- Skill completions

**Weekly Digest:**
- Optional summary email
- Reminds inactive players
- Highlights: battles, achievements, gang activity

---

## TERRITORY & GANG WARFARE

### Gang Size & Creation

**Medium Gangs (15-25 members):**
- **Starting Size:** 10 member slots
- **Max Slots:** 25 (unlockable via upgrades)
- **Creation Cost:** $5,000 gold
- **Weekly Upkeep:** $500/week (paid from gang vault)

**Gang Requirements:**
- Minimum 3 members to create
- Leader must be Level 10+
- Unique gang name (globally)
- Can set custom tag (3-5 characters)

**Gang Roles:**
- Leader (full control)
- Officers (can invite, manage wars)
- Members (can contribute, participate)
- Recruits (trial period, limited permissions)

### Territory Warfare

**24/7 Attacks with Instant Resolution:**
- **No Scheduled Windows:** Territories can be attacked anytime
- **Instant Combat:** Resolution happens immediately (no waiting)
- **Defender Notification:** Alert sent when territory attacked
- **Favors:** Active gangs, large numbers, strong players

**Attack Process:**
1. Attacker declares war on territory (costs energy)
2. System calculates attacker strength
3. Defender strength calculated (even if offline)
4. Destiny Deck hands drawn for all participants
5. Aggregate scores compared
6. Winner takes/keeps territory
7. Results logged, notifications sent

**Territory Benefits:**
- Passive income per hour
- Strategic map control
- Gang prestige and reputation
- Unlock specific resources

**Defense Strategies:**
- Keep gang strong (active recruitment)
- Upgrade territory defenses
- Ally with other gangs
- Maintain high member skill levels

---

## TUTORIAL & ONBOARDING

### NPC Mentor System with Quests

**Design:** Story-driven tutorial through guided missions

**Mentor NPCs:**
- **Sheriff Williams** (Settler path) - Teaches law, bounties, combat
- **Sage Crow Feather** (Nahi path) - Teaches spirits, nature, survival
- **Old Jim "Scar" McKenzie** (Frontera path) - Teaches crime, stealth, freedom

**Tutorial Flow:**

**Phase 1: Basics (5 minutes)**
1. Character creation (name, faction, appearance)
2. NPC mentor introduction
3. Basic movement and UI tour
4. First skill training started

**Phase 2: Combat (10 minutes)**
5. Destiny Deck explanation (with visual demo)
6. Practice duel against NPC
7. Win small reward (weapon, gold)
8. Healing and health system explained

**Phase 3: Activities (10 minutes)**
9. Attempt first crime (guided)
10. Visit NPC shop, buy item
11. Join chat channels, send message
12. Bank gold (banking system explained)

**Phase 4: Progression (5 minutes)**
13. Energy system explained
14. Skill training mechanics shown
15. Faction benefits overview
16. Territory control introduction

**Total Time:** ~30 minutes for full tutorial

**Skippable:** Experienced players can skip
**Rewards:** Tutorial completion gives starter pack:
- $500 gold
- Basic weapon
- Basic armor
- 3 healing items
- 50 extra energy (one-time)

---

## MODERATION & SAFETY

### Full Moderation Toolkit

**1. Player Reporting System**
- Report button on profiles, messages, gang pages
- Categories: Harassment, Cheating, Spam, Offensive Content
- Reports go to moderator dashboard
- Automated tracking of repeat offenders

**2. Automated Chat Filter**
- Block/censor offensive words
- Regex-based pattern matching
- Allow leetspeak detection (e.g., "@ss" = "ass")
- Filter bypasses logged for manual review

**3. Moderator Dashboard**
- View all reports
- Player history and logs
- Ban/mute tools
- View chat logs, action logs
- Analytics on moderation activity

**4. Mute/Block Players**
- Players can mute others (don't see their messages)
- Players can block others (can't message, duel)
- Self-service conflict resolution
- Doesn't affect gang wars or territory control

**Moderation Actions:**
- **Warning:** First offense, recorded
- **Mute:** Temporary (1-48 hours)
- **Temp Ban:** 1-30 days
- **Permanent Ban:** Severe violations
- **IP Ban:** Ban evasion

**Appeal Process:**
- Banned players can submit appeal
- Reviewed by senior moderator
- Response within 48 hours

---

## TECHNICAL INFRASTRUCTURE

### Email Service Integration
- **Provider:** SendGrid or Mailgun
- **Use Cases:**
  - Email verification
  - Password reset
  - Critical alerts
  - Optional notifications
  - Weekly digest
- **Rate Limits:** 10,000 emails/month (free tier sufficient for MVP)
- **Templates:** Pre-designed HTML email templates

### 2FA Implementation
- **Standard:** TOTP (Time-based One-Time Password)
- **Libraries:** `speakeasy` (Node.js TOTP library)
- **QR Codes:** Generate for easy app pairing
- **Backup Codes:** 10 single-use codes for recovery

### Backup Strategy
- **Frequency:** Daily at 3 AM UTC
- **Retention:** 30 days
- **Method:** MongoDB dump to compressed archive
- **Storage:** AWS S3 or DigitalOcean Spaces
- **Testing:** Monthly restore test
- **Cost:** ~$5-10/month for storage

### Anti-Cheat Systems

**Server-Side Validation:**
- All Destiny Deck draws on server (client never sees deck)
- Validate all actions before applying
- Check cooldowns, energy, requirements server-side
- Never trust client data

**Rate Limiting:**
- Actions limited per timeframe
- Detect impossible speeds (e.g., 10 crimes in 1 second)
- Block automated scripts

**Transaction Logging:**
- Log every game action with timestamp
- Store: user ID, action, outcome, IP address
- Retention: 90 days for analysis
- Enables investigation of exploits

**Automated Anomaly Detection:**
- Flag impossible actions (e.g., teleporting)
- Detect abnormal gains (e.g., $1M in 1 hour)
- Alert moderators for review
- Machine learning scoring system (post-MVP)

### API Rate Limiting
- **Limit:** 60 requests/minute per user
- **Implementation:** express-rate-limit middleware
- **Response:** 429 Too Many Requests
- **Bypass:** Premium users get 120 req/min (optional)

### Monitoring & Analytics

**Application Performance Monitoring (APM):**
- Tool: New Relic or DataDog
- Track: Response times, errors, throughput
- Alerts: Email/SMS on critical issues

**Error Tracking:**
- Tool: Sentry
- Real-time error reporting
- Source map support for TypeScript
- Alerts on new errors

**Uptime Monitoring:**
- Tool: UptimeRobot (free)
- Ping every 5 minutes
- Alert if down for 5+ minutes
- Status page for users

---

## LAUNCH STRATEGY

### Soft Launch Approach
- **Target:** Small initial playerbase (50-200 players)
- **Marketing:** Minimal push to niche communities
  - Indie game forums
  - Browser MMO communities
  - Reddit (r/webgames, r/browsergames, r/incremental_games)
  - Discord communities
- **Goal:** Controlled growth, find bugs, iterate

**Timeline:**
- **Week 1:** Closed alpha (50 invited players)
- **Week 2-3:** Open beta (public, small announcement)
- **Week 4+:** Iterative marketing based on feedback

**Success Criteria:**
- <5 critical bugs per week
- 50%+ Day 1 retention
- Positive community feedback
- Stable server performance

---

## ANALYTICS & METRICS

### Key Performance Indicators (KPIs)

**1. Player Retention**
- **Day 1 Retention:** % of new players who return next day
  - Target: 40-60%
- **Day 7 Retention:** % who return after 1 week
  - Target: 20-30%
- **Day 30 Retention:** % who return after 1 month
  - Target: 10-15%

**2. Daily/Monthly Active Users (DAU/MAU)**
- **DAU:** Unique users who log in each day
- **MAU:** Unique users who log in each month
- **DAU/MAU Ratio:** Engagement metric
  - Target: >20% (users log in 6+ days/month)

**Analytics Tools:**
- Google Analytics for web traffic
- Mixpanel or Amplitude for event tracking
- Custom dashboard for game-specific metrics

**Events to Track:**
- Account creation
- Tutorial completion
- First action (crime, duel, etc.)
- Skill level-ups
- Premium subscription
- Gang creation/joining
- Territory captures
- Daily logins

---

## LEGAL & COMPLIANCE

### Required Legal Documents

**1. Terms of Service (ToS)**
- User agreement and responsibilities
- Prohibited activities (cheating, harassment, etc.)
- Account termination conditions
- Limitation of liability
- Dispute resolution process

**2. Privacy Policy (GDPR Compliant)**
- Data collection disclosure
- How data is used
- Third-party services (Stripe, analytics)
- User rights (access, deletion, portability)
- Cookie usage
- Data retention policies

**3. Cookie Consent Banner**
- Required for EU users (GDPR)
- Must appear on first visit
- Options: Accept all, necessary only, customize
- Store consent in localStorage

**4. Age Verification**
- **Age Requirement:** 13+ (COPPA compliance)
- Checkbox: "I am 13 years or older"
- Parental consent for under 13 (future if needed)
- Ban underage users if discovered

**Legal Resources:**
- Template ToS and Privacy Policy generators
- Consult lawyer for final review (one-time cost: ~$500-1000)
- Update annually or when features change

---

## BALANCE & ECONOMY MONITORING

### Weekly Balance Reviews
- **Schedule:** Every Monday morning
- **Review:**
  - Skill usage stats (which skills are popular/unused?)
  - Combat win rates by faction
  - Territory control distribution
  - Economy metrics (gold creation/destruction)
  - Premium conversion rates

**Actions:**
- Buff underused skills
- Nerf overpowered builds
- Adjust gold income/costs
- Rebalance territory rewards

### Player Feedback Surveys
- **Frequency:** Monthly
- **Questions:**
  - Which systems feel unbalanced?
  - What's too difficult/easy?
  - What would you change?
- **Incentive:** $100 gold for completing survey

### Economy Dashboards

**Money Supply Tracking:**
- Total gold in circulation
- Gold created per day (faucets)
- Gold destroyed per day (sinks)
- Inflation rate

**Alerts:**
- Inflation >5% per week
- Deflation (money supply shrinking)
- Individual player with abnormal gains

**Tools:**
- Custom admin dashboard
- MongoDB aggregation queries
- Charts and visualizations

### Emergency Balance Hotfix Capability
- **Process:**
  1. Identify critical balance issue
  2. Discuss fix with team
  3. Update constants in database (no code deploy)
  4. Announce change to players
  5. Monitor impact
- **Examples:**
  - Skill bonus values
  - Gold costs/rewards
  - Energy costs
  - Territory income rates

---

## INCIDENT RESPONSE

### Incident Response Toolkit

**1. Rollback Capability**
- **When:** Major exploit causes game-breaking damage
- **Process:**
  1. Identify backup point (pre-exploit)
  2. Notify players of rollback
  3. Take server offline
  4. Restore MongoDB from backup
  5. Bring server back online
  6. Verify integrity
- **Risk:** Legitimate players lose progress
- **Compensation:** Give affected players bonus gold/energy

**2. Hotfix Deployment (Under 1 Hour)**
- **Prerequisites:**
  - On-call developer rotation
  - Automated deployment pipeline
  - Staging environment for testing
- **Process:**
  1. Identify bug/exploit
  2. Write fix
  3. Test in staging
  4. Deploy to production via CI/CD
  5. Verify fix
  6. Monitor for 24 hours

**3. Exploit Reporting Bounty Program**
- **Rewards:**
  - Minor exploit: $50 gold in-game
  - Moderate exploit: $500 gold + premium subscription (1 month)
  - Critical exploit: $2000 gold + premium (6 months) + special title
- **Requirements:**
  - Report privately (not public disclosure)
  - Provide reproduction steps
  - Don't exploit before reporting
- **Hall of Fame:** Public recognition for reporters

**4. Player Compensation**
- **When:** Bug harms players
- **Examples:**
  - Server downtime: 50 energy compensation
  - Lost items due to bug: Replacement + extra
  - False bans: Premium subscription (1 month) + apology
- **Goal:** Maintain goodwill, show we care

---

## DECISION LOG - COMPREHENSIVE LIST

### All 24 Critical Decisions Documented

| ID | Category | Question | Decision | Implementation Notes |
|----|----------|----------|----------|---------------------|
| D001 | Auth | Email verification? | REQUIRED | SendGrid integration |
| D002 | Auth | 2FA support? | OPTIONAL (authenticator apps) | TOTP with speakeasy |
| D003 | Combat | Death consequence? | Hospital time penalty | Torn-style system |
| D004 | Economy | Currency system? | Single currency (Gold) | No tokens, subscription model |
| D005 | Social | Gang size? | Medium (15-25) | Starting 10, upgradable to 25 |
| D006 | Progression | Skill queue? | One at a time | Strategic prioritization |
| D007 | Progression | Skill respec? | One free, then premium cost | Forgive mistakes, monetize changes |
| D008 | Onboarding | Tutorial style? | NPC mentor with quests | Story-driven, 30-min experience |
| D009 | Data | Inactive accounts? | Mark inactive, never delete | Always allow return |
| D010 | Territory | Attack timing? | 24/7 instant resolution | Favors active gangs |
| D011 | Safety | Moderation tools? | ALL (report, filter, dashboard, mute) | Comprehensive protection |
| D012 | Platform | Mobile support? | Responsive web, native later | MVP focus |
| D013 | Monetization | Premium features? | Hospital, vault, properties | Convenience, not power |
| D014 | Infrastructure | Backup frequency? | Daily, 30-day retention | Balance cost and safety |
| D015 | Security | Anti-cheat? | ALL (validation, logs, anomaly) | Multi-layered defense |
| D016 | Security | API rate limit? | 60 req/min | Prevent bots, allow gameplay |
| D017 | Operations | Incident response? | ALL (rollback, hotfix, bounty, compensation) | Full toolkit |
| D018 | Communication | Chat channels? | Global, Faction, Gang, Location | Comprehensive options |
| D019 | Engagement | Notifications? | Combat, gang, skills, energy | Keep players informed |
| D020 | Communication | Email alerts? | Critical + optional opt-in | Player choice |
| D021 | Identity | Character names? | Globally unique | WoW-style simplicity |
| D022 | Launch | Launch strategy? | Soft launch | Controlled growth |
| D023 | Analytics | Key metrics? | Retention + DAU/MAU | Core engagement KPIs |
| D024 | Legal | Compliance? | ALL (ToS, Privacy, Cookies, Age) | Full protection |

---

**End of Operations Playbook**

*This document represents the complete design specification for Desperados Destiny as of Phase 0.5 completion. Every major gameplay, technical, and operational decision has been documented and rationalized.*

*Ready to build.*

**— Ezra "Hawk" Hawthorne**
*Digital Frontiersman*
*November 15, 2025*
