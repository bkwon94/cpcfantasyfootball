/**
 * The hero of a manager page: the large avatar, the team name, the owner, the record, and the standing.
 * Under it sit the three numbers, the grade, the playoff odds, and the power rank, each with one quiet line of context.
 */
import type { ReactNode } from "react";
import { Chapter } from "@/components/week/parts";
import { ordinal } from "@/lib/format";
import type { Manager } from "@/lib/manager-types";

/* A change in words. Positive is up, so the odds change and the rank movement read the same way. */
function changeWords(change: number): string {
  if (change === 0) return "no change";
  return change > 0 ? `up ${change}` : `down ${Math.abs(change)}`;
}

/* One number: one quiet label over it, the number as the one emphasis, and at most one quiet line under it. */
function SeasonNumber({ label, children, context }: { label: string; children: ReactNode; context?: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-label leading-tight font-semibold tracking-caps text-mute uppercase">{label}</dt>
      <dd className="m-0 mt-sp-2 text-score leading-none font-extrabold text-ink tabular-nums">{children}</dd>
      {context && <dd className="m-0 mt-sp-1 text-meta text-mute">{context}</dd>}
    </div>
  );
}

/* A place out of the league, such as "4th of 12". The place is the emphasis, so "of 12" stays small and quiet. */
function Place({ place, of }: { place: number; of: number }) {
  return (
    <>
      {ordinal(place)}
      <span className="text-meta font-semibold text-mute">{` of ${of}`}</span>
    </>
  );
}

export function ManagerHero({ manager, avatar, teams }: { manager: Manager; avatar: string; teams: number }) {
  const { odds, rank } = manager;
  return (
    // The hero shows at once with the masthead, so it takes no reveal.
    <Chapter>
      <div className="flex items-center gap-sp-4">
        {/* The team name sits next to the avatar, so the image is decorative. */}
        <img src={avatar} alt="" className="size-headshot flex-none rounded-full bg-gry object-cover" />
        <div className="min-w-0">
          {/* The name wraps and never truncates. The balance splits a long name into even lines. */}
          <h1 className="m-0 text-stat leading-tight font-extrabold text-balance text-ink tablet:text-score">
            {manager.team.name}
          </h1>
          <div className="mt-sp-1 text-meta text-mute">{manager.team.owner}</div>
          <div className="mt-sp-1 text-body text-ink-2 tabular-nums">
            <span className="font-semibold text-ink">{`${manager.wins}-${manager.losses}`}</span>
            {` · ${ordinal(manager.standing)} of ${teams}`}
          </div>
        </div>
      </div>
      {/* The rule and the space above it set the numbers apart from the team, so the hero reads as two groups. */}
      <dl role="group" aria-label="Season Numbers" className="m-0 mt-sp-5 grid grid-cols-3 gap-sp-4 border-t border-rule pt-sp-5">
        <SeasonNumber label="Grade">—</SeasonNumber>
        <SeasonNumber label="Playoff Odds" context={odds && manager.odds_change !== null ? changeWords(manager.odds_change) : null}>
          {odds ? `${odds.playoff}%` : "—"}
        </SeasonNumber>
        <SeasonNumber label="Power Rank" context={rank !== null && manager.movement !== null ? changeWords(manager.movement) : null}>
          {rank !== null ? <Place place={rank} of={teams} /> : "—"}
        </SeasonNumber>
      </dl>
    </Chapter>
  );
}
