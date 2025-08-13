import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import GameMenu from '../components/GameMenu.jsx'

// Mock the data module
vi.mock('../data/letters.js', () => ({
  letterTypes: {
    uyir: {
      id: 'uyir',
      title: 'உயிர் எழுத்து',
      subtitle: '(Tamil Vowels)',
      color: '#4caf50',
      letters: new Array(12).fill(null).map((_, i) => ({ letter: `அ${i}` }))
    },
    uyirMei: {
      id: 'uyirMei',
      title: 'மெய் எழுத்து',
      subtitle: '(Tamil Consonants)',
      color: '#2196f3',
      letters: new Array(18).fill(null).map((_, i) => ({ letter: `க${i}` }))
    },
    englishCapital: {
      id: 'englishCapital',
      title: 'English Capital',
      subtitle: '(A, B, C...)',
      color: '#ff9800',
      letters: new Array(26).fill(null).map((_, i) => ({ letter: String.fromCharCode(65 + i) }))
    },
    englishSmall: {
      id: 'englishSmall',
      title: 'English Small',
      subtitle: '(a, b, c...)',
      color: '#9c27b0',
      letters: new Array(26).fill(null).map((_, i) => ({ letter: String.fromCharCode(97 + i) }))
    }
  }
}))

describe('GameMenu Component', () => {
  const mockOnLetterTypeSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the game title and subtitle', () => {
    render(<GameMenu onLetterTypeSelect={mockOnLetterTypeSelect} />)
    
    expect(screen.getByText('தமிழ் எழுத்துக்கள்')).toBeInTheDocument()
    expect(screen.getByText('Draw & Learn')).toBeInTheDocument()
  })

  it('renders all letter type buttons', () => {
    render(<GameMenu onLetterTypeSelect={mockOnLetterTypeSelect} />)
    
    expect(screen.getByText('உயிர் எழுத்து')).toBeInTheDocument()
    expect(screen.getByText('மெய் எழுத்து')).toBeInTheDocument()
    expect(screen.getByText('English Capital')).toBeInTheDocument()
    expect(screen.getByText('English Small')).toBeInTheDocument()
  })

  it('displays correct subtitles for each letter type', () => {
    render(<GameMenu onLetterTypeSelect={mockOnLetterTypeSelect} />)
    
    expect(screen.getByText('(Tamil Vowels)')).toBeInTheDocument()
    expect(screen.getByText('(Tamil Consonants)')).toBeInTheDocument()
    expect(screen.getByText('(A, B, C...)')).toBeInTheDocument()
    expect(screen.getByText('(a, b, c...)')).toBeInTheDocument()
  })

  it('displays correct letter counts', () => {
    render(<GameMenu onLetterTypeSelect={mockOnLetterTypeSelect} />)
    
    expect(screen.getByText('12 letters')).toBeInTheDocument()
    expect(screen.getByText('18 letters')).toBeInTheDocument()
    expect(screen.getAllByText('26 letters')).toHaveLength(2) // Both English types have 26 letters
  })

  it('calls onLetterTypeSelect when a button is clicked', async () => {
    const user = userEvent.setup()
    render(<GameMenu onLetterTypeSelect={mockOnLetterTypeSelect} />)
    
    const tamilVowelsButton = screen.getByText('உயிர் எழுத்து')
    await user.click(tamilVowelsButton)
    
    expect(mockOnLetterTypeSelect).toHaveBeenCalledWith('uyir')
    expect(mockOnLetterTypeSelect).toHaveBeenCalledTimes(1)
  })

  it('calls onLetterTypeSelect with correct IDs for all buttons', async () => {
    const user = userEvent.setup()
    render(<GameMenu onLetterTypeSelect={mockOnLetterTypeSelect} />)
    
    // Test Tamil Vowels
    await user.click(screen.getByText('உயிர் எழுத்து'))
    expect(mockOnLetterTypeSelect).toHaveBeenLastCalledWith('uyir')
    
    // Test Tamil Consonants
    await user.click(screen.getByText('மெய் எழுத்து'))
    expect(mockOnLetterTypeSelect).toHaveBeenLastCalledWith('uyirMei')
    
    // Test English Capital
    await user.click(screen.getByText('English Capital'))
    expect(mockOnLetterTypeSelect).toHaveBeenLastCalledWith('englishCapital')
    
    // Test English Small
    await user.click(screen.getByText('English Small'))
    expect(mockOnLetterTypeSelect).toHaveBeenLastCalledWith('englishSmall')
    
    expect(mockOnLetterTypeSelect).toHaveBeenCalledTimes(4)
  })

  it('applies correct CSS classes to buttons', () => {
    render(<GameMenu onLetterTypeSelect={mockOnLetterTypeSelect} />)
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveClass('letter-type-button')
    })
  })

  it('applies correct background colors to buttons', () => {
    render(<GameMenu onLetterTypeSelect={mockOnLetterTypeSelect} />)
    
    const tamilVowelsButton = screen.getByText('உயிர் எழுத்து').closest('button')
    const tamilConsonantsButton = screen.getByText('மெய் எழுத்து').closest('button')
    const englishCapitalButton = screen.getByText('English Capital').closest('button')
    const englishSmallButton = screen.getByText('English Small').closest('button')
    
    expect(tamilVowelsButton).toHaveStyle('background-color: #4caf50')
    expect(tamilConsonantsButton).toHaveStyle('background-color: #2196f3')
    expect(englishCapitalButton).toHaveStyle('background-color: #ff9800')
    expect(englishSmallButton).toHaveStyle('background-color: #9c27b0')
  })
})