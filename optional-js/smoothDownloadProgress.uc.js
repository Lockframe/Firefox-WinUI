// ==UserScript==
// @name           Smooth Download Progress
// @description    Uses XUL overlay to replace the download progress indicator with a smoothly animated version
// @author         Lockframe
// @include        main
// ==/UserScript==

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
  
  const FALLBACK_RING_COLOR = '#ff0000'; // Fallback color if variables can't be accessed
  const RING_BG_COLOR = 'rgba(0, 0, 0, 0.1)'; // Background color for the ring
  
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
    
    // No custom CSS is added here as you mentioned it's already in userChrome.css
    
    // Start monitoring for progress changes
    setupProgressMonitoring();
    
    // Draw initial state
    drawProgressRing(0);
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
    
    // Get progress color from your custom variable --accentAuto
    let progressColor = FALLBACK_RING_COLOR;
    try {
      const style = window.getComputedStyle(document.documentElement);
      const accentAuto = style.getPropertyValue('--accentAuto');
      if (accentAuto && accentAuto !== '') {
        progressColor = accentAuto;
      } else {
        // Try Firefox's default accent color as fallback
        const themeColor = style.getPropertyValue('--toolbarbutton-icon-fill-attention');
        if (themeColor && themeColor !== '') {
          progressColor = themeColor;
        }
      }
    } catch (e) {
      console.error('Error getting theme color:', e);
    }
    
    // Draw background ring (full circle)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = RING_BG_COLOR;
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
  
  // Initialize when the browser is ready
  if (document.readyState === 'complete') {
    createProgressCanvas();
  } else {
    window.addEventListener('load', createProgressCanvas);
  }
})();