/**
 * Help/FAQ Page
 * Game guide and frequently asked questions
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui';

type HelpSection = 'getting-started' | 'combat' | 'crimes' | 'gangs' | 'economy' | 'destiny-deck' | 'faq';

interface FAQItem {
  question: string;
  answer: string;
}

export const Help: React.FC = () => {
  const [activeSection, setActiveSection] = useState<HelpSection>('getting-started');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const sections: { id: HelpSection; label: string; icon: string }[] = [
    { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
    { id: 'combat', label: 'Combat', icon: '⚔️' },
    { id: 'crimes', label: 'Crimes', icon: '🎭' },
    { id: 'gangs', label: 'Gangs', icon: '🏴' },
    { id: 'economy', label: 'Economy', icon: '💰' },
    { id: 'destiny-deck', label: 'Destiny Deck', icon: '🃏' },
    { id: 'faq', label: 'FAQ', icon: '❓' },
  ];

  const faqItems: FAQItem[] = [
    {
      question: 'How do I earn gold?',
      answer: 'You can earn gold through crimes, completing actions, winning combat, selling items at the shop, and receiving rewards from your gang. Higher-level crimes and more dangerous activities yield better rewards.'
    },
    {
      question: 'What happens when I die in combat?',
      answer: 'When you lose a combat encounter, you lose some gold and may gain a bounty. You\'ll need to wait for your health to regenerate before engaging in more combat. Severe losses may result in jail time.'
    },
    {
      question: 'How do I join a gang?',
      answer: 'You can either request to join an existing gang from the Gang page, or create your own if you have enough gold. Gang leaders can invite you directly, or you can apply through the gang\'s public recruitment.'
    },
    {
      question: 'What is the Destiny Deck?',
      answer: 'The Destiny Deck is a unique card-based system that determines outcomes of certain actions. Better hands grant bonuses to your activities. You can draw cards during actions and crimes to boost your results.'
    },
    {
      question: 'How does energy work?',
      answer: 'Energy is required for most activities like crimes and actions. It regenerates over time (1 point every 5 minutes). You can also use items or wait in the saloon to restore energy faster.'
    },
    {
      question: 'What are factions?',
      answer: 'There are three factions: Settler Alliance (law-abiding citizens), Frontera Collective (neutral traders), and Nahi Coalition (outlaws). Your faction affects your reputation, available quests, and relationships with NPCs.'
    },
    {
      question: 'How do territories work?',
      answer: 'Territories are regions that gangs can control. Controlling territories provides passive income and bonuses. Gangs can wage wars to capture territories from rivals.'
    },
    {
      question: 'How do I increase my skills?',
      answer: 'Skills increase automatically as you perform related activities. Using your gun improves Shooting, picking locks improves Thievery, etc. You can also train skills at specific locations for a gold cost.'
    },
    {
      question: 'What is the bounty system?',
      answer: 'Bounties are placed on players who commit crimes. Higher bounties attract bounty hunters and other players. You can pay off bounties at the sheriff\'s office or lay low until they decrease over time.'
    },
    {
      question: 'Can I have multiple characters?',
      answer: 'Yes! Each account can create multiple characters. Each character has independent progress, gold, and gang membership. You can switch between characters from the character selection screen.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="leather">
        <div className="p-6">
          <h1 className="text-3xl font-western text-gold-light">
            Help & Guide
          </h1>
          <p className="text-desert-sand font-serif mt-2">
            Everything you need to know about surviving in Sangre Territory
          </p>
        </div>
      </Card>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-48 flex-shrink-0 space-y-1">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-gold-light/20 text-gold-light'
                  : 'text-desert-sand hover:bg-wood-dark/50'
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Getting Started */}
          {activeSection === 'getting-started' && (
            <Card variant="parchment" className="p-6">
              <h2 className="text-2xl font-western text-wood-dark mb-4">
                Getting Started
              </h2>

              <div className="space-y-6 text-wood-grain">
                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">Welcome to Sangre Territory</h3>
                  <p>
                    Desperados Destiny is a text-based western RPG where you'll carve out your destiny
                    in the lawless frontier. Start as a nobody and rise to become a legendary outlaw
                    or respected lawman.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">Your First Steps</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Create your character and choose a faction</li>
                    <li>Complete the tutorial missions to learn the basics</li>
                    <li>Start with small crimes to earn gold</li>
                    <li>Upgrade your skills and equipment</li>
                    <li>Join or create a gang for bigger opportunities</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">Core Mechanics</h3>
                  <ul className="space-y-2">
                    <li><strong>Energy:</strong> Required for most activities, regenerates over time</li>
                    <li><strong>Health:</strong> Depleted in combat, regenerates slowly</li>
                    <li><strong>Gold:</strong> Currency for everything - earn it, spend it wisely</li>
                    <li><strong>Experience:</strong> Gained from all activities, increases your level</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Combat */}
          {activeSection === 'combat' && (
            <Card variant="parchment" className="p-6">
              <h2 className="text-2xl font-western text-wood-dark mb-4">
                Combat System
              </h2>

              <div className="space-y-6 text-wood-grain">
                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">PvP Combat</h3>
                  <p>
                    Challenge other players to duels for gold and reputation. The combat system
                    uses your stats, equipment, and a bit of luck from the Destiny Deck.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">Combat Stats</h3>
                  <ul className="space-y-2">
                    <li><strong>Attack:</strong> Determines your damage output</li>
                    <li><strong>Defense:</strong> Reduces incoming damage</li>
                    <li><strong>Speed:</strong> Affects who strikes first</li>
                    <li><strong>Accuracy:</strong> Chance to land critical hits</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">NPC Encounters</h3>
                  <p>
                    You'll encounter bandits, lawmen, and other NPCs during your travels.
                    Some can be avoided, others must be fought. Choose your battles wisely.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">Gang Wars</h3>
                  <p>
                    Gangs can declare war on each other for territory control. During wars,
                    all gang members can attack rivals. The gang with the most points wins.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Crimes */}
          {activeSection === 'crimes' && (
            <Card variant="parchment" className="p-6">
              <h2 className="text-2xl font-western text-wood-dark mb-4">
                Crimes
              </h2>

              <div className="space-y-6 text-wood-grain">
                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">Types of Crimes</h3>
                  <ul className="space-y-2">
                    <li><strong>Petty Theft:</strong> Low risk, low reward - good for beginners</li>
                    <li><strong>Robbery:</strong> Medium risk, better payouts</li>
                    <li><strong>Grand Heist:</strong> High risk, major rewards - requires skills</li>
                    <li><strong>Gang Crimes:</strong> Coordinated crimes with your gang</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">Success Factors</h3>
                  <p>
                    Crime success depends on your skills (Thievery, Stealth, etc.), equipment,
                    and the Destiny Deck draw. Higher difficulty crimes require better preparation.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">Consequences</h3>
                  <p>
                    Failed crimes can result in jail time, bounty increase, or lost health.
                    The more serious the crime, the harsher the consequences. Plan carefully!
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Gangs */}
          {activeSection === 'gangs' && (
            <Card variant="parchment" className="p-6">
              <h2 className="text-2xl font-western text-wood-dark mb-4">
                Gangs
              </h2>

              <div className="space-y-6 text-wood-grain">
                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">Gang Benefits</h3>
                  <ul className="space-y-2">
                    <li>Access to gang bank for shared resources</li>
                    <li>Participate in territory control</li>
                    <li>Coordinate gang crimes for bigger payouts</li>
                    <li>Protection from rival gang attacks</li>
                    <li>Gang upgrades that benefit all members</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">Gang Ranks</h3>
                  <ul className="space-y-2">
                    <li><strong>Leader:</strong> Full control, can manage all aspects</li>
                    <li><strong>Lieutenant:</strong> Can invite/kick members, start wars</li>
                    <li><strong>Veteran:</strong> Can access bank, participate in decisions</li>
                    <li><strong>Member:</strong> Basic membership with gang bonuses</li>
                    <li><strong>Recruit:</strong> Probationary status</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">Creating a Gang</h3>
                  <p>
                    Creating a gang costs 10,000 gold. You'll need to choose a name, tag, and
                    set initial rules. Building a successful gang takes time and loyal members.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Economy */}
          {activeSection === 'economy' && (
            <Card variant="parchment" className="p-6">
              <h2 className="text-2xl font-western text-wood-dark mb-4">
                Economy
              </h2>

              <div className="space-y-6 text-wood-grain">
                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">Earning Gold</h3>
                  <ul className="space-y-2">
                    <li><strong>Crimes:</strong> Primary source of income</li>
                    <li><strong>Combat:</strong> Loot from defeated opponents</li>
                    <li><strong>Actions:</strong> Jobs and missions pay gold</li>
                    <li><strong>Trading:</strong> Buy low, sell high at shops</li>
                    <li><strong>Territories:</strong> Passive income from controlled zones</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">Spending Gold</h3>
                  <ul className="space-y-2">
                    <li><strong>Equipment:</strong> Better gear for combat and crimes</li>
                    <li><strong>Training:</strong> Improve skills faster</li>
                    <li><strong>Healing:</strong> Restore health quickly</li>
                    <li><strong>Bounties:</strong> Pay off your wanted status</li>
                    <li><strong>Gang:</strong> Contribute to gang bank and upgrades</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">Bonus Rewards</h3>
                  <p>
                    Watch short ads to earn bonus rewards like extra gold, XP boosts, and instant
                    energy refills. These bonuses stack with your normal earnings, helping you
                    progress faster. All gameplay content is achievable without watching any ads.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Destiny Deck */}
          {activeSection === 'destiny-deck' && (
            <Card variant="parchment" className="p-6">
              <h2 className="text-2xl font-western text-wood-dark mb-4">
                Destiny Deck
              </h2>

              <div className="space-y-6 text-wood-grain">
                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">How It Works</h3>
                  <p>
                    The Destiny Deck is a 52-card poker deck that determines luck-based outcomes.
                    During actions, you draw cards and form poker hands. Better hands mean better results.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">Hand Rankings</h3>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Royal Flush - Ultimate success, massive bonus</li>
                    <li>Straight Flush - Exceptional outcome</li>
                    <li>Four of a Kind - Excellent result</li>
                    <li>Full House - Great result</li>
                    <li>Flush - Good result</li>
                    <li>Straight - Above average</li>
                    <li>Three of a Kind - Decent outcome</li>
                    <li>Two Pair - Slight bonus</li>
                    <li>One Pair - Standard result</li>
                    <li>High Card - Minimum outcome</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-wood-dark mb-2">Using the Deck</h3>
                  <p>
                    Cards are drawn automatically during crimes and some actions. You can view
                    your hand and see how it affected the outcome. Some items can improve your
                    draws or let you redraw cards.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* FAQ */}
          {activeSection === 'faq' && (
            <Card variant="parchment" className="p-6">
              <h2 className="text-2xl font-western text-wood-dark mb-4">
                Frequently Asked Questions
              </h2>

              <div className="space-y-3">
                {faqItems.map((item, index) => (
                  <div
                    key={index}
                    className="border border-wood-grain/20 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full text-left p-4 bg-wood-grain/5 hover:bg-wood-grain/10 transition-colors flex justify-between items-center"
                    >
                      <span className="font-bold text-wood-dark">{item.question}</span>
                      <span className="text-wood-grain">
                        {expandedFAQ === index ? '−' : '+'}
                      </span>
                    </button>
                    {expandedFAQ === index && (
                      <div className="p-4 text-wood-grain bg-white/50">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </main>
      </div>

      {/* Contact Support */}
      <Card variant="leather">
        <div className="p-6 text-center">
          <h3 className="text-lg font-western text-gold-light mb-2">
            Still Need Help?
          </h3>
          <p className="text-desert-sand text-sm mb-4">
            Contact our support team or join the community
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="mailto:support@desperadosdestiny.com"
              className="px-4 py-2 bg-gold-light/20 text-gold-light rounded hover:bg-gold-light/30 transition-colors"
            >
              Email Support
            </a>
            <a
              href="#"
              className="px-4 py-2 bg-wood-dark/50 text-desert-sand rounded hover:bg-wood-dark/70 transition-colors"
            >
              Community Discord
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Help;
