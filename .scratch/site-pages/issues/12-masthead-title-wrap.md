# 12: The masthead title wraps to four lines at the desktop tier

**What to build:** A reader at the desktop tier sees the brand title "Cornerstone Fantasy Football League" on one line, two at most. At 1024 and 1280 it took four lines, one word per line, beside the logo. The row of links and the brand link shared one flex line in the 688px column. The links took 501px and the theme button took 48px more, so the title got about 120px. Two lines need 218px. The cause is the desktop type step of the report feature, which raised the label from 10px to 12px and the meta size from 12px to 14px. The theme button made the overflow worse, but the row was too wide without it. From the desktop tier the row of links takes its own line under the brand line. The theme button stays at the right end of the brand line, as on a phone. The compact bar and the tiers below the desktop tier do not change.

**Blocked by:** None

**Status:** done

- [x] The title takes one line at 1024, 1280, and 1440, in the light and the dark theme.
- [x] The row of links sits under the brand line, across the column, with a 16px top space.
- [x] The theme button sits at the right end of the brand line, and the desktop row has no copy of it.
- [x] The masthead at 390 and 768 and the compact bar at 1280 do not change.
- [x] `pnpm typecheck`, `pnpm test`, and `pnpm build` pass.
