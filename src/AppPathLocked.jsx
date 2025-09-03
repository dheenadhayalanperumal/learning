import React, { useState, useCallback, useEffect } from 'react';
import GameMenu from './components/GameMenu.jsx';
import LetterTracingSimple from './components/LetterTracingSimple.jsx';
import LetterTracingSimplePathLocked from './components/LetterTracingSimplePathLocked.jsx';
import CompletionScreen from './components/CompletionScreen.jsx';

const AppPathLocked = () => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'completed'
  const [selectedLetterType, setSelectedLetterType] = useState(null);
  const [usePathLocked, setUsePathLocked] = useState(true); // Global toggle

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

    // Check for path-locked preference in localStorage
    const savedPreference = localStorage.getItem('usePathLocked');
    if (savedPreference !== null) {
      setUsePathLocked(savedPreference === 'true');
    }
  }, []);

  // Save path-locked preference
  useEffect(() => {
    localStorage.setItem('usePathLocked', usePathLocked.toString());
  }, [usePathLocked]);

  const handleLetterTypeSelect = useCallback((letterType) => {
    setSelectedLetterType(letterType);
    setGameState('playing');
    
    // Update URL
    const url = new URL(window.location);
    url.pathname = '/game';
    url.searchParams.set('type', letterType);
    window.history.pushState({}, '', url);
    
    document.title = `Draw and Learn - ${letterType}`;
  }, []);

  const handleGameComplete = useCallback(() => {
    setGameState('completed');
    
    // Update URL
    const url = new URL(window.location);
    url.pathname = '/completed';
    url.searchParams.set('type', selectedLetterType);
    window.history.pushState({}, '', url);
    
    document.title = `Draw and Learn - Completed!`;
  }, [selectedLetterType]);

  const handleBackToMenu = useCallback(() => {
    setGameState('menu');
    setSelectedLetterType(null);
    
    // Update URL
    const url = new URL(window.location);
    url.pathname = '/';
    url.search = '';
    window.history.pushState({}, '', url);
    
    document.title = 'Draw and Learn';
  }, []);

  const togglePathLocked = useCallback(() => {
    setUsePathLocked(!usePathLocked);
  }, [usePathLocked]);

  return (
    <div className="app">
      {/* Global Path-Locked Toggle */}
      {gameState !== 'menu' && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          background: 'rgba(255,255,255,0.9)',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Tracing Mode:</span>
          <button
            onClick={togglePathLocked}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: '2px solid #4CAF50',
              background: usePathLocked ? '#4CAF50' : 'transparent',
              color: usePathLocked ? 'white' : '#4CAF50',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            {usePathLocked ? '🎯 Path-Locked' : '🖊️ Free Draw'}
          </button>
        </div>
      )}

      {gameState === 'menu' && (
        <GameMenu onLetterTypeSelect={handleLetterTypeSelect} />
      )}

      {gameState === 'playing' && selectedLetterType && (
        usePathLocked ? (
          <LetterTracingSimplePathLocked
            letterType={selectedLetterType}
            onComplete={handleGameComplete}
            onBackToMenu={handleBackToMenu}
          />
        ) : (
          <LetterTracingSimple
            letterType={selectedLetterType}
            onComplete={handleGameComplete}
            onBackToMenu={handleBackToMenu}
          />
        )
      )}

      {gameState === 'completed' && selectedLetterType && (
        <CompletionScreen
          letterType={selectedLetterType}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </div>
  );
};

export default AppPathLocked;