/**
 * HandQuiz Component
 * Interactive quiz to test understanding of poker hand rankings
 */

import React, { useState, useCallback } from 'react';
import { useTutorialStore } from '@/store/useTutorialStore';
import { Button, Card } from '@/components/ui';

// Card display types
type Suit = 'spades' | 'hearts' | 'clubs' | 'diamonds';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface PlayingCard {
  rank: Rank;
  suit: Suit;
}

interface QuizQuestion {
  id: string;
  cards: PlayingCard[];
  correctAnswer: string;
  options: string[];
  explanation: string;
}

// Suit symbols and colors
const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  clubs: '♣',
  diamonds: '♦',
};

const SUIT_COLORS: Record<Suit, string> = {
  spades: 'text-gray-900',
  hearts: 'text-red-600',
  clubs: 'text-gray-900',
  diamonds: 'text-red-600',
};

// Quiz questions with predetermined hands
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    cards: [
      { rank: 'K', suit: 'hearts' },
      { rank: 'K', suit: 'spades' },
      { rank: '7', suit: 'diamonds' },
      { rank: '3', suit: 'clubs' },
      { rank: '2', suit: 'hearts' },
    ],
    correctAnswer: 'Pair',
    options: ['High Card', 'Pair', 'Two Pair'],
    explanation: 'Two Kings make a Pair - the most common winning hand.',
  },
  {
    id: 'q2',
    cards: [
      { rank: 'Q', suit: 'clubs' },
      { rank: 'Q', suit: 'diamonds' },
      { rank: '8', suit: 'hearts' },
      { rank: '8', suit: 'spades' },
      { rank: 'A', suit: 'clubs' },
    ],
    correctAnswer: 'Two Pair',
    options: ['Pair', 'Two Pair', 'Full House'],
    explanation: 'Queens and Eights - two different pairs make Two Pair.',
  },
  {
    id: 'q3',
    cards: [
      { rank: 'A', suit: 'spades' },
      { rank: 'K', suit: 'diamonds' },
      { rank: 'J', suit: 'hearts' },
      { rank: '10', suit: 'clubs' },
      { rank: '4', suit: 'spades' },
    ],
    correctAnswer: 'High Card',
    options: ['Straight', 'Flush', 'High Card'],
    explanation: 'No pairs, no straight, no flush - just High Card (Ace high).',
  },
];

interface HandQuizProps {
  onComplete?: () => void;
}

export const HandQuiz: React.FC<HandQuizProps> = ({ onComplete }) => {
  const { recordQuizAnswer, quizAnswers, completeAction } = useTutorialStore();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const question = QUIZ_QUESTIONS[currentQuestion];
  const correctCount = Object.values(quizAnswers).filter(v => v).length;
  const allComplete = currentQuestion >= QUIZ_QUESTIONS.length;

  // Handle answer selection
  const handleSelectAnswer = useCallback((answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  }, [showResult]);

  // Handle answer submission
  const handleSubmit = useCallback(() => {
    if (!selectedAnswer || showResult) return;

    const correct = selectedAnswer === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    recordQuizAnswer(question.id, correct);
  }, [selectedAnswer, showResult, question, recordQuizAnswer]);

  // Handle next question
  const handleNext = useCallback(() => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz complete - mark the action as completed
      completeAction('complete-hand-quiz');
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentQuestion, onComplete, completeAction]);

  // Render a single card
  const renderCard = (card: PlayingCard, index: number) => (
    <div
      key={index}
      className="w-12 h-16 sm:w-14 sm:h-20 bg-white rounded-lg border-2 border-gray-300 shadow-md flex flex-col items-center justify-center"
    >
      <span className={`text-lg sm:text-xl font-bold ${SUIT_COLORS[card.suit]}`}>
        {card.rank}
      </span>
      <span className={`text-xl sm:text-2xl ${SUIT_COLORS[card.suit]}`}>
        {SUIT_SYMBOLS[card.suit]}
      </span>
    </div>
  );

  if (allComplete) {
    return (
      <Card variant="leather" className="p-6 max-w-lg mx-auto">
        <div className="text-center">
          <div className="text-4xl mb-4">
            {correctCount >= 3 ? '🎉' : correctCount >= 2 ? '👍' : '📚'}
          </div>
          <h3 className="text-xl font-western text-gold-light mb-2">
            Quiz Complete!
          </h3>
          <p className="text-desert-sand mb-4">
            You got {correctCount} out of {QUIZ_QUESTIONS.length} correct.
          </p>
          {correctCount >= 3 ? (
            <p className="text-green-400 mb-4">
              You understand poker hands!
            </p>
          ) : (
            <p className="text-desert-stone mb-4">
              Don't worry - you'll learn more as you play.
            </p>
          )}
          <Button onClick={handleNext}>Continue</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="leather" className="p-4 sm:p-6 max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-desert-stone">
          Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
        </span>
        <span className="text-sm text-gold-light">
          {correctCount} correct
        </span>
      </div>

      {/* Cards display */}
      <div className="bg-wood-dark/50 rounded-lg p-4 mb-4">
        <p className="text-sm text-desert-stone mb-3 text-center">
          What hand is this?
        </p>
        <div className="flex justify-center gap-1 sm:gap-2">
          {question.cards.map((card, i) => renderCard(card, i))}
        </div>
      </div>

      {/* Answer options */}
      <div className="space-y-2 mb-4">
        {question.options.map(option => {
          const isSelected = selectedAnswer === option;
          const isAnswer = option === question.correctAnswer;

          let buttonClass = 'w-full text-left px-4 py-3 rounded-lg border-2 transition-all ';

          if (showResult) {
            if (isAnswer) {
              buttonClass += 'bg-green-900/30 border-green-500 text-green-400';
            } else if (isSelected && !isAnswer) {
              buttonClass += 'bg-red-900/30 border-red-500 text-red-400';
            } else {
              buttonClass += 'bg-wood-dark/30 border-wood-grain/30 text-desert-stone';
            }
          } else {
            if (isSelected) {
              buttonClass += 'bg-gold-dark/30 border-gold-light text-gold-light';
            } else {
              buttonClass += 'bg-wood-dark/30 border-wood-grain/30 text-desert-sand hover:border-gold-light/50';
            }
          }

          return (
            <button
              key={option}
              onClick={() => handleSelectAnswer(option)}
              disabled={showResult}
              className={buttonClass}
            >
              <span className="font-semibold">{option}</span>
              {showResult && isAnswer && (
                <span className="ml-2">✓</span>
              )}
              {showResult && isSelected && !isAnswer && (
                <span className="ml-2">✗</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Result message */}
      {showResult && (
        <div className={`p-3 rounded-lg mb-4 ${isCorrect ? 'bg-green-900/30' : 'bg-wood-dark/50'}`}>
          <p className={`text-sm ${isCorrect ? 'text-green-400' : 'text-desert-sand'}`}>
            {isCorrect ? '✓ Correct!' : `The answer was ${question.correctAnswer}.`}
          </p>
          <p className="text-xs text-desert-stone mt-1">
            {question.explanation}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
          >
            Submit
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'Continue'}
          </Button>
        )}
      </div>
    </Card>
  );
};

// Display name for React DevTools
HandQuiz.displayName = 'HandQuiz';

export default HandQuiz;
