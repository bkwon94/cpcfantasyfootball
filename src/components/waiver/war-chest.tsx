/**
 * The War chest waiver page: the budget ring, the bucket tabs, the drift field, the sheet, and the list of the open bucket.
 * The open bucket and the sheet player are state, and a tap on a headshot or a row fills the sheet, so this is a client component.
 */
"use client";

import { useEffect, useState } from "react";
import { avatarSrc, Chapter, Label } from "@/components/week/parts";
import { sleeperHeadshot, swapToDefault } from "@/lib/headshot";
import { cn } from "@/lib/utils";
import { BEST_ADDS, BUCKETS, type BudgetRow, type WaiverBoard, type WaiverPlayer } from "@/lib/waiver-types";
import type { AvatarMap, Team } from "@/lib/week-types";
import { DriftField, priceText } from "./drift-field";
import { metaLine, PlayerSheet, teamName } from "./player-sheet";

/* The most money first. Two equal budgets go in waiver order, since the first claim wins a tie bid. */
function byBudget(rows: BudgetRow[]): BudgetRow[] {
  return [...rows].sort((a, b) => b.budget_left - a.budget_left || a.waiver_order - b.waiver_order);
}

/* The twelve budgets as a row of avatars over thin bars. The largest budget fills its bar, so the ring needs no league cap.
   The team name is for a screen reader only: twelve names do not fit in a row at 390, and the avatar carries the team for the eye. */
function BudgetRing({ budgets, teams, avatars }: { budgets: BudgetRow[]; teams: Record<string, Team>; avatars: AvatarMap }) {
  const rows = byBudget(budgets);
  const top = Math.max(1, ...rows.map((row) => row.budget_left));
  return (
    <ol aria-label="Budgets" className="m-0 grid list-none grid-cols-12 p-0">
      {rows.map((row) => (
        <li key={row.roster_id} className="flex flex-col items-center">
          <img
            src={avatarSrc(avatars, row.roster_id)}
            alt=""
            className="size-ring-avatar rounded-full border border-rule-dark bg-gry object-cover"
          />
          {/* The bar is a picture of the number under it, so it is hidden from a screen reader. */}
          <span aria-hidden className="relative mt-sp-1 block h-ring-bar w-ring-bar-w overflow-hidden rounded-sm bg-rule-dark">
            <span className="absolute inset-x-0 bottom-0 rounded-sm bg-bar-off" style={{ height: `${(row.budget_left / top) * 100}%` }} />
          </span>
          <span className="mt-sp-0 text-label text-on-dark-muted tabular-nums">{`$${row.budget_left}`}</span>
          <span className="sr-only">{teamName(teams, row.roster_id)}</span>
        </li>
      ))}
    </ol>
  );
}

/* Rank, headshot, player, and price. A drop has no price, so his row names the roster that holds him and his first fact. */
const ROW_GRID =
  "grid grid-cols-[var(--spacing-standings-rank)_var(--spacing-avatar)_1fr_var(--spacing-val-col)] items-center gap-sp-2 text-row leading-tight tabular-nums";

function BucketList({
  name,
  players,
  openId,
  teams,
  onOpen,
}: {
  name: string;
  players: WaiverPlayer[];
  openId: string | null;
  teams: Record<string, Team>;
  onOpen: (player: WaiverPlayer) => void;
}) {
  return (
    <ol aria-label={name} className="m-0 mt-sp-4 list-none p-0">
      {players.map((player, index) => {
        const open = player.player_id === openId;
        return (
          <li key={player.player_id} className="border-b border-rule-dark">
            {/* The whole row is the button, so the touch target is the row. 44px is the smallest comfortable touch target. */}
            <button
              type="button"
              aria-pressed={open}
              onClick={() => onOpen(player)}
              className={cn(
                ROW_GRID,
                "press min-h-touch w-full cursor-pointer border-0 bg-transparent px-0 py-sp-1 text-left text-inherit [-webkit-tap-highlight-color:transparent]",
              )}
            >
              <span className={open ? "font-bold text-red-lt" : "text-on-dark-muted"}>{index + 1}</span>
              {/* The player name sits next to the headshot, so the image is decorative. */}
              <img
                src={sleeperHeadshot(player.player_id)}
                alt=""
                loading="lazy"
                onError={swapToDefault}
                className="size-avatar rounded-full bg-ink-2 object-cover object-top"
              />
              <span className="flex min-w-0 flex-col">
                <b className="font-extrabold">{player.name}</b>
                <span className="text-meta text-on-dark-muted">
                  {player.roster_id != null ? `${metaLine(player)} · On ${teamName(teams, player.roster_id)}` : metaLine(player)}
                </span>
                {player.roster_id != null && player.facts?.[0] && (
                  <span className="mt-sp-0 text-meta leading-body text-on-dark-2">{player.facts[0].text}</span>
                )}
              </span>
              <span className="text-right font-bold">{priceText(player)}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function WarChest({ board, teams, avatars }: { board: WaiverBoard; teams: Record<string, Team>; avatars: AvatarMap }) {
  // Only the buckets in the file get a tab, so an older file shows no empty tabs.
  const tabs = BUCKETS.filter(({ key }) => board.buckets[key]);
  const [bucket, setBucket] = useState<string>(BEST_ADDS);
  // The sheet holds the player and not an index, so it keeps him when the tab changes to a bucket without him.
  const [open, setOpen] = useState<WaiverPlayer | null>(board.buckets[BEST_ADDS]?.[0] ?? null);
  const players = board.buckets[bucket] ?? [];
  const name = tabs.find(({ key }) => key === bucket)?.name ?? bucket;
  // The attribute turns off the CSS safety rule in globals.css, as Reveal does, so Framer Motion owns the rise after hydration.
  useEffect(() => {
    document.documentElement.setAttribute("data-hydrated", "");
  }, []);
  return (
    <Chapter dark>
      <Label dark>War chest</Label>
      <BudgetRing budgets={board.budgets} teams={teams} avatars={avatars} />
      <div role="group" aria-label="Buckets" className="mt-sp-4 flex gap-sp-1 overflow-x-auto pb-sp-1">
        {tabs.map((tab) => {
          const on = tab.key === bucket;
          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={on}
              onClick={() => setBucket(tab.key)}
              className={cn(
                "press flex flex-none cursor-pointer items-center gap-sp-1 rounded-full border-0 px-sp-3 py-sp-1 text-label font-bold tracking-caps whitespace-nowrap uppercase",
                on ? "bg-red text-on-dark" : "bg-chip-dark text-on-dark-2",
              )}
            >
              {tab.name}
              <span className={cn("tabular-nums", on ? "text-on-dark" : "text-on-dark-muted")}>{board.buckets[tab.key].length}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-sp-3">
        <DriftField bucket={bucket} players={players} openId={open?.player_id ?? null} onOpen={setOpen} />
      </div>
      <PlayerSheet player={open} teams={teams} expertsMissing={board.experts_missing === true} />
      <BucketList name={name} players={players} openId={open?.player_id ?? null} teams={teams} onOpen={setOpen} />
    </Chapter>
  );
}
