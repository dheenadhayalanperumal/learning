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
    
    // SEO-optimized dynamic titles and descriptions
    const seoTitles = {
      'uyir': 'Tamil Vowels Learning - உயிர் எழுத்து Tracing Game for Kids',
      'uyirMei': 'Tamil Consonants Learning - மெய் எழுத்து Tracing Game for Kids',
      'englishCapital': 'English Capital Letters Tracing - ABC Learning Game for Kids',
      'englishSmall': 'English Lowercase Letters Tracing - abc Learning Game for Kids',
      'hindiVowels': 'Hindi Vowels Learning - स्वर Tracing Game for Kids',
      'hindiConsonants': 'Hindi Consonants Learning - व्यंजन Tracing Game for Kids',
      'teluguVowels': 'Telugu Vowels Learning - అచ్చులు Tracing Game for Kids',
      'teluguConsonants': 'Telugu Consonants Learning - హల్లులు Tracing Game for Kids',
      'malayalamVowels': 'Malayalam Vowels Learning - സ്വരങ്ങൾ Tracing Game for Kids',
      'malayalamConsonants': 'Malayalam Consonants Learning - വ്യഞ്ജനങ്ങൾ Tracing Game for Kids',
      'kannadaVowels': 'Kannada Vowels Learning - ಸ್ವರಗಳು Tracing Game for Kids',
      'kannadaConsonants': 'Kannada Consonants Learning - ವ್ಯಞ್ಜನಗಳು Tracing Game for Kids'
    };
    
    const seoDescriptions = {
      'uyir': 'Interactive Tamil vowels (உயிர் எழுத்து) learning game. Help your child learn and trace all 12 Tamil vowels with audio pronunciation. Perfect for kids ages 3-8.',
      'uyirMei': 'Interactive Tamil consonants (மெய் எழுத்து) learning game. Help your child learn and trace all 18 Tamil consonants with audio pronunciation. Perfect for kids ages 3-8.',
      'englishCapital': 'Interactive English capital letters (A-Z) tracing game. Help your child learn and trace all 26 uppercase letters with audio pronunciation. Perfect for kids ages 3-8.',
      'englishSmall': 'Interactive English lowercase letters (a-z) tracing game. Help your child learn and trace all 26 lowercase letters with audio pronunciation. Perfect for kids ages 3-8.',
      'hindiVowels': 'Interactive Hindi vowels (स्वर) learning game. Help your child learn and trace all Hindi vowels in Devanagari script with audio pronunciation. Perfect for kids ages 3-8.',
      'hindiConsonants': 'Interactive Hindi consonants (व्यंजन) learning game. Help your child learn and trace all Hindi consonants in Devanagari script with audio pronunciation. Perfect for kids ages 3-8.',
      'teluguVowels': 'Interactive Telugu vowels (అచ్చులు) learning game. Help your child learn and trace all Telugu vowels with audio pronunciation. Perfect for kids ages 3-8.',
      'teluguConsonants': 'Interactive Telugu consonants (హల్లులు) learning game. Help your child learn and trace all Telugu consonants with audio pronunciation. Perfect for kids ages 3-8.',
      'malayalamVowels': 'Interactive Malayalam vowels (സ്വരങ്ങൾ) learning game. Help your child learn and trace all Malayalam vowels with audio pronunciation. Perfect for kids ages 3-8.',
      'malayalamConsonants': 'Interactive Malayalam consonants (വ്യഞ്ജനങ്ങൾ) learning game. Help your child learn and trace all Malayalam consonants with audio pronunciation. Perfect for kids ages 3-8.',
      'kannadaVowels': 'Interactive Kannada vowels (ಸ್ವರಗಳು) learning game. Help your child learn and trace all Kannada vowels with audio pronunciation. Perfect for kids ages 3-8.',
      'kannadaConsonants': 'Interactive Kannada consonants (ವ್ಯಞ್ಜನಗಳು) learning game. Help your child learn and trace all Kannada consonants with audio pronunciation. Perfect for kids ages 3-8.'
    };
    
    // Update page title and description
    document.title = seoTitles[letterType] || `Draw and Learn - ${letterType}`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = seoDescriptions[letterType] || `Interactive ${letterType} learning game for kids`;
    }
  }, []);

  const handleGameComplete = useCallback(() => {
    setGameState('completed');
    // Update URL to reflect completion state
    window.history.pushState({}, '', `/completed?type=${selectedLetterType}`);
    
    // SEO-optimized completion titles
    const completionTitles = {
      'uyir': 'Congratulations! Tamil Vowels (உயிர் எழுத்து) Learning Completed - Draw & Learn',
      'uyirMei': 'Congratulations! Tamil Consonants (மெய் எழுத்து) Learning Completed - Draw & Learn',
      'englishCapital': 'Congratulations! English Capital Letters (A-Z) Learning Completed - Draw & Learn',
      'englishSmall': 'Congratulations! English Lowercase Letters (a-z) Learning Completed - Draw & Learn',
      'hindiVowels': 'Congratulations! Hindi Vowels (स्वर) Learning Completed - Draw & Learn',
      'hindiConsonants': 'Congratulations! Hindi Consonants (व्यंजन) Learning Completed - Draw & Learn',
      'teluguVowels': 'Congratulations! Telugu Vowels (అచ్చులు) Learning Completed - Draw & Learn',
      'teluguConsonants': 'Congratulations! Telugu Consonants (హల్లులు) Learning Completed - Draw & Learn',
      'malayalamVowels': 'Congratulations! Malayalam Vowels (സ്വരങ്ങൾ) Learning Completed - Draw & Learn',
      'malayalamConsonants': 'Congratulations! Malayalam Consonants (വ്യഞ്ജനങ്ങൾ) Learning Completed - Draw & Learn',
      'kannadaVowels': 'Congratulations! Kannada Vowels (ಸ್ವರಗಳು) Learning Completed - Draw & Learn',
      'kannadaConsonants': 'Congratulations! Kannada Consonants (ವ್ಯಞ್ಜನಗಳು) Learning Completed - Draw & Learn'
    };
    
    // Update page title
    document.title = completionTitles[selectedLetterType] || `Draw and Learn - Completed!`;
    
    // Update meta description for completion
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = `Congratulations! Your child has successfully completed the ${selectedLetterType} letter tracing course. Great progress in learning! Try another language or letter type to continue the educational journey.`;
    }
  }, [selectedLetterType]);

  const handleBackToMenu = useCallback(() => {
    setGameState('menu');
    setSelectedLetterType(null);
    // Update URL to reflect back to menu
    window.history.pushState({}, '', '/');
    // Update page title to SEO-optimized home title
    document.title = 'Draw & Learn - Interactive Letter Tracing Game for Kids | Tamil, English, Hindi, Telugu, Malayalam, Kannada';
    
    // Reset meta description to home page description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = 'Fun and educational letter tracing game for children ages 3-8. Learn Tamil, English, Hindi, Telugu, Malayalam, and Kannada alphabets through interactive drawing. Perfect for parents teaching kids at home or classroom use.';
    }
  }, []);

  const handleBackToLanguageCategory = useCallback(() => {
    // Extract language from letterType to go back to language category page
    const languageMap = {
      'uyir': 'tamil',
      'uyirMei': 'tamil',
      'englishCapital': 'english',
      'englishSmall': 'english',
      'hindiVowels': 'hindi',
      'hindiConsonants': 'hindi',
      'teluguVowels': 'telugu',
      'teluguConsonants': 'telugu',
      'malayalamVowels': 'malayalam',
      'malayalamConsonants': 'malayalam',
      'kannadaVowels': 'kannada',
      'kannadaConsonants': 'kannada'
    };
    
    const language = languageMap[selectedLetterType];
    setGameState('menu');
    // Keep the selectedLetterType as null to show language categories but preserve language selection
    setSelectedLetterType(null);
    // Update URL to show language selection
    window.history.pushState({}, '', `/?lang=${language}`);
    // Update page title
    document.title = 'Draw and Learn';
  }, [selectedLetterType]);

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
          onBackToLanguageCategory={handleBackToLanguageCategory}
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