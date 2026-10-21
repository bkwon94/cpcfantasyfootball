/**
 * Next.js config for the static export that GitHub Pages serves.
 * Trailing slashes keep the URLs the same as the old folder layout.
 */
import type { NextConfig } from "next";
import { basePath } from "./src/lib/config";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
