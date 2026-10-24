/**
 * The types of the waiver.json file that the Python build writes beside page.json in a week folder.
 * A key that an older build may leave out is optional, so the site reads every file the pipeline wrote.
 */

/* The three scores of a pool player, each from 0 to 1. A score with no input is 0. */
export type BoardScores = {
  usage: number;
  environment: number;
  projection: number;
};

/* One fact of the pipeline. The numbers field holds every number in the text, so the checks can match the page to the facts. */
export type WaiverFact = {
  id: string;
  text: string;
  numbers: string[];
  teams: string[];
  players: string[];
};

/* The most recent winning claim at the player's position this season. The roster id names the fantasy team that won it. */
export type LastLike = {
  player_id: string;
  name: string;
  roster_id: number;
  team: string;
  week: number;
  bid: number;
};

/* The bid to win of one pool player, a whole dollar, with the fact that holds its inputs.
   The outbid map maps a budget level to the count of rivals that can bid more than that level. */
export type WaiverPrice = {
  bid: number;
  fact: WaiverFact;
  // Null when no claim at the position won this season.
  last_like: LastLike | null;
  outbid: Record<string, number>;
};

/* Whether a research claim backs the board facts, disputes them, or is plain news. */
export type ClaimStance = "backs" | "disputes" | "news";

/* One research claim: one sentence from a web source, with the link, the source name, and an ISO 8601 date. */
export type ResearchClaim = {
  text: string;
  url: string;
  source: string;
  date: string;
  stance: ClaimStance;
};

/* Why a rostered player is a drop: the roster and team name that hold him, the reason code,
   and the pool player who beats him by a margin in points a week. */
export type DropInfo = {
  roster_id: number;
  holder: string;
  reason: string;
  beaten_by: string;
  beaten_by_name: string;
  margin: number;
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
  // The Sleeper injury status and the expected return week, for a stash.
  injury_status?: string | null;
  return_week?: number | null;
  // The adds across all Sleeper leagues in the last day. 0 when he is not in the trending file.
  trending_count?: number;
  facts?: WaiverFact[];
  // Null for a drop.
  price?: WaiverPrice | null;
  research?: ResearchClaim[];
  // The reason code of the bucket rule that picked the player, or null.
  reason?: string | null;
  // Null for a pool player. Only a player in the drops bucket has it.
  drop?: DropInfo | null;
};

/* The FAAB budget left and the waiver order of one roster. */
export type BudgetRow = {
  roster_id: number;
  budget_left: number;
  waiver_order: number;
};

/* The best adds bucket is the one key every file has. Later builds add more buckets by key. */
export const BEST_ADDS = "best_adds";

/* The five bucket keys in tab order, with the tab names. A file can lack any bucket but best adds.
   The names are short, so the five tabs fit in one row at 390. */
export const BUCKETS = [
  { key: BEST_ADDS, name: "Best" },
  { key: "trending", name: "Trending" },
  { key: "sneaky", name: "Sneaky" },
  { key: "stashes", name: "Stash" },
  { key: "drops", name: "Drops" },
] as const;

/* The key of one of the five buckets. */
export type BucketKey = (typeof BUCKETS)[number]["key"];

/* The board of one week: the buckets by key, each in rank order, and the budget table in roster order. */
export type WaiverBoard = {
  schema_version: 1;
  week: number;
  // An ISO 8601 date and time.
  built: string;
  buckets: Record<string, WaiverPlayer[]>;
  budgets: BudgetRow[];
  // True when the research step failed for every player, so the page says the experts are out.
  experts_missing?: boolean;
};
