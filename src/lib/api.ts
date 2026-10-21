/**
 * The client for the site API. Each call sends the league passphrase in the X-League-Passphrase header.
 * A failed call throws an ApiError, and the caller decides what the reader sees.
 */
import type { AnalyzeResponse } from "@/lib/analyze-types";
import { apiUrl, season } from "@/lib/config";

export type TeamPlayer = {
  player_id: string;
  name: string;
  position: string;
  nfl_team: string;
  headshot: string;
};

export type Team = {
  roster_id: number;
  team: string;
  manager: string;
  // The live API may not send the avatar yet, so fetchTeams fills a missing field with null.
  avatar: string | null;
  players: TeamPlayer[];
};

export class ApiError extends Error {
  readonly status: number;
  // Seconds to wait, from the Retry-After header of a 429.
  readonly retryAfter?: number;

  constructor(status: number, message: string, retryAfter?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

/* A 422 body is { detail: string } or { detail: { message } }. Other bodies fall back to the status text. */
async function errorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    const detail = body?.detail;
    if (typeof detail === "string") return detail;
    if (typeof detail?.message === "string") return detail.message;
  } catch {
    // The body is not JSON. Use the status text.
  }
  return response.statusText || `Request failed with status ${response.status}`;
}

/* Builds the ApiError for a failed response. Every call of the client uses it. */
export async function toApiError(response: Response): Promise<ApiError> {
  const retryAfter = Number(response.headers.get("Retry-After"));
  return new ApiError(
    response.status,
    await errorMessage(response),
    Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
  );
}

/* The text of a 429. The wait is optional, because the Retry-After header may be missing. */
export function retryText(seconds?: number): string {
  return `Too many requests. ${seconds ? `Try again in ${seconds} seconds.` : "Try again soon."}`;
}

export async function fetchTeams(passphrase: string): Promise<Team[]> {
  const response = await fetch(`${apiUrl}/teams?season=${season}`, {
    headers: { "X-League-Passphrase": passphrase },
  });
  if (!response.ok) throw await toApiError(response);
  const body = (await response.json()) as { teams: (Omit<Team, "avatar"> & { avatar?: string | null })[] };
  return body.teams.map((team) => ({ ...team, avatar: team.avatar ?? null }));
}

/* One side of the trade: a roster and the player ids it gives. */
export type AnalyzeSide = { roster_id: number; gives: string[] };

export type AnalyzeRequest = {
  season: number;
  // The asker's side comes first.
  sides: [AnalyzeSide, AnalyzeSide];
  // The roster id of the team that asks for the grade.
  asker: number;
};

/* The caller owns the AbortSignal, because a cold week can take 20 seconds and the caller sets the timeout. */
export async function postAnalyze(
  passphrase: string,
  body: AnalyzeRequest,
  signal: AbortSignal,
): Promise<AnalyzeResponse> {
  const response = await fetch(`${apiUrl}/analyze`, {
    method: "POST",
    headers: { "X-League-Passphrase": passphrase, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as AnalyzeResponse;
}
