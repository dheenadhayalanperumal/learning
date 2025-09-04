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

const LetterTracingSimple = ({ letterType, onComplete, onBackToMenu, onBackToLanguageCategory }) => {
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
      {/* Back button - top left */}
      <button 
        onClick={onBackToLanguageCategory} 
        className="control-button"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: '#666',
          border: 'none',
          borderRadius: '12px',
          color: '#fff',
          padding: '10px 20px',
          fontSize: '1rem',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          zIndex: 100
        }}
      >
        ← Back
      </button>

      {/* Title - center top */}
      <div className="game-header-top" style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 100
      }}>
        <h2 style={{
          color: '#fff',
          margin: '0',
          fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
        }}>{letterTypeTitle}</h2>
        <div style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
          marginTop: '4px'
        }}>
          Letter {currentLetterIndex + 1} of {letters.length}
          {showNextAnimation && (
            <span style={{ color: '#4CAF50', marginLeft: '10px' }}>✓ Great! Click Next →</span>
          )}
        </div>
      </div>

      {/* Menu button - top right */}
      <button 
        onClick={onBackToMenu} 
        className="control-button menu-button"
        style={{ 
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: '#2196F3',
          border: 'none',
          borderRadius: '12px',
          color: '#fff',
          padding: '10px 20px',
          fontSize: '1rem',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          zIndex: 100
        }}
      >
        🏠 Menu
      </button>

      <div className="letter-display-area" style={{
        marginTop: '100px', // Add space for top navigation
        height: 'calc(75vh - 100px)' // Adjust height to account for top margin
      }}>
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

      {/* Bottom button row */}
      <div className="bottom-controls" style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        right: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100
      }}>
        {/* Previous button */}
        <button 
          onClick={handlePrevious}
          className="prev-button-bottom"
          style={{
            background: isFirstLetter ? 'rgba(150, 150, 150, 0.3)' : 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            padding: '12px 16px',
            fontSize: '1rem',
            cursor: isFirstLetter ? 'not-allowed' : 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            opacity: isFirstLetter ? 0.5 : 1,
            width: '90px',
            height: '48px'
          }}
          disabled={isFirstLetter}
        >
          ← Prev
        </button>

        {/* Play button */}
        <button 
          onClick={handlePlayAudio} 
          className="control-button"
          style={{ 
            backgroundColor: '#9C27B0',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            padding: '12px 16px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            width: '90px',
            height: '48px'
          }}
        >
          🔊 Play
        </button>
        
        {/* Clear button */}
        <button 
          onClick={handleClear} 
          className="control-button clear-button"
          style={{
            backgroundColor: '#f44336',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            padding: '12px 16px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            width: '90px',
            height: '48px'
          }}
        >
          🗑️ Clear
        </button>

        {/* Next button */}
        <button 
          onClick={handleNext} 
          className="next-button-bottom"
          style={{ 
            backgroundColor: showNextAnimation ? '#4CAF50' : '#4CAF50',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            padding: '12px 16px',
            fontSize: '1rem',
            cursor: 'pointer',
            transform: showNextAnimation ? 'scale(1.05)' : 'scale(1)',
            boxShadow: showNextAnimation ? '0 0 15px rgba(76, 175, 80, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s ease',
            width: '90px',
            height: '48px'
          }}
        >
          {isLastLetter ? 'Finish' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

export default LetterTracingSimple;