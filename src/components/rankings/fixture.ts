/**
 * The season rankings file as a typed fixture for the rankings tests.
 * It is in the exact shape the pipeline writes, with the week 6 teams and records, so a change to that shape breaks the tests.
 */
import json from "./fixture.json";
import type { Rankings } from "@/lib/rankings-types";

export const rankings = json as unknown as Rankings;
