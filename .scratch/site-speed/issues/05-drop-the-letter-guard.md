# 05: Drop the old-shape guard

**What to build:** The API now sends the decision document, so the guard `readAnalyzeDocument` in `src/lib/analyze-types.ts` that maps the old letter shape goes, with `LetterDocument`, `LetterSide`, the fixture `.scratch/site-react/fixtures/analyze-response-letters.json`, and the guard tests.

**Why:** Dead code after the API deploy of 2026-10-22.

**Blocked by:** None.

**Status:** done, deployed 2026-10-22

- [x] Remove the guard, its types, its fixture, and its tests. `postAnalyze` returns the JSON as the new type.
- [x] `pnpm test` and `pnpm typecheck` pass. Push to main deploys.
