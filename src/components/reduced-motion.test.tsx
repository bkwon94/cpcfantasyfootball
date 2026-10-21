/**
 * Tests for the analyzer with the reduced-motion media query on. The content must show at rest at once.
 * matchMedia is a stub, and it must exist before Framer Motion first reads it, so the stub runs at the top of the file.
 */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import fixtureJson from "../../.scratch/site-react/fixtures/analyze-response.json";
import type { AnalyzeResponse } from "@/lib/analyze-types";
import type { Team } from "@/lib/api";
import Ledger from "./ledger";
import { TradeForm } from "./trade-form";

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
  it("shows both grade letters at once", () => {
    render(<Ledger doc={fixtureJson as AnalyzeResponse} />);
    const headers = screen.getAllByRole("columnheader");
    expect(within(headers[1]).getByText("B")).toBeTruthy();
    expect(within(headers[2]).getByText("C")).toBeTruthy();
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
