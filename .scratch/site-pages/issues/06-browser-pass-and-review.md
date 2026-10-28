# 06: The browser pass and the review

**What to build:** The feature is checked where jsdom cannot see, and reviewed, before the merge. A league member on a phone, a tablet, and a laptop, in the light theme and the dark theme, gets the three pages as the PRD describes them, with no sideways scroll, and the week page unchanged with its rail.

**Blocked by:** 02 (The home page per tier), 03 (The rankings table per tier), 04 (The analyzer form per tier), 05 (The result as five cards)

**Status:** done

- [ ] Screenshots with agent-browser at 390 by 844, 768 by 1024, and 1280 by 800, reduced motion on, in both themes, saved under the feature's screenshots folder: the home page, the rankings page, the analyzer form after a passphrase with two teams picked, the result after a grade, and the week page at 1280 with its rail.
- [x] No sideways scroll on any page at any of the three widths.
- [x] The rankings table shows the longest team name on one row height at 768 and 1280.
- [x] The guidelines pass with the web-design-guidelines skill finds no new issue on the three pages. Issues from the known list are noted, not fixed.
- [x] The code review skill runs against `main` with no open finding.
- [x] `pnpm test`, `pnpm typecheck`, `pnpm build`, and `pnpm check:export` pass.
- [x] The branch is rebased onto `main` and merged with `--no-ff` from the main checkout when its tree is clean, then pushed.
