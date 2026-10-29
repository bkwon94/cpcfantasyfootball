/**
 * The Roster chapter of a manager page: the four slot ranks of the roster grade, one line each, in the file's order.
 * Each line reads as "RB · 2nd of 12 · deep". A roster with no grade shows one quiet line.
 */
import { Chapter, Label } from "@/components/week/parts";
import { ordinal } from "@/lib/format";
import type { Manager, SlotRank } from "@/lib/manager-types";

/* A slot rank ranks the twelve teams of the league, 1 to 12, so the line reads out of twelve. */
const LEAGUE_TEAMS = 12;

/* One line: the position as the quiet label, the rank as the one emphasis, and the depth word in the quiet color.
   The separators sit in the quiet color, so the rank stays the one thing in ink. */
function SlotLine({ slot }: { slot: SlotRank }) {
  return (
    <li className="flex items-baseline gap-sp-2 tabular-nums">
      <span className="w-sp-6 flex-none text-label font-semibold tracking-caps text-mute uppercase">{slot.position}</span>
      <span className="text-meta text-mute">{" · "}</span>
      <span>
        <span className="text-body font-extrabold text-ink">{ordinal(slot.rank)}</span>
        <span className="text-meta font-semibold text-mute">{` of ${LEAGUE_TEAMS}`}</span>
      </span>
      <span className="text-meta text-mute">{" · "}</span>
      <span className="text-meta text-mute">{slot.depth}</span>
    </li>
  );
}

export function Roster({ manager }: { manager: Manager }) {
  return (
    // The id and the heading match the roster entry of MANAGER_CHAPTERS. This file does not import the list,
    // because manager-chapters imports this file and the two must not form a loop.
    <Chapter reveal id="roster">
      <Label heading>Roster</Label>
      {manager.grade ? (
        // The gap gives each line air, so the four ranks read as four groups.
        <ol className="m-0 flex list-none flex-col gap-sp-3 p-0">
          {manager.grade.slots.map((slot) => (
            <SlotLine key={slot.position} slot={slot} />
          ))}
        </ol>
      ) : (
        <p className="m-0 text-body text-mute">No grade yet.</p>
      )}
    </Chapter>
  );
}
