/**
 * Deck Guide Page
 * Tutorial explaining the Destiny Deck poker mechanic
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui';
import { useCharacterStore } from '@/store/useCharacterStore';

interface HandExample {
  name: string;
  description: string;
  baseScore: number;
  cards: string[];
  example: string;
}

const HAND_RANKINGS: HandExample[] = [
  {
    name: 'Royal Flush',
    description: 'A, K, Q, J, 10 all of the same suit',
    baseScore: 1000,
    cards: ['🂡', '🂮', '🂭', '🂫', '🂪'],
    example: 'A♠ K♠ Q♠ J♠ 10♠'
  },
  {
    name: 'Straight Flush',
    description: 'Five consecutive cards of the same suit',
    baseScore: 750,
    cards: ['🂩', '🂨', '🂧', '🂦', '🂥'],
    example: '9♠ 8♠ 7♠ 6♠ 5♠'
  },
  {
    name: 'Four of a Kind',
    description: 'Four cards of the same rank',
    baseScore: 500,
    cards: ['🂡', '🃁', '🃑', '🂱', '🂮'],
    example: 'A♠ A♥ A♦ A♣ K♠'
  },
  {
    name: 'Full House',
    description: 'Three of a kind plus a pair',
    baseScore: 350,
    cards: ['🂮', '🃎', '🃞', '🂫', '🃋'],
    example: 'K♠ K♥ K♦ J♠ J♥'
  },
  {
    name: 'Flush',
    description: 'Five cards of the same suit',
    baseScore: 250,
    cards: ['🂡', '🂪', '🂨', '🂥', '🂢'],
    example: 'A♠ 10♠ 8♠ 5♠ 2♠'
  },
  {
    name: 'Straight',
    description: 'Five consecutive cards of any suit',
    baseScore: 200,
    cards: ['🂩', '🃈', '🃗', '🂶', '🂥'],
    example: '9♠ 8♥ 7♦ 6♣ 5♠'
  },
  {
    name: 'Three of a Kind',
    description: 'Three cards of the same rank',
    baseScore: 150,
    cards: ['🂧', '🃇', '🃗', '🂮', '🂢'],
    example: '7♠ 7♥ 7♦ K♠ 2♠'
  },
  {
    name: 'Two Pair',
    description: 'Two different pairs',
    baseScore: 100,
    cards: ['🂫', '🃋', '🂨', '🃈', '🂡'],
    example: 'J♠ J♥ 8♠ 8♥ A♠'
  },
  {
    name: 'One Pair',
    description: 'Two cards of the same rank',
    baseScore: 50,
    cards: ['🂪', '🃊', '🂮', '🂧', '🂢'],
    example: '10♠ 10♥ K♠ 7♠ 2♠'
  },
  {
    name: 'High Card',
    description: 'No matching cards',
    baseScore: 10,
    cards: ['🂡', '🃊', '🂨', '🂥', '🂢'],
    example: 'A♠ 10♥ 8♠ 5♠ 2♠'
  }
];

const SUIT_INFO = [
  {
    suit: 'Spades',
    symbol: '♠',
    color: 'text-gray-300',
    stat: 'Combat',
    description: 'Each card of this suit adds Combat skill bonuses',
    skills: ['Gunslinging', 'Brawling', 'Knife Fighting']
  },
  {
    suit: 'Hearts',
    symbol: '♥',
    color: 'text-red-500',
    stat: 'Spirit',
    description: 'Each card of this suit adds Spirit skill bonuses',
    skills: ['Horse Riding', 'Survival', 'Leadership']
  },
  {
    suit: 'Diamonds',
    symbol: '♦',
    color: 'text-blue-400',
    stat: 'Cunning',
    description: 'Each card of this suit adds Cunning skill bonuses',
    skills: ['Lockpicking', 'Pickpocketing', 'Deception']
  },
  {
    suit: 'Clubs',
    symbol: '♣',
    color: 'text-green-500',
    stat: 'Craft',
    description: 'Each card of this suit adds Craft skill bonuses',
    skills: ['Blacksmithing', 'Medicine', 'Prospecting']
  }
];

export const DeckGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'hands' | 'suits' | 'strategy'>('overview');
  const { currentCharacter } = useCharacterStore();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-western text-gold-light mb-2">The Destiny Deck</h1>
        <p className="text-desert-stone text-lg">
          Master the cards to master your fate
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'hands', label: 'Hand Rankings' },
          { id: 'suits', label: 'Suit Bonuses' },
          { id: 'strategy', label: 'Strategy' }
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as any)}
            className={`px-4 py-2 rounded-lg font-serif whitespace-nowrap transition-colors ${
              activeSection === section.id
                ? 'bg-gold-light text-wood-dark'
                : 'bg-wood-dark border border-wood-grain text-desert-sand hover:border-gold-light/50'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <Card variant="parchment" className="p-6">
            <h2 className="text-2xl font-western text-wood-dark mb-4">What is the Destiny Deck?</h2>
            <p className="text-wood-grain mb-4">
              The Destiny Deck is the core mechanic that determines the outcome of your actions
              in Desperados Destiny. Every time you attempt an action—whether it's committing a
              crime, training a skill, or engaging in combat—the deck deals you a hand of five
              cards.
            </p>
            <p className="text-wood-grain">
              Your hand is evaluated as a poker hand, and the resulting score determines your
              success. Better hands mean better outcomes, more rewards, and greater glory!
            </p>
          </Card>

          <Card variant="leather" className="p-6">
            <h3 className="text-xl font-western text-gold-light mb-4">How It Works</h3>
            <ol className="space-y-3 text-desert-sand">
              <li className="flex gap-3">
                <span className="text-gold-light font-bold">1.</span>
                <span>Choose an action to perform (crime, skill training, etc.)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold-light font-bold">2.</span>
                <span>The Destiny Deck deals you 5 random cards</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold-light font-bold">3.</span>
                <span>Your hand is evaluated for poker ranking</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold-light font-bold">4.</span>
                <span>Skill bonuses are added based on card suits</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold-light font-bold">5.</span>
                <span>Final score determines success and rewards</span>
              </li>
            </ol>
          </Card>

          <Card variant="wood" className="p-6">
            <h3 className="text-xl font-western text-gold-light mb-4">Success Thresholds</h3>
            <p className="text-desert-sand mb-4">
              Different actions require different scores to succeed. Harder actions need higher scores!
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-500">50+</div>
                <div className="text-xs text-desert-stone">Easy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">100+</div>
                <div className="text-xs text-desert-stone">Medium</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">200+</div>
                <div className="text-xs text-desert-stone">Hard</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">350+</div>
                <div className="text-xs text-desert-stone">Extreme</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Hand Rankings Section */}
      {activeSection === 'hands' && (
        <div className="space-y-4">
          <Card variant="parchment" className="p-4 mb-4">
            <p className="text-wood-grain text-center">
              Poker hands from highest to lowest. Better hands = Higher scores!
            </p>
          </Card>

          {HAND_RANKINGS.map((hand, index) => (
            <Card
              key={hand.name}
              variant="wood"
              className="p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gold-light font-bold">#{index + 1}</span>
                    <h3 className="font-western text-lg text-desert-sand">{hand.name}</h3>
                  </div>
                  <p className="text-sm text-desert-stone mb-2">{hand.description}</p>
                  <p className="text-xs text-desert-stone">Example: {hand.example}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-gold-light">{hand.baseScore}</div>
                  <div className="text-xs text-desert-stone">Base Score</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Suit Bonuses Section */}
      {activeSection === 'suits' && (
        <div className="space-y-6">
          <Card variant="parchment" className="p-4 mb-4">
            <p className="text-wood-grain text-center">
              Each suit is linked to a stat. Training skills in that stat adds bonus points
              for each card of that suit in your hand!
            </p>
          </Card>

          {SUIT_INFO.map((suit) => (
            <Card key={suit.suit} variant="leather" className="p-6">
              <div className="flex items-start gap-4">
                <div className={`text-5xl ${suit.color}`}>{suit.symbol}</div>
                <div className="flex-1">
                  <h3 className="font-western text-xl text-gold-light mb-2">
                    {suit.suit} → {suit.stat}
                  </h3>
                  <p className="text-desert-sand mb-3">{suit.description}</p>
                  <div>
                    <p className="text-sm text-desert-stone mb-1">Related Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {suit.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs bg-wood-dark px-2 py-1 rounded text-desert-sand"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Current Bonuses */}
          {currentCharacter && (
            <Card variant="wood" className="p-6">
              <h3 className="font-western text-xl text-gold-light mb-4">Your Current Bonuses</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl mb-1">♠</div>
                  <div className="text-xl font-bold text-gold-light">+{currentCharacter.stats?.combat || 0}</div>
                  <div className="text-xs text-desert-stone">per Spade</div>
                </div>
                <div>
                  <div className="text-3xl mb-1 text-red-500">♥</div>
                  <div className="text-xl font-bold text-gold-light">+{currentCharacter.stats?.spirit || 0}</div>
                  <div className="text-xs text-desert-stone">per Heart</div>
                </div>
                <div>
                  <div className="text-3xl mb-1 text-blue-400">♦</div>
                  <div className="text-xl font-bold text-gold-light">+{currentCharacter.stats?.cunning || 0}</div>
                  <div className="text-xs text-desert-stone">per Diamond</div>
                </div>
                <div>
                  <div className="text-3xl mb-1 text-green-500">♣</div>
                  <div className="text-xl font-bold text-gold-light">+{currentCharacter.stats?.craft || 0}</div>
                  <div className="text-xs text-desert-stone">per Club</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Strategy Section */}
      {activeSection === 'strategy' && (
        <div className="space-y-6">
          <Card variant="parchment" className="p-6">
            <h2 className="text-2xl font-western text-wood-dark mb-4">Tips for Success</h2>
            <p className="text-wood-grain">
              While the cards are random, you can improve your odds by training the right skills!
            </p>
          </Card>

          <Card variant="leather" className="p-6">
            <h3 className="text-xl font-western text-gold-light mb-4">
              1. Train Skills Strategically
            </h3>
            <p className="text-desert-sand mb-3">
              Focus on skills that match the actions you perform most. If you do lots of crimes,
              train Cunning skills (Diamonds). For combat, train Combat skills (Spades).
            </p>
            <p className="text-desert-stone text-sm">
              Example: With +10 in Cunning skills, every Diamond card adds +10 to your score!
            </p>
          </Card>

          <Card variant="leather" className="p-6">
            <h3 className="text-xl font-western text-gold-light mb-4">
              2. Understand the Odds
            </h3>
            <p className="text-desert-sand mb-3">
              Most hands will be High Card or One Pair. Two Pair and better are less common.
              Skill bonuses help compensate for weaker hands.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-desert-stone">High Card:</span>
                <span className="text-gold-light ml-2">50%</span>
              </div>
              <div>
                <span className="text-desert-stone">One Pair:</span>
                <span className="text-gold-light ml-2">42%</span>
              </div>
              <div>
                <span className="text-desert-stone">Two Pair:</span>
                <span className="text-gold-light ml-2">4.7%</span>
              </div>
              <div>
                <span className="text-desert-stone">Better:</span>
                <span className="text-gold-light ml-2">3.3%</span>
              </div>
            </div>
          </Card>

          <Card variant="leather" className="p-6">
            <h3 className="text-xl font-western text-gold-light mb-4">
              3. Balance Your Stats
            </h3>
            <p className="text-desert-sand">
              While specializing is good, having some points in all stats ensures you get
              bonuses no matter what suits appear in your hand. A balanced approach provides
              more consistent results.
            </p>
          </Card>

          <Card variant="wood" className="p-6">
            <h3 className="text-xl font-western text-gold-light mb-4">
              4. Start Small
            </h3>
            <p className="text-desert-sand">
              Attempt easier actions while you build up your skills. As your bonuses grow,
              you'll be able to tackle harder challenges with better success rates!
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DeckGuide;
