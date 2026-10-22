/**
 * Tests for the power rankings table. They render the fixture and read the rows, the arrows, and the component ranks.
 * They check what a reader sees, not the class names. jsdom applies no CSS, so the breakpoint and motion tests read a class.
 */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
    // The rank is the first cell of the row. The wide component cells that also read 1 come after the record.
    expect(rows()[0].querySelector("span")?.textContent).toBe("1");
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

describe("The row control", () => {
  function panelOf(button: HTMLElement) {
    return document.getElementById(button.getAttribute("aria-controls") ?? "")!;
  }

  it("gives every row a closed button with the team in its name", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    for (const row of lastWeek.rows) {
      const button = screen.getByRole("button", { name: `More on ${row.name}` });
      expect(button.getAttribute("aria-expanded")).toBe("false");
      expect(panelOf(button).getAttribute("aria-hidden")).toBe("true");
    }
  });

  it("opens the blurb on a tap, then closes it on a second tap", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    const button = screen.getByRole("button", { name: "More on Lil Fridge" });
    const panel = panelOf(button);
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(panel.getAttribute("aria-hidden")).toBe("false");
    expect(within(panel).getByText(/best record in the league/)).toBeTruthy();
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(panel.getAttribute("aria-hidden")).toBe("true");
  });

  it("shows the blurb sentences in order, as plain text with no fact IDs", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    const panel = panelOf(screen.getByRole("button", { name: "More on Lil Fridge" }));
    const text = lastWeek.rows[1].blurb.map((sentence) => sentence.text).join(" ");
    expect(within(panel).getByText(text)).toBeTruthy();
    expect(panel.textContent).not.toMatch(/PR\./);
  });

  it("puts the component ranks above the blurb in the open row", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    const panel = panelOf(screen.getByRole("button", { name: "More on Lil Fridge" }));
    // Lil Fridge ranks 1, 3, 6, and 2 on standing, form, schedule played, and scoring.
    expect(panel.textContent).toBe(`Stand1Form3Sched6Pts2${lastWeek.rows[1].blurb.map((s) => s.text).join(" ")}`);
  });

  it("opens a row with no blurb to the component ranks only", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    const button = screen.getByRole("button", { name: "More on Bo Girds" });
    fireEvent.click(button);
    expect(panelOf(button).textContent).toMatch(/^Stand\d+Form\d+Sched\d+Pts\d+$/);
  });

  it("hides the control of a row with no blurb from the page width up", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    // jsdom applies no media query, so the test reads the breakpoint class. Only the phone layout has ranks to open.
    expect(screen.getByRole("button", { name: "More on Bo Girds" }).className).toContain("page:hidden");
    expect(screen.getByRole("button", { name: "More on Lil Fridge" }).className).not.toContain("page:hidden");
  });

  it("turns the chevron with a transition when motion is on", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    const chevron = screen.getByRole("button", { name: "More on Lil Fridge" }).querySelector("span")!;
    expect(chevron.className).toMatch(/\btransition-/);
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
