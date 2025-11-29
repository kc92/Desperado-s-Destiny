/**
 * FeedbackContainer Component
 * Central container for all feedback animations
 * Use this component along with the useFeedbackAnimations hook
 */

import React from 'react';
import { SuccessAnimation } from './SuccessAnimation';
import { FailureAnimation } from './FailureAnimation';
import { LevelUpCelebration } from './LevelUpCelebration';
import { GoldAnimationContainer } from './GoldAnimation';
import { XPGainContainer } from './XPGain';
import { useFeedbackAnimations } from '@/hooks/useFeedbackAnimations';

interface FeedbackContainerProps {
  /** Optional: Pass external feedback state if managing centrally */
  feedbackState?: ReturnType<typeof useFeedbackAnimations>;
}

/**
 * Container that renders all active feedback animations
 * Place this in your main app layout or game layout
 *
 * @example
 * // In your component:
 * const feedback = useFeedbackAnimations();
 *
 * // Later, trigger animations:
 * feedback.showSuccess('Action completed!');
 * feedback.addGoldAnimation(100, { x: 500, y: 300 });
 * feedback.addXPGain(25);
 *
 * // In your layout:
 * <FeedbackContainer feedbackState={feedback} />
 */
export const FeedbackContainer: React.FC<FeedbackContainerProps> = ({
  feedbackState: externalState,
}) => {
  // Use external state if provided, otherwise create internal state
  const internalState = useFeedbackAnimations();
  const feedback = externalState || internalState;

  const {
    state,
    clearSuccess,
    clearFailure,
    clearLevelUp,
    removeGoldAnimation,
    removeXPGain,
  } = feedback;

  return (
    <>
      {/* Success Animation */}
      <SuccessAnimation
        show={state.success.show}
        message={state.success.message}
        onComplete={clearSuccess}
      />

      {/* Failure Animation */}
      <FailureAnimation
        show={state.failure.show}
        message={state.failure.message}
        onComplete={clearFailure}
      />

      {/* Level Up Celebration */}
      {state.levelUp && (
        <LevelUpCelebration
          show={state.levelUp.show}
          newLevel={state.levelUp.newLevel}
          onComplete={clearLevelUp}
        />
      )}

      {/* Gold Animations */}
      <GoldAnimationContainer
        animations={state.goldAnimations}
        onAnimationComplete={removeGoldAnimation}
      />

      {/* XP Gain Animations */}
      <XPGainContainer
        animations={state.xpGains}
        onAnimationComplete={removeXPGain}
      />
    </>
  );
};

export default FeedbackContainer;
