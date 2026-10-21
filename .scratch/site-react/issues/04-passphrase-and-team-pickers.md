# 04: Passphrase and team pickers

**What to build:** A manager opens the analyzer, types the league passphrase once in a dialog, and the page remembers it on that phone. The page then loads the league's teams and shows two pickers, my team and the other team, each row with the team avatar. A wrong passphrase gets a plain message and the dialog again.

**Blocked by:** 03 Design tokens and masthead.

**Status:** done

- [x] The passphrase dialog shows on first load and never again while local storage holds a value.
- [x] Every API call sends the passphrase in the `X-League-Passphrase` header.
- [x] The page fetches the teams route for the season on load and fills both pickers with name and avatar.
- [x] A 401 clears the stored passphrase, shows a plain message, and opens the dialog again.
- [x] The pickers refuse the same team on both sides.
- [x] A test covers the dialog on first load, the stored passphrase on a second load, and the 401 path.
- [x] Works against the local API with the laptop passphrase, checked at 390 wide.

## Comments

The walk-through box stays open. The API ran on port 8080 and `curl` with the passphrase `localtest` returned 12 teams with avatars and the CORS header for `http://localhost:3000`. The built site showed the dialog at 390 wide, see `screenshots/04-dialog-390.png`. A headless screenshot cannot type the passphrase or set `localStorage` across origins, so there is no pickers screenshot. The vitest tests cover the pickers. Check the pickers at 390 wide by hand.
- 2026-10-21: walk-through done with agent-browser at a 390 viewport against the local API on the `teams-avatar` branch. Screenshots `04-pickers-390.png` and `04-pickers-picked-390.png`. The picked team disables in the other list. `scrollWidth` 390.
