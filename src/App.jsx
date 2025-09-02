import React, { useState, useCallback, useEffect } from 'react';
import GameMenu from './components/GameMenu.jsx';
import LetterTracingSimple from './components/LetterTracingSimple.jsx';
import CompletionScreen from './components/CompletionScreen.jsx';

const App = () => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'completed'
  const [selectedLetterType, setSelectedLetterType] = useState(null);

  // Initialize state from URL on app load
  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    if (path === '/game') {
      const letterType = params.get('type');
      if (letterType) {
        setSelectedLetterType(letterType);
        setGameState('playing');
        document.title = `Draw and Learn - ${letterType}`;
      }
    } else if (path === '/completed') {
      const letterType = params.get('type');
      if (letterType) {
        setSelectedLetterType(letterType);
        setGameState('completed');
        document.title = `Draw and Learn - Completed!`;
      }
    } else {
      document.title = 'Draw and Learn';
    }
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      
      if (path === '/' || path === '') {
        setGameState('menu');
        setSelectedLetterType(null);
        document.title = 'Draw and Learn';
      } else if (path === '/game') {
        const letterType = params.get('type');
        if (letterType) {
          setSelectedLetterType(letterType);
          setGameState('playing');
          document.title = `Draw and Learn - ${letterType}`;
        } else {
          setGameState('menu');
          setSelectedLetterType(null);
          document.title = 'Draw and Learn';
        }
      } else if (path === '/completed') {
        const letterType = params.get('type');
        if (letterType) {
          setSelectedLetterType(letterType);
          setGameState('completed');
          document.title = `Draw and Learn - Completed!`;
        } else {
          setGameState('menu');
          setSelectedLetterType(null);
          document.title = 'Draw and Learn';
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLetterTypeSelect = useCallback((letterType) => {
    setSelectedLetterType(letterType);
    setGameState('playing');
    // Update URL to reflect the state change
    window.history.pushState({}, '', `/game?type=${letterType}`);
    // Update page title
    document.title = `Draw and Learn - ${letterType}`;
  }, []);

  const handleGameComplete = useCallback(() => {
    setGameState('completed');
    // Update URL to reflect completion state
    window.history.pushState({}, '', `/completed?type=${selectedLetterType}`);
    // Update page title
    document.title = `Draw and Learn - Completed!`;
  }, [selectedLetterType]);

  const handleBackToMenu = useCallback(() => {
    setGameState('menu');
    setSelectedLetterType(null);
    // Update URL to reflect back to menu
    window.history.pushState({}, '', '/');
    // Update page title
    document.title = 'Draw and Learn';
  }, []);

  const handleRestart = useCallback(() => {
    setGameState('playing');
    // Update URL back to game state
    window.history.pushState({}, '', `/game?type=${selectedLetterType}`);
    // Update page title
    document.title = `Draw and Learn - ${selectedLetterType}`;
  }, [selectedLetterType]);


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