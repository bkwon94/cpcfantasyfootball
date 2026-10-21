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
    expect(home.textContent).toContain("CPC Fantasy");
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
    render(<Masthead title="Cornerstone" subtitle="League Weekly" />);
    const home = screen.getByRole("link");
    expect(home.textContent).toContain("Cornerstone");
    expect(home.textContent).not.toContain("CPC Fantasy");
  });

  it("shows no week line when there are no children", () => {
    render(<Masthead subtitle="Trade Analyzer" />);
    expect(screen.queryByText("Week 6")).toBeNull();
  });
});
