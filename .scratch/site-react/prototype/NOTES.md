# Analyzer result page prototype

Question: what should the trade analyzer result page look like?

Run from the repo root:

    python3 -m http.server 8787

Then open `http://localhost:8787/.scratch/site-react/prototype/?variant=a`.
Use the floating switcher, or the left and right arrow keys, to change the variant.

- A, Scorecard: the swap card, then two grade cards side by side with a "why" fold, then a dark verdict block.
- B, Verdict first: a dark hero with your letter and the call, then the swap card, then one full card per side.
- C, Ledger: the swap card, then one table with adjusters down and sides across, then the analysis and a red-rule verdict.

Verdict: C, Ledger. Brian picked it on 2026-10-21 with three changes, all now in the prototype.

1. One grade per side, the final letter only. No start letter, no struck letter.
2. No `final_reason` text on the page. The API keeps the field. The page does not show it.
3. The page reads as: pick your team, pick the other team, pick the players, get two grades and a call.

Follow-up for the API, not the page: suggested counters. The document has no counters today.
The page keeps a slot under the verdict until the API returns them.

Screenshots at 390 wide, headless Chrome with reduced motion forced: `screenshots/variant-{a,b,c}-390.png`.
