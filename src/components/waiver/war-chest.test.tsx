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

describe("the sheet", () => {
  it("opens on the top player of the best adds", () => {
    renderBoard();
    expect(within(sheet()).getByRole("heading", { name: "Kenny Gainwell" })).toBeTruthy();
    expect(within(sheet()).getByText("RB · TB · Bye 9")).toBeTruthy();
  });

  it("fills with the facts, the claims as links, the price, and the last like him on a tap of a headshot", () => {
    renderBoard();
    fireEvent.click(within(field()).getByRole("button", { name: "Najee Harris, $14" }));
    const open = within(sheet());
    expect(open.getByRole("heading", { name: "Najee Harris" })).toBeTruthy();
    const facts = within(open.getByRole("list", { name: "Facts" })).getAllByRole("listitem");
    expect(facts).toHaveLength(3);
    expect(facts[0].textContent).toBe("Najee Harris played 71% of snaps and took 6 targets last week, up from 48% and 3");
    const links = within(open.getByRole("list", { name: "Claims" })).getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0].textContent).toBe("Najee Harris took the lead role in practice this week.");
    expect(links[0].getAttribute("href")).toBe("https://sports.yahoo.com/fantasy/najee-harris-waiver");
    expect(open.getByText("Yahoo Fantasy · Backs the board")).toBeTruthy();
    expect(open.getByText("ESPN · Disputes the board")).toBeTruthy();
    expect(open.getByText("$14")).toBeTruthy();
    expect(open.getByText("$14 beats the top rival bid of $13")).toBeTruthy();
    // The last RB to win was Najee Harris himself, for $19 in week 4, by roster 3.
    expect(open.getByText("Last RB won")).toBeTruthy();
    expect(open.getByText("$19")).toBeTruthy();
    expect(open.getByText("Najee Harris, week 4, Lil Fridge")).toBeTruthy();
  });

  it("fills on a tap of a list row, with the trending count in thousands", () => {
    renderBoard();
    fireEvent.click(screen.getByRole("button", { name: /^Trending/ }));
    fireEvent.click(within(rowsOf("Trending")[1]).getByRole("button"));
    const open = within(sheet());
    expect(open.getByRole("heading", { name: "Courtland Sutton" })).toBeTruthy();
    expect(open.getByText("31,877 adds on Sleeper in the last day")).toBeTruthy();
  });

  it("shows no last like him when no claim at the position won", () => {
    renderBoard();
    fireEvent.click(within(field()).getByRole("button", { name: "Chris Godwin, $4" }));
    expect(within(sheet()).queryByText(/^Last WR won/)).toBeNull();
  });

  it("says the experts are out only when the file flag is set", () => {
    renderBoard();
    expect(screen.queryByText("The experts are out this week.")).toBeNull();
    cleanup();
    renderBoard({ ...waiver, experts_missing: true });
    expect(within(sheet()).getByText("The experts are out this week.")).toBeTruthy();
  });
});

describe("the drops bucket", () => {
  it("names the roster that holds each drop and the pool player who beats him", () => {
    renderBoard();
    fireEvent.click(screen.getByRole("button", { name: /^Drops/ }));
    const rows = rowsOf("Drops");
    expect(within(rows[0]).getByText("Austin Ekeler")).toBeTruthy();
    expect(within(rows[0]).getByText("RB · WAS · Bye 12 · On Lil Fridge")).toBeTruthy();
    expect(within(rows[0]).getByText("Kenny Gainwell projects 101.6 more points than Austin Ekeler for the rest of the season")).toBeTruthy();
    expect(within(rows[1]).getByText("TE · CAR · Bye 14 · On Bo Girds")).toBeTruthy();
    // A drop has no price, so his headshot wears no tag.
    expect(within(field()).getByRole("button", { name: "Darren Waller" })).toBeTruthy();
  });

  it("names the roster on the sheet of a drop", () => {
    renderBoard();
    fireEvent.click(screen.getByRole("button", { name: /^Drops/ }));
    fireEvent.click(within(field()).getByRole("button", { name: "Austin Ekeler" }));
    expect(within(sheet()).getByText("On Lil Fridge")).toBeTruthy();
    expect(within(sheet()).queryByText("Bid to win")).toBeNull();
  });
});

describe("the headshots", () => {
  it("shows the Sleeper headshot, and swaps a missing one to the default once", () => {
    renderBoard();
    const img = within(field()).getAllByRole("button")[0].querySelector("img")!;
    expect(img.getAttribute("src")).toBe("https://sleepercdn.com/content/nfl/players/7567.jpg");
    fireEvent.error(img);
    expect(img.getAttribute("src")).toBe("/images/headshot-default.svg");
    // A second error keeps the default, so a missing default file never loops.
    img.setAttribute("src", "broken.svg");
    fireEvent.error(img);
    expect(img.getAttribute("src")).toBe("broken.svg");
  });
});
