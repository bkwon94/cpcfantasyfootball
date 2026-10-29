/**
 * Tests for the manager page route. Each test builds a temp public/ folder with a week page, the managers file, and the rankings file.
 * They read the static params and what a reader sees: the hero, the three numbers with their context lines, and the chapters.
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import fixture from "@/components/managers/fixture.json";
import { rankings as rankingsFixture } from "@/components/rankings/fixture";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/* The last week of the rankings fixture, and a week 5 before it where each playoff percent is shifted by the given points.
   The fixture's own week before week 6 is week 1, which has no odds. */
function rankingsWithWeek5(shift: (rosterId: number) => number) {
  const last = rankingsFixture.weeks.at(-1)!;
  const rows = last.rows.map((row) => ({ ...row, odds: { ...row.odds!, playoff: row.odds!.playoff - shift(row.roster_id) } }));
  return { ...rankingsFixture, weeks: [rankingsFixture.weeks[0], { ...last, week: 5, rows }, last] };
}

/* A temp public/ folder with the week 6 page, the managers file unless managers is false, and the rankings file when given. */
async function routeOver({ managers = true, rankings }: { managers?: boolean; rankings?: unknown } = {}) {
  const root = mkdtempSync(join(tmpdir(), "manager-page-"));
  mkdirSync(join(root, "public", "2026", "week-06"), { recursive: true });
  writeFileSync(
    join(root, "public", "2026", "week-06", "page.json"),
    JSON.stringify({ schema_version: 2, avatars: { "9": "avatars/9.jpg" } }),
  );
  if (managers) writeFileSync(join(root, "public", "2026", "managers.json"), JSON.stringify(fixture));
  if (rankings !== undefined) writeFileSync(join(root, "public", "2026", "rankings.json"), JSON.stringify(rankings));
  vi.spyOn(process, "cwd").mockReturnValue(root);
  // The readers read the working folder when they load, so reset them.
  vi.resetModules();
  return import("./page.managers");
}

/* Renders the page of one roster and returns the group of the three numbers. */
async function renderManager(roster: string, options: Parameters<typeof routeOver>[0] = {}) {
  const { default: ManagerPage } = await routeOver(options);
  render(await ManagerPage({ params: Promise.resolve({ season: "2026", roster }) }));
  return screen.getByRole("group", { name: "Season Numbers" });
}

/* The label, the number, and the context line of each number, as a reader reads them. */
function numbersIn(group: HTMLElement) {
  return [...group.querySelectorAll("dt")].map((term) => {
    const lines = [term.textContent];
    let next = term.nextElementSibling;
    while (next && next.tagName === "DD") {
      lines.push(next.textContent);
      next = next.nextElementSibling;
    }
    return lines;
  });
}

describe("generateStaticParams", () => {
  it("lists one page per roster in the managers file", async () => {
    const { generateStaticParams } = await routeOver({ rankings: rankingsFixture });
    const params = generateStaticParams();
    expect(params).toHaveLength(12);
    expect(params).toContainEqual({ season: "2026", roster: "9" });
  });

  it("lists no page when the managers file is missing", async () => {
    const { generateStaticParams } = await routeOver({ managers: false });
    expect(generateStaticParams()).toEqual([]);
  });
});

describe("generateMetadata", () => {
  it("titles the page with the team name", async () => {
    const { generateMetadata } = await routeOver({ rankings: rankingsFixture });
    const metadata = await generateMetadata({ params: Promise.resolve({ season: "2026", roster: "9" }) });
    expect(metadata.title).toBe("Maye d'force B with U · Cornerstone Fantasy Football League");
  });
});

describe("ManagerPage", () => {
  it("shows the team name as the page heading, the owner, the record, and the standing", async () => {
    await renderManager("9", { rankings: rankingsFixture });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Maye d'force B with U");
    const hero = screen.getByRole("heading", { level: 1 }).closest("section")!;
    expect(hero.textContent).toContain(fixture.managers[8].team.owner);
    expect(hero.textContent).toContain("7-5 · 4th of 12");
    // The team name sits next to the avatar, so the image is decorative and has no role to query.
    expect(hero.querySelector("img")?.getAttribute("src")).toBe("/2026/week-06/avatars/9.jpg");
  });

  it("shows the three numbers, each with one context line", async () => {
    // Week 5 sits 9 points under week 6 for this team, so the odds went up 9.
    const group = await renderManager("9", { rankings: rankingsWithWeek5(() => 9) });
    expect(numbersIn(group)).toEqual([
      ["Grade", "—"],
      ["Playoff Odds", "71%", "up 9"],
      ["Power Rank", "4th of 12", "down 2"],
    ]);
  });

  it("reads a drop in the odds and a rise in the rank", async () => {
    // London Cooking rose 4 places to 1st. Week 5 sits 4 points over week 6 for it.
    const group = await renderManager("5", { rankings: rankingsWithWeek5(() => -4) });
    expect(numbersIn(group).slice(1)).toEqual([
      ["Playoff Odds", "97%", "down 4"],
      ["Power Rank", "1st of 12", "up 4"],
    ]);
  });

  it("reads no change for a flat week", async () => {
    // Bo Girds kept 3rd, and week 5 has the same odds.
    const group = await renderManager("6", { rankings: rankingsWithWeek5(() => 0) });
    expect(numbersIn(group).slice(1)).toEqual([
      ["Playoff Odds", "89%", "no change"],
      ["Power Rank", "3rd of 12", "no change"],
    ]);
  });

  it("shows no odds line when the week before has no odds", async () => {
    const group = await renderManager("9", { rankings: rankingsFixture });
    expect(numbersIn(group)[1]).toEqual(["Playoff Odds", "71%"]);
  });

  it("shows a dash with no line when no week has odds", async () => {
    const noOdds = {
      ...rankingsFixture,
      weeks: rankingsFixture.weeks.map((week) => ({ ...week, rows: week.rows.map(({ odds: _odds, ...row }) => row) })),
    };
    const group = await renderManager("9", { rankings: noOdds });
    expect(numbersIn(group)[1]).toEqual(["Playoff Odds", "—"]);
  });

  it("shows the five chapters, each with its heading", async () => {
    await renderManager("9", { rankings: rankingsFixture });
    const main = screen.getByRole("main");
    expect(within(main).getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual([
      "Season So Far",
      "Roster",
      "Moves",
      "Best Adds",
      "Top Performers",
    ]);
    // Season So Far, Roster, and Moves hold one quiet line until the file carries their data.
    expect(within(main).getAllByText("Nothing here yet.")).toHaveLength(3);
  });

  it("lists the best adds and the top performers in order", async () => {
    await renderManager("9", { rankings: rankingsFixture });
    const names = (id: string) =>
      [...document.getElementById(id)!.querySelectorAll("li b")].map((name) => name.textContent);
    expect(names("best-adds")).toEqual(fixture.managers[8].best_adds.map((add) => add.name));
    expect(names("top-performers")).toEqual(fixture.managers[8].top_performers.map((performer) => performer.name));
    expect(names("best-adds")).toEqual(["Alvin Kamara", "Kyler Murray", "Emmett Johnson"]);
  });

  it("lists the five chapters in the chapter rail", async () => {
    await renderManager("9", { rankings: rankingsFixture });
    const rail = screen.getByRole("navigation", { name: "Chapters" });
    expect(within(rail).getAllByRole("link").map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Season So Far", "#season"],
      ["Roster", "#roster"],
      ["Moves", "#moves"],
      ["Best Adds", "#best-adds"],
      ["Top Performers", "#top-performers"],
    ]);
  });
});
