/**
 * The drift field of the waiver page: the top six of the open bucket as headshots that drift in slow motion, each with its price.
 * Each rank has a fixed slot from the layout table, and the drift stops under reduced motion and while the document is hidden.
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { shortName } from "@/lib/format";
import { sleeperHeadshot, swapToDefault } from "@/lib/headshot";
import { DRIFT_EASE, DURATION, INSTANT, rise, stagger, useMotionOff } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { WaiverPlayer } from "@/lib/waiver-types";
import { FIELD, LABEL, SLOTS, TAG, type Slot } from "./field-layout";

/* False while the document is hidden, so a drift in a background tab does not drain the battery.
   The first render reads true, so the static HTML and the first client render match. */
function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const read = () => setVisible(document.visibilityState !== "hidden");
    read();
    document.addEventListener("visibilitychange", read);
    return () => document.removeEventListener("visibilitychange", read);
  }, []);
  return visible;
}

/* The price on a headshot, or no price for a drop. */
export function priceText(player: WaiverPlayer): string | null {
  return player.price ? `$${player.price.bid}` : null;
}

function Orb({
  player,
  slot,
  index,
  open,
  drift,
  off,
  onOpen,
}: {
  player: WaiverPlayer;
  slot: Slot;
  index: number;
  open: boolean;
  drift: boolean;
  off: boolean;
  onOpen: (player: WaiverPlayer) => void;
}) {
  const price = priceText(player);
  // The box is as wide as the headshot or the label, whichever is wider, and its center is the center of the slot.
  const width = Math.max(slot.size, LABEL.width);
  return (
    // The outer box rises in once per bucket, and the inner box drifts, so the two motions never fight over one transform.
    // data-reveal lets the safety rule in globals.css show the headshot if the script never loads.
    <motion.div
      data-reveal
      className="absolute"
      style={{ left: slot.x - width / 2, top: slot.y, width }}
      {...rise(off, { duration: DURATION.reveal, delay: stagger(index) })}
    >
      <motion.div
        animate={drift ? { x: [0, slot.dx], y: [0, slot.dy] } : { x: 0, y: 0 }}
        transition={drift ? { duration: slot.period, ease: DRIFT_EASE, repeat: Infinity, repeatType: "mirror" } : INSTANT}
      >
        <button
          type="button"
          aria-label={price ? `${player.name}, ${price}` : player.name}
          aria-pressed={open}
          onClick={() => onOpen(player)}
          className="press flex w-full cursor-pointer flex-col items-center border-0 bg-transparent p-0 text-inherit [-webkit-tap-highlight-color:transparent]"
        >
          <span className="relative block">
            {/* The geometry comes from the layout table, so the overlap test covers what the page draws. */}
            <img
              src={sleeperHeadshot(player.player_id)}
              alt=""
              onError={swapToDefault}
              style={{ width: slot.size, height: slot.size }}
              className={cn(
                "block rounded-full border-2 bg-ink-2 object-cover object-top shadow-orb",
                open ? "border-on-dark" : "border-red",
              )}
            />
            {price && (
              <span
                style={{ top: -TAG.up, right: -TAG.out }}
                className="absolute rounded-full bg-wht px-sp-1 py-sp-0 text-label leading-tight font-bold text-blk tabular-nums"
              >
                {price}
              </span>
            )}
          </span>
          <span className="mt-sp-1 block w-full truncate text-center text-meta leading-tight font-bold">{shortName(player.name)}</span>
          <span className="block text-label leading-tight text-on-dark-2">{`${player.position} · ${player.team}`}</span>
        </button>
      </motion.div>
    </motion.div>
  );
}

export function DriftField({
  bucket,
  players,
  openId,
  onOpen,
}: {
  bucket: string;
  players: WaiverPlayer[];
  openId: string | null;
  onOpen: (player: WaiverPlayer) => void;
}) {
  const off = useMotionOff();
  const visible = usePageVisible();
  const drift = !off && visible;
  return (
    <div
      role="group"
      aria-label="Top six"
      data-drift={drift ? "on" : "off"}
      className="relative mx-auto"
      style={{ width: FIELD.width, height: FIELD.height }}
    >
      <div aria-hidden className="field-glow" />
      {players.slice(0, SLOTS.length).map((player, index) => (
        // The key holds the bucket, so a tab change mounts new headshots and they rise in again.
        <Orb
          key={`${bucket}-${player.player_id}`}
          player={player}
          slot={SLOTS[index]}
          index={index}
          open={player.player_id === openId}
          drift={drift}
          off={off}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
