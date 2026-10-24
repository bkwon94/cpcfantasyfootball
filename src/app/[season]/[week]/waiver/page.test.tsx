/**
 * Tests for the waiver page route. Each test builds a temp public/ folder with week pages, some with a waiver file.
 * They read the static params and what a reader sees: the masthead line and the lists with the week page avatars.
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import fixture from "@/components/waiver/fixture.json";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

/* A temp public/ folder with week 5 and week 6 pages. Only week 6 has the waiver file. */
async function routeOver() {
  const root = mkdtempSync(join(tmpdir(), "waiver-page-"));
  for (const week of ["week-05", "week-06"]) {
    mkdirSync(join(root, "public", "2026", week), { recursive: true });
    writeFileSync(
      join(root, "public", "2026", week, "page.json"),
      JSON.stringify({
        schema_version: 2,
        week: Number(week.slice(-2)),
        teams: { "4": { roster_id: 4, name: "Pukancun on 3" } },
        avatars: { "4": "avatars/4.jpg" },
      }),
    );
  }
  writeFileSync(join(root, "public", "2026", "week-06", "waiver.json"), JSON.stringify(fixture));
  vi.spyOn(process, "cwd").mockReturnValue(root);
  // The readers read the working folder when they load, so reset them.
  vi.resetModules();
  return import("./page.waiver");
}

describe("generateStaticParams", () => {
  // The flag gates the route file in next.config, so the params read the files only.
  it("lists only the weeks with a waiver file", async () => {
    const { generateStaticParams } = await routeOver();
    expect(generateStaticParams()).toEqual([{ season: "2026", week: "week-06" }]);
  });
});

describe("WaiverPage", () => {
  it("shows the week and the build time in the masthead", async () => {
    const { default: WaiverPage } = await routeOver();
    render(await WaiverPage({ params: Promise.resolve({ season: "2026", week: "week-06" }) }));
    const banner = screen.getByRole("banner");
    expect(banner.textContent).toContain("WEEK 6");
    // The build time reads in league time, US Eastern.
    expect(banner.textContent).toContain("Built Fri, Oct 23, 10:05 AM EDT");
  });

  it("shows no link to itself in the masthead, even with the flag on", async () => {
    // The flag on gives every other page the link, so the test proves this page turns it off.
    vi.stubEnv("NEXT_PUBLIC_WAIVER", "on");
    const { default: WaiverPage } = await routeOver();
    render(await WaiverPage({ params: Promise.resolve({ season: "2026", week: "week-06" }) }));
    expect(within(screen.getByRole("banner")).queryByRole("link", { name: "Waiver wire" })).toBeNull();
  });

  it("shows the budgets with the avatars of the week folder, and the best adds after the top six", async () => {
    const { default: WaiverPage } = await routeOver();
    render(await WaiverPage({ params: Promise.resolve({ season: "2026", week: "week-06" }) }));
    const budgets = within(screen.getByRole("list", { name: "Budgets" })).getAllByRole("listitem");
    expect(budgets).toHaveLength(12);
    expect(within(budgets[0]).getByText("Pukancun on 3")).toBeTruthy();
    expect(budgets[0].querySelector("img")?.getAttribute("src")).toBe("/2026/week-06/avatars/4.jpg");
    expect(within(screen.getByRole("list", { name: "Also" })).getAllByRole("listitem")).toHaveLength(2);
  });
});
