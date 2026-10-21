/**
 * Root layout for the app. It sets the viewport meta and loads globals.css.
 * The static pages in public/ do not use this layout.
 */
import "./globals.css";
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
