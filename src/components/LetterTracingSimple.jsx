import React, { useReducer, useCallback, useMemo, useEffect } from 'react';
import CanvasDrawing from './CanvasDrawing.jsx';
import { getLettersForType, getTitleForLetterType } from '../data/letters.js';

const initialState = {
  currentLetterIndex: 0,
  drawingProgress: 0,
  showNextAnimation: false,
  letterDrawings: {},
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_DRAWING_PROGRESS':
      return { ...state, drawingProgress: action.payload };
    case 'SET_SHOW_NEXT_ANIMATION':
      return { ...state, showNextAnimation: action.payload };
    case 'SAVE_DRAWING':
      return {
        ...state,
        letterDrawings: {
          ...state.letterDrawings,
          [state.currentLetterIndex]: action.payload,
        },
      };
    case 'CLEAR_DRAWING':
      const newDrawings = { ...state.letterDrawings };
      delete newDrawings[state.currentLetterIndex];
      return {
        ...state,
        letterDrawings: newDrawings,
        drawingProgress: 0,
        showNextAnimation: false,
      };
    case 'NEXT_LETTER':
      return {
        ...state,
        currentLetterIndex: state.currentLetterIndex + 1,
        drawingProgress: 0,
        showNextAnimation: false,
      };
    case 'PREVIOUS_LETTER':
      return {
        ...state,
        currentLetterIndex: state.currentLetterIndex - 1,
        drawingProgress: 0,
        showNextAnimation: false,
      };
    default:
      throw new Error();
  }
}

const LetterTracingSimple = ({ letterType, onComplete, onBackToMenu }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { currentLetterIndex, drawingProgress, showNextAnimation, letterDrawings } = state;

  const letters = useMemo(() => getLettersForType(letterType), [letterType]);
  const currentLetter = useMemo(() => letters[currentLetterIndex], [letters, currentLetterIndex]);
  const letterTypeTitle = useMemo(() => getTitleForLetterType(letterType), [letterType]);

  const isFirstLetter = currentLetterIndex === 0;
  const isLastLetter = currentLetterIndex === letters.length - 1;

  const audio = useMemo(() => new Audio(), []);

  useEffect(() => {
    if (currentLetter?.audio) {
      audio.src = currentLetter.audio;
    }
  }, [currentLetter, audio]);

  const playLetterAudio = useCallback(() => {
    audio.play().catch(console.error);
  }, [audio]);

  const handleDrawingUpdate = useCallback((drawingPath) => {
    const progress = Math.min((drawingPath.length / 50) * 100, 100);
    dispatch({ type: 'SET_DRAWING_PROGRESS', payload: progress });
  }, []);

  const handleDrawingComplete = useCallback((drawingPath) => {
    if (drawingPath.length > 10) {
      dispatch({ type: 'SET_SHOW_NEXT_ANIMATION', payload: true });
      playLetterAudio();
    }
  }, [playLetterAudio]);

  const handleClear = useCallback(() => {
    dispatch({ type: 'CLEAR_DRAWING' });
    if (window.clearCurrentDrawing) {
      window.clearCurrentDrawing();
    }
  }, []);

  const handleNext = useCallback(() => {
    if (isLastLetter) {
      onComplete();
    } else {
      dispatch({ type: 'NEXT_LETTER' });
    }
  }, [isLastLetter, onComplete]);

  const handlePrevious = useCallback(() => {
    if (!isFirstLetter) {
      dispatch({ type: 'PREVIOUS_LETTER' });
    }
  }, [isFirstLetter]);

  const handlePlayAudio = useCallback(() => {
    playLetterAudio();
  }, [playLetterAudio]);

  const saveCurrentDrawing = useCallback((strokes) => {
    dispatch({ type: 'SAVE_DRAWING', payload: strokes });
  }, []);

  const getCurrentLetterDrawing = useCallback(() => {
    return letterDrawings[currentLetterIndex] || [];
  }, [letterDrawings, currentLetterIndex]);

  if (!currentLetter) {
    return <div className="loading">Loading letters...</div>;
  }

  return (
    <div className="game-container fade-in">
      <div className="game-header">
        <h2>{letterTypeTitle}</h2>
        <div className="progress">
          Letter {currentLetterIndex + 1} of {letters.length}
          {showNextAnimation && (
            <span style={{ color: '#4CAF50', marginLeft: '10px' }}>✓ Great! Click Next →</span>
          )}
        </div>
      </div>

      <div className="letter-display-area">
        <CanvasDrawing
          letter={currentLetter.letter}
          letterType={letterType}
          letterIndex={currentLetterIndex}
          savedStrokes={getCurrentLetterDrawing()}
          onDrawingUpdate={handleDrawingUpdate}
          onDrawingComplete={handleDrawingComplete}
          onStrokesChange={saveCurrentDrawing}
        />
        
        {drawingProgress > 0 && (
          <div 
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.9)',
              padding: '5px 15px',
              borderRadius: '20px',
              fontSize: '14px',
              color: '#333'
            }}
          >
            Progress: {Math.round(drawingProgress)}%
          </div>
        )}
      </div>

      <div className="game-controls">
        <button 
          onClick={handlePrevious} 
          className="control-button"
          style={{ backgroundColor: '#666' }}
          disabled={isFirstLetter}
        >
          ← Prev
        </button>
        
        <button 
          onClick={handlePlayAudio} 
          className="control-button"
          style={{ backgroundColor: '#9C27B0' }}
        >
          🔊 Play
        </button>
        
        <button 
          onClick={handleClear} 
          className="control-button clear-button"
        >
          🗑️ Clear
        </button>
        
        <button 
          onClick={handleNext} 
          className="control-button next-button"
          style={{ 
            backgroundColor: showNextAnimation ? '#4CAF50' : '#4CAF50',
            transform: showNextAnimation ? 'scale(1.05)' : 'scale(1)',
            boxShadow: showNextAnimation ? '0 0 15px rgba(76, 175, 80, 0.5)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          {isLastLetter ? 'Finish' : 'Next →'}
        </button>
        
        <button 
          onClick={onBackToMenu} 
          className="control-button menu-button"
        >
          🏠 Menu
        </button>
      </div>
    </div>
  );
};

export default LetterTracingSimple;