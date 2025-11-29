/**
 * Landing Page
 * Beautiful western-themed landing page with game introduction
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';

/**
 * Impressive western-themed landing page
 */
export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl w-full text-center space-y-8 animate-fade-in">
          {/* Title */}
          <div className="space-y-4">
            <div className="text-6xl text-gold-medium animate-pulse-gold mb-4">
              ★ ★ ★
            </div>

            <h1 className="text-6xl md:text-8xl font-western text-wood-dark text-shadow-gold leading-tight">
              Desperados Destiny
            </h1>

            <div className="flex items-center justify-center gap-3 text-wood-medium">
              <div className="h-px w-16 bg-wood-medium"></div>
              <p className="text-xl md:text-2xl font-handwritten">
                Sangre Territory • 1875
              </p>
              <div className="h-px w-16 bg-wood-medium"></div>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl font-serif text-wood-dark max-w-2xl mx-auto leading-relaxed">
            Where every action is a hand of poker, every decision shapes your legend,
            and every gunfight could be your last.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link to="/register">
              <Button variant="primary" size="lg" className="min-w-[200px]">
                Enter the Territory
              </Button>
            </Link>

            <Link to="/login">
              <Button variant="secondary" size="lg" className="min-w-[200px]">
                Returning Player
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-wood-dark/10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-western text-center text-wood-dark mb-12">
            Your Destiny Awaits
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Destiny Deck */}
            <Card variant="wood" hover className="text-center">
              <div className="text-4xl text-gold-light mb-4">🃏</div>
              <h3 className="text-2xl font-western text-desert-sand mb-3">
                Destiny Deck
              </h3>
              <p className="text-desert-stone font-serif">
                Every action resolved through poker hands. Your fate lies in the cards you draw
                and the skills you've mastered.
              </p>
            </Card>

            {/* Feature 2: Three Factions */}
            <Card variant="leather" hover className="text-center">
              <div className="text-4xl text-gold-light mb-4">⚔️</div>
              <h3 className="text-2xl font-western text-desert-sand mb-3">
                Three Factions
              </h3>
              <p className="text-desert-stone font-serif">
                Choose your path: American Settlers, Nahi Warriors, or Frontera Outlaws.
                Each with unique abilities and destinies.
              </p>
            </Card>

            {/* Feature 3: Persistent World */}
            <Card variant="parchment" hover className="text-center">
              <div className="text-4xl text-gold-dark mb-4">🌵</div>
              <h3 className="text-2xl font-western text-wood-dark mb-3">
                Living Territory
              </h3>
              <p className="text-wood-grain font-serif">
                A persistent world where your actions matter. Form gangs, control territory,
                and build your legend that lasts.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Game Mechanics Preview */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-western text-wood-dark">
                The Code of the Territory
              </h2>

              <div className="space-y-4 font-serif text-wood-dark">
                <div className="flex gap-3">
                  <span className="text-gold-medium font-bold">★</span>
                  <p>
                    <strong>Draw Your Destiny:</strong> Five cards determine success or failure
                    in every challenge from gunfights to persuasion.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-gold-medium font-bold">★</span>
                  <p>
                    <strong>Energy System:</strong> Manage your stamina wisely. Every action
                    costs energy, and the Territory shows no mercy to the reckless.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-gold-medium font-bold">★</span>
                  <p>
                    <strong>Build Your Legend:</strong> Train skills, form alliances, commit
                    crimes, and rise through the ranks of the Territory.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-gold-medium font-bold">★</span>
                  <p>
                    <strong>Real-Time PvP:</strong> Challenge other desperados to duels where
                    skill and luck collide in deadly poker showdowns.
                  </p>
                </div>
              </div>

              <Link to="/register">
                <Button variant="primary" size="lg">
                  Claim Your Destiny
                </Button>
              </Link>
            </div>

            {/* Card Visual */}
            <div className="flex justify-center">
              <Card variant="wood" className="transform rotate-3 hover:rotate-0 transition-transform">
                <div className="space-y-4 text-center">
                  <h3 className="text-3xl font-western text-gold-light">
                    Your First Draw
                  </h3>

                  <div className="flex justify-center gap-2 flex-wrap">
                    {['A♠', 'K♥', 'Q♦', 'J♣', '10♠'].map((card, i) => (
                      <div
                        key={i}
                        className="playing-card w-16 h-24 flex flex-col items-center justify-center text-lg font-bold"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        {card}
                      </div>
                    ))}
                  </div>

                  <p className="text-gold-light font-western text-xl">
                    Royal Flush
                  </p>

                  <p className="text-desert-stone font-serif text-sm">
                    Will fortune favor you in the Sangre Territory?
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-wood-dark py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-western text-gold-light">
            The Territory Calls
          </h2>

          <p className="text-xl text-desert-sand font-serif">
            Will you answer? Your destiny awaits in the dust and blood of 1875.
          </p>

          <div className="pt-4">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="min-w-[250px]">
                Begin Your Journey
              </Button>
            </Link>
          </div>

          <div className="text-gold-medium text-3xl pt-4">
            ★ ★ ★
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
