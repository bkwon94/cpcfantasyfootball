/**
 * The client for the site API. Each call sends the league passphrase in the X-League-Passphrase header.
 * A failed call throws an ApiError, and the caller decides what the reader sees.
 */
import type { AnalyzeResponse, FindResponse } from "@/lib/analyze-types";
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

// A wait longer than this reads in hours, because 50000 seconds means nothing to a reader.
const HOUR_SECONDS = 3600;

/* The wait as plain words. Hours round up, so the reader never tries again too early. Over an hour rounds up to 2 or more. */
function waitText(seconds: number): string {
  if (seconds <= HOUR_SECONDS) return `Try again in ${seconds} seconds.`;
  return `Try again in ${Math.ceil(seconds / HOUR_SECONDS)} hours.`;
}

/* The text of a 429. The wait is optional, because the Retry-After header may be missing. */
export function retryText(seconds?: number): string {
  return `Too many requests. ${seconds ? waitText(seconds) : "Try again soon."}`;
}

/* What the reader sees for a failed call, and whether a retry button shows. */
export type ErrorView = { message: string; retry: boolean };

/* Maps a failed call to what the reader sees. The trade form and the finder share it, so the same failure reads the same on both.
   A timeout and an unknown failure offer a retry. The caller words the timeout line, because it names the work that ran long. */
export function toErrorLine(error: unknown, timedOut: boolean, timeoutMessage: string): ErrorView {
  if (timedOut) return { message: timeoutMessage, retry: true };
  if (error instanceof ApiError) {
    if (error.status === 422) return { message: error.message, retry: false };
    if (error.status === 429) return { message: retryText(error.retryAfter), retry: false };
    if (error.status === 503) return { message: "No grade this week yet. The chart is not on the server.", retry: false };
  }
  return { message: "The API did not answer. Try again.", retry: true };
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

/* Posts a JSON body with the passphrase and reads the JSON answer. The caller owns the AbortSignal and sets the timeout. */
async function postJson<T>(path: string, passphrase: string, body: unknown, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers: { "X-League-Passphrase": passphrase, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as T;
}

/* The caller owns the AbortSignal, because a cold week can take 20 seconds and the caller sets the timeout. */
export function postAnalyze(passphrase: string, body: AnalyzeRequest, signal: AbortSignal): Promise<AnalyzeResponse> {
  return postJson("/analyze", passphrase, body, signal);
}

/* The body of the find route: the season, the roster that asks, and the partner roster. */
export type FindRequest = { season: number; asker: number; partner: number };

/* The finder grades every small swap of the pair, so a cold call can be slow. The caller owns the AbortSignal, as with postAnalyze. */
export function postFind(passphrase: string, body: FindRequest, signal: AbortSignal): Promise<FindResponse> {
  return postJson("/find", passphrase, body, signal);
}
