# 04: The upside adjuster

**Repo:** `cornerstone-fantasy-sleeper-weekly-report`

**What to build:** A manager who trades for a star out now with no return week, or for a player whose role just opened, sees an upside factor in the grade. Upside is the eighth adjuster, after injury and before handcuff. It steps one or zero, never down, and reads the players a side gets only. A star is a player in the top `STAR_RANK` of the chart, a tunable with a start of 24. A star return bet is a star who is out now and not out for the season; the injury adjuster exempts him. An opportunity is a player whose same-position teammate on the same NFL team is out for the season or out with no near return, and whose snap share, target share, air yards share, or WOPR points up. A QB reads no snap share. The reason names the player and the signal. The prompt names the upside among what the model covers. The site renders the factor by name with no change.

**Blocked by:** 03 (Out for the season)

**Status:** done

- [x] A side that gets a star out now with no return week steps up, and the injury adjuster leaves him alone, tested at the rubric seam
- [x] A side that gets a star out for the season gets no upside, tested at the rubric seam
- [x] A side that gets a player whose teammate is out and whose use points up steps up, tested at the rubric seam
- [x] A QB with a flat target share and WOPR gets no upside from snaps, tested at the rubric seam
- [x] A side that gives a star return bet gets no upside for him, tested at the rubric seam
- [x] The upside reason names the player and the signal
- [x] The prompt names the upside
- [x] A graded trade at the API seam carries an upside factor per side
- [x] The pipeline test suite passes

## Comments

- 2026-10-27, Truckasaurus Tina: Done in the pipeline commit 8c50b70, merged on the feature branch. The API sends the factor as `upside`. Air yards share is in. `STAR_RANK = 24`. The finder fixture in the pipeline tests changed; the site copy did not need it.
