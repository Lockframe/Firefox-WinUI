// ==UserScript==
// @name           Scroll in Browser Margins
// @description    Allows scrolling webpage when hovering over browser margins
// @author         Vibe-coded with Claude 4.5 Sonnet
// @include        main
// ==/UserScript==

(function() {
  'use strict';

  // Frame script for remote content
  const FRAME_SCRIPT = `
    addMessageListener("MarginScroll:DoScroll", function(msg) {
      if (content && content.window) {
        content.window.scrollBy({
          left: msg.data.x,
          top: msg.data.y,
          behavior: 'smooth'
        });
      }
    });
  `;

  const FRAME_SCRIPT_URI = "data:," + encodeURIComponent(FRAME_SCRIPT);

  // Track which browsers have the frame script loaded
  const loadedBrowsers = new WeakSet();

  // Get user's scroll multiplier preferences
  function getScrollMultipliers() {
    try {
      const prefService = Services.prefs;
      return {
        x: prefService.getIntPref("mousewheel.default.delta_multiplier_x", 100),
        y: prefService.getIntPref("mousewheel.default.delta_multiplier_y", 100)
      };
    } catch (e) {
      return { x: 100, y: 100 };
    }
  }

  // Get line height preference
  function getLineHeight() {
    try {
      return Services.prefs.getIntPref("mousewheel.system_scroll_override_on_root_content.vertical.factor", 100);
    } catch (e) {
      return 100;
    }
  }

  // Get margins based on window state
  function getMargins() {
    const root = document.documentElement;
    const sizemode = root.getAttribute('sizemode');
    const inFullscreen = root.getAttribute('inDOMFullscreen') === 'true';
    
    if (inFullscreen || sizemode === 'fullscreen') {
      return null;
    }
    
    return { top: -1, right: 4, bottom: 4, left: 4 };
  }

  // Check if cursor is in margin area
  function isOverMargin(event) {
    const margins = getMargins();
    if (!margins) return false;

    const browser = gBrowser.selectedBrowser;
    if (!browser) return false;

    const rect = browser.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    const inLeft = x >= (rect.left - margins.left) && x < rect.left;
    const inRight = x > rect.right && x <= (rect.right + margins.right);
    const inTop = y >= (rect.top + margins.top) && y < rect.top;
    const inBottom = y > rect.bottom && y <= (rect.bottom + margins.bottom);

    return inLeft || inRight || inTop || inBottom;
  }

  // Ensure frame script is loaded for current browser
  function ensureFrameScript() {
    const browser = gBrowser.selectedBrowser;
    if (!browser) return;

    if (!loadedBrowsers.has(browser)) {
      try {
        if (browser.messageManager) {
          browser.messageManager.loadFrameScript(FRAME_SCRIPT_URI, false);
          loadedBrowsers.add(browser);
        }
      } catch (e) {
        // Silent fail
      }
    }
  }

  // Handle wheel events
  function onWheel(event) {
    if (!isOverMargin(event)) return;

    const browser = gBrowser.selectedBrowser;
    if (!browser) return;

    let deltaX = event.deltaX;
    let deltaY = event.deltaY;

    // Get user's multiplier preferences
    const multipliers = getScrollMultipliers();

    // Firefox uses ~21.33 pixels per line for smooth scroll calculation
    // This matches the internal scroll computation
    const pixelsPerLine = 21.33;

    // Convert based on delta mode
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
      deltaX = (deltaX * pixelsPerLine * multipliers.x) / 100;
      deltaY = (deltaY * pixelsPerLine * multipliers.y) / 100;
    } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
      deltaX = (deltaX * 800 * multipliers.x) / 100;
      deltaY = (deltaY * 600 * multipliers.y) / 100;
    } else {
      // PIXEL mode already has multipliers applied
      deltaX = deltaX;
      deltaY = deltaY;
    }

    // Send scroll command
    try {
      if (browser.messageManager) {
        ensureFrameScript();
        browser.messageManager.sendAsyncMessage("MarginScroll:DoScroll", {
          x: deltaX,
          y: deltaY
        });
      }
      event.preventDefault();
      event.stopPropagation();
    } catch (e) {
      // Silent fail
    }
  }

  // Set up event listener
  window.addEventListener('wheel', onWheel, { passive: false, capture: true });

  // Load frame script on tab switch
  gBrowser.tabContainer.addEventListener('TabSelect', () => {
    setTimeout(ensureFrameScript, 100);
  });

  // Load frame script on location change
  gBrowser.addTabsProgressListener({
    onLocationChange: function(aBrowser) {
      if (aBrowser === gBrowser.selectedBrowser) {
        setTimeout(ensureFrameScript, 100);
      }
    }
  });

  // Initial load
  setTimeout(ensureFrameScript, 500);

})();