/**
 * Tests for the trade form: the player rows, the submit gate, the post body, and each error state.
 * fetch is a test stub, and each test reads the screen.
 */
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fixtureJson from "../../.scratch/site-react/fixtures/analyze-response.json";
import findJson from "../../.scratch/site-react/fixtures/find-response.json";
import type { Team } from "@/lib/api";
import { TradeForm } from "./trade-form";

// The finder flag is a build-time value, so the tests switch it through a mock of the config module.
const flags = vi.hoisted(() => ({ finderOn: false }));
vi.mock("@/lib/config", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/config")>()),
  get finderOn() {
    return flags.finderOn;
  },
}));

const player = (id: string, name: string) => ({
  player_id: id,
  name,
  position: "WR",
  nfl_team: "NYJ",
  headshot: `https://cdn.test/${id}.png`,
});

const TEAMS: Team[] = [
  { roster_id: 4, team: "Pukancun on 3", manager: "Ana", avatar: null, players: [player("p1", "Ana One"), player("p2", "Ana Two")] },
  { roster_id: 12, team: "Blitz Bakers", manager: "Ben", avatar: null, players: [player("p3", "Ben One"), player("p4", "Ben Two")] },
  { roster_id: 7, team: "Punt Punks", manager: "Cy", avatar: null, players: [player("p5", "Cy One")] },
];

const fetchStub = vi.fn();
const onUnauthorized = vi.fn();

function answer(status: number, body: unknown = {}, headers: Record<string, string> = {}) {
  fetchStub.mockResolvedValueOnce(new Response(JSON.stringify(body), { status, headers }));
}

const group = (name: string) => screen.getByRole("group", { name });
/* The team name shows in both pickers, so a test names the picker too. */
const radio = (picker: "My team" | "The other team", team: string) =>
  within(group(picker)).getByRole("radio", { name: new RegExp(team) });
const submit = () => screen.getByRole("button", { name: "Grade the trade" }) as HTMLButtonElement;

/* Picks my team and the other team, then one player on each side. */
function pickTrade() {
  fireEvent.click(radio("My team", "Pukancun on 3"));
  fireEvent.click(radio("The other team", "Blitz Bakers"));
  fireEvent.click(screen.getByLabelText(/Ana One/));
  fireEvent.click(screen.getByLabelText(/Ben Two/));
}

beforeEach(() => {
  fetchStub.mockReset();
  onUnauthorized.mockReset();
  vi.stubGlobal("fetch", fetchStub);
  render(<TradeForm teams={TEAMS} passphrase="localtest" onUnauthorized={onUnauthorized} />);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("TradeForm", () => {
  it("shows the player rows of a picked team", () => {
    expect(screen.queryByRole("group", { name: "Pukancun on 3 gives" })).toBeNull();
    fireEvent.click(radio("My team", "Pukancun on 3"));
    const list = group("Pukancun on 3 gives");
    expect(list.querySelectorAll("input[type=checkbox]")).toHaveLength(2);
    expect(list.textContent).toContain("Ana One");
    expect(list.textContent).toContain("WR NYJ");
  });

  it("swaps a failed headshot to the default image once", () => {
    fireEvent.click(radio("My team", "Pukancun on 3"));
    const img = group("Pukancun on 3 gives").querySelector("img")!;
    fireEvent.error(img);
    expect(img.getAttribute("src")).toContain("/images/headshot-default.svg");
  });

  it("keeps submit off until each side gives a player", () => {
    expect(submit().disabled).toBe(true);
    fireEvent.click(radio("My team", "Pukancun on 3"));
    fireEvent.click(radio("The other team", "Blitz Bakers"));
    fireEvent.click(screen.getByLabelText(/Ana One/));
    expect(submit().disabled).toBe(true);
    fireEvent.click(screen.getByLabelText(/Ben Two/));
    expect(submit().disabled).toBe(false);
  });

  it("collapses a picked team to its row with a Change control", async () => {
    fireEvent.click(radio("My team", "Pukancun on 3"));
    await waitFor(() => expect(within(group("My team")).getAllByRole("radio")).toHaveLength(1));
    expect((radio("My team", "Pukancun on 3") as HTMLInputElement).checked).toBe(true);
    expect(within(group("My team")).getByRole("button", { name: "Change my team" })).toBeTruthy();
    // The other picker stays open until it has a pick.
    expect(within(group("The other team")).getAllByRole("radio")).toHaveLength(3);
  });

  it("shows the full list again after Change, with the pick kept", async () => {
    fireEvent.click(radio("My team", "Pukancun on 3"));
    await waitFor(() => expect(within(group("My team")).getAllByRole("radio")).toHaveLength(1));
    fireEvent.click(screen.getByRole("button", { name: "Change my team" }));
    expect(within(group("My team")).getAllByRole("radio")).toHaveLength(3);
    expect((radio("My team", "Pukancun on 3") as HTMLInputElement).checked).toBe(true);
    expect(within(group("My team")).queryByRole("button", { name: "Change my team" })).toBeNull();
  });

  it("clears the picks of a side when its team changes", () => {
    pickTrade();
    fireEvent.click(screen.getByRole("button", { name: "Change the other team" }));
    fireEvent.click(radio("The other team", "Punt Punks"));
    expect(submit().disabled).toBe(true);
    expect((screen.getByLabelText(/Ana One/) as HTMLInputElement).checked).toBe(true);
  });

  it("posts my team first with the picked ids and the asker", async () => {
    answer(200, fixtureJson);
    pickTrade();
    fireEvent.click(submit());
    await screen.findByText("Not as is");

    const [url, init] = fetchStub.mock.calls[0];
    expect(url).toContain("/analyze");
    expect(init.method).toBe("POST");
    expect(init.headers["X-League-Passphrase"]).toBe("localtest");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({
      season: 2026,
      sides: [
        { roster_id: 4, gives: ["p1"] },
        { roster_id: 12, gives: ["p4"] },
      ],
      asker: 4,
    });
  });

  it("shows the loading line while the grade runs", async () => {
    fetchStub.mockReturnValueOnce(new Promise(() => {}));
    pickTrade();
    fireEvent.click(submit());
    expect(await screen.findByText("Grading the trade")).toBeTruthy();
    expect(screen.getByText("This can take up to a minute on a new chart week.")).toBeTruthy();
    const busy = screen.getByRole("button", { name: "Grading…" }) as HTMLButtonElement;
    expect(busy.disabled).toBe(true);
    expect(busy.getAttribute("aria-busy")).toBe("true");
  });

  it("locks the rows and the pickers while the grade runs, and unlocks them on the result", async () => {
    let finish!: (response: Response) => void;
    fetchStub.mockReturnValueOnce(new Promise<Response>((resolve) => (finish = resolve)));
    pickTrade();
    fireEvent.click(submit());
    await screen.findByText("Grading the trade");

    const row = screen.getByLabelText(/Ana Two/) as HTMLInputElement;
    expect(row.disabled).toBe(true);
    expect(row.closest("label")!.getAttribute("aria-disabled")).toBe("true");
    // A tap lands on the row, so the test taps the label, not the input.
    fireEvent.click(row.closest("label")!);
    expect(row.checked).toBe(false);
    expect((screen.getByLabelText(/Ana One/) as HTMLInputElement).checked).toBe(true);
    expect((radio("My team", "Pukancun on 3") as HTMLInputElement).disabled).toBe(true);
    expect((radio("The other team", "Blitz Bakers") as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Change my team" }) as HTMLButtonElement).disabled).toBe(true);

    await act(async () => finish(new Response(JSON.stringify(fixtureJson), { status: 200 })));
    await screen.findByText("Not as is");
    expect(row.disabled).toBe(false);
    expect(row.closest("label")!.hasAttribute("aria-disabled")).toBe(false);
    expect(submit().hasAttribute("aria-busy")).toBe(false);
    fireEvent.click(row.closest("label")!);
    expect(row.checked).toBe(true);
  });

  it("unlocks the rows after a 422, so a tap fixes the trade", async () => {
    answer(422, { detail: { message: "Player p1 is not on the giving roster.", player_id: "p1" } });
    pickTrade();
    fireEvent.click(submit());
    await screen.findByText("Player p1 is not on the giving roster.");
    const row = screen.getByLabelText(/Ana One/) as HTMLInputElement;
    expect(row.disabled).toBe(false);
    fireEvent.click(row.closest("label")!);
    expect(row.checked).toBe(false);
    expect((radio("The other team", "Blitz Bakers") as HTMLInputElement).disabled).toBe(false);
  });

  it("unlocks the rows after a 429", async () => {
    answer(429, { detail: "slow down" }, { "Retry-After": "12" });
    pickTrade();
    fireEvent.click(submit());
    await screen.findByText("Too many requests. Try again in 12 seconds.");
    const row = screen.getByLabelText(/Ana Two/) as HTMLInputElement;
    fireEvent.click(row.closest("label")!);
    expect(row.checked).toBe(true);
  });

  it("clears the old result when a new submit starts", async () => {
    answer(200, fixtureJson);
    pickTrade();
    fireEvent.click(submit());
    await screen.findByText("Not as is");

    fetchStub.mockReturnValueOnce(new Promise(() => {}));
    fireEvent.click(submit());
    await screen.findByText("Grading the trade");
    expect(screen.queryByText("Not as is")).toBeNull();
  });

  it("shows the API message on a 422", async () => {
    answer(422, { detail: { message: "Player p1 is not on the giving roster.", player_id: "p1" } });
    pickTrade();
    fireEvent.click(submit());
    expect(await screen.findByText("Player p1 is not on the giving roster.")).toBeTruthy();
  });

  it("shows the wait time on a 429", async () => {
    answer(429, { detail: "slow down" }, { "Retry-After": "12" });
    pickTrade();
    fireEvent.click(submit());
    expect(await screen.findByText("Too many requests. Try again in 12 seconds.")).toBeTruthy();
  });

  it("shows the no-grade line on a 503", async () => {
    answer(503, { detail: "no chart" });
    pickTrade();
    fireEvent.click(submit());
    expect(await screen.findByText("No grade this week yet. The chart is not on the server.")).toBeTruthy();
  });

  it("asks for the passphrase again on a 401", async () => {
    answer(401, { detail: "bad passphrase" });
    pickTrade();
    fireEvent.click(submit());
    await waitFor(() => expect(onUnauthorized).toHaveBeenCalledTimes(1));
  });

  it("shows a retry button on another failure, and the button posts again", async () => {
    answer(500);
    pickTrade();
    fireEvent.click(submit());
    expect(await screen.findByText("The API did not answer. Try again.")).toBeTruthy();

    answer(200, fixtureJson);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByText("Not as is");
    expect(fetchStub).toHaveBeenCalledTimes(2);
  });

  it("aborts after 60 seconds, shows the timeout line, and the retry posts again", async () => {
    vi.useFakeTimers();
    fetchStub.mockImplementationOnce(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal!.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
        }),
    );
    pickTrade();
    fireEvent.click(submit());
    await act(() => vi.advanceTimersByTimeAsync(60_000));

    expect(screen.getByText("The grade took too long.")).toBeTruthy();
    fetchStub.mockReturnValueOnce(new Promise(() => {}));
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(fetchStub).toHaveBeenCalledTimes(2);
    expect(fetchStub.mock.calls[1][1].body).toBe(fetchStub.mock.calls[0][1].body);
  });

  it("aborts a pending grade on unmount without an error or a state update", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    let signal: AbortSignal | undefined;
    fetchStub.mockImplementationOnce(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          signal = init.signal!;
          signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
        }),
    );
    pickTrade();
    fireEvent.click(submit());
    await screen.findByText("Grading the trade");

    cleanup();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(signal!.aborted).toBe(true);
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

/* The finder cards hand their trade to the form. The fixture finder pair is roster 2 and roster 3, so these tests render those teams. */
describe("TradeForm with the finder", () => {
  afterEach(() => {
    flags.finderOn = false;
  });

  const [first] = findJson.trades;
  const pairTeams: Team[] = first.sides.map((side) => ({
    roster_id: side.roster_id,
    team: side.team,
    manager: `Manager ${side.roster_id}`,
    avatar: null,
    // Every player of the fixture trades is on the roster of the side that gives him.
    players: findJson.trades.flatMap((t) => t.sides.find((s) => s.roster_id === side.roster_id)!.gives),
  }));

  beforeEach(() => {
    cleanup();
    flags.finderOn = true;
    render(<TradeForm teams={pairTeams} passphrase="localtest" onUnauthorized={onUnauthorized} />);
  });

  it("shows the finder when the flag is on", () => {
    fireEvent.click(radio("My team", "All You Need Is Love"));
    expect(screen.getByRole("group", { name: "Trade partner" })).toBeTruthy();
  });

  it("hides the finder when the flag is off, with my team picked", () => {
    flags.finderOn = false;
    cleanup();
    render(<TradeForm teams={pairTeams} passphrase="localtest" onUnauthorized={onUnauthorized} />);
    fireEvent.click(radio("My team", "All You Need Is Love"));
    expect(screen.queryByRole("group", { name: "Trade partner" })).toBeNull();
  });

  it("shows no finder until my team is picked", () => {
    expect(screen.queryByRole("group", { name: "Trade partner" })).toBeNull();
    fireEvent.click(radio("My team", "All You Need Is Love"));
    expect(screen.getByRole("group", { name: "Trade partner" })).toBeTruthy();
  });

  /* Finds with the fixture partner and taps "See the full result" on a card. */
  async function openCard(finderDoc: unknown, index: number) {
    fireEvent.click(radio("My team", "All You Need Is Love"));
    answer(200, finderDoc);
    fireEvent.click(within(group("Trade partner")).getByRole("radio", { name: /Lil Fridge/ }));
    fireEvent.click(screen.getByRole("button", { name: "Find a trade" }));
    const cards = await screen.findAllByRole("article");
    answer(200, fixtureJson);
    fireEvent.click(within(cards[index]).getByRole("button", { name: "See the full result" }));
    await screen.findByText("Not as is");
  }

  it("resets the partner and the cards when my team changes", async () => {
    fireEvent.click(radio("My team", "All You Need Is Love"));
    answer(200, findJson);
    fireEvent.click(within(group("Trade partner")).getByRole("radio", { name: /Lil Fridge/ }));
    fireEvent.click(screen.getByRole("button", { name: "Find a trade" }));
    await screen.findAllByRole("article");

    fireEvent.click(screen.getByRole("button", { name: "Change my team" }));
    fireEvent.click(radio("My team", "Lil Fridge"));
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    const partners = within(group("Trade partner")).getAllByRole("radio") as HTMLInputElement[];
    expect(partners.every((p) => !p.checked)).toBe(true);
    expect((screen.getByRole("button", { name: "Find a trade" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("scrolls the result into view after a card opens its full result", async () => {
    // jsdom has no scrollIntoView, so the test supplies one.
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    await openCard(findJson, 1);
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  it("grades the trade of a card with the season of the finder document", async () => {
    Element.prototype.scrollIntoView = vi.fn();
    await openCard({ ...findJson, season: 2025 }, 1);
    expect(JSON.parse(fetchStub.mock.calls[1][1].body).season).toBe(2025);
  });

  it("grades the trade of a card through the analyze route and shows the full result", async () => {
    Element.prototype.scrollIntoView = vi.fn();
    fireEvent.click(radio("My team", "All You Need Is Love"));
    answer(200, findJson);
    fireEvent.click(within(group("Trade partner")).getByRole("radio", { name: /Lil Fridge/ }));
    fireEvent.click(screen.getByRole("button", { name: "Find a trade" }));
    const cards = await screen.findAllByRole("article");
    expect(cards).toHaveLength(3);

    answer(200, fixtureJson);
    fireEvent.click(within(cards[1]).getByRole("button", { name: "See the full result" }));
    await screen.findByText("Not as is");

    const [url, init] = fetchStub.mock.calls[1];
    expect(url).toContain("/analyze");
    expect(JSON.parse(init.body)).toEqual({
      season: 2026,
      sides: [
        { roster_id: 2, gives: ["12527"] },
        { roster_id: 3, gives: ["11560", "5947"] },
      ],
      asker: 2,
    });
    // The form shows the trade of the card, so the picks match the result.
    expect((screen.getByLabelText(/Ashton Jeanty/) as HTMLInputElement).checked).toBe(true);
  });
});
