/**
 * The types of the season managers file that the Python build writes beside the rankings file.
 * The file holds one entry per roster. The odds and the power rank stay in the rankings file, and the site joins them.
 */
import type { Odds } from "@/lib/rankings-types";

/* The team as the week page names it. The avatar URL is the Sleeper one; the pages show the week page avatars. */
export type ManagerTeam = { name: string; owner: string; avatar_url: string };

/* One roster of the season, with the record through the last saved week. */
export type ManagerEntry = {
  roster_id: number;
  team: ManagerTeam;
  wins: number;
  losses: number;
  points_for: number;
};

/* Through is the last saved week the build read. */
export type ManagersFile = {
  schema_version: 1;
  season: number;
  through: number;
  managers: ManagerEntry[];
};

/* One entry joined with the last week of the rankings file.
   Standing is the place in the standings, 1 to 12. Rank and movement are the power rank and its move, null with no rankings row.
   Odds is null when no week has odds. Odds change is the playoff percent minus that of the week before, null when the week before has no odds. */
export type Manager = ManagerEntry & {
  standing: number;
  rank: number | null;
  movement: number | null;
  odds: Odds | null;
  odds_change: number | null;
};

/* The managers are in standings order. */
export type Managers = { season: number; through: number; managers: Manager[] };
