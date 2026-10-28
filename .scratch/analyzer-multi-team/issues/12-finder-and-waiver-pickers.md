# 12: Move the finder and the waiver page to the Select picker

**Repo:** `cpcfantasyfootball`

**What to fix:** The trade form picks a team from a Select. The finder's "Trade Partner" list and the waiver page's team pick still use the old `TeamPicker` radio list, so the old component and its test stay. Move both to the Select, then delete `TeamPicker`, its test, and `team-pick.ts` if nothing else reads it.

**Blocked by:** None (can start immediately)

**Status:** triage

- [ ] The finder picks the partner from a Select with the avatar in each row
- [ ] The waiver page picks its team the same way
- [ ] `TeamPicker` and its test are gone
