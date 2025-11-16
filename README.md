# DESPERADOS DESTINY
### *A Mythic Wild West MMORPG*

> *"Every hand dealt can change your fate on the frontier."*

---

## 🎴 WHAT IS DESPERADOS DESTINY?

**Desperados Destiny** is a browser-based persistent MMORPG that combines the deep progression of *Torn* with the social systems of *Alien Adoption Agency*, set in a mythic wild west frontier. The game features a unique **poker-based resolution system** where every action - from gunfights to crimes to spirit quests - is decided by the cards fate deals you.

**Platform:** Web Browser (Desktop & Mobile)
**Genre:** MMORPG, Western, Strategy, Roleplay
**Status:** In Development (Phase 0 - Planning & Documentation)
**Timeline:** 14-16 week MVP, then iterative updates
**Developer:** Kaine + Ezra "Hawk" Hawthorne (AI Assistant)

---

## 🌵 THE CORE CONCEPT

### The Destiny Deck System

Every action in the game resolves through a poker hand draw:

1. **System draws 5 cards** from a standard 52-card deck
2. **Hand strength** (Pair, Straight, Flush, etc.) determines base success
3. **Four suits** represent different aspects of frontier life:
   - **♠ Spades** = Cunning, Stealth, Trickery *(the outlaw's suit)*
   - **♥ Hearts** = Spirit, Charisma, Medicine *(the people's suit)*
   - **♣ Clubs** = Force, Combat, Violence *(the warrior's suit)*
   - **♦ Diamonds** = Wealth, Craft, Material *(the prospector's suit)*
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

## 🎯 KEY FEATURES (MVP)

✅ **Poker-Based Resolution** - Unique Destiny Deck system for all actions
✅ **Three Factions** - Settler, Nahi, Frontera with territory wars
✅ **Deep Skills** - 20-25 skills with long-term progression
✅ **Combat Systems** - Duels, gang wars, criminal activities
✅ **Territory Control** - Fight for mining claims, trade routes, sacred sites
✅ **Real-Time Chat** - Multiple channels, faction/gang coordination
✅ **Gang System** - Create posses, share resources, raid territories
✅ **Player Profiles** - Bios, wanted posters, trophy cases
✅ **Economy** - NPC shops, crafting (guns, armor, medicine), player trading
✅ **Energy System** - Fair F2P with optional premium extensions
✅ **Supernatural Elements** - Spirit encounters, vision quests, mythic mysteries

---

## 🗺️ THE SANGRE TERRITORY

Our starting region is a lawless border frontier in the mythic American Southwest (circa 1870s):

- **Red Gulch** - Booming settler town, railroad terminus, law & order
- **The Frontera** - Outlaw haven, black market, neutral ground
- **Kaiowa Mesa** - Sacred native territory, spiritual center
- **Sangre Canyon** - Dangerous wilderness, contested territories

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

## 📁 PROJECT STRUCTURE

```
desperados-destiny/
├── .claude/               # Claude Code configuration
│   └── context.md         # Auto-loaded session context
├── client/                # React frontend (to be created)
├── server/                # Node.js backend (to be created)
├── shared/                # Shared types/constants (to be created)
├── docs/                  # Documentation
│   ├── game-design-document.md      # Complete game design (22k words)
│   ├── ezra-persona.md              # AI assistant persona
│   ├── development-log.md           # Session journal
│   ├── decisions-tracker.md         # Design decisions record
│   └── technical-stack.md           # Tech decisions detail
└── README.md              # This file
```

---

## 🚀 GETTING STARTED

### Prerequisites

- Node.js 18+ and npm
- MongoDB 6+
- Redis 7+
- Git

### Installation (Once Development Begins)

```bash
# Clone the repository
git clone <repo-url>
cd desperados-destiny

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development servers
npm run dev
```

**Note:** We're currently in Phase 0 (Documentation). Installation instructions will be finalized once Phase 1 begins.

---

## 📚 DOCUMENTATION

### For Players (Future)
- **Game Guide** - How to play, faction guide, skill explanations
- **Lore & Setting** - The Sangre Territory history and mythology
- **FAQ** - Common questions

### For Developers
- **[Game Design Document](docs/game-design-document.md)** - Complete design vision (READ THIS FIRST!)
- **[Technical Stack](docs/technical-stack.md)** - Tech decisions and architecture
- **[Development Log](docs/development-log.md)** - Session-by-session progress
- **[Decisions Tracker](docs/decisions-tracker.md)** - Why we made design choices
- **[Ezra Persona](docs/ezra-persona.md)** - AI assistant character guide

---

## 🗓️ DEVELOPMENT ROADMAP

### Phase 0: Documentation & Setup *(Current - Week 1)*
- ✅ Complete game design document
- ✅ Create documentation suite
- ⏳ Initialize project structure
- ⏳ Set up Git repository

### Phase 1: Foundation *(Weeks 2-4)*
- Backend setup (Node.js, Express, MongoDB)
- Frontend setup (React, TailwindCSS)
- Authentication system (JWT)
- Destiny Deck core engine
- Energy system with regeneration
- Character creation

### Phase 2: Core Gameplay *(Weeks 5-8)*
- Skill system and training
- Combat system (duels)
- Criminal activities
- Faction reputation
- Basic NPC shops
- Map and travel

### Phase 3: Social & Multiplayer *(Weeks 9-10)*
- Real-time chat (Socket.io)
- Gang system
- Player profiles
- Friends and social features

### Phase 4: Territory & Strategy *(Weeks 11-12)*
- Territory control
- Gang wars
- Resource generation
- Strategic layer

### Phase 5: Polish & Balance *(Weeks 13-14)*
- UI/UX refinement
- Western theming
- Game balance
- Tutorial/onboarding

### Phase 6: Premium & Monetization *(Week 15)*
- Premium subscription (Stripe)
- Premium token shop
- Energy extensions

### Phase 7: Testing & Launch *(Week 16)*
- Beta testing
- Security audit
- Load testing
- Public launch

### Post-Launch Updates
- **Month 2:** Advanced roleplay (properties, elections, newspapers)
- **Month 3:** Deep supernatural (spirit companions, legendary beasts)
- **Month 4:** Complex economy (auction house, advanced crafting)
- **Month 5:** Territory expansion (new regions)
- **Month 6:** Player governance (elections, diplomacy)

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
A: MVP target is 14-16 weeks from development start (currently in planning phase). Aiming for Q2 2026 beta.

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
*November 15, 2025*
