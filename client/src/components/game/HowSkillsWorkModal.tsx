/**
 * HowSkillsWorkModal Component
 * Educational modal explaining the skill system
 */

import React from 'react';
import { Modal } from '@/components/ui/Modal';

interface HowSkillsWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Wanted poster styled modal explaining skill mechanics
 */
export const HowSkillsWorkModal: React.FC<HowSkillsWorkModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="How Skills Work"
      size="lg"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* Introduction */}
        <div className="parchment p-4 rounded">
          <h3 className="text-xl font-western text-wood-dark mb-2">
            Master the Frontier
          </h3>
          <p className="text-wood-dark">
            Skills are your path to becoming a legend of the Wild West. Train your abilities to gain permanent bonuses to your Destiny Deck performance.
          </p>
        </div>

        {/* How Training Works */}
        <div>
          <h4 className="text-lg font-western text-wood-dark mb-3 flex items-center gap-2">
            <span>⏳</span> Training Mechanics
          </h4>
          <ul className="space-y-2 text-wood-dark">
            <li className="flex items-start gap-2">
              <span className="text-gold-dark font-bold">•</span>
              <span><strong>One at a time:</strong> You can only train one skill at a time. Choose wisely!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-dark font-bold">•</span>
              <span><strong>Offline training:</strong> Training continues even when you're not playing. Come back later to claim your rewards!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-dark font-bold">•</span>
              <span><strong>Training time:</strong> Each level takes time to complete. Higher levels take longer to train.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-dark font-bold">•</span>
              <span><strong>No cancellation penalty:</strong> You can cancel training anytime, but you'll lose all progress and gain no XP.</span>
            </li>
          </ul>
        </div>

        {/* Destiny Deck Bonuses */}
        <div>
          <h4 className="text-lg font-western text-wood-dark mb-3 flex items-center gap-2">
            <span>🃏</span> Destiny Deck Bonuses
          </h4>
          <p className="text-wood-dark mb-3">
            Each skill level adds <strong className="text-gold-dark">+1</strong> to the relevant Destiny Deck suit:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Spades - Combat */}
            <div className="parchment p-3 border-2 border-gray-800 rounded">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl text-gray-800">♠</span>
                <div>
                  <div className="font-bold text-wood-dark">Spades</div>
                  <div className="text-xs text-wood-grain uppercase">Combat</div>
                </div>
              </div>
              <p className="text-xs text-wood-dark">
                Physical combat, brawling, gunfighting, and raw strength challenges.
              </p>
            </div>

            {/* Hearts - Spirit */}
            <div className="parchment p-3 border-2 border-red-600 rounded">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl text-red-600">♥</span>
                <div>
                  <div className="font-bold text-wood-dark">Hearts</div>
                  <div className="text-xs text-wood-grain uppercase">Spirit</div>
                </div>
              </div>
              <p className="text-xs text-wood-dark">
                Social interactions, charisma, leadership, and spiritual challenges.
              </p>
            </div>

            {/* Clubs - Cunning */}
            <div className="parchment p-3 border-2 border-purple-600 rounded">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl text-purple-600">♣</span>
                <div>
                  <div className="font-bold text-wood-dark">Clubs</div>
                  <div className="text-xs text-wood-grain uppercase">Cunning</div>
                </div>
              </div>
              <p className="text-xs text-wood-dark">
                Stealth, deception, manipulation, and tactical challenges.
              </p>
            </div>

            {/* Diamonds - Craft */}
            <div className="parchment p-3 border-2 border-orange-600 rounded">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl text-orange-600">♦</span>
                <div>
                  <div className="font-bold text-wood-dark">Diamonds</div>
                  <div className="text-xs text-wood-grain uppercase">Craft</div>
                </div>
              </div>
              <p className="text-xs text-wood-dark">
                Crafting, trading, technical skills, and resource challenges.
              </p>
            </div>
          </div>
        </div>

        {/* Example */}
        <div className="bg-gold-dark/10 border-2 border-gold-dark rounded p-4">
          <h4 className="text-lg font-western text-wood-dark mb-2 flex items-center gap-2">
            <span>📚</span> Example
          </h4>
          <p className="text-sm text-wood-dark">
            If you have <strong>Gunfighting</strong> at level 10, you get <strong className="text-gold-dark">+10</strong> to all Spades (♠) cards when facing combat challenges. This makes it easier to succeed in gunfights!
          </p>
        </div>

        {/* Tips */}
        <div>
          <h4 className="text-lg font-western text-wood-dark mb-3 flex items-center gap-2">
            <span>💡</span> Tips for Success
          </h4>
          <ul className="space-y-2 text-wood-dark text-sm">
            <li className="flex items-start gap-2">
              <span className="text-gold-dark font-bold">✓</span>
              <span>Focus on skills that match your playstyle and faction strengths.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-dark font-bold">✓</span>
              <span>Train skills before logging off to maximize offline progress.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-dark font-bold">✓</span>
              <span>Balance your skills across suits for versatility in different challenges.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-dark font-bold">✓</span>
              <span>Check back regularly to complete training and start new skills.</span>
            </li>
          </ul>
        </div>

        {/* Close button */}
        <div className="pt-4 border-t border-wood-light">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gold-medium hover:bg-gold-dark text-wood-dark font-western font-bold text-lg rounded-lg transition-colors border-2 border-gold-dark"
          >
            Got It!
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default HowSkillsWorkModal;
