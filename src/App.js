import React, { useState, useEffect } from 'react';
import * as math from 'mathjs';
import './App.css';
import Homepage from './components/Homepage';
import Game from './components/Game';

// Data structure for student information and question history
const initialStudentData = {
  username: '',
  difficulty: 'easy',
  questionHistory: [],
};

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [operation, setOperation] = useState('mix');
  const [username, setUsername] = useState('');
  const [studentData, setStudentData] = useState(initialStudentData);

  useEffect(() => {
    // Load student data from local storage on component mount
    const savedData = localStorage.getItem('studentData');
    if (savedData) {
      setStudentData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    // Save student data to local storage whenever it changes
    localStorage.setItem('studentData', JSON.stringify(studentData));
  }, [studentData]);

  const startGame = (selectedDifficulty, selectedOperation, enteredUsername) => {
    setDifficulty(selectedDifficulty);
    setOperation(selectedOperation);
    setUsername(enteredUsername);
    setGameStarted(true);
    setStudentData(prevData => ({
      ...prevData,
      username: enteredUsername,
      difficulty: selectedDifficulty,
    }));
  };

  const endGame = () => {
    setGameStarted(false);
    // Analyze performance and update difficulty
    updateDifficultyBasedOnPerformance();
  };

  const updateDifficultyBasedOnPerformance = () => {
    const recentQuestions = studentData.questionHistory.slice(-10);
    const correctCount = recentQuestions.filter(q => q.isCorrect).length;
    const successRate = correctCount / recentQuestions.length;

    let newDifficulty = difficulty;
    if (successRate > 0.8 && difficulty !== 'hard') {
      newDifficulty = difficulty === 'easy' ? 'medium' : 'hard';
    } else if (successRate < 0.4 && difficulty !== 'easy') {
      newDifficulty = difficulty === 'hard' ? 'medium' : 'easy';
    }

    setDifficulty(newDifficulty);
    setStudentData(prevData => ({
      ...prevData,
      difficulty: newDifficulty,
    }));
  };

  const handleAnswerSubmit = (question, userAnswer, isCorrect) => {
    const errorType = isCorrect ? undefined : analyzeError(question, userAnswer);
    const newQuestion = {
      question: `${question.num1} ${question.operator} ${question.num2}`,
      answer: question.correctAnswer,
      userAnswer,
      isCorrect,
      errorType,
    };

    setStudentData(prevData => ({
      ...prevData,
      questionHistory: [...prevData.questionHistory, newQuestion],
    }));
  };

  const analyzeError = (question, userAnswer) => {
    const { num1, num2, operator } = question;
    const expectedAnswer = math.evaluate(`${num1} ${operator} ${num2}`);

    if (Math.abs(userAnswer - expectedAnswer) < 0.001) {
      return 'roundingError';
    }

    switch (operator) {
      case '+':
        if (userAnswer === num1 + num2 + 10 || userAnswer === num1 + num2 - 10) {
          return 'carryError';
        }
        break;
      case '-':
        if (userAnswer === num1 - num2 + 10 || userAnswer === num1 - num2 - 10) {
          return 'borrowError';
        }
        break;
      case '*':
        if (userAnswer === num1 * 10 + num2 || userAnswer === num1 + num2 * 10) {
          return 'placeValueError';
        }
        break;
      case '/':
        if (userAnswer === num1 / 10 || userAnswer === num1 * 10) {
          return 'decimalError';
        }
        break;
      default:
        break;
    }

    return 'calculationError';
  };

  return (
    <div className="container">
      <header>
        <h1>ADHD-Friendly Math Quiz</h1>
      </header>
      <main>
        {!gameStarted ? (
          <Homepage startGame={startGame} />
        ) : (
          <Game
            difficulty={difficulty}
            operation={operation}
            endGame={endGame}
            onAnswerSubmit={handleAnswerSubmit}
            username={username}
          />
        )}
      </main>
    </div>
  );
}

export default App;