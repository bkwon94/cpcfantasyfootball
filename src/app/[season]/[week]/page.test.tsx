/**
 * Tests for the week page. They render the page with the real public/ data and read what a reader sees.
 * The week 7 JSON is the fixture, so these tests break if the publish layout changes.
 */
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import WeekPage from "./page";

/* The nine chapters in the report's order: the id each chapter sets and the words of its own label. */
const CHAPTERS = [
  { id: "motw", label: "Matchup of the Week" },
  { id: "game-changer", label: "Game Changer" },
  { id: "awards", label: "Awards" },
  { id: "leaders", label: "Position Leaders" },
  { id: "trades", label: "Trades" },
  { id: "matchups", label: "All Matchups" },
  { id: "median", label: "The Median Game" },
  { id: "standings", label: "Standings" },
  { id: "next-week", label: "Next Week" },
];

/* The reduced-motion setting of the system. A test turns it on, and the stub tells Framer Motion of the change. */
let reduceMotion = false;
let motionChange: (() => void) | undefined;

function setReducedMotion(on: boolean) {
  reduceMotion = on;
  motionChange?.();
}

/* jsdom has no matchMedia. Framer Motion reads it once per file and then listens for a change, so the stub runs at the top. */
vi.stubGlobal(
  "matchMedia",
  (query: string) =>
    ({
      // Framer Motion asks for "(prefers-reduced-motion)" with no value, so the stub matches the feature name.
      get matches() {
        return reduceMotion && query.includes("prefers-reduced-motion");
      },
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (_type: string, listener: () => void) => {
        motionChange = listener;
      },
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList,
);

/* jsdom has no IntersectionObserver. The stub keeps each observer and its targets, so a test reports a chapter in or out of view. */
const observers = new Set<ObserverStub>();

class ObserverStub {
  targets: Element[] = [];
  constructor(private callback: IntersectionObserverCallback) {
    observers.add(this);
  }
  observe(target: Element) {
    this.targets.push(target);
  }
  unobserve() {}
  disconnect() {
    observers.delete(this);
  }
  takeRecords() {
    return [];
  }
}

vi.stubGlobal("IntersectionObserver", ObserverStub);

/* Reports to each observer of the chapter with this id that the chapter is in or out of view, as a scroll does. */
function reportChapter(id: string, inView: boolean) {
  act(() => {
    for (const observer of observers) {
      const target = observer.targets.find((item) => item.id === id);
      if (!target) continue;
      const entry = { isIntersecting: inView, target } as IntersectionObserverEntry;
      observer["callback"]([entry], observer as unknown as IntersectionObserver);
    }
  });
}

/* The rail link of the chapter with this label. */
function railLink(label: string) {
  return within(screen.getByRole("navigation", { name: "Chapters" })).getByRole("link", { name: label });
}

/* The labels of the rail links that carry the current state. */
function currentLabels() {
  const links = within(screen.getByRole("navigation", { name: "Chapters" })).getAllByRole("link");
  return links.filter((link) => link.hasAttribute("aria-current")).map((link) => link.textContent);
}

/* Renders the week 7 report as the static export builds it. */
async function renderWeek7() {
  render(await WeekPage({ params: Promise.resolve({ season: "2026", week: "week-07" }) }));
}

afterEach(() => {
  cleanup();
  setReducedMotion(false);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("WeekPage chapters", () => {
  it("renders the nine chapters in the report's order with their ids", async () => {
    await renderWeek7();
    const main = screen.getByRole("main");
    const chapters = CHAPTERS.map(({ id }) => document.getElementById(id));
    chapters.forEach((chapter, index) => {
      expect(chapter, CHAPTERS[index].id).toBeTruthy();
      expect(main.contains(chapter)).toBe(true);
      expect(chapter?.textContent).toContain(CHAPTERS[index].label);
    });
    // Each chapter comes after the one before it in the document.
    for (let index = 1; index < chapters.length; index++) {
      const order = chapters[index - 1]!.compareDocumentPosition(chapters[index]!);
      expect(order & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });
});

describe("WeekPage chapter rail", () => {
  it("is a labeled navigation landmark with a link to each chapter in order", async () => {
    await renderWeek7();
    const rail = screen.getByRole("navigation", { name: "Chapters" });
    const links = within(rail).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(CHAPTERS.map(({ label }) => label));
    expect(links.map((link) => link.getAttribute("href"))).toEqual(CHAPTERS.map(({ id }) => `#${id}`));
  });

  it("links only to ids that the page renders", async () => {
    await renderWeek7();
    const links = within(screen.getByRole("navigation", { name: "Chapters" })).getAllByRole("link");
    for (const link of links) {
      expect(document.getElementById(link.getAttribute("href")!.slice(1))).toBeTruthy();
    }
  });
});

describe("WeekPage chapter in view", () => {
  it("marks the chapter that the observer reports in view", async () => {
    await renderWeek7();
    expect(currentLabels()).toEqual([]);
    reportChapter("awards", true);
    expect(railLink("Awards").getAttribute("aria-current")).toBe("location");
    expect(currentLabels()).toEqual(["Awards"]);
  });

  it("moves the mark when another chapter comes into view", async () => {
    await renderWeek7();
    reportChapter("awards", true);
    reportChapter("awards", false);
    reportChapter("standings", true);
    expect(currentLabels()).toEqual(["Standings"]);
  });

  it("marks the chapter nearest the top when two chapters are in view", async () => {
    await renderWeek7();
    reportChapter("median", true);
    reportChapter("standings", true);
    expect(currentLabels()).toEqual(["The Median Game"]);
    reportChapter("median", false);
    expect(currentLabels()).toEqual(["Standings"]);
  });
});

describe("WeekPage with motion off", () => {
  it("renders every chapter and the rail at rest, and the mark still moves", async () => {
    setReducedMotion(true);
    await renderWeek7();
    // jsdom ignores opacity, so the test proves the content is there on the first render. The browser pass proves no motion.
    for (const { id, label } of CHAPTERS) {
      expect(document.getElementById(id)?.textContent).toContain(label);
      expect(railLink(label).getAttribute("href")).toBe(`#${id}`);
    }
    reportChapter("standings", true);
    expect(currentLabels()).toEqual(["Standings"]);
  });
});

/* The week footer tests go here. */
