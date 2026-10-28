# 06: Add a third and a fourth side

**Repo:** `cpcfantasyfootball`

**What to build:** A reader enters a three- or four-team trade. An "Add a Team" ghost button sits in the next grid cell after the last side and shows when every side has a team and the trade has fewer than four sides. New sides are "Team Three" and "Team Four" and have a remove control in their heading; the first two do not. With three or more sides each picked row gets a small Select labeled "To" that lists the other sides' teams, with the default the next side in order and the first side for the last. The row reads "Name · To <Team>". A removed side's players leave the trade, and players sent to it fall back to the default destination. A destination holds when another side changes its team. The grade button stays off until every side gives and gets at least one player. From the tablet tier the sides sit in a two-column grid and wrap; the grid stays two columns at the desktop tier. The document order is side by side. A new side and a picked row animate in and out with a Framer Motion layout animation under `useMotionOff`. The finder hides once the trade has a third side.

**Blocked by:** 02 (Three and four sides graded as one), 05 (Select pickers for a two-side trade)

**Status:** done

- [x] "Add a Team" shows only when every side has a team and there are fewer than four sides, tested at the form seam
- [x] The third and fourth sides have a remove control and the first two do not, tested at the form seam
- [x] The To picker shows at three sides with the default destination, and not at two, tested at the form seam
- [x] A removed side's players leave and the players sent to it fall back, tested at the form seam
- [x] The grade button stays off until every side gives and gets a player, tested at the form seam
- [x] The posted body for a three-side trade carries every side in order with its destinations, tested at the form seam
- [x] The finder is hidden at three sides, tested at the form seam
- [x] Reduced motion renders no movement, tested at the form seam
- [x] `pnpm test`, `pnpm typecheck`, `pnpm build`, and `pnpm check:export` pass

## Comments

- 2026-10-27, Truckasaurus Tina: Done in commit cb6718f. A pick's `to` holds the side id, not the roster id, so a destination holds when that side changes its team.
