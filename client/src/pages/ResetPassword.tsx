/**
 * Reset Password Page
 * Reset password with token from URL
 */

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useFormValidation } from '@/hooks/useFormValidation';
import { Button, Card, Input } from '@/components/ui';
import { calculatePasswordStrength } from '@/utils/passwordStrength';

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

/**
 * Reset password page
 */
export const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  const [token, setToken] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Extract token from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    setToken(tokenParam);
  }, [location]);

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
  } = useFormValidation<ResetPasswordFormValues>(
    {
      password: '',
      confirmPassword: '',
    },
    {
      password: (value) => {
        if (!value) {
          return 'Password is required';
        }
        if (value.length < 8) {
          return 'Password must be at least 8 characters';
        }
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
          return 'Password must contain uppercase, lowercase, and numbers';
        }
        return null;
      },
      confirmPassword: (value, allValues) => {
        if (!value) {
          return 'Please confirm your password';
        }
        if (value !== allValues.password) {
          return 'Passwords do not match';
        }
        return null;
      },
    }
  );

  // Calculate password strength
  const passwordStrength = calculatePasswordStrength(values.password);

  const onSubmit = async (formValues: ResetPasswordFormValues) => {
    if (!token) {
      return;
    }

    try {
      await resetPassword(token, formValues.password);
      setResetSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Error is handled by the store
      console.error('Password reset failed:', err);
    }
  };

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full animate-fade-in">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-4xl font-western text-wood-dark text-shadow-gold mb-2">
                Desperados Destiny
              </h1>
            </Link>
          </div>

          <Card variant="wood">
            <div className="text-center space-y-4">
              <div className="text-5xl text-gold-medium mb-4">?</div>
              <h2 className="text-2xl font-western text-desert-sand mb-2">
                Invalid Reset Link
              </h2>
              <p className="text-desert-stone font-serif mb-6">
                No reset token was found. Please check your email for the correct reset link or request a new one.
              </p>
              <Link to="/forgot-password">
                <Button variant="secondary" size="md" fullWidth>
                  Request New Reset Link
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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
            Create a new password
          </p>
        </div>

        <Card variant="wood">
          {resetSuccess ? (
            <div className="text-center space-y-4">
              <div className="text-5xl text-gold-medium mb-4">✓</div>
              <h2 className="text-2xl font-western text-desert-sand mb-2">
                Password Reset!
              </h2>
              <p className="text-desert-stone font-serif mb-6">
                Your password has been successfully reset. You can now login with your new password.
              </p>
              <p className="text-desert-stone font-serif text-sm">
                Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-western text-desert-sand text-center mb-4">
                Reset Password
              </h2>
              <p className="text-desert-stone font-serif text-center mb-6">
                Enter your new password below.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* New Password */}
                <div>
                  <Input
                    type="password"
                    name="password"
                    label="New Password"
                    placeholder="Create a new password"
                    value={values.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    error={touched.password ? errors.password : undefined}
                    required
                    autoComplete="new-password"
                    autoFocus
                  />

                  {/* Password Strength Indicator */}
                  {values.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-2">
                        <div className={`h-1 flex-1 rounded transition-colors ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-desert-stone'}`} />
                        <div className={`h-1 flex-1 rounded transition-colors ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-desert-stone'}`} />
                        <div className={`h-1 flex-1 rounded transition-colors ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-desert-stone'}`} />
                      </div>
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold text-desert-sand">
                          {passwordStrength.label}
                        </p>
                        {passwordStrength.feedback.length > 0 && (
                          <div className="text-xs text-desert-stone text-right">
                            {passwordStrength.feedback.map((fb, i) => (
                              <div key={i}>{fb}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <Input
                  type="password"
                  name="confirmPassword"
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  value={values.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  error={touched.confirmPassword ? errors.confirmPassword : undefined}
                  required
                  autoComplete="new-password"
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
                  Reset Password
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

export default ResetPassword;
