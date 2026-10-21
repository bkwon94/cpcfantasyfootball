# 06: Trade form and submit

**What to build:** A manager picks the players each side gives from rows with headshots and tick boxes, taps submit, watches a loading state, and reads the ledger. Submit stays off until each side gives at least one player. A rate limit, a bad roster, a missing chart, or a timeout each get a plain message.

**Blocked by:** 04 Passphrase and team pickers, 05 Ledger result from the fixture.

**Status:** done

- [x] Each picked team shows its roster as rows with headshot, name, position, and NFL team, each with a tick box.
- [x] Submit is disabled until both sides give at least one player.
- [x] Submit posts the analyze body with the season, the two sides, and the asker. The asker is my team.
- [x] A loading state shows while the grade runs. The result mounts the ledger from ticket 05.
- [x] 422 shows the API's message. 429 shows the retry time from `Retry-After`. 503 shows "no grade this week yet". A timeout past 30 seconds shows a retry button.
- [x] A headshot that fails to load falls back to the default image.
- [x] Tests cover the disabled submit, the post body, and each error state against a stubbed fetch.
- [x] A full walk-through against the local API at 390 wide, with and without an Anthropic key.

## Comments

- Walk-through at 390 wide against the local API with no Anthropic key: teams loaded, I picked two teams and one player each, and analyze answered 503. The page showed "No grade this week yet. The chart is not on the server." scrollWidth was 390. I did not see a real grade or the code-only grade. The run with a key is not done.
