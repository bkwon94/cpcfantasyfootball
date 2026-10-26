/**
 * Tests for the stats-through sentence that the analyze page and the finder page share.
 * The cases follow the as-of block of the result document.
 */
import { describe, expect, it } from "vitest";
import type { AsOf } from "./analyze-types";
import { knownGamesLine } from "./known-games-line";

const base: AsOf = { chart_week: 7, stats_through: 6, rosters_fetched: "2026-10-26T09:30:00-04:00" };
const known = (over: Partial<NonNullable<AsOf["known_games"]>>): AsOf => ({
  ...base,
  known_games: { week: 7, games: 13, in_progress: 0, pending: {}, ...over },
});

describe("knownGamesLine", () => {
  it("shows the stats week alone when the document has no block", () => {
    expect(knownGamesLine(base)).toBe("Stats through week 6");
  });

  it("shows the stats week alone when the block is null", () => {
    expect(knownGamesLine({ ...base, known_games: null })).toBe("Stats through week 6");
  });

  it("shows the stats week alone when no games are read", () => {
    expect(knownGamesLine(known({ games: 0 }))).toBe("Stats through week 6");
  });

  it("stops after the games count when nothing is in progress or pending", () => {
    expect(knownGamesLine(known({}))).toBe("Stats through week 6, plus 13 week 7 games.");
  });

  it("uses the singular for one game", () => {
    expect(knownGamesLine(known({ games: 1 }))).toBe("Stats through week 6, plus 1 week 7 game.");
  });

  it("adds the in-progress count", () => {
    expect(knownGamesLine(known({ in_progress: 2 }))).toBe("Stats through week 6, plus 13 week 7 games, 2 in progress.");
  });

  it("adds one sentence per pending name", () => {
    const line = knownGamesLine(known({ in_progress: 2, pending: { snaps: 9, WOPR: 1 } }));
    expect(line).toBe(
      "Stats through week 6, plus 13 week 7 games, 2 in progress. Snaps pending for 9 games. WOPR pending for 1 game.",
    );
  });
});
