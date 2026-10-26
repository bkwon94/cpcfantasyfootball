/**
 * The stats-through sentence of the as-of line, shared by the analyze page and the finder page.
 * It names the stats week, the known games read, the games in progress, and the pending counts.
 */
import type { AsOf } from "./analyze-types";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/* A document with no block, or no games read, gets the stats week alone, so the line never claims games it lacks. */
export function knownGamesLine(asOf: AsOf): string {
  const stats = `Stats through week ${asOf.stats_through}`;
  const known = asOf.known_games;
  if (!known || known.games === 0) return stats;

  const inProgress = known.in_progress > 0 ? `, ${known.in_progress} in progress` : "";
  const pending = Object.entries(known.pending).map(
    ([name, n]) => ` ${name[0].toUpperCase()}${name.slice(1)} pending for ${plural(n, "game")}.`,
  );
  return `${stats}, plus ${plural(known.games, `week ${known.week} game`)}${inProgress}.${pending.join("")}`;
}
