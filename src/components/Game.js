import React, { useState, useEffect, useCallback } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion, AnimatePresence } from 'framer-motion';

function Game({ difficulty, operation, endGame, onAnswerSubmit }) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [currentOperator, setCurrentOperator] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [timer, setTimer] = useState(30);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);

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
    setTimer(30);
    setShowEncouragement(false);
  }, [difficulty, operation]);

  useEffect(() => {
    generateNewQuestion();
  }, [generateNewQuestion]);

  useEffect(() => {
    let interval;
    if (!questionAnswered && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && !questionAnswered) {
      handleSubmit();
    }
    return () => clearInterval(interval);
  }, [timer, questionAnswered]);

  const generateQuestion = (difficulty, operation) => {
    let num1, num2, operator, correctAnswer;

    if (difficulty === 'easy') {
      num1 = Math.floor(Math.random() * 9) + 1;
      num2 = Math.floor(Math.random() * 9) + 1;
    } else if (difficulty === 'medium') {
      num1 = Math.floor(Math.random() * 41) + 10;
      num2 = Math.floor(Math.random() * 41) + 10;
    } else {
      num1 = Math.floor(Math.random() * 51) + 50;
      num2 = Math.floor(Math.random() * 51) + 50;
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
      correctAnswer = Math.floor(num1 / num2);
      num1 = correctAnswer * num2;
    } else {
      correctAnswer = calculateAnswer(num1, num2, operator);
    }

    if (operator === '-' && num1 < num2) {
      [num1, num2] = [num2, num1];
      correctAnswer = num1 - num2;
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
      case '/': return Math.floor(a / b);
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

  const handleSubmit = () => {
    if (selectedAnswer === '') {
      setSelectedAnswer(correctAnswer);
    }
    const isCorrectAnswer = selectedAnswer === correctAnswer;
    setIsCorrect(isCorrectAnswer);
    setQuestionAnswered(true);
    setQuestionsAnswered(prev => prev + 1);
    
    if (isCorrectAnswer) {
      const pointsEarned = Math.floor(timer * (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3));
      setScore(prev => prev + pointsEarned);
      setStreak(prev => prev + 1);
      if (streak > 0 && streak % 5 === 0) {
        setShowEncouragement(true);
      }
    } else {
      setStreak(0);
    }

    onAnswerSubmit({
      num1,
      num2,
      operator: currentOperator,
      correctAnswer
    }, selectedAnswer, isCorrectAnswer);
  };

  const handleAnswerChange = (event) => {
    setSelectedAnswer(event.target.value);
  };

  const getOperatorSymbol = (operator) => {
    switch (operator) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
      case '/': return '÷';
      default: return operator;
    }
  };

  return (
    <div className="game">
      <div className="stats">
        <div className="score">Score: {score}</div>
        <div className="streak">Streak: {streak}</div>
        <div className="questions">Questions: {questionsAnswered}</div>
      </div>
      <div className="question-container">
        <motion.p
          key={`${num1}${currentOperator}${num2}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          What is {num1} {getOperatorSymbol(currentOperator)} {num2}?
        </motion.p>
      </div>
      <div className="timer">
        <CircularProgressbar
          value={timer}
          maxValue={30}
          text={`${timer}s`}
          styles={buildStyles({
            textColor: timer > 10 ? '#4CAF50' : timer > 5 ? '#FFA500' : '#FF0000',
            pathColor: timer > 10 ? '#4CAF50' : timer > 5 ? '#FFA500' : '#FF0000',
            trailColor: '#d6d6d6',
          })}
        />
      </div>
      <form className="answer-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div className="options-container">
          {answers.map((answer, index) => (
            <motion.div
              className="option"
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <input
                type="radio"
                id={`answer-${index}`}
                name="answer"
                value={answer}
                checked={selectedAnswer === answer}
                onChange={handleAnswerChange}
                disabled={questionAnswered}
              />
              <label
                htmlFor={`answer-${index}`}
                className={questionAnswered ? (answer === correctAnswer ? 'correct' : (selectedAnswer === answer ? 'incorrect' : '')) : ''}
              >
                {answer}
              </label>
            </motion.div>
          ))}
        </div>
        {!questionAnswered && (
          <motion.button
            type="submit"
            className="submit-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Submit Answer
          </motion.button>
        )}
      </form>
      <AnimatePresence>
        {questionAnswered && (
          <motion.div
            className="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <p>{isCorrect ? "Correct!" : `Incorrect. The correct answer was ${correctAnswer}.`}</p>
            <motion.button
              className="next-btn"
              onClick={generateNewQuestion}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next Question
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            className="encouragement"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <p>Great job! You're on a {streak} question streak!</p>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        className="end-game-btn"
        onClick={endGame}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        End Game
      </motion.button>
    </div>
  );
}

export default Game;