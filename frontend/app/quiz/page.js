'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MathJaxContext } from 'better-react-mathjax';
import { useQuizState } from '../../hooks/useQuizState';
import { useSocket } from '../../hooks/useSocket';
import { useQuizLogic } from '../../hooks/useQuizLogic';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import QuizHeader from './QuizHeader';
import QuizOptions from './QuizOptions';
import QuizModeSelector from './QuizModeSelector';
import QuizErrorDisplay from './QuizErrorDisplay';
import DifficultySelector from './DifficultySelector';
import QuizQuestion from './QuizQuestion';
import QuizControls from './QuizControls';
import QuizLoading from './QuizLoading';
import QuizResultModal from './QuizResultModal';

const mathJaxConfig = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    processEnvironments: true,
  },
  options: {
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
    ignoreHtmlClass: 'tex2jax_ignore',
    processHtmlClass: 'tex2jax_process',
  },
  loader: {
    load: ['input/tex', 'output/svg'],
  },
  startup: {
    typeset: true,
    pageReady: () => {},
  },
};

export default function Quiz() {
  const { user } = useAuth();
  const {
    difficulty,
    setDifficulty,
    optionCount,
    setOptionCount,
    quizLength,
    setQuizLength,
    questions,
    setQuestions,
    currentQuestion,
    setCurrentQuestion,
    answers,
    setAnswers,
    timer,
    timeLeft,
    setTimeLeft,
    streak,
    setStreak,
    maxStreak,
    setMaxStreak,
    totalTime,
    setTotalTime,
    answered,
    setAnswered,
    skipped,
    setSkipped,
    correct,
    setCorrect,
    wrong,
    setWrong,
    socketError,
    setSocketError,
    isLoading,
    setIsLoading,
    error,
    setError,
    showModal,
    setShowModal,
    gameResult,
    setGameResult,
  } = useQuizState();

  const { correctSound, wrongSound, skipSound, createSuccessEffect, highlightCorrectAnswer } = useSoundEffects(
    questions,
    currentQuestion,
    answers
  );

  const { startQuiz, handleAnswer, handleSkip, handlePlayAgain } = useQuizLogic({
    difficulty,
    optionCount,
    quizLength,
    timer,
    user,
    setQuestions,
    setCurrentQuestion,
    setAnswers,
    setCorrect,
    setWrong,
    setSkipped,
    setStreak,
    setMaxStreak,
    setTotalTime,
    setTimeLeft,
    setAnswered,
    setIsLoading,
    setError,
    setSocketError,
    setGameResult,
    answers,
    currentQuestion,
    questions,
    timeLeft,
    streak,
    correctSound,
    wrongSound,
    skipSound,
    createSuccessEffect,
    highlightCorrectAnswer,
  });

  useSocket(user, setSocketError, router);

  useEffect(() => {
    if (!questions || answered) return;
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          handleSkip();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [questions, answered, handleSkip]);

  return (
    <MathJaxContext config={mathJaxConfig}>
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-8px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(8px);
          }
        }
      `}</style>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 text-6xl text-amber-400 font-bold sm:text-4xl">π</div>
          <div className="absolute top-40 right-20 text-5xl text-blue-400 font-bold sm:text-3xl">∑</div>
          <div className="absolute bottom-40 left-20 text-4xl text-green-400 font-bold sm:text-2xl">∞</div>
          <div className="absolute bottom-20 right-32 text-5xl text-red-400 font-bold sm:text-3xl">∆</div>
        </div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full blur-3xl sm:w-64 sm:h-64"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-full blur-3xl sm:w-64 sm:h-64"></div>
        <div className="max-w-4xl w-full relative z-10 mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-3xl shadow-2xl border border-slate-700/50">
            <QuizModeSelector />
            {difficulty ? (
              questions ? (
                <>
                  <QuizHeader streak={streak} timeLeft={timeLeft} />
                  <QuizQuestion
                    questions={questions}
                    currentQuestion={currentQuestion}
                    timeLeft={timeLeft}
                    streak={streak}
                    answered={answered}
                    handleAnswer={handleAnswer}
                  />
                  <QuizControls handleSkip={handleSkip} answered={answered} />
                  <QuizErrorDisplay error={error} socketError={socketError} />
                </>
              ) : (
                <QuizOptions
                  optionCount={optionCount}
                  setOptionCount={setOptionCount}
                  quizLength={quizLength}
                  setQuizLength={setQuizLength}
                  startQuiz={startQuiz}
                  isLoading={isLoading}
                />
              )
            ) : (
              <DifficultySelector
                setDifficulty={setDifficulty}
                error={error}
                user={user}
                setError={setError}
              />
            )}
          </div>
        </div>
        <QuizResultModal
          isOpen={showModal}
          onClose={handlePlayAgain}
          results={{
            correct,
            wrong,
            skipped,
            total: questions?.length || 0,
            pointsEarned: gameResult?.pointsEarned || 0,
          }}
          difficulty={difficulty}
          timeTaken={totalTime + (timer - timeLeft)}
          maxStreak={maxStreak}
        />
      </div>
    </MathJaxContext>
  );
}