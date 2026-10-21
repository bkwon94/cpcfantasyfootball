# 09: Week route, top half

**What to build:** A static week route per season and week renders from the data folder. The top half of the page ports: the masthead with the week line, the matchup of the week, the game changer hero with the cutout and the red glow, the awards, and the position leaders. Each section matches today's at 390 wide.

**Blocked by:** 03 Design tokens and masthead, 08 Page JSON from the Python build.

**Status:** done

- [x] The route exists for every week JSON in the data folder at build time, at the same path as today.
- [x] The masthead shows the week number and the dates.
- [x] The matchup of the week, the game changer hero, the awards, and the position leaders render from the week 6 JSON.
- [x] Each section is a component that takes its slice of the JSON.
- [x] Tests render each section from the week 6 JSON and read what is on the screen.
- [x] A screenshot of each section at 390 wide matches today's section. No horizontal scroll.

## Comments

- 2026-10-21: the week folder is the data folder. Read `public/<season>/week-NN/page.json`. Image paths in the JSON are relative to the week folder. The JSON turns int keys into strings, so look up `teams["4"]` and `avatars["4"]`. Numbers are raw; port the `num` filter (shortest two-decimal form: 106.8, 21), the `gap` filter (`+` or `−` prefix), and `short_name` (first initial, dot, rest). The route and the old HTML share one path, so this branch removes `public/2026/week-06/index.html`; the publish change that stops the HTML copy is ticket 11.
- 2026-10-21: done. At 390 wide the React top half and today's top half are pixel-identical in a diff of `09-week-top-react-390.png` against `09-week-top-today-390.png`. At 800 wide every section height matches. No difference is left. The week route loads no `static/app.js`; that script drives the recap buttons, which ticket 10 ports. Images use the JSON lookup fallback only: a server component cannot set an `onError` swap.
