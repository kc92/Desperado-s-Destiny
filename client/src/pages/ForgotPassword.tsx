/**
 * Forgot Password Page
 * Request password reset email
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useFormValidation } from '@/hooks/useFormValidation';
import { Button, Card, Input } from '@/components/ui';
import { logger } from '@/services/logger.service';

interface ForgotPasswordFormValues {
  email: string;
}

/**
 * Forgot password page - request password reset
 */
export const ForgotPassword: React.FC = () => {
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  const [submitted, setSubmitted] = useState(false);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation<ForgotPasswordFormValues>(
    {
      email: '',
    },
    {
      email: (value) => {
        if (!value || !value.trim()) {
          return 'Email is required';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address';
        }
        return null;
      },
    }
  );

  const onSubmit = async (formValues: ForgotPasswordFormValues) => {
    try {
      await forgotPassword(formValues.email);
      setSubmitted(true);
    } catch (err) {
      logger.error('Forgot password failed', err as Error, { context: 'ForgotPassword.onSubmit', email: formValues.email });
    }
  };

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
            Reset your password
          </p>
        </div>

        <Card variant="wood">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="text-5xl text-gold-medium mb-4">✉</div>
              <h2 className="text-2xl font-western text-desert-sand mb-2">
                Check Your Email
              </h2>
              <p className="text-desert-stone font-serif mb-6">
                If an account exists with that email address, we've sent password reset instructions. Check your inbox and follow the link to reset your password.
              </p>
              <p className="text-desert-stone font-serif text-sm mb-6">
                Didn't receive an email? Check your spam folder or try again.
              </p>
              <div className="space-y-3">
                <Link to="/login">
                  <Button variant="secondary" size="md" fullWidth>
                    Back to Login
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => setSubmitted(false)}
                >
                  Try Different Email
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-western text-desert-sand text-center mb-4">
                Forgot Password
              </h2>
              <p className="text-desert-stone font-serif text-center mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email */}
                <Input
                  type="email"
                  name="email"
                  label="Email"
                  placeholder="your@email.com"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  error={touched.email ? errors.email : undefined}
                  required
                  autoComplete="email"
                  autoFocus
                />

                {/* Server Error */}
                {error && (
                  <div
                    className="bg-blood-red/20 border-2 border-blood-red rounded-lg p-4"
                    role="alert"
                  >
                    <p className="text-desert-sand font-semibold">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                >
                  Send Reset Link
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-gold-light hover:text-gold-medium transition-colors text-sm font-serif"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
