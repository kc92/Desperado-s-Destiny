/**
 * The Scar Buildings Seed Data - HAUNTED PLACEHOLDER
 *
 * END-GAME LOCATION (L30-40) - Site of COSMIC HORROR
 * Theme: Forbidden zone where What-Waits-Below slumbers
 *
 * Background: The Scar is a massive fissure where reality itself is wrong.
 * Something ancient and terrible sleeps in the depths. Those who venture too close
 * speak of whispers in their minds, of visions that drive them mad, of a presence
 * that watches from below with hunger beyond comprehension.
 *
 * STATUS: PLACEHOLDER - Full cosmic horror content will be developed in Phase 14.
 * Current state: Atmospheric framework with warning NPCs. Access restricted.
 */

import mongoose from 'mongoose';
import logger from '../../utils/logger';
import { Location } from '../../models/Location.model';
import { LOCATION_IDS } from '../locations.seed';

// Building IDs for The Scar (Haunted Placeholder - Phase 14 will expand)
export const THE_SCAR_BUILDING_IDS = {
  THE_EDGE: new mongoose.Types.ObjectId('6508a0000000000000000001'),
  HERMITS_WARNING: new mongoose.Types.ObjectId('6508a0000000000000000002'),
};

const theScarBuildings = [
  // ===== 1. THE EDGE - OVERLOOK OF THE ABYSS =====
  {
    _id: THE_SCAR_BUILDING_IDS.THE_EDGE,
    name: 'The Edge',
    description: 'The last safe point before The Scar proper begins. A rocky outcrop overlooking the massive fissure that plunges into lightless depths. The air here feels wrong - too cold, too still, as if reality itself recoils from what lies below. Those who stand at the edge report vertigo, nausea, and an overwhelming sense of being watched by something vast and hungry.',
    shortDescription: 'Overlook of the forbidden depths',
    type: 'overlook',
    region: 'devils_canyon',
    parentId: LOCATION_IDS.THE_SCAR,
    tier: 5,
    dominantFaction: null,
    operatingHours: { open: 0, close: 23 }, // Always accessible, always dreadful
    atmosphere: 'Reality feels thin here. The wind carries whispers in no human language. Shadows move with no source. The fissure below yawns like a mouth waiting to swallow the world. Your thoughts feel observed. Your mind rebels against perceiving what cannot be. Even hardened outlaws feel their sanity fray.',
    requirements: { minLevel: 30, minCriminalRep: 0 },
    npcs: [
      {
        id: 'the-watcher',
        name: 'The Watcher',
        title: 'Guardian of the Edge',
        description: 'A silent figure wrapped in tattered robes that shift colors your eyes cannot quite process. They stand utterly still, facing the abyss, never sleeping, never eating. Some say they have stood here for decades. Others claim centuries. Their eyes reflect no light. When they speak - rarely - their voice echoes from directions that should not exist.',
        personality: 'Cryptic, detached from humanity, speaks of cosmic truths. Warns against descent. Values those who understand fear is wisdom.',
        faction: null,
        dialogue: [
          'Do not look too long into the deep. What-Waits-Below looks back.',
          'You think you are brave? Brave is ignorance. The knowing flee.',
          'It dreams in the dark. In Its dreams, we are food and folly.',
          'Turn back. This warning is a kindness. Kindness is all that remains here.',
        ],
        isVendor: false,
        quests: [],
      },
    ],
    availableActions: ['observe-the-depths', 'feel-the-wrongness'],
    availableCrimes: [],
    jobs: [],
    shops: [],
    secrets: [
      {
        id: 'whisper-from-below',
        name: 'The Whisper From Below',
        description: 'If you stand at the edge long enough, staring into the lightless depths, you begin to hear it. A whisper. Not words exactly - something that bypasses language and inscribes itself directly into thought. It promises power. It promises knowledge. It promises transformation. The Watcher will pull you back if they see the madness taking hold. Usually.',
        type: 'progressive',
        unlockCondition: {
          minReputation: 0,
          npcTrust: { npcId: 'the-watcher', level: 0 },
        },
        content: {
          actions: ['resist-the-call', 'accept-the-whisper'],
          dialogue: [
            'You heard It, did you not? Now It knows you exist. I am... sorry.',
          ],
          rewards: {
            gold: 0,
            xp: 500,
            items: ['cosmic-awareness', 'the-watchers-pity'],
          },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 10,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 0, frontera: 0 },
    isUnlocked: true,
    isHidden: false,
  },

  // ===== 2. HERMIT'S WARNING - SURVIVOR'S CAMP =====
  {
    _id: THE_SCAR_BUILDING_IDS.HERMITS_WARNING,
    name: "Hermit's Warning",
    description: 'A crude camp built from scavenged wood and stone, located as far from The Scar as possible while still being able to warn travelers. The Last Sane Man lives here, dedicating what remains of his broken life to turning people away from doom. His warnings grow more frantic each year as What-Waits-Below stirs in restless dreams.',
    shortDescription: 'Mad hermit\'s warning post',
    type: 'camp',
    region: 'devils_canyon',
    parentId: LOCATION_IDS.THE_SCAR,
    tier: 5,
    dominantFaction: null,
    operatingHours: { open: 0, close: 23 },
    atmosphere: 'The camp reeks of fear-sweat and desperation. Warning signs carved into wood and stone litter the ground. "TURN BACK" "DEATH BELOW" "IT HUNGERS" are scratched into every surface. A fire burns perpetually - the hermit refuses to sleep in darkness. Sometimes he screams warnings at things only he can see.',
    requirements: { minLevel: 30 },
    npcs: [
      {
        id: 'last-sane-man',
        name: 'The Last Sane Man',
        title: 'Bearer of Terrible Knowledge',
        description: 'Once a prospector named William Hendricks. He descended into The Scar twenty years ago seeking gold. He found something far worse. What he saw shattered his mind but left enough intact to understand the horror. He cannot leave - he must warn others. His hair has gone white, his hands shake constantly, and his eyes dart to shadows that move when they should not.',
        personality: 'Terrified but determined. Speaks in frantic bursts. Desperate to be believed. Values those who heed warnings over those who seek glory.',
        faction: null,
        dialogue: [
          'TURN BACK! For God\'s sake, turn back! There is nothing below but madness and hunger!',
          'I saw It. Just a glimpse. Just a GLIMPSE and my mind nearly broke. You cannot face what I saw.',
          'The Nahi were right. They were ALWAYS right. Some things must stay buried, must stay sleeping.',
          'Gold? You came for gold? The richest man in the world dies screaming same as the poorest when It feeds.',
        ],
        isVendor: false,
        quests: ['hear-the-testimony'],
      },
    ],
    availableActions: ['hear-warnings', 'examine-evidence'],
    availableCrimes: [],
    jobs: [
      {
        id: 'tend-the-warning-fire',
        name: 'Tend the Warning Fire',
        description: 'Help the hermit maintain the perpetual fire that marks the warning camp. He believes the light keeps something at bay.',
        energyCost: 10,
        cooldownMinutes: 60,
        rewards: { goldMin: 0, goldMax: 0, xp: 100, items: ['hermits-gratitude'] },
        requirements: { minLevel: 30 },
      },
    ],
    shops: [],
    secrets: [
      {
        id: 'hermits-testimony',
        name: "The Hermit's Full Testimony",
        description: 'If you gain his trust - if you truly listen - the Last Sane Man will tell you everything he saw in the depths. The geometry that bent wrong. The sounds that preceded silence. The moment he looked into an eye the size of a house and understood that humanity was nothing, less than nothing, to what dwelled below. The knowledge will not help you. But at least you will know what awaits.',
        type: 'progressive',
        unlockCondition: {
          minReputation: 0,
          npcTrust: { npcId: 'last-sane-man', level: 3 },
        },
        content: {
          actions: ['hear-full-testimony', 'understand-the-horror'],
          dialogue: [
            'You want to know? You truly want to know? Very well. But once I tell you, you will carry this burden too. You will know what sleeps beneath our feet. And knowing, you cannot unknow.',
          ],
          rewards: {
            gold: 0,
            xp: 1000,
            items: ['forbidden-knowledge', 'cosmic-dread', 'understanding-of-what-waits-below'],
          },
        },
        isDiscovered: false,
      },
    ],
    connections: [],
    dangerLevel: 8,
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 0, frontera: 0 },
    isUnlocked: true,
    isHidden: false,
  },
];

/**
 * Seed The Scar buildings into the database
 */
export async function seedTheScarBuildings(): Promise<void> {
  try {
    // Verify The Scar location exists
    const theScar = await Location.findById(LOCATION_IDS.THE_SCAR);
    if (!theScar) {
      console.warn('Warning: The Scar location not found. Buildings will reference non-existent parent.');
    }

    // Delete existing The Scar buildings (by parentId)
    await Location.deleteMany({ parentId: LOCATION_IDS.THE_SCAR });

    // Insert The Scar buildings
    await Location.insertMany(theScarBuildings);

    console.log(`Successfully seeded ${theScarBuildings.length} The Scar buildings (HAUNTED PLACEHOLDER - Phase 14 expansion pending)`);
  } catch (error) {
    logger.error('Error seeding The Scar buildings', { error: error instanceof Error ? error.message : error });
    throw error;
  }
}

export default theScarBuildings;
