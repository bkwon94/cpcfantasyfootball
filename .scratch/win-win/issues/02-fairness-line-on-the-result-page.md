# 02 — Fairness line on the result page

**Repo:** site. **Spec:** pipeline repo `.scratch/win-win/PRD.md`, phase 1.

**What to build:** A manager who reads a result sees a fairness line under the decision block and above the swap card. The line reads "Good for both", "Fair", or "Lopsided: <team> gives more." Under it sit two reasons, one per side, the asker's side first. The decision stays the lead of the page. The line reads the `fairness` block of the response document. A document without the block shows no line.

**Blocked by:** 01 — Fairness rule and document block (pipeline).

**Status:** ready-for-agent

- [ ] The fixture response document is a byte-identical copy of the pipeline's after ticket 01.
- [ ] The result component renders the three states, with a test per state. The lopsided line names the team.
- [ ] The two reasons render under the line, the asker's first, with a test.
- [ ] A document with no `fairness` block renders no line, with a test.
- [ ] The line meets the reduced-motion rule like the decision block.
- [ ] The tests pass.
