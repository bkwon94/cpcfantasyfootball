# 03: Out for the season

**Repo:** `cornerstone-fantasy-sleeper-weekly-report`

**What to build:** The commissioner writes the word `season` in place of a return week in the returns file, and the analyzer reads that player as out for the season. The side that gets him counts zero chart value for him in the start letter. The side that gives him counts his full value. The injury adjuster steps the side that gets him down with the reason "Name is out for the season.", before the no-near-return check. The Sleeper IR status alone is not the mark. The rule is ADR 0005, which sits in the main checkout with the five upside glossary terms; this ticket commits both from its worktree.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The returns loader reads `season` and the snapshot exposes the players out for the season
- [ ] A player out for the season counts zero chart value for the side that gets him only, tested at the rubric seam
- [ ] The injury adjuster steps that side down with the plain reason, tested at the rubric seam
- [ ] A player on IR with no mark is not out for the season, tested at the rubric seam
- [ ] ADR 0005 and the glossary terms are committed
- [ ] The pipeline test suite passes
