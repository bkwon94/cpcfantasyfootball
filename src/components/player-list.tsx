/**
 * The players one team can give, as a fieldset of tick-box rows. Each row shows the headshot, name, position, and NFL team.
 * The parent owns the picks, so the submit button can read both sides.
 */
"use client";

import type { Team } from "@/lib/api";
import { HEADSHOT_FALLBACK, swapToDefault } from "@/lib/headshot";
import { cn } from "@/lib/utils";

type PlayerListProps = {
  team: Team;
  // The picked player ids.
  picked: string[];
  onToggle: (playerId: string) => void;
  // A grade runs, so a tap must not change the trade that the grade reads.
  locked?: boolean;
};

export function PlayerList({ team, picked, onToggle, locked = false }: PlayerListProps) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-sp-2 p-0 text-label font-bold tracking-wide text-red-ink uppercase">{team.team} gives</legend>
      <div className="flex flex-col gap-sp-1">
        {team.players.map((player) => (
          <label
            key={player.player_id}
            aria-disabled={locked || undefined}
            className={cn(
              "group flex min-h-touch items-center gap-sp-3 rounded-card bg-gry px-sp-3 py-sp-1 has-checked:bg-blk has-checked:text-on-dark has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-red",
              locked ? "cursor-not-allowed opacity-40" : "press cursor-pointer",
            )}
          >
            <input
              type="checkbox"
              checked={picked.includes(player.player_id)}
              disabled={locked}
              onChange={() => onToggle(player.player_id)}
              className="size-4 flex-none accent-red"
            />
            <img
              src={player.headshot || HEADSHOT_FALLBACK}
              alt=""
              loading="lazy"
              onError={swapToDefault}
              className="size-avatar flex-none rounded-full bg-wht object-cover object-top"
            />
            <span className="flex min-w-0 flex-col">
              <b className="text-row leading-tight font-extrabold">{player.name}</b>
              <span className="text-meta text-mute group-has-checked:text-on-dark-muted">
                {player.position} {player.nfl_team}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
