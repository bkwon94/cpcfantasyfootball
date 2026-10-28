# 02: Carry red text on the page with its own token

**What to build:** A reader sees no change. Red text on the page gets its own color token, brand red in the light theme, so the dark theme can re-point it to light red without a change to red fills. Switch every red text use on the page to the new token, about 27 uses across 15 components. Red fills, red borders, the red glow, and red text already on a black card keep what they have. Add the token comment with its contrast on white.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] A new color token carries red text on the page. Its comment says why red text and red fills take different tokens.
- [ ] No component paints text on the page with the brand red token.
- [ ] Fills, borders, the glow, and light red text on a black card are unchanged.
- [ ] Typecheck, test, and build pass. The light site looks the same at 390 and desktop.
