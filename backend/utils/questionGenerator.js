const { v4: uuidv4 } = require('uuid');

function generateMathQuestion(difficulty, optionCount) {
  const categories = ['arithmetic', 'algebra', 'geometry', 'statistics'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  let questionText, correctAnswer, options = new Set();

  const addUniqueOption = (correct, generateWrong, existingOptions = new Set()) => {
    // Add the correct answer to the Set
    existingOptions.add(correct);
    // Generate wrong answers until we have enough unique options
    while (existingOptions.size < optionCount) {
      const wrong = generateWrong();
      if (wrong !== correct && !existingOptions.has(wrong) && !isNaN(wrong) && wrong !== null && wrong !== undefined) {
        existingOptions.add(wrong);
      }
    }
    // Return a shuffled array of options
    return Array.from(existingOptions).sort(() => Math.random() - 0.5);
  };

  const getWrongAnswerRange = () => {
    const ranges = {
      easy: Math.max(5, Math.abs(parseFloat(correctAnswer)) * 0.5),
      normal: Math.max(10, Math.abs(parseFloat(correctAnswer)) * 0.4),
      hard: Math.max(15, Math.abs(parseFloat(correctAnswer)) * 0.3),
      genius: Math.max(20, Math.abs(parseFloat(correctAnswer)) * 0.2),
    };
    return Math.floor(ranges[difficulty] || 10);
  };

  const generateConfusingOptions = () => {
    const distractors = [];
    const operation = questionText;
    if (difficulty === 'genius') {
      if (operation.includes('%')) {
        const [, dividend, num2] = operation.match(/(\d+) % (\d+)/) || [];
        if (dividend && num2) {
          distractors.push(Math.floor(parseInt(dividend) / parseInt(num2)).toString());
          distractors.push((parseInt(dividend) % (parseInt(num2) + 1)).toString());
        }
      } else if (operation.includes('^2')) {
        const [, num1] = operation.match(/(\d+)\^2/) || [];
        if (num1) {
          distractors.push((parseInt(num1) * (parseInt(num1) + 1)).toString());
          distractors.push((parseInt(num1) * (parseInt(num1) - 1)).toString());
        }
      } else if (operation.includes('sqrt')) {
        const [, num1] = operation.match(/sqrt{(\d+)}/) || [];
        if (num1) {
          distractors.push(Math.round(Math.sqrt(num1) + 1).toString());
          distractors.push(Math.round(Math.sqrt(num1) - 1).toString());
        }
      } else if (operation.includes('% of')) {
        const [, a, b] = operation.match(/(\d+)% of (\d+)/) || [];
        if (a && b) {
          distractors.push(Math.round((parseInt(a) + 1) / 100 * b).toString());
          distractors.push(Math.round((parseInt(a) - 1) / 100 * b).toString());
        }
      } else if (operation.includes('x =')) {
        const [, m, c, xVal] = operation.match(/(\d+)x \+ (\d+) where x = (\d+)/) || [];
        if (m && c && xVal) {
          distractors.push((parseInt(m) * parseInt(xVal)).toString());
          distractors.push((parseInt(m) * (parseInt(xVal) + 1) + parseInt(c)).toString());
        }
      } else if (operation.includes('x(')) {
        const [, xQuad] = operation.match(/x = (\d+)/) || [];
        if (xQuad) {
          distractors.push((parseInt(xQuad) + 2).toString());
          distractors.push((parseInt(xQuad) - 2).toString());
        }
      } else {
        const [, num1, op, num2] = operation.match(/(\d+) ([+\-×÷]) (\d+)/) || [];
        if (num1 && num2 && op) {
          if (op === '+') distractors.push((parseInt(num1) - parseInt(num2)).toString());
          if (op === '-') distractors.push((parseInt(num1) + parseInt(num2)).toString());
          if (op === '×') distractors.push((parseInt(num1) + parseInt(num2)).toString());
          if (op === '÷') distractors.push((parseInt(num1) * parseInt(num2)).toString());
        }
      }
    } else {
      const [, num1, op, num2] = operation.match(/(\d+) ([+\-×÷]) (\d+)/) || [];
      if (num1 && num2 && op) {
        if (op === '+') distractors.push((parseInt(num1) - parseInt(num2)).toString());
        if (op === '-') distractors.push((parseInt(num1) + parseInt(num2)).toString());
        if (op === '×') distractors.push((parseInt(num1) + parseInt(num2)).toString());
        if (op === '÷') distractors.push((parseInt(num1) * parseInt(num2)).toString());
      }
    }
    return distractors.filter(opt => opt !== correctAnswer && !isNaN(opt) && opt !== null && opt !== undefined);
  };

  switch (difficulty) {
    case 'easy':
      if (category === 'arithmetic') {
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const op = Math.random() > 0.5 ? '+' : '-';
        questionText = `${a} ${op} ${b}`;
        correctAnswer = op === '+' ? (a + b).toString() : (a - b).toString();
        options = new Set(addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * getWrongAnswerRange() * 2) - getWrongAnswerRange()).toString()));
      } else if (category === 'algebra') {
        const a = Math.floor(Math.random() * 10) + 1;
        questionText = `x + ${a} = ${a + 5}`;
        correctAnswer = '5';
        options = new Set(addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * 5) - 2).toString()));
      } else if (category === 'geometry') {
        const r = Math.floor(Math.random() * 5) + 1;
        questionText = `\\text{Area of circle with radius } ${r} \\text{ (use } \\pi \\approx 3.14\\text{)}`;
        correctAnswer = (3.14 * r * r).toFixed(2).toString();
        options = new Set(addUniqueOption(correctAnswer, () => (3.14 * r * r + Math.random() * getWrongAnswerRange() - getWrongAnswerRange() / 2).toFixed(2).toString()));
      } else {
        questionText = `\\text{Mean of } 2, 4, 6, 8`;
        correctAnswer = '5';
        options = new Set(addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * 5) - 2).toString()));
      }
      break;
    case 'normal':
      if (category === 'arithmetic') {
        const a = Math.floor(Math.random() * 50) + 10;
        const b = Math.floor(Math.random() * 50) + 10;
        const op = ['+', '-', '×'][Math.floor(Math.random() * 3)];
        questionText = `${a} ${op} ${b}`;
        correctAnswer = op === '+' ? (a + b).toString() : op === '-' ? (a - b).toString() : (a * b).toString();
        options = new Set(addUniqueOption(correctAnswer, () => {
          const offset = Math.floor(Math.random() * getWrongAnswerRange() * 2) - getWrongAnswerRange();
          return (parseInt(correctAnswer) + offset).toString();
        }));
      } else if (category === 'algebra') {
        const a = Math.floor(Math.random() * 10) + 1;
        questionText = `${a}x = ${a * 3}`;
        correctAnswer = '3';
        options = new Set(addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * 5) - 2).toString()));
      } else if (category === 'geometry') {
        const a = Math.floor(Math.random() * 10) + 1;
        questionText = `\\text{Perimeter of rectangle with length } ${a} \\text{ and width } ${a + 2}`;
        correctAnswer = (2 * (a + (a + 2))).toString();
        options = new Set(addUniqueOption(correctAnswer, () => (2 * (a + (a + 2)) + Math.floor(Math.random() * getWrongAnswerRange()) - getWrongAnswerRange() / 2).toString()));
      } else {
        questionText = `\\text{Median of } 3, 5, 7, 9, 11`;
        correctAnswer = '7';
        options = new Set(addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * 5) - 2).toString()));
      }
      break;
    case 'hard':
      if (category === 'arithmetic') {
        const a = Math.floor(Math.random() * 100) + 10;
        const b = Math.floor(Math.random() * 10) + 2;
        const op = ['+', '-', '×', '÷'][Math.floor(Math.random() * 4)];
        questionText = op === '÷' ? `${a * b} \\div ${b}` : `${a} ${op} ${b}`;
        correctAnswer = op === '+' ? (a + b).toString() :
                       op === '-' ? (a - b).toString() :
                       op === '×' ? (a * b).toString() :
                       (a).toString();
        options = new Set(addUniqueOption(correctAnswer, () => {
          const offset = Math.floor(Math.random() * getWrongAnswerRange() * 2) - getWrongAnswerRange();
          return (parseFloat(correctAnswer) + offset).toFixed(op === '÷' ? 2 : 0).toString();
        }));
      } else if (category === 'algebra') {
        const a = Math.floor(Math.random() * 5) + 1;
        questionText = `x^2 - ${a * a} = 0`;
        correctAnswer = a.toString();
        options = new Set(addUniqueOption(correctAnswer, () => (a + Math.floor(Math.random() * 5) - 2).toString()));
      } else if (category === 'geometry') {
        const a = Math.floor(Math.random() * 10) + 3;
        questionText = `\\text{Volume of cube with side length } ${a}`;
        correctAnswer = (a * a * a).toString();
        options = new Set(addUniqueOption(correctAnswer, () => (a * a * a + Math.floor(Math.random() * getWrongAnswerRange()) - getWrongAnswerRange() / 2).toString()));
      } else {
        questionText = `\\text{Standard deviation of } 1, 2, 3, 4, 5 \\text{ (round to 2 decimal places)}`;
        correctAnswer = '1.41';
        options = new Set(addUniqueOption(correctAnswer, () => (parseFloat(correctAnswer) + (Math.random() * 0.5 - 0.25)).toFixed(2).toString()));
      }
      break;
    case 'genius':
      const operations = ['+', '-', '×', '÷', '^', '√', '%', 'algebra', 'linear', 'quadratic'];
      const operation = operations[Math.floor(Math.random() * operations.length)];
      if (category === 'arithmetic') {
        if (operation === '+') {
          const a = Math.floor(Math.random() * 200) + 100;
          const b = Math.floor(Math.random() * 200) + 100;
          questionText = `${a} + ${b}`;
          correctAnswer = (a + b).toString();
          options = new Set(addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * getWrongAnswerRange()) - getWrongAnswerRange() / 2).toString()));
        } else if (operation === '-') {
          const a = Math.floor(Math.random() * 200) + 100;
          const b = Math.floor(Math.random() * 100) + 50;
          questionText = `${a} - ${b}`;
          correctAnswer = (a - b).toString();
          options = new Set(addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * getWrongAnswerRange()) - getWrongAnswerRange() / 2).toString()));
        } else if (operation === '×') {
          const a = Math.floor(Math.random() * 25) + 1;
          const b = Math.floor(Math.random() * 20) + 1;
          questionText = `${a} \\times ${b}`;
          correctAnswer = (a * b).toString();
          options = new Set(addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * getWrongAnswerRange()) - getWrongAnswerRange() / 2).toString()));
        } else if (operation === '÷') {
          const b = Math.floor(Math.random() * 20) + 1;
          const quotient = Math.floor(Math.random() * 25) + 1;
          const a = b * quotient;
          questionText = `${a} \\div ${b}`;
          correctAnswer = quotient.toString();
          options = new Set(addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * getWrongAnswerRange()) - getWrongAnswerRange() / 2).toString()));
        } else if (operation === '^') {
          const a = Math.floor(Math.random() * 10) + 2;
          questionText = `${a}^2`;
          correctAnswer = (a * a).toString();
          options = new Set(addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * getWrongAnswerRange()) - getWrongAnswerRange() / 2).toString()));
        } else if (operation === '√') {
          const square = Math.floor(Math.random() * 15) + 1;
          questionText = `\\sqrt{${square * square}}`;
          correctAnswer = square.toString();
          options = new Set(addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * getWrongAnswerRange()) - getWrongAnswerRange() / 2).toString()));
        } else if (operation === '%') {
          const dividend = Math.floor(Math.random() * 90) + 10;
          const num2 = Math.floor(Math.random() * 9) + 1;
          const remainder = Math.floor(Math.random() * num2);
          const fullDividend = num2 * Math.floor(dividend / num2) + remainder;
          questionText = `${fullDividend} \\% ${num2}`;
          correctAnswer = remainder.toString();
          options = new Set(addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * getWrongAnswerRange()) - getWrongAnswerRange() / 2).toString()));
        }
      } else if (category === 'algebra') {
        if (operation === 'algebra') {
          const a = Math.floor(Math.random() * 10) + 1;
          const b = Math.floor(Math.random() * 20) + 1;
          questionText = `${a}\\% \\text{ of } ${b}`;
          correctAnswer = Math.round((a / 100) * b).toString();
          options = new Set(addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * getWrongAnswerRange()) - getWrongAnswerRange() / 2).toString()));
        } else if (operation === 'linear') {
          const m = Math.floor(Math.random() * 5) + 1;
          const c = Math.floor(Math.random() * 10) + 1;
          const xVal = Math.floor(Math.random() * 10) + 1;
          questionText = `${m}x + ${c} \\text{ where } x = ${xVal}`;
          correctAnswer = (m * xVal + c).toString();
          options = new Set(addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * getWrongAnswerRange()) - getWrongAnswerRange() / 2).toString()));
        } else if (operation === 'quadratic') {
          const aQuad = Math.floor(Math.random() * 3) + 1;
          const xQuad = Math.floor(Math.random() * 5) + 1;
          questionText = `${aQuad}x(x + 2) = ${aQuad * xQuad * (xQuad + 2)}, \\ x = ?`;
          correctAnswer = xQuad.toString();
          options = new Set(addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * getWrongAnswerRange()) - getWrongAnswerRange() / 2).toString()));
        } else {
          const a = Math.floor(Math.random() * 5) + 2;
          questionText = `${a}x^2 - ${a * 2}x + ${a} = 0`;
          correctAnswer = '1';
          options = new Set(addUniqueOption(correctAnswer, () => (parseInt(correctAnswer) + Math.floor(Math.random() * 5) - 2).toString()));
        }
      } else if (category === 'geometry') {
        const r = Math.floor(Math.random() * 10) + 5;
        questionText = `\\text{Surface area of sphere with radius } ${r} \\text{ (use } \\pi \\approx 3.14\\text{)}`;
        correctAnswer = (4 * 3.14 * r * r).toFixed(2).toString();
        options = new Set(addUniqueOption(correctAnswer, () => (4 * 3.14 * r * r + Math.random() * getWrongAnswerRange() - getWrongAnswerRange() / 2).toFixed(2).toString()));
      } else {
        questionText = `\\text{Variance of } 2, 4, 6, 8, 10 \\text{ (round to 2 decimal places)}`;
        correctAnswer = '8.00';
        options = new Set(addUniqueOption(correctAnswer, () => (parseFloat(correctAnswer) + (Math.random() * 2 - 1)).toFixed(2).toString()));
      }
      break;
    default:
      throw new Error('Invalid difficulty level');
  }

  // Merge confusing options with generated options
  const confusingOptions = generateConfusingOptions();
  options = new Set(addUniqueOption(correctAnswer, () => {
    const randomIndex = Math.floor(Math.random() * (confusingOptions.length + 1));
    if (randomIndex < confusingOptions.length) {
      return confusingOptions[randomIndex];
    }
    const offset = Math.floor(Math.random() * getWrongAnswerRange() * 2) - getWrongAnswerRange();
    return (parseFloat(correctAnswer) + offset).toFixed(correctAnswer.includes('.') ? 2 : 0).toString();
  }, options));

  const question = {
    _id: uuidv4(),
    questionText: questionText || 'Default question',
    options: Array.from(options),
    correctAnswer: correctAnswer || '0',
    category: category || 'arithmetic',
  };

  // Validate question
  if (!question._id || !question.questionText || !question.correctAnswer || !question.options || question.options.length !== optionCount) {
    console.error('Generated question missing required fields or invalid options:', {
      questionId: question._id,
      questionText: question.questionText,
      correctAnswer: question.correctAnswer,
      options: question.options,
      optionCount,
    });
    throw new Error('Invalid question generated');
  }

  return question;
}

module.exports = { generateMathQuestion };