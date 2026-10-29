/**
 * The points line of a manager page: the team's points per week against the league median, with one dot per week.
 * It is an inline SVG on a fixed viewBox, so it scales to the column width at each tier and paints in the theme tokens.
 */
"use client";

import { motion, type Variants } from "framer-motion";
import { useId } from "react";
import { VIEW_MARGIN } from "@/components/reveal";
import { DURATION, EASE_OUT, INSTANT, useMotionOff } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { SeasonWeek } from "@/lib/manager-types";

/* The drawing box. The SVG keeps this aspect ratio and scales to the column width. */
const WIDTH = 600;
const HEIGHT = 160;
/* The inset keeps the dots at the ends and the top and bottom inside the box. */
const PAD_X = 8;
const PAD_Y = 10;
/* The stroke of the draw mask, in viewBox units. It is wider than the team line at every tier, so the mask covers the line whole. */
const MASK_STROKE = 6;

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

/* The team line draws from week 1 to now by its path length, over the reveal timing. With motion off it is whole at once. */
function drawOf(off: boolean): Variants {
  return {
    start: { pathLength: 0 },
    drawn: { pathLength: 1, transition: off ? INSTANT : { duration: DURATION.reveal, ease: EASE_OUT } },
  };
}

/* A dot fades in as the line reaches it. The delays spread the dots across the span of the draw, in week order. */
function dotOf(off: boolean, i: number, count: number): Variants {
  const delay = count === 1 ? 0 : (i * DURATION.reveal) / (count - 1);
  return {
    start: { opacity: 0 },
    drawn: { opacity: 1, transition: off ? INSTANT : { duration: DURATION.dot, ease: EASE_OUT, delay } },
  };
}

export function PointsLine({ weeks }: { weeks: SeasonWeek[] }) {
  const titleId = useId();
  const descId = useId();
  const maskId = useId();
  const off = useMotionOff();
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

  // The draw plays once when the chart enters the viewport, as the reveal of the chapter does.
  // With motion off, or with no IntersectionObserver, the line goes to its final state on mount and never waits.
  const watch = !off && typeof IntersectionObserver !== "undefined";
  const play = watch ? { whileInView: "drawn", viewport: { once: true, margin: VIEW_MARGIN } } : { animate: "drawn" };

  return (
    <div>
      {/* The title names the line and the desc sums it up, so the dots carry no text each.
          The SVG holds the start state and the trigger, and the team line and the dots follow it by their variants. */}
      <motion.svg
        initial="start"
        {...play}
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
        {/* The median line shows at once. The team line draws through a mask that grows by its path length.
            The mask path has no non-scaling stroke, because the browser scales the dash of a non-scaling stroke to the screen,
            and the draw then stops short of the last week on a wide column. data-draw lets globals.css show the line whole with no script. */}
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <motion.path data-draw variants={drawOf(off)} d={pathOf(team)} fill="none" stroke="white" strokeWidth={MASK_STROKE} />
        </mask>
        <path
          d={pathOf(team)}
          mask={`url(#${maskId})`}
          fill="none"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          className="stroke-ink"
        />
        {/* A win is filled and a loss is hollow. A week with no result, a bye or a tie, is a small mute ring.
            The hollow dots fill with the page color, so the line does not show through them.
            The data-reveal rule in globals.css shows the dots with reduced motion or with no script. */}
        {weeks.map((week, i) => {
          const result = week.won === null ? "none" : week.won ? "win" : "loss";
          return (
            <motion.circle
              key={week.week}
              data-reveal
              variants={dotOf(off, i, weeks.length)}
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
      </motion.svg>
      {/* The first and the last week are the only axis labels. The desc already names them, so a screen reader skips them. */}
      <div aria-hidden className="mt-sp-1 flex justify-between text-meta text-mute tabular-nums">
        <span>{`Week ${first}`}</span>
        {last !== first && <span>{`Week ${last}`}</span>}
      </div>
    </div>
  );
}
