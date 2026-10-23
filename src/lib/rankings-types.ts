/**
 * The types of the season rankings file that the Python build writes beside the week folders.
 * The file holds every week of the season, so a later trend chart needs no new file.
 */

/* One sentence of a blurb, with the IDs of the facts it rests on. */
export type BlurbSentence = { text: string; fact_ids: string[] };

/* Each component is a rank of 1 to 12, not a score, so the page never shows a sum or a ratio. */
export type Components = { standing: number; form: number; schedule_played: number; scoring: number };

/* The playoff odds of a team from the season simulations. Playoff and bye are whole percents.
   Seed is the seed the team gets most often, or null when it makes the playoffs in no simulation.
   Status is "in" when the team has clinched, "out" when it cannot make it, and "open" for all others. */
export type Odds = { playoff: number; bye: number; seed: number | null; status: "in" | "out" | "open" };

/* Movement is last week's rank minus this week's, so positive is up. It is null in week 1.
   Rows for weeks before the odds engine ran have no odds. */
export type RankingsRow = {
  roster_id: number;
  name: string;
  wins: number;
  losses: number;
  rank: number;
  movement: number | null;
  components: Components;
  blurb: BlurbSentence[];
  odds?: Odds;
};

/* The rows are in rank order, 1 to 12. */
export type RankingsWeek = { week: number; rows: RankingsRow[] };

export type Rankings = {
  schema_version: 1;
  season: number;
  weeks: RankingsWeek[];
};
