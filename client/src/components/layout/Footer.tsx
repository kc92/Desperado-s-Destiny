/**
 * Footer Component
 * Application footer with credits and links
 */

import React from 'react';

/**
 * Application footer with game info and credits
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-wood-dark border-t-4 border-wood-medium mt-auto" role="contentinfo" aria-label="Site footer">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-desert-sand">
          {/* About */}
          <div>
            <h3 className="font-western text-lg mb-3 text-gold-light">
              About the Game
            </h3>
            <p className="text-sm text-desert-stone font-serif leading-relaxed">
              Desperados Destiny is a browser-based MMORPG set in the mythic wild west of 1875.
              Build your legend through the Destiny Deck poker system.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer navigation">
            <h3 className="font-western text-lg mb-3 text-gold-light">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-desert-stone font-serif" role="list">
              <li>
                <a href="#" className="hover:text-gold-light transition-colors">
                  Game Rules
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold-light transition-colors">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold-light transition-colors">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold-light transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </nav>

          {/* Credits */}
          <div>
            <h3 className="font-western text-lg mb-3 text-gold-light">
              Credits
            </h3>
            <p className="text-sm text-desert-stone font-serif">
              Built by <span className="text-gold-light font-semibold">Kaine & Hawk</span>
            </p>
            <p className="text-xs text-desert-stone mt-4">
              &copy; {currentYear} Desperados Destiny. All rights reserved.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 pt-6 border-t-2 border-wood-medium text-center">
          <p className="text-xs text-desert-stone font-serif">
            Enter the Territory. Test Your Destiny. Claim Your Legend.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
