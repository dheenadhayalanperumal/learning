import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { createPathMetrics } from '../utils/pathMetrics.js';
import { getFontForLetterType, getLetterSize } from '../data/letters.js';

/**
 * Path-Locked Canvas Drawing Component
 * Implements precise letter tracing with:
 * - Start gate validation
 * - Path-locked brush that snaps to letter outline
 * - Symmetric coverage with clipping
 * - Pixel-based progress tracking
 */
const CanvasDrawingPathLocked = ({ 
  letter, 
  letterType,
  onDrawingUpdate, 
  onDrawingComplete, 
  onProgress,
  initialStrokes = [] 
}) => {
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const paintCanvasRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [canStartDrawing, setCanStartDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [pathMetrics, setPathMetrics] = useState(null);
  const [maskData, setMaskData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [paintedPixels, setPaintedPixels] = useState(0);
  const [totalMaskPixels, setTotalMaskPixels] = useState(0);

  // Performance optimization: throttled progress updates
  const progressUpdateTimeoutRef = useRef(null);

  // Extract letter properties - handle both new path format and old format
  const letterChar = letter.letter || letter;
  const { svgPath, traceWidth = 40, startS = 0, startRegionRadius = 18, direction = 'any' } = letter;

  // Initialize canvas system
  useEffect(() => {
    if (!canvasRef.current || !svgPath) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth - 40, container.clientHeight - 40, 500);
    
    // Set canvas dimensions
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    // Initialize path metrics
    const metrics = createPathMetrics(svgPath, size, size);
    setPathMetrics(metrics);

    // Create offscreen canvases for mask and paint
    const maskCanvas = document.createElement('canvas');
    const paintCanvas = document.createElement('canvas');
    maskCanvas.width = paintCanvas.width = size;
    maskCanvas.height = paintCanvas.height = size;
    
    maskCanvasRef.current = maskCanvas;
    paintCanvasRef.current = paintCanvas;

    // Initialize mask and render
    initializeMask(maskCanvas, metrics, traceWidth);
    renderScene(canvas, maskCanvas, paintCanvas, metrics, traceWidth, startS, startRegionRadius);
    
    return () => {
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
    };
  }, [svgPath, traceWidth, startS, startRegionRadius]);

  // Initialize the mask canvas with the traceable corridor
  const initializeMask = useCallback((maskCanvas, metrics, traceWidth) => {
    const maskCtx = maskCanvas.getContext('2d');
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    
    // Draw the traceable corridor in white
    maskCtx.strokeStyle = '#ffffff';
    maskCtx.lineWidth = traceWidth;
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';
    
    // Draw path using sampled points
    if (metrics.sampledPoints.length > 0) {
      maskCtx.beginPath();
      const firstPoint = metrics.sampledPoints[0];
      maskCtx.moveTo(firstPoint.x, firstPoint.y);
      
      for (let i = 1; i < metrics.sampledPoints.length; i++) {
        const point = metrics.sampledPoints[i];
        maskCtx.lineTo(point.x, point.y);
      }
      maskCtx.stroke();
    }

    // Extract mask data for pixel counting
    const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const data = imageData.data;
    let whitePixelCount = 0;
    
    // Count white pixels (alpha > 0 in the mask)
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) { // Alpha channel
        whitePixelCount++;
      }
    }
    
    setMaskData(imageData);
    setTotalMaskPixels(whitePixelCount);
    setProgress(0);
    setPaintedPixels(0);
  }, []);

  // Main render function
  const renderScene = useCallback((canvas, maskCanvas, paintCanvas, metrics, traceWidth, startS, startRegionRadius) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw light background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the actual letter character first
    if (letterChar && letterType) {
      const fontSize = getLetterSize(letterChar, canvas.width * 0.6);
      const fontFamily = getFontForLetterType(letterType);
      
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'transparent';
      
      // Letter outline styling based on letter type
      if (letterType === 'englishCapital' || letterType === 'englishSmall') {
        ctx.strokeStyle = 'rgba(120, 120, 120, 0.7)';
        ctx.lineWidth = letterType === 'englishCapital' ? 
          Math.max(2.5, fontSize / 25) : 
          Math.max(2, fontSize / 30);
      } else {
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        ctx.lineWidth = Math.max(2, fontSize / 60);
      }
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeText(letterChar, canvas.width / 2, canvas.height / 2);
    }
    
    // Draw the guide path (light gray corridor) - more subtle now
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.2)';
    ctx.lineWidth = traceWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (metrics.sampledPoints.length > 0) {
      ctx.beginPath();
      const firstPoint = metrics.sampledPoints[0];
      ctx.moveTo(firstPoint.x, firstPoint.y);
      
      for (let i = 1; i < metrics.sampledPoints.length; i++) {
        const point = metrics.sampledPoints[i];
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
    }
    
    // Draw center guideline (dashed) - more subtle
    ctx.strokeStyle = 'rgba(33, 150, 243, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    
    if (metrics.sampledPoints.length > 0) {
      ctx.beginPath();
      const firstPoint = metrics.sampledPoints[0];
      ctx.moveTo(firstPoint.x, firstPoint.y);
      
      for (let i = 1; i < metrics.sampledPoints.length; i++) {
        const point = metrics.sampledPoints[i];
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    
    // Draw start region indicator
    const startPoint = metrics.getStartPoint(startS);
    if (startPoint) {
      ctx.fillStyle = canStartDrawing ? 'rgba(76, 175, 80, 0.3)' : 'rgba(33, 150, 243, 0.3)';
      ctx.strokeStyle = canStartDrawing ? '#4CAF50' : '#2196F3';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, startRegionRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Add "START" text
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('START', startPoint.x, startPoint.y - startRegionRadius - 10);
    }
    
    // Composite the painted strokes with mask clipping
    if (paintCanvas) {
      // Apply mask using globalCompositeOperation
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      
      // First draw the mask as a clipping region
      ctx.globalAlpha = 1;
      ctx.drawImage(maskCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-in';
      
      // Then draw the paint canvas
      ctx.drawImage(paintCanvas, 0, 0);
      ctx.restore();
    }
  }, [canStartDrawing, letter, letterType, letterChar]);

  // Handle pointer events
  const getPointerPosition = useCallback((e) => {
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

  const startDrawing = useCallback((e) => {
    e.preventDefault();
    
    const pos = getPointerPosition(e);
    if (!pos || !pathMetrics) return;
    
    // Check if starting in the valid start region
    const inStartRegion = pathMetrics.isInStartRegion(pos.x, pos.y, startS, startRegionRadius);
    
    if (!inStartRegion) {
      setCanStartDrawing(false);
      return;
    }
    
    setCanStartDrawing(true);
    setIsDrawing(true);
    
    // Project to nearest path point
    const projectedPoint = pathMetrics.projectPointToPath(pos.x, pos.y);
    if (!projectedPoint) return;
    
    const newStroke = [projectedPoint];
    setCurrentStroke(newStroke);
    
    // Draw initial brush stroke
    drawBrushStroke(projectedPoint, null);
    
    if (onDrawingUpdate) {
      onDrawingUpdate([projectedPoint]);
    }
  }, [getPointerPosition, pathMetrics, startS, startRegionRadius, onDrawingUpdate]);

  const continueDrawing = useCallback((e) => {
    if (!isDrawing || !pathMetrics) return;
    e.preventDefault();
    
    const pos = getPointerPosition(e);
    if (!pos) return;
    
    // Project pointer to nearest path point
    const projectedPoint = pathMetrics.projectPointToPath(pos.x, pos.y);
    if (!projectedPoint) return;
    
    // Check if we're still reasonably close to the path
    if (projectedPoint.distanceFromPath > traceWidth / 2) {
      // Still draw, but the projection keeps us on the path
    }
    
    setCurrentStroke(prev => {
      const newStroke = [...prev, projectedPoint];
      
      // Draw brush stroke from previous point
      const prevPoint = prev[prev.length - 1];
      drawBrushStroke(projectedPoint, prevPoint);
      
      // Throttled progress update
      updateProgressThrottled();
      
      if (onDrawingUpdate) {
        onDrawingUpdate(newStroke);
      }
      
      return newStroke;
    });
  }, [isDrawing, getPointerPosition, pathMetrics, traceWidth, onDrawingUpdate]);

  const stopDrawing = useCallback((e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    setIsDrawing(false);
    
    // Final progress update
    updateProgress();
    
    if (currentStroke.length > 3 && onDrawingComplete) {
      onDrawingComplete(currentStroke);
    }
    
    setCurrentStroke([]);
  }, [isDrawing, currentStroke, onDrawingComplete]);

  // Draw a brush stroke centered on the path
  const drawBrushStroke = useCallback((point, prevPoint) => {
    const paintCanvas = paintCanvasRef.current;
    if (!paintCanvas || !point) return;
    
    const ctx = paintCanvas.getContext('2d');
    const brushWidth = Math.min(traceWidth * 0.9, 35); // Slightly smaller than corridor
    
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.8)';
    ctx.lineWidth = brushWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (prevPoint) {
      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    } else {
      // Draw initial dot
      ctx.beginPath();
      ctx.arc(point.x, point.y, brushWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Re-render the main canvas
    if (canvasRef.current && pathMetrics) {
      renderScene(
        canvasRef.current,
        maskCanvasRef.current,
        paintCanvas,
        pathMetrics,
        traceWidth,
        startS,
        startRegionRadius
      );
    }
  }, [pathMetrics, traceWidth, startS, startRegionRadius, renderScene]);

  // Progress calculation with throttling
  const updateProgressThrottled = useCallback(() => {
    if (progressUpdateTimeoutRef.current) return;
    
    progressUpdateTimeoutRef.current = setTimeout(() => {
      updateProgress();
      progressUpdateTimeoutRef.current = null;
    }, 100); // Update every 100ms max
  }, []);

  const updateProgress = useCallback(() => {
    const paintCanvas = paintCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    
    if (!paintCanvas || !maskCanvas || totalMaskPixels === 0) return;
    
    const paintCtx = paintCanvas.getContext('2d');
    const paintData = paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
    const maskCtx = maskCanvas.getContext('2d');
    const maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    
    let coveredPixels = 0;
    
    // Count pixels that are both painted and within the mask
    for (let i = 0; i < paintData.data.length; i += 4) {
      const paintAlpha = paintData.data[i + 3];
      const maskAlpha = maskImageData.data[i + 3];
      
      if (paintAlpha > 0 && maskAlpha > 0) {
        coveredPixels++;
      }
    }
    
    const newProgress = Math.min((coveredPixels / totalMaskPixels) * 100, 100);
    setProgress(newProgress);
    setPaintedPixels(coveredPixels);
    
    if (onProgress) {
      onProgress(newProgress);
    }
    
    // Check for completion
    if (newProgress >= 98 && onDrawingComplete) {
      setTimeout(() => onDrawingComplete(currentStroke), 100);
    }
  }, [totalMaskPixels, currentStroke, onProgress, onDrawingComplete]);

  // Clear drawing
  const clearDrawing = useCallback(() => {
    const paintCanvas = paintCanvasRef.current;
    if (!paintCanvas) return;
    
    const ctx = paintCanvas.getContext('2d');
    ctx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
    
    setCurrentStroke([]);
    setProgress(0);
    setPaintedPixels(0);
    
    // Re-render main canvas
    if (pathMetrics && canvasRef.current) {
      renderScene(
        canvasRef.current,
        maskCanvasRef.current,
        paintCanvas,
        pathMetrics,
        traceWidth,
        startS,
        startRegionRadius
      );
    }
  }, [pathMetrics, traceWidth, startS, startRegionRadius, renderScene]);

  // Expose clear function globally for compatibility
  useEffect(() => {
    window.clearCurrentDrawing = clearDrawing;
    return () => {
      delete window.clearCurrentDrawing;
    };
  }, [clearDrawing]);

  // Handle hover to show start region feedback
  const handleMouseMove = useCallback((e) => {
    if (isDrawing || !pathMetrics) return;
    
    const pos = getPointerPosition(e);
    if (!pos) return;
    
    const inStartRegion = pathMetrics.isInStartRegion(pos.x, pos.y, startS, startRegionRadius);
    setCanStartDrawing(inStartRegion);
  }, [isDrawing, pathMetrics, startS, startRegionRadius, getPointerPosition]);

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
          cursor: isDrawing ? 'grabbing' : (canStartDrawing ? 'crosshair' : 'not-allowed'),
          touchAction: 'none'
        }}
        onMouseDown={startDrawing}
        onMouseMove={isDrawing ? continueDrawing : handleMouseMove}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={continueDrawing}
        onTouchEnd={stopDrawing}
      />
      
      {/* Progress indicator */}
      {progress > 0 && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: progress >= 98 ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255,255,255,0.9)',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          color: progress >= 98 ? '#fff' : '#333',
          fontWeight: 'bold',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 10
        }}>
          {progress >= 98 ? '🎉 Perfect!' : `${Math.round(progress)}%`}
        </div>
      )}
      
      {/* Start instruction */}
      {!isDrawing && progress === 0 && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(33, 150, 243, 0.9)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          zIndex: 10
        }}>
          Touch the START circle to begin
        </div>
      )}
      
      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '5px',
          fontSize: '10px',
          borderRadius: '3px',
          zIndex: 10
        }}>
          Pixels: {paintedPixels}/{totalMaskPixels}<br/>
          Progress: {progress.toFixed(1)}%<br/>
          Drawing: {isDrawing ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
};

export default CanvasDrawingPathLocked;