/**
 * THE LEGEND OF JESSE JAMES
 * Legendary Quest Chain: Track the legacy of the famous outlaw
 * Level 25-30 | 6 Quests | Historical + Legend
 */

import type {
  LegendaryQuestChain,
  LegendaryQuest,
} from '@desperados/shared';

export const jesseJamesChain: LegendaryQuestChain = {
  id: 'chain_jesse_james',
  name: "The Legend of Jesse James",
  description:
    "Follow the trail of Jesse James' last treasure. Somewhere between history and myth lies a fortune that could change your destiny forever.",
  theme: 'historical',

  levelRange: [25, 30],
  prerequisites: [
    { type: 'level', minLevel: 25 },
    { type: 'faction', faction: 'outlaws', minReputation: 500 },
  ],

  totalQuests: 6,

  prologue: `The year is 1882. Jesse James has been dead for months, shot by the coward Robert Ford.
    But whispers persist in the saloons and back alleys of the frontier.
    His last heist - the big one that would let him retire - was never found.
    Some say it's buried. Others claim it was spent. A few believe it never existed at all.

    But you've come across something that might prove them all wrong:
    a letter from Jesse to his brother Frank, written days before his death,
    speaking of "the Missouri treasure" and "where it all began."

    The hunt for Jesse James' final secret begins now.`,

  epilogue: `You stand over the recovered treasure, the weight of history heavy on your shoulders.
    Jesse James - outlaw, killer, folk hero, victim. The truth, as always, is complicated.

    What you've found isn't just gold. It's the story of a man shaped by war,
    driven by desperation, and transformed by legend into something he never was.

    The treasure is yours now. But more importantly, you know the truth.
    And in the West, truth is the most valuable currency of all.`,

  majorNPCs: [
    {
      id: 'npc_frank_james',
      name: 'Frank James',
      role: "Jesse's older brother, retired outlaw",
      description:
        'A weathered man in his 60s, haunted by his past but sharp as ever. He holds the key to understanding Jesse.',
    },
    {
      id: 'npc_zerelda_samuel',
      name: 'Zerelda Samuel',
      role: "Jesse and Frank's mother",
      description:
        'A fierce, protective woman who never believed the legends about her sons. She knows where the bodies are buried.',
    },
    {
      id: 'npc_robert_ford',
      name: 'Robert Ford',
      role: "Jesse's killer, living in fear",
      description:
        'The man who killed Jesse James now runs from his own legend. He knows more than he ever told.',
    },
    {
      id: 'npc_detective_thornton',
      name: 'Detective William Thornton',
      role: 'Pinkerton agent, obsessed with the James Gang',
      description:
        "He's spent 20 years hunting them. He won't let you find what he couldn't.",
    },
    {
      id: 'npc_annie_ralston',
      name: 'Annie Ralston',
      role: "Former James Gang associate, Jesse's confidant",
      description:
        'One of the few people Jesse truly trusted. She disappeared after his death.',
    },
  ],

  quests: [
    // Quest 1: The Letter
    {
      id: 'quest_jesse_1',
      chainId: 'chain_jesse_james',
      questNumber: 1,
      name: 'The Letter from Liberty',

      briefing: `A dying drifter handed you a weathered letter before expiring in the dust.
        The handwriting matches known samples of Jesse James' script.
        The letter speaks of "the Missouri treasure" and mentions Liberty, Missouri -
        the site of the James Gang's first bank robbery in 1866.

        If this letter is genuine, it could lead to Jesse's hidden fortune.
        But first, you need to verify its authenticity and find out where the trail truly begins.`,

      loreEntries: [
        {
          id: 'lore_jesse_1',
          title: 'The First Robbery',
          content: `February 13, 1866. The James-Younger Gang robs the Clay County Savings Bank in Liberty, Missouri.
            $60,000 in gold coins and bonds stolen. A college student, George Wymore, killed in the street.
            It was the first daylight bank robbery in peacetime United States history.
            Jesse James was 18 years old. It's where his legend began.`,
          category: 'history',
        },
        {
          id: 'lore_jesse_2',
          title: 'The Man Behind the Myth',
          content: `Jesse Woodson James was born September 5, 1847.
            The Civil War shaped him - he rode with Bloody Bill Anderson's Confederate guerrillas at 16.
            After the war, unable to integrate into peacetime society, he turned to crime.
            Dime novels transformed him from outlaw to folk hero, Robin Hood of the frontier.
            The truth was far more complicated.`,
          category: 'history',
        },
      ],

      dialogues: [
        {
          id: 'dialogue_frank_initial',
          npcId: 'npc_frank_james',
          text: `So, you've got one of Jesse's letters, do you? Let me see it...
            *examines the paper carefully*
            That's his hand, alright. And this was written just before... before Bob Ford.
            What do you want with this? Jesse's dead. Let him rest.`,
          options: [
            {
              id: 'opt_truth',
              text: "I want to know the truth about what happened.",
              consequence: {
                type: 'npc_relationship',
                npcId: 'npc_frank_james',
                change: 10,
                relationship: 'friendly',
              },
              nextDialogueId: 'dialogue_frank_truth',
            },
            {
              id: 'opt_treasure',
              text: "I want to find the treasure he mentions.",
              consequence: {
                type: 'npc_relationship',
                npcId: 'npc_frank_james',
                change: -5,
                relationship: 'neutral',
              },
              nextDialogueId: 'dialogue_frank_treasure',
            },
            {
              id: 'opt_legend',
              text: "I want to understand the legend of Jesse James.",
              consequence: {
                type: 'npc_relationship',
                npcId: 'npc_frank_james',
                change: 5,
                relationship: 'friendly',
              },
              nextDialogueId: 'dialogue_frank_legend',
            },
          ],
          emotionalTone: 'neutral',
        },
      ],

      primaryObjectives: [
        {
          type: 'location',
          description: 'Travel to Liberty, Missouri',
          locationId: 'loc_liberty_mo',
          coordinates: { x: 1250, y: 890 },
        },
        {
          type: 'dialogue',
          description: 'Speak with Frank James about the letter',
          npcId: 'npc_frank_james',
          dialogueId: 'dialogue_frank_initial',
        },
        {
          type: 'investigation',
          description: 'Investigate the old Clay County Savings Bank',
          cluesRequired: [
            'clue_bank_safe',
            'clue_old_ledger',
            'clue_floor_marks',
          ],
          location: 'loc_clay_county_bank',
        },
      ],

      optionalObjectives: [
        {
          type: 'dialogue',
          description: 'Interview local historians about the 1866 robbery',
          npcId: 'npc_historian_blake',
          dialogueId: 'dialogue_historian',
        },
      ],

      combatEncounters: [
        {
          id: 'encounter_pinkerton_ambush',
          name: 'Pinkerton Ambush',
          description:
            'Pinkerton agents have been watching Frank James. They want that letter.',
          type: 'ambush',
          difficulty: 25,
          enemies: [
            { npcId: 'enemy_pinkerton_agent', level: 25, count: 3 },
            { npcId: 'enemy_pinkerton_detective', level: 26, count: 1 },
          ],
          rewards: {
            experience: 5000,
            gold: 250,
            items: ['item_pinkerton_badge'],
          },
        },
      ],

      questRewards: [
        { type: 'experience', amount: 8000 },
        { type: 'dollars', amount: 500 },
        { type: 'item', itemId: 'item_jesse_letter_decoded', quantity: 1 },
      ],

      worldEffects: [
        {
          type: 'npc_relationship',
          npcId: 'npc_frank_james',
          change: 15,
          relationship: 'friendly',
        },
        {
          type: 'quest_unlock',
          questId: 'quest_jesse_2',
          reason: 'Decoded Jesse James letter',
        },
      ],

      completionText: `Frank James finally opens up, his eyes distant with memory.
        "The Missouri treasure... Jesse always said if things went wrong,
        we'd have enough to disappear forever. It wasn't just gold, kid.
        It was freedom. But first, you need to understand where we came from.
        Head to Kearney. Talk to Ma. She'll tell you about the war."`,
    },

    // Quest 2: Blood on the Border
    {
      id: 'quest_jesse_2',
      chainId: 'chain_jesse_james',
      questNumber: 2,
      name: 'Blood on the Border',

      briefing: `To understand Jesse James' treasure, you must understand what made him.
        Frank has sent you to Kearney, Missouri, to speak with Zerelda Samuel,
        the James brothers' mother. She lived through the Border War,
        watched her sons become guerrillas, and never believed they were villains.

        But she's not the only one interested in the past.
        Detective Thornton of the Pinkerton Agency has tracked you here,
        and he's determined to stop you from finding what he couldn't.`,

      loreEntries: [
        {
          id: 'lore_jesse_3',
          title: 'The Border War',
          content: `1854-1865. Missouri was a battleground before the Civil War even started.
            Pro-slavery "Border Ruffians" from Missouri vs. "Jayhawkers" from Kansas.
            The James family farm was in the crossfire. Union militias tortured Jesse's stepfather,
            nearly hanged Frank, and whipped young Jesse. This violence shaped everything.`,
          category: 'history',
        },
        {
          id: 'lore_jesse_4',
          title: "Bloody Bill Anderson's Raiders",
          content: `Jesse rode with William T. Anderson, one of the most feared Confederate guerrillas.
            In 1864, at age 16, Jesse participated in the Centralia Massacre -
            24 unarmed Union soldiers executed. These weren't soldiers. These were killers.
            The war made them, and peace had no place for them.`,
          category: 'history',
        },
      ],

      dialogues: [
        {
          id: 'dialogue_zerelda_initial',
          npcId: 'npc_zerelda_samuel',
          text: `You want to know about my boys? They were good boys, driven to desperation.
            The war took everything from us. The Yankees burned our farm, tortured my husband,
            tried to kill my sons. What were they supposed to do? Forgive?

            Jesse wasn't a monster. He was a product of what was done to him.`,
          options: [
            {
              id: 'opt_sympathize',
              text: 'The war made monsters of many good men.',
              nextDialogueId: 'dialogue_zerelda_war',
            },
            {
              id: 'opt_challenge',
              text: 'But he killed innocent people after the war ended.',
              consequence: {
                type: 'npc_relationship',
                npcId: 'npc_zerelda_samuel',
                change: -10,
                relationship: 'hostile',
              },
              nextDialogueId: 'dialogue_zerelda_angry',
            },
            {
              id: 'opt_neutral',
              text: "I'm just trying to understand the truth.",
              nextDialogueId: 'dialogue_zerelda_truth',
            },
          ],
          emotionalTone: 'urgent',
        },
      ],

      primaryObjectives: [
        {
          type: 'location',
          description: 'Travel to the James family farm in Kearney',
          locationId: 'loc_james_farm',
          coordinates: { x: 1230, y: 910 },
        },
        {
          type: 'dialogue',
          description: 'Speak with Zerelda Samuel',
          npcId: 'npc_zerelda_samuel',
          dialogueId: 'dialogue_zerelda_initial',
        },
        {
          type: 'investigation',
          description: 'Search the farm for Civil War-era hiding places',
          cluesRequired: ['clue_root_cellar', 'clue_barn_floorboards', 'clue_well'],
          location: 'loc_james_farm',
        },
        {
          type: 'combat',
          description: 'Survive Detective Thornton\'s raid on the farm',
          encounterId: 'encounter_pinkerton_raid',
        },
      ],

      optionalObjectives: [
        {
          type: 'investigation',
          description: "Find evidence of the Pinkerton's 1875 attack on the farm",
          cluesRequired: ['clue_bomb_damage', 'clue_archie_grave'],
          location: 'loc_james_farm',
        },
      ],

      hiddenObjectives: [
        {
          type: 'item',
          description: "Find Jesse's childhood Bible with hidden notes",
          itemId: 'item_jesse_bible',
          quantity: 1,
        },
      ],

      combatEncounters: [
        {
          id: 'encounter_pinkerton_raid',
          name: "Thornton's Raid",
          description:
            'Detective Thornton leads a full Pinkerton assault on the James farm',
          type: 'waves',
          difficulty: 27,
          waves: 3,
          enemies: [
            { npcId: 'enemy_pinkerton_agent', level: 26, count: 4 },
            { npcId: 'enemy_pinkerton_sharpshooter', level: 27, count: 2 },
            {
              npcId: 'enemy_detective_thornton',
              level: 28,
              count: 1,
              role: 'boss',
            },
          ],
          specialRules: [
            'Must protect Zerelda Samuel (she cannot die)',
            'Enemies use cover system',
            'Time limit: 10 minutes',
          ],
          rewards: {
            experience: 7000,
            gold: 400,
            items: ['item_thornton_journal'],
          },
        },
      ],

      puzzles: [
        {
          type: 'environmental',
          description:
            'The James family had hiding spots throughout the farm. Find where Jesse hid his important documents.',
          location: 'loc_james_farm',
          interactables: [
            { id: 'int_root_cellar', description: 'Root cellar entrance', correctOrder: 3 },
            {
              id: 'int_loose_brick',
              description: 'Loose brick in fireplace',
              correctOrder: 1,
            },
            {
              id: 'int_barn_beam',
              description: 'Carved initials on barn beam',
              correctOrder: 2,
            },
            { id: 'int_old_well', description: 'Stone at bottom of well', correctOrder: 4 },
          ],
          solution: ['int_loose_brick', 'int_barn_beam', 'int_root_cellar', 'int_old_well'],
        },
      ],

      questRewards: [
        { type: 'experience', amount: 10000 },
        { type: 'dollars', amount: 750 },
        { type: 'item', itemId: 'item_war_diary', quantity: 1 },
        { type: 'item', itemId: 'item_jesse_bible', quantity: 1, unique: true },
      ],

      choiceRewards: [
        {
          choiceId: 'choice_zerelda_respect',
          rewards: [
            { type: 'item', itemId: 'item_family_photo', quantity: 1 },
          ],
        },
      ],

      worldEffects: [
        {
          type: 'npc_relationship',
          npcId: 'npc_zerelda_samuel',
          change: 20,
          relationship: 'friendly',
        },
        {
          type: 'npc_relationship',
          npcId: 'npc_detective_thornton',
          change: -30,
          relationship: 'hostile',
        },
        {
          type: 'world_state',
          stateKey: 'thornton_obsession',
          newValue: 'escalated',
          description: 'Detective Thornton is now personally hunting you',
        },
      ],

      completionText: `As Thornton's men retreat, Zerelda presses an old diary into your hands.
        "This was Jesse's during the war. He wrote about a place...
        a cave where Anderson's Raiders hid stolen gold. Some of it was never recovered.
        Jesse went back for it after the war. That might be part of his 'Missouri treasure.'
        The cave is near Rocheport, on the Missouri River. But be careful.
        That place... it has ghosts."`,
    },

    // Quest 3: The Guerrilla's Gold
    {
      id: 'quest_jesse_3',
      chainId: 'chain_jesse_james',
      questNumber: 3,
      name: "The Guerrilla's Gold",

      briefing: `Jesse's war diary speaks of "Anderson's Cache" -
        gold hidden by Bloody Bill Anderson's guerrillas in a cave near Rocheport, Missouri.
        During the war, Confederate irregulars raided Union supply lines and banks,
        stashing loot in caves throughout Missouri. Most was never recovered.

        If Jesse went back for this gold after the war, it could be the foundation
        of his legendary treasure. But you're not the only one who knows about it.
        Robert Ford, the man who killed Jesse, has been spotted in Rocheport.
        He might be looking for the same thing.`,

      loreEntries: [
        {
          id: 'lore_jesse_5',
          title: "Anderson's Cache",
          content: `During the Civil War, William T. Anderson's guerrillas hid stolen gold
            in a network of caves along the Missouri River. Anderson died in October 1864,
            shot by Union militia. The cache locations died with him - or so everyone thought.
            Jesse James was one of Anderson's riders. If anyone knew where the gold was hidden,
            it would be him.`,
          category: 'legend',
        },
        {
          id: 'lore_jesse_6',
          title: 'The Coward Robert Ford',
          content: `April 3, 1882. Robert Ford shot Jesse James in the back while he was
            adjusting a picture on the wall. Ford was pardoned and collected a reward,
            but became a pariah. The ballad said: "That dirty little coward that shot Mr. Howard,
            has laid poor Jesse in his grave." Ford lived in fear and infamy until
            he was shot dead himself in 1892. But what if Ford knew about the treasure?
            What if that's why Jesse had to die?`,
          category: 'mystery',
        },
      ],

      dialogues: [
        {
          id: 'dialogue_ford_cave',
          npcId: 'npc_robert_ford',
          text: `You! Stay back! I know why you're here. You want the gold.
            Well, it's mine! Jesse owed me! He said we'd split it, then he cut me out.
            So I... I had to do what I did. You understand, don't you?
            He was going to take it all and disappear!`,
          options: [
            {
              id: 'opt_calm',
              text: 'Put the gun down, Ford. We can both walk away.',
              nextDialogueId: 'dialogue_ford_negotiate',
            },
            {
              id: 'opt_truth',
              text: 'Tell me the truth. Why did you really kill Jesse?',
              nextDialogueId: 'dialogue_ford_confession',
            },
            {
              id: 'opt_threaten',
              text: 'You killed a legend for gold. You deserve what\'s coming.',
              consequence: {
                type: 'world_state',
                stateKey: 'ford_fate',
                newValue: 'hostile',
                description: 'Robert Ford draws his weapon',
              },
              nextDialogueId: 'dialogue_ford_hostile',
            },
          ],
          emotionalTone: 'urgent',
        },
      ],

      primaryObjectives: [
        {
          type: 'location',
          description: 'Travel to the Missouri River caves near Rocheport',
          locationId: 'loc_rocheport_caves',
          coordinates: { x: 1180, y: 930 },
        },
        {
          type: 'puzzle',
          description: "Decipher Jesse's diary to locate the correct cave",
          puzzleId: 'puzzle_cave_map',
        },
        {
          type: 'investigation',
          description: 'Search the cave for Anderson\'s hidden cache',
          cluesRequired: ['clue_confederate_marker', 'clue_false_wall', 'clue_gold_trace'],
          location: 'loc_guerrilla_cave',
        },
        {
          type: 'dialogue',
          description: 'Confront Robert Ford in the cave',
          npcId: 'npc_robert_ford',
          dialogueId: 'dialogue_ford_cave',
        },
      ],

      optionalObjectives: [
        {
          type: 'investigation',
          description: 'Find evidence of other James Gang visits to the cave',
          cluesRequired: ['clue_old_campfire', 'clue_carving'],
        },
      ],

      combatEncounters: [
        {
          id: 'encounter_ford_showdown',
          name: 'The Coward and the Truth',
          description: 'Robert Ford, desperate and paranoid, attacks',
          type: 'duel',
          difficulty: 28,
          enemies: [
            { npcId: 'enemy_robert_ford', level: 28, count: 1, role: 'boss' },
          ],
          specialRules: [
            'Ford fights dirty - uses grenades and tricks',
            'Cave environment limits movement',
            'Can be resolved peacefully with high Charisma',
          ],
          rewards: {
            experience: 6000,
            gold: 500,
            items: ['item_ford_confession', 'item_ford_revolver'],
          },
        },
      ],

      puzzles: [
        {
          type: 'cipher',
          encryptedText: 'WKHUH WKH ULYHU EHQGV DQG WKH KDZN IOLHV HDVW',
          cipherType: 'caesar',
          hint: 'Jesse used a simple cipher - three letters shifted',
          solution: 'WHERE THE RIVER BENDS AND THE HAWK FLIES EAST',
        },
        {
          type: 'treasure_map',
          mapImageUrl: '/assets/maps/rocheport_caves.png',
          clues: [
            'Where the river bends and the hawk flies east',
            'Third cave from the old loading dock',
            'Confederate marker on the wall',
          ],
          correctLocation: { x: 245, y: 178 },
          tolerance: 15,
        },
      ],

      moralChoices: [
        {
          id: 'choice_ford_fate',
          situation: `Robert Ford is broken, sobbing on the cave floor.
            He confesses that Governor Crittenden and the railroad barons
            paid him to kill Jesse - the treasure was just a bonus.
            "I was just a pawn," he cries. "They used me and threw me away."

            You could let him go, turn him in, or end him here.`,
          choiceType: 'moral',
          options: [
            {
              id: 'opt_mercy',
              description: 'Let Ford go. He\'s already in his own prison.',
              consequences: [
                {
                  type: 'npc_relationship',
                  npcId: 'npc_robert_ford',
                  change: 50,
                  relationship: 'friendly',
                },
                {
                  type: 'world_state',
                  stateKey: 'ford_alive',
                  newValue: true,
                  description: 'Robert Ford survives to help you later',
                },
              ],
              rewards: [
                { type: 'item', itemId: 'item_ford_confession_full', quantity: 1 },
              ],
              moralAlignment: 'lawful',
            },
            {
              id: 'opt_justice',
              description: 'Turn Ford over to the authorities for Jesse\'s murder.',
              consequences: [
                {
                  type: 'faction_reputation',
                  faction: 'settlers',
                  change: 25,
                  reason: 'Brought killer to justice',
                },
                {
                  type: 'world_state',
                  stateKey: 'ford_arrested',
                  newValue: true,
                  description: 'Robert Ford is arrested',
                },
              ],
              rewards: [{ type: 'dollars', amount: 1000 }],
              moralAlignment: 'lawful',
            },
            {
              id: 'opt_revenge',
              description: 'Kill Ford. Jesse deserves justice, not bureaucracy.',
              consequences: [
                {
                  type: 'faction_reputation',
                  faction: 'outlaws',
                  change: 50,
                  reason: 'Avenged Jesse James',
                },
                {
                  type: 'world_state',
                  stateKey: 'ford_dead',
                  newValue: true,
                  description: 'Robert Ford is dead',
                },
              ],
              rewards: [
                { type: 'item', itemId: 'item_ford_revolver_legendary', quantity: 1 },
              ],
              moralAlignment: 'chaotic',
            },
          ],
          timeLimit: 60,
          irreversible: true,
        },
      ],

      questRewards: [
        { type: 'experience', amount: 12000 },
        { type: 'dollars', amount: 2500 },
        { type: 'item', itemId: 'item_guerrilla_gold', quantity: 1 },
      ],

      worldEffects: [
        {
          type: 'world_state',
          stateKey: 'anderson_cache_found',
          newValue: true,
          description: 'The legendary guerrilla cache has been discovered',
        },
        {
          type: 'quest_unlock',
          questId: 'quest_jesse_4',
          reason: 'Found the first part of Jesse\'s treasure',
        },
      ],

      completionText: `The gold is real. Thousands of dollars in Union gold coins,
        stamped with dates from 1861-1864. War spoils, hidden and forgotten.

        But it's not enough. According to Jesse's letters, this was just the start.
        The real treasure - the one that would let him disappear forever -
        is still out there. And now you have a confession from Robert Ford
        that changes everything you thought you knew about Jesse James' death.

        The conspiracy goes deeper than you imagined.`,
    },

    // Quest 4: The Northfield Job
    {
      id: 'quest_jesse_4',
      chainId: 'chain_jesse_james',
      questNumber: 4,
      name: 'The Northfield Disaster',

      briefing: `September 7, 1876. The James-Younger Gang attempted to rob
        the First National Bank in Northfield, Minnesota. It was a catastrophe.
        Two gang members killed, the Younger brothers captured, Jesse and Frank barely escaped.

        But according to Ford's confession and Jesse's letters,
        the Northfield job wasn't just a robbery - it was a setup.
        Someone wanted the gang dead, and Jesse suspected the railroad barons.
        The question is: why? And what did Jesse discover that sealed his fate?

        You need to go to Northfield and uncover what really happened.`,

      loreEntries: [
        {
          id: 'lore_jesse_7',
          title: 'The Northfield Raid',
          content: `The Northfield raid was supposed to be routine. Instead, it was a bloodbath.
            The townspeople fought back with deadly force. Clell Miller and Bill Chadwell died.
            The Younger brothers were captured. Jesse and Frank fled across 400 miles of hostile territory.
            It broke the James-Younger Gang forever. After Northfield, Jesse was never the same.
            He became paranoid, trusting no one. What did he learn that day?`,
          category: 'history',
        },
        {
          id: 'lore_jesse_8',
          title: 'The Railroad Conspiracy',
          content: `In the 1870s-80s, railroad companies wielded enormous power.
            They hired Pinkerton agents, pressured politicians, and eliminated threats.
            The James Gang robbed trains, making them enemies of the most powerful men in America.
            Some historians believe Jesse stumbled onto evidence of corruption so vast
            that the railroad barons had to destroy him. Others say it's just legend.`,
          category: 'mystery',
        },
      ],

      dialogues: [
        {
          id: 'dialogue_annie_northfield',
          npcId: 'npc_annie_ralston',
          text: `So you found me. I've been expecting someone, eventually.
            Jesse trusted me with the truth about Northfield.
            It wasn't bad luck - it was betrayal. Someone tipped off the town,
            made sure the citizens were armed and ready. Jesse figured it out too late.

            He spent his last years trying to prove the railroad conspiracy,
            gathering evidence. That's what got him killed, not robbery.`,
          options: [
            {
              id: 'opt_evidence',
              text: 'Do you have this evidence?',
              nextDialogueId: 'dialogue_annie_evidence',
            },
            {
              id: 'opt_trust',
              text: 'Why should I believe you?',
              nextDialogueId: 'dialogue_annie_trust',
            },
            {
              id: 'opt_treasure',
              text: 'What about the treasure Jesse mentioned?',
              nextDialogueId: 'dialogue_annie_treasure',
            },
          ],
          emotionalTone: 'mysterious',
        },
      ],

      primaryObjectives: [
        {
          type: 'location',
          description: 'Travel to Northfield, Minnesota',
          locationId: 'loc_northfield',
          coordinates: { x: 1450, y: 650 },
        },
        {
          type: 'investigation',
          description: 'Investigate the First National Bank building',
          cluesRequired: [
            'clue_bullet_holes',
            'clue_bank_records',
            'clue_telegraph',
          ],
          location: 'loc_northfield_bank',
        },
        {
          type: 'dialogue',
          description: 'Find and interview Annie Ralston, who disappeared after Jesse\'s death',
          npcId: 'npc_annie_ralston',
          dialogueId: 'dialogue_annie_northfield',
        },
        {
          type: 'item',
          description: 'Recover Jesse\'s hidden documents from Annie',
          itemId: 'item_railroad_evidence',
          quantity: 1,
        },
      ],

      optionalObjectives: [
        {
          type: 'investigation',
          description: 'Interview descendants of the Northfield townspeople',
          cluesRequired: ['clue_manning_testimony', 'clue_heywood_diary'],
        },
      ],

      combatEncounters: [
        {
          id: 'encounter_railroad_assassins',
          name: 'Railroad Enforcers',
          description:
            'The railroad has sent professional killers to stop you from uncovering the truth',
          type: 'ambush',
          difficulty: 29,
          enemies: [
            { npcId: 'enemy_railroad_enforcer', level: 29, count: 3 },
            { npcId: 'enemy_railroad_sniper', level: 30, count: 2 },
            {
              npcId: 'enemy_enforcer_boss',
              level: 31,
              count: 1,
              role: 'boss',
            },
          ],
          specialRules: [
            'Enemies have superior equipment',
            'Urban combat environment',
            'Civilians must be protected',
          ],
          rewards: {
            experience: 8000,
            gold: 600,
            items: ['item_railroad_orders', 'item_enforcer_badge'],
          },
        },
      ],

      puzzles: [
        {
          type: 'information',
          question:
            'Who sent the telegraph warning Northfield about the James Gang on September 7, 1876?',
          npcsWithInfo: ['npc_telegraph_clerk', 'npc_bank_manager', 'npc_annie_ralston'],
          correctAnswer: 'Railroad superintendent Samuel Clarke',
          wrongAnswerConsequence: 'Railroad enforcers are alerted to your investigation',
        },
      ],

      moralChoices: [
        {
          id: 'choice_evidence_use',
          situation: `You now possess documentary evidence that railroad executives
            orchestrated the Northfield ambush and later arranged Jesse's murder
            to cover up massive corruption. This evidence could:

            - Expose the truth and clear Jesse's name (partially)
            - Destroy powerful families and businesses
            - Cause economic chaos across the frontier
            - Put a target on your back forever

            What do you do with this information?`,
          choiceType: 'truth',
          options: [
            {
              id: 'opt_expose',
              description: 'Publish the evidence. The truth must come out.',
              consequences: [
                {
                  type: 'world_state',
                  stateKey: 'railroad_conspiracy_exposed',
                  newValue: true,
                  description: 'The railroad conspiracy becomes public knowledge',
                },
                {
                  type: 'faction_reputation',
                  faction: 'settlers',
                  change: 50,
                  reason: 'Exposed corporate corruption',
                },
                {
                  type: 'world_state',
                  stateKey: 'railroad_bounty',
                  newValue: 5000,
                  description: 'Railroad companies put a bounty on your head',
                },
              ],
              rewards: [
                { type: 'title', titleId: 'title_truthseeker', titleName: 'The Truth Seeker' },
              ],
              moralAlignment: 'lawful',
            },
            {
              id: 'opt_leverage',
              description: 'Use the evidence as leverage for personal gain.',
              consequences: [
                {
                  type: 'world_state',
                  stateKey: 'railroad_leverage',
                  newValue: true,
                  description: 'You have leverage over the railroad companies',
                },
              ],
              rewards: [
                { type: 'dollars', amount: 10000 },
                { type: 'property', propertyId: 'prop_railroad_depot' },
              ],
              moralAlignment: 'neutral',
            },
            {
              id: 'opt_hide',
              description: 'Hide the evidence. Some truths are too dangerous.',
              consequences: [
                {
                  type: 'world_state',
                  stateKey: 'evidence_hidden',
                  newValue: true,
                  description: 'The truth remains buried',
                },
              ],
              rewards: [
                { type: 'item', itemId: 'item_railroad_safe_passage', quantity: 1 },
              ],
              moralAlignment: 'neutral',
            },
          ],
          timeLimit: 120,
          irreversible: true,
        },
      ],

      questRewards: [
        { type: 'experience', amount: 15000 },
        { type: 'dollars', amount: 1500 },
        { type: 'item', itemId: 'item_railroad_evidence', quantity: 1, unique: true },
      ],

      worldEffects: [
        {
          type: 'npc_relationship',
          npcId: 'npc_annie_ralston',
          change: 30,
          relationship: 'friendly',
        },
        {
          type: 'world_state',
          stateKey: 'jesse_truth_revealed',
          newValue: 'partial',
          description: 'The truth about Jesse James begins to emerge',
        },
      ],

      completionText: `The evidence is damning. Railroad executives conspired to destroy Jesse James
        because he was gathering proof of their crimes - land theft, murder, political corruption.

        Annie gives you one more piece of the puzzle:
        "Jesse hid the bulk of his treasure as insurance. If anything happened to him,
        Frank was supposed to use it to expose the railroad. But Frank... Frank just wanted peace.
        The treasure is still out there. Jesse's final job - the one he planned to use
        as evidence - that's where you'll find it. Blue Cut, Missouri. July 1881."`,
    },

    // Quest 5: The Blue Cut Legacy
    {
      id: 'quest_jesse_5',
      chainId: 'chain_jesse_james',
      questNumber: 5,
      name: 'The Blue Cut Legacy',

      briefing: `September 7, 1881. The Chicago and Alton Railroad train was stopped at Blue Cut, Missouri.
        The James Gang took $3,000, but Jesse left something behind - evidence.
        Documents stolen from a railroad executive's safe, hidden near the robbery site.

        This was Jesse's last major robbery before his death. According to Annie,
        he was planning to use the stolen documents to expose the railroad conspiracy.
        But he died before he could act. The documents - and the treasure - remain hidden.

        Time to finish what Jesse James started.`,

      loreEntries: [
        {
          id: 'lore_jesse_9',
          title: 'The Blue Cut Robbery',
          content: `The last great James Gang robbery. September 7, 1881, five years to the day
            after Northfield. Was the date choice intentional? A message?
            Jesse stopped a passenger train, robbed it efficiently, and disappeared.
            Six months later, he was dead. Some say he knew his time was running out.`,
          category: 'history',
        },
        {
          id: 'lore_jesse_10',
          title: 'Jesse\'s Final Days',
          content: `In early 1882, Jesse moved to St. Joseph, Missouri, using the name "Thomas Howard."
            He was paranoid, trusting only the Ford brothers. Bad choice.
            April 3, 1882, he was shot in the back by Robert Ford while unarmed.
            His last words, according to some accounts: "That picture is crooked."
            He was 34 years old. His legend was just beginning.`,
          category: 'history',
        },
      ],

      dialogues: [
        {
          id: 'dialogue_frank_final',
          npcId: 'npc_frank_james',
          text: `You've come far, and you've learned the truth. More than I ever wanted known.
            Jesse wasn't just an outlaw. He was trying to be something more, in the end.
            Trying to make his crimes mean something. Trying to fight back against
            the men who really ran this country.

            The treasure at Blue Cut... it's not just gold. It's Jesse's legacy.
            Everything he stole, everything he saved, and the evidence that cost him his life.
            I never went back for it. Couldn't face it. But maybe you can finish this.`,
          options: [
            {
              id: 'opt_promise',
              text: 'I\'ll finish it. For Jesse, and for the truth.',
              nextDialogueId: 'dialogue_frank_promise',
            },
            {
              id: 'opt_question',
              text: 'Why didn\'t you use the evidence after Jesse died?',
              nextDialogueId: 'dialogue_frank_regret',
            },
          ],
          emotionalTone: 'mysterious',
        },
      ],

      primaryObjectives: [
        {
          type: 'location',
          description: 'Travel to Blue Cut, Missouri',
          locationId: 'loc_blue_cut',
          coordinates: { x: 1200, y: 920 },
        },
        {
          type: 'puzzle',
          description: 'Decipher Jesse\'s final instructions to locate the cache',
          puzzleId: 'puzzle_blue_cut_location',
        },
        {
          type: 'investigation',
          description: 'Excavate the hidden cache at Blue Cut',
          cluesRequired: [
            'clue_rail_marker',
            'clue_buried_box',
            'clue_jesse_map',
          ],
          location: 'loc_blue_cut',
        },
        {
          type: 'combat',
          description: 'Defend the site from Detective Thornton\'s final assault',
          encounterId: 'encounter_thornton_final',
        },
      ],

      optionalObjectives: [],

      combatEncounters: [
        {
          id: 'encounter_thornton_final',
          name: "Thornton's Last Stand",
          description:
            'Detective Thornton has tracked you to Blue Cut. He will stop at nothing.',
          type: 'boss',
          difficulty: 32,
          enemies: [
            { npcId: 'enemy_pinkerton_elite', level: 30, count: 4 },
            { npcId: 'enemy_pinkerton_sharpshooter', level: 31, count: 2 },
            {
              npcId: 'enemy_thornton_final',
              level: 33,
              count: 1,
              role: 'boss',
            },
          ],
          specialRules: [
            'Thornton has legendary equipment',
            'Train arrives mid-battle, changing terrain',
            'Can recruit Frank James to help (if relationship high)',
            'Epic boss battle with multiple phases',
          ],
          rewards: {
            experience: 12000,
            gold: 1000,
            items: [
              'item_thornton_badge_legendary',
              'item_pinkerton_revolver',
            ],
          },
        },
      ],

      puzzles: [
        {
          type: 'cipher',
          encryptedText:
            'ZKHUH WKH LURQ KRTTH PHHWV WKH VWRQH, ILYH SDFHV QRUWK RI ZKHUA WKH EORRG ZDV VSLOOHG',
          cipherType: 'caesar',
          hint: 'Same cipher Jesse always used',
          solution:
            'WHERE THE IRON HORSE MEETS THE STONE, FIVE PACES NORTH OF WHERE THE BLOOD WAS SPILLED',
        },
        {
          type: 'treasure_map',
          mapImageUrl: '/assets/maps/blue_cut_1881.png',
          clues: [
            'Where the iron horse meets the stone',
            'Five paces north of where the blood was spilled',
            'Beneath the twisted oak',
          ],
          correctLocation: { x: 312, y: 445 },
          tolerance: 10,
        },
      ],

      moralChoices: [
        {
          id: 'choice_thornton_fate',
          situation: `Detective Thornton lies defeated. For 20 years he hunted the James Gang.
            He's old, broken, and his obsession has consumed his life.

            "Just finish it," he says. "I've got nothing left anyway.
            They used me just like they used Ford. I was just another tool."

            He knows the truth now. He knows he was on the wrong side.
            But he's also tried to kill you multiple times.`,
          choiceType: 'moral',
          options: [
            {
              id: 'opt_spare',
              description: 'Spare Thornton. He\'s a victim too, in his way.',
              consequences: [
                {
                  type: 'npc_relationship',
                  npcId: 'npc_detective_thornton',
                  change: 100,
                  relationship: 'friendly',
                },
                {
                  type: 'world_state',
                  stateKey: 'thornton_helps',
                  newValue: true,
                  description: 'Thornton becomes an unlikely ally',
                },
              ],
              rewards: [
                {
                  type: 'item',
                  itemId: 'item_thornton_testimony',
                  quantity: 1,
                },
              ],
              moralAlignment: 'lawful',
            },
            {
              id: 'opt_walk_away',
              description: 'Walk away. His fate is his own.',
              consequences: [
                {
                  type: 'world_state',
                  stateKey: 'thornton_survived',
                  newValue: true,
                  description: 'Thornton lives with his failure',
                },
              ],
              moralAlignment: 'neutral',
            },
            {
              id: 'opt_end',
              description: 'End his suffering. It\'s mercy.',
              consequences: [
                {
                  type: 'world_state',
                  stateKey: 'thornton_dead',
                  newValue: true,
                  description: 'Detective Thornton is dead',
                },
                {
                  type: 'faction_reputation',
                  faction: 'outlaws',
                  change: 30,
                  reason: 'Killed a legendary Pinkerton',
                },
              ],
              moralAlignment: 'chaotic',
            },
          ],
          irreversible: true,
        },
      ],

      questRewards: [
        { type: 'experience', amount: 18000 },
        { type: 'dollars', amount: 5000 },
        { type: 'item', itemId: 'item_jesse_treasure_cache', quantity: 1, unique: true },
        { type: 'item', itemId: 'item_railroad_documents', quantity: 1, unique: true },
      ],

      worldEffects: [
        {
          type: 'world_state',
          stateKey: 'jesse_treasure_found',
          newValue: true,
          description: 'Jesse James\' legendary treasure has been recovered',
        },
        {
          type: 'quest_unlock',
          questId: 'quest_jesse_6',
          reason: 'Found the treasure and the truth',
        },
      ],

      completionText: `The cache is everything Annie promised. Gold, bonds, stolen payroll -
        worth a fortune. But more importantly, the documents: contracts, letters,
        telegrams proving the railroad conspiracy. Murder orders. Bribery records.
        Everything Jesse died trying to expose.

        And at the bottom of the chest, a letter addressed "To whoever finds this."
        It's from Jesse, written days before his death. He knew the end was coming.
        He knew Bob Ford would betray him. He knew the railroad would win.

        But he believed someday, someone would find the truth and finish what he started.
        Time for the final choice: What will you do with Jesse James' legacy?`,
    },

    // Quest 6: The Legend Lives On
    {
      id: 'quest_jesse_6',
      chainId: 'chain_jesse_james',
      questNumber: 6,
      name: 'The Legend Lives On',

      briefing: `You have Jesse James' treasure. You have the truth about his death.
        You have evidence that could destroy the most powerful men in America.

        Now comes the hardest part: deciding what it all means.

        Jesse James was a murderer and a thief. He was also a victim of war,
        a man who fought back against corrupt power, and a legend who inspired millions.

        The truth is complicated. History is never simple.
        And now you must decide how this story ends.

        Return to St. Joseph, Missouri, where Jesse died, and make your final choice.`,

      loreEntries: [
        {
          id: 'lore_jesse_11',
          title: 'The Many Legends',
          content: `In the years after his death, Jesse James became everyone's hero.
            Dime novels cast him as Robin Hood. Songs praised him as a rebel against injustice.
            Confederate sympathizers made him a martyr. The reality was more complex.
            He killed innocent people. He robbed from everyone, not just the rich.
            But he also stood against corporate power when few others dared.
            The legend and the man are forever tangled.`,
          category: 'legend',
        },
        {
          id: 'lore_jesse_12',
          title: 'The Final Truth',
          content: `Jesse Woodson James died April 3, 1882. His legend never will.
            Was he hero or villain? Both? Neither? History will argue forever.
            But one thing is certain: in the lawless frontier, caught between
            corporate greed and government corruption, Jesse James chose to fight back.
            Even if his methods were wrong, his enemy was real.
            And sometimes, that's all legends need to live forever.`,
          category: 'truth',
        },
      ],

      dialogues: [
        {
          id: 'dialogue_final_frank',
          npcId: 'npc_frank_james',
          text: `You found it all. The treasure, the truth, the evidence.
            Jesse would be... I don't know. Proud? Vindicated? He was complicated.

            So now what? You've got power - real power. Money, evidence, leverage.
            You can clear Jesse's name. Destroy the railroad. Get rich. Disappear.

            What will you do? What would Jesse want you to do?`,
          options: [
            {
              id: 'opt_legacy',
              text: 'What do you think Jesse would want?',
              nextDialogueId: 'dialogue_frank_wisdom',
            },
            {
              id: 'opt_truth',
              text: 'I want to do what\'s right, not what Jesse would want.',
              nextDialogueId: 'dialogue_frank_respect',
            },
          ],
          emotionalTone: 'mysterious',
        },
      ],

      primaryObjectives: [
        {
          type: 'location',
          description: 'Travel to St. Joseph, Missouri - where Jesse died',
          locationId: 'loc_st_joseph',
          coordinates: { x: 1210, y: 900 },
        },
        {
          type: 'dialogue',
          description: 'Speak with Frank James about Jesse\'s legacy',
          npcId: 'npc_frank_james',
          dialogueId: 'dialogue_final_frank',
        },
        {
          type: 'investigation',
          description: 'Visit the house where Jesse was killed',
          cluesRequired: ['clue_bullet_hole', 'clue_crooked_picture'],
          location: 'loc_jesse_death_house',
        },
      ],

      optionalObjectives: [
        {
          type: 'location',
          description: 'Visit Jesse\'s grave in Kearney',
          locationId: 'loc_jesse_grave',
        },
      ],

      combatEncounters: [],

      moralChoices: [
        {
          id: 'choice_final_legacy',
          situation: `You stand where Jesse James died, holding his legacy in your hands.
            The treasure could change your life. The evidence could change history.
            The truth could clear his name - or condemn it forever.

            What do you do with the legend of Jesse James?`,
          choiceType: 'truth',
          options: [
            {
              id: 'opt_expose_all',
              description:
                'Expose everything. The full truth about Jesse, the railroad, all of it.',
              consequences: [
                {
                  type: 'world_state',
                  stateKey: 'jesse_truth_revealed',
                  newValue: 'complete',
                  description: 'The complete truth about Jesse James becomes public',
                },
                {
                  type: 'faction_reputation',
                  faction: 'settlers',
                  change: 100,
                  reason: 'Exposed massive corruption',
                },
                {
                  type: 'faction_reputation',
                  faction: 'outlaws',
                  change: 50,
                  reason: 'Vindicated Jesse James',
                },
                {
                  type: 'world_state',
                  stateKey: 'railroad_destroyed',
                  newValue: true,
                  description: 'Railroad companies face devastating consequences',
                },
              ],
              rewards: [
                {
                  type: 'title',
                  titleId: 'title_legend_truth',
                  titleName: 'Legend of the West',
                },
                { type: 'dollars', amount: 10000 },
                {
                  type: 'item',
                  itemId: 'item_jesse_revolver_legendary',
                  quantity: 1,
                  unique: true,
                },
              ],
              moralAlignment: 'lawful',
            },
            {
              id: 'opt_preserve_legend',
              description:
                'Keep the truth hidden. Let Jesse remain a legend, not a man.',
              consequences: [
                {
                  type: 'world_state',
                  stateKey: 'jesse_legend_preserved',
                  newValue: true,
                  description: 'The legend of Jesse James grows stronger',
                },
                {
                  type: 'faction_reputation',
                  faction: 'outlaws',
                  change: 100,
                  reason: 'Preserved Jesse\'s legend',
                },
              ],
              rewards: [
                {
                  type: 'title',
                  titleId: 'title_keeper_legends',
                  titleName: 'Keeper of Legends',
                },
                { type: 'dollars', amount: 20000 },
                {
                  type: 'item',
                  itemId: 'item_outlaw_mask_legendary',
                  quantity: 1,
                  unique: true,
                },
              ],
              moralAlignment: 'neutral',
            },
            {
              id: 'opt_take_treasure',
              description:
                'Take the treasure and disappear. Let history argue itself.',
              consequences: [
                {
                  type: 'world_state',
                  stateKey: 'treasure_taken',
                  newValue: true,
                  description: 'The treasure vanishes, the truth remains buried',
                },
              ],
              rewards: [
                { type: 'dollars', amount: 50000 },
                {
                  type: 'item',
                  itemId: 'item_james_gang_revolver',
                  quantity: 1,
                  unique: true,
                },
                {
                  type: 'property',
                  propertyId: 'prop_hidden_ranch',
                },
              ],
              moralAlignment: 'chaotic',
            },
            {
              id: 'opt_return_treasure',
              description:
                'Return the stolen money to the families Jesse robbed. Justice over legend.',
              consequences: [
                {
                  type: 'world_state',
                  stateKey: 'treasure_returned',
                  newValue: true,
                  description: 'The treasure is returned to victims',
                },
                {
                  type: 'faction_reputation',
                  faction: 'settlers',
                  change: 150,
                  reason: 'Returned stolen money to victims',
                },
              ],
              rewards: [
                {
                  type: 'title',
                  titleId: 'title_true_justice',
                  titleName: 'Champion of Justice',
                },
                { type: 'skill_points', amount: 10 },
                {
                  type: 'item',
                  itemId: 'item_redemption_badge',
                  quantity: 1,
                  unique: true,
                },
              ],
              moralAlignment: 'lawful',
            },
          ],
          irreversible: true,
        },
      ],

      questRewards: [
        { type: 'experience', amount: 25000 },
      ],

      worldEffects: [
        {
          type: 'world_state',
          stateKey: 'jesse_james_chain_complete',
          newValue: true,
          description: 'The Legend of Jesse James is complete',
        },
      ],

      completionText: `The choice is made. Jesse James' story is finally told.

        You walk away from the little house where a legend died,
        carrying the weight of history and the burden of truth.

        In the end, Jesse James was neither hero nor villain - just a man
        shaped by violence, driven by desperation, and transformed by legend
        into something larger than life.

        The treasure is yours, or given away, or exposed to the world.
        But more importantly, you know the truth.
        And in the West, the truth is the rarest treasure of all.`,
    },
  ],

  chainRewards: [
    {
      milestone: 2,
      description: 'Survived the Pinkerton assault',
      rewards: [
        { type: 'dollars', amount: 1000 },
        { type: 'item', itemId: 'item_pinkerton_duster', quantity: 1 },
      ],
    },
    {
      milestone: 4,
      description: 'Uncovered the railroad conspiracy',
      rewards: [
        { type: 'skill_points', amount: 5 },
        { type: 'item', itemId: 'item_railroad_watch', quantity: 1 },
      ],
    },
    {
      milestone: 6,
      description: 'Completed Jesse James legendary chain',
      rewards: [
        { type: 'dollars', amount: 5000 },
        { type: 'skill_points', amount: 10 },
      ],
    },
  ],

  uniqueItems: [
    {
      id: 'item_james_gang_revolver',
      name: "James Gang Revolver",
      description:
        "Jesse James' personal revolver. A .44 caliber Colt with 'J.W.J.' carved into the grip.",
      type: 'weapon',
      rarity: 'legendary',
      stats: {
        damage: 85,
        accuracy: 90,
        speed: 85,
        intimidation: 25,
      },
      specialAbility:
        'Quick Draw: First shot in combat is automatic critical hit',
    },
    {
      id: 'item_outlaw_mask_legendary',
      name: "Outlaw's Bandana",
      description:
        'A red bandana worn by members of the James-Younger Gang. It carries the weight of legend.',
      type: 'cosmetic',
      rarity: 'legendary',
      stats: {
        charisma: 15,
        intimidation: 20,
      },
      specialAbility: 'Legend of the West: +25% reputation gains with Outlaws faction',
    },
    {
      id: 'item_railroad_watch',
      name: "Tycoon's Pocket Watch",
      description:
        'An expensive watch stolen from a railroad executive. Time is money.',
      type: 'utility',
      rarity: 'legendary',
      stats: {
        perception: 10,
      },
      specialAbility:
        'Perfect Timing: Reduces cooldown on all abilities by 15%',
    },
  ],

  titleUnlocked: 'Legend of the West',
  achievementId: 'achievement_jesse_james_complete',

  estimatedDuration: '8-12 hours',
  difficulty: 'very hard',

  icon: '/assets/icons/jesse_james.png',
  bannerImage: '/assets/banners/jesse_james_chain.jpg',
  tags: ['historical', 'outlaw', 'conspiracy', 'treasure', 'western-legend'],
};
