/**
 * LoanTracker Component
 * Displays and manages property loans
 */

import React, { useState } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { formatDollars } from '@/utils/format';
import type { PropertyLoan } from '@desperados/shared';
import { LOAN_CONFIG } from '@desperados/shared';

interface LoanTrackerProps {
  loans: PropertyLoan[];
  onMakePayment: (
    loanId: string,
    amount?: number
  ) => Promise<{ success: boolean; message: string }>;
  onClose?: () => void;
  characterGold?: number;
}

/**
 * Progress bar for loan balance
 */
const LoanProgressBar: React.FC<{
  remaining: number;
  original: number;
}> = ({ remaining, original }) => {
  const paid = original - remaining;
  const paidPercentage = original > 0 ? (paid / original) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-green-400">Paid: {formatDollars(paid)}</span>
        <span className="text-red-400">Remaining: {formatDollars(remaining)}</span>
      </div>
      <div className="h-3 bg-red-900/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${paidPercentage}%` }}
          role="progressbar"
          aria-valuenow={paid}
          aria-valuemin={0}
          aria-valuemax={original}
        />
      </div>
    </div>
  );
};

/**
 * Individual loan card
 */
const LoanCard: React.FC<{
  loan: PropertyLoan;
  onMakePayment: (amount?: number) => Promise<{ success: boolean; message: string }>;
  characterGold: number;
}> = ({ loan, onMakePayment, characterGold }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(loan.monthlyPayment);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);

  const isOverdue = new Date() > new Date(loan.nextPaymentDue);
  const daysUntilDue = Math.ceil(
    (new Date(loan.nextPaymentDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const canAffordMinPayment = characterGold >= loan.monthlyPayment;
  const canPayoff = characterGold >= loan.remainingBalance;

  const missedPaymentPenalty = loan.missedPayments * LOAN_CONFIG.MISSED_PAYMENT_PENALTY;
  const foreclosureRisk = loan.missedPayments >= LOAN_CONFIG.FORECLOSURE_THRESHOLD - 1;

  const handlePayment = async (isPayoff: boolean = false) => {
    setIsLoading(true);
    const amount = isPayoff ? loan.remainingBalance : paymentAmount;
    const result = await onMakePayment(amount);
    setMessage({ text: result.message, success: result.success });
    setTimeout(() => setMessage(null), 3000);
    setIsLoading(false);

    if (result.success) {
      setShowPaymentModal(false);
    }
  };

  return (
    <>
      <Card
        variant="leather"
        className={`overflow-hidden ${foreclosureRisk ? 'border-2 border-red-500' : ''}`}
      >
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-western text-lg text-desert-sand">
                Property Loan
              </h4>
              <p className="text-xs text-desert-stone">
                ID: {loan._id.slice(-8)}
              </p>
            </div>
            <div
              className={`px-2 py-1 rounded-full text-xs ${
                isOverdue
                  ? 'bg-red-600/20 text-red-400'
                  : daysUntilDue <= 2
                    ? 'bg-orange-600/20 text-orange-400'
                    : 'bg-green-600/20 text-green-400'
              }`}
            >
              {isOverdue
                ? 'OVERDUE'
                : daysUntilDue <= 0
                  ? 'Due Today'
                  : `Due in ${daysUntilDue} days`}
            </div>
          </div>

          {/* Warning for missed payments */}
          {loan.missedPayments > 0 && (
            <div
              className={`p-2 rounded-lg ${
                foreclosureRisk
                  ? 'bg-red-900/50 border border-red-500/50'
                  : 'bg-orange-900/50 border border-orange-500/50'
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  foreclosureRisk ? 'text-red-400' : 'text-orange-400'
                }`}
              >
                {foreclosureRisk
                  ? '⚠️ FORECLOSURE WARNING!'
                  : `⚠️ ${loan.missedPayments} Missed Payment(s)`}
              </p>
              {missedPaymentPenalty > 0 && (
                <p className="text-xs text-desert-stone">
                  Penalty: {formatDollars(missedPaymentPenalty)}
                </p>
              )}
              {foreclosureRisk && (
                <p className="text-xs text-red-300 mt-1">
                  One more missed payment will result in foreclosure!
                </p>
              )}
            </div>
          )}

          {/* Loan progress */}
          <LoanProgressBar
            remaining={loan.remainingBalance}
            original={loan.originalAmount}
          />

          {/* Loan details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-desert-stone">Original Amount</p>
              <p className="text-desert-sand font-semibold">
                {formatDollars(loan.originalAmount)}
              </p>
            </div>
            <div>
              <p className="text-desert-stone">Interest Rate</p>
              <p className="text-desert-sand font-semibold">{loan.interestRate}%</p>
            </div>
            <div>
              <p className="text-desert-stone">Weekly Payment</p>
              <p className="text-gold-light font-semibold">
                {formatDollars(loan.monthlyPayment)}
              </p>
            </div>
            <div>
              <p className="text-desert-stone">Next Due</p>
              <p
                className={`font-semibold ${isOverdue ? 'text-red-400' : 'text-desert-sand'}`}
              >
                {new Date(loan.nextPaymentDue).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`rounded-lg p-2 text-center text-sm ${
                message.success
                  ? 'bg-green-900/50 border border-green-500/50'
                  : 'bg-red-900/50 border border-red-500/50'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowPaymentModal(true)}
              disabled={!canAffordMinPayment || isLoading}
              fullWidth
            >
              Make Payment
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePayment(true)}
              disabled={!canPayoff || isLoading}
              isLoading={isLoading}
              loadingText="Paying..."
              fullWidth
            >
              Pay Off ({formatDollars(loan.remainingBalance)})
            </Button>
          </div>
        </div>
      </Card>

      {/* Payment modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Make Loan Payment"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-desert-stone">Minimum Payment:</span>
              <span className="text-gold-light">{formatDollars(loan.monthlyPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-desert-stone">Remaining Balance:</span>
              <span className="text-desert-sand">{formatDollars(loan.remainingBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-desert-stone">Your Dollars:</span>
              <span className="text-gold-light">{formatDollars(characterGold)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-desert-stone mb-2">
              Payment Amount
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={loan.monthlyPayment}
                max={Math.min(loan.remainingBalance, characterGold)}
                value={paymentAmount}
                onChange={(e) =>
                  setPaymentAmount(
                    Math.min(
                      Math.min(loan.remainingBalance, characterGold),
                      Math.max(loan.monthlyPayment, parseInt(e.target.value) || loan.monthlyPayment)
                    )
                  )
                }
                className="flex-1 bg-wood-dark border border-wood-grain/30 rounded-lg p-2 text-desert-sand"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPaymentAmount(loan.monthlyPayment)}
              >
                Min
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setPaymentAmount(Math.min(loan.remainingBalance, characterGold))
                }
              >
                Max
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => handlePayment(false)}
              disabled={paymentAmount > characterGold || isLoading}
              isLoading={isLoading}
              loadingText="Processing..."
            >
              Pay {formatDollars(paymentAmount)}
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

/**
 * LoanTracker component
 */
export const LoanTracker: React.FC<LoanTrackerProps> = ({
  loans,
  onMakePayment,
  onClose,
  characterGold = 0,
}) => {
  const activeLoans = loans.filter((l) => l.isActive);
  const totalDebt = activeLoans.reduce((sum, l) => sum + l.remainingBalance, 0);
  const weeklyPayments = activeLoans.reduce((sum, l) => sum + l.monthlyPayment, 0);

  const overdueLoans = activeLoans.filter(
    (l) => new Date() > new Date(l.nextPaymentDue)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-western text-desert-sand">Loan Management</h3>
          <p className="text-sm text-desert-stone">
            {activeLoans.length} active loan(s)
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-desert-stone hover:text-desert-sand transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Summary card */}
      <Card variant="wood" className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-desert-stone uppercase">Total Debt</p>
            <p className="text-xl font-western text-red-400">{formatDollars(totalDebt)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-desert-stone uppercase">Weekly Payments</p>
            <p className="text-xl font-western text-gold-light">
              {formatDollars(weeklyPayments)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-desert-stone uppercase">Your Dollars</p>
            <p className="text-xl font-western text-gold-light">
              {formatDollars(characterGold)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-desert-stone uppercase">Overdue</p>
            <p
              className={`text-xl font-western ${
                overdueLoans.length > 0 ? 'text-red-400' : 'text-green-400'
              }`}
            >
              {overdueLoans.length}
            </p>
          </div>
        </div>
      </Card>

      {/* Overdue warning */}
      {overdueLoans.length > 0 && (
        <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
          <p className="text-red-400 font-semibold">
            ⚠️ You have {overdueLoans.length} overdue loan(s)!
          </p>
          <p className="text-red-300 text-sm">
            Make payments immediately to avoid foreclosure and penalties.
          </p>
        </div>
      )}

      {/* Loan cards */}
      {activeLoans.length > 0 ? (
        <div className="space-y-4">
          {activeLoans.map((loan) => (
            <LoanCard
              key={loan._id}
              loan={loan}
              onMakePayment={(amount) => onMakePayment(loan._id, amount)}
              characterGold={characterGold}
            />
          ))}
        </div>
      ) : (
        <Card variant="leather" className="p-8 text-center">
          <span className="text-4xl mb-3 block">💰</span>
          <h4 className="text-lg font-western text-desert-sand mb-2">
            No Active Loans
          </h4>
          <p className="text-desert-stone text-sm">
            You're debt-free! Purchase properties with loans to see them here.
          </p>
        </Card>
      )}

      {/* Loan info */}
      <Card variant="leather" className="p-4">
        <h4 className="font-western text-desert-sand mb-2">Loan Information</h4>
        <ul className="space-y-1 text-sm text-desert-stone">
          <li>
            • Payments are due every {LOAN_CONFIG.PAYMENT_INTERVAL_DAYS} days
          </li>
          <li>
            • Missed payment penalty: {formatDollars(LOAN_CONFIG.MISSED_PAYMENT_PENALTY)}
          </li>
          <li>
            • Foreclosure after {LOAN_CONFIG.FORECLOSURE_THRESHOLD} missed payments
          </li>
          <li>• Interest rates range from {LOAN_CONFIG.MIN_INTEREST_RATE}% to {LOAN_CONFIG.MAX_INTEREST_RATE}%</li>
          <li>• You can pay more than the minimum to reduce interest</li>
        </ul>
      </Card>
    </div>
  );
};

export default LoanTracker;
