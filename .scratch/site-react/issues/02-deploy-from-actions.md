# 02: Deploy from Actions

**What to build:** A push to the main branch builds the site and deploys it to GitHub Pages. No hand step stands between a publish and the live page. The Python publish keeps working: it copies the built week into the public folder, commits, and pushes, and the week shows up live. The site looks the same before and after the cut.

**Blocked by:** 01 App shell.

**Status:** done

- [x] A workflow on push to main installs, type checks, builds the export, and deploys it to Pages.
- [x] A failed type check or build stops the deploy.
- [x] Pages uses the Actions source. The CNAME and the custom domain stay.
- [x] The Python publish in the pipeline repo copies the week and the static files into the public folder of this repo. Its test covers the new target.
- [x] After the cut, `https://cpcfantasy.com/` and `https://cpcfantasy.com/2026/week-06/` serve the same content as before.
- [x] A dry run of the publish for week 6 lands live through Actions with no hand step.

## Comments

- 2026-10-21: Pages switched to the Actions source and the branch pushed to main by Brian. Run 39658647426 green. Live home, week 6, and stylesheet byte-identical to `public/`. Publish code path checked against the live checkout with push off: no byte changed.
