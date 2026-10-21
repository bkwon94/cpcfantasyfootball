/**
 * The trade form: the two team pickers, the two player lists, the submit button, and the result.
 * It owns the picks and the grade state, and it posts the trade to the analyze route.
 */
"use client";

import { useRef, useState } from "react";
import Ledger from "@/components/ledger";
import { ErrorLine } from "@/components/error-line";
import { PlayerList } from "@/components/player-list";
import { TeamPicker } from "@/components/team-picker";
import { Button } from "@/components/ui/button";
import type { AnalyzeResponse } from "@/lib/analyze-types";
import { ApiError, postAnalyze, type Team } from "@/lib/api";
import { season } from "@/lib/config";

// A cold chart week takes 20 seconds or more, so 30 seconds leaves room before the page gives up.
const TIMEOUT_MS = 30_000;

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
};

/* Maps a failed call to what the reader sees. A timeout and an unknown failure offer a retry. */
function toGradeError(error: unknown, timedOut: boolean): GradeState & { status: "error" } {
  if (timedOut) return { status: "error", message: "The grade took too long.", retry: true };
  if (error instanceof ApiError) {
    if (error.status === 422) return { status: "error", message: error.message, retry: false };
    if (error.status === 429) {
      const wait = error.retryAfter ? `Try again in ${error.retryAfter} seconds.` : "Try again soon.";
      return { status: "error", message: `Too many requests. ${wait}`, retry: false };
    }
    if (error.status === 503) {
      return { status: "error", message: "No grade this week yet. The chart is not on the server.", retry: false };
    }
  }
  return { status: "error", message: "The API did not answer. Try again.", retry: true };
}

export function TradeForm({ teams, passphrase, onUnauthorized }: TradeFormProps) {
  const [mine, setMine] = useState<number | null>(null);
  const [other, setOther] = useState<number | null>(null);
  const [minePicks, setMinePicks] = useState<string[]>([]);
  const [otherPicks, setOtherPicks] = useState<string[]>([]);
  const [grade, setGrade] = useState<GradeState>({ status: "idle" });
  // A late answer from an old trade must not overwrite the state of a new one.
  const runId = useRef(0);

  const myTeam = teams.find((t) => t.roster_id === mine);
  const otherTeam = teams.find((t) => t.roster_id === other);
  const ready = minePicks.length > 0 && otherPicks.length > 0;
  const grading = grade.status === "grading";

  // A new team makes the old picks and the old result stale, so a change clears them.
  function pickMine(id: number) {
    runId.current += 1;
    setMine(id);
    setMinePicks([]);
    setGrade({ status: "idle" });
  }

  function pickOther(id: number) {
    runId.current += 1;
    setOther(id);
    setOtherPicks([]);
    setGrade({ status: "idle" });
  }

  const toggle = (picks: string[], id: string) => (picks.includes(id) ? picks.filter((p) => p !== id) : [...picks, id]);

  async function submit() {
    if (mine === null || other === null || !ready) return;
    const id = ++runId.current;
    const controller = new AbortController();
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
          season,
          sides: [
            { roster_id: mine, gives: minePicks },
            { roster_id: other, gives: otherPicks },
          ],
          asker: mine,
        },
        controller.signal,
      );
      if (id === runId.current) setGrade({ status: "done", doc });
    } catch (error) {
      if (id !== runId.current) return;
      if (error instanceof ApiError && error.status === 401) onUnauthorized();
      else setGrade(toGradeError(error, timedOut));
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
        <TeamPicker label="My team" teams={teams} value={mine} disabledId={other} onChange={pickMine} />
        <TeamPicker label="The other team" teams={teams} value={other} disabledId={mine} onChange={pickOther} />
        {myTeam && <PlayerList team={myTeam} picked={minePicks} onToggle={(p) => setMinePicks(toggle(minePicks, p))} />}
        {otherTeam && (
          <PlayerList team={otherTeam} picked={otherPicks} onToggle={(p) => setOtherPicks(toggle(otherPicks, p))} />
        )}
        <Button
          className="press h-touch w-full rounded-card px-sp-4 text-lead font-bold"
          disabled={!ready || grading}
          onClick={submit}
        >
          Grade the trade
        </Button>
        {grading && (
          <div role="status" className="flex flex-col gap-sp-1">
            <p className="m-0 text-body font-bold">Grading the trade</p>
            <p className="m-0 text-meta text-mute">This can take about 20 seconds.</p>
          </div>
        )}
        {grade.status === "error" && (
          <div className="flex flex-col items-start gap-sp-3">
            <ErrorLine>{grade.message}</ErrorLine>
            {grade.retry && (
              <Button className="press h-touch rounded-card px-sp-4 text-lead font-bold" onClick={submit}>
                Try again
              </Button>
            )}
          </div>
        )}
      </section>
      {grade.status === "done" && <Ledger doc={grade.doc} />}
    </>
  );
}
