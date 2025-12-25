/**
 * Tutorial Components Barrel Export
 * AAA Tutorial System for Desperados Destiny
 *
 * Phase 16: Enhanced with Hawk Mentorship System components
 */

// Legacy Tutorial Components
export { TutorialOverlay } from './TutorialOverlay';
export { MentorDialogue } from './MentorDialogue';
export { TutorialSpotlight } from './TutorialSpotlight';
export { TutorialAutoTrigger } from './TutorialAutoTrigger';
export { TutorialComplete } from './TutorialComplete';
export { HandQuiz } from './HandQuiz';

// Phase 16: Hawk Mentorship System Components
export {
  HawkAvatar,
  HawkMiniAvatar,
  HAWK_PROFILE,
  getHawkPortrait,
  getExpressionDisplayName,
} from './HawkAvatar';
export type { HawkAvatarProps, HawkMiniAvatarProps } from './HawkAvatar';

export {
  HawkDialogueBox,
  FloatingTipIndicator,
} from './HawkDialogueBox';
export type { HawkDialogueBoxProps, FloatingTipIndicatorProps } from './HawkDialogueBox';

export {
  HawkCompanion,
  CompactHawk,
} from './HawkCompanion';
export type { HawkCompanionProps, CompactHawkProps } from './HawkCompanion';

export {
  TutorialGraduation,
  useGraduationTrigger,
} from './TutorialGraduation';
export type { TutorialGraduationProps } from './TutorialGraduation';
