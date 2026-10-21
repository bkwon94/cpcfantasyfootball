/**
 * Tests for the cn helper. They check that the text scale names count as sizes, not colors.
 */
import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("keeps a size token next to a color", () => {
    expect(cn("text-label", "text-red")).toBe("text-label text-red");
  });

  it("keeps only the last of two size tokens", () => {
    expect(cn("text-label", "text-meta")).toBe("text-meta");
  });
});
