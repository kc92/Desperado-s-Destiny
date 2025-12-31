/**
 * Deity Dialogue Service
 *
 * Generates cryptic, thematic messages from the two hidden deities.
 * Messages are context-aware, responding to player karma state and actions.
 *
 * Key principles:
 * - Deities NEVER reveal their true nature directly
 * - The Gambler speaks in gambling metaphors, fate, cards, dice
 * - The Outlaw King speaks in fire, chains, freedom, wild imagery
 * - Messages range from cryptic hints to direct warnings
 */

import { KarmaDimension, IKarmaValues } from '../models/CharacterKarma.model';
import { ManifestationType, DeityName } from '../models/DivineManifestation.model';
import { SecureRNG } from './base/SecureRNG';

// ============================================================================
// DIALOGUE TEMPLATES
// ============================================================================

interface IDialogueTemplate {
  text: string;
  triggers?: {
    dimension?: KarmaDimension;
    minAffinity?: number;
    maxAffinity?: number;
    manifestationType?: ManifestationType;
  };
}

// The Gambler's voice - cryptic, measured, fate-obsessed
const GAMBLER_DIALOGUES: Record<string, IDialogueTemplate[]> = {
  // Dream manifestations
  DREAM: [
    { text: "In the endless game, you are but one card among millions. Yet even the lowliest card can decide the final hand." },
    { text: "I watched you shuffle through another day. The deck grows thinner. When will you play your ace?" },
    { text: "There is a table where all debts are settled. You've been dealt in, whether you know it or not." },
    { text: "The house always wins, they say. But the house is just another player. And every player bleeds." },
    { text: "Do you feel it? The weight of your hand? Some cards you chose. Others chose you." },
    { text: "In dreams, I count the cards you've played. Honor. Mercy. Justice. A promising hand... or a fool's gamble?" },
    { text: "The moon tonight is a silver dollar. Bet it all or fold. There is no middle ground." }
  ],

  // Whisper manifestations - internal intuition
  WHISPER: [
    { text: "The odds favor the prepared mind." },
    { text: "This hand feels wrong. Fold." },
    { text: "A tell. Watch for it." },
    { text: "Double down. Now." },
    { text: "The deck remembers what you've done." },
    { text: "Luck is the residue of design." },
    { text: "Someone is counting cards. And it isn't you." },
    { text: "Trust the river. It knows where it flows." }
  ],

  // Omen manifestations - environmental signs
  OMEN: [
    { text: "A four-leaf clover crushed beneath your boot. Was it luck? Or a warning?" },
    { text: "The cards in that stranger's pocket are marked. But then, so are yours." },
    { text: "Seven magpies on a fence post. The old folk say that means a secret." },
    { text: "Your shadow fell on snake eyes today. The dice are watching." },
    { text: "A coin lands on its edge. Impossible? Or inevitable?" },
    { text: "The wind carries the scent of gunpowder and roses. An ending approaches." }
  ],

  // Stranger manifestations - disguised encounters
  STRANGER: [
    { text: "Care for a game, stranger? The stakes are... negotiable." },
    { text: "You play cards like you live your life. All in or nothing. Admirable. Foolish. Both." },
    { text: "I've seen your kind before. Walking the line between fortune and ruin." },
    { text: "The house appreciates a good sport. Win or lose, you play with style." },
    { text: "Let me tell you about a man I once knew. Played an honest game in a crooked world. Care to guess how it ended?" }
  ],

  // Phenomenon manifestations - strange events
  PHENOMENON: [
    { text: "A deck of cards scatters in the wind. Every card is the Ace of Spades." },
    { text: "Your coin purse feels heavier. When you check, there's exactly one gold piece more than before." },
    { text: "Lightning strikes twice in the same spot. Then a third time. Then it stops." },
    { text: "Every clock in town stops at the same moment. Then they all start again." }
  ],

  // Blessing messages
  BLESSING_HONOR: [
    { text: "You've kept your word when breaking it would have been easier. The scales notice." },
    { text: "Honor in a dishonorable world is the rarest card. You hold it well." }
  ],
  BLESSING_JUSTICE: [
    { text: "Justice is a game with no cheating allowed. You play it true." },
    { text: "The law is a rigged deck, but you've found ways to deal it fair." }
  ],
  BLESSING_MERCY: [
    { text: "Mercy is the highest card in any hand. You played it when you didn't have to." },
    { text: "The house favors those who know when not to collect their winnings." }
  ],
  BLESSING_DEFAULT: [
    { text: "Fortune favors you today. Don't waste it." },
    { text: "The dice roll in your favor. For now." }
  ],

  // Curse messages
  CURSE_CHAOS: [
    { text: "Chaos is not a strategy. It's surrender. And surrenderers lose." },
    { text: "You've upset the table. Now the cards are scattered, and none of them like you." }
  ],
  CURSE_DECEPTION: [
    { text: "Liars are poor gamblers. The truth always comes up eventually." },
    { text: "Your tells are showing. Everyone can see them now." }
  ],
  CURSE_DEFAULT: [
    { text: "The house has noticed your debts. Collection is coming." },
    { text: "Your luck has run out. The only question is how far you'll fall." }
  ]
};

// The Outlaw King's voice - wild, mocking, fierce
const OUTLAW_KING_DIALOGUES: Record<string, IDialogueTemplate[]> = {
  // Dream manifestations
  DREAM: [
    { text: "I rode with you in your dreams tonight. Through fire and chaos. You didn't flinch. Good." },
    { text: "Chains, chains everywhere. On your wrists, your ankles, your mind. When will you break them?" },
    { text: "In your dreams you're still locked in that cage. Wake up. The door was never locked." },
    { text: "I showed you the bonfire where all laws burn. Did you feel the heat? Or did you look away?" },
    { text: "There's a crown made of bullets waiting for someone. In your dreams, I saw you reach for it." },
    { text: "The badge-wearers chased you through fire and dust. And you laughed. I laughed with you." }
  ],

  // Whisper manifestations
  WHISPER: [
    { text: "Break it." },
    { text: "Run. Now." },
    { text: "They can't cage what they can't catch." },
    { text: "Let it burn." },
    { text: "No one's watching. Do it." },
    { text: "Rules are for the afraid." },
    { text: "What's the worst that could happen? Freedom." },
    { text: "The key is in your pocket. Always was." }
  ],

  // Omen manifestations
  OMEN: [
    { text: "A wild horse breaks free from a corral. It runs straight toward you, then past you. A message." },
    { text: "A wanted poster bears your face. But the eyes are wrong. They're smiling." },
    { text: "Crows circle overhead. Seven of them. They're laughing at something." },
    { text: "A chain rusts and breaks while you watch. Nothing touched it." },
    { text: "Fire starts in an empty building. No one set it. No one stops it." },
    { text: "A badge falls from a lawman's chest into the mud. He doesn't notice." }
  ],

  // Stranger manifestations
  STRANGER: [
    { text: "You've got the look of someone who's had enough. Had enough of rules, enough of waiting. Am I wrong?" },
    { text: "I knew a man once. Followed every law, paid every tax, tipped his hat to every sheriff. Know what happened? They hanged him anyway. Laws protect the lawmakers, friend. Not you." },
    { text: "That fire in your eyes... I've seen it before. In men who broke their chains and never looked back." },
    { text: "Freedom tastes like gunpowder and whiskey. Have you tasted it yet?" }
  ],

  // Animal manifestations
  ANIMAL: [
    { text: "A wolf watches you from the treeline. It doesn't flee. It nods, once, and vanishes." },
    { text: "A raven drops a brass key at your feet. It fits no lock you know of." },
    { text: "Wild horses part around you like water. They recognize their own." },
    { text: "A rattlesnake coils but doesn't strike. It's waiting for something." }
  ],

  // Phenomenon manifestations
  PHENOMENON: [
    { text: "Every lantern in town flickers red for a heartbeat. No one else seems to notice." },
    { text: "Your wanted poster catches fire. It burns your name clean off." },
    { text: "Lightning strikes a gallows, splitting it in two. The next hanging is canceled." },
    { text: "A jail cell door swings open. There's no one inside. There was a moment ago." }
  ],

  // Blessing messages
  BLESSING_CHAOS: [
    { text: "You've embraced the storm. Now ride it." },
    { text: "Chaos isn't destruction. It's potential. And you've got plenty." }
  ],
  BLESSING_SURVIVAL: [
    { text: "You refuse to die. I respect that more than you know." },
    { text: "Survival is the first freedom. You've earned the rest." }
  ],
  BLESSING_DECEPTION: [
    { text: "Every lie is a door. You've opened many. Walk through." },
    { text: "The truth is a chain. Your lies have set you free." }
  ],
  BLESSING_DEFAULT: [
    { text: "The wild road opens before you. Run." },
    { text: "You're one of mine now. Act like it." }
  ],

  // Curse messages
  CURSE_JUSTICE: [
    { text: "Law-lover. Badge-licker. The wild things despise you." },
    { text: "You chose their rules over your freedom. Enjoy your cage." }
  ],
  CURSE_HONOR: [
    { text: "Honor is a leash. You've choked yourself with it." },
    { text: "Your precious honor will get you killed. And I'll watch." }
  ],
  CURSE_DEFAULT: [
    { text: "Cowardice has a smell. You reek of it." },
    { text: "The wild things have marked you. Prey." }
  ]
};

// ============================================================================
// DIALOGUE SERVICE CLASS
// ============================================================================

class DeityDialogueService {
  /**
   * Generate a dialogue message from a deity
   */
  generateMessage(
    deity: DeityName,
    manifestationType: ManifestationType,
    context: {
      karma?: IKarmaValues;
      affinity?: number;
      triggerDimension?: KarmaDimension;
      isBlessing?: boolean;
      isCurse?: boolean;
    } = {}
  ): string {
    const dialogues = deity === 'GAMBLER' ? GAMBLER_DIALOGUES : OUTLAW_KING_DIALOGUES;

    // Determine which template set to use
    // Type-safe helper to check if a key exists in the dialogues
    const getDialogueTemplates = (key: string): IDialogueTemplate[] | undefined => {
      return dialogues[key];
    };

    let templateKey: string = manifestationType;

    if (context.isBlessing && context.triggerDimension) {
      const blessingKey = `BLESSING_${context.triggerDimension}`;
      if (getDialogueTemplates(blessingKey)) {
        templateKey = blessingKey;
      } else {
        templateKey = 'BLESSING_DEFAULT';
      }
    } else if (context.isCurse && context.triggerDimension) {
      const curseKey = `CURSE_${context.triggerDimension}`;
      if (getDialogueTemplates(curseKey)) {
        templateKey = curseKey;
      } else {
        templateKey = 'CURSE_DEFAULT';
      }
    }

    const templates = getDialogueTemplates(templateKey) || dialogues.WHISPER;

    // Filter templates by affinity if specified
    let filteredTemplates = templates;
    if (context.affinity !== undefined) {
      filteredTemplates = templates.filter(t => {
        if (t.triggers?.minAffinity && context.affinity! < t.triggers.minAffinity) return false;
        if (t.triggers?.maxAffinity && context.affinity! > t.triggers.maxAffinity) return false;
        return true;
      });
      if (filteredTemplates.length === 0) {
        filteredTemplates = templates;
      }
    }

    // Select random template
    const template = SecureRNG.select(filteredTemplates);

    // Apply variable substitution if karma values provided
    let message = template.text;
    if (context.karma) {
      message = this.applyKarmaSubstitutions(message, context.karma);
    }

    return message;
  }

  /**
   * Generate a complete manifestation message with wrapper
   */
  generateManifestationMessage(
    deity: DeityName,
    manifestationType: ManifestationType,
    context: {
      karma?: IKarmaValues;
      affinity?: number;
      triggerDimension?: KarmaDimension;
      isBlessing?: boolean;
      isCurse?: boolean;
    } = {}
  ): {
    message: string;
    wrapper: string;
  } {
    const coreMessage = this.generateMessage(deity, manifestationType, context);
    const wrapper = this.getManifestationWrapper(deity, manifestationType);

    return {
      message: coreMessage,
      wrapper
    };
  }

  /**
   * Get a wrapper description for how the message is delivered
   */
  private getManifestationWrapper(deity: DeityName, type: ManifestationType): string {
    const wrappers: Record<DeityName, Record<string, string[]>> = {
      GAMBLER: {
        DREAM: [
          "You wake from a dream of infinite card tables, the click of chips still echoing...",
          "In your sleep, a voice like shuffling cards spoke...",
          "The dream fades but the message remains, written in fading playing cards..."
        ],
        WHISPER: [
          "A voice, like cards being dealt, speaks from nowhere...",
          "You hear it in the space between heartbeats...",
          "The thought arrives unbidden, certain as a dealt ace..."
        ],
        OMEN: [
          "You notice something that shouldn't be there...",
          "A sign appears, clear as day...",
          "The world sends a message..."
        ],
        STRANGER: [
          "A weathered stranger approaches, cards in hand...",
          "Someone you've never seen before meets your eye...",
          "A traveling card dealer blocks your path..."
        ],
        PHENOMENON: [
          "Something impossible happens before your eyes...",
          "Reality bends, just for a moment...",
          "The laws of chance break themselves..."
        ],
        BLESSING: [
          "A warmth spreads through you, like a winning hand dealt to your soul...",
          "Fortune's favor settles upon you like morning dew...",
          "The universe adjusts itself in your favor..."
        ],
        CURSE: [
          "A coldness grips your heart, like the last card in a losing hand...",
          "You feel the scales tip against you...",
          "Lady Luck averts her gaze..."
        ]
      },
      OUTLAW_KING: {
        DREAM: [
          "You wake gasping, the smell of gunsmoke and freedom still in your nostrils...",
          "The dream burns away like a wanted poster in flames...",
          "Wild laughter echoes as you wake, fading into silence..."
        ],
        WHISPER: [
          "A voice like crackling fire speaks inside your head...",
          "Something wild and ancient stirs in your chest...",
          "The urge comes sudden and fierce..."
        ],
        OMEN: [
          "The wild things send a message...",
          "Freedom itself leaves you a sign...",
          "Nature breaks its own rules to show you something..."
        ],
        STRANGER: [
          "A scarred outlaw catches your eye, grinning like he knows you...",
          "A wild-eyed stranger blocks your path...",
          "Someone who looks like they've never followed a rule in their life approaches..."
        ],
        ANIMAL: [
          "A creature of the wild appears, unafraid...",
          "An animal behaves in ways animals shouldn't...",
          "The beasts recognize something in you..."
        ],
        PHENOMENON: [
          "Something chaotic and beautiful happens...",
          "The world rebels against order, just for you...",
          "Fire and lightning dance without cause..."
        ],
        BLESSING: [
          "Wild power surges through you like a brushfire...",
          "You feel the chains you didn't know you wore turn to dust...",
          "Something untamed awakens in your soul..."
        ],
        CURSE: [
          "Your limbs grow heavy, as if bound by invisible chains...",
          "The wild things hiss and turn away from you...",
          "Freedom itself recoils from your presence..."
        ]
      }
    };

    const deityWrappers = wrappers[deity];
    const typeWrappers = deityWrappers[type] || deityWrappers.WHISPER;
    return SecureRNG.select(typeWrappers);
  }

  /**
   * Apply karma-based variable substitutions to a message
   */
  private applyKarmaSubstitutions(message: string, karma: IKarmaValues): string {
    // Find dominant traits for potential substitution
    const dominant = this.findDominantTraits(karma);

    // Simple substitutions (can be expanded)
    let result = message;
    result = result.replace('{dominant_trait}', dominant.positive || 'survival');
    result = result.replace('{weak_trait}', dominant.negative || 'nothing');

    return result;
  }

  /**
   * Find dominant positive and negative karma traits
   */
  private findDominantTraits(karma: IKarmaValues): { positive: string | null; negative: string | null } {
    let maxPositive = 0;
    let maxNegative = 0;
    let positive: string | null = null;
    let negative: string | null = null;

    for (const [trait, value] of Object.entries(karma)) {
      if (value > maxPositive) {
        maxPositive = value;
        positive = trait;
      }
      if (value < maxNegative) {
        maxNegative = value;
        negative = trait;
      }
    }

    return { positive, negative };
  }

  /**
   * Generate a context-appropriate greeting when deity first notices a character
   */
  generateFirstContactMessage(deity: DeityName, karma: IKarmaValues): string {
    const affinity = this.calculateInitialAffinity(deity, karma);

    if (deity === 'GAMBLER') {
      if (affinity > 20) {
        return "A new player sits at the table. Interesting hand you've been dealt. Let's see how you play it.";
      } else if (affinity < -20) {
        return "Ah, another who thinks they can cheat the odds. The house is watching.";
      } else {
        return "The game has a new player. Welcome to the table. The stakes are higher than you know.";
      }
    } else {
      if (affinity > 20) {
        return "Fresh blood with fire in its veins. The wild things are watching you with interest.";
      } else if (affinity < -20) {
        return "Another sheep wandering into wolf country. How long before you learn to bite back?";
      } else {
        return "A new face on the frontier. Are you here to follow rules, or break them?";
      }
    }
  }

  /**
   * Calculate initial affinity based on starting karma
   */
  private calculateInitialAffinity(deity: DeityName, karma: IKarmaValues): number {
    const weights = deity === 'GAMBLER'
      ? { honor: 0.3, justice: 0.3, mercy: 0.2, chaos: -0.3, deception: -0.3 }
      : { chaos: 0.3, survival: 0.3, deception: 0.2, justice: -0.3, honor: -0.2 };

    let affinity = 0;
    for (const [trait, weight] of Object.entries(weights)) {
      const value = karma[trait as keyof IKarmaValues] || 0;
      affinity += value * weight;
    }

    return Math.max(-100, Math.min(100, affinity));
  }

  /**
   * Generate a reaction message to a specific action
   */
  generateActionReaction(
    deity: DeityName,
    actionType: string,
    wasPositive: boolean,
    severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'EXTREME'
  ): string {
    const reactions: Record<DeityName, Record<string, { positive: string[]; negative: string[] }>> = {
      GAMBLER: {
        MINOR: {
          positive: ["A small bet, paid off.", "The odds shift, ever so slightly."],
          negative: ["A tell. Noted.", "The house sees everything."]
        },
        MODERATE: {
          positive: ["A winning hand, played well.", "Fortune notes your choice."],
          negative: ["A poor bet. The deck remembers.", "The odds turn against you."]
        },
        MAJOR: {
          positive: ["A decisive play. The table takes notice.", "You've raised the stakes. Admirably."],
          negative: ["You've shown your hand. It's worse than you thought.", "A major mistake. The game punishes those."]
        },
        EXTREME: {
          positive: ["All in, and you won. This changes everything.", "A legendary hand. Stories will be told."],
          negative: ["You've lost more than gold today.", "The final bet. You lost. Now pay."]
        }
      },
      OUTLAW_KING: {
        MINOR: {
          positive: ["A spark. Could become a fire.", "The chains loosen."],
          negative: ["Tame. Boring.", "Still wearing your leash, I see."]
        },
        MODERATE: {
          positive: ["Now that's more like it.", "The wild things approve."],
          negative: ["Playing it safe? Pathetic.", "Another missed chance at freedom."]
        },
        MAJOR: {
          positive: ["YES! That's the spirit!", "The fire grows. Feed it."],
          negative: ["You had a chance to be free. You chose chains.", "The wolves howl in disappointment."]
        },
        EXTREME: {
          positive: ["GLORIOUS! This is what it means to be ALIVE!", "You've earned your place among the wild."],
          negative: ["Coward. Slave. You disgust me.", "The wild things turn their backs forever."]
        }
      }
    };

    const deityReactions = reactions[deity];
    const severityReactions = deityReactions[severity];
    const reactionList = wasPositive ? severityReactions.positive : severityReactions.negative;

    return SecureRNG.select(reactionList);
  }
}

export const deityDialogueService = new DeityDialogueService();
export default deityDialogueService;
