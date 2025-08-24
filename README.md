# Firefox-WinUI Theme

*Firefox-WinUI* is a custom CSS theme that applies the Windows 11 design language to Firefox. It allows use of [mica and acrylic materials](https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/materials), and can extend Firefox with custom tweaks.

![WinUI Firefox Theme Screenshot](screenshots/WinUI-Firefox.png)

## Browser Support

Firefox stable release is supported. Beta and Nightly may work, but support is limited.

## Installation

### Open Firefox profile folder

1. Open [`about:support`](about:support)
2. Find `Profile Folder` then click on `Open Folder`

### Install Theme Files

1. [Download the files](https://github.com/Lockframe/Firefox-WinUI/archive/refs/heads/main.zip) in this repository and extract the zip file
2. Install the `spinner-font.tff` font on your system
3. Copy the `chrome` folder and `user.js` file into your profile folder

---

### Optional Transparency

The theme allows use of **Mica**, which adds a translucent layer to the UI, and **Acrylic**, which blurs various elements, such as context menus, panels and dialogs.

To do this, open `about:config` and enable the following keys:

- `widget.windows.mica`
- `widget.windows.mica.popups` (Set to 1 or 2)
- `browser.tabs.allow_transparent_browser` (⚠️ Extends the **Mica** backdrop into the new tab page area, but may cause issues in some web pages.)

---

## Settings

Create the following boolean or numeric keys as required:

### Visual

- `uc.winui.aptos` - Use the new MS Aptos font (Download and install the font from [here](https://www.microsoft.com/en-us/download/details.aspx?id=106087) first)
- `uc.winui.borderless-bookmarks-bar` - Remove the border between the navbar and bookmarks bar
- `uc.winui.centered-url` - Center aligns the URL in the URL Bar
- `uc.winui.centered-url-alt` - Center aligns the URL in the URL Bar but moves it back to the left when selected
- `uc.winui.extra-highlights` - Adds more highlights to the active tab and context menu
- `uc.winui.grayer-tabbed` - Reduces the saturation of the Mica backdrop in dark mode
- `uc.winui.hide-shortcuts` - Hide shortcut hints in menus and panels
- `uc.winui.more-acrylic` - Extends the Acrylic texture into the navbar, bookmarks bar and the selected tab
- `uc.winui.navbar-highlights` - Adds a highlight to the top of the navbar
- `uc.winui.pill-urlbar` - URL bar corners are fully rounded
- `uc.winui.rounded-corners` - Creates a gap with rounded corners between the web content and the browser frame
- `uc.winui.rounded-navbar` - Rounds the upper corners of the navbar
- `uc.winui.shorter-titlebar-buttons` - Shrinks the titlebar buttons (close/maximize/restore/minimize) to match WinUI 2 apps
- `uc.winui.smaller-toolbar-buttons` - Shrinks the toolbar buttons to match other WinUI apps
- `uc.winui.taller-bookmarks` - Increase the size of the bookmarks bar to match File Explorer's toolbar
- `uc.winui.taller-urlbar` - Increase the height of the URL bar to match the early iterations of Windows 11's search bar
- `uc.winui.titlebar-style` - 1 to add rounded corners to the titlebar buttons and 2 to add rounded corners and accent-colored glyphs when hovering over them (⚠️ Incompatible with `uc.winui.shorter-titlebar-buttons`)
- `uc.winui.transparent-urlbar` - Makes the URL bar transparent
- `uc.winui.urlbar-extra-separators` - Add highlighted separators to either side of URL bar

### Layout

- `uc.winui.floating-tabs` - Disconnects the tabs from the navbar similar to Edge's deprecated Phoenix redesign
- `uc.winui.extension-tray` - Compacts the extension menu into a grid of icons similar to the system tray found on Windows 11
- `uc.winui.immersive-navbar` - Adds a margin to either side of the navbar to match the margin created by the rounded corners tweak
- `uc.winui.tab-close-button` - Changes how tab close buttons are displayed, 1 to have it appear on the selected tab and when hovering unselected tabs, 2 to have it appear only when hovering a tab and 3 to remove it entirely

### Icon and Navigation

- `uc.winui.mac-back-forward` - Changes the back/forward glyphs to the ones seen on MacOS

### Experimental

- `uc.winui.acrylic-animations` - Enables acrylic animations
- `uc.winui.hide-with-1-tab` - Hides the tab bar if only one tab is open
- `uc.winui.js-animations` - Enables animations that require external `.uc.js` files due to CSS limitations
- `uc.winui.extra-animations` - Enables extra and unfinished animations
- `uc.winui.experiments` - Enables experimental and unfinished features

### Additional Customization

- [Sidebery extension](https://github.com/mbnuqw/sidebery) can be customized with this theme. Paste the code from `sidebery-WinUI.css` into Sidebery's internal style editor.
- [Follow this guide](https://github.com/MrOtherGuy/fx-autoconfig) to enable JS animations.

### Restart Firefox

Some settings may require a restart to apply. To ensure all settings are fully enabled, go to `about:support` and click `Clear startup cache...`.

---

## Inspiration and Credits

This theme integrates styling and features from:

- [Edge-Frfox](https://github.com/bmFtZQ/Edge-FrFox) by [bmFtZQ](https://github.com/bmFtZQ)
- [Firefox CSS Hacks](https://github.com/MrOtherGuy/firefox-csshacks) by [MrOtherGuy](https://github.com/MrOtherGuy)
- [Firefox UWP Style](https://github.com/Guerra24/Firefox-UWP-Style) by [Guerra24](https://github.com/Guerra24)
- [Shimmer](https://github.com/nuclearcodecat/shimmer) by [Nuclearcodecat](https://github.com/nuclearcodecat)
- [WaveFox](https://github.com/QNetITQ/WaveFox/) by [QNetITQ](https://github.com/QNetITQ)

---

## Contributing

Bug reports, feature requests, and code contributions are always welcome.