# 05: Select pickers for a two-side trade

**Repo:** `cpcfantasyfootball`

**What to build:** A reader picks two teams and their players from compact pickers and grades the trade. Each side is one group with a heading. The team picker is the shadcn Select on Base UI, added with the shadcn CLI, with the avatar and the team name in each row and in the trigger. The first side is "Your Team" and the asker; the second is "Team Two". A team picked on one side is absent from the other side's list. The player picker is the same Select with `multiple`, labeled "<Team> Gives", and shows once the side has a team. Its trigger reads "Pick Players" when empty and the count when not. Each row shows the headshot, the name, the position, and the NFL team. The picked players render as rows under the trigger with a remove control. The form state is a list of sides, each with picks of `{ playerId, to }`, and the body posts `to` for each player. A new team clears the side's picks and the result. The pickers lock while a grade runs. `TeamPicker`, `PlayerList`, and the `TeamPicker` test go. Both themes paint every picker and row with a fill and readable text. Title case for every label.

**Blocked by:** 01 (A given player names its destination, two sides)

**Status:** ready-for-agent

- [ ] The shadcn Select on Base UI is in the ui folder and no other new shadcn part is
- [ ] The team picker shows each team with its avatar, and a team picked on one side is absent from the other, tested at the form seam
- [ ] The player picker shows the team's players and the picked ones render as rows with a remove control, tested at the form seam
- [ ] The grade button stays off until each side gives a player, tested at the form seam
- [ ] The posted body sends the asker first and `to` on each player, tested at the form seam
- [ ] A new team clears the side's picks and the result, tested at the form seam
- [ ] A finder card still opens its trade into the form, tested at the form seam
- [ ] The old picker and list components and their test are gone
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm build`, and `pnpm check:export` pass
