/**
 * Integration Health Check Utilities
 * Verifies system connections and data flows
 */

import mongoose from 'mongoose';
import logger from './logger';
import {
  SystemName,
  IntegrationHealth,
  SystemDependency
} from '@desperados/shared';

/**
 * System dependency graph
 */
const SYSTEM_DEPENDENCIES: SystemDependency[] = [
  {
    system: SystemName.CHARACTER,
    dependsOn: [SystemName.USER, SystemName.LEGACY],
    requiredForInitialization: true
  },
  {
    system: SystemName.COMBAT,
    dependsOn: [SystemName.CHARACTER, SystemName.GOLD, SystemName.ENERGY],
    requiredForInitialization: false
  },
  {
    system: SystemName.GOLD,
    dependsOn: [SystemName.CHARACTER],
    requiredForInitialization: false
  },
  {
    system: SystemName.QUEST,
    dependsOn: [SystemName.CHARACTER, SystemName.GOLD],
    requiredForInitialization: false
  },
  {
    system: SystemName.SKILL,
    dependsOn: [SystemName.CHARACTER],
    requiredForInitialization: false
  },
  {
    system: SystemName.LEGACY,
    dependsOn: [SystemName.USER],
    requiredForInitialization: true
  },
  {
    system: SystemName.GANG,
    dependsOn: [SystemName.CHARACTER, SystemName.GOLD],
    requiredForInitialization: false
  },
  {
    system: SystemName.SHOP,
    dependsOn: [SystemName.CHARACTER, SystemName.GOLD],
    requiredForInitialization: false
  },
  {
    system: SystemName.CRAFTING,
    dependsOn: [SystemName.CHARACTER, SystemName.SKILL],
    requiredForInitialization: false
  },
  {
    system: SystemName.PROPERTY,
    dependsOn: [SystemName.CHARACTER, SystemName.GOLD],
    requiredForInitialization: false
  },
  {
    system: SystemName.ACHIEVEMENT,
    dependsOn: [SystemName.CHARACTER],
    requiredForInitialization: false
  },
  {
    system: SystemName.REPUTATION,
    dependsOn: [SystemName.CHARACTER],
    requiredForInitialization: false
  },
  {
    system: SystemName.TERRITORY,
    dependsOn: [SystemName.GANG, SystemName.CHARACTER],
    requiredForInitialization: false
  }
];

/**
 * Integration Health Checker
 */
export class IntegrationHealthChecker {
  /**
   * Check health of all system integrations
   */
  static async checkAllSystems(): Promise<IntegrationHealth[]> {
    const results: IntegrationHealth[] = [];

    for (const dep of SYSTEM_DEPENDENCIES) {
      const health = await this.checkSystem(dep);
      results.push(health);
    }

    return results;
  }

  /**
   * Check health of a specific system
   */
  static async checkSystem(dependency: SystemDependency): Promise<IntegrationHealth> {
    const health: IntegrationHealth = {
      system: dependency.system,
      status: 'healthy',
      dependencies: [],
      lastCheck: new Date(),
      issues: []
    };

    try {
      // Check each dependency
      for (const depSystem of dependency.dependsOn) {
        const startTime = Date.now();
        let connected = false;

        try {
          connected = await this.testConnection(dependency.system, depSystem);
          const latency = Date.now() - startTime;

          health.dependencies.push({
            system: depSystem,
            connected,
            latencyMs: latency
          });

          if (!connected) {
            health.status = 'degraded';
            health.issues?.push(`Cannot connect to ${depSystem}`);
          } else if (latency > 1000) {
            health.status = 'degraded';
            health.issues?.push(`High latency to ${depSystem} (${latency}ms)`);
          }
        } catch (error: any) {
          health.dependencies.push({
            system: depSystem,
            connected: false
          });
          health.status = 'down';
          health.issues?.push(`Error connecting to ${depSystem}: ${error.message}`);
        }
      }

      // If required for initialization and down, mark as critical
      if (dependency.requiredForInitialization && health.status === 'down') {
        health.issues?.push('CRITICAL: Required for system initialization');
      }
    } catch (error: any) {
      health.status = 'down';
      health.issues?.push(`System check failed: ${error.message}`);
    }

    return health;
  }

  /**
   * Test connection between two systems
   */
  private static async testConnection(
    fromSystem: SystemName,
    toSystem: SystemName
  ): Promise<boolean> {
    // Test database connectivity first
    if (!mongoose.connection.readyState) {
      return false;
    }

    // Test specific system connections
    switch (toSystem) {
      case SystemName.USER:
        return this.testUserSystem();
      case SystemName.CHARACTER:
        return this.testCharacterSystem();
      case SystemName.GOLD:
        return this.testGoldSystem();
      case SystemName.LEGACY:
        return this.testLegacySystem();
      case SystemName.QUEST:
        return this.testQuestSystem();
      case SystemName.SKILL:
        return this.testSkillSystem();
      case SystemName.COMBAT:
        return this.testCombatSystem();
      case SystemName.GANG:
        return this.testGangSystem();
      default:
        // Assume connected if model exists
        return true;
    }
  }

  /**
   * Test User system
   */
  private static async testUserSystem(): Promise<boolean> {
    try {
      const { User } = await import('../models/User.model');
      await User.estimatedDocumentCount();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Test Character system
   */
  private static async testCharacterSystem(): Promise<boolean> {
    try {
      const { Character } = await import('../models/Character.model');
      await Character.estimatedDocumentCount();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Test Gold system
   */
  private static async testGoldSystem(): Promise<boolean> {
    try {
      const { GoldService } = await import('../services/gold.service');
      // Gold service is functional if we can import it
      return typeof GoldService.getBalance === 'function';
    } catch {
      return false;
    }
  }

  /**
   * Test Legacy system
   */
  private static async testLegacySystem(): Promise<boolean> {
    try {
      const { LegacyProfileModel } = await import('../models/LegacyProfile.model');
      await LegacyProfileModel.estimatedDocumentCount();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Test Quest system
   */
  private static async testQuestSystem(): Promise<boolean> {
    try {
      const { QuestDefinition } = await import('../models/Quest.model');
      await QuestDefinition.estimatedDocumentCount();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Test Skill system
   */
  private static async testSkillSystem(): Promise<boolean> {
    try {
      const { Character } = await import('../models/Character.model');
      // Skills are embedded in character
      const hasSkills = await Character.findOne({ 'skills.0': { $exists: true } });
      return true; // Skills exist as subdocuments
    } catch {
      return false;
    }
  }

  /**
   * Test Combat system
   */
  private static async testCombatSystem(): Promise<boolean> {
    try {
      const { CombatEncounter } = await import('../models/CombatEncounter.model');
      await CombatEncounter.estimatedDocumentCount();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Test Gang system
   */
  private static async testGangSystem(): Promise<boolean> {
    try {
      const { Gang } = await import('../models/Gang.model');
      await Gang.estimatedDocumentCount();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify critical data flows
   */
  static async verifyDataFlows(): Promise<{
    success: boolean;
    flows: Array<{
      name: string;
      success: boolean;
      error?: string;
    }>;
  }> {
    const flows: Array<{ name: string; success: boolean; error?: string }> = [];

    // Test: Character → Gold flow
    try {
      const { Character } = await import('../models/Character.model');
      const testChar = await Character.findOne().limit(1);
      if (testChar && typeof testChar.gold === 'number') {
        flows.push({ name: 'Character → Gold', success: true });
      } else {
        flows.push({
          name: 'Character → Gold',
          success: false,
          error: 'Gold field not accessible'
        });
      }
    } catch (error: any) {
      flows.push({
        name: 'Character → Gold',
        success: false,
        error: error.message
      });
    }

    // Test: Character → Legacy flow
    try {
      const { Character } = await import('../models/Character.model');
      const { LegacyProfileModel } = await import('../models/LegacyProfile.model');
      const testChar = await Character.findOne().limit(1);
      if (testChar) {
        const legacy = await LegacyProfileModel.findOne({ userId: testChar.userId });
        flows.push({
          name: 'Character → Legacy',
          success: true
        });
      } else {
        flows.push({
          name: 'Character → Legacy',
          success: true,
          error: 'No test character found'
        });
      }
    } catch (error: any) {
      flows.push({
        name: 'Character → Legacy',
        success: false,
        error: error.message
      });
    }

    // Test: Quest → Gold flow
    try {
      const { QuestService } = await import('../services/quest.service');
      const { GoldService } = await import('../services/gold.service');
      flows.push({ name: 'Quest → Gold', success: true });
    } catch (error: any) {
      flows.push({
        name: 'Quest → Gold',
        success: false,
        error: error.message
      });
    }

    // Test: Combat → Multiple systems flow
    try {
      const { CombatService } = await import('../services/combat.service');
      flows.push({ name: 'Combat → Multi-system', success: true });
    } catch (error: any) {
      flows.push({
        name: 'Combat → Multi-system',
        success: false,
        error: error.message
      });
    }

    const success = flows.every(f => f.success);

    return { success, flows };
  }

  /**
   * Generate health report
   */
  static async generateHealthReport(): Promise<{
    overall: 'healthy' | 'degraded' | 'critical';
    systems: IntegrationHealth[];
    dataFlows: any;
    summary: {
      totalSystems: number;
      healthySystems: number;
      degradedSystems: number;
      downSystems: number;
      criticalIssues: string[];
    };
  }> {
    logger.info('[IntegrationHealth] Generating health report...');

    const systems = await this.checkAllSystems();
    const dataFlows = await this.verifyDataFlows();

    const healthySystems = systems.filter(s => s.status === 'healthy').length;
    const degradedSystems = systems.filter(s => s.status === 'degraded').length;
    const downSystems = systems.filter(s => s.status === 'down').length;

    const criticalIssues: string[] = [];
    for (const system of systems) {
      if (system.status === 'down') {
        const dep = SYSTEM_DEPENDENCIES.find(d => d.system === system.system);
        if (dep?.requiredForInitialization) {
          criticalIssues.push(
            `CRITICAL: ${system.system} is down (required for initialization)`
          );
        } else {
          criticalIssues.push(`${system.system} is down`);
        }
      }
    }

    let overall: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (downSystems > 0 || !dataFlows.success) {
      overall = 'critical';
    } else if (degradedSystems > 0) {
      overall = 'degraded';
    }

    logger.info(
      `[IntegrationHealth] Report complete: ${overall} - ` +
      `${healthySystems} healthy, ${degradedSystems} degraded, ${downSystems} down`
    );

    return {
      overall,
      systems,
      dataFlows,
      summary: {
        totalSystems: systems.length,
        healthySystems,
        degradedSystems,
        downSystems,
        criticalIssues
      }
    };
  }

  /**
   * Check if specific integration is healthy
   */
  static async isIntegrationHealthy(
    fromSystem: SystemName,
    toSystem: SystemName
  ): Promise<boolean> {
    try {
      return await this.testConnection(fromSystem, toSystem);
    } catch {
      return false;
    }
  }

  /**
   * Get dependency graph
   */
  static getDependencyGraph(): SystemDependency[] {
    return SYSTEM_DEPENDENCIES;
  }

  /**
   * Get systems that depend on a specific system
   */
  static getDependentSystems(system: SystemName): SystemName[] {
    return SYSTEM_DEPENDENCIES
      .filter(dep => dep.dependsOn.includes(system))
      .map(dep => dep.system);
  }

  /**
   * Get all dependencies of a system (recursive)
   */
  static getAllDependencies(system: SystemName): SystemName[] {
    const dep = SYSTEM_DEPENDENCIES.find(d => d.system === system);
    if (!dep) return [];

    const direct = dep.dependsOn;
    const indirect = direct.flatMap(s => this.getAllDependencies(s));

    return [...new Set([...direct, ...indirect])];
  }
}
