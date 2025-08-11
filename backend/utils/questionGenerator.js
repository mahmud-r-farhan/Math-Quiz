const generateMathQuestion = (difficulty, optionCount) => {
  const categories = ['arithmetic', 'algebra', 'geometry', 'statistics'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  let questionText, correctAnswer, options = new Set();

  const addUniqueOption = (correct, generateWrong) => {
    options.add(correct);
    while (options.size < optionCount) {
      const wrong = generateWrong();
      if (wrong !== correct && !options.has(wrong)) options.add(wrong);
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
  };

  switch (difficulty) {
    case 'easy':
      if (category === 'arithmetic') {
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const op = Math.random() > 0.5 ? '+' : '-';
        questionText = `What is ${a} ${op} ${b}?`;
        correctAnswer = op === '+' ? (a + b).toString() : (a - b).toString();
        options = addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * 10) - 5).toString());
      } else if (category === 'algebra') {
        const a = Math.floor(Math.random() * 10) + 1;
        questionText = `Solve for x: x + ${a} = ${a + 5}`;
        correctAnswer = '5';
        options = addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * 5) - 2).toString());
      } else if (category === 'geometry') {
        const r = Math.floor(Math.random() * 5) + 1;
        questionText = `What is the area of a circle with radius ${r}? (Use π ≈ 3.14)`;
        correctAnswer = (3.14 * r * r).toFixed(2).toString();
        options = addUniqueOption(correctAnswer, () => (3.14 * r * r + Math.random() * 10 - 5).toFixed(2).toString());
      } else {
        questionText = `What is the mean of 2, 4, 6, 8?`;
        correctAnswer = '5';
        options = addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * 5) - 2).toString());
      }
      break;
    case 'normal':
      if (category === 'arithmetic') {
        const a = Math.floor(Math.random() * 50) + 10;
        const b = Math.floor(Math.random() * 50) + 10;
        questionText = `What is ${a} × ${b}?`;
        correctAnswer = (a * b).toString();
        options = addUniqueOption(correctAnswer, () => (a * b + Math.floor(Math.random() * 20) - 10).toString());
      } else if (category === 'algebra') {
        const a = Math.floor(Math.random() * 10) + 1;
        questionText = `Solve for x: ${a}x = ${a * 3}`;
        correctAnswer = '3';
        options = addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * 5) - 2).toString());
      } else if (category === 'geometry') {
        const a = Math.floor(Math.random() * 10) + 1;
        questionText = `What is the perimeter of a rectangle with length ${a} and width ${a + 2}?`;
        correctAnswer = (2 * (a + (a + 2))).toString();
        options = addUniqueOption(correctAnswer, () => (2 * (a + (a + 2)) + Math.floor(Math.random() * 10) - 5).toString());
      } else {
        questionText = `What is the median of 3, 5, 7, 9, 11?`;
        correctAnswer = '7';
        options = addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * 5) - 2).toString());
      }
      break;
    case 'hard':
      if (category === 'arithmetic') {
        const a = Math.floor(Math.random() * 100) + 10;
        const b = Math.floor(Math.random() * 10) + 2;
        questionText = `What is ${a} ÷ ${b}? (Round to 2 decimal places)`;
        correctAnswer = (a / b).toFixed(2).toString();
        options = addUniqueOption(correctAnswer, () => (a / b + Math.random() * 5 - 2.5).toFixed(2).toString());
      } else if (category === 'algebra') {
        const a = Math.floor(Math.random() * 5) + 1;
        questionText = `Solve for x: x^2 - ${a * a} = 0`;
        correctAnswer = a.toString();
        options = addUniqueOption(correctAnswer, () => (a + Math.floor(Math.random() * 5) - 2).toString());
      } else if (category === 'geometry') {
        const a = Math.floor(Math.random() * 10) + 3;
        questionText = `What is the volume of a cube with side length ${a}?`;
        correctAnswer = (a * a * a).toString();
        options = addUniqueOption(correctAnswer, () => (a * a * a + Math.floor(Math.random() * 20) - 10).toString());
      } else {
        questionText = `What is the standard deviation of 1, 2, 3, 4, 5? (Round to 2 decimal places)`;
        correctAnswer = '1.41';
        options = addUniqueOption(correctAnswer, () => (parseFloat(correctAnswer) + (Math.random() * 0.5 - 0.25)).toFixed(2).toString());
      }
      break;
    case 'genius':
      if (category === 'arithmetic') {
        const a = Math.floor(Math.random() * 1000) + 100;
        const b = Math.floor(Math.random() * 100) + 10;
        questionText = `What is (${a} × ${b}) ÷ ${b}?`;
        correctAnswer = a.toString();
        options = addUniqueOption(correctAnswer, () => (a + Math.floor(Math.random() * 50) - 25).toString());
      } else if (category === 'algebra') {
        const a = Math.floor(Math.random() * 5) + 2;
        questionText = `Solve for x: ${a}x^2 - ${a * 2}x + ${a} = 0`;
        correctAnswer = '1';
        options = addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * 5) - 2).toString());
      } else if (category === 'geometry') {
        const r = Math.floor(Math.random() * 10) + 5;
        questionText = `What is the surface area of a sphere with radius ${r}? (Use π ≈ 3.14)`;
        correctAnswer = (4 * 3.14 * r * r).toFixed(2).toString();
        options = addUniqueOption(correctAnswer, () => (4 * 3.14 * r * r + Math.random() * 50 - 25).toFixed(2).toString());
      } else {
        questionText = `What is the variance of 2, 4, 6, 8, 10? (Round to 2 decimal places)`;
        correctAnswer = '8.00';
        options = addUniqueOption(correctAnswer, () => (parseFloat(correctAnswer) + (Math.random() * 2 - 1)).toFixed(2).toString());
      }
      break;
    default:
      throw new Error('Invalid difficulty level');
  }

  return { _id: Math.random().toString(36).substring(2, 15), questionText, options, correctAnswer, category };
};

module.exports = { generateMathQuestion };