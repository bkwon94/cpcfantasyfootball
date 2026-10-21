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

/* One adjuster moves a grade up one step, down one step, or not at all.
   The lean is a soft signal that does not move the grade. */
export type Adjuster = {
  name: string;
  step: -1 | 0 | 1;
  lean: "for" | "against" | "even" | null;
  reason: string;
};

/* The grade of one side. The page shows final_letter only. The API keeps the other fields. */
export type GradedSide = {
  roster_id: number;
  start_letter: string;
  reason: string;
  adjusters: Adjuster[];
  final_letter: string;
  final_reason: string;
  analysis: string;
};

export type Verdict = {
  for_roster: number;
  choice: "accept" | "counter" | "decline";
  reason: string;
  differs: boolean;
};

export type AsOf = {
  chart_week: number;
  stats_through: number;
  // An ISO 8601 timestamp with an offset.
  rosters_fetched: string;
};

export type AnalyzeResponse = {
  trade: {
    // The roster id of the team that asks for the grade.
    asker: number;
    sides: TradeSide[];
  };
  sides: GradedSide[];
  verdict: Verdict;
  as_of: AsOf;
  // True when the writer call failed, so the analysis text is not real.
  fallback: boolean;
  missing: string[];
  stale: string[];
};
