/**
 * The standings: the dark chapter with one row per team, the playoff cut line after the sixth row, and the note.
 * Points always show two decimals, so the column lines up in tabular figures.
 */
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { AvatarMap, TableRow } from "@/lib/week-types";
import { avatarSrc, Blurb, Chapter, Label, Who } from "./parts";

/* Six teams make the playoffs, so the dashed cut line sits under the sixth row. */
const PLAYOFF_SPOTS = 6;

const GRID =
  "grid grid-cols-[var(--spacing-st-rank)_1fr_var(--spacing-st-wl)_var(--spacing-st-pts)] items-center gap-sp-2 border-b border-rule-dark text-row leading-tight tabular-nums";

/* The W-L and points columns align right, so the numbers line up on the last digit. */
function Line({ cells, className }: { cells: [ReactNode, ReactNode, ReactNode, ReactNode]; className?: string }) {
  const [rank, team, record, points] = cells;
  return (
    <div className={cn(GRID, className)}>
      <span>{rank}</span>
      <span>{team}</span>
      <span className="text-right">{record}</span>
      <span className="text-right">{points}</span>
    </div>
  );
}

export function Standings({ table, avatars }: { table: TableRow[]; avatars: AvatarMap }) {
  return (
    <Chapter dark>
      <Label dark>Standings</Label>
      <Line
        cells={["#", "Team", "W-L", "Pts"]}
        className="pt-0 pb-sp-2 text-label tracking-caps text-on-dark-muted uppercase"
      />
      {table.map((row, i) => (
        <Fragment key={row.team.roster_id}>
          <Line
            className="py-sp-1"
            cells={[
              row.standing.rank,
              <Who key="team" src={avatarSrc(avatars, row.team.roster_id)} name={row.team.name} />,
              `${row.standing.wins}-${row.standing.losses}`,
              row.standing.points_for.toFixed(2),
            ]}
          />
          {i + 1 === PLAYOFF_SPOTS && <div className={cn(GRID, "border-b-2 border-dashed border-red p-0")} />}
        </Fragment>
      ))}
      <Blurb dark className="mt-sp-3 text-meta">
        Records include the weekly median game: every team plays its opponent and the league median each week.
      </Blurb>
    </Chapter>
  );
}
