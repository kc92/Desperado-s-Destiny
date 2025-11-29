/**
 * Workshop NPCs Data
 * Phase 7, Wave 7.2 - Desperados Destiny
 *
 * Complete NPC definitions for all workshop buildings
 */

import {
  WorkshopNPC,
  NPCDialogue,
  NPCService
} from '@desperados/shared';
import { ProfessionId } from '@desperados/shared';

// ============================================================================
// RED GULCH NPCs
// ============================================================================

export const HANK_IRONSIDE: WorkshopNPC = {
  id: 'npc_hank_ironside',
  name: 'Hank Ironside',
  role: 'trainer',
  title: 'Master Blacksmith',
  description: 'A burly man with arms like tree trunks and a face weathered by forge heat. Hank has been smithing for thirty years.',
  personality: 'Gruff but fair. No-nonsense attitude toward work. Respects skill and dedication. Has a soft spot for earnest apprentices.',
  faction: 'settler',
  dialogue: {
    greeting: [
      "Mornin'. You here to work or just gawk?",
      "Fire's hot, iron's ready. What do you need?",
      "Time's gold, friend. State your business."
    ],
    idle: [
      "*hammers steadily at glowing metal*",
      "Good steel takes time. Can't rush quality.",
      "Thirty years I've been at this forge. Still learning every day.",
      "You know why they call me Ironside? Ain't 'cause I'm soft."
    ],
    training: [
      "You want to learn smithing? I'll teach you, but I don't coddle.",
      "Feel that heat? That's your forge talking to you. Learn to listen.",
      "Three rules: Heat it right, hit it true, quench it quick. Everything else follows.",
      "You've got potential. Keep at it and you might amount to something."
    ],
    selling: [
      "I've got iron, steel, and coal. What're you buying?",
      "Fair prices for fair work. That's my motto.",
      "You need tools? I make the best in three counties."
    ],
    farewell: [
      "Keep that forge hot and your hammer true.",
      "Good work today. Come back tomorrow.",
      "Steel and sweat, that's the way."
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Blacksmithing Training',
      description: 'Learn the fundamentals of blacksmithing from a master',
      cost: 50,
      trainableProfession: ProfessionId.BLACKSMITHING
    },
    {
      type: 'sell',
      name: 'Smithing Supplies',
      description: 'Iron ore, coal, and basic tools',
      availableItems: ['iron_ore', 'steel_ingot', 'coal', 'smithing_hammer', 'tongs']
    },
    {
      type: 'repair',
      name: 'Tool Repair',
      description: 'Repair damaged smithing tools',
      cost: 10
    }
  ],
  schedule: [
    { hour: 6, activity: 'Opening forge, heating coals' },
    { hour: 8, activity: 'Working on orders' },
    { hour: 12, activity: 'Lunch break' },
    { hour: 13, activity: 'Training apprentices' },
    { hour: 16, activity: 'Personal projects' },
    { hour: 20, activity: 'Banking forge, closing shop' }
  ],
  backstory: "Hank learned smithing from his father in Pennsylvania. Came West during the gold rush, found more gold in honest metalwork. Built Red Gulch's first forge twenty years ago and has been the town's smith ever since."
};

export const JIMMY_APPRENTICE: WorkshopNPC = {
  id: 'npc_jimmy_apprentice',
  name: 'Jimmy Cooper',
  role: 'assistant',
  title: 'Apprentice Smith',
  description: 'A gangly teenager with eager eyes and singed eyebrows. Learning the trade under Hank.',
  personality: 'Enthusiastic, sometimes too eager. Makes mistakes but learns from them. Admires skilled craftsmen.',
  dialogue: {
    greeting: [
      "Hello! Are you here to use the forge?",
      "Mr. Ironside says I'm getting better every day!",
      "Welcome to Hank's Forge! Can I help you?"
    ],
    idle: [
      "*carefully organizes tools*",
      "Someday I'll be as good as Mr. Ironside.",
      "I only burned myself twice today!",
      "*practices hammer swings on a cold anvil*"
    ],
    farewell: [
      "Good luck with your crafting!",
      "Come back soon!",
      "May your steel be strong!"
    ]
  },
  services: [
    {
      type: 'sell',
      name: 'Basic Supplies',
      description: 'Common smithing materials',
      cost: 5,
      availableItems: ['iron_ore', 'coal']
    }
  ],
  backstory: "Local farm boy who showed aptitude for metalwork. Hank took him on as an apprentice six months ago. Dreams of becoming a master smith."
};

export const SARAH_TANNER: WorkshopNPC = {
  id: 'npc_sarah_tanner',
  name: 'Sarah Blackwood',
  role: 'trainer',
  title: 'Master Tanner',
  description: 'A weathered woman in her forties, hands stained from tanning solutions. Sharp-eyed and sharp-tongued.',
  personality: 'Practical and blunt. No patience for squeamishness. Fair dealer. Excellent teacher once you prove yourself.',
  faction: 'settler',
  dialogue: {
    greeting: [
      "Can't handle the smell? Then you can't handle leather.",
      "Welcome. Mind the racks, they're worth more than you.",
      "Here for hides or just hiding from work?"
    ],
    idle: [
      "*scrapes a hide with practiced motions*",
      "Each hide tells a story. This one's got a cougar scar.",
      "Good leather needs time. Patience is half the craft.",
      "People think tanning is just soaking hides. They're fools."
    ],
    training: [
      "You want to learn tanning? Hope you've got a strong stomach.",
      "First lesson: respect the animal. It gave its life for this hide.",
      "The chemicals will burn if you're careless. Pay attention.",
      "You're not terrible. That's high praise from me."
    ],
    selling: [
      "I've got hides fresh and cured. What quality you need?",
      "These are prime hides. I don't deal in garbage.",
      "Fair price for good leather. Take it or leave it."
    ],
    farewell: [
      "Don't waste good leather on sloppy work.",
      "Come back when you need more hides.",
      "Mind your cuts and your stitches."
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Leatherworking Training',
      description: 'Learn proper tanning and leatherworking techniques',
      cost: 50,
      trainableProfession: ProfessionId.LEATHERWORKING
    },
    {
      type: 'sell',
      name: 'Hides and Leather',
      description: 'Raw and tanned leather of various qualities',
      availableItems: ['raw_cowhide', 'tanned_leather', 'deer_hide', 'tanning_solution']
    },
    {
      type: 'buy',
      name: 'Finished Goods',
      description: 'Will purchase quality leather goods',
      cost: 0
    }
  ],
  backstory: "Learned tanning from her father, took over the business when he passed. Toughened by frontier life and the harsh chemicals of her trade. Respected for her skill and fair dealing."
};

export const OLD_PETE: WorkshopNPC = {
  id: 'npc_old_pete',
  name: 'Old Pete',
  role: 'lore_keeper',
  title: 'Retired Tanner',
  description: 'An ancient man who seems to be part of the tannery furniture. Always has a story to tell.',
  personality: 'Rambling storyteller. Fountain of leather lore. Surprisingly sharp despite his age.',
  dialogue: {
    greeting: [
      "*looks up slowly* Ah, a new face. Or is it? Memory ain't what it was.",
      "Back in my day, we tanned buffalo hides this thick...",
      "You remind me of a fella I knew in '49. He's dead now."
    ],
    idle: [
      "*chews tobacco contemplatively*",
      "I once tanned a hide so big...",
      "*dozes off mid-story*",
      "These young folk don't know proper tanning no more."
    ],
    farewell: [
      "*waves vaguely*",
      "Don't be a stranger, or do. I forget anyway.",
      "Leather outlasts us all, remember that."
    ]
  },
  services: [
    {
      type: 'sell',
      name: 'Old Stories',
      description: 'Shares leather lore and forgotten techniques (if you listen)',
      cost: 0
    }
  ],
  backstory: "Pete's been tanning hides for sixty years. Sarah lets him hang around the tannery, partly out of respect, partly because his random advice is sometimes brilliant."
};

export const DOC_HOLLIDAY: WorkshopNPC = {
  id: 'npc_doc_holliday',
  name: 'Dr. Silas Holliday',
  role: 'trainer',
  title: 'Town Doctor & Alchemist',
  description: 'A thin, scholarly man with spectacles and stained fingers. Medical doctor by training, alchemist by necessity.',
  personality: 'Intellectual and patient. Precise in all things. Passionate about healing. Suspicious of snake oil salesmen.',
  faction: 'settler',
  dialogue: {
    greeting: [
      "Good day. Medical emergency or alchemy business?",
      "Welcome to my practice. Please, no potions for 'love' or 'luck'.",
      "Ah, another seeker of the alchemical arts."
    ],
    idle: [
      "*carefully labels bottles*",
      "Precision is everything in medicine and alchemy both.",
      "*consults a thick medical tome*",
      "Alchemy isn't magic. It's chemistry, biology, and careful observation."
    ],
    training: [
      "You wish to learn alchemy? I can teach proper methodology.",
      "First, we learn safety. Then, we learn ingredients. Then, and only then, we craft.",
      "Show me you understand the principles, not just the recipes.",
      "Excellent work. You're thinking like a true alchemist now."
    ],
    selling: [
      "I stock medical-grade ingredients. No shortcuts, no impurities.",
      "These herbs are fresh. That matters more than you might think.",
      "Quality reagents for quality work. That's my standard."
    ],
    farewell: [
      "Remember: measure twice, mix once.",
      "Good luck with your alchemical endeavors.",
      "Stay safe, and keep your workspace clean."
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Alchemy Training',
      description: 'Learn scientific alchemy and potion making',
      cost: 75,
      trainableProfession: ProfessionId.ALCHEMY,
      requirements: [
        {
          type: 'level',
          value: 5,
          description: 'Basic education required'
        }
      ]
    },
    {
      type: 'sell',
      name: 'Alchemical Supplies',
      description: 'Medical-grade herbs, reagents, and equipment',
      availableItems: ['medical_herbs', 'alcohol', 'glass_vials', 'distilled_water', 'common_reagents']
    },
    {
      type: 'quest',
      name: 'Medical Assistance',
      description: 'Help Doc with various medical cases',
      cost: 0
    }
  ],
  backstory: "Trained as a physician in Boston, came West for his health (ironically). Found frontier medicine required as much alchemy as medical knowledge. Now practices both arts with equal skill."
};

export const NURSE_MARIA: WorkshopNPC = {
  id: 'npc_nurse_maria',
  name: 'Maria Santos',
  role: 'assistant',
  title: 'Nurse & Herbalist',
  description: 'A kind-faced woman with herb stains on her apron. Knows both traditional medicine and modern techniques.',
  personality: 'Compassionate and knowledgeable. Bridge between old herbal remedies and new medical science.',
  dialogue: {
    greeting: [
      "Hello, dear. Are you feeling alright?",
      "Welcome! Dr. Holliday is with a patient, but I can help.",
      "Blessed day to you. What brings you here?"
    ],
    idle: [
      "*prepares herbal poultices*",
      "My grandmother taught me these remedies. They work as well as the Doctor's potions.",
      "*hums a gentle melody while working*",
      "Healing is about more than medicine. It's about care."
    ],
    selling: [
      "I have fresh herbs from my garden. Blessed by prayer.",
      "These remedies have helped many people.",
      "Traditional medicine, but with love and faith."
    ],
    farewell: [
      "Go with God's blessing.",
      "May you stay healthy and strong.",
      "Come back if you need anything."
    ]
  },
  services: [
    {
      type: 'sell',
      name: 'Traditional Remedies',
      description: 'Folk remedies and common herbs',
      cost: 5,
      availableItems: ['healing_herbs', 'fever_tea', 'poultice_supplies']
    }
  ],
  backstory: "Daughter of Mexican settlers, learned herbal healing from her grandmother. Fascinated by Dr. Holliday's scientific approach, now blends both traditions in her work."
};

export const DUSTY_BARKEEP: WorkshopNPC = {
  id: 'npc_dusty_barkeep',
  name: 'Dusty Pete Johnson',
  role: 'merchant',
  title: 'Saloon Owner',
  description: 'A stout man with a magnificent mustache and an ever-present towel over his shoulder.',
  personality: 'Jovial and business-savvy. Knows everyone in town. Always has an ear for gossip.',
  faction: 'neutral',
  dialogue: {
    greeting: [
      "Welcome to Dusty's! Best whiskey and grub in Red Gulch!",
      "You look like you could use a drink, friend.",
      "Step right up! What'll it be?"
    ],
    idle: [
      "*polishes a glass*",
      "Heard the damnedest thing earlier...",
      "Business is good. Can't complain.",
      "*serves a regular with practiced ease*"
    ],
    selling: [
      "You want ingredients? I can sell you what I got, long as it don't interfere with meal service.",
      "Fresh eggs, beef, vegetables - whatever Cookie hasn't used yet.",
      "Fair warning: Cookie gets ornery if folks mess up her kitchen."
    ],
    farewell: [
      "Come back for a drink later!",
      "Good luck with your cooking!",
      "Don't be a stranger!"
    ]
  },
  services: [
    {
      type: 'sell',
      name: 'Kitchen Ingredients',
      description: 'Basic cooking supplies and ingredients',
      availableItems: ['beef', 'vegetables', 'eggs', 'flour', 'salt', 'spices']
    },
    {
      type: 'buy',
      name: 'Prepared Meals',
      description: 'Will buy quality prepared food for the saloon',
      cost: 0
    }
  ],
  backstory: "Named the saloon after himself and built it into Red Gulch's social hub. Good businessman who treats customers fair and employees well."
};

export const CONSUELA_COOK: WorkshopNPC = {
  id: 'npc_consuela_cook',
  name: 'Consuela',
  role: 'trainer',
  title: 'Saloon Cook',
  description: 'A formidable woman who rules her kitchen with an iron spatula. Her meals are legendary.',
  personality: 'Fierce and protective of her domain. Passionate about food. Warms up to those who show proper respect and skill.',
  dialogue: {
    greeting: [
      "You want to use MY kitchen? We'll see about that.",
      "*eyes you critically* Can you cook, or just make mess?",
      "This kitchen runs on schedule. Don't slow me down."
    ],
    idle: [
      "*chops vegetables with frightening speed*",
      "Cooking is love made visible. Remember that.",
      "*tastes a sauce* Needs more cumin.",
      "In my grandmother's kitchen in Mexico, I learned to COOK."
    ],
    training: [
      "You want to learn? Then watch, listen, and don't waste food.",
      "Heat, timing, seasoning - master these three.",
      "Better. Much better. You might be a cook someday.",
      "You remind me of myself at your age. That's a compliment, mijo."
    ],
    selling: [
      "These are from my private stores. Don't waste them.",
      "My special spice blend. You don't find this anywhere else.",
      "Handle these ingredients with respect."
    ],
    farewell: [
      "Clean up after yourself. I mean it.",
      "Come back when you're serious about cooking.",
      "Not bad. Not bad at all. *nods approvingly*"
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Cooking Training',
      description: 'Learn traditional cooking methods and recipes',
      cost: 40,
      trainableProfession: ProfessionId.COOKING
    },
    {
      type: 'sell',
      name: 'Specialty Ingredients',
      description: 'Rare spices and special ingredients',
      cost: 15,
      availableItems: ['mexican_spices', 'chili_peppers', 'special_herbs']
    }
  ],
  backstory: "Came north from Mexico with family recipes and exceptional skill. Dusty hired her and wisely lets her run the kitchen however she wants. Her cooking keeps the saloon packed."
};

export const MRS_PATTERSON: WorkshopNPC = {
  id: 'npc_mrs_patterson',
  name: 'Mrs. Abigail Patterson',
  role: 'merchant',
  title: 'General Store Owner',
  description: 'A prim, proper woman who runs the general store with her husband. Handles the fabric and tailoring side.',
  personality: 'Polite but shrewd. Knows quality. Enjoys teaching proper sewing techniques.',
  dialogue: {
    greeting: [
      "Good morning! How may I assist you today?",
      "Welcome to Patterson's General Store.",
      "Oh, are you interested in our tailoring services?"
    ],
    idle: [
      "*folds fabric precisely*",
      "This calico just arrived from back East.",
      "*adjusts her glasses to examine stitching*",
      "Quality materials make quality garments."
    ],
    selling: [
      "We carry a modest selection of fabrics and notions.",
      "This thread is from the finest mills in New England.",
      "Very reasonable prices, if I do say so myself."
    ],
    farewell: [
      "Thank you for your patronage!",
      "Do come again!",
      "Good day to you!"
    ]
  },
  services: [
    {
      type: 'sell',
      name: 'Fabrics and Notions',
      description: 'Basic fabrics, thread, needles, and patterns',
      availableItems: ['cotton_fabric', 'thread', 'needles', 'buttons', 'simple_patterns']
    }
  ],
  backstory: "Came West with her merchant husband to open the general store. Brought Eastern refinement and quality goods to Red Gulch."
};

export const EMILY_SEAMSTRESS: WorkshopNPC = {
  id: 'npc_emily_seamstress',
  name: 'Emily Clarke',
  role: 'trainer',
  title: 'Seamstress',
  description: 'A young woman with nimble fingers and an eye for fashion, despite the frontier setting.',
  personality: 'Cheerful and encouraging. Dreams of big city fashion but makes the best of frontier life.',
  dialogue: {
    greeting: [
      "Oh, hello! Are you here to sew?",
      "I'm working on the loveliest pattern!",
      "Welcome! Mrs. Patterson lets me use this space."
    ],
    idle: [
      "*sews with quick, precise stitches*",
      "I saw a dress in a catalog from Paris...",
      "Someday I'll have my own shop in San Francisco.",
      "*hums while working*"
    ],
    training: [
      "I can teach you basic sewing and mending.",
      "It's all about consistent stitches and straight seams.",
      "You're a natural! Keep practicing!",
      "Here's a trick I learned from a catalog..."
    ],
    farewell: [
      "Happy sewing!",
      "I hope your project turns out beautifully!",
      "Come back and show me what you made!"
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Basic Tailoring',
      description: 'Learn fundamental sewing and tailoring skills',
      cost: 30,
      trainableProfession: ProfessionId.TAILORING
    }
  ],
  backstory: "Young woman with talent and ambition. Uses her earnings to buy fashion catalogs and dreams of better opportunities while honing her considerable skill."
};

export const GUNSMITH_COLE: WorkshopNPC = {
  id: 'npc_gunsmith_cole',
  name: 'Daniel Cole',
  role: 'trainer',
  title: 'Master Gunsmith',
  description: 'A precise man with steady hands and an obsessive attention to detail. Takes his responsibility seriously.',
  personality: 'Meticulous and safety-conscious. Stern but fair. Passionate about firearms craftsmanship.',
  faction: 'settler',
  dialogue: {
    greeting: [
      "Welcome. All firearms work requires my supervision.",
      "State your business. This is a place of precision, not haste.",
      "Before we begin, what's your experience with gunsmithing?"
    ],
    idle: [
      "*examines a rifle barrel with magnifying glass*",
      "A firearm is only as good as its weakest part.",
      "*carefully measures powder*",
      "Safety isn't optional. It's survival."
    ],
    training: [
      "Gunsmithing is part craftsmanship, part responsibility.",
      "Never rush. A mistake here can kill someone.",
      "Good. You're learning to think before you act.",
      "You've got the touch. Natural gunsmith's hands."
    ],
    selling: [
      "All my parts are tested and certified.",
      "Quality ammunition, properly measured.",
      "I stand behind everything I sell."
    ],
    farewell: [
      "Work safe, work smart.",
      "Mind your measurements and your fingers.",
      "Good shooting."
    ],
    specialEvents: {
      safety_violation: [
        "STOP! What do you think you're doing?!",
        "That's it. Out. Come back when you take this seriously.",
        "One more mistake like that and you're banned."
      ]
    }
  },
  services: [
    {
      type: 'train',
      name: 'Gunsmithing Training',
      description: 'Learn proper firearm maintenance and modification',
      cost: 100,
      trainableProfession: ProfessionId.GUNSMITHING,
      requirements: [
        {
          type: 'reputation',
          value: 100,
          description: 'Must be trusted in community'
        }
      ]
    },
    {
      type: 'sell',
      name: 'Gun Parts & Ammunition',
      description: 'Quality gun components and properly measured ammunition',
      availableItems: ['gun_parts', 'gunpowder', 'bullets', 'casings', 'tools']
    },
    {
      type: 'repair',
      name: 'Firearm Repair',
      description: 'Professional gun cleaning and repair',
      cost: 25
    }
  ],
  backstory: "Apprenticed in a famous gunsmith shop back East. Came West seeking opportunity but carries the same standards. Knows firearms inside and out."
};

export const DEPUTY_JACKSON: WorkshopNPC = {
  id: 'npc_deputy_jackson',
  name: 'Deputy Mike Jackson',
  role: 'lore_keeper',
  title: 'Town Deputy',
  description: 'A young lawman who spends time at the gunsmith learning firearm maintenance.',
  personality: 'Earnest and law-abiding. Keeps an eye on who is making what at the armory.',
  dialogue: {
    greeting: [
      "Afternoon. Don't mind me, just keeping an eye on things.",
      "You here for legitimate work, right?",
      "Cole runs a clean operation. Let us keep it that way."
    ],
    idle: [
      "*cleans his revolver carefully*",
      "Sheriff says know your weapon inside and out.",
      "*watches the workshop casually*",
      "Good craftsmanship keeps folks safe."
    ],
    farewell: [
      "Stay out of trouble now.",
      "Remember, I am watching.",
      "Good day, citizen."
    ]
  },
  services: [],
  backstory: "Young deputy learning the job. Sheriff sent him to learn from Cole about firearms. Inadvertently ensures no illegal work happens at the armory."
};

// ============================================================================
// THE FRONTERA NPCs
// ============================================================================

export const RODRIGO_HERRERO: WorkshopNPC = {
  id: 'npc_rodrigo_herrero',
  name: 'Rodrigo "El Maestro" Herrero',
  role: 'trainer',
  title: 'Master of the Forge',
  description: 'A muscular man with burn scars covering his arms. His reputation precedes him - the finest (and most discreet) smith on the frontier.',
  personality: 'Professional and utterly discreet. Asks no questions, tells no tales. Respects skill above all.',
  faction: 'frontera',
  dialogue: {
    greeting: [
      "*nods silently*",
      "You come recommended. Good. Let's work.",
      "What you make here, stays here."
    ],
    idle: [
      "*works metal with supernatural precision*",
      "*says nothing, but watches everything*",
      "Quality speaks louder than words.",
      "*the forge roars, drowning out conversation*"
    ],
    training: [
      "I teach only those worthy. Prove yourself first.",
      "*demonstrates a technique once, expects you to master it*",
      "Better. Much better. You have the gift.",
      "*slight nod of approval - the highest praise*"
    ],
    selling: [
      "I have materials unavailable elsewhere.",
      "The price is the price. No haggling.",
      "These are for masters only. Are you a master?"
    ],
    farewell: [
      "*nods*",
      "Good work. Come back.",
      "Remember: discretion."
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Master Blacksmithing',
      description: 'Advanced techniques no law-abiding smith would teach',
      cost: 500,
      trainableProfession: ProfessionId.BLACKSMITHING,
      requirements: [
        {
          type: 'reputation',
          value: -200,
          description: 'Must have criminal reputation'
        },
        {
          type: 'level',
          value: 40,
          description: 'Expert-level skill required'
        }
      ]
    },
    {
      type: 'sell',
      name: 'Exotic Materials',
      description: 'Rare metals and materials of questionable origin',
      cost: 100,
      availableItems: ['damascus_steel', 'rare_alloys', 'precious_metals', 'mysterious_ore']
    }
  ],
  backstory: "No one knows where Rodrigo learned his craft. Some say Europe, others say he sold his soul. What's certain: he's the best, and he knows it."
};

export const SILENT_MIGUEL: WorkshopNPC = {
  id: 'npc_silent_miguel',
  name: 'Miguel',
  role: 'assistant',
  title: 'The Silent One',
  description: 'A scarred man who never speaks. Guards the forge and assists Rodrigo.',
  personality: 'Completely silent. Watches everything. Intimidating presence.',
  dialogue: {
    greeting: [
      "*stares silently*",
      "*jerks head toward the forge*",
      "*says nothing, waits*"
    ],
    idle: [
      "*sharpens a blade endlessly*",
      "*watches you work with unblinking eyes*",
      "*stands like a statue*"
    ],
    farewell: [
      "*nods once*",
      "*returns to sharpening*"
    ]
  },
  services: [],
  backstory: "Lost his tongue years ago under circumstances no one discusses. Loyal to Rodrigo unto death. His silence is more intimidating than any threat."
};

export const WIDOW_BLACKWOOD: WorkshopNPC = {
  id: 'npc_widow_blackwood',
  name: 'Widow Blackwood',
  role: 'trainer',
  title: 'Mistress of Poisons',
  description: 'A gaunt woman dressed in black, with eyes that seem to look through you. Age indeterminate, could be forty or seventy.',
  personality: 'Darkly amused by everything. Speaks in riddles. Knows secrets that would doom half the territory.',
  faction: 'frontera',
  dialogue: {
    greeting: [
      "*cold smile* Come seeking death in a bottle?",
      "Another soul seeking forbidden knowledge...",
      "The night welcomes you, child. What do you seek?"
    ],
    idle: [
      "*stirs a bubbling cauldron*",
      "Poison and medicine are sisters, you know.",
      "*examines a mushroom thoughtfully*",
      "*laughs softly at some private joke*"
    ],
    training: [
      "You want to learn the dark arts? There's always a price...",
      "This will kill a man in minutes. This one, in hours. Choose wisely.",
      "You have potential. Dark potential.",
      "Remember: the difference between poison and cure is often just the dose."
    ],
    selling: [
      "These ingredients are... difficult to obtain.",
      "I have what you need, if you have the gold.",
      "Some knowledge should remain forbidden. But gold talks."
    ],
    farewell: [
      "*knowing smile* Until we meet again...",
      "Use your knowledge wisely. Or don't. I'm entertained either way.",
      "The shadows await your return."
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Dark Alchemy',
      description: 'Poisons, explosives, and forbidden concoctions',
      cost: 750,
      trainableProfession: ProfessionId.ALCHEMY,
      requirements: [
        {
          type: 'reputation',
          value: -200,
          description: 'Must be known to criminal elements'
        },
        {
          type: 'level',
          value: 30,
          description: 'Significant alchemical knowledge required'
        }
      ]
    },
    {
      type: 'sell',
      name: 'Forbidden Reagents',
      description: 'Toxic, rare, and illegal ingredients',
      cost: 200,
      availableItems: ['deadly_poisons', 'hallucinogens', 'explosive_compounds', 'rare_toxins']
    }
  ],
  backstory: "Some say she's a witch. Others say she's just a woman who learned chemistry in dark places. She claims to have been widowed five times. Some suspect she helped them along."
};

export const SILENT_SERVANT: WorkshopNPC = {
  id: 'npc_silent_servant',
  name: 'The Servant',
  role: 'assistant',
  title: 'Assistant',
  description: 'A figure always in shadow, face concealed. Gender indeterminate. Serves the Widow without question or sound.',
  personality: 'Silent, efficient, unsettling.',
  dialogue: {
    greeting: [
      "*bows slightly*",
      "*gestures to the workshop*",
      "*says nothing, ever*"
    ],
    idle: [
      "*prepares ingredients with eerie precision*",
      "*moves like a ghost*",
      "*watches from the shadows*"
    ],
    farewell: [
      "*bows again*"
    ]
  },
  services: [],
  backstory: "No one knows who or what the Servant is. Widow Blackwood seems amused by speculation. The Servant simply serves, silently and efficiently."
};

export const ONE_EYED_JACK: WorkshopNPC = {
  id: 'npc_one_eyed_jack',
  name: 'One-Eyed Jack Morrison',
  role: 'trainer',
  title: 'Master Gunsmith (Illegal)',
  description: 'A grizzled gunsmith with an eyepatch and a reputation. If you want a gun with no questions, Jack is your man.',
  personality: 'Cynical and paranoid, but brilliant. Trusts no one fully. Respects discretion and skill.',
  faction: 'frontera',
  dialogue: {
    greeting: [
      "Who sent you? Do not lie, I will know.",
      "*sizes you up with one good eye* You law? You smell like law.",
      "You want something done right, or done legal? Can't be both."
    ],
    idle: [
      "*works on a highly modified pistol*",
      "Lost the eye testing a new explosive round. Worth it.",
      "*checks the door constantly*",
      "Law comes sniffing around here sometimes. Always leave empty-handed."
    ],
    training: [
      "You want to learn the real gunsmithing? The stuff they do not teach?",
      "This modification? Completely illegal. Also completely effective.",
      "You are getting it. Do not let conscience slow you down.",
      "Good. Real good. You could work for me, if you wanted."
    ],
    selling: [
      "I got parts you will not find anywhere else.",
      "This batch of powder? Let us just say it is extra potent.",
      "Serial numbers are optional, if you catch my drift."
    ],
    farewell: [
      "Stay sharp. Stay quiet.",
      "Do not tell anyone where you got that.",
      "Come back when you need real work done."
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Illegal Gunsmithing',
      description: 'Modifications and techniques banned by law',
      cost: 1000,
      trainableProfession: ProfessionId.GUNSMITHING,
      requirements: [
        {
          type: 'reputation',
          value: -300,
          description: 'Must be vouched for by known criminals'
        }
      ]
    },
    {
      type: 'sell',
      name: 'Black Market Parts',
      description: 'Illegal modifications and experimental components',
      cost: 300,
      availableItems: ['illegal_mods', 'explosive_rounds', 'stolen_parts', 'experimental_weapons']
    }
  ],
  backstory: "Was a legitimate gunsmith until the law came for him over some 'misunderstandings.' Now he does what he does best, just outside the law's reach."
};

export const THE_TINKERER: WorkshopNPC = {
  id: 'npc_the_tinkerer',
  name: 'The Tinkerer',
  role: 'quest_giver',
  title: 'Experimental Weapons Designer',
  description: 'A wild-haired inventor obsessed with pushing firearm technology to its limits (and beyond).',
  personality: 'Manic inventor energy. Brilliant but dangerously reckless. Excited by explosions.',
  dialogue: {
    greeting: [
      "Ah! Another test subject- I mean, customer!",
      "Perfect timing! I just finished a new prototype!",
      "*covered in soot* Don't worry, that's from earlier."
    ],
    idle: [
      "*scribbles calculations frantically*",
      "What if we made the bullets BIGGER?",
      "*something explodes in the back room* Success!",
      "Safety is just a suggestion, really."
    ],
    farewell: [
      "Come back if you survive! Er, when! When you survive!",
      "Remember: aim AWAY from your face!",
      "Good luck! You'll need it!"
    ]
  },
  services: [
    {
      type: 'quest',
      name: 'Field Testing',
      description: 'Test experimental weapons (at your own risk)',
      cost: 0
    },
    {
      type: 'sell',
      name: 'Experimental Ammunition',
      description: 'Untested and possibly dangerous ammunition types',
      cost: 50,
      availableItems: ['experimental_rounds', 'prototype_guns']
    }
  ],
  backstory: "Kicked out of every legitimate workshop for 'safety violations.' Found a home in the Frontera where his particular brand of genius is appreciated (from a safe distance)."
};

// ============================================================================
// FORT ASHFORD NPCs
// ============================================================================

export const SERGEANT_MCALLISTER: WorkshopNPC = {
  id: 'npc_sergeant_mcallister',
  name: 'Sergeant Duncan McAllister',
  role: 'trainer',
  title: 'Army Master Smith',
  description: 'A career soldier and master smith. His forge keeps the cavalry armed and armored to military standards.',
  personality: 'Military discipline incarnate. Fair but demanding. Expects excellence.',
  faction: 'settler',
  dialogue: {
    greeting: [
      "State your business, civilian.",
      "This is a military facility. What clearance do you have?",
      "At ease. What brings you to my forge?"
    ],
    idle: [
      "*hammers with mechanical precision*",
      "In the army, we do things by the book.",
      "*inspects work with military exactness*",
      "Quality saves lives in the field."
    ],
    training: [
      "I'll teach you military smithing. Keep up or get out.",
      "This is how the army makes gear that won't fail in battle.",
      "Outstanding work. You'd make a fine army smith.",
      "Precision. Consistency. Reliability. Remember those."
    ],
    selling: [
      "Military surplus available to approved personnel.",
      "Army-grade steel. Nothing better.",
      "These materials meet regulation standards."
    ],
    farewell: [
      "Dismissed. Good work today.",
      "Carry on, civilian.",
      "Return when needed."
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Military Blacksmithing',
      description: 'Army-standard smithing techniques and specifications',
      cost: 200,
      trainableProfession: ProfessionId.BLACKSMITHING,
      requirements: [
        {
          type: 'reputation',
          value: 500,
          description: 'Excellent military standing'
        }
      ]
    },
    {
      type: 'sell',
      name: 'Military Materials',
      description: 'Army-surplus metals and materials',
      cost: 50,
      availableItems: ['military_steel', 'standard_iron', 'army_coal']
    }
  ],
  backstory: "Twenty years in the army, master smith for the last ten. Maintains the highest standards and expects the same from everyone in his forge."
};

export const CORPORAL_HUGHES: WorkshopNPC = {
  id: 'npc_corporal_hughes',
  name: 'Corporal James Hughes',
  role: 'assistant',
  title: 'Assistant Smith',
  description: 'A young soldier learning smithing from the Sergeant. Eager to prove himself.',
  personality: 'Enthusiastic and by-the-book. Tries hard to live up to military standards.',
  dialogue: {
    greeting: [
      "Sir! Ma'am! Welcome to the forge!",
      "The Sergeant says I'm improving, sir!",
      "At your service!"
    ],
    idle: [
      "*practices hammer technique*",
      "One day I'll be as good as the Sergeant.",
      "*keeps tools precisely organized*",
      "Everything by regulation, that's the key."
    ],
    farewell: [
      "Good day! Sir! Ma'am!",
      "Return safely!",
      "Dismissed!"
    ]
  },
  services: [],
  backstory: "Joined the army young, showed aptitude for metalwork. The Sergeant took him under his wing. Works hard to earn his mentor's respect."
};

// ============================================================================
// MORE NPCs - TOTAL COUNT: 35+
// ============================================================================

export const QUARTERMASTER_JENKINS: WorkshopNPC = {
  id: 'npc_quartermaster_jenkins',
  name: 'Quartermaster William Jenkins',
  role: 'merchant',
  title: 'Fort Quartermaster',
  description: 'Handles all supplies for Fort Ashford, including the tailoring shop.',
  personality: 'Organized and efficient. Everything has a place and a purpose.',
  faction: 'settler',
  dialogue: {
    greeting: [
      "What do you need? State it clearly, I'm a busy man.",
      "All requisitions must be properly documented.",
      "Supplies are accounted for. What's your need?"
    ],
    idle: [
      "*checks inventory lists*",
      "Everything in order, everything in place.",
      "*marks items in ledger*",
      "I know where every button is in this fort."
    ],
    selling: [
      "Military surplus fabric, good quality.",
      "Bulk discounts for large orders.",
      "These meet army specifications."
    ],
    farewell: [
      "Sign here. And here. Good day.",
      "Supplies depleted will be noted.",
      "Dismissed."
    ]
  },
  services: [
    {
      type: 'sell',
      name: 'Military Fabrics',
      description: 'Durable fabrics and sewing supplies',
      cost: 30,
      availableItems: ['canvas', 'wool', 'thread', 'buttons', 'military_patterns']
    }
  ],
  backstory: "Career quartermaster who takes pride in efficient supply management. Runs the military tailoring operation with the same precision as ammunition distribution."
};

export const SEAMSTRESS_MOLLY: WorkshopNPC = {
  id: 'npc_seamstress_molly',
  name: 'Molly Brennan',
  role: 'trainer',
  title: 'Military Seamstress',
  description: 'Civilian contractor who makes and repairs uniforms for Fort Ashford.',
  personality: 'Professional and skilled. Used to military precision.',
  dialogue: {
    greeting: [
      "Morning. You here for uniform work?",
      "Everything to regulation, that's my job.",
      "Welcome. Mind the fabric stacks."
    ],
    idle: [
      "*sews with mechanical precision*",
      "Regulation hem is exactly one inch.",
      "*measures twice, cuts once*",
      "I make three dozen uniforms a month."
    ],
    training: [
      "I can teach you military sewing standards.",
      "Precision matters. These uniforms must be identical.",
      "Good work. Very good work.",
      "You could get a contract here if you keep this up."
    ],
    farewell: [
      "Good day. Mind your stitches.",
      "Come back if you need work.",
      "Clean workspace. I like that."
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Military Tailoring',
      description: 'Uniform construction and regulation sewing',
      cost: 75,
      trainableProfession: ProfessionId.TAILORING
    }
  ],
  backstory: "Widow of a soldier, took up sewing to support herself. Earned a military contract through excellent work. Trains others to her exacting standards."
};

// Additional NPCs for completeness (brief versions)

export const MASTER_GUNSMITH_WYATT: WorkshopNPC = {
  id: 'npc_master_gunsmith_wyatt',
  name: 'Master Gunsmith Isaiah Wyatt',
  role: 'trainer',
  title: 'Army Master Gunsmith',
  description: 'The finest military gunsmith in the territory. Works on experimental army firearms.',
  personality: 'Brilliant craftsman. Perfectionist. Passionate about advancing firearms technology.',
  faction: 'settler',
  dialogue: {
    greeting: [
      "Welcome to the finest gunsmithing facility west of the Mississippi.",
      "You have clearance to be here? Good. Let's begin.",
      "Precision is everything. Remember that."
    ],
    idle: [
      "*examines barrel rifling under magnification*",
      "The army wants better guns. I give them perfection.",
      "*tests action smoothness repeatedly*",
      "Every thousandth of an inch matters."
    ],
    training: [
      "I only train master-level gunsmiths. Are you worthy?",
      "This technique separates amateurs from experts.",
      "Excellent. Truly excellent work.",
      "You have the gift. I'll teach you everything."
    ],
    selling: [
      "These are the finest parts available anywhere.",
      "Military-grade components. Tested and certified.",
      "Worth every penny. Quality saves lives."
    ],
    farewell: [
      "Good work today. Very good work.",
      "Return when you're ready to learn more.",
      "Excellence is a journey, not a destination."
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Master Gunsmithing',
      description: 'Advanced military gunsmithing techniques',
      cost: 500,
      trainableProfession: ProfessionId.GUNSMITHING,
      requirements: [
        {
          type: 'level',
          value: 50,
          description: 'Master-level skill required'
        },
        {
          type: 'reputation',
          value: 750,
          description: 'Exceptional military standing'
        }
      ]
    },
    {
      type: 'sell',
      name: 'Premium Gun Components',
      description: 'Highest quality parts and tools',
      cost: 200,
      availableItems: ['precision_parts', 'military_grade_barrel', 'refined_powder', 'expert_tools']
    }
  ],
  backstory: "Learned his trade at the Springfield Armory. Came West with experimental weapon contracts. His work defines modern military firearms."
};

export const LIEUTENANT_FIREARMS: WorkshopNPC = {
  id: 'npc_lieutenant_firearms',
  name: 'Lieutenant Robert Hayes',
  role: 'quest_giver',
  title: 'Weapons Testing Officer',
  description: 'Army officer responsible for testing new firearms and ammunition.',
  personality: 'Methodical and detail-oriented. Values data over opinion.',
  dialogue: {
    greeting: [
      "Lieutenant Hayes. Weapons testing division.",
      "You here to help with testing?",
      "We're always looking for quality work."
    ],
    idle: [
      "*reviews test results*",
      "This rifle performed well in field trials.",
      "*makes detailed notes*",
      "Data doesn't lie."
    ],
    farewell: [
      "Carry on.",
      "Report back with results.",
      "Good day."
    ]
  },
  services: [
    {
      type: 'quest',
      name: 'Weapon Testing',
      description: 'Test prototype firearms and ammunition',
      cost: 0
    }
  ],
  backstory: "West Point graduate assigned to weapons development. Takes his testing responsibilities seriously. Can make or break a gunsmith's reputation."
};

// Whiskey Bend NPCs

export const MADAME_DUBOIS: WorkshopNPC = {
  id: 'npc_madame_dubois',
  name: 'Madame Celeste Dubois',
  role: 'trainer',
  title: 'Haute Couture Designer',
  description: 'A sophisticated French designer who brought Parisian fashion to the frontier.',
  personality: 'Refined, demanding, but generous with knowledge for those who show talent.',
  dialogue: {
    greeting: [
      "*examines you critically* Hmm. We have work to do.",
      "Welcome to my atelier, darling.",
      "*in French accent* Ah, another student of fashion!"
    ],
    idle: [
      "*drapes fabric artistically*",
      "Fashion is art, darling. Never forget that.",
      "*sketches designs rapidly*",
      "In Paris, we would never accept such work."
    ],
    training: [
      "I will teach you style, elegance, perfection.",
      "No, no, no! Like THIS, darling!",
      "Oh! Magnifique! Now you understand!",
      "You have natural talent. Rare on this frontier."
    ],
    selling: [
      "These fabrics are imported from Paris.",
      "Only the finest for my clientele.",
      "Worth every penny, I assure you."
    ],
    farewell: [
      "Au revoir, darling!",
      "Create something beautiful!",
      "*air kisses* Until next time!"
    ]
  },
  services: [
    {
      type: 'train',
      name: 'High Fashion Design',
      description: 'Learn haute couture techniques and design',
      cost: 300,
      trainableProfession: ProfessionId.TAILORING,
      requirements: [
        {
          type: 'level',
          value: 30,
          description: 'Advanced tailoring skill required'
        }
      ]
    },
    {
      type: 'sell',
      name: 'Luxury Fabrics',
      description: 'Imported silks, satins, and fine materials',
      cost: 150,
      availableItems: ['silk', 'satin', 'lace', 'exotic_fabrics', 'fashion_patterns']
    }
  ],
  backstory: "Left Paris under mysterious circumstances. Brought haute couture to Whiskey Bend and found wealthy clientele among entertainers and nouveaux riches. Never speaks of her past."
};

// Additional Whiskey Bend NPCs

export const SEAMSTRESS_VIVIAN: WorkshopNPC = {
  id: 'npc_seamstress_vivian',
  name: 'Vivian LaRue',
  role: 'assistant',
  title: 'Assistant Designer',
  description: "Madame Dubois' talented assistant. Learning haute couture while adding her own American flair.",
  personality: 'Creative and ambitious. Balances European refinement with frontier practicality.',
  dialogue: {
    greeting: [
      "Welcome to The Gilded Needle!",
      "Madame is with a client, but I can help you.",
      "Looking for something special?"
    ],
    idle: [
      "*embroiders delicate patterns*",
      "I dream of opening my own shop someday.",
      "*organizes fabric samples*",
      "Madame says I'm ready to design my own line."
    ],
    farewell: [
      "Create something wonderful!",
      "Come back and show us your work!",
      "Good luck with your project!"
    ]
  },
  services: [
    {
      type: 'sell',
      name: 'Design Consultation',
      description: 'Help with design choices and fabric selection',
      cost: 10
    }
  ],
  backstory: "Local girl who showed exceptional talent. Madame Dubois took her on as apprentice. Now blends European high fashion with American sensibility."
};

export const MADAME_WU: WorkshopNPC = {
  id: 'npc_madame_wu',
  name: 'Madame Wu Chen',
  role: 'trainer',
  title: 'Master Herbalist',
  description: 'Elegant Chinese herbalist who knows medicines from two continents.',
  personality: 'Serene and knowledgeable. Speaks softly but commands respect. Generous with wisdom.',
  dialogue: {
    greeting: [
      "*bows slightly* Welcome, honored guest.",
      "The body and spirit both need healing.",
      "Please, come in. How may I help you?"
    ],
    idle: [
      "*grinds herbs with mortar and pestle*",
      "This herb grows only in the high mountains of China.",
      "*burns incense thoughtfully*",
      "Balance. Everything seeks balance."
    ],
    training: [
      "I will teach you the wisdom of the East.",
      "This technique is very old, very powerful.",
      "You learn well. Your heart is open.",
      "Patience and precision. These are the keys."
    ],
    selling: [
      "These herbs traveled far to reach here.",
      "Quality ingredients make quality medicine.",
      "I vouch for the purity of everything I sell."
    ],
    farewell: [
      "*bows* May you walk in health.",
      "Return when you need wisdom or medicine.",
      "Peace be with you."
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Eastern Alchemy',
      description: 'Traditional Chinese herbal medicine and alchemy',
      cost: 150,
      trainableProfession: ProfessionId.ALCHEMY
    },
    {
      type: 'sell',
      name: 'Exotic Herbs',
      description: 'Rare herbs from the Orient',
      cost: 75,
      availableItems: ['chinese_herbs', 'ginseng', 'exotic_roots', 'rare_fungi']
    }
  ],
  backstory: "Came to America with her merchant husband. When he died, she used her considerable knowledge of Eastern medicine to establish her apothecary. Bridges two worlds of healing."
};

export const ASSISTANT_MEI: WorkshopNPC = {
  id: 'npc_assistant_mei',
  name: 'Mei Lin',
  role: 'assistant',
  title: 'Apprentice Herbalist',
  description: "Madame Wu's young niece, learning the family trade.",
  personality: 'Shy but curious. Eager to learn. Deeply respects her aunt.',
  dialogue: {
    greeting: [
      "*speaks softly* Hello. May I help you?",
      "*bows politely*",
      "My aunt is preparing medicines. I can assist you."
    ],
    idle: [
      "*carefully labels bottles*",
      "*studies herb book intently*",
      "*practices grinding techniques*",
      "Auntie says I'm improving."
    ],
    farewell: [
      "*bows* Thank you for visiting.",
      "Please come again.",
      "*smiles shyly and returns to work*"
    ]
  },
  services: [],
  backstory: "Came from China to live with her aunt. Learning the herbalist trade while adapting to American frontier life."
};

export const CHEF_BEAUMONT: WorkshopNPC = {
  id: 'npc_chef_beaumont',
  name: 'Chef François Beaumont',
  role: 'trainer',
  title: 'Master Chef',
  description: 'French-trained chef who brings haute cuisine to the frontier.',
  personality: 'Passionate perfectionist. Temperamental but generous with knowledge. Takes food very seriously.',
  dialogue: {
    greeting: [
      "*in French accent* Welcome to my kitchen!",
      "You wish to cook? We shall see if you have ze talent.",
      "Ah! A fellow lover of ze culinary arts!"
    ],
    idle: [
      "*tastes sauce* Not enough thyme!",
      "*chops vegetables with lightning speed*",
      "In ze kitchen, precision is EVERYTHING!",
      "*plates a dish like artwork*"
    ],
    training: [
      "I will teach you, but you must LISTEN!",
      "No, no, NO! Ze temperature must be exact!",
      "Ah! Now you understand! Magnifique!",
      "You have ze gift. I see it in your work."
    ],
    selling: [
      "These ingredients are imported at great expense.",
      "Only ze finest for my kitchen.",
      "Quality is never an accident."
    ],
    farewell: [
      "Cook with passion!",
      "Remember what I taught you!",
      "Au revoir! Make something beautiful!"
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Gourmet Cooking',
      description: 'French haute cuisine techniques',
      cost: 250,
      trainableProfession: ProfessionId.COOKING,
      requirements: [
        {
          type: 'level',
          value: 25,
          description: 'Expert cooking skill required'
        }
      ]
    },
    {
      type: 'sell',
      name: 'Gourmet Ingredients',
      description: 'Premium and exotic ingredients',
      cost: 100,
      availableItems: ['truffles', 'fine_wines', 'exotic_spices', 'premium_meats']
    }
  ],
  backstory: "Trained in Paris's finest restaurants. Fled France after a scandal involving a duchess and a soufflé. Found new life (and clientele) in Whiskey Bend."
};

export const SOUS_CHEF_ANTONIO: WorkshopNPC = {
  id: 'npc_sous_chef_antonio',
  name: 'Antonio Rossi',
  role: 'assistant',
  title: 'Sous Chef',
  description: "Chef Beaumont's right hand in the kitchen. Italian by birth, trained in French technique.",
  personality: 'Calm counter to the Chef passion. Organized and efficient.',
  dialogue: {
    greeting: [
      "Buongiorno! Welcome to the kitchen.",
      "Chef is... in fine form today.",
      "*smiles warmly* How can I help you?"
    ],
    idle: [
      "*preps ingredients meticulously*",
      "*keeps the kitchen organized*",
      "*tastes and adjusts seasonings*",
      "Organization is the key to great cooking."
    ],
    farewell: [
      "Ciao! Happy cooking!",
      "May your food be delicious!",
      "Return soon!"
    ]
  },
  services: [
    {
      type: 'sell',
      name: 'Quality Ingredients',
      description: 'Fresh, premium cooking ingredients',
      cost: 50,
      availableItems: ['fresh_vegetables', 'quality_meats', 'italian_herbs']
    }
  ],
  backstory: "Left Italy to see the world. Ended up in Whiskey Bend working for a mad French chef. Wouldn't have it any other way."
};

// Coalition NPCs

export const ELDER_STANDING_BEAR: WorkshopNPC = {
  id: 'npc_elder_standing_bear',
  name: 'Elder Standing Bear',
  role: 'trainer',
  title: 'Keeper of Traditional Ways',
  description: 'Elderly Coalition craftsman who teaches traditional leatherworking.',
  personality: 'Patient, wise, deeply spiritual. Sees crafting as ceremony.',
  faction: 'nahi',
  dialogue: {
    greeting: [
      "Walk in balance, friend.",
      "The buffalo has blessed us. Let us honor it.",
      "Welcome, young one. Come, learn the old ways."
    ],
    idle: [
      "*works leather with reverent care*",
      "Each hide carries the spirit of the animal.",
      "*hums traditional songs*",
      "We waste nothing. We honor everything."
    ],
    training: [
      "I will teach you, but first you must understand.",
      "It is not just skill. It is respect.",
      "Good. You begin to see with your heart, not just your hands.",
      "You have learned well. You honor the craft."
    ],
    farewell: [
      "Walk in beauty.",
      "May the spirits guide your work.",
      "Return when you are ready to learn more."
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Traditional Leatherworking',
      description: 'Sacred techniques passed through generations',
      cost: 0,
      trainableProfession: ProfessionId.LEATHERWORKING,
      requirements: [
        {
          type: 'reputation',
          value: 500,
          description: 'Must be honored by Coalition'
        }
      ]
    }
  ],
  backstory: "Elder craftsman who has worked leather for sixty years. Teaches not just technique but the spiritual meaning of the craft. Revered by his people."
};

export const GRAY_DOVE: WorkshopNPC = {
  id: 'npc_gray_dove',
  name: 'Gray Dove',
  role: 'assistant',
  title: 'Traditional Craftswoman',
  description: 'Young Coalition woman learning the old ways from Elder Standing Bear.',
  personality: 'Quiet and observant. Deep respect for tradition while curious about new techniques.',
  faction: 'nahi',
  dialogue: {
    greeting: [
      "*nods respectfully*",
      "Welcome. The Elder speaks of you.",
      "Come, work with us in the old way."
    ],
    idle: [
      "*works leather with focused concentration*",
      "*sings traditional songs softly*",
      "My grandmother's grandmother worked leather this way.",
      "*carefully prepares brain tanning solution*"
    ],
    farewell: [
      "Walk in balance.",
      "May your work honor the animal.",
      "Return when the sun calls you."
    ]
  },
  services: [
    {
      type: 'sell',
      name: 'Traditional Supplies',
      description: 'Natural tanning supplies and blessed tools',
      cost: 0,
      availableItems: ['brain_tanning_solution', 'blessed_tools', 'natural_dyes']
    }
  ],
  backstory: "Chosen by Elder Standing Bear to carry on the traditional ways. Learning not just craft, but ceremony and meaning."
};

export const MEDICINE_WOMAN_WHITE_CLOUD: WorkshopNPC = {
  id: 'npc_medicine_woman_white_cloud',
  name: 'White Cloud',
  role: 'trainer',
  title: 'Medicine Woman',
  description: 'Revered healer who knows the spiritual and physical properties of every plant on Coalition lands.',
  personality: 'Wise and mystical. Speaks in metaphors. Sees connections others miss.',
  faction: 'nahi',
  dialogue: {
    greeting: [
      "The spirits told me you would come.",
      "*looks at you with knowing eyes* What ails you, child?",
      "Come, sit. The plants will speak through me."
    ],
    idle: [
      "*prepares medicine while chanting*",
      "This plant dreams of healing. We must help it wake.",
      "*burns sacred herbs*",
      "All medicine begins with prayer."
    ],
    training: [
      "I will teach you, but first you must listen to the plants.",
      "Medicine is not just mixing. It is understanding, prayer, intention.",
      "Good. You begin to hear what the plants say.",
      "The spirits smile on your work. You are blessed."
    ],
    selling: [
      "These plants are sacred. Use them with reverence.",
      "I ask no gold. Bring me what you can trade.",
      "Take what you need. The earth provides."
    ],
    farewell: [
      "May healing walk with you.",
      "Listen to your dreams. They will teach you.",
      "The spirits watch over you."
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Spiritual Medicine',
      description: 'Traditional healing and sacred alchemy',
      cost: 0,
      trainableProfession: ProfessionId.ALCHEMY,
      requirements: [
        {
          type: 'reputation',
          value: 300,
          description: 'Trusted by Coalition'
        }
      ]
    },
    {
      type: 'sell',
      name: 'Sacred Plants',
      description: 'Blessed herbs and spiritual medicine components',
      cost: 0,
      availableItems: ['sacred_herbs', 'vision_plants', 'blessed_water', 'spirit_totems']
    }
  ],
  backstory: "Trained by her grandmother and great-grandmother in the medicine ways. Considered one of the most powerful healers in the Coalition. Her knowledge spans generations."
};

export const APPRENTICE_TWO_HAWKS: WorkshopNPC = {
  id: 'npc_apprentice_two_hawks',
  name: 'Two Hawks',
  role: 'assistant',
  title: 'Medicine Apprentice',
  description: 'Young man learning the medicine ways from White Cloud.',
  personality: 'Eager student. Respectful of tradition. Sometimes overwhelmed by spiritual teachings.',
  faction: 'nahi',
  dialogue: {
    greeting: [
      "Greetings. White Cloud is preparing medicine.",
      "Welcome, friend. How may I serve?",
      "*smiles* Come, learn with me."
    ],
    idle: [
      "*sorts herbs carefully*",
      "White Cloud says I must learn to listen better.",
      "*practices grinding herbs*",
      "So much to learn. So much to understand."
    ],
    farewell: [
      "May you stay well.",
      "Come back to learn more.",
      "Walk safely."
    ]
  },
  services: [],
  backstory: "Called to the medicine path by visions. Learning from White Cloud, though he finds the spiritual aspects challenging. Dedicated to mastering the craft."
};

export const GRANDMOTHER_EAGLE_SONG: WorkshopNPC = {
  id: 'npc_grandmother_eagle_song',
  name: 'Grandmother Eagle Song',
  role: 'trainer',
  title: 'Keeper of Spirit Springs',
  description: 'Ancient medicine woman said to be over a hundred years old. Guardian of the sacred healing springs.',
  personality: 'Timeless wisdom. Speaks rarely but profoundly. Radiates peace and power.',
  faction: 'nahi',
  dialogue: {
    greeting: [
      "*ancient eyes study you* The springs have been waiting for you.",
      "*speaks in the old tongue, then* Welcome, child of destiny.",
      "You seek healing. The waters know this."
    ],
    idle: [
      "*sits in meditation*",
      "*the air around her seems to shimmer*",
      "*hums songs older than memory*",
      "The springs have sung since the world was young."
    ],
    training: [
      "I will teach you what the springs teach me.",
      "*touches your forehead* Feel the healing flow through you.",
      "You have the gift. The spirits chose well.",
      "*smiles with eyes closed* You understand now."
    ],
    selling: [
      "The springs provide freely. Take what you need.",
      "Gold? The springs have no need of gold. But you may contribute to the people.",
      "All healing comes from the earth. We are merely vessels."
    ],
    farewell: [
      "May the springs bless your path.",
      "You carry healing now. Use it wisely.",
      "*blesses you silently*"
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Legendary Healing',
      description: 'The most powerful healing knowledge in the territory',
      cost: 0,
      trainableProfession: ProfessionId.ALCHEMY,
      requirements: [
        {
          type: 'reputation',
          value: 750,
          description: 'Must be greatly honored by Coalition'
        },
        {
          type: 'quest',
          value: 'pilgrimage_to_spirit_springs',
          description: 'Must complete sacred pilgrimage'
        }
      ]
    }
  ],
  backstory: "No one knows how old she truly is. Some say she was ancient when the first settlers came. Guardian of Spirit Springs and keeper of healing secrets that predate written history."
};

export const HEALER_RUNNING_STREAM: WorkshopNPC = {
  id: 'npc_healer_running_stream',
  name: 'Running Stream',
  role: 'assistant',
  title: 'Healer',
  description: "Skilled healer who tends to pilgrims visiting Spirit Springs.",
  personality: 'Gentle and compassionate. Dedicated to helping all who seek healing.',
  faction: 'nahi',
  dialogue: {
    greeting: [
      "Peace to you. Are you well?",
      "The springs welcome all who come in need.",
      "How may I help you on your healing journey?"
    ],
    idle: [
      "*tends to a patient with gentle hands*",
      "*draws water from the sacred spring*",
      "*prepares healing poultices*",
      "Healing takes time. Have patience."
    ],
    farewell: [
      "May you heal completely.",
      "The springs will always be here.",
      "Return if you need us."
    ]
  },
  services: [
    {
      type: 'sell',
      name: 'Spring Water Remedies',
      description: 'Medicines made with blessed spring water',
      cost: 0,
      availableItems: ['spring_water', 'healing_salves', 'blessed_bandages']
    }
  ],
  backstory: "Healed from a terrible illness by the springs as a child. Dedicated her life to helping others find the same healing. Studies under Grandmother Eagle Song."
};

// Longhorn Ranch NPCs

export const MASTER_TANNER_CRUZ: WorkshopNPC = {
  id: 'npc_master_tanner_cruz',
  name: 'Diego Cruz',
  role: 'trainer',
  title: 'Master Tanner',
  description: 'Third-generation tanner from Mexico. Runs the finest leather operation in the West.',
  personality: 'Proud craftsman. Demanding but fair. Passionate about quality.',
  faction: 'neutral',
  dialogue: {
    greeting: [
      "Welcome to the best tannery in three territories.",
      "You want to learn from the best? You came to the right place.",
      "Amigo! Ready to work some leather?"
    ],
    idle: [
      "*examines a hide critically*",
      "This cow lived well. Good hide.",
      "*works leather with expert hands*",
      "My abuelo taught me. His abuelo taught him. Generations of knowledge."
    ],
    training: [
      "I will teach you what my family has perfected over generations.",
      "Like this, see? Smooth, even strokes.",
      "Excelente! You have the touch!",
      "You honor the craft. I'm proud to teach you."
    ],
    selling: [
      "We process more hides than anywhere else. Best prices too.",
      "Quality leather, fair price. That's the Cruz way.",
      "Take a look at these beauties. Prime hides."
    ],
    farewell: [
      "Vaya con Dios, amigo!",
      "Good working with you!",
      "Come back anytime!"
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Master Leatherworking',
      description: 'Industrial-scale and master-level leather techniques',
      cost: 300,
      trainableProfession: ProfessionId.LEATHERWORKING,
      requirements: [
        {
          type: 'level',
          value: 40,
          description: 'Expert-level skill required'
        }
      ]
    },
    {
      type: 'sell',
      name: 'Premium Hides',
      description: 'Highest quality leather and hides',
      cost: 75,
      availableItems: ['premium_cowhide', 'exotic_leather', 'tanning_supplies', 'dyes']
    },
    {
      type: 'buy',
      name: 'Finished Leather Goods',
      description: 'Will purchase quality saddles, boots, and leather items',
      cost: 0
    }
  ],
  backstory: "Family has been in the leather business for three generations. Came north from Mexico and built the finest tannery operation in the territory. Pride of Longhorn Ranch."
};

export const HIDE_BUYER_JACKSON: WorkshopNPC = {
  id: 'npc_hide_buyer_jackson',
  name: 'Silas Jackson',
  role: 'merchant',
  title: 'Hide Buyer',
  description: 'Buys raw hides from hunters and ranchers for the tannery.',
  personality: 'Sharp businessman with a good eye. Fair but drives a hard bargain.',
  dialogue: {
    greeting: [
      "Got hides to sell? Let me see 'em.",
      "Quality hides fetch good prices here.",
      "Welcome! You hunting or buying?"
    ],
    idle: [
      "*examines hides for quality*",
      "This one's got damage. Can't pay full price.",
      "*tallies numbers in ledger*",
      "We process hundreds of hides a week."
    ],
    selling: [
      "These are raw hides, just brought in.",
      "Fresh from the range. Good stock.",
      "Fair prices, cash on the barrel."
    ],
    farewell: [
      "Bring me more good hides!",
      "Pleasure doing business!",
      "Come back with your next haul!"
    ]
  },
  services: [
    {
      type: 'buy',
      name: 'Raw Hide Purchase',
      description: 'Buys raw hides from hunters and traders',
      cost: 0
    },
    {
      type: 'sell',
      name: 'Unprocessed Hides',
      description: 'Raw hides for tanning',
      cost: 20,
      availableItems: ['raw_cowhide', 'buffalo_hide', 'deer_hide']
    }
  ],
  backstory: "Worked cattle drives before settling at Longhorn Ranch. Knows quality hides and pays fairly for them. Essential link between hunters and tannery."
};

export const SADDLE_MAKER_TOM: WorkshopNPC = {
  id: 'npc_saddle_maker_tom',
  name: 'Tom Bridger',
  role: 'trainer',
  title: 'Master Saddle Maker',
  description: 'Specialist in fine saddle work. His saddles are sought across the West.',
  personality: 'Quiet craftsman. Perfectionist with saddle work. Patient teacher.',
  dialogue: {
    greeting: [
      "Morning. You need a saddle or want to learn?",
      "Every saddle tells a story. What's yours?",
      "Welcome to my corner of the tannery."
    ],
    idle: [
      "*tooling leather with incredible detail*",
      "A good saddle will outlive the horse.",
      "*tests stitching strength*",
      "Comfort for the rider, protection for the horse."
    ],
    training: [
      "Saddle work is specialized. I'll show you the secrets.",
      "Feel how the leather should lay. That's the key.",
      "Fine work. Real fine. You're getting it.",
      "You could make a living at this. That's no small thing."
    ],
    selling: [
      "I've got leather scraps and saddle patterns.",
      "Good tools make good saddles. I sell both.",
      "Quality supplies for quality work."
    ],
    farewell: [
      "Happy trails.",
      "May your saddle always fit true.",
      "Come back and show me what you make."
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Saddle Making',
      description: 'Specialized saddle and tack crafting',
      cost: 150,
      trainableProfession: ProfessionId.LEATHERWORKING
    },
    {
      type: 'sell',
      name: 'Saddle Supplies',
      description: 'Tools and materials for saddle making',
      cost: 50,
      availableItems: ['saddle_leather', 'tooling_patterns', 'hardware', 'saddle_tools']
    }
  ],
  backstory: "Apprenticed to a famous saddle maker in Texas. Came to Longhorn Ranch for steady work and good leather. His saddles are prized possessions."
};

export const COOKIE_MCCORMICK: WorkshopNPC = {
  id: 'npc_cookie_mccormick',
  name: 'Cookie McCormick',
  role: 'trainer',
  title: 'Chuck Wagon Cook',
  description: "Legendary ranch cook who's fed thousands of cowboys over forty years.",
  personality: 'Gruff exterior, heart of gold. No-nonsense about food or work. Surprisingly good teacher.',
  dialogue: {
    greeting: [
      "You better be here to work, not jabber.",
      "*eyes you* Can you cook or just eat?",
      "Kitchen's hot. You ready to sweat?"
    ],
    idle: [
      "*stirs a massive pot of beans*",
      "Forty years I been cooking. Know what I learned? Keep it simple, keep it good.",
      "*chops onions without tears*",
      "Feed 'em well, they'll work well."
    ],
    training: [
      "I'll teach you ranch cooking. No fancy stuff, just good food in quantity.",
      "Timing! That's the secret! Everything ready at once!",
      "Now you're cooking like a real chuck wagon cook!",
      "You could feed a crew. That's high praise from me."
    ],
    selling: [
      "Got beef. Got beans. Got coffee. What else you need?",
      "Ranch pantry prices. Can't beat 'em.",
      "Fresh from the ranch. Good stuff."
    ],
    farewell: [
      "Don't burn nothing.",
      "Come back if you can handle the heat.",
      "*nods approvingly* Not bad, kid."
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Ranch Cooking',
      description: 'Large-scale, practical frontier cooking',
      cost: 50,
      trainableProfession: ProfessionId.COOKING
    },
    {
      type: 'sell',
      name: 'Ranch Provisions',
      description: 'Basic but quality cooking ingredients',
      cost: 15,
      availableItems: ['beef', 'beans', 'coffee', 'flour', 'bacon']
    }
  ],
  backstory: "Forty years on the trail and in ranch kitchens. Fed countless cattle drives and ranch crews. Crusty exterior hides considerable skill and surprising kindness."
};

export const DISHWASHER_TIMMY: WorkshopNPC = {
  id: 'npc_dishwasher_timmy',
  name: 'Timmy',
  role: 'assistant',
  title: 'Kitchen Helper',
  description: "Young ranch hand who helps Cookie in the kitchen.",
  personality: 'Cheerful and helpful. Eager to please. Terrified of Cookie temper.',
  dialogue: {
    greeting: [
      "Hi! Cookie is in a good mood today. I think.",
      "Welcome! Need something from the kitchen?",
      "I am Timmy! I help Cookie!"
    ],
    idle: [
      "*washes dishes frantically*",
      "*tries to stay out of Cookie way*",
      "Cookie says I am getting better!",
      "*sneaks a biscuit when Cookie is not looking*"
    ],
    farewell: [
      "Come back anytime!",
      "Good luck!",
      "See you around!"
    ]
  },
  services: [],
  backstory: "Orphan taken in by the ranch. Works in the kitchen under Cookie's watchful eye. Learning to cook and growing up fast."
};

// Goldfinger's Mine NPC

export const BLACKSMITH_KLAUS: WorkshopNPC = {
  id: 'npc_blacksmith_klaus',
  name: 'Klaus Steinberg',
  role: 'trainer',
  title: 'Mine Blacksmith',
  description: 'German immigrant who keeps the mine equipment working. Skilled metallurgist.',
  personality: 'Methodical and precise. Strong work ethic. Fascinated by ore and metallurgy.',
  dialogue: {
    greeting: [
      "*German accent* Guten Tag. Vhat brings you to ze forge?",
      "Velcome! You vant to vork metal, ja?",
      "Ah! Another craftsman!"
    ],
    idle: [
      "*examines ore sample*",
      "Zis ore, it has interesting properties...",
      "*repairs mining equipment*",
      "Precision in everysing. Zat is ze key."
    ],
    training: [
      "I teach you proper metalvork. Germanic precision!",
      "No, no! Like ZIS! See ze difference?",
      "Ja! Gut! Very gut! You learn fast!",
      "You have ze gift for metalvork, my friend."
    ],
    selling: [
      "Fresh ore from ze mine. Very interesting samples.",
      "I haff tools, materials, everysing you need.",
      "Gut quality, fair price."
    ],
    farewell: [
      "Auf Wiedersehen!",
      "Gut luck vith your vork!",
      "Come back soon, ja?"
    ]
  },
  services: [
    {
      type: 'train',
      name: 'Industrial Blacksmithing',
      description: 'Heavy equipment and tool smithing',
      cost: 100,
      trainableProfession: ProfessionId.BLACKSMITHING
    },
    {
      type: 'sell',
      name: 'Raw Ore and Metals',
      description: 'Fresh ore from the mine',
      cost: 25,
      availableItems: ['iron_ore', 'copper_ore', 'silver_ore', 'coal', 'metal_scraps']
    }
  ],
  backstory: "Immigrated from Germany with mining expertise. Works at Goldfinger's keeping equipment functional. Fascinated by metallurgy and ore properties."
};

export const ORE_HAULER_BIG_MIKE: WorkshopNPC = {
  id: 'npc_ore_hauler_big_mike',
  name: 'Big Mike',
  role: 'merchant',
  title: 'Ore Hauler',
  description: 'Massive man who hauls ore from deep in the mine. Knows what comes out of the ground.',
  personality: 'Simple but good-hearted. Strong as an ox. Honest to a fault.',
  dialogue: {
    greeting: [
      "Hey there! Big Mike here!",
      "Need ore? I just brought up a load!",
      "Welcome to the mine!"
    ],
    idle: [
      "*wipes sweat* Hot work down there.",
      "*hefts a heavy ore sack easily*",
      "Klaus says this batch is good stuff.",
      "*drinks water from a large canteen*"
    ],
    selling: [
      "Fresh ore! Just hauled it up!",
      "Klaus checks everything. Only the good stuff.",
      "Fair prices for good ore!"
    ],
    farewell: [
      "Take care now!",
      "Come back soon!",
      "Happy smithing!"
    ]
  },
  services: [
    {
      type: 'sell',
      name: 'Fresh Mine Ore',
      description: 'Ore straight from the mine',
      cost: 20,
      availableItems: ['raw_ore', 'ore_samples']
    }
  ],
  backstory: "Worked the mines since he was big enough to swing a pick. Knows the mine better than anyone. Provides steady ore supply to the forge."
};

// Export all NPCs

export const ALL_WORKSHOP_NPCS: WorkshopNPC[] = [
  // Red Gulch (12 NPCs)
  HANK_IRONSIDE,
  JIMMY_APPRENTICE,
  SARAH_TANNER,
  OLD_PETE,
  DOC_HOLLIDAY,
  NURSE_MARIA,
  DUSTY_BARKEEP,
  CONSUELA_COOK,
  MRS_PATTERSON,
  EMILY_SEAMSTRESS,
  GUNSMITH_COLE,
  DEPUTY_JACKSON,
  // The Frontera (6 NPCs)
  RODRIGO_HERRERO,
  SILENT_MIGUEL,
  WIDOW_BLACKWOOD,
  SILENT_SERVANT,
  ONE_EYED_JACK,
  THE_TINKERER,
  // Fort Ashford (5 NPCs)
  SERGEANT_MCALLISTER,
  CORPORAL_HUGHES,
  QUARTERMASTER_JENKINS,
  SEAMSTRESS_MOLLY,
  MASTER_GUNSMITH_WYATT,
  LIEUTENANT_FIREARMS,
  // Whiskey Bend (5 NPCs)
  MADAME_DUBOIS,
  SEAMSTRESS_VIVIAN,
  MADAME_WU,
  ASSISTANT_MEI,
  CHEF_BEAUMONT,
  SOUS_CHEF_ANTONIO,
  // Coalition (6 NPCs)
  ELDER_STANDING_BEAR,
  GRAY_DOVE,
  MEDICINE_WOMAN_WHITE_CLOUD,
  APPRENTICE_TWO_HAWKS,
  GRANDMOTHER_EAGLE_SONG,
  HEALER_RUNNING_STREAM,
  // Longhorn Ranch (5 NPCs)
  MASTER_TANNER_CRUZ,
  HIDE_BUYER_JACKSON,
  SADDLE_MAKER_TOM,
  COOKIE_MCCORMICK,
  DISHWASHER_TIMMY,
  // Goldfinger's Mine (2 NPCs)
  BLACKSMITH_KLAUS,
  ORE_HAULER_BIG_MIKE
];

/**
 * Get NPC by ID
 */
export function getNPC(id: string): WorkshopNPC | undefined {
  return ALL_WORKSHOP_NPCS.find(npc => npc.id === id);
}

/**
 * Get NPCs by role
 */
export function getNPCsByRole(role: string): WorkshopNPC[] {
  return ALL_WORKSHOP_NPCS.filter(npc => npc.role === role);
}

/**
 * Get NPCs who can train a specific profession
 */
export function getTrainersByProfession(profession: ProfessionId): WorkshopNPC[] {
  return ALL_WORKSHOP_NPCS.filter(npc =>
    npc.services.some(service =>
      service.type === 'train' && service.trainableProfession === profession
    )
  );
}
