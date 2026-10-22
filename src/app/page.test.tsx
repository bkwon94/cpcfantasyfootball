/**
 * Tests for the home page. They render the page with the real public/ data and read what a reader sees.
 * The week 6 JSON is the fixture, so these tests break if the publish layout changes.
 */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { season } from "@/lib/config";
import HomePage from "./page";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
  sessionStorage.clear();
});

describe("HomePage", () => {
  it("names the site and the page", () => {
    render(<HomePage />);
    expect(screen.getByText("League Weekly")).toBeTruthy();
    // The label and the red season number are separate text nodes.
    expect(screen.getByText("SEASON")).toBeTruthy();
    expect(screen.getByText(String(season)).className).toContain("text-red");
    expect(screen.getByText("Published weeks")).toBeTruthy();
  });

  it("links week 6 with its dates and teams", () => {
    render(<HomePage />);
    const link = screen.getByRole("link", { name: /Week 6/ });
    expect(link.getAttribute("href")).toBe("/2026/week-06/");
    expect(screen.getByText("Week 6")).toBeTruthy();
    expect(screen.getByText("Oct 15 – Oct 19, 2026")).toBeTruthy();
    expect(screen.getByText("behold the lamb vs Bo Girds")).toBeTruthy();
  });

  it("shows no empty-list blurb when weeks exist", () => {
    render(<HomePage />);
    expect(screen.queryByText("No weeks are published yet.")).toBeNull();
  });

  it("links the trade analyzer", () => {
    render(<HomePage />);
    const link = screen.getByRole("link", { name: /Trade Analyzer/ });
    expect(link.getAttribute("href")).toMatch(/\/analyze\/$/);
  });

  it("fetches the teams in the background and stores them when a passphrase is stored", async () => {
    localStorage.setItem("cpc.passphrase", "localtest");
    const teams = [{ roster_id: 1, team: "Gridiron Ghosts", manager: "Ana", avatar: null, players: [] }];
    const fetchStub = vi.fn().mockResolvedValue(new Response(JSON.stringify({ teams })));
    vi.stubGlobal("fetch", fetchStub);
    render(<HomePage />);

    // The list renders without a wait on the fetch.
    expect(screen.getByText("Week 6")).toBeTruthy();
    await waitFor(() => expect(sessionStorage.getItem("cpc.teams.2026")).not.toBeNull());
    expect(fetchStub.mock.calls[0][1].headers["X-League-Passphrase"]).toBe("localtest");
    expect(JSON.parse(sessionStorage.getItem("cpc.teams.2026")!).teams[0].team).toBe("Gridiron Ghosts");
  });

  it("skips the fetch with no passphrase", () => {
    const fetchStub = vi.fn();
    vi.stubGlobal("fetch", fetchStub);
    render(<HomePage />);
    expect(fetchStub).not.toHaveBeenCalled();
  });
});
