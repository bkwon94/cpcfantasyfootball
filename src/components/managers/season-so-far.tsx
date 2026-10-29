/**
 * The Season So Far chapter of a manager page: the points line, the bench points, and the awards shelf.
 * The three groups stack with air between them. Each line has one quiet label and one emphasis.
 */
import { Chapter, Label } from "@/components/week/parts";
import { num } from "@/lib/format";
import type { AwardCounts, Bench, Manager } from "@/lib/manager-types";
import { cn } from "@/lib/utils";
import { PointsLine } from "./points-line";

/* The quiet label style of the page, as the hero's season numbers use it. */
const QUIET_LABEL = "text-label leading-tight font-semibold tracking-caps text-mute uppercase";

/* The bench points: the season total as the emphasis, and one quiet line with the worst week. */
function BenchPoints({ bench }: { bench: Bench | null }) {
  if (bench === null) return <p className="m-0 text-meta text-mute">No bench data yet.</p>;
  const { worst } = bench;
  return (
    <div>
      <div className={QUIET_LABEL}>On The Bench</div>
      <div className="mt-sp-2 text-score leading-none font-extrabold text-ink tabular-nums">
        <span>{num(bench.total)}</span>
        <span className="text-meta font-semibold text-mute">{" points"}</span>
      </div>
      <p className="m-0 mt-sp-1 text-meta text-mute">
        {worst
          ? `Worst in week ${worst.week}: ${num(worst.points)} points, ${worst.name} sat.`
          : "No points left on the bench."}
      </p>
    </div>
  );
}

/* The awards shelf: four counts in one row. A zero count shows in the quiet color, so the shelf reads whole.
   Benchwarmer is the short name of Most Valuable Benchwarmer, so the label fits the row on a phone. */
function AwardsShelf({ awards }: { awards: AwardCounts }) {
  const shelf = [
    { label: "Top Scorer", count: awards.top_scorer },
    {
      label: (
        <abbr title="Most Valuable Benchwarmer" className="no-underline">
          Benchwarmer
        </abbr>
      ),
      count: awards.mvb,
    },
    { label: "Game Changer", count: awards.game_changer },
    { label: "Underperformer", count: awards.underperformer },
  ];
  return (
    <dl role="group" aria-label="Awards Shelf" className="m-0 grid grid-cols-4 gap-sp-2">
      {shelf.map(({ label, count }, i) => (
        <div key={i} className="min-w-0">
          {/* The hyphens let a long label break on a narrow phone column. */}
          <dt className={cn(QUIET_LABEL, "hyphens-auto")}>{label}</dt>
          <dd
            className={cn(
              "m-0 mt-sp-2 text-score leading-none font-extrabold tabular-nums",
              count === 0 ? "text-mute" : "text-ink",
            )}
          >
            {count}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SeasonSoFar({ manager }: { manager: Manager }) {
  return (
    <Chapter reveal id="season">
      <Label heading>Season So Far</Label>
      <PointsLine weeks={manager.weeks} />
      <p className="m-0 mt-sp-2 text-meta text-mute">Points per week against the league median.</p>
      {/* The space between the groups sets them apart, so the chapter reads as three groups. */}
      <div className="mt-sp-6">
        <BenchPoints bench={manager.bench} />
      </div>
      <div className="mt-sp-6">
        <AwardsShelf awards={manager.awards} />
      </div>
    </Chapter>
  );
}
