/**
 * The one reduced-motion switch for the analyzer, and the shared motion timings.
 * Every animated component reads useMotionOff, so the reduced-motion media query turns every animation off.
 */
import { useReducedMotion, type Transition } from "framer-motion";

/* True when the reader asks the system for reduced motion. Framer Motion reads the media query once, when a component mounts. */
export function useMotionOff(): boolean {
  return useReducedMotion() === true;
}

/* The brand ease-out from --ease-out in globals.css. Framer Motion needs the curve as numbers, not as a CSS value. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/* A transition that ends at once. A component uses it for every animation when motion is off. */
export const INSTANT: Transition = { duration: 0 };

/* A short rise for content that enters. A rem unit keeps the distance in step with the type, so no component holds a pixel size. */
export const RISE = "0.5rem";

/* Durations in seconds. The page enter is short, so the content is ready to tap almost at once. */
export const DURATION = {
  // The content of the route fades and rises in once.
  page: 0.3,
  // A picker list opens or closes. A layout change needs a little more time than a press.
  collapse: 0.24,
  // A grade letter lands. It is a little slower than the rest, so the grade lands with a beat.
  grade: 0.36,
  // One pass of the loading sweep. It repeats while the grade runs.
  sweep: 1.4,
} as const;

/* The gap between the asker's letter and the other letter, in seconds. The asker reads the own grade first. */
export const GRADE_STAGGER = 0.2;
