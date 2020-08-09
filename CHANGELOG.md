# Changelog

## v2.0.0

#### Changes:

- Front end was rewritten, including styles, layout, and fonts were changed.
- Back end was partially rewritten.
- Context menu now uses the electron built in module.
- All items are now stored under the `items` namespace, this means that items wont transfer from the previous version. To import them right-click on the tray icon and click `Import Old Items`
- Not using `JQuery` anymore.

#### New Features:

- You can now press `ctrl+enter` to add an new item and press `Esc` to exit the input.
- Text preview is now trimmed.

#### Bug Fixes:

- The function that computed the window's position didn't always put it at the right place.

## v1.0.0

_Initial Release_
