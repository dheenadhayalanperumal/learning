/**
 * Path Metrics Utility
 * Handles SVG path sampling, projection, and geometric operations
 * for precise letter tracing with path-locked brush system
 */
import { SimpleSVGPathParser } from './svgPathParser.js';

export class PathMetrics {
  constructor(svgPath, canvasWidth, canvasHeight) {
    this.svgPath = svgPath;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.sampledPoints = [];
    this.totalLength = 0;
    this.segmentLengths = [];
    this.cumulativeLengths = [];
    
    this._initializePath();
  }

  _initializePath() {
    // Create Path2D object from SVG path
    this.path2D = new Path2D(this.svgPath);
    
    // Create SVG parser for accurate path sampling
    this.svgParser = new SimpleSVGPathParser(this.svgPath);
    
    // Sample points along the path for fast lookup
    this._samplePath();
  }

  _samplePath(sampleDistance = 3) {
    // Use SVG parser to get accurate path sampling
    const pathBounds = this.svgParser.getBounds();
    this.totalLength = this.svgParser.getLength();
    
    // Scale the path to fit canvas
    const scaleX = this.canvasWidth / Math.max(pathBounds.width, 1);
    const scaleY = this.canvasHeight / Math.max(pathBounds.height, 1);
    const scale = Math.min(scaleX, scaleY) * 0.8; // Leave some margin
    
    const offsetX = (this.canvasWidth - pathBounds.width * scale) / 2 - pathBounds.x * scale;
    const offsetY = (this.canvasHeight - pathBounds.height * scale) / 2 - pathBounds.y * scale;
    
    // Sample points from the SVG parser
    const numSamples = Math.max(50, Math.ceil(this.totalLength / sampleDistance));
    const rawPoints = this.svgParser.samplePoints(numSamples);
    
    this.sampledPoints = [];
    this.segmentLengths = [];
    this.cumulativeLengths = [0];
    
    // Transform and prepare points
    for (let i = 0; i < rawPoints.length; i++) {
      const rawPoint = rawPoints[i];
      
      // Transform to canvas coordinates
      const transformedPoint = {
        x: rawPoint.x * scale + offsetX,
        y: rawPoint.y * scale + offsetY,
        tangent: rawPoint.tangent || { x: 1, y: 0 },
        normal: { 
          x: -(rawPoint.tangent?.y || 0), 
          y: rawPoint.tangent?.x || 1 
        },
        t: rawPoint.t,
        index: i
      };
      
      if (i > 0) {
        const prevPoint = this.sampledPoints[i - 1];
        const segmentLength = this._distance(transformedPoint, prevPoint);
        this.segmentLengths.push(segmentLength);
        this.cumulativeLengths.push(this.cumulativeLengths[i - 1] + segmentLength);
      }
      
      this.sampledPoints.push(transformedPoint);
    }
    
    this.totalLength = this.cumulativeLengths[this.cumulativeLengths.length - 1] || 0;
  }

  _approximatePathLength(ctx, steps = 1000) {
    let length = 0;
    let prevPoint = null;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const point = this._getPointAtT(ctx, t);
      
      if (point && prevPoint) {
        length += this._distance(point, prevPoint);
      }
      prevPoint = point;
    }
    
    return length;
  }

  _getPointAtT(ctx, t) {
    // This is a simplified approach - for production, you'd want svg-path-properties
    // or a more sophisticated path sampling method
    
    // Use canvas path measurement as approximation
    const pathLength = this.totalLength || 1000; // rough estimate
    const targetLength = t * pathLength;
    
    // For now, use a simple geometric approximation
    // In a real implementation, you'd parse the SVG path commands
    return this._approximatePointOnPath(t);
  }

  _approximatePointOnPath(t) {
    // Use canvas path measurement for more accurate sampling
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvasWidth;
    tempCanvas.height = this.canvasHeight;
    const ctx = tempCanvas.getContext('2d');
    
    const path = new Path2D(this.svgPath);
    
    // Try to measure the path more accurately using canvas APIs
    try {
      // This is a workaround - canvas doesn't directly give us path points
      // We'll use a different approach by sampling the stroke
      ctx.lineWidth = 1;
      ctx.stroke(path);
      
      // For now, return a point based on the viewbox center
      // In a real implementation, you'd use a proper SVG path library
      return {
        x: this.canvasWidth / 2,
        y: this.canvasHeight / 2
      };
    } catch (e) {
      // Fallback for invalid paths
      return {
        x: this.canvasWidth / 2,
        y: this.canvasHeight / 2
      };
    } finally {
      tempCanvas.remove();
    }
  }

  _calculateTangent(index, totalSamples, ctx) {
    const delta = 0.001; // Small step for derivative approximation
    const t = index / totalSamples;
    
    const point1 = this._getPointAtT(ctx, Math.max(0, t - delta));
    const point2 = this._getPointAtT(ctx, Math.min(1, t + delta));
    
    if (point1 && point2) {
      const dx = point2.x - point1.x;
      const dy = point2.y - point1.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length > 0) {
        return { x: dx / length, y: dy / length };
      }
    }
    
    return { x: 1, y: 0 }; // Default horizontal tangent
  }

  _distance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Find the nearest point on the path to a given coordinate
  projectPointToPath(x, y) {
    if (this.sampledPoints.length === 0) {
      return null;
    }

    let minDistance = Infinity;
    let nearestPoint = null;
    let nearestIndex = 0;

    // Find nearest sampled point
    for (let i = 0; i < this.sampledPoints.length; i++) {
      const point = this.sampledPoints[i];
      const distance = this._distance({ x, y }, point);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
        nearestIndex = i;
      }
    }

    // Interpolate between nearest neighbors for smoother projection
    if (nearestIndex > 0 && nearestIndex < this.sampledPoints.length - 1) {
      const prev = this.sampledPoints[nearestIndex - 1];
      const next = this.sampledPoints[nearestIndex + 1];
      
      // Check if interpolation with neighbors gives a better result
      const prevDist = this._distance({ x, y }, prev);
      const nextDist = this._distance({ x, y }, next);
      
      if (prevDist < minDistance) {
        nearestPoint = this._interpolatePoints(nearestPoint, prev, 0.3);
      } else if (nextDist < minDistance) {
        nearestPoint = this._interpolatePoints(nearestPoint, next, 0.3);
      }
    }

    return {
      ...nearestPoint,
      distanceFromPath: minDistance,
      pathIndex: nearestIndex
    };
  }

  _interpolatePoints(p1, p2, factor) {
    return {
      x: p1.x + (p2.x - p1.x) * factor,
      y: p1.y + (p2.y - p1.y) * factor,
      tangent: {
        x: p1.tangent.x + (p2.tangent.x - p1.tangent.x) * factor,
        y: p1.tangent.y + (p2.tangent.y - p1.tangent.y) * factor
      },
      normal: {
        x: p1.normal.x + (p2.normal.x - p1.normal.x) * factor,
        y: p1.normal.y + (p2.normal.y - p1.normal.y) * factor
      }
    };
  }

  // Get point at specific arc length along path
  getPointAtLength(length) {
    if (this.cumulativeLengths.length === 0) {
      return null;
    }

    // Clamp length to valid range
    length = Math.max(0, Math.min(length, this.totalLength));

    // Binary search for the right segment
    let left = 0;
    let right = this.cumulativeLengths.length - 1;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.cumulativeLengths[mid] <= length) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    const segmentIndex = Math.max(0, left - 1);
    
    if (segmentIndex >= this.sampledPoints.length) {
      return this.sampledPoints[this.sampledPoints.length - 1];
    }

    const point = this.sampledPoints[segmentIndex];
    
    // Interpolate within the segment if needed
    if (segmentIndex < this.sampledPoints.length - 1) {
      const segmentStart = this.cumulativeLengths[segmentIndex];
      const segmentEnd = this.cumulativeLengths[segmentIndex + 1];
      const segmentProgress = (length - segmentStart) / (segmentEnd - segmentStart);
      
      if (segmentProgress > 0 && segmentProgress < 1) {
        const nextPoint = this.sampledPoints[segmentIndex + 1];
        return this._interpolatePoints(point, nextPoint, segmentProgress);
      }
    }

    return point;
  }

  // Get the start point of the path (at specified arc length or beginning)
  getStartPoint(startLength = 0) {
    return this.getPointAtLength(startLength);
  }

  // Check if a point is within the start region
  isInStartRegion(x, y, startLength = 0, regionRadius = 18) {
    const startPoint = this.getStartPoint(startLength);
    if (!startPoint) return false;
    
    const distance = this._distance({ x, y }, startPoint);
    return distance <= regionRadius;
  }

  // Get path bounds for mask creation
  getPathBounds() {
    if (this.sampledPoints.length === 0) {
      return { x: 0, y: 0, width: this.canvasWidth, height: this.canvasHeight };
    }

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const point of this.sampledPoints) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
}

// Utility function to create a PathMetrics instance
export function createPathMetrics(svgPath, canvasWidth, canvasHeight) {
  return new PathMetrics(svgPath, canvasWidth, canvasHeight);
}

// Enhanced SVG path parser for better accuracy (optional upgrade)
export class SVGPathParser {
  static parsePathCommands(pathString) {
    // This would contain a full SVG path parser
    // For now, return empty array - implement as needed
    return [];
  }
  
  static getPathLength(pathCommands) {
    // Calculate actual path length from parsed commands
    return 0;
  }
  
  static getPointAtLength(pathCommands, length) {
    // Get exact point at arc length using parsed commands
    return { x: 0, y: 0 };
  }
}