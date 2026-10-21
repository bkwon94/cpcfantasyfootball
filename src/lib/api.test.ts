/**
 * Tests for the API client. fetch is a test stub that returns real Response objects.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchTeams, toApiError } from "./api";

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

describe("toApiError", () => {
  it("reads Retry-After from a 429", async () => {
    const response = new Response("{}", { status: 429, headers: { "Retry-After": "7" } });
    expect(await toApiError(response)).toMatchObject({ status: 429, retryAfter: 7 });
  });

  it("reads the message from a 422 object detail", async () => {
    const response = new Response(JSON.stringify({ detail: { message: "bad trade" } }), { status: 422 });
    const error = await toApiError(response);
    expect(error).toMatchObject({ status: 422, message: "bad trade" });
    expect(error.retryAfter).toBeUndefined();
  });
});
