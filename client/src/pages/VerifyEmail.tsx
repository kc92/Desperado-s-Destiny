/**
 * Verify Email Page
 * Handles email verification with token from URL
 * Also shows "check your email" message when coming from registration
 */

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button, Card, LoadingSpinner } from '@/components/ui';

interface LocationState {
  email?: string;
  fromRegistration?: boolean;
}

/**
 * Email verification page
 */
export const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const { verifyEmail, isLoading, error } = useAuthStore();
  const [verified, setVerified] = useState(false);

  // Get email from location state (passed from registration)
  const state = location.state as LocationState | null;
  const fromRegistration = state?.fromRegistration;
  const email = state?.email;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      verifyEmail(token)
        .then(() => {
          setVerified(true);
        })
        .catch(() => {
          // Error is handled by the store
        });
    }
  }, [location.search, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-western text-wood-dark text-shadow-gold mb-2">
              Desperados Destiny
            </h1>
          </Link>
          <p className="text-wood-medium font-serif">
            Email Verification
          </p>
        </div>

        <Card variant="wood">
          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner text="Verifying your email..." />
            </div>
          ) : verified ? (
            <div className="text-center space-y-4">
              <div className="text-5xl text-gold-medium mb-4">✓</div>
              <h2 className="text-2xl font-western text-desert-sand mb-2">
                Email Verified!
              </h2>
              <p className="text-desert-stone font-serif mb-6">
                Your email has been successfully verified. You can now login to your account and start your adventure in the Territory.
              </p>
              <Link to="/login">
                <Button variant="secondary" size="lg" fullWidth>
                  Login to Your Account
                </Button>
              </Link>
            </div>
          ) : error ? (
            <div className="text-center space-y-4">
              <div className="text-5xl text-blood-red mb-4">✗</div>
              <h2 className="text-2xl font-western text-desert-sand mb-2">
                Verification Failed
              </h2>
              <p className="text-desert-stone font-serif mb-4">
                {error}
              </p>
              <p className="text-desert-stone font-serif text-sm mb-6">
                The verification link may have expired or is invalid. Please try registering again or contact support if the problem persists.
              </p>
              <div className="space-y-3">
                <Link to="/register">
                  <Button variant="secondary" size="md" fullWidth>
                    Create New Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" size="md" fullWidth>
                    Try to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : fromRegistration ? (
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">&#x2709;</div>
              <h2 className="text-2xl font-western text-desert-sand mb-2">
                Check Your Email
              </h2>
              <p className="text-desert-stone font-serif mb-4">
                We've sent a verification link to:
              </p>
              {email && (
                <p className="text-gold-medium font-semibold text-lg mb-4">
                  {email}
                </p>
              )}
              <p className="text-desert-stone font-serif text-sm mb-6">
                Click the link in the email to verify your account and start your adventure in the Territory. The link will expire in 24 hours.
              </p>
              <div className="bg-wood-grain/10 rounded-lg p-4 mb-6">
                <p className="text-desert-stone font-serif text-sm">
                  Didn't receive the email? Check your spam folder or wait a few minutes.
                </p>
              </div>
              <Link to="/login">
                <Button variant="ghost" size="md" fullWidth>
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-5xl text-gold-medium mb-4">?</div>
              <h2 className="text-2xl font-western text-desert-sand mb-2">
                No Verification Token
              </h2>
              <p className="text-desert-stone font-serif mb-6">
                No verification token was found in the URL. Please check your email for the verification link.
              </p>
              <Link to="/login">
                <Button variant="ghost" size="md" fullWidth>
                  Go to Login
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
