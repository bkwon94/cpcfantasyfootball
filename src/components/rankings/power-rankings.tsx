/**
 * The power rankings table: the dark chapter with one row per team for one week, in rank order.
 * Each row shows the rank, the movement, the team, the record, and the four component ranks. Every number is a rank, never a score.
 */
import type { ReactNode } from "react";
import { Reveal } from "@/components/reveal";
import { avatarSrc, Blurb, Chapter, Label, Who } from "@/components/week/parts";
import { stagger } from "@/lib/motion";
import type { Components, RankingsWeek } from "@/lib/rankings-types";
import { cn } from "@/lib/utils";
import type { AvatarMap } from "@/lib/week-types";

/* The order and the column names of the four component ranks. */
const COMPONENTS: { key: keyof Components; name: string }[] = [
  { key: "standing", name: "Stand" },
  { key: "form", name: "Form" },
  { key: "schedule_played", name: "Sched" },
  { key: "scoring", name: "Pts" },
];

/* The same grid style as the standings. On a phone the four component columns do not fit beside the team,
   so the row keeps four columns and the component ranks fold into a second line. From the page width up, they join the row. */
const GRID =
  "grid grid-cols-[var(--spacing-standings-rank)_var(--spacing-rankings-col)_1fr_var(--spacing-standings-record)] page:grid-cols-[var(--spacing-standings-rank)_var(--spacing-rankings-col)_1fr_var(--spacing-standings-record)_repeat(4,var(--spacing-rankings-col))] items-center gap-x-sp-2 border-b border-rule-dark text-row leading-tight tabular-nums";

/* The arrow carries the direction in its shape, so the color is never the only sign. The count stays in the text color.
   The arrow colors are for the black card, the only surface of the table. No movement, and no last week in week 1, show a dash. */
export function Movement({ movement }: { movement: number | null }) {
  if (movement === null || movement === 0) {
    return (
      <span>
        <span aria-hidden>–</span>
        <span className="sr-only">{movement === null ? "No last week" : "No change"}</span>
      </span>
    );
  }
  const up = movement > 0;
  return (
    <span className="inline-flex items-center gap-sp-0">
      <span aria-hidden className={up ? "text-move-up" : "text-move-down"}>
        {up ? "▲" : "▼"}
      </span>
      <span className="sr-only">{up ? "Up" : "Down"}</span>
      {Math.abs(movement)}
    </span>
  );
}

/* The component cells. From the page width up, the wrapper drops out of the layout, so each cell takes a grid column.
   On a phone the wrapper is the second line under the team and the record, and each cell names its column. */
function ComponentCells({ cells }: { cells: { name: string; value: ReactNode }[] }) {
  return (
    <span className="col-span-2 col-start-3 grid grid-cols-4 gap-x-sp-2 pt-sp-1 page:contents">
      {cells.map(({ name, value }) => (
        <span key={name} className="text-right">
          <span className="mr-sp-1 text-label tracking-caps text-on-dark-muted uppercase page:hidden">{name}</span>
          {value}
        </span>
      ))}
    </span>
  );
}

export function PowerRankings({ week, avatars }: { week: RankingsWeek; avatars: AvatarMap }) {
  return (
    <Chapter dark>
      {/* The label and the header reveal first, then the rows stagger in after them, as the trades chapter does. */}
      <Reveal delay={stagger(0)}>
        <Label dark>Power rankings</Label>
        {/* The header names the component columns only from the page width up. On a phone each folded cell names itself. */}
        <div
          aria-hidden
          // cn drops the leading of the grid when a new text size follows, so the header sets it again.
          className={cn(GRID, "pt-0 pb-sp-2 text-label leading-tight tracking-caps text-on-dark-muted uppercase")}
        >
          <span>#</span>
          <span>+/-</span>
          <span>Team</span>
          <span className="text-right">W-L</span>
          {COMPONENTS.map(({ name }) => (
            <span key={name} className="hidden text-right page:block">
              {name}
            </span>
          ))}
        </div>
      </Reveal>
      <ol className="m-0 list-none p-0">
        {week.rows.map((row, index) => (
          // Each row reveals once with the capped stagger, so a row low in the list never shows late.
          <li key={row.roster_id}>
            <Reveal delay={stagger(index + 1)}>
              <div className={cn(GRID, "py-sp-1")}>
                <span>{row.rank}</span>
                <Movement movement={row.movement} />
                <Who src={avatarSrc(avatars, row.roster_id)} name={row.name} />
                <span className="text-right">{`${row.wins}-${row.losses}`}</span>
                <ComponentCells cells={COMPONENTS.map(({ key, name }) => ({ name, value: row.components[key] }))} />
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
      <Blurb dark className="mt-sp-3 text-meta">
        Each column ranks the team from 1 to 12: standing, recent form, schedule played, and scoring. Pts ranks scoring: points for and the all-play record.
      </Blurb>
    </Chapter>
  );
}
