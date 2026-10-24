/**
 * The waiver file as a typed fixture for the waiver tests.
 * It is in the exact shape the pipeline writes, with real Sleeper player ids, so a change to that shape breaks the tests.
 */
import json from "./fixture.json";
import type { WaiverBoard } from "@/lib/waiver-types";

export const waiver = json as unknown as WaiverBoard;
