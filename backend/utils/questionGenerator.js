const generateMathQuestion = (difficulty, optionCount) => {
  const categories = ['arithmetic', 'algebra', 'geometry', 'statistics'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  let questionText, correctAnswer, options = [];

  switch (difficulty) {
    case 'easy':
      if (category === 'arithmetic') {
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        questionText = `What is ${a} + ${b}?`;
        correctAnswer = (a + b).toString();
        options = [correctAnswer];
        while (options.length < optionCount) {
          const wrong = (a + b + Math.floor(Math.random() * 10) - 5).toString();
          if (!options.includes(wrong)) options.push(wrong);
        }
      } else if (category === 'algebra') {
        const a = Math.floor(Math.random() * 10) + 1;
        questionText = `Solve for x: x + ${a} = ${a + 5}`;
        correctAnswer = '5';
        options = [correctAnswer, '3', '4', '6', '7', '8'].slice(0, optionCount);
      } else if (category === 'geometry') {
        const r = Math.floor(Math.random() * 5) + 1;
        questionText = `What is the area of a circle with radius ${r}? (Use π ≈ 3.14)`;
        correctAnswer = (3.14 * r * r).toFixed(2).toString();
        options = [correctAnswer];
        while (options.length < optionCount) {
          const wrong = (3.14 * r * r + Math.random() * 10 - 5).toFixed(2).toString();
          if (!options.includes(wrong)) options.push(wrong);
        }
      } else {
        questionText = `What is the mean of 2, 4, 6?`;
        correctAnswer = '4';
        options = [correctAnswer, '3', '5', '6', '7', '8'].slice(0, optionCount);
      }
      break;
    // ... (similar logic for normal, hard, genius - abbreviated for brevity)
  }

  options = options.sort(() => Math.random() - 0.5);
  return { _id: Math.random().toString(36).substring(2, 15), questionText, options, correctAnswer, category };
};

module.exports = { generateMathQuestion };