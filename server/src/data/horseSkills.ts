import {
  HorseSkill,
  HorseSkillDefinition
} from '@desperados/shared';
import { SecureRNG } from '../services/base/SecureRNG';

// ============================================================================
// HORSE SKILL DEFINITIONS
// ============================================================================

export const HORSE_SKILLS: Record<HorseSkill, HorseSkillDefinition> = {
  [HorseSkill.SPEED_BURST]: {
    skill: HorseSkill.SPEED_BURST,
    name: 'Speed Burst',
    description: 'Your horse can unleash a temporary burst of incredible speed. Useful for escapes, chases, and racing.',
    trainingTime: 24, // hours
    trainingCost: 100,
    requirements: {
      minBondLevel: 20,
      minStat: {
        stat: 'speed',
        value: 60
      }
    },
    effects: {
      description: 'Activate to gain +30% speed for 30 seconds (1 hour cooldown)',
      bonus: {
        speedBurstDuration: 30,
        speedBurstBonus: 30,
        speedBurstCooldown: 3600
      }
    }
  },

  [HorseSkill.SURE_FOOTED]: {
    skill: HorseSkill.SURE_FOOTED,
    name: 'Sure-Footed',
    description: 'Years of mountain trails have taught your horse to navigate treacherous terrain without stumbling.',
    trainingTime: 36,
    trainingCost: 150,
    requirements: {
      minBondLevel: 30,
      minStat: {
        stat: 'stamina',
        value: 50
      }
    },
    effects: {
      description: 'Reduces trip/fall chance by 70%, no speed penalty on rough terrain',
      bonus: {
        tripReduction: 70,
        roughTerrainPenalty: 0
      }
    }
  },

  [HorseSkill.WAR_HORSE]: {
    skill: HorseSkill.WAR_HORSE,
    name: 'War Horse',
    description: 'Trained for battle, your horse stands firm when others flee. Gunfire and explosions no longer spook them.',
    trainingTime: 48,
    trainingCost: 200,
    requirements: {
      minBondLevel: 50,
      minStat: {
        stat: 'bravery',
        value: 70
      }
    },
    effects: {
      description: 'Never flees in combat, immune to intimidation, +20% mounted combat effectiveness',
      bonus: {
        combatFleeChance: 0,
        intimidationImmune: 1,
        mountedCombatBonus: 20
      }
    }
  },

  [HorseSkill.TRICK_HORSE]: {
    skill: HorseSkill.TRICK_HORSE,
    name: 'Trick Horse',
    description: 'Your horse has learned impressive tricks and stunts. Perfect for shows, entertainment, or showing off.',
    trainingTime: 30,
    trainingCost: 120,
    requirements: {
      minBondLevel: 40,
      minStat: {
        stat: 'temperament',
        value: 60
      }
    },
    effects: {
      description: 'Can perform tricks on command, +15 Charisma when mounted, bonus in horse shows',
      bonus: {
        charismaBonus: 15,
        showScoreBonus: 25,
        tricks: 8
      }
    }
  },

  [HorseSkill.DRAFT_TRAINING]: {
    skill: HorseSkill.DRAFT_TRAINING,
    name: 'Draft Training',
    description: 'Specialized training for hauling and carrying. Your horse can bear much heavier loads.',
    trainingTime: 24,
    trainingCost: 100,
    requirements: {
      minBondLevel: 20,
      minStat: {
        stat: 'health',
        value: 60
      }
    },
    effects: {
      description: 'Carry capacity +50%, can pull wagons, reduced speed penalty from weight',
      bonus: {
        carryCapacityBonus: 50,
        canPullWagon: 1,
        weightSpeedPenalty: -50
      }
    }
  },

  [HorseSkill.RACING_FORM]: {
    skill: HorseSkill.RACING_FORM,
    name: 'Racing Form',
    description: 'Professional racing training. Your horse has perfect form and pacing for competitive racing.',
    trainingTime: 40,
    trainingCost: 180,
    requirements: {
      minBondLevel: 35,
      minStat: {
        stat: 'speed',
        value: 70
      },
      prerequisiteSkills: [HorseSkill.SPEED_BURST]
    },
    effects: {
      description: '+25% effectiveness in races, improved acceleration, optimal pacing',
      bonus: {
        raceScoreBonus: 25,
        acceleration: 20,
        staminaEfficiency: 15
      }
    }
  },

  [HorseSkill.STEALTH]: {
    skill: HorseSkill.STEALTH,
    name: 'Stealth',
    description: 'Your horse moves quietly and knows when to stay silent. Perfect for outlaws and scouts.',
    trainingTime: 32,
    trainingCost: 140,
    requirements: {
      minBondLevel: 45,
      minStat: {
        stat: 'temperament',
        value: 65
      }
    },
    effects: {
      description: 'Quieter movement, reduced detection range, horse won\'t whinny at inopportune times',
      bonus: {
        noiseReduction: 60,
        detectionRange: -40,
        controlledVocalization: 1
      }
    }
  },

  [HorseSkill.ENDURANCE]: {
    skill: HorseSkill.ENDURANCE,
    name: 'Endurance',
    description: 'Conditioning for long-distance travel. Your horse can travel much farther before tiring.',
    trainingTime: 48,
    trainingCost: 160,
    requirements: {
      minBondLevel: 40,
      minStat: {
        stat: 'stamina',
        value: 75
      }
    },
    effects: {
      description: 'Stamina lasts 50% longer, +30% stamina regeneration rate, can travel 25% farther per day',
      bonus: {
        staminaDuration: 50,
        staminaRegeneration: 30,
        dailyTravelBonus: 25
      }
    }
  }
};

// ============================================================================
// SKILL LOOKUP UTILITIES
// ============================================================================

export function getSkillDefinition(skill: HorseSkill): HorseSkillDefinition {
  return HORSE_SKILLS[skill];
}

export function getAllSkills(): HorseSkillDefinition[] {
  return Object.values(HORSE_SKILLS);
}

export function getSkillsByBondRequirement(bondLevel: number): HorseSkillDefinition[] {
  return Object.values(HORSE_SKILLS).filter(
    skill => !skill.requirements?.minBondLevel || bondLevel >= skill.requirements.minBondLevel
  );
}

export function canLearnSkill(
  horse: {
    bond: { level: number };
    stats: Record<string, number>;
    training: { trainedSkills: HorseSkill[] };
  },
  skill: HorseSkill
): { canLearn: boolean; reasons: string[] } {
  const skillDef = HORSE_SKILLS[skill];
  const reasons: string[] = [];
  let canLearn = true;

  // Check if already known
  if (horse.training.trainedSkills.includes(skill)) {
    canLearn = false;
    reasons.push('Horse already knows this skill');
    return { canLearn, reasons };
  }

  // Check bond level
  if (skillDef.requirements?.minBondLevel) {
    if (horse.bond.level < skillDef.requirements.minBondLevel) {
      canLearn = false;
      reasons.push(
        `Requires bond level ${skillDef.requirements.minBondLevel} (current: ${horse.bond.level})`
      );
    }
  }

  // Check stat requirement
  if (skillDef.requirements?.minStat) {
    const { stat, value } = skillDef.requirements.minStat;
    const horseStat = horse.stats[stat];
    if (horseStat < value) {
      canLearn = false;
      reasons.push(`Requires ${stat} ${value} (current: ${horseStat})`);
    }
  }

  // Check prerequisite skills
  if (skillDef.requirements?.prerequisiteSkills) {
    const missingSkills = skillDef.requirements.prerequisiteSkills.filter(
      prereq => !horse.training.trainedSkills.includes(prereq)
    );

    if (missingSkills.length > 0) {
      canLearn = false;
      const skillNames = missingSkills.map(s => HORSE_SKILLS[s].name).join(', ');
      reasons.push(`Requires skills: ${skillNames}`);
    }
  }

  if (canLearn) {
    reasons.push('All requirements met');
  }

  return { canLearn, reasons };
}

// ============================================================================
// SKILL COMBINATIONS & SYNERGIES
// ============================================================================

export interface SkillSynergy {
  skills: HorseSkill[];
  name: string;
  description: string;
  bonus: string;
}

export const SKILL_SYNERGIES: SkillSynergy[] = [
  {
    skills: [HorseSkill.SPEED_BURST, HorseSkill.RACING_FORM],
    name: 'Champion Racer',
    description: 'Speed burst and racing form combine for devastating race performance',
    bonus: 'Additional +10% race score when both skills are active'
  },
  {
    skills: [HorseSkill.WAR_HORSE, HorseSkill.ENDURANCE],
    name: 'Cavalry Mount',
    description: 'War training and endurance create the ultimate military mount',
    bonus: 'Can participate in extended combat without stamina penalties'
  },
  {
    skills: [HorseSkill.STEALTH, HorseSkill.SURE_FOOTED],
    name: 'Ghost Rider',
    description: 'Silent movement through any terrain',
    bonus: 'Can traverse difficult terrain silently'
  },
  {
    skills: [HorseSkill.TRICK_HORSE, HorseSkill.ENDURANCE],
    name: 'Show Star',
    description: 'Can perform lengthy show routines without tiring',
    bonus: '+15% bonus in skill-based horse shows'
  },
  {
    skills: [HorseSkill.DRAFT_TRAINING, HorseSkill.ENDURANCE],
    name: 'Long Hauler',
    description: 'Can transport heavy loads over long distances',
    bonus: 'No speed penalty for heavy loads on long journeys'
  }
];

export function getActiveSynergies(trainedSkills: HorseSkill[]): SkillSynergy[] {
  return SKILL_SYNERGIES.filter(synergy =>
    synergy.skills.every(skill => trainedSkills.includes(skill))
  );
}

// ============================================================================
// TRAINING PROGRESSION
// ============================================================================

export interface TrainingSession {
  skill: HorseSkill;
  progressGain: number;
  bondGain: number;
  staminaCost: number;
  message: string;
}

export function simulateTrainingSession(
  horse: {
    stats: Record<string, number>;
    bond: { level: number };
    condition: { currentStamina: number };
  },
  skill: HorseSkill
): TrainingSession {
  const skillDef = HORSE_SKILLS[skill];

  // Base progress (10-20 per session)
  let progressGain = 10 + (SecureRNG.chance(0.5) ? 10 : 0);

  // Horse's relevant stat affects training speed
  const relevantStat = skillDef.requirements?.minStat?.stat;
  if (relevantStat) {
    const statValue = horse.stats[relevantStat];
    const statBonus = (statValue - 50) / 10; // ±5 based on how far from 50
    progressGain += statBonus;
  }

  // Bond level affects training efficiency
  const bondBonus = horse.bond.level / 50; // 0-2 bonus
  progressGain += bondBonus;

  // Fatigue reduces effectiveness
  const staminaPercent = horse.condition.currentStamina / 100;
  progressGain *= Math.max(0.5, staminaPercent);

  // Round and clamp
  progressGain = Math.max(5, Math.min(25, Math.round(progressGain)));

  // Training builds bond
  const bondGain = Math.floor(progressGain / 3);

  // Training costs stamina
  const staminaCost = 15;

  // Generate message
  const messages = [
    `Excellent progress training ${skillDef.name}!`,
    `Your horse is picking up ${skillDef.name} quickly.`,
    `Good training session for ${skillDef.name}.`,
    `Steady progress on ${skillDef.name}.`,
    `Your horse is learning ${skillDef.name}.`
  ];

  const message = progressGain > 18
    ? messages[0]
    : progressGain > 15
      ? messages[1]
      : progressGain > 12
        ? messages[2]
        : messages[3];

  return {
    skill,
    progressGain,
    bondGain,
    staminaCost,
    message
  };
}
