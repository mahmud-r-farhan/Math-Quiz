import { useMemo, useCallback } from 'react';
import { Howl } from 'howler';
import confetti from 'canvas-confetti';

export const useSoundEffects = (questions, currentQuestion, answers) => {
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

  return { correctSound, wrongSound, skipSound, createSuccessEffect, highlightCorrectAnswer };
};