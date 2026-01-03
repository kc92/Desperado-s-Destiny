/**
 * Comprehensive NPC Database
 * Interactive NPCs with personalities, dialogues, and quests
 */

import { LocationNPC } from '@desperados/shared';

/**
 * ========================================
 * MERCHANTS & VENDORS
 * ========================================
 */

export const WHISKEY_BEND_BLACKSMITH: LocationNPC = {
  id: 'whiskey-bend-blacksmith',
  name: 'Magnus "Iron Fist" O\'Malley',
  title: 'Master Blacksmith',
  description: 'A burly Irish blacksmith with arms like tree trunks and a reputation for crafting the finest weapons in the territory. The constant ring of his hammer echoes through Whiskey Bend.',
  personality: 'Gruff but honorable. Respects hard work and straight shooters. Has no patience for cowards or cheats.',
  faction: 'settler',
  dialogue: [
    "Forge is hot. What do you want?", // Stranger (0-19)
    "I don't know you. Cash upfront.",
    "You break it, you buy it.",
    "Good steel don't come cheap.",
    "You've got an honest look. I can work with that.", // Acquaintance (20-39)
    "That piece you bought last week - holding up alright?",
    "Tell you what, I'll knock off a few dollars for a returning customer.",
    "You know quality when you see it. I appreciate that.", // Friend (40-59)
    "Between you and me, I've been working on something special.",
    "Your coin's always good here, friend.",
    "I've got some experimental designs. Want to test one out?",
    "You've earned my respect. That ain't easy.", // Trusted (60-79)
    "I'll let you in on a secret - there's a vein of pure steel ore up in the mountains.",
    "I can modify that weapon for you. Special rate.",
    "You're like family now. Let me show you my masterwork.", // Confidant (80-100)
    "I forged something that shouldn't exist. I need someone I trust to wield it.",
    "The guild back East wants me dead for what I know. Help me, and I'll share everything."
  ],
  quests: ['npc:blacksmith:rare-ore-retrieval', 'npc:blacksmith:guild-secrets', 'npc:blacksmith:masterwork-weapon'],
  isVendor: true,
  shopId: 'whiskey-bend-blacksmith-shop',
  defaultTrust: 0
};

export const TRAVELING_MEDICINE_WOMAN: LocationNPC = {
  id: 'traveling-medicine-woman',
  name: 'Dr. Eliza Blackwood',
  title: 'Frontier Physician',
  description: 'A sharp-eyed doctor from Boston who came West to escape her past. She carries a black medical bag and the weight of secrets. Her remedies work, but some say she knows too much about poison.',
  personality: 'Clinical and precise. Warms up slowly but fiercely loyal to those she trusts. Has seen death up close too many times.',
  faction: 'settler',
  dialogue: [
    "I treat injuries, not stupidity.", // Stranger (0-19)
    "That wound looks infected. You should see a doctor. Oh wait, you are.",
    "Payment first, treatment second.",
    "You're still alive. My work speaks for itself.", // Acquaintance (20-39)
    "You heal fast. Good constitution.",
    "I've seen you around. Try not to get shot quite so often.",
    "You know, you remind me of someone I used to know back East.", // Friend (40-59)
    "I left Boston to get away from the medical establishment. Out here, I can actually help people.",
    "I've got some... unconventional remedies that work better than the approved ones.",
    "Trust is a rare medicine. I'm glad I found some with you.", // Trusted (60-79)
    "I didn't just study healing in Boston. I studied other things too. Dangerous things.",
    "There's a reason I left my practice. I learned something I shouldn't have.",
    "You're the only one I trust with this - I can make more than medicine.", // Confidant (80-100)
    "I have access to substances that don't officially exist. Interested?",
    "The medical board wants me hanged. Help me disappear, and I'll teach you everything I know."
  ],
  quests: ['npc:medicine-woman:rare-herbs', 'npc:medicine-woman:boston-secret', 'npc:medicine-woman:miracle-cure'],
  isVendor: true,
  shopId: 'medicine-woman-shop',
  defaultTrust: 0
};

export const OLD_PROSPECTOR: LocationNPC = {
  id: 'old-prospector',
  name: 'Ezekiel "Dusty" Cooper',
  title: 'Gold Prospector',
  description: 'A weathered old-timer with wild gray hair and wilder stories. His clothes are perpetually dusty, and he smells like dirt and whiskey. His eyes light up when he talks about "the big one that got away."',
  personality: 'Eccentric and talkative. Lonely and desperate for company. Has genuine knowledge buried under layers of tall tales.',
  faction: 'settler',
  dialogue: [
    "Gold! It's all about the gold, boy!", // Stranger (0-19)
    "You got a pickaxe? No? Then why are you bothering me?",
    "I struck it rich three times! Lost it all four times!",
    "Sit down, I'll tell you about the time I outran a grizzly...", // Acquaintance (20-39)
    "You know, you're the first person to listen to my stories in months.",
    "There's gold in them hills. I can feel it in my bones!",
    "I like you. You don't treat me like a crazy old coot.", // Friend (40-59)
    "Most folks think I'm just a drunk with tall tales. But some of my stories are true.",
    "I've got maps. Real maps. Not the junk I sell to greenhorns.",
    "I found something up in the mountains. Something strange.", // Trusted (60-79)
    "There's a mine everyone thinks is played out. It ain't. I know where the real vein is.",
    "I'll show you the claim I've been hiding for 20 years. But you can't tell nobody.",
    "You're the son I never had. I want you to have my life's work.", // Confidant (80-100)
    "I didn't just find gold up there. I found something the conquistadors left behind.",
    "There's a reason they call it Blood Mountain. I'll show you."
  ],
  quests: ['npc:prospector:lost-claim', 'npc:prospector:conquistador-treasure', 'npc:prospector:blood-mountain'],
  isVendor: false,
  defaultTrust: 0
};

/**
 * ========================================
 * QUEST GIVERS & FACTION REPRESENTATIVES
 * ========================================
 */

export const KAIOWA_ELDER: LocationNPC = {
  id: 'kaiowa-elder',
  name: 'Soaring Eagle',
  title: 'Kaiowa Elder',
  description: 'An ancient warrior with braided white hair and piercing dark eyes that have seen generations come and go. His face is weathered like canyon stone, marked with traditional tattoos. He speaks slowly, weighing each word.',
  personality: 'Wise and patient. Slow to trust outsiders but respects those who honor the old ways. Protective of his people and their sacred lands.',
  faction: 'kaiowa',
  dialogue: [
    "The white man's road leads to dust.", // Stranger (0-19)
    "You do not belong here.",
    "Your people take. Ours protect.",
    "Actions speak louder than your words, stranger.", // Acquaintance (20-39)
    "You have shown respect. That is... unusual.",
    "Perhaps not all outsiders are blind to the spirits.",
    "You begin to understand. The land is not property - it is sacred.", // Friend (40-59)
    "I have seen many seasons. You are different from the others who came before.",
    "There is old blood in you. Not Kaiowa, but you understand the old ways.",
    "The spirits whisper your name. They say you walk two paths.", // Trusted (60-79)
    "I will teach you what the elders taught me, if you are willing to learn.",
    "There is a darkness coming. The skinwalkers grow bold. We need allies.",
    "You are one of us now. The Kaiowa do not forget their friends.", // Confidant (80-100)
    "I will share the secret of the Buffalo Dance. Very few outsiders have seen this.",
    "The sacred cave contains our ancestors' wisdom. You have earned the right to enter."
  ],
  quests: ['npc:kaiowa-elder:skinwalker-hunt', 'npc:kaiowa-elder:sacred-ritual', 'npc:kaiowa-elder:buffalo-dance'],
  isVendor: false,
  defaultTrust: 0
};

export const RAILROAD_FOREMAN: LocationNPC = {
  id: 'railroad-foreman',
  name: 'Thomas "Big Tom" McCready',
  title: 'Union Pacific Foreman',
  description: 'A massive man with shoulders like a bull and a voice that carries across the work site. His hands are calloused from years of railroad work, and he carries a timepiece that never stops ticking.',
  personality: 'Practical and results-oriented. Values hard work and punctuality. Has no love for the railroad company but needs the paycheck.',
  faction: 'railroad',
  dialogue: [
    "We're behind schedule. You working or walking?", // Stranger (0-19)
    "Railroad pays by the mile. You get paid by getting out of my way.",
    "Time is money, and you're wasting both.",
    "You pulled your weight today. Keep it up.", // Acquaintance (20-39)
    "The company doesn't care if we live or die, long as the rails keep moving west.",
    "You ever swing a hammer? We could use someone with a strong back.",
    "You're alright. Most drifters don't last a week out here.", // Friend (40-59)
    "Between you and me, this railroad is cursed. Three men died last month.",
    "The suits back East don't care about the Kaiowa land we're cutting through. But I do.",
    "There's sabotage happening. Someone's trying to stop this railroad.", // Trusted (60-79)
    "I need someone I can trust to investigate the accidents. The company won't.",
    "I've got a family back in Chicago. This railroad is all that's keeping them fed.",
    "You're the only one I can tell - I'm planning to quit and blow the whistle on the company.", // Confidant (80-100)
    "I have evidence of what they're doing. Murder, fraud, land theft. Help me expose them.",
    "There's a fortune in payroll coming through next week. The company owes us three months back pay. Interested?"
  ],
  quests: ['npc:railroad-foreman:sabotage-investigation', 'npc:railroad-foreman:company-corruption', 'npc:railroad-foreman:payroll-heist'],
  isVendor: false,
  defaultTrust: 0
};

export const CHINESE_MERCHANT: LocationNPC = {
  id: 'frontera-merchant',
  name: 'Wei Zhang',
  title: 'Merchant of La Frontera',
  description: 'A dignified merchant in traditional silk robes with a queue braid down his back. His shop smells of incense, tea, and exotic spices. He speaks perfect English with a slight accent and seems to know everything that happens in La Frontera.',
  personality: 'Polite and formal. Extremely shrewd in business. Protective of the Chinese community and suspicious of outsiders.',
  faction: 'frontera',
  dialogue: [
    "Welcome, honored customer. Please, look but do not touch.", // Stranger (0-19)
    "All prices are final. No haggling.",
    "You are new to La Frontera. Be respectful, or leave.",
    "I see you return. This is good for business.", // Acquaintance (20-39)
    "Perhaps we can discuss... flexible pricing.",
    "You show respect for our ways. This is appreciated.",
    "You are becoming known in La Frontera. That is not always safe.", // Friend (40-59)
    "The railroad wants our land. We will not give it easily.",
    "There are items I do not display openly. For trusted customers only.",
    "You have earned the community's trust. That means something here.", // Trusted (60-79)
    "We have ways of protecting ourselves. Ancient ways, brought from the old country.",
    "The tongs are not just merchants. We are family. We protect our own.",
    "I will speak plainly now - we need allies. The railroad brings danger.", // Confidant (80-100)
    "There is a secret society within La Frontera. I can introduce you, if you are worthy.",
    "My family guards something precious. An artifact from the emperor himself. I need your help protecting it."
  ],
  quests: ['npc:frontera-merchant:railroad-conflict', 'npc:frontera-merchant:tong-alliance', 'npc:frontera-merchant:imperial-artifact'],
  isVendor: true,
  shopId: 'frontera-merchant-shop',
  defaultTrust: 0
};

/**
 * ========================================
 * MYSTERIOUS FIGURES & INFORMANTS
 * ========================================
 */

export const SALOON_SINGER: LocationNPC = {
  id: 'saloon-singer',
  name: 'Scarlett Rose',
  title: 'Songbird',
  description: 'A beautiful woman with auburn hair and a voice like honey and smoke. She performs every night at the saloon, and men empty their pockets just to hear her sing. But her eyes are always watching, always calculating.',
  personality: 'Charming and manipulative when needed, but genuinely lonely. Uses her beauty and talent as weapons and shields. Wants something money cannot buy.',
  faction: undefined,
  dialogue: [
    "Buy me a drink, handsome?", // Stranger (0-19)
    "I sing for tips, not for free.",
    "Every man in here thinks he's special. You're not.",
    "You're a better listener than most.", // Acquaintance (20-39)
    "I came out West to escape someone. Never ask me who.",
    "You ever hear a secret you wish you could forget?",
    "You keep coming back. I'm starting to wonder why.", // Friend (40-59)
    "Most men see a pretty face. You see a person. Thank you for that.",
    "I hear everything from this stage. Secrets, lies, confessions.",
    "There's a reason I work here. Information is more valuable than gold.", // Trusted (60-79)
    "I sell secrets to the highest bidder. But I'd never sell yours.",
    "The sheriff visits me every Thursday. He talks in his sleep.",
    "I know who you really are. And I'll keep your secret if you keep mine.", // Confidant (80-100)
    "I'm not just a singer. I work for people you've never heard of. Powerful people.",
    "There's going to be a war. I can make sure you're on the winning side."
  ],
  quests: ['npc:saloon-singer:information-network', 'npc:saloon-singer:secret-identity', 'npc:saloon-singer:coming-war'],
  isVendor: false,
  defaultTrust: 0
};

export const GRAVE_DIGGER: LocationNPC = {
  id: 'grave-digger',
  name: 'Mortimer Graves',
  title: 'Undertaker',
  description: 'A gaunt man in a perpetually dusty black suit who smells faintly of formaldehyde and earth. His fingers are long and pale, permanently stained with graveyard dirt. He speaks in a soft, measured tone that makes people uncomfortable.',
  personality: 'Morbid and philosophical. Fascinated by death. Surprisingly compassionate beneath the creepy exterior. Knows more about the town\'s dark history than anyone.',
  faction: 'settler',
  dialogue: [
    "Death comes for us all. Sooner for some.", // Stranger (0-19)
    "I'll see you again. They always come back to me.",
    "Casket or cremation?",
    "You've seen more death than most. I can tell.", // Acquaintance (20-39)
    "The dead don't lie. Unlike the living.",
    "I buried three men yesterday. All 'accidents.' How curious.",
    "You're not afraid of me. Most are.", // Friend (40-59)
    "I know every unmarked grave in this cemetery. Want to know whose?",
    "Sometimes the dead... aren't quiet. Not here.",
    "This ground is cursed. Has been since before the town existed.", // Trusted (60-79)
    "I've seen things rise from these graves. Things that shouldn't walk.",
    "There's a tomb at the edge of the cemetery. It's older than the town. Much older.",
    "You're one of the few I trust with the truth about this place.", // Confidant (80-100)
    "I'm not just the undertaker. I'm the guardian. I keep what's buried... buried.",
    "Something ancient is waking up beneath this town. I need your help stopping it."
  ],
  quests: ['npc:grave-digger:restless-dead', 'npc:grave-digger:ancient-tomb', 'npc:grave-digger:awakening-horror'],
  isVendor: false,
  defaultTrust: 0
};

export const OUTLAW_INFORMANT: LocationNPC = {
  id: 'outlaw-informant',
  name: 'Jesse "Whisper" Quinn',
  title: 'Information Broker',
  description: 'A nondescript person who blends into crowds like smoke. Wears common clothes, keeps their hat low, and has a talent for being exactly where they need to be. Some say they work for the Pinkertons. Others say they work for the outlaws. Both might be right.',
  personality: 'Paranoid and cautious. Trusts no one fully. Addicted to secrets and information. Will betray almost anyone - but never someone who holds their true loyalty.',
  faction: undefined,
  dialogue: [
    "Don't look at me. Don't talk to me in public.", // Stranger (0-19)
    "I don't know you. Keep walking.",
    "Information costs. You can't afford me.",
    "Meet me at midnight. Behind the stable. Come alone.", // Acquaintance (20-39)
    "I heard about you. You've been busy.",
    "I know three things about everyone in this town. About you, I know five.",
    "You're getting a reputation. That's dangerous.", // Friend (40-59)
    "The law is looking for someone matching your description. Might want to lay low.",
    "I have a network across three territories. Eyes and ears everywhere.",
    "I'm going to trust you with something. Don't make me regret it.", // Trusted (60-79)
    "There's a bounty hunter coming for you. Name's Black Jack. He's never failed. Never.",
    "I can make information disappear. Records, witnesses, evidence. All of it.",
    "You're the closest thing I have to a friend. I didn't think that was possible.", // Confidant (80-100)
    "I work for the Pinkertons. And the outlaws. And the railroad. I play all sides.",
    "There's a conspiracy that goes to the top. The governor himself. I have proof. Help me expose it."
  ],
  quests: ['npc:outlaw-informant:bounty-hunter-warning', 'npc:outlaw-informant:triple-agent', 'npc:outlaw-informant:governor-conspiracy'],
  isVendor: false,
  defaultTrust: 0
};

/**
 * ========================================
 * SERVICE PROVIDERS & SPECIALISTS
 * ========================================
 */

export const HORSE_TRADER: LocationNPC = {
  id: 'horse-trader',
  name: 'Buck Sullivan',
  title: 'Horse Trader',
  description: 'A wiry man with sun-darkened skin and hands gentled by years of working with horses. He has a gift for knowing exactly what a horse is thinking, and people say he can break any wild mustang in three days.',
  personality: 'Calm and patient like the horses he works with. Soft-spoken but firm. Loves animals more than people, but respects those who treat horses right.',
  faction: 'settler',
  dialogue: [
    "That's a fine animal you got there. Treat her right.", // Stranger (0-19)
    "You want a horse? I got horses. Good ones cost good money.",
    "I can tell how a man treats his horse. Says everything about his character.",
    "You take care of your mount. I respect that.", // Acquaintance (20-39)
    "Not many folks understand horses like you do.",
    "I've got a mare in the back that nobody can ride. You interested in trying?",
    "You're good with horses. Real good. You learn that somewhere?", // Friend (40-59)
    "I've been trading horses for thirty years. I know quality when I see it - in horses and people.",
    "There's wild mustangs up in the canyon. Best bloodlines in the territory. Want to help me catch some?",
    "You've got the gift, like me. Horses trust you.", // Trusted (60-79)
    "I know where the legendary Appaloosa herd runs. No one else knows the location.",
    "I raised a colt from birth. Fastest horse I've ever seen. He's yours, if you want him.",
    "You're family now. Let me teach you everything I know.", // Confidant (80-100)
    "There's a horse that ain't natural. Pale as death, fast as wind. I seen it twice. We could track it together.",
    "The Comanche used to have sacred horses. I know where they hid the last ones. Let's find them."
  ],
  quests: ['npc:horse-trader:wild-mustang-round-up', 'npc:horse-trader:legendary-appaloosa', 'npc:horse-trader:pale-horse'],
  isVendor: true,
  shopId: 'horse-trader-shop',
  defaultTrust: 0
};

export const WILDERNESS_GUIDE: LocationNPC = {
  id: 'wilderness-guide',
  name: 'Sarah "Two-Tracks" McKenna',
  title: 'Frontier Scout',
  description: 'A lean woman in buckskin and fur, with sun-bleached hair kept in a long braid. She moves through the wilderness like she was born there, leaving barely a trace. A Sharps rifle never leaves her side.',
  personality: 'Independent and practical. Quiet until she gets to know you. Has more respect for nature than civilization. Haunted by something in her past.',
  faction: 'settler',
  dialogue: [
    "Watch your step. Rattlers.", // Stranger (0-19)
    "You look lost. That's because you are.",
    "The wilderness doesn't care about you. Remember that.",
    "You're learning. Slowly.", // Acquaintance (20-39)
    "Most greenhorns are dead within a month. You might survive.",
    "There's tracks here. Mountain lion. Fresh. We should move.",
    "You've got good instincts for the wild.", // Friend (40-59)
    "I grew up in these mountains. My pa was a trapper. Taught me everything.",
    "I can show you places no map has ever seen. Hidden valleys. Secret springs.",
    "I trust you enough to watch my back. That's rare.", // Trusted (60-79)
    "There's something wrong in the deep wilderness. Animals acting strange. Tracks I don't recognize.",
    "I saw something out there. Something that shouldn't exist. I need someone to believe me.",
    "You're the partner I always needed. The wilderness is less lonely with you.", // Confidant (80-100)
    "My pa disappeared in the mountains ten years ago. I found his trail. Help me find out what happened.",
    "There's a creature out there. Old timer's call it the Wendigo. I've seen its kills. We need to stop it."
  ],
  quests: ['npc:wilderness-guide:strange-tracks', 'npc:wilderness-guide:fathers-fate', 'npc:wilderness-guide:wendigo-hunt'],
  isVendor: false,
  defaultTrust: 0
};

/**
 * Skill Academy Mentors
 */
export * from './academy-mentors';
import { ACADEMY_MENTORS } from './academy-mentors';

/**
 * All interactive NPCs
 */
export const ALL_NPCS: LocationNPC[] = [
  WHISKEY_BEND_BLACKSMITH,
  TRAVELING_MEDICINE_WOMAN,
  OLD_PROSPECTOR,
  KAIOWA_ELDER,
  RAILROAD_FOREMAN,
  CHINESE_MERCHANT,
  SALOON_SINGER,
  GRAVE_DIGGER,
  OUTLAW_INFORMANT,
  HORSE_TRADER,
  WILDERNESS_GUIDE,
  ...ACADEMY_MENTORS,
];

/**
 * Get NPCs by faction
 */
export function getNPCsByFaction(faction: string): LocationNPC[] {
  return ALL_NPCS.filter(npc => npc.faction === faction);
}

/**
 * Get vendor NPCs
 */
export function getVendorNPCs(): LocationNPC[] {
  return ALL_NPCS.filter(npc => npc.isVendor);
}

/**
 * Get NPCs with quests
 */
export function getQuestNPCs(): LocationNPC[] {
  return ALL_NPCS.filter(npc => npc.quests && npc.quests.length > 0);
}
