// ==UserScript==
// @name           WinUI Settings Button
// @description    Adds toolbar button and menu item for WinUI theme settings
// @author         YourName
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
    
    // Check if settings page is already open
    for (let tab of gBrowser.tabs) {
      if (tab.linkedBrowser.currentURI.spec === url) {
        gBrowser.selectedTab = tab;
        return;
      }
    }
    
    // Open new tab with settings
    gBrowser.selectedTab = gBrowser.addTab(url, {
      triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal()
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

  console.log("WinUI Settings: Toolbar button and menu item created");
})();
