/**
 * Simple SVG Path Parser for basic tracing functionality
 * Handles M, L, Q, and C commands which should cover most letter paths
 */

export class SimpleSVGPathParser {
  constructor(pathString) {
    this.pathString = pathString;
    this.commands = this.parseCommands(pathString);
  }

  parseCommands(pathString) {
    const commands = [];
    const regex = /([MLQCZ])([^MLQCZ]*)/gi;
    let match;

    while ((match = regex.exec(pathString)) !== null) {
      const command = match[1].toUpperCase();
      const params = match[2].trim().split(/[\s,]+/).filter(p => p).map(Number);
      
      commands.push({
        command,
        params,
        absolute: match[1] === match[1].toUpperCase()
      });
    }

    return commands;
  }

  // Sample points along the path
  samplePoints(numSamples = 100) {
    const points = [];
    let currentPos = { x: 0, y: 0 };
    
    for (let t = 0; t <= 1; t += 1 / numSamples) {
      const point = this.getPointAtT(t);
      if (point) {
        points.push({
          ...point,
          t: t,
          tangent: this.getTangentAtT(t)
        });
      }
    }
    
    return points;
  }

  getPointAtT(t) {
    // Find which segment this t falls into
    const totalSegments = this.commands.length;
    const segmentT = t * totalSegments;
    const segmentIndex = Math.floor(segmentT);
    const localT = segmentT - segmentIndex;
    
    if (segmentIndex >= this.commands.length) {
      return this.getLastPoint();
    }

    return this.evaluateSegment(segmentIndex, localT);
  }

  evaluateSegment(segmentIndex, t) {
    if (segmentIndex >= this.commands.length) return null;
    
    const command = this.commands[segmentIndex];
    const prevPoint = this.getSegmentStartPoint(segmentIndex);
    
    switch (command.command) {
      case 'M':
        return { x: command.params[0], y: command.params[1] };
        
      case 'L':
        return this.lerp(prevPoint, 
          { x: command.params[0], y: command.params[1] }, t);
        
      case 'Q':
        return this.quadraticBezier(
          prevPoint,
          { x: command.params[0], y: command.params[1] },
          { x: command.params[2], y: command.params[3] },
          t
        );
        
      case 'C':
        return this.cubicBezier(
          prevPoint,
          { x: command.params[0], y: command.params[1] },
          { x: command.params[2], y: command.params[3] },
          { x: command.params[4], y: command.params[5] },
          t
        );
        
      default:
        return prevPoint;
    }
  }

  getSegmentStartPoint(segmentIndex) {
    if (segmentIndex === 0) return { x: 0, y: 0 };
    
    // Find the last move or draw command
    for (let i = segmentIndex - 1; i >= 0; i--) {
      const cmd = this.commands[i];
      switch (cmd.command) {
        case 'M':
          return { x: cmd.params[0], y: cmd.params[1] };
        case 'L':
          return { x: cmd.params[0], y: cmd.params[1] };
        case 'Q':
          return { x: cmd.params[2], y: cmd.params[3] };
        case 'C':
          return { x: cmd.params[4], y: cmd.params[5] };
      }
    }
    
    return { x: 0, y: 0 };
  }

  getLastPoint() {
    for (let i = this.commands.length - 1; i >= 0; i--) {
      const cmd = this.commands[i];
      if (cmd.params.length >= 2) {
        const paramCount = cmd.params.length;
        return { 
          x: cmd.params[paramCount - 2], 
          y: cmd.params[paramCount - 1] 
        };
      }
    }
    return { x: 0, y: 0 };
  }

  getTangentAtT(t) {
    const delta = 0.001;
    const p1 = this.getPointAtT(Math.max(0, t - delta));
    const p2 = this.getPointAtT(Math.min(1, t + delta));
    
    if (!p1 || !p2) return { x: 1, y: 0 };
    
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return { x: 1, y: 0 };
    
    return { x: dx / length, y: dy / length };
  }

  // Utility functions for curve evaluation
  lerp(p1, p2, t) {
    return {
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t
    };
  }

  quadraticBezier(p0, p1, p2, t) {
    const t2 = t * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    
    return {
      x: mt2 * p0.x + 2 * mt * t * p1.x + t2 * p2.x,
      y: mt2 * p0.y + 2 * mt * t * p1.y + t2 * p2.y
    };
  }

  cubicBezier(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    
    return {
      x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
      y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y
    };
  }

  // Calculate approximate path length
  getLength() {
    const samples = this.samplePoints(200);
    let length = 0;
    
    for (let i = 1; i < samples.length; i++) {
      const prev = samples[i - 1];
      const curr = samples[i];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    
    return length;
  }

  // Get bounding box
  getBounds() {
    const samples = this.samplePoints(100);
    
    if (samples.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    for (const point of samples) {
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