import { useState, useEffect, useCallback } from 'react';
import { throttle } from '../utils/deviceUtils.js';

const useResponsive = () => {
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        isLandscape: false,
        isPortrait: false
      };
    }
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      width,
      height,
      isMobile: width <= 768,
      isTablet: width > 768 && width <= 1024,
      isDesktop: width > 1024,
      isLandscape: width > height,
      isPortrait: height > width
    };
  });

  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setDimensions(prev => {
      // Only update if dimensions actually changed
      if (prev.width === width && prev.height === height) {
        return prev;
      }
      
      return {
        width,
        height,
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 1024,
        isDesktop: width > 1024,
        isLandscape: width > height,
        isPortrait: height > width
      };
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Throttle resize events for better performance
    const throttledResize = throttle(handleResize, 100);
    
    const handleOrientationChange = () => {
      // Delay to ensure proper orientation change
      setTimeout(handleResize, 150);
    };

    // Add event listeners
    window.addEventListener('resize', throttledResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Initial call
    handleResize();

    return () => {
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [handleResize]);

  return dimensions;
};

export default useResponsive;