/**
 * Tests for the waiver lists. They render the fixture with the week 6 teams and read the two lists.
 * They check what a reader sees, not the class names.
 */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { week6 } from "@/components/week/fixture";
import { waiver } from "./fixture";
import { WaiverList } from "./waiver-list";

afterEach(() => {
  cleanup();
});

function renderFixture() {
  render(<WaiverList board={waiver} teams={week6.teams} avatars={{ "4": "/2026/week-06/avatars/4.jpg" }} />);
}

function rowsOf(name: string) {
  return within(screen.getByRole("list", { name })).getAllByRole("listitem");
}

describe("WaiverList budgets", () => {
  it("shows twelve budgets in budget order, largest first", () => {
    renderFixture();
    const rows = rowsOf("Budgets");
    expect(rows.map((row) => row.textContent?.match(/\$(\d+)/)?.[1])).toEqual(
      ["90", "82", "72", "69", "67", "65", "61", "58", "51", "25", "19", "9"],
    );
  });

  it("joins the team name and the avatar from the week page", () => {
    renderFixture();
    // Roster 4 has the largest budget in the fixture.
    const first = rowsOf("Budgets")[0];
    expect(within(first).getByText("Pukancun on 3")).toBeTruthy();
    expect(first.querySelector("img")?.getAttribute("src")).toBe("/2026/week-06/avatars/4.jpg");
  });
});

describe("WaiverList best adds", () => {
  it("shows the eight players of the bucket in rank order", () => {
    renderFixture();
    const rows = rowsOf("Best adds");
    expect(rows).toHaveLength(8);
    expect(within(rows[0]).getByText("Kenny Gainwell")).toBeTruthy();
    expect(within(rows[7]).getByText("Austin Ekeler")).toBeTruthy();
  });

  it("shows the position, the team, the week projection, and the rest of season projection", () => {
    renderFixture();
    const row = within(rowsOf("Best adds")[0]);
    expect(row.getByText("RB · TB")).toBeTruthy();
    expect(row.getByText("13.4")).toBeTruthy();
    expect(row.getByText("142.6")).toBeTruthy();
  });

  it("shows the bye when the row has one", () => {
    const players = waiver.buckets.best_adds;
    const board = { ...waiver, buckets: { best_adds: [{ ...players[0], bye: 9 }, { ...players[1], bye: null }] } };
    render(<WaiverList board={board} teams={week6.teams} avatars={{}} />);
    const rows = rowsOf("Best adds");
    expect(within(rows[0]).getByText("RB · TB · Bye 9")).toBeTruthy();
    expect(within(rows[1]).getByText("RB · NYG")).toBeTruthy();
  });

  it("shows the Sleeper headshot, and swaps a missing one to the default once", () => {
    renderFixture();
    const img = rowsOf("Best adds")[0].querySelector("img")!;
    expect(img.getAttribute("src")).toBe("https://sleepercdn.com/content/nfl/players/7567.jpg");
    fireEvent.error(img);
    expect(img.getAttribute("src")).toBe("/images/headshot-default.svg");
    // A second error keeps the default, so a missing default file never loops.
    img.setAttribute("src", "broken.svg");
    fireEvent.error(img);
    expect(img.getAttribute("src")).toBe("broken.svg");
  });
});
