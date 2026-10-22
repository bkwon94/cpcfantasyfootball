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
  decision: Decision;
  sides: DecidedSide[];
  as_of: AsOf;
  // True when the writer call failed, so the analysis text is not real.
  fallback: boolean;
  missing: string[];
  stale: string[];
};

/* The letter document that the API sent before the decision document.
   This type, readAnalyzeDocument, and the fixture analyze-response-letters.json go away after the API deploys the decision document. */
type LetterSide = {
  roster_id: number;
  start_letter: "A" | "B" | "C" | "D" | "F";
  reason: string;
  adjusters: { name: string; step: -1 | 0 | 1; lean: Factor["lean"] | null; reason: string }[];
  analysis: string;
};

export type LetterDocument = Omit<AnalyzeResponse, "decision" | "sides"> & {
  sides: LetterSide[];
  verdict: { for_roster: number; choice: "accept" | "counter" | "decline"; reason: string; differs: boolean };
};

const CHOICE_ANSWER = { accept: "yes", decline: "no", counter: "not_as_is" } as const;
/* The letter reasons name the letters, and no letter may show, so the guard gives a plain reason per answer. */
const REASON = {
  accept: "The trade is good for your side as it is.",
  decline: "The trade is bad for your side.",
  counter: "The trade is close, so ask for more.",
} as const;
const CHART_LEAN = { A: "more", B: "more", C: "even", D: "less", F: "less" } as const;
const STEP_LEAN = { 1: "for", [-1]: "against", 0: "even" } as const;

/* Reads either shape as the decision document. The site deploys before the API, so the page must read both.
   This guard and the fixture analyze-response-letters.json go away after the API deploys the decision document. */
export function readAnalyzeDocument(raw: AnalyzeResponse | LetterDocument): AnalyzeResponse {
  if ("decision" in raw) return raw;
  const { verdict, sides, ...rest } = raw;
  return {
    ...rest,
    decision: { for_roster: verdict.for_roster, answer: CHOICE_ANSWER[verdict.choice], reason: REASON[verdict.choice], differs: verdict.differs },
    sides: sides.map((side) => ({
      roster_id: side.roster_id,
      // The letter document kept placeholder text on a fallback, so the guard drops it.
      analysis: raw.fallback ? null : side.analysis,
      chart: { lean: CHART_LEAN[side.start_letter], reason: side.reason },
      // A step moved the grade, so it wins over the soft lean.
      factors: side.adjusters.map((a) => ({
        name: a.name,
        lean: a.step !== 0 ? STEP_LEAN[a.step] : (a.lean ?? "even"),
        reason: a.reason,
      })),
    })),
  };
}
