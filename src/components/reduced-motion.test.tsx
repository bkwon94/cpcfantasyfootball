/**
 * Tests for the analyzer, the week page, the home page, the power rankings, and the waiver page with the reduced-motion media query on. The content must show at rest at once.
 * matchMedia is a stub, and it must exist before Framer Motion first reads it, so the stub runs at the top of the file.
 * jsdom ignores opacity, so this test proves the text is present. The browser capture 12-week-off-390.png proves no motion.
 */
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import fixtureJson from "../../.scratch/site-react/fixtures/analyze-response.json";
import HomePage from "@/app/page";
import WeekPage from "@/app/[season]/[week]/page";
import type { AnalyzeResponse } from "@/lib/analyze-types";
import type { Team } from "@/lib/api";
import AnalyzeResult from "./analyze-result";
import { rankings } from "./rankings/fixture";
import { PowerRankings } from "./rankings/power-rankings";
import { TradeForm } from "./trade-form";
import { waiver } from "./waiver/fixture";
import { WarChest } from "./waiver/war-chest";
import { week6 } from "./week/fixture";

vi.stubGlobal(
  "matchMedia",
  (query: string) =>
    ({
      // Framer Motion asks for "(prefers-reduced-motion)" with no value, so the stub matches the feature name.
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList,
);

const player = (id: string, name: string) => ({
  player_id: id,
  name,
  position: "WR",
  nfl_team: "NYJ",
  headshot: `https://cdn.test/${id}.png`,
});

const TEAMS: Team[] = [
  { roster_id: 4, team: "Pukancun on 3", manager: "Ana", avatar: null, players: [player("p1", "Ana One")] },
  { roster_id: 12, team: "Blitz Bakers", manager: "Ben", avatar: null, players: [player("p3", "Ben One")] },
];

afterEach(cleanup);
afterAll(() => {
  vi.unstubAllGlobals();
});

describe("Reduced motion", () => {
  it("shows the decision word at once", () => {
    render(<AnalyzeResult doc={fixtureJson as AnalyzeResponse} />);
    expect(screen.getByText("Not as is")).toBeTruthy();
  });

  it("shows the fairness line at once", () => {
    // The state is set here, so the test does not depend on the fixture state.
    const doc = fixtureJson as AnalyzeResponse;
    render(<AnalyzeResult doc={{ ...doc, fairness: { ...doc.fairness!, state: "fair", gives_more: null } }} />);
    expect(screen.getByText("Fair")).toBeTruthy();
  });

  it("collapses a picked team at once", () => {
    render(<TradeForm teams={TEAMS} passphrase="localtest" onUnauthorized={() => {}} />);
    const mine = screen.getByRole("group", { name: "My team" });
    fireEvent.click(within(mine).getByRole("radio", { name: /Pukancun on 3/ }));
    expect(within(mine).getAllByRole("radio")).toHaveLength(1);
  });

  it("shows no sweep while the grade runs", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<TradeForm teams={TEAMS} passphrase="localtest" onUnauthorized={() => {}} />);
    fireEvent.click(within(screen.getByRole("group", { name: "My team" })).getByRole("radio", { name: /Pukancun on 3/ }));
    fireEvent.click(within(screen.getByRole("group", { name: "The other team" })).getByRole("radio", { name: /Blitz Bakers/ }));
    fireEvent.click(screen.getByLabelText(/Ana One/));
    fireEvent.click(screen.getByLabelText(/Ben One/));
    fireEvent.click(screen.getByRole("button", { name: "Grade the trade" }));
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-busy")).toBe("true");
    // The track is aria-hidden, so the query must include hidden elements to find the sweep if it existed.
    expect(within(status).queryByRole("presentation", { hidden: true })).toBeNull();
  });
});

describe("Reduced motion on the power rankings", () => {
  it("opens a row at once, with no transition class on the open state", async () => {
    render(<PowerRankings weeks={rankings.weeks} avatars={week6.avatars} />);
    const button = screen.getByRole("button", { name: "More on Lil Fridge" });
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const panel = document.getElementById(button.getAttribute("aria-controls") ?? "")!;
    expect(panel.getAttribute("aria-hidden")).toBe("false");
    // With motion off the panel takes the instant transition, so it is at rest and fully open by the next frame.
    // The wait is far shorter than the collapse duration, so a real animation fails it.
    await waitFor(
      () => {
        expect(panel.style.opacity).toBe("1");
        expect(panel.style.height).toBe("auto");
      },
      { timeout: 50 },
    );
    // The chevron is the one CSS transition of the row. With motion off it carries no transition class.
    expect(button.querySelector("span")!.className).not.toMatch(/\btransition-/);
  });
});

describe("Reduced motion on the waiver page", () => {
  it("turns the drift off and shows the top six at once", () => {
    render(<WarChest board={waiver} teams={week6.teams} avatars={week6.avatars} />);
    const field = screen.getByRole("group", { name: "Top six" });
    expect(field.getAttribute("data-drift")).toBe("off");
    expect(within(field).getAllByRole("button")).toHaveLength(6);
    // With motion off a headshot takes no rise, so it sits at rest with no transform from the first render.
    for (const orb of field.querySelectorAll("[data-reveal]")) {
      expect((orb as HTMLElement).style.transform).not.toMatch(/translate/);
    }
  });
});

describe("Reduced motion on the static pages", () => {
  it("shows every week page chapter at once", async () => {
    render(await WeekPage({ params: Promise.resolve({ season: "2026", week: "week-06" }) }));
    // One line from each chapter, from the top story to next week. The text must be there on the first render.
    // The chapter rail repeats the chapter labels, so the queries stay inside the page column.
    const main = within(screen.getByRole("main"));
    expect(main.getByText("Matchup of the Week")).toBeTruthy();
    expect(main.getByText("Game Changer")).toBeTruthy();
    expect(main.getByText("WR · PIT · behold the lamb")).toBeTruthy();
    expect(main.getAllByText(week6.awards[0].title).length).toBeGreaterThan(0);
    expect(main.getByText("Position Leaders")).toBeTruthy();
    expect(main.getAllByText(week6.trades[0].sides[0].players[0].name).length).toBeGreaterThan(0);
    expect(main.getAllByRole("button", { name: /Read Recap/ })).toHaveLength(week6.matchups.length);
    expect(main.getByText("The Median Game")).toBeTruthy();
    expect(main.getByText("Standings")).toBeTruthy();
    expect(main.getByText(`Next Week · Week ${week6.week + 1}`)).toBeTruthy();
  });

  it("shows every home page row at once", () => {
    render(<HomePage />);
    expect(screen.getByRole("link", { name: /Week 6/ })).toBeTruthy();
    expect(screen.getByText("Oct 15 – Oct 19, 2026")).toBeTruthy();
  });
});
