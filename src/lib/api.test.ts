/**
 * Tests for the API client. fetch is a test stub that returns real Response objects.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchTeams } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchTeams", () => {
  it("fills a missing avatar with null", async () => {
    const body = { teams: [{ roster_id: 1, team: "A", manager: "Ana", players: [] }] };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body))));
    expect((await fetchTeams("pw"))[0].avatar).toBeNull();
  });

  it("throws an ApiError with the status and the Retry-After seconds", async () => {
    const response = new Response(JSON.stringify({ detail: { message: "slow down" } }), {
      status: 429,
      headers: { "Retry-After": "12" },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
    await expect(fetchTeams("pw")).rejects.toMatchObject({ status: 429, message: "slow down", retryAfter: 12 });
    await expect(fetchTeams("pw")).rejects.toBeInstanceOf(ApiError);
  });
});
