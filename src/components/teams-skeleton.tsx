/**
 * The placeholder of the trade form while the teams load: the heading line, the two pickers, and the button.
 * Each row has the height of a real team row, so the page does not jump when the teams arrive.
 */
"use client";

import { useMotionOff } from "@/lib/motion";
import { cn } from "@/lib/utils";

// The league has 12 teams, so each picker shows 12 rows, like the real list.
const ROWS = 12;

const PICKERS = ["My team", "The other team"] as const;

/* One row in the shape of a team row: the avatar circle, the team name line, and the manager line. */
function SkeletonRow() {
  return (
    <div className="pb-sp-1">
      <div className="flex h-touch items-center gap-sp-3 rounded-card bg-gry px-sp-3">
        <div className="size-avatar flex-none rounded-full bg-wht" />
        <div className="flex min-w-0 flex-1 flex-col gap-sp-1">
          <div className="h-sp-3 w-1/2 rounded-sm bg-wht" />
          <div className="h-sp-2 w-1/4 rounded-sm bg-wht" />
        </div>
      </div>
    </div>
  );
}

export function TeamsSkeleton() {
  const off = useMotionOff();
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading teams"
      // The pulse tells the reader the page works. With motion off, the rows stay still.
      className={cn("flex flex-col gap-sp-5", !off && "animate-pulse")}
    >
      {/* A blank line in the heading type, so the heading takes its real height. */}
      <p aria-hidden="true" className="m-0 text-stat leading-stat font-black">
        <span className="inline-block w-1/2 rounded-sm bg-gry">&nbsp;</span>
      </p>
      {PICKERS.map((label) => (
        <div key={label} aria-hidden="true">
          <p className="m-0 mb-sp-2 p-0 text-label font-bold tracking-wide text-red uppercase">{label}</p>
          <div className="flex flex-col">
            {Array.from({ length: ROWS }, (_, index) => (
              <SkeletonRow key={index} />
            ))}
          </div>
        </div>
      ))}
      <div aria-hidden="true" className="h-touch rounded-card bg-gry" />
    </div>
  );
}
