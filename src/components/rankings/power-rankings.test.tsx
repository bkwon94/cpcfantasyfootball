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
  it("shows the method note above the first team row", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    const note = screen.getByText(/head-to-head record/);
    expect(note.textContent).toContain("head-to-head record");
    expect(note.compareDocumentPosition(rows()[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

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

  it("puts the Playoff % column after W-L in the header at every width", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    // The header holds a soft hyphen, so the match drops it.
    const header = screen.getByText("Playoff %", { normalizer: (text) => text.replace(/\u00AD/g, "") });
    expect(header.previousElementSibling?.textContent).toBe("W-L");
    // jsdom applies no media query, so the test reads the breakpoint class. The column shows on a phone too.
    expect(header.className).not.toMatch(/\bhidden\b/);
  });

  it("shows the playoff number for an open row, In for a clinched row, and Out for an eliminated row", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    // London Cooking is open at 97, Lil Fridge has clinched, and Pukancun on 3 is out.
    const cellAfterRecord = (index: number, record: string) =>
      within(rows()[index]).getByText(record).nextElementSibling!;
    expect(cellAfterRecord(0, "9-3").textContent).toBe("97");
    expect(cellAfterRecord(1, "10-2").textContent).toBe("In");
    expect(cellAfterRecord(11, "1-11").textContent).toBe("Out");
    expect(cellAfterRecord(0, "9-3").className).not.toMatch(/\bhidden\b/);
  });

  it("leaves the playoff cell blank for a row with no odds", () => {
    render(<PowerRankings week={firstWeek} avatars={week6.avatars} />);
    const record = `${firstWeek.rows[0].wins}-${firstWeek.rows[0].losses}`;
    expect(within(rows()[0]).getByText(record).nextElementSibling?.textContent).toBe("");
  });

  it("names the source of the playoff odds under the table", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    expect(screen.getByText("Playoff odds from 5,000 simulated seasons.")).toBeTruthy();
  });

  it("never shows a sum, a ratio, or a decimal", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    // The bye line is the one place with a percent, so a copy of each row drops it. The rest of the open row still gets the check.
    for (const row of rows()) {
      const copy = row.cloneNode(true) as HTMLElement;
      copy.querySelectorAll("p").forEach((line) => {
        if (line.textContent?.startsWith("Bye ")) line.remove();
      });
      expect(copy.textContent).not.toMatch(/\d\.\d|%|\//);
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
    // The bye line sits between the component ranks and the blurb.
    expect(panel.textContent).toBe(
      `Stand1Form3Sched6Pts2Bye 88%, most often the 1 seed${lastWeek.rows[1].blurb.map((s) => s.text).join(" ")}`,
    );
  });

  it("opens a row with no blurb to the component ranks and the bye line only", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    const button = screen.getByRole("button", { name: "More on Bo Girds" });
    fireEvent.click(button);
    expect(panelOf(button).textContent).toMatch(/^Stand\d+Form\d+Sched\d+Pts\d+Bye \d+%, most often the \d+ seed$/);
  });

  it("shows the bye odds and the seed in the open row of an open race", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    const panel = panelOf(screen.getByRole("button", { name: "More on London Cooking" }));
    expect(within(panel).getByText("Bye 64%, most often the 2 seed")).toBeTruthy();
  });

  it("shows the bye odds with no seed when the row has none", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    // To Infinity and Bijan is an open race with no seed, and Pukancun on 3 is out with no seed.
    for (const name of ["To Infinity and Bijan", "Pukancun on 3"]) {
      const panel = panelOf(screen.getByRole("button", { name: `More on ${name}` }));
      expect(within(panel).getByText("Bye 0%")).toBeTruthy();
      expect(panel.textContent).not.toMatch(/seed/);
    }
  });

  it("shows no bye line for a row with no odds", () => {
    render(<PowerRankings week={firstWeek} avatars={week6.avatars} />);
    for (const row of rows()) {
      expect(row.textContent).not.toMatch(/Bye/);
    }
  });

  it("hides the control of a row with no blurb and no odds from the page width up", () => {
    render(<PowerRankings week={firstWeek} avatars={week6.avatars} />);
    // jsdom applies no media query, so the test reads the breakpoint class. Only the phone layout has ranks to open.
    // Week 1 rows have no blurb and no odds.
    expect(screen.getByRole("button", { name: "More on Bo Girds" }).className).toContain("page:hidden");
  });

  it("shows the control of a row with a blurb or with odds from the page width up", () => {
    render(<PowerRankings week={lastWeek} avatars={week6.avatars} />);
    // Bo Girds has no blurb but has odds, so its bye line has a reason to open at every width.
    expect(screen.getByRole("button", { name: "More on Bo Girds" }).className).not.toContain("page:hidden");
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
