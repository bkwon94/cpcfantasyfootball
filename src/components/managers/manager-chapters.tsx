/**
 * The five chapters of a manager page under the hero, each with its heading and its id for the chapter rail.
 * Each chapter holds one quiet line until the managers file carries its data.
 */
import type { RailChapter } from "@/components/week/chapter-rail";
import { Chapter, Label } from "@/components/week/parts";
import type { Manager } from "@/lib/manager-types";
import { BestAdds } from "./best-adds";
import { TopPerformers } from "./top-performers";

/* The rail and the page read this one list, so the rail labels match the chapter headings. */
export const MANAGER_CHAPTERS: RailChapter[] = [
  { id: "season", label: "Season So Far" },
  { id: "roster", label: "Roster" },
  { id: "moves", label: "Moves" },
  { id: "best-adds", label: "Best Adds" },
  { id: "top-performers", label: "Top Performers" },
];

/* A chapter with its heading and one quiet line, until the managers file carries its data. */
function Placeholder({ id, label }: RailChapter) {
  return (
    <Chapter reveal id={id}>
      <Label heading>{label}</Label>
      <p className="m-0 text-body text-mute">Nothing here yet.</p>
    </Chapter>
  );
}

const SeasonSoFar = (_: { manager: Manager }) => <Placeholder {...MANAGER_CHAPTERS[0]} />;
const Roster = (_: { manager: Manager }) => <Placeholder {...MANAGER_CHAPTERS[1]} />;
const Moves = (_: { manager: Manager }) => <Placeholder {...MANAGER_CHAPTERS[2]} />;

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
