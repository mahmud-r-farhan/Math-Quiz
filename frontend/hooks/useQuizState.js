import { useState, useCallback } from 'react';

export const useQuizState = () => {
  const [difficulty, setDifficulty] = useState('');
  const [optionCount, setOptionCount] = useState(4);
  const [quizLength, setQuizLength] = useState(10);
  const [questions, setQuestions] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [skipped, setSkipped] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [socketError, setSocketError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const resetQuiz = useCallback(() => {
    setQuestions(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setCorrect(0);
    setWrong(0);
    setSkipped(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalTime(0);
    setTimeLeft(timer);
    setAnswered(false);
    setError(null);
    setSocketError(null);
    setShowModal(false);
  }, [timer]);

  return {
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
    resetQuiz,
  };
};