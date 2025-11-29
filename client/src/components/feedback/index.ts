/**
 * Feedback Components
 * Visual feedback animations for key game events
 */

export { SuccessAnimation } from './SuccessAnimation';
export { FailureAnimation } from './FailureAnimation';
export { LevelUpCelebration } from './LevelUpCelebration';
export { GoldAnimation, GoldAnimationContainer } from './GoldAnimation';
export { XPGain, XPGainContainer } from './XPGain';
export { FeedbackContainer } from './FeedbackContainer';

// Re-export the hook for convenience
export { useFeedbackAnimations } from '@/hooks/useFeedbackAnimations';
