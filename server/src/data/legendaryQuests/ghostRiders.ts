/**
 * THE GHOST RIDERS
 * Legendary Quest Chain: Investigate the fate of a legendary vanished gang
 * Level 30-35 | 5 Quests | Supernatural Horror
 */

import type {
  LegendaryQuestChain,
} from '@desperados/shared';

export const ghostRidersChain: LegendaryQuestChain = {
  id: 'chain_ghost_riders',
  name: 'The Ghost Riders',
  description:
    'Twenty years ago, the most feared gang in the West vanished without a trace. Were they killed? Did they disappear? Or did something worse happen?',
  theme: 'mystery',

  levelRange: [30, 35],
  prerequisites: [
    { type: 'level', minLevel: 30 },
  ],

  totalQuests: 5,

  prologue: `In 1862, the Ghost Riders were the most feared gang in the American West.
    Led by the legendary outlaw Marcus "Dead-Eye" Dalton, they robbed more banks
    and trains than Jesse James ever dreamed of.

    Then, on the night of October 31, 1862, they vanished.

    Twenty years later, stories persist. Travelers report seeing spectral riders
    on pale horses. Miners hear gunshots in abandoned mines. Towns wake to find
    their valuables missing, left with only hoofprints that disappear into nothing.

    Some say the Ghost Riders are dead, cursed to ride forever.
    Others claim they found a way to become immortal.
    A few believe they never existed at all - just frontier mythology.

    But you've found Marcus Dalton's journal, and it tells a different story.
    A story of dark rituals, forbidden power, and a price too terrible to imagine.`,

  epilogue: `The truth about the Ghost Riders is more horrifying than any legend.

    They're not dead. They're not quite alive either. Caught between worlds,
    they ride forever, unable to stop, unable to rest, unable to die.

    And now you must choose: end their curse and send them to peace,
    join them in eternal damnation, or leave them to their fate.

    Either way, the Ghost Riders' story finally has an ending.`,

  majorNPCs: [
    {
      id: 'npc_marcus_dalton',
      name: 'Marcus "Dead-Eye" Dalton',
      role: 'Leader of the Ghost Riders',
      description: 'The legendary outlaw who led his gang into damnation. Is he still human?',
    },
    {
      id: 'npc_widow_kane',
      name: 'Widow Sarah Kane',
      role: 'The last person to see the Ghost Riders alive',
      description: 'An elderly woman who witnessed the ritual that cursed the gang.',
    },
    {
      id: 'npc_preacher_black',
      name: 'Reverend Josiah Black',
      role: 'Fallen preacher who performed the dark ritual',
      description: 'A man of God who turned to darker powers. His soul is trapped with the Riders.',
    },
    {
      id: 'npc_midnight_rose',
      name: 'Midnight Rose',
      role: 'Ghost Rider, cursed but still aware',
      description: 'The only Ghost Rider who retained her humanity. She wants to be free.',
    },
  ],

  quests: [], // Would contain 5 detailed quests following the ghost investigation

  chainRewards: [
    {
      milestone: 3,
      description: 'Uncovered the truth about the Ghost Riders',
      rewards: [
        { type: 'skill_points', amount: 5 },
        { type: 'item', itemId: 'item_spirit_detector', quantity: 1 },
      ],
    },
    {
      milestone: 5,
      description: 'Resolved the Ghost Riders\' curse',
      rewards: [
        { type: 'dollars', amount: 15000 },
        { type: 'skill_points', amount: 15 },
      ],
    },
  ],

  uniqueItems: [
    {
      id: 'mount_phantom_horse',
      name: 'Phantom Horse',
      description: 'A spectral steed that gallops between the world of the living and the dead.',
      type: 'mount',
      rarity: 'legendary',
      stats: {
        speed: 100,
        stamina_infinite: 1,
        ethereal: 1,
      },
      specialAbility: 'Ghostwalk: Phase through obstacles, invisible to enemies when riding',
    },
    {
      id: 'item_cursed_revolver',
      name: 'Dead-Eye\'s Revolver',
      description: 'Marcus Dalton\'s legendary revolver. Every bullet finds its mark, but at a cost.',
      type: 'weapon',
      rarity: 'legendary',
      stats: {
        damage: 100,
        accuracy: 100,
        cursed: 1,
      },
      specialAbility: 'Never Miss: Perfect accuracy, but each shot drains your life force',
    },
    {
      id: 'cosmetic_ghost_rider_duster',
      name: 'Ghost Rider\'s Duster',
      description: 'A tattered coat that seems to fade in and out of existence. Marks you as one who walks with ghosts.',
      type: 'cosmetic',
      rarity: 'legendary',
      stats: {
        intimidation: 40,
        supernatural_affinity: 30,
      },
      specialAbility: 'Fade: Become partially invisible in shadows and at night',
    },
  ],

  titleUnlocked: 'Rider of the Storm',
  achievementId: 'achievement_ghost_riders_complete',

  estimatedDuration: '8-10 hours',
  difficulty: 'hard',

  icon: '/assets/icons/ghost_riders.png',
  bannerImage: '/assets/banners/ghost_riders_chain.jpg',
  tags: ['supernatural', 'horror', 'mystery', 'undead', 'western-gothic'],
};
