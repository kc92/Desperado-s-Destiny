/**
 * Not Found Page
 * 404 error page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';

/**
 * 404 Not Found page with western theme
 */
export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full animate-fade-in">
        <Card variant="parchment" className="text-center">
          <div className="space-y-6">
            {/* Wanted Poster Style */}
            <div className="border-4 border-wood-dark p-8 bg-desert-sand">
              <div className="text-6xl font-western text-wood-dark mb-4">
                404
              </div>

              <h1 className="text-4xl font-western text-wood-dark mb-4">
                Location Not Found
              </h1>

              <div className="border-t-2 border-b-2 border-wood-dark py-4 my-6">
                <p className="text-xl font-handwritten text-wood-medium">
                  This here trail has gone cold, partner.
                </p>
              </div>

              <p className="text-wood-dark font-serif mb-6">
                Looks like you wandered into uncharted territory. The page you're looking for
                doesn't exist in the Sangre Territory.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button variant="primary" size="lg">
                    Return to Town
                  </Button>
                </Link>

                <Link to="/game">
                  <Button variant="secondary" size="lg">
                    Enter the Territory
                  </Button>
                </Link>
              </div>
            </div>

            <div className="text-gold-dark text-2xl">
              ★ ★ ★
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
