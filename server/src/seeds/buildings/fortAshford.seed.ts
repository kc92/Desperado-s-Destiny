/**
 * Fort Ashford Buildings Seed Data
 *
 * Military outpost location - Settler Alliance stronghold
 * Theme: Law enforcement hub, military operations, frontier defense
 *
 * Schema matches whiskeyBend.seed.ts format for Location model compatibility
 */

import mongoose from 'mongoose';
import { Location } from '../../models/Location.model';
import { LOCATION_IDS } from '../locations.seed';

// Building IDs for Fort Ashford
export const FORT_ASHFORD_BUILDING_IDS = {
  COMMANDERS_QUARTERS: new mongoose.Types.ObjectId('6505a0000000000000000001'),
  FORT_ARMORY: new mongoose.Types.ObjectId('6505a0000000000000000002'),
  ARMY_BARRACKS: new mongoose.Types.ObjectId('6505a0000000000000000003'),
  FORT_INFIRMARY: new mongoose.Types.ObjectId('6505a0000000000000000004'),
  STOCKADE: new mongoose.Types.ObjectId('6505a0000000000000000005'),
  CAVALRY_STABLES: new mongoose.Types.ObjectId('6505a0000000000000000006'),
  TELEGRAPH_OFFICE: new mongoose.Types.ObjectId('6505a0000000000000000007'),
  SUTLERS_STORE: new mongoose.Types.ObjectId('6505a0000000000000000008'),
  PARADE_GROUND: new mongoose.Types.ObjectId('6505a0000000000000000009'),
  OFFICERS_QUARTERS: new mongoose.Types.ObjectId('6505a000000000000000000a'),
  ENLISTED_CANTEEN: new mongoose.Types.ObjectId('6505a000000000000000000b'),
  QUARTERMASTER_WAREHOUSE: new mongoose.Types.ObjectId('6505a000000000000000000c'),
};

const fortAshfordBuildings = [
  // ============================================================
  // 1. COMMANDER'S QUARTERS
  // ============================================================
  {
    _id: FORT_ASHFORD_BUILDING_IDS.COMMANDERS_QUARTERS,
    name: "Commander's Quarters",
    description: "The heart of Fort Ashford's military operations. A sturdy two-story building with the American flag flying proudly above. Colonel Whitmore runs his command from a spartan office lined with maps, battle reports, and commendations. The air smells of cigars and discipline.",
    shortDescription: 'Military command center',
    type: 'fort',
    region: 'town',
    parentId: LOCATION_IDS.FORT_ASHFORD,
    tier: 4,
    dominantFaction: 'settlerAlliance',
    operatingHours: { open: 6, close: 22 },
    atmosphere: 'A sturdy two-story building with the American flag flying proudly above. Maps and battle reports line the walls. The smell of cigars and discipline permeates the air.',
    npcs: [
      {
        id: 'colonel_whitmore',
        name: 'Colonel James Whitmore',
        title: 'Fort Commander',
        description: 'A career military man with steel-gray hair and ramrod posture. His uniform is immaculate, his mustache precisely trimmed. He has no patience for lawlessness, but respects competence and courage. Twenty years of frontier service have made him as hard as the territory itself.',
        personality: 'Stern, honorable, by-the-book, uncompromising on duty but fair in judgment',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          "State your business, civilian. The Army doesn't have time for idle conversation.",
          "Fort Ashford maintains order in this godforsaken territory. We do what the politicians won't.",
          "I've seen good men die out here. Don't become another casualty statistic.",
          "The Nahi respect strength. The outlaws respect firepower. We provide both.",
        ],
        quests: ['military_contract_001', 'bounty_hunter_certification'],
        isVendor: true,
        shopId: 'commanders_quarters_shop',
      },
    ],
    availableActions: ['report_for_duty', 'request_mission', 'military_briefing'],
    availableCrimes: ['Steal Military Documents', 'Impersonate Officer'],
    jobs: [
      {
        id: 'military_patrol_duty',
        name: 'Military Patrol Duty',
        description: 'Join a cavalry patrol around Fort Ashford perimeter. Keep watch for hostile activity and report any suspicious movement.',
        energyCost: 20,
        cooldownMinutes: 60,
        rewards: { goldMin: 40, goldMax: 60, xp: 50, items: ['military_rations'] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'bounty_hunter_contract',
        name: 'Bounty Hunter Contract',
        description: "Accept an official Army bounty contract. Track down wanted criminals and bring them to military justice. The Colonel doesn't care if they're breathing when you deliver them.",
        energyCost: 35,
        cooldownMinutes: 120,
        rewards: { goldMin: 100, goldMax: 150, xp: 120, items: ['bounty_warrant', 'army_commendation'] },
        requirements: { minLevel: 8 },
      },
      {
        id: 'special_operations_mission',
        name: 'Special Operations',
        description: 'High-risk classified missions for experienced operatives only. The Colonel will brief you personally. Extreme danger, extreme pay.',
        energyCost: 50,
        cooldownMinutes: 240,
        rewards: { goldMin: 200, goldMax: 300, xp: 250, items: ['classified_orders', 'special_ops_pay'] },
        requirements: { minLevel: 15 },
      },
    ],
    shops: [
      {
        id: 'commanders_quarters_shop',
        name: 'Military Surplus Store',
        description: "The Army quartermaster sells surplus equipment from the Commander's office. Standard-issue gear, proven reliable in frontier combat.",
        shopType: 'weapons',
        items: [
          { itemId: 'army_revolver', name: 'Army Revolver', description: 'Standard-issue cavalry revolver. Reliable, accurate, deadly.', price: 120, requiredLevel: 5 },
          { itemId: 'cavalry_carbine', name: 'Cavalry Carbine', description: 'Short rifle designed for mounted combat. Army tested, outlaw approved.', price: 200, requiredLevel: 8 },
          { itemId: 'army_ammunition_box', name: 'Army Ammunition (50 rounds)', description: 'Quality military ammunition. Never misfires.', price: 30 },
          { itemId: 'officers_saber', name: "Officer's Saber", description: 'Ceremonial blade, but sharp enough for real combat.', price: 150, requiredLevel: 6 },
          { itemId: 'military_uniform', name: 'Military Uniform', description: 'Grants authority and respect. Opens certain doors, closes others.', price: 80, requiredLevel: 5 },
        ],
        buyMultiplier: 0.6,
      },
    ],
    secrets: [
      {
        id: 'war_records_room',
        name: 'War Records Room',
        description: "A locked room behind the Colonel's office containing classified military documents. Reports of Indian campaigns, deserter lists, and records of incidents the Army would prefer forgotten. The truth of what happened at Broken Arrow Creek is in those files.",
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 70,
          npcTrust: { npcId: 'colonel_whitmore', level: 4 },
        },
        content: {
          actions: ['study_records', 'copy_documents'],
          npcs: [],
          dialogue: [
            "\"You've earned my trust. There are things in those records... things that need to see daylight. Just not official daylight, if you understand me.\"",
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 3,
    factionInfluence: { settlerAlliance: 90, nahiCoalition: 5, frontera: 5 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 5 },
  },

  // ============================================================
  // 2. FORT ARMORY
  // ============================================================
  {
    _id: FORT_ASHFORD_BUILDING_IDS.FORT_ARMORY,
    name: 'Fort Armory',
    description: 'A reinforced stone building with iron-barred windows. Racks of rifles line the walls, ammunition crates are stacked to the ceiling, and the smell of gun oil is thick in the air. Sergeant Cortez runs this arsenal with military precision and personal pride.',
    shortDescription: 'Military weapons storage',
    type: 'fort',
    region: 'town',
    parentId: LOCATION_IDS.FORT_ASHFORD,
    tier: 4,
    dominantFaction: 'settlerAlliance',
    operatingHours: { open: 5, close: 23 },
    atmosphere: 'Iron-barred windows filter light onto racks of rifles. Ammunition crates stack to the ceiling. The smell of gun oil is thick in the air.',
    npcs: [
      {
        id: 'sergeant_cortez',
        name: 'Sergeant Elena Cortez',
        title: 'Armory Sergeant',
        description: 'A tough-as-nails Mexican-American woman who earned her stripes fighting Apaches and outlaws. She has a scar across her left cheek and callused hands from years of weapons maintenance. Cortez demands respect and gives it to those who prove themselves worthy.',
        personality: 'Tough, fair, professional, no-nonsense but has dark humor',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          "You handle that weapon like you know what you're doing. Good. Fools get themselves killed.",
          "Every gun in this armory has a story. Most of them end with someone in the ground.",
          "The Colonel runs Fort Ashford. I make sure we have the firepower to back up his orders.",
          "I don't care what you are - man, woman, settler, Nahi. Can you shoot straight? That's all that matters.",
        ],
        quests: ['armory_guard_duty', 'weapons_inspection'],
        isVendor: true,
        shopId: 'fort_armory_shop',
      },
    ],
    availableActions: ['inspect_weapons', 'request_equipment', 'firearms_training'],
    availableCrimes: ['Steal Weapons', 'Sabotage Arsenal'],
    jobs: [
      {
        id: 'armory_guard_duty',
        name: 'Armory Guard Duty',
        description: "Stand watch over the fort's weapons cache. Boring work, but critical. One theft could arm a dozen outlaws.",
        energyCost: 15,
        cooldownMinutes: 60,
        rewards: { goldMin: 30, goldMax: 50, xp: 40, items: [] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'weapons_maintenance',
        name: 'Weapons Maintenance',
        description: 'Clean, oil, and repair Army weapons. Sergeant Cortez expects perfection. A jammed rifle in battle means a dead soldier.',
        energyCost: 20,
        cooldownMinutes: 90,
        rewards: { goldMin: 50, goldMax: 70, xp: 60, items: ['gun_oil', 'cleaning_kit'] },
        requirements: { minLevel: 6 },
      },
      {
        id: 'artillery_training',
        name: 'Artillery Training',
        description: "Learn to operate the fort's artillery pieces. Heavy weapons for serious threats. Cortez only teaches those she trusts.",
        energyCost: 30,
        cooldownMinutes: 180,
        rewards: { goldMin: 80, goldMax: 120, xp: 150, items: ['artillery_certification'] },
        requirements: { minLevel: 12 },
      },
    ],
    shops: [
      {
        id: 'fort_armory_shop',
        name: 'Premium Weapons Arsenal',
        description: "Sergeant Cortez's personal collection of premium firearms. Not standard issue - these are the weapons that win wars.",
        shopType: 'weapons',
        items: [
          { itemId: 'sharpshooter_rifle', name: 'Sharpshooter Rifle', description: 'Long-range precision rifle. Can drop a target at 500 yards.', price: 350, requiredLevel: 10 },
          { itemId: 'double_barrel_shotgun', name: 'Double Barrel Shotgun', description: 'Close-range devastation. Both barrels will stop a charging bear.', price: 280, requiredLevel: 8 },
          { itemId: 'gatling_gun_parts', name: 'Gatling Gun Parts', description: 'Experimental rapid-fire weapon components. Assembly required.', price: 800, requiredLevel: 15 },
          { itemId: 'explosive_rounds', name: 'Explosive Rounds (12)', description: 'Special ammunition that explodes on impact. Highly illegal in most territories.', price: 150, requiredLevel: 12 },
          { itemId: 'reinforced_armor', name: 'Reinforced Armor Vest', description: "Won't stop everything, but it'll keep you breathing longer in a firefight.", price: 220, requiredLevel: 9 },
        ],
        buyMultiplier: 0.5,
      },
    ],
    secrets: [
      {
        id: 'experimental_weapons_cache',
        name: 'Experimental Weapons Cache',
        description: 'A hidden cellar beneath the armory where Cortez keeps experimental weapons - prototypes, captured enemy technology, and devices the Army officially denies exist. The repeating shotgun alone is worth a fortune.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 60,
          npcTrust: { npcId: 'sergeant_cortez', level: 4 },
        },
        content: {
          actions: ['access_experimental_weapons'],
          npcs: [],
          dialogue: [
            "\"Don't tell the Colonel. Hell, don't tell anyone. These beauties aren't in any official inventory, and I aim to keep it that way.\"",
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 4,
    factionInfluence: { settlerAlliance: 85, nahiCoalition: 5, frontera: 10 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 5 },
  },

  // ============================================================
  // 3. ARMY BARRACKS
  // ============================================================
  {
    _id: FORT_ASHFORD_BUILDING_IDS.ARMY_BARRACKS,
    name: 'Army Barracks',
    description: 'Long wooden building divided into sleeping quarters for enlisted men. Bunks are neatly made, footlockers are uniform, and the smell of sweat and boot polish hangs in the air. Young soldiers play cards, write letters home, and try not to think about tomorrow.',
    shortDescription: 'Soldier sleeping quarters',
    type: 'fort',
    region: 'town',
    parentId: LOCATION_IDS.FORT_ASHFORD,
    tier: 4,
    dominantFaction: 'settlerAlliance',
    operatingHours: { open: 0, close: 23 },
    atmosphere: 'Bunks are neatly made, footlockers uniform. The smell of sweat and boot polish. Young soldiers play cards and write letters home.',
    npcs: [
      {
        id: 'private_adams',
        name: 'Private Billy "Greenhorn" Adams',
        title: 'New Recruit',
        description: 'Fresh-faced farm boy from Illinois, barely eighteen years old. His uniform is too big, his hands shake when he loads his rifle, and he jumps at loud noises. He signed up for adventure and is terrified he might find it.',
        personality: 'Nervous, eager to prove himself, homesick, surprisingly kind',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          "F-first time at a military fort, sir? Ma'am? It's my first time too. Been here three weeks now.",
          "Sergeant Cortez says I'm improving with the rifle. I only hope she's right before we see real action.",
          "My ma wanted me to be a shopkeeper. Guess I wanted something more. Now I'm not so sure...",
          "The other soldiers tell stories about what's out there in the territory. I hope they're just trying to scare the greenhorn.",
        ],
        quests: ['protect_the_greenhorn', 'adams_family_letter'],
        isVendor: false,
      },
    ],
    availableActions: ['rest', 'play_cards', 'gather_rumors'],
    availableCrimes: ['Steal from Footlockers', 'Plant Contraband'],
    jobs: [
      {
        id: 'training_exercises',
        name: 'Training Exercises',
        description: 'Join the recruits in daily training drills. Marching, shooting practice, and physical conditioning. Builds discipline and combat readiness.',
        energyCost: 25,
        cooldownMinutes: 90,
        rewards: { goldMin: 35, goldMax: 55, xp: 80, items: [] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'patrol_missions',
        name: 'Patrol Missions',
        description: 'Escort new recruits on their first patrols. Keep them alive, teach them the territory, and bring them back in one piece.',
        energyCost: 30,
        cooldownMinutes: 120,
        rewards: { goldMin: 60, goldMax: 90, xp: 100, items: ['recruit_gratitude'] },
        requirements: { minLevel: 8 },
      },
      {
        id: 'survival_training',
        name: 'Survival Training',
        description: 'Teach soldiers how to survive in hostile territory - finding water, tracking, making shelter. Skills that save lives.',
        energyCost: 35,
        cooldownMinutes: 150,
        rewards: { goldMin: 70, goldMax: 100, xp: 130, items: ['survival_manual'] },
        requirements: { minLevel: 10 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'deserters_stash',
        name: "Deserter's Hidden Stash",
        description: "Hidden beneath a loose floorboard under the last bunk - a deserter's emergency cache. Papers for a fake identity, stolen Army gold, and a map to a hideout across the border. Someone was planning to run. They never made it.",
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 30,
          npcTrust: { npcId: 'private_adams', level: 3 },
        },
        content: {
          actions: ['take_stash', 'report_deserter'],
          npcs: [],
          dialogue: [
            '"I... I found this weeks ago. I know I should have reported it, but what if they think I was planning to desert? Please, you take it. I don\'t want any part of it."',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 95, nahiCoalition: 0, frontera: 5 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 5 },
  },

  // ============================================================
  // 4. FORT INFIRMARY
  // ============================================================
  {
    _id: FORT_ASHFORD_BUILDING_IDS.FORT_INFIRMARY,
    name: 'Fort Infirmary',
    description: 'A clean, well-organized medical facility that smells of carbolic acid and laudanum. Beds line both walls, most empty but some occupied by wounded soldiers. Dr. Chen moves between patients with calm efficiency, her skilled hands saving lives the Army takes for granted.',
    shortDescription: 'Military medical facility',
    type: 'fort',
    region: 'town',
    parentId: LOCATION_IDS.FORT_ASHFORD,
    tier: 4,
    dominantFaction: 'settlerAlliance',
    operatingHours: { open: 0, close: 23 },
    atmosphere: 'Clean and well-organized. Smell of carbolic acid and laudanum. Beds line both walls. Dr. Chen moves between patients with calm efficiency.',
    npcs: [
      {
        id: 'dr_chen',
        name: 'Dr. Margaret Chen',
        title: 'Fort Surgeon',
        description: 'Chinese-American doctor trained in San Francisco, one of the first women to practice frontier medicine. She treats arrow wounds and bullet holes with equal skill, combining Western medicine with traditional remedies. Her compassion is matched only by her surgical precision.',
        personality: 'Compassionate, brilliant, quietly fierce, sees the humanity in everyone',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          "Life is precious out here. I'll do everything in my power to preserve it.",
          "The Army hired me because no one else would take this posting. Now they can't function without me.",
          "I've treated soldiers, outlaws, and Nahi warriors on this same table. Pain doesn't discriminate.",
          "My father wanted me to marry a merchant. Instead I'm elbow-deep in battlefield surgery. I think I chose correctly.",
        ],
        quests: ['medical_supply_run', 'plague_outbreak'],
        isVendor: true,
        shopId: 'fort_infirmary_shop',
      },
    ],
    availableActions: ['heal', 'buy_medicine', 'volunteer'],
    availableCrimes: ['Steal Medical Supplies', 'Poison Medicine'],
    jobs: [
      {
        id: 'medical_supply_run',
        name: 'Medical Supply Run',
        description: 'Travel to town and bring back critical medical supplies. The wounded wait for no one.',
        energyCost: 20,
        cooldownMinutes: 120,
        rewards: { goldMin: 50, goldMax: 80, xp: 70, items: ['medical_supplies'] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'wound_treatment_assistant',
        name: 'Wound Treatment Assistant',
        description: 'Assist Dr. Chen with treating wounded soldiers. Hold them down during surgery, apply bandages, and learn frontier medicine.',
        energyCost: 25,
        cooldownMinutes: 90,
        rewards: { goldMin: 40, goldMax: 70, xp: 90, items: ['medical_knowledge'] },
        requirements: { minLevel: 6 },
      },
      {
        id: 'emergency_surgery',
        name: 'Emergency Surgery',
        description: "Critical case requires an extra pair of skilled hands. Dr. Chen needs someone who won't faint at the sight of blood.",
        energyCost: 35,
        cooldownMinutes: 180,
        rewards: { goldMin: 100, goldMax: 150, xp: 180, items: ['surgical_training', 'life_saved'] },
        requirements: { minLevel: 10 },
      },
    ],
    shops: [
      {
        id: 'fort_infirmary_shop',
        name: 'Medical Supplies',
        description: "Dr. Chen's collection of medicines, tonics, and medical equipment. Healing isn't cheap, but dying is more expensive.",
        shopType: 'medicine',
        items: [
          { itemId: 'health_tonic', name: 'Health Tonic', description: 'Restores 50 HP. Tastes terrible, works perfectly.', price: 25 },
          { itemId: 'strong_health_tonic', name: 'Strong Health Tonic', description: "Restores 100 HP. Dr. Chen's special formula.", price: 50, requiredLevel: 8 },
          { itemId: 'antivenom', name: 'Antivenom', description: 'Cures poison. Essential for surviving rattlesnake country.', price: 40 },
          { itemId: 'bandages', name: 'Bandages (10)', description: 'Stop bleeding, prevent infection. Every frontier kit needs these.', price: 15 },
          { itemId: 'laudanum', name: 'Laudanum', description: "Powerful painkiller. Use sparingly - it's addictive.", price: 35, requiredLevel: 6 },
          { itemId: 'surgery_kit', name: 'Surgery Kit', description: "Complete field surgery equipment. For when a bandage won't cut it.", price: 200, requiredLevel: 12 },
        ],
        buyMultiplier: 0.6,
      },
    ],
    secrets: [
      {
        id: 'experimental_treatments',
        name: 'Experimental Treatments Laboratory',
        description: "Dr. Chen's private research lab where she develops experimental medicines. Combination of Western pharmaceuticals and traditional Chinese remedies. The Army doesn't know half of what she's accomplished here.",
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 50,
          npcTrust: { npcId: 'dr_chen', level: 4 },
        },
        content: {
          actions: ['study_research', 'test_treatments'],
          npcs: [],
          dialogue: [
            '"I\'ve been working on something... a treatment that could revolutionize frontier medicine. But I need someone I trust to test it safely."',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 1,
    factionInfluence: { settlerAlliance: 80, nahiCoalition: 10, frontera: 10 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 1 },
  },

  // ============================================================
  // 5. STOCKADE (Military Prison)
  // ============================================================
  {
    _id: FORT_ASHFORD_BUILDING_IDS.STOCKADE,
    name: 'The Stockade',
    description: 'A grim stone building with barred windows and a heavy oak door. The military prison holds deserters, captured outlaws, and soldiers awaiting court martial. Warden Kane rules this place with an iron fist and a sadistic streak. Screams echo from the punishment cells at night.',
    shortDescription: 'Military prison',
    type: 'fort',
    region: 'town',
    parentId: LOCATION_IDS.FORT_ASHFORD,
    tier: 4,
    dominantFaction: 'settlerAlliance',
    operatingHours: { open: 0, close: 23 },
    atmosphere: 'Grim stone building with barred windows. Heavy oak door. Screams echo from punishment cells at night.',
    npcs: [
      {
        id: 'warden_kane',
        name: 'Warden Brutus Kane',
        title: 'Stockade Warden',
        description: 'A cruel mountain of a man with scarred knuckles and dead eyes. Kane was dishonorably discharged from the regular Army for "excessive force," so they made him warden where his brutality is considered useful. Prisoners fear him. Smart people stay clear of him.',
        personality: 'Cruel, corrupt, sadistic, but follows military law when it suits him',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          "You break the law in my territory, you answer to me. And I don't believe in second chances.",
          "These animals need a firm hand. Too firm for the regular Army, apparently. That's why I'm here.",
          "You want to interrogate a prisoner? That'll cost you. Everything costs in my stockade.",
          "I keep order here. What happens behind these walls stays behind these walls.",
        ],
        quests: ['prisoner_transfer', 'interrogation_specialist'],
        isVendor: false,
      },
    ],
    availableActions: ['visit_prisoner', 'interrogate', 'request_custody'],
    availableCrimes: ['Bribe Warden', 'Break Out Prisoner', 'Plant Evidence'],
    jobs: [
      {
        id: 'prisoner_transport',
        name: 'Prisoner Transport',
        description: "Help transport a dangerous prisoner to territorial prison. High risk - prisoners get desperate, and their friends get bold.",
        energyCost: 35,
        cooldownMinutes: 180,
        rewards: { goldMin: 100, goldMax: 150, xp: 140, items: ['transport_pay'] },
        requirements: { minLevel: 10 },
      },
      {
        id: 'interrogation_work',
        name: 'Interrogation Work',
        description: "Warden Kane needs someone to 'encourage' a prisoner to talk. Methods are... flexible. This is dark work that stains the soul.",
        energyCost: 30,
        cooldownMinutes: 240,
        rewards: { goldMin: 80, goldMax: 120, xp: 100, items: ['blood_money', 'extracted_information'] },
        requirements: { minLevel: 12 },
      },
      {
        id: 'guard_night_shift',
        name: 'Guard Night Shift',
        description: 'Stand watch during the night shift. Prisoners are most dangerous in the dark. Stay alert, stay alive.',
        energyCost: 20,
        cooldownMinutes: 120,
        rewards: { goldMin: 50, goldMax: 70, xp: 60, items: [] },
        requirements: { minLevel: 8 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'escape_tunnels',
        name: 'Escape Tunnels',
        description: 'A network of tunnels beneath the stockade, started by prisoners decades ago and expanded ever since. Some lead to collapsed dead ends. Others lead to freedom. Kane knows about them - he uses them to smuggle contraband and "accidentally" let certain prisoners escape... for a price.',
        type: 'hidden_room',
        unlockCondition: {
          minReputation: -20,
          npcTrust: { npcId: 'warden_kane', level: 3 },
        },
        content: {
          actions: ['access_escape_tunnels', 'smuggling_route'],
          npcs: [],
          dialogue: [
            '"You and me, we understand how things really work. The Colonel has his rules, I have mine. These tunnels? They\'re my insurance policy. And now they\'re yours too."',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 6,
    factionInfluence: { settlerAlliance: 70, nahiCoalition: 0, frontera: 30 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 8 },
  },

  // ============================================================
  // 6. CAVALRY STABLES
  // ============================================================
  {
    _id: FORT_ASHFORD_BUILDING_IDS.CAVALRY_STABLES,
    name: 'Cavalry Stables',
    description: "A sprawling stable complex housing the fort's cavalry horses. The smell of hay, leather, and horses fills the air. Rows of stalls house everything from standard cavalry mounts to championship thoroughbreds. Thomas Grey Cloud tends each animal with reverence and expertise.",
    shortDescription: 'Military horse stables',
    type: 'stables',
    region: 'town',
    parentId: LOCATION_IDS.FORT_ASHFORD,
    tier: 4,
    dominantFaction: 'settlerAlliance',
    operatingHours: { open: 4, close: 22 },
    atmosphere: 'Smell of hay, leather, and horses. Rows of stalls house cavalry mounts and championship thoroughbreds. Thomas Grey Cloud tends each animal with reverence.',
    npcs: [
      {
        id: 'thomas_grey_cloud',
        name: 'Thomas Grey Cloud',
        title: 'Cavalry Stable Master',
        description: "Half-Nahi, half-settler, fully respected by neither until they see him with horses. Thomas has a gift - horses trust him instantly, and he can gentle the wildest mustang. He wears his Nahi heritage proudly through his long braided hair while wearing an Army stable master's uniform.",
        personality: 'Quiet, deeply connected to horses, spiritual but practical, carries two cultures',
        faction: 'NAHI_COALITION',
        dialogue: [
          "A horse knows your heart before you speak a word. They are honest in ways people are not.",
          "My mother's people believe horses carry the spirits of warriors. My father's people see them as tools. Both are wrong. Both are right.",
          "The Army hired me because I'm the best. They tolerate my heritage because they need me. I tolerate them because the horses deserve good care.",
          "You want to understand this territory? Listen to the horses. They know things we've forgotten.",
        ],
        quests: ['wild_horse_taming', 'sacred_horse_lineage'],
        isVendor: true,
        shopId: 'cavalry_stables_shop',
      },
    ],
    availableActions: ['buy_horse', 'stable_horse', 'riding_lessons'],
    availableCrimes: ['Horse Theft', 'Poison Feed'],
    jobs: [
      {
        id: 'horse_training',
        name: 'Horse Training',
        description: 'Help Thomas train cavalry horses. Requires patience, skill, and genuine respect for the animals.',
        energyCost: 25,
        cooldownMinutes: 90,
        rewards: { goldMin: 50, goldMax: 80, xp: 90, items: ['horse_training_experience'] },
        requirements: { minLevel: 6 },
      },
      {
        id: 'messenger_runs',
        name: 'Urgent Messenger Run',
        description: 'Ride fast across dangerous territory to deliver urgent military dispatches. Speed and survival skills required.',
        energyCost: 30,
        cooldownMinutes: 120,
        rewards: { goldMin: 70, goldMax: 110, xp: 120, items: ['messenger_pay'] },
        requirements: { minLevel: 8 },
      },
      {
        id: 'wild_mustang_capture',
        name: 'Wild Mustang Capture',
        description: 'Track and capture wild mustangs for the cavalry. Thomas will teach you the old ways of horse hunting.',
        energyCost: 40,
        cooldownMinutes: 180,
        rewards: { goldMin: 120, goldMax: 180, xp: 200, items: ['wild_mustang', 'grey_cloud_respect'] },
        requirements: { minLevel: 12 },
      },
    ],
    shops: [
      {
        id: 'cavalry_stables_shop',
        name: 'Horses & Riding Gear',
        description: "Thomas Grey Cloud's selection of horses and quality riding equipment. He only sells to those who will treat horses with respect.",
        shopType: 'specialty',
        items: [
          { itemId: 'standard_cavalry_horse', name: 'Cavalry Horse', description: 'Reliable military mount. Trained for gunfire and steady in combat.', price: 250, requiredLevel: 6 },
          { itemId: 'thoroughbred_horse', name: 'Thoroughbred Racer', description: 'Fast, elegant, expensive. For those who value speed over stamina.', price: 450, requiredLevel: 10 },
          { itemId: 'war_horse', name: 'War Horse', description: 'Massive beast trained for cavalry charges. Fear incarnate.', price: 600, requiredLevel: 14 },
          { itemId: 'saddle_quality', name: 'Quality Saddle', description: 'Hand-tooled leather saddle. Comfortable for long rides.', price: 80 },
          { itemId: 'riding_boots', name: 'Riding Boots', description: 'Sturdy boots designed for hours in the stirrup.', price: 45 },
          { itemId: 'cavalry_tack', name: 'Cavalry Tack Set', description: 'Complete set of reins, bridle, and equipment.', price: 60 },
          { itemId: 'horse_medicine', name: 'Horse Medicine', description: 'Keep your mount healthy. A sick horse is a death sentence.', price: 30 },
        ],
        buyMultiplier: 0.5,
      },
    ],
    secrets: [
      {
        id: 'prize_stallion_bloodline',
        name: 'Sacred Bloodline Stallion',
        description: "In a private paddock behind the stables - a magnificent black stallion descended from Spanish conquistador horses and Nahi spirit-horses. Thomas has been protecting this bloodline for years, breeding the perfect mount that combines the best of both worlds. He'll only share this secret with someone who truly understands horses.",
        type: 'progressive',
        unlockCondition: {
          minReputation: 80,
          npcTrust: { npcId: 'thomas_grey_cloud', level: 5 },
        },
        content: {
          actions: ['view_stallion', 'request_breeding'],
          npcs: [],
          dialogue: [
            '"This horse carries the blood of both my peoples. The Army doesn\'t know he exists. They would take him, break him, use him. But you... you understand. His line must continue."',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 60, nahiCoalition: 35, frontera: 5 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 5 },
  },

  // ============================================================
  // 7. TELEGRAPH OFFICE
  // ============================================================
  {
    _id: FORT_ASHFORD_BUILDING_IDS.TELEGRAPH_OFFICE,
    name: 'Telegraph Office',
    description: 'A small building filled with the constant clicking of telegraph machines. Messages flow in and out connecting Fort Ashford to the wider world. Sally Morse sits at her station, fingers flying across the telegraph key, ears catching every scrap of gossip that crosses the wire.',
    shortDescription: 'Communications hub',
    type: 'telegraph_office',
    region: 'town',
    parentId: LOCATION_IDS.FORT_ASHFORD,
    tier: 4,
    dominantFaction: 'settlerAlliance',
    operatingHours: { open: 6, close: 22 },
    atmosphere: 'Constant clicking of telegraph machines. Messages flow in and out connecting Fort Ashford to the wider world.',
    npcs: [
      {
        id: 'sally_morse',
        name: 'Sally Morse',
        title: 'Telegraph Operator',
        description: "A sharp-witted woman in her thirties who knows everyone's business because she reads their telegrams. Quick with a joke and quicker with information, Sally has made herself indispensable by being the communications hub of the territory. She knows more secrets than the Colonel.",
        personality: 'Quick-witted, gossip, clever, surprisingly loyal to those who earn it',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          "Every word that crosses this wire passes through my fingers first. Makes you wonder what I know, doesn't it?",
          "Telegraph operator sees all, hears all, tells some. The question is - which camp are you in?",
          "You'd be surprised what people say when they think it's private. Nothing's private when it goes through a telegraph wire.",
          "I could tell you stories that would curl your hair, but where's the profit in that?",
        ],
        quests: ['message_delivery', 'intelligence_gathering'],
        isVendor: false,
      },
    ],
    availableActions: ['send_telegram', 'receive_messages', 'buy_information'],
    availableCrimes: ['Intercept Messages', 'Send False Telegram'],
    jobs: [
      {
        id: 'urgent_message_delivery',
        name: 'Urgent Message Delivery',
        description: "Rush deliver a critical telegraph message to its recipient. Some messages can't wait for regular mail.",
        energyCost: 15,
        cooldownMinutes: 60,
        rewards: { goldMin: 30, goldMax: 50, xp: 50, items: ['delivery_tip'] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'intelligence_gathering',
        name: 'Intelligence Gathering',
        description: 'Sally has information that needs discrete verification. Track down sources, confirm rumors, and report back.',
        energyCost: 30,
        cooldownMinutes: 120,
        rewards: { goldMin: 80, goldMax: 120, xp: 110, items: ['intelligence_report', 'sally_favor'] },
        requirements: { minLevel: 9 },
      },
      {
        id: 'code_breaking',
        name: 'Code Breaking Work',
        description: 'Help Sally decrypt coded messages. Pattern recognition and cunning required.',
        energyCost: 25,
        cooldownMinutes: 150,
        rewards: { goldMin: 90, goldMax: 140, xp: 150, items: ['decoded_message', 'cipher_key'] },
        requirements: { minLevel: 11 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'intercepted_messages',
        name: 'Intercepted Messages Archive',
        description: "Sally's private collection of copied telegrams - military orders, criminal communications, love letters, business deals, and blackmail material. Years of intercepted messages carefully catalogued. The power in this room could topple governments or make fortunes.",
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 60,
          npcTrust: { npcId: 'sally_morse', level: 4 },
        },
        content: {
          actions: ['access_telegraph_archives'],
          npcs: [],
          dialogue: [
            '"Insurance policy, I call it. Every telegram I\'ve ever thought might be useful someday. You want to know who\'s planning what? It\'s all here. Now we both have leverage."',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 75, nahiCoalition: 10, frontera: 15 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 5 },
  },

  // ============================================================
  // 8. SUTLER'S STORE
  // ============================================================
  {
    _id: FORT_ASHFORD_BUILDING_IDS.SUTLERS_STORE,
    name: "Sutler's Store",
    description: "A general goods store serving the fort's soldiers and visitors. Shelves stocked with tobacco, whiskey, playing cards, and daily necessities. Frederick Bloom runs a profitable business selling comfort to men far from home. The back room, however, deals in goods the Army doesn't officially approve of.",
    shortDescription: 'General goods store',
    type: 'general_store',
    region: 'town',
    parentId: LOCATION_IDS.FORT_ASHFORD,
    tier: 4,
    dominantFaction: 'settlerAlliance',
    operatingHours: { open: 7, close: 22 },
    atmosphere: "Shelves stocked with tobacco, whiskey, playing cards, and daily necessities. Frederick Bloom sells comfort to men far from home.",
    npcs: [
      {
        id: 'frederick_bloom',
        name: 'Frederick Bloom',
        title: 'Sutler Merchant',
        description: "A portly merchant with calculating eyes and a friendly smile. Bloom came west to make his fortune and found it selling to soldiers. Greedy but fair in his prices, he'll sell anything to anyone as long as the gold is real. His morality is flexible, but his accounting is impeccable.",
        personality: 'Greedy but honest in business, jovial, pragmatic, no loyalty except to profit',
        faction: 'FRONTERA',
        dialogue: [
          "Welcome, welcome! If we don't have it, you don't need it. And if you do need it, I can get it... for a price.",
          "Soldiers get lonely, thirsty, and bored. I provide solutions. Everyone profits.",
          "The Army pays me to be here. The soldiers pay me to make life bearable. And certain other parties pay me to ask no questions.",
          "Morality? That's for priests and politicians. I'm a businessman.",
        ],
        quests: ['supply_run', 'smuggling_opportunity'],
        isVendor: true,
        shopId: 'sutlers_store_shop',
      },
    ],
    availableActions: ['buy_goods', 'sell_goods', 'special_order'],
    availableCrimes: ['Steal Goods', 'Sell Contraband'],
    jobs: [
      {
        id: 'supply_run',
        name: 'Supply Run to Town',
        description: 'Travel to town and bring back supplies for the store. Bloom pays well for reliable hauling.',
        energyCost: 25,
        cooldownMinutes: 120,
        rewards: { goldMin: 60, goldMax: 90, xp: 70, items: ['hauling_payment'] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'trade_negotiations',
        name: 'Trade Negotiations',
        description: 'Help Bloom negotiate with suppliers and customers. Your reputation can open doors and close deals.',
        energyCost: 20,
        cooldownMinutes: 90,
        rewards: { goldMin: 50, goldMax: 80, xp: 90, items: ['merchant_commission'] },
        requirements: { minLevel: 7 },
      },
      {
        id: 'special_delivery',
        name: 'Special Delivery',
        description: 'Discrete delivery of... special goods. No questions asked, high pay, and plausible deniability.',
        energyCost: 35,
        cooldownMinutes: 180,
        rewards: { goldMin: 120, goldMax: 180, xp: 140, items: ['smuggling_payment', 'blooms_trust'] },
        requirements: { minLevel: 10 },
      },
    ],
    shops: [
      {
        id: 'sutlers_store_shop',
        name: 'Sutler General Goods',
        description: 'Everything a soldier or traveler needs to make frontier life tolerable. Legal goods only... in the front room.',
        shopType: 'general',
        items: [
          { itemId: 'tobacco_pouch', name: 'Tobacco Pouch', description: 'Quality smoking tobacco. Calms the nerves.', price: 10 },
          { itemId: 'whiskey_bottle', name: 'Bottle of Whiskey', description: 'Frontier courage in liquid form. Drink responsibly.', price: 20 },
          { itemId: 'playing_cards', name: 'Playing Cards', description: 'Pass the time between patrols. Try not to lose your pay.', price: 5 },
          { itemId: 'coffee_beans', name: 'Coffee Beans (1 lb)', description: 'Keep soldiers alert on long watches.', price: 15 },
          { itemId: 'jerky', name: 'Beef Jerky', description: 'Preserved meat for travel. Lasts forever, tastes like it.', price: 8 },
          { itemId: 'canteen', name: 'Canteen', description: 'Never travel without water. Desert is unforgiving.', price: 12 },
          { itemId: 'bedroll', name: 'Bedroll', description: 'Sleep in relative comfort under the stars.', price: 25 },
          { itemId: 'rope_50ft', name: 'Rope (50 ft)', description: 'Useful for everything from climbing to hanging.', price: 18 },
        ],
        buyMultiplier: 0.5,
      },
    ],
    secrets: [
      {
        id: 'smuggling_operation',
        name: 'Back Room Smuggling Operation',
        description: "The back room of the sutler's store is a smuggling hub. Stolen Army supplies, contraband weapons, illegal whiskey, and goods that 'fell off wagons.' Bloom runs a profitable black market right under the Colonel's nose. For trusted partners, there are fortunes to be made.",
        type: 'secret_action',
        unlockCondition: {
          minReputation: -10,
          npcTrust: { npcId: 'frederick_bloom', level: 4 },
        },
        content: {
          actions: ['access_black_market', 'smuggling_contracts'],
          npcs: [],
          dialogue: [
            '"You\'ve proven yourself discrete and reliable. Those are rare qualities. How would you like to make real money? The kind the Army doesn\'t tax?"',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 3,
    factionInfluence: { settlerAlliance: 50, nahiCoalition: 5, frontera: 45 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 1 },
  },

  // ============================================================
  // 9. PARADE GROUND & TRAINING YARD
  // ============================================================
  {
    _id: FORT_ASHFORD_BUILDING_IDS.PARADE_GROUND,
    name: 'Parade Ground & Training Yard',
    description: 'A vast dusty field where soldiers drill from dawn to dusk. The crack of rifle fire echoes from the shooting range while sergeants bark orders at sweating recruits. Sergeant Major Stone paces between the formations, his voice carrying across the parade ground like thunder. This is where boys become soldiers, and soldiers become veterans.',
    shortDescription: 'Military training facility',
    type: 'military_training',
    region: 'town',
    parentId: LOCATION_IDS.FORT_ASHFORD,
    tier: 4,
    dominantFaction: 'settlerAlliance',
    operatingHours: { open: 6, close: 18 },
    atmosphere: 'Crack of rifle fire from the shooting range. Sergeants bark orders at sweating recruits. Sergeant Major Stone paces between formations, his voice like thunder.',
    npcs: [
      {
        id: 'sergeant_major_stone',
        name: 'Sergeant Major Marcus Stone',
        title: 'Drill Instructor',
        description: 'A grizzled veteran with a voice like gravel and a spine like iron. Stone has trained soldiers for twenty-five years, turning farmers and shopkeepers into fighting men. Gruff and demanding, but genuinely cares about keeping his soldiers alive. Every scar tells a lesson, and he has many scars.',
        personality: 'Gruff but fair, demanding but caring, harsh exterior with protective interior',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          "You think war is glamorous? War is blood, mud, and watching your friends die. I train you so you come home.",
          "Drop and give me fifty! And while you're down there, ask yourself if you want to live through your first real fight.",
          "I don't make soldiers. I make survivors. There's a difference.",
          "Colonel Whitmore runs this fort. I make sure he has soldiers worth commanding.",
        ],
        quests: ['prove_yourself', 'training_day'],
        isVendor: false,
        isImmortal: true,
      },
      {
        id: 'lt_jimmy_ashford',
        name: 'Lieutenant James "Jimmy" Ashford',
        title: "Commander's Son",
        description: "Young, idealistic, and hopelessly naive. Lieutenant Ashford is the commander's son, fresh from West Point with textbook knowledge and no real experience. He tries hard, means well, but the enlisted men see him as a liability. Some wonder if he'll survive his first real engagement.",
        personality: 'Naive, idealistic, earnest but inexperienced, trying to prove himself',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          "Father says I need to earn the respect of the men. I'm... working on it.",
          "The manual says we should- well, Sergeant Stone says the manual doesn't know the frontier. I'm learning.",
          "I know the men call me 'the Colonel's boy.' I'll prove I'm more than my name. Somehow.",
          "At West Point, they taught us honor and duty. Out here, Sergeant Stone teaches survival. I think I needed both.",
        ],
        quests: ['protect_the_lieutenant', 'ashford_family_tension'],
        isVendor: false,
        isImmortal: true,
      },
      {
        id: 'corporal_anderson',
        name: 'Corporal Ruth Anderson',
        title: 'Marksmanship Instructor',
        description: 'One of the few women in the Army, serving as a marksmanship instructor. Anderson can outshoot most men in the fort and has the trophies to prove it. Sharp-tongued and sharper-eyed, she has no patience for incompetence or prejudice.',
        personality: 'Sharp, competitive, skilled, has to constantly prove herself',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          "You can barely hit a barn from inside it. Get back on the line and try again.",
          "They let me teach because I'm the best shot in the fort. They tolerate me because they need me.",
          "Lieutenant Ashford has good instincts under all that academy polish. Stone sees it too, even if he won't admit it.",
          "Every bullet counts out here. Waste ammunition in practice, waste lives in combat.",
        ],
        quests: ['shooting_competition', 'prove_your_aim'],
        isVendor: false,
        isImmortal: true,
      },
    ],
    availableActions: ['drill_practice', 'marksmanship_training', 'observe_training'],
    availableCrimes: ['Sabotage Training Equipment', 'Steal Ammunition'],
    jobs: [
      {
        id: 'basic_drill',
        name: 'Basic Drill Training',
        description: 'Join the morning drill exercises. March, follow orders, learn discipline. The foundation of military training.',
        energyCost: 15,
        cooldownMinutes: 60,
        rewards: { goldMin: 25, goldMax: 40, xp: 35, items: ['discipline_training'] },
        requirements: { minLevel: 1 },
      },
      {
        id: 'marksmanship_training',
        name: 'Marksmanship Training',
        description: 'Practice shooting under Corporal Anderson\'s watchful eye. Learn to handle your weapon like a professional.',
        energyCost: 20,
        cooldownMinutes: 90,
        rewards: { goldMin: 45, goldMax: 65, xp: 70, items: ['marksmanship_badge'] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'combat_instructor',
        name: 'Combat Instructor Assistant',
        description: 'Help Sergeant Stone train new recruits. Share your combat experience and keep greenhorns from getting killed.',
        energyCost: 30,
        cooldownMinutes: 120,
        rewards: { goldMin: 80, goldMax: 110, xp: 150, items: ['instructor_pay', 'stones_respect'] },
        requirements: { minLevel: 12 },
      },
    ],
    shops: [],
    secrets: [],
    connections: [],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 95, nahiCoalition: 0, frontera: 5 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 1 },
  },

  // ============================================================
  // 10. OFFICERS' QUARTERS & CLUB
  // ============================================================
  {
    _id: FORT_ASHFORD_BUILDING_IDS.OFFICERS_QUARTERS,
    name: "Officers' Quarters & Club",
    description: 'An elegant building reserved for commissioned officers. Polished wood, leather chairs, and cigar smoke create an atmosphere of privilege and power. Major Blackwood holds court in the corner, gathering intelligence over brandy. Captain Sullivan lounges by the fireplace, regaling junior officers with cavalry tales. Enlisted men are pointedly unwelcome.',
    shortDescription: 'Elite officers club',
    type: 'elite_club',
    region: 'town',
    parentId: LOCATION_IDS.FORT_ASHFORD,
    tier: 5,
    dominantFaction: 'settlerAlliance',
    operatingHours: { open: 8, close: 23 },
    atmosphere: 'Polished wood, leather chairs, cigar smoke. An atmosphere of privilege and power. Enlisted men are pointedly unwelcome.',
    npcs: [
      {
        id: 'major_blackwood',
        name: 'Major Helena Blackwood',
        title: 'Intelligence Officer',
        description: 'Sharp as a razor and twice as dangerous. Major Blackwood runs military intelligence for the territory, which means she knows everyone\'s secrets. Impeccably dressed, politically savvy, and ruthlessly effective. She collects information like other women collect jewelry.',
        personality: 'Sharp, calculating, politically cunning, sees everything as leverage',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          "Information is power, and I am very powerful. What brings you to my corner of the fort?",
          "Colonel Whitmore commands the soldiers. I command the shadows. We each have our roles.",
          "Captain Sullivan thinks cavalry charges win wars. I know better - intelligence wins wars.",
          "You'd be surprised what officers reveal over brandy. They forget I'm always listening.",
        ],
        quests: ['intelligence_network', 'blackwood_files'],
        isVendor: false,
        isImmortal: true,
      },
      {
        id: 'captain_sullivan',
        name: 'Captain Marcus Sullivan',
        title: 'Cavalry Commander',
        description: 'Arrogant, aristocratic, and undeniably skilled. Sullivan leads the cavalry with dash and reckless courage. Born into wealth back east, he came west seeking glory and found it. His men follow him into hell, though some wonder if he\'ll lead them back out.',
        personality: 'Arrogant, brave, charismatic, reckless, class-conscious',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          "The cavalry is the pride of Fort Ashford. We ride hard, fight harder, and never retreat.",
          "Major Blackwood plays her spy games. Give me a good horse and a sharp saber - that's real power.",
          "Lieutenant Ashford? The boy has potential, I suppose. If he survives long enough to develop it.",
          "This club is for officers only. Standards must be maintained, you understand.",
        ],
        quests: ['cavalry_glory', 'sullivan_rivalry'],
        isVendor: false,
        isImmortal: true,
      },
      {
        id: 'captain_washington',
        name: 'Captain Isaiah Washington',
        title: 'Buffalo Soldier Commander',
        description: 'One of the few Black officers in the Army, commanding a unit of Buffalo Soldiers. Washington earned his commission through extraordinary valor and faces prejudice with quiet dignity. Respected by his men, tolerated by peers like Sullivan, and valued by Colonel Whitmore.',
        personality: 'Dignified, competent, faces discrimination with strength, protective of his men',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          "My men have proven themselves a hundred times over. We keep proving it every day.",
          "Captain Sullivan's cavalry gets the glory. My Buffalo Soldiers get the impossible missions. We prefer it that way.",
          "Some see the uniform before they see the man. I've learned to work with that.",
          "The frontier doesn't care about the color of your skin. Bullets don't discriminate. Neither should we.",
        ],
        quests: ['buffalo_soldier_mission', 'washington_respect'],
        isVendor: false,
        isImmortal: true,
      },
    ],
    availableActions: ['join_officers', 'gather_intelligence', 'political_maneuvering'],
    availableCrimes: ['Eavesdrop on Officers', 'Steal Intelligence Files'],
    jobs: [
      {
        id: 'aide_de_camp',
        name: 'Aide-de-Camp Duty',
        description: 'Serve as a temporary aide to one of the senior officers. Run messages, handle correspondence, and learn how power works.',
        energyCost: 25,
        cooldownMinutes: 120,
        rewards: { goldMin: 60, goldMax: 90, xp: 100, items: ['officer_favor'] },
        requirements: { minLevel: 8 },
      },
      {
        id: 'intelligence_courier',
        name: 'Intelligence Courier',
        description: 'Deliver classified intelligence reports for Major Blackwood. Discretion is mandatory, danger is likely.',
        energyCost: 30,
        cooldownMinutes: 150,
        rewards: { goldMin: 100, goldMax: 150, xp: 140, items: ['classified_pay', 'blackwood_trust'] },
        requirements: { minLevel: 15 },
      },
      {
        id: 'officers_favor',
        name: "Officer's Special Favor",
        description: 'Handle a delicate personal matter for one of the officers. The kind of task they can\'t assign through official channels.',
        energyCost: 35,
        cooldownMinutes: 240,
        rewards: { goldMin: 150, goldMax: 220, xp: 180, items: ['political_capital', 'officer_debt'] },
        requirements: { minLevel: 20 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'intelligence_files',
        name: 'Intelligence Files Archive',
        description: "Major Blackwood's private office contains intelligence files on everyone of importance in the territory - allies, enemies, and those in between. Dossiers on Nahi leaders, Frontera revolutionaries, corrupt officials, and Army secrets. The information here could change the balance of power.",
        type: 'hidden_room',
        unlockCondition: {
          minReputation: 80,
          npcTrust: { npcId: 'major_blackwood', level: 5 },
        },
        content: {
          actions: ['access_intelligence_files', 'copy_dossiers'],
          npcs: [],
          dialogue: [
            '"You\'ve proven yourself trustworthy and competent - a rare combination. These files represent years of work. Use this information wisely, and we both benefit. Use it foolishly, and... well, I\'ll have a new file to create."',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 3,
    factionInfluence: { settlerAlliance: 90, nahiCoalition: 5, frontera: 5 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 8 },
  },

  // ============================================================
  // 11. ENLISTED MEN'S CANTEEN
  // ============================================================
  {
    _id: FORT_ASHFORD_BUILDING_IDS.ENLISTED_CANTEEN,
    name: "Enlisted Men's Canteen",
    description: 'A warm, bustling mess hall that serves as the social heart of the enlisted ranks. Ma Mary O\'Brien presides over her kitchen with fierce maternal authority, feeding soldiers who are far from home. The smell of coffee, bacon, and fresh bread mingles with tobacco smoke and laughter. This is where soldiers become brothers.',
    shortDescription: 'Enlisted mess hall and tavern',
    type: 'tavern',
    region: 'town',
    parentId: LOCATION_IDS.FORT_ASHFORD,
    tier: 3,
    dominantFaction: 'settlerAlliance',
    operatingHours: { open: 5, close: 23 },
    atmosphere: 'Coffee, bacon, and fresh bread mingle with tobacco smoke and laughter. Ma Mary O\'Brien presides over her kitchen with fierce maternal authority.',
    npcs: [
      {
        id: 'ma_mary_obrien',
        name: "Ma Mary O'Brien",
        title: 'Canteen Cook',
        description: 'A stout Irish woman with flour-dusted hands and a heart big enough for the whole fort. Ma Mary feeds the soldiers, mends their uniforms, and listens to their troubles. She lost two sons in the war back east, so these soldiers became her boys. Everyone calls her Ma Mary, and no one dares disrespect her.',
        personality: 'Motherly, warm, fierce protector, no-nonsense about food quality',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          "Sit down, child. You look half-starved. Can't fight on an empty stomach.",
          "These boys are far from their mothers. I do what I can to make it feel like home.",
          "I've buried two sons already. I'll be damned if I let any more boys die because they were too weak from bad food.",
          "Corporal Martinez has been looking troubled lately. Something weighing on that boy's mind.",
        ],
        quests: ['ma_marys_recipe', 'comfort_food'],
        isVendor: true,
        shopId: 'canteen_food_shop',
        isImmortal: true,
      },
      {
        id: 'corporal_martinez',
        name: 'Corporal Diego Martinez',
        title: 'Supply Corporal',
        description: 'A conflicted young man torn between two worlds. Martinez is from a Frontera family but serves in the Settler Army. He believes in the Army\'s mission but questions its methods. Lately, he\'s been helping soldiers who want to desert, running a secret network to Frontera territory.',
        personality: 'Conflicted, idealistic, torn loyalties, quiet revolutionary',
        faction: 'FRONTERA',
        dialogue: [
          "The Army says we bring order. My family says we bring oppression. Who's right?",
          "Sometimes I wonder if I'm on the wrong side of history. Then I remember - there are no sides, just people trying to survive.",
          "Ma Mary knows something's troubling me. She's too smart not to see it. But she hasn't said anything.",
          "Some soldiers don't want to be here anymore. I... I might know people who could help with that. If you understand what I mean.",
        ],
        quests: ['martinez_crisis', 'missing_soldiers'],
        isVendor: false,
        isImmortal: true,
      },
      {
        id: 'private_jackson',
        name: 'Private "Lucky" Jackson',
        title: 'Card Sharp',
        description: 'The unofficial morale officer of the enlisted ranks. Lucky Jackson always has a deck of cards, a joke, and a scheme. He runs poker games, organizes betting pools, and knows every rumor before it spreads. Good-hearted despite his gambling, and soldiers trust him.',
        personality: 'Cheerful, gambler, rumor mill, surprisingly loyal',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          "Pull up a chair, friend! Poker game starting in five minutes. Friendly stakes only... mostly friendly.",
          "You hear about the shipment that went missing last week? No? Well, let me tell you what I heard...",
          "Ma Mary pretends she doesn't know about the card games. We pretend we don't know she knows. It works.",
          "Corporal Martinez has been sneaking out late at night. Meeting someone outside the fort. Just saying.",
        ],
        quests: ['poker_tournament', 'lucky_debt'],
        isVendor: false,
        isImmortal: true,
      },
    ],
    availableActions: ['eat_meal', 'play_cards', 'gather_rumors', 'rest'],
    availableCrimes: ['Spike the Coffee', 'Steal Rations'],
    jobs: [
      {
        id: 'kitchen_helper',
        name: 'Kitchen Helper',
        description: 'Help Ma Mary prepare meals for the soldiers. Chop vegetables, haul water, wash dishes. Simple but honest work.',
        energyCost: 10,
        cooldownMinutes: 60,
        rewards: { goldMin: 20, goldMax: 35, xp: 25, items: ['hot_meal'] },
        requirements: { minLevel: 1 },
      },
      {
        id: 'mess_duty',
        name: 'Mess Duty',
        description: 'Serve food to the soldiers during mealtime rush. Exhausting work, but Ma Mary feeds her helpers well.',
        energyCost: 15,
        cooldownMinutes: 90,
        rewards: { goldMin: 30, goldMax: 50, xp: 40, items: ['ma_marys_gratitude', 'energy_meal'] },
        requirements: { minLevel: 3 },
      },
      {
        id: 'supply_run_canteen',
        name: 'Supply Run for Canteen',
        description: 'Help Corporal Martinez gather supplies for the canteen. Sometimes involves... creative acquisition methods.',
        energyCost: 20,
        cooldownMinutes: 120,
        rewards: { goldMin: 45, goldMax: 70, xp: 60, items: ['supply_bonus'] },
        requirements: { minLevel: 5 },
      },
    ],
    shops: [
      {
        id: 'canteen_food_shop',
        name: "Ma Mary's Kitchen",
        description: 'Hot meals and energy-restoring food made with love. Ma Mary\'s cooking can cure what ails you.',
        shopType: 'tavern',
        items: [
          { itemId: 'hot_meal', name: 'Hot Meal', description: "Ma Mary's home cooking. Restores 15 energy and fills your belly.", price: 8, effect: 'restore_energy_15' },
          { itemId: 'hearty_breakfast', name: 'Hearty Breakfast', description: 'Eggs, bacon, biscuits, and coffee. Restores 25 energy.', price: 15, effect: 'restore_energy_25' },
          { itemId: 'ma_marys_stew', name: "Ma Mary's Famous Stew", description: 'Secret recipe that restores 40 energy and heals 20 HP.', price: 25, effect: 'restore_energy_40_heal_20' },
          { itemId: 'coffee_mug', name: 'Strong Coffee', description: 'Keeps you alert. Restores 10 energy.', price: 5, effect: 'restore_energy_10' },
          { itemId: 'apple_pie', name: 'Apple Pie Slice', description: 'Tastes like home. Restores 20 energy and boosts morale.', price: 12, effect: 'restore_energy_20_morale' },
        ],
        buyMultiplier: 0.7,
      },
    ],
    secrets: [
      {
        id: 'desertion_network',
        name: 'Underground Railroad for Deserters',
        description: 'Corporal Martinez runs a secret network helping soldiers desert to Frontera territory. Safe houses, false papers, and guides who know the routes. It\'s treason, but Martinez believes he\'s saving lives. Ma Mary suspects but looks the other way - she\'s lost too many sons to war.',
        type: 'secret_action',
        unlockCondition: {
          minReputation: 40,
          npcTrust: { npcId: 'corporal_martinez', level: 4 },
          alternateConditions: [
            { factionReputation: { faction: 'FRONTERA', minRep: 300 } },
            { completedQuest: 'missing_soldiers' },
          ],
        },
        content: {
          actions: ['join_desertion_network', 'escort_deserters', 'provide_safe_passage'],
          npcs: [],
          dialogue: [
            '"You understand why soldiers run. This war, this occupation... it\'s not what they signed up for. I help them reach Frontera, where they can start over. It\'s treason. It\'s also the right thing to do. Will you help?"',
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 2,
    factionInfluence: { settlerAlliance: 70, nahiCoalition: 10, frontera: 20 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 1 },
  },

  // ============================================================
  // 12. QUARTERMASTER'S WAREHOUSE
  // ============================================================
  {
    _id: FORT_ASHFORD_BUILDING_IDS.QUARTERMASTER_WAREHOUSE,
    name: "Quartermaster's Warehouse",
    description: 'A massive warehouse packed with military supplies - crates of ammunition, barrels of rations, stacks of uniforms, and everything an army needs to function. Sergeant Burns rules this domain with greedy eyes and flexible ethics. Private Hayes tries to keep honest records while his corrupt superior bleeds the inventory dry.',
    shortDescription: 'Military supply depot',
    type: 'supply_depot',
    region: 'town',
    parentId: LOCATION_IDS.FORT_ASHFORD,
    tier: 4,
    dominantFaction: 'settlerAlliance',
    operatingHours: { open: 6, close: 20 },
    atmosphere: 'Crates of ammunition, barrels of rations, stacks of uniforms. Everything an army needs to function. Sergeant Burns watches over it all with greedy eyes.',
    npcs: [
      {
        id: 'sergeant_burns',
        name: 'Sergeant Theodore Burns',
        title: 'Quartermaster',
        description: 'Corrupt to his core and shameless about it. Burns has been skimming supplies for years, selling Army property on the black market and cooking the books to cover his tracks. He\'s careful, greedy, and well-connected enough that accusations slide off him. Everyone knows, but no one can prove it.',
        personality: 'Corrupt, greedy, cunning, shameless, well-connected',
        faction: 'FRONTERA',
        dialogue: [
          "Everything in this warehouse is accounted for. Officially. What happens unofficially... that's negotiable.",
          "You need supplies? I can help with that. For the right price, of course.",
          "Private Hayes is too honest for his own good. Boy will learn that idealism doesn't pay the bills.",
          "The Army has plenty. They won't miss a few crates here and there. I'm just... redistributing resources.",
        ],
        quests: ['burns_corruption', 'black_market_dealings'],
        isVendor: true,
        shopId: 'quartermaster_shop',
        isImmortal: true,
      },
      {
        id: 'private_hayes',
        name: 'Private Charlie Hayes',
        title: 'Inventory Clerk',
        description: 'Young, honest, and increasingly troubled. Hayes joined the Army believing in duty and honor. Now he watches Sergeant Burns steal supplies while feeling powerless to stop it. He keeps meticulous records, hoping someone will eventually audit the books and see the truth.',
        personality: 'Honest, naive, troubled by corruption, desperately wants to do right',
        faction: 'SETTLER_ALLIANCE',
        dialogue: [
          "The numbers don't add up. They never add up. But Sergeant Burns says I'm just making mistakes...",
          "I keep detailed records of everything. Everything. Someday someone will look at these books and see what's really happening.",
          "Ma Mary says I should look out for myself. But if we all just look out for ourselves, what's the point?",
          "I know Sergeant Burns is stealing. I just... I don't know what to do about it. Who would believe a private over a sergeant?",
        ],
        quests: ['hayes_conscience', 'audit_the_books'],
        isVendor: false,
        isImmortal: true,
      },
      {
        id: 'corporal_reeves',
        name: 'Corporal Sarah Reeves',
        title: 'Warehouse Guard',
        description: 'Tough, no-nonsense guard who works for Burns but isn\'t blind to his corruption. Reeves takes the money but keeps her own records - insurance policy in case Burns tries to make her the scapegoat. She\'s loyal to herself first.',
        personality: 'Pragmatic, self-preserving, tough, quietly gathering leverage',
        faction: 'FRONTERA',
        dialogue: [
          "I guard the warehouse. What goes in, what goes out - not my business as long as my pay is right.",
          "Burns thinks I'm just muscle. I let him think that. Easier that way.",
          "Private Hayes is going to get himself in trouble with all that honesty. Someone should warn him.",
          "Everyone has insurance. My insurance is information. Lots of it.",
        ],
        quests: ['reeves_insurance', 'warehouse_security'],
        isVendor: false,
        isImmortal: true,
      },
    ],
    availableActions: ['requisition_supplies', 'inventory_check', 'special_request'],
    availableCrimes: ['Steal Supplies', 'Forge Requisition', 'Break Into Warehouse'],
    jobs: [
      {
        id: 'inventory_count',
        name: 'Inventory Count',
        description: 'Help Private Hayes count and catalog warehouse inventory. Tedious work that reveals just how much is "missing."',
        energyCost: 15,
        cooldownMinutes: 90,
        rewards: { goldMin: 30, goldMax: 50, xp: 45, items: ['inventory_discrepancy'] },
        requirements: { minLevel: 1 },
      },
      {
        id: 'supply_distribution',
        name: 'Supply Distribution',
        description: 'Load and distribute supplies to various parts of the fort. Hard physical labor, decent pay.',
        energyCost: 20,
        cooldownMinutes: 120,
        rewards: { goldMin: 50, goldMax: 75, xp: 65, items: ['distribution_bonus'] },
        requirements: { minLevel: 5 },
      },
      {
        id: 'special_procurement',
        name: 'Special Procurement',
        description: 'Help Sergeant Burns with "special" supply acquisition. Don\'t ask too many questions, don\'t tell anyone, get paid well.',
        energyCost: 25,
        cooldownMinutes: 180,
        rewards: { goldMin: 100, goldMax: 150, xp: 90, items: ['black_market_pay', 'burns_favor'] },
        requirements: { minLevel: 10 },
      },
    ],
    shops: [
      {
        id: 'quartermaster_shop',
        name: 'Military Surplus & Supplies',
        description: 'Official Army supplies at official Army prices. Burns also has "special inventory" for valued customers.',
        shopType: 'general',
        items: [
          { itemId: 'military_rations', name: 'Military Rations (10)', description: 'Standard Army field rations. Nutritious, portable, tasteless.', price: 20 },
          { itemId: 'army_canteen', name: 'Army Canteen', description: 'Standard-issue water canteen. Essential for survival.', price: 15 },
          { itemId: 'army_uniform', name: 'Army Uniform', description: 'Complete uniform. Opens doors, creates expectations.', price: 50, requiredLevel: 5 },
          { itemId: 'military_tent', name: 'Military Tent', description: 'Shelter from the elements. Sleeps two soldiers or one civilian comfortably.', price: 40 },
          { itemId: 'ammunition_box', name: 'Ammunition Box (50 rounds)', description: 'Standard Army ammunition. Quality controlled.', price: 35 },
          { itemId: 'field_kit', name: 'Field Kit', description: 'Everything a soldier needs: mess kit, cleaning supplies, basic tools.', price: 30 },
          { itemId: 'blanket_wool', name: 'Wool Blanket', description: 'Keeps you warm on cold frontier nights.', price: 12 },
        ],
        buyMultiplier: 0.6,
      },
    ],
    secrets: [
      {
        id: 'black_market_operation',
        name: "Burns' Black Market Network",
        description: 'The back room of the warehouse is Burns\' black market hub. Stolen military weapons, ammunition, equipment, and supplies worth thousands. He sells to outlaws, Frontera rebels, and anyone with gold. Corporal Reeves guards the operation and keeps records of every transaction - her insurance policy.',
        type: 'secret_action',
        unlockCondition: {
          minReputation: -20,
          npcTrust: { npcId: 'sergeant_burns', level: 4 },
        },
        content: {
          actions: ['access_black_market', 'buy_stolen_goods', 'sell_to_burns', 'expose_corruption'],
          npcs: [],
          dialogue: [
            `"You seem like someone who understands how the world really works. The Army has more supplies than they can track. I have customers with gold. You could be the middle man. Profitable for everyone involved. Except maybe Private Hayes, but that boy's too honest anyway."`,
          ],
        },
      },
    ],
    connections: [],
    dangerLevel: 3,
    factionInfluence: { settlerAlliance: 60, nahiCoalition: 5, frontera: 35 },
    isUnlocked: true,
    isHidden: false,
    requirements: { minLevel: 1 },
  },
];

/**
 * Seed Fort Ashford buildings into the database
 */
export async function seedFortAshfordBuildings(): Promise<void> {
  try {
    // Verify Fort Ashford exists
    const fortAshford = await Location.findById(LOCATION_IDS.FORT_ASHFORD);
    if (!fortAshford) {
      console.warn('Warning: Fort Ashford location not found. Buildings will reference non-existent parent.');
    }

    // Delete existing Fort Ashford buildings (by parentId)
    await Location.deleteMany({ parentId: LOCATION_IDS.FORT_ASHFORD });

    // Insert Fort Ashford buildings
    await Location.insertMany(fortAshfordBuildings);

    console.log(`Successfully seeded ${fortAshfordBuildings.length} Fort Ashford buildings`);
  } catch (error) {
    console.error('Error seeding Fort Ashford buildings:', error);
    throw error;
  }
}

export default fortAshfordBuildings;
