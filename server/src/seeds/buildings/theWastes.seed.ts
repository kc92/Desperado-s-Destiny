/**
 * The Wastes Buildings Seed Data
 *
 * MID-HIGH LEVEL LOCATION (L25-35) - Lawless desert wasteland
 * Theme: Post-apocalyptic Western, Mad Max meets frontier outlaws
 *
 * Background: The Wastes are where civilization broke down completely.
 * No law, no mercy, only survival of the strongest. Raiders rule through violence,
 * scavengers pick through ruins, and blood sport entertains the desperate masses.
 * This is relocated Mad Max content from the old Scar design.
 */

import mongoose from 'mongoose';
import logger from '../../utils/logger';
import { Location } from '../../models/Location.model';
import { LOCATION_IDS } from '../locations.seed';

// Building IDs for The Wastes
export const THE_WASTES_BUILDING_IDS = {
  SCAVENGERS_CAMP: new mongoose.Types.ObjectId('6509a0000000000000000001'),
  THE_RUST_PIT: new mongoose.Types.ObjectId('6509a0000000000000000002'),
  RAIDER_STRONGHOLD: new mongoose.Types.ObjectId('6509a0000000000000000003'),
  HERMITS_BUNKER: new mongoose.Types.ObjectId('6509a0000000000000000004'),
};

const theWastesBuildings = [
  // ===== 1. SCAVENGER'S CAMP - TRADING POST =====
  {
    _id: THE_WASTES_BUILDING_IDS.SCAVENGERS_CAMP,
    name: "Scavenger's Camp",
    description: 'A sprawling camp built from scrap metal, canvas, and desperation. Scavengers bring salvage from the ruins to trade for food, water, and ammunition. No questions asked, no laws enforced - stolen goods are the primary currency here. Rust-King runs the operation with cunning and calculated violence.',
    shortDescription: 'Black market trading post',
    type: 'trading_post',
    region: 'dusty_flats',
    parentId: LOCATION_IDS.THE_WASTES,
    tier: 4,
    dominantFaction: 'frontera',
    operatingHours: { open: 0, close: 23 }, // Always active
    atmosphere: 'The camp sprawls in chaotic clusters - tents, lean-tos, and scrap structures housing dozens of desperate souls. The air reeks of unwashed bodies, rust, and fear. Armed guards watch every transaction. Trust is nonexistent. Survival is everything.',
    requirements: { minLevel: 25, minCriminalRep: 0 },
    npcs: [
      {
        id: 'rust-king',
        name: 'Rust-King',
        title: 'Scavenger Lord',
        description: 'A scarred man covered in makeshift armor welded from scavenged metal plates. Half his face is hidden behind a rust-pitted mask. He controls the scavenger economy with an iron fist - cross him and your body joins the salvage.',
        personality: 'Ruthlessly pragmatic. Values profit over everything. Respects cunning and strength. Despises weakness.',
        faction: 'FRONTERA',
        dialogue: [
          'Everything has a price. Everyone can be bought. Including you.',
          'Bring me salvage worth trading, or get out of my camp.',
          'The Wastes consume the weak. Prove you are not weak.',
          'Stolen goods? In my camp, all goods are stolen. That is the point.',
        ],
        isVendor: true,
        shopId: 'scavengers-camp-shop',
        quests: ['prove-your-worth', 'major-salvage-run'],
      },
      {
        id: 'wire-tooth',
        name: 'Wire-Tooth',
        title: 'Master Scavenger',
        description: 'A wiry woman with metal teeth filed to points and eyes that never stop scanning for threats. She knows every ruin, every cache, every dangerous spot in The Wastes.',
        personality: 'Paranoid, efficient, survivor above all. Never stays still.',
        dialogue: [
          'The best salvage is in the deadliest ruins. High risk, high reward.',
          'I trust my knife more than I trust you. No offense.',
          'You want to survive? Watch the horizon, trust nobody, take everything.',
        ],
      },
    ],
    availableActions: ['trade-salvage', 'hire-scavenger-guide', 'fence-stolen-goods'],
    availableCrimes: ['Steal Supplies', 'Rob Traders', 'Murder for Hire'],
    jobs: [
      {
        id: 'scavenging-expedition',
        name: 'Scavenging Expedition',
        description: 'Join Wire-Tooth on a dangerous expedition into the ruins. The salvage could be worth a fortune - if you survive.',
        energyCost: 30,
        cooldownMinutes: 120,
        rewards: { goldMin: 100, goldMax: 200, xp: 150, items: ['pre-war-salvage', 'scrap-metal', 'rare-parts'] },
        requirements: { minLevel: 25 },
      },
      {
        id: 'caravan-raiding',
        name: 'Caravan Raiding',
        description: 'Rust-King has intelligence on a wealthy caravan. Join the raid and split the loot.',
        energyCost: 40,
        cooldownMinutes: 180,
        rewards: { goldMin: 150, goldMax: 300, xp: 200, items: ['stolen-goods', 'raider-reputation'] },
        requirements: { minLevel: 27 },
      },
    ],
    shops: [
      {
        id: 'scavengers-camp-shop',
        name: 'Rust-King\'s Exchange',
        description: 'Everything scavenged, stolen, or salvaged. Quality varies, prices are negotiable, provenance is never discussed.',
        shopType: 'black_market',
        items: [
          { itemId: 'scrap-armor', name: 'Scrap Plate Armor', description: 'Cobbled together protection', price: 150, requiredLevel: 25 },
          { itemId: 'salvaged-rifle', name: 'Salvaged Repeater', description: 'Rebuilt from parts', price: 200, requiredLevel: 26 },
          { itemId: 'water-purifier', name: 'Water Purification Kit', description: 'Survival essential', price: 80, requiredLevel: 25 },
          { itemId: 'pre-war-medicine', name: 'Pre-War Medicine', description: 'Rare and valuable', price: 120, requiredLevel: 25 },
          { itemId: 'explosive-charge', name: 'Improvised Explosive', description: 'Unstable but effective', price: 100, requiredLevel: 28 },
        ],
        buyMultiplier: 0.6,
      },
    ],
    secrets: [
      {
        id: 'hidden-cache',
        name: 'Rust-King\'s Hidden Cache',
        description: 'Deep in the camp\'s warren of tunnels, Rust-King keeps his most valuable salvage - pre-war technology, weapons, and treasures worth killing for. He\'ll grant access only to those who prove themselves indispensable.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 0,
          npcTrust: { npcId: 'rust-king', level: 4 },
        },
        content: {
          actions: ['access-cache', 'claim-rare-salvage', 'learn-scavenger-secrets'],
          dialogue: [
            'You have proven your worth. The cache is yours to access. Take what you have earned. But remember - I always get my cut.',
          ],
          rewards: {
            gold: 500,
            xp: 400,
            items: ['pre-war-weapon', 'advanced-salvage', 'rust-kings-favor', 'scavenger-master-rank'],
          },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 8,
    factionInfluence: { settlerAlliance: 5, nahiCoalition: 0, frontera: 95 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 2. THE RUST PIT - BLOOD SPORT ARENA =====
  {
    _id: THE_WASTES_BUILDING_IDS.THE_RUST_PIT,
    name: 'The Rust Pit',
    description: 'A massive arena carved from red stone and ringed with scrap metal walls. This is where The Wastes come to watch men kill each other for sport, survival, and the roaring approval of bloodthirsty crowds. Pit-Boss Kaine runs matches from dawn to midnight - gladiatorial combat, animal fights, execution spectacles, and blood sport beyond imagination.',
    shortDescription: 'Death match arena and gambling den',
    type: 'fighting_pit',
    region: 'dusty_flats',
    parentId: LOCATION_IDS.THE_WASTES,
    tier: 4,
    dominantFaction: 'frontera',
    operatingHours: { open: 8, close: 4 }, // Opens morning, runs past midnight
    atmosphere: 'Blood stains the sand black and rust-red. Crowds pack the tiered seating, screaming for violence. Betting slips flutter like deadly confetti. The weapon racks hold everything from machetes to improvised flamethrowers. Champions become legends. Losers become warnings nailed to the walls.',
    requirements: { minLevel: 25 },
    npcs: [
      {
        id: 'pit-boss-kaine',
        name: 'Pit-Boss Kaine',
        title: 'Arena Master',
        description: 'A towering man with scars mapping his entire body - each one a trophy from arena combat. He won the Rust Pit through fifty consecutive victories, then retired to run it. His word is absolute law within these walls. His judgment determines who lives and who dies.',
        personality: 'Brutal showman. Values entertainment and spectacle. Respects warriors, despises cowards. Lives for the roar of the crowd.',
        faction: 'FRONTERA',
        dialogue: [
          'Blood is the currency here. Entertain the crowd or join the corpse pile.',
          'I killed ninety-seven men in this pit. You think you can be ninety-eight?',
          'The Pit does not care who you were. Only what you can do with steel in hand.',
          'Win and earn glory, gold, and legend. Lose and earn a shallow grave.',
        ],
        isVendor: true,
        shopId: 'rust-pit-shop',
        quests: ['become-pit-champion', 'blood-sport-legend'],
      },
      {
        id: 'slash-maiden',
        name: 'Slash-Maiden',
        title: 'Reigning Champion',
        description: 'A scarred woman fighting with dual machetes stained permanently red. She has held the championship for eight months and forty-three kills. Every challenger has died screaming.',
        personality: 'Cold, methodical killer. Speaks little. Respects only proven warriors.',
        dialogue: [
          'You want my title? Take it from my corpse. Good luck.',
          'I have killed better fighters before breakfast.',
          'The Pit is my home. Blood is my language. Death is my art.',
        ],
      },
    ],
    availableActions: ['enter-death-match', 'challenge-champion', 'bet-on-fights', 'watch-spectacle'],
    availableCrimes: ['Fix Fights', 'Poison Combatant', 'Rig Bets'],
    jobs: [
      {
        id: 'gladiatorial-combat',
        name: 'Gladiatorial Combat',
        description: 'Enter the Rust Pit and fight to the death for massive rewards. Victory brings wealth and glory. Defeat brings nothing.',
        energyCost: 40,
        cooldownMinutes: 180,
        rewards: { goldMin: 200, goldMax: 400, xp: 300, items: ['blood-money', 'crowd-favor', 'combat-trophy'] },
        requirements: { minLevel: 27 },
      },
      {
        id: 'pit-betting',
        name: 'Manage Betting Pools',
        description: 'Work the betting operations, collecting wagers and paying out winners. Skimming is expected.',
        energyCost: 15,
        cooldownMinutes: 60,
        rewards: { goldMin: 50, goldMax: 100, xp: 80, items: [] },
        requirements: { minLevel: 25 },
      },
    ],
    shops: [
      {
        id: 'rust-pit-shop',
        name: 'Champion\'s Arsenal',
        description: 'Weapons designed for one purpose - killing spectacularly in front of crowds.',
        shopType: 'weapons',
        items: [
          { itemId: 'pit-machete', name: 'Rust Pit Machete', description: 'Forged from fallen champions\' weapons', price: 250, requiredLevel: 26 },
          { itemId: 'combat-stimulant', name: 'Battle Rage Serum', description: 'Ignore pain, boost aggression', price: 100, requiredLevel: 25 },
          { itemId: 'gladiator-armor', name: 'Pit Fighter Armor', description: 'Light but effective protection', price: 300, requiredLevel: 27 },
          { itemId: 'berserker-drug', name: 'Berserker Fury Drug', description: 'Massive strength boost, dangerous side effects', price: 200, requiredLevel: 28 },
          { itemId: 'champion-blade', name: 'Champion\'s Trophy Blade', description: 'Legendary arena weapon', price: 1000, requiredLevel: 30 },
        ],
        buyMultiplier: 0.5,
      },
    ],
    secrets: [
      {
        id: 'champions-vault',
        name: 'The Champion\'s Vault',
        description: 'Beneath the Rust Pit lies a vault containing the weapons and armor of every champion in history. Legendary gear soaked in blood and glory. Kaine grants access only to those who achieve legendary status in the arena.',
        type: 'progressive',
        unlockCondition: {
          minReputation: 0,
          npcTrust: { npcId: 'pit-boss-kaine', level: 5 },
        },
        content: {
          actions: ['claim-champion-gear', 'study-fighting-legends', 'become-legend'],
          dialogue: [
            'You have earned the right to walk among legends. These weapons belonged to the greatest killers who ever lived. Now they are yours.',
          ],
          rewards: {
            gold: 1000,
            xp: 800,
            items: ['legendary-pit-weapon', 'champion-armor-set', 'kaines-blessing', 'arena-legend-title'],
          },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 9,
    factionInfluence: { settlerAlliance: 10, nahiCoalition: 0, frontera: 90 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 3. RAIDER STRONGHOLD - OUTLAW FORTRESS =====
  {
    _id: THE_WASTES_BUILDING_IDS.RAIDER_STRONGHOLD,
    name: 'Raider Stronghold',
    description: 'A fortress built from scavenged metal, reinforced concrete, and audacity. Iron-Chief commands fifty of the most brutal raiders in The Wastes from this stronghold. Spikes bearing skulls ring the walls. Cages hold prisoners awaiting ransom or death. This is the heart of raider power in the wasteland.',
    shortDescription: 'Raider command fortress',
    type: 'fort',
    region: 'dusty_flats',
    parentId: LOCATION_IDS.THE_WASTES,
    tier: 4,
    dominantFaction: 'frontera',
    operatingHours: { open: 0, close: 23 }, // Always alert, always armed
    atmosphere: 'Armed raiders patrol rusted ramparts. The courtyard serves as training ground, execution square, and war planning center. Weapon racks line every wall. The smell of gunpowder, sweat, and blood hangs heavy. Loyalty is tested daily through violence. Weakness means death.',
    requirements: { minLevel: 28, minCriminalRep: 100 },
    npcs: [
      {
        id: 'iron-chief',
        name: 'Iron-Chief',
        title: 'Supreme Raider Commander',
        description: 'A massive figure in welded armor plating, carrying a custom-built rifle and a machete the size of a sword. Wanted posters across three territories total $75,000 for his head. He has personally killed sixty-two lawmen and burned twenty settlements. He rules through fear, respect, and overwhelming violence.',
        personality: 'Brutal warlord. Respects strength and audacity. Rewards loyalty generously. Punishes betrayal creatively and fatally.',
        faction: 'FRONTERA',
        dialogue: [
          'In The Wastes, I am god, king, and executioner. Remember that.',
          'Join my raiders and share in the spoils of war. Betray me and become an example.',
          'The weak die. The strong take what they want. I take EVERYTHING.',
          'You think you are tough? Prove it or die trying.',
        ],
        isVendor: false,
        quests: ['join-the-raiders', 'ultimate-raid', 'challenge-iron-chief'],
      },
      {
        id: 'red-handed-ruth',
        name: 'Red-Handed Ruth',
        title: 'Chief\'s Lieutenant',
        description: 'Iron-Chief\'s second-in-command and most trusted killer. Her hands are stained permanently red from blood. Some say she bathes in the blood of enemies. Others say she just never washes.',
        personality: 'Psychotic loyalty. Enjoys violence for its own sake. Utterly devoted to Iron-Chief.',
        dialogue: [
          'The Chief sees potential in you. Do not waste it.',
          'I have killed for less than a sideways glance. Mind your manners.',
          'Loyalty to Iron-Chief is everything. Everything else is negotiable.',
        ],
      },
    ],
    availableActions: ['plan-raids', 'train-combat', 'execute-prisoners', 'claim-territory'],
    availableCrimes: ['Raid Settlement', 'Mass Murder', 'Territorial Conquest', 'Hostage Taking'],
    jobs: [
      {
        id: 'raiding-expedition',
        name: 'Raiding Expedition',
        description: 'Join Iron-Chief\'s raiders on a major assault against a settlement. High danger, massive rewards.',
        energyCost: 50,
        cooldownMinutes: 240,
        rewards: { goldMin: 300, goldMax: 600, xp: 400, items: ['raid-plunder', 'iron-chiefs-favor', 'raider-reputation'] },
        requirements: { minLevel: 30 },
      },
      {
        id: 'territory-conquest',
        name: 'Territory Conquest',
        description: 'Lead a squad to conquer new territory and expand Iron-Chief\'s domain.',
        energyCost: 60,
        cooldownMinutes: 360,
        rewards: { goldMin: 500, goldMax: 800, xp: 500, items: ['conquered-territory-deed', 'warlord-commendation', 'fear-reputation'] },
        requirements: { minLevel: 32 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'raiders-armory',
        name: 'The Raider Armory',
        description: 'Deep beneath the stronghold lies Iron-Chief\'s accumulated weapons cache - military-grade firearms, explosives, and legendary weapons plundered from a hundred raids. Access is granted only to Iron-Chief\'s most trusted warriors.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 150,
          npcTrust: { npcId: 'iron-chief', level: 5 },
        },
        content: {
          actions: ['access-armory', 'claim-legendary-weapon', 'become-war-captain'],
          dialogue: [
            'You have proven yourself in blood and fire. The armory is yours. Take what you have earned through violence and loyalty.',
          ],
          rewards: {
            gold: 2000,
            xp: 1000,
            items: ['legendary-raider-weapon', 'military-grade-armor', 'iron-chiefs-blessing', 'war-captain-rank'],
          },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 10,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 0, frontera: 100 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 4. HERMIT'S BUNKER - SURVIVAL SHELTER =====
  {
    _id: THE_WASTES_BUILDING_IDS.HERMITS_BUNKER,
    name: "Hermit's Bunker",
    description: 'A pre-war bunker buried in the dunes, home to Old Survivor - a man who has lived in The Wastes longer than anyone remembers. His bunker contains maps, supplies, and knowledge of the wasteland\'s deadliest secrets. He trades information for interesting salvage or compelling stories.',
    shortDescription: 'Wasteland hermit\'s shelter',
    type: 'hideout',
    region: 'dusty_flats',
    parentId: LOCATION_IDS.THE_WASTES,
    tier: 4,
    dominantFaction: null,
    operatingHours: { open: 8, close: 20 },
    atmosphere: 'The bunker is surprisingly comfortable - pre-war furniture, working electricity from jury-rigged solar panels, walls covered in maps marking every danger and cache in The Wastes. Old Survivor maintains it meticulously. This is the only truly safe place in the wasteland.',
    requirements: { minLevel: 25 },
    npcs: [
      {
        id: 'old-survivor',
        name: 'Old Survivor',
        title: 'Wasteland Sage',
        description: 'A weathered man of indeterminate age who has lived in The Wastes for forty years. He knows every ruin, every water source, every raider gang, and every secret. He survived by being smarter, more cautious, and better prepared than everyone else.',
        personality: 'Cautious, knowledgeable, values intelligence over strength. Appreciates those who listen and learn.',
        faction: null,
        dialogue: [
          'The Wastes killed everyone who ignored my advice. Will you listen or die?',
          'Forty years I have survived here. You know how? By knowing when to fight and when to run.',
          'This bunker holds the accumulated knowledge of four decades. Learn from it or learn from corpses.',
          'The raiders think they rule The Wastes. I know the truth - The Wastes rule everyone. Even them.',
        ],
        isVendor: false,
        quests: ['learn-wasteland-secrets', 'find-hidden-caches'],
      },
    ],
    availableActions: ['study-maps', 'learn-survival', 'trade-knowledge'],
    availableCrimes: [],
    jobs: [
      {
        id: 'exploration-contract',
        name: 'Exploration Contract',
        description: 'Old Survivor needs someone to verify information on his maps. Dangerous exploration work.',
        energyCost: 35,
        cooldownMinutes: 150,
        rewards: { goldMin: 150, goldMax: 250, xp: 200, items: ['updated-map', 'wasteland-knowledge'] },
        requirements: { minLevel: 26 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'bunker-vault',
        name: 'The Bunker Vault',
        description: 'Old Survivor has a sealed vault containing pre-war technology and supplies he has accumulated over decades. He will share it only with someone he trusts completely - someone worthy of his life\'s work.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 0,
          npcTrust: { npcId: 'old-survivor', level: 4 },
        },
        content: {
          actions: ['access-vault', 'claim-pre-war-tech', 'inherit-knowledge'],
          dialogue: [
            'I am old. The Wastes will claim me soon. But you... you can carry on what I have learned. The vault is yours.',
          ],
          rewards: {
            gold: 1000,
            xp: 600,
            items: ['pre-war-technology', 'complete-wasteland-maps', 'survivors-legacy', 'wasteland-master-knowledge'],
          },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 6,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 0, frontera: 0 },
    isUnlocked: true,
    isHidden: false,
  },
];

/**
 * Seed The Wastes buildings into the database
 */
export async function seedTheWastesBuildings(): Promise<void> {
  try {
    // Verify The Wastes location exists
    const theWastes = await Location.findById(LOCATION_IDS.THE_WASTES);
    if (!theWastes) {
      console.warn('Warning: The Wastes location not found. Buildings will reference non-existent parent.');
    }

    // Delete existing The Wastes buildings (by parentId)
    await Location.deleteMany({ parentId: LOCATION_IDS.THE_WASTES });

    // Insert The Wastes buildings
    await Location.insertMany(theWastesBuildings);

    console.log(`Successfully seeded ${theWastesBuildings.length} The Wastes buildings (L25-35 WASTELAND CONTENT)`);
  } catch (error) {
    logger.error('Error seeding The Wastes buildings', { error: error instanceof Error ? error.message : error });
    throw error;
  }
}

export default theWastesBuildings;
