/**
 * The sheet of the waiver page: the open player's name, his facts, his research claims, the bid to win, and the last like him.
 * A drop names the roster that holds him in place of a price. A line says when the research step found no experts this week.
 */
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Blurb } from "@/components/week/parts";
import { thousands } from "@/lib/format";
import { DURATION, rise, useMotionOff } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ClaimStance, WaiverPlayer } from "@/lib/waiver-types";
import type { Team } from "@/lib/week-types";

const STANCE: Record<ClaimStance, string> = { backs: "Backs the board", disputes: "Disputes the board" };

/* The team name of a roster, or the roster number when the week page has no such team. */
export function teamName(teams: Record<string, Team>, rosterId: number): string {
  return teams[String(rosterId)]?.name ?? `Roster ${rosterId}`;
}

/* The position, the team, the bye, and the injury, each only when the file has it. */
export function metaLine(player: WaiverPlayer): string {
  const parts = [player.position, player.team];
  if (player.bye != null) parts.push(`Bye ${player.bye}`);
  if (player.injury_status) {
    parts.push(player.return_week != null ? `${player.injury_status}, back week ${player.return_week}` : player.injury_status);
  }
  return parts.join(" · ");
}

/* One box of the bid row: a small caps name, a big number, and the line that explains it. The hot box is the bid to win. */
function BidBox({ name, value, hot, children }: { name: string; value: string; hot?: boolean; children: ReactNode }) {
  return (
    <div className={cn("flex-1 rounded-card px-sp-3 py-sp-2", hot ? "bg-red" : "bg-chip-dark")}>
      <div className="text-label leading-tight tracking-caps text-on-dark-muted uppercase">{name}</div>
      <div className="text-stat leading-stat font-extrabold tabular-nums">{value}</div>
      <div className="mt-sp-0 text-meta leading-tight text-on-dark-2">{children}</div>
    </div>
  );
}

export function PlayerSheet({
  player,
  teams,
  expertsMissing,
}: {
  player: WaiverPlayer | null;
  teams: Record<string, Team>;
  expertsMissing: boolean;
}) {
  const off = useMotionOff();
  const facts = player?.facts ?? [];
  const claims = player?.claims ?? [];
  const price = player?.price ?? null;
  const last = price?.last_like ?? null;
  return (
    // The sheet speaks its new player politely, so a screen reader hears the change after a tap.
    <section aria-label="Player sheet" aria-live="polite" className="mt-sp-3 rounded-card border border-rule-dark bg-ink px-sp-4 py-sp-3">
      {player && (
        // The key changes with the player, so a new player rises in once. The old one leaves at once, so a fast tap never waits.
        <motion.div key={player.player_id} data-reveal {...rise(off, { duration: DURATION.page })}>
          <h2 className="m-0 text-lead leading-tight font-extrabold tracking-snug">{player.name}</h2>
          <div className="mt-sp-0 text-meta text-on-dark-muted tabular-nums">{metaLine(player)}</div>
          {player.roster_id != null && (
            <div className="mt-sp-1 text-meta font-bold text-red-lt">{`On ${teamName(teams, player.roster_id)}`}</div>
          )}
          {(player.trending_count ?? 0) > 0 && (
            <div className="mt-sp-1 text-meta text-on-dark-2 tabular-nums">{`${thousands(player.trending_count!)} adds on Sleeper in the last day`}</div>
          )}
          {facts.length > 0 && (
            <ul aria-label="Facts" className="m-0 mt-sp-2 list-none space-y-sp-1 p-0">
              {facts.map((fact) => (
                <li key={fact.id}>
                  <Blurb dark className="text-meta leading-body">
                    {fact.text}
                  </Blurb>
                </li>
              ))}
            </ul>
          )}
          {claims.length > 0 && (
            <ul aria-label="Claims" className="m-0 mt-sp-3 list-none space-y-sp-2 border-t border-rule-dark p-0 pt-sp-2">
              {claims.map((claim) => (
                <li key={claim.url} className="text-meta leading-body">
                  {/* A claim opens its source in a new tab, so the reader keeps the page and the open player. */}
                  <a href={claim.url} target="_blank" rel="noopener noreferrer" className="text-on-dark underline decoration-mute underline-offset-2">
                    {claim.sentence}
                  </a>
                  <div className="text-label tracking-caps text-on-dark-muted uppercase">{`${claim.source} · ${STANCE[claim.stance]}`}</div>
                </li>
              ))}
            </ul>
          )}
          {price && (
            <div className="mt-sp-3 flex items-stretch gap-sp-2">
              <BidBox name="Bid to win" value={`$${price.bid}`} hot>
                {price.fact.text}
              </BidBox>
              {last && (
                <BidBox name={`Last ${player.position} won`} value={`$${last.bid}`}>
                  {`${last.name}, week ${last.week}, ${teamName(teams, last.roster_id)}`}
                </BidBox>
              )}
            </div>
          )}
        </motion.div>
      )}
      {expertsMissing && <p className="m-0 mt-sp-3 text-meta text-on-dark-muted italic">The experts are out this week.</p>}
    </section>
  );
}
