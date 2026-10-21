# 09: Week route, top half

**What to build:** A static week route per season and week renders from the data folder. The top half of the page ports: the masthead with the week line, the matchup of the week, the game changer hero with the cutout and the red glow, the awards, and the position leaders. Each section matches today's at 390 wide.

**Blocked by:** 03 Design tokens and masthead, 08 Page JSON from the Python build.

**Status:** ready-for-agent

- [ ] The route exists for every week JSON in the data folder at build time, at the same path as today.
- [ ] The masthead shows the week number and the dates.
- [ ] The matchup of the week, the game changer hero, the awards, and the position leaders render from the week 6 JSON.
- [ ] Each section is a component that takes its slice of the JSON.
- [ ] Tests render each section from the week 6 JSON and read what is on the screen.
- [ ] A screenshot of each section at 390 wide matches today's section. No horizontal scroll.
