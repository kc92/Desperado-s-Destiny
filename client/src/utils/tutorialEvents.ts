/**
 * Tutorial Events - Helper functions to dispatch game events for tutorial tracking
 *
 * Game components should call these functions when actions occur.
 * The tutorial system listens for these events via useGlobalTutorialActionHandlers.
 */

// Event name constants
export const TUTORIAL_EVENTS = {
  JOB_COMPLETED: 'game-event-job-completed',
  ITEM_CRAFTED: 'game-event-item-crafted',
  TRAINING_STARTED: 'game-event-training-started',
  ITEM_SOLD: 'game-event-item-sold',
  ITEM_EQUIPPED: 'game-event-item-equipped',
  COMBAT_STARTED: 'game-event-combat-started',
  COMBAT_WON: 'game-event-combat-won',
  JOB_ACCEPTED: 'game-event-job-accepted',
  PANEL_OPENED: 'game-event-panel-opened',
  INVENTORY_OPENED: 'game-event-inventory-opened',
  DECK_DRAWN: 'game-event-deck-drawn',
  SKILL_QUEUED: 'game-event-skill-queued',
} as const;

/**
 * Dispatch when a job is completed
 * @param jobId - The ID of the completed job (e.g., 'general-labor', 'mine-iron-ore')
 */
export const dispatchJobCompleted = (jobId: string) => {
  window.dispatchEvent(
    new CustomEvent(TUTORIAL_EVENTS.JOB_COMPLETED, {
      detail: { jobId },
    })
  );
};

/**
 * Dispatch when a job is accepted/started
 * @param jobId - The ID of the accepted job
 */
export const dispatchJobAccepted = (jobId: string) => {
  window.dispatchEvent(
    new CustomEvent(TUTORIAL_EVENTS.JOB_ACCEPTED, {
      detail: { jobId },
    })
  );
};

/**
 * Dispatch when an item is crafted
 * @param recipeId - The ID of the crafted recipe (e.g., 'silver-ingot', 'blade-blank')
 */
export const dispatchItemCrafted = (recipeId: string) => {
  window.dispatchEvent(
    new CustomEvent(TUTORIAL_EVENTS.ITEM_CRAFTED, {
      detail: { recipeId },
    })
  );
};

/**
 * Dispatch when skill training is started
 * @param skillId - The ID of the skill being trained
 */
export const dispatchTrainingStarted = (skillId: string) => {
  window.dispatchEvent(
    new CustomEvent(TUTORIAL_EVENTS.TRAINING_STARTED, {
      detail: { skillId },
    })
  );
};

/**
 * Dispatch when an item is sold
 * @param itemId - The ID of the sold item (e.g., 'silver-ingot')
 */
export const dispatchItemSold = (itemId: string) => {
  window.dispatchEvent(
    new CustomEvent(TUTORIAL_EVENTS.ITEM_SOLD, {
      detail: { itemId },
    })
  );
};

/**
 * Dispatch when an item is equipped
 * @param itemId - The ID of the equipped item
 */
export const dispatchItemEquipped = (itemId: string) => {
  window.dispatchEvent(
    new CustomEvent(TUTORIAL_EVENTS.ITEM_EQUIPPED, {
      detail: { itemId },
    })
  );
};

/**
 * Dispatch when combat is started
 * @param enemyId - The ID of the enemy being fought (e.g., 'coyote', 'bandit')
 */
export const dispatchCombatStarted = (enemyId: string) => {
  window.dispatchEvent(
    new CustomEvent(TUTORIAL_EVENTS.COMBAT_STARTED, {
      detail: { enemyId },
    })
  );
};

/**
 * Dispatch when combat is won
 * @param enemyId - The ID of the defeated enemy
 */
export const dispatchCombatWon = (enemyId: string) => {
  window.dispatchEvent(
    new CustomEvent(TUTORIAL_EVENTS.COMBAT_WON, {
      detail: { enemyId },
    })
  );
};

/**
 * Dispatch when a UI panel is opened
 * @param panelId - The ID of the opened panel (e.g., 'character', 'inventory', 'skills')
 */
export const dispatchPanelOpened = (panelId: string) => {
  window.dispatchEvent(
    new CustomEvent(TUTORIAL_EVENTS.PANEL_OPENED, {
      detail: { panelId },
    })
  );
};

/**
 * Dispatch when inventory is opened
 */
export const dispatchInventoryOpened = () => {
  window.dispatchEvent(
    new CustomEvent(TUTORIAL_EVENTS.INVENTORY_OPENED, {
      detail: {},
    })
  );
};

/**
 * Dispatch when the Destiny Deck is drawn
 * @param handQuality - Optional quality rating of the hand ('poor', 'average', 'good', 'excellent')
 */
export const dispatchDeckDrawn = (handQuality?: string) => {
  window.dispatchEvent(
    new CustomEvent(TUTORIAL_EVENTS.DECK_DRAWN, {
      detail: { handQuality },
    })
  );
};

/**
 * Dispatch when a skill is queued for training
 * @param skillId - The ID of the queued skill
 */
export const dispatchSkillQueued = (skillId: string) => {
  window.dispatchEvent(
    new CustomEvent(TUTORIAL_EVENTS.SKILL_QUEUED, {
      detail: { skillId },
    })
  );
};
