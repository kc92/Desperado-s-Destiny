/**
 * Schedule Service Tests
 *
 * Tests for the NPC schedule system
 */

import { ScheduleService } from '../../services/schedule.service';
import { TimeService } from '../../services/time.service';
import { NPCActivity, NPCArchetype } from '@desperados/shared';

describe('ScheduleService', () => {
  beforeAll(() => {
    // Initialize the service
    ScheduleService.initialize();
  });

  describe('getNPCSchedule', () => {
    it('should get schedule for Red Gulch bartender', () => {
      const schedule = ScheduleService.getNPCSchedule('npc_bartender_red_gulch');

      expect(schedule).toBeDefined();
      expect(schedule?.npcName).toBe('Jake "Whiskey" McGraw');
      expect(schedule?.workLocation).toBe('red_gulch_saloon');
      expect(schedule?.defaultSchedule.length).toBeGreaterThan(0);
    });

    it('should return null for non-existent NPC', () => {
      const schedule = ScheduleService.getNPCSchedule('npc_nonexistent');
      expect(schedule).toBeNull();
    });
  });

  describe('getCurrentActivity', () => {
    it('should get bartender activity at hour 2 (working)', () => {
      const activity = ScheduleService.getCurrentActivity('npc_bartender_red_gulch', 2);

      expect(activity).toBeDefined();
      expect(activity?.currentActivity).toBe(NPCActivity.WORKING);
      expect(activity?.currentLocation).toBe('red_gulch_saloon');
      expect(activity?.isAvailable).toBe(true);
    });

    it('should get bartender activity at hour 5 (sleeping)', () => {
      const activity = ScheduleService.getCurrentActivity('npc_bartender_red_gulch', 5);

      expect(activity).toBeDefined();
      expect(activity?.currentActivity).toBe(NPCActivity.SLEEPING);
      expect(activity?.isAvailable).toBe(false);
    });

    it('should get sheriff activity at hour 8 (patrolling)', () => {
      const activity = ScheduleService.getCurrentActivity('npc_sheriff_red_gulch', 8);

      expect(activity).toBeDefined();
      expect(activity?.currentActivity).toBe(NPCActivity.PATROLLING);
      expect(activity?.currentLocation).toBe('red_gulch_main_street');
    });
  });

  describe('getNPCLocation', () => {
    it('should get bartender location at hour 15 (saloon)', () => {
      const location = ScheduleService.getNPCLocation('npc_bartender_red_gulch', 15);
      expect(location).toBe('red_gulch_saloon');
    });

    it('should get doctor location at hour 10 (office)', () => {
      const location = ScheduleService.getNPCLocation('npc_doctor_red_gulch', 10);
      expect(location).toBe('red_gulch_doctors_office');
    });
  });

  describe('isNPCAvailable', () => {
    it('should return true when NPC is working', () => {
      const available = ScheduleService.isNPCAvailable('npc_bartender_red_gulch', 15);
      expect(available).toBe(true);
    });

    it('should return false when NPC is sleeping', () => {
      const available = ScheduleService.isNPCAvailable('npc_bartender_red_gulch', 5);
      expect(available).toBe(false);
    });

    it('should return false when NPC is praying', () => {
      const available = ScheduleService.isNPCAvailable('npc_priest_red_gulch', 6);
      expect(available).toBe(false);
    });
  });

  describe('getNPCsAtLocation', () => {
    it('should find NPCs at Red Gulch Saloon at hour 15', () => {
      const npcs = ScheduleService.getNPCsAtLocation('red_gulch_saloon', 15);

      expect(npcs.length).toBeGreaterThan(0);
      expect(npcs.some(npc => npc.npcId === 'npc_bartender_red_gulch')).toBe(true);
    });

    it('should find NPCs at restaurant during lunch hour 12', () => {
      const npcs = ScheduleService.getNPCsAtLocation('red_gulch_restaurant', 12);

      expect(npcs.length).toBeGreaterThan(0);
      // Multiple NPCs should be eating lunch
    });

    it('should return empty array for location with no NPCs', () => {
      const npcs = ScheduleService.getNPCsAtLocation('nonexistent_location', 12);
      expect(npcs).toEqual([]);
    });
  });

  describe('getAllNPCLocations', () => {
    it('should get all NPC locations at hour 14', () => {
      const locationMap = ScheduleService.getAllNPCLocations(14);

      expect(locationMap.size).toBeGreaterThan(0);

      // Bartender should be at saloon
      const saloonNPCs = locationMap.get('red_gulch_saloon');
      expect(saloonNPCs).toBeDefined();
      expect(saloonNPCs?.some(npc => npc.npcId === 'npc_bartender_red_gulch')).toBe(true);
    });
  });

  describe('getActivityDialogue', () => {
    it('should get appropriate dialogue for working NPC', () => {
      const dialogue = ScheduleService.getActivityDialogue('npc_bartender_red_gulch');
      expect(dialogue).toBeDefined();
      expect(typeof dialogue).toBe('string');
      expect(dialogue.length).toBeGreaterThan(0);
    });

    it('should get friendly dialogue', () => {
      const dialogue = ScheduleService.getActivityDialogue('npc_bartender_red_gulch', 'friendly');
      expect(dialogue).toBeDefined();
    });

    it('should get hostile dialogue', () => {
      const dialogue = ScheduleService.getActivityDialogue('npc_bartender_red_gulch', 'hostile');
      expect(dialogue).toBeDefined();
    });
  });

  describe('getNPCsByActivity', () => {
    it('should find working NPCs at hour 10', () => {
      const workingNPCs = ScheduleService.getNPCsByActivity(NPCActivity.WORKING, 10);
      expect(workingNPCs.length).toBeGreaterThan(0);
    });

    it('should find sleeping NPCs at hour 3', () => {
      const sleepingNPCs = ScheduleService.getNPCsByActivity(NPCActivity.SLEEPING, 3);
      expect(sleepingNPCs.length).toBeGreaterThan(0);
    });

    it('should find eating NPCs at hour 12', () => {
      const eatingNPCs = ScheduleService.getNPCsByActivity(NPCActivity.EATING, 12);
      expect(eatingNPCs.length).toBeGreaterThan(0);
    });
  });

  describe('getActivityStatistics', () => {
    it('should get statistics for hour 14', () => {
      const stats = ScheduleService.getActivityStatistics(14);

      expect(stats.hour).toBe(14);
      expect(stats.totalNPCs).toBeGreaterThan(0);
      expect(stats.byActivity).toBeDefined();
      expect(Object.keys(stats.byActivity).length).toBeGreaterThan(0);
    });

    it('should have different stats at different hours', () => {
      const morningStats = ScheduleService.getActivityStatistics(8);
      const eveningStats = ScheduleService.getActivityStatistics(20);

      expect(morningStats.byActivity).not.toEqual(eveningStats.byActivity);
    });
  });

  describe('getUpcomingActivities', () => {
    it('should get upcoming activities for bartender', () => {
      const upcoming = ScheduleService.getUpcomingActivities('npc_bartender_red_gulch', 3);

      expect(upcoming.length).toBeLessThanOrEqual(3);
      expect(upcoming.every(entry => entry.hour !== undefined)).toBe(true);
    });
  });

  describe('getNPCInteractionContext', () => {
    it('should get interaction context with neutral reputation', () => {
      const context = ScheduleService.getNPCInteractionContext('npc_bartender_red_gulch', 50);

      expect(context).toBeDefined();
      expect(context?.mood).toBeDefined();
      expect(context?.suggestedDialogue).toBeDefined();
      expect(context?.suggestedDialogue.length).toBeGreaterThan(0);
    });

    it('should get friendly mood with high reputation', () => {
      const context = ScheduleService.getNPCInteractionContext('npc_bartender_red_gulch', 80);
      expect(context?.mood).toBe('friendly');
    });

    it('should get hostile mood with low reputation', () => {
      const context = ScheduleService.getNPCInteractionContext('npc_bartender_red_gulch', 20);
      expect(context?.mood).toBe('hostile');
    });
  });

  describe('getScheduleTemplate', () => {
    it('should get worker template', () => {
      const template = ScheduleService.getScheduleTemplate(NPCArchetype.WORKER);

      expect(template).toBeDefined();
      expect(template?.archetype).toBe(NPCArchetype.WORKER);
      expect(template?.defaultSchedule.length).toBeGreaterThan(0);
    });

    it('should get outlaw template', () => {
      const template = ScheduleService.getScheduleTemplate(NPCArchetype.OUTLAW);

      expect(template).toBeDefined();
      expect(template?.archetype).toBe(NPCArchetype.OUTLAW);
    });
  });

  describe('createScheduleFromTemplate', () => {
    it('should create new NPC schedule from worker template', () => {
      const newSchedule = ScheduleService.createScheduleFromTemplate(
        'npc_test_worker',
        'Test Worker',
        NPCArchetype.WORKER,
        'test_home',
        'test_shop'
      );

      expect(newSchedule).toBeDefined();
      expect(newSchedule.npcId).toBe('npc_test_worker');
      expect(newSchedule.npcName).toBe('Test Worker');
      expect(newSchedule.homeLocation).toBe('test_home');
      expect(newSchedule.workLocation).toBe('test_shop');
      expect(newSchedule.defaultSchedule.length).toBeGreaterThan(0);

      // Verify it was added to cache
      const retrieved = ScheduleService.getNPCSchedule('npc_test_worker');
      expect(retrieved).toEqual(newSchedule);

      // Cleanup
      ScheduleService.removeNPCSchedule('npc_test_worker');
    });
  });

  describe('Integration with TimeService', () => {
    it('should work with current game time', () => {
      const currentHour = TimeService.getCurrentHour();
      expect(currentHour).toBeGreaterThanOrEqual(0);
      expect(currentHour).toBeLessThan(24);

      // Get activity at current time
      const activity = ScheduleService.getCurrentActivity('npc_bartender_red_gulch');
      expect(activity).toBeDefined();
    });
  });

  describe('Schedule Entry Time Ranges', () => {
    it('should handle normal time ranges correctly', () => {
      // 8:00 - 17:00 is a normal range
      const activity = ScheduleService.getCurrentActivity('npc_bank_teller_red_gulch', 10);
      expect(activity?.currentActivity).toBe(NPCActivity.WORKING);
    });

    it('should handle midnight wraparound correctly', () => {
      // Bartender works 0:00 - 3:00 (wraps past midnight)
      const activity = ScheduleService.getCurrentActivity('npc_bartender_red_gulch', 1);
      expect(activity?.currentActivity).toBe(NPCActivity.WORKING);
    });
  });
});
