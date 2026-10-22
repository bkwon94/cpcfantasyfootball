/**
 * The trade form: the two team pickers, the two player lists, the submit button, the finder, and the result.
 * It owns the picks and the grade state, and it posts the trade to the analyze route.
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import AnalyzeResult from "@/components/analyze-result";
import { ErrorLine } from "@/components/error-line";
import { PlayerList } from "@/components/player-list";
import { TeamPicker } from "@/components/team-picker";
import { TradeFinder } from "@/components/trade-finder";
import { Button } from "@/components/ui/button";
import type { AnalyzeResponse, FinderTrade } from "@/lib/analyze-types";
import { ApiError, postAnalyze, toErrorLine, type Team } from "@/lib/api";
import { finderOn, season } from "@/lib/config";
import { DURATION, SWEEP_EASE, useMotionOff } from "@/lib/motion";

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
};

/* One side of the trade: the picked roster and the player ids it gives. */
type Side = { rosterId: number | null; picks: string[] };
type SideName = "mine" | "other";

/* The two sides of a trade, my side first. */
type Sides = { mine: Side; other: Side };

/* A trade to grade: the sides and the season of the data they come from. */
type TradeToGrade = Sides & { season: number };

/* Both sides give a player. The submit gate and the button read it. */
function bothGive({ mine, other }: Sides): boolean {
  return mine.picks.length > 0 && other.picks.length > 0;
}

/* Drops each pick that is not on the current roster of the side's team. A fresh roster can lose a player after a trade.
   It returns the same object when nothing drops, so React skips the render. */
function dropStalePicks(side: Side, teams: Team[]): Side {
  if (side.rosterId === null) return side;
  const team = teams.find((t) => t.roster_id === side.rosterId);
  if (!team) return { rosterId: null, picks: [] };
  const onRoster = new Set(team.players.map((p) => p.player_id));
  const picks = side.picks.filter((id) => onRoster.has(id));
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

export function TradeForm({ teams, passphrase, onUnauthorized, onRostersStale }: TradeFormProps) {
  const [sides, setSides] = useState<Sides>({
    mine: { rosterId: null, picks: [] },
    other: { rosterId: null, picks: [] },
  });
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
    const mine = dropStalePicks(sides.mine, teams);
    const other = dropStalePicks(sides.other, teams);
    if (mine !== sides.mine || other !== sides.other) setSides({ mine, other });
  }

  const { mine, other } = sides;
  const myTeam = teams.find((t) => t.roster_id === mine.rosterId);
  const otherTeam = teams.find((t) => t.roster_id === other.rosterId);
  const ready = bothGive(sides);
  // The grade locks the form, so the result always matches the picks on the screen. A result or an error ends it.
  const grading = grade.status === "grading";

  // A new team makes the old picks and the old result stale, so a change clears them.
  function pickTeam(side: SideName, rosterId: number) {
    runId.current += 1;
    setSides((current) => ({ ...current, [side]: { rosterId, picks: [] } }));
    setGrade({ status: "idle" });
  }

  function togglePick(side: SideName, playerId: string) {
    setSides((current) => {
      const { picks } = current[side];
      const next = picks.includes(playerId) ? picks.filter((p) => p !== playerId) : [...picks, playerId];
      return { ...current, [side]: { ...current[side], picks: next } };
    });
  }

  /* A finder card opens its full result here, so the form shows the picks of the trade and the result matches them.
     The form already owns the grade, so the card reuses this submit and needs no query or route of its own. */
  function openTrade(trade: FinderTrade, tradeSeason: number) {
    const asker = mine.rosterId;
    const partner = trade.sides.find((side) => side.roster_id !== asker);
    const own = trade.sides.find((side) => side.roster_id === asker);
    if (asker === null || !own || !partner) return;
    const next = {
      mine: { rosterId: asker, picks: own.gives.map((p) => p.player_id) },
      other: { rosterId: partner.roster_id, picks: partner.gives.map((p) => p.player_id) },
    };
    setSides(next);
    // The new picks are not in state until the next render, so the submit gets them as an argument.
    // The season is the one of the finder document, so the grade matches the trade the card shows.
    submit({ ...next, season: tradeSeason });
  }

  // The trade comes from the state by default. A finder card passes its own, because its picks land in state one render later.
  async function submit(trade?: TradeToGrade) {
    const toGrade = trade ?? { ...sides, season };
    const askerId = toGrade.mine.rosterId;
    const otherId = toGrade.other.rosterId;
    if (askerId === null || otherId === null || !bothGive(toGrade)) return;
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
    try {
      const doc = await postAnalyze(
        passphrase,
        {
          season: toGrade.season,
          sides: [
            { roster_id: askerId, gives: toGrade.mine.picks },
            { roster_id: otherId, gives: toGrade.other.picks },
          ],
          asker: askerId,
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

  return (
    <>
      <section aria-labelledby="pick-teams" className="flex flex-col gap-sp-5">
        <h2 id="pick-teams" className="m-0 text-stat leading-stat font-black uppercase">
          Pick the teams
        </h2>
        <TeamPicker label="My team" teams={teams} value={mine.rosterId} disabledId={other.rosterId} onChange={(id) => pickTeam("mine", id)} locked={grading} />
        <TeamPicker label="The other team" teams={teams} value={other.rosterId} disabledId={mine.rosterId} onChange={(id) => pickTeam("other", id)} locked={grading} />
        {myTeam && <PlayerList team={myTeam} picked={mine.picks} onToggle={(p) => togglePick("mine", p)} locked={grading} />}
        {otherTeam && <PlayerList team={otherTeam} picked={other.picks} onToggle={(p) => togglePick("other", p)} locked={grading} />}
        <Button
          className="press h-touch w-full rounded-card px-sp-4 text-lead font-bold"
          disabled={!ready || grading}
          aria-busy={grading || undefined}
          // The arrow drops the click event, so submit reads the trade from the state.
          onClick={() => submit()}
        >
          {grading ? "Grading…" : "Grade the trade"}
        </Button>
        {grading && <GradingStatus />}
        {grade.status === "error" && (
          <div className="flex flex-col gap-sp-3">
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
      {grade.status === "done" && (
        <div ref={resultRef}>
          <AnalyzeResult doc={grade.doc} />
        </div>
      )}
    </>
  );
}
