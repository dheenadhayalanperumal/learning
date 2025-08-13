import React from 'react';
import { getTitleForLetterType } from '../data/letters.js';

const CompletionScreen = ({ letterType, onRestart, onBackToMenu }) => {
  const letterTypeTitle = getTitleForLetterType(letterType);

  return (
    <div className="completion-screen fade-in">
      <h1 className="completion-title">🎉 வாழ்த்துக்கள்!</h1>
      <h2 className="completion-title">Congratulations!</h2>
      
      <p className="completion-message">
        You have completed all letters in<br />
        <strong>{letterTypeTitle}</strong>
      </p>
      
      <div className="completion-buttons">
        <button 
          className="completion-button restart-button"
          onClick={onRestart}
        >
          🔄 Play Again
        </button>
        <button 
          className="completion-button menu-button-completion"
          onClick={onBackToMenu}
        >
          🏠 Main Menu
        </button>
      </div>
    </div>
  );
};

export default CompletionScreen;