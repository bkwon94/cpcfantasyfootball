/**
 * The Sleeper CDN headshot of a manager page row, with the swap to the default headshot on an image error.
 * It is a client component, because a server component cannot pass the error handler to the image.
 */
"use client";

import { sleeperHeadshot, swapToDefault } from "@/lib/headshot";

/* The name sits next to the headshot, so the image is decorative. A defense id has no CDN image and swaps to the default. */
export function PlayerHeadshot({ playerId }: { playerId: string }) {
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
