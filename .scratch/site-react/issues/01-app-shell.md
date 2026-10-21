# 01: App shell

**What to build:** This repo becomes the source of a Next.js app with static export. A local build serves every URL the site has today, unchanged: the home page, every week page, the avatars, the headshots, and the static files. Nothing visible changes for a reader.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Next.js with the App Router, TypeScript, static export, trailing slashes on. Tailwind, shadcn, pnpm, Node 22.
- [ ] The current home page, the week folders, and the static folder move into the public folder. A local export serves `/` and `/2026/week-06/` byte-identical to today.
- [ ] The CNAME file survives the export.
- [ ] The API URL and the Pages base are build-time config with a documented default.
- [ ] The PRD, the fixtures, the prototype, and the tracker doc are committed. A `CLAUDE.md` names Claude Truckasaurus Tina and Brian Homie B-Rex.
- [ ] A README section says how to install, run, build, and export.
