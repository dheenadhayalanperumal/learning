import React, { useState, useCallback } from 'react';
import GameMenu from './components/GameMenu.jsx';
import LetterTracingSimple from './components/LetterTracingSimple.jsx';
import CompletionScreen from './components/CompletionScreen.jsx';

const App = () => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'completed'
  const [selectedLetterType, setSelectedLetterType] = useState(null);

  const handleLetterTypeSelect = useCallback((letterType) => {
    setSelectedLetterType(letterType);
    setGameState('playing');
  }, []);

  const handleGameComplete = useCallback(() => {
    setGameState('completed');
  }, []);

  const handleBackToMenu = useCallback(() => {
    setGameState('menu');
    setSelectedLetterType(null);
  }, []);

  const handleRestart = useCallback(() => {
    setGameState('playing');
    // Keep the same letter type for restart
  }, []);


  return (
    <div className="app">
      {gameState === 'menu' && (
        <GameMenu onLetterTypeSelect={handleLetterTypeSelect} />
      )}
      
      {gameState === 'playing' && selectedLetterType && (
        <LetterTracingSimple 
          letterType={selectedLetterType}
          onComplete={handleGameComplete}
          onBackToMenu={handleBackToMenu}
        />
      )}
      
      {gameState === 'completed' && selectedLetterType && (
        <CompletionScreen 
          letterType={selectedLetterType}
          onRestart={handleRestart}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </div>
  );
};

export default App;