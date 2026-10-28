# 05: The result as five cards

**What to build:** A league member grades a trade on a tablet or a laptop and sees the result under the form as cards on the grey body, none of them one line tall: the decision with the fairness line and the no-chart line as one card, the trade swap as one card, one card per side read, and the counters placeholder with the as-of line as one closing card. The labels read "The Trade" and "Suggested Counters". On a phone the result is one column with the chapter rules. The result uses the shared chapter, label, and blurb parts, so its private copies go away and the blurbs cap at the measure.

**Blocked by:** 01 (The page shell and the card look on every page)

**Status:** ready-for-agent

- [ ] The result renders five chapters for a two-team trade: the decision with the fairness line and the no-chart line, the swap, one per side, and the counters with the as-of line.
- [ ] A document with no fairness block shows the decision card with no fairness line.
- [ ] The result uses the shared chapter, label, and blurb parts. No private copy remains in the result.
- [ ] The labels read "The Trade" and "Suggested Counters".
- [ ] The result test checks the labels, the decision text before the fairness text, and the as-of line last. Tests that read "The trade" or "Suggested counters" change with the casing.
- [ ] A browser check at 768 and 1280 shows the five cards under the form card. At 390 the result is one column with the rules.
- [ ] `pnpm test`, `pnpm typecheck`, and `pnpm build` pass.
