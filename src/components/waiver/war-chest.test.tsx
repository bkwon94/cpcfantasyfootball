/**
 * Tests for the War chest waiver page. They render the fixture with the week 6 teams and read what a reader sees.
 * jsdom applies no CSS and runs no animation, so the size and the drift tests read an inline style and a data attribute.
 */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { week6 } from "@/components/week/fixture";
import type { WaiverBoard } from "@/lib/waiver-types";
import { waiver } from "./fixture";
import { WarChest } from "./war-chest";

afterEach(() => {
  cleanup();
});

function renderBoard(board: WaiverBoard = waiver) {
  render(<WarChest board={board} teams={week6.teams} avatars={{ "4": "/2026/week-06/avatars/4.jpg" }} />);
}

function rowsOf(name: string) {
  return within(screen.getByRole("list", { name })).getAllByRole("listitem");
}

function field() {
  return screen.getByRole("group", { name: "Top six" });
}

function sheet() {
  return screen.getByRole("region", { name: "Player sheet" });
}

describe("the budget ring", () => {
  it("shows twelve budgets in budget order, largest first", () => {
    renderBoard();
    const rows = rowsOf("Budgets");
    expect(rows.map((row) => row.textContent?.match(/\$(\d+)/)?.[1])).toEqual(
      ["90", "82", "72", "69", "67", "65", "61", "58", "51", "25", "19", "9"],
    );
  });

  it("names the team and shows its avatar, with no bar in red when no team is picked", () => {
    renderBoard();
    const first = rowsOf("Budgets")[0];
    expect(within(first).getByText("Pukancun on 3")).toBeTruthy();
    expect(first.querySelector("img")?.getAttribute("src")).toBe("/2026/week-06/avatars/4.jpg");
    for (const row of rowsOf("Budgets")) {
      expect(row.querySelector("[data-viewer]")).toBeNull();
    }
  });
});

describe("the bucket tabs", () => {
  it("shows one tab per bucket in the file, with the count", () => {
    renderBoard();
    const tabs = within(screen.getByRole("group", { name: "Buckets" })).getAllByRole("button");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Best adds8", "Trending7", "Sneaky3", "Stashes2", "Drops2"]);
    expect(tabs[0].getAttribute("aria-pressed")).toBe("true");
  });

  it("switches the bucket, and the sheet keeps its player", () => {
    renderBoard();
    fireEvent.click(within(field()).getByRole("button", { name: /Courtland Sutton/ }));
    expect(within(sheet()).getByRole("heading", { name: "Courtland Sutton" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /^Stashes/ }));
    expect(screen.getByRole("button", { name: /^Stashes/ }).getAttribute("aria-pressed")).toBe("true");
    expect(within(rowsOf("Stashes")[0]).getByText("Mark Andrews")).toBeTruthy();
    // Courtland Sutton is not a stash, and the sheet still holds him.
    expect(within(sheet()).getByRole("heading", { name: "Courtland Sutton" })).toBeTruthy();
  });
});

describe("the drift field", () => {
  it("shows the top six of the bucket, sized by rank, each with its price", () => {
    renderBoard();
    const orbs = within(field()).getAllByRole("button");
    expect(orbs).toHaveLength(6);
    expect(orbs.map((orb) => orb.getAttribute("aria-label"))).toEqual([
      "Kenny Gainwell, $23",
      "Najee Harris, $14",
      "Mark Andrews, $8",
      "Audric Estime, $6",
      "Chris Godwin, $4",
      "Courtland Sutton, $3",
    ]);
    expect(within(orbs[0]).getByText("$23")).toBeTruthy();
    const sizes = orbs.map((orb) => orb.querySelector("img")!.style.width);
    expect(sizes).toEqual(["88px", "64px", "64px", "52px", "52px", "52px"]);
  });

  it("drifts with motion on, and stops when the document is hidden", () => {
    renderBoard();
    expect(field().getAttribute("data-drift")).toBe("on");
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(field().getAttribute("data-drift")).toBe("off");
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(field().getAttribute("data-drift")).toBe("on");
  });
});
