'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Howl } from 'howler';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import io from 'socket.io-client';

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

  // Initialize sounds
  const correctSound = new Howl({ src: ['https://res.cloudinary.com/dqovjmmlx/video/upload/v1754057857/correct-6033_d2x1ks.mp3'] });
  const wrongSound = new Howl({ src: ['https://res.cloudinary.com/dqovjmmlx/video/upload/v1754057858/wrong-answer-126515_ezcctf.mp3'] });
  const skipSound = new Howl({ src: ['https://res.cloudinary.com/dqovjmmlx/video/upload/v1754057857/wrong-answer-129254_ppodzv.mp3'] });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !user) {
      // Create guest user
      register(`guest_${Date.now()}`, `guest_${Date.now()}@guest.com`, 'guest', true).catch((err) => {
        setError('Failed to create guest account');
      });
    }

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket'],
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

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [router, user, register]);

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
        opt.classList.add('bg-green-500', 'animate-pulse', 'text-white');
      }
      opt.disabled = true;
    });
  };

  const createSuccessEffect = () => {
    const effect = document.createElement('div');
    effect.textContent = '+1';
    effect.className = 'fixed text-green-400 font-bold text-4xl pointer-events-none z-50 animate-float';
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
        opt.classList.remove('bg-green-500', 'bg-red-500', 'animate-pulse', 'text-white');
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
      <MathJax className="text-2xl font-semibold text-white">{`\\[${question.questionText}\\]`}</MathJax>
    </MathJaxContext>
  );

  if (!difficulty) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-8 text-indigo-900">Choose Difficulty</h1>
          {error && <p className="text-red-500 mb-6 text-center">{error}</p>}
          <div className="grid gap-4">
            {['easy', 'normal', 'hard', 'genius'].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`px-6 py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-105 ${
                  level === 'easy'
                    ? 'bg-green-500 hover:bg-green-600'
                    : level === 'normal'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : level === 'hard'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-purple-500 hover:bg-purple-600'
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
            className="mt-6 w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
          >
            Play as Guest
          </button>
        </div>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {error && <p className="text-red-500 mb-6">{error}</p>}
          {isLoading ? (
            <p className="text-gray-600 text-lg">Loading quiz questions...</p>
          ) : (
            <button onClick={startQuiz} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Start Quiz
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-blue-900 py-12">
      <div className="max-w-4xl w-full mx-4">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl">
          <div className="flex justify-between mb-6">
            <p className="text-white text-lg">Question {currentQuestion + 1}/{questions.length}</p>
            <p className="text-white text-lg">Time Left: {timeLeft}s</p>
          </div>
          {error && <p className="text-red-500 mb-6">{error}</p>}
          <div className="mb-8">{renderQuestion(questions[currentQuestion])}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="option-btn p-6 bg-white/20 hover:bg-white/30 text-white rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
                disabled={answered}
              >
                <MathJax>{`\\[${option}\\]`}</MathJax>
              </button>
            ))}
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSkip}
              className="flex-1 p-4 bg-yellow-500/50 text-white rounded-lg font-semibold hover:bg-yellow-600/50 transition-all"
              disabled={answered}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}