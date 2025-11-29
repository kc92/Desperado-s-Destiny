/**
 * Bounty Hunter NPC Data
 *
 * Contains all 10 unique bounty hunter NPCs who hunt wanted criminals
 * across the Sangre Territory
 */

import {
  BountyHunter,
  HuntingMethod,
  HuntingPreference,
  HireableBy,
  BountyFaction,
} from '@desperados/shared';

/**
 * All 10 Bounty Hunters
 */
export const BOUNTY_HUNTERS: BountyHunter[] = [
  // ===========================================
  // 1. "IRON" JACK HAWKINS - THE LEGENDARY
  // ===========================================
  {
    id: 'hunter_iron_jack',
    name: '"Iron" Jack Hawkins',
    title: 'The Legendary Hunter',
    level: 35,
    specialty: 'Never fails - 50+ captures, only hunts the most dangerous',
    method: HuntingMethod.OVERWHELMING_FORCE,
    personality: 'Cold, professional, respects worthy prey',
    faction: 'neutral',
    territory: [
      'all', // Entire Sangre Territory
    ],
    backstory:
      'Iron Jack Hawkins has been hunting wanted men for 30 years. With over 50 successful captures and zero failures, he is the most feared bounty hunter in the West. He only takes contracts on the most dangerous criminals - those with bounties of 5000 gold or more. Cold and methodical, Jack approaches bounty hunting like a military campaign. He tracks his prey with infinite patience, then strikes with overwhelming force when the moment is right. Those who face him rarely survive to tell the tale.',
    huntingBehavior: {
      minBountyToHunt: 5000,
      preferredMethod: HuntingMethod.OVERWHELMING_FORCE,
      lethality: HuntingPreference.EITHER,
      trackingAbility: 10,
      patrol: {
        territories: ['all'],
        movementSpeed: 3,
        pursueBehavior: 'active',
      },
      spawnTrigger: 'high_bounty',
      escalationRate: 12, // 12 hours to find target
      specialConditions: ['Only spawns for 5000+ gold bounties', 'Brings backup posse'],
    },
    stats: {
      health: 350,
      damage: 45,
      accuracy: 95,
      defense: 40,
      critChance: 30,
      dodgeChance: 15,
      specialAbilities: [
        'Tactical Superiority: +20% damage when fighting with advantage',
        'Unbreakable Will: Immune to intimidation',
        'Perfect Shot: First shot always critical',
        'Veteran Hunter: +50% tracking speed',
      ],
    },
    dialogue: {
      encounterLines: [
        "I've been tracking you for a week. Time to come in, dead or alive.",
        'You made it further than most. I respect that. But this ends now.',
        "I'm Iron Jack Hawkins. You know what that means.",
      ],
      negotiationLines: [
        "I don't negotiate. Surrender or fight - your choice.",
        'The only thing I want from you is compliance or your corpse.',
        'Thirty years, fifty captures, zero failures. You won\'t be my first.',
      ],
      refusalLines: [
        'I expected as much. Let\'s finish this.',
        'Wrong answer. Draw when ready.',
      ],
      victoryLines: [
        'Fifty-one. Add another to the list.',
        "You fought well. That's something.",
        'The law always wins in the end.',
      ],
      defeatLines: [
        'Impossible... my record...',
        'You... you actually beat me...',
        'Tell them... Iron Jack... finally fell...',
      ],
    },
    rewards: {
      goldMin: 500,
      goldMax: 1000,
      xpReward: 5000,
      reputationGain: 100,
      possibleLoot: [
        { name: "Iron Jack's Legendary Rifle", chance: 0.1, rarity: 'legendary' },
        { name: 'Master Hunter Badge', chance: 0.3, rarity: 'epic' },
        { name: 'Tactical Combat Manual', chance: 0.4, rarity: 'rare' },
        { name: 'Professional Tracking Kit', chance: 0.6, rarity: 'rare' },
      ],
      firstDefeatReward: {
        item: "Iron Jack's Unbroken Record Trophy",
        rarity: 'legendary',
      },
    },
    hireConfig: {
      hireableBy: HireableBy.NOT_HIREABLE,
      baseCost: 0,
      costMultiplier: 0,
      successRate: 95,
      hireCooldown: 0,
    },
    isActive: true,
  },

  // ===========================================
  // 2. THE COMANCHE TWINS - MASTER TRACKERS
  // ===========================================
  {
    id: 'hunter_comanche_twins',
    name: 'The Comanche Twins',
    title: 'Silent Death',
    level: 28,
    specialty: 'Native trackers who never lose a trail',
    method: HuntingMethod.TRACKING,
    personality: 'Silent, methodical, communicate without words',
    faction: BountyFaction.NAHI_COALITION,
    territory: ['wilderness', 'mountains', 'canyons', 'forests'],
    backstory:
      'Brothers raised in the old ways of the Comanche, Tall Shadow and Swift Wind work in perfect synchronization. They can track a man across solid rock and through rivers. Once they have your scent, escape is impossible. They communicate without speaking, flanking their prey with supernatural coordination. The twins prefer to capture their targets alive, but will not hesitate to kill if necessary. Rain, snow, or darkness - nothing stops their pursuit.',
    huntingBehavior: {
      minBountyToHunt: 500,
      preferredMethod: HuntingMethod.TRACKING,
      lethality: HuntingPreference.EITHER,
      trackingAbility: 10,
      patrol: {
        territories: ['wilderness', 'mountains', 'canyons', 'forests'],
        movementSpeed: 4,
        pursueBehavior: 'active',
      },
      spawnTrigger: 'always',
      escalationRate: 8, // 8 hours to find target
      specialConditions: [
        'Can track in any weather',
        'Always fight as a duo',
        'Wilderness specialists',
      ],
    },
    stats: {
      health: 200, // Each twin
      damage: 30,
      accuracy: 90,
      defense: 25,
      critChance: 20,
      dodgeChance: 35,
      specialAbilities: [
        'Twin Coordination: Fight as two enemies',
        'Perfect Tracking: Ignore weather penalties',
        'Ambush Masters: +30% damage from stealth',
        'Flanking: Always attack from two sides',
      ],
    },
    dialogue: {
      encounterLines: [
        '*The twins emerge silently from opposite sides*',
        '*Tall Shadow points at you. Swift Wind nods.*',
        '*No words. Only the sound of arrows being nocked.*',
      ],
      negotiationLines: [
        '*They exchange a glance. Tall Shadow shakes his head.*',
        '*Swift Wind makes a gesture: Come peacefully or die.*',
      ],
      payoffLines: [
        '*The twins confer silently. Tall Shadow holds out his hand.*',
        '*Swift Wind counts the gold. They step aside.*',
      ],
      victoryLines: [
        '*Tall Shadow binds your hands. Swift Wind whistles for their horses.*',
        '*The twins exchange satisfied nods.*',
      ],
      defeatLines: [
        '*Tall Shadow: "Brother..." *collapses**',
        '*Swift Wind tries to reach his brother, falls*',
      ],
    },
    rewards: {
      goldMin: 300,
      goldMax: 600,
      xpReward: 3000,
      reputationGain: 75,
      possibleLoot: [
        { name: 'Twin Tomahawks', chance: 0.2, rarity: 'epic' },
        { name: 'Master Tracker Kit', chance: 0.4, rarity: 'rare' },
        { name: 'Wilderness Cloak', chance: 0.3, rarity: 'rare' },
        { name: 'Silent Moccasins', chance: 0.5, rarity: 'uncommon' },
      ],
    },
    hireConfig: {
      hireableBy: HireableBy.FACTION_ONLY,
      requiredFaction: BountyFaction.NAHI_COALITION,
      baseCost: 300,
      costMultiplier: 0.5,
      successRate: 85,
      hireCooldown: 72,
      minTrustRequired: 50,
    },
    isActive: true,
  },

  // ===========================================
  // 3. "BLOODY" MARY CATHERINE O'BRIEN - SNIPER
  // ===========================================
  {
    id: 'hunter_bloody_mary',
    name: '"Bloody" Mary Catherine O\'Brien',
    title: 'The Widow\'s Revenge',
    level: 30,
    specialty: 'Brings them in dead more often than alive',
    method: HuntingMethod.SNIPER,
    personality: 'Traumatized war widow, cold anger',
    faction: BountyFaction.SETTLER_ALLIANCE,
    territory: ['canyons', 'badlands', 'open_plains'],
    backstory:
      'Mary lost her husband and two sons to outlaws during the border wars. Since that day, she has dedicated her life to killing wanted men. An expert marksman, she can kill a man from 500 yards away. Most of her targets never see her coming - just a distant crack of a rifle and it\'s over. She rarely brings them in alive, claiming "accidents" during capture. The law looks the other way - dead or alive, the bounty gets paid. Sometimes only half, but Mary doesn\'t care about the money. She cares about revenge.',
    huntingBehavior: {
      minBountyToHunt: 300,
      preferredMethod: HuntingMethod.SNIPER,
      lethality: HuntingPreference.LETHAL,
      trackingAbility: 7,
      patrol: {
        territories: ['canyons', 'badlands', 'open_plains'],
        movementSpeed: 2,
        pursueBehavior: 'passive', // Sets up ambush points
      },
      spawnTrigger: 'always',
      escalationRate: 16, // 16 hours - slower but deadly
      specialConditions: [
        '50% chance to kill target instead of capture (half bounty)',
        'Long-range specialist',
        'Prefers open terrain',
      ],
    },
    stats: {
      health: 180,
      damage: 60, // High damage, long range
      accuracy: 98,
      defense: 20,
      critChance: 45,
      dodgeChance: 10,
      specialAbilities: [
        'Sniper Shot: 500 yard range, massive damage',
        'First Blood: Opening shot deals triple damage',
        'Widow\'s Wrath: +20% damage vs male targets',
        'Patience: Can wait indefinitely for perfect shot',
      ],
    },
    dialogue: {
      encounterLines: [
        'I see you through my scope. Say your prayers.',
        'For my husband. For my boys. This is justice.',
        'You should have stayed hiding, outlaw.',
      ],
      negotiationLines: [
        'No amount of gold brings back the dead.',
        'The only negotiation is whether it hurts.',
        'They begged too. I didn\'t listen then either.',
      ],
      refusalLines: [
        '*racks rifle* Your funeral.',
        'I was hoping you\'d say that.',
      ],
      victoryLines: [
        'Sleep well, you bastard.',
        '*Whispers* For you, Thomas. For you, James and William.',
        'One less monster in the world.',
      ],
      defeatLines: [
        'Thomas... I\'ll see you soon...',
        'Boys... mama\'s coming home...',
        'At least... it\'s over...',
      ],
    },
    rewards: {
      goldMin: 250,
      goldMax: 500,
      xpReward: 3500,
      reputationGain: 60,
      possibleLoot: [
        { name: "Widow's Rifle", chance: 0.15, rarity: 'epic' },
        { name: 'Precision Scope', chance: 0.3, rarity: 'rare' },
        { name: 'Long Range Ammunition', chance: 0.5, rarity: 'uncommon' },
        { name: 'Family Locket (Quest Item)', chance: 1.0, rarity: 'rare' },
      ],
    },
    hireConfig: {
      hireableBy: HireableBy.LAWFUL,
      baseCost: 200,
      costMultiplier: 0.4,
      successRate: 75, // 50% kill, 25% capture
      hireCooldown: 48,
    },
    isActive: true,
  },

  // ===========================================
  // 4. MARSHAL'S MEN - OFFICIAL POSSE (4 MEMBERS)
  // ===========================================
  {
    id: 'hunter_marshals_men',
    name: "Marshal's Men",
    title: 'The Federal Posse',
    level: 20,
    specialty: 'Official law enforcement bounty hunters',
    method: HuntingMethod.OVERWHELMING_FORCE,
    personality: 'By-the-book, announce themselves',
    faction: BountyFaction.SETTLER_ALLIANCE,
    territory: ['towns', 'settlements', 'settler_alliance_territory'],
    backstory:
      'A four-man federal posse authorized by the territorial marshal. Unlike freelance bounty hunters, these lawmen follow proper procedure - they announce themselves, give you a chance to surrender, and prefer to bring criminals in for proper trial. Led by Deputy Frank Stone, the posse includes "Shotgun" Reeves, Young Tommy Harris, and the tracker known only as Calhoun. They\'re not the deadliest hunters, but they have legal authority and the backing of the federal government.',
    huntingBehavior: {
      minBountyToHunt: 200,
      preferredMethod: HuntingMethod.OVERWHELMING_FORCE,
      lethality: HuntingPreference.NON_LETHAL,
      trackingAbility: 6,
      patrol: {
        territories: ['towns', 'settlements', 'settler_alliance_territory'],
        movementSpeed: 2,
        pursueBehavior: 'territorial',
        route: [
          'red_gulch',
          'iron_springs',
          'fort_ashford',
          'copper_trail',
          'settlers_rest',
        ],
      },
      spawnTrigger: 'territory_only',
      escalationRate: 24, // 24 hours - official procedures take time
      specialConditions: [
        'Only hunt in Settler Alliance territory',
        'Will accept surrender without fight',
        'Fight as group of 4',
        'Proper legal arrest',
      ],
    },
    stats: {
      health: 150, // Each member
      damage: 25,
      accuracy: 75,
      defense: 30,
      critChance: 10,
      dodgeChance: 10,
      specialAbilities: [
        'Legal Authority: Can reduce jail time',
        'Four Against One: Fight as 4 enemies',
        'Coordinated Fire: Focused attacks',
        'Surrender Option: Accept peaceful capture',
      ],
    },
    dialogue: {
      encounterLines: [
        'Federal lawmen! You are under arrest! Surrender peacefully!',
        'We have a warrant for your arrest. Come quietly or we take you by force.',
        '*Deputy Stone* By order of the Territorial Marshal, you are hereby apprehended!',
      ],
      negotiationLines: [
        'Surrender now and we guarantee a fair trial.',
        'Resist and we will use all necessary force.',
        'We\'re lawmen, not executioners. Give yourself up.',
      ],
      payoffLines: [
        '*Stone shakes his head* We don\'t take bribes. You\'re under arrest.',
        'That\'s a federal offense you\'re proposing, friend.',
      ],
      refusalLines: [
        '*Stone signals the men* Take him down, boys!',
        'You made your choice. Men, open fire!',
      ],
      victoryLines: [
        'You have the right to a trial by jury.',
        '*Calhoun* Got him, boss.',
        '*Stone* Another one for the courts.',
      ],
      defeatLines: [
        '*Stone* Fall back! FALL BACK!',
        '*Reeves* He\'s too strong!',
        '*Tommy* Deputy down! Deputy down!',
      ],
    },
    rewards: {
      goldMin: 200,
      goldMax: 400,
      xpReward: 2000,
      reputationGain: 80, // High rep for defeating lawmen
      possibleLoot: [
        { name: 'Federal Badge', chance: 0.8, rarity: 'uncommon' },
        { name: 'Official Warrant (Collectible)', chance: 0.5, rarity: 'common' },
        { name: 'Standard Issue Revolver', chance: 0.4, rarity: 'common' },
        { name: 'Marshal\'s Recommendation Letter', chance: 0.1, rarity: 'rare' },
      ],
    },
    hireConfig: {
      hireableBy: HireableBy.NOT_HIREABLE,
      baseCost: 0,
      costMultiplier: 0,
      successRate: 60,
      hireCooldown: 0,
    },
    isActive: true,
  },

  // ===========================================
  // 5. "EL CAZADOR" DIEGO VASQUEZ - FRONTERA HUNTER
  // ===========================================
  {
    id: 'hunter_el_cazador',
    name: '"El Cazador" Diego Vasquez',
    title: 'The Outlaw King\'s Hound',
    level: 25,
    specialty: 'Hunts for The Frontera',
    method: HuntingMethod.INFILTRATION,
    personality: 'Charming, ruthless, takes contracts from El Rey',
    faction: BountyFaction.FRONTERA,
    territory: ['frontera', 'border_towns', 'outlaw_territories'],
    backstory:
      'Diego Vasquez is El Rey Martinez\'s personal bounty hunter. Charming and handsome, he uses social manipulation and disguise to get close to his targets. He\'ll befriend you, drink with you, even seduce you - all while planning your capture or death. Diego specializes in hunting enemies of The Frontera - rival gang leaders, traitors, and those who cross El Rey. He\'s not above using poison, betrayal, or assassination. For the right price, he\'ll hunt anyone. For El Rey, he hunts for free.',
    huntingBehavior: {
      minBountyToHunt: 100,
      preferredMethod: HuntingMethod.INFILTRATION,
      lethality: HuntingPreference.DEPENDS,
      trackingAbility: 5,
      patrol: {
        territories: ['frontera', 'border_towns', 'outlaw_territories'],
        movementSpeed: 3,
        pursueBehavior: 'active',
      },
      spawnTrigger: 'specific_crimes',
      escalationRate: 20, // 20 hours - infiltration takes time
      specialConditions: [
        'Hunts Frontera enemies for free',
        'Uses disguises and social manipulation',
        'May use poison',
        'Can be bribed (sometimes)',
      ],
    },
    stats: {
      health: 200,
      damage: 35,
      accuracy: 80,
      defense: 25,
      critChance: 25,
      dodgeChance: 30,
      specialAbilities: [
        'Betrayal Strike: First attack while disguised is critical',
        'Poison Master: Attacks may inflict DOT',
        'Silver Tongue: Can attempt negotiation mid-combat',
        'Frontera Connections: Calls backup if losing',
      ],
    },
    dialogue: {
      encounterLines: [
        '*Tips hat with a charming smile* Ah, mi amigo. We need to talk.',
        'You know, I actually like you. Shame about the bounty.',
        'Nothing personal, compadre. Just business for El Rey.',
      ],
      negotiationLines: [
        'Perhaps we can come to an... arrangement?',
        'I am a businessman. Make me an offer.',
        'If the price is right, I forget I ever saw you.',
      ],
      payoffLines: [
        '*Counts gold, smiles* Pleasure doing business. Until next time.',
        'You are wise, my friend. Go now, before I change my mind.',
      ],
      refusalLines: [
        '*Sighs* I was hoping you\'d be reasonable.',
        'Pity. I really did like you. *Draws weapon*',
      ],
      victoryLines: [
        'Como siempre, El Cazador succeeds.',
        '*Wipes blood from blade* A necessary evil, no?',
        'El Rey will be pleased.',
      ],
      defeatLines: [
        'Impossible... I never lose...',
        'Tell El Rey... I\'m sorry...',
        'You... are better than I thought...',
      ],
    },
    rewards: {
      goldMin: 200,
      goldMax: 450,
      xpReward: 2500,
      reputationGain: 50,
      possibleLoot: [
        { name: 'Disguise Kit', chance: 0.3, rarity: 'rare' },
        { name: 'Poison Vials', chance: 0.4, rarity: 'uncommon' },
        { name: 'El Rey\'s Contract', chance: 0.5, rarity: 'uncommon' },
        { name: 'Silver-Tongued Charm', chance: 0.2, rarity: 'rare' },
      ],
    },
    hireConfig: {
      hireableBy: HireableBy.ANYONE,
      baseCost: 250,
      costMultiplier: 0.6,
      successRate: 70,
      hireCooldown: 48,
    },
    isActive: true,
  },

  // ===========================================
  // 6. OLD GRANDFATHER - COALITION SPIRIT HUNTER
  // ===========================================
  {
    id: 'hunter_old_grandfather',
    name: 'Old Grandfather',
    title: 'The Spirit-Guided',
    level: 32,
    specialty: 'Spirit-guided supernatural tracking',
    method: HuntingMethod.SUPERNATURAL,
    personality: 'Ancient, speaks in prophecies',
    faction: BountyFaction.NAHI_COALITION,
    territory: ['nahi_coalition_lands', 'spirit_springs', 'sacred_sites'],
    backstory:
      'No one knows Old Grandfather\'s true age. Some say he walked these lands before the settlers came. A powerful shaman, he hunts those who commit crimes against the spirit world and the Coalition. He doesn\'t track with eyes or signs - he follows the spiritual stains left by evil deeds. Through vision quests and communion with ancestors, he can sense a criminal\'s location across vast distances. Fighting him is like fighting nature itself. The spirits guide his hand and warn him of danger.',
    huntingBehavior: {
      minBountyToHunt: 400,
      preferredMethod: HuntingMethod.SUPERNATURAL,
      lethality: HuntingPreference.EITHER,
      trackingAbility: 9,
      patrol: {
        territories: ['nahi_coalition_lands', 'spirit_springs', 'sacred_sites'],
        movementSpeed: 1, // Slow physical movement
        pursueBehavior: 'passive', // Lets spirits guide him
      },
      spawnTrigger: 'supernatural',
      escalationRate: 6, // 6 hours - spirits find you quickly
      specialConditions: [
        'Can sense spiritual crimes',
        'Tracks through visions',
        'May spare those who show remorse',
        'Supernatural abilities',
      ],
    },
    stats: {
      health: 250,
      damage: 40,
      accuracy: 85,
      defense: 35,
      critChance: 20,
      dodgeChance: 25,
      specialAbilities: [
        'Spirit Vision: Knows your location always',
        'Ancestral Protection: Reduced damage from crits',
        'Nature\'s Wrath: Calls animal allies',
        'Prophecy: Can predict your actions',
      ],
    },
    dialogue: {
      encounterLines: [
        'The spirits whispered your name three moons ago. I have been waiting.',
        '*Studies you with ancient eyes* The path you walk is stained with blood.',
        'The ancestors demand justice for your crimes against the sacred.',
      ],
      negotiationLines: [
        'The spirits do not bargain. Neither do I.',
        'Your gold means nothing to the dead you have wronged.',
        'Show true remorse, and perhaps the ancestors will show mercy.',
      ],
      payoffLines: [
        '*Shakes head slowly* The spirits reject your offering.',
      ],
      refusalLines: [
        'So be it. The ancestors have judged you.',
        '*Raises staff* May your spirit find peace in the next world.',
      ],
      victoryLines: [
        'The spirits are satisfied.',
        'Your journey in this world ends. Another begins.',
        '*Whispers prayer in ancient tongue*',
      ],
      defeatLines: [
        'Impossible... the spirits said...',
        'Perhaps... this too... was meant to be...',
        '*Smiles peacefully* I go to join the ancestors...',
      ],
    },
    rewards: {
      goldMin: 300,
      goldMax: 600,
      xpReward: 4000,
      reputationGain: 90,
      possibleLoot: [
        { name: 'Spirit-Blessed Staff', chance: 0.15, rarity: 'epic' },
        { name: 'Ancestral Charm', chance: 0.3, rarity: 'rare' },
        { name: 'Vision Quest Herbs', chance: 0.4, rarity: 'uncommon' },
        { name: 'Ancient Prophecy Scroll', chance: 0.2, rarity: 'rare' },
      ],
    },
    hireConfig: {
      hireableBy: HireableBy.FACTION_ONLY,
      requiredFaction: BountyFaction.NAHI_COALITION,
      baseCost: 400,
      costMultiplier: 0.3,
      successRate: 80,
      hireCooldown: 168, // 1 week - needs time for visions
      minTrustRequired: 75,
    },
    isActive: true,
  },

  // ===========================================
  // 7. "COPPER" KATE REYNOLDS - THE PRAGMATIST
  // ===========================================
  {
    id: 'hunter_copper_kate',
    name: '"Copper" Kate Reynolds',
    title: 'The Pragmatic Hunter',
    level: 22,
    specialty: 'Catches them alive for maximum bounty',
    method: HuntingMethod.TRACKING,
    personality: 'Pragmatic, business-minded, fair',
    faction: 'neutral',
    territory: ['towns', 'settlements', 'trade_routes'],
    backstory:
      'Kate Reynolds is a pragmatic businesswoman who sees bounty hunting as a profession, not a crusade. She always brings her targets in alive because dead bounties pay half. Using clever traps, non-lethal weapons, and excellent negotiation skills, she has a perfect record of live captures. Kate is willing to negotiate - if you can pay more than the bounty is worth, she\'ll let you go. No hard feelings, just business. She\'s earned respect from both lawmen and outlaws for being fair and keeping her word.',
    huntingBehavior: {
      minBountyToHunt: 100,
      preferredMethod: HuntingMethod.TRACKING,
      lethality: HuntingPreference.NON_LETHAL,
      trackingAbility: 7,
      patrol: {
        territories: ['towns', 'settlements', 'trade_routes'],
        movementSpeed: 3,
        pursueBehavior: 'active',
      },
      spawnTrigger: 'always',
      escalationRate: 18, // 18 hours
      specialConditions: [
        'Always captures alive',
        'Will negotiate for payment > bounty',
        'Keeps her word always',
        'Uses non-lethal weapons',
      ],
    },
    stats: {
      health: 180,
      damage: 20, // Low damage, non-lethal
      accuracy: 85,
      defense: 30,
      critChance: 15,
      dodgeChance: 25,
      specialAbilities: [
        'Net Throw: Immobilize target',
        'Knockout Shot: Non-lethal takedown',
        'Business Acumen: Better negotiation',
        'Trap Master: Sets traps that disable, not kill',
      ],
    },
    dialogue: {
      encounterLines: [
        'Kate Reynolds, bounty hunter. Let\'s keep this professional.',
        'I\'ve got a contract on you. We can do this easy or hard.',
        'Nothing personal, friend. Just business.',
      ],
      negotiationLines: [
        'Alright, let\'s talk numbers. What\'s this worth to you?',
        'The bounty is X gold. Beat that, and we both walk away happy.',
        'I\'m a businesswoman. Make me a better offer.',
      ],
      payoffLines: [
        '*Counts gold carefully* Pleasure doing business. You never saw me.',
        'Smart choice. I\'ll tell them you got away. No one needs to know.',
        'I keep my word. Go on, get out of here.',
      ],
      refusalLines: [
        'Your choice. Don\'t say I didn\'t give you the option.',
        '*Sighs* Alright then, let\'s get this over with.',
      ],
      victoryLines: [
        '*Binds your hands* Nothing personal. Just collecting what I\'m owed.',
        'You\'ll get a fair trial. That\'s more than some give.',
        'Another successful capture. All in a day\'s work.',
      ],
      defeatLines: [
        'Damn... miscalculated...',
        'Well played... maybe I should\'ve taken... that offer...',
        'No hard feelings... right?',
      ],
    },
    rewards: {
      goldMin: 150,
      goldMax: 300,
      xpReward: 1800,
      reputationGain: 40,
      possibleLoot: [
        { name: 'Capture Net', chance: 0.3, rarity: 'uncommon' },
        { name: 'Non-Lethal Rounds', chance: 0.4, rarity: 'common' },
        { name: 'Business Ledger', chance: 0.3, rarity: 'uncommon' },
        { name: 'Negotiator\'s Guide', chance: 0.2, rarity: 'rare' },
      ],
    },
    hireConfig: {
      hireableBy: HireableBy.ANYONE,
      baseCost: 150,
      costMultiplier: 0.7,
      successRate: 75,
      hireCooldown: 24,
    },
    isActive: true,
  },

  // ===========================================
  // 8. THE HELLHOUND - SUPERNATURAL HORROR
  // ===========================================
  {
    id: 'hunter_hellhound',
    name: 'The Hellhound',
    title: 'The Scar\'s Guardian',
    level: 38,
    specialty: 'Hunts near The Scar',
    method: HuntingMethod.SUPERNATURAL,
    personality: 'May not be entirely human',
    faction: 'supernatural',
    territory: ['the_scar', 'cursed_lands', 'supernatural_sites'],
    backstory:
      'No one knows what The Hellhound truly is. Some say it\'s a man cursed by The Scar. Others claim it\'s a demon given physical form. What is known: it appears when someone commits supernatural crimes or enters The Scar\'s forbidden zones. Taller than any man, wreathed in shadow, with eyes that burn red in the darkness. It hunts with preternatural speed and strength. Bullets seem to pass through it. Those it catches are found torn apart. The only escape is to flee The Scar\'s territory. The Hellhound never pursues beyond its domain.',
    huntingBehavior: {
      minBountyToHunt: 0, // Doesn't care about bounties
      preferredMethod: HuntingMethod.SUPERNATURAL,
      lethality: HuntingPreference.LETHAL,
      trackingAbility: 10,
      patrol: {
        territories: ['the_scar', 'cursed_lands', 'supernatural_sites'],
        movementSpeed: 5, // Supernaturally fast
        pursueBehavior: 'territorial', // Stays in cursed lands
      },
      spawnTrigger: 'supernatural',
      escalationRate: 4, // 4 hours - finds you quickly
      specialConditions: [
        'Only hunts in cursed territories',
        'Triggered by supernatural crimes',
        'Cannot be negotiated with',
        'Cannot leave its territory',
      ],
    },
    stats: {
      health: 400,
      damage: 55,
      accuracy: 90,
      defense: 45,
      critChance: 40,
      dodgeChance: 30,
      specialAbilities: [
        'Shadow Form: Reduced damage from normal weapons',
        'Terror Aura: Reduced player accuracy',
        'Rending Claws: Bleed damage',
        'Supernatural Speed: Multiple attacks',
        'Cursed Territory: Stronger in The Scar',
      ],
    },
    dialogue: {
      encounterLines: [
        '*Inhuman growl echoes from the shadows*',
        '*Red eyes appear in the darkness, burning with hunger*',
        '*A voice like grinding stone* YOU... DO... NOT... BELONG...',
      ],
      negotiationLines: [
        '*The creature tilts its head, considering, then snarls*',
        '*Words seem meaningless to this thing*',
      ],
      refusalLines: [
        '*The Hellhound lunges with supernatural speed*',
      ],
      victoryLines: [
        '*Stands over your broken body, then fades into shadow*',
        '*Howl of triumph echoes across The Scar*',
      ],
      defeatLines: [
        '*Shrieks in pain and rage*',
        '*Dissolves into black smoke*',
        '*With dying breath* CURSSSE... YOOOOU...',
      ],
    },
    rewards: {
      goldMin: 400,
      goldMax: 800,
      xpReward: 6000,
      reputationGain: 150,
      possibleLoot: [
        { name: 'Scar-Touched Artifact', chance: 0.2, rarity: 'legendary' },
        { name: 'Shadow Essence', chance: 0.3, rarity: 'epic' },
        { name: 'Cursed Fang', chance: 0.4, rarity: 'rare' },
        { name: 'Dark Pelt Fragment', chance: 0.5, rarity: 'uncommon' },
      ],
      firstDefeatReward: {
        item: 'Hellhound\'s Heart (Supernatural Item)',
        rarity: 'legendary',
      },
    },
    hireConfig: {
      hireableBy: HireableBy.NOT_HIREABLE,
      baseCost: 0,
      costMultiplier: 0,
      successRate: 90,
      hireCooldown: 0,
    },
    isActive: true,
  },

  // ===========================================
  // 9. "GENTLEMAN" JAMES WORTHINGTON III
  // ===========================================
  {
    id: 'hunter_gentleman_james',
    name: '"Gentleman" James Worthington III',
    title: 'The Social Hunter',
    level: 18,
    specialty: 'Hunts wealthy criminals through social pressure',
    method: HuntingMethod.INFILTRATION,
    personality: 'Aristocratic, sophisticated',
    faction: BountyFaction.SETTLER_ALLIANCE,
    territory: ['high_society', 'casinos', 'luxury_hotels', 'upper_class'],
    backstory:
      'James Worthington III is an aristocrat from back East who specializes in hunting white-collar criminals - embezzlers, con artists, corrupt politicians. He doesn\'t use violence; he uses social manipulation, legal pressure, and financial leverage. He\'ll ruin your reputation, freeze your assets, and turn your friends against you until you have no choice but to surrender. While not physically dangerous, he can destroy your life without firing a single shot. He only operates in high society and refuses to dirty his hands with "common criminals."',
    huntingBehavior: {
      minBountyToHunt: 500,
      preferredMethod: HuntingMethod.INFILTRATION,
      lethality: HuntingPreference.NON_LETHAL,
      trackingAbility: 4,
      patrol: {
        territories: ['high_society', 'casinos', 'luxury_hotels'],
        movementSpeed: 1,
        pursueBehavior: 'passive',
      },
      spawnTrigger: 'specific_crimes',
      escalationRate: 48, // 48 hours - social destruction takes time
      specialConditions: [
        'Only hunts wealthy criminals',
        'Uses legal and social pressure',
        'Avoids physical confrontation',
        'Can freeze your gold',
      ],
    },
    stats: {
      health: 120, // Very low combat stats
      damage: 15,
      accuracy: 60,
      defense: 15,
      critChance: 5,
      dodgeChance: 20,
      specialAbilities: [
        'Social Ruin: Reduces reputation',
        'Legal Freeze: Temporarily locks gold',
        'High Society: Calls guards if threatened',
        'Bribe Resistance: Immune to monetary persuasion',
      ],
    },
    dialogue: {
      encounterLines: [
        '*Adjusts monocle* Good evening. I believe you have something that belongs to my client.',
        'A word in private, if you please. We have... matters to discuss.',
        'I say, old chap, this needn\'t be unpleasant.',
      ],
      negotiationLines: [
        'I\'m afraid your assets have been frozen pending investigation.',
        'The law is on my side, dear fellow. Surrender gracefully.',
        'You can come quietly, or I can ruin everything you hold dear.',
      ],
      payoffLines: [
        'I don\'t accept bribes. I have standards.',
        'Your money is worthless when I can simply take it legally.',
      ],
      refusalLines: [
        '*Sighs* How barbaric. Guards! GUARDS!',
        'Very well. I shall destroy you the civilized way.',
      ],
      victoryLines: [
        'Another criminal brought to justice. Well done, constable.',
        '*Dusts off suit* Distasteful business, but necessary.',
        'The law always prevails, my dear fellow.',
      ],
      defeatLines: [
        'This is... most irregular!',
        'You... you struck me! A gentleman!',
        'I say... this isn\'t... sporting...',
      ],
    },
    rewards: {
      goldMin: 100,
      goldMax: 300,
      xpReward: 1200,
      reputationGain: 30,
      possibleLoot: [
        { name: 'Aristocrat\'s Pocket Watch', chance: 0.3, rarity: 'rare' },
        { name: 'Legal Documents', chance: 0.4, rarity: 'uncommon' },
        { name: 'Gentleman\'s Cane', chance: 0.3, rarity: 'uncommon' },
        { name: 'High Society Invitation', chance: 0.2, rarity: 'rare' },
      ],
    },
    hireConfig: {
      hireableBy: HireableBy.LAWFUL,
      baseCost: 500, // Expensive
      costMultiplier: 1.0,
      successRate: 40, // Low success vs combat types
      hireCooldown: 72,
      maxTargetBounty: 3000, // Won't hunt dangerous criminals
    },
    isActive: true,
  },

  // ===========================================
  // 10. THE KID - YOUNG UPSTART
  // ===========================================
  {
    id: 'hunter_the_kid',
    name: 'The Kid',
    title: 'The Eager Upstart',
    level: 15,
    specialty: 'Young, learning, unpredictable',
    method: HuntingMethod.RECKLESS,
    personality: 'Naive, wants to prove himself',
    faction: 'neutral',
    territory: ['everywhere'], // Follows other hunters
    backstory:
      'Nobody knows his real name - everyone just calls him "The Kid." Barely eighteen, he decided to become a bounty hunter after reading dime novels about famous gunfighters. He has more enthusiasm than skill, more bravery than sense. The Kid tends to charge in without planning, relying on lucky shots and reckless courage. While inexperienced, his unpredictability makes him dangerous. More importantly, he still has a conscience. Unlike veteran hunters, The Kid can be reasoned with, befriended, or even mentored. Some targets have talked him out of fights. Others have turned him into an ally.',
    huntingBehavior: {
      minBountyToHunt: 50, // Takes any bounty
      preferredMethod: HuntingMethod.RECKLESS,
      lethality: HuntingPreference.NON_LETHAL,
      trackingAbility: 3,
      patrol: {
        territories: ['everywhere'],
        movementSpeed: 4,
        pursueBehavior: 'active',
      },
      spawnTrigger: 'always',
      escalationRate: 30, // 30 hours - gets lost a lot
      specialConditions: [
        'Can be befriended',
        'Can be mentored (quest line)',
        'Unpredictable combat',
        'May flee if losing',
      ],
    },
    stats: {
      health: 150,
      damage: 25,
      accuracy: 65,
      defense: 20,
      critChance: 15,
      dodgeChance: 15,
      specialAbilities: [
        'Beginner\'s Luck: Random critical hits',
        'Reckless Charge: High damage, low defense',
        'Impressionable: Can be influenced mid-fight',
        'Retreat: Flees at low health',
      ],
    },
    dialogue: {
      encounterLines: [
        'Hold it right there! I\'m here for the bounty!',
        '*Nervous but trying to sound tough* I\'ve been tracking you!',
        'They said you were dangerous, but I ain\'t scared!',
      ],
      negotiationLines: [
        'Wait, really? I mean... maybe we could talk this out?',
        'I don\'t want to hurt you, but I need this bounty!',
        'Look, I\'m just trying to make a name for myself...',
      ],
      payoffLines: [
        'You... you\'d really do that? Okay, deal!',
        '*Eyes widen* That\'s more than the bounty! Thank you!',
        'I never saw you. Deal? Deal!',
      ],
      refusalLines: [
        'Okay... okay... here goes! *Draws shakily*',
        'I... I can do this! I know I can!',
      ],
      victoryLines: [
        'I did it! I actually did it!',
        '*Breathless* Sorry about this, mister...',
        'Wait till the boys hear about this!',
      ],
      defeatLines: [
        'I... I wasn\'t ready...',
        'Tell ma... I tried...',
        'Should\'ve... stayed home...',
      ],
      hireLines: [
        'You want to hire me? Really? Yes! I won\'t let you down!',
        'I\'ll do my best, I promise!',
      ],
    },
    rewards: {
      goldMin: 50,
      goldMax: 150,
      xpReward: 800,
      reputationGain: 20,
      possibleLoot: [
        { name: 'Kid\'s First Revolver', chance: 0.3, rarity: 'uncommon' },
        { name: 'Dime Novel Collection', chance: 0.5, rarity: 'common' },
        { name: 'Lucky Bandana', chance: 0.4, rarity: 'common' },
        { name: 'Mother\'s Locket', chance: 1.0, rarity: 'uncommon' },
      ],
    },
    hireConfig: {
      hireableBy: HireableBy.ANYONE,
      baseCost: 50, // Cheap
      costMultiplier: 0.3,
      successRate: 30, // Low success rate
      hireCooldown: 12,
      maxTargetBounty: 500, // Won't hunt dangerous targets
    },
    isActive: true,
  },
];

/**
 * Get hunter by ID
 */
export function getHunterById(hunterId: string): BountyHunter | undefined {
  return BOUNTY_HUNTERS.find((h) => h.id === hunterId);
}

/**
 * Get hunters by faction
 */
export function getHuntersByFaction(
  faction: BountyFaction | 'neutral' | 'supernatural'
): BountyHunter[] {
  return BOUNTY_HUNTERS.filter((h) => h.faction === faction);
}

/**
 * Get hunters by territory
 */
export function getHuntersByTerritory(territory: string): BountyHunter[] {
  return BOUNTY_HUNTERS.filter(
    (h) => h.territory.includes(territory) || h.territory.includes('all') || h.territory.includes('everywhere')
  );
}

/**
 * Get hireable hunters
 */
export function getHireableHunters(): BountyHunter[] {
  return BOUNTY_HUNTERS.filter(
    (h) => h.hireConfig && h.hireConfig.hireableBy !== HireableBy.NOT_HIREABLE
  );
}

/**
 * Get hunters for bounty level
 */
export function getHuntersForBounty(bountyAmount: number): BountyHunter[] {
  return BOUNTY_HUNTERS.filter((h) => bountyAmount >= h.huntingBehavior.minBountyToHunt);
}
