# Desperados Destiny - AAA Narrative Quality Pass

## Creative Direction: Gritty Authentic Western (Fallout New Vegas Style)

**Tone:** Dark, morally grey, supernatural integrated naturally. Embrace Western archetypes (saloon girls, outlaws, cartels) with DEPTH and AGENCY, not sanitization.

**Current State:** Mixed quality (6.5-8.5/10 across systems)
- **Excellent:** Legendary quests, location descriptions, seasonal content, crime outcomes
- **Weak:** Procedural templates, NPC voice differentiation, character depth
- **Critical:** Tonal inconsistency, missing Western authenticity, archetypes need agency/depth

**Estimated Effort:** 50-70 hours for comprehensive pass

---

## CRITICAL ISSUES (Must Fix)

### 1. Archetype Depth & Agency [CRITICAL]

**Philosophy:** Keep the gritty Western archetypes - saloon girls, cartel bosses, outlaws, corrupt lawmen. But give them the DEPTH of Fallout New Vegas characters. A prostitute can be cunning, scheming, and dangerous. A cartel boss can have a code of honor. Everyone has reasons for what they do.

**Saloon Girl - Add Agency & Cunning** (`npcDialogueTemplates.ts`)
```
Current (fearful mood) - Too passive, no personality:
"Please, I'm just working... I don't want trouble..."
"Whatever you want, just don't hurt me..."

Enhanced - Survivor who knows how to work the room:
"I've seen men like you before. State your business or buy a drink."
"Honey, I've got a derringer in my garter and friends in low places. We clear?"
"Information costs extra. How much you willing to spend, sugar?"
"You want trouble? Take it outside. I ain't cleaning up another mess."
```
- Still works in a saloon, still vulnerable to violence
- But she's SURVIVED this world - that takes cunning
- She has connections, information, schemes of her own
- Fallout NV style: Joana has a tragic story but also a plan

**Frontera Cartel - Complete Society**
- Keep Rosa Muerte, El Serpiente, El Carnicero - they're well-written villains
- Add 8+ NPCs showing WHY Frontera exists:
  - Families pushed off land by railroad companies
  - Workers exploited by mining corporations
  - Revolutionaries fighting colonial oppression
  - Smugglers because legitimate trade is controlled
  - The crime makes SENSE given the injustice they face
- Show internal conflict: idealists vs. pure profit criminals

**Nahi Coalition - Complex Society**
- Keep spiritual elements - they're authentic to the culture
- Add practical concerns: hunting rights, trade disputes, resource management
- Show internal debates: traditionalists vs. pragmatists
- Include Nahi characters who are greedy, ambitious, skeptical
- Not everyone is wise - some are young and reckless, old and bitter

### 2. Western Authenticity Failure [HIGH]

**Procedural Quest Templates** (`questTemplates.ts`)
```
Current (generic):
"The pay is good"
"I'll pay handsomely"
"This is a delicate matter"
"Simple work"

Needed (period-authentic):
"The pay's fair, and I ain't one to cheat a man"
"Gold's waitin' for whoever gets this done"
"This here's a touchy situation, partner"
"Ain't nothin' fancy, just honest work"
```

**All NPC roles sound identical** - Sheriff, merchant, bartender, outlaw use same speech patterns

### 3. Tonal Inconsistency [HIGH]

The game oscillates between:
- **Historical Western** (Red Gulch, cattle drives, faction conflicts)
- **Cosmic Horror** (The Scar, What-Waits-Below, wendigos)

Must commit to one approach or explicitly structure the hybrid.

### 4. Incomplete Content [MEDIUM]

- **Ghost Riders quest chain:** Prologue exists, `quests: []` is empty
- **Chinese Diaspora dialogue:** Service exists, no dialogue templates found
- **Newspaper articles:** Framework exists, actual content missing

---

## PRIORITY TIERS

### Tier 1: Critical Fixes (8-12 hours)
1. Rewrite saloon girl dialogue with agency
2. Add 5 legitimate Frontera NPCs (non-criminal)
3. Diversify Nahi Coalition voices (add pragmatic, humorous NPCs)
4. Complete Ghost Riders quest array
5. Add Chinese Diaspora NPC dialogue templates

### Tier 2: Western Authenticity Pass (12-18 hours)
6. Rewrite all 30 quest templates with period vernacular
7. Create voice personality profiles per NPC role:
   - Settler: Formal, law-focused, measured
   - Outlaw: Casual, transactional, cynical
   - Coalition: Poetic, earth-connected, varied
8. Add Western slang variable pools ({SLANG_GREETING}, {SLANG_AFFIRMATIVE})
9. Differentiate faction quest dialogue

### Tier 3: Emotional Depth Pass (10-15 hours)
10. Add emotional context to investigation quests
11. Create consequence descriptions for all choice points
12. Add NPC internal conflict dialogue (torn loyalties, regrets)
13. Expand gossip categories (positive achievements, humor)
14. Add post-quest NPC reactions

### Tier 4: World Immersion Pass (10-15 hours)
15. Resolve cosmic horror integration (commit or contain)
16. Add newspaper article content (not just framework)
17. Create location-specific NPC dialogue variations
18. Add environmental decay narratives (ghost towns, ruins)
19. Expand seasonal flavor events

---

## FILES TO MODIFY

### Critical Path
```
server/src/data/npcDialogueTemplates.ts     - Saloon girl, voice profiles
server/src/data/questTemplates.ts           - Western vernacular
server/src/seeds/npcs_new.ts                - Add legitimate Frontera NPCs
server/src/seeds/mysteriousFigureQuests.seed.ts - Complete Ghost Riders
server/src/data/chineseDiasporaDialogue.ts  - NEW FILE
```

### Western Authenticity
```
server/src/data/questTemplates.ts           - All 30 templates
server/src/data/npcDialogueTemplates.ts     - Role-specific voices
shared/src/constants/dialogue.constants.ts  - NEW: Slang pools
server/src/data/gossipExpansion.ts          - Faction-specific patterns
```

### Emotional Depth
```
server/src/data/questTemplates.ts           - Emotional hooks
server/src/data/crimeOutcomeTemplates.ts    - Consequence clarity
server/src/seeds/quests.seed.ts             - Investigation depth
```

### World Immersion
```
server/src/data/locations/*.ts              - Environmental storytelling
server/src/data/newspapers.ts               - Article content
server/src/data/seasonalEffects.ts          - Flavor events
server/src/data/warEventTemplates.ts        - Cultural differentiation
```

---

## DETAILED IMPLEMENTATION

### Phase 1: Archetype Depth & New Vegas Style Characters

#### 1.1 Saloon Girl - Cunning Survivor Archetype (EXPANDED 3X)

**Philosophy:** Every saloon girl has survived violence, poverty, and exploitation. That survival required cunning, connections, and steel nerves. They're information brokers, blackmailers, schemers, and survivors. Some are bitter, some are hopeful, some are dangerous.

```typescript
// npcDialogueTemplates.ts - saloon_girl role

// ============================================================================
// FRIENDLY MOOD - Charming but calculating (12 variations)
// ============================================================================
templates: [
  // Information broker angle
  "Well ain't you a sight. Buy me a drink and maybe I'll tell you something useful.",
  "You're new around here. I remember every face that walks through that door.",
  "Sweetie, I know things about this town that'd make your hair curl. Interested?",
  "See that man in the corner? Owes me a favor. Want an introduction?",

  // Connected/powerful angle
  "The boss likes me. The sheriff owes me. You'd be wise to stay on my good side.",
  "I've got friends in low places and high ones too. Which do you need?",
  "Half the men in this town owe me secrets. The other half owe me money.",
  "Stick with me, sugar. I know where all the bodies are buried. Literally.",

  // Entrepreneurial angle
  "I'm saving up. One day I'll own this place. Maybe you can help speed that along.",
  "Every drink I pour is a step closer to freedom. Care to contribute?",
  "I've been watching you. You're smarter than most who walk in here. Let's talk business.",
  "There's a poker game in the back room. High stakes. I can get you in... for a cut."
]

// ============================================================================
// NEUTRAL MOOD - Professional, guarded (12 variations)
// ============================================================================
templates: [
  // Transactional
  "Drinks are on the board. Conversation costs extra.",
  "I work here. I don't live here. Remember that.",
  "You looking for company or information? They're different prices.",
  "Keep your hands to yourself and your money on the bar. We'll get along fine.",

  // Observational/wary
  "I've seen your type before. What's your angle?",
  "You're either law or outlaw. I haven't decided which is worse.",
  "That look in your eye says trouble. I've had enough trouble for one lifetime.",
  "State your business. I don't have time for games.",

  // World-weary
  "Another day, another drunk with a sad story. What's yours?",
  "I stopped caring about why men walk through that door. Just what they're paying.",
  "You want sympathy? Wrong establishment. You want whiskey? That I can do.",
  "I've heard every lie and every truth in this territory. Nothing surprises me."
]

// ============================================================================
// HOSTILE MOOD - Dangerous, connected, threatening (12 variations)
// ============================================================================
templates: [
  // Direct threats
  "I've seen men like you buried in the canyon. Don't test me.",
  "One word from me and you'll never drink in this territory again.",
  "Honey, I've got a derringer, a mean streak, and nothing to lose. Your move.",
  "The last man who grabbed me? They never found all the pieces.",

  // Connected threats
  "See those men at the bar? They work for me. And they don't like your face.",
  "El Carnicero is a personal friend. Want me to make introductions?",
  "The sheriff's wife is my best customer. One word and you're in a cell.",
  "I've got enough blackmail material to burn this whole town. Including you.",

  // Cold fury
  "You think I'm helpless? I've survived things that would break you.",
  "Every man who underestimated me is either dead or wishes he was.",
  "I didn't claw my way up from nothing to be disrespected by the likes of you.",
  "Touch me and I'll carve my name into your face. Try me."
]

// ============================================================================
// FEARFUL MOOD - Calculating even in fear (12 variations)
// ============================================================================
templates: [
  // Negotiation/leverage
  "I know what you want. Name your price and maybe we both walk away.",
  "Whatever they're paying you, I can double it. I have... resources.",
  "Kill me and you'll never find the ledger. That's right, I know about the ledger.",
  "I can give you something more valuable than my life. Information.",

  // Threats within fear
  "I've already sent word. You're a dead man walking, you just don't know it yet.",
  "My disappearance will be noticed. Important people will ask questions.",
  "You think I'm alone? Look at the shadows. Look closer.",
  "Kill me and three letters get delivered. You won't like what they say.",

  // Desperate cunning
  "There's a fortune hidden in this building. Kill me and it stays hidden forever.",
  "I know who you really are. I know what you did in Kansas. Walk away.",
  "The Pinkertons have a file on me. They'll investigate. They'll find you.",
  "I have children. Think about that. Is this worth their revenge when they grow up?"
]

// ============================================================================
// DRUNK MOOD - Honest, melancholy, dangerous (12 variations)
// ============================================================================
templates: [
  // Bitter truth
  "You know why I do this? Because it beats starving. That's the only reason.",
  "I had dreams once. A husband, a farm, children. Then the war came.",
  "Don't look at me like that. You're not better than me. You're just luckier.",
  "Every man in this town is a liar. At least I'm honest about what I sell.",

  // Dangerous honesty
  "I could tell you secrets that'd start a war. Maybe I will. Buy me another.",
  "The sheriff? He visits me Tuesdays. His wife doesn't know. Nobody knows... except now you.",
  "I've watched men die in this room. Some deserved it. Some didn't. Want to know which?",
  "There's a body under the floorboards. Been there since '72. I know who put it there.",

  // Melancholy
  "I was beautiful once. Before this place. Before everything.",
  "Sometimes I dream about the ocean. I've never seen it. Probably never will.",
  "My daughter doesn't know what I do. She thinks I'm a seamstress. God help me if she ever finds out.",
  "I had a name once. A real name. Now I'm just 'the girl at the saloon.' That's all I am."
]
```

#### 1.2 Frontera - Complete Cartel Society (24+ NPCs - EXPANDED 3X)

**Philosophy:** Frontera isn't just criminals - it's a complete society forged by injustice. Show the railroad dispossessions, the mining exploitation, the colonial oppression that CREATED the outlaw culture. Every criminal has reasons. Every villain has a code.

```typescript
// seeds/npcs_new.ts - Frontera comprehensive NPCs (24+)

// ============================================================================
// THE DISPOSSESSED - Families with legitimate grievances (6 NPCs)
// ============================================================================

{
  name: "Diego 'El Viejo' Reyes",
  role: "dispossessed_rancher",
  backstory: "Railroad took his land in 1872. Lost everything legal. Now he takes it back.",
  dialogue: {
    greeting: "You know what they did to my family? No? Then don't judge me.",
    friendly: "I was an honest man once. The law made me what I am.",
    quest_hook: "The railroad payroll comes through Thursday. You in or out?",
    hostile: "Gringos took everything. You look like a gringo to me."
  }
},

{
  name: "Catalina Reyes-Vega",
  role: "widow_rancher",
  backstory: "Her husband was killed by Pinkertons for organizing workers. Raises three children alone.",
  dialogue: {
    greeting: "My husband died for believing in justice. I stopped believing.",
    friendly: "The children need food. I'll do what I must.",
    quest_hook: "The man who killed my husband lives in Red Gulch. I can't go there. You can.",
    dark: "I pray every night. Not for forgiveness. For revenge."
  }
},

{
  name: "Aurelio 'El Minero' Fuentes",
  role: "former_miner",
  backstory: "Lost his arm in a mine collapse. Company paid nothing. Now he robs their shipments.",
  dialogue: {
    greeting: "See this stump? The Consolidated Mining Company did this. They owe me.",
    friendly: "I gave them my arm. They gave me nothing. So I take.",
    quest_hook: "There's a gold shipment leaving the mine tomorrow. Help me take it.",
    bitter: "They call us thieves. They stole our labor, our health, our lives."
  }
},

{
  name: "Teresa 'La Maestra' Sandoval",
  role: "former_teacher",
  backstory: "Taught school until they closed it. Now she teaches children to read and shoot.",
  dialogue: {
    greeting: "Education is power. That's why they took our schools.",
    friendly: "Every child I teach is a weapon against ignorance.",
    quest_hook: "I need books. Real books. They burn them in Red Gulch.",
    dark: "I teach them letters. And I teach them to hate. Both are survival."
  }
},

{
  name: "Roberto 'El Abuelo' Moreno",
  role: "elder_patriarch",
  backstory: "Remembers when this land was Mexico. Refuses to accept American law.",
  dialogue: {
    greeting: "This was my grandfather's land. Before the war. Before the theft.",
    friendly: "The gringos drew a line and called everything north 'theirs.' We never agreed.",
    quest_hook: "There's a deed in the territorial office. My family's land. I want it back.",
    philosophical: "They call it 'Manifest Destiny.' We call it robbery."
  }
},

{
  name: "Consuela 'La Viuda' Hernandez",
  role: "boarding_house_owner",
  backstory: "Runs a boarding house. Harbors fugitives. Lost two sons to American soldiers.",
  dialogue: {
    greeting: "Looking for a room? Or hiding from something?",
    friendly: "I don't judge. Everyone running from something in this world.",
    quest_hook: "I have a guest who needs to disappear. Can you help?",
    sad: "My boys died wearing chains. For stealing bread. Bread."
  }
},

// ============================================================================
// THE IDEALISTS - Revolutionary fighters (6 NPCs)
// ============================================================================

{
  name: "Lucia 'La Pluma' Morales",
  role: "revolutionary_writer",
  backstory: "Writes pamphlets, organizes workers, dreams of a free Frontera.",
  dialogue: {
    greeting: "Another gringo. Come to exploit us or help us?",
    friendly: "We fight for something bigger than gold. Can you understand that?",
    cynical: "Every revolution needs money. Even idealists have to eat.",
    passionate: "History is written by winners. I intend to write our chapter."
  }
},

{
  name: "Captain Esteban 'El Fantasma' Reyes",
  role: "guerrilla_leader",
  backstory: "Former Mexican Army. Never surrendered after the war. Still fighting.",
  dialogue: {
    greeting: "I've been fighting gringos since before you were born.",
    friendly: "War never ends. It just changes form.",
    quest_hook: "The army is moving supplies through the canyon. Perfect ambush site.",
    weary: "I'm tired. But I'll rest when we're free. Or when I'm dead."
  }
},

{
  name: "Sister Maria 'La Santa Roja' Guadalupe",
  role: "revolutionary_nun",
  backstory: "Former nun turned revolutionary. God told her to fight.",
  dialogue: {
    greeting: "God loves the poor. The rich can burn.",
    friendly: "Christ threw the money-changers from the temple. I follow his example.",
    quest_hook: "The church in Red Gulch sits on stolen gold. Help me return it to the people.",
    dark: "I've killed in God's name. I'll answer to Him, not you."
  }
},

{
  name: "Miguel 'El Orador' Castillo",
  role: "labor_organizer",
  backstory: "Organizes mine workers. Has survived three assassination attempts.",
  dialogue: {
    greeting: "You look like you work with your hands. Good. We need more workers.",
    friendly: "Alone we're nothing. Together we're an army.",
    quest_hook: "The mine bosses are bringing in scabs. Help me convince them to join us.",
    fierce: "They can kill me. But they can't kill the movement."
  }
},

{
  name: "Dr. Elena 'La Doctora' Vasquez",
  role: "revolutionary_doctor",
  backstory: "Studied medicine in Mexico City. Returns to heal the revolution.",
  dialogue: {
    greeting: "You're wounded? Or here to help wound others?",
    friendly: "I patch up fighters and farmers alike. Blood is blood.",
    quest_hook: "I need medical supplies. The army has a shipment coming through.",
    philosophical: "Healing is political. Keeping people alive is resistance."
  }
},

{
  name: "Francisco 'El Ciego' Torres",
  role: "blind_oracle",
  backstory: "Lost his sight to American soldiers. Gained a reputation for prophecy.",
  dialogue: {
    greeting: "I see more without eyes than most see with them.",
    friendly: "You carry death with you. But also hope. Interesting.",
    quest_hook: "I've dreamed of a train. Fire. Screaming. It hasn't happened yet. But it will.",
    cryptic: "The earth is angry. It whispers things. Terrible things."
  }
},

// ============================================================================
// THE PURE CRIMINALS - No sympathy, just business (6 NPCs)
// ============================================================================

{
  name: "Javier 'El Demonio' Varga",
  role: "enforcer",
  backstory: "No tragic backstory. Some men just like the work.",
  dialogue: {
    greeting: "You're either useful or you're dead. Which is it?",
    friendly: "I respect professionals. You seem professional.",
    quest_hook: "Someone needs to disappear. You look like you can keep quiet.",
    honest: "Don't look for sympathy. I do this because I enjoy it."
  }
},

{
  name: "Alejandra 'La Muñeca' Reina",
  role: "assassin",
  backstory: "Beautiful. Deadly. Uses both to her advantage.",
  dialogue: {
    greeting: "Careful, mi amor. I bite.",
    friendly: "You're not afraid of me. I like that. Most are afraid.",
    quest_hook: "I need someone who can get close to my target. Interested?",
    cold: "I stopped counting at fifty. After that it's just numbers."
  }
},

{
  name: "Vicente 'El Gordo' Montoya",
  role: "smuggler_boss",
  backstory: "Runs contraband of all kinds. Cheerful about it.",
  dialogue: {
    greeting: "Business! I love business! What are you buying or selling?",
    friendly: "In this world, everything has a price. I just help things find their price.",
    quest_hook: "I need something moved across the border. Quietly.",
    philosophical: "Legal, illegal - these are just words. Supply and demand, my friend."
  }
},

{
  name: "Ernesto 'El Silencio' Paz",
  role: "torturer",
  backstory: "Extracts information. Quietly. Efficiently. Without remorse.",
  dialogue: {
    greeting: "...",
    friendly: "You have questions. I have methods. Perhaps we can help each other.",
    quest_hook: "Someone knows something. They're not talking. Yet.",
    dark: "Everyone breaks. The only question is when."
  }
},

{
  name: "Carmen 'La Reina del Veneno' Delgado",
  role: "poisoner",
  backstory: "Herbalist turned killer. Makes death look natural.",
  dialogue: {
    greeting: "Herbal tea? It's perfectly safe. Unless you've wronged me.",
    friendly: "I learned medicine to heal. Then I learned how much more valuable death is.",
    quest_hook: "Someone needs to stop breathing. No blood. No evidence.",
    philosophical: "Poison is patient. Like me."
  }
},

{
  name: "Rafael 'El Contador' Mendez",
  role: "cartel_accountant",
  backstory: "Former bank employee. Now he launders money for the cartel.",
  dialogue: {
    greeting: "Numbers don't lie. People do. I prefer numbers.",
    friendly: "I can make money appear or disappear. Which do you need?",
    quest_hook: "The territorial bank has records I need destroyed. Can you help?",
    honest: "I'm not a killer. I just make sure killers get paid."
  }
},

// ============================================================================
// THE SURVIVORS - Regular people in criminal territory (6 NPCs)
// ============================================================================

{
  name: "Padre Miguel Santana",
  role: "priest",
  backstory: "Tends to sinners and saints alike. Hears confessions from killers.",
  dialogue: {
    greeting: "God's house is open to all. Even you, child.",
    friendly: "I've given last rites to men on both sides. All bleed the same.",
    quest_hook: "A young man has strayed. Bring him back before it's too late.",
    dark: "Confession is sacred. But if you're looking for information... leave a donation."
  }
},

{
  name: "Esperanza 'Mama' Gutierrez",
  role: "cantina_owner",
  backstory: "Raised six sons. Five are dead. The sixth runs the Frontera.",
  dialogue: {
    greeting: "Eat. You look hungry. Then we talk business.",
    friendly: "I've buried too many boys. Don't make me bury another.",
    quest_hook: "My grandson got in over his head. Get him out and I'll remember.",
    sad: "I remember when they were all alive. Before this place ate them."
  }
},

{
  name: "Dr. Arturo Mendez",
  role: "back_alley_doctor",
  backstory: "Lost his license up north. Now he patches up anyone who pays.",
  dialogue: {
    greeting: "Bullet wound or knife? I charge by the inch.",
    friendly: "I don't ask questions. That's why I'm still alive.",
    quest_hook: "I need supplies. Medicine. The kind the army keeps locked up.",
    dark: "I've seen things in this clinic... things that would make you sick."
  }
},

{
  name: "Tomás 'El Poeta' Vega",
  role: "chronicler",
  backstory: "Writes corridos about the outlaws. Makes legends out of killers.",
  dialogue: {
    greeting: "Ah, a new face. Will you be hero or villain in my next song?",
    friendly: "The Frontera needs stories. Stories give us meaning.",
    quest_hook: "I need details for my ballad. Ride with the gang. Tell me everything.",
    philosophical: "In a hundred years, no one will remember the truth. Only my songs."
  }
},

{
  name: "Isabella 'La Serpiente' Cruz",
  role: "smuggler_queen",
  backstory: "Runs contraband across the border. Smarter than most men in the room.",
  dialogue: {
    greeting: "You want across the river? It'll cost you.",
    friendly: "In my line of work, trust is earned in blood. Yours or someone else's.",
    quest_hook: "I have a shipment. Special cargo. Needs extra protection.",
    hostile: "Cross me and they'll find your body in three different territories."
  }
},

{
  name: "Little Rosie (Rosa 'La Huérfana' Delgado)",
  role: "orphan_pickpocket",
  backstory: "Age 12. Parents killed by soldiers. Survives by her wits.",
  dialogue: {
    greeting: "Mister, spare some coin? I'm so hungry...",
    friendly: "You're not like the others. You actually looked at me.",
    quest_hook: "I saw something. Something bad. But I can't tell just anyone.",
    sad: "I had a doll once. Before they burned our house."
  }
}
```

#### 1.3 Ghost Riders Quest Completion

**Complete the empty quests array with 5 detailed quests:**

```typescript
quests: [
  {
    id: "ghost_riders_1",
    title: "The Vanishing",
    briefing: "October 31, 1862. The night they disappeared. Find someone who remembers.",
    objectives: [
      "Speak to Old Man Hawkins at the Silver Dollar",
      "Investigate the Devil's Ridge where they vanished",
      "Find the abandoned camp and search for clues"
    ]
  },
  // ... 4 more quests building to the choice epilogue
]
```

### Phase 2: Western Authenticity

#### 2.1 Voice Personality Profiles

**Create distinct speech patterns per NPC type:**

```typescript
const VOICE_PROFILES = {
  SETTLER_LAWMAN: {
    greetings: ["State your business", "Keep it brief", "What do you want?"],
    affirmatives: ["Understood", "I'll see it done", "Consider it handled"],
    negatives: ["That ain't happening", "Not on my watch", "Find someone else"],
    quirks: ["Formal titles", "References to law/duty", "Measured speech"]
  },

  FRONTERA_OUTLAW: {
    greetings: ["What's your angle?", "Spit it out", "This better be good"],
    affirmatives: ["Done deal", "You got it, amigo", "Consider it done... for a price"],
    negatives: ["Not worth my time", "Find another fool", "You're on your own"],
    quirks: ["Spanish code-switching", "Transactional language", "Cynical humor"]
  },

  COALITION_ELDER: {
    greetings: ["The wind brings you here", "Speak, and I will listen", "You seek something"],
    affirmatives: ["The spirits guide this path", "It shall be done", "Balance will be restored"],
    negatives: ["This is not your path", "The ancestors forbid it", "Seek elsewhere"],
    quirks: ["Nature metaphors", "References to ancestors", "Deliberate pacing"]
  }
}
```

#### 2.2 Western Slang Pools

**Add to shared/constants/dialogue.constants.ts:**

```typescript
export const WESTERN_SLANG = {
  GREETINGS: ["Howdy", "Well now", "I'll be", "Partner", "Stranger"],
  AFFIRMATIVES: ["Reckon so", "Damn straight", "You bet", "Sure 'nough"],
  NEGATIVES: ["Not on your life", "When hell freezes", "Fat chance"],
  MONEY: ["gold", "coin", "dust", "greenbacks"],
  DANGER: ["sidewinder", "varmint", "no-account", "bushwhacker"],
  TIME: ["sundown", "high noon", "first light", "come morning"]
} as const;
```

### Phase 3: Emotional Depth

#### 3.1 Investigation Quest Enhancement

**Current:**
```
"Find out what happened to them."
```

**Enhanced:**
```
"My {RELATION} {MISSING_NPC} vanished {TIME_PERIOD} ago. Last seen near {LOCATION}.
The sheriff says they probably just moved on. But I know {PRONOUN} wouldn't leave
without word. Something's wrong.
Please... I need to know. Even if the truth is hard to hear."
```

#### 3.2 NPC Internal Conflict Dialogue

**Add conflicted states to dialogue templates:**

```typescript
// Doctor - torn between ethics and survival
conflicted: [
  "I took an oath to heal everyone. But some people... Lord forgive me.",
  "Every bullet I remove is a life saved. Even when that life doesn't deserve saving.",
  "The Hippocratic oath says 'do no harm.' Silence is also harm, isn't it?"
]

// Sheriff - torn between law and justice
conflicted: [
  "The law says one thing. My gut says another. Which do I follow?",
  "I wear this badge. But the man who gave it to me ain't exactly righteous.",
  "Sometimes the right thing and the legal thing ain't the same."
]
```

---

## QUALITY TARGETS

| Metric | Current | Target |
|--------|---------|--------|
| Procedural template authenticity | 35% | 80% |
| NPC voice distinctiveness | 40% | 85% |
| Emotional resonance per quest | 30% | 70% |
| Cultural sensitivity issues | 4 critical | 0 critical |
| Incomplete content | 3 major gaps | 0 gaps |

---

## COSMIC HORROR INTEGRATION (Fallout New Vegas Style)

**Philosophy:** The supernatural is real but ambiguous. Like Old World Blues or Dead Money -
weird technology and horror that players can engage with or avoid. Not every quest touches it,
but it's ALWAYS lurking at the edges.

### Faction Responses to the Supernatural

**Settlers (NCR equivalent):**
- Deny it publicly, fear it privately
- "Just swamp gas" / "Mass hysteria" / "Indian superstition"
- Some secretly investigate (secret government files)
- A few true believers dismissed as crazy

**Nahi Coalition (Native knowledge holders):**
- Ancient knowledge of The Scar and What-Waits-Below
- Guardians who've kept it contained for generations
- Internal debate: seal it forever vs. use its power
- "The ancestors knew. We remember."

**Frontera (Pragmatic users):**
- If it's real, how can we profit from it?
- Smuggle artifacts, sell "protection" from curses
- Some genuinely terrified, others opportunistic
- "I don't care if it's devil or god, does it pay?"

### Supernatural Content Integration

```typescript
// gossipExpansion.ts - Add supernatural categories
supernatural_rumors: [
  "{NPC} swears they saw lights over The Scar last {TIME_PERIOD}.
   Said they heard voices in a language that ain't human.",

  "Old {NPC} won't go near Devil's Ridge no more.
   Says the rocks whisper his dead wife's name.",

  "You hear about the prospector who came back from the badlands?
   Hair turned white overnight. Won't say what he saw.",

  "The Prophet's been preaching about 'the thing that sleeps.'
   Most folks laugh. But I've seen his drawings..."
]

// newspapers.ts - Add Frontier Oracle supernatural articles
{
  paper: "frontier_oracle",
  headline: "MYSTERIOUS LIGHTS TERRORIZE CATTLE DRIVE",
  article: "Drovers report strange illuminations over the mesa.
           Three head of cattle found mutilated. Sheriff dismisses as 'wolves.'
           This reporter has seen the wounds. Wolves don't cauterize flesh."
}

// seasonalEffects.ts - Cosmic events by month
october: {
  flavor_events: [
    "The veil thins. Spirits walk openly near The Scar.",
    "Wendigo sightings spike in the high country.",
    "The Prophet's congregation doubles. People are scared.",
    "Coalition elders perform containment rituals nightly."
  ]
}
```

### Ghost Riders Quest Chain (Complete)

```typescript
// mysteriousFigureQuests.seed.ts - Ghost Riders array
quests: [
  {
    id: "ghost_riders_1",
    title: "The Vanishing",
    briefing: "October 31, 1862. That's when Marcus 'Dead-Eye' Dalton and his
              Ghost Riders disappeared. Find someone who remembers that night.",
    objectives: [
      "Speak to Old Man Hawkins at the Silver Dollar (only survivor)",
      "Visit Devil's Ridge where they were last seen",
      "Find the abandoned camp - something's still there"
    ],
    revelation: "Hawkins saw something that night. His hands still shake when he talks about it."
  },
  {
    id: "ghost_riders_2",
    title: "The Pact",
    briefing: "Hawkins mentioned a 'deal gone wrong.' The Ghost Riders made
              a bargain with something at The Scar. Find evidence.",
    objectives: [
      "Search the Ghost Riders' hidden cache",
      "Decode Dalton's journal (written in cipher)",
      "Speak to the Prophet - he knows more than he's saying"
    ],
    revelation: "They found something in The Scar. Brought it out. It wasn't gold."
  },
  {
    id: "ghost_riders_3",
    title: "The Artifact",
    briefing: "Dalton's journal mentions a 'key' they retrieved from beneath the earth.
              The Prophet believes it's still out there. Others are looking for it.",
    objectives: [
      "Track the artifact's path (changed hands many times)",
      "Confront the current holder (moral choice: buy, steal, or trade)",
      "Survive what happens when you touch it"
    ],
    revelation: "The artifact shows you things. Past. Future. Things that shouldn't be."
  },
  {
    id: "ghost_riders_4",
    title: "The Riders",
    briefing: "You've seen them now. At night. At the edges of vision.
              They're not dead. They're not alive. They're waiting.",
    objectives: [
      "Track the Ghost Riders to their eternal ride",
      "Communicate with Dalton's spirit (if you can call it that)",
      "Learn what they need to finally rest (or continue forever)"
    ],
    revelation: "They want the artifact back in The Scar. Or they want company. Your choice."
  },
  {
    id: "ghost_riders_5",
    title: "The Choice",
    briefing: "End their curse. Join their ride. Or leave them to eternity.",
    choices: {
      release: {
        description: "Return the artifact to The Scar. End their suffering.",
        consequence: "The Riders fade. Peace at last. But The Scar grows stronger.",
        reward: "Legendary reputation, unique blessing, haunting dreams forever"
      },
      join: {
        description: "Accept Dalton's offer. Ride with them forever.",
        consequence: "Become a legend. Lose your humanity. Gain their power.",
        reward: "Ghost Rider transformation (cosmetic + abilities), cannot die conventionally"
      },
      abandon: {
        description: "Walk away. Keep the artifact. Let them suffer.",
        consequence: "The artifact's power is yours. The Riders hunt you eternally.",
        reward: "Artifact equipment, permanent enemies, dark reputation"
      }
    }
  }
]
```

---

## QUALITY TARGETS (Updated)

| Metric | Current | Target |
|--------|---------|--------|
| Western vernacular authenticity | 35% | 85% |
| NPC voice distinctiveness | 40% | 90% |
| Archetype depth (agency + motivation) | 30% | 85% |
| Moral ambiguity per quest | 20% | 70% |
| Supernatural integration | 25% | 75% |
| Frontera society completeness | 30% | 90% |
| Incomplete content gaps | 3 major | 0 |

---

## WESTERN SLANG VARIABLE POOLS (3X EXPANDED)

```typescript
// shared/src/constants/dialogue.constants.ts

export const WESTERN_SLANG = {
  // ============================================================================
  // GREETINGS (36 variations)
  // ============================================================================
  GREETINGS_FRIENDLY: [
    "Howdy, partner", "Well, I'll be", "Good to see ya", "What brings you 'round?",
    "Ain't you a sight", "Welcome, friend", "Pull up a chair", "Make yourself at home",
    "Been expectin' you", "Heard you was comin'", "Word travels fast", "Step right in"
  ],
  GREETINGS_NEUTRAL: [
    "Stranger", "State your business", "What d'you want?", "You lost?",
    "Help you with somethin'?", "Speak your piece", "I'm listenin'", "Go on then",
    "Make it quick", "Time's wastin'", "Spit it out", "What's your angle?"
  ],
  GREETINGS_HOSTILE: [
    "You ain't welcome here", "Best keep movin'", "Wrong place, friend",
    "Turn around 'fore you regret it", "I know your type", "Don't start nothin'",
    "You got nerve showin' your face", "Last warning", "Git. Now.", "We don't serve your kind",
    "You're either brave or stupid", "Death wish, huh?"
  ],

  // ============================================================================
  // AFFIRMATIVES (24 variations)
  // ============================================================================
  AFFIRMATIVES_ENTHUSIASTIC: [
    "Hell yeah!", "You bet your boots", "Damn straight", "Count me in",
    "Now you're talkin'", "That's the spirit", "I like your style", "Let's ride"
  ],
  AFFIRMATIVES_NEUTRAL: [
    "Reckon so", "Fair enough", "S'pose that's right", "Can't argue with that",
    "Sounds about right", "If you say so", "Makes sense", "I can work with that"
  ],
  AFFIRMATIVES_RELUCTANT: [
    "If I gotta", "Ain't got much choice", "Against my better judgment",
    "This better be worth it", "You owe me one", "Don't make me regret this",
    "Fine. But you didn't hear it from me", "Last time. I mean it this time"
  ],

  // ============================================================================
  // NEGATIVES (24 variations)
  // ============================================================================
  NEGATIVES_FIRM: [
    "Not on your life", "When hell freezes over", "Fat chance",
    "Over my dead body", "Absolutely not", "No deal", "Forget it", "Hard pass"
  ],
  NEGATIVES_APOLOGETIC: [
    "Can't help you there", "Sorry, partner", "Wish I could",
    "My hands are tied", "Not my call to make", "Ain't up to me",
    "I got my own problems", "Maybe try somewhere else"
  ],
  NEGATIVES_THREATENING: [
    "Ask again and see what happens", "That's a good way to get shot",
    "You deaf or just stupid?", "I said no. Don't make me repeat myself",
    "Walk away while you still can", "Last man who asked that is buried in the canyon",
    "You're testin' my patience", "Don't push your luck"
  ],

  // ============================================================================
  // MONEY TERMS (18 variations)
  // ============================================================================
  MONEY: [
    "gold", "coin", "dust", "greenbacks", "hard currency", "cold cash",
    "payment", "compensation", "reward", "bounty", "stake", "investment",
    "cut", "share", "take", "haul", "loot", "scratch"
  ],

  // ============================================================================
  // DANGER/INSULTS (24 variations)
  // ============================================================================
  INSULTS_MILD: [
    "sidewinder", "varmint", "no-account", "fool", "greenhorn", "tenderfoot",
    "yahoo", "galoot", "tinhorn", "dude", "pilgrim", "city slicker"
  ],
  INSULTS_SEVERE: [
    "bushwhacker", "yellow-belly", "back-shooter", "snake in the grass",
    "low-down dirty dog", "lily-livered coward", "murderin' scum",
    "worthless piece of work", "curse on two legs", "spawn of Satan",
    "walking dead man", "marked for the grave"
  ],

  // ============================================================================
  // TIME EXPRESSIONS (18 variations)
  // ============================================================================
  TIME: [
    "sundown", "high noon", "first light", "come mornin'", "by nightfall",
    "before the rooster crows", "when the sun sets", "at the stroke of midnight",
    "in a spell", "directly", "right quick", "when I'm good and ready",
    "yesterday", "soon enough", "not long now", "any minute",
    "since the war", "back in '62"
  ],

  // ============================================================================
  // LOCATION DESCRIPTORS (18 variations)
  // ============================================================================
  LOCATIONS: [
    "the territory", "these parts", "this godforsaken place", "the frontier",
    "the badlands", "out yonder", "across the river", "up in the hills",
    "down in the canyon", "the watering hole", "the crossroads", "no-man's land",
    "civilized country", "the wild lands", "Indian territory", "outlaw country",
    "mining country", "cattle country"
  ],

  // ============================================================================
  // DEATH/VIOLENCE (24 variations)
  // ============================================================================
  DEATH_EUPHEMISMS: [
    "meet your maker", "cash in your chips", "kick the bucket", "bite the dust",
    "take the long dirt nap", "go to Boot Hill", "push up daisies", "feed the coyotes",
    "end up in a pine box", "get your ticket punched", "dance at the end of a rope",
    "stop a bullet"
  ],
  VIOLENCE_THREATS: [
    "fill you full of lead", "put you six feet under", "send you to hell",
    "gut you like a fish", "string you up", "leave you for the buzzards",
    "make you disappear", "paint the walls with you", "introduce you to my friend here",
    "show you what the inside of a grave looks like", "carve my initials in your hide",
    "turn you into a memory"
  ],

  // ============================================================================
  // EXPRESSIONS OF DISBELIEF (12 variations)
  // ============================================================================
  DISBELIEF: [
    "Well, I'll be damned", "You don't say", "I never would've guessed",
    "Pull the other one", "That's a tall tale", "You're jokin'",
    "Get outta here", "I'll believe it when I see it", "Hogwash",
    "Save your breath", "Who'd believe such a thing?", "You expect me to swallow that?"
  ],

  // ============================================================================
  // EXPRESSIONS OF AGREEMENT/UNDERSTANDING (12 variations)
  // ============================================================================
  UNDERSTANDING: [
    "I hear ya", "I savvy", "Crystal clear", "Understood",
    "You and me both", "Tell me about it", "Don't I know it",
    "Preachin' to the choir", "Read you loud and clear", "Got it",
    "Point taken", "Message received"
  ]
} as const;
```

---

## EXECUTION ORDER (EXPANDED - 70 hours total)

### Week 1: Foundation (25 hours)
1. Saloon girl dialogue rewrite - 60 variations across 5 moods
2. 24 new Frontera NPCs with full dialogue trees
3. Ghost Riders quest chain - 5 detailed quests with choices
4. Western slang variable pools - 200+ variations

### Week 2: Voice Differentiation (25 hours)
5. Voice personality profiles for 10 NPC roles
6. Rewrite all 30 quest templates with vernacular
7. Faction-specific dialogue patterns (Settler/Frontera/Coalition)
8. Emotional depth in investigation/rescue quests
9. Drunk/fearful mood expansions for all NPC roles

### Week 3: World Immersion (15 hours)
10. Supernatural gossip integration - 50+ templates
11. Newspaper article content - headlines AND stories
12. Seasonal cosmic events - monthly supernatural flavor
13. Environmental storytelling (ruins, ghost towns, decay)

### Week 4: Polish & Quality (5 hours)
14. Consistency pass across all dialogue
15. Missing emotional beats in procedural content
16. Quest consequence clarity
17. Final voice differentiation check
18. Playtest dialogue flow

---

## FILES TO MODIFY (Complete List)

### Critical Path
```
server/src/data/npcDialogueTemplates.ts     - All NPC role dialogue (saloon_girl, etc.)
server/src/data/questTemplates.ts           - 30 templates with Western vernacular
server/src/seeds/npcs_new.ts                - 24+ Frontera NPCs
server/src/seeds/mysteriousFigureQuests.seed.ts - Ghost Riders complete chain
shared/src/constants/dialogue.constants.ts  - NEW: Western slang pools
```

### World Immersion
```
server/src/data/newspapers.ts               - Full article content
server/src/data/gossipExpansion.ts          - Supernatural gossip categories
server/src/data/seasonalEffects.ts          - Cosmic monthly events
server/src/data/locations/*.ts              - Environmental storytelling
```

### Voice Differentiation
```
server/src/data/npcDialogueTemplates.ts     - Role-specific voice profiles
server/src/seeds/quests.seed.ts             - Emotional depth in existing quests
server/src/data/crimeOutcomeTemplates.ts    - Gritty consequence descriptions
```

---

# DEITY SYSTEM IMPLEMENTATION PLAN

## Executive Summary

**Feature:** Hidden AI-driven "god" and "devil" NPCs that observe player actions, track karma across 10 dimensions, and intervene through blessings, curses, and cryptic dialogue.

**Core Concept:** Two ancient entities - "The Gambler" (order/fate) and "The Outlaw King" (chaos/freedom) - secretly watch all players. They never reveal their true nature directly. They influence the world through dreams, omens, disguised encounters, and subtle manipulation of fortune.

**Design Philosophy:** Minimal AI usage (expensive), maximum player impact. 90% rule-based decisions, 10% template-generated dialogue with context injection.

**Estimated Effort:** 60-80 hours total

---

## PART 1: CORE ARCHITECTURE

### 1.1 DeityAgent Model (Hybrid NPC/Character)

**File:** `server/src/models/DeityAgent.model.ts`

**Philosophy:** Deities are like NPCs (dialogue, moods, locations) but also like Characters (they have stats, track relationships, evolve over time). They're a hybrid entity.

```typescript
// DeityAgent.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IDeityDomain {
  name: string;                    // e.g., "fate", "chaos", "mercy"
  power: number;                   // 0-100, deity's strength in this domain
  playerAffinity: Map<string, number>;  // characterId -> affinity (-100 to +100)
}

export interface IDeityManifestation {
  form: 'dream' | 'omen' | 'whisper' | 'stranger' | 'animal' | 'phenomenon';
  description: string;
  lastUsed: Date;
  cooldownHours: number;
}

export interface IDeityAgent extends Document {
  // Identity
  name: string;                    // "The Gambler" or "The Outlaw King"
  trueName: string;                // Hidden name revealed only at max affinity
  archetype: 'ORDER' | 'CHAOS';

  // NPC-like properties
  currentDisguise: string;         // NPC they're currently manifesting as
  mood: 'PLEASED' | 'NEUTRAL' | 'DISPLEASED' | 'WRATHFUL' | 'AMUSED';
  dialogueStyle: string;           // Template key for their voice

  // Character-like properties
  level: number;                   // Grows with player engagement
  experience: number;
  stats: {
    influence: number;             // World manipulation power
    patience: number;              // How long they wait before acting
    wrath: number;                 // How severely they punish
    benevolence: number;           // How generously they reward
  };

  // Domains of power
  domains: IDeityDomain[];

  // Manifestation tracking
  manifestations: IDeityManifestation[];
  lastGlobalIntervention: Date;
  interventionCooldownHours: number;

  // Player relationships
  favoredCharacters: Types.ObjectId[];    // Top affinity characters
  cursedCharacters: Types.ObjectId[];     // Negative affinity characters

  // World state
  currentPhase: 'DORMANT' | 'WATCHING' | 'ACTIVE' | 'INTERVENING';
  powerLevel: number;              // 0-100, affects intervention strength

  createdAt: Date;
  updatedAt: Date;
}

const DeityAgentSchema = new Schema<IDeityAgent>({
  name: { type: String, required: true, unique: true },
  trueName: { type: String, required: true },
  archetype: { type: String, enum: ['ORDER', 'CHAOS'], required: true },

  currentDisguise: { type: String, default: null },
  mood: {
    type: String,
    enum: ['PLEASED', 'NEUTRAL', 'DISPLEASED', 'WRATHFUL', 'AMUSED'],
    default: 'NEUTRAL'
  },
  dialogueStyle: { type: String, required: true },

  level: { type: Number, default: 1, min: 1, max: 100 },
  experience: { type: Number, default: 0 },
  stats: {
    influence: { type: Number, default: 50 },
    patience: { type: Number, default: 50 },
    wrath: { type: Number, default: 50 },
    benevolence: { type: Number, default: 50 }
  },

  domains: [{
    name: { type: String, required: true },
    power: { type: Number, default: 50 },
    playerAffinity: { type: Map, of: Number, default: new Map() }
  }],

  manifestations: [{
    form: { type: String, enum: ['dream', 'omen', 'whisper', 'stranger', 'animal', 'phenomenon'] },
    description: { type: String },
    lastUsed: { type: Date },
    cooldownHours: { type: Number, default: 24 }
  }],

  lastGlobalIntervention: { type: Date, default: null },
  interventionCooldownHours: { type: Number, default: 168 }, // 1 week

  favoredCharacters: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
  cursedCharacters: [{ type: Schema.Types.ObjectId, ref: 'Character' }],

  currentPhase: {
    type: String,
    enum: ['DORMANT', 'WATCHING', 'ACTIVE', 'INTERVENING'],
    default: 'WATCHING'
  },
  powerLevel: { type: Number, default: 50, min: 0, max: 100 }
}, { timestamps: true });

export const DeityAgent = model<IDeityAgent>('DeityAgent', DeityAgentSchema);
```

### 1.2 CharacterKarma Model (10-Dimensional Karma)

**File:** `server/src/models/CharacterKarma.model.ts`

**Philosophy:** Instead of simple good/evil, track 10 independent moral dimensions. A character can be merciful AND greedy. Honorable AND chaotic. This creates nuanced deity responses.

```typescript
// CharacterKarma.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IKarmaAction {
  actionType: string;              // e.g., 'CRIME_COMPLETED', 'NPC_HELPED'
  dimension: KarmaDimension;
  delta: number;                   // -10 to +10 change
  timestamp: Date;
  context: string;                 // Brief description
  witnessedByDeity: 'GAMBLER' | 'OUTLAW_KING' | 'BOTH' | 'NONE';
}

export type KarmaDimension =
  | 'MERCY'      // Sparing enemies, healing, forgiveness
  | 'CRUELTY'    // Torture, excessive violence, sadism
  | 'GREED'      // Hoarding, theft for profit, exploitation
  | 'CHARITY'    // Giving to poor, helping without reward
  | 'JUSTICE'    // Following law, punishing criminals
  | 'CHAOS'      // Breaking rules, unpredictability, anarchy
  | 'HONOR'      // Keeping promises, fair fights, honesty
  | 'DECEPTION'  // Lies, betrayal, manipulation
  | 'SURVIVAL'   // Self-preservation, pragmatism
  | 'LOYALTY';   // Protecting allies, gang devotion

export interface IKarmaThreshold {
  dimension: KarmaDimension;
  value: number;
  tier: 'MINOR' | 'MODERATE' | 'MAJOR' | 'EXTREME';
  lastTriggered: Date | null;
}

export interface ICharacterKarma extends Document {
  characterId: Types.ObjectId;

  // Current karma values (-100 to +100 per dimension)
  karma: {
    mercy: number;
    cruelty: number;
    greed: number;
    charity: number;
    justice: number;
    chaos: number;
    honor: number;
    deception: number;
    survival: number;
    loyalty: number;
  };

  // Tracking
  totalActions: number;
  recentActions: IKarmaAction[];   // Last 100 actions

  // Deity relationships
  gamblerAffinity: number;         // -100 to +100
  outlawKingAffinity: number;      // -100 to +100

  // Thresholds for divine intervention
  thresholds: IKarmaThreshold[];

  // Divine marks
  blessings: {
    source: 'GAMBLER' | 'OUTLAW_KING';
    type: string;
    power: number;
    expiresAt: Date | null;
    description: string;
  }[];

  curses: {
    source: 'GAMBLER' | 'OUTLAW_KING';
    type: string;
    severity: number;
    expiresAt: Date | null;
    description: string;
    removalCondition: string;
  }[];

  // Dream/vision tracking
  lastDreamFrom: 'GAMBLER' | 'OUTLAW_KING' | null;
  lastDreamAt: Date | null;
  dreamsReceived: number;

  createdAt: Date;
  updatedAt: Date;
}

const CharacterKarmaSchema = new Schema<ICharacterKarma>({
  characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true, unique: true },

  karma: {
    mercy: { type: Number, default: 0, min: -100, max: 100 },
    cruelty: { type: Number, default: 0, min: -100, max: 100 },
    greed: { type: Number, default: 0, min: -100, max: 100 },
    charity: { type: Number, default: 0, min: -100, max: 100 },
    justice: { type: Number, default: 0, min: -100, max: 100 },
    chaos: { type: Number, default: 0, min: -100, max: 100 },
    honor: { type: Number, default: 0, min: -100, max: 100 },
    deception: { type: Number, default: 0, min: -100, max: 100 },
    survival: { type: Number, default: 0, min: -100, max: 100 },
    loyalty: { type: Number, default: 0, min: -100, max: 100 }
  },

  totalActions: { type: Number, default: 0 },
  recentActions: [{
    actionType: String,
    dimension: String,
    delta: Number,
    timestamp: Date,
    context: String,
    witnessedByDeity: { type: String, enum: ['GAMBLER', 'OUTLAW_KING', 'BOTH', 'NONE'] }
  }],

  gamblerAffinity: { type: Number, default: 0, min: -100, max: 100 },
  outlawKingAffinity: { type: Number, default: 0, min: -100, max: 100 },

  thresholds: [{
    dimension: String,
    value: Number,
    tier: { type: String, enum: ['MINOR', 'MODERATE', 'MAJOR', 'EXTREME'] },
    lastTriggered: Date
  }],

  blessings: [{
    source: { type: String, enum: ['GAMBLER', 'OUTLAW_KING'] },
    type: String,
    power: Number,
    expiresAt: Date,
    description: String
  }],

  curses: [{
    source: { type: String, enum: ['GAMBLER', 'OUTLAW_KING'] },
    type: String,
    severity: Number,
    expiresAt: Date,
    description: String,
    removalCondition: String
  }],

  lastDreamFrom: { type: String, enum: ['GAMBLER', 'OUTLAW_KING', null], default: null },
  lastDreamAt: { type: Date, default: null },
  dreamsReceived: { type: Number, default: 0 }
}, { timestamps: true });

// Indexes for efficient queries
CharacterKarmaSchema.index({ characterId: 1 });
CharacterKarmaSchema.index({ gamblerAffinity: -1 });
CharacterKarmaSchema.index({ outlawKingAffinity: -1 });
CharacterKarmaSchema.index({ 'karma.mercy': -1 });
CharacterKarmaSchema.index({ 'karma.chaos': -1 });

export const CharacterKarma = model<ICharacterKarma>('CharacterKarma', CharacterKarmaSchema);
```

### 1.3 DivineManifestation Model (Tracking Encounters)

**File:** `server/src/models/DivineManifestation.model.ts`

```typescript
// DivineManifestation.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IDivineManifestation extends Document {
  deityName: 'GAMBLER' | 'OUTLAW_KING';
  targetCharacterId: Types.ObjectId;

  // Manifestation details
  type: 'DREAM' | 'OMEN' | 'WHISPER' | 'STRANGER' | 'ANIMAL' | 'PHENOMENON' | 'BLESSING' | 'CURSE';
  disguise: string | null;         // NPC form if applicable
  location: string | null;

  // Content
  message: string;                 // What was communicated
  effect: string | null;           // Game effect if any

  // Player response
  acknowledged: boolean;
  playerResponse: string | null;
  responseAt: Date | null;

  // Karma context
  triggeringKarma: {
    dimension: string;
    value: number;
    threshold: string;
  } | null;

  createdAt: Date;
}

const DivineManifestationSchema = new Schema<IDivineManifestation>({
  deityName: { type: String, enum: ['GAMBLER', 'OUTLAW_KING'], required: true },
  targetCharacterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },

  type: {
    type: String,
    enum: ['DREAM', 'OMEN', 'WHISPER', 'STRANGER', 'ANIMAL', 'PHENOMENON', 'BLESSING', 'CURSE'],
    required: true
  },
  disguise: { type: String, default: null },
  location: { type: String, default: null },

  message: { type: String, required: true },
  effect: { type: String, default: null },

  acknowledged: { type: Boolean, default: false },
  playerResponse: { type: String, default: null },
  responseAt: { type: Date, default: null },

  triggeringKarma: {
    dimension: String,
    value: Number,
    threshold: String
  }
}, { timestamps: true });

DivineManifestationSchema.index({ targetCharacterId: 1, createdAt: -1 });
DivineManifestationSchema.index({ deityName: 1, createdAt: -1 });

export const DivineManifestation = model<IDivineManifestation>('DivineManifestation', DivineManifestationSchema);
```

---

## PART 2: KARMA TRACKING SERVICE

### 2.1 Karma Service (Core Logic)

**File:** `server/src/services/karma.service.ts`

**Philosophy:** Every significant player action is evaluated for karma impact. The service uses a rule-based system (no AI) to determine which dimensions are affected and by how much.

```typescript
// karma.service.ts
import { CharacterKarma, ICharacterKarma, KarmaDimension, IKarmaAction } from '../models/CharacterKarma.model';
import { DeityAgent } from '../models/DeityAgent.model';
import { DivineManifestation } from '../models/DivineManifestation.model';
import logger from '../utils/logger';
import mongoose from 'mongoose';

// Karma impact rules for different actions
const KARMA_RULES: Record<string, { dimensions: Partial<Record<KarmaDimension, number>>, witnessChance: number }> = {
  // Crime actions
  'CRIME_MURDER': { dimensions: { cruelty: +8, chaos: +5, justice: -10 }, witnessChance: 0.8 },
  'CRIME_THEFT_POOR': { dimensions: { greed: +5, charity: -8, honor: -3 }, witnessChance: 0.6 },
  'CRIME_THEFT_RICH': { dimensions: { greed: +3, chaos: +2 }, witnessChance: 0.4 },
  'CRIME_ASSAULT': { dimensions: { cruelty: +4, chaos: +3 }, witnessChance: 0.5 },

  // Combat actions
  'COMBAT_SPARE_ENEMY': { dimensions: { mercy: +8, honor: +3, survival: -2 }, witnessChance: 0.9 },
  'COMBAT_EXECUTE_ENEMY': { dimensions: { cruelty: +5, mercy: -5, survival: +2 }, witnessChance: 0.7 },
  'COMBAT_FAIR_DUEL': { dimensions: { honor: +5, justice: +2 }, witnessChance: 0.8 },
  'COMBAT_AMBUSH': { dimensions: { deception: +5, honor: -5, survival: +3 }, witnessChance: 0.3 },

  // Social actions
  'NPC_HELPED_FREE': { dimensions: { charity: +5, mercy: +3 }, witnessChance: 0.6 },
  'NPC_HELPED_PAID': { dimensions: { charity: +2 }, witnessChance: 0.4 },
  'NPC_BETRAYED': { dimensions: { deception: +8, loyalty: -10, honor: -5 }, witnessChance: 0.9 },
  'NPC_LIED_TO': { dimensions: { deception: +3 }, witnessChance: 0.3 },

  // Gang actions
  'GANG_PROTECTED_MEMBER': { dimensions: { loyalty: +8, honor: +3 }, witnessChance: 0.7 },
  'GANG_BETRAYED_MEMBER': { dimensions: { loyalty: -10, deception: +5 }, witnessChance: 0.95 },
  'GANG_SHARED_LOOT': { dimensions: { charity: +3, loyalty: +2 }, witnessChance: 0.5 },

  // Economy actions
  'GAVE_TO_POOR': { dimensions: { charity: +8, greed: -3 }, witnessChance: 0.6 },
  'EXPLOITED_WORKER': { dimensions: { greed: +5, cruelty: +3, justice: -3 }, witnessChance: 0.4 },
  'FAIR_TRADE': { dimensions: { honor: +2, justice: +1 }, witnessChance: 0.2 },
  'PRICE_GOUGING': { dimensions: { greed: +4, honor: -2 }, witnessChance: 0.3 },

  // Law actions
  'TURNED_IN_CRIMINAL': { dimensions: { justice: +5, loyalty: -2 }, witnessChance: 0.7 },
  'HELPED_CRIMINAL_ESCAPE': { dimensions: { chaos: +5, justice: -5 }, witnessChance: 0.6 },
  'BRIBED_LAWMAN': { dimensions: { deception: +3, justice: -4 }, witnessChance: 0.4 },

  // Survival actions
  'SACRIFICED_FOR_OTHERS': { dimensions: { survival: -5, mercy: +10, honor: +5 }, witnessChance: 0.95 },
  'ABANDONED_ALLY': { dimensions: { survival: +5, loyalty: -8, honor: -3 }, witnessChance: 0.8 },
  'PRAGMATIC_CHOICE': { dimensions: { survival: +3 }, witnessChance: 0.3 },
};

// Deity affinity rules - which karma dimensions each deity cares about
const DEITY_AFFINITY_WEIGHTS = {
  GAMBLER: {
    // The Gambler values order, fate, honor, and playing by the rules
    mercy: 0.3,
    cruelty: -0.2,
    greed: -0.1,
    charity: 0.2,
    justice: 0.8,     // Strongly values justice
    chaos: -0.8,      // Strongly opposes chaos
    honor: 0.9,       // Highest value on honor
    deception: -0.7,  // Hates deception
    survival: 0.1,
    loyalty: 0.5
  },
  OUTLAW_KING: {
    // The Outlaw King values freedom, chaos, survival, and breaking rules
    mercy: 0.1,
    cruelty: 0.3,
    greed: 0.2,
    charity: -0.1,
    justice: -0.6,    // Opposes rigid justice
    chaos: 0.9,       // Loves chaos
    honor: -0.3,      // Honor is for fools
    deception: 0.4,   // Respects cunning
    survival: 0.8,    // Values survival above all
    loyalty: 0.5      // Respects loyalty to one's own
  }
};

// Threshold tiers for divine intervention
const KARMA_THRESHOLDS = {
  MINOR: 25,
  MODERATE: 50,
  MAJOR: 75,
  EXTREME: 90
};

export class KarmaService {

  /**
   * Record a karma-affecting action
   */
  static async recordAction(
    characterId: string,
    actionType: string,
    context: string = ''
  ): Promise<{ karmaChanged: boolean; intervention: any | null }> {
    const rule = KARMA_RULES[actionType];
    if (!rule) {
      logger.debug(`No karma rule found for action: ${actionType}`);
      return { karmaChanged: false, intervention: null };
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get or create karma record
      let karma = await CharacterKarma.findOne({ characterId }).session(session);
      if (!karma) {
        karma = new CharacterKarma({ characterId });
      }

      // Determine if deities witness this action
      const witnessed = this.determineWitness(rule.witnessChance);

      // Apply karma changes
      const changes: Partial<Record<KarmaDimension, number>> = {};
      for (const [dim, delta] of Object.entries(rule.dimensions)) {
        const dimension = dim as KarmaDimension;
        const oldValue = karma.karma[dimension.toLowerCase() as keyof typeof karma.karma];
        const newValue = Math.max(-100, Math.min(100, oldValue + delta));
        (karma.karma as any)[dimension.toLowerCase()] = newValue;
        changes[dimension] = delta;
      }

      // Record action in history
      const action: IKarmaAction = {
        actionType,
        dimension: Object.keys(rule.dimensions)[0] as KarmaDimension,
        delta: Object.values(rule.dimensions)[0],
        timestamp: new Date(),
        context,
        witnessedByDeity: witnessed
      };

      karma.recentActions.unshift(action);
      if (karma.recentActions.length > 100) {
        karma.recentActions = karma.recentActions.slice(0, 100);
      }
      karma.totalActions++;

      // Update deity affinities
      this.updateDeityAffinities(karma, changes);

      // Check for divine intervention
      let intervention = null;
      if (witnessed !== 'NONE') {
        intervention = await this.checkDivineIntervention(karma, witnessed, session);
      }

      await karma.save({ session });
      await session.commitTransaction();

      return { karmaChanged: true, intervention };

    } catch (error) {
      await session.abortTransaction();
      logger.error('Error recording karma action:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Determine which deity (if any) witnesses the action
   */
  private static determineWitness(chance: number): 'GAMBLER' | 'OUTLAW_KING' | 'BOTH' | 'NONE' {
    const roll = Math.random();
    if (roll > chance) return 'NONE';

    const gamblerWatch = Math.random() < 0.5;
    const outlawWatch = Math.random() < 0.5;

    if (gamblerWatch && outlawWatch) return 'BOTH';
    if (gamblerWatch) return 'GAMBLER';
    if (outlawWatch) return 'OUTLAW_KING';
    return 'NONE';
  }

  /**
   * Update deity affinity based on karma changes
   */
  private static updateDeityAffinities(
    karma: ICharacterKarma,
    changes: Partial<Record<KarmaDimension, number>>
  ): void {
    for (const [dim, delta] of Object.entries(changes)) {
      const dimension = dim as KarmaDimension;
      const dimLower = dimension.toLowerCase() as keyof typeof DEITY_AFFINITY_WEIGHTS.GAMBLER;

      // Calculate affinity changes
      const gamblerWeight = DEITY_AFFINITY_WEIGHTS.GAMBLER[dimLower] || 0;
      const outlawWeight = DEITY_AFFINITY_WEIGHTS.OUTLAW_KING[dimLower] || 0;

      karma.gamblerAffinity = Math.max(-100, Math.min(100,
        karma.gamblerAffinity + Math.floor(delta * gamblerWeight)
      ));

      karma.outlawKingAffinity = Math.max(-100, Math.min(100,
        karma.outlawKingAffinity + Math.floor(delta * outlawWeight)
      ));
    }
  }

  /**
   * Check if divine intervention should occur
   */
  private static async checkDivineIntervention(
    karma: ICharacterKarma,
    witness: 'GAMBLER' | 'OUTLAW_KING' | 'BOTH',
    session: mongoose.ClientSession
  ): Promise<any | null> {
    // Check each karma dimension for threshold crossings
    const dimensions: KarmaDimension[] = [
      'MERCY', 'CRUELTY', 'GREED', 'CHARITY', 'JUSTICE',
      'CHAOS', 'HONOR', 'DECEPTION', 'SURVIVAL', 'LOYALTY'
    ];

    for (const dim of dimensions) {
      const value = Math.abs(karma.karma[dim.toLowerCase() as keyof typeof karma.karma]);

      // Determine threshold tier
      let tier: 'MINOR' | 'MODERATE' | 'MAJOR' | 'EXTREME' | null = null;
      if (value >= KARMA_THRESHOLDS.EXTREME) tier = 'EXTREME';
      else if (value >= KARMA_THRESHOLDS.MAJOR) tier = 'MAJOR';
      else if (value >= KARMA_THRESHOLDS.MODERATE) tier = 'MODERATE';
      else if (value >= KARMA_THRESHOLDS.MINOR) tier = 'MINOR';

      if (!tier) continue;

      // Check if this threshold was already triggered
      const existing = karma.thresholds.find(t => t.dimension === dim && t.tier === tier);
      if (existing && existing.lastTriggered) continue;

      // Determine which deity should intervene
      let interveningDeity: 'GAMBLER' | 'OUTLAW_KING';
      if (witness === 'BOTH') {
        // Both are watching - higher affinity deity acts
        interveningDeity = Math.abs(karma.gamblerAffinity) > Math.abs(karma.outlawKingAffinity)
          ? 'GAMBLER' : 'OUTLAW_KING';
      } else {
        interveningDeity = witness;
      }

      // Create intervention based on affinity (positive = blessing, negative = curse)
      const affinity = interveningDeity === 'GAMBLER' ? karma.gamblerAffinity : karma.outlawKingAffinity;
      const isBlessing = affinity > 0;

      // Record threshold trigger
      if (!existing) {
        karma.thresholds.push({ dimension: dim, value, tier, lastTriggered: new Date() });
      } else {
        existing.lastTriggered = new Date();
        existing.value = value;
      }

      // Generate intervention (only for MODERATE+ thresholds)
      if (tier === 'MODERATE' || tier === 'MAJOR' || tier === 'EXTREME') {
        const intervention = await this.generateIntervention(
          karma.characterId.toString(),
          interveningDeity,
          isBlessing,
          tier,
          dim,
          value,
          session
        );
        return intervention;
      }
    }

    return null;
  }

  /**
   * Generate a divine intervention (blessing or curse)
   */
  private static async generateIntervention(
    characterId: string,
    deity: 'GAMBLER' | 'OUTLAW_KING',
    isBlessing: boolean,
    tier: string,
    dimension: string,
    value: number,
    session: mongoose.ClientSession
  ): Promise<any> {
    // Import deity dialogue service for message generation
    const DeityDialogueService = require('./deityDialogue.service').DeityDialogueService;

    const power = tier === 'EXTREME' ? 3 : tier === 'MAJOR' ? 2 : 1;
    const duration = tier === 'EXTREME' ? 168 : tier === 'MAJOR' ? 72 : 24; // hours

    // Determine effect
    const effect = isBlessing
      ? this.selectBlessing(deity, dimension, power)
      : this.selectCurse(deity, dimension, power);

    // Generate message
    const message = DeityDialogueService.generateInterventionMessage(
      deity, isBlessing, dimension, tier
    );

    // Record manifestation
    const manifestation = new DivineManifestation({
      deityName: deity,
      targetCharacterId: characterId,
      type: isBlessing ? 'BLESSING' : 'CURSE',
      message,
      effect: JSON.stringify(effect),
      triggeringKarma: { dimension, value, threshold: tier }
    });

    await manifestation.save({ session });

    // Apply effect to karma record
    const karma = await CharacterKarma.findOne({ characterId }).session(session);
    if (karma) {
      const effectData = {
        source: deity,
        type: effect.type,
        power: effect.power,
        expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000),
        description: effect.description,
        ...(isBlessing ? {} : { removalCondition: effect.removalCondition })
      };

      if (isBlessing) {
        karma.blessings.push(effectData as any);
      } else {
        karma.curses.push(effectData as any);
      }
      await karma.save({ session });
    }

    return { manifestation, effect, isBlessing };
  }

  /**
   * Select appropriate blessing based on deity and context
   */
  private static selectBlessing(deity: string, dimension: string, power: number) {
    const blessings = {
      GAMBLER: {
        HONOR: { type: 'FORTUNE_FAVOR', description: 'Fate smiles upon your honorable deeds', effect: 'luck_bonus' },
        JUSTICE: { type: 'RIGHTEOUS_HAND', description: 'Justice flows through your actions', effect: 'combat_bonus' },
        MERCY: { type: 'GENTLE_TOUCH', description: 'Your mercy echoes through the land', effect: 'reputation_bonus' },
        DEFAULT: { type: 'GAMBLERS_LUCK', description: 'The cards fall in your favor', effect: 'general_luck' }
      },
      OUTLAW_KING: {
        CHAOS: { type: 'WILD_SPIRIT', description: 'Chaos runs in your veins', effect: 'crit_bonus' },
        SURVIVAL: { type: 'UNKILLABLE', description: 'Death himself looks away', effect: 'damage_reduction' },
        DECEPTION: { type: 'SILVER_TONGUE', description: 'Your lies become truth', effect: 'deception_bonus' },
        DEFAULT: { type: 'OUTLAWS_FREEDOM', description: 'No law can bind you', effect: 'escape_bonus' }
      }
    };

    const deityBlessings = blessings[deity as keyof typeof blessings] || blessings.GAMBLER;
    const selected = deityBlessings[dimension as keyof typeof deityBlessings] || deityBlessings.DEFAULT;

    return { ...selected, power };
  }

  /**
   * Select appropriate curse based on deity and context
   */
  private static selectCurse(deity: string, dimension: string, power: number) {
    const curses = {
      GAMBLER: {
        CHAOS: { type: 'FATES_DISFAVOR', description: 'Order rejects you', effect: 'luck_penalty', removalCondition: 'Complete 5 lawful actions' },
        DECEPTION: { type: 'MARKED_LIAR', description: 'Your lies are transparent', effect: 'deception_penalty', removalCondition: 'Speak only truth for 24 hours' },
        DEFAULT: { type: 'UNLUCKY_STREAK', description: 'Fortune abandons you', effect: 'general_penalty', removalCondition: 'Win 3 fair gambles' }
      },
      OUTLAW_KING: {
        JUSTICE: { type: 'CHAINS_OF_ORDER', description: 'The law weighs upon you', effect: 'movement_penalty', removalCondition: 'Break 3 laws' },
        HONOR: { type: 'FOOLS_MARK', description: 'Your honor makes you weak', effect: 'combat_penalty', removalCondition: 'Betray an ally' },
        DEFAULT: { type: 'BRANDED_COWARD', description: 'Your caution disgusts me', effect: 'fear_penalty', removalCondition: 'Face death without flinching' }
      }
    };

    const deityCurses = curses[deity as keyof typeof curses] || curses.GAMBLER;
    const selected = deityCurses[dimension as keyof typeof deityCurses] || deityCurses.DEFAULT;

    return { ...selected, power };
  }

  /**
   * Get character's karma summary
   */
  static async getKarmaSummary(characterId: string): Promise<any> {
    const karma = await CharacterKarma.findOne({ characterId });
    if (!karma) {
      return {
        karma: this.getDefaultKarma(),
        gamblerAffinity: 0,
        outlawKingAffinity: 0,
        blessings: [],
        curses: [],
        totalActions: 0
      };
    }

    return {
      karma: karma.karma,
      gamblerAffinity: karma.gamblerAffinity,
      outlawKingAffinity: karma.outlawKingAffinity,
      blessings: karma.blessings.filter(b => !b.expiresAt || b.expiresAt > new Date()),
      curses: karma.curses.filter(c => !c.expiresAt || c.expiresAt > new Date()),
      totalActions: karma.totalActions,
      dominantTrait: this.getDominantTrait(karma.karma)
    };
  }

  private static getDefaultKarma() {
    return {
      mercy: 0, cruelty: 0, greed: 0, charity: 0, justice: 0,
      chaos: 0, honor: 0, deception: 0, survival: 0, loyalty: 0
    };
  }

  private static getDominantTrait(karma: any): { trait: string; value: number } {
    let maxTrait = 'NEUTRAL';
    let maxValue = 0;

    for (const [trait, value] of Object.entries(karma)) {
      const absValue = Math.abs(value as number);
      if (absValue > maxValue) {
        maxValue = absValue;
        maxTrait = trait.toUpperCase();
      }
    }

    return { trait: maxTrait, value: maxValue };
  }
}
```

---

## PART 3: DEITY AI SERVICE

### 3.1 Deity Decision Service (Rule-Based)

**File:** `server/src/services/deityDecision.service.ts`

**Philosophy:** 90% of deity decisions are rule-based. No LLM calls. Deities follow predictable-but-hidden logic based on karma thresholds, action patterns, and affinity scores.

```typescript
// deityDecision.service.ts
import { DeityAgent, IDeityAgent } from '../models/DeityAgent.model';
import { CharacterKarma } from '../models/CharacterKarma.model';
import { DivineManifestation } from '../models/DivineManifestation.model';
import logger from '../utils/logger';

interface DeityDecision {
  shouldAct: boolean;
  actionType: 'IGNORE' | 'WATCH' | 'DREAM' | 'OMEN' | 'WHISPER' | 'MANIFEST' | 'BLESS' | 'CURSE';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
}

interface ManifestationPlan {
  type: 'dream' | 'omen' | 'whisper' | 'stranger' | 'animal' | 'phenomenon';
  timing: 'IMMEDIATE' | 'NEXT_REST' | 'NEXT_LOCATION_CHANGE' | 'RANDOM';
  disguise?: string;
  message: string;
}

export class DeityDecisionService {

  /**
   * Main decision loop - called periodically for each active deity
   */
  static async evaluateDeityActions(deityName: 'GAMBLER' | 'OUTLAW_KING'): Promise<void> {
    const deity = await DeityAgent.findOne({ name: deityName === 'GAMBLER' ? 'The Gambler' : 'The Outlaw King' });
    if (!deity) {
      logger.warn(`Deity ${deityName} not found in database`);
      return;
    }

    // Check global intervention cooldown
    if (deity.lastGlobalIntervention) {
      const hoursSince = (Date.now() - deity.lastGlobalIntervention.getTime()) / (1000 * 60 * 60);
      if (hoursSince < deity.interventionCooldownHours) {
        logger.debug(`${deityName} on global cooldown, ${deity.interventionCooldownHours - hoursSince} hours remaining`);
        return;
      }
    }

    // Get characters this deity is watching
    const watchedCharacters = await this.getWatchedCharacters(deityName);

    for (const karma of watchedCharacters) {
      const decision = await this.makeDecision(deity, karma);

      if (decision.shouldAct && decision.actionType !== 'IGNORE' && decision.actionType !== 'WATCH') {
        await this.executeDecision(deity, karma, decision);
      }
    }
  }

  /**
   * Get characters that meet watching criteria for this deity
   */
  private static async getWatchedCharacters(deityName: string): Promise<any[]> {
    const affinityField = deityName === 'GAMBLER' ? 'gamblerAffinity' : 'outlawKingAffinity';

    // Watch characters with significant affinity (positive or negative)
    return CharacterKarma.find({
      $or: [
        { [affinityField]: { $gte: 25 } },   // Favored
        { [affinityField]: { $lte: -25 } },  // Disfavored
        { totalActions: { $gte: 50 } }        // Active players
      ]
    }).limit(100).lean();
  }

  /**
   * Make a decision about what to do with this character
   */
  private static async makeDecision(deity: IDeityAgent, karma: any): Promise<DeityDecision> {
    const affinity = deity.archetype === 'ORDER' ? karma.gamblerAffinity : karma.outlawKingAffinity;
    const absAffinity = Math.abs(affinity);

    // Check for recent manifestation to this character
    const recentManifestation = await DivineManifestation.findOne({
      targetCharacterId: karma.characterId,
      deityName: deity.archetype === 'ORDER' ? 'GAMBLER' : 'OUTLAW_KING',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (recentManifestation) {
      return { shouldAct: false, actionType: 'WATCH', urgency: 'LOW', reason: 'Recent contact' };
    }

    // Decision rules based on affinity and karma extremes

    // CRITICAL: Extreme karma threshold crossed
    const extremeKarma = this.findExtremeKarma(karma);
    if (extremeKarma && extremeKarma.value >= 90) {
      return {
        shouldAct: true,
        actionType: affinity > 0 ? 'BLESS' : 'CURSE',
        urgency: 'CRITICAL',
        reason: `Extreme ${extremeKarma.dimension}: ${extremeKarma.value}`
      };
    }

    // HIGH: Strong affinity (positive or negative) + recent significant actions
    if (absAffinity >= 50 && karma.recentActions?.length > 10) {
      const recentKarmaSum = karma.recentActions.slice(0, 10).reduce((sum: number, a: any) => sum + Math.abs(a.delta || 0), 0);
      if (recentKarmaSum >= 30) {
        return {
          shouldAct: true,
          actionType: affinity > 0 ? 'DREAM' : 'OMEN',
          urgency: 'HIGH',
          reason: `High activity with strong affinity: ${affinity}`
        };
      }
    }

    // MEDIUM: Moderate affinity + character at moral crossroads
    if (absAffinity >= 25) {
      const conflictingKarma = this.detectMoralConflict(karma);
      if (conflictingKarma) {
        return {
          shouldAct: true,
          actionType: 'WHISPER',
          urgency: 'MEDIUM',
          reason: `Moral conflict detected: ${conflictingKarma}`
        };
      }
    }

    // LOW: Random manifestation chance for actively watched characters
    if (absAffinity >= 15 && Math.random() < 0.05) {
      return {
        shouldAct: true,
        actionType: 'OMEN',
        urgency: 'LOW',
        reason: 'Random watch event'
      };
    }

    return { shouldAct: false, actionType: 'WATCH', urgency: 'LOW', reason: 'No action needed' };
  }

  /**
   * Find if any karma dimension is at extreme level
   */
  private static findExtremeKarma(karma: any): { dimension: string; value: number } | null {
    const dimensions = ['mercy', 'cruelty', 'greed', 'charity', 'justice',
                        'chaos', 'honor', 'deception', 'survival', 'loyalty'];

    for (const dim of dimensions) {
      const value = Math.abs(karma.karma?.[dim] || 0);
      if (value >= 75) {
        return { dimension: dim.toUpperCase(), value };
      }
    }
    return null;
  }

  /**
   * Detect if character has conflicting high karma values
   */
  private static detectMoralConflict(karma: any): string | null {
    const conflicts = [
      ['mercy', 'cruelty'],
      ['greed', 'charity'],
      ['justice', 'chaos'],
      ['honor', 'deception'],
      ['survival', 'loyalty']
    ];

    for (const [dim1, dim2] of conflicts) {
      const v1 = Math.abs(karma.karma?.[dim1] || 0);
      const v2 = Math.abs(karma.karma?.[dim2] || 0);

      // Both values are significant and in tension
      if (v1 >= 30 && v2 >= 30) {
        return `${dim1.toUpperCase()} vs ${dim2.toUpperCase()}`;
      }
    }
    return null;
  }

  /**
   * Execute the deity's decision
   */
  private static async executeDecision(
    deity: IDeityAgent,
    karma: any,
    decision: DeityDecision
  ): Promise<void> {
    logger.info(`${deity.name} executing ${decision.actionType} for character ${karma.characterId}: ${decision.reason}`);

    const DeityDialogueService = require('./deityDialogue.service').DeityDialogueService;
    const deityType = deity.archetype === 'ORDER' ? 'GAMBLER' : 'OUTLAW_KING';

    let manifestationType: 'DREAM' | 'OMEN' | 'WHISPER' | 'BLESSING' | 'CURSE';
    let message: string;

    switch (decision.actionType) {
      case 'DREAM':
        manifestationType = 'DREAM';
        message = DeityDialogueService.generateDreamMessage(deityType, karma);
        break;

      case 'OMEN':
        manifestationType = 'OMEN';
        message = DeityDialogueService.generateOmenMessage(deityType, karma);
        break;

      case 'WHISPER':
        manifestationType = 'WHISPER';
        message = DeityDialogueService.generateWhisperMessage(deityType, karma);
        break;

      case 'BLESS':
        manifestationType = 'BLESSING';
        message = DeityDialogueService.generateBlessingMessage(deityType, karma);
        // Blessing effect applied via KarmaService
        break;

      case 'CURSE':
        manifestationType = 'CURSE';
        message = DeityDialogueService.generateCurseMessage(deityType, karma);
        // Curse effect applied via KarmaService
        break;

      default:
        return;
    }

    // Create manifestation record
    const manifestation = new DivineManifestation({
      deityName: deityType,
      targetCharacterId: karma.characterId,
      type: manifestationType,
      message,
      triggeringKarma: decision.reason.includes(':') ? {
        dimension: decision.reason.split(':')[0].split(' ').pop(),
        value: parseInt(decision.reason.split(':')[1]) || 0,
        threshold: decision.urgency
      } : null
    });

    await manifestation.save();

    // Update deity state
    deity.lastGlobalIntervention = new Date();
    await deity.save();

    logger.info(`${deity.name} manifested to ${karma.characterId}: ${manifestationType}`);
  }

  /**
   * Plan a stranger manifestation (deity disguised as NPC)
   */
  static async planStrangerManifestation(
    deityName: 'GAMBLER' | 'OUTLAW_KING',
    characterId: string,
    location: string
  ): Promise<ManifestationPlan> {
    const disguises = {
      GAMBLER: [
        'weathered card dealer',
        'traveling preacher',
        'well-dressed stranger',
        'old prospector with knowing eyes',
        'silent bartender'
      ],
      OUTLAW_KING: [
        'scarred outlaw',
        'grinning desperado',
        'blood-stained stranger',
        'wild-eyed prophet',
        'laughing hangman'
      ]
    };

    const DeityDialogueService = require('./deityDialogue.service').DeityDialogueService;
    const karma = await CharacterKarma.findOne({ characterId });

    return {
      type: 'stranger',
      timing: 'NEXT_LOCATION_CHANGE',
      disguise: disguises[deityName][Math.floor(Math.random() * disguises[deityName].length)],
      message: DeityDialogueService.generateStrangerDialogue(deityName, karma)
    };
  }
}
```

---

## PART 4: DEITY DIALOGUE SERVICE

### 4.1 Template-Based Dialogue Generation

**File:** `server/src/services/deityDialogue.service.ts`

**Philosophy:** No LLM for dialogue. Use rich template pools with context injection. The templates are numerous and varied enough to feel dynamic.

```typescript
// deityDialogue.service.ts

// ============================================================================
// THE GAMBLER - Voice of Order, Fate, Honor
// Speaks like: A wise dealer who's seen everything, cryptic but fair
// ============================================================================

const GAMBLER_TEMPLATES = {
  // Dream messages - appear when player rests
  DREAMS: {
    POSITIVE_AFFINITY: [
      "In your dreams, cards fall in endless cascades. Each one bears your face, and each one is a winning hand.",
      "A figure deals across an infinite table. 'The odds favor the righteous,' he whispers. 'You've been playing well.'",
      "You dream of crossroads. Every path you didn't take glimmers silver. The one you walk gleams gold.",
      "The Gambler sits at a table of stars. He nods at your empty chair. 'Your seat is waiting. When you're ready.'",
      "Cards rain from a moonlit sky. You catch one. It shows your future: prosperous, if you stay the course.",
    ],
    NEGATIVE_AFFINITY: [
      "You dream of a rigged game. The dealer's eyes burn. 'You've been cheating yourself,' he says. 'The house always knows.'",
      "Cards scatter in a cold wind. Every one you catch is the Hanged Man. The Gambler doesn't smile.",
      "An endless poker table. You're losing. The Gambler counts your debts in a voice like shuffling cards.",
      "You dream of a locked door. Behind it, laughter. 'Fortune favors the bold,' says a voice. 'Not the dishonored.'",
      "The deck is empty. The dealer waits. 'You've played your cards poorly,' he says. 'The ante rises.'",
    ],
    NEUTRAL: [
      "Cards drift through darkness. A voice from nowhere: 'The game continues. How will you play?'",
      "You dream of dice tumbling through eternity. A figure watches. Waiting.",
      "An empty saloon. A single card on the table. When you reach for it, you wake.",
      "The Gambler deals to shadows. He glances your way. Says nothing. Deals again.",
      "You dream of choices. A crossroads. A coin spinning in the air, never landing.",
    ]
  },

  // Omen messages - environmental signs
  OMENS: {
    POSITIVE: [
      "A crow lands nearby, a gold coin in its beak. It drops the coin at your feet and flies toward your destination.",
      "The cards in your pocket feel warm. When you check, the top card is an Ace.",
      "A stranger tips his hat as you pass. 'Lucky day,' he says. His eyes know more than they should.",
      "You find a four-leaf clover exactly where you need to step.",
      "The wind changes direction to blow at your back. Just as you needed it to.",
    ],
    NEGATIVE: [
      "A mirror cracks as you pass. In the shards, you glimpse cards falling - all of them black.",
      "Every coin you flip lands on edge. Never heads. Never tails. Just... waiting.",
      "A gambler's token appears in your pocket. It's cold. You don't remember picking it up.",
      "The cards in your pocket feel cold. Dead. The top one is blank.",
      "A dog howls three times as you approach. The locals won't meet your eyes.",
    ],
    NEUTRAL: [
      "A card blows across your path. You don't recognize the suit.",
      "Someone whistles a gambling tune. When you turn, no one's there.",
      "You find a single die on the ground. It shows all six faces at once, somehow.",
      "A playing card is nailed to a post you pass. The figure on it looks like you.",
      "Thunder rolls from a clear sky. Once. Twice. It sounds like shuffling cards.",
    ]
  },

  // Whisper messages - internal voice
  WHISPERS: {
    GUIDANCE: [
      "The house always wins. But today, you're the house.",
      "Play your cards right, and this hand could change everything.",
      "Someone's bluffing. It's not you.",
      "The odds are in your favor. Trust the math.",
      "Every game has rules. Learn them. Then learn to bend them.",
    ],
    WARNING: [
      "You're betting more than you can afford to lose.",
      "This game is rigged. Walk away while you can.",
      "The cards are marked. The question is: by whom?",
      "You've drawn attention from the wrong people. Tread carefully.",
      "Fortune's wheel is turning. You're not the one spinning it.",
    ],
    CRYPTIC: [
      "Three cards. Three choices. Choose poorly, and the fourth chooses for you.",
      "The river always takes its due. What are you willing to pay?",
      "In the grand game, you're neither dealer nor player. You're the stake.",
      "Every hand is a new chance. Unless you've already folded.",
      "The ace is hidden. The question is where. The answer is when.",
    ]
  },

  // Stranger dialogue - when manifesting as NPC
  STRANGER: {
    GREETING: [
      "Well now. {NAME}. The cards spoke of your coming.",
      "Sit down, {NAME}. I've been dealing this hand for some time now.",
      "Ah, you've arrived. The table's been waiting.",
      "Don't be alarmed, {NAME}. I'm just a traveler. Like you. Sort of.",
      "{NAME}. I've watched your game with interest. Care for a hand?",
    ],
    ADVICE: [
      "You've been playing the odds well. But odds can change.",
      "Honor is rare in these parts. Rarer still is honor that survives.",
      "The game you think you're playing? It's not the real game.",
      "Every choice is a wager. What are you willing to stake?",
      "There are rules beyond law, {NAME}. You're learning them.",
    ],
    FAREWELL: [
      "The cards will find you again, {NAME}. They always do.",
      "Until the next hand. Play well.",
      "May fortune favor the righteous. And may you remain so.",
      "The game never ends, {NAME}. Only the players change.",
      "We'll meet again. At a table you won't recognize. In a game you've already won. Or lost.",
    ]
  },

  // Blessing messages
  BLESSINGS: [
    "The Gambler's mark appears on your palm - a subtle shimmer of gold. Fortune will favor you.",
    "You feel the weight of an unseen coin in your pocket. Lucky. Very lucky.",
    "A voice in your ear, soft as shuffled cards: 'The house likes you. For now.'",
    "Your hands steady. Your eyes sharpen. The game has become... easier.",
    "The odds bend. Just slightly. Just enough. Someone is watching out for you.",
  ],

  // Curse messages
  CURSES: [
    "The Gambler's mark burns cold on your skin - invisible but heavy. Your luck has turned.",
    "Every card you draw will remind you: the house always wins. And you're not the house.",
    "A voice like falling chips: 'You've been playing against the rules. The rules play back.'",
    "Your hands tremble at crucial moments. Your eyes miss what matters. The game has turned against you.",
    "Fortune looks away. The odds are no longer in your favor. They remember what you've done.",
  ]
};

// ============================================================================
// THE OUTLAW KING - Voice of Chaos, Freedom, Survival
// Speaks like: A wild-eyed bandit king, mocking but honest about cruelty
// ============================================================================

const OUTLAW_KING_TEMPLATES = {
  DREAMS: {
    POSITIVE_AFFINITY: [
      "You dream of riding through fire, laughing. A crowned figure rides beside you. 'This is freedom,' he roars.",
      "The Outlaw King shows you a map written in blood. Every road leads to glory. None lead to chains.",
      "A wild hunt thunders through your sleep. You're not the prey. You never were.",
      "The crown is made of bullets and broken badges. In your dream, it fits perfectly.",
      "You dream of standing over your enemies. The Outlaw King toasts you with a bottle of burning whiskey.",
    ],
    NEGATIVE_AFFINITY: [
      "You dream of chains. The Outlaw King watches, disgusted. 'You chose the cage,' he spits. 'Pathetic.'",
      "A throne of bones. Empty. The King's voice echoes: 'You could have sat here. You chose to kneel instead.'",
      "You dream of running, always running. But you're running toward the law, not from it. The King laughs.",
      "The wild hunt rides past. They don't see you. You've become invisible. Forgettable. Safe.",
      "You dream of a hangman's noose. The Outlaw King cuts it down. 'Not even worth killing,' he mutters.",
    ],
    NEUTRAL: [
      "Gunfire and laughter. A figure rides through chaos, crown askew. He glances your way. Maybe.",
      "You dream of an outlaw's grave. The name is blurred. The epitaph reads: 'They lived free.'",
      "The Outlaw King is playing cards with death. He cheats. Death doesn't mind.",
      "A wild horse runs through your dreams. You could ride it. If you were brave enough to try.",
      "Fire and freedom. The same thing, in the end. You dream of choosing between them.",
    ]
  },

  OMENS: {
    POSITIVE: [
      "A wanted poster blows across your path - your face, but the charges are heroic.",
      "A wild horse approaches you, unafraid. It smells like gunsmoke and freedom.",
      "Lightning strikes nearby, but only the chains are hit. Your ropes fall loose.",
      "An outlaw tips his hat as he rides past. 'The King sends his regards,' he grins.",
      "You find a bullet on the ground. It's got your enemy's name carved into it.",
    ],
    NEGATIVE: [
      "A badge gleams on your chest - you never pinned it there. It burns cold.",
      "Every horse shies away from you. Animals know a tamed thing when they see one.",
      "A wanted poster with your face - but the reward is insultingly low.",
      "An outlaw spits as you pass. 'Bootlicker,' he mutters. Others laugh.",
      "You find a pair of handcuffs. They're your size. They almost seem to want to close.",
    ],
    NEUTRAL: [
      "A crown made of thorns and bullets lies in your path. Picking it up is a choice.",
      "Outlaws ride past in the distance. They could be allies. They could be enemies.",
      "You hear howling - wolves or men, it's impossible to tell.",
      "A fire burns in the distance. Something's being destroyed. Something's being freed.",
      "A noose hangs from a tree. Empty. Waiting. A warning or an invitation.",
    ]
  },

  WHISPERS: {
    GUIDANCE: [
      "Rules are for people who can't survive without them. You're better than that.",
      "They want you to be afraid. Disappoint them.",
      "Every king started as an outlaw. Think about that.",
      "The law protects the weak. You're not weak.",
      "Freedom isn't given. It's taken. With both hands.",
    ],
    WARNING: [
      "You're becoming predictable. Predictable things get caged.",
      "Careful. Start bowing and you'll forget how to stand.",
      "They're putting a leash on you. Can't you feel it tightening?",
      "Honor is a pretty word for chains. Don't let them bind you.",
      "You're thinking like prey. Remember: you have teeth.",
    ],
    CRYPTIC: [
      "The throne isn't made of gold. It's made of everyone who tried to stop you.",
      "In the war between order and freedom, there are no civilians.",
      "The wildest horses are never broken. They just let you think they are.",
      "Every badge is paid for in blood. Usually not the wearer's.",
      "They built their world on bones. Don't feel bad about breaking it.",
    ]
  },

  STRANGER: {
    GREETING: [
      "Ha! {NAME}! I was wondering when you'd stumble into my territory.",
      "Well, well. The infamous {NAME}. You're shorter than the stories say.",
      "Don't reach for your gun, {NAME}. If I wanted you dead, you'd be dead.",
      "{NAME}. I've heard things. Good things. Bad things. Interesting things.",
      "Sit down, {NAME}. Let's talk about how boring your life has been. And how to fix that.",
    ],
    ADVICE: [
      "You want advice? Stop asking for advice. Make your own damn decisions.",
      "The law is just organized crime with better marketing. Remember that.",
      "Every man you spare is a future enemy or ally. Choose which.",
      "Mercy is a luxury. Can you afford it?",
      "The difference between an outlaw and a legend? How good the story is when they die.",
    ],
    FAREWELL: [
      "Go cause some trouble, {NAME}. The world's too orderly without you.",
      "Remember: die on your feet or live on your knees. Choose wisely.",
      "We'll meet again. Probably over someone's corpse.",
      "The wild calls, {NAME}. Don't ignore it too long.",
      "Stay free, {NAME}. It's the only thing worth fighting for.",
    ]
  },

  BLESSINGS: [
    "The Outlaw King's brand burns into your soul - invisible but wild. Chains will never hold you.",
    "You feel the wind change. It blows only for you now. Toward freedom. Toward chaos.",
    "A voice like a gunshot: 'You're one of mine now. Act like it.'",
    "Your fear melts away. What remains is pure, perfect defiance.",
    "The wild is in your blood now. No cage can hold you. No law can bind you.",
  ],

  CURSES: [
    "The Outlaw King's contempt settles on you like a shroud. 'Coward,' the wind seems to whisper.",
    "Every road feels like it leads to a prison. Because for you, it does now.",
    "A voice like chains dragging: 'You chose to be small. So small you'll be.'",
    "Your courage falters at crucial moments. The King has withdrawn his favor.",
    "Freedom tastes like ash in your mouth. You've forgotten what it means. That's the curse.",
  ]
};

export class DeityDialogueService {

  /**
   * Generate a dream message based on deity and karma context
   */
  static generateDreamMessage(deity: 'GAMBLER' | 'OUTLAW_KING', karma: any): string {
    const templates = deity === 'GAMBLER' ? GAMBLER_TEMPLATES.DREAMS : OUTLAW_KING_TEMPLATES.DREAMS;
    const affinity = deity === 'GAMBLER' ? karma?.gamblerAffinity : karma?.outlawKingAffinity;

    let pool: string[];
    if (affinity > 25) pool = templates.POSITIVE_AFFINITY;
    else if (affinity < -25) pool = templates.NEGATIVE_AFFINITY;
    else pool = templates.NEUTRAL;

    return this.selectAndInject(pool, karma);
  }

  /**
   * Generate an omen message
   */
  static generateOmenMessage(deity: 'GAMBLER' | 'OUTLAW_KING', karma: any): string {
    const templates = deity === 'GAMBLER' ? GAMBLER_TEMPLATES.OMENS : OUTLAW_KING_TEMPLATES.OMENS;
    const affinity = deity === 'GAMBLER' ? karma?.gamblerAffinity : karma?.outlawKingAffinity;

    let pool: string[];
    if (affinity > 25) pool = templates.POSITIVE;
    else if (affinity < -25) pool = templates.NEGATIVE;
    else pool = templates.NEUTRAL;

    return this.selectAndInject(pool, karma);
  }

  /**
   * Generate a whisper message
   */
  static generateWhisperMessage(deity: 'GAMBLER' | 'OUTLAW_KING', karma: any): string {
    const templates = deity === 'GAMBLER' ? GAMBLER_TEMPLATES.WHISPERS : OUTLAW_KING_TEMPLATES.WHISPERS;

    // Determine type based on karma conflict
    const hasConflict = this.detectConflict(karma);
    const affinity = deity === 'GAMBLER' ? karma?.gamblerAffinity : karma?.outlawKingAffinity;

    let pool: string[];
    if (hasConflict) pool = templates.CRYPTIC;
    else if (affinity > 0) pool = templates.GUIDANCE;
    else pool = templates.WARNING;

    return this.selectAndInject(pool, karma);
  }

  /**
   * Generate stranger dialogue
   */
  static generateStrangerDialogue(deity: 'GAMBLER' | 'OUTLAW_KING', karma: any): string {
    const templates = deity === 'GAMBLER' ? GAMBLER_TEMPLATES.STRANGER : OUTLAW_KING_TEMPLATES.STRANGER;

    // Combine greeting + advice + farewell
    const greeting = this.selectAndInject(templates.GREETING, karma);
    const advice = this.selectAndInject(templates.ADVICE, karma);
    const farewell = this.selectAndInject(templates.FAREWELL, karma);

    return `${greeting}\n\n${advice}\n\n${farewell}`;
  }

  /**
   * Generate blessing message
   */
  static generateBlessingMessage(deity: 'GAMBLER' | 'OUTLAW_KING', karma: any): string {
    const pool = deity === 'GAMBLER' ? GAMBLER_TEMPLATES.BLESSINGS : OUTLAW_KING_TEMPLATES.BLESSINGS;
    return this.selectAndInject(pool, karma);
  }

  /**
   * Generate curse message
   */
  static generateCurseMessage(deity: 'GAMBLER' | 'OUTLAW_KING', karma: any): string {
    const pool = deity === 'GAMBLER' ? GAMBLER_TEMPLATES.CURSES : OUTLAW_KING_TEMPLATES.CURSES;
    return this.selectAndInject(pool, karma);
  }

  /**
   * Generate intervention message (called from KarmaService)
   */
  static generateInterventionMessage(
    deity: 'GAMBLER' | 'OUTLAW_KING',
    isBlessing: boolean,
    dimension: string,
    tier: string
  ): string {
    if (isBlessing) {
      return deity === 'GAMBLER'
        ? GAMBLER_TEMPLATES.BLESSINGS[Math.floor(Math.random() * GAMBLER_TEMPLATES.BLESSINGS.length)]
        : OUTLAW_KING_TEMPLATES.BLESSINGS[Math.floor(Math.random() * OUTLAW_KING_TEMPLATES.BLESSINGS.length)];
    } else {
      return deity === 'GAMBLER'
        ? GAMBLER_TEMPLATES.CURSES[Math.floor(Math.random() * GAMBLER_TEMPLATES.CURSES.length)]
        : OUTLAW_KING_TEMPLATES.CURSES[Math.floor(Math.random() * OUTLAW_KING_TEMPLATES.CURSES.length)];
    }
  }

  /**
   * Select random template and inject context
   */
  private static selectAndInject(pool: string[], karma: any): string {
    const template = pool[Math.floor(Math.random() * pool.length)];

    // Replace placeholders with context (minimal - no character data fetching)
    return template
      .replace(/{NAME}/g, 'stranger') // Player name injected at delivery time
      .replace(/{KARMA_TRAIT}/g, this.getDominantTrait(karma));
  }

  private static getDominantTrait(karma: any): string {
    if (!karma?.karma) return 'mysterious';

    const traits = Object.entries(karma.karma);
    let maxTrait = 'balanced';
    let maxValue = 0;

    for (const [trait, value] of traits) {
      const absValue = Math.abs(value as number);
      if (absValue > maxValue) {
        maxValue = absValue;
        maxTrait = trait;
      }
    }

    return maxTrait;
  }

  private static detectConflict(karma: any): boolean {
    if (!karma?.karma) return false;

    const conflicts = [
      ['mercy', 'cruelty'], ['greed', 'charity'], ['justice', 'chaos'],
      ['honor', 'deception'], ['survival', 'loyalty']
    ];

    for (const [a, b] of conflicts) {
      if (Math.abs(karma.karma[a] || 0) >= 30 && Math.abs(karma.karma[b] || 0) >= 30) {
        return true;
      }
    }
    return false;
  }
}
```

---

## PART 5: INTEGRATION & JOBS

### 5.1 Karma Integration Middleware

**File:** `server/src/middleware/karmaTracking.middleware.ts`

**Philosophy:** Hook into existing action flows to record karma events automatically.

```typescript
// karmaTracking.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { KarmaService } from '../services/karma.service';
import logger from '../utils/logger';

// Map of endpoints to karma action types
const KARMA_TRIGGERS: Record<string, { action: string; contextField?: string }> = {
  'POST /api/combat/attack': { action: 'COMBAT_ATTACK', contextField: 'targetId' },
  'POST /api/combat/spare': { action: 'COMBAT_SPARE_ENEMY', contextField: 'targetId' },
  'POST /api/combat/execute': { action: 'COMBAT_EXECUTE_ENEMY', contextField: 'targetId' },
  'POST /api/crime/commit': { action: 'CRIME_COMPLETED', contextField: 'crimeType' },
  'POST /api/npc/help': { action: 'NPC_HELPED_FREE', contextField: 'npcId' },
  'POST /api/npc/betray': { action: 'NPC_BETRAYED', contextField: 'npcId' },
  'POST /api/gang/protect': { action: 'GANG_PROTECTED_MEMBER', contextField: 'memberId' },
  'POST /api/gang/betray': { action: 'GANG_BETRAYED_MEMBER', contextField: 'memberId' },
  'POST /api/shop/donate': { action: 'GAVE_TO_POOR', contextField: 'amount' },
  'POST /api/bounty/turnin': { action: 'TURNED_IN_CRIMINAL', contextField: 'bountyId' },
  'POST /api/duel/accept': { action: 'COMBAT_FAIR_DUEL', contextField: 'duelId' },
};

export const karmaTrackingMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json to intercept successful responses
  res.json = function(body: any) {
    // Only track on successful responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const routeKey = `${req.method} ${req.baseUrl}${req.path}`;
      const trigger = KARMA_TRIGGERS[routeKey];

      if (trigger && req.character?.id) {
        const context = trigger.contextField
          ? String(req.body[trigger.contextField] || body[trigger.contextField] || '')
          : '';

        // Fire and forget - don't block response
        KarmaService.recordAction(req.character.id, trigger.action, context)
          .then(result => {
            if (result.intervention) {
              logger.info(`Divine intervention triggered for ${req.character?.id}`);
              // TODO: Queue notification to player
            }
          })
          .catch(err => logger.error('Karma tracking error:', err));
      }
    }

    return originalJson(body);
  };

  next();
};
```

### 5.2 Deity Evaluation Job

**File:** `server/src/jobs/deityEvaluation.job.ts`

```typescript
// deityEvaluation.job.ts
import { DeityDecisionService } from '../services/deityDecision.service';
import logger from '../utils/logger';

/**
 * Run deity evaluation every 6 hours
 * Checks watched characters and triggers manifestations
 */
export const runDeityEvaluation = async (): Promise<void> => {
  logger.info('Starting deity evaluation job');

  try {
    // Evaluate The Gambler's actions
    await DeityDecisionService.evaluateDeityActions('GAMBLER');

    // Evaluate The Outlaw King's actions
    await DeityDecisionService.evaluateDeityActions('OUTLAW_KING');

    logger.info('Deity evaluation job completed');
  } catch (error) {
    logger.error('Deity evaluation job failed:', error);
  }
};

// Schedule: Every 6 hours
// Cron: 0 */6 * * *
```

### 5.3 Seed Data for Deities

**File:** `server/src/seeds/deities.seed.ts`

```typescript
// deities.seed.ts
import { DeityAgent } from '../models/DeityAgent.model';
import logger from '../utils/logger';

export async function seedDeities(): Promise<void> {
  const existingCount = await DeityAgent.countDocuments();
  if (existingCount >= 2) {
    logger.info('Deities already seeded');
    return;
  }

  const deities = [
    {
      name: 'The Gambler',
      trueName: 'Fortuna Rex',
      archetype: 'ORDER',
      dialogueStyle: 'gambler_cryptic',
      stats: {
        influence: 70,
        patience: 80,
        wrath: 40,
        benevolence: 60
      },
      domains: [
        { name: 'fate', power: 90, playerAffinity: new Map() },
        { name: 'honor', power: 85, playerAffinity: new Map() },
        { name: 'justice', power: 75, playerAffinity: new Map() },
        { name: 'order', power: 80, playerAffinity: new Map() }
      ],
      manifestations: [
        { form: 'dream', description: 'Cards and tables in moonlight', lastUsed: null, cooldownHours: 24 },
        { form: 'stranger', description: 'Weathered card dealer', lastUsed: null, cooldownHours: 72 },
        { form: 'omen', description: 'Lucky/unlucky symbols', lastUsed: null, cooldownHours: 12 },
        { form: 'whisper', description: 'Voice like shuffling cards', lastUsed: null, cooldownHours: 6 }
      ],
      interventionCooldownHours: 168, // 1 week
      currentPhase: 'WATCHING',
      powerLevel: 75
    },
    {
      name: 'The Outlaw King',
      trueName: 'Rex Chaos',
      archetype: 'CHAOS',
      dialogueStyle: 'outlaw_wild',
      stats: {
        influence: 65,
        patience: 30,
        wrath: 80,
        benevolence: 40
      },
      domains: [
        { name: 'chaos', power: 95, playerAffinity: new Map() },
        { name: 'freedom', power: 90, playerAffinity: new Map() },
        { name: 'survival', power: 80, playerAffinity: new Map() },
        { name: 'rebellion', power: 85, playerAffinity: new Map() }
      ],
      manifestations: [
        { form: 'dream', description: 'Wild rides through fire', lastUsed: null, cooldownHours: 24 },
        { form: 'stranger', description: 'Scarred outlaw with crown', lastUsed: null, cooldownHours: 72 },
        { form: 'animal', description: 'Wild horses, crows, wolves', lastUsed: null, cooldownHours: 12 },
        { form: 'phenomenon', description: 'Lightning, fires, broken chains', lastUsed: null, cooldownHours: 6 }
      ],
      interventionCooldownHours: 120, // 5 days (more impulsive)
      currentPhase: 'WATCHING',
      powerLevel: 70
    }
  ];

  await DeityAgent.insertMany(deities);
  logger.info('Seeded 2 deity agents: The Gambler and The Outlaw King');
}
```

---

## PART 6: FRONTEND INTEGRATION

### 6.1 Karma Display Hook

**File:** `client/src/hooks/useKarma.ts`

```typescript
// useKarma.ts
import { useState, useEffect, useCallback } from 'react';
import { karmaService } from '../services/karma.service';

interface KarmaSummary {
  karma: Record<string, number>;
  gamblerAffinity: number;
  outlawKingAffinity: number;
  blessings: any[];
  curses: any[];
  dominantTrait: { trait: string; value: number };
}

export const useKarma = (characterId: string | undefined) => {
  const [karma, setKarma] = useState<KarmaSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKarma = useCallback(async () => {
    if (!characterId) return;

    setLoading(true);
    try {
      const data = await karmaService.getKarmaSummary(characterId);
      setKarma(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch karma');
    } finally {
      setLoading(false);
    }
  }, [characterId]);

  useEffect(() => {
    fetchKarma();
  }, [fetchKarma]);

  return { karma, loading, error, refetch: fetchKarma };
};
```

### 6.2 Divine Manifestation Display

**File:** `client/src/components/divine/DivineManifestationModal.tsx`

```typescript
// DivineManifestationModal.tsx
import React from 'react';

interface DivineManifestationProps {
  manifestation: {
    deityName: string;
    type: string;
    message: string;
    effect?: string;
  } | null;
  onClose: () => void;
}

export const DivineManifestationModal: React.FC<DivineManifestationProps> = ({
  manifestation,
  onClose
}) => {
  if (!manifestation) return null;

  const isGambler = manifestation.deityName === 'GAMBLER';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className={`
        max-w-lg p-8 rounded-lg border-2
        ${isGambler
          ? 'bg-gradient-to-b from-amber-900/90 to-amber-950/90 border-amber-500/50'
          : 'bg-gradient-to-b from-red-900/90 to-red-950/90 border-red-500/50'
        }
      `}>
        {/* Type indicator */}
        <div className="text-center mb-4">
          <span className={`
            text-xs uppercase tracking-widest
            ${isGambler ? 'text-amber-400' : 'text-red-400'}
          `}>
            {manifestation.type}
          </span>
        </div>

        {/* Message */}
        <p className={`
          text-lg italic leading-relaxed text-center
          ${isGambler ? 'text-amber-100' : 'text-red-100'}
        `}>
          "{manifestation.message}"
        </p>

        {/* Effect if present */}
        {manifestation.effect && (
          <div className={`
            mt-4 p-3 rounded text-sm text-center
            ${isGambler ? 'bg-amber-800/50' : 'bg-red-800/50'}
          `}>
            <strong>Effect:</strong> {manifestation.effect}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className={`
            mt-6 w-full py-2 rounded
            ${isGambler
              ? 'bg-amber-700 hover:bg-amber-600'
              : 'bg-red-700 hover:bg-red-600'
            }
          `}
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};
```

---

## PART 7: IMPLEMENTATION PHASES

### Phase 1: Core Models (8-10 hours)
1. Create `DeityAgent.model.ts`
2. Create `CharacterKarma.model.ts`
3. Create `DivineManifestation.model.ts`
4. Add indexes for efficient queries
5. Create seed data for both deities

### Phase 2: Karma Service (12-15 hours)
6. Implement `karma.service.ts` with all action rules
7. Implement deity affinity calculations
8. Implement threshold detection
9. Implement blessing/curse application
10. Write unit tests for karma calculations

### Phase 3: Deity AI (10-12 hours)
11. Implement `deityDecision.service.ts`
12. Implement evaluation loop
13. Implement manifestation planning
14. Add stranger manifestation logic
15. Write tests for decision logic

### Phase 4: Dialogue Service (8-10 hours)
16. Implement `deityDialogue.service.ts`
17. Create all Gambler templates (50+)
18. Create all Outlaw King templates (50+)
19. Implement context injection
20. Test dialogue variety

### Phase 5: Integration (10-12 hours)
21. Create karma tracking middleware
22. Hook into crime, combat, social systems
23. Create deity evaluation job
24. Add to job scheduler
25. Integration testing

### Phase 6: Frontend (8-10 hours)
26. Create `useKarma` hook
27. Create karma display component
28. Create manifestation modal
29. Add to character profile
30. Add notification integration

---

## FILES TO CREATE

### Server (New)
```
server/src/models/DeityAgent.model.ts
server/src/models/CharacterKarma.model.ts
server/src/models/DivineManifestation.model.ts
server/src/services/karma.service.ts
server/src/services/deityDecision.service.ts
server/src/services/deityDialogue.service.ts
server/src/middleware/karmaTracking.middleware.ts
server/src/jobs/deityEvaluation.job.ts
server/src/seeds/deities.seed.ts
server/src/routes/karma.routes.ts
server/src/controllers/karma.controller.ts
```

### Client (New)
```
client/src/hooks/useKarma.ts
client/src/services/karma.service.ts
client/src/components/divine/DivineManifestationModal.tsx
client/src/components/divine/KarmaDisplay.tsx
client/src/components/divine/BlessingCurseIndicator.tsx
```

### Tests
```
server/tests/unit/karma.service.test.ts
server/tests/unit/deityDecision.service.test.ts
server/tests/integration/karma.integration.test.ts
```

---

## TOTAL EFFORT ESTIMATE

| Phase | Hours |
|-------|-------|
| Phase 1: Core Models | 8-10 |
| Phase 2: Karma Service | 12-15 |
| Phase 3: Deity AI | 10-12 |
| Phase 4: Dialogue | 8-10 |
| Phase 5: Integration | 10-12 |
| Phase 6: Frontend | 8-10 |
| **TOTAL** | **56-69 hours** |

---

## SUCCESS CRITERIA

1. **Karma Tracking:** Every significant action updates character karma
2. **Deity Awareness:** Both deities track characters with significant karma
3. **Intervention Logic:** Thresholds trigger appropriate responses
4. **Dialogue Quality:** 100+ unique templates feel varied and atmospheric
5. **Player Impact:** Blessings/curses have meaningful game effects
6. **Mystery Preserved:** Players never directly learn deity identities
7. **Performance:** No noticeable impact on API latency
