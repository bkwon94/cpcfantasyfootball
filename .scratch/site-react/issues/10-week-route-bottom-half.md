# 10: Week route, bottom half

**What to build:** The rest of the week page ports: the trades with the recap cards, all matchups, the median game, the standings, and next week. With this ticket the React week page matches today's page section for section, in the same order.

**Blocked by:** 09 Week route, top half.

**Status:** done

- [x] The trades section renders the swap cards and the recap cards from the week 6 JSON.
- [x] All matchups, the median game, the standings, and next week render from the week 6 JSON.
- [x] The sections sit in today's order with today's chapter rules.
- [x] Tests render each section from the week 6 JSON and read what is on the screen.
- [x] A screenshot of the full page at 390 wide matches today's page. No horizontal scroll.
- [x] A week with no trades and a week with no median game render with the section left out, as today.

## Comments

- 2026-10-21: done. At 390 wide the full React page and today's page are pixel-identical in a diff of `10-week-full-react-390.png` against `10-week-full-today-390.png`, with the recap panels closed. With the first recap open, the two pages are also pixel-identical; see `10-week-recap-open-390.png`. `scrollWidth` is 390. No difference is left at rest. One difference is in motion only: today's panel opens at once and fades in the content; the React panel animates height through Framer Motion, an exception noted in `.impeccable.md`. Trades and median leave out their chapter inside the component, so a test renders the empty case.
