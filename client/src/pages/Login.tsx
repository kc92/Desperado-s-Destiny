/**
 * Login Page
 * User authentication page
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useFormValidation } from '@/hooks/useFormValidation';
import { Button, Card, Input } from '@/components/ui';

interface LoginFormValues {
  email: string;
  password: string;
}

/**
 * Login page with form validation
 */
export const Login: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuthStore();

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
  } = useFormValidation<LoginFormValues>(
    {
      email: '',
      password: '',
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
      password: (value) => {
        if (!value) {
          return 'Password is required';
        }
        return null;
      },
    }
  );

  const onSubmit = async (formValues: LoginFormValues) => {
    try {
      await login(formValues);
      // Navigate to character select on successful login
      // Using replace() prevents back-button from returning to login
      // while also ensuring Zustand state is properly rehydrated
      window.location.replace('/characters');
    } catch (err) {
      // Error is handled by the store and displayed in the UI
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
            Welcome back, desperado
          </p>
        </div>

        <Card variant="wood">
          <h2 className="text-2xl font-western text-desert-sand text-center mb-6">
            Login
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                autoFocus
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
            <div className="relative">
              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="Enter your password"
                value={values.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                error={touched.password ? errors.password : undefined}
                required
                autoComplete="current-password"
              />
              {/* Password validation indicator */}
              {touched.password && values.password && (
                <div className="absolute right-3 top-9">
                  {!errors.password ? (
                    <span className="text-green-500 text-xl" aria-label="Valid password">✓</span>
                  ) : (
                    <span className="text-red-500 text-xl" aria-label="Invalid password">✗</span>
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
            >
              Enter the Territory
            </Button>

            {/* Forgot Password */}
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-gold-light hover:text-gold-medium transition-colors text-sm font-serif"
              >
                Forgot your password?
              </Link>
            </div>
          </form>

          {/* Register Link */}
          <div className="mt-6 pt-6 border-t-2 border-wood-dark text-center">
            <p className="text-desert-stone font-serif mb-2">
              New to the Territory?
            </p>
            <Link to="/register">
              <Button variant="ghost" size="md">
                Create an Account
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
