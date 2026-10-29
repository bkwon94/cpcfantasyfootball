/**
 * The five chapters of a manager page under the hero, each with its heading and its id for the chapter rail.
 * A chapter the managers file does not feed yet holds one quiet line.
 */
import type { RailChapter } from "@/components/week/chapter-rail";
import { Chapter, Label } from "@/components/week/parts";
import type { Manager } from "@/lib/manager-types";
import { Moves } from "./moves";
import { Roster } from "./roster";

/* The rail and the page read this one list, so the rail labels match the chapter headings. */
export const MANAGER_CHAPTERS: RailChapter[] = [
  { id: "season", label: "Season So Far" },
  { id: "roster", label: "Roster" },
  { id: "moves", label: "Moves" },
  { id: "best-adds", label: "Best Adds" },
  { id: "top-performers", label: "Top Performers" },
];

/* A chapter with no data yet: its heading and one quiet line. */
function Placeholder({ id, label }: RailChapter) {
  return (
    <Chapter reveal id={id}>
      <Label heading>{label}</Label>
      <p className="m-0 text-body text-mute">Nothing here yet.</p>
    </Chapter>
  );
}

function SeasonSoFar(_: { manager: Manager }) {
  return <Placeholder {...MANAGER_CHAPTERS[0]} />;
}

function BestAdds(_: { manager: Manager }) {
  return <Placeholder {...MANAGER_CHAPTERS[3]} />;
}

function TopPerformers(_: { manager: Manager }) {
  return <Placeholder {...MANAGER_CHAPTERS[4]} />;
}

export function ManagerChapters({ manager }: { manager: Manager }) {
  return (
    <>
      <SeasonSoFar manager={manager} />
      <Roster manager={manager} />
      <Moves manager={manager} />
      <BestAdds manager={manager} />
      <TopPerformers manager={manager} />
    </>
  );
}
