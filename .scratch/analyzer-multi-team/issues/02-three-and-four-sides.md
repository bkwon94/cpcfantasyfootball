# 02: Three and four sides graded as one

**Repo:** `cornerstone-fantasy-sleeper-weekly-report`

**What to build:** A manager posts a trade with three or four sides and gets one grade. The model accepts two to four sides and rejects a fifth. Each side's gets come from every other side's `to` fields. The letter per side stays the ratio of gets over gives. The fairness runs the same rule over every side, and `gives_more` names the one lowest side. The decision stays for the asker. The model output check asks for exactly N sides in request order. The prompt names each side's gives and gets with the source and destination of each player. The response lists every side in request order in `trade.sides`, `fairness.sides`, and `sides`. A three-side fixture lands in the site repo as `.scratch/site-react/fixtures/analyze-response-three.json`.

**Blocked by:** 01 (A given player names its destination, two sides)

**Status:** done

- [x] A fifth side is an input error, tested at the API seam
- [x] A three-side trade gets one start letter per side from its own gets and gives, tested at the rubric seam
- [x] A three-side fairness reads win-win, fair, and lopsided with the right `gives_more`, tested at the rubric seam
- [x] The analysis check passes a three-side output and fails a two-side output for a three-side trade
- [x] The prompt names the source and destination of each player
- [x] A three-side request grades end to end at the API seam with every side in order
- [x] The three-side fixture lands in the site repo and matches the live response shape
- [x] The pipeline test suite passes

## Comments

- 2026-10-27, Truckasaurus Tina: Done in the pipeline commit c7ff17c. The CLI takes `--side ROSTER:PLAYER@TO,PLAYER@TO` two to four times. The three-side fixture is in the site repo.
