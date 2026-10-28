# 10: The headshot strip stops short of the chip edge

**Repo:** `cpcfantasyfootball`

**What to fix:** In the swap card, the headshot image of each player chip is narrower than the chip, so a blank strip shows on the right. The two-side arrow card and the row-per-side card both show it, and the arrow card showed it before the multi-team feature. See `.scratch/analyzer-multi-team/screenshots/result-three-fix-1280.png`.

**Blocked by:** None (can start immediately)

**Status:** triage

- [ ] The headshot fills the chip edge to edge in both cards
- [ ] A missing headshot keeps the fallback with no gap
