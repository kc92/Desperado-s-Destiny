/**
 * Frontera Faction NPCs
 * AAA Quality Pass - Comprehensive cartel-esque faction with depth and nuance
 *
 * The Frontera are not simple villains - they're survivors of colonization,
 * protectors of their communities, and morally complex individuals who've
 * chosen power as a means of protection in a world that offers them none.
 *
 * Spanish code-switching is authentic to the period and culture.
 * Each NPC has reasons for their actions, not just evil for evil's sake.
 */

import { INPC } from '../../models/NPC.model';
import { NPCType, PersonalityType, MoodType } from '@desperados/shared';

// ============================================================================
// FRONTERA FACTION NPC DATA
// 24 NPCs with full characterization
// ============================================================================

export const fronteraNPCs: Partial<INPC>[] = [
  // ========================================
  // LEADERSHIP TIER - El Consejo (The Council)
  // ========================================
  {
    name: 'Don Rafael "El Cuervo" Mendoza',
    type: NPCType.BOSS,
    level: 45,
    maxHP: 450,
    difficulty: 9,
    lootTable: {
      goldMin: 500,
      goldMax: 1500,
      xpReward: 2000,
      items: [
        { name: 'el-cuervos-silver-revolver', chance: 0.15, rarity: 'legendary' },
        { name: 'frontera-signet-ring', chance: 0.4, rarity: 'epic' },
        { name: 'aged-tequila-bottle', chance: 0.6, rarity: 'rare' },
      ]
    },
    location: 'Frontera',
    respawnTime: 4320, // 72 hours
    description: 'The aging patriarch of the Frontera, Don Rafael built an empire from nothing after watching American settlers burn his family\'s ranch. His cold eyes have seen decades of blood, but he built schools and hospitals when the government wouldn\'t. "El Cuervo" - The Raven - sees everything and forgets nothing.',
    isActive: true,
    personality: PersonalityType.STOIC,
    baseMood: MoodType.NEUTRAL,
    role: 'frontera_leader'
  },
  {
    name: 'Doña Isabella Reyes-Mendoza',
    type: NPCType.BOSS,
    level: 40,
    maxHP: 350,
    difficulty: 8,
    lootTable: {
      goldMin: 400,
      goldMax: 1200,
      xpReward: 1500,
      items: [
        { name: 'poison-laced-hairpin', chance: 0.2, rarity: 'epic' },
        { name: 'coded-ledger', chance: 0.35, rarity: 'rare' },
        { name: 'silk-mantilla', chance: 0.5, rarity: 'uncommon' },
      ]
    },
    location: 'Frontera',
    respawnTime: 4320,
    description: 'Don Rafael\'s wife and the true strategic mind behind Frontera\'s expansion. A former schoolteacher who watched her students starve while American businesses thrived. "La Viuda Blanca" - The White Widow - because those who underestimate her never live to make the mistake twice.',
    isActive: true,
    personality: PersonalityType.CUNNING,
    baseMood: MoodType.CONTENT,
    role: 'frontera_strategist'
  },
  {
    name: 'Miguel "El Carnicero" Vega',
    type: NPCType.BOSS,
    level: 42,
    maxHP: 480,
    difficulty: 10,
    lootTable: {
      goldMin: 450,
      goldMax: 1400,
      xpReward: 1800,
      items: [
        { name: 'blood-stained-machete', chance: 0.12, rarity: 'legendary' },
        { name: 'butchers-apron', chance: 0.4, rarity: 'rare' },
        { name: 'severed-finger-necklace', chance: 0.25, rarity: 'epic' },
      ]
    },
    location: 'Frontera',
    respawnTime: 4320,
    description: 'The Frontera\'s enforcer, feared even by his own people. What most don\'t know: before becoming "The Butcher," Miguel was a doctor who couldn\'t save his village from cholera because American companies hoarded medicine. His cruelty is calculated, never random - every cut serves a message.',
    isActive: true,
    personality: PersonalityType.AGGRESSIVE,
    baseMood: MoodType.ANGRY,
    role: 'frontera_enforcer'
  },

  // ========================================
  // LIEUTENANT TIER - Los Capitanes
  // ========================================
  {
    name: 'Rosa "La Serpiente" Delgado',
    type: NPCType.OUTLAW,
    level: 30,
    maxHP: 280,
    difficulty: 7,
    lootTable: {
      goldMin: 200,
      goldMax: 600,
      xpReward: 800,
      items: [
        { name: 'twin-daggers', chance: 0.25, rarity: 'rare' },
        { name: 'snakeskin-boots', chance: 0.4, rarity: 'uncommon' },
        { name: 'venom-vial', chance: 0.3, rarity: 'rare' },
      ]
    },
    location: 'Frontera',
    respawnTime: 1440,
    description: 'Infiltration specialist and assassin. Rosa was sold to a brothel at fourteen; she burned it down at sixteen and walked out wearing the madam\'s jewelry. Now she chooses who lives and dies, and she never forgets those who abuse the powerless.',
    isActive: true,
    personality: PersonalityType.CUNNING,
    baseMood: MoodType.SUSPICIOUS,
    role: 'frontera_assassin'
  },
  {
    name: 'Padre Ignacio Cruz',
    type: NPCType.LAWMAN, // Non-hostile by default
    level: 25,
    maxHP: 150,
    difficulty: 3,
    lootTable: {
      goldMin: 0,
      goldMax: 50,
      xpReward: 200,
      items: [
        { name: 'blessed-rosary', chance: 0.5, rarity: 'uncommon' },
        { name: 'confession-records', chance: 0.2, rarity: 'rare' },
      ]
    },
    location: 'Frontera',
    respawnTime: 2880,
    description: 'A defrocked priest who serves as the Frontera\'s spiritual advisor and moral compass. He absolves their sins and argues for mercy when others demand blood. Some say he\'s the only reason Don Rafael hasn\'t crossed certain lines. Others say he crossed them long ago.',
    isActive: true,
    personality: PersonalityType.WISE,
    baseMood: MoodType.SAD,
    role: 'frontera_priest'
  },
  {
    name: 'Joaquin "El Toro" Fuentes',
    type: NPCType.OUTLAW,
    level: 32,
    maxHP: 350,
    difficulty: 6,
    lootTable: {
      goldMin: 180,
      goldMax: 550,
      xpReward: 700,
      items: [
        { name: 'brass-knuckles', chance: 0.35, rarity: 'uncommon' },
        { name: 'bull-horn-belt-buckle', chance: 0.4, rarity: 'rare' },
        { name: 'fighting-ring-winnings', chance: 0.6, rarity: 'common' },
      ]
    },
    location: 'Frontera',
    respawnTime: 1440,
    description: 'The Frontera\'s muscle and bare-knuckle champion. Joaquin was a mine worker until a cave-in killed his brother and the company paid nothing. Now he fights for the Frontera and sends money to widows the mine companies forgot.',
    isActive: true,
    personality: PersonalityType.LOYAL,
    baseMood: MoodType.NEUTRAL,
    role: 'frontera_bruiser'
  },
  {
    name: 'Lucia "La Contadora" Espinoza',
    type: NPCType.LAWMAN,
    level: 28,
    maxHP: 120,
    difficulty: 2,
    lootTable: {
      goldMin: 100,
      goldMax: 400,
      xpReward: 400,
      items: [
        { name: 'encrypted-ledger', chance: 0.3, rarity: 'rare' },
        { name: 'gold-coins', chance: 0.5, rarity: 'common' },
        { name: 'banking-documents', chance: 0.4, rarity: 'uncommon' },
      ]
    },
    location: 'Frontera',
    respawnTime: 1440,
    description: 'The Frontera\'s accountant and money launderer. Lucia was the first woman to work at the territorial bank - until they fired her for being "too clever." Now she makes the Frontera\'s blood money disappear into legitimate businesses, schools, and clinics.',
    isActive: true,
    personality: PersonalityType.CUNNING,
    baseMood: MoodType.NEUTRAL,
    role: 'frontera_accountant'
  },

  // ========================================
  // SPECIALIST TIER - Los Especialistas
  // ========================================
  {
    name: 'Carlos "El Químico" Navarro',
    type: NPCType.OUTLAW,
    level: 26,
    maxHP: 100,
    difficulty: 4,
    lootTable: {
      goldMin: 150,
      goldMax: 450,
      xpReward: 500,
      items: [
        { name: 'explosive-compound', chance: 0.25, rarity: 'rare' },
        { name: 'chemical-formula-notes', chance: 0.3, rarity: 'epic' },
        { name: 'smoke-bomb', chance: 0.5, rarity: 'uncommon' },
      ]
    },
    location: 'Frontera',
    respawnTime: 1440,
    description: 'Explosives expert and former mining engineer. Carlos watched American companies use dynamite carelessly, killing dozens of workers. Now he uses his knowledge to blow up their operations instead of their workers.',
    isActive: true,
    personality: PersonalityType.SCHOLARLY,
    baseMood: MoodType.EXCITED,
    role: 'frontera_chemist'
  },
  {
    name: 'Elena "La Curandera" Morales',
    type: NPCType.LAWMAN,
    level: 24,
    maxHP: 80,
    difficulty: 1,
    lootTable: {
      goldMin: 20,
      goldMax: 100,
      xpReward: 200,
      items: [
        { name: 'healing-herbs', chance: 0.6, rarity: 'common' },
        { name: 'antidote-vial', chance: 0.3, rarity: 'uncommon' },
        { name: 'ritual-medicine-pouch', chance: 0.2, rarity: 'rare' },
      ]
    },
    location: 'Frontera',
    respawnTime: 720,
    description: 'The Frontera\'s healer, combining traditional medicine with battlefield surgery. Elena trained as a nurse but was denied work because of her heritage. She\'s saved more lives than she\'s helped take, and that balance matters to her.',
    isActive: true,
    personality: PersonalityType.FRIENDLY,
    baseMood: MoodType.CONTENT,
    role: 'frontera_healer'
  },
  {
    name: 'Diego "El Coyote" Ramirez',
    type: NPCType.OUTLAW,
    level: 27,
    maxHP: 180,
    difficulty: 5,
    lootTable: {
      goldMin: 100,
      goldMax: 350,
      xpReward: 450,
      items: [
        { name: 'border-crossing-map', chance: 0.35, rarity: 'rare' },
        { name: 'forged-documents', chance: 0.4, rarity: 'uncommon' },
        { name: 'hidden-compartment-saddle', chance: 0.2, rarity: 'rare' },
      ]
    },
    location: 'Frontera',
    respawnTime: 1440,
    description: 'Smuggler and guide who knows every trail across the border. Diego helps families escape violence and delivers "packages" for the Frontera. He never asks what\'s in the boxes - but he always knows.',
    isActive: true,
    personality: PersonalityType.CUNNING,
    baseMood: MoodType.SUSPICIOUS,
    role: 'frontera_smuggler'
  },
  {
    name: 'Marisol "La Sirena" Vásquez',
    type: NPCType.LAWMAN,
    level: 22,
    maxHP: 90,
    difficulty: 2,
    lootTable: {
      goldMin: 50,
      goldMax: 200,
      xpReward: 250,
      items: [
        { name: 'intelligence-reports', chance: 0.4, rarity: 'uncommon' },
        { name: 'love-letters', chance: 0.3, rarity: 'common' },
        { name: 'coded-messages', chance: 0.25, rarity: 'rare' },
      ]
    },
    location: 'Frontera',
    respawnTime: 720,
    description: 'Information broker who works the saloons across the territory. Men tell her secrets between whispers and whiskey. What they don\'t know is that she remembers everything, and the Frontera pays well for pillow talk.',
    isActive: true,
    personality: PersonalityType.CHARMING,
    baseMood: MoodType.HAPPY,
    role: 'frontera_spy'
  },

  // ========================================
  // SOLDIER TIER - Los Soldados
  // ========================================
  {
    name: 'Ramón "El Rifle" Guerrero',
    type: NPCType.OUTLAW,
    level: 20,
    maxHP: 200,
    difficulty: 5,
    lootTable: {
      goldMin: 80,
      goldMax: 250,
      xpReward: 350,
      items: [
        { name: 'rifle-ammunition', chance: 0.7, rarity: 'common' },
        { name: 'sharpshooter-scope', chance: 0.15, rarity: 'rare' },
        { name: 'military-medal', chance: 0.1, rarity: 'uncommon' },
      ]
    },
    location: 'Frontera',
    respawnTime: 720,
    description: 'Former Mexican army sniper who fought in a war that meant nothing. When peace came, there was no place for him. The Frontera gave him purpose, targets that deserved his bullets, and brothers who understood the weight of killing.',
    isActive: true,
    personality: PersonalityType.STOIC,
    baseMood: MoodType.NEUTRAL,
    role: 'frontera_sniper'
  },
  {
    name: 'Tomás "El Joven" Mendoza',
    type: NPCType.OUTLAW,
    level: 15,
    maxHP: 150,
    difficulty: 4,
    lootTable: {
      goldMin: 40,
      goldMax: 150,
      xpReward: 200,
      items: [
        { name: 'youth-gang-bandana', chance: 0.5, rarity: 'common' },
        { name: 'switchblade', chance: 0.4, rarity: 'uncommon' },
        { name: 'stolen-watch', chance: 0.3, rarity: 'uncommon' },
      ]
    },
    location: 'Frontera',
    respawnTime: 360,
    description: 'Don Rafael\'s youngest nephew, eager to prove himself. Tomás has more courage than sense and hasn\'t yet learned the weight of the life he\'s chosen. The veterans watch him with a mixture of protection and sadness - they know what he\'ll become.',
    isActive: true,
    personality: PersonalityType.LOYAL,
    baseMood: MoodType.EXCITED,
    role: 'frontera_recruit'
  },
  {
    name: 'Hernán "El Veterano" Castillo',
    type: NPCType.OUTLAW,
    level: 35,
    maxHP: 300,
    difficulty: 6,
    lootTable: {
      goldMin: 150,
      goldMax: 500,
      xpReward: 600,
      items: [
        { name: 'veteran-revolver', chance: 0.2, rarity: 'rare' },
        { name: 'service-medals', chance: 0.35, rarity: 'uncommon' },
        { name: 'war-journal', chance: 0.15, rarity: 'epic' },
      ]
    },
    location: 'Frontera',
    respawnTime: 1440,
    description: 'The oldest soldier in the Frontera, survivor of three wars and countless battles. Hernán trains the young ones and carries the ghosts of everyone he\'s killed. He stays because leaving would mean his life meant nothing.',
    isActive: true,
    personality: PersonalityType.WISE,
    baseMood: MoodType.SAD,
    role: 'frontera_veteran'
  },
  {
    name: 'Guadalupe "La Lobita" Torres',
    type: NPCType.OUTLAW,
    level: 18,
    maxHP: 160,
    difficulty: 4,
    lootTable: {
      goldMin: 50,
      goldMax: 180,
      xpReward: 250,
      items: [
        { name: 'wolf-tooth-necklace', chance: 0.4, rarity: 'uncommon' },
        { name: 'tracking-kit', chance: 0.35, rarity: 'common' },
        { name: 'hunting-knife', chance: 0.5, rarity: 'common' },
      ]
    },
    location: 'Frontera',
    respawnTime: 720,
    description: 'The Frontera\'s tracker, raised by her grandfather in the mountains. "The Little Wolf" can follow a trail three days old through rock and rain. She joined after American ranchers killed her grandfather for "trespassing" on land his family had used for generations.',
    isActive: true,
    personality: PersonalityType.STOIC,
    baseMood: MoodType.SUSPICIOUS,
    role: 'frontera_tracker'
  },

  // ========================================
  // CIVILIAN SUPPORTERS - Los Simpatizantes
  // ========================================
  {
    name: 'Abuela Carmen',
    type: NPCType.LAWMAN,
    level: 10,
    maxHP: 40,
    difficulty: 1,
    lootTable: {
      goldMin: 5,
      goldMax: 30,
      xpReward: 50,
      items: [
        { name: 'homemade-tamales', chance: 0.7, rarity: 'common' },
        { name: 'family-recipe', chance: 0.1, rarity: 'rare' },
      ]
    },
    location: 'Frontera',
    respawnTime: 1440,
    description: 'The grandmother who feeds every Frontera soldier who passes through. Her home is sanctuary - no violence is permitted there. Even El Carnicero removes his weapons before crossing her threshold. She\'s buried three sons to this life.',
    isActive: true,
    personality: PersonalityType.FRIENDLY,
    baseMood: MoodType.CONTENT,
    role: 'frontera_matriarch'
  },
  {
    name: 'Víctor "El Herrero" Cortez',
    type: NPCType.LAWMAN,
    level: 20,
    maxHP: 180,
    difficulty: 2,
    lootTable: {
      goldMin: 30,
      goldMax: 150,
      xpReward: 150,
      items: [
        { name: 'custom-horseshoes', chance: 0.5, rarity: 'common' },
        { name: 'master-forged-knife', chance: 0.2, rarity: 'rare' },
        { name: 'metal-ingots', chance: 0.4, rarity: 'common' },
      ]
    },
    location: 'Frontera',
    respawnTime: 720,
    description: 'The blacksmith who supplies the Frontera with weapons and repairs. By day he shoes horses for anyone who pays. By night he forges the machetes that have taken countless lives. He tells himself he only makes the tools.',
    isActive: true,
    personality: PersonalityType.STOIC,
    baseMood: MoodType.NEUTRAL,
    role: 'frontera_blacksmith'
  },
  {
    name: 'Sofia "La Maestra" Ríos',
    type: NPCType.LAWMAN,
    level: 15,
    maxHP: 60,
    difficulty: 1,
    lootTable: {
      goldMin: 10,
      goldMax: 50,
      xpReward: 100,
      items: [
        { name: 'schoolbooks', chance: 0.6, rarity: 'common' },
        { name: 'teaching-certificate', chance: 0.2, rarity: 'uncommon' },
        { name: 'students-drawings', chance: 0.4, rarity: 'common' },
      ]
    },
    location: 'Frontera',
    respawnTime: 1440,
    description: 'The schoolteacher paid by the Frontera to educate children the government forgot. Sofia believes education is revolution - that her students will change the world through knowledge, not blood. Don Rafael respects her enough to keep the violence away from her school.',
    isActive: true,
    personality: PersonalityType.WISE,
    baseMood: MoodType.HAPPY,
    role: 'frontera_teacher'
  },
  {
    name: 'Padre Miguel Santana',
    type: NPCType.LAWMAN,
    level: 12,
    maxHP: 50,
    difficulty: 1,
    lootTable: {
      goldMin: 0,
      goldMax: 20,
      xpReward: 75,
      items: [
        { name: 'prayer-book', chance: 0.5, rarity: 'common' },
        { name: 'sanctuary-key', chance: 0.15, rarity: 'rare' },
      ]
    },
    location: 'Frontera',
    respawnTime: 1440,
    description: 'The village priest who offers confession and last rites to Frontera soldiers. He doesn\'t condone their violence but believes everyone deserves God\'s mercy. His church has hidden fugitives from both sides of the law.',
    isActive: true,
    personality: PersonalityType.FRIENDLY,
    baseMood: MoodType.SAD,
    role: 'frontera_village_priest'
  },

  // ========================================
  // NAMED SOLDIERS - Los Nombrados
  // ========================================
  {
    name: 'Pedro "El Silencio" Mora',
    type: NPCType.OUTLAW,
    level: 25,
    maxHP: 220,
    difficulty: 6,
    lootTable: {
      goldMin: 100,
      goldMax: 350,
      xpReward: 400,
      items: [
        { name: 'garrote-wire', chance: 0.3, rarity: 'uncommon' },
        { name: 'soft-leather-boots', chance: 0.4, rarity: 'common' },
        { name: 'silence-hood', chance: 0.2, rarity: 'rare' },
      ]
    },
    location: 'Frontera',
    respawnTime: 1440,
    description: 'No one has heard Pedro speak in fifteen years. Some say he took a vow of silence after killing his brother by accident. Others say he simply has nothing left to say. What he can\'t express in words, he expresses with a knife in the dark.',
    isActive: true,
    personality: PersonalityType.STOIC,
    baseMood: MoodType.NEUTRAL,
    role: 'frontera_silent_killer'
  },
  {
    name: 'Alejandra "La Viuda" Santos',
    type: NPCType.OUTLAW,
    level: 28,
    maxHP: 240,
    difficulty: 5,
    lootTable: {
      goldMin: 120,
      goldMax: 400,
      xpReward: 450,
      items: [
        { name: 'mourning-veil', chance: 0.35, rarity: 'uncommon' },
        { name: 'husbands-revolver', chance: 0.2, rarity: 'rare' },
        { name: 'wedding-ring', chance: 0.15, rarity: 'rare' },
      ]
    },
    location: 'Frontera',
    respawnTime: 1440,
    description: 'Her husband was a Frontera soldier killed by bounty hunters. Alejandra picked up his gun before his body was cold and hasn\'t put it down since. She wears black, speaks of her husband like he\'s still alive, and kills with a smile that never reaches her eyes.',
    isActive: true,
    personality: PersonalityType.AGGRESSIVE,
    baseMood: MoodType.SAD,
    role: 'frontera_widow'
  },
  {
    name: 'Felipe "El Poeta" Vargas',
    type: NPCType.OUTLAW,
    level: 22,
    maxHP: 170,
    difficulty: 4,
    lootTable: {
      goldMin: 60,
      goldMax: 220,
      xpReward: 300,
      items: [
        { name: 'poetry-journal', chance: 0.4, rarity: 'uncommon' },
        { name: 'ink-stained-dagger', chance: 0.3, rarity: 'uncommon' },
        { name: 'revolutionary-pamphlets', chance: 0.35, rarity: 'common' },
      ]
    },
    location: 'Frontera',
    respawnTime: 720,
    description: 'Writer, philosopher, and killer. Felipe documents the Frontera\'s struggle in verse, believing that stories outlast empires. He\'s gentle with children, brutal with enemies, and writes poems about both with equal passion.',
    isActive: true,
    personality: PersonalityType.SCHOLARLY,
    baseMood: MoodType.CONTENT,
    role: 'frontera_poet'
  },
  {
    name: 'Benito "El Grande" Mendez',
    type: NPCType.OUTLAW,
    level: 30,
    maxHP: 400,
    difficulty: 6,
    lootTable: {
      goldMin: 150,
      goldMax: 450,
      xpReward: 550,
      items: [
        { name: 'oversized-sombrero', chance: 0.5, rarity: 'common' },
        { name: 'heavy-cavalry-saber', chance: 0.2, rarity: 'rare' },
        { name: 'giant-belt-buckle', chance: 0.4, rarity: 'uncommon' },
      ]
    },
    location: 'Frontera',
    respawnTime: 1440,
    description: 'Standing nearly seven feet tall, Benito is impossible to miss and impossible to forget. He guards the Frontera\'s main routes and has stopped more ambushes through intimidation than violence. Despite his size, he\'s surprisingly gentle - he only fights when there\'s no other way.',
    isActive: true,
    personality: PersonalityType.LOYAL,
    baseMood: MoodType.CONTENT,
    role: 'frontera_giant'
  },
  {
    name: 'Camila "La Noche" Ortega',
    type: NPCType.OUTLAW,
    level: 29,
    maxHP: 200,
    difficulty: 7,
    lootTable: {
      goldMin: 140,
      goldMax: 420,
      xpReward: 500,
      items: [
        { name: 'shadow-cloak', chance: 0.25, rarity: 'rare' },
        { name: 'lockpicking-kit', chance: 0.4, rarity: 'uncommon' },
        { name: 'stolen-documents', chance: 0.35, rarity: 'uncommon' },
      ]
    },
    location: 'Frontera',
    respawnTime: 1440,
    description: 'Night operations specialist and infiltrator. Camila has walked through guarded compounds and walked out with payrolls, weapons, and secrets. She works only at night - not from necessity, but because she finds the darkness comforting. The sun, she says, shows too much.',
    isActive: true,
    personality: PersonalityType.CUNNING,
    baseMood: MoodType.SUSPICIOUS,
    role: 'frontera_nightwalker'
  },
];

// ============================================================================
// FRONTERA DIALOGUE EXTENSIONS
// Full dialogue trees for key NPCs with Spanish code-switching
// ============================================================================

export const FRONTERA_DIALOGUE = {
  DON_RAFAEL: {
    friendly: [
      "Bienvenido, amigo. You've earned a seat at my table. Speak freely.",
      "In this life, loyalty is everything. You've proven yours. What do you need?",
      "Mi casa es su casa, friend. Though I suspect you didn't come just for the tequila.",
      "I remember faces. Yours is one I'm glad to see. How can the Frontera help you?",
      "Sit. Drink. The sun sets slowly here - we have time to talk.",
    ],
    neutral: [
      "I know your face, but not your intentions. State your business.",
      "The Frontera watches everyone. Today, we watch you. Speak.",
      "You're either very brave or very foolish to come here. Which is it?",
      "Every stranger is a potential ally or enemy. Help me decide which you are.",
      "Talk is cheap south of the border. Show me something real.",
    ],
    hostile: [
      "You have exactly one minute to explain why I shouldn't feed you to the coyotes.",
      "La última vez que alguien me faltó el respeto... bueno, no hubo última vez.",
      "My men are watching. One word from me, and they stop watching.",
      "I've built empires from blood and dust. You think you scare me?",
      "El Cuervo sees everything, amigo. Including the rope around your neck.",
    ],
    quest: [
      "There's a shipment crossing the border tomorrow. The Americans want it stopped. I want it delivered.",
      "Someone's been talking to the marshals. Find them, bring them to me. Vivo o muerto.",
      "My niece is being held by those cabrones at {LOCATION}. Bring her home, and name your price.",
      "The Coalition thinks they can move into our territory. Remind them who owns these lands.",
      "There's a man who owes me a debt. Not money - blood. Collect it for me.",
    ],
    gossip: [
      "The Americans think we're simple bandidos. Let them. Underestimation is a weapon.",
      "Dicen que hay fantasmas en las montañas. I've seen worse things than ghosts, amigo.",
      "The sheriff's been bought, but not by us. Interesting, no?",
      "My wife sees things I miss. When she worries, I listen. She's worried about {NPC}.",
      "Money flows like water in this territory. Follow the stream, find the source.",
    ],
  },

  DONA_ISABELLA: {
    friendly: [
      "Ah, a sensible one. Come, let's discuss things of real importance.",
      "My husband respects strength. I respect intelligence. You seem to have both.",
      "Don't let the dress fool you, querido. I've killed more men than most soldiers.",
      "Trust is earned slowly and lost quickly. You've been earning. Keep it that way.",
      "Some come here seeking my husband. The smart ones come seeking me instead.",
    ],
    neutral: [
      "I'm not my husband. Flattery and bravado mean nothing to me.",
      "State your business clearly, or waste someone else's time.",
      "Everyone wants something. Tell me what you want, and I'll tell you if it's possible.",
      "I've heard your name. The question is whether that's good or bad.",
      "My time is valuable. Make yours worth my attention.",
    ],
    hostile: [
      "Do you know why they call me La Viuda Blanca? Because I wear white to funerals I've caused.",
      "You're standing in my territory, threatening my family. Think carefully about your next words.",
      "I was building empires when you were learning to hold a gun. Don't test me.",
      "My husband offers quick deaths. I prefer slow ones. Choose your enemy wisely.",
      "You've made a mistake coming here. The question is how permanent that mistake will be.",
    ],
    quest: [
      "I need information from {LOCATION}. Get it without alerting anyone, and you'll be rewarded.",
      "A certain businessman thinks he can cheat the Frontera. Show him the error of his ways.",
      "My children need protection while traveling to {LOCATION}. The pay matches the risk.",
      "There are books at the mission - old records. Bring them to me, and don't read them.",
      "Someone's spreading lies about our family. Find the source and silence it. Permanently.",
    ],
  },

  EL_CARNICERO: {
    friendly: [
      "*sharpening knife* Amigo. You've earned my respect. That's rare. And valuable.",
      "Some men fear me. Smart men respect me. Which are you? *laughs* Both is acceptable.",
      "Sit. The blood on my hands isn't yours. Today, we're friends.",
      "I remember you from {LOCATION}. Good work. Clean work. I appreciate clean work.",
      "*offers drink* To survivors. May our enemies provide many opportunities for survival.",
    ],
    neutral: [
      "*doesn't look up from blade* State your business.",
      "I'm busy. Either you have something important, or you're wasting my time.",
      "Every person who walks through that door wants something. What do you want?",
      "I don't know you. In my line of work, that's neither good nor bad. Yet.",
      "Talk. But choose your words carefully. I'm not known for my patience.",
    ],
    hostile: [
      "*stands, knife in hand* You have exactly ten seconds to convince me not to add you to my collection.",
      "Do you know how many bones are in the human body? I do. Intimately.",
      "The last person who disrespected me is currently fertilizing my garden. Multiple gardens.",
      "I was a doctor once. I learned exactly where to cut to cause the most pain without death.",
      "Run. I'll give you a head start. I enjoy the chase.",
    ],
    quest: [
      "There's a traitor in our ranks. Find them before I have to... interview... everyone.",
      "A man at {LOCATION} has information I need. Bring him to me alive. Mostly alive.",
      "Someone killed one of ours. I want their hands. Just the hands. You can keep the rest.",
      "The marshal's been too effective lately. Arrange for him to become... less effective.",
      "I need a message delivered. The message is written in blood on the inside of a man's skin. Create the message.",
    ],
  },

  ROSA_LA_SERPIENTE: {
    friendly: [
      "*smiles dangerously* Well, well. If it isn't my favorite dangerous person.",
      "You've got good instincts. That's why you're still breathing. And why I like you.",
      "Most men look at me and see prey. You see predator. Smart.",
      "In another life, we might have been enemies. In this one? Allies are more fun.",
      "Come, sit. Tell me secrets. I'll trade you some of mine.",
    ],
    neutral: [
      "Everyone has a price. What's yours?",
      "*examines fingernails* You're here. Talk or leave. I have places to be.",
      "I've killed men for less than wasting my time. Consider that an introduction.",
      "Your reputation precedes you. Let's see if it's accurate.",
      "Neutral ground. Neutral conversation. Say something interesting.",
    ],
    hostile: [
      "*poison-tipped blade appears* You have three heartbeats to explain why I shouldn't.",
      "I burned down my cage at sixteen. What makes you think you can build another?",
      "Do you know what snake venom does to the human heart? Would you like a demonstration?",
      "I've slept with men just to watch the light leave their eyes in the morning. You're not even worth that.",
      "The Serpiente strikes when you least expect it. Sleep well, amigo.",
    ],
    quest: [
      "There's a man at {LOCATION} who thinks women are property. Change his mind. Permanently.",
      "I need someone... disappeared. No evidence. No witnesses. Can you do clean work?",
      "A girl at the cantina is being held against her will. Free her and bring her to me.",
      "Someone's been hunting our couriers. Hunt the hunter. Bring me their teeth.",
      "I need access to the Governor's ball. Get me an invitation, by any means necessary.",
    ],
  },

  PADRE_IGNACIO: {
    friendly: [
      "Ah, my child. God has sent you. Or perhaps the Devil, to test me. Sit, let us find out which.",
      "In confession, I've heard the sins of saints and sinners alike. Your soul seems troubled but not lost.",
      "The Lord works in mysterious ways. Today, his mystery brought you here. Welcome.",
      "I keep wine for communion and whiskey for conversation. Which do you prefer?",
      "Every person who enters my church seeks something. What do you seek, hijo?",
    ],
    neutral: [
      "The church is open to all. Your intentions, however, are your own business.",
      "I serve God and the Frontera, in that order. What do you serve?",
      "Speak your piece. But remember - God is listening, even when I'm not.",
      "Many come here seeking absolution. Few are willing to pay the price.",
      "I'm a priest, not a fool. Tell me honestly what brings you here.",
    ],
    hostile: [
      "Even I have limits to forgiveness. You're testing them.",
      "The sanctuary of this church has been violated before. The violators are buried behind it.",
      "I was defrocked for killing a man who deserved it. I kept the skill, lost the collar.",
      "God forgives. I merely facilitate. And some sins require... earthly judgment first.",
      "Leave this place. Your soul is too dark even for my confessional.",
    ],
    quest: [
      "A family at {LOCATION} needs medicine that the company won't provide. Get it to them.",
      "There's a child who witnessed something terrible. Bring them safely to the orphanage.",
      "Someone is burning churches across the territory. Find them before God's justice becomes mine.",
      "I need Last Rites performed at {LOCATION}. The dying man was a soldier - there may be... complications.",
      "My congregation is being threatened. I cannot kill, but you can. Will you be my instrument?",
    ],
    gossip: [
      "Confession is sacred, but patterns are not. Someone important is very scared of something at {LOCATION}.",
      "I've administered Last Rites to more men than I can count. Some deserve Heaven. Some don't.",
      "The dead speak to me in dreams. They say something dark is stirring in the wastes.",
      "There's a faction within the Frontera that even Don Rafael doesn't control. Tread carefully.",
      "In wine, there's truth. In confession, there's more. And I've heard things that make me pray harder.",
    ],
  },
};

export default fronteraNPCs;
