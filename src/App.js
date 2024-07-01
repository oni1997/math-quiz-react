import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    generateQuestion();
  }, []);

  const generateQuestion = () => {
    const number1 = Math.floor(Math.random() * 10) + 1;
    const number2 = Math.floor(Math.random() * 10) + 1;
    const correct = number1 + number2;
    const uniqueAnswers = generateUniqueAnswers(correct);
    const shuffledAnswers = shuffleArray(uniqueAnswers);

    setNum1(number1);
    setNum2(number2);
    setCorrectAnswer(correct);
    setAnswers(shuffledAnswers);
    setSelectedAnswer('');
    setIsCorrect(null);
  };

  const generateUniqueAnswers = (correctAnswer, count = 4) => {
    const answers = new Set();
    answers.add(correctAnswer);

    while (answers.size < count) {
      const offset = [-2, -1, 1, 2][Math.floor(Math.random() * 4)];
      const newAnswer = correctAnswer + offset;
      if (newAnswer > 0) {
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
    const isCorrectAnswer = parseInt(selectedAnswer) === correctAnswer;
    setIsCorrect(isCorrectAnswer);
  };

  const handleAnswerChange = (event) => {
    setSelectedAnswer(event.target.value);
  };

  return (
    <div className="container">
      <header>
        <h1>Math Quiz</h1>
      </header>
      <main>
        <div id="question" className="question-container">
          <p>What is {num1} + {num2}?</p>
        </div>
        <form id="answer-form" className="answer-form" onSubmit={handleSubmit}>
          <div className="options-container">
            {answers.map((answer, index) => (
              <div className="option" key={index}>
                <input
                  type="radio"
                  id={`answer-${index}`}
                  name="answer"
                  value={answer}
                  checked={selectedAnswer === answer.toString()}
                  onChange={handleAnswerChange}
                />
                <label htmlFor={`answer-${index}`}>{answer}</label>
              </div>
            ))}
          </div>
          <button type="submit" className="submit-btn">Submit Answer</button>
        </form>
        {isCorrect !== null && (
          <div className="result">
            <p>You answered: {selectedAnswer}. {isCorrect ? "Correct!" : `Incorrect. The correct answer was ${correctAnswer}.`}</p>
            <button className="next-btn" onClick={generateQuestion}>Next Question</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
