/**
 * ChatGenerator - Generates context-aware, personality-driven chat messages
 * that feel genuinely human and authentic, not robotic.
 *
 * Features:
 * - 8 personality-specific message styles
 * - Context-aware messages (location, time, events)
 * - 50+ greeting variations
 * - Topic generation (quests, combat, trading, gang, lore, complaints)
 * - Response generation
 * - Roleplay templates with western flavor
 * - Emote usage
 * - Message length variation
 * - Realistic typo simulation (3-5% rate)
 *
 * @module ChatGenerator
 */

/**
 * Player personality archetypes that drive chat style
 */
export type PlayerPersonality =
  | 'grinder'        // Talks about XP, optimization, efficiency
  | 'social'         // Focused on making friends, community
  | 'roleplayer'     // Heavy western roleplay with emotes
  | 'competitive'    // Talks about rankings, being the best
  | 'merchant'       // Trading, economics, deals
  | 'loremaster'     // Deep lore, story, world knowledge
  | 'casual'         // Relaxed, simple chat, friendly
  | 'helper';        // Offers advice, helps newbies

/**
 * Game context for message generation
 */
export interface ChatContext {
  /** Current location name */
  location?: string;

  /** Time of day in game (0-23 hours) */
  timeOfDay?: number;

  /** Recent event that happened */
  recentEvent?: 'combat_win' | 'combat_loss' | 'level_up' | 'quest_complete' |
                'joined_gang' | 'found_treasure' | 'got_arrested' | 'escaped_jail';

  /** Player's current level */
  level?: number;

  /** Player's faction */
  faction?: 'settler' | 'nahi' | 'frontera';

  /** Current activity */
  activity?: 'idle' | 'fighting' | 'trading' | 'exploring' | 'crafting';

  /** Is player in a gang? */
  inGang?: boolean;

  /** Recent chat message to respond to */
  messageToRespondTo?: string;
}

/**
 * Configuration for the ChatGenerator
 */
export interface ChatGeneratorConfig {
  /** Player's personality type */
  personality: PlayerPersonality;

  /** Player's character name */
  characterName: string;

  /** Enable typo simulation (default: true) */
  enableTypos?: boolean;

  /** Typo rate 0-1 (default: 0.04 = 4%) */
  typoRate?: number;

  /** Enable emotes (default: true for roleplayer, false for others) */
  enableEmotes?: boolean;

  /** Verbose logging */
  verbose?: boolean;
}

/**
 * Message generation options
 */
export interface MessageOptions {
  /** Preferred message length */
  length?: 'short' | 'medium' | 'long';

  /** Force a specific topic */
  topic?: string;

  /** Context for message generation */
  context?: ChatContext;
}

/**
 * Generates context-aware, personality-driven chat messages that feel human.
 *
 * @example
 * ```typescript
 * const generator = new ChatGenerator({
 *   personality: 'roleplayer',
 *   characterName: 'Black Jack McCoy',
 *   enableEmotes: true
 * });
 *
 * // Generate a greeting
 * const greeting = generator.generateGreeting({ location: 'Red Gulch Saloon' });
 * console.log(greeting); // "*tips hat* Evenin' folks, Black Jack's the name"
 *
 * // Generate a contextual message
 * const msg = generator.generateMessage({
 *   context: {
 *     location: 'Kaiowa Mesa',
 *     recentEvent: 'combat_win',
 *     level: 15
 *   }
 * });
 * ```
 */
export class ChatGenerator {
  private config: Required<ChatGeneratorConfig>;
  private recentTopics: string[] = [];
  private messageCount: number = 0;

  constructor(config: ChatGeneratorConfig) {
    this.config = {
      personality: config.personality,
      characterName: config.characterName,
      enableTypos: config.enableTypos ?? true,
      typoRate: config.typoRate ?? 0.04, // 4% default
      enableEmotes: config.enableEmotes ?? (config.personality === 'roleplayer'),
      verbose: config.verbose ?? false
    };
  }

  /**
   * Generate a greeting message with personality and context awareness.
   * Includes 50+ variations across all personalities.
   */
  generateGreeting(options: MessageOptions = {}): string {
    const { context } = options;
    let greeting = '';

    // Select greeting based on personality
    switch (this.config.personality) {
      case 'grinder':
        greeting = this.getGrinderGreeting(context);
        break;
      case 'social':
        greeting = this.getSocialGreeting(context);
        break;
      case 'roleplayer':
        greeting = this.getRoleplayerGreeting(context);
        break;
      case 'competitive':
        greeting = this.getCompetitiveGreeting(context);
        break;
      case 'merchant':
        greeting = this.getMerchantGreeting(context);
        break;
      case 'loremaster':
        greeting = this.getLoremasterGreeting(context);
        break;
      case 'casual':
        greeting = this.getCasualGreeting(context);
        break;
      case 'helper':
        greeting = this.getHelperGreeting(context);
        break;
    }

    return this.applyPostProcessing(greeting, context);
  }

  /**
   * Generate a contextual message based on personality and current situation.
   */
  generateMessage(options: MessageOptions = {}): string {
    const { length = this.randomLength(), topic, context } = options;

    let message = '';

    if (topic) {
      message = this.generateTopicMessage(topic, context);
    } else {
      // Choose topic based on personality and context
      const chosenTopic = this.selectTopic(context);
      message = this.generateTopicMessage(chosenTopic, context);
    }

    // Adjust length
    message = this.adjustMessageLength(message, length, context);

    return this.applyPostProcessing(message, context);
  }

  /**
   * Generate a response to another player's message.
   */
  generateResponse(originalMessage: string, context?: ChatContext): string {
    const lowerMsg = originalMessage.toLowerCase();
    let response = '';

    // Detect what the message is about
    if (lowerMsg.includes('help') || lowerMsg.includes('how do')) {
      response = this.generateHelpResponse(originalMessage, context);
    } else if (lowerMsg.includes('quest') || lowerMsg.includes('mission')) {
      response = this.generateQuestResponse(originalMessage, context);
    } else if (lowerMsg.includes('trade') || lowerMsg.includes('sell') || lowerMsg.includes('buy')) {
      response = this.generateTradeResponse(originalMessage, context);
    } else if (lowerMsg.includes('gang') || lowerMsg.includes('crew')) {
      response = this.generateGangResponse(originalMessage, context);
    } else if (lowerMsg.includes('fight') || lowerMsg.includes('combat') || lowerMsg.includes('duel')) {
      response = this.generateCombatResponse(originalMessage, context);
    } else if (lowerMsg.match(/\b(hi|hey|hello|howdy|greetings)\b/)) {
      response = this.generateGreeting({ context });
    } else {
      response = this.generateGenericResponse(originalMessage, context);
    }

    return this.applyPostProcessing(response, context);
  }

  /**
   * Generate a random emote action (for roleplayers).
   */
  generateEmote(): string {
    const emotes = [
      '*tips hat*',
      '*draws weapon*',
      '*holsters gun*',
      '*spits tobacco*',
      '*adjusts bandana*',
      '*lights cigar*',
      '*pours whiskey*',
      '*slams fist on table*',
      '*leans against wall*',
      '*checks pocket watch*',
      '*polishes badge*',
      '*loads revolver*',
      '*cracks knuckles*',
      '*squints at horizon*',
      '*saddles up horse*',
      '*whistles tune*',
      '*shuffles deck*',
      '*counts coins*',
      '*examines map*',
      '*sharpens knife*',
      '*rolls cigarette*',
      '*dusts off coat*',
      '*peers through window*',
      '*checks ammunition*',
      '*stretches arms*'
    ];

    return this.randomChoice(emotes);
  }

  // ==================== PERSONALITY-SPECIFIC GREETINGS ====================

  private getGrinderGreeting(context?: ChatContext): string {
    const greetings = [
      'Hey, what\'s the best XP farm right now?',
      'Anyone know the optimal rotation for leveling?',
      'Just hit level {level}! Time to grind more',
      'Looking for efficient quest chains',
      'What\'s everyone\'s XP per hour?',
      'Anyone else min-maxing their build?',
      'Time to optimize my skill training',
      'Is there a faster way to level combat?',
      'Need to maximize my energy usage today',
      'Grinding my way to the top!',
      'What\'s the meta build this week?',
      'Just calculated my DPS, looking good',
      'Energy efficiency is key, folks',
      'Who else is tracking their stats?',
      'Time to optimize this character build'
    ];

    let msg = this.randomChoice(greetings);
    if (context?.level) {
      msg = msg.replace('{level}', context.level.toString());
    }
    return msg;
  }

  private getSocialGreeting(context?: ChatContext): string {
    const greetings = [
      'Hey everyone! Hope you\'re all having a great day!',
      'Hello friends! Anyone want to team up?',
      'Good to see familiar faces here!',
      'Hi all! New here, looking to make some friends',
      'Hey! Anyone up for some fun adventures?',
      'Greetings everyone! This community is amazing',
      'Hello! Would love to get to know you all',
      'Hey folks! Down for some group activities?',
      'Hi! Just wanted to say this place is awesome',
      'Good day everyone! Let\'s make some memories',
      'Hey! Always happy to meet new people',
      'Hello all! This game is better with friends',
      'Hi everyone! Looking forward to playing together',
      'Hey! The more the merrier, right?',
      'Greetings! Love the friendly atmosphere here'
    ];

    return this.randomChoice(greetings);
  }

  private getRoleplayerGreeting(context?: ChatContext): string {
    const greetings = [
      '*tips hat* Evenin\' folks, name\'s {name}',
      '*pushes through saloon doors* Howdy partners',
      '*leans against bar* Well ain\'t this a lively bunch',
      '*adjusts holster* Greetings, friends and strangers alike',
      '*dismounts horse* Fine day in the territory, ain\'t it?',
      '*removes dusty gloves* Pleasure to make your acquaintance',
      '*nods respectfully* {name} at your service',
      '*enters slowly, hand near revolver* Folks',
      '*sits at table* Mind if I join this fine gathering?',
      '*orders whiskey* Been a long ride, how\'s everyone farin\'?',
      '*lights cigar* Name\'s {name}, heard this was the place to be',
      '*dusts off coat* Quite the establishment you got here',
      '*checks six-shooter* Quiet day in {location}, I reckon',
      '*tips wide-brimmed hat* Ma\'am, gentlemen',
      '*squints at crowd* Don\'t believe we\'ve been properly introduced'
    ];

    let msg = this.randomChoice(greetings);
    msg = msg.replace('{name}', this.config.characterName);
    if (context?.location) {
      msg = msg.replace('{location}', context.location);
    }
    return msg;
  }

  private getCompetitiveGreeting(context?: ChatContext): string {
    const greetings = [
      'Ready to dominate today\'s leaderboards',
      'Who\'s ranked higher than me? Time to change that',
      'Just climbed 5 spots in the rankings!',
      'Anyone up for a challenge?',
      'Top 10 here I come!',
      'Let\'s see who\'s really the best',
      'Crushing it today, how about you?',
      'Competitive scene is heating up!',
      'Watch me climb these ranks',
      'Who wants to test their skills?',
      'I\'m coming for that #1 spot',
      'Beat my score if you can',
      'Competition makes us all better',
      'Time to prove who\'s strongest',
      'Rankings updated, looking good!'
    ];

    return this.randomChoice(greetings);
  }

  private getMerchantGreeting(context?: ChatContext): string {
    const greetings = [
      'Open for business! What do you need?',
      'Got some great deals today, folks',
      'Looking to buy or sell? I\'m your trader',
      'Fair prices, quality goods!',
      'Anyone need supplies? I got you covered',
      'Trading post is open!',
      'Best prices in the territory, guaranteed',
      'Buying rare items at top dollar',
      'Come see my inventory, won\'t disappoint',
      'Special deals today only!',
      'Looking for trading partners',
      'Gold for goods, goods for gold!',
      'Always looking to make a deal',
      'Quality merchandise, reasonable prices',
      'Your one-stop shop for frontier goods'
    ];

    return this.randomChoice(greetings);
  }

  private getLoremasterGreeting(context?: ChatContext): string {
    const greetings = [
      'Fascinating lore in this territory',
      'Did you know the history of {location}?',
      'The legends here are incredible',
      'Ancient stories still echo in these lands',
      'Every location has a tale to tell',
      'The Sangre Territory holds many secrets',
      'Studied the faction histories lately?',
      'These lands have seen so much history',
      'The old ones speak of great power here',
      'Delving deep into the lore today',
      'Such rich storytelling in this world',
      'Anyone else appreciate the narrative depth?',
      'The mythology here is captivating',
      'Historical records reveal much',
      'Tales of the frontier never get old'
    ];

    let msg = this.randomChoice(greetings);
    if (context?.location) {
      msg = msg.replace('{location}', context.location);
    }
    return msg;
  }

  private getCasualGreeting(context?: ChatContext): string {
    const greetings = [
      'Hey what\'s up',
      'Yo everyone',
      'Sup folks',
      'Hey there',
      'What\'s good',
      'Howdy all',
      'Hey guys',
      'Hi everyone',
      'What\'s happening',
      'Yo what\'s new',
      'Hey people',
      'Sup y\'all',
      'Heya',
      'What\'s crackin',
      'Hey folks',
      'Hiya',
      'Whaddup',
      'Hey hey',
      'Greetings',
      'Ayo'
    ];

    return this.randomChoice(greetings);
  }

  private getHelperGreeting(context?: ChatContext): string {
    const greetings = [
      'Hi! Happy to answer any questions',
      'Hey folks, here to help if needed',
      'Anyone need tips or advice?',
      'Hello! Don\'t hesitate to ask for help',
      'Hi all! Glad to assist newcomers',
      'Hey! Questions welcome, I\'ll do my best',
      'Greetings! Here to support the community',
      'Hi everyone! Need a hand with anything?',
      'Hello! Always happy to help out',
      'Hey! Confused about something? Ask away',
      'Hi! I remember being new, here to help',
      'Hey folks! Share knowledge, help each other',
      'Greetings! No question is too small',
      'Hi! Let\'s help each other succeed',
      'Hey! Community support is what we do'
    ];

    return this.randomChoice(greetings);
  }

  // ==================== TOPIC MESSAGE GENERATION ====================

  private selectTopic(context?: ChatContext): string {
    const topics = [
      'quest',
      'combat',
      'trading',
      'gang',
      'lore',
      'complaint',
      'achievement',
      'location',
      'strategy',
      'social'
    ];

    // Weight topics based on personality
    const weights: Record<PlayerPersonality, Record<string, number>> = {
      grinder: { quest: 3, combat: 3, achievement: 4, strategy: 5 },
      social: { social: 5, gang: 3, location: 2 },
      roleplayer: { lore: 4, location: 3, social: 2 },
      competitive: { combat: 5, achievement: 4, strategy: 3 },
      merchant: { trading: 5, strategy: 2 },
      loremaster: { lore: 5, location: 3, quest: 2 },
      casual: { social: 3, location: 2 },
      helper: { strategy: 4, social: 3 }
    };

    const personalityWeights = weights[this.config.personality];
    const weightedTopics = topics.map(topic => ({
      topic,
      weight: personalityWeights[topic] || 1
    }));

    // Context-based weight adjustments
    if (context?.recentEvent === 'combat_win' || context?.recentEvent === 'combat_loss') {
      const combatTopic = weightedTopics.find(t => t.topic === 'combat');
      if (combatTopic) combatTopic.weight *= 3;
    }

    if (context?.recentEvent === 'level_up') {
      const achievementTopic = weightedTopics.find(t => t.topic === 'achievement');
      if (achievementTopic) achievementTopic.weight *= 3;
    }

    if (context?.inGang) {
      const gangTopic = weightedTopics.find(t => t.topic === 'gang');
      if (gangTopic) gangTopic.weight *= 2;
    }

    // Weighted random selection
    return this.weightedRandomChoice(weightedTopics);
  }

  private generateTopicMessage(topic: string, context?: ChatContext): string {
    switch (topic) {
      case 'quest':
        return this.generateQuestMessage(context);
      case 'combat':
        return this.generateCombatMessage(context);
      case 'trading':
        return this.generateTradingMessage(context);
      case 'gang':
        return this.generateGangMessage(context);
      case 'lore':
        return this.generateLoreMessage(context);
      case 'complaint':
        return this.generateComplaintMessage(context);
      case 'achievement':
        return this.generateAchievementMessage(context);
      case 'location':
        return this.generateLocationMessage(context);
      case 'strategy':
        return this.generateStrategyMessage(context);
      case 'social':
        return this.generateSocialMessage(context);
      default:
        return this.generateGenericMessage(context);
    }
  }

  private generateQuestMessage(context?: ChatContext): string {
    const messages: Record<PlayerPersonality, string[]> = {
      grinder: [
        'Best quest for XP at my level?',
        'Quest chain efficiency is key',
        'Grinding these dailies hard',
        'Optimized my quest route today',
        'Which quests give best rewards?'
      ],
      social: [
        'Anyone want to do this quest together?',
        'These quests are more fun with friends!',
        'Looking for quest buddies',
        'Love the storyline in this quest',
        'Who else is working on this questline?'
      ],
      roleplayer: [
        '*studies quest scroll* This mission speaks to my honor',
        'The call to adventure beckons once more',
        '*reads bounty notice* Reckon I can handle this',
        'A quest worthy of a true frontiersman',
        'The path of destiny leads through perilous quests'
      ],
      competitive: [
        'Racing through these quests',
        'Quest completion rate looking good',
        'Who can finish this faster?',
        'Speedrunning this questline',
        'Another quest down, onto the next'
      ],
      merchant: [
        'Quest rewards worth the effort?',
        'Calculating quest profit margins',
        'These quests pay well',
        'Good return on time invested',
        'Quest gold adds up nicely'
      ],
      loremaster: [
        'This quest reveals important lore',
        'The narrative depth in this questline!',
        'Fascinating quest backstory',
        'This quest connects to ancient history',
        'The storytelling in these missions is superb'
      ],
      casual: [
        'This quest is pretty cool',
        'Working on some quests',
        'Quest time!',
        'These missions are fun',
        'Gonna knock out a few quests'
      ],
      helper: [
        'Happy to help with this quest',
        'Quest tips: take your time and read carefully',
        'If you need quest help, ask!',
        'This quest is easier than it looks',
        'Quest walkthrough: first you need to...'
      ]
    };

    return this.randomChoice(messages[this.config.personality]);
  }

  private generateCombatMessage(context?: ChatContext): string {
    const isWin = context?.recentEvent === 'combat_win';
    const isLoss = context?.recentEvent === 'combat_loss';

    const messages: Record<PlayerPersonality, string[]> = {
      grinder: [
        isWin ? 'Combat XP looking good!' : 'Combat XP farm continues',
        'Optimizing my combat rotation',
        'DPS calculations paying off',
        'Combat efficiency up 20%',
        'Perfect combat stat distribution'
      ],
      social: [
        isWin ? 'Good fight everyone!' : 'That was intense!',
        'Combat is better with backup',
        'Who wants to team up for fights?',
        'These battles are exciting',
        'Nothing like a good group fight'
      ],
      roleplayer: [
        isWin ? '*holsters smoking revolver* They didn\'t stand a chance' : '*wipes blood from lip* Reckon I underestimated them',
        '*draws iron* Time to settle this like proper gunslingers',
        'The way of the gun is all I know',
        '*checks ammunition* Ready for whatever comes',
        'Honor demands I face my enemies head-on'
      ],
      competitive: [
        isWin ? 'Another victory for the books!' : 'I\'ll come back stronger',
        'Combat ranking climbing fast',
        'Who wants to test their skills?',
        'Undefeated streak continues',
        'Bring your best, I\'m ready'
      ],
      merchant: [
        'Combat supplies for sale!',
        'Weapons and armor, best prices',
        'Stocking up on combat gear',
        'Good profit in selling to fighters',
        'Quality weapons make the difference'
      ],
      loremaster: [
        'The ancient combat techniques still hold true',
        'Historical battle tactics work even now',
        'Fighting honors the warrior traditions',
        'Combat reflects the brutal history here',
        'These fights echo legendary duels of old'
      ],
      casual: [
        isWin ? 'Nice fight!' : 'Tough fight',
        'Combat is pretty fun',
        'Just had a good battle',
        'Fighting time',
        'That was a good one'
      ],
      helper: [
        'Combat tip: watch your positioning',
        'Remember to use your skills wisely',
        'Don\'t forget to heal between fights',
        'Combat strategy is important',
        'Happy to share combat advice'
      ]
    };

    return this.randomChoice(messages[this.config.personality]);
  }

  private generateTradingMessage(context?: ChatContext): string {
    const messages: Record<PlayerPersonality, string[]> = {
      grinder: [
        'Trading for optimal gear upgrades',
        'Best gold-to-XP item trades?',
        'Maximizing trading efficiency',
        'Market arbitrage opportunities',
        'Trading to fund my progression'
      ],
      social: [
        'Love the trading community here',
        'Anyone want to swap items?',
        'Trading makes the game more social',
        'Great deals with good people',
        'Building trade relationships'
      ],
      roleplayer: [
        '*examines goods carefully* Fair trade, fair price',
        '*counts gold coins* A merchant\'s life for me',
        'Every trade tells a story, partner',
        '*haggles respectfully* Best I can do',
        'Trading keeps the frontier alive'
      ],
      competitive: [
        'Cornering the market on this item',
        'Trading game strong',
        'Best trader in the territory',
        'Outtrading the competition',
        'Market dominance achieved'
      ],
      merchant: [
        'WTS: Rare items, PM offers',
        'WTB: Bulk materials, good prices',
        'Trading post open all day',
        'Check my shop for deals',
        'Buying low, selling fair'
      ],
      loremaster: [
        'Ancient trade routes still matter',
        'The economics of the frontier fascinate me',
        'Trading built these territories',
        'Historical trade goods still valuable',
        'Commerce connects all cultures'
      ],
      casual: [
        'Got some stuff to trade',
        'Anyone trading?',
        'Looking to swap items',
        'Trade window open',
        'Selling some things'
      ],
      helper: [
        'Trading tips: always check market prices',
        'Don\'t sell too cheap!',
        'New traders: start small',
        'Happy to explain trading mechanics',
        'Trade safely, folks'
      ]
    };

    return this.randomChoice(messages[this.config.personality]);
  }

  private generateGangMessage(context?: ChatContext): string {
    const messages: Record<PlayerPersonality, string[]> = {
      grinder: [
        'Gang bonuses boost XP gains',
        'Gang activities for progression',
        'Optimizing gang contribution',
        'Gang perks worth it',
        'Gang leveling strategy paying off'
      ],
      social: [
        'Love my gang family!',
        'Gang makes this game special',
        'Great people in my crew',
        'Gang events are the best',
        'Nothing like good gang mates'
      ],
      roleplayer: [
        '*raises gang colors* Ride with us',
        'My gang\'s honor is unquestionable',
        '*shows gang tattoo* Family first',
        'We stand together, or not at all',
        'Gang loyalty runs deeper than blood'
      ],
      competitive: [
        'Gang war domination',
        'Top gang in the rankings',
        'Gang PvP undefeated',
        'We\'re taking over',
        'Best gang, prove me wrong'
      ],
      merchant: [
        'Gang trading network strong',
        'Gang resource sharing profitable',
        'Gang economy thriving',
        'Trading within gang first',
        'Gang business booming'
      ],
      loremaster: [
        'Gang traditions run deep',
        'Our gang honors the old ways',
        'Gang history matters',
        'We carry on ancient traditions',
        'Gang lore is fascinating'
      ],
      casual: [
        'Gang life is cool',
        'Chilling with the gang',
        'Gang stuff today',
        'My gang is pretty great',
        'Gang activities fun'
      ],
      helper: [
        'Gang tips: communicate often',
        'Help your gang mates',
        'Gang success needs teamwork',
        'New to gangs? Ask away',
        'Strong gangs support each other'
      ]
    };

    return this.randomChoice(messages[this.config.personality]);
  }

  private generateLoreMessage(context?: ChatContext): string {
    const messages: Record<PlayerPersonality, string[]> = {
      grinder: [
        'Lore unlocks give XP bonuses',
        'Hidden lore locations worth finding',
        'Lore achievements completionist grind',
        'Efficient lore collection routes',
        'Lore discoveries boost progression'
      ],
      social: [
        'Anyone else love the lore?',
        'Let\'s discuss the story together',
        'Lore discussions are great',
        'Share your lore theories!',
        'The story brings us together'
      ],
      roleplayer: [
        'The old tales speak truth',
        '*recounts ancient legend*',
        'History lives in these lands',
        'Stories passed down through generations',
        'Every stone here has a tale'
      ],
      competitive: [
        'Found more lore than anyone',
        'Lore completion at 98%',
        'Most lore discoveries server-wide',
        'Lore hunting champion',
        'Complete lore collection soon'
      ],
      merchant: [
        'Lore items fetch good prices',
        'Rare lore artifacts for sale',
        'Lore collections are valuable',
        'Trading historical documents',
        'Ancient goods in stock'
      ],
      loremaster: [
        'The Sangre Territory mythology is incredible',
        'Did you know about the ancient prophecy?',
        'Historical records reveal so much',
        'The faction histories intertwine beautifully',
        'Lore enthusiasts, let\'s talk!'
      ],
      casual: [
        'Lore is pretty interesting',
        'Story is cool',
        'Found some lore',
        'Reading about the world',
        'Lore stuff is neat'
      ],
      helper: [
        'Lore locations guide available',
        'Ask about any lore confusion',
        'Lore makes more sense with context',
        'Happy to explain backstory',
        'Lore tips for newbies'
      ]
    };

    return this.randomChoice(messages[this.config.personality]);
  }

  private generateComplaintMessage(context?: ChatContext): string {
    const messages: Record<PlayerPersonality, string[]> = {
      grinder: [
        'XP rates could be better',
        'Energy regen too slow',
        'Need more efficient leveling',
        'Progression feels grindy',
        'Drop rates are rough'
      ],
      social: [
        'Wish there were more group features',
        'Friend list too small',
        'Need better communication tools',
        'Chat could use improvements',
        'More social features please'
      ],
      roleplayer: [
        'Immersion breaking bugs',
        'Need more roleplay emotes',
        'Lore inconsistencies bother me',
        'Customization options limited',
        'Want deeper story content'
      ],
      competitive: [
        'Ranking system needs work',
        'Balance issues in PvP',
        'Leaderboards bugged',
        'Matchmaking unfair',
        'Competition too easy/hard'
      ],
      merchant: [
        'Market fees too high',
        'Trading interface clunky',
        'Inventory space limited',
        'Pricing tools needed',
        'Economy balance off'
      ],
      loremaster: [
        'Not enough lore content',
        'Story gaps need filling',
        'Lore contradictions exist',
        'Historical accuracy issues',
        'Need more narrative depth'
      ],
      casual: [
        'Game feels slow sometimes',
        'Kinda confusing',
        'Could be easier',
        'Not sure what to do',
        'Bit overwhelming'
      ],
      helper: [
        'Tutorial could be better',
        'New player experience rough',
        'Help resources scattered',
        'Documentation lacking',
        'Onboarding needs work'
      ]
    };

    return this.randomChoice(messages[this.config.personality]);
  }

  private generateAchievementMessage(context?: ChatContext): string {
    const messages: Record<PlayerPersonality, string[]> = {
      grinder: [
        'Achievement unlocked! More XP!',
        'Grinding achievements efficiently',
        'Achievement points adding up',
        'Systematic achievement hunting',
        'Next achievement: 75% complete'
      ],
      social: [
        'Got an achievement! So happy!',
        'Anyone else working on this?',
        'Achievements more fun with friends',
        'Shared my achievement!',
        'Celebrating this unlock!'
      ],
      roleplayer: [
        '*polishes medal proudly*',
        'Honor earned through deeds',
        'Another mark of distinction',
        'My legend grows',
        '*adds trophy to collection*'
      ],
      competitive: [
        'Another achievement down!',
        'Achievement leaderboard climbing',
        'Rare achievement unlocked',
        'Who else has this?',
        'Achievement hunter champion'
      ],
      merchant: [
        'Achievement rewards profitable',
        'Good gold from this unlock',
        'Achievement items selling well',
        'Economic benefits nice',
        'Worth the effort for rewards'
      ],
      loremaster: [
        'Achievement lore fascinating',
        'Historical achievement context',
        'Story behind this unlock',
        'Achievement tied to ancient tale',
        'Narrative reward satisfying'
      ],
      casual: [
        'Got an achievement!',
        'That was cool',
        'Achievement popped',
        'Nice unlock',
        'Yay achievement'
      ],
      helper: [
        'Achievement guide: do this first',
        'Help with this achievement available',
        'Tips for tricky achievements',
        'Don\'t miss hidden requirements',
        'Achievement walkthrough ready'
      ]
    };

    return this.randomChoice(messages[this.config.personality]);
  }

  private generateLocationMessage(context?: ChatContext): string {
    const location = context?.location || 'this place';

    const messages: Record<PlayerPersonality, string[]> = {
      grinder: [
        `${location} has good farming spots`,
        `Efficient routes through ${location}`,
        `${location} resource density high`,
        `Best XP in ${location} right now`,
        `${location} grind optimization`
      ],
      social: [
        `${location} is lovely!`,
        `Anyone else in ${location}?`,
        `${location} has great atmosphere`,
        `Love hanging out in ${location}`,
        `${location} community friendly`
      ],
      roleplayer: [
        `*arrives in ${location}* What a sight`,
        `The tales of ${location} don't do it justice`,
        `${location} holds many secrets, I reckon`,
        `*explores ${location} carefully*`,
        `Never tire of ${location}`
      ],
      competitive: [
        `Dominating ${location} today`,
        `${location} PvP action hot`,
        `Controlling ${location}`,
        `${location} is mine`,
        `Conquered ${location}`
      ],
      merchant: [
        `${location} has good trade`,
        `Market in ${location} active`,
        `${location} prices fair`,
        `Trading hub in ${location}`,
        `${location} commerce thriving`
      ],
      loremaster: [
        `${location} history is rich`,
        `Ancient events in ${location}`,
        `${location} lore fascinating`,
        `${location} historical significance`,
        `${location} in the old texts`
      ],
      casual: [
        `${location} is cool`,
        `In ${location} now`,
        `${location} looks nice`,
        `Checking out ${location}`,
        `${location} vibes`
      ],
      helper: [
        `${location} tips available`,
        `${location} can be tricky`,
        `${location} guide: start here`,
        `${location} help if needed`,
        `${location} overview for new folks`
      ]
    };

    return this.randomChoice(messages[this.config.personality]);
  }

  private generateStrategyMessage(context?: ChatContext): string {
    const messages: Record<PlayerPersonality, string[]> = {
      grinder: [
        'Optimal build is Spirit/Cunning 70/30',
        'Energy management is critical',
        'Best rotation: Quest > Combat > Craft',
        'Stats priority: Cunning first',
        'Min-max guide coming together'
      ],
      social: [
        'Anyone have strategy tips?',
        'Let\'s share our strategies',
        'Teamwork strategies work best',
        'Strategy discussions welcome',
        'Learning from each other'
      ],
      roleplayer: [
        'Strategy? I follow my gut',
        '*plans carefully* Every move calculated',
        'Wisdom comes from experience',
        'The smart gunslinger lives longer',
        'Tactics matter as much as skill'
      ],
      competitive: [
        'Meta strategy dominating',
        'Counter-strategy working',
        'Strategic advantage secured',
        'Outthinking opponents',
        'Perfect strategy execution'
      ],
      merchant: [
        'Economic strategy paying off',
        'Buy low, sell high, always',
        'Market timing is everything',
        'Investment strategy solid',
        'Financial planning crucial'
      ],
      loremaster: [
        'Ancient strategies still work',
        'Historical tactics apply today',
        'Wisdom from the old texts',
        'Strategic thinking unchanged',
        'Learn from history'
      ],
      casual: [
        'Any strategy tips?',
        'How should I play?',
        'Strategy stuff confuses me',
        'Just playing it by ear',
        'Trying different approaches'
      ],
      helper: [
        'New player strategy: focus quests early',
        'Strategy tip: don\'t spread too thin',
        'Basic strategy guide available',
        'Happy to explain strategies',
        'Strategic thinking helps long-term'
      ]
    };

    return this.randomChoice(messages[this.config.personality]);
  }

  private generateSocialMessage(context?: ChatContext): string {
    const messages: Record<PlayerPersonality, string[]> = {
      grinder: [
        'Social breaks between grind sessions',
        'Quick chat before more farming',
        'Efficiency + community = best',
        'Social while waiting for energy',
        'Chat makes grinding less tedious'
      ],
      social: [
        'How\'s everyone doing today?',
        'Love chatting with you all',
        'This community is amazing',
        'Making great friends here',
        'Always up for conversation'
      ],
      roleplayer: [
        '*shares tales by the fire*',
        'Good company makes the journey worthwhile',
        '*raises glass* To new friendships',
        'The frontier is lonely without friends',
        '*shares wisdom from the trail*'
      ],
      competitive: [
        'Social after I win',
        'GG to worthy opponents',
        'Respect to skilled players',
        'Competition builds community',
        'See you in the arena'
      ],
      merchant: [
        'Social connections = trade connections',
        'Networking pays dividends',
        'Building business relationships',
        'Community supports commerce',
        'Good relationships, good business'
      ],
      loremaster: [
        'Let\'s discuss the deep lore',
        'Story theories anyone?',
        'Sharing knowledge enriches all',
        'Lore conversations welcome',
        'The narrative connects us'
      ],
      casual: [
        'Just hanging out',
        'Chilling and chatting',
        'What\'s everyone up to?',
        'Relaxing in game',
        'Casual vibes'
      ],
      helper: [
        'Always here to help',
        'Questions? Fire away',
        'Community support important',
        'We all help each other',
        'Friendly advice available'
      ]
    };

    return this.randomChoice(messages[this.config.personality]);
  }

  private generateGenericMessage(context?: ChatContext): string {
    const messages = [
      'Interesting game mechanics',
      'Anyone else enjoying this?',
      'Time flies in this game',
      'The territory is vast',
      'So much to explore',
      'Great game design',
      'Loving the atmosphere',
      'This game has depth',
      'Always something new',
      'Well-crafted world'
    ];

    return this.randomChoice(messages);
  }

  // ==================== RESPONSE GENERATION ====================

  private generateHelpResponse(originalMsg: string, context?: ChatContext): string {
    const responses: Record<PlayerPersonality, string[]> = {
      grinder: ['Check the wiki for optimal paths', 'Focus on efficient XP gains'],
      social: ['Happy to help! What do you need?', 'Let me explain...'],
      roleplayer: ['*offers guidance* Let me show you the way', '*shares wisdom*'],
      competitive: ['Learn the meta, practice, dominate', 'Study the best players'],
      merchant: ['Trade smart, profit follows', 'Invest wisely, friend'],
      loremaster: ['The answer lies in the lore', 'Let me share what I know'],
      casual: ['Yeah that confused me too', 'Try this...'],
      helper: ['I can help with that! Here\'s how:', 'Great question! First...']
    };

    return this.randomChoice(responses[this.config.personality]);
  }

  private generateQuestResponse(originalMsg: string, context?: ChatContext): string {
    const responses: Record<PlayerPersonality, string[]> = {
      grinder: ['That quest gives decent XP', 'Quest chain is worth it'],
      social: ['Want to do it together?', 'I\'ll help you with it!'],
      roleplayer: ['*nods* A noble quest indeed', 'That mission calls to me too'],
      competitive: ['Speedrun that quest in 10 minutes', 'Beat my completion time'],
      merchant: ['Quest rewards sell well', 'Good profit from that one'],
      loremaster: ['That quest has rich backstory', 'The lore is fascinating'],
      casual: ['That quest is fun', 'Yeah I did that one'],
      helper: ['Quest guide: start at...', 'Tips for that quest...']
    };

    return this.randomChoice(responses[this.config.personality]);
  }

  private generateTradeResponse(originalMsg: string, context?: ChatContext): string {
    const responses: Record<PlayerPersonality, string[]> = {
      grinder: ['Trade for progression items only', 'Focus on gear upgrades'],
      social: ['I can help with that trade', 'Fair trading is important'],
      roleplayer: ['*considers offer* Let us barter', '*examines goods*'],
      competitive: ['Only trade for competitive edge', 'Get the best deal'],
      merchant: ['What\'s your offer?', 'I can do that trade', 'PM me prices'],
      loremaster: ['Historical trade items interest me', 'Rare artifacts preferred'],
      casual: ['Sure, sounds good', 'What you got?'],
      helper: ['Trade tip: check market value first', 'Be careful with trades']
    };

    return this.randomChoice(responses[this.config.personality]);
  }

  private generateGangResponse(originalMsg: string, context?: ChatContext): string {
    const responses: Record<PlayerPersonality, string[]> = {
      grinder: ['Gang bonuses boost progression', 'Join active gangs for perks'],
      social: ['Gangs are great for community', 'Love gang activities'],
      roleplayer: ['*shows gang colors* We ride together', 'Honor the gang code'],
      competitive: ['Join top gangs only', 'Gang wars are intense'],
      merchant: ['Gang trading network valuable', 'Gang economy matters'],
      loremaster: ['Gang traditions fascinating', 'Gang history runs deep'],
      casual: ['My gang is cool', 'Gang stuff is fun'],
      helper: ['Gang tips: communicate and contribute', 'Good gangs support members']
    };

    return this.randomChoice(responses[this.config.personality]);
  }

  private generateCombatResponse(originalMsg: string, context?: ChatContext): string {
    const responses: Record<PlayerPersonality, string[]> = {
      grinder: ['Combat for XP gains', 'Optimize your DPS'],
      social: ['Team combat is better', 'I\'ll back you up'],
      roleplayer: ['*hand hovers near holster* I\'m ready', 'Meet at high noon'],
      competitive: ['Bring it on', 'You\'ll lose', 'Let\'s test skills'],
      merchant: ['Combat supplies available', 'Sell you weapons'],
      loremaster: ['Ancient combat techniques', 'Historical dueling codes'],
      casual: ['Combat is fun', 'Good fights'],
      helper: ['Combat tip: use abilities wisely', 'Strategy matters in fights']
    };

    return this.randomChoice(responses[this.config.personality]);
  }

  private generateGenericResponse(originalMsg: string, context?: ChatContext): string {
    const responses = [
      'Interesting point',
      'I agree',
      'That makes sense',
      'Good thinking',
      'True that',
      'Yeah for sure',
      'I hear you',
      'Definitely',
      'Makes sense',
      'Fair point'
    ];

    return this.randomChoice(responses);
  }

  // ==================== MESSAGE PROCESSING ====================

  private adjustMessageLength(message: string, targetLength: 'short' | 'medium' | 'long', context?: ChatContext): string {
    // Short: 1-5 words
    // Medium: 5-15 words
    // Long: 15-30 words

    const wordCount = message.split(/\s+/).length;

    if (targetLength === 'short' && wordCount > 5) {
      // Truncate to make shorter
      const words = message.split(/\s+/).slice(0, 5);
      return words.join(' ');
    }

    if (targetLength === 'long' && wordCount < 15) {
      // Add contextual filler
      const additions = [
        ', you know?',
        ' for sure',
        ' in my experience',
        ' I think',
        ' personally',
        ', right?',
        ' honestly',
        ' tbh',
        ' imo'
      ];
      return message + this.randomChoice(additions);
    }

    return message;
  }

  private applyPostProcessing(message: string, context?: ChatContext): string {
    let processed = message;

    // Apply emotes for roleplayers
    if (this.config.enableEmotes && this.config.personality === 'roleplayer') {
      // 30% chance to add emote
      if (Math.random() < 0.3 && !processed.includes('*')) {
        const emote = this.generateEmote();
        // Add at beginning or end
        processed = Math.random() < 0.5
          ? `${emote} ${processed}`
          : `${processed} ${emote}`;
      }
    }

    // Apply typos
    if (this.config.enableTypos && Math.random() < this.config.typoRate) {
      processed = this.addTypo(processed);
    }

    // Track message
    this.messageCount++;
    if (this.config.verbose) {
      console.log(`[ChatGenerator] Message #${this.messageCount} (${this.config.personality}): ${processed}`);
    }

    return processed;
  }

  private addTypo(message: string): string {
    const words = message.split(/\s+/);
    if (words.length === 0) return message;

    // Pick random word to add typo to
    const wordIndex = Math.floor(Math.random() * words.length);
    const word = words[wordIndex];

    if (word.length < 4) return message; // Don't typo short words

    const typoTypes = [
      'swap',      // Swap adjacent letters
      'double',    // Double a letter
      'omit',      // Omit a letter
      'wrong'      // Wrong letter
    ];

    const typoType = this.randomChoice(typoTypes);
    let typoWord = word;

    switch (typoType) {
      case 'swap': {
        const i = Math.floor(Math.random() * (word.length - 1));
        typoWord = word.substring(0, i) + word[i + 1] + word[i] + word.substring(i + 2);
        break;
      }
      case 'double': {
        const i = Math.floor(Math.random() * word.length);
        typoWord = word.substring(0, i) + word[i] + word.substring(i);
        break;
      }
      case 'omit': {
        const i = Math.floor(Math.random() * word.length);
        typoWord = word.substring(0, i) + word.substring(i + 1);
        break;
      }
      case 'wrong': {
        const i = Math.floor(Math.random() * word.length);
        const nearbyKeys: Record<string, string[]> = {
          'a': ['s', 'q', 'w'],
          'e': ['w', 'r', 'd'],
          'i': ['u', 'o', 'k'],
          'o': ['i', 'p', 'l'],
          't': ['r', 'y', 'g'],
          'n': ['b', 'm', 'h'],
          's': ['a', 'd', 'w']
        };
        const char = word[i].toLowerCase();
        const replacements = nearbyKeys[char] || ['x'];
        const replacement = this.randomChoice(replacements);
        typoWord = word.substring(0, i) + replacement + word.substring(i + 1);
        break;
      }
    }

    words[wordIndex] = typoWord;
    return words.join(' ');
  }

  private randomLength(): 'short' | 'medium' | 'long' {
    const rand = Math.random();
    if (rand < 0.5) return 'short';
    if (rand < 0.85) return 'medium';
    return 'long';
  }

  // ==================== UTILITY METHODS ====================

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private weightedRandomChoice(items: { topic: string; weight: number }[]): string {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
      random -= item.weight;
      if (random <= 0) {
        return item.topic;
      }
    }

    return items[0].topic;
  }

  /**
   * Get statistics about generated messages
   */
  getStatistics() {
    return {
      totalMessages: this.messageCount,
      personality: this.config.personality,
      characterName: this.config.characterName,
      typosEnabled: this.config.enableTypos,
      emotesEnabled: this.config.enableEmotes
    };
  }

  /**
   * Reset message counter
   */
  reset(): void {
    this.messageCount = 0;
    this.recentTopics = [];
  }
}

/**
 * Example usage demonstrating the ChatGenerator
 */
export async function exampleUsage() {
  console.log('=== ChatGenerator Example Usage ===\n');

  // Create different personality generators
  const personalities: PlayerPersonality[] = [
    'grinder',
    'social',
    'roleplayer',
    'competitive',
    'merchant',
    'loremaster',
    'casual',
    'helper'
  ];

  for (const personality of personalities) {
    console.log(`\n--- ${personality.toUpperCase()} Personality ---`);

    const generator = new ChatGenerator({
      personality,
      characterName: `Test${personality}`,
      enableTypos: true,
      typoRate: 0.05
    });

    // Generate greeting
    const greeting = generator.generateGreeting({
      context: {
        location: 'Red Gulch Saloon',
        timeOfDay: 14
      }
    });
    console.log(`Greeting: ${greeting}`);

    // Generate contextual message
    const message = generator.generateMessage({
      length: 'medium',
      context: {
        location: 'Red Gulch',
        level: 15,
        recentEvent: 'combat_win',
        faction: 'settler'
      }
    });
    console.log(`Message: ${message}`);

    // Generate response
    const response = generator.generateResponse(
      'Anyone want to help with this quest?',
      { location: 'Kaiowa Mesa' }
    );
    console.log(`Response: ${response}`);
  }

  // Demonstrate roleplayer with emotes
  console.log('\n--- ROLEPLAYER With Emotes ---');
  const roleplayGen = new ChatGenerator({
    personality: 'roleplayer',
    characterName: 'Black Jack McCoy',
    enableEmotes: true
  });

  for (let i = 0; i < 5; i++) {
    const msg = roleplayGen.generateMessage({
      context: {
        location: 'The Frontera',
        activity: 'idle',
        timeOfDay: 20
      }
    });
    console.log(`  ${i + 1}. ${msg}`);
  }

  console.log('\n=== Example Complete ===');
}

// Uncomment to run example:
// exampleUsage().catch(console.error);
