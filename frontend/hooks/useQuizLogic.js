import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { connectSocket, getSocket } from '../utility/socket';

export const useQuizLogic = ({
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
}) => {
  const router = useRouter();

  const startQuiz = useCallback(async () => {
    if (!difficulty) {
      setError('Please select a difficulty level');
      return;
    }
    if (![4, 6].includes(optionCount)) {
      setError('Please select 4 or 6 options');
      return;
    }
    if (![5, 10, 15].includes(quizLength)) {
      setError('Please select a valid quiz length');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSocketError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        setError('You are not authenticated. Please log in again.');
        router.push('/login');
        return;
      }

      const socket = await connectSocket(token);
      const quizPromise = new Promise((resolve, reject) => {
        socket.emit('startQuiz', { difficulty, optionCount, quizLength, userId: user.id });

        socket.on('quizQuestions', (data) => {
          if (!data.questions || !Array.isArray(data.questions)) {
            reject(new Error('Invalid response from server'));
            return;
          }
          if (data.questions.some((q) => !q._id)) {
            reject(new Error('Invalid question data: missing question IDs'));
            return;
          }
          resolve(data.questions);
        });

        socket.on('error', (data) => {
          reject(new Error(data.message || 'Socket error'));
        });

        setTimeout(() => reject(new Error('Quiz start timed out')), 10000);
      });

      const questions = await quizPromise;
      setQuestions(questions);
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
      setIsLoading(false);
    } catch (err) {
      setSocketError(`Failed to start quiz: ${err.message}`);
      setIsLoading(false);
    }
  }, [difficulty, optionCount, quizLength, timer, user, router, setQuestions, setCurrentQuestion, setAnswers, setCorrect, setWrong, setSkipped, setStreak, setMaxStreak, setTotalTime, setTimeLeft, setAnswered, setIsLoading, setError, setSocketError]);

  const handleAnswer = useCallback(
    (selectedAnswer) => {
      if (answered || !questions || !questions[currentQuestion]) return;
      setAnswered(true);
      const question = questions[currentQuestion];
      if (!question._id) {
        setError('Invalid question data. Please try again.');
        return;
      }
      const isCorrect = selectedAnswer === question.correctAnswer;
      setTotalTime((prev) => prev + (timer - timeLeft));
      const newAnswers = [
        ...answers,
        {
          questionId: String(question._id),
          questionText: question.questionText,
          correctAnswer: question.correctAnswer,
          userAnswer: selectedAnswer,
          isCorrect,
        },
      ];
      setAnswers(newAnswers);
      if (isCorrect) {
        setCorrect((prev) => prev + 1);
        setStreak((prev) => prev + 1);
        setMaxStreak((prev) => Math.max(prev, streak + 1));
        correctSound.play();
        createSuccessEffect();
      } else {
        setWrong((prev) => prev + 1);
        setStreak(0);
        wrongSound.play();
      }
      highlightCorrectAnswer();
      setTimeout(() => nextQuestion(newAnswers), 1500);
    },
    [answered, questions, currentQuestion, timeLeft, timer, answers, streak, correctSound, wrongSound, createSuccessEffect, highlightCorrectAnswer, setAnswered, setTotalTime, setAnswers, setCorrect, setWrong, setStreak, setMaxStreak, setError]
  );

  const handleSkip = useCallback(() => {
    if (answered || !questions || !questions[currentQuestion]) return;
    setAnswered(true);
    setSkipped((prev) => prev + 1);
    setStreak(0);
    skipSound.play();
    highlightCorrectAnswer();
    setTotalTime((prev) => prev + (timer - timeLeft));
    const newAnswers = [
      ...answers,
      {
        questionId: String(questions[currentQuestion]._id),
        questionText: questions[currentQuestion].questionText,
        correctAnswer: questions[currentQuestion].correctAnswer,
        userAnswer: null,
        isCorrect: false,
      },
    ];
    setAnswers(newAnswers);
    setTimeout(() => nextQuestion(newAnswers), 1500);
  }, [answered, questions, currentQuestion, timeLeft, timer, answers, skipSound, highlightCorrectAnswer, setAnswered, setSkipped, setStreak, setTotalTime, setAnswers]);

  const submitQuiz = useCallback(
    async (payload) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `Failed to submit quiz (Status: ${response.status})`);
        }
        return data;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const nextQuestion = useCallback(
    async (newAnswers) => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion((prev) => prev + 1);
        setAnswered(false);
        setTimeLeft(timer);
        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach((opt) => {
          opt.classList.remove('bg-emerald-500', 'bg-red-500', 'animate-pulse', 'animate-shake', 'text-white');
          opt.disabled = false;
        });
      } else {
        const timeTaken = Math.max(0, totalTime + (timer - timeLeft));
        const score = { correct, wrong, skipped, total: questions.length };
        const payload = {
          difficulty,
          score,
          timeTaken,
          maxStreak,
          questions: newAnswers.map((q) => ({
            questionId: q.questionId,
            questionText: q.questionText,
            correctAnswer: q.correctAnswer,
            userAnswer: q.userAnswer,
            isCorrect: q.isCorrect,
          })),
        };

        if (
          !payload.difficulty ||
          !payload.score ||
          payload.score.correct === undefined ||
          payload.score.wrong === undefined ||
          payload.score.skipped === undefined ||
          payload.score.total !== payload.questions.length ||
          payload.timeTaken === undefined ||
          payload.maxStreak === undefined ||
          !payload.questions ||
          !Array.isArray(payload.questions) ||
          payload.questions.some((q) => !q.questionId)
        ) {
          setError('Invalid quiz data. Please try again.');
          return;
        }

        try {
          const data = await submitQuiz(payload);
          setGameResult(data.gameResult);
          setShowModal(true);
          const socket = getSocket();
          if (socket) {
            socket.emit('scoreUpdate', { userId: user.id, points: data.gameResult.pointsEarned });
          }
        } catch (err) {
          setError(`Failed to submit quiz: ${err.message}`);
        }
      }
    },
    [currentQuestion, questions, totalTime, timer, timeLeft, correct, wrong, skipped, difficulty, maxStreak, user, submitQuiz, setCurrentQuestion, setAnswered, setTimeLeft, setGameResult, setShowModal, setError]
  );

  const handlePlayAgain = useCallback(() => {
    setShowModal(false);
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
    startQuiz();
  }, [startQuiz, timer, setShowModal, setQuestions, setCurrentQuestion, setAnswers, setCorrect, setWrong, setSkipped, setStreak, setMaxStreak, setTotalTime, setTimeLeft, setAnswered, setError, setSocketError]);

  return { startQuiz, handleAnswer, handleSkip, handlePlayAgain };
};