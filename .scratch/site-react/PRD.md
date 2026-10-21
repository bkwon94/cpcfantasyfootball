# Site in React: the app shell, the analyzer page, then the weekly page

Status: ready-for-agent
Date: 2026-10-21
Depends on: the site API, `cornerstone-fantasy-sleeper-weekly-report/.scratch/site-api/PRD.md`
Related: the trade recap, `cornerstone-fantasy-sleeper-weekly-report/.scratch/trade-recap/PRD.md`

## Problem Statement

The site is static HTML that a Python build renders from templates. It cannot hold a form that
calls an API, so the trade analyzer has no home. Brian wants the whole site in React with shadcn,
with the same look and feel, more modern, with motion. The weekly page and the season index must
keep their URLs, because the league has them bookmarked and the Tuesday job publishes to them.

## Solution

This repo becomes the source of a Next.js app with static export, deployed to GitHub Pages by
GitHub Actions. The pipeline repo keeps the Python build and the site API. Phase 1 ships the app
shell, the design tokens ported from the current stylesheet, and the analyzer page, with the
current week pages served unchanged beside it. Phase 2 ports the weekly page and the season index
to React, reads one JSON file per week that the Python build writes, and adds the motion work.
The Jinja templates then retire.

## User Stories

1. As a manager, I want an analyzer page on the site, so that I grade a trade offer from my phone.
2. As a manager, I want to pick my team and the other team from the league's list with avatars,
   so that I never type a name.
3. As a manager, I want each roster's players as rows with headshots and a tick box, so that I
   pick what each side gives in a few taps.
4. As a manager, I want the submit button disabled until each side gives at least one player, so
   that I never send an empty side.
5. As a manager, I want to type the league passphrase once, so that the page remembers it on my
   phone.
6. As a manager, I want a loading state with motion while the grade runs, so that a 20-second wait
   feels alive.
7. As a manager, I want the two grades revealed as cards with the letters animated in, so that
   the result lands with some drama.
8. As a manager, I want the breakdown per side as a list of adjusters with a direction mark and
   a one-line reason, so that I see what moved the letter.
9. As a manager, I want the analysis paragraph per side and the verdict banner for my side, so
   that I read what to do.
10. As a manager, I want the data as-of line under the result, so that I know how fresh it is.
11. As a manager, I want a plain error state for a wrong passphrase, a rate limit, or a timeout,
    so that I know what to fix.
12. As a manager, I want the page to work at 390 wide with no sideways scroll, so that it fits my
    phone like the weekly page does.
13. As a manager, I want motion to respect my reduced-motion setting, so that the page never makes
    me sick.
14. As a reader, I want every week page and the season index at the same URLs, so that my
    bookmarks and the league chat links keep working.
15. As a reader, I want the weekly page to look the same as today, with the same sections, the same
    cards, and the same hero, so that the port changes nothing I rely on.
16. As a reader, I want the weekly page to feel more modern, with transitions and card reveals, so
    that the port is a step up.
17. As the commissioner, I want a push to the main branch to build and deploy the site, so that
    no hand step stands between a publish and the live page.
18. As the commissioner, I want the Python publish to keep working through phase 1, so that the
    week 7 job on 2026-10-27 publishes as it does today.
19. As the commissioner, I want the Python build to write one JSON file per week in phase 2, so
    that the React page renders from data and the templates retire.
20. As the commissioner, I want the site to stay on GitHub Pages, so that hosting costs nothing.
21. As the maintainer, I want the design tokens in one place, so that the look is one set of
    variables and not a scatter of hex codes.
22. As the maintainer, I want shadcn components for the form, the cards, and the banners, so that
    the pieces are standard and accessible.
23. As the maintainer, I want the analyzer page tested against the API's fixture response, so
    that the page and the API agree on the contract.
24. As the maintainer, I want type checks and the build to run in Actions before a deploy, so
    that a broken page never ships.

## Implementation Decisions

### The app

- Next.js with the App Router, TypeScript, static export, trailing slashes on so the URLs match
  the current folders. Tailwind, shadcn, Framer Motion, pnpm, Node 22.
- Every route the site has today exists in the app or is served as a static file beside it. The
  CNAME stays.
- The design tokens are the custom properties from the current stylesheet, ported into the
  Tailwind theme and the shadcn variables: the backgrounds, the ink, the card grey, the red glow,
  the type scale, and the spacing. The logo and the static images move into the public folder.
- Motion: page transitions, section and card reveals on scroll, the grade letter reveal, and the
  hero. Every animation is off under the reduced-motion media query. The design skills for the
  work are the Emil, Apple, and animate skills.
- The site is checked at 390 wide with the browser tool on every page change. No horizontal
  scroll.

### Deploy

- A GitHub Actions workflow on push to the main branch installs, type checks, builds the export,
  and deploys it to Pages. Pages switches from the branch source to the Actions source.
- The site API's URL and the Pages base are build-time config.

### Phase 1: the analyzer

- The Python publish keeps copying the built week pages, now into the public folder, so the
  export serves them at their URLs unchanged. The index page from the Python build is served the
  same way until phase 2.
- The analyzer page at `/analyze/`. Form: my team, the other team, the two player lists, submit.
  The team list and the players come from the API's teams route, fetched on page load.
- The passphrase is asked once in a dialog and kept in local storage. The API gets it in a header.
  A 401 clears it and asks again.
- The result renders the API document as a ledger, the layout Brian picked from the prototype
  in `.scratch/site-react/prototype/`: the trade swap card, then one table with the adjusters
  down the left and one column per side, the final letter per side in the header row, then the
  analysis paragraph per side, then the verdict callout for the asker with a red left rule, then
  the as-of line. The page shows the final letter only. It does not show `start_letter` or
  `final_reason`. A "suggested counters" slot sits under the verdict until the API returns
  counters. A 429 shows the retry time. A timeout past 60 seconds shows a retry button.
- The API's fixture response document is copied into this repo and is the one input of the
  result component's tests.

### Phase 2: the weekly page and the index

- The Python build writes one page JSON per week: the render context the templates read today,
  with a schema version. Publish copies it into the public data folder with the headshots, and
  stops copying HTML.
- The week page is a static route per season and week, generated at build from the data folder.
  Every section of today's page ports: the masthead, the matchup of the week, the game changer
  hero, the awards, the position leaders, the trades with the recap cards, and the rest of the
  sections in their order. The season index ports the same way.
- The old static week folders leave the public folder once every week renders from JSON. Week 6
  and earlier re-render from their saved data, so the Python build gains a way to write page JSON
  for a past week with no writer call.
- The Jinja templates, the stylesheet, and the script leave the pipeline repo once phase 2 is
  live.

## Testing Decisions

- A good test renders a component with a fixture document and asserts the text and the roles on
  the screen. It never asserts class names or animation internals.
- Vitest with Testing Library. The result component renders the API fixture document and shows
  both letters, every adjuster line, both paragraphs, the verdict, and the as-of line. The form
  disables submit until both sides give a player. The passphrase dialog shows on first load and
  not after.
- Phase 2: the week page renders a saved week's page JSON and shows each section's heading and
  the trade recap cards. The week 6 JSON is the fixture.
- Type checks and the production build run in Actions on every push.
- Visual checks are screenshots at 390 wide with the browser tool, read by a person.

## Out of Scope

- A new look. The tokens and the card language stay. A redesign is its own round with prototypes.
- The live page, news, and any route past the analyzer and the weekly pages.
- Vercel or any host other than Pages.
- Accounts. One shared passphrase.
- End-to-end tests against the live API.

## Further Notes

- The pipeline repo's `publish` command is the only writer of this repo besides Actions. Phase 1
  changes its target folder; phase 2 changes what it writes.
- The site API is a separate deploy on Fly. Its PRD holds the contract and the fixture.

## Contract

- The fixture is `.scratch/site-react/fixtures/analyze-response.json`. It is byte-identical to `tests/fixtures/api/analyze-response.json` in the source repo.
- Each adjuster has a `lean`. Each side has a `final_reason`. The verdict has `differs`.
- `GET /teams` needs the `season` query, for example `/teams?season=2026`.
- Every route except `/health` needs the `X-League-Passphrase` header.
