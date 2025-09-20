// Enables the userChrome.css and userContent.css files.
user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
user_pref("svg.context-properties.content.enabled", true);
user_pref("layout.css.color-mix.enabled", true);
user_pref("layout.css.light-dark.enabled", true);
user_pref("widget.transparent-windows", true);

// Disables preferences that interfere with the theme
user_pref("browser.urlbar.groupLabels.enabled", false);
user_pref("browser.newtabpage.activity-stream.newtabLayouts.variant-a", false);
user_pref("browser.newtabpage.activity-stream.newtabLayouts.variant-b", false);
user_pref("browser.startup.blankWindow", false);
user_pref("sidebar.revamp.round-content-area", false);
