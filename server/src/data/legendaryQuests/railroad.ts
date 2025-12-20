/**
 * THE RAILROAD CONSPIRACY
 * Legendary Quest Chain: Uncover corporate corruption and the dark truth behind the railroad
 * Level 30-36 | 5 Quests | Political Intrigue
 */

import type {
  LegendaryQuestChain,
} from '@desperados/shared';

export const railroadChain: LegendaryQuestChain = {
  id: 'chain_railroad',
  name: 'The Railroad Conspiracy',
  description:
    'The transcontinental railroad brought progress and prosperity. It also brought murder, corruption, and conspiracy at the highest levels.',
  theme: 'political',

  levelRange: [30, 36],
  prerequisites: [
    { type: 'level', minLevel: 30 },
  ],

  totalQuests: 5,

  prologue: `The transcontinental railroad connected a nation and made fortunes for the robber barons
    who built it. But beneath the golden spike and the celebration lies a darker truth.

    Land stolen from natives. Workers crushed by impossible quotas. Politicians bought.
    Competitors destroyed. Witnesses silenced. All in the name of progress.

    You've come across documents - stolen from a railroad executive's office -
    that prove a conspiracy reaching the highest levels of government and business.
    Murder orders. Bribery records. Plans to eliminate entire communities that
    stood in the railroad's path.

    But the railroad companies know you have their secrets. They will stop at nothing
    to bury the truth. And in the West, corporations have their own justice.

    This isn't just about exposing corruption. This is about survival.`,

  epilogue: `The evidence is irrefutable. The railroad conspiracy is real, and it goes deeper
    than you ever imagined. Senators, judges, law enforcement - all bought and paid for.

    You have the power to bring it all down. Publish the documents and watch empires fall.
    Or use them for leverage, becoming untouchable. Or hide the truth and let the guilty
    remain free.

    But know this: whatever you choose, the railroad companies will never stop hunting you.
    Some truths are too dangerous to know.

    The question is: what price are you willing to pay for justice?`,

  majorNPCs: [
    {
      id: 'npc_cornelius_vandermeer',
      name: 'Cornelius Vandermeer III',
      role: 'Railroad tycoon and conspirator',
      description: 'One of the richest men in America. Charming, ruthless, and utterly without conscience.',
    },
    {
      id: 'npc_senator_blackwell',
      name: 'Senator Augustus Blackwell',
      role: 'Corrupt politician',
      description: 'A U.S. Senator who has been taking railroad money for years. He writes the laws they need.',
    },
    {
      id: 'npc_investigator_walsh',
      name: 'Margaret Walsh',
      role: 'Crusading journalist',
      description: 'A reporter who has been investigating the railroad for years. She needs your evidence.',
    },
    {
      id: 'npc_hired_killer',
      name: 'The Gentleman',
      role: 'Railroad enforcer',
      description: 'An assassin employed by the railroad to eliminate problems. He never fails.',
    },
    {
      id: 'npc_whistleblower',
      name: 'Thomas Chen',
      role: 'Former railroad accountant',
      description: 'He kept the books. He knows where the bodies are buried - literally.',
    },
  ],

  quests: [], // Would contain 5 detailed quests uncovering the conspiracy

  chainRewards: [
    {
      milestone: 3,
      description: 'Exposed the first layer of corruption',
      rewards: [
        { type: 'dollars', amount: 5000 },
        { type: 'item', itemId: 'item_press_connections', quantity: 1 },
      ],
    },
    {
      milestone: 5,
      description: 'Survived the railroad\'s full assault',
      rewards: [
        { type: 'dollars', amount: 15000 },
        { type: 'skill_points', amount: 15 },
      ],
    },
  ],

  uniqueItems: [
    {
      id: 'item_tycoon_watch',
      name: 'Tycoon\'s Pocket Watch',
      description: 'An expensive chronometer belonging to Cornelius Vandermeer. Time is money, and money is power.',
      type: 'utility',
      rarity: 'legendary',
      stats: {
        perception: 20,
        business_acumen: 30,
      },
      specialAbility: 'Empire Builder: -20% costs on all purchases, +25% income from properties',
    },
    {
      id: 'item_evidence_briefcase',
      name: 'The Vandermeer Files',
      description: 'Irrefutable evidence of corporate corruption at the highest levels. Worth more than gold.',
      type: 'utility',
      rarity: 'legendary',
      stats: {
        leverage: 100,
      },
      specialAbility: 'Untouchable: Railroad companies and corrupt officials cannot attack you',
    },
    {
      id: 'property_railroad_depot',
      name: 'Railroad Depot',
      description: 'A fully operational train depot. Control the rails, control the territory.',
      type: 'utility',  // Property deed item
      rarity: 'legendary',
      stats: {
        income: 1000, // per day
        influence: 50,
      },
      specialAbility: 'Rail Baron: Free fast travel via train, discount on shipping, tax revenue from commerce',
    },
  ],

  titleUnlocked: 'The Truth',
  achievementId: 'achievement_railroad_conspiracy_complete',

  estimatedDuration: '10-12 hours',
  difficulty: 'hard',

  icon: '/assets/icons/railroad.png',
  bannerImage: '/assets/banners/railroad_chain.jpg',
  tags: ['political', 'conspiracy', 'corporate', 'investigation', 'moral-choice'],
};
