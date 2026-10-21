# 07: Analyzer motion and phone check

**What to build:** The analyzer feels alive. The loading state moves while the grade runs. The two letters reveal with some drama when the ledger lands. The route transitions in. A manager with reduced motion on sees none of it and loses nothing.

**Blocked by:** 06 Trade form and submit.

**Status:** ready-for-agent

- [ ] A loading animation runs during the analyze call.
- [ ] The final letters animate in when the ledger mounts, the asker's side first.
- [ ] The route transitions in on first load.
- [ ] Every animation is off under the reduced-motion media query. A test or a manual check with reduced motion on shows the same content with no motion.
- [ ] Only transform and opacity animate.
- [ ] Every state of the page is checked at 390 wide: dialog, pickers, form, loading, ledger, each error. No horizontal scroll in any state.
- [ ] After a team is picked, its picker collapses to the chosen row with a Change control, so the form fits in about half the height.
- [ ] A walk-through against the local API with an Anthropic key shows the live ledger at 390 wide and the grade time under 30 seconds.
