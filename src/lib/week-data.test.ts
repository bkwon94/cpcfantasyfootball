/**
 * Tests for the week data loader against the real public/ folder.
 * The week 6 JSON is the fixture, so these tests break if the publish layout changes.
 */
import { describe, expect, it } from "vitest";
import { listWeeks, loadWeek } from "./week-data";

describe("listWeeks", () => {
  it("lists week 6 of 2026 by its folder names", () => {
    expect(listWeeks()).toContainEqual({ season: "2026", week: "week-06" });
  });
});

describe("loadWeek", () => {
  it("reads the week 6 page JSON", () => {
    const page = loadWeek("2026", "week-06");
    expect(page.week).toBe(6);
    expect(page.season).toBe(2026);
    expect(page.pick.sides[0].team.name).toBe("behold the lamb");
    expect(page.avatars["10"]).toBe("avatars/10.jpg");
  });
});
