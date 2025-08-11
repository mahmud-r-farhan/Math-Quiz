'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Howl } from 'howler';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import io from 'socket.io-client';
import confetti from 'canvas-confetti';

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
  const { user, register } = useAuth();
  const router = useRouter();

  const correctSound = new Howl({ src: ['https://res.cloudinary.com/dqovjmmlx/video/upload/v1754057857/correct-6033_d2x1ks.mp3'] });
  const wrongSound = new Howl({ src: ['https://res.cloudinary.com/dqovjmmlx/video/upload/v1754057858/wrong-answer-126515_ezcctf.mp3'] });
  const skipSound = new Howl({ src: ['https://res.cloudinary.com/dqovjmmlx/video/upload/v1754057857/wrong-answer-129254_ppodzv.mp3'] });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !user) {
      register(`guest_${Date.now()}`, `guest_${Date.now()}@guest.com`, 'guest', true).catch((err) => {
        setError('Failed to create guest account');
      });
    }

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: { token: localStorage.getItem('token') },
      reconnection: true,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setIsLoading(false);
      setError('Failed to connect to the server. Please try again.');
    });

    newSocket.on('quizQuestions', ({ questions }) => {
      setQuestions(questions);
      setTimer(60);
      setAnswered(false);
      setIsLoading(false);
      setError(null);
    });

    newSocket.on('error', ({ message }) => {
      setIsLoading(false);
      setError(message);
    });

    newSocket.on('badgeEarned', ({ badge }) => {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      alert(`Congratulations! You've earned the ${badge} badge! 🎉`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, register]);

  useEffect(() => {
    let timeout;
    if (isLoading) {
      timeout = setTimeout(() => {
        if (!questions) {
          setIsLoading(false);
          setError('Failed to load quiz questions. Please try again.');
        }
      }, 10000);
    }
    return () => clearTimeout(timeout);
  }, [isLoading, questions]);

  const handleSkip = useCallback(() => {
    if (answered) return;
    setAnswered(true);
    setSkipped((prev) => prev + 1);
    setStreak(0);
    skipSound.play();
    highlightCorrectAnswer();
    setTotalTime((prev) => prev + (timer - timeLeft));
    setTimeout(() => nextQuestion(answers), 1500);
  }, [answered, answers, timeLeft, timer]);

  useEffect(() => {
    let timerInterval;
    if (questions && !answered) {
      setTimeLeft(timer);
      timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(timerInterval);
            handleSkip();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [questions, currentQuestion, answered, handleSkip, timer]);

  const startQuiz = () => {
    if (!socket || !user) {
      setError('Please log in or play as guest to start the quiz');
      return;
    }
    setIsLoading(true);
    setError(null);
    socket.emit('startQuiz', { difficulty, optionCount: 4, userId: user.id });
  };

  const handleAnswer = async (selectedAnswer) => {
    if (answered) return;
    setAnswered(true);
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    const newAnswers = [
      ...answers,
      {
        ...questions[currentQuestion],
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
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      createSuccessEffect();
    } else {
      setWrong((prev) => prev + 1);
      setStreak(0);
      wrongSound.play();
      highlightCorrectAnswer();
    }

    setTotalTime((prev) => prev + (timer - timeLeft));
    setTimeout(() => nextQuestion(newAnswers), 1500);
  };

  const highlightCorrectAnswer = () => {
    const allOptions = document.querySelectorAll('.option-btn');
    allOptions.forEach((opt) => {
      if (opt.textContent === questions[currentQuestion].correctAnswer) {
        opt.classList.add('bg-emerald-500', 'animate-pulse', 'text-white');
      } else if (opt.textContent === answers[answers.length - 1]?.userAnswer) {
        opt.classList.add('bg-red-500', 'text-white');
      }
      opt.disabled = true;
    });
  };

  const createSuccessEffect = () => {
    const effect = document.createElement('div');
    effect.textContent = '+1';
    effect.className = 'fixed text-emerald-400 font-bold text-4xl pointer-events-none z-50 animate-float';
    effect.style.left = '50%';
    effect.style.top = '40%';
    effect.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1200);
  };

  const nextQuestion = async (newAnswers) => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
      setAnswered(false);
      const allOptions = document.querySelectorAll('.option-btn');
      allOptions.forEach((opt) => {
        opt.classList.remove('bg-emerald-500', 'bg-red-500', 'animate-pulse', 'text-white');
        opt.disabled = false;
      });
    } else {
      const timeTaken = totalTime + (timer - timeLeft);
      const score = {
        correct,
        wrong,
        skipped,
        total: questions.length,
      };

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            difficulty,
            score,
            timeTaken,
            maxStreak,
            questions: newAnswers,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to submit quiz');
        }
        router.push('/profile');
      } catch (error) {
        setError('Failed to submit quiz. Please try again.');
      }
    }
  };

  const renderQuestion = (question) => (
    <MathJaxContext>
      <MathJax className="text-xl sm:text-2xl font-semibold text-slate-200">{`\\[${question.questionText}\\]`}</MathJax>
    </MathJaxContext>
  );

  if (!difficulty) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Floating mathematical symbols background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 text-6xl text-amber-400 font-bold">π</div>
          <div className="absolute top-40 right-20 text-5xl text-blue-400 font-bold">∑</div>
          <div className="absolute bottom-40 left-20 text-4xl text-green-400 font-bold">∞</div>
          <div className="absolute bottom-20 right-32 text-5xl text-red-400 font-bold">∆</div>
        </div>

        {/* Gradient orbs for depth */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-full blur-3xl"></div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 max-w-md w-full p-6 sm:p-8 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            Choose Your Challenge
          </h1>
          {error && (
            <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-center text-sm font-medium">
              {error}
            </p>
          )}
          <div className="grid gap-4">
            {['easy', 'normal', 'hard', 'genius'].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 ${
                  level === 'easy'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                    : level === 'normal'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    : level === 'hard'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (!user) {
                register(`guest_${Date.now()}`, `guest_${Date.now()}@guest.com`, 'guest', true).then(() => setDifficulty('easy'));
              } else {
                setDifficulty('easy');
              }
            }}
            className="mt-6 w-full px-6 py-3 bg-slate-700/50 border border-slate-600/50 text-slate-200 rounded-lg font-semibold hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Play as Guest
          </button>
        </div>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Floating mathematical symbols background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 text-6xl text-amber-400 font-bold">π</div>
          <div className="absolute top-40 right-20 text-5xl text-blue-400 font-bold">∑</div>
          <div className="absolute bottom-40 left-20 text-4xl text-green-400 font-bold">∞</div>
          <div className="absolute bottom-20 right-32 text-5xl text-red-400 font-bold">∆</div>
        </div>

        {/* Gradient orbs for depth */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-full blur-3xl"></div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-6 sm:p-8 text-center relative z-10">
          {error && (
            <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-sm font-medium">
              {error}
            </p>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-slate-200 text-base sm:text-lg">
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading quiz questions...
            </div>
          ) : (
            <button
              onClick={startQuiz}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              Start Quiz
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating mathematical symbols background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 text-6xl text-amber-400 font-bold">π</div>
        <div className="absolute top-40 right-20 text-5xl text-blue-400 font-bold">∑</div>
        <div className="absolute bottom-40 left-20 text-4xl text-green-400 font-bold">∞</div>
        <div className="absolute bottom-20 right-32 text-5xl text-red-400 font-bold">∆</div>
      </div>

      {/* Gradient orbs for depth */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-full blur-3xl"></div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="bg-slate-800/50 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <p className="text-slate-200 text-base sm:text-lg font-semibold">
              Question {currentQuestion + 1}/{questions.length}
            </p>
            <div className="flex items-center gap-4">
              <p className="text-slate-200 text-base sm:text-lg font-semibold">
                Time Left: <span className={timeLeft <= 10 ? 'text-red-400 animate-pulse' : ''}>{timeLeft}s</span>
              </p>
              <p className="text-amber-400 text-base sm:text-lg font-semibold">Streak: {streak}</p>
            </div>
          </div>
          <div className="w-full bg-slate-900/50 rounded-full h-3 mb-6">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          {error && (
            <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-center text-sm font-medium">
              {error}
            </p>
          )}
          <div className="mb-8 bg-slate-900/30 p-4 rounded-lg border border-slate-700/50">
            {renderQuestion(questions[currentQuestion])}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="option-btn p-4 sm:p-6 bg-slate-900/50 border border-slate-600/50 hover:bg-slate-800/50 text-slate-200 rounded-lg text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed"
                disabled={answered}
              >
                <MathJax>{`\\[${option}\\]`}</MathJax>
              </button>
            ))}
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSkip}
              className="flex-1 p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 rounded-lg font-semibold text-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25 disabled:bg-slate-600/50 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={answered}
            >
              Skip
            </button>
            <Link
              href="/profile"
              className="flex-1 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold text-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 text-center"
            >
              End Quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}