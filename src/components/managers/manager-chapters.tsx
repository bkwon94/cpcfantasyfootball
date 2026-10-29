/**
 * The five chapters of a manager page under the hero, each with its heading and its id for the chapter rail.
 * Each chapter holds one quiet line until the managers file carries its data.
 */
import type { RailChapter } from "@/components/week/chapter-rail";
import { Chapter, Label } from "@/components/week/parts";

/* The rail and the page read this one list, so the rail labels match the chapter headings. */
export const MANAGER_CHAPTERS: RailChapter[] = [
  { id: "season", label: "Season So Far" },
  { id: "roster", label: "Roster" },
  { id: "moves", label: "Moves" },
  { id: "best-adds", label: "Best Adds" },
  { id: "top-performers", label: "Top Performers" },
];

export function ManagerChapters() {
  return (
    <>
      {MANAGER_CHAPTERS.map(({ id, label }) => (
        <Chapter key={id} reveal id={id}>
          <Label heading>{label}</Label>
          <p className="m-0 text-body text-mute">Nothing here yet.</p>
        </Chapter>
      ))}
    </>
  );
}
