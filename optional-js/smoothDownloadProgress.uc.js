// ==UserScript==
// @name           Smooth Download Progress
// @description    Uses XUL overlay to replace the download progress indicator with a smoothly animated version
// @author         Lockframe
// @include        main
// ==/UserScript==

// Get the appropriate progress color (accent color)
  function getProgressColor() {
    try {
      const style = window.getComputedStyle(document.documentElement);
      
      // Try to get --accentAuto variable first
      const accentAuto = style.getPropertyValue('--accentAuto');
      if (accentAuto && accentAuto.trim() !== '') {
        return accentAuto.trim();
      }
      
      // Try to get the custom --progressRing variable
      const progressRingColor = style.getPropertyValue('--progressRing');
      if (progressRingColor && progressRingColor.trim() !== '') {
        return progressRingColor.trim();
      }
      
      // Try Firefox's default accent color
      const themeColor = style.getPropertyValue('--toolbarbutton-icon-fill-attention');
      if (themeColor && themeColor.trim() !== '') {
        return themeColor.trim();
      }
      
      // Final fallback to red
      return FALLBACK_PROGRESS_COLOR;
    } catch (e) {
      console.error('Error getting progress color:', e);
      return FALLBACK_PROGRESS_COLOR;
    }
  }

(function() {
  'use strict';
  
  // Store references to original elements and state
  let originalProgressElement = null;
  let progressContainer = null;
  let canvasElement = null;
  let currentProgress = 0;
  let targetProgress = 0;
  let animationStartTime = 0;
  let animationFrame = null;
  let themeObserver = null;
  
  // Configuration
  const ANIMATION_DURATION = 183; // ms (matching your desired transition time)
  const CANVAS_SIZE = 40; // Size of the canvas (scaled down in display)
  
  // ===== ADJUSTABLE PARAMETERS =====
  // You can manually edit these values to adjust the ring appearance
  const RING_WIDTH = 3; // Width of the progress ring
  const INNER_RADIUS = 2; // Inner radius of the mask (DECREASE to make ring LARGER)
  const CANVAS_SCALE = 1.4; // Scale of the canvas (INCREASE to make everything LARGER)
  const POSITION_OFFSET_X = 0; // Horizontal position adjustment (negative moves left)
  const POSITION_OFFSET_Y = 0; // Vertical position adjustment (negative moves up)
  // ===================================
  
  // Fallback colors for progress ring (accent colors)
  const FALLBACK_PROGRESS_COLOR = '#ff0000';
  // Background ring colors for light and dark themes
  const LIGHT_THEME_BG_COLOR = 'rgba(0,0,0,.06063)';
  const DARK_THEME_BG_COLOR = 'rgba(255,255,255,.06047)';
  
  // Function to detect if we're in dark mode
  function isDarkTheme() {
    try {
      // Check for Firefox's dark theme indicators
      const rootStyle = window.getComputedStyle(document.documentElement);
      
      // Check for common dark theme indicators
      const lwtheme = rootStyle.getPropertyValue('--lwt-accent-color');
      const toolbarColor = rootStyle.getPropertyValue('--toolbar-bgcolor');
      
      // If we have toolbar background color, check if it's dark
      if (toolbarColor) {
        // Convert color to RGB and calculate luminance
        const tempDiv = document.createElement('div');
        tempDiv.style.color = toolbarColor;
        document.body.appendChild(tempDiv);
        const computedColor = window.getComputedStyle(tempDiv).color;
        document.body.removeChild(tempDiv);
        
        // Parse RGB values
        const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          
          // Calculate relative luminance
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          return luminance < 0.5; // Dark if luminance is low
        }
      }
      
      // Fallback: check if browser prefers dark color scheme
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      console.error('Error detecting theme:', e);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }
  
  // Get the appropriate background ring color
  function getBackgroundRingColor() {
    try {
      const style = window.getComputedStyle(document.documentElement);
      
      // Try to get the custom --progressRing variable first for background
      const progressRingBg = style.getPropertyValue('--progressRing-bg');
      if (progressRingBg && progressRingBg.trim() !== '') {
        return progressRingBg.trim();
      }
      
      // Fallback to theme-appropriate colors
      return isDarkTheme() ? DARK_THEME_BG_COLOR : LIGHT_THEME_BG_COLOR;
    } catch (e) {
      console.error('Error getting background ring color:', e);
      return isDarkTheme() ? DARK_THEME_BG_COLOR : LIGHT_THEME_BG_COLOR;
    }
  }
  
  // Create and inject the canvas element to replace the progress indicator
  function createProgressCanvas() {
    // Find the downloads button
    const downloadsButton = document.getElementById('downloads-button');
    if (!downloadsButton) {
      setTimeout(createProgressCanvas, 500);
      return;
    }
    
    // Find the progress indicator container
    originalProgressElement = document.getElementById('downloads-indicator-progress-inner');
    if (!originalProgressElement) {
      setTimeout(createProgressCanvas, 500);
      return;
    }
    
    progressContainer = originalProgressElement.parentElement;
    
    // Create canvas element
    canvasElement = document.createElement('canvas');
    canvasElement.width = CANVAS_SIZE;
    canvasElement.height = CANVAS_SIZE;
    canvasElement.id = 'download-progress-canvas';
    canvasElement.style.cssText = `
      width: 20px !important;
      height: 20px !important;
      position: relative !important;
      transform: scale(${CANVAS_SCALE}) !important;
      left: ${POSITION_OFFSET_X}px !important;
      top: ${POSITION_OFFSET_Y}px !important;
    `;
    
    // Replace the original element with our canvas
    if (progressContainer) {
      // Hide original element
      originalProgressElement.style.display = 'none';
      // Insert canvas
      progressContainer.appendChild(canvasElement);
    }
    
    // Setup theme change monitoring
    setupThemeMonitoring();
    
    // Start monitoring for progress changes
    setupProgressMonitoring();
    
    // Draw initial state
    drawProgressRing(0);
  }
  
  // Setup monitoring for theme changes
  function setupThemeMonitoring() {
    let lastAccentColor = getProgressColor();
    let lastBgColor = getBackgroundRingColor();
    
    // Monitor system color scheme changes
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', () => {
      // Redraw with new theme colors
      drawProgressRing(currentProgress);
      lastAccentColor = getProgressColor();
      lastBgColor = getBackgroundRingColor();
    });
    
    // Monitor for attribute changes on document element (theme changes)
    themeObserver = new MutationObserver(function(mutations) {
      let shouldRedraw = false;
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes') {
          // Check for theme-related attribute changes
          if (mutation.attributeName === 'style' || 
              mutation.attributeName === 'class' || 
              mutation.attributeName === 'lwtheme' ||
              mutation.attributeName === 'data-theme') {
            shouldRedraw = true;
          }
        }
      });
      
      if (shouldRedraw) {
        // Small delay to ensure CSS variables are updated
        setTimeout(() => {
          drawProgressRing(currentProgress);
          lastAccentColor = getProgressColor();
          lastBgColor = getBackgroundRingColor();
        }, 50);
      }
    });
    
    // Start observing document element for theme changes
    themeObserver.observe(document.documentElement, { 
      attributes: true,
      attributeFilter: ['style', 'class', 'lwtheme', 'data-theme']
    });
    
    // Also monitor the body for theme changes
    themeObserver.observe(document.body, { 
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    // Periodic check for CSS variable changes (catches system accent color changes)
    const colorCheckInterval = setInterval(() => {
      const currentAccentColor = getProgressColor();
      const currentBgColor = getBackgroundRingColor();
      
      if (currentAccentColor !== lastAccentColor || currentBgColor !== lastBgColor) {
        drawProgressRing(currentProgress);
        lastAccentColor = currentAccentColor;
        lastBgColor = currentBgColor;
      }
    }, 250); // Check every 250ms for color changes
    
    // Store interval reference for cleanup
    window.colorCheckInterval = colorCheckInterval;
  }
  
  // Draw the progress ring on the canvas
  function drawProgressRing(progressPercent) {
    if (!canvasElement) return;
    
    const ctx = canvasElement.getContext('2d');
    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;
    const radius = CANVAS_SIZE / 2 - RING_WIDTH / 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Get current colors
    const progressColor = getProgressColor(); // Accent color for progress fill
    const ringBgColor = getBackgroundRingColor(); // Background ring color
    
    // Draw background ring (full circle)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = ringBgColor;
    ctx.lineWidth = RING_WIDTH;
    ctx.stroke();
    
    // Draw progress arc
    const progressRadians = (progressPercent / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, progressRadians - Math.PI / 2);
    ctx.strokeStyle = progressColor;
    ctx.lineWidth = RING_WIDTH;
    ctx.stroke();
    
    // Clear inner circle to match the mask
    ctx.beginPath();
    ctx.arc(centerX, centerY, INNER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  
  // Animate progress changes
  function animateProgress(timestamp) {
    if (!animationStartTime) animationStartTime = timestamp;
    
    const elapsed = timestamp - animationStartTime;
    const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
    
    // Calculate interpolated value
    const currentValue = currentProgress + (targetProgress - currentProgress) * progress;
    
    // Draw the current state
    drawProgressRing(currentValue);
    
    // Continue animation if not complete
    if (progress < 1) {
      animationFrame = requestAnimationFrame(animateProgress);
    } else {
      currentProgress = targetProgress;
      animationFrame = null;
    }
  }
  
  // Set a new target progress and animate to it
  function setProgress(newProgress) {
    // Store starting point
    currentProgress = parseFloat(currentProgress);
    if (isNaN(currentProgress)) currentProgress = 0;
    
    // Set new target
    targetProgress = newProgress;
    
    // Reset animation timer
    animationStartTime = 0;
    
    // Cancel any existing animation
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    
    // Start animation
    animationFrame = requestAnimationFrame(animateProgress);
  }
  
  // Monitor the original progress element for changes
  function setupProgressMonitoring() {
    // Monitor for attribute changes on the downloads button
    const downloadButton = document.getElementById('downloads-button');
    if (!downloadButton) return;
    
    // Create MutationObserver to watch for changes
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'progress') {
          // Check if downloads are active
          const inProgress = downloadButton.getAttribute('progress') === 'true';
          
          if (inProgress) {
            // Get current progress value from the original element
            checkProgressValue();
          } else {
            // Reset progress when downloads complete
            setProgress(0);
          }
        }
      });
    });
    
    // Start observing the button
    observer.observe(downloadButton, { attributes: true });
    
    // Periodically check for progress updates (as a backup)
    setInterval(checkProgressValue, 100);
  }
  
  // Check the current progress value from the original element
  function checkProgressValue() {
    if (!originalProgressElement) return;
    
    try {
      const computedStyle = window.getComputedStyle(originalProgressElement);
      const progressVar = computedStyle.getPropertyValue('--download-progress-pcent');
      
      if (progressVar) {
        // Extract percentage value
        const match = progressVar.match(/(\d+(\.\d+)?)%/);
        if (match) {
          const newProgress = parseFloat(match[1]);
          
          // Only animate if there's a significant change
          if (Math.abs(newProgress - targetProgress) > 0.5) {
            setProgress(newProgress);
          }
        }
      }
    } catch (e) {
      console.error('Error checking progress value:', e);
    }
  }
  
  // Cleanup function
  function cleanup() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    if (themeObserver) {
      themeObserver.disconnect();
    }
    if (window.colorCheckInterval) {
      clearInterval(window.colorCheckInterval);
    }
  }
  
  // Initialize when the browser is ready
  if (document.readyState === 'complete') {
    createProgressCanvas();
  } else {
    window.addEventListener('load', createProgressCanvas);
  }
  
  // Cleanup on unload
  window.addEventListener('unload', cleanup);
})();