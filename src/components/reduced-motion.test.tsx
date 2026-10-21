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

const TEAMS: Team[] = [
  { roster_id: 4, team: "Pukancun on 3", manager: "Ana", avatar: null, players: [] },
  { roster_id: 12, team: "Blitz Bakers", manager: "Ben", avatar: null, players: [] },
];

/* An element at rest has no opacity below 1 and no offset. The style is what Framer Motion writes on the first render. */
function atRest(element: HTMLElement) {
  expect(element.style.opacity === "" || element.style.opacity === "1").toBe(true);
  expect(element.style.transform === "" || element.style.transform === "none").toBe(true);
}

afterEach(cleanup);
afterAll(() => {
  vi.unstubAllGlobals();
});

describe("Reduced motion", () => {
  it("shows both grade letters at rest at once", () => {
    render(<Ledger doc={fixtureJson as AnalyzeResponse} />);
    const headers = screen.getAllByRole("columnheader");
    atRest(within(headers[1]).getByText("B"));
    atRest(within(headers[2]).getByText("C"));
  });

  it("collapses a picked team at once", () => {
    render(<TradeForm teams={TEAMS} passphrase="localtest" onUnauthorized={() => {}} />);
    const mine = screen.getByRole("group", { name: "My team" });
    fireEvent.click(within(mine).getByRole("radio", { name: /Pukancun on 3/ }));
    expect(within(mine).getAllByRole("radio")).toHaveLength(1);
    const button = within(mine).getByRole("button", { name: "Change my team" });
    atRest(button.closest<HTMLElement>(".overflow-hidden")!);
  });
});
