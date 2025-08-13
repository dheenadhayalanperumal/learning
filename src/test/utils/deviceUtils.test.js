import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  isTouchDevice,
  isIOS,
  isAndroid,
  isMobile,
  isTablet,
  isDesktop,
  requestIdleCallback,
  cancelIdleCallback,
  preventTouchDefaults,
  calculateOptimalFontSize,
  debounce,
  throttle,
  getSafeAreaInsets,
  getViewportHeight,
  supportsAudio,
  saveProgress,
  loadProgress,
  clearProgress
} from '../../utils/deviceUtils.js'

// Mock window and navigator objects
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  requestIdleCallback: vi.fn(),
  cancelIdleCallback: vi.fn(),
  visualViewport: null,
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
}

const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  maxTouchPoints: 0,
  msMaxTouchPoints: 0
}

describe('DeviceUtils', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Setup global mocks
    global.window = mockWindow
    global.navigator = mockNavigator
    global.localStorage = mockWindow.localStorage
    global.setTimeout = vi.fn((cb) => cb())
    global.clearTimeout = vi.fn()
    global.Audio = vi.fn(() => ({
      canPlayType: vi.fn(() => 'probably')
    }))
    
    // Mock getComputedStyle
    global.getComputedStyle = vi.fn(() => ({
      getPropertyValue: vi.fn(() => '0')
    }))
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Device Detection', () => {
    describe('isTouchDevice', () => {
      it('returns false for non-touch devices', () => {
        expect(isTouchDevice()).toBe(false)
      })

      it('returns true when ontouchstart exists', () => {
        window.ontouchstart = true
        expect(isTouchDevice()).toBe(true)
        delete window.ontouchstart
      })

      it('returns true when navigator has touch points', () => {
        navigator.maxTouchPoints = 5
        expect(isTouchDevice()).toBe(true)
        navigator.maxTouchPoints = 0
      })
    })

    describe('isIOS', () => {
      it('returns false for non-iOS devices', () => {
        expect(isIOS()).toBe(false)
      })

      it('returns true for iPad', () => {
        navigator.userAgent = 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)'
        expect(isIOS()).toBe(true)
      })

      it('returns true for iPhone', () => {
        navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)'
        expect(isIOS()).toBe(true)
      })
    })

    describe('isAndroid', () => {
      it('returns false for non-Android devices', () => {
        expect(isAndroid()).toBe(false)
      })

      it('returns true for Android devices', () => {
        navigator.userAgent = 'Mozilla/5.0 (Linux; Android 11; SM-G991B)'
        expect(isAndroid()).toBe(true)
      })
    })

    describe('Screen Size Detection', () => {
      it('identifies mobile devices correctly', () => {
        window.innerWidth = 480
        expect(isMobile()).toBe(true)
        expect(isTablet()).toBe(false)
        expect(isDesktop()).toBe(false)
      })

      it('identifies tablet devices correctly', () => {
        window.innerWidth = 800
        expect(isMobile()).toBe(false)
        expect(isTablet()).toBe(true)
        expect(isDesktop()).toBe(false)
      })

      it('identifies desktop devices correctly', () => {
        window.innerWidth = 1200
        expect(isMobile()).toBe(false)
        expect(isTablet()).toBe(false)
        expect(isDesktop()).toBe(true)
      })
    })
  })

  describe('Performance Utilities', () => {
    describe('requestIdleCallback', () => {
      it('uses native requestIdleCallback when available', () => {
        const callback = vi.fn()
        window.requestIdleCallback = vi.fn()
        
        requestIdleCallback(callback)
        expect(window.requestIdleCallback).toHaveBeenCalledWith(callback)
      })

      it('falls back to setTimeout when requestIdleCallback not available', () => {
        const callback = vi.fn()
        delete window.requestIdleCallback
        
        requestIdleCallback(callback)
        expect(setTimeout).toHaveBeenCalledWith(callback, 1)
      })
    })

    describe('debounce', () => {
      it('debounces function calls', () => {
        vi.useFakeTimers()
        
        const func = vi.fn()
        const debouncedFunc = debounce(func, 100)
        
        debouncedFunc()
        debouncedFunc()
        debouncedFunc()
        
        // Function should not be called immediately
        expect(func).not.toHaveBeenCalled()
        
        // Fast-forward time
        vi.advanceTimersByTime(100)
        expect(func).toHaveBeenCalledTimes(1)
        
        vi.useRealTimers()
      })
    })

    describe('throttle', () => {
      it('throttles function calls', () => {
        vi.useFakeTimers()
        
        const func = vi.fn()
        const throttledFunc = throttle(func, 100)
        
        throttledFunc()
        throttledFunc()
        throttledFunc()
        
        // First call should execute immediately
        expect(func).toHaveBeenCalledTimes(1)
        
        // Fast-forward time to allow next call
        vi.advanceTimersByTime(100)
        throttledFunc()
        expect(func).toHaveBeenCalledTimes(2)
        
        vi.useRealTimers()
      })
    })
  })

  describe('Font Size Calculation', () => {
    it('calculates smaller font for small mobile devices', () => {
      const fontSize = calculateOptimalFontSize(400, 600, 'english')
      expect(fontSize).toBe(220) // 400 * 0.55
    })

    it('calculates larger font for tablets', () => {
      const fontSize = calculateOptimalFontSize(800, 1000, 'english')
      expect(fontSize).toBe(400) // 800 * 0.5
    })

    it('applies Tamil letter adjustment', () => {
      const englishSize = calculateOptimalFontSize(800, 1000, 'english')
      const tamilSize = calculateOptimalFontSize(800, 1000, 'tamil')
      expect(tamilSize).toBeGreaterThan(englishSize)
    })

    it('caps desktop font size', () => {
      const fontSize = calculateOptimalFontSize(2000, 1500, 'english')
      expect(fontSize).toBeLessThanOrEqual(400)
    })
  })

  describe('Audio Support', () => {
    it('detects audio support when Audio is available', () => {
      // Ensure Audio constructor has canPlayType method
      global.Audio.prototype.canPlayType = vi.fn(() => 'probably')
      expect(supportsAudio()).toBe(true)
    })

    it('handles missing Audio gracefully', () => {
      delete global.Audio
      expect(supportsAudio()).toBe(false)
    })
  })

  describe('Viewport Utilities', () => {
    it('returns inner height when visualViewport not available', () => {
      window.visualViewport = null
      expect(getViewportHeight()).toBe(768)
    })

    it('returns visualViewport height when available', () => {
      window.visualViewport = { height: 600 }
      expect(getViewportHeight()).toBe(600)
    })
  })

  describe('Progress Storage', () => {
    beforeEach(() => {
      localStorage.getItem.mockClear()
      localStorage.setItem.mockClear()
      localStorage.removeItem.mockClear()
    })

    describe('saveProgress', () => {
      it('saves progress data to localStorage', () => {
        saveProgress('uyir', 5, 12)
        
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'tamil-game-progress-uyir',
          expect.stringContaining('"letterType":"uyir"')
        )
      })

      it('marks as completed when at last letter', () => {
        saveProgress('uyir', 11, 12)
        
        const call = localStorage.setItem.mock.calls[0]
        const data = JSON.parse(call[1])
        expect(data.completed).toBe(true)
      })

      it('handles localStorage errors gracefully', () => {
        localStorage.setItem.mockImplementation(() => {
          throw new Error('Storage full')
        })
        
        // Mock console.warn to suppress expected warning
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        // Should not throw
        expect(() => saveProgress('uyir', 5, 12)).not.toThrow()
        
        // Verify warning was called
        expect(consoleSpy).toHaveBeenCalledWith('Could not save progress:', expect.any(Error))
        consoleSpy.mockRestore()
      })
    })

    describe('loadProgress', () => {
      it('loads progress data from localStorage', () => {
        const mockData = {
          letterType: 'uyir',
          currentIndex: 5,
          totalLetters: 12,
          completed: false
        }
        localStorage.getItem.mockReturnValue(JSON.stringify(mockData))
        
        const result = loadProgress('uyir')
        expect(result).toEqual(mockData)
      })

      it('returns null when no data exists', () => {
        localStorage.getItem.mockReturnValue(null)
        expect(loadProgress('uyir')).toBeNull()
      })

      it('handles JSON parse errors gracefully', () => {
        localStorage.getItem.mockReturnValue('invalid json')
        
        // Mock console.warn to suppress expected warning
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        expect(loadProgress('uyir')).toBeNull()
        
        // Verify warning was called
        expect(consoleSpy).toHaveBeenCalledWith('Could not load progress:', expect.any(Error))
        consoleSpy.mockRestore()
      })
    })

    describe('clearProgress', () => {
      it('removes progress data from localStorage', () => {
        clearProgress('uyir')
        expect(localStorage.removeItem).toHaveBeenCalledWith('tamil-game-progress-uyir')
      })

      it('handles localStorage errors gracefully', () => {
        localStorage.removeItem.mockImplementation(() => {
          throw new Error('Storage error')
        })
        
        // Mock console.warn to suppress expected warning
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        expect(() => clearProgress('uyir')).not.toThrow()
        
        // Verify warning was called
        expect(consoleSpy).toHaveBeenCalledWith('Could not clear progress:', expect.any(Error))
        consoleSpy.mockRestore()
      })
    })
  })

  describe('Touch Event Prevention', () => {
    it('adds touch event listeners to element', () => {
      const mockElement = {
        addEventListener: vi.fn()
      }
      
      preventTouchDefaults(mockElement)
      
      expect(mockElement.addEventListener).toHaveBeenCalledTimes(3)
      expect(mockElement.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: false })
      expect(mockElement.addEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false })
      expect(mockElement.addEventListener).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: false })
    })
  })

  describe('Safe Area Insets', () => {
    it('returns safe area insets from computed style', () => {
      const mockStyle = {
        getPropertyValue: vi.fn()
          .mockReturnValueOnce('20')  // top
          .mockReturnValueOnce('10')  // right  
          .mockReturnValueOnce('30')  // bottom
          .mockReturnValueOnce('10')  // left
      }
      
      getComputedStyle.mockReturnValue(mockStyle)
      
      const insets = getSafeAreaInsets()
      expect(insets).toEqual({
        top: 20,
        right: 10,
        bottom: 30,
        left: 10
      })
    })

    it('returns zeros when properties not found', () => {
      const mockStyle = {
        getPropertyValue: vi.fn(() => '')
      }
      
      getComputedStyle.mockReturnValue(mockStyle)
      
      const insets = getSafeAreaInsets()
      expect(insets).toEqual({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      })
    })
  })
})