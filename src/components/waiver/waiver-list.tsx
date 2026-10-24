/**
 * The waiver page lists: the budget table in budget order and the best adds bucket in rank order.
 * The headshot swaps to the default on an image error, and an event handler needs a client component.
 */
"use client";

import { avatarSrc, Chapter, Label, Who } from "@/components/week/parts";
import { num } from "@/lib/format";
import { swapToDefault } from "@/lib/headshot";
import { cn } from "@/lib/utils";
import { BEST_ADDS, type BudgetRow, type WaiverBoard, type WaiverPlayer } from "@/lib/waiver-types";
import type { AvatarMap, Team } from "@/lib/week-types";

/* The file has no headshot path yet, so the row reads the Sleeper CDN by player id, as the pipeline does. */
function headshotSrc(playerId: string): string {
  return `https://sleepercdn.com/content/nfl/players/${playerId}.jpg`;
}

/* The most money first. Two equal budgets go in waiver order, since the first claim wins a tie bid. */
function byBudget(rows: BudgetRow[]): BudgetRow[] {
  return [...rows].sort((a, b) => b.budget_left - a.budget_left || a.waiver_order - b.waiver_order);
}

const BUDGET_GRID = "grid grid-cols-[1fr_var(--spacing-val-col)] items-center gap-sp-2 border-b border-rule text-row leading-tight tabular-nums";

/* Headshot, player, week projection, rest of season projection. The numbers align right on the last digit. */
const PLAYER_GRID =
  "grid grid-cols-[var(--spacing-avatar)_1fr_var(--spacing-val-col)_var(--spacing-val-col)] items-center gap-sp-2 border-b border-rule text-row leading-tight tabular-nums";

function Budgets({ budgets, teams, avatars }: { budgets: BudgetRow[]; teams: Record<string, Team>; avatars: AvatarMap }) {
  return (
    <Chapter>
      <Label>Budgets</Label>
      <ol aria-label="Budgets" className="m-0 list-none p-0">
        {byBudget(budgets).map((row) => (
          <li key={row.roster_id} className={cn(BUDGET_GRID, "py-sp-1")}>
            <Who src={avatarSrc(avatars, row.roster_id)} name={teams[String(row.roster_id)]?.name ?? `Roster ${row.roster_id}`} />
            <span className="text-right">{`$${row.budget_left}`}</span>
          </li>
        ))}
      </ol>
    </Chapter>
  );
}

function BestAdds({ players }: { players: WaiverPlayer[] }) {
  return (
    <Chapter>
      <Label>Best adds</Label>
      <div
        aria-hidden
        // cn drops the leading of the grid when a new text size follows, so the header sets it again.
        className={cn(PLAYER_GRID, "pt-0 pb-sp-2 text-label leading-tight tracking-caps text-mute uppercase")}
      >
        <span />
        <span>Player</span>
        <span className="text-right">Week</span>
        <span className="text-right">ROS</span>
      </div>
      <ol aria-label="Best adds" className="m-0 list-none p-0">
        {players.map((player) => (
          <li key={player.player_id} className={cn(PLAYER_GRID, "py-sp-1")}>
            {/* The player name sits next to the headshot, so the image is decorative. */}
            <img
              src={headshotSrc(player.player_id)}
              alt=""
              loading="lazy"
              onError={swapToDefault}
              className="size-avatar flex-none rounded-full bg-gry object-cover object-top"
            />
            <span className="flex min-w-0 flex-col">
              <b className="font-extrabold">{player.name}</b>
              <span className="text-meta text-mute">{`${player.position} · ${player.team}`}</span>
            </span>
            <span className="text-right">{num(player.week_projection)}</span>
            <span className="text-right">{num(player.ros_projection)}</span>
          </li>
        ))}
      </ol>
    </Chapter>
  );
}

export function WaiverList({
  board,
  teams,
  avatars,
}: {
  board: WaiverBoard;
  teams: Record<string, Team>;
  avatars: AvatarMap;
}) {
  return (
    <>
      <Budgets budgets={board.budgets} teams={teams} avatars={avatars} />
      <BestAdds players={board.buckets[BEST_ADDS] ?? []} />
    </>
  );
}
