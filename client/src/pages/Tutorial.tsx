/**
 * Tutorial Page
 * Access and manage game tutorials
 */

import React from 'react';
import { Card, Button } from '@/components/ui';
import { useTutorialStore, TUTORIAL_SECTIONS } from '@/store/useTutorialStore';

export const Tutorial: React.FC = () => {
  const { completedSections, startTutorial, resetTutorial } = useTutorialStore();

  const getCompletionStatus = (sectionId: string) => {
    return completedSections.includes(sectionId);
  };

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'welcome': return '👋';
      case 'actions': return '⚡';
      case 'crimes': return '🎭';
      case 'combat': return '⚔️';
      case 'gangs': return '🏴';
      default: return '📖';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="leather">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-western text-gold-light">
                Tutorials
              </h1>
              <p className="text-desert-sand font-serif mt-1">
                Learn the ropes of Sangre Territory
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gold-light">
                {completedSections.length}/{TUTORIAL_SECTIONS.length}
              </div>
              <div className="text-sm text-desert-stone">Completed</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-3 bg-wood-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-dark to-gold-light transition-all duration-500"
              style={{ width: `${(completedSections.length / TUTORIAL_SECTIONS.length) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Tutorial List */}
      <div className="grid gap-4">
        {TUTORIAL_SECTIONS.map(section => {
          const isCompleted = getCompletionStatus(section.id);

          return (
            <Card
              key={section.id}
              variant="parchment"
              className={isCompleted ? 'opacity-75' : ''}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">
                      {getSectionIcon(section.id)}
                    </div>
                    <div>
                      <h3 className="text-xl font-western text-wood-dark flex items-center gap-2">
                        {section.name}
                        {isCompleted && (
                          <span className="text-green-500 text-sm">✓ Completed</span>
                        )}
                      </h3>
                      <p className="text-wood-grain text-sm">
                        {section.steps.length} steps
                      </p>
                    </div>
                  </div>

                  <Button
                    variant={isCompleted ? 'secondary' : 'primary'}
                    onClick={() => startTutorial(section.id, 'core')}
                  >
                    {isCompleted ? 'Review' : 'Start'}
                  </Button>
                </div>

                {/* Step Preview */}
                <div className="mt-4 pt-4 border-t border-wood-grain/20">
                  <p className="text-sm text-wood-grain mb-2">Topics covered:</p>
                  <div className="flex flex-wrap gap-2">
                    {section.steps.map(step => (
                      <span
                        key={step.id}
                        className="text-xs bg-wood-grain/10 px-2 py-1 rounded text-wood-dark"
                      >
                        {step.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Start for New Players */}
      {completedSections.length === 0 && (
        <Card variant="leather">
          <div className="p-6 text-center">
            <h3 className="text-lg font-western text-gold-light mb-2">
              New to Desperados Destiny?
            </h3>
            <p className="text-desert-sand text-sm mb-4">
              Start with the Welcome tutorial to learn the basics
            </p>
            <Button
              variant="primary"
              onClick={() => startTutorial('welcome', 'core')}
            >
              Start Welcome Tutorial
            </Button>
          </div>
        </Card>
      )}

      {/* Reset Option */}
      {completedSections.length > 0 && (
        <Card variant="leather">
          <div className="p-4 text-center">
            <button
              onClick={resetTutorial}
              className="text-sm text-desert-stone hover:text-red-400 transition-colors"
            >
              Reset All Tutorial Progress
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Tutorial;
