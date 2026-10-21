/**
 * Root layout for the app. It sets the viewport meta and adds no styling,
 * so the static pages in public/ are served unchanged.
 */
import type { Viewport } from "next";
import type { ReactNode } from "react";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
