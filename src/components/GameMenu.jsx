import React, { useCallback, useMemo } from 'react';
import { letterTypes } from '../data/letters.js';

const GameMenu = ({ onLetterTypeSelect }) => {
  const handleLetterTypeClick = useCallback((letterType) => {
    onLetterTypeSelect(letterType);
  }, [onLetterTypeSelect]);

  // Memoize letter types array to prevent re-renders
  const letterTypesList = useMemo(() => Object.values(letterTypes), []);

  return (
    <div className="game-menu fade-in">
      <h1 className="game-title">தமிழ் எழுத்துக்கள்</h1>
      <h2 className="game-subtitle">Draw & Learn</h2>
      
      <div className="letter-type-grid">
        {letterTypesList.map((type) => (
          <button
            key={type.id}
            className={`letter-type-button ${getButtonClass(type.id)}`}
            style={{ backgroundColor: type.color }}
            onClick={() => handleLetterTypeClick(type.id)}
          >
            <div className="button-title">{type.title}</div>
            <div className="button-subtitle">{type.subtitle}</div>
            <div className="button-count">{type.letters.length} letters</div>
          </button>
        ))}
      </div>
    </div>
  );
};

const getButtonClass = (typeId) => {
  const classMap = {
    'uyir': 'tamil-vowels',
    'uyirMei': 'tamil-consonants',
    'englishCapital': 'english-capital',
    'englishSmall': 'english-small'
  };
  return classMap[typeId] || '';
};

export default GameMenu;