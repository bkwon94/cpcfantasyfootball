/**
 * Tests for the masthead. They read the title, the subtitle, and the week line from the screen.
 * They check what a reader sees, not the class names.
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Masthead } from "./masthead";

afterEach(() => {
  cleanup();
});

describe("Masthead", () => {
  it("shows the title and the subtitle in the home link", () => {
    render(<Masthead subtitle="Trade Analyzer" />);
    const home = screen.getByRole("link");
    expect(home.textContent).toContain("Cornerstone Fantasy Football League");
    expect(home.textContent).toContain("Trade Analyzer");
    expect(home.getAttribute("href")).toBe("/");
  });

  it("shows the week line children under the brand", () => {
    render(
      <Masthead subtitle="League Weekly">
        <p>Week 6</p>
      </Masthead>,
    );
    expect(screen.getByText("Week 6")).toBeTruthy();
    expect(screen.getByText("League Weekly")).toBeTruthy();
  });

  it("shows a custom title in place of the default brand", () => {
    render(<Masthead title="Custom Brand" subtitle="League Weekly" />);
    const home = screen.getByRole("link");
    expect(home.textContent).toContain("Custom Brand");
    expect(home.textContent).not.toContain("Cornerstone Fantasy Football League");
  });

  it("shows no week line when there are no children", () => {
    render(<Masthead subtitle="Trade Analyzer" />);
    expect(screen.queryByText("Week 6")).toBeNull();
  });

  it("shows no subtitle when none is given", () => {
    render(<Masthead />);
    expect(screen.getByRole("link").textContent).toBe("Cornerstone Fantasy Football League");
  });

  it("links the waiver page when a link is given", () => {
    render(<Masthead subtitle="League Weekly" waiverHref="/2026/week-06/waiver/" />);
    expect(screen.getByRole("link", { name: "Waiver wire" }).getAttribute("href")).toBe("/2026/week-06/waiver/");
  });

  it("shows no waiver link when none is given", () => {
    render(<Masthead subtitle="League Weekly" waiverHref={null} />);
    expect(screen.queryByRole("link", { name: "Waiver wire" })).toBeNull();
  });
});
