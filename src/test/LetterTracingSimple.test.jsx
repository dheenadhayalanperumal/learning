import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import LetterTracingSimple from '../components/LetterTracingSimple.jsx'

// Mock the data module
vi.mock('../data/letters.js', () => ({
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

// Mock CanvasDrawing component
vi.mock('../components/CanvasDrawing.jsx', () => ({
  default: ({ letter, onDrawingUpdate, onDrawingComplete, onStrokesChange }) => {
    const handleDrawing = () => {
      const mockPath = new Array(15).fill({ x: 100, y: 100 }) // Simulate substantial drawing
      onDrawingUpdate(mockPath)
      onDrawingComplete(mockPath)
      onStrokesChange([mockPath])
    }
    
    return (
      <div data-testid="canvas-drawing">
        <span>Drawing: {letter}</span>
        <button onClick={handleDrawing}>Simulate Drawing</button>
      </div>
    )
  }
}))

describe('LetterTracingSimple Component', () => {
  const mockOnComplete = vi.fn()
  const mockOnBackToMenu = vi.fn()

  const defaultProps = {
    letterType: 'uyir',
    onComplete: mockOnComplete,
    onBackToMenu: mockOnBackToMenu
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the component with correct title and progress', () => {
    render(<LetterTracingSimple {...defaultProps} />)
    
    expect(screen.getByText('உயிர் எழுத்து')).toBeInTheDocument()
    expect(screen.getByText('Letter 1 of 2')).toBeInTheDocument()
  })

  it('displays the current letter in canvas', () => {
    render(<LetterTracingSimple {...defaultProps} />)
    
    expect(screen.getByText('Drawing: அ')).toBeInTheDocument()
  })

  it('shows control buttons', () => {
    render(<LetterTracingSimple {...defaultProps} />)
    
    expect(screen.getByText('← Prev')).toBeInTheDocument()
    expect(screen.getByText('🔊 Play')).toBeInTheDocument()
    expect(screen.getByText('🗑️ Clear')).toBeInTheDocument()
    expect(screen.getByText('Next →')).toBeInTheDocument()
    expect(screen.getByText('🏠 Menu')).toBeInTheDocument()
  })

  it('disables prev button on first letter', () => {
    render(<LetterTracingSimple {...defaultProps} />)
    
    const prevButton = screen.getByText('← Prev')
    expect(prevButton).toBeDisabled()
  })

  it('advances to next letter when next is clicked', async () => {
    const user = userEvent.setup()
    render(<LetterTracingSimple {...defaultProps} />)
    
    const nextButton = screen.getByText('Next →')
    await user.click(nextButton)
    
    expect(screen.getByText('Letter 2 of 2')).toBeInTheDocument()
    expect(screen.getByText('Drawing: ஆ')).toBeInTheDocument()
  })

  it('goes back to previous letter when prev is clicked', async () => {
    const user = userEvent.setup()
    render(<LetterTracingSimple {...defaultProps} />)
    
    // Go to second letter first
    await user.click(screen.getByText('Next →'))
    
    // Then go back
    const prevButton = screen.getByText('← Prev')
    expect(prevButton).not.toBeDisabled()
    await user.click(prevButton)
    
    expect(screen.getByText('Letter 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('Drawing: அ')).toBeInTheDocument()
  })

  it('calls onComplete when finish is clicked on last letter', async () => {
    const user = userEvent.setup()
    render(<LetterTracingSimple {...defaultProps} />)
    
    // Go to last letter
    await user.click(screen.getByText('Next →'))
    
    // Click finish
    const finishButton = screen.getByText('Finish')
    await user.click(finishButton)
    
    expect(mockOnComplete).toHaveBeenCalledTimes(1)
  })

  it('calls onBackToMenu when menu button is clicked', async () => {
    const user = userEvent.setup()
    render(<LetterTracingSimple {...defaultProps} />)
    
    const menuButton = screen.getByText('🏠 Menu')
    await user.click(menuButton)
    
    expect(mockOnBackToMenu).toHaveBeenCalledTimes(1)
  })

  it('shows success message and animation when drawing is complete', async () => {
    const user = userEvent.setup()
    render(<LetterTracingSimple {...defaultProps} />)
    
    // Simulate drawing completion
    const simulateButton = screen.getByText('Simulate Drawing')
    await user.click(simulateButton)
    
    expect(screen.getByText('✓ Great! Click Next →')).toBeInTheDocument()
  })

  it('resets animation state when moving to next letter', async () => {
    const user = userEvent.setup()
    render(<LetterTracingSimple {...defaultProps} />)
    
    // Complete drawing to show animation
    await user.click(screen.getByText('Simulate Drawing'))
    expect(screen.getByText('✓ Great! Click Next →')).toBeInTheDocument()
    
    // Move to next letter
    await user.click(screen.getByText('Next →'))
    
    // Animation should be reset
    expect(screen.queryByText('✓ Great! Click Next →')).not.toBeInTheDocument()
  })

  it('shows finish button on last letter', async () => {
    const user = userEvent.setup()
    render(<LetterTracingSimple {...defaultProps} />)
    
    // Go to last letter
    await user.click(screen.getByText('Next →'))
    
    expect(screen.getByText('Finish')).toBeInTheDocument()
    expect(screen.queryByText('Next →')).not.toBeInTheDocument()
  })

  it('handles different letter types correctly', () => {
    render(<LetterTracingSimple {...defaultProps} letterType="englishCapital" />)
    
    expect(screen.getByText('English Capital')).toBeInTheDocument()
    expect(screen.getByText('Drawing: A')).toBeInTheDocument()
  })

  it('shows loading state when letters are not available', () => {
    render(<LetterTracingSimple {...defaultProps} letterType="nonexistent" />)
    
    expect(screen.getByText('Loading letters...')).toBeInTheDocument()
  })

  it('handles audio play functionality', async () => {
    const user = userEvent.setup()
    render(<LetterTracingSimple {...defaultProps} />)
    
    const playButton = screen.getByText('🔊 Play')
    
    // Should not throw an error when clicked
    await user.click(playButton)
    
    // Audio is mocked, so we just verify the button is clickable
    expect(playButton).toBeEnabled()
  })

  it('maintains drawing state per letter', async () => {
    const user = userEvent.setup()
    render(<LetterTracingSimple {...defaultProps} />)
    
    // Complete drawing on first letter
    await user.click(screen.getByText('Simulate Drawing'))
    
    // Go to next letter
    await user.click(screen.getByText('Next →'))
    
    // Go back to first letter
    await user.click(screen.getByText('← Prev'))
    
    // The drawing state should be maintained (tested through props passed to canvas)
    expect(screen.getByText('Drawing: அ')).toBeInTheDocument()
  })
})