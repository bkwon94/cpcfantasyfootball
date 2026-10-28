# 07: The swap card with three sides

**Repo:** `cpcfantasyfootball`

**What to build:** A reader of a three- or four-team result sees one row per side in the swap card, with what it gives and what it gets, and each player chip tagged with the team he goes to or comes from. A two-team result keeps the arrow swap card. The types gain `to` on a given player and `from` on a got player, both optional, so a document with neither renders the two-side card still. The side reads render one per side in order, as today.

**Blocked by:** 02 (Three and four sides graded as one)

**Status:** done

- [x] The two-side fixture renders the arrow swap card, tested at the result seam
- [x] The three-side fixture renders one row per side with from and to tags, tested at the result seam
- [x] A document with no `to` and `from` renders the two-side card, tested at the result seam
- [x] The side reads render one per side in order, tested at the result seam
- [x] `pnpm test`, `pnpm typecheck`, `pnpm build`, and `pnpm check:export` pass

## Comments

- 2026-10-27, Truckasaurus Tina: Done in commit bad4122, merged in e51b23a.
