/**
 * TutorialComplete Component
 * Celebration modal shown when the tutorial is completed
 * Shows reward summary and "What's Next" guidance
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorialStore } from '@/store/useTutorialStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { getMentorPortrait, MENTOR } from '@/data/tutorial/mentorDialogues';
import { Button } from '@/components/ui';

interface TutorialCompleteProps {
  onClose?: () => void;
}

// What's next checklist items
const NEXT_STEPS = [
  {
    id: 'explore-town',
    label: 'Explore the town locations',
    description: 'Visit the Saloon, General Store, and other establishments',
    route: '/game/locations',
  },
  {
    id: 'start-skill',
    label: 'Queue up skill training',
    description: 'Skills train even when you are offline',
    route: '/game/skills',
  },
  {
    id: 'check-quests',
    label: 'Check available quests',
    description: 'Quests give great rewards and guide your adventure',
    route: '/game/quests',
  },
  {
    id: 'join-gang',
    label: 'Consider joining a gang',
    description: 'Team up with other players for bigger opportunities',
    route: '/game/gangs',
  },
];

export const TutorialComplete: React.FC<TutorialCompleteProps> = ({
  onClose,
}) => {
  const navigate = useNavigate();
  const { tutorialCompleted, showCompletionModal, dismissCompletionModal, startedAt, completedAt, getAnalyticsSummary } = useTutorialStore();
  const { currentCharacter } = useCharacterStore();

  const [showContent, setShowContent] = useState(false);
  const [completedChecks, setCompletedChecks] = useState<string[]>([]);

  // Animate in after mount
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate time spent
  const getTimeSpent = () => {
    if (!startedAt || !completedAt) return 'Unknown';
    const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return 'Less than a minute';
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  };

  // Combined close handler
  const handleClose = () => {
    dismissCompletionModal();
    if (onClose) onClose();
  };

  // Handle navigation to a next step
  const handleNavigate = (step: typeof NEXT_STEPS[0]) => {
    setCompletedChecks([...completedChecks, step.id]);
    handleClose();
    navigate(step.route);
  };

  // Don't render if modal shouldn't be shown
  if (!showCompletionModal || !tutorialCompleted) {
    return null;
  }

  const analytics = getAnalyticsSummary();

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-opacity duration-500 ${
        showContent ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-complete-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal content */}
      <div
        className={`relative bg-gradient-to-b from-leather-brown to-leather-dark border-4 border-gold rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-500 ${
          showContent ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Decorative corners */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1 left-1 w-4 h-4 bg-gold-dark/60 rounded-full" />
          <div className="absolute top-1 right-1 w-4 h-4 bg-gold-dark/60 rounded-full" />
          <div className="absolute bottom-1 left-1 w-4 h-4 bg-gold-dark/60 rounded-full" />
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-gold-dark/60 rounded-full" />
        </div>

        {/* Header with celebration */}
        <div className="relative text-center pt-8 pb-4 px-6">
          {/* Star burst decoration */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-32 opacity-20">
            <div className="absolute inset-0 bg-gold-light rounded-full blur-xl animate-pulse" />
          </div>

          {/* Portrait with celebration frame */}
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-gold bg-wood-dark overflow-hidden shadow-lg ring-4 ring-gold-light/30">
              <img
                src={getMentorPortrait('pleased')}
                alt={`${MENTOR.name} - proud`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/portraits/mentor/placeholder.png';
                }}
              />
            </div>
            {/* Celebration badge */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gold rounded-full flex items-center justify-center border-2 border-gold-dark shadow-lg">
              <span className="text-lg">&#9733;</span>
            </div>
          </div>

          <h2
            id="tutorial-complete-title"
            className="text-2xl sm:text-3xl font-western text-gold-light mb-2"
          >
            Tutorial Complete!
          </h2>
          <p className="text-desert-sand text-lg">
            {MENTOR.name} tips their hat in approval
          </p>
        </div>

        {/* Reward summary */}
        <div className="px-6 pb-4">
          <div className="bg-wood-dark/50 rounded-lg p-4 border border-gold-dark/30">
            <h3 className="text-gold-light font-semibold mb-3 text-sm uppercase tracking-wide">
              Your Journey So Far
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-light">
                  {currentCharacter?.level || 1}
                </div>
                <div className="text-desert-stone">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-light">
                  {currentCharacter?.gold?.toLocaleString() || 0}
                </div>
                <div className="text-desert-stone">Gold</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-desert-sand">
                  {getTimeSpent()}
                </div>
                <div className="text-desert-stone text-xs">Time Spent</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-desert-sand">
                  {analytics.completedSections?.length || 4}
                </div>
                <div className="text-desert-stone text-xs">Sections Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next section */}
        <div className="px-6 pb-4">
          <h3 className="text-gold-light font-semibold mb-3 text-sm uppercase tracking-wide">
            What's Next?
          </h3>
          <div className="space-y-2">
            {NEXT_STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => handleNavigate(step)}
                className="w-full text-left bg-wood-dark/30 hover:bg-wood-dark/50 rounded-lg p-3 border border-transparent hover:border-gold-dark/30 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded border-2 border-gold-dark/50 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:border-gold">
                    {completedChecks.includes(step.id) && (
                      <span className="text-gold-light text-xs">&#10003;</span>
                    )}
                  </div>
                  <div>
                    <div className="text-desert-sand font-medium group-hover:text-gold-light transition-colors">
                      {step.label}
                    </div>
                    <div className="text-desert-stone text-sm">
                      {step.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Hawk's final message */}
        <div className="px-6 pb-4">
          <div className="bg-gradient-to-r from-transparent via-gold-dark/20 to-transparent h-px mb-4" />
          <p className="text-desert-sand italic text-center text-sm">
            "The frontier is yours to conquer, partner. I'll be watching from the shadows.
            If you ever need a refresher, the tutorial is always available in the Help menu."
          </p>
          <p className="text-desert-stone text-center text-xs mt-2">
            — {MENTOR.name}, {MENTOR.title}
          </p>
        </div>

        {/* Close button */}
        <div className="px-6 pb-6">
          <Button
            onClick={handleClose}
            variant="primary"
            className="w-full"
          >
            Begin Your Legend
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TutorialComplete;
