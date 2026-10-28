# 11: Two picked states lose their fill in the dark theme

**What to build:** A league member in the dark theme sees which player row is ticked and which week chip is chosen, as in the light theme. Now a ticked player row in the analyzer looks the same as an unticked row, and only the red checkbox shows the pick; in the light theme a ticked row turns black. The chosen week chip in the rankings table is near-black instead of white, so it is less distinct from the other chips. Both come from the theme feature's token re-point, not from the site-pages feature. Shots: `.scratch/site-pages/screenshots/06-form-1280-dark.png` and `06-rankings-768-dark.png`.

**Blocked by:** None

**Status:** done

- [ ] A ticked player row in the dark theme has a fill a reader sees at once.
- [ ] The chosen week chip in the dark theme is the lightest chip.

## Comments

2026-10-28, Truckasaurus Tina: Moot. The multi-team analyzer feature replaced the radio and tick-box lists with Select pickers, and the picked row has its own fill token in both themes.
