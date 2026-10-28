# 08: Local test by Brian

**Repo:** both

**What to build:** Brian runs the whole feature on his machine against the local API before anything merges. Two make targets make that one command per repo. In the pipeline repo, `make api` already runs the API on port 8080 with the passphrase `localtest`; it stays. The `make analyze` target takes any count of `SIDE` values in the new shape, with the destination per player, so a three-side trade grades from the command line too. In the site repo a new `make dev-local` target runs the dev server with the API URL set to the local API, so the form hot-reloads against real grades. The target comments say the order: start the API in the pipeline worktree, then the dev server here, then store the passphrase `localtest` in the form. Brian enters a two-team trade and a three-team trade, grades both with the live Claude call, and reads the upside factor. This ticket closes only when Brian says the feature is good.

**Blocked by:** 04 (The upside adjuster), 06 (Add a third and a fourth side), 07 (The swap card with three sides)

**Status:** ready-for-agent

- [x] `make analyze` in the pipeline repo takes two to four `SIDE` values with a destination per player and grades without the Claude call
- [x] `make dev-local` in the site repo runs the dev server against the local API on port 8080
- [x] `make help` lists both targets with one-line help
- [ ] Brian grades a two-team trade and a three-team trade in the local form and sees the result
- [ ] Brian says the feature is good, in a comment on this ticket

## Comments

- 2026-10-27, Truckasaurus Tina: Both make targets are in. A three-team ring trade graded from the CLI on live rosters with the upside factor. The graded run in the form with the Claude call is Brian's step.
