# 01: Paint the black card with its own token

**What to build:** A reader sees no change. The black card gets its own color token, brand black in the light theme, so a later ticket can lift the card in the dark theme while the masthead stays black. The six components that paint a black card switch to the new token. The masthead, the compact bar, and the menu keep the brand black token. Add the token comment with its job, as the raised dark surface has.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] A new color token paints the black card. Its comment says why the card has its own token.
- [x] Every black card component uses the new token. No card component uses the brand black token for its surface.
- [x] The masthead, the compact bar, and the menu still use the brand black token.
- [x] Typecheck, test, and build pass. The light site looks the same at 390 and desktop.
