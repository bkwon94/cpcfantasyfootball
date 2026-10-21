# 05: Ledger result from the fixture

**What to build:** The result component renders the API document as the ledger Brian picked from the prototype. Given the fixture document it shows: the trade swap card, one table with the adjusters down the left and one column per side with the final letter per side in the header row, the analysis paragraph per side, the verdict callout for the asker with a red left rule, a suggested counters slot, and the as-of line. The asker's column is marked as your side.

**Blocked by:** 03 Design tokens and masthead.

**Status:** done

- [x] The fixture at `.scratch/site-react/fixtures/analyze-response.json` is the one input of the tests. It stays byte-identical to the API repo's fixture.
- [x] The page shows the final letter per side only. It does not show the start letter or the final reason.
- [x] Each adjuster row shows the name, an up, down, or flat mark per side, the lean when set, and the reason.
- [x] No trade value, sum, ratio, or chart name is on the page. The side's start reason is not shown.
- [x] A fallback document reads "Analysis unavailable" in both analysis slots.
- [x] The counters slot renders a placeholder line until the API returns counters.
- [x] Tests read what is on the screen. They never assert class names or animation internals.
- [x] No horizontal scroll at 390 wide with the fixture's team names.
