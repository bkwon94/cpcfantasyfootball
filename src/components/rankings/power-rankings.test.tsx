/**
 * Tests for the power rankings table. They render the fixture and read the rows, the arrows, and the component ranks.
 * They check what a reader sees, not the class names.
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { week6 } from "@/components/week/fixture";
import { rankings } from "./fixture";
import { Movement, PowerRankings } from "./power-rankings";

afterEach(() => {
  cleanup();
});

const lastWeek = rankings.weeks.at(-1)!;
const firstWeek = rankings.weeks[0];

function rows() {
  return screen.getAllByRole("listitem");
}

describe("PowerRankings", () => {
  it("shows twelve rows in rank order", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    expect(rows()).toHaveLength(12);
    expect(rows().map((row) => row.textContent)).toEqual(
      lastWeek.rows.map((row) => expect.stringContaining(row.name)),
    );
    expect(within(rows()[0]).getByText("London Cooking")).toBeTruthy();
    expect(within(rows()[11]).getByText("Pukancun on 3")).toBeTruthy();
  });

  it("shows the rank, the movement, the record, and the four component ranks of a row", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    // London Cooking is first, up 4, 9-3, and ranks 2, 1, 2, 1 on standing, form, schedule played, and scoring.
    const row = within(rows()[0]);
    // The rank cell holds only the number. The component cells that also read 1 carry a column name too.
    expect(row.getAllByText("1").filter((cell) => cell.children.length === 0)).toHaveLength(1);
    expect(row.getByText("▲")).toBeTruthy();
    expect(row.getByText("Up")).toBeTruthy();
    expect(row.getByText("4").textContent).toBe("▲Up4");
    expect(row.getByText("London Cooking")).toBeTruthy();
    expect(row.getByText("9-3")).toBeTruthy();
    expect(row.getByText("Stand").parentElement?.textContent).toBe("Stand2");
    expect(row.getByText("Form").parentElement?.textContent).toBe("Form1");
    expect(row.getByText("Sched").parentElement?.textContent).toBe("Sched2");
    expect(row.getByText("Pts").parentElement?.textContent).toBe("Pts1");
  });

  it("names its column in each folded component cell", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    for (const row of rows()) {
      for (const name of ["Stand", "Form", "Sched", "Pts"]) {
        expect(within(row).getByText(name)).toBeTruthy();
      }
    }
  });

  it("shows a down arrow with the count for a team that fell", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    const fridge = within(rows()[1]);
    expect(fridge.getByText("▼")).toBeTruthy();
    expect(fridge.getByText("Down")).toBeTruthy();
    // Lil Fridge fell one place, so the count reads 1 beside the arrow.
    expect(fridge.getByText("▼").parentElement?.textContent).toBe("▼Down1");
  });

  it("shows the avatar of the team from the week avatars", () => {
    render(<PowerRankings week={lastWeek} avatars={{ "5": "/2026/week-06/avatars/5.jpg" }} />);
    expect(rows()[0].querySelector("img")?.getAttribute("src")).toBe("/2026/week-06/avatars/5.jpg");
  });

  it("shows a dash and no arrow for a null movement in week 1", () => {
    render(<PowerRankings week={firstWeek} avatars={week6.avatars} />);
    for (const row of rows()) {
      expect(within(row).getByText("–")).toBeTruthy();
      expect(within(row).queryByText(/[▲▼]/)).toBeNull();
    }
  });

  it("never shows a sum, a ratio, or a decimal", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    for (const row of rows()) {
      expect(row.textContent).not.toMatch(/\d\.\d|%|\//);
    }
  });
});

describe("Movement", () => {
  it("shows a dash for no change", () => {
    render(<Movement movement={0} />);
    expect(screen.getByText("–")).toBeTruthy();
    expect(screen.getByText("No change")).toBeTruthy();
  });

  it("shows an up arrow with the count", () => {
    render(<Movement movement={3} />);
    expect(screen.getByText("▲")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });
});
