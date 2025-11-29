/**
 * Toast Notification System - Usage Examples
 *
 * This file demonstrates how to use the western-themed toast notification system
 * in Desperados Destiny.
 */

import React from 'react';
import { useToast } from '@/store/useToastStore';
import { Button } from './Button';

/**
 * Example Component: Toast Demo Page
 *
 * This component shows all the different ways to use toasts in your application
 */
export const ToastExamples: React.FC = () => {
  const toast = useToast();

  // Example 1: Simple success toast
  const handleSuccess = () => {
    toast.success('Gold Earned!', 'You earned 50 gold coins from the bank heist.');
  };

  // Example 2: Simple error toast
  const handleError = () => {
    toast.error('Action Failed', 'You don\'t have enough energy to perform this action.');
  };

  // Example 3: Simple warning toast
  const handleWarning = () => {
    toast.warning('Low Health!', 'Your health is below 25%. Consider resting.');
  };

  // Example 4: Simple info toast
  const handleInfo = () => {
    toast.info('New Quest Available', 'Talk to the Sheriff at the Town Hall.');
  };

  // Example 5: Custom duration
  const handleCustomDuration = () => {
    toast.addToast({
      type: 'success',
      title: 'Achievement Unlocked!',
      message: 'You\'ve completed your first heist.',
      duration: 8000, // 8 seconds
    });
  };

  // Example 6: With action button
  const handleWithAction = () => {
    toast.addToast({
      type: 'info',
      title: 'Friend Request',
      message: 'Billy the Kid wants to be your friend.',
      action: {
        label: 'View Request',
        onClick: () => {
          // Navigate to friends page here
        },
      },
    });
  };

  // Example 7: Custom icon
  const handleCustomIcon = () => {
    toast.addToast({
      type: 'warning',
      title: 'Gang War!',
      message: 'Your gang is under attack!',
      icon: '⚔️',
    });
  };

  // Example 8: No auto-dismiss (duration = 0)
  const handlePersistent = () => {
    toast.addToast({
      type: 'error',
      title: 'Critical Error',
      message: 'Server connection lost. Please check your internet.',
      duration: 0, // Won't auto-dismiss
    });
  };

  // Example 9: Multiple toasts at once
  const handleMultiple = () => {
    toast.success('Quest Complete!');
    setTimeout(() => toast.info('Level Up!'), 500);
    setTimeout(() => toast.success('Skill Unlocked!'), 1000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-western text-wood-dark mb-2">Toast Examples</h1>
      <p className="text-wood-medium mb-8 font-serif">
        Click the buttons below to see different toast notification variants
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Variants */}
        <div className="space-y-4">
          <h2 className="text-2xl font-western text-wood-dark mb-4">Basic Variants</h2>

          <Button onClick={handleSuccess} variant="primary" fullWidth>
            Success Toast
          </Button>

          <Button onClick={handleError} variant="danger" fullWidth>
            Error Toast
          </Button>

          <Button onClick={handleWarning} variant="secondary" fullWidth>
            Warning Toast
          </Button>

          <Button onClick={handleInfo} variant="ghost" fullWidth>
            Info Toast
          </Button>
        </div>

        {/* Advanced Examples */}
        <div className="space-y-4">
          <h2 className="text-2xl font-western text-wood-dark mb-4">Advanced Examples</h2>

          <Button onClick={handleCustomDuration} variant="primary" fullWidth>
            Custom Duration (8s)
          </Button>

          <Button onClick={handleWithAction} variant="primary" fullWidth>
            With Action Button
          </Button>

          <Button onClick={handleCustomIcon} variant="secondary" fullWidth>
            Custom Icon
          </Button>

          <Button onClick={handlePersistent} variant="danger" fullWidth>
            Persistent Toast
          </Button>

          <Button onClick={handleMultiple} variant="primary" fullWidth>
            Multiple Toasts
          </Button>
        </div>
      </div>

      {/* Code Examples */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-western text-wood-dark mb-4">Code Examples</h2>

        <div className="wood-panel">
          <h3 className="font-western text-desert-sand mb-2">Simple Usage</h3>
          <pre className="bg-wood-dark text-desert-sand p-4 rounded overflow-x-auto text-sm">
{`import { useToast } from '@/store/useToastStore';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Action Complete!', 'You successfully completed the action.');
  };

  return <button onClick={handleSuccess}>Click Me</button>;
}`}
          </pre>
        </div>

        <div className="wood-panel">
          <h3 className="font-western text-desert-sand mb-2">Advanced Usage</h3>
          <pre className="bg-wood-dark text-desert-sand p-4 rounded overflow-x-auto text-sm">
{`import { useToast } from '@/store/useToastStore';

function MyComponent() {
  const toast = useToast();

  const handleCustomToast = () => {
    toast.addToast({
      type: 'success',
      title: 'Achievement Unlocked!',
      message: 'You earned the "Quick Draw" achievement.',
      icon: '🏆',
      duration: 8000,
      action: {
        label: 'View Achievements',
        onClick: () => {
          // Navigate to achievements page
        },
      },
    });
  };

  return <button onClick={handleCustomToast}>Show Toast</button>;
}`}
          </pre>
        </div>

        <div className="wood-panel">
          <h3 className="font-western text-desert-sand mb-2">Toast Types</h3>
          <div className="text-desert-sand text-sm space-y-2">
            <p><strong>success:</strong> Green/gold theme - Use for successful actions, achievements, rewards</p>
            <p><strong>error:</strong> Red/leather theme - Use for errors, failures, blocked actions</p>
            <p><strong>warning:</strong> Gold/amber theme - Use for warnings, low resources, danger alerts</p>
            <p><strong>info:</strong> Blue theme - Use for information, tips, quest updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Usage Guidelines:
 *
 * 1. WHEN TO USE TOASTS:
 *    - Success confirmations (item purchased, quest complete, etc.)
 *    - Error messages (action failed, network error, etc.)
 *    - Warnings (low health, low energy, etc.)
 *    - Info notifications (quest available, friend online, etc.)
 *
 * 2. WHEN NOT TO USE TOASTS:
 *    - For critical decisions (use Modal/ConfirmDialog instead)
 *    - For complex information (use dedicated pages/modals)
 *    - For permanent status displays (use status bars instead)
 *
 * 3. BEST PRACTICES:
 *    - Keep titles short (1-4 words)
 *    - Keep messages concise (1-2 sentences max)
 *    - Use appropriate variant for the context
 *    - Don't spam multiple toasts rapidly (users can't read them)
 *    - Use action buttons sparingly (only when there's a clear next action)
 *
 * 4. ACCESSIBILITY:
 *    - Toasts have role="alert" for screen readers
 *    - Auto-dismiss toasts have 5 second default duration
 *    - Users can manually dismiss any toast
 *    - Color is not the only indicator (icons + text)
 */

export default ToastExamples;
