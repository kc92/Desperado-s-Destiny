# DESPERADOS DESTINY - UX WIREFRAMES & SCREEN SPECIFICATIONS
## Complete UI/UX Blueprint for All Core Screens

**Version:** 1.0
**Last Updated:** November 15, 2025
**Status:** Phase 0.75 - Foundation Planning

---

## OVERVIEW

This document provides detailed wireframes and UX specifications for all core screens in Desperados Destiny. While not visual wireframes, these detailed descriptions provide complete implementation guidance for developers and designers.

**Design Philosophy:**
- **Western aesthetic:** Weathered wood, leather textures, wanted poster style
- **Card-based UI:** Playing cards as primary visual motif
- **Clarity over decoration:** Information-dense but readable
- **Mobile-friendly:** Responsive design, touch-optimized
- **Accessibility:** WCAG 2.1 AA compliant

---

## TABLE OF CONTENTS

1. [Screen Layouts Overview](#screen-layouts-overview)
2. [Login & Registration](#login--registration)
3. [Character Creation](#character-creation)
4. [Dashboard (Main Game Screen)](#dashboard-main-game-screen)
5. [Destiny Deck Interface](#destiny-deck-interface)
6. [Combat Result Screen](#combat-result-screen)
7. [Gang Management](#gang-management)
8. [Player Profile](#player-profile)
9. [Chat Interface](#chat-interface)
10. [Shop & Economy](#shop--economy)
11. [Skill Training](#skill-training)
12. [Settings & Account](#settings--account)
13. [Responsive Design](#responsive-design)
14. [Accessibility](#accessibility)

---

## SCREEN LAYOUTS OVERVIEW

### Global Layout Structure

All authenticated screens share this structure:

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (60px fixed)                                        │
│  [Logo] [Nav: Dashboard|Gang|Profile|Shop] [Energy|Gold]   │
└─────────────────────────────────────────────────────────────┘
┌─────────────┬───────────────────────────────┬───────────────┐
│             │                               │               │
│  SIDEBAR    │      MAIN CONTENT             │  RIGHT PANEL  │
│  (200px)    │      (fluid)                  │  (280px)      │
│             │                               │               │
│  Quick Nav  │   Screen-specific content     │   Chat        │
│  - Combat   │                               │   (global/    │
│  - Crimes   │                               │    faction/   │
│  - Travel   │                               │    gang)      │
│  - Skills   │                               │               │
│             │                               │   Online      │
│             │                               │   Players     │
│             │                               │               │
└─────────────┴───────────────────────────────┴───────────────┘
┌─────────────────────────────────────────────────────────────┐
│  FOOTER (40px)                                              │
│  © 2025 | Privacy | Terms | Support                         │
└─────────────────────────────────────────────────────────────┘
```

**Responsive Behavior:**
- **Desktop (>1200px):** Full 3-column layout
- **Tablet (768-1199px):** Sidebar collapses to hamburger menu, right panel below content
- **Mobile (<768px):** Single column, all panels accessible via bottom nav bar

---

## LOGIN & REGISTRATION

### Login Screen

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                    FULL-SCREEN BACKGROUND                   │
│              (Western landscape with logo overlay)          │
│                                                             │
│          ┌───────────────────────────────────┐             │
│          │     LOGIN CARD (450px wide)        │             │
│          │                                   │             │
│          │   [LOGO: Desperados Destiny]     │             │
│          │   "A Mythic Wild West MMORPG"    │             │
│          │                                   │             │
│          │   Email: [_________________]     │             │
│          │   Password: [_________________]  │             │
│          │   [x] Remember me                │             │
│          │                                   │             │
│          │   [       LOGIN BUTTON      ]    │             │
│          │                                   │             │
│          │   Forgot password? | Register    │             │
│          │                                   │             │
│          └───────────────────────────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- **Background:** Full-bleed image (western landscape, sunset, dusty town)
- **Login Card:** Centered, semi-transparent dark overlay, weathered paper texture
- **Logo:** Large, stylized western font with playing card motif
- **Input Fields:** Large, clear, email/password icons
- **Button:** Primary CTA (Call to Action), hover effect (raised, shadow)
- **Links:** "Forgot password" and "Register" secondary CTAs

**Interactions:**
- Enter key submits form
- Validation on blur (email format, password not empty)
- Error messages appear below inputs (red text, icon)
- Loading state: Button shows spinner, disabled

**Mobile Adjustments:**
- Card fills 90% of screen width
- Larger touch targets (48px minimum)
- Autofocus email field on load

---

### Registration Screen

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│          ┌───────────────────────────────────┐             │
│          │   REGISTRATION CARD (500px)       │             │
│          │                                   │             │
│          │   Create Your Account             │             │
│          │                                   │             │
│          │   Email: [_________________]     │             │
│          │   Password: [_________________]  │             │
│          │   Confirm: [_________________]   │             │
│          │                                   │             │
│          │   [x] I agree to Terms of Service│             │
│          │   [x] I agree to Privacy Policy   │             │
│          │   [ ] Send me marketing emails    │             │
│          │                                   │             │
│          │   [     CREATE ACCOUNT      ]    │             │
│          │                                   │             │
│          │   Already have an account? Login  │             │
│          │                                   │             │
│          └───────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- **Password Strength Indicator:** Bar below password field (red → yellow → green)
- **Checkboxes:** Clear labels, GDPR compliant (opt-in, not pre-checked for marketing)
- **Validation:** Real-time (email format, password strength, matching passwords)
- **Error Messages:** Inline, specific ("Password must be 8+ characters with uppercase, lowercase, number, and special character")

**Flow:**
1. Fill form
2. Click "Create Account"
3. Account created → Email sent ("Check your email to verify")
4. Redirect to "Verify Email" screen

---

## CHARACTER CREATION

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   STEP 1 of 3: Choose Your Name                            │
│   ═══════════════════════════════════                       │
│                                                             │
│   Character Name: [_________________________]              │
│   (3-20 characters, unique across all players)             │
│                                                             │
│   [         CHECK AVAILABILITY          ]                  │
│                                                             │
│   Available names: Wild Bill, Doc Holliday, Calamity Jane │
│   (Suggestions based on western theme)                     │
│                                                             │
│                         [NEXT]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   STEP 2 of 3: Choose Your Faction                         │
│   ═══════════════════════════════════                       │
│                                                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│   │  SETTLER    │  │    NAHI     │  │  FRONTERA   │       │
│   │  ALLIANCE   │  │  COALITION  │  │             │       │
│   │             │  │             │  │             │       │
│   │  [Image]    │  │  [Image]    │  │  [Image]    │       │
│   │             │  │             │  │             │       │
│   │  Progress & │  │  Spirit &   │  │  Freedom &  │       │
│   │  Order      │  │  Heritage   │  │  Cunning    │       │
│   │             │  │             │  │             │       │
│   │  [SELECT]   │  │  [SELECT]   │  │  [SELECT]   │       │
│   └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                             │
│   Faction bonuses, lore, and territories explained below   │
│                                                             │
│                    [BACK]  [NEXT]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   STEP 3 of 3: Customize Appearance                        │
│   ═══════════════════════════════════                       │
│                                                             │
│   ┌──────────────┐                                         │
│   │              │    Avatar:    [Preset 1] [2] [3] [4]    │
│   │   PREVIEW    │                                         │
│   │              │    Hat:       [None] [Cowboy] [Top]     │
│   │              │                                         │
│   │              │    Clothing:  [Duster] [Vest] [Poncho] │
│   │              │                                         │
│   └──────────────┘                                         │
│                                                             │
│   Bio (optional):                                          │
│   [____________________________________________]            │
│   [____________________________________________]            │
│   (Max 500 characters)                                     │
│                                                             │
│                    [BACK]  [CREATE CHARACTER]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- **Progress Indicator:** Steps 1-3, visual progress bar
- **Name Input:** Real-time availability check (debounced API call)
- **Faction Cards:** Large, clickable, with hover effect (glow, slight scale)
- **Avatar Customization:** Simple presets (complex customization post-MVP)
- **Bio Text Area:** Character counter, profanity filter

**Flow:**
1. Choose name (check availability)
2. Choose faction (read lore, see bonuses)
3. Customize avatar
4. Click "Create Character" → Dashboard

---

## DASHBOARD (MAIN GAME SCREEN)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: [Logo] [Dashboard|Gang|Profile|Shop]  [⚡125/150] [$12,450]
└─────────────────────────────────────────────────────────────┘
┌──────────┬─────────────────────────────────────┬────────────┐
│ SIDEBAR  │       MAIN CONTENT                  │ RIGHT      │
│          │                                     │ PANEL      │
│ Combat   │  ┌──────────────────────────────┐  │            │
│ > Duel   │  │  CHARACTER STATUS            │  │ CHAT       │
│ > Bounty │  │                              │  │ ┌────────┐ │
│          │  │  Wild Bill (Level 25)        │  │ │Global  │ │
│ Crimes   │  │  Frontera Faction            │  │ │Faction │ │
│ > Bank   │  │                              │  │ │Gang    │ │
│ > Train  │  │  ♥ Health: ████████░░ 85/100 │  │ └────────┘ │
│          │  │  ⚡ Energy: ██████░░░░ 125/150│  │            │
│ Travel   │  │  💀 Fatigue: ███░░░░░░ 35/100│  │ [Message]  │
│ > Towns  │  │                              │  │ ───────    │
│ > Wilds  │  │  In: Red Gulch               │  │ Player1:   │
│          │  │  Status: Active              │  │ "Hello!"   │
│ Skills   │  └──────────────────────────────┘  │            │
│ > Train  │                                     │ Player2:   │
│ > Respec │  ┌──────────────────────────────┐  │ "Anyone    │
│          │  │  QUICK ACTIONS               │  │ up for a   │
│ Gang     │  │                              │  │ duel?"     │
│ > Vault  │  │  [Challenge Duel]            │  │            │
│ > Wars   │  │  [Rob Bank] (50 energy)      │  │ ───────    │
│          │  │  [Train Skill]               │  │            │
│ Profile  │  │  [Visit Shop]                │  │ ONLINE     │
│          │  └──────────────────────────────┘  │ (25 online)│
│          │                                     │ ─────────  │
│          │  ┌──────────────────────────────┐  │ • Player1  │
│          │  │  RECENT ACTIVITY             │  │ • Player2  │
│          │  │                              │  │ • Player3  │
│          │  │  10 min ago: Won duel vs Doc │  │ ...        │
│          │  │  1 hr ago: Robbed bank ($5k) │  │            │
│          │  │  2 hrs ago: Joined gang      │  │            │
│          │  └──────────────────────────────┘  │            │
└──────────┴─────────────────────────────────────┴────────────┘
```

**Key Components:**

**Energy Display (Header):**
- Icon: Lightning bolt (⚡)
- Value: Current/Max (125/150)
- Color: Green (>50%), Yellow (25-50%), Red (<25%)
- Tooltip on hover: "Regenerates 5 per hour. Next regen: 10:45 AM"

**Gold Display (Header):**
- Icon: Dollar sign ($)
- Value: Current balance (formatted: $12,450)
- Tooltip: "Earned from duels, crimes, and sales"

**Character Status Card:**
- Health bar: Visual progress bar with number
- Energy bar: Visual progress bar with number
- Fatigue bar: Visual progress bar with number
- Location: Current area name
- Status: Active/Hospital/Jail

**Quick Actions:**
- Large, colorful buttons
- Energy cost displayed on button
- Disabled if insufficient energy (grayed out, tooltip explains why)

**Recent Activity Feed:**
- Last 5-10 actions
- Timestamps (relative: "10 min ago")
- Icons for action type

**Sidebar Navigation:**
- Collapsible sections
- Active page highlighted
- Icon + text labels
- Responsive (hamburger menu on mobile)

---

## DESTINY DECK INTERFACE

**Layout (Combat/Crime Action):**

```
┌─────────────────────────────────────────────────────────────┐
│                     DUEL: Wild Bill vs Doc Holliday         │
│                                                             │
│   ATTACKER: Wild Bill (You)        DEFENDER: Doc Holliday   │
│   Level: 25                        Level: 28                │
│   Faction: Frontera                Faction: Settler          │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐ │
│   │         DESTINY DECK - DRAWING CARDS...              │ │
│   │                                                      │ │
│   │        YOUR HAND                   OPPONENT HAND     │ │
│   │                                                      │ │
│   │   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐    ┌───┐ ┌───┐    │ │
│   │   │ A │ │ K │ │ Q │ │ J │ │10 │    │ 7 │ │ 7 │    │ │
│   │   │ ♠ │ │ ♠ │ │ ♠ │ │ ♠ │ │ ♠ │    │ ♣ │ │ ♥ │    │ │
│   │   └───┘ └───┘ └───┘ └───┘ └───┘    └───┘ └───┘    │ │
│   │                                     ┌───┐ ┌───┐ ┌───┐│ │
│   │        ROYAL FLUSH                  │ A │ │ K │ │ 3 ││ │
│   │        Base Score: 500              │ ♦ │ │ ♠ │ │ ♠ ││ │
│   │        + Spades Bonus: 136.4        └───┘ └───┘ └───┘│ │
│   │        ─────────────────                            │ │
│   │        TOTAL: 636.4                  PAIR OF 7s     │ │
│   │                                     Total: 156.57   │ │
│   │                                                      │ │
│   │              WINNER: Wild Bill                      │ │
│   │              Damage Dealt: 55                       │ │
│   │                                                      │ │
│   └──────────────────────────────────────────────────────┘ │
│                                                             │
│                         [CONTINUE]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Animation Sequence:**

1. **Pre-Combat (2 seconds):**
   - Characters face off
   - Text: "Drawing cards from the Destiny Deck..."

2. **Card Draw Animation (3 seconds):**
   - Cards flip one by one (0.5s each)
   - Sound effect: Card flip
   - Cards settle into position

3. **Hand Evaluation (2 seconds):**
   - Hand rank appears below cards
   - Score calculation appears (animated counter)
   - Suit bonuses highlighted (glowing suit symbols)

4. **Winner Reveal (2 seconds):**
   - Winner's cards glow
   - Winner name displayed in large text
   - Loser's cards dim

5. **Results (persistent):**
   - Damage dealt
   - Loot gained
   - Experience earned
   - Continue button enabled

**Components:**

**Card Visuals:**
- Standard playing card design
- Suit symbols: ♠ ♥ ♣ ♦ in faction colors
- Large, readable rank (A, K, Q, J, 10, etc.)
- Smooth flip animation (CSS 3D transform)

**Score Display:**
- Hand rank name (e.g., "Royal Flush")
- Base score from hand
- Suit bonuses (breakdown by suit)
- Total score (bold, large)

**Winner Announcement:**
- Large text overlay
- Particle effects (sparks, cards flying)
- Sound effect: Victory fanfare

---

## COMBAT RESULT SCREEN

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                     DUEL RESULT - VICTORY!                  │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐ │
│   │  You defeated Doc Holliday!                          │ │
│   │                                                      │ │
│   │  Damage Dealt: 55                                   │ │
│   │  Doc Holliday sent to hospital for 30 minutes       │ │
│   │                                                      │ │
│   │  REWARDS:                                            │ │
│   │  + $150 gold                                         │ │
│   │  + 250 experience                                    │ │
│   │  + 10 Frontera reputation                            │ │
│   │                                                      │ │
│   │  YOUR STATS:                                         │ │
│   │  Duels Won: 48 (+1)                                  │ │
│   │  Total Damage Dealt: 12,345 (+55)                    │ │
│   │  Frontera Reputation: 810 (+10)                      │ │
│   │                                                      │ │
│   │  [VIEW COMBAT LOG]  [REMATCH]  [RETURN TO DASHBOARD]│ │
│   └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- **Victory/Defeat Banner:** Large, colorful, animated
- **Rewards Summary:** Icons + text for gold, XP, reputation
- **Stats Update:** Show before/after with highlight on change
- **Action Buttons:** View details, rematch, return home

---

## GANG MANAGEMENT

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  GANG: The Desperados [DESP]                    Frontera   │
└─────────────────────────────────────────────────────────────┘
┌──────────┬─────────────────────────────────────┬────────────┐
│ TABS     │       CONTENT                       │ SIDEBAR    │
│          │                                     │            │
│ Overview │  ┌──────────────────────────────┐  │ VAULT      │
│ Members  │  │  GANG STATS                   │  │            │
│ Vault    │  │                              │  │ Gold:      │
│ Wars     │  │  Members: 18/25              │  │ $45,000    │
│ Terr.    │  │  Territories: 3              │  │            │
│ Settings │  │  Total Wars: 5               │  │ [DEPOSIT]  │
│          │  │  Wars Won: 3                 │  │ [WITHDRAW] │
│          │  │  Total Wealth: $125,000      │  │            │
│          │  │                              │  │ TERRIT.    │
│          │  │  Leader: Wild Bill           │  │            │
│          │  │  Officers: Annie, Jesse      │  │ • Silver   │
│          │  │                              │  │   Mine     │
│          │  │  Founded: Oct 1, 2025        │  │ • Trading  │
│          │  └──────────────────────────────┘  │   Post     │
│          │                                     │ • Outlaw   │
│          │  ┌──────────────────────────────┐  │   Camp     │
│          │  │  GANG DESCRIPTION            │  │            │
│          │  │                              │  │            │
│          │  │  "We ride together, we die   │  │            │
│          │  │   together."                 │  │            │
│          │  │                              │  │            │
│          │  │  Recruitment: OPEN           │  │            │
│          │  │                              │  │            │
│          │  │  [EDIT] (Officers only)      │  │            │
│          │  └──────────────────────────────┘  │            │
└──────────┴─────────────────────────────────────┴────────────┘
```

**Members Tab:**
```
┌─────────────────────────────────────────────────────────────┐
│  MEMBERS (18/25)                              [INVITE PLAYER]│
│                                                             │
│  Search: [_____________]  Filter: [All|Officers|Members]   │
│                                                             │
│  NAME           RANK      LEVEL  LAST ACTIVE  CONTRIBUTED  │
│  ─────────────────────────────────────────────────────────  │
│  Wild Bill      Leader    25     Online       $15,000      │
│  Annie Oakley   Officer   32     10 min ago   $22,000      │
│  Jesse James    Officer   28     1 hr ago     $18,500      │
│  Billy the Kid  Member    20     2 hrs ago    $5,000       │
│  ...                                                        │
│                                                             │
│  [PROMOTE] [DEMOTE] [KICK] (Officers only)                 │
└─────────────────────────────────────────────────────────────┘
```

**Vault Tab:**
```
┌─────────────────────────────────────────────────────────────┐
│  GANG VAULT                                                 │
│                                                             │
│  Total Gold: $45,000                                        │
│  Your Contribution: $15,000 (33%)                           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  DEPOSIT                                             │  │
│  │                                                      │  │
│  │  Amount: [__________]  (Max: $12,450 from your gold)│  │
│  │                                                      │  │
│  │  [DEPOSIT TO VAULT]                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  WITHDRAW (Officers Only)                            │  │
│  │                                                      │  │
│  │  Amount: [__________]  (Max: $45,000)                │  │
│  │  Reason: [_______________________]                   │  │
│  │                                                      │  │
│  │  [WITHDRAW FROM VAULT]                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  RECENT TRANSACTIONS:                                       │
│  ───────────────────────────────────────────────────────   │
│  Wild Bill deposited $5,000        2 hours ago             │
│  Annie Oakley withdrew $3,000      1 day ago               │
│  (Reason: Territory defense)                               │
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## PLAYER PROFILE

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  PLAYER PROFILE: Wild Bill                    [EDIT PROFILE]│
└─────────────────────────────────────────────────────────────┘
┌──────────┬─────────────────────────────────────┬────────────┐
│ AVATAR   │       MAIN INFO                     │ STATS      │
│          │                                     │            │
│ [Image]  │  Wild Bill                          │ Level: 25  │
│          │  "The Quick Draw"                   │ XP: 50,000 │
│          │  Frontera Faction                   │            │
│          │  Member of The Desperados [DESP]    │ Duels Won: │
│          │                                     │ 48         │
│          │  Bio:                               │            │
│          │  "Fastest gun in the Sangre         │ Duels Lost:│
│          │   Territory. Don't test me."        │ 12         │
│          │                                     │            │
│          │  Joined: Oct 15, 2025               │ Win Rate:  │
│          │  Last Active: Just now              │ 80%        │
│          │                                     │            │
│          │  ┌──────────────────────────────┐  │ Crimes:    │
│          │  │  TOP SKILLS                   │  │ 156        │
│          │  │                              │  │            │
│          │  │  Gun Fighting: 45            │  │ Territ:    │
│          │  │  Lockpicking: 32             │  │ 3          │
│          │  │  Horse Riding: 28            │  │            │
│          │  │  ...                         │  │ Gold:      │
│          │  └──────────────────────────────┘  │ $12,450    │
│          │                                     │            │
│          │  [CHALLENGE TO DUEL]  [SEND MESSAGE]│            │
└──────────┴─────────────────────────────────────┴────────────┘
```

**Components:**
- **Avatar:** Large character image
- **Name & Title:** Prominent display
- **Faction Badge:** Icon + color
- **Gang Tag:** Clickable link to gang page
- **Bio:** User-written text (500 char max)
- **Top Skills:** Top 5 skills by level
- **Stats Panel:** Key achievements
- **Action Buttons:** Challenge duel, send message (if implemented)

---

## CHAT INTERFACE

**Layout (Right Panel on Desktop):**

```
┌────────────────────────────────┐
│  CHAT                          │
│                                │
│  [Global] [Faction] [Gang]     │  ← Tabs
│  ───────────────────────────── │
│                                │
│  <Player1>: Anyone for a duel? │
│  <Player2>: I'm in!            │
│  <You>: Count me in too        │
│  <Player3>: Where's the best   │
│             place to rob?      │
│  <Moderator>: Keep it civil!   │
│                                │
│  ─────────── (scrollable) ───  │
│                                │
│  [Type message here...]  [Send]│
└────────────────────────────────┘
```

**Components:**
- **Channel Tabs:** Switch between global/faction/gang/location
- **Message List:** Scrollable, auto-scroll to bottom on new message
- **Message Format:** `<Username>: Message text`
- **Moderator Messages:** Highlighted background (yellow)
- **System Messages:** Gray, italic ("Player1 joined the game")
- **Input Field:** Max 500 characters, Enter to send
- **Emojis:** Picker button (optional)

**Real-Time Updates:**
- Socket.io integration
- New messages appear instantly
- Typing indicator ("Player1 is typing...")
- Online status indicators (green dot = online)

---

## SHOP & ECONOMY

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  SHOP                            Your Gold: $12,450         │
└─────────────────────────────────────────────────────────────┘
┌──────────┬─────────────────────────────────────┬────────────┐
│ CATEGORY │       ITEMS                         │ CART       │
│          │                                     │            │
│ Weapons  │  Filter: [All] [Common] [Rare]     │ 2 items    │
│ Armor    │  Sort: [Price] [Name] [Rarity]     │            │
│ Consumab │                                     │ Colt .45:  │
│ Material │  ┌──────────────────────────────┐  │ $250       │
│ Horses   │  │ [IMG] Colt .45 Peacemaker    │  │            │
│          │  │                              │  │ Leather:   │
│          │  │ Weapon (Common)              │  │ $100       │
│          │  │ Damage: +15                  │  │            │
│          │  │ ♣ Clubs Bonus: +5            │  │ ─────────  │
│          │  │                              │  │ Total:     │
│          │  │ Price: $250                  │  │ $350       │
│          │  │                              │  │            │
│          │  │ [ADD TO CART]  [BUY NOW]     │  │ [CHECKOUT] │
│          │  └──────────────────────────────┘  │            │
│          │                                     │            │
│          │  ┌──────────────────────────────┐  │            │
│          │  │ [IMG] Leather Vest           │  │            │
│          │  │                              │  │            │
│          │  │ Armor (Common)               │  │            │
│          │  │ Defense: +10                 │  │            │
│          │  │                              │  │            │
│          │  │ Price: $100                  │  │            │
│          │  │                              │  │            │
│          │  │ [ADD TO CART]  [BUY NOW]     │  │            │
│          │  └──────────────────────────────┘  │            │
└──────────┴─────────────────────────────────────┴────────────┘
```

**Components:**
- **Category Sidebar:** Filter items by type
- **Filters & Sort:** Rarity, price, name
- **Item Cards:** Image, name, rarity, stats, price
- **Shopping Cart:** Persistent, shows total
- **Buy Now:** Instant purchase, skips cart
- **Checkout:** Confirm purchase modal

---

## SKILL TRAINING

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  SKILL TRAINING                                             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ACTIVE TRAINING                                     │  │
│  │                                                      │  │
│  │  Gun Fighting: Level 45 → 46                         │  │
│  │  Started: 2 hours ago                                │  │
│  │  Completes in: 16 hours 23 minutes                   │  │
│  │                                                      │  │
│  │  Progress: ████████████████████░░░░░░ 72%            │  │
│  │                                                      │  │
│  │  [CANCEL TRAINING]                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ALL SKILLS (20 total)                                      │
│  ───────────────────────────────────────────────────────   │
│                                                             │
│  COMBAT SKILLS                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Gun Fighting      Level 45  [████████░] 87%          │  │
│  │ ♣ Clubs Bonus: +40.40                                │  │
│  │ Training to 46: 18 hours                             │  │
│  │ [TRAIN]                                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Brawling          Level 22  [███░░░░░░] 35%          │  │
│  │ ♣ Clubs Bonus: +18.35                                │  │
│  │ Training to 23: 8 hours                              │  │
│  │ [TRAIN]                                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  CRIMINAL SKILLS                                            │
│  (Similar cards for Lockpicking, Stealth, etc.)             │
│                                                             │
│  [RESPEC ALL SKILLS] (1 free respec remaining)              │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- **Active Training Card:** Shows current training progress
- **Progress Bar:** Visual + percentage
- **Time Remaining:** Countdown timer (updates every minute)
- **Skill Cards:** Level, progress, suit bonus, training time
- **Train Button:** Starts training (disabled if already training)
- **Respec Button:** Resets all skills (confirmation modal)

---

## SETTINGS & ACCOUNT

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  ACCOUNT SETTINGS                                           │
└─────────────────────────────────────────────────────────────┘
┌──────────┬─────────────────────────────────────────────────┐
│ SECTIONS │       CONTENT                                   │
│          │                                                 │
│ Account  │  ┌───────────────────────────────────────────┐ │
│ Profile  │  │  ACCOUNT INFORMATION                       │ │
│ Privacy  │  │                                           │ │
│ Premium  │  │  Email: user@example.com  [Change]        │ │
│ Security │  │  Password: ********        [Change]        │ │
│          │  │                                           │ │
│          │  │  Account Status: Active                   │ │
│          │  │  Member Since: Oct 15, 2025               │ │
│          │  │                                           │ │
│          │  └───────────────────────────────────────────┘ │
│          │                                                 │
│          │  ┌───────────────────────────────────────────┐ │
│          │  │  PRIVACY & DATA                           │ │
│          │  │                                           │ │
│          │  │  [x] Marketing Emails                     │ │
│          │  │  [x] Analytics Tracking                    │ │
│          │  │                                           │ │
│          │  │  [DOWNLOAD MY DATA] (GDPR)                │ │
│          │  │  [DELETE MY ACCOUNT] (GDPR)               │ │
│          │  └───────────────────────────────────────────┘ │
│          │                                                 │
│          │  ┌───────────────────────────────────────────┐ │
│          │  │  TWO-FACTOR AUTHENTICATION                │ │
│          │  │                                           │ │
│          │  │  Status: Disabled                         │ │
│          │  │                                           │ │
│          │  │  [ENABLE 2FA]                             │ │
│          │  └───────────────────────────────────────────┘ │
└──────────┴─────────────────────────────────────────────────┘
```

---

## RESPONSIVE DESIGN

### Breakpoints

- **Mobile:** <768px
- **Tablet:** 768px - 1199px
- **Desktop:** ≥1200px

### Mobile Adaptations

**Layout Changes:**
- Sidebar collapses into hamburger menu
- Right panel (chat) moves below content or accessible via FAB (Floating Action Button)
- 3-column layout becomes single column
- Cards stack vertically

**Touch Optimizations:**
- All interactive elements: 48px minimum touch target
- Swipe gestures: Swipe left/right to navigate tabs
- Pull-to-refresh: Refresh dashboard
- Long-press: Context menus

**Font Sizes:**
- Base: 16px (mobile) vs 14px (desktop)
- Headings: 1.5x larger on mobile for readability

---

## ACCESSIBILITY

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text-to-background: Minimum 4.5:1 ratio
- Large text (18pt+): Minimum 3:1 ratio
- Interactive elements: Minimum 3:1 ratio

**Keyboard Navigation:**
- All interactive elements focusable with Tab key
- Focus indicators visible (2px blue outline)
- Skip links ("Skip to main content")
- Logical tab order

**Screen Reader Support:**
- Semantic HTML (header, nav, main, footer)
- ARIA labels for icons and image buttons
- Alt text for all images
- Form labels associated with inputs

**Assistive Features:**
- Text can scale 200% without breaking layout
- No content requires horizontal scrolling
- Audio/animations can be paused
- Time limits can be extended (energy regen countdown)

---

## CONCLUSION

These wireframes and UX specifications provide **complete implementation guidance** for:

- **10+ core screens** with detailed layouts
- **Component specifications** for all UI elements
- **User flows** through key features
- **Responsive design** for mobile/tablet/desktop
- **Accessibility** standards (WCAG 2.1 AA)

Developers and designers now have a **blueprint to build** the complete Desperados Destiny interface.

---

**Document Status:** ✅ Complete
**Screens Defined:** 10+ core screens
**Component Library:** Next document
**Ready for Design/Development:** Yes

*— Ezra "Hawk" Hawthorne*
*UX Architect*
*November 15, 2025*
