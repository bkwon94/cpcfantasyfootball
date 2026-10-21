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

export function loadWeek(season: string, week: string): WeekPage {
  const file = join(PUBLIC_DIR, season, week, "page.json");
  return JSON.parse(readFileSync(file, "utf8")) as WeekPage;
}
