# 08: Page JSON from the Python build

**What to build:** The Python build writes one JSON file per week next to the HTML: the render context the templates read today, with a schema version. The publish copies the JSON and the headshots into this repo's public data folder. A command writes the JSON for a past week from its saved data with no writer call, so week 6 and earlier get a file. The React week page in ticket 09 reads these files.

**Blocked by:** 02 Deploy from Actions.

**Status:** done

- [x] The build writes a page JSON per week with a schema version and the full render context.
- [x] A command writes the page JSON for a past week from saved data and makes no writer call.
- [x] Publish copies the page JSON and the headshots into the public data folder. It still copies the HTML until ticket 11.
- [x] A test checks the JSON against the week 6 context and the schema version.
- [x] Week 6 JSON is in this repo's public data folder and is the fixture for tickets 09 and 10.
- [x] The pipeline repo's docs name the JSON path and the command.

## Comments

- 2026-10-21: done on the pipeline branch `page-json`, commits up to `a175c6e`, 542 tests. The week folder is the data folder; see ticket 09 comments. Week 6 JSON copied into `public/2026/week-06/page.json` here. The merge of `page-json` into the pipeline main is Brian's.
