// ==UserScript==
// @name           WinUI Settings Button
// @description    Adds toolbar button and menu item for WinUI theme settings
// @author         Vibe-coded with Claude Sonnet 4.5
// @version        1.0
// @include        main
// @shutdown       UC_API.Runtime.goQuitApplication
// ==/UserScript==

(function() {
  // Create toolbar button
  CustomizableUI.createWidget({
    id: "winui-settings-button",
    type: "custom",
    defaultArea: CustomizableUI.AREA_NAVBAR,
    label: "WinUI Settings",
    tooltiptext: "Open WinUI Theme Settings",
    
    onBuild: function(aDocument) {
      const toolbarButton = aDocument.createXULElement("toolbarbutton");
      toolbarButton.id = "winui-settings-button";
      toolbarButton.className = "toolbarbutton-1 chromeclass-toolbar-additional";
      toolbarButton.setAttribute("label", "WinUI Settings");
      toolbarButton.setAttribute("tooltiptext", "Open WinUI Theme Settings");
      
      // Use built-in Firefox icon (you can change this)
      toolbarButton.setAttribute("image", "chrome://browser/skin/preferences/category-general.svg");
      
      toolbarButton.addEventListener("click", function(event) {
        if (event.button === 0) { // Left click
          openWinUISettings();
        }
      });
      
      return toolbarButton;
    }
  });

  // Add menu item to "More Tools"
  const windowListener = {
    onOpenWindow: function(xulWindow) {
      const window = xulWindow.docShell.domWindow;
      window.addEventListener("load", function() {
        if (window.document.documentElement.getAttribute("windowtype") === "navigator:browser") {
          addMenuItems(window);
        }
      }, {once: true});
    }
  };

  function addMenuItems(win) {
    const doc = win.document;
    
    // Wait for app menu to be available
    const moreToolsMenu = doc.getElementById("appmenu-moreTools");
    if (!moreToolsMenu) {
      setTimeout(() => addMenuItems(win), 100);
      return;
    }

    // Find the panel-subview-body
    const panelBody = moreToolsMenu.querySelector(".panel-subview-body");
    if (!panelBody) return;

    // Prevent duplicate
    if (doc.getElementById("appmenu-winui-settings")) return;

    // Create menu item
    const menuItem = doc.createXULElement("toolbarbutton");
    menuItem.id = "appmenu-winui-settings";
    menuItem.className = "subviewbutton subviewbutton-iconic";
    menuItem.setAttribute("label", "WinUI Theme Settings");
    menuItem.setAttribute("image", "chrome://browser/skin/preferences/category-general.svg");
    
    menuItem.addEventListener("command", function() {
      openWinUISettings();
      win.PanelUI.hide();
    });

    // Insert at top of More Tools menu
    panelBody.insertBefore(menuItem, panelBody.firstChild);
  }

  function openWinUISettings() {
    const url = "chrome://userchrome/content/winui-settings.html";
    
    const wins = Services.wm.getEnumerator(null);
    while (wins.hasMoreElements()) {
      let win = wins.getNext();
      if (win.location && win.location.href === url) {
        win.focus();
        return;
      }
    }
    
    let settingsWin = window.openDialog(url, "WinUISettings", "chrome,titlebar,toolbar,centerscreen,dialog=no,width=900,height=750");
    
    function injectWhenReady() {
      if (settingsWin.location.href === url) {
        settingsWin.removeEventListener("load", injectWhenReady);
        setupSettingsWindow(settingsWin);
      }
    }
    
    settingsWin.addEventListener("load", injectWhenReady);
    injectWhenReady();
  }

  function setupSettingsWindow(win) {
    const doc = win.document;
    
    const PREFS = {
      visual: [
        { key: "uc.winui.alternate-button-anim", label: "Alternate button animation", desc: "Enforce the standard WinUI 3 button animation everywhere regardless of design guidelines", type: "boolean" },
        { key: "uc.winui.aptos", label: "Aptos Font", desc: "Use the new MS Aptos font (Download and install the font from Microsoft first)", type: "boolean" },
        { key: "uc.winui.borderless-bookmarks-bar", label: "Borderless Bookmarks Bar", desc: "Remove the border between the navbar and bookmarks bar", type: "boolean" },
        { key: "uc.winui.centered-url", label: "Centered URL", desc: "Center aligns the URL in the URL Bar", type: "boolean" },
        { key: "uc.winui.centered-url-alt", label: "Centered URL (Alt)", desc: "Center aligns the URL in the URL Bar but moves it back to the left when selected", type: "boolean" },
        { key: "uc.winui.extra-highlights", label: "Extra Highlights", desc: "Adds more highlights to the active tab and context menu", type: "boolean" },
        { key: "uc.winui.hide-shortcuts", label: "Hide Shortcuts", desc: "Hide shortcut hints in menus and panels", type: "boolean" },
        { key: "uc.winui.more-acrylic", label: "More Acrylic", desc: "Extends the Acrylic texture into the navbar, bookmarks bar and the selected tab", type: "boolean" },
        { key: "uc.winui.navbar-highlights", label: "Navbar Highlights", desc: "Adds a highlight to the top of the navbar", type: "boolean" },
        { key: "uc.winui.pill-urlbar", label: "Pill URL Bar", desc: "URL bar corners are fully rounded", type: "boolean" },
        { key: "uc.winui.rounded-corners", label: "Rounded Corners", desc: "Creates a gap with rounded corners between the web content and the browser frame", type: "boolean", warning: "You will not be able to scroll through the webpage while hovering over the margins. A .uc.js script is available to fix this." },
        { key: "uc.winui.rounded-navbar", label: "Rounded Navbar", desc: "Rounds the upper corners of the navbar", type: "boolean" },
        { key: "uc.winui.shorter-titlebar-buttons", label: "Shorter Titlebar Buttons", desc: "Shrinks the titlebar buttons (close/maximize/restore/minimize) to match WinUI 2 apps", type: "boolean" },
        { key: "uc.winui.titlebar-style", label: "Titlebar Style", desc: "0 = Default, 1 = Rounded corners on titlebar buttons, 2 = Rounded corners with accent-colored glyphs on hover", type: "int", options: [0, 1, 2], warning: "Incompatible with 'Shorter Titlebar Buttons'" },
        { key: "uc.winui.transparent-navbar", label: "Transparent Navigation Bar", desc: "Makes the Navigation Bar transparent like in Edge's scrapped Phoenix redesign", type: "boolean" },
        { key: "uc.winui.transparent-urlbar", label: "Transparent URL Bar", desc: "Makes the URL bar transparent", type: "boolean" },
        { key: "uc.winui.urlbar-extra-separators", label: "URL Bar Extra Separators", desc: "Add highlighted separators to either side of URL bar", type: "boolean" },
        { key: "uc.winui.alternate-urlbar-dropdown", label: "Detached URL bar dropdown", desc: "Use an alternate detached version of the URL bar dropdown", type: "boolean" }
      ],
      layout: [
        { key: "uc.winui.floating-tabs", label: "Floating Tabs", desc: "Disconnects the tabs from the navbar similar to Edge's deprecated Phoenix redesign", type: "boolean" },
        { key: "uc.winui.extension-tray", label: "Extension Tray", desc: "Compacts the extension menu into a grid of icons similar to the system tray found on Windows 11", type: "boolean" },
        { key: "uc.winui.immersive-navbar", label: "Immersive Navbar", desc: "Adds a margin to either side of the navbar to match the margin created by the rounded corners tweak", type: "boolean" },
        { key: "uc.winui.tab-close-button", label: "Tab Close Button", desc: "0 = Default, 1 = On selected tab and when hovering unselected tabs, 2 = Only when hovering a tab, 3 = Remove entirely", type: "int", options: [0, 1, 2, 3] }
      ],
      navigation: [
        { key: "uc.winui.mac-back-forward", label: "Mac Back/Forward", desc: "Changes the back/forward glyphs to the ones seen on MacOS", type: "boolean" }
      ],
      experimental: [
        { key: "uc.winui.acrylic-animations", label: "Acrylic Animations", desc: "Enables acrylic animations", type: "boolean" },
        { key: "uc.winui.hide-with-1-tab", label: "Hide with 1 Tab", desc: "Hides the tab bar if only one tab is open", type: "boolean" },
        { key: "uc.winui.js-animations", label: "JS Animations", desc: "Enables animations that require external .uc.js files due to CSS limitations", type: "boolean" },
        { key: "uc.winui.extra-animations", label: "Extra Animations", desc: "Enables extra and unfinished animations", type: "boolean" },
        { key: "uc.winui.experiments", label: "Experiments", desc: "Enables experimental and unfinished features", type: "boolean" },
        { key: "uc.winui.vtabs-close-button-style", label: "VTabs Close Button Style", desc: "0 = Default, 1 = Small overlay on top right, 2 = Hide entirely", type: "int", options: [0, 1, 2] },
        { key: "uc.winui.alternate-urlbar-dropdown-animation", label: "Use an alternate, optionally staggered animation for the URL bar dropdown results", desc: "0 = Default, 1 = Smooth downward slide, 2 = Staggered downward slide, 3 = Staggered upward slide", type: "int", options: [0, 1, 2, 3]}
      ]
    };

    function initializePrefs() {
      Object.values(PREFS).flat().forEach(pref => {
        try {
          if (!Services.prefs.prefHasUserValue(pref.key)) {
            if (pref.type === "int") {
              Services.prefs.setIntPref(pref.key, 0);
            } else {
              Services.prefs.setBoolPref(pref.key, false);
            }
          }
        } catch (e) {
          console.error(`Error initializing pref ${pref.key}:`, e);
        }
      });
    }

    function createPrefItem(pref) {
      const item = doc.createElement("div");
      item.className = "pref-item";

      const info = doc.createElement("div");
      info.className = "pref-info";

      const label = doc.createElement("label");
      label.className = "pref-label";
      label.textContent = pref.label;

      const desc = doc.createElement("div");
      desc.className = "pref-desc";
      desc.textContent = pref.desc;

      info.appendChild(label);
      info.appendChild(desc);

      if (pref.warning) {
        const warning = doc.createElement("div");
        warning.className = "pref-warning";
        warning.textContent = "⚠️ " + pref.warning;
        info.appendChild(warning);
      }

      if (pref.type === "int" && pref.options) {
        const select = doc.createElement("select");
        select.id = pref.key;
        select.className = "pref-select";
        
        pref.options.forEach(optionValue => {
          const option = doc.createElement("option");
          option.value = optionValue;
          option.textContent = optionValue;
          select.appendChild(option);
        });

        try {
          select.value = Services.prefs.getIntPref(pref.key, 0);
        } catch (e) {
          select.value = 0;
        }
        
        select.addEventListener("change", (e) => {
          try {
            Services.prefs.setIntPref(pref.key, parseInt(e.target.value));
          } catch (err) {}
        });

        label.htmlFor = pref.key;
        item.appendChild(select);
        item.appendChild(info);
      } else {
        const checkbox = doc.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = pref.key;
        checkbox.className = "pref-checkbox";
        
        try {
          checkbox.checked = Services.prefs.getBoolPref(pref.key, false);
        } catch (e) {
          checkbox.checked = false;
        }
        
        checkbox.addEventListener("change", (e) => {
          try {
            Services.prefs.setBoolPref(pref.key, e.target.checked);
          } catch (err) {}
        });

        label.htmlFor = pref.key;
        item.appendChild(checkbox);
        item.appendChild(info);
      }

      return item;
    }

    function loadSettings() {
      Object.entries(PREFS).forEach(([category, prefs]) => {
        const container = doc.getElementById(`${category}-prefs`);
        if (container) {
          prefs.forEach(pref => {
            container.appendChild(createPrefItem(pref));
          });
        }
      });
    }

    initializePrefs();
    loadSettings();

    doc.getElementById("btn-reset")?.addEventListener("click", () => {
      if (win.confirm("Reset all WinUI theme settings to defaults?")) {
        Object.values(PREFS).flat().forEach(pref => {
          try {
            if (pref.type === "int") {
              Services.prefs.setIntPref(pref.key, 0);
            } else {
              Services.prefs.setBoolPref(pref.key, false);
            }
          } catch (e) {}
        });
        win.location.reload();
      }
    });

    doc.getElementById("btn-support")?.addEventListener("click", () => {
      win.location.href = "about:support";
    });

    doc.getElementById("btn-close")?.addEventListener("click", () => {
      win.close();
    });
  }

  // Initialize for current window
  addMenuItems(window);

  // Add to future windows
  Services.wm.addListener(windowListener);

  // Cleanup on shutdown
  if (window.UC_API?.Runtime) {
    window.UC_API.Runtime.goQuitApplication = function() {
      CustomizableUI.destroyWidget("winui-settings-button");
      Services.wm.removeListener(windowListener);
    };
  }
})();