import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { letterTypes } from '../data/letters.js';

const GameMenu = ({ onLetterTypeSelect }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  // Initialize language from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const language = params.get('lang');
    if (language) {
      setSelectedLanguage(language);
    }
  }, []);

  // Handle browser back/forward navigation within GameMenu
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const language = params.get('lang');
      setSelectedLanguage(language || null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLetterTypeClick = useCallback((letterType) => {
    onLetterTypeSelect(letterType);
  }, [onLetterTypeSelect]);

  const handleLanguageSelect = useCallback((language) => {
    setSelectedLanguage(language);
    // Update URL to include language selection
    window.history.pushState({}, '', `/?lang=${language}`);
  }, []);

  const handleBackToLanguages = useCallback(() => {
    setSelectedLanguage(null);
    // Update URL to remove language selection
    window.history.pushState({}, '', '/');
  }, []);

  // Language structure
  const languages = useMemo(() => ({
    tamil: {
      id: 'tamil',
      title: 'தமிழ்',
      subtitle: 'Tamil',
      color: '#4caf50',
      types: [
        letterTypes.uyir,
        letterTypes.uyirMei
      ]
    },
    english: {
      id: 'english',
      title: 'English',
      subtitle: 'English',
      color: '#2196f3',
      types: [
        letterTypes.englishCapital,
        letterTypes.englishSmall
      ]
    },
    hindi: {
      id: 'hindi',
      title: 'हिंदी',
      subtitle: 'Hindi',
      color: '#e91e63',
      types: [
        letterTypes.hindiVowels,
        letterTypes.hindiConsonants
      ]
    },
    telugu: {
      id: 'telugu',
      title: 'తెలుగు',
      subtitle: 'Telugu',
      color: '#ff5722',
      types: [
        letterTypes.teluguVowels,
        letterTypes.teluguConsonants
      ]
    },
    malayalam: {
      id: 'malayalam',
      title: 'മലയാളം',
      subtitle: 'Malayalam',
      color: '#8bc34a',
      types: [
        letterTypes.malayalamVowels,
        letterTypes.malayalamConsonants
      ]
    }
  }), []);

  if (selectedLanguage) {
    const language = languages[selectedLanguage];
    return (
      <div className="game-menu fade-in">
        <button className="back-button" onClick={handleBackToLanguages}>
          ← Back to Languages
        </button>
        <h1 className="game-title">{language.title}</h1>
        <h2 className="game-subtitle">Choose Letter Type</h2>
        
        <div className="letter-type-grid">
          {language.types.map((type) => (
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
  }

  return (
    <div className="game-menu fade-in">
      <h1 className="game-title">Draw and Learn</h1>
      <h2 className="game-subtitle">Choose Your Language</h2>
      
      <div className="language-grid">
        {Object.values(languages).map((language) => (
          <button
            key={language.id}
            className="language-button"
            style={{ backgroundColor: language.color }}
            onClick={() => handleLanguageSelect(language.id)}
          >
            <div className="button-title">{language.title}</div>
            <div className="button-subtitle">{language.subtitle}</div>
            <div className="button-count">{language.types.length} categories</div>
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
    'englishSmall': 'english-small',
    'hindiVowels': 'hindi-vowels',
    'hindiConsonants': 'hindi-consonants',
    'teluguVowels': 'telugu-vowels',
    'teluguConsonants': 'telugu-consonants',
    'malayalamVowels': 'malayalam-vowels',
    'malayalamConsonants': 'malayalam-consonants'
  };
  return classMap[typeId] || '';
};

export default GameMenu;