/**
 * The types of the waiver.json file that the Python build writes beside page.json in a week folder.
 * Only bye is optional today. Later pipeline builds add more keys to the same file, and those keys will be optional too.
 */

/* The three scores of a pool player, each from 0 to 1. A score with no input is 0. */
export type BoardScores = {
  usage: number;
  environment: number;
  projection: number;
};

/* One ranked player of a bucket. The week projection is for the next week, the rest of season one runs to week 17. */
export type WaiverPlayer = {
  player_id: string;
  name: string;
  position: string;
  team: string;
  week_projection: number;
  ros_projection: number;
  scores: BoardScores;
  board_score: number;
  // The first file has no bye. A later build adds it.
  bye?: number | null;
};

/* The FAAB budget left and the waiver order of one roster. */
export type BudgetRow = {
  roster_id: number;
  budget_left: number;
  waiver_order: number;
};

/* The best adds bucket is the one key every file has. Later builds add more buckets by key. */
export const BEST_ADDS = "best_adds";

/* The board of one week: the buckets by key, each in rank order, and the budget table in roster order. */
export type WaiverBoard = {
  schema_version: 1;
  week: number;
  // An ISO 8601 date and time.
  built: string;
  buckets: Record<string, WaiverPlayer[]>;
  budgets: BudgetRow[];
};
