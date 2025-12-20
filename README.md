# DESPERADOS DESTINY 🎴🤠
## A Mythic Wild West MMORPG

**Status:** Feature Complete, Content Rich, "EVE-lite" Economy. Moving towards Polish. | **Progress:** ~95% Complete | **Phase:** Tutorial Refactor & Polish

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)](https://www.mongodb.com/)

---

## 🎮 What Is Desperados Destiny?

A browser-based persistent MMORPG set in 1875 Sangre Territory, where the wild west meets poker-powered fate. Every action—combat, crime, crafting, social encounters—resolves through the **Destiny Deck**, a unique poker-based challenge system.

**Think:** Torn meets Red Dead Redemption with poker as the core mechanic.

**Platform:** Web Browser (Desktop & Mobile)
**Status:** Active Development (All major Sprints Complete, ~200,000+ lines of code)
**Timeline:** Final polish and preparation for Beta Launch (Q2 2026)

---

## 🌵 THE CORE CONCEPT

### The Destiny Deck System

Every action in the game resolves through a poker hand draw:

1. **System draws 5 cards** from a standard 52-card deck
2. **Hand strength** (Pair, Straight, Flush, etc.) determines base success
3. **Four suits** represent different aspects of frontier life:
   - **♠ Spades** = Cunning, Stealth, Trickery *(the outlaw's suit)*
   - **♥ Hearts** = Spirit, Charisma, Medicine *(the people's suit)*
   - **♣ Clubs** = Force, Combat, Violence, Intimidation *(the warrior's suit)*
   - **♦ Diamonds** = Wealth, Craft, Material, Production *(the prospector's suit)*
4. **Your skills** provide bonuses to relevant suits
5. **Final outcome** = Hand strength + Suit bonuses

> Example: Attempting to pick a bank safe? You draw A♠ K♠ 7♣ 3♥ 3♦ (Pair). Your Lockpicking skill (Level 45) gives +28.75 Spades bonus. Combined with the high Spades cards, you succeed!

### Three-Faction Conflict

Players choose allegiance in a three-way war for the **Sangre Territory**:

- **🏛️ Settler Alliance** - Progress, law & order, railroad expansion, Manifest Destiny
- **🪶 Nahi Coalition** - Defend sacred lands, preserve culture, spiritual balance *(fictional Native nations)*
- **🔪 Frontera** - Lawless freedom, outlaws, smugglers, survival of the cunning

Each faction offers unique abilities, territories, and moral perspectives on the frontier conflict.

### Deep Progression

- **20-25 skills** that take months/years to master (Torn-style)
- **Time-based training** continues even when logged out
- **Territory control** for passive income and strategic advantage
- **Gang warfare** for organized PvP and territory domination
- **Heavy roleplay** support with player-driven content

---

## ✨ Features

### ✅ Implemented & Production-Ready (All Major Sprints Completed)

**Core Systems:**
- 🔐 **Complete authentication** (JWT, email verification, password reset)
- 👤 **Character creation** (3 factions, full appearance customization)
- ⚡ **Energy system** (regeneration, transaction-safe spending)
- 🎴 **Destiny Deck poker engine** (2,305 LOC, 8+ game variants, mathematically perfect)
- 📈 **Skill training** (20-25 skills, offline progression, 450 LOC)
- ⚔️ **Combat system** (turn-based, NPC encounters, boss fights, PvP duels)
- 🦹 **Crime system** (681 LOC, jail/bail, witness detection, bounties)

**Social & Multiplayer:**
- 💬 **Real-time chat** (Global, Faction, Gang, Whisper rooms)
- 👥 **Friends system** (requests, blocking, relationship tracking)
- 📧 **Mail system** (attachments, item/gold transfers)
- 🏴 **Gang system** (905 LOC: creation, hierarchy, bank, upgrades, warfare)
- 🗺️ **Territory control** (faction wars, influence, control points)

**Economy & Progression:**
- 🏪 **Shop system** (NPC vendors, inventory management)
- 📊 **Marketplace** (1,482 LOC: auctions, buy-now, price history)
- 🏠 **Property system** (ownership, rentals, foreclosures, workers)
- 🎣 **Professions** (Fishing, Hunting, Crafting - 572/381/825 LOC)
- 💰 **Comprehensive Crafting Overhaul:** Includes new raw materials (Cotton, Flax, Wool, Sand), refined materials (Ingots, Leathers, Cloths, Glass), core components (Blade Blanks, Rifle Barrels, Boot Soles, Empty Vials), and 30+ crafting tools across various quality tiers.
- 🎰 **Gambling & Entertainment** (Poker, Blackjack, Horse Racing, Shooting Contests - with dedicated item sets)
- 🚂 **Travel systems** (Stagecoach, Train, Horse - with robbery mechanics)

**Advanced Features:**
- 📜 **Quest system** (framework complete, trigger integration, initial content)
- 🤖 **NPC AI** (schedules, moods, gossip, news reactions, relationships) - Expanded with diverse NPCs for multiple zones.
- 🎯 **Action challenges** (deck-based resolution for all activities)
- 🏆 **Achievements & Leaderboards**
- 🎁 **Daily contracts & Login rewards**
- 🌦️ **Dynamic weather & day/night cycle**
- 📅 **In-game calendar** with seasonal events
- 👨‍🏫 **Mentor system** for player guidance - Tutorial system fully refactored for AAA quality experience with core onboarding and deep-dive modules.

**Infrastructure:**
- 🐳 **One-command dev environment** (Docker, hot reload)
- 🧪 **88 test files** (integration, unit, component)
- 🎨 **Western-themed UI** (custom TailwindCSS theme, 51 pages)
- 🛡️ **Admin dashboard** (user management, economy monitoring, server health)
- 🔐 **Security audit complete** (13 critical endpoints secured, audit logging)

### ⏳ Coming Next (Final Polish to Beta Launch)
- ⚔️ **PvP Duel Real-Time Frontend** (~6 hours - Socket.io integration, live game interface)
- 🐳 **Docker Compose Production Files** (~1 hour - staging/prod configs)
- 🧪 **Load testing** (500+ concurrent socket connections)
- 💳 **Payment integration** (Stripe for premium subscriptions - deferred)

### ✅ Recently Verified Complete (Session 9 Audit)
- 🎴 **Destiny Deck Animations** - 99% complete (3D flips, particles, victory effects)
- 📜 **Quest System** - 100% complete (14 quests + procedural templates)
- 🏆 **Tournament UI** - 90% complete (bracket visualization, registration)
- 🧪 **E2E Testing** - 112 tests ready (Puppeteer + intelligent bots)

### 🗺️ Completed Sprints
- **Sprint 1-2:** ✅ Foundation (Auth, Character, Energy, Deck Engine)
- **Sprint 3:** ✅ Core Gameplay (Skills, Deck UI, Training)
- **Sprint 4:** ✅ Combat & Crimes (PvE, jail, bounties - 860 LOC combat)
- **Sprint 5:** ✅ Social (Chat, gangs, friends, mail - 4 systems)
- **Sprint 6:** ✅ Territories (faction warfare, control, influence)
- **Sprint 7:** ✅ Quests (framework complete, trigger integration)
- **Current Session:** ✅ Extensive Content Authoring (Items, NPCs, Locations, Crafting Overhaul) & ✅ Comprehensive Tutorial Refactor

### 🎯 Final Sprint (Sprint 8)
- **Final Polish:** Visual effects, load testing, bug fixing.

---

## 🗺️ THE SANGRE TERRITORY

Our starting region is a lawless border frontier in the mythic American Southwest (circa 1870s):

- **Red Gulch** - Booming settler town, railroad terminus, law & order
- **The Frontera** - Outlaw haven, black market, neutral ground
- **Kaiowa Mesa** - Sacred native territory, spiritual center
- **Sangre Canyon** - Dangerous wilderness, contested territories
- **The Frontier** - Expanded with new mines, crossroads, and fishing creeks.

Future updates will expand to new regions (Great Plains, Pacific Northwest, etc.)

---

## 🛠️ TECH STACK

**Backend:**
- Node.js 18+ with Express.js
- TypeScript 5.x
- MongoDB 6.x (character data)
- Redis 7.x (caching, sessions)
- Socket.io 4.x (real-time)

**Frontend:**
- React 18+ with TypeScript
- TailwindCSS 3.x (western theming)
- Socket.io-client (real-time updates)
- Zustand (state management)

**Infrastructure:**
- Docker (containerization)
- Nginx (reverse proxy)
- PM2 (process management)
- GitHub Actions (CI/CD)
- DigitalOcean / AWS (hosting)

---

## 📁 Project Structure

For a detailed breakdown of the project's monorepo structure, individual workspaces (server, client, shared), and key directories, please refer to the [Development Guide](docs/DEVELOPMENT.md).

## 🚀 Quick Start

For detailed prerequisites, setup instructions, and development workflows, please refer to the [Development Guide](docs/DEVELOPMENT.md).

### Setup (< 5 minutes)
```bash
# Clone repository
git clone <repo-url>
cd "Desperados Destiny Dev"

# Run setup script (creates .env, generates secrets)
npm run setup

# Install dependencies
npm install

# Start all services (MongoDB, Redis, backend, frontend)
npm run dev
```

**Services:**
- 🌐 **Frontend:** http://localhost:5173
- 🔧 **Backend:** http://localhost:5001
- 🗄️ **MongoDB:** mongodb://localhost:27017
- 💾 **Redis:** redis://localhost:6379

### Verify Setup
```bash
npm run health
```

All services should show "healthy" status.

### Try It Out
1. Visit http://localhost:5173
2. Register a new account
3. Create a character
3. Choose your faction
4. Experience the energy system!

---

## 📚 Documentation

### Essential Reads
- 📋 **[Session Handoff](docs/SESSION-HANDOFF.md)** - Complete context for next session (MUST READ!)
- 📊 **[Project Status](docs/PROJECT-STATUS.md)** - Current state dashboard
- 🗓️ **[Sprint Plan](docs/SPRINT-PLAN.md)** - Complete 8-sprint roadmap
- 📖 **[Development Log](docs/development-log.md)** - Full session history

### Technical Docs
- 🔐 **[Authentication Guide](server/AUTHENTICATION.md)** - Auth system (500+ lines)
- 🧪 **[Testing Guide](docs/TESTING.md)** - How to write/run tests (450+ lines)
- ⚙️ **[Development Guide](docs/DEVELOPMENT.md)** - Developer handbook (500+ lines)
- 🤝 **[Contributing Guide](docs/CONTRIBUTING.md)** - Code standards (800+ lines)

### Quick Guides
- ⚡ **[Quick Start](docs/QUICKSTART.md)** - 5-minute setup
- 🏗️ **[Deployment Guide](docs/DEPLOYMENT.md)** - Guide for deploying the application

### Design Specs (194,200 words!)
- 12 comprehensive design documents
- Complete worldbuilding (NPCs, locations, lore)
- Game systems specifications

---

## 🗓️ DEVELOPMENT ROADMAP

### ✅ Phase 0: Documentation & Setup *(Complete)*
- ✅ Complete game design document
- ✅ Create documentation suite
- ✅ Initialize project structure
- ✅ Set up Git repository

### ✅ Phase 1: Foundation *(Complete)*
- ✅ Backend setup (Node.js, Express, MongoDB)
- ✅ Frontend setup (React, TailwindCSS)
- ✅ Authentication system (JWT)
- ✅ Destiny Deck core engine (2,305 LOC)
- ✅ Energy system with regeneration
- ✅ Character creation

### ✅ Phase 2: Core Gameplay *(Complete)*
- ✅ Skill system and training (20-25 skills)
- ✅ Combat system (duels, PvE, bosses)
- ✅ Criminal activities (jail, bounties, witness system)
- ✅ Faction reputation
- ✅ NPC shops & marketplace
- ✅ Map and travel (stagecoach, train, horse)

### ✅ Phase 3: Social & Multiplayer *(Complete)*
- ✅ Real-time chat (Socket.io, 4 room types)
- ✅ Gang system (905 LOC, full hierarchy)
- ✅ Player profiles
- ✅ Friends and mail system

### ✅ Phase 4: Territory & Strategy *(Complete)*
- ✅ Territory control
- ✅ Gang wars
- ✅ Resource generation (properties, production)
- ✅ Strategic layer

### ✅ Phase 5: Polish & Balance *(Mostly Complete)*
- ✅ Western theming (51 pages, custom UI)
- ✅ Game balance (core systems)
- ✅ Tutorial/onboarding
- 🔄 UI/UX refinement (ongoing polish)

### 🔄 Phase 6: Premium & Monetization *(Mostly Complete)*
- ⏳ Premium subscription (Stripe integration deferred)
- ⏳ Premium token shop
- ✅ Energy extensions (premium rates configured)
- ✅ Admin dashboard for operations (2,300+ LOC complete)

### 📅 Phase 7: Testing & Launch *(In Progress - Q2 2026)*
- ✅ Security audit (13 critical endpoints secured, audit logging implemented)
- ⏳ Load testing (500+ concurrent players)
- ⏳ Content authoring (50+ items, NPCs, locations)
- ⏳ Beta testing period
- ⏳ Public launch

### 🚀 Already Implemented (Beyond Original Plan)
- ✅ Advanced roleplay (properties, newspapers, mentors)
- ✅ Deep supernatural (cosmic quests, sanity system, rituals)
- ✅ Complex economy (auction house, marketplace, property foreclosures)
- ✅ Extensive NPC AI (schedules, moods, gossip, news reactions)

---

## 🎨 VISUAL STYLE

- **Aesthetic:** Hand-drawn western meets mythic elements
- **Color Palette:** Muted earth tones (browns, reds, dusty yellows) with vibrant supernatural accents
- **UI Theme:** Weathered wood, leather, wanted poster aesthetics, playing cards
- **Typography:** Western serif headings, readable body text
- **Reference:** Red Dead Redemption 2 meets Hearthstone

---

## 🤝 CONTRIBUTING

**Current Status:** Early development, not open for external contributions yet.

Once we reach beta, we'll welcome:
- Bug reports and feedback
- Balance suggestions
- Content ideas
- Localization assistance

---

## 📜 CULTURAL RESPECT & REPRESENTATION

Desperados Destiny features fictional Native American nations (Kaiowa, Tseka, Nahi) inspired by real cultures but not claiming to represent any specific tribe. We're committed to:

- **Respectful portrayal** - No stereotypes, showing cultural depth and complexity
- **Fictional approach** - Avoid appropriating specific tribal ceremonies or beliefs
- **Community feedback** - Open to adjusting content if concerns arise
- **Sensitivity readers** - Post-MVP, consult with cultural consultants

The Settler vs Native conflict is portrayed with moral complexity, not simplistic good vs evil.

---

## 💰 MONETIZATION (Ethical F2P)

**Free Tier:**
- 150 base energy, regenerates 5/hour
- Can improve to ~175 through skill grinding
- All content accessible
- Competitive gameplay

**Premium Tier ($5-10/month):**
- 250 base energy, regenerates 8/hour
- Cosmetic options (profile themes, titles)
- Convenience, NOT power

**Philosophy:** Free players can compete. Premium offers convenience and supports development, but never creates pay-to-win scenarios.

---

## ❓ FAQ

**Q: When will the game launch?**
A: We're at ~95% completion with all major sprints complete. Primary remaining work is PvP Duel real-time frontend (~6-8 hours). Aiming for Q2 2026 beta launch (April-June).

**Q: Will this be pay-to-win?**
A: Absolutely not. Premium provides convenience (more energy) but free players can compete through skill and strategy.

**Q: Why poker mechanics?**
A: It's thematically perfect for the wild west era, adds exciting uncertainty while rewarding skill investment, and it's unique in the MMO space.

**Q: Can I play solo or do I need a gang?**
A: Both! Solo players can duel, do crimes, and progress. Gangs unlock territory warfare and organized heists.

**Q: Will there be PvE content?**
A: Yes! Criminal activities against NPCs, bounty hunting, vision quests, and supernatural encounters.

**Q: Is this historically accurate?**
A: We blend historical authenticity (1870s frontier setting, real conflicts) with mythic elements (spirits, legends made real). Think "weird west."

---

## 📞 CONTACT & COMMUNITY

**Developer:** Kaine
**AI Assistant:** Ezra "Hawk" Hawthorne

*Community channels and social media will be established closer to launch.*

---

## 📄 LICENSE

*License to be determined. Currently proprietary during development.*

---

## 🙏 ACKNOWLEDGMENTS

**Inspiration:**
- **Torn** - Deep progression systems and faction warfare model
- **Alien Adoption Agency** - Social systems and community focus
- **Red Dead Redemption 2** - Visual aesthetic and western authenticity
- **Hearthstone** - Card-based UI inspiration

**Development:**
- Built with Claude Code by Anthropic
- Developed by passionate indie team

---

## 🌟 THE VISION

*Desperados Destiny* isn't just another browser MMO. It's a frontier where:
- Every action is a gamble, but skill tips the odds
- Three factions clash with real moral weight
- Legends walk alongside outlaws and lawmen
- Your choices write the story of the Sangre Territory
- Community and roleplay matter as much as mechanics

We're building a world worth settling, where every player's tale becomes part of frontier legend.

---

**Happy trails, partner. See you on the frontier.**

*— Ezra "Hawk" Hawthorne*
*Digital Frontiersman*
*Last Updated: December 2, 2025*