# 05 — Finder page

**Repo:** site. **Spec:** pipeline repo `.scratch/win-win/PRD.md`, phase 2.

**What to build:** A manager picks a partner team on the analyze page, taps "Find a trade", and reads three cards: each with the two sides, the fairness line, and one reason. Each card links to the full result for that trade through the analyze route. An empty result shows the line that no swap between these rosters is good for both. The as-of line shows the data week. A 429 shows the same wait line as the analyze form.

**Blocked by:** 02 — Fairness line on the result page; 04 — Finder route (pipeline).

**Status:** ready-for-agent

- [ ] A partner picker on the analyze page with the eleven other teams.
- [ ] The "Find a trade" action calls the finder route with the passphrase and the two roster ids.
- [ ] Three cards render from the fixture finder document, with a test. Each card links to the analyze result for its trade, with a test.
- [ ] The empty-list line renders, with a test.
- [ ] The 429 wait line renders, with a test.
- [ ] The fixture finder document is a byte-identical copy of the pipeline's.
- [ ] The tests pass.
