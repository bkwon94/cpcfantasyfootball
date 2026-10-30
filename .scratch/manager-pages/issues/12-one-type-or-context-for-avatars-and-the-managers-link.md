# 12: One type or a context for the avatars and the managers link

**What to build:** `avatars` and `managersHref` travel together through `AllMatchups`, `Trades`, `PowerRankings`, `Standings`, and each inner `Row`, `Side`, or `TradeCard`. One link change touched eight files. Cut the number of files a link change touches.

**Blocked by:** none

**Status:** ready-for-agent

- [ ] Compare two options: one type that holds both values, or a React context that holds both.
- [ ] Pick the option with the smaller diff and fewer props. Say why in the commit message.
- [ ] `Moves` on the manager page also takes `managers` and `managersHref`. Include it in the check.
- [ ] No change in the rendered HTML. `pnpm check:export` still passes.
- [ ] The tests pass with no change to what they read.
