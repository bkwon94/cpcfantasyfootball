/**
 * One side of the trade form: a heading, the team picker, the player picker, and the picked players as rows.
 * The form owns the sides, so this part only reads its side and reports each change.
 */
"use client";

import { useId } from "react";
import { XIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Team, TeamPlayer } from "@/lib/api";
import { AVATAR_FALLBACK, swapAvatarToDefault } from "@/lib/avatar";
import { HEADSHOT_FALLBACK, swapToDefault } from "@/lib/headshot";
import { cn } from "@/lib/utils";

type TradeSideProps = {
  // The heading of the side, such as "Your Team". It also names the team picker.
  title: string;
  // The teams this side can pick: every team that no other side holds.
  teams: Team[];
  // The picked team of this side, or undefined before a pick.
  team: Team | undefined;
  // The ids of the players this side gives, in the order of the pick.
  picks: string[];
  onPickTeam: (rosterId: number) => void;
  onPickPlayers: (playerIds: string[]) => void;
  // A grade runs, so no picker or remove control may change the trade that the grade reads.
  locked: boolean;
};

/* The trigger of both pickers: a grey row as tall as a touch target, with a hover fill and a red focus ring. */
const TRIGGER =
  "press w-full min-w-0 justify-start gap-sp-3 rounded-card border-0 bg-gry px-sp-3 py-sp-1 text-left text-row text-ink data-[size=default]:h-auto min-h-touch hover:bg-rule focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red focus-visible:ring-0 disabled:opacity-40 dark:bg-gry dark:hover:bg-rule [&>[data-slot=select-value]]:min-w-0 [&>[data-slot=select-value]]:flex-1";

/* An item of a picker popup: a touch-tall row that fills on hover and on keyboard focus. */
const ITEM = "min-h-touch gap-sp-3 rounded-sm px-sp-2 pr-sp-6 text-row text-ink data-highlighted:bg-gry focus:bg-gry";

/* The label above a picker: small red caps, as the form used for its legends. The text stays in title case for a screen reader. */
const LABEL = "m-0 text-label font-bold tracking-wide text-red-ink uppercase";

/* A round image in a picker. The faint ring gives the image an edge on the grey row in both themes. */
const ROUND_IMG = "size-avatar flex-none rounded-full bg-wht object-cover ring-1 ring-ink/10";

function TeamAvatar({ team }: { team: Team }) {
  return <img src={team.avatar ?? AVATAR_FALLBACK} alt="" onError={swapAvatarToDefault} className={ROUND_IMG} />;
}

function Headshot({ player }: { player: TeamPlayer }) {
  return (
    <img
      src={player.headshot || HEADSHOT_FALLBACK}
      alt=""
      loading="lazy"
      onError={swapToDefault}
      className={cn(ROUND_IMG, "object-top")}
    />
  );
}

/* The name over the position and the NFL team. min-w-0 lets a long name truncate and not push the row wider. */
function PlayerText({ player }: { player: TeamPlayer }) {
  return (
    <span className="flex min-w-0 flex-col">
      <b className="truncate text-row leading-tight font-extrabold">{player.name}</b>
      <span className="text-meta text-mute">
        {player.position} {player.nfl_team}
      </span>
    </span>
  );
}

/* The trigger text of the player picker: the count once the side gives a player. */
function countText(count: number): string {
  if (count === 0) return "Pick Players";
  return `${count} ${count === 1 ? "Player" : "Players"}`;
}

export function TradeSide({ title, teams, team, picks, onPickTeam, onPickPlayers, locked }: TradeSideProps) {
  const headingId = useId();
  const playersLabelId = useId();
  const picked = team ? picks.map((id) => team.players.find((p) => p.player_id === id)).filter((p) => p !== undefined) : [];

  return (
    <div role="group" aria-labelledby={headingId} className="flex min-w-0 flex-col gap-sp-3">
      <h3 id={headingId} className={LABEL}>
        {title}
      </h3>
      <Select<number>
        value={team?.roster_id ?? null}
        onValueChange={(rosterId) => {
          if (rosterId !== null) onPickTeam(rosterId);
        }}
        disabled={locked}
      >
        <SelectTrigger aria-labelledby={headingId} className={TRIGGER}>
          <SelectValue>
            {() =>
              team ? (
                <span className="flex min-w-0 items-center gap-sp-3">
                  <TeamAvatar team={team} />
                  <b className="truncate text-row leading-tight font-extrabold">{team.team}</b>
                </span>
              ) : (
                <span className="text-mute">Pick a Team</span>
              )
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} className="p-sp-1 motion-reduce:animate-none">
          {teams.map((t) => (
            <SelectItem key={t.roster_id} value={t.roster_id} className={ITEM}>
              <TeamAvatar team={t} />
              <span className="flex min-w-0 flex-col">
                <b className="truncate leading-tight font-extrabold">{t.team}</b>
                <span className="text-meta text-mute">{t.manager}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {team && (
        <div className="flex min-w-0 flex-col gap-sp-2">
          <span id={playersLabelId} className={LABEL}>
            {`${team.team} Gives`}
          </span>
          <Select<string, true> multiple value={picks} onValueChange={(ids) => onPickPlayers(ids)} disabled={locked}>
            <SelectTrigger aria-labelledby={playersLabelId} className={TRIGGER}>
              <SelectValue>
                {(ids: string[]) => (
                  <span className={cn("tabular-nums", ids.length === 0 && "text-mute")}>{countText(ids.length)}</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} className="p-sp-1 motion-reduce:animate-none">
              {team.players.map((player) => (
                <SelectItem key={player.player_id} value={player.player_id} className={ITEM}>
                  <Headshot player={player} />
                  <PlayerText player={player} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {picked.length > 0 && (
            <ul aria-label={`Players ${team.team} Gives`} className="m-0 flex list-none flex-col gap-sp-1 p-0">
              {picked.map((player) => (
                <li
                  key={player.player_id}
                  className="flex min-h-touch items-center gap-sp-3 rounded-card bg-card-blk py-sp-1 pl-sp-3 text-on-dark"
                >
                  <Headshot player={player} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <b className="truncate text-row leading-tight font-extrabold">{player.name}</b>
                    <span className="text-meta text-on-dark-muted">
                      {player.position} {player.nfl_team}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${player.name}`}
                    disabled={locked}
                    onClick={() => onPickPlayers(picks.filter((id) => id !== player.player_id))}
                    className="press grid size-touch flex-none cursor-pointer place-items-center rounded-card text-on-dark-muted hover:text-on-dark focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-red disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <XIcon aria-hidden="true" className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
