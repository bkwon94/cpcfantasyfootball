/**
 * Tests for next week. They render the week 6 JSON and read the label, the teams, the records, and the tags.
 * They check what a reader sees, not the class names.
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { week6 } from "./fixture";
import { NextWeek } from "./next-week";

afterEach(() => {
  cleanup();
});

function renderNext() {
  return render(<NextWeek week={week6.week} games={week6.next} avatars={week6.avatars} blurb={week6.blurbs.next_week} />);
}

describe("NextWeek", () => {
  it("names the week after the page's week", () => {
    renderNext();
    expect(screen.getByText("Next Week · Week 7")).toBeTruthy();
  });

  it("shows both teams of each game with the records", () => {
    renderNext();
    expect(screen.getByText("Lil Fridge")).toBeTruthy();
    expect(screen.getByText("10-2")).toBeTruthy();
    expect(screen.getByText("Return of T Mac")).toBeTruthy();
    expect(screen.getAllByText("vs").length).toBe(week6.next.length);
  });

  it("tags the Must Watch games and shows the reason", () => {
    renderNext();
    expect(screen.getAllByText("Must Watch").length).toBe(2);
    expect(screen.getByText("1st vs 7th, near the playoff cut")).toBeTruthy();
  });

  it("shows the blurb", () => {
    renderNext();
    expect(screen.getByText(/The Must Watch is Lil Fridge at 10-2/)).toBeTruthy();
  });
});
