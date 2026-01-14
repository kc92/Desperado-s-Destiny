/**
 * Register Page
 * New user registration page
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useFormValidation } from '@/hooks/useFormValidation';
import { Button, Card, Input } from '@/components/ui';
import { calculatePasswordStrength } from '@/utils/passwordStrength';
import { api } from '@/services/api';
import { logger } from '@/services/logger.service';

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Registration page with form validation
 */
export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Check username availability with debouncing
  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await api.get(`/auth/check-username?username=${encodeURIComponent(username)}`);
      setUsernameAvailable(response.data.available);
    } catch (err) {
      logger.error('Failed to check username availability', err as Error, { username });
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  }, []);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation<RegisterFormValues>(
    {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    {
      username: (value) => {
        if (!value || !value.trim()) {
          return 'Username is required';
        }
        const trimmed = value.trim();
        if (trimmed.length < 3) {
          return 'Username must be at least 3 characters';
        }
        if (trimmed.length > 30) {
          return 'Username must be 30 characters or less';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
          return 'Username can only contain letters, numbers, and underscores';
        }
        return null;
      },
      email: (value) => {
        if (!value || !value.trim()) {
          return 'Email is required';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address';
        }
        return null;
      },
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

  // Debounced username check - must be after useFormValidation hook
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (values.username && values.username.length >= 3 && !errors.username) {
        checkUsernameAvailability(values.username.trim());
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [values.username, errors.username, checkUsernameAvailability]);

  // Calculate password strength
  const passwordStrength = calculatePasswordStrength(values.password);

  const onSubmit = async (formValues: RegisterFormValues) => {
    try {
      const result = await register(formValues);

      // Check if email verification is required (production mode)
      if (result?.requiresVerification) {
        // Redirect to verify email page with email in state
        navigate('/verify-email', { state: { email: result.email, fromRegistration: true } });
        return;
      }

      // Auto-verified (development mode) - redirect to character select
      navigate('/characters');
    } catch (err) {
      // Error is handled by the store
      logger.error('Registration failed', err as Error, { username: formValues.username });
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
            Begin your legend in the Territory
          </p>
        </div>

        <Card variant="wood">
          <h2 className="text-2xl font-western text-desert-sand text-center mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <div className="relative">
                <Input
                  type="text"
                  name="username"
                  label="Username"
                  placeholder="Choose a username"
                  value={values.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  onBlur={() => handleBlur('username')}
                  error={touched.username ? errors.username : undefined}
                  required
                  autoComplete="username"
                  autoFocus
                  helperText="3-20 characters, letters, numbers, and underscores only"
                />
                {/* Username availability indicator */}
                {values.username && values.username.length >= 3 && !errors.username && (
                  <div className="absolute right-3 top-9">
                    {checkingUsername ? (
                      <span className="text-desert-stone text-sm">Checking...</span>
                    ) : usernameAvailable === true ? (
                      <span className="text-green-500 text-xl" aria-label="Username available">✓</span>
                    ) : usernameAvailable === false ? (
                      <span className="text-red-500 text-xl" aria-label="Username taken">✗</span>
                    ) : null}
                  </div>
                )}
                {usernameAvailable === false && values.username.length >= 3 && (
                  <p className="text-sm text-red-500 mt-1">This username is already taken</p>
                )}
                {usernameAvailable === true && (
                  <p className="text-sm text-green-500 mt-1">Username is available!</p>
                )}
              </div>

              {/* Email */}
              <div className="relative">
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
                />
                {/* Email validation indicator */}
                {touched.email && values.email && (
                  <div className="absolute right-3 top-9">
                    {!errors.email ? (
                      <span className="text-green-500 text-xl" aria-label="Valid email">✓</span>
                    ) : (
                      <span className="text-red-500 text-xl" aria-label="Invalid email">✗</span>
                    )}
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <Input
                  type="password"
                  name="password"
                  label="Password"
                  placeholder="Create a password"
                  value={values.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  error={touched.password ? errors.password : undefined}
                  required
                  autoComplete="new-password"
                />

                {/* Password Strength Indicator */}
                {values.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-2">
                      <div className={`h-1 flex-1 rounded transition-colors ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-desert-stone'}`} />
                      <div className={`h-1 flex-1 rounded transition-colors ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-desert-stone'}`} />
                      <div className={`h-1 flex-1 rounded transition-colors ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-desert-stone'}`} />
                    </div>
                    <div className="flex justify-between items-start mb-3">
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

                    {/* Password Requirements Checklist */}
                    <div className="bg-wood-grain/10 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-semibold text-wood-dark mb-2">Password Requirements:</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={values.password.length >= 8 ? 'text-green-600' : 'text-desert-stone'}>
                            {values.password.length >= 8 ? '✓' : '○'}
                          </span>
                          <span className={values.password.length >= 8 ? 'text-green-600' : 'text-desert-stone'}>
                            At least 8 characters
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={/[A-Z]/.test(values.password) ? 'text-green-600' : 'text-desert-stone'}>
                            {/[A-Z]/.test(values.password) ? '✓' : '○'}
                          </span>
                          <span className={/[A-Z]/.test(values.password) ? 'text-green-600' : 'text-desert-stone'}>
                            One uppercase letter
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={/[a-z]/.test(values.password) ? 'text-green-600' : 'text-desert-stone'}>
                            {/[a-z]/.test(values.password) ? '✓' : '○'}
                          </span>
                          <span className={/[a-z]/.test(values.password) ? 'text-green-600' : 'text-desert-stone'}>
                            One lowercase letter
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={/[0-9]/.test(values.password) ? 'text-green-600' : 'text-desert-stone'}>
                            {/[0-9]/.test(values.password) ? '✓' : '○'}
                          </span>
                          <span className={/[0-9]/.test(values.password) ? 'text-green-600' : 'text-desert-stone'}>
                            One number
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(values.password) ? 'text-green-600' : 'text-desert-stone'}>
                            {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(values.password) ? '✓' : '○'}
                          </span>
                          <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(values.password) ? 'text-green-600' : 'text-desert-stone'}>
                            One special character (optional for stronger password)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Input
                  type="password"
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={values.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  error={touched.confirmPassword ? errors.confirmPassword : undefined}
                  required
                  autoComplete="new-password"
                />
                {/* Password match indicator */}
                {touched.confirmPassword && values.confirmPassword && (
                  <div className="absolute right-3 top-9">
                    {!errors.confirmPassword ? (
                      <span className="text-green-500 text-xl" aria-label="Passwords match">✓</span>
                    ) : (
                      <span className="text-red-500 text-xl" aria-label="Passwords don't match">✗</span>
                    )}
                  </div>
                )}
              </div>

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
                disabled={usernameAvailable === false || checkingUsername}
              >
                {checkingUsername ? 'Checking username...' : 'Claim Your Destiny'}
              </Button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-wood-dark text-center">
            <p className="text-desert-stone font-serif mb-2">
              Already have an account?
            </p>
            <Link to="/login">
              <Button variant="ghost" size="md">
                Login
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
