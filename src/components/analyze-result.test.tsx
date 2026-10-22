/**
 * Tests for the analyzer result. The API fixture document is the one input, and each test reads the screen.
 * They check what a reader sees, not the class names.
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import fixtureJson from "../../.scratch/site-react/fixtures/analyze-response.json";
import type { AnalyzeResponse, Decision } from "@/lib/analyze-types";
import AnalyzeResult from "./analyze-result";

const fixture = fixtureJson as AnalyzeResponse;
const withAnswer = (answer: Decision["answer"]): AnalyzeResponse => ({ ...fixture, decision: { ...fixture.decision, answer } });
const ANALYSIS = "Nico Collins leads the trade in points per game.";
/* A single letter on its own is a grade. A letter in an initial such as "A.J." is a name, so the scan skips it. */
const LETTER = /(?<![\w.])[A-F](?![\w.])/;
const FALLBACK_LINE = "The analysis is unavailable, so the data stands alone.";

afterEach(() => {
  cleanup();
});

describe("AnalyzeResult", () => {
  it.each([
    ["yes", "Yes"],
    ["no", "No"],
    ["not_as_is", "Not as is"],
  ] as const)("shows the answer %s as the word %s with its reason", (answer, word) => {
    render(<AnalyzeResult doc={withAnswer(answer)} />);
    expect(screen.getByText("Decision for Pukancun on 3")).toBeTruthy();
    expect(screen.getByText(word)).toBeTruthy();
    expect(screen.getByText(fixture.decision.reason)).toBeTruthy();
  });

  it("puts the decision above the swap card and the sides", () => {
    render(<AnalyzeResult doc={fixture} />);
    const decision = screen.getByText("Not as is");
    const trade = screen.getByText("The trade");
    const side = screen.getByText("Pukancun on 3 · your side");
    expect(decision.compareDocumentPosition(trade) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(trade.compareDocumentPosition(side) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows no letter grade anywhere in the result", () => {
    for (const answer of ["yes", "no", "not_as_is"] as const) {
      const { container } = render(<AnalyzeResult doc={withAnswer(answer)} />);
      expect(container.textContent).not.toMatch(LETTER);
      cleanup();
    }
  });

  it("puts your side first, then the other side, each with its analysis", () => {
    render(<AnalyzeResult doc={fixture} />);
    const mine = screen.getByText("Pukancun on 3 · your side");
    // The swap card names the team first, so the side label is the last match.
    const other = screen.getAllByText("Amon-Ra Dawg Your Team").at(-1) as HTMLElement;
    expect(mine.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByText(ANALYSIS)).toHaveLength(2);
  });

  it("shows the chart sentence under The data per side", () => {
    render(<AnalyzeResult doc={fixture} />);
    expect(screen.getAllByText("The data")).toHaveLength(2);
    expect(screen.getAllByText(fixture.sides[0].chart.reason)).toHaveLength(2);
  });

  it("shows a factor reason with a number once, under The reasoning only", () => {
    const reason = "He played 41 of 60 snaps last week.";
    const sides = fixture.sides.map((side, i) =>
      i === 0 ? { ...side, factors: side.factors.map((f, j) => (j === 2 ? { ...f, reason } : f)) } : side,
    );
    render(<AnalyzeResult doc={{ ...fixture, sides }} />);
    expect(screen.getAllByText(reason)).toHaveLength(1);
  });

  it("passes the letter scan with a player named A.J. Brown in the swap card", () => {
    const brown = { player_id: "6801", name: "A.J. Brown", position: "WR", nfl_team: "PHI", headshot: "https://cdn.test/6801.png" };
    const tradeSides = fixture.trade.sides.map((side, i) => (i === 0 ? { ...side, gets: [...side.gets, brown] } : side));
    const { container } = render(<AnalyzeResult doc={{ ...fixture, trade: { ...fixture.trade, sides: tradeSides } }} />);
    expect(screen.getByText("A.J. Brown")).toBeTruthy();
    expect(container.textContent).not.toMatch(LETTER);
  });

  it("orders the sides by the decision side, so the decision and your side name the same team", () => {
    render(<AnalyzeResult doc={{ ...fixture, decision: { ...fixture.decision, for_roster: 12 } }} />);
    expect(screen.getByText("Decision for Amon-Ra Dawg Your Team")).toBeTruthy();
    const mine = screen.getByText("Amon-Ra Dawg Your Team · your side");
    const other = screen.getAllByText("Pukancun on 3").at(-1) as HTMLElement;
    expect(mine.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("names your side when the decision team is not in the trade", () => {
    render(<AnalyzeResult doc={{ ...fixture, decision: { ...fixture.decision, for_roster: 99 } }} />);
    expect(screen.getByText("Decision for your side")).toBeTruthy();
  });

  it("shows every factor under The reasoning with its lean and reason", () => {
    render(<AnalyzeResult doc={fixture} />);
    expect(screen.getAllByText("The reasoning")).toHaveLength(2);
    for (const name of ["roster fit", "standing", "trend and usage", "injury", "handcuff", "schedule"]) {
      expect(screen.getAllByText(name)).toHaveLength(2);
    }
    for (const side of fixture.sides) {
      for (const factor of side.factors) {
        expect(screen.getAllByText(factor.reason).length).toBeGreaterThan(0);
      }
    }
    expect(screen.getAllByText("for")).toHaveLength(2);
    expect(screen.getAllByText("against")).toHaveLength(1);
    expect(screen.getAllByText("even")).toHaveLength(9);
  });

  it("shows the players each side gets in the swap card", () => {
    render(<AnalyzeResult doc={fixture} />);
    expect(screen.getByText("You get")).toBeTruthy();
    expect(screen.getByText("Gets")).toBeTruthy();
    expect(screen.getByText("Dalton Kincaid")).toBeTruthy();
    expect(screen.getByText("Garrett Wilson")).toBeTruthy();
    expect(screen.getByText("Nico Collins")).toBeTruthy();
  });

  it("shows the counters placeholder", () => {
    render(<AnalyzeResult doc={fixture} />);
    expect(screen.getByText("Suggested counters")).toBeTruthy();
    expect(screen.getByText("No counters yet.")).toBeTruthy();
  });

  it("shows the as-of line with the fetch time in the reader's locale", () => {
    render(<AnalyzeResult doc={fixture} />);
    const fetched = new Date(fixture.as_of.rosters_fetched).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const line = screen.getByText(/^Chart week 6 · stats through week 5 · rosters fetched/);
    expect(line.textContent).toBe(`Chart week 6 · stats through week 5 · rosters fetched ${fetched}`);
  });

  it("shows the decision, the data, and the fallback line when the analysis is null", () => {
    const sides = fixture.sides.map((side) => ({ ...side, analysis: null }));
    render(<AnalyzeResult doc={{ ...fixture, sides, fallback: true }} />);
    expect(screen.getByText("Not as is")).toBeTruthy();
    expect(screen.getAllByText(FALLBACK_LINE)).toHaveLength(2);
    expect(screen.getAllByText(fixture.sides[0].chart.reason)).toHaveLength(2);
    expect(screen.queryByText(ANALYSIS)).toBeNull();
  });
});
