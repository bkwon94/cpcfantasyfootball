# 03: Design tokens and masthead

**What to build:** The look of the site lives in one set of tokens, and the first React route wears it. An empty analyzer route at `/analyze/` renders the masthead, identical to today's masthead at 390 wide. A reader cannot tell the React masthead from the Jinja one.

**Blocked by:** 01 App shell.

**Status:** ready-for-agent

- [ ] Every custom property in the current stylesheet is a token in the Tailwind theme and the shadcn variables: the backgrounds, the ink, the card grey, the red glow, the type scale, the spacing, the radii, the press easing.
- [ ] No hex color or pixel size outside the tokens in any component.
- [ ] The logo and the default avatar and headshot images serve from the public folder.
- [ ] A shared masthead component with the brand, the subtitle, and the week line slot.
- [ ] `/analyze/` renders the masthead. A screenshot at 390 wide matches today's masthead.
- [ ] No horizontal scroll at 390 wide.
