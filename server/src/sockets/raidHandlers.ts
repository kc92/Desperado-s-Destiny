/**
 * Raid Socket Handlers
 *
 * Manages real-time raid event broadcasting
 * Phase 2.3 - Full Raid System
 */

import { getIO, emitToRoom } from '../config/socket';
import { RaidSocketEvent, IRaidNotificationPayload, IRaidDTO } from '@desperados/shared';
import { Gang } from '../models/Gang.model';
import logger from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Emit raid planned event to gang members
 */
export async function emitRaidPlanned(
  attackingGangId: mongoose.Types.ObjectId,
  raid: IRaidDTO
): Promise<void> {
  try {
    const gang = await Gang.findById(attackingGangId).lean();
    if (!gang) {
      logger.warn('emitRaidPlanned: Gang not found', { attackingGangId: attackingGangId.toString() });
      return;
    }

    // Emit to each gang member's character room
    for (const member of gang.members) {
      try {
        emitToRoom(
          `character:${member.characterId}`,
          RaidSocketEvent.RAID_PLANNED,
          {
            raidId: raid.raidId,
            targetType: raid.targetType,
            targetName: raid.targetName,
            leaderId: raid.leaderId,
            leaderName: raid.leaderName,
            plannedAt: raid.plannedAt,
          }
        );
      } catch (memberError) {
        logger.error('Failed to emit raid:planned to member', {
          characterId: member.characterId.toString(),
          error: memberError instanceof Error ? memberError.message : memberError
        });
      }
    }

    logger.debug(`Emitted raid:planned to gang ${gang.name}`);
  } catch (error) {
    logger.error('Error emitting raid:planned:', error);
  }
}

/**
 * Emit raid joined event
 */
export async function emitRaidJoined(
  attackingGangId: mongoose.Types.ObjectId,
  raid: IRaidDTO,
  joinedCharacterId: string,
  joinedCharacterName: string
): Promise<void> {
  try {
    const gang = await Gang.findById(attackingGangId).lean();
    if (!gang) {
      logger.warn('emitRaidJoined: Gang not found', { attackingGangId: attackingGangId.toString() });
      return;
    }

    // Emit to all gang members
    for (const member of gang.members) {
      try {
        emitToRoom(
          `character:${member.characterId}`,
          RaidSocketEvent.RAID_JOINED,
          {
            raidId: raid.raidId,
            targetName: raid.targetName,
            joinedCharacterId,
            joinedCharacterName,
            participantCount: raid.participants.length,
          }
        );
      } catch (memberError) {
        logger.error('Failed to emit raid:joined to member', {
          characterId: member.characterId.toString(),
          error: memberError instanceof Error ? memberError.message : memberError
        });
      }
    }

    logger.debug(`Emitted raid:joined to gang ${gang.name}`);
  } catch (error) {
    logger.error('Error emitting raid:joined:', error);
  }
}

/**
 * Emit raid scheduled event to both gangs
 */
export async function emitRaidScheduled(
  attackingGangId: mongoose.Types.ObjectId,
  defendingGangId: mongoose.Types.ObjectId | undefined,
  raid: IRaidDTO
): Promise<void> {
  try {
    // Notify attacking gang
    const attackingGang = await Gang.findById(attackingGangId).lean();
    if (attackingGang) {
      for (const member of attackingGang.members) {
        try {
          emitToRoom(
            `character:${member.characterId}`,
            RaidSocketEvent.RAID_SCHEDULED,
            {
              raidId: raid.raidId,
              targetType: raid.targetType,
              targetName: raid.targetName,
              scheduledFor: raid.scheduledFor,
            }
          );
        } catch (memberError) {
          logger.error('Failed to emit raid:scheduled to attacking member', {
            characterId: member.characterId.toString(),
            error: memberError instanceof Error ? memberError.message : memberError
          });
        }
      }
    } else {
      logger.warn('emitRaidScheduled: Attacking gang not found', { attackingGangId: attackingGangId.toString() });
    }

    // Notify defending gang (if applicable)
    if (defendingGangId) {
      const defendingGang = await Gang.findById(defendingGangId).lean();
      if (defendingGang) {
        for (const member of defendingGang.members) {
          try {
            emitToRoom(
              `character:${member.characterId}`,
              RaidSocketEvent.RAID_INCOMING,
              {
                raidId: raid.raidId,
                attackingGangName: raid.attackingGangName,
                targetType: raid.targetType,
                targetName: raid.targetName,
                scheduledFor: raid.scheduledFor,
              }
            );
          } catch (memberError) {
            logger.error('Failed to emit raid:incoming to defending member', {
              characterId: member.characterId.toString(),
              error: memberError instanceof Error ? memberError.message : memberError
            });
          }
        }
      } else {
        logger.warn('emitRaidScheduled: Defending gang not found', { defendingGangId: defendingGangId.toString() });
      }
    }

    logger.debug(`Emitted raid:scheduled to involved gangs`);
  } catch (error) {
    logger.error('Error emitting raid:scheduled:', error);
  }
}

/**
 * Emit raid started event
 */
export async function emitRaidStarted(
  attackingGangId: mongoose.Types.ObjectId,
  defendingGangId: mongoose.Types.ObjectId | undefined,
  raid: IRaidDTO
): Promise<void> {
  try {
    // Notify attacking gang
    const attackingGang = await Gang.findById(attackingGangId).lean();
    if (attackingGang) {
      for (const member of attackingGang.members) {
        try {
          emitToRoom(
            `character:${member.characterId}`,
            RaidSocketEvent.RAID_STARTED,
            {
              raidId: raid.raidId,
              targetName: raid.targetName,
              attackPower: raid.attackPower,
              defensePower: raid.defensePower,
            }
          );
        } catch (memberError) {
          logger.error('Failed to emit raid:started to attacking member', {
            characterId: member.characterId.toString(),
            error: memberError instanceof Error ? memberError.message : memberError
          });
        }
      }
    } else {
      logger.warn('emitRaidStarted: Attacking gang not found', { attackingGangId: attackingGangId.toString() });
    }

    // Notify defending gang
    if (defendingGangId) {
      const defendingGang = await Gang.findById(defendingGangId).lean();
      if (defendingGang) {
        for (const member of defendingGang.members) {
          try {
            emitToRoom(
              `character:${member.characterId}`,
              RaidSocketEvent.RAID_STARTED,
              {
                raidId: raid.raidId,
                attackingGangName: raid.attackingGangName,
                targetName: raid.targetName,
                isDefender: true,
              }
            );
          } catch (memberError) {
            logger.error('Failed to emit raid:started to defending member', {
              characterId: member.characterId.toString(),
              error: memberError instanceof Error ? memberError.message : memberError
            });
          }
        }
      } else {
        logger.warn('emitRaidStarted: Defending gang not found', { defendingGangId: defendingGangId.toString() });
      }
    }

    logger.debug(`Emitted raid:started to involved gangs`);
  } catch (error) {
    logger.error('Error emitting raid:started:', error);
  }
}

/**
 * Emit raid completed event to both gangs
 */
export async function emitRaidCompleted(
  attackingGangId: mongoose.Types.ObjectId,
  defendingGangId: mongoose.Types.ObjectId | undefined,
  raid: IRaidDTO
): Promise<void> {
  try {
    // Notify attacking gang
    const attackingGang = await Gang.findById(attackingGangId).lean();
    if (attackingGang) {
      for (const member of attackingGang.members) {
        try {
          emitToRoom(
            `character:${member.characterId}`,
            RaidSocketEvent.RAID_COMPLETED,
            {
              raidId: raid.raidId,
              targetName: raid.targetName,
              outcome: raid.result?.outcome,
              goldAwarded: raid.result?.goldAwarded,
              xpAwarded: raid.result?.xpAwarded,
              damageDealt: raid.result?.damageDealt,
            }
          );
        } catch (memberError) {
          logger.error('Failed to emit raid:completed to attacking member', {
            characterId: member.characterId.toString(),
            error: memberError instanceof Error ? memberError.message : memberError
          });
        }
      }
    } else {
      logger.warn('emitRaidCompleted: Attacking gang not found', { attackingGangId: attackingGangId.toString() });
    }

    // Notify defending gang
    if (defendingGangId) {
      const defendingGang = await Gang.findById(defendingGangId).lean();
      if (defendingGang) {
        for (const member of defendingGang.members) {
          try {
            emitToRoom(
              `character:${member.characterId}`,
              RaidSocketEvent.RAID_COMPLETED,
              {
                raidId: raid.raidId,
                attackingGangName: raid.attackingGangName,
                targetName: raid.targetName,
                outcome: raid.result?.outcome,
                goldLost: raid.result?.goldStolen,
                influenceLost: raid.result?.influenceLost,
                isDefender: true,
                defended: raid.status === 'defended',
              }
            );
          } catch (memberError) {
            logger.error('Failed to emit raid:completed to defending member', {
              characterId: member.characterId.toString(),
              error: memberError instanceof Error ? memberError.message : memberError
            });
          }
        }
      } else {
        logger.warn('emitRaidCompleted: Defending gang not found', { defendingGangId: defendingGangId.toString() });
      }
    }

    logger.debug(`Emitted raid:completed to involved gangs`);
  } catch (error) {
    logger.error('Error emitting raid:completed:', error);
  }
}

/**
 * Emit raid cancelled event
 */
export async function emitRaidCancelled(
  attackingGangId: mongoose.Types.ObjectId,
  defendingGangId: mongoose.Types.ObjectId | undefined,
  raid: IRaidDTO
): Promise<void> {
  try {
    // Notify attacking gang
    const attackingGang = await Gang.findById(attackingGangId).lean();
    if (attackingGang) {
      for (const member of attackingGang.members) {
        try {
          emitToRoom(
            `character:${member.characterId}`,
            RaidSocketEvent.RAID_CANCELLED,
            {
              raidId: raid.raidId,
              targetName: raid.targetName,
              reason: 'Raid was cancelled by the leader',
            }
          );
        } catch (memberError) {
          logger.error('Failed to emit raid:cancelled to attacking member', {
            characterId: member.characterId.toString(),
            error: memberError instanceof Error ? memberError.message : memberError
          });
        }
      }
    } else {
      logger.warn('emitRaidCancelled: Attacking gang not found', { attackingGangId: attackingGangId.toString() });
    }

    // Notify defending gang if raid was scheduled
    if (defendingGangId && raid.scheduledFor) {
      const defendingGang = await Gang.findById(defendingGangId).lean();
      if (defendingGang) {
        for (const member of defendingGang.members) {
          try {
            emitToRoom(
              `character:${member.characterId}`,
              RaidSocketEvent.RAID_CANCELLED,
              {
                raidId: raid.raidId,
                attackingGangName: raid.attackingGangName,
                targetName: raid.targetName,
                reason: 'The attacking gang cancelled the raid',
              }
            );
          } catch (memberError) {
            logger.error('Failed to emit raid:cancelled to defending member', {
              characterId: member.characterId.toString(),
              error: memberError instanceof Error ? memberError.message : memberError
            });
          }
        }
      } else {
        logger.warn('emitRaidCancelled: Defending gang not found', { defendingGangId: defendingGangId.toString() });
      }
    }

    logger.debug(`Emitted raid:cancelled to involved gangs`);
  } catch (error) {
    logger.error('Error emitting raid:cancelled:', error);
  }
}

/**
 * Emit defense updated event (guards/insurance changes)
 */
export async function emitDefenseUpdated(
  characterId: mongoose.Types.ObjectId,
  propertyId: string,
  propertyName: string,
  defenseLevel: number,
  guardCount: number,
  insuranceLevel: string
): Promise<void> {
  try {
    emitToRoom(
      `character:${characterId}`,
      RaidSocketEvent.DEFENSE_UPDATED,
      {
        propertyId,
        propertyName,
        defenseLevel,
        guardCount,
        insuranceLevel,
      }
    );

    logger.debug(`Emitted raid:defense_updated for property ${propertyName}`);
  } catch (error) {
    logger.error('Error emitting raid:defense_updated:', error);
  }
}

export default {
  emitRaidPlanned,
  emitRaidJoined,
  emitRaidScheduled,
  emitRaidStarted,
  emitRaidCompleted,
  emitRaidCancelled,
  emitDefenseUpdated,
};
