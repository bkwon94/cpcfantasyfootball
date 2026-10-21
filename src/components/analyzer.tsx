/**
 * The analyzer page body: the passphrase dialog, the teams fetch, and the two team pickers.
 * It keeps the chosen roster ids in state, and the trade form reads them.
 */
"use client";

import { useEffect, useState } from "react";
import { PassphraseDialog } from "@/components/passphrase-dialog";
import { TeamPicker } from "@/components/team-picker";
import { Button } from "@/components/ui/button";
import { ApiError, fetchTeams, type Team } from "@/lib/api";
import { clearPassphrase, getPassphrase, setPassphrase } from "@/lib/passphrase";

type TeamsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; teams: Team[] }
  | { status: "rate-limited"; retryAfter?: number }
  | { status: "failed" };

const WRONG_PASSPHRASE = "That passphrase is wrong.";

export function Analyzer() {
  // Undefined until the effect reads storage. Local storage does not exist during the static build.
  const [passphrase, setPassphraseState] = useState<string | null | undefined>(undefined);
  const [authError, setAuthError] = useState<string | undefined>();
  const [teams, setTeams] = useState<TeamsState>({ status: "idle" });
  // A new value starts the fetch again, for the retry button.
  const [attempt, setAttempt] = useState(0);
  const [mine, setMine] = useState<number | null>(null);
  const [other, setOther] = useState<number | null>(null);

  useEffect(() => {
    setPassphraseState(getPassphrase());
  }, []);

  useEffect(() => {
    if (!passphrase) return;
    // A stale answer must not overwrite the state after a new submit or an unmount.
    let current = true;
    setTeams({ status: "loading" });
    fetchTeams(passphrase)
      .then((list) => current && setTeams({ status: "ready", teams: list }))
      .catch((error: unknown) => {
        if (!current) return;
        if (error instanceof ApiError && error.status === 401) {
          clearPassphrase();
          setPassphraseState(null);
          setAuthError(WRONG_PASSPHRASE);
          setTeams({ status: "idle" });
        } else if (error instanceof ApiError && error.status === 429) {
          setTeams({ status: "rate-limited", retryAfter: error.retryAfter });
        } else {
          setTeams({ status: "failed" });
        }
      });
    return () => {
      current = false;
    };
  }, [passphrase, attempt]);

  function handleSubmit(value: string) {
    setPassphrase(value);
    setAuthError(undefined);
    setPassphraseState(value);
  }

  return (
    <div className="px-gutter py-sp-5">
      <PassphraseDialog open={passphrase === null} error={authError} onSubmit={handleSubmit} />
      {teams.status === "loading" && <p className="m-0 text-body text-mute">Loading teams</p>}
      {teams.status === "rate-limited" && (
        <p role="alert" className="m-0 text-body font-bold text-red">
          {teams.retryAfter
            ? `Too many requests. Try again in ${teams.retryAfter} seconds.`
            : "Too many requests. Try again soon."}
        </p>
      )}
      {teams.status === "failed" && (
        <div className="flex flex-col items-start gap-sp-3">
          <p role="alert" className="m-0 text-body font-bold text-red">
            The API did not answer. Try again.
          </p>
          <Button className="press h-touch rounded-card px-sp-4 text-lead font-bold" onClick={() => setAttempt((n) => n + 1)}>
            Try again
          </Button>
        </div>
      )}
      {teams.status === "ready" && (
        <section aria-labelledby="pick-teams" className="flex flex-col gap-sp-5">
          <h2 id="pick-teams" className="m-0 text-stat leading-stat font-black uppercase">
            Pick the teams
          </h2>
          <TeamPicker label="My team" teams={teams.teams} value={mine} disabledId={other} onChange={setMine} />
          <TeamPicker label="The other team" teams={teams.teams} value={other} disabledId={mine} onChange={setOther} />
        </section>
      )}
    </div>
  );
}
