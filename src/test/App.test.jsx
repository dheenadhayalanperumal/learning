import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from '../App.jsx'

// Mock the data module
vi.mock('../data/letters.js', () => ({
  letterTypes: {
    uyir: {
      id: 'uyir',
      title: 'உயிர் எழுத்து',
      subtitle: '(Tamil Vowels)',
      color: '#4caf50',
      letters: [
        { letter: 'அ', transliteration: 'a', audio: '/audio/tamil/a.mp3' },
        { letter: 'ஆ', transliteration: 'aa', audio: '/audio/tamil/aa.mp3' }
      ]
    },
    englishCapital: {
      id: 'englishCapital',
      title: 'English Capital',
      subtitle: '(A, B, C...)',
      color: '#ff9800',
      letters: [
        { letter: 'A', transliteration: 'A', audio: '/audio/english/A.mp3' },
        { letter: 'B', transliteration: 'B', audio: '/audio/english/B.mp3' }
      ]
    }
  },
  getLettersForType: (type) => {
    const letters = {
      uyir: [
        { letter: 'அ', transliteration: 'a', audio: '/audio/tamil/a.mp3' },
        { letter: 'ஆ', transliteration: 'aa', audio: '/audio/tamil/aa.mp3' }
      ],
      englishCapital: [
        { letter: 'A', transliteration: 'A', audio: '/audio/english/A.mp3' },
        { letter: 'B', transliteration: 'B', audio: '/audio/english/B.mp3' }
      ]
    }
    return letters[type] || []
  },
  getTitleForLetterType: (type) => {
    const titles = {
      uyir: 'உயிர் எழுத்து',
      englishCapital: 'English Capital'
    }
    return titles[type] || ''
  }
}))

// Mock the components
vi.mock('../components/GameMenu.jsx', () => ({
  default: ({ onLetterTypeSelect }) => (
    <div data-testid="game-menu">
      <button onClick={() => onLetterTypeSelect('uyir')}>Tamil Vowels</button>
      <button onClick={() => onLetterTypeSelect('englishCapital')}>English Capital</button>
    </div>
  )
}))

vi.mock('../components/LetterTracingSimple.jsx', () => ({
  default: ({ letterType, onComplete, onBackToMenu }) => (
    <div data-testid="letter-tracing">
      <span>Letter Type: {letterType}</span>
      <button onClick={onComplete}>Complete</button>
      <button onClick={onBackToMenu}>Back to Menu</button>
    </div>
  )
}))

vi.mock('../components/CompletionScreen.jsx', () => ({
  default: ({ letterType, onRestart, onBackToMenu }) => (
    <div data-testid="completion-screen">
      <span>Completed: {letterType}</span>
      <button onClick={onRestart}>Restart</button>
      <button onClick={onBackToMenu}>Back to Menu</button>
    </div>
  )
}))

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders game menu by default', () => {
    render(<App />)
    expect(screen.getByTestId('game-menu')).toBeInTheDocument()
  })

  it('transitions to playing state when letter type is selected', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const tamilButton = screen.getByText('Tamil Vowels')
    await user.click(tamilButton)
    
    expect(screen.getByTestId('letter-tracing')).toBeInTheDocument()
    expect(screen.getByText('Letter Type: uyir')).toBeInTheDocument()
  })

  it('transitions to completion screen when game is completed', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Select letter type
    const tamilButton = screen.getByText('Tamil Vowels')
    await user.click(tamilButton)
    
    // Complete the game
    const completeButton = screen.getByText('Complete')
    await user.click(completeButton)
    
    expect(screen.getByTestId('completion-screen')).toBeInTheDocument()
    expect(screen.getByText('Completed: uyir')).toBeInTheDocument()
  })

  it('can restart game from completion screen', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Go through complete flow
    await user.click(screen.getByText('Tamil Vowels'))
    await user.click(screen.getByText('Complete'))
    
    // Restart
    const restartButton = screen.getByText('Restart')
    await user.click(restartButton)
    
    expect(screen.getByTestId('letter-tracing')).toBeInTheDocument()
  })

  it('can go back to menu from any screen', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Go to playing state
    await user.click(screen.getByText('Tamil Vowels'))
    
    // Go back to menu
    await user.click(screen.getByText('Back to Menu'))
    
    expect(screen.getByTestId('game-menu')).toBeInTheDocument()
  })

  it('manages game state correctly', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Initial state
    expect(screen.getByTestId('game-menu')).toBeInTheDocument()
    
    // Select English Capital
    await user.click(screen.getByText('English Capital'))
    expect(screen.getByText('Letter Type: englishCapital')).toBeInTheDocument()
    
    // Complete and check completion screen
    await user.click(screen.getByText('Complete'))
    expect(screen.getByText('Completed: englishCapital')).toBeInTheDocument()
    
    // Back to menu resets state
    await user.click(screen.getByText('Back to Menu'))
    expect(screen.getByTestId('game-menu')).toBeInTheDocument()
  })
})