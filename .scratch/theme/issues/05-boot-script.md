# 05: Paint in the stored theme before the first load

**What to build:** A reader with a stored dark choice sees a dark page on the first frame, with no flash of white. A small inline script in the root layout runs before the first paint, reads the stored choice through a guarded read, and adds the class on the root element when the choice is dark. The export ships no theme class, so a reader with no choice, with scripts off, or with blocked storage gets the light theme. The script lives in one place as a string so a test can run it.

**Blocked by:** 04 (the storage key and helper).

**Status:** ready-for-agent

- [ ] A stored dark choice paints dark before React runs. No flash of the light theme on load.
- [ ] No choice, blocked storage, or scripts off gives the light theme and no class.
- [ ] A test runs the script string against jsdom with a stored dark choice and reads the class. Tests cover no choice and blocked storage.
- [ ] The export check still passes.
- [ ] Typecheck, test, and build pass.
