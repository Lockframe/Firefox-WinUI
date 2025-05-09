// ==UserScript==
// @name           Status Panel Under Cursor
// @description    Makes the status panel appear below the cursor for ease of accessibility
// @author         Lockframe
// @include        main
// ==/UserScript==
(function() {
    window.addEventListener('DOMContentLoaded', function() {
        const statusPanel = document.getElementById('statuspanel');
        if (!statusPanel) return;

        // Add fade animation styles
        const animationCSS = `
            <style>
                #statuspanel-label {
                    opacity: 0;
                    transition: opacity 83ms ease-in-out !important;
                    pointer-events: none !important;
                    transform: translateY(-16px) !important;
                }
                #statuspanel-label:not([hidden]) {
                    opacity: 1 !important;
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', animationCSS);

        // Reset positioning and original styles
        statusPanel.style.cssText = `
            position: fixed !important;
            bottom: unset !important;
            right: unset !important;
            margin: 0 !important;
            display: block !important;
            z-index: 2147483647 !important;
        `;

        let lastX = 0, lastY = 0;
        const verticalOffset = 0; // Fine-tune vertical position here

        function updatePanelPosition() {
            if (statusPanel.hidden) return;

            // Get accurate dimensions
            const rect = statusPanel.getBoundingClientRect();
            const panelWidth = rect.width;
            const panelHeight = rect.height;

            // Calculate position
            let xPos = lastX - panelWidth/2;
            let yPos = lastY - panelHeight - verticalOffset;

            // Window boundaries
            const winWidth = document.documentElement.clientWidth;
            const winHeight = document.documentElement.clientHeight;
            
            xPos = Math.max(5, Math.min(xPos, winWidth - panelWidth - 5));
            yPos = Math.max(5, Math.min(yPos, winHeight - panelHeight - 5));

            statusPanel.style.left = `${xPos}px`;
            statusPanel.style.top = `${yPos}px`;
        }

        // Mouse movement handler
        document.addEventListener('mousemove', function(e) {
            lastX = e.clientX;
            lastY = e.clientY;
            if (!statusPanel.hidden) requestAnimationFrame(updatePanelPosition);
        });

        // Visibility handler
        new MutationObserver(() => {
            if (!statusPanel.hidden) {
                requestAnimationFrame(() => {
                    updatePanelPosition();
                    setTimeout(updatePanelPosition, 50);
                });
            }
        }).observe(statusPanel, {attributes: true, attributeFilter: ['hidden']});

        // Cleanup positioning when hidden
        statusPanel.addEventListener('transitionend', () => {
            if (statusPanel.hidden) {
                statusPanel.style.left = '-9999px';
                statusPanel.style.top = '-9999px';
            }
        });
    });
})();