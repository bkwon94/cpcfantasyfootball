# 11: Season index and retirement

**What to build:** The home page renders from the data folder, newest week first, at the same URL. The old HTML leaves the public folder. The Python publish writes JSON and headshots only. The Jinja templates, the stylesheet, and the script leave the pipeline repo. Every bookmark still works.

**Blocked by:** 10 Week route, bottom half.

**Status:** done

- [x] The home page lists every week in the data folder, newest first, with the same look as today.
- [x] The old home page HTML leaves the public folder. The week folders stay as the data folder. Every URL still serves.
- [x] Publish stops copying the week HTML, the home HTML, and the static folder, and no longer renders the index. It still copies the week folder with the JSON and the images. The home page reads `summary` from each `page.json`. Its test covers the new behavior. This pipeline change and the site change deploy together.
- [x] The Jinja templates, the stylesheet, the script, and the render of HTML leave the pipeline repo. The pipeline tests pass.
- [x] A dry run of the publish for the newest week lands live through Actions with no hand step.
- [x] The runbook in the pipeline repo describes the new publish.

## Comments

- Site half done on `site-react-weekly`. Pipeline half done on `publish-json`.
- The home page matches today's page pixel for pixel at 390. Screenshots: `.scratch/site-react/screenshots/11-home-react-390.png` and `11-home-today-390.png`.
- The box "A dry run of the publish" stays open. It needs both branches live. Status stays `ready-for-agent` for that reason.
- 2026-10-21, late: Brian deployed Phase 1, the API avatar, Phase 2, and the JSON-only publish in order. Deploy runs green. The week 6 dry run made no commit and the live `page.json` matches the pipeline. Everything live.
