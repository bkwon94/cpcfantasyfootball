# 11: Season index and retirement

**What to build:** The home page renders from the data folder, newest week first, at the same URL. The old HTML leaves the public folder. The Python publish writes JSON and headshots only. The Jinja templates, the stylesheet, and the script leave the pipeline repo. Every bookmark still works.

**Blocked by:** 10 Week route, bottom half.

**Status:** ready-for-agent

- [ ] The home page lists every week in the data folder, newest first, with the same look as today.
- [ ] The old week folders and the old home page leave the public folder. Every URL still serves.
- [ ] Publish stops copying HTML and the static folder. Its test covers the new behavior.
- [ ] The Jinja templates, the stylesheet, the script, and the render of HTML leave the pipeline repo. The pipeline tests pass.
- [ ] A dry run of the publish for the newest week lands live through Actions with no hand step.
- [ ] The runbook in the pipeline repo describes the new publish.
