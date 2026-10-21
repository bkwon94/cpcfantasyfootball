/**
 * The analyzer result as a ledger: the swap card, one table of adjusters by side, the analysis, and the verdict.
 * It reads one analyze document and shows the final letter per side only, never the start letter or the final reason.
 */
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { Adjuster, AnalyzeResponse, GradedSide, Player, TradeSide } from "@/lib/analyze-types";
import { swapToDefault } from "@/lib/headshot";
import { DURATION, GRADE_STAGGER, rise, useMotionOff } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* A trade side joined to its grade, so each column reads from one object. */
type Side = TradeSide & GradedSide & { mine: boolean };

const CHOICE_WORD = { accept: "Accept", counter: "Counter", decline: "Decline" } as const;

/* Join the trade sides to the graded sides by roster id. The asker goes first, so "your side" is always the left column. */
function joinSides(doc: AnalyzeResponse): Side[] {
  const sides = doc.trade.sides.flatMap((trade) => {
    const graded = doc.sides.find((s) => s.roster_id === trade.roster_id);
    return graded ? [{ ...trade, ...graded, mine: trade.roster_id === doc.trade.asker }] : [];
  });
  return sides.sort((a, b) => Number(b.mine) - Number(a.mine));
}

/* The adjuster names in the order of the first side, plus any name only a later side has. */
function adjusterNames(sides: Side[]): string[] {
  return [...new Set(sides.flatMap((s) => s.adjusters.map((a) => a.name)))];
}

function Chapter({ children }: { children: ReactNode }) {
  return <section className="border-b-(length:--chap-rule) border-gry px-gutter py-sp-5">{children}</section>;
}

/* The classes are fixed, so this needs no cn. */
function Label({ children }: { children: ReactNode }) {
  return <div className="mb-sp-3 text-label leading-tight font-bold tracking-wide text-red uppercase">{children}</div>;
}

/* The small caps style of the table and the swap card. A className adds a color or a layout class. */
function Caps({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("text-label font-bold tracking-caps text-mute uppercase", className)}>{children}</span>;
}

function Blurb({ children }: { children: ReactNode }) {
  return <p className="m-0 text-body text-ink-2">{children}</p>;
}

/* The grade letter rises in once, so the grade lands with a beat. The order sets the delay, so the asker's letter lands first.
   With motion off, both letters show at rest at once. */
function GradeLetter({ letter, order }: { letter: string; order: number }) {
  const off = useMotionOff();
  return (
    <motion.span
      className="inline-block text-headline leading-none font-black tracking-grade"
      {...rise(off, { duration: DURATION.grade, delay: order * GRADE_STAGGER })}
    >
      {letter}
    </motion.span>
  );
}

function PlayerChip({ player }: { player: Player }) {
  return (
    <li className="flex flex-col items-center overflow-hidden rounded-card bg-wht px-sp-2 pt-sp-2 pb-sp-3 text-center">
      {/* The cutout fills the chip edge to edge, so the chip reads as a card for that player. The name names it, so the image is decorative. */}
      <img
        src={player.headshot}
        alt=""
        loading="lazy"
        onError={swapToDefault}
        className="-mx-sp-2 -mt-sp-2 mb-sp-2 block h-headshot self-stretch border-b-2 border-red bg-linear-to-b from-gry to-wht object-contain object-bottom"
      />
      <b className="text-row leading-tight font-extrabold tracking-snug">{player.name}</b>
      <span className="py-sp-1 text-meta text-mute">
        {player.position} · {player.nfl_team}
      </span>
    </li>
  );
}

/* One column of the swap card. The column spans the card's three rows, so a long team name pushes both columns' chips down together. */
function SwapColumn({ side }: { side: Side }) {
  return (
    <div className="row-span-3 grid min-w-0 grid-rows-subgrid gap-y-0">
      <div className="text-center text-meta leading-tight font-extrabold hyphens-auto">{side.team}</div>
      <span className="mt-sp-2 mb-sp-1 justify-self-center text-label font-bold tracking-wide text-mute uppercase">
        {side.mine ? "You get" : "Gets"}
      </span>
      <ul className="m-0 flex list-none flex-col gap-sp-2 p-0">
        {side.gets.map((player) => (
          <PlayerChip key={player.player_id} player={player} />
        ))}
      </ul>
    </div>
  );
}

function SwapCard({ sides }: { sides: Side[] }) {
  const [left, right] = sides;
  return (
    <div className="rounded-card bg-gry p-sp-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-x-sp-2 gap-y-sp-4">
        <SwapColumn side={left} />
        {/* The divider runs the full card height. The tag sits on it, level with the team names. */}
        <div className="relative row-span-3 flex flex-col items-center before:absolute before:inset-y-0 before:left-1/2 before:w-px before:bg-bar-off before:content-['']">
          <span className="relative mt-sp-5 rounded-sm bg-red p-sp-1 text-label font-extrabold tracking-caps text-on-dark uppercase">
            For
          </span>
        </div>
        <SwapColumn side={right} />
      </div>
    </div>
  );
}

const MARKS = {
  1: { symbol: "▲", label: "up one step", color: "text-red" },
  [-1]: { symbol: "▼", label: "down one step", color: "text-ink" },
  0: { symbol: "–", label: "no change", color: "text-mute" },
} as const;

function Mark({ step }: { step: Adjuster["step"] }) {
  const mark = MARKS[step];
  return (
    <span className={cn("text-center font-black", mark.color)}>
      <span aria-hidden="true">{mark.symbol}</span>
      <span className="sr-only">{mark.label}</span>
    </span>
  );
}

function LedgerCell({ side, name }: { side: Side; name: string }) {
  const adjuster = side.adjusters.find((a) => a.name === name);
  return (
    <td className={cn("border-b border-rule px-sp-1 py-sp-2 align-top", side.mine && "bg-gry")}>
      <div className="grid grid-cols-[var(--spacing-sp-4)_minmax(0,1fr)] gap-x-sp-1 text-ink-2">
        <Mark step={adjuster?.step ?? 0} />
        <span>{adjuster ? adjuster.reason : "n/a"}</span>
        {adjuster?.lean && (
          <Caps className="col-start-2">leans {adjuster.lean}</Caps>
        )}
      </div>
    </td>
  );
}

function LedgerTable({ sides }: { sides: Side[] }) {
  return (
    <table className="w-full table-fixed border-collapse border-y-2 border-blk text-meta leading-tight">
      <colgroup>
        {/* The name column is narrower, so the two reason columns get the room. */}
        <col className="w-[26%]" />
        {sides.map((side) => (
          <col key={side.roster_id} />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th scope="col" className="border-b border-blk px-sp-1 py-sp-2 text-left align-top">
            <Caps>Adjuster</Caps>
          </th>
          {sides.map((side, order) => (
            <th
              key={side.roster_id}
              scope="col"
              className={cn("border-b border-blk px-sp-1 py-sp-2 text-left align-top", side.mine && "bg-gry")}
            >
              <div className="flex flex-col gap-sp-1 text-row font-extrabold hyphens-auto">
                <span className="min-w-0">{side.team}</span>
                {side.mine && (
                  <Caps className="text-red">Your side</Caps>
                )}
                <GradeLetter letter={side.final_letter} order={order} />
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {adjusterNames(sides).map((name) => (
          <tr key={name}>
            <th scope="row" className="border-b border-rule px-sp-1 py-sp-2 text-left align-top">
              <Caps>{name}</Caps>
            </th>
            {sides.map((side) => (
              <LedgerCell key={side.roster_id} side={side} name={name} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* The reader's locale formats the time, so each manager sees the fetch time in a familiar form. */
function AsOfLine({ doc }: { doc: AnalyzeResponse }) {
  const fetched = new Date(doc.as_of.rosters_fetched).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <p className="m-0 text-meta text-mute tabular-nums">
      Chart week {doc.as_of.chart_week} · stats through week {doc.as_of.stats_through} · rosters fetched{" "}
      {/* The build and the browser can format the time apart, so a static render must not warn about it. */}
      <time dateTime={doc.as_of.rosters_fetched} suppressHydrationWarning>
        {fetched}
      </time>
    </p>
  );
}

export default function Ledger({ doc }: { doc: AnalyzeResponse }) {
  const sides = joinSides(doc);
  const verdictTeam = sides.find((s) => s.roster_id === doc.verdict.for_roster)?.team;

  return (
    <div>
      <Chapter>
        <Label>The trade</Label>
        <SwapCard sides={sides} />
      </Chapter>

      <Chapter>
        <Label>Ledger</Label>
        <LedgerTable sides={sides} />
      </Chapter>

      <Chapter>
        {sides.map((side, i) => (
          <div key={side.roster_id} className={i > 0 ? "mt-sp-4" : undefined}>
            <Label>
              {side.team}
              {side.mine && " · your side"}
            </Label>
            <Blurb>{doc.fallback ? "Analysis unavailable" : side.analysis}</Blurb>
          </div>
        ))}
      </Chapter>

      <Chapter>
        <div className="border-l-(length:--chap-rule) border-red py-sp-1 pl-sp-4">
          <Label>Verdict for {verdictTeam}</Label>
          <p className="mt-0 mb-sp-2 text-stat leading-stat font-black text-red uppercase">
            {CHOICE_WORD[doc.verdict.choice]}
          </p>
          <Blurb>{doc.verdict.reason}</Blurb>
        </div>
      </Chapter>

      {/* The API returns no counters yet. The slot holds their place under the verdict. */}
      <Chapter>
        <Label>Suggested counters</Label>
        <Blurb>No counters yet.</Blurb>
      </Chapter>

      <Chapter>
        <AsOfLine doc={doc} />
      </Chapter>
    </div>
  );
}
