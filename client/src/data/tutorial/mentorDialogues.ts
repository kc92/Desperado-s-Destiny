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
  // SETTLER INTRO
  // ============================================
  {
    id: 'settler-welcome',
    sectionId: 'intro_settler',
    stepIndex: 0,
    lines: [
      { id: 'sw1', expression: 'neutral', text: "I see the badge. Settler Alliance." },
      { id: 'sw2', expression: 'teaching', text: "Bringing law to the lawless. It's a tall order, partner, but someone's got to do it." },
      { id: 'sw3', expression: 'neutral', text: "Governor Cross has been asking about you. Wants to know if you can handle yourself." }
    ]
  },
  {
    id: 'settler-zone',
    sectionId: 'intro_settler',
    stepIndex: 1,
    lines: [
      { id: 'sz1', expression: 'teaching', text: "This here is **Settler Territory**. The Alliance's foothold in the frontier." },
      { id: 'sz2', expression: 'neutral', text: "Red Gulch is the heart of it—law, order, commerce. Everything the Governor's building." },
      { id: 'sz3', expression: 'warning', text: "But step beyond these borders and the rules change. The frontier doesn't care about badges." }
    ]
  },
  {
    id: 'settler-task',
    sectionId: 'intro_settler',
    stepIndex: 2,
    lines: [
      { id: 'st1', expression: 'urgent', text: "We've got reports of activity near the Western Outpost." },
      { id: 'st2', expression: 'teaching', text: "Head out there. Secure the perimeter. Make sure our supply lines are safe." }
    ]
  },
  {
    id: 'settler-check',
    sectionId: 'intro_settler',
    stepIndex: 3,
    lines: [
      { id: 'sc1', expression: 'neutral', text: "Keep your eyes open. The desert has a way of hiding things until it's too late." }
    ]
  },
  {
    id: 'settler-complete',
    sectionId: 'intro_settler',
    stepIndex: 4,
    lines: [
      { id: 'sco1', expression: 'pleased', text: "Perimeter's secure. Good work." },
      { id: 'sco2', expression: 'teaching', text: "The Governor will hear of this. You've proven you can follow orders." },
      { id: 'sco3', expression: 'neutral', text: "But out here, you'll need more than orders. You'll need instinct." }
    ]
  },

  // ============================================
  // NAHI INTRO
  // ============================================
  {
    id: 'nahi-welcome',
    sectionId: 'intro_nahi',
    stepIndex: 0,
    lines: [
      { id: 'nw1', expression: 'neutral', text: "You walk with the Coalition. Good." },
      { id: 'nw2', expression: 'teaching', text: "The land speaks to those who listen. But lately, it's screaming." },
      { id: 'nw3', expression: 'concerned', text: "Elder Wise Sky says the balance is shifting." }
    ]
  },
  {
    id: 'nahi-zone',
    sectionId: 'intro_nahi',
    stepIndex: 1,
    lines: [
      { id: 'nz1', expression: 'teaching', text: "These are the **Coalition Lands**. Sacred ground. Ancient ground." },
      { id: 'nz2', expression: 'neutral', text: "Kaiowa Mesa has watched over the valley for a thousand generations." },
      { id: 'nz3', expression: 'warning', text: "The settlers call our territory 'unclaimed.' The land knows better. And so will they." }
    ]
  },
  {
    id: 'nahi-task',
    sectionId: 'intro_nahi',
    stepIndex: 2,
    lines: [
      { id: 'nt1', expression: 'urgent', text: "Intruders have been spotted near Sacred Springs." },
      { id: 'nt2', expression: 'teaching', text: "Go there. Scout the area. Protect the sacred waters from defilement." }
    ]
  },
  {
    id: 'nahi-check',
    sectionId: 'intro_nahi',
    stepIndex: 3,
    lines: [
      { id: 'nc1', expression: 'neutral', text: "Walk softly. We are guardians, not conquerors." }
    ]
  },
  {
    id: 'nahi-complete',
    sectionId: 'intro_nahi',
    stepIndex: 4,
    lines: [
      { id: 'nco1', expression: 'pleased', text: "The springs are safe. The ancestors will be pleased." },
      { id: 'nco2', expression: 'teaching', text: "You moved like shadow, struck like wind. This is the Coalition way." },
      { id: 'nco3', expression: 'neutral', text: "The elders have noticed you. That is both honor and burden." }
    ]
  },

  // ============================================
  // FRONTERA INTRO
  // ============================================
  {
    id: 'frontera-welcome',
    sectionId: 'intro_frontera',
    stepIndex: 0,
    lines: [
      { id: 'fw1', expression: 'amused', text: "Frontera, eh? You like living dangerously." },
      { id: 'fw2', expression: 'teaching', text: "No laws out here but the ones you make yourself. And the ones you can enforce." },
      { id: 'fw3', expression: 'neutral', text: "El Rey has a job for you. Don't disappoint him." }
    ]
  },
  {
    id: 'frontera-zone',
    sectionId: 'intro_frontera',
    stepIndex: 1,
    lines: [
      { id: 'fz1', expression: 'teaching', text: "Welcome to **Outlaw Territory**. The only law here is what you can take and hold." },
      { id: 'fz2', expression: 'amused', text: "The Frontera runs the underground. Smuggling, gambling, information—if it's illegal, we move it." },
      { id: 'fz3', expression: 'warning', text: "Cross El Rey and you'll disappear. Stay loyal and you'll live like a king. Simple as that." }
    ]
  },
  {
    id: 'frontera-task',
    sectionId: 'intro_frontera',
    stepIndex: 2,
    lines: [
      { id: 'ft1', expression: 'neutral', text: "There's a package needs moving. Quiet like." },
      { id: 'ft2', expression: 'teaching', text: "Take it to the Smuggler's Den. And don't let anyone see you." }
    ]
  },
  {
    id: 'frontera-check',
    sectionId: 'intro_frontera',
    stepIndex: 3,
    lines: [
      { id: 'fc1', expression: 'warning', text: "Watch your back. In this line of work, friends are just enemies who haven't betrayed you yet." }
    ]
  },
  {
    id: 'frontera-complete',
    sectionId: 'intro_frontera',
    stepIndex: 4,
    lines: [
      { id: 'fco1', expression: 'pleased', text: "Package delivered. Clean job. El Rey will be pleased." },
      { id: 'fco2', expression: 'teaching', text: "You've got the instincts for this life. Quick hands, quiet feet, cold nerve." },
      { id: 'fco3', expression: 'amused', text: "Welcome to the family. Don't make me regret saying that." }
    ]
  },

  // ============================================
  // COMBAT BASICS (SHARED)
  // ============================================
  {
    id: 'combat-ambush',
    sectionId: 'combat_basics',
    stepIndex: 0,
    lines: [
      { id: 'ca1', expression: 'warning', actionText: 'A figure steps out from the shadows, weapon drawn!', text: "Look out! Ambush!" },
      { id: 'ca2', expression: 'urgent', text: "They must have been waiting for you. No time for talk—draw!" }
    ]
  },
  {
    id: 'deck-intro-combat',
    sectionId: 'combat_basics',
    stepIndex: 1,
    lines: [
      { id: 'dic1', expression: 'teaching', text: "This is it. Life or death. The **Destiny Deck** decides who walks away." },
      { id: 'dic2', expression: 'neutral', text: "Five cards. **Clubs** boost your attack. **Spades** help you dodge." },
      { id: 'dic3', expression: 'teaching', text: "Draw well, partner." }
    ]
  },
  {
    id: 'combat-start',
    sectionId: 'combat_basics',
    stepIndex: 2,
    lines: [
      { id: 'cs1', expression: 'urgent', text: "Show them what you're made of!" }
    ]
  },
  {
    id: 'combat-victory',
    sectionId: 'combat_basics',
    stepIndex: 3,
    lines: [
      { id: 'cv1', expression: 'pleased', text: "Nice shooting. You handled that better than I expected." },
      { id: 'cv2', expression: 'teaching', text: "Don't forget to loot the body. It's the law of the west—to the victor go the spoils." }
    ]
  },

  // ============================================
  // DESTINY DECK QUIZ (SHARED)
  // ============================================
  {
    id: 'quiz-intro',
    sectionId: 'destiny_deck_quiz',
    stepIndex: 0,
    lines: [
      { id: 'qi1', expression: 'thinking', text: "Hold up. Before we go any further, I want to make sure you understand the Destiny Deck." },
      { id: 'qi2', expression: 'teaching', text: "The deck is the key to everything in the frontier—combat, jobs, crafting, all of it." },
      { id: 'qi3', expression: 'amused', text: "Time for a quick pop quiz. Don't worry, I won't shoot you if you get one wrong." }
    ]
  },
  {
    id: 'quiz-start',
    sectionId: 'destiny_deck_quiz',
    stepIndex: 1,
    lines: [
      { id: 'qs1', expression: 'neutral', text: "Answer these questions about poker hands. Show me you've been paying attention." }
    ]
  },
  {
    id: 'quiz-complete',
    sectionId: 'destiny_deck_quiz',
    stepIndex: 2,
    lines: [
      { id: 'qc1', expression: 'impressed', text: "Well done! You know your hands better than most greenhorns." },
      { id: 'qc2', expression: 'pleased', text: "That knowledge will serve you well. Now let's put it to practical use." }
    ]
  },

  // ============================================
  // ECONOMY BASICS (SHARED)
  // ============================================
  {
    id: 'eco-intro',
    sectionId: 'economy_basics',
    stepIndex: 0,
    lines: [
      { id: 'ei1', expression: 'thinking', text: "That fight took a toll. Bullets aren't free, and neither is repair work." },
      { id: 'ei2', expression: 'teaching', text: "You need resources. The war machine runs on iron, wood, and gold." }
    ]
  },
  {
    id: 'eco-mine-task',
    sectionId: 'economy_basics',
    stepIndex: 1,
    lines: [
      { id: 'emt1', expression: 'neutral', text: "There's an old mine nearby. Still has some good veins if you know where to look." },
      { id: 'emt2', expression: 'teaching', text: "Head to the **Abandoned Mine**. Let's get you set up." }
    ]
  },
  {
    id: 'eco-mine-action',
    sectionId: 'economy_basics',
    stepIndex: 2,
    lines: [
      { id: 'ema1', expression: 'teaching', text: "Grab a pickaxe. Mining takes **Energy**, just like fighting." },
      { id: 'ema2', expression: 'thinking', text: "Now, about those **suits** on your cards. Each one ties to a different skill type:" },
      { id: 'ema3', expression: 'teaching', text: "**♠ Spades** boost Cunning skills—thieving, stealth, deception." },
      { id: 'ema4', expression: 'teaching', text: "**♥ Hearts** boost Spirit—social charm, healing, leadership." },
      { id: 'ema5', expression: 'teaching', text: "**♣ Clubs** boost Combat—shooting, brawling, defense." },
      { id: 'ema6', expression: 'teaching', text: "**♦ Diamonds** boost Craft—mining, smithing, gathering." },
      { id: 'ema7', expression: 'impressed', text: "Since you're mining, those **Diamonds** in your hand will give you a bonus. The higher your Mining skill, the bigger the bonus per Diamond." }
    ]
  },
  {
    id: 'eco-refine-intro',
    sectionId: 'economy_basics',
    stepIndex: 3,
    lines: [
      { id: 'eri1', expression: 'neutral', text: "Raw ore is heavy and cheap. Ingots are useful and expensive." },
      { id: 'eri2', expression: 'teaching', text: "Let's find a smelter and refine that ore." }
    ]
  },
  {
    id: 'eco-craft-ingot',
    sectionId: 'economy_basics',
    stepIndex: 4,
    lines: [
      { id: 'eci1', expression: 'pleased', text: "Fire and iron. That's how you build a future out here." }
    ]
  },

  // ============================================
  // PROGRESSION SYSTEM (SHARED)
  // ============================================
  {
    id: 'prog-intro',
    sectionId: 'progression_system',
    stepIndex: 0,
    lines: [
      { id: 'pi1', expression: 'impressed', text: "You've fought, you've mined, you've survived." },
      { id: 'pi2', expression: 'teaching', text: "But you're still green. If you want to become a legend, you need to **train**." }
    ]
  },
  {
    id: 'prog-select',
    sectionId: 'progression_system',
    stepIndex: 1,
    lines: [
      { id: 'ps1', expression: 'teaching', text: "Open your skill book. Gun Fighting, Mining, Stealth... pick your path." }
    ]
  },
  {
    id: 'prog-train',
    sectionId: 'progression_system',
    stepIndex: 2,
    lines: [
      { id: 'pt1', expression: 'urgent', text: "Don't just stand there! Queue a skill!" },
      { id: 'pt2', expression: 'neutral', text: "It trains while you sleep. Never let a minute go to waste." }
    ]
  },
  {
    id: 'prog-farewell',
    sectionId: 'progression_system',
    stepIndex: 3,
    lines: [
      { id: 'pf1', expression: 'pleased', text: "You're on your way now." },
      { id: 'pf2', expression: 'teaching', text: "The Sangre Territory is yours to shape. Will you be a savior? A tyrant? A ghost?" },
      { id: 'pf3', expression: 'neutral', actionText: 'Hawk turns to leave, disappearing into the dust.', text: "The cards will decide. Good luck, partner." }
    ]
  }
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

export default TUTORIAL_DIALOGUES;