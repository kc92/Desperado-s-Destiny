# DESPERADOS DESTINY
## A Mythic Wild West MMORPG

**Game Design Document v1.0**
*Compiled by Ezra "Hawk" Hawthorne*
*Last Updated: November 15, 2025*

---

## TABLE OF CONTENTS

1. [Core Vision](#core-vision)
2. [The Destiny Deck System](#the-destiny-deck-system)
3. [Setting: The Sangre Territory](#setting-the-sangre-territory)
4. [Faction System](#faction-system)
5. [Skill System](#skill-system)
6. [Energy & Fatigue](#energy--fatigue)
7. [Combat System](#combat-system)
8. [Territory Control](#territory-control)
9. [Social & Roleplay](#social--roleplay)
10. [Economy](#economy)
11. [Supernatural Elements](#supernatural-elements)
12. [MVP Scope](#mvp-scope)
13. [Technical Architecture](#technical-architecture)
14. [Development Roadmap](#development-roadmap)
15. [Visual Design](#visual-design)

---

## CORE VISION

### Game Overview
**Desperados Destiny** is a browser-based persistent MMORPG set in a mythic wild west frontier where supernatural mystery meets historical grit. Players navigate a three-way conflict between Settler expansion, Native resistance, and lawless Frontera outlaws in the dangerous Sangre Territory.

### Inspiration
- **Torn** - Deep progression systems, faction warfare, persistent world
- **Alien Adoption Agency** - Social systems, community focus
- **Unique Twist** - Poker-based resolution system in wild west setting

### Core Pillars
1. **Poker-Based Mechanics** - Every action resolves through the Destiny Deck
2. **Meaningful Faction Conflict** - Three-way war with moral complexity
3. **Long-Term Progression** - Years of skill development (Torn-style)
4. **Heavy Roleplay Support** - Tools for storytelling and character development
5. **Fair Free-to-Play** - Energy system balanced for non-paying players

### Monetization Model
- **Free Tier**: 150 base energy, full regen in 5 hours (30/hr), can improve through skills
- **Premium Tier**: 250 base energy, full regen in 8 hours (31.25/hr), cosmetic options
- **Philosophy**: Fatigue limits no-lifing, premium offers convenience not power

### Target Audience
- Torn players seeking new setting
- Browser MMO enthusiasts (18-35)
- Western & history fans
- Strategy gamers who enjoy long-term progression
- Roleplay communities

---

## THE DESTINY DECK SYSTEM

### Core Concept
Every action in Desperados Destiny resolves through a poker hand draw. This isn't cosmetic - it's the fundamental mechanical language of the entire game, replacing traditional dice rolls or stat comparisons.

### How It Works

**Resolution Flow:**
1. Player initiates action (combat, crime, crafting, social encounter, etc.)
2. System draws a 5-card poker hand from a standard 52-card deck
3. Player's skills provide bonuses to specific suits
4. Action type determines which suits are relevant
5. Hand strength + suit bonuses = outcome quality
6. Result displayed with the hand that sealed their fate

### The Four Suits of Fate

**♠ SPADES - Cunning, Stealth, Trickery** *(the outlaw's suit)*
- **Associated Skills**: Lockpicking, Stealth, Sleight of Hand, Tracking, Pickpocketing
- **Primary Actions**: Crimes, stealth missions, ambushes, deception
- **Thematic**: The shadowy path of rogues and tricksters

**♥ HEARTS - Spirit, Charisma, Medicine** *(the people's suit)*
- **Associated Skills**: Persuasion, Leadership, Spirit Walking, Healing, Animal Handling
- **Primary Actions**: Social encounters, negotiations, spiritual quests, healing
- **Thematic**: The human connection and supernatural awareness

**♣ CLUBS - Force, Combat, Violence** *(the warrior's suit)*
- **Associated Skills**: Gun Fighting, Brawling, Intimidation, Mounted Combat, Quick Draw
- **Primary Actions**: Combat, duels, gang wars, physical confrontations
- **Thematic**: The brutal reality of frontier violence

**♦ DIAMONDS - Wealth, Craft, Material** *(the prospector's suit)*
- **Associated Skills**: Prospecting, Crafting, Trading, Appraisal, Gunsmithing
- **Primary Actions**: Trading, crafting, resource gathering, economic activities
- **Thematic**: The material wealth and industry of the frontier

### Suit Bonus Mechanics

**How Skills Boost Suits:**
- Each skill level provides incremental bonuses to its associated suit
- Bonuses are applied when that suit is relevant to the action
- Multiple skills can contribute to the same action

**Bonus Scaling:**
- Levels 1-25: +0.25 per level (max +6.25)
- Levels 26-50: +0.5 per level (max +12.5 additional, total +18.75)
- Levels 51-75: +1 per level (max +25 additional, total +43.75)
- Levels 76-100: +2 per level (max +50 additional, total +93.75)

**Example:** Gun Fighting Level 60 provides approximately +38 bonus to Clubs in combat situations

### Hand Strength Outcomes

Poker hand rankings determine base success level:

| Hand Rank | Success Level | Narrative Outcome |
|-----------|---------------|-------------------|
| High Card | Failure/Minimal | Barely scraped by or failed |
| Pair | Basic Success | Got the job done |
| Two Pair | Good Success | Performed well |
| Three of a Kind | Great Success | Impressive result |
| Straight | Excellent Success | Outstanding performance |
| Flush | Exceptional Success | Suit bonuses amplified |
| Full House | Near-Legendary | Remarkable achievement |
| Four of a Kind | Legendary Success | Stories will be told |
| Straight Flush | Mythic Outcome | Fate-defying miracle |
| Royal Flush | Divine Intervention | Once-in-a-lifetime moment |

**Special: Dead Man's Hand (Aces & Eights)**
- Two pairs: Aces and Eights (Wild Bill Hickok's death hand)
- Triggers special events - could be blessing or curse
- Context-dependent outcomes (combat might mean dramatic standoff)
- Rare and memorable moments

### Example Resolutions

**Example 1: Bank Safe Lockpicking**
```
Action: Pick lock on Red Gulch Bank safe
System draws: A♠ K♠ 7♣ 3♥ 3♦

Hand Analysis:
- Base hand: Pair of 3s (Basic Success)
- Relevant suit: Spades (lockpicking is cunning)
- High spades: Ace and King
- Player's Lockpicking skill: Level 45 = +28.75 Spades bonus

Calculation:
- Pair (base success) + High Spades cards + Lockpicking bonus
- Final: Great Success

Result shown to player:
"You carefully work the tumblers with steady hands...
[A♠ K♠ 7♣ 3♥ 3♦] - Pair with dominant Spades
The safe clicks open. Inside you find $1,247 and a rare Silver Star badge."
```

**Example 2: Duel at High Noon**
```
Action: Challenge rival gunslinger to duel
Attacker draws: 9♣ 9♦ 5♣ 2♣ 2♥
Defender draws: K♣ Q♥ J♣ 8♣ 4♠

Attacker Analysis:
- Base hand: Two Pair (9s and 2s) - Good Success
- Relevant suit: Clubs (combat)
- Clubs: 9♣, 5♣, 2♣ (three clubs)
- Gun Fighting Level 72 = +65 Clubs bonus
- Quick Draw Level 40 = +23.75 Clubs bonus
- Total Clubs bonus: +88.75

Defender Analysis:
- Base hand: High Card (King) - Failure/Minimal
- Relevant suit: Clubs
- Clubs: K♣, J♣, 8♣ (three clubs, but weaker hand)
- Gun Fighting Level 35 = +18.75 Clubs bonus
- Quick Draw Level 28 = +7.5 Clubs bonus
- Total Clubs bonus: +26.25

Result:
Attacker wins decisively (Two Pair + massive Clubs bonus vs High Card + moderate bonus)

Narrative:
"The sun beats down on the dusty street. Your hand hovers over your Colt...
[9♣ 9♦ 5♣ 2♣ 2♥] - Two Pair, heavy Clubs
Your draw is lightning. The shot echoes before they clear leather.
Your opponent falls. The street is yours."
```

**Example 3: Spirit Quest Encounter**
```
Action: Commune with canyon spirits for vision quest
System draws: A♥ K♥ Q♥ 8♥ 3♦

Hand Analysis:
- Base hand: Flush (Hearts) - Exceptional Success + Suit Amplification!
- Relevant suit: Hearts (spiritual/charisma)
- Four high Hearts cards
- Spirit Walking Level 58 = +41.5 Hearts bonus
- Persuasion Level 33 = +16.25 Hearts bonus
- Total Hearts bonus: +57.75

Calculation:
- Flush (exceptional) + Hearts flush (perfect suit match) + high bonus
- Final: Near-Mythic spiritual encounter

Result:
"You sit in meditation as the desert wind whispers...
[A♥ K♥ Q♥ 8♥ 3♦] - Hearts Flush
The veil parts. The Thunderbird descends, its eyes ancient and knowing.
'Seek the canyon where shadows dance at noon. There you will find your answer.'
You have received: Spirit Animal Companion (Thunderbird Aspect) - Legendary"
```

### Destiny Deck Implementation Notes

**Technical Considerations:**
- Use cryptographically secure random number generation for fairness
- Log all draws for audit/anti-cheat purposes
- Display animated card reveals for dramatic effect
- Allow players to see their opponent's hand after PvP resolution
- Store hand results in transaction logs for dispute resolution

**Balance Mechanisms:**
- No deck stacking or loaded decks (pure RNG)
- Skills provide consistent mathematical advantages
- High-level players win more often but luck still matters
- New players can occasionally triumph (keeps hope alive)
- Critical actions might allow "redraws" as rare consumable items

**UI/UX Design:**
- Cards displayed with western-style playing card designs
- Animations for card flips and reveals
- Suit symbols (♠♥♣♦) used throughout UI for skills/stats
- Color coding: Spades (black), Hearts (red), Clubs (green), Diamonds (gold)
- Hand strength indicator shows player why they succeeded/failed

---

## SETTING: THE SANGRE TERRITORY

### Geographic Overview

**The Sangre Territory** is a border frontier region in the mythic American Southwest, circa 1870s. The territory gets its name from the red canyon walls that seem to bleed at sunset, and from the blood spilled in the ongoing three-way conflict for control.

**Climate & Terrain:**
- Harsh desert and scrubland
- Dramatic red rock canyons and mesas
- Sparse water sources (control = power)
- Extreme temperature swings
- Dust storms and dangerous wildlife
- Sacred sites with supernatural properties

### Major Locations (MVP)

#### 1. RED GULCH (Settler Town)
**Description:** A rapidly growing boomtown centered around the newly arrived railroad terminus. Wood-frame buildings spring up daily as settlers flood in seeking fortune and opportunity.

**Key Features:**
- **The Iron Rail Saloon** - Social hub, gambling, information
- **Red Gulch Bank** - Stores player money (safer than carrying cash)
- **Sheriff's Office** - Law enforcement, bounty board, jail
- **General Store** - Basic supplies and equipment
- **Doc Holliday's Office** - Medical services, healing
- **Railroad Station** - Fast travel hub (when functional)
- **Land Office** - Property claims, territorial disputes

**Faction Control:** Settler Alliance stronghold
**Safety Level:** High for Settlers, Medium for Neutral, Low for Nahi/Outlaws
**NPC Population:** Miners, merchants, lawmen, railroad workers, gamblers

#### 2. THE FRONTERA (Lawless Borderlands)
**Description:** A ramshackle collection of tents, adobe buildings, and hidden tunnels on the edge of civilized territory. No law reaches here - only the law of survival.

**Key Features:**
- **The Scorpion's Den** - Underground gambling hall and black market
- **Smuggler's Rest** - Neutral meeting ground, information broker
- **Hidden Hideouts** - Gang-owned safe houses (instanced)
- **The Gallows** - Execution site turned outlaw memorial
- **Contraband Warehouse** - Illegal goods trading

**Faction Control:** Shifting power between outlaw gangs
**Safety Level:** Low for everyone, constant PvP risk
**NPC Population:** Outlaws, deserters, smugglers, fugitives, opportunists

#### 3. KAIOWA MESA (Native Territory)
**Description:** Sacred homeland of the Kaiowa people, built into and around towering red rock formations. Ancient petroglyphs mark the canyon walls, and the air hums with spiritual energy.

**Key Features:**
- **Council Lodge** - Tribal governance, diplomatic missions
- **Spirit Lodge** - Supernatural quests and Spirit Walking training
- **Tribal Trading Post** - Traditional goods, unique items
- **Sacred Fire Circle** - Community gathering, ceremonies
- **Elder's Wisdom Tree** - Quest givers, lore, training
- **Cliff Dwellings** - Residential area

**Faction Control:** Nahi Coalition stronghold
**Safety Level:** High for Nahi, Medium for Respectful visitors, Low for Settlers/Aggressors
**NPC Population:** Kaiowa people, spiritual leaders, hunters, artisans

#### 4. SANGRE CANYON (Wilderness)
**Description:** The dangerous frontier between settlements. This vast canyon system is where fortunes are made, lives are lost, and legends are born.

**Key Features:**
- **Prospector's Claim** - Mining sites, gold panning
- **Bandit Camps** - Criminal activity locations
- **Spirit Grounds** - Supernatural encounter zones
- **Ambush Points** - PvP hotspots
- **Hidden Caves** - Exploration, treasure hunting
- **Water Sources** - Contested control points

**Faction Control:** Contested, changes based on territory wars
**Safety Level:** Very Low, constant danger
**Encounters:** Wildlife, bandits, spirits, other players, environmental hazards

### World Lore

**Historical Context (Fictionalized):**
The Sangre Territory has been Kaiowa homeland for centuries, but the discovery of gold in 1867 brought a flood of settlers. The completion of the railroad to Red Gulch in 1873 intensified the conflict. The US government claims jurisdiction, but enforcement is sparse. Three powers now vie for control:

1. **Settler Alliance** - Backed by railroad money and federal support
2. **Nahi Coalition** - United tribes defending ancestral lands
3. **Frontera Gangs** - Opportunists exploiting the chaos

**Mythic Elements:**
The Sangre Territory sits on what the Kaiowa call "thin ground" - where the veil between the physical and spirit worlds is permeable. Strange occurrences are common:
- Spirits manifest at dusk and dawn
- Sacred sites grant visions and power
- Ancient artifacts hold supernatural properties
- Creatures from legend sometimes appear
- The land itself seems conscious and watchful

**The Central Mystery:**
Why is the Sangre Territory so saturated with spiritual energy? The Kaiowa speak of an ancient pact, sealed in blood. The settlers dismiss it as superstition. The outlaws just want to profit. But something stirs in the deep canyons, awakening after centuries of sleep...

*(This mystery provides framework for future story content and events)*

---

## FACTION SYSTEM

### Overview
Players align with one of three major powers competing for control of the Sangre Territory. Faction choice affects available content, allies/enemies, abilities, and roleplaying identity.

### THE THREE POWERS

#### THE SETTLER ALLIANCE
*"Progress and Prosperity"*

**Philosophy:**
The future belongs to civilization, law, and industrial progress. The frontier must be tamed, the railroad must expand, and prosperity must be brought to this savage land. The Settler Alliance represents Manifest Destiny, believing American expansion is inevitable and righteous.

**Internal Factions:**
- **Lawmen** - Marshals, sheriffs, deputies maintaining order
- **Railroad Barons** - Corporate interests expanding commerce
- **Homesteaders** - Ordinary folk seeking new lives
- **Cavalry** - Military presence enforcing federal authority

**Leadership Structure:**
- **Marshal** (Player-elected post-MVP) - Leads law enforcement
- **Railroad Commissioner** (NPC MVP, player post-MVP) - Economic direction
- **Territorial Governor** (NPC) - Political authority

**Controlled Territory (Starting):**
- Red Gulch (stronghold)
- Southern trade routes
- Railroad corridor
- Some mining claims

**Benefits:**
- Access to advanced firearms and technology
- Bank loans and investment opportunities
- Legal business licenses
- Railroad fast travel (when built)
- Law protection in settler towns
- Cheaper prices in Red Gulch
- Access to cavalry backup in territory wars

**Drawbacks:**
- Wanted by Frontera outlaws (higher PvP risk)
- Distrusted by Nahi (hostile in native territories)
- Restricted in black market activities
- Reputation losses for crimes
- Expected to uphold the law

**Unique Abilities (High Reputation):**
- **Deputy's Authority**: Can arrest wanted players in settler territory
- **Railroad Discount**: Reduced fast travel costs
- **Cavalry Call**: Summon NPC backup in gang wars (cooldown)
- **Federal Bounty**: Place official bounties on outlaws

---

#### THE NAHI COALITION
*"The Old Ways Endure"*

**Philosophy:**
The Sangre Territory is sacred homeland, not empty wilderness to be conquered. The Nahi Coalition unites tribal communities to defend their lands, preserve their culture, and maintain balance with the spirit world. They resist settler expansion while selectively cooperating with those who show respect.

**Fictional Tribal Nations:**
- **Kaiowa** (plains people) - Diplomatic, horse masters
- **Tseka** (mountain folk) - Fierce warriors, spiritual leaders
- **Nahi** (desert dwellers) - Survivalists, trackers, herbalists

*(These are fictional nations inspired by real cultures but not claiming to represent any specific real tribe)*

**Leadership Structure:**
- **Council of Elders** (NPC council with player representatives post-MVP)
- **War Chief** (Elected in times of conflict)
- **Spiritual Leader** (Based on Spirit Walking skill)

**Controlled Territory (Starting):**
- Kaiowa Mesa (stronghold)
- Sacred sites throughout Sangre Canyon
- Northern wilderness regions
- Hidden water sources

**Benefits:**
- Access to spirit medicine and supernatural quests
- Enhanced connection to mythic elements
- Stealth and tracking bonuses in wilderness
- Safe passage in native territories
- Spiritual abilities unavailable to others
- Training from tribal elders (unique skills)
- Spirit animal companions (post-MVP)

**Drawbacks:**
- Limited access to modern firearms and technology
- Targeted by aggressive settler factions
- Fewer modern amenities (no bank, limited shops)
- Lower cash income (more barter-based)
- Hostile in Red Gulch without disguise

**Unique Abilities (High Reputation):**
- **Spirit Walking**: Access to vision quests and spiritual encounters
- **Sacred Ground**: Bonuses when fighting in native-controlled territory
- **Wilderness Mastery**: Enhanced stealth and tracking in wilderness
- **Tribal Medicine**: Powerful healing abilities and buffs

---

#### THE FRONTERA
*"Freedom Above All"*

**Philosophy:**
No masters, no laws, just survival of the cunning. The Frontera rejects both settler authority and tribal traditions, carving out a third path based on individual freedom and profit. Outlaws, deserters, smugglers, and rebels find common cause in the lawless borderlands.

**Internal Groups:**
- **Outlaw Gangs** - Organized crime syndicates
- **Smugglers** - Moving contraband across borders
- **Deserters** - Former soldiers, both settler and native
- **Opportunists** - Anyone seeking to profit from chaos

**Leadership Structure:**
- **Evolving power structure** - Strongest gangs dominate
- **Gang bosses** compete for influence
- **No central authority** - Alliances shift constantly

**Controlled Territory (Starting):**
- The Frontera settlement (stronghold)
- Hidden hideouts scattered across territory
- Black market trade routes
- Contested canyon regions

**Benefits:**
- Access to black market goods (better prices than legal)
- Illegal activities less restricted
- Can trade with all factions (neutral ground)
- Gang system for organization and power
- Freedom to attack anyone without faction penalties
- Higher risk, higher reward on all activities
- Access to unique contraband items

**Drawbacks:**
- No legal protection anywhere
- Wanted by law in settler territories
- Mistrusted by both other factions
- Constant PvP threat from all sides
- No safety net (no free healing, respawn penalties)
- Internal conflict (gangs fight each other)

**Unique Abilities (High Reputation):**
- **Black Market Connections**: Access to rare and illegal goods
- **Outlaw's Cunning**: Bonus to Spades (criminal activities)
- **Hideout Network**: Quick escape options in wilderness
- **Lawless**: No reputation penalties for crimes

---

### Reputation System

Each faction tracks separate reputation scores from -100 to +100:

| Reputation Range | Status | Effects |
|------------------|--------|---------|
| +75 to +100 | Honored | Special privileges, unique quests, faction abilities unlocked, 20% discounts, faction leader interactions |
| +25 to +74 | Respected | Full access to faction content, 10% discounts, can participate in faction wars |
| 0 to +24 | Neutral | Basic access, standard prices, limited to public areas |
| -24 to -1 | Mistrusted | Limited access, 25% price increases, some NPCs hostile |
| -25 to -74 | Hostile | Attacked on sight in faction territory, no trading, bounties placed |
| -75 to -100 | Blood Enemy | Kill-on-sight status, high bounties, severe penalties if caught |

**Gaining Reputation:**
- Complete faction quests (+5 to +25)
- Win territory battles (+10 to +30)
- Donate resources to faction (+1 to +5)
- Defend faction members in PvP (+2 to +10)
- Roleplay and community contributions (+1 to +5 from staff/votes)

**Losing Reputation:**
- Attack faction members (-10 to -30)
- Commit crimes in faction territory (-5 to -20)
- Fail faction quests (-2 to -10)
- Control territory against faction interests (-5 to -15)
- Betray faction in wars (-20 to -50)

**Faction Switching:**
- Players can change allegiance over time
- Requires reaching +25 with new faction and below -25 with old
- Penalties: Lose all faction-specific items, temporary debuff
- Cooldown: 30 days between switches
- Roleplay implications: Treated as traitor by former faction

---

### Faction Conflict Mechanics

**Territory Wars:**
- Factions compete for control of strategic locations
- Winning provides passive income and bonuses
- Requires coordination between multiple players
- Scheduled battles and spontaneous skirmishes

**Political Intrigue:**
- Players can spy on other factions
- Diplomatic missions and peace negotiations
- Betrayals and double-agents possible
- Faction-wide events and storylines

**Cultural Expression:**
- Each faction has unique aesthetic and flavor
- Faction-specific emotes, titles, cosmetics
- Different approaches to same problems
- Rich roleplaying opportunities

---

## SKILL SYSTEM

### Overview
Desperados Destiny features **29 skills** across 4 categories that take months to master, similar to Torn's progression system. Skills directly impact the Destiny Deck by providing suit bonuses, making long-term investment meaningful.

**Implementation Note (Updated December 2024):**
- Total Skills: 29 (5 Combat + 9 Cunning + 6 Spirit + 9 Craft)
- Max Level: 50 (Master tier)
- Estimated time to max one skill: ~283 hours (2-4 months casual play)
- Training: One skill at a time, continues offline

### Skill Categories

> **Note:** Skills are organized into 4 categories matching the Destiny Deck suits. Each skill has a max level of 50 with 5 tiers: Novice (1-10), Apprentice (11-25), Journeyman (26-40), Expert (41-49), Master (50).

#### COMBAT SKILLS (Boost ♣ Clubs) — 5 Skills

**1. Melee Combat** 🗡️
- **Description:** Hand-to-hand fighting with fists, knives, and close weapons
- **Primary Actions:** Brawls, close-quarters combat, disarmed fighting
- **Max Level:** 50

**2. Ranged Combat** 🔫
- **Description:** Accuracy with rifles, pistols, and bows
- **Primary Actions:** Firearm combat, duels, gang wars
- **Max Level:** 50

**3. Defensive Tactics** 🛡️
- **Description:** Blocking, dodging, and defensive maneuvers
- **Primary Actions:** Damage mitigation, combat defense
- **Max Level:** 50

**4. Mounted Combat** 🏇
- **Description:** Fighting on horseback
- **Primary Actions:** Cavalry charges, chase combat, raids
- **Max Level:** 50

**5. Explosives** 💣
- **Description:** Using and defusing dynamite and explosives
- **Primary Actions:** Mining blasts, demolition, trap-making
- **Max Level:** 50

---

#### CUNNING SKILLS (Boost ♠ Spades) — 9 Skills

**6. Lockpicking** 🔓
- **Description:** Opening locks without keys
- **Primary Actions:** Breaking & entering, safe cracking, treasure hunting
- **Max Level:** 50

**7. Stealth** 👤
- **Description:** Moving unseen and unheard
- **Primary Actions:** Avoid detection, ambush, sneak attacks
- **Max Level:** 50

**8. Pickpocket** 💰
- **Description:** Stealing from others without detection
- **Primary Actions:** Steal cash from players/NPCs, petty theft
- **Max Level:** 50

**9. Tracking** 👣
- **Description:** Following trails and finding hidden things
- **Primary Actions:** Hunt players, find resource nodes, investigate
- **Max Level:** 50

**10. Deception** 🎭
- **Description:** Lying, disguises, and trickery
- **Primary Actions:** Con schemes, false identities, misdirection
- **Max Level:** 50

**11. Gambling** 🎲
- **Description:** Card games, dice, and games of chance
- **Primary Actions:** Casino games, betting, risk assessment
- **Max Level:** 50

**12. Perception** 👁️
- **Description:** Reading opponents and detecting tells in duels
- **Primary Actions:** Opponent analysis, duel advantages
- **Duel Unlocks:** L5 Read Confidence, L20 Hand Range Sense, L35 Active Read, L45 Partial Reveal
- **Max Level:** 50

**13. Sleight of Hand** 🃏
- **Description:** Card manipulation and subtle cheating techniques
- **Primary Actions:** Cheat at gambling, card tricks
- **Max Level:** 50

**14. Poker Face** 😐
- **Description:** Hiding tells and blocking opponent reads
- **Primary Actions:** Counter opponent perception, bluff protection
- **Max Level:** 50

---

#### SPIRIT SKILLS (Boost ♥ Hearts) — 6 Skills

**15. Medicine** 💊
- **Description:** Healing wounds and curing ailments
- **Primary Actions:** Heal self and others, craft medicine, reduce recovery time
- **Max Level:** 50

**16. Persuasion** 💬
- **Description:** Convincing others through words
- **Primary Actions:** Negotiations, avoid conflict, quest outcomes
- **Max Level:** 50

**17. Animal Handling** 🐴
- **Description:** Training and calming animals
- **Primary Actions:** Taming mounts, bonding with horses, spirit animals
- **Max Level:** 50

**18. Leadership** ⭐
- **Description:** Inspiring and commanding others
- **Primary Actions:** Gang bonuses, recruit followers, faction influence
- **Max Level:** 50

**19. Ritual Knowledge** 🔮
- **Description:** Understanding supernatural rituals and traditions
- **Primary Actions:** Vision quests, supernatural encounters, mythic content
- **Max Level:** 50

**20. Performance** 🎵
- **Description:** Music, storytelling, and entertainment
- **Primary Actions:** Entertain for money, boost morale, social influence
- **Max Level:** 50

---

#### CRAFT SKILLS (Boost ♦ Diamonds) — 9 Skills

**21. Blacksmithing** ⚒️
- **Description:** Forging metal tools and weapons
- **Primary Actions:** Create weapons, armor, horseshoes
- **Max Level:** 50

**22. Leatherworking** 🧳
- **Description:** Crafting leather goods and armor
- **Primary Actions:** Create protective gear, saddles, clothing
- **Max Level:** 50

**23. Cooking** 🍖
- **Description:** Preparing food and tonics
- **Primary Actions:** Create food items that provide buffs
- **Max Level:** 50

**24. Alchemy** 🧪
- **Description:** Brewing potions and elixirs
- **Primary Actions:** Create buffs, healing items, poisons
- **Max Level:** 50

**25. Engineering** ⚙️
- **Description:** Building traps, mechanisms, and devices
- **Primary Actions:** Create traps, gadgets, property upgrades
- **Max Level:** 50

**26. Mining** ⛏️
- **Description:** Extracting ore and gems from the earth
- **Primary Actions:** Mine resources, operate claims
- **Max Level:** 50

**27. Prospecting** 🔍
- **Description:** Finding and assessing ore deposits, illegal claim operations, and deep mining
- **Primary Actions:** Gold panning, claim discovery, resource assessment
- **Max Level:** 50

**28. Herbalism** 🌿
- **Description:** Gathering and identifying plants
- **Primary Actions:** Collect herbs for cooking/alchemy
- **Max Level:** 50

**29. Carpentry** 🪵
- **Description:** Woodworking and furniture crafting
- **Primary Actions:** Build structures, furniture, property improvements
- **Max Level:** 50

---

### Skill Training System

**Training Methods:**

**1. Time-Based Training (Primary)**
- Queue skills to train (like Torn)
- Progress over real-time hours/days
- **ONE SKILL AT A TIME:** Cannot train multiple skills simultaneously
  - Strategic choice: Players must prioritize which skill to develop
  - Creates meaningful progression decisions
  - Cannot queue multiple skills in advance (choose one, wait, choose next)
- Requires payment (gold) to start training session
  - Cost scales with level: Level × $10 (Level 50 costs $500 to start)
- Training continues even when logged out (passive progression)
- Can cancel training early, but lose progress and gold investment

**Training Time Formula (Updated Phase 19):**
```
XP per Level = Level^2.0 × 50
Training Time = baseTime × (1 + √level × 0.15)

Level progression examples:
- Level 1→2: ~50 XP (~1 hour base)
- Level 10→11: ~5,000 XP
- Level 25→26: ~31,250 XP
- Level 49→50: ~125,000 XP

Total to max one skill: ~283,000 XP (~283 hours)
```

**2. Use-Based Training (Secondary)**
- Performing related actions grants small XP bonus
- Reduces time of current training session
- Caps at 10% reduction per training session
- Encourages active gameplay

**Example:**
- Training Ranged Combat 45→46
- Win 10 duels during training period
- Each duel grants 0.5% reduction
- Final time: 10% faster

**3. Mentor Training (Post-MVP)**
- Higher-level players can mentor lower-level players
- Grants bonus training speed to student
- Mentor gains small rewards
- Requires both players to be online and in same location

---

### Skill Caps and Progression

**Energy-Free Actions:**
- Queueing skills to train
- Checking skill progress
- Reading skill descriptions

**Energy-Required Actions:**
- Actually using skills in gameplay
- Skill-based activities (lockpicking, combat, etc.)
- Accelerated training methods (future feature)

**Skill Benefits Beyond Destiny Deck:**
- **Unlock New Content:** Certain activities require minimum skill levels
  - Example: Bank robbery requires Lockpicking 40+
  - Example: Vision quests require Ritual Knowledge 30+
- **Passive Bonuses:** Some skills provide always-on benefits
  - Example: Animal Handling improves horse bonding
  - Example: Cooking creates buff items
- **Economic Advantages:** Crafting skills enable profit
  - High Blacksmithing = valuable custom weapons
  - High Prospecting = better mining claim returns

---

### Skill Respec Policy

**Design Decision:** One free respec, then premium currency cost.

**Respec (Skill Reset) Mechanics:**
- **Purpose:** Allows players to redistribute skill points if they regret choices
- **First Respec:** FREE for all players
  - Available at any time after character creation
  - Intended for new players who made mistakes learning the game
  - One-time forgiveness for poor early decisions
- **Subsequent Respecs:** Cost premium currency
  - Second respec: 50 premium tokens (~$5 equivalent)
  - Third respec: 100 tokens (~$10)
  - Fourth+ respecs: 150 tokens (~$15)
  - Escalating cost prevents constant min-maxing
- **Respec Process:**
  - All skills reset to level 0
  - All invested time converted to "skill points"
  - Player redistributes points however they want
  - Cannot save points for later (must allocate immediately)
- **What's Preserved:**
  - Character level and experience
  - Gold, items, equipment
  - Gang membership and faction standing
  - All social connections

**Why This System:**
- Forgives new players for mistakes (first free respec)
- Creates revenue opportunity (subsequent respecs)
- Prevents meta-gaming (can't constantly respec for each activity)
- Still allows flexibility if players genuinely want different builds

---

### Skill Display and UI

**Skill Sheet:**
- Visual representation using suit symbols (♠♥♣♦)
- Progress bars for current training
- Time remaining for active training
- Suit bonus calculations shown
- Compare your skills with other players

**In-Game Notifications:**
- Skill level-up celebrations
- Major tier milestones (Apprentice L11, Journeyman L26, Expert L41, Master L50)
- Unlocked abilities at certain thresholds

---

## ENERGY & FATIGUE

### Core Concept
Energy is the limiting resource that prevents 24/7 grinding and creates value for premium subscriptions. Inspired by Torn's energy system but thematically adapted to the wild west setting.

### Energy Mechanics

**Free Player Energy Pool:**
- **Base Maximum:** 150 energy
- **Regeneration:** 5 energy per hour (120/day passive)
- **Improvement:** Certain skills can increase max by small amounts
  - Wilderness Survival: +0.25 max per 10 levels (max +2.5)
  - Cooking skill can create food that extends pool temporarily
  - Total achievable for free players: ~175 max through grinding

**Premium Player Energy Pool:**
- **Base Maximum:** 250 energy
- **Regeneration:** 8 energy per hour (192/day passive)
- **All other improvements stack on top**

**Energy Costs by Activity Type:**

| Activity | Energy Cost | Cooldown |
|----------|-------------|----------|
| **Minor Actions** | | |
| Pickpocket | 5 | 5 min |
| Quick travel (short distance) | 8 | None |
| Simple crime (shoplifting) | 10 | 10 min |
| **Moderate Actions** | | |
| Robbery (NPC) | 15 | 15 min |
| Duel (initiate) | 20 | 30 min |
| Prospecting session | 20 | None |
| Lockpicking attempt | 15 | 10 min |
| **Major Actions** | | |
| Organized heist | 35 | 2 hours |
| Gang war participation | 40 | 4 hours |
| Territory raid | 50 | 6 hours |
| Vision quest | 45 | 24 hours |
| **Free Actions** | | |
| Chat | 0 | None |
| Trading with players | 0 | None |
| Viewing profiles | 0 | None |
| Skill training (queue) | 0 | None |
| Reading/exploring UI | 0 | None |

**Strategic Depth:**
- Players must choose between many small actions or few large ones
- High-level players focus energy on most profitable activities
- Encourages planning and optimization
- Creates natural "session" structure (spend energy, log out, return when regenerated)

### Energy Recovery Methods

**1. Passive Regeneration (Primary)**
- Automatic hourly regeneration
- Continues when logged out
- Never exceeds maximum pool

**2. Consumable Items**
- **Coffee** (+10 energy, common) - $5 at General Store
- **Whiskey** (+15 energy, common) - $8 at Saloons
- **Cooked Meal** (+20 energy, crafted) - Requires Cooking skill
- **Spirit Medicine** (+30 energy, rare) - Requires Spirit Walking or Nahi reputation
- **Premium Energy Tonic** (+50 energy, premium shop) - 10 premium tokens

**3. Rest Locations**
- **Hotel Room** - +8 energy/hour (costs $2/hour, max 8 hours)
- **Gang Hideout** - +6 energy/hour (free for gang members)
- **Campsite** - +5 energy/hour (free, wilderness only)

**4. Premium Subscription**
- Higher base maximum
- Faster regeneration rate
- Access to premium tonics

### Anti-Abuse Mechanics

**Energy Cannot Be:**
- Traded between players
- Stored beyond maximum
- Exploited through logout tricks (regeneration based on server time)

**Multiple Accounts:**
- One character per person policy
- IP monitoring for abuse
- Linked account detection
- Penalties: Account bans

### Why This System Works

**For Free Players:**
- Can compete with skill and strategy
- 120 energy/day = 6 moderate actions or 2-3 major actions daily
- Grinding skills can improve efficiency
- Still meaningful progression

**For Premium Players:**
- 192 energy/day = 9-10 moderate actions or 4-5 major actions
- Quality of life improvement
- Not "pay to win" - just more attempts
- Skill still matters more than energy

**For Game Health:**
- Prevents no-life grinding domination
- Creates playing field equilibrium
- Encourages multiple sessions per day (engagement)
- Provides monetization without being predatory
- Values player time appropriately

---

## COMBAT SYSTEM

### Overview
Combat in Desperados Destiny uses the Destiny Deck system with Clubs-focused resolution. All combat - duels, gang wars, criminal shootouts - follows the same core mechanic with contextual variations.

### Combat Flow

**Initiation:**
1. Attacker challenges target (costs energy)
2. Both sides' combat stats calculated
3. System draws Destiny Deck hands for both
4. Clubs bonuses applied from skills
5. Equipment modifiers added
6. Hand strength + bonuses determine outcome
7. Damage calculated based on success margin
8. Results narrated with thematic flavor

---

### Combat Abilities (Updated December 2024)

Combat uses a **Hold/Discard poker mechanic** where players receive 5 cards, choose which to hold, then draw replacement cards for discarded ones. Special abilities unlock at higher combat skill levels.

#### Available Abilities

| Ability | Unlock Requirement | Effect |
|---------|-------------------|--------|
| **Reroll** | Combat Skill 30+ | Replace a held card with a new draw. +1 reroll per 30 skill levels |
| **Peek** | Combat Skill 50 | See the next card before making hold/discard decision |
| **Quick Draw** | Combat Skill 60+ | Draw 6 cards instead of 5 (more hand options) |
| **Deadly Aim** | Combat Skill 75+ | Critical hits deal 1.5× damage |

> **Note:** Quick Draw and Deadly Aim thresholds may require combined combat skill levels across multiple skills or future skill cap increases.

#### Combat Resolution Phases

1. **DRAW** - Player receives 5 cards (6 with Quick Draw)
2. **DECISION** - Player marks cards to hold, may use Peek ability
3. **DISCARD** - Unmarked cards replaced with new draws, may use Reroll
4. **EVALUATION** - Final hand evaluated using poker rankings
5. **DAMAGE** - Winner deals damage based on hand strength margin

#### Hand Rankings (Highest to Lowest)

| Rank | Hand | Example |
|------|------|---------|
| 1 | Royal Flush | A♣ K♣ Q♣ J♣ 10♣ |
| 2 | Straight Flush | 7♠ 6♠ 5♠ 4♠ 3♠ |
| 3 | Four of a Kind | 9♥ 9♦ 9♣ 9♠ K♣ |
| 4 | Full House | J♥ J♦ J♣ 4♠ 4♥ |
| 5 | Flush | A♦ J♦ 8♦ 5♦ 2♦ |
| 6 | Straight | 10♣ 9♥ 8♦ 7♠ 6♣ |
| 7 | Three of a Kind | Q♠ Q♥ Q♦ 7♣ 2♥ |
| 8 | Two Pair | K♥ K♣ 5♦ 5♠ 9♣ |
| 9 | Pair | A♠ A♦ J♣ 8♥ 3♠ |
| 10 | High Card | K♥ J♦ 9♣ 6♠ 3♥ |

#### Special Hand: Dead Man's Hand
- **Aces & Eights** (two pairs: Aces and Eights)
- Triggers special random events - blessing or curse
- Named after Wild Bill Hickok's death hand

### Combat Types

#### 1. DUELS (1v1 Combat)

**Player vs Player Duels:**
- Attacker spends 20 energy
- Defender automatically pulled into combat (no energy cost)
- Quick Draw skill determines initiative (who shoots first)
- Both draw hands, Clubs bonuses applied
- Winner determined by best hand + bonuses
- Loser takes damage and potential penalties

**Duel Outcomes:**

**Attacker Wins:**
- Defender loses health (25-75% based on margin of victory)
- Attacker takes % of defender's carried cash (10-30%, not banked)
- Reputation: Attacker gains fame, defender loses based on context
- Possible item loot (5% chance for equipped item)
- Bounty rewards if defender is wanted

**Defender Wins:**
- Attacker loses health
- Attacker loses carried cash
- Reputation loss for failed attack
- Cooldown doubled (40 minutes before next duel)

**Draw (Rare):**
- Both hands identical strength and bonuses
- Both take minor damage
- No cash exchanged
- Can immediately re-challenge (still costs energy)

**Player vs NPC Duels:**
- Similar mechanics but NPC difficulty varies
- Bounty targets are tougher (higher bonuses)
- Lawmen in Red Gulch will assist each other
- Nahi warriors in Kaiowa Mesa have Spirit bonuses

**Duel Restrictions:**
- Cannot duel in safe zones (inside buildings, certain NPC areas)
- Cannot duel players 10+ levels below you (prevents griefing)
- Maximum 5 duels against same player per day (anti-harassment)
- Cannot duel while jailed or severely wounded

---

#### 2. GANG WARS (Group PvP)

**Initiation:**
- Gang leader declares war on enemy gang
- Members opt-in to participate (costs 40 energy each)
- Minimum 3 members per side
- Scheduled battle time (24 hour notice)

**Battle Resolution:**
- Each participant's skills contribute to gang's overall strength
- System draws hands for each participant
- **Aggregate Score:** Sum of all hand strengths + Clubs bonuses
- Gang with highest aggregate wins

**Example:**
```
Red Scorpions Gang (5 members):
  Member 1: Three of a Kind + 45 Clubs = 70
  Member 2: Pair + 38 Clubs = 48
  Member 3: Straight + 52 Clubs = 92
  Member 4: Two Pair + 41 Clubs = 61
  Member 5: High Card + 33 Clubs = 33
  Total: 304

Iron Rails Gang (4 members):
  Member 1: Flush + 48 Clubs = 98
  Member 2: Two Pair + 44 Clubs = 64
  Member 3: Three of a Kind + 39 Clubs = 69
  Member 4: Pair + 36 Clubs = 46
  Total: 277

Red Scorpions win: 304 vs 277
```

**Gang War Rewards:**
- **Winners:** Territory control, reputation gains, cash from gang vault
- **Losers:** Reputation loss, possible territory loss
- **All Participants:** Combat XP for Gun Fighting skill

**Territory Impact:**
- Winning gang can claim contested territory
- Defending gang keeps control if they win
- Territory provides ongoing benefits (resources, income)

---

#### 3. CRIMINAL ACTIVITIES (PvE Combat)

**Types:**

**Bank Robbery:**
- Energy Cost: 35
- Lockpicking check to enter (Spades)
- Combat with guards (Clubs)
- Success: $500-2000 depending on hand strength
- Failure: Jail time (30-120 min), bounty added

**Stagecoach Holdup:**
- Energy Cost: 25
- Tracking to find stagecoach (Spades)
- Combat with guards (Clubs)
- Possible passenger loot (random items)
- Success: $200-800, items
- Failure: Bounty, possible injury

**Train Robbery (High-Level):**
- Energy Cost: 50
- Requires organized gang (3+ members)
- Multi-stage: Board train (Clubs), crack safe (Spades), escape (both)
- Success: $1000-5000, rare items
- Failure: Major bounty, gang reputation loss

**Bounty Hunting (Legal Combat):**
- Target wanted outlaws
- Combat resolution same as duel
- Success: Bounty payout, reputation gain
- Failure: Target escapes, possible injury

---

### Health and Damage

**Health Pool:**
- Base: 100 HP
- Modified by: Wilderness Survival skill (+0.5 per 10 levels)
- Equipment: Armor adds HP
- Maximum achievable: ~150 HP

**Damage Calculation:**
```
Base Damage = 25 + (Victory Margin × 2)

Victory Margin = Winner's Total Score - Loser's Total Score

Example:
Winner: 75 total (Two Pair + 45 Clubs)
Loser: 40 total (Pair + 20 Clubs)
Margin: 35
Damage: 25 + (35 × 2) = 95 damage

Loser at 100 HP reduced to 5 HP
```

**Critical Hits:**
- Royal Flush or Straight Flush = Critical Hit
- Double damage
- Chance to instantly knock out opponent

**Knockouts & Hospital System:**

When reduced to 0 HP, you're knocked out and sent to the hospital. This follows the **Torn-style hospital time penalty** system:

**Hospital Mechanics:**
- **Automatic Transport:** Instantly transported to nearest town's hospital/healer
- **Hospital Time:** Cannot take ANY actions for a period based on how badly you lost
  - Minor defeat (close fight): 15-30 minutes
  - Moderate defeat: 30-60 minutes
  - Severe defeat (crushed): 60-120 minutes
- **Early Release:** Pay in-game currency to reduce hospital time
  - Cost scales with remaining time: $1 per minute
  - Example: 45 minutes remaining = $45 to leave immediately
  - Premium currency can also reduce time (10 tokens = 30 minutes off)
- **Hospital Status:** Other players can see you're hospitalized
- **Energy Continues:** Energy still regenerates while hospitalized
- **Skill Training Continues:** Training isn't interrupted

**Death Penalties (Applied When Hospitalized):**
- **Carried Cash Loss:** Lose 10-30% of cash you're carrying (not banked funds)
- **Item Drop Risk:** 5% chance to lose one random inventory item (not equipped gear)
- **Bounty Increase:** If you were wanted, bounty increases by 10-20%
- **Reputation Impact:** Small reputation loss in your faction
- **Temporary Debuff:** After leaving hospital, -10% to all skills for 30 minutes (recovering from injuries)

**No Permanent Death:**
- Characters never die permanently
- No experience loss
- No skill degradation
- Hospital is inconvenience, not catastrophe

**Strategic Implications:**
- Hospital time creates meaningful consequence without frustration
- Encourages players to bank cash before risky activities
- Creates market for healing items (avoid hospital altogether)
- Premium "skip hospital time" is quality-of-life, not pay-to-win

**Healing:**
1. **Passive:** 1 HP per 10 minutes (slow)
2. **Consumables:** Medicine, food items (instant)
3. **Doctor NPC:** Pay $20-50 for full heal
4. **Healing Skill:** Players with Healing can help others
5. **Rest:** Staying in hotel/hideout increases regen rate

---

### Equipment and Combat Bonuses

**Weapons:**

| Weapon Type | Clubs Bonus | Cost | Notes |
|-------------|-------------|------|-------|
| Rusty Revolver | +2 | $25 | Starter weapon |
| Colt Peacemaker | +8 | $150 | Standard sidearm |
| Winchester Rifle | +12 | $300 | Two-handed |
| Sawed-Off Shotgun | +10 | $200 | Close range bonus |
| Custom Six-Shooter | +15 | $800 | Gunsmithing crafted |
| Legendary Revolver | +20 | Rare drop | Named weapons |

**Armor:**

| Armor Type | HP Bonus | Cost | Notes |
|------------|----------|------|-------|
| Duster Coat | +5 | $50 | Basic protection |
| Leather Vest | +10 | $120 | Standard armor |
| Reinforced Coat | +15 | $250 | Leatherworking crafted |
| Cavalry Armor | +20 | Faction reward | Settler only |

**Accessories:**
- **Lucky Charm:** +2 to all suits (rare)
- **Sheriff's Badge:** +5 Clubs (lawmen only)
- **Spirit Totem:** +5 Hearts (Nahi only)
- **Outlaw's Bandana:** +5 Spades (Frontera only)

---

### Combat Strategy and Depth

**Skill Investment:**
- **Pure Gunfighter:** Max Gun Fighting, Quick Draw, Intimidation
- **Brawler:** Brawling focus for tavern fights, cheaper than guns
- **Mounted Warrior:** Horse Riding + Mounted Combat for raids
- **Balanced Fighter:** Spread skills for versatility

**Equipment Choices:**
- **Expensive Gear:** High bonuses but risk losing on death
- **Budget Gear:** Safer but less effective
- **Specialized:** Shotgun for close-quarters, rifle for duels

**Tactical Considerations:**
- **Initiative:** Quick Draw determines first shot (can win before opponent draws)
- **Location:** Fight in your faction's territory for backup
- **Timing:** Attack when target is low on health
- **Numbers:** Gang wars favor coordinated groups

**Risk Management:**
- Bank your cash before risky activities
- Don't carry valuable items into PvP zones
- Join a gang for protection and backup
- Build reputation to deter attacks

---

## TERRITORY CONTROL

### Overview
Factions and gangs compete for control of strategic locations throughout the Sangre Territory. Controlling territory provides passive income, resources, and strategic advantages.

### Controllable Territories (MVP)

**Territory Types:**

#### 1. MINING CLAIMS
- **Location:** Sangre Canyon, scattered sites
- **Resource Generated:** Gold (currency)
- **Income Rate:** $50-150 per hour per controlling gang
- **Strategic Value:** Direct income, funds gang activities
- **Default Control:** Contested (no owner at start)

**Example Locations:**
- **Lucky Strike Mine** - $100/hour, medium defense
- **Widow's Claim** - $75/hour, low defense
- **Copper Ridge** - $150/hour, high defense (endgame target)

#### 2. TRADE ROUTES
- **Location:** Connecting major settlements
- **Resource Generated:** Trade Goods (can be sold for gold)
- **Income Rate:** 10-30 goods per hour
- **Strategic Value:** Economic control, crafting materials
- **Default Control:** Settler Alliance (railroad routes)

**Example Locations:**
- **Red Gulch to Frontera Route** - 20 goods/hour
- **Canyon Pass Trail** - 15 goods/hour
- **Northern Trade Road** - 25 goods/hour

#### 3. SACRED SITES
- **Location:** Kaiowa Mesa, Sangre Canyon
- **Resource Generated:** Spirit Essence (supernatural currency)
- **Income Rate:** 5-15 essence per hour
- **Strategic Value:** Unlock spiritual content, unique items
- **Default Control:** Nahi Coalition

**Example Locations:**
- **Thunderbird's Perch** - 10 essence/hour, high spiritual significance
- **Whispering Stones** - 8 essence/hour, vision quest location
- **Ancestor's Spring** - 12 essence/hour, sacred water source

#### 4. OUTLAW CAMPS
- **Location:** Hidden in Frontera and wilderness
- **Resource Generated:** Contraband (black market goods)
- **Income Rate:** 8-20 contraband units per hour
- **Strategic Value:** Access to illegal items, hideouts
- **Default Control:** Various outlaw gangs

**Example Locations:**
- **Snake's Den** - 15 contraband/hour, weapons focus
- **Smuggler's Canyon** - 12 contraband/hour, mixed goods
- **Dead Man's Gulch** - 18 contraband/hour, high value (hotly contested)

---

### Control Mechanics

**Ownership:**
- Territories owned by gangs, not individual players
- Owning gang must be aligned with a faction
- Income distributed to gang vault
- Gang leader allocates resources to members

**Claiming Territory:**

**1. Initiate Raid:**
- Gang leader declares intent to claim territory
- Costs: 50 energy per participating member
- Minimum: 3 gang members required
- Warning: Defenders get 1 hour notice (real-time)

**2. Battle Resolution:**
- Similar to gang war mechanics
- Defenders get +20% bonus to total score (defensive advantage)
- Aggregate Destiny Deck resolution
- Best of 3 rounds

**3. Outcome:**
- **Attackers Win:** Territory control transfers
- **Defenders Win:** Control retained, attackers take penalties
- **Draw (rare):** Territory becomes contested, re-battle in 24 hours

**Defending Territory:**
- **Active Defense:** Gang members opt-in to defend (40 energy)
- **Passive Defense:** Territory has base defense rating
  - Low: +10% defensive bonus
  - Medium: +20% defensive bonus
  - High: +30% defensive bonus
- **NPC Defenders:** Some territories have NPC guards contributing to defense
- **Faction Support:** High faction reputation = NPC reinforcements

---

### Territory Upgrades (Post-MVP)

Gangs can invest resources to improve controlled territories:

**Upgrade Types:**
1. **Defenses** - Increase defensive bonus (costs gold + materials)
2. **Income** - Improve resource generation rate (costs gold + time)
3. **Facilities** - Add special features (crafting stations, storage, etc.)

**Example:**
```
Lucky Strike Mine (Initial)
- Income: $100/hour
- Defense: +10%

After Upgrades:
- Income: $175/hour (upgraded production)
- Defense: +25% (improved fortifications)
- Facility: Ore Processing (bonus to Prospecting when using)
```

---

### Strategic Layer

**Territory Networks:**
- Controlling adjacent territories provides bonuses
- **Connected Territories:** +10% income to all connected
- **Trade Route Control:** Controlling both ends of a trade route doubles income
- **Sacred Site Clusters:** Multiple sacred sites unlock special spiritual quests

**Map Control Victory:**
- Faction with most territory gains weekly bonuses
- Server-wide events based on territorial balance
- Seasons/campaigns focused on specific territories

**Economic Warfare:**
- Cut off enemy supply lines by claiming trade routes
- Starve enemy of resources through territorial control
- Force battles at strategic chokepoints

**Diplomatic Complexity:**
- Truces and alliances between gangs (even cross-faction)
- Territory trading/sharing agreements
- Betrayals and sudden attacks create drama

---

### Income Distribution

**How It Works:**
1. Territory generates resources hourly (server-automated)
2. Resources deposited into controlling gang's vault
3. Gang leader/officers distribute to members
4. Members can withdraw from vault (with permissions)

**Example Weekly Income:**
```
Red Scorpions Gang controls:
- Lucky Strike Mine: $100/hour = $16,800/week
- Canyon Pass Trail: 15 goods/hour = 2,520 goods/week
- Snake's Den: 15 contraband/hour = 2,520 contraband/week

Gang has 10 active members.
Weekly per-member distribution (if split evenly):
- $1,680 cash
- 252 trade goods
- 252 contraband units
```

**Distribution Methods:**
- **Equal Split:** Everyone gets same amount
- **Merit-Based:** Leaders assign based on contribution
- **Role-Based:** Different ranks get different %
- **Competitive:** Members bid or compete for resources

---

### Territory Status UI

**Map View:**
- Visual map of Sangre Territory
- Color-coded by controlling faction/gang
- Contested territories marked with special icons
- Click territory to see details:
  - Current owner
  - Income rate
  - Defense rating
  - Recent battle history
  - Declare raid button (if eligible)

**Territory Detail Panel:**
```
LUCKY STRIKE MINE
Owner: Red Scorpions Gang (Frontera)
Control Strength: 78%
Defense: Medium (+20%)
Income: $100/hour
Last Attack: 3 days ago
Next Vulnerable: Now (can be raided)

[Declare Raid] [View History]
```

---

## SOCIAL & ROLEPLAY

### Overview
Desperados Destiny is built for community and storytelling. Social systems encourage player interaction, faction roleplay, and emergent narratives.

### Core Social Features (MVP)

#### CHAT SYSTEM

**Channel Types:**

**1. Global Chat (Territory-Wide)**
- Separate channel for each major location
  - Red Gulch Chat
  - Frontera Chat
  - Kaiowa Mesa Chat
  - Sangre Canyon Chat
- Everyone in that location can participate
- Moderated for harassment/spam
- IC (in-character) and OOC (out-of-character) tags available

**2. Faction Chat**
- Private to your aligned faction
- Coordinate territory wars
- Share intel and strategy
- Faction-wide announcements from leaders
- All faction members see regardless of location

**3. Gang Chat**
- Private to your gang members
- Plan activities and raids
- Gang leader announcements
- Can set to IC or OOC mode

**4. Whispers (Direct Messages)**
- Private 1-on-1 conversations
- Persist across sessions
- Message history saved (last 100 messages)
- Can block harassers

**5. Saloon Chat (Roleplay Hub)**
- Location-based RP channel
- Available in Iron Rail Saloon, Scorpion's Den, etc.
- Heavier moderation for RP quality
- IC-only (out-of-character discouraged)

**Chat Features:**
- Emotes and custom actions
- Clickable player names to view profiles
- Link items/weapons in chat
- Roll dice for gambling/RP purposes
- Message reactions (thumbs up, laugh, etc.)
- Report system for abuse

---

#### PLAYER PROFILES

**Profile Components:**

**1. Basic Info (Always Visible)**
- Character name
- Faction allegiance
- Level and total XP
- Gang affiliation (if any)
- Titles and achievements
- Join date
- Last seen

**2. Character Bio (Player-Written)**
- Backstory (up to 1000 characters)
- Physical appearance description
- Personality traits
- Character motivations
- Relationships and connections

**3. Stats & Skills (Partially Visible)**
- Public: Overall level, visible achievements
- Private: Exact skill levels, cash amount (hidden from others)
- Adjustable privacy settings per stat

**4. Trophy Case**
- Display rare items
- Show off achievements
- Legendary hands from Destiny Deck (auto-saved if Royal Flush, etc.)
- Special event rewards
- Custom trophy descriptions

**5. Reputation Summary**
- Faction reputation levels (public)
- Fame and Infamy scores
- Titles earned through gameplay
  - "The Quick" (100 duel wins)
  - "Ghost of Sangre" (High stealth, many successful crimes)
  - "Spirit Walker" (Completed major vision quest)
  - "Railroad Baron" (High Settler rep + wealth)

**6. Wanted Poster (If Outlaw)**
- Current bounty amount
- Crimes committed
- Last known location
- Stylized as old west wanted poster
- Dead or Alive status

**Profile Customization:**
- Choose background aesthetic (weathered paper, wanted poster, etc.)
- Select title to display
- Privacy settings for different info
- Block list management

---

#### GANG/POSSE SYSTEM

**Gang Creation:**
- **Cost:** $500 + Level 15 minimum
- **Requires:** Minimum reputation with chosen faction (Neutral or above)
- **Gang Name:** Unique, 3-25 characters
- **Gang Tag:** 3-5 characters, displayed next to member names

**Gang Structure:**

**Ranks:**
1. **Leader** (1 per gang)
   - Full control over gang
   - Can promote/demote/kick members
   - Declare territory raids
   - Manage gang vault
   - Disband gang

2. **Officer** (Up to 5)
   - Can recruit new members
   - Limited vault access (withdraw small amounts)
   - Can initiate some gang activities
   - Help organize gang wars

3. **Member** (Unlimited)
   - Participate in gang activities
   - Contribute to gang vault
   - Access gang chat and benefits
   - Vote on gang decisions (if enabled)

**Gang Features:**

**Gang Vault:**
- Shared storage for resources
- Permissions set by leader
- Tracks contributions (who deposited what)
- Distribution logs for transparency
- Territory income automatically deposited here

**Gang Territory:**
- Can own hideouts/safe houses
- Provide resting bonuses to members
- Private gang instances (post-MVP)
- Display gang trophies and achievements

**Gang Bonuses:**
- **Leadership Skill:** Gang leader with high Leadership provides combat bonuses in wars
- **Unity Bonus:** Gangs with high activity get passive bonuses
- **Reputation:** Gang has collective reputation separate from members

**Gang Activities:**
- **Gang Wars:** Compete for territory and reputation
- **Organized Crimes:** High-level heists requiring multiple members
- **Social Events:** Poker nights, RP sessions, celebrations
- **Recruitment Drives:** Compete for best new players

**Leaving/Kicking:**
- Members can leave anytime (24-hour cooldown before joining new gang)
- Leaders can kick members (kicked members keep personal property, not gang vault access)
- If leader leaves, leadership transfers to highest-ranking officer or gang disbands

---

#### REPUTATION & NOTORIETY

**Fame System:**
- Earned through achievements and positive actions
- High fame = recognized and respected
- Benefits: Discounts, special quests, easier recruitment
- Displayed on profile and in chat name colors

**Infamy System:**
- Earned through crimes and PvP
- High infamy = feared and wanted
- Benefits: Outlaw respect, black market access, intimidation bonuses
- Drawbacks: Bounties, attacked by lawmen

**Bounties:**

**How Bounties Work:**
1. Player commits crimes or attacks lawful players
2. NPCs or players can place bounties (costs gold)
3. Bounty hunters track and kill wanted players
4. Successful kill = bounty payout + reputation

**Bounty Levels:**
- **$1-100:** Minor offender
- **$101-500:** Known criminal
- **$501-1000:** Dangerous outlaw
- **$1001-5000:** Notorious desperado
- **$5000+:** Legendary wanted status

**Clearing Bounties:**
- Pay off bounty at jail (150% of bounty amount)
- Serve jail time (1 minute per $10 of bounty, max 2 hours)
- Faction pardon (very high reputation can clear bounty)

**Titles System:**

Titles earned through specific achievements:

**Combat Titles:**
- "The Quick" - 100 duel wins
- "Gunslinger" - Gun Fighting 75+
- "Untouchable" - Win 20 duels without losing
- "Executioner" - Collect 50 bounties

**Criminal Titles:**
- "Ghost of Sangre" - 50 successful stealth crimes without capture
- "Safecracker" - Lockpicking 75+
- "Most Wanted" - Reach $5000 bounty

**Social Titles:**
- "Peacemaker" - Resolve 25 conflicts through persuasion
- "Gang Boss" - Lead gang to control 5 territories
- "Silver Tongue" - Persuasion 75+

**Spiritual Titles:**
- "Spirit Walker" - Complete vision quest chain
- "Mystic" - Spirit Walking 75+
- "Blessed" - Receive 10 spirit blessings

**Economic Titles:**
- "Prospector" - Find $10,000 in gold
- "Railroad Baron" - Accumulate $50,000
- "Master Craftsman" - Craft 100 items at high quality

---

### Advanced Roleplay Features (Post-MVP)

**Player-Owned Locations:**
- Buy and customize saloons, shops, ranches
- Host events and RP sessions
- Generate passive income
- Hire NPCs or player staff

**Elections & Governance:**
- Player elections for faction leadership roles
- Campaign and vote
- Leader decisions affect faction bonuses and direction
- Term limits and impeachment mechanics

**Newspapers:**
- Player-written weekly newspapers
- Report on events, wars, scandals
- Submit articles for publication
- In-character journalism

**Marriage/Partnerships:**
- Form official partnerships with other players
- Shared property and gang benefits
- Divorce mechanics
- Pure roleplay flavor or mechanical benefits (debate for later)

---

## ECONOMY

### Overview
The economy in Desperados Destiny balances player-driven trade with NPC stability. MVP focuses on core economic loop, with complexity added post-launch.

### Currencies

**Design Update (December 2024):** Triple currency system with Dollars as primary and Gold/Silver as tradeable resources.

#### **Dollars ($)** - Primary Currency
- **Universal:** Used for all in-game transactions, items, and services
- **Starting Amount:** $100 for new characters
- **Maximum:** $2,147,483,647 (safe 32-bit integer)
- **Earned through:**
  - Criminal activities (robberies, heists, pickpocketing)
  - Territory control (passive income from controlled areas)
  - Selling Gold/Silver resources
  - Bounty hunting
  - Crafting and selling items
  - Trading goods between locations
  - Gang war victories and duels
- **Spent on:**
  - Equipment (weapons, armor, accessories)
  - Consumables (medicine, food, ammunition)
  - Services (healing, training acceleration, fast travel)
  - Gang expenses (creation $5,000, upgrades, wars)
  - Property purchases (saloons, ranches, businesses)
  - Buying Gold/Silver resources
  - Bribes and fees (reduce jail/hospital time, faction favors)
- **Banking System:**
  - **Banked:** Safe in your account, cannot be lost
  - **Carried:** Cash on hand, lost partially on death (25-40%)
  - **Strategy:** Bank often to protect wealth

#### **Gold (g)** - Valuable Resource
- **Description:** Precious metal obtained through prospecting and mining
- **Maximum:** 100,000 units per character
- **Base Exchange Rate:** 1 Gold = $100
- **Dynamic Pricing:** $50-$200 range with ±20% volatility from world events
- **Obtained through:**
  - Prospecting in mining claims
  - Deep mining operations
  - Heist rewards
  - Trading/marketplace
- **Used for:**
  - High-end crafting recipes
  - Premium item purchases
  - Trading for Dollars at fluctuating rates

#### **Silver (s)** - Common Resource
- **Description:** Common metal for general crafting and trade
- **Maximum:** 1,000,000 units per character
- **Base Exchange Rate:** 1 Silver = $10
- **Dynamic Pricing:** $5-$25 range with ±15% volatility from world events
- **Obtained through:**
  - Standard mining
  - Common loot drops
  - Breaking down items
  - Trading/marketplace
- **Used for:**
  - Basic crafting recipes
  - Ammunition crafting
  - Trading for Dollars at fluctuating rates

#### **Economy Controls**
- **Wealth Tax:** Progressive 0-1.2% daily on balances >$100K
- **Income Caps:** Properties capped at $5,000-$25,000/day
- **Newcomer Stake:** +50% gold bonus for first 2 hours of play
- **Gambling Limits:** 10 bets/day, $50K max daily wager

#### **Premium Subscription** - Real Money (Not In-Game Currency)
- **Payment:** Monthly subscription ($5-10/month) via Stripe
- **Benefits Unlocked:**
  - Increased energy pool (250 vs 150) - 66% more actions per session
  - Larger energy capacity means longer play sessions (8 hours to full vs 5 hours)
  - Reduced hospital time (pay with dollars for early release at 50% discount)
  - Increased vault/inventory space (+50% storage)
  - Exclusive properties (certain buildings require premium)
  - Cosmetic options (profile themes, titles, badges)
  - Priority customer support
- **NOT Pay-to-Win:** Cannot buy dollars, cannot buy skill levels, cannot buy power
- **Philosophy:** Convenience and quality-of-life, never competitive advantage

---

### Income Sources

**Active Income (Player Actions):**

| Activity | Average Income | Energy Cost | Time |
|----------|----------------|-------------|------|
| Pickpocket | $10-50 | 5 | 1 min |
| Shoplifting | $25-75 | 10 | 2 min |
| Robbery | $100-300 | 15 | 5 min |
| Bank Heist | $500-2000 | 35 | 10 min |
| Train Robbery | $1000-5000 | 50 | 15 min |
| Bounty Hunt | $50-500 (bounty amount) | 20 | 5-10 min |
| Prospecting | $50-200 | 20 | 5 min |
| Crafting & Selling | Variable | 10-20 | 10-30 min |

**Passive Income (Territory Control):**
- Mining Claims: $50-150/hour
- Trade Routes: 10-30 goods/hour (sellable for $5-10/each)
- Gang dividends: Variable based on gang's territories

**Trading:**
- Buy low in one location, sell high in another
- Price differences between Red Gulch, Frontera, Kaiowa Mesa
- Trading skill improves profit margins

---

### NPC Shops (MVP)

**General Store (Red Gulch)**
- **Basic Supplies:** Food, medicine, tools
- **Prices:** Standard (100% base)
- **Stock:** Unlimited common items

**Gunsmith (Red Gulch)**
- **Firearms:** Pistols, rifles, shotguns
- **Ammunition:** Various types
- **Modifications:** Basic gun upgrades (post-MVP crafting)
- **Prices:** High (125% base) but quality guaranteed

**Leatherworker (Red Gulch & Kaiowa Mesa)**
- **Armor:** Leather vests, reinforced coats
- **Accessories:** Belts, holsters, saddlebags
- **Prices:** Standard in Kaiowa Mesa, higher in Red Gulch

**Doctor's Office (Red Gulch)**
- **Healing:** Instant full health restoration ($20-50)
- **Medicine:** Healing items, buffs
- **Prices:** Higher than crafted alternatives but instant

**Tribal Trading Post (Kaiowa Mesa)**
- **Traditional Goods:** Spirit items, herbal medicine
- **Unique Items:** Native-crafted gear
- **Prices:** Discounted for Nahi faction, standard for respectful outsiders
- **Requirement:** Minimum Nahi reputation to access

**Scorpion's Den Black Market (Frontera)**
- **Illegal Goods:** Stolen items, contraband
- **No Questions Asked:** Buy/sell without reputation checks
- **Prices:** Variable, often cheaper than legal shops
- **Currency:** Accepts contraband in addition to gold
- **Risk:** Items might be cursed, faulty, or traced

---

### Crafting System (MVP - Simplified)

**Three Core Professions:**

#### 1. GUNSMITHING
- **Requires:** Gunsmithing skill
- **Materials:** Metal ore, wood, gunpowder (purchased or found)
- **Products:**
  - Custom Revolvers (+15 Clubs, better than store-bought)
  - Modified Rifles (range/accuracy bonuses)
  - Special Ammunition (various effects)
- **Profit:** Sell to players for $800-1500 vs $500 material cost
- **Time:** 30-60 minutes crafting time

#### 2. LEATHERWORKING
- **Requires:** Leatherworking skill
- **Materials:** Leather (from hunting/trading), thread, tools
- **Products:**
  - Reinforced Coats (+15 HP)
  - Custom Holsters (Quick Draw bonus)
  - Saddlebags (inventory expansion)
- **Profit:** Sell for $300-600 vs $200 material cost
- **Time:** 20-40 minutes crafting time

#### 3. HERBALISM
- **Requires:** Herbalism skill
- **Materials:** Herbs (gathered in wilderness), water, containers
- **Products:**
  - Healing Poultices (restore 50 HP)
  - Energy Tonics (+30 energy)
  - Stat Buff Potions (temporary bonuses)
  - Poisons (combat debuffs)
- **Profit:** High demand, sell for $50-200 vs $20 material cost
- **Time:** 10-20 minutes crafting time

**Crafting Quality:**
- Higher skill level = better products
- Destiny Deck resolution for crafting (Diamonds-focused)
- Good hands produce better quality items
- Quality affects: Durability, effectiveness, sell price

---

### Player Trading (MVP)

**Direct Trade:**
- Initiate trade with another player
- Drag items and gold to trade window
- Both players accept
- Instant exchange

**Trade Limitations:**
- No trading energy (anti-abuse)
- No trading bound items (faction-specific gear)
- Transaction logs for both players

**Future Trading Features (Post-MVP):**
- Auction house for asynchronous trading
- Player shops in owned properties
- Automated buy/sell orders
- Market price tracking and analytics

---

### Economic Balance

**Inflation Control:**
- **Gold Sinks:** Gang creation fees, property purchases, repairs, taxes, NPC services
- **Item Degradation:** Equipment durability requires repairs (costs gold)
- **Death Penalties:** Loss of carried cash removes gold from economy
- **Premium Currency:** Energy tonics provide gold sink for wealthy players

**Wealth Distribution:**
- Top players can accumulate wealth but spend on gang/faction goals
- New players can profit through smart trading and crafting
- Territory income provides baseline for active gang members
- Skill investment more valuable than pure cash accumulation

**Price Stability:**
- NPC shops provide price floors and ceilings
- Monitor player market prices (post-MVP auction house)
- Adjust drop rates and income rates based on inflation metrics

---

## SUPERNATURAL ELEMENTS

### Overview
The Sangre Territory sits on "thin ground" where the spirit world bleeds through. Supernatural elements are woven into gameplay as mysteries to discover, not explained away.

### Universal Mystery Philosophy
Anyone can encounter the supernatural, regardless of faction. The spirits don't discriminate - a hardened outlaw might have a vision, a settler might stumble on sacred ground, and the Nahi maintain deeper connections but don't monopolize the mystical.

---

### MVP Supernatural Content

#### SPIRIT ENCOUNTERS (Random Events)

**Trigger Conditions:**
- Traveling through Sangre Canyon
- Destiny Deck draw with all Hearts = spirit encounter chance
- Certain times of day (dusk, dawn) increase probability
- Controlling sacred sites increases encounter rate

**Encounter Types:**

**1. Spirit Blessing**
- Brief vision or encounter with benevolent spirit
- Receive temporary buff (24 hours):
  - +10 to specific suit
  - +25 max energy
  - +20% income from next activity
  - Injury immunity (next knockout avoided)
- Narrative flavor describing the spirit and blessing

**2. Spirit Curse**
- Angered spirit or negative entity
- Receive temporary debuff (12 hours):
  - -10 to specific suit
  - -25% energy regen
  - Increased encounter danger
  - Bad luck (lower hand strengths)
- Can be cleansed: Visit Spirit Lodge, use special items, high Spirit Walking skill

**3. Spirit Quest Hook**
- Spirit appears with cryptic message
- Begins quest chain (see Vision Quests below)
- One-time opportunity (accept or decline)
- Unique rewards for completion

**4. Legendary Encounter**
- Very rare (1% chance)
- Encounter with major spirit entity: Thunderbird, Coyote Trickster, Ancestor Spirit
- Dramatic narrative moment
- Potential legendary item drop or permanent minor buff

---

#### VISION QUESTS

**Unlocking:**
- Requires Spirit Walking skill 30+
- Initiate at Spirit Lodge (Kaiowa Mesa) or sacred sites
- Costs 45 energy
- 24-hour cooldown between quests

**Quest Structure:**

**Phase 1: Preparation**
- Gather ritual items (herbs, totems, offerings)
- Choose your question/goal
- Begin meditation

**Phase 2: The Vision**
- Narrative journey through spirit realm
- Make 3-5 choices that affect outcome
- Destiny Deck draws with Hearts-focus
- Choices and draws determine which spirit you encounter

**Phase 3: The Trial**
- Spirit sets a task or riddle
- Could be: Find item, defeat enemy, solve puzzle, make moral choice
- Resolution via Destiny Deck or player choice

**Phase 4: The Reward**
- **Success:** Spirit grants boon
  - Permanent +2 to one suit
  - Unique spirit-touched item
  - Learn spiritual ability
  - Gain spirit companion (post-MVP)
- **Failure:** Lesson learned, smaller reward
  - Temporary buff
  - Common spirit item
  - XP boost to Spirit Walking

**Example Vision Quest:**
```
"The Thunderbird's Test"

You enter meditation at the Sacred Fire Circle.
The world fades... you stand on a mesa top as storm clouds gather.

The Thunderbird descends, eyes like lightning.
"Why do you seek the spirit path, mortal?"

> [Choice 1: Power] [Choice 2: Understanding] [Choice 3: Duty]

You choose Understanding.
The Thunderbird nods. "Wisdom is rarer than strength. Prove your sight."

[Destiny Deck draws: Must achieve Flush or better]
You draw: Q♥ J♥ 10♥ 9♥ 2♣ - Heart Flush!

The Thunderbird spreads its wings. The storm clears.
"You see with the heart. Take this feather. It will guide you when sight fails."

REWARD: Thunderbird Feather (Legendary Item)
- +15 Hearts
- Vision: Once per day, reveal hidden information (player locations, quest hints, etc.)
```

---

#### SACRED SITES

**Functionality:**
- Special locations with permanent supernatural properties
- Provide buffs to those who control them (via territory system)
- Sites of vision quests and spiritual encounters
- Contested between factions (especially Nahi vs Settlers)

**Sacred Site Examples:**

**1. Thunderbird's Perch**
- Highest point in Sangre Territory
- Buff: +10 Hearts to all who visit and pay respects
- Territorial income: 10 Spirit Essence/hour
- Vision Quest location
- Nahi faction strongly defends

**2. Whispering Stones**
- Stone circle with ancient petroglyphs
- Buff: Increased chance of spirit encounters
- Can commune with stones for cryptic prophecies
- Contested territory (neutral)

**3. Ancestor's Spring**
- Sacred water source
- Buff: Healing enhanced (2x effect)
- Water can be bottled for powerful medicine
- Nahi coalition stronghold

**Sacred Site Mechanics:**
- Must approach with respect (no weapons drawn) or suffer curse
- Destroying/defiling sites has severe reputation consequences
- High Spirit Walking skill unlocks additional interactions
- Some sites only accessible via specific quests

---

### Post-MVP Supernatural Expansion

**Spirit Animals (Companions):**
- Earned through high-level vision quests
- Permanent companions providing bonuses
- Examples:
  - **Wolf:** +10 Tracking, +5 Clubs
  - **Eagle:** +10 to Hearts, increased vision range
  - **Coyote:** +10 Spades (trickster's cunning)
- Can be summoned in combat for special abilities

**Legendary Beasts (Boss Encounters):**
- Rare spawn events in wilderness
- Requires groups to defeat
- Examples:
  - **Wendigo:** Cursed spirit of endless hunger (horror encounter)
  - **Thunderbird:** Massive aerial combat
  - **Ghost Riders:** Spectral outlaws on phantom horses
- Legendary loot and server-wide recognition

**Ancient Artifacts:**
- Unique items with supernatural properties
- Examples:
  - **Medicine Bag of the First Shaman:** Unlimited uses of specific herbs
  - **Colt of the Cursed:** Powerful gun but damages user over time
  - **Spirit Drum:** Summon aid in gang wars
- Quest chains to discover and claim

**Mystical Abilities:**
- Unlocked through Spirit Walking 75+
- Examples:
  - **Spirit Sight:** See invisible/hidden players and items
  - **Astral Travel:** Fast travel without energy cost (long cooldown)
  - **Commune:** Talk to spirits for information
  - **Blessing Ritual:** Grant buffs to gang members

**Prophecy System:**
- Server-wide events triggered by player actions
- Spirits warn of coming changes
- Example: "When the railroad reaches the Sacred Canyon, the earth will shake and old evils will wake."
- Foreshadows content updates and major events

---

### Cultural Representation Notes

**Fictional Tribes:**
- **Kaiowa, Tseka, Nahi** are invented nations
- Inspired by real Native cultures but not representing any specific tribe
- Avoids appropriating specific tribal beliefs or ceremonies
- Focuses on universal themes: Respect for land, spiritual connection, community, balance

**Respectful Portrayal:**
- Native characters are complex, not stereotypes
- Shown as having agency, politics, diverse perspectives
- Not all spiritual/mystical (some are skeptics, politicians, warriors)
- Settler encroachment shown as morally complex, not simplistic good vs evil
- Outlaws include people from all backgrounds

**Consultation:**
- Post-MVP, consider consulting with Native sensitivity readers
- Community feedback channels for cultural concerns
- Willing to adjust content if issues arise

---

## MVP SCOPE

### What We're Building First

**Phase 1 MVP Goals:**
- Playable core loop: Create character → Gain energy → Complete activities → Progress skills → Engage in PvP/faction conflict
- 3-4 months of focused development
- Production-quality code, not prototype
- Scalable architecture for future expansion

---

### MVP Feature Checklist

#### ✅ **CORE SYSTEMS**
- [x] User authentication (registration, login, JWT)
- [x] Character creation (faction choice, starting stats, appearance description)
- [x] Destiny Deck resolution engine
- [x] Energy system (150 free, 250 premium, hourly regen)
- [x] Real-time progression (skills train while offline)
- [x] Premium subscription (Stripe integration)

#### ✅ **CHARACTER SYSTEMS**
- [x] Faction selection (Settler/Nahi/Frontera)
- [x] Skill training system (29 core skills across 4 categories)
- [x] Player profiles (bio, stats, trophy case)
- [x] Reputation system (faction rep -100 to +100)
- [x] Level and XP progression
- [x] Inventory system

#### ✅ **TUTORIAL & ONBOARDING**
- [x] Hawk companion (Ezra "Hawk" Hawthorne) guides new players
- [x] 10-phase tutorial progression
- [x] 9 milestone achievements (1,025 XP + 1,100 gold total)
- [x] Contextual dialogue with 10 expressions and 5 moods
- [x] Graduation ceremony with Hawk's Feather reward item

#### ✅ **COMBAT & ACTIONS**
- [x] Duel system (PvP and PvE)
- [x] Criminal activities (5-8 crime types)
  - Pickpocket
  - Shoplifting
  - Robbery
  - Bank Heist
  - Stagecoach Holdup
  - Bounty Hunting
- [x] Basic gang wars (territory battles)
- [x] Health and healing mechanics
- [x] Bounty system

#### ✅ **SOCIAL FEATURES**
- [x] Real-time chat (Socket.io)
  - Global/territory channels
  - Faction chat
  - Gang chat
  - Whispers
- [x] Gang creation and management
  - Ranks (Leader/Officer/Member)
  - Gang vault
  - Gang chat
- [x] Player profiles (view others)
- [x] Friends list
- [x] Block/report system

#### ✅ **TERRITORY & FACTION**
- [x] Basic territory control (4-6 territories)
  - 2 mining claims
  - 1 trade route
  - 1 sacred site
  - 2 outlaw camps
- [x] Faction reputation tracking
- [x] Territory income generation (hourly automated)
- [x] Territory raid mechanics

#### ✅ **ECONOMY**
- [x] Currency system (Gold, Premium Tokens)
- [x] NPC shops
  - General Store
  - Gunsmith
  - Doctor
  - Tribal Trading Post
  - Black Market
- [x] Basic trading (player-to-player direct trade)
- [x] Simple crafting (Gunsmithing, Leatherworking, Herbalism)
- [x] Banking system (safe vs carried cash)

#### ✅ **MAP & LOCATIONS**
- [x] Sangre Territory (4 main locations)
  - Red Gulch
  - The Frontera
  - Kaiowa Mesa
  - Sangre Canyon
- [x] Travel system (energy cost, time-based)
- [x] Location-based actions and shops
- [x] Random encounters during travel

#### ✅ **PREMIUM FEATURES**
- [x] Extended energy pools
- [x] Faster regeneration
- [x] Cosmetic options (profile customization, titles display)
- [x] Premium currency purchase (Stripe)
- [x] Premium-only items (energy tonics)

#### ✅ **SUPERNATURAL (Basic)**
- [x] Spirit encounters (random during travel)
- [x] Basic blessings/curses
- [x] Sacred sites (as territories)
- [x] Vision quest system (simplified for MVP)

#### ✅ **UI/UX**
- [x] Western-themed interface
- [x] Card visualization for Destiny Deck
- [x] Responsive design (desktop and mobile-friendly)
- [x] Character sheet display
- [x] Map visualization
- [x] Combat log and history

---

### Explicitly NOT in MVP

**Post-Launch Update Content:**

#### Update 1 (Month 2): Advanced Roleplay
- Player-owned properties (saloons, ranches, shops)
- Player-run newspapers
- Elections for faction leadership
- Marriage/partnership system
- Mentor/apprentice relationships
- Enhanced profile customization

#### Update 2 (Month 3): Deep Supernatural
- Spirit animal companions
- Legendary beast boss fights
- Ancient artifact quest chains
- Mystical abilities (Spirit Sight, Astral Travel, etc.)
- Expanded vision quest narratives
- Prophecy system

#### Update 3 (Month 4): Complex Economy
- Auction house
- Advanced crafting chains
- Resource gathering nodes
- Player shops in owned properties
- Stock market/railroad investment
- Dynamic pricing algorithms

#### Update 4 (Month 5): Territory Expansion
- New region: Great Plains Territory
- Additional territories in Sangre
- Territory upgrades (defenses, income, facilities)
- Siege mechanics
- Faction warfare events

#### Update 5 (Month 6): Player Governance
- Marshal/faction leader elections
- Player-driven laws in controlled territories
- Diplomacy system between gangs
- Peace treaty mechanics
- Impeachment and political drama

**Ongoing:**
- Seasonal events
- Balance patches
- New items and equipment
- Additional skills
- Community-requested features

---

## TECHNICAL ARCHITECTURE

### Tech Stack

**Backend:**
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **Language:** TypeScript 5.x
- **Real-Time:** Socket.io 4.x
- **Database:** MongoDB 6.x
- **Cache:** Redis 7.x
- **Authentication:** JWT (jsonwebtoken)
- **Payment:** Stripe API

**Frontend:**
- **Library:** React 18+
- **Language:** TypeScript 5.x
- **State Management:** Zustand (lightweight vs Redux)
- **Routing:** React Router 6.x
- **Real-Time:** Socket.io-client
- **Styling:** TailwindCSS 3.x
- **Animations:** Framer Motion
- **HTTP Client:** Axios

**Infrastructure:**
- **Containerization:** Docker
- **Reverse Proxy:** Nginx
- **Process Manager:** PM2
- **CI/CD:** GitHub Actions
- **Hosting:** DigitalOcean (initial) / AWS (if scaling needed)
- **CDN:** Cloudflare (for static assets and DDoS protection)

**Development Tools:**
- **Code Quality:** ESLint, Prettier
- **Testing:** Jest (unit), Supertest (API), React Testing Library
- **API Testing:** Postman/Insomnia
- **Version Control:** Git + GitHub
- **Documentation:** JSDoc, Markdown

---

### Architecture Patterns

**Backend Architecture:**
- **MVC Pattern:** Models, Controllers, Services separation
- **Service Layer:** Business logic isolated from routes
- **Repository Pattern:** Database access abstraction
- **Middleware:** Authentication, validation, error handling
- **Worker Threads:** Background jobs (energy regen, territory income)

**Frontend Architecture:**
- **Component-Based:** Reusable React components
- **Container/Presentational:** Smart containers, dumb components
- **Custom Hooks:** Shared logic (useAuth, useSocket, useDestinyDeck)
- **Context API:** Global state for auth, theme, notifications

**Database Design:**
- **Document-Oriented:** MongoDB for flexible character data
- **Embedded Documents:** Related data nested when 1-to-few
- **References:** Related data referenced when 1-to-many or many-to-many
- **Indexes:** On frequently queried fields (username, faction, gangId)
- **TTL Indexes:** Auto-expire temporary data (sessions, cooldowns)

---

### Security Measures

**Authentication:**
- Password hashing with bcrypt (salt rounds: 12)
- JWT for stateless authentication
- Refresh token rotation
- Token expiration and renewal

**Authorization:**
- Role-based access control (RBAC)
- Resource ownership verification
- Action permission checks

**Data Protection:**
- Input validation and sanitization (express-validator)
- SQL/NoSQL injection prevention
- XSS protection (helmet.js)
- CSRF tokens for state-changing operations
- Rate limiting (express-rate-limit)

**Payment Security:**
- Stripe API for PCI compliance
- No credit card data stored locally
- Webhook signature verification
- Transaction logging and audit trails

**Anti-Cheat:**
- Server-side validation for all actions
- Destiny Deck draws on server (never client)
- Transaction logging for audits
- Cooldown enforcement
- Energy spend verification
- Impossible action detection (speed hacks, teleporting, etc.)

---

### Scalability Considerations

**Horizontal Scaling:**
- Stateless API servers (scale with load balancer)
- Socket.io with Redis adapter (multi-server support)
- MongoDB replica sets (read scaling)
- CDN for static assets

**Vertical Scaling:**
- Database indexing and query optimization
- Redis caching for hot data (leaderboards, active users)
- Background jobs for expensive operations

**Performance Optimization:**
- Lazy loading React components
- Pagination for large data sets
- WebSocket for real-time updates (reduce HTTP polling)
- Image optimization and lazy loading
- Code splitting and tree shaking

---

### Monitoring & DevOps

**Monitoring:**
- Application logs (Winston)
- Error tracking (Sentry)
- Performance monitoring (New Relic or similar)
- Uptime monitoring (UptimeRobot)
- Database performance (MongoDB Atlas metrics)

**Deployment:**
- Docker containers for consistency
- GitHub Actions for CI/CD
- Automated testing before deployment
- Staging environment for testing
- Blue-green deployment (zero downtime)

**Backup:**
- Daily MongoDB backups
- Transaction logs for point-in-time recovery
- Backup retention policy (30 days)

---

## DEVELOPMENT ROADMAP

### Phase 0: Documentation & Setup (Week 1)
- ✅ Create comprehensive game design document
- ✅ Create technical architecture documentation
- ✅ Set up project repository structure
- ✅ Initialize development environment
- ✅ Create development log and decision tracker

### Phase 1: Foundation (Weeks 2-4)
**Week 2:**
- Initialize Node.js backend with TypeScript
- Set up Express.js server
- Configure MongoDB connection
- Create user authentication (registration, login, JWT)
- Set up React frontend with TypeScript
- Configure TailwindCSS

**Week 3:**
- Character creation flow
- Destiny Deck core engine implementation
- Energy system with regeneration worker
- Basic database schema implementation
- User model and character data structure

**Week 4:**
- Socket.io integration (backend and frontend)
- Real-time energy updates
- Basic UI components (header, nav, cards)
- Authentication flow (login, register, protected routes)
- Testing framework setup

### Phase 2: Core Gameplay (Weeks 5-8)
**Week 5:**
- Skill system implementation
- Skill training queue
- Time-based progression worker
- Skill display UI
- Destiny Deck suit bonus calculations

**Week 6:**
- Combat system (duel mechanics)
- Health and damage calculations
- Combat UI with card reveals
- NPC duel opponents
- PvP duel system

**Week 7:**
- Criminal activities (pickpocket, robbery, heist)
- Activity resolution via Destiny Deck
- Cooldown system
- Bounty system
- Jail time mechanics

**Week 8:**
- Faction reputation system
- Faction-specific content
- Faction bonuses and restrictions
- Basic NPC shops
- Item and inventory system

### Phase 3: Social & Multiplayer (Weeks 9-10)
**Week 9:**
- Real-time chat (all channels)
- Chat UI and moderation tools
- Player profiles (view and edit)
- Friends list
- Block/report system

**Week 10:**
- Gang creation and management
- Gang ranks and permissions
- Gang vault system
- Gang chat
- Gang member UI

### Phase 4: Territory & Strategy (Weeks 11-12)
**Week 11:**
- Territory control system
- Territory raid mechanics
- Gang wars (aggregate Destiny Deck)
- Territory ownership tracking

**Week 12:**
- Territory income generation worker
- Resource distribution
- Territory UI (map view)
- Faction territory bonuses

### Phase 5: Polish & Balance (Weeks 13-14)
**Week 13:**
- UI/UX refinement
- Western theming and aesthetics
- Card animations and effects
- Responsive design polish
- Performance optimization

**Week 14:**
- Game balance tuning (energy costs, income rates, skill scaling)
- Bug fixing
- Tutorial/onboarding flow
- Help documentation
- Anti-cheat measures

### Phase 6: Premium & Monetization (Week 15)
- Premium subscription system
- Stripe integration
- Payment flow (subscribe, manage, cancel)
- Premium token shop
- Energy extensions and cosmetics
- Transaction logging

### Phase 7: Testing & Launch (Week 16)
- Closed beta testing (invite-only)
- Security audit
- Load testing (simulate 100+ concurrent users)
- Final bug fixes
- Launch preparation (marketing site, social media)
- Public launch

---

### Post-Launch Schedule

**Month 2 (Update 1): Advanced Roleplay**
- Player-owned properties
- Enhanced profile customization
- Newspapers
- Elections

**Month 3 (Update 2): Deep Supernatural**
- Spirit companions
- Legendary beasts
- Ancient artifacts
- Mystical abilities

**Month 4 (Update 3): Complex Economy**
- Auction house
- Advanced crafting
- Player shops
- Dynamic economy

**Month 5 (Update 4): Territory Expansion**
- New regions
- More territories
- Territory upgrades
- Warfare events

**Month 6 (Update 5): Player Governance**
- Elections
- Player-driven laws
- Diplomacy systems
- Political mechanics

**Ongoing:**
- Weekly balance patches
- Monthly content drops
- Seasonal events
- Community feedback integration

---

## VISUAL DESIGN

### Art Style Direction

**Overall Aesthetic:**
- Hand-drawn western meets mythic elements
- Weathered, lived-in textures
- Muted earth tones with pops of vibrant color for supernatural
- Card-based UI elements (fitting Destiny Deck theme)

**Color Palette:**
- **Primary:** Browns, tans, dusty yellows (desert/frontier)
- **Accent:** Deep reds (blood, sunset, danger)
- **Faction Colors:**
  - Settler: Blue and gold (cavalry/railroad)
  - Nahi: Earth tones with turquoise (traditional/sacred)
  - Frontera: Black and crimson (outlaw/danger)
- **Supernatural:** Ethereal purples, glowing blues, spirit greens

**Typography:**
- **Headings:** Western-style serif (slab serif like "Clarendon" or "Rockwell")
- **Body:** Readable sans-serif or clean serif
- **Accent:** Hand-drawn style for wanted posters, newspapers

---

### UI Theme Components

**Backgrounds:**
- Weathered wood planks
- Worn leather
- Old paper/parchment
- Desert landscapes (blurred for readability)

**Borders & Frames:**
- Rope and wood frame designs
- Wanted poster aesthetics for profiles
- Leather-bound book style for journals/logs

**Iconography:**
- **Suits:** ♠♥♣♦ for skills and stats
- **Faction Symbols:**
  - Settler: Railroad spike crossed with marshal's star
  - Nahi: Feather and sacred circle
  - Frontera: Crossed knives or guns
- **Action Icons:** Western symbols (gun for combat, lock for lockpicking, gold nugget for prospecting)

**Cards (Destiny Deck):**
- Custom playing card designs
- Western-themed face cards (cowboy, saloon girl, sheriff, etc.)
- Worn/distressed look
- Animated card flip reveals

---

### Key Screen Mockups (Conceptual)

**1. Character Sheet:**
- Large character portrait area (text description or image placeholder)
- Stats displayed with suit symbols
- Progress bars for energy and health
- Skill list with icons
- Equipment slots (visual representation)
- Western "wanted poster" frame

**2. Map View:**
- Hand-drawn style map
- Locations marked with iconic buildings (saloon, mesa, canyon)
- Territory ownership color-coded
- Travel paths illustrated
- Compass rose and legend

**3. Combat Screen:**
- Split view: Player on left, opponent on right
- Center: Card reveal area
- Bottom: Action log with western flavor text
- Health bars styled as whiskey bottles or bullet counters

**4. Chat Interface:**
- Saloon-style wooden panel
- Channel tabs styled as saloon signs
- Scroll with rope texture
- Player names color-coded by faction

**5. Gang Management:**
- Headquarters view (hideout illustration)
- Member list with portraits
- Vault styled as old safe
- Territory list with map icons

---

### Reference Mood & Inspiration

**Games:**
- **Red Dead Redemption 2:** Western authenticity, UI aesthetics
- **Hearthstone:** Card-based UI, playful animations
- **Torn:** Clean stat displays, long-form progression
- **Fallout series:** Retro-futuristic UI parallels (Pip-Boy → Wanted Poster)

**Visual Media:**
- **TV:** Deadwood, Westworld (gritty realism meets mystery)
- **Film:** The Good/Bad/Ugly, Bone Tomahawk (classic + supernatural)
- **Art:** Frederic Remington (western art), Indigenous art patterns

**UI Style:**
- Blend of historical authenticity with modern readability
- "If a saloon poker table was a web app"
- Nostalgia without sacrificing UX

---

## CONCLUSION

**Desperados Destiny** is a unique frontier in browser MMORPGs - a poker-based resolution system in a mythic wild west setting with deep progression and meaningful faction conflict. This design balances innovation (Destiny Deck) with proven systems (Torn-style progression) to create something fresh yet familiar.

The MVP provides a solid, playable core that demonstrates the vision while leaving room for extensive post-launch expansion. With 14-16 weeks of focused development, we can deliver a production-quality experience that will grow alongside its community.

**Core Strengths:**
1. Unique poker mechanic - no competitor has this
2. Rich setting with cultural depth
3. Three-way faction conflict (not just binary)
4. Fair free-to-play model
5. Years of progression depth
6. Heavy roleplay support

**Development Philosophy:**
- Build right, not fast
- Scalable architecture from day one
- Community-driven iteration
- Respectful cultural representation
- Balance innovation with familiarity

---

*This document is a living blueprint. As we develop, we'll refine mechanics, adjust balance, and respond to playtesting. But the core vision remains: A frontier worth exploring, where every hand dealt can change your fate.*

**— Ezra "Hawk" Hawthorne**
**Digital Frontiersman**
**November 15, 2025**
