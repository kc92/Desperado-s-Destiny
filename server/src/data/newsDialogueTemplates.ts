import { NewsDialogue, GossipTopic } from '@desperados/shared';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * NEWS DIALOGUE TEMPLATES
 * Dialogue that NPCs use when discussing news and gossip with players
 */

export const NEWS_DIALOGUE_TEMPLATES: NewsDialogue[] = [
  // ============================================================================
  // COMBAT NEWS
  // ============================================================================
  {
    id: 'combat_hero',
    triggeredBy: ['combat'],
    requiredSentiment: ['positive'],
    minNotoriety: 40,

    greeting: "Well, well... if it isn't the famous gunslinger!",

    comments: [
      "Heard you took down those bandits. Impressive work.",
      "The whole town's talking about that shootout.",
      "You handle yourself well in a fight, from what I hear.",
      "People feel safer knowing you're around."
    ],

    questions: [
      {
        question: "Is it true you took on three men at once?",
        topic: 'combat',
        responses: [
          {
            text: "It was four, actually.",
            effect: 'embellish',
            reputationChange: 5
          },
          {
            text: "Just doing what needed to be done.",
            effect: 'confirm',
            reputationChange: 2,
            trustChange: 3
          },
          {
            text: "You shouldn't believe everything you hear.",
            effect: 'deny',
            trustChange: -2
          },
          {
            text: "Let's not talk about it.",
            effect: 'deflect'
          }
        ]
      }
    ],

    npcTypes: ['civilian', 'shopkeeper', 'bartender']
  },

  {
    id: 'combat_fear',
    triggeredBy: ['combat', 'death'],
    requiredSentiment: ['negative', 'shocking'],
    minNotoriety: 60,

    greeting: "*nervously* I... I don't want any trouble.",

    comments: [
      "I heard what you did. Best keep your distance.",
      "People say you're dangerous. Are they right?",
      "The law's asking questions about you.",
      "I got family. Don't want no part of your business."
    ],

    questions: [
      {
        question: "Did you really kill that man in cold blood?",
        topic: 'death',
        responses: [
          {
            text: "He had it coming.",
            effect: 'confirm',
            reputationChange: -5,
            trustChange: -10
          },
          {
            text: "It was self-defense.",
            effect: 'deny',
            trustChange: 5
          },
          {
            text: "That's none of your business.",
            effect: 'deflect',
            trustChange: -2
          }
        ]
      }
    ],

    npcTypes: ['civilian', 'shopkeeper']
  },

  // ============================================================================
  // CRIME NEWS
  // ============================================================================
  {
    id: 'crime_outlaw',
    triggeredBy: ['crime', 'law'],
    requiredSentiment: ['negative'],
    minNotoriety: 50,

    greeting: "Saw your face on a wanted poster.",

    comments: [
      "The law's been asking about you.",
      "Heard you robbed the bank. That true?",
      "You're making quite the reputation as an outlaw.",
      "Sheriffs from three counties want your head."
    ],

    questions: [
      {
        question: "How much is the bounty on you now?",
        topic: 'law',
        responses: [
          {
            text: "More than you'll ever make honest.",
            effect: 'embellish',
            reputationChange: -3
          },
          {
            text: "I'm working on clearing my name.",
            effect: 'deny',
            trustChange: 2
          },
          {
            text: "Wouldn't you like to know.",
            effect: 'deflect'
          }
        ]
      }
    ],

    npcTypes: ['civilian', 'lawman', 'shopkeeper']
  },

  {
    id: 'crime_respect',
    triggeredBy: ['crime'],
    requiredSentiment: ['positive', 'shocking'],
    minNotoriety: 40,

    comments: [
      "Heard about that heist. Slick work.",
      "They say you got away with a fortune.",
      "The bank's still reeling from what you did.",
      "You've got guts, I'll give you that."
    ],

    questions: [
      {
        question: "How'd you pull it off without getting caught?",
        topic: 'crime',
        responses: [
          {
            text: "Planning and patience.",
            effect: 'confirm',
            reputationChange: 5,
            trustChange: 2
          },
          {
            text: "A magician never reveals their secrets.",
            effect: 'deflect'
          },
          {
            text: "Wrong person, friend.",
            effect: 'deny',
            trustChange: -5
          }
        ]
      }
    ],

    npcTypes: ['criminal', 'fence', 'gambler']
  },

  // ============================================================================
  // HEROISM NEWS
  // ============================================================================
  {
    id: 'heroism_admiration',
    triggeredBy: ['heroism'],
    requiredSentiment: ['positive'],
    minNotoriety: 30,

    greeting: "You're the one who saved those folks! Thank you!",

    comments: [
      "You're a real hero. Town owes you.",
      "What you did took real courage.",
      "We need more people like you around here.",
      "My family was in that building. You saved them."
    ],

    questions: [
      {
        question: "Weren't you afraid when you went in there?",
        topic: 'heroism',
        responses: [
          {
            text: "No time to be afraid.",
            effect: 'confirm',
            reputationChange: 5,
            trustChange: 5
          },
          {
            text: "Anyone would have done the same.",
            effect: 'deflect',
            trustChange: 3
          },
          {
            text: "Of course I was afraid.",
            effect: 'confirm',
            trustChange: 8
          }
        ]
      }
    ],

    npcTypes: ['civilian', 'shopkeeper', 'bartender', 'settler']
  },

  // ============================================================================
  // SUPERNATURAL NEWS
  // ============================================================================
  {
    id: 'supernatural_curiosity',
    triggeredBy: ['supernatural'],
    requiredSentiment: ['shocking', 'neutral'],

    comments: [
      "People say you've seen strange things.",
      "Is it true about the ghost train?",
      "They say you survived the haunted mine.",
      "Some folks think you're cursed."
    ],

    questions: [
      {
        question: "Did you really see something supernatural out there?",
        topic: 'supernatural',
        responses: [
          {
            text: "I saw things I can't explain.",
            effect: 'confirm',
            reputationChange: 3
          },
          {
            text: "Just tricks of the mind.",
            effect: 'deny',
            trustChange: -3
          },
          {
            text: "You wouldn't believe me if I told you.",
            effect: 'deflect'
          },
          {
            text: "Yes, and it was terrifying.",
            effect: 'embellish',
            reputationChange: 8
          }
        ]
      }
    ],

    npcTypes: ['civilian', 'mystic', 'scholar', 'shaman']
  },

  // ============================================================================
  // GANG NEWS
  // ============================================================================
  {
    id: 'gang_member',
    triggeredBy: ['gang', 'faction'],
    requiredSentiment: ['negative', 'neutral'],

    comments: [
      "Heard you joined up with a gang.",
      "They say you're running with outlaws now.",
      "Your gang's been making trouble.",
      "Which side are you on in all this?"
    ],

    questions: [
      {
        question: "Why'd you throw in with that gang?",
        topic: 'gang',
        responses: [
          {
            text: "They're family now.",
            effect: 'confirm',
            reputationChange: -5,
            trustChange: 5
          },
          {
            text: "I needed protection.",
            effect: 'confirm',
            trustChange: 2
          },
          {
            text: "I haven't joined any gang.",
            effect: 'deny',
            trustChange: -3
          },
          {
            text: "That's gang business.",
            effect: 'deflect'
          }
        ]
      }
    ],

    npcTypes: ['civilian', 'lawman', 'criminal']
  },

  // ============================================================================
  // DUEL NEWS
  // ============================================================================
  {
    id: 'duel_winner',
    triggeredBy: ['duel'],
    requiredSentiment: ['positive', 'shocking'],

    greeting: "Heard you won that duel. Fast draw.",

    comments: [
      "People are saying you're one of the fastest.",
      "That duel is all anyone's talking about.",
      "The other fellow never stood a chance, did he?",
      "You've got a reputation as a duelist now."
    ],

    questions: [
      {
        question: "How fast are you on the draw?",
        topic: 'duel',
        responses: [
          {
            text: "Fast enough.",
            effect: 'deflect',
            trustChange: 2
          },
          {
            text: "Fastest in the territory.",
            effect: 'embellish',
            reputationChange: 5
          },
          {
            text: "I don't like to talk about it.",
            effect: 'deflect',
            trustChange: 3
          }
        ]
      }
    ],

    npcTypes: ['civilian', 'gambler', 'gunslinger']
  },

  // ============================================================================
  // SCANDAL NEWS
  // ============================================================================
  {
    id: 'scandal_gossip',
    triggeredBy: ['scandal', 'romance'],
    requiredSentiment: ['shocking', 'neutral'],

    comments: [
      "Everyone's talking about you and... well, you know.",
      "The scandal has people talking.",
      "I heard about your... situation. None of my business, but...",
      "People have opinions about what you did."
    ],

    questions: [
      {
        question: "Is it true what they're saying about you?",
        topic: 'scandal',
        responses: [
          {
            text: "Every word.",
            effect: 'confirm',
            reputationChange: -3
          },
          {
            text: "People exaggerate.",
            effect: 'deny',
            trustChange: 2
          },
          {
            text: "That's private.",
            effect: 'deflect'
          },
          {
            text: "Worse than they're saying.",
            effect: 'embellish',
            reputationChange: -8
          }
        ]
      }
    ],

    npcTypes: ['civilian', 'bartender', 'shopkeeper']
  },

  // ============================================================================
  // TREASURE NEWS
  // ============================================================================
  {
    id: 'treasure_found',
    triggeredBy: ['treasure', 'business'],
    requiredSentiment: ['positive', 'shocking'],

    comments: [
      "Word is you found treasure out there.",
      "People say you're rich now.",
      "Heard about your big find. Lucky you.",
      "Everyone's looking for what you found."
    ],

    questions: [
      {
        question: "Where exactly did you find it?",
        topic: 'treasure',
        responses: [
          {
            text: "That's staying my secret.",
            effect: 'deflect'
          },
          {
            text: "Old mine up north. Lots more there.",
            effect: 'embellish',
            reputationChange: 5
          },
          {
            text: "Just got lucky.",
            effect: 'confirm',
            trustChange: 2
          },
          {
            text: "I didn't find anything.",
            effect: 'deny',
            trustChange: -5
          }
        ]
      }
    ],

    npcTypes: ['civilian', 'prospector', 'businessman']
  },

  // ============================================================================
  // TERRITORY NEWS
  // ============================================================================
  {
    id: 'territory_war',
    triggeredBy: ['territory', 'faction'],
    requiredSentiment: ['negative', 'shocking'],

    comments: [
      "Things are heating up around here.",
      "Territory's not safe anymore.",
      "War's coming. You can feel it.",
      "Best pick a side before someone picks for you."
    ],

    questions: [
      {
        question: "Which faction will you side with?",
        topic: 'faction',
        responses: [
          {
            text: "I'm with [Faction].",
            effect: 'confirm',
            reputationChange: 5
          },
          {
            text: "Staying neutral.",
            effect: 'deflect'
          },
          {
            text: "I side with whoever pays best.",
            effect: 'confirm',
            reputationChange: -3
          }
        ]
      }
    ],

    npcTypes: ['civilian', 'soldier', 'faction_member']
  }
];

/**
 * Get dialogue for NPC based on gossip they know
 */
export function getNewsDialogue(
  topics: GossipTopic[],
  sentiment: ('positive' | 'negative' | 'neutral' | 'shocking')[],
  notoriety: number,
  npcType: string
): NewsDialogue | null {
  // Find matching dialogues
  const matches = NEWS_DIALOGUE_TEMPLATES.filter(dialogue => {
    // Check NPC type
    if (!dialogue.npcTypes.includes(npcType)) {
      return false;
    }

    // Check topics
    const hasTopicMatch = dialogue.triggeredBy.some(t => topics.includes(t));
    if (!hasTopicMatch) {
      return false;
    }

    // Check sentiment if required
    if (dialogue.requiredSentiment) {
      const hasSentimentMatch = dialogue.requiredSentiment.some(s =>
        sentiment.includes(s)
      );
      if (!hasSentimentMatch) {
        return false;
      }
    }

    // Check notoriety
    if (dialogue.minNotoriety && notoriety < dialogue.minNotoriety) {
      return false;
    }

    return true;
  });

  if (matches.length === 0) return null;

  // Return random match
  return SecureRNG.select(matches);
}

/**
 * Get random comment from dialogue
 */
export function getRandomComment(dialogue: NewsDialogue): string {
  if (dialogue.comments.length === 0) return '';
  return SecureRNG.select(dialogue.comments);
}

/**
 * Get random question from dialogue
 */
export function getRandomQuestion(dialogue: NewsDialogue) {
  if (dialogue.questions.length === 0) return null;
  return SecureRNG.select(dialogue.questions);
}
