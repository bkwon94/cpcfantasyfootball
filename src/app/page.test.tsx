/**
 * Tests for the home page. They render the page with the real public/ data and read what a reader sees.
 * The week 6 JSON is the fixture, so these tests break if the publish layout changes.
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import HomePage from "./page";

afterEach(() => {
  cleanup();
});

describe("HomePage", () => {
  it("names the site and the page", () => {
    render(<HomePage />);
    expect(screen.getByText("League Weekly")).toBeTruthy();
    expect(screen.getByText("ALL WEEKS")).toBeTruthy();
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
});
