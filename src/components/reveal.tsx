/**
 * The one reveal of the site: content fades and rises in once, when it enters the viewport or when it mounts.
 * It is the client leaf of the static pages, so the sections around it stay server components.
 */
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { DURATION, EASE_OUT, INSTANT, RISE, useMotionOff } from "@/lib/motion";

/* The content reveals a little after its top edge enters the screen, so the reader sees the motion and not only its end. */
const VIEW_MARGIN = "0% 0% -8% 0%";

const HIDDEN = { opacity: 0, y: RISE };
const SHOWN = { opacity: 1, y: 0 };

type RevealProps = {
  children: ReactNode;
  // "view" waits for the viewport. "mount" plays at once, for the content of a route.
  trigger?: "view" | "mount";
  // The stagger of a card in a list, in seconds.
  delay?: number;
  duration?: number;
  // The layout classes of the revealed box. Only opacity and transform animate, so the box keeps its size and place.
  className?: string;
};

export function Reveal({ children, trigger = "view", delay = 0, duration = DURATION.reveal, className }: RevealProps) {
  const off = useMotionOff();
  // The static HTML holds the start state, and the first client render must match it, so the start state is the same
  // with motion off. With motion off the content then goes to rest at once on mount and never waits for the viewport.
  // The data-reveal rule in globals.css shows the content at rest before the script loads, for reduced motion and no script.
  const play = off || trigger === "mount" ? { animate: SHOWN } : { whileInView: SHOWN, viewport: { once: true, margin: VIEW_MARGIN } };
  return (
    <motion.div
      data-reveal
      className={className}
      initial={HIDDEN}
      {...play}
      transition={off ? INSTANT : { duration, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
