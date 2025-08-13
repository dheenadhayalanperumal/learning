import React, { useRef, useEffect, useState, useCallback } from 'react';
import { getFontForLetterType, getLetterSize } from '../data/letters.js';

const CanvasDrawing = ({ letter, letterType, letterIndex, savedStrokes = [], onDrawingUpdate, onDrawingComplete, onStrokesChange }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState([]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !letter) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth - 40, container.clientHeight - 40, 500);
    
    canvas.width = size;
    canvas.height = size;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw letter outline with special handling for English letters
    const fontSize = getLetterSize(letter, size * 0.8); // Increased from 0.6 to 0.8
    const fontFamily = getFontForLetterType(letterType);
    
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'transparent';
    
    // Special handling for English letters - brush lettering style
    if (letterType === 'englishCapital' || letterType === 'englishSmall') {
      ctx.strokeStyle = 'rgba(120, 120, 120, 0.8)'; // Brush-like gray color
      // Brush lettering style line width
      ctx.lineWidth = letterType === 'englishCapital' ? 
        Math.max(2.5, fontSize / 25) :  // Brush-like thickness for capitals
        Math.max(2, fontSize / 30); // Brush-like thickness for small letters
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else {
      // Tamil letters keep original styling
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
      ctx.lineWidth = Math.max(2, fontSize / 60);
    }
    
    // Move letter slightly up from center
    ctx.strokeText(letter, canvas.width / 2, (canvas.height / 2));
    
    console.log('Canvas initialized:', canvas.width, 'x', canvas.height);
  }, [letter, letterType, letterIndex]);

  // Get mouse/touch position
  const getPosition = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }, []);

  // Start drawing
  const startDrawing = useCallback((e) => {
    e.preventDefault();
    const pos = getPosition(e);
    if (!pos) return;
    
    console.log('Starting to draw at:', pos);
    setIsDrawing(true);
    setDrawingPath([pos]);
    
    // Draw initial point
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.8;
    
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    ctx.fill();
    
    if (onDrawingUpdate) {
      onDrawingUpdate([pos]);
    }
  }, [getPosition, onDrawingUpdate]);

  // Continue drawing
  const continueDrawing = useCallback((e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const pos = getPosition(e);
    if (!pos) return;
    
    console.log('Drawing to:', pos);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw line from last position to current position
    setDrawingPath(prev => {
      const newPath = [...prev, pos];
      
      if (prev.length > 0) {
        const lastPos = prev[prev.length - 1];
        
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.8;
        
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
      
      if (onDrawingUpdate) {
        onDrawingUpdate(newPath);
      }
      
      return newPath;
    });
  }, [isDrawing, getPosition, onDrawingUpdate]);

  // Stop drawing
  const stopDrawing = useCallback((e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    console.log('Stopped drawing, total points:', drawingPath.length);
    setIsDrawing(false);
    
    if (onDrawingComplete && drawingPath.length > 5) {
      onDrawingComplete(drawingPath);
    }
    
    if (onStrokesChange) {
      onStrokesChange([drawingPath]);
    }
  }, [isDrawing, drawingPath, onDrawingComplete, onStrokesChange]);

  // Clear drawing
  const clearDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw letter outline with special handling for English letters
    const fontSize = getLetterSize(letter, canvas.width * 0.8); // Match the larger size
    const fontFamily = getFontForLetterType(letterType);
    
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'transparent';
    
    // Special handling for English letters - brush lettering style
    if (letterType === 'englishCapital' || letterType === 'englishSmall') {
      ctx.strokeStyle = 'rgba(120, 120, 120, 0.8)'; // Brush-like gray color
      // Brush lettering style line width
      ctx.lineWidth = letterType === 'englishCapital' ? 
        Math.max(2.5, fontSize / 25) :  // Brush-like thickness for capitals
        Math.max(2, fontSize / 30); // Brush-like thickness for small letters
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else {
      // Tamil letters keep original styling
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
      ctx.lineWidth = Math.max(2, fontSize / 60);
    }
    
    // Move letter slightly up from center (same as initial draw)
    ctx.strokeText(letter, canvas.width / 2, (canvas.height / 2));
    
    setDrawingPath([]);
    setIsDrawing(false);
    
    if (onStrokesChange) {
      onStrokesChange([]);
    }
  }, [letter, letterType, onStrokesChange]);

  // Expose clear function globally
  useEffect(() => {
    window.clearCurrentDrawing = clearDrawing;
    return () => {
      delete window.clearCurrentDrawing;
    };
  }, [clearDrawing]);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f8f9fa',
      borderRadius: '8px',
      margin: '10px'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          cursor: 'crosshair',
          touchAction: 'none'
        }}
        onMouseDown={startDrawing}
        onMouseMove={continueDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={continueDrawing}
        onTouchEnd={stopDrawing}
      />
      
      {drawingPath.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: drawingPath.length > 10 ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255,255,255,0.9)',
          padding: '5px 15px',
          borderRadius: '20px',
          fontSize: '14px',
          color: drawingPath.length > 10 ? '#fff' : '#333',
          zIndex: 3
        }}>
          {drawingPath.length > 10 ? '✓ Great tracing!' : `Drawing... (${drawingPath.length} points)`}
        </div>
      )}
    </div>
  );
};

export default CanvasDrawing;