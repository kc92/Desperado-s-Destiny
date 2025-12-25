/**
 * Legends of the West - Phase 19.5 Quests
 * 30 quests covering L36-45 content pack
 *
 * Quest Categories:
 * - Universal Main Arc (10 quests): From grounded legends to cosmic horror
 * - Ghost Town Exploration (8 quests): 4 major towns with 2 quests each
 * - Artifact Hunting (4 quests): Collection system introduction
 * - Legendary Bounty Chains (6 quests): Multi-phase bounty hunts
 * - Reputation Prestige (2 quests): Ultimate Marshal/Outlaw questlines
 *
 * Supernatural Progression:
 * - L36-38: Grounded realism with hints (theatrical tricks, rumors)
 * - L39-42: Real supernatural (curses, ghosts, spirits)
 * - L43-45: Cosmic horror (Wendigo, ancient evil, dark pacts)
 *
 * Design Philosophy:
 * - Historical Western legends as boss fights
 * - Ghost towns as explorable dungeons
 * - Faction representatives as AI allies
 * - Optional unity mechanic for pack boss
 */

import { QuestSeedData } from '../../models/Quest.model';

// =============================================================================
// UNIVERSAL MAIN ARC - LEGENDS AWAKEN (L36-45)
// Core storyline following supernatural progression
// =============================================================================

// --- GROUNDED PHASE (L36-38): Legends might be real... ---

export const LEGENDS_WHISPERS_BEGIN: QuestSeedData = {
  questId: 'legends:whispers-begin',
  name: 'Whispers of the West',
  description:
    `Strange stories circulate through the territory. A prospector swears he saw Billy the Kid ` +
    `alive and well in a ghost town. A Nahi elder speaks of spirits walking. A railroad worker ` +
    `claims to have heard Judge Roy Bean passing sentence... from beyond the grave. ` +
    `The Legendary Bounty Board in Tombstone has reopened for the first time in decades.`,
  type: 'main',
  levelRequired: 36,
  prerequisites: ['territory:heart-of-territory'],
  objectives: [
    {
      id: 'gather-rumors',
      description: 'Gather rumors and bounty notices about legendary figures',
      type: 'collect',
      target: 'item:legendary-rumor',
      required: 3 // Reduced from 6 (3 rumors + 3 notices)
    },
    {
      id: 'visit-bounty-board',
      description: 'Visit the Legendary Bounty Board in Tombstone',
      type: 'visit',
      target: 'location:tombstone-bounty-board',
      required: 1
    },
    {
      id: 'speak-sheriff',
      description: 'Speak with the Tombstone Sheriff about the legends',
      type: 'visit',
      target: 'npc:tombstone-sheriff',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2500 },
    { type: 'dollars', amount: 1200 },
    { type: 'item', itemId: 'ghost-hunter-kit' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"You won't believe what I saw in Prosperity. The mine's been abandoned for thirty years, ` +
    `but I swear... there were lights. Movement. And in the dust, I found THIS." ` +
    `The prospector shows you an ancient revolver, still oiled, still loaded. ` +
    `"That's the kind of gun they made before the war. Someone's using it."`,
  dialogueComplete:
    `The Legendary Bounty Board lists names that should be dead. Billy the Kid, shot by Pat Garrett ` +
    `in '81. Judge Roy Bean, died in '03. The Tombstone Gunslingers, buried at Boot Hill. ` +
    `Yet here they are, with active bounties. Someone - or something - is bringing them back.`
};

export const LEGENDS_BILLYS_TRAIL: QuestSeedData = {
  questId: 'legends:billys-trail',
  name: 'The Kid\'s Trail',
  description:
    `The bounty on "Billy the Kid" leads to Dusty Creek, a ghost town abandoned after a ` +
    `bank robbery. Witnesses describe a young man matching Billy's description - quick smile, ` +
    `quicker draw, and an uncanny ability to vanish into thin air. Is he really alive? ` +
    `Is he a copycat? Or something else entirely?`,
  type: 'main',
  levelRequired: 37,
  prerequisites: ['legends:whispers-begin'],
  objectives: [
    {
      id: 'travel-dusty-creek',
      description: 'Travel to Dusty Creek ghost town',
      type: 'visit',
      target: 'location:dusty-creek',
      required: 1
    },
    {
      id: 'investigate-sightings',
      description: 'Investigate Billy the Kid sightings',
      type: 'collect',
      target: 'item:witness-testimony',
      required: 3 // Reduced from 5
    },
    {
      id: 'discover-truth',
      description: 'Locate hideout and uncover evidence about Billy\'s true nature',
      type: 'collect',
      target: 'item:billy-evidence',
      required: 2 // Reduced from 3, consolidated with hideout visit
    }
  ],
  rewards: [
    { type: 'xp', amount: 2700 },
    { type: 'dollars', amount: 1300 },
    { type: 'reputation', faction: 'settler', amount: 20 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `A weathered cowhand approaches. "Saw him clear as day. Young fella, gap-toothed grin, ` +
    `fast hands. Called himself 'The Kid.' But here's the thing - bullets went right through him. ` +
    `Or maybe he's just that fast. Either way, he's in Dusty Creek. Been there a week now, ` +
    `and anyone who tries to collect the bounty... well, they don't come back."`,
  dialogueComplete:
    `You've tracked Billy to an old saloon in Dusty Creek. The evidence is contradictory: ` +
    `footprints that appear and vanish, bullet holes in walls but no bodies, and photographs ` +
    `that show a young man who hasn't aged a day since 1881. Ghost or man, he's waiting for you.`
};

export const LEGENDS_THE_KID_RETURNS: QuestSeedData = {
  questId: 'legends:the-kid-returns',
  name: 'The Kid Returns',
  description:
    `Billy the Kid waits in the saloon, cards spread before him. His reputation precedes him - ` +
    `fastest draw in the West, they said, before Pat Garrett shot him. But here he is, ` +
    `young as ever, with that same easy smile. Is he a ghost? A trickster using smoke and mirrors? ` +
    `Only one way to find out. This is the confrontation phase.`,
  type: 'main',
  levelRequired: 38,
  prerequisites: ['legends:billys-trail'],
  objectives: [
    {
      id: 'confront-billy',
      description: 'Enter the saloon and confront Billy the Kid',
      type: 'visit',
      target: 'npc:billy-the-kid',
      required: 1 // Consolidated: enter + face
    },
    {
      id: 'defeat-billy',
      description: 'Defeat Billy the Kid in combat',
      type: 'kill',
      target: 'boss:boss_billy_the_kid',
      required: 1
    },
    {
      id: 'discover-secret',
      description: 'Discover the truth behind Billy\'s return',
      type: 'collect',
      target: 'item:billys-secret',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 3200 },
    { type: 'dollars', amount: 2000 },
    { type: 'item', itemId: 'billys-colt' },
    { type: 'item', itemId: 'kids-bandana' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Billy looks up from his cards as you enter. "Well now, another bounty hunter. They keep coming. ` +
    `Pat Garrett thought he killed me in '81. But here's the thing about legends, partner - ` +
    `they don't stay dead. Question is, are you faster than him? Because I've had forty years ` +
    `to practice."`,
  dialogueComplete:
    `The smoke clears. Billy lies still - or does he? His body seems to flicker, like heat shimmer ` +
    `off desert sand. Was he a ghost made manifest? A master illusionist? Or something stranger? ` +
    `His weapons remain: cold steel that feels older than it should. Something stirs in the territory - ` +
    `word of a hanging judge whose court never adjourns. Billy was just the beginning.`
};

// --- TRANSITIONAL PHASE (L39-41): The supernatural is real ---

export const LEGENDS_THE_HANGING_TREE: QuestSeedData = {
  questId: 'legends:the-hanging-tree',
  name: 'The Hanging Tree',
  description:
    `Judge Roy Bean was known as "The Law West of the Pecos" - a hanging judge who dealt ` +
    `death from his saloon-courthouse. He died in 1903, but travelers near Langtry report ` +
    `seeing his ghost: presiding over midnight trials, passing sentences on the living. ` +
    `The investigation leads to his old courthouse... and the tree where he hanged his victims.`,
  type: 'main',
  levelRequired: 39,
  prerequisites: ['legends:the-kid-returns'],
  objectives: [
    {
      id: 'travel-langtry',
      description: 'Travel to Langtry, Texas - Judge Bean\'s territory',
      type: 'visit',
      target: 'location:langtry-ruins',
      required: 1
    },
    {
      id: 'investigate-trials',
      description: 'Investigate reports of ghost trials',
      type: 'visit',
      target: 'npc:midnight-witness',
      required: 4
    },
    {
      id: 'find-courthouse',
      description: 'Locate the Jersey Lilly - Bean\'s courthouse saloon',
      type: 'visit',
      target: 'location:jersey-lilly',
      required: 1
    },
    {
      id: 'examine-tree',
      description: 'Examine the Hanging Tree',
      type: 'visit',
      target: 'location:hanging-tree',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2900 },
    { type: 'dollars', amount: 1500 },
    { type: 'item', itemId: 'spirit-ward-talisman' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `A terrified traveler stumbles into camp. "I was passing through Langtry at midnight. ` +
    `The old courthouse was LIT UP. I heard a gavel. A voice declaring 'GUILTY!' ` +
    `And then... God help me... I saw them march a man to the tree. I ran before they saw me. ` +
    `But I swear the judge was dead. Been dead twenty years!"`,
  dialogueComplete:
    `The Jersey Lilly stands as it did in Bean's day - bottles behind the bar, law books on the bench. ` +
    `But at night, spectral light fills the windows. The Hanging Tree outside bears fresh rope marks. ` +
    `Judge Bean's curse is real, and he's still passing sentence. Only way to stop him ` +
    `is to face his court directly.`
};

export const LEGENDS_SENTENCE_PASSED: QuestSeedData = {
  questId: 'legends:sentence-passed',
  name: 'Sentence Passed',
  description:
    `At midnight, Judge Roy Bean holds court. His ghost jury sits in silent judgment. ` +
    `His spectral bailiffs guard the doors. And his noose waits on the Hanging Tree. ` +
    `To end his curse, you must be tried in his court... and prove your innocence ` +
    `through combat.`,
  type: 'main',
  levelRequired: 40,
  prerequisites: ['legends:the-hanging-tree'],
  objectives: [
    {
      id: 'wait-midnight',
      description: 'Enter the Jersey Lilly at midnight',
      type: 'visit',
      target: 'location:jersey-lilly-midnight',
      required: 1
    },
    {
      id: 'face-trial',
      description: 'Stand trial before Judge Bean',
      type: 'visit',
      target: 'npc:judge-bean-ghost',
      required: 1
    },
    {
      id: 'defeat-judge',
      description: 'Defeat Judge Roy Bean\'s Curse',
      type: 'kill',
      target: 'boss:boss_judge_roy_bean',
      required: 1
    },
    {
      id: 'free-souls',
      description: 'Free the souls of Bean\'s victims',
      type: 'collect',
      target: 'item:freed-soul',
      required: 6 // Reduced from 12
    }
  ],
  rewards: [
    { type: 'xp', amount: 3500 },
    { type: 'dollars', amount: 2200 },
    { type: 'item', itemId: 'judges-gavel' },
    { type: 'item', itemId: 'courtroom-coat' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `As the clock strikes midnight, the Jersey Lilly transforms. Ghostly light floods the room. ` +
    `Judge Bean materializes behind his bench, gavel in hand, law book before him. ` +
    `"COURT IS NOW IN SESSION! You stand accused of TRESPASSING, DISTURBING THE PEACE, ` +
    `and DEFYING THE LAW WEST OF THE PECOS! How do you plead?"`,
  dialogueComplete:
    `Judge Bean's gavel falls silent at last. His curse is broken. Around the Hanging Tree, ` +
    `spectral figures rise - his victims finally free. One tips his hat to you before fading away. ` +
    `Strange reports filter in from Tombstone - disturbances at the O.K. Corral, gunshots at midnight.`
};

export const LEGENDS_TOMBSTONE_CALLING: QuestSeedData = {
  questId: 'legends:tombstone-calling',
  name: 'Tombstone Calling',
  description:
    `With Billy and Bean dealt with, you're drawn to Tombstone itself - the town too tough to die. ` +
    `But something has awakened in Boot Hill cemetery. The ghosts of the O.K. Corral shootout ` +
    `walk again: Wyatt Earp, Doc Holliday, the Clantons... all locked in eternal conflict. ` +
    `And they're drawing the living into their war.`,
  type: 'main',
  levelRequired: 41,
  prerequisites: ['legends:sentence-passed'],
  objectives: [
    {
      id: 'travel-tombstone',
      description: 'Travel to Tombstone, Arizona',
      type: 'visit',
      target: 'location:tombstone',
      required: 1
    },
    {
      id: 'investigate-hauntings',
      description: 'Investigate the spirit sightings',
      type: 'visit',
      target: 'npc:tombstone-resident',
      required: 3 // Reduced from 5
    },
    {
      id: 'track-specter',
      description: 'Visit Boot Hill and track the Specter to its source',
      type: 'collect',
      target: 'item:spirit-trace',
      required: 3 // Reduced from 5, consolidated with boot-hill visit
    }
  ],
  rewards: [
    { type: 'xp', amount: 3100 },
    { type: 'dollars', amount: 1800 },
    { type: 'reputation', faction: 'settler', amount: 25 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"Tombstone's always been haunted," the bartender says. "But this is different. Every night now, ` +
    `you can hear gunshots from the O.K. Corral. See figures walking from Boot Hill. ` +
    `And folks who go investigating... they come back different. Or they don't come back at all. ` +
    `Something's gathering the dead, partner. Something powerful."`,
  dialogueComplete:
    `Boot Hill's graves are disturbed - not dug up, but... opened from within. The spirits of ` +
    `Tombstone's violent past have coalesced into something greater: the Tombstone Specter, ` +
    `an amalgamation of rage, revenge, and unfinished business. It waits at the O.K. Corral, ` +
    `replaying the gunfight for eternity.`
};

// --- SUPERNATURAL PHASE (L42-43): Full ghost/spirit encounters ---

export const LEGENDS_GHOSTS_OF_TOMBSTONE: QuestSeedData = {
  questId: 'legends:ghosts-of-tombstone',
  name: 'Ghosts of Tombstone',
  description:
    `The Tombstone Specter awaits at the O.K. Corral - not a single ghost, but a fusion of ` +
    `every violent soul who died in Tombstone's bloody history. Wyatt Earp, Doc Holliday, ` +
    `the Clantons, and dozens more, all merged into one terrible entity. To put them to rest, ` +
    `you must end the eternal gunfight once and for all.`,
  type: 'main',
  levelRequired: 42,
  prerequisites: ['legends:tombstone-calling'],
  objectives: [
    {
      id: 'confront-specter',
      description: 'Enter the O.K. Corral and confront the Tombstone Specter',
      type: 'visit',
      target: 'npc:tombstone-specter',
      required: 1 // Consolidated: enter + face
    },
    {
      id: 'defeat-specter',
      description: 'Defeat the Tombstone Specter',
      type: 'kill',
      target: 'boss:boss_tombstone_specter',
      required: 1
    }
    // REMOVED: collect-artifacts (repetitive post-boss padding)
  ],
  rewards: [
    { type: 'xp', amount: 4000 },
    { type: 'dollars', amount: 2500 },
    { type: 'item', itemId: 'tombstone-revolver' },
    { type: 'item', itemId: 'spirit-spurs' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The O.K. Corral materializes from mist. Spectral figures emerge: men in dusters, badges gleaming, ` +
    `guns drawn. The Specter speaks with a hundred voices: "THE FIGHT NEVER ENDED. THE DEBT WAS ` +
    `NEVER PAID. NOW YOU'LL JOIN US... FOREVER TRAPPED IN THE GUNFIGHT THAT NEVER ENDS."`,
  dialogueComplete:
    `The Tombstone Specter shatters into a hundred souls, finally at peace. As they fade, ` +
    `one figure remains - Doc Holliday's shade. "I'm your huckleberry," he whispers. ` +
    `His last words linger: "Something stirs in the mountains. Cold. Hungry. It's been waiting." ` +
    `He vanishes. The supernatural dead are conquered. But something ancient has noticed you.`
};

export const LEGENDS_THE_OLD_HUNGER: QuestSeedData = {
  questId: 'legends:the-old-hunger',
  name: 'The Old Hunger',
  description:
    `The Nahi Coalition sends urgent word: something ancient has awakened in the northern mountains. ` +
    `They call it the Old Hunger - a Wendigo spirit of endless starvation and cold death. ` +
    `Hunters go missing. Entire camps vanish. And those who survive speak of a creature that ` +
    `was once human... and wants to make you the same.`,
  type: 'main',
  levelRequired: 43,
  prerequisites: ['legends:ghosts-of-tombstone'],
  objectives: [
    {
      id: 'meet-nahi-elders',
      description: 'Meet with the Nahi Coalition elders',
      type: 'visit',
      target: 'npc:kaiowa-spirit-keeper',
      required: 1
    },
    {
      id: 'investigate-disappearances',
      description: 'Investigate the hunting camp disappearances',
      type: 'visit',
      target: 'location:abandoned-hunting-camp',
      required: 3
    },
    {
      id: 'find-survivor',
      description: 'Find a survivor who witnessed the Wendigo',
      type: 'visit',
      target: 'npc:wendigo-survivor',
      required: 1
    },
    {
      id: 'track-wendigo',
      description: 'Track the Wendigo to its lair',
      type: 'collect',
      target: 'item:wendigo-track',
      required: 5 // Reduced from 8
    }
  ],
  rewards: [
    { type: 'xp', amount: 3600 },
    { type: 'dollars', amount: 2000 },
    { type: 'reputation', faction: 'nahi', amount: 35 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The Kaiowa elder's face is grave. "The Old Hunger walks again. We thought it bound, sleeping ` +
    `in the frozen peaks. But the spirits are restless - your battles have disturbed the balance. ` +
    `The Wendigo feeds on fear and flesh. It was human once, a trapper who ate his companions ` +
    `to survive. Now it is something else. And it is hunting."`,
  dialogueComplete:
    `You've tracked the Wendigo to an ice-choked cave in the mountains. The survivors' descriptions ` +
    `don't prepare you for what you find: gnawed bones, frozen bodies, and claw marks on stone. ` +
    `The creature is inside. You can hear it breathing - a sound like winter wind through dead trees. ` +
    `This is no ghost. This is cosmic horror made flesh.`
};

// --- COSMIC HORROR PHASE (L44-45): Ancient evil, world-ending stakes ---

export const LEGENDS_WINTER_ETERNAL: QuestSeedData = {
  questId: 'legends:winter-eternal',
  name: 'Winter Eternal',
  description:
    `The Wendigo Spirit waits in its lair of ice and bone. This is no ordinary monster - ` +
    `it's a force of primal hunger, older than human memory. The Nahi warn that killing it ` +
    `might not be enough; its hunger could possess you instead. The faction representatives ` +
    `offer their aid. You may need it.`,
  type: 'main',
  levelRequired: 44,
  prerequisites: ['legends:the-old-hunger'],
  objectives: [
    {
      id: 'gather-allies',
      description: 'Request faction representative aid',
      type: 'visit',
      target: 'npc:faction-representative',
      required: 1,
      optional: true, // Phase 19.5: Clearly marked as optional
      optionalBenefit: '+1 AI ally in boss fight to help manage cold stacks'
    },
    {
      id: 'prepare-ritual',
      description: 'Prepare the Nahi binding ritual components',
      type: 'collect',
      target: 'item:binding-component',
      required: 5
    },
    {
      id: 'enter-lair',
      description: 'Enter the Wendigo\'s lair',
      type: 'visit',
      target: 'location:wendigo-lair',
      required: 1
    },
    {
      id: 'defeat-wendigo',
      description: 'Defeat the Wendigo Spirit',
      type: 'kill',
      target: 'boss:boss_wendigo_spirit',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 4500 },
    { type: 'dollars', amount: 3000 },
    { type: 'item', itemId: 'wendigo-claws' },
    { type: 'reputation', faction: 'nahi', amount: 40 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Two Ravens, the Nahi representative, meets you at the cave mouth. "I will fight beside you. ` +
    `But understand: the Wendigo cannot truly die. We can only bind it, weaken it, push it back ` +
    `to sleep. When we enter that cave, we face not just a monster, but the concept of hunger itself. ` +
    `Are you ready to stare into endless winter?"`,
  dialogueComplete:
    `The Wendigo is bound - not destroyed, but weakened enough to sleep again. As the ice recedes ` +
    `and warmth returns, Two Ravens performs the sealing ritual. But in the creature's death throes, ` +
    `it revealed something: it was SUMMONED. By someone seeking to awaken even older powers. ` +
    `The trail leads to Mission San Muerte... and the Conquistador's tomb.`
};

export const LEGENDS_THE_CONQUISTADORS_RETURN: QuestSeedData = {
  questId: 'legends:the-conquistadors-return',
  name: 'The Conquistador\'s Return',
  description:
    `All paths converge at Mission San Muerte - the site of the First Evil. A Spanish conquistador, ` +
    `desperate for gold, made a pact with darkness in 1542. He was buried here, but his malevolence ` +
    `has been awakening the other legends. Now he rises to fulfill his ancient bargain: ` +
    `to drown the frontier in blood and claim dominion over all souls.`,
  type: 'main',
  levelRequired: 45,
  prerequisites: ['legends:winter-eternal'],
  objectives: [
    {
      id: 'unite-factions',
      description: 'Rally faction support for the final assault',
      type: 'visit',
      target: 'npc:faction-council',
      required: 1,
      optional: true, // Phase 19.5: Clearly marked as optional
      optionalBenefit: 'Standard difficulty vs Very Hard (solo faction: +50% boss stats)'
    },
    {
      id: 'enter-mission',
      description: 'Enter Mission San Muerte',
      type: 'visit',
      target: 'location:mission-san-muerte',
      required: 1
    },
    {
      id: 'descend-crypt',
      description: 'Descend into the Conquistador\'s Crypt',
      type: 'visit',
      target: 'location:conquistador-crypt',
      required: 1
    },
    {
      id: 'defeat-conquistador',
      description: 'Defeat the Conquistador and break his dark pact',
      type: 'kill',
      target: 'boss:boss_conquistador_return',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 6000 },
    { type: 'dollars', amount: 5000 },
    { type: 'item', itemId: 'conquistadors-armor' },
    { type: 'item', itemId: 'ancient-blade' },
    { type: 'reputation', faction: 'settler', amount: 30 },
    { type: 'reputation', faction: 'nahi', amount: 30 },
    { type: 'reputation', faction: 'frontera', amount: 30 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The three faction representatives stand with you at the mission gates. Iron Martha checks her rifle. ` +
    `Two Ravens communes with her ancestors. El Diablo lights a cigar with shaking hands. ` +
    `"Whatever's in there," Martha says, "it's been pulling strings for centuries. Billy, the Judge, ` +
    `the Specter, the Wendigo - all just appetizers. We end this tonight."`,
  dialogueComplete:
    `The Conquistador falls, his ancient pact shattered. As his undead army crumbles to dust, ` +
    `the mission begins to collapse. You escape as golden light floods the ruins - the corrupted gold ` +
    `finally purified after five centuries. The legends of the West can rest now. ` +
    `And you? You've become a legend yourself. One they'll tell stories about for generations.`
};

// =============================================================================
// GHOST TOWN EXPLORATION - MAJOR TOWNS (2 quests each)
// Deep content with unique mechanics
// =============================================================================

// --- PROSPERITY (L36-37): Mine collapse disaster theme ---

export const GHOST_TOWN_PROSPERITY_DEPTHS: QuestSeedData = {
  questId: 'ghost-town:prosperity-depths',
  name: 'Into the Depths of Prosperity',
  description:
    `The ghost town of Prosperity was once the richest mining town in the territory - ` +
    `until the mine collapsed in 1878, killing three hundred miners. Now something stirs ` +
    `in the abandoned shafts. Lights flicker. Tools move on their own. And miners' ghosts ` +
    `still work their endless shift.`,
  type: 'side',
  levelRequired: 36,
  prerequisites: ['legends:whispers-begin'],
  objectives: [
    {
      id: 'enter-prosperity',
      description: 'Enter Prosperity ghost town',
      type: 'visit',
      target: 'location:prosperity-entrance',
      required: 1
    },
    {
      id: 'explore-surface',
      description: 'Explore the surface buildings (company office and barracks)',
      type: 'visit',
      target: 'location:prosperity-surface',
      required: 2 // Reduced from 4 - focused on key locations
    },
    {
      id: 'find-mine-entrance',
      description: 'Find the sealed mine entrance',
      type: 'visit',
      target: 'location:prosperity-mine-entrance',
      required: 1
    },
    {
      id: 'gather-supplies',
      description: 'Gather supplies for mine descent',
      type: 'collect',
      target: 'item:mining-supply',
      required: 3 // Reduced from 5 - lantern, rope, canary cage
    }
  ],
  rewards: [
    { type: 'xp', amount: 2400 },
    { type: 'dollars', amount: 1100 },
    { type: 'item', itemId: 'prosperity-miners-helmet' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `A mining company foreman meets you outside Prosperity. "I lost my grandfather in that collapse. ` +
    `His ghost still walks those tunnels - I've seen him. The company wants to reopen the mine, ` +
    `but nothing will work right. Equipment fails. Crews panic. Something down there doesn't want ` +
    `the living digging too deep."`,
  dialogueComplete:
    `You've mapped Prosperity's surface and found the mine entrance - sealed with chains ` +
    `and covered in warnings. But you've also seen what others have: ghostly lights in the shafts, ` +
    `the sound of picks on stone, spectral miners walking their eternal routes. ` +
    `Whatever happened in 1878, the dead remember.`
};

export const GHOST_TOWN_PROSPERITY_SURVIVORS: QuestSeedData = {
  questId: 'ghost-town:prosperity-survivors',
  name: 'The Prosperity Survivors',
  description:
    `Deep in the Prosperity mine, the ghost of Foreman Blackwood commands his spectral crew. ` +
    `Unlike the other ghosts, he's aggressive - attacking anyone who enters his domain. ` +
    `But the evidence reveals a darker truth: Blackwood was covering up the mining company's ` +
    `negligence, not his own crime. He died trying to protect the workers from the owners' greed.`,
  type: 'side',
  levelRequired: 37,
  prerequisites: ['ghost-town:prosperity-depths'],
  objectives: [
    {
      id: 'descend-mine',
      description: 'Descend into the Prosperity Mine',
      type: 'visit',
      target: 'location:prosperity-mine-depths',
      required: 1
    },
    {
      id: 'manage-oxygen',
      description: 'Navigate through bad air sections',
      type: 'collect',
      target: 'item:air-pocket',
      required: 3 // Reduced from 5 - tighter pacing
    },
    {
      id: 'find-truth',
      description: 'Find evidence revealing the true story',
      type: 'collect',
      target: 'item:blackwood-evidence',
      required: 2 // Reduced from 3 - company ledger + foreman's journal
    },
    {
      id: 'moral-choice',
      description: 'Decide Blackwood\'s fate: expose the truth, take the bribe, or let the dead rest',
      type: 'collect',
      target: 'item:foremans-legacy-choice',
      required: 1
    },
    {
      id: 'defeat-foreman',
      description: 'Confront the Mine Foreman Ghost',
      type: 'kill',
      target: 'boss:mini_mine_foreman_ghost',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2800 },
    { type: 'dollars', amount: 1400 },
    { type: 'item', itemId: 'dusty-creek-vault-key' }
  ],
  // Moral choice consequences:
  // - Expose the Truth: Peaceful ghost resolution, -30 Settler faction (7 days), "Whistleblower" title
  // - Take the Bribe: Fight ghost at full power, +5000 gold, +20 Settler faction
  // - Let Dead Rest: Fight ghost at 70% power, no faction change, standard loot
  specialFlags: {
    hasMoralChoice: true,
    moralChoiceId: 'foremans_legacy',
    choiceOptions: ['expose_truth', 'take_bribe', 'let_rest']
  },
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The mine breathes. You feel it as you descend - pockets of bad air where your lantern dims, ` +
    `sections where the ghosts are so thick you can barely move. And always, the sound of ` +
    `Foreman Blackwood's voice echoing: "GET BACK TO WORK! THE QUOTA MUST BE MET! ` +
    `NO ONE LEAVES UNTIL THE SILVER'S OUT!"`,
  dialogueComplete:
    `Blackwood's ghost dissipates with a scream. The evidence is clear: he sealed the escape tunnel ` +
    `to hide a silver theft, condemning three hundred men to suffocation. As his curse breaks, ` +
    `the trapped miners finally find peace. And in Blackwood's office, you find something else: ` +
    `a key to a vault in Dusty Creek - the stolen silver's hiding place.`
};

// --- DEADWOOD'S SHADOW (L38-39): Historical echo, gold corruption ---

export const GHOST_TOWN_DEADWOOD_SHADOW: QuestSeedData = {
  questId: 'ghost-town:deadwood-shadow',
  name: 'Deadwood\'s Shadow',
  description:
    `Deadwood's Shadow is a ghost town that mirrors the real Deadwood - but darker, twisted. ` +
    `Here, Wild Bill Hickok was never murdered; he won that poker game and went on to become ` +
    `a tyrant. His echo still rules from the saloon, and the gold he accumulated has a corrupting ` +
    `influence on anyone who touches it.`,
  type: 'side',
  levelRequired: 38,
  prerequisites: ['legends:the-kid-returns'],
  objectives: [
    {
      id: 'enter-shadow',
      description: 'Enter Deadwood\'s Shadow',
      type: 'visit',
      target: 'location:deadwood-shadow-entrance',
      required: 1
    },
    {
      id: 'investigate-history',
      description: 'Investigate the alternate history through shadow newspapers',
      type: 'collect',
      target: 'item:shadow-newspaper',
      required: 3 // Reduced from 4 - focused on key revelations
    },
    {
      id: 'resist-corruption',
      description: 'Resist gold corruption while exploring',
      type: 'collect',
      target: 'item:corruption-resistance',
      required: 2 // Reduced from 3 - willpower check + talisman
    },
    {
      id: 'find-wild-bill',
      description: 'Locate Wild Bill\'s echo',
      type: 'visit',
      target: 'location:shadow-saloon',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 3000 },
    { type: 'dollars', amount: 1600 },
    { type: 'item', itemId: 'deadwood-gold-nugget' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"Deadwood's Shadow ain't on any map," the old prospector says. "You find it when you're lost, ` +
    `when the trails twist wrong. It's Deadwood as it might have been - if Wild Bill had won. ` +
    `Don't take the gold. The gold takes YOU. I went in rich and came out... well, look at me. ` +
    `But there's treasures there that aren't cursed. If you're careful."`,
  dialogueComplete:
    `The Shadow Deadwood is worse than the stories. Everything is gold here - the buildings, the streets, ` +
    `even the people. Frozen in gilded poses, victims of Wild Bill's greed. His echo sits in the saloon, ` +
    `playing an eternal poker game with dead men. To break this curse, you'll need to beat him ` +
    `at his own game - and that means facing cards that were never meant to be dealt.`
};

export const GHOST_TOWN_DEADWOOD_TRUTH: QuestSeedData = {
  questId: 'ghost-town:deadwood-truth',
  name: 'Wild Bill\'s Wager',
  description:
    `Wild Bill's Echo runs an eternal poker game in the Shadow Deadwood saloon. His opponents ` +
    `are the frozen souls of those who challenged him and lost. Wild Bill can be freed by ` +
    `combat OR by beating him at poker - but winning poker means someone must take his place. ` +
    `The choice is yours: play the hand, destroy the echo, or walk away.`,
  type: 'side',
  levelRequired: 39,
  prerequisites: ['ghost-town:deadwood-shadow'],
  objectives: [
    {
      id: 'enter-saloon',
      description: 'Enter the Shadow Saloon',
      type: 'visit',
      target: 'location:shadow-saloon-interior',
      required: 1
    },
    {
      id: 'challenge-bill',
      description: 'Challenge Wild Bill\'s Echo',
      type: 'visit',
      target: 'npc:wild-bill-echo',
      required: 1
    },
    {
      id: 'choose-method',
      description: 'Choose your path: play the hand, destroy the echo, or walk away',
      type: 'collect',
      target: 'item:wild-bills-wager-choice',
      required: 1
    },
    {
      id: 'defeat-echo',
      description: 'Resolve Wild Bill\'s fate',
      type: 'kill',
      target: 'boss:mini_wild_bill_echo',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 3300 },
    { type: 'dollars', amount: 1900 },
    { type: 'item', itemId: 'docs-cards' }
  ],
  // Moral choice consequences:
  // - Play the Hand: Poker duel mechanic, Wild Bill becomes ancestor ally, "Dead Man's Hand" debuff (24h), gold purified
  // - Destroy the Echo: Standard combat, gold corruption NOT purified, "Touched by Gold" debuff on future visits
  // - Walk Away: -20% damage in ghost towns (7 days), 50% rewards, can return later
  specialFlags: {
    hasMoralChoice: true,
    moralChoiceId: 'wild_bills_wager',
    choiceOptions: ['play_hand', 'destroy_echo', 'walk_away']
  },
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Wild Bill's Echo looks up from his cards. His eyes are coins. "Another player? Good. ` +
    `These fools stopped being interesting decades ago." He gestures at the frozen gamblers. ` +
    `"The game is simple: five-card draw, winner takes all. All means your soul, by the way. ` +
    `But if you win - well, no one's ever won. Take a seat, friend."`,
  dialogueComplete:
    `Wild Bill's Echo shatters as you play your winning hand - a dead man's hand, aces and eights. ` +
    `The curse breaks. The golden figures thaw, finally dying after decades frozen. ` +
    `The Shadow Deadwood fades, becoming just another ghost town. But from the vault, ` +
    `you salvage Doc Holliday's own playing cards - uncorrupted, ready for use.`
};

// --- WRATH'S HOLLOW (L42-43): Massacre sin, guilty conscience ---

export const GHOST_TOWN_WRATHS_HOLLOW_ENTRY: QuestSeedData = {
  questId: 'ghost-town:wraths-hollow-entry',
  name: 'Entering Wrath\'s Hollow',
  description:
    `Wrath's Hollow was the site of a massacre in 1867 - a cavalry unit slaughtered an entire ` +
    `Nahi village, including women and children, then turned on each other in a frenzy of guilt ` +
    `and madness. The town was built over the site and abandoned within a year. ` +
    `Now, a spirit of vengeance hunts anyone who enters.`,
  type: 'side',
  levelRequired: 42,
  prerequisites: ['legends:ghosts-of-tombstone'],
  objectives: [
    {
      id: 'enter-hollow',
      description: 'Enter Wrath\'s Hollow',
      type: 'visit',
      target: 'location:wraths-hollow-entrance',
      required: 1
    },
    {
      id: 'manage-guilt',
      description: 'Manage your guilt meter while exploring',
      type: 'collect',
      target: 'item:guilt-absolution',
      required: 3 // Reduced from 4 - tighter pacing
    },
    {
      id: 'find-massacre-site',
      description: 'Find the original massacre site',
      type: 'visit',
      target: 'location:massacre-site',
      required: 1
    },
    {
      id: 'speak-victims',
      description: 'Speak with the spirits of the victims',
      type: 'visit',
      target: 'npc:massacre-spirits',
      required: 3 // Reduced from 5 - elder, child, warrior
    }
  ],
  rewards: [
    { type: 'xp', amount: 3800 },
    { type: 'dollars', amount: 2200 },
    { type: 'item', itemId: 'wraths-hollow-memento' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Two Ravens stops you at the town's edge. "This place is cursed with blood guilt. ` +
    `My ancestors died here. Their spirits don't rest - they HUNT. But there's one spirit ` +
    `more powerful than the others: The Avenger, born from collective rage. If you go in there, ` +
    `your own conscience will be your enemy. Every wrong you've ever done will surface."`,
  dialogueComplete:
    `The guilt is overwhelming in Wrath's Hollow. Every step brings visions of your own failures, ` +
    `amplified a hundredfold. But you've found the massacre site - a memorial hidden under ` +
    `the town's foundations. The victims' spirits aren't hostile; they're TRAPPED. ` +
    `Only The Avenger's defeat will free them.`
};

export const GHOST_TOWN_WRATHS_HOLLOW_RECKONING: QuestSeedData = {
  questId: 'ghost-town:wraths-hollow-reckoning',
  name: 'The Hollow\'s Reckoning',
  description:
    `The Avenger is the collective rage of every victim of the 1867 massacre. It takes the form ` +
    `of your greatest guilt - the person you wronged most in your life. To defeat it, you must ` +
    `face your own past. You can seek redemption through sacrifice, embrace destruction through ` +
    `force, or - if you're cunning enough - negotiate a trade with the spirits themselves.`,
  type: 'side',
  levelRequired: 43,
  prerequisites: ['ghost-town:wraths-hollow-entry'],
  objectives: [
    {
      id: 'face-past',
      description: 'Face your personalized guilt vision',
      type: 'visit',
      target: 'npc:guilt-vision',
      required: 1
    },
    {
      id: 'make-choice',
      description: 'Choose: redemption, destruction, or offer a trade',
      type: 'collect',
      target: 'item:avenger-choice',
      required: 1
    },
    {
      id: 'defeat-avenger',
      description: 'Resolve The Avenger\'s fate',
      type: 'kill',
      target: 'boss:mini_the_avenger',
      required: 1
    },
    {
      id: 'free-spirits',
      description: 'Perform the spirit freeing ritual',
      type: 'visit',
      target: 'location:spirit-altar',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 4200 },
    { type: 'dollars', amount: 2600 },
    { type: 'reputation', faction: 'nahi', amount: 30 }
  ],
  // Moral choice consequences (enhanced with third option):
  // - Seek Redemption: Sacrifice Epic+ item, fight at 50% power, +10% Nahi permanent, hidden treasure
  // - Embrace Destruction: Fight at full power + enrage, -15% Nahi, "Consumed by Rage" buff (+25% dmg, -10% def)
  // - Offer a Trade (NEW): Requires 50+ Cunning, starts hidden side quest, unique "Spirit Arbiter" title
  specialFlags: {
    hasMoralChoice: true,
    moralChoiceId: 'hollows_reckoning',
    choiceOptions: ['seek_redemption', 'embrace_destruction', 'offer_trade'],
    tradeRequiresCunning: 50
  },
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The Avenger manifests - and its face is familiar. It wears the features of someone from ` +
    `your past, someone you hurt. "REMEMBER ME?" it screams with a hundred voices. ` +
    `"REMEMBER WHAT YOU DID? YOU WANTED TO BE A LEGEND? LEGENDS ARE BUILT ON BONES. ` +
    `FACE YOUR SINS OR BE CONSUMED BY THEM!"`,
  dialogueComplete:
    `The Avenger falls silent. Whether through redemption or destruction, the curse is broken. ` +
    `The spirits of the massacre victims rise one final time - not in anger, but in peace. ` +
    `They nod to you before fading. Two Ravens performs the final blessing. ` +
    `Wrath's Hollow will never be inhabited again, but it's no longer a prison for the dead.`
};

// --- MISSION SAN MUERTE (L41, L44): Spanish colonial, pack boss location ---

export const GHOST_TOWN_SAN_MUERTE_APPROACH: QuestSeedData = {
  questId: 'ghost-town:san-muerte-approach',
  name: 'Approaching San Muerte',
  description:
    `Mission San Muerte - the Mission of Holy Death - was founded in 1542 by conquistadors ` +
    `seeking gold. The priests who built it were massacred within a year, allegedly by the ` +
    `very soldiers who accompanied them. Now the mission draws supernatural activity like ` +
    `a magnet. Something ancient sleeps in its crypt.`,
  type: 'side',
  levelRequired: 41,
  prerequisites: ['legends:tombstone-calling'],
  objectives: [
    {
      id: 'travel-mission',
      description: 'Travel to Mission San Muerte',
      type: 'visit',
      target: 'location:san-muerte-exterior',
      required: 1
    },
    {
      id: 'investigate-history',
      description: 'Investigate the mission\'s dark history',
      type: 'collect',
      target: 'item:mission-history',
      required: 3 // Reduced from 5 - priest's diary, soldier's confession, conquistador map
    },
    {
      id: 'meet-priest-ghost',
      description: 'Encounter the Undead Priest',
      type: 'visit',
      target: 'npc:undead-priest',
      required: 1
    },
    {
      id: 'find-crypt-entrance',
      description: 'Find the hidden entrance to the crypt',
      type: 'visit',
      target: 'location:crypt-entrance',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 3400 },
    { type: 'dollars', amount: 2000 },
    { type: 'item', itemId: 'san-muerte-rosary' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `El Diablo crosses himself as you approach the mission. "My grandmother warned me about ` +
    `this place. The priests who built it weren't seeking God - they were seeking gold. ` +
    `And they found something else. The conquistador who led them made a deal with the devil ` +
    `himself. When the priests objected, he killed them all. His body's in the crypt... waiting."`,
  dialogueComplete:
    `The mission exterior is hauntingly beautiful - crumbling adobe, ancient bells, faded frescoes. ` +
    `But the Undead Priest who guards the crypt entrance warns you: "The Conquistador sleeps below. ` +
    `For five centuries, his dark pact has kept him between life and death. If he wakes fully... ` +
    `God help us all. Come back when you're ready to face true evil."`
};

export const GHOST_TOWN_SAN_MUERTE_CRYPT: QuestSeedData = {
  questId: 'ghost-town:san-muerte-crypt',
  name: 'The Priest\'s Absolution',
  description:
    `Deep beneath Mission San Muerte lies the Conquistador's Crypt. Father Maldonado guards ` +
    `the entrance - but he was bound by the Conquistador against his will. The priest's soul ` +
    `yearns for freedom. You can grant him absolution, seal him forever in darkness, ` +
    `or destroy both priest and Conquistador with pure force.`,
  type: 'side',
  levelRequired: 44,
  prerequisites: ['legends:winter-eternal', 'ghost-town:san-muerte-approach'],
  objectives: [
    {
      id: 'prepare-assault',
      description: 'Prepare for the crypt assault',
      type: 'collect',
      target: 'item:crypt-preparation',
      required: 3 // Reduced from 5 - holy water, silver cross, sacred candles
    },
    {
      id: 'descend-crypt',
      description: 'Descend into the Conquistador\'s Crypt',
      type: 'visit',
      target: 'location:conquistador-crypt',
      required: 1
    },
    {
      id: 'priests-choice',
      description: 'Decide Father Maldonado\'s fate: absolution, seal, or destruction',
      type: 'collect',
      target: 'item:priests-absolution-choice',
      required: 1
    },
    {
      id: 'defeat-priest',
      description: 'Resolve the Undead Priest\'s fate',
      type: 'kill',
      target: 'boss:mini_undead_priest',
      required: 1
    },
    {
      id: 'reach-inner-sanctum',
      description: 'Reach the inner sanctum',
      type: 'visit',
      target: 'location:crypt-sanctum',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 4000 },
    { type: 'dollars', amount: 2400 },
    { type: 'item', itemId: 'mission-bell' }
  ],
  // Moral choice consequences:
  // - Grant Absolution: Use holy item, Priest becomes AI ally in final boss, +20% Divine damage, holy vendor
  // - Seal the Darkness: Priest trapped forever, final boss slightly easier, San Muerte inaccessible, unique accessory
  // - Destroy the Corrupted: Fight both Priest AND Conquistador at full power, max rewards, -10% all factions
  specialFlags: {
    hasMoralChoice: true,
    moralChoiceId: 'priests_absolution',
    choiceOptions: ['grant_absolution', 'seal_darkness', 'destroy_corrupted']
  },
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The Undead Priest blocks your path one final time. "You've come to end what began five centuries ` +
    `ago. I was one of the priests he killed - my punishment is to guard his tomb. ` +
    `I don't want to fight you. But the dark pact compels me. Defeat me, and the way opens. ` +
    `But beyond... beyond waits something far worse than me."`,
  dialogueComplete:
    `The Undead Priest falls, finally freed from his curse. The crypt opens before you - ` +
    `gold-lined walls, ancient Spanish armor, and at the center, a sarcophagus that radiates ` +
    `palpable evil. The Conquistador's Return awaits in the main questline. ` +
    `This exploration has prepared you for the final battle.`
};

// =============================================================================
// ARTIFACT HUNTING - COLLECTION SYSTEM INTRODUCTION
// =============================================================================

export const ARTIFACTS_OUTLAW_LEGENDS: QuestSeedData = {
  questId: 'artifacts:outlaw-legends',
  name: 'Relics of Outlaw Legends',
  description:
    `A collector in Tombstone seeks the personal effects of legendary outlaws. ` +
    `Billy the Kid's revolver. Jesse James' saddlebag. Doc Holliday's cards. ` +
    `These aren't just memorabilia - they carry echoes of their owners' power. ` +
    `Collect them, and that power becomes yours.`,
  type: 'side',
  levelRequired: 36,
  prerequisites: ['legends:whispers-begin'],
  objectives: [
    {
      id: 'meet-collector',
      description: 'Meet the artifact collector',
      type: 'visit',
      target: 'npc:artifact-collector',
      required: 1
    },
    {
      id: 'find-saddlebag',
      description: 'Find Jesse James\' Saddlebag',
      type: 'collect',
      target: 'item:jesses-saddlebag',
      required: 1
    },
    {
      id: 'verify-authenticity',
      description: 'Verify artifact authenticity',
      type: 'visit',
      target: 'npc:artifact-appraiser',
      required: 1
    },
    {
      id: 'learn-history',
      description: 'Learn the history behind the artifacts',
      type: 'collect',
      target: 'item:artifact-history',
      required: 2 // Reduced from 3 - key historical documents only
    }
  ],
  rewards: [
    { type: 'xp', amount: 2200 },
    { type: 'dollars', amount: 1000 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The collector adjusts his spectacles. "The artifacts of legendary outlaws aren't just historical ` +
    `curiosities. They're POWER. Billy's gun never missed. Jesse's saddlebag always had room for ` +
    `one more dollar. Doc's cards knew what you held. Find these relics, and you inherit ` +
    `a fraction of their legend."`,
  dialogueComplete:
    `You've begun your collection of outlaw relics. The saddlebag in your possession has ` +
    `an inexplicable weight - or lack thereof. It holds more than it should. ` +
    `The collector nods approvingly. "You feel it, don't you? The power of legend. ` +
    `There are more artifacts out there. Find them all, and become a legend yourself."`
};

export const ARTIFACTS_CURSED_COLLECTION: QuestSeedData = {
  questId: 'artifacts:cursed-collection',
  name: 'The Cursed Collection',
  description:
    `Not all artifacts are benevolent. The Noose that hanged outlaws still carries their deaths. ` +
    `The Forever-Loaded Gun never runs empty - but it demands blood. The collector warns you: ` +
    `these items grant great power, but at terrible cost. Still, power is power.`,
  type: 'side',
  levelRequired: 39,
  prerequisites: ['legends:the-hanging-tree'],
  objectives: [
    {
      id: 'research-curses',
      description: 'Research the cursed artifacts',
      type: 'collect',
      target: 'item:curse-research',
      required: 2 // Reduced from 4 - focused research
    },
    {
      id: 'find-noose',
      description: 'Find The Noose',
      type: 'collect',
      target: 'item:the-noose',
      required: 1
    },
    {
      id: 'find-gun',
      description: 'Find the Forever-Loaded Gun',
      type: 'collect',
      target: 'item:forever-loaded-gun',
      required: 1
    },
    {
      id: 'resist-corruption',
      description: 'Resist the artifacts\' corruption',
      type: 'collect',
      target: 'item:curse-resistance',
      required: 2 // Reduced from 3 - key willpower checks
    },
    {
      id: 'moral-choice',
      description: 'Decide: destroy the artifacts, keep them, or expose the collector',
      type: 'collect',
      target: 'item:cursed-collector-choice',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 3000 },
    { type: 'dollars', amount: 1600 }
  ],
  // Moral choice consequences:
  // - Destroy the Artifacts: Lose access to cursed item bonuses, +15 Nahi faction, "Curse Breaker" title
  // - Take for Yourself: Keep cursed items (powerful but risky), -10 Nahi, "Touched by Darkness" debuff on death
  // - Expose the Collector: Collector becomes enemy, bounty board access, +10 Settler (law enforcement)
  specialFlags: {
    hasMoralChoice: true,
    moralChoiceId: 'cursed_collector',
    choiceOptions: ['destroy_artifacts', 'take_for_self', 'expose_collector']
  },
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The collector's voice drops to a whisper. "There's a darker collection. Artifacts that ` +
    `shouldn't exist. The Noose from Bean's court - it can execute anyone instantly, but each use ` +
    `shortens your own life. The Forever-Loaded Gun never needs reloading, but it must kill ` +
    `at least once a day. Interested?"`,
  dialogueComplete:
    `You've obtained the cursed artifacts. They sit in your inventory, radiating wrongness. ` +
    `The Noose whispers the names of those it's killed. The Gun's weight shifts, eager. ` +
    `The collector looks uneasy. "These items choose their owners as much as the reverse. ` +
    `Be careful. Or don't. Either way, you're more powerful now."`
};

export const ARTIFACTS_SPIRIT_RELICS: QuestSeedData = {
  questId: 'artifacts:spirit-relics',
  name: 'Spirit Relics',
  description:
    `The Nahi Coalition guards artifacts of great spiritual power: totems, medicine bundles, ` +
    `and relics blessed by generations of shamans. Normally forbidden to outsiders, ` +
    `your actions against the supernatural have earned their trust. These items don't grant ` +
    `combat power - they grant understanding.`,
  type: 'side',
  levelRequired: 41,
  prerequisites: ['legends:tombstone-calling'],
  objectives: [
    {
      id: 'gain-trust',
      description: 'Gain the trust of the Nahi spirit keepers',
      type: 'collect',
      target: 'item:nahi-trust',
      required: 3 // Reduced from 5 - focused trust-building
    },
    {
      id: 'receive-totem',
      description: 'Receive a Spirit Totem',
      type: 'collect',
      target: 'item:spirit-totem',
      required: 1
    },
    {
      id: 'learn-use',
      description: 'Learn to use the spirit artifacts',
      type: 'visit',
      target: 'npc:spirit-teacher',
      required: 2 // Reduced from 3 - essence of training
    },
    {
      id: 'prove-worth',
      description: 'Prove your worth to the ancestor spirits',
      type: 'visit',
      target: 'location:ancestor-shrine',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 3200 },
    { type: 'dollars', amount: 1800 },
    { type: 'item', itemId: 'medicine-bundle' },
    { type: 'reputation', faction: 'nahi', amount: 25 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The Kaiowa spirit keeper studies you. "You've faced spirits and prevailed with honor. ` +
    `This is rare for an outsider. Our ancestors have noticed. They offer you gifts - ` +
    `not weapons, but SIGHT. The Spirit Totem lets you see what others cannot. ` +
    `The Medicine Bundle heals wounds of the soul. Do you accept this responsibility?"`,
  dialogueComplete:
    `The spirit relics settle into your possession with a warmth that surprises you. ` +
    `You can feel them working - heightening your perception, calming your mind. ` +
    `The spirit keeper nods. "The ancestors have accepted you. Use these gifts wisely. ` +
    `The final battle approaches, and you will need every advantage."`
};

export const ARTIFACTS_COLONIAL_CURSE: QuestSeedData = {
  questId: 'artifacts:colonial-curse',
  name: 'Colonial Curse',
  description:
    `The oldest artifacts in the territory come from the Spanish colonial era - ` +
    `conquistador relics, mission bells, and items touched by the First Evil. ` +
    `Collecting them prepares you for the final confrontation. But beware: ` +
    `these items have been corrupted by five centuries of darkness.`,
  type: 'side',
  levelRequired: 43,
  prerequisites: ['legends:the-old-hunger'],
  objectives: [
    {
      id: 'research-colonial',
      description: 'Research Spanish colonial artifacts',
      type: 'collect',
      target: 'item:colonial-research',
      required: 2 // Reduced from 4 - key colonial records
    },
    {
      id: 'find-medallion',
      description: 'Find the Conquistador Medallion',
      type: 'visit',
      target: 'location:medallion-site',
      required: 1
    },
    {
      id: 'find-bible',
      description: 'Find The First Bible',
      type: 'visit',
      target: 'location:bible-site',
      required: 1
    },
    {
      id: 'purify-items',
      description: 'Attempt to purify the corrupted items',
      type: 'collect',
      target: 'item:purification-ritual',
      required: 2
    }
  ],
  rewards: [
    { type: 'xp', amount: 3600 },
    { type: 'dollars', amount: 2200 },
    { type: 'item', itemId: 'the-first-bible' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `El Diablo produces an ancient map. "These are the conquistador sites - where they buried ` +
    `their cursed gold, where they made their dark bargains. The medallion was the captain's seal. ` +
    `The Bible was meant to protect them but got corrupted instead. If you're facing the ` +
    `Conquistador's Return, you need to understand what you're dealing with."`,
  dialogueComplete:
    `The colonial artifacts tell a story of greed and darkness. The Conquistador came seeking gold ` +
    `but found something older - a presence that offered power in exchange for souls. ` +
    `Five centuries later, that bargain comes due. Armed with these relics and their history, ` +
    `you're as prepared as you can be for the final confrontation.`
};

// =============================================================================
// LEGENDARY BOUNTY CHAINS - MULTI-PHASE HUNTS
// =============================================================================

export const BOUNTY_JESSE_JAMES_INVESTIGATION: QuestSeedData = {
  questId: 'bounty:jesse-james-investigation',
  name: 'The Jesse James Investigation',
  description:
    `Jesse James was shot by Bob Ford in 1882. Or was he? A bounty has appeared for a man ` +
    `matching his description, leading a new gang in the territory. This is the investigation phase - ` +
    `gather clues, follow leads, and determine if the most famous outlaw in American history ` +
    `somehow survived.`,
  type: 'side',
  levelRequired: 37,
  prerequisites: ['legends:billys-trail'],
  objectives: [
    {
      id: 'collect-testimonies',
      description: 'Collect witness testimonies',
      type: 'collect',
      target: 'item:jesse-testimony',
      required: 3 // Reduced from 6 - key witnesses only
    },
    {
      id: 'examine-evidence',
      description: 'Examine physical evidence',
      type: 'collect',
      target: 'item:jesse-evidence',
      required: 2 // Reduced from 4 - critical evidence
    },
    {
      id: 'identify-gang',
      description: 'Identify the new gang members',
      type: 'visit',
      target: 'npc:gang-informant',
      required: 3
    },
    {
      id: 'locate-hideout',
      description: 'Locate the gang\'s hideout',
      type: 'visit',
      target: 'location:jesse-gang-hideout',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2600 },
    { type: 'dollars', amount: 1300 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The bounty hunter guild master slides a wanted poster across the table. ` +
    `"Jesse Woodson James. Reward: $50,000. And before you say it - yes, I know he's 'dead.' ` +
    `I've seen the grave. But someone robbed three trains last month using his exact methods. ` +
    `Same gang structure. Same calling card. Either he's alive, or someone wants us to think so."`,
  dialogueComplete:
    `Your investigation is complete. The evidence is compelling: the man leading this gang ` +
    `knows things only Jesse James could know. He uses Jesse's tricks, visits Jesse's old haunts, ` +
    `and the gang members swear he's the real deal. Whether ghost, survivor, or masterful impostor, ` +
    `it's time for the confrontation phase.`
};

export const BOUNTY_JESSE_JAMES_CONFRONTATION: QuestSeedData = {
  questId: 'bounty:jesse-james-confrontation',
  name: 'Confronting Jesse James',
  description:
    `The investigation led to a canyon hideout where "Jesse James" awaits. ` +
    `This is the confrontation phase - face the man claiming to be America's most famous outlaw. ` +
    `Is he a ghost? A survivor who faked his death? Or something else entirely? ` +
    `Only one way to find out.`,
  type: 'side',
  levelRequired: 38,
  prerequisites: ['bounty:jesse-james-investigation'],
  objectives: [
    {
      id: 'enter-canyon',
      description: 'Enter the canyon hideout',
      type: 'visit',
      target: 'location:jesse-canyon',
      required: 1
    },
    {
      id: 'confront-jesse',
      description: 'Confront "Jesse James"',
      type: 'visit',
      target: 'npc:jesse-james-claimant',
      required: 1
    },
    {
      id: 'choice-path',
      description: 'Choose: bring to justice, join the ride, or fake his death',
      type: 'collect',
      target: 'item:jesse-choice',
      required: 1
    },
    {
      id: 'resolve-bounty',
      description: 'Resolve the bounty',
      type: 'collect',
      target: 'item:bounty-resolution',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 3100 },
    { type: 'dollars', amount: 2500 },
    { type: 'item', itemId: 'jesses-saddlebag' }
  ],
  // Moral choice consequences - "The Outlaw's Code":
  // - Bring to Justice: Combat at full power, +25 Settler, +500 bounty reward, "Lawman" reputation
  // - Join the Ride: Jesse teaches robbery skill, -30 Settler, +20 Frontera, unique gang invite
  // - Fake the Death (NEW): Requires 40+ Cunning, Jesse becomes informant contact, neutral faction, recurring gold income
  specialFlags: {
    hasMoralChoice: true,
    moralChoiceId: 'outlaws_code',
    choiceOptions: ['bring_to_justice', 'join_the_ride', 'fake_the_death'],
    fakeDeathRequiresCunning: 40,
    hasBossMechanic: true,
    bossMechanicId: 'deception_duel'
  },
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The man in the canyon tips his hat. He looks exactly like the photographs - ` +
    `older, yes, but unmistakably Jesse James. "Bounty hunter. Figured you'd come eventually. ` +
    `I've been dead thirty years, they say. But here I am. Now, we can do this the easy way ` +
    `or the hard way. Your choice."`,
  dialogueComplete:
    `The truth is revealed: this Jesse James is neither ghost nor impostor, but something between - ` +
    `a man who should have died but didn't quite, sustained by the power of his own legend. ` +
    `However you resolved the bounty, you've gained his saddlebag - and his grudging respect. ` +
    `"Tell them Jesse James is dead," he says. "Again."`
};

export const BOUNTY_DOC_HOLLIDAY_TRAIL: QuestSeedData = {
  questId: 'bounty:doc-holliday-trail',
  name: 'Doc Holliday\'s Trail',
  description:
    `Doc Holliday died of tuberculosis in 1887. Yet multiple witnesses report seeing a pale, ` +
    `coughing gambler who wins every hand and knows the future. Unlike other legendary bounties, ` +
    `Doc might be amenable to negotiation - he was always more pragmatic than violent. ` +
    `This tracking phase leads to the gambling halls he frequents.`,
  type: 'side',
  levelRequired: 40,
  prerequisites: ['legends:sentence-passed'],
  objectives: [
    {
      id: 'track-gambling',
      description: 'Track Doc through gambling halls',
      type: 'visit',
      target: 'location:gambling-hall',
      required: 4
    },
    {
      id: 'collect-winnings',
      description: 'Collect records of his impossible winnings',
      type: 'collect',
      target: 'item:doc-winnings-record',
      required: 2 // Reduced from 5 - key winning streaks
    },
    {
      id: 'find-pattern',
      description: 'Identify his gambling pattern',
      type: 'collect',
      target: 'item:doc-pattern',
      required: 2 // Reduced from 3 - pattern recognition
    },
    {
      id: 'locate-current',
      description: 'Locate his current game',
      type: 'visit',
      target: 'location:doc-current-game',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 3200 },
    { type: 'dollars', amount: 1900 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `A dealer whispers: "Doc Holliday's been through here. I know, I know - he's dead. ` +
    `But I saw him play cards until dawn. Never lost a hand. Coughing up blood the whole time. ` +
    `And when I asked for his name? He just smiled and said 'I'm your huckleberry.' ` +
    `If anyone could cheat death, it'd be Doc. He's in town. I'm sure of it."`,
  dialogueComplete:
    `You've tracked Doc Holliday to a high-stakes poker game in a private club. ` +
    `He knows you're watching - raised his glass to you once. The tracking phase is complete. ` +
    `Now comes the choice: confront him as a bounty, or try to make him an ally. ` +
    `Doc always did prefer a good conversation to a fight.`
};

export const BOUNTY_DOC_HOLLIDAY_CHOICE: QuestSeedData = {
  questId: 'bounty:doc-holliday-choice',
  name: 'Doc\'s Choice',
  description:
    `Doc Holliday sits at his poker table, pale as death, cards spread before him. ` +
    `Unlike the other legends, he seems... aware. Rational. He gestures for you to sit. ` +
    `"Let's talk," he says. "Or fight, if you prefer. Either way, I've seen how this ends. ` +
    `The question is: which ending do you want?"`,
  type: 'side',
  levelRequired: 41,
  prerequisites: ['bounty:doc-holliday-trail'],
  objectives: [
    {
      id: 'sit-with-doc',
      description: 'Sit at Doc\'s table',
      type: 'visit',
      target: 'npc:doc-holliday',
      required: 1
    },
    {
      id: 'play-hand',
      description: 'Play a hand of poker with Doc',
      type: 'collect',
      target: 'item:doc-poker-hand',
      required: 1
    },
    {
      id: 'make-choice',
      description: 'Choose: beat him at cards, fight to the death, or offer mercy',
      type: 'collect',
      target: 'item:doc-choice',
      required: 1
    },
    {
      id: 'resolve',
      description: 'Resolve Doc\'s fate',
      type: 'collect',
      target: 'item:doc-resolution',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 3500 },
    { type: 'dollars', amount: 2200 },
    { type: 'item', itemId: 'docs-cards' }
  ],
  // Moral choice consequences - "The Final Hand":
  // - Beat at Cards: Full poker duel mechanic (High Stakes Showdown), Doc's legendary deck item, +15 Frontera
  // - Fight to the Death: Standard combat, Doc's guns item, -10 reputation everywhere ("killed a dying man")
  // - Offer Mercy (NEW): Doc becomes ally NPC at saloons, free healing, +20 all factions ("mercy in the west")
  specialFlags: {
    hasMoralChoice: true,
    moralChoiceId: 'the_final_hand',
    choiceOptions: ['beat_at_cards', 'fight_to_death', 'offer_mercy'],
    hasBossMechanic: true,
    bossMechanicId: 'high_stakes_showdown'
  },
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Doc deals the cards without looking. "I know why you're here. The bounty. Fifty years dead ` +
    `and still worth killing. Flattering, really." He coughs - blood on his handkerchief. ` +
    `"But I've seen things since I died. Things coming. You'll need help. ` +
    `I'm offering. Or we can fight. Your play, friend."`,
  dialogueComplete:
    `However you chose, Doc accepts it with grace. If you fought, he fell with a smile - ` +
    `"This is funny," his last words. If you recruited him, he joins as an advisor, ` +
    `his knowledge of the supernatural invaluable. If you let him go, he leaves his cards ` +
    `as a gift. Either way, you've dealt with Doc Holliday - the original huckleberry.`
};

export const BOUNTY_NATIVE_RAIDER_HUNT: QuestSeedData = {
  questId: 'bounty:native-raider-hunt',
  name: 'Ghost Rider Hunt',
  description:
    `A spectral warrior has been attacking Settler convoys - riding a horse made of moonlight, ` +
    `striking without warning, vanishing into the desert. The Settlers call him the Ghost Rider. ` +
    `The Nahi call him the Last Warrior. He's not after gold or supplies - he's after revenge ` +
    `for atrocities committed decades ago.`,
  type: 'side',
  levelRequired: 42,
  prerequisites: ['legends:ghosts-of-tombstone'],
  objectives: [
    {
      id: 'investigate-attacks',
      description: 'Investigate the Ghost Rider attacks',
      type: 'visit',
      target: 'location:attack-site',
      required: 4
    },
    {
      id: 'learn-history',
      description: 'Learn the warrior\'s history',
      type: 'visit',
      target: 'npc:nahi-historian',
      required: 2
    },
    {
      id: 'track-spirit',
      description: 'Track the Ghost Rider',
      type: 'collect',
      target: 'item:ghost-rider-track',
      required: 3 // Reduced from 6 - key spirit traces
    },
    {
      id: 'find-burial',
      description: 'Find the warrior\'s original burial site',
      type: 'visit',
      target: 'location:warrior-burial',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 3700 },
    { type: 'dollars', amount: 2100 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The convoy master is shaking. "He came out of nowhere. Horse like smoke. Arrows that burned. ` +
    `We tried to shoot him but bullets went right through. He killed Jameson, Martinez, and Cole - ` +
    `the same three whose grandfathers were at Sand Creek. He KNEW. How could a ghost KNOW?"`,
  dialogueComplete:
    `The Ghost Rider's history is tragic: Rising Moon, a warrior whose village was massacred ` +
    `by the ancestors of his current victims. He died seeking revenge, and death didn't stop him. ` +
    `His burial site is disturbed - someone dug up his remains, preventing his spirit from resting. ` +
    `To end his rampage, you must either destroy him or help him find peace.`
};

export const BOUNTY_NATIVE_RAIDER_JUSTICE: QuestSeedData = {
  questId: 'bounty:native-raider-justice',
  name: 'Ghost Rider\'s Justice',
  description:
    `Rising Moon, the Ghost Rider, waits at his disturbed burial site. He's not a monster - ` +
    `he's a victim seeking justice for an atrocity the history books forgot. You have a choice: ` +
    `destroy him for the bounty, or help him find peace by recovering his remains ` +
    `and giving him a proper burial.`,
  type: 'side',
  levelRequired: 43,
  prerequisites: ['bounty:native-raider-hunt'],
  objectives: [
    {
      id: 'confront-spirit',
      description: 'Confront Rising Moon',
      type: 'visit',
      target: 'npc:ghost-rider',
      required: 1
    },
    {
      id: 'choose-path',
      description: 'Choose: grant peace, destroy spirit, or become the voice',
      type: 'collect',
      target: 'item:rider-choice',
      required: 1
    },
    {
      id: 'execute-choice',
      description: 'Execute your chosen path',
      type: 'collect',
      target: 'item:rider-execution',
      required: 1
    },
    {
      id: 'resolve-bounty',
      description: 'Resolve the Ghost Rider bounty',
      type: 'collect',
      target: 'item:rider-resolution',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 4100 },
    { type: 'dollars', amount: 2800 },
    { type: 'item', itemId: 'geronimos-bow' },
    { type: 'reputation', faction: 'nahi', amount: 35 }
  ],
  // Moral choice consequences - "The Wronged Spirit":
  // - Grant Peace: Spirit passes on peacefully, +35 Nahi, ancestral blessing buff, sacred ground unlocked
  // - Destroy Spirit: Combat at full power, haunted debuff (random encounters), standard loot
  // - Become the Voice (NEW): Requires 60+ Spirit, become the spirit's avatar, unique combat style, Nahi faction leader path
  specialFlags: {
    hasMoralChoice: true,
    moralChoiceId: 'wronged_spirit',
    choiceOptions: ['grant_peace', 'destroy_spirit', 'become_the_voice'],
    becomeVoiceRequiresSpirit: 60,
    hasBossMechanic: true,
    bossMechanicId: 'spirit_chase'
  },
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Rising Moon materializes before you, his spectral horse pawing the ground. ` +
    `"You've come to destroy me. Like they destroyed my people. Like they destroyed my body." ` +
    `His voice echoes with ancient grief. "But you're different. I've watched you. ` +
    `Will you help me rest? Or are you just another killer?"`,
  dialogueComplete:
    `Rising Moon's saga ends - one way or another. If you helped him, the Nahi honor you ` +
    `with Geronimo's bow, a weapon of legendary significance. If you destroyed him, ` +
    `you claim the bounty but earn the Nahi's cold silence. Either way, the Ghost Rider ` +
    `rides no more. But his story reminds you: even monsters were human once.`
};

// =============================================================================
// REPUTATION PRESTIGE - ULTIMATE TITLE QUESTS
// =============================================================================

export const PRESTIGE_THE_LAW: QuestSeedData = {
  questId: 'prestige:the-law',
  name: 'Becoming The Law',
  description:
    `Your reputation as a Marshal has reached its zenith. The territory speaks your name ` +
    `with reverence and fear. Now comes the ultimate test: the epilogue quest for Legendary Marshals. ` +
    `A criminal mastermind has united every outlaw gang against you personally. ` +
    `Survive the onslaught, and you'll earn the ultimate title: "The Law."`,
  type: 'side',
  levelRequired: 44,
  prerequisites: ['legends:winter-eternal'],
  // Note: Also requires Marshal reputation >= 80 (checked in-game)
  objectives: [
    {
      id: 'receive-challenge',
      description: 'Receive the outlaws\' challenge',
      type: 'visit',
      target: 'npc:outlaw-messenger',
      required: 1
    },
    {
      id: 'prepare-defense',
      description: 'Prepare for the gang alliance assault',
      type: 'collect',
      target: 'item:defense-preparation',
      required: 3 // Reduced from 5 - key preparations
    },
    {
      id: 'survive-waves',
      description: 'Survive 5 waves of elite outlaws (25 total encounters)',
      type: 'kill',
      target: 'npc:outlaw-wave-member',
      required: 25 // Reduced from 50, structured as 5 waves of 5
    },
    {
      id: 'defeat-mastermind',
      description: 'Defeat the criminal mastermind',
      type: 'kill',
      target: 'boss:criminal-mastermind',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 5000 },
    { type: 'dollars', amount: 4000 },
    { type: 'item', itemId: 'legendary-marshals-coat' }
  ],
  // Wave structure - "Marshal's Last Stand":
  // Wave 1: Cattle Rustlers (basic) - 5 encounters
  // Wave 2: Bank Robbers (medium) - 5 encounters
  // Wave 3: Train Bandits (hard) - 5 encounters
  // Wave 4: Gang Lieutenants (elite) - 5 encounters
  // Wave 5: Mastermind + 2 bodyguards (boss wave) - 5 encounters
  // Ally System: 80+ rep = 2 Deputies, 90+ rep = 3 Deputies + Marshal, 100 rep = Full posse (5 allies)
  specialFlags: {
    hasWaveSystem: true,
    waveCount: 5,
    encountersPerWave: 5,
    waveTypes: ['cattle_rustlers', 'bank_robbers', 'train_bandits', 'gang_lieutenants', 'mastermind_boss'],
    hasAllySystem: true,
    allyThresholds: { 80: 2, 90: 4, 100: 5 },
    allyFaction: 'settler'
  },
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `A bloodied messenger stumbles into town. "The gangs... they've united. All of them. ` +
    `The McCrays, the Bandit King's remnants, the Silver Baron's enforcers. They're coming for you. ` +
    `Said you've killed too many of theirs. Said it's time The Law learned what justice feels like ` +
    `from the other side."`,
  dialogueComplete:
    `The last outlaw falls. You stand alone in the aftermath, surrounded by the defeated alliance. ` +
    `The territorial governor himself arrives to recognize your achievement. "From this day forward," ` +
    `he declares, "you are THE LAW in this territory. What you say goes. The outlaws fear you, ` +
    `the citizens honor you. You've earned the highest title a Marshal can hold."`
};

export const PRESTIGE_THE_LEGEND: QuestSeedData = {
  questId: 'prestige:the-legend',
  name: 'Becoming The Legend',
  description:
    `Your notoriety as an outlaw has reached mythic proportions. Wanted posters can't keep up. ` +
    `The law has given up capturing you alive. Now comes the ultimate test: the epilogue quest ` +
    `for Notorious Outlaws. Every bounty hunter, Pinkerton, and lawman is coming for you. ` +
    `Survive them all, and you'll earn the ultimate title: "The Legend."`,
  type: 'side',
  levelRequired: 44,
  prerequisites: ['legends:winter-eternal'],
  // Note: Also requires Outlaw reputation <= -80 (checked in-game)
  objectives: [
    {
      id: 'see-bounty',
      description: 'See your legendary bounty posted',
      type: 'visit',
      target: 'location:legendary-wanted-poster',
      required: 1
    },
    {
      id: 'prepare-escape',
      description: 'Prepare escape routes and hideouts',
      type: 'collect',
      target: 'item:escape-preparation',
      required: 3 // Reduced from 5 - key preparations
    },
    {
      id: 'survive-hunters',
      description: 'Survive 5 waves of bounty hunters (25 total encounters)',
      type: 'kill',
      target: 'npc:bounty-hunter-elite',
      required: 25 // Equalized with The Law (was 30), structured as 5 waves of 5
    },
    {
      id: 'defeat-pinkerton',
      description: 'Defeat the Pinkerton commander',
      type: 'kill',
      target: 'boss:pinkerton-commander',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 5000 },
    { type: 'dollars', amount: 4000 },
    { type: 'item', itemId: 'notorious-outlaws-hat' }
  ],
  // Wave structure - "Outlaw's Exodus":
  // Wave 1: Local Deputies (basic) - 5 encounters
  // Wave 2: State Rangers (medium) - 5 encounters
  // Wave 3: Pinkerton Agents (hard) - 5 encounters
  // Wave 4: Marshal Strike Team (elite) - 5 encounters
  // Wave 5: Pinkerton Commander + elite squad (boss wave) - 5 encounters
  // Ally System: 80+ rep = 2 Gang members, 90+ rep = 3 Gang + Outlaw, 100 rep = Full gang (5 allies)
  specialFlags: {
    hasWaveSystem: true,
    waveCount: 5,
    encountersPerWave: 5,
    waveTypes: ['local_deputies', 'state_rangers', 'pinkerton_agents', 'marshal_strike_team', 'pinkerton_commander_boss'],
    hasAllySystem: true,
    allyThresholds: { 80: 2, 90: 4, 100: 5 },
    allyFaction: 'frontera'
  },
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The wanted poster shows your face with a bounty that makes your eyes water. ` +
    `Underneath, it reads: "DEAD. ONLY DEAD. NO REWARD FOR CAPTURE." A fellow outlaw laughs. ` +
    `"You've done it now. Every gun-for-hire west of the Mississippi is coming. ` +
    `The Pinkertons are sending their best. Survive this, and you're not just an outlaw. ` +
    `You're THE LEGEND."`,
  dialogueComplete:
    `The Pinkerton commander falls. The bounty hunters have fled or died. You stand alone, ` +
    `uncaptured, unbowed, unconquered. The newspapers will write about this for decades. ` +
    `Children will whisper your name around campfires. Outlaws will invoke you as their patron saint. ` +
    `You've transcended mere notoriety. You ARE the legend they'll tell stories about ` +
    `for a hundred years.`
};

// =============================================================================
// EXPORT ALL QUESTS
// =============================================================================

export const LEGENDS_OF_WEST_QUESTS: QuestSeedData[] = [
  // Universal Main Arc (10 quests)
  LEGENDS_WHISPERS_BEGIN,
  LEGENDS_BILLYS_TRAIL,
  LEGENDS_THE_KID_RETURNS,
  LEGENDS_THE_HANGING_TREE,
  LEGENDS_SENTENCE_PASSED,
  LEGENDS_TOMBSTONE_CALLING,
  LEGENDS_GHOSTS_OF_TOMBSTONE,
  LEGENDS_THE_OLD_HUNGER,
  LEGENDS_WINTER_ETERNAL,
  LEGENDS_THE_CONQUISTADORS_RETURN,

  // Ghost Town Exploration (8 quests)
  GHOST_TOWN_PROSPERITY_DEPTHS,
  GHOST_TOWN_PROSPERITY_SURVIVORS,
  GHOST_TOWN_DEADWOOD_SHADOW,
  GHOST_TOWN_DEADWOOD_TRUTH,
  GHOST_TOWN_WRATHS_HOLLOW_ENTRY,
  GHOST_TOWN_WRATHS_HOLLOW_RECKONING,
  GHOST_TOWN_SAN_MUERTE_APPROACH,
  GHOST_TOWN_SAN_MUERTE_CRYPT,

  // Artifact Hunting (4 quests)
  ARTIFACTS_OUTLAW_LEGENDS,
  ARTIFACTS_CURSED_COLLECTION,
  ARTIFACTS_SPIRIT_RELICS,
  ARTIFACTS_COLONIAL_CURSE,

  // Legendary Bounty Chains (6 quests)
  BOUNTY_JESSE_JAMES_INVESTIGATION,
  BOUNTY_JESSE_JAMES_CONFRONTATION,
  BOUNTY_DOC_HOLLIDAY_TRAIL,
  BOUNTY_DOC_HOLLIDAY_CHOICE,
  BOUNTY_NATIVE_RAIDER_HUNT,
  BOUNTY_NATIVE_RAIDER_JUSTICE,

  // Reputation Prestige (2 quests)
  PRESTIGE_THE_LAW,
  PRESTIGE_THE_LEGEND,
];

// Export individual quest getters for easy access
export function getLegendsQuest(questId: string): QuestSeedData | undefined {
  return LEGENDS_OF_WEST_QUESTS.find(q => q.questId === questId);
}

// Export quest count for validation
export const LEGENDS_QUEST_COUNT = {
  mainArc: 10,
  ghostTown: 8,
  artifacts: 4,
  bountyChains: 6,
  prestige: 2,
  total: LEGENDS_OF_WEST_QUESTS.length, // Should be 30
};
