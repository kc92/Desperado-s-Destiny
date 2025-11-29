/**
 * Feedback Animations Examples
 * Demo component showing all feedback animation types
 */

import React, { useState } from 'react';
import { FeedbackContainer, useFeedbackAnimations } from './index';

/**
 * Demo component showcasing all feedback animations
 * Use this as a reference for implementing feedback in your components
 */
export const FeedbackAnimationsDemo: React.FC = () => {
  const feedback = useFeedbackAnimations();
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  // Track click position for animations
  const handleClick = (e: React.MouseEvent) => {
    setClickPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="min-h-screen bg-desert-sand p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-western text-wood-darker mb-8 text-center">
          Feedback Animations Demo
        </h1>

        <div className="wood-panel mb-8">
          <h2 className="text-2xl font-western text-desert-sand mb-4">
            Success & Failure
          </h2>
          <p className="text-desert-dust mb-4">
            Full-screen animations for action outcomes
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => feedback.showSuccess('Mission accomplished!')}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-western transition-colors"
            >
              Show Success
            </button>
            <button
              onClick={() => feedback.showSuccess()}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-western transition-colors"
            >
              Success (No Message)
            </button>
            <button
              onClick={() => feedback.showFailure('Mission failed!')}
              className="px-6 py-3 bg-blood-red hover:bg-blood-dark text-white rounded-lg font-western transition-colors"
            >
              Show Failure
            </button>
            <button
              onClick={() => feedback.showFailure()}
              className="px-6 py-3 bg-blood-crimson hover:bg-blood-red text-white rounded-lg font-western transition-colors"
            >
              Failure (No Message)
            </button>
          </div>
        </div>

        <div className="wood-panel mb-8">
          <h2 className="text-2xl font-western text-desert-sand mb-4">
            Level Up Celebration
          </h2>
          <p className="text-desert-dust mb-4">
            Modal-style celebration for level ups
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => feedback.showLevelUp({ newLevel: 10 })}
              className="px-6 py-3 bg-gold-dark hover:bg-gold-medium text-wood-darker rounded-lg font-western transition-colors"
            >
              Level 10
            </button>
            <button
              onClick={() => feedback.showLevelUp({ newLevel: 25 })}
              className="px-6 py-3 bg-gold-dark hover:bg-gold-medium text-wood-darker rounded-lg font-western transition-colors"
            >
              Level 25
            </button>
            <button
              onClick={() => feedback.showLevelUp({ newLevel: 100 })}
              className="px-6 py-3 bg-gold-dark hover:bg-gold-medium text-wood-darker rounded-lg font-western transition-colors"
            >
              Level 100
            </button>
          </div>
        </div>

        <div className="wood-panel mb-8" onClick={handleClick}>
          <h2 className="text-2xl font-western text-desert-sand mb-4">
            Gold Animations
          </h2>
          <p className="text-desert-dust mb-4">
            Click anywhere in this panel, then click a button to see gold animation at that position
          </p>
          <div className="flex gap-4 mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                feedback.addGoldAnimation(50, clickPosition);
              }}
              className="px-6 py-3 bg-gold-medium hover:bg-gold-light text-wood-darker rounded-lg font-western transition-colors"
            >
              +50 Gold
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                feedback.addGoldAnimation(250, clickPosition);
              }}
              className="px-6 py-3 bg-gold-medium hover:bg-gold-light text-wood-darker rounded-lg font-western transition-colors"
            >
              +250 Gold
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                feedback.addGoldAnimation(-100, clickPosition);
              }}
              className="px-6 py-3 bg-blood-red hover:bg-blood-dark text-white rounded-lg font-western transition-colors"
            >
              -100 Gold
            </button>
          </div>
          <div className="text-sm text-desert-dust">
            Click position: ({Math.round(clickPosition.x)}, {Math.round(clickPosition.y)})
          </div>
        </div>

        <div className="wood-panel mb-8">
          <h2 className="text-2xl font-western text-desert-sand mb-4">
            XP Gains
          </h2>
          <p className="text-desert-dust mb-4">
            Small popups for experience gains
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => feedback.addXPGain(10)}
              className="px-6 py-3 bg-faction-settler hover:bg-faction-settler/80 text-white rounded-lg font-western transition-colors"
            >
              +10 XP
            </button>
            <button
              onClick={() => feedback.addXPGain(50)}
              className="px-6 py-3 bg-faction-settler hover:bg-faction-settler/80 text-white rounded-lg font-western transition-colors"
            >
              +50 XP
            </button>
            <button
              onClick={() => feedback.addXPGain(100)}
              className="px-6 py-3 bg-faction-settler hover:bg-faction-settler/80 text-white rounded-lg font-western transition-colors"
            >
              +100 XP
            </button>
            <button
              onClick={() => {
                // Show multiple XP gains at once
                feedback.addXPGain(25);
                setTimeout(() => feedback.addXPGain(25), 200);
                setTimeout(() => feedback.addXPGain(25), 400);
              }}
              className="px-6 py-3 bg-faction-settler hover:bg-faction-settler/80 text-white rounded-lg font-western transition-colors"
            >
              Multiple XP
            </button>
          </div>
        </div>

        <div className="wood-panel mb-8">
          <h2 className="text-2xl font-western text-desert-sand mb-4">
            Combined Effects
          </h2>
          <p className="text-desert-dust mb-4">
            Realistic game scenarios with multiple animations
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                feedback.showSuccess('Combat victory!');
                setTimeout(() => {
                  feedback.addGoldAnimation(150, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
                  feedback.addXPGain(75);
                }, 500);
              }}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-western transition-colors"
            >
              Combat Win
            </button>
            <button
              onClick={() => {
                feedback.showSuccess('Crime successful!');
                setTimeout(() => {
                  feedback.addGoldAnimation(500, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
                  feedback.addXPGain(100);
                }, 500);
                setTimeout(() => {
                  feedback.showLevelUp({ newLevel: 15 });
                }, 1500);
              }}
              className="px-6 py-3 bg-gold-dark hover:bg-gold-medium text-wood-darker rounded-lg font-western transition-colors"
            >
              Crime + Level Up
            </button>
            <button
              onClick={() => {
                feedback.showFailure('You were caught!');
                setTimeout(() => {
                  feedback.addGoldAnimation(-200, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
                }, 500);
              }}
              className="px-6 py-3 bg-blood-red hover:bg-blood-dark text-white rounded-lg font-western transition-colors"
            >
              Crime Fail + Fine
            </button>
          </div>
        </div>

        <div className="wood-panel mb-8">
          <h2 className="text-2xl font-western text-desert-sand mb-4">
            Controls
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => feedback.clearAll()}
              className="px-6 py-3 bg-wood-dark hover:bg-wood-darker text-desert-sand rounded-lg font-western transition-colors"
            >
              Clear All Animations
            </button>
          </div>
        </div>

        <div className="parchment p-6">
          <h3 className="text-xl font-western text-wood-darker mb-4">
            Animation State
          </h3>
          <pre className="text-sm text-wood-dark overflow-auto">
            {JSON.stringify(feedback.state, null, 2)}
          </pre>
        </div>
      </div>

      {/* Render feedback container */}
      <FeedbackContainer feedbackState={feedback} />
    </div>
  );
};

export default FeedbackAnimationsDemo;
