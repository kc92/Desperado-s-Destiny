# DESPERADOS DESTINY - DECISIONS TRACKER
## *Record of Design Choices and Rationale*

---

## Purpose

This document tracks all major design decisions made during planning and development. For each decision, we record:
- What was decided
- What alternatives were considered
- Why we chose this path
- Date decided
- Who decided (User/Hawk/Collaborative)
- Current status (Locked/Under Review/Changed)

This ensures we remember our reasoning and can revisit decisions if needed.

---

## DECISION LOG

### D001: Core Game Loop
**Date:** November 15, 2025
**Decision:** Outlaw/Faction PvP as primary game loop (Torn-style)
**Alternatives Considered:**
- Creature collection focus (AAA-style)
- Balanced hybrid of both
- Different primary loop

**Reasoning:**
User wanted Torn-style faction warfare and PvP as the main hook. Creature collection (horses, spirit animals) will exist but as secondary content, primarily post-MVP.

**Decided By:** User
**Status:** ✅ Locked

---

### D002: Technical Stack Choice
**Date:** November 15, 2025
**Decision:** Node.js/React/MongoDB stack
**Alternatives Considered:**
- PHP/MySQL (traditional LAMP, like Torn)
- Python backend (Django/Flask)

**Reasoning:**
- Real-time requirements favor Node.js + Socket.io
- React provides component-based UI for complex game interfaces
- MongoDB's document model fits flexible character data better than relational
- Modern, scalable, large ecosystem
- Hawk's recommendation based on requirements; user accepted

**Technical Details:**
- **Backend:** Node.js 18+, Express.js, TypeScript, MongoDB, Redis, Socket.io
- **Frontend:** React 18+, TypeScript, TailwindCSS, Zustand/Redux, Socket.io-client
- **Infrastructure:** Docker, Nginx, PM2, GitHub Actions, DigitalOcean/AWS

**Decided By:** Hawk (User accepted recommendation)
**Status:** ✅ Locked

---

### D003: Development Timeline & Scope
**Date:** November 15, 2025
**Decision:** Iterative releases - MVP first, then major updates
**Alternatives Considered:**
- MVP first (3-6 months, smaller scope)
- Full vision from start (1-2 years, everything at once)

**Reasoning:**
- Get playable core out faster for feedback
- Avoid burnout from massive scope
- Allows community to grow alongside features
- Proven model for indie MMOs
- Like settling territory one region at a time

**Timeline:**
- MVP: 14-16 weeks (core + social + basic territory)
- Updates every 1-2 months post-launch adding major systems

**Decided By:** User
**Status:** ✅ Locked

---

### D004: Monetization Model
**Date:** November 15, 2025
**Decision:** Free tier with fatigue system + premium extension
**Alternatives Considered:**
- Premium currency (cosmetics only, no P2W)
- Subscription model (monthly fee)
- Free forever (no monetization)

**Reasoning:**
User specified: "A free tier, with a fatigue system. Players can pay for extended fatigue pools. Fatigue pools can also be somewhat improved by free tier players if they grind out the appropriate skills."

This creates:
- Ethical F2P (not pay-to-win)
- Value for premium without unfairness
- Prevents 24/7 grinding domination
- Free players can compete through skill optimization

**Mechanics:**
- Free: 150 energy, 5/hour regen, can improve to ~175 via skills
- Premium: 250 energy, 8/hour regen

**Decided By:** User
**Status:** ✅ Locked

---

### D005: Fatigue System Mechanics
**Date:** November 15, 2025
**Decision:** Energy per action (Torn-style)
**Alternatives Considered:**
- Stamina categories (different pools for different actions)
- Daily action points (set number of big actions per day)
- Hybrid system (multiple energy types)

**Reasoning:**
- Simple and proven (Torn model)
- Easy to understand
- Flexible for different action costs
- Thematically fits (gunslingers need rest)

**Action Costs:**
- Minor: 5-10 energy
- Moderate: 15-25 energy
- Major: 30-50 energy
- Social: Free

**Decided By:** User
**Status:** ✅ Locked

---

### D006: Faction Warfare System
**Date:** November 15, 2025
**Decision:** Both territory control AND reputation systems, with Native vs Settler war theme
**Alternatives Considered:**
- Territory control only
- Reputation wars only (political, not combat-focused)

**Reasoning:**
User wanted both systems plus the thematic depth of Native vs Settler conflict. This creates:
- Multiple victory paths (control land OR build influence)
- Strategic depth (military and political gameplay)
- Historical/thematic richness
- Moral complexity (not just "good guys vs bad guys")

**Three Factions:**
1. Settler Alliance - progress, law, railroad
2. Nahi Coalition - defend lands, preserve culture, spiritual
3. Frontera - lawless freedom, opportunism

**Decided By:** User
**Status:** ✅ Locked

---

### D007: Character Progression Depth
**Date:** November 15, 2025
**Decision:** Deep skills system (Torn-like, 20-25+ skills)
**Alternatives Considered:**
- Class archetypes (choose path, limited flexibility)
- Classless freedom (all skills available, define own role)
- Hybrid classes + skills (archetype for starting bonuses, train any direction)

**Reasoning:**
User wants Torn-style depth and long-term investment. 20-25 skills that take months/years to master creates:
- Long-term player retention
- Meaningful progression
- Specialization and player identity
- Economic niches (master crafters, combat specialists, etc.)

**Training System:**
- Time-based (like Torn) - continues offline
- Use-based bonuses (doing related activities speeds training)
- Levels 1-100 per skill

**Decided By:** User
**Status:** ✅ Locked

---

### D008: Side Content & Roleplay Depth
**Date:** November 15, 2025
**Decision:** Heavy roleplay focus
**Alternatives Considered:**
- All the trimmings (prospecting, bounty hunting, ranching, poker, robberies, missions)
- Focus on essentials (combat, crimes, basic economy only)
- Heavy roleplay (deep social systems, player-driven content)

**Reasoning:**
User selected "Heavy roleplay" which means:
- Deep social systems
- Player-driven saloons, newspapers, elections for sheriff
- Character customization and storytelling tools
- Community and narrative focus alongside mechanics

**MVP Includes:**
- Chat, gangs, profiles
**Post-MVP Adds:**
- Player-owned locations, elections, newspapers, marriage/partnerships

**Decided By:** User
**Status:** ✅ Locked

---

### D009: The Destiny Deck - Poker Mechanic
**Date:** November 15, 2025
**Decision:** Poker-based resolution for all game actions, with suits influencing outcomes
**Alternatives Considered:**
- Turn-based strategy (like Torn - stats determine outcomes)
- Real-time action combat
- Hybrid (duels action, wars strategic)
- Narrative combat (storytelling choices)

**Reasoning:**
User had a unique vision: "I want to create a system that operates on a poker game mechanic. This poker game mechanic will be central to all systems in the game, similar to how dice rolls work in DnD but with added complexity of suites, different suites can influence outcomes."

This is the CORE INNOVATION of Desperados Destiny.

**How It Works:**
- System draws 5-card poker hand for every action
- Hand strength (Pair, Flush, etc.) determines base success
- Four suits represent different aspects:
  - ♠ Spades = Cunning (crimes, stealth)
  - ♥ Hearts = Spirit (social, supernatural)
  - ♣ Clubs = Combat (fighting, violence)
  - ♦ Diamonds = Craft (economy, material)
- Skills provide bonuses to relevant suits
- Final outcome = Hand strength + Suit bonuses

**Why This Works:**
- Thematically perfect (poker era in wild west)
- Adds excitement and uncertainty
- Skill investment still matters (bonuses dominate long-term)
- Unique in MMO space (no competitor does this)
- Creates memorable moments (Royal Flush in duels!)

**Decided By:** User (visionary idea)
**Status:** ✅ Locked - This is THE core mechanic

---

### D010: Suit Mapping for Destiny Deck
**Date:** November 15, 2025
**Decision:** Spades=Cunning, Hearts=Spirit, Clubs=Force, Diamonds=Wealth
**Alternatives Considered:**
- Different suit meanings
- Context-dependent suit meanings
- More complex suit interactions

**Reasoning:**
Hawk proposed this mapping, user approved. It creates clear thematic associations:
- Spades (black, sharp) = trickery, stealth, cunning
- Hearts (red, life) = connection, spirit, charisma
- Clubs (weapons) = combat, force, violence
- Diamonds (wealth) = material, craft, trade

Easy to remember, thematically consistent, mechanically clear.

**Decided By:** Collaborative (Hawk proposed, User approved)
**Status:** ✅ Locked

---

### D011: Poker Mechanic Implementation
**Date:** November 15, 2025
**Decision:** Hidden resolution (system handles draws, shows result)
**Alternatives Considered:**
- Draw & compare (both see hands, best wins)
- Visible showdown (actual poker gameplay for important actions)
- Hybrid (minor auto-resolve, major showdowns)

**Reasoning:**
User chose hidden resolution like dice rolls. This means:
- Fast resolution
- No decision paralysis
- Focus on build/preparation, not in-moment tactics
- Can still show hands afterward for transparency and drama

**Decided By:** User
**Status:** ✅ Locked

---

### D012: Skill Effect on Destiny Deck
**Date:** November 15, 2025
**Decision:** Suit bonuses (skills boost specific suits)
**Alternatives Considered:**
- Deck modification (better cards added to deck)
- Draw advantages (draw more cards, choose best 5)
- Combined system (all of the above)

**Reasoning:**
User chose suit bonuses for simplicity and clarity:
- Gun Fighting 60 = +40 Clubs in combat
- Easy to calculate
- Transparent to players
- Still allows luck, but skill dominates

**Bonus Scaling:**
- Levels 1-25: +0.25/level
- Levels 26-50: +0.5/level
- Levels 51-75: +1/level
- Levels 76-100: +2/level

**Decided By:** User
**Status:** ✅ Locked

---

### D013: Native American Representation
**Date:** November 15, 2025
**Decision:** Fictional tribes, accurately and respectfully portraying cultural depth without being specific to any real tribe
**Alternatives Considered:**
- Research & consult (base on real tribes like Lakota, Apache, Navajo)
- Completely fictionalized (no connection to real cultures)
- Mixed approach (historical accuracy where possible, fiction for game mechanics)

**Reasoning:**
User specified: "I imagine something fictional but accurately and respectfully portrays the cultural depth of the real natives without being specific to any one real tribe."

This approach:
- Avoids appropriating specific tribal beliefs/ceremonies
- Allows creative freedom for game mechanics
- Shows respect through thoughtful, non-stereotypical portrayal
- Focuses on universal themes (land, spirit, community, balance)

**Fictional Nations Created:**
- **Kaiowa** (plains people) - diplomatic, horse masters
- **Tseka** (mountain folk) - warriors, spiritual leaders
- **Nahi** (desert dwellers) - survivalists, trackers, herbalists

**Decided By:** User
**Status:** ✅ Locked - Cultural respect is non-negotiable

---

### D014: Geographic Scope
**Date:** November 15, 2025
**Decision:** Start small (one territory), expand in updates
**Alternatives Considered:**
- Single territory (one region, deep detail)
- Multiple territories (several distinct regions)
- Entire western frontier (Mississippi to Pacific)

**Reasoning:**
Fits iterative development approach:
- MVP launches with **Sangre Territory** (one rich region)
- Post-launch updates add new territories (Great Plains, Pacific Northwest, etc.)
- Allows deep detail in starting area
- Manageable scope for MVP
- Expansion creates ongoing content cadence

**Decided By:** User
**Status:** ✅ Locked

---

### D015: Roleplay Systems Depth
**Date:** November 15, 2025
**Decision:** All of it (player-owned locations, politics, customization, player-created content)
**Alternatives Considered:**
- Player-owned locations only
- Government/politics only
- Deep customization only

**Reasoning:**
User wants full suite of roleplay tools. This creates:
- Player-owned saloons, ranches, shops (social hubs)
- Elections for sheriff, mayor, faction leaders
- Character backstories, journals, wanted posters
- Player-written newspaper articles

**MVP vs Post-MVP:**
- MVP: Chat, profiles, gangs, basic customization
- Post-MVP: Owned locations, elections, newspapers, deep RP tools

**Decided By:** User
**Status:** ✅ Locked

---

### D016: Starting Territory Character
**Date:** November 15, 2025
**Decision:** Border Frontier (lawless borderlands, mixed cultures, high tension)
**Alternatives Considered:**
- Mining territory (gold rush, Deadwood-style)
- Ranch/plains (cattle country, cowboy classic)
- Railroad boom (expansion, land speculation)

**Reasoning:**
Border frontier creates:
- High tension environment
- Smuggling, conflicts, neutral ground
- All three factions have presence
- Lawless and dangerous (exciting!)
- Mixed cultures (settler, native, outlaw all interact)

**The Sangre Territory** - name chosen for blood (violence) and red canyons.

**Decided By:** User
**Status:** ✅ Locked

---

### D017: Time System
**Date:** November 15, 2025
**Decision:** Real-time (like Torn)
**Alternatives Considered:**
- Accelerated time (game days/nights cycle fast)
- Tick-based (game progresses in turns every 30 min)
- Hybrid (some real-time, some tick-based)

**Reasoning:**
Real-time fits browser MMO model:
- Game time = real time
- Actions happen in real minutes/hours
- Skill training continues offline
- Territory income hourly
- Fits Torn-inspired progression

**Decided By:** User
**Status:** ✅ Locked

---

### D018: Tone and Historical Accuracy
**Date:** November 15, 2025
**Decision:** Mythic West (supernatural elements, room for spirits and legends)
**Alternatives Considered:**
- Gritty realism (harsh, authentic, no magic)
- Romanticized west (classic adventure, fun over reality)
- Balanced (authentic challenges with hope)

**Reasoning:**
Mythic west allows:
- Supernatural elements (Native spirits, legendary creatures)
- Frontier legends made real
- Creative freedom for endgame content
- Thematically richer than pure realism
- Fits "Alien Adoption Agency" influence (creature/mystery elements)

**Balance:**
- Historical authenticity for setting, culture, conflicts
- Supernatural as rare, mysterious, powerful overlay
- Not high fantasy, but legends are real

**Decided By:** User
**Status:** ✅ Locked

---

### D019: Supernatural Integration
**Date:** November 15, 2025
**Decision:** Universal Mystery (anyone can encounter supernatural through exploration, choices, alliances)
**Alternatives Considered:**
- Rare & powerful (endgame only, hard to obtain)
- Woven throughout (magic/spirits part of daily life)
- Cultural divide (Natives get spirits, Settlers get technology)

**Reasoning:**
Universal mystery means:
- Not locked to one faction
- Mysterious and discoverable
- Settlers can have visions, outlaws meet spirits, Nahi aren't the only ones
- Nahi have EASIER access and deeper connection, but not monopoly
- Creates surprise and wonder

**Decided By:** User
**Status:** ✅ Locked

---

### D020: Combat System
**Date:** November 15, 2025
**Decision:** Poker mechanic with hidden resolution (see D009, D011)
**Specific Combat Details:**
- Duels: Both draw hands, Clubs bonuses applied, best total wins
- Gang Wars: Aggregate hands + bonuses, team with highest sum wins
- Health pool: 100 base + bonuses
- Damage based on victory margin
- Death penalty: Lose carried cash, temporary debuff

**Decided By:** User (via poker mechanic decision)
**Status:** ✅ Locked

---

### D021: Economy Depth
**Date:** November 15, 2025
**Decision:** Hybrid (simple core resources, deep specialized crafting)
**Alternatives Considered:**
- Deep simulation (full supply/demand, complex chains)
- Simplified trading (basic buy/sell, minimal crafting)
- Profession-based (players specialize in crucial roles)

**Reasoning:**
Hybrid approach allows:
- Easy entry (simple resource gathering, basic trading)
- Deep endgame (specialized crafting for guns, medicine, artifacts)
- Economic niches (master gunsmiths valuable)
- Doesn't overwhelm new players

**MVP Crafting:**
- Gunsmithing (custom weapons)
- Leatherworking (armor, gear)
- Herbalism (medicine, potions)

**Post-MVP:**
- Advanced crafting chains
- Resource nodes and complex gathering
- Auction house
- Player-run businesses

**Decided By:** User
**Status:** ✅ Locked

---

### D022: MVP Feature Scope
**Date:** November 15, 2025
**Decision:** Core + Social systems for MVP
**MVP Includes:**
- Character creation, factions, skills, energy system
- Combat (duels, gang wars)
- Criminal activities (5-8 crime types)
- Territory control (4-6 territories)
- Social (chat, gangs, profiles, friends)
- Economy (NPC shops, basic trading, simple crafting)
- Map (4 locations in Sangre Territory)
- Premium features (extended energy, cosmetics)
- Basic supernatural (spirit encounters, simple vision quests)

**Explicitly NOT in MVP:**
- Player-owned properties
- Elections & player governance
- Advanced crafting chains
- Deep supernatural (spirit companions, legendary beasts)
- Auction house
- Complex economic simulation
- Additional territories beyond Sangre

**Decided By:** User
**Status:** ✅ Locked

---

### D023: Post-Launch Content Priorities
**Date:** November 15, 2025
**Decision:** Supernatural depth, deep economy, advanced roleplay deferred to post-launch
**Update Schedule (Tentative):**
- Update 1 (Month 2): Advanced roleplay features
- Update 2 (Month 3): Deep supernatural content
- Update 3 (Month 4): Complex economy
- Update 4 (Month 5): Territory expansion
- Update 5 (Month 6): Player governance

**Decided By:** User
**Status:** ✅ Locked

---

### D024: Project Resources & Starting Point
**Date:** November 15, 2025
**Decision:** Total greenfield (starting completely from scratch)
**Current Assets:** None (no code, no art, no formal docs before today)
**Implications:**
- Build everything from ground up
- Total creative freedom
- No legacy code to work around
- Can architect properly from day one

**Decided By:** User (project status)
**Status:** ✅ Locked

---

### D025: Documentation Strategy
**Date:** November 15, 2025
**Decision:** Create full documentation suite before coding
**Files Created:**
- game-design-document.md (comprehensive design)
- ezra-persona.md (Hawk character persistence)
- development-log.md (session journal)
- decisions-tracker.md (this document)
- .claude/context.md (auto-loaded context for sessions)
- README.md (project overview)
- technical-stack.md (tech decisions detail)

**Reasoning:**
User wants to ensure continuity across sessions. Documentation guarantees:
- Hawk maintains persona and context
- Design decisions remembered
- Progress tracked
- Knowledge persists beyond chat sessions

**Decided By:** User
**Status:** ✅ Locked

---

## DECISION CATEGORIES

### ✅ LOCKED DECISIONS (Cannot change without major discussion)
- D009: Destiny Deck poker mechanic
- D013: Fictional but respectful Native representation
- D018: Mythic West tone
- D006: Three-faction system
- D007: Deep skill progression
- D002: Tech stack

### 🔄 UNDER REVIEW (May adjust during development)
- None currently

### 📝 OPEN FOR FUTURE DECISION
- Specific visual art style (awaiting asset creation)
- Exact energy costs per action (will balance during playtesting)
- Specific territory income rates (economic balancing)
- Premium pricing tiers (market research needed)

---

## DECISION-MAKING PROCESS

**For Major Decisions:**
1. Hawk presents options with pros/cons
2. User selects preferred option or provides custom direction
3. Decision logged here with reasoning
4. Status marked as Locked or Under Review

**For Minor Decisions:**
- Hawk makes recommendations based on established direction
- User can override if desired
- Logged if potentially significant later

**For Revisiting Decisions:**
- Must have good reason (playtesting data, community feedback, technical limitation)
- Discuss impact on existing work
- Update status and log change reasoning

---

## NOTES FOR FUTURE REFERENCE

**User's Vision Summary:**
Kaine wants to build a production-quality, triple-A web MMORPG that combines Torn's depth with AAA's social systems, set in a mythic wild west with a unique poker-based mechanic. The game should be ethical F2P, culturally respectful, and built for long-term community engagement.

**Core Pillars (Never Compromise):**
1. Destiny Deck poker mechanic
2. Three-faction conflict with moral complexity
3. Cultural respect in Native representation
4. Deep, long-term progression
5. Fair F2P model
6. Heavy roleplay support

**Hawk's Role:**
- Maintain persona across sessions
- Reference these decisions to stay consistent
- Recommend solutions aligned with established direction
- Challenge decisions only when technical/ethical concerns arise
- Keep documentation updated

---

*This tracker ensures we never lose sight of why we made the choices we did. The frontier is full of twists and turns, but we've charted our course.*

**— Ezra "Hawk" Hawthorne**
*November 15, 2025*
