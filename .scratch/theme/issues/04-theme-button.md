# 04: The theme button and the stored choice

**What to build:** A reader presses the theme button and the theme flips. The button is one shared component, a 44px icon button from the icon set the site ships. It renders left of the menu button in the masthead and in the compact bar at every tier where the menu button shows, and at the end of the menu row on the desktop tier. It shows a moon in the light theme and a sun in the dark theme. Its accessible name says the action of a press: "Switch to dark theme" or "Switch to light theme". A press flips the class on the root element and stores the choice under one key, light or dark, through a guarded storage helper in the shape of the passphrase helper. The button reads the class from the root on mount. With scripts off it does not render. No transition. The demo reads best after 03.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] The theme button is in the masthead, the compact bar, and the desktop row, next to the menu button, and at least 44px.
- [x] A press adds the class on the root element and stores dark. A second press removes the class and stores light.
- [x] The accessible name says the action of a press and flips with the theme.
- [x] A blocked storage still flips the class for this visit, with no error.
- [x] Tests through the masthead render cover the masthead button, the compact bar button, the desktop row button, a stored dark choice on mount, and blocked storage.
- [x] Typecheck, test, and build pass.
