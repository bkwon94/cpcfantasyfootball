# 04: The result page leads with the decision

**What to build:** The analyzer result shows the decision for my side first, large: "Yes", "No", or "Not as is", with its one-line reason. Then, per side: the analysis prose, the data, and the reasoning. No letter grade shows anywhere. The document shape is in pipeline ticket 23 and in the fixture it writes.

**Why:** The commissioner wants the call first, then the why.

**Blocked by:** Pipeline ticket 23 (the fixture).

**Status:** done

- [x] Copy `tests/fixtures/api/analyze-response.json` from the pipeline branch `decision-document` into `.scratch/site-react/fixtures/` byte for byte. `src/lib/analyze-types.ts` matches the new shape; the old letter fields go.
- [x] The result view in `src/components/ledger.tsx` or its replacement: the decision block at the top, with the answer word in the red accent for "Yes", black for "No", and the muted tone for "Not as is". The reason under it.
- [x] Per side, in trade order with my side first: the team name once as a label, the analysis paragraph, then "The data" with the chart lean sentence and the factor reasons that carry numbers, then "The reasoning" with each factor as a for, against, or even row.
- [x] A fallback document, with `analysis` null, shows the decision and the data with a one-line note that the analysis is unavailable.
- [x] Tokens only; teach `cn` any new token. Motion under `useMotionOff`.
- [x] Tests read the screen: the three answers; no letter text anywhere; the fallback note.
- [x] Check at 390 wide with `agent-browser` on the fixture; screenshot the top of the result and one side.
- [x] Deployed 2026-10-22, site main `58f4e40`. The guard and the letter fixture go in a follow-up.
