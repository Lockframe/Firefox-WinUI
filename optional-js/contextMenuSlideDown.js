// ==UserScript==
// @name           Animate Context Menus
// @author         Lockframe
// @include        *
// ==/UserScript==
class AnimateContextMenus {
  constructor() {
    document.documentElement.setAttribute("animate-menupopups", true);
    addEventListener("popupshowing", this);
    addEventListener("popupshown", this);
    addEventListener("popuphidden", this);
    let css = `:root[animate-menupopups]
  :not(menulist)
  > menupopup:not([position], [type="arrow"], [animate="false"]) {
  opacity: 1;
  clip-path: inset(75% 0 0 0);
  transform: translateY(-75%);
  transform-origin: top;
  transition-property: transform, clip-path;
  transition-duration: 333ms;
  transition-timing-function: cubic-bezier(0, 0, 0, 1);
  transform-style: flat;
  backface-visibility: hidden;
}

:root[animate-menupopups]
  :not(menulist)
  > menupopup:not([position], [type="arrow"])[animate][animate="open"] {
  clip-path: inset(0 0 0 0);
  transform: none !important;
  transition-duration: 250ms;
  transition-timing-function: cubic-bezier(0, 0, 0, 1);
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

  handleEvent(e) {
    if (e.target.tagName !== "menupopup") return;
    if (e.target.hasAttribute("position")) return;
    if (e.target.getAttribute("type") == "arrow") return;
    if (e.target.parentElement) {
      if (e.target.parentElement.tagName == "menulist") return;
    }
    if (
      e.target.shadowRoot &&
      e.target.shadowRoot.firstElementChild.classList.contains(
        "panel-arrowcontainer"
      )
    ) {
      return;
    }
    this[`on_${e.type}`](e);
  }

  on_popupshowing(e) {
    if (e.target.getAttribute("animate") != "false") {
      e.target.setAttribute("animate", "open");
      e.target.setAttribute("animating", "true");
    }
  }

  on_popupshown(e) {
    e.target.removeAttribute("animating");
  }

  on_popuphidden(e) {
    if (e.target.getAttribute("animate") != "false") {
      e.target.removeAttribute("animate");
    }
  }
}

new AnimateContextMenus();
