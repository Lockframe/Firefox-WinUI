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

// Optional  Windows scrolling personality recreation
//user_pref("apz.overscroll.enabled", true);
//user_pref("general.smoothScroll.msdPhysics.continuousMotionMaxDeltaMS", 12);
//user_pref("general.smoothScroll.msdPhysics.enabled", true);
//user_pref("general.smoothScroll.msdPhysics.motionBeginSpringConstant", 600);
//user_pref("general.smoothScroll.msdPhysics.regularSpringConstant", 650);
//user_pref("general.smoothScroll.msdPhysics.slowdownMinDeltaMS", 25);
//user_pref("general.smoothScroll.msdPhysics.slowdownMinDeltaRatio", "2");
//user_pref("general.smoothScroll.msdPhysics.slowdownSpringConstant", 250);
//user_pref("general.smoothScroll.currentVelocityWeighting", "1");
//user_pref("general.smoothScroll.stopDecelerationWeighting", "1");
//user_pref("mousewheel.default.delta_multiplier_y", 300);