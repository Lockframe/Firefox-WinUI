// ==UserScript==
// @name         Firefox WinUI 3 Page Transitions
// @description  Applies WinUI 3 style page transitions based on navigation direction
// @author       Vibe-coded with Claude
// @version      1.0
// ==/UserScript==

(function() {
    'use strict';
    
    // Debug logging
    function log(message) {
        console.log('[Page Transitions]', message);
    }

    // Animation types
    const ANIMATIONS = {
        ENTRANCE: 'entrance',
        SLIDE_LEFT: 'slide-left',
        SLIDE_RIGHT: 'slide-right'
    };

    // State management
    let currentTabIndex = -1;
    let isInitialized = false;
    
    // Animation queue system
    const animationQueue = [];
    let isProcessingQueue = false;
    
    // Per-tab state tracking
    const tabStates = new WeakMap();
    
    // Tab state structure
    function createTabState() {
        return {
            hasPlayedEntrance: false,
            isNew: false,
            isLoading: false,
            pendingAnimation: null
        };
    }

    // Get or create tab state
    function getTabState(tab) {
        if (!tabStates.has(tab)) {
            tabStates.set(tab, createTabState());
        }
        return tabStates.get(tab);
    }

    // CSS for animations
    const animationCSS = `
        .browser-animation-entrance {
            animation: browserEntranceAnim 0.4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        }
        
        .browser-animation-slide-left {
            animation: browserSlideLeftAnim 0.4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        }
        
        .browser-animation-slide-right {
            animation: browserSlideRightAnim 0.4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        }
        
        @keyframes browserEntranceAnim {
            from {
                opacity: 0;
                transform: translateY(48px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes browserSlideLeftAnim {
            from {
                opacity: 0;
                transform: translateX(-48px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes browserSlideRightAnim {
            from {
                opacity: 0;
                transform: translateX(48px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .browser-animation-prepare {
            opacity: 0 !important;
        }
    `;

    // Inject CSS
    function injectCSS() {
        const style = document.createElement('style');
        style.textContent = animationCSS;
        document.head.appendChild(style);
        log('CSS injected');
    }

    // Utility functions
    function getTabIndex(tab) {
        return Array.from(gBrowser.tabs).indexOf(tab);
    }

    function getCurrentTabIndex() {
        return getTabIndex(gBrowser.selectedTab);
    }

    function isCurrentTab(tab) {
        return tab === gBrowser.selectedTab;
    }

    // Animation queue management
    function queueAnimation(browser, animationType, callback) {
        animationQueue.push({ browser, animationType, callback });
        processAnimationQueue();
    }

    function processAnimationQueue() {
        if (isProcessingQueue || animationQueue.length === 0) {
            return;
        }

        isProcessingQueue = true;
        const { browser, animationType, callback } = animationQueue.shift();
        
        log(`Processing animation: ${animationType}`);
        executeAnimation(browser, animationType, () => {
            isProcessingQueue = false;
            if (callback) callback();
            
            // Process next animation in queue
            if (animationQueue.length > 0) {
                setTimeout(processAnimationQueue, 50);
            }
        });
    }

    function clearAnimationQueue() {
        animationQueue.length = 0;
        isProcessingQueue = false;
    }

    // Animation execution
    function executeAnimation(browser, animationType, callback) {
        if (!browser || !animationType) {
            if (callback) callback();
            return;
        }

        // Remove all animation classes
        browser.classList.remove(
            'browser-animation-prepare',
            'browser-animation-entrance',
            'browser-animation-slide-left',
            'browser-animation-slide-right'
        );

        // Force reflow
        browser.offsetHeight;

        // Add animation class
        const animClass = `browser-animation-${animationType}`;
        browser.classList.add(animClass);

        // Clean up after animation
        const cleanup = () => {
            browser.classList.remove(animClass);
            if (callback) callback();
        };

        setTimeout(cleanup, 400);
    }

    function prepareBrowser(browser) {
        if (!browser) return;
        browser.classList.add('browser-animation-prepare');
    }

    function unprepareAllBrowsers() {
        const browsers = gBrowser.browsers;
        for (const browser of browsers) {
            browser.classList.remove('browser-animation-prepare');
        }
    }

    // Animation logic
    function shouldPlayEntranceAnimation(tab) {
        const tabState = getTabState(tab);
        return tabState.isNew && !tabState.hasPlayedEntrance && isCurrentTab(tab);
    }

    function getSlideAnimation(newTabIndex, oldTabIndex) {
        if (newTabIndex === oldTabIndex || newTabIndex === -1 || oldTabIndex === -1) {
            return null;
        }
        return newTabIndex > oldTabIndex ? ANIMATIONS.SLIDE_RIGHT : ANIMATIONS.SLIDE_LEFT;
    }

    // Event handlers
    function handleTabOpen(event) {
        const newTab = event.target;
        const tabState = getTabState(newTab);
        
        log('New tab opened');
        
        tabState.isNew = true;
        tabState.isLoading = true;
        
        // Prepare browser immediately if it exists
        if (newTab.linkedBrowser) {
            prepareBrowser(newTab.linkedBrowser);
        }
    }

    function handleTabSelect(event) {
        const newTab = event.target;
        if (!newTab) return;

        const newTabIndex = getTabIndex(newTab);
        const oldTabIndex = currentTabIndex;
        
        log(`Tab select: ${oldTabIndex} -> ${newTabIndex}`);

        // Clear any pending animations for rapid tab switching
        clearAnimationQueue();

        const tabState = getTabState(newTab);
        const browser = newTab.linkedBrowser;
        
        if (!browser) {
            currentTabIndex = newTabIndex;
            return;
        }

        // Check if we should play entrance animation
        if (shouldPlayEntranceAnimation(newTab)) {
            log('Queueing entrance animation for new tab');
            prepareBrowser(browser);
            
            // Mark as having played entrance immediately to prevent duplicates
            tabState.hasPlayedEntrance = true;
            
            queueAnimation(browser, ANIMATIONS.ENTRANCE, () => {
                currentTabIndex = newTabIndex;
                tabState.isNew = false;
            });
            return;
        }

        // Check if we should play slide animation
        const slideAnimation = getSlideAnimation(newTabIndex, oldTabIndex);
        if (slideAnimation && isInitialized) {
            log(`Queueing slide animation: ${slideAnimation}`);
            prepareBrowser(browser);
            
            queueAnimation(browser, slideAnimation, () => {
                currentTabIndex = newTabIndex;
            });
        } else {
            // No animation needed, just update state
            unprepareAllBrowsers();
            currentTabIndex = newTabIndex;
        }
    }

    function handleTabClose(event) {
        const closedTab = event.target;
        
        // Clean up tab state
        if (tabStates.has(closedTab)) {
            tabStates.delete(closedTab);
            log('Tab state cleaned up for closed tab');
        }
    }

    // Progress listener for handling page loads
    const progressListener = {
        onStateChange: function(aBrowser, aWebProgress, aRequest, aStateFlags, aStatus) {
            // Only handle top-level document changes
            if (!aWebProgress.isTopLevel) return;
            
            const tab = gBrowser.getTabForBrowser(aBrowser);
            if (!tab) return;
            
            const tabState = getTabState(tab);
            
            // Document start loading
            if (aStateFlags & Ci.nsIWebProgressListener.STATE_START &&
                aStateFlags & Ci.nsIWebProgressListener.STATE_IS_DOCUMENT) {
                
                tabState.isLoading = true;
                log('Document started loading in tab');
            }
            
            // Document finished loading
            if (aStateFlags & Ci.nsIWebProgressListener.STATE_STOP &&
                aStateFlags & Ci.nsIWebProgressListener.STATE_IS_DOCUMENT) {
                
                log('Document finished loading in tab');
                
                // Only play entrance animation if this is a new tab and user is viewing it
                if (shouldPlayEntranceAnimation(tab)) {
                    log('Playing entrance animation for newly loaded tab');
                    
                    tabState.hasPlayedEntrance = true;
                    tabState.isLoading = false;
                    
                    const browser = tab.linkedBrowser;
                    prepareBrowser(browser);
                    
                    queueAnimation(browser, ANIMATIONS.ENTRANCE, () => {
                        tabState.isNew = false;
                    });
                } else {
                    // Tab finished loading but no animation needed
                    tabState.isLoading = false;
                    if (isCurrentTab(tab)) {
                        const browser = tab.linkedBrowser;
                        browser.classList.remove('browser-animation-prepare');
                    }
                }
            }
        },

        QueryInterface: ChromeUtils.generateQI(['nsIWebProgressListener', 'nsISupportsWeakReference'])
    };

    // Initialization
    function handleInitialLoad() {
        log('Handling initial load');
        
        // Get current tab and mark it appropriately
        const currentTab = gBrowser.selectedTab;
        if (currentTab) {
            const tabState = getTabState(currentTab);
            const browser = currentTab.linkedBrowser;
            
            // For existing tabs on startup, don't treat as "new"
            tabState.isNew = false;
            tabState.hasPlayedEntrance = true;
            
            // Ensure browser is visible
            if (browser) {
                browser.classList.remove('browser-animation-prepare');
            }
        }
        
        currentTabIndex = getCurrentTabIndex();
        isInitialized = true;
        
        log('Initial load complete');
    }

    function init() {
        log('Initializing Page Transitions v5.0...');

        if (!window.gBrowser) {
            log('gBrowser not ready, retrying...');
            setTimeout(init, 100);
            return;
        }

        // Inject CSS
        injectCSS();

        // Set initial state
        currentTabIndex = getCurrentTabIndex();

        // Add event listeners
        gBrowser.tabContainer.addEventListener('TabOpen', handleTabOpen, false);
        gBrowser.tabContainer.addEventListener('TabSelect', handleTabSelect, false);
        gBrowser.tabContainer.addEventListener('TabClose', handleTabClose, false);

        // Add progress listener
        gBrowser.addTabsProgressListener(progressListener);

        // Handle initial load
        if (document.readyState === 'complete') {
            handleInitialLoad();
        } else {
            window.addEventListener('load', handleInitialLoad, { once: true });
        }

        log('Page Transitions initialized successfully');
    }

    // Start initialization
    init();

})();