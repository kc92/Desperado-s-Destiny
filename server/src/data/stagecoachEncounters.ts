/**
 * Stagecoach Random Encounters
 *
 * Random events that can occur during stagecoach travel
 */

import { StagecoachEncounter, EncounterChoice } from '@desperados/shared';

/**
 * Encounter probability by danger level
 */
export const ENCOUNTER_RATES = {
  1: 0.05,   // 5% chance
  2: 0.08,
  3: 0.12,
  4: 0.16,
  5: 0.20,
  6: 0.25,
  7: 0.30,
  8: 0.35,
  9: 0.40,
  10: 0.50,  // 50% chance
};

/**
 * Random encounter templates
 */
export const STAGECOACH_ENCOUNTERS: Record<string, StagecoachEncounter[]> = {
  // Low danger encounters (1-3)
  low_danger: [
    {
      type: 'traveler',
      severity: 1,
      description: 'A lone traveler on foot waves for the stagecoach to stop. He looks exhausted and claims his horse went lame.',
      choices: [
        {
          id: 'help_traveler',
          text: 'Offer him a ride to the next station',
          consequences: {
            success: 'The grateful traveler shares his trail rations. (+10 gold tip)',
            failure: 'The traveler boards. He seems nervous...',
          },
          rewards: { gold: 10, reputation: 5 },
        },
        {
          id: 'ignore_traveler',
          text: 'Wave him off and continue',
          consequences: {
            success: 'The stagecoach continues without delay.',
            failure: 'You later hear rumors of an honest man left to die.',
          },
        },
        {
          id: 'suspicious',
          text: 'Question him (Cunning check)',
          skillCheck: { skill: 'cunning', difficulty: 12 },
          consequences: {
            success: 'You spot a hidden pistol. He\'s a scout for bandits! You avoid the ambush.',
            failure: 'He seems legitimate. You offer him a ride.',
          },
          rewards: { xp: 50, reputation: 10 },
        },
      ],
      resolved: false,
    },
    {
      type: 'wildlife',
      severity: 2,
      description: 'A herd of wild horses crosses the road ahead. The stagecoach driver reins in the team.',
      choices: [
        {
          id: 'wait_patiently',
          text: 'Wait for them to pass',
          consequences: {
            success: 'The horses pass peacefully. You resume the journey. (10 minute delay)',
            failure: 'One passenger complains about the delay.',
          },
        },
        {
          id: 'drive_through',
          text: 'Drive through carefully',
          skillCheck: { skill: 'gunslinger', difficulty: 10 },
          consequences: {
            success: 'The driver expertly guides the coach through the herd without spooking them.',
            failure: 'The horses spook! One kicks the coach, causing minor damage.',
          },
        },
        {
          id: 'rope_horse',
          text: 'Try to rope one (Spirit check)',
          skillCheck: { skill: 'spirit', difficulty: 15 },
          consequences: {
            success: 'You successfully rope a magnificent wild stallion! (Worth 150 gold)',
            failure: 'You fail to rope one. The herd stampedes, causing a 30 minute delay.',
          },
          rewards: { gold: 150, xp: 100 },
        },
      ],
      resolved: false,
    },
    {
      type: 'weather_delay',
      severity: 2,
      description: 'Dark clouds gather overhead. The driver suggests stopping at the next station to wait out the storm.',
      choices: [
        {
          id: 'stop_and_wait',
          text: 'Stop at the next station',
          consequences: {
            success: 'You wait out the storm safely. The delay costs 2 hours but everyone stays dry.',
            failure: 'The storm passes quickly. You wasted time.',
          },
        },
        {
          id: 'press_on',
          text: 'Continue through the weather',
          consequences: {
            success: 'The rain is light. You make it through with minimal delay.',
            failure: 'A torrential downpour! The coach gets stuck in mud. (3 hour delay)',
          },
        },
      ],
      resolved: false,
    },
  ],

  // Medium danger encounters (4-6)
  medium_danger: [
    {
      type: 'bandit_sighting',
      severity: 5,
      description: 'The shotgun guard spots riders on a distant ridge, pacing the stagecoach. They\'re keeping their distance but watching.',
      choices: [
        {
          id: 'act_normal',
          text: 'Continue as if you haven\'t noticed',
          consequences: {
            success: 'The riders lose interest and veer off. They were just curious.',
            failure: 'They interpret your ignorance as weakness and move to attack!',
          },
        },
        {
          id: 'show_force',
          text: 'Display weapons prominently',
          skillCheck: { skill: 'gunslinger', difficulty: 14 },
          consequences: {
            success: 'The riders see you\'re well-armed and decide not to risk it. They ride off.',
            failure: 'They see it as a challenge! Combat is imminent.',
          },
          rewards: { xp: 75 },
        },
        {
          id: 'speed_up',
          text: 'Whip the horses to outrun them',
          consequences: {
            success: 'The stagecoach races ahead! You lose the riders.',
            failure: 'A wheel takes damage from the rough speed. You slow down, and they catch up.',
          },
        },
      ],
      resolved: false,
    },
    {
      type: 'breakdown',
      severity: 4,
      description: 'CRACK! One of the wheels splinters. The coach lurches to a halt. The driver inspects the damage - it\'s bad.',
      choices: [
        {
          id: 'repair_wheel',
          text: 'Help repair the wheel (Craft check)',
          skillCheck: { skill: 'craft', difficulty: 16 },
          consequences: {
            success: 'You successfully repair the wheel with supplies from the coach. (1 hour delay)',
            failure: 'The repair fails. You need to limp to the next station. (3 hour delay)',
          },
          rewards: { xp: 100 },
        },
        {
          id: 'ride_for_help',
          text: 'Ride to the nearest station for help',
          consequences: {
            success: 'You bring back a blacksmith. The wheel is replaced. (2 hour delay, costs 25 gold)',
            failure: 'By the time you return, bandits have spotted the disabled coach!',
          },
        },
        {
          id: 'makeshift_fix',
          text: 'Create a makeshift fix to limp along',
          skillCheck: { skill: 'cunning', difficulty: 13 },
          consequences: {
            success: 'Your clever solution gets the coach moving slowly. You make it to the next station.',
            failure: 'The fix fails catastrophically. The axle breaks. (4+ hour delay)',
          },
        },
      ],
      resolved: false,
    },
    {
      type: 'ambush',
      severity: 6,
      description: 'Gunshots! A fallen tree blocks the road - it\'s a trap! Armed men emerge from cover on both sides.',
      choices: [
        {
          id: 'fight_back',
          text: 'Fight back! (Combat)',
          skillCheck: { skill: 'gunslinger', difficulty: 16 },
          consequences: {
            success: 'You drive off the attackers! They flee, leaving a few dropped weapons.',
            failure: 'You\'re overwhelmed. They take the strongbox and any visible valuables.',
          },
          rewards: { gold: 100, xp: 200, reputation: 20 },
        },
        {
          id: 'surrender_valuables',
          text: 'Throw them valuables to avoid bloodshed',
          consequences: {
            success: 'They take the goods and leave. No one is hurt, but cargo is lost.',
            failure: 'They take everything and shoot someone anyway. Brutal bandits.',
          },
        },
        {
          id: 'driver_escape',
          text: 'Tell driver to crash through! (Spirit check)',
          skillCheck: { skill: 'spirit', difficulty: 18 },
          consequences: {
            success: 'The driver whips the horses into a frenzy! You crash through the ambush!',
            failure: 'The horses refuse to charge. You\'re sitting ducks now.',
          },
          rewards: { xp: 150, reputation: 15 },
        },
      ],
      resolved: false,
    },
    {
      type: 'lawmen',
      severity: 3,
      description: 'A US Marshal and two deputies stop the stagecoach. "Routine inspection," the Marshal says. "Everyone step out."',
      choices: [
        {
          id: 'cooperate_fully',
          text: 'Cooperate with the inspection',
          consequences: {
            success: 'The inspection goes smoothly. The Marshal thanks you for your cooperation.',
            failure: 'They find contraband in the cargo! (Not yours, but still trouble)',
          },
        },
        {
          id: 'fast_talk',
          text: 'Try to talk your way out (Cunning check)',
          skillCheck: { skill: 'cunning', difficulty: 15 },
          consequences: {
            success: 'You convince them you\'re in a rush with urgent business. They let you pass.',
            failure: 'The Marshal doesn\'t buy it. Now he\'s suspicious of YOU specifically.',
          },
        },
        {
          id: 'check_badge',
          text: 'Ask to see his badge (Spirit check)',
          skillCheck: { skill: 'spirit', difficulty: 17 },
          consequences: {
            success: 'He hesitates! He\'s FAKE! You expose the bandits and they flee.',
            failure: 'He shows a real badge. Now you\'ve insulted a real US Marshal.',
          },
          rewards: { gold: 200, xp: 250, reputation: 30 },
        },
      ],
      resolved: false,
    },
  ],

  // High danger encounters (7-10)
  high_danger: [
    {
      type: 'ambush',
      severity: 8,
      description: 'AMBUSH! Professional outlaws with rifles on the cliffs above! The driver is hit immediately. This is a coordinated attack.',
      choices: [
        {
          id: 'return_fire',
          text: 'Return fire! (Combat - HARD)',
          skillCheck: { skill: 'gunslinger', difficulty: 20 },
          consequences: {
            success: 'Against all odds, you fight them off! Incredible shooting!',
            failure: 'You\'re pinned down. They strip the coach of everything valuable.',
          },
          rewards: { gold: 300, xp: 400, reputation: 50 },
        },
        {
          id: 'surrender_immediately',
          text: 'Surrender to save lives',
          consequences: {
            success: 'They take everything but spare the passengers. Professional thieves.',
            failure: 'They take everything AND shoot the driver. Ruthless killers.',
          },
        },
        {
          id: 'grab_reins',
          text: 'Grab the reins and make a run for it!',
          skillCheck: { skill: 'spirit', difficulty: 19 },
          consequences: {
            success: 'You grab the reins and drive like hell! Bullets whiz past but you escape!',
            failure: 'You\'re shot off the driver\'s seat. The horses panic and crash.',
          },
          rewards: { xp: 300, reputation: 40 },
        },
      ],
      resolved: false,
    },
    {
      type: 'ambush',
      severity: 9,
      description: 'The Comanche Twins! Two legendary bounty hunters step into the road ahead. They\'re not after the stagecoach - they\'re after YOU.',
      choices: [
        {
          id: 'fight_twins',
          text: 'Face them in combat (VERY HARD)',
          skillCheck: { skill: 'gunslinger', difficulty: 22 },
          consequences: {
            success: 'LEGENDARY! You defeat the Comanche Twins! Your name will be remembered!',
            failure: 'They\'re too skilled. You\'re captured and brought to justice.',
          },
          rewards: { gold: 500, xp: 1000, reputation: 100 },
        },
        {
          id: 'negotiate_twins',
          text: 'Try to negotiate (Cunning check)',
          skillCheck: { skill: 'cunning', difficulty: 20 },
          consequences: {
            success: 'You appeal to their honor. They give you a 10-minute head start.',
            failure: 'They don\'t negotiate. Combat begins.',
          },
        },
        {
          id: 'passengers_help',
          text: 'Rally passengers to help defend (Spirit check)',
          skillCheck: { skill: 'spirit', difficulty: 18 },
          consequences: {
            success: 'The passengers stand with you! Numbers overwhelm the twins.',
            failure: 'The passengers refuse. You face the twins alone.',
          },
          rewards: { xp: 500, reputation: 75 },
        },
      ],
      resolved: false,
    },
    {
      type: 'breakdown',
      severity: 7,
      description: 'The axle SNAPS in half. The coach crashes violently! You\'re in the middle of nowhere, injured, and it\'s getting dark.',
      choices: [
        {
          id: 'emergency_camp',
          text: 'Set up emergency camp and wait for help',
          consequences: {
            success: 'You survive the night. A patrol finds you in the morning.',
            failure: 'Predators are drawn to your fire. Wolf pack attacks!',
          },
        },
        {
          id: 'hike_to_station',
          text: 'Hike through the night to reach station',
          skillCheck: { skill: 'spirit', difficulty: 18 },
          consequences: {
            success: 'You make it to the station exhausted but alive.',
            failure: 'You get lost in the dark. When dawn comes, you have no idea where you are.',
          },
        },
        {
          id: 'signal_fire',
          text: 'Build a massive signal fire (Craft check)',
          skillCheck: { skill: 'craft', difficulty: 16 },
          consequences: {
            success: 'The fire is spotted! A nearby ranch sends help.',
            failure: 'The fire draws bandits instead. They see easy prey.',
          },
          rewards: { xp: 200 },
        },
      ],
      resolved: false,
    },
    {
      type: 'weather_delay',
      severity: 8,
      description: 'A violent dust storm engulfs the stagecoach! Visibility drops to zero. The driver can\'t see the road.',
      choices: [
        {
          id: 'stop_and_wait',
          text: 'Stop and wait it out',
          consequences: {
            success: 'The storm passes after an hour. Everyone is safe but covered in dust.',
            failure: 'While stopped, bandits use the storm as cover to rob you!',
          },
        },
        {
          id: 'navigate_storm',
          text: 'Navigate through it (Spirit check)',
          skillCheck: { skill: 'spirit', difficulty: 20 },
          consequences: {
            success: 'You guide the driver using instinct and landmarks. You make it through!',
            failure: 'You veer off the road. The coach tips and crashes.',
          },
          rewards: { xp: 300, reputation: 25 },
        },
      ],
      resolved: false,
    },
  ],
};

/**
 * Get random encounter based on danger level
 */
export function getRandomEncounter(dangerLevel: number): StagecoachEncounter | null {
  // Roll for encounter
  const encounterRate = ENCOUNTER_RATES[dangerLevel as keyof typeof ENCOUNTER_RATES] || 0.20;
  if (Math.random() > encounterRate) {
    return null; // No encounter
  }

  // Select appropriate encounter pool
  let encounterPool: StagecoachEncounter[];
  if (dangerLevel <= 3) {
    encounterPool = STAGECOACH_ENCOUNTERS.low_danger;
  } else if (dangerLevel <= 6) {
    encounterPool = STAGECOACH_ENCOUNTERS.medium_danger;
  } else {
    encounterPool = STAGECOACH_ENCOUNTERS.high_danger;
  }

  // Return random encounter from pool
  const randomIndex = Math.floor(Math.random() * encounterPool.length);
  return { ...encounterPool[randomIndex] }; // Clone to avoid mutation
}

/**
 * Resolve encounter choice
 */
export function resolveEncounterChoice(
  encounter: StagecoachEncounter,
  choiceId: string,
  characterSkillLevel?: number
): {
  success: boolean;
  message: string;
  rewards?: { gold?: number; xp?: number; reputation?: number };
} {
  const choice = encounter.choices.find(c => c.id === choiceId);
  if (!choice) {
    return {
      success: false,
      message: 'Invalid choice',
    };
  }

  let success = true;

  // Check if skill check is required
  if (choice.skillCheck && characterSkillLevel !== undefined) {
    const roll = Math.floor(Math.random() * 20) + 1 + characterSkillLevel;
    success = roll >= choice.skillCheck.difficulty;
  } else if (choice.skillCheck) {
    // No skill level provided, 50/50 chance
    success = Math.random() > 0.5;
  }

  const message = success ? choice.consequences.success : choice.consequences.failure;

  return {
    success,
    message,
    rewards: success ? choice.rewards : undefined,
  };
}

/**
 * Get encounter description for log
 */
export function getEncounterLogEntry(
  encounter: StagecoachEncounter,
  choiceId: string,
  success: boolean
): string {
  const timestamp = new Date().toLocaleTimeString();
  const choice = encounter.choices.find(c => c.id === choiceId);
  const choiceText = choice?.text || 'Unknown choice';
  const outcome = success ? 'Success' : 'Failure';

  return `[${timestamp}] ${encounter.description} - ${choiceText} - ${outcome}`;
}
