import React, { useState, useEffect, useCallback } from 'react';

function Game({ difficulty, operation, endGame }) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [currentOperator, setCurrentOperator] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [questionAnswered, setQuestionAnswered] = useState(false);

  const generateNewQuestion = useCallback(() => {
    const questionData = generateQuestion(difficulty, operation);
    setNum1(questionData.num1);
    setNum2(questionData.num2);
    setCurrentOperator(questionData.operator);
    setCorrectAnswer(questionData.correctAnswer);
    setAnswers(questionData.answers);
    setSelectedAnswer('');
    setIsCorrect(null);
    setQuestionAnswered(false);
  }, [difficulty, operation]);

  useEffect(() => {
    generateNewQuestion();
  }, [generateNewQuestion]);

  const generateQuestion = (difficulty, operation) => {
    let num1, num2, operator, correctAnswer;

    // Generate numbers based on difficulty
    if (difficulty === 'easy') {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
    } else if (difficulty === 'medium') {
      num1 = Math.floor(Math.random() * 50) + 10;
      num2 = Math.floor(Math.random() * 50) + 10;
    } else { // hard
      num1 = Math.floor(Math.random() * 100) + 50;
      num2 = Math.floor(Math.random() * 100) + 50;
    }

    if (operation === 'mix') {
      const operators = ['+', '-', '*', '/'];
      operator = operators[Math.floor(Math.random() * operators.length)];
    } else {
      operator = operation === 'addition' ? '+' :
                 operation === 'subtraction' ? '-' :
                 operation === 'multiplication' ? '*' : '/';
    }

    if (operator === '/') {
      correctAnswer = num1;
      num1 = num1 * num2;
    } else {
      correctAnswer = calculateAnswer(num1, num2, operator);
    }

    const uniqueAnswers = generateUniqueAnswers(correctAnswer.toString(), difficulty, operator, num1, num2);
    const shuffledAnswers = shuffleArray(uniqueAnswers);

    return {
      num1,
      num2,
      operator,
      correctAnswer: correctAnswer.toString(),
      answers: shuffledAnswers,
    };
  };

  const calculateAnswer = (a, b, operator) => {
    switch (operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return a / b;
      default: throw new Error('Invalid operator');
    }
  };

  const generateUniqueAnswers = (correctAnswer, difficulty, operator, num1, num2, count = 4) => {
    const answers = new Set();
    const correctNum = parseInt(correctAnswer);
    answers.add(correctNum.toString());

    const commonMistakes = [
      () => (num1 + num2).toString(),
      () => Math.abs(num1 - num2).toString(),
      () => (num1 * (num2 + 1)).toString(),
      () => (num1 * (num2 - 1)).toString(),
      () => ((num1 + 1) * num2).toString(), 
      () => ((num1 - 1) * num2).toString(), 
    ];

    while (answers.size < count) {
      let newAnswer;
      if (operator === '*' && Math.random() < 0.7) {
        newAnswer = commonMistakes[Math.floor(Math.random() * commonMistakes.length)]();
      } else if (operator === '/') {
        const offset = Math.floor(Math.random() * 3) + 1;
        newAnswer = (correctNum + (Math.random() < 0.5 ? offset : -offset) * num2).toString();
      } else {
        const offset = Math.floor(Math.random() * 5) + 1;
        newAnswer = (correctNum + (Math.random() < 0.5 ? offset : -offset)).toString();
      }

      if (newAnswer !== correctAnswer && !answers.has(newAnswer) && parseInt(newAnswer) > 0) {
        answers.add(newAnswer);
      }
    }

    return Array.from(answers);
  };

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedAnswer === '') {
      alert("Please select an answer!");
      return;
    }
    const isCorrectAnswer = selectedAnswer === correctAnswer;
    setIsCorrect(isCorrectAnswer);
    setQuestionAnswered(true);
  };

  const handleAnswerChange = (event) => {
    setSelectedAnswer(event.target.value);
  };

  return (
    <div className="game">
      <div className="question-container">
        <p>What is {num1} {currentOperator} {num2}?</p>
      </div>
      <form className="answer-form" onSubmit={handleSubmit}>
        <div className="options-container">
          {answers.map((answer, index) => (
            <div className="option" key={index}>
              <input
                type="radio"
                id={`answer-${index}`}
                name="answer"
                value={answer}
                checked={selectedAnswer === answer}
                onChange={handleAnswerChange}
                disabled={questionAnswered}
              />
              <label htmlFor={`answer-${index}`}>{answer}</label>
            </div>
          ))}
        </div>
        {!questionAnswered && (
          <button type="submit" className="submit-btn">Submit Answer</button>
        )}
      </form>
      {questionAnswered && (
        <div className="result">
          <p>You answered: {selectedAnswer}. {isCorrect ? "Correct!" : `Incorrect. The correct answer was ${correctAnswer}.`}</p>
          <button className="next-btn" onClick={generateNewQuestion}>Next Question</button>
        </div>
      )}
      <button className="end-game-btn" onClick={endGame}>End Game</button>
    </div>
  );
}

export default Game;