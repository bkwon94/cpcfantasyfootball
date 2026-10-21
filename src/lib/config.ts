/**
 * Build-time config. This is the only module that reads process.env.
 * Both values have a default, so a bare build works.
 */
export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.cpcfantasy.com";

// The Pages base path. Empty because the site lives at the domain root.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
