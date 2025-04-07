# Firefox-WinUI Theme

A custom CSS theme that transforms Firefox to seamlessly integrate with Windows 11's design language.

## Overview

This theme integrates styling from:
- [Edge-Frfox](https://github.com/bmFtZQ/Edge-FrFox) by bmFtZQ
- [Firefox CSS Hacks](https://github.com/MrOtherGuy/firefox-csshacks) by MrOtherGuy
- [Firefox UWP Style](https://github.com/Guerra24/Firefox-UWP-Style) by Guerra24
- [Shimmer](https://github.com/nuclearcodecat/shimmer) by Nuclearcodecat
- [WaveFox](https://github.com/QNetITQ/WaveFox/) by QNetIWQ

![WinUI Firefox Theme Screenshot](screenshots/WinUI-Firefox.png)

## Prerequisites

- Firefox browser from the stable branch

## Installation

### 1. Prepare Firefox Profile

- Navigate to your Firefox profile's folder

### 2. Install Theme Files

- Download the files in this repository
- Install the `spinner-font.tff` font on your system
- Move the `chrome` folder and `user.js` file into your Firefox profile's folder

### 3. Optional Extended Transparency

Enable the following boolean keys in `about:config` to enable the mica backdrop and acrylic context menus:
- `widget.windows.mica`
- `widget.windows.mica.popups` (⚠️ Acrylic context menus. Requires `uc.winui.acrylic-menus` to be set to `true`)
- `browser.tabs.allow_transparent_browser` (⚠️ New tab page translucent. Can cause issues in some web pages)

### 4. Tweaks

Create these boolean keys for additional customizations:

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
- `uc.winui.aptos` (Download the font [here](https://www.microsoft.com/en-us/download/details.aspx?id=106087))
- `uc.winui.centered-url`
- `uc.winui.taller-bookmarks`
- `uc.winui.acrylic-menus` (Requires `widget.windows.mica.popups` to be set to `true`)
- `uc.winui.borderless-bookmarks-bar`

#### Layout Tweaks
- `uc.winui.floating-tabs`
- `uc.winui.extension-tray`
- `uc.winui.immersive-navbar`

#### Icon and Navigation Tweaks
- `uc.winui.mac-back-forward`

#### Experimental Tweaks
- `uc.winui.acrylic-animations`
- `uc.winui.hide-with-1-tab`
- `uc.winui.js-animations`
- `uc.winui.extra-animations`
- `uc.winui.revert-titlebar-buttons`

### 5. Restart Firefox

Close and restart Firefox to apply the theme.

## Sidebery

To apply this theme to the Sidebery extension, copy the content from `sidebery-WinUI.css` and paste it into Sidebery's internal style editor.

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