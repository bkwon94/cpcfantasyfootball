/**
 * The types of the season managers file that the Python build writes beside the rankings file.
 * The file holds one entry per roster. The odds and the power rank stay in the rankings file, and the site joins them.
 */
import type { Odds } from "@/lib/rankings-types";

/* The team as the week page names it. The avatar URL is the Sleeper one; the pages show the week page avatars. */
export type ManagerTeam = { name: string; owner: string; avatar_url: string };

/* A player of a move, an add, or a performer row. The position is null when the players file lacks him. */
export type ManagerPlayer = { player_id: string; name: string; position: string | null };

/* An add by a waiver claim or a free agent pickup. A free agent pickup has no bid. */
export type MoveAdd = ManagerPlayer & { kind: "waiver" | "free_agent"; bid: number | null };

/* One trade from the side of the roster: the other rosters, the players it gave, and the players it got. */
export type MoveTrade = { with: number[]; gave: ManagerPlayer[]; got: ManagerPlayer[] };

/* The moves of one week. A week with no moves holds empty lists. */
export type MoveWeek = { week: number; adds: MoveAdd[]; drops: ManagerPlayer[]; trades: MoveTrade[] };

/* The season totals and every week from the last saved week down to week 1, newest first. */
export type Moves = { adds: number; drops: number; trades: number; weeks: MoveWeek[] };

/* An add with the points and the projection of the weeks on the roster since the add. Three at most. */
export type BestAdd = ManagerPlayer & { week: number; points: number; projection: number; games: number };

/* A player with the points of the weeks he started for the roster. Five at most. */
export type TopPerformer = ManagerPlayer & { points: number; games: number; per_game: number };

/* One saved week: the points, the league median, and the head-to-head result. Won is null for a bye or a tie. */
export type SeasonWeek = { week: number; points: number; median: number; won: boolean | null };

/* The worst week of the bench: the points the bench cost and the player that sat. */
export type BenchWorst = { week: number; points: number; player_id: string; name: string };

/* The bench points of the season. Worst is null when no week had a bench gain. */
export type Bench = { total: number; worst: BenchWorst | null };

/* The counts of the report awards the roster won. */
export type AwardCounts = { top_scorer: number; mvb: number; game_changer: number; underperformer: number };

/* One slot rank: the team's rank at the position, 1 to 12, and one depth word. */
export type SlotRank = { position: "QB" | "RB" | "WR" | "TE"; rank: number; depth: "deep" | "fine" | "thin" };

/* The roster grade: the letter and the slot ranks in the order QB, RB, WR, TE. The file never carries the score. */
export type ManagerGrade = { letter: string; slots: SlotRank[] };

/* One roster of the season, with the record through the last saved week.
   The bench is null when the build had no roster slots. The grade is null when the build had no snapshot. */
export type ManagerEntry = {
  roster_id: number;
  team: ManagerTeam;
  wins: number;
  losses: number;
  points_for: number;
  moves: Moves;
  best_adds: BestAdd[];
  top_performers: TopPerformer[];
  weeks: SeasonWeek[];
  bench: Bench | null;
  awards: AwardCounts;
  grade: ManagerGrade | null;
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
