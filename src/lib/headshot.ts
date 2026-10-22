/**
 * The default headshot and the image error handler that swaps to it.
 * The player list and the analyzer result share them, so a missing CDN image looks the same in both.
 */
import type { SyntheticEvent } from "react";
import { basePath } from "@/lib/config";

export const HEADSHOT_FALLBACK = `${basePath}/images/headshot-default.svg`;

/* A headshot the CDN does not have swaps to the default once. The guard stops a loop if that file fails too. */
export function swapToDefault(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = HEADSHOT_FALLBACK;
}
