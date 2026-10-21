# 12: Weekly page motion

**What to build:** The week page and the home page feel more modern. The hero lands with motion. Sections and cards reveal as the reader scrolls. The route transitions in. A reader with reduced motion on sees today's static page.

**Blocked by:** 10 Week route, bottom half.

**Status:** done

- [x] The game changer hero animates in on load.
- [x] Sections and cards reveal on scroll, once, with no layout shift.
- [x] The week route and the home page transition in.
- [x] Every animation is off under the reduced-motion media query. A check with reduced motion on shows the same content with no motion.
- [x] Only transform and opacity animate.
- [x] Every section is checked at 390 wide with motion on and off. No horizontal scroll.

## Comments

- Done: one `Reveal` client leaf in `src/components/reveal.tsx` animates the hero, the chapters, the cards, the rows, and the route enter of both pages. With reduced motion, a 390 wide check in the browser shows every section at rest at once, and the rest state matches `10-week-full-today-390.png` pixel for pixel.
