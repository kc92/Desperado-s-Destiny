/**
 * GettingStartedGuide Component
 * Collapsible checklist widget to help new players get oriented
 * Shows for characters level 1-5, can be dismissed
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useTutorialStore } from '@/store/useTutorialStore';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  route?: string;
  checkFn: () => boolean;
  priority: 'essential' | 'recommended' | 'optional';
}

interface GettingStartedGuideProps {
  className?: string;
}

// Local storage key for dismissed state
const DISMISSED_KEY = 'desperados-getting-started-dismissed';
const COLLAPSED_KEY = 'desperados-getting-started-collapsed';

export const GettingStartedGuide: React.FC<GettingStartedGuideProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { currentCharacter } = useCharacterStore();
  const { tutorialCompleted, getTotalProgress } = useTutorialStore();

  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(DISMISSED_KEY) === 'true';
  });

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem(COLLAPSED_KEY) === 'true';
  });

  // Don't show for characters above level 5 or if dismissed
  const shouldShow = currentCharacter && currentCharacter.level <= 5 && !isDismissed;

  // Update localStorage when collapsed state changes
  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, isCollapsed.toString());
  }, [isCollapsed]);

  // Define checklist items with completion checks
  const checklistItems: ChecklistItem[] = [
    {
      id: 'tutorial',
      title: 'Complete Tutorial',
      description: 'Learn the basics with Hawk',
      checkFn: () => tutorialCompleted || getTotalProgress() >= 50,
      priority: 'essential',
    },
    {
      id: 'first-action',
      title: 'Complete First Action',
      description: 'Try the Bounty Board',
      route: '/game/actions',
      checkFn: () => (currentCharacter?.experience || 0) > 0,
      priority: 'essential',
    },
    {
      id: 'earn-gold',
      title: 'Earn 100 Gold',
      description: 'Build your fortune',
      checkFn: () => (currentCharacter?.gold || 0) >= 100,
      priority: 'essential',
    },
    {
      id: 'visit-skills',
      title: 'Train a Skill',
      description: 'Visit the Library',
      route: '/game/skills',
      checkFn: () => (currentCharacter?.skills?.length || 0) > 0,
      priority: 'recommended',
    },
    {
      id: 'check-inventory',
      title: 'Check Your Inventory',
      description: 'See your equipment',
      route: '/game/inventory',
      checkFn: () => false, // This is always shown until manually checked via localStorage
      priority: 'recommended',
    },
    {
      id: 'explore-territory',
      title: 'Explore the Territory',
      description: 'Travel to new locations',
      route: '/game/territory',
      checkFn: () => (currentCharacter?.level ?? 1) >= 2,
      priority: 'optional',
    },
  ];

  // Calculate completion status for each item
  const itemsWithStatus = checklistItems.map(item => ({
    ...item,
    completed: item.checkFn(),
  }));

  const completedCount = itemsWithStatus.filter(i => i.completed).length;
  const totalCount = itemsWithStatus.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };

  const handleItemClick = (item: typeof itemsWithStatus[0]) => {
    if (item.route && !item.completed) {
      navigate(item.route);
    }
  };

  if (!shouldShow) {
    return null;
  }

  // Priority color mapping
  const priorityColors = {
    essential: 'border-gold-medium',
    recommended: 'border-blue-500',
    optional: 'border-gray-500',
  };

  return (
    <Card variant="leather" className={`p-3 ${className}`}>
      {/* Header with collapse/dismiss controls */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 text-left flex-1"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand getting started guide' : 'Collapse getting started guide'}
        >
          <svg
            className={`w-4 h-4 text-gold-medium transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <h3 className="text-sm font-western text-gold-light">Getting Started</h3>
          <span className="text-xs text-desert-stone">
            {completedCount}/{totalCount}
          </span>
        </button>

        <button
          onClick={handleDismiss}
          className="text-desert-stone hover:text-red-400 transition-colors p-1"
          aria-label="Dismiss getting started guide"
          title="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-wood-dark/50 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-gold-dark to-gold-light transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist Items (collapsible) */}
      {!isCollapsed && (
        <div className="space-y-1.5 animate-fadeIn">
          {itemsWithStatus.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              disabled={item.completed}
              className={`w-full text-left p-2 rounded border-l-2 transition-colors ${
                item.completed
                  ? 'bg-green-900/20 border-green-500 opacity-60'
                  : `bg-wood-dark/30 hover:bg-wood-dark/50 ${priorityColors[item.priority]}`
              }`}
              aria-label={`${item.title}: ${item.completed ? 'completed' : 'not completed'}`}
            >
              <div className="flex items-start gap-2">
                {/* Checkbox */}
                <div className={`w-4 h-4 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center ${
                  item.completed
                    ? 'bg-green-600 border-green-500'
                    : 'border-desert-stone'
                }`}>
                  {item.completed && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold ${item.completed ? 'text-green-400 line-through' : 'text-desert-sand'}`}>
                    {item.title}
                  </div>
                  <div className="text-[10px] text-desert-stone truncate">
                    {item.description}
                  </div>
                </div>

                {/* Navigate arrow for incomplete items with routes */}
                {!item.completed && item.route && (
                  <svg className="w-4 h-4 text-desert-stone" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}

          {/* All Complete Message */}
          {completedCount === totalCount && (
            <div className="text-center py-2">
              <span className="text-xs text-green-400 font-semibold">
                Great work, partner! You're ready for the frontier!
              </span>
            </div>
          )}

          {/* Priority Legend */}
          <div className="flex gap-3 justify-center pt-2 border-t border-wood-grain/20">
            <span className="text-[9px] text-desert-stone flex items-center gap-1">
              <span className="w-2 h-2 bg-gold-medium rounded-sm"></span> Essential
            </span>
            <span className="text-[9px] text-desert-stone flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-sm"></span> Recommended
            </span>
            <span className="text-[9px] text-desert-stone flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-500 rounded-sm"></span> Optional
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default GettingStartedGuide;
