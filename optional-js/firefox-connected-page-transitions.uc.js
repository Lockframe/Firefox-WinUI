// ==UserScript==
// @name         Firefox WinUI 3 Connected Page Transitions
// @description  Applies WinUI 3 style connected page transitions with slide-out/slide-in effects, currently not 1:1
// @author       Vibe-coded with Claude
// @version      1.0
// ==/UserScript==

(function() {
    'use strict';
    
    // Debug logging
    function log(message) {
        console.log('[Connected Transitions]', message);
    }

    // Animation types
    const ANIMATIONS = {
        ENTRANCE: 'entrance',
        SLIDE_LEFT: 'slide-left',
        SLIDE_RIGHT: 'slide-right',
        CONNECTED_LEFT: 'connected-left',
        CONNECTED_RIGHT: 'connected-right'
    };

    // State management
    let currentTabIndex = -1;
    let isInitialized = false;
    
    // Animation queue system
    const animationQueue = [];
    let isProcessingQueue = false;
    
    // Per-tab state tracking
    const tabStates = new WeakMap();
    
    // Connected transition state
    let isConnectedTransition = false;
    let oldBrowserReference = null;
    
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
        /* Original animations */
        .browser-animation-entrance {
            animation: browserEntranceAnim 0.4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        }
        
        .browser-animation-slide-left {
            animation: browserSlideLeftAnim 0.4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        }
        
        .browser-animation-slide-right {
            animation: browserSlideRightAnim 0.4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        }
        
        /* Connected transition animations */
        .browser-connected-slide-out-left {
            animation: browserConnectedSlideOutLeft 0.4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
            position: relative;
            z-index: 1;
        }
        
        .browser-connected-slide-out-right {
            animation: browserConnectedSlideOutRight 0.4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
            position: relative;
            z-index: 1;
        }
        
        .browser-connected-slide-in-left {
            animation: browserConnectedSlideInLeft 0.4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
            transform: translateX(-100%);
            position: relative;
            z-index: 2;
        }
        
        .browser-connected-slide-in-right {
            animation: browserConnectedSlideInRight 0.4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
            transform: translateX(100%);
            position: relative;
            z-index: 2;
        }
        
        /* Original keyframes */
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
        
        /* Connected slide-out keyframes - moves to make room */
        @keyframes browserConnectedSlideOutLeft {
            from {
            	opacity: 1;
                transform: translateX(0);
            }
            to {
            	opacity: 0;
                transform: translateX(-50%);
            }
        }
        
        @keyframes browserConnectedSlideOutRight {
            from {
                transform: translateX(0);
            }
            to {
                transform: translateX(50%);
            }
        }
        
        /* Connected slide-in keyframes - follows directly behind */
        @keyframes browserConnectedSlideInLeft {
            from {
            	opacity: 0;
                transform: translateX(-50%);
            }
            to {
            	opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes browserConnectedSlideInRight {
            from {
            	opacity: 0;
                transform: translateX(50%);
            }
            to {
            	opacity: 1;
                transform: translateX(0);
            }
        }
        
        .browser-animation-prepare {
            opacity: 0 !important;
        }
        
        /* Force visibility during connected transitions */
        .browser-connected-visible {
            opacity: 1 !important;
            visibility: visible !important;
        }
        
        /* Browser container styling for connected transitions */
        .browser-stack-connected {
            position: relative;
        }
        
        .browser-stack-connected > xul\\:browser,
        .browser-stack-connected > browser {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            visibility: visible !important;
            display: block !important;
        }
        
        /* Force both browsers to be rendered during transition */
        .browser-stack-connected > xul\\:browser[renderactivity],
        .browser-stack-connected > browser[renderactivity] {
            visibility: visible !important;
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

    // Find the browser stack (where browsers are actually displayed)
    function getBrowserStack() {
        // Try multiple possible selectors
        const selectors = [
            '#tabbrowser-panelbox > .browserStack',
            '.browserStack',
            '#browser',
            '.tabbrowser-deck',
            gBrowser.mPanelContainer
        ];
        
        for (const selector of selectors) {
            if (typeof selector === 'string') {
                const element = document.querySelector(selector);
                if (element) {
                    log(`Found browser stack: ${selector}`);
                    return element;
                }
            } else if (selector) {
                log('Found browser stack: mPanelContainer');
                return selector;
            }
        }
        
        log('Browser stack not found, trying gBrowser approaches');
        
        // Try to find through gBrowser
        if (gBrowser.selectedBrowser && gBrowser.selectedBrowser.parentNode) {
            log('Found browser stack: selectedBrowser parent');
            return gBrowser.selectedBrowser.parentNode;
        }
        
        return null;
    }

    // Connected transition execution
    function executeConnectedTransition(oldBrowser, newBrowser, direction, callback) {
        log(`Starting connected transition: ${direction}`);
        
        isConnectedTransition = true;
        const browserStack = getBrowserStack();
        
        if (!browserStack) {
            log('Could not find browser stack, falling back');
            executeSimpleAnimation(newBrowser, direction, callback);
            return;
        }

        log('Browser stack found, proceeding with connected transition');

        // Add stack class for positioning
        browserStack.classList.add('browser-stack-connected');
        
        // Force both browsers to be visible and rendered
        [oldBrowser, newBrowser].forEach(browser => {
            browser.classList.add('browser-connected-visible');
            browser.classList.remove(
                'browser-animation-prepare',
                'browser-connected-slide-out-left',
                'browser-connected-slide-out-right',
                'browser-connected-slide-in-left',
                'browser-connected-slide-in-right'
            );
            
            // Force rendering
            browser.setAttribute('renderactivity', 'true');
            browser.style.visibility = 'visible';
            browser.style.display = 'block';
        });

        // Force reflow
        browserStack.offsetHeight;

        // Determine animation classes
        const slideOutClass = direction === ANIMATIONS.CONNECTED_LEFT ? 
            'browser-connected-slide-out-right' : 'browser-connected-slide-out-left';
            
        const slideInClass = direction === ANIMATIONS.CONNECTED_LEFT ?
            'browser-connected-slide-in-left' : 'browser-connected-slide-in-right';

        log(`Applying animations: slideOut=${slideOutClass}, slideIn=${slideInClass}`);

        // Start slide-out animation for old browser
        oldBrowser.classList.add(slideOutClass);
        
        // Start slide-in animation for new browser (with delay built into CSS)
        newBrowser.classList.add(slideInClass);

        // Cleanup after 400ms (both animations run simultaneously)
        setTimeout(() => {
            log('Cleaning up connected transition');
            
            // Remove all animation classes
            [oldBrowser, newBrowser].forEach(browser => {
                browser.classList.remove(
                    'browser-connected-slide-out-left',
                    'browser-connected-slide-out-right',
                    'browser-connected-slide-in-left',
                    'browser-connected-slide-in-right',
                    'browser-connected-visible'
                );
                
                // Reset forced rendering
                browser.removeAttribute('renderactivity');
                browser.style.visibility = '';
                browser.style.display = '';
            });
            
            // Remove stack class
            browserStack.classList.remove('browser-stack-connected');
            
            isConnectedTransition = false;
            
            log('Connected transition completed');
            
            if (callback) callback();
        }, 400);
    }

    // Simple animation fallback
    function executeSimpleAnimation(browser, direction, callback) {
        log('Executing simple animation fallback');
        const animationType = direction === ANIMATIONS.CONNECTED_LEFT ? 
            ANIMATIONS.SLIDE_LEFT : ANIMATIONS.SLIDE_RIGHT;
        executeAnimation(browser, animationType, callback);
    }

    // Animation queue management
    function queueAnimation(browser, animationType, callback, oldBrowser = null) {
        animationQueue.push({ browser, animationType, callback, oldBrowser });
        processAnimationQueue();
    }

    function processAnimationQueue() {
        if (isProcessingQueue || animationQueue.length === 0) {
            return;
        }

        isProcessingQueue = true;
        const { browser, animationType, callback, oldBrowser } = animationQueue.shift();
        
        log(`Processing animation: ${animationType}`);

        // Check if this should be a connected transition
        if ((animationType === ANIMATIONS.CONNECTED_LEFT || animationType === ANIMATIONS.CONNECTED_RIGHT) 
            && oldBrowser && !isConnectedTransition) {
            
            executeConnectedTransition(oldBrowser, browser, animationType, () => {
                isProcessingQueue = false;
                if (callback) callback();
                
                // Process next animation after a brief delay
                setTimeout(processAnimationQueue, 50);
            });
        } else if (animationType === ANIMATIONS.CONNECTED_LEFT || animationType === ANIMATIONS.CONNECTED_RIGHT) {
            // Fallback to simple animation if no old browser
            log('No old browser available, using simple animation');
            executeSimpleAnimation(browser, animationType, () => {
                isProcessingQueue = false;
                if (callback) callback();
                
                setTimeout(processAnimationQueue, 50);
            });
        } else {
            // Regular animation
            executeAnimation(browser, animationType, () => {
                isProcessingQueue = false;
                if (callback) callback();
                
                setTimeout(processAnimationQueue, 50);
            });
        }
    }

    function clearAnimationQueue() {
        animationQueue.length = 0;
        isProcessingQueue = false;
        isConnectedTransition = false;
        
        // Clean up any ongoing transitions
        const browserStack = getBrowserStack();
        if (browserStack) {
            browserStack.classList.remove('browser-stack-connected');
        }
        
        // Clean up all browsers
        const browsers = gBrowser.browsers;
        for (const browser of browsers) {
            browser.classList.remove(
                'browser-connected-slide-out-left',
                'browser-connected-slide-out-right',
                'browser-connected-slide-in-left',
                'browser-connected-slide-in-right',
                'browser-connected-visible',
                'browser-animation-prepare'
            );
            
            // Reset forced rendering
            browser.removeAttribute('renderactivity');
            browser.style.visibility = '';
            browser.style.display = '';
        }
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
            'browser-animation-slide-right',
            'browser-connected-visible'
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
            browser.classList.remove(
                'browser-animation-prepare', 
                'browser-connected-visible'
            );
        }
    }

    // Animation logic
    function shouldPlayEntranceAnimation(tab) {
        const tabState = getTabState(tab);
        return tabState.isNew && !tabState.hasPlayedEntrance && isCurrentTab(tab);
    }

    function getSlideAnimation(newTabIndex, oldTabIndex, useConnected = true) {
        if (newTabIndex === oldTabIndex || newTabIndex === -1 || oldTabIndex === -1) {
            return null;
        }
        
        if (useConnected && isInitialized) {
            return newTabIndex > oldTabIndex ? ANIMATIONS.CONNECTED_RIGHT : ANIMATIONS.CONNECTED_LEFT;
        } else {
            return newTabIndex > oldTabIndex ? ANIMATIONS.SLIDE_RIGHT : ANIMATIONS.SLIDE_LEFT;
        }
    }

    // Event handlers
    function handleTabOpen(event) {
        const newTab = event.target;
        const tabState = getTabState(newTab);
        
        log('New tab opened');
        
        tabState.isNew = true;
        tabState.isLoading = true;
        
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
        const oldTab = oldTabIndex >= 0 && oldTabIndex < gBrowser.tabs.length ? 
                      gBrowser.tabs[oldTabIndex] : null;
        const oldBrowser = oldTab ? oldTab.linkedBrowser : null;
        
        if (!browser) {
            currentTabIndex = newTabIndex;
            return;
        }

        // Debug: Check if browsers exist
        log(`New browser exists: ${!!browser}, Old browser exists: ${!!oldBrowser}`);

        // Check if we should play entrance animation
        if (shouldPlayEntranceAnimation(newTab)) {
            log('Queueing entrance animation for new tab');
            prepareBrowser(browser);
            
            tabState.hasPlayedEntrance = true;
            
            queueAnimation(browser, ANIMATIONS.ENTRANCE, () => {
                currentTabIndex = newTabIndex;
                tabState.isNew = false;
            });
            return;
        }

        // Check if we should play slide animation
        const slideAnimation = getSlideAnimation(newTabIndex, oldTabIndex, true);
        if (slideAnimation && isInitialized && oldBrowser) {
            log(`Queueing connected slide animation: ${slideAnimation}`);
            
            // Don't prepare the new browser since we want both visible during transition
            queueAnimation(browser, slideAnimation, () => {
                currentTabIndex = newTabIndex;
            }, oldBrowser);
        } else {
            // No animation or no old browser
            log('No connected animation needed, cleaning up');
            unprepareAllBrowsers();
            currentTabIndex = newTabIndex;
        }
    }

    function handleTabClose(event) {
        const closedTab = event.target;
        
        if (tabStates.has(closedTab)) {
            tabStates.delete(closedTab);
            log('Tab state cleaned up for closed tab');
        }
    }

    // Progress listener for handling page loads
    const progressListener = {
        onStateChange: function(aBrowser, aWebProgress, aRequest, aStateFlags, aStatus) {
            if (!aWebProgress.isTopLevel) return;
            
            const tab = gBrowser.getTabForBrowser(aBrowser);
            if (!tab) return;
            
            const tabState = getTabState(tab);
            
            if (aStateFlags & Ci.nsIWebProgressListener.STATE_START &&
                aStateFlags & Ci.nsIWebProgressListener.STATE_IS_DOCUMENT) {
                
                tabState.isLoading = true;
                log('Document started loading in tab');
            }
            
            if (aStateFlags & Ci.nsIWebProgressListener.STATE_STOP &&
                aStateFlags & Ci.nsIWebProgressListener.STATE_IS_DOCUMENT) {
                
                log('Document finished loading in tab');
                
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
        
        // Debug: Log browser stack information
        const stack = getBrowserStack();
        log(`Browser stack found during init: ${!!stack}`);
        if (stack) {
            log(`Browser stack tag: ${stack.tagName}, id: ${stack.id}, class: ${stack.className}`);
        }
        
        const currentTab = gBrowser.selectedTab;
        if (currentTab) {
            const tabState = getTabState(currentTab);
            const browser = currentTab.linkedBrowser;
            
            tabState.isNew = false;
            tabState.hasPlayedEntrance = true;
            
            if (browser) {
                browser.classList.remove('browser-animation-prepare');
            }
        }
        
        currentTabIndex = getCurrentTabIndex();
        isInitialized = true;
        
        log('Initial load complete');
    }

    function init() {
        log('Initializing Connected Page Transitions v3.0...');

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

        // Cleanup on window unload
        window.addEventListener('unload', () => {
            clearAnimationQueue();
        });

        log('Connected Page Transitions initialized successfully');
    }

    // Start initialization
    init();

})();