# Firefox WinUI Theme

A custom CSS addon that transforms Firefox to look native to Windows 11's design, combining elements from multiple community themes.

## Overview

This theme integrates styling from:
- [Edge-Frfox](https://github.com/bmFtZQ/Edge-FrFox) by bmFtZQ
- [Firefox CSS Hacks](https://github.com/MrOtherGuy/firefox-csshacks) by MrOtherGuy
- [Firefox UWP Style](https://github.com/Guerra24/Firefox-UWP-Style) by Guerra24
- [Shimmer](https://github.com/nuclearcodecat/shimmer) by Nuclearcodecat
- [WaveFox](https://github.com/QNetITQ/WaveFox/) by QNetIWQ

![WinUI Firefox Theme Screenshot](screenshots/WinUI-Firefox.png)

## Prerequisites

- Firefox browser
- Edge-Frfox theme installed

## Installation

### 1. Prepare Firefox Profile
- Navigate to your Firefox profile's `chrome` folder
- (Recommended) Backup the original `userContent.css`

### 2. Install Theme Files
- Download the following from this repository:
  - `winui-icons` folder
  - `image` folder
  - `custom.css`
  - `userContent.css`
- Place these files in your Firefox profile's `chrome` folder

### 3. Configure Firefox Settings

#### Required Settings
Open `about:config` and set these boolean keys to `true`:
- `browser.tabs.allow_transparent_browser`
- `svg.context-properties.content.enabled`
- `widget.transparent-windows`
- `widget.windows.mica`

#### Disable Defaults
Set these boolean keys to `false`:
- `browser.startup.blankWindow`
- `uc.tweak.newtab-background`
- `uc.tweak.revert-context-menu`
- `browser.newtabpage.activity-stream.newtabLayouts.variant-a`
- `browser.newtabpage.activity-stream.newtabLayouts.variant-b`
- `browser.urlbar.groupLabels.enabled`

### 4. Optional Customization Tweaks

Enable these boolean keys for additional customizations:

#### Visual Tweaks
- `uc.winui.rounded-corners`
- `uc.winui.rounded-navbar`
- `uc.winui.transparent-urlbar`
- `uc.winui.pill-urlbar`
- `uc.winui.taller-urlbar`
- `uc.winui.extra-acrylic`
- `uc.winui.more-acrylic`
- `uc.winui.smaller-toolbar-buttons`
- `uc.winui.hide-shortcuts`
- `uc.winui.grayer-tabbed`
- `uc.winui.extra-highlights`
- `uc.winui.navbar-highlights`
- `uc.winui.urlbar-extra-separators`
- `uc.winui.aptos`
- `uc.winui.centered-url`
- `uc.winui.taller-bookmarks`

#### Layout Tweaks
- `uc.winui.floating-tabs`
- `uc.winui.extension-tray`
- `uc.winui.immersive-navbar`

#### Icon and Navigation Tweaks
- `uc.winui.mac-back-forward`

#### Experimental Tweaks
- `uc.winui.hide-with-1-tab`
- `uc.winui.js-animations`
- `uc.winui.extra-animations`
- `uc.winui.revert-titlebar-buttons`

### 5. Restart Firefox

Close and restart Firefox to apply the theme.

## Sidebery

To apply this theme to the Sidebery extension, copy the content from `sidebery-WinUI.css` and paste it into Sidebery's style editor.

## JS Animations

For JavaScript-based animations, refer to [this guide](https://github.com/MrOtherGuy/fx-autoconfig).

## Contributing

Contributions, issues, and feature requests are welcome.

## Credits

- [bmFtZQ](https://github.com/bmFtZQ)
- [MrOtherGuy](https://github.com/MrOtherGuy)
- [Guerra24](https://github.com/Guerra24)
- [Nuclearcodecat](https://github.com/nuclearcodecat)
- [QNetITQ](https://github.com/QNetITQ)
