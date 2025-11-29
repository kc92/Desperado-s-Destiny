/**
 * Mentor Dialogues Data
 * All dialogue content for Hawk (Ezra "Hawk" Hawthorne) - the tutorial mentor
 */

export type MentorExpression =
  | 'neutral'
  | 'teaching'
  | 'warning'
  | 'pleased'
  | 'thinking'
  | 'reminiscing'
  | 'impressed'
  | 'concerned'
  | 'amused'
  | 'urgent';

export interface DialogueLine {
  id: string;
  expression: MentorExpression;
  text: string;
  actionText?: string;
  highlight?: string[];
  delay?: number;
}

export interface DialogueChoice {
  id: string;
  text: string;
  nextDialogueId?: string;
}

export interface TutorialDialogue {
  id: string;
  sectionId: string;
  stepIndex: number;
  lines: DialogueLine[];
  choices?: DialogueChoice[];
  requiresAction?: string;
  actionPrompt?: string;
}

// Mentor character info
export const MENTOR = {
  name: 'Hawk',
  fullName: 'Ezra "Hawk" Hawthorne',
  title: 'Retired Gunslinger',
  portraitBase: '/assets/portraits/mentor/hawk_',
  expressions: [
    'neutral', 'teaching', 'warning', 'pleased', 'thinking',
    'reminiscing', 'impressed', 'concerned', 'amused', 'urgent'
  ] as MentorExpression[],
} as const;

// Get portrait path for expression
export const getMentorPortrait = (expression: MentorExpression): string => {
  return `${MENTOR.portraitBase}${expression}.png`;
};

// All tutorial dialogues organized by section
export const TUTORIAL_DIALOGUES: TutorialDialogue[] = [
  // ============================================
  // SECTION 1: WELCOME & MEET HAWK
  // ============================================
  {
    id: 'welcome-greeting',
    sectionId: 'welcome',
    stepIndex: 0,
    lines: [
      {
        id: 'w1',
        expression: 'neutral',
        actionText: 'An older man in a weathered duster approaches, walking with a mesquite cane. His eyes study you with the kind of attention that misses nothing.',
        text: '',
      },
      {
        id: 'w2',
        expression: 'neutral',
        text: "Well now... another soul wanders into the Sangre Territory.",
      },
      {
        id: 'w3',
        expression: 'teaching',
        text: "Name's Ezra Hawthorne. Folks call me Hawk. Been watching newcomers arrive here for nigh on twenty years now.",
      },
      {
        id: 'w4',
        expression: 'amused',
        text: "Some come seeking fortune. Some running from trouble. Some just drift in like tumbleweeds.",
      },
      {
        id: 'w5',
        expression: 'teaching',
        text: "Listen close now. I'm going to tell you something that might just save your life out here...",
      },
    ],
  },
  {
    id: 'welcome-dashboard',
    sectionId: 'welcome',
    stepIndex: 1,
    lines: [
      {
        id: 'wd1',
        expression: 'teaching',
        text: "This here's your home base. You can see everything important at a glance.",
        highlight: ['[data-tutorial-target="dashboard-stats"]'],
      },
      {
        id: 'wd2',
        expression: 'neutral',
        text: "Your gold, your energy, and how tough you are. Keep an eye on these numbers - they're your lifeline.",
      },
    ],
    requiresAction: 'click-dashboard',
    actionPrompt: 'Click anywhere on the stats panel to continue',
  },
  {
    id: 'welcome-complete',
    sectionId: 'welcome',
    stepIndex: 2,
    lines: [
      {
        id: 'wc1',
        expression: 'pleased',
        text: "Good. You're paying attention. That's the first rule of survival out here.",
      },
      {
        id: 'wc2',
        expression: 'teaching',
        text: "Now, let me tell you about the most important thing in the Sangre Territory...",
      },
    ],
  },

  // ============================================
  // SECTION 2: THE DESTINY DECK REVEALED
  // ============================================
  {
    id: 'deck-intro',
    sectionId: 'destiny_deck',
    stepIndex: 0,
    lines: [
      {
        id: 'dd1',
        expression: 'teaching',
        text: "Every action you take in this territory... every fight, every crime, every gamble... is decided by the **Destiny Deck**.",
      },
      {
        id: 'dd2',
        expression: 'neutral',
        actionText: 'Hawk produces a worn deck of cards from his vest pocket.',
        text: "Fifty-two cards. Five drawn each time. Your fate laid out like a poker hand.",
      },
    ],
  },
  {
    id: 'deck-cards',
    sectionId: 'destiny_deck',
    stepIndex: 1,
    lines: [
      {
        id: 'dc1',
        expression: 'teaching',
        text: "The deck ain't just playing cards - each suit represents a path in life.",
      },
      {
        id: 'dc2',
        expression: 'neutral',
        text: "**Spades** ♠ - Cunning. For the sneaky types. Crimes, stealth, picking locks.",
      },
      {
        id: 'dc3',
        expression: 'neutral',
        text: "**Hearts** ♥ - Spirit. Social skills, medicine, the supernatural.",
      },
      {
        id: 'dc4',
        expression: 'neutral',
        text: "**Clubs** ♣ - Combat. Fighting, shooting, raw power.",
      },
      {
        id: 'dc5',
        expression: 'neutral',
        text: "**Diamonds** ♦ - Craft. Building, trading, making things.",
      },
    ],
  },
  {
    id: 'deck-hands',
    sectionId: 'destiny_deck',
    stepIndex: 2,
    lines: [
      {
        id: 'dh1',
        expression: 'teaching',
        text: "When you draw five cards, they form a poker hand. Better hands mean better results.",
      },
      {
        id: 'dh2',
        expression: 'neutral',
        text: "A **Pair** beats nothing. **Two Pair** beats a Pair. And so on up to a **Royal Flush**.",
      },
      {
        id: 'dh3',
        expression: 'amused',
        text: "Don't worry about memorizing all that. Most times you'll draw a High Card or a Pair. That's normal.",
      },
    ],
  },
  {
    id: 'deck-quiz',
    sectionId: 'destiny_deck',
    stepIndex: 3,
    lines: [
      {
        id: 'dq1',
        expression: 'teaching',
        text: "Let me test your card sense. I'll show you some hands - you tell me what they are.",
      },
      {
        id: 'dq2',
        expression: 'amused',
        text: "Don't fret if you get one wrong. That's how we learn.",
      },
    ],
    requiresAction: 'complete-quiz',
    actionPrompt: 'Answer the quiz questions to continue',
  },
  {
    id: 'deck-threshold',
    sectionId: 'destiny_deck',
    stepIndex: 4,
    lines: [
      {
        id: 'dt1',
        expression: 'teaching',
        text: "Every challenge has a target score. Your hand gives you a base score. Beat the target, you succeed.",
      },
      {
        id: 'dt2',
        expression: 'neutral',
        text: "A Pair might give you 50 points. If the target is 30, you win. If it's 100... well, you need a better hand.",
      },
    ],
  },
  {
    id: 'deck-practice-success',
    sectionId: 'destiny_deck',
    stepIndex: 5,
    lines: [
      {
        id: 'dps1',
        expression: 'teaching',
        text: "Let's see what fate has in store. Draw your cards, partner.",
      },
    ],
    requiresAction: 'draw-cards',
    actionPrompt: 'Click "Draw Cards" to continue',
  },
  {
    id: 'deck-skill-intro',
    sectionId: 'destiny_deck',
    stepIndex: 6,
    lines: [
      {
        id: 'dsi1',
        expression: 'pleased',
        text: "Now here's where it gets interesting...",
      },
      {
        id: 'dsi2',
        expression: 'teaching',
        text: "Your **skills** boost certain suits. Good at fighting? **Clubs** cards count for more. Sneaky type? **Spades** give you an edge.",
      },
      {
        id: 'dsi3',
        expression: 'neutral',
        text: "Right now, you don't have much training. So the cards are fair - neither kind nor cruel.",
      },
      {
        id: 'dsi4',
        expression: 'teaching',
        text: "But watch this... toggle the skill bonus to see the difference training makes.",
      },
    ],
    requiresAction: 'toggle-skills',
    actionPrompt: 'Toggle the skill bonus to see before/after',
  },
  {
    id: 'deck-complete',
    sectionId: 'destiny_deck',
    stepIndex: 7,
    lines: [
      {
        id: 'dco1',
        expression: 'impressed',
        text: "You're catching on quick. The Deck rewards those who understand it.",
      },
      {
        id: 'dco2',
        expression: 'teaching',
        text: "Remember: skills turn bad luck into good results. Train hard, and even a poor hand becomes a winner.",
      },
    ],
  },

  // ============================================
  // SECTION 3: ENERGY - YOUR FRONTIER FUEL
  // ============================================
  {
    id: 'energy-intro',
    sectionId: 'energy',
    stepIndex: 0,
    lines: [
      {
        id: 'e1',
        expression: 'concerned',
        text: "Hold up there, partner. Before you go running off half-cocked, there's something you need to understand.",
        highlight: ['[data-tutorial-target="energy-bar"]'],
      },
      {
        id: 'e2',
        expression: 'teaching',
        text: "See that bar? That's your **Energy**. Every action you take costs some of it.",
      },
    ],
  },
  {
    id: 'energy-explain',
    sectionId: 'energy',
    stepIndex: 1,
    lines: [
      {
        id: 'ee1',
        expression: 'teaching',
        text: "You start each day with **150 Energy**. Shoot a gun? Costs energy. Pick a lock? Energy. Even sweet-talking someone takes effort.",
      },
      {
        id: 'ee2',
        expression: 'neutral',
        text: "When it runs out... well, you're stuck waiting until it comes back.",
      },
    ],
  },
  {
    id: 'energy-regen',
    sectionId: 'energy',
    stepIndex: 2,
    lines: [
      {
        id: 'er1',
        expression: 'pleased',
        text: "Good news is, it regenerates on its own. About **5 points every hour**, even while you sleep.",
      },
      {
        id: 'er2',
        expression: 'teaching',
        text: "Smart folks learn to spend their energy wisely. Don't waste it on small scores when you could save it for the big ones.",
      },
      {
        id: 'er3',
        expression: 'neutral',
        text: "The frontier rewards those who **plan their moves**.",
      },
    ],
  },

  // ============================================
  // SECTION 4: TAKING ACTION
  // ============================================
  {
    id: 'actions-intro',
    sectionId: 'actions',
    stepIndex: 0,
    lines: [
      {
        id: 'a1',
        expression: 'teaching',
        text: "The Bounty Board is where you find work. Jobs, tasks, opportunities - all waiting for someone bold enough to take them.",
        highlight: ['[data-tutorial-target="actions-link"]'],
      },
    ],
    requiresAction: 'navigate-actions',
    actionPrompt: 'Click "Actions" or "Bounty Board" to continue',
  },
  {
    id: 'actions-list',
    sectionId: 'actions',
    stepIndex: 1,
    lines: [
      {
        id: 'al1',
        expression: 'teaching',
        text: "Each action shows what it costs and what it might pay. Pick one that suits you.",
      },
      {
        id: 'al2',
        expression: 'neutral',
        text: "Start easy. No shame in that - even I started sweeping floors back in the day.",
      },
    ],
  },
  {
    id: 'actions-detail',
    sectionId: 'actions',
    stepIndex: 2,
    lines: [
      {
        id: 'ad1',
        expression: 'teaching',
        text: "See the difficulty and the relevant suit? Higher Clubs skills help with combat actions. Spades help with sneaky ones.",
      },
      {
        id: 'ad2',
        expression: 'neutral',
        text: "The Destiny Deck does the rest. Draw your cards and see what fate decides.",
      },
    ],
  },
  {
    id: 'actions-complete',
    sectionId: 'actions',
    stepIndex: 3,
    lines: [
      {
        id: 'ac1',
        expression: 'pleased',
        text: "You've got the hang of actions. In a real job, you'd earn gold and experience.",
      },
      {
        id: 'ac2',
        expression: 'teaching',
        text: "But to really succeed out here, you'll need to train your skills.",
      },
    ],
  },

  // ============================================
  // SECTION 5: SKILLS & SUIT BONUSES
  // ============================================
  {
    id: 'skills-intro',
    sectionId: 'skills',
    stepIndex: 0,
    lines: [
      {
        id: 's1',
        expression: 'teaching',
        text: "Skills are how you improve. Train 'em up, and those Destiny Deck cards start working harder for you.",
        highlight: ['[data-tutorial-target="skills-link"]'],
      },
    ],
    requiresAction: 'navigate-skills',
    actionPrompt: 'Click "Skills" or "The Library" to continue',
  },
  {
    id: 'skills-categories',
    sectionId: 'skills',
    stepIndex: 1,
    lines: [
      {
        id: 'sc1',
        expression: 'teaching',
        text: "Four paths, four suits. Combat skills boost your Clubs cards. Cunning skills boost Spades. You get the picture.",
      },
      {
        id: 'sc2',
        expression: 'neutral',
        text: "Each skill level adds bonus points to matching suit cards. Level 20 Gun Fighting? That's +10 per Club card.",
      },
    ],
  },
  {
    id: 'skills-training',
    sectionId: 'skills',
    stepIndex: 2,
    lines: [
      {
        id: 'st1',
        expression: 'teaching',
        text: "Click a skill to train it. Training takes real time - even happens when you're away.",
      },
      {
        id: 'st2',
        expression: 'pleased',
        text: "Start training now, and come back stronger. That's the way of the frontier.",
      },
    ],
  },

  // ============================================
  // SECTION 6: YOUR FIRST FIGHT
  // ============================================
  {
    id: 'combat-intro',
    sectionId: 'combat',
    stepIndex: 0,
    lines: [
      {
        id: 'c1',
        expression: 'warning',
        text: "The frontier's dangerous. Bandits, outlaws, sometimes even the law itself. You need to know how to fight.",
        highlight: ['[data-tutorial-target="combat-link"]'],
      },
    ],
    requiresAction: 'navigate-combat',
    actionPrompt: 'Click "Combat" to continue',
  },
  {
    id: 'combat-explain',
    sectionId: 'combat',
    stepIndex: 1,
    lines: [
      {
        id: 'ce1',
        expression: 'teaching',
        text: "Combat works same as everything else - Destiny Deck decides. But the stakes are higher.",
      },
      {
        id: 'ce2',
        expression: 'neutral',
        text: "You lose too many rounds, you end up in the **hospital** - or worse. Your cards against theirs. Higher score deals the damage.",
      },
    ],
  },
  {
    id: 'combat-complete',
    sectionId: 'combat',
    stepIndex: 2,
    lines: [
      {
        id: 'cc1',
        expression: 'pleased',
        text: "You can handle yourself in a fight. That's good.",
      },
      {
        id: 'cc2',
        expression: 'teaching',
        text: "Combat's about managing your **HP** - your life force. Take too many hits and you'll wake up in the hospital. Costs time and money.",
      },
    ],
  },

  // ============================================
  // SECTION 7: WELCOME TO THE FRONTIER
  // ============================================
  {
    id: 'complete-farewell',
    sectionId: 'complete',
    stepIndex: 0,
    lines: [
      {
        id: 'f1',
        expression: 'pleased',
        text: "Well now, partner. You made it through your first day in the Sangre Territory. That's more than some can say.",
      },
      {
        id: 'f2',
        expression: 'thinking',
        text: "You've learned how the **Destiny Deck** works. You understand your **Energy** and how precious it is. You've seen how **skills** make all the difference.",
      },
      {
        id: 'f3',
        expression: 'reminiscing',
        text: "I've been in this territory a long time. I've seen good folks turn bad. I've seen bad folks find redemption. And I've seen plenty of both end up in unmarked graves.",
      },
      {
        id: 'f4',
        expression: 'teaching',
        text: "The three factions - **Settlers**, **Coalition**, **Frontera** - they'll all want you to pick a side. That choice is coming.",
      },
      {
        id: 'f5',
        expression: 'neutral',
        text: "I won't tell you which to choose. That's your hand to play. But remember: every choice you make out here has consequences. The territory remembers.",
      },
      {
        id: 'f6',
        expression: 'teaching',
        text: "One last piece of advice: **keep training your skills**. Even while you sleep, they grow. Set one before you log out. Come back tomorrow and you'll be stronger.",
      },
      {
        id: 'f7',
        expression: 'pleased',
        actionText: 'Hawk tips his hat.',
        text: "Now get out there and write your legend. The Sangre Territory is waiting.",
      },
    ],
  },
];

// Get dialogue for a specific section and step
export const getDialogue = (sectionId: string, stepIndex: number): TutorialDialogue | undefined => {
  return TUTORIAL_DIALOGUES.find(
    d => d.sectionId === sectionId && d.stepIndex === stepIndex
  );
};

// Get all dialogues for a section
export const getSectionDialogues = (sectionId: string): TutorialDialogue[] => {
  return TUTORIAL_DIALOGUES.filter(d => d.sectionId === sectionId);
};

// Mentor commentary for practice draws based on hand result
export const DRAW_COMMENTARY: Record<string, DialogueLine[]> = {
  'high_card': [
    {
      id: 'hc1',
      expression: 'thinking',
      text: "High Card - most common result. Skills make these winners.",
    },
  ],
  'pair': [
    {
      id: 'p1',
      expression: 'pleased',
      text: "A Pair! Decent foundation. Count the suits for your bonus.",
    },
  ],
  'two_pair': [
    {
      id: 'tp1',
      expression: 'impressed',
      text: "Two Pair! Now we're talking. That's a solid hand.",
    },
  ],
  'three_of_a_kind': [
    {
      id: 'tok1',
      expression: 'impressed',
      text: "Three of a Kind! The cards are smiling on you today.",
    },
  ],
  'straight': [
    {
      id: 'st1',
      expression: 'pleased',
      text: "A Straight! Five in a row. That takes some luck.",
    },
  ],
  'flush': [
    {
      id: 'fl1',
      expression: 'impressed',
      text: "A Flush! All one suit - and look at those skill bonuses stack up!",
    },
  ],
  'full_house': [
    {
      id: 'fh1',
      expression: 'impressed',
      text: "Full House! That's a rare sight. You've got fate's favor today.",
    },
  ],
  'four_of_a_kind': [
    {
      id: 'fok1',
      expression: 'impressed',
      text: "Four of a Kind! I've only seen that a handful of times in twenty years.",
    },
  ],
  'straight_flush': [
    {
      id: 'sf1',
      expression: 'impressed',
      text: "Straight Flush! The cards themselves are bowing to you, partner.",
    },
  ],
  'royal_flush': [
    {
      id: 'rf1',
      expression: 'impressed',
      text: "Royal Flush! In all my years... the Destiny Deck has chosen you.",
    },
  ],
  'success': [
    {
      id: 'suc1',
      expression: 'pleased',
      text: "Success! In a real challenge, you'd earn gold and XP.",
    },
  ],
  'failure': [
    {
      id: 'fail1',
      expression: 'thinking',
      text: "The cards weren't in your favor this time. That happens to all of us.",
    },
    {
      id: 'fail2',
      expression: 'teaching',
      text: "Remember: skills tip the odds. Train hard, and even bad draws become winners.",
    },
  ],
  'close_failure': [
    {
      id: 'cf1',
      expression: 'concerned',
      text: "So close! Just a few more points would've done it. That's where skills make the difference.",
    },
  ],
};

export default TUTORIAL_DIALOGUES;
