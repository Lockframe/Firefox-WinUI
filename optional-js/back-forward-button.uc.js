// ==UserScript==
// @name           Back and Forward Button Icon Animation
// @description    Adds separate shrink and bounce animations to the back and forward button icons in Firefox.
// @version        1.3
// @include        main
// ==/UserScript==

(function () {
  const BACK_BUTTON_ID = "back-button";
  const FORWARD_BUTTON_ID = "forward-button";
  const BACK_ANIMATION_NAME = "shrinkRightBounce";
  const FORWARD_ANIMATION_NAME = "shrinkLeftBounce";

  // Inject CSS for the animations
  const style = document.createElement("style");
  style.type = "text/css";
  style.textContent = `
    /* Back Button Animation */
    @keyframes ${BACK_ANIMATION_NAME} {
      0% {
        transform: scaleX(1);
        transform-origin: right;
      }
      30% {
        transform: scaleX(0.7);
        transform-origin: right;
      }
      60% {
        transform: scaleX(1.1);
        transform-origin: right;
      }
      80% {
        transform: scaleX(0.98);
        transform-origin: right;
      }
      100% {
        transform: scaleX(1);
        transform-origin: right;
      }
    }

    /* Forward Button Animation */
    @keyframes ${FORWARD_ANIMATION_NAME} {
      0% {
        transform: scaleX(1);
        transform-origin: left;
      }
      30% {
        transform: scaleX(0.7);
        transform-origin: left;
      }
      60% {
        transform: scaleX(1.1);
        transform-origin: left;
      }
      80% {
        transform: scaleX(0.98);
        transform-origin: left;
      }
      100% {
        transform: scaleX(1);
        transform-origin: left;
      }
    }

    #${BACK_BUTTON_ID}.active::after {
      animation: ${BACK_ANIMATION_NAME} 0.5s cubic-bezier(0.55, 0.55, 0, 1);
    }

    #${FORWARD_BUTTON_ID}.active::after {
      animation: ${FORWARD_ANIMATION_NAME} 0.5s cubic-bezier(0.55, 0.55, 0, 1);
    }
  `;
  document.documentElement.appendChild(style);

  // Function to add animation if the button is enabled
  function addAnimation(button, animationClass) {
    if (button && !button.disabled) {
      button.classList.add(animationClass);
    }
  }

  // Function to remove the animation class after it ends
  function removeAnimation(button, animationClass) {
    if (button) {
      button.classList.remove(animationClass);
    }
  }

  // Attach event listeners to back and forward buttons
  const backButton = document.getElementById(BACK_BUTTON_ID);
  const forwardButton = document.getElementById(FORWARD_BUTTON_ID);

  if (backButton) {
    backButton.addEventListener("mousedown", () => addAnimation(backButton, "active"));
    backButton.addEventListener("animationend", () => removeAnimation(backButton, "active"));
  } else {
    console.error(`Back button with ID "${BACK_BUTTON_ID}" not found.`);
  }

  if (forwardButton) {
    forwardButton.addEventListener("mousedown", () => addAnimation(forwardButton, "active"));
    forwardButton.addEventListener("animationend", () => removeAnimation(forwardButton, "active"));
  } else {
    console.error(`Forward button with ID "${FORWARD_BUTTON_ID}" not found.`);
  }
})();