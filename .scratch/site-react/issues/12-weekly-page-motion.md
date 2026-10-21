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
- Fix pass: each element sits inside one reveal only. The route enter is gone. The masthead and the top story show at once. The hero plays on mount, and the glow fades with no rise. Awards, Trades, and All Matchups stagger the label and the cards. Every other chapter below the hero reveals as a unit through `Chapter reveal`. The home rows stagger with no outer wrap.
- No-script result: a `noscript` style shows every reveal box at rest when scripts are off. A CSS safety rule shows every reveal box after `--delay-safety` (1.5s) if the script never hydrates. A copy of `out/` with every `_next/static` JS file removed shows all 26 `[data-reveal]` boxes at opacity 1 after 3 seconds, with `data-hydrated` absent. With the whole `_next/static` folder removed, the stylesheet goes too, so no CSS rule can apply and the boxes stay at opacity 0.
- The rest capture `12-week-rest-390.png` and the reduced-motion capture `12-week-off-390.png` both match `10-week-full-today-390.png` pixel for pixel.
