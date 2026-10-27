/**
 * Types for the analyze document that the site API returns from POST /analyze.
 * They follow the fixture at .scratch/site-react/fixtures/analyze-response.json.
 */

export type Player = {
  player_id: string;
  name: string;
  position: string;
  nfl_team: string;
  headshot: string;
};

/* One team in the trade: the players it gives and the players it gets. */
export type TradeSide = {
  roster_id: number;
  team: string;
  gives: Player[];
  gets: Player[];
};

/* The call for the asker's side. differs is true when the call goes against the chart. The reason then says why. */
export type Decision = {
  for_roster: number;
  answer: "yes" | "no" | "not_as_is";
  reason: string;
  differs: boolean;
};

/* What the trade value chart says: the side gets more value than it gives, about even, or less. */
export type Chart = {
  lean: "more" | "even" | "less";
  reason: string;
};

/* One factor leans for the side, against it, or neither way. */
export type Factor = {
  name: string;
  lean: "for" | "against" | "even";
  reason: string;
};

/* The read of one side. analysis is null when the writer call failed, so the data stands alone. */
export type DecidedSide = {
  roster_id: number;
  analysis: string | null;
  chart: Chart;
  factors: Factor[];
};

/* One side of the fairness read: the roster id and the one reason for that side. */
export type FairnessSide = {
  roster_id: number;
  reason: string;
};

/* Whether the trade is good for both sides, fair, or lopsided. A lopsided trade always names gives_more, the roster id of the side that gives more. The other states have none. */
export type Fairness = {
  // One entry per side, in the order of the trade's sides.
  sides: FairnessSide[];
} & ({ state: "win_win" | "fair"; gives_more: null } | { state: "lopsided"; gives_more: number });

/* The games of the known-games week that the stat readers use. Pending counts are by plain name, such as snaps. */
export type KnownGames = {
  week: number;
  games: number;
  in_progress: number;
  pending: Record<string, number>;
};

export type AsOf = {
  chart_week: number;
  stats_through: number;
  // A document can lack both fields, so each is optional.
  completed_through?: number;
  known_games?: KnownGames | null;
  // True when the week has no trade value chart yet. A document can lack both fields, so each is optional.
  no_chart?: boolean;
  // The sentence that says so, written by the pipeline.
  no_chart_note?: string;
  // An ISO 8601 timestamp with an offset.
  rosters_fetched: string;
};

export type AnalyzeResponse = {
  trade: {
    // The roster id of the team that asks for the grade.
    asker: number;
    sides: TradeSide[];
  };
  decision: Decision;
  // Optional, because the ticket asks the page to render a document with no block, as a guard. The page then shows no fairness line.
  fairness?: Fairness;
  sides: DecidedSide[];
  as_of: AsOf;
  // True when the writer call failed, so the analysis text is not real.
  fallback: boolean;
  missing: string[];
  stale: string[];
};

/* One trade of the finder. The sides share the analyze document's side shape, so the site renders a side one way.
   reason is null when the Claude call failed twice. The fairness line then stands alone. */
export type FinderTrade = {
  sides: TradeSide[];
  fairness: Fairness;
  reason: string | null;
};

/* The finder document that the site API returns from POST /find. It follows the fixture at .scratch/site-react/fixtures/find-response.json. */
export type FindResponse = {
  season: number;
  trade_pair: {
    asker: { roster_id: number; team: string };
    partner: { roster_id: number; team: string };
  };
  // Up to three trades, best first. The three share no player.
  trades: FinderTrade[];
  // The line for an empty list, or null when the list has a trade. The page shows it as the pipeline writes it.
  empty: string | null;
  as_of: AsOf;
  // True when the reason call failed, so every reason is null.
  fallback: boolean;
  missing: string[];
  stale: string[];
};
