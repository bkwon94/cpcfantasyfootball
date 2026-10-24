/**
 * Next.js config for the static export that GitHub Pages serves.
 * Trailing slashes keep the URLs the same as the folder layout in `public/`.
 */
import type { NextConfig } from "next";
import { basePath } from "./src/lib/config";
import { waiverRouteOn } from "./src/lib/waiver-data";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  pageExtensions: ["tsx", "ts", "jsx", "js", ...(waiverRouteOn() ? ["waiver.tsx"] : [])],
};

export default nextConfig;
