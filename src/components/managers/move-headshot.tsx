/**
 * The round Sleeper CDN headshot of one player on the Moves chapter, by player id.
 * It is a client leaf, so the image error handler can swap a missing CDN image to the default.
 */
"use client";

import { sleeperHeadshot, swapToDefault } from "@/lib/headshot";

/* The player name sits next to the headshot, so the image is decorative. A defense id has no CDN image, so it gets the default. */
export function MoveHeadshot({ playerId }: { playerId: string }) {
  return (
    <img
      src={sleeperHeadshot(playerId)}
      alt=""
      loading="lazy"
      onError={swapToDefault}
      className="size-avatar flex-none rounded-full bg-gry object-cover object-top"
    />
  );
}
