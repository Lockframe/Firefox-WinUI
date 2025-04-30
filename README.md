# Firefox-WinUI Theme

*Firefox-WinUI* is a custom CSS theme that applies the Windows 11 design language to Firefox. It allows use of [mica and acrylic materials](https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/materials), and can extend Firefox with custom tweaks.

![WinUI Firefox Theme Screenshot](screenshots/WinUI-Firefox.png)

---

## Browser Support

Firefox stable release is supported. Beta and Nightly may work, but no guarantees and no support.

---

## Installation

### Open Firefox profile folder

1. Open [`about:support`](about:support)
2. Find `Profile Folder` then click on `Open Folder`

### Install Theme Files

1. [Download the files](https://github.com/Lockframe/Firefox-WinUI/archive/refs/heads/main.zip) in this repository and extract the zip file
2. Install the `spinner-font.tff` font on your system
3. Copy the `chrome` folder and `user.js` file into your profile folder

### Optional Transparency

The theme allows use of **Mica**, which adds a translucent layer to the UI, and **Acrylic**, which blurs various elements, such as context menus, and dialogs.

To do this, open `about:config` and enable the following boolean keys:

- `widget.windows.mica` (enable mica backdrop)
- `widget.windows.mica.popups` (⚠️ Acrylic context menus. Requires `uc.winui.acrylic-menus` to be `true`) ????? default = 2 - what does this mean? ?????
- `browser.tabs.allow_transparent_browser` (⚠️ Make new tab page translucent. This may cause issues in some web pages)

---

## Settings

Create the following boolean keys as required:

### Visual

- `uc.winui.acrylic-menus` - enable acrylic material in menus (requires `widget.windows.mica.popups` to be `true`)
- `uc.winui.aptos` - use the new MS Aptos font ([Download Aptos font](https://www.microsoft.com/en-us/download/details.aspx?id=106087) and install first)
- `uc.winui.borderless-bookmarks-bar` - ?????
- `uc.winui.centered-url` - center aligns the URL in the URL Bar
- `uc.winui.extra-acrylic` - turn up the acrylic effects ?????
- `uc.winui.extra-highlights` - ?????
- `uc.winui.grayer-tabbed` - makes UI a lighter shade of gray
- `uc.winui.hide-shortcuts` - hide shortcut hints in menus
- `uc.winui.more-acrylic` - turn up the acrylic effects ?????
- `uc.winui.navbar-highlights` - ?????
- `uc.winui.pill-urlbar` - URL bar corners are fully rounded
- `uc.winui.rounded-corners` - soften corners of various UI elements
- `uc.winui.rounded-navbar` - soften corners of the nav bar
- `uc.winui.smaller-toolbar-buttons` - make toolbar buttons smaller
- `uc.winui.taller-bookmarks` - make Bookmarks Toolbar taller
- `uc.winui.taller-urlbar` - make URL bar taller
- `uc.winui.transparent-urlbar` - make URL bar transparent
- `uc.winui.urlbar-extra-separators` - add separators either side of URL bar

### Layout

- `uc.winui.floating-tabs` - brings back the floating 'tabs', for those who like that sort of thing
- `uc.winui.extension-tray` - compacts the drop-down extenions list to just extension icons
- `uc.winui.immersive-navbar` - ?????

### Icon and Navigation

- `uc.winui.mac-back-forward` - make back / forward icons look lik MacOS

### Experimental

- `uc.winui.acrylic-animations` - enable acrylic animations
- `uc.winui.hide-with-1-tab` - if only one tab open, hide it
- `uc.winui.js-animations` - ?????
- `uc.winui.extra-animations` - enable extra menu animations
- `uc.winui.revert-titlebar-buttons` - ?????

### Additional Customization

- [Sidebery extension](https://github.com/mbnuqw/sidebery) can be customized with this theme. Paste the code from `sidebery-WinUI.css` into Sidebery's internal style editor.
- [Custom JavaScript animations](https://github.com/MrOtherGuy/fx-autoconfig) can be used to further extend this theme.

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
