# 09: Browser pass, review, and merge

**Repo:** `cpcfantasyfootball`

**What to build:** The feature ships. A browser pass with agent-browser in a named session covers the form and a three-side result at 390 by 844, 768 by 1024, and 1280 by 800, both themes, reduced motion on, with the dev server on a dead API URL and a teams list in session storage. The shots land under `.scratch/analyzer-multi-team/screenshots/`. The code-review skill runs two reviewers against `main`. Issue 11 of site-pages closes as moot. The pipeline branch merges to its `main` first, pushes, and deploys the API with `make deploy`. Then the site branch merges to `main` from the main checkout with `--no-ff` when its tree is clean and level with origin, and pushes. The two land back to back, because the live form sends the old shape until the site deploys, and the API accepts the new shape only. The gap is the minutes between the API deploy and the Pages deploy.

**Blocked by:** 08 (Local test by Brian)

**Status:** ready-for-agent

- [ ] Shots of the form with two sides and with four sides at three widths and both themes
- [ ] Shots of a three-side result at three widths and both themes
- [ ] No horizontal scroll and no clipped picker at any width
- [ ] The code review against `main` has no open finding
- [ ] Issue 11 of site-pages is closed as moot with a comment
- [ ] The pipeline `main` holds its merge, is pushed, and the API is deployed
- [ ] The site `main` holds its merge, is level with origin, and is pushed right after
