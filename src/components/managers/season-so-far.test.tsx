/**
 * Tests for the Season So Far chapter. They render fixture entries and spread variants of them.
 * They read the dots and the week labels of the points line, the bench lines, and the four counts of the awards shelf.
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Manager } from "@/lib/manager-types";
import fixture from "./fixture.json";
import { SeasonSoFar } from "./season-so-far";

afterEach(() => {
  cleanup();
});

/* A fixture entry with the joined fields of the loader. The chapter reads none of them. */
function managerOf(index: number, change: Partial<Manager> = {}): Manager {
  const entry = fixture.managers[index] as Manager;
  return { ...entry, standing: 1, rank: null, movement: null, odds: null, odds_change: null, ...change };
}

/* The dots of the points line by the result each one names. */
function dots(result?: string) {
  const line = screen.getByRole("img", { name: "Points per week against the league median" });
  return line.querySelectorAll(result ? `[data-result="${result}"]` : "[data-result]");
}

/* The label and the count of each award, as a reader reads them. */
function shelf() {
  const group = screen.getByRole("group", { name: "Awards Shelf" });
  return [...group.querySelectorAll("dt")].map((term) => [term.textContent, term.nextElementSibling?.textContent]);
}

describe("SeasonSoFar", () => {
  it("shows the chapter heading", () => {
    render(<SeasonSoFar manager={managerOf(0)} />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Season So Far");
  });

  it("draws one dot per week, filled for each win", () => {
    // Brock 'N' Roll won weeks 1 and 5 and lost the other four.
    render(<SeasonSoFar manager={managerOf(0)} />);
    expect(dots()).toHaveLength(6);
    expect(dots("win")).toHaveLength(2);
    expect(dots("loss")).toHaveLength(4);
  });

  it("marks a week with no result apart from a win and a loss", () => {
    const manager = managerOf(0);
    const weeks = manager.weeks.map((week) => (week.week === 3 ? { ...week, won: null } : week));
    render(<SeasonSoFar manager={{ ...manager, weeks }} />);
    expect(dots("none")).toHaveLength(1);
    expect(dots("loss")).toHaveLength(3);
  });

  it("labels the first and the last week only, with one quiet line under the chart", () => {
    render(<SeasonSoFar manager={managerOf(0)} />);
    expect(screen.getByText("Week 1")).toBeTruthy();
    expect(screen.getByText("Week 6")).toBeTruthy();
    expect(screen.queryByText("Week 2")).toBeNull();
    expect(screen.getByText("Points per week against the league median.")).toBeTruthy();
  });

  it("gives the points line a short summary for a screen reader", () => {
    render(<SeasonSoFar manager={managerOf(0)} />);
    const line = screen.getByRole("img", { name: "Points per week against the league median" });
    expect(line.textContent).toContain("Weeks 1 to 6: 2 wins, 4 losses.");
  });

  it("shows the bench total and the worst week with the player that sat", () => {
    render(<SeasonSoFar manager={managerOf(0)} />);
    expect(screen.getByText("On The Bench")).toBeTruthy();
    expect(screen.getByText("46.54")).toBeTruthy();
    expect(screen.getByText("Worst in week 2: 19.4 points, Stefon Diggs sat.")).toBeTruthy();
  });

  it("reads no points left on the bench with no worst week", () => {
    render(<SeasonSoFar manager={managerOf(0, { bench: { total: 0, worst: null } })} />);
    expect(screen.getByText("No points left on the bench.")).toBeTruthy();
    expect(screen.queryByText(/^Worst in week/)).toBeNull();
  });

  it("reads one quiet line with no bench data", () => {
    render(<SeasonSoFar manager={managerOf(0, { bench: null })} />);
    expect(screen.getByText("No bench data yet.")).toBeTruthy();
    expect(screen.queryByText("46.54")).toBeNull();
  });

  it("shows the four award counts, zeros too", () => {
    // Unsolicited Dak Picks won one Most Valuable Benchwarmer and one Game Changer.
    render(<SeasonSoFar manager={managerOf(10)} />);
    expect(shelf()).toEqual([
      ["Top Scorer", "0"],
      ["Benchwarmer", "1"],
      ["Game Changer", "1"],
      ["Underperformer", "0"],
    ]);
    expect(within(screen.getByRole("group", { name: "Awards Shelf" })).getByTitle("Most Valuable Benchwarmer").textContent).toBe(
      "Benchwarmer",
    );
  });
});
