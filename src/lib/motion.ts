/**
 * The one reduced-motion switch for the site, and the shared motion timings.
 * Every animated component reads useMotionOff, so the reduced-motion media query turns every animation off.
 */
import { useReducedMotion, type TargetAndTransition, type Transition } from "framer-motion";

/* True when the reader asks the system for reduced motion. Framer Motion reads the media query once, when a component mounts. */
export function useMotionOff(): boolean {
  return useReducedMotion() === true;
}

/* The brand ease-out from --ease-out in globals.css. Framer Motion needs the curve as numbers, not as a CSS value. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/* A transition that ends at once. A component uses it for every animation when motion is off. */
export const INSTANT: Transition = { duration: 0 };

/* A short rise for content that enters. Framer Motion accepts a CSS variable for y, so the distance comes from the spacing token. */
export const RISE = "var(--spacing-sp-2)";

/* The ease of the loading sweep. The bar travels both ways, so it eases in and out. */
export const SWEEP_EASE = "easeInOut";

/* The ease of the waiver drift. A headshot drifts there and back, so it eases in and out at each end. */
export const DRIFT_EASE = "easeInOut";

/* Durations in seconds. The page enter is short, so the content is ready to tap almost at once. */
export const DURATION = {
  // The content of the route fades and rises in once.
  page: 0.3,
  // A picker list opens or closes. A layout change needs a little more time than a press.
  collapse: 0.24,
  // The decision word lands. It is a little slower than the rest, so the call lands with a beat.
  decision: 0.36,
  // The fairness line lands under the decision. It is a little faster than the decision word, so the decision stays the lead.
  fairness: 0.3,
  // One pass of the loading sweep. It repeats while the grade runs.
  sweep: 1.4,
  // A section or a card enters the viewport. It is a little slower than the page enter, because the reader watches it arrive.
  reveal: 0.4,
  // A part of the game changer hero enters. It is the slowest reveal, because the hero is the top story of the week page.
  hero: 0.5,
} as const;

/* The gap between two cards that enter together, in seconds. It is short, so a fast scroll never waits on motion. */
export const REVEAL_STAGGER = 0.05;

/* The last step of a stagger. Card ten waits no longer than card four, so a card in a long list never shows late. */
const STAGGER_CAP = 4;

/* The delay of the card at a position in a list. */
export function stagger(index: number): number {
  return Math.min(index, STAGGER_CAP) * REVEAL_STAGGER;
}

/* The delays of the three hero parts, in seconds. The glow comes first, the cutout next, and the points last. */
export const HERO_DELAY = { glow: 0, cutout: 0.08, points: 0.24 } as const;

/* The props of content that fades and rises in once. With motion off, the content shows at rest and the transition is instant. */
export function rise(off: boolean, { duration, delay = 0 }: { duration: number; delay?: number }) {
  return {
    initial: off ? (false as const) : { opacity: 0, y: RISE },
    animate: { opacity: 1, y: 0 } satisfies TargetAndTransition,
    transition: off ? INSTANT : { duration, ease: EASE_OUT, delay },
  };
}
