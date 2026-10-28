# 01: A given player names its destination, two sides

**Repo:** `cornerstone-fantasy-sleeper-weekly-report`

**What to build:** A manager posts a two-side trade in which each given player names the roster he goes to, and the analyzer grades it as today. The request side is `{ roster_id, gives: [{ player_id, to }] }`. The API derives what each side gets from the other side's `to` fields. A destination that is not a side, a player sent to his own roster, a side that gets nothing, or a player given twice is an input error with a plain message. The response carries `to` on each given player and `from` on each got player. The finder builds its requests in the new shape. The two-side fixture in the site repo, under `.scratch/site-react/fixtures/`, gains `to` and `from`. The rule is ADR 0003 in the site repo.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The proposed trade model takes the new side shape and derives each side's gets
- [ ] Each new input error returns a 422 with a plain message, tested at the API seam
- [ ] The response carries `to` on gives and `from` on gets, tested at the API seam
- [ ] The rubric tests build trades with the new shape and pass
- [ ] The finder sends the new shape and its tests pass
- [ ] The two-side fixture in the site repo carries `to` and `from`, and the site tests still pass
- [ ] The pipeline test suite passes
