# 04: Passphrase and team pickers

**What to build:** A manager opens the analyzer, types the league passphrase once in a dialog, and the page remembers it on that phone. The page then loads the league's teams and shows two pickers, my team and the other team, each row with the team avatar. A wrong passphrase gets a plain message and the dialog again.

**Blocked by:** 03 Design tokens and masthead.

**Status:** ready-for-agent

- [ ] The passphrase dialog shows on first load and never again while local storage holds a value.
- [ ] Every API call sends the passphrase in the `X-League-Passphrase` header.
- [ ] The page fetches the teams route for the season on load and fills both pickers with name and avatar.
- [ ] A 401 clears the stored passphrase, shows a plain message, and opens the dialog again.
- [ ] The pickers refuse the same team on both sides.
- [ ] A test covers the dialog on first load, the stored passphrase on a second load, and the 401 path.
- [ ] Works against the local API with the laptop passphrase, checked at 390 wide.
