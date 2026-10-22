/**
 * The types of the season rankings file that the Python build writes beside the week folders.
 * The file holds every week of the season, so a later trend chart needs no new file.
 */

/* One sentence of a blurb, with the IDs of the facts it rests on. */
export type BlurbSentence = { text: string; fact_ids: string[] };

/* Each component is a rank of 1 to 12, not a score, so the page never shows a sum or a ratio. */
export type Components = { standing: number; form: number; schedule_played: number; scoring: number };

/* Movement is last week's rank minus this week's, so positive is up. It is null in week 1. */
export type RankingsRow = {
  roster_id: number;
  name: string;
  wins: number;
  losses: number;
  rank: number;
  movement: number | null;
  components: Components;
  blurb: BlurbSentence[];
};

/* The rows are in rank order, 1 to 12. */
export type RankingsWeek = { week: number; rows: RankingsRow[] };

export type Rankings = {
  schema_version: 1;
  season: number;
  weeks: RankingsWeek[];
};
