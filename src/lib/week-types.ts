/**
 * The types of the week page JSON that the Python build writes beside each week's images.
 * They cover the keys the week route reads. The JSON turns int keys into strings, so maps take string roster ids.
 */

export type Team = {
  roster_id: number;
  name: string;
  owner: string;
  avatar_url: string | null;
  wins: number;
  losses: number;
  points_for: number;
  is_brian: boolean;
};

/* One player's line for the week. A defense has its team code as the player id. */
export type PlayerLine = {
  player_id: string;
  name: string;
  position: string;
  nfl_team: string | null;
  points: number;
  projection: number | null;
  season_avg: number | null;
  started: boolean;
  slot: string | null;
  injury_status: string | null;
  injury_body_part: string | null;
};

/* One side of a matchup. A tie sets neither winner nor loser. */
export type MatchupSide = {
  team: Team;
  score: number;
  top: PlayerLine | null;
  winner: boolean;
  loser: boolean;
};

export type Pick = {
  reason: string;
  sides: [MatchupSide, MatchupSide];
};

export type GameChanger = {
  award: { key: string; line: PlayerLine; roster_id: number; reason: string };
  team: string;
};

/* An award tile. A missing tile has no player, because the week had no projections. */
export type Award =
  | { title: string; missing: true }
  | {
      title: string;
      missing: false;
      player: string;
      player_id: string;
      points: number;
      team: string;
      projection: number | null;
    };

export type LeaderRow = {
  rank: number;
  player: string;
  player_id: string;
  nfl_team: string | null;
  points: number;
  team: string;
};

export type LeaderBoard = {
  position: string;
  rows: LeaderRow[];
};

export type TradeSide = {
  team: Team;
  players: { name: string; headshot: string }[];
  picks: string[];
};

export type Trade = { sides: TradeSide[] };

export type Matchup = {
  id: number;
  sides: [MatchupSide, MatchupSide];
  is_pick: boolean;
  recap: string | null;
};

export type Median = {
  value: number;
  above: { team: Team; gap: number };
  below: { team: Team; gap: number };
  bars: { team: Team; score: number; above: boolean; pct: number }[];
  line_pct: number;
};

export type TableRow = {
  standing: { rank: number; roster_id: number; wins: number; losses: number; points_for: number };
  team: Team;
};

export type NextGame = {
  a: Team;
  b: Team;
  must_watch: boolean;
  reason: string | null;
};

export type Blurbs = {
  motw: string;
  game_changer?: string;
  awards: string;
  position_leaders?: string;
  median?: string;
  next_week?: string;
  [recap: string]: string | undefined;
};

/* Image paths in both maps are relative to the week folder, for example avatars/4.jpg. */
export type AvatarMap = Record<string, string>;
export type HeadshotMap = Record<string, string>;

export type WeekPage = {
  schema_version: number;
  season: number;
  week: number;
  dates: string;
  publish_date: string;
  summary: string;
  teams: Record<string, Team>;
  pick: Pick;
  game_changer: GameChanger | null;
  awards: Award[];
  leaders: LeaderBoard[];
  trades: Trade[];
  matchups: Matchup[];
  median: Median | null;
  table: TableRow[];
  next: NextGame[];
  blurbs: Blurbs;
  avatars: AvatarMap;
  headshots: HeadshotMap;
};
