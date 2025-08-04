// ==UserScript==
// @name           Animate Context Menus
// @author         Lockframe & Gemini
// @include        *
// ==/UserScript==
class AnimateContextMenus {
  constructor() {
    this.cursorY = 0;
    document.documentElement.setAttribute("animate-menupopups", true);
    addEventListener("popupshowing", this);
    addEventListener("popupshown", this);
    addEventListener("popuphidden", this);
    addEventListener("contextmenu", this, true);
    addEventListener("mousedown", this, true);

    let css = `
:root[animate-menupopups]
  :not(menulist)
  > menupopup:not([position], [type="arrow"], [animate="false"]) {
  opacity: 1;
  clip-path: var(none, inset(75% 0 0 0));
  transform: var(--animate-transform-initial, translateY(-75%));
  transform-origin: var(--animate-origin, top);
  transition-property: transform, clip-path;
  transition-duration: 333ms;
  transition-timing-function: cubic-bezier(0, 0, 0, 1);
  transform-style: flat;
  backface-visibility: hidden;
}

:root[animate-menupopups]
  menu > menupopup:not([position], [type="arrow"], [animate="false"]) {
    --animate-clip-initial: inset(75% 0 0 0);
    --animate-transform-initial: translateY(-75%);
    --animate-origin: top;
}

:root[animate-menupopups]
  :not(menulist)
  > menupopup:not([position], [type="arrow"])[animate][animate="open"] {
  clip-path: inset(0 0 0 0);
  transform: none !important;
}

:root[animate-menupopups]
  :not(menulist)
  > menupopup:not([position], [type="arrow"])[animate][animate="cancel"] {
  transform: none;
}
:root[animate-menupopups] :not(menulist) > menupopup:not([position], [type="arrow"])[animating] {
  pointer-events: none;
}`;

    let sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(
      Ci.nsIStyleSheetService
    );
    let uri = Services.io.newURI(
      `data:text/css;charset=UTF=8,${encodeURIComponent(css)}`
    );
    if (!sss.sheetRegistered(uri, sss.AUTHOR_SHEET)) {
      sss.loadAndRegisterSheet(uri, sss.AUTHOR_SHEET);
    }
  }

  setMainAnimationDirection(menu, direction) {
      if (direction === "up") {
          menu.style.setProperty('--animate-clip-initial', 'inset(0 0 75% 0)');
          menu.style.setProperty('--animate-transform-initial', 'translateY(75%)');
          menu.style.setProperty('--animate-origin', 'bottom');
      } else {
          menu.style.removeProperty('--animate-clip-initial');
          menu.style.removeProperty('--animate-transform-initial');
          menu.style.removeProperty('--animate-origin');
      }
  }

  handleEvent(e) {
    if (e.type === "contextmenu" || (e.type === "mousedown" && e.button === 2)) {
      this.cursorY = e.clientY;

      const menu = document.getElementById("contentAreaContextMenu");
      if (!menu) return;

      const viewportHeight = window.innerHeight;
      const threshold = viewportHeight * 0.60;

      if (this.cursorY > threshold) {
        this.setMainAnimationDirection(menu, "up");
      } else {
        this.setMainAnimationDirection(menu, "down");
      }
      return;
    }

    const popup = e.target;
    if (popup.tagName !== "menupopup" || popup.hasAttribute("position") || popup.getAttribute("type") == "arrow" || (popup.parentElement && popup.parentElement.tagName == "menulist")) {
        return;
    }
    
    this[`on_${e.type}`](popup);
  }

  on_popupshowing(popup) {
    if (popup.getAttribute("animate") != "false") {
      popup.setAttribute("animate", "open");
      popup.setAttribute("animating", "true");
    }
  }

  on_popupshown(popup) {
    popup.removeAttribute("animating");
  }

  on_popuphidden(popup) {
    if (popup.getAttribute("animate") != "false") {
      popup.removeAttribute("animate");
      if (popup.id === 'contentAreaContextMenu') {
          this.setMainAnimationDirection(popup, "down");
      }
    }
  }
}

new AnimateContextMenus();