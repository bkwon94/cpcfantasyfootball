/**
 * Smoke test of the config module. It checks the defaults and the env overrides.
 * Later tests copy this setup.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("config", () => {
  it("uses the defaults when the env is empty", async () => {
    const { apiUrl, basePath } = await import("./config");
    expect(apiUrl).toBe("https://api.cpcfantasy.com");
    expect(basePath).toBe("");
  });

  it("reads the env when it is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/site");
    const { apiUrl, basePath } = await import("./config");
    expect(apiUrl).toBe("http://localhost:8080");
    expect(basePath).toBe("/site");
  });
});
