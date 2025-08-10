'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Howl } from 'howler';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

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
  const { user } = useAuth();
  const router = useRouter();

  // Initialize sounds
  const correctSound = new Howl({ src: ['https://res.cloudinary.com/dqovjmmlx/video/upload/v1754057857/correct-6033_d2x1ks.mp3'] });
  const wrongSound = new Howl({ src: ['https://res.cloudinary.com/dqovjmmlx/video/upload/v1754057858/wrong-answer-126515_ezcctf.mp3'] });
  const skipSound = new Howl({ src: ['https://res.cloudinary.com/dqovjmmlx/video/upload/v1754057857/wrong-answer-129254_ppodzv.mp3'] });

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
      const startTime = Date.now();
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

  const startQuiz = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ difficulty, optionCount: 4 }),
      });
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      setQuestions(data.questions);
      setTimer(60); // Set timer based on difficulty if needed
      setAnswered(false);
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
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
        opt.classList.add('bg-green-600', 'success-pulse', 'text-white');
      }
      opt.disabled = true;
    });
  };

  const createSuccessEffect = () => {
    const effect = document.createElement('div');
    effect.textContent = '+1';
    effect.className = 'fixed text-green-400 font-bold text-3xl pointer-events-none z-50';
    effect.style.left = '50%';
    effect.style.top = '40%';
    effect.style.transform = 'translate(-50%, -50%)';
    effect.style.animation = 'float 1.2s ease-out forwards';
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1200);
  };

  const nextQuestion = async (newAnswers) => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
      setAnswered(false);
      const allOptions = document.querySelectorAll('.option-btn');
      allOptions.forEach((opt) => {
        opt.classList.remove('bg-green-600', 'bg-red-600', 'success-pulse', 'shake', 'text-white');
        opt.disabled = false;
      });
    } else {
      const timeTaken = totalTime + (timer - timeLeft);
      const score = {
        correct: newAnswers.filter((a) => a.isCorrect).length,
        wrong: newAnswers.filter((a) => !a.isCorrect).length,
        skipped,
        total: questions.length,
      };

      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/submit`, {
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
        router.push('/profile');
      } catch (error) {
        console.error('Error submitting quiz:', error);
      }
    }
  };

  const renderQuestion = (question) => {
    return (
      <MathJaxContext>
        <MathJax>
          {`\\[${question.questionText}\\]`}
        </MathJax>
      </MathJaxContext>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card text-center glassmorphism p-6 sm:p-10 rounded-3xl">
          <p className="text-gray-600 mb-4">Please login to play the quiz</p>
          <Link href="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (!difficulty) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card max-w-md w-full glassmorphism p-6 sm:p-10 rounded-3xl">
          <h1 className="text-3xl font-bold text-center mb-6 text-white">Choose Difficulty</h1>
          <div className="grid gap-4">
            {['easy', 'normal', 'hard', 'genius'].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`btn-secondary text-lg capitalize difficulty-btn difficulty-badge p-4 rounded-xl ${
                  level === 'easy'
                    ? 'bg-green-600/30 border-green-500/40 hover:bg-green-600/40'
                    : level === 'normal'
                    ? 'bg-blue-600/30 border-blue-500/40 hover:bg-blue-600/40'
                    : level === 'hard'
                    ? 'bg-red-600/30 border-red-500/40 hover:bg-red-600/40'
                    : 'bg-purple-600/30 border-purple-500/40 hover:bg-purple-600/40'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card text-center glassmorphism p-6 sm:p-10 rounded-3xl">
          <button onClick={startQuiz} className="btn-primary">
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-blue-900 py-12">
      <div className="max-w-4xl w-full mx-4">
        {!difficulty ? (
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl">
            <h1 className="text-3xl font-bold text-white text-center mb-8">Choose Difficulty</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['easy', 'normal', 'hard', 'genius'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`p-6 rounded-2xl font-bold text-xl capitalize transition-all transform hover:scale-105 ${
                    level === 'easy'
                      ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                      : level === 'normal'
                      ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                      : level === 'hard'
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                      : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        ) : !questions ? (
          <div className="text-center">
            <button onClick={startQuiz} className="btn-primary text-xl px-12 py-6">
              Start Quiz
            </button>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl">
            <div className="mb-8">
              {renderQuestion(questions[currentQuestion])}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className="option-btn p-6 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xl font-semibold transition-all transform hover:scale-105"
                  disabled={answered}
                >
                  <MathJax>{`\\[${option}\\]`}</MathJax>
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSkip}
                className="flex-1 p-4 bg-yellow-600/30 border border-yellow-500/40 text-white rounded-xl font-semibold hover:bg-yellow-600/40 transition-all"
                disabled={answered}
              >
                skip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}