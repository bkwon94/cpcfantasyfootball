/**
 * The trade form: one group of pickers per side, the submit button, the finder, and the result.
 * It owns the picks and the grade state, and it posts the trade to the analyze route.
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import AnalyzeResult from "@/components/analyze-result";
import { ErrorLine } from "@/components/error-line";
import { TradeFinder } from "@/components/trade-finder";
import { TradeSide } from "@/components/trade-side";
import { Button } from "@/components/ui/button";
import type { AnalyzeResponse, FinderTrade } from "@/lib/analyze-types";
import { ApiError, postAnalyze, toErrorLine, type Team } from "@/lib/api";
import { finderOn, season } from "@/lib/config";
import { DURATION, SWEEP_EASE, useMotionOff } from "@/lib/motion";
import { countEvent } from "@/lib/usage";

// A cold grade takes about 30 seconds and the server caches the result, so a long wait beats a retry.
const TIMEOUT_MS = 60_000;

type GradeState =
  | { status: "idle" }
  | { status: "grading" }
  | { status: "done"; doc: AnalyzeResponse }
  | { status: "error"; message: string; retry: boolean };

type TradeFormProps = {
  teams: Team[];
  passphrase: string;
  // The passphrase is wrong, so the page clears it and asks again.
  onUnauthorized: () => void;
  // Analyze answered 422, so the page fetches the current rosters.
  onRostersStale?: () => void;
  /* The page places the two parts. The result goes after the form's chapter and not inside it, so its own chapters
     read as cards under the form card. The form keeps the grade state, so it hands the parts out and does not lift the state. */
  children?: (parts: FormParts) => ReactNode;
};

/* The form with the finder, and the result of a done grade. */
type FormParts = { form: ReactNode; result: ReactNode };

/* With no layout from the page, the result follows the form. */
const stackParts = ({ form, result }: FormParts) => (
  <>
    {form}
    {result}
  </>
);

/* A given player and the roster he goes to. to is null while the destination side has no team. See ADR 0003. */
type Pick = { playerId: string; to: number | null };

/* One side of the trade: the picked roster and the players it gives. */
type Side = { rosterId: number | null; picks: Pick[] };

/* The sides of a trade in order. The first side is the asker, "Your Team". */
type Sides = Side[];

/* The heading of each side, by its place in the order. */
const SIDE_TITLES = ["Your Team", "Team Two"];

const EMPTY_SIDES: Sides = [
  { rosterId: null, picks: [] },
  { rosterId: null, picks: [] },
];

/* A trade to grade: the sides and the season of the data they come from. */
type TradeToGrade = { sides: Sides; season: number };

/* Points every pick at its destination. With two sides the destination is always the other side, so a team change there moves it too. */
function withDestinations(sides: Sides): Sides {
  if (sides.length !== 2) return sides;
  return sides.map((side, index) => {
    const to = sides[1 - index].rosterId;
    return side.picks.every((p) => p.to === to) ? side : { ...side, picks: side.picks.map((p) => ({ ...p, to })) };
  });
}

/* Every side gives at least one player and gets at least one player. The submit gate and the button read it. */
function bothGive(sides: Sides): boolean {
  return sides.every(
    (side) =>
      side.rosterId !== null &&
      side.picks.length > 0 &&
      sides.some((other) => other !== side && other.picks.some((p) => p.to === side.rosterId)),
  );
}

/* Drops each pick that is not on the current roster of the side's team. A fresh roster can lose a player after a trade.
   It returns the same object when nothing drops, so React skips the render. */
function dropStalePicks(side: Side, teams: Team[]): Side {
  if (side.rosterId === null) return side;
  const team = teams.find((t) => t.roster_id === side.rosterId);
  if (!team) return { rosterId: null, picks: [] };
  const onRoster = new Set(team.players.map((p) => p.player_id));
  const picks = side.picks.filter((p) => onRoster.has(p.playerId));
  return picks.length === side.picks.length ? side : { ...side, picks };
}

/* The grading status. A red bar sweeps along a grey track, so a 20-second wait reads as work in progress.
   Only transform animates. With motion off, the track stays as a still grey line. */
function GradingStatus() {
  const off = useMotionOff();
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-sp-2">
      <p className="m-0 text-body font-bold">Grading the trade</p>
      <div aria-hidden="true" className="relative h-sp-1 overflow-hidden rounded-sm bg-gry">
        {!off && (
          <motion.div
            role="presentation"
            className="absolute inset-y-0 left-0 w-1/3 bg-red"
            initial={{ x: "-100%" }}
            animate={{ x: "300%" }}
            transition={{ duration: DURATION.sweep, ease: SWEEP_EASE, repeat: Infinity }}
          />
        )}
      </div>
      <p className="m-0 text-meta text-mute">This can take up to a minute on a new chart week.</p>
    </div>
  );
}

export function TradeForm({ teams, passphrase, onUnauthorized, onRostersStale, children = stackParts }: TradeFormProps) {
  const [sides, setSides] = useState<Sides>(EMPTY_SIDES);
  const [grade, setGrade] = useState<GradeState>({ status: "idle" });
  // A late answer from an old trade must not overwrite the state of a new one.
  const runId = useRef(0);
  // The unmount effect aborts the call in flight, so a closed page does not wait on the API.
  const controllerRef = useRef<AbortController | null>(null);
  const unmounted = useRef(false);
  // A finder card asks for the full result, so the page scrolls the result into view when the grade ends.
  const resultRef = useRef<HTMLDivElement>(null);
  const scrollToResult = useRef(false);
  const off = useMotionOff();

  useEffect(() => {
    // React strict mode runs the cleanup and the effect again on mount, so the effect resets the flag.
    unmounted.current = false;
    return () => {
      unmounted.current = true;
      controllerRef.current?.abort();
    };
  }, []);

  // The scroll waits for the result, because the result is not in the page until the grade ends.
  useEffect(() => {
    if (grade.status !== "done" || !scrollToResult.current) return;
    scrollToResult.current = false;
    resultRef.current?.scrollIntoView({ behavior: off ? "auto" : "smooth", block: "start" });
  }, [grade.status, off]);

  // The page can swap a stored list for the fresh one while the form shows, so a pick of a traded player drops.
  // The check runs in the render, not in an effect, so no render ever shows a stale pick with the submit button on.
  const [seenTeams, setSeenTeams] = useState(teams);
  if (teams !== seenTeams) {
    setSeenTeams(teams);
    const fresh = sides.map((side) => dropStalePicks(side, teams));
    if (fresh.some((side, index) => side !== sides[index])) setSides(withDestinations(fresh));
  }

  const asker = sides[0].rosterId;
  const myTeam = teams.find((t) => t.roster_id === asker);
  const ready = bothGive(sides);
  // The grade locks the form, so the result always matches the picks on the screen. A result or an error ends it.
  const grading = grade.status === "grading";

  // A new team makes the old picks and the old result stale, so a change clears them.
  function pickTeam(index: number, rosterId: number) {
    runId.current += 1;
    setSides((current) => withDestinations(current.map((side, i) => (i === index ? { rosterId, picks: [] } : side))));
    setGrade({ status: "idle" });
  }

  /* The player picker reports the full list of ids. A kept player keeps his pick, so his destination holds. */
  function pickPlayers(index: number, playerIds: string[]) {
    setSides((current) =>
      withDestinations(
        current.map((side, i) => {
          if (i !== index) return side;
          const picks = playerIds.map((playerId) => side.picks.find((p) => p.playerId === playerId) ?? { playerId, to: null });
          return { ...side, picks };
        }),
      ),
    );
  }

  /* A finder card opens its full result here, so the form shows the picks of the trade and the result matches them.
     The form already owns the grade, so the card reuses this submit and needs no query or route of its own. */
  function openTrade(trade: FinderTrade, tradeSeason: number) {
    const partner = trade.sides.find((side) => side.roster_id !== asker);
    const own = trade.sides.find((side) => side.roster_id === asker);
    if (asker === null || !own || !partner) return;
    const toPicks = (side: { gives: { player_id: string }[] }) => side.gives.map((p) => ({ playerId: p.player_id, to: null }));
    const next = withDestinations([
      { rosterId: asker, picks: toPicks(own) },
      { rosterId: partner.roster_id, picks: toPicks(partner) },
    ]);
    setSides(next);
    // The new picks are not in state until the next render, so the submit gets them as an argument.
    // The season is the one of the finder document, so the grade matches the trade the card shows.
    submit({ sides: next, season: tradeSeason });
  }

  // The trade comes from the state by default. A finder card passes its own, because its picks land in state one render later.
  async function submit(trade?: TradeToGrade) {
    const toGrade = trade ?? { sides, season };
    const askerId = toGrade.sides[0].rosterId;
    if (askerId === null || !bothGive(toGrade.sides)) return;
    const id = ++runId.current;
    // Only a finder card passes a trade, and only that path scrolls to the result.
    scrollToResult.current = trade !== undefined;
    const controller = new AbortController();
    controllerRef.current = controller;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);
    setGrade({ status: "grading" });
    countEvent("analyze-grade");
    try {
      const doc = await postAnalyze(
        passphrase,
        {
          season: toGrade.season,
          asker: askerId,
          // bothGive holds, so every side has a team and every pick has a destination.
          sides: toGrade.sides.map((side) => ({
            roster_id: side.rosterId!,
            gives: side.picks.map((p) => ({ player_id: p.playerId, to: p.to! })),
          })),
        },
        controller.signal,
      );
      if (id === runId.current && !unmounted.current) setGrade({ status: "done", doc });
    } catch (error) {
      // An abort from unmount must not set state on a gone component.
      if (id !== runId.current || unmounted.current) return;
      if (error instanceof ApiError && error.status === 401) onUnauthorized();
      else setGrade({ status: "error", ...toErrorLine(error, timedOut, "The grade took too long.") });
      if (error instanceof ApiError && error.status === 422) onRostersStale?.();
    } finally {
      clearTimeout(timer);
    }
  }

  const form = (
    <>
      {/* From the tablet tier the form is a two-column grid, one side per column, in document order.
          A phone and a screen reader get the same order as the one-column flow. Every other part spans both columns. */}
      <section aria-labelledby="pick-teams" className="flex flex-col gap-sp-5 tablet:grid tablet:grid-cols-2 tablet:items-start">
        <h2 id="pick-teams" className="m-0 text-stat leading-stat font-black uppercase tablet:col-span-2">
          Pick the Teams
        </h2>
        {sides.map((side, index) => (
          <TradeSide
            key={index}
            title={SIDE_TITLES[index]}
            // A team that another side holds is absent from this side's list, so one team cannot be two sides.
            teams={teams.filter((t) => !sides.some((other, i) => i !== index && other.rosterId === t.roster_id))}
            team={teams.find((t) => t.roster_id === side.rosterId)}
            picks={side.picks.map((p) => p.playerId)}
            onPickTeam={(rosterId) => pickTeam(index, rosterId)}
            onPickPlayers={(ids) => pickPlayers(index, ids)}
            locked={grading}
          />
        ))}
        <Button
          className="press h-touch w-full rounded-card px-sp-4 text-lead font-bold tablet:col-span-2"
          disabled={!ready || grading}
          aria-busy={grading || undefined}
          // The arrow drops the click event, so submit reads the trade from the state.
          onClick={() => submit()}
        >
          {grading ? "Grading…" : "Grade the trade"}
        </Button>
        {grading && (
          <div className="tablet:col-span-2">
            <GradingStatus />
          </div>
        )}
        {grade.status === "error" && (
          <div className="flex flex-col gap-sp-3 tablet:col-span-2">
            <ErrorLine>{grade.message}</ErrorLine>
            {grade.retry && (
              <Button className="press h-touch w-full rounded-card px-sp-4 text-lead font-bold" onClick={() => submit()}>
                Try again
              </Button>
            )}
          </div>
        )}
      </section>
      {/* The finder needs the asker, so it shows once my team is picked. The key resets the partner and the cards when my team changes. */}
      {/* The finder is off by default because the page felt crowded. */}
      {finderOn && myTeam && (
        <div className="mt-sp-6">
          <TradeFinder
            key={myTeam.roster_id}
            teams={teams}
            asker={myTeam.roster_id}
            passphrase={passphrase}
            onUnauthorized={onUnauthorized}
            onRostersStale={onRostersStale}
            onOpen={openTrade}
            locked={grading}
          />
        </div>
      )}
    </>
  );

  const result = grade.status === "done" && (
    <div ref={resultRef}>
      <AnalyzeResult doc={grade.doc} />
    </div>
  );

  return children({ form, result });
}
