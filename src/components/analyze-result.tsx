/**
 * The analyzer result: the decision for the asker first, the fairness line, the swap card, then the analysis, the data, and the reasoning per side.
 * It reads one analyze document. No letter grade shows anywhere.
 * The trade finder reuses SwapCard, FairnessBlock, and AsOfLine for its cards and its as-of line.
 */
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { AnalyzeResponse, AsOf, DecidedSide, Decision, Factor, Fairness, Player, TradeSide } from "@/lib/analyze-types";
import { swapToDefault } from "@/lib/headshot";
import { knownGamesSegments } from "@/lib/known-games-segments";
import { DURATION, rise, useMotionOff } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* A trade side with the asker flag. The swap card and the fairness line need no more, so the finder cards reuse them with a side that has no read. */
export type SwapSide = TradeSide & { mine: boolean };

/* A trade side joined to its read, so each side reads from one object. */
type Side = SwapSide & DecidedSide;

/* Join the trade sides to the decided sides by roster id. The decision side goes first, so the decision and "your side" name the same team. */
function joinSides(doc: AnalyzeResponse): Side[] {
  const sides = doc.trade.sides.flatMap((trade) => {
    const decided = doc.sides.find((s) => s.roster_id === trade.roster_id);
    return decided ? [{ ...trade, ...decided, mine: trade.roster_id === doc.decision.for_roster }] : [];
  });
  return sides.sort((a, b) => Number(b.mine) - Number(a.mine));
}

function Chapter({ children }: { children: ReactNode }) {
  return <section className="border-b-(length:--chap-rule) border-gry px-gutter py-sp-5">{children}</section>;
}

/* The classes are fixed, so this needs no cn. */
function Label({ children }: { children: ReactNode }) {
  return <div className="mb-sp-3 text-label leading-tight font-bold tracking-wide text-red-ink uppercase">{children}</div>;
}

/* The small caps style of the table and the swap card. A className adds a color or a layout class. */
function Caps({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("text-label font-bold tracking-caps text-mute uppercase", className)}>{children}</span>;
}

function Blurb({ children }: { children: ReactNode }) {
  return <p className="m-0 text-body text-ink-2">{children}</p>;
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
function SwapColumn({ side }: { side: SwapSide }) {
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

export function SwapCard({ sides }: { sides: SwapSide[] }) {
  const [left, right] = sides;
  return (
    <div className="rounded-card bg-gry p-sp-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-x-sp-2 gap-y-sp-4">
        <SwapColumn side={left} />
        {/* The divider runs the full card height. The tag sits on it, level with the team names. */}
        <div className="relative row-span-3 flex flex-col items-center before:absolute before:inset-y-0 before:left-1/2 before:w-px before:bg-divider before:content-['']">
          <span className="relative mt-sp-5 rounded-sm bg-red p-sp-1 text-label font-extrabold tracking-caps text-on-dark uppercase">
            For
          </span>
        </div>
        <SwapColumn side={right} />
      </div>
    </div>
  );
}

/* The mark of a factor lean. The symbol is decorative, so a screen reader hears the word. */
const MARKS = {
  for: { symbol: "▲", color: "text-red-ink" },
  against: { symbol: "▼", color: "text-ink" },
  even: { symbol: "–", color: "text-mute" },
} as const;

function Mark({ lean }: { lean: Factor["lean"] }) {
  const mark = MARKS[lean];
  return (
    <span className={cn("text-center font-black", mark.color)}>
      <span aria-hidden="true">{mark.symbol}</span>
      <span className="sr-only">{lean}</span>
    </span>
  );
}

const ANSWER_WORD = {
  yes: { word: "Yes", color: "text-red-ink" },
  no: { word: "No", color: "text-blk" },
  not_as_is: { word: "Not as is", color: "text-mute" },
} as const;

/* The answer word rises in once, so the call lands with a beat. With motion off, it shows at rest at once. */
function DecisionBlock({ decision, team }: { decision: Decision; team?: string }) {
  const off = useMotionOff();
  const answer = ANSWER_WORD[decision.answer];
  return (
    <div className="border-l-(length:--chap-rule) border-red py-sp-1 pl-sp-4">
      <Label>Decision for {team ?? "your side"}</Label>
      <motion.p
        className={cn("mt-0 mb-sp-2 text-headline leading-none font-black tracking-grade", answer.color)}
        {...rise(off, { duration: DURATION.decision })}
      >
        {answer.word}
      </motion.p>
      <Blurb>{decision.reason}</Blurb>
    </div>
  );
}

/* The page words of the fairness states. The glossary says "Good for both" on the page, never "win-win". */
const FAIRNESS_WORD = {
  win_win: { word: "Good for both", color: "text-red-ink" },
  fair: { word: "Fair", color: "text-mute" },
  lopsided: { word: "Lopsided", color: "text-blk" },
} as const;

/* The fairness line rises in like the decision word, so both read as one call. With motion off, it shows at rest at once. */
export function FairnessBlock({ sides, fairness }: { sides: SwapSide[]; fairness: Fairness }) {
  const off = useMotionOff();
  const state = FAIRNESS_WORD[fairness.state];
  // A lopsided line names the side that gives more, so the reader knows who loses. The type says a lopsided block always has gives_more, and the pipeline sets it to a side of the trade.
  const line =
    fairness.state === "lopsided"
      ? `${state.word}: ${sides.find((s) => s.roster_id === fairness.gives_more)!.team} gives more.`
      : state.word;
  return (
    <div>
      <Label>Fairness</Label>
      <motion.p
        className={cn("mt-0 mb-sp-3 text-row leading-tight font-extrabold tracking-snug", state.color)}
        {...rise(off, { duration: DURATION.fairness })}
      >
        {line}
      </motion.p>
      <ul className="m-0 flex list-none flex-col gap-sp-2 p-0">
        {/* joinSides puts the asker's side first, so the reasons take that order. A finder card sorts its sides the same way. */}
        {sides.map((side) => (
          <li key={side.roster_id}>
            <Caps className="mb-sp-1 block">{side.team}</Caps>
            <Blurb>{fairness.sides.find((f) => f.roster_id === side.roster_id)?.reason}</Blurb>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* The small label over a part of one side. */
function Part({ children }: { children: ReactNode }) {
  return <Caps className="mt-sp-4 mb-sp-2 block text-ink">{children}</Caps>;
}

function SideRead({ side }: { side: Side }) {
  const analysis = side.analysis;
  return (
    <div>
      <Label>
        {side.team}
        {side.mine && " · your side"}
      </Label>
      {analysis === null ? (
        <p className="m-0 text-body text-mute">The analysis is unavailable, so the data stands alone.</p>
      ) : (
        <Blurb>{analysis}</Blurb>
      )}

      <Part>The data</Part>
      <p className="m-0 text-meta leading-tight text-ink-2">{side.chart.reason}</p>

      <Part>The reasoning</Part>
      <ul className="m-0 list-none border-y-2 border-blk p-0 text-meta leading-tight">
        {side.factors.map((f) => (
          <li
            key={f.name}
            className="grid grid-cols-[var(--spacing-sp-4)_minmax(0,1fr)] gap-x-sp-1 border-b border-rule px-sp-1 py-sp-2 text-ink-2 last:border-b-0"
          >
            <Mark lean={f.lean} />
            <Caps>{f.name}</Caps>
            <span className="col-start-2">{f.reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* The reader's locale formats the time, so each manager sees the fetch time in a familiar form.
   The finder document carries the same as_of block, so the finder page shows the same line. */
export function AsOfLine({ doc }: { doc: { as_of: AsOf; stale: string[] } }) {
  const { as_of, stale } = doc;
  const tradeWeek = as_of.known_games?.week ?? as_of.stats_through + 1;
  // Stats that failed to fetch leave the line stale, so the line says so.
  const staleSegments = stale.includes("stats") ? [`Week ${tradeWeek} stats not fetched`] : [];
  const fetched = new Date(doc.as_of.rosters_fetched).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <p className="m-0 text-meta text-mute tabular-nums">
      {[...knownGamesSegments(as_of), ...staleSegments, `Chart week ${as_of.chart_week}`].join(" · ")} · rosters fetched{" "}
      {/* The build and the browser can format the time apart, so a static render must not warn about it. */}
      <time dateTime={doc.as_of.rosters_fetched} suppressHydrationWarning>
        {fetched}
      </time>
    </p>
  );
}

/* A week with no chart gets one meta line that says so. A document without the flag shows nothing. */
export function NoChartLine({ asOf }: { asOf: AsOf }) {
  if (!asOf.no_chart || !asOf.no_chart_note) return null;
  return <p className="m-0 pt-sp-3 text-meta text-mute">{asOf.no_chart_note}</p>;
}

export default function AnalyzeResult({ doc }: { doc: AnalyzeResponse }) {
  const sides = joinSides(doc);
  const decisionTeam = sides.find((s) => s.roster_id === doc.decision.for_roster)?.team;

  return (
    <div>
      <Chapter>
        <DecisionBlock decision={doc.decision} team={decisionTeam} />
        <NoChartLine asOf={doc.as_of} />
      </Chapter>

      {/* The fairness line sits under the decision, so the decision stays the lead. The ticket asks the page to render a document with no block, as a guard, so it shows no line then. */}
      {doc.fairness && (
        <Chapter>
          <FairnessBlock sides={sides} fairness={doc.fairness} />
        </Chapter>
      )}

      <Chapter>
        <Label>The trade</Label>
        <SwapCard sides={sides} />
      </Chapter>

      {sides.map((side) => (
        <Chapter key={side.roster_id}>
          <SideRead side={side} />
        </Chapter>
      ))}

      {/* The API returns no counters yet. The slot holds their place under the sides. */}
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
