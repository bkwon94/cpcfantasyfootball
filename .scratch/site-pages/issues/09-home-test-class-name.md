# 09: The home page test reads a class name

**What to build:** `src/app/page.test.tsx` checks the red season number with `className` and `text-red`. The spec says a test never reads a class name. Find a check that a reader can see, or drop the assertion.

**Blocked by:** None

**Status:** triage

- [ ] Decide whether a reader-visible check exists for the red season number.
- [ ] Replace the `className` assertion with that check, or remove it.
- [ ] No test in `src/app/page.test.tsx` reads a class name.
- [ ] `pnpm typecheck` and `pnpm test` pass.
