import React, { useState } from 'react';

function Homepage({ startGame }) {
  const [difficulty, setDifficulty] = useState('easy');
  const [operation, setOperation] = useState('mix');

  const handleSubmit = (e) => {
    e.preventDefault();
    startGame(difficulty, operation);
  };

  return (
    <div className="homepage">
      <h2>Select Game Options</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="difficulty">Difficulty:</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="operation">Operation:</label>
          <select
            id="operation"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
          >
            <option value="mix">Mix</option>
            <option value="addition">Addition</option>
            <option value="subtraction">Subtraction</option>
            <option value="multiplication">Multiplication</option>
            <option value="division">Division</option>
          </select>
        </div>
        <button type="submit" className="start-btn">Start Game</button>
      </form>
    </div>
  );
}

export default Homepage;