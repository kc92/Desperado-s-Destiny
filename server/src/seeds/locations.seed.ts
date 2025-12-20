/**
 * Location Seed Data
 *
 * Seeds the database with 12+ detailed locations for Sangre Territory
 * Based on the Sangre Territory Location Atlas
 */

import mongoose from 'mongoose';
import logger from '../utils/logger';
import { Location } from '../models/Location.model';
import { frontierLocations } from '../data/locations/frontier_locations';
import { ZONES } from '@desperados/shared';

// Location IDs for consistent references
export const LOCATION_IDS = {
  RED_GULCH: new mongoose.Types.ObjectId('6501a0000000000000000001'),
  THE_FRONTERA: new mongoose.Types.ObjectId('6501a0000000000000000002'),
  FORT_ASHFORD: new mongoose.Types.ObjectId('6501a0000000000000000003'),
  KAIOWA_MESA: new mongoose.Types.ObjectId('6501a0000000000000000004'),
  SANGRE_CANYON: new mongoose.Types.ObjectId('6501a0000000000000000005'),
  GOLDFINGERS_MINE: new mongoose.Types.ObjectId('6501a0000000000000000006'),
  THUNDERBIRDS_PERCH: new mongoose.Types.ObjectId('6501a0000000000000000007'),
  THE_SCAR: new mongoose.Types.ObjectId('6501a0000000000000000008'),
  DUSTY_TRAIL: new mongoose.Types.ObjectId('6501a0000000000000000009'),
  LONGHORN_RANCH: new mongoose.Types.ObjectId('6501a000000000000000000a'),
  SPIRIT_SPRINGS: new mongoose.Types.ObjectId('6501a000000000000000000b'),
  WHISKEY_BEND: new mongoose.Types.ObjectId('6501a000000000000000000c'),
  THE_WASTES: new mongoose.Types.ObjectId('6501a000000000000000000d'),
  // New Frontier Locations
  ABANDONED_MINE: new mongoose.Types.ObjectId('6501a0000000000000000010'),
  DUSTY_CROSSROADS: new mongoose.Types.ObjectId('6501a0000000000000000011'),
  SNAKE_CREEK: new mongoose.Types.ObjectId('6501a0000000000000000012'),
  // Atlas Sacred Sites & Wilderness
  WHISPERING_STONES: new mongoose.Types.ObjectId('6501a0000000000000000030'),
  ANCESTORS_SPRING: new mongoose.Types.ObjectId('6501a0000000000000000031'),
  BONE_GARDEN: new mongoose.Types.ObjectId('6501a0000000000000000032'),
  ECHO_CAVES: new mongoose.Types.ObjectId('6501a0000000000000000033'),
  COYOTES_CROSSROADS: new mongoose.Types.ObjectId('6501a0000000000000000034'),
  RAILROAD_WOUND: new mongoose.Types.ObjectId('6501a0000000000000000035'),
  THE_BADLANDS: new mongoose.Types.ObjectId('6501a0000000000000000036'),
  SACRED_HEART_MOUNTAINS: new mongoose.Types.ObjectId('6501a0000000000000000037'),
  DEAD_MANS_STRETCH: new mongoose.Types.ObjectId('6501a0000000000000000038'),
};

// Starting location IDs for each faction
export const FACTION_STARTING_LOCATIONS = {
  SETTLER_ALLIANCE: LOCATION_IDS.RED_GULCH.toString(),
  NAHI_COALITION: LOCATION_IDS.KAIOWA_MESA.toString(),
  FRONTERA: LOCATION_IDS.THE_FRONTERA.toString(),
};

const locationSeeds = [
  // ===== 1. RED GULCH - Settler Capital =====
  {
    _id: LOCATION_IDS.RED_GULCH,
    name: 'Red Gulch',
    description: 'The largest settler town in Sangre Territory, built in a canyon mouth where industry meets the frontier. Upper Town houses the wealthy elite while Lower Town thrums with saloons, shops, and the desperate hopes of prospectors.',
    shortDescription: 'Settler capital and boomtown',
    type: 'settlement',
    region: 'town',
    zone: ZONES.SETTLER_TERRITORY,
    isZoneHub: true,
    icon: '🏘️',
    atmosphere: 'The dusty streets buzz with activity. Piano music drifts from saloons, hammers ring from the blacksmith, and the constant murmur of commerce fills the air. The red canyon walls tower above, glowing like blood at sunset.',
    availableActions: [],
    availableCrimes: ['Pickpocket Drunk', 'Steal from Market', 'Burglarize Store', 'Pick Lock'],
    jobs: [
      {
        id: 'deputy-work',
        name: 'Deputy Work',
        description: 'Help the marshal keep order in town. Patrol streets and handle minor disputes.',
        energyCost: 15,
        cooldownMinutes: 30,
        rewards: { goldMin: 15, goldMax: 25, xp: 30, items: [] },
        requirements: { minLevel: 1 }
      },
      {
        id: 'general-labor',
        name: 'General Labor',
        description: 'Unload wagons, stack crates, and do odd jobs around town.',
        energyCost: 10,
        cooldownMinutes: 15,
        rewards: { goldMin: 8, goldMax: 15, xp: 15, items: [] },
        requirements: { minLevel: 1 }
      },
      {
        id: 'stable-hand',
        name: 'Stable Hand',
        description: 'Care for horses at the livery stable.',
        energyCost: 12,
        cooldownMinutes: 20,
        rewards: { goldMin: 10, goldMax: 18, xp: 20, items: [] },
        requirements: { minLevel: 1 }
      }
    ],
    shops: [
      {
        id: 'red-gulch-general',
        name: "Henderson's General Store",
        description: 'The largest general store in town.',
        shopType: 'general',
        items: [
          { itemId: 'bandages', name: 'Bandages', description: 'Basic medical supplies', price: 5 },
          { itemId: 'rope', name: 'Rope (50ft)', description: 'Sturdy hemp rope', price: 8 },
          { itemId: 'lantern', name: 'Oil Lantern', description: 'Light your way', price: 15 },
          { itemId: 'lockpicks', name: 'Lockpick Set', description: 'Tools for professionals', price: 50, requiredLevel: 5 }
        ],
        buyMultiplier: 0.5
      },
      {
        id: 'red-gulch-gunsmith',
        name: "Cole's Gunsmith",
        description: 'Quality firearms and ammunition.',
        shopType: 'weapons',
        items: [
          { itemId: 'revolver-basic', name: 'Colt Single Action', description: 'Reliable six-shooter', price: 100 },
          { itemId: 'rifle-basic', name: 'Winchester Rifle', description: 'Lever-action repeater', price: 200, requiredLevel: 10 },
          { itemId: 'ammo-pistol', name: 'Pistol Ammo (20)', description: '.45 caliber rounds', price: 10 },
          { itemId: 'ammo-rifle', name: 'Rifle Ammo (20)', description: '.44-40 rounds', price: 15 }
        ],
        buyMultiplier: 0.4
      }
    ],
    npcs: [
      {
        id: 'marshal-blackwood',
        name: 'Kane Blackwood',
        title: 'Town Marshal',
        description: 'A rare honest lawman struggling to maintain justice in a corrupt town.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: ['Keep your nose clean, stranger.', 'Justice is hard to come by here.'],
        quests: ['corruption-investigation']
      },
      {
        id: 'two-gun-wade',
        name: 'Samuel "Two-Gun" Wade',
        title: 'Saloon Owner',
        description: 'Charming and calculating owner of The Lucky Strike.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: ['Care for a game of poker?', 'Information has a price.']
      }
    ],
    connections: [
      { targetLocationId: LOCATION_IDS.THE_FRONTERA.toString(), travelTime: 0, energyCost: 10, description: 'South to The Frontera' },
      { targetLocationId: LOCATION_IDS.FORT_ASHFORD.toString(), travelTime: 0, energyCost: 5, description: 'To Fort Ashford' },
      { targetLocationId: LOCATION_IDS.SANGRE_CANYON.toString(), travelTime: 0, energyCost: 12, description: 'West to Sangre Canyon' },
      { targetLocationId: LOCATION_IDS.GOLDFINGERS_MINE.toString(), travelTime: 0, energyCost: 10, description: 'To Goldfinger\'s Mine' },
      { targetLocationId: LOCATION_IDS.WHISKEY_BEND.toString(), travelTime: 0, energyCost: 15, description: 'South to Whiskey Bend' },
      { targetLocationId: '6501a0000000000000000020', travelTime: 0, energyCost: 3, description: 'To Western Outpost' },
      { targetLocationId: LOCATION_IDS.RAILROAD_WOUND.toString(), travelTime: 0, energyCost: 8, description: 'East to Railroad Wound' }
    ],
    dangerLevel: 3,
    factionInfluence: { settlerAlliance: 80, nahiCoalition: 5, frontera: 15 },
    isUnlocked: true,
    isHidden: false
  },

  // ===== 2. THE FRONTERA - Outlaw Haven =====
  {
    _id: LOCATION_IDS.THE_FRONTERA,
    name: 'The Frontera',
    description: 'A lawless town on the Rio Sangre operating under its own code. Outlaws, smugglers, and those who reject authority find refuge here under El Rey Martinez.',
    shortDescription: 'Outlaw haven and black market hub',
    type: 'settlement',
    region: 'outlaw_territory',
    zone: ZONES.OUTLAW_TERRITORY,
    isZoneHub: true,
    icon: '🏴',
    atmosphere: 'Music and shouting in Spanish mix with gun oil and chili peppers. Armed outlaws eye strangers carefully. The Frontera Code is law here.',
    availableActions: [],
    availableCrimes: ['Forge Documents', 'Rob Saloon', 'Murder for Hire', 'Pickpocket Drunk'],
    jobs: [
      {
        id: 'smuggling',
        name: 'Smuggling Run',
        description: 'Transport contraband across the territory.',
        energyCost: 20,
        cooldownMinutes: 45,
        rewards: { goldMin: 25, goldMax: 50, xp: 40, items: [] },
        requirements: { minLevel: 5 }
      },
      {
        id: 'fence-goods',
        name: 'Fence Stolen Goods',
        description: 'Move stolen merchandise through the black market.',
        energyCost: 15,
        cooldownMinutes: 30,
        rewards: { goldMin: 15, goldMax: 30, xp: 25, items: [] },
        requirements: { minLevel: 3 }
      }
    ],
    shops: [
      {
        id: 'frontera-black-market',
        name: 'El Mercado Negro',
        description: 'Goods that fell off wagons - or were helped off.',
        shopType: 'black_market',
        items: [
          { itemId: 'stolen-goods', name: 'Stolen Goods', description: 'Various pilfered items', price: 20 },
          { itemId: 'dynamite', name: 'Dynamite Stick', description: 'Handle with care', price: 75, requiredLevel: 15 },
          { itemId: 'poison', name: 'Rattlesnake Venom', description: 'Potent toxin', price: 100, requiredLevel: 20 }
        ],
        buyMultiplier: 0.6
      }
    ],
    npcs: [
      {
        id: 'el-rey',
        name: 'Carlos "El Rey" Martinez',
        title: 'Ruler of The Frontera',
        description: 'Tall and scarred, with a cavalry saber always at his side.',
        faction: 'FRONTERA',
        dialogue: ['In my town, we follow The Code.', 'Cross me and answer to the blade.'],
        quests: ['prove-yourself']
      },
      {
        id: 'prophet',
        name: 'The Prophet',
        title: 'Fortune Teller',
        description: 'Androgynous and ageless, offering cryptic guidance.',
        dialogue: ['The cards speak truths we dare not face.', 'Your destiny awaits.'],
        quests: ['prophets-vision']
      }
    ],
    connections: [
      { targetLocationId: LOCATION_IDS.RED_GULCH.toString(), travelTime: 0, energyCost: 10, description: 'North to Red Gulch' },
      { targetLocationId: LOCATION_IDS.KAIOWA_MESA.toString(), travelTime: 0, energyCost: 15, description: 'Northeast to Kaiowa Mesa' },
      { targetLocationId: LOCATION_IDS.SANGRE_CANYON.toString(), travelTime: 0, energyCost: 10, description: 'Northwest to Sangre Canyon' },
      { targetLocationId: '6501a0000000000000000022', travelTime: 0, energyCost: 3, description: 'To Smuggler\'s Den' },
      { targetLocationId: LOCATION_IDS.THE_BADLANDS.toString(), travelTime: 0, energyCost: 18, description: 'South to The Badlands' }
    ],
    dangerLevel: 6,
    factionInfluence: { settlerAlliance: 10, nahiCoalition: 15, frontera: 75 },
    isUnlocked: true,
    isHidden: false
  },

  // ===== 3. FORT ASHFORD - Military Garrison =====
  {
    _id: LOCATION_IDS.FORT_ASHFORD,
    name: 'Fort Ashford',
    description: 'The military heart of settler power. Four hundred cavalry soldiers operate from this wooden palisade under Captain Marcus Cross.',
    shortDescription: 'U.S. Army garrison',
    type: 'fort',
    region: 'town',
    zone: ZONES.SETTLER_TERRITORY,
    isZoneHub: false,
    icon: '🏰',
    atmosphere: 'Disciplined routine rules here. Bugle calls mark the hours, soldiers drill in formation. The stockade holds Coalition prisoners.',
    availableActions: [],
    availableCrimes: ['Steal Horse', 'Forge Documents'],
    jobs: [
      {
        id: 'military-contract',
        name: 'Military Contract',
        description: 'Perform mercenary work for the Army.',
        energyCost: 20,
        cooldownMinutes: 60,
        rewards: { goldMin: 30, goldMax: 50, xp: 50, items: [] },
        requirements: { minLevel: 10 }
      },
      {
        id: 'supply-run',
        name: 'Supply Delivery',
        description: 'Transport military supplies safely.',
        energyCost: 15,
        cooldownMinutes: 30,
        rewards: { goldMin: 20, goldMax: 35, xp: 30, items: [] },
        requirements: { minLevel: 5 }
      }
    ],
    shops: [
      {
        id: 'fort-quartermaster',
        name: 'Army Quartermaster',
        description: 'Military surplus and supplies.',
        shopType: 'weapons',
        items: [
          { itemId: 'cavalry-saber', name: 'Cavalry Saber', description: 'Standard issue', price: 75 },
          { itemId: 'army-canteen', name: 'Army Canteen', description: 'Keeps water cool', price: 12 },
          { itemId: 'field-rations', name: 'Field Rations', description: 'Three days supply', price: 8 }
        ],
        buyMultiplier: 0.3
      }
    ],
    npcs: [
      {
        id: 'captain-cross',
        name: 'Captain Marcus Cross',
        title: 'Fort Commander',
        description: 'A scarred, cold-eyed officer who believes in "pacifying" natives by any means.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: ['The only good hostile is a dead hostile.', 'We bring civilization.'],
        quests: ['military-patrol']
      }
    ],
    connections: [
      { targetLocationId: LOCATION_IDS.RED_GULCH.toString(), travelTime: 0, energyCost: 5, description: 'To Red Gulch' }
    ],
    dangerLevel: 4,
    factionInfluence: { settlerAlliance: 95, nahiCoalition: 0, frontera: 5 },
    isUnlocked: true,
    isHidden: false
  },

  // ===== 4. KAIOWA MESA - Coalition Stronghold =====
  {
    _id: LOCATION_IDS.KAIOWA_MESA,
    name: 'Kaiowa Mesa',
    description: 'Rising 800 feet above the desert, this defensible mesa is the last major stronghold of the Nahi Coalition. Traditional dwellings mix with government cabins.',
    shortDescription: 'Coalition stronghold and spiritual center',
    type: 'mesa',
    region: 'sacred_lands',
    zone: ZONES.COALITION_LANDS,
    isZoneHub: true,
    icon: '🏔️',
    atmosphere: 'Wind whispers constantly. Drums and chanting drift from ceremonial grounds. Children learn traditional ways while warriors patrol the trails.',
    availableActions: [],
    availableCrimes: ['Steal Horse'],
    jobs: [
      {
        id: 'herb-gathering',
        name: 'Herb Gathering',
        description: 'Collect medicinal herbs from the mesa slopes.',
        energyCost: 12,
        cooldownMinutes: 20,
        rewards: { goldMin: 8, goldMax: 15, xp: 20, items: ['medicinal-herbs'] },
        requirements: { minLevel: 1 }
      },
      {
        id: 'scouting',
        name: 'Scout Patrol',
        description: 'Watch for settler incursions.',
        energyCost: 15,
        cooldownMinutes: 30,
        rewards: { goldMin: 12, goldMax: 22, xp: 30, items: [] },
        requirements: { minLevel: 5 }
      }
    ],
    shops: [
      {
        id: 'mesa-trading',
        name: 'Coalition Trading Post',
        description: 'Traditional goods and supplies.',
        shopType: 'general',
        items: [
          { itemId: 'pemmican', name: 'Pemmican', description: 'Concentrated travel food', price: 5 },
          { itemId: 'healing-herbs', name: 'Healing Herbs', description: 'Traditional medicine', price: 15 },
          { itemId: 'spirit-totem', name: 'Spirit Totem', description: 'Blessed protective charm', price: 50, requiredLevel: 10 }
        ],
        buyMultiplier: 0.5
      }
    ],
    npcs: [
      {
        id: 'elder-wise-sky',
        name: 'Elder Wise Sky',
        title: 'Spiritual Leader',
        description: 'The most powerful shaman in the territory.',
        faction: 'NAHI_COALITION',
        dialogue: ['The spirits speak to those who listen.', 'We must preserve what we can.'],
        quests: ['vision-quest']
      },
      {
        id: 'war-chief-red-thunder',
        name: 'War Chief Red Thunder',
        title: 'Military Commander',
        description: 'A muscular Tseka warrior bearing the Thunderbird feather.',
        faction: 'NAHI_COALITION',
        dialogue: ['The settlers understand only force.', 'We fight or we die.'],
        quests: ['raid-settler-supply']
      }
    ],
    connections: [
      { targetLocationId: LOCATION_IDS.THE_FRONTERA.toString(), travelTime: 0, energyCost: 15, description: 'Southwest to The Frontera' },
      { targetLocationId: LOCATION_IDS.THUNDERBIRDS_PERCH.toString(), travelTime: 0, energyCost: 8, description: 'North to Thunderbird\'s Perch' },
      { targetLocationId: LOCATION_IDS.THE_SCAR.toString(), travelTime: 0, energyCost: 15, description: 'West to The Scar' },
      { targetLocationId: '6501a0000000000000000021', travelTime: 0, energyCost: 3, description: 'To Sacred Springs' },
      { targetLocationId: LOCATION_IDS.ANCESTORS_SPRING.toString(), travelTime: 0, energyCost: 10, description: 'South to Ancestor\'s Spring' },
      { targetLocationId: LOCATION_IDS.BONE_GARDEN.toString(), travelTime: 0, energyCost: 12, description: 'West to Bone Garden', requirements: { faction: 'NAHI_COALITION', factionStanding: 'friendly' } },
      { targetLocationId: LOCATION_IDS.RAILROAD_WOUND.toString(), travelTime: 0, energyCost: 12, description: 'South to Railroad Wound' }
    ],
    dangerLevel: 5,
    factionInfluence: { settlerAlliance: 5, nahiCoalition: 90, frontera: 5 },
    isUnlocked: true,
    isHidden: false
  },

  // ===== 5. SANGRE CANYON =====
  {
    _id: LOCATION_IDS.SANGRE_CANYON,
    name: 'Sangre Canyon',
    description: 'The 30-mile spine of the territory, holding the only permanent water source. Blood-red walls have witnessed countless ambushes.',
    shortDescription: 'Central canyon with Rio Sangre',
    type: 'canyon',
    region: 'devils_canyon',
    zone: ZONES.SANGRE_CANYON,
    isZoneHub: true,
    icon: '🏜️',
    atmosphere: 'The Rio Sangre flows cold and clear through towering red walls. Ancient petroglyphs decorate cliff faces.',
    availableActions: [],
    availableCrimes: ['Stage Coach Robbery'],
    jobs: [
      {
        id: 'hunting',
        name: 'Hunt Game',
        description: 'Track deer and wildlife through the canyon.',
        energyCost: 15,
        cooldownMinutes: 30,
        rewards: { goldMin: 12, goldMax: 25, xp: 25, items: ['deer-pelt'] },
        requirements: { minLevel: 1 }
      },
      {
        id: 'prospecting',
        name: 'Pan for Gold',
        description: 'Search the river for gold.',
        energyCost: 20,
        cooldownMinutes: 45,
        rewards: { goldMin: 5, goldMax: 40, xp: 20, items: [] },
        requirements: { minLevel: 1 }
      }
    ],
    shops: [],
    npcs: [
      {
        id: 'canyon-hermit',
        name: 'Old Tom',
        title: 'Canyon Hermit',
        description: 'A grizzled prospector who knows every inch of the canyon.',
        dialogue: ['These canyons got secrets, friend.', 'Stay out of side passages after dark.'],
        quests: ['find-lost-claim']
      }
    ],
    connections: [
      { targetLocationId: LOCATION_IDS.RED_GULCH.toString(), travelTime: 0, energyCost: 12, description: 'East to Red Gulch' },
      { targetLocationId: LOCATION_IDS.THE_FRONTERA.toString(), travelTime: 0, energyCost: 10, description: 'Southeast to The Frontera' },
      { targetLocationId: LOCATION_IDS.GOLDFINGERS_MINE.toString(), travelTime: 0, energyCost: 8, description: 'North to Goldfinger\'s Mine' },
      { targetLocationId: LOCATION_IDS.DUSTY_TRAIL.toString(), travelTime: 0, energyCost: 10, description: 'South to Dusty Trail' },
      { targetLocationId: LOCATION_IDS.ECHO_CAVES.toString(), travelTime: 0, energyCost: 8, description: 'North to Echo Caves' },
      { targetLocationId: LOCATION_IDS.COYOTES_CROSSROADS.toString(), travelTime: 0, energyCost: 12, description: 'South to Coyote\'s Crossroads' },
      { targetLocationId: LOCATION_IDS.DEAD_MANS_STRETCH.toString(), travelTime: 0, energyCost: 10, description: 'South to Dead Man\'s Stretch' }
    ],
    dangerLevel: 7,
    factionInfluence: { settlerAlliance: 30, nahiCoalition: 30, frontera: 40 },
    isUnlocked: true,
    isHidden: false
  },

  // ===== 6. GOLDFINGER'S MINE =====
  {
    _id: LOCATION_IDS.GOLDFINGERS_MINE,
    name: "Goldfinger's Mine",
    description: 'The mine that started the gold rush, now a dangerous labyrinth producing millions in gold. Cave-ins are common, and the ghost of Goldfinger haunts the deep tunnels.',
    shortDescription: 'Primary gold mine (haunted)',
    type: 'mine',
    region: 'sangre_mountains',
    zone: ZONES.SANGRE_CANYON,
    isZoneHub: false,
    icon: '⛏️',
    atmosphere: 'Steam engines thump and pickaxes crack. Exhausted miners emerge covered in red dust. Workers whisper about seeing Goldfinger\'s ghost.',
    availableActions: [],
    availableCrimes: ['Pick Lock', 'Burglarize Store'],
    jobs: [
      {
        id: 'mining',
        name: 'Mining Shift',
        description: 'Work a dangerous shift in the tunnels.',
        energyCost: 25,
        cooldownMinutes: 60,
        rewards: { goldMin: 20, goldMax: 40, xp: 35, items: [] },
        requirements: { minLevel: 1 }
      },
      {
        id: 'mine-guard',
        name: 'Guard Duty',
        description: 'Protect the mine from thieves.',
        energyCost: 20,
        cooldownMinutes: 45,
        rewards: { goldMin: 25, goldMax: 35, xp: 30, items: [] },
        requirements: { minLevel: 5 }
      }
    ],
    shops: [
      {
        id: 'mine-company-store',
        name: 'Company Store',
        description: 'Overpriced goods for miners.',
        shopType: 'general',
        items: [
          { itemId: 'pickaxe', name: 'Pickaxe', description: 'Mining tool', price: 25 },
          { itemId: 'miners-lamp', name: "Miner's Lamp", description: 'Oil lamp', price: 20 },
          { itemId: 'dynamite', name: 'Dynamite', description: 'Blasting explosive', price: 50, requiredLevel: 10 }
        ],
        buyMultiplier: 0.3
      }
    ],
    npcs: [
      {
        id: 'big-bill',
        name: 'William "Big Bill" Harrison',
        title: 'Mine Owner',
        description: 'A massive man caring only about extracting gold.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: ['Time is money!', 'This mine will make us all rich - well, me anyway.'],
        quests: ['deep-tunnel-expedition']
      }
    ],
    connections: [
      { targetLocationId: LOCATION_IDS.RED_GULCH.toString(), travelTime: 0, energyCost: 10, description: 'East to Red Gulch' },
      { targetLocationId: LOCATION_IDS.SANGRE_CANYON.toString(), travelTime: 0, energyCost: 8, description: 'South to Sangre Canyon' }
    ],
    dangerLevel: 6,
    factionInfluence: { settlerAlliance: 85, nahiCoalition: 5, frontera: 10 },
    isUnlocked: true,
    isHidden: false
  },

  // ===== 7. THUNDERBIRD'S PERCH =====
  {
    _id: LOCATION_IDS.THUNDERBIRDS_PERCH,
    name: "Thunderbird's Perch",
    description: 'The highest peak at 10,500 feet. The Thunderbird spirit nests at the summit. Violent storms form here.',
    shortDescription: 'Sacred peak (extremely dangerous)',
    type: 'sacred_site',
    region: 'sacred_lands',
    zone: ZONES.SACRED_MOUNTAINS,
    isZoneHub: false,
    icon: '⛰️',
    atmosphere: 'Wind howls constantly. Thunder rumbles even when clear. Prayer offerings flutter from rock cairns.',
    availableActions: [],
    availableCrimes: ['Cattle Rustling'],
    jobs: [],
    shops: [],
    npcs: [
      {
        id: 'sky-watcher',
        name: 'Sky-Watcher',
        title: 'Guardian Shaman',
        description: 'A half-mad hermit devoted to the Thunderbird.',
        faction: 'NAHI_COALITION',
        dialogue: ['The mountain judges you.', 'Only the worthy reach the summit.'],
        quests: ['summit-the-peak']
      }
    ],
    connections: [
      { targetLocationId: LOCATION_IDS.KAIOWA_MESA.toString(), travelTime: 0, energyCost: 8, description: 'South to Kaiowa Mesa' },
      { targetLocationId: LOCATION_IDS.WHISPERING_STONES.toString(), travelTime: 0, energyCost: 15, description: 'North to Whispering Stones' },
      { targetLocationId: LOCATION_IDS.SACRED_HEART_MOUNTAINS.toString(), travelTime: 0, energyCost: 10, description: 'West to Sacred Heart Mountains' }
    ],
    dangerLevel: 9,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 95, frontera: 5 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 15 }
  },

  // ===== 8. THE SCAR - COSMIC HORROR SITE (PLACEHOLDER) =====
  {
    _id: LOCATION_IDS.THE_SCAR,
    name: 'The Scar',
    description: 'A massive fissure plunging into lightless depths where reality itself feels wrong. This is where What-Waits-Below slumbers in cosmic dreams. The Nahi Coalition has guarded this place for generations, knowing that what lies beneath must never be disturbed. The air here carries whispers in languages never spoken by human tongues. Those who stare too long into the abyss report visions that shatter sanity. This is end-game content - forbidden, terrible, and not yet fully accessible.',
    shortDescription: 'Forbidden abyss (cosmic horror site)',
    type: 'canyon',
    region: 'devils_canyon',
    zone: ZONES.SACRED_MOUNTAINS,
    isZoneHub: false,
    icon: '🕳️',
    atmosphere: 'Unnatural cold emanates from the fissure despite the desert heat. Whispers rise from depths that should be silent. Shadows move with no source. Animals refuse to approach within a mile. The wrongness is palpable - reality feels thin here, as if the universe itself recoils from what sleeps below.',
    availableActions: [],
    availableCrimes: [],
    jobs: [],
    shops: [],
    npcs: [],
    connections: [
      { targetLocationId: LOCATION_IDS.KAIOWA_MESA.toString(), travelTime: 0, energyCost: 15, description: 'East to Kaiowa Mesa' },
      { targetLocationId: LOCATION_IDS.SACRED_HEART_MOUNTAINS.toString(), travelTime: 0, energyCost: 12, description: 'North to Sacred Heart Mountains' }
    ],
    dangerLevel: 10,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 100, frontera: 0 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 30 }
  },

  // ===== 9. DUSTY TRAIL =====
  {
    _id: LOCATION_IDS.DUSTY_TRAIL,
    name: 'Dusty Trail',
    description: 'The main stagecoach route connecting settlements. Way stations dot the trail, but bandits lurk in the brush.',
    shortDescription: 'Main trade route (bandit territory)',
    type: 'wilderness',
    region: 'dusty_flats',
    zone: ZONES.RANCH_COUNTRY,
    isZoneHub: false,
    icon: '🛤️',
    atmosphere: 'Heat shimmers off the flat expanse. Wagon ruts cut deep. Scattered bones mark failed journeys.',
    availableActions: [],
    availableCrimes: ['Stage Coach Robbery', 'Train Robbery'],
    jobs: [
      {
        id: 'stage-guard',
        name: 'Stagecoach Guard',
        description: 'Protect passengers from bandits.',
        energyCost: 20,
        cooldownMinutes: 60,
        rewards: { goldMin: 25, goldMax: 45, xp: 40, items: [] },
        requirements: { minLevel: 5 }
      },
      {
        id: 'messenger',
        name: 'Express Messenger',
        description: 'Carry urgent messages.',
        energyCost: 15,
        cooldownMinutes: 30,
        rewards: { goldMin: 15, goldMax: 25, xp: 25, items: [] },
        requirements: { minLevel: 1 }
      }
    ],
    shops: [],
    npcs: [],
    connections: [
      { targetLocationId: LOCATION_IDS.SANGRE_CANYON.toString(), travelTime: 0, energyCost: 10, description: 'North to Sangre Canyon' },
      { targetLocationId: LOCATION_IDS.LONGHORN_RANCH.toString(), travelTime: 0, energyCost: 8, description: 'East to Longhorn Ranch' },
      { targetLocationId: LOCATION_IDS.DEAD_MANS_STRETCH.toString(), travelTime: 0, energyCost: 12, description: 'North to Dead Man\'s Stretch' }
    ],
    dangerLevel: 7,
    factionInfluence: { settlerAlliance: 40, nahiCoalition: 10, frontera: 50 },
    isUnlocked: true,
    isHidden: false
  },

  // ===== 10. LONGHORN RANCH =====
  {
    _id: LOCATION_IDS.LONGHORN_RANCH,
    name: 'Longhorn Ranch',
    description: 'The largest cattle operation in the territory. Ranch hands work long hours against rustlers and predators.',
    shortDescription: 'Major cattle ranch',
    type: 'ranch',
    region: 'dusty_flats',
    zone: ZONES.RANCH_COUNTRY,
    isZoneHub: true,
    icon: '🐄',
    atmosphere: 'Cattle low in vast herds. Cowboys work the range from dawn to dusk. Brands sizzle, leather creaks.',
    availableActions: [],
    availableCrimes: ['Cattle Rustling', 'Steal Horse'],
    jobs: [
      {
        id: 'ranch-hand',
        name: 'Ranch Work',
        description: 'Herd cattle, mend fences.',
        energyCost: 15,
        cooldownMinutes: 30,
        rewards: { goldMin: 12, goldMax: 22, xp: 25, items: [] },
        requirements: { minLevel: 1 }
      },
      {
        id: 'bronco-busting',
        name: 'Bronco Busting',
        description: 'Break wild horses.',
        energyCost: 20,
        cooldownMinutes: 45,
        rewards: { goldMin: 20, goldMax: 35, xp: 35, items: [] },
        requirements: { minLevel: 8 }
      }
    ],
    shops: [],
    npcs: [
      {
        id: 'ranch-foreman',
        name: 'Buck Callahan',
        title: 'Ranch Foreman',
        description: 'A leathery veteran cowboy running operations.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: ['Hard work never killed anyone.', 'Keep your eyes open for rustlers.'],
        quests: ['stop-the-rustlers']
      }
    ],
    connections: [
      { targetLocationId: LOCATION_IDS.DUSTY_TRAIL.toString(), travelTime: 0, energyCost: 8, description: 'West to Dusty Trail' },
      { targetLocationId: LOCATION_IDS.SPIRIT_SPRINGS.toString(), travelTime: 0, energyCost: 10, description: 'South to Spirit Springs' }
    ],
    dangerLevel: 4,
    factionInfluence: { settlerAlliance: 75, nahiCoalition: 10, frontera: 15 },
    isUnlocked: true,
    isHidden: false
  },

  // ===== 11. SPIRIT SPRINGS =====
  {
    _id: LOCATION_IDS.SPIRIT_SPRINGS,
    name: 'Spirit Springs',
    description: 'Natural hot springs with healing properties, considered sacred by all factions. A rare neutral ground.',
    shortDescription: 'Sacred hot springs (neutral ground)',
    type: 'springs',
    region: 'sacred_lands',
    zone: ZONES.COALITION_LANDS,
    isZoneHub: false,
    icon: '♨️',
    atmosphere: 'Steam rises from turquoise pools. Peace prevails here - weapons are forbidden.',
    availableActions: [],
    availableCrimes: [],
    jobs: [
      {
        id: 'spring-keeper',
        name: 'Spring Keeper',
        description: 'Maintain the springs and assist visitors.',
        energyCost: 10,
        cooldownMinutes: 30,
        rewards: { goldMin: 10, goldMax: 18, xp: 20, items: [] },
        requirements: { minLevel: 1 }
      }
    ],
    shops: [
      {
        id: 'healer-tent',
        name: "Healer's Tent",
        description: 'Medicines from all traditions.',
        shopType: 'medicine',
        items: [
          { itemId: 'health-tonic', name: 'Health Tonic', description: 'Restores vitality', price: 25 },
          { itemId: 'spring-water', name: 'Sacred Spring Water', description: 'Blessed healing water', price: 40 },
          { itemId: 'poultice', name: 'Healing Poultice', description: 'Treats wounds', price: 15 }
        ],
        buyMultiplier: 0.5
      }
    ],
    npcs: [
      {
        id: 'medicine-woman',
        name: 'Silent Rain',
        title: 'Medicine Woman',
        description: 'A Nahi healer who treats all who come in peace.',
        faction: 'NAHI_COALITION',
        dialogue: ['All living things deserve healing.', 'The waters know your true self.'],
        quests: ['gather-rare-herbs']
      }
    ],
    connections: [
      { targetLocationId: LOCATION_IDS.LONGHORN_RANCH.toString(), travelTime: 0, energyCost: 10, description: 'North to Longhorn Ranch' },
      { targetLocationId: LOCATION_IDS.WHISKEY_BEND.toString(), travelTime: 0, energyCost: 12, description: 'East to Whiskey Bend' }
    ],
    dangerLevel: 1,
    factionInfluence: { settlerAlliance: 33, nahiCoalition: 34, frontera: 33 },
    isUnlocked: true,
    isHidden: false
  },

  // ===== 12. WHISKEY BEND =====
  {
    _id: LOCATION_IDS.WHISKEY_BEND,
    name: 'Whiskey Bend',
    description: 'A rough town built around gambling halls and saloons. Every vice is available for a price. Information flows freely here.',
    shortDescription: 'Gambling and vice town',
    type: 'settlement',
    region: 'frontier',
    zone: ZONES.FRONTIER,
    isZoneHub: true,
    icon: '🎰',
    atmosphere: 'Piano music and laughter spill from every doorway. Cards shuffle and dice roll at all hours.',
    availableActions: [],
    availableCrimes: ['Rob Saloon', 'Pickpocket Drunk', 'Bank Heist'],
    jobs: [
      {
        id: 'dealer',
        name: 'Card Dealer',
        description: 'Deal poker and faro.',
        energyCost: 15,
        cooldownMinutes: 30,
        rewards: { goldMin: 15, goldMax: 30, xp: 25, items: [] },
        requirements: { minLevel: 3 }
      },
      {
        id: 'bouncer',
        name: 'Saloon Bouncer',
        description: 'Keep order in rowdy establishments.',
        energyCost: 15,
        cooldownMinutes: 30,
        rewards: { goldMin: 18, goldMax: 28, xp: 25, items: [] },
        requirements: { minLevel: 5 }
      },
      {
        id: 'information-gathering',
        name: 'Gather Information',
        description: 'Listen to gossip and piece together intelligence.',
        energyCost: 10,
        cooldownMinutes: 20,
        rewards: { goldMin: 10, goldMax: 20, xp: 20, items: [] },
        requirements: { minLevel: 1 }
      }
    ],
    shops: [
      {
        id: 'lucky-lady-store',
        name: 'Lucky Lady General',
        description: 'Supplies for the gambling crowd.',
        shopType: 'general',
        items: [
          { itemId: 'playing-cards', name: 'Deck of Cards', description: 'Standard playing cards', price: 3 },
          { itemId: 'lucky-charm', name: 'Lucky Rabbit\'s Foot', description: 'Might improve luck', price: 20 },
          { itemId: 'whiskey-bottle', name: 'Whiskey Bottle', description: 'Liquid courage', price: 8 }
        ],
        buyMultiplier: 0.5
      }
    ],
    npcs: [
      {
        id: 'gambler-jack',
        name: '"Lucky" Jack Malone',
        title: 'Information Broker',
        description: 'An Irish card sharp who knows everyone\'s secrets.',
        faction: 'FRONTERA',
        dialogue: ['Information is the true currency.', 'Care for a friendly game?'],
        quests: ['high-stakes-poker']
      }
    ],
    connections: [
      { targetLocationId: LOCATION_IDS.SPIRIT_SPRINGS.toString(), travelTime: 0, energyCost: 12, description: 'West to Spirit Springs' },
      { targetLocationId: LOCATION_IDS.RED_GULCH.toString(), travelTime: 0, energyCost: 15, description: 'North to Red Gulch' },
      { targetLocationId: LOCATION_IDS.COYOTES_CROSSROADS.toString(), travelTime: 0, energyCost: 10, description: 'West to Coyote\'s Crossroads' }
    ],
    dangerLevel: 5,
    factionInfluence: { settlerAlliance: 45, nahiCoalition: 5, frontera: 50 },
    isUnlocked: true,
    isHidden: false
  },

  // ===== 13. THE WASTES - LAWLESS DESERT WASTELAND =====
  {
    _id: LOCATION_IDS.THE_WASTES,
    name: 'The Wastes',
    description: 'A harsh, lawless desert region where civilization has collapsed into savage survival. Raiders, scavengers, and desperate souls eke out brutal existences among the sun-bleached ruins and rust-red dunes. This is where the Mad Max wasteland meets the Old West - a place of blood sport, stolen goods, and the strong preying on the weak. The law holds no power here. Only strength, cunning, and ruthlessness determine who survives.',
    shortDescription: 'Lawless desert wasteland (raider territory)',
    type: 'wasteland',
    region: 'dusty_flats',
    zone: ZONES.OUTLAW_TERRITORY,
    isZoneHub: false,
    icon: '☠️',
    atmosphere: 'Dust devils dance across cracked earth. Scavenged metal structures rust under a merciless sun. The air shimmers with heat and the stench of desperation. Distant screams from the fighting pits echo across the dunes. Carrion birds circle endlessly. This is a land where hope died and predators thrived.',
    availableActions: [],
    availableCrimes: ['Rob Caravan', 'Raid Settlement', 'Murder for Hire', 'Steal Supplies'],
    jobs: [],
    shops: [],
    npcs: [],
    connections: [
      { targetLocationId: LOCATION_IDS.DUSTY_TRAIL.toString(), travelTime: 0, energyCost: 20, description: 'Northeast to Dusty Trail' },
      { targetLocationId: LOCATION_IDS.THE_FRONTERA.toString(), travelTime: 0, energyCost: 18, description: 'East to The Frontera' },
      { targetLocationId: LOCATION_IDS.THE_BADLANDS.toString(), travelTime: 0, energyCost: 15, description: 'West to The Badlands' }
    ],
    dangerLevel: 8,
    factionInfluence: { settlerAlliance: 5, nahiCoalition: 0, frontera: 95 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 25 }
  },

  // ===== 14. WHISPERING STONES - Circle of the Ancients =====
  {
    _id: LOCATION_IDS.WHISPERING_STONES,
    name: 'Whispering Stones',
    description: 'A perfect circle of seven standing stones atop a windswept plateau. Each stone is 15 feet tall, carved from black basalt not native to this region. The stones emit continuous low-frequency sounds - whispers that some claim to understand before going mad.',
    shortDescription: 'Ancient stone circle (dangerous)',
    type: 'sacred_site',
    region: 'sacred_lands',
    zone: ZONES.SACRED_MOUNTAINS,
    isZoneHub: false,
    icon: '🗿',
    atmosphere: 'The constant whispers fill your mind. The stones are cold to the touch, even under the blazing sun. Compasses spin wildly here. Those who listen too long hear prophecy... or madness.',
    availableActions: [],
    availableCrimes: [],
    jobs: [],
    shops: [],
    npcs: [],
    connections: [
      { targetLocationId: LOCATION_IDS.THUNDERBIRDS_PERCH.toString(), travelTime: 0, energyCost: 15, description: 'South to Thunderbird\'s Perch' }
    ],
    dangerLevel: 10,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 50, frontera: 0 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 25 }
  },

  // ===== 15. ANCESTOR'S SPRING (Destroyed) =====
  {
    _id: LOCATION_IDS.ANCESTORS_SPRING,
    name: "Ancestor's Spring",
    description: 'Once the most sacred Tseka site, now a scar of mud, rubble, and mine tailings. The spring ran dry in 1867 when mining disrupted the aquifer. Dead cottonwoods stand like gravestones over what was lost forever.',
    shortDescription: 'Destroyed sacred spring (Coalition grief)',
    type: 'ruins',
    region: 'sacred_lands',
    zone: ZONES.COALITION_LANDS,
    isZoneHub: false,
    icon: '💔',
    atmosphere: 'The land itself feels wounded. Bitter spirits linger here. Coalition members who visit experience profound grief. Some report hearing water flowing - the ghost of the spring.',
    availableActions: [],
    availableCrimes: [],
    jobs: [],
    shops: [],
    npcs: [],
    connections: [
      { targetLocationId: LOCATION_IDS.KAIOWA_MESA.toString(), travelTime: 0, energyCost: 10, description: 'North to Kaiowa Mesa' }
    ],
    dangerLevel: 5,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 100, frontera: 0 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 10 }
  },

  // ===== 16. BONE GARDEN - Where the Dead Speak =====
  {
    _id: LOCATION_IDS.BONE_GARDEN,
    name: 'Bone Garden',
    description: 'A hidden valley filled with thousands of burial cairns, bone scaffolds, and grave markers. This is the primary burial site for all three Coalition nations. The sheer number of dead creates a powerful spiritual nexus where the Bone Mother presides.',
    shortDescription: 'Ancient burial ground (spirits)',
    type: 'sacred_site',
    region: 'sacred_lands',
    zone: ZONES.COALITION_LANDS,
    isZoneHub: false,
    icon: '💀',
    atmosphere: 'Whispers of the dead surround you. The Bone Mother judges all who enter. Offerings must be left at the entrance. Those who show respect may speak with ancestors. Those who violate the garden face ancient curses.',
    availableActions: [],
    availableCrimes: [],
    jobs: [],
    shops: [],
    npcs: [
      {
        id: 'bone-mother-spirit',
        name: 'The Bone Mother',
        title: 'Guardian of the Dead',
        description: 'An ancient death spirit appearing as a skeletal figure in tattered burial shroud.',
        dialogue: ['Leave your offering...', 'The dead have much to say to those who listen...'],
        quests: ['speak-with-dead']
      }
    ],
    connections: [
      { targetLocationId: LOCATION_IDS.KAIOWA_MESA.toString(), travelTime: 0, energyCost: 12, description: 'East to Kaiowa Mesa' }
    ],
    dangerLevel: 7,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 100, frontera: 0 },
    isUnlocked: true,
    isHidden: true,
    requirements: { minLevel: 15, faction: 'NAHI_COALITION', factionStanding: 'friendly' }
  },

  // ===== 17. ECHO CAVES - Halls of Prophecy =====
  {
    _id: LOCATION_IDS.ECHO_CAVES,
    name: 'Echo Caves',
    description: 'A vast cave system with extraordinary acoustic properties. Sounds echo for minutes, creating overlapping layers. Some echoes seem to originate from the future - sounds that haven\'t happened yet.',
    shortDescription: 'Prophetic cave system',
    type: 'cave',
    region: 'devils_canyon',
    zone: ZONES.SANGRE_CANYON,
    isZoneHub: false,
    icon: '🔊',
    atmosphere: 'Time feels thin here. Past, present, and future blur in the echoing chambers. Shamans use these caves for prophecy. The deeper you go, the stranger the echoes become.',
    availableActions: [],
    availableCrimes: [],
    jobs: [
      {
        id: 'cave-exploration',
        name: 'Explore Caves',
        description: 'Map deeper sections of the cave system.',
        energyCost: 20,
        cooldownMinutes: 60,
        rewards: { goldMin: 10, goldMax: 30, xp: 40, items: ['cave-crystal'] },
        requirements: { minLevel: 10 }
      }
    ],
    shops: [],
    npcs: [],
    connections: [
      { targetLocationId: LOCATION_IDS.SANGRE_CANYON.toString(), travelTime: 0, energyCost: 8, description: 'South to Sangre Canyon' }
    ],
    dangerLevel: 6,
    factionInfluence: { settlerAlliance: 20, nahiCoalition: 50, frontera: 30 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 8 }
  },

  // ===== 18. COYOTE'S CROSSROADS =====
  {
    _id: LOCATION_IDS.COYOTES_CROSSROADS,
    name: "Coyote's Crossroads",
    description: 'The only place where four canyons intersect, creating a perfect cross shape. This is the domain of the Coyote King, the trickster spirit. Strange things happen here - nothing is as it seems.',
    shortDescription: 'Trickster spirit domain',
    type: 'sacred_site',
    region: 'frontier',
    zone: ZONES.FRONTIER,
    isZoneHub: false,
    icon: '🦊',
    atmosphere: 'Luck bends strangely here. The Coyote King appears to test the worthy - or humiliate the foolish. Those who pass his trials gain blessings. Those who fail... learn lessons the hard way.',
    availableActions: [],
    availableCrimes: [],
    jobs: [],
    shops: [],
    npcs: [
      {
        id: 'coyote-king-avatar',
        name: 'Laughing Coyote',
        title: 'Mysterious Stranger',
        description: 'A figure who might be the Coyote King himself - or just a very clever old man.',
        dialogue: ['Care to play a game?', 'The crossroads remember those who pass through...', 'Fortune favors the bold and the foolish equally.'],
        quests: ['coyotes-trial']
      }
    ],
    connections: [
      { targetLocationId: LOCATION_IDS.WHISKEY_BEND.toString(), travelTime: 0, energyCost: 10, description: 'East to Whiskey Bend' },
      { targetLocationId: LOCATION_IDS.SANGRE_CANYON.toString(), travelTime: 0, energyCost: 12, description: 'North to Sangre Canyon' }
    ],
    dangerLevel: 5,
    factionInfluence: { settlerAlliance: 20, nahiCoalition: 30, frontera: 50 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 5 }
  },

  // ===== 19. THE RAILROAD WOUND =====
  {
    _id: LOCATION_IDS.RAILROAD_WOUND,
    name: 'The Railroad Wound',
    description: 'Where the railroad tracks cut through Kaiowa sacred lands. The Coalition calls it "The Railroad Wound" - a scar where technology violated sacred balance. The Iron Horse Revenant, a ghost train, is said to appear at midnight.',
    shortDescription: 'Railroad through sacred land',
    type: 'train_station',
    region: 'town',
    zone: ZONES.SETTLER_TERRITORY,
    isZoneHub: false,
    icon: '🚂',
    atmosphere: 'Iron rails slice through red stone. Scattered buffalo bones bleach in the sun. Workers speak of accidents and a ghost train that runs the old routes. The land itself seems to resist progress.',
    availableActions: [],
    availableCrimes: ['Train Robbery', 'Sabotage'],
    jobs: [
      {
        id: 'railroad-work',
        name: 'Railroad Work',
        description: 'Maintain the tracks and assist operations.',
        energyCost: 20,
        cooldownMinutes: 45,
        rewards: { goldMin: 15, goldMax: 30, xp: 30, items: [] },
        requirements: { minLevel: 1 }
      }
    ],
    shops: [],
    npcs: [
      {
        id: 'railroad-foreman',
        name: 'Hank Wheeler',
        title: 'Railroad Foreman',
        description: 'A gruff man who dismisses talk of ghosts but crosses himself when the midnight train whistle blows.',
        faction: 'SETTLER_ALLIANCE',
        dialogue: ['We got schedules to keep.', 'Don\'t listen to superstitious nonsense.'],
        quests: ['ghost-train-investigation']
      }
    ],
    connections: [
      { targetLocationId: LOCATION_IDS.RED_GULCH.toString(), travelTime: 0, energyCost: 8, description: 'West to Red Gulch' },
      { targetLocationId: LOCATION_IDS.KAIOWA_MESA.toString(), travelTime: 0, energyCost: 12, description: 'North to Kaiowa Mesa' }
    ],
    dangerLevel: 4,
    factionInfluence: { settlerAlliance: 85, nahiCoalition: 5, frontera: 10 },
    isUnlocked: true,
    isHidden: false
  },

  // ===== 20. THE BADLANDS =====
  {
    _id: LOCATION_IDS.THE_BADLANDS,
    name: 'The Badlands',
    description: 'A volcanic desolation of black rock, hot springs, and sulfurous vents. Nothing grows here. The most desperate outlaws and the most dangerous predators make their homes in this hellscape.',
    shortDescription: 'Volcanic desolation',
    type: 'wilderness',
    region: 'outlaw_territory',
    zone: ZONES.OUTLAW_TERRITORY,
    isZoneHub: false,
    icon: '🌋',
    atmosphere: 'Sulfur burns your nostrils. Steam vents hiss from cracks in the black stone. The heat is oppressive even at night. Only the truly desperate or truly dangerous come here.',
    availableActions: [],
    availableCrimes: [],
    jobs: [
      {
        id: 'sulfur-mining',
        name: 'Collect Sulfur',
        description: 'Harvest sulfur deposits from the vents.',
        energyCost: 25,
        cooldownMinutes: 60,
        rewards: { goldMin: 20, goldMax: 40, xp: 35, items: ['sulfur'] },
        requirements: { minLevel: 15 }
      }
    ],
    shops: [],
    npcs: [],
    connections: [
      { targetLocationId: LOCATION_IDS.THE_WASTES.toString(), travelTime: 0, energyCost: 15, description: 'East to The Wastes' },
      { targetLocationId: LOCATION_IDS.THE_FRONTERA.toString(), travelTime: 0, energyCost: 18, description: 'North to The Frontera' }
    ],
    dangerLevel: 9,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 0, frontera: 100 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 20 }
  },

  // ===== 21. SACRED HEART MOUNTAINS =====
  {
    _id: LOCATION_IDS.SACRED_HEART_MOUNTAINS,
    name: 'Sacred Heart Mountains',
    description: 'The towering peaks that guard the northern reaches. Ancient spirits dwell in these heights. The air grows thin and the paths treacherous. Only the most devoted pilgrims reach the summit shrines.',
    shortDescription: 'Mystical mountain range',
    type: 'sacred_site',
    region: 'sangre_mountains',
    zone: ZONES.SACRED_MOUNTAINS,
    isZoneHub: false,
    icon: '🏔️',
    atmosphere: 'The wind carries voices of ancestors. Prayer flags flutter from every peak. Snow caps gleam even in summer. The spirits here are ancient beyond memory.',
    availableActions: [],
    availableCrimes: [],
    jobs: [
      {
        id: 'mountain-guide',
        name: 'Mountain Guide',
        description: 'Lead pilgrims safely through the passes.',
        energyCost: 20,
        cooldownMinutes: 45,
        rewards: { goldMin: 15, goldMax: 28, xp: 35, items: [] },
        requirements: { minLevel: 12 }
      }
    ],
    shops: [],
    npcs: [],
    connections: [
      { targetLocationId: LOCATION_IDS.THUNDERBIRDS_PERCH.toString(), travelTime: 0, energyCost: 10, description: 'East to Thunderbird\'s Perch' },
      { targetLocationId: LOCATION_IDS.THE_SCAR.toString(), travelTime: 0, energyCost: 12, description: 'South to The Scar' }
    ],
    dangerLevel: 8,
    factionInfluence: { settlerAlliance: 5, nahiCoalition: 90, frontera: 5 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 18 }
  },

  // ===== 22. DEAD MAN'S STRETCH =====
  {
    _id: LOCATION_IDS.DEAD_MANS_STRETCH,
    name: "Dead Man's Stretch",
    description: 'A treacherous passage through the canyon where countless travelers have met their end. Bleached bones line the trail. Bandits lurk in the shadows. The only direct route between settlements - and the most dangerous.',
    shortDescription: 'Deadly canyon passage',
    type: 'canyon',
    region: 'devils_canyon',
    zone: ZONES.SANGRE_CANYON,
    isZoneHub: false,
    icon: '☠️',
    atmosphere: 'The walls close in here. Shadows hide a thousand ambush points. Vultures circle overhead. Every traveler moves with hand on weapon, eyes scanning the cliffs.',
    availableActions: [],
    availableCrimes: ['Stage Coach Robbery', 'Ambush Travelers'],
    jobs: [
      {
        id: 'stretch-escort',
        name: 'Escort Duty',
        description: 'Guard travelers through the most dangerous stretch.',
        energyCost: 25,
        cooldownMinutes: 60,
        rewards: { goldMin: 30, goldMax: 50, xp: 45, items: [] },
        requirements: { minLevel: 10 }
      }
    ],
    shops: [],
    npcs: [],
    connections: [
      { targetLocationId: LOCATION_IDS.SANGRE_CANYON.toString(), travelTime: 0, energyCost: 10, description: 'North to Sangre Canyon' },
      { targetLocationId: LOCATION_IDS.DUSTY_TRAIL.toString(), travelTime: 0, energyCost: 12, description: 'South to Dusty Trail' }
    ],
    dangerLevel: 9,
    factionInfluence: { settlerAlliance: 20, nahiCoalition: 20, frontera: 60 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 8 }
  }
];

/**
 * Seed locations into the database
 */
export async function seedLocations(): Promise<void> {
  try {
    // Clear existing locations
    await Location.deleteMany({});

    // Insert new locations
    await Location.insertMany([...locationSeeds, ...frontierLocations]);

    console.log(`Successfully seeded ${locationSeeds.length + frontierLocations.length} locations`);
  } catch (error) {
    logger.error('Error seeding locations', { error: error instanceof Error ? error.message : error });
    throw error;
  }
}

export default locationSeeds;
