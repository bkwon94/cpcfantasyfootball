/**
 * The points line of a manager page: the team's points per week against the league median, with one dot per week.
 * It is an inline SVG on a fixed viewBox, so it scales to the column width at each tier and paints in the theme tokens.
 */
import { useId } from "react";
import { cn } from "@/lib/utils";
import type { SeasonWeek } from "@/lib/manager-types";

/* The drawing box. The SVG keeps this aspect ratio and scales to the column width. */
const WIDTH = 600;
const HEIGHT = 160;
/* The inset keeps the dots at the ends and the top and bottom inside the box. */
const PAD_X = 8;
const PAD_Y = 10;

/* A count with its noun, such as "1 win" or "4 losses". */
function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/* The short summary a screen reader reads in place of the dots. */
function summary(weeks: SeasonWeek[]): string {
  const wins = weeks.filter((week) => week.won === true).length;
  const losses = weeks.filter((week) => week.won === false).length;
  const above = weeks.filter((week) => week.points > week.median).length;
  return (
    `Weeks ${weeks[0].week} to ${weeks.at(-1)!.week}: ${count(wins, "win", "wins")}, ${count(losses, "loss", "losses")}. ` +
    `Above the median in ${above} of ${weeks.length}.`
  );
}

/* The path through the points. One path with a stable d, so a later draw motion can animate its length. */
function pathOf(points: [number, number][]): string {
  return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

export function PointsLine({ weeks }: { weeks: SeasonWeek[] }) {
  const titleId = useId();
  const descId = useId();
  if (weeks.length === 0) return null;

  // One scale for both lines, so the team line and the median line read against each other.
  const values = weeks.flatMap((week) => [week.points, week.median]);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const x = (i: number) => (weeks.length === 1 ? WIDTH / 2 : PAD_X + (i * (WIDTH - 2 * PAD_X)) / (weeks.length - 1));
  const y = (v: number) => (high === low ? HEIGHT / 2 : PAD_Y + ((high - v) * (HEIGHT - 2 * PAD_Y)) / (high - low));
  const team = weeks.map((week, i): [number, number] => [x(i), y(week.points)]);
  const median = weeks.map((week, i): [number, number] => [x(i), y(week.median)]);
  const first = weeks[0].week;
  const last = weeks.at(-1)!.week;

  return (
    <div>
      {/* The title names the line and the desc sums it up, so the dots carry no text each. */}
      <svg
        role="img"
        aria-labelledby={titleId}
        aria-describedby={descId}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block h-auto w-full overflow-visible"
      >
        <title id={titleId}>Points per week against the league median</title>
        <desc id={descId}>{summary(weeks)}</desc>
        {/* The strokes keep their width at every tier, so both lines stay thin as the SVG scales. */}
        <path
          d={pathOf(median)}
          fill="none"
          strokeWidth={1}
          strokeDasharray="4 3"
          vectorEffect="non-scaling-stroke"
          className="stroke-mute"
        />
        <path d={pathOf(team)} fill="none" strokeWidth={1.5} vectorEffect="non-scaling-stroke" className="stroke-ink" />
        {/* A win is filled and a loss is hollow. A week with no result, a bye or a tie, is a small mute ring.
            The hollow dots fill with the page color, so the line does not show through them. */}
        {weeks.map((week, i) => {
          const result = week.won === null ? "none" : week.won ? "win" : "loss";
          return (
            <circle
              key={week.week}
              data-result={result}
              cx={team[i][0]}
              cy={team[i][1]}
              r={result === "none" ? 3 : 5}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              className={cn(
                result === "win" && "fill-ink stroke-ink",
                result === "loss" && "fill-wht stroke-ink",
                result === "none" && "fill-wht stroke-mute",
              )}
            />
          );
        })}
      </svg>
      {/* The first and the last week are the only axis labels. The desc already names them, so a screen reader skips them. */}
      <div aria-hidden className="mt-sp-1 flex justify-between text-meta text-mute tabular-nums">
        <span>{`Week ${first}`}</span>
        {last !== first && <span>{`Week ${last}`}</span>}
      </div>
    </div>
  );
}
