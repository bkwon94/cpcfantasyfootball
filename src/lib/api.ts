/**
 * The client for the site API. Each call sends the league passphrase in the X-League-Passphrase header.
 * A failed call throws an ApiError, and the caller decides what the reader sees.
 */
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

export async function fetchTeams(passphrase: string): Promise<Team[]> {
  const response = await fetch(`${apiUrl}/teams?season=${season}`, {
    headers: { "X-League-Passphrase": passphrase },
  });
  if (!response.ok) throw await toApiError(response);
  const body = (await response.json()) as { teams: (Omit<Team, "avatar"> & { avatar?: string | null })[] };
  return body.teams.map((team) => ({ ...team, avatar: team.avatar ?? null }));
}
