/**
 * The week 6 page JSON as a typed fixture for the section tests.
 * The tests read the real published file, so a change to the JSON shape breaks them.
 */
import json from "../../../public/2026/week-06/page.json";
import type { WeekPage } from "@/lib/week-types";

export const week6 = json as unknown as WeekPage;
