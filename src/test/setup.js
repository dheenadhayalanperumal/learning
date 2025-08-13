import '@testing-library/jest-dom'

// Mock Audio API for testing
global.Audio = class Audio {
  constructor(src) {
    this.src = src
    this.currentTime = 0
    this.duration = 0
    this.paused = true
  }
  
  play() {
    this.paused = false
    return Promise.resolve()
  }
  
  pause() {
    this.paused = true
  }
}

// Mock canvas and canvas context
HTMLCanvasElement.prototype.getContext = () => {
  return {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Array(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Array(4) })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 10 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  }
}

// Mock window.clearCurrentDrawing
Object.defineProperty(window, 'clearCurrentDrawing', {
  value: vi.fn(),
  writable: true
})