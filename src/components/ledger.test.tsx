/**
 * Tests for the ledger result. The API fixture document is the one input, and each test reads the screen.
 * They check what a reader sees, not the class names.
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import fixtureJson from "../../.scratch/site-react/fixtures/analyze-response.json";
import type { AnalyzeResponse } from "@/lib/analyze-types";
import Ledger from "./ledger";

const fixture = fixtureJson as AnalyzeResponse;

afterEach(() => {
  cleanup();
});

describe("Ledger", () => {
  it("shows both teams, your side, and the final letter per side in the table header", () => {
    render(<Ledger doc={fixture} />);
    const headers = screen.getAllByRole("columnheader");
    expect(headers[0].textContent).toBe("Adjuster");
    expect(headers[1].textContent).toContain("Pukancun on 3");
    expect(within(headers[1]).getByText("Your side")).toBeTruthy();
    expect(within(headers[1]).getByText("B")).toBeTruthy();
    expect(headers[2].textContent).toContain("Amon-Ra Dawg Your Team");
    expect(within(headers[2]).queryByText("Your side")).toBeNull();
    expect(within(headers[2]).getByText("C")).toBeTruthy();
  });

  it("puts the asker's letter before the other side's letter in document order", () => {
    render(<Ledger doc={fixture} />);
    const [asker] = screen.getAllByText("B");
    const [other] = screen.getAllByText("C");
    expect(asker.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows a row for every adjuster with its reason per side", () => {
    render(<Ledger doc={fixture} />);
    for (const name of ["roster fit", "standing", "trend and usage", "injury", "handcuff", "schedule"]) {
      expect(screen.getByRole("rowheader", { name })).toBeTruthy();
    }
    for (const side of fixture.sides) {
      for (const adjuster of side.adjusters) {
        expect(screen.getAllByText(adjuster.reason).length).toBeGreaterThan(0);
      }
    }
    expect(screen.getByText("up one step")).toBeTruthy();
  });

  it("shows the lean when an adjuster has one", () => {
    render(<Ledger doc={fixture} />);
    expect(screen.getByText("leans against")).toBeTruthy();
    expect(screen.getByText("leans for")).toBeTruthy();
  });

  it("shows the players each side gets in the swap card", () => {
    render(<Ledger doc={fixture} />);
    expect(screen.getByText("You get")).toBeTruthy();
    expect(screen.getByText("Gets")).toBeTruthy();
    expect(screen.getByText("Dalton Kincaid")).toBeTruthy();
    expect(screen.getByText("Garrett Wilson")).toBeTruthy();
    expect(screen.getByText("Nico Collins")).toBeTruthy();
  });

  it("shows the analysis per side", () => {
    render(<Ledger doc={fixture} />);
    expect(screen.getByText("Pukancun on 3 · your side")).toBeTruthy();
    expect(screen.getAllByText("Nico Collins leads the trade in points per game.")).toHaveLength(2);
  });

  it("shows the verdict for the asker", () => {
    render(<Ledger doc={fixture} />);
    expect(screen.getByText("Verdict for Pukancun on 3")).toBeTruthy();
    expect(screen.getByText("Counter")).toBeTruthy();
    expect(screen.getByText(fixture.verdict.reason)).toBeTruthy();
  });

  it("shows the counters placeholder", () => {
    render(<Ledger doc={fixture} />);
    expect(screen.getByText("Suggested counters")).toBeTruthy();
    expect(screen.getByText("No counters yet.")).toBeTruthy();
  });

  it("shows the as-of line with the fetch time in the reader's locale", () => {
    render(<Ledger doc={fixture} />);
    const fetched = new Date(fixture.as_of.rosters_fetched).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const line = screen.getByText(/^Chart week 6 · stats through week 5 · rosters fetched/);
    expect(line.textContent).toBe(`Chart week 6 · stats through week 5 · rosters fetched ${fetched}`);
  });

  it("reads Analysis unavailable in both slots for a fallback document", () => {
    render(<Ledger doc={{ ...fixture, fallback: true }} />);
    expect(screen.getAllByText("Analysis unavailable")).toHaveLength(2);
    expect(screen.queryByText("Nico Collins leads the trade in points per game.")).toBeNull();
  });

  it("reads a down step and an even lean", () => {
    const sides = fixture.sides.map((side, i) =>
      i === 1
        ? { ...side, adjusters: side.adjusters.map((a, j) => (j === 0 ? { ...a, step: -1 as const, lean: "even" as const } : a)) }
        : side,
    );
    render(<Ledger doc={{ ...fixture, sides }} />);
    expect(screen.getByText("down one step")).toBeTruthy();
    expect(screen.getByText("leans even")).toBeTruthy();
  });

  it("shows no trade value, no start reason, and no final reason", () => {
    const { container } = render(<Ledger doc={fixture} />);
    const text = container.textContent ?? "";
    expect(text.toLowerCase()).not.toContain("trade value");
    expect(text).not.toContain(fixture.sides[0].final_reason);
    expect(text).not.toContain(fixture.sides[0].reason);
  });
});
