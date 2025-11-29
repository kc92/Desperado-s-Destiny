/**
 * Chinese Diaspora Quest Chain Definitions
 *
 * Organizes Underground Railroad quests into coherent narrative chains
 * with branching paths, moral choices, and long-term consequences.
 */

export interface QuestChain {
  id: string;
  name: string;
  description: string;
  questIds: string[];
  minTrustLevel: number;
  estimatedPlaytime: number; // hours
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  moralThemes: string[];
  longTermConsequences: ChainConsequence[];
}

export interface ChainConsequence {
  type: 'npc_status' | 'territory_control' | 'faction_reputation' | 'unlocks' | 'world_state';
  description: string;
  permanent: boolean;
  questTrigger: string; // Which quest causes this
  choiceDependent?: boolean;
}

export interface MoralChoice {
  questId: string;
  choiceId: string;
  description: string;
  requirements?: {
    gold?: number;
    items?: string[];
    skills?: string[];
  };
  outcomes: ChoiceOutcome[];
}

export interface ChoiceOutcome {
  path: string;
  shortTermEffect: string;
  longTermEffect: string;
  reputationChange: number;
  npcReactions: NPCReaction[];
  unlocks?: string[];
  locks?: string[];
}

export interface NPCReaction {
  npcId: string;
  reactionType: 'positive' | 'negative' | 'neutral' | 'complex';
  dialogueChange: string;
  trustChange?: number;
}

// ============================================================================
// MAIN QUEST CHAIN: The Iron Road to Freedom
// ============================================================================

export const IRON_ROAD_CHAIN: QuestChain = {
  id: 'iron-road-to-freedom',
  name: 'The Iron Road to Freedom',
  description: 'A five-part epic about freeing Chinese workers from a brutal railroad labor camp and helping them build new lives. Your choices will determine how many survive and what kind of future they have.',
  questIds: [
    'whispers-on-the-wind',
    'the-inside-man',
    'breaking-chains',
    'the-long-march',
    'new-lives'
  ],
  minTrustLevel: 2, // Friend level with Chen Wei
  estimatedPlaytime: 12,
  difficulty: 'epic',
  moralThemes: [
    'Freedom vs. Safety',
    'Individual vs. Collective Good',
    'Justice vs. Vengeance',
    'Pragmatism vs. Idealism'
  ],
  longTermConsequences: [
    {
      type: 'territory_control',
      description: 'Freed workers establish a thriving Chinese community in the territory',
      permanent: true,
      questTrigger: 'new-lives'
    },
    {
      type: 'npc_status',
      description: 'Railroad Boss Cornelius Blackwell becomes a permanent enemy (if confronted)',
      permanent: true,
      questTrigger: 'new-lives',
      choiceDependent: true
    },
    {
      type: 'faction_reputation',
      description: 'Chinese Network becomes a major political force in the territory',
      permanent: true,
      questTrigger: 'new-lives'
    },
    {
      type: 'unlocks',
      description: 'Unlocks advanced Chinese Network services and NPCs',
      permanent: true,
      questTrigger: 'new-lives'
    },
    {
      type: 'world_state',
      description: 'Railroad labor practices improve or worsen depending on choices',
      permanent: true,
      questTrigger: 'new-lives',
      choiceDependent: true
    }
  ]
};

// ============================================================================
// MORAL CHOICES: The Iron Road to Freedom
// ============================================================================

export const IRON_ROAD_CHOICES: MoralChoice[] = [
  {
    questId: 'breaking-chains',
    choiceId: 'escape-method',
    description: 'How do you execute the escape from the labor camp?',
    outcomes: [
      {
        path: 'stealth',
        shortTermEffect: 'Frees 30 workers silently. No casualties, but slower.',
        longTermEffect: 'Camp continues operating. More workers remain trapped.',
        reputationChange: 100,
        npcReactions: [
          {
            npcId: 'chen-wei',
            reactionType: 'positive',
            dialogueChange: 'You chose wisdom over glory. Many are grateful.',
            trustChange: 1
          },
          {
            npcId: 'hu-feng',
            reactionType: 'complex',
            dialogueChange: 'We saved some... but what about the rest?'
          }
        ],
        unlocks: ['stealth-master-reputation']
      },
      {
        path: 'bribery',
        shortTermEffect: 'Frees 50 workers quickly. Costs 500 gold. Guards look other way.',
        longTermEffect: 'Guards become unreliable. Camp weakened but operational.',
        reputationChange: 150,
        npcReactions: [
          {
            npcId: 'chen-wei',
            reactionType: 'neutral',
            dialogueChange: 'Gold can buy freedom. But at what cost to our souls?'
          },
          {
            npcId: 'master-fang',
            reactionType: 'negative',
            dialogueChange: 'You paid off the oppressors. They will only demand more.',
            trustChange: -1
          }
        ],
        unlocks: ['corrupted-guards-contact']
      },
      {
        path: 'force',
        shortTermEffect: 'Frees ALL workers. Camp destroyed. 12 guards killed.',
        longTermEffect: 'Major heat from law enforcement. Railroad company seeks revenge.',
        reputationChange: 200,
        npcReactions: [
          {
            npcId: 'hu-feng',
            reactionType: 'positive',
            dialogueChange: 'You struck a blow for freedom! The oppressors fear us now!',
            trustChange: 2
          },
          {
            npcId: 'chen-wei',
            reactionType: 'complex',
            dialogueChange: 'Freedom... but violence begets violence. Stay vigilant.'
          },
          {
            npcId: 'sheriff-john-hawk',
            reactionType: 'negative',
            dialogueChange: 'You killed a dozen men. Law is law. Watch your back.',
            trustChange: -2
          }
        ],
        unlocks: ['railroad-company-enemy', 'freedom-fighter-reputation'],
        locks: ['peaceful-railroad-jobs']
      }
    ]
  },

  {
    questId: 'the-long-march',
    choiceId: 'sophies-choice',
    description: 'Pinkertons are closing in. The group is too large and too slow. You must choose who to prioritize.',
    requirements: {
      skills: ['leadership']
    },
    outcomes: [
      {
        path: 'save-elderly',
        shortTermEffect: '15 elderly and sick saved. 10 families captured by Pinkertons.',
        longTermEffect: 'Elders share wisdom and history. Families never forgive you.',
        reputationChange: 75,
        npcReactions: [
          {
            npcId: 'master-fang',
            reactionType: 'positive',
            dialogueChange: 'You honored our elders. This is the way of our people.',
            trustChange: 2
          },
          {
            npcId: 'young-families',
            reactionType: 'negative',
            dialogueChange: 'You abandoned our children. We will never forget.'
          }
        ],
        unlocks: ['elder-wisdom-bonuses', 'ancient-knowledge']
      },
      {
        path: 'save-families',
        shortTermEffect: '25 families with children saved. 15 elderly captured.',
        longTermEffect: 'Children grow up free. Community thrives. Elders die in custody.',
        reputationChange: 100,
        npcReactions: [
          {
            npcId: 'mei-lin',
            reactionType: 'positive',
            dialogueChange: 'You chose the future. The young will remember.',
            trustChange: 1
          },
          {
            npcId: 'old-zhang',
            reactionType: 'complex',
            dialogueChange: 'You left us behind... I understand. But it hurts.'
          }
        ],
        unlocks: ['growing-community', 'next-generation']
      },
      {
        path: 'save-all',
        shortTermEffect: 'Heroic stand. You fight Pinkertons to buy time. Everyone escapes.',
        longTermEffect: 'You are wounded. Legendary status. Permanent limp.',
        reputationChange: 250,
        npcReactions: [
          {
            npcId: 'chen-wei',
            reactionType: 'positive',
            dialogueChange: 'You risked everything for us. You are family.',
            trustChange: 3
          },
          {
            npcId: 'all-chinese-npcs',
            reactionType: 'positive',
            dialogueChange: 'The network speaks of your courage in hushed reverence.'
          }
        ],
        unlocks: ['legendary-hero-status', 'permanent-injury'],
        locks: ['some-athletic-actions']
      }
    ]
  },

  {
    questId: 'new-lives',
    choiceId: 'railroad-boss-confrontation',
    description: 'Cornelius Blackwell exploited these workers. What justice do you seek?',
    outcomes: [
      {
        path: 'expose',
        shortTermEffect: 'Testimony leads to Senate investigation. Blackwell arrested.',
        longTermEffect: 'Labor laws improve. Chinese workers gain legal protections.',
        reputationChange: 200,
        npcReactions: [
          {
            npcId: 'master-fang',
            reactionType: 'positive',
            dialogueChange: 'You changed the law itself. True power.',
            trustChange: 2
          },
          {
            npcId: 'settler-alliance',
            reactionType: 'positive',
            dialogueChange: 'You fought within the system. Respectable.'
          }
        ],
        unlocks: ['labor-reform', 'legal-protections', 'political-influence']
      },
      {
        path: 'duel',
        shortTermEffect: 'Epic duel with Blackwell. If you win, he\'s humiliated/killed.',
        longTermEffect: 'Personal justice. Nothing changes systemically. You\'re wanted.',
        reputationChange: 150,
        npcReactions: [
          {
            npcId: 'hu-feng',
            reactionType: 'positive',
            dialogueChange: 'Blood for blood. The old way. He deserved worse.',
            trustChange: 1
          },
          {
            npcId: 'sheriff-john-hawk',
            reactionType: 'negative',
            dialogueChange: 'Murder is murder. You\'re a wanted man now.',
            trustChange: -3
          }
        ],
        unlocks: ['wanted-status', 'reputation-as-killer'],
        locks: ['lawful-town-access']
      },
      {
        path: 'deal',
        shortTermEffect: 'Blackwell pays reparations (1000 gold). Admits no guilt.',
        longTermEffect: 'Money helps workers. Blackwell continues business. Pragmatic.',
        reputationChange: 100,
        npcReactions: [
          {
            npcId: 'chen-wei',
            reactionType: 'neutral',
            dialogueChange: 'Gold buys food. But justice? That remains unpaid.'
          },
          {
            npcId: 'master-fang',
            reactionType: 'negative',
            dialogueChange: 'You let the snake live. He will bite again.',
            trustChange: -1
          }
        ],
        unlocks: ['blackwell-uneasy-truce', 'worker-fund']
      }
    ]
  }
];

// ============================================================================
// SECONDARY CHAIN: The Jade Passage
// ============================================================================

export const JADE_PASSAGE_CHAIN: QuestChain = {
  id: 'jade-passage',
  name: 'The Jade Passage',
  description: 'Help Chinese immigrants cross illegally into the territory, create false documents, and integrate into society. A quieter but equally important struggle.',
  questIds: [
    'crossing-the-wire',
    'paper-sons',
    'the-new-beginning'
  ],
  minTrustLevel: 2,
  estimatedPlaytime: 6,
  difficulty: 'medium',
  moralThemes: [
    'Law vs. Morality',
    'Identity and Belonging',
    'Survival vs. Principle'
  ],
  longTermConsequences: [
    {
      type: 'world_state',
      description: 'Chinese population in territory increases significantly',
      permanent: true,
      questTrigger: 'the-new-beginning'
    },
    {
      type: 'unlocks',
      description: 'New Chinese businesses and services become available',
      permanent: true,
      questTrigger: 'the-new-beginning'
    },
    {
      type: 'faction_reputation',
      description: 'Improved standing with Chinese Network',
      permanent: true,
      questTrigger: 'the-new-beginning'
    }
  ]
};

// ============================================================================
// RESCUE QUEST CHAIN (Repeatable)
// ============================================================================

export const RESCUE_CHAIN: QuestChain = {
  id: 'ongoing-rescue-operations',
  name: 'Ongoing Rescue Operations',
  description: 'Repeatable missions to rescue individual workers and families. Each successful rescue builds your reputation and saves lives.',
  questIds: [
    'escaping-the-mines',
    'safe-haven',
    'midnight-express'
  ],
  minTrustLevel: 2,
  estimatedPlaytime: 2, // per quest
  difficulty: 'medium',
  moralThemes: [
    'Individual Acts of Courage',
    'Persistent Resistance'
  ],
  longTermConsequences: [
    {
      type: 'faction_reputation',
      description: 'Continuous reputation gain with each rescue',
      permanent: false,
      questTrigger: 'any'
    }
  ]
};

// ============================================================================
// DRAMATIC QUESTS CHAIN
// ============================================================================

export const DRAMATIC_CHAIN: QuestChain = {
  id: 'hard-choices',
  name: 'The Hardest Choices',
  description: 'Standalone quests that force you to make impossible moral decisions with lasting consequences. These define who you are.',
  questIds: [
    'sophies-choice-at-the-crossing',
    'the-informer',
    'the-debt-collector',
    'the-testimony'
  ],
  minTrustLevel: 3,
  estimatedPlaytime: 8,
  difficulty: 'hard',
  moralThemes: [
    'Impossible Choices',
    'Betrayal and Trust',
    'Justice vs. Mercy',
    'Personal Cost of Heroism'
  ],
  longTermConsequences: [
    {
      type: 'npc_status',
      description: 'NPCs remember your choices forever',
      permanent: true,
      questTrigger: 'any',
      choiceDependent: true
    },
    {
      type: 'world_state',
      description: 'Network security and effectiveness changes based on choices',
      permanent: true,
      questTrigger: 'the-informer',
      choiceDependent: true
    }
  ]
};

// ============================================================================
// DRAMATIC QUEST CHOICES
// ============================================================================

export const DRAMATIC_CHOICES: MoralChoice[] = [
  {
    questId: 'the-informer',
    choiceId: 'traitor-fate',
    description: 'You\'ve caught the informer who betrayed the network. What justice?',
    outcomes: [
      {
        path: 'exile',
        shortTermEffect: 'Traitor banished from territory. Network security restored.',
        longTermEffect: 'Traitor may return with vengeance. Merciful reputation.',
        reputationChange: 75,
        npcReactions: [
          {
            npcId: 'chen-wei',
            reactionType: 'positive',
            dialogueChange: 'Mercy is strength. You chose wisely.'
          },
          {
            npcId: 'hu-feng',
            reactionType: 'negative',
            dialogueChange: 'Too soft. Traitors should die.',
            trustChange: -1
          }
        ],
        unlocks: ['merciful-leader-reputation']
      },
      {
        path: 'execute',
        shortTermEffect: 'Traitor executed publicly. Message sent to potential betrayers.',
        longTermEffect: 'Network members fear you. Effectiveness increases.',
        reputationChange: 100,
        npcReactions: [
          {
            npcId: 'hu-feng',
            reactionType: 'positive',
            dialogueChange: 'Good. Betrayal cannot be tolerated.',
            trustChange: 1
          },
          {
            npcId: 'mei-lin',
            reactionType: 'negative',
            dialogueChange: 'Was this necessary? We become what we hate.'
          }
        ],
        unlocks: ['feared-leader-reputation', 'ruthless-efficiency']
      },
      {
        path: 'redeem',
        shortTermEffect: 'Traitor works to redeem themselves. Risky but hopeful.',
        longTermEffect: 'If successful, traitor becomes loyal asset. If failed, disaster.',
        reputationChange: 50,
        npcReactions: [
          {
            npcId: 'master-fang',
            reactionType: 'positive',
            dialogueChange: 'You believe in second chances. Wisdom or folly? Time will tell.',
            trustChange: 1
          }
        ],
        unlocks: ['redemption-arc', 'informer-as-ally-or-enemy']
      }
    ]
  },

  {
    questId: 'the-debt-collector',
    choiceId: 'lucky-lou-solution',
    description: 'How do you stop Lucky Lou from exploiting Chinese workers?',
    requirements: {
      gold: 1000
    },
    outcomes: [
      {
        path: 'pay-debts',
        shortTermEffect: 'Spend 1000 gold to pay off all debts. Families freed immediately.',
        longTermEffect: 'Lou continues business. You set precedent: you can be bought.',
        reputationChange: 100,
        npcReactions: [
          {
            npcId: 'freed-families',
            reactionType: 'positive',
            dialogueChange: 'You saved us! Our children are free!'
          },
          {
            npcId: 'lucky-lou',
            reactionType: 'neutral',
            dialogueChange: 'Business is business. Come back when you need another loan.',
            trustChange: 1
          }
        ],
        unlocks: ['families-gratitude', 'lou-contact']
      },
      {
        path: 'expose',
        shortTermEffect: 'Evidence goes to authorities. Lou arrested. Legal victory.',
        longTermEffect: 'Families freed. Lou replaced by someone worse. Systemic issue.',
        reputationChange: 150,
        npcReactions: [
          {
            npcId: 'sheriff-john-hawk',
            reactionType: 'positive',
            dialogueChange: 'Good work. Law still means something.'
          },
          {
            npcId: 'master-fang',
            reactionType: 'complex',
            dialogueChange: 'One snake dies. Another takes its place. But you tried.'
          }
        ],
        unlocks: ['lawful-reputation', 'new-loan-shark-arrives']
      },
      {
        path: 'kill',
        shortTermEffect: 'Lucky Lou killed. Ledger burned. All debts erased.',
        longTermEffect: 'Families free. You\'re a killer. Power vacuum creates chaos.',
        reputationChange: 125,
        npcReactions: [
          {
            npcId: 'freed-families',
            reactionType: 'complex',
            dialogueChange: 'We are grateful... and afraid of you.'
          },
          {
            npcId: 'chen-wei',
            reactionType: 'negative',
            dialogueChange: 'You took a life. Sometimes necessary. Still heavy.'
          },
          {
            npcId: 'criminal-network',
            reactionType: 'positive',
            dialogueChange: 'You don\'t mess around. Respect.'
          }
        ],
        unlocks: ['killer-reputation', 'criminal-contacts', 'territory-chaos'],
        locks: ['some-lawful-npcs']
      }
    ]
  },

  {
    questId: 'the-testimony',
    choiceId: 'senate-testimony',
    description: 'Testifying could change history - or destroy the underground railroad.',
    outcomes: [
      {
        path: 'testify',
        shortTermEffect: 'Public testimony reveals railroad horrors. Major news.',
        longTermEffect: 'Laws change. Network exposed. Some arrested. Long-term progress.',
        reputationChange: 300,
        npcReactions: [
          {
            npcId: 'master-fang',
            reactionType: 'complex',
            dialogueChange: 'You sacrificed us for the greater good. History will judge.',
            trustChange: -2
          },
          {
            npcId: 'senator-hayes',
            reactionType: 'positive',
            dialogueChange: 'Your courage changed this nation. Thank you.'
          }
        ],
        unlocks: ['historical-figure', 'labor-reform', 'network-persecution'],
        locks: ['some-network-services']
      },
      {
        path: 'stay-silent',
        shortTermEffect: 'Network stays safe. Nothing changes politically.',
        longTermEffect: 'Quiet resistance continues. No systemic change. Lives saved.',
        reputationChange: 100,
        npcReactions: [
          {
            npcId: 'chen-wei',
            reactionType: 'positive',
            dialogueChange: 'You protected us. We can continue our work in shadows.',
            trustChange: 2
          },
          {
            npcId: 'senator-hayes',
            reactionType: 'negative',
            dialogueChange: 'Without testimony, nothing will change. Coward.'
          }
        ],
        unlocks: ['network-loyalty', 'ongoing-underground-work']
      }
    ]
  }
];

// ============================================================================
// EXPORTS
// ============================================================================

export const ALL_QUEST_CHAINS = [
  IRON_ROAD_CHAIN,
  JADE_PASSAGE_CHAIN,
  RESCUE_CHAIN,
  DRAMATIC_CHAIN
];

export const ALL_MORAL_CHOICES = [
  ...IRON_ROAD_CHOICES,
  ...DRAMATIC_CHOICES
];

// Chain statistics
export const CHAIN_STATS = {
  totalChains: ALL_QUEST_CHAINS.length,
  totalMoralChoices: ALL_MORAL_CHOICES.length,
  totalEstimatedPlaytime: ALL_QUEST_CHAINS.reduce((sum, chain) => sum + chain.estimatedPlaytime, 0),
  difficultyBreakdown: {
    easy: 0,
    medium: 2,
    hard: 1,
    epic: 1
  }
};
