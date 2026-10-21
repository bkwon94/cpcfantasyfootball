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

  it("keeps only the last of two margin tokens", () => {
    expect(cn("mb-sp-3", "mb-sp-1")).toBe("mb-sp-1");
  });

  it("keeps only the last of two padding tokens", () => {
    expect(cn("p-sp-4", "p-sp-2")).toBe("p-sp-2");
  });
});
