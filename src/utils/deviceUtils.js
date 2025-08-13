// Device detection utilities
export const isTouchDevice = () => {
  return ('ontouchstart' in window) || 
         (navigator.maxTouchPoints > 0) || 
         (navigator.msMaxTouchPoints > 0);
};

export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

export const isMobile = () => {
  return window.innerWidth <= 768;
};

export const isTablet = () => {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

export const isDesktop = () => {
  return window.innerWidth > 1024;
};

// Performance optimizations
export const requestIdleCallback = (callback) => {
  if (window.requestIdleCallback) {
    return window.requestIdleCallback(callback);
  } else {
    return setTimeout(callback, 1);
  }
};

export const cancelIdleCallback = (id) => {
  if (window.cancelIdleCallback) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};

// Touch event prevention for better drawing experience
export const preventTouchDefaults = (element) => {
  element.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  element.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  element.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
};

// Optimal font size calculation
export const calculateOptimalFontSize = (screenWidth, screenHeight, letterType) => {
  const minDimension = Math.min(screenWidth, screenHeight);
  const maxDimension = Math.max(screenWidth, screenHeight);
  
  let baseSize;
  
  if (screenWidth <= 480) {
    // Small mobile
    baseSize = minDimension * 0.55;
  } else if (screenWidth <= 768) {
    // Large mobile
    baseSize = minDimension * 0.6;
  } else if (screenWidth <= 1024) {
    // Tablet
    baseSize = minDimension * 0.5;
  } else {
    // Desktop
    baseSize = Math.min(minDimension * 0.4, 400);
  }
  
  // Adjust for Tamil letters which need more space
  if (letterType && (letterType.includes('tamil') || letterType.includes('uyir'))) {
    baseSize = Math.min(baseSize * 1.1, maxDimension * 0.7);
  }
  
  return Math.round(baseSize);
};

// Debounce function for performance
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for drawing events
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

// Safe area detection for notched devices
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || style.getPropertyValue('env(safe-area-inset-left)') || '0')
  };
};

// Viewport height calculation (handles mobile address bar)
export const getViewportHeight = () => {
  return window.visualViewport ? window.visualViewport.height : window.innerHeight;
};

// Audio support detection
export const supportsAudio = () => {
  try {
    return !!(typeof Audio !== 'undefined' && Audio.prototype.canPlayType);
  } catch (e) {
    return false;
  }
};

// Local storage utilities with validation
export const saveProgress = (letterType, currentIndex, totalLetters) => {
  if (!letterType || typeof currentIndex !== 'number' || typeof totalLetters !== 'number') {
    console.warn('Invalid progress data provided');
    return;
  }
  
  try {
    const progressData = {
      letterType,
      currentIndex: Math.max(0, currentIndex),
      totalLetters: Math.max(1, totalLetters),
      timestamp: Date.now(),
      completed: currentIndex >= totalLetters - 1
    };
    localStorage.setItem(`tamil-game-progress-${letterType}`, JSON.stringify(progressData));
  } catch (e) {
    console.warn('Could not save progress:', e);
  }
};

export const loadProgress = (letterType) => {
  if (!letterType) {
    return null;
  }
  
  try {
    const saved = localStorage.getItem(`tamil-game-progress-${letterType}`);
    if (!saved) return null;
    
    const data = JSON.parse(saved);
    
    // Validate loaded data structure
    if (data && typeof data === 'object' && 
        data.letterType && 
        typeof data.currentIndex === 'number' &&
        typeof data.totalLetters === 'number') {
      return data;
    }
    
    return null;
  } catch (e) {
    console.warn('Could not load progress:', e);
    return null;
  }
};

export const clearProgress = (letterType) => {
  try {
    localStorage.removeItem(`tamil-game-progress-${letterType}`);
  } catch (e) {
    console.warn('Could not clear progress:', e);
  }
};