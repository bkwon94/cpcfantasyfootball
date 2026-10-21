/**
 * A labelled list of teams as a radio group. Each row shows the avatar, the team name, and the manager.
 * The parent owns the choice, so two pickers can disable each other's pick.
 */
"use client";

import type { SyntheticEvent } from "react";
import type { Team } from "@/lib/api";
import { basePath } from "@/lib/config";
import { cn } from "@/lib/utils";

const AVATAR_FALLBACK = `${basePath}/images/avatar-default.svg`;

/* An avatar that fails to load swaps to the default once. The guard stops a loop if that file fails too. */
function swapToDefault(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = AVATAR_FALLBACK;
}

type TeamPickerProps = {
  // Also the name of the radio group, so two pickers on one page stay apart.
  label: string;
  teams: Team[];
  value: number | null;
  // The roster id that the other picker holds. This picker shows that row as disabled.
  disabledId: number | null;
  onChange: (rosterId: number) => void;
};

export function TeamPicker({ label, teams, value, disabledId, onChange }: TeamPickerProps) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-sp-2 p-0 text-label font-bold tracking-wide text-red uppercase">{label}</legend>
      <div className="flex flex-col gap-sp-1">
        {teams.map((team) => {
          const disabled = team.roster_id === disabledId;
          return (
            <label
              key={team.roster_id}
              className={cn(
                "group flex min-h-touch cursor-pointer items-center gap-sp-3 rounded-card bg-gry px-sp-3 py-sp-1 has-checked:bg-blk has-checked:text-on-dark has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-red",
                disabled ? "cursor-not-allowed opacity-40" : "press",
              )}
            >
              {/* The input is visually hidden, and the row shows the choice. The input stays in the page for the keyboard and for screen readers. */}
              <input
                type="radio"
                name={label}
                value={team.roster_id}
                checked={value === team.roster_id}
                disabled={disabled}
                onChange={() => onChange(team.roster_id)}
                className="sr-only"
              />
              <img
                src={team.avatar ?? AVATAR_FALLBACK}
                alt=""
                onError={swapToDefault}
                className="size-avatar flex-none rounded-full bg-wht object-cover"
              />
              <span className="flex min-w-0 flex-col">
                <b className="text-row leading-tight font-extrabold">{team.team}</b>
                <span className="text-meta text-mute group-has-checked:text-on-dark-muted">{team.manager}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
