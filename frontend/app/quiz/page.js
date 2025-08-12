'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Howl } from 'howler';
import { MathJaxContext } from 'better-react-mathjax';
import io from 'socket.io-client';
import confetti from 'canvas-confetti';
import DifficultySelector from './DifficultySelector';
import QuizQuestion from './QuizQuestion';
import QuizControls from './QuizControls';
import LoadingSpinner from './QuizLoading';
import QuizResultModal from './QuizResultModal';

export default function Quiz() {
  const [difficulty, setDifficulty] = useState('');
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
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socketError, setSocketError] = useState(null);
  const [showModal, setShowModal] = useState(false); // Added
  const [gameResult, setGameResult] = useState(null); // Added
  const { user } = useAuth();
  const router = useRouter();

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
      pageReady: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('MathJax initialized');
        }
      },
    },
  };

  const correctSound = useMemo(
    () => new Howl({ src: ['https://res.cloudinary.com/dqovjmmlx/video/upload/v1754057857/correct-6033_d2x1ks.mp3'] }),
    []
  );
  const wrongSound = useMemo(
    () => new Howl({ src: ['https://res.cloudinary.com/dqovjmmlx/video/upload/v1754057858/wrong-answer-126515_ezcctf.mp3'] }),
    []
  );
  const skipSound = useMemo(
    () => new Howl({ src: ['https://res.cloudinary.com/dqovjmmlx/video/upload/v1754057857/wrong-answer-129254_ppodzv.mp3'] }),
    []
  );

  const createSuccessEffect = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    const effect = document.createElement('div');
    effect.textContent = '+1';
    effect.className = 'fixed text-emerald-400 font-bold text-4xl pointer-events-none z-50 animate-float';
    effect.style.left = '50%';
    effect.style.top = '40%';
    effect.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1200);
  }, []);

  const highlightCorrectAnswer = useCallback(() => {
    const allOptions = document.querySelectorAll('.option-btn');
    allOptions.forEach((opt) => {
      if (opt.textContent === questions?.[currentQuestion]?.correctAnswer) {
        opt.classList.add('bg-emerald-500', 'animate-pulse', 'text-white');
      } else if (opt.textContent === answers[answers.length - 1]?.userAnswer) {
        opt.classList.add('bg-red-500', 'text-white', 'animate-shake');
      }
      opt.disabled = true;
    });
  }, [questions, currentQuestion, answers]);

  const startQuiz = useCallback(async () => {
    if (!difficulty) {
      setError('Please select a difficulty level');
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not authenticated. Please log in again.');
        router.push('/login');
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ difficulty, optionCount: 4 }),
      });
      const data = await response.json();
      if (!response.ok || !data.questions || !Array.isArray(data.questions)) {
        throw new Error(data.message || 'Invalid response from server');
      }
      // Validate question IDs
      if (data.questions.some(q => !q._id)) {
        throw new Error('Invalid question data: missing question IDs');
      }
      setQuestions(data.questions);
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
      setError(null);
      setSocketError(null);
    } catch (err) {
      console.log('Fetch questions error:', err.message, err.stack);
      setError(`Failed to fetch questions: ${err.message}`);
      setIsLoading(false);
    }
  }, [difficulty, timer, router]);

  const handleAnswer = useCallback(
    (selectedAnswer) => {
      if (answered || !questions || !questions[currentQuestion]) return;
      setAnswered(true);
      const question = questions[currentQuestion];
      if (!question._id) {
        console.log('Missing questionId:', question);
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
    [answered, questions, currentQuestion, timeLeft, timer, answers, streak, correctSound, wrongSound, createSuccessEffect, highlightCorrectAnswer]
  );

  const handleSkip = useCallback(() => {
    if (answered || !questions || !questions[currentQuestion]) return;
    setAnswered(true);
    setSkipped((prev) => {
      const newSkipped = prev + 1;
      console.log('Skipping question:', {
        questionIndex: currentQuestion,
        questionId: questions[currentQuestion]._id,
        newSkippedCount: newSkipped,
      });
      return newSkipped;
    });
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
  }, [answered, questions, currentQuestion, timeLeft, timer, answers, skipSound, highlightCorrectAnswer]);

  const submitQuiz = async (payload, retries = 2) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, submitting as guest');
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        console.log('Quiz submission failed:', {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        throw new Error(data.message || `Failed to submit quiz (Status: ${response.status})`);
      }
      return data;
    } catch (err) {
      if (retries > 0) {
        console.log(`Retrying quiz submission (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return submitQuiz(payload, retries - 1);
      }
      throw err;
    }
  };

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
        const score = { correct, wrong, skipped, total: questions.length }; // Ensure total matches questions.length
        const payload = {
          difficulty,
          score,
          timeTaken,
          maxStreak,
          questions: newAnswers.map(q => ({
            questionId: q.questionId,
            questionText: q.questionText,
            correctAnswer: q.correctAnswer,
            userAnswer: q.userAnswer,
            isCorrect: q.isCorrect,
          })),
        };

        // Additional validation to ensure consistency
        if (
          !payload.difficulty ||
          !payload.score ||
          payload.score.correct === undefined ||
          payload.score.wrong === undefined ||
          payload.score.skipped === undefined ||
          payload.score.total !== payload.questions.length || // Ensure total matches questions.length
          payload.timeTaken === undefined ||
          payload.maxStreak === undefined ||
          !payload.questions ||
          !Array.isArray(payload.questions) ||
          payload.questions.some(q => !q.questionId)
        ) {
          console.log('Invalid payload detected:', {
            difficulty: payload.difficulty,
            score: payload.score,
            timeTaken: payload.timeTaken,
            maxStreak: payload.maxStreak,
            questions: payload.questions,
            questionsLength: payload.questions?.length,
            firstQuestion: payload.questions?.[0],
          });
          setError('Invalid quiz data. Please try again.');
          return;
        }

        console.log('Submitting quiz with payload:', JSON.stringify(payload, null, 2));

        try {
          const data = await submitQuiz(payload);
          setGameResult(data.gameResult);
          setShowModal(true);
        } catch (err) {
          console.log('Quiz submission error:', err.message, err.stack, { payload });
          setError(`Failed to submit quiz: ${err.message}`);
        }
      }
    },
    [currentQuestion, questions, totalTime, timer, timeLeft, correct, wrong, skipped, difficulty, maxStreak]
  );

  const handlePlayAgain = useCallback(() => {
    setShowModal(false);
    startQuiz();
  }, [startQuiz]);

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token },
    });
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('scoreUpdate', (data) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Score update:', data);
        }
      });
      socket.on('leaderboardUpdate', (data) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Leaderboard update:', data);
        }
      });
      socket.on('error', (data) => {
        console.log('Socket error:', data.message);
        setSocketError(`Socket error: ${data.message}`);
      });
    }
  }, [socket]);

  return (
    <MathJaxContext config={mathJaxConfig}>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
      `}</style>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 text-6xl text-amber-400 font-bold">π</div>
          <div className="absolute top-40 right-20 text-5xl text-blue-400 font-bold">∑</div>
          <div className="absolute bottom-40 left-20 text-4xl text-green-400 font-bold">∞</div>
          <div className="absolute bottom-20 right-32 text-5xl text-red-400 font-bold">∆</div>
        </div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-full blur-3xl"></div>
        <div className="max-w-4xl w-full relative z-10">
          <div className="bg-slate-800/50 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-700/50">
            {difficulty ? (
              questions ? (
                <>
                  <QuizQuestion
                    questions={questions}
                    currentQuestion={currentQuestion}
                    timeLeft={timeLeft}
                    streak={streak}
                    answered={answered}
                    handleAnswer={handleAnswer}
                  />
                  <QuizControls handleSkip={handleSkip} answered={answered} />
                  {error && (
                    <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-center text-sm font-medium">
                      {error}
                    </p>
                  )}
                  {socketError && (
                    <p className="text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6 text-center text-sm font-medium">
                      {socketError}
                    </p>
                  )}
                </>
              ) : (
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-6 sm:p-8 text-center relative z-10">
                  {error && (
                    <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-sm font-medium">
                      {error}
                    </p>
                  )}
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <button
                      onClick={startQuiz}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                    >
                      Start Quiz
                    </button>
                  )}
                </div>
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