import React, { useState } from 'react';
import './App.css';
import Homepage from './components/Homepage.js';
import Game from './components/Game.js';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState('');
  const [operation, setOperation] = useState('');

  const startGame = (selectedDifficulty, selectedOperation) => {
    setDifficulty(selectedDifficulty);
    setOperation(selectedOperation);
    setGameStarted(true);
  };

  const endGame = () => {
    setGameStarted(false);
    setDifficulty('');
    setOperation('');
  };

  return (
    <div className="container">
      <header>
        <h1>Math Quiz</h1>
      </header>
      <main>
        {!gameStarted ? (
          <Homepage startGame={startGame} />
        ) : (
          <Game difficulty={difficulty} operation={operation} endGame={endGame} />
        )}
      </main>
    </div>
  );
}

export default App;