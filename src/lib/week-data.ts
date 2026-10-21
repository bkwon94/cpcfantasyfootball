/**
 * Reads the week page JSON files from public/ at build time.
 * The week folder is the data folder, so the route and the images share one path.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { WeekPage } from "@/lib/week-types";

/* The build and the tests both run from the repo root, so public/ sits under the working folder. */
const PUBLIC_DIR = join(process.cwd(), "public");
const SEASON_DIR = /^\d{4}$/;
const WEEK_DIR = /^week-\d{2}$/;

/* The route params are the folder names, for example { season: "2026", week: "week-06" }. */
export type WeekRef = { season: string; week: string };

function dirsMatching(dir: string, pattern: RegExp): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && pattern.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

/* Every week folder that holds a page.json. A folder with only images is not a week page yet. */
export function listWeeks(): WeekRef[] {
  return dirsMatching(PUBLIC_DIR, SEASON_DIR).flatMap((season) =>
    dirsMatching(join(PUBLIC_DIR, season), WEEK_DIR)
      .filter((week) => existsSync(join(PUBLIC_DIR, season, week, "page.json")))
      .map((week) => ({ season, week })),
  );
}

/* The page JSON layout version this site reads. */
const SCHEMA_VERSION = 2;

/* A schema change must fail the build loud, so a page never renders from keys it misreads. */
export function loadWeek(season: string, week: string): WeekPage {
  const file = join(PUBLIC_DIR, season, week, "page.json");
  const page = JSON.parse(readFileSync(file, "utf8")) as { schema_version?: unknown };
  if (page.schema_version !== SCHEMA_VERSION) {
    throw new Error(
      `${file} has schema_version ${String(page.schema_version)}, but this site reads schema_version ${SCHEMA_VERSION}.`,
    );
  }
  return page as WeekPage;
}

/* One row of the home page list. */
export type WeekSummary = {
  season: string;
  week: string;
  number: number;
  dates: string;
  teams: string;
  href: string;
};

/* The summary is "Week N · dates · teams", so the teams are everything after the second separator. */
function teamsOf(summary: string): string {
  return summary.split(" · ").slice(2).join(" · ");
}

/* Every published week, newest first. The folder names sort by season, then by week number. */
export function listWeekSummaries(): WeekSummary[] {
  return listWeeks()
    .map(({ season, week }) => {
      const page = loadWeek(season, week);
      return {
        season,
        week,
        number: page.week,
        dates: page.dates,
        teams: teamsOf(page.summary),
        href: `/${season}/${week}/`,
      };
    })
    .sort((a, b) => b.season.localeCompare(a.season) || b.week.localeCompare(a.week));
}
