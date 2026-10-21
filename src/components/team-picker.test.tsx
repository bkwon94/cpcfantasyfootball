/**
 * Tests for the team picker avatar. A missing avatar and a failed avatar both show the default image.
 */
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { basePath } from "@/lib/config";
import type { Team } from "@/lib/api";
import { TeamPicker } from "./team-picker";

const DEFAULT_SRC = `${basePath}/images/avatar-default.svg`;

function team(avatar: string | null): Team {
  return { roster_id: 1, team: "Gridiron Ghosts", manager: "Ana", avatar, players: [] };
}

function renderPicker(avatar: string | null) {
  const { container } = render(
    <TeamPicker label="My team" teams={[team(avatar)]} value={null} disabledId={null} onChange={() => {}} />,
  );
  return container.querySelector("img") as HTMLImageElement;
}

afterEach(cleanup);

describe("TeamPicker avatar", () => {
  it("renders the default avatar when the team has none", () => {
    expect(renderPicker(null).getAttribute("src")).toBe(DEFAULT_SRC);
  });

  it("swaps to the default avatar when a real avatar fails to load", () => {
    const img = renderPicker("https://cdn.test/a.png");
    expect(img.getAttribute("src")).toBe("https://cdn.test/a.png");
    fireEvent.error(img);
    expect(img.getAttribute("src")).toBe(DEFAULT_SRC);
  });
});
