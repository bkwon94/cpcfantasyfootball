/**
 * Tests for the analyzer: the passphrase dialog, the teams fetch, and the two team pickers.
 * fetch is a test stub. Each test reads the screen and the stored passphrase.
 */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Analyzer } from "./analyzer";

const TEAMS = {
  teams: [
    { roster_id: 1, team: "Gridiron Ghosts", manager: "Ana", avatar: null, players: [] },
    { roster_id: 2, team: "Blitz Bakers", manager: "Ben", avatar: "https://cdn.test/b.png", players: [] },
    { roster_id: 3, team: "Punt Punks", manager: "Cy", players: [] },
  ],
};

const fetchStub = vi.fn();

function answer(status: number, body: unknown = {}, headers: Record<string, string> = {}) {
  fetchStub.mockResolvedValueOnce(new Response(JSON.stringify(body), { status, headers }));
}

beforeEach(() => {
  localStorage.clear();
  fetchStub.mockReset();
  vi.stubGlobal("fetch", fetchStub);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function submitPassphrase(value: string) {
  fireEvent.change(await screen.findByLabelText("Passphrase"), { target: { value } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

describe("Analyzer", () => {
  it("shows the dialog and no pickers on first load", async () => {
    render(<Analyzer />);
    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(screen.queryByText("My team")).toBeNull();
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("fetches the teams with the header after a submit and shows both pickers", async () => {
    answer(200, TEAMS);
    render(<Analyzer />);
    await submitPassphrase("localtest");

    expect(await screen.findByText("Pick the teams")).toBeTruthy();
    const [url, init] = fetchStub.mock.calls[0];
    expect(url).toContain("/teams?season=2026");
    expect(init.headers["X-League-Passphrase"]).toBe("localtest");
    expect(localStorage.getItem("cpc.passphrase")).toBe("localtest");
    expect(screen.getByRole("group", { name: "My team" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "The other team" })).toBeTruthy();
    expect(screen.getAllByText("Gridiron Ghosts")).toHaveLength(2);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("skips the dialog when a passphrase is stored", async () => {
    localStorage.setItem("cpc.passphrase", "localtest");
    answer(200, TEAMS);
    render(<Analyzer />);

    expect(await screen.findByText("Pick the teams")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(fetchStub.mock.calls[0][1].headers["X-League-Passphrase"]).toBe("localtest");
  });

  it("clears the passphrase on a 401, shows the error, and fetches again after a new submit", async () => {
    localStorage.setItem("cpc.passphrase", "wrong");
    answer(401, { detail: "bad passphrase" });
    render(<Analyzer />);

    expect(await screen.findByText("That passphrase is wrong.")).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(localStorage.getItem("cpc.passphrase")).toBeNull();

    answer(200, TEAMS);
    await submitPassphrase("localtest");
    expect(await screen.findByText("Pick the teams")).toBeTruthy();
    expect(fetchStub).toHaveBeenCalledTimes(2);
  });

  it("shows the wait time on a 429", async () => {
    localStorage.setItem("cpc.passphrase", "localtest");
    answer(429, { detail: "slow down" }, { "Retry-After": "30" });
    render(<Analyzer />);
    expect(await screen.findByText("Too many requests. Try again in 30 seconds.")).toBeTruthy();
  });

  it("shows a retry button when the API fails, and the button fetches again", async () => {
    localStorage.setItem("cpc.passphrase", "localtest");
    answer(500);
    render(<Analyzer />);
    expect(await screen.findByText("The API did not answer. Try again.")).toBeTruthy();

    answer(200, TEAMS);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Pick the teams")).toBeTruthy();
  });

  it("disables the team that the other picker holds", async () => {
    localStorage.setItem("cpc.passphrase", "localtest");
    answer(200, TEAMS);
    render(<Analyzer />);
    await screen.findByText("Pick the teams");

    const mine = screen.getByRole("group", { name: "My team" });
    const other = screen.getByRole("group", { name: "The other team" });
    const radio = (group: HTMLElement, name: string) =>
      Array.from(group.querySelectorAll<HTMLInputElement>("input")).find((i) => i.closest("label")?.textContent?.includes(name))!;

    fireEvent.click(radio(mine, "Gridiron Ghosts"));
    await waitFor(() => expect(radio(other, "Gridiron Ghosts").disabled).toBe(true));
    expect(radio(other, "Blitz Bakers").disabled).toBe(false);

    fireEvent.click(radio(other, "Blitz Bakers"));
    // A pick collapses my picker to one row, so the test opens it again to see the other rows.
    fireEvent.click(screen.getByRole("button", { name: "Change my team" }));
    await waitFor(() => expect(radio(mine, "Blitz Bakers").disabled).toBe(true));
    expect(radio(mine, "Gridiron Ghosts").disabled).toBe(false);
  });
});
