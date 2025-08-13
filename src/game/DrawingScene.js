import Phaser from 'phaser';
import { getFontForLetterType, getLetterSize } from '../data/letters.js';

class DrawingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DrawingScene' });
    this.currentLetter = '';
    this.letterType = '';
    this.drawingGraphics = null;
    this.letterText = null;
    this.letterBounds = null;
    this.isDrawing = false;
    this.drawingPath = [];
    this.lastDrawPoint = null;
    this.onDrawingUpdate = null;
    this.onDrawingComplete = null;
  }

  create() {
    // Create drawing graphics layer
    this.drawingGraphics = this.add.graphics();
    this.drawingGraphics.setDepth(1);

    // Set up input handling
    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.on('pointermove', this.handlePointerMove, this);
    this.input.on('pointerup', this.handlePointerUp, this);

    // Handle touch events for mobile
    this.input.addPointer(3); // Support multi-touch

    // Disable context menu on right click
    this.input.manager.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Initialize letter display
    this.updateLetter();
  }

  setLetter(letter, letterType) {
    console.log('DrawingScene.setLetter called:', letter, letterType);
    this.currentLetter = letter;
    this.letterType = letterType;
    if (this.scene.isActive()) {
      this.updateLetter();
    }
  }

  updateLetter() {
    console.log('updateLetter called for:', this.currentLetter);
    if (!this.currentLetter) return;

    // Clear previous letter and drawing
    if (this.letterText) {
      this.letterText.destroy();
    }
    this.clearDrawing();

    // Get responsive font size
    const baseSize = this.getResponsiveFontSize();
    const fontSize = getLetterSize(this.currentLetter, baseSize);
    const fontFamily = getFontForLetterType(this.letterType);
    
    console.log('Letter rendering details:', {
      letter: this.currentLetter,
      fontSize,
      fontFamily,
      screenSize: { width: this.cameras.main.width, height: this.cameras.main.height }
    });

    // Create letter text with proper visibility
    this.letterText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.currentLetter,
      {
        fontSize: `${fontSize}px`,
        fontFamily: fontFamily,
        color: 'transparent',
        stroke: '#333333',
        strokeThickness: Math.max(4, fontSize / 40),
        align: 'center'
      }
    );

    this.letterText.setOrigin(0.5, 0.5);
    this.letterText.setDepth(0);
    
    // Add a subtle background for better visibility
    this.add.graphics()
      .fillStyle(0xffffff, 0.1)
      .fillRect(0, 0, this.cameras.main.width, this.cameras.main.height)
      .setDepth(-1);

    // Calculate letter bounds for drawing detection
    this.calculateLetterBounds();
  }

  getResponsiveFontSize() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const minDimension = Math.min(width, height);
    
    // Responsive font size calculation
    if (width <= 768) {
      // Mobile
      return Math.min(minDimension * 0.6, 300);
    } else if (width <= 1024) {
      // Tablet
      return Math.min(minDimension * 0.5, 350);
    } else {
      // Desktop
      return Math.min(minDimension * 0.4, 400);
    }
  }

  calculateLetterBounds() {
    if (!this.letterText) return;

    const bounds = this.letterText.getBounds();
    const padding = 50; // Extra padding for easier tracing
    
    this.letterBounds = {
      x: bounds.x - padding,
      y: bounds.y - padding,
      width: bounds.width + (padding * 2),
      height: bounds.height + (padding * 2)
    };
  }

  handlePointerDown(pointer) {
    if (!this.letterBounds) return;

    const point = { x: pointer.x, y: pointer.y };
    
    if (this.isPointInBounds(point)) {
      this.isDrawing = true;
      this.drawingPath = [point];
      this.lastDrawPoint = point;
      
      // Start drawing
      this.drawingGraphics.lineStyle(8, 0x4CAF50, 1);
      this.drawingGraphics.beginPath();
      this.drawingGraphics.moveTo(point.x, point.y);
      
      if (this.onDrawingUpdate) {
        this.onDrawingUpdate(this.drawingPath);
      }
    }
  }

  handlePointerMove(pointer) {
    if (!this.isDrawing || !this.letterBounds || !this.lastDrawPoint) return;

    const point = { x: pointer.x, y: pointer.y };
    
    // Check if still within bounds
    if (this.isPointInBounds(point)) {
      // Calculate distance from last point to reduce excessive points
      const distance = Phaser.Math.Distance.Between(
        this.lastDrawPoint.x, this.lastDrawPoint.y,
        point.x, point.y
      );
      
      if (distance > 3) { // Only add point if moved enough
        this.drawingPath.push(point);
        this.lastDrawPoint = point;
        
        // Draw line segment
        this.drawingGraphics.lineTo(point.x, point.y);
        this.drawingGraphics.strokePath();
        
        if (this.onDrawingUpdate) {
          this.onDrawingUpdate(this.drawingPath);
        }
      }
    } else {
      // Pointer moved outside bounds, stop drawing
      this.handlePointerUp(pointer);
    }
  }

  handlePointerUp(pointer) {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.lastDrawPoint = null;
      
      // Complete drawing stroke
      this.drawingGraphics.strokePath();
      
      if (this.onDrawingComplete && this.drawingPath.length > 5) {
        // Only trigger completion if there's a substantial drawing
        this.onDrawingComplete(this.drawingPath);
      }
    }
  }

  isPointInBounds(point) {
    if (!this.letterBounds) return false;
    
    return (
      point.x >= this.letterBounds.x &&
      point.x <= this.letterBounds.x + this.letterBounds.width &&
      point.y >= this.letterBounds.y &&
      point.y <= this.letterBounds.y + this.letterBounds.height
    );
  }

  clearDrawing() {
    if (this.drawingGraphics) {
      this.drawingGraphics.clear();
    }
    this.drawingPath = [];
    this.isDrawing = false;
    this.lastDrawPoint = null;
  }

  setDrawingCallbacks(onUpdate, onComplete) {
    this.onDrawingUpdate = onUpdate;
    this.onDrawingComplete = onComplete;
  }

  // Handle window resize
  resize(width, height) {
    this.cameras.main.setSize(width, height);
    
    // Reposition elements
    if (this.letterText) {
      this.letterText.setPosition(width / 2, height / 2);
      // Update font size for new dimensions
      const baseSize = this.getResponsiveFontSize();
      const fontSize = getLetterSize(this.currentLetter, baseSize);
      this.letterText.setFontSize(fontSize);
      this.calculateLetterBounds();
    }
  }

  // Get current drawing progress (percentage of letter traced)
  getDrawingProgress() {
    if (!this.letterBounds || this.drawingPath.length === 0) return 0;
    
    // Simple progress calculation based on path length vs letter perimeter
    const pathLength = this.calculatePathLength(this.drawingPath);
    const estimatedLetterPerimeter = (this.letterBounds.width + this.letterBounds.height) * 2;
    
    return Math.min(pathLength / estimatedLetterPerimeter, 1) * 100;
  }

  calculatePathLength(path) {
    if (path.length < 2) return 0;
    
    let length = 0;
    for (let i = 1; i < path.length; i++) {
      length += Phaser.Math.Distance.Between(
        path[i-1].x, path[i-1].y,
        path[i].x, path[i].y
      );
    }
    return length;
  }
}

export default DrawingScene;